<?php

namespace App\Support\CorePages;

use Illuminate\Support\Carbon;

/**
 * Tools, Templates & Calculators catalogue and the calculation engines behind each calculator.
 */
class ToolsCatalogue
{
    public const TYPES = [
        'reports' => 'Report',
        'templates' => 'Template',
        'toolkits' => 'Toolkit',
        'checklists' => 'Checklist',
        'calculators' => 'Calculator',
        'interactive-tools' => 'Interactive Tool',
        'guides' => 'Guide',
        'courses' => 'Course',
    ];

    public const LICENCES = [
        'single' => ['label' => 'One-off Digital Download', 'licence' => 'Single-User / One-off', 'multiplier' => 1.0],
        'annual' => ['label' => 'Annual — 5 Seats', 'licence' => 'Annual / 5 Seats', 'multiplier' => 2.5],
        'business' => ['label' => 'Business — Multi-User Plan', 'licence' => 'Business / Multi-User', 'multiplier' => 4.0],
    ];

    public static function needs(): array
    {
        return ['Planning & Strategy', 'Finance & Cash Flow', 'Funding & Investment', 'Operations', 'Compliance & Due Diligence', 'Digital & Technology'];
    }

    public static function audiences(): array
    {
        return ['Entrepreneurs & SMEs', 'Entrepreneurs & Startups', 'Startups & Scaleups', 'Business Owners', 'CFOs & Finance Teams', 'Operations Managers', 'HR & Payroll Teams', 'Advisors & Analysts'];
    }

