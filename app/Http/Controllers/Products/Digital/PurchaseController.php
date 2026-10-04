<?php

namespace App\Http\Controllers\Products\Digital;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpProduct;
use App\Models\Products\Digital\DpVersion;
use App\Support\Platform\Checkout;
use App\Support\Platform\Money;
use App\Support\Products\Digital\Artefact;
use App\Support\Products\Digital\Audit;
use App\Support\Products\Digital\Entitlements;
use App\Support\Products\Digital\Licences;
use App\Support\Products\Digital\Presenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Buyer journey B2–B6: Licence -> Options -> Disclosure -> Checkout -> Payment -> Confirmation.
 * Progress is kept in the session ("dp_purchase"); the final manifest is frozen
 * into the order line and the pending entitlement (GATE-DP-14).
 */
class PurchaseController extends Controller
{
    public const STEPS = ['Licence', 'Options', 'Disclosure', 'Checkout', 'Payment', 'Confirmation'];
    public const TERMS_VERSION = 'v1.1';
    public const PRIVACY_VERSION = 'v1.0';
    public const DISCLOSURE_VERSION = 'RDP-v2.0';

    /* ---- Step 1: licence ------------------------------------------------ */

    public function licence(Request $request, DpProduct $product): Response|RedirectResponse
    {
        if ($redirect = $this->guardPurchasable($product)) {
            return $redirect;
        }

        $state = $this->state($request, $product);
        $use = $state['use'] ?? 'organisation';

        return Inertia::render('Products/Digital/Purchase/Licence', [
            'product' => Presenter::detail($product->load('versions')),
            'licences' => collect(Licences::all())->map(fn ($l, $code) => [
                ...$l,
                'price' => ($product->prices ?? [])[$code] ?? null,
                'permitted' => $code === 'L5' || ! empty(($product->prices ?? [])[$code]),
            ])->values(),
            'uses' => Licences::declaredUses(),
            'adequacy' => collect(Licences::declaredUses())->mapWithKeys(fn ($u) => [
                $u['key'] => collect(Licences::CLASSES)->mapWithKeys(fn ($c) => [$c => Licences::isAdequate($c, $u['key'])]),
            ]),
            'selection' => ['use' => $use, 'licence' => $state['licence'] ?? Licences::recommendedFor($use)],
        ]);
    }

    public function licenceStore(Request $request, DpProduct $product): RedirectResponse
    {
        if ($redirect = $this->guardPurchasable($product)) {
            return $redirect;
        }

        $data = $request->validate([
            'use' => ['required', Rule::in(array_column(Licences::declaredUses(), 'key'))],
            'licence' => ['required', Rule::in(['L1', 'L2', 'L3', 'L4'])],
        ], ['licence.in' => 'L5 white-label / resale requires a separate rights review. Use "Request Review" instead.']);

        $price = ($product->prices ?? [])[$data['licence']] ?? null;
        if (! $price) {
            throw ValidationException::withMessages(['licence' => "{$data['licence']} is not available for this product."]);
        }
        if (! Licences::isAdequate($data['licence'], $data['use'])) {
            throw ValidationException::withMessages(['licence' => Licences::label($data['licence']).' does not cover your declared use. Choose '.Licences::recommendedFor($data['use']).' or higher.']);
        }

        $request->session()->put('dp_purchase', [
            'product' => $product->slug,
            'use' => $data['use'],
            'licence' => $data['licence'],
            'price' => (int) $price,
        ]);

        return redirect()->route('products.digital.options', $product);
    }

    /* ---- Step 2: version, format, language ------------------------------ */

    public function options(Request $request, DpProduct $product): Response|RedirectResponse
    {
        $state = $this->state($request, $product);
        if (! isset($state['licence'])) {
            return redirect()->route('products.digital.licence', $product)->with('error', 'Choose a licence first.');
        }

        $product->load('versions');

        return Inertia::render('Products/Digital/Purchase/Options', [
            'product' => Presenter::detail($product),
            'versions' => $product->versions->whereNotIn('status', ['draft', 'qa'])->sortByDesc('released_at')->values()->map(fn (DpVersion $v) => [
                ...Presenter::version($v),
                'selectable' => in_array($v->status, ['current', 'superseded'], true),
                'note' => [
                    'current' => 'Most up to date', 'superseded' => 'Superseded – safe', 'historical' => 'Historical – not current',
                    'archived' => 'Archived – use current', 'withdrawn_unsafe' => 'Withdrawn – unsafe',
                ][$v->status] ?? $v->status,
            ]),
            'selection' => [
                'licence' => $state['licence'],
                'licenceLabel' => Licences::label($state['licence']),
                'price' => $state['price'],
                'version_id' => $state['version_id'] ?? $product->currentVersion()?->id,
                'format' => $state['format'] ?? $product->primary_format,
                'language' => $state['language'] ?? 'EN',
            ],
        ]);
    }

