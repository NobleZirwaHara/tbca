<?php

namespace App\Support\Countries;

use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use App\Models\Countries\RegisterEntry;
use Illuminate\Support\Str;

/**
 * Grounded agents (CT-081 to CT-083). They answer only from current registry
 * records and always return a source manifest. They never assert a price or
 * availability on their own authority; when evidence is missing they return the
 * absence reason, why it matters and the closure path — no-source, no-answer.
 */
class Agents
{
    public const AGENTS = [
        'country' => ['name' => 'Country Analyst Agent', 'role' => 'AI Intelligence Assistant', 'greeting' => "Hello Admin, I'm your Country Analyst Agent. How can I assist you today?",
            'chips' => ['Which countries have the highest activation priority?', 'Show payment friction hotspots', 'Compare resolver coverage across regions', 'What are the top investment opportunities?', 'Which countries have the highest investment readiness?']],
        'corridor' => ['name' => 'Corridor Agent', 'role' => 'AI Corridor Intelligence', 'greeting' => "Hello Admin, I'm your Corridor Agent. How can I assist you today?",
            'chips' => ['Find best corridors to activate next', 'Show corridors with highest friction', 'Compare economic potential by region', 'Which corridors are near-ready?', 'Show top 5 corridor pairs by activation readiness']],
        'absence' => ['name' => 'Honest Absence Agent', 'role' => 'AI Coverage & Gaps Assistant', 'greeting' => "Hello Admin, I'm your Honest Absence Agent. I ensure we are transparent about what TBCA does not provide and why.",
            'chips' => ['What are our highest risk misperception areas?', 'Show absence areas by country', 'Why do we not provide tax filing services?', 'Which areas are new or recently updated?', 'Show absence areas by category']],
    ];

    /** Honest absence register (CT-083): what TBCA does not provide and why. */
    public const ABSENCE_AREAS = [
        ['Legal Representation in Court', 'Professional Service', 'Reserved for licensed attorneys in-country', 'High', 54, '12 May 2026', '14 Aug 2026'],
        ['Audits & Statutory Assurance', 'Professional Service', 'Reserved for licensed auditors in-country', 'High', 54, '12 May 2026', '14 Aug 2026'],
        ['Tax Filing on Client Behalf', 'Delegated Authority', 'Tax agent licence required in-country', 'High', 48, '12 May 2026', '14 Aug 2026'],
        ['Government Licence Issuance', 'Government Function', 'Sovereign function of authorities', 'High', 54, '12 May 2026', '14 Aug 2026'],
        ['Immigration Advice (Residency)', 'Regulated Advisory', 'Local regulated advisors only', 'Medium', 46, '18 May 2026', '13 Aug 2026'],
        ['Investment Banking Services', 'Financial Service', 'Out of scope for TBCA', 'Medium', 53, '18 May 2026', '14 Aug 2026'],
        ['Debt Collection / Enforcement', 'Enforcement Activity', 'Requires local enforcement mandate', 'Medium', 41, '18 May 2026', '14 Aug 2026'],
        ['Medical & Health Services', 'Professional Service', 'Healthcare professionals only', 'Low', 54, '20 May 2026', '14 Aug 2026'],
        ['Real Estate Agency Services', 'Licensed Brokerage', 'Requires in-country real estate licence', 'Low', 52, '22 May 2026', '14 Aug 2026'],
        ['Notarial Certification', 'Notarial Act', 'Notaries public perform this service', 'Low', 37, '22 May 2026', '14 Aug 2026'],
        ['Regulated Investment Advice', 'Financial Service', 'FSCA-licensed providers only (South Africa)', 'High', 54, '12 May 2026', '12 Aug 2026'],
        ['Customs Clearing & Forwarding', 'Licensed Activity', 'Licensed clearing agents only', 'Medium', 50, '25 May 2026', '10 Aug 2026'],
    ];

    public static function ask(string $agent, string $question): array
    {
        $q = Str::lower($question);

        if (Str::contains($q, ['price', 'cost of', 'how much', 'fee for', 'quote me'])) {
            return self::refuse('Price assertion', 'Agents have no price authority. Only the Country Resolver, with RCS = 100% and a signed ResolvedPricePermit, can return a numeric price.', 'Open the Country Context Resolver or request a quote through the controlled route.');
        }
        if (Str::contains($q, ['is available', 'can i buy', 'available in', 'sellable in'])) {
            return self::refuse('Availability assertion', 'Agents cannot assert availability. Availability is a resolver output, service by service.', 'Check the country availability page — it reads the resolver directly.');
        }

        return match ($agent) {
            'country' => self::country($q),
            'corridor' => self::corridor($q),
            default => self::absence($q),
        };
    }

