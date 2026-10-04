<?php

namespace App\Support\Portal\Demo;

use App\Models\Portal\Deliverable;
use App\Models\Portal\Document;
use App\Models\Portal\EvidenceRequest;
use App\Models\Portal\Membership;
use App\Models\Portal\Organisation;
use App\Models\Portal\Project;
use App\Models\Portal\Task;
use App\Models\User;
use App\Support\Portal\Portal;
use Illuminate\Support\Facades\Storage;

/**
 * Demo data for a client: organisation, team, projects, tasks, deliverables,
 * evidence requests and the document vault. Idempotent.
 */
class DemoClient
{
    public static function seed(User $user): void
    {
        $account = Portal::account($user);
        $org = $account->organisation;
        $org->update([
            'name' => $user->company ? $user->company.' (Pty) Ltd' : $org->name,
            'registration_number' => '2021/987654/07', 'entity_type' => 'Private Company (Pty) Ltd', 'org_type' => 'Corporate',
            'industry' => 'Agriculture Technology & Services', 'website' => 'www.agritechsa.co.za', 'email' => 'info@agritechsa.co.za',
            'phone' => '+27 12 345 6789', 'tax_number' => '9876543210', 'vat_number' => '4123456789', 'incorporated_on' => '2021-03-15',
            'employees' => '51-100', 'revenue_range' => 'R10M - R50M', 'head_office' => 'Pretoria, South Africa', 'verified' => true, 'health_score' => 92,
            'about' => 'AgriTech SA builds precision-agriculture platforms and data services that help South African farmers increase yields, manage water and access finance.',
            'meta' => ['year_established' => 2019, 'compliance' => ['valid' => 7, 'expiring' => 2, 'expired' => 0, 'review' => 1], 'billing' => ['billed' => 12450000, 'paid' => 10560000, 'overdue' => 620000, 'credit' => 0]],
        ]);
        $account->update([
            'onboarding' => ['account_activated' => 'completed', 'identity_verified' => 'completed', 'organisation_matched' => 'completed', 'authority_setup' => 'in_progress',
                'terms_consent' => 'in_progress', 'payment_method' => 'pending', 'service_preferences' => 'completed', 'notifications_setup' => 'completed', 'explore_portal' => 'pending'],
            'mfa_secret' => $account->mfa_secret,
            'password_changed_at' => $account->password_changed_at ?? now()->subMonths(2),
        ]);

        self::team($user, $org);
        self::otherOrganisations($user);
        $projects = self::projects($user, $org);
        self::tasks($user, $projects);
        $docs = self::documents($user, $org, $projects);
        self::deliverables($user, $projects, $docs);
        self::evidence($user, $projects);
    }

    private static function team(User $user, Organisation $org): void
    {
        $members = [
            ['Jane Mensah', 'jane.mensah@agritechsa.co.za', 'Finance Manager', 'Finance', 'finance', 'Finance Access', 'active', true, -1],
            ['Thabo Dlamini', 'thabo.dlamini@agritechsa.co.za', 'Project Manager', 'Delivery', 'project', 'Project Access', 'active', true, -2],
            ['Lerato Mokoena', 'lerato.mokoena@agritechsa.co.za', 'Analyst', 'Strategy', 'analyst', 'Limited Access', 'active', true, -3],
            ['John Maseko', 'john.maseko@agritechsa.co.za', 'Project Manager', 'Delivery', 'project', 'Project Access', 'active', true, -1],
            ['Kgosi Mohapi', 'kgosi.mohapi@agritechsa.co.za', 'Compliance Officer', 'Compliance', 'compliance', 'Compliance Access', 'invited', false, null],
            ['Nandi Zuma', 'nandi.zuma@agritechsa.co.za', 'Viewer', 'Operations', 'viewer', 'Read Only', 'inactive', false, -140],
        ];
        foreach ($members as [$name, $email, $title, $dept, $role, $group, $status, $mfa, $days]) {
            Membership::updateOrCreate(['organisation_id' => $org->id, 'email' => $email], [
                'name' => $name, 'job_title' => $title, 'department' => $dept, 'role' => $role, 'access_group' => $group, 'status' => $status,
                'mfa' => $mfa, 'phone' => '+27 82 '.random_int(100, 999).' '.random_int(1000, 9999), 'invited_by' => $user->name,
                'invited_at' => now()->subDays(3), 'invite_expires_at' => now()->addDays(14),
                'invite_token' => $status === 'invited' ? 'demo-invite-'.substr(md5($email), 0, 16) : null,
                'last_active_at' => $days === null ? null : now()->addDays($days),
            ]);
        }
        Membership::where('organisation_id', $org->id)->where('user_id', $user->id)->update(['job_title' => $user->job_title ?? 'Managing Director', 'department' => 'Executive Management', 'mfa' => true]);
    }

