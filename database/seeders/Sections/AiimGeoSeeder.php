<?php

namespace Database\Seeders\Sections;

use App\Models\Aiim\AdminUnit;
use App\Models\Aiim\Country;
use App\Models\Aiim\CountryPack;
use App\Models\Aiim\MapFeature;
use App\Models\Aiim\MapLayer;
use App\Models\Aiim\OpportunityTemplate;
use App\Models\Aiim\Project;
use App\Models\Aiim\Province;
use App\Models\Aiim\QuestionChain;
use App\Models\Aiim\Source;
use App\Support\Aiim\MapLayers;
use App\Support\Aiim\ProjectBriefs;
use App\Support\Aiim\SectorCodes;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * AIIM geographic intelligence for all 54 countries. Idempotent: every row is
 * keyed on a stable code and updated in place.
 *
 * Sources (JSON exports in database/seeders/Sections/data/aiim):
 *  - registers/*        TBCA AIIM Deep Registers 2.1 (Country_Activation, Map_Layers, Asset_Register,
 *                       Opportunity_Register, Investor_Chain, Trader_Chain, WX_Chains, WX_Opportunities)
 *  - botswana/*, geo/botswana.json  TBCA AIIM Botswana Country Pack BW-1.0 and its prototype registers
 *  - geo/africa_outlines.json       Natural Earth country outlines (lon/lat, simplified)
 *  - screening_register.json        TBCA Screening Register, 54 opportunities (8 Oct 2026)
 *  - project_briefs.json            AIIM_Import.json, the 26 briefed projects (QUALIFIED and WATCHLIST)
 *
 * Run alone with: php artisan db:seed --class="Database\Seeders\Sections\AiimGeoSeeder"
 */
class AiimGeoSeeder extends Seeder
{
    private const DATA = __DIR__.'/data/aiim';

    private const PACK_SOURCE = 'TBCA AIIM Botswana Country Pack BW-1.0 (9 Oct 2026)';

    private const REGISTER_SOURCE = 'TBCA AIIM Deep Registers 2.1 (9 Oct 2026)';

    /** Packs issued per the BW-1.0 roll-out table (Wave 0 done) but not yet supplied to the platform. */
    private const ISSUED_NOT_LOADED = ['MW' => 'MW-1.0', 'GH' => 'GH-1.0', 'NG' => 'NG-1.0', 'EG' => 'EG-1.0', 'MA' => 'MA-1.0', 'ZA' => 'ZA-1.0', 'DZ' => 'DZ-1.0'];

    public function run(): void
    {
        $this->sources();
        $this->activation();
        $this->layers();
        $this->botswanaUnits();
        $this->southAfricaProvinces();
        $this->registerSubregions();
        $this->briefs();
        $this->botswanaFeatures();
        $this->templates();
        $this->chains();
        $this->botswanaPack();

        Project::query()->whereNull('country_iso2')->update(['country_iso2' => 'ZA']);
    }

    private function json(string $file): array
    {
        return json_decode((string) file_get_contents(self::DATA.'/'.$file), true, flags: JSON_THROW_ON_ERROR);
    }

    private function sources(): void
    {
        $rows = [
            [ProjectBriefs::SOURCE_CODE, 'TBCA Screening Register: 54 Opportunities', 'The Business Clinic.Africa', 'Project Screening', 'Project briefs and screening metrics', 'South Africa, Malawi, Madagascar, Eswatini, South Sudan', 3, 'CM-03', 72, 'review', '2026-10-08'],
            ['SRC-TBCA-BW-PACK-1.0', 'AIIM Botswana Country Pack BW-1.0', 'The Business Clinic.Africa', 'Country Pack', 'Geography, opportunities, sector worked examples', 'Botswana', 3, 'CM-03', 78, 'review', '2026-10-09'],
            ['SRC-TBCA-AIIM-REG-2.1', 'AIIM Deep Registers 2.1', 'The Business Clinic.Africa', 'Information Catalogue', 'Map layers, opportunity templates, investor and trader chains', 'Africa (54 countries)', 3, 'CM-03', 75, 'review', '2026-10-09'],
        ];
        foreach ($rows as [$code, $name, $provider, $category, $type, $coverage, $tier, $model, $conf, $status, $date]) {
            Source::updateOrCreate(['code' => $code], [
                'name' => $name, 'provider' => $provider, 'category' => $category, 'data_type' => $type, 'coverage' => $coverage,
                'tier' => $tier, 'confidence_model' => $model, 'confidence' => $conf, 'verification_status' => $status, 'status' => 'active',
                'last_updated' => $date, 'next_review' => now()->parse($date)->addMonths(3)->toDateString(),
                'profile' => ['description' => "{$name}, supplied by the client in October 2026 and loaded into AIIM.", 'premium' => false],
            ]);
        }
    }

