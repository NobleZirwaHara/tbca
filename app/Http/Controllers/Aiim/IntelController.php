<?php

namespace App\Http\Controllers\Aiim;

use App\Support\Aiim\ProtoSearch;
use App\Support\CountryHub\CountryHub;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Prototype pages with no AIIM mock-up number, per country: the Leads Centre and lead records
 * (prototype leads, lead.{id}), the HS code mapper in English and Setswana (hs, hs.{product}) and
 * the investor and trader information types (invinfo, trdinfo). Botswana carries the BW-1.0 pack;
 * other countries show the same template with the continental Issue 2.0 registers and a
 * "country pack loading" state for the Botswana-only sections.
 */
class IntelController extends AiimController
{
    private function country(string $slug): array
    {
        $c = CountryHub::country($slug);
        abort_unless($c, 404);

        return $c;
    }

    private function page(Request $request, array $c, string $page, array $props, string $context): Response
    {
        $bw = CountryHub::isBW($c) && ProtoSearch::ready();
        $this->select($request, ['country' => $c['name']]);

        return $this->render($request, 'Aiim/Intel/'.$page, $props + [
            'bw' => $bw,
            'c' => ['slug' => $c['slug'], 'name' => $c['name'], 'iso3' => $c['iso3'], 'iso2' => $c['iso2'] ?? null],
            'facts' => $bw ? ProtoSearch::factsIn($props) : (object) [],
            'saved' => $this->savedKeys($request->user()),
        ], $context);
    }

    private function bw(array $c): bool
    {
        return CountryHub::isBW($c) && ProtoSearch::ready();
    }

    /* ------------------------------------------------------------------ Leads Centre */

    public function leads(Request $request, string $slug): Response
    {
        $c = $this->country($slug);
        if (! $this->bw($c)) {
            return $this->page($request, $c, 'Leads', [], 'Leads Centre');
        }
        $g1 = ProtoSearch::slice('G-1');
        $per = [];
        $cur = null;
        foreach (ProtoSearch::slice('G-3') as $b) {
            if (($b['t'] ?? '') === 'p' && in_array($b['s'] ?? '', ['First Paragraph', 'Body Text'], true)) {
                $cur = preg_replace('/\s*\(.*\)/', '', (string) $b['x']);
            } elseif (($b['t'] ?? '') === 'tbl' && $cur !== null) {
                $per[] = ['label' => $cur, 'rows' => $b['rows']];
            }
        }

        return $this->page($request, $c, 'Leads', [
            'partG' => ProtoSearch::table('PART G'),
            'g1' => ProtoSearch::table('G-1'),
            'g1text' => array_values(array_map(fn ($b) => (string) $b['x'], array_filter($g1, fn ($b) => ($b['t'] ?? '') === 'p' && ($b['s'] ?? '') !== 'Heading 2'))),
            'g3' => $per,
            'g4' => ProtoSearch::table('G-4'),
            'hotLeads' => ProtoSearch::reg('BW_Hotspot_Leads'),
            'ranked' => ProtoSearch::page($request, 'rl', ProtoSearch::reg('BW_Ranked_Leads'), ProtoSearch::headers('BW_Ranked_Leads'), ['Sector', 'Unit', 'Tier', 'Persona'], 15),
            'coverage' => ProtoSearch::page($request, 'cv', ProtoSearch::reg('BW_Coverage'), ProtoSearch::headers('BW_Coverage'), ['Sector', 'Unit', 'Tier'], 20),
            'rail' => ProtoSearch::rail(['AAB-EMB-207', 'AAB-EMB-208', 'AAB-EMB-188', 'AAB-EMB-175', 'AAB-EMB-171']),
        ], 'Leads Centre');
    }

