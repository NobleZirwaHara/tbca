<?php

namespace App\Http\Controllers\Portal;

use App\Models\Booking;
use App\Models\Portal\Deliverable;
use App\Models\Portal\Document;
use App\Models\Portal\EvidenceRequest;
use App\Models\Portal\Message;
use App\Models\Portal\Notice;
use App\Models\Portal\Project;
use App\Models\Portal\Task;
use App\Models\Portal\Thread;
use App\Support\Portal\Actions;
use App\Support\Portal\Billing;
use App\Support\Portal\Nav;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** CP-SCR-012/013/014/019/134/137 and the front-end Client Portal dashboard. */
class DashboardController extends PortalController
{
    public function dashboard(): Response
    {
        $user = $this->user();
        $projects = Project::where('user_id', $user->id)->orderByRaw("status = 'completed'")->latest('updated_at')->get();
        $tasks = Task::where('user_id', $user->id)->where('kind', 'task')->get();
        $today = now()->startOfDay();
        $taskStats = [
            'overdue' => $tasks->where('status', '!=', 'completed')->filter(fn ($t) => $t->due_on && $t->due_on->lt($today))->count(),
            'due_soon' => $tasks->where('status', '!=', 'completed')->filter(fn ($t) => $t->due_on && $t->due_on->gte($today) && $t->due_on->lte($today->copy()->addDays(7)))->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
        ];
        $bookings = Booking::where('user_id', $user->id)->where('starts_at', '>=', now())->whereIn('status', ['confirmed', 'rescheduled'])->orderBy('starts_at')->take(4)->get();
        $billing = Billing::summary($user);
        $unpaid = Billing::orders($user)->take(4);
        $actions = Actions::for($user);
        $unreadThreads = Thread::where('user_id', $user->id)->sum('unread');

        $activity = collect()
            ->merge(Notice::where('user_id', $user->id)->latest()->take(6)->get()->map(fn ($n) => ['title' => $n->title, 'meta' => $n->created_at->diffForHumans(), 'tag' => $n->category, 'href' => $n->related_url]))
            ->take(6)->values();

        return Inertia::render('Portal/Dashboard', [
            'greeting' => explode(' ', $user->name)[0],
            'kpis' => [
                Ui::kpi('Active Projects', $projects->where('status', '!=', 'completed')->count(), $projects->where('health', 'at_risk')->count().' at risk', 'good', 'folder-kanban', '/portal/projects'),
                Ui::kpi('Open Tasks', $tasks->where('status', '!=', 'completed')->count(), $taskStats['due_soon'].' due soon', 'warn', 'check-square', '/portal/tasks'),
                Ui::kpi('Upcoming Meetings', $bookings->count(), $bookings->first() ? 'Next: '.$bookings->first()->starts_at->format('D d M, H:i') : 'None scheduled', 'neutral', 'calendar', '/portal/meetings'),
                Ui::kpi('Unread Messages', (int) $unreadThreads, 'View messages', 'info', 'message-square', '/portal/messages'),
                Ui::kpi('Invoices Due', $billing['outstanding_count'], Ui::zar($billing['outstanding']), $billing['overdue'] > 0 ? 'bad' : 'neutral', 'credit-card', '/portal/invoices'),
                Ui::kpi('Account Health', $this->account()->account_state === 'active' ? 'Good' : ucfirst($this->account()->account_state), $this->account()->account_state === 'active' ? 'All systems operational' : 'Review account status', $this->account()->account_state === 'active' ? 'good' : 'bad', 'shield-check', '/portal/account/status'),
            ],
            'projects' => $projects->take(5)->map(fn ($p) => ['reference' => $p->reference, 'name' => $p->name, 'sub' => $p->category, 'status' => $p->status, 'health' => $p->health, 'progress' => $p->progress, 'due' => $p->due_on?->format('d M Y'), 'lead' => $p->manager])->values(),
            'actions' => $actions->take(5)->map(fn ($a) => ['title' => $a['title'], 'type' => $a['type'], 'status' => $a['status'], 'due' => $a['due']?->diffForHumans() ?? 'No due date', 'href' => $a['href']])->values(),
            'actionCount' => $actions->count(),
            'taskStats' => $taskStats,
            'meetings' => $bookings->map(fn ($b) => ['topic' => $b->topic, 'day' => $b->starts_at->format('d'), 'month' => strtoupper($b->starts_at->format('M')), 'time' => $b->starts_at->format('H:i').' – '.$b->starts_at->copy()->addMinutes($b->duration_minutes)->format('H:i'), 'channel' => ucfirst($b->channel), 'with' => $b->meta['host'] ?? 'TBCA Team', 'in' => $b->starts_at->diffForHumans()])->values(),
            'messages' => Message::whereHas('thread', fn ($q) => $q->where('user_id', $user->id))->where('is_mine', false)->latest()->take(3)->get()->map(fn ($m) => ['from' => $m->author_name, 'body' => $m->body, 'at' => $m->created_at->diffForHumans()])->values(),
            'documents' => Document::where('user_id', $user->id)->where('is_folder', false)->where('status', 'active')->latest()->take(4)->get()->map(fn ($d) => ['id' => $d->id, 'name' => $d->name, 'type' => $d->doc_type, 'size' => number_format($d->size_bytes / 1048576, 1).' MB', 'date' => $d->created_at->format('d M')])->values(),
            'invoices' => $unpaid->map(fn ($o) => ['number' => Billing::invoiceNumber($o), 'reference' => $o->reference, 'date' => $o->created_at->format('d M'), 'amount' => $o->total_zar, 'status' => Billing::invoiceStatus($o)])->values(),
            'outstanding' => $billing['outstanding'],
            'outstandingCount' => $billing['outstanding_count'],
            'activity' => $activity,
            'timeline' => ($projects->first()?->stages ?? []),
            'timelineProject' => $projects->first()?->name,
            'native' => Nav::native(),
        ]);
    }

