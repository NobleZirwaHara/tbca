<?php

namespace App\Http\Controllers\Products\Subscriptions;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Subscriptions\Plan;
use App\Models\Products\Subscriptions\SubEvent;
use App\Models\Products\Subscriptions\SubExport;
use App\Models\Products\Subscriptions\Subscription;
use App\Support\Platform\Checkout;
use App\Support\Products\Subscriptions\Lifecycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Signed-in subscriber workspace (Blueprint screens 9-21, Subscriber Track S4-S12).
 * Every action is validated server-side through Lifecycle and logged to prd_sub_events.
 */
class AccountController extends Controller
{
    public const EXPORT_TYPES = [
        'activity' => ['Activity & Audit History', 'Login activity, actions, and audit trail.', 'CSV', '~2 MB', true],
        'invoices' => ['Invoices & Receipts', 'All invoices, receipts and payment records.', 'CSV', '~8 MB', true],
        'reports' => ['Downloaded Reports Index', 'Index of all reports you have downloaded.', 'CSV', '~1 MB', false],
        'templates' => ['Saved Templates & Checklists', 'Your saved templates and checklist content.', 'JSON', '~3 MB', false],
        'usage' => ['Subscription Usage Summary', 'Usage metrics and feature access summary.', 'CSV', '~1 MB', false],
    ];

    private function load(Request $request, Subscription $subscription): Subscription
    {
        abort_unless($subscription->user_id === $request->user()->id || $request->user()->role === 'admin', 404);

        $subscription->load('plan', 'pendingPlan');
        Lifecycle::sweep($subscription);

        return $subscription->refresh()->load('plan', 'pendingPlan');
    }

    private function render(string $page, Subscription $sub, array $extra = []): Response
    {
        return Inertia::render("Products/Subscriptions/Account/{$page}", [
            'subscription' => $sub->toSummary(),
            ...$extra,
        ]);
    }

    /* ------------------------------------------------------------------ overview */

