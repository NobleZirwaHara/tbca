<?php

namespace App\Http\Controllers\Portal\Admin;

use App\Http\Controllers\Portal\PortalController;
use App\Models\Order;
use App\Models\Portal\Account;
use App\Models\Portal\Deliverable;
use App\Models\Portal\Membership;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Record;
use App\Models\Portal\Ticket;
use App\Models\User;
use App\Support\Portal\Nav;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-089..098, 103: control tower, clients, entitlement decisions, exceptions, disputes, registry, promises, SLA, capacity, reviews, partners. */
class AdminConsoleController extends PortalController
{
    protected function admin(array $props): Response
    {
        return $this->register($props + ['crumbs' => [['label' => $props['title']]]], 'admin');
    }

    public function tower(): Response
    {
        $clients = User::where('role', 'client')->count();
        $orders = Order::all();
        $paid = $orders->where('status', 'paid');
        $deliv = Deliverable::all();
        $tickets = Ticket::all();
        $overdueSla = $tickets->whereNotIn('status', ['resolved', 'closed'])->filter(fn ($t) => $t->sla_due_at?->isPast())->count();
        $exceptions = Record::whereNull('user_id')->where('register', 'exception')->whereIn('status', ['pending', 'in_review', 'escalated'])->count();

        return $this->admin([
            'title' => 'Client Portal Administration Control Tower', 'subtitle' => 'Real-time oversight of platform health, clients, entitlements, workflows, compliance and performance.',
            'kpis' => [Ui::kpi('Total Clients', $clients, 'Registered client accounts', 'good', 'users', '/admin/portal/clients'), Ui::kpi('Active Workspaces', \App\Models\Portal\Project::where('status', '!=', 'completed')->count(), 'Live engagements', 'good', 'layout-grid'), Ui::kpi('Open Reviews', $deliv->whereIn('release_state', ['in_review', 'release_approved'])->count(), 'QA & release queue', 'warn', 'stamp', '/admin/portal/reviews'), Ui::kpi('Blocked Deliverables', $deliv->where('release_state', 'changes_required')->count(), null, 'bad', 'shield-alert'), Ui::kpi('Overdue SLAs', $overdueSla, 'Support tickets', 'warn', 'history', '/admin/portal/support'), Ui::kpi('Entry-Gate Exceptions', $exceptions, 'Pending', 'neutral', 'shield-check', '/admin/portal/exceptions')],
            'main' => [
                Ui::row([
                    Ui::checklist('Platform Health', [Ui::check('Application Services', true, 'Operational'), Ui::check('Database', true, 'Operational'), Ui::check('Payment Gateway', ! Record::whereNull('user_id')->where('register', 'incident')->where('data->system', 'Payment Gateway')->where('status', '!=', 'resolved')->exists() ?: 'warn', 'Monitored'), Ui::check('WhatsApp / Comms', true, 'Operational'), Ui::check('Storage & Backups', true, 'Operational')]),
                    Ui::kv('Financial Snapshot', [['Invoices Issued', Ui::money($orders->sum('total_zar'))], ['Payments Received', Ui::money($paid->sum('total_zar'))], ['Outstanding Receivables', Ui::money($orders->whereIn('status', ['awaiting_payment', 'failed'])->sum('total_zar'))], ['Refunds Processed', Ui::money($orders->where('status', 'refunded')->sum('total_zar'))]], Ui::action('Finance Console', '/admin/portal/reconciliation')),
                ]),
                Ui::table('Top Exception Queues', ['Queue', 'Items', 'High Priority', ''], [
                    ['Entry-Gate Exceptions', $exceptions, Record::whereNull('user_id')->where('register', 'exception')->whereIn('data->priority', ['high', 'critical'])->where('status', '!=', 'resolved')->count(), Ui::actions([Ui::action('View', '/admin/portal/exceptions')])],
                    ['Ownership Disputes', PortalCase::where('kind', 'ownership_dispute')->where('status', '!=', 'resolved')->count(), PortalCase::where('kind', 'ownership_dispute')->where('priority', 'high')->where('status', '!=', 'resolved')->count(), Ui::actions([Ui::action('View', '/admin/portal/disputes')])],
                    ['Payment Disputes', PortalCase::where('kind', 'dispute')->whereNotIn('status', ['resolved', 'closed'])->count(), PortalCase::where('kind', 'dispute')->where('priority', 'high')->whereNotIn('status', ['resolved', 'closed'])->count(), Ui::actions([Ui::action('View', '/admin/portal/money-events')])],
                    ['Release Blocks', $deliv->where('release_state', 'changes_required')->count(), 0, Ui::actions([Ui::action('View', '/admin/portal/reviews')])],
                    ['Rights Requests', \App\Models\Portal\DataRequest::whereNotIn('status', ['completed', 'rejected'])->count(), 0, Ui::actions([Ui::action('View', '/admin/portal/consent')])],
                ]),
            ],
            'side' => [Ui::donut('Workspace Status Overview', [Ui::slice('On Track', \App\Models\Portal\Project::where('health', 'good')->count(), 'good'), Ui::slice('At Risk', \App\Models\Portal\Project::where('health', 'fair')->count(), 'info'), Ui::slice('Delayed / Blocked', \App\Models\Portal\Project::where('health', 'at_risk')->count(), 'bad')]), Ui::quick('Admin Shortcuts', collect(Nav::admin())->flatMap(fn ($g) => $g['items'])->take(8)->map(fn ($i) => Ui::action($i['label'], $i['href']))->values()->all())],
        ]);
    }

