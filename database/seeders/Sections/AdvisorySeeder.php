<?php

namespace Database\Seeders\Sections;

use App\Http\Controllers\Advisory\TechJourneyController;
use App\Models\Advisory\BiasAlert;
use App\Models\Advisory\Crosswalk;
use App\Models\Advisory\Disposition;
use App\Models\Advisory\EvidenceItem;
use App\Models\Advisory\ExceptionItem;
use App\Models\Advisory\FeeRule;
use App\Models\Advisory\Mandate;
use App\Models\Advisory\MandateLine;
use App\Models\Advisory\Service;
use App\Models\Advisory\Setting;
use App\Models\Advisory\SpineCheck;
use App\Models\Advisory\StopRule;
use App\Models\Advisory\Supplier;
use App\Models\Advisory\TechEngagement;
use App\Models\Advisory\TechGate;
use App\Models\Advisory\TechTicket;
use App\Models\Advisory\Vehicle;
use App\Models\Advisory\VehicleChange;
use App\Models\User;
use App\Support\Advisory\MandateWorkflow;
use App\Support\Advisory\PaContent;
use App\Support\Advisory\TechContent;
use App\Support\Advisory\TechWorkflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/** Advisory demo data (Services, Project Advisory, Technology Solutions) from the mockups. Idempotent. */
class AdvisorySeeder extends Seeder
{
    public function run(): void
    {
        $client = User::query()->where('email', 'amahle@agritechsa.co.za')->first();
        $this->services();
        $this->vehicles($client);
        if ($client) {
            $this->relationshipDemo($client);
        }
        $this->governance();
        $this->stopRules();
        $this->evidence();
        if ($client) {
            $this->mandates($client);
            $this->tech($client);
        }
        $this->techAdmin();
    }

    private function services(): void
    {
        $rows = require app_path('Support/Advisory/data/services.php');
        foreach ($rows as $letter => $list) {
            foreach ($list as $i => [$sub, $title, $summary, $price, $days, $delivery]) {
                Service::updateOrCreate(['slug' => Str::slug($title)], [
                    'letter' => $letter, 'sub_category' => $sub, 'title' => $title, 'summary' => $summary, 'price_zar' => $price,
                    'duration' => $days, 'delivery' => $delivery, 'popularity' => 100 - $i * 7 + (crc32($title) % 5),
                ]);
            }
        }
    }

    private function vehicles(?User $client): void
    {
        $fees = [
            ['code' => 'SUB-COM-BASE', 'desc' => 'Base Subscription Fee', 'type' => 'Subscription', 'basis' => 'Per Quarter', 'qty' => 1, 'unit' => 10000, 'status' => 'Active'],
            ['code' => 'SUB-COM-USER', 'desc' => 'Additional User Seats', 'type' => 'Subscription', 'basis' => 'Per User / Quarter', 'qty' => 5, 'unit' => 800, 'status' => 'Active'],
            ['code' => 'SUB-COM-API', 'desc' => 'API Access Allowance', 'type' => 'Subscription', 'basis' => 'Per Quarter', 'qty' => 1, 'unit' => 1500, 'status' => 'Active'],
            ['code' => 'USG-REP-GEN', 'desc' => 'Report Generation', 'type' => 'Usage', 'basis' => 'Per Report', 'qty' => 12, 'unit' => 250, 'status' => 'Active'],
            ['code' => 'USG-DOC-UPL', 'desc' => 'Document Upload', 'type' => 'Usage', 'basis' => 'Per Document', 'qty' => 45, 'unit' => 25, 'status' => 'Active'],
            ['code' => 'USG-DATA-ACC', 'desc' => 'Data Access (Premium)', 'type' => 'Usage', 'basis' => 'Per Request', 'qty' => 18, 'unit' => 300, 'status' => 'Active'],
            ['code' => 'ONF-SETUP', 'desc' => 'Onboarding Setup Fee', 'type' => 'One-off', 'basis' => 'One-time', 'qty' => 1, 'unit' => 5000, 'status' => 'Paid'],
            ['code' => 'ONF-TRAIN', 'desc' => 'Training & Enablement', 'type' => 'One-off', 'basis' => 'One-time', 'qty' => 1, 'unit' => 3000, 'status' => 'Paid'],
            ['code' => 'DISB-GOV-FEE', 'desc' => 'Government Filing Fee', 'type' => 'Disbursement', 'basis' => 'Pass-through', 'qty' => 1, 'unit' => 1250, 'status' => 'Active'],
            ['code' => 'DISB-THIRD-PARTY', 'desc' => 'Third Party Verification Fee', 'type' => 'Disbursement', 'basis' => 'Pass-through', 'qty' => 1, 'unit' => 2750, 'status' => 'Active'],
            ['code' => 'ADJ-DISC-LOY', 'desc' => 'Loyalty Discount', 'type' => 'Adjustment', 'basis' => 'Per Quarter', 'qty' => 1, 'unit' => -1500, 'status' => 'Active'],
            ['code' => 'TAX-VAT', 'desc' => 'Value Added Tax (15%)', 'type' => 'Tax', 'basis' => 'On Taxable Items', 'qty' => 0, 'unit' => 0, 'status' => 'Calculated'],
        ];
        $mine = [
            // code, name, type, label, engagement, start, next, milestone, owner, health, invoiced, paid, overdue, progress, billing
            ['VEH-2025-0001', 'Baobab Growth Initiative', 'Mandate', 'Project Advisory Mandate', 'MD-2025-00045', '2025-05-01', '+12 days', 'Monthly Review', 'Thabo Mokoena', 92, 75000, 45000, 0, 60, 'Monthly'],
            ['VEH-2025-0002', 'Sprint: Operational Efficiency', 'Sprint', 'Sprint (Project)', 'SP-2025-00121', '2025-05-10', '+5 days', 'Final Deliverable', 'Lerato Mabaso', 78, 29950, 19950, 0, 70, 'Milestone'],
            ['VEH-2025-0003', 'Compliance Subscription', 'Subscription', 'Subscription', 'SUB-2025-00088', '2025-04-01', '+28 days', 'Renewal', 'Sipho Dlamini', 95, 39900, 27500, 12400, 50, 'Quarterly'],
            ['VEH-2025-0011', 'Company Law Manual (12-Month)', 'Product', 'Digital Product', 'PROD-2025-00091', '2025-04-05', null, 'Access Review', 'Kabelo Radebe', 96, 9950, 9950, 0, 100, 'Once-off'],
            ['VEH-2025-0012', 'Retainer: Tax & Advisory', 'Retainer', 'Retainer', 'RET-2025-00014', '2025-03-01', '+20 days', 'Monthly Fee', 'Nomsa Khumalo', 94, 120400, 90300, 0, 75, 'Monthly'],
        ];
        foreach ($mine as [$code, $name, $type, $label, $eng, $start, $next, $milestone, $owner, $health, $inv, $paid, $over, $progress, $billing]) {
            Vehicle::updateOrCreate(['code' => $code], [
                'user_id' => $client?->id, 'name' => $name, 'client' => $client?->company ? "{$client->company} (Pty) Ltd" : 'Baobab Growth Initiative (Pty) Ltd', 'type' => $type,
                'engagement_ref' => $eng, 'status' => 'active', 'start_date' => $start, 'next_due_date' => $next ? now()->modify($next)->toDateString() : null,
                'next_milestone' => $milestone, 'owner' => $owner, 'health' => $health, 'last_activity' => now()->subDays(2), 'billing_cycle' => $billing,
                'invoiced_zar' => $inv, 'paid_zar' => $paid, 'overdue_zar' => $over, 'current_price_zar' => $inv, 'floor_price_zar' => (int) round($inv * 0.8),
                'fees' => $code === 'VEH-2025-0003' ? $fees : null,
                'meta' => ['progress' => $progress, 'label' => $label, 'usage' => $code === 'VEH-2025-0001' ? null : null],
            ]);
        }
        // Register rows for other clients
        $register = [
            ['VEH-2025-0004', 'Diagnostics Sprint', 'Baobab Growth Initiative (Pty) Ltd', 'Sprint', 'SP-2025-00109', 'active', '2025-04-15', 'Report Delivery', 'Nandi Khumalo', 90],
            ['VEH-2025-0005', 'Data Product Access', 'Baobab Growth Initiative (Pty) Ltd', 'Product', 'PROD-2025-00075', 'active', '2025-04-20', 'Access Review', 'Kabelo Radebe', 82],
            ['VEH-2025-0006', 'Project Sprint', 'Baobab Growth Initiative (Pty) Ltd', 'Sprint', 'SP-2025-00137', 'on_hold', '2025-04-28', 'Kick-off', 'Thabo Mokoena', 60],
            ['VEH-2025-0007', 'Payment Recovery Mandate', 'Alpha Importers Ltd', 'Mandate', 'MD-2025-00032', 'completed', '2025-01-10', 'Closed', 'Lerato Mabaso', 100],
            ['VEH-2025-0008', 'Strategy Advisory Mandate', 'Delta Logistics Group', 'Mandate', 'MD-2025-00018', 'completed', '2024-11-05', 'Closed', 'Thabo Mokoena', 100],
            ['VEH-2025-0009', 'AIIM – Market Scan', 'Gamma Energy Ltd', 'Product', 'PROD-2025-00042', 'archived', '2024-12-12', 'Archived', 'Sipho Dlamini', null],
            ['VEH-2025-0010', 'Feasibility Study Sprint', 'Epsilon Holdings Ltd', 'Sprint', 'SP-2024-00077', 'archived', '2024-08-15', 'Archived', 'Nandi Khumalo', null],
        ];
        foreach ($register as [$code, $name, $clientName, $type, $eng, $status, $start, $milestone, $owner, $health]) {
            Vehicle::updateOrCreate(['code' => $code], [
                'name' => $name, 'client' => $clientName, 'type' => $type, 'engagement_ref' => $eng, 'status' => $status, 'start_date' => $start,
                'next_milestone' => $milestone, 'next_due_date' => now()->addDays(14)->toDateString(), 'owner' => $owner, 'health' => $health, 'last_activity' => now()->subDays(5),
                'invoiced_zar' => 0, 'paid_zar' => 0, 'current_price_zar' => 30000, 'floor_price_zar' => 25000, 'meta' => ['progress' => 50, 'label' => $type],
            ]);
        }
        // Below-floor engagements
        $floor = [
            ['ENG-2025-0012', 'SUB-COM-USER', 'Subscription', 'Baobab Growth Initiative (Pty) Ltd', 9950, 19950, 'Increase Price', 'open', '2025-05-15', 'Sipho Dlamini'],
            ['ENG-2025-0017', 'DIAG-SPRINT', 'Diagnostics Sprint', 'Alpha Importers Ltd', 14500, 25000, 'Top-up Invoice', 'open', '2025-05-20', 'Thabo Mokoena'],
            ['ENG-2025-0021', 'DATA-ACCESS', 'Data Access', 'Delta Logistics Group', 7500, 12000, 'Add Sprints', 'in_progress', '2025-05-25', 'Nandi Khumalo'],
            ['ENG-2025-0025', 'PROJ-SPRINT', 'Project Sprint', 'Gamma Energy Ltd', 22000, 30000, 'Re-scope', 'open', '2025-05-28', 'Kabelo Radebe'],
            ['ENG-2025-0028', 'RET-ADV-MND', 'Retainer (Advisory)', 'Epsilon Holdings Ltd', 85000, 100000, 'Adjust Retainer', 'open', '2025-05-31', 'Sipho Dlamini'],
            ['ENG-2025-0031', 'SUB-PREM', 'Premium Subscription', 'Zeta Commodities Ltd', 29500, 29950, 'Minor Adjust', 'open', '2025-06-05', 'Thabo Mokoena'],
            ['ENG-2025-0033', 'VERIF-SPRINT', 'Verification Sprint', 'Eta Construction Co.', 18000, 22500, 'Add Sprints', 'in_progress', '2025-06-10', 'Nandi Khumalo'],
            ['ENG-2025-0038', 'CONSULT-MND', 'Consulting Mandate', 'Theta Gov. Agency', 35000, 40000, 'Adjust Scope', 'open', '2025-06-15', 'Kabelo Radebe'],
        ];
        foreach ($floor as $i => [$eng, $sku, $label, $clientName, $current, $floorPrice, $action, $status, $due, $owner]) {
            Vehicle::updateOrCreate(['code' => 'VEH-2025-'.str_pad((string) (20 + $i), 4, '0', STR_PAD_LEFT)], [
                'name' => $label, 'client' => $clientName, 'type' => str_contains($label, 'Subscription') ? 'Subscription' : (str_contains($label, 'Retainer') ? 'Retainer' : (str_contains($label, 'Mandate') ? 'Mandate' : 'Sprint')),
                'engagement_ref' => $eng, 'status' => 'active', 'start_date' => '2025-03-01', 'next_milestone' => 'Remediation', 'owner' => $owner, 'health' => 70, 'last_activity' => now()->subDays(3),
                'current_price_zar' => $current, 'floor_price_zar' => $floorPrice, 'remediation_action' => $action, 'remediation_status' => $status, 'remediation_due' => $due,
                'meta' => ['progress' => 40, 'label' => $label, 'eng' => $eng, 'sku' => $sku],
            ]);
        }
        // Performance rows (revenue / direct cost / utilisation)
        $perf = [
            ['ENG-ADV-0012', 'General Advisory Retainer', 'Retainer', 'Advisory', 485000, 526800, 14, 'Sipho Dlamini'],
            ['ENG-PKG-0045', 'Project Packaging Basic', 'Sprint', 'Project Packaging', 320000, 339900, 22, 'Thabo Mokoena'],
            ['ENG-RPT-0033', 'Country Report Basic', 'Product', 'Reports', 195000, 204200, 18, 'Nandi Khumalo'],
            ['ENG-VER-0021', 'Verification Basic', 'Sprint', 'Verification', 210000, 219100, 28, 'Kabelo Radebe'],
            ['ENG-CON-0077', 'Consulting Lite', 'Product', 'Consulting', 150000, 153600, 16, 'Lerato Mabaso'],
            ['ENG-STR-0004', 'Strategy Advisory Premium', 'Mandate', 'Advisory', 1250000, 640000, 86, 'Thabo Mokoena'],
            ['ENG-SUB-0019', 'Compliance Subscription Pro', 'Subscription', 'Subscriptions', 980000, 520000, 82, 'Sipho Dlamini'],
            ['ENG-DD-0031', 'Company Due Diligence', 'Sprint', 'Due Diligence', 760000, 470000, 64, 'Nandi Khumalo'],
            ['ENG-FIN-0008', 'Financial Model Build', 'Sprint', 'Finance', 540000, 360000, 58, 'Kabelo Radebe'],
            ['ENG-TRN-0012', 'Training & Webinars Bundle', 'Product', 'Training', 420000, 220000, 91, 'Lerato Mabaso'],
            ['ENG-RET-0002', 'Tax & Advisory Retainer', 'Retainer', 'Advisory', 1450000, 980000, 72, 'Nomsa Khumalo'],
            ['ENG-AI-0015', 'AI Automation Sprint', 'Sprint', 'Technology', 890000, 610000, 47, 'Thabo Mokoena'],
        ];
        foreach ($perf as $i => [$pc, $name, $type, $label, $rev, $cost, $util, $owner]) {
            Vehicle::updateOrCreate(['code' => 'VEH-2025-'.str_pad((string) (40 + $i), 4, '0', STR_PAD_LEFT)], [
                'name' => $name, 'client' => 'Portfolio', 'type' => $type, 'engagement_ref' => $pc, 'status' => 'active', 'start_date' => '2025-03-01',
                'next_milestone' => 'Quarterly Review', 'owner' => $owner, 'health' => $rev > $cost ? 85 : 55, 'last_activity' => now()->subDays(4),
                'current_price_zar' => 1, 'floor_price_zar' => 1, 'revenue_zar' => $rev, 'direct_cost_zar' => $cost, 'utilisation' => $util,
                'meta' => ['progress' => 50, 'label' => $label, 'perf_code' => $pc],
            ]);
        }
    }

