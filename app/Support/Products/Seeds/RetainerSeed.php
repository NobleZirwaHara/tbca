<?php

namespace App\Support\Products\Seeds;

use App\Models\Products\Retainers\Alert;
use App\Models\Products\Retainers\Allocation;
use App\Models\Products\Retainers\CapacityPool;
use App\Models\Products\Retainers\Commitment;
use App\Models\Products\Retainers\Overage;
use App\Models\Products\Retainers\Period;
use App\Models\Products\Retainers\Retainer;
use App\Models\Products\Retainers\Rollover;
use App\Models\Products\Retainers\Scenario;
use App\Models\Products\Retainers\ScopeChange;
use App\Models\Products\Retainers\Service;
use App\Models\Products\Retainers\Substitution;
use App\Models\Products\Retainers\Usage;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Idempotent Retainers demo data taken from the mockups: capacity pools, the
 * retainer service catalogue, the demo client's two active Retainers (with a
 * full year of periods and usage) and the cross-client book used by the
 * governance consoles.
 */
class RetainerSeed
{
    protected Carbon $periodStart;

    public function run(): void
    {
        // Current service period started 12 days ago (19 days remaining, as in the mockups).
        $this->periodStart = today()->subDays(12);

        $pools = $this->pools();
        $services = $this->services($pools);
        $this->demoClient($services);
        $this->book($services);
    }

    /** @return array<string, CapacityPool> */
    protected function pools(): array
    {
        $rows = [
            'POOL-STRAT' => ['Strategy & Advisory Partners', 'Strategy & Growth', 'Senior Partner (15+ years)', 640, 60, 30, 15],
            'POOL-PROC' => ['Procurement Leads', 'Procurement & Supply Chain', 'Senior Manager (10+ years)', 220, 20, 10, 5],
            'POOL-DD' => ['Due Diligence Analysts', 'Due Diligence & Screening', 'Manager (8+ years)', 260, 30, 12, 8],
            'POOL-PROJ' => ['Project Advisory Directors', 'Project Development', 'Director (12+ years)', 300, 40, 15, 10],
            'POOL-TECH' => ['Technology Advisers', 'Zoho, Automation & AI', 'Senior Consultant (8+ years)', 240, 30, 10, 5],
            'POOL-FIN' => ['Finance & Risk Advisers', 'Corporate Finance & Risk', 'Director (12+ years)', 320, 30, 15, 10],
            'POOL-PEOPLE' => ['People, ESG & Growth Advisers', 'HR, ESG & Marketing', 'Senior Manager (10+ years)', 220, 20, 10, 5],
            'POOL-LEGAL' => ['Legal & Regulatory Counsel', 'Legal & Compliance', 'Senior Counsel (12+ years)', 120, 20, 10, 5],
        ];

        $out = [];
        foreach ($rows as $code => [$name, $skill, $seniority, $units, $cross, $protective, $review]) {
            $out[$code] = CapacityPool::updateOrCreate(['code' => $code], [
                'name' => $name, 'skill' => $skill, 'seniority' => $seniority, 'productive_units' => $units,
                'cross_vehicle_units' => $cross, 'protective_reserve' => $protective, 'review_reserve' => $review,
                'data_effective_at' => now()->subDays(3),
            ]);
        }

        return $out;
    }