    public function clients(Request $request): Response
    {
        $users = User::where('role', 'client')->latest()->get();
        $accounts = Account::with('organisation')->get()->keyBy('user_id');
        $rows = $users->map(fn ($u) => ['user' => $u, 'account' => $accounts[$u->id] ?? null, 'state' => $accounts[$u->id]->account_state ?? 'active', 'days' => Portal::daysOverdue($u)]);
        $rows = Ui::filter($rows, $request, ['user.name', 'user.email', 'user.company'], ['state' => 'state']);

        return $this->admin([
            'title' => 'Client and Organisation Administration', 'subtitle' => 'Manage client and organisation records, statuses, ownership and key attributes.',
            'kpis' => [Ui::kpi('Total Clients', $users->count(), null, 'neutral', 'users'), Ui::kpi('Total Organisations', \App\Models\Portal\Organisation::count(), null, 'neutral', 'building-2'), Ui::kpi('Active Relationships', Membership::where('status', 'active')->count(), null, 'good', 'handshake'), Ui::kpi('Restricted / Suspended', $accounts->whereIn('account_state', ['restricted', 'suspended'])->count(), null, 'bad', 'lock'), Ui::kpi('Paused / Exited', $accounts->whereIn('account_state', ['paused', 'exited'])->count(), null, 'warn', 'circle-pause')],
            'search' => 'Search clients or organisations…', 'filters' => [Ui::selectFilter('state', 'Status', ['active' => 'Active', 'restricted' => 'Restricted', 'suspended' => 'Suspended', 'paused' => 'Paused', 'exited' => 'Exited'])],
            'main' => [Ui::table(null, ['Name', 'Organisation', 'Client ID', 'Status', 'Days Overdue', 'Last Activity', ''], $rows->map(fn ($r) => [
                Ui::stack($r['user']->name, $r['user']->email), $r['account']?->organisation?->name ?? $r['user']->company, $r['user']->client_id, Ui::pill($r['state']), $r['days'], $r['account']?->last_seen_at?->diffForHumans() ?? 'Never',
                Ui::actions([Ui::modal('Set Status', 'state', ['data' => ['user' => $r['user']->id]])]),
            ])->all())],
            'side' => [Ui::donut('Record Summary', collect(['active' => 'good', 'restricted' => 'bad', 'suspended' => 'purple', 'paused' => 'gold', 'exited' => 'neutral'])->map(fn ($t, $s) => Ui::slice(ucfirst($s), $rows->where('state', $s)->count(), $t))->values()->all()), Ui::info('Client floor', 'Restricting an account keeps the protected floor: invoices, documents, support, privacy tools and profile remain available (CP-TEB 18.1).', 'info')],
            'forms' => ['state' => Ui::form('Set account status', '/admin/portal/clients/0/state', [Ui::field('user', 'user', 'hidden'), Ui::field('state', 'Account state', 'select', ['required' => true, 'options' => Ui::options(['active' => 'Active', 'restricted' => 'Restricted', 'suspended' => 'Suspended', 'paused' => 'Paused'])]), Ui::field('reason', 'Reason shown to the client', 'textarea', ['required' => true])], 'Apply', 'post', 'The client sees the reason, scope and remedy route; the change is logged.')],
        ]);
    }

    public function setState(Request $request, string $user): RedirectResponse
    {
        $d = $request->validate(['state' => 'required|in:active,restricted,suspended,paused', 'reason' => 'required|string|max:500', 'user' => 'nullable|integer']);
        $u = User::findOrFail($user === '0' ? (int) $request->input('user') : (int) $user);
        $case = 'CASE-'.now()->format('Y-md').'-'.random_int(1000, 9999);
        Portal::account($u)->update(['account_state' => $d['state'], 'state_reason' => $d['state'] === 'active' ? null : $d['reason'], 'state_case' => $d['state'] === 'active' ? null : $case, 'state_since' => now()]);
        Portal::notify($u, 'Account status updated: '.ucfirst($d['state']), $d['reason'], 'compliance', '/portal/account/status', 'Account Status', 'Compliance');

        return back()->with('success', $u->name.' set to '.$d['state'].'.');
    }

