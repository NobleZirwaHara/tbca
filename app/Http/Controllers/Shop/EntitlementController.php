<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop\Entitlement;
use App\Models\Shop\LedgerPosting;
use App\Support\Shop\Reconciler;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Entitlement Activation (OS-029) and printable receipt. Entitlements are only
 * issued once the paid order is posted to the ledgers (VERIFIED_PAYMENT).
 */
class EntitlementController extends Controller
{
    private function authorizeOrder(Request $request, Order $order): void
    {
        if ($order->user_id !== null) {
            $user = $request->user();
            abort_unless($user && ($user->id === $order->user_id || $user->isAdmin()), 403);
        }
    }

    public function show(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        if (! $order->isPaid()) {
            return redirect()->route('checkout.show', $order)->with('error', 'Entitlements are activated after payment is verified.');
        }

        $status = Reconciler::reconcile($order);

        return Inertia::render('Shop/Entitlements', [
            'order' => $order->load('items'),
            'status' => $status,
            'entitlements' => Entitlement::query()->where('order_id', $order->id)->orderBy('id')->get()->map(fn (Entitlement $e) => [
                ...$e->only(['reference', 'name', 'item_code', 'type', 'authority', 'status']),
                'starts_at' => $e->starts_at?->toIso8601String(),
                'ends_at' => $e->ends_at?->toIso8601String(),
                'variant' => $e->meta['variant'] ?? null,
            ]),
            'postings' => LedgerPosting::query()->where('order_id', $order->id)->get(['ledger', 'amount_zar', 'qbo_reference', 'status']),
            'activatedAt' => Entitlement::query()->where('order_id', $order->id)->min('created_at'),
        ]);
    }

    public function receipt(Request $request, Order $order): Response
    {
        $this->authorizeOrder($request, $order);

        return Inertia::render('Shop/Receipt', [
            'order' => $order->load('items', 'payments'),
            'invoice' => Reconciler::qboReference($order),
        ]);
    }
}
