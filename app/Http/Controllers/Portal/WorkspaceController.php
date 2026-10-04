<?php

namespace App\Http\Controllers\Portal;

use App\Models\OrderItem;
use App\Models\Portal\Project;
use App\Models\Portal\Record;
use App\Models\Portal\Registration;
use App\Models\Portal\Task;
use App\Models\SavedItem;
use App\Support\Portal\Billing;
use App\Support\Portal\Catalogue;
use App\Support\Portal\Ui;
use App\Support\Portal\Workspaces;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-051..068: diagnostics, library, native workspaces, resources, events, KP sessions, reports, benchmarks. */
class WorkspaceController extends PortalController
{
    public function diagnostics(): Response
    {
        $user = $this->user();
        $projects = Project::where('user_id', $user->id)->get();
        $score = fn ($p) => ['good' => 90, 'fair' => 75, 'at_risk' => 55][$p->health] ?? 70;
        $overall = $projects->count() ? (int) round($projects->avg($score)) : 0;
        $overdueTasks = Task::where('user_id', $user->id)->where('status', '!=', 'completed')->where('due_on', '<', now()->startOfDay())->count();
        $s = Billing::summary($user);
        $risks = $projects->flatMap(fn ($p) => collect($p->risks ?? [])->map(fn ($r) => $r + ['project' => $p->name, 'manager' => $p->manager]));
        $alerts = collect([
            $s['overdue_count'] ? ['Invoices overdue: '.$s['overdue_count'], 'Finance', 'High'] : null,
            $overdueTasks ? ["{$overdueTasks} tasks past due date", 'Projects', 'Medium'] : null,
            ['Upcoming renewal in the next 30 days', 'Subscriptions', 'Low'],
        ])->filter();

        return $this->register([
            'title' => 'Diagnostics Workspace', 'icon' => 'activity', 'subtitle' => 'Real-time health, signals and performance insights across your projects and engagements.',
            'kpis' => [Ui::kpi('Overall Health', $overall.'%', $overall >= 80 ? 'Good' : 'Needs attention', $overall >= 80 ? 'good' : 'warn', 'activity'), Ui::kpi('Risks Detected', $risks->count(), $risks->where('impact', 'High')->count().' High', 'bad', 'alert-triangle'), Ui::kpi('Signals', $alerts->count(), 'Live alerts', 'warn', 'bell'), Ui::kpi('On Track', $projects->where('health', 'good')->count(), Ui::pct($projects->where('health', 'good')->count(), max(1, $projects->count())), 'good', 'badge-check'), Ui::kpi('At Risk', $projects->where('health', 'fair')->count(), null, 'warn', 'circle-pause'), Ui::kpi('Off Track', $projects->where('health', 'at_risk')->count(), null, 'bad', 'flag')],
            'main' => [
                Ui::table('Active Risks', ['Risk', 'Project', 'Impact', 'Owner', 'Status'], $risks->map(fn ($r) => [$r['issue'], $r['project'], Ui::pill($r['impact']), $r['manager'], Ui::pill($r['status'])])->all()),
                Ui::table('Top Projects by Health', ['Project', 'Score', 'Health'], $projects->sortByDesc($score)->map(fn ($p) => [Ui::link($p->name, '/portal/projects/'.$p->reference), Ui::progress($score($p)), Ui::pill($p->health)])->values()->all()),
            ],
            'side' => [Ui::list('Recent Alerts', $alerts->map(fn ($a) => Ui::item($a[0], $a[2], $a[1], $a[2] === 'High' ? 'bad' : ($a[2] === 'Medium' ? 'warn' : 'info')))->values()->all()), Ui::bars('Health by Category', [Ui::bar('Schedule', max(0, 100 - $overdueTasks * 5), null, 'good'), Ui::bar('Financial', $s['overdue'] ? 70 : 95, null, 'gold'), Ui::bar('Delivery', $overall, null, 'good')]), Ui::quick('Diagnostics Actions', [Ui::action('Run Health Check', '/portal/diagnostics'), Ui::action('Shop Diagnostic Packs', '/diagnostics'), Ui::action('Reports & Dashboards', '/portal/reports')])],
            'footnote' => 'Health is recalculated from your live projects, tasks and invoices on every visit.',
        ]);
    }

