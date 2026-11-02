<?php

namespace Database\Seeders\Sections;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the Countries tab data from the Countries part of the client's prototype
 * (MP-COUNTRIES-1.0, 21 Oct 2026). Source files in data/countries/ are the prototype's data files
 * converted to plain rows (no values changed):
 *  - registers/*.json(.gz)  the 39 Botswana BW-1.0 and continental I2 registers that Industries does
 *                           not already load (the other 23 come from data/industries/registers)
 *  - reg-index.json         the 62-sheet index of the Deep Registers workbook (Data Room)
 *  - geo-bw.json.gz         Botswana districts, neighbouring countries, places, roads, rail, rivers,
 *                           lakes and airports (Natural Earth, as used by the prototype map)
 *  - pack-doc.json.gz       the Botswana Country Pack BW-1.0 text, block by block (Pack Reader)
 *  - coverage.json          the prototype's cell-by-cell check of the registers against the workbook
 *  - sprint-topics.json     the 1,814 country Sprints and the topic each one serves
 *
 * Idempotent: register rows are replaced per register, documents are upserted by key.
 * Selling prices are never loaded here: pages price Sprints from the app's own Sprint records.
 */
class CountryHubSeeder extends Seeder
{
    private const DATA = __DIR__.'/data/countries';

    public const META = [
        'reg_index' => 'reg-index.json', 'geo_bw' => 'geo-bw.json.gz', 'pack_doc' => 'pack-doc.json.gz',
        'coverage' => 'coverage.json', 'sprint_topics' => 'sprint-topics.json',
    ];

    public function run(): void
    {
        if (! Schema::hasTable('cty_meta') || ! Schema::hasTable('ind_register_rows')) {
            return;
        }
        $now = now();

        $rows = 0;
        $files = array_merge(glob(self::DATA.'/registers/*.json') ?: [], glob(self::DATA.'/registers/*.json.gz') ?: []);
        sort($files);
        foreach ($files as $file) {
            $reg = $this->read($file);
            $name = (string) preg_replace('/\.json(\.gz)?$/', '', basename($file));
            $head = self::headers($reg['h']);
            $sec = array_search('Sector', $head, true);
            $out = [];
            foreach ($reg['rows'] as $n => $row) {
                $out[] = [
                    'register' => $name, 'row_no' => $n + 1, 'sector' => $sec === false ? null : mb_substr((string) $row[$sec], 0, 80),
                    'data' => json_encode(array_combine($head, $row), JSON_UNESCAPED_UNICODE), 'created_at' => $now, 'updated_at' => $now,
                ];
            }
            DB::table('ind_register_rows')->where('register', $name)->where('row_no', '>', count($out))->delete();
            foreach (array_chunk($out, 300) as $chunk) {
                DB::table('ind_register_rows')->upsert($chunk, ['register', 'row_no'], ['sector', 'data', 'updated_at']);
            }
            $rows += count($out);
        }

        foreach (self::META as $key => $file) {
            $value = json_encode($this->read(self::DATA.'/'.$file), JSON_UNESCAPED_UNICODE);
            DB::table('cty_meta')->upsert([['key' => $key, 'value' => $value, 'created_at' => $now, 'updated_at' => $now]], ['key'], ['value', 'updated_at']);
        }

        rescue(fn () => Cache::flush(), report: false);
        $this->command?->info(sprintf('Countries: %d registers (%d rows) and %d documents loaded.', count($files), $rows, count(self::META)));
    }

    /** Unique, non-empty column names (the workbook has blank and repeated headers). */
    public static function headers(array $h): array
    {
        $seen = [];
        foreach ($h as $i => $name) {
            $name = trim((string) $name) === '' ? 'Col '.($i + 1) : (string) $name;
            while (isset($seen[$name])) {
                $name .= ' ('.($i + 1).')';
            }
            $seen[$name] = true;
            $h[$i] = $name;
        }

        return array_values($h);
    }

    private function read(string $file): array
    {
        $raw = (string) file_get_contents($file);
        if (str_ends_with($file, '.gz')) {
            $raw = (string) gzdecode($raw);
        }

        return json_decode($raw, true, flags: JSON_THROW_ON_ERROR);
    }
}