    /** Country_Activation (wave and pack status) and boundary outlines for all 54 countries. */
    private function activation(): void
    {
        $outlines = $this->json('geo/africa_outlines.json');
        foreach ($this->json('registers/country_activation.json') as $r) {
            $country = Country::query()->where('iso3', $r['iso3'])->first();
            if (! $country) {
                continue;
            }
            $status = $r['pack_status'];
            $code = null;
            if ($country->iso2 === 'BW') {
                [$status, $code] = ['Pack loaded', 'BW-1.0'];
            } elseif (isset(self::ISSUED_NOT_LOADED[$country->iso2])) {
                $code = self::ISSUED_NOT_LOADED[$country->iso2];
                $status = $r['pack_status'] === 'Not started' ? 'Pack issued, awaiting upload' : $r['pack_status'];
            }
            $country->forceFill([
                'au_region' => $r['au_region'],
                'activation_wave' => $r['wave'],
                'pack_status' => $status,
                'pack_code' => $code,
                'outline' => $outlines[$r['iso3']] ?? null,
            ])->save();
        }
    }

    private function layers(): void
    {
        foreach (MapLayers::core() as $i => $l) {
            MapLayer::updateOrCreate(['key' => $l['key']], [
                'family' => 'core', 'sector_code' => null, 'label' => $l['label'], 'labels' => $l['labels'] ?? null, 'geometry' => $l['geometry'],
                'levels' => $l['levels'], 'security_class' => 'S0', 'color' => $l['color'], 'sort' => $i, 'source' => 'AIIM core layer',
            ]);
        }
        $assets = collect($this->json('registers/asset_register.json'))->keyBy('asset_id');
        foreach ($this->json('registers/map_layers.json') as $i => $r) {
            $r['layer'] ??= $r['asset_type'];
            MapLayer::updateOrCreate(['key' => 'asset:'.$r['asset_id'].':'.Str::slug($r['layer'])], [
                'family' => 'sector', 'sector_code' => $r['sector_code'], 'asset_id' => $r['asset_id'],
                'asset_type' => $assets[$r['asset_id']]['asset_type'] ?? $r['asset_type'], 'label' => $r['layer'], 'labels' => null,
                'geometry' => $r['geometry'], 'levels' => $r['levels'], 'security_class' => $r['security_class'],
                'color' => SectorCodes::color($r['sector_code']), 'sort' => 100 + $i, 'source' => self::REGISTER_SOURCE.', Map_Layers',
            ]);
        }
    }

    /** Find or create one admin unit under a parent; returns the unit. */
    private function unit(string $iso2, ?AdminUnit $parent, int $level, string $name, array $attrs = []): AdminUnit
    {
        $existing = AdminUnit::query()->where('country_iso2', $iso2)->where('parent_id', $parent?->id)->where('level', $level)->where('name', $name)->first();
        $slug = $existing?->slug ?? Str::slug($name);
        if (! $existing && AdminUnit::query()->where('country_iso2', $iso2)->where('slug', $slug)->exists()) {
            $slug .= '-'.AdminUnit::LEVELS[$level];
            $n = 2;
            while (AdminUnit::query()->where('country_iso2', $iso2)->where('slug', $slug)->exists()) {
                $slug = Str::slug($name).'-'.AdminUnit::LEVELS[$level].'-'.$n++;
            }
        }

        return AdminUnit::updateOrCreate(['country_iso2' => $iso2, 'slug' => $slug], $attrs + [
            'parent_id' => $parent?->id, 'level' => $level, 'level_key' => AdminUnit::LEVELS[$level], 'name' => $name,
        ]);
    }

