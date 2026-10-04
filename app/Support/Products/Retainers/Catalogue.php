<?php

namespace App\Support\Products\Retainers;

/**
 * Controlled copy and reference registers for the Retainers family:
 * exclusion taxonomy, disclosure versions, comparison matrix, categories,
 * under-use threshold profile and sizing drivers.
 */
class Catalogue
{
    /** Current controlled versions. A change invalidates prior acknowledgements (GATE-RE-04 / 05). */
    public const EXCLUSIONS_VERSION = 'EXR-2026.1';

    public const DISCLOSURE_VERSION = 'UED-2026.1';

    /** Proposal validity and capacity-hold window (days). */
    public const PROPOSAL_VALIDITY_DAYS = 14;

    /** Overage authority expiry (days). */
    public const OVERAGE_EXPIRY_DAYS = 14;

    public const VAT_RATE = 0.15;

    /** Under-use thresholds by days elapsed in the period (approved pilot profile). */
    public const UNDER_USE_PROFILE = [
        ['from' => 0, 'to' => 14, 'label' => '0 – 14 days', 'threshold' => 35],
        ['from' => 15, 'to' => 21, 'label' => '15 – 21 days', 'threshold' => 50],
        ['from' => 22, 'to' => 26, 'label' => '22 – 26 days', 'threshold' => 65],
        ['from' => 27, 'to' => 99, 'label' => '27+ days', 'threshold' => 80],
    ];

    public const NEAR_EXHAUSTION_PCT = 75;

    /** Categories for "Choose a Retainer Service" (key => label). */
    public static function categories(): array
    {
        return [
            'executive-advisory' => 'Executive Advisory',
            'procurement' => 'Procurement & Supply Chain',
            'due-diligence' => 'Due Diligence',
            'project-advisory' => 'Project Advisory',
            'technology' => 'Technology & Digital',
            'regulatory' => 'Regulatory & Compliance',
            'financial' => 'Financial Advisory',
            'esg' => 'ESG & Sustainability',
            'legal' => 'Legal Advisory',
            'people' => 'People & HR Advisory',
            'marketing' => 'Marketing & Growth',
            'data' => 'Data & Analytics',
        ];
    }

    /** Canonical exclusion register (EX-RE codes) with the client-facing register copy. */
    public static function exclusions(): array
    {
        return [
            'EX-RE-01' => ['category' => 'Regulated / Professionally Reserved Work', 'icon' => 'gavel', 'excluded' => 'Legal representation, court appearances, advocacy, fiduciary duties, actuarial sign-off.', 'why' => 'Requires licensed professional indemnity and regulatory authority.', 'route' => 'Partner Services', 'route_tone' => 'info', 'next' => 'Request specialist quote', 'href' => '/partner-services'],
            'EX-RE-02' => ['category' => 'Specialist Skills Outside Retained Role', 'icon' => 'user-cog', 'excluded' => 'Highly technical niche skills not included in retained capacity (e.g., niche engineering, forensic IT, specialist tax rulings).', 'why' => 'Not part of retained role capability and capacity commitment.', 'route' => 'Specialist Quote', 'route_tone' => 'gold', 'next' => 'Provide scope for pricing', 'href' => '/retainers/proposal-request'],
            'EX-RE-03' => ['category' => 'Third-Party Costs', 'icon' => 'cart', 'excluded' => 'Third-party fees, licences, subscriptions, travel, accommodation, data purchased externally.', 'why' => 'Billed at cost with no margin. Outside advisory scope.', 'route' => 'External Ledger (X)', 'route_tone' => 'neutral', 'next' => 'Approve cost separately', 'href' => null],
            'EX-RE-05' => ['category' => 'Out-of-Hours Work', 'icon' => 'clock', 'excluded' => 'Work requested outside standard business hours.', 'why' => 'Affects team capacity and wellness commitments.', 'route' => 'Overtime Rate Quote', 'route_tone' => 'neutral', 'next' => 'Request approval', 'href' => null],
            'EX-RE-06' => ['category' => "Work for Client's Customers", 'icon' => 'users', 'excluded' => "Direct work for the client's customers or suppliers.", 'why' => 'Conflict of interest and duty-of-care exposure.', 'route' => 'Separate Engagement', 'route_tone' => 'neutral', 'next' => 'Discuss commercial terms', 'href' => null],
            'EX-RE-07' => ['category' => 'New Entity or Jurisdiction', 'icon' => 'globe', 'excluded' => 'New legal entity formation, licensing or operations in a new jurisdiction.', 'why' => 'Requires separate scoping and risk assessment.', 'route' => 'Project Advisory', 'route_tone' => 'info', 'next' => 'Submit request', 'href' => '/project-advisory'],
            'EX-RE-14' => ['category' => 'Prohibited Industry / Boundary', 'icon' => 'ban', 'excluded' => "Industries or activities outside TBCA's ethical, legal and risk policy.", 'why' => 'Not aligned with TBCA values or risk appetite.', 'route' => 'Stop', 'route_tone' => 'bad', 'next' => 'No action available', 'href' => null],
        ];
    }

