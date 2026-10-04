<?php

namespace App\Support\CorePages;

use Illuminate\Validation\Rule;

/**
 * Business Health Score diagnostic: question register, weights, bands and scoring.
 *
 * Every scored option carries 0-100 points. A section score is the mean of its scored
 * answers; the overall score is the weighted mean of the five dimensions
 * (Growth 25%, Finance 15%, Sales 15%, Operations 25%, People & Compliance 20%).
 */
class HealthScore
{
    public const STEPS = [
        1 => ['key' => 'business', 'label' => 'Your Business', 'crumb' => 'Your Business'],
        2 => ['key' => 'growth', 'label' => 'Growth', 'crumb' => 'Growth Readiness'],
        3 => ['key' => 'finance', 'label' => 'Finance', 'crumb' => 'Finance and Cash Flow'],
        4 => ['key' => 'sales', 'label' => 'Sales', 'crumb' => 'Sales and Marketing'],
        5 => ['key' => 'operations', 'label' => 'Operations', 'crumb' => 'Operations and Delivery'],
        6 => ['key' => 'people', 'label' => 'People and Compliance', 'crumb' => 'People, Governance & Compliance'],
        7 => ['key' => 'review', 'label' => 'Review', 'crumb' => 'Review and Submit'],
    ];

    public const WEIGHTS = [
        'growth' => 0.25,
        'finance' => 0.15,
        'sales' => 0.15,
        'operations' => 0.25,
        'people' => 0.20,
    ];

    public const DIMENSIONS = [
        'growth' => 'Growth Readiness',
        'finance' => 'Finance & Cash Flow',
        'sales' => 'Sales & Marketing',
        'operations' => 'Operations & Delivery',
        'people' => 'People, Governance & Compliance',
    ];

    /** Score bands, highest first. */
    public const BANDS = [
        ['min' => 85, 'key' => 'strong', 'title' => 'Strong Foundation — Scale Ready', 'body' => 'Your business shows strong, well-controlled fundamentals across all five dimensions. Focus on disciplined expansion, automation and investor readiness.'],
        ['min' => 70, 'key' => 'good', 'title' => 'Good Foundation — Growth Ready with Important Gaps to Address', 'body' => 'Your business shows encouraging fundamentals, but several operational and growth areas need structured attention before you scale aggressively.'],
        ['min' => 50, 'key' => 'developing', 'title' => 'Developing — Stabilise Core Systems Before Scaling', 'body' => 'Your business has workable foundations, but gaps in planning, control or delivery could limit growth. Prioritise the actions below before taking on new risk.'],
        ['min' => 0, 'key' => 'at_risk', 'title' => 'At Risk — Urgent Attention Needed', 'body' => 'Several critical areas are under strain. Stabilise cash, controls and delivery first, and speak to a TBCA advisor about a structured recovery plan.'],
    ];

    public static function profileOptions(): array
    {
        return [
            'provinces' => ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'],
            'countries' => ['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Malawi', 'Zambia', 'Other African country'],
            'industries' => ['Business Consulting & Advisory', 'Agriculture & Agri-processing', 'Construction & Infrastructure', 'Energy & Renewables', 'Financial Services', 'Healthcare', 'ICT & Digital', 'Manufacturing', 'Mining & Resources', 'Retail & Wholesale', 'Tourism & Hospitality', 'Transport & Logistics', 'Other'],
            'stages' => ['Idea / Pre-revenue', 'Startup (0-2 years)', 'Early Growth', 'Established SME', 'Scaling / Expansion', 'Mature Enterprise'],
            'revenue_bands' => ['Pre-revenue', 'Under R1 million', 'R1 million to R2 million', 'R2 million to R10 million', 'R10 million to R50 million', 'Over R50 million'],
            'employees' => ['Just me', '2 to 10', '11 to 25', '26 to 50', '51 to 200', 'Over 200'],
        ];
    }