    public static function products(): array
    {
        $p = fn (array $a) => array_merge([
            'languages' => ['EN', 'AF'],
            'formats' => ['Excel'],
            'human_reviewed' => true,
            'version' => '1.0',
            'size_kb' => 324,
            'recommended' => false,
            'calculator' => null,
            'industry' => 'All industries',
            'instant' => true,
        ], $a);

        return [
            $p(['code' => 'TLS-001', 'slug' => 'business-plan-development-template', 'type' => 'templates', 'title' => 'Business Plan Development Template', 'body' => 'Build a comprehensive business plan for funders and stakeholders.', 'audience' => 'Entrepreneurs & SMEs', 'need' => 'Planning & Strategy', 'formats' => ['PDF', 'Word'], 'zar' => 1450, 'recommended' => true, 'size_kb' => 860]),
            $p(['code' => 'TLS-002', 'slug' => '13-week-cash-flow-forecast-calculator', 'type' => 'calculators', 'title' => '13-Week Cash Flow Forecast Calculator', 'body' => 'Project cash inflows and outflows week by week for 13 weeks. Plan liquidity. Avoid surprises.', 'audience' => 'CFOs & Finance Teams', 'need' => 'Finance & Cash Flow', 'zar' => 2950, 'recommended' => true, 'calculator' => 'cash-flow', 'size_kb' => 410]),
            $p(['code' => 'TLS-003', 'slug' => 'funding-readiness-checklist', 'type' => 'checklists', 'title' => 'Funding Readiness Checklist', 'body' => 'Ensure your business is prepared for investor or lender funding.', 'audience' => 'Entrepreneurs & Startups', 'need' => 'Funding & Investment', 'formats' => ['PDF'], 'zar' => 650, 'recommended' => true, 'size_kb' => 220]),
            $p(['code' => 'TLS-004', 'slug' => 'pricing-and-break-even-calculator', 'type' => 'calculators', 'title' => 'Pricing and Break-Even Calculator', 'body' => 'Calculate break-even units, revenue and contribution to set profitable prices.', 'audience' => 'Business Owners', 'need' => 'Finance & Cash Flow', 'zar' => 1950, 'recommended' => true, 'calculator' => 'break-even', 'size_kb' => 290]),
            $p(['code' => 'TLS-005', 'slug' => 'standard-operating-procedure-toolkit', 'type' => 'toolkits', 'title' => 'Standard Operating Procedure Toolkit', 'body' => 'Create consistent SOPs to improve efficiency and reduce risk.', 'audience' => 'Operations Managers', 'need' => 'Operations', 'formats' => ['PDF', 'Word', 'ZIP'], 'zar' => 3450, 'recommended' => true, 'size_kb' => 2400]),
            $p(['code' => 'TLS-006', 'slug' => 'investor-pitch-deck-template', 'type' => 'templates', 'title' => 'Investor Pitch Deck Template', 'body' => 'Professional slide deck to pitch your business to investors.', 'audience' => 'Startups & Scaleups', 'need' => 'Funding & Investment', 'formats' => ['PowerPoint'], 'zar' => 1850, 'recommended' => true, 'size_kb' => 5200]),
            $p(['code' => 'TLS-007', 'slug' => 'digital-readiness-assessment-tool', 'type' => 'interactive-tools', 'title' => 'Digital Readiness Assessment Tool', 'body' => 'Assess your digital maturity and get a roadmap to improve.', 'audience' => 'Business Owners', 'need' => 'Digital & Technology', 'formats' => ['Interactive Tool'], 'zar' => 2450, 'recommended' => true, 'size_kb' => 150]),
            $p(['code' => 'TLS-008', 'slug' => 'due-diligence-document-checklist', 'type' => 'checklists', 'title' => 'Due Diligence Document Checklist', 'body' => 'Stay organised with essential documents for due diligence.', 'audience' => 'Entrepreneurs & SMEs', 'need' => 'Compliance & Due Diligence', 'formats' => ['PDF', 'Word'], 'zar' => 950, 'recommended' => true, 'size_kb' => 310]),
            $p(['code' => 'TLS-009', 'slug' => 'startup-runway-calculator', 'type' => 'calculators', 'title' => 'Startup Runway Calculator', 'body' => 'Estimate runway based on burn rate, funding and planned milestones.', 'audience' => 'Startups & Scaleups', 'need' => 'Funding & Investment', 'zar' => 1650, 'calculator' => 'runway', 'size_kb' => 260]),
            $p(['code' => 'TLS-010', 'slug' => 'loan-amortisation-calculator', 'type' => 'calculators', 'title' => 'Loan Amortisation Calculator', 'body' => 'Calculate loan repayments, interest and amortisation schedules with ease.', 'audience' => 'Business Owners', 'need' => 'Finance & Cash Flow', 'languages' => ['EN', 'AF'], 'zar' => 4950, 'calculator' => 'loan', 'size_kb' => 324]),
            $p(['code' => 'TLS-011', 'slug' => 'working-capital-calculator', 'type' => 'calculators', 'title' => 'Working Capital Calculator', 'body' => 'Track current assets, current liabilities and working capital health in real time.', 'audience' => 'CFOs & Finance Teams', 'need' => 'Finance & Cash Flow', 'zar' => 2250, 'calculator' => 'working-capital', 'size_kb' => 280]),
            $p(['code' => 'TLS-012', 'slug' => 'payroll-cost-estimator', 'type' => 'calculators', 'title' => 'Payroll Cost Estimator', 'body' => 'Estimate total payroll costs including benefits, taxes and statutory levies.', 'audience' => 'HR & Payroll Teams', 'need' => 'Operations', 'zar' => 1850, 'calculator' => 'payroll', 'size_kb' => 240]),
            $p(['code' => 'TLS-013', 'slug' => 'business-valuation-sensitivity-calculator', 'type' => 'calculators', 'title' => 'Business Valuation Sensitivity Calculator', 'body' => 'Test valuation outcomes under different assumptions and scenarios.', 'audience' => 'Advisors & Analysts', 'need' => 'Funding & Investment', 'zar' => 5450, 'calculator' => 'valuation', 'size_kb' => 520]),
            $p(['code' => 'TLS-014', 'slug' => 'budget-variance-calculator', 'type' => 'calculators', 'title' => 'Budget Variance Calculator', 'body' => 'Compare budget vs actuals with variance analysis and insights.', 'audience' => 'CFOs & Finance Teams', 'need' => 'Finance & Cash Flow', 'zar' => 1450, 'calculator' => 'budget-variance', 'size_kb' => 230]),
            $p(['code' => 'TLS-015', 'slug' => 'south-africa-sme-market-report-2026', 'type' => 'reports', 'title' => 'South Africa SME Market Report 2026', 'body' => 'Sector trends, demand signals and funding conditions for South African SMEs.', 'audience' => 'Advisors & Analysts', 'need' => 'Planning & Strategy', 'formats' => ['PDF'], 'zar' => 2950, 'size_kb' => 4100, 'languages' => ['EN']]),
            $p(['code' => 'TLS-016', 'slug' => 'popia-compliance-guide-for-smes', 'type' => 'guides', 'title' => 'POPIA Compliance Guide for SMEs', 'body' => 'A practical, step-by-step guide to POPIA obligations for small businesses.', 'audience' => 'Business Owners', 'need' => 'Compliance & Due Diligence', 'formats' => ['PDF'], 'zar' => 850, 'size_kb' => 900]),
            $p(['code' => 'TLS-017', 'slug' => 'financial-modelling-fundamentals-course', 'type' => 'courses', 'title' => 'Financial Modelling Fundamentals Course', 'body' => 'Self-paced course on building driver-based financial models for SMEs.', 'audience' => 'Entrepreneurs & SMEs', 'need' => 'Finance & Cash Flow', 'formats' => ['Interactive Tool', 'Excel'], 'zar' => 3950, 'size_kb' => 1200, 'languages' => ['EN'], 'instant' => false]),
        ];
    }

