<?php

namespace App\Support\Portal\Demo;

use App\Models\Booking;
use App\Models\Order;
use App\Models\Portal\Consent;
use App\Models\Portal\DataRequest;
use App\Models\Portal\Device;
use App\Models\Portal\Message;
use App\Models\Portal\Notice;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Principal;
use App\Models\Portal\Record;
use App\Models\Portal\Registration;
use App\Models\Portal\SecurityEvent;
use App\Models\Portal\Thread;
use App\Models\Portal\Ticket;
use App\Models\Portal\TicketMessage;
use App\Models\User;
use App\Support\Platform\Checkout;
use App\Support\Platform\Reference;

/**
 * Demo finance, communication, privacy and security records for a client. Idempotent.
 */
class DemoClientRecords
{
    public static function seed(User $user): void
    {
        self::orders($user);
        self::bookings($user);
        self::tickets($user);
        self::notices($user);
        self::threads($user);
        self::privacy($user);
        self::security($user);
        self::registers($user);
        self::cases($user);
    }

    private static function rec(User $user, string $register, string $reference, array $attrs): Record
    {
        return Record::updateOrCreate(['user_id' => $user->id, 'register' => $register, 'reference' => $reference], $attrs);
    }

    private static function orders(User $user): void
    {
        $defs = [
            ['portal-demo-1', 'Market Entry Strategy – Phase 1', [['sprint', 'MES-P1', 'Market Entry Strategy Workshop', 35000], ['sprint', 'MES-AN', 'Market Analysis & Opportunity Sizing', 45000]], 'paid', -40],
            ['portal-demo-2', 'Regulatory & Compliance Review', [['sprint', 'REG-REV', 'Regulatory & Compliance Scan', 25000]], 'paid', -25],
            ['portal-demo-3', 'Business Plan Development – Milestone 2', [['sprint', 'BPD-M2', 'Business Plan Development – Milestone 2', 37500]], 'unpaid', -2],
            ['portal-demo-4', 'Financial Modelling & Valuation', [['sprint', 'FMV-01', 'Financial Modelling Toolkit', 15000]], 'unpaid', -20],
        ];
        foreach ($defs as [$key, $title, $lines, $state, $days]) {
            $existing = Order::where('user_id', $user->id)->where('meta->seed', $key)->first();
            if ($existing) {
                continue;
            }
            $order = Checkout::createOrder(
                array_map(fn ($l) => ['item_type' => $l[0], 'item_code' => $l[1], 'name' => $l[2], 'unit_zar' => $l[3]], $lines),
                $user, 'portal', ['seed' => $key, 'title' => $title, 'return_url' => '/portal/orders']
            );
            $order->forceFill(['created_at' => now()->addDays($days), 'updated_at' => now()->addDays($days)])->save();
            if ($state === 'paid') {
                Checkout::pay($order, 'eft', [], []);
                $order->refresh();
                $order->forceFill(['paid_at' => now()->addDays($days + 1)])->save();
                $order->payments()->update(['created_at' => now()->addDays($days + 1)]);
            }
        }
    }

    private static function bookings(User $user): void
    {
        $defs = [
            ['Project Kick-off Meeting', 'project-kickoff', 2, '10:00', 'in-person', 'confirmed', 'Solar Park Development (DD-2026-0007)'],
            ['Financial Model Review', 'advisor-session', 4, '14:00', 'video', 'confirmed', 'Financial Model v3.1 (INT-2026-0016)'],
            ['Due Diligence Discussion', 'advisor-session', 9, '11:00', 'video', 'confirmed', 'Due Diligence – Solar Project'],
            ['Stakeholder Update Meeting', 'consultation', 16, '09:00', 'in-person', 'rescheduled', 'Feasibility Study – Hospital Project'],
            ['Strategy Review', 'advisor-session', -12, '10:00', 'video', 'completed', 'Market Entry Strategy – Ghana'],
        ];
        foreach ($defs as $i => [$topic, $type, $days, $time, $channel, $status, $project]) {
            Booking::updateOrCreate(['reference' => 'TBCA-BKG-PORTAL-'.$user->id.'-'.$i], [
                'user_id' => $user->id, 'type' => $type, 'topic' => $topic, 'starts_at' => now()->addDays($days)->setTimeFromTimeString($time),
                'duration_minutes' => 60, 'channel' => $channel, 'status' => $status, 'name' => $user->name, 'email' => $user->email,
                'company' => $user->company, 'meta' => ['project' => $project, 'host' => 'Kabelo S.', 'location' => $channel === 'in-person' ? 'TBCA Offices, Pretoria' : 'Microsoft Teams'],
            ]);
        }
    }

