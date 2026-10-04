<?php

namespace App\Support\Aiim;

use App\Models\Aiim\Corridor;
use App\Models\Aiim\Organisation;
use App\Models\Aiim\Project;

/**
 * Builds side-by-side comparisons from catalogue records and computes a weighted
 * overall score (decision support only, never a valuation — GAP-028).
 *
 * Weights: expected return 25%, payback 15%, risk (inverted) 20%, strategic fit 20%,
 * data source confidence 10%, alignment 10%.
 */
class ComparisonEngine
{
    public const MAX_ITEMS = 4;

    public const WEIGHTS = ['irr' => 0.25, 'payback' => 0.15, 'risk' => 0.20, 'fit' => 0.20, 'confidence' => 0.10, 'alignment' => 0.10];

    /** Metric rows: key, label, and whether a higher numeric value is better. */
    public static function metricRows(): array
    {
        return [
            ['key' => 'size', 'label' => 'Investment Size', 'better' => 'higher'],
            ['key' => 'stage', 'label' => 'Stage', 'better' => null],
            ['key' => 'sector', 'label' => 'Sector', 'better' => null],
            ['key' => 'province', 'label' => 'Province', 'better' => null],
            ['key' => 'irr', 'label' => 'Expected Return (IRR)', 'better' => 'higher'],
            ['key' => 'payback', 'label' => 'Payback Period', 'better' => 'lower'],
            ['key' => 'risk', 'label' => 'Risk Score', 'better' => 'lower'],
            ['key' => 'fit', 'label' => 'Strategic Fit', 'better' => 'higher'],
            ['key' => 'jobs', 'label' => 'Job Creation (5yrs)', 'better' => 'higher'],
            ['key' => 'alignment', 'label' => 'Alignment', 'better' => 'higher'],
            ['key' => 'confidence', 'label' => 'Data Source Confidence', 'better' => 'higher'],
            ['key' => 'updated', 'label' => 'Last Updated', 'better' => null],
        ];
    }

    /**
     * Normalised metrics for an item. Values: display string plus numeric value for ranking.
     */
    public static function metrics(string $type, string $key): ?array
    {
        $m = Catalogue::find($type, $key);
        if (! $m) {
            return null;
        }

        $c = match (true) {
            $m instanceof Project => ($m->details['compare'] ?? []) + [
                'size_value' => (float) $m->size_max_zar,
                'size' => Catalogue::size($m->size_min_zar, $m->size_max_zar),
                'stage' => $m->stage,
                'sector' => \App\Models\Aiim\Sector::query()->where('slug', $m->sector_slug)->value('name'),
                'province' => \App\Models\Aiim\Province::query()->where('slug', $m->province_slug)->value('name'),
                'confidence' => $m->confidence,
                'updated' => $m->updated_at?->format('j M Y'),
            ],
            $m instanceof Organisation => ($m->profile['compare'] ?? []) + [
                'size_value' => (float) ($m->profile['fund_size_zar'] ?? $m->ticket_max_zar),
                'size' => $m->profile['fund_size'] ?? Catalogue::zarShort($m->ticket_max_zar),
                'stage' => $m->profile['status'] ?? 'Active',
                'sector' => implode(', ', array_slice($m->focus ?? [], 0, 2)),
                'province' => $m->profile['coverage'] ?? 'National',
                'confidence' => $m->confidence,
                'updated' => $m->updated_at?->format('j M Y'),
            ],
            $m instanceof Corridor => ($m->profile['compare'] ?? []) + [
                'size_value' => (float) $m->volume_zar,
                'size' => Catalogue::zarShort($m->volume_zar).' trade',
                'stage' => $m->agreement,
                'sector' => $m->sectors,
                'province' => $m->countries,
                'confidence' => $m->confidence,
                'updated' => $m->updated_at?->format('j M Y'),
            ],
            default => null,
        };

        return $c ? self::normalise($c) : null;
    }

    private static function range(?string $text): ?float
    {
        if ($text === null || ! preg_match_all('/\d+(?:[.,]\d+)?/', str_replace(' ', '', $text), $m)) {
            return null;
        }
        $nums = array_map(fn ($n) => (float) str_replace(',', '.', $n), $m[0]);

        return array_sum($nums) / count($nums);
    }

    private static function normalise(array $c): array
    {
        $alignScore = ['High' => 100, 'Medium' => 70, 'Low' => 40][$c['alignment'] ?? 'Medium'] ?? 70;

        return [
            'size' => ['display' => $c['size'], 'value' => $c['size_value']],
            'stage' => ['display' => $c['stage'] ?? '—', 'value' => null],
            'sector' => ['display' => $c['sector'] ?? '—', 'value' => null],
            'province' => ['display' => $c['province'] ?? '—', 'value' => null],
            'irr' => ['display' => $c['irr'] ?? 'N/A', 'value' => self::range($c['irr'] ?? null)],
            'payback' => ['display' => $c['payback'] ?? 'N/A', 'value' => self::range($c['payback'] ?? null)],
            'risk' => ['display' => isset($c['risk']) ? (string) $c['risk'] : 'N/A', 'value' => isset($c['risk']) ? (float) $c['risk'] : null, 'label' => self::riskLabel($c['risk'] ?? null)],
            'fit' => ['display' => (string) ($c['fit'] ?? 3), 'value' => (float) ($c['fit'] ?? 3), 'label' => self::fitLabel((int) ($c['fit'] ?? 3))],
            'jobs' => ['display' => $c['jobs'] ?? 'N/A', 'value' => self::range($c['jobs'] ?? null)],
            'alignment' => ['display' => $c['alignment'] ?? 'Medium', 'value' => (float) $alignScore],
            'confidence' => ['display' => ($c['confidence'] ?? 0).'%', 'value' => (float) ($c['confidence'] ?? 0)],
            'updated' => ['display' => $c['updated'] ?? '—', 'value' => null],
        ];
    }

