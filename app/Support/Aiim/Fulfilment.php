<?php

namespace App\Support\Aiim;

use App\Models\Aiim\Brief;
use App\Models\Aiim\CaseFile;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\Entitlement;
use App\Models\Aiim\LedgerEntry;
use App\Models\Aiim\Project;
use App\Models\Aiim\Quote;
use App\Models\Aiim\ReportRequest;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Turns paid orders into AIIM entitlements and stage changes (gate G4: unlock only
 * on verified payment or confirmed wallet debit — GAP-016). Every method is
 * idempotent, so it is safe to run on return from checkout and again whenever the
 * client opens their workspace.
 */
class Fulfilment
{
    public const ITEM_PREFIX = 'aiim-';

    /** Settle every paid AIIM order belonging to the user that has not been fulfilled yet. */
    public static function syncUser(User $user): void
    {
        Order::query()
            ->where('user_id', $user->id)
            ->where('status', 'paid')
            ->where(fn ($q) => $q->where('section', 'aiim')->orWhereHas('items', fn ($i) => $i->where('item_type', 'like', self::ITEM_PREFIX.'%')))
            ->with('items')
            ->get()
            ->each(fn (Order $o) => self::settle($o));
    }

    public static function settle(Order $order): void
    {
        if (! $order->isPaid() || ! $order->user_id) {
            return;
        }

        $meta = $order->meta['aiim'] ?? [];
        $kind = $meta['kind'] ?? null;

        DB::transaction(function () use ($order, $meta, $kind) {
            match ($kind) {
                'topup' => WalletService::creditOrder($order, (float) $meta['credits'], 'Payment: '.($meta['label'] ?? 'Wallet top-up')),
                'manifest' => self::manifest($order, $meta),
                'unlock' => self::unlock($order, $meta, 'Card / EFT'),
                'report' => self::report($order, $meta),
                'deposit' => self::deposit($order, $meta),
                'balance' => self::balance($order, $meta),
                'scope-change' => self::scopeChange($order, $meta),
                default => null,
            };

            // Premium briefs can arrive through the AIIM store or through the shared basket.
            self::briefs($order);
        });
    }

    private static function manifest(Order $order, array $meta): void
    {
        $quote = Quote::query()->where('reference', $meta['quote'] ?? '')->first();
        if (! $quote) {
            return;
        }
        $quote->update(['status' => 'paid', 'order_id' => $order->id]);
        foreach ($quote->items as $item) {
            Entitlement::firstOrCreate(
                ['order_id' => $order->id, 'order_line_key' => "{$item['type']}:{$item['key']}"],
                [
                    'reference' => Refs::make('ENT'),
                    'user_id' => $order->user_id,
                    'object_type' => 'premium',
                    'object_key' => "{$item['type']}:{$item['key']}",
                    'title' => $item['label'],
                    'product_type' => 'Premium Intelligence Access',
                    'access_type' => 'premium-access',
                    'amount_zar' => round($quote->total_zar / max(1, count($quote->items)), 2),
                    'payment_method' => self::method($order),
                    'expires_at' => now()->addYear(),
                    'meta' => ['quote' => $quote->reference],
                ],
            );
        }
    }

    /** Pay-per-view unlock of a project's premium object (card path; the wallet path calls grantUnlock directly). */
    private static function unlock(Order $order, array $meta, string $method): void
    {
        $project = Project::query()->where('code', $meta['object'] ?? '')->first();
        if ($project) {
            self::grantUnlock($order->user, $project, (int) $meta['views'], (float) $order->total_zar, self::method($order), $order->id, $meta);
        }
    }

    public static function grantUnlock(User $user, Project $project, int $views, float $amount, string $method, ?int $orderId = null, array $meta = []): Entitlement
    {
        $premium = $project->premium ?? [];

        return Entitlement::firstOrCreate(
            ['order_id' => $orderId, 'order_line_key' => $orderId ? 'unlock' : 'wallet:'.($meta['wallet_tx'] ?? uniqid())],
            [
                'reference' => Refs::make('ENT'),
                'user_id' => $user->id,
                'object_type' => 'project',
                'object_key' => $project->code,
                'title' => $project->name,
                'product_type' => $premium['product_type'] ?? 'Premium Financial Model',
                'access_type' => 'pay-per-view',
                'views_included' => $views,
                'extra_view_zar' => Pricing::amount('AIIM-UNL-XV', 285),
                'amount_zar' => $amount,
                'payment_method' => $method,
                'expires_at' => now()->addDays((int) ($premium['duration_days'] ?? 7)),
                'meta' => ['item' => $premium['title'] ?? 'Detailed financial model', 'purpose' => $meta['purpose'] ?? null, 'authorised_by' => $meta['authorised_by'] ?? null],
            ],
        );
    }

    private static function briefs(Order $order): void
    {
        foreach ($order->items as $line) {
            if ($line->item_type !== self::ITEM_PREFIX.'brief') {
                continue;
            }
            $brief = Brief::query()->where('sku', $line->item_code)->first();
            if (! $brief) {
                continue;
            }
            Entitlement::firstOrCreate(
                ['order_id' => $order->id, 'order_line_key' => 'brief:'.$brief->sku],
                [
                    'reference' => Refs::make('ENT'),
                    'user_id' => $order->user_id,
                    'object_type' => 'brief',
                    'object_key' => $brief->sku,
                    'title' => $brief->title,
                    'product_type' => 'Premium Brief',
                    'access_type' => 'permanent',
                    'amount_zar' => (float) $line->line_zar,
                    'payment_method' => self::method($order),
                    'meta' => ['licence' => $line->variant ?? 'Standard Access'],
                ],
            );
        }
    }

