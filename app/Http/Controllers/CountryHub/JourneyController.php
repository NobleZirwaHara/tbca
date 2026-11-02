<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\CountryState;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Market Entry Journey P17 to P26 (prototype pages-journey.js): readiness self-assessment, landing
 * plan, the three planners, compliance planner, launch readiness, evidence audit, diaspora and exit.
 * Static planner content lives in the pages; register-derived content is shaped here.
 */
class JourneyController extends Controller
{
    /** Evidence audit "as at" date (prototype TODAY). */
    private const TODAY = '2026-10-21';

    public function page(string $country, string $page): Response
    {
        $c = $this->country($country);
        $request = request();

        return match ($page) {
            'readiness' => $this->readiness($c),
            'landing' => $this->landing($c, $request),
            'localisation' => $this->countryPage($c, 'Journey/Localisation', [
                'products' => $c['isBW'] ? $this->products() : null,
                'shelf' => CountryHub::shelf(['localisation', 'market-entry']),
            ]),
            'paylocal' => $this->countryPage($c, 'Journey/PayLocal', ['shelf' => CountryHub::shelf(['payments'])]),
            'langpack' => $this->countryPage($c, 'Journey/LangPack', [
                'pending' => $c['isBW'] ? count(CountryHub::register('BW_Products')) : 8,
                'shelf' => CountryHub::shelf(['localisation']),
            ]),
            'compliance' => $this->compliance($c, $request),
            'launch' => $this->countryPage($c, 'Journey/Launch', [
                'plan90' => $c['isBW'] ? CountryHub::register('BW_Plan90') : null,
                'shelf' => CountryHub::shelf(['market-entry']),
            ]),
            'audit' => $this->audit($c),
            'diaspora' => $this->diaspora($c),
            'exit' => $this->countryPage($c, 'Journey/Exit'),
            default => abort(404),
        };
    }

    /* ------------------------------------------------------------------ P17 */

    /** Requirements: [domain, requirement, Botswana evidence]. */
    private function requirements(array $c): array
    {
        $bw = $c['isBW'];
        $e = fn (string $t) => $bw ? $t : '';

        return [
            ['Legal & Regulatory', 'Entity route chosen (branch, subsidiary, JV with citizen partner)', $e('Citizen-empowerment rules: Economic Inclusion Act 26 of 2021 (BW-MAC-F20)')],
            ['Legal & Regulatory', 'Reserved-activity check passed for the chosen activity', $e('35 service sectors and listed manufacturing/trading activities are citizen-only (BW-MAC-F21, F23)')],
            ['Licensing & Registration', 'Sector permits identified with issuer and lead time', $e('BW_Permits: 18 sector pathways')],
            ['Licensing & Registration', 'Company registration and trading licence filed', ''],
            ['Tax & Finance', 'Tax position modelled (CIT, VAT, WHT)', $e('CIT 22 % (rise proposed, DG-01), VAT 14 %, WHT 10 % (BW-MAC-F18)')],
            ['Tax & Finance', 'Bank account and FX route agreed', $e('No exchange controls since 1999 (BW-MAC-F19); pula crawling peg (BW-MAC-F11)')],
            ['Operations & Infrastructure', 'Site / town selected with gateway access', $e('83 places with nearest gateway and km (BW_Towns)')],
            ['Operations & Infrastructure', 'Power and water continuity plan', $e('Imports ≈35 % of power (BW-ENR-F1); water stress in shocks matrix')],
            ['Operations & Infrastructure', 'Logistics corridor confirmed', $e('6 border gateways — landlocked (BW_Gateways)')],
            ['People & Partnerships', 'Local partner / JV term sheet', ''],
            ['People & Partnerships', 'Work-permit and localisation plan', ''],
            ['Go-to-Market & Localisation', 'Demand validated in target places', $e('2,137 ranked leads to test (BW_Ranked_Leads)')],
            ['Go-to-Market & Localisation', 'Pricing in local currency and VAT-inclusive', ''],
            ['Go-to-Market & Localisation', 'Setswana product terms reviewed', $e('55 terms flagged [VERIFY] (BW_Products)')],
            ['Go-to-Market & Localisation', 'Data-protection compliance', ''],
            ['Legal & Regulatory', 'Sanctions and prohibited-party screening', ''],
        ];
    }

    private function readiness(array $c): Response
    {
        $req = $this->requirements($c);
        $key = 'plan.ready-'.strtolower($c['iso3']);
        $default = array_map(fn ($i) => $i < 9 ? 1 : ($i < 12 ? 0.5 : 0), array_keys($req));
        $saved = CountryState::get($key);
        $vals = is_array($saved) && count($saved) === count($req) && collect($saved)->every(fn ($v) => in_array((float) $v, [0.0, 0.5, 1.0], true))
            ? array_map(fn ($v) => (float) $v == 0.5 ? 0.5 : (int) $v, array_values($saved))
            : $default;

        return $this->countryPage($c, 'Journey/Readiness', [
            'req' => $req,
            'vals' => $vals,
            'stateKey' => $key,
            'shelf' => CountryHub::shelf(['market-entry'], 4, 'Close the gaps — market-entry Sprints'),
        ]);
    }

