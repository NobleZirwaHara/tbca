<?php

namespace App\Support\Industries;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Read model for the Industries tab (MP-INDUSTRIES-1.0 prototype data loaded by IndustriesSeeder).
 *
 * Mirrors the prototype's data helpers (ind-core.js): industries and sub-industries, the 17 x 54
 * opportunity matrix, the Sprint classification, boundary rules, the trade model and the
 * Botswana / continental registers. Selling prices come only from the app's Sprint records,
 * matched by Sprint code; unmatched Sprints carry no price.
 */
class IndustryData
{
    private const TTL = 600;

    public const AIIM_NAMES = [
        'ENR' => 'Energy & Power', 'OGS' => 'Fuels, Strategic Reserves & CBM', 'MIN' => 'Diamonds, Copper & Mining', 'AGR' => 'Livestock, Beef & Horticulture',
        'BLU' => 'Fisheries & Aquaculture', 'FOR' => 'Forestry & Veld Products', 'MFG' => 'Manufacturing, SEZs & Beneficiation', 'WSW' => 'Water, Sanitation & Waste',
        'TRN' => 'Transport, Corridors & Logistics', 'ICT' => 'Digital, Mobile Money & 5G', 'CRE' => 'Construction, Roads & Housing', 'TOU' => 'Tourism',
        'HLT' => 'Health & Pharmaceuticals', 'EDU' => 'Education & Skills', 'FIN' => 'Finance, Pensions & Fintech', 'TRD' => 'Trade, Retail & Citizen Markets',
        'GRN' => 'Green Economy & Climate Finance', 'CSP' => 'Creative, Sport & Professional Services',
    ];

    /** Regulator roles used where a country pack has not named the body. */
    public const REG_ROLES = ['Revenue / tax authority', 'Companies registry', 'Competition authority', 'Environmental authority', 'Labour ministry', 'Investment promotion agency', 'Standards bureau'];

    public const IND_REG_ROLE = [
        'AGR' => ['Ministry of Agriculture', 'Veterinary services', 'Plant protection / phytosanitary'], 'MIN' => ['Ministry of Mines', 'Mining cadastre', 'Mine safety inspectorate'],
        'MFG' => ['Trade & industry ministry', 'SEZ authority', 'Standards bureau'], 'ENE' => ['Energy regulator', 'Power utility', 'Water authority'],
        'PRC' => ['Building control / councils', 'Construction industry board', 'Land board / deeds'], 'RET' => ['Consumer protection', 'Trade licensing', 'Data protection authority'],
        'TRN' => ['Roads / transport authority', 'Customs & border', 'Civil aviation'], 'ICT' => ['Communications regulator', 'Data protection authority', 'Cybersecurity agency'],
        'FIN' => ['Central bank', 'Non-bank financial regulator', 'Financial intelligence unit'], 'PRO' => ['Professional bodies (law, audit, tax)', 'Companies registry', 'Labour ministry'],
        'HLT' => ['Medicines regulator', 'Health professions council', 'Ministry of Health'], 'EDU' => ['Qualifications authority', 'Ministry of Education', 'Higher-education council'],
        'TOU' => ['Tourism board / licensing', 'Wildlife / parks authority', 'Environmental authority'], 'CRE' => ['Copyright / IP office', 'Broadcasting regulator', 'Film & classification board'],
        'INF' => ['PPP unit', 'Public procurement authority', 'Treasury / finance ministry'], 'GOV' => ['Public procurement authority', 'Auditor-General', 'Public service commission'],
        'NGO' => ['NPO / NGO registrar', 'Donor coordination unit', 'Social development ministry'],
    ];

