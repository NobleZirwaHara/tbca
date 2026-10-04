<?php

namespace Database\Seeders\Sections;

use App\Models\Booking;
use App\Models\CorePages\Corridor;
use App\Models\CorePages\Observation;
use App\Models\CorePages\ToolEntitlement;
use App\Models\Order;
use App\Models\User;
use App\Support\Platform\Money;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Core pages demo data: the demo client's meetings, a paid tool purchase with a download
 * entitlement, and the corridor / Layer 9 registers shown in the admin consoles. Idempotent.
 */
class CorePagesSeeder extends Seeder
{
    public function run(): void
    {
        $this->corridors();
        $this->observations();

        $client = User::where('email', 'amahle@agritechsa.co.za')->first();
        if ($client) {
            $this->meetings($client);
            $this->toolPurchase($client);
        }
    }

    private function corridors(): void
    {
        $rows = [
            ['COR-SADC-01', 'SADC Intra-Corridor', 'Regional', 'Southern Africa', ['South Africa', 'Angola', 'Zambia', 'Mozambique'], false, 18, 'active', 98, 'Medium', 12],
            ['COR-SACU-02', 'SACU Corridor', 'Regional', 'Southern Africa', ['South Africa', 'Botswana', 'Namibia', 'Eswatini'], false, 12, 'active', 99, 'Low', 10],
            ['COR-EAC-03', 'EAC Corridor', 'Regional', 'East Africa', ['Kenya', 'Uganda', 'Tanzania', 'Rwanda'], false, 15, 'active', 97, 'Medium', 11],
            ['COR-ECOWAS-04', 'ECOWAS Corridor', 'Regional', 'West Africa', ['Nigeria', 'Ghana', "Côte d'Ivoire", 'Senegal'], false, 20, 'active', 96, 'High', 9],
            ['COR-ZAF-UK-01', 'South Africa – UK Corridor', 'Bilateral', 'Europe', ['South Africa', 'United Kingdom'], true, 6, 'active', 100, 'Low', 8],
            ['COR-ZAF-USA-01', 'South Africa – USA Corridor', 'Bilateral', 'Americas', ['South Africa', 'United States'], true, 6, 'active', 99, 'Low', 8],
            ['COR-EU-SADC-01', 'EU – SADC Corridor', 'Inter-Regional', 'Europe', ['European Union', 'SADC Region'], true, 14, 'active', 95, 'Medium', 7],
            ['COR-AS-AF-01', 'Asia – Africa Corridor', 'Inter-Regional', 'Asia', ['India', 'UAE', 'South Africa', 'Nigeria'], false, 10, 'active', 94, 'Medium', 6],
            ['COR-BRICS-01', 'BRICS Corridor', 'Inter-Regional', 'Global', ['Brazil', 'Russia', 'India', 'China', 'South Africa'], false, 8, 'active', 93, 'Medium', 6],
            ['COR-PAC-AF-01', 'Pacific – Africa Corridor', 'Inter-Regional', 'Oceania', ['Australia', 'South Africa', 'Mauritius'], false, 6, 'pending', 88, 'Low', 5],
            ['COR-ZAF-KE-01', 'South Africa – Kenya Corridor', 'Bilateral', 'East Africa', ['South Africa', 'Kenya'], true, 6, 'pending', 91, 'Medium', 4],
            ['COR-ZAF-AE-01', 'South Africa – UAE Corridor', 'Bilateral', 'Asia', ['South Africa', 'United Arab Emirates'], true, 6, 'on_hold', 87, 'Medium', 3],
        ];

        foreach ($rows as [$code, $name, $type, $region, $anchors, $bi, $paths, $state, $rcs, $risk, $day]) {
            $reviewed = Carbon::create(2026, 8, $day);
            Corridor::updateOrCreate(['code' => $code], [
                'name' => $name, 'type' => $type, 'region' => $region, 'anchors' => $anchors, 'bidirectional' => $bi,
                'trading_paths' => $paths, 'sellable_paths' => $state === 'active' ? (int) floor($paths * $rcs / 100) : 0,
                'state' => $state, 'rcs' => $rcs, 'sovereign_approval' => $state !== 'pending' || $rcs >= 90, 'risk' => $risk,
                'last_reviewed_at' => $reviewed, 'next_review_at' => $reviewed->copy()->addMonths(3),
                'history' => [['event' => $state === 'pending' ? 'created' : 'reviewed', 'at' => $reviewed->toIso8601String(), 'by' => 'TBCA Administrator']],
            ]);
        }
    }

