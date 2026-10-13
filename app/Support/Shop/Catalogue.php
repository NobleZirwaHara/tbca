<?php

namespace App\Support\Shop;

use App\Models\Shop\Product;
use App\Models\Sprint;
use App\Support\Sprints\Register;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Shelf doctrine register (blueprint Part 5): 26 canonical A-Z aisles, their
 * subcategories, the Services Resolver priorities and the structured search
 * synonyms. Product Masters live in shop_products; this register is the
 * taxonomy they hang from.
 */
class Catalogue
{
    public const BUYER_TYPES = [
        'investors' => 'Investors',
        'businesses' => 'Businesses',
        'governments' => 'Governments',
        'financiers' => 'Financiers',
        'advisors' => 'Advisors',
    ];

    public const DELIVERY_BANDS = [
        '0-5' => '0-5 Days',
        '6-15' => '6-15 Days',
        '16-30' => '16-30 Days',
        '31+' => '31+ Days',
    ];

    /** @return list<array{slug: string, name: string, description: string, icon: string, products: int, buyers: list<string>, acts: list<string>}> */
    public static function aisles(): array
    {
        $all = ['investors', 'businesses', 'governments', 'financiers', 'advisors'];

        return [
            ['slug' => 'agriculture-agri-business', 'name' => 'Agriculture & Agri-Business', 'description' => 'Production, processing, value chains, agri-tech, food systems.', 'icon' => 'sprout', 'products' => 342, 'buyers' => $all, 'acts' => ['A1', 'A2', 'A6']],
            ['slug' => 'business-sme-solutions', 'name' => 'Business & SME Solutions', 'description' => 'Strategy, operations, systems, compliance and growth.', 'icon' => 'trending-up', 'products' => 318, 'buyers' => ['businesses', 'advisors'], 'acts' => ['A1', 'A2', 'A3', 'A7']],
            ['slug' => 'business-strategy-planning', 'name' => 'Business Strategy & Planning', 'description' => 'Strategic frameworks, planning tools and advisory resources to help you grow, compete and lead.', 'icon' => 'target', 'products' => 342, 'buyers' => ['investors', 'businesses', 'governments', 'advisors'], 'acts' => ['A1', 'A2', 'A3', 'A4', 'A7']],
            ['slug' => 'compliance-governance', 'name' => 'Compliance & Governance', 'description' => 'Legal, regulatory, governance, risk and due diligence.', 'icon' => 'shield-check', 'products' => 412, 'buyers' => $all, 'acts' => ['A1', 'A2', 'A3', 'A4']],
            ['slug' => 'diagnostics-free-tools', 'name' => 'Diagnostics & Free Tools', 'description' => 'Health checks, readiness scores and free diagnostic resources.', 'icon' => 'clipboard-check', 'products' => 64, 'buyers' => ['businesses', 'governments'], 'acts' => ['A7', 'A1']],
            ['slug' => 'digital-products-ip', 'name' => 'Digital Products & IP', 'description' => 'Templates, frameworks, datasets, licenses and digital assets.', 'icon' => 'file-code', 'products' => 864, 'buyers' => $all, 'acts' => ['A2']],
            ['slug' => 'due-diligence-verification', 'name' => 'Due Diligence & Verification', 'description' => 'Individual, company, supplier and transaction verification.', 'icon' => 'file-search', 'products' => 296, 'buyers' => ['investors', 'financiers', 'businesses'], 'acts' => ['A1', 'A6']],
            ['slug' => 'education-skills', 'name' => 'Education & Skills', 'description' => 'Training, courses, toolkits and capability building.', 'icon' => 'graduation-cap', 'products' => 142, 'buyers' => ['businesses', 'governments'], 'acts' => ['A2', 'A3']],
            ['slug' => 'energy-utilities', 'name' => 'Energy & Utilities', 'description' => 'Power, renewables, oil & gas, water and energy services.', 'icon' => 'zap', 'products' => 287, 'buyers' => $all, 'acts' => ['A1', 'A6']],
            ['slug' => 'finance-investment', 'name' => 'Finance & Investment', 'description' => 'Capital, funds, financial modelling, due diligence.', 'icon' => 'landmark', 'products' => 356, 'buyers' => ['investors', 'financiers', 'businesses', 'advisors'], 'acts' => ['A1', 'A2', 'A5', 'A6']],
            ['slug' => 'health-life-sciences', 'name' => 'Health & Life Sciences', 'description' => 'Healthcare, pharma, med-tech, labs and public health.', 'icon' => 'heart-pulse', 'products' => 198, 'buyers' => ['businesses', 'governments', 'investors'], 'acts' => ['A1', 'A6']],
            ['slug' => 'hr-people', 'name' => 'HR & People', 'description' => 'Organisation design, employment compliance and people systems.', 'icon' => 'users', 'products' => 204, 'buyers' => ['businesses', 'governments'], 'acts' => ['A1', 'A2', 'A4']],
            ['slug' => 'ict-digital-economy', 'name' => 'ICT & Digital Economy', 'description' => 'ICT, software, AI, cloud, data centres and connectivity.', 'icon' => 'wifi', 'products' => 431, 'buyers' => $all, 'acts' => ['A1', 'A2', 'A6']],
            ['slug' => 'infrastructure-real-assets', 'name' => 'Infrastructure & Real Assets', 'description' => 'Transport, logistics, ports, cities and built environment.', 'icon' => 'building-2', 'products' => 523, 'buyers' => ['investors', 'governments', 'financiers'], 'acts' => ['A1', 'A6']],
            ['slug' => 'legal-contracts', 'name' => 'Legal & Contracts', 'description' => 'Agreements, templates and legal process support (non-regulated).', 'icon' => 'scale', 'products' => 236, 'buyers' => ['businesses', 'advisors'], 'acts' => ['A2', 'A6']],
            ['slug' => 'logistics-trade-services', 'name' => 'Logistics & Trade Services', 'description' => 'Freight, warehousing, customs, trade facilitation, 3PL/4PL.', 'icon' => 'truck', 'products' => 214, 'buyers' => ['businesses', 'governments'], 'acts' => ['A1', 'A6']],
            ['slug' => 'manufacturing-industry', 'name' => 'Manufacturing & Industry', 'description' => 'Manufacturing, industrial parks, engineering, automation.', 'icon' => 'factory', 'products' => 176, 'buyers' => ['businesses', 'investors', 'governments'], 'acts' => ['A1', 'A6']],
            ['slug' => 'marketing-sales', 'name' => 'Marketing & Sales', 'description' => 'Go-to-market, brand, digital marketing and sales enablement.', 'icon' => 'megaphone', 'products' => 248, 'buyers' => ['businesses'], 'acts' => ['A1', 'A2']],
            ['slug' => 'mining-natural-resources', 'name' => 'Mining & Natural Resources', 'description' => 'Mining, minerals, metals, quarrying and resources.', 'icon' => 'pickaxe', 'products' => 189, 'buyers' => ['investors', 'governments', 'financiers'], 'acts' => ['A1', 'A6']],
            ['slug' => 'project-advisory-restructuring', 'name' => 'Project Advisory & Restructuring', 'description' => 'Complex mandates, turnaround, business rescue and restructuring.', 'icon' => 'life-buoy', 'products' => 162, 'buyers' => ['businesses', 'financiers', 'investors'], 'acts' => ['A4', 'A6']],
            ['slug' => 'public-sector-development', 'name' => 'Public Sector & Development', 'description' => 'Programme design, DFI readiness and public-sector advisory.', 'icon' => 'landmark', 'products' => 154, 'buyers' => ['governments', 'financiers'], 'acts' => ['A1', 'A6']],
            ['slug' => 'retainers-advisory-desks', 'name' => 'Retainers & Advisory Desks', 'description' => 'Quantified, bounded senior capacity on a monthly basis.', 'icon' => 'users-round', 'products' => 121, 'buyers' => ['businesses', 'investors'], 'acts' => ['A4']],
            ['slug' => 'risk-cybersecurity', 'name' => 'Risk & Cybersecurity', 'description' => 'Enterprise risk, information security and resilience.', 'icon' => 'shield-alert', 'products' => 233, 'buyers' => $all, 'acts' => ['A1', 'A5', 'A6']],
            ['slug' => 'subscriptions-intelligence', 'name' => 'Subscriptions & Intelligence', 'description' => 'Recurring access to bulletins, monitors and dashboards.', 'icon' => 'repeat', 'products' => 118, 'buyers' => $all, 'acts' => ['A3']],
            ['slug' => 'technology-automation', 'name' => 'Technology & Automation', 'description' => 'AI agents, Zoho One, QuickBooks, cloud and workflow automation.', 'icon' => 'bot', 'products' => 302, 'buyers' => ['businesses', 'governments'], 'acts' => ['A1', 'A2', 'A6']],
            ['slug' => 'tourism-hospitality', 'name' => 'Tourism & Hospitality', 'description' => 'Destination, hospitality and tourism investment advisory.', 'icon' => 'palmtree', 'products' => 98, 'buyers' => ['businesses', 'investors', 'governments'], 'acts' => ['A1', 'A6']],
        ];
    }

