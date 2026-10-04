<?php

namespace App\Support\Platform;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Creates orders and settles payments for every section.
 *
 * Sections create an order with createOrder() and redirect to
 * route('checkout.show', $order). Once payment succeeds the client is sent to
 * $order->meta['return_url'] if set, otherwise to the shared confirmation page.
 * Sections that need to react to a paid order (unlock entitlements, open a
 * case) can read orders with status "paid" filtered by section.
 */
class Checkout
{
    /**
     * @param  list<array{item_type: string, item_code: string, name: string, unit_zar: int, variant?: ?string, quantity?: int, meta?: array}>  $lines
     * @param  array<string, mixed>  $meta  e.g. ['return_url' => '/aiim/unlock/...', 'title' => 'Deposit payment']
     */
    public static function createOrder(array $lines, ?User $user, string $section = 'shop', array $meta = []): Order
    {
        return DB::transaction(function () use ($lines, $user, $section, $meta) {
            $subtotal = collect($lines)->sum(fn ($l) => $l['unit_zar'] * ($l['quantity'] ?? 1));
            $totals = Money::totals($subtotal);

            $order = Order::create([
                'reference' => Reference::make('ORD'),
                'user_id' => $user?->id,
                'section' => $section,
                'status' => 'awaiting_payment',
                'subtotal_zar' => $totals['subtotal'],
                'vat_zar' => $totals['vat'],
                'fees_zar' => $totals['fees'],
                'total_zar' => $totals['total'],
                'billing' => $user ? [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company' => $user->company,
                ] : null,
                'meta' => $meta,
            ]);

            foreach ($lines as $line) {
                $qty = $line['quantity'] ?? 1;
                $order->items()->create([
                    'item_type' => $line['item_type'],
                    'item_code' => $line['item_code'],
                    'name' => $line['name'],
                    'variant' => $line['variant'] ?? null,
                    'quantity' => $qty,
                    'unit_zar' => $line['unit_zar'],
                    'line_zar' => $line['unit_zar'] * $qty,
                    'meta' => $line['meta'] ?? null,
                ]);
            }

            return $order;
        });
    }

    /**
     * Re-price fees for the chosen method, then attempt payment.
     *
     * @param  array<string, mixed>  $details  card_number etc. Never persisted beyond the last four digits.
     */
    public static function pay(Order $order, string $method, array $details, array $billing = []): Payment
    {
        $totals = Money::totals($order->subtotal_zar, $method);
        $order->update([
            'fees_zar' => $totals['fees'],
            'total_zar' => $totals['total'],
            'billing' => array_filter([...($order->billing ?? []), ...$billing]) ?: $order->billing,
        ]);

        $result = PaymentGateway::charge($method, $order->total_zar, $details);

        $payment = $order->payments()->create([
            'reference' => Reference::make('PAY'),
            'method' => $method,
            'status' => $result['status'],
            'amount_zar' => $order->total_zar,
            'failure_reason' => $result['reason'] ?? null,
            'meta' => $result['meta'] ?? null,
        ]);

        $order->update(match ($result['status']) {
            'succeeded' => ['status' => 'paid', 'paid_at' => now()],
            'pending' => ['status' => 'awaiting_payment'],
            default => ['status' => 'failed'],
        });

        return $payment;
    }
}
