<?php

namespace App\Http\Controllers\Aiim;

use App\Support\Aiim\ProtoSearch;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Botswana branch of the search and object pages (prototype routes opps, opp.{id}, projects,
 * project.{id}, investors, investor.{code}, funders, funder.{code}, corridors and corridor.{id}).
 * Pages live under resources/js/Pages/Aiim/Intel; big registers are paged on the server.
 */
trait BotswanaSearch
{
    /** Render a Botswana page with the facts it cites (fact drawer), the visitor's saved keys and the country filter. */
    protected function bwRender(Request $request, string $page, array $props, string $context): Response
    {
        $this->select($request, ['country' => 'Botswana']);

        return $this->render($request, 'Aiim/Intel/'.$page, $props + [
            'facts' => ProtoSearch::factsIn($props),
            'saved' => $this->savedKeys($request->user()),
        ] + $this->countryProps($request), $context);
    }

    /* ------------------------------------------------------------------ 7 Opportunity Search */

    protected function bwOpps(Request $request): Response
    {
        $s = ProtoSearch::summary();
        $pr = ProtoSearch::reg('BW_Priority');

        return $this->bwRender($request, 'Opportunities', [
            'kpi' => [
                ['Templates', $s['Sweep templates'] ?? null], ['Tier A+', $s['Tier A+'] ?? null], ['Tier A', $s['Tier A'] ?? null],
                ['Tier B', $s['Tier B'] ?? null], ['Citizen-reserved', $s['Citizen-reserved templates'] ?? null], ['FX earners', $s['FX-earning templates'] ?? null],
            ],
            'top30' => ProtoSearch::reg('BW_Top30'),
            'priority' => ProtoSearch::page($request, 'pr', $pr, ProtoSearch::headers('BW_Priority'), ['Sector', 'Tier', 'Persona'], 25),
            'register' => ProtoSearch::page($request, 'ob', ProtoSearch::reg('BW_Opportunities'), ProtoSearch::headers('BW_Opportunities'), ['Sector', 'Type', 'Persona'], 15),
            'issue2' => ProtoSearch::page($request, 'i2', ProtoSearch::reg('I2_Opportunity_Register'), ProtoSearch::headers('I2_Opportunity_Register'), ['Sector', 'Status'], 10),
            'rail' => ProtoSearch::rail(['AAB-EMB-138', 'AAB-EMB-139', 'AAB-EMB-140', 'AAB-EMB-141', 'AAB-EMB-149', 'AAB-EMB-151'], 'Opportunity services'),
        ], 'Opportunity Search');
    }

    /* ------------------------------------------------------------------ 8 Opportunity Preview */