    /**
     * Full client relationship test data for the demo client: every vehicle carries fee / statement
     * lines, plus an on-hold and a completed vehicle and recent change activity, so the
     * Cross-Vehicle Dashboard, Statement and Vehicle Fee Panel can all be exercised.
     */
    private function relationshipDemo(User $client): void
    {
        $extra = [
            ['VEH-2025-0013', 'Market Entry Sprint: Kenya', 'Sprint', 'Sprint (Project)', 'SP-2025-00140', 'on_hold', '2025-06-02', 'Client Inputs', 'Lerato Mabaso', 70, 18500, 9250, 0, 35, 'Milestone'],
            ['VEH-2025-0014', 'Business Health Review', 'Sprint', 'Sprint (Project)', 'SP-2025-00098', 'completed', '2025-02-10', 'Closed', 'Thabo Mokoena', 100, 14800, 14800, 0, 100, 'Once-off'],
        ];
        foreach ($extra as [$code, $name, $type, $label, $eng, $status, $start, $milestone, $owner, $health, $inv, $paid, $over, $progress, $billing]) {
            Vehicle::updateOrCreate(['code' => $code], [
                'user_id' => $client->id, 'name' => $name, 'client' => $client->company ? "{$client->company} (Pty) Ltd" : 'AgriTech SA (Pty) Ltd', 'type' => $type,
                'engagement_ref' => $eng, 'status' => $status, 'start_date' => $start, 'next_due_date' => $status === 'completed' ? null : now()->addDays(21)->toDateString(),
                'next_milestone' => $milestone, 'owner' => $owner, 'health' => $health, 'last_activity' => now()->subDays(6), 'billing_cycle' => $billing,
                'invoiced_zar' => $inv, 'paid_zar' => $paid, 'overdue_zar' => $over, 'current_price_zar' => $inv, 'floor_price_zar' => (int) round($inv * 0.8),
                'meta' => ['progress' => $progress, 'label' => $label],
            ]);
        }

        // Fee / statement lines for every client vehicle that does not already carry the detailed set.
        $line = fn ($code, $desc, $type, $basis, $qty, $unit, $status) => compact('code', 'desc', 'type', 'basis', 'qty', 'unit', 'status');
        $sets = [
            'Mandate' => fn ($v) => [
                $line('MND-RET', 'Mandate Retainer', 'Subscription', 'Per Month', 1, 15000, 'Active'),
                $line('MND-MS1', 'Milestone 1 — Discovery Report', 'One-off', 'Milestone', 1, 30000, 'Paid'),
                $line('MND-MS2', 'Milestone 2 — Structuring Pack', 'One-off', 'Milestone', 1, 15000, 'Paid'),
                $line('MND-SUC', 'Success Fee Accrual', 'Usage', 'Contingent', 1, 15000, 'Active'),
                $line('DISB-TRAVEL', 'Site Visit Travel', 'Disbursement', 'Pass-through', 1, 3200, 'Active'),
                $line('TAX-VAT', 'Value Added Tax (15%)', 'Tax', 'On Taxable Items', 0, 0, 'Calculated'),
            ],
            'Sprint' => fn ($v) => [
                $line('SPR-DEP', 'Sprint Deposit (30%)', 'One-off', 'On acceptance', 1, (int) round($v->invoiced_zar * 0.3), 'Paid'),
                $line('SPR-MID', 'Sprint Mid-point (40%)', 'One-off', 'Milestone', 1, (int) round($v->invoiced_zar * 0.4), $v->status === 'completed' ? 'Paid' : 'Active'),
                $line('SPR-FIN', 'Sprint Final (30%)', 'One-off', 'On delivery', 1, (int) round($v->invoiced_zar * 0.3), $v->status === 'completed' ? 'Paid' : 'Active'),
                $line('TAX-VAT', 'Value Added Tax (15%)', 'Tax', 'On Taxable Items', 0, 0, 'Calculated'),
            ],
            'Product' => fn ($v) => [
                $line('PRD-LIC', 'Digital Product Licence (12 months)', 'One-off', 'One-time', 1, $v->invoiced_zar, 'Paid'),
                $line('TAX-VAT', 'Value Added Tax (15%)', 'Tax', 'On Taxable Items', 0, 0, 'Calculated'),
            ],
            'Retainer' => fn ($v) => [
                $line('RET-BASE', 'Monthly Retainer Fee', 'Subscription', 'Per Month', 1, 30100, 'Active'),
                $line('RET-HRS', 'Additional Advisory Hours', 'Usage', 'Per Hour', 6, 1850, 'Active'),
                $line('RET-PRIOR', 'Prior Months (3)', 'Subscription', 'Per Month', 3, 30100, 'Paid'),
                $line('DISB-SARS', 'Revenue Authority Filing Fee', 'Disbursement', 'Pass-through', 1, 450, 'Active'),
                $line('ADJ-DISC', 'Annual Commitment Discount', 'Adjustment', 'Per Month', 1, -1500, 'Active'),
                $line('TAX-VAT', 'Value Added Tax (15%)', 'Tax', 'On Taxable Items', 0, 0, 'Calculated'),
            ],
        ];
        Vehicle::query()->where('user_id', $client->id)->get()->each(function (Vehicle $v) use ($sets) {
            if (! empty($v->fees) || ! isset($sets[$v->type])) {
                return;
            }
            $v->update(['fees' => $sets[$v->type]($v)]);
        });

        $changes = [
            ['VCH-DEMO-0001', 'VEH-2025-0002', 'upgrade', 'requested', 'Sprint: Operational Efficiency', 'Mandate: Operational Efficiency', 85000, 19950, 65050, 3],
            ['VCH-DEMO-0002', 'VEH-2025-0003', 'recurrence', 'approved', 'Compliance Subscription (Quarterly)', 'Compliance Subscription (Annual)', 149000, 12400, 136600, 9],
            ['VCH-DEMO-0003', 'VEH-2025-0014', 'transition', 'completed', 'Business Health Review', 'Retainer: Tax & Advisory', 120400, 0, 0, 30],
        ];
        foreach ($changes as [$ref, $code, $type, $status, $from, $to, $value, $credit, $payable, $daysAgo]) {
            $change = VehicleChange::updateOrCreate(['reference' => $ref], [
                'user_id' => $client->id, 'vehicle_id' => Vehicle::query()->where('code', $code)->value('id'), 'type' => $type, 'status' => $status,
                'from_vehicle' => $from, 'to_vehicle' => $to, 'new_value_zar' => $value, 'credit_zar' => $credit, 'payable_now_zar' => $payable,
                'payload' => ['seeded' => true],
            ]);
            $change->forceFill(['created_at' => now()->subDays($daysAgo)])->saveQuietly();
        }
    }