    private static function otherOrganisations(User $user): void
    {
        $orgs = [
            ['ORG-002', 'GreenBuild Solutions (Pty) Ltd', 'Operating Company', 'manager', 'Full Access', 'active', [8920000, 7850000, 210000, 0]],
            ['ORG-003', 'BuildRight Engineering (Pty) Ltd', 'Operating Company', 'viewer', 'Read Only', 'active', [6780000, 5900000, 140000, 50000]],
            ['ORG-004', 'Sunrise Property Ventures (Pty) Ltd', 'Investment Vehicle', 'manager', 'Full Access', 'active', [5140000, 4700000, 75000, 20000]],
            ['ORG-005', 'Waterfront Advisory (Pty) Ltd', 'Special Purpose Vehicle', 'contributor', 'Limited Access', 'active', [2680000, 2350000, 65000, 0]],
            ['ORG-006', 'Infrastructure Partners (Pty) Ltd', 'Partner Entity', 'viewer', 'Read Only', 'active', [1980000, 1620000, 210000, 0]],
            ['ORG-007', 'EduBuild Foundation NPC', 'Non-Profit', 'manager', 'Full Access', 'active', [960000, 900000, 0, 0]],
            ['ORG-008', 'TransAfrica Holdings (Pty) Ltd', 'Holding Company', 'admin', 'Full Access', 'inactive', [0, 0, 0, 0]],
        ];
        foreach ($orgs as [$ref, $name, $type, $role, $group, $status, $b]) {
            $o = Organisation::updateOrCreate(['reference' => $ref.'-'.$user->id], [
                'name' => $name, 'org_type' => $type, 'country' => 'South Africa', 'verified' => true, 'status' => $status,
                'meta' => ['billing' => ['billed' => $b[0], 'paid' => $b[1], 'overdue' => $b[2], 'credit' => $b[3]]],
            ]);
            Membership::updateOrCreate(['organisation_id' => $o->id, 'email' => $user->email], [
                'user_id' => $user->id, 'name' => $user->name, 'role' => $role, 'access_group' => $group,
                'status' => $status === 'active' ? 'active' : 'inactive', 'last_active_at' => now()->subDays(random_int(1, 7)),
            ]);
        }
    }