    public function lead(Request $request, string $slug, string $id): Response
    {
        $c = $this->country($slug);
        if (! $this->bw($c)) {
            return $this->page($request, $c, 'Lead', ['id' => $id, 'lead' => null], 'Lead');
        }
        $l = collect(ProtoSearch::reg('BW_Hotspot_Leads'))->firstWhere('Lead ID', $id) ?? collect(ProtoSearch::reg('BW_Ranked_Leads'))->firstWhere('Lead ID', $id);
        abort_unless($l, 404);
        $this->select($request, ['item' => $l['Opportunity']]);

        return $this->page($request, $c, 'Lead', [
            'id' => $id,
            'lead' => $l,
            'brief' => ProtoSearch::brief('Pre-introduction counterparty verification', 'Check the institution before first contact', 'AAB-EMB-208', 'Verify'),
            'rail' => ProtoSearch::rail(['AAB-EMB-207', 'AAB-EMB-171', 'AAB-EMB-188']),
        ], 'Lead');
    }

    /* ------------------------------------------------------------------ Commodity HS */

    public function hs(Request $request, string $slug): Response
    {
        $c = $this->country($slug);
        $bw = $this->bw($c);
        $groups = [];
        if ($bw) {
            foreach (ProtoSearch::reg('BW_Products') as $p) {
                $groups[$p['Group']][] = $p;
            }
        }

        return $this->page($request, $c, 'Hs', [
            'lead' => $bw ? ProtoSearch::para('PART E', 'First Paragraph') : '',
            'groups' => array_map(fn ($g, $list) => ['group' => $g, 'products' => $list], array_keys($groups), array_values($groups)),
            'commodities' => ProtoSearch::reg('I2_Commodity_HS'),
            'mapper' => ProtoSearch::svc('AAB-EMB-126'),
            'landed' => ProtoSearch::svc('AAB-EMB-133'),
            'rail' => ProtoSearch::rail(['AAB-EMB-126', 'AAB-EMB-127', 'AAB-EMB-128', 'AAB-EMB-129', 'AAB-EMB-130', 'AAB-EMB-131', 'AAB-EMB-132', 'AAB-EMB-134'], 'Trade services', 8),
        ], 'Commodity HS');
    }

    public function product(Request $request, string $slug, string $product): Response
    {
        $c = $this->country($slug);
        $bw = $this->bw($c);
        $name = rawurldecode($product);
        $p = $bw ? collect(ProtoSearch::reg('BW_Products'))->firstWhere('Product', $name) : null;
        $i2 = collect(ProtoSearch::reg('I2_Commodity_HS'))->firstWhere('Commodity', $name);
        abort_unless($p || $i2, 404);
        $rows = $p
            ? array_values(array_filter(ProtoSearch::reg('BW_Trader_InfoTypes'), fn ($r) => $r['Product'] === $name))
            : array_values(array_filter(ProtoSearch::reg('I2_Trader_InfoTypes'), fn ($r) => $r['Commodity'] === $name));
        $this->select($request, ['item' => $name]);

        return $this->page($request, $c, 'HsProduct', [
            'name' => $name,
            'product' => $p,
            'commodity' => $i2,
            'hs' => $p ? $p['HS 2022'] : $i2['HS 2022 (6-digit)'],
            'sector' => $p ? $p['Sector'] : $i2['Sector'],
            'rows' => array_map(fn ($r) => [
                'q' => $r['Q'] ?? $r['Q code'] ?? '', 'question' => $r['Question'], 'tag' => $r['Tag'], 'info' => $r['Information type'],
                'map' => $r['Map behaviour'], 'anchor' => $r['Botswana anchor'] ?? $r['SA model anchor'] ?? '', 'gate' => $r['Gate'] ?? null,
            ], $rows),
            'anchorLabel' => $p ? 'Botswana anchor' : 'SA model anchor',
            'record' => ProtoSearch::svc('AAB-EMB-127'),
            'tariff' => ProtoSearch::svc('AAB-EMB-130'),
        ], 'Commodity HS');
    }

    /* ------------------------------------------------------------------ Investor and trader info types */