    private static function tickets(User $user): void
    {
        $defs = [
            ['TKT-2026-0724', 'Unable to upload documents to VDR', 'Project Advisory Workspace', 'Technical', 'high', 'open', 0],
            ['TKT-2026-0723', 'Invoice discrepancy on Statement of Account', 'Invoices & Payments', 'Billing', 'medium', 'in_progress', -1],
            ['TKT-2026-0722', 'Request access to Market Intelligence Report', 'Countries Workspace', 'Access', 'medium', 'on_hold', -1],
            ['TKT-2026-0721', 'WhatsApp messages not delivering', 'WhatsApp Preferences', 'Communication', 'low', 'in_progress', -1],
            ['TKT-2026-0720', 'Need assistance with project onboarding', 'One Action Centre', 'General', 'high', 'resolved', -2],
            ['TKT-2026-0719', 'Download link expired for deliverable', 'Deliverables', 'Technical', 'low', 'resolved', -2],
            ['TKT-2026-0718', 'Change of organisation details', 'Account & Profile', 'Account', 'low', 'resolved', -3],
        ];
        foreach ($defs as [$ref, $subject, $area, $cat, $prio, $status, $days]) {
            $t = Ticket::updateOrCreate(['reference' => $ref.'-'.$user->id], [
                'user_id' => $user->id, 'subject' => $subject, 'area' => $area, 'category' => $cat, 'priority' => $prio, 'status' => $status,
                'assignee' => 'Nneka Okafor', 'related_project' => 'Market Entry Strategy – Ghana',
                'sla_due_at' => now()->addDays($days)->addHours($prio === 'high' ? 4 : 24), 'first_response_at' => now()->addDays($days)->addMinutes(12),
                'resolved_at' => $status === 'resolved' ? now()->addDays($days)->addHours(5) : null, 'escalation_level' => $prio === 'high' ? 1 : 0,
            ]);
            $t->forceFill(['created_at' => now()->addDays($days)->subHours(2)])->save();
            if ($t->messages()->count() === 0) {
                $msgs = $ref === 'TKT-2026-0724' ? [
                    [$user->name, 'Requestor', false, 'message', 'I am trying to upload our Q1 financials to the VDR in the Project Advisory Workspace, but the upload fails at 87% with an error "Upload failed – Please try again." This started happening this morning.'],
                    ['Nneka Okafor', 'Support Agent', true, 'message', "Thank you for reaching out. We're looking into this. Could you please confirm the file type and size, and whether other team members are experiencing the same issue?"],
                    [$user->name, 'Requestor', false, 'message', 'Thanks, Nneka. The file is a PDF, 48MB. My colleague also tried and got the same error.'],
                    ['David Mensah', 'Support Engineer', true, 'message', "We've identified a temporary issue with large file uploads in the VDR module. Our engineering team is applying a fix. Estimated resolution time: within 2 hours."],
                    ['System Update', 'Internal Update', true, 'system', 'Status changed from Open to In Progress'],
                    ['Nneka Okafor', 'Support Agent', true, 'message', 'Good news! The issue has been resolved. Please try the upload again and let us know if it works for you.'],
                ] : [[$user->name, 'Requestor', false, 'message', $subject.'. Please assist.'], ['Nneka Okafor', 'Support Agent', true, 'message', 'Thank you, we have logged your request and will update you shortly.']];
                foreach ($msgs as $i => [$name, $role, $staff, $kind, $body]) {
                    $m = TicketMessage::create(['ticket_id' => $t->id, 'author_name' => $name, 'author_role' => $role, 'is_staff' => $staff, 'kind' => $kind, 'body' => $body,
                        'attachments' => $i === 0 && $ref === 'TKT-2026-0724' ? [['name' => 'upload-error-screenshot.png', 'size' => '312 KB']] : null]);
                    $m->forceFill(['created_at' => now()->addDays($days)->addMinutes($i * 20)])->save();
                }
            }
        }
    }

    private static function notices(User $user): void
    {
        $defs = [
            ['action_required', 'Compliance', 'Document request: Company Registration Certificate', 'J. Mensah has requested a document for KYC verification.', 'KYC Verification', '/portal/evidence', false, 0],
            ['project_update', 'Projects', 'You have been added to a project', "You've been added to Market Entry Strategy – Ghana.", 'Market Entry Strategy', '/portal/projects/ENG-2026-0012', false, -1],
            ['compliance', 'Compliance', 'Compliance document approved', 'Your B-BBEE Certificate has been approved.', 'Compliance Documents', '/portal/documents', false, -1],
            ['reminder', 'Projects', 'Meeting reminder', 'Weekly project update meeting starts in 30 minutes.', 'Weekly Project Update', '/portal/meetings', true, -2],
            ['message', 'Mentions', 'New message from Jane Mensah', 'Re: Financial model assumptions and next steps.', 'Messages', '/portal/messages', false, -2],
            ['overdue', 'Compliance', 'Action overdue: Submit tax clearance', 'Tax clearance certificate submission is overdue by 2 days.', 'Tax Compliance', '/portal/evidence', false, -3],
            ['system', 'System', 'System maintenance scheduled', 'Scheduled maintenance on Sunday 02:00–04:00 SAST.', 'System Status', '/portal/status', true, -4],
            ['finance', 'Finance', 'New invoice issued', 'A new invoice has been issued for Business Plan Development – Milestone 2.', 'Invoices', '/portal/invoices', false, -2],
            ['mention', 'Mentions', 'Thandi mentioned you in Project Advisory', '@Amahle please confirm the cost assumptions.', 'Secure Messages', '/portal/messages', false, -1],
        ];
        foreach ($defs as [$type, $cat, $title, $body, $label, $url, $read, $days]) {
            $n = Notice::updateOrCreate(['user_id' => $user->id, 'title' => $title], ['type' => $type, 'category' => $cat, 'body' => $body, 'related_label' => $label, 'related_url' => $url]);
            if ($n->wasRecentlyCreated) {
                $n->forceFill(['read_at' => $read ? now() : null, 'created_at' => now()->addDays($days)->subMinutes(random_int(5, 600))])->save();
            }
        }
    }

