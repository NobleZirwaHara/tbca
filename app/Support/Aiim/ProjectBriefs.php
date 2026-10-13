<?php

namespace App\Support\Aiim;

use App\Models\Aiim\AdminUnit;
use App\Models\Aiim\Project;
use App\Models\Aiim\Province;
use Illuminate\Support\Str;

/**
 * TBCA investor project briefs (MP-BRIEF-1.0, 8 Oct 2026) as AIIM projects.
 *
 * Money: the source keeps each figure in its own currency (ZAR for South Africa,
 * USD elsewhere). The platform stores and displays amounts in ZAR and converts them
 * for display with the site currency helpers, so USD figures are converted at store
 * time with the screening register's own FX convention (R17.75 per US$, sheet
 * "Hurdles & method"). The original currency and amounts stay in `screening`.
 */
class ProjectBriefs
{
    public const SOURCE_CODE = 'SRC-TBCA-SCR-2026-10';

    /** R per US$, from the screening register FX convention (display only in the source). */
    public const ZAR_PER_USD = 17.75;

    public const HURDLES = [
        ['key' => 'IRR', 'label' => 'Project IRR (unlevered, post-tax, nominal)', 'threshold' => 'above 18%'],
        ['key' => 'NPV', 'label' => 'NPV at country WACC', 'threshold' => 'above 0'],
        ['key' => 'ROI', 'label' => 'ROI: average (EBITDA less tax) over years 1 to 10 divided by capex', 'threshold' => 'above 22%'],
        ['key' => 'EBITDA', 'label' => 'EBITDA margin in operating year 5', 'threshold' => 'above 25%'],
    ];

    public const STATUS_LABELS = [
        'QUALIFIED' => 'Qualified: all four hurdles met',
        'WATCHLIST' => 'Watchlist: near miss',
        'NOT QUALIFIED' => 'Not qualified',
    ];

    public static function toZar(?float $amountM, string $currency): ?int
    {
        if ($amountM === null) {
            return null;
        }
        $rate = strtoupper($currency) === 'ZAR' ? 1.0 : self::ZAR_PER_USD;

        return (int) round($amountM * 1_000_000 * $rate);
    }

    /**
     * Cleans one location field of a brief. Returns [name, isPlaceholder]. "[TBC]" markers flag
     * placeholders; values that only say TBC or describe a programme return a null name.
     *
     * @return array{0: ?string, 1: bool}
     */
    public static function placeName(int $level, ?string $value): array
    {
        if ($value === null || trim($value) === '') {
            return [null, false];
        }
        $tbc = str_contains($value, 'TBC');
        $v = trim(preg_replace('/\[[^\]]*\]/', '', $value) ?? '');
        $v = trim(preg_replace('/\((HQ|nearest city)\)/i', '', $v) ?? '');
        if ($v === '' || stripos($v, 'national programme') !== false) {
            return [null, $tbc];
        }
        // "Gauteng (HQ); rural roll-out provinces" and "Central & Southern Regions" keep the first named area.
        $v = trim(preg_split('/;|\s&\s|\sand\s|\s\/\s/', $v)[0]);
        if ($level === 1 && preg_match('/^(Central|Southern|Northern)$/', $v)) {
            $v .= ' Region';
        }
        if ($level === 2 && preg_match('/^\w+$/', $v)) {
            $v .= ' District';
        }
        $v = preg_replace(['/\bMM\b/', '/\bLM\b/'], ['Metropolitan Municipality', 'Local Municipality'], $v) ?? $v;
        $v = preg_replace('/ Province$/', '', $v) ?? $v;

        return [trim($v), $tbc];
    }

    public static function kindFor(string $iso2, int $level, string $name): string
    {
        return match (true) {
            $iso2 === 'ZA' && $level === 1 => 'Province',
            $iso2 === 'ZA' && $level === 2 => str_contains($name, 'Metropolitan') ? 'Metropolitan municipality' : 'District municipality',
            $level === 4 && str_contains($name, 'Council') => 'Council',
            $level === 4 && str_contains($name, 'Commune') => 'Commune',
            default => AdminUnit::LEVEL_LABELS[AdminUnit::LEVELS[$level]],
        };
    }

