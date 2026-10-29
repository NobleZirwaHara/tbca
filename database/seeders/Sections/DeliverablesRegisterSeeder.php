<?php

namespace Database\Seeders\Sections;

use App\Models\Deliverables\Deliverable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Loads the client's Registry of Deliverables (TBCA Deliverables Resources File
 * MP-DEL-2.0, received 25 October 2026) from the files in data/deliverables/, which
 * export_register.py writes from the workbook:
 *
 *   deliverables.json.gz   8,318 deliverables, every register column
 *   crosswalk.csv          7,589 Sprint codes to deliverable refs
 *   standards.json, safeguards.json, payment_loops.json, integration_specs.json,
 *   country_matrix.json
 *
 * Idempotent: every table is upserted on its natural key and rows no longer in the
 * files are removed, so running it again changes nothing. Crosswalk codes are linked
 * to the app's Sprints by code, then by register_id; codes with no Sprint are kept
 * with match = "unmatched". Runs after the Sprint seeders (see DatabaseSeeder).
 */
class DeliverablesRegisterSeeder extends Seeder
{
    public const DIR = 'database/seeders/Sections/data/deliverables';

    /** @var array<string, mixed> counts from the last run (read by tests and the console summary) */
    public static array $report = [];

    public function run(): void
    {
        $now = now();
        $report = [];

        DB::transaction(function () use ($now, &$report) {
            $report += $this->deliverables($now);
            $report += $this->crosswalk($now);
            $report += $this->reference($now);
        });

        $report += self::linkSprints();
        self::$report = $report;

        $this->command?->info(sprintf(
            'Deliverables register: %d deliverables (%d shared texts); crosswalk %d codes, %d linked to Sprints by code, %d by register_id, %d unmatched; %d standards, %d safeguards, %d loops, %d integration elements, %d country cells.',
            $report['deliverables'], $report['texts'], $report['crosswalk'], $report['matched_code'], $report['matched_register_id'],
            $report['unmatched'], $report['standards'], $report['safeguards'], $report['loops'], $report['integration_specs'], $report['country_matrix'],
        ));
    }

    public static function path(string $file): string
    {
        return base_path(self::DIR.'/'.$file);
    }

    /** @return array<string, mixed> */
    public static function loadRegister(): array
    {
        $raw = @file_get_contents(self::path('deliverables.json.gz'));
        if ($raw === false) {
            throw new RuntimeException('Deliverables register file is missing.');
        }

        $doc = json_decode((string) gzdecode($raw), true, flags: JSON_THROW_ON_ERROR);
        unset($raw);

        return $doc;
    }

    private function json(string $file): array
    {
        return json_decode((string) file_get_contents(self::path($file)), true, flags: JSON_THROW_ON_ERROR);
    }

    private function deliverables($now): array
    {
        $doc = self::loadRegister();

        // Shared texts: upsert by hash, then map the file index to the row id.
        $hashes = array_map(fn ($t) => sha1($t), $doc['texts']);
        $textRows = [];
        foreach ($doc['texts'] as $i => $body) {
            $textRows[$hashes[$i]] = ['hash' => $hashes[$i], 'body' => $body, 'created_at' => $now, 'updated_at' => $now];
        }
        foreach (array_chunk(array_values($textRows), 100) as $chunk) {
            DB::table('deliverable_texts')->upsert($chunk, ['hash'], ['body']);
        }
        $idByHash = DB::table('deliverable_texts')->pluck('id', 'hash')->all();
        $textId = fn ($index) => $index === null ? null : $idByHash[$hashes[$index]];

        $rows = [];
        foreach ($doc['rows'] as $sort => $r) {
            $route = $doc['texts'][$r['automation_route']] ?? '';
            $trigger = $doc['texts'][$r['payment_trigger']] ?? '';

            $row = [
                'ref' => $r['ref'],
                'sort' => $sort + 1,
                'format_code' => $r['format_code'] ?? null,
                'loop_id' => preg_match('/LOOP-PAY-[A-Z0-9-]+/', $trigger, $m) ? $m[0] : null,
                'automation_family' => preg_match('/^(UP-\d+|P13[A-Z-]*)/', $route, $m) ? $m[1] : null,
                'owner_blueprint' => preg_match('/owner ([^·]+)/u', $route, $m) ? trim($m[1]) : null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
            foreach (array_keys(Deliverable::COLUMNS) as $field) {
                if (in_array($field, Deliverable::POOLED, true)) {
                    $row["{$field}_text_id"] = $textId($r[$field]);
                } else {
                    $v = $r[$field];
                    $row[$field] = is_string($v) || $v === null || str_starts_with($field, 'csat_') ? $v : (string) $v;
                }
            }
            $rows[] = $row;
        }

        $columns = array_values(array_diff(array_keys($rows[0]), ['ref', 'created_at']));
        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('deliverables')->upsert($chunk, ['ref'], $columns);
        }
        $refs = array_column($rows, 'ref');
        $removed = DB::table('deliverables')->whereNotIn('ref', $refs)->delete();

        // Texts no longer referenced by any deliverable.
        $used = [];
        foreach (Deliverable::POOLED as $f) {
            foreach (array_column($rows, "{$f}_text_id") as $id) {
                if ($id) {
                    $used[$id] = true;
                }
            }
        }
        DB::table('deliverable_texts')->whereNotIn('id', array_keys($used))->delete();

        return ['deliverables' => count($rows), 'texts' => count($used), 'deliverables_removed' => $removed];
    }