    private static function threads(User $user): void
    {
        $defs = [
            ['PA-2026-00048', 'AgriTech: Project Advisory', 'Industrial Park Development', 'Project Advisory Mandate', 'Thandi Mokoena', true, 2, [
                [$user->name.' (You)', null, true, 'Please find attached the updated feasibility report as discussed in our last meeting. Kindly review and provide your feedback.', [['name' => 'Feasibility_Report_v2.pdf', 'size' => '2.4 MB']]],
                ['Thandi Mokoena', 'TBCA Project Advisor', false, 'Thank you. We will review and revert by tomorrow. Please also see our comments on the cost assumptions.', [['name' => 'Cost_Assumptions_Comments.xlsx', 'size' => '185 KB']]],
                ['Alex Khumalo', 'AgriTech CFO', false, 'Noted. We confirm the assumptions and await your feedback.', null],
            ]],
            ['DD-2026-00031', 'BuildMore Ltd: Due Diligence', 'Due Diligence – Solar Project', 'Due Diligence Mandate', 'Kabelo S.', false, 1, [['Kabelo S.', 'TBCA Due Diligence', false, 'We have uploaded the requested documents to the VDR.', null]]],
            ['TB-2026-00012', 'FinServe Group: Transaction Banking', 'Funding & Investor Support', 'Retainer', 'Noma T.', false, 0, [['Noma T.', 'TBCA Finance', false, 'Kindly confirm the wire transfer details for the retainer fee.', null]]],
            ['MP-2026-00007', 'TechSolutions SA: Marketplace', 'Marketplace Engagement', 'Provider Submission', 'Marketplace Team', false, 0, [['Marketplace Team', 'TBCA Marketplace', false, 'Your submission has been reviewed and approved.', null]]],
            ['SUP-2026-00003', 'TBCA Support Team', 'Platform', 'Service Notice', 'Support Team', false, 0, [['TBCA Support Team', 'Support', false, 'System maintenance scheduled for this weekend.', null]]],
        ];
        foreach ($defs as $i => [$ref, $title, $project, $purpose, $owner, $pinned, $unread, $msgs]) {
            $t = Thread::updateOrCreate(['user_id' => $user->id, 'reference' => $ref], [
                'title' => $title, 'engagement_ref' => $ref, 'project_name' => $project, 'purpose' => $purpose, 'owner' => $owner, 'pinned' => $pinned,
                'unread' => $unread, 'participants' => [$user->name, $owner, 'Alex Khumalo', 'Lerato D.'], 'last_activity_at' => now()->subHours($i * 20 + 1),
            ]);
            if ($t->messages()->count() === 0) {
                foreach ($msgs as $j => [$name, $role, $mine, $body, $att]) {
                    $m = Message::create(['thread_id' => $t->id, 'author_name' => $name, 'author_role' => $role, 'is_mine' => $mine, 'body' => $body, 'attachments' => $att]);
                    $m->forceFill(['created_at' => now()->subHours($i * 20 + 3 - $j)])->save();
                }
            }
        }
    }

    private static function privacy(User $user): void
    {
        foreach (['marketing' => ['active', 365], 'data_processing' => ['active', null], 'cloud_storage' => ['active', null], 'whatsapp' => ['active', 365], 'service_updates' => ['active', null], 'analytics' => ['pending', null]] as $key => [$status, $exp]) {
            Consent::where('user_id', $user->id)->where('key', $key)->update(['status' => $status, 'given_at' => $status === 'active' ? now()->subDays(20) : null, 'expires_at' => $exp ? now()->addDays($exp - 20) : null]);
        }
        DataRequest::updateOrCreate(['reference' => 'DSR-2026-'.str_pad((string) $user->id, 4, '0', STR_PAD_LEFT)], [
            'user_id' => $user->id, 'type' => 'correction', 'scope' => 'Personal details (phone number)', 'details' => 'Please update my mobile number on the CRM record.',
            'status' => 'in_review', 'assigned_to' => 'Privacy Team', 'due_at' => now()->addDays(25),
        ]);
    }

