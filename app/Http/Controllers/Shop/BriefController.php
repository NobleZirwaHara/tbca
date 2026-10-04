<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Brief;
use App\Models\Shop\Product;
use App\Support\Platform\Reference;
use App\Support\Shop\ProductPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A5 Marketplace Brief (OS-014 / OS-032): a five-step structured brief saved as
 * a DB draft. Submitting does not appoint a provider or authorise payment.
 */
class BriefController extends Controller
{
    public const STEPS = ['Brief Details', 'Requirements', 'Documents', 'Provider Preferences', 'Review & Submit'];

    public const OPTIONS = [
        'categories' => ['Business Advisory', 'Technology Solutions', 'Finance & Valuation', 'Compliance & Legal Support', 'ESG & Sustainability', 'Marketing & Research'],
        'sub_categories' => ['Business Valuation', 'Cybersecurity & Information Security', 'ESG Reporting', 'Market Research', 'Financial Modelling', 'Process Improvement'],
        'project_types' => ['One-off Project', 'Phased Project', 'Ongoing Support'],
        'industries' => ['Manufacturing', 'Financial Services', 'Agriculture', 'Mining', 'Energy', 'ICT', 'Healthcare', 'Retail', 'Professional Services', 'Public Sector'],
        'countries' => ['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Zambia'],
        'value_bands' => ['Under ZAR 100,000', 'ZAR 100,000 - ZAR 250,000', 'ZAR 250,000 - ZAR 500,000', 'ZAR 500,000 - ZAR 1,000,000', 'Over ZAR 1,000,000'],
        'durations' => ['Under 2 Weeks', '2 - 4 Weeks', '1 - 3 Months', '3 - 6 Months', '6+ Months'],
        'outcomes' => ['Identify security vulnerabilities and risks', 'Provide actionable mitigation plan', 'Improve compliance posture', 'Independent valuation report', 'Investor-ready evidence pack'],
        'priorities' => ['Low', 'Medium', 'High', 'Urgent'],
        'provider_types' => ['Verified firm', 'Independent specialist', 'Either'],
        'locations' => ['Anywhere in South Africa', 'Same province', 'Same city', 'Pan-African'],
    ];

    private function draft(Request $request, bool $create = true): ?Brief
    {
        $id = $request->session()->get('shop.brief_id');
        $brief = $id ? Brief::query()->where('status', 'draft')->find($id) : null;

        if (! $brief && $create) {
            $brief = Brief::create([
                'reference' => Reference::make('BRF'),
                'user_id' => $request->user()?->id,
                'session_token' => $request->session()->getId(),
                'step' => 1,
                'data' => [],
            ]);
            $request->session()->put('shop.brief_id', $brief->id);
        }

        return $brief;
    }

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        $brief = $this->draft($request);
        if ($slug = $request->query('product')) {
            $product = Product::query()->where('slug', $slug)->where('act', 'A5')->first();
            if ($product && $brief->product_id !== $product->id) {
                $brief->update(['product_id' => $product->id, 'data' => [...($brief->data ?? []), 'title' => $brief->data['title'] ?? $product->name]]);
            }
        }
        if ($step > $brief->step) {
            return redirect()->route('shop.brief', $brief->step);
        }

        return Inertia::render('Shop/MarketplaceBrief', [
            'brief' => ['reference' => $brief->reference, 'status' => $brief->status, 'step' => $brief->step, 'data' => $brief->data ?? []],
            'product' => $brief->product_id ? ProductPresenter::card(Product::find($brief->product_id)) : null,
            'step' => $step,
            'steps' => self::STEPS,
            'options' => self::OPTIONS,
        ]);
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        $brief = $this->draft($request);
        if ($slug = $request->input('product')) {
            $product = Product::query()->where('slug', $slug)->where('act', 'A5')->first();
            $brief->product_id = $product?->id ?? $brief->product_id;
        }