    public function actions(Request $request): Response
    {
        $all = Actions::for($this->user());
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $all : $all->where('status', $tab === 'awaiting' ? 'awaiting_you' : $tab)->values();
        $rows = Ui::filter($rows, $request, ['title', 'description', 'related'], ['type' => 'type', 'priority' => 'priority']);
        $page = Ui::page($rows, $request, 10);

        return $this->register([
            'title' => 'One Action Centre', 'icon' => 'list-checks', 'subtitle' => 'All your actions in one place. See what needs your attention and take action.',
            'kpis' => [
                Ui::kpi('Overdue', $all->where('status', 'overdue')->count(), 'Requires attention', 'bad', 'alert-triangle'),
                Ui::kpi('Due Soon', $all->where('status', 'due_soon')->count(), 'Next 7 days', 'warn', 'calendar'),
                Ui::kpi('Awaiting Your Input', $all->where('status', 'awaiting_you')->count(), 'Waiting on you', 'info', 'inbox'),
                Ui::kpi('Assigned to You', $all->count(), 'Total actions', 'neutral', 'user'),
                Ui::kpi('Completed', Task::where('user_id', $this->user()->id)->where('status', 'completed')->where('completed_at', '>=', now()->startOfMonth())->count(), 'This month', 'good', 'badge-check'),
            ],
            'tabs' => Ui::tabs(['all' => ['All Actions', $all->count()], 'overdue' => ['Overdue', $all->where('status', 'overdue')->count()], 'due_soon' => ['Due Soon', $all->where('status', 'due_soon')->count()], 'awaiting' => ['Awaiting You', $all->where('status', 'awaiting_you')->count()]]),
            'tab' => $tab, 'search' => 'Search actions…',
            'filters' => [Ui::selectFilter('type', 'Type', ['Compliance', 'Legal', 'Project', 'Access', 'Finance', 'Support', 'Onboarding']), Ui::selectFilter('priority', 'Priority', ['high' => 'High', 'medium' => 'Medium', 'low' => 'Low'])],
            'main' => [Ui::table(null, ['Action', 'Type', 'Related To', 'Priority', 'Due Date', 'Status', ''], $page['items']->map(fn ($a) => [
                Ui::stack($a['title'], $a['description']), Ui::pill($a['type'], 'info'), $a['related_url'] ? Ui::link($a['related'], $a['related_url']) : $a['related'],
                Ui::pill($a['priority']), $a['due']?->format('d M Y') ?? '—', Ui::pill(str_replace('_', ' ', $a['status']), $a['status'] === 'overdue' ? 'bad' : ($a['status'] === 'due_soon' ? 'warn' : 'info')),
                Ui::actions([Ui::action('Take Action', $a['href'], 'get', ['variant' => 'gold'])]),
            ])->all(), ['pagination' => $page['pagination'], 'empty' => 'Nothing is waiting on you right now.'])],
            'footnote' => 'Tip: actions are generated live from your evidence requests, deliverable decisions, invoices, contracts, team approvals and guided setup.',
        ]);
    }