    /** Subcategories per aisle (slug => [slug, name, description, icon, sprints, from_zar, acts]). */
    public static function subcategories(string $aisle): array
    {
        $map = [
            'business-strategy-planning' => [
                ['business-model-innovation', 'Business Model Innovation', 'Design and validate new business models for growth and resilience.', 'lightbulb', 8, 7500, ['A1']],
                ['strategic-planning', 'Strategic Planning', 'Build robust strategy and planning frameworks aligned to your goals.', 'target', 10, 6500, ['A1', 'A3']],
                ['market-entry-strategy', 'Market Entry Strategy', 'Plan your entry into new markets with confidence and structure.', 'door-open', 6, 8200, ['A1', 'A2']],
                ['competitive-analysis', 'Competitive Analysis', 'Understand competitors, market position and winning moves.', 'bar-chart-3', 5, 5900, ['A1']],
                ['value-proposition-design', 'Value Proposition Design', 'Craft compelling value propositions that attract and convert.', 'gem', 4, 4500, ['A1']],
                ['growth-strategy', 'Growth Strategy', 'Identify growth levers and execute scalable growth strategies.', 'trending-up', 6, 6200, ['A1']],
                ['performance-strategy', 'Performance Strategy', 'Align people, processes and performance with your business strategy.', 'settings', 4, 5200, ['A1']],
                ['strategic-partnerships', 'Strategic Partnerships', 'Identify, assess and structure partnerships that create value.', 'handshake', 4, 5400, ['A1']],
                ['digital-transformation-strategy', 'Digital Transformation Strategy', 'Build practical digital strategies that drive real business impact.', 'cpu', 5, 6800, ['A1']],
                ['data-driven-strategy', 'Data-Driven Strategy', 'Turn data and insights into strategic advantage and better decisions.', 'database', 4, 6300, ['A1', 'A2']],
                ['scenario-planning-workshops', 'Scenario & Planning Workshops', 'Structured workshops to explore scenarios and plan for the future.', 'users', 3, 7200, ['A1']],
                ['strategic-roadmap-development', 'Strategic Roadmap Development', 'Create clear, actionable roadmaps that align strategy and execution.', 'map', 4, 6000, ['A1']],
            ],
            'compliance-governance' => [
                ['popia-data-protection', 'POPIA & Data Protection', 'Implement, test and evidence POPIA compliance.', 'lock', 14, 950, ['A1', 'A2', 'A3']],
                ['regulatory-compliance', 'Regulatory Compliance', 'Map and meet sector and market regulatory requirements.', 'scale', 11, 2450, ['A1', 'A2']],
                ['internal-audit-controls', 'Internal Audit & Controls', 'Audit plans, control testing and governance reviews.', 'clipboard-check', 7, 3800, ['A1']],
                ['esg-reporting', 'ESG & Sustainability Reporting', 'ESG disclosures, reports and sustainability programmes.', 'leaf', 6, 35000, ['A5', 'A1']],
                ['compliance-retainers', 'Compliance Retainers', 'Ongoing compliance advisory on a bounded monthly basis.', 'users-round', 4, 24500, ['A4']],
            ],
            'finance-investment' => [
                ['investment-readiness', 'Investment Readiness', 'Assess and close the gaps investors and lenders look for.', 'badge-check', 7, 6900, ['A1']],
                ['financial-modelling-feasibility', 'Financial Modelling & Feasibility', 'Feasibility studies, models and scenario analysis.', 'calculator', 9, 1950, ['A1', 'A2']],
                ['valuation-advisory', 'Valuation Advisory', 'Independent valuations through verified providers.', 'scale', 5, 0, ['A5', 'A6']],
            ],
            'due-diligence-verification' => [
                ['company-supplier-checks', 'Company & Supplier Checks', 'Essential checks for companies, directors and suppliers.', 'file-search', 12, 6500, ['A1']],
                ['tax-financial-due-diligence', 'Tax & Financial Due Diligence', 'Scoped tax and financial due diligence engagements.', 'receipt', 6, 0, ['A6']],
            ],
            'legal-contracts' => [
                ['contract-templates', 'Contract Templates', 'Licensed, South African drafted agreement templates.', 'file-text', 38, 250, ['A2']],
            ],
            'retainers-advisory-desks' => [
                ['strategic-advisory', 'Strategic Advisory Retainers', 'Dedicated senior adviser access on C1-C5 terms.', 'users-round', 6, 24500, ['A4']],
                ['compliance-advisory', 'Compliance Advisory Retainers', 'Retained compliance and regulatory support.', 'shield-check', 5, 24500, ['A4']],
            ],
            'project-advisory-restructuring' => [
                ['business-rescue-turnaround', 'Business Rescue & Turnaround', 'Advisory for companies in financial distress or business rescue.', 'life-buoy', 4, 0, ['A4']],
            ],
            'diagnostics-free-tools' => [
                ['free-health-checks', 'Free Health Checks', 'Free readiness and health diagnostics with instant results.', 'clipboard-check', 3, 0, ['A7']],
            ],
            'technology-automation' => [
                ['ai-agents-automation', 'AI Agents & Automation', 'Playbooks and implementations for governed AI agents.', 'bot', 9, 2450, ['A1', 'A2']],
                ['cloud-infrastructure', 'Cloud & Infrastructure', 'Cloud migration and infrastructure assessments.', 'cloud', 6, 18000, ['A1']],
            ],
            'risk-cybersecurity' => [
                ['information-security', 'Information Security', 'Cybersecurity risk assessments and security reviews.', 'shield-alert', 8, 0, ['A1', 'A5']],
            ],
            'subscriptions-intelligence' => [
                ['regulatory-bulletins', 'Regulatory Bulletins', 'Monthly and weekly regulatory and legal update services.', 'bell', 9, 450, ['A3']],
                ['business-planning-plans', 'Business Planning Plans', 'Ongoing plan maintenance with advisor oversight.', 'calendar-check', 3, 2950, ['A3']],
            ],
            'digital-products-ip' => [
                ['templates-toolkits', 'Templates & Toolkits', 'Editable templates, frameworks and toolkits.', 'layout-template', 64, 950, ['A2']],
                ['reports-research', 'Reports & Research', 'Market and sector research reports.', 'file-bar-chart', 41, 3750, ['A2']],
            ],
        ];

        return collect($map[$aisle] ?? [])->map(fn ($s) => [
            'slug' => $s[0], 'name' => $s[1], 'description' => $s[2], 'icon' => $s[3], 'sprints' => $s[4], 'from_zar' => $s[5] ?: null, 'acts' => $s[6],
        ])->all();
    }