    private static function security(User $user): void
    {
        if (SecurityEvent::where('user_id', $user->id)->where('event', 'unusual_sign_in')->exists()) {
            return;
        }
        $defs = [
            ['sign_in', 'Firefox on Windows', 'Johannesburg, South Africa', '102.65.44.211', 'verified', 'low', 'Successful sign-in.', -1],
            ['sign_in', 'Safari on iOS', 'Pretoria, South Africa', '41.203.19.87', 'verified', 'low', 'Successful sign-in.', -2],
            ['unusual_sign_in', 'Chrome on Windows', 'Kampala, Uganda', '102.67.90.12', 'flagged', 'high', 'Sign-in attempt from a new device and location outside your usual pattern. We blocked the attempt.', -5],
            ['failed_sign_in', 'Chrome on Windows', 'Kampala, Uganda', '102.67.90.12', 'failed', 'medium', '3 failed attempts within 5 minutes.', -5],
            ['password_change', 'Chrome on macOS', 'Pretoria, South Africa', '196.25.12.34', 'verified', 'low', 'Password changed.', -6],
            ['mfa_enabled', 'Chrome on macOS', 'Pretoria, South Africa', '196.25.12.34', 'verified', 'low', 'Multi-factor authentication enabled.', -9],
            ['new_device', 'Firefox on Windows 11', 'Johannesburg, South Africa', '102.65.44.211', 'flagged', 'medium', 'New device (Windows Desktop) signed in.', -10],
        ];
        foreach ($defs as [$event, $device, $loc, $ip, $status, $risk, $details, $days]) {
            SecurityEvent::create(['user_id' => $user->id, 'event' => $event, 'device' => $device, 'location' => $loc, 'ip' => $ip, 'status' => $status, 'risk' => $risk, 'details' => $details, 'occurred_at' => now()->addDays($days)->subHours(3)]);
        }
        foreach ([['MacBook Pro', 'macOS 14.4', 'Chrome', 'Pretoria, South Africa', true, -120, 0], ['Windows Desktop', 'Windows 11', 'Firefox', 'Johannesburg, South Africa', true, -150, -1], ['iPhone 14 Pro', 'iOS 17.4', 'Safari', 'Pretoria, South Africa', true, -200, -2], ['iPad Air (Office)', 'iPadOS 17.3', 'Safari', 'Pretoria, South Africa', false, -180, -20]] as [$name, $os, $browser, $loc, $trusted, $first, $last]) {
            Device::updateOrCreate(['user_id' => $user->id, 'name' => $name], ['os' => $os, 'browser' => $browser, 'location' => $loc, 'trusted' => $trusted, 'first_seen_at' => now()->addDays($first), 'last_seen_at' => now()->addDays($last)]);
        }
    }

