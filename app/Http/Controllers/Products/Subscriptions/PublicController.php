<?php

namespace App\Http\Controllers\Products\Subscriptions;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Subscriptions\Plan;
use App\Models\Products\Subscriptions\SubEvent;
use App\Models\Products\Subscriptions\Subscription;
use App\Support\Platform\Checkout;
use App\Support\Platform\Money;
use App\Support\Platform\Reference;
use App\Support\Products\Subscriptions\Capacity;
use App\Support\Products\Subscriptions\Lifecycle;
use App\Support\Products\Subscriptions\PlanCatalogue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public subscription journey: discover -> compare -> plan -> disclosure (acknowledged)
 * -> checkout with recurring mandate consent -> shared payment -> confirmation.
 * Signup is three mandatory actions (Blueprint 4.2): select plan, review disclosure, confirm.
 */
class PublicController extends Controller
{
    private const TIERS = ['essentials', 'growth', 'professional', 'enterprise', 'custom-intelligence-archive'];

    private function tiers(): array
    {
        return Plan::whereIn('slug', self::TIERS)->orderBy('sort')->get()->map->toCard()->all();
    }

    public function landing(): Response
    {
        return Inertia::render('Products/Subscriptions/Landing', ['plans' => $this->tiers()]);
    }

    public function compare(): Response
    {
        return Inertia::render('Products/Subscriptions/Compare', [
            'plans' => $this->tiers(),
            'classes' => collect(Plan::CLASSES)->map(fn ($c, $k) => ['code' => $k, ...$c])->values(),
        ]);
    }