    /** aiim_projects attributes for one screening register row (merged with its brief, if any). */
    public static function attributes(array $r, string $iso2, ?AdminUnit $unit): array
    {
        $status = (string) $r['status'];
        $currency = (string) $r['currency'];
        $failed = $r['failed_tests'] && $r['failed_tests'] !== '-' ? array_map('trim', explode(',', (string) $r['failed_tests'])) : [];
        $passed = 4 - count($failed);
        $capexZar = self::toZar((float) $r['capex_m'], $currency);
        $code = SectorCodes::fromLabel((string) $r['sector']);
        $briefed = $status !== 'NOT QUALIFIED';
        [$region] = self::placeName(1, $r['region'] ?? null);
        $province = $iso2 === 'ZA' && $region ? Province::query()->where('name', $region)->value('slug') : null;
        $place = array_values(array_filter([
            self::placeName(5, $r['town'] ?? null)[0],
            self::placeName(3, $r['city'] ?? null)[0],
            $region,
        ]));
        $location = $place ? implode(', ', array_unique($place)) : 'Site not yet located';
        $pct = fn ($v) => $v === null ? null : rtrim(rtrim(number_format((float) $v, 1), '0'), '.').'%';

        $highlights = [
            "Project IRR {$pct($r['project_irr'])} against the 18% hurdle (equity IRR {$pct($r['equity_irr'])}).",
            "ROI {$pct($r['roi'])} against 22%; EBITDA margin in year 5 {$pct($r['ebitda_margin_y5'])} against 25%.",
            $r['payback_yrs'] ? "Payback in about {$r['payback_yrs']} years at a country WACC of {$pct($r['wacc'])}." : "No payback within the model horizon at a country WACC of {$pct($r['wacc'])}.",
        ];
        if ($failed) {
            $levers = array_filter([
                $r['price_uplift_to_qualify'] ? "a price uplift of {$r['price_uplift_to_qualify']}%" : null,
                $r['capex_cut_to_qualify'] ? "a capex cut of {$r['capex_cut_to_qualify']}%" : null,
            ]);
            $highlights[] = 'Fails '.implode(', ', $failed).($levers ? '. Would qualify with '.implode(' or ', $levers).'.' : '. No single lever qualifies it.');
        }

        return [
            'slug' => Str::slug($r['project']),
            'name' => $r['project'],
            'kind' => $briefed ? 'both' : 'screened',
            'summary' => Str::limit(($briefed ? 'Investor project brief' : 'Screened opportunity')." in {$r['country']}: {$r['sector']}. ".(self::STATUS_LABELS[$status] ?? $status).'.', 295),
            'province_slug' => $province ?? '',
            'sector_slug' => SectorCodes::slug($code),
            'location' => $location,
            'type' => $briefed ? 'Investor project brief' : 'Screened opportunity',
            'stage' => ucfirst(strtolower($status)),
            'size_min_zar' => $capexZar ?? 0,
            'size_max_zar' => $capexZar ?? 0,
            'score' => $passed * 25,
            'opportunity_level' => self::STATUS_LABELS[$status] ?? $status,
            'confidence' => $briefed ? ($r['coordinates_placeholder'] ? 65 : 72) : 60,
            'verification' => 'TBCA screened',
            'source_code' => self::SOURCE_CODE,
            'icon' => SectorCodes::icon($code),
            'added_on' => '2026-10-08',
            'next_review_on' => '2027-01-08',
            'details' => [
                'tags' => array_values(array_filter([$r['country'], $r['sector'], ucfirst(strtolower($status))])),
                'subsector' => $r['sector'],
                'description' => "{$r['project']} was screened by TBCA against four investment hurdles: project IRR above 18%, NPV above zero at the country WACC, ROI above 22% and EBITDA margin above 25% in operating year 5. It passes {$passed} of 4. Source: {$r['source_document']}.",
                'highlights' => $highlights,
                'projectHighlights' => $highlights,
                'metrics' => array_filter([
                    'IRR (Projected)' => $pct($r['project_irr']),
                    'Payback Period' => $r['payback_yrs'] ? (string) $r['payback_yrs'] : null,
                ]),
                'compare' => array_filter(['irr' => $pct($r['project_irr']), 'roi' => $pct($r['roi']), 'status' => ucfirst(strtolower($status))]),
                'documents' => $briefed ? [['Investor project brief (2 to 3 pages)', 'Locked'], ['Source: '.$r['source_document'], 'Locked']] : [['Screening register entry', 'Public']],
                'source' => 'TBCA Screening Register (8 Oct 2026)',
            ],
            'premium' => null,
            'country_iso2' => $iso2,
            'admin_unit_id' => $unit?->id,
            'latitude' => $r['latitude'],
            'longitude' => $r['longitude'],
            'coordinates_placeholder' => (bool) ($r['coordinates_placeholder'] ?? false),
            'screening_status' => $status,
            'capex_zar' => $capexZar,
            'screening' => [
                'sectorLabel' => $r['sector'],
                'sectorCode' => $code,
                'currency' => $currency,
                'capexM' => (float) $r['capex_m'],
                'capexUsdM' => $r['capex_usd_m'] !== null ? (float) $r['capex_usd_m'] : null,
                'npvM' => $r['npv_m'] !== null ? (float) $r['npv_m'] : null,
                'npvZar' => $r['npv_m'] !== null ? self::toZar((float) $r['npv_m'], $currency) : null,
                'projectIrr' => $r['project_irr'],
                'equityIrr' => $r['equity_irr'],
                'wacc' => $r['wacc'],
                'roi' => $r['roi'],
                'ebitdaMarginY5' => $r['ebitda_margin_y5'],
                'paybackYrs' => $r['payback_yrs'],
                'failedTests' => $failed,
                'hurdlesPassed' => $passed,
                'priceUpliftToQualify' => $r['price_uplift_to_qualify'],
                'capexCutToQualify' => $r['capex_cut_to_qualify'],
                'location' => ['region' => $r['region'], 'district' => $r['district'], 'city' => $r['city'], 'municipality' => $r['municipality'], 'town' => $r['town']],
                'sourceDocument' => $r['source_document'],
                'sourceEnvelope' => $r['source_envelope'],
                'fxZarPerUsd' => strtoupper($currency) === 'ZAR' ? null : self::ZAR_PER_USD,
            ],
        ];
    }

