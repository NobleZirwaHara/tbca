<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Support\Platform\Basket;
use App\Support\Platform\Checkout;
use App\Support\Platform\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BasketController extends Controller
{
    public function show(Basket $basket): Response
    {
        $subtotal = $basket->subtotal();

        return Inertia::render('Checkout/Basket', [
            'items' => $basket->items(),
            'totals' => Money::totals($subtotal),
        ]);
    }

    /**
     * Add a purchasable line. Sections post here from their product pages.
     * Pass "checkout" => true to skip the basket and go straight to payment.
     */
    public function store(Request $request, Basket $basket): RedirectResponse
    {
        $line = $request->validate([
            'item_type' => ['required', 'string', 'max:40'],
            'item_code' => ['required', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:190'],
            'variant' => ['nullable', 'string', 'max:80'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'unit_zar' => ['required', 'integer', 'min:0'],
            'commercial_act' => ['nullable', 'string', 'max:30'],
            'meta' => ['nullable', 'array'],
            'checkout' => ['nullable', 'boolean'],
        ]);

        $checkoutNow = (bool) ($line['checkout'] ?? false);
        unset($line['checkout']);

        if ($checkoutNow) {
            $order = Checkout::createOrder([$line], $request->user(), $line['meta']['section'] ?? 'shop', $line['meta'] ?? []);

            return redirect()->route('checkout.show', $order);
        }

        $basket->add($line);

        return back()->with('success', "{$line['name']} was added to your basket.");
    }

    public function destroy(Basket $basket, int $item): RedirectResponse
    {
        $basket->remove($item);

        return back()->with('success', 'Item removed from your basket.');
    }

    public function checkout(Request $request, Basket $basket): RedirectResponse
    {
        // Only purchase lines can be paid now; quote, subscription and retainer
        // lines stay in the basket for their own request flows.
        $items = $basket->items()->where('commercial_act', 'purchase')->values();

        if ($items->isEmpty()) {
            return redirect()->route('basket')->with('error', 'There are no items ready for purchase in your basket.');
        }

        $order = Checkout::createOrder(
            $items->map(fn ($i) => $i->only(['item_type', 'item_code', 'name', 'variant', 'quantity', 'unit_zar', 'meta']))->all(),
            $request->user(),
            'shop',
        );

        $basket->query()->whereIn('id', $items->pluck('id'))->delete();

        return redirect()->route('checkout.show', $order);
    }
}