    public function index(Request $request): Response
    {
        $filter = $request->validate(['filter' => ['nullable', Rule::in(['all', 'active', 'needs_action', 'paused', 'cancelled'])]])['filter'] ?? 'all';

        $all = Subscription::where('user_id', $request->user()->id)->where('status', '!=', 'PENDING_PAYMENT')->with('plan', 'pendingPlan')->orderBy('id')->get();
        $all->each(fn (Subscription $s) => Lifecycle::sweep($s));
        $all = $all->map->refresh()->each->load('plan', 'pendingPlan');

        $needsAction = fn (Subscription $s) => in_array($s->displayStatus(), ['PRICE_CHANGE_PENDING', 'DISUSE_FLAGGED', 'IN_GRACE', 'PAST_DUE'], true);

        $list = $all->filter(fn (Subscription $s) => match ($filter) {
            'active' => in_array($s->status, ['ACTIVE', 'CANCELLED_PENDING'], true),
            'needs_action' => $needsAction($s),
            'paused' => $s->status === 'PAUSED',
            'cancelled' => in_array($s->status, ['CANCELLED', 'CLOSED_NONPAYMENT'], true),
            default => true,
        })->values();

        $monthEnd = now()->endOfMonth();
        $upcoming = $all->filter(fn ($s) => $s->next_charge_at && $s->next_charge_at->lte($monthEnd) && in_array($s->status, ['ACTIVE'], true));

        $attention = [];
        foreach ($all as $s) {
            if ($s->priceChangePending()) {
                $attention[] = ['type' => 'price', 'title' => 'Price change pending', 'code' => 'PRICE_CHANGE_PENDING', 'plan' => $s->plan->name, 'body' => 'New price R'.number_format($s->price_change['new_price_zar']).' ZAR effective '.Carbon::parse($s->price_change['effective_at'])->format('d M Y').'.', 'href' => "/subscriptions/account/{$s->reference}/price-change", 'cta' => 'Review change'];
            }
            if ($s->disuse_flagged && $s->status === 'ACTIVE') {
                $attention[] = ['type' => 'disuse', 'title' => 'Disuse alert', 'code' => 'DISUSE_FLAGGED', 'plan' => $s->plan->name, 'body' => 'No recent activity detected. Access preserved.', 'href' => "/subscriptions/account/{$s->reference}/disuse", 'cta' => 'View options'];
            }
            if (in_array($s->status, ['IN_GRACE', 'PAST_DUE'], true)) {
                $attention[] = ['type' => 'payment', 'title' => 'Payment failed', 'code' => 'PAYMENT_OVERDUE', 'plan' => $s->plan->name, 'body' => 'R'.number_format($s->overdue_zar).' ZAR (ex VAT) is overdue. Your subscription is not cancelled.', 'href' => "/subscriptions/account/{$s->reference}/billing-recovery", 'cta' => 'Settle now'];
            }
            if ($s->status === 'ACTIVE' && $s->renewal_notice_at && $s->next_charge_at) {
                $attention[] = ['type' => 'renewal', 'title' => 'Upcoming charge reminder', 'code' => null, 'plan' => $s->plan->name, 'body' => 'Next charge on '.$s->next_charge_at->format('d M Y').' for R'.number_format($s->price_zar).' ZAR.', 'href' => "/subscriptions/account/{$s->reference}/renewal", 'cta' => 'Go to subscription'];
            }
            if (in_array($s->status, ['CANCELLED', 'CLOSED_NONPAYMENT'], true)) {
                $attention[] = ['type' => 'reactivate', 'title' => 'Reactivation opportunity', 'code' => null, 'plan' => $s->plan->name, 'body' => 'Reactivate to resume access and updates.', 'href' => "/subscriptions/account/{$s->reference}/reactivate", 'cta' => 'Reactivate now'];
            }
        }

        return Inertia::render('Products/Subscriptions/Account/Overview', [
            'subscriptions' => $list->map->toSummary(),
            'filter' => $filter,
            'counts' => [
                'all' => $all->count(),
                'active' => $all->whereIn('status', ['ACTIVE', 'CANCELLED_PENDING'])->count(),
                'needs_action' => $all->filter($needsAction)->count(),
                'paused' => $all->where('status', 'PAUSED')->count(),
                'cancelled' => $all->whereIn('status', ['CANCELLED', 'CLOSED_NONPAYMENT'])->count(),
            ],
            'kpis' => [
                'active' => $all->whereIn('status', ['ACTIVE', 'CANCELLED_PENDING'])->count(),
                'total' => $all->count(),
                'upcoming_zar' => (int) $upcoming->sum('price_zar'),
                'upcoming_count' => $upcoming->count(),
                'deliveries' => $all->whereIn('status', ['ACTIVE', 'CANCELLED_PENDING'])->count(),
                'attention' => count($attention),
            ],
            'attention' => $attention,
        ]);
    }

    public function show(Request $request, Subscription $subscription): Response
    {
        $sub = $this->load($request, $subscription);

        return $this->render('Detail', $sub, [
            'events' => $sub->events()->latest('id')->limit(12)->get(['event_type', 'previous_state', 'new_state', 'payload', 'created_at']),
        ]);
    }

    public function engagement(Request $request, Subscription $subscription): Response
    {
        return $this->render('Engagement', $this->load($request, $subscription));
    }

    /* ------------------------------------------------------------------ disuse */

    public function disuse(Request $request, Subscription $subscription): Response
    {
        return $this->render('Disuse', $this->load($request, $subscription));
    }

    public function disuseChoice(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        $choice = $request->validate(['choice' => ['required', Rule::in(['CONTINUE', 'PAUSE', 'CHANGE', 'CANCEL'])]])['choice'];

        Lifecycle::disuseChoice($sub, $choice);

        return match ($choice) {
            'PAUSE' => redirect()->route('products.subscriptions.account.pause', $sub),
            'CHANGE' => redirect()->route('products.subscriptions.account.change-plan', $sub),
            'CANCEL' => redirect()->route('products.subscriptions.account.cancel', $sub),
            default => redirect()->route('products.subscriptions.account.show', $sub)->with('success', 'Thanks. Your plan continues unchanged.'),
        };
    }