    /**
     * @return array<string, array{title: string, intro: string, about: string, bullets: list<string>, questions: list<array>}>
     */
    public static function sections(): array
    {
        $yesNo = ['Yes, fully in place' => 100, 'Partially' => 55, 'Not yet' => 15];
        $rating = ['Excellent' => 100, 'Good' => 75, 'Average' => 50, 'Weak' => 25, 'Not sure' => 30];
        $frequency = ['Weekly' => 100, 'Monthly' => 85, 'Quarterly' => 60, 'Annually' => 30, 'Rarely or never' => 10];

        return [
            'growth' => [
                'title' => 'Let us understand your growth readiness.',
                'intro' => 'These questions help us assess your strategic direction, market position and growth potential.',
                'about' => 'We are measuring your growth readiness to understand your direction, market position and ability to scale.',
                'bullets' => ['Helps identify strategic strengths and growth gaps', 'Adapts the following questions to your business stage', 'Used to generate your personalised priority action plan', 'All answers are confidential and used only for this diagnostic'],
                'next' => 'Finance & Cash Flow',
                'questions' => [
                    self::q('growth_aspiration', 'What best describes your business growth aspiration over the next 12 months?', ['Aggressive growth with a clear plan' => 100, 'Steady growth with defined targets' => 85, 'Growth, but without defined targets' => 50, 'Maintain current position' => 35, 'Unsure / survival mode' => 10], 'Growth ambition is not yet backed by defined targets and a plan'),
                    self::q('markets', 'Which markets are you currently focused on?', ['Multiple African markets' => 100, 'National (South Africa-wide)' => 80, 'Regional / provincial' => 60, 'Local community only' => 40, 'Not clearly defined' => 10], 'Target market focus is not clearly defined'),
                    self::q('competitive_position', 'How would you rate your current competitive position in your market?', ['Market leader' => 100, 'Strong challenger' => 80, 'Average competitor' => 55, 'Weak / struggling to compete' => 25, 'Not sure' => 30], 'Competitive position is weak or unclear'),
                    self::q('value_proposition', 'Do you have a clearly defined unique value proposition?', ['Yes, documented and tested with customers' => 100, 'Yes, but not documented' => 65, 'Partially' => 40, 'No' => 10], 'Unique value proposition is not clearly defined or tested'),
                    self::q('strategic_planning', 'How mature is your strategic planning?', ['Written strategy reviewed quarterly' => 100, 'Written strategy reviewed annually' => 75, 'Informal plan in the owner\'s head' => 40, 'No strategic plan' => 10], 'Strategic planning is informal or missing'),
                    self::q('growth_constraint', 'What is your primary growth constraint right now?', ['No major constraint' => 95, 'Access to new customers' => 60, 'Skills and capacity' => 55, 'Systems and processes' => 55, 'Access to funding' => 45, 'Cash flow pressure' => 35], 'A primary growth constraint is holding the business back'),
                    self::q('skills_access', 'Do you have access to the skills you need to grow?', ['Yes, in-house or through partners' => 100, 'Mostly' => 70, 'Some gaps' => 45, 'Significant skills gaps' => 15], 'Skills gaps limit the ability to grow'),
                ],
            ],
            'finance' => [
                'title' => 'Let us understand your finance and cash flow.',
                'intro' => 'These questions help us assess your financial health, cash flow management and financial planning.',
                'about' => 'We are assessing your financial stability, cash flow management and planning capability.',
                'bullets' => ['Helps identify financial strengths and vulnerabilities', 'Assesses cash flow, profitability and financial planning', 'Used to generate your personalised priority action plan', 'All answers are confidential and used only for this diagnostic'],
                'next' => 'Sales and Marketing',
                'questions' => [
                    self::q('turnover_range', 'What is your current annual turnover range?', ['Over R50 million' => 100, 'R10 million to R50 million' => 90, 'R2 million to R10 million' => 75, 'R1 million to R2 million' => 60, 'Under R1 million' => 40, 'Pre-revenue' => 15], 'Turnover is still building towards a sustainable base'),
                    self::q('profit_loss', 'What was your profit or loss last financial year?', ['Healthy profit (over 15% margin)' => 100, 'Modest profit (5-15% margin)' => 75, 'Break-even' => 45, 'Small loss' => 25, 'Significant loss' => 5], 'Profitability is limited or negative'),
                    self::q('cash_management', 'How do you currently manage your cash flow?', ['Rolling cash flow forecast, reviewed weekly' => 100, 'Monthly cash flow review' => 75, 'Bank balance checks only' => 35, 'No formal cash management' => 10], 'Limited financial planning discipline and cash visibility'),
                    self::q('cash_runway', 'How many months of operating expenses can your business cover with existing cash or reserves?', ['More than 6 months' => 100, '3 to 6 months' => 75, '1 to 3 months' => 45, 'Less than 1 month' => 15], 'Cash reserves cover too few months of operating expenses'),
                    self::q('funding_access', 'Do you have access to external funding or credit facilities?', ['Yes, approved and available' => 100, 'Yes, but limited' => 65, 'Applied, awaiting outcome' => 45, 'No access' => 20], 'Access to external funding is limited'),
                    self::q('financial_review', 'How often do you review your financial performance?', $frequency, 'Financial performance is not reviewed often enough'),
                    self::q('financial_records', 'Do you maintain up-to-date financial records?', ['Yes, monthly management accounts' => 100, 'Yes, annual financial statements only' => 60, 'Records are behind' => 25, 'No formal records' => 5], 'Financial records are not kept up to date'),
                    self::q('budget', 'Do you have a budget or financial plan for the next 12 months?', $yesNo, 'No 12-month budget or financial plan'),
                    self::q('accounting_system', 'What accounting system do you use?', ['Xero' => null, 'Sage' => null, 'QuickBooks' => null, 'Zoho Books' => null, 'Spreadsheets' => null, 'Other' => null, 'None' => null], null, false),
                    ['key' => 'monthly_revenue', 'label' => 'What is your average monthly revenue? (ZAR)', 'type' => 'amount', 'required' => true],
                    ['key' => 'monthly_profit', 'label' => 'What is your average monthly net profit? (ZAR)', 'type' => 'amount', 'required' => false],
                    ['key' => 'monthly_cash', 'label' => 'What is your average monthly cash balance? (ZAR)', 'type' => 'amount', 'required' => false],
                ],
            ],
            'sales' => [
                'title' => 'Let us understand your sales and marketing.',
                'intro' => 'These questions help us assess your customer acquisition, marketing effectiveness and sales performance.',
                'about' => 'We are evaluating your ability to attract customers, convert leads and drive sales growth.',
                'bullets' => ['Helps identify strengths and gaps in your sales and marketing engine', 'Assesses customer acquisition channels and conversion performance', 'Used to generate your personalised priority action plan', 'All answers are confidential and used only for this diagnostic'],
                'next' => 'Operations & Delivery',
                'questions' => [
                    self::q('target_customers', 'Who are your primary target customers?', ['Clearly defined segments with personas' => 100, 'Businesses (B2B), broadly defined' => 65, 'Consumers (B2C), broadly defined' => 65, 'Government / public sector' => 70, 'Anyone who will buy' => 15], 'Target customers are not clearly defined'),
                    self::q('acquisition', 'How do you currently acquire new customers?', ['Structured multi-channel programme' => 100, 'Referrals plus some marketing' => 70, 'Mostly referrals and word of mouth' => 45, 'Ad hoc / reactive' => 20], 'Customer acquisition relies on ad hoc or reactive activity'),
                    self::q('top_channel', 'Which channel brings you the most customers?', ['Digital marketing (search, social, email)' => 85, 'Direct sales team' => 80, 'Partners and channels' => 80, 'Referrals' => 60, 'Tenders' => 60, 'Walk-ins' => 45, 'Not tracked' => 10], 'The best-performing customer channel is not tracked'),
                    self::q('marketing_effectiveness', 'How would you rate your marketing effectiveness?', $rating, 'Marketing effectiveness is average or weak'),
                    self::q('marketing_strategy', 'Do you have a documented marketing strategy?', $yesNo, 'No documented marketing strategy'),
                    self::q('roi_tracking', 'Do you track marketing ROI or conversion metrics?', ['Yes, with a dashboard' => 100, 'Some metrics, tracked manually' => 55, 'No' => 10], 'Inconsistent lead generation and conversion tracking'),
                    self::q('monthly_leads', 'How many qualified leads do you generate monthly?', ['More than 100' => 100, '51 to 100' => 85, '21 to 50' => 70, '5 to 20' => 45, 'Fewer than 5' => 20, 'Not tracked' => 10], 'Qualified lead volume is low or not tracked'),
                    self::q('conversion_rate', 'What is your lead-to-customer conversion rate?', ['Above 30%' => 100, '20% to 30%' => 80, '10% to 20%' => 60, 'Below 10%' => 35, 'Not tracked' => 10], 'Lead-to-customer conversion is low or not tracked'),
                    self::q('sales_process', 'How would you rate your current sales process?', ['Documented pipeline with stages and targets' => 100, 'Defined but informal' => 60, 'Owner-led and ad hoc' => 30, 'No sales process' => 10], 'The sales process is informal or owner-dependent'),
                    self::q('crm', 'Do you have a CRM or customer database?', ['Yes, CRM used daily' => 100, 'Yes, but rarely updated' => 50, 'Spreadsheet list only' => 35, 'No' => 10], 'No reliable CRM or customer database'),
                    self::q('retention', 'How do you retain and grow existing customers?', ['Structured account management and loyalty' => 100, 'Regular follow-ups' => 70, 'Occasional contact' => 40, 'No retention activity' => 10], 'No structured customer retention activity'),
                    ['key' => 'sales_challenge', 'label' => 'What is your biggest sales or marketing challenge?', 'type' => 'text', 'required' => true],
                ],
            ],
            'operations' => [
                'title' => 'Let us understand your operations and delivery.',
                'intro' => 'These questions help us assess how effectively your business operates and delivers value to your customers.',
                'about' => 'We are evaluating how your business operates, manages resources and delivers value.',
                'bullets' => ['Assesses process efficiency, quality and resource management', 'Identifies delivery strengths and operational gaps', 'Used to generate your personalised priority action plan', 'All answers are confidential and used only for this diagnostic'],
                'next' => 'People, Governance & Compliance',
                'questions' => [
                    self::q('process_efficiency', 'How would you describe the efficiency of your key business processes?', ['Highly efficient and measured' => 100, 'Mostly efficient' => 75, 'Some inefficiencies' => 50, 'Very inefficient' => 15], 'Key business processes are inefficient'),
                    self::q('sops', 'Do you use documented Standard Operating Procedures (SOPs)?', $yesNo, 'Standard Operating Procedures are not documented'),
                    self::q('quality', 'How do you ensure quality in your products or services?', ['Formal quality management system' => 100, 'Checklists and spot checks' => 70, 'Owner reviews everything' => 40, 'No quality controls' => 10], 'Quality controls are informal or missing'),
                    self::q('inventory', 'How do you currently manage inventory, stock or resources?', ['Integrated system with real-time tracking' => 100, 'Spreadsheets updated regularly' => 65, 'Manual counts' => 40, 'Not managed' => 10, 'Not applicable' => 75], 'Inventory and resources are not actively managed'),
                    self::q('suppliers', 'How reliable are your suppliers and service providers?', ['Very reliable, with contracts and SLAs' => 100, 'Mostly reliable' => 75, 'Sometimes unreliable' => 45, 'Frequently unreliable' => 15], 'Supplier reliability is a risk'),
                    self::q('customer_service', 'How do you manage customer service and complaints?', ['Ticketing system with response targets' => 100, 'Dedicated person or inbox' => 70, 'Handled as they arise' => 40, 'No process' => 10], 'Customer service and complaints are not managed systematically'),
                    self::q('delivery_tracking', 'Do you track delivery times and service levels?', ['Yes, against defined SLAs' => 100, 'Informally' => 50, 'No' => 10], 'Delivery times and service levels are not tracked'),
                    self::q('ops_measurement', 'How do you measure operational performance?', ['KPI dashboard reviewed weekly' => 100, 'Monthly KPI reports' => 75, 'Occasional reviews' => 40, 'Not measured' => 10], 'Operational performance is not measured'),
                    self::q('bottlenecks', 'Are there any operational bottlenecks that slow your business down?', ['No significant bottlenecks' => 100, 'Minor bottlenecks' => 70, 'Several bottlenecks' => 40, 'Severe bottlenecks' => 10], 'Operational bottlenecks slow the business down'),
                    self::q('technology_use', 'How do you use technology to improve operations?', ['Integrated systems and automation' => 100, 'Several digital tools' => 70, 'Basic tools (email, spreadsheets)' => 40, 'Very little technology' => 10], 'Technology is under-used in operations'),
                    self::q('scale_readiness', 'How prepared is your business to scale operations?', ['Fully prepared' => 100, 'Mostly prepared' => 70, 'Partially prepared' => 45, 'Not prepared' => 10], 'Operations are not ready to scale'),
                    ['key' => 'ops_challenge', 'label' => 'What is your biggest operational challenge right now?', 'type' => 'text', 'required' => true],
                ],
            ],
            'people' => [
                'title' => 'Let us understand your people, governance and compliance.',
                'intro' => 'These questions help us assess your people capability, governance practices and compliance posture.',
                'about' => 'We are evaluating your people management, governance practices and compliance awareness.',
                'bullets' => ['Assesses your team structure, leadership and skills development', 'Evaluates governance, policies and risk management', 'Measures compliance with labour laws, tax and data protection', 'All answers are confidential and used only for this diagnostic'],
                'next' => 'Review & Submit',
                'questions' => [
                    self::q('team_structure', 'How would you describe your current team structure?', ['Clear structure with defined reporting lines' => 100, 'Mostly clear' => 70, 'Informal / everyone does everything' => 35, 'Owner only' => 30], 'Team structure is informal'),
                    self::q('roles_documented', 'Do you have clear roles and responsibilities documented?', $yesNo, 'Roles and responsibilities are not documented'),
                    self::q('performance_mgmt', 'How do you manage employee performance?', ['Formal reviews with KPIs' => 100, 'Informal check-ins' => 55, 'Only when problems arise' => 25, 'Not managed' => 10], 'Employee performance is not formally managed'),
                    self::q('training', 'Do you provide training and skills development?', ['Structured training plan' => 100, 'Occasional training' => 55, 'On-the-job only' => 35, 'None' => 10], 'Training and skills development are limited'),
                    self::q('leadership', 'How would you rate your leadership capability?', $rating, 'Leadership capability needs strengthening'),
                    self::q('policies', 'Do you have written policies and procedures?', $yesNo, 'Partial governance, compliance and risk controls'),
                    self::q('labour_compliance', 'How do you ensure compliance with labour laws?', ['HR specialist / labour advisor' => 100, 'Contracts and basic policies' => 65, 'Ad hoc' => 30, 'Not addressed' => 5], 'Labour law compliance is not actively managed'),
                    self::q('health_safety', 'Do you have health and safety measures in place?', $yesNo, 'Health and safety measures are incomplete'),
                    self::q('risk_mgmt', 'How do you manage risk in your business?', ['Risk register reviewed regularly' => 100, 'Key risks identified informally' => 55, 'Reactive only' => 25, 'Not managed' => 5], 'Business risk is not formally managed'),
                    self::q('data_protection', 'Do you protect sensitive data and information?', ['Yes, POPIA programme in place' => 100, 'Basic controls (passwords, backups)' => 55, 'Minimal' => 25, 'No' => 5], 'Sensitive data protection (POPIA) is incomplete'),
                    self::q('insurance', 'Do you have business insurance coverage?', ['Comprehensive cover' => 100, 'Basic cover' => 60, 'No cover' => 10], 'Business insurance cover is limited'),
                    self::q('tax_compliance', 'Are you tax compliant and up to date?', ['Yes, with a valid tax clearance' => 100, 'Mostly up to date' => 60, 'Behind on returns' => 20, 'Not sure' => 25], 'Tax compliance is not fully up to date'),
                ],
            ],
        ];
    }

