<?php

namespace App\Support\Portal\Demo;

use App\Models\Portal\Record;

/**
 * Platform-wide registers used by the /admin/portal consoles and shared client
 * screens (system status, change digest, trust centre). Idempotent.
 */
class DemoGlobal
{
    private static function rec(string $register, string $reference, string $title, string $status, array $data = [], ?int $amount = null, ?int $dueDays = null, int $sort = 0): void
    {
        Record::updateOrCreate(['user_id' => null, 'register' => $register, 'reference' => $reference], [
            'title' => $title, 'status' => $status, 'data' => $data, 'amount_zar' => $amount,
            'due_on' => $dueDays === null ? null : now()->addDays($dueDays), 'sort' => $sort,
        ]);
    }

    public static function seed(): void
    {
        foreach ([
            ['INC-10421', 'Payment Gateway', 'API Failure', 'critical', 'open', -1, 47, 'TBCA Ops'],
            ['INC-10422', 'CRM (Zoho)', 'Sync Delay', 'high', 'investigating', -1, 72, 'IT Support'],
            ['INC-10423', 'WhatsApp', 'Delivery Failure', 'medium', 'in_progress', -1, 123, 'Comms'],
            ['INC-10424', 'Marketplace', 'Data Latency', 'low', 'resolved', -1, 229, 'Integration'],
            ['INC-10401', 'Documents & Files', 'Document Upload Delay', 'minor', 'resolved', -5, 48, 'TBCA Ops'],
            ['INC-10388', 'WhatsApp Comms', 'WhatsApp Delivery Issues', 'minor', 'resolved', -7, 48, 'Comms'],
            ['INC-10372', 'Payments', 'Payment Gateway Timeout', 'major', 'resolved', -10, 79, 'TBCA Ops'],
            ['INC-10355', 'Reports & Dashboards', 'Reports Performance Slowdown', 'minor', 'resolved', -13, 37, 'Analytics'],
        ] as $i => [$ref, $system, $type, $sev, $status, $days, $mins, $owner]) {
            self::rec('incident', $ref, $type, $status, ['system' => $system, 'severity' => $sev, 'opened' => now()->addDays($days)->subHours(2)->toDateTimeString(), 'minutes' => $mins, 'owner' => $owner], null, null, $i);
        }
        self::rec('maintenance', 'MNT-001', 'Routine system maintenance to improve platform performance and security.', 'upcoming', ['window' => '01:00 – 03:00 (SAST)'], null, 3);

        foreach ([
            ['POL-2026-001', 'Core Operating Policy', 'System', 'Tier 1 (N1)', 'active', 'AI Governance Lead'],
            ['POL-2026-002', 'Data Handling & Privacy Policy', 'Compliance', 'Tier 1 (N1)', 'active', 'Privacy Officer'],
            ['POL-2026-003', 'Financial & Legal Boundaries', 'Guardrail', 'Tier 1 (N1)', 'active', 'Legal Counsel'],
            ['POL-2026-004', 'Content Generation Policy', 'Content', 'Tier 2 (N2)', 'active', 'Content Lead'],
            ['POL-2026-005', 'Tool Usage & Access Policy', 'Permission', 'Tier 1 (N1)', 'active', 'CX Manager'],
            ['POL-2026-007', 'Evaluation & Red-Team Policy', 'Quality', 'Tier 2 (N2)', 'inactive', 'QA Lead'],
            ['POL-2026-008', 'Kill Switch & Emergency Policy', 'System', 'Tier 1 (N1)', 'active', 'AI Governance Lead'],
        ] as $i => [$ref, $title, $type, $tier, $status, $by]) {
            self::rec('natasha_policy', $ref, $title, $status, ['type' => $type, 'tier' => $tier, 'by' => $by, 'last_review' => now()->subDays(20 + $i)->toDateString(), 'next_review' => now()->addDays(70 + $i)->toDateString()], null, null, $i);
        }
        if (! Record::whereNull('user_id')->where('register', 'setting')->where('reference', 'natasha_kill_switch')->exists()) {
            self::rec('setting', 'natasha_kill_switch', 'KAREN kill switch', 'off');
        }

        $als = [
            '01' => ['Protected access penetration test', 'Runtime evidence'], '02' => ['Mandatory in-scope UAT executed, zero open P0', 'Runtime evidence'],
            '03' => ['Payment & QBO reconciliation run', 'Runtime evidence'], '04' => ['Delivery & reviewer commitment test', 'Runtime evidence'],
            '05' => ['Identity migration reconciliation', 'Runtime evidence'], '06' => ['Subscription capacity certification', 'Internal certification'],
            '07' => ['Binding fee display certification', 'Internal certification'], '08' => ['Account-state retention exercise', 'Runtime evidence'],
            '09' => ['Rights & withdrawal propagation test', 'Runtime evidence'], '10' => ['Restore & reconciliation exercise', 'Runtime evidence'],
            '11' => ['Continuity / client protection UAT', 'Runtime evidence'], '12' => ['CP-SCR-111..140 field UAT', 'Runtime evidence'],
            '13' => ['Legal opinion – client terms', 'Third-party professional'], '14' => ['Tax opinion – fee namespaces', 'Third-party professional'],
            '15' => ['Configuration state certification', 'Internal certification'], '16' => ['Successor route legal opinion', 'Third-party professional'],
            '17' => ['Upstream machine/agent certificate', 'Upstream certificate'], '18' => ['Privacy opinion (POPIA)', 'Third-party professional'],
            '19' => ['Afrikaans bilingual review sign-off', 'Third-party professional'], '20' => ['External provider dependency test', 'Runtime evidence'],
            '21' => ['Insurance schedule countersigned', 'Third-party professional'], '22' => ['Release governance instrument signed', 'Document artefact'],
            '23' => ['Cutover & rollback plan signed', 'Document artefact'], '24' => ['Exact native vehicle release certificates', 'Upstream certificate'],
        ];
        foreach ($als as $n => [$title, $class]) {
            if (! Record::whereNull('user_id')->where('register', 'als')->where('reference', "CP-ALS-$n")->exists()) {
                self::rec('als', "CP-ALS-$n", $title, in_array($n, ['22', '23'], true) ? 'drafted' : 'not_executed', ['class' => $class], null, null, (int) $n);
            }
        }

        foreach ([
            ['Feasibility Report v2', 'BuildVision Group', 'Due Diligence', -2, 'overdue', 'high', 'Lindiwe Dlamini'],
            ['Financial Model Proof', 'InfraUnity Consortium', 'Financial Close', -1, 'overdue', 'high', 'Thabo Ndlovu'],
            ['Stakeholder Register', 'GreenBuild Projects', 'Execution', 2, 'at_risk', 'medium', 'Sarah Johnson'],
            ['ESG Compliance Pack', 'ProPlan Advisors', 'Advisory', 3, 'at_risk', 'medium', 'Michael Botha'],
            ['Tax Clearance Proof', 'AgriTech SA (Pty) Ltd', 'Financial Close', 6, 'in_progress', 'low', 'John Maseko'],
            ['Deliverable acceptance window', 'Sunrise Property Ventures', 'Advisory', -9, 'satisfied', 'low', 'Nneka Okafor'],
        ] as $i => [$title, $client, $ws, $due, $status, $prio, $owner]) {
            self::rec('promise', 'PRM-2026-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT), $title, $status, ['client' => $client, 'workspace' => $ws, 'priority' => $prio, 'owner' => $owner], null, $due, $i);
        }

        foreach ([
            ['ES-001', 'Client Portal Web Access', 'Web Portal', 'active', 'low', 'T. Mokoena'], ['ES-002', 'WhatsApp Business Channel', 'WhatsApp', 'active', 'medium', 'A. Okafor'],
            ['ES-003', 'Email Intake Gateway', 'Email', 'active', 'medium', 'P. Naidoo'], ['ES-004', 'API Partner Integration', 'API', 'active', 'high', 'R. Dlamini'],
            ['ES-005', 'Marketplace Provider Console', 'Web Portal', 'active', 'low', 'L. Maseko'], ['ES-006', 'Mobile App Entry', 'Mobile App', 'active', 'medium', 'J. van der Merwe'],
            ['ES-007', 'Client Support Ticket Form', 'Web Form', 'active', 'low', 'S. Khan'], ['ES-008', 'SFTP Document Drop', 'SFTP', 'review', 'high', 'R. Dlamini'],
        ] as $i => [$ref, $title, $type, $status, $risk, $owner]) {
            self::rec('entry_surface', $ref, $title, $status, ['channel' => $type, 'risk' => $risk, 'owner' => $owner, 'checked' => now()->subMinutes(30 + $i * 25)->toDateTimeString()], null, null, $i);
        }

        foreach ([
            ['SS-2026-0051', 'Entry Surfaces Console', 'Working on API Partner Integration surface review', 'A. Okafor', 23],
            ['SS-2026-0048', 'Entitlement Decision Console', 'Bulk entitlement decision adjustments', 'T. Mokoena', 22],
            ['SS-2026-0046', 'Finance Reconciliation', 'QB reconciliation – September', 'R. Dlamini', 9],
            ['SS-2026-0042', 'Channel Integrity Console', 'Review of WhatsApp channel events', 'L. Maseko', 7],
            ['SS-2026-0039', 'Reports & Analytics', 'Build management summary report', 'P. Naidoo', 5],
            ['SS-2026-0036', 'Integration & Incidents', 'SFTP incident investigation notes', 'S. Khan', 75],
            ['SS-2026-0031', 'Contract Variations', 'Variation request VAR-2026-00027', 'J. van der Merwe', null],
        ] as $i => [$ref, $area, $desc, $owner, $hours]) {
            self::rec('save_state', $ref, $desc, $hours === null ? 'completed' : 'active', ['area' => $area, 'owner' => $owner, 'saved' => now()->subHours(1 + $i)->toDateTimeString(), 'expires' => $hours === null ? null : now()->addHours($hours)->toDateTimeString()], null, null, $i);
        }

        foreach ([
            ['DOC-2026-0176', 'BuildRight Engineering (Pty) Ltd', 'B-BBEE Certificate', '2.1', 'approved', 250, 'L. Nkosi'],
            ['DOC-2026-0175', 'PrimeSupply Solutions (Pty) Ltd', 'Tax Clearance Certificate', '1.0', 'approved', 15, 'A. Dlamini'],
            ['DOC-2026-0174', 'SecureGuard Security (Pty) Ltd', 'COID Certificate', '1.2', 'pending_review', 60, 'M. Jacobs'],
            ['DOC-2026-0173', 'ElectroTech Systems (Pty) Ltd', 'ISO 9001 Certificate', '3.0', 'approved', 32, 'N. Patel'],
            ['DOC-2026-0172', 'GreenBuild Materials (Pty) Ltd', 'Environmental Compliance Certificate', '1.0', 'expired', -40, 'T. Mokoena'],
            ['DOC-2026-0171', 'Alpha Logistics Services (Pty) Ltd', 'Public Liability Insurance', '1.1', 'pending_review', 54, 'R. Chetty'],
            ['DOC-2026-0170', 'TechWave Consulting (Pty) Ltd', 'Information Security Policy', '2.0', 'approved', null, 'S. Naidoo'],
        ] as $i => [$ref, $vendor, $type, $ver, $status, $exp, $by]) {
            self::rec('vendor_doc', $ref, $type, $status, ['vendor' => $vendor, 'version' => $ver, 'by' => $by], null, $exp, $i);
        }

        foreach ([
            ['SA-DS-2026-0008', 'Successor', 'AgriTech Holdings (Pty) Ltd', 'Lerato Khumalo', 'Spouse', 'All non-financial administrative', 'active', -140, 225],
            ['SA-EST-2026-0005', 'Estate Admin', 'Okoro Family Estate', 'Samuel Okoro Jr.', 'Executor', 'Full administrative including records', 'active', -150, 34],
            ['SA-HEI-2026-0003', 'Heir', 'Ndlovu Family Estate', 'Thandi Ndlovu', 'Child', 'Records view and reporting', 'active', -150, 34],
            ['SA-ADM-2026-0002', 'Administrator', 'Mbeki Trading (Pty) Ltd', 'Nomsa Mbeki', 'Court Appointed', 'Operational administration', 'pending', -160, 20],
            ['SA-DS-2026-0001', 'Successor', 'Zulu Investments (Pty) Ltd', 'Sipho Zulu', 'Son', 'All non-financial administrative', 'expiring', -170, 5],
        ] as $i => [$ref, $type, $for, $delegate, $rel, $scope, $status, $from, $to]) {
            self::rec('successor', $ref, $for, $status, ['type' => $type, 'delegate' => $delegate, 'relation' => $rel, 'scope' => $scope, 'from' => now()->addDays($from)->toDateString()], null, $to, $i);
        }

        foreach ([
            ['CHG-2026-0214', 'Updates to Engagement Letter Terms – Afrikaans (v2.1)', 'CP-SCR-075', 'Content Update', 'Engagement Letter (Afrikaans)', 'medium', -2, 'v2.1'],
            ['CHG-2026-0213', 'Revised Documentation Upload Validation Rules', 'CP-SCR-044', 'Policy Change', 'Document Upload Engine', 'high', -6, 'v3.0'],
            ['CHG-2026-0212', 'WhatsApp Notification Templates – Security Notices', 'CP-SCR-009', 'Template Update', 'WhatsApp Communications', 'low', -9, 'v1.4'],
            ['CHG-2026-0211', 'Privacy Notice – Data Retention Period Clarification', 'CP-SCR-012', 'Policy Change', 'Privacy & Consent', 'high', -13, 'v2.0'],
            ['CHG-2026-0210', 'Enhancement: Save-State Auto Recovery', 'CP-SCR-124', 'Enhancement', 'Save-State & Resume Centre', 'medium', -16, 'v1.1'],
            ['CHG-2026-0209', 'Fix: File Download Timeout on Large Documents', 'CP-SCR-032', 'Bug Fix', 'Document Delivery', 'low', -19, 'v1.2'],
            ['CHG-2026-0215', 'Statement of Account – QuickBooks sync timestamps', 'CP-SCR-027', 'Enhancement', 'Statement of Account', 'medium', 12, 'v1.3'],
        ] as $i => [$ref, $title, $scr, $type, $affects, $impact, $days, $ver]) {
            self::rec('change', $ref, $title, $days > 0 ? 'upcoming' : 'published', ['screen' => $scr, 'type' => $type, 'affects' => $affects, 'impact' => $impact, 'version' => $ver], null, $days, $i);
        }

        foreach ([
            ['We follow a bank-grade security standard', 'Security', 'ISO 27001:2022 Certificate', -20, 345],
            ['Client data is encrypted in transit and at rest', 'Security', 'Security Architecture Review', -27, 338],
            ['No-circumvention: we protect client mandates', 'Governance', 'Policy & Control Framework', -24, 341],
            ['Transparent pricing with no hidden fees', 'Transparency', 'Pricing Policy & Fee Register', -30, 20],
            ['Client data is never sold or shared', 'Privacy', 'Privacy Policy & DPIA', -22, 343],
        ] as $i => [$title, $cat, $source, $verified, $review]) {
            self::rec('claim', 'CLM-'.($i + 1), $title, 'verified', ['category' => $cat, 'source' => $source, 'verified' => now()->addDays($verified)->toDateString()], null, $review, $i);
        }

        foreach ([
            ['WB-2026-021', 'At Risk – High', 'accepted', 128500, -2], ['WB-2026-020', 'At Risk – Medium', 'accepted', 95000, -5],
            ['WB-2026-019', 'Dormant', 'declined', null, -6], ['WB-2026-018', 'At Risk – High', 'pending', null, -7], ['WB-2026-017', 'Dormant', 'accepted', 76250, -8],
        ] as $i => [$ref, $segment, $status, $value, $days]) {
            self::rec('winback', $ref, 'Loyalty review offer', $status, ['segment' => $segment, 'offer' => '10% retainer credit', 'sent' => now()->addDays($days)->toDateString()], $value, null, $i);
        }

        foreach ([
            ['EXC-2026-0521', 'Identity Verification Failure', 'BuildVision Group', 'Lindiwe Dlamini', 'System', 'high', 'pending', 0],
            ['EXC-2026-0520', 'Document Expired', 'AgriTech SA (Pty) Ltd', 'John Maseko', 'TrackChecker', 'medium', 'pending', 1],
            ['EXC-2026-0519', 'POA / Mandate Required', 'InfraUnity Consortium', 'Sarah Johnson', 'Gate Orchestrator', 'high', 'pending', 2],
            ['EXC-2026-0518', 'Duplicate Account Detected', 'ProPlan Advisors', 'Thabo Ndlovu', 'Zoho CRM', 'medium', 'in_review', 2],
            ['EXC-2026-0517', 'Email Domain Unverified', 'GreenBuild Projects', 'info@greenbuildprojects.co.za', 'Gate Orchestrator', 'low', 'pending', 3],
            ['EXC-2026-0516', 'Step-up Verification Failure', 'Zanele Nkosi', 'Zanele Nkosi', 'Mobile App', 'critical', 'escalated', 4],
        ] as $i => [$ref, $type, $org, $subject, $by, $prio, $status, $days]) {
            self::rec('exception', $ref, $type, $status, ['organisation' => $org, 'subject' => $subject, 'raised_by' => $by, 'priority' => $prio, 'raised' => now()->subDays($days)->subHours($i)->toDateTimeString()], null, null, $i);
        }

        foreach ([
            ['RT-001', 'Projects Workspace', 'Workspace', 'Project Advisory', 'active', 'John Maseko', 'Updated'],
            ['RT-002', 'Due Diligence Route', 'Route', 'Due Diligence', 'active', 'Lindiwe Dlamini', 'New'],
            ['WS-003', 'Delivery Workspace', 'Workspace', 'Execution & Delivery', 'active', 'Thabo Ndlovu', 'Updated'],
            ['RT-004', 'Entry-Gate Route', 'Route', 'All Services', 'under_review', 'Sarah Johnson', 'Policy Change'],
            ['WS-005', 'Finance Workspace', 'Workspace', 'Finance & Reconciliation', 'active', 'Michael Botha', 'Updated'],
            ['RT-006', 'Legal Review Route', 'Route', 'Legal Review', 'inactive', 'Nandi Mthethwa', 'Retired'],
            ['WS-007', 'Reports & Analytics', 'Workspace', 'Analytics & Insights', 'active', 'David Peters', 'Updated'],
        ] as $i => [$ref, $title, $type, $product, $status, $owner, $change]) {
            self::rec('route', $ref, $title, $status, ['type' => $type, 'product' => $product, 'owner' => $owner, 'change' => $change], null, null, $i);
        }
    }
}
