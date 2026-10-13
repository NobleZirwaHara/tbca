<?php

namespace Database\Seeders\Sections;

use App\Models\DealRoom\Room;
use App\Models\User;
use App\Support\DealRoom\Pricing;
use App\Support\DealRoom\Rooms;
use App\Support\DealRoom\Stages;
use App\Support\DealRoom\Workflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Demo Virtual Deal Rooms for amahle@agritechsa.co.za:
 *  - "Baobab Capital Raise" mid-way at Stage 10 (offer and term-sheet management)
 *  - "AgriTech SA Growth Raise" at Stage C (quotation issued, awaiting acceptance)
 * Idempotent: each room's child records are rebuilt on every run.
 */
class DealRoomSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(['email' => 'amahle@agritechsa.co.za'], [
            'name' => 'Amahle Dlamini', 'password' => 'Password123!', 'client_id' => 'TBCA-C-000001', 'role' => 'client', 'company' => 'AgriTech SA', 'country' => 'ZA',
        ]);

        // Demo external party (investor) to exercise role-based access, NDA gate and buyer sign-off.
        User::updateOrCreate(['email' => 'david@frontiercap.mu'], [
            'name' => 'David M.', 'password' => 'Password123!', 'client_id' => 'TBCA-C-000901', 'role' => 'client', 'company' => 'Frontier Capital Partners', 'country' => 'MU',
        ]);

        $this->baobab($user);
        $this->agritech($user);
    }

    protected function reset(User $user, string $slug, array $attrs): Room
    {
        $room = Room::updateOrCreate(['slug' => $slug], [...$attrs, 'user_id' => $user->id, 'paused_at' => null, 'paused_reason' => null]);
        foreach (['events', 'usage', 'requests', 'approvals', 'items', 'conditions', 'offers', 'questions', 'accessLogs', 'documents', 'folders', 'parties', 'stages'] as $rel) {
            $room->{$rel}()->delete();
        }
        $room->charges()->delete();
        Storage::disk('local')->deleteDirectory("vdr/{$room->id}");

        return $room;
    }

    protected function diagnosticAnswers(): array
    {
        $answers = [];
        $pattern = ['3', '3', '2', '3'];
        foreach (Pricing::diagnosticSections() as $key => $s) {
            foreach (array_keys($s['questions']) as $i => $q) {
                $answers[$key][$q] = $key === 'legal' && $i > 1 ? '1' : $pattern[$i];
            }
        }

        return $answers;
    }

    protected function baobab(User $user): void
    {
        $room = $this->reset($user, 'baobab-capital-raise', [
            'reference' => 'DR-2025-000128',
            'name' => 'Baobab Capital Raise',
            'company' => 'Baobab Growth Holdings',
            'country' => 'South Africa',
            'sector' => 'Financial Services / Fintech',
            'deal_type' => 'fundraising',
            'transaction_type' => 'Private Equity (PE) Investments',
            'objective' => 'Raise growth capital to expand our digital lending platform across Africa and strengthen product capabilities.',
            'amount_zar' => 150_000_000,
            'target_close_date' => now()->addMonths(2)->toDateString(),
            'current_stage' => '10',
            'status' => 'active',
            'enquiry' => [
                'transaction_type' => 'Private Equity (PE) Investments', 'transaction_group' => 'Capital Raising & Financing', 'objective' => 'Raise growth capital to expand our digital lending platform across Africa',
                'raise_band' => 'RAISE_100M_500M', 'raise_band_min_zar' => 100_000_000, 'raise_band_max_zar' => 500_000_000,
                'company' => 'Baobab Growth Holdings', 'jurisdiction' => 'South Africa', 'sector' => 'Financial Services / Fintech', 'website' => 'https://www.baobabgrowth.africa',
                'employees' => '51 - 200', 'revenue' => 'R50m - R200m', 'name' => 'Aisha Sekele', 'email' => 'aisha@baobabcap.com', 'role' => 'Founder / CEO', 'current_stage' => 'Preparation',
                'score' => 85, 'submitted_at' => now()->subDays(40)->toIso8601String(),
                'checks' => [
                    ['label' => 'Conflict of Interest Check', 'result' => 'Passed'], ['label' => 'Sanctions & Watchlist Screening', 'result' => 'Passed'],
                    ['label' => 'Adverse Media Screening', 'result' => 'Passed'], ['label' => 'Preliminary AML Risk Check', 'result' => 'Low Risk'], ['label' => 'Data Privacy Compliance Check', 'result' => 'Passed'],
                ],
            ],
            'diagnostic' => ['answers' => $this->diagnosticAnswers(), 'saved_at' => now()->subDays(36)->toIso8601String()],
            'commercial' => [
                'quote_accepted_at' => now()->subDays(33)->toIso8601String(), 'quote_reference' => 'QTE-2025-000128', 'fee_ack_at' => now()->subDays(33)->toIso8601String(),
                'scope_accepted_at' => now()->subDays(32)->toIso8601String(), 'signatory' => 'Aisha Sekele', 'signatory_role' => 'CEO & Deal Sponsor',
                'engagement_signed_at' => now()->subDays(32)->toIso8601String(), 'deposit_paid_at' => now()->subDays(31)->toIso8601String(),
            ],
            'setup' => [
                'template' => 'fundraising', 'created_at' => now()->subDays(30)->toIso8601String(),
                'modules' => array_slice(\App\Http\Controllers\DealRoom\SetupController::MODULES, 0, 9), 'ai_tools' => \App\Http\Controllers\DealRoom\SetupController::AI_TOOLS,
                'draft' => ['name' => 'Baobab Capital Raise', 'role' => 'Founder / Seller', 'deal_type' => 'fundraising', 'company' => 'Baobab Growth Holdings', 'country' => 'South Africa', 'sector' => 'Financial Services / Fintech', 'objective' => 'Raise growth capital to expand our digital lending platform across Africa and strengthen product capabilities.', 'deal_stage' => 'Preparation', 'participants' => 12, 'language' => 'English'],
            ],
            'security' => Rooms::defaultSecurity(),
            'plan' => ['name' => 'TBCA Growth Raise Plan — Standard', 'storage_offset_gb' => 38],
            'state' => [
                'negotiation' => ['buyer' => 'approved', 'seller' => 'approved', 'outcome' => 'agreed', 'closed_at' => now()->subDays(6)->toIso8601String()],
            ],
        ]);

        // Stages A..9 completed, 10 unlocked.
        $current = Stages::index('10');
        foreach (Stages::codes() as $i => $code) {
            $def = Stages::get($code);
            $room->stages()->create([
                'code' => $code,
                'status' => $i < $current ? 'completed' : ($i === $current ? 'unlocked' : 'locked'),
                'checks' => $i < $current ? array_fill_keys(array_keys($def['checks'] ?? []), true) : null,
                'unlocked_at' => $i <= $current ? now()->subDays(40 - $i * 2) : null,
                'completed_at' => $i < $current ? now()->subDays(39 - $i * 2) : null,
                'completed_by' => $i < $current ? 'John Dlamini' : null,
            ]);
            foreach ($def['approvals'] ?? [] as [$name, $role]) {
                if ($i <= $current) {
                    $room->approvals()->create(['subject' => 'stage:'.$code, 'approver' => $name, 'approver_role' => $role, 'status' => $i < $current ? 'approved' : 'pending', 'decided_by' => $i < $current ? $name : null, 'decided_at' => $i < $current ? now()->subDays(39 - $i * 2) : null]);
                }
            }
        }
        // Stage 10: sponsor commercial approval already recorded, legal review pending.
        $room->approvals()->where('subject', 'stage:10')->where('approver', 'Aisha Sekele')->update(['status' => 'approved', 'decided_by' => 'Aisha Sekele', 'decided_at' => now()->subDay()]);

        // Charges: deposit and stage fees paid.
        $mk = fn ($kind, $suffix, $desc, $lines, $stage, $daysAgo) => $room->charges()->create([
            'reference' => "INV-2025-000128-{$suffix}", 'kind' => $kind, 'stage_code' => $stage, 'description' => $desc,
            'lines' => array_map(fn ($l) => [...$l, 'vat' => Pricing::vat($l['net'])], $lines),
            'net_zar' => array_sum(array_column($lines, 'net')), 'vat_zar' => Pricing::vat(array_sum(array_column($lines, 'net'))),
            'total_zar' => array_sum(array_column($lines, 'net')) + Pricing::vat(array_sum(array_column($lines, 'net'))),
            'status' => 'paid', 'paid_at' => now()->subDays($daysAgo), 'created_at' => now()->subDays($daysAgo), 'due_date' => now()->subDays($daysAgo),
        ]);
        $mk('deposit', 'D1', 'Activation deposit — mandate activation and Stage 0 entitlement', Pricing::depositLines(), 'C', 31);
        foreach (['6' => 'S1', '7' => 'S2', '9' => 'S3'] as $code => $sfx) {
            $f = Stages::get($code)['fee'];
            $mk('stage_fee', $sfx, $f['name'], [['category' => 'TBCA Expert Fee', 'item' => $f['code'].' '.$f['name'], 'provider' => 'TBCA', 'net' => $f['net']]], $code, 20 - (int) $code);
        }

        // Parties
        $parties = [
            [$user->name, $user->email, 'Baobab Growth Holdings', 'owner', null, 'South Africa', 'full', 'active', null],
            ['Aisha Sekele', 'aisha@baobabcap.com', 'Baobab Growth Holdings', 'owner', null, 'South Africa', 'full', 'active', null],
            ['John Dlamini', 'john.dlamini@thebusinessclinic.africa', 'The Business Clinic.Africa', 'tbca_advisor', null, 'South Africa', 'full', 'active', null],
            ['Michael Tumi', 'michael.tumi@baobabgrowth.co.za', 'Baobab Growth Holdings', 'finance', null, 'South Africa', 'full', 'active', null],
            ['Lerato Pillay', 'lerato.pillay@baobabgrowth.co.za', 'Baobab Growth Holdings', 'legal', null, 'South Africa', 'full', 'active', null],
            ['David M.', 'david@frontiercap.mu', 'Frontier Capital Partners', 'investor', 'Frontier Capital Partners', 'Mauritius', 'full', 'active', 92],
            ['Sarah L.', 'sarah@heliosgrowth.co.uk', 'Helios Growth Fund', 'investor', 'Helios Growth Fund', 'United Kingdom', 'full', 'active', 89],
            ['Pieter van Wyk', 'pieter@paif.co.za', 'Pan-African Infrastructure Fund', 'investor', 'Pan-African Infrastructure Fund', 'South Africa', 'qa_only', 'active', 87],
            ['Wei Tan', 'wei@empartners.sg', 'Emerging Markets Partners', 'investor', 'Emerging Markets Partners', 'Singapore', 'view_only', 'invited', 85],
            ['Nomsa Khumalo', 'nomsa@dbsa-sf.co.za', 'DBSA Structured Finance', 'lender', 'DBSA Structured Finance', 'South Africa', 'full', 'active', 90],
            ['De Wet K.', 'dewet@dewetpartners.co.za', 'De Wet & Partners', 'advisor', 'De Wet & Partners', 'South Africa', 'full', 'active', 91],
        ];
        foreach ($parties as $i => [$name, $email, $org, $role, $group, $jur, $level, $status, $score]) {
            if ($role === 'owner' && $email !== $user->email) {
                $role = 'legal'; // Aisha is the sponsor principal; the platform owner is the account holder.
                $level = 'full';
            }
            $room->parties()->create([
                'user_id' => $email === $user->email ? $user->id : User::where('email', $email)->value('id'), 'name' => $name, 'email' => $email, 'organisation' => $org, 'role' => $role,
                'group_name' => $group, 'jurisdiction' => $jur, 'access_level' => $level, 'status' => $status, 'qualification_score' => $score,
                'invited_at' => now()->subDays(22), 'invite_expires_at' => now()->addDays(7), 'invite_token' => $status === 'invited' ? Str::random(40) : null,
                'accepted_at' => $status === 'active' ? now()->subDays(20) : null, 'nda_accepted_at' => $status === 'active' ? now()->subDays(20) : null,
                'last_access_at' => $status === 'active' ? now()->subHours($i * 5) : null,
            ]);
        }

        // Folders and documents (small files stored on the private disk so download controls can be exercised).
        $docs = [
            1 => [['Teaser Memo v2.pdf', 'Operational & Commercial', 98], ['Company Profile 2025.pdf', 'Operational & Commercial', 95]],
            2 => [['Financial Projections FY2024_Final.xlsx', 'Financial', 96], ['Audited Financial Statements FY2024.pdf', 'Financial', 97], ['Management Report FY2024.pdf', 'Financial', 94], ['Auditor Report FY2024.pdf', 'Financial', 95]],
            3 => [['Shareholders Register.pdf', 'Legal & Corporate', 92], ['Corporate Structure.pdf', 'Legal & Corporate', 95], ['Board Resolution Authorising Raise.pdf', 'Legal & Corporate', 91]],
            4 => [['Material Contracts Schedule.pdf', 'Operational & Commercial', 90]],
            5 => [['Cap Table May 2025.xlsx', 'Financial', 93]],
            7 => [['Trade Licences.pdf', 'Legal & Corporate', 90], ['Risk Register.xlsx', 'Governance & Compliance', 88]],
        ];
        foreach (Rooms::FOLDERS as $i => $name) {
            $folder = $room->folders()->create(['position' => $i + 1, 'name' => $name, 'staged' => true, 'released_at' => $i < 5 ? now()->subDays(20) : null]);
            foreach ($docs[$i + 1] ?? [] as [$file, $cat, $conf]) {
                $path = "vdr/{$room->id}/".Str::slug(pathinfo($file, PATHINFO_FILENAME)).'.txt';
                $content = "{$file}\nBaobab Growth Holdings — Virtual Deal Room DR-2025-000128\nCONFIDENTIAL. Demo placeholder for the seeded data room.\n";
                Storage::disk('local')->put($path, $content);
                $room->documents()->create([
                    'folder_id' => $folder->id, 'uploaded_by' => $user->id, 'name' => $file, 'path' => $path, 'size' => 1_200_000 + crc32($file) % 1_400_000,
                    'mime' => 'text/plain', 'version' => 1, 'sha256' => hash('sha256', $content), 'category' => $cat, 'confidence' => $conf,
                    'review_status' => $i < 5 ? 'released' : 'approved', 'pages' => 12 + crc32($file) % 30, 'created_at' => now()->subDays(26),
                ]);
            }
        }

        // Access log
        $docIds = $room->documents()->pluck('id');
        foreach (range(1, 24) as $n) {
            $room->accessLogs()->create(['user_id' => $user->id, 'document_id' => $docIds[$n % $docIds->count()], 'action' => 'view', 'watermark' => 'CONFIDENTIAL · david@frontiercap.mu', 'created_at' => now()->subHours($n * 6)]);
        }

        // Q&A
        $qa = [
            ['What is the company\'s revenue for the last 3 years?', 'Baobab Growth Holdings generated revenue of ZAR 272.0m in FY2024, an increase of 32% from ZAR 206.1m in FY2023. The growth was driven by strong performance in the Agriculture and Processing segments.', [['name' => 'Financial Projections FY2024_Final.xlsx', 'folder' => '02. Financial Information', 'page' => 12], ['name' => 'Management Report FY2024.pdf', 'folder' => '02. Financial Information', 'page' => 5], ['name' => 'Auditor Report FY2024.pdf', 'folder' => '02. Financial Information', 'page' => 3]], 92, 'David M.'],
            ['Show the latest audited financial statements.', 'The FY2024 audited financial statements are available in 02. Financial Information.', [['name' => 'Audited Financial Statements FY2024.pdf', 'folder' => '02. Financial Information', 'page' => 1]], 97, 'Sarah L.'],
            ['Summarise the use of proceeds.', 'Proceeds of ZAR 150.0m fund growth and expansion of the digital lending platform across Africa, per the Teaser Memo.', [['name' => 'Teaser Memo v2.pdf', 'folder' => '01. Company Overview', 'page' => 4]], 88, 'Nomsa Khumalo'],
            ['What are the material contracts?', 'The material contracts schedule lists the key customer, funding and technology agreements.', [['name' => 'Material Contracts Schedule.pdf', 'folder' => '04. Commercial & Operations', 'page' => 2]], 90, 'De Wet K.'],
        ];
        foreach ($qa as [$q, $a, $src, $conf, $by]) {
            $room->questions()->create(['asked_by' => $by, 'question' => $q, 'answer' => $a, 'sources' => $src, 'confidence' => $conf, 'status' => 'answered', 'answered_by' => 'AI Q&A Assistant (human approved)', 'answered_at' => now()->subDays(12)]);
        }

        // Offers TS-01..TS-05
        $offers = [
            ['TS-01', 'Initial Sponsor Position', 'sponsor', 'Aisha Sekele', 820_000_000, 15.0, 'DD + Board Approval', ['liquidation' => '1.5x Non-Participating', 'board' => '1 of 5 Seats', 'exclusivity' => '45 days']],
            ['TS-02', 'Investor Offer', 'investor', 'David M.', 760_000_000, 16.5, 'DD + Legal Review', ['liquidation' => '1x Non-Participating', 'board' => '1 of 5 Seats', 'exclusivity' => '45 days']],
            ['TS-03', 'Sponsor Counteroffer', 'sponsor', 'Aisha Sekele', 800_000_000, 15.8, 'DD + Board Approval', ['liquidation' => '1.5x Non-Participating', 'board' => '1 of 5 Seats', 'exclusivity' => '45 days']],
            ['TS-04', 'Revised Investor Offer', 'investor', 'David M.', 780_000_000, 16.2, 'DD + Legal Review', ['liquidation' => '1x Non-Participating', 'board' => '1 of 5 Seats', 'exclusivity' => '45 days']],
            ['TS-05', 'Active Negotiated Version', 'investor', 'Sarah L.', 790_000_000, 15.6, 'DD + Board Approval', ['liquidation' => '1.25x Non-Participating', 'board' => '1 of 5 Seats', 'exclusivity' => '45 days']],
        ];
        foreach ($offers as $i => [$v, $label, $side, $by, $val, $eq, $cond, $terms]) {
            $room->offers()->create(['version' => $v, 'label' => $label, 'side' => $side, 'submitted_by' => $by, 'valuation_zar' => $val, 'investment_zar' => 150_000_000, 'equity_pct' => $eq, 'key_condition' => $cond, 'terms' => $terms, 'status' => $i === 4 ? 'active' : 'superseded', 'created_at' => now()->subDays(12 - $i * 2)]);
        }

        // Registers for upcoming stages (legal, CPs, signing, handover) and the live-negotiation action register.
        $item = fn ($kind, $pos, $title, $owner, $status, $due = null, $meta = []) => $room->items()->create(['kind' => $kind, 'position' => $pos, 'title' => $title, 'owner' => $owner, 'status' => $status, 'due_date' => $due, 'meta' => $meta ?: null]);
        foreach ([['Share revised financial model', 'Sipho K.', 'in_progress'], ['Confirm legal structure', 'Thandi N.', 'completed'], ['Provide DD checklist', 'David M.', 'in_progress'], ['Resolve term sheet draft', 'Leando M.', 'pending']] as $i => [$t, $o, $s]) {
            $item('action', $i + 1, $t, $o, $s, now()->addDays($i + 1)->toDateString());
        }
        foreach ([['Share Subscription Agreement', 'v3.2', 'in_review', 'Lerato Pillay', 38], ['Shareholders\' Agreement', 'v2.1', 'drafting', 'External Counsel', 42], ['Term Sheet (Binding Heads)', 'v1.0', 'finalised', 'John Dlamini', 12], ['Disclosure Schedule', 'v1.4', 'in_review', 'Legal Team', 25], ['Warranties & Representations', 'v2.0', 'drafting', 'External Counsel', 31], ['Data Room Access Agreement', 'v1.0', 'finalised', 'Legal Team', 6], ['Board Resolutions', 'v1.1', 'in_review', 'Michael Tumi', 8]] as $i => [$t, $v, $s, $o, $pages]) {
            $item('legal_doc', $i + 1, $t, $o, $s, null, ['version' => $v, 'pages' => $pages, 'hash' => $s === 'finalised' ? hash('sha256', $t) : null]);
        }
        foreach ([['Limit on indemnity cap (Clause 9.4)', 'De Wet K.', 'open', 'High'], ['Drag along threshold (Clause 12.2)', 'Sarah L.', 'in_review', 'Medium'], ['Information rights scope (Clause 8.3)', 'David M.', 'open', 'Low'], ['Confidentiality carve-outs (Clause 15.1)', 'Lerato P.', 'open', 'Medium'], ['Governing law jurisdiction (Clause 18.2)', 'Leando M.', 'resolved', 'Low']] as $i => [$t, $o, $s, $sev]) {
            $item('legal_issue', $i + 1, $t, $o, $s, null, ['severity' => $sev]);
        }
        foreach ([['Aisha Sekele (Sponsor)', 'Sponsor Authorised Signatory'], ['David M. (Investor)', 'Investor Authorised Signatory'], ['John Dlamini (TBCA Deal Advisor)', 'TBCA Deal Advisor Attestation'], ['Lerato Pillay (Legal Counsel)', 'Legal Counsel Confirmation'], ['Michael Tumi (Finance Lead)', 'Financial Close Confirmation']] as $i => [$t, $role]) {
            $item('signature', $i + 1, $t, $role, 'waiting');
        }
        foreach ([['Closing Pack', 'Aisha Sekele'], ['Executed Agreements', 'Michael Tumi'], ['Funds-Flow Evidence', 'Lerato Pillay'], ['Completion Certificate', 'John Dlamini'], ['Board Resolutions', 'Sarah L.'], ['Cap Table Update', 'Michael Tumi'], ['Regulatory Filings', 'Sipho K.'], ['Investor Communications Pack', 'Aisha Sekele']] as $i => [$t, $o]) {
            $item('handover', $i + 1, $t, $o, 'scheduled');
        }
        foreach ([['Governance & Board Integration', 'Aisha Sekele', 'High'], ['Capital Deployment', 'Lerato Pillay', 'High'], ['Finance & Reporting', 'Michael Tumi', 'High'], ['Product & Data Roadmap', 'Sipho K.', 'Medium'], ['HR & Operating Model', 'Aisha Sekele', 'Medium'], ['Compliance & Regulatory', 'John Dlamini', 'Medium'], ['Investor Reporting', 'Lerato Pillay', 'Medium']] as $i => [$t, $o, $p]) {
            $item('workstream', $i + 1, $t, $o, 'planned', null, ['priority' => $p, 'progress' => 0]);
        }
        foreach ([['Tax Authority Clarification', 'John Dlamini', 'Medium'], ['Integration Data Migration', 'Sipho K.', 'Medium'], ['Investor Portal Access', 'Aisha Sekele', 'Low']] as $i => [$t, $o, $sev]) {
            $item('post_close_risk', $i + 1, $t, $o, 'open', null, ['severity' => $sev]);
        }

        // Conditions precedent
        $cps = [
            ['Shareholder Approval (Special Resolution)', 'Corporate', 'Lerato Pillay', 'satisfied', 'Board Res. v1.0', true],
            ['Competition Authority Approval', 'Regulatory', 'Thandi Maseko', 'in_progress', 'Draft Filing', false],
            ['FSP Licence Variation', 'Regulatory', 'Sipho Dlamini', 'in_progress', 'Application v1.1', false],
            ['Material Contracts Consents', 'Commercial', 'Michael Tumi', 'satisfied', 'Consents Pack', true],
            ['Bank Waiver (Leverage Covenant)', 'Financing', 'Sipho K.', 'satisfied', 'Bank Waiver', true],
            ['Tax Clearance Certificate', 'Tax', 'External Counsel', 'in_progress', 'Certificate Draft', false],
            ['Environmental Compliance', 'Regulatory', 'Leando M.', 'in_progress', 'Report Draft', false],
            ['Insurance Cover Confirmation', 'Commercial', 'Sipho K.', 'satisfied', 'Insurance Cert.', true],
            ['Litigation Disclosure', 'Legal', 'Lerato Pillay', 'satisfied', 'Disclosure v2.0', true],
            ['Investor KYC Completed', 'Investor', 'John Dlamini', 'satisfied', 'KYC Dossier', true],
        ];
        foreach ($cps as $i => [$c, $cat, $owner, $status, $ev, $val]) {
            $room->conditions()->create(['number' => $i + 1, 'condition' => $c, 'category' => $cat, 'owner' => $owner, 'due_date' => now()->addDays(14 + $i), 'status' => $status, 'evidence' => $ev, 'validated' => $val]);
        }

        // Usage counters this period
        foreach (['ocr_pages' => 14240, 'ai_qa' => 2380, 'summaries' => 320, 'meetings' => 22, 'reports' => 14, 'exports' => 6, 'integrations' => 3] as $metric => $used) {
            $room->usage()->create(['period' => now()->format('Y-m'), 'metric' => $metric, 'used' => $used, 'alerts' => in_array($metric, ['ocr_pages', 'ai_qa'], true) ? [90, 95] : []]);
        }

        // Audit trail
        $events = [
            ['deal.enquiry_received', 'Deal enquiry received for Baobab Capital Raise', 40], ['stage.completed', 'Stage A completed: Enquiry and Lead Qualification', 40],
            ['diagnostic.accepted', 'Diagnostic completed: readiness 82%', 36], ['quote.accepted', 'Formal quotation QTE-2025-000128 accepted', 33],
            ['scope.accepted', 'Scope of work accepted by Aisha Sekele (CEO & Deal Sponsor)', 32], ['mandate.signed', 'Engagement pack signed; AI disclosure and POPIA notice accepted', 32],
            ['payment.received', 'Payment received for INV-2025-000128-D1 (R345,000)', 31], ['room.activated', 'Stage 0 entitlement active: deal room configuration may start', 31],
            ['room.created', 'Deal room created in controlled admin mode with staged disclosure', 30], ['party.invited', '6 invitation(s) sent by email', 22],
            ['overage.detected', 'OCR Pages reached 90% of the included allowance', 3], ['overage.detected', 'OCR Pages reached 95% of the included allowance', 2],
            ['overage.detected', 'AI Q&A reached 95% of the included allowance', 2], ['negotiation.close_agreed', 'Session closed as agreed. Minutes and decision log locked.', 6],
            ['stage.completed', 'Stage 9 completed: Live Negotiation Room', 6], ['stage.unlocked', 'Stage 10 unlocked: Offer and Term-Sheet Management', 6],
            ['offer.submitted', 'TS-05 Active Negotiated Version submitted by Sarah L.; prior versions frozen', 4],
        ];
        foreach ($events as [$e, $d, $days]) {
            $room->events()->create(['event' => $e, 'description' => $d, 'actor' => 'John Dlamini', 'created_at' => now()->subDays($days)]);
        }

        Workflow::ensureStages($room);
    }

    protected function agritech(User $user): void
    {
        $room = $this->reset($user, 'agritech-sa-growth-raise', [
            'reference' => 'DR-2026-000131',
            'name' => 'AgriTech SA Growth Raise',
            'company' => 'AgriTech SA',
            'country' => 'South Africa',
            'sector' => 'Agriculture & Agri-Processing',
            'deal_type' => 'fundraising',
            'transaction_type' => 'Venture Capital (VC) Financings',
            'objective' => 'Raise ZAR 120m growth capital for date palm exports, aquaponics and agri-processing expansion.',
            'amount_zar' => 120_000_000,
            'current_stage' => 'C',
            'status' => 'active',
            'enquiry' => ['transaction_type' => 'Venture Capital (VC) Financings', 'transaction_group' => 'Capital Raising & Financing', 'raise_band' => 'RAISE_100M_500M', 'raise_band_min_zar' => 100_000_000, 'raise_band_max_zar' => 500_000_000, 'score' => 82, 'submitted_at' => now()->subDays(5)->toIso8601String(), 'name' => $user->name, 'email' => $user->email, 'role' => 'Managing Director', 'current_stage' => 'Preparation', 'checks' => []],
            'diagnostic' => ['answers' => $this->diagnosticAnswers()],
            'commercial' => [],
            'setup' => null,
            'security' => Rooms::defaultSecurity(),
            'plan' => ['name' => 'TBCA Growth Raise Plan — Standard'],
            'state' => null,
        ]);
        foreach (Stages::codes() as $i => $code) {
            $room->stages()->create(['code' => $code, 'status' => $i < 2 ? 'completed' : ($i === 2 ? 'unlocked' : 'locked'), 'checks' => $code === 'B' ? ['proposal_reviewed' => true] : null, 'unlocked_at' => $i <= 2 ? now()->subDays(5 - $i) : null, 'completed_at' => $i < 2 ? now()->subDays(4 - $i) : null]);
        }
        $room->parties()->create(['user_id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'organisation' => 'AgriTech SA', 'role' => 'owner', 'access_level' => 'full', 'status' => 'active', 'accepted_at' => now(), 'nda_accepted_at' => now()]);
        $room->events()->create(['event' => 'deal.enquiry_received', 'description' => 'Deal enquiry received for AgriTech SA Growth Raise', 'actor' => $user->name]);
        $room->events()->create(['event' => 'quote.generated', 'description' => 'Formal quotation generated and issued for acceptance', 'actor' => 'John Dlamini']);
    }
}
