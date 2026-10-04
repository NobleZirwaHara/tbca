<?php

namespace App\Support\Portal;

use App\Models\Portal\Deliverable;
use App\Models\Portal\Document;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Record;
use App\Models\Portal\Task;
use App\Models\Portal\Ticket;
use App\Models\User;

/**
 * NATASHA client journey assistant (CP-TEB Part 20). Deterministic, rule-based
 * answers composed only from data the signed-in client is permitted to see
 * (authority level N1/N2). Reserved decisions (N5) are refused with a handoff.
 */
class Natasha
{
    public const SLA_HOURS = ['critical' => 1, 'high' => 4, 'medium' => 8, 'low' => 24];

    public const LADDER = [
        ['L0', 'Frontline Support', 'Tier 1 Agent', 'Support Desk', '2 Hours', '24 Hours', 'L1', 'General enquiry; How-to / Guidance; Minor data correction'],
        ['L1', 'Team Lead', 'Tier 2 Specialist', 'Client Operations', '4 Hours', '48 Hours', 'L2', 'Complex issue; Processing delays; Access or entitlement'],
        ['L2', 'Operations Manager', 'Tier 3 Manager', 'Operations', '8 Hours', '3 Business Days', 'L3', 'Repeated issue; High impact; SLA at risk'],
        ['L3', 'Head of Department', 'Senior Manager', 'Department Head', '12 Hours', '5 Business Days', 'L4', 'Critical impact; Policy exception; Client dissatisfaction'],
        ['L4', 'Executive Sponsor', 'Executive', 'Executive Leadership', '24 Hours', '10 Business Days', 'Board', 'Strategic risk; Regulatory exposure; Executive decision required'],
    ];

    public static function killSwitchOn(): bool
    {
        return Record::whereNull('user_id')->where('register', 'setting')->where('reference', 'natasha_kill_switch')->value('status') === 'on';
    }