    private static function report(Order $order, array $meta): void
    {
        $report = ReportRequest::query()->where('reference', $meta['report'] ?? '')->first();
        if ($report && in_array($report->status, ['quoted', 'accepted'], true)) {
            $report->update(['status' => 'in_production', 'order_id' => $order->id]);
        }
    }

    private static function deposit(Order $order, array $meta): void
    {
        $e = Engagement::query()->where('reference', $meta['engagement'] ?? '')->first();
        if (! $e || $e->status !== 'signed') {
            return;
        }

        $start = now();
        EngagementFlow::transition($e, 'in_progress', 'system', "Deposit received ({$order->reference}).", [
            'deposit_order_id' => $order->id,
            'deposit_paid_at' => $start,
            'mandate_reference' => $e->mandate_reference ?? Refs::dated('MND'),
            'stage' => 'Mandate Setup',
            'progress' => 5,
            'original_end_date' => $start->copy()->addWeekdays(20)->toDateString(),
            'end_date' => $start->copy()->addWeekdays(20)->toDateString(),
            'workplan' => self::workplan($start),
        ]);

        self::ledgerPayment($e, $order, 'Deposit Payment ('.($e->quote['deposit_percent'] ?? 50).'%)', 'Deposit', 'AIIM-PAY-S1-001');
        foreach ($e->quote['lines'] ?? [] as $line) {
            if (($line['amount'] ?? 0) <= 0) {
                continue;
            }
            LedgerEntry::create([
                'reference' => 'INV-'.now()->format('Ymd').'-'.strtoupper(substr(md5($e->reference.$line['code']), 0, 4)),
                'engagement_id' => $e->id, 'user_id' => $e->user_id, 'type' => 'fee',
                'description' => $line['label'], 'fee_code' => $line['code'],
                'category' => str_contains($line['label'], 'Expert') ? 'Expert Fee' : (str_contains($line['label'], 'Platform') ? 'Platform Fee' : (str_contains($line['label'], 'External Supplier') ? 'External Cost' : 'Administration')),
                'amount_zar' => $line['amount'], 'vat_zar' => Pricing::vat($line['amount']), 'status' => 'Billed', 'posted_at' => now(),
            ]);
        }
    }

    private static function balance(Order $order, array $meta): void
    {
        $e = Engagement::query()->where('reference', $meta['engagement'] ?? '')->first();
        if (! $e || $e->status !== 'accepted') {
            return;
        }
        EngagementFlow::transition($e, 'closed', 'system', "Final balance received ({$order->reference}).", [
            'balance_order_id' => $order->id,
            'balance_paid_at' => now(),
            'progress' => 100,
        ]);
        self::ledgerPayment($e, $order, 'Final Balance Payment', 'Balance', 'AIIM-PAY-S14-001');
    }

    private static function scopeChange(Order $order, array $meta): void
    {
        $case = CaseFile::query()->where('reference', $meta['case'] ?? '')->first();
        if ($case && $case->status === 'approved_awaiting_payment') {
            $case->update(['status' => 'approved', 'decided_at' => now()]);
            if ($case->engagement) {
                self::ledgerPayment($case->engagement, $order, 'Scope Change Payment', 'Adjustment', 'AIIM-ADJ-S8-600');
            }
        }
    }

    private static function ledgerPayment(Engagement $e, Order $order, string $description, string $category, string $code): void
    {
        if (LedgerEntry::query()->where('order_id', $order->id)->where('type', 'payment')->exists()) {
            return;
        }
        LedgerEntry::create([
            'reference' => $order->reference,
            'engagement_id' => $e->id,
            'user_id' => $e->user_id,
            'type' => 'payment',
            'description' => $description,
            'fee_code' => $code,
            'category' => $category,
            'amount_zar' => $order->subtotal_zar,
            'vat_zar' => $order->vat_zar,
            'status' => 'Paid',
            'document' => $order->reference,
            'order_id' => $order->id,
            'posted_at' => $order->paid_at ?? now(),
        ]);
    }

    public static function workplan(\DateTimeInterface $start): array
    {
        $s = \Illuminate\Support\Carbon::instance($start);

        return [
            ['key' => 'setup', 'label' => 'Mandate Setup', 'status' => 'completed', 'date' => $s->format('j M Y')],
            ['key' => 'research', 'label' => 'Research & Analysis', 'status' => 'in_progress', 'date' => 'Day 1 of 20'],
            ['key' => 'draft', 'label' => 'Draft Report', 'status' => 'pending', 'date' => 'From Day 16'],
            ['key' => 'review', 'label' => 'Client Review', 'status' => 'pending', 'date' => 'From Day 18'],
            ['key' => 'final', 'label' => 'Final Report', 'status' => 'pending', 'date' => 'Due '.$s->copy()->addWeekdays(20)->format('j M Y')],
        ];
    }

    private static function method(Order $order): string
    {
        $p = $order->payments()->where('status', 'succeeded')->latest('id')->first();
        if (! $p) {
            return 'Card';
        }

        return match ($p->method) {
            'card' => 'Card ending '.($p->meta['last4'] ?? '••••'),
            'eft' => 'EFT',
            'wallet' => 'Wallet',
            default => ucfirst($p->method),
        };
    }
}
