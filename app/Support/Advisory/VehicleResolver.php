<?php

namespace App\Support\Advisory;

/**
 * Margin-neutral vehicle resolver. Ranks the six client-facing ways of working
 * purely on fit (need, outcome, context, timing, budget). Price/floor validity
 * is a saleability gate, never a ranking feature; margin is never an input.
 *
 * Outcomes: recommend | escalate (mandatory partner) | decline (honest decline).
 */
class VehicleResolver
{
    /** Base affinity of each vehicle for each need (0-40). */
    private const NEED = [
        'solve-problem' => ['sprint' => 32, 'digital-product' => 14, 'subscription' => 10, 'retainer' => 26, 'project-advisory' => 28, 'partner-services' => 14],
        'expert-advice' => ['sprint' => 36, 'digital-product' => 10, 'subscription' => 14, 'retainer' => 30, 'project-advisory' => 22, 'partner-services' => 22],
        'deliver-project' => ['sprint' => 18, 'digital-product' => 6, 'subscription' => 6, 'retainer' => 18, 'project-advisory' => 38, 'partner-services' => 20],
        'automate' => ['sprint' => 28, 'digital-product' => 18, 'subscription' => 12, 'retainer' => 18, 'project-advisory' => 24, 'partner-services' => 16],
        'ongoing-support' => ['sprint' => 8, 'digital-product' => 6, 'subscription' => 30, 'retainer' => 38, 'project-advisory' => 12, 'partner-services' => 14],
        'data' => ['sprint' => 20, 'digital-product' => 22, 'subscription' => 38, 'retainer' => 14, 'project-advisory' => 10, 'partner-services' => 8],
        'check' => ['sprint' => 32, 'digital-product' => 12, 'subscription' => 10, 'retainer' => 12, 'project-advisory' => 16, 'partner-services' => 28],
        'not-sure' => ['sprint' => 28, 'digital-product' => 22, 'subscription' => 20, 'retainer' => 20, 'project-advisory' => 18, 'partner-services' => 14],
    ];

    /** Affinity per desired outcome (0-30). */
    private const OUTCOME = [
        'answer' => ['sprint' => 30, 'digital-product' => 10, 'subscription' => 8, 'retainer' => 16, 'project-advisory' => 10, 'partner-services' => 16],
        'plan' => ['sprint' => 24, 'digital-product' => 12, 'subscription' => 8, 'retainer' => 18, 'project-advisory' => 30, 'partner-services' => 14],
        'tools' => ['sprint' => 8, 'digital-product' => 30, 'subscription' => 20, 'retainer' => 6, 'project-advisory' => 4, 'partner-services' => 4],
        'implementation' => ['sprint' => 16, 'digital-product' => 4, 'subscription' => 4, 'retainer' => 20, 'project-advisory' => 30, 'partner-services' => 20],
        'ongoing' => ['sprint' => 4, 'digital-product' => 6, 'subscription' => 30, 'retainer' => 30, 'project-advisory' => 10, 'partner-services' => 10],
        'verification' => ['sprint' => 22, 'digital-product' => 4, 'subscription' => 6, 'retainer' => 10, 'project-advisory' => 12, 'partner-services' => 30],
    ];