    private static function q(string $key, string $label, array $options, ?string $gap, bool $required = true): array
    {
        return [
            'key' => $key,
            'label' => $label,
            'type' => 'select',
            'required' => $required,
            'options' => array_keys($options),
            'points' => $options,
            'gap' => $gap,
        ];
    }

    /** Validation rules for a section step (2-6). */
    public static function rulesFor(string $section): array
    {
        $rules = [];
        foreach (self::sections()[$section]['questions'] as $q) {
            $base = $q['required'] ? ['required'] : ['nullable'];
            $rules["answers.{$q['key']}"] = match ($q['type']) {
                'select' => [...$base, 'string', Rule::in($q['options'])],
                'amount' => [...$base, 'numeric', 'min:0', 'max:100000000000'],
                default => [...$base, 'string', 'max:500'],
            };
        }

        return $rules;
    }

    /** Questions stripped of internal scoring data, for the browser. */
    public static function publicSections(): array
    {
        return collect(self::sections())->map(fn ($s) => [
            ...collect($s)->except('questions')->all(),
            'questions' => collect($s['questions'])->map(fn ($q) => collect($q)->only(['key', 'label', 'type', 'required', 'options'])->all())->all(),
        ])->all();
    }

    /**
     * @param  array<string, array<string, mixed>>  $answers  keyed by section
     * @return array{dimensions: array<string, int>, overall: int, band: array, gaps: list<array>, actions: list<string>, recommendation: array, also: list<array>}
     */
    public static function score(array $answers): array
    {
        $dimensions = [];
        $itemScores = [];

        foreach (self::sections() as $section => $def) {
            $values = [];
            foreach ($def['questions'] as $q) {
                $answer = $answers[$section][$q['key']] ?? null;
                if ($q['type'] !== 'select' || $answer === null || ! array_key_exists($answer, $q['points']) || $q['points'][$answer] === null) {
                    continue;
                }
                $points = (int) $q['points'][$answer];
                $values[] = $points;
                $itemScores[] = ['section' => $section, 'key' => $q['key'], 'points' => $points, 'gap' => $q['gap']];
            }

            if ($section === 'finance') {
                $derived = self::derivedFinance($answers['finance'] ?? []);
                if ($derived !== null) {
                    $values[] = $derived;
                }
            }

            $dimensions[$section] = $values ? (int) round(array_sum($values) / count($values)) : 0;
        }

        $overall = (int) round(collect(self::WEIGHTS)->map(fn ($w, $k) => $w * $dimensions[$k])->sum());
        $band = collect(self::BANDS)->first(fn ($b) => $overall >= $b['min']);

        $gaps = collect($itemScores)
            ->filter(fn ($i) => $i['gap'] && $i['points'] < 80)
            ->sortBy([['points', 'asc'], [fn ($a, $b) => self::WEIGHTS[$b['section']] <=> self::WEIGHTS[$a['section']]]])
            ->unique('section')
            ->take(3)
            ->map(fn ($i) => ['title' => $i['gap'], 'dimension' => self::DIMENSIONS[$i['section']], 'section' => $i['section']])
            ->values()
            ->all();

        $weakest = collect($dimensions)->sort()->keys()->all();
        $actionsBySection = [
            'finance' => 'Set up a monthly cash flow and budget review routine.',
            'sales' => 'Define a simple sales funnel and track conversion rates weekly.',
            'people' => 'Document core policies, responsibilities and compliance controls.',
            'operations' => 'Map your three core processes and write SOPs for each.',
            'growth' => 'Write a one-page growth plan with 12-month targets and owners.',
        ];
        $actions = collect($weakest)->take(3)->map(fn ($s) => $actionsBySection[$s])->values()->all();
        $actions[] = 'Schedule a TBCA advisory session to convert findings into an implementation roadmap.';

        $sprintFor = self::sprintMap();
        $spread = max($dimensions) - min($dimensions);
        $recommendation = $spread < 15 && $overall < 85
            ? self::healthCheckSprint()
            : $sprintFor[$weakest[0]];
        $also = collect($weakest)->take(2)->map(fn ($s) => $sprintFor[$s])
            ->reject(fn ($s) => $s['slug'] === $recommendation['slug'])->unique('slug')->values()->all();

        return compact('dimensions', 'overall', 'band', 'gaps', 'actions', 'recommendation', 'also');
    }