    /* ------------------------------------------------------------------ change plan */

    public function changePlan(Request $request, Subscription $subscription): Response
    {
        $sub = $this->load($request, $subscription);
        $options = Plan::where('ladder', $sub->plan->ladder)->where('status', 'live')->whereNotNull('monthly_zar')->orderBy('monthly_zar')->get();

        return $this->render('ChangePlan', $sub, [
            'options' => $options->map(fn (Plan $p) => [...$p->toCard(), 'quote' => $p->id === $sub->plan_id ? null : Lifecycle::quoteChange($sub, $p)]),
            'history' => $sub->events()->where('event_type', 'like', 'plan_change%')->latest('id')->get(['event_type', 'payload', 'created_at']),
            'selected' => $request->query('to'),
        ]);
    }

    public function applyChange(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        $to = Plan::where('slug', $request->validate(['plan' => ['required', 'string']])['plan'])->first();

        if (! $to) {
            throw ValidationException::withMessages(['plan' => 'Choose a plan to change to.']);
        }

        $quote = Lifecycle::changePlan($sub, $to);

        return redirect()->route('products.subscriptions.account.show', $sub)->with('success', $quote['direction'] === 'upgrade'
            ? "Upgraded to {$to->name}. A prorated R".number_format($quote['prorated_zar']).' is added to your next invoice.'
            : "Downgrade to {$to->name} scheduled from {$quote['effective']}.");
    }

    /* ------------------------------------------------------------------ pause */

    public function pause(Request $request, Subscription $subscription): Response
    {
        $sub = $this->load($request, $subscription);

        return $this->render('Pause', $sub, [
            'pausedDays' => Lifecycle::pausedDaysInLastYear($sub),
            'maxDays' => Lifecycle::PAUSE_MAX_DAYS,
        ]);
    }

    public function confirmPause(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        $data = $request->validate([
            'duration' => ['required', Rule::in(['1', '2', '3', 'custom'])],
            'resume_on' => ['required_if:duration,custom', 'nullable', 'date', 'after:today'],
        ]);

        $days = $data['duration'] === 'custom'
            ? (int) now()->startOfDay()->diffInDays(Carbon::parse($data['resume_on'])->startOfDay())
            : (int) now()->startOfDay()->diffInDays(now()->startOfDay()->addMonthsNoOverflow((int) $data['duration']));

        Lifecycle::pause($sub, $days);

        return redirect()->route('products.subscriptions.account.show', $sub)->with('success', 'Your subscription is paused until '.$sub->fresh()->pause_until->format('d M Y').'. No charges during the pause.');
    }

    public function resume(Request $request, Subscription $subscription): RedirectResponse
    {
        Lifecycle::resume($this->load($request, $subscription));

        return back()->with('success', 'Welcome back. Your subscription is active again.');
    }

    /* ------------------------------------------------------------------ cancellation */

    private function cancelState(Request $request, Subscription $sub): array
    {
        return $request->session()->get("sub_cancel.{$sub->reference}", ['step' => 1, 'reason' => null, 'actions' => 1]);
    }

    public function cancel(Request $request, Subscription $subscription): Response|RedirectResponse
    {
        $sub = $this->load($request, $subscription);

        if (in_array($sub->status, ['CANCELLED_PENDING', 'CANCELLED'], true)) {
            return redirect()->route('products.subscriptions.account.cancelled', $sub);
        }

        return $this->render('Cancel', $sub, ['wizard' => $this->cancelState($request, $sub)]);
    }