    public function optionsStore(Request $request, DpProduct $product): RedirectResponse
    {
        $state = $this->state($request, $product);
        if (! isset($state['licence'])) {
            return redirect()->route('products.digital.licence', $product);
        }

        $data = $request->validate([
            'version_id' => ['required', 'integer'],
            'format' => ['required', Rule::in(collect($product->formats)->pluck('code')->all())],
            'language' => ['required', 'string', 'size:2'],
        ]);

        $version = $product->versions()->find($data['version_id']);
        if (! $version || ! in_array($version->status, ['current', 'superseded'], true)) {
            throw ValidationException::withMessages(['version_id' => 'Only the current or a superseded-safe version can be supplied.']);
        }

        $language = collect($product->languages)->firstWhere('code', $data['language']);
        if (! $language || $language['state'] !== 'approved') {
            throw ValidationException::withMessages(['language' => ($language['label'] ?? 'That language').' is not approved for release yet (human review and legal clearance required).']);
        }

        $request->session()->put('dp_purchase', [...$state, ...$data, 'accepted' => false]);

        return redirect()->route('products.digital.disclosure', $product);
    }

    /* ---- Step 3: refund & download disclosure ---------------------------- */

    public function disclosure(Request $request, DpProduct $product): Response|RedirectResponse
    {
        $state = $this->state($request, $product);
        if (! isset($state['version_id'])) {
            return redirect()->route('products.digital.options', $product)->with('error', 'Choose a version, format and language first.');
        }

        return Inertia::render('Products/Digital/Purchase/Disclosure', [
            'product' => Presenter::detail($product->load('versions')),
            'summary' => $this->summary($product, $state),
            'accepted' => (bool) ($state['accepted'] ?? false),
        ]);
    }

    public function disclosureStore(Request $request, DpProduct $product): RedirectResponse
    {
        $state = $this->state($request, $product);
        if (! isset($state['version_id'])) {
            return redirect()->route('products.digital.options', $product);
        }

        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Please confirm you accept the refund and download terms to continue.']);

        $request->session()->put('dp_purchase', [
            ...$state,
            'accepted' => true,
            'accepted_at' => now()->toIso8601String(),
            'disclosure_version' => self::DISCLOSURE_VERSION,
            'terms_version' => self::TERMS_VERSION,
        ]);

        return redirect()->route('products.digital.checkout');
    }

    /* ---- Step 4: checkout & order review --------------------------------- */

    public function checkout(Request $request): Response|RedirectResponse
    {
        $state = $request->session()->get('dp_purchase');
        $product = $state ? DpProduct::with('versions')->where('slug', $state['product'])->first() : null;

        if (! $product) {
            return redirect()->route('products.digital.index')->with('error', 'Your checkout session has expired. Choose a product to start again.');
        }
        if (empty($state['accepted'])) {
            return redirect()->route('products.digital.disclosure', $product)->with('error', 'Please accept the refund and download disclosure first.');
        }

        $checkState = $this->checkoutState($product, $state);

        return Inertia::render('Products/Digital/Purchase/Checkout', [
            'product' => Presenter::detail($product),
            'summary' => $this->summary($product, $state),
            'totals' => Money::totals((int) (($product->prices ?? [])[$state['licence']] ?? $state['price'])),
            'state' => $checkState,
            'terms' => [
                ['label' => 'Refund & Download Disclosure', 'value' => 'Accepted'],
                ['label' => 'Terms & Conditions ('.self::TERMS_VERSION.')', 'value' => 'Accepted'],
                ['label' => 'Privacy Policy ('.self::PRIVACY_VERSION.')', 'value' => 'Accepted'],
                ['label' => 'VAT Treatment', 'value' => 'VAT-exclusive'],
                ['label' => 'Currency and Pricing Basis', 'value' => 'ZAR (Source Price)'],
                ['label' => 'Order will create a Digital Product entitlement', 'value' => 'Yes'],
                ['label' => 'Instant access after verified payment', 'value' => 'Yes'],
            ],
        ]);
    }