    private function governance(): void
    {
        $disp = [
            ['SP-2025-00045', 'Strategic Advisory Mandate', 'VEH-2025-0001', 'Baobab Growth Initiative (Pty) Ltd', 'Mandate', 'authorised', 'In Progress', 'Thabo Mokoena', 250000, '2025-04-01', '2025-05-20'],
            ['SP-2025-00121', 'Operational Efficiency Sprint', 'VEH-2025-0002', 'Baobab Growth Initiative (Pty) Ltd', 'Sprint', 'authorised', 'In Progress', 'Lerato Mabaso', 95000, '2025-03-10', '2025-05-12'],
            ['SP-2025-00088', 'Compliance Subscription', 'VEH-2025-0003', 'Baobab Growth Initiative (Pty) Ltd', 'Subscription', 'authorised', 'Active', 'Sipho Dlamini', 45000, '2025-02-01', '2025-06-01'],
            ['SP-2025-00109', 'Diagnostics Sprint', 'VEH-2025-0004', 'Baobab Growth Initiative (Pty) Ltd', 'Sprint', 'awaiting_client_input', 'Awaiting Input', 'Nandi Khumalo', 75000, '2025-04-15', '2025-05-18'],
            ['SP-2025-00075', 'Data Product Access', 'VEH-2025-0005', 'Baobab Growth Initiative (Pty) Ltd', 'Product', 'authorised', 'Active', 'Kabelo Radebe', 30000, '2025-04-20', '2026-04-20'],
            ['SP-2025-00137', 'Project Sprint', 'VEH-2025-0006', 'Baobab Growth Initiative (Pty) Ltd', 'Sprint', 'blocked', 'Blocked', 'Thabo Mokoena', 120000, '2025-04-28', null],
            ['SP-2025-00032', 'Payment Recovery Mandate', 'VEH-2025-0007', 'Alpha Importers Ltd', 'Mandate', 'completed', 'Completed', 'Lerato Mabaso', 40000, '2025-01-10', '2025-04-25'],
            ['SP-2025-00018', 'Strategy Advisory Mandate', 'VEH-2025-0008', 'Delta Logistics Group', 'Mandate', 'completed', 'Completed', 'Thabo Mokoena', 180000, '2024-11-05', '2025-02-20'],
            ['SP-2025-00042', 'AIIM Market Scan', 'VEH-2025-0009', 'Gamma Energy Ltd', 'Product', 'authorised', 'Active', 'Sipho Dlamini', 15000, '2024-12-12', '2025-12-12'],
            ['SP-2024-00077', 'Feasibility Study Sprint', 'VEH-2025-0010', 'Epsilon Holdings Ltd', 'Sprint', 'cancelled', 'Cancelled', 'Nandi Khumalo', null, '2024-08-15', '2024-11-30'],
            ['SP-2025-00151', 'Board Pack Preparation Sprint', 'VEH-2025-0001', 'Baobab Growth Initiative (Pty) Ltd', 'Sprint', 'authorised', 'In Progress', 'Thabo Mokoena', 8900, '2025-04-22', '2025-05-02'],
            ['SP-2025-00152', 'Cash Flow Forecast Sprint', 'VEH-2025-0012', 'AgriTech SA (Pty) Ltd', 'Sprint', 'awaiting_client_input', 'Awaiting Input', 'Nomsa Khumalo', 9950, '2025-04-25', '2025-05-09'],
        ];
        foreach ($disp as [$code, $desc, $veh, $client, $type, $disposition, $status, $owner, $value, $start, $target]) {
            Disposition::updateOrCreate(['code' => $code], ['description' => $desc, 'vehicle_code' => $veh, 'client' => $client, 'type' => $type, 'disposition' => $disposition, 'status' => $status, 'owner' => $owner, 'value_zar' => $value, 'start_date' => $start, 'target_date' => $target]);
        }

        $cw = [
            ['TBCA Service Category', 'SERV-001', 'Compliance Subscription', 'Industry Classification (NAICS)', '541611', 'Administrative Management & General Management Consulting Services', 'Exact Match', 100, 'validated', '2025-05-01'],
            ['TBCA Service Category', 'SERV-005', 'Diagnostics Sprint', 'Industry Classification (NAICS)', '541690', 'Other Scientific and Technical Consulting Services', 'Exact Match', 95, 'validated', '2025-04-30'],
            ['Vehicle Type', 'VT-PRD', 'Product', 'IFRS 15 Revenue Category', 'RC-03', 'Licences & Platform Access', 'Broad Match', 90, 'validated', '2025-04-29'],
            ['Engagement Type', 'ET-MND', 'Advisory Mandate', 'IFRS 15 Revenue Category', 'RC-01', 'Professional Services', 'Exact Match', 100, 'validated', '2025-05-01'],
            ['Fee Type', 'FT-DISB', 'Disbursement', 'IFRS 15 Revenue Category', 'RC-05', 'Third-Party Costs', 'Exact Match', 100, 'validated', '2025-05-01'],
            ['Country Code (ISO3166)', 'EG', 'Egypt', 'World Bank Country Code', 'EGY', 'Arab Republic of Egypt', 'Exact Match', 100, 'validated', '2025-04-28'],
            ['Currency Code (ISO4217)', 'ZAR', 'South African Rand', 'Accounting Currency', 'ZAR', 'South African Rand', 'Exact Match', 100, 'validated', '2025-04-30'],
            ['Project Stage', 'PS-FS', 'Feasibility Study', 'Project Lifecycle (PMI)', 'PL-02', 'Planning', 'Broad Match', 85, 'validated', '2025-04-27'],
            ['Risk Category', 'RK-POL', 'Political Risk', 'ISO 31000 Risk Type', 'RT-07', 'External Context Risk', 'Narrow Match', 80, 'under_review', '2025-05-01'],
            ['Funding Type', 'FD-DFI', 'DFI Financing', 'Financing Source Type', 'FS-02', 'Multilateral / DFI', 'Exact Match', 95, 'validated', '2025-04-30'],
            ['TBCA Service Category', 'SERV-012', 'Market Entry Strategy', 'Industry Classification (NAICS)', '541613', 'Marketing Consulting Services', 'Broad Match', 76, 'needs_attention', '2025-04-25'],
            ['Vehicle Type', 'VT-RET', 'Retainer', 'IFRS 15 Revenue Category', 'RC-02', 'Recurring Services', 'Exact Match', 92, 'validated', '2025-04-29'],
            ['Country Code (ISO3166)', 'ZA', 'South Africa', 'World Bank Country Code', 'ZAF', 'South Africa', 'Exact Match', 100, 'validated', '2025-04-30'],
            ['Sector', 'SEC-AGR', 'Agriculture & Agro-Industry', 'ISIC Rev.4', 'A01', 'Crop and animal production', 'Broad Match', 72, 'needs_attention', '2025-04-20'],
        ];
        foreach ($cw as [$st, $sc, $sl, $tt, $tc, $tl, $rel, $conf, $status, $verified]) {
            Crosswalk::updateOrCreate(['source_taxonomy' => $st, 'source_code' => $sc, 'target_taxonomy' => $tt], ['source_label' => $sl, 'target_code' => $tc, 'target_label' => $tl, 'relationship' => $rel, 'confidence' => $conf, 'status' => $status, 'last_verified' => $verified]);
        }

        $spine = [
            ['CHK-2025-0412', 'MD-2025-00045 / Diagnostics Sprint', 'Baobab Growth Initiative (Pty) Ltd', 'Rule 6.2: Below-Floor Pricing', 6, 'Pricing Breach', 'high', '2025-05-02', 'Thabo Mokoena', 'open', 'Adjust pricing to floor', '2025-05-15'],
            ['CHK-2025-0411', 'MD-2025-00048 / Subscription (Annual)', 'Alpha Importers Ltd', 'Rule 5.3: Missing Disclosure', 5, 'Disclosure Breach', 'medium', '2025-05-02', 'Sipho Dlamini', 'open', 'Provide full disclosure', '2025-05-10'],
            ['CHK-2025-0410', 'MD-2025-00021 / Retainer (40 hrs)', 'Delta Logistics Group', 'Rule 3.1: Multi-Vehicle Conflict', 3, 'Multi-Vehicle Breach', 'high', '2025-05-01', 'Nandi Khumalo', 'in_progress', 'Review vehicle setup', '2025-05-08'],
            ['CHK-2025-0409', 'MD-2025-00017 / Project Sprint', 'Gamma Energy Ltd', 'Rule 2.4: Unauthorised Discount', 2, 'Pricing Breach', 'medium', '2025-04-30', 'Kabelo Radebe', 'open', 'Remove discount', '2025-05-07'],
            ['CHK-2025-0408', 'MD-2025-00025 / Advisory Mandate', 'Epsilon Holdings Ltd', 'Rule 7.2: Disbursement Approval', 7, 'Process Breach', 'medium', '2025-04-29', 'Lerato Mabaso', 'open', 'Obtain approval', '2025-05-06'],
            ['CHK-2025-0407', 'MD-2025-00031 / Premium Subscription', 'Zeta Commodities Ltd', 'Rule 6.1: Margin Steering Override', 6, 'Fairness Breach', 'critical', '2025-04-28', 'Thabo Mokoena', 'open', 'Independent review of recommendation', '2025-05-05'],
            ['CHK-2025-0406', 'MD-2025-00012 / Retainer', 'Theta Gov. Agency', 'Rule 8.1: Missing Audit Trail', 8, 'Audit Breach', 'low', '2025-04-26', 'Sipho Dlamini', 'resolved', 'Restore audit events', '2025-05-03'],
        ];
        foreach ($spine as [$code, $eng, $client, $rule, $cat, $type, $sev, $det, $owner, $status, $action, $due]) {
            SpineCheck::updateOrCreate(['code' => $code], ['engagement' => $eng, 'client' => $client, 'rule' => $rule, 'rule_category' => $cat, 'breach_type' => $type, 'severity' => $sev, 'detected_on' => $det, 'owner' => $owner, 'status' => $status, 'action_required' => $action, 'due_date' => $due]);
        }

        $bias = [
            ['ENG-2025-0012', 'Baobab Growth Initiative (Pty) Ltd', 'MD-2025-00045', 'Subscriptions', 'Diagnostics Sprint', 'Data Product Access', -0.78, 'Higher margin vehicle recommended', 'Lerato Mabaso', '2025-05-01', 'open'],
            ['ENG-2025-0017', 'Alpha Importers Ltd', 'MD-2025-00043', 'Subscriptions', 'Subscription (Annual)', 'Project Sprint', -0.65, 'Subscription not aligned to usage', 'Nandi Khumalo', '2025-04-30', 'open'],
            ['ENG-2025-0021', 'Delta Logistics Group', 'MD-2025-00047', 'Retainers', 'Retainer (40 hrs)', 'Project Sprint', -0.61, 'Retainer not justified by capacity need', 'Sipho Dlamini', '2025-04-29', 'under_review'],
            ['ENG-2025-0025', 'Gamma Energy Ltd', 'MD-2025-00051', 'Advisory Mandates', 'Advisory Mandate', 'Diagnostics Sprint', -0.58, 'Beyond-floor pricing without scope', 'Thabo Mokoena', '2025-04-28', 'open'],
            ['ENG-2025-0028', 'Epsilon Holdings Ltd', 'MD-2025-00055', 'Subscriptions', 'Compliance Subscription', 'Advisory Mandate', -0.55, 'Over-scoped solution', 'Lerato Mabaso', '2025-04-27', 'open'],
            ['ENG-2025-0040', 'Zeta Commodities Ltd', 'SP-2025-00160', 'Diagnostics', 'Diagnostics Sprint', 'Free Diagnostic', -0.38, 'High margin vehicle recommended instead of lower margin alternative', 'Lerato Mabaso', '2025-04-24', 'open'],
            ['ENG-2025-0041', 'Eta Construction Co.', 'SP-2025-00161', 'Diagnostics', 'Verification Sprint', 'Digital Product', -0.22, 'Below-floor pricing without justification', 'Thabo Mokoena', '2025-04-22', 'open'],
            ['ENG-2025-0042', 'Theta Gov. Agency', 'RET-2025-00020', 'Retainers', 'Retainer (20 hrs)', 'Subscription', -0.16, 'Retainer recommended without capacity need', 'Nandi Khumalo', '2025-04-21', 'open'],
            ['ENG-2025-0043', 'Kappa Foods', 'SUB-2025-00101', 'Subscriptions', 'Subscription (Monthly)', 'Digital Product', -0.19, 'Subscription recommended without usage fit', 'Kabelo Radebe', '2025-04-20', 'open'],
            ['ENG-2025-0044', 'Lambda Mining', 'MD-2025-00060', 'Advisory Mandates', 'Advisory Mandate', 'Advisory Mandate', 0.13, 'Fit-based recommendation', 'Sipho Dlamini', '2025-04-19', 'resolved'],
            ['ENG-2025-0045', 'Mu Logistics', 'PROD-2025-00110', 'Data Products', 'Data Product Access', 'Data Product Access', 0.30, 'Fit-based recommendation', 'Sipho Dlamini', '2025-04-18', 'resolved'],
            ['ENG-2025-0046', 'Nu Retail', 'PROD-2025-00111', 'Digital Products', 'Digital Product', 'Digital Product', 0.33, 'Lower margin alternative chosen', 'Kabelo Radebe', '2025-04-17', 'resolved'],
            ['ENG-2025-0047', 'Xi Health', 'TRN-2025-00012', 'Training & Webinars', 'Webinar Bundle', 'Webinar Bundle', 0.86, 'Lower margin alternative chosen', 'Nandi Khumalo', '2025-04-16', 'resolved'],
            ['ENG-2025-0048', 'Omicron Agri', 'SP-2025-00170', 'Diagnostics', 'Diagnostics Sprint', 'Diagnostics Sprint', 0.02, 'Fit-based recommendation', 'Thabo Mokoena', '2025-04-15', 'resolved'],
            ['ENG-2025-0049', 'Pi Energy', 'MD-2025-00062', 'Advisory Mandates', 'Advisory Mandate', 'Project Sprint', -0.05, 'Fit-based recommendation', 'Lerato Mabaso', '2025-04-14', 'resolved'],
        ];
        foreach ($bias as [$eng, $client, $ref, $cat, $rec, $alt, $score, $reason, $owner, $date, $status]) {
            BiasAlert::updateOrCreate(['engagement' => $eng], ['client' => $client, 'vehicle_ref' => $ref, 'category' => $cat, 'recommended' => $rec, 'alternative' => $alt, 'score' => $score, 'reason' => $reason, 'owner' => $owner, 'flagged_on' => $date, 'status' => $status]);
        }
    }