    /**
     * Cancellation wizard. Steps 2 (reason) and 3 (what you keep) are optional, so the
     * mandatory path is Select Cancel -> Review -> Confirm: three actions, matching signup.
     */
    public function cancelStep(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        $data = $request->validate([
            'action' => ['required', Rule::in(['next', 'back', 'confirm_page', 'confirm'])],
            'reason' => ['nullable', 'string', 'max:120'],
        ]);

        $state = $this->cancelState($request, $sub);
        $key = "sub_cancel.{$sub->reference}";

        if ($data['action'] === 'confirm') {
            if ($state['step'] !== 4) {
                throw ValidationException::withMessages(['action' => 'Review the effect of cancelling before you confirm.']);
            }

            Lifecycle::requestCancel($sub, $state['reason'] ?? null, 3);
            $sub->refresh();
            $sub->forceFill(['meta' => [...($sub->meta ?? []), 'cancellation' => [...($sub->meta['cancellation'] ?? []), 'actual_actions' => $state['actions'] + 1]]])->save();
            $request->session()->forget($key);

            return redirect()->route('products.subscriptions.account.cancelled', $sub);
        }

        $state['step'] = match ($data['action']) {
            'next' => min(4, $state['step'] + 1),
            'back' => max(1, $state['step'] - 1),
            'confirm_page' => 4,
        };
        if (array_key_exists('reason', $data) && $data['reason'] !== null) {
            $state['reason'] = $data['reason'];
        }
        if ($data['action'] !== 'back') {
            $state['actions']++;
        }
        $request->session()->put($key, $state);

        return redirect()->route('products.subscriptions.account.cancel', $sub);
    }

    public function withdrawCancel(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        Lifecycle::withdrawCancel($sub);

        return redirect()->route('products.subscriptions.account.show', $sub)->with('success', 'Your cancellation was withdrawn. Your subscription continues.');
    }

    public function cancelled(Request $request, Subscription $subscription): Response|RedirectResponse
    {
        $sub = $this->load($request, $subscription);

        if (! in_array($sub->status, ['CANCELLED_PENDING', 'CANCELLED', 'CLOSED_NONPAYMENT'], true)) {
            return redirect()->route('products.subscriptions.account.show', $sub);
        }

        return $this->render('Cancelled', $sub);
    }

    /* ------------------------------------------------------------------ export (data floor) */

    private function exportWindowOpen(Subscription $sub): bool
    {
        $end = $sub->accessUntil();

        return ! in_array($sub->status, ['CANCELLED', 'CLOSED_NONPAYMENT'], true) || ! $end || $end->endOfDay()->gte(now());
    }

    public function export(Request $request, Subscription $subscription): Response
    {
        $sub = $this->load($request, $subscription);
        $open = $this->exportWindowOpen($sub);

        return $this->render('Export', $sub, [
            'types' => collect(self::EXPORT_TYPES)->map(fn ($t, $k) => [
                'key' => $k, 'title' => $t[0], 'body' => $t[1], 'format' => $t[2], 'size' => $t[3],
                'available' => $open || $t[4],
            ])->values(),
            'windowOpen' => $open,
            'history' => $sub->exports()->latest('requested_at')->get(['export_type', 'file_type', 'status', 'size_label', 'requested_at']),
            'invoice' => Order::where('reference', $sub->order_reference)->first(['reference', 'total_zar', 'created_at']),
        ]);
    }

    public function download(Request $request, Subscription $subscription, string $type): StreamedResponse|RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        abort_unless(isset(self::EXPORT_TYPES[$type]), 404);
        [$title, , $format, , $alwaysAvailable] = self::EXPORT_TYPES[$type];

        if (! $alwaysAvailable && ! $this->exportWindowOpen($sub)) {
            return back()->with('error', 'The export window for this record closed when maintained access ended. Invoices and audit history remain available.');
        }

        $rows = match ($type) {
            'activity' => [['date', 'event', 'from', 'to'], ...$sub->events()->orderBy('id')->get()->map(fn ($e) => [$e->created_at->toDateTimeString(), $e->event_type, $e->previous_state, $e->new_state])->all()],
            'invoices' => [['reference', 'status', 'total_zar', 'date'], ...Order::where('user_id', $sub->user_id)->where('section', 'subscriptions')->get()->map(fn ($o) => [$o->reference, $o->status, $o->total_zar, $o->created_at->toDateString()])->all()],
            'reports' => [['report', 'downloaded'], ...collect($sub->usage['top_content'] ?? [])->map(fn ($c) => [$c[0], $c[1]])->all()],
            'usage' => [['metric', 'value'], ...collect($sub->usage ?? [])->filter(fn ($v) => is_scalar($v))->map(fn ($v, $k) => [$k, $v])->values()->all()],
            default => null,
        };