    public function welcome(): Response
    {
        $account = $this->account();
        $steps = $account->onboarding ?? [];
        $done = collect($steps)->filter(fn ($s) => $s === 'completed')->count();
        $total = count(Portal::ONBOARDING);
        $org = $this->org();

        $rows = [];
        $i = 0;
        foreach (Portal::ONBOARDING as $key => [$label, $desc, $href]) {
            $i++;
            $state = $steps[$key] ?? 'pending';
            $rows[] = [$i, Ui::stack($label, $desc), Ui::pill($state), Ui::actions(array_filter([
                $state !== 'completed' && $href ? Ui::action($state === 'in_progress' ? 'Continue' : 'Start', $href, 'get', ['variant' => 'gold']) : null,
                $state !== 'completed' && ! str_starts_with((string) $href, '/portal/journeys') ? Ui::action('Mark done', '/portal/welcome/'.$key, 'post') : null,
            ]))];
        }

        return $this->register([
            'title' => 'Welcome to Your Client Portal', 'icon' => 'sparkles', 'code' => 'CP-SCR-012',
            'subtitle' => "Let's get you set up for success. Complete the remaining steps below to unlock all portal features.",
            'actions' => [Ui::action('Watch How It Works', '/portal/help', 'get')],
            'main' => [
                Ui::bars('Your Setup Progress', [Ui::bar($done.' of '.$total.' steps complete', round($done / $total * 100), round($done / $total * 100).'% Complete', 'good')]),
                Ui::table('Your Guided Setup', ['#', 'Step', 'Status', ''], $rows),
            ],
            'side' => [
                Ui::kv('Your Account Summary', [['Organisation', $org->name], ['Your Role', ucfirst(Portal::membership($this->user())?->role ?? 'owner')], ['Country', $org->country], ['Member Since', $this->user()->created_at->format('d M Y')]], Ui::action('View Profile', '/portal/profile')),
                Ui::info('Need help getting set up?', 'Our onboarding team can walk you through each step.', 'gold', Ui::action('Contact Support', '/portal/support?new=1')),
                Ui::checklist('Why complete setup?', [Ui::check('Unlock all portal features'), Ui::check('Access tailored services'), Ui::check('Get personalised recommendations'), Ui::check('Stay compliant and secure')]),
            ],
        ]);
    }

    public function completeStep(string $step): RedirectResponse
    {
        abort_unless(array_key_exists($step, Portal::ONBOARDING), 404);
        Portal::completeStep($this->user(), $step);

        return back()->with('success', Portal::ONBOARDING[$step][0].' marked complete.');
    }