    /** @return array{text:string, items:list<array{label:string,value?:string,status?:string,href?:string}>, actions:list<array{label:string,href:string}>, tier:string} */
    public static function answer(User $user, string $question): array
    {
        $q = mb_strtolower($question);
        $has = fn (array $words) => collect($words)->contains(fn ($w) => str_contains($q, $w));

        if ($has(['approve payment', 'refund me', 'release the deliverable', 'override', 'legal advice', 'tax advice', 'sanction', 'kyc decision', 'change my role'])) {
            return ['text' => 'That is a reserved decision I am not permitted to make (authority level N5). I can hand you over to the right human team with your context attached.', 'items' => [], 'actions' => [['label' => 'Request Human Handoff', 'href' => '/portal/natasha/handoff']], 'tier' => 'N5 · Refused & handed off'];
        }
        if ($has(['invoice', 'pay', 'owe', 'balance', 'statement'])) {
            $orders = Billing::orders($user)->take(5);
            $s = Billing::summary($user);

            return ['text' => 'Here are your latest invoices. You have '.$s['outstanding_count'].' outstanding ('.Ui::zar($s['outstanding']).'), of which '.Ui::zar($s['overdue']).' is overdue. You can view and download invoices under Invoices & Payments.',
                'items' => $orders->map(fn ($o) => ['label' => Billing::invoiceNumber($o), 'value' => Ui::zar($o->total_zar).' · Issued '.$o->created_at->format('d M Y'), 'status' => Billing::invoiceStatus($o), 'href' => '/portal/invoices/'.$o->reference])->values()->all(),
                'actions' => [['label' => 'Open Invoices', 'href' => '/portal/invoices'], ['label' => 'Statement of Account', 'href' => '/portal/statement']], 'tier' => 'N1 · Authorised read'];
        }
        if ($has(['task', 'milestone', 'due', 'to do', 'todo'])) {
            $tasks = Task::with('project')->where('user_id', $user->id)->where('status', '!=', 'completed')->orderBy('due_on')->take(5)->get();

            return ['text' => 'These are your next open tasks and milestones, soonest first.', 'items' => $tasks->map(fn ($t) => ['label' => $t->title, 'value' => ($t->project?->name ?? '').' · due '.($t->due_on?->format('d M Y') ?? '—'), 'status' => $t->due_on?->isPast() ? 'overdue' : $t->status, 'href' => '/portal/tasks'])->all(), 'actions' => [['label' => 'Open Tasks & Milestones', 'href' => '/portal/tasks']], 'tier' => 'N1 · Authorised read'];
        }
        if ($has(['ticket', 'complaint', 'support', 'issue'])) {
            $tickets = Ticket::where('user_id', $user->id)->latest()->take(5)->get();

            return ['text' => 'Here is the status of your recent support tickets. Tickets on hold are waiting for your input.', 'items' => $tickets->map(fn ($t) => ['label' => $t->reference.' · '.$t->subject, 'value' => 'Priority '.$t->priority.' · L'.$t->escalation_level, 'status' => $t->status, 'href' => '/portal/support/'.$t->reference])->all(), 'actions' => [['label' => 'Open Support Tickets', 'href' => '/portal/support'], ['label' => 'Raise a Ticket', 'href' => '/portal/support?new=1']], 'tier' => 'N1 · Authorised read'];
        }
        if ($has(['deliverable', 'report', 'accept', 'approval'])) {
            $d = Deliverable::where('user_id', $user->id)->latest('released_at')->take(5)->get();

            return ['text' => 'These are your latest deliverables. Items pending acceptance need your decision in the Approval & Revision Centre — I can explain them, but only you can accept.', 'items' => $d->map(fn ($x) => ['label' => $x->title.' v'.$x->version, 'value' => $x->acceptance_state, 'status' => $x->release_state, 'href' => '/portal/deliverables/'.$x->id])->all(), 'actions' => [['label' => 'Approval & Revision Centre', 'href' => '/portal/approvals']], 'tier' => 'N1 · Authorised read'];
        }
        if ($has(['upload', 'document', 'file'])) {
            $count = Document::where('user_id', $user->id)->where('is_folder', false)->where('status', 'active')->count();

            return ['text' => "To upload a document: go to Document Vault → Upload Documents, choose the project and document type, select your file (max 25 MB; PDF, Office, images or ZIP) and submit. You currently have {$count} documents in your vault.", 'items' => [], 'actions' => [['label' => 'Upload a Document', 'href' => '/portal/documents/upload'], ['label' => 'Evidence Requests', 'href' => '/portal/evidence']], 'tier' => 'N2 · Guidance'];
        }
        if ($has(['dispute', 'refund', 'chargeback'])) {
            $c = PortalCase::where('user_id', $user->id)->where('kind', 'dispute')->latest()->take(5)->get();

            return ['text' => 'Here are your dispute and refund cases. A dispute only freezes the contested scope; your other services continue.', 'items' => $c->map(fn ($x) => ['label' => $x->reference.' · '.$x->title, 'value' => Ui::zar($x->amount_zar), 'status' => $x->status, 'href' => '/portal/disputes'])->all(), 'actions' => [['label' => 'Disputes & Refunds', 'href' => '/portal/disputes']], 'tier' => 'N1 · Authorised read'];
        }
        if ($has(['meeting', 'book', 'call'])) {
            return ['text' => 'You can book, reschedule or cancel meetings from Meetings & Bookings. Double-booked slots are rejected automatically.', 'items' => [], 'actions' => [['label' => 'Meetings & Bookings', 'href' => '/portal/meetings']], 'tier' => 'N2 · Guidance'];
        }
        if ($has(['password', 'mfa', 'security', 'sign in', 'login'])) {
            return ['text' => 'You can change your password and enable MFA under Security & Access History. TBCA will never ask for your password or one-time codes via WhatsApp, email or NATASHA.', 'items' => [], 'actions' => [['label' => 'Security Settings', 'href' => '/portal/security']], 'tier' => 'N2 · Guidance'];
        }
        if ($has(['data', 'privacy', 'popia', 'consent', 'delete'])) {
            return ['text' => 'Under POPIA you can request access, export, correction or deletion of your personal data. Requests are answered within 30 days.', 'items' => [], 'actions' => [['label' => 'Data Access & Export', 'href' => '/portal/privacy/data'], ['label' => 'Consent Centre', 'href' => '/portal/privacy']], 'tier' => 'N2 · Guidance'];
        }

        return ['text' => "I can help you find invoices, tasks, tickets, deliverables, documents, meetings and privacy tools, or hand you over to a person. Try asking \"Where is my invoice?\" or \"Track my task\".", 'items' => [], 'actions' => [['label' => 'Knowledge Base', 'href' => '/portal/help'], ['label' => 'Talk to a Human', 'href' => '/portal/natasha/handoff']], 'tier' => 'N0 · Orientation'];
    }
}