        SubExport::create([
            'subscription_id' => $sub->id, 'user_id' => $request->user()->id, 'export_type' => $title, 'file_type' => $format,
            'status' => 'Completed', 'size_label' => '< 1 MB', 'requested_at' => now(), 'completed_at' => now(),
        ]);
        SubEvent::log('export_downloaded', $sub, ['payload' => ['type' => $type]]);

        $name = "{$sub->reference}-{$type}.".strtolower($format);

        return response()->streamDownload(function () use ($rows, $sub) {
            if ($rows === null) {
                echo json_encode(['subscription' => $sub->reference, 'plan' => $sub->plan->name, 'saved_templates' => $sub->plan->entitlements ?? []], JSON_PRETTY_PRINT);

                return;
            }
            $out = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $name, ['Content-Type' => $rows === null ? 'application/json' : 'text/csv']);
    }

    public function requestExport(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);

        SubExport::create([
            'subscription_id' => $sub->id, 'user_id' => $request->user()->id, 'export_type' => 'Account Data Request', 'file_type' => 'ZIP (JSON)',
            'status' => 'Processing', 'requested_at' => now(),
        ]);
        SubEvent::log('export_requested', $sub, ['payload' => ['type' => 'account_data_request']]);

        return back()->with('success', 'Your account data request is being prepared. We will email it to you within 1–2 days.');
    }

    /* ------------------------------------------------------------------ renewal and price change */

    public function renewal(Request $request, Subscription $subscription): Response
    {
        return $this->render('Renewal', $this->load($request, $subscription));
    }

    public function continueRenewal(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);

        if ($sub->status !== 'ACTIVE') {
            throw ValidationException::withMessages(['status' => 'Only an active subscription continues automatically.']);
        }

        SubEvent::log('continuation_acknowledged', $sub, ['payload' => ['next_charge_at' => $sub->next_charge_at?->toDateString()]]);

        return back()->with('success', 'Noted. Your plan will continue on '.$sub->next_charge_at?->format('d M Y').'.');
    }

    public function priceChange(Request $request, Subscription $subscription): Response
    {
        return $this->render('PriceChange', $this->load($request, $subscription));
    }

    public function decidePriceChange(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        $decision = $request->validate(['decision' => ['required', Rule::in(['accept', 'exit'])]])['decision'];

        Lifecycle::decidePriceChange($sub, $decision);

        return $decision === 'exit'
            ? redirect()->route('products.subscriptions.account.cancelled', $sub)
            : redirect()->route('products.subscriptions.account.show', $sub)->with('success', 'You accepted the new price. It applies from '.Carbon::parse($sub->price_change['effective_at'])->format('d M Y').'.');
    }

    /* ------------------------------------------------------------------ billing recovery */

    public function billingRecovery(Request $request, Subscription $subscription): Response
    {
        $sub = $this->load($request, $subscription);

        // Pull-style recovery after the shared checkout.
        $paid = Order::where('user_id', $sub->user_id)->where('section', 'subscriptions')->where('status', 'paid')
            ->where('meta->subscription', $sub->reference)->where('meta->purpose', 'recovery')->latest('id')->first();
        if ($paid && in_array($sub->status, ['IN_GRACE', 'PAST_DUE'], true) && ! SubEvent::where('idempotency_key', "recover:{$paid->reference}")->exists()) {
            Lifecycle::recover($sub, 'portal_payment');
            SubEvent::log('recovery_payment', $sub, ['money_effect' => true, 'idempotency_key' => "recover:{$paid->reference}", 'payload' => ['order' => $paid->reference]]);
            $sub->refresh()->load('plan');
        }

        return $this->render('BillingRecovery', $sub, [
            'eftReference' => 'TBCA-'.substr(preg_replace('/\D/', '', $sub->reference).'59271', 0, 5).'-'.strtoupper(substr($sub->plan->code, 4, 3)).'-'.($sub->payment_failed_at?->format('Ymd') ?? now()->format('Ymd')),
        ]);
    }

    public function payOverdue(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);

        if (! in_array($sub->status, ['IN_GRACE', 'PAST_DUE'], true) || $sub->overdue_zar <= 0) {
            throw ValidationException::withMessages(['status' => 'There is nothing overdue on this subscription.']);
        }

        $order = Checkout::createOrder([[
            'item_type' => 'subscription', 'item_code' => $sub->plan->code, 'name' => "{$sub->plan->name} — overdue amount",
            'unit_zar' => $sub->overdue_zar, 'meta' => ['subscription' => $sub->reference],
        ]], $request->user(), 'subscriptions', [
            'title' => 'Overdue subscription payment',
            'subscription' => $sub->reference,
            'purpose' => 'recovery',
            'return_url' => "/subscriptions/account/{$sub->reference}/billing-recovery",
        ]);

        return redirect()->route('checkout.show', $order);
    }

    public function updateCard(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        $data = $request->validate([
            'card_number' => ['required', 'string', 'regex:/^[\d ]{12,23}$/'],
            'expiry' => ['required', 'string', 'regex:/^\d{2}\s*\/\s*\d{2}$/'],
        ]);

        $last4 = substr(preg_replace('/\D/', '', $data['card_number']), -4);
        $sub->forceFill(['mandate' => [...($sub->mandate ?? []), 'last4' => $last4, 'brand' => str_starts_with($data['card_number'], '5') ? 'Mastercard' : 'Visa', 'updated_at' => now()->toIso8601String()]])->save();
        SubEvent::log('payment_method_updated', $sub, ['payload' => ['last4' => $last4]]);

        return back()->with('success', "Card ending {$last4} saved for future charges.");
    }

    /* ------------------------------------------------------------------ reactivation */

    public function reactivate(Request $request, Subscription $subscription): Response
    {
        $sub = $this->load($request, $subscription);

        return $this->render('Reactivate', $sub, ['currentPrice' => $sub->plan->priceFor($sub->billing_interval) ?? $sub->plan->monthly_zar]);
    }

    /** A fresh affirmative event under the current plan, price, terms and a new payment authority. */
    public function confirmReactivate(Request $request, Subscription $subscription): RedirectResponse
    {
        $sub = $this->load($request, $subscription);
        $request->validate(['mandate_consent' => ['accepted']], ['mandate_consent.accepted' => 'Please authorise the recurring charge to reactivate.']);

        if (! in_array($sub->status, ['CANCELLED', 'CLOSED_NONPAYMENT'], true)) {
            throw ValidationException::withMessages(['status' => 'Only a cancelled or closed subscription can be reactivated.']);
        }

        if ($blocker = $sub->plan->saleBlocker()) {
            throw ValidationException::withMessages(['status' => 'This plan is not currently available ('.$blocker.').']);
        }

        $price = (int) ($sub->plan->priceFor($sub->billing_interval) ?? $sub->plan->monthly_zar);
        $sub->forceFill(['price_zar' => $price, 'mandate' => [...($sub->mandate ?? []), 'status' => 'PENDING', 'amount_zar' => $price, 'consent_version' => 'SU-MANDATE-v1.0', 'captured_at' => now()->toIso8601String()]])->save();

        $order = Checkout::createOrder([[
            'item_type' => 'subscription', 'item_code' => $sub->plan->code, 'name' => "{$sub->plan->name} — reactivation",
            'variant' => $sub->billing_interval, 'unit_zar' => $price, 'meta' => ['subscription' => $sub->reference],
        ]], $request->user(), 'subscriptions', ['title' => "Reactivate {$sub->plan->name}", 'subscription' => $sub->reference, 'purpose' => 'reactivation']);
        $order->update(['meta' => [...$order->meta, 'return_url' => "/subscriptions/order/{$order->reference}/confirmed"]]);
        SubEvent::log('reactivation_requested', $sub, ['payload' => ['order' => $order->reference, 'price' => $price]]);

        return redirect()->route('checkout.show', $order);
    }
}
