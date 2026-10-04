<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\Proposal;
use App\Models\Advisory\Recommendation;
use App\Support\Advisory\ServicesContent;
use App\Support\Advisory\VehicleResolver;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Vehicle Resolver (5 steps), Not-Sure-Which, Honest Decline, Choice Comparison and
 * Mandatory Partner Escalation. Answers are kept in the session until resolved,
 * then persisted as a Recommendation with its full ranked result.
 */
class ResolverController extends Controller
{
    private const KEY = 'adv_resolver';

    private function vocab(): array
    {
        return [
            'needs' => ServicesContent::needs(),
            'outcomes' => ServicesContent::outcomes(),
            'industries' => ServicesContent::industries(),
            'sizes' => ServicesContent::sizes(),
            'timings' => ServicesContent::timings(),
            'budgets' => array_map(fn ($b) => ['key' => $b['key'], 'label' => $b['label']], ServicesContent::budgets()),
            'countries' => ServicesContent::countries(),
        ];
    }

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        $answers = $request->session()->get(self::KEY, []);
        $done = (int) ($answers['_done'] ?? 0);
        if ($step > $done + 1) {
            return redirect()->route('adv.services.resolver', ['step' => $done + 1]);
        }
        if ($step >= 5) {
            return redirect()->route('adv.services.comparison', ['ref' => $answers['_ref'] ?? null]);
        }
        if ($request->query('need') && $step === 1) {
            $answers['need'] = $request->query('need');
        }

        return Inertia::render('Advisory/Services/Resolver', [
            'step' => $step,
            'answers' => $answers,
            ...$this->vocab(),
        ]);
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        $v = $this->vocab();
        $rules = match ($step) {
            1 => ['need' => ['required', Rule::in(array_column($v['needs'], 'key'))], 'description' => ['nullable', 'string', 'max:500']],
            2 => ['outcome' => ['required', Rule::in(array_column($v['outcomes'], 'key'))]],
            3 => ['industry' => ['required', Rule::in($v['industries'])], 'size' => ['required', Rule::in(array_column($v['sizes'], 'key'))], 'country' => ['required', Rule::in($v['countries'])], 'regulated' => ['required', Rule::in(['yes', 'no'])]],
            4 => ['timing' => ['required', Rule::in(array_column($v['timings'], 'key'))], 'budget' => ['required', Rule::in(array_column($v['budgets'], 'key'))]],
            default => abort(404),
        };
        $data = $request->validate($rules);
        $answers = array_merge($request->session()->get(self::KEY, []), $data);
        $answers['_done'] = max((int) ($answers['_done'] ?? 0), $step);

        if ($step === 4) {
            $reco = $this->persist($request, $answers, 'resolver');
            $answers['_ref'] = $reco->reference;
            $answers['_done'] = 5;
            $request->session()->put(self::KEY, $answers);

            return $this->route($reco);
        }
        $request->session()->put(self::KEY, $answers);

