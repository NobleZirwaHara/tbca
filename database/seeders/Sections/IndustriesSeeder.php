<?php

namespace Database\Seeders\Sections;

use App\Support\Industries\IndustryData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Loads the Industries tab data from the client's "TBCA Industries Prototype" (MP-INDUSTRIES-1.0,
 * 21 Oct 2026). Source files in data/industries/ are the prototype's data files converted to plain
 * rows (no values changed):
 *  - industries.json   17 industries, 56 sub-industries, 26 service families, complexity classes,
 *                      8 boundary rules, 10 reserved services and the catalogue counts
 *  - ind-country.json  17 x 54 modelled opportunity score, exports and imports, HS groups per industry
 *  - countries.json    the 54 activated countries (reference facts as labelled in the prototype)
 *  - trade.json        modelled intra-African trade matrix (54 x 54 x 10 HS groups, US$ m)
 *  - ind-sprints.json  classification of the 7,589-Sprint ECON-R0C catalogue (family, C1 to C5,
 *                      viability, published tiers, cost prices, boundary-rule hits, archetype)
 *  - registers/*.json  the Botswana BW-1.0 and continental I2 registers the pages read
 *
 * Idempotent: every table is upserted on its natural key; register rows are replaced per register.
 * Selling prices are never loaded here: pages price Sprints from the app's own Sprint records by code.
 */
class IndustriesSeeder extends Seeder
{
    private const DATA = __DIR__.'/data/industries';