    /** "Choose a Subscription" (step 1 of 3): category, search and sort are applied server-side. */
    public function choose(Request $request): Response
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:60'],
            'q' => ['nullable', 'string', 'max:80'],
            'sort' => ['nullable', Rule::in(['popularity', 'price_asc', 'price_desc', 'name'])],
            'class' => ['nullable', Rule::in(array_keys(Plan::CLASSES))],
            'plan' => ['nullable', 'string', 'max:80'],
        ]);

        $category = $filters['category'] ?? 'Intelligence Dashboards';
        $base = Plan::query()->where('status', 'live')->whereNotNull('category')->where('tier', 'product');
        $counts = (clone $base)->selectRaw('category, count(*) as n')->groupBy('category')->pluck('n', 'category');

        $query = (clone $base)->where('category', $category);
        if ($q = $filters['q'] ?? null) {
            $query->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('description', 'like', "%{$q}%"));
        }
        if ($class = $filters['class'] ?? null) {
            $query->where('recurrence_class', $class);
        }
        match ($filters['sort'] ?? 'popularity') {
            'price_asc' => $query->orderBy('monthly_zar'),
            'price_desc' => $query->orderByDesc('monthly_zar'),
            'name' => $query->orderBy('name'),
            default => $query->orderByDesc('popular')->orderBy('sort'),
        };

        $selected = isset($filters['plan']) ? Plan::where('slug', $filters['plan'])->first() : null;

        return Inertia::render('Products/Subscriptions/Choose', [
            'categories' => collect(PlanCatalogue::CATEGORIES)->map(fn ($c) => ['name' => $c, 'count' => (int) ($counts[$c] ?? 0)]),
            'plans' => $query->get()->map->toCard(),
            'selected' => $selected?->toCard(),
            'filters' => ['category' => $category, 'q' => $filters['q'] ?? '', 'sort' => $filters['sort'] ?? 'popularity', 'class' => $filters['class'] ?? ''],
        ]);
    }

    public function chooseModel(): Response
    {
        return Inertia::render('Products/Subscriptions/ChooseModel');
    }

    public function show(Plan $plan): Response
    {
        abort_if($plan->status === 'retired', 404);

        return Inertia::render('Products/Subscriptions/Product', [
            'plan' => $plan->toCard(),
            'variant' => $plan->slug === 'maintained-content' ? 'maintained' : 'product',
            'nextCharge' => Lifecycle::periodEnd(now()->startOfDay(), 'monthly')->addDay()->toDateString(),
            'related' => Plan::where('ladder', $plan->ladder)->where('id', '!=', $plan->id)->where('status', 'live')->orderBy('monthly_zar')->get()->map->toCard(),
        ]);
    }

    public function disclosure(Request $request, Plan $plan): Response
    {
        return Inertia::render('Products/Subscriptions/Disclosure', [
            'plan' => $plan->toCard(),
            'acknowledged' => (bool) $request->session()->get("sub_disclosure.{$plan->slug}"),
            'nextCharge' => Lifecycle::periodEnd(now()->startOfDay(), 'monthly')->addDay()->toDateString(),
        ]);
    }

    /** Signup action 2: the client confirms they reviewed continuation and cancellation. */
    public function acknowledge(Request $request, Plan $plan): RedirectResponse
    {
        $request->validate(['acknowledged' => ['accepted']], ['acknowledged.accepted' => 'Please confirm you reviewed how this Subscription continues and how you can stop it.']);

        $request->session()->put("sub_disclosure.{$plan->slug}", now()->toIso8601String());

        return redirect()->route('products.subscriptions.checkout', ['plan' => $plan, 'interval' => $request->input('interval') === 'annual' ? 'annual' : 'monthly']);
    }

    public function checkout(Request $request, Plan $plan): Response|RedirectResponse
    {
        if (! $request->session()->get("sub_disclosure.{$plan->slug}")) {
            return redirect()->route('products.subscriptions.disclosure', $plan)
                ->with('error', 'Please review how this subscription continues and how to cancel before checkout.');
        }

        return Inertia::render('Products/Subscriptions/Checkout', [
            'plan' => $plan->toCard(),
            'blocker' => $this->blocker($plan),
            'interval' => $request->query('interval') === 'annual' ? 'annual' : 'monthly',
            'fees' => [
                'monthly' => $plan->monthly_zar ? Money::totals($plan->monthly_zar) : null,
                'annual' => $plan->annualZar() ? Money::totals($plan->annualZar()) : null,
            ],
            'firstPeriodEnd' => [
                'monthly' => Lifecycle::periodEnd(now()->startOfDay(), 'monthly')->toDateString(),
                'annual' => Lifecycle::periodEnd(now()->startOfDay(), 'annual')->toDateString(),
            ],
        ]);
    }

    private function blocker(Plan $plan): ?string
    {
        return $plan->saleBlocker() ?? (Capacity::classBreached($plan->recurrence_class) ? 'CAPACITY_HOLD' : null);
    }

    /** Signup action 3: confirm the subscription and the recurring payment authority. */
    public function subscribe(Request $request, Plan $plan): RedirectResponse
    {
        $data = $request->validate([
            'interval' => ['required', Rule::in(['monthly', 'annual'])],
            'mandate_consent' => ['accepted'],
            'terms' => ['accepted'],
        ], [
            'mandate_consent.accepted' => 'You must authorise the recurring charge to subscribe.',
            'terms.accepted' => 'Please accept the subscription terms.',
        ]);

        if (! $request->session()->get("sub_disclosure.{$plan->slug}")) {
            throw ValidationException::withMessages(['mandate_consent' => 'Please review the pre-purchase disclosure first.']);
        }

        if ($blocker = $this->blocker($plan)) {
            throw ValidationException::withMessages(['plan' => match ($blocker) {
                'SU-FAIL-QUOTE' => 'This plan is priced on request. Please talk to an advisor.',
                'BLOCKED_BELOW_FLOOR' => 'This plan is not currently available for new subscriptions.',
                'CAPACITY_HOLD' => 'New subscriptions in this class are paused while review capacity is restored.',
                default => 'This plan is not currently available.',
            }]);
        }

        $price = $plan->priceFor($data['interval']);
        if ($price === null) {
            throw ValidationException::withMessages(['interval' => 'Annual billing is not available for this plan.']);
        }

        $user = $request->user();
        $sub = Subscription::create([
            'reference' => Reference::make('SUB'),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'PENDING_PAYMENT',
            'billing_interval' => $data['interval'],
            'price_zar' => $price,
            'min_term_months' => $plan->min_term_months,
            'usage' => ['score' => 0, 'confidence' => 'HIGH', 'idle_periods' => 0, 'days_inactive' => 0, 'logins' => 0, 'content' => 0, 'reports' => 0],
            'mandate' => [
                'status' => 'PENDING',
                'amount_zar' => $price,
                'frequency' => $data['interval'],
                'currency' => 'ZAR',
                'consent_version' => 'SU-MANDATE-v1.0',
                'terms_version' => 'SU-TERMS-v2.0',
                'consent_copy' => "I authorise TBCA to charge R{$price} (ex VAT) every ".($data['interval'] === 'annual' ? 'year' : 'month')." for {$plan->name} until I cancel.",
                'captured_at' => now()->toIso8601String(),
                'actor' => $user->email,
            ],
            'meta' => ['signup_actions' => 3, 'disclosure_ack_at' => $request->session()->get("sub_disclosure.{$plan->slug}")],
        ]);

        $order = Checkout::createOrder([[
            'item_type' => 'subscription',
            'item_code' => $plan->code,
            'name' => "{$plan->name} — first ".($data['interval'] === 'annual' ? 'year' : 'month'),
            'variant' => $data['interval'],
            'unit_zar' => $price,
            'meta' => ['subscription' => $sub->reference, 'recurrence_class' => $plan->recurrence_class],
        ]], $user, 'subscriptions', [
            'title' => "Subscription: {$plan->name}",
            'subscription' => $sub->reference,
        ]);

        $order->update(['meta' => [...$order->meta, 'return_url' => "/subscriptions/order/{$order->reference}/confirmed"]]);
        $sub->update(['order_reference' => $order->reference]);
        SubEvent::log('subscribe_confirmed', $sub, ['new_state' => 'PENDING_PAYMENT', 'payload' => ['order' => $order->reference, 'interval' => $data['interval'], 'mandatory_actions' => 3]]);
        $request->session()->forget("sub_disclosure.{$plan->slug}");

        return redirect()->route('checkout.show', $order);
    }

    /** Confirmation and first-period expectations; activates the subscription pull-style once paid. */
    public function confirmed(Request $request, Order $order): Response|RedirectResponse
    {
        abort_unless($order->section === 'subscriptions' && ($order->user_id === $request->user()->id || $request->user()->role === 'admin'), 404);

        $sub = Subscription::where('reference', $order->meta['subscription'] ?? '')->with('plan')->firstOrFail();

        if ($order->isPaid()) {
            Lifecycle::activateFromOrder($sub, $order);
            $sub->refresh()->load('plan');
        }

        return Inertia::render('Products/Subscriptions/Confirmed', [
            'order' => [
                'reference' => $order->reference,
                'status' => $order->status,
                'paid_at' => $order->paid_at?->toIso8601String(),
                'subtotal_zar' => $order->subtotal_zar,
                'vat_zar' => $order->vat_zar,
                'fees_zar' => $order->fees_zar,
                'total_zar' => $order->total_zar,
                'email' => $order->billing['email'] ?? $request->user()->email,
            ],
            'subscription' => $sub->toSummary(),
        ]);
    }
}