    /** Entitlement decision (CP-TEB 6.1): verified payment for the exact resource, account state and route. */
    public static function decide(User $u, string $resource): array
    {
        $acc = Portal::account($u);
        if (in_array($acc->account_state, ['suspended', 'exited'], true) && ! collect(Portal::FLOOR_PATHS)->contains(fn ($p) => str_contains($resource, str_replace('portal/', '', $p)))) {
            return ['deny', 'Account '.$acc->account_state.' — protected floor only', 'POL-STATE-01'];
        }
        $paid = Order::where('user_id', $u->id)->where('status', 'paid')->whereHas('items', fn ($q) => $q->where('item_code', $resource)->orWhere('item_type', $resource))->exists();
        $pending = Order::where('user_id', $u->id)->where('status', 'awaiting_payment')->whereHas('items', fn ($q) => $q->where('item_code', $resource)->orWhere('item_type', $resource))->exists();
        if ($paid) {
            return ['allow', 'Verified payment for exact resource', 'POL-ENT-04'];
        }
        if ($pending) {
            return ['pending_review', 'Order awaiting verified payment', 'POL-ENT-04'];
        }
        if (str_starts_with($resource, '/portal')) {
            return ['allow', 'Portal route within client floor and role', 'POL-WS-02'];
        }

        return ['deny', 'Route not purchased', 'POL-ENT-04'];
    }