    public function run(): void
    {
        $now = now();
        $ind = $this->json('industries.json');
        $matrix = $this->json('ind-country.json');
        $trade = $this->json('trade.json');

        $rows = [];
        $subs = [];
        foreach ($ind['inds'] as $i => $x) {
            $rows[] = [
                'code' => $x['code'], 'number' => $i + 1, 'slug' => $x['slug'], 'name' => $x['name'], 'short' => $x['short'], 'description' => $x['desc'],
                'weights' => json_encode($x['w']), 'complexity' => $x['cx'], 'regulatory' => $x['reg'], 'human_gate' => $x['gate'],
                'aiim' => json_encode($x['aiim']), 'hs' => json_encode($x['hs']), 'stats' => json_encode($x['stats']),
                'catalogue' => $x['cat'], 'variant' => $x['variant'], 'created_at' => $now, 'updated_at' => $now,
            ];
            foreach ($x['subs'] as $k => $s) {
                $subs[] = [
                    'code' => $s['code'], 'industry_code' => $x['code'], 'sort' => $k + 1, 'name' => $s['name'], 'description' => $s['desc'],
                    'aiim' => json_encode($s['aiim']), 'hs' => json_encode($s['hs']), 'created_at' => $now, 'updated_at' => $now,
                ];
            }
        }
        DB::table('ind_industries')->upsert($rows, ['code'], ['number', 'slug', 'name', 'short', 'description', 'weights', 'complexity', 'regulatory', 'human_gate', 'aiim', 'hs', 'stats', 'catalogue', 'variant', 'updated_at']);
        DB::table('ind_sub_industries')->upsert($subs, ['code'], ['industry_code', 'sort', 'name', 'description', 'aiim', 'hs', 'updated_at']);

        $meta = [
            'fams' => $ind['fams'], 'cxn' => $ind['cxn'], 'block_rules' => $ind['blockRules'], 'reserved' => $ind['reserved'],
            'fam_count' => $ind['famCount'], 'cx_count' => $ind['cxCount'], 'block_hits' => $ind['blockHits'], 'total' => $ind['total'],
            'score_basis' => $matrix['basis'], 'industry_hs_groups' => $matrix['groups'],
            'trade' => ['groups' => $trade['groups'], 'isos' => $trade['isos'], 'unit' => $trade['unit'], 'year' => $trade['year'], 'basis' => $trade['basis'], 'anchors' => $trade['anchors']],
        ];
        DB::table('ind_meta')->upsert(collect($meta)->map(fn ($v, $k) => ['key' => $k, 'value' => json_encode($v), 'created_at' => $now, 'updated_at' => $now])->values()->all(), ['key'], ['value', 'updated_at']);

        $countries = [];
        foreach ($this->json('countries.json') as $k => $c) {
            $countries[] = [
                'iso3' => $c['iso'], 'iso2' => $c['iso2'], 'slug' => $this->slug($c), 'name' => $c['name'], 'region' => $c['region'], 'wave' => $c['wave'] ?? null,
                'pack' => $c['pack'] ?? null, 'pack_status' => $c['packStatus'] ?? null, 'capital' => $c['capital'] ?? null, 'lat' => $c['lat'] ?? null, 'lon' => $c['lon'] ?? null,
                'currency' => $c['currency'] ?? null, 'languages' => $c['languages'] ?? null, 'pop' => $c['pop'] ?? null, 'gdp' => $c['gdp'] ?? null,
                'landlocked' => (bool) ($c['landlocked'] ?? false), 'recs' => $c['recs'] ?? null, 'state' => $c['state'] ?? 'Activated', 'rcs' => $c['rcs'] ?? 100,
                'vat' => $c['vat'] ?? null, 'sort' => $k + 1, 'created_at' => $now, 'updated_at' => $now,
            ];
        }
        DB::table('ind_countries')->upsert($countries, ['iso3'], ['iso2', 'slug', 'name', 'region', 'wave', 'pack', 'pack_status', 'capital', 'lat', 'lon', 'currency', 'languages', 'pop', 'gdp', 'landlocked', 'recs', 'state', 'rcs', 'vat', 'sort', 'updated_at']);

        $scores = [];
        foreach ($matrix['inds'] as $i => $code) {
            foreach ($matrix['isos'] as $j => $iso) {
                $scores[] = ['industry_code' => $code, 'iso3' => $iso, 'score' => $matrix['score'][$i][$j], 'exports' => $matrix['exp'][$i][$j], 'imports' => $matrix['imp'][$i][$j], 'created_at' => $now, 'updated_at' => $now];
            }
        }
        foreach (array_chunk($scores, 300) as $chunk) {
            DB::table('ind_country_scores')->upsert($chunk, ['industry_code', 'iso3'], ['score', 'exports', 'imports', 'updated_at']);
        }

        $flows = [];
        foreach ($trade['isos'] as $a => $from) {
            foreach ($trade['isos'] as $b => $to) {
                $f = $trade['matrix'][$a][$b] ?? null;
                if ($a !== $b && is_array($f)) {
                    $flows[] = ['exporter' => $from, 'importer' => $to, 'flows' => json_encode($f), 'created_at' => $now, 'updated_at' => $now];
                }
            }
        }
        foreach (array_chunk($flows, 300) as $chunk) {
            DB::table('ind_trade_flows')->upsert($chunk, ['exporter', 'importer'], ['flows', 'updated_at']);
        }

        $sp = $this->json('ind-sprints.json');
        $h = array_flip($sp['h']);
        $sprints = [];
        foreach ($sp['rows'] as $r) {
            $v = fn (string $k) => $r[$h[$k]] ?? null;
            $sprints[] = [
                'code' => (string) $v('code'), 'name' => (string) $v('name'), 'type' => $v('type'), 'family' => (string) $v('fam'), 'complexity' => (int) $v('cx'),
                'viable' => (bool) $v('viable'), 'population' => $v('pop'), 'entry_tier' => $v('entry'), 'published_tiers' => $v('pub'),
                'cost_basic' => $this->int($v('cb')), 'cost_standard' => $this->int($v('cs')), 'cost_premium' => $this->int($v('cp')),
                'rules' => $v('blk') ?: null, 'archetype' => $v('up'), 'created_at' => $now, 'updated_at' => $now,
            ];
        }
        foreach (array_chunk($sprints, 400) as $chunk) {
            DB::table('ind_sprints')->upsert($chunk, ['code'], ['name', 'type', 'family', 'complexity', 'viable', 'population', 'entry_tier', 'published_tiers', 'cost_basic', 'cost_standard', 'cost_premium', 'rules', 'archetype', 'updated_at']);
        }

        foreach (glob(self::DATA.'/registers/*.json') ?: [] as $file) {
            $reg = json_decode((string) file_get_contents($file), true, flags: JSON_THROW_ON_ERROR);
            $name = basename($file, '.json');
            $sec = array_search('Sector', $reg['h'], true);
            $out = [];
            foreach ($reg['rows'] as $n => $row) {
                $out[] = ['register' => $name, 'row_no' => $n + 1, 'sector' => $sec === false ? null : (string) $row[$sec], 'data' => json_encode(array_combine($reg['h'], $row), JSON_UNESCAPED_UNICODE), 'created_at' => $now, 'updated_at' => $now];
            }
            DB::table('ind_register_rows')->where('register', $name)->where('row_no', '>', count($out))->delete();
            foreach (array_chunk($out, 300) as $chunk) {
                DB::table('ind_register_rows')->upsert($chunk, ['register', 'row_no'], ['sector', 'data', 'updated_at']);
            }
        }

        IndustryData::forget();
        $this->command?->info(sprintf('Industries: %d industries, %d sub-industries, %d countries, %d intersections, %d Sprints classified, %d trade pairs.', count($rows), count($subs), count($countries), count($scores), count($sprints), count($flows)));
    }

    /** The app's country slug (aiim_countries) where it exists, so URLs match the rest of the site. */
    private function slug(array $c): string
    {
        static $aiim = null;
        $aiim ??= DB::getSchemaBuilder()->hasTable('aiim_countries') ? DB::table('aiim_countries')->pluck('slug', 'iso3')->all() : [];

        return $aiim[$c['iso']] ?? ($c['iso'] === 'STP' ? 'sao-tome-and-principe' : $c['slug']);
    }

    private function int(mixed $v): ?int
    {
        return is_numeric($v) ? (int) round((float) $v) : null;
    }

    private function json(string $file): array
    {
        return json_decode((string) file_get_contents(self::DATA.'/'.$file), true, flags: JSON_THROW_ON_ERROR);
    }
}