    /** @return array<string, Project> */
    private static function projects(User $user, Organisation $org): array
    {
        $stages = fn (int $current) => collect(['Intake & Briefing', 'Research & Analysis', 'Draft Development', 'Review & Refinement', 'Finalisation & Delivery'])
            ->map(fn ($s, $i) => ['label' => $s, 'status' => $i + 1 < $current ? 'completed' : ($i + 1 === $current ? 'in_progress' : 'pending'), 'date' => now()->addDays(($i + 1 - $current) * 9)->format('d M')])->all();

        $defs = [
            'INT-2026-0016' => ['Business Plan Development', 'Business Planning', 'advisory', 'in_progress', 'good', 65, 3, 'Kabelo S.', 75000, 37500, 'high', 'Fixed Fee', -24, 30],
            'ENG-2026-0012' => ['Market Entry Strategy – Ghana', 'Strategy', 'advisory', 'in_progress', 'good', 62, 3, 'Tinashe M.', 125000, 77500, 'high', 'Fixed Fee', -60, 18],
            'DD-2026-0007' => ['Due Diligence – Solar Project', 'Due Diligence', 'due-diligence', 'pending_client', 'fair', 30, 2, 'Kabelo S.', 95000, 28500, 'medium', 'Fixed Fee', -20, 45],
            'FS-2026-0021' => ['Feasibility Study – Hospital Project', 'Advisory', 'project-advisory', 'in_progress', 'at_risk', 25, 2, 'Lerato D.', 85000, 21250, 'medium', 'Time & Materials', -10, 55],
            'FIN-2026-0011' => ['Funding & Investor Support', 'Funding', 'advisory', 'in_progress', 'good', 75, 4, 'Noma T.', 55000, 41250, 'medium', 'Fixed Fee', -45, 12],
            'REG-2026-0004' => ['Regulatory & Compliance Support', 'Compliance', 'advisory', 'completed', 'good', 100, 6, 'Nomsa T.', 22000, 22000, 'low', 'Fixed Fee', -90, -5],
        ];

        $out = [];
        foreach ($defs as $ref => [$name, $cat, $ws, $status, $health, $progress, $stage, $mgr, $fee, $billed, $prio, $type, $start, $due]) {
            $out[$ref] = Project::updateOrCreate(['reference' => $ref], [
                'user_id' => $user->id, 'organisation_id' => $org->id, 'name' => $name, 'service' => $name, 'category' => $cat, 'workspace' => $ws,
                'status' => $status, 'health' => $health, 'progress' => $progress, 'current_stage' => $stages(min($stage, 5))[min($stage, 5) - 1]['label'],
                'stages' => $stages($stage), 'manager' => $mgr, 'manager_email' => strtolower(str_replace([' ', '.'], ['.', ''], $mgr)).'@tbca.africa',
                'team' => [['name' => $mgr, 'role' => 'Project Manager'], ['name' => 'Tinashe M.', 'role' => 'Analyst'], ['name' => 'Lerato D.', 'role' => 'Quality Reviewer']],
                'starts_on' => now()->addDays($start), 'due_on' => now()->addDays($due), 'fee_zar' => $fee, 'billed_zar' => $billed,
                'next_invoice_on' => now()->addDays(10), 'priority' => $prio, 'engagement_type' => $type,
                'latest_update' => ['title' => "Draft development is {$progress}% complete.", 'body' => 'The executive summary and market analysis sections have been completed. The financial projections section is in progress.', 'by' => $mgr.' • Project Manager', 'at' => now()->subDays(1)->toDateTimeString()],
                'risks' => $health === 'good' ? [['issue' => 'Client feedback delay on market assumptions', 'impact' => 'Medium', 'status' => 'Monitoring']] : [['issue' => 'Outstanding client evidence holding analysis', 'impact' => 'High', 'status' => 'Open']],
                'meta' => ['milestones' => [
                    ['label' => 'Milestone 3 – Strategy Development', 'date' => now()->addDays(20)->toDateString(), 'amount' => (int) round($fee * 0.28), 'status' => 'upcoming'],
                    ['label' => 'Milestone 4 – Implementation Roadmap', 'date' => now()->addDays(50)->toDateString(), 'amount' => (int) round($fee * 0.36), 'status' => 'upcoming'],
                    ['label' => 'Milestone 5 – Final Delivery & Handover', 'date' => now()->addDays(80)->toDateString(), 'amount' => max(0, $fee - $billed - (int) round($fee * 0.64)), 'status' => 'upcoming'],
                ], 'closure' => $status === 'completed' ? 6 : 5],
            ]);
        }

        return $out;
    }