    private function crosswalk($now): array
    {
        $fh = fopen(self::path('crosswalk.csv'), 'r');
        $header = fgetcsv($fh, escape: '');
        $rows = [];
        while (($r = fgetcsv($fh, escape: '')) !== false) {
            if ($r === [null] || $r[0] === '') {
                continue;
            }
            $r = array_combine($header, $r);
            $rows[] = [
                'sprint_code' => $r['sprint_code'],
                'sprint_name' => $r['sprint_name'] ?: null,
                'batch' => $r['batch'] ?: null,
                'population' => $r['population'] ?: null,
                'deliverable_ref' => $r['deliverable_ref'],
                'status' => $r['status'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        fclose($fh);

        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('deliverable_sprints')->upsert($chunk, ['sprint_code'], ['sprint_name', 'batch', 'population', 'deliverable_ref', 'status', 'updated_at']);
        }
        DB::table('deliverable_sprints')->whereNotIn('sprint_code', array_column($rows, 'sprint_code'))->delete();

        return ['crosswalk' => count($rows)];
    }

    /**
     * Link crosswalk codes to the app's Sprints: by code first, then by register_id.
     * Safe to call again after Sprints are added.
     *
     * @return array{matched_code: int, matched_register_id: int, unmatched: int}
     */
    public static function linkSprints(): array
    {
        $byCode = DB::table('sprints')->pluck('id', 'code')->all();
        $byRegister = DB::table('sprints')->whereNotNull('register_id')->orderBy('id')->get(['id', 'register_id'])
            ->groupBy('register_id')->map(fn ($g) => $g->first()->id)->all();

        $counts = ['matched_code' => 0, 'matched_register_id' => 0, 'unmatched' => 0];
        $updates = ['code' => [], 'register_id' => [], 'unmatched' => []];

        foreach (DB::table('deliverable_sprints')->get(['id', 'sprint_code', 'sprint_id', 'match']) as $row) {
            [$id, $match] = isset($byCode[$row->sprint_code])
                ? [$byCode[$row->sprint_code], 'code']
                : (isset($byRegister[$row->sprint_code]) ? [$byRegister[$row->sprint_code], 'register_id'] : [null, 'unmatched']);
            $counts[$match === 'code' ? 'matched_code' : ($match === 'register_id' ? 'matched_register_id' : 'unmatched')]++;
            if ((int) $row->sprint_id !== (int) $id || $row->match !== $match) {
                $updates[$match][$row->id] = $id;
            }
        }

        DB::transaction(function () use ($updates) {
            foreach ($updates as $match => $pairs) {
                foreach ($pairs as $rowId => $sprintId) {
                    DB::table('deliverable_sprints')->where('id', $rowId)->update(['sprint_id' => $sprintId, 'match' => $match]);
                }
            }
        });

        return $counts;
    }

    private function reference($now): array
    {
        $stamp = fn (array $rows) => array_map(fn ($r) => $r + ['created_at' => $now, 'updated_at' => $now], $rows);

        // Standards: tier ladder, Issue 2.0 additions, size multipliers, formats and CSAT rules.
        $s = $this->json('standards.json');
        $standards = [];
        foreach (['tier' => $s['tiers'], 'tier_v2' => $s['tiers_v2']] as $section => $items) {
            foreach ($items as $i => $t) {
                $standards[] = ['section' => $section, 'code' => null, 'parameter' => $t['parameter'], 'basic' => $t['basic'], 'standard' => $t['standard'], 'premium' => $t['premium'], 'unit' => null, 'value' => null, 'basis' => $t['basis'], 'sort' => $i + 1];
            }
        }
        foreach ($s['sizes'] as $i => $z) {
            $standards[] = ['section' => 'size', 'code' => $z['code'], 'parameter' => $z['meaning'], 'basic' => null, 'standard' => null, 'premium' => null, 'unit' => 'multiplier', 'value' => $z['multiplier'], 'basis' => null, 'sort' => $i + 1];
        }
        foreach ($s['formats'] as $i => $f) {
            $standards[] = ['section' => 'format', 'code' => $f['code'], 'parameter' => $f['format'], 'basic' => $f['pages_basic'], 'standard' => $f['pages_standard'], 'premium' => $f['pages_premium'], 'unit' => $f['unit'], 'value' => null, 'basis' => $f['consulting_standard'], 'sort' => $i + 1];
        }
        foreach ($s['csat_rules'] as $i => $rule) {
            $standards[] = ['section' => 'csat_rule', 'code' => null, 'parameter' => $rule, 'basic' => null, 'standard' => null, 'premium' => null, 'unit' => null, 'value' => null, 'basis' => null, 'sort' => $i + 1];
        }
        DB::table('deliverable_standards')->upsert($stamp($standards), ['section', 'sort'], ['code', 'parameter', 'basic', 'standard', 'premium', 'unit', 'value', 'basis', 'updated_at']);
        $this->prune('deliverable_standards', $standards, ['section', 'sort']);

        $safeguards = array_map(fn ($g) => [
            'code' => $g['code'], 'name' => $g['name'], 'rule' => $g['rule'], 'oss_stage' => $g['oss_stage'], 'loop_control' => $g['loop_control'],
        ], $this->json('safeguards.json'));
        DB::table('deliverable_safeguards')->upsert($stamp($safeguards), ['code'], ['name', 'rule', 'oss_stage', 'loop_control', 'updated_at']);
        $this->prune('deliverable_safeguards', $safeguards, ['code']);

        $loops = [];
        foreach ($this->json('payment_loops.json')['loops'] as $i => $l) {
            $loops[] = [
                'loop_id' => $l['loop_id'], 'family' => $l['family'], 'task' => $l['task'], 'owning_blueprint' => $l['owning_blueprint'],
                'sprints' => (int) $l['sprints'], 'sort' => $i + 1,
            ];
        }
        DB::table('deliverable_payment_loops')->upsert($stamp($loops), ['loop_id'], ['family', 'task', 'owning_blueprint', 'sprints', 'sort', 'updated_at']);
        $this->prune('deliverable_payment_loops', $loops, ['loop_id']);

        $specs = [];
        foreach ($this->json('integration_specs.json')['elements'] as $i => $e) {
            foreach (['heygen', 'infogram'] as $provider) {
                $specs[] = ['provider' => $provider, 'element' => $e['element'], 'value' => $e[$provider], 'sort' => $i + 1];
            }
        }
        DB::table('deliverable_integration_specs')->upsert($stamp($specs), ['provider', 'element'], ['value', 'sort', 'updated_at']);
        $this->prune('deliverable_integration_specs', $specs, ['provider', 'element']);

        $matrix = [];
        $cm = $this->json('country_matrix.json');
        foreach ($cm['countries'] as $ci => $c) {
            foreach (array_values($cm['deliverables']) as $di => $name) {
                $matrix[] = [
                    'iso3' => $c['iso3'], 'country' => $c['country'], 'au_region' => $c['au_region'], 'wave' => $c['wave'] === null ? null : (string) $c['wave'],
                    'pack_status' => $c['pack_status'], 'deliverable' => $name, 'status' => $c['deliverables'][$name] ?? null, 'sort' => $ci * 100 + $di + 1,
                ];
            }
        }
        foreach (array_chunk($matrix, 100) as $chunk) {
            DB::table('deliverable_country_matrix')->upsert($stamp($chunk), ['iso3', 'deliverable'], ['country', 'au_region', 'wave', 'pack_status', 'status', 'sort', 'updated_at']);
        }
        $this->prune('deliverable_country_matrix', $matrix, ['iso3', 'deliverable']);

        return [
            'standards' => count($standards), 'safeguards' => count($safeguards), 'loops' => count($loops),
            'integration_specs' => count($specs), 'country_matrix' => count($matrix), 'countries' => count($cm['countries']),
        ];
    }

    /** Remove rows whose natural key is no longer in the file. */
    private function prune(string $table, array $rows, array $key): void
    {
        $keep = array_flip(array_map(fn ($r) => implode("\x1f", array_map(fn ($k) => (string) $r[$k], $key)), $rows));
        $stale = DB::table($table)->get(['id', ...$key])
            ->filter(fn ($r) => ! isset($keep[implode("\x1f", array_map(fn ($k) => (string) $r->{$k}, $key))]))
            ->pluck('id');
        if ($stale->isNotEmpty()) {
            DB::table($table)->whereIn('id', $stale)->delete();
        }
    }
}
