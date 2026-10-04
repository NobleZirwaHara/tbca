<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Product;
use App\Models\Shop\RetainerProposal;
use App\Support\Platform\Reference;
use App\Support\Shop\Pricing;
use App\Support\Shop\ProductPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A4 Retainer Proposal Builder (OS-031). A retainer begins only after C1-C5,
 * capacity, pricing and contract approval; this flow creates the proposal
 * request with a computed, floor-respecting estimate. No payment is taken.
 */
class RetainerProposalController extends Controller
{
    public const STEPS = ['Scope & Needs', 'Allowance & C1-C5', 'Adviser & Capacity', 'Pricing & Proposal', 'Review & Submit'];

    public const OPTIONS = [
        'scopes' => ['Compliance & Regulatory Support', 'Legal Advisory', 'Risk Management', 'Tax Advisory', 'HR & Employment Advisory', 'Strategy & Board Advisory'],
        'industries' => ['Professional Services', 'Financial Services', 'Manufacturing', 'Agriculture', 'Mining', 'ICT', 'Healthcare', 'Retail', 'Public Sector'],
        'jurisdictions' => ['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Multi-jurisdiction'],
        'models' => [['value' => 'advisory_lead', 'label' => 'Advisory Lead', 'hint' => 'We lead, you approve'], ['value' => 'co_sourced', 'label' => 'Co-Sourced', 'hint' => 'We work together'], ['value' => 'on_demand', 'label' => 'Support On-Demand', 'hint' => 'As needed']],
        'communication' => ['Email', 'Monthly Review Meeting', 'Weekly Check-in', 'WhatsApp / Secure Chat'],
        'units' => ['HOUR', 'DELIVERABLE', 'TICKET'],
        'unused' => [['value' => 'forfeit', 'label' => 'Unused allowance lapses at period end'], ['value' => 'rollover_1', 'label' => 'Roll over up to 1 month']],
        'overage' => [['value' => 'billed_at_rate', 'label' => 'Billed at the agreed hourly rate'], ['value' => 'pre_approval', 'label' => 'Only with written pre-approval'], ['value' => 'blocked', 'label' => 'No overage (hard cap)']],
        'seniority' => [['value' => 'specialist', 'label' => 'Specialist'], ['value' => 'senior', 'label' => 'Senior Adviser'], ['value' => 'partner', 'label' => 'Partner-Level']],
        'owner_models' => [['value' => 'NAMED_PERSON', 'label' => 'Named person'], ['value' => 'DEFINED_ROLE', 'label' => 'Defined role'], ['value' => 'TEAM', 'label' => 'Team']],
        'slas' => ['24 hours', '48 hours', '72 hours'],
        'terms' => [3, 6, 12, 24],
    ];

    private function draft(Request $request): RetainerProposal
    {
        $id = $request->session()->get('shop.proposal_id');
        $proposal = $id ? RetainerProposal::query()->where('status', 'draft')->find($id) : null;

        if (! $proposal) {
            $proposal = RetainerProposal::create([
                'reference' => Reference::make('RTP'),
                'user_id' => $request->user()?->id,
                'session_token' => $request->session()->getId(),
                'step' => 1,
                'data' => [],
            ]);
            $request->session()->put('shop.proposal_id', $proposal->id);
        }

        return $proposal;
    }

    public static function readiness(array $d): array
    {
        return [
            'C1' => ! empty($d['allowance']),
            'C2' => ! empty($d['scope_bounds']),
            'C3' => ! empty($d['owner_model']),
            'C4' => ! empty($d['unused']),
            'C5' => ! empty($d['overage']),
        ];
    }

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        $proposal = $this->draft($request);
        if ($slug = $request->query('product')) {
            $product = Product::query()->where('slug', $slug)->where('act', 'A4')->first();
            $tier = collect($product?->variants['commitments'] ?? [])->firstWhere('key', $request->query('tier'));
            if ($product) {
                $proposal->update(['product_id' => $product->id, 'data' => [...($proposal->data ?? []), ...($tier ? ['allowance' => $tier['hours'], 'tier' => $tier['key']] : [])]]);
            }
        }
        if ($step > $proposal->step) {
            return redirect()->route('shop.proposal', $proposal->step);
        }

        $d = $proposal->data ?? [];
        $user = $request->user();