    public static function riskLabel(int|float|null $risk): ?string
    {
        if ($risk === null) {
            return null;
        }

        return $risk < 35 ? 'Low' : ($risk < 60 ? 'Moderate' : 'High');
    }

    public static function fitLabel(int $fit): string
    {
        return [5 => 'Very High', 4 => 'High', 3 => 'Medium', 2 => 'Low', 1 => 'Very Low'][$fit] ?? 'Medium';
    }

    public static function overall(array $metrics): float
    {
        $irr = $metrics['irr']['value'];
        $payback = $metrics['payback']['value'];
        $risk = $metrics['risk']['value'];
        $parts = [
            'irr' => $irr === null ? 50 : min(100, $irr / 25 * 100),
            'payback' => $payback === null ? 50 : max(0, min(100, 100 - ($payback - 2) * 6)),
            'risk' => $risk === null ? 50 : max(0, 100 - $risk),
            'fit' => $metrics['fit']['value'] * 20,
            'confidence' => $metrics['confidence']['value'],
            'alignment' => $metrics['alignment']['value'],
        ];

        return round(collect(self::WEIGHTS)->map(fn ($w, $k) => $w * $parts[$k])->sum(), 1);
    }

    /**
     * Full computed comparison for a list of {type, key} items.
     */
    public static function compare(array $items): array
    {
        $columns = [];
        foreach (array_slice($items, 0, self::MAX_ITEMS) as $item) {
            $card = Catalogue::card($item['type'], $item['key']);
            $metrics = self::metrics($item['type'], $item['key']);
            if (! $card || ! $metrics) {
                continue;
            }
            $columns[] = ['card' => $card, 'metrics' => $metrics, 'overall' => self::overall($metrics)];
        }

        // Mark the best column for each rankable metric.
        $best = [];
        foreach (self::metricRows() as $row) {
            if (! $row['better'] || count($columns) < 2) {
                continue;
            }
            $values = collect($columns)->map(fn ($c, $i) => [$i, $c['metrics'][$row['key']]['value']])->filter(fn ($v) => $v[1] !== null);
            if ($values->isEmpty()) {
                continue;
            }
            $target = $row['better'] === 'higher' ? $values->max(fn ($v) => $v[1]) : $values->min(fn ($v) => $v[1]);
            $best[$row['key']] = $values->filter(fn ($v) => $v[1] == $target)->map(fn ($v) => $v[0])->values()->all();
        }

        $topScore = collect($columns)->max('overall');
        foreach ($columns as $i => $col) {
            $columns[$i]['label'] = $col['overall'] == $topScore && count($columns) > 1
                ? 'Top Match'
                : ($col['overall'] >= 80 ? 'Strong Match' : ($col['overall'] >= 70 ? 'Good Match' : 'Fair Match'));
        }

        return ['columns' => $columns, 'best' => $best, 'rows' => self::metricRows(), 'insights' => self::insights($columns)];
    }

    private static function insights(array $columns): array
    {
        if (count($columns) < 2) {
            return [];
        }
        $out = [];
        $c = collect($columns);
        $top = $c->sortByDesc('overall')->first();
        $out[] = ['icon' => 'trophy', 'name' => $top['card']['name'], 'text' => 'achieves the highest overall score with strong returns and strategic fit.'];
        $largest = $c->sortByDesc(fn ($x) => $x['metrics']['size']['value'])->first();
        if ($largest['card']['key'] !== $top['card']['key']) {
            $out[] = ['icon' => 'bar-chart-3', 'name' => $largest['card']['name'], 'text' => 'offers the largest scale and strong infrastructure alignment.'];
        }
        $safest = $c->filter(fn ($x) => $x['metrics']['risk']['value'] !== null)->sortBy(fn ($x) => $x['metrics']['risk']['value'])->first();
        if ($safest && ! in_array($safest['card']['name'], array_column($out, 'name'), true)) {
            $out[] = ['icon' => 'shield-check', 'name' => $safest['card']['name'], 'text' => 'carries the lowest risk score in this set.'];
        }
        $rest = $c->reject(fn ($x) => in_array($x['card']['name'], array_column($out, 'name'), true))->first();
        if ($rest) {
            $out[] = ['icon' => 'info', 'name' => $rest['card']['name'], 'text' => 'provides balanced returns with strategic national impact.'];
        }

        return $out;
    }
}