    protected function bwOpp(Request $request, string $id): Response
    {
        $x = ProtoSearch::opp($id);
        ['o' => $o, 'p' => $p, 'sw' => $sw, 'ob' => $ob, 'i2' => $i2] = $x;
        $code = (string) ($o['Sector'] ?? '');
        $rl = array_values(array_filter(ProtoSearch::reg('BW_Ranked_Leads'), fn ($r) => $r['Template'] === $id));
        usort($rl, fn ($a, $b) => $a['Rank'] <=> $b['Rank']);
        $cov = array_values(array_filter(ProtoSearch::reg('BW_Coverage'), fn ($r) => $r['Template'] === $id));
        $hl = array_values(array_filter(ProtoSearch::reg('BW_Hotspot_Leads'), fn ($r) => $r['Template'] === $id));
        $dt = collect(ProtoSearch::reg('BW_Downturn'))->firstWhere('Opp ID', $id);
        $pol = $sw ? collect(ProtoSearch::reg('BW_Policy'))->firstWhere('Code', $sw['Policy']) : null;
        $pick = fn (array $rows, array $cols) => array_map(fn ($r) => array_intersect_key($r, array_flip($cols)), $rows);
        $this->select($request, ['item' => $o['Opportunity']]);

        return $this->bwRender($request, 'Opportunity', [
            'id' => $id,
            'kindLabel' => $ob['Type'] ?? 'Issue 2.0',
            'sector' => ['code' => $code, 'name' => ProtoSearch::secName($code), 'color' => ProtoSearch::SECTORS[$code][1] ?? '#999'],
            'title' => (string) $o['Opportunity'],
            'lead' => [
                'trigger' => $sw['Trigger'] ?? null, 'evidence' => $sw['Evidence'] ?? null, 'factDate' => $sw['Fact date'] ?? null,
                'placement' => $ob['Placement'] ?? null, 'model' => $ob['Model'] ?? null,
                'i2Trigger' => $i2['Evidence trigger'] ?? null, 'i2Model' => $i2['Investment model'] ?? null,
            ],
            'chips' => [
                'tier' => $o['Tier'] ?? null, 'band' => $o['Band'] ?? null, 'persona' => $o['Persona'] ?? null, 'ttr' => $o['Time to revenue'] ?? null,
                'citizen' => str_starts_with((string) ($o['Citizen-reserved'] ?? ''), 'Y'), 'fx' => str_starts_with((string) ($o['FX earner'] ?? ''), 'Y'),
            ],
            'score' => $sw ? [
                'score' => $sw['Score'], 'ra' => $sw['RA'],
                'downturn' => $dt ? $dt['RA downturn'].' · '.$dt['Tier downturn'] : $sw['Downturn RA'].' · '.$sw['Downturn tier'],
                'places' => $sw['Eligible places (n)'],
                'build' => [['E evidence', (float) $sw['E'], 3], ['D demand', (float) $sw['D'], 3], ['P* policy', (float) $sw['P*'], 3], ['4 − R risk', 4 - (float) $sw['R'], 4]],
                'tierPre' => $sw['Tier pre-gate'], 'tier' => $sw['Tier'], 'gate' => $p['Gate reason'] ?? '', 'fresh' => $sw['Fresh'], 'robust' => $sw['Robust'] ?: '—',
            ] : null,
            'record' => array_map(fn ($k, $v) => [$k, $v], array_keys($p ?? $sw ?? $ob ?? $i2), array_values($p ?? $sw ?? $ob ?? $i2)),
            'ranked' => $pick($rl, ['Rank', 'Place ID', 'Place', 'Unit', 'Population', 'Nearest gateway', 'Gateway km', 'RA', 'M', 'H', 'F', 'G', 'Lead score', 'Tier']),
            'hotLeads' => $pick($hl, ['Lead ID', 'Hotspot', 'Place', 'Status', 'Lead score', 'Tier', 'Next action', 'Institution to call', 'Due']),
            'coverage' => $pick($cov, ['Row', 'Place', 'Unit', 'Gateway km', 'Lead score', 'Tier']),
            'map' => $rl ? ['geo' => ProtoSearch::geo(), 'towns' => ProtoSearch::mapTowns(), 'gateways' => ProtoSearch::mapGateways()] : null,
            'policy' => $pol,
            'call' => $sw && $p ? [['Institution', $p['Institution to call']], ['Verification owner', $p['Verification owner']], ['Model', $sw['Model']], ['Capacity check', $sw['Capacity check'] ?: '—']] : null,
            'unlock' => ProtoSearch::svc('AAB-EMB-139'),
            'brief' => ProtoSearch::brief('Investor teaser and information memorandum', 'Turn '.$id.' into a teaser for investors', 'AAB-EMB-201', 'Build teaser'),
            'rail' => ProtoSearch::rail(['AAB-EMB-140', 'AAB-EMB-188', 'AAB-EMB-209', 'AAB-EMB-210', 'AAB-EMB-211', 'AAB-EMB-158'], 'Take this opportunity forward'),
        ], 'Opportunity Preview');
    }

    /* ------------------------------------------------------------------ 9 Project Search */

    protected function bwProjects(Request $request): Response
    {
        return $this->bwRender($request, 'Projects', [
            'precedents' => ProtoSearch::reg('BW_Precedents'),
            'hotspots' => array_map(fn ($h) => ['i' => $h['i'], 'Hotspot' => $h['Hotspot'], 'Place' => $h['Place'], 'Unit code' => $h['Unit code'], 'Status' => $h['Status'], 'leads' => count($h['leads']), 'best' => $h['best'], 'aplus' => $h['aplus'], 'tierA' => $h['tierA']], ProtoSearch::hot()),
            'd4' => ProtoSearch::table('D-4'),
            'rail' => ProtoSearch::rail(['AAB-EMB-149', 'AAB-EMB-150', 'AAB-EMB-151', 'AAB-EMB-209', 'AAB-EMB-147']),
        ], 'Project Search');
    }