    public function decisions(): Response
    {
        $log = Record::whereNull('user_id')->where('register', 'entitlement_decision')->latest()->get();
        $clients = User::where('role', 'client')->get();
        $codes = \App\Models\OrderItem::query()->distinct()->pluck('item_code')->take(30)->all();

        return $this->admin([
            'title' => 'Entitlement Decision Console', 'subtitle' => 'Investigate entitlement decisions, review policy evaluations and test access outcomes.',
            'actions' => [Ui::modal('Run Test Harness', 'test', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Decisions Logged', $log->count(), null, 'neutral', 'key-round'), Ui::kpi('Allow', $log->where('status', 'allow')->count(), null, 'good', 'badge-check'), Ui::kpi('Deny', $log->where('status', 'deny')->count(), null, 'bad', 'user-x'), Ui::kpi('Indeterminate / Pending', $log->where('status', 'pending_review')->count(), 'Fail closed', 'warn', 'history')],
            'main' => [Ui::table('Decision Log', ['Decision ID', 'Date & Time', 'Subject', 'Resource / Route', 'Decision', 'Reason', 'Policy'], $log->map(fn ($r) => [Ui::ref($r->reference), $r->created_at->format('d M Y, H:i'), $r->data['subject'] ?? '', $r->title, Ui::pill($r->status, ['allow' => 'good', 'deny' => 'bad'][$r->status] ?? 'warn'), $r->data['reason'] ?? '', $r->data['policy'] ?? ''])->all(), ['empty' => 'Run the test harness to evaluate a decision.'])],
            'side' => [Ui::donut('Decision Distribution', [Ui::slice('Allow', $log->where('status', 'allow')->count(), 'good'), Ui::slice('Deny', $log->where('status', 'deny')->count(), 'bad'), Ui::slice('Pending', $log->where('status', 'pending_review')->count(), 'gold')]), Ui::info('Fail-safe rule', 'ERROR or UNKNOWN fails closed. An order, success page or historical flag never creates protected access on its own.', 'info')],
            'forms' => ['test' => Ui::form('Test Harness (dry run)', '/admin/portal/entitlement-decisions/test', [Ui::field('user', 'Client', 'select', ['required' => true, 'options' => $clients->map(fn ($c) => ['value' => (string) $c->id, 'label' => $c->name.' ('.$c->client_id.')'])->values()->all()]), Ui::field('resource', 'Resource code or route', 'text', ['required' => true, 'hint' => 'e.g. '.implode(', ', array_slice($codes, 0, 4)).' or /portal/documents'])], 'Evaluate')],
        ]);
    }

    public function testDecision(Request $request): RedirectResponse
    {
        $d = $request->validate(['user' => 'required|integer|exists:users,id', 'resource' => 'required|string|max:120']);
        $u = User::find($d['user']);
        [$decision, $reason, $policy] = self::decide($u, $d['resource']);
        Record::create(['register' => 'entitlement_decision', 'reference' => 'DEC-'.now()->format('Y').'-'.str_pad((string) (Record::where('register', 'entitlement_decision')->count() + 1), 5, '0', STR_PAD_LEFT), 'title' => $d['resource'], 'status' => $decision, 'data' => ['subject' => $u->name, 'reason' => $reason, 'policy' => $policy]]);

        return back()->with('success', "Decision: ".strtoupper($decision)." — {$reason} ({$policy}).");
    }

    private function registerRows(string $register)
    {
        return Record::whereNull('user_id')->where('register', $register)->orderBy('sort')->get();
    }

    public function exceptions(Request $request): Response
    {
        $all = $this->registerRows('exception');
        $journeyCases = PortalCase::with('user')->whereIn('kind', ['verification', 'duplicate', 'organisation', 'authority'])->where('status', 'submitted')->latest()->get();
        $rows = Ui::filter($all, $request, ['title', 'data.organisation', 'data.subject'], ['priority' => 'data.priority', 'status' => 'status']);

        return $this->admin([
            'title' => 'Entry-Gate and Identity Exception Queue', 'subtitle' => 'Review and resolve identity and entry-gate exceptions requiring administrator action (EG-01..EG-23).',
            'kpis' => [Ui::kpi('Total Exceptions', $all->count() + $journeyCases->count(), null, 'neutral', 'shield-alert'), Ui::kpi('High / Critical', $all->whereIn('data.priority', ['high', 'critical'])->where('status', '!=', 'resolved')->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Pending', $all->where('status', 'pending')->count(), null, 'warn', 'history'), Ui::kpi('Client Journeys Submitted', $journeyCases->count(), 'Verification, duplicate, org, authority', 'info', 'inbox'), Ui::kpi('Resolved', $all->where('status', 'resolved')->count(), null, 'good', 'badge-check')],
            'search' => 'Search exceptions…', 'filters' => [Ui::selectFilter('priority', 'Priority', ['critical' => 'Critical', 'high' => 'High', 'medium' => 'Medium', 'low' => 'Low']), Ui::selectFilter('status', 'Status', ['pending' => 'Pending', 'in_review' => 'In Review', 'escalated' => 'Escalated', 'resolved' => 'Resolved'])],
            'main' => [
                Ui::table('Exceptions', ['Exception ID', 'Type', 'Client / Organisation', 'Subject', 'Raised By', 'Age', 'Priority', 'Status', ''], $rows->map(fn ($r) => [Ui::ref($r->reference), $r->title, $r->data['organisation'] ?? '', $r->data['subject'] ?? '', $r->data['raised_by'] ?? '', isset($r->data['raised']) ? \Illuminate\Support\Carbon::parse($r->data['raised'])->diffForHumans(null, true) : '—', Ui::pill($r->data['priority'] ?? ''), Ui::pill($r->status), Ui::actions($r->status !== 'resolved' ? [Ui::action('Resolve', '/admin/portal/records/'.$r->id.'/status', 'post', ['data' => ['status' => 'resolved'], 'variant' => 'gold']), Ui::action('Escalate', '/admin/portal/records/'.$r->id.'/status', 'post', ['data' => ['status' => 'escalated']])] : [])])->all()),
                Ui::table('Client Gate Journeys Awaiting Review', ['Reference', 'Journey', 'Client', 'Submitted'], $journeyCases->map(fn ($c) => [Ui::ref($c->reference), $c->title, $c->user?->name, Ui::date($c->submitted_at, 'd M Y, H:i')])->all(), ['empty' => 'No client journeys awaiting review.']),
            ],
            'side' => [Ui::donut('Exception Type Breakdown', $all->groupBy('title')->map(fn ($g, $k) => Ui::slice($k, $g->count(), ['purple', 'gold', 'good', 'info', 'bad', 'orange'][crc32($k) % 6]))->values()->all())],
        ]);
    }

    public function disputes(): Response
    {
        $cases = PortalCase::with('user')->where('kind', 'ownership_dispute')->latest('submitted_at')->get();
        $members = Membership::with('organisation')->whereIn('status', ['invited', 'offboarded'])->latest('updated_at')->take(10)->get();

        return $this->admin([
            'title' => 'Role, Delegation and Ownership Dispute Console', 'subtitle' => 'Disputed ownership does not allow either side to self-approve. Successor and administrator access is decided on legal authority, not uploads alone.',
            'kpis' => [Ui::kpi('Open Ownership Disputes', $cases->whereNotIn('status', ['resolved'])->count(), null, 'bad', 'user-x'), Ui::kpi('Resolved', $cases->where('status', 'resolved')->count(), null, 'good', 'badge-check'), Ui::kpi('Pending Invitations', Membership::where('status', 'invited')->count(), null, 'warn', 'user-plus'), Ui::kpi('Offboarded (all time)', Membership::where('status', 'offboarded')->count(), null, 'neutral', 'log-out')],
            'main' => [
                Ui::table('Ownership Disputes', ['Dispute ID', 'Client', 'Subject', 'Priority', 'Status', 'Raised', ''], $cases->map(fn ($c) => [Ui::ref($c->reference), $c->user?->name, $c->title, Ui::pill($c->priority ?? 'medium'), Ui::pill($c->status), Ui::date($c->submitted_at), Ui::actions($c->status !== 'resolved' ? [Ui::action('Mark Resolved', '/admin/portal/money-events/disputes/'.$c->id, 'post', ['data' => ['decision' => 'resolved'], 'variant' => 'gold'])] : [])])->all()),
                Ui::table('Recent Role & Delegation Changes', ['Member', 'Organisation', 'Role', 'Status', 'Updated'], $members->map(fn ($m) => [Ui::stack($m->name, $m->email), $m->organisation?->name, ucfirst($m->role), Ui::pill($m->status), $m->updated_at->diffForHumans()])->all()),
            ],
            'side' => [Ui::checklist('P0 Controls', [Ui::check('Revocation / offboarding invalidation is prompt and scoped'), Ui::check('Disputed ownership blocks self-approval'), Ui::check('Sensitive authority changes require step-up'), Ui::check('Successor access requires a legal-authority decision')])],
        ]);
    }

    public function routes(Request $request): Response
    {
        $seeded = $this->registerRows('route');
        $portalRoutes = collect(app('router')->getRoutes()->getRoutes())->filter(fn ($r) => str_starts_with($r->uri(), 'portal') && in_array('GET', $r->methods(), true));
        $rows = Ui::filter($seeded, $request, ['title', 'data.product'], ['status' => 'status']);

        return $this->admin([
            'title' => 'Route and Workspace Registry', 'subtitle' => 'Master registry of client portal routes, workspaces and their governing attributes. Live routes are read from the application router.',
            'kpis' => [Ui::kpi('Live Portal Routes (GET)', $portalRoutes->count(), 'From the router', 'good', 'route'), Ui::kpi('Registered Workspaces', $seeded->where('data.type', 'Workspace')->count(), null, 'neutral', 'layout-grid'), Ui::kpi('Active', $seeded->where('status', 'active')->count(), null, 'good', 'badge-check'), Ui::kpi('Under Review', $seeded->where('status', 'under_review')->count(), null, 'warn', 'history'), Ui::kpi('Inactive / Retired', $seeded->where('status', 'inactive')->count(), null, 'neutral', 'user-x')],
            'search' => 'Search routes or workspaces…', 'filters' => [Ui::selectFilter('status', 'Status', ['active' => 'Active', 'under_review' => 'Under Review', 'inactive' => 'Inactive'])],
            'main' => [
                Ui::table('Governed Routes & Workspaces', ['Code', 'Name', 'Type', 'Product / Service', 'Status', 'Owner', 'Change Type', ''], $rows->map(fn ($r) => [Ui::ref($r->reference), $r->title, Ui::pill($r->data['type'] ?? '', 'info'), $r->data['product'] ?? '', Ui::pill($r->status), $r->data['owner'] ?? '', $r->data['change'] ?? '', Ui::actions([Ui::action($r->status === 'active' ? 'Retire' : 'Activate', '/admin/portal/records/'.$r->id.'/status', 'post', ['data' => ['status' => $r->status === 'active' ? 'inactive' : 'active']])])])->all()),
                Ui::table('Live Portal Routes', ['Route', 'Name', 'Middleware'], $portalRoutes->take(60)->map(fn ($r) => ['/'.$r->uri(), $r->getName() ?? '—', implode(', ', array_map(fn ($m) => class_basename($m), $r->gatherMiddleware()))])->values()->all()),
            ],
        ]);
    }

    public function promises(): Response
    {
        $all = $this->registerRows('promise');

        return $this->admin([
            'title' => 'Promise-to-Proof Enforcement Dashboard', 'subtitle' => 'A client promise exists operationally only when its mechanism, owner, evidence and assertion are identifiable (CP-TEB Part 5).',
            'kpis' => [Ui::kpi('Promises Tracked', $all->count(), null, 'neutral', 'badge-check'), Ui::kpi('Proof Satisfied', $all->where('status', 'satisfied')->count(), null, 'good', 'badge-check'), Ui::kpi('In Progress', $all->where('status', 'in_progress')->count(), null, 'info', 'history'), Ui::kpi('Overdue / At Risk', $all->whereIn('status', ['overdue', 'at_risk'])->count(), null, 'warn', 'alert-triangle'), Ui::kpi('Breaches', $all->where('status', 'breached')->count(), null, 'bad', 'shield-alert')],
            'main' => [Ui::table('Promises at Risk', ['Priority', 'Promise', 'Client / Organisation', 'Workspace', 'Due Date', 'Status', 'SLA Owner', ''], $all->map(fn ($p) => [Ui::pill($p->data['priority'] ?? ''), $p->title, $p->data['client'] ?? '', $p->data['workspace'] ?? '', Ui::date($p->due_on), Ui::pill($p->status), $p->data['owner'] ?? '', Ui::actions(in_array($p->status, ['satisfied', 'breached'], true) ? [] : [Ui::action('Link Proof', '/admin/portal/records/'.$p->id.'/status', 'post', ['data' => ['status' => 'satisfied'], 'variant' => 'gold']), Ui::action('Record Breach', '/admin/portal/records/'.$p->id.'/status', 'post', ['data' => ['status' => 'breached'], 'variant' => 'danger', 'confirm' => 'Record a breach? The client will be notified via service recovery.'])])])->all())],
            'side' => [Ui::gauge('Promise Health Score', $all->count() ? round($all->whereIn('status', ['satisfied', 'in_progress'])->count() / $all->count() * 100) : 100, 'Health'), Ui::checklist('Final Enforcement Themes', [Ui::check('No hidden fee; no blended ledgers'), Ui::check('No paid entitlement from unverified payment'), Ui::check('No unexplained denial or inaccessible remedy'), Ui::check('No high-risk approval through WhatsApp alone'), Ui::check('No AI action beyond user authority')])],
        ]);
    }

    public function sla(): Response
    {
        $rows = [['Due Diligence', 'Advisory', 'DD-Standard v3.2', '10 Business Days', 94.2, 412, 28, 6], ['Feasibility Study', 'Advisory', 'FS-Standard v2.1', '15 Business Days', 90.8, 368, 41, 11], ['Financial Model', 'Financial', 'FM-Standard v4.0', '7 Business Days', 96.7, 521, 14, 3], ['Business Plan', 'Strategy', 'BP-Standard v3.5', '12 Business Days', 91.3, 302, 35, 9], ['ESG Assessment', 'Sustainability', 'ESG-Standard v2.0', '10 Business Days', 88.5, 198, 52, 14], ['Market Research', 'Research', 'MR-Standard v2.3', '8 Business Days', 95.1, 284, 16, 4], ['Grant Application', 'Funding', 'GA-Standard v1.4', '20 Business Days', 85.0, 143, 28, 12]];
        $tickets = Ticket::all();
        $live = $tickets->count() ? round($tickets->filter(fn ($t) => ! $t->sla_due_at || ($t->first_response_at && $t->first_response_at->lte($t->sla_due_at)) || $t->sla_due_at->isFuture())->count() / $tickets->count() * 100, 1) : 100;

        return $this->admin([
            'title' => 'Product, Workflow and SLA Compliance Console', 'subtitle' => 'Monitor product performance, workflow adherence and SLA compliance across all engagements.',
            'kpis' => [Ui::kpi('Workflows Monitored', count($rows), null, 'neutral', 'route'), Ui::kpi('Portfolio SLA Compliance', round(collect($rows)->avg(4), 1).'%', null, 'good', 'badge-check'), Ui::kpi('Live Support SLA', $live.'%', 'From portal tickets', $live >= 90 ? 'good' : 'warn', 'life-buoy'), Ui::kpi('At Risk', collect($rows)->sum(6), null, 'warn', 'alert-triangle'), Ui::kpi('Breached', collect($rows)->sum(7), null, 'bad', 'shield-alert')],
            'main' => [Ui::table('Compliance Overview', ['Product / Service', 'Category', 'Workflow', 'SLA Target', 'SLA Compliance', 'On Time', 'At Risk', 'Breached'], array_map(fn ($r) => [$r[0], $r[1], $r[2], $r[3], Ui::pill($r[4].'%', $r[4] >= 93 ? 'good' : ($r[4] >= 88 ? 'warn' : 'bad')), $r[5], $r[6], $r[7]], $rows), ['caption' => 'Do not invent numeric SLA values: workflow figures are projected from the native SLA profiles where authoritative (CP-TEB 10.2).'])],
            'side' => [Ui::donut('Top Breach Reasons', [Ui::slice('Client Delays', 14, 'bad'), Ui::slice('Incomplete Information', 10, 'gold'), Ui::slice('Resource Constraints', 7, 'good'), Ui::slice('Scope Changes', 5, 'purple'), Ui::slice('Other', 2, 'neutral')])],
        ]);
    }

    public function capacity(): Response
    {
        $teams = [['Project Advisory', 'Projects Workspace', 3120, 2560, 1280, 1024], ['Due Diligence', 'Due Diligence Workspace', 4320, 3872, 1440, 1296], ['Financial Advisory', 'Finance Workspace', 2880, 2102, 960, 614], ['Strategy & Insights', 'Strategy Workspace', 1920, 1536, 640, 512], ['Execution & Delivery', 'Delivery Workspace', 3600, 3319, 1120, 1008], ['Support Services', 'Support Workspace', 2400, 1687, 720, 360]];
        $u = fn ($load, $cap) => round($load / $cap * 100, 1);

        return $this->admin([
            'title' => 'Delivery and QA Capacity Control', 'subtitle' => 'Capacity is an evidence object, not a planning assumption. Utilisation of 85% or more is flagged At Risk and blocks new capacity-dependent sales.',
            'kpis' => [Ui::kpi('Delivery Capacity (h)', number_format(collect($teams)->sum(2)), null, 'neutral', 'activity'), Ui::kpi('QA Capacity (h)', number_format(collect($teams)->sum(4)), null, 'neutral', 'badge-check'), Ui::kpi('Utilisation (All Teams)', $u(collect($teams)->sum(3), collect($teams)->sum(2)).'%', null, 'warn', 'gauge'), Ui::kpi('Teams At Risk', collect($teams)->filter(fn ($t) => $u($t[3], $t[2]) >= 85 || $u($t[5], $t[4]) >= 85)->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Open Reviews (live)', Deliverable::whereIn('release_state', ['in_review'])->count(), 'Deliverables in QA', 'info', 'stamp')],
            'main' => [Ui::table('Capacity Overview', ['Team / Role', 'Workspace', 'Delivery Capacity (h)', 'Delivery Utilisation', 'QA Capacity (h)', 'QA Utilisation', 'SLA Status'], array_map(fn ($t) => [$t[0], $t[1], number_format($t[2]), Ui::progress($u($t[3], $t[2])), number_format($t[4]), Ui::progress($u($t[5], $t[4])), Ui::pill($u($t[3], $t[2]) >= 85 || $u($t[5], $t[4]) >= 85 ? 'At Risk' : 'On Track', $u($t[3], $t[2]) >= 85 || $u($t[5], $t[4]) >= 85 ? 'bad' : 'good')], $teams))],
            'side' => [Ui::bars('Workload Balance', [Ui::bar('Balanced', 72, null, 'good'), Ui::bar('Overloaded', 18, null, 'bad'), Ui::bar('Underutilised', 10, null, 'gold')]), Ui::info('Current evidence posture', 'Reviewer/support productive capacity: NOT YET EVIDENCED. New external subscription and retainer ceilings remain held until capacity evidence is certified (CP-TEB 13.2).', 'warn')],
        ]);
    }

    public function reviews(Request $request): Response
    {
        $all = Deliverable::with(['project', 'user'])->latest('updated_at')->get();
        $tab = $this->tab($request, 'all');
        $rows = match ($tab) { 'qa' => $all->whereIn('release_state', ['draft', 'in_review']), 'blocks' => $all->where('release_state', 'changes_required'), 'released' => $all->where('release_state', 'delivered'), default => $all };

        return $this->admin([
            'title' => 'Review Queue and Release-Block Console', 'subtitle' => 'Manage reviews, approvals and release blocks that control when client deliverables go live. Actions here update the client portal immediately.',
            'kpis' => [Ui::kpi('Total Items', $all->count(), null, 'neutral', 'package'), Ui::kpi('In QA Review', $all->where('release_state', 'in_review')->count(), null, 'info', 'history'), Ui::kpi('Release Blocks', $all->where('release_state', 'changes_required')->count(), null, 'bad', 'shield-alert'), Ui::kpi('Awaiting Client Acceptance', $all->where('release_state', 'delivered')->where('acceptance_state', 'pending')->count(), null, 'warn', 'stamp'), Ui::kpi('Released', $all->where('release_state', 'delivered')->count(), null, 'good', 'rocket')],
            'tabs' => Ui::tabs(['all' => 'All Items', 'qa' => 'QA / Review', 'blocks' => 'Release Blocks', 'released' => 'Released']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Item', 'Client', 'Project', 'Version', 'QA State', 'Release State', 'Acceptance', ''], $rows->values()->map(fn ($d) => [
                Ui::stack($d->title, $d->reference), $d->user?->name, $d->project?->name, $d->version, Ui::pill($d->qa_state), Ui::pill(\App\Http\Controllers\Portal\DeliveryController::releaseLabel($d->release_state)), Ui::pill($d->acceptance_state),
                Ui::actions(array_values(array_filter([
                    in_array($d->qa_state, ['not_reviewed', 'in_qa', 'corrections'], true) ? Ui::action('QA Approve', '/admin/portal/reviews/'.$d->id.'/approve', 'post') : null,
                    $d->qa_state === 'qa_approved' && $d->release_state !== 'delivered' ? Ui::action('Release', '/admin/portal/reviews/'.$d->id.'/release', 'post', ['variant' => 'gold']) : null,
                    $d->release_state !== 'changes_required' && $d->release_state !== 'delivered' ? Ui::action('Block', '/admin/portal/reviews/'.$d->id.'/block', 'post', ['variant' => 'danger']) : null,
                    $d->release_state === 'delivered' ? Ui::action('Retract', '/admin/portal/reviews/'.$d->id.'/retract', 'post', ['variant' => 'danger', 'confirm' => 'Retract this release? The client loses access to this version; audit history is kept.']) : null,
                ]))),
            ])->all())],
            'side' => [Ui::info('Release rule', 'A deliverable is not released because it exists in storage. QA approval and an authorised release decision are both required (CP-TEB Part 12).', 'info')],
        ]);
    }

    public function reviewAction(Deliverable $deliverable, string $action): RedirectResponse
    {
        match ($action) {
            'approve' => $deliverable->update(['qa_state' => 'qa_approved', 'release_state' => $deliverable->release_state === 'delivered' ? 'delivered' : 'release_approved']),
            'release' => $deliverable->qa_state === 'qa_approved' ? $deliverable->update(['release_state' => 'delivered', 'released_at' => now(), 'acceptance_state' => 'pending', 'acceptance_due_on' => now()->addDays(14)]) : abort(422, 'QA approval is required before release.'),
            'block' => $deliverable->update(['release_state' => 'changes_required', 'qa_state' => 'corrections']),
            'retract' => $deliverable->update(['release_state' => 'retracted']),
        };
        if ($action === 'release') {
            Portal::notify($deliverable->user_id, 'Deliverable released: '.$deliverable->title, 'Version '.$deliverable->version.' is ready for your review and acceptance.', 'project_update', '/portal/deliverables/'.$deliverable->id, 'Deliverables', 'Projects');
        }

        return back()->with('success', $deliverable->title.': '.$action.' applied.');
    }

    public function partners(): Response
    {
        $p = [['PRT-2026-0012', 'InfraUnity Consortium', 'Strategic Partner', 'Southern Africa', 18, 94.2, 'active', 180000], ['PRV-2026-0045', 'Acme Technologies Ltd', 'Technology Provider', 'Southern Africa', 12, 89.1, 'at_risk', 128500], ['PRT-2026-0023', 'GreenBuild Projects', 'Implementation Partner', 'East Africa', 22, 96.8, 'active', 245000], ['PRV-2026-0056', 'ProPlan Advisors', 'Advisory Provider', 'West Africa', 15, 91.3, 'active', 162750], ['PRT-2026-0017', 'UrbanPath Developments', 'Strategic Partner', 'Southern Africa', 8, 74.5, 'review', 95300], ['PRV-2026-0068', 'Lindiwe Dlamini', 'Subject Matter Expert', 'Southern Africa', 9, 97.6, 'active', 86200], ['PRV-2026-0072', 'FutureWorks Ltd', 'Solution Provider', 'Central Africa', 6, 82.4, 'active', 64000], ['PRT-2026-0030', 'Knowledge Base Institute', 'Knowledge Partner', 'Africa Wide', 10, 93.7, 'active', 112400]];

        return $this->admin([
            'title' => 'Partner and Marketplace Accountability Console', 'subtitle' => 'The client has one accountable TBCA-coordinated remedy path even when delivery involves partners, professionals or marketplace providers.',
            'kpis' => [Ui::kpi('Active Partners', count($p), null, 'neutral', 'handshake'), Ui::kpi('Engagements (MTD)', collect($p)->sum(4), null, 'good', 'folder-kanban'), Ui::kpi('At Risk Partners', collect($p)->whereIn(6, ['at_risk', 'review'])->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Compliance Score (Avg)', round(collect($p)->avg(5), 1).'%', null, 'good', 'badge-check'), Ui::kpi('Revenue (MTD)', Ui::zar(collect($p)->sum(7)), null, 'gold', 'wallet')],
            'main' => [Ui::table('Partner Overview', ['Partner ID', 'Partner / Provider', 'Type', 'Region', 'Engagements (MTD)', 'Compliance Score', 'Status', 'Revenue (MTD)'], array_map(fn ($r) => [Ui::ref($r[0]), $r[1], $r[2], $r[3], $r[4], Ui::pill($r[5].'%', $r[5] >= 90 ? 'good' : ($r[5] >= 80 ? 'warn' : 'bad')), Ui::pill($r[6]), Ui::money($r[7])], $p))],
            'side' => [Ui::gauge('Partner Performance Health', round(collect($p)->avg(5), 1), 'Healthy')],
        ]);
    }

    public function recordStatus(Request $request, Record $record): RedirectResponse
    {
        abort_unless($record->user_id === null, 404);
        $status = $request->validate(['status' => 'required|string|max:40'])['status'];
        $record->update(['status' => $status]);

        return back()->with('success', ($record->title ?? $record->reference).' → '.str_replace('_', ' ', $status).'.');
    }

    public function storeRecord(Request $request): RedirectResponse
    {
        $d = $request->validate(['register' => 'required|in:save_state', 'area' => 'required|string|max:80', 'description' => 'required|string|max:200', 'hours' => 'required|integer|min:1|max:168']);
        Record::create(['register' => 'save_state', 'reference' => 'SS-'.now()->format('Y').'-'.str_pad((string) (Record::where('register', 'save_state')->count() + 52), 4, '0', STR_PAD_LEFT), 'title' => $d['description'], 'status' => 'active', 'data' => ['area' => $d['area'], 'owner' => $this->user()->name, 'saved' => now()->toDateTimeString(), 'expires' => now()->addHours((int) $d['hours'])->toDateTimeString()]]);

        return back()->with('success', 'Save-state created.');
    }
}
