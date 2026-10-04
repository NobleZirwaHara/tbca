<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Product;
use App\Models\Submission;
use App\Support\Platform\Reference;
use App\Support\Shop\ProductPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A6 Quote Request journey (OS-015): Your Requirements -> Engagement Details ->
 * Review & Submit -> Confirmation. Progress is held server-side in the session;
 * the final step persists a quote-request submission (a request object, not an order).
 */
class QuoteRequestController extends Controller
{
    public const STEPS = ['Your Requirements', 'Engagement Details', 'Review & Submit', 'Confirmation'];

    public const OPTIONS = [
        'engagement_types' => ['Due Diligence', 'Advisory', 'Compliance Review', 'Valuation', 'Implementation'],
        'client_types' => ['Private Company', 'Listed Company', 'Public Entity', 'NGO / Non-profit', 'Investor / Fund', 'Individual'],
        'scopes' => ['Small', 'Medium', 'Large', 'Not sure'],
        'industries' => ['Financial Services', 'Manufacturing', 'Agriculture', 'Mining', 'Energy', 'ICT', 'Healthcare', 'Retail', 'Professional Services', 'Public Sector'],
        'countries' => ['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Zambia', 'Zimbabwe', 'Mozambique', 'Tanzania', 'Uganda', 'Rwanda'],
        'budgets' => ['Under ZAR 50,000', 'ZAR 50,000 - ZAR 250,000', 'ZAR 250,000 - ZAR 500,000', 'ZAR 500,000 - ZAR 1,000,000', 'Over ZAR 1,000,000', 'Not sure'],
        'timelines' => ['1 - 2 Weeks', '2 - 4 Weeks', '4 - 6 Weeks', '6 - 12 Weeks', '3+ Months'],
    ];

    private function key(Product $product): string
    {
        return "shop.quote_request.{$product->slug}";
    }

    public function show(Request $request, Product $product, int $step = 1): Response|RedirectResponse
    {
        abort_if($product->act !== 'A6' || $product->status !== 'active', 404);

        $state = $request->session()->get($this->key($product), ['data' => [], 'done' => 0]);
        if ($step === 4) {
            $reference = $request->session()->get('shop.quote_request.reference');
            if (! $reference) {
                return redirect()->route('shop.quote-request', $product);
            }
        } elseif ($step > $state['done'] + 1) {
            return redirect()->route('shop.quote-request', [$product, $state['done'] + 1]);
        }

        $user = $request->user();
        $defaults = [
            'title' => $product->name, 'engagement_type' => 'Due Diligence', 'client_type' => 'Private Company', 'scope' => 'Medium',
            'country' => 'South Africa', 'timeline' => '4 - 6 Weeks', 'contact_name' => $user?->name, 'contact_email' => $user?->email, 'contact_phone' => $user?->phone,
            'company' => $user?->company,
        ];

        return Inertia::render('Shop/QuoteRequest', [
            'product' => ProductPresenter::detail($product),
            'step' => $step,
            'steps' => self::STEPS,
            'data' => [...$defaults, ...$state['data']],
            'options' => self::OPTIONS,
            'reference' => $step === 4 ? $request->session()->get('shop.quote_request.reference') : null,
        ]);
    }

    public function store(Request $request, Product $product, int $step): RedirectResponse
    {
        abort_if($product->act !== 'A6', 404);
        $key = $this->key($product);
        $state = $request->session()->get($key, ['data' => [], 'done' => 0]);

        if ($step === 1) {
            $data = $request->validate([
                'title' => ['required', 'string', 'max:190'],
                'engagement_type' => ['required', 'string', 'max:60'],
                'help' => ['required', 'string', 'min:20', 'max:2000'],
                'client_type' => ['required', 'string', 'max:60'],
                'scope' => ['nullable', 'string', 'max:30'],
                'industry' => ['required', 'string', 'max:60'],
                'country' => ['required', 'string', 'max:60'],
                'budget' => ['nullable', 'string', 'max:60'],
                'start_date' => ['nullable', 'date', 'after_or_equal:today'],
                'timeline' => ['nullable', 'string', 'max:30'],
                'files' => ['nullable', 'array', 'max:5'],
                'files.*' => ['file', 'max:20480', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip'],
            ]);
            $names = $state['data']['file_names'] ?? [];
            foreach ($request->file('files', []) as $file) {
                $file->store('shop/quote-requests', 'local');
                $names[] = $file->getClientOriginalName();
            }
            unset($data['files']);
            $data['file_names'] = $names;
        } elseif ($step === 2) {
            $data = $request->validate([
                'deliverables' => ['required', 'string', 'max:2000'],
                'entities' => ['required', 'integer', 'min:1', 'max:200'],
                'data_room' => ['required', 'in:yes,no'],
                'deadline' => ['nullable', 'date', 'after_or_equal:today'],
                'contact_name' => ['required', 'string', 'max:120'],
                'contact_email' => ['required', 'email', 'max:190'],
                'contact_phone' => ['nullable', 'string', 'max:30'],
                'company' => ['nullable', 'string', 'max:190'],
            ]);
        } else {
            abort_if($state['done'] < 2, 409);
            $request->validate(['confirm' => ['accepted']]);
            $d = $state['data'];
            $submission = Submission::create([
                'reference' => Reference::make('QTR'),
                'user_id' => $request->user()?->id,
                'type' => 'quote-request',
                'section' => 'shop',
                'subject' => $d['title'],
                'name' => $d['contact_name'],
                'email' => $d['contact_email'],
                'payload' => ['product' => $product->slug, 'code' => $product->code, ...collect($d)->except(['contact_name', 'contact_email'])->all()],
            ]);
            $request->session()->forget($key);
            $request->session()->put('shop.quote_request.reference', $submission->reference);

            return redirect()->route('shop.quote-request', [$product, 4]);
        }

        $request->session()->put($key, ['data' => [...$state['data'], ...$data], 'done' => max($state['done'], $step)]);

        return redirect()->route('shop.quote-request', [$product, $step + 1]);
    }
}