    public function nextSteps(): Response
    {
        $user = $this->user();
        $account = $this->account();
        $recs = collect();
        $incomplete = collect($account->onboarding ?? [])->filter(fn ($s) => $s !== 'completed')->count();
        if ($incomplete) {
            $recs->push(['Complete Entry-Gate Checklist', 'Verify readiness', "You have {$incomplete} incomplete checks holding progression.", 'Entry-Gate Readiness', 'Governance Tower', '30 mins', 'high', 'Start Now', '/portal/welcome']);
        }
        $ev = EvidenceRequest::where('user_id', $user->id)->where('status', 'pending')->count();
        if ($ev) {
            $recs->push(['Upload Missing Documents', "{$ev} documents pending", 'Documents are required to unlock next phase.', 'Document Management', 'Workspaces Tower', '20 mins', 'medium', 'Upload Now', '/portal/evidence']);
        }
        $billing = Billing::summary($user);
        if ($billing['outstanding_count']) {
            $recs->push(['Settle Outstanding Invoices', $billing['outstanding_count'].' invoices due', 'Keeps services active and avoids degradation.', 'Invoices & Payments', 'Finance Tower', '10 mins', $billing['overdue'] ? 'high' : 'medium', 'Pay Now', '/portal/invoices?tab=outstanding']);
        }
        $pendingDecisions = Deliverable::where('user_id', $user->id)->where('release_state', 'delivered')->where('acceptance_state', 'pending')->count();
        if ($pendingDecisions) {
            $recs->push(['Review Released Deliverables', "{$pendingDecisions} awaiting your decision", 'Acceptance windows are running.', 'Approval & Revision Centre', 'Delivery Tower', '30 mins', 'medium', 'Review Now', '/portal/approvals']);
        }
        $recs->push(['View Forward Exposure', 'Financial visibility', 'Understand your 12-month forward exposure.', 'Forward Exposure', 'Finance Tower', '15 mins', 'medium', 'View Now', '/portal/forward-exposure']);
        $recs->push(['Engage Technical Advisor', 'Expert guidance', 'Get expert advice tailored to your project.', 'Technical Advisory', 'Advisory Tower', '1-2 hrs', 'low', 'Request Now', '/portal/intake']);
        $recs->push(['Explore Learning Resource', 'Build your knowledge', 'Recommended learning to advance your project.', 'Learning Library', 'Knowledge Tower', '45 mins', 'low', 'Explore Now', '/portal/resources']);
        $completed = collect($account->onboarding ?? [])->filter(fn ($s) => $s === 'completed')->count();

        return $this->register([
            'title' => 'Next-Best-Route Service Guide', 'icon' => 'route', 'code' => 'CP-SCR-134',
            'subtitle' => 'Discover the best next steps, services and resources tailored to your goals and current state.',
            'actions' => [Ui::action('Refresh Recommendations', '/portal/next-steps', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Recommended Next Steps', $recs->count(), 'Personalised for you', 'neutral', 'route'), Ui::kpi('Match Confidence', '92%', 'High relevance', 'good', 'badge-check'), Ui::kpi('Services Available', 68, 'Across all towers', 'neutral', 'layout-grid'), Ui::kpi('Popular With You', 12, 'Based on similar clients', 'warn', 'sparkles'), Ui::kpi('Last Updated', now()->format('d M Y'), now()->format('H:i'), 'neutral', 'calendar')],
            'banner' => ['tone' => 'info', 'title' => 'Recommendations are based on your profile, current progress, preferences and similar client journeys.'],
            'main' => [Ui::table('Recommended For You', ['#', 'Next Step', 'Why This Is Recommended', 'Related Service / Journey', 'Estimated Effort', 'Priority', ''], $recs->values()->map(fn ($r, $i) => [
                $i + 1, Ui::stack($r[0], $r[1]), $r[2], Ui::stack($r[3], $r[4]), $r[5], Ui::pill($r[6]), Ui::actions([Ui::action($r[7], $r[8], 'get', ['variant' => 'gold'])]),
            ])->all())],
            'side' => [
                Ui::donut('Your Journey Progress', [Ui::slice('Completed', $completed, 'good'), Ui::slice('In Progress', collect($account->onboarding)->filter(fn ($s) => $s === 'in_progress')->count(), 'info'), Ui::slice('Pending', collect($account->onboarding)->filter(fn ($s) => $s === 'pending')->count(), 'gold')], round($completed / count(Portal::ONBOARDING) * 100).'%', 'Complete'),
                Ui::list('Top Service Categories', [Ui::item('Governance & Compliance', '14'), Ui::item('Finance & Funding', '12'), Ui::item('Project Advisory', '11'), Ui::item('Technical Solutions', '9'), Ui::item('Knowledge & Learning', '8')]),
                Ui::quick('Quick Actions', [Ui::action('Browse All Services', '/shop'), Ui::action('View My Journeys', '/portal/resume'), Ui::action('Request Expert Support', '/portal/natasha/handoff'), Ui::action('Give Feedback', '/portal/feedback')]),
            ],
        ]);
    }

    public function notifications(Request $request): Response
    {
        $user = $this->user();
        $all = Notice::where('user_id', $user->id)->latest()->get();
        $tab = $this->tab($request, 'all');
        $rows = match ($tab) {
            'unread' => $all->whereNull('read_at'),
            'all' => $all,
            default => $all->filter(fn ($n) => strtolower($n->category) === $tab),
        };
        $rows = Ui::filter($rows->values(), $request, ['title', 'body'], ['type' => 'type']);
        $page = Ui::page($rows, $request, 10);
        $cats = ['Mentions', 'System', 'Projects', 'Compliance', 'Finance'];
        $tabs = ['all' => ['All', $all->count()], 'unread' => ['Unread', $all->whereNull('read_at')->count()]];
        foreach ($cats as $c) {
            $tabs[strtolower($c)] = [$c, $all->where('category', $c)->count()];
        }

        return $this->register([
            'title' => 'Notifications Centre', 'icon' => 'bell', 'subtitle' => 'Stay on top of updates, requests and reminders across your engagements.',
            'actions' => [Ui::action('Notification Settings', '/portal/settings?section=notifications'), Ui::action('Mark all as read', '/portal/notifications/read-all', 'post', ['variant' => 'gold'])],
            'tabs' => Ui::tabs($tabs), 'tab' => $tab, 'search' => 'Search notifications…',
            'filters' => [Ui::selectFilter('type', 'Type', ['action_required' => 'Action Required', 'project_update' => 'Project Update', 'compliance' => 'Compliance', 'reminder' => 'Reminder', 'message' => 'Message', 'overdue' => 'Overdue', 'system' => 'System', 'finance' => 'Finance'])],
            'main' => [Ui::table(null, ['Notification', 'Type', 'Related To', 'Received', 'Status', ''], $page['items']->map(fn ($n) => [
                Ui::stack(($n->read_at ? '' : '● ').$n->title, $n->body), Ui::pill(str_replace('_', ' ', $n->type), in_array($n->type, ['overdue', 'action_required'], true) ? 'bad' : 'info'),
                $n->related_url ? Ui::link($n->related_label ?? 'Open', $n->related_url) : ($n->related_label ?? '—'), $n->created_at->diffForHumans(), Ui::pill($n->read_at ? 'Read' : 'Unread', $n->read_at ? 'neutral' : 'warn'),
                Ui::actions(array_filter([$n->read_at ? null : Ui::action('Mark read', '/portal/notifications/'.$n->id.'/read', 'post'), $n->related_url ? Ui::action('Open', $n->related_url) : null])),
            ])->all(), ['pagination' => $page['pagination']])],
            'side' => [
                Ui::donut('Notification Summary', [Ui::slice('Unread', $all->whereNull('read_at')->count(), 'warn'), Ui::slice('Action Required', $all->whereIn('type', ['action_required', 'overdue'])->count(), 'bad'), Ui::slice('System', $all->where('type', 'system')->count(), 'info'), Ui::slice('Others', $all->whereNotNull('read_at')->whereNotIn('type', ['action_required', 'overdue', 'system'])->count(), 'neutral')], (string) $all->count()),
                Ui::quick('Quick Actions', [Ui::action('View Message Centre', '/portal/messages'), Ui::action('Manage Notification Settings', '/portal/settings?section=notifications'), Ui::action('Mark all as read', '/portal/notifications/read-all', 'post')]),
            ],
        ]);
    }

    public function read(Notice $notice): RedirectResponse
    {
        $this->ownOrFail($notice);
        $notice->update(['read_at' => now()]);

        return back();
    }

    public function readAll(): RedirectResponse
    {
        Notice::where('user_id', $this->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return back()->with('success', 'All notifications marked as read.');
    }

    public function sitemap(Request $request): Response
    {
        $q = mb_strtolower(trim((string) $request->query('q', '')));
        $cards = [];
        foreach (Nav::client() as $g) {
            $items = collect($g['items'])->filter(fn ($i) => $q === '' || str_contains(mb_strtolower($i['label'].' '.$g['title'].' '.$g['description']), $q));
            if ($items->isEmpty()) {
                continue;
            }
            $cards[] = Ui::card($g['title'], $g['description'], $items->count().' Pages', $items->first()['href'], $g['icon'], 'info', $items->take(6)->map(fn ($i) => Ui::action($i['label'], $i['href'], 'get', ['variant' => 'ghost']))->values()->all());
        }
        Portal::completeStep($this->user(), 'explore_portal');

        return $this->register([
            'title' => 'Portal Sitemap and Help Map', 'icon' => 'map', 'code' => 'CP-SCR-137', 'subtitle' => "A complete map of the Client Portal. Find what you need quickly or get help when you're stuck.",
            'search' => 'Search for pages, features or help topics… (try: billing, entitlements, export, trust)',
            'main' => [
                Ui::cards('Portal Sections', $cards, 3),
                Ui::cards('Critical Routes (Always Available)', [Ui::card('Help Centre', null, null, '/portal/help', 'book-open'), Ui::card('Support Desk', null, null, '/portal/support', 'life-buoy'), Ui::card('System Status', null, null, '/portal/status', 'activity'), Ui::card('Trust Centre', null, null, '/portal/trust-centre', 'shield-check'), Ui::card('Exit & Export', null, null, '/portal/exports', 'archive')], 5),
            ],
            'side' => [
                Ui::quick('Help & Support', [Ui::action('Help Centre', '/portal/help'), Ui::action('Contact Support', '/portal/support?new=1'), Ui::action('WhatsApp Support', '/portal/whatsapp'), Ui::action('System Status', '/portal/status')]),
                Ui::list('Native Platform Workspaces', collect(Nav::native())->map(fn ($n) => Ui::item($n['label'], null, null, null, $n['href']))->all()),
            ],
        ]);
    }
}
