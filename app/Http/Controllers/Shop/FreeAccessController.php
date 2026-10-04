<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Entitlement;
use App\Models\Shop\Product;
use App\Support\Platform\Reference;
use App\Support\Shop\ProductPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A7 Free Entitlement Activation (OS-034). Free access is issued under
 * APPROVED_FREE_BASIS after an eligibility check; no payment method is taken
 * and a duplicate active entitlement for the same email is never re-issued.
 */
class FreeAccessController extends Controller
{
    public const ELIGIBLE_COUNTRIES = ['South Africa'];

    public const OPTIONS = [
        'countries' => ['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Other'],
        'business_types' => [
            ['value' => 'micro', 'label' => 'Micro Business (1 - 10 employees)', 'eligible' => true],
            ['value' => 'small', 'label' => 'Small Business (1 - 50 employees)', 'eligible' => true],
            ['value' => 'medium', 'label' => 'Medium Business (51 - 200 employees)', 'eligible' => false],
            ['value' => 'large', 'label' => 'Large Enterprise (200+ employees)', 'eligible' => false],
        ],
        'turnovers' => [
            ['value' => '0-50m', 'label' => 'ZAR 0 - ZAR 50 Million', 'eligible' => true],
            ['value' => '50-200m', 'label' => 'ZAR 50 - ZAR 200 Million', 'eligible' => false],
            ['value' => '200m+', 'label' => 'Over ZAR 200 Million', 'eligible' => false],
        ],
        'heard' => ['Google Search', 'LinkedIn', 'Referral', 'Event or Webinar', 'TBCA Newsletter', 'Other'],
    ];

    public static function eligible(array $d): bool
    {
        $type = collect(self::OPTIONS['business_types'])->firstWhere('value', $d['business_type'] ?? null);
        $turnover = collect(self::OPTIONS['turnovers'])->firstWhere('value', $d['turnover'] ?? null);

        return in_array($d['country'] ?? null, self::ELIGIBLE_COUNTRIES, true) && ($type['eligible'] ?? false) && ($turnover['eligible'] ?? true);
    }

    private function product(Product $product): void
    {
        abort_if($product->act !== 'A7' || $product->status !== 'active', 404);
    }

    public function show(Request $request, Product $product): Response
    {
        $this->product($product);
        $user = $request->user();

        return Inertia::render('Shop/FreeActivation', [
            'product' => ProductPresenter::detail($product),
            'options' => self::OPTIONS,
            'eligibleCountries' => self::ELIGIBLE_COUNTRIES,
            'defaults' => ['country' => 'South Africa', 'business_type' => 'small', 'turnover' => '0-50m', 'full_name' => $user?->name, 'email' => $user?->email,
                'company' => $user?->company, 'phone' => $user?->phone, 'heard' => 'Google Search'],
        ]);
    }

    public function store(Request $request, Product $product): RedirectResponse
    {
        $this->product($product);
        abort_unless($product->isPurchasable(), 422, 'This free resource is not currently available.');

        $data = $request->validate([
            'country' => ['required', 'string', 'max:60'],
            'business_type' => ['required', 'in:micro,small,medium,large'],
            'turnover' => ['nullable', 'in:0-50m,50-200m,200m+'],
            'full_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'company' => ['required', 'string', 'max:190'],
            'phone' => ['required', 'string', 'max:30'],
            'heard' => ['nullable', 'string', 'max:60'],
        ]);

        if (! self::eligible($data)) {
            return back()->withErrors(['eligibility' => 'This free resource is available to qualifying small businesses in South Africa. You can still explore our paid diagnostics.'])->withInput();
        }

        $existing = Entitlement::query()->where('product_id', $product->id)->where('email', $data['email'])->where('status', 'active')
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', now()))->first();

        $entitlement = $existing ?? Entitlement::create([
            'reference' => Reference::make('ENT'),
            'user_id' => $request->user()?->id,
            'product_id' => $product->id,
            'name' => $product->contentValue('entitlement_name', $product->name),
            'item_code' => $product->code,
            'type' => "{$product->vehicle} ({$product->vehicle_code})",
            'authority' => 'APPROVED_FREE_BASIS',
            'status' => 'active',
            'email' => $data['email'],
            'starts_at' => now(),
            'ends_at' => now()->addDays((int) $product->contentValue('validity_days', 30)),
            'meta' => collect($data)->except(['email'])->all(),
        ]);

        return redirect()->route('shop.free.ready', [$product, $entitlement->reference])
            ->with('success', $existing ? 'You already have active access to this resource.' : 'Your free access is active.');
    }

    public function ready(Product $product, string $reference): Response
    {
        $this->product($product);
        $entitlement = Entitlement::query()->where('reference', $reference)->where('product_id', $product->id)->firstOrFail();

        return Inertia::render('Shop/Submitted', [
            'kind' => 'free',
            'title' => "You're Ready!",
            'reference' => $entitlement->reference,
            'heading' => $entitlement->name,
            'statement' => 'Free access uses Approved Free Basis. Any later paid product is a separate commercial commitment.',
            'next' => [
                ['Start Diagnostic', "You'll be redirected to begin your assessment."],
                ['Get Your Report', 'Receive your personalised results and insights.'],
                ['Take Action', 'Access resources and recommendations.'],
            ],
            'status' => $entitlement->status,
            'validUntil' => $entitlement->ends_at?->toDateString(),
            'cta' => ['label' => 'Start Your Free Health Check', 'href' => '/diagnostics'],
        ]);
    }
}