    /** Retainer vs Subscription vs Per-Use matrix (Page 2). */
    public static function comparison(): array
    {
        return [
            ['icon' => 'target', 'label' => 'Best For', 'retainer' => 'Complex, mission-critical needs', 'subscription' => 'Ongoing access to defined services', 'per_use' => 'One-off or variable support needs'],
            ['icon' => 'lock', 'label' => 'Access', 'retainer' => 'Guaranteed capacity & priority access', 'subscription' => 'Platform or service access during subscription', 'per_use' => 'Access on demand when you need it'],
            ['icon' => 'users', 'label' => 'Capacity Commitment', 'retainer' => 'Guaranteed (subject to C1–C5 Capacity Test)', 'subscription' => 'No specific human capacity reserved', 'per_use' => 'None – no capacity reserved'],
            ['icon' => 'chart', 'label' => 'Cost Predictability', 'retainer' => 'High – fixed recurring investment', 'subscription' => 'High – fixed recurring fee', 'per_use' => 'Variable – pay per use'],
            ['icon' => 'box', 'label' => 'Scope', 'retainer' => 'Bounded scope with defined deliverables', 'subscription' => 'Defined by subscription terms & entitlements', 'per_use' => 'Defined per engagement or request'],
            ['icon' => 'shuffle', 'label' => 'Flexibility', 'retainer' => 'Change via right-size, scope change or pause', 'subscription' => 'Adjust or cancel per subscription terms', 'per_use' => 'Maximum flexibility – use only what needed'],
            ['icon' => 'clock', 'label' => 'Unused Allowance', 'retainer' => 'Governed by agreed treatment (banked, capped roll-forward or credited to client)', 'subscription' => 'Not applicable', 'per_use' => 'Not applicable'],
            ['icon' => 'settings', 'label' => 'Setup', 'retainer' => 'Proposal → Agreement → Activation', 'subscription' => 'Signup → Activation', 'per_use' => 'Request → Quote → Delivery'],
            ['icon' => 'handshake', 'label' => 'Commercial Relationship', 'retainer' => 'Strategic partnership with accountability', 'subscription' => 'Service relationship', 'per_use' => 'Transactional'],
            ['icon' => 'briefcase', 'label' => 'Example Use Cases', 'retainer' => 'Fractional CFO, Legal Counsel, HR Director, IT Governance, Business Advisory', 'subscription' => 'AIIM Platform Access, Compliance Monitoring, Online Diagnostics, Learning Portals', 'per_use' => 'Due diligence reviews, Project sprints, Expert consultations, Once-off deliverables'],
        ];
    }

    /** Sizing tool demand drivers: key => [label, options => pct]. */
    public static function drivers(): array
    {
        return [
            'growth' => ['label' => 'Business Growth Outlook', 'options' => ['Stable' => 0, 'Moderate Growth' => 5, 'High Growth' => 15]],
            'strategic' => ['label' => 'Strategic Change Activity', 'options' => ['Reduced' => -10, 'No Change' => 0, 'Increased' => 10, 'Major Programme' => 25]],
            'complexity' => ['label' => 'Transactional Complexity', 'options' => ['Low' => -10, 'Moderate' => 0, 'High' => 20]],
            'regulatory' => ['label' => 'Regulatory / Compliance Load', 'options' => ['Reduced' => -5, 'No Change' => 0, 'Increased' => 10]],
            'seasonality' => ['label' => 'Seasonality Adjustment', 'options' => ['Typical Pattern' => 0, 'Peak Season Ahead' => 10, 'Quiet Season Ahead' => -10]],
        ];
    }

    public static function vatOf(int $zar): int
    {
        return (int) round($zar * self::VAT_RATE);
    }

    public static function unusedLabel(string $rule, int $capPct): string
    {
        return match ($rule) {
            'CAPPED_ROLL_FORWARD' => "Up to {$capPct}%",
            'CONVERT_TO_CREDIT' => 'Converted to credit',
            default => 'Forfeited at period end',
        };
    }

    public static function ownerModelLabel(string $model): string
    {
        return match ($model) {
            'DEFINED_ROLE' => 'Defined Role',
            'TEAM' => 'Adviser Team',
            default => 'Named Adviser',
        };
    }
}
