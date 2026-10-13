<?php

namespace Database\Seeders\Sections;

use App\Models\Sprint;
use App\Support\Sprints\Packages;
use App\Support\Sprints\Register;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Loads the client's full Sprint Design Register (Volume 11, 7,008 Sprints) on top of the
 * catalogue the other sprint seeders build. Runs after SprintsCatalogueSeeder, SprintTypesASeeder
 * and SprintTypesBSeeder (see DatabaseSeeder).
 *
 * Each register Sprint is matched to an existing record by, in order:
 *   1. the same code;
 *   2. an older mockup record that names the register code (attributes.register_code or sprint_code);
 *   3. the same title, when the name is unique in the register and one unlinked record carries it.
 *
 * Matched records keep their content. They gain register_id, page_family and shop_aisle, empty
 * columns are filled from the register and the register facts are added as
 * attributes.design_register. Prices, names and types on matched records are never overwritten:
 * differences are counted as conflicts. Unmatched register Sprints are added as new records
 * rendered by the generic sprint template. Idempotent: records this seeder added are matched by
 * code on the next run and refreshed from the data file.
 */
class SprintsRegisterSeeder extends Seeder
{
    /** @var array<string, mixed> counts from the last run (read by tests and the console summary) */
    public static array $report = [];

    private const FILLABLE = ['summary', 'description', 'delivery', 'audience', 'page_family', 'shop_aisle'];

    public function run(): void
    {
        $register = Register::load();
        $rows = $register['rows'];
        $overrides = require __DIR__.'/data/sprint-package-overrides.php';

        $existing = Sprint::query()
            ->select([
                'id', 'code', 'slug', 'title', 'type', 'price_zar', 'register_id', ...self::FILLABLE,
                'attributes->register_code as attr_register_code',
                'attributes->sprint_code as attr_sprint_code',
                'attributes->source as attr_source',
            ])
            ->orderBy('id')
            ->get()
            ->keyBy('code');

        $registerCodes = array_flip(array_column($rows, 'code'));
        $nameCount = array_count_values(array_map(fn ($r) => Str::lower(trim($r['name'])), $rows));

        // Older records that name a register code they do not carry themselves.
        $byAttribute = [];
        foreach ($existing as $code => $s) {
            foreach ([$s->attr_register_code, $s->attr_sprint_code] as $ref) {
                if (is_string($ref) && $ref !== $code && isset($registerCodes[$ref]) && ! $existing->has($ref)) {
                    $byAttribute[$ref][] = $code;
                }
            }
        }

        $byTitle = [];
        foreach ($existing as $code => $s) {
            if (! isset($registerCodes[$code]) && $s->attr_source !== Register::SOURCE) {
                $byTitle[Str::lower(trim($s->title))][] = $code;
            }
        }

        $report = [
            'register_rows' => count($rows), 'rejected' => count($register['rejected']),
            'matched_by_code' => 0, 'matched_by_attribute' => 0, 'matched_by_title' => 0,
            'added' => 0, 'refreshed' => 0, 'updated' => 0, 'fields_filled' => [],
            'conflicts' => ['price' => 0, 'title' => 0, 'type' => 0], 'slug_suffixed' => 0,
            'extra_linked_records' => 0,
        ];

        $taken = $existing->mapWithKeys(fn ($s) => [$s->slug => $s->code])->all();
        $linked = [];
        $inserts = [];
        $now = now();

        DB::transaction(function () use ($rows, $existing, $byAttribute, $byTitle, $nameCount, $overrides, $now, &$taken, &$linked, &$inserts, &$report) {
            foreach ($rows as $row) {
                $code = $row['code'];
                $targets = [];

                if ($existing->has($code)) {
                    $mine = $existing[$code]->attr_source === Register::SOURCE;
                    if ($mine) {
                        $inserts[] = $this->newRow($row, $existing[$code]->slug, $overrides, $now);
                        $report['refreshed']++;

                        continue;
                    }
                    $targets = [$code];
                    $report['matched_by_code']++;
                } elseif (isset($byAttribute[$code])) {
                    $targets = array_values(array_unique($byAttribute[$code]));
                    $report['matched_by_attribute']++;
                } elseif (($nameCount[$key = Str::lower(trim($row['name']))] ?? 0) === 1 && count($byTitle[$key] ?? []) === 1 && ! isset($linked[$byTitle[$key][0]])) {
                    $targets = $byTitle[$key];
                    $report['matched_by_title']++;
                }

                if ($targets === []) {
                    $slug = $row['slug'];
                    if (isset($taken[$slug]) && $taken[$slug] !== $code) {
                        $slug .= '-'.Str::lower($code);
                        $report['slug_suffixed']++;
                    }
                    $taken[$slug] = $code;
                    $inserts[] = $this->newRow($row, $slug, $overrides, $now);
                    $report['added']++;

                    continue;
                }

                $report['extra_linked_records'] += count($targets) - 1;
                foreach ($targets as $target) {
                    $linked[$target] = true;
                    $this->link($existing[$target], $row, $report);
                }
            }

            foreach (array_chunk($inserts, 200) as $chunk) {
                $columns = array_values(array_diff(array_keys($chunk[0]), ['code', 'created_at']));
                DB::table('sprints')->upsert($chunk, ['code'], $columns);
            }
        });

        self::$report = $report;

        $this->command?->info(sprintf(
            'Sprint register: %d rows; matched %d by code, %d by mockup code, %d by title; %d added, %d refreshed, %d existing records updated; conflicts kept as existing: %d price, %d title, %d type.',
            $report['register_rows'], $report['matched_by_code'], $report['matched_by_attribute'], $report['matched_by_title'],
            $report['added'], $report['refreshed'], $report['updated'],
            $report['conflicts']['price'], $report['conflicts']['title'], $report['conflicts']['type'],
        ));
    }

