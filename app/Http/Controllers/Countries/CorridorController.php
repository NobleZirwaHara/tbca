<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use App\Support\Countries\CorridorResolver;
use App\Support\Countries\Present;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Corridors and six-ledger fee transparency (CT-035 to CT-048). */
class CorridorController extends Controller
{
    private function truth(): array
    {
        $all = Corridor::all();

        return [
            'sellable' => CorridorResolver::sellableCount(),
            'raw' => CorridorResolver::rawDirectionalTopology(),
            'with_evidence' => $all->where('evidence_items', '>', 0)->count(),
            'high_confidence' => $all->where('confidence_pct', '>=', 75)->count(),
            'tracked' => $all->count(),
            'activation_cost' => 12.8,
        ];
    }

    public function landing(Request $request): Response
    {
        $countries = Country::all()->keyBy('iso2');
        $q = Corridor::query();
        if ($s = $request->query('q')) {
            $q->where(fn ($w) => $w->where('to_name', 'like', "%{$s}%")->orWhere('from_name', 'like', "%{$s}%")->orWhere('group_name', 'like', "%{$s}%"));
        }
        if ($e = $request->query('evidence')) {
            $q->where('evidence_status', $e);
        }
        if ($c = $request->query('confidence')) {
            $q->whereBetween('confidence_pct', ['High' => [75, 100], 'Medium' => [50, 74], 'Low' => [0, 49]][$c] ?? [0, 100]);
        }

        return Inertia::render('Countries/Corridors/Landing', [
            'truth' => $this->truth(),
            'corridors' => $q->orderByDesc('confidence_pct')->get()->map(fn ($c) => Present::corridor($c, $countries)),
            'filters' => $request->only(['q', 'evidence', 'confidence']),
        ]);
    }

    public function selector(Request $request): Response
    {
        $countries = Country::all()->keyBy('iso2');
        $from = strtoupper($request->query('from', 'ZA'));
        $to = strtoupper((string) $request->query('to', ''));
        $q = Corridor::where('from_iso', $from);
        if ($to !== '') {
            $q->orderByRaw('to_iso = ? desc', [$to]);
        }
        if ($t = $request->query('type')) {
            $q->where('type', $t);
        }
        if ($e = $request->query('evidence')) {
            $q->where('evidence_status', $e);
        }
        if ($request->boolean('only_evidence')) {
            $q->where('evidence_items', '>', 0);
        }
        $sort = $request->query('sort', 'confidence');
        $q->orderByDesc($sort === 'cost' ? 'cost_min_zar' : 'confidence_pct');
        $rows = $q->get()->map(fn ($c) => Present::corridor($c, $countries));
        $selected = $rows->firstWhere('to_iso', $to) ?? $rows->first();

        $origins = Corridor::select('from_iso', 'from_name')->distinct()->get()->map(fn ($c) => ['value' => $c->from_iso, 'label' => $c->from_name]);
        $destinations = Corridor::where('from_iso', $from)->get(['to_iso', 'to_name'])->map(fn ($c) => ['value' => $c->to_iso, 'label' => $c->to_name]);

        return Inertia::render('Countries/Corridors/Selector', [
            'rows' => $rows->values(), 'selected' => $selected, 'filters' => [...$request->only(['type', 'evidence', 'only_evidence', 'sort']), 'from' => $from, 'to' => $to],
            'origins' => $origins, 'destinations' => $destinations,
        ]);
    }

    public function network(): Response
    {
        $countries = Country::all()->keyBy('iso2');
        $corridors = Corridor::all();
        $raw = CorridorResolver::rawDirectionalTopology();
        $evidence = $corridors->where('evidence_items', '>', 0)->count();

        return Inertia::render('Countries/Corridors/Network', [
            'truth' => $this->truth(),
            'corridors' => $corridors->map(fn ($c) => Present::corridor($c, $countries)),
            'confidence' => [
                'High Confidence' => $corridors->where('confidence_pct', '>=', 75)->count(),
                'Evidence Available' => $corridors->whereBetween('confidence_pct', [50, 74])->count(),
                'Limited Evidence' => $corridors->whereBetween('confidence_pct', [1, 49])->count(),
                'No Evidence (theoretical)' => $raw - $corridors->count(),
            ],
            'matrix' => CorridorResolver::matrix(),
            'coverage' => round($evidence / $raw * 100, 2),
        ]);
    }

    private function base(Corridor $corridor): array
    {
        $countries = Country::all()->keyBy('iso2');

        return ['corridor' => [...Present::corridor($corridor, $countries), 'details' => $corridor->details]];
    }

    public function detail(Corridor $corridor): Response
    {
        return Inertia::render('Countries/Corridors/Detail', [...$this->base($corridor), 'ledgers' => Present::ledgerSummary($corridor->feeLines)]);
    }

    public function endpoints(Corridor $corridor): Response
    {
        $from = Country::with('domains')->where('iso2', $corridor->from_iso)->first();
        $to = Country::with('domains')->where('iso2', $corridor->to_iso)->first();

        return Inertia::render('Countries/Corridors/Endpoints', [
            ...$this->base($corridor),
            'fromCountry' => $from ? Present::country($from) : null,
            'toCountry' => $to ? Present::country($to) : null,
        ]);
    }

    public function evidence(Corridor $corridor): Response
    {
        return Inertia::render('Countries/Corridors/Evidence', $this->base($corridor));
    }

    public function ledger(Corridor $corridor, string $ledger): Response
    {
        $code = strtoupper($ledger);
        abort_unless(isset(Present::LEDGERS[$code]), 404);
        $lines = $corridor->feeLines->where('ledger', $code)->values();

        return Inertia::render('Countries/Corridors/Ledger', [
            ...$this->base($corridor),
            'ledger' => ['code' => $code, 'name' => Present::LEDGERS[$code][0], 'lead' => Present::LEDGERS[$code][1], 'recipient' => Present::LEDGERS[$code][2], 'chip' => Present::LEDGERS[$code][3]],
            'lines' => $lines->map(fn ($l) => Present::feeLine($l)),
            'summary' => Present::ledgerSummary($corridor->feeLines)[$code],
            'nav' => array_keys(Present::LEDGERS),
        ]);
    }

    public function feeComparison(Request $request, Corridor $corridor): Response
    {
        return Inertia::render('Countries/Corridors/FeeComparison', [
            ...$this->base($corridor),
            'summary' => Present::ledgerSummary($corridor->feeLines),
            'category' => $request->query('category'),
            'corridors' => Corridor::whereNotNull('details')->get()->filter(fn ($c) => isset($c->details['categories']))->map(fn ($c) => ['value' => $c->code, 'label' => "{$c->from_name} → {$c->to_name}"])->values(),
        ]);
    }

    public function outlook(Corridor $corridor): Response
    {
        $za = Country::where('iso2', 'ZA')->first();

        return Inertia::render('Countries/Corridors/Outlook', [
            ...$this->base($corridor),
            'outlook' => $za->metrics['ledger_outlook'] ?? null,
        ]);
    }
}