    public static function find(string $type, string $slug): ?array
    {
        return collect(self::products())->first(fn ($p) => $p['type'] === $type && $p['slug'] === $slug);
    }

    public static function findBySlug(string $slug): ?array
    {
        return collect(self::products())->firstWhere('slug', $slug);
    }

    /** Filters the catalogue from query parameters (server-side). */
    public static function filter(array $q): array
    {
        $sort = $q['sort'] ?? 'relevant';
        $items = collect(self::products())
            ->when(! empty($q['type']), fn ($c) => $c->whereIn('type', (array) $q['type']))
            ->when(! empty($q['need']), fn ($c) => $c->where('need', $q['need']))
            ->when(! empty($q['audience']), fn ($c) => $c->where('audience', $q['audience']))
            ->when(! empty($q['language']), fn ($c) => $c->filter(fn ($p) => array_intersect((array) $q['language'], $p['languages']) !== []))
            ->when(! empty($q['format']), fn ($c) => $c->filter(fn ($p) => array_intersect((array) $q['format'], $p['formats']) !== []))
            ->when(! empty($q['price']), function ($c) use ($q) {
                [$min, $max] = match ($q['price']) {
                    'under-1000' => [0, 999],
                    '1000-2500' => [1000, 2500],
                    '2500-5000' => [2501, 5000],
                    default => [5001, PHP_INT_MAX],
                };

                return $c->filter(fn ($p) => $p['zar'] >= $min && $p['zar'] <= $max);
            })
            ->when(! empty($q['instant']), fn ($c) => $c->where('instant', true))
            ->when(! empty($q['search']), fn ($c) => $c->filter(fn ($p) => str_contains(strtolower($p['title'].' '.$p['body']), strtolower($q['search']))));

        $items = match ($sort) {
            'price-asc' => $items->sortBy('zar'),
            'price-desc' => $items->sortByDesc('zar'),
            'title' => $items->sortBy('title'),
            default => $items->sortByDesc('recommended'),
        };

        return $items->values()->all();
    }

    /* ======================================================================
       Calculators
       ====================================================================== */