    private static function tasks(User $user, array $p): void
    {
        $tasks = [
            ['ENG-2026-0012', 'Submit Company Information', 'Provide company profile and documents', 'task', $user->name, 'high', 'in_progress', 3, 60],
            ['DD-2026-0007', 'Due Diligence Report', 'Compile due diligence findings', 'task', 'Kabelo S.', 'high', 'in_progress', 8, 40],
            ['FS-2026-0021', 'Feasibility Study', 'Prepare feasibility analysis', 'task', 'Lerato D.', 'medium', 'not_started', 16, 0],
            ['FIN-2026-0011', 'Investor Presentation', 'Create investor pitch deck', 'task', 'Noma T.', 'medium', 'in_progress', 24, 75],
            ['REG-2026-0004', 'Regulatory Approval', 'Secure regulatory approvals', 'task', 'Nomsa T.', 'high', 'completed', -30, 100],
            ['INT-2026-0016', 'Draft Business Plan', 'Complete first full draft', 'task', $user->name, 'medium', 'in_progress', -2, 20],
            ['INT-2026-0016', 'Financial Model', 'Build three-statement financial model', 'task', 'Tinashe M.', 'medium', 'not_started', 37, 0],
            ['ENG-2026-0012', 'Review market sizing assumptions', 'Confirm addressable market inputs', 'task', $user->name, 'medium', 'not_started', 6, 0],
            ['ENG-2026-0012', 'Project Kick-off', 'Kick-off milestone', 'milestone', 'TBCA', 'high', 'completed', -50, 100],
            ['INT-2026-0016', 'First Deliverable', 'First draft for review', 'milestone', 'TBCA', 'high', 'not_started', 12, 0],
            ['FIN-2026-0011', 'Investment Meeting', 'Investor committee briefing', 'milestone', 'TBCA', 'medium', 'not_started', 32, 0],
            ['DD-2026-0007', 'Final Report', 'Due diligence final report', 'milestone', 'TBCA', 'high', 'not_started', 82, 0],
        ];
        foreach ($tasks as [$ref, $title, $desc, $kind, $who, $prio, $status, $due, $progress]) {
            Task::updateOrCreate(['user_id' => $user->id, 'project_id' => $p[$ref]->id, 'title' => $title], [
                'description' => $desc, 'kind' => $kind, 'assignee' => $who, 'priority' => $prio, 'status' => $status,
                'due_on' => now()->addDays($due), 'progress' => $progress, 'completed_at' => $status === 'completed' ? now()->addDays($due) : null,
            ]);
        }
    }