    /* ------------------------------------------------------------------ 10 Project Overview */

    protected function bwProject(Request $request, string $id): ?Response
    {
        if (preg_match('/^H(\d+)$/i', $id, $m)) {
            $h = ProtoSearch::hot()[(int) $m[1]] ?? null;
            if (! $h) {
                return null;
            }
            $this->select($request, ['item' => $h['Hotspot']]);
            $leads = $h['leads'];

            return $this->bwRender($request, 'Project', [
                'kind' => 'hotspot',
                'id' => 'H'.$h['i'],
                'hotspot' => array_diff_key($h, ['leads' => 1]),
                'leads' => $leads,
                'leadCols' => ProtoSearch::headers('BW_Hotspot_Leads'),
                'map' => ['geo' => ProtoSearch::geo(), 'towns' => ProtoSearch::mapTowns(), 'gateways' => ProtoSearch::mapGateways(), 'hot' => ProtoSearch::mapHot()],
                'brief' => ProtoSearch::brief('Pre-introduction counterparty verification', 'Verify the counterparty before you call '.($leads[0]['Institution to call'] ?? ''), 'AAB-EMB-208', 'Verify first'),
            ], 'Project Overview');
        }
        $p = collect(ProtoSearch::reg('BW_Precedents'))->firstWhere('ID', strtoupper($id));
        if (! $p) {
            return null;
        }
        $sec = explode('-', (string) $p['Evidence'])[1] ?? '';
        $f = ProtoSearch::facts()[$p['Evidence']] ?? null;
        $this->select($request, ['item' => $p['Deal']]);

        return $this->bwRender($request, 'Project', [
            'kind' => 'precedent',
            'id' => $p['ID'],
            'precedent' => $p,
            'sector' => ['code' => $sec, 'name' => ProtoSearch::secName($sec)],
            'fact' => $f,
            'templates' => ProtoSearch::sweepRows(array_filter(ProtoSearch::reg('BW_Sweep'), fn ($o) => $o['Sector'] === $sec)),
            'brief' => ProtoSearch::brief('Partner Identification Brief', 'Who to partner with around '.$p['Deal'], 'AAB-EMB-197'),
            'rail' => ProtoSearch::rail(['AAB-EMB-215', 'AAB-EMB-214', 'AAB-EMB-209', 'AAB-EMB-210']),
            'advisory' => ProtoSearch::svc('AAB-EMB-215'),
        ], 'Project Overview');
    }

    /* ------------------------------------------------------------------ 11 Investor Search */

    protected function bwInvestors(Request $request): Response
    {
        $sw = ProtoSearch::reg('BW_Sweep');
        $personas = [];
        foreach (ProtoSearch::PERSONAS as $c => $n) {
            $t = array_filter($sw, fn ($o) => $o['Persona'] === $c);
            $personas[] = ['code' => $c, 'name' => $n, 'templates' => count($t), 'tierA' => count(array_filter($t, fn ($o) => str_starts_with((string) $o['Tier'], 'A'))), 'bars' => array_slice(ProtoSearch::sectorBars($t), 0, 4)];
        }

        return $this->bwRender($request, 'Investors', [
            'personas' => $personas,
            'strategic' => array_map(fn ($s) => ['name' => $s[0], 'note' => $s[1], 'precedent' => $s[2], 'sector' => $s[3], 'sectorName' => ProtoSearch::secName($s[3])], ProtoSearch::STRATEGIC),
            'finFacts' => array_values(array_map(fn ($f) => array_intersect_key($f, array_flip(['Fact ID', 'Fact', 'Value', 'Date', 'Grade'])), array_filter(ProtoSearch::reg('BW_Facts'), fn ($f) => $f['Sector'] === 'FIN'))),
            'matching' => ProtoSearch::svc('AAB-EMB-188'),
            'rail' => ProtoSearch::rail(['AAB-EMB-188', 'AAB-EMB-206', 'AAB-EMB-217', 'AAB-EMB-201', 'AAB-EMB-197', 'AAB-EMB-216'], 'Investor services'),
        ], 'Investor Search');
    }