    private function observations(): void
    {
        $rows = [
            ['00123', 'Marketplace Brief', 'Nigeria', 'NG', 'Payment Success', 'NIP Transfer Success Rate', '97.4%', '10:18', 86, 0.82, 'under_review', 'Medium', 'Shell'],
            ['00122', 'Client Portal', 'Kenya', 'KE', 'Process Turnaround', 'Company Registration (Avg Days)', '6.5 days', '10:05', 91, 0.91, 'candidate', 'Medium', 'Shell'],
            ['00121', 'Corridor Workflow', 'SA → Kenya', 'ZA', 'Corridor Friction', 'Cross-border Settlement Delay', '3.2 days', '09:52', 88, 0.76, 'candidate', 'High', 'Active'],
            ['00120', 'Partner Delivery', 'Ghana', 'GH', 'Regulatory Friction', 'Work Permit Processing', '41 days', '09:41', 93, 0.88, 'under_review', 'Medium', 'Shell'],
            ['00119', 'Evidence Acquisition', 'South Africa', 'ZA', 'Evidence Availability', 'Bank Confirmation (Days to Obtain)', '4 days', '09:30', 78, 0.68, 'candidate', 'Low', 'Active'],
            ['00118', 'WhatsApp / Talk', 'Tanzania', 'TZ', 'Client Outcome Signal', 'Satisfaction – Delivery Experience', '4.3 / 5', '09:21', 85, 0.73, 'candidate', 'Low', 'Shell'],
            ['00117', 'Due Diligence', 'Mozambique', 'MZ', 'Liquidity Friction', 'FX Availability – USD', 'Restricted', '09:10', 90, 0.85, 'under_review', 'High', 'Degraded'],
            ['00116', 'Subscription Delivery', 'Uganda', 'UG', 'Delivery Variance', 'Plan vs Actual Time Variance', '+12%', '08:58', 84, 0.72, 'candidate', 'Medium', 'Shell'],
            ['00115', 'Client Portal', 'South Africa', 'ZA', 'Process Turnaround', 'CIPC Name Reservation (Avg Days)', '2 days', '08:40', 95, 0.93, 'passed', 'Low', 'Active'],
            ['00114', 'Partner Delivery', 'South Africa', 'ZA', 'Payment Success', 'EFT Settlement Same-Day Rate', '92%', '08:20', 92, 0.9, 'promoted', 'Low', 'Active'],
            ['00113', 'Corridor Workflow', 'SA → UK', 'ZA', 'Corridor Friction', 'Document Apostille Turnaround', '9 days', '08:05', 89, 0.81, 'promoted', 'Medium', 'Active'],
            ['00112', 'Marketplace Brief', 'Botswana', 'BW', 'Evidence Availability', 'Company Search Availability', 'Partial', '07:50', 61, 0.42, 'rejected', 'Low', 'Shell'],
        ];

        foreach ($rows as [$seq, $surface, $country, $flag, $class, $subject, $value, $time, $rcs, $q, $status, $risk, $state]) {
            $captured = Carbon::parse("2026-08-15 {$time}");
            Observation::updateOrCreate(['obs_id' => "L9-OC-20260815-{$seq}"], [
                'origin_surface' => $surface, 'country' => $country, 'country_flag' => $flag, 'observation_class' => $class, 'subject' => $subject, 'value' => $value,
                'captured_at' => $captured, 'rcs_link' => $rcs, 'quality_score' => $q, 'status' => $status, 'risk' => $risk, 'availability_state' => $state,
                'publication_permission' => in_array($status, ['promoted', 'passed'], true),
                'promoted_id' => $status === 'promoted' ? "L9-EV-20260815-{$seq}" : null,
                'promoted_at' => $status === 'promoted' ? $captured->copy()->addMinutes(40) : null,
                'decision_note' => $status === 'rejected' ? 'Below quality gate; source not independently verifiable.' : null,
            ]);
        }
    }

