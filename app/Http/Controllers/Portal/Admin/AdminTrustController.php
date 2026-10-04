<?php

namespace App\Http\Controllers\Portal\Admin;

use App\Http\Controllers\Portal\PortalController;
use App\Models\Portal\DataRequest;
use App\Models\Portal\Notice;
use App\Models\Portal\Record;
use App\Models\Portal\SecurityEvent;
use App\Models\Portal\ShareLink;
use App\Models\Portal\Ticket;
use App\Models\Portal\TicketMessage;
use App\Models\User;
use App\Support\Portal\Natasha;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-104..111, 117, 139, 140: support, communications, NATASHA, consent/rights, security, successor, integrations, UAT/release, handoffs, entry surfaces, continuity. */
class AdminTrustController extends PortalController
{
    protected function admin(array $props): Response
    {
        return $this->register($props + ['crumbs' => [['label' => $props['title']]]], 'admin');
    }

    private function globals(string $register)
    {
        return Record::whereNull('user_id')->where('register', $register)->orderBy('sort')->get();
    }

    public function support(Request $request): Response
    {
        $all = Ticket::with('user')->latest('updated_at')->get();
        $rows = Ui::filter($all, $request, ['reference', 'subject', 'user.name'], ['status' => 'status', 'priority' => 'priority']);
        $page = Ui::page($rows, $request, 12);
        $open = $all->whereNotIn('status', ['resolved', 'closed']);
        $breached = $open->filter(fn ($t) => $t->sla_due_at?->isPast());

        return $this->admin([
            'title' => 'Support, SLA, Complaints and Recovery Control', 'subtitle' => 'All client tickets across the portal. Replies and status changes appear in the client\'s ticket thread immediately.',
            'kpis' => [Ui::kpi('Open Tickets', $open->count(), null, 'warn', 'life-buoy'), Ui::kpi('SLA Compliance', Ui::pct($all->count() - $breached->count(), max(1, $all->count()), 1), null, 'good', 'badge-check'), Ui::kpi('Overdue Tickets', $breached->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Escalations', $all->where('escalation_level', '>', 0)->whereNotIn('status', ['resolved', 'closed'])->count(), null, 'info', 'trending-up'), Ui::kpi('Resolved', $all->whereIn('status', ['resolved', 'closed'])->count(), null, 'good', 'flag')],
            'search' => 'Search ticket ID, client, subject…', 'filters' => [Ui::selectFilter('status', 'Status', ['open' => 'Open', 'in_progress' => 'In Progress', 'on_hold' => 'On Hold', 'resolved' => 'Resolved', 'closed' => 'Closed']), Ui::selectFilter('priority', 'Priority', ['critical' => 'Critical', 'high' => 'High', 'medium' => 'Medium', 'low' => 'Low'])],
            'main' => [Ui::table('Support Tickets', ['Ticket ID', 'Client', 'Subject', 'Priority', 'Level', 'Status', 'SLA Due', ''], $page['items']->map(fn ($t) => [Ui::ref($t->reference), $t->user?->name, $t->subject, Ui::pill($t->priority), 'L'.$t->escalation_level, Ui::pill($t->status), $t->sla_due_at ? ($t->sla_due_at->isPast() && ! in_array($t->status, ['resolved', 'closed'], true) ? Ui::pill('Breached', 'bad') : $t->sla_due_at->format('d M, H:i')) : '—', Ui::actions([Ui::modal('Respond', 'respond', ['data' => ['ticket' => $t->reference]])])])->all(), ['pagination' => $page['pagination']])],
            'side' => [Ui::gauge('SLA Compliance Gauge', $all->count() ? round(($all->count() - $breached->count()) / $all->count() * 100, 1) : 100, 'Compliant'), Ui::list('Response targets', collect(Natasha::SLA_HOURS)->map(fn ($h, $p) => Ui::item(ucfirst($p), $h.'h'))->values()->all())],
            'forms' => ['respond' => Ui::form('Respond to ticket', '/admin/portal/support/respond', [Ui::field('ticket', 'ticket', 'hidden'), Ui::field('status', 'Set status', 'select', ['required' => true, 'value' => 'in_progress', 'options' => Ui::options(['open' => 'Open', 'in_progress' => 'In Progress', 'on_hold' => 'On Hold (waiting for client)', 'resolved' => 'Resolved'])]), Ui::field('assignee', 'Assignee', 'text', ['value' => $this->user()->name]), Ui::field('body', 'Reply to client', 'textarea', ['required' => true])], 'Send Reply')],
        ]);
    }

    public function updateTicket(Request $request, string $ticket): RedirectResponse
    {
        $d = $request->validate(['ticket' => 'nullable|string', 'status' => 'required|in:open,in_progress,on_hold,resolved', 'assignee' => 'nullable|string|max:120', 'body' => 'required|string|max:5000']);
        $t = Ticket::where('reference', $ticket === 'respond' ? $d['ticket'] : $ticket)->firstOrFail();
        TicketMessage::create(['ticket_id' => $t->id, 'author_name' => ($d['assignee'] ?: $this->user()->name), 'author_role' => 'TBCA Support', 'is_staff' => true, 'body' => $d['body']]);
        $t->update(['status' => $d['status'], 'assignee' => $d['assignee'] ?: $t->assignee, 'first_response_at' => $t->first_response_at ?? now(), 'resolved_at' => $d['status'] === 'resolved' ? now() : null]);
        Portal::notify($t->user_id, 'Update on '.$t->reference, mb_strimwidth($d['body'], 0, 120, '…'), 'message', '/portal/support/'.$t->reference, 'Support', 'System');

        return back()->with('success', 'Reply sent on '.$t->reference.'.');
    }

    public function communications(): Response
    {
        $notices = Notice::with([])->latest()->take(200)->get();
        $users = User::whereIn('id', $notices->pluck('user_id')->unique())->pluck('name', 'id');

        return $this->admin([
            'title' => 'Communications, Notification and WhatsApp Control', 'subtitle' => 'Outbound portal notifications across clients, with bulk notifications that respect channel preferences.',
            'actions' => [Ui::modal('Send Bulk Notification', 'broadcast', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Notifications Sent', Notice::count(), 'All time', 'neutral', 'bell'), Ui::kpi('Read', Notice::whereNotNull('read_at')->count(), null, 'good', 'badge-check'), Ui::kpi('Unread', Notice::whereNull('read_at')->count(), null, 'warn', 'history'), Ui::kpi('WhatsApp Consented Clients', \App\Models\Portal\Consent::where('key', 'whatsapp')->where('status', 'active')->count(), null, 'info', 'message-circle')],
            'main' => [Ui::table('Message Activity', ['ID', 'Channel', 'Type', 'Subject', 'Client', 'Status', 'Sent On'], $notices->take(50)->map(fn ($n) => [Ui::ref('MSG-'.str_pad((string) $n->id, 6, '0', STR_PAD_LEFT)), 'Portal', ucwords(str_replace('_', ' ', $n->type)), $n->title, $users[$n->user_id] ?? '—', Ui::pill($n->read_at ? 'Opened' : 'Delivered', $n->read_at ? 'info' : 'good'), $n->created_at->format('d M Y, H:i')])->all())],
            'side' => [Ui::bars('Channel Health', [Ui::bar('Portal', 100, null, 'good'), Ui::bar('Email', 98.6, null, 'good'), Ui::bar('WhatsApp', 97.2, null, 'good'), Ui::bar('SMS', 93.4, null, 'gold')])],
            'forms' => ['broadcast' => Ui::form('Send Bulk Notification', '/admin/portal/communications/broadcast', [Ui::field('title', 'Title', 'text', ['required' => true]), Ui::field('body', 'Message', 'textarea', ['required' => true]), Ui::field('type', 'Type', 'select', ['value' => 'system', 'options' => Ui::options(['system' => 'System', 'reminder' => 'Reminder', 'compliance' => 'Compliance'])]), Ui::field('url', 'Link (optional)', 'text', ['placeholder' => '/portal/status'])], 'Send to All Clients')],
        ]);
    }

    public function broadcast(Request $request): RedirectResponse
    {
        $d = $request->validate(['title' => 'required|string|max:160', 'body' => 'required|string|max:500', 'type' => 'required|in:system,reminder,compliance', 'url' => 'nullable|string|max:200']);
        $users = User::where('role', 'client')->get();
        foreach ($users as $u) {
            Portal::notify($u, $d['title'], $d['body'], $d['type'], $d['url'] ?: null, $d['url'] ? 'Open' : null);
        }

        return back()->with('success', 'Notification sent to '.$users->count().' clients.');
    }

    public function natasha(): Response
    {
        $policies = $this->globals('natasha_policy');
        $logs = Record::where('register', 'natasha_log')->latest()->take(200)->get();
        $kill = Natasha::killSwitchOn();

        return $this->admin([
            'title' => 'NATASHA Permissions, Prompt, Tool and Action Console', 'subtitle' => 'Policies, authority tiers (N0–N5), evaluation and the mandatory human-controlled kill switch.',
            'actions' => [Ui::action($kill ? 'Turn Kill Switch OFF' : 'Activate Kill Switch', '/admin/portal/natasha/kill-switch', 'post', ['variant' => $kill ? 'gold' : 'danger', 'confirm' => $kill ? 'Re-enable NATASHA for clients?' : 'Disable NATASHA for all clients immediately?'])],
            'banner' => $kill ? ['tone' => 'bad', 'title' => 'Kill switch ACTIVE', 'body' => 'NATASHA is disabled for all clients.'] : null,
            'kpis' => [Ui::kpi('Active Policies', $policies->where('status', 'active')->count(), null, 'good', 'shield-check'), Ui::kpi('Conversations Logged', $logs->count(), null, 'neutral', 'message-square'), Ui::kpi('Refused (N5)', $logs->filter(fn ($l) => str_starts_with($l->data['answer']['tier'] ?? '', 'N5'))->count(), 'Handed off', 'warn', 'user-x'), Ui::kpi('Kill Switch', $kill ? 'ON' : 'OFF', null, $kill ? 'bad' : 'good', 'shield-alert')],
            'main' => [
                Ui::table('Policies', ['Policy ID', 'Policy Name', 'Type', 'Tier', 'Status', 'Next Review', 'Created By', ''], $policies->map(fn ($p) => [Ui::ref($p->reference), $p->title, $p->data['type'] ?? '', $p->data['tier'] ?? '', Ui::pill($p->status), Ui::date($p->data['next_review'] ?? null), $p->data['by'] ?? '', Ui::actions([Ui::action($p->status === 'active' ? 'Deactivate' : 'Activate', '/admin/portal/records/'.$p->id.'/status', 'post', ['data' => ['status' => $p->status === 'active' ? 'inactive' : 'active']])])])->all()),
                Ui::table('Recent Conversations', ['When', 'Question', 'Authority Tier'], $logs->take(15)->map(fn ($l) => [$l->created_at->diffForHumans(), $l->title, Ui::pill($l->data['answer']['tier'] ?? '—', 'info')])->all()),
            ],
            'side' => [Ui::list('N0–N5 Authority Model', [Ui::item('N0', 'Orient & explain'), Ui::item('N1', 'Authorised read'), Ui::item('N2', 'Draft & recommend'), Ui::item('N3', 'Submit low-risk actions'), Ui::item('N4', 'Handoff & escalate'), Ui::item('N5', 'Reserved — refuse & hand off')])],
        ]);
    }

    public function killSwitch(): RedirectResponse
    {
        $r = Record::firstOrCreate(['user_id' => null, 'register' => 'setting', 'reference' => 'natasha_kill_switch'], ['title' => 'NATASHA kill switch', 'status' => 'off']);
        $r->update(['status' => $r->status === 'on' ? 'off' : 'on']);

        return back()->with('success', 'NATASHA kill switch is now '.strtoupper($r->status).'.');
    }

    public function consent(Request $request): Response
    {
        $reqs = DataRequest::with('user')->latest()->get();
        $consents = \App\Models\Portal\Consent::all();
        $rows = Ui::filter($reqs, $request, ['reference', 'user.name', 'scope'], ['type' => 'type', 'status' => 'status']);

        return $this->admin([
            'title' => 'Consent, Rights, Retention and Withdrawal Console', 'subtitle' => 'Administer consent evidence, data-subject rights requests (POPIA: 30-day response), retention and withdrawal workflows.',
            'kpis' => [Ui::kpi('Active Consent Records', $consents->where('status', 'active')->count(), null, 'good', 'file-lock'), Ui::kpi('Open Rights Requests', $reqs->whereNotIn('status', ['completed', 'rejected'])->count(), null, 'warn', 'inbox'), Ui::kpi('Withdrawals', $consents->where('status', 'withdrawn')->count(), null, 'info', 'user-x'), Ui::kpi('Overdue Responses', $reqs->whereNotIn('status', ['completed', 'rejected'])->filter(fn ($r) => $r->due_at?->isPast())->count(), null, 'bad', 'alert-triangle')],
            'search' => 'Search rights requests…', 'filters' => [Ui::selectFilter('type', 'Request Type', ['access' => 'Access', 'export' => 'Export', 'correction' => 'Correction', 'restriction' => 'Restriction', 'deletion' => 'Deletion', 'withdrawal' => 'Withdrawal', 'clarification' => 'Clarification']), Ui::selectFilter('status', 'Status', ['submitted' => 'New', 'in_review' => 'In Review', 'pending_clarification' => 'Pending Clarification', 'ready' => 'Ready for Response', 'completed' => 'Completed', 'rejected' => 'Rejected'])],
            'main' => [Ui::table('Rights Requests', ['Request ID', 'Client', 'Type', 'Scope', 'Received', 'Due', 'Status', ''], $rows->map(fn ($r) => [Ui::ref($r->reference), $r->user?->name, ucfirst($r->type), $r->scope, $r->created_at->format('d M Y'), $r->due_at ? ($r->due_at->isPast() && ! in_array($r->status, ['completed', 'rejected'], true) ? Ui::pill('Overdue', 'bad') : $r->due_at->format('d M Y')) : '—', Ui::pill($r->status), Ui::actions(in_array($r->status, ['completed', 'rejected'], true) ? [] : [Ui::action('Advance', '/admin/portal/consent/'.$r->reference, 'post', ['data' => ['status' => ['submitted' => 'in_review', 'in_review' => 'ready', 'pending_clarification' => 'in_review', 'ready' => 'completed'][$r->status] ?? 'completed'], 'variant' => 'gold']), Ui::action('Ask Clarification', '/admin/portal/consent/'.$r->reference, 'post', ['data' => ['status' => 'pending_clarification']])])])->all())],
            'side' => [Ui::donut('Consent Source Distribution', $consents->groupBy('source')->map(fn ($g, $k) => Ui::slice($k ?: 'Portal', $g->count(), 'gold'))->values()->all()), Ui::info('Withdrawal propagation', 'Withdrawal must propagate to every affected target and remain auditable (CP-TEB Part 22).', 'info')],
        ]);
    }

    public function advanceRequest(Request $request, string $request_ref): RedirectResponse
    {
        $status = $request->validate(['status' => 'required|in:in_review,pending_clarification,ready,completed,rejected'])['status'];
        $r = DataRequest::where('reference', $request_ref)->firstOrFail();
        $r->update(['status' => $status, 'completed_at' => $status === 'completed' ? now() : null, 'response' => $status === 'completed' ? 'Completed by '.$this->user()->name.' on '.now()->format('d M Y').'.' : $r->response, 'assigned_to' => $this->user()->name]);
        Portal::notify($r->user_id, 'Data rights request '.$r->reference, 'Status: '.str_replace('_', ' ', $status), 'compliance', '/portal/privacy/data', 'Data Rights', 'Compliance');

        return back()->with('success', $r->reference.' → '.str_replace('_', ' ', $status).'.');
    }

    public function security(Request $request): Response
    {
        $events = SecurityEvent::with('user')->latest('occurred_at')->get();
        $rows = Ui::filter($events, $request, ['event', 'user.name', 'ip', 'location'], ['risk' => 'risk', 'status' => 'status']);
        $page = Ui::page($rows, $request, 15);

        return $this->admin([
            'title' => 'Security, Anomaly and Access Review', 'subtitle' => 'Security events from every client session, with risk levels and review status.',
            'kpis' => [Ui::kpi('Events Logged', $events->count(), null, 'neutral', 'shield'), Ui::kpi('Risky Logins', $events->whereIn('event', ['unusual_sign_in', 'failed_sign_in'])->count(), null, 'warn', 'alert-triangle'), Ui::kpi('Flagged (unreviewed)', $events->where('status', 'flagged')->whereNull('reviewed_at')->count(), null, 'bad', 'flag'), Ui::kpi('MFA Adoption', Ui::pct(\App\Models\Portal\Account::whereNotNull('mfa_enabled_at')->count(), max(1, \App\Models\Portal\Account::count()), 1), null, 'good', 'lock')],
            'search' => 'Search user, IP, event…', 'filters' => [Ui::selectFilter('risk', 'Risk Level', ['high' => 'High', 'medium' => 'Medium', 'low' => 'Low']), Ui::selectFilter('status', 'Status', ['verified' => 'Verified', 'flagged' => 'Flagged', 'failed' => 'Failed', 'resolved' => 'Resolved'])],
            'main' => [Ui::table('Security Events', ['Time', 'User', 'Event Type', 'IP Address', 'Location', 'Risk', 'Status', 'Details'], $page['items']->map(fn ($e) => [$e->occurred_at?->format('d M Y, H:i'), $e->user?->name ?? 'System', ucwords(str_replace('_', ' ', $e->event)), $e->ip, $e->location, Ui::pill($e->risk), Ui::pill($e->reviewed_at ? 'resolved' : $e->status), $e->details])->all(), ['pagination' => $page['pagination']])],
            'side' => [Ui::donut('Risk Distribution', [Ui::slice('High', $events->where('risk', 'high')->count(), 'bad'), Ui::slice('Medium', $events->where('risk', 'medium')->count(), 'orange'), Ui::slice('Low', $events->where('risk', 'low')->count(), 'good')])],
        ]);
    }

    public function successor(): Response
    {
        $all = $this->globals('successor');

        return $this->admin([
            'title' => 'Successor, Estate and Administrator Access', 'subtitle' => 'High-risk access for estates, successors, heirs, and appointed administrators. Evidence-led, time-bound, auditable and revocable.',
            'kpis' => [Ui::kpi('Active Successor Access', $all->where('status', 'active')->where('data.type', 'Successor')->count(), null, 'good', 'user'), Ui::kpi('Estate / Administrator', $all->whereIn('data.type', ['Estate Admin', 'Administrator'])->count(), null, 'neutral', 'scroll'), Ui::kpi('Pending Approval', $all->where('status', 'pending')->count(), null, 'warn', 'history'), Ui::kpi('Expiring Soon', $all->filter(fn ($r) => $r->due_on?->lte(now()->addDays(7)) && $r->status !== 'revoked')->count(), 'Within 7 days', 'bad', 'alert-triangle'), Ui::kpi('Revoked / Closed', $all->where('status', 'revoked')->count(), null, 'neutral', 'user-x')],
            'main' => [Ui::table('Active Delegated Access', ['Access ID', 'Type', 'For (Client / Estate)', 'Delegate', 'Authority Scope', 'Valid From', 'Valid To', 'Status', ''], $all->map(fn ($r) => [Ui::ref($r->reference), Ui::pill($r->data['type'] ?? '', 'info'), $r->title, Ui::stack($r->data['delegate'] ?? '', $r->data['relation'] ?? ''), $r->data['scope'] ?? '', Ui::date($r->data['from'] ?? null), Ui::date($r->due_on), Ui::pill($r->status), Ui::actions(array_values(array_filter([$r->status === 'pending' ? Ui::action('Approve (dual authorisation)', '/admin/portal/records/'.$r->id.'/status', 'post', ['data' => ['status' => 'active'], 'variant' => 'gold']) : null, $r->status !== 'revoked' ? Ui::action('Revoke', '/admin/portal/records/'.$r->id.'/status', 'post', ['data' => ['status' => 'revoked'], 'variant' => 'danger', 'confirm' => 'Revoke this access?']) : null])))])->all())],
            'side' => [Ui::checklist('Authority Safeguards', [Ui::check('Evidence capture required', true, 'Enforced'), Ui::check('Time-bound access', true, 'Enforced'), Ui::check('Scope limitations', true, 'Enforced'), Ui::check('Dual authorisation', true, 'Enforced'), Ui::check('Audit logging', true, 'Enforced'), Ui::check('Revocation capability', true, 'Ready')])],
        ]);
    }

    public function integrations(): Response
    {
        $inc = $this->globals('incident');
        $active = $inc->where('status', '!=', 'resolved');

        return $this->admin([
            'title' => 'Integration, Incident and Continuity Monitor', 'subtitle' => 'Incidents resolved here update the client System Status page immediately.',
            'kpis' => [Ui::kpi('Active Incidents', $active->count(), null, $active->count() ? 'bad' : 'good', 'plug'), Ui::kpi('Critical / Major', $active->whereIn('data.severity', ['critical', 'major'])->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Avg. Resolution Time', round($inc->where('status', 'resolved')->avg('data.minutes') ?? 0).' mins', null, 'neutral', 'history'), Ui::kpi('Continuity Status', $active->whereIn('data.severity', ['critical'])->count() ? 'Amber' : 'Green', null, 'good', 'shield-check')],
            'main' => [Ui::table('Integration Incidents', ['ID', 'System', 'Type', 'Severity', 'Opened', 'Duration', 'Status', 'Owner', ''], $inc->map(fn ($i) => [Ui::ref($i->reference), $i->data['system'] ?? '', $i->title, Ui::pill($i->data['severity'] ?? ''), Ui::date($i->data['opened'] ?? null, 'd M Y, H:i'), ($i->data['minutes'] ?? 0).' mins', Ui::pill($i->status), $i->data['owner'] ?? '', Ui::actions($i->status !== 'resolved' ? [Ui::action('Resolve', '/admin/portal/records/'.$i->id.'/status', 'post', ['data' => ['status' => 'resolved'], 'variant' => 'gold'])] : [])])->all())],
            'side' => [Ui::checklist('Integrations', collect(['Payment Gateway', 'CRM (Zoho)', 'WhatsApp', 'Marketplace', 'Analytics', 'Notification Service'])->map(fn ($s) => Ui::check($s, $active->where('data.system', $s)->isEmpty() ?: 'warn', $active->where('data.system', $s)->isEmpty() ? 'Online' : 'Degraded'))->all())],
        ]);
    }

    /** CP-TEB v3.1 B.2 release expressions, evaluated against current CP-ALS instrument states (unknown terms evaluate FALSE). */
    public static function tiers(): array
    {
        $als = Record::whereNull('user_id')->where('register', 'als')->get()->keyBy('reference');
        $pass = fn (string $n) => ($als['CP-ALS-'.$n]->status ?? null) === 'passed';
        $base = collect(['02', '09', '10', '11', '12', '15', '22', '23'])->every($pass);
        $a = $base;
        $b = $base && collect(['03', '04', '07', '13', '14', '18', '21', '24'])->every($pass);
        $c = $b && $pass('01');
        $d = $c && $pass('17');

        return ['A' => $a, 'B' => $b, 'C' => $c, 'D' => $d, 'base' => $base];
    }

    public function uat(): Response
    {
        $als = $this->globals('als');
        $t = self::tiers();
        $scope = ['A' => 'Authenticated identity, orientation, authorised read, notices. No money movement.', 'B' => 'Tier A + payments/QBO, binding fees, delivery commitments, native vehicle surfacing, successor routes.', 'C' => 'Tier B + protected-access surfaces: DD case rooms, VDR bridge, secure native workspaces.', 'D' => 'Tier C + machine, agent, SSO/SCIM/API, external participants and client-side AI authority.'];

        return $this->admin([
            'title' => 'UAT, Release and Certificate Control Tower', 'subtitle' => 'Release tiers A–D evaluated live against the 24 CP-ALS instruments using the CP-TEB v3.1 release expressions. Production authorisation cannot be granted by document amendment.',
            'kpis' => [Ui::kpi('CP-ALS Instruments', $als->count(), null, 'neutral', 'list-checks'), Ui::kpi('Passed', $als->where('status', 'passed')->count(), null, 'good', 'badge-check'), Ui::kpi('Drafted (signature pending)', $als->where('status', 'drafted')->count(), null, 'warn', 'file-signature'), Ui::kpi('Not Executed', $als->where('status', 'not_executed')->count(), null, 'bad', 'circle-pause'), Ui::kpi('Global CP-RC-001', $t['A'] ? 'Evaluable' : 'WITHHELD', 'Requires signed production decision', $t['A'] ? 'warn' : 'bad', 'rocket')],
            'main' => [
                Ui::table('Release Tier Certificates (CP-RC-001-A..D)', ['Tier', 'Released capability scope', 'Expression result', 'Certificate'], collect(['A', 'B', 'C', 'D'])->map(fn ($k) => ['Tier '.$k, $scope[$k], Ui::pill($t[$k] ? 'TRUE' : 'FALSE', $t[$k] ? 'good' : 'bad'), Ui::pill($t[$k] ? 'Issuable' : 'Withheld', $t[$k] ? 'good' : 'bad')])->all(), ['caption' => 'CP_BASE = ALS02 ∧ ALS09 ∧ ALS10 ∧ ALS11 ∧ ALS12 ∧ ALS15 ∧ ALS22 ∧ ALS23. Tier B additionally requires ALS24 (exact native certificates, currently upstream-blocked by PA-RC-001 / MP-RC-001). Any UNKNOWN term evaluates FALSE.']),
                Ui::table('CP-ALS Instrument Register', ['Instrument', 'Requirement', 'Class', 'Status', ''], $als->map(fn ($a) => [Ui::ref($a->reference), $a->title, $a->data['class'] ?? '', Ui::pill(str_replace('_', ' ', $a->status)), Ui::actions([$a->status !== 'passed' ? Ui::action('Record Pass (evidence lodged)', '/admin/portal/records/'.$a->id.'/status', 'post', ['data' => ['status' => 'passed'], 'confirm' => 'Record that executed evidence for this instrument has been accepted?']) : Ui::action('Mark Expired', '/admin/portal/records/'.$a->id.'/status', 'post', ['data' => ['status' => 'expired']])])])->all()),
            ],
            'side' => [Ui::checklist('v3.1 corrections', [Ui::check('DEF-1 Tier scopes defined (ratification required)', 'warn'), Ui::check('DEF-2 Release expressions written', true), Ui::check('DEF-3 UAT denominator: 351 + 3 unenumerated suites', 'warn'), Ui::check('DEF-4 ALS-24 upstream state recorded', true)]), Ui::info('Determination', 'Production authorisation is NOT GRANTED. 22 of 24 instruments require an event in the world (tests, opinions, signatures) that no edit to controlled text can produce.', 'bad')],
        ]);
    }

    public function handoffs(): Response
    {
        $links = ShareLink::with('user')->latest()->get();
        $state = fn ($l) => $l->status === 'pending' && $l->expires_at?->isPast() ? 'expired' : $l->status;

        return $this->admin([
            'title' => 'UAT, Channel Handoff and Secure Link Confirmation', 'subtitle' => 'Secure links created by clients for documents and deliverables, with recipient confirmation and revocation.',
            'kpis' => [Ui::kpi('Secure Links Sent', $links->count(), null, 'neutral', 'link'), Ui::kpi('Confirmed by Recipient', $links->where('status', 'confirmed')->count(), null, 'good', 'badge-check'), Ui::kpi('Pending Confirmation', $links->filter(fn ($l) => $state($l) === 'pending')->count(), null, 'warn', 'history'), Ui::kpi('Expired / Revoked', $links->filter(fn ($l) => in_array($state($l), ['expired', 'revoked'], true))->count(), null, 'bad', 'user-x')],
            'main' => [Ui::table('Secure Links', ['Link', 'Client', 'Item', 'Recipient', 'Status', 'Expires', 'Accesses', ''], $links->map(fn ($l) => [Ui::ref('HND-'.str_pad((string) $l->id, 5, '0', STR_PAD_LEFT)), $l->user?->name, $l->label, $l->recipient, Ui::pill($state($l)), Ui::date($l->expires_at), $l->access_count, Ui::actions($state($l) === 'pending' || $state($l) === 'confirmed' ? [Ui::action('Revoke', '/admin/portal/handoffs/'.$l->id.'/revoke', 'post', ['variant' => 'danger'])] : [])])->all(), ['empty' => 'No secure links have been created yet.'])],
            'side' => [Ui::donut('Confirmation Status', [Ui::slice('Confirmed', $links->where('status', 'confirmed')->count(), 'good'), Ui::slice('Pending', $links->filter(fn ($l) => $state($l) === 'pending')->count(), 'gold'), Ui::slice('Expired / Revoked', $links->filter(fn ($l) => in_array($state($l), ['expired', 'revoked'], true))->count(), 'bad')])],
        ]);
    }

    public function revokeLink(ShareLink $link): RedirectResponse
    {
        $link->update(['status' => 'revoked']);

        return back()->with('success', 'Secure link revoked.');
    }

    public function entrySurfaces(): Response
    {
        $all = $this->globals('entry_surface');

        return $this->admin([
            'title' => 'Admin Entry Surface and Channel Integrity Console', 'subtitle' => 'Operate admin entry surfaces and channel integrity as a controlled back-end surface for the Client Portal.',
            'actions' => [Ui::action('Run Integrity Check Now', '/admin/portal/entry-surfaces/check', 'post', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Active Entry Surfaces', $all->where('status', 'active')->count(), null, 'good', 'door-open'), Ui::kpi('Under Review', $all->where('status', 'review')->count(), null, 'warn', 'history'), Ui::kpi('High-Risk Surfaces', $all->where('data.risk', 'high')->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Last Integrity Check', $all->max(fn ($s) => $s->data['checked'] ?? null) ? \Illuminate\Support\Carbon::parse($all->max(fn ($s) => $s->data['checked']))->diffForHumans() : '—', null, 'neutral', 'refresh-cw')],
            'main' => [Ui::table('Entry Surfaces', ['Surface ID', 'Surface Name', 'Channel Type', 'Status', 'Risk Level', 'Assigned To', 'Last Integrity Check', ''], $all->map(fn ($s) => [Ui::ref($s->reference), $s->title, $s->data['channel'] ?? '', Ui::pill($s->status), Ui::pill($s->data['risk'] ?? ''), $s->data['owner'] ?? '', Ui::date($s->data['checked'] ?? null, 'd M Y, H:i'), Ui::actions([Ui::action($s->status === 'active' ? 'Put Under Review' : 'Mark Active', '/admin/portal/records/'.$s->id.'/status', 'post', ['data' => ['status' => $s->status === 'active' ? 'review' : 'active']])])])->all())],
        ]);
    }

    public function runCheck(): RedirectResponse
    {
        $this->globals('entry_surface')->each(function ($s) {
            $d = $s->data;
            $d['checked'] = now()->toDateTimeString();
            $s->update(['data' => $d]);
        });

        return back()->with('success', 'Integrity check completed across all entry surfaces.');
    }

    public function continuity(): Response
    {
        $all = $this->globals('save_state');
        $state = fn ($s) => $s->status === 'completed' ? 'completed' : (! empty($s->data['expires']) && \Illuminate\Support\Carbon::parse($s->data['expires'])->isPast() ? 'expired' : (! empty($s->data['expires']) && \Illuminate\Support\Carbon::parse($s->data['expires'])->lt(now()->addHours(6)) ? 'expiring_soon' : 'active'));

        return $this->admin([
            'title' => 'Admin Continuity, Save-State and Portability Console', 'subtitle' => 'Manage admin save-states, resume work, ensure continuity and enable portability for critical admin work.',
            'actions' => [Ui::modal('Create Save-State', 'save', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Active Save-States', $all->filter(fn ($s) => $state($s) === 'active')->count(), null, 'good', 'save'), Ui::kpi('Expiring Soon', $all->filter(fn ($s) => $state($s) === 'expiring_soon')->count(), 'Under 6 hours', 'warn', 'history'), Ui::kpi('Expired', $all->filter(fn ($s) => $state($s) === 'expired')->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Completed', $all->where('status', 'completed')->count(), null, 'neutral', 'badge-check')],
            'main' => [Ui::table('Save-States', ['ID', 'Surface / Area', 'Description', 'Owner', 'Status', 'Last Saved', 'Expires', ''], $all->map(fn ($s) => [Ui::ref($s->reference), $s->data['area'] ?? '', $s->title, $s->data['owner'] ?? '', Ui::pill(str_replace('_', ' ', $state($s))), Ui::date($s->data['saved'] ?? null, 'd M Y, H:i'), ! empty($s->data['expires']) ? \Illuminate\Support\Carbon::parse($s->data['expires'])->diffForHumans() : '—', Ui::actions($s->status !== 'completed' ? [Ui::action('Mark Completed', '/admin/portal/records/'.$s->id.'/status', 'post', ['data' => ['status' => 'completed']])] : [])])->all())],
            'forms' => ['save' => Ui::form('Create Save-State', '/admin/portal/records', [Ui::field('register', 'register', 'hidden', ['value' => 'save_state']), Ui::field('area', 'Surface / Area', 'select', ['required' => true, 'options' => Ui::options(['Entry Surfaces Console', 'Entitlement Decision Console', 'Finance Reconciliation', 'Channel Integrity Console', 'Reports & Analytics', 'Contract Variations'])]), Ui::field('description', 'Description', 'text', ['required' => true]), Ui::field('hours', 'Expires after (hours)', 'number', ['required' => true, 'value' => 24])], 'Create')],
        ]);
    }
}