    public const ZA_REGS = [
        ['IRBA', 'Independent Regulatory Board for Auditors', 'PRO,FIN'], ['SARS', 'South African Revenue Service', '*'], ['CIPC', 'Companies and Intellectual Property Commission', '*'],
        ['FSCA', 'Financial Sector Conduct Authority', 'FIN'], ['PA', 'Prudential Authority (SARB)', 'FIN'], ['ICASA', 'Independent Communications Authority of SA', 'ICT,CRE'],
        ['DEL', 'Department of Employment and Labour', '*'], ['CCSA', 'Competition Commission South Africa', '*'], ['DFFE', 'Dept. Forestry, Fisheries & Environment (NEMA)', 'AGR,MIN,ENE,INF,PRC'],
        ['DMRE', 'Dept. Mineral Resources & Energy', 'MIN,ENE'], ['NERSA', 'National Energy Regulator of SA', 'ENE'], ['SAHPRA', 'SA Health Products Regulatory Authority', 'HLT'],
        ['HPCSA', 'Health Professions Council of SA', 'HLT'], ['SAQA', 'South African Qualifications Authority', 'EDU'], ['DALRRD', 'Dept. Agriculture, Land Reform & Rural Dev.', 'AGR'],
        ['PPECB', 'Perishable Products Export Control Board', 'AGR'], ['CIDB', 'Construction Industry Development Board', 'PRC,INF'], ['SANRAL', 'SA National Roads Agency', 'TRN,INF'],
        ['NT-PPP', 'National Treasury PPP Unit', 'INF,GOV'], ['TGCSA', 'Tourism Grading Council of SA', 'TOU'], ['DSD', 'Dept. of Social Development (NPO Directorate)', 'NGO'],
    ];

    public static function ready(): bool
    {
        return once(fn () => Schema::hasTable('ind_industries') && DB::table('ind_industries')->exists());
    }

    public static function forget(): void
    {
        foreach (['ind:industries', 'ind:sprints', 'ind:countries', 'ind:scores', 'ind:meta', 'ind:trade'] as $k) {
            Cache::forget($k);
        }
        foreach (array_keys(self::REGISTERS) as $r) {
            Cache::forget('ind:reg:'.$r);
        }
    }

    /* ------------------------------------------------------------------ industries */

    /** @return array<string, array> keyed by industry code, in taxonomy order */
    public static function industries(): array
    {
        return once(fn () => Cache::remember('ind:industries', self::TTL, function () {
            $subs = DB::table('ind_sub_industries')->orderBy('industry_code')->orderBy('sort')->get()->groupBy('industry_code');
            $out = [];
            foreach (DB::table('ind_industries')->orderBy('number')->get() as $r) {
                $out[$r->code] = [
                    'code' => $r->code, 'number' => (int) $r->number, 'slug' => $r->slug, 'name' => $r->name, 'short' => $r->short, 'desc' => $r->description,
                    'w' => json_decode($r->weights, true), 'cx' => (int) $r->complexity, 'reg' => $r->regulatory, 'gate' => $r->human_gate,
                    'aiim' => json_decode($r->aiim, true), 'hs' => json_decode($r->hs, true), 'stats' => json_decode($r->stats, true),
                    'cat' => $r->catalogue, 'variant' => $r->variant,
                    'subs' => ($subs[$r->code] ?? collect())->map(fn ($s) => ['code' => $s->code, 'name' => $s->name, 'desc' => $s->description, 'aiim' => json_decode($s->aiim, true), 'hs' => json_decode($s->hs, true)])->values()->all(),
                ];
            }

            return $out;
        }));
    }

    /** Find an industry by slug or code (case-insensitive). */
    public static function industry(?string $key): ?array
    {
        if ($key === null || $key === '') {
            return null;
        }
        $all = self::industries();

        return $all[strtoupper($key)] ?? collect($all)->firstWhere('slug', strtolower($key));
    }

    public static function sub(array $ind, ?string $code): ?array
    {
        return $code ? collect($ind['subs'])->firstWhere('code', $code) : null;
    }

    public static function meta(string $key): mixed
    {
        $all = once(fn () => Cache::remember('ind:meta', self::TTL, fn () => DB::table('ind_meta')->pluck('value', 'key')->map(fn ($v) => json_decode($v, true))->all()));

        return $all[$key] ?? null;
    }