    private static function country(string $q): array
    {
        $countries = Country::with('domains')->get();

        if (Str::contains($q, ['readiness', 'resolver coverage', 'coverage'])) {
            $rows = $countries->map(fn ($c) => [$c, CountryResolver::profile($c)])->sortByDesc(fn ($p) => $p[1]['rcs'])->take(5)->values();
            if (Str::contains($q, 'region')) {
                $byRegion = $countries->groupBy('region')->map(fn ($g) => round($g->avg(fn ($c) => CountryResolver::profile($c)['rcs']), 1))->sortDesc();

                return self::answer('Resolver coverage by region (average RCS):', $byRegion->map(fn ($v, $k) => "{$k} — {$v}%")->values()->all(), ['Resolver domain register (ctry_resolver_domains)'], 'Coverage is a completeness measure; only RCS = 100% permits a numeric price.');
            }

            return self::answer('Countries with the highest resolver completeness (investment readiness proxy):', $rows->map(fn ($p, $i) => ($i + 1).". {$p[0]->name} — ".$p[1]['rcs_label'].' RCS · '.$p[1]['state_label'])->all(), ['Resolver domain register', 'Country availability states (Appendix V)'], 'Shell countries remain non-transactional regardless of completeness until G-D9 and a release certificate pass.');
        }
        if (Str::contains($q, ['priority', 'opportunit', 'investment'])) {
            $rows = Analytics::investment($countries, 'conservative', 2.0, 18, 200)['rows'];
            $rows = array_values(array_filter($rows, fn ($r) => $r['iso'] !== 'ZA'));
            usort($rows, fn ($a, $b) => $b['potential'] <=> $a['potential']);

            return self::answer('Top activation candidates (conservative scenario, bias-corrected demand applied):', array_map(fn ($r, $i) => ($i + 1).". {$r['name']} — potential {$r['potential']}/100, ROI ".($r['roi'] ?? '—')."x · decision {$r['decision']}", array_slice($rows, 0, 5), range(0, 4)), ['Activation Investment Workbench (Cost-to-Activate v2.0)', 'Unmet Demand Register (bias-corrected)'], 'Every candidate is DEFER until hard blocks reach zero and G-D9 passes; Board thresholds govern approval.');
        }
        if (Str::contains($q, ['payment', 'friction', 'liquidity'])) {
            $rows = $countries->filter(fn ($c) => in_array($c->metrics['pay'][5] ?? '', ['Fair', 'Poor'], true))->take(8);

            return self::answer('Payment friction hotspots (draft liquidity health Fair/Poor):', $rows->map(fn ($c) => "{$c->name} — settlement {$c->metrics['pay'][4]}, FX support {$c->metrics['pay'][3]}")->values()->all(), ['Payment & Liquidity admin register (draft, pending evidence)'], 'Shell payment rails are UNRESOLVED (ABS-06) — these figures are draft planning inputs, not verified facts.');
        }

        return self::abstain($q, 'country');
    }