    public function library(Request $request): Response
    {
        $user = $this->user();
        $purchased = OrderItem::whereHas('order', fn ($q) => $q->where('user_id', $user->id)->where('status', 'paid'))->where('item_type', 'digital-product')->get();
        $saved = SavedItem::where('user_id', $user->id)->whereIn('item_type', ['digital-product', 'resource'])->get();
        $cat = collect(Catalogue::library());
        $rows = $cat->map(fn ($p, $code) => ['code' => $code, 'name' => $p[0], 'category' => $p[1], 'format' => $p[2], 'version' => $p[3], 'access' => $purchased->where('item_code', $code)->isNotEmpty() ? 'Purchased Licence' : ($saved->where('item_key', $code)->isNotEmpty() ? 'Saved' : 'Available to Buy')])->values();
        $rows = Ui::filter($rows, $request, ['name', 'category'], ['category' => 'category']);

        return $this->register([
            'title' => 'Digital Products Library', 'icon' => 'library', 'subtitle' => 'Your purchased licences, saved products and the catalogue of TBCA digital products.',
            'actions' => [Ui::action('Browse Catalogue', '/shop', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Products', $cat->count(), null, 'neutral', 'library'), Ui::kpi('Purchased Licences', $purchased->count(), 'Active licences', 'good', 'key-round'), Ui::kpi('Saved Items', $saved->count(), null, 'info', 'save'), Ui::kpi('Recently Updated', 3, 'In the last 30 days', 'neutral', 'refresh-cw')],
            'search' => 'Search products…', 'filters' => [Ui::selectFilter('category', 'Product Type', $cat->pluck(1)->unique()->values()->all())],
            'main' => [Ui::table('My Library', ['Product', 'Category', 'Access Type', 'Format', 'Version', ''], $rows->map(fn ($r) => [Ui::stack($r['name'], $r['code']), $r['category'], Ui::pill($r['access'], $r['access'] === 'Purchased Licence' ? 'good' : 'neutral'), $r['format'], $r['version'], Ui::actions([$r['access'] === 'Purchased Licence' ? Ui::action('Download', '/portal/resources/'.$r['code'].'/download', 'post') : Ui::action('Buy', '/shop?q='.urlencode($r['name']), 'get', ['variant' => 'gold'])])])->all())],
            'side' => [Ui::kv('Library Summary', [['Total Products', (string) $cat->count()], ['Purchased Licences', (string) $purchased->count()], ['Saved Items', (string) $saved->count()]]), Ui::quick('Quick Actions', [Ui::action('Browse All Categories', '/shop'), Ui::action('Resources & Downloads', '/portal/resources')])],
        ]);
    }

    public function workspace(string $workspace): Response
    {
        [$title, $icon, $subtitle, $native, $cta, $kpis, [$tableTitle, $cols, $rows], $side] = Workspaces::get($workspace);
        $mine = collect();
        if (in_array($workspace, ['subscriptions', 'retainers'], true)) {
            $mine = OrderItem::with('order')->whereHas('order', fn ($q) => $q->where('user_id', $this->user()->id))->where('item_type', rtrim($workspace, 's'))->get();
        }

        return $this->register([
            'title' => $title, 'icon' => $icon, 'subtitle' => $subtitle,
            'actions' => [Ui::action($cta, $native, 'get', ['variant' => 'gold'])],
            'kpis' => $kpis,
            'main' => array_values(array_filter([
                Ui::table($tableTitle, $cols, array_map(fn ($r) => [Ui::stack($r[0]), $r[1], $r[2], $r[3], $r[4], Ui::pill($r[5]), Ui::progress($r[6])], $rows)),
                $mine->isNotEmpty() ? Ui::table('From your orders', ['Item', 'Order', 'Status', 'Amount'], $mine->map(fn ($i) => [$i->name, Ui::ref($i->order->reference, '/portal/orders/'.$i->order->reference), Ui::pill($i->order->status), Ui::money($i->line_zar)])->all()) : null,
            ])),
            'side' => array_merge($side, [Ui::info('Native workspace', 'This is a portal projection. Actions, permissions and evidence remain with the native '.$title.' (CP-TEB Part 9).', 'gold', Ui::action($cta, $native))]),
            'footnote' => 'Figures shown here are illustrative where the native workspace has not yet published live data to the portal.',
        ]);
    }

    public function followCountry(): RedirectResponse
    {
        $existing = SavedItem::where('user_id', $this->user()->id)->where('item_type', 'country')->where('item_key', 'RW')->first();
        $existing ? $existing->delete() : SavedItem::create(['user_id' => $this->user()->id, 'item_type' => 'country', 'item_key' => 'RW', 'label' => 'Rwanda', 'url' => '/countries']);

        return back()->with('success', $existing ? 'Unfollowed Rwanda.' : 'Following Rwanda — updates will appear in your notifications.');
    }

    public function resources(Request $request): Response
    {
        $user = $this->user();
        $saved = SavedItem::where('user_id', $user->id)->where('item_type', 'resource')->pluck('item_key')->all();
        $downloads = Record::where('user_id', $user->id)->where('register', 'download')->get();
        $tab = $this->tab($request, 'library');
        $rows = collect(Catalogue::resources())->map(fn ($r, $k) => ['key' => $k, 'title' => $r[0], 'desc' => $r[1], 'category' => $r[2], 'type' => $r[3], 'topic' => $r[4], 'access' => $r[5]])->values();
        if ($tab === 'saved') {
            $rows = $rows->whereIn('key', $saved)->values();
        } elseif ($tab === 'downloads') {
            $rows = $rows->whereIn('key', $downloads->pluck('reference')->all())->values();
        }
        $rows = Ui::filter($rows, $request, ['title', 'desc', 'topic'], ['category' => 'category', 'type' => 'type']);

        return $this->register([
            'title' => 'Resources and Downloaded Assets', 'icon' => 'download', 'subtitle' => 'Access research, guides, templates and tools. Track your downloads and manage your saved resources.',
            'kpis' => [Ui::kpi('Total Resources Available', count(Catalogue::resources()), 'Across all categories', 'neutral', 'library'), Ui::kpi('Resources Downloaded', $downloads->count(), 'This year', 'good', 'download'), Ui::kpi('Saved / Bookmarked', count($saved), 'For later', 'info', 'save'), Ui::kpi('Recently Added', 2, 'New resources', 'neutral', 'sparkles')],
            'tabs' => Ui::tabs(['library' => 'Resource Library', 'downloads' => 'My Downloads', 'saved' => 'Saved Resources']), 'tab' => $tab, 'search' => 'Search resources by title, keyword or topic…',
            'filters' => [Ui::selectFilter('category', 'Category', collect(Catalogue::resources())->pluck(2)->unique()->values()->all()), Ui::selectFilter('type', 'Format', ['PDF', 'XLSX', 'PPTX', 'DOCX'])],
            'main' => [Ui::table(null, ['Resource', 'Category', 'Type', 'Topic', 'Access', ''], $rows->map(fn ($r) => [Ui::stack($r['title'], $r['desc']), $r['category'], $r['type'], $r['topic'], $r['access'], Ui::actions([Ui::action('Download', '/portal/resources/'.$r['key'].'/download', 'post', ['variant' => 'gold']), Ui::action(in_array($r['key'], $saved, true) ? 'Unsave' : 'Save', '/portal/resources/'.$r['key'].'/bookmark', 'post')])])->all())],
            'side' => [Ui::list('Resource Categories', collect(Catalogue::resources())->groupBy(2)->map(fn ($g, $k) => Ui::item($k, (string) $g->count()))->values()->all()), Ui::list('Recent Downloads', $downloads->sortByDesc('created_at')->take(4)->map(fn ($d) => Ui::item($d->title, $d->created_at->diffForHumans()))->values()->all())],
        ]);
    }

    public function resourceAction(string $key, string $action)
    {
        $all = Catalogue::resources() + collect(Catalogue::library())->map(fn ($p) => [$p[0], '', $p[1], $p[2], '', 'Client'])->all();
        abort_unless(isset($all[$key]), 404);
        $title = $all[$key][0];
        if ($action === 'bookmark') {
            $e = SavedItem::where('user_id', $this->user()->id)->where('item_type', 'resource')->where('item_key', $key)->first();
            $e ? $e->delete() : SavedItem::create(['user_id' => $this->user()->id, 'item_type' => 'resource', 'item_key' => $key, 'label' => $title, 'url' => '/portal/resources']);

            return back()->with('success', $e ? 'Removed from saved resources.' : 'Saved for later.');
        }
        Record::create(['user_id' => $this->user()->id, 'register' => 'download', 'reference' => $key, 'title' => $title, 'status' => 'downloaded']);
        $body = "The Business Clinic.Africa — Resource\n\n{$title}\n{$all[$key][1]}\n\nLicensed to: {$this->user()->name} ({$this->user()->client_id})\nDownloaded: ".now()->toDateTimeString()."\n";

        return response($body, 200, ['Content-Type' => 'text/plain', 'Content-Disposition' => 'attachment; filename="'.$key.'.txt"']);
    }

    private function registrations(string $kind)
    {
        return Registration::where('user_id', $this->user()->id)->where('kind', $kind)->get()->keyBy('item_key');
    }

    public function events(): Response
    {
        $regs = $this->registrations('webinar');
        $events = Catalogue::events();
        $next = collect($events)->filter(fn ($e, $k) => ($regs[$k]->status ?? null) === 'registered')->keys()->first();

        return $this->register([
            'title' => 'Webinars and Events', 'icon' => 'video', 'subtitle' => 'Register for live sessions, access replays and resources, and track your participation.',
            'actions' => [Ui::action('All Webinars', '/webinars', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Upcoming Webinars', $regs->where('status', 'registered')->count(), "You're registered", 'good', 'calendar'), Ui::kpi('Replays Available', count(Catalogue::replays()), 'Ready to watch', 'info', 'video'), Ui::kpi('Pending Approval', $regs->where('status', 'pending_approval')->count(), null, 'warn', 'history'), Ui::kpi('Certificates Earned', $regs->where('status', 'attended')->count(), null, 'neutral', 'badge-check')],
            'main' => [Ui::table('Upcoming Webinars', ['Event', 'Date & Time (SAST)', 'Format', 'Topic', 'Status', ''], collect($events)->map(fn ($e, $k) => $this->eventRow('webinar', $k, $e[0], now()->addDays($e[1])->format('d M Y').' · '.$e[2], 'Live Webinar', $e[3], $regs[$k] ?? null))->values()->all())],
            'side' => array_values(array_filter([
                $next ? Ui::kv('My Next Event', [['Event', $events[$next][0]], ['Date', now()->addDays($events[$next][1])->format('d M Y')], ['Time', $events[$next][2].' (SAST)'], ['Reference', $regs[$next]->reference]]) : null,
                Ui::list('Replay Library', array_map(fn ($r) => Ui::item($r[0], null, $r[1], null, '/webinars'), Catalogue::replays())),
            ])),
        ]);
    }

    private function eventRow(string $kind, string $key, string $title, string $when, string $format, string $topic, ?Registration $reg): array
    {
        $status = $reg?->status ?? 'not_registered';

        return [Ui::stack($title), $when, $format, $topic, Ui::pill(str_replace('_', ' ', $status).($reg && $status !== 'cancelled' ? ' · '.$reg->reference : ''), $status === 'registered' ? 'good' : ($status === 'pending_approval' ? 'warn' : 'neutral')),
            Ui::actions(in_array($status, ['registered', 'pending_approval'], true) ? [Ui::action('Cancel Registration', '/portal/registrations/'.$kind.'/'.$key.'/cancel', 'post', ['confirm' => 'Cancel your registration?'])] : [Ui::action('Register', '/portal/registrations/'.$kind.'/'.$key, 'post', ['variant' => 'gold'])])];
    }

    public function kpSessions(): Response
    {
        $regs = $this->registrations('kp');

        return $this->register([
            'title' => 'KP Sessions and Action Tools', 'icon' => 'mic', 'subtitle' => 'Access founder-led sessions, frameworks and practical tools to help you make informed decisions and take action.',
            'actions' => [Ui::action('KP Thought Leadership', '/kp-thought-leadership', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Upcoming Sessions', $regs->where('status', 'registered')->count(), "You're registered", 'good', 'calendar'), Ui::kpi('On-Demand Sessions', 18, 'Available to watch', 'info', 'video'), Ui::kpi('Action Tools', 24, 'Frameworks & tools', 'neutral', 'briefcase'), Ui::kpi('KP Certificates', $regs->where('status', 'attended')->count(), 'Earned to date', 'gold', 'badge-check')],
            'main' => [
                Ui::table('Upcoming Sessions', ['Session', 'Date & Time (SAST)', 'Format', 'Topic', 'Access', ''], collect(Catalogue::kpSessions())->map(fn ($s, $k) => $this->eventRow('kp', $k, $s[0].' — '.$s[1].' · Kruger Phiri, Founder & CEO', now()->addDays($s[2])->format('d M Y').' · '.$s[3], 'Live Webinar', $s[4], $regs[$k] ?? null))->values()->all()),
                Ui::row([Ui::list('On-Demand Highlights', [Ui::item('PPP Transaction Structures', '45 min'), Ui::item('Ports Infrastructure Outlook', '38 min'), Ui::item('Financial Model Walkthrough', '52 min'), Ui::item('Risk Allocation in Projects', '41 min')]), Ui::list('Action Tools by Category', [Ui::item('Business Cases & Feasibility', '6'), Ui::item('Financial Modelling', '5'), Ui::item('Contracting & Legal', '4'), Ui::item('Risk & Governance', '4'), Ui::item('Strategy & Planning', '3')])]),
            ],
            'side' => [Ui::quick('Quick Actions', [Ui::action('Browse On-Demand Library', '/kp-thought-leadership'), Ui::action('Explore Action Tools', '/portal/resources'), Ui::action('Ask KP a Question', '/portal/messages')])],
        ]);
    }

    public function registerFor(string $kind, string $key): RedirectResponse
    {
        $list = $kind === 'kp' ? Catalogue::kpSessions() : Catalogue::events();
        abort_unless(isset($list[$key]), 404);
        $prefix = $kind === 'kp' ? 'KP' : 'WEB';
        $reg = Registration::updateOrCreate(['user_id' => $this->user()->id, 'kind' => $kind, 'item_key' => $key], ['reference' => $prefix.'-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT), 'status' => 'registered']);

        return back()->with('success', 'You are registered. Reference '.$reg->reference.'.');
    }

    public function cancelRegistration(string $kind, string $key): RedirectResponse
    {
        Registration::where('user_id', $this->user()->id)->where('kind', $kind)->where('item_key', $key)->update(['status' => 'cancelled']);

        return back()->with('success', 'Registration cancelled.');
    }

    public function reports(): Response
    {
        $user = $this->user();
        $projects = Project::where('user_id', $user->id)->get();
        $s = Billing::summary($user);
        $reports = [['Monthly Project Performance Summary', 'Project Performance', 'TBCA Analytics', 'current', '/portal/projects'], ['Capital Raising Tracker', 'Financial & Capital', 'QBO + CRM', 'current', '/portal/forward-exposure'], ['Statement of Account', 'Financial & Capital', 'Orders & Payments', 'current', '/portal/statement'], ['Deliverable Acceptance Register', 'Delivery', 'Portal Deliverables', 'current', '/portal/qa-release'], ['Risk Register Summary', 'Risk & Governance', 'TBCA Risk Hub', 'updating', '/portal/diagnostics']];

        return $this->register([
            'title' => 'Reports and Dashboards', 'icon' => 'bar-chart-3', 'subtitle' => 'Access entitled reports and dashboards with clear sources, evidence class and currentness.',
            'kpis' => [Ui::kpi('Reports Available', count($reports), 'Across categories', 'neutral', 'file-text'), Ui::kpi('Active Projects', $projects->where('status', '!=', 'completed')->count(), null, 'good', 'folder-kanban'), Ui::kpi('Total Invoiced', Ui::zar($s['invoiced']), null, 'gold', 'receipt'), Ui::kpi('Average Progress', round($projects->avg('progress') ?? 0).'%', null, 'info', 'activity'), Ui::kpi('Data Quality', '96%', 'Trusted & current', 'good', 'shield-check')],
            'main' => [
                Ui::table('Recent Reports', ['Report Name', 'Category', 'Source', 'As Of', 'Status', ''], array_map(fn ($r) => [$r[0], $r[1], $r[2], now()->format('d M Y'), Ui::pill($r[3]), Ui::actions([Ui::action('View', $r[4])])], $reports)),
                Ui::chart('Project Progress', $projects->pluck('reference')->all(), [['label' => 'Progress %', 'tone' => 'gold', 'values' => $projects->pluck('progress')->all()]], 'bars'),
            ],
            'side' => [Ui::quick('Quick Links', [Ui::action('Request New Report', '/portal/intake'), Ui::action('Data & Source Definitions', '/portal/trust-centre'), Ui::action('Export Data', '/portal/exports')])],
        ]);
    }

    public function benchmarks(): Response
    {
        $consents = Record::where('user_id', $this->user()->id)->where('register', 'benchmark_consent')->get()->keyBy('reference');

        return $this->register([
            'title' => 'Benchmarks and Contribution Consent', 'icon' => 'pie-chart', 'subtitle' => 'View TBCA benchmark insights and choose to contribute your data (optional). Your choices are purpose-specific and always voluntary.',
            'kpis' => [Ui::kpi('Benchmarks Available', count(Catalogue::benchmarks()), null, 'neutral', 'pie-chart'), Ui::kpi('Published Benchmarks', collect(Catalogue::benchmarks())->filter(fn ($b, $k) => $this->contributors($b, $k, $consents) >= $b[5])->count(), 'Meet threshold & governance', 'good', 'badge-check'), Ui::kpi('Active Consents', $consents->where('status', 'contributing')->count(), 'Currently in effect', 'info', 'file-lock'), Ui::kpi('Withdrawn Consents', $consents->where('status', 'withdrawn')->count(), null, 'neutral', 'user-x')],
            'main' => [Ui::table('Benchmark Library', ['Benchmark', 'Category', 'Evidence Class', 'Contributors', 'Threshold Status', 'Publication Status', 'My Contribution', ''], collect(Catalogue::benchmarks())->map(function ($b, $k) use ($consents) {
                $n = $this->contributors($b, $k, $consents);
                $pct = (int) round($n / $b[5] * 100);
                $mine = ($consents[$k]->status ?? null) === 'contributing';

                return [Ui::stack($b[0], $b[1]), $b[2], $b[3], $n.' / '.$b[5], Ui::pill(($pct >= 100 ? 'Threshold Met' : ($pct >= 70 ? 'Near Threshold' : 'Below Threshold')).' '.$pct.'%', $pct >= 100 ? 'good' : ($pct >= 70 ? 'warn' : 'bad')), Ui::pill($pct >= 100 ? 'Published' : ($pct >= 70 ? 'In Review' : 'Not Published')), Ui::pill($mine ? 'Contributing' : 'Not Contributing', $mine ? 'good' : 'neutral'),
                    Ui::actions([Ui::action($mine ? 'Withdraw' : 'Contribute', '/portal/benchmarks/'.$k, 'post', ['variant' => $mine ? 'outline' : 'gold', 'confirm' => $mine ? 'Withdraw consent? Future contributions stop immediately.' : 'Contribute your anonymised data to this benchmark? You can withdraw at any time.'])])];
            })->values()->all())],
            'side' => [Ui::timeline('How Contribution Works', [['title' => 'Review the benchmark and its purpose'], ['title' => 'Choose if you want to contribute (optional)'], ['title' => 'We add your data (anonymised) if threshold allows'], ['title' => 'Results are published only when governance is met'], ['title' => 'You can withdraw at any time']]), Ui::checklist('Your Privacy & Rights', [Ui::check('Your data is never shared below approved thresholds'), Ui::check('Anonymisation is applied before any aggregation'), Ui::check('You can withdraw consent and stop contributions'), Ui::check('All choices are recorded in your consent history')])],
        ]);
    }

    private function contributors(array $b, string $k, $consents): int
    {
        return $b[4] + (($consents[$k]->status ?? null) === 'contributing' ? 1 : 0);
    }

    public function toggleBenchmark(string $key): RedirectResponse
    {
        abort_unless(isset(Catalogue::benchmarks()[$key]), 404);
        $r = Record::firstOrNew(['user_id' => $this->user()->id, 'register' => 'benchmark_consent', 'reference' => $key]);
        $r->title = 'Benchmark: '.Catalogue::benchmarks()[$key][0];
        $r->status = $r->status === 'contributing' ? 'withdrawn' : 'contributing';
        $r->data = ['changed_at' => now()->toDateTimeString()];
        $r->save();

        return back()->with('success', $r->status === 'contributing' ? 'Thank you — contribution consent recorded.' : 'Consent withdrawn. No further data will be contributed.');
    }
}
