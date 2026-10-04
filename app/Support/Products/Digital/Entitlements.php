<?php

namespace App\Support\Products\Digital;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Products\Digital\DpAmendment;
use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpProduct;
use App\Models\Products\Digital\DpVersion;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Entitlement lifecycle (GATE-DP-15 / GATE-DP-16).
 *
 * Payment happens in the shared checkout, so activation is PULL-style: when a
 * return page or library page loads we look at the linked orders and, if paid,
 * move pending entitlements to ACTIVE and apply pending rights amendments.
 * Invoice / awaiting-payment orders never create an active right.
 */
class Entitlements
{
    public const CREDIT_RATE = 0.10;      // conversion credit, [TBCA TO POPULATE] in the blueprint
    public const ACCESS_MONTHS = 12;

    public static function nextReference(): string
    {
        $year = now()->format('Y');
        $n = (int) DpEntitlement::where('reference', 'like', "ENT-{$year}-%")->count() + 541;

        do {
            $ref = sprintf('ENT-%s-%06d', $year, $n++);
        } while (DpEntitlement::where('reference', $ref)->exists());

        return $ref;
    }

    public static function caseReference(): string
    {
        $year = now()->format('Y');
        $n = (int) \App\Models\Products\Digital\DpCase::count() + 78;

        return sprintf('REF-%s-%05d', $year, $n);
    }

    /** Create the (not yet active) entitlement for an order line. */
    public static function createPending(OrderItem $item, Order $order, ?User $user): ?DpEntitlement
    {
        $meta = $item->meta ?? [];
        $product = DpProduct::where('slug', $meta['product'] ?? null)->orWhere('sku', $meta['sku'] ?? '__none__')->first();

        if (! $product) {
            return null;
        }

        $version = isset($meta['version_id']) ? DpVersion::find($meta['version_id']) : null;
        $version ??= $product->versions()->where('status', 'current')->first();

        return DpEntitlement::firstOrCreate(['order_item_id' => $item->id], [
            'reference' => self::nextReference(),
            'user_id' => $user?->id,
            'holder_name' => $user?->name ?? ($order->billing['name'] ?? null),
            'holder_email' => $user?->email ?? ($order->billing['email'] ?? null),
            'authorised_entity' => $meta['entity'] ?? $user?->company,
            'product_id' => $product->id,
            'version_id' => $version?->id,
            'order_id' => $order->id,
            'order_reference' => $order->reference,
            'licence_class' => $meta['licence'] ?? 'L2',
            'language' => $meta['language'] ?? 'EN',
            'format' => $meta['format'] ?? $product->primary_format,
            'jurisdiction' => $product->jurisdiction,
            'status' => 'pending_payment',
            'terms_version' => $meta['terms_version'] ?? 'v1.1',
            'disclosure_version' => $meta['disclosure_version'] ?? 'RDP-v2.0',
            'price_zar' => $item->unit_zar,
            'manifest' => $meta,
            'purchased_at' => now(),
        ]);
    }

    /** Pull-activate everything linked to an order. Idempotent. */
    public static function syncOrder(Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items->where('item_type', 'digital-product') as $item) {
            self::createPending($item, $order, $order->user);
        }

        DpEntitlement::where('order_id', $order->id)->where('status', 'pending_payment')->get()
            ->each(fn (DpEntitlement $e) => self::settle($e, $order));