    private static function registers(User $user): void
    {
        $q = [
            ['QT-2026-0067', 'Market Entry Strategy Proposal', 'Proposal', 'sent', 125000, 26],
            ['QT-2026-0066', 'Due Diligence Services Quotation', 'Quotation', 'draft', 45000, 30],
            ['QT-2026-0065', 'AIIM Accelerator Program', 'Quotation', 'accepted', 28500, -10],
            ['QT-2026-0064', 'Financial Modelling & Valuation', 'Proposal', 'sent', 38750, 14],
            ['QT-2026-0063', 'Regulatory & Compliance Advisory', 'Proposal', 'declined', 22000, -20],
            ['QT-2026-0061', 'Business Plan Development', 'Proposal', 'accepted', 55000, -40],
            ['QT-2026-0060', 'Go-To-Market Strategy', 'Proposal', 'expired', 32500, -3],
        ];
        foreach ($q as $i => [$ref, $title, $type, $status, $amt, $days]) {
            self::rec($user, 'quotation', $ref, ['title' => $title, 'status' => $status, 'amount_zar' => $amt, 'due_on' => now()->addDays($days), 'sort' => $i, 'data' => ['type' => $type, 'lines' => [['label' => $title.' – Phase 1', 'amount' => (int) ($amt * 0.6)], ['label' => $title.' – Phase 2', 'amount' => $amt - (int) ($amt * 0.6)]]]]);
        }

        $c = [
            ['MSA-2026-001', 'Master Services Agreement', 'Contract', 'signed', -150, 215],
            ['EL-MES-2026-012', 'Engagement Letter – Market Entry Strategy', 'Engagement Letter', 'pending_signature', null, 365],
            ['DD-SA-2026-009', 'Due Diligence Services Agreement', 'Contract', 'signed', -160, 40],
            ['ADD-2026-004', 'Addendum #1 – Scope Extension', 'Addendum', 'signed', -60, 215],
            ['EL-CA-2026-006', 'Engagement Letter – Compliance Advisory', 'Engagement Letter', 'pending_signature', null, 365],
            ['RA-2025-018', 'Retainer Agreement', 'Contract', 'expired', -560, -195],
            ['NDA-2026-003', 'Non-Disclosure Agreement', 'Contract', 'signed', -180, 185],
        ];
        foreach ($c as $i => [$ref, $title, $type, $status, $signed, $valid]) {
            self::rec($user, 'contract', $ref, ['title' => $title, 'status' => $status, 'due_on' => now()->addDays($valid), 'sort' => $i, 'data' => ['type' => $type, 'counterparty' => $user->company.' (Pty) Ltd', 'signed_on' => $signed !== null ? now()->addDays($signed)->toDateString() : null]]);
        }

        $r = [
            ['ENG-2026-0012', 'Market Entry Strategy – Phase 1', 'Renewal', 125000, 0, 'upcoming', 27, true],
            ['ENG-2026-0008', 'Regulatory & Compliance Review', 'Price Increase', 60000, 10, 'notice_issued', 42, false],
            ['ENG-2025-0034', 'Due Diligence Support', 'Renewal', 90000, 0, 'upcoming', 78, true],
            ['SUB-2026-0001', 'AIIM Annual Subscription', 'Price Change', 15000, 5, 'effective_soon', 12, true],
            ['RET-2026-0005', 'Retainer Agreement', 'Auto-Renewal', 45000, 0, 'auto_renewed', -3, true],
            ['ENG-2025-0011', 'Business Plan Development', 'Renewal', 110000, 0, 'upcoming', 99, false],
        ];
        foreach ($r as $i => [$ref, $title, $type, $amt, $chg, $status, $days, $auto]) {
            self::rec($user, 'renewal', $ref, ['title' => $title, 'status' => $status, 'amount_zar' => $amt, 'due_on' => now()->addDays($days), 'sort' => $i, 'data' => ['type' => $type, 'change' => $chg, 'auto' => $auto, 'period_end' => now()->addDays($days - 1)->toDateString()]]);
        }

        $m = [
            ['MET-2026-0001', 'Cloud Storage', 'Storage (GB)', 500, 312, 'GB'], ['MET-2026-0002', 'Document Generation', 'Pages', 5000, 4125, 'pages'],
            ['MET-2026-0003', 'AI Insights', 'Credits', 2000, 1350, 'credits'], ['MET-2026-0004', 'Email Notifications', 'Emails', 10000, 9620, 'emails'],
            ['MET-2026-0005', 'API Calls', 'Calls', 50000, 22480, 'calls'],
        ];
        foreach ($m as $i => [$ref, $title, $type, $limit, $used, $unit]) {
            self::rec($user, 'meter', $ref, ['title' => $title, 'status' => 'active', 'sort' => $i, 'data' => ['type' => $type, 'limit' => $limit, 'used' => $used, 'unit' => $unit, 'trend' => [40, 48, 52, 61, (int) round($used / $limit * 100)]]]);
        }
        self::rec($user, 'wallet', 'WALLET', ['title' => 'Usage wallet', 'status' => 'active', 'amount_zar' => 18450, 'data' => ['topups' => [['date' => now()->subDays(8)->toDateString(), 'amount' => 20000], ['date' => now()->subDays(24)->toDateString(), 'amount' => 10000]]]]);

        self::rec($user, 'credit_note', 'CRN-2026-0012', ['title' => 'Credit – Scope Adjustment', 'status' => 'available', 'amount_zar' => 10000, 'data' => ['original' => 'INV-2026-0068']]);
        self::rec($user, 'credit_note', 'CN-2026-0018', ['title' => 'Credit note applied to future services', 'status' => 'available', 'amount_zar' => 15000, 'data' => ['original' => 'INV-2026-0031']]);

        $fees = [
            ['Strategy Development', 'Market analysis and entry strategy', 'Professional Fee', 'Fixed Fee', 'A', 'currently_payable', 45000],
            ['Financial Modelling', 'Financial projections and scenario model', 'Professional Fee', 'Time & Material', 'B', 'payable_if_event', 25000],
            ['Regulatory & Compliance Review', 'Regulatory scan and compliance memo', 'Professional Fee', 'Fixed Fee', 'A', 'currently_payable', 20000],
            ['Third-Party Specialist', 'Independent legal opinion', 'Third-Party Cost', 'Cost Pass-Through', 'B', 'payable_if_event', 15000],
            ['Government Filing Fees', 'Statutory filing fees', 'Direct Expense', 'Cost Pass-Through', 'A', 'currently_payable', 5000],
            ['Travel & Accommodation', 'Site visits (estimate)', 'Reimbursable Expense', 'Cost Pass-Through', 'C', 'not_payable', 7500],
            ['Translation & Documentation', 'Afrikaans translation of deliverables', 'Reimbursable Expense', 'Cost Pass-Through', 'B', 'payable_if_event', 7500],
        ];
        foreach ($fees as $i => [$title, $desc, $cat, $basis, $class, $pay, $amt]) {
            self::rec($user, 'fee_line', 'FM-2026-00047-'.($i + 1), ['title' => $title, 'status' => $pay, 'amount_zar' => $amt, 'sort' => $i, 'data' => ['manifest' => 'FM-2026-00047', 'description' => $desc, 'category' => $cat, 'basis' => $basis, 'class' => $class, 'engagement' => 'ENG-2026-0012']]);
        }

        $owes = [
            ['OB-1', 'Approved Cash Refund', 'Refund for overpayment on Invoice INV-2026-0031', 'Invoice INV-2026-0031', 48750, 'pending_payment'],
            ['OB-2', 'Issued Account Credit', 'Credit note CN-2026-0018 applied to future services', 'Credit Note CN-2026-0018', 32250, 'available'],
            ['OB-3', 'Replacement / Correction', 'Revised Market Analysis Report v1.1', 'Deliverable: Market Analysis Report', null, 'in_progress'],
            ['OB-4', 'Undelivered Deliverable', 'Investment Deck (Final) approved but not yet delivered', 'Project: Business Plan Development', null, 'pending_delivery'],
            ['OB-5', 'Client Document Handover', 'Project documents ready for export and handover', 'Engagement INT-2026-0016', null, 'ready'],
            ['OB-6', 'Service-Recovery Action', 'Re-performance of financial model review', 'Ticket TKT-2026-0723', null, 'in_progress'],
            ['OB-7', 'Third-Party Coordinated Remedy', 'Coordination with valuation specialist', 'Provider: Acme Valuations', null, 'under_review'],
            ['OB-8', 'Data / Rights Action', 'Request for data export (privacy right)', 'Case DR-2026-0007', null, 'completed'],
            ['OB-9', 'Unknown / Unresolved Obligation', 'Outstanding matter under investigation', 'CASE-2026-0042', null, 'not_calculable'],
        ];
        foreach ($owes as $i => [$ref, $type, $desc, $rel, $amt, $status]) {
            self::rec($user, 'obligation', $ref, ['title' => $type, 'status' => $status, 'amount_zar' => $amt, 'sort' => $i, 'data' => ['description' => $desc, 'related' => $rel]]);
        }

        $reuse = [
            ['Company Profile', 'Registered details, structure', 'Profile', 'Market Entry Strategy – Ghana', 'reusable', -150],
            ['Financial Statements (FY2025)', 'Audited annual financials', 'Financial', 'Business Plan Development', 'needs_review', -200],
            ['Key Management Bios', 'Directors and executives', 'Profile', 'Due Diligence – Solar Project', 'reusable', -90],
            ['Tax Clearance Certificate', 'SARS tax clearance', 'Compliance', 'Regulatory & Compliance Support', 'cannot_reuse', -400],
            ['Market Research Data', 'Ghana agri-tech market data', 'Research', 'Market Entry Strategy – Ghana', 'reusable', -60],
            ['Shareholder Register', 'Shareholding and owners', 'Legal', 'Funding & Investor Support', 'needs_review', -220],
            ['Existing Contracts', 'Material customer contracts', 'Legal', 'Due Diligence – Solar Project', 'reusable', -45],
            ['Bank Details & Mandates', 'Bank confirmation letter', 'Financial', 'Funding & Investor Support', 'needs_review', -300],
        ];
        foreach ($reuse as $i => [$title, $desc, $type, $src, $status, $days]) {
            self::rec($user, 'data_reuse', 'DATA-'.($i + 1), ['title' => $title, 'status' => $status, 'due_on' => now()->addDays($days + 365), 'sort' => $i, 'data' => ['description' => $desc, 'type' => $type, 'source' => $src, 'updated' => now()->addDays($days)->toDateString()]]);
        }

        $proc = [
            ['Purchase Order', 'Lerato M.', 'pending', null], ['Vendor Registration', 'Thabo N.', 'complete', 365], ['Tax Certificate', 'Thabo N.', 'complete', 365],
            ['Banking Confirmation', 'Lerato M.', 'complete', 365], ['Signed Terms & Conditions', 'Lerato M.', 'pending', null], ['Insurance Proof', 'Thabo N.', 'expiring', 25],
            ['Conflict of Interest Disclosure', 'Thabo N.', 'missing', null], ['Non-Disclosure Agreement (NDA)', 'Lerato M.', 'review_due', 200],
        ];
        foreach ($proc as $i => [$title, $owner, $status, $exp]) {
            self::rec($user, 'procurement_req', 'PRQ-'.($i + 1), ['title' => $title, 'status' => $status, 'due_on' => $exp ? now()->addDays($exp) : null, 'sort' => $i, 'data' => ['owner' => $owner, 'submitted' => in_array($status, ['complete', 'expiring', 'review_due', 'pending'], true) ? now()->subDays(10 + $i)->toDateString() : null, 'case' => 'ACME-BUY-2026-0457']]);
        }

        $rv = [
            ['Identity document check', 'verified', 'Document upload'], ['Authority confirmation', 'in_review', 'Authority letter & mandate'],
            ['Contact detail confirmation', 'confirmed', 'Email & SMS verification'], ['Billing detail confirmation', 'updated', 'Proof of billing'],
            ['Address confirmation', 'updated', 'Address proof'], ['Risk review', 'no_change', 'Risk engine'], ['Consent refresh', 'pending', 'Digital consent'],
            ['Source trace update', 'completed', 'System & external registry'],
        ];
        foreach ($rv as $i => [$title, $status, $method]) {
            self::rec($user, 'reverification', 'RV-'.($i + 1), ['title' => $title, 'status' => $status, 'sort' => $i, 'data' => ['method' => $method, 'completed' => $status === 'pending' ? null : now()->subHours(2 + $i)->toDateTimeString()]]);
        }

        $pf = [
            ['Legal Entity Name', $user->company.' (Pty) Ltd', 'Assisted (Phone)', 'Thandi Mokoena', 'verified', false],
            ['Registration Number', '2021/987654/07', 'Self-entered (Web Form)', $user->name, 'verified', false],
            ['Tax Number', '9876543210', 'Uploaded (WhatsApp)', 'Thandi Mokoena', 'verified', false],
            ['Billing Email', 'billing@agritechsa.co.za', 'Self-entered (Web Form)', $user->name, 'verified', false],
            ['Contact Number', $user->phone ?? '+27 82 123 4567', 'Assisted (WhatsApp)', 'Thandi Mokoena', 'verified', false],
            ['Bank Account Name', $user->company.' (Pty) Ltd', 'Assisted (Phone)', 'Thandi Mokoena', 'pending', true],
            ['Delivery Address', '15 Innovation Drive, Midrand, 1685', 'Imported (CIPC API)', 'System', 'matched', false],
        ];
        foreach ($pf as $i => [$field, $value, $source, $by, $status, $changed]) {
            self::rec($user, 'provenance', 'PF-'.($i + 1), ['title' => $field, 'status' => $status, 'sort' => $i, 'data' => ['value' => $value, 'source' => $source, 'by' => $by, 'changed' => $changed, 'time' => now()->subMinutes(80 - $i * 5)->format('d M Y, H:i')]]);
        }

        $pt = [
            ['PRT-2026-0146', 'Lebo Mokoena', 'lebo@lexafrica.co.za', 'External Legal Reviewer', 'LexAfrica Inc.', 'Matter: M&A-2026-003', 'verified', 'Read-Only', 'active', -30, 0],
            ['PRT-2026-0138', 'Tariq Jacobs', 'tariq@techsupply.co.za', 'Supplier Contact', 'TechSupply (Pty) Ltd', 'Project: ERP-2026-017', 'verified', 'Contribute', 'pending_review', -25, 3],
            ['PRT-2026-0119', 'Aisha Van der Merwe', 'aisha@bluepeak.co.za', 'Investor Guest', 'BluePeak Capital', 'Deal Room: DR-2026-012', 'verified', 'Read-Only', 'pending_review', -50, -2],
            ['PRT-2026-0097', 'Kabelo Sithole', 'kabelo@safecert.co.za', 'Technical Assessor', 'SafeCert Assessors', 'Assessment: AS-2026-009', 'pending', 'Contribute', 'restricted', -40, 5],
            ['PRT-2026-0065', 'Nandi Dlamini', 'nandi@growthhub.co.za', 'Partner Contributor', 'GrowthHub Network', 'Workspace: WK-2026-021', 'not_verified', 'Read-Only', 'suspended', -90, -10],
            ['INV-2026-0303', 'Michael Chen', 'michael.chen@investco.com', 'Investor Guest', 'InvestCo', 'Deal Room: WS-2026-0661', 'pending', 'Read-Only', 'invited', 0, 30],
        ];
        foreach ($pt as $i => [$ref, $name, $email, $role, $org, $ws, $verif, $scope, $status, $last, $next]) {
            self::rec($user, 'participant', $ref, ['title' => $name, 'status' => $status, 'due_on' => now()->addDays($next), 'sort' => $i, 'data' => ['email' => $email, 'role' => $role, 'organisation' => $org, 'workspace' => $ws, 'verification' => $verif, 'scope' => $scope, 'last_review' => now()->addDays($last)->toDateString(), 'channel' => 'Email', 'purpose' => 'Review & provide opinion', 'expires' => now()->addDays(90)->toDateString()]]);
        }

        if (! Principal::where('user_id', $user->id)->exists()) {
            foreach ([['FinBridge', 'api', ['invoices:read'], 60], ['AutoReconcile', 'machine', ['reconciliation:execute'], 5], ['ReportBuilder', 'api', ['reports:read'], 90], ['Lerato Mokoena', 'human', ['portal:login'], 180]] as [$name, $type, $scopes, $days]) {
                Principal::create(['user_id' => $user->id, 'name' => $name, 'type' => $type, 'scopes' => $scopes, 'token_hash' => hash('sha256', $name), 'token_hint' => 'tbca_…'.substr(md5($name), 0, 4), 'status' => 'active', 'expires_at' => now()->addDays($days), 'last_used_at' => now()->subMinutes(random_int(10, 400))]);
            }
        }

        foreach ([['webinar', 'renewable-energy', 'registered'], ['webinar', 'ppp-structures', 'registered'], ['webinar', 'ai-infrastructure', 'registered'], ['webinar', 'infra-financing', 'pending_approval'], ['kp', 'project-finance-code', 'registered'], ['kp', 'doing-business-africa', 'registered'], ['kp', 'aiim-in-action', 'registered'], ['kp', 'infrastructure-delivery', 'pending_approval']] as $i => [$kind, $key, $status]) {
            Registration::updateOrCreate(['user_id' => $user->id, 'kind' => $kind, 'item_key' => $key], ['reference' => strtoupper($kind === 'kp' ? 'KP' : 'WEB').'-'.str_pad((string) (245 + $i * 6), 6, '0', STR_PAD_LEFT), 'status' => $status]);
        }

        foreach (['Benchmark: Renewable Energy Cost' => 'renewable-energy-cost', 'Benchmark: Infrastructure Delivery' => 'infrastructure-delivery'] as $label => $key) {
            self::rec($user, 'benchmark_consent', $key, ['title' => $label, 'status' => $key === 'renewable-energy-cost' ? 'contributing' : 'withdrawn', 'data' => []]);
        }
    }