    /** @return array<string, Document> */
    private static function documents(User $user, Organisation $org, array $p): array
    {
        $folders = [];
        foreach ([['01_Contracts & Engagement Letters', 'ENG-2026-0012', ['Legal', 'Contract']], ['02_Financial Documents', 'INT-2026-0016', ['Finance']], ['03_Technical Reports', 'DD-2026-0007', ['Technical']]] as [$name, $ref, $tags]) {
            $folders[$name] = Document::updateOrCreate(['user_id' => $user->id, 'name' => $name, 'is_folder' => true], [
                'organisation_id' => $org->id, 'project_id' => $p[$ref]->id, 'doc_type' => 'Folder', 'tags' => $tags, 'uploaded_by' => 'Kabelo S.',
            ]);
        }

        $files = [
            ['Company Profile Update.pdf', 'Company Profile', 'INT-2026-0016', null, 2400000, ['Company', 'Profile'], 'Kabelo S.', 2, 18],
            ['Financial Model v3.xlsx', 'Financial', 'INT-2026-0016', '02_Financial Documents', 1700000, ['Finance', 'Model'], 'Tinashe M.', 3, 0],
            ['Engagement Letter - Signed.docx', 'Legal', 'ENG-2026-0012', '01_Contracts & Engagement Letters', 876000, ['Contract', 'Signed'], $user->name, 1, 6],
            ['Tax Clearance Certificate.pdf', 'Compliance', 'REG-2026-0004', null, 1200000, ['Tax', 'Compliance'], $user->name, 1, 2],
            ['Site Photos - Visit 1.jpg', 'Image', 'DD-2026-0007', '03_Technical Reports', 3600000, ['Site', 'Photos'], 'Kabelo S.', 1, 0],
            ["Directors' ID Documents.pdf", 'Legal', 'DD-2026-0007', null, 2100000, ['Legal', 'Directors'], $user->name, 1, 4],
            ['Feasibility Study Appendices.zip', 'Archive', 'FS-2026-0021', null, 12400000, ['Appendix'], 'Lerato D.', 1, 0],
            ['Market Research Report.pdf', 'Report', 'ENG-2026-0012', null, 3100000, ['Research'], 'Tinashe M.', 1, 32],
        ];
        $out = $folders;
        foreach ($files as [$name, $type, $ref, $folder, $size, $tags, $by, $version, $pages]) {
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            $path = 'portal/'.$user->id.'/seed/'.md5($name).'.'.$ext;
            if (! Storage::disk('local')->exists($path)) {
                Storage::disk('local')->put($path, "The Business Clinic.Africa — Client Portal demo document\n\n{$name}\nProject: {$p[$ref]->name}\nUploaded by: {$by}\n");
            }
            $out[$name] = Document::updateOrCreate(['user_id' => $user->id, 'name' => $name, 'is_folder' => false], [
                'organisation_id' => $org->id, 'project_id' => $p[$ref]->id, 'parent_id' => $folder ? $folders[$folder]->id : null,
                'doc_type' => $type, 'extension' => $ext, 'mime' => match ($ext) { 'pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'zip' => 'application/zip', 'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', default => 'application/octet-stream' },
                'size_bytes' => $size, 'path' => $path, 'tags' => $tags, 'version' => $version, 'uploaded_by' => $by,
                'checksum' => hash('sha256', $name), 'description' => 'Updated company profile including latest structure, directors, shareholders and contact details.',
                'access_count' => random_int(1, 9), 'last_accessed_at' => now()->subHours(random_int(1, 72)), 'last_accessed_by' => 'Lerato D.',
                'meta' => ['pages' => $pages, 'versions' => [['version' => $version, 'date' => now()->subDays(5)->toDateString(), 'by' => $by, 'note' => 'Current version']]],
            ]);
        }

        return $out;
    }

    private static function deliverables(User $user, array $p, array $docs): void
    {
        $defs = [
            ['BP-2026-0016', 'Business Plan – Final Report', 'INT-2026-0016', 'Report', '2.1', 'qa_approved', 'delivered', 'pending', 'approval', -3, 27, 48, 2400],
            ['ME-2026-0012', 'Market Analysis Report', 'ENG-2026-0012', 'Report', '1.0', 'qa_approved', 'delivered', 'pending', 'review', -5, 9, 32, 3100],
            ['FM-2026-0031', 'Financial Model v3.1', 'INT-2026-0016', 'Model', '3.1', 'qa_approved', 'delivered', 'accepted', 'acceptance', -12, -2, 0, 1700],
            ['ID-2026-0012', 'Investment Deck', 'FIN-2026-0011', 'Presentation', '1.2', 'in_qa', 'in_review', 'pending', 'approval', 0, 20, 24, 5200],
            ['DD-2026-0007', 'Due Diligence Summary', 'DD-2026-0007', 'Report', '1.0', 'corrections', 'changes_required', 'corrections_requested', 'acceptance', -8, 15, 18, 1800],
            ['EL-2026-0042', 'Engagement Letter – Signed', 'ENG-2026-0012', 'Document', '1.0', 'qa_approved', 'delivered', 'accepted', 'approval', -40, -30, 6, 876],
            ['RA-2026-0009', 'Risk Assessment Report', 'DD-2026-0007', 'Report', '1.1', 'qa_approved', 'delivered', 'pending', 'acceptance', -2, 28, 22, 1400],
            ['SD-2026-0014', 'Supporting Documents Pack', 'ENG-2026-0012', 'Archive', '1.0', 'qa_approved', 'delivered', 'accepted', 'review', -20, -6, 0, 9800],
            ['CF-2026-0003', 'Cash Flow Forecast', 'FIN-2026-0011', 'Model', '2.0', 'corrections', 'changes_required', 'pending', 'acceptance', -6, 10, 0, 640],
            ['PE-2026-0002', 'Project Execution Plan', 'FS-2026-0021', 'Document', '0.9', 'in_qa', 'in_review', 'pending', 'review', 0, 30, 14, 950],
        ];
        foreach ($defs as [$ref, $title, $proj, $type, $ver, $qa, $release, $accept, $decision, $rel, $due, $pages, $kb]) {
            Deliverable::updateOrCreate(['user_id' => $user->id, 'reference' => $ref], [
                'project_id' => $p[$proj]->id, 'title' => $title, 'type' => $type, 'format' => $type === 'Model' ? 'XLSX' : ($type === 'Archive' ? 'ZIP' : ($type === 'Presentation' ? 'PPTX' : 'PDF')),
                'version' => $ver, 'qa_state' => $qa, 'release_state' => $release, 'acceptance_state' => $accept, 'decision_type' => $decision,
                'released_at' => in_array($release, ['delivered', 'release_approved'], true) ? now()->addDays($rel) : null, 'acceptance_due_on' => now()->addDays($due),
                'decided_at' => $accept === 'accepted' ? now()->addDays($rel + 2) : null,
                'file_name' => str_replace([' ', '–'], ['_', '-'], $title).'_v'.$ver.'.'.strtolower($type === 'Model' ? 'xlsx' : 'pdf'), 'size_kb' => $kb, 'pages' => $pages,
                'checksum' => substr(hash('sha256', $ref), 0, 24), 'tags' => [$type, 'Strategic'],
                'topics' => ['Executive Summary', 'Market Analysis', 'Strategic Plan', 'Operational Plan', 'Financial Projections', 'Risk Assessment'],
                'versions' => [['version' => $ver, 'state' => 'Released', 'date' => now()->addDays($rel)->toDateString(), 'pages' => $pages, 'size' => $kb, 'by' => 'Kabelo S.', 'note' => 'Includes client feedback updates.'],
                    ['version' => number_format((float) $ver - 0.1, 1), 'state' => 'Superseded', 'date' => now()->addDays($rel - 14)->toDateString(), 'pages' => max(0, $pages - 2), 'size' => (int) ($kb * 0.9), 'by' => 'Kabelo S.', 'note' => 'Initial draft after internal review.']],
                'description' => 'Prepared by the TBCA Advisory Team, incorporating all feedback and updated projections.',
                'document_id' => $title === 'Business Plan – Final Report' ? ($docs['Company Profile Update.pdf']->id ?? null) : null,
            ]);
        }
    }

    private static function evidence(User $user, array $p): void
    {
        $defs = [
            ['Company Registration Certificate', 'Certified copy of company registration certificate.', 'ENG-2026-0012', 'Kabelo S.', 'high', 2, 'pending', 0],
            ['Latest Financial Statements (FY2025)', 'Audited financial statements for the last 2 years.', 'INT-2026-0016', 'Lerato D.', 'high', 4, 'pending', 25],
            ["Directors' ID Documents", 'Certified copies of ID/passport for all directors.', 'DD-2026-0007', 'Tinashe M.', 'medium', -3, 'submitted', 100],
            ['Tax Clearance Certificate', 'Valid SARS tax clearance certificate.', 'REG-2026-0004', 'Noma T.', 'high', -5, 'pending', 0],
            ['Shareholding Structure', 'Current shareholding structure and register.', 'FIN-2026-0011', 'Noma T.', 'medium', 9, 'pending', 10],
            ['Environmental Compliance Proof', 'Environmental authorisation or exemption letter.', 'FS-2026-0021', 'Lerato D.', 'low', -1, 'submitted', 100],
        ];
        foreach ($defs as [$title, $desc, $ref, $by, $prio, $due, $status, $progress]) {
            EvidenceRequest::updateOrCreate(['user_id' => $user->id, 'title' => $title], [
                'project_id' => $p[$ref]->id, 'description' => $desc, 'requested_by' => $by, 'requested_on' => now()->subDays(10),
                'priority' => $prio, 'due_on' => now()->addDays($due), 'status' => $status, 'progress' => $progress,
                'submitted_at' => $status === 'submitted' ? now()->subDays(2) : null,
            ]);
        }
    }
}