    private function botswanaUnits(): void
    {
        // Setswana names taken from the Natural Earth alternate names in the BW-1.0 prototype
        // (only those that are Setswana; to be validated by the client with the product names).
        $alt = ['NW' => 'Bokone-Bophirima', 'SE' => 'Borwa-Botlhaba', 'SO' => 'Borwa', 'GH' => 'Ghantsi'];
        $kinds = ['district' => 'District', 'city' => 'City council', 'town' => 'Town council'];
        foreach ($this->json('botswana/units.json') as $i => $u) {
            $this->unit('BW', null, 1, $u['name'], [
                'kind' => $kinds[$u['kind']] ?? ucfirst($u['kind']), 'code' => $u['code'],
                'labels' => isset($alt[$u['code']]) ? ['tn' => $alt[$u['code']]] : null,
                'population' => $u['population'], 'population_source' => 'Census 2022 (Statistics Botswana)',
                'latitude' => $u['lat'], 'longitude' => $u['lon'], 'placeholder' => false, 'source' => self::PACK_SOURCE.', Part D-1',
                'meta' => ['wikidata' => $u['wikidata'], 'tags' => $u['tags'], 'places' => $u['places'], 'templates' => $u['templates'], 'tierA' => $u['tier_a'], 'envelopeUsdM' => $u['envelope_usd_m']],
                'sort' => $i,
            ]);
        }
        $units = AdminUnit::query()->where('country_iso2', 'BW')->where('level', 1)->get()->keyBy('code');
        foreach ($this->json('botswana/towns.json') as $t) {
            $council = $t['kind'] === 'council point';
            $this->unit('BW', $units[$t['unit_code']] ?? null, 5, trim(str_replace('(council point)', '', $t['name'])), [
                'kind' => $council ? 'Council seat' : 'Town or village', 'code' => $t['id'],
                'population' => $t['population'], 'population_source' => $council ? 'Census 2022 council figure' : 'countries-states-cities-database (ODbL)',
                'latitude' => $t['lat'], 'longitude' => $t['lon'], 'placeholder' => false, 'source' => self::PACK_SOURCE.', Part D-3',
                'meta' => ['gateway' => $t['gateway'], 'gatewayKm' => $t['gateway_km']],
            ]);
        }
    }

    private function southAfricaProvinces(): void
    {
        foreach (Province::query()->orderBy('rank')->get() as $i => $p) {
            $this->unit('ZA', null, 1, $p->name, [
                'kind' => 'Province', 'code' => $p->code, 'source' => 'AIIM South Africa province pack',
                'meta' => ['provinceSlug' => $p->slug], 'sort' => $i,
            ]);
        }
    }

    /** Well-known first-level regions already in the country register: names only, no points. */
    private function registerSubregions(): void
    {
        foreach (Country::query()->whereNotNull('subregions')->get() as $c) {
            foreach ($c->subregions ?? [] as $i => $name) {
                $this->unit($c->iso2, null, 1, $name, ['kind' => 'Region', 'source' => 'TBCA country register (names only)', 'sort' => $i]);
            }
        }
    }

    /** Screening register (54) with the 26 briefed projects; each linked to its admin-unit chain. */
    private function briefs(): void
    {
        $register = $this->json('screening_register.json');
        $briefed = collect($this->json('project_briefs.json'))->keyBy('code');
        $countries = Country::query()->get(['iso2', 'name'])->keyBy('name');

        foreach ($register['projects'] as $row) {
            $row = array_merge($row, $briefed[$row['code']] ?? []);
            $iso2 = $countries[$row['country']]->iso2 ?? null;
            if (! $iso2) {
                continue;
            }
            $unit = $this->briefUnits($iso2, $row);
            $attrs = ProjectBriefs::attributes($row, $iso2, $unit);
            Project::updateOrCreate(['code' => $row['code']], $attrs);
        }
    }

