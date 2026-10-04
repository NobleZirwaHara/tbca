<?php

namespace App\Support\Insights;

use App\Models\Insights\Industry;

/**
 * Sector-adapted diagnostic (IN-SCR-006): five steps, server-validated,
 * scored into five readiness dimensions. Free triage only — it routes to
 * services and never issues a regulated conclusion.
 */
class SectorDiagnostic
{
    public const STEPS = ['Business Profile', 'Industry Context', 'Readiness Assessment', 'Risk & Compliance', 'Results & Next Steps'];

    public const DIMENSIONS = [
        'market' => ['label' => 'Market Access', 'weight' => 25],
        'operations' => ['label' => 'Operational Readiness', 'weight' => 20],
        'finance' => ['label' => 'Financial Strength', 'weight' => 20],
        'compliance' => ['label' => 'Compliance & Risk', 'weight' => 20],
        'esg' => ['label' => 'Sustainability & ESG', 'weight' => 15],
    ];

    public static function options(): array
    {
        return [
            'businessTypes' => ['Private Company (Pty) Ltd', 'Sole Proprietor', 'Partnership', 'Co-operative', 'NPO / NGO', 'State-owned / Public Entity'],
            'stages' => ['Idea / Concept', 'Start-up (0-2 years)', 'Growth (3-5 years)', 'Established (5+ years)', 'Turnaround'],
            'years' => ['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', 'More than 10 years'],
            'revenue' => ['Pre-revenue', 'Under R1m', 'R1m - R5m', 'R5m - R20m', 'R20m - R100m', 'Over R100m'],
            'markets' => ['Local', 'National', 'SADC', 'Rest of Africa', 'EU', 'Middle East', 'Asia', 'Americas'],
            'valueChain' => ['Primary production', 'Processing / manufacturing', 'Distribution / trade', 'Services / support', 'Retail / end customer'],
            'employees' => ['1-10', '11-50', '51-200', '201-500', '500+'],
        ];
    }

    /** Readiness statements (1-5 agreement), adapted to the industry name. */
    public static function readinessQuestions(Industry $industry): array
    {
        return [
            ['key' => 'r_market_demand', 'dimension' => 'market', 'text' => 'We have identified target buyers or markets with validated demand.'],
            ['key' => 'r_market_standards', 'dimension' => 'market', 'text' => "Our products or services meet the standards required in our target {$industry->name} markets."],
            ['key' => 'r_ops_process', 'dimension' => 'operations', 'text' => 'Our core processes are documented and consistently followed.'],
            ['key' => 'r_ops_capacity', 'dimension' => 'operations', 'text' => 'We could meet a 25% increase in demand within six months.'],
            ['key' => 'r_fin_statements', 'dimension' => 'finance', 'text' => 'We have up-to-date financial statements for the last 12 months.'],
            ['key' => 'r_fin_capital', 'dimension' => 'finance', 'text' => 'We have access to affordable working capital or finance facilities.'],
            ['key' => 'r_esg_env', 'dimension' => 'esg', 'text' => 'We measure environmental impacts such as water, energy and waste.'],
            ['key' => 'r_esg_social', 'dimension' => 'esg', 'text' => 'We have labour, health and safety and community policies in place.'],
        ];
    }

    public static function complianceQuestions(): array
    {
        return [
            ['key' => 'c_registration', 'text' => 'Business registrations and operating licences are current.'],
            ['key' => 'c_tax', 'text' => 'Tax affairs are in order (tax compliance status available).'],
            ['key' => 'c_certification', 'text' => 'We hold the sector certifications our buyers require.'],
            ['key' => 'c_environment', 'text' => 'Environmental authorisations are in place where required.'],
            ['key' => 'c_labour', 'text' => 'Labour law obligations are met (contracts, UIF, COIDA).'],
        ];
    }