    private function meetings(User $client): void
    {
        $next = fn (int $days, string $time) => Carbon::parse(now()->addDays($days)->format('Y-m-d').' '.$time)->next(Carbon::MONDAY)->addDays($days % 5);
        $rows = [
            ['TBCA-MTG-DEMO-0001', 'discovery-call', 'Discovery Call', 'Initial Discovery & Needs Assessment', 'Business Plan Development Sprint', 'nneka', $next(7, '14:00'), 'confirmed', 'active-sprint', null],
            ['TBCA-MTG-DEMO-0002', 'advisor-session', 'Financial Model Review', 'Review Assumptions & Key Drivers', 'Business Plan Development Sprint', 'david', $next(5, '15:00'), 'upcoming', 'funding', null],
            ['TBCA-MTG-DEMO-0003', 'advisor-session', 'Strategy Alignment Call', 'Alignment on Strategic Objectives', 'AI Automation & Digital Transformation Sprint', 'tosin', $next(11, '10:00'), 'upcoming', 'ai-technology', null],
            ['TBCA-MTG-DEMO-0004', 'advisor-session', 'Due Diligence Update', 'Due Diligence Progress Review', 'Due Diligence Process', 'michael', $next(13, '11:00'), 'pending', 'due-diligence', null],
            ['TBCA-MTG-DEMO-0005', 'advisor-session', 'Sprint Review Meeting', 'Sprint Progress Review & Feedback', 'Market Research & Feasibility Sprint', 'david', $next(17, '16:00'), 'rescheduled', 'active-sprint', null],
            ['TBCA-MTG-DEMO-0006', 'advisor-session', 'Kickoff Meeting', 'Project Kickoff & Introduction', 'Business Plan Development Sprint', 'nneka', Carbon::parse(now()->subDays(10)->format('Y-m-d').' 11:00'), 'completed', 'active-sprint', 'Scope, milestones and data requests agreed. Draft plan due in 7 days.'],
            ['TBCA-MTG-DEMO-0007', 'advisor-session', 'Market Research Review', 'Review Market Insights & Findings', 'Market Research & Feasibility Sprint', 'david', Carbon::parse(now()->subDays(12)->format('Y-m-d').' 10:00'), 'completed', 'growth-strategy', 'Three priority segments confirmed; pricing test recommended.'],
            ['TBCA-MTG-DEMO-0008', 'advisor-session', 'Document Review Call', 'Review Submitted Documents', 'Due Diligence Process', 'michael', Carbon::parse(now()->subDays(14)->format('Y-m-d').' 14:30'), 'completed', 'due-diligence', 'Two documents need replacement; remaining set accepted.'],
        ];

        foreach ($rows as [$ref, $type, $title, $subtitle, $engagement, $manager, $at, $status, $purpose, $summary]) {
            Booking::updateOrCreate(['reference' => $ref], [
                'user_id' => $client->id, 'type' => $type, 'topic' => $title, 'starts_at' => $at, 'duration_minutes' => 30, 'channel' => 'video', 'status' => $status,
                'name' => $client->name, 'email' => $client->email, 'phone' => $client->phone, 'company' => $client->company,
                'meta' => ['title' => $title, 'subtitle' => $subtitle, 'engagement' => $engagement, 'manager' => $manager, 'purpose' => $purpose, 'timezone' => 'SAST', 'contact_method' => 'Email', 'outcome' => $summary ? 'completed' : null, 'summary' => $summary],
            ]);
        }
    }

    private function toolPurchase(User $client): void
    {
        $totals = Money::totals(4950);
        $order = Order::updateOrCreate(['reference' => 'TBCA-ORD-2026-DEMO01'], [
            'user_id' => $client->id, 'section' => 'tools', 'status' => 'paid',
            'subtotal_zar' => $totals['subtotal'], 'vat_zar' => $totals['vat'], 'fees_zar' => $totals['fees'], 'total_zar' => $totals['total'],
            'billing' => ['name' => $client->name, 'email' => $client->email, 'phone' => $client->phone, 'company' => $client->company],
            'meta' => ['title' => 'Loan Amortisation Calculator', 'return_url' => '/tools/orders/TBCA-ORD-2026-DEMO01/complete'],
            'paid_at' => now()->subDays(2),
        ]);
        $order->items()->updateOrCreate(['item_code' => 'loan-amortisation-calculator'], [
            'item_type' => 'digital-tool', 'name' => 'Loan Amortisation Calculator', 'variant' => 'One-off Digital Download', 'quantity' => 1,
            'unit_zar' => 4950, 'line_zar' => 4950, 'meta' => ['type' => 'calculators', 'language' => 'English', 'licence' => 'Single-User / One-off'],
        ]);
        $order->payments()->updateOrCreate(['reference' => 'TBCA-PAY-2026-DEMO01'], [
            'method' => 'card', 'status' => 'succeeded', 'amount_zar' => $totals['total'], 'meta' => ['last4' => '4242', 'brand' => 'Visa'],
        ]);

        ToolEntitlement::updateOrCreate(['order_id' => $order->id, 'product_slug' => 'loan-amortisation-calculator'], [
            'token' => 'demo-loan-amortisation-'.substr(md5((string) $client->id), 0, 16),
            'user_id' => $client->id, 'product_name' => 'Loan Amortisation Calculator', 'licence' => 'Single-User / One-off', 'language' => 'English',
            'email' => $client->email, 'expires_at' => now()->addDays(7),
        ]);
    }
}