    /** Builds region > district > city > municipality > town for one brief; returns the deepest unit. */
    private function briefUnits(string $iso2, array $row): ?AdminUnit
    {
        $parent = null;
        foreach ([1 => 'region', 2 => 'district', 3 => 'city', 4 => 'municipality', 5 => 'town'] as $level => $field) {
            [$name, $tbc] = ProjectBriefs::placeName($level, $row[$field] ?? null);
            if (! $name) {
                continue;
            }
            if ($iso2 === 'ZA' && $level === 1) {
                $province = Province::query()->where('name', $name)->first();
                $parent = $province ? AdminUnit::query()->where('country_iso2', 'ZA')->where('level', 1)->where('name', $province->name)->first() : null;
                if ($parent) {
                    continue;
                }
            }
            $isSite = $level === 5 && ! ($row['coordinates_placeholder'] ?? true) && ! $tbc;
            $parent = $this->unit($iso2, $parent, $level, $name, array_filter([
                'kind' => ProjectBriefs::kindFor($iso2, $level, $name),
                'placeholder' => $tbc,
                'source' => 'TBCA project brief location block (AIIM_Import, 8 Oct 2026)',
                'latitude' => $isSite ? $row['latitude'] : null,
                'longitude' => $isSite ? $row['longitude'] : null,
            ], fn ($v) => $v !== null));
        }

        return $parent;
    }

    private function botswanaFeatures(): void
    {
        $places = [];
        foreach ($this->json('botswana/towns.json') as $t) {
            $places[$t['id']] = $t;
        }
        $unitFor = fn (string $code) => AdminUnit::query()->where('country_iso2', 'BW')->where('code', $code)->value('id');

        foreach ($this->json('botswana/gateways.json') as $g) {
            MapFeature::updateOrCreate(['country_iso2' => 'BW', 'layer_key' => 'gateways', 'code' => Str::slug($g['name'])], [
                'name' => $g['name'], 'latitude' => $g['lat'], 'longitude' => $g['lon'], 'placeholder' => str_contains($g['name'], 'proxy'),
                'status' => 'Border post', 'sector_code' => 'TRN', 'meta' => ['placesNearest' => $g['places'], 'note' => 'Point is the nearest dataset town (proxy).'],
                'source' => self::PACK_SOURCE.', Part D-2',
            ]);
        }

        $institutions = [];
        foreach ($this->json('botswana/hotspot_leads.json') as $l) {
            $institutions[$l['hotspot']] = $l['institution'];
        }
        foreach ($this->json('botswana/hotspots.json') as $h) {
            $p = $places[$h['place_id']] ?? null;
            preg_match('/BW-([A-Z]{3})-/', (string) $h['fact'], $m);
            MapFeature::updateOrCreate(['country_iso2' => 'BW', 'layer_key' => 'hotspots', 'code' => Str::slug($h['name'])], [
                'name' => $h['name'], 'latitude' => $p['lat'] ?? null, 'longitude' => $p['lon'] ?? null,
                'placeholder' => str_contains($h['name'], 'proxy'), 'status' => $h['status'], 'sector_code' => $m[1] ?? null,
                'admin_unit_id' => $unitFor($h['place_id']), 'meta' => ['place' => $h['place'], 'fact' => $h['fact'], 'institution' => $institutions[$h['name']] ?? null],
                'source' => self::PACK_SOURCE.', Part D-4',
            ]);
            if ($p && ($institutions[$h['name']] ?? null)) {
                $name = $institutions[$h['name']];
                MapFeature::updateOrCreate(['country_iso2' => 'BW', 'layer_key' => 'institutions', 'code' => Str::slug($name.'-'.$h['place'])], [
                    'name' => $name, 'latitude' => $p['lat'], 'longitude' => $p['lon'], 'placeholder' => false, 'status' => 'Institution to call',
                    'sector_code' => $m[1] ?? null, 'admin_unit_id' => $unitFor($h['place_id']),
                    'meta' => ['place' => $h['place'], 'hotspot' => $h['name']], 'source' => self::PACK_SOURCE.', Part D-4',
                ]);
            }
        }

        $outline = Country::query()->where('iso2', 'BW')->first()?->outline ?? [];
        foreach ($this->json('geo/botswana.json')['airports'] as $a) {
            if (! MapLayers::inside($a['lon'], $a['lat'], $outline)) {
                continue;
            }
            MapFeature::updateOrCreate(['country_iso2' => 'BW', 'layer_key' => 'airports', 'code' => Str::slug($a['name'])], [
                'name' => $a['name'], 'latitude' => $a['lat'], 'longitude' => $a['lon'], 'status' => $a['iata'] ? "IATA {$a['iata']}" : 'Airport',
                'sector_code' => 'TRN', 'source' => 'Natural Earth airports (via BW-1.0 prototype)',
            ]);
        }
    }

