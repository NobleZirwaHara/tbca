<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\Platform\Africa;
use App\Support\Platform\Checkout;
use App\Support\Platform\Money;
use App\Support\Platform\PaymentOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared payment flow: Complete Your Payment -> Processing -> Confirmation.
 */
class CheckoutController extends Controller
{
    public function show(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        if ($order->isPaid()) {
            return redirect()->route('checkout.confirmation', $order);
        }

        return Inertia::render('Checkout/Payment', [
            'order' => $order->load('items', 'payments'),
            'feeOptions' => collect(['card', 'eft', 'wallet'])
                ->mapWithKeys(fn ($m) => [$m => Money::totals($order->subtotal_zar, $m)]),
            'lastPayment' => $order->payments()->latest('id')->first(),
            'paymentOptions' => PaymentOptions::register(),
            'countries' => [...Africa::names(), 'Other'],
        ]);
    }

    public function pay(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeOrder($request, $order);
        abort_if($order->isPaid(), 409, 'This order has already been paid.');

        $data = $request->validate([
            'method' => ['required', Rule::in(['card', 'eft', 'wallet'])],
            'card_name' => ['required_if:method,card', 'nullable', 'string', 'max:120'],
            'card_number' => ['required_if:method,card', 'nullable', 'string', 'max:23'],
            'expiry' => ['required_if:method,card', 'nullable', 'regex:/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/'],
            'cvv' => ['required_if:method,card', 'nullable', 'digits_between:3,4'],
            'billing_name' => ['required', 'string', 'max:120'],
            'billing_email' => ['required', 'email', 'max:190'],
            'billing_phone' => ['nullable', 'string', 'max:30'],
            'billing_company' => ['nullable', 'string', 'max:190'],
            'billing_address' => ['nullable', 'string', 'max:255'],
            'billing_country' => ['nullable', 'string', 'max:60'],
            'accept_terms' => ['accepted'],
        ], [
            'expiry.regex' => 'Enter the expiry date as MM / YY.',
        ]);

        $payment = Checkout::pay($order, $data['method'], $data, [
            'name' => $data['billing_name'],
            'email' => $data['billing_email'],
            'phone' => $data['billing_phone'] ?? null,
            'company' => $data['billing_company'] ?? null,
            'address' => $data['billing_address'] ?? null,
            'country' => $data['billing_country'] ?? null,
        ]);

        return match ($payment->status) {
            'succeeded' => redirect($order->meta['return_url'] ?? route('checkout.confirmation', $order)),
            'pending' => redirect()->route('checkout.processing', $order),
            default => back()->with('error', $payment->failure_reason ?? 'Payment failed. Please try another method.'),
        };
    }

    public function processing(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        if ($order->isPaid()) {
            return redirect()->route('checkout.confirmation', $order);
        }

        return Inertia::render('Checkout/Processing', [
            'order' => $order->load('items'),
            'payment' => $order->payments()->latest('id')->first(),
        ]);
    }

    public function confirmation(Request $request, Order $order): Response
    {
        $this->authorizeOrder($request, $order);

        return Inertia::render('Checkout/Confirmation', [
            'order' => $order->load('items', 'payments'),
        ]);
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        // Guest orders are reachable by reference only; client orders only by their owner or an admin.
        if ($order->user_id !== null) {
            $user = $request->user();
            abort_unless($user && ($user->id === $order->user_id || $user->isAdmin()), 403);
        }
    }
}