    /* ------------------------------------------------------------------ P18 */

    private function landing(array $c, Request $request): Response
    {
        if (! $c['isBW']) {
            return $this->countryPage($c, 'Journey/Landing', ['pack' => false]);
        }
        $all = CountryHub::register('BW_Ranked_Leads');
        $sec = (string) $request->query('sector', 'ALL');
        $per = (string) $request->query('persona', 'ALL');
        $sec = $sec === 'ALL' || isset(CountryHub::SECT[$sec]) ? $sec : 'ALL';
        $personas = array_values(array_unique(array_map(fn ($r) => (string) $r['Persona'], $all)));
        $per = $per === 'ALL' || in_array($per, $personas, true) ? $per : 'ALL';

        $leads = array_values(array_filter($all, fn ($r) => ($sec === 'ALL' || $r['Sector'] === $sec) && ($per === 'ALL' || $r['Persona'] === $per)));
        $groups = [];
        foreach ($leads as $r) {
            $groups[(string) $r['Place ID']][] = $r;
        }
        $byPlace = [];
        foreach ($groups as $l) {
            $sorted = $l;
            usort($sorted, fn ($a, $b) => (float) $b['Lead score'] <=> (float) $a['Lead score']);
            $best = $sorted[0];
            $byPlace[] = [
                'place' => $l[0]['Place'], 'id' => $l[0]['Place ID'], 'unit' => $l[0]['Unit'], 'n' => count($l),
                'a' => count(array_filter($l, fn ($x) => str_contains((string) $x['Tier'], 'A'))),
                'bestTemplate' => $best['Template'], 'bestOpp' => $best['Opportunity'],
                'gw' => $l[0]['Nearest gateway'], 'km' => $l[0]['Gateway km'], 'pop' => $l[0]['Population'],
            ];
        }
        usort($byPlace, fn ($a, $b) => ($b['a'] <=> $a['a']) ?: ($b['n'] <=> $a['n']));
        $geo = CountryHub::meta('geo_bw') ?? [];

        return $this->countryPage($c, 'Journey/Landing', [
            'pack' => true,
            'sector' => $sec,
            'persona' => $per,
            'sectors' => CountryHub::SECT,
            'personas' => $personas,
            'count' => count($leads),
            'top' => $byPlace[0] ?? null,
            'places' => array_slice($byPlace, 0, 14),
            'envelopes' => array_map(fn ($e) => ['unit' => $e['Unit'], 'v' => (float) $e['Envelope US$ m (weighted)']], CountryHub::register('BW_Envelopes')),
            'map' => [
                'geo' => array_intersect_key($geo, array_flip(['districts', 'countries', 'roads', 'rail', 'rivers', 'lakes'])),
                'units' => CountryHub::register('BW_Units'),
                'towns' => CountryHub::register('BW_Towns'),
                'gateways' => CountryHub::register('BW_Gateways'),
                'hotspots' => CountryHub::register('BW_Hotspots'),
            ],
            'shelf' => CountryHub::shelf(['market-entry', 'intelligence'], 4, 'Land with a plan'),
        ]);
    }

    /* ------------------------------------------------------------------ P19 */

    private function products(): array
    {
        $p = CountryHub::register('BW_Products');

        return [
            'count' => count($p),
            'rows' => array_map(fn ($r) => ['en' => $r['Product'], 'tn' => $r['Setswana [VERIFY]'], 'hs' => $r['HS 2022']], array_slice($p, 0, 8)),
        ];
    }

    /* ------------------------------------------------------------------ P22 */

    private function compliance(array $c, Request $request): Response
    {
        if (! $c['isBW']) {
            return $this->countryPage($c, 'Journey/Compliance', ['pack' => false]);
        }
        $sec = (string) $request->query('sector', 'MIN');
        $sec = isset(CountryHub::SECT[$sec]) ? $sec : 'MIN';
        $p = collect(CountryHub::register('BW_Permits'))->firstWhere('Sector', $sec) ?? [];
        [$lo, $hi] = preg_match('/(\d+)\s*[–-]\s*(\d+)\s*months/u', (string) ($p['Typical time'] ?? ''), $mm) ? [(int) $mm[1], (int) $mm[2]] : [3, 6];
        $items = array_values(array_filter(preg_split('/;\s*/', (string) ($p['Permits'] ?? '')), fn ($x) => $x !== ''));
        $macro = collect(CountryHub::register('BW_Macro'))->keyBy('Fact ID');

        return $this->countryPage($c, 'Journey/Compliance', [
            'pack' => true,
            'sector' => $sec,
            'sectors' => CountryHub::SECT,
            'permit' => ['issuer' => $p['Issuer'] ?? '', 'time' => $p['Typical time'] ?? '', 'items' => $items, 'lo' => $lo, 'hi' => $hi],
            'changes' => array_values(array_filter(CountryHub::register('BW_RegChange'), fn ($r) => $r['Sector'] === $sec)),
            'rules' => array_map(fn ($id) => $macro[$id] ?? ['Fact ID' => $id], ['BW-MAC-F20', 'BW-MAC-F21', 'BW-MAC-F22', 'BW-MAC-F23']),
            'shelf' => CountryHub::shelf(['regulatory', 'tax'], 4, 'Compliance Sprints'),
        ]);
    }