    public static function fams(): array
    {
        return self::meta('fams') ?? [];
    }

    public static function cxName(int|string $n): string
    {
        return (self::meta('cxn') ?? [])[(string) $n] ?? 'C'.$n;
    }

    public static function famW(array $ind, ?string $fam): int
    {
        return (int) ($ind['w'][$fam] ?? 0);
    }

    /* ------------------------------------------------------------------ countries */

    /** @return array<string, array> keyed by ISO3, in prototype order (by AU region) */
    public static function countries(): array
    {
        return once(fn () => Cache::remember('ind:countries', self::TTL, function () {
            $out = [];
            foreach (DB::table('ind_countries')->orderBy('sort')->get() as $c) {
                $out[$c->iso3] = [
                    'iso3' => $c->iso3, 'iso2' => $c->iso2, 'slug' => $c->slug, 'name' => $c->name, 'region' => $c->region, 'wave' => $c->wave, 'pack' => $c->pack,
                    'packStatus' => $c->pack_status, 'capital' => $c->capital, 'currency' => $c->currency, 'languages' => $c->languages,
                    'pop' => $c->pop === null ? null : (float) $c->pop, 'gdp' => $c->gdp === null ? null : (float) $c->gdp, 'landlocked' => (bool) $c->landlocked,
                    'recs' => $c->recs, 'rcs' => (int) $c->rcs, 'vat' => $c->vat === null ? null : (float) $c->vat,
                ];
            }

            return $out;
        }));
    }

    /** Find a country by slug, ISO3 or ISO2. */
    public static function country(?string $key): ?array
    {
        if (! $key) {
            return null;
        }
        $all = self::countries();
        $k = strtoupper($key);

        return $all[$k] ?? collect($all)->first(fn ($c) => $c['slug'] === strtolower($key) || $c['iso2'] === $k);
    }

