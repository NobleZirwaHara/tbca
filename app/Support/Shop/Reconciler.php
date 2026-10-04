<?php

namespace App\Support\Shop;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shop\Entitlement;
use App\Models\Shop\LedgerPosting;
use App\Models\Shop\Product;
use App\Support\Platform\Money;
use App\Support\Platform\Reference;

/**
 * Order-to-entitlement spine (blueprint Part 9). A paid order is posted to the
 * four ledgers (T TBCA consideration, X pass-through, S tax, C credit) with an
 * idempotency key, and only then may entitlements be issued under
 * VERIFIED_PAYMENT authority. Re-running is safe: postings and entitlements are
 * never duplicated.
 */
class Reconciler
{
    public const LEDGERS = [
        'T' => ['name' => 'QBO - Client Ledger', 'body' => 'Client revenue recognition'],
        'S' => ['name' => 'Trust Ledger', 'body' => 'Compliance and risk controls (tax/statutory)'],
        'X' => ['name' => 'Client Ledger', 'body' => 'Engagement and SLA tracking (pass-through)'],
        'C' => ['name' => 'Practice Ledger', 'body' => 'Resource cost, credits and margin'],
    ];

    public static function qboReference(Order $order): string
    {
        return 'INV-'.(10000 + $order->id);
    }

    /** @return array{T: int, X: int, S: int, C: int} */
    public static function composition(Order $order): array
    {
        $method = $order->payments()->where('status', 'succeeded')->latest('id')->value('method') ?? 'card';
        $totals = Money::totals($order->subtotal_zar, $method);
        $credit = $order->status === 'refunded' ? -1 * $order->total_zar : 0;

        return [
            'T' => $totals['subtotal'] + $totals['platform'],
            'X' => $totals['bank'],
            'S' => $totals['vat'],
            'C' => $credit,
        ];
    }

    /** Posts ledgers and issues entitlements for one order. Returns the match status. */
    public static function reconcile(Order $order): string
    {
        if (in_array($order->status, ['paid', 'refunded'], true)) {
            foreach (self::composition($order) as $ledger => $amount) {
                if ($amount === 0 && $ledger !== 'T') {
                    continue;
                }
                $key = hash('sha256', implode('|', [$order->id, $ledger, $amount, $order->currency, 'TAX-ZA-15']));
                LedgerPosting::query()->firstOrCreate(['idempotency_key' => $key], [
                    'order_id' => $order->id,
                    'ledger' => $ledger,
                    'amount_zar' => $amount,
                    'qbo_reference' => $ledger === 'C' ? 'CR-'.(10000 + $order->id) : self::qboReference($order),
                    'status' => 'posted',
                ]);
            }
        }

        if ($order->status === 'paid') {
            $order->loadMissing('items');
            foreach ($order->items as $item) {
                self::issueFor($order, $item);
            }
        }

        if (in_array($order->status, ['refunded', 'cancelled'], true)) {
            Entitlement::query()->where('order_id', $order->id)->where('status', 'active')->update(['status' => 'revoked']);
        }

        return self::matchStatus($order);
    }

    public static function issueFor(Order $order, OrderItem $item): Entitlement
    {
        $existing = Entitlement::query()->where('order_item_id', $item->id)->first();
        if ($existing) {
            return $existing;
        }

        $product = Product::query()->where('code', $item->item_code)->first();
        $type = self::typeFor($item->item_type, $product);
        $ends = match (true) {
            str_contains($type, 'Subscription') => now()->addMonth(),
            str_contains($type, 'Retainer') => now()->addMonths((int) ($item->meta['term_months'] ?? 3)),
            str_contains($type, 'Digital') => now()->addYear(),
            default => null,
        };

        return Entitlement::create([
            'reference' => Reference::make('ENT'),
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'order_item_id' => $item->id,
            'product_id' => $product?->id,
            'name' => $item->name,
            'item_code' => $item->item_code,
            'type' => $type,
            'authority' => 'VERIFIED_PAYMENT',
            'status' => 'active',
            'email' => $order->billing['email'] ?? null,
            'starts_at' => now(),
            'ends_at' => $ends,
            'meta' => array_filter(['variant' => $item->variant, 'qbo' => self::qboReference($order)]),
        ]);
    }

    public static function typeFor(string $itemType, ?Product $product): string
    {
        if ($product) {
            return "{$product->vehicle} ({$product->vehicle_code})";
        }

        return match ($itemType) {
            'digital-product', 'report' => 'Digital Product (VEH-03)',
            'subscription' => 'Subscription (VEH-04)',
            'retainer' => 'Retainer (VEH-05)',
            'quote' => 'Advisory (VEH-12)',
            default => 'Sprint (VEH-02)',
        };
    }

    /** matched | pending | mismatch | refunded | unpaid */
    public static function matchStatus(Order $order): string
    {
        $items = $order->items()->count();
        $active = Entitlement::query()->where('order_id', $order->id)->where('status', 'active')->count();
        $posted = LedgerPosting::query()->where('order_id', $order->id)->exists();

        return match (true) {
            $order->status === 'paid' && $posted && $active >= $items => 'matched',
            $order->status === 'paid' => 'pending',
            $order->status === 'refunded' && $active === 0 => 'matched',
            $active > 0 => 'mismatch',
            default => 'unpaid',
        };
    }

    /** Daily reconciliation run over every paid or refunded order. */
    public static function run(): array
    {
        $counts = ['matched' => 0, 'pending' => 0, 'mismatch' => 0];
        Order::query()->whereIn('status', ['paid', 'refunded'])->each(function (Order $order) use (&$counts) {
            $status = self::reconcile($order);
            $counts[$status] = ($counts[$status] ?? 0) + 1;
        });
        Setting::put('reconciliation_last_run', now()->toIso8601String());

        return $counts;
    }
}