    public static function aisle(string $slug): ?array
    {
        return collect(self::aisles())->firstWhere('slug', $slug);
    }

    /** Left-rail "A-Z Categories" on the shop landing (product formats). */
    public static function formats(): array
    {
        return ['Reports', 'Templates', 'Toolkits', 'Checklists', 'Calculators', 'Dashboards', 'Courses', 'Guides', 'Other Digital Products'];
    }

    /** Route tiles on the landing page (native sibling destinations). */
    public static function routeTiles(): array
    {
        return [
            ['title' => 'Digital Products', 'body' => 'Reports, templates, toolkits & more', 'icon' => 'file-text', 'href' => '/digital-products'],
            ['title' => 'Subscriptions', 'body' => 'Recurring access to intelligence & dashboards', 'icon' => 'repeat', 'href' => '/subscriptions'],
            ['title' => 'Retainers', 'body' => 'Ongoing advisory support', 'icon' => 'users-round', 'href' => '/retainers'],
            ['title' => 'Due Diligence Products', 'body' => 'Individual, company & supplier checks', 'icon' => 'file-search', 'href' => '/due-diligence'],
            ['title' => 'Technology Solutions', 'body' => 'Implement & automate with Zoho One', 'icon' => 'cpu', 'href' => '/technology-solutions'],
            ['title' => 'Marketplace', 'body' => 'Submit briefs, get matched', 'icon' => 'handshake', 'href' => '/shop/marketplace-brief'],
            ['title' => 'QuickBooks Integration', 'body' => 'Finance that just works', 'icon' => 'calculator', 'href' => '/technology-solutions'],
        ];
    }