    /* ------------------------------------------------------------------ P24 */

    /** Fact date as a UTC timestamp in ms (prototype toDate: missing month = June, missing day = 15). */
    private static function factDate(mixed $s): ?float
    {
        if (! preg_match('/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/', (string) $s, $m)) {
            return null;
        }
        $mon = (int) ($m[2] ?? 0) ?: 6;
        $day = (int) ($m[3] ?? 0) ?: 15;

        return gmmktime(0, 0, 0, $mon, $day, (int) $m[1]) * 1000.0;
    }

    private function audit(array $c): Response
    {
        if (! $c['isBW']) {
            return $this->countryPage($c, 'Journey/Audit', ['pack' => false]);
        }
        $today = strtotime(self::TODAY.' 00:00:00 UTC') * 1000.0;
        $ver = [];
        foreach (CountryHub::register('BW_VerifyLog') as $v) {
            $ver[(string) $v['Fact']] = $v['Result'];
        }
        $raw = array_merge(
            array_map(fn ($f) => ['id' => $f['Fact ID'], 't' => $f['Fact'], 'dom' => $f['Sector name'], 'src' => $f['Source'], 'd' => $f['Date'], 'g' => (int) $f['Grade']], CountryHub::register('BW_Facts')),
            array_map(fn ($f) => ['id' => $f['Fact ID'], 't' => $f['Item'], 'dom' => 'Macro & Economy', 'src' => $f['Source'], 'd' => $f['Date'], 'g' => (int) $f['Grade']], CountryHub::register('BW_Macro')),
        );
        $items = array_map(function ($x) use ($today, $ver) {
            $dt = self::factDate($x['d']);
            $age = $dt === null ? null : (int) floor(($today - $dt) / 2.63e9 + 0.5);

            return $x + [
                'age' => $age,
                'cur' => $age === null ? 'Undated' : ($age <= 18 ? 'Current' : ($age <= 36 ? 'Ageing' : 'Out of Date')),
                'lin' => isset($ver[(string) $x['id']]) ? 'Verified (re-fetched)' : ($x['g'] >= 3 ? 'Source-attributed' : 'Partial'),
            ];
        }, $raw);

        $cnt = array_count_values(array_column($items, 'cur'));
        $pct = fn ($a, $b) => $b ? (int) floor(100 * $a / $b + 0.5) : 0;
        $doms = [];
        foreach ($items as $x) {
            $doms[$x['dom']][] = $x;
        }
        $health = [];
        foreach ($doms as $d => $l) {
            $health[] = ['dom' => $d, 'p' => $pct(count(array_filter($l, fn ($x) => $x['cur'] === 'Current')), count($l))];
        }

        return $this->countryPage($c, 'Journey/Audit', [
            'pack' => true,
            'items' => $items,
            'score' => $pct($cnt['Current'] ?? 0, count($items)),
            'cnt' => ['current' => $cnt['Current'] ?? 0, 'ageing' => $cnt['Ageing'] ?? 0, 'out' => $cnt['Out of Date'] ?? 0],
            'verified' => count($ver),
            'health' => $health,
            'shelf' => CountryHub::shelf(['intelligence']),
        ]);
    }

    /* ------------------------------------------------------------------ P26 */

    private function diaspora(array $c): Response
    {
        if (! $c['isBW'] && ! $c['isZA']) {
            return $this->countryPage($c, 'Journey/Diaspora', ['pack' => false]);
        }
        $props = ['pack' => true, 'shelf' => CountryHub::shelf(['investment'], 4, 'Investor Sprints')];
        if ($c['isBW']) {
            $props['tou'] = collect(CountryHub::register('BW_Facts'))->firstWhere('Fact ID', 'BW-TOU-F2');
            $props['fxOpps'] = array_values(array_map(fn ($r) => array_intersect_key($r, array_flip(['Opp ID', 'Opportunity', 'Sector', 'Band', 'Tier', 'Time to revenue'])),
                array_filter(CountryHub::register('BW_Top30'), fn ($r) => $r['FX earner'] === 'Yes')));
            $props['precedents'] = CountryHub::register('BW_Precedents');
        }

        return $this->countryPage($c, 'Journey/Diaspora', $props);
    }
}