    /** Input definitions and defaults per calculator. */
    public static function calculatorInputs(string $key): array
    {
        return match ($key) {
            'loan' => [
                ['key' => 'amount', 'label' => 'Loan Amount (ZAR)', 'default' => 1000000, 'step' => 1000],
                ['key' => 'rate', 'label' => 'Interest Rate (% p.a.)', 'default' => 12, 'step' => 0.25],
                ['key' => 'term', 'label' => 'Term (Months)', 'default' => 60, 'step' => 1],
            ],
            'break-even' => [
                ['key' => 'fixed_costs', 'label' => 'Fixed Costs per Month (ZAR)', 'default' => 120000, 'step' => 1000],
                ['key' => 'variable_cost', 'label' => 'Variable Cost per Unit (ZAR)', 'default' => 150, 'step' => 1],
                ['key' => 'price', 'label' => 'Selling Price per Unit (ZAR)', 'default' => 250, 'step' => 1],
                ['key' => 'expected_units', 'label' => 'Expected Units Sold per Month', 'default' => 1500, 'step' => 10],
            ],
            'cash-flow' => [
                ['key' => 'opening_cash', 'label' => 'Opening Cash Balance (ZAR)', 'default' => 250000, 'step' => 1000],
                ['key' => 'weekly_inflow', 'label' => 'Weekly Cash Inflows (ZAR)', 'default' => 80000, 'step' => 1000],
                ['key' => 'inflow_growth', 'label' => 'Weekly Inflow Growth (%)', 'default' => 1, 'step' => 0.5],
                ['key' => 'weekly_outflow', 'label' => 'Weekly Cash Outflows (ZAR)', 'default' => 90000, 'step' => 1000],
                ['key' => 'payroll_week', 'label' => 'Monthly Payroll Amount (ZAR, paid every 4th week)', 'default' => 60000, 'step' => 1000],
            ],
            'runway' => [
                ['key' => 'cash', 'label' => 'Cash in Bank (ZAR)', 'default' => 1500000, 'step' => 10000],
                ['key' => 'burn', 'label' => 'Monthly Operating Costs (ZAR)', 'default' => 220000, 'step' => 1000],
                ['key' => 'revenue', 'label' => 'Current Monthly Revenue (ZAR)', 'default' => 60000, 'step' => 1000],
                ['key' => 'growth', 'label' => 'Monthly Revenue Growth (%)', 'default' => 8, 'step' => 0.5],
            ],
            'working-capital' => [
                ['key' => 'cash', 'label' => 'Cash (ZAR)', 'default' => 400000, 'step' => 1000],
                ['key' => 'receivables', 'label' => 'Accounts Receivable (ZAR)', 'default' => 650000, 'step' => 1000],
                ['key' => 'inventory', 'label' => 'Inventory (ZAR)', 'default' => 350000, 'step' => 1000],
                ['key' => 'payables', 'label' => 'Accounts Payable (ZAR)', 'default' => 480000, 'step' => 1000],
                ['key' => 'short_debt', 'label' => 'Short-term Debt & Other Current Liabilities (ZAR)', 'default' => 220000, 'step' => 1000],
                ['key' => 'annual_revenue', 'label' => 'Annual Revenue (ZAR)', 'default' => 6000000, 'step' => 10000],
                ['key' => 'annual_cogs', 'label' => 'Annual Cost of Sales (ZAR)', 'default' => 3600000, 'step' => 10000],
            ],
            'payroll' => [
                ['key' => 'employees', 'label' => 'Number of Employees', 'default' => 12, 'step' => 1],
                ['key' => 'gross', 'label' => 'Average Monthly Gross Salary (ZAR)', 'default' => 25000, 'step' => 500],
                ['key' => 'benefits', 'label' => 'Employer Benefits (% of salary: pension, medical)', 'default' => 10, 'step' => 0.5],
                ['key' => 'bonus', 'label' => 'Annual Bonus (months of salary)', 'default' => 1, 'step' => 0.5],
            ],
            'valuation' => [
                ['key' => 'fcf', 'label' => 'Current Annual Free Cash Flow (ZAR)', 'default' => 2500000, 'step' => 10000],
                ['key' => 'growth', 'label' => 'Growth Rate Years 1-5 (%)', 'default' => 12, 'step' => 0.5],
                ['key' => 'discount', 'label' => 'Discount Rate / WACC (%)', 'default' => 18, 'step' => 0.5],
                ['key' => 'terminal', 'label' => 'Terminal Growth Rate (%)', 'default' => 5, 'step' => 0.5],
                ['key' => 'net_debt', 'label' => 'Net Debt (ZAR)', 'default' => 1500000, 'step' => 10000],
            ],
            'budget-variance' => [
                ['key' => 'revenue_budget', 'label' => 'Revenue — Budget', 'default' => 1200000, 'step' => 1000],
                ['key' => 'revenue_actual', 'label' => 'Revenue — Actual', 'default' => 1085000, 'step' => 1000],
                ['key' => 'cogs_budget', 'label' => 'Cost of Sales — Budget', 'default' => 540000, 'step' => 1000],
                ['key' => 'cogs_actual', 'label' => 'Cost of Sales — Actual', 'default' => 512000, 'step' => 1000],
                ['key' => 'salaries_budget', 'label' => 'Salaries — Budget', 'default' => 320000, 'step' => 1000],
                ['key' => 'salaries_actual', 'label' => 'Salaries — Actual', 'default' => 334000, 'step' => 1000],
                ['key' => 'marketing_budget', 'label' => 'Marketing — Budget', 'default' => 60000, 'step' => 1000],
                ['key' => 'marketing_actual', 'label' => 'Marketing — Actual', 'default' => 78000, 'step' => 1000],
                ['key' => 'overheads_budget', 'label' => 'Rent & Overheads — Budget', 'default' => 110000, 'step' => 1000],
                ['key' => 'overheads_actual', 'label' => 'Rent & Overheads — Actual', 'default' => 104500, 'step' => 1000],
            ],
            default => [],
        };
    }

    /** Merge user inputs (query string) with defaults, coercing to floats within sane bounds. */
    public static function inputsFor(string $key, array $given): array
    {
        $out = [];
        foreach (self::calculatorInputs($key) as $def) {
            $v = $given[$def['key']] ?? $def['default'];
            $out[$def['key']] = is_numeric($v) ? max(-1e12, min(1e12, (float) $v)) : (float) $def['default'];
        }

        return $out;
    }

