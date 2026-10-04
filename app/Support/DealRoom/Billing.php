<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Charge;
use App\Models\DealRoom\CommercialRequest;
use App\Models\DealRoom\Room;
use App\Models\Order;
use App\Models\User;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;

/**
 * Room invoices. Every VDR charge is paid through the shared checkout
 * (section "vdr"); on return (or on any room page load) sync() reads the
 * order status and applies the commercial effect: deposit clears Stage C,
 * change requests raise allowances, failed payments pause the transaction.
 */
class Billing
{
    /** Charge kinds whose failure pauses the transaction (prepayment gates). */
    public const PAUSING = ['deposit', 'stage_fee', 'closing', 'third_party'];

    public static function issue(Room $room, string $kind, string $description, array $lines, ?string $stage = null, array $meta = [], ?int $dueDays = 0): Charge
    {
        $lines = array_map(fn ($l) => [...$l, 'vat' => $l['vat'] ?? Pricing::vat($l['net'])], $lines);
        $net = array_sum(array_column($lines, 'net'));
        $vat = array_sum(array_column($lines, 'vat'));
        $suffix = ['deposit' => 'D', 'stage_fee' => 'S', 'overage' => 'O', 'plan_upgrade' => 'P', 'change' => 'CR', 'third_party' => 'TP', 'monthly' => 'M', 'closing' => 'CI', 'subscription' => 'SUB', 'archive_renewal' => 'AR'][$kind] ?? 'X';
        $count = $room->charges()->where('kind', $kind)->count() + 1;

        $charge = $room->charges()->create([
            'reference' => sprintf('INV-%s-%06d-%s%d', now()->format('Y'), $room->id + 127, $suffix, $count),
            'kind' => $kind,
            'stage_code' => $stage,
            'description' => $description,
            'lines' => $lines,
            'net_zar' => $net,
            'vat_zar' => $vat,
            'total_zar' => $net + $vat,
            'status' => 'issued',
            'due_date' => $dueDays === null ? null : now()->addDays($dueDays),
            'meta' => $meta ?: null,
        ]);
        Audit::log($room, 'invoice.issued', "Invoice {$charge->reference} issued: {$description}");

        return $charge;
    }

    /** Create the checkout order for one or more charges and send the payer to the shared payment page. */
    public static function pay(Room $room, array $charges, User $user, string $returnTo): RedirectResponse
    {
        $lines = [];
        foreach ($charges as $charge) {
            abort_if($charge->isPaid(), 409, 'This invoice has already been paid.');
            foreach ($charge->lines as $i => $l) {
                if ($l['net'] <= 0) {
                    continue;
                }
                $lines[] = [
                    'item_type' => 'vdr_'.$charge->kind,
                    'item_code' => $charge->reference.'-'.($i + 1),
                    'name' => $l['item'].' ('.$charge->reference.')',
                    'unit_zar' => (int) $l['net'],
                    'meta' => ['room' => $room->slug, 'charge' => $charge->reference],
                ];
            }
        }
        abort_if($lines === [], 422, 'Nothing is payable on this invoice.');

        $ids = array_map(fn ($c) => $c->id, $charges);
        $order = Checkout::createOrder($lines, $user, 'vdr', [
            'title' => count($charges) === 1 ? $charges[0]->description : 'Deal room statement balance',
            'return_url' => route('deal-room.billing.return', ['room' => $room->slug, 'to' => $returnTo]),
            'vdr_room' => $room->slug,
            'vdr_charges' => $ids,
        ]);
        foreach ($charges as $charge) {
            $charge->update(['order_id' => $order->id, 'status' => 'awaiting_payment']);
        }
        Audit::log($room, 'payment.initiated', 'Payment initiated for '.implode(', ', array_map(fn ($c) => $c->reference, $charges)).' via order '.$order->reference);

        return redirect()->route('checkout.show', $order);
    }

    /** Reconcile every awaiting charge in the room against its checkout order. */
    public static function sync(Room $room): void
    {
        $awaiting = $room->charges()->whereIn('status', ['awaiting_payment', 'failed'])->whereNotNull('order_id')->with('order')->get();
        foreach ($awaiting as $charge) {
            $order = $charge->order;
            if (! $order) {
                continue;
            }
            if ($order->isPaid()) {
                self::markPaid($charge, $order);
            } elseif ($order->status === 'failed' && $charge->status !== 'failed') {
                self::markFailed($charge, $order);
            }
        }
    }