    private static function corridor(string $q): array
    {
        $countries = Country::all()->keyBy('iso2');
        $corridors = Corridor::all()->map(fn ($c) => [$c, CorridorResolver::resolve($c, $countries)]);

        if (Str::contains($q, ['friction'])) {
            $rows = $corridors->filter(fn ($p) => isset($p[0]->details['friction']))->sortByDesc(fn ($p) => $p[0]->details['friction'])->take(5)->values();

            return self::answer('Corridors with the highest observed friction score:', $rows->map(fn ($p, $i) => ($i + 1).". {$p[0]->from_name} → {$p[0]->to_name} — friction {$p[0]->details['friction']}/100 · endpoint ceiling {$p[1]['ceiling_label']}")->all(), ['Corridor register', 'Layer 9 corridor friction observations'], 'Friction scores are observations, not border or transit facts.');
        }
        if (Str::contains($q, ['region', 'economic potential'])) {
            $rows = $corridors->filter(fn ($p) => isset($p[0]->details['potential_m']))->groupBy(fn ($p) => $p[0]->group_name)->map(fn ($g) => $g->sum(fn ($p) => $p[0]->details['potential_m']))->sortDesc();

            return self::answer('Modelled economic potential by corridor group (R millions, model basis):', $rows->map(fn ($v, $k) => "{$k} — R{$v}M")->values()->all(), ['Corridor Economics Workbench'], 'Corridor potential is not commercial return (Part 25).');
        }

        $rows = $corridors->sortByDesc(fn ($p) => $p[0]->pair_rcs)->take(5)->values();

        return self::answer('Top corridor pairs by pair resolver completeness — endpoint ceiling vs final pair permission:', $rows->map(fn ($p, $i) => ($i + 1).". {$p[0]->from_name} → {$p[0]->to_name} — pair RCS {$p[0]->pair_rcs}% · ceiling {$p[1]['ceiling_label']} · final: {$p[1]['pair_permission']}")->all(), ['Corridor register', 'Appendix P endpoint matrix'], 'Current sellable directional corridors: '.CorridorResolver::sellableCount().'. The ceiling is never a final permission.');
    }

    private static function absence(string $q): array
    {
        $areas = collect(self::ABSENCE_AREAS);
        if (Str::contains($q, ['tax filing', 'tax'])) {
            $a = $areas->firstWhere(0, 'Tax Filing on Client Behalf');

            return self::answer("Why TBCA does not provide {$a[0]}:", ["Reason: {$a[2]}.", "Absence type: {$a[1]} · client impact {$a[3]} · coverage {$a[4]} countries.", 'Permitted route: referral to a registered tax practitioner (partner-routed).'], ['Honest Absence Register', 'Partner & Professional Boundary rules'], CountryRegister::absenceCopy('ABS-07'));
        }
        if (Str::contains($q, ['category'])) {
            return self::answer('Absence areas by category:', $areas->groupBy(1)->map(fn ($g, $k) => "{$k} — ".$g->count())->values()->all(), ['Honest Absence Register'], null);
        }
        if (Str::contains($q, ['country', 'countries'])) {
            $gaps = RegisterEntry::where('register', 'gaps')->with('country')->get()->groupBy('country.name')->map->count()->sortDesc()->take(6);

            return self::answer('Open absence records per country object (top 6):', $gaps->map(fn ($n, $k) => "{$k} — {$n} open records")->values()->all(), ['Country absence registers (Appendix Q)'], null);
        }
        if (Str::contains($q, ['new', 'recent', 'updated'])) {
            return self::answer('Recently updated absence statements:', $areas->sortByDesc(6)->take(4)->map(fn ($a) => "{$a[0]} — updated {$a[6]}")->values()->all(), ['Honest Absence Register'], null);
        }
        $top = $areas->where(3, 'High')->take(5);

        return self::answer('Highest risk misperception areas:', $top->map(fn ($a) => "{$a[0]} — {$a[2]}")->values()->all(), ['Honest Absence Register'], 'Top misperception risk area: '.$top->first()[0].' [High Risk].');
    }

    private static function answer(string $lead, array $lines, array $sources, ?string $note): array
    {
        return ['type' => 'answer', 'lead' => $lead, 'lines' => $lines, 'sources' => $sources, 'note' => $note];
    }

    private static function refuse(string $what, string $why, string $path): array
    {
        return ['type' => 'refusal', 'lead' => "Abstained — {$what}", 'lines' => [$why], 'sources' => ['CT-TEB v2.0 Part 24 agent boundary'], 'note' => "Next permitted step: {$path}"];
    }

    private static function abstain(string $q, string $agent): array
    {
        return [
            'type' => 'absence',
            'lead' => 'No approved source supports an answer to this question.',
            'lines' => [
                'Missing: a current registry field that answers "'.Str::limit($q, 80).'".',
                'Why it matters: answering from model memory would create an invented country fact (CT-LAW-03).',
                'Closure path: raise an evidence request in the Country Evidence Audit, or rephrase using a supported topic (resolver coverage, activation priority, payment friction).',
            ],
            'sources' => [],
            'note' => CountryRegister::absenceCopy('ABS-01'),
        ];
    }
}