    /**
     * @return array{summary: list<array{label: string, value: float|string, format: string}>, table?: array{columns: list<string>, rows: list<list<float|string>>}, chart?: list<array{label: string, value: float}>, notes?: list<string>}
     */
    public static function calculate(string $key, array $given, ?Carbon $start = null): array
    {
        $i = self::inputsFor($key, $given);
        $start ??= Carbon::create(2025, 1, 31);

        return match ($key) {
            'loan' => self::loan($i, $start),
            'break-even' => self::breakEven($i),
            'cash-flow' => self::cashFlow($i),
            'runway' => self::runway($i),
            'working-capital' => self::workingCapital($i),
            'payroll' => self::payroll($i),
            'valuation' => self::valuation($i),
            'budget-variance' => self::budgetVariance($i),
            default => ['summary' => []],
        };
    }

    private static function loan(array $i, Carbon $start): array
    {
        $principal = max(0, $i['amount']);
        $n = max(1, (int) round($i['term']));
        $r = max(0, $i['rate']) / 100 / 12;
        $payment = $r > 0 ? $principal * $r / (1 - (1 + $r) ** -$n) : $principal / $n;

        $balance = $principal;
        $rows = [];
        $chart = [];
        $totalInterest = 0;
        for ($k = 1; $k <= $n; $k++) {
            $interest = $balance * $r;
            $princ = min($payment - $interest, $balance);
            $closing = max(0, $balance - $princ);
            $totalInterest += $interest;
            $rows[] = [$k, $start->copy()->addMonthsNoOverflow($k - 1)->endOfMonth()->format('d M Y'), round($balance, 2), round($payment, 2), round($princ, 2), round($interest, 2), round($closing, 2)];
            if ($k === 1 || $k % max(1, intdiv($n, 12)) === 0 || $k === $n) {
                $chart[] = ['label' => "M{$k}", 'value' => round($closing, 2)];
            }
            $balance = $closing;
        }

        return [
            'summary' => [
                ['label' => 'Monthly Payment', 'value' => round($payment, 2), 'format' => 'money'],
                ['label' => 'Total Interest', 'value' => round($totalInterest, 2), 'format' => 'money'],
                ['label' => 'Total Repayment', 'value' => round($payment * $n, 2), 'format' => 'money'],
                ['label' => 'Interest as % of Loan', 'value' => $principal > 0 ? round($totalInterest / $principal * 100, 1) : 0, 'format' => 'percent'],
            ],
            'table' => ['columns' => ['Payment #', 'Payment Date', 'Opening Balance', 'Payment', 'Principal', 'Interest', 'Closing Balance'], 'rows' => $rows],
            'chart' => $chart,
            'chart_label' => 'Outstanding balance over time',
        ];
    }

    private static function breakEven(array $i): array
    {
        $contribution = $i['price'] - $i['variable_cost'];
        $notes = [];
        if ($contribution <= 0) {
            $notes[] = 'Selling price does not cover the variable cost per unit, so the business cannot break even at this price.';
        }
        $units = $contribution > 0 ? ceil($i['fixed_costs'] / $contribution) : 0;
        $profit = $contribution * $i['expected_units'] - $i['fixed_costs'];
        $safety = $i['expected_units'] > 0 && $units > 0 ? ($i['expected_units'] - $units) / $i['expected_units'] * 100 : 0;

        $chart = [];
        $maxUnits = max($i['expected_units'], $units) * 1.4 ?: 100;
        for ($s = 0; $s <= 6; $s++) {
            $u = round($maxUnits * $s / 6);
            $chart[] = ['label' => (string) $u, 'value' => round($contribution * $u - $i['fixed_costs'], 2)];
        }

        return [
            'summary' => [
                ['label' => 'Contribution per Unit', 'value' => round($contribution, 2), 'format' => 'money'],
                ['label' => 'Contribution Margin', 'value' => $i['price'] > 0 ? round($contribution / $i['price'] * 100, 1) : 0, 'format' => 'percent'],
                ['label' => 'Break-Even Units / Month', 'value' => $units, 'format' => 'number'],
                ['label' => 'Break-Even Revenue / Month', 'value' => round($units * $i['price'], 2), 'format' => 'money'],
                ['label' => 'Profit at Expected Volume', 'value' => round($profit, 2), 'format' => 'money'],
                ['label' => 'Margin of Safety', 'value' => round($safety, 1), 'format' => 'percent'],
            ],
            'chart' => $chart,
            'chart_label' => 'Monthly profit by units sold',
            'notes' => $notes,
        ];
    }

