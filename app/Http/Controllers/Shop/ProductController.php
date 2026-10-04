<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\SavedItem;
use App\Models\Shop\Handoff;
use App\Models\Shop\Product;
use App\Models\Submission;
use App\Support\Platform\Reference;
use App\Support\Shop\Audit;
use App\Support\Shop\Pricing;
use App\Support\Shop\ProductPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Product page templates A1-A7 with their tabs (delivery, why, related),
 * the tier/variant configurator, the licence & intended-use selector and the
 * honest not-purchasable state.
 */
class ProductController extends Controller
{
    private function visible(Product $product): void
    {
        abort_if($product->status !== 'active' || $product->listing_state === 'LS-06', 404);
    }

    private function saved(Request $request, Product $product): bool
    {
        $user = $request->user();

        return $user && SavedItem::query()->where('user_id', $user->id)->where('item_type', 'shop-product')->where('item_key', $product->slug)->exists();
    }

    public function show(Request $request, Product $product): Response|RedirectResponse
    {
        $this->visible($product);

        if ($product->act === 'A6' && $product->listing_state !== 'LS-05') {
            return redirect()->route('shop.quote-request', $product);
        }

        return Inertia::render('Shop/Product', [
            'product' => ProductPresenter::detail($product),
            'tab' => $request->query('tab', 'overview'),
            'saved' => $this->saved($request, $product),
        ]);
    }

    public function configure(Request $request, Product $product): Response|RedirectResponse
    {
        $this->visible($product);
        if (empty($product->variants['tiers'])) {
            return redirect($product->url());
        }

        return Inertia::render('Shop/Configure', [
            'product' => ProductPresenter::detail($product),
            'saved' => $this->saved($request, $product),
        ]);
    }

    public function licence(Request $request, Product $product): Response|RedirectResponse
    {
        $this->visible($product);
        if (empty($product->variants['licences'])) {
            return redirect($product->url());
        }

        return Inertia::render('Shop/Licence', [
            'product' => ProductPresenter::detail($product),
            'uses' => collect(Pricing::INTENDED_USES)->map(fn ($u, $k) => ['key' => $k, ...$u])->values(),
            'saved' => $this->saved($request, $product),
        ]);
    }

    /** "Request a Consultation" from the honest not-purchasable state: creates a handoff request. */
    public function consultation(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:190'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $submission = Submission::create([
            'reference' => Reference::make('CON'),
            'user_id' => $request->user()?->id,
            'type' => 'consultation-request',
            'section' => 'shop',
            'subject' => $product->name,
            'name' => $data['name'],
            'email' => $data['email'],
            'payload' => ['product' => $product->slug, 'phone' => $data['phone'] ?? null, 'company' => $data['company'] ?? null, 'message' => $data['message']],
        ]);

        $count = Handoff::query()->count() + 187;
        Handoff::create([
            'reference' => sprintf('HN-%s-%04d', now()->format('Y'), $count),
            'product_id' => $product->id,
            'sprint_code' => $product->sprint_code ?? $product->code,
            'product_name' => $product->name,
            'vehicle' => "{$product->vehicle_code} {$product->vehicle}",
            'act' => $product->actLabel(),
            'stage' => 'boundary_check',
            'risk' => 'low',
            'boundary' => 'pending_review',
            'client_name' => $data['name'],
            'client_email' => $data['email'],
            'notes' => $data['message'],
            'sla_due' => now()->addWeekday()->toDateString(),
        ]);
        Audit::log('handoff', $product->code, "Consultation requested by {$data['name']}");

        return back()->with('success', 'Consultation requested. A TBCA advisor will contact you within 1 business day.')->with('reference', $submission->reference);
    }
}