    private function templates(): void
    {
        foreach ($this->json('registers/opportunity_register.json') as $r) {
            $iso = str_starts_with((string) $r['status'], 'Instance: Malawi') ? 'MW' : (str_starts_with((string) $r['status'], 'Instance: South Africa') ? 'ZA' : null);
            OpportunityTemplate::updateOrCreate(['code' => $r['code']], [
                'country_iso2' => $iso, 'sector_code' => $r['sector_code'], 'kind' => $iso ? 'instance' : 'template',
                'asset_group' => $r['asset_group'], 'asset' => $r['asset'], 'title' => $r['title'], 'trigger' => $r['trigger'],
                'placement' => $r['placement'], 'model' => $r['model'], 'scope' => $r['scope'], 'status' => $r['status'],
                'source' => self::REGISTER_SOURCE.', Opportunity_Register',
            ]);
        }
        foreach ($this->json('registers/wx_opportunities.json') as $r) {
            OpportunityTemplate::updateOrCreate(['code' => $r['code']], [
                'country_iso2' => 'ZA', 'sector_code' => $r['sector_code'], 'kind' => 'instance', 'title' => $r['title'], 'trigger' => $r['trigger'],
                'placement' => $r['placement'], 'model' => $r['model'], 'scope' => $r['scope'], 'status' => $r['status'],
                'source' => self::REGISTER_SOURCE.', WX_Opportunities (Sector Worked Examples 2.1)',
            ]);
        }

        $best = collect($this->json('botswana/best_places.json'))->keyBy('template');
        $units = AdminUnit::query()->where('country_iso2', 'BW')->whereNotNull('code')->pluck('id', 'code');
        $kinds = ['Sweep' => 'sweep', 'Anchor' => 'anchor'];
        foreach ($this->json('botswana/opportunities.json') as $r) {
            $b = $best[$r['code']] ?? null;
            OpportunityTemplate::updateOrCreate(['code' => $r['code']], [
                'country_iso2' => 'BW', 'sector_code' => $r['sector_code'], 'kind' => $kinds[$r['type']] ?? 'template',
                'title' => $r['title'], 'trigger' => $r['trigger'], 'placement' => $r['placement'], 'model' => $r['model'],
                'scope' => 'Botswana', 'status' => $r['type'], 'band' => $r['band'], 'tier' => $r['tier'],
                'score' => is_numeric($r['score']) ? (int) $r['score'] : null, 'persona' => $r['persona'],
                'citizen_reserved' => $r['citizen_reserved'], 'fx_earner' => $r['fx_earner'], 'time_to_revenue' => $r['time_to_revenue'],
                'admin_unit_id' => $b ? ($units[$b['place_id']] ?? $units[$b['unit_code']] ?? null) : null,
                'place' => $b ? trim(str_replace('(council point)', '', $b['place'])) : null,
                'latitude' => $b['lat'] ?? null, 'longitude' => $b['lon'] ?? null,
                'meta' => array_filter(['owner' => $r['owner'], 'leadScore' => $b['lead_score'] ?? null, 'placement' => $b ? 'Top-ranked place (lead score)' : null]),
                'source' => self::PACK_SOURCE.', BW_Opportunities',
            ]);
        }
    }

    private function chains(): void
    {
        foreach (['investor' => 'registers/investor_chain.json', 'trader' => 'registers/trader_chain.json'] as $chain => $file) {
            foreach ($this->json($file) as $i => $r) {
                QuestionChain::updateOrCreate(['key' => "all:all:{$chain}:{$r['code']}"], [
                    'country_iso2' => null, 'sector_code' => null, 'chain' => $chain, 'code' => $r['code'], 'position' => $i + 1,
                    'question' => $r['question'], 'info_types' => $r['info_types'], 'tag' => $r['tag'], 'map_behaviour' => $r['map_behaviour'],
                    'anchor' => $r['anchor'], 'source' => self::REGISTER_SOURCE.', '.ucfirst($chain).'_Chain',
                ]);
            }
        }
        foreach ($this->json('registers/wx_chains.json') as $r) {
            $chain = strtolower((string) $r['chain']);
            QuestionChain::updateOrCreate(['key' => "all:{$r['sector_code']}:{$chain}:{$r['position']}"], [
                'country_iso2' => null, 'sector_code' => $r['sector_code'], 'chain' => $chain, 'position' => (int) $r['position'],
                'question' => $r['question'], 'info_types' => $r['info_types'], 'map_behaviour' => $r['map_behaviour'],
                'anchor' => $r['anchor'] ? 'South Africa model: '.$r['anchor'] : null, 'institution' => $r['institution'],
                'source' => 'TBCA AIIM Sector Worked Examples 2.1 (WX_Chains)',
            ]);
        }
        foreach ($this->json('botswana/chains.json') as $r) {
            $chain = strtolower((string) $r['chain']);
            QuestionChain::updateOrCreate(['key' => "BW:{$r['sector_code']}:{$chain}:{$r['position']}"], [
                'country_iso2' => 'BW', 'sector_code' => $r['sector_code'], 'chain' => $chain, 'position' => (int) $r['position'],
                'question' => $r['question'], 'info_types' => $r['info_types'], 'map_behaviour' => $r['map_behaviour'],
                'institution' => $r['institution'], 'evidence' => $r['evidence'], 'source' => self::PACK_SOURCE.', Part F',
            ]);
        }
    }