    public function investorQuestions(Request $request, string $slug): Response
    {
        $c = $this->country($slug);
        $bw = $this->bw($c);
        $bwRows = $bw ? ProtoSearch::reg('BW_Investor_InfoTypes') : [];
        $i2 = ProtoSearch::reg('I2_Investor_InfoTypes');
        $bySec = ProtoSearch::countBy($bwRows, 'Sector');

        return $this->page($request, $c, 'InvestorQuestions', [
            'chain' => $bw ? ProtoSearch::reg('BW_Investor_Chain') : [],
            'kpi' => ['questions' => 45, 'bwRows' => count($bwRows), 'i2Rows' => count($i2), 'assets' => count(ProtoSearch::reg('I2_Asset_Register'))],
            'bySector' => array_map(fn ($code, $s) => ['n' => $code, 'v' => $bySec[$code] ?? 0, 'c' => $s[1]], array_keys(ProtoSearch::SECTORS), ProtoSearch::SECTORS),
            'bwRows' => $bw ? ProtoSearch::page($request, 'bw', $bwRows, ProtoSearch::headers('BW_Investor_InfoTypes'), ['Sector', 'Q', 'Tag'], 20) : null,
            'i2Rows' => ProtoSearch::page($request, 'i2', $i2, ProtoSearch::headers('I2_Investor_InfoTypes'), ['Sector', 'Q code', 'Tag', 'Gate'], 20),
            'chains' => $bw ? array_values(array_filter(ProtoSearch::reg('BW_Chains'), fn ($r) => $r['Chain'] === 'Investor')) : [],
            'assets' => ProtoSearch::reg('I2_Asset_Register'),
            'i2Chain' => ProtoSearch::reg('I2_Investor_Chain'),
            'analyst' => ProtoSearch::svc('AAB-EMB-184'),
            'rail' => ProtoSearch::rail(['AAB-EMB-096', 'AAB-EMB-098', 'AAB-EMB-102', 'AAB-EMB-104', 'AAB-EMB-105', 'AAB-EMB-106', 'AAB-EMB-107', 'AAB-EMB-111'], 'Investor information services', 8),
        ], 'Investor Info Type');
    }

    public function traderQuestions(Request $request, string $slug): Response
    {
        $c = $this->country($slug);
        $bw = $this->bw($c);
        $bwRows = $bw ? ProtoSearch::reg('BW_Trader_InfoTypes') : [];
        $i2 = ProtoSearch::reg('I2_Trader_InfoTypes');
        $byG = ProtoSearch::countBy($bwRows, 'Group');

        return $this->page($request, $c, 'TraderQuestions', [
            'chain' => $bw ? ProtoSearch::reg('BW_Trader_Chain') : [],
            'kpi' => ['questions' => 40, 'bwRows' => count($bwRows), 'i2Rows' => count($i2), 'products' => ($bw ? count(ProtoSearch::reg('BW_Products')) : 0) + count(ProtoSearch::reg('I2_Commodity_HS'))],
            'byGroup' => array_map(fn ($n, $v) => ['n' => (string) $n, 'v' => $v], array_keys($byG), array_values($byG)),
            'bwRows' => $bw ? ProtoSearch::page($request, 'bw', $bwRows, ProtoSearch::headers('BW_Trader_InfoTypes'), ['Group', 'Q', 'Tag'], 20) : null,
            'i2Rows' => ProtoSearch::page($request, 'i2', $i2, ProtoSearch::headers('I2_Trader_InfoTypes'), ['Group', 'Q code', 'Tag', 'Gate'], 20),
            'chains' => $bw ? array_values(array_filter(ProtoSearch::reg('BW_Chains'), fn ($r) => $r['Chain'] === 'Trader')) : [],
            'i2Chain' => ProtoSearch::reg('I2_Trader_Chain'),
            'analyst' => ProtoSearch::svc('AAB-EMB-187'),
            'rail' => ProtoSearch::rail(['AAB-EMB-126', 'AAB-EMB-129', 'AAB-EMB-130', 'AAB-EMB-131', 'AAB-EMB-133', 'AAB-EMB-135', 'AAB-EMB-137', 'AAB-EMB-207'], 'Trader services', 8),
        ], 'Trader Info Type');
    }
}