    /**
     * @param  array{need?: string, outcome?: string, industry?: string, size?: string, country?: string, regulated?: string, timing?: string, budget?: string, description?: string}  $a
     */
    public static function resolve(array $a): array
    {
        $vehicles = ServicesContent::comparisonVehicles();
        $need = $a['need'] ?? 'not-sure';
        $outcome = $a['outcome'] ?? 'answer';
        $budgetKey = $a['budget'] ?? 'unsure';
        $budget = collect(ServicesContent::budgets())->firstWhere('key', $budgetKey) ?? ['max' => PHP_INT_MAX, 'key' => 'unsure'];
        $timing = $a['timing'] ?? '1-3';
        $size = $a['size'] ?? 'small';
        $country = $a['country'] ?? 'South Africa';
        $regulated = ($a['regulated'] ?? 'no') === 'yes';

        $rows = [];
        foreach ($vehicles as $key => $v) {
            $score = 20 + (self::NEED[$need][$key] ?? 15) + (self::OUTCOME[$outcome][$key] ?? 10);
            $reasons = [];
            $excluded = [];

            // Timing fit
            if ($timing === 'urgent') {
                $score += match ($key) { 'sprint', 'digital-product' => 8, 'project-advisory' => -12, default => 0 };
            }
            if ($timing === 'ongoing') {
                $score += match ($key) { 'subscription', 'retainer' => 8, 'sprint' => -6, default => 0 };
            }

            // Size fit
            if (in_array($size, ['large', 'institution'], true)) {
                $score += match ($key) { 'project-advisory', 'retainer' => 6, 'digital-product' => -6, default => 0 };
            }
            if ($size === 'micro') {
                $score += match ($key) { 'digital-product', 'sprint' => 6, 'project-advisory' => -10, default => 0 };
            }

            // Professional boundary: regulated advice routes to partners.
            if ($regulated) {
                $score += $key === 'partner-services' ? 18 : -4;
                if ($key === 'partner-services') {
                    $reasons[] = 'Your need involves regulated or specialist advice that a qualified partner must provide.';
                }
            }

            // Saleability gate on budget (never a ranking boost).
            $from = $v['from'];
            if ($from !== null && $budget['key'] !== 'unsure') {
                if ($budget['key'] === 'monthly') {
                    if (! $v['monthly'] && $from > 50000) {
                        $excluded[] = "Indicative price {$v['price']} is a once-off commitment above a monthly budget.";
                    }
                } elseif ($v['monthly'] && $from * 12 > $budget['max'] && $budget['max'] < 25000) {
                    $excluded[] = 'Monthly commitment would exceed your stated budget over a year.';
                } elseif (! $v['monthly'] && $from > $budget['max']) {
                    $excluded[] = "Indicative price {$v['price']} is above your stated budget.";
                }
            }
            if ($timing === 'urgent' && $key === 'project-advisory') {
                $excluded[] = 'A structured mandate needs scoping and gates; it cannot start within 2 weeks.';
            }
            if ($outcome === 'tools' && $key === 'project-advisory') {
                $excluded[] = 'You want tools to use yourself; a full mandate would over-scope your need.';
            }

            $score = max(0, min(100, $score));
            if ($score >= 82) {
                $fit = 'High fit';
            } elseif ($score >= 70) {
                $fit = 'Medium–High fit';
            } elseif ($score >= 55) {
                $fit = 'Medium fit';
            } else {
                $fit = 'Low fit';
            }
            if ($key === 'partner-services' && ! $regulated && $score < 70) {
                $fit = 'Varies';
            }
            if ($score < 45 && empty($excluded)) {
                $excluded[] = 'This way of working does not match the need and outcome you described.';
            }
            if (empty($reasons) && empty($excluded)) {
                $reasons[] = self::reason($key, $need, $outcome);
            }

            $rows[] = ['key' => $key, ...$v, 'score' => $score, 'fit' => $fit, 'reasons' => $reasons, 'excluded' => $excluded, 'viable' => empty($excluded)];
        }

        // Rank by fit only; ties break alphabetically (never by margin).
        usort($rows, fn ($x, $y) => [$y['viable'], $y['score'], $x['name']] <=> [$x['viable'], $x['score'], $y['name']]);
        $viable = array_values(array_filter($rows, fn ($r) => $r['viable']));

        $outcomeType = 'recommend';
        $declineReasons = [];
        if ($country === 'Outside Africa') {
            $outcomeType = 'decline';
            $declineReasons[] = 'Delivery is currently limited to Africa (all 54 African countries are active); your jurisdiction is outside Africa.';
        }
        if ($budget['key'] === 'under-2k' && ! in_array($outcome, ['tools'], true)) {
            $declineReasons[] = 'Your budget is below the floor price of any expert-delivered option.';
        }
        if (empty($viable)) {
            $outcomeType = 'decline';
            $declineReasons[] = 'None of our ways of working can meet this need within your constraints.';
        }
        if ($outcomeType !== 'decline' && $regulated && ($viable[0]['key'] ?? null) === 'partner-services') {
            $outcomeType = 'escalate';
        }
        if ($outcomeType !== 'decline' && $regulated && in_array($size, ['large', 'institution'], true)) {
            $outcomeType = 'escalate';
        }
        if (! empty($declineReasons) && $outcomeType === 'recommend' && $budget['key'] === 'under-2k') {
            $outcomeType = 'decline';
        }

        return [
            'outcome' => $outcomeType,
            'recommended' => $viable[0]['key'] ?? null,
            'rows' => $rows,
            'viable_count' => count($viable),
            'decline_reasons' => $declineReasons,
            'escalation_reasons' => self::escalationReasons($a),
            'alternatives' => self::alternatives($a),
            'margin_inputs_used' => false,
        ];
    }

    private static function reason(string $key, string $need, string $outcome): string
    {
        return match ($key) {
            'sprint' => 'A fixed-price, fixed-scope answer suits a defined question.',
            'digital-product' => 'Ready-made tools let you do the work yourself at the lowest cost.',
            'subscription' => 'Recurring access keeps you informed as things change.',
            'retainer' => 'Reserved expert capacity gives you ongoing access to people.',
            'project-advisory' => 'A gated mandate delivers a structured plan and execution support.',
            default => 'A qualified partner can deliver specialist or regulated work.',
        };
    }

    public static function escalationReasons(array $a): array
    {
        $r = [];
        if (in_array($a['size'] ?? '', ['large', 'institution'], true)) {
            $r[] = ['title' => 'Scope complexity', 'body' => 'Your requirements span multiple capabilities or jurisdictions.'];
            $r[] = ['title' => 'Strategic impact', 'body' => 'The outcome has material financial, operational or strategic impact.'];
        }
        if (($a['regulated'] ?? 'no') === 'yes') {
            $r[] = ['title' => 'Risk and compliance', 'body' => 'There are elevated legal, regulatory or reputational considerations.'];
            $r[] = ['title' => 'Specialist expertise', 'body' => 'A partner specialist is best placed to deliver the optimal outcome.'];
        }

        return $r ?: [['title' => 'Specialist expertise', 'body' => 'A partner specialist is best placed to deliver the optimal outcome.']];
    }

    public static function alternatives(array $a): array
    {
        $out = [
            ['title' => 'Free Business Health Diagnostic', 'body' => 'Get a clear starting point at no cost.', 'href' => '/diagnostics'],
            ['title' => 'Digital products & templates', 'body' => 'Low-cost tools you can use yourself.', 'href' => '/digital-products'],
            ['title' => 'Marketplace providers', 'body' => 'Independent providers who may fit your budget or location.', 'href' => '/marketplace'],
        ];
        if (($a['regulated'] ?? 'no') === 'yes') {
            array_unshift($out, ['title' => 'Partner Services', 'body' => 'Qualified partners for regulated or specialist advice.', 'href' => '/partner-services']);
        }

        return $out;
    }
}