    /* ------------------------------------------------------------------ 12 Investor Preview */

    protected function bwInvestor(Request $request, string $c): Response
    {
        $t = array_values(array_filter(ProtoSearch::reg('BW_Sweep'), fn ($o) => $o['Persona'] === $c));
        $rl = array_filter(ProtoSearch::reg('BW_Ranked_Leads'), fn ($r) => $r['Persona'] === $c);
        $units = ProtoSearch::countBy($rl, 'Unit');
        arsort($units);
        $this->select($request, ['item' => ProtoSearch::PERSONAS[$c]]);

        return $this->bwRender($request, 'Investor', [
            'code' => $c,
            'name' => ProtoSearch::PERSONAS[$c],
            'kpi' => [
                'templates' => count($t), 'tierA' => count(array_filter($t, fn ($o) => str_starts_with((string) $o['Tier'], 'A'))),
                'ranked' => count($rl), 'citizen' => count(array_filter($t, fn ($o) => str_starts_with((string) $o['Citizen-reserved'], 'Y'))),
            ],
            'units' => array_map(fn ($n, $v) => ['n' => (string) $n, 'v' => $v], array_keys($units), array_values($units)),
            'sectors' => ProtoSearch::sectorBars($t),
            'templates' => ProtoSearch::sweepRows($t),
            'matching' => ProtoSearch::svc('AAB-EMB-188'),
        ], 'Investor Preview');
    }

    /* ------------------------------------------------------------------ 13 Funder Search */

    protected function bwFunders(Request $request): Response
    {
        $cards = [];
        foreach (ProtoSearch::FUNDERS as $c => [$n, $role]) {
            $h = ProtoSearch::funderHits($c);
            $cards[] = ['code' => $c, 'name' => $n, 'role' => $role, 'facts' => count($h['f']), 'templates' => count($h['t']), 'instruments' => count($h['pol'])];
        }

        return $this->bwRender($request, 'Funders', [
            'funders' => $cards,
            'envelopes' => array_map(fn ($e) => ['n' => $e['Unit'], 'v' => (float) $e['Envelope US$ m (weighted)']], ProtoSearch::reg('BW_Envelopes')),
            'policy' => ProtoSearch::reg('BW_Policy'),
            'gaps' => ProtoSearch::reg('BW_DataGaps'),
            'raising' => ProtoSearch::svc('AAB-EMB-214'),
            'rail' => ProtoSearch::rail(['AAB-EMB-147', 'AAB-EMB-214', 'AAB-EMB-222', 'AAB-EMB-156', 'AAB-EMB-209', 'AAB-EMB-211'], 'Funding services'),
        ], 'Funder Search');
    }

    /* ------------------------------------------------------------------ 14 Funder Preview */

    protected function bwFunder(Request $request, string $c): Response
    {
        [$name, $role] = ProtoSearch::FUNDERS[$c];
        $h = ProtoSearch::funderHits($c);
        $short = explode(' (', $name)[0];
        $inst = array_values(array_filter(ProtoSearch::reg('BW_Institutions'), fn ($i) => str_contains((string) $i['Botswana institution'], $c) || str_contains((string) $i['Botswana institution'], $short)));
        $this->select($request, ['item' => $name]);

        return $this->bwRender($request, 'Funder', [
            'code' => $c, 'name' => $name, 'role' => $role,
            'institutions' => $inst,
            'factRows' => array_map(fn ($f) => array_intersect_key($f, array_flip(['Fact ID', 'Fact', 'Value', 'Source', 'Date', 'Grade'])), $h['f']),
            'templates' => array_map(fn ($o) => array_intersect_key($o, array_flip(['Opp ID', 'Opportunity', 'Band', 'Tier', 'Institution to call', 'Verification owner'])), $h['t']),
            'instruments' => $h['pol'],
            'engagement' => ProtoSearch::svc('AAB-EMB-213'),
        ], 'Funder Preview');
    }