    private static function cases(User $user): void
    {
        $mk = function (string $kind, string $ref, string $title, string $status, array $payload, ?int $amount = null, int $days = -5, ?string $priority = null) use ($user) {
            PortalCase::updateOrCreate(['user_id' => $user->id, 'kind' => $kind, 'reference' => $ref], [
                'title' => $title, 'status' => $status, 'payload' => $payload, 'amount_zar' => $amount, 'priority' => $priority,
                'submitted_at' => now()->addDays($days), 'step' => 99,
            ]);
        };
        $mk('dispute', 'DSP-2026-0012', 'Invoice amount incorrect', 'open', ['type' => 'Dispute', 'related' => 'Invoice INV-2026-0071'], 25000, -2, 'high');
        $mk('dispute', 'DSP-2026-0011', 'Service not used SRV-APR-2026', 'under_review', ['type' => 'Refund', 'related' => 'Payment PAY-2026-0142'], 15000, -6, 'medium');
        $mk('dispute', 'REF-2026-0009', 'Project cancelled early', 'awaiting_info', ['type' => 'Refund', 'related' => 'Project PJT-2026-001'], 26250, -9, 'medium');
        $mk('dispute', 'CHB-2026-0008', 'Credit card chargeback', 'open', ['type' => 'Chargeback', 'related' => 'Payment PAY-2026-0103'], 45000, -10, 'high');
        $mk('dispute', 'DSP-2026-0007', 'Duplicate billing', 'resolved', ['type' => 'Dispute', 'related' => 'Invoice INV-2026-0062'], 5000, -30, 'low');
        $mk('dispute', 'DSP-2026-0005', 'Scope not as agreed', 'closed', ['type' => 'Dispute', 'related' => 'Invoice INV-2026-0055'], 12750, -60, 'medium');
        $mk('ownership_dispute', 'DISP-2026-0002', 'Unauthorised access to my account', 'under_review', ['subject' => 'Unauthorised access to my account'], null, -1, 'high');
        $mk('ownership_dispute', 'DISP-2026-0001', 'Dispute over account ownership', 'resolved', ['subject' => 'Dispute over account ownership'], null, -12, 'medium');
        $mk('feedback', 'FB-2026-156', 'Great service from Project Advisory team', 'resolved', ['type' => 'compliment', 'category' => 'Service Quality'], null, -2, 'low');
        $mk('feedback', 'FB-2026-155', 'Suggestion: Add forward exposure dashboard', 'in_progress', ['type' => 'suggestion', 'category' => 'Feature Requests'], null, -3, 'medium');
        $mk('feedback', 'FB-2026-154', 'Document upload failing for large files', 'assigned', ['type' => 'issue', 'category' => 'System Performance'], null, -5, 'high');
        $mk('intake', 'INT-2026-0017', 'Market Entry Strategy – Ghana', 'under_review', ['service' => 'Market Entry Strategy', 'engagement_type' => 'Project', 'assigned' => 'Tinashe M.'], null, -3);
        $mk('intake', 'INT-2026-0015', 'Due Diligence – Solar Project', 'in_progress', ['service' => 'Due Diligence', 'engagement_type' => 'Project', 'assigned' => 'Kabelo S.'], null, -20);
        $mk('intake', 'INT-2026-0014', 'Regulatory & Compliance Support', 'completed', ['service' => 'Regulatory & Compliance', 'engagement_type' => 'Advisory', 'assigned' => 'Nomsa T.'], null, -90);
        $mk('variation', 'VAR-2026-00027', 'Environmental & social scope addition', 'in_review', ['engagement' => 'ENG-2026-0012', 'types' => ['scope', 'fee'], 'summary' => 'Addition of detailed environmental impact assessment and community consultation deliverables as requested by the funder.', 'justification' => 'The funder has updated the E&S requirements.', 'time_days' => 15, 'fee_impact' => 85750], 85750, -2, 'medium');
        $mk('export', 'EXP-2026-041', 'All Records', 'completed', ['type' => 'records', 'format' => 'json', 'scope' => 'All Records', 'size' => '8.2 KB'], null, -12);
    }
}