    /** @param array<string, CapacityPool> $pools @return array<string, Service> */
    protected function services(array $pools): array
    {
        $exec = ['Strategic guidance & advisory', 'Executive briefings', 'Board & committee support', 'KPI dashboards & performance reviews', 'Risk & opportunity reviews', 'Policy & process guidance'];
        $std = ['EX-RE-01', 'EX-RE-02', 'EX-RE-03', 'EX-RE-05', 'EX-RE-06', 'EX-RE-07', 'EX-RE-14'];
        $sipho = ['name' => 'Sipho Mthembu', 'title' => 'Senior Partner', 'practice' => 'Strategy & Growth', 'seniority' => 'Senior Partner (15+ years)'];

        // [slug, name, category, desk, icon, summary, price, usd, floor, hours, pool, popularity, extra]
        $rows = [
            ['executive-advisory', 'Executive Advisory Retainer', 'executive-advisory', 'executive', 'user-tie', 'Strategic guidance, decision support and executive oversight.', 75000, 4900, 70000, 20, 'POOL-STRAT', 98, ['checklist' => ['Strategy & Growth Advisory', 'Executive Briefings', 'KPI Dashboards', 'Quarterly Review Sessions'], 'description' => 'Senior strategic guidance and decision support for leadership teams.']],
            ['procurement-desk', 'Procurement Desk Retainer', 'procurement', 'procurement', 'cart', 'Procurement support, supplier management and cost optimisation.', 55000, 3600, 50000, 20, 'POOL-PROC', 80, ['checklist' => ['Procurement Planning', 'Supplier Management', 'Bid Support', 'Cost Optimisation'], 'inclusions' => ['Procurement planning', 'Supplier management', 'Bid and tender support', 'Cost optimisation reviews', 'Monthly procurement dashboard']]],
            ['due-diligence-desk', 'Due Diligence Desk Retainer', 'due-diligence', 'due-diligence', 'shield', 'Ongoing due diligence, screening and monitoring support.', 65000, 4200, 60000, 20, 'POOL-DD', 77, ['checklist' => ['Ongoing Screening', 'Monitoring & Alerts', 'Case Management', 'Report Dashboards'], 'inclusions' => ['Ongoing counterparty screening', 'Monitoring and alerts', 'Case management', 'Report dashboards']]],
            ['project-advisory-desk', 'Project Advisory Desk Retainer', 'project-advisory', 'project', 'chart', 'End-to-end project development and implementation support.', 95000, 6200, 88000, 24, 'POOL-PROJ', 74, ['checklist' => ['Project Oversight', 'Risk & Issue Management', 'Stakeholder Reporting', 'Milestone Tracking'], 'inclusions' => ['Project oversight', 'Risk and issue management', 'Stakeholder reporting', 'Milestone tracking']]],
            ['technology-desk', 'Technology Desk Retainer', 'technology', 'technology', 'cloud', 'Technology strategy, automation and system optimisation.', 60000, 3900, 55000, 20, 'POOL-TECH', 71, ['checklist' => ['Zoho & Automation', 'Risk Integrations', 'AI & RPA Support', 'Licensing & Users'], 'inclusions' => ['Zoho and automation support', 'Risk integrations', 'AI and RPA support', 'Licensing and user administration']]],
            ['custom-retainer', 'Custom Retainer', 'executive-advisory', 'custom', 'sliders', 'Tailored retainer combining multiple services.', 0, null, 0, 20, 'POOL-STRAT', 60, ['custom_pricing' => true, 'checklist' => ['Multi-Disciplinary Support', 'Custom Deliverables', 'Dedicated Team', 'Flexible Scope'], 'owner_model' => 'TEAM']],
            ['executive-strategy-retainer', 'Executive Strategy Retainer', 'executive-advisory', null, 'compass', 'High-level strategic guidance, market insight and executive decision support.', 125000, 6900, 80000, 40, 'POOL-STRAT', 95, []],
            ['board-advisory-retainer', 'Board Advisory Retainer', 'executive-advisory', null, 'users', 'Ongoing board support, governance advice and strategic oversight.', 110000, 6100, 100000, 30, 'POOL-STRAT', 90, []],
            ['leadership-advisory-retainer', 'Leadership Advisory Retainer', 'executive-advisory', null, 'user', 'Executive coaching, leadership development and performance support.', 95000, 5300, 85000, 30, 'POOL-STRAT', 85, []],
            ['ma-advisory-retainer', 'M&A Advisory Retainer', 'executive-advisory', null, 'building', 'Transaction advisory, deal evaluation and ongoing M&A support.', 150000, 8300, 135000, 40, 'POOL-FIN', 83, []],
            ['risk-management-retainer', 'Risk Management Retainer', 'executive-advisory', null, 'shield', 'Enterprise risk oversight, risk frameworks and mitigation support.', 105000, 5800, 90000, 30, 'POOL-FIN', 82, []],
            ['performance-kpi-retainer', 'Performance & KPI Retainer', 'executive-advisory', null, 'chart', 'KPI framework design, performance dashboards and review support.', 90000, 5000, 80000, 30, 'POOL-STRAT', 79, []],
            ['executive-mentorship-retainer', 'Executive Mentorship Retainer', 'executive-advisory', null, 'user', 'One-on-one mentorship and strategic sounding for leaders.', 85000, 4700, 76000, 20, 'POOL-STRAT', 70, []],
            ['supplier-management-retainer', 'Supplier Management Retainer', 'procurement', null, 'truck', 'Supplier performance reviews, contract hygiene and renewal planning.', 48000, 2700, 44000, 16, 'POOL-PROC', 52, []],
            ['ongoing-screening-retainer', 'Ongoing Screening Retainer', 'due-diligence', null, 'search', 'Continuous screening of counterparties, directors and suppliers.', 40000, 2200, 36000, 16, 'POOL-DD', 50, []],
            ['pmo-retainer', 'PMO Support Retainer', 'project-advisory', null, 'kanban', 'Programme office cadence, reporting packs and governance support.', 70000, 3900, 64000, 24, 'POOL-PROJ', 49, []],
            ['zoho-managed-retainer', 'Zoho Managed Retainer', 'technology', null, 'settings', 'Managed Zoho administration, automation changes and user support.', 35000, 1900, 32000, 16, 'POOL-TECH', 58, []],
            ['compliance-monitoring-retainer', 'Compliance Monitoring Retainer', 'regulatory', null, 'clipboard', 'Regulatory change monitoring, compliance calendars and board reporting.', 45000, 2500, 42000, 16, 'POOL-LEGAL', 47, ['certification' => 'draft']],
            ['fractional-cfo-retainer', 'Fractional CFO Retainer', 'financial', null, 'calculator', 'Senior finance leadership: reporting, forecasting and funding readiness.', 85000, 4700, 76000, 24, 'POOL-FIN', 88, []],
            ['commercial-advisory-retainer', 'Commercial Advisory Retainer', 'financial', null, 'handshake', 'Pricing, commercial terms and growth-deal support.', 60000, 3300, 50000, 20, 'POOL-FIN', 63, []],
            ['esg-reporting-retainer', 'ESG Reporting Retainer', 'esg', null, 'leaf', 'ESG data, disclosures and sustainability reporting support.', 50000, 2800, 46000, 16, 'POOL-PEOPLE', 45, []],
            ['legal-counsel-retainer', 'Legal Counsel Retainer', 'legal', null, 'scale', 'Commercial legal guidance within the professional boundary.', 80000, 4400, 90000, 16, 'POOL-LEGAL', 61, []],
            ['hr-director-retainer', 'HR Director Retainer', 'people', null, 'users', 'Fractional HR leadership: policy, performance and organisational design.', 65000, 3600, 58000, 20, 'POOL-PEOPLE', 55, []],
            ['growth-marketing-retainer', 'Growth Marketing Retainer', 'marketing', null, 'megaphone', 'Go-to-market planning, campaign reviews and growth analytics.', 40000, 2200, 36000, 16, 'POOL-PEOPLE', 44, []],
            ['data-analytics-retainer', 'Data & Analytics Retainer', 'data', null, 'database', 'Dashboards, data quality reviews and management information.', 55000, 3000, 50000, 20, 'POOL-TECH', 53, []],
        ];

        $out = [];
        foreach ($rows as $i => [$slug, $name, $category, $desk, $icon, $summary, $price, $usd, $floor, $hours, $pool, $pop, $extra]) {
            $out[$slug] = Service::updateOrCreate(['slug' => $slug], [
                'code' => 'RSV-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'name' => $name,
                'category' => $category,
                'desk' => $desk,
                'icon' => $icon,
                'summary' => $summary,
                'description' => $extra['description'] ?? $summary,
                'price_zar' => $price,
                'price_usd' => $usd,
                'floor_zar' => $floor,
                'allowance_qty' => $hours,
                'allowance_unit' => 'HOUR',
                'period' => 'monthly',
                'unit_definition' => 'Adviser time for strategic guidance, reviews, advisory and decision support.',
                'owner_model' => $extra['owner_model'] ?? 'NAMED_PERSON',
                'owner' => $sipho,
                'sla_class' => 'Standard',
                'response_window' => '1 Business Day',
                'inclusions' => $extra['inclusions'] ?? $exec,
                'exclusions' => $std,
                'checklist' => $extra['checklist'] ?? null,
                'unused_rule' => 'CAPPED_ROLL_FORWARD',
                'rollover_cap_pct' => 25,
                'overage_rule' => 'PREAPPROVED_RATE',
                'overage_rate_zar' => 4500,
                'min_term_months' => 6,
                'notice_days' => 30,
                'certification' => $extra['certification'] ?? 'certified',
                'pool_id' => $pools[$pool]->id,
                'popularity' => $pop,
                'custom_pricing' => $extra['custom_pricing'] ?? false,
            ]);
        }

        return $out;
    }