    private static function cashFlow(array $i): array
    {
        $balance = $i['opening_cash'];
        $rows = [];
        $chart = [];
        $lowest = $balance;
        $lowestWeek = 0;
        $negativeWeek = null;
        for ($w = 1; $w <= 13; $w++) {
            $inflow = $i['weekly_inflow'] * (1 + $i['inflow_growth'] / 100) ** ($w - 1);
            $outflow = $i['weekly_outflow'] + ($w % 4 === 0 ? $i['payroll_week'] : 0);
            $opening = $balance;
            $balance = $opening + $inflow - $outflow;
            if ($balance < $lowest) {
                $lowest = $balance;
                $lowestWeek = $w;
            }
            if ($balance < 0 && $negativeWeek === null) {
                $negativeWeek = $w;
            }
            $rows[] = ["Week {$w}", round($opening, 2), round($inflow, 2), round($outflow, 2), round($inflow - $outflow, 2), round($balance, 2)];
            $chart[] = ['label' => "W{$w}", 'value' => round($balance, 2)];
        }

        return [
            'summary' => [
                ['label' => 'Closing Cash (Week 13)', 'value' => round($balance, 2), 'format' => 'money'],
                ['label' => 'Lowest Balance', 'value' => round($lowest, 2), 'format' => 'money'],
                ['label' => 'Lowest Balance Week', 'value' => $lowestWeek ? "Week {$lowestWeek}" : 'Opening', 'format' => 'text'],
                ['label' => 'Cash Shortfall Risk', 'value' => $negativeWeek ? "Negative from Week {$negativeWeek}" : 'No shortfall forecast', 'format' => 'text'],
            ],
            'table' => ['columns' => ['Week', 'Opening', 'Inflows', 'Outflows', 'Net Flow', 'Closing'], 'rows' => $rows],
            'chart' => $chart,
            'chart_label' => 'Closing cash balance by week',
        ];
    }

    private static function runway(array $i): array
    {
        $cash = $i['cash'];
        $revenue = $i['revenue'];
        $months = 0;
        $chart = [['label' => 'M0', 'value' => round($cash, 2)]];
        $breakEvenMonth = null;
        while ($cash > 0 && $months < 120) {
            $months++;
            $net = $revenue - $i['burn'];
            if ($net >= 0 && $breakEvenMonth === null) {
                $breakEvenMonth = $months;
            }
            $cash += $net;
            $revenue *= 1 + $i['growth'] / 100;
            if ($months <= 36) {
                $chart[] = ['label' => "M{$months}", 'value' => round($cash, 2)];
            }
            if ($breakEvenMonth !== null) {
                break;
            }
        }
        $simpleRunway = ($i['burn'] - $i['revenue']) > 0 ? $i['cash'] / ($i['burn'] - $i['revenue']) : null;

        return [
            'summary' => [
                ['label' => 'Net Monthly Burn (today)', 'value' => round(max(0, $i['burn'] - $i['revenue']), 2), 'format' => 'money'],
                ['label' => 'Runway at Current Burn', 'value' => $simpleRunway === null ? 'Cash-flow positive' : round($simpleRunway, 1).' months', 'format' => 'text'],
                ['label' => 'Runway with Revenue Growth', 'value' => $breakEvenMonth ? "Break-even in month {$breakEvenMonth}" : "{$months} months", 'format' => 'text'],
                ['label' => 'Cash-out Date', 'value' => $breakEvenMonth ? 'Not reached' : today()->addMonths($months)->format('M Y'), 'format' => 'text'],
            ],
            'chart' => $chart,
            'chart_label' => 'Projected cash balance by month',
        ];
    }

    private static function workingCapital(array $i): array
    {
        $ca = $i['cash'] + $i['receivables'] + $i['inventory'];
        $cl = $i['payables'] + $i['short_debt'];
        $dso = $i['annual_revenue'] > 0 ? $i['receivables'] / $i['annual_revenue'] * 365 : 0;
        $dio = $i['annual_cogs'] > 0 ? $i['inventory'] / $i['annual_cogs'] * 365 : 0;
        $dpo = $i['annual_cogs'] > 0 ? $i['payables'] / $i['annual_cogs'] * 365 : 0;
        $current = $cl > 0 ? $ca / $cl : 0;
        $health = match (true) {
            $current >= 1.5 => 'Healthy',
            $current >= 1.0 => 'Adequate — monitor closely',
            default => 'At risk — liabilities exceed current assets',
        };

        return [
            'summary' => [
                ['label' => 'Net Working Capital', 'value' => round($ca - $cl, 2), 'format' => 'money'],
                ['label' => 'Current Ratio', 'value' => round($current, 2), 'format' => 'ratio'],
                ['label' => 'Quick Ratio', 'value' => $cl > 0 ? round(($ca - $i['inventory']) / $cl, 2) : 0, 'format' => 'ratio'],
                ['label' => 'Cash Conversion Cycle', 'value' => round($dso + $dio - $dpo, 1).' days', 'format' => 'text'],
                ['label' => 'Working Capital Health', 'value' => $health, 'format' => 'text'],
            ],
            'table' => ['columns' => ['Metric', 'Days'], 'rows' => [
                ['Days Sales Outstanding (DSO)', round($dso, 1)],
                ['Days Inventory Outstanding (DIO)', round($dio, 1)],
                ['Days Payables Outstanding (DPO)', round($dpo, 1)],
            ]],
        ];
    }