        $data = match ($step) {
            1 => $request->validate([
                'title' => ['required', 'string', 'max:190'],
                'category' => ['required', 'string', 'max:80'],
                'sub_category' => ['nullable', 'string', 'max:80'],
                'project_type' => ['required', 'string', 'max:40'],
                'summary' => ['required', 'string', 'min:20', 'max:1000'],
                'industry' => ['required', 'string', 'max:60'],
                'country' => ['required', 'string', 'max:60'],
                'value_band' => ['nullable', 'string', 'max:60'],
                'start_date' => ['nullable', 'date', 'after_or_equal:today'],
                'duration' => ['nullable', 'string', 'max:30'],
                'delivery_location' => ['nullable', 'in:Remote,On-site,Hybrid'],
                'outcomes' => ['nullable', 'array'], 'outcomes.*' => ['string', 'max:120'],
                'outcome_other' => ['nullable', 'string', 'max:200'],
            ]),
            2 => $request->validate([
                'scope' => ['required', 'string', 'min:10', 'max:2000'],
                'budget' => ['required', 'string', 'max:60'],
                'priority' => ['required', 'string', 'max:20'],
                'compliance' => ['required', 'in:Yes,No'],
                'compliance_detail' => ['required_if:compliance,Yes', 'nullable', 'string', 'max:200'],
                'skills' => ['nullable', 'array', 'max:10'], 'skills.*' => ['string', 'max:60'],
                'tools' => ['nullable', 'string', 'max:200'],
            ]),
            3 => $this->documents($request, $brief),
            4 => $request->validate([
                'provider_type' => ['required', 'string', 'max:40'],
                'provider_location' => ['required', 'string', 'max:60'],
                'min_experience' => ['nullable', 'integer', 'min:0', 'max:40'],
                'nda_required' => ['nullable', 'boolean'],
                'max_proposals' => ['required', 'integer', 'min:1', 'max:10'],
                'proposal_deadline' => ['nullable', 'date', 'after_or_equal:today'],
            ]),
            5 => $request->validate(['confirm' => ['accepted']]),
            default => abort(404),
        };

        if ($step === 5) {
            abort_if($brief->step < 5, 409);
            $brief->update(['status' => 'submitted', 'submitted_at' => now(), 'title' => $brief->data['title'] ?? $brief->title]);
            $request->session()->forget('shop.brief_id');

            return redirect()->route('shop.brief.submitted', $brief);
        }

        $brief->fill([
            'data' => [...($brief->data ?? []), ...$data],
            'title' => $data['title'] ?? $brief->title,
            'step' => max($brief->step, $step + 1),
        ])->save();

        return redirect()->route('shop.brief', $step + 1);
    }

    private function documents(Request $request, Brief $brief): array
    {
        $request->validate(['files' => ['nullable', 'array', 'max:5'], 'files.*' => ['file', 'max:51200', 'mimes:pdf,docx,xlsx,pptx,zip']]);
        $names = $brief->data['documents'] ?? [];
        foreach ($request->file('files', []) as $file) {
            $file->store("shop/briefs/{$brief->reference}", 'local');
            $names[] = $file->getClientOriginalName();
        }

        return ['documents' => $names];
    }

    /** Save Draft keeps whatever has been typed without advancing. */
    public function saveDraft(Request $request): RedirectResponse
    {
        $brief = $this->draft($request);
        $fields = collect($request->except(['_token', 'files']))->filter(fn ($v) => is_string($v) || is_array($v))->all();
        $brief->update(['data' => [...($brief->data ?? []), ...$fields], 'title' => $fields['title'] ?? $brief->title]);

        return back()->with('success', 'Draft saved. You can return to it at any time.')->with('reference', $brief->reference);
    }

    public function discard(Request $request): RedirectResponse
    {
        $this->draft($request, false)?->update(['status' => 'discarded']);
        $request->session()->forget('shop.brief_id');

        return redirect('/shop')->with('success', 'Brief discarded.');
    }

    public function submitted(Brief $brief): Response
    {
        abort_if($brief->status === 'draft', 404);

        return Inertia::render('Shop/Submitted', [
            'kind' => 'brief',
            'title' => 'Brief Submitted',
            'reference' => $brief->reference,
            'heading' => $brief->title,
            'statement' => 'Submitting the brief does not appoint a provider, create an engagement or authorise payment.',
            'next' => [
                ['Provider Matching', "We'll match and notify relevant verified providers."],
                ['Proposals Received', 'Providers will submit their proposals and pricing.'],
                ['Review & Select', 'Review proposals and select your provider in your secure workspace.'],
            ],
            'status' => $brief->status,
        ]);
    }
}