    /* ------------------------------------------------------------------ 15 Trade Corridor Search */

    protected function bwCorridors(Request $request): Response
    {
        $d2 = ProtoSearch::slice('D-2');
        $first = collect($d2)->firstWhere('s', 'First Paragraph');
        $body = collect($d2)->firstWhere('s', 'Body Text');

        return $this->bwRender($request, 'Corridors', [
            'lead' => $first['x'] ?? '',
            'corridors' => array_map(fn ($c) => $c + ['col' => ProtoSearch::GWCOL[$c['gw']] ?? '#999'], ProtoSearch::CORR),
            'map' => ['geo' => ProtoSearch::geo(true), 'towns' => ProtoSearch::mapTowns(), 'gateways' => ProtoSearch::mapGateways()],
            'd2' => ProtoSearch::table('D-2'),
            'd2note' => $body['x'] ?? '',
            'transport' => array_values(array_map(fn ($f) => array_intersect_key($f, array_flip(['Fact ID', 'Fact', 'Value', 'Source', 'Date', 'Grade'])), array_filter(ProtoSearch::reg('BW_Facts'), fn ($f) => $f['Sector'] === 'TRN'))),
            'chains' => array_values(array_map(fn ($c) => array_intersect_key($c, array_flip(['Chain', '#', 'Question', 'Information types', 'Map behaviour', 'Evidence', 'Institution/role'])), array_filter(ProtoSearch::reg('BW_Chains'), fn ($c) => $c['Sector'] === 'TRN'))),
            'report' => ProtoSearch::svc('AAB-EMB-194'),
            'rail' => ProtoSearch::rail(['AAB-EMB-162', 'AAB-EMB-163', 'AAB-EMB-164', 'AAB-EMB-165', 'AAB-EMB-166', 'AAB-EMB-167', 'AAB-EMB-133'], 'Corridor services'),
        ], 'Trade Corridor Search');
    }

    /* ------------------------------------------------------------------ 16 Trade Corridor Detail */

    protected function bwCorridor(Request $request, array $c): Response
    {
        $g = ProtoSearch::gateways()[$c['gw']];
        $towns = array_values(array_filter(ProtoSearch::towns(), fn ($t) => $t['gw'] === $c['gw']));
        usort($towns, fn ($a, $b) => $a['Gateway km'] <=> $b['Gateway km']);
        $pol = $c['policy'] ? collect(ProtoSearch::reg('BW_Policy'))->firstWhere('Code', $c['policy']) : null;
        $fact = $c['fact'] ? (ProtoSearch::facts()[$c['fact']] ?? null) : null;
        $tpl = array_filter(ProtoSearch::reg('BW_Sweep'), fn ($o) => $o['Sector'] === 'TRN' || preg_match('/CORRIDOR|BORDER/', (string) $o['Tags']));
        $this->select($request, ['item' => $c['name']]);

        return $this->bwRender($request, 'Corridor', [
            'corridor' => $c + ['col' => ProtoSearch::GWCOL[$c['gw']] ?? '#999'],
            'gateway' => ['i' => $g['i'], 'short' => $g['short'], 'name' => $g['Gateway (proxy)']],
            'catchment' => array_map(fn ($t) => ['ID' => $t['ID'], 'Place' => $t['Place'], 'km' => $t['Gateway km'], 'pop' => $t['Population used']], $towns),
            'population' => array_sum(array_map(fn ($t) => (float) $t['Population used'], $towns)),
            'policy' => $pol,
            'fact' => $fact ? ['id' => $c['fact'], 'value' => $fact['Value']] : null,
            'templates' => ProtoSearch::sweepRows($tpl),
            'map' => ['geo' => ProtoSearch::geo(true), 'towns' => ProtoSearch::mapTowns(), 'gateways' => ProtoSearch::mapGateways()],
            'report' => ProtoSearch::svc('AAB-EMB-194'),
            'clearance' => ProtoSearch::svc('AAB-EMB-164'),
            'rail' => ProtoSearch::rail(['AAB-EMB-166', 'AAB-EMB-167', 'AAB-EMB-165', 'AAB-EMB-174', 'AAB-EMB-176']),
        ], 'Trade Corridor');
    }
}