    protected function periodBounds(int $offset): array
    {
        $start = $this->periodStart->copy()->addMonths($offset);

        return [$start, $start->copy()->addMonth()->subDay()];
    }

    protected function period(Retainer $r, int $offset, string $status, float $opening, float $carry = 0): Period
    {
        [$start, $end] = $this->periodBounds($offset);

        return Period::updateOrCreate(['retainer_id' => $r->id, 'starts_on' => $start->toDateString()], [
            'ends_on' => $end->toDateString(),
            'opening_units' => $opening,
            'carry_units' => $carry,
            'status' => $status,
            'utilisation_evaluated' => $status === 'closed',
            'closed_at' => $status === 'closed' ? $end->copy()->addDay() : null,
            'statement_ack_at' => $status === 'closed' && $offset < -1 ? $end->copy()->addDays(3) : null,
        ]);
    }

    protected function usage(Retainer $r, Period $p, string $ref, Carbon $at, string $activity, string $adviser, float $units, array $extra = []): void
    {
        Usage::updateOrCreate(['reference' => $ref], [
            'retainer_id' => $r->id,
            'period_id' => $p->id,
            'occurred_at' => $at,
            'activity' => $activity,
            'description' => $extra['description'] ?? null,
            'category' => $extra['category'] ?? 'Strategic Advisory',
            'adviser' => $adviser,
            'units' => $units,
            'billing_effect' => $extra['effect'] ?? 'INCLUDED',
            'status' => $extra['status'] ?? 'confirmed',
            'evidence_class' => $extra['evidence'] ?? 'E2',
        ]);
    }

