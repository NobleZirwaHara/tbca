<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Models\DueDiligence\MonitoringSubscription;
use App\Models\DueDiligence\Quote;
use App\Models\Order;
use App\Support\DueDiligence\Content;
use App\Support\DueDiligence\Workflow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Return target for Due Diligence orders (DD-028 to DD-030). Only a verified
 * paid order creates the entitlement: the case (or monitoring subscription)
 * is opened here, idempotently, and never before payment.
 */
class PaymentController extends Controller
{
    public function status(Request $request, Order $order): Response
    {
        $user = $request->user();
        abort_unless($order->section === 'due-diligence' && ($order->user_id === $user->id || $user->isAdmin()), 403);

        $quote = Quote::where('order_id', $order->id)->first();
        $subscription = $quote ? null : MonitoringSubscription::where('order_id', $order->id)->first();
        abort_if(! $quote && ! $subscription, 404);

        $case = null;
        if ($order->isPaid()) {
            $case = $quote ? Workflow::activateQuote($quote) : Workflow::activateSubscription($subscription)->caseFile;
        } elseif ($order->status === 'failed' && $quote) {
            $quote->update(['status' => 'payment_failed']);
        }

        $payment = $order->payments()->latest('id')->first();
        $state = match (true) {
            $order->isPaid() => 'success',
            $order->status === 'failed' => 'failed',
            default => 'processing',
        };

        return Inertia::render('DueDiligence/Payment/Status', [
            'state' => $state,
            'kind' => $quote ? 'case' : 'monitoring',
            'order' => [
                'reference' => $order->reference,
                'status' => $order->status,
                'subtotal' => $order->subtotal_zar,
                'vat' => $order->vat_zar,
                'fees' => $order->fees_zar,
                'total' => $order->total_zar,
                'billing' => $order->billing,
                'createdAt' => $order->created_at->toIso8601String(),
                'paidAt' => $order->paid_at?->toIso8601String(),
                'items' => $order->items()->get(['name', 'item_code', 'item_type', 'line_zar']),
            ],
            'payment' => $payment ? [
                'reference' => $payment->reference,
                'method' => $payment->method,
                'status' => $payment->status,
                'reason' => $payment->failure_reason,
                'createdAt' => $payment->created_at->toIso8601String(),
                'idempotency' => 'id-'.substr(hash('sha256', $order->reference.$payment->reference), 0, 16),
            ] : null,
            'attempts' => $order->payments()->count(),
            'quote' => $quote ? ['reference' => $quote->reference, 'payer' => $quote->payer_name, 'manifest' => $quote->manifest] : null,
            'subscription' => $subscription ? ['reference' => $subscription->reference, 'plan' => $subscription->plan_name, 'status' => $subscription->fresh()->status] : null,
            'case' => $case ? ['reference' => $case->reference, 'name' => $case->case_name, 'package' => $case->package_name, 'status' => $case->status] : null,
            'journey' => Content::journey(),
        ]);
    }
}