    private function stopRules(): void
    {
        foreach (PaContent::stopNowRules() as [$code, $rule, $cond, $risk, $owner]) {
            StopRule::updateOrCreate(['code' => $code], ['rule' => $rule, 'condition' => $cond, 'risk' => $risk, 'owner' => $owner]);
        }
    }

    private function evidence(): void
    {
        $items = [
            ['SA GDP Q2 2026 Preliminary Estimate', 'Gross Domestic Product growth analysis', 'Statistic', 'Stats SA', 'Official', 'South Africa', 'Economy', '2026-08-15', 'high'],
            ['Manufacturing PMI - July 2026', 'Manufacturing Purchasing Managers Index', 'Report', 'BER', 'Institutional', 'South Africa', 'Manufacturing', '2026-08-14', 'high'],
            ['Renewable Energy Capacity Database', 'Installed renewable energy capacity dataset', 'Dataset', 'DMRE', 'Government', 'South Africa', 'Energy', '2026-08-13', 'medium'],
            ['AfCFTA Trade Flows Q1 2026', 'Intra-African trade flows and analysis', 'Report', 'AfDB', 'Multilateral', 'Africa Wide', 'Trade', '2026-08-12', 'high'],
            ['Companies Act 71 of 2008 – Updated', 'Latest legislative updates and amendments', 'Legislation', 'Gov ZA', 'Official', 'South Africa', 'Legal', '2026-08-11', 'high'],
            ['Agricultural Output Survey 2026', 'Field crop and horticulture output estimates', 'Statistic', 'DALRRD', 'Government', 'South Africa', 'Agriculture', '2026-08-09', 'medium'],
            ['Transport Infrastructure Pipeline', 'National infrastructure project pipeline', 'Dataset', 'Infrastructure SA', 'Government', 'South Africa', 'Infrastructure', '2026-08-07', 'high'],
            ['Tourism Arrivals – June 2026', 'Foreign arrivals and occupancy trends', 'Statistic', 'Stats SA', 'Official', 'South Africa', 'Tourism', '2026-08-05', 'high'],
            ['Kenya Energy Tariff Review', 'Retail tariff schedule and review notes', 'Report', 'EPRA', 'Regulator', 'Kenya', 'Energy', '2026-07-30', 'low'],
            ['ICT Sector Investment Tracker', 'Data centre and fibre investment announcements', 'Dataset', 'TBCA AIIM', 'Platform', 'Africa Wide', 'ICT', '2026-07-28', 'medium'],
            ['Health Facility Register', 'Public and private facility register extract', 'Dataset', 'NDoH', 'Government', 'South Africa', 'Health', '2026-07-25', 'medium'],
            ['Informal Trade Estimates (unverified)', 'Desk estimate pending source confirmation', 'Statistic', 'Desk Research', 'Unverified', 'South Africa', 'Trade', '2026-07-20', 'unverified'],
        ];
        foreach ($items as [$title, $sub, $type, $source, $kind, $country, $industry, $date, $q]) {
            EvidenceItem::updateOrCreate(['title' => $title], ['subtitle' => $sub, 'type' => $type, 'source' => $source, 'source_kind' => $kind, 'country' => $country, 'industry' => $industry, 'verified_on' => $date, 'quality' => $q, 'verified' => $q !== 'unverified']);
        }
    }