    /** @param array<string, Service> $services */
    protected function demoClient(array $services): void
    {
        $user = User::where('email', 'amahle@agritechsa.co.za')->first();
        if (! $user) {
            return;
        }
        $client = $user->company ?: 'AgriTech SA (Pty) Ltd';
        $start = $this->periodStart;

        $r1 = Retainer::updateOrCreate(['code' => 'RET-2026-0001'], [
            'agreement_ref' => 'TBCA-AGR-2026-0813-0001',
            'user_id' => $user->id,
            'service_id' => $services['executive-strategy-retainer']->id,
            'name' => 'Executive Strategy Retainer',
            'client_name' => $client,
            'retainer_type' => 'Monthly Retainer',
            'status' => 'active',
            'allowance_qty' => 20,
            'monthly_fee_zar' => 45000,
            'floor_zar' => 40000,
            'overage_rate_zar' => 4500,
            'rollover_cap_pct' => 25,
            'service_level' => '1 Business Day response',
            'owner_model' => 'NAMED_PERSON',
            'named_person_material' => true,
            'adviser' => ['name' => 'John Mokoena CA(SA)', 'title' => 'Director: Strategy & Advisory', 'since' => '2024-01-01'],
            'account_owner' => ['name' => 'J. Mokoena', 'role' => 'Account Director', 'email' => 'jmokoena@tbca.africa', 'phone' => '+27 11 100 2000', 'since' => $start->copy()->subMonths(2)->toDateString(), 'delegation' => ['scope' => 'Full', 'overage' => true, 'scope_change' => true, 'substitution' => true, 'by' => 'T. Dlamini', 'on' => $start->copy()->subMonths(2)->toDateString()]],
            'min_term_months' => 6,
            'notice_days' => 30,
            'start_date' => $start->copy()->subMonths(11),
            'term_end' => $start->copy()->addMonths(7)->subDay(),
            'signatory' => ['name' => $user->name, 'position' => 'Chief Executive Officer', 'email' => $user->email],
            'signed_at' => $start->copy()->subMonths(11)->subDays(5),
            'activated_at' => $start->copy()->subMonths(11),
            'allocation_notes' => "Client prefers continuity of lead advisor.\nS. Naidoo to lead all strategic deliverables.\nHigh workload expected next week.",
            'period_revenue_zar' => 450000,
            'period_cost_zar' => 186000,
            'renewal' => null,
            'cancel_effective' => null,
        ]);

        // Twelve months of history: eleven closed periods, then the current open period.
        $history = [16.0, 13.4, 17.8, 18.9, 15.6, 12.1, 11.6, 12.8, 13.8, 15.2];
        $activities = [['Strategy session', 'J. Mokoena', 'Strategic Advisory'], ['Project support review', 'S. Naidoo', 'Project Support'], ['Research & analysis', 'T. Dlamini', 'Research & Analysis'], ['Monthly review meeting', 'J. Mokoena', 'Meetings & Reviews']];
        foreach ($history as $i => $used) {
            $offset = $i - 11;
            $p = $this->period($r1, $offset, 'closed', 20);
            $split = [0.46, 0.27, 0.17, 0.10];
            foreach ($activities as $j => [$act, $who, $cat]) {
                $this->usage($r1, $p, sprintf('USG-H%02d-%d-0001', $i, $j), $p->starts_on->copy()->addDays(3 + $j * 6)->setTime(10, 0), $act, $who, round($used * $split[$j], 2), ['category' => $cat]);
            }
        }

        // Last closed period = the Period Statement mockup: allowance exhausted, then a pre-authorised 1.4h overage.
        $last = $this->period($r1, -1, 'closed', 20);
        $stmt = [
            [1, 'Strategic Advisory', 'Board strategy session', 'J. Mokoena', 2.0], [5, 'Financial Modelling', 'Scenario modelling and review', 'S. Naidoo', 3.0],
            [8, 'Investor Preparation', 'Investor deck review', 'J. Mokoena', 2.5], [12, 'Business Mentoring', '1:1 mentoring session', 'S. Naidoo', 1.5],
            [16, 'Due Diligence Review', 'Commercial due diligence', 'T. Dlamini', 2.4], [19, 'Risk Advisory', 'Risk assessment review', 'T. Dlamini', 1.6],
            [21, 'Board Pack Review', 'Quarterly board pack review', 'J. Mokoena', 3.5], [24, 'Stakeholder Interviews', 'Stakeholder interviews and synthesis', 'S. Naidoo', 3.5],
        ];
        foreach ($stmt as $k => [$day, $act, $desc, $who, $h]) {
            $this->usage($r1, $last, sprintf('USG-S01-%03d', $k + 1), $last->starts_on->copy()->addDays($day)->setTime(9, 30), $act, $who, $h, ['description' => $desc, 'category' => $act]);
        }
        $this->usage($r1, $last, 'USG-S01-009', $last->starts_on->copy()->addDays(27)->setTime(9, 0), 'Strategy Workshop', 'J. Mokoena', 1.4, ['description' => 'Strategy workshop facilitation', 'effect' => 'OVERAGE_APPROVED', 'category' => 'Strategy Workshop']);
        Overage::updateOrCreate(['reference' => 'TBCA-OVR-2026-HIST01'], ['retainer_id' => $r1->id, 'scope' => 'Strategy workshop facilitation beyond included allowance', 'lines' => [['date' => $last->starts_on->copy()->addDays(27)->toDateString(), 'description' => 'Strategy workshop facilitation', 'role' => 'Named Advisor', 'hours' => 1.4]], 'units' => 1.4, 'rate_zar' => 4500, 'max_charge_zar' => 7245, 'status' => 'cap_reached', 'authorised_units' => 1.4, 'authorised_limit_zar' => 7245, 'authorised_by' => $user->name, 'expires_at' => $last->ends_on, 'authorised_at' => $last->starts_on->copy()->addDays(26)]);

        foreach ([['HIST02', 4.2, -2], ['HIST03', 3.6, -3], ['HIST04', 2.1, -4]] as [$ref, $h, $off]) {
            [$ps] = $this->periodBounds($off);
            $amt = (int) round($h * 4500);
            Overage::updateOrCreate(['reference' => "TBCA-OVR-2026-{$ref}"], ['retainer_id' => $r1->id, 'scope' => 'Additional advisory hours beyond allowance', 'lines' => [['date' => $ps->copy()->addDays(20)->toDateString(), 'description' => 'Additional advisory hours', 'role' => 'Named Advisor', 'hours' => $h]], 'units' => $h, 'rate_zar' => 4500, 'max_charge_zar' => $amt + (int) round($amt * 0.15), 'status' => 'cap_reached', 'authorised_units' => $h, 'authorised_limit_zar' => $amt + (int) round($amt * 0.15), 'authorised_by' => $user->name, 'expires_at' => $ps->copy()->addMonth(), 'authorised_at' => $ps->copy()->addDays(19), 'created_at' => $ps->copy()->addDays(18)]);
        }

        // Current period (Live Allowance Meter / Itemised Usage Ledger mockups): 14.0 of 20.0 hours.
        $cur = $this->period($r1, 0, 'open', 20);
        $lines = [
            [0, '14:40', 'Kick-off Meeting', 'Mike R.', 1.5], [2, '09:15', 'Ad-hoc Email Guidance', 'Sarah M.', 0.5], [4, '15:30', 'Data & Document Review', 'Mike R.', 2.5],
            [5, '11:05', 'Opportunity Assessment', 'James L.', 1.5], [7, '16:20', 'Investor Readiness Check', 'Sarah M.', 2.0], [10, '10:45', 'Policy & Regulatory Briefing', 'James L.', 2.5],
            [11, '14:10', 'Strategic Review & Feedback', 'Sarah M.', 2.0], [12, '09:32', 'Market Entry Advisory Call', 'Sarah M.', 1.5],
        ];
        foreach ($lines as $k => [$day, $time, $act, $who, $h]) {
            [$hh, $mm] = explode(':', $time);
            $this->usage($r1, $cur, sprintf('USG-C01-%03d', $k + 1), $cur->starts_on->copy()->addDays($day)->setTime((int) $hh, (int) $mm), $act, $who, $h, ['category' => $k % 3 === 0 ? 'Meetings & Reviews' : 'Strategic Advisory']);
        }

        // Overage request awaiting prior client authority (Overage Authorisation mockup).
        $ovLines = [
            ['date' => today()->addDays(2)->toDateString(), 'description' => 'Additional strategy session (outside scope)', 'role' => 'Named Advisor', 'hours' => 2.0],
            ['date' => today()->addDays(3)->toDateString(), 'description' => 'Extended analysis and follow-up', 'role' => 'Senior Consultant', 'hours' => 2.5],
            ['date' => today()->addDays(6)->toDateString(), 'description' => 'Out-of-scope document review', 'role' => 'Consultant', 'hours' => 1.9],
        ];
        Overage::updateOrCreate(['reference' => 'TBCA-OVR-2026-REQ001'], ['retainer_id' => $r1->id, 'scope' => 'Additional strategy work requested beyond the included allowance', 'lines' => $ovLines, 'units' => 6.4, 'rate_zar' => 4500, 'max_charge_zar' => 33120, 'status' => 'requested', 'authorised_units' => null, 'authorised_limit_zar' => null, 'authorised_by' => null, 'notes' => null, 'expires_at' => now()->addDays(14), 'authorised_at' => null]);

        // Substitution notice awaiting the client's decision.
        Substitution::updateOrCreate(['reference' => 'SUB-2026-0015'], [
            'retainer_id' => $r1->id,
            'current_adviser' => ['name' => 'John Mokoena CA(SA)', 'title' => 'Director: Strategy & Advisory', 'since' => '2024-01-01'],
            'proposed_adviser' => ['name' => 'Sarah Naidoo CA(SA)', 'title' => 'Director: Strategy & Advisory', 'experience' => '18+ years in strategy, corporate finance and business advisory.', 'qualifications' => 'CA(SA), MBA Registered with SAICA.', 'expertise' => 'Strategy development, financial modelling, M&A advisory, performance improvement.', 'clients' => 'Manufacturing, Infrastructure, Technology, Professional Services.', 'availability' => '40% capacity reserved for this retainer.'],
            'type' => 'Planned',
            'reason' => 'Availability',
            'reason_detail' => 'John Mokoena will be assuming a Group leadership role with limited client availability. Sarah Naidoo has the required expertise and will continue the strategy engagement.',
            'effective_from' => $cur->ends_on->copy()->addDay(),
            'risk' => 'Medium',
            'status' => 'awaiting_approval',
            'notice_sent_at' => now()->subDays(1),
        ]);

        // Scope change register (Scope-Creep Monitor mockup).
        $sc = [
            ['SC-2026-0007', 'Additional financial model scenarios', 'Additional Deliverable', 'Client', 0, 'High', 'under_review', 2.5],
            ['SC-2026-0006', 'Extra market research and benchmarking', 'Additional Activity', 'Adviser', 1, 'Medium', 'under_review', 1.5],
            ['SC-2026-0005', 'Client requested early board presentation', 'Schedule Change', 'Client', 2, 'Low', 'approved', 1.0],
            ['SC-2026-0004', 'Add ESG impact assessment', 'Additional Deliverable', 'Adviser', 4, 'Medium', 'approved', 2.0],
            ['SC-2026-0003', 'Regulatory compliance deep-dive', 'Additional Activity', 'Adviser', 6, 'High', 'rejected', 2.0],
            ['SC-2026-0002', 'New jurisdiction tax review', 'Out of Scope', 'Adviser', 8, 'High', 'rejected', 3.0],
            ['SC-2026-0001', 'Additional stakeholder interviews', 'Additional Activity', 'Client', 11, 'Low', 'approved', 1.0],
        ];
        foreach ($sc as [$ref, $summary, $type, $by, $ago, $risk, $status, $h]) {
            ScopeChange::updateOrCreate(['reference' => $ref], ['retainer_id' => $r1->id, 'change_type' => $type, 'summary' => $summary, 'raised_by' => $by, 'risk' => $risk, 'status' => $status, 'stage' => $status === 'under_review' ? 2 : 5, 'impact_hours' => $h, 'impact_zar' => (int) round($h * 7500), 'created_at' => now()->subDays($ago)]);
        }

        // Capacity commitments (Capacity Commitment Register mockup).
        $com = [
            ['COM-2026-0012', 'Deliverable', 'Strategic review and board paper', 'J. Mokoena', -3, 2, 5, 3.0, 'confirmed'],
            ['COM-2026-0011', 'Milestone', 'Q3 Performance review meeting', 'S. Naidoo', -5, 9, 9, 2.0, 'confirmed'],
            ['COM-2026-0010', 'Deliverable', 'Financial model deep dive', 'T. Dlamini', -6, 12, 14, 2.5, 'confirmed'],
            ['COM-2026-0009', 'Meeting', 'Risk & opportunity workshop', 'J. Mokoena', -1, 16, 16, 1.5, 'tentative'],
            ['COM-2026-0008', 'Deliverable', 'Investor presentation draft', 'S. Naidoo', -2, 23, 26, 3.0, 'tentative'],
            ['COM-2026-0007', 'Event', 'Board strategy offsite (full day)', 'J. Mokoena', -8, 30, 30, 4.0, 'on_hold'],
        ];
        foreach ($com as [$ref, $type, $desc, $owner, $c, $s, $e, $h, $status]) {
            Commitment::updateOrCreate(['reference' => $ref], ['retainer_id' => $r1->id, 'type' => $type, 'description' => $desc, 'owner' => $owner, 'committed_on' => today()->addDays($c), 'starts_on' => today()->addDays($s), 'ends_on' => today()->addDays($e), 'hours' => $h, 'status' => $status]);
        }

        // Advisor allocation (Allocation & Account Owner Console mockup).
        Allocation::where('retainer_id', $r1->id)->delete();
        foreach ([['J. Mokoena', 'Account Director', 30, 70, true, true, 'Good capacity'], ['S. Naidoo', 'Lead Advisor', 30, 85, false, true, 'High workload next week'], ['T. Dlamini', 'Technical Specialist', 20, 60, false, true, 'Good capacity'], ['P. Khumalo', 'Support Advisor', 20, 95, false, false, 'At capacity']] as [$name, $role, $pct, $load, $primary, $avail, $note]) {
            Allocation::create(['retainer_id' => $r1->id, 'adviser' => $name, 'role' => $role, 'allocation_pct' => $pct, 'workload_pct' => $load, 'is_primary' => $primary, 'available' => $avail, 'note' => $note]);
        }

        // Saved scenarios (Capacity Test Workbench mockup).
        foreach ([['Increase to 30h', 30, 67500, 1], ['Reduce to 15h', 15, 33750, 2]] as [$name, $h, $fee, $ago]) {
            Scenario::updateOrCreate(['retainer_id' => $r1->id, 'name' => $name], ['type' => 'Resize Allowance', 'allowance_qty' => $h, 'monthly_fee_zar' => $fee, 'starts_on' => $cur->ends_on->copy()->addDay(), 'result' => 'capacity_available', 'classification' => $h > 20 ? 'C2' : 'C3', 'detail' => ['forecast' => 14.2, 'utilisation' => round(14.2 / $h * 100, 1), 'label' => $h > 20 ? 'Comfortable' : 'Adequate'], 'run_by' => 'J. Mokoena', 'created_at' => now()->subDays($ago)]);
        }

        // Second Retainer: low utilisation (under-use review demo).
        $r2 = Retainer::updateOrCreate(['code' => 'RET-2026-0002'], [
            'agreement_ref' => 'TBCA-AGR-2026-0702-0002',
            'user_id' => $user->id,
            'service_id' => $services['commercial-advisory-retainer']->id,
            'name' => 'Commercial Advisory Retainer',
            'client_name' => $client,
            'status' => 'active',
            'allowance_qty' => 20,
            'monthly_fee_zar' => 52000,
            'floor_zar' => 50000,
            'overage_rate_zar' => 4500,
            'rollover_cap_pct' => 25,
            'owner_model' => 'DEFINED_ROLE',
            'named_person_material' => false,
            'adviser' => ['name' => 'S. Naidoo', 'title' => 'Lead Commercial Advisor', 'since' => $start->copy()->subMonths(3)->toDateString()],
            'account_owner' => ['name' => 'S. Naidoo', 'role' => 'Account Director', 'email' => 'snaidoo@tbca.africa', 'phone' => '+27 11 100 2001', 'since' => $start->copy()->subMonths(3)->toDateString(), 'delegation' => ['scope' => 'Standard', 'overage' => true, 'scope_change' => false, 'substitution' => false]],
            'start_date' => $start->copy()->subMonths(3),
            'term_end' => $start->copy()->addMonths(3)->subDay(),
            'signatory' => ['name' => $user->name, 'position' => 'Chief Executive Officer', 'email' => $user->email],
            'signed_at' => $start->copy()->subMonths(3)->subDays(4),
            'activated_at' => $start->copy()->subMonths(3),
            'period_revenue_zar' => 156000,
            'period_cost_zar' => 96000,
        ]);
        foreach ([[-3, 9.5], [-2, 8.0], [-1, 6.5]] as [$off, $used]) {
            $p = $this->period($r2, $off, 'closed', 20);
            $this->usage($r2, $p, sprintf('USG-R2-%d', abs($off)), $p->starts_on->copy()->addDays(9)->setTime(11, 0), 'Pricing and terms review', 'S. Naidoo', $used, ['category' => 'Commercial Advisory']);
        }
        $p2 = $this->period($r2, 0, 'open', 20);
        $this->usage($r2, $p2, 'USG-R2-C01', $p2->starts_on->copy()->addDays(2)->setTime(10, 0), 'Commercial terms call', 'S. Naidoo', 2.5, ['category' => 'Commercial Advisory']);
        $this->usage($r2, $p2, 'USG-R2-C02', $p2->starts_on->copy()->addDays(8)->setTime(15, 0), 'Pricing model review', 'S. Naidoo', 2.0, ['category' => 'Commercial Advisory']);
        Alert::updateOrCreate(['retainer_id' => $r2->id, 'status' => 'in_progress'], ['level' => 'at_risk', 'utilisation_pct' => 22.5, 'days_elapsed' => 12, 'notice_sent_at' => now()->subDay(), 'last_activity' => $p2->starts_on->copy()->addDays(8)]);
    }