    /** Frontend shape of a screened project (amounts in ZAR for the currency helpers). */
    public static function present(Project $p): array
    {
        $s = $p->screening ?? [];

        return [
            'code' => $p->code,
            'slug' => $p->slug,
            'name' => $p->name,
            'kind' => $p->kind,
            'status' => $p->screening_status,
            'statusLabel' => self::STATUS_LABELS[$p->screening_status] ?? $p->screening_status,
            'sector' => $s['sectorLabel'] ?? null,
            'sectorCode' => $s['sectorCode'] ?? null,
            'location' => $p->location,
            'unitId' => $p->admin_unit_id,
            'lat' => $p->latitude,
            'lon' => $p->longitude,
            'placeholder' => (bool) $p->coordinates_placeholder,
            'capexZar' => $p->capex_zar,
            'npvZar' => $s['npvZar'] ?? null,
            'currency' => $s['currency'] ?? 'ZAR',
            'capexM' => $s['capexM'] ?? null,
            'npvM' => $s['npvM'] ?? null,
            'projectIrr' => $s['projectIrr'] ?? null,
            'equityIrr' => $s['equityIrr'] ?? null,
            'roi' => $s['roi'] ?? null,
            'ebitdaMarginY5' => $s['ebitdaMarginY5'] ?? null,
            'paybackYrs' => $s['paybackYrs'] ?? null,
            'wacc' => $s['wacc'] ?? null,
            'failedTests' => $s['failedTests'] ?? [],
            'hurdlesPassed' => $s['hurdlesPassed'] ?? null,
            'priceUplift' => $s['priceUpliftToQualify'] ?? null,
            'capexCut' => $s['capexCutToQualify'] ?? null,
            'sourceDocument' => $s['sourceDocument'] ?? null,
            'sourceEnvelope' => $s['sourceEnvelope'] ?? null,
            'fxZarPerUsd' => $s['fxZarPerUsd'] ?? null,
            'locationFields' => $s['location'] ?? null,
            'href' => $p->kind === 'screened' ? null : "/aiim/opportunities/{$p->slug}",
        ];
    }
}
