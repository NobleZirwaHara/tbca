<?php

namespace App\Support\Marketplace;

/**
 * Controlled option lists shared by the brief wizard, provider/partner
 * applications, partner intake and the catalogue filters.
 */
class Options
{
    public const CATEGORIES = [
        'financial-advisory' => 'Financial Advisory',
        'legal-contracts' => 'Legal & Contracts',
        'project-management' => 'Project Management',
        'market-research' => 'Market Research',
        'compliance-risk' => 'Compliance & Risk',
        'tech-digital' => 'Tech & Digital',
        'due-diligence' => 'Due Diligence',
        'automation-ai' => 'Automation & AI',
    ];

    public const SKILLS = [
        'Financial Modelling', 'Valuation (DCF, NPV, IRR)', 'Industry Analysis', 'Data Analysis',
        'Business Planning', 'Risk Assessment', 'Scenario Modelling', 'Regulatory Knowledge',
    ];

    public const BUDGETS = [
        'under-15k' => 'Under ZAR 15,000',
        '15-30k' => 'ZAR 15,000 – 30,000',
        '30-75k' => 'ZAR 30,000 – 75,000',
        '75-150k' => 'ZAR 75,000 – 150,000',
        '150k-plus' => 'ZAR 150,000+',
    ];

    /** Upper bound of each budget band (used by the matching engine and feasibility check). */
    public const BUDGET_MAX = ['under-15k' => 15000, '15-30k' => 30000, '30-75k' => 75000, '75-150k' => 150000, '150k-plus' => 1000000];

    public const DEADLINES = [
        'within-7' => 'Within 7 days', '7-14' => '7 – 14 days', '14-30' => '14 – 30 days', '30-60' => '30 – 60 days', '60-plus' => '60+ days',
    ];

    public const INDUSTRIES = [
        'Energy & Infrastructure', 'Agriculture & Agribusiness', 'Financial Services', 'Manufacturing', 'Retail & Consumer',
        'Technology & Digital', 'Mining & Resources', 'Healthcare', 'Real Estate & Construction', 'Public Sector',
    ];

    public const COUNTRIES = ['South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Egypt', 'Morocco', 'Tanzania', 'Botswana', 'Namibia', 'Multiple Countries'];

    public const INTENDED_USE = [
        'Internal decision making', 'Investor / lender review', 'Board approval', 'Regulatory submission', 'Fundraising', 'Strategic planning',
    ];

    public const URGENCY = ['standard' => 'Standard', 'priority' => 'Priority', 'urgent' => 'Urgent'];

    public const COMPLEXITY = ['low' => 'Low', 'medium' => 'Medium', 'high' => 'High'];

    public const STAGES = ['Idea / Pre-revenue', 'Early stage', 'Growth', 'Established', 'Corporate'];

    public const DATA_CLASS = ['public' => 'Public', 'internal' => 'Internal', 'confidential' => 'Confidential', 'restricted' => 'Restricted'];

    public const VDR = ['none' => 'No VDR required', 'read-only' => 'Read-only VDR access', 'controlled-upload' => 'Controlled upload workspace'];

    public const SOURCES = ['Search engine', 'Referral', 'LinkedIn', 'TBCA event / webinar', 'Existing client', 'Other'];

    public const SPECIALIST_PROFILES = ['Independent specialist', 'Specialist firm', 'Registered professional', 'No preference'];

    public const BUSINESS_TYPES = ['Pty Ltd', 'Sole Proprietor', 'Partnership', 'Close Corporation', 'NPC', 'Agency / Studio'];

    public const YEARS = ['Less than 1 year', '1 – 3 years', '3 – 5 years', '5 – 10 years', '10+ years'];

    public const HEADCOUNT = ['1', '2 – 5', '6 – 20', '21 – 50', '50+'];

    /* --- Partner Services ---------------------------------------------- */

    public const PROFESSIONS = [
        'Environmental Assessment Practitioner (EAP)', 'Attorney', 'Chartered Accountant (SA)', 'Tax Practitioner',
        'Professional Engineer', 'Registered Valuer', 'ESG Specialist', 'Compliance Officer', 'Business Rescue Practitioner',
    ];

    public const PS_OUTPUTS = ['Review memorandum & signed findings', 'Professional opinion', 'Signed report', 'Compliance certificate', 'Advisory memo'];

    public const PS_OUTCOMES = ['Independent review and sign-off', 'Professional opinion', 'Regulatory submission', 'Implementation support', 'Introduction to a professional'];

    public const PS_TIMELINES = ['Within 5 business days', '5 – 10 business days', '2 – 4 weeks', '1 – 3 months', 'Flexible'];

    public const PS_ROLES = ['Business owner / director', 'Finance lead', 'Legal counsel', 'Project manager', 'Advisor acting for a client'];

    public const PS_ACT_FOR = ['My own organisation', 'A client organisation', 'A group of companies'];

    public const ENTITY_TYPES = ['Professional Firm (Inc.)', 'Pty Ltd', 'Partnership', 'Sole Practitioner'];

    public const PROVINCES = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];

    public const BBBEE = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5 – 8', 'Non-compliant', 'Exempt (EME/QSE)'];

    public static function label(array $list, ?string $key): ?string
    {
        return $key === null ? null : ($list[$key] ?? $key);
    }

    /** Converts an assoc option list to [{value,label}] for the React Select. */
    public static function select(array $list): array
    {
        return array_is_list($list)
            ? array_map(fn ($v) => ['value' => $v, 'label' => $v], $list)
            : array_map(fn ($k, $v) => ['value' => $k, 'label' => $v], array_keys($list), $list);
    }

    public static function forBrief(): array
    {
        return [
            'categories' => self::select(self::CATEGORIES),
            'skills' => self::SKILLS,
            'budgets' => self::select(self::BUDGETS),
            'deadlines' => self::select(self::DEADLINES),
            'industries' => self::select(self::INDUSTRIES),
            'countries' => self::select(self::COUNTRIES),
            'intendedUse' => self::select(self::INTENDED_USE),
            'urgency' => self::select(self::URGENCY),
            'complexity' => self::select(self::COMPLEXITY),
            'stages' => self::select(self::STAGES),
            'dataClass' => self::select(self::DATA_CLASS),
            'vdr' => self::select(self::VDR),
            'sources' => self::select(self::SOURCES),
            'profiles' => self::select(self::SPECIALIST_PROFILES),
        ];
    }
}