    /** Services Resolver priorities -> the aisles and keywords they resolve to. */
    public static function priorities(): array
    {
        return [
            ['key' => 'compliance', 'title' => 'Compliance & Governance', 'body' => 'Meet regulatory requirements and strengthen governance.', 'icon' => 'shield-check', 'aisles' => ['compliance-governance', 'legal-contracts', 'due-diligence-verification'], 'keywords' => ['compliance', 'popia', 'regulatory', 'governance', 'audit']],
            ['key' => 'growth', 'title' => 'Growth & Strategy', 'body' => 'Scale operations, improve performance and grow sustainably.', 'icon' => 'trending-up', 'aisles' => ['business-strategy-planning', 'marketing-sales'], 'keywords' => ['strategy', 'market', 'growth', 'plan', 'entry']],
            ['key' => 'people', 'title' => 'People & Organisation', 'body' => 'Build teams, refine structures and improve productivity.', 'icon' => 'users', 'aisles' => ['hr-people', 'retainers-advisory-desks'], 'keywords' => ['hr', 'people', 'labour', 'advisory', 'team']],
            ['key' => 'technology', 'title' => 'Technology & Automation', 'body' => 'Digitise, automate and leverage technology intelligently.', 'icon' => 'cpu', 'aisles' => ['technology-automation', 'ict-digital-economy', 'risk-cybersecurity'], 'keywords' => ['ai', 'automation', 'cloud', 'digital', 'cyber', 'zoho']],
            ['key' => 'funding', 'title' => 'Funding & Finance', 'body' => 'Access capital, manage finances and optimise cash flow.', 'icon' => 'briefcase', 'aisles' => ['finance-investment', 'due-diligence-verification'], 'keywords' => ['funding', 'investment', 'finance', 'feasibility', 'valuation', 'capital']],
            ['key' => 'rescue', 'title' => 'Rescue & Recovery', 'body' => 'Stabilise, turnaround and restore business performance.', 'icon' => 'life-buoy', 'aisles' => ['project-advisory-restructuring'], 'keywords' => ['rescue', 'turnaround', 'distress', 'restructuring', 'health']],
        ];
    }