    private function mandates(User $client): void
    {
        // 1) Active mandate in feasibility (P17 workspace, P11 ledger, P16 settlement, P18 gate, P19 meter)
        $m = Mandate::updateOrCreate(['reference' => 'PA-2026-0319'], [
            'user_id' => $client->id, 'project_name' => 'Blue Horizon Solar & Grid Project', 'organisation' => 'Blue Horizon Infrastructure SPV', 'contact' => $client->name, 'email' => $client->email,
            'country' => 'South Africa', 'sector' => 'energy-utilities', 'sponsor_type' => 'Developer', 'project_stage' => 'Feasibility', 'size_band' => '250m-1bn',
            'engagement_route' => 'co-advisory', 'entry_route' => 'discovery', 'status' => 'active', 'stage' => 8, 'current_gate' => 'G4', 'service_code' => 'feasibility-studies',
            'lead_adviser' => 'Thandi Ndlovu', 'senior_reviewer' => 'Michael Roberts', 'nda_signed_at' => '2026-04-09 10:00', 'nda_signer' => $client->name.', Director',
            'method_card_approved_at' => '2026-05-18 09:00', 'letter_signed_at' => '2026-04-22 15:00', 'mandate_signed_at' => '2026-04-23 10:00', 'signer_name' => $client->name,
            'qualification' => ['signals' => ['Stage Clarity' => 'High', 'Evidence Status' => 'Medium', 'Funding Clarity' => 'Medium', 'Reviewer Attention' => 'High']],
            'meta' => [
                'evidence_requests' => [
                    ['item' => 'Site rights pack', 'requested' => '10 May 2026', 'status' => 'Submitted', 'required_by' => '24 May 2026'],
                    ['item' => 'Sponsor financials (FY23–FY25)', 'requested' => '10 May 2026', 'status' => 'Partial', 'required_by' => '24 May 2026'],
                    ['item' => 'Demand study extract', 'requested' => '12 May 2026', 'status' => 'Outstanding', 'required_by' => '26 May 2026'],
                    ['item' => 'Grid connection correspondence', 'requested' => '14 May 2026', 'status' => 'In Progress', 'required_by' => '28 May 2026'],
                ],
                'deliverables' => [
                    ['name' => 'Feasibility Diagnostic Memo', 'ref' => 'MC-A08-FEAS-02', 'due' => '28 May 2026', 'status' => 'In Review', 'owner' => 'TBCA Lead'],
                    ['name' => 'Initial Risk Register', 'ref' => 'RISK-A08-01', 'due' => '04 Jun 2026', 'status' => 'Ready for Review', 'owner' => 'Risk Lead'],
                    ['name' => 'External Study Scope Pack', 'ref' => 'SCOPE-GRID-01', 'due' => '11 Jun 2026', 'status' => 'In Preparation', 'owner' => 'Technical Lead'],
                ],
                'milestones' => [
                    ['date' => '28 May 2026', 'name' => 'Feasibility Diagnostic Memo Review', 'depends' => 'Evidence complete'],
                    ['date' => '04 Jun 2026', 'name' => 'Risk Register Review & Approval', 'depends' => 'Risks identified'],
                    ['date' => '11 Jun 2026', 'name' => 'External Study Scope Approval', 'depends' => 'Provider quote'],
                    ['date' => '18 Jun 2026', 'name' => 'Feasibility Memo Finalisation', 'depends' => 'Scope approval'],
                    ['date' => '25 Jun 2026', 'name' => 'Gate G-09 Decision Pack', 'depends' => 'Feasibility memo'],
                ],
                'vdr' => ['folders' => 18, 'files' => 12, 'review' => 2],
                'next_tbca' => 'Finalise revised feasibility memo after evidence upload',
                'next_client' => 'Approve external grid study scope',
                'contingent_cap' => 450000,
            ],
        ]);
        MandateWorkflow::ensureGates($m);
        foreach (['G0' => 'approved', 'G1' => 'approved', 'G2' => 'approved', 'G3' => 'approved', 'G4' => 'pending'] as $code => $status) {
            $m->gates()->where('code', $code)->update(['status' => $status, 'decided_at' => $status === 'approved' ? now()->subDays(20) : null, 'decided_by' => $status === 'approved' ? $client->name : null, 'expires_at' => $status === 'pending' ? now()->addDays(10) : null]);
        }
        if ($m->lines()->count() === 0) {
            $lines = [
                ['T', 'PA-T-002-M1', 'Structured Discovery & Diagnostic', 'TBCA Project Advisory', 'Method-approved fee', 'fixed', 'paid', 12500, 12500, 12500, 12500, 12500, 0, 'G1'],
                ['T', 'PA-T-002-M2', 'Feasibility Studies — M1 Commencement', 'TBCA Project Advisory', '20% of T on Method Approval', 'fixed', 'paid', 17990, 17990, 17990, 17990, 17990, 0, 'G2'],
                ['T', 'PA-T-002-M3', 'Feasibility Studies — M2 Data Complete', 'TBCA Project Advisory', '20% of T on Data Acceptance', 'fixed', 'approved', 17990, 17990, 17990, 0, 0, 0, 'G3'],
                ['T', 'PA-T-002-M4', 'Feasibility Studies — M3 Findings Draft', 'TBCA Project Advisory', '30% of T on Draft Submission', 'fixed', 'disclosed', 26985, 26985, 26985, 0, 0, 0, 'G4'],
                ['T', 'PA-T-002-M5', 'Feasibility Studies — M4 Final Report', 'TBCA Project Advisory', '30% of T on Final Acceptance', 'fixed', 'disclosed', 26985, 26985, 26985, 0, 0, 0, 'G5'],
                ['P', 'PL-01', 'Workspace Access', 'TBCA Platform', 'Monthly', 'fixed', 'paid', 1950, 1950, 1950, 1950, 1950, 0, 'G2'],
                ['P', 'PL-03', 'AI-Assisted Analysis Workspace', 'TBCA Platform', 'Usage', 'metered', 'approved', 3200, 3200, 3200, 0, 0, 0, 'G3'],
                ['X', null, 'Environmental Study Provider', 'EnviroTech (Pty) Ltd', 'Fixed Fee — Direct Pass-Through', 'estimated', 'approved', 42000, 42000, 42000, 0, 0, 0, 'G3'],
                ['X', null, 'Grid Interface Review', 'External Provider', 'Quote Required', 'quote_on_trigger', 'disclosed', 15000, 35000, 60000, 0, 0, 0, 'G4'],
                ['S', null, 'Municipal Submission Fee', 'City Authority', 'Regulatory Schedule', 'as_incurred', 'disclosed', 450, 450, 450, 0, 0, 0, 'G4'],
                ['C', null, 'Contingent Outcome Fee', 'TBCA Contingent Invoice', 'Success / Outcome', 'contingent', 'not_triggered', 0, 0, 150000, 0, 0, 0, 'G9'],
            ];
            foreach ($lines as [$l, $code, $item, $rec, $basis, $cert, $status, $low, $exp, $high, $paid, $earned, $credit, $gate]) {
                MandateLine::create(['mandate_id' => $m->id, 'ledger' => $l, 'code' => $code, 'item' => $item, 'recipient' => $rec, 'basis' => $basis, 'certainty' => $cert, 'status' => $status,
                    'low_zar' => $low, 'expected_zar' => $exp, 'high_zar' => $high, 'paid_zar' => $paid, 'earned_zar' => $earned, 'creditable_zar' => $credit, 'gate_code' => $gate,
                    'invoice_ref' => $status === 'approved' && in_array($l, ['T', 'P'], true) ? 'INV-'.$l.'-2041'.strlen($item) : ($l === 'X' && $status === 'approved' ? 'INV-EP-5581' : null),
                    'due_date' => $status === 'approved' ? now()->addDays(7) : null, 'payment_route' => $l === 'X' ? 'Direct-to-Provider' : ($l === 'S' ? 'Authority' : 'Secure Portal Payment'),
                    'evidence' => $status === 'approved' ? ($l === 'X' ? 'Provider Quote Accepted' : 'Approved Gate G3') : null]);
            }
            foreach ([['Client', 'Evidence uploaded: Site rights pack'], ['Thandi Ndlovu', 'Review comment added: Feasibility Diagnostic Memo'], ['Michael Roberts', 'Fee item approved: External study quote accepted'], ['System', 'VDR opened: Data Room access granted'], [$client->name, 'Gate G3 approved: External Commitment Approval']] as [$a, $e]) {
                $m->log($a, $e);
            }
        }

        // 2) Mandate awaiting method card approval (P20)
        $m2 = Mandate::updateOrCreate(['reference' => 'PA-2026-0147'], [
            'user_id' => $client->id, 'project_name' => 'Working Capital Optimisation', 'organisation' => $client->company ? "{$client->company} (Pty) Ltd" : 'AgriTech SA (Pty) Ltd', 'contact' => $client->name, 'email' => $client->email,
            'country' => 'South Africa', 'sector' => 'agriculture-agro-industry', 'sponsor_type' => 'Founder-led', 'project_stage' => 'Pre-Feasibility', 'size_band' => '10m-50m',
            'engagement_route' => 'fixed-scope', 'entry_route' => 'intake', 'status' => 'qualified', 'stage' => 3, 'current_gate' => 'G1',
            'nda_signed_at' => '2026-09-20 10:00', 'nda_signer' => $client->name.', Managing Director',
            'qualification' => ['signals' => ['Stage Clarity' => 'Medium', 'Evidence Status' => 'Low', 'Funding Clarity' => 'Medium', 'Reviewer Attention' => 'High']],
            'meta' => ['evidence_requests' => [], 'deliverables' => [], 'milestones' => [], 'contingent' => ['credit' => 150000]],
        ]);
        MandateWorkflow::ensureGates($m2);
        $m2->gates()->where('code', 'G0')->update(['status' => 'approved', 'decided_at' => now()->subDays(14), 'decided_by' => 'System']);
        if (! $m2->service_code) {
            MandateWorkflow::issueMethodCard($m2, 'business-case-strategy');
        }

        // 3) New intake awaiting NDA
        $m3 = Mandate::updateOrCreate(['reference' => 'PA-2026-0402'], [
            'user_id' => $client->id, 'project_name' => 'Gauteng Integrated Agro-Logistics Hub', 'organisation' => 'Blue Ridge Infrastructure (Pty) Ltd', 'contact' => $client->name, 'email' => $client->email,
            'country' => 'South Africa', 'sector' => 'infrastructure-public-projects', 'sponsor_type' => 'Corporate', 'project_stage' => 'Pre-Feasibility', 'size_band' => '50m-250m',
            'engagement_route' => 'fixed-scope', 'entry_route' => 'intake', 'status' => 'enquiry', 'stage' => 1, 'current_gate' => 'G0',
            'qualification' => ['signals' => ['Stage Clarity' => 'Medium', 'Evidence Status' => 'Low', 'Funding Clarity' => 'Low', 'Reviewer Attention' => 'High']],
            'meta' => ['evidence_requests' => [], 'deliverables' => [], 'milestones' => []],
        ]);
        MandateWorkflow::ensureGates($m3);
        $m3->gates()->where('code', 'G0')->update(['status' => 'approved', 'decided_at' => now()->subDay(), 'decided_by' => 'System']);
    }