    public function placeOrder(Request $request): RedirectResponse
    {
        $state = $request->session()->get('dp_purchase');
        $product = $state ? DpProduct::with('versions')->where('slug', $state['product'])->first() : null;

        if (! $product || empty($state['accepted'])) {
            return redirect()->route('products.digital.index')->with('error', 'Your checkout session has expired.');
        }

        $checkState = $this->checkoutState($product, $state);
        if ($checkState !== 'READY_TO_PAY') {
            return redirect()->route('products.digital.checkout')->with('error', match ($checkState) {
                'PRICE_CHANGED' => 'The price changed since you selected your licence. Please review the new amount.',
                'PRODUCT_GATE_CHANGED' => 'This product is no longer available for purchase.',
                default => 'Your order cannot be placed yet.',
            });
        }

        $version = $product->versions->firstWhere('id', (int) $state['version_id']);
        $price = (int) $product->prices[$state['licence']];
        $user = $request->user();

        $manifest = [
            'section' => 'digital-products',
            'product' => $product->slug,
            'sku' => $product->sku,
            'product_id' => $product->code,
            'version_id' => $version->id,
            'version' => $version->version,
            'licence' => $state['licence'],
            'declared_use' => $state['use'],
            'format' => $state['format'],
            'language' => $state['language'],
            'jurisdiction' => $product->jurisdiction,
            'maintenance' => $product->maintenance_class,
            'updates' => $product->update_class,
            'support' => $product->support,
            'price_zar' => $price,
            'terms_version' => $state['terms_version'],
            'disclosure_version' => $state['disclosure_version'],
            'accepted_at' => $state['accepted_at'],
            'entity' => $user->company,
            'frozen_at' => now()->toIso8601String(),
        ];

        $order = Checkout::createOrder([[
            'item_type' => 'digital-product',
            'item_code' => "{$product->sku}:{$state['licence']}",
            'name' => $product->name,
            'variant' => sprintf('%s · %s · %s · %s', $state['licence'], $version->label(), $state['format'], $state['language']),
            'unit_zar' => $price,
            'meta' => $manifest,
        ]], $user, 'digital-products', ['title' => $product->name, 'return_url' => '/digital-products/order/__REF__/payment-status']);

        $order->update(['meta' => [...$order->meta, 'return_url' => route('products.digital.order.status', $order, false)]]);

        $entitlement = Entitlements::createPending($order->items()->first(), $order, $user);
        Audit::log('DP_CHECKOUT_FROZEN', $entitlement, ['order' => $order->reference, 'manifest' => $manifest]);

        $request->session()->forget('dp_purchase');

        return redirect()->route('checkout.show', $order);
    }

    /* ---- Steps 5 & 6: payment result and confirmation --------------------- */

    public function paymentStatus(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrder($request, $order);
        Entitlements::syncOrder($order);

        if ($order->isPaid()) {
            return redirect()->route('products.digital.order.confirmed', $order);
        }

        return Inertia::render('Products/Digital/Purchase/PaymentStatus', [
            'order' => $this->orderProps($order),
            'state' => match ($order->status) {
                'failed' => 'failed',
                default => $order->payments()->exists() ? 'processing' : 'awaiting',
            },
            'lastPayment' => $order->payments()->latest('id')->first(['reference', 'method', 'status', 'failure_reason', 'created_at']),
        ]);
    }

    public function confirmed(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrder($request, $order);
        Entitlements::syncOrder($order);

        if (! $order->isPaid()) {
            return redirect()->route('products.digital.order.status', $order);
        }

        $payment = $order->payments()->where('status', 'succeeded')->latest('id')->first();

        return Inertia::render('Products/Digital/Purchase/Confirmed', [
            'order' => $this->orderProps($order),
            'payment' => [
                'method' => $payment ? ($payment->method === 'card' ? ($payment->meta['brand'] ?? 'Card').' ending '.($payment->meta['last4'] ?? '••••') : strtoupper($payment->method)) : 'Recorded payment',
                'date' => ($order->paid_at ?? now())->format('d M Y H:i:s').' SAST',
            ],
            'email' => $order->billing['email'] ?? $request->user()->email,
        ]);
    }