    /** Links an existing record to its register row without replacing any of its content. */
    private function link(Sprint $sprint, array $row, array &$report): void
    {
        $new = Register::newSprint($row, $sprint->slug);
        $changes = [];

        if ($sprint->register_id !== $row['code']) {
            $changes['register_id'] = $row['code'];
        }
        foreach (self::FILLABLE as $field) {
            if (($sprint->{$field} === null || $sprint->{$field} === '') && ($new[$field] ?? null) !== null) {
                $changes[$field] = $new[$field];
                $report['fields_filled'][$field] = ($report['fields_filled'][$field] ?? 0) + 1;
            }
        }

        if ($sprint->price_zar !== null && $sprint->price_zar !== $row['prices']['basic']) {
            $report['conflicts']['price']++;
        }
        if (Str::lower(trim($sprint->title)) !== Str::lower(trim($row['name']))) {
            $report['conflicts']['title']++;
        }
        if ($sprint->type !== $row['type']) {
            $report['conflicts']['type']++;
        }

        // The register facts sit beside the record's own attributes; nothing existing is replaced.
        $query = DB::table('sprints')->where('id', $sprint->id);
        $attributes = json_decode((string) $query->value('attributes'), true) ?: [];
        $facts = Register::facts($row);
        if (($attributes['design_register'] ?? null) != $facts) {
            $attributes['design_register'] = $facts;
            $changes['attributes'] = json_encode($attributes, JSON_UNESCAPED_UNICODE);
        }

        if ($changes === []) {
            return;
        }

        $query->update([...$changes, 'updated_at' => now()]);
        $report['updated']++;
    }

    /** @return array<string, mixed> */
    private function newRow(array $row, string $slug, array $overrides, mixed $now): array
    {
        $r = Packages::applyToRow(Register::newSprint($row, $slug), $overrides);

        return [
            ...$r,
            'packages' => json_encode($r['packages'], JSON_UNESCAPED_UNICODE),
            'attributes' => json_encode($r['attributes'], JSON_UNESCAPED_UNICODE),
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }
}