    /** Cross-client book shown in the governance consoles. @param array<string, Service> $services */
    protected function book(array $services): void
    {
        // code, name, client, type, unit, service, fee, floor, used, revenue, cost, adviser
        $rows = [
            ['RET-2026-0003', 'Digital Transformation Review', 'BuildRight Construction (Pty) Ltd', 'Project Retainer', 'Advisory Services', 'project-advisory-desk', 82000, 80000, 9.8, 185000, 150000, 'P. Khumalo'],
            ['RET-2026-0004', 'Compliance Advisory Retainer', 'HealthCare Plus (Pty) Ltd', 'Monthly Retainer', 'Compliance & Risk', 'risk-management-retainer', 45000, 45000, 12.6, 380000, 226000, 'P. Khumalo'],
            ['RET-2026-0007', 'Strategic Advisory Retainer', 'UrbanEdge Holdings (Pty) Ltd', 'Monthly Retainer', 'Advisory Services', 'executive-strategy-retainer', 45000, 40000, 6.2, 255000, 128000, 'S. Naidoo'],
            ['RET-2026-0009', 'Board Advisory Support', 'Coastal Mining Services (Pty) Ltd', 'Monthly Retainer', 'Advisory Services', 'board-advisory-retainer', 55500, 60000, 11.2, 380000, 231000, 'J. Mokoena'],
            ['RET-2026-0011', 'Tax Strategy Quarterly', 'EduFuture (Pty) Ltd', 'Quarterly Retainer', 'Tax Advisory', 'fractional-cfo-retainer', 62000, 65000, 17.6, 250000, 175000, 'S. Naidoo'],
            ['RET-2026-0012', 'Operational Efficiency Review', 'TechNova Solutions (Pty) Ltd', 'Project Retainer', 'Advisory Services', 'pmo-retainer', 70000, 70000, 13.0, 300000, 222000, 'J. Mokoena'],
            ['RET-2026-0015', 'ESG Report Review', 'AgriGrowth (Pty) Ltd', 'Project Retainer', 'People & Culture', 'esg-reporting-retainer', 54000, 55000, 16.2, 295000, 198000, 'T. Dlamini'],
            ['RET-2026-0018', 'Strategic MIS Quarterly', 'Greenfield Logistics (Pty) Ltd', 'Quarterly Retainer', 'Financial Advisory', 'data-analytics-retainer', 42500, 50000, 4.8, 420000, 198500, 'T. Dlamini'],
            ['RET-2026-0019', 'Risk Advisory Retainer', 'TechNova Solutions (Pty) Ltd', 'Monthly Retainer', 'Compliance & Risk', 'risk-management-retainer', 65000, 60000, 4.4, 260000, 198000, 'J. Mokoena'],
            ['RET-2026-0020', 'Risk Management Review', 'Acme Infrastructure (Pty) Ltd', 'Quarterly Retainer', 'Compliance & Risk', 'risk-management-retainer', 78000, 75000, 16.4, 400000, 170000, 'J. Mokoena'],
            ['RET-2026-0021', 'People Strategy Review', 'BlueWave Retail (Pty) Ltd', 'Project Retainer', 'People & Culture', 'hr-director-retainer', 40000, 40000, 6.2, 165000, 146300, 'S. Naidoo'],
            ['RET-2026-0024', 'Financial Model Review', 'UrbanEdge Holdings (Pty) Ltd', 'Project Retainer', 'Financial Advisory', 'fractional-cfo-retainer', 71400, 75000, 14.0, 480000, 260000, 'S. Naidoo'],
            ['RET-2026-0026', 'Executive Advisory Retainer', 'Acme Infrastructure (Pty) Ltd', 'Monthly Retainer', 'Advisory Services', 'executive-advisory', 75000, 70000, 16.0, 450000, 186000, 'J. Mokoena'],
            ['RET-2026-0031', 'Compliance Health Check', 'HealthCare Plus (Pty) Ltd', 'Project Retainer', 'Compliance & Risk', 'compliance-monitoring-retainer', 44000, 45000, 13.0, 240000, 144000, 'P. Khumalo'],
            ['RET-2026-0035', 'Strategic MIS Monthly', 'Strategic MIS (Pty) Ltd', 'Quarterly Retainer', 'Financial Advisory', 'data-analytics-retainer', 58000, 52000, 9.0, 210000, 120000, 'P. Khumalo'],
        ];

        $made = [];
        foreach ($rows as [$code, $name, $client, $type, $unit, $svc, $fee, $floor, $used, $rev, $cost, $adviser]) {
            $r = Retainer::updateOrCreate(['code' => $code], [
                'agreement_ref' => str_replace('RET-', 'TBCA-AGR-', $code),
                'user_id' => null,
                'service_id' => $services[$svc]->id,
                'name' => $name,
                'client_name' => $client,
                'retainer_type' => $type,
                'business_unit' => $unit,
                'status' => 'active',
                'allowance_qty' => 20,
                'monthly_fee_zar' => $fee,
                'floor_zar' => $floor,
                'overage_rate_zar' => 4500,
                'rollover_cap_pct' => 25,
                'owner_model' => 'NAMED_PERSON',
                'named_person_material' => true,
                'adviser' => ['name' => $adviser, 'title' => 'Director: Strategy & Advisory', 'since' => '2025-06-01'],
                'account_owner' => ['name' => $adviser, 'role' => 'Account Director'],
                'start_date' => $this->periodStart->copy()->subMonths(4),
                'term_end' => $this->periodStart->copy()->addMonths(2)->subDay(),
                'activated_at' => $this->periodStart->copy()->subMonths(4),
                'period_revenue_zar' => $rev,
                'period_cost_zar' => $cost,
            ]);
            $p = $this->period($r, 0, 'open', 20);
            $this->usage($r, $p, 'USG-'.$code, $p->starts_on->copy()->addDays(5)->setTime(10, 0), 'Advisory work (period to date)', $adviser, $used);
            $made[$code] = $r;
        }

        // Under-use alert queue (mockup levels and statuses).
        foreach ([['RET-2026-0018', 'at_risk', 'new', 15], ['RET-2026-0007', 'at_risk', 'new', 20], ['RET-2026-0009', 'moderate', 'in_progress', 25], ['RET-2026-0004', 'moderate', 'in_progress', 28], ['RET-2026-0015', 'low', 'monitoring', 32], ['RET-2026-0011', 'low', 'monitoring', 33], ['RET-2026-0019', 'at_risk', 'escalated', 10], ['RET-2026-0003', 'moderate', 'new', 18]] as [$code, $level, $status, $ago]) {
            $r = $made[$code];
            $usedNow = (float) $r->usage()->sum('units');
            Alert::updateOrCreate(['retainer_id' => $r->id], ['level' => $level, 'status' => $status, 'utilisation_pct' => round($usedNow / 20 * 100, 1), 'days_elapsed' => 12, 'last_activity' => today()->subDays($ago % 20)]);
        }

        // Substitution & continuity register.
        $subs = [
            ['SUB-2026-0014', 'RET-2026-0007', 'T. Dlamini', 'J. Mokoena', 'Planned', 'Availability', 1, 'pending_notice', 'Medium'],
            ['SUB-2026-0013', 'RET-2026-0026', 'S. Naidoo', 'P. Khumalo', 'Planned', 'Resource reallocation', 2, 'awaiting_approval', 'Low'],
            ['SUB-2026-0012', 'RET-2026-0012', 'P. Khumalo', 'S. Naidoo', 'Emergency', 'Adviser unavailable', 3, 'approved', 'High'],
            ['SUB-2026-0011', 'RET-2026-0015', 'J. Mokoena', 'T. Dlamini', 'Planned', 'Skill requirement', 4, 'approved', 'Low'],
            ['SUB-2026-0010', 'RET-2026-0009', 'T. Dlamini', 'L. Botha', 'Emergency', 'Medical leave', 5, 'client_declined', 'Medium'],
            ['SUB-2026-0009', 'RET-2026-0021', 'S. Naidoo', 'J. Mokoena', 'Planned', 'Project completion', 6, 'approved', 'Low'],
            ['SUB-2026-0008', 'RET-2026-0018', 'P. Khumalo', 'T. Dlamini', 'Planned', 'Capacity balance', 7, 'pending_notice', 'Low'],
            ['SUB-2026-0007', 'RET-2026-0011', 'L. Botha', 'P. Khumalo', 'Emergency', 'Resignation', 8, 'approved', 'High'],
            ['SUB-2026-0006', 'RET-2026-0003', 'J. Mokoena', 'S. Naidoo', 'Planned', 'Specialist input', 9, 'awaiting_approval', 'Medium'],
            ['SUB-2026-0005', 'RET-2026-0031', 'T. Dlamini', 'J. Mokoena', 'Emergency', 'Conflict of interest', 10, 'approved', 'High'],
        ];
        foreach ($subs as [$ref, $code, $from, $to, $type, $reason, $ago, $status, $risk]) {
            Substitution::updateOrCreate(['reference' => $ref], ['retainer_id' => $made[$code]->id, 'current_adviser' => ['name' => $from], 'proposed_adviser' => ['name' => $to, 'title' => 'Director: Strategy & Advisory'], 'type' => $type, 'reason' => $reason, 'effective_from' => today()->addDays(20), 'risk' => $risk, 'status' => $status, 'notice_sent_at' => $status === 'pending_notice' ? null : now()->subDays($ago - 1), 'created_at' => now()->subDays($ago)]);
        }

        // Rollover liability register (carry from the last closed period).
        [$lastStart, $lastEnd] = $this->periodBounds(-1);
        $roll = [
            ['RET-2026-0026', 18.00, 700, 36, 'Low', 'Standard rollover'], ['RET-2026-0007', 32.50, 700, 27, 'Medium', 'Scope in progress'],
            ['RET-2026-0009', 14.00, 650, 29, 'Low', 'Standard rollover'], ['RET-2026-0015', 41.00, 700, 41, 'High', 'Large balance'],
            ['RET-2026-0021', 12.30, 650, 21, 'Low', 'Recurring balance'], ['RET-2026-0012', 27.25, 700, 34, 'Medium', 'Waiting on resource'],
            ['RET-2026-0004', 9.80, 650, 18, 'Low', 'Standard rollover'], ['RET-2026-0035', 54.00, 700, 45, 'High', 'Quarterly engagement'],
            ['RET-2026-0011', 22.00, 700, 31, 'Medium', 'Resource constraints'], ['RET-2026-0003', 8.75, 700, 17, 'Low', 'Standard rollover'],
        ];
        foreach ($roll as $i => [$code, $units, $cpu, $pct, $risk, $note]) {
            Rollover::updateOrCreate(['retainer_id' => $made[$code]->id, 'period_ended' => $lastEnd->toDateString()], ['units' => $units, 'unit_type' => 'Hours', 'cost_per_unit_zar' => $cpu, 'rollover_pct' => $pct, 'note' => $note, 'expires_on' => today()->addDays([12, 25, 40, 8, 55, 70, 33, 20, 95, 61][$i]), 'status' => 'open']);
        }
    }
}