    public function receipt(Request $request, Order $order): HttpResponse
    {
        $this->authorizeOrder($request, $order);
        abort_unless($order->isPaid(), 403, 'A receipt is available once payment is verified.');

        return response(Artefact::receipt($order->load('items')), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="Receipt_'.$order->reference.'.pdf"',
        ]);
    }

    /* ---- helpers --------------------------------------------------------- */

    private function guardPurchasable(DpProduct $product): ?RedirectResponse
    {
        abort_unless(in_array($product->lifecycle_status, ['live', 'withdrawn_hold'], true), 404);

        return $product->isPurchasable() && $product->versions()->where('status', 'current')->exists()
            ? null
            : redirect()->route('products.digital.show', $product)->with('error', 'This product is not available for purchase right now.');
    }

    /** Session state for this product; switching product restarts the journey. */
    private function state(Request $request, DpProduct $product): array
    {
        $state = $request->session()->get('dp_purchase', []);

        return ($state['product'] ?? null) === $product->slug ? $state : [];
    }

    /** Blueprint 14.4 checkout states. */
    private function checkoutState(DpProduct $product, array $state): string
    {
        $current = (int) (($product->prices ?? [])[$state['licence']] ?? 0);
        $version = $product->versions->firstWhere('id', (int) ($state['version_id'] ?? 0));

        return match (true) {
            ! $product->isPurchasable() => 'PRODUCT_GATE_CHANGED',
            ! $version || ! in_array($version->status, ['current', 'superseded'], true) => 'PRODUCT_GATE_CHANGED',
            $current !== (int) $state['price'] => 'PRICE_CHANGED',
            empty($state['accepted']) => 'DISCLOSURE_CHANGED',
            default => 'READY_TO_PAY',
        };
    }

    private function summary(DpProduct $product, array $state): array
    {
        $version = $product->versions->firstWhere('id', (int) ($state['version_id'] ?? 0)) ?? $product->currentVersion();
        $language = collect($product->languages)->firstWhere('code', $state['language'] ?? 'EN');

        return [
            'licence' => $state['licence'],
            'licenceLabel' => Licences::label($state['licence']),
            'use' => $state['use'] ?? null,
            'price' => (int) (($product->prices ?? [])[$state['licence']] ?? $state['price']),
            'version' => $version ? Presenter::versionLabel($version) : '—',
            'format' => $state['format'] ?? $product->primary_format,
            'language' => ($state['language'] ?? 'EN').' – '.($language['label'] ?? 'English'),
            'jurisdiction' => $product->jurisdiction,
            'verifiedAt' => $version?->verified_at?->format('d M Y'),
            'maintenance' => $product->maintenance_class === 'M3' ? 'Yes' : 'No',
            'updates' => $product->update_class === 'U0' ? 'No' : "Yes ({$product->update_months} months)",
            'support' => $product->support,
        ];
    }

    private function orderProps(Order $order): array
    {
        $order->loadMissing('items');
        $entitlements = DpEntitlement::with('product.versions', 'version', 'downloads')->where('order_id', $order->id)->get();

        return [
            'reference' => $order->reference,
            'status' => $order->status,
            'subtotal' => $order->subtotal_zar,
            'vat' => $order->vat_zar,
            'fees' => $order->fees_zar,
            'total' => $order->total_zar,
            'createdAt' => $order->created_at->format('d M Y H:i:s').' SAST',
            'paidAt' => $order->paid_at?->format('d M Y H:i:s'),
            'items' => $order->items->map(fn ($i) => ['name' => $i->name, 'variant' => $i->variant, 'unit' => $i->unit_zar]),
            'entitlements' => $entitlements->map(fn ($e) => Presenter::entitlement($e)),
            'checkoutUrl' => route('checkout.show', $order, false),
        ];
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user();
        abort_unless($order->user_id === $user->id || $user->isAdmin(), 403);
    }
}