    /** Margin and cash-cover score from the monthly figures (step 3, questions 10-12). */
    public static function derivedFinance(array $finance): ?int
    {
        $revenue = (float) ($finance['monthly_revenue'] ?? 0);
        if ($revenue <= 0 || ! isset($finance['monthly_profit']) || $finance['monthly_profit'] === null || $finance['monthly_profit'] === '') {
            return null;
        }
        $profit = (float) $finance['monthly_profit'];
        $margin = $profit / $revenue;
        $marginScore = match (true) {
            $margin >= 0.15 => 100,
            $margin >= 0.08 => 75,
            $margin >= 0.02 => 50,
            $margin >= 0 => 35,
            default => 10,
        };

        if (! isset($finance['monthly_cash']) || $finance['monthly_cash'] === '' || $finance['monthly_cash'] === null) {
            return $marginScore;
        }
        $expenses = max($revenue - $profit, 1);
        $months = (float) $finance['monthly_cash'] / $expenses;
        $cashScore = match (true) {
            $months >= 6 => 100,
            $months >= 3 => 75,
            $months >= 1 => 45,
            default => 15,
        };

        return (int) round(($marginScore + $cashScore) / 2);
    }

    public static function healthCheckSprint(): array
    {
        return [
            'name' => 'Business Health Check Advisory Sprint',
            'slug' => 'business-health-check',
            'href' => '/diagnostics#packs',
            'body' => 'A focused sprint to interpret your score, validate business bottlenecks and prepare a practical growth action roadmap.',
            'chips' => ['Human Reviewed', 'AI Assisted', 'Strategy Focused', 'Suitable for SMEs'],
        ];
    }

