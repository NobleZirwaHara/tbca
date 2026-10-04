<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\BasketItem;
use App\Models\Shop\Product;
use App\Models\Shop\SavedBasket;
use App\Models\Submission;
use App\Support\Platform\Basket;
use App\Support\Platform\Checkout;
use App\Support\Platform\Reference;
use App\Support\Shop\Acts;
use App\Support\Shop\Pricing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Shop-side basket operations. Prices are resolved server-side from the
 * Product Master; the selection basket is non-binding and is partitioned by
 * commercial act at commitment (blueprint 9.2).
 */
class CartController extends Controller
{
    public function add(Request $request, Product $product, Basket $basket): RedirectResponse
    {
        $data = $request->validate([
            'tier' => ['nullable', 'string', 'max:40'],
            'addons' => ['nullable', 'array'], 'addons.*' => ['string', 'max:40'],
            'config' => ['nullable', 'array'], 'config.*' => ['nullable', 'string', 'max:80'],
            'licence' => ['nullable', 'string', 'max:5'],
            'use' => ['nullable', 'string', 'max:20'],
            'use_other' => ['nullable', 'string', 'max:200'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'buy_now' => ['nullable', 'boolean'],
        ]);

        $line = Pricing::line($product, $data);

        if ($data['buy_now'] ?? false) {
            $order = Checkout::createOrder([$line], $request->user(), 'shop', ['title' => $product->name, 'act' => $product->act]);

            return redirect()->route('checkout.show', $order);
        }

        $basket->add($line);

        return back()->with('success', "{$product->name} was added to your basket.");
    }

    /** Adds a non-purchase item (quote, proposal, brief, subscription, free) to the selection basket. */
    public function saveForLater(Request $request, Product $product, Basket $basket): RedirectResponse
    {
        abort_if($product->status !== 'active' || $product->listing_state === 'LS-06', 404);

        $act = match (true) {
            $product->listing_state === 'LS-05' => 'quote',
            default => Acts::basketAct($product->act),
        };

        if ($act === 'purchase') {
            return $this->add($request, $product, $basket);
        }

        $basket->add([
            'item_type' => $act === 'quote' ? 'quote' : $act,
            'item_code' => $product->code,
            'name' => $product->name,
            'variant' => null,
            'unit_zar' => 0,
            'quantity' => 1,
            'commercial_act' => $act,
            'meta' => array_filter([
                'section' => 'shop', 'slug' => $product->slug, 'act' => $product->act, 'act_label' => Acts::label($product->act),
                'indicative_zar' => $product->price_zar ?? $product->indicative_zar, 'price_unit' => $product->price_unit,
                'details' => $act === 'quote' ? ['Proposal + Engagement Terms', 'Capacity & Resource Check', 'Human Consultation'] : null,
            ]),
        ]);

        return back()->with('success', "{$product->name} was saved to your selection basket.");
    }

    public function update(Request $request, Basket $basket, int $item): RedirectResponse
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:50']]);
        $line = $basket->query()->whereKey($item)->firstOrFail();
        abort_if($line->commercial_act !== 'purchase', 422, 'Quantity applies to purchase lines only.');
        $line->update(['quantity' => $data['quantity']]);

        return back();
    }

    public function clear(Basket $basket): RedirectResponse
    {
        $basket->clear();

        return back()->with('success', 'Your basket has been cleared.');
    }

    /** Binding checkout for the LS-PURCHASE group only; other groups stay in the basket. */
    public function checkoutPurchase(Request $request, Basket $basket): RedirectResponse
    {
        $lines = $basket->query()->where('commercial_act', 'purchase')->oldest()->get();
        if ($lines->isEmpty()) {
            return back()->with('error', 'There are no items available for immediate purchase.');
        }

        $order = Checkout::createOrder(
            $lines->map(fn (BasketItem $i) => $i->only(['item_type', 'item_code', 'name', 'variant', 'quantity', 'unit_zar', 'meta']))->all(),
            $request->user(),
            'shop',
            ['title' => 'Online Shop order'],
        );
        $basket->query()->whereIn('id', $lines->pluck('id'))->delete();

        return redirect()->route('checkout.show', $order);
    }

    /** Creates one quote request per LS-QUOTE line (separate non-binding request objects). */
    public function requestQuotes(Request $request, Basket $basket): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => [$user ? 'nullable' : 'required', 'string', 'max:120'],
            'email' => [$user ? 'nullable' : 'required', 'email', 'max:190'],
        ]);

        $lines = $basket->query()->where('commercial_act', 'quote')->get();
        if ($lines->isEmpty()) {
            return back()->with('error', 'There are no items that require a quote.');
        }

        $refs = [];
        foreach ($lines as $line) {
            $refs[] = Submission::create([
                'reference' => Reference::make('QTR'),
                'user_id' => $user?->id,
                'type' => 'quote-request',
                'section' => 'shop',
                'subject' => $line->name,
                'name' => $data['name'] ?? $user?->name,
                'email' => $data['email'] ?? $user?->email,
                'payload' => ['product' => $line->meta['slug'] ?? null, 'code' => $line->item_code, 'indicative_zar' => $line->meta['indicative_zar'] ?? null, 'source' => 'basket'],
            ])->reference;
        }
        $basket->query()->whereIn('id', $lines->pluck('id'))->delete();

        return back()->with('success', count($refs).' quote request(s) submitted. We will prepare a proposal for the quoted items.')->with('reference', $refs[0]);
    }

    /* --- Saved baskets ------------------------------------------------------ */

    private function savedQuery(Request $request, Basket $basket)
    {
        $user = $request->user();

        return $user
            ? SavedBasket::query()->where('user_id', $user->id)
            : SavedBasket::query()->whereNull('user_id')->where('session_token', $basket->guestToken());
    }

    public function savedIndex(Request $request, Basket $basket): JsonResponse
    {
        return response()->json($this->savedQuery($request, $basket)->latest('updated_at')->get()->map(fn (SavedBasket $b) => [
            'id' => $b->id, 'name' => $b->name, 'items' => collect($b->items)->sum('quantity'), 'updated_at' => $b->updated_at->toIso8601String(),
        ]));
    }

    public function saveBasket(Request $request, Basket $basket): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:80']]);
        $items = $basket->items();
        if ($items->isEmpty()) {
            return back()->with('error', 'Your basket is empty.');
        }

        SavedBasket::create([
            'user_id' => $request->user()?->id,
            'session_token' => $request->user() ? null : $basket->guestToken(),
            'name' => $data['name'],
            'items' => $items->map(fn (BasketItem $i) => $i->only(['item_type', 'item_code', 'name', 'variant', 'quantity', 'unit_zar', 'commercial_act', 'meta']))->values()->all(),
        ]);

        return back()->with('success', "Basket saved as \"{$data['name']}\".");
    }

    public function loadBasket(Request $request, Basket $basket, int $saved): RedirectResponse
    {
        $record = $this->savedQuery($request, $basket)->findOrFail($saved);
        foreach ($record->items as $line) {
            $product = Product::query()->where('code', $line['item_code'])->first();
            // Re-validate each purchase line against the current Product Master (price, floor, state).
            if (($line['commercial_act'] ?? 'purchase') === 'purchase' && $product && ! $product->isPurchasable()) {
                continue;
            }
            $basket->add($line);
        }
        $record->touch();

        return back()->with('success', "Loaded \"{$record->name}\" into your basket.");
    }

    public function deleteBasket(Request $request, Basket $basket, int $saved): RedirectResponse
    {
        $this->savedQuery($request, $basket)->findOrFail($saved)->delete();

        return back()->with('success', 'Saved basket deleted.');
    }
}