    public static function markFailed(Charge $charge, Order $order): void
    {
        $payment = $order->payments()->latest('id')->first();
        $charge->update([
            'status' => 'failed',
            'failed_attempts' => $order->payments()->where('status', 'failed')->count(),
            'failure_reason' => $payment?->failure_reason ?? 'Payment declined',
        ]);
        $room = $charge->room;
        Audit::log($room, 'payment.failed', "Payment for {$charge->reference} failed: {$charge->failure_reason}");

        if (in_array($charge->kind, self::PAUSING, true) && ! $room->isPaused()) {
            $room->update(['status' => 'paused', 'paused_at' => now(), 'paused_reason' => 'Payment failure / '.($charge->failure_reason ?? 'declined')]);
            $room->stateSet('pause.charge', $charge->id);
            $room->save();
            Audit::log($room, 'deal.paused', 'Transaction automatically paused after a failed prepayment', 'System (Automated Monitor)');
        }
    }

    public static function markPaid(Charge $charge, ?Order $order = null): void
    {
        if ($charge->isPaid()) {
            return;
        }
        $charge->update(['status' => 'paid', 'paid_at' => $order?->paid_at ?? now()]);
        $room = $charge->room()->first();
        Audit::log($room, 'payment.received', "Payment received for {$charge->reference} (R".number_format($charge->total_zar).')');

        match ($charge->kind) {
            'deposit' => self::afterDeposit($room),
            'change' => self::applyChange($room, $charge),
            'plan_upgrade' => self::applyAllowances($room, $charge->meta['adds'] ?? [], $charge->meta['plan'] ?? null),
            'third_party', 'overage' => CommercialRequest::where('charge_id', $charge->id)->update(['status' => 'resolved', 'decided_at' => now()]),
            'monthly' => Charge::whereIn('id', $charge->meta['covers'] ?? [])->where('status', '!=', 'paid')->update(['status' => 'paid', 'paid_at' => now()]),
            'closing' => self::stateFlag($room, 'closing.paid_at'),
            'subscription' => self::startSubscription($room),
            'archive_renewal' => self::applyRenewal($room, $charge),
            default => null,
        };

        if ($charge->kind === 'stage_fee' && $charge->stage_code) {
            Workflow::attempt($room->fresh(), $charge->stage_code);
        }
    }

    protected static function afterDeposit(Room $room): void
    {
        $c = $room->commercial ?? [];
        $c['deposit_paid_at'] = now()->toIso8601String();
        $room->update(['commercial' => $c]);
        if (Workflow::attempt($room->fresh(), 'C')) {
            Audit::log($room, 'room.activated', 'Stage 0 entitlement active: deal room configuration may start');
        }
    }

    protected static function applyChange(Room $room, Charge $charge): void
    {
        $request = CommercialRequest::where('charge_id', $charge->id)->first();
        if ($request) {
            self::applyAllowances($room, $request->payload['increments'] ?? []);
            $request->update(['status' => 'resolved', 'decided_at' => now()]);
            Audit::log($room, 'change.approved', "Change request {$request->reference} entitlement applied");
        }
    }

    public static function applyAllowances(Room $room, array $adds, ?string $planName = null): void
    {
        $plan = $room->plan ?? [];
        foreach ($adds as $metric => $n) {
            $plan['allowances'][$metric] = (Usage::allowances($room)[$metric] ?? 0) + (int) $n;
        }
        if ($planName) {
            $plan['name'] = $planName;
        }
        $room->update(['plan' => $plan]);
    }

    protected static function stateFlag(Room $room, string $key): void
    {
        $room->stateSet($key, now()->toIso8601String());
        $room->save();
    }

    protected static function startSubscription(Room $room): void
    {
        $room->stateSet('subscription', ['status' => 'active', 'plan' => 'Enterprise', 'start' => now()->toDateString(), 'renews' => now()->addYear()->subDay()->toDateString(), 'auto_renew' => true]);
        $room->save();
    }

    protected static function applyRenewal(Room $room, Charge $charge): void
    {
        $months = (int) ($charge->meta['months'] ?? 12);
        $from = $room->stateGet('archive.access_until') ? now()->parse($room->stateGet('archive.access_until')) : now();
        $room->stateSet('archive.access_until', $from->copy()->addMonths($months)->toDateString());
        $room->stateSet('archive.renewal', null);
        $room->save();
        Audit::log($room, 'renewal.due', "Archive access renewed for {$months} months");
    }

    public static function present(Charge $c): array
    {
        return [
            'id' => $c->id,
            'reference' => $c->reference,
            'kind' => $c->kind,
            'stage' => $c->stage_code,
            'description' => $c->description,
            'lines' => $c->lines,
            'net' => (int) $c->net_zar,
            'vat' => (int) $c->vat_zar,
            'total' => (int) $c->total_zar,
            'status' => $c->status,
            'order' => $c->order?->reference,
            'failedAttempts' => $c->failed_attempts,
            'failureReason' => $c->failure_reason,
            'dueDate' => $c->due_date?->format('d M Y'),
            'issuedAt' => $c->created_at->format('d M Y'),
            'paidAt' => $c->paid_at?->format('d M Y H:i'),
            'refunded' => (int) $c->refunded_zar,
            'meta' => $c->meta,
        ];
    }
}