    /** Compact list for selects and maps. */
    public static function countryOptions(): array
    {
        return array_values(array_map(fn ($c) => ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name'], 'region' => $c['region']], self::countries()));
    }

    public static function industryOptions(): array
    {
        return array_values(array_map(fn ($i) => ['code' => $i['code'], 'slug' => $i['slug'], 'name' => $i['name']], self::industries()));
    }

    /* ------------------------------------------------------------------ matrix */

    /** @return array<string, array<string, array{s: float, e: float, m: float}>> [industry code][iso3] */
    public static function scores(): array
    {
        return once(fn () => Cache::remember('ind:scores', self::TTL, function () {
            $out = [];
            foreach (DB::table('ind_country_scores')->get() as $r) {
                $out[$r->industry_code][$r->iso3] = ['s' => (float) $r->score, 'e' => (float) $r->exports, 'm' => (float) $r->imports];
            }

            return $out;
        }));
    }

    public static function score(array $ind, string $iso3): array
    {
        return self::scores()[$ind['code']][$iso3] ?? ['s' => 0.0, 'e' => 0.0, 'm' => 0.0];
    }

    /** Rank (1 to 54) of a country for an industry on the modelled score. */
    public static function rank(array $ind, string $iso3): int
    {
        return self::ranks()[$ind['code']][$iso3] ?? 0;
    }

    /** @return array<string, array<string, int>> */
    private static function ranks(): array
    {
        return once(function () {
            $out = [];
            foreach (self::scores() as $code => $row) {
                $isos = array_keys(self::countries());
                $vals = array_map(fn ($iso) => [$row[$iso]['s'] ?? 0, $iso], $isos);
                usort($vals, fn ($a, $b) => $b[0] <=> $a[0]);
                foreach ($vals as $i => [$s, $iso]) {
                    $out[$code][$iso] = $i + 1;
                }
            }

            return $out;
        });
    }

    /** Score band label and tone (prototype scoreBand). */
    public static function band(float $s): array
    {
        return $s >= 75 ? ['High Opportunity', 'ok'] : ($s >= 55 ? ['Moderate-High', 'info'] : ($s >= 40 ? ['Moderate', 'warn'] : ['Emerging', 'grey']));
    }

    /** Map payload: iso3 => [score, exports, imports, rank] for one industry. */
    public static function mapValues(array $ind): array
    {
        $out = [];
        foreach (self::countries() as $iso => $c) {
            $s = self::score($ind, $iso);
            $out[$iso] = [$s['s'], $s['e'], $s['m'], self::rank($ind, $iso)];
        }

        return $out;
    }

    /* ------------------------------------------------------------------ Sprints */

    /**
     * The 7,589 classified Sprints keyed by code, each joined to the app's Sprint record
     * (by code) for its selling prices. `ep` is the entry price in whole ZAR, or null when the
     * code is not in the app's catalogue or the app record is not published.
     *
     * @return array<string, array>
     */
    public static function sprints(): array
    {
        return once(fn () => Cache::remember('ind:sprints', self::TTL, function () {
            $out = [];
            DB::table('ind_sprints')->leftJoin('sprints', 'sprints.code', '=', 'ind_sprints.code')
                ->select('ind_sprints.*', 'sprints.id as app_id', 'sprints.slug as app_slug', 'sprints.title as app_title', 'sprints.status as app_status', 'sprints.price_zar as app_price', 'sprints.packages as app_packages')
                ->orderBy('ind_sprints.id')
                ->chunk(2000, function ($rows) use (&$out) {
                    foreach ($rows as $r) {
                        $out[$r->code] = self::sprintRow($r);
                    }
                });

            return $out;
        }));
    }

    private static function sprintRow(object $r): array
    {
        $pub = (string) ($r->published_tiers ?? '');
        $tiers = [];
        $matched = $r->app_id !== null;
        $live = $matched && $r->app_status === 'published';
        if ($live) {
            $packages = collect(json_decode((string) $r->app_packages, true) ?: [])->keyBy(fn ($p) => strtolower((string) ($p['key'] ?? $p['name'] ?? '')));
            foreach (['Basic' => 'b', 'Standard' => 's', 'Premium' => 'p'] as $tier => $letter) {
                $zar = (int) ($packages[strtolower($tier)]['zar'] ?? 0);
                if ($zar > 0 && ($pub === '' || str_contains($pub, $letter))) {
                    $tiers[$tier] = $zar;
                }
            }
            if (! $tiers && (int) $r->app_price > 0) {
                $tiers[$r->entry_tier ?: 'Standard'] = (int) $r->app_price;
            }
        }
        $entry = isset($tiers[$r->entry_tier]) ? $r->entry_tier : (array_key_first($tiers) ?? $r->entry_tier);

        return [
            'code' => $r->code, 'name' => $r->name, 'type' => $r->type, 'fam' => $r->family, 'cx' => (int) $r->complexity, 'viable' => (bool) $r->viable,
            'pop' => $r->population, 'entry' => $entry, 'pub' => $pub, 'blk' => $r->rules, 'up' => $r->archetype,
            'cost' => ['Basic' => $r->cost_basic, 'Standard' => $r->cost_standard, 'Premium' => $r->cost_premium],
            'tiers' => $tiers, 'ep' => $tiers[$entry] ?? null,
            'app' => $matched ? ['id' => (int) $r->app_id, 'slug' => $r->app_slug, 'title' => $r->app_title, 'status' => $r->app_status] : null,
        ];
    }

    public static function sprint(string $code): ?array
    {
        return self::sprints()[$code] ?? null;
    }

    /** Applicable to the industry: the Sprint's family weight is at least 2 (prototype sprInd). */
    public static function applies(array $ind, array $s): bool
    {
        return self::famW($ind, $s['fam']) >= 2;
    }

    /** Boundary rules that block or restrict this Sprint for this industry (prototype blockFor). */
    public static function blockFor(array $ind, array $s): array
    {
        if (! $s['blk']) {
            return [];
        }
        $rules = self::rules();
        $out = [];
        foreach (explode(',', $s['blk']) as $id) {
            $r = $rules[trim($id)] ?? null;
            if ($r && ($r['inds'] === '*' || in_array($ind['code'], (array) $r['inds'], true))) {
                $out[] = $r;
            }
        }

        return $out;
    }

    /** @return array<string, array> boundary rules keyed by id */
    public static function rules(): array
    {
        return once(fn () => collect(self::meta('block_rules') ?? [])->keyBy('id')->all());
    }

    /** Classification says sellable (viable and published) and the app prices it. */
    public static function priced(array $s): bool
    {
        return $s['viable'] && $s['pop'] === 'PUBLISHED' && $s['ep'] !== null && $s['ep'] > 0;
    }

    /**
     * Industry Sprint picking (prototype pickSprints): sellable, not blocked, family weight at
     * least minW, core families first then cheapest, one per base name.
     */
    public static function pickSprints(array $ind, array $o = []): array
    {
        $min = $o['minW'] ?? 3;
        $list = array_filter(self::sprints(), fn ($s) => self::priced($s) && self::famW($ind, $s['fam']) >= $min && ! self::blockFor($ind, $s)
            && (! isset($o['type']) || $s['type'] === $o['type']) && (! isset($o['fam']) || $s['fam'] === $o['fam']) && (! isset($o['max']) || $s['cx'] <= $o['max']));
        usort($list, fn ($a, $b) => (self::famW($ind, $b['fam']) <=> self::famW($ind, $a['fam'])) ?: ($a['ep'] <=> $b['ep']));
        $seen = [];
        $out = [];
        foreach ($list as $s) {
            $base = preg_replace('/ - .*/', '', preg_replace('/ (Starter|Tracker|Template|Checklist|Report)( Sprint)?/', '', $s['name']));
            if (isset($seen[$base])) {
                continue;
            }
            $seen[$base] = true;
            $out[] = $s;
            if (count($out) >= ($o['n'] ?? 4)) {
                break;
            }
        }

        return $out;
    }

    /** Card payload for a Sprint in an industry (prototype iSprintCard). */
    public static function card(array $ind, array $s): array
    {
        $b = self::blockFor($ind, $s);

        return [
            'code' => $s['code'], 'name' => $s['name'], 'type' => $s['type'], 'fam' => $s['fam'], 'family' => self::fams()[$s['fam']] ?? $s['fam'],
            'cx' => $s['cx'], 'cxName' => self::cxName($s['cx']), 'ep' => $s['ep'], 'entry' => $s['entry'], 'tiers' => array_keys($s['tiers']),
            'block' => $b ? ['type' => $b[0]['type'], 'reason' => $b[0]['reason']] : null, 'priced' => self::priced($s), 'inApp' => $s['app'] !== null,
        ];
    }

    /** Sellable Sprints in a family for an industry (counts on the Priority Service Areas tiles). */
    public static function familyCounts(array $ind): array
    {
        return once(function () use ($ind) {
            $out = [];
            foreach (self::sprints() as $s) {
                if ($s['viable'] && $s['pop'] === 'PUBLISHED' && isset($ind['w'][$s['fam']]) && ! self::blockFor($ind, $s)) {
                    $out[$s['fam']] = ($out[$s['fam']] ?? 0) + 1;
                }
            }

            return $out;
        });
    }

    /** How many classified Sprint codes exist as app Sprint records, and how many of those carry a price. */
    public static function matchStats(): array
    {
        $all = self::sprints();
        $matched = array_filter($all, fn ($s) => $s['app'] !== null);

        return ['total' => count($all), 'matched' => count($matched), 'priced' => count(array_filter($matched, fn ($s) => $s['ep'] !== null)), 'unmatched' => count($all) - count($matched)];
    }

    /* ------------------------------------------------------------------ add-ons, regulators */

    /** Mandatory add-ons for an industry context (prototype addOnsFor). T is TBCA; P/X/S are separately disclosed. */
    public static function addOns(array $ind): array
    {
        $cheapest = function (string $fam, ?string $type = null) {
            $c = array_filter(self::sprints(), fn ($x) => $x['fam'] === $fam && self::priced($x) && (! $type || $x['type'] === $type));
            usort($c, fn ($a, $b) => $a['ep'] <=> $b['ep']);

            return $c[0] ?? null;
        };
        $lp = $cheapest('L', 'Partner-Delivered Sprint') ?? $cheapest('L');
        $qp = $cheapest('Q', 'Partner-Delivered Sprint') ?? $cheapest('Q');
        $list = [['id' => 'A1', 'name' => 'Legal & Regulatory Review', 'purpose' => 'Applicable laws, permits and sector regulations for the selected country.', 'ledger' => 'P', 'fee' => $lp['ep'] ?? null, 'basis' => $lp ? "Catalogue {$lp['code']}" : 'Quote', 'req' => $ind['cx'] >= 3]];
        $list[] = ['id' => 'A2', 'name' => 'Documentation & Evidence Verification', 'purpose' => 'Checks the documents the outputs rely on.', 'ledger' => 'P', 'fee' => $qp['ep'] ?? null, 'basis' => $qp ? "Catalogue {$qp['code']}" : 'Quote', 'req' => true];
        if (in_array($ind['code'], ['AGR', 'MFG', 'HLT', 'MIN', 'ENE'], true)) {
            $list[] = ['id' => 'A3', 'name' => $ind['code'] === 'HLT' ? 'Product Registration Dossier Check' : 'Product Quality / Lab Testing', 'purpose' => 'Independent testing or certification where the target market requires it.', 'ledger' => 'X', 'fee' => null, 'basis' => 'Accredited lab quote', 'req' => $ind['code'] !== 'MFG'];
        }
        $list[] = ['id' => 'A4', 'name' => 'Government Fees & Charges', 'purpose' => 'Statutory fees for permits, certificates and clearances (pass-through).', 'ledger' => 'S', 'fee' => null, 'basis' => 'Per schedule — varies', 'req' => true];

        return $list;
    }

    /** Regulators for an industry in a country (prototype regulatorsFor). */
    public static function regulators(array $ind, array $c): array
    {
        if ($c['iso3'] === 'BWA') {
            $rows = [];
            foreach (self::bySec(self::register('BW_Permits'), $ind) as $p) {
                foreach (preg_split('/;\s*/', (string) $p['Issuer']) as $is) {
                    $rows[] = ['name' => $is, 'type' => 'Issuer', 'what' => (string) $p['Permits'], 'time' => (string) $p['Typical time'], 'src' => 'BW_Permits', 'status' => 'Active'];
                }
            }
            $words = array_merge(['tax', 'compan', 'compet', 'invest', 'environ', 'labour', 'standard', 'central bank', 'regulat'], array_map(fn ($x) => strtolower(explode(' ', $x)[0]), self::IND_REG_ROLE[$ind['code']] ?? []));
            $rx = '/'.implode('|', array_map(fn ($w) => preg_quote($w, '/'), $words)).'/i';
            $n = 0;
            foreach (self::register('BW_Institutions') as $r) {
                if ($n < 12 && preg_match($rx, (string) $r['Role'])) {
                    $rows[] = ['name' => (string) $r['Botswana institution'], 'type' => (string) $r['Role'], 'what' => '—', 'time' => '—', 'src' => 'BW_Institutions', 'status' => 'Active'];
                    $n++;
                }
            }

            return $rows;
        }
        if ($c['iso3'] === 'ZAF') {
            return array_values(array_map(fn ($r) => ['name' => "{$r[1]} ({$r[0]})", 'type' => 'Regulator', 'what' => 'Mock-up register (Page 31)', 'time' => '—', 'src' => 'Reference', 'status' => 'Active'],
                array_filter(self::ZA_REGS, fn ($r) => $r[2] === '*' || in_array($ind['code'], explode(',', $r[2]), true))));
        }

        return array_map(fn ($role) => ['name' => "{$role} — {$c['name']}", 'type' => 'Role', 'what' => 'Named body to be confirmed by the country pack', 'time' => '—', 'src' => 'Placeholder', 'status' => 'To verify'],
            array_merge(self::IND_REG_ROLE[$ind['code']] ?? [], self::REG_ROLES));
    }

    /* ------------------------------------------------------------------ registers */

    public const REGISTERS = [
        'BW_Facts' => 1, 'BW_Opportunities' => 1, 'BW_Priority' => 1, 'BW_Permits' => 1, 'BW_UnitEconomics' => 1, 'BW_Chains' => 1, 'BW_Products' => 1,
        'I2_Opportunity_Register' => 1, 'I2_Commodity_HS' => 1, 'BW_Top30' => 1, 'BW_Shocks' => 1, 'BW_RegChange' => 1, 'BW_Policy' => 1, 'BW_Sources' => 1,
        'BW_Downturn' => 1, 'I2_WX_Facts' => 1, 'I2_WX_Opportunities' => 1, 'I2_WX_Chains' => 1, 'BW_Ranked_Leads' => 1, 'BW_MapStack' => 1, 'I2_Map_Layers' => 1,
        'BW_Tornado' => 1, 'BW_Institutions' => 1, 'BW_DataGaps' => 1,
    ];

    /** All rows of a register as associative arrays (column header => value). */
    public static function register(string $name): array
    {
        return once(fn () => Cache::remember('ind:reg:'.$name, self::TTL, fn () => DB::table('ind_register_rows')->where('register', $name)->orderBy('row_no')->pluck('data')
            ->map(fn ($d) => json_decode($d, true))->all()));
    }

    /** Rows whose sector is one of the industry's AIIM sectors (prototype bySec). */
    public static function bySec(array $rows, array $ind, string $key = 'Sector'): array
    {
        return array_values(array_filter($rows, fn ($r) => in_array((string) ($r[$key] ?? ''), $ind['aiim'], true)));
    }

    /** Rows for an explicit list of sector codes. */
    public static function inSectors(array $rows, array $codes, string $key = 'Sector'): array
    {
        return array_values(array_filter($rows, fn ($r) => in_array((string) ($r[$key] ?? ''), $codes, true)));
    }

    /* ------------------------------------------------------------------ trade */

    /**
     * Modelled intra-African trade (prototype trade()): flow(a, b) = exports a -> b by HS group,
     * plus each country's exports to and imports from the rest of Africa.
     */
    public static function trade(): array
    {
        return once(fn () => Cache::remember('ind:trade', self::TTL, function () {
            $meta = self::meta('trade');
            $g = count($meta['groups']);
            $flows = [];
            foreach (DB::table('ind_trade_flows')->get() as $r) {
                $flows[$r->exporter][$r->importer] = array_map('floatval', json_decode($r->flows, true));
            }
            $exp = [];
            $imp = [];
            foreach ($meta['isos'] as $i) {
                $exp[$i] = array_fill(0, $g, 0.0);
                $imp[$i] = array_fill(0, $g, 0.0);
            }
            foreach ($flows as $a => $row) {
                foreach ($row as $b => $f) {
                    foreach ($f as $k => $v) {
                        $exp[$a][$k] += $v;
                        $imp[$b][$k] += $v;
                    }
                }
            }

            return $meta + ['flows' => $flows, 'expAfrica' => $exp, 'impAfrica' => $imp];
        }));
    }

    public static function flow(array $t, string $a, string $b): array
    {
        return $a === $b ? array_fill(0, count($t['groups']), 0.0) : ($t['flows'][$a][$b] ?? array_fill(0, count($t['groups']), 0.0));
    }

    /** Group label without its HS range (prototype short). */
    public static function short(string $g): string
    {
        return (string) preg_replace('/\s*\(HS[^)]*\)/', '', $g);
    }
}