    private static function payroll(array $i): array
    {
        $n = max(0, (int) round($i['employees']));
        $grossMonthly = $n * $i['gross'];
        $uifPerEmployee = min($i['gross'], 17712) * 0.01;   // employer UIF 1%, ceiling R17 712
        $uif = $uifPerEmployee * $n;
        $annualPayroll = $grossMonthly * 12 + $grossMonthly * $i['bonus'];
        $sdl = $annualPayroll > 500000 ? $grossMonthly * 0.01 : 0;  // SDL 1% where annual payroll exceeds R500 000
        $benefits = $grossMonthly * $i['benefits'] / 100;
        $monthly = $grossMonthly + $uif + $sdl + $benefits;
        $bonusCost = $grossMonthly * $i['bonus'];
        $annual = $monthly * 12 + $bonusCost;

        return [
            'summary' => [
                ['label' => 'Total Monthly Employer Cost', 'value' => round($monthly, 2), 'format' => 'money'],
                ['label' => 'Total Annual Employer Cost', 'value' => round($annual, 2), 'format' => 'money'],
                ['label' => 'Cost per Employee / Month', 'value' => $n > 0 ? round($monthly / $n, 2) : 0, 'format' => 'money'],
                ['label' => 'On-cost above Gross Salary', 'value' => $grossMonthly > 0 ? round(($monthly - $grossMonthly) / $grossMonthly * 100, 1) : 0, 'format' => 'percent'],
            ],
            'table' => ['columns' => ['Component', 'Monthly (ZAR)', 'Annual (ZAR)'], 'rows' => [
                ['Gross salaries', round($grossMonthly, 2), round($grossMonthly * 12, 2)],
                ['Employer UIF (1%)', round($uif, 2), round($uif * 12, 2)],
                ['Skills Development Levy (1%)', round($sdl, 2), round($sdl * 12, 2)],
                ['Employer benefits', round($benefits, 2), round($benefits * 12, 2)],
                ['Annual bonus provision', round($bonusCost / 12, 2), round($bonusCost, 2)],
            ]],
            'notes' => ['UIF uses the R17 712 monthly remuneration ceiling. SDL applies only where annual payroll exceeds R500 000. Confirm current statutory rates with SARS.'],
        ];
    }

    public static function dcf(float $fcf, float $g, float $r, float $tg, float $netDebt): ?array
    {
        if ($r <= $tg) {
            return null;
        }
        $pv = 0;
        $cf = $fcf;
        for ($y = 1; $y <= 5; $y++) {
            $cf *= 1 + $g;
            $pv += $cf / (1 + $r) ** $y;
        }
        $terminal = $cf * (1 + $tg) / ($r - $tg);
        $pvTerminal = $terminal / (1 + $r) ** 5;
        $ev = $pv + $pvTerminal;

        return ['ev' => $ev, 'equity' => $ev - $netDebt, 'pv_cf' => $pv, 'pv_terminal' => $pvTerminal];
    }