    /** Structured synonyms used for spelling/synonym correction on zero results. */
    public static function synonyms(): array
    {
        return [
            'gtm' => 'go-to-market',
            'popi' => 'popia',
            'privacy' => 'popia',
            'export' => 'market entry',
            'expansion' => 'market entry',
            'funding' => 'investment readiness',
            'raise' => 'investment readiness',
            'capital' => 'investment readiness',
            'turnaround' => 'business rescue',
            'distress' => 'business rescue',
            'cyber' => 'cybersecurity',
            'security' => 'cybersecurity',
            'contract' => 'agreement',
            'nda' => 'non-disclosure',
            'plan' => 'business plan',
            'tax' => 'tax due diligence',
            'diagnostic' => 'health check',
            'ai' => 'ai agents',
            'automation' => 'ai agents',
            'valuation' => 'business valuation',
        ];
    }

    /** Aisles whose name/keywords overlap the query (nearest capability families). */
    public static function nearestAisles(string $query, int $limit = 4): Collection
    {
        $tokens = collect(preg_split('/\s+/', Str::lower($query)))->filter(fn ($t) => strlen($t) > 2);

        return collect(self::aisles())
            ->map(function ($a) use ($tokens) {
                $hay = Str::lower($a['name'].' '.$a['description']);
                $a['score'] = $tokens->filter(fn ($t) => str_contains($hay, $t))->count();

                return $a;
            })
            ->sortByDesc(fn ($a) => [$a['score'], $a['products']])
            ->take($limit)
            ->values();
    }

    public static function deliveryBand(?string $delivery): ?string
    {
        if (! $delivery || ! preg_match('/(\d+)(?:\s*[-–]\s*(\d+))?/', $delivery, $m)) {
            return str_contains(Str::lower((string) $delivery), 'instant') ? '0-5' : null;
        }
        $max = (int) ($m[2] ?? $m[1]);

        return match (true) {
            $max <= 5 => '0-5',
            $max <= 15 => '6-15',
            $max <= 30 => '16-30',
            default => '31+',
        };
    }

    /** Governed Sprints on the site: the distinct Sprints of the client's register (7,008 when fully loaded). */
    public static function governedTotal(): int
    {
        return Register::liveCount();
    }

    /** Listed shop products plus the published Sprints shelved in the aisle. */
    public static function productCountForAisle(string $aisle): int
    {
        return Product::query()->listed()->where('aisle', $aisle)->count() + self::sprintCountForAisle($aisle);
    }

    public static function sprintCountForAisle(string $aisle): int
    {
        return self::sprintAisleCounts()[$aisle] ?? 0;
    }

    /** @return array<string, int> published sprints per shop aisle (cached until the sprints table changes; read once per request) */
    public static function sprintAisleCounts(): array
    {
        return once(fn () => self::loadSprintAisleCounts());
    }

    /** @return array<string, int> */
    private static function loadSprintAisleCounts(): array
    {
        $version = Sprint::query()->count().'-'.Sprint::query()->max('updated_at');

        return Cache::remember('shop.sprint-aisle-counts.'.md5($version), now()->addDay(), fn () => Sprint::query()
            ->where('status', 'published')->whereNotNull('shop_aisle')
            ->groupBy('shop_aisle')->selectRaw('shop_aisle, count(*) as n')->pluck('n', 'shop_aisle')
            ->map(fn ($n) => (int) $n)->all());
    }
}