        return redirect()->route('adv.services.resolver', ['step' => $step + 1]);
    }

    private function persist(Request $request, array $answers, string $source): Recommendation
    {
        $clean = array_filter($answers, fn ($k) => ! str_starts_with($k, '_'), ARRAY_FILTER_USE_KEY);
        $result = VehicleResolver::resolve($clean);

        return Recommendation::create([
            'reference' => Reference::make('REC'),
            'user_id' => $request->user()?->id,
            'source' => $source,
            'outcome' => $result['outcome'],
            'answers' => $clean,
            'result' => $result,
        ]);
    }

    private function route(Recommendation $r): RedirectResponse
    {
        return match ($r->outcome) {
            'decline' => redirect()->route('adv.services.decline', ['ref' => $r->reference]),
            'escalate' => redirect()->route('adv.services.escalation', ['ref' => $r->reference]),
            default => redirect()->route('adv.services.comparison', ['ref' => $r->reference]),
        };
    }

    private function find(Request $request): ?Recommendation
    {
        $ref = $request->query('ref') ?: ($request->session()->get(self::KEY)['_ref'] ?? null);

        return $ref ? Recommendation::query()->where('reference', $ref)->first() : null;
    }

    public function comparison(Request $request): Response
    {
        $reco = $this->find($request);
        if (! $reco) {
            // Default illustrative comparison for a market-entry advisory need.
            $answers = ['need' => 'expert-advice', 'outcome' => 'plan', 'industry' => 'Engineering & Construction', 'size' => 'medium', 'country' => 'South Africa', 'regulated' => 'no', 'timing' => '3-6', 'budget' => 'unsure', 'description' => 'Get expert advice for entering the Egyptian renewable energy market.'];
            $result = VehicleResolver::resolve($answers);
        } else {
            $answers = $reco->answers;
            $result = $reco->result;
        }

        return Inertia::render('Advisory/Services/Comparison', [
            'reference' => $reco?->reference,
            'illustrative' => ! $reco,
            'answers' => $answers,
            'result' => $result,
            ...$this->vocab(),
        ]);
    }

    public function notSure(): Response
    {
        return Inertia::render('Advisory/Services/NotSure', [
            'challenges' => ServicesContent::challenges(),
            'industries' => ServicesContent::industries(),
            'stages' => ['Idea / pre-revenue', 'Start-up (0–2 years)', 'Growing SME', 'Established business', 'Large enterprise / group'],
            'timings' => ServicesContent::timings(),
        ]);
    }

    public function notSureStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'challenge' => ['required', Rule::in(array_column(ServicesContent::challenges(), 'key'))],
            'description' => ['nullable', 'string', 'max:1000'],
            'industry' => ['nullable', 'string', 'max:80'],
            'stage' => ['nullable', 'string', 'max:80'],
            'timing' => ['nullable', Rule::in(array_column(ServicesContent::timings(), 'key'))],
        ]);
        $c = collect(ServicesContent::challenges())->firstWhere('key', $data['challenge']);
        $size = match ($data['stage'] ?? '') {
            'Idea / pre-revenue', 'Start-up (0–2 years)' => 'micro',
            'Established business' => 'medium',
            'Large enterprise / group' => 'large',
            default => 'small',
        };
        $answers = [
            'need' => $c['need'], 'outcome' => $c['outcome'], 'industry' => ($data['industry'] ?? null) ?: 'Other', 'size' => $size,
            'country' => 'South Africa', 'regulated' => $data['challenge'] === 'due-diligence' && $size === 'large' ? 'yes' : 'no',
            'timing' => ($data['timing'] ?? null) ?: '1-3', 'budget' => 'unsure', 'description' => $data['description'] ?? $c['title'], 'challenge' => $c['key'],
        ];
        $reco = $this->persist($request, $answers, 'not-sure');
        $request->session()->put(self::KEY, [...$answers, '_done' => 5, '_ref' => $reco->reference]);

        return $this->route($reco);
    }

    public function decline(Request $request): Response
    {
        $reco = $request->query('ref') ? $this->find($request) : null;

        return Inertia::render('Advisory/Services/Decline', [
            'reference' => $reco?->reference,
            'result' => $reco?->result,
            'answers' => $reco?->answers,
            ...$this->vocab(),
        ]);
    }

    public function declineStore(Request $request): RedirectResponse
    {
        $v = $this->vocab();
        $data = $request->validate([
            'need' => ['required', Rule::in(array_column($v['needs'], 'key'))],
            'outcome' => ['required', Rule::in(array_column($v['outcomes'], 'key'))],
            'budget' => ['required', Rule::in(array_column($v['budgets'], 'key'))],
            'size' => ['required', Rule::in(array_column($v['sizes'], 'key'))],
            'timing' => ['required', Rule::in(array_column($v['timings'], 'key'))],
            'country' => ['required', Rule::in($v['countries'])],
            'regulated' => ['required', Rule::in(['yes', 'no'])],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);
        $reco = $this->persist($request, [...$data, 'industry' => 'Other'], 'honest-decline');

        return redirect()->route('adv.services.decline', ['ref' => $reco->reference]);
    }

    public function escalation(Request $request): Response
    {
        $reco = $this->find($request);
        $answers = $reco?->answers ?? ['size' => 'large', 'regulated' => 'yes'];

        return Inertia::render('Advisory/Services/Escalation', [
            'reference' => $reco?->reference,
            'reasons' => $reco?->result['escalation_reasons'] ?? VehicleResolver::escalationReasons($answers),
            'answers' => $answers,
        ]);
    }

    public function escalationStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'string', 'max:40'],
            'company' => ['nullable', 'string', 'max:160'],
            'recommendation' => ['nullable', 'string', 'max:40'],
            'preferred_time' => ['nullable', 'string', 'max:60'],
        ]);
        $p = Proposal::create([
            'reference' => Reference::make('ESC'), 'user_id' => $request->user()?->id, 'kind' => 'partner-escalation', 'status' => 'submitted',
            'name' => $data['name'], 'email' => $data['email'], 'company' => $data['company'] ?? null,
            'payload' => [...$data, 'cost' => 'No extra cost', 'response_sla' => 'Within 1 business day'],
        ]);

        return back()->with('success', 'A partner will call you within 1 business day.')->with('reference', $p->reference);
    }
}