    private function tech(User $client): void
    {
        $config = ['agents' => ['research', 'compliance', 'finance'], 'automation' => 'advanced', 'integrations' => ['external', 'documents'], 'analytics' => 'diagnostic', 'security' => 'enhanced', 'compliance' => ['POPIA', 'ISO 27001'], 'deployment' => 'hybrid', 'scale' => 'professional', 'support' => 'priority'];
        $lines = TechContent::feeLines($config);
        $e = TechEngagement::updateOrCreate(['reference' => 'ENG-TS-1042'], [
            'user_id' => $client->id, 'tower' => 'TS-1', 'organisation' => 'Acme Manufacturing (Pty) Ltd', 'owner' => 'Thabo Mokoena', 'status' => 'qa_review', 'stage' => 9, 'current_gate' => 5,
            'health' => 'on_track', 'letter_signed_at' => '2026-04-15 10:00', 'signer_name' => $client->name, 'payment_plan' => 'deposit_milestones',
            'context' => [...TechJourneyController::contextDefaults(), 'legal_name' => 'Acme Manufacturing (Pty) Ltd', 'trading_name' => 'Acme Manufacturing', 'registration' => '2019/123456/07', 'email' => 'info@acmemanufacturing.co.za', 'phone' => '+27 11 123 4567', 'website' => 'www.acmemanufacturing.co.za', 'challenge' => 'We need to automate core processes, integrate systems, and improve data visibility to support growth.', 'platforms' => 'Zoho Books, Gmail, Microsoft 365', 'whatsapp' => ['opt_in' => true, 'since' => '15 May 2026, 09:02']],
            'diagnostic' => ['score' => 72], 'config' => $config, 'fee_lines' => $lines,
            'meters' => ['term_start' => now()->subDays(29)->toDateString(), 'term_end' => now()->addDays(31)->toDateString(), 'cap' => 100000, 'cap_unit' => 'task-runs', 'consumed' => 68200, 'warning' => 80, 'services' => [
                ['service' => 'API Calls', 'sub' => 'Zoho CRM Integration', 'inclusion' => 50000, 'unit' => 'calls', 'used' => 18450],
                ['service' => 'Data Storage', 'sub' => 'Secure Cloud Storage', 'inclusion' => 100, 'unit' => 'GB', 'used' => 42],
                ['service' => 'Document Generation', 'sub' => 'Automated Documents', 'inclusion' => 1000, 'unit' => 'docs', 'used' => 520],
                ['service' => 'Email Sends', 'sub' => 'Transactional Emails', 'inclusion' => 10000, 'unit' => 'emails', 'used' => 3120],
                ['service' => 'SMS Notifications', 'sub' => 'Client Notifications', 'inclusion' => 2000, 'unit' => 'sms', 'used' => 980],
                ['service' => 'Hypercare Support', 'sub' => 'Support Hours (Go-Live)', 'inclusion' => 20, 'unit' => 'hours', 'used' => 12.5],
            ]],
            'uat' => ['cycle' => 'Cycle 1', 'build' => 'v1.2.0-UAT', 'environment' => 'UAT Environment', 'start' => now()->subDays(10)->toDateString(), 'end' => now()->addDays(5)->toDateString(), 'execution' => 'Manual & Automated',
                'towers' => [['tower' => 'CRM & Sales', 'total' => 8, 'passed' => 7, 'failed' => 0, 'blocked' => 1], ['tower' => 'Finance (Zoho Books)', 'total' => 6, 'passed' => 4, 'failed' => 1, 'blocked' => 0], ['tower' => 'People & HR', 'total' => 7, 'passed' => 6, 'failed' => 0, 'blocked' => 1], ['tower' => 'Forms & Approvals', 'total' => 5, 'passed' => 3, 'failed' => 1, 'blocked' => 0], ['tower' => 'Projects', 'total' => 5, 'passed' => 4, 'failed' => 0, 'blocked' => 0], ['tower' => 'Dashboards', 'total' => 5, 'passed' => 4, 'failed' => 0, 'blocked' => 0]],
                'defects_open' => 2, 'critical_open' => 1, 'critical_failed' => 0, 'signoff' => false, 'checks' => ['performance' => true, 'security' => true],
                'testers' => [['John D.', 'Project Manager'], ['Sarah M.', 'Business Analyst'], ['Mark T.', 'Technical Lead']],
                'activity' => [['title' => 'Test Case TC-CRM-008 passed', 'detail' => 'CRM dashboard filters display correctly', 'at' => '15 May 2026, 10:42', 'by' => 'John D.'], ['title' => 'Test Case TC-FIN-004 failed', 'detail' => 'Document upload validation not working', 'at' => '15 May 2026, 09:18', 'by' => 'Sarah M.'], ['title' => 'Issue ISS-002 is blocked', 'detail' => 'Waiting on API response from Data Bank', 'at' => '14 May 2026, 15:33', 'by' => 'Mark T.'], ['title' => 'UAT session started', 'detail' => 'Session: UAT-2026-05-14-01', 'at' => '14 May 2026, 09:00', 'by' => 'System']]],
            'subscription' => ['plan' => 'Professional Plan', 'id' => 'SUB-TBCA-2025-00125', 'status' => 'Active', 'annual_fee' => 24000, 'auto_renew' => true, 'period_start' => now()->subDays(140)->toDateString(), 'period_end' => now()->addDays(225)->toDateString(), 'seats' => 3, 'card' => '4242', 'last_invoice' => 'INV-2025-04521'],
            'exit_plan' => TechWorkflow::defaultExitPlan(now()->addDays(225)),
            'transactions' => [
                ['date' => '2026-04-15', 'type' => 'Invoice', 'ref' => 'INV-2026-0451', 'desc' => 'Deposit (30%) - Gate 1', 'excl' => 109500, 'status' => 'Paid', 'due' => '2026-05-15'],
                ['date' => '2026-04-16', 'type' => 'Payment', 'ref' => 'PAY-2026-0892', 'desc' => 'Payment received - Deposit', 'excl' => -109500, 'status' => 'Paid', 'due' => null],
                ['date' => '2026-05-15', 'type' => 'Invoice', 'ref' => 'INV-2026-0567', 'desc' => 'Gate 4 - Delivery & Validation', 'excl' => 109500, 'status' => 'Paid', 'due' => '2026-06-14'],
                ['date' => '2026-05-15', 'type' => 'Payment', 'ref' => 'PAY-2026-1043', 'desc' => 'Payment received - Gate 4', 'excl' => -109500, 'status' => 'Paid', 'due' => null],
                ['date' => now()->subDays(40)->toDateString(), 'type' => 'Invoice', 'ref' => 'INV-2026-0688', 'desc' => 'Change Order CO-01 - Additional workflows', 'excl' => 21674, 'status' => 'Overdue', 'due' => now()->subDays(10)->toDateString()],
                ['date' => now()->subDays(5)->toDateString(), 'type' => 'Invoice', 'ref' => 'INV-2026-0721', 'desc' => 'Hypercare hours top-up', 'excl' => 12000, 'status' => 'Open', 'due' => now()->addDays(25)->toDateString()],
            ],
            'timeline' => [
                ['at' => '07 May 2026 10:15', 'event' => 'UAT evidence pack uploaded by TBCA', 'by' => 'Thabo Mokoena'],
                ['at' => '05 May 2026 16:42', 'event' => 'Gate 4 approved: Delivery & Validation', 'by' => 'Thabo Mokoena'],
                ['at' => '02 May 2026 09:30', 'event' => 'Configuration locked', 'by' => 'TBCA System'],
                ['at' => '28 Apr 2026 13:20', 'event' => 'Deposit payment verified', 'by' => 'TBCA Finance'],
                ['at' => '21 Apr 2026 11:05', 'event' => 'Kickoff completed', 'by' => 'Thabo Mokoena'],
            ],
        ]);
        $totals = TechContent::ledgerTotals($lines);
        foreach (TechContent::gatePlan($totals) as [$n, $name, $assent, $t, $xl, $xh]) {
            TechGate::updateOrCreate(['engagement_id' => $e->id, 'number' => $n], [
                'name' => $name, 'assent' => $assent, 't_amount_zar' => $t, 'x_low_zar' => $xl, 'x_high_zar' => $xh,
                'status' => $n <= 4 ? 'approved' : ($n === 5 ? 'presented' : 'locked'), 'x_funded' => $n === 3, 'decided_at' => $n <= 4 ? now()->subDays(30 - $n * 5) : null,
                'expires_at' => now()->addDays(14), 'fingerprint' => sprintf('TS1-DEL-%04d-%s', 400 + $n * 7, chr(64 + $n)),
            ]);
        }
        if ($e->tasks()->count() === 0) {
            $tasks = [
                ['client', 'Upload final process maps', 'Acme Operations Lead', -2, 'completed', null, 'Process map pack PDF', 'medium'],
                ['client', 'Confirm user access list', 'Client IT Admin', 2, 'due_soon', 'Required before sandbox setup', 'Signed access matrix', 'high'],
                ['client', 'Review UAT script v1', 'Client Project Sponsor', 3, 'in_progress', 'Depends on test case release', 'UAT sign-off notes', 'high'],
                ['client', 'Approve data migration window', 'CFO', 4, 'waiting_on_client', 'Depends on finance close calendar', 'Approval memo', 'high'],
                ['tbca', 'Configure process automation draft', 'TBCA Solutions Team', 1, 'completed', null, 'Build log', 'medium'],
                ['tbca', 'Prepare dashboard prototype', 'BI Specialist', 4, 'in_progress', 'Needs confirmed KPI list', 'Prototype evidence', 'medium'],
                ['tbca', 'Finalise integration mapping', 'Integration Lead', 5, 'blocked', 'Awaiting client API credentials', 'Mapping workbook', 'high'],
                ['tbca', 'Run UAT readiness review', 'QA Lead', 6, 'pending', 'Depends on completed setup and scripts', 'UAT readiness checklist', 'high'],
                ['dependency', 'API credentials pending from client', 'Client IT Admin', 5, 'blocked', 'Blocks integration mapping and test connection', 'Credential handover record', 'critical'],
                ['dependency', 'Sandbox tenant provisioning', 'Zoho Provider', 6, 'in_progress', 'Blocks user onboarding', 'Provisioning confirmation', 'high'],
                ['dependency', 'Finance close period conflict', 'CFO Office', 6, 'waiting_on_client', 'Delays migration window approval', 'Calendar confirmation', 'medium'],
            ];
            foreach ($tasks as [$g, $title, $owner, $days, $status, $dep, $ev, $prio]) {
                $e->tasks()->create(['group' => $g, 'title' => $title, 'owner' => $owner, 'due_date' => now()->addDays($days), 'status' => $status, 'dependency' => $dep, 'evidence' => $ev, 'priority' => $prio]);
            }
            $docs = [
                ['Company Registration Certificate.pdf', 'Certificate', 'Legal', 'Company Profile', 'John D.', 'Verified', 'Internal', 'v1.0'],
                ['Signed Engagement Letter.pdf', 'Engagement Letter', 'Contract', 'Engagement Letter', 'John D.', 'Signed', 'All Parties', 'v1.2'],
                ['Proof of Payment - Deposit.pdf', 'Proof of Payment', 'Financial', 'Payments', 'John D.', 'Verified', 'Internal', 'v1.0'],
                ['Solution Architecture Scope.docx', 'Scope Document', 'Solution', 'Scope & Deliverables', 'Sarah M.', 'Current', 'All Parties', 'v2.0'],
                ['Data Processing Agreement.pdf', 'Agreement', 'Compliance', 'Compliance', 'Sarah M.', 'Pending Review', 'Internal', 'v1.0'],
                ['KYC Verification Report.pdf', 'Report', 'Compliance', 'Client Verification', 'TBCA System', 'Verified', 'Internal', 'v1.0'],
                ['Technical Requirements Brief.pdf', 'Requirements', 'Technical', 'Implementation', 'Mark T.', 'Current', 'All Parties', 'v1.1'],
                ['Supplier Quote - Zoho One.pdf', 'Quote', 'External Costs', 'External Costs', 'Mark T.', 'Pending Approval', 'Internal', 'v1.0'],
                ['Fee Schedule FS-TS-1.pdf', 'Fee Schedule', 'Financial', 'Fees & Ledgers', 'TBCA System', 'Verified', 'All Parties', 'v1.2'],
                ['UAT Evidence Pack.pdf', 'Evidence Pack', 'Testing', 'UAT & Acceptance', 'Thabo Mokoena', 'Pending Review', 'All Parties', 'v1.0'],
                ['Receipt INV-1023.pdf', 'Receipt', 'Financial', 'Payments', 'TBCA Finance', 'Verified', 'All Parties', 'v1.0'],
                ['Risk Register.xlsx', 'Register', 'Governance', 'Scope & Deliverables', 'Sarah M.', 'Current', 'All Parties', 'v1.3'],
            ];
            foreach ($docs as $i => [$name, $type, $cat, $linked, $by, $status, $vis, $ver]) {
                $e->documents()->create(['name' => $name, 'type' => $type, 'category' => $cat, 'linked_to' => $linked, 'uploaded_by' => $by, 'uploaded_at' => now()->subDays(20 - $i), 'status' => $status, 'visibility' => $vis, 'version' => $ver]);
            }
            $tickets = [
                ['TKT-2026-0152', 'ticket', 'Clarification on Fee Item - API Calls', 'Billing Query', 'Medium', 'In Progress', null, null, 'Lerato M.'],
                ['TKT-2026-0149', 'ticket', 'Document upload issue', 'Technical Support', 'Low', 'Open', null, null, 'Sipho D.'],
                ['TKT-2026-0141', 'ticket', 'Discount not applied to invoice', 'Billing Query', 'High', 'Awaiting Response', null, null, 'You'],
                ['TKT-2026-0137', 'ticket', 'How do I extend my subscription?', 'Account Management', 'Low', 'In Progress', null, null, 'Zanele K.'],
                ['TKT-2026-0130', 'ticket', 'Access to previous statements', 'Account Management', 'Medium', 'Resolved', null, null, 'Resolved'],
                ['DSP-2026-0007', 'dispute', 'Incorrect charge amount', 'Billing Dispute', 'High', 'Under Review', 'Invoice INV-2026-0438', 12750, 'Lerato M.'],
                ['DSP-2026-0003', 'dispute', 'Service not received', 'Billing Dispute', 'Medium', 'Resolved', 'Invoice INV-2026-0401', 5420, 'Lerato M.'],
            ];
            foreach ($tickets as [$ref, $kind, $subject, $cat, $prio, $status, $rel, $amt, $who]) {
                TechTicket::updateOrCreate(['reference' => $ref], ['engagement_id' => $e->id, 'kind' => $kind, 'subject' => $subject, 'category' => $cat, 'priority' => $prio, 'status' => $status, 'related_to' => $rel, 'amount_zar' => $amt, 'assigned_to' => $who]);
            }
        }
    }

