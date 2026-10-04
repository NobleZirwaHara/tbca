<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Mandate;
use App\Models\Shop\Product;
use App\Support\Platform\Checkout;
use App\Support\Platform\Money;
use App\Support\Shop\ProductPresenter;
use App\Support\Shop\Reconciler;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A3 Subscription Mandate Capture (OS-030). A recurring commitment requires
 * R1-R5 certification and an explicit mandate before the first charge
 * (blueprint 9.5); the first month is then paid through the shared checkout.
 */
class MandateController extends Controller
{
    public const CONSENTS = [
        'until_cancelled' => 'This authorisation will remain in effect until cancelled.',
        'cancel_notice' => "I may cancel this mandate at any time with 1 business day's notice.",
        'period_end' => 'Cancellation will take effect at the end of the current billing period.',
        'suspension' => 'Failed payments may result in suspension as per the Subscription Terms.',
        'authorised' => 'I confirm I am the account holder or duly authorised.',
    ];

    private function resolve(Request $request): array
    {
        $product = Product::query()->where('slug', $request->input('product', $request->query('product')))->firstOrFail();
        $plans = collect($product->variants['plans'] ?? []);
        $plan = $plans->firstWhere('key', $request->input('plan', $request->query('plan'))) ?? $plans->first();
        abort_if(! $plan, 404);

        return [$product, $plan];
    }

    public function show(Request $request): Response|RedirectResponse
    {
        [$product, $plan] = $this->resolve($request);
        if (! $product->isCertifiedSubscription() || ! $product->isPurchasable()) {
            return redirect($product->url())->with('error', 'Recurring purchase is not yet enabled for this subscription. No mandate can be created.');
        }

        $start = Carbon::now()->addMonthNoOverflow()->startOfMonth();
        $user = $request->user();

        return Inertia::render('Shop/Mandate', [
            'product' => ProductPresenter::detail($product),
            'plan' => $plan,
            'amounts' => ['excl' => $plan['zar'], 'vat' => round($plan['zar'] * 0.15, 2), 'incl' => round($plan['zar'] * 1.15, 2), 'first' => Money::totals($plan['zar'])],
            'nextBilling' => $start->toDateString(),
            'previewReference' => sprintf('MD-%s-%04d', now()->format('Y-m-d'), Mandate::query()->count() + 7821),
            'consents' => self::CONSENTS,
            'defaults' => ['account_holder' => $user?->name, 'email' => $user?->email, 'start_date' => $start->toDateString()],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        [$product, $plan] = $this->resolve($request);
        abort_unless($product->isCertifiedSubscription() && $product->isPurchasable(), 422, 'Recurring purchase is not enabled for this subscription.');

        $data = $request->validate([
            'account_holder' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'start_date' => ['required', 'date', 'after:today'],
            'method' => ['required', 'in:card'],
            'consents' => ['required', 'array'],
            ...collect(self::CONSENTS)->mapWithKeys(fn ($v, $k) => ["consents.{$k}" => ['accepted']])->all(),
            'accept_terms' => ['accepted'],
        ], ['consents.*.accepted' => 'Each mandate statement must be accepted.']);

        $start = Carbon::parse($data['start_date']);
        $mandate = Mandate::create([
            'reference' => sprintf('MD-%s-%04d', now()->format('Y-m-d'), Mandate::query()->count() + 7821),
            'user_id' => $request->user()?->id,
            'product_id' => $product->id,
            'plan' => $plan['name'],
            'amount_zar' => $plan['zar'],
            'account_holder' => $data['account_holder'],
            'email' => $data['email'],
            'start_date' => $start,
            'billing_day' => min(28, $start->day),
            'method' => 'card',
            'consents' => array_keys(self::CONSENTS),
            'status' => 'pending_payment',
        ]);

        $order = Checkout::createOrder([[
            'item_type' => 'subscription',
            'item_code' => $product->code,
            'name' => $product->name,
            'variant' => $plan['name'],
            'unit_zar' => $plan['zar'],
            'quantity' => 1,
            'meta' => ['slug' => $product->slug, 'mandate' => $mandate->reference, 'act' => 'A3', 'licence' => $plan['licence'] ?? null],
        ]], $request->user(), 'shop', [
            'title' => "{$product->name} - first billing period",
            'mandate' => $mandate->reference,
            'return_url' => route('shop.mandate.activate', $mandate),
        ]);
        $mandate->update(['order_id' => $order->id]);

        return redirect()->route('checkout.show', $order);
    }

    public function activate(Mandate $mandate): RedirectResponse
    {
        $order = $mandate->order;
        abort_if(! $order, 404);

        if (! $order->isPaid()) {
            return redirect()->route('checkout.show', $order)->with('error', 'Your first payment has not been confirmed yet.');
        }

        if ($mandate->status !== 'active') {
            $mandate->update(['status' => 'active', 'activated_at' => now()]);
        }
        Reconciler::reconcile($order);

        return redirect()->route('shop.entitlements', $order)->with('success', "Mandate {$mandate->reference} captured and your subscription is active.");
    }
}
