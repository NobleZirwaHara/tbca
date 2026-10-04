<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Quote;
use App\Support\Platform\Checkout;
use App\Support\Shop\Audit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Quote Review (OS-033). A quote is a first-class, versioned object with a
 * validity period (blueprint 4.8). Acceptance converts it into a checkout order;
 * an expired quote cannot be accepted.
 */
class QuoteController extends Controller
{
    private function authorizeQuote(Request $request, Quote $quote): void
    {
        if ($quote->user_id !== null) {
            $user = $request->user();
            abort_unless($user && ($user->id === $quote->user_id || $user->isAdmin()), 403);
        }
    }

    public static function totals(Quote $quote): array
    {
        $subtotal = (int) collect($quote->lines)->sum(fn ($l) => $l['unit_zar'] * $l['quantity']);
        $vat = (int) round($subtotal * 0.15);

        return ['subtotal' => $subtotal, 'vat' => $vat, 'total' => $subtotal + $vat];
    }

    private function expireIfDue(Quote $quote): void
    {
        if ($quote->status === 'issued' && $quote->valid_until && $quote->valid_until->endOfDay()->isPast()) {
            $quote->update(['status' => 'expired']);
        }
    }

    public function show(Request $request, Quote $quote): Response
    {
        $this->authorizeQuote($request, $quote);
        $this->expireIfDue($quote);

        return Inertia::render('Shop/QuoteReview', [
            'quote' => [
                ...$quote->only(['reference', 'title', 'category', 'licence', 'provider', 'jurisdiction', 'engagement_type', 'version', 'lines', 'deliverables', 'terms', 'history', 'provider_note', 'client_note', 'status']),
                'valid_until' => $quote->valid_until?->toDateString(),
                'issued_at' => $quote->issued_at?->toIso8601String(),
                'order_reference' => $quote->order?->reference,
                'order_paid' => (bool) $quote->order?->isPaid(),
            ],
            'totals' => self::totals($quote),
        ]);
    }

    public function accept(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorizeQuote($request, $quote);
        $this->expireIfDue($quote);
        $request->validate(['accept_terms' => ['accepted']]);

        if ($quote->status === 'accepted' && $quote->order) {
            return redirect()->route('checkout.show', $quote->order);
        }
        if ($quote->status !== 'issued') {
            return back()->with('error', "This quote is {$quote->status} and can no longer be accepted.");
        }

        $order = Checkout::createOrder(
            collect($quote->lines)->map(fn ($l, $i) => [
                'item_type' => 'quote',
                'item_code' => $quote->reference.'-'.($i + 1),
                'name' => $l['description'],
                'variant' => "Quote v{$quote->version}",
                'unit_zar' => (int) $l['unit_zar'],
                'quantity' => (int) $l['quantity'],
                'meta' => ['quote' => $quote->reference, 'provider' => $quote->provider],
            ])->all(),
            $request->user(),
            'shop',
            ['title' => "Accepted quote {$quote->reference}", 'quote' => $quote->reference],
        );

        $quote->update(['status' => 'accepted', 'order_id' => $order->id]);
        Audit::log('accept', $quote->reference, "Quote v{$quote->version} accepted; order {$order->reference} created");

        return redirect()->route('checkout.show', $order);
    }

    public function decline(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorizeQuote($request, $quote);
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:500']]);
        abort_unless(in_array($quote->status, ['issued', 'changes_requested'], true), 409);

        $quote->update(['status' => 'declined', 'client_note' => $data['reason'] ?? null]);
        Audit::log('decline', $quote->reference, 'Quote declined by client');

        return back()->with('success', 'Quote declined. Thank you for letting us know.');
    }

    public function changes(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorizeQuote($request, $quote);
        $data = $request->validate(['note' => ['required', 'string', 'min:5', 'max:1000']]);
        abort_unless($quote->status === 'issued', 409);

        $quote->update(['status' => 'changes_requested', 'client_note' => $data['note']]);
        Audit::log('changes', $quote->reference, 'Client requested changes');

        return back()->with('success', 'Change request sent. You will receive a revised quote version.');
    }
}