    private function techAdmin(): void
    {
        foreach ([
            ['auto_renew_default', 'Auto-Renewal Default', 'Disabled'], ['read_only_days', 'Read-Only Period (Days)', '90'], ['overdue_reminder', 'Overdue Reminder Frequency', 'Every 7 days'],
            ['escalation', 'Notification Escalation', 'After 14 days'], ['retention', 'Document Retention Period', '7 years'], ['dispute_sla', 'Dispute Response SLA', '5 business days'],
            ['currency', 'Default Currency', 'ZAR'], ['tax_display', 'Tax Display Mode', 'Exclusive (separate S ledger)'], ['meter_warning', 'Meter Warning Threshold (%)', '80'],
        ] as [$key, $label, $value]) {
            Setting::firstOrCreate(['key' => $key], ['label' => $label, 'value' => $value]);
        }
        $rules = [
            ['FR-2026-0001', 'Base Fee – Business Systems Discovery', 'TS-1', 'All Sprints', 'Flat Fee', 'active', 'High', 'healthy', 75000, 'Lerato M.'],
            ['FR-2026-0002', 'Tiered Fee – Data Model Build', 'TS-2', 'Data & BI Sprints', 'Tiered', 'active', 'High', 'healthy', null, 'Sipho D.'],
            ['FR-2026-0003', 'Complexity Multiplier – Medium', 'All Towers', 'All Sprints', 'Multiplier', 'active', 'Medium', 'healthy', 1.25, 'Zanele K.'],
            ['FR-2026-0004', 'Urgency Surcharge – 48h', 'All Towers', 'All Sprints', 'Surcharge', 'active', 'Medium', 'warning', 15, 'Mark T.'],
            ['FR-2026-0005', 'Disbursement Pass-Through', 'All Towers', 'All Sprints', 'Pass-Through', 'active', 'Low', 'healthy', 0, 'Lerato M.'],
            ['FR-2026-0006', 'Retainer Discount – Annual', 'TS-6', 'Managed Support', 'Discount', 'draft', 'Medium', 'warning', 12, 'You'],
            ['FR-2026-0007', 'Subscription Monthly Pricing', 'TS-5', 'Portal Subscriptions', 'Recurring', 'active', 'High', 'healthy', 990, 'Sipho D.'],
            ['FR-2026-0008', 'Partner Fee – Advisory Coordination', 'TS-3', 'Advisory Sprints', 'Percentage', 'draft', 'Low', 'healthy', 10, 'Zanele K.'],
            ['FR-2026-0009', 'Metered AI Task-Run Rate', 'TS-3', 'AI Agents', 'Recurring', 'active', 'High', 'healthy', 0.35, 'Mark T.'],
            ['FR-2026-0010', 'Starter Floor – Web Build', 'TS-5', 'Web Sprints', 'Flat Fee', 'draft', 'Medium', 'error', 750, 'Lerato M.'],
        ];
        foreach ($rules as [$code, $name, $tower, $applies, $type, $status, $prio, $health, $value, $by]) {
            FeeRule::updateOrCreate(['code' => $code], ['name' => $name, 'tower' => $tower, 'applies_to' => $applies, 'rule_type' => $type, 'status' => $status, 'priority' => $prio, 'health' => $health, 'value' => $value, 'updated_by' => $by]);
        }
        $sup = [
            ['SUP-2026-0001', 'Zoho Corporation (Reseller)', 'SaaS Licences', 'Zoho One, CRM, Books licences', 'active', '+120 days', 'RC-2026-001', 186500, 200000, 4.5],
            ['SUP-2026-0002', 'Microsoft South Africa', 'SaaS Licences', 'Microsoft 365, Azure', 'active', '+180 days', 'RC-2026-002', 254000, 260000, 5],
            ['SUP-2026-0003', 'Amazon Web Services', 'Cloud Hosting', 'Compute, storage, backups', 'active', '+20 days', 'RC-2026-003', 142250, 130000, 4],
            ['SUP-2026-0004', 'GoDaddy Africa', 'Domain & Email', 'Domains, DNS, SSL', 'active', '+200 days', 'RC-2026-004', 9800, 12000, 4],
            ['SUP-2026-0005', 'PayFast', 'Payment Gateway', 'Card / EFT processing', 'on_hold', '+15 days', 'RC-2026-005', 65450, 70000, 3.5],
            ['SUP-2026-0006', 'UiPath Partner SA', 'Automation Licences', 'RPA bot & orchestrator licences', 'active', '+260 days', 'RC-2026-006', 318900, 320000, 4.5],
            ['SUP-2026-0007', 'Fitch Solutions', 'Data Providers', 'Market intelligence datasets', 'active', '+90 days', 'RC-2026-007', 221000, 240000, 4.5],
            ['SUP-2026-0008', 'SecureOps Cyber', 'Specialist Partner', 'Penetration testing, SOC', 'active', '+25 days', 'RC-2026-008', 108600, 110000, 4],
            ['SUP-2026-0009', 'DocuSign Africa', 'SaaS Licences', 'E-signature envelopes', 'inactive', '-30 days', 'RC-2026-009', 0, 15000, 3.5],
        ];
        foreach ($sup as [$code, $name, $cat, $svc, $status, $end, $rc, $cost, $max, $rating]) {
            Supplier::updateOrCreate(['code' => $code], ['name' => $name, 'category' => $cat, 'services' => $svc, 'status' => $status, 'contract_end' => now()->modify($end)->toDateString(), 'rate_card' => $rc, 'last_cost_zar' => $cost, 'rate_card_max_zar' => $max, 'rating' => $rating]);
        }
        $ex = [
            ['EXC-2026-0043', 'Fees', 'Fee Rule Violation', 'Fee below floor – Sprint TS-5 Starter Web Build', 'High', 'new', 'System', 'Lerato M.', 0, 1],
            ['EXC-2026-0042', 'Suppliers', 'Rate Card Mismatch', 'External cost exceeds rate card – Amazon Web Services', 'High', 'in_review', 'Mark T.', 'Sipho D.', 0, 1],
            ['EXC-2026-0041', 'Engagement', 'Document Missing', 'Signed letter missing for ENG-TS-0991', 'Medium', 'pending_info', 'System', 'Zanele K.', -1, 2],
            ['EXC-2026-0040', 'Pricing', 'Discount Approval', 'Discount > 10% requires approval', 'Medium', 'pending_info', 'You', 'Mark T.', -1, 2],
            ['EXC-2026-0039', 'Suppliers', 'Contract Expiry', 'Contract expiring in 15 days – PayFast', 'Low', 'in_review', 'System', 'Lerato M.', -2, 3],
            ['EXC-2026-0038', 'Engagement', 'Scope Change', 'Scope change not documented – ENG-TS-1042', 'High', 'escalated', 'Zanele K.', 'Thabo R.', -2, -1],
            ['EXC-2026-0037', 'Fees', 'Complexity Modifier', 'Modifier applied without approval', 'Medium', 'pending_info', 'System', 'Sipho D.', -3, -2],
            ['EXC-2026-0036', 'Documents', 'Evidence Incomplete', 'Missing supporting evidence – UAT pack', 'Low', 'new', 'Mark T.', 'Lerato M.', -3, 2],
            ['EXC-2026-0035', 'Fees', 'Fee Rule Violation', 'Pass-through line carries markup', 'High', 'resolved', 'System', 'Lerato M.', -5, -3],
        ];
        foreach ($ex as [$code, $area, $type, $subject, $prio, $status, $by, $to, $raised, $sla]) {
            ExceptionItem::updateOrCreate(['code' => $code], ['area' => $area, 'type' => $type, 'subject' => $subject, 'priority' => $prio, 'status' => $status, 'raised_by' => $by, 'assigned_to' => $to, 'raised_at' => now()->addDays($raised)->setTime(9, 21), 'sla_due' => now()->addDays($sla)->toDateString()]);
        }
    }
}