    /** Validation rules per step. */
    public static function rules(int $step, Industry $industry): array
    {
        $o = self::options();

        return match ($step) {
            1 => [
                'business_name' => ['required', 'string', 'max:160'],
                'business_type' => ['required', 'in:'.implode(',', $o['businessTypes'])],
                'primary_activity' => ['required', 'string', 'max:160'],
                'stage' => ['required', 'in:'.implode(',', $o['stages'])],
                'years' => ['required', 'in:'.implode(',', $o['years'])],
                'revenue' => ['required', 'in:'.implode(',', $o['revenue'])],
                'markets' => ['required', 'array', 'min:1'],
                'markets.*' => ['in:'.implode(',', $o['markets'])],
                'objective' => ['required', 'string', 'max:200'],
                'description' => ['nullable', 'string', 'max:2000'],
            ],
            2 => [
                'sub_industry' => ['required', 'string', 'exists:ins_sub_industries,code'],
                'value_chain' => ['required', 'in:'.implode(',', $o['valueChain'])],
                'employees' => ['required', 'in:'.implode(',', $o['employees'])],
                'regulated_scope' => ['required', 'in:yes,no,unsure'],
            ],
            3 => collect(self::readinessQuestions($industry))->mapWithKeys(fn ($q) => [$q['key'] => ['required', 'integer', 'between:1,5']])->all(),
            4 => collect(self::complianceQuestions())->mapWithKeys(fn ($q) => [$q['key'] => ['required', 'in:yes,no,unsure']])->all(),
            default => [],
        };
    }

    /**
     * @return array{overall:?int,band:string,dimensions:array,strengths:array,improvements:array,professionalRoute:bool,complete:bool}
     */
    public static function score(Industry $industry, array $answers): array
    {
        $dims = [];
        foreach (self::readinessQuestions($industry) as $q) {
            if (isset($answers[$q['key']])) {
                $dims[$q['dimension']][] = ((int) $answers[$q['key']] - 1) / 4 * 100;
            }
        }
        foreach (self::complianceQuestions() as $q) {
            if (isset($answers[$q['key']])) {
                $dims['compliance'][] = ['yes' => 100, 'unsure' => 50, 'no' => 0][$answers[$q['key']]] ?? 0;
            }
        }

        $scores = [];
        foreach (self::DIMENSIONS as $key => $d) {
            $scores[$key] = isset($dims[$key]) ? (int) round(array_sum($dims[$key]) / count($dims[$key])) : null;
        }

        $scored = array_filter($scores, fn ($v) => $v !== null);
        $overall = null;
        if ($scored) {
            $weight = array_sum(array_map(fn ($k) => self::DIMENSIONS[$k]['weight'], array_keys($scored)));
            $overall = (int) round(array_sum(array_map(fn ($k, $v) => $v * self::DIMENSIONS[$k]['weight'], array_keys($scored), $scored)) / $weight);
        }

        $strengthText = [
            'market' => 'Validated market demand and buyer access',
            'operations' => 'Documented, scalable operations',
            'finance' => 'Sound financial records and funding access',
            'compliance' => 'Licences, tax and certifications in order',
            'esg' => 'Measured environmental and social practices',
        ];
        $improveText = [
            'market' => 'Market validation and standards for target buyers',
            'operations' => 'Process documentation and capacity to scale',
            'finance' => 'Access to affordable finance and current financials',
            'compliance' => 'Certification, licensing and compliance gaps',
            'esg' => 'Environmental measurement and social policies',
        ];

        $strengths = [];
        $improvements = [];
        foreach ($scored as $k => $v) {
            if ($v >= 70) {
                $strengths[] = $strengthText[$k];
            } elseif ($v < 60) {
                $improvements[] = $improveText[$k];
            }
        }

        return [
            'overall' => $overall,
            'band' => self::band($overall),
            'dimensions' => collect(self::DIMENSIONS)->map(fn ($d, $k) => ['key' => $k, 'label' => $d['label'], 'score' => $scores[$k]])->values()->all(),
            'strengths' => $strengths,
            'improvements' => $improvements,
            'professionalRoute' => ($answers['regulated_scope'] ?? 'no') !== 'no' || $industry->professional_gate === 'mandatory' && ($scores['compliance'] ?? 100) < 60,
            'complete' => count($scored) === count(self::DIMENSIONS),
        ];
    }

    public static function band(?int $score): string
    {
        return match (true) {
            $score === null => 'Not yet scored',
            $score >= 75 => 'High',
            $score >= 60 => 'Moderate-High',
            $score >= 40 => 'Moderate',
            default => 'Low',
        };
    }
}