        return Inertia::render('Shop/RetainerProposal', [
            'proposal' => ['reference' => $proposal->reference, 'step' => $proposal->step, 'data' => [
                'start_date' => now()->addMonth()->startOfMonth()->toDateString(), 'industry' => 'Professional Services', 'jurisdiction' => 'South Africa',
                'entities' => 1, 'engagement_model' => 'advisory_lead', 'communication' => ['Email', 'Monthly Review Meeting'], 'unit' => 'HOUR',
                'seniority' => 'senior', 'owner_model' => 'NAMED_PERSON', 'response_sla' => '48 hours', 'term_months' => 3,
                'contact_name' => $user?->name, 'contact_email' => $user?->email, ...$d,
            ]],
            'product' => $proposal->product_id ? ProductPresenter::card(Product::find($proposal->product_id)) : null,
            'estimate' => ! empty($d['allowance']) ? Pricing::retainerEstimate($d) : null,
            'rates' => Pricing::RETAINER_RATES,
            'readiness' => self::readiness($d),
            'step' => $step,
            'steps' => self::STEPS,
            'options' => self::OPTIONS,
        ]);
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        $proposal = $this->draft($request);

        $data = match ($step) {
            1 => $request->validate([
                'scope' => ['required', 'array', 'min:1'], 'scope.*' => ['string', 'max:80'],
                'scope_other' => ['nullable', 'string', 'max:200'],
                'start_date' => ['required', 'date', 'after_or_equal:today'],
                'objectives' => ['required', 'string', 'min:10', 'max:1500'],
                'industry' => ['required', 'string', 'max:60'],
                'jurisdiction' => ['required', 'string', 'max:60'],
                'entities' => ['required', 'integer', 'min:1', 'max:20'],
                'engagement_model' => ['required', 'in:advisory_lead,co_sourced,on_demand'],
                'communication' => ['required', 'array', 'min:1'], 'communication.*' => ['string', 'max:40'],
            ]),
            2 => $request->validate([
                'allowance' => ['required', 'numeric', 'min:5', 'max:160'],
                'unit' => ['required', 'in:HOUR,DELIVERABLE,TICKET'],
                'scope_bounds' => ['required', 'string', 'min:10', 'max:1000'],
                'exclusions' => ['nullable', 'string', 'max:1000'],
                'unused' => ['required', 'in:forfeit,rollover_1'],
                'overage' => ['required', 'in:billed_at_rate,pre_approval,blocked'],
            ]),
            3 => $request->validate([
                'seniority' => ['required', 'in:specialist,senior,partner'],
                'owner_model' => ['required', 'in:NAMED_PERSON,DEFINED_ROLE,TEAM'],
                'preferred_adviser' => ['nullable', 'string', 'max:120'],
                'response_sla' => ['required', 'string', 'max:20'],
                'term_months' => ['required', 'integer', 'in:3,6,12,24'],
            ]),
            4 => $request->validate([
                'accept_estimate' => ['accepted'],
                'budget_note' => ['nullable', 'string', 'max:500'],
            ]),
            5 => $request->validate([
                'contact_name' => ['required', 'string', 'max:120'],
                'contact_email' => ['required', 'email', 'max:190'],
                'contact_phone' => ['nullable', 'string', 'max:30'],
                'confirm' => ['accepted'],
            ]),
            default => abort(404),
        };

        $merged = [...($proposal->data ?? []), ...$data];
        unset($merged['confirm']);

        if ($step === 5) {
            abort_if($proposal->step < 5, 409);
            $proposal->update([
                'data' => $merged,
                'estimated_monthly_zar' => Pricing::retainerEstimate($merged),
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);
            $request->session()->forget('shop.proposal_id');

            return redirect()->route('shop.proposal.submitted', $proposal);
        }

        $proposal->update([
            'data' => $merged,
            'step' => max($proposal->step, $step + 1),
            'estimated_monthly_zar' => ! empty($merged['allowance']) ? Pricing::retainerEstimate($merged) : null,
        ]);

        return redirect()->route('shop.proposal', $step + 1);
    }

    public function submitted(RetainerProposal $proposal): Response
    {
        abort_if($proposal->status === 'draft', 404);

        return Inertia::render('Shop/Submitted', [
            'kind' => 'proposal',
            'title' => 'Proposal Request Submitted',
            'reference' => $proposal->reference,
            'heading' => 'Custom Retainer Proposal',
            'statement' => 'Submitting this request does not start a Retainer and no payment is taken now. A Retainer begins only after C1-C5, capacity, pricing and contract approval.',
            'estimate' => $proposal->estimated_monthly_zar,
            'next' => [
                ['Capacity check', "We'll confirm adviser availability and suitability."],
                ['Tailored proposal', 'Receive your tailored proposal and pricing.'],
                ['Contract approval', 'Review and approve; your retainer then starts on the agreed date.'],
            ],
            'status' => $proposal->status,
        ]);
    }
}