    private function botswanaPack(): void
    {
        $facts = collect($this->json('botswana/facts.json'))->groupBy('sector_code');
        $stack = collect($this->json('botswana/mapstack.json'))->groupBy('sector_code');
        $sectors = [];
        foreach ($this->json('botswana/sectors.json') as $code => $s) {
            $sectors[] = $s + [
                'code' => $code,
                'facts' => ($facts[$code] ?? collect())->map(fn ($f) => ['id' => $f['id'], 'fact' => $f['fact'], 'value' => $f['value'], 'source' => $f['source'], 'date' => $f['date'], 'url' => $f['url'], 'grade' => $f['grade']])->values()->all(),
                'mapStack' => ($stack[$code] ?? collect())->map(fn ($l) => ['layer' => $l['layer'], 'levels' => $l['levels'], 'geometry' => $l['geometry'], 'illumination' => $l['illumination']])->values()->all(),
            ];
        }
        usort($sectors, fn ($a, $b) => $a['number'] <=> $b['number']);
        $geo = $this->json('geo/botswana.json');

        CountryPack::updateOrCreate(['country_iso2' => 'BW'], [
            'code' => 'BW-1.0',
            'title' => 'AIIM Botswana Country Pack, Issue BW-1.0',
            'issued_on' => '2026-10-09',
            'summary' => $this->json('botswana/summary.json'),
            'macro' => $this->json('botswana/macro.json'),
            'products' => $this->json('botswana/products.json'),
            'institutions' => $this->json('botswana/institutions.json'),
            'one_stop_shop' => $this->json('botswana/one_stop_shop.json'),
            'sectors' => $sectors,
            'top_opportunities' => $this->json('botswana/top30.json'),
            'benchmark' => $this->json('botswana/benchmark.json'),
            'rollout' => $this->json('botswana/rollout.json'),
            'geo' => [
                'areas' => array_map(fn ($d) => ['code' => substr((string) $d['iso'], 3), 'name' => $d['name'], 'geometry' => $d['geometry']], $geo['districts']),
                'roads' => $geo['roads'],
                'rail' => $geo['rail'],
                'rivers' => array_merge(array_column($geo['rivers'], 'geometry'), array_column($geo['lakes'], 'geometry')),
            ],
            'fx_note' => 'P13.84 per US$ (9 Oct 2026); R1.207 per pula (7 Oct 2026). Crawling peg, 50% rand and 50% SDR.',
            'source' => self::PACK_SOURCE,
        ]);

        // Sourced headline figures replace the layout placeholders for Botswana.
        $bw = Country::query()->where('iso2', 'BW')->first();
        if ($bw) {
            $ind = $bw->indicators ?? [];
            $ind['population'] = ['label' => 'Population', 'value' => 2.36, 'unit' => 'million', 'year' => 2022, 'source' => 'Census 2022, Statistics Botswana (BW-MAC-F17)', 'status' => 'sourced'];
            $ind['gdp_growth'] = ['label' => 'Real GDP growth', 'value' => -0.7, 'unit' => '%', 'year' => 2025, 'source' => 'Statistics Botswana (BW-MAC-F2)', 'status' => 'sourced'];
            $bw->forceFill(['indicators' => $ind])->save();
        }
    }
}