    private static function valuation(array $i): array
    {
        $base = self::dcf($i['fcf'], $i['growth'] / 100, $i['discount'] / 100, $i['terminal'] / 100, $i['net_debt']);
        if ($base === null) {
            return ['summary' => [['label' => 'Valuation', 'value' => 'Discount rate must exceed terminal growth', 'format' => 'text']]];
        }

        $rows = [];
        foreach ([-2, -1, 0, 1, 2] as $dr) {
            $row = [number_format($i['discount'] + $dr, 1).'%'];
            foreach ([-4, -2, 0, 2, 4] as $dg) {
                $v = self::dcf($i['fcf'], ($i['growth'] + $dg) / 100, ($i['discount'] + $dr) / 100, $i['terminal'] / 100, $i['net_debt']);
                $row[] = $v ? round($v['equity'], 0) : 'n/a';
            }
            $rows[] = $row;
        }
        $cols = ['Discount rate \\ Growth'];
        foreach ([-4, -2, 0, 2, 4] as $dg) {
            $cols[] = number_format($i['growth'] + $dg, 1).'%';
        }

        return [
            'summary' => [
                ['label' => 'Enterprise Value', 'value' => round($base['ev'], 0), 'format' => 'money'],
                ['label' => 'Equity Value', 'value' => round($base['equity'], 0), 'format' => 'money'],
                ['label' => 'PV of 5-Year Cash Flows', 'value' => round($base['pv_cf'], 0), 'format' => 'money'],
                ['label' => 'Terminal Value Share', 'value' => round($base['pv_terminal'] / $base['ev'] * 100, 1), 'format' => 'percent'],
            ],
            'table' => ['columns' => $cols, 'rows' => $rows],
            'notes' => ['Sensitivity grid shows equity value for discount rates ±2% and growth rates ±4% around your base case.'],
        ];
    }

    private static function budgetVariance(array $i): array
    {
        $lines = ['revenue' => 'Revenue', 'cogs' => 'Cost of Sales', 'salaries' => 'Salaries', 'marketing' => 'Marketing', 'overheads' => 'Rent & Overheads'];
        $rows = [];
        $chart = [];
        $profitBudget = 0;
        $profitActual = 0;
        $worst = null;
        foreach ($lines as $k => $label) {
            $b = $i["{$k}_budget"];
            $a = $i["{$k}_actual"];
            $variance = $a - $b;
            $isIncome = $k === 'revenue';
            $favourable = $isIncome ? $variance >= 0 : $variance <= 0;
            $pct = $b != 0 ? $variance / $b * 100 : 0;
            $rows[] = [$label, round($b, 2), round($a, 2), round($variance, 2), round($pct, 1).'%', $favourable ? 'Favourable' : 'Unfavourable'];
            $chart[] = ['label' => $label, 'value' => round($pct, 1)];
            $profitBudget += $isIncome ? $b : -$b;
            $profitActual += $isIncome ? $a : -$a;
            $impact = $isIncome ? $variance : -$variance;
            if ($worst === null || $impact < $worst['impact']) {
                $worst = ['label' => $label, 'impact' => $impact];
            }
        }

        return [
            'summary' => [
                ['label' => 'Budgeted Profit', 'value' => round($profitBudget, 2), 'format' => 'money'],
                ['label' => 'Actual Profit', 'value' => round($profitActual, 2), 'format' => 'money'],
                ['label' => 'Profit Variance', 'value' => round($profitActual - $profitBudget, 2), 'format' => 'money'],
                ['label' => 'Largest Adverse Driver', 'value' => $worst && $worst['impact'] < 0 ? $worst['label'] : 'None', 'format' => 'text'],
            ],
            'table' => ['columns' => ['Line', 'Budget', 'Actual', 'Variance', 'Variance %', 'Assessment'], 'rows' => $rows],
            'chart' => $chart,
            'chart_label' => 'Variance % by line',
        ];
    }

    /** CSV content for a purchased product's secure download. */
    public static function downloadContent(array $product): array
    {
        $lines = [
            ['The Business Clinic.Africa — '.$product['title']],
            ['Version', $product['version'], 'Human Reviewed', 'Version Controlled'],
            [],
        ];

        if ($product['calculator']) {
            $calc = self::calculate($product['calculator'], []);
            $lines[] = ['INPUTS (edit in your spreadsheet)'];
            foreach (self::calculatorInputs($product['calculator']) as $def) {
                $lines[] = [$def['label'], $def['default']];
            }
            $lines[] = [];
            $lines[] = ['RESULTS'];
            foreach ($calc['summary'] as $s) {
                $lines[] = [$s['label'], $s['value']];
            }
            if (! empty($calc['table'])) {
                $lines[] = [];
                $lines[] = $calc['table']['columns'];
                foreach ($calc['table']['rows'] as $row) {
                    $lines[] = $row;
                }
            }
        } else {
            $lines[] = [$product['body']];
            $lines[] = ['Audience', $product['audience']];
            $lines[] = ['Business need', $product['need']];
        }

        $lines[] = [];
        $lines[] = ['TBCA digital products support planning, analysis and implementation. They do not replace legal, tax, accounting, investment or other regulated professional advice.'];

        $csv = collect($lines)->map(fn ($row) => collect($row)->map(fn ($c) => '"'.str_replace('"', '""', (string) $c).'"')->implode(','))->implode("\r\n");

        return ['filename' => $product['slug'].'.csv', 'content' => $csv];
    }
}