        DpAmendment::where('order_id', $order->id)->where('status', 'pending_payment')->get()
            ->each(fn (DpAmendment $a) => self::settleAmendment($a, $order));
    }

    /** Sync every digital-product order of a holder (covers basket checkouts too). */
    public static function syncUser(User $user): void
    {
        Order::query()
            ->where('user_id', $user->id)
            ->where(fn ($q) => $q->where('section', 'digital-products')->orWhereHas('items', fn ($i) => $i->where('item_type', 'digital-product')))
            ->whereIn('status', ['paid', 'failed', 'awaiting_payment'])
            ->with('items', 'user')
            ->get()
            ->each(fn (Order $o) => self::syncOrder($o));
    }

    private static function settle(DpEntitlement $e, Order $order): void
    {
        if ($order->status === 'failed') {
            $e->update(['status' => 'failed']);

            return;
        }

        if (! $order->isPaid()) {
            return; // PAYMENT UNKNOWN / pending cannot create entitlement
        }

        DB::transaction(function () use ($e, $order) {
            $paidAt = $order->paid_at ?? now();
            $months = $e->product->update_months ?: 12;
            $e->update([
                'status' => 'active',
                'activated_at' => now(),
                'purchased_at' => $paidAt,
                'access_expires_at' => $paidAt->copy()->addMonths(self::ACCESS_MONTHS),
                'update_until' => $e->product->update_class === 'U0' ? null : $paidAt->copy()->addMonths($months),
                'credit_zar' => (int) round($e->price_zar * self::CREDIT_RATE),
                'notification_state' => 'delivered',
                'correction_state' => 'Delivered',
            ]);
            Audit::log('DP_PAYMENT_VERIFIED', $e, ['order' => $order->reference]);
            Audit::log('DP_ENTITLEMENT_CREATED', $e, ['licence' => $e->licence_class, 'version' => $e->version?->version]);
        });
    }

    private static function settleAmendment(DpAmendment $a, Order $order): void
    {
        if ($order->status === 'failed') {
            $a->update(['status' => 'failed']);

            return;
        }

        if (! $order->isPaid()) {
            return;
        }

        $e = $a->entitlement;

        DB::transaction(function () use ($a, $e) {
            match ($a->type) {
                'licence_upgrade' => tap($e)->update([
                    'licence_class' => $a->to_value,
                    'price_zar' => $e->price_zar + $a->amount_zar,
                ]),
                'maintained_access' => tap($e)->update([
                    'maintenance_status' => 'active',
                    'maintenance_plan' => $a->to_value,
                    'maintenance_until' => self::extend($e->maintenance_until, $a->to_value),
                    'update_until' => self::extend($e->maintenance_until, $a->to_value),
                    'auto_renew' => (bool) ($a->meta['auto_renew'] ?? false),
                ]),
                'conversion' => tap($e)->update([
                    'credit_applied_zar' => $e->credit_applied_zar + (int) ($a->meta['credit'] ?? 0),
                ]),
                default => null,
            };
            $a->update(['status' => 'applied']);
            Audit::log(match ($a->type) {
                'licence_upgrade' => 'DP_LICENCE_CHANGED',
                'maintained_access' => 'DP_SUBSCRIPTION_ACTIVATED',
                default => 'DP_CONVERSION_STARTED',
            }, $e, ['from' => $a->from_value, 'to' => $a->to_value]);
        });
    }

    private static function extend(?CarbonInterface $current, string $plan): CarbonInterface
    {
        $base = $current && $current->isFuture() ? $current->copy() : now();

        return $plan === 'monthly' ? $base->addMonth() : $base->addYear();
    }

    /**
     * Versions this entitlement may download: the acquired version, plus later
     * versions released inside the update window (U2) or while Maintained
     * Access is active (U3). WITHDRAWN_UNSAFE versions are never downloadable.
     *
     * @return \Illuminate\Support\Collection<int, DpVersion>
     */
    public static function downloadableVersions(DpEntitlement $e)
    {
        $acquired = $e->version;
        $until = collect([$e->update_until, $e->maintenance_status === 'active' ? $e->maintenance_until : null])->filter()->max();

        return $e->product->versions
            ->filter(fn (DpVersion $v) => in_array($v->status, ['current', 'superseded'], true))
            ->filter(fn (DpVersion $v) => $acquired && ($v->id === $acquired->id
                || ($until && $v->released_at && $v->released_at->gte($acquired->released_at ?? $v->released_at) && $v->released_at->lte($until))))
            ->values();
    }

    public static function updateIncluded(DpEntitlement $e, DpVersion $v): bool
    {
        return self::downloadableVersions($e)->contains('id', $v->id);
    }

    /** Null when downloading is allowed, otherwise the blocking reason. */
    public static function blockReason(DpEntitlement $e, ?DpVersion $version = null): ?string
    {
        $version ??= $e->version;

        return match (true) {
            $e->status === 'pending_payment' => 'Payment has not been verified yet. No entitlement exists until payment is confirmed.',
            $e->status === 'suspended' => 'Access is suspended while a refund request is assessed.',
            in_array($e->status, ['refunded', 'revoked', 'failed'], true) => 'This entitlement is no longer active.',
            $e->status === 'legacy' && $version?->id !== $e->version_id => 'Legacy entitlements are read-only for the acquired version.',
            $e->order && ! $e->order->isPaid() => 'Payment has not been verified.',
            $e->access_expires_at && $e->access_expires_at->isPast() => 'Secure download access expired on '.$e->access_expires_at->format('d M Y').'.',
            ! $version => 'No controlled version is attached to this entitlement.',
            $version->status === 'withdrawn_unsafe' => 'This version has been withdrawn as unsafe. Download the replacement version instead.',
            ! self::downloadableVersions($e)->contains('id', $version->id) => 'This version is not included in your entitlement. Upgrade or activate Maintained Access.',
            default => null,
        };
    }
}