    /** The Sprint that best addresses each weak dimension. */
    public static function sprintMap(): array
    {
        $chips = ['Human Reviewed', 'AI Assisted', 'Fixed Scope', 'Suitable for SMEs'];

        return [
            'growth' => ['name' => 'Business Plan Development Sprint', 'slug' => 'business-plan-development-sprint', 'href' => '/sprints/business-plan-development-sprint', 'body' => 'Build an investor-ready business plan with clear targets, market positioning and an execution roadmap.', 'chips' => $chips],
            'finance' => ['name' => 'Financial Model & Valuation Sprint', 'slug' => 'financial-model-valuation-sprint', 'href' => '/sprints/financial-model-valuation-sprint', 'body' => 'Build a driver-based financial model, cash flow forecast and valuation to regain cash visibility and plan with confidence.', 'chips' => $chips],
            'sales' => ['name' => 'Market Research & Feasibility Sprint', 'slug' => 'market-research-feasibility-sprint', 'href' => '/sprints/market-research-feasibility-sprint', 'body' => 'Validate your target segments, channels and pricing with data so your sales engine focuses where demand is real.', 'chips' => $chips],
            'operations' => ['name' => 'AI Automation & Digital Transformation Sprint', 'slug' => 'ai-automation-digital-transformation-sprint', 'href' => '/sprints/ai-automation-digital-transformation-sprint', 'body' => 'Remove bottlenecks with documented workflows, automation and dashboards that make delivery measurable.', 'chips' => $chips],
            'people' => self::healthCheckSprint(),
        ];
    }
}
