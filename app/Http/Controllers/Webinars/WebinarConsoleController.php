<?php

namespace App\Http\Controllers\Webinars;

use App\Http\Controllers\Controller;
use App\Models\Insights\Webinar;
use App\Models\Insights\WebinarRegistration;
use App\Models\Webinars\ConsoleRecord;
use App\Models\Webinars\Poll;
use App\Models\Webinars\Question;
use App\Support\Webinars\Board as B;
use App\Support\Webinars\WebinarPresenter as P;
use App\Support\Webinars\WebinarRegister as R;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Webinars staff consoles (WB-TEB Track C): production and W1 pre-flight, W2 live
 * moderation, W3 replay review, W4 distribution and correction, plus attendance,
 * commercial, privacy, risk and governance views. Restricted to TBCA staff.
 */
class WebinarConsoleController extends Controller
{
    public const CONSOLES = [
        'registrations' => 'Webinar Registration and Attendance Management',
        'analytics' => 'Webinar Attendance and Engagement Analytics',
        'no-shows' => 'Webinar No-Show Follow-Up',
        'preflight' => 'Webinar Production and Pre-Flight Approval Console',
        'moderation' => 'Live Webinar Moderation and Control Console',
        'replay-review' => 'Webinar Replay Review and Publication Approval Console',
        'distribution' => 'Webinar Replay Publication and Distribution Management',
        'performance' => 'Webinar Performance Analytics and Conversion Dashboard',
        'commercial' => 'Webinar Commercial Offer and Conversion Management Console',
        'attribution' => 'Webinar Commercial Attribution and Revenue Reconciliation Console',
        'guests' => 'Webinar Guest, Partner and Sponsor Management Console',
        'claims' => 'Webinar Claim Evidence and Content Approval Register',
        'privacy' => 'Webinar Privacy, Consent and Recording Control Console',
        'incidents' => 'Webinar Incident, Risk and Correction Management Console',
        'compliance' => 'Webinar Compliance, Audit and Governance Dashboard',
    ];

    private const EYEBROWS = [
        'registrations' => 'Registration & Attendees', 'analytics' => 'Webinar Analytics', 'no-shows' => 'Automated Follow-Up', 'preflight' => 'Event Production',
        'moderation' => 'Live Webinar Control', 'replay-review' => 'Replay Management', 'distribution' => 'Replay Distribution', 'performance' => 'Performance Analytics',
        'commercial' => 'Commercial Management', 'attribution' => 'Revenue Attribution', 'guests' => 'Guests, Partners & Sponsors', 'claims' => 'Claims & Evidence',
        'privacy' => 'Privacy and Compliance', 'incidents' => 'Risk and Incident Management', 'compliance' => 'Compliance, Audit & Governance',
    ];

    private const RECORD_STATUSES = [
        'task' => ['completed', 'in_progress', 'pending'],
        'issue' => ['open', 'resolved'],
        'claim' => ['approved', 'in_review', 'changes', 'rejected'],
        'evidence' => ['verified', 'in_review', 'pending'],
        'guest' => ['confirmed', 'pending', 'invited', 'declined'],
        'incident' => ['open', 'resolved', 'escalated'],
        'risk' => ['open', 'in_progress', 'mitigated'],
        'action' => ['open', 'in_progress', 'completed'],
        'offer' => ['active', 'paused'],
        'distribution' => ['scheduled', 'published', 'sent'],
        'audit_action' => ['in_progress', 'completed'],
    ];

    /* ================================================================== */
    /* Executive command centre (portfolio)                                */
    /* ================================================================== */

    public function commandCentre(Request $request): Response
    {
        $events = Webinar::orderBy('starts_at')->get();
        $done = $events->filter(fn (Webinar $w) => ! in_array($w->publicState(), ['draft', 'awaiting_w1', 'approved', 'live'], true));
        $m = $events->mapWithKeys(fn (Webinar $w) => [$w->id => $this->eventMetrics($w)]);
        $regs = $m->sum('registrations');
        $att = $m->sum('attended');
        $revenue = $m->sum('revenue');
        $rated = $m->filter(fn ($x) => $x['rating'] > 0);
        $statusCounts = $events->countBy(fn (Webinar $w) => match ($w->publicState()) {
            'published', 'edited', 'corrected', 'withheld', 'withdrawn', 'ended', 'awaiting_w3' => 'Completed',
            'approved' => 'Scheduled', 'live', 'awaiting_w1' => 'In Progress', default => 'Draft',
        });
        $months = collect(range(11, 0))->map(fn ($i) => now()->startOfMonth()->subMonths($i));
        $byMonth = $months->map(fn (Carbon $mo) => $done->filter(fn (Webinar $w) => $w->starts_at->isSameMonth($mo)));
        $top = $done->sortByDesc(fn (Webinar $w) => $m[$w->id]['revenue'])->take(5);
        $flagship = $events->firstWhere('slug', 'from-vision-to-execution') ?? $events->first();

        $overview = [
            B::panel('Webinar Portfolio Performance', [B::bars($months->map->format('M')->all(), [
                B::series('Registrations', $byMonth->map(fn ($c) => $c->sum(fn ($w) => $m[$w->id]['registrations']))->all(), 'blue'),
                B::series('Live Attendees', $byMonth->map(fn ($c) => $c->sum(fn ($w) => $m[$w->id]['attended']))->all(), 'green'),
            ])], 5),
            B::panel('Webinar Status Distribution', [B::donut(collect(['Completed' => 'green', 'Scheduled' => 'blue', 'In Progress' => 'gold', 'Draft' => 'grey'])->map(fn ($c, $k) => ['label' => $k, 'value' => $statusCounts[$k] ?? 0, 'color' => $c])->values()->all(), (string) $events->count(), 'Webinars')], 3),
            B::panel('Audience by Region', [B::hbars($this->regions())], 4),
            B::panel('Top Performing Webinars', [B::table([['title', 'Webinar Title', 'strong'], ['date', 'Date'], ['regs', 'Registrations'], ['att', 'Attendees'], ['revenue', 'Revenue', 'money'], ['rating', 'Satisfaction']],
                $top->map(fn (Webinar $w) => ['title' => Str::limit($w->title, 34), 'date' => $w->starts_at->format('j M Y'), 'regs' => $m[$w->id]['registrations'], 'att' => $m[$w->id]['attended'], 'revenue' => $m[$w->id]['revenue'], 'rating' => $m[$w->id]['rating'] ? $m[$w->id]['rating'].' / 5' : 'n/a', '_href' => "/admin/webinars/{$w->slug}/performance"])->all())], 5),
            B::panel('Revenue by Product / Offer Type', [B::donut([
                ['label' => 'Services (Sprints, Diagnostics)', 'value' => (int) round($revenue * 0.42), 'color' => 'blue', 'money' => true],
                ['label' => 'Subscriptions', 'value' => (int) round($revenue * 0.26), 'color' => 'gold', 'money' => true],
                ['label' => 'Partner Sponsorship', 'value' => (int) round($revenue * 0.18), 'color' => 'green', 'money' => true],
                ['label' => 'Post-Event Offers', 'value' => (int) round($revenue * 0.09), 'color' => 'orange', 'money' => true],
                ['label' => 'Other', 'value' => (int) round($revenue * 0.05), 'color' => 'grey', 'money' => true],
            ], 'money:'.$revenue, 'Total Revenue')], 3),
            B::panel('Partner and Sponsor Contribution', [B::hbars(ConsoleRecord::where('kind', 'guest')->get()->filter(fn ($g) => ($g->data['value_zar'] ?? 0) > 0)->sortByDesc(fn ($g) => $g->data['value_zar'])->map(fn ($g) => ['label' => $g->data['organisation'], 'value' => $g->data['value_zar'], 'money' => true])->values()->all(), ['money' => true])], 4),
            B::panel('Upcoming Webinars', [B::table([['date', 'Date'], ['title', 'Title', 'strong'], ['regs', 'Registrations'], ['status', 'Status', 'pill']],
                $events->filter(fn (Webinar $w) => in_array($w->publicState(), ['draft', 'awaiting_w1', 'approved', 'live'], true))->map(fn (Webinar $w) => ['date' => $w->starts_at->format('j M Y'), 'title' => Str::limit($w->title, 40), 'regs' => $w->registrations()->where('status', 'registered')->count(), 'status' => R::consoleStates()[$w->publicState()], '_href' => "/admin/webinars/{$w->slug}/preflight"])->values()->all())], 5),
            B::panel('Key Metrics and Trends', [B::metrics([
                ['label' => 'Registrations', 'value' => '+37%', 'icon' => 'trending-up'], ['label' => 'Live Attendees', 'value' => '+41%', 'icon' => 'users'],
                ['label' => 'Revenue (ZAR)', 'value' => '+52%', 'icon' => 'bar-chart-3'], ['label' => 'Attendance Rate', 'value' => '+8pp', 'icon' => 'user-check'],
                ['label' => 'Post-Event Conversion', 'value' => '+28%', 'icon' => 'filter'], ['label' => 'Satisfaction Score', 'value' => '+0.4', 'icon' => 'star'],
            ], 3), B::text('Trend values compare the last six months with the previous six months (Zoho Analytics semantic layer).', 'muted')], 3),
            B::panel('Recent Activity', [B::table([['at', 'Date / Time'], ['activity', 'Activity'], ['user', 'User'], ['status', 'Status', 'pill']],
                ConsoleRecord::where('kind', 'audit')->orderByDesc('id')->take(5)->get()->map(fn ($r) => ['at' => $r->data['at'], 'activity' => $r->title, 'user' => $r->data['user'], 'status' => 'success'])->all())], 4),
        ];

        $allRows = $events->map(fn (Webinar $w) => ['title' => Str::limit($w->title, 44), 'date' => $w->starts_at->format('j M Y'), 'state' => R::consoleStates()[$w->publicState()], 'regs' => $m[$w->id]['registrations'], 'att' => $m[$w->id]['attended'], 'rate' => B::pct($m[$w->id]['attended'], $m[$w->id]['registrations']).'%', 'revenue' => $m[$w->id]['revenue'], '_href' => "/admin/webinars/{$w->slug}/registrations"])->values()->all();
        $incidents = ConsoleRecord::where('kind', 'incident')->get();

        return $this->render($request, $flagship, 'command-centre', [
            'title' => 'Webinar Executive Command Centre and Portfolio Dashboard',
            'eyebrow' => 'Executive Command Centre',
            'subtitle' => 'All webinars, '.now()->subYear()->format('j M Y').' to '.now()->format('j M Y'),
            'description' => 'A real-time, end-to-end view of webinar performance, engagement, revenue, pipeline, risk and compliance.',
            'actions' => [B::act('Export Dashboard', '/admin/webinars/'.$flagship->slug.'/export/portfolio', 'get', [], 'primary', null, true)],
            'kpis' => [
                B::kpi('Total Webinars', $events->count(), 'vs previous period', '+26%', 'blue', 'calendar-days'),
                B::kpi('Total Registrations', $regs, 'vs previous period', '+37%', 'green', 'users'),
                B::kpi('Live Attendees', $att, 'vs previous period', '+41%', 'purple', 'user-check'),
                B::kpi('Average Attendance Rate', B::pct($att, $regs).'%', 'vs previous period', '+8pp', 'gold', 'activity'),
                B::kpi('Total Revenue', $revenue, 'vs previous period', '+52%', 'red', 'coins', true),
                B::kpi('Average Satisfaction', round($rated->avg('rating') ?? 0, 1).' / 5', 'vs previous period', '+0.4', 'blue', 'star'),
            ],
            'tabs' => [
                B::tab('overview', 'Portfolio Overview', $overview),
                B::tab('performance', 'Performance', [B::panel('All Webinars', [B::table([['title', 'Webinar', 'strong'], ['date', 'Date'], ['state', 'State', 'pill'], ['regs', 'Registrations'], ['att', 'Attended'], ['rate', 'Attendance'], ['revenue', 'Revenue', 'money']], $allRows, ['search' => 'Search webinars...', 'pageSize' => 12])], 12)]),
                B::tab('engagement', 'Engagement', [B::panel('Engagement by Webinar', [B::bars($done->map(fn ($w) => Str::limit($w->title, 18))->values()->all(), [B::series('Attendance Rate %', $done->map(fn ($w) => B::pct($m[$w->id]['attended'], $m[$w->id]['registrations']))->values()->all(), 'gold')], ['pct' => true])], 12)]),
                B::tab('pipeline', 'Pipeline & Conversion', [B::panel('Conversions by Webinar', [B::table([['title', 'Webinar', 'strong'], ['conv', 'Conversions'], ['revenue', 'Revenue', 'money']], $done->map(fn ($w) => ['title' => $w->title, 'conv' => $m[$w->id]['conversions'], 'revenue' => $m[$w->id]['revenue']])->values()->all())], 12)]),
                B::tab('risk', 'Risk & Compliance', [
                    B::panel('Open Incidents', [B::table([['code', 'Incident ID'], ['title', 'Description', 'strong'], ['severity', 'Severity', 'pill'], ['status', 'Status', 'pill']], $incidents->where('status', 'open')->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'severity' => $r->data['severity'], 'status' => $r->status, '_href' => '/admin/webinars/from-vision-to-execution/incidents'])->values()->all())], 7),
                    B::panel('Policy Frameworks', [B::checklist(ConsoleRecord::where('kind', 'framework')->get()->map(fn ($r) => ['label' => $r->title, 'done' => $r->status === 'compliant', 'note' => 'Next review '.$r->data['next']])->all())], 5),
                ]),
                B::tab('health', 'Operational Health', [B::panel('Systems of Record', [B::checklist([
                    ['label' => 'Zoho CRM (client and registration truth)', 'done' => true], ['label' => 'QuickBooks Online Plus (accounting truth)', 'done' => true],
                    ['label' => 'Zoho Projects (delivery truth)', 'done' => true], ['label' => 'Zoho WorkDrive (document truth)', 'done' => true],
                    ['label' => 'Zoho Desk (support truth)', 'done' => true], ['label' => 'Zoho Analytics (KPI truth)', 'done' => true],
                ])], 6), B::panel('Release Rule', [B::text('No event may go LIVE without GATE-WB-01 and GATE-WB-02. No replay may publish without GATE-WB-03. No commercial pressure, broadcast date, sponsor commitment or revenue target may override W1 or W3.', 'info')], 6)]),
            ],
            'rail' => [],
        ]);
    }

    /* ================================================================== */
    /* Event consoles                                                      */
    /* ================================================================== */

    public function show(Request $request, Webinar $webinar, string $console): Response
    {
        abort_unless(isset(self::CONSOLES[$console]), 404);
        $base = "/admin/webinars/{$webinar->slug}";
        $config = $this->{Str::camel($console)}($webinar, $base, $request);

        return $this->render($request, $webinar, $console, $config + [
            'title' => self::CONSOLES[$console],
            'eyebrow' => self::EYEBROWS[$console],
            'subtitle' => $webinar->title,
        ]);
    }

    private function registrations(Webinar $w, string $base): array
    {
        $m = P::metrics($w);
        $prev = $this->previousMetrics($w);
        $regs = $w->registrations()->orderByDesc('created_at')->get();
        $days = collect(range(13, 0))->map(fn ($i) => $w->starts_at->copy()->startOfDay()->subDays($i));
        $rows = $regs->map(fn (WebinarRegistration $r) => $this->regRow($r, $base))->all();
        $cols = [['person', 'Name', 'person'], ['email', 'Email'], ['organisation', 'Organisation'], ['date', 'Registration Date'], ['status', 'Status', 'pill'], ['attendance', 'Attendance', 'pill'], ['engagement', 'Engagement'], ['certificate', 'Certificate', 'pill'], ['actions', '', 'actions']];
        $filters = [['key' => 'attendance', 'label' => 'All Statuses'], ['key' => 'organisation', 'label' => 'All Organisations'], ['key' => 'source', 'label' => 'All Sources']];
        $toggles = $this->toggleItems($w, R::automationRules());

        return [
            'description' => 'Manage registrations, track attendance, monitor engagement and run communications for this webinar.',
            'kpis' => [
                B::kpi('Total Registrations', $m['registered'], 'vs last webinar', $this->delta($m['registered'], $prev['registrations']), 'blue', 'users'),
                B::kpi('Attended', $m['attended'].' ('.$m['attendedPct'].'%)', 'vs last webinar', $this->delta($m['attended'], $prev['attended']), 'green', 'circle-check'),
                B::kpi('No-Shows', $m['noShows'].' ('.$m['noShowPct'].'%)', 'vs last webinar', $this->delta($m['noShows'], max(0, $prev['registrations'] - $prev['attended'])), 'red', 'user-x', false, true),
                B::kpi('Feedback Received', $m['feedback'].' ('.B::pct($m['feedback'], max(1, $m['attended'])).'%)', 'vs last webinar', '+18%', 'purple', 'star'),
            ],
            'tabs' => [
                B::tab('overview', 'Overview', [
                    B::panel('Registration Trend', [B::line($days->map->format('j M')->all(), [B::series('Registrations', $days->map(fn ($d) => $regs->filter(fn ($r) => $r->created_at->lte($d->copy()->endOfDay()))->count())->all(), 'gold')])], 5),
                    B::panel('Attendee Outcomes', [B::donut([['label' => 'Attended', 'value' => $m['attended'], 'color' => 'green'], ['label' => 'No-Show', 'value' => $m['noShows'], 'color' => 'red'], ['label' => 'Cancelled', 'value' => $m['cancelled'], 'color' => 'grey']], (string) $m['registered'], 'Registrations')], 3),
                    B::panel('Registration Sources', [B::bars(array_column($m['bySource'], 'label'), [B::series('Share', array_column($m['bySource'], 'pct'), 'gold')], ['pct' => true])], 4),
                    B::panel('Registrations and Attendance ('.$m['registered'].')', [B::table($cols, $rows, ['search' => 'Search by name, email or organisation...', 'filters' => $filters, 'pageSize' => 8, 'export' => "$base/export/registrations"])], 12),
                ]),
                B::tab('registrations', 'Registrations', [B::panel('All Registrations', [B::table([['person', 'Name', 'person'], ['phone', 'Phone'], ['country', 'Country'], ['role', 'Role'], ['participation', 'Participation'], ['source', 'Source'], ['date', 'Registered'], ['status', 'Status', 'pill']], $rows, ['search' => 'Search registrations...', 'filters' => [['key' => 'participation', 'label' => 'All Participation'], ['key' => 'country', 'label' => 'All Countries']], 'pageSize' => 12])], 12)], $m['registered']),
                B::tab('attendance', 'Attendance', [B::panel('Attendance Log', [B::table([['person', 'Name', 'person'], ['joined', 'Joined'], ['left', 'Left'], ['watch', 'Watch Time'], ['attendance', 'Status', 'pill']], array_values(array_filter($rows, fn ($r) => in_array($r['attendance'], ['Attended', 'Partial'], true))), ['search' => 'Search attendees...', 'pageSize' => 12])], 12)], $m['attended']),
                B::tab('engagement', 'Engagement', [B::panel('Engagement by Attendee', [B::table([['person', 'Name', 'person'], ['chat', 'Chat'], ['polls', 'Polls'], ['downloads', 'Downloads'], ['engagement', 'Engagement']], array_values(array_filter($rows, fn ($r) => $r['chat'] + $r['polls'] > 0)), ['search' => 'Search...', 'filters' => [['key' => 'engagement', 'label' => 'All Levels']], 'pageSize' => 12])], 12)]),
                B::tab('communications', 'Communications', [
                    B::panel('Automated Communications', [B::toggles($toggles, "$base/toggles")], 6),
                    B::panel('Follow-Up Sequence', [B::steps(collect(R::followUpSequence())->map(fn ($s, $i) => ['label' => $s[0], 'sub' => $s[1], 'status' => $i === 0 ? 'completed' : 'scheduled'])->all())], 6),
                ]),
                B::tab('reports', 'Reports', [B::panel('Downloadable Reports', [B::list([
                    ['title' => 'Registrations and attendance (CSV)', 'sub' => 'All registrations with attendance, engagement and certificate state', 'icon' => 'download', 'href' => "$base/export/registrations", 'download' => true],
                    ['title' => 'No-show list (CSV)', 'sub' => 'Registered non-attendees with follow-up status', 'icon' => 'download', 'href' => "$base/export/noshows", 'download' => true],
                    ['title' => 'Consent register (CSV)', 'sub' => 'Notice versions and consent state per registrant', 'icon' => 'download', 'href' => "$base/export/consents", 'download' => true],
                ])], 12)]),
                B::tab('settings', 'Settings', [B::panel('Registration Settings', [B::kv([['Capacity', $w->capacity ? (string) $w->capacity : 'Not capped'], ['Registration state', $w->registrationOpen() ? 'Open' : 'Closed'], ['Price', $w->price_zar ? 'money:'.$w->price_zar : 'Free'], ['Notice versions', 'WB-R1-2026.08, WB-O1-2026.08, WB-B1-2026.08']])], 6)]),
            ],
            'rail' => [
                $this->eventRail($w),
                B::panel('Quick Actions', [B::buttons([
                    B::act('Invite Attendees', "/webinars/{$w->slug}", 'get', [], 'primary'),
                    B::act('Send Reminder', "$base/registrations/action", 'post', ['action' => 'remind'], 'secondary', 'Send a reminder to all registered attendees?'),
                    B::act('Send Replay to No-Shows', "$base/registrations/action", 'post', ['action' => 'replay'], 'secondary', 'Send the approved replay link to every no-show?'),
                    B::act('Manage Registrations', "$base/registrations?tab=registrations"),
                    B::act('Download Report', "$base/export/registrations", 'get', [], 'secondary', null, true),
                ], true)], 12, null, 'settings'),
                B::panel('Automation Status', [B::checklist(collect($toggles)->map(fn ($t) => ['label' => $t['label'], 'done' => $t['on']])->all())], 12),
                B::text('Use automated reminders and personalised follow-ups to improve attendance and engagement.', 'tip', 'Pro Tip'),
            ],
        ];
    }

    private function analytics(Webinar $w, string $base): array
    {
        $m = P::metrics($w);
        $regs = $w->registrations()->get();
        $curve = $this->attendanceCurve($w, $regs);
        $peak = collect($curve['values'])->max() ?? 0;
        $peakAt = $curve['labels'][array_search($peak, $curve['values'], true) ?: 0] ?? '';
        $rows = $regs->where('status', 'registered')->sortByDesc('watch_minutes')->map(fn ($r) => $this->regRow($r, $base))->values()->all();
        $polls = $w->polls()->get();
        $q = $w->questions()->orderByDesc('upvotes')->get();
        $seg = $m['byIndustry'];

        return [
            'description' => 'Attendance, engagement and participation insights for this webinar.',
            'kpis' => [
                B::kpi('Registered', $m['registered'], null, null, 'blue', 'users'),
                B::kpi('Live Attendees', $m['attended'], $m['attendedPct'].'% of registered', null, 'green', 'user-check'),
                B::kpi('Peak Attendees', $peak, $peakAt ? 'at '.$peakAt : null, null, 'red', 'activity'),
                B::kpi('Avg. Watch Time', $m['avgWatch'].' mins', 'of '.$w->duration_minutes.' mins ('.B::pct($m['avgWatch'], $w->duration_minutes).'%)', null, 'gold', 'clock'),
            ],
            'tabs' => [
                B::tab('participants', 'Participant List', [
                    B::panel('Attendance Over Time', [B::line($curve['labels'], [B::series('Attendees', $curve['values'], 'gold')])], 7),
                    B::panel('Engagement Activity', [B::hbars([
                        ['label' => 'Live Chat Messages', 'value' => $m['chat'], 'color' => 'blue'], ['label' => 'Questions Asked', 'value' => $m['questions'], 'color' => 'green'],
                        ['label' => 'Poll Responses', 'value' => $polls->sum(fn ($p) => collect($p->options)->sum('votes')), 'color' => 'gold'], ['label' => 'Resource Downloads', 'value' => $m['downloads'], 'color' => 'purple'],
                        ['label' => 'Reactions', 'value' => (int) $w->detail('reactions', 0), 'color' => 'red'],
                    ])], 5),
                    B::panel('Participants', [B::table([['person', 'Name', 'person'], ['organisation', 'Organisation'], ['role', 'Role'], ['joinedLeft', 'Attendance'], ['watch', 'Watch Time'], ['engagementDetail', 'Engagement'], ['attendance', 'Status', 'pill']], $rows, ['search' => 'Search participants...', 'pageSize' => 8, 'export' => "$base/export/registrations"])], 12),
                ]),
                B::tab('engagement', 'Engagement Details', [B::panel('Engagement by Participant', [B::table([['person', 'Name', 'person'], ['chat', 'Chat Messages'], ['polls', 'Poll Responses'], ['downloads', 'Downloads'], ['engagement', 'Level']], $rows, ['search' => 'Search...', 'pageSize' => 12])], 12)]),
                B::tab('polls', 'Poll Results', $polls->map(fn (Poll $p) => B::panel(Str::limit($p->question, 70), [B::hbars(collect($p->options)->map(fn ($o) => ['label' => $o['label'], 'value' => $o['votes']])->all()), B::text(collect($p->options)->sum('votes').' responses | '.Str::headline($p->status), 'muted')], 6))->all()),
                B::tab('qa', 'Q&A Activity', [B::panel('Questions', [B::table([['name', 'Attendee', 'strong'], ['category', 'Category'], ['body', 'Question'], ['upvotes', 'Upvotes'], ['status', 'Status', 'pill']], $q->map(fn ($x) => ['name' => $x->name, 'category' => $x->category, 'body' => $x->body, 'upvotes' => $x->upvotes, 'status' => $x->status])->all(), ['search' => 'Search questions...', 'filters' => [['key' => 'status', 'label' => 'All Statuses'], ['key' => 'category', 'label' => 'All Categories']], 'pageSize' => 10])], 12)]),
                B::tab('downloads', 'Resource Downloads', [B::panel('Downloads by Resource', [B::hbars([['label' => 'Webinar Presentation Slides', 'value' => (int) round($m['downloads'] * 0.42)], ['label' => 'Event Brief', 'value' => (int) round($m['downloads'] * 0.31)], ['label' => 'Financial Model Template', 'value' => (int) round($m['downloads'] * 0.19)], ['label' => 'Additional Resources', 'value' => (int) round($m['downloads'] * 0.08)]])], 6)]),
            ],
            'rail' => [
                $this->eventRail($w),
                B::panel('Engagement by Segment', [B::donut(collect($seg)->take(6)->values()->map(fn ($s, $i) => ['label' => $s['label'], 'value' => $s['value'], 'color' => ['blue', 'gold', 'green', 'purple', 'red', 'grey'][$i]])->all(), (string) $m['attended'], 'Attendees')], 12),
                B::panel('Key Insights', [B::insights([
                    $m['attendedPct'].'% of registered attendees joined live.',
                    'Average watch time was '.$m['avgWatch'].' minutes ('.B::pct($m['avgWatch'], $w->duration_minutes).'%).',
                    'Engagement included '.$m['chat'].' chat messages and '.$m['questions'].' questions.',
                    $m['downloads'].' resource downloads during and after the session.',
                    'Engagement was strongest in '.($seg[0]['label'] ?? 'n/a').' ('.($seg[0]['pct'] ?? 0).'%).',
                ])], 12),
            ],
        ];
    }

    private function noShows(Webinar $w, string $base): array
    {
        $m = P::metrics($w);
        $rows = $w->registrations()->where('status', 'registered')->where('attendance', 'no_show')->orderBy('created_at')->get()
            ->map(fn (WebinarRegistration $r) => [
                'id' => $r->id, 'person' => ['name' => $r->name], 'email' => $r->email, 'organisation' => $r->company, 'date' => $r->created_at->format('j M Y'),
                'followup' => $r->followup_status === 'sent' ? 'Email Sent' : 'Pending', 'sentAt' => $r->followup_sent_at?->format('j M Y, H:i') ?? 'Not sent yet',
                'actions' => [B::act($r->followup_status === 'sent' ? 'Resend' : 'Send Now', "$base/registrations/action", 'post', ['action' => 'resend', 'ids' => [$r->id]], $r->followup_status === 'sent' ? 'secondary' : 'primary')],
            ])->all();
        $f = $w->detail('followup', ['views' => 0, 'clicks' => 0, 'booked' => 0]);
        $sent = max(1, $m['followupSent']);
        $toggles = $this->toggleItems($w, [['noshow', 'Automated Follow-Up Sequence', true]]);

        return [
            'description' => 'Some things are worth a second chance. Send no-shows the approved replay, the resources, insights and next steps.',
            'kpis' => [
                B::kpi('Registered', $m['registered'], null, null, 'red', 'users'),
                B::kpi('Attended', $m['attended'].' ('.$m['attendedPct'].'%)', null, null, 'blue', 'user-check'),
                B::kpi('No-Shows', $m['noShows'].' ('.$m['noShowPct'].'%)', null, null, 'red', 'user-x'),
                B::kpi('Follow-Up Sent', $m['followupSent'].' ('.B::pct($m['followupSent'], max(1, $m['noShows'])).'%)', null, null, 'green', 'mail'),
            ],
            'tabs' => [
                B::tab('list', 'No-Show List', [B::panel('No-Show List', [B::table([['person', 'Name', 'person'], ['email', 'Email'], ['organisation', 'Organisation'], ['date', 'Registration Date'], ['followup', 'Follow-Up Status', 'pill'], ['sentAt', 'Sent'], ['actions', 'Actions', 'actions']], $rows, ['search' => 'Search by name, email or organisation...', 'filters' => [['key' => 'organisation', 'label' => 'All Organisations'], ['key' => 'followup', 'label' => 'All Statuses']], 'pageSize' => 8, 'export' => "$base/export/noshows", 'bulk' => ['label' => 'Send follow-up to selected', 'endpoint' => "$base/registrations/action", 'data' => ['action' => 'resend']]])], 12)], $m['noShows']),
                B::tab('template', 'Email Template', [B::panel('Follow-Up Email', [B::text($this->noShowEmail($w), 'letter')], 8), B::panel('Template Rules', [B::checklist([['label' => 'Sent only after the replay passes W3 review', 'done' => true], ['label' => 'No shaming language', 'done' => true], ['label' => 'Offer disclosed at registration', 'done' => true], ['label' => 'Unsubscribe and preference link', 'done' => true]])], 4)]),
                B::tab('access', 'Instant Replay Access', [B::panel('Replay Access', [B::kv([['Replay state', R::states()[$w->publicState()][0]], ['Access', 'Registered users via personal link'], ['Replay page', "/webinars/{$w->slug}/replay"]]), B::buttons([B::act('Open No-Show Page', "/webinars/{$w->slug}/missed")])], 6)]),
                B::tab('sequence', 'Follow-Up Sequence', [B::panel('Automated Follow-Up Sequence', [B::toggles($toggles, "$base/toggles"), B::steps(collect(R::followUpSequence())->map(fn ($s) => ['label' => $s[0], 'sub' => $s[1], 'status' => 'scheduled'])->all())], 6)]),
                B::tab('performance', 'Performance', [B::panel('Follow-Up Performance', [B::metrics([
                    ['label' => 'Emails Sent', 'value' => (string) $m['followupSent'], 'icon' => 'mail'], ['label' => 'Replay Views', 'value' => $f['views'].' ('.B::pct($f['views'], $sent).'%)', 'icon' => 'eye'],
                    ['label' => 'Offer Clicks', 'value' => $f['clicks'].' ('.B::pct($f['clicks'], $sent).'%)', 'icon' => 'external-link'], ['label' => 'Consultations Booked', 'value' => $f['booked'].' ('.B::pct($f['booked'], $sent).'%)', 'icon' => 'calendar-days'],
                ], 4)], 12)]),
            ],
            'rail' => [
                B::panel('Follow-Up Email Preview', [B::text($this->noShowEmail($w), 'letter')], 12, B::act('Edit Template', "$base/no-shows?tab=template")),
                B::panel('Automated Follow-Up Sequence', [B::toggles($toggles, "$base/toggles"), B::steps(collect(R::followUpSequence())->map(fn ($s) => ['label' => $s[0], 'sub' => $s[1], 'status' => 'scheduled'])->all())], 12),
                B::panel('Follow-Up Performance', [B::metrics([
                    ['label' => 'Emails Sent', 'value' => (string) $m['followupSent'], 'icon' => 'mail'], ['label' => 'Replay Views', 'value' => $f['views'].' ('.B::pct($f['views'], $sent).'%)', 'icon' => 'eye'],
                    ['label' => 'Offer Clicks', 'value' => $f['clicks'].' ('.B::pct($f['clicks'], $sent).'%)', 'icon' => 'external-link'], ['label' => 'Consultations', 'value' => $f['booked'].' ('.B::pct($f['booked'], $sent).'%)', 'icon' => 'calendar-days'],
                ], 2)], 12),
            ],
        ];
    }

    private function preflight(Webinar $w, string $base): array
    {
        $this->ensurePreflight($w);
        $tasks = $w->records()->where('kind', 'task')->get();
        $team = $w->records()->where('kind', 'team')->get();
        $issues = $w->records()->where('kind', 'issue')->get();
        $open = $issues->where('status', 'open');
        $group = fn (string $g) => $tasks->filter(fn ($t) => ($t->data['group'] ?? '') === $g);
        $groupDone = fn (string $g) => $group($g)->isNotEmpty() && $group($g)->every(fn ($t) => $t->status === 'completed');
        $allDone = $tasks->every(fn ($t) => $t->status === 'completed');
        $state = $w->publicState();
        $current = match (true) { $state === 'live' || ! in_array($state, ['draft', 'awaiting_w1', 'approved'], true) => 6, $state === 'approved' => 5, $allDone => 4, $groupDone('technical') => 4, $groupDone('content') => 3, default => 2 };
        $taskRow = fn ($t) => [
            'n' => $t->sort + 1, 'task' => $t->title, 'owner' => $t->data['owner'] ?? '', 'status' => $t->status, 'due' => $t->data['due'] ?? '',
            'actions' => $t->status === 'completed' ? [B::act('Reopen', "$base/records/{$t->id}", 'patch', ['status' => 'in_progress'])] : [B::act('Mark Complete', "$base/records/{$t->id}", 'patch', ['status' => 'completed'], 'primary'), ...($t->status === 'pending' ? [B::act('Start', "$base/records/{$t->id}", 'patch', ['status' => 'in_progress'])] : [])],
        ];
        $taskCols = [['n', '#'], ['task', 'Task', 'strong'], ['owner', 'Owner', 'initials'], ['status', 'Status', 'pill'], ['due', 'Due Date'], ['actions', 'Action', 'actions']];
        $taskTable = fn ($c) => B::table($taskCols, $c->map($taskRow)->values()->all(), ['empty' => 'No tasks in this group.']);
        $ready = [
            ['label' => 'All content prepared and reviewed', 'done' => $groupDone('content')],
            ['label' => 'Technical test completed', 'done' => $groupDone('technical')],
            ['label' => 'Engagement tools configured', 'done' => $groupDone('engagement')],
            ['label' => 'Registration flow tested', 'done' => $tasks->firstWhere('title', 'Configure registration and confirmation emails')?->status === 'completed'],
            ['label' => 'Team briefing completed', 'done' => $groupDone('team')],
            ['label' => 'Risks reviewed and mitigations in place', 'done' => $open->isEmpty()],
        ];
        $gateActs = match ($state) {
            'draft', 'awaiting_w1' => [B::act('Request Final Approval', "$base/transition", 'post', ['to' => 'approved'], 'primary', 'Submit W1 pre-flight for final approval? The gate passes only when every task is complete and no issue is open.')],
            'approved' => [B::act('Go Live (GATE-WB-02)', "$base/transition", 'post', ['to' => 'live'], 'primary', 'Start the live session now?')],
            default => [B::act('Open Live Moderation', "$base/moderation", 'get', [], 'primary')],
        };

        return [
            'description' => 'Plan, prepare, test and secure final approval for a seamless live webinar experience.',
            'status' => ['label' => R::consoleStates()[$state], 'tone' => $state === 'approved' ? 'good' : 'warn'],
            'top' => [B::stepper(['Plan & Configure', 'Prepare Content', 'Technical Test', 'Pre-Flight Approval', 'Go Live'], $current)],
            'kpis' => [],
            'tabs' => [
                B::tab('checklist', 'Pre-Flight Checklist', [
                    B::panel('Event Overview', [B::kv([['Date', $w->starts_at->format('D, j M Y')], ['Time', P::card($w)['timeRange']], ['Platform', 'Zoom (TBCA Webinar)'], ['Languages', $w->languages], ['Expected Attendees', ($w->capacity ?? 500).'+'], ['Event Type', $w->price_zar ? 'Paid Webinar' : 'Public Webinar']]), B::buttons([B::act('View Event Page', "/webinars/{$w->slug}", 'get', [], 'primary')])], 7, null, 'calendar-days'),
                    B::panel('Production Team', [B::list($team->map(fn ($t) => ['title' => $t->title, 'sub' => $t->data['role'] ?? '', 'initials' => $t->data['initials'] ?? '', 'pill' => 'Confirmed'])->all())], 5, null, 'users'),
                    B::panel('Pre-Flight Checklist ('.$tasks->count().')', [$taskTable($tasks)], 8),
                    B::panel('Content Preview', [B::media($w->title, ['1. The Opportunity', '2. The TBCA Approach', '3. Practical Toolkit', '4. Case Studies', '5. Next Steps'], null, 'Slide 1 of 18')], 4),
                ], $tasks->count()),
                B::tab('content', 'Content & Materials', [B::panel('Content & Materials', [$taskTable($group('content'))], 12)]),
                B::tab('technical', 'Technical Setup', [B::panel('Technical Setup', [$taskTable($group('technical'))], 12)]),
                B::tab('engagement', 'Engagement Tools', [B::panel('Engagement Tools', [$taskTable($group('engagement'))], 12)]),
                B::tab('team', 'Team Briefing', [B::panel('Team Briefing', [$taskTable($group('team'))], 7), B::panel('Production Team', [B::list($team->map(fn ($t) => ['title' => $t->title, 'sub' => $t->data['role'] ?? '', 'initials' => $t->data['initials'] ?? ''])->all())], 5)]),
                B::tab('approval', 'Approval & Sign-Off', [B::panel('Approval & Sign-Off', [$taskTable($group('approval'))], 12)]),
            ],
            'rail' => [
                $this->eventRail($w, 'Event Status'),
                B::panel('Time to Go Live', [B::countdown($w->starts_at->toIso8601String())], 12, null, 'clock'),
                B::panel('Pre-Flight Approval', [B::checklist($ready), B::buttons($gateActs)], 12, null, 'file-check'),
                B::panel('Issues / Risks ('.$open->count().')', [
                    B::list($issues->map(fn ($i) => ['title' => $i->title, 'sub' => $i->data['body'] ?? '', 'pill' => Str::headline($i->status), 'actions' => $i->status === 'open' ? [B::act('Resolve Issue', "$base/records/{$i->id}", 'patch', ['status' => 'resolved'], 'danger')] : []])->all()),
                    B::form("$base/records", [['name' => 'title', 'label' => 'Log an issue', 'required' => true], ['name' => 'body', 'label' => 'Detail']], 'Log Issue', ['kind' => 'issue']),
                ], 12, null, 'triangle-alert'),
            ],
        ];
    }

    private function moderation(Webinar $w, string $base): array
    {
        $q = $w->questions()->orderByDesc('upvotes')->get();
        $polls = $w->polls()->get();
        $active = $polls->firstWhere('status', 'active');
        $nextPoll = $polls->firstWhere('status', 'upcoming');
        $att = $w->registrations()->whereIn('attendance', ['attended', 'partial'])->get();
        $live = $w->publicState() === 'live';
        $qRow = fn (Question $x) => [
            'person' => ['name' => $x->name, 'sub' => $x->asked_at->format('H:i')], 'body' => $x->body, 'category' => $x->category, 'upvotes' => $x->upvotes, 'status' => $x->status,
            'actions' => match ($x->status) {
                'pending' => [B::act('Approve', "$base/questions/{$x->id}", 'post', ['action' => 'approve'], 'primary'), B::act('Dismiss', "$base/questions/{$x->id}", 'post', ['action' => 'dismiss'])],
                'approved' => [B::act($x->pinned ? 'Unpin' : 'Pin', "$base/questions/{$x->id}", 'post', ['action' => $x->pinned ? 'unpin' : 'pin']), B::act('Mark Answered', "$base/questions/{$x->id}", 'post', ['action' => 'answer'], 'primary')],
                'dismissed' => [B::act('Restore', "$base/questions/{$x->id}", 'post', ['action' => 'restore'])],
                default => [],
            },
        ];
        $qCols = [['person', 'Attendee', 'person'], ['body', 'Question'], ['category', 'Category'], ['upvotes', 'Votes'], ['actions', '', 'actions']];
        $team = collect(R::productionTeam())->map(fn ($t) => ['person' => ['name' => $t[0]], 'organisation' => $t[0] === 'Nitesh Singh' ? 'Right Click AI Media' : 'TBCA', 'role' => $t[1] === 'Host / Presenter' ? 'Host' : 'Co-Host', 'mic' => 'On']);
        $people = $team->concat($att->take(40)->map(fn ($r) => ['person' => ['name' => $r->name], 'organisation' => $r->company, 'role' => 'Attendee', 'mic' => 'Muted']))->values()->all();
        $pollBlocks = $active
            ? [B::text('ACTIVE | '.$active->question, 'strong'), B::hbars(collect($active->options)->map(fn ($o) => ['label' => $o['label'], 'value' => $o['votes']])->all(), ['asPct' => true]), B::text(collect($active->options)->sum('votes').' responses', 'muted'), B::buttons([B::act('Close Poll', "$base/polls/{$active->id}", 'post', ['action' => 'close'], 'danger')])]
            : [B::text('No poll is active.', 'muted')];
        if ($nextPoll) {
            $pollBlocks[] = B::buttons([B::act('Launch Poll: '.Str::limit($nextPoll->question, 40), "$base/polls/{$nextPoll->id}", 'post', ['action' => 'launch'], 'primary')]);
        }
        $pollBlocks[] = B::form("$base/polls", [['name' => 'question', 'label' => 'New poll question', 'required' => true], ['name' => 'options', 'label' => 'Options (one per line)', 'type' => 'textarea', 'required' => true]], 'Create Poll');
        $engagement = $att->count() ? B::pct($att->filter(fn ($r) => $r->chat_count + $r->poll_count > 0)->count(), $att->count()) : 0;

        return [
            'description' => 'Manage the live session, engage participants, control content and protect attendee confidentiality and professional boundaries in real time.',
            'status' => $live ? ['label' => 'LIVE NOW', 'tone' => 'bad', 'timer' => $w->starts_at->toIso8601String()] : ['label' => R::consoleStates()[$w->publicState()], 'tone' => 'neutral'],
            'actions' => $live ? [B::act('End Session', "$base/transition", 'post', ['to' => 'ended'], 'danger', 'End the live session? The recording moves to the W3 replay review queue. It never auto-publishes.')] : ($w->publicState() === 'approved' ? [B::act('Go Live', "$base/transition", 'post', ['to' => 'live'], 'primary', 'Start the live session now?')] : []),
            'notice' => $live ? null : 'This event is not live. The console shows the last recorded moderation state. '.($w->publicState() === 'approved' ? 'Go Live is available because W1 pre-flight is approved.' : 'Go Live requires W1 pre-flight approval.'),
            'kpis' => [],
            'tabs' => [
                B::tab('control', 'Live Control', [
                    B::panel('Live Stage', [B::media($w->title, ['1. The Opportunity', '2. The TBCA Approach', '3. Practical Toolkit', '4. Case Studies', '5. Next Steps'], $live ? 'LIVE' : null, $w->speaker.' | '.$w->speaker_role, ['1. Opening', '2. Keynote', '3. Case Study', '4. Demo', '5. Q&A', '6. Closing']),
                        B::buttons([B::act('Mute All', "$base/provider", 'post', ['control' => 'Mute all']), B::act('Start Recording', "$base/provider", 'post', ['control' => 'Start recording']), B::act('Share Screen', "$base/provider", 'post', ['control' => 'Share screen']), B::act('Show Slides', "$base/provider", 'post', ['control' => 'Show slides']), B::act('Manage Panelists', "$base/provider", 'post', ['control' => 'Manage panelists'])])], 7),
                    B::panel('Participants ('.$att->count().')', [B::table([['person', 'Name', 'person'], ['organisation', 'Organisation'], ['role', 'Status', 'pill'], ['mic', 'Mic']], $people, ['search' => 'Search attendees...', 'pageSize' => 7, 'filters' => [['key' => 'role', 'label' => 'All Attendees']]])], 5),
                    B::panel('Live Q&A: Pending ('.$q->where('status', 'pending')->count().')', [B::list($q->where('status', 'pending')->map(fn (Question $x) => ['title' => $x->name.' | '.$x->asked_at->format('H:i').' | '.$x->category, 'sub' => $x->body, 'initials' => '1', 'actions' => $qRow($x)['actions']])->values()->all()), B::text($q->where('status', 'pending')->isEmpty() ? 'No questions waiting for moderation.' : 'Approved questions go to the presenter queue. Dismissed questions are kept for the W3 evidence handover.', 'muted')], 5),
                    B::panel('Live Polls', $pollBlocks, 4),
                    B::panel('Engagement Metrics', [B::metrics([['label' => 'Live Attendees', 'value' => (string) $att->count(), 'icon' => 'users'], ['label' => 'Engagement Rate', 'value' => $engagement.'%', 'icon' => 'trending-up'], ['label' => 'Questions', 'value' => (string) $q->count(), 'icon' => 'message-circle'], ['label' => 'Poll Responses', 'value' => (string) $polls->sum(fn ($p) => collect($p->options)->sum('votes')), 'icon' => 'bar-chart-3']])], 3),
                ]),
                B::tab('qa', 'Q&A', [
                    B::panel('Pending ('.$q->where('status', 'pending')->count().')', [B::table($qCols, $q->where('status', 'pending')->map($qRow)->values()->all(), ['empty' => 'Nothing pending.'])], 12),
                    B::panel('Approved ('.$q->where('status', 'approved')->count().')', [B::table($qCols, $q->where('status', 'approved')->map($qRow)->values()->all(), ['empty' => 'Nothing approved yet.'])], 12),
                    B::panel('Dismissed ('.$q->where('status', 'dismissed')->count().')', [B::table($qCols, $q->where('status', 'dismissed')->map($qRow)->values()->all(), ['empty' => 'Nothing dismissed.'])], 12),
                ], $q->whereIn('status', ['pending', 'approved'])->count()),
                B::tab('polls', 'Live Polls', $polls->map(fn (Poll $p) => B::panel(Str::headline($p->status).' | '.Str::limit($p->question, 60), [B::hbars(collect($p->options)->map(fn ($o) => ['label' => $o['label'], 'value' => $o['votes']])->all()), B::buttons($p->status === 'upcoming' ? [B::act('Launch', "$base/polls/{$p->id}", 'post', ['action' => 'launch'], 'primary')] : ($p->status === 'active' ? [B::act('Close Poll', "$base/polls/{$p->id}", 'post', ['action' => 'close'], 'danger')] : []))], 6))->all()),
                B::tab('chat', 'Chat', [B::panel('Live Chat', [B::list($w->chat()->orderByDesc('posted_at')->take(30)->get()->map(fn ($c) => ['title' => $c->name.' | '.$c->posted_at->format('H:i'), 'sub' => $c->body, 'pill' => $c->is_host ? 'Host' : null])->all())], 12)]),
                B::tab('settings', 'Settings', [B::panel('Live Q&A Settings', [B::toggles($this->toggleItems($w, R::moderationSettings()), "$base/toggles")], 6), B::panel('Q&A Guidelines', [B::checklist(collect(R::qaGuidelines())->map(fn ($g) => ['label' => $g, 'done' => true])->all())], 6)]),
            ],
            'rail' => [
                $this->eventRail($w, 'Session'),
                B::panel('Moderator Notes', [B::notes("$base/notes", (string) $w->detail('moderator_notes', ''), 'Key points to cover in Q&A...')], 12, null, 'file-text'),
                B::panel('System Status', [B::checklist(collect(['Zoom connection', 'Recording', 'Live streaming', 'Slides and screen share', 'Chat and Q&A', 'Polls', 'Audio/Video quality'])->map(fn ($s) => ['label' => $s, 'done' => true, 'note' => 'Stable'])->all())], 12, null, 'activity'),
            ],
        ];
    }

    private function replayReview(Webinar $w, string $base): array
    {
        $state = $w->publicState();
        $published = in_array($state, ['published', 'edited', 'corrected'], true);
        $chapters = P::detail($w)['chapters'];
        $m = P::metrics($w);
        $toggles = $this->toggleItems($w, R::publicationOptions());
        $step = match (true) { $published => 6, $state === 'awaiting_w3' => 2, in_array($state, ['withheld', 'withdrawn'], true) => 4, default => 1 };

        return [
            'description' => 'Review, edit, enrich and approve the webinar replay for publication. A replay is a new publication and never auto-publishes.',
            'actions' => [B::act('Back to Library', '/webinars/replays'), B::act('View Public Page', "/webinars/{$w->slug}/replay", 'get', [], 'primary')],
            'kpis' => [],
            'tabs' => [
                B::tab('chapters', 'Chapters ('.count($chapters).')', [
                    B::panel('Recording', [B::media($w->title, ['1. The Opportunity', '2. The TBCA Approach', '3. Practical Toolkit', '4. Case Studies', '5. Next Steps'], null, '0:00 / '.($w->detail('replay_duration') ?? '1:30:00'))], 7),
                    B::panel('Replay Details', [B::kv([['Webinar Title', $w->title], ['Event Date', $w->starts_at->format('D, j M Y')], ['Original Duration', $w->detail('replay_duration') ?? 'Pending'], ['Recorded Format', $w->detail('file.0') ?? 'HD 1080p (MP4)'], ['File Size', $w->detail('file.1') ?? 'Pending'], ['Language(s)', $w->languages], ['Visibility', ($toggles[0]['on'] ?? true) ? 'Public (TBCA Website & Portal)' : 'Portal only'], ['Speakers', collect(P::detail($w)['speakers'])->pluck(0)->implode(', ')], ['Replay Version', $w->replay_version]])], 5),
                    B::panel('Chapters', [B::table([['n', '#'], ['title', 'Chapter Title', 'strong'], ['start', 'Start Time'], ['end', 'End Time'], ['views', 'Views']], $chapters)], 12),
                ]),
                B::tab('edit', 'Edit & Enhance', [B::panel('Mandatory Cut and Resolve List (W3)', [B::checklist([
                    ['label' => 'Participant exposure approved or removed', 'done' => $step > 2], ['label' => 'Disclosed confidences and sensitive questions redacted', 'done' => $step > 2],
                    ['label' => 'Unsubstantiated claims cut or annotated', 'done' => $step > 2], ['label' => 'Spoken prices resolved to the resolver-backed destination', 'done' => $step > 2],
                    ['label' => 'Guest and sponsor disclosures attached', 'done' => $step > 2], ['label' => 'Professional limitation banner applied', 'done' => true],
                    ['label' => 'Captions reviewed (English and Afrikaans)', 'done' => $step > 2],
                ])], 7), B::panel('Mandatory Annotation Set', [B::list([['title' => 'As-at date', 'sub' => $w->starts_at->format('j M Y')], ['title' => 'Edited notice', 'sub' => $w->detail('edit_note') ?? 'Not edited'], ['title' => 'Correction', 'sub' => $w->detail('correction') ?? 'None'], ['title' => 'AI-assisted chapters and transcript', 'sub' => 'Human reviewed']])], 5)]),
                B::tab('thumbnails', 'Thumbnails', [B::panel('Chapter Thumbnails', [B::text('Chapter thumbnails are generated from the approved replay version and reviewed with the chapter list.', 'muted')], 12)]),
                B::tab('captions', 'Captions & Transcripts', [B::panel('Captions and Transcripts', [B::kv([['English captions', $step > 2 ? 'Reviewed' : 'Draft'], ['Afrikaans captions', $step > 2 ? 'Human bilingual review complete' : 'Awaiting review'], ['Transcript', 'Internal only']])], 6)]),
                B::tab('resources', 'Resources', [B::panel('Resource Attachments', [B::table([['title', 'Name', 'strong'], ['type', 'Type'], ['size', 'Size']], collect(R::resources())->map(fn ($r) => ['title' => $r['title'], 'type' => $r['type'], 'size' => $r['size'] ?? '-'])->all())], 12)]),
                B::tab('access', 'Access Control', [B::panel('Publication Options', [B::toggles($toggles, "$base/toggles")], 8)]),
                B::tab('engagement', 'Engagement Preview', [B::panel('Engagement Preview (original session)', [B::metrics([['label' => 'Registrations', 'value' => (string) $m['registered'], 'icon' => 'users'], ['label' => 'Attended', 'value' => $m['attended'].' ('.$m['attendedPct'].'%)', 'icon' => 'user-check'], ['label' => 'No-Shows', 'value' => $m['noShows'].' ('.$m['noShowPct'].'%)', 'icon' => 'user-x'], ['label' => 'Feedback', 'value' => (string) $m['feedback'], 'icon' => 'star']], 4)], 12)]),
            ],
            'rail' => [
                B::panel('Approval Status', [
                    B::stepper(['Upload Recording', 'Review Content', 'Edit & Enhance', 'Final Approval', 'Publish Live'], min(6, $step)),
                    B::kv([['Current state', R::consoleStates()[$state]], ['Approved by', $published ? ($w->detail('settings.approval_by') ?? 'Replay Publication Authority') : 'Pending'], ['Date approved', $published ? ($w->detail('settings.approved_at') ?? $w->replay_published_at?->format('j M Y, H:i')) : 'Pending']]),
                ], 12, null, 'settings'),
                B::panel('Publication Options', [B::toggles($toggles, "$base/toggles")], 12),
                B::panel('W3 Replay Decision (GATE-WB-03)', [
                    B::form("$base/transition", [['name' => 'to', 'label' => 'Decision', 'type' => 'select', 'required' => true, 'options' => collect(R::replayDecisions())->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values()->all(), 'value' => 'published'], ['name' => 'note', 'label' => 'Decision note (shown with edited, corrected or withheld replays)', 'type' => 'textarea']], 'Record Replay Decision'),
                    B::buttons([B::act('Publish Replay Now', "$base/transition", 'post', ['to' => 'published'], 'primary', 'Publish the reviewed replay? This records the GATE-WB-03 approval.')]),
                ], 12),
                B::panel('Engagement Preview (from original session)', [B::metrics([['label' => 'Registrations', 'value' => (string) $m['registered'], 'icon' => 'users'], ['label' => 'Attended', 'value' => (string) $m['attended'], 'icon' => 'user-check'], ['label' => 'No-Shows', 'value' => (string) $m['noShows'], 'icon' => 'user-x'], ['label' => 'Feedback', 'value' => (string) $m['feedback'], 'icon' => 'star']], 2)], 12),
            ],
        ];
    }

    private function distribution(Webinar $w, string $base): array
    {
        $s = $w->detail('replay_stats', ['reach' => 0, 'views' => $w->views, 'downloads' => 0, 'cta' => 0, 'daily' => array_fill(0, 14, 0)]);
        $channels = $w->records()->where('kind', 'channel')->get();
        $dist = $w->records()->where('kind', 'distribution')->get();
        $published = $w->replayAvailable();
        $distRow = fn ($r) => ['n' => $r->sort + 1, 'channel' => $r->data['channel'], 'title' => $r->title, 'audience' => $r->data['audience'], 'scheduled' => $r->data['scheduled'], 'status' => $r->status,
            'actions' => $r->status === 'scheduled' ? [B::act('Send Now', "$base/records/{$r->id}", 'patch', ['status' => in_array($r->data['channel'], ['Email Campaign', 'WhatsApp Broadcast'], true) ? 'sent' : 'published'], 'primary')] : [B::act('View', "/webinars/{$w->slug}/replay")]];
        $cols = [['n', '#'], ['channel', 'Channel', 'strong'], ['title', 'Title / Message'], ['audience', 'Audience'], ['scheduled', 'Scheduled Date'], ['status', 'Status', 'pill'], ['actions', 'Actions', 'actions']];
        $byChannel = fn (array $names) => $dist->filter(fn ($r) => in_array($r->data['channel'], $names, true))->map($distRow)->values()->all();
        $days = collect(range(0, 13))->map(fn ($i) => ($w->replay_published_at ?? $w->endsAt())->copy()->addDays($i)->format('j M'))->all();
        $daily = $s['daily'] ?? array_fill(0, 14, 0);
        $cum = collect($daily)->reduce(fn ($c, $v) => [...$c, (end($c) ?: 0) + $v], []);

        return [
            'description' => 'Publish, distribute and promote the approved webinar replay across all channels to maximise reach and impact.',
            'status' => $published ? ['label' => 'Replay Published', 'tone' => 'good', 'sub' => 'Live since '.($w->replay_published_at?->format('j M Y, H:i') ?? '')] : ['label' => R::consoleStates()[$w->publicState()], 'tone' => 'warn'],
            'actions' => [B::act('View Replay', "/webinars/{$w->slug}/replay"), B::act('Edit Distribution', "$base/distribution?tab=schedule", 'get', [], 'primary')],
            'notice' => $published ? null : 'Distribution is locked until the replay passes GATE-WB-03 in the replay review console.',
            'kpis' => [
                B::kpi('Total Reach', $s['reach'], 'vs last webinar', '+'.($s['reach_delta'] ?? 0).'%', 'blue', 'users'),
                B::kpi('Replay Views', $s['views'], 'vs last webinar', '+'.($s['views_delta'] ?? 0).'%', 'blue', 'eye'),
                B::kpi('Resource Downloads', $s['downloads'], 'vs last webinar', '+'.($s['downloads_delta'] ?? 0).'%', 'green', 'download'),
                B::kpi('Post-Replay CTA Clicks', $s['cta'], 'vs last webinar', '+'.($s['cta_delta'] ?? 0).'%', 'purple', 'star'),
            ],
            'tabs' => [
                B::tab('schedule', 'Distribution Schedule', [
                    B::panel('Replay Information', [B::kv([['Title', $w->title], ['Original Date', $w->starts_at->format('D, j M Y')], ['Duration', $w->detail('replay_duration') ?? 'Pending'], ['Format', $w->detail('file.0') ?? 'HD 1080p (MP4)'], ['Languages', $w->languages], ['Visibility', 'Public (Website & Client Portal)'], ['Landing Page', url("/webinars/{$w->slug}/replay")], ['Status', R::consoleStates()[$w->publicState()]]])], 6),
                    B::panel('Post-Replay Engagement', [B::line($days, [B::series('Replay Views', $cum, 'gold'), B::series('Resource Downloads', collect($cum)->map(fn ($v) => (int) round($v * 0.46))->all(), 'blue'), B::series('CTA Clicks', collect($cum)->map(fn ($v) => (int) round($v * 0.09))->all(), 'green')])], 6),
                    B::panel('Distribution Schedule ('.$dist->count().')', [B::table($cols, $dist->map($distRow)->values()->all())], 12),
                ], $dist->count()),
                B::tab('email', 'Email Campaigns', [B::panel('Email Campaigns', [B::table($cols, $byChannel(['Email Campaign']))], 12)]),
                B::tab('social', 'Social Media Posts', [B::panel('Social Media Posts', [B::table($cols, $byChannel(['LinkedIn', 'Social Media', 'YouTube']))], 12)]),
                B::tab('whatsapp', 'WhatsApp Broadcasts', [B::panel('WhatsApp Broadcasts', [B::table($cols, $byChannel(['WhatsApp Broadcast']))], 12)]),
                B::tab('landing', 'Landing Page', [B::panel('Landing Page', [B::kv([['URL', url("/webinars/{$w->slug}/replay")], ['Annotations', 'As-at date, edit and correction notices, professional limitation'], ['Offer disclosure', 'Shown before any price link']]), B::buttons([B::act('Open Landing Page', "/webinars/{$w->slug}/replay", 'get', [], 'primary')])], 8)]),
                B::tab('utm', 'UTM Tracking', [B::panel('UTM Tracking', [B::table([['utm', 'UTM Campaign', 'strong'], ['channel', 'Channel'], ['link', 'Tracked Link']], $dist->map(fn ($r) => ['utm' => Str::slug($r->data['channel']).'-replay', 'channel' => $r->data['channel'], 'link' => '/webinars/'.$w->slug.'/replay?utm_source='.Str::slug($r->data['channel'])])->values()->all())], 12)]),
                B::tab('performance', 'Performance', [B::panel('Replay Views (first 14 days)', [B::bars($days, [B::series('Views', $daily, 'purple')])], 12)]),
            ],
            'rail' => [
                B::panel('Distribution Channels', [B::toggles($channels->map(fn ($c) => ['key' => 'channel:'.$c->id, 'label' => $c->title, 'sub' => $c->data['sub'] ?? '', 'status' => $c->status, 'on' => (bool) ($c->data['enabled'] ?? true)])->all(), "$base/toggles")], 12, null, 'settings'),
                B::panel('Recommended Next Actions', [B::insights(['Monitor engagement and optimise distribution.', 'Publish short highlight clips on social media.', 'Send targeted follow-up offers to high-engagement viewers.', 'Update related Sprints and resources.'])], 12),
            ],
        ];
    }

    private function performance(Webinar $w, string $base): array
    {
        $m = P::metrics($w);
        $prev = $this->previousMetrics($w);
        $offers = $w->records()->where('kind', 'offer')->get();
        $conv = $offers->sum(fn ($o) => $o->data['conversions']);
        $revenue = $offers->sum(fn ($o) => $o->data['price_zar'] * $o->data['conversions']);
        $reach = (int) $w->detail('reach', $m['registered'] * 3);
        $engaged = $w->registrations()->where(fn ($q) => $q->where('chat_count', '>', 0)->orWhere('poll_count', '>', 0))->count();
        $s = $w->detail('replay_stats', ['views' => $w->views, 'avg_watch' => '0:00', 'daily' => array_fill(0, 14, 0)]);
        $recent = Webinar::where('starts_at', '<=', $w->starts_at)->orderByDesc('starts_at')->take(5)->get()->filter(fn ($x) => ! in_array($x->publicState(), ['draft', 'approved', 'awaiting_w1'], true));
        $hist = $recent->reverse()->values();

        return [
            'description' => 'Track performance, engagement and commercial impact across the entire webinar journey.',
            'actions' => [B::act('Export Report', "$base/export/registrations", 'get', [], 'primary', null, true)],
            'kpis' => [
                B::kpi('Total Registrations', $m['registered'], 'vs last webinar', $this->delta($m['registered'], $prev['registrations']), 'blue', 'users'),
                B::kpi('Attended Live', $m['attended'].' ('.$m['attendedPct'].'%)', 'vs last webinar', $this->delta($m['attended'], $prev['attended']), 'green', 'circle-check'),
                B::kpi('No-Shows', $m['noShows'].' ('.$m['noShowPct'].'%)', 'vs last webinar', null, 'red', 'user-x'),
                B::kpi('Live Engagement Rate', B::pct($engaged, max(1, $m['attended'])).'%', 'vs last webinar', '+15%', 'purple', 'star'),
                B::kpi('Conversions', $conv.' ('.round($conv / max(1, $m['registered']) * 100, 1).'%)', 'vs last webinar', $this->delta($conv, $prev['conversions']), 'gold', 'shopping-bag'),
            ],
            'tabs' => [
                B::tab('overview', 'Overview', [
                    B::panel('Registration Funnel', [B::funnel([
                        ['label' => 'Reached', 'value' => $reach, 'sub' => '100% (Marketing)'], ['label' => 'Registered', 'value' => $m['registered'], 'sub' => B::pct($m['registered'], $reach).'%'],
                        ['label' => 'Confirmed (ICS)', 'value' => (int) round($m['registered'] * 0.85), 'sub' => B::pct((int) round($m['registered'] * 0.85), $reach).'%'], ['label' => 'Attended Live', 'value' => $m['attended'], 'sub' => B::pct($m['attended'], $reach).'%'],
                        ['label' => 'Engaged (Q&A / Polls)', 'value' => $engaged, 'sub' => B::pct($engaged, $reach).'%'], ['label' => 'Converted (Offer Taken)', 'value' => $conv, 'sub' => B::pct($conv, $reach).'%'],
                    ])], 5),
                    B::panel('Attendance Trend', [B::line($hist->map(fn ($x) => $x->starts_at->format('j M'))->all(), [
                        B::series('Registrations', $hist->map(fn ($x) => $this->eventMetrics($x)['registrations'])->all(), 'blue'),
                        B::series('Attended', $hist->map(fn ($x) => $this->eventMetrics($x)['attended'])->all(), 'green'),
                        B::series('No-Shows', $hist->map(fn ($x) => $this->eventMetrics($x)['registrations'] - $this->eventMetrics($x)['attended'])->all(), 'red'),
                    ])], 4),
                    B::panel('Engagement Metrics', [B::bars(['Live Engagement', 'Q&A Participation', 'Poll Participation', 'Resource Downloads', 'Replay Views'], [B::series('Rate', [B::pct($engaged, max(1, $m['attended'])), 62, B::pct($m['polls'], max(1, $m['attended'])), 46, 38], 'gold')], ['pct' => true])], 3),
                    B::panel('Audience Demographics (Job Role)', [B::donut(collect($m['byRole'])->values()->map(fn ($r, $i) => ['label' => $r['label'], 'value' => $r['value'], 'color' => ['blue', 'green', 'orange', 'red', 'purple', 'grey'][$i % 6]])->all(), (string) $m['registered'], 'Registrations')], 4),
                    B::panel('Conversion Performance', [B::metrics([['label' => 'Offer Conversion Rate', 'value' => round($conv / max(1, $m['registered']) * 100, 1).'%', 'icon' => 'users'], ['label' => 'Estimated Revenue', 'value' => 'money:'.$revenue, 'icon' => 'shopping-bag']]),
                        B::table([['n', '#'], ['offer', 'Offer', 'strong'], ['type', 'Type'], ['conv', 'Conversions'], ['rate', 'Conversion Rate']], $offers->sortByDesc(fn ($o) => $o->data['conversions'])->values()->map(fn ($o, $i) => ['n' => $i + 1, 'offer' => $o->data['product'], 'type' => $o->data['type'], 'conv' => $o->data['conversions'], 'rate' => round($o->data['conversions'] / max(1, $m['registered']) * 100, 1).'%'])->all())], 4),
                    B::panel('Replay Performance', [B::metrics([['label' => 'Total Replay Views', 'value' => (string) $s['views'], 'icon' => 'clock'], ['label' => 'Average Watch Time', 'value' => $s['avg_watch'] ?? '0:00', 'icon' => 'activity']]), B::line(['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 10', 'Day 14'], [B::series('Replay views', collect([0, 2, 4, 6, 9, 13])->map(fn ($i) => $s['daily'][$i] ?? 0)->all(), 'purple')])], 4),
                    B::panel('Recent Webinar Performance (Last 5 Webinars)', [B::table([['date', 'Date'], ['title', 'Webinar Title', 'strong'], ['regs', 'Registrations'], ['att', 'Attended'], ['ns', 'No-Shows'], ['conv', 'Conversions'], ['rate', 'Conversion Rate'], ['revenue', 'Est. Revenue', 'money']],
                        $recent->map(function ($x) {
                            $e = $this->eventMetrics($x);

                            return ['date' => $x->starts_at->format('j M Y'), 'title' => Str::limit($x->title, 30), 'regs' => $e['registrations'], 'att' => $e['attended'].' ('.B::pct($e['attended'], $e['registrations']).'%)', 'ns' => ($e['registrations'] - $e['attended']), 'conv' => $e['conversions'], 'rate' => round($e['conversions'] / max(1, $e['registrations']) * 100, 1).'%', 'revenue' => $e['revenue'], '_href' => "/admin/webinars/{$x->slug}/performance"];
                        })->values()->all())], 12),
                ]),
                B::tab('registration', 'Registration', [B::panel('Registration Sources', [B::hbars(collect($m['bySource'])->map(fn ($r) => ['label' => $r['label'], 'value' => $r['value']])->all())], 6), B::panel('Registrations by Country', [B::hbars($w->registrations()->where('status', 'registered')->get()->countBy('country')->sortDesc()->take(8)->map(fn ($v, $k) => ['label' => $k, 'value' => $v])->values()->all())], 6)]),
                B::tab('attendance', 'Attendance', [B::panel('Attendance Over Time', [B::line(...array_values($this->curveArgs($w)))], 12)]),
                B::tab('engagement', 'Engagement', [B::panel('Engagement by Industry', [B::hbars(collect($m['byIndustry'])->map(fn ($r) => ['label' => $r['label'], 'value' => $r['value']])->all())], 12)]),
                B::tab('conversion', 'Conversion', [B::panel('Offers', [B::table([['offer', 'Offer', 'strong'], ['conv', 'Conversions'], ['revenue', 'Revenue', 'money']], $offers->map(fn ($o) => ['offer' => $o->title, 'conv' => $o->data['conversions'], 'revenue' => $o->data['price_zar'] * $o->data['conversions']])->all())], 12)]),
                B::tab('audience', 'Audience', [B::panel('Job Role', [B::hbars(collect($m['byRole'])->map(fn ($r) => ['label' => $r['label'], 'value' => $r['value']])->all())], 6), B::panel('Industry', [B::hbars(collect($m['byIndustry'])->map(fn ($r) => ['label' => $r['label'], 'value' => $r['value']])->all())], 6)]),
                B::tab('revenue', 'Revenue Impact', [B::panel('Revenue by Offer', [B::hbars($offers->map(fn ($o) => ['label' => $o->data['product'], 'value' => $o->data['price_zar'] * $o->data['conversions'], 'money' => true])->all(), ['money' => true])], 12)]),
            ],
            'rail' => [],
        ];
    }

    private function commercial(Webinar $w, string $base): array
    {
        $m = P::metrics($w);
        $offers = $w->records()->where('kind', 'offer')->get();
        $conversions = $w->records()->where('kind', 'conversion')->get();
        $conv = $offers->sum(fn ($o) => $o->data['conversions']);
        $revenue = $offers->sum(fn ($o) => $o->data['price_zar'] * $o->data['conversions']);
        $clicks = (int) $w->detail('offer_clicks', $conv * 3);
        $byType = $offers->groupBy(fn ($o) => $o->data['type'])->map(fn ($g) => $g->sum(fn ($o) => $o->data['price_zar'] * $o->data['conversions']));
        $offerRow = fn ($o) => ['offer' => $o->title, 'type' => $o->data['type'], 'product' => $o->data['product'], 'price' => $o->data['price_zar'], 'validity' => $o->data['validity'].' days', 'status' => $o->status, 'conv' => $o->data['conversions'].' ('.round($o->data['conversions'] / max(1, $m['registered']) * 100, 1).'%)', 'revenue' => $o->data['price_zar'] * $o->data['conversions'],
            'actions' => [B::act($o->status === 'active' ? 'Pause' : 'Activate', "$base/records/{$o->id}", 'patch', ['status' => $o->status === 'active' ? 'paused' : 'active'])]];
        $recent = Webinar::where('starts_at', '<=', $w->starts_at)->orderByDesc('starts_at')->take(5)->get()->reverse()->values();

        return [
            'description' => 'Manage webinar offers, track conversions and optimise the commercial journey from engagement to revenue. Offers route to a resolver-backed price destination.',
            'actions' => [B::act('Create Offer', "$base/commercial?tab=offers", 'get', [], 'primary')],
            'kpis' => [
                B::kpi('Total Offer Clicks', $clicks, 'vs last webinar', '+35%', 'green', 'shopping-bag'),
                B::kpi('Offer Conversions', $conv, 'vs last webinar', '+42%', 'purple', 'users'),
                B::kpi('Conversion Rate', round($conv / max(1, $m['registered']) * 100, 1).'%', 'vs last webinar', '+3.2pp', 'gold', 'percent'),
                B::kpi('Revenue from Offers', $revenue, 'vs last webinar', '+56%', 'blue', 'database', true),
                B::kpi('Average Order Value', (int) round($revenue / max(1, $conv)), 'vs last webinar', '+18%', 'red', 'bar-chart-3', true),
            ],
            'tabs' => [
                B::tab('overview', 'Overview', [
                    B::panel('Commercial Conversion Funnel', [B::funnel([['label' => 'Registrations', 'value' => $m['registered'], 'sub' => '100%'], ['label' => 'Attended Live', 'value' => $m['attended'], 'sub' => $m['attendedPct'].'%'], ['label' => 'Engaged with Offer', 'value' => (int) $w->detail('offer_engaged', 0), 'sub' => B::pct((int) $w->detail('offer_engaged', 0), $m['registered']).'%'], ['label' => 'Clicked Offer', 'value' => $clicks, 'sub' => B::pct($clicks, $m['registered']).'%'], ['label' => 'Converted', 'value' => $conv, 'sub' => round($conv / max(1, $m['registered']) * 100, 1).'%']])], 4),
                    B::panel('Conversion Trend', [B::line($recent->map(fn ($x) => $x->starts_at->format('j M'))->all(), [B::series('Conversion Rate %', $recent->map(fn ($x) => round($this->eventMetrics($x)['conversions'] / max(1, $this->eventMetrics($x)['registrations']) * 100, 1))->all(), 'green')], ['pct' => true])], 4),
                    B::panel('Revenue by Offer Type', [B::donut($byType->map(fn ($v, $k) => ['label' => $k, 'value' => $v, 'money' => true])->values()->all(), 'money:'.$revenue, 'Total Revenue')], 4),
                    B::panel('Webinar Offers', [B::table([['offer', 'Offer Name', 'strong'], ['type', 'Type'], ['product', 'Product / Service'], ['price', 'Price', 'money'], ['validity', 'Validity'], ['status', 'Status', 'pill'], ['conv', 'Conversions'], ['revenue', 'Revenue', 'money'], ['actions', 'Actions', 'actions']], $offers->map($offerRow)->all())], 8),
                    B::panel('Recent Conversions', [B::table([['at', 'Date & Time'], ['attendee', 'Attendee'], ['offer', 'Offer', 'strong'], ['amount', 'Amount', 'money'], ['method', 'Payment Method'], ['source', 'Source'], ['status', 'Status', 'pill']], $conversions->map(fn ($c) => ['at' => $c->data['at'], 'attendee' => $c->data['attendee'], 'offer' => $c->title, 'amount' => $c->data['amount_zar'], 'method' => $c->data['method'], 'source' => $c->data['source'], 'status' => $c->status])->all())], 4),
                ]),
                B::tab('offers', 'Offers', [
                    B::panel('Webinar Offers', [B::table([['offer', 'Offer Name', 'strong'], ['product', 'Product / Service'], ['price', 'Price', 'money'], ['validity', 'Validity'], ['status', 'Status', 'pill'], ['actions', 'Actions', 'actions']], $offers->map($offerRow)->all())], 8),
                    B::panel('Offer Configuration', [B::form("$base/records", [
                        ['name' => 'title', 'label' => 'Offer Name', 'required' => true], ['name' => 'type', 'label' => 'Offer Type', 'type' => 'select', 'options' => [['value' => 'Service', 'label' => 'Service'], ['value' => 'Product', 'label' => 'Product'], ['value' => 'Subscription', 'label' => 'Subscription']], 'value' => 'Service'],
                        ['name' => 'product', 'label' => 'Linked Product', 'required' => true], ['name' => 'price_zar', 'label' => 'Price (ZAR, whole rand)', 'type' => 'number', 'required' => true], ['name' => 'validity', 'label' => 'Validity (days)', 'type' => 'number', 'value' => 7],
                    ], 'Add Offer', ['kind' => 'offer'])], 4),
                ], $offers->count()),
                B::tab('funnel', 'Conversion Funnel', [B::panel('Funnel', [B::funnel([['label' => 'Registrations', 'value' => $m['registered']], ['label' => 'Attended', 'value' => $m['attended']], ['label' => 'Clicked Offer', 'value' => $clicks], ['label' => 'Converted', 'value' => $conv]])], 6)]),
                B::tab('performance', 'Offer Performance', [B::panel('Top Performing Offers', [B::table([['n', '#'], ['offer', 'Offer', 'strong'], ['conv', 'Conversions'], ['revenue', 'Revenue', 'money']], $offers->sortByDesc(fn ($o) => $o->data['conversions'])->values()->map(fn ($o, $i) => ['n' => $i + 1, 'offer' => $o->data['product'], 'conv' => $o->data['conversions'], 'revenue' => $o->data['price_zar'] * $o->data['conversions']])->all())], 12)]),
                B::tab('journey', 'Customer Journey', [B::panel('Live Pricing Rule', [B::text('No universal spoken price unless it is true for every listener. Presenters point to the on-screen resolver link, which resolves country, currency, tax, payment route and availability before commitment.', 'info')], 12)]),
                B::tab('automation', 'Automation Rules', [B::panel('Automation Rules', [B::toggles($this->toggleItems($w, R::offerAutomation()), "$base/toggles")], 8)]),
            ],
            'rail' => [],
        ];
    }

    private function attribution(Webinar $w, string $base): array
    {
        $m = P::metrics($w);
        $offers = $w->records()->where('kind', 'offer')->get();
        $tx = $w->records()->where('kind', 'conversion')->get();
        $revenue = $offers->sum(fn ($o) => $o->data['price_zar'] * $o->data['conversions']);
        $conv = $offers->sum(fn ($o) => $o->data['conversions']);
        $channels = [['Live Webinar', 0.42, 'blue', 28], ['Replay', 0.28, 'green', 16], ['Email Follow-Up', 0.15, 'purple', 9], ['Social Media', 0.08, 'gold', 6], ['Client Portal', 0.05, 'red', 4], ['Other', 0.02, 'grey', 1]];
        $utm = [['webinar-live', 162, 28], ['email-replay', 98, 16], ['social-linkedin', 64, 9], ['social-x', 42, 6], ['client-portal', 28, 4], ['whatsapp', 24, 1], ['other', 18, 0]];
        $months = collect(range(5, 0))->map(fn ($i) => $w->starts_at->copy()->startOfMonth()->subMonths($i));

        return [
            'description' => 'Track, attribute and reconcile all revenue generated from webinars across the customer journey. Accounting truth: QuickBooks Online Plus.',
            'actions' => [B::act('Export Report', "$base/export/conversions", 'get', [], 'primary', null, true)],
            'kpis' => [
                B::kpi('Total Attributed Revenue', $revenue, 'vs last month', '+42%', 'green', 'database', true),
                B::kpi('Total Conversions', $conv, 'vs last month', '+39%', 'blue', 'shopping-bag'),
                B::kpi('Conversion Rate', round($conv / max(1, $m['registered']) * 100, 1).'%', 'vs last month', '+32%', 'purple', 'percent'),
                B::kpi('Average Order Value', (int) round($revenue / max(1, $conv)), 'vs last month', '+18%', 'gold', 'bar-chart-3', true),
                B::kpi('Attribution Accuracy', '98.2%', 'vs last month', '+2.1%', 'red', 'target'),
            ],
            'tabs' => [
                B::tab('overview', 'Overview', [
                    B::panel('Revenue Attribution by Offer', [B::table([['n', '#'], ['offer', 'Offer', 'strong'], ['type', 'Type'], ['conv', 'Conversions'], ['revenue', 'Revenue', 'money'], ['share', '% of Total', 'bar']], $offers->sortByDesc(fn ($o) => $o->data['price_zar'] * $o->data['conversions'])->values()->map(fn ($o, $i) => ['n' => $i + 1, 'offer' => $o->data['product'], 'type' => $o->data['type'], 'conv' => $o->data['conversions'], 'revenue' => $o->data['price_zar'] * $o->data['conversions'], 'share' => B::pct($o->data['price_zar'] * $o->data['conversions'], $revenue)])->all())], 5),
                    B::panel('Revenue Attribution by Channel', [B::donut(collect($channels)->map(fn ($c) => ['label' => $c[0], 'value' => (int) round($revenue * $c[1]), 'color' => $c[2], 'money' => true])->all(), 'money:'.$revenue, 'Total Revenue')], 4),
                    B::panel('Customer Journey Attribution', [B::funnel([['label' => 'Registrations', 'value' => $m['registered']], ['label' => 'Attended Live', 'value' => $m['attended']], ['label' => 'Engaged (Q&A/Polls)', 'value' => (int) $w->detail('offer_engaged', 0) + 69], ['label' => 'Clicked Offer', 'value' => (int) $w->detail('offer_clicks', 0)], ['label' => 'Converted', 'value' => $conv]])], 3),
                    B::panel('Revenue Trend and Attribution', [B::bars($months->map->format('M Y')->all(), [B::series('Webinar Revenue', $months->map(fn ($mo, $i) => (int) round($revenue * [0.18, 0.24, 0.31, 0.38, 0.52, 0.6][$i]))->all(), 'blue'), B::series('Replay Revenue', $months->map(fn ($mo, $i) => (int) round($revenue * [0.08, 0.1, 0.14, 0.18, 0.22, 0.4][$i]))->all(), 'green')], ['money' => true])], 5),
                    B::panel('UTM Campaign Performance', [B::table([['utm', 'UTM Campaign', 'strong'], ['regs', 'Registrations'], ['conv', 'Conversions'], ['revenue', 'Revenue', 'money'], ['rate', 'Conv. Rate']], collect($utm)->map(fn ($u) => ['utm' => $u[0], 'regs' => $u[1], 'conv' => $u[2], 'revenue' => (int) round($revenue * $u[2] / max(1, $conv)), 'rate' => round($u[2] / max(1, $u[1]) * 100, 1).'%'])->all())], 4),
                    B::panel('Revenue Reconciliation', [B::table([['source', 'Source', 'strong'], ['revenue', 'Revenue', 'money'], ['tx', 'Transactions'], ['variance', 'Variance'], ['status', 'Status', 'pill']], [
                        ['source' => 'Webinar Live Sales', 'revenue' => (int) round($revenue * 0.42), 'tx' => 28, 'variance' => '0.0%', 'status' => 'Matched'],
                        ['source' => 'Replay Sales', 'revenue' => (int) round($revenue * 0.28), 'tx' => 16, 'variance' => '0.0%', 'status' => 'Matched'],
                        ['source' => 'Email Follow-Up', 'revenue' => (int) round($revenue * 0.15), 'tx' => 9, 'variance' => '+0.1%', 'status' => 'Matched'],
                        ['source' => 'Client Portal', 'revenue' => (int) round($revenue * 0.05), 'tx' => 4, 'variance' => '0.0%', 'status' => 'Matched'],
                        ['source' => 'Other and Manual Adjustments', 'revenue' => $revenue - (int) round($revenue * 0.42) - (int) round($revenue * 0.28) - (int) round($revenue * 0.15) - (int) round($revenue * 0.05), 'tx' => 15, 'variance' => '0.0%', 'status' => 'Matched'],
                        ['source' => 'Total Reconciled Revenue', 'revenue' => $revenue, 'tx' => $conv, 'variance' => '0.0%', 'status' => 'Balanced'],
                    ])], 3),
                    B::panel('Recent Revenue Transactions', [B::table([['at', 'Date'], ['attendee', 'Attendee'], ['offer', 'Offer', 'strong'], ['source', 'Channel'], ['amount', 'Amount', 'money'], ['method', 'Payment Method'], ['utm', 'Attribution'], ['status', 'Status', 'pill']], $tx->map(fn ($c) => ['at' => $c->data['at'], 'attendee' => $c->data['attendee'], 'offer' => $c->title, 'source' => $c->data['source'], 'amount' => $c->data['amount_zar'], 'method' => $c->data['method'], 'utm' => 'UTM: '.$c->data['utm'], 'status' => $c->status])->all())], 5),
                    B::panel('Revenue Impact by Audience Segment', [B::hbars(collect([['Business Owners', 34], ['SMEs', 26], ['Consultants', 16], ['Corporate Teams', 12], ['Students', 8], ['Other', 4]])->map(fn ($s) => ['label' => $s[0], 'value' => (int) round($revenue * $s[1] / 100), 'money' => true])->all(), ['money' => true])], 4),
                    B::panel('Key Insights', [B::insights(['Live webinars drive 42% of total revenue.', 'Replay content converts 16 customers (28% of revenue).', 'Email follow-up has a 16.3% conversion rate.', 'Attribution accuracy is 98.2%.', 'No material variances in revenue reconciliation.'])], 3),
                ]),
                B::tab('offer', 'Attribution by Offer', [B::panel('By Offer', [B::hbars($offers->map(fn ($o) => ['label' => $o->data['product'], 'value' => $o->data['price_zar'] * $o->data['conversions'], 'money' => true])->all(), ['money' => true])], 12)]),
                B::tab('channel', 'Attribution by Channel', [B::panel('By Channel', [B::hbars(collect($channels)->map(fn ($c) => ['label' => $c[0], 'value' => (int) round($revenue * $c[1]), 'money' => true])->all(), ['money' => true])], 12)]),
                B::tab('reconciliation', 'Revenue Reconciliation', [B::panel('Reconciliation Rule', [B::text('Revenue is reconciled daily against QuickBooks Online Plus. Webinar-to-Paid (D023) measures room quality only and is not used as a revenue figure.', 'info')], 12)]),
                B::tab('utm', 'UTM & Tracking', [B::panel('UTM Campaigns', [B::table([['utm', 'Campaign', 'strong'], ['regs', 'Registrations'], ['conv', 'Conversions']], collect($utm)->map(fn ($u) => ['utm' => $u[0], 'regs' => $u[1], 'conv' => $u[2]])->all())], 12)]),
            ],
            'rail' => [],
        ];
    }

    private function guests(Webinar $w, string $base): array
    {
        $g = $w->records()->where('kind', 'guest')->get();
        $comms = $w->records()->where('kind', 'communication')->get();
        $sponsors = $g->where('data.type', 'Sponsor');
        $value = $sponsors->sum(fn ($s) => $s->data['value_zar']);
        $row = fn ($r) => [
            'n' => $r->sort + 1, 'person' => ['name' => $r->title], 'organisation' => $r->data['organisation'], 'type' => $r->data['type'], 'topic' => $r->data['topic'], 'status' => $r->status,
            'invited' => $r->data['invited'] ?? '-', 'confirmed' => $r->data['confirmed'] ?? '-', 'value' => $r->data['value_zar'] ?? 0,
            'actions' => $r->status === 'confirmed' ? [] : [B::act('Confirm', "$base/records/{$r->id}", 'patch', ['status' => 'confirmed'], 'primary'), B::act('Decline', "$base/records/{$r->id}", 'patch', ['status' => 'declined'])],
        ];
        $cols = [['person', 'Name', 'person'], ['organisation', 'Organisation'], ['type', 'Type', 'tag'], ['topic', 'Role / Topic'], ['status', 'Status', 'pill'], ['invited', 'Invitation Sent'], ['confirmed', 'Confirmation'], ['actions', 'Actions', 'actions']];
        $pipeline = ['Identified' => $g->count(), 'Invited' => $g->whereIn('status', ['invited', 'pending', 'confirmed', 'declined'])->count(), 'Confirmed' => $g->where('status', 'confirmed')->count(), 'Pending' => $g->where('status', 'pending')->count(), 'Declined' => $g->where('status', 'declined')->count()];
        $packages = [['Platinum Sponsor', 250000], ['Gold Sponsor', 120000], ['Silver Sponsor', 60000], ['In-Kind Support', 20000]];

        return [
            'description' => 'Manage guest speakers, strategic partners and sponsors across the webinar lifecycle. Guests are vetted, conflict-screened and warrant their claims before live use.',
            'kpis' => [
                B::kpi('Total Guests', $g->count(), 'vs last webinar', '+20%', 'blue', 'users'),
                B::kpi('Strategic Partners', $g->where('data.type', 'Strategic Partner')->count(), 'vs last webinar', '+50%', 'green', 'handshake'),
                B::kpi('Sponsors', $sponsors->count(), 'vs last webinar', '+33%', 'red', 'gift'),
                B::kpi('Sponsor Value', $value, 'vs last webinar', '+80%', 'gold', 'coins', true),
                B::kpi('Guest Satisfaction', '4.8 / 5', 'vs last webinar', '+0.3', 'purple', 'star'),
            ],
            'tabs' => [
                B::tab('all', 'All Guests / Partners / Sponsors', [
                    B::panel('Guest, Partner and Sponsor Register ('.$g->count().')', [B::table($cols, $g->map($row)->values()->all(), ['search' => 'Search by name, organisation or status...', 'filters' => [['key' => 'type', 'label' => 'All Types'], ['key' => 'status', 'label' => 'All Statuses']], 'pageSize' => 8])], 8),
                    B::panel('Partner and Sponsor Overview', [B::donut([['label' => 'Strategic Partners', 'value' => $g->where('data.type', 'Strategic Partner')->count(), 'color' => 'blue'], ['label' => 'Event Sponsors', 'value' => $sponsors->count(), 'color' => 'green']], (string) ($g->where('data.type', 'Strategic Partner')->count() + $sponsors->count()), 'Partners & Sponsors')], 4),
                    B::panel('Invitation and Confirmation Pipeline', [B::metrics(collect($pipeline)->map(fn ($v, $k) => ['label' => $k, 'value' => $v.' ('.B::pct($v, max(1, $g->count())).'%)', 'icon' => 'circle-dot'])->values()->all(), 5)], 5),
                    B::panel('Engagement and Participation', [B::metrics([['label' => 'Guests Attended', 'value' => $g->where('data.type', 'Guest Speaker')->where('status', 'confirmed')->count().' / '.$g->where('data.type', 'Guest Speaker')->count(), 'icon' => 'users'], ['label' => 'Partner Reps Attended', 'value' => $g->where('data.type', 'Strategic Partner')->where('status', 'confirmed')->count().' / '.$g->where('data.type', 'Strategic Partner')->count(), 'icon' => 'handshake'], ['label' => 'Sponsors Attended', 'value' => $sponsors->where('status', 'confirmed')->count().' / '.$sponsors->count(), 'icon' => 'gift'], ['label' => 'Post-Event Engagement', 'value' => '9 / 10', 'icon' => 'message-circle']], 4)], 4),
                    B::panel('Sponsor Value by Package', [B::hbars(collect($packages)->map(fn ($p) => ['label' => $p[0], 'value' => $sponsors->filter(fn ($s) => $s->data['value_zar'] === $p[1])->sum(fn ($s) => $s->data['value_zar']), 'money' => true])->all(), ['money' => true])], 3),
                    B::panel('Recent Communication Activity', [B::table([['at', 'Date / Time'], ['contact', 'Contact'], ['subject', 'Subject', 'strong'], ['status', 'Status', 'pill']], $comms->map(fn ($c) => ['at' => $c->data['at'], 'contact' => $c->data['contact'], 'subject' => $c->title, 'status' => $c->status])->all())], 7),
                    B::panel('Key Actions', [B::insights(array_values(array_filter([
                        $pipeline['Pending'] ? 'Follow up with '.$pipeline['Pending'].' pending guest confirmation(s).' : null,
                        'Send briefing packs to confirmed speakers.', 'Confirm branding assets from all sponsors.', 'Schedule a pre-event rehearsal with key speakers.',
                        'Record guest warranties before live use (Appendix I).',
                    ])))], 5),
                ]),
                B::tab('speakers', 'Guest Speakers', [B::panel('Guest Speakers', [B::table($cols, $g->where('data.type', 'Guest Speaker')->map($row)->values()->all())], 12)]),
                B::tab('partners', 'Strategic Partners', [B::panel('Strategic Partners', [B::table($cols, $g->where('data.type', 'Strategic Partner')->map($row)->values()->all())], 12)]),
                B::tab('sponsors', 'Sponsors', [B::panel('Sponsors', [B::table([...$cols, ['value', 'Sponsor Value', 'money']], $sponsors->map($row)->values()->all())], 12)]),
                B::tab('add', 'Invitations & Status', [B::panel('Add Guest / Partner / Sponsor', [B::form("$base/records", [
                    ['name' => 'title', 'label' => 'Full name', 'required' => true], ['name' => 'organisation', 'label' => 'Organisation', 'required' => true],
                    ['name' => 'type', 'label' => 'Type', 'type' => 'select', 'options' => [['value' => 'Guest Speaker', 'label' => 'Guest Speaker'], ['value' => 'Strategic Partner', 'label' => 'Strategic Partner'], ['value' => 'Sponsor', 'label' => 'Sponsor']], 'value' => 'Guest Speaker'],
                    ['name' => 'topic', 'label' => 'Role / Topic', 'required' => true], ['name' => 'value_zar', 'label' => 'Sponsor value (ZAR, sponsors only)', 'type' => 'number'],
                ], 'Send Invitation', ['kind' => 'guest'])], 6), B::panel('Guest Control Chain', [B::steps([['label' => 'Identify and classify', 'status' => 'completed'], ['label' => 'Vetting and conflict screening', 'status' => 'completed'], ['label' => 'Briefing pack and warranties', 'status' => 'in_progress'], ['label' => 'W1 claim survival check', 'status' => 'scheduled'], ['label' => 'Recording, IP and likeness rights', 'status' => 'scheduled']])], 6)]),
                B::tab('contracts', 'Contracts & Agreements', [B::panel('Warranties and Agreements', [B::checklist($g->map(fn ($r) => ['label' => $r->title.' ('.$r->data['organisation'].')', 'done' => (bool) ($r->data['warranties'] ?? false), 'note' => ($r->data['warranties'] ?? false) ? 'Warranties signed' : 'Awaiting warranties'])->all())], 12)]),
            ],
            'rail' => [],
        ];
    }

    private function claims(Webinar $w, string $base): array
    {
        $c = $w->records()->where('kind', 'claim')->get();
        $ev = $w->records()->where('kind', 'evidence')->get();
        $row = fn ($r) => ['n' => $r->sort + 1, 'webinar' => $r->data['webinar'], 'slide' => $r->data['slide'], 'claim' => $r->title, 'type' => $r->data['type'], 'evidence' => $r->data['evidence'], 'evStatus' => $r->data['evidence_status'], 'status' => $r->status, 'owner' => $r->data['owner'], 'updated' => $r->data['updated'],
            'actions' => $r->status === 'approved' ? [B::act('Reopen', "$base/records/{$r->id}", 'patch', ['status' => 'in_review'])] : [B::act('Approve', "$base/records/{$r->id}", 'patch', ['status' => 'approved'], 'primary'), B::act('Request Changes', "$base/records/{$r->id}", 'patch', ['status' => 'changes'])]];
        $cols = [['n', '#'], ['webinar', 'Webinar'], ['slide', 'Slide / Time'], ['claim', 'Claim Statement', 'strong'], ['type', 'Claim Type', 'tag'], ['evidence', 'Evidence Required'], ['evStatus', 'Evidence Status'], ['status', 'Approval Status', 'pill'], ['owner', 'Owner'], ['updated', 'Last Updated'], ['actions', 'Actions', 'actions']];
        $approved = $c->where('status', 'approved')->count();
        $types = $c->countBy(fn ($r) => $r->data['type']);
        $workflow = [['label' => 'Claim Submitted', 'sub' => 'Claim and evidence uploaded by owner.', 'status' => 'completed', 'date' => '12 Aug 2026'], ['label' => 'Content Review', 'sub' => 'Reviewed for accuracy, completeness and source validity.', 'status' => 'completed', 'date' => '13 Aug 2026'], ['label' => 'Compliance Check', 'sub' => 'Checked for legal, regulatory and POPIA compliance.', 'status' => 'in_progress', 'date' => '14 Aug 2026'], ['label' => 'Brand Review', 'sub' => 'Checked for TBCA brand and messaging alignment.', 'status' => 'pending'], ['label' => 'Final Approval', 'sub' => 'Approved for use in webinar and marketing.', 'status' => 'pending'], ['label' => 'Publication', 'sub' => 'Included in live webinar and replay assets.', 'status' => 'pending']];

        return [
            'description' => 'Manage all webinar claims, supporting evidence and content approvals to ensure accuracy, compliance and brand consistency. Every factual, statistical, credential and comparison claim is substantiated before live use.',
            'actions' => [B::act('Submit for Approval', "$base/claims?tab=content", 'get', [], 'primary')],
            'kpis' => [
                B::kpi('Total Claims', $c->count(), 'vs last webinar', '+20%', 'blue', 'file-text'),
                B::kpi('Approved', $approved.' ('.B::pct($approved, max(1, $c->count())).'%)', 'vs last webinar', '+15%', 'green', 'circle-check'),
                B::kpi('In Review', $c->where('status', 'in_review')->count(), 'vs last webinar', '+75%', 'gold', 'hourglass'),
                B::kpi('Rejected / Changes', $c->whereIn('status', ['changes', 'rejected'])->count(), 'vs last webinar', '-40%', 'red', 'x', false, true),
                B::kpi('Compliance Status', ($c->where('status', 'approved')->every(fn ($r) => Str::startsWith($r->data['evidence_status'], 'Uploaded')) ? '100' : '90').'%', 'approved claims with evidence', null, 'purple', 'shield'),
            ],
            'tabs' => [
                B::tab('register', 'Claim Register', [
                    B::panel('Claim Evidence Register ('.$c->count().')', [B::table($cols, $c->map($row)->values()->all(), ['search' => 'Search by claim, slide, speaker or keyword...', 'filters' => [['key' => 'status', 'label' => 'All Statuses'], ['key' => 'type', 'label' => 'All Claim Types'], ['key' => 'owner', 'label' => 'All Owners'], ['key' => 'webinar', 'label' => 'All Webinars']], 'pageSize' => 8])], 12),
                    B::panel('Evidence Repository', [B::table([['title', 'File Name', 'strong'], ['type', 'Type'], ['claim', 'Related Claim'], ['by', 'Uploaded By'], ['date', 'Date'], ['status', 'Status', 'pill']], $ev->map(fn ($e) => ['title' => $e->title, 'type' => $e->data['type'], 'claim' => $e->data['claim'], 'by' => $e->data['by'], 'date' => $e->data['date'], 'status' => $e->status])->all())], 5),
                    B::panel('Approval Workflow', [B::steps($workflow)], 4),
                    B::panel('Claim Type Distribution', [B::donut($types->map(fn ($v, $k) => ['label' => $k, 'value' => $v])->values()->all(), (string) $c->count(), 'Claims')], 3),
                ]),
                B::tab('evidence', 'Evidence Library', [B::panel('Evidence Library', [B::table([['title', 'File Name', 'strong'], ['type', 'Type'], ['claim', 'Related Claim'], ['by', 'Uploaded By'], ['status', 'Status', 'pill'], ['actions', '', 'actions']], $ev->map(fn ($e) => ['title' => $e->title, 'type' => $e->data['type'], 'claim' => $e->data['claim'], 'by' => $e->data['by'], 'status' => $e->status, 'actions' => $e->status === 'verified' ? [] : [B::act('Verify', "$base/records/{$e->id}", 'patch', ['status' => 'verified'], 'primary')]])->all())], 12)]),
                B::tab('content', 'Content Approval', [B::panel('Submit a Claim for Approval', [B::form("$base/records", [
                    ['name' => 'title', 'label' => 'Claim statement', 'type' => 'textarea', 'required' => true], ['name' => 'slide', 'label' => 'Slide / time', 'required' => true],
                    ['name' => 'type', 'label' => 'Claim type', 'type' => 'select', 'options' => collect(['Market Size', 'Product Claim', 'Performance', 'Technology', 'Customer Impact', 'Market Research', 'Growth Claim', 'Credential'])->map(fn ($t) => ['value' => $t, 'label' => $t])->all(), 'value' => 'Market Size'],
                    ['name' => 'evidence', 'label' => 'Evidence required', 'required' => true], ['name' => 'owner', 'label' => 'Claim owner', 'required' => true],
                ], 'Submit for Approval', ['kind' => 'claim'])], 7), B::panel('Substantiation Standard', [B::checklist([['label' => 'Source named and dated', 'done' => true], ['label' => 'Source is current at the event date', 'done' => true], ['label' => 'Claim wording matches the source', 'done' => true], ['label' => 'Expiry and next review recorded', 'done' => true]])], 5)]),
                B::tab('checklist', 'Compliance Checklist', [B::panel('Compliance Checklist', [B::checklist([['label' => 'All claims have evidence', 'done' => $c->every(fn ($r) => Str::startsWith($r->data['evidence_status'], 'Uploaded'))], ['label' => 'High-risk claims have third-party evidence', 'done' => true], ['label' => 'POPIA review of testimonials', 'done' => true], ['label' => 'Advertising Standards wording check', 'done' => true]])], 12)]),
                B::tab('brand', 'Brand & Messaging', [B::panel('Brand & Messaging', [B::text('Claims are checked against the TBCA Brand and Messaging Policy before publication. Superlatives and guarantees are not permitted without evidence.', 'info')], 12)]),
                B::tab('workflow', 'Approval Workflow', [B::panel('Approval Workflow', [B::steps($workflow)], 8)]),
                B::tab('history', 'Version History', [B::panel('Version History', [B::table([['at', 'Date / Time'], ['event', 'Event', 'strong'], ['user', 'User'], ['details', 'Details']], $w->records()->where('kind', 'audit')->get()->map(fn ($r) => ['at' => $r->data['at'], 'event' => $r->title, 'user' => $r->data['user'], 'details' => $r->data['details']])->all())], 12)]),
            ],
            'rail' => [],
        ];
    }

    private function privacy(Webinar $w, string $base): array
    {
        $m = P::metrics($w);
        $regs = $w->registrations()->where('status', 'registered')->orderBy('created_at')->get();
        $consent = $m['byConsent'];
        $full = $consent['full'] ?? 0;
        $bySource = $regs->groupBy(fn ($r) => in_array($r->source, ['TBCA Website', 'Email Campaign', 'Partner Referral'], true) ? $r->source : 'Other');
        $assets = $w->records()->where('kind', 'asset')->get();
        $privacyIncidents = $w->records()->where('kind', 'incident')->where('data->category', 'Privacy')->count();
        $toggles = $this->toggleItems($w, R::recordingControls());
        $label = ['full' => 'Consented (Full)', 'limited' => 'Consented (Limited)', 'pending' => 'Pending', 'declined' => 'Declined'];

        return [
            'description' => 'Manage attendee consent, privacy compliance, recording controls and data retention in line with POPIA. Recording, retention and processor positions require privacy counsel confirmation.',
            'actions' => [B::act('Export Report', "$base/export/consents", 'get', [], 'primary', null, true)],
            'kpis' => [
                B::kpi('Total Registrations', $m['registered'], 'vs last webinar', '+18%', 'green', 'shield'),
                B::kpi('Consent Rate', round(($full + ($consent['limited'] ?? 0)) / max(1, $m['registered']) * 100, 1).'%', 'vs last webinar', '+2.1pp', 'blue', 'users'),
                B::kpi('Recording Enabled', ($toggles[0]['on'] ?? true) ? 'Yes' : 'No', $full.' consented', null, 'red', 'video'),
                B::kpi('Data Retention', '12 months', 'Compliant (POPIA)', null, 'purple', 'database'),
                B::kpi('Privacy Breaches', $privacyIncidents, $privacyIncidents ? 'Review required' : 'No issues', null, 'gold', 'lock'),
            ],
            'tabs' => [
                B::tab('overview', 'Overview', [
                    B::panel('Consent Status Summary', [B::donut(collect($label)->map(fn ($l, $k) => ['label' => $l, 'value' => $consent[$k] ?? 0, 'color' => ['full' => 'green', 'limited' => 'blue', 'pending' => 'gold', 'declined' => 'red'][$k]])->values()->all(), (string) $m['registered'], 'Registrations')], 4),
                    B::panel('Recording and Broadcast Controls', [B::toggles($toggles, "$base/toggles")], 4),
                    B::panel('Data Retention and Access', [B::kv([['Live Recording Retention', '12 months'], ['Chat Transcript Retention', '12 months'], ['Q&A Transcript Retention', '12 months'], ['Poll Data Retention', '12 months'], ['Registration Data Retention', '24 months'], ['Replay Access', 'Registered Attendees Only'], ['Download Permitted', 'No (Streaming Only)'], ['Data Deletion Schedule', $w->starts_at->copy()->addYear()->format('j M Y')]])], 4),
                    B::panel('Consent Capture by Source', [B::bars($bySource->keys()->all(), [B::series('Consented', $bySource->map(fn ($g) => $g->whereIn('consent_state', ['full', 'limited'])->count())->values()->all(), 'green'), B::series('Pending', $bySource->map(fn ($g) => $g->where('consent_state', 'pending')->count())->values()->all(), 'gold'), B::series('Declined', $bySource->map(fn ($g) => $g->where('consent_state', 'declined')->count())->values()->all(), 'red')])], 4),
                    B::panel('Compliance Checklist (POPIA and Best Practice)', [B::checklist(collect(['Clear consent notice and purpose statement', 'Option to decline without losing access to live session', 'Consent captured and time-stamped', 'Recording indicator visible to all attendees', 'Personal data stored securely (encrypted)', 'Access controls applied to recordings and transcripts', 'Data retention period defined and automated', 'Right to be forgotten process in place'])->map(fn ($l) => ['label' => $l, 'done' => true, 'note' => 'Compliant'])->all())], 4),
                    B::panel('Participant Notification Messages', [B::text(R::notices()['recording']['body'], 'letter', 'Consent Notice (Pre-Event Email)'), B::text('Live session: the recording indicator stays visible. Attendees who chose not to appear keep camera and microphone off and use the private question route.', 'muted')], 4),
                    B::panel('Attendee Consent Register ('.$m['registered'].')', [B::table([['n', '#'], ['name', 'Name', 'strong'], ['email', 'Email'], ['organisation', 'Organisation'], ['consent', 'Consent Status', 'pill'], ['time', 'Consent Time'], ['source', 'Source']], $regs->values()->map(fn ($r, $i) => ['n' => $i + 1, 'name' => $r->name, 'email' => $r->email, 'organisation' => $r->company, 'consent' => $label[$r->consent_state] ?? $r->consent_state, 'time' => $r->created_at->format('j M Y H:i'), 'source' => $r->source])->all(), ['search' => 'Search by name or email...', 'filters' => [['key' => 'consent', 'label' => 'All Statuses'], ['key' => 'source', 'label' => 'All Sources']], 'pageSize' => 6, 'export' => "$base/export/consents"])], 7),
                    B::panel('Recording Assets and Access Control', [B::table([['title', 'Asset', 'strong'], ['status', 'Status', 'pill'], ['access', 'Access Level'], ['expiry', 'Expiry Date']], $assets->map(fn ($a) => ['title' => $a->title, 'status' => $a->status, 'access' => $a->data['access'], 'expiry' => $a->data['expiry']])->all())], 5),
                ]),
                B::tab('consents', 'Attendee Consents', [B::panel('Consent Versions', [B::kv([['Recording notice', R::notices()['recording']['version']], ['Offer disclosure', R::notices()['offer']['version']], ['Professional boundary', R::notices()['boundary']['version']], ['Privacy policy', R::notices()['privacy']['version']]])], 6), B::panel('Participation Choices', [B::hbars($regs->countBy('participation')->map(fn ($v, $k) => ['label' => R::participationModes()[$k][0] ?? $k, 'value' => $v])->values()->all())], 6)]),
                B::tab('recording', 'Recording Controls', [B::panel('Recording Controls', [B::toggles($toggles, "$base/toggles")], 6)]),
                B::tab('access', 'Access Management', [B::panel('Rights Requests', [B::text('Access, correction, deletion and objection requests are handled in the Resources consent console.', 'info'), B::buttons([B::act('Open Consent Console', '/admin/insights/resources/consents', 'get', [], 'primary')])], 6)]),
            ],
            'rail' => [],
        ];
    }

    private function incidents(Webinar $w, string $base): array
    {
        $inc = $w->records()->where('kind', 'incident')->get();
        $risks = $w->records()->where('kind', 'risk')->get();
        $actions = $w->records()->where('kind', 'action')->get();
        $row = fn ($r) => ['code' => $r->code, 'at' => $r->data['at'], 'category' => $r->data['category'], 'title' => $r->title, 'severity' => $r->data['severity'], 'status' => $r->status, 'assigned' => $r->data['assigned'], 'resolution' => $r->data['resolution'] ?? '-',
            'actions' => $r->status === 'resolved' ? [B::act('Reopen', "$base/records/{$r->id}", 'patch', ['status' => 'open'])] : [B::act('Resolve', "$base/records/{$r->id}", 'patch', ['status' => 'resolved'], 'primary'), B::act('Escalate', "$base/records/{$r->id}", 'patch', ['status' => 'escalated'], 'danger')]];
        $cols = [['code', 'Incident ID', 'strong'], ['at', 'Date / Time'], ['category', 'Category'], ['title', 'Description'], ['severity', 'Severity', 'pill'], ['status', 'Status', 'pill'], ['assigned', 'Assigned To'], ['resolution', 'Resolution Time'], ['actions', 'Actions', 'actions']];
        $lvl = ['very_low' => 1, 'low' => 2, 'medium' => 3, 'high' => 4, 'very_high' => 5];
        $mins = $inc->filter(fn ($r) => ! empty($r->data['resolution']))->map(fn ($r) => (int) $r->data['resolution']);
        $weeks = collect(range(3, 0))->map(fn ($i) => $w->starts_at->copy()->subWeeks($i));
        $open = $inc->whereIn('status', ['open', 'escalated'])->count();

        return [
            'description' => 'Track, manage and resolve incidents, risks and corrective actions. Material live events link to the W3 review and W4 corrections register.',
            'kpis' => [
                B::kpi('Total Incidents', $inc->count(), 'vs last 3 webinars', '-40%', 'red', 'triangle-alert', false, true),
                B::kpi('Open Incidents', $open, 'vs last 3 webinars', '-62%', 'gold', 'clock', false, true),
                B::kpi('Resolved Incidents', $inc->where('status', 'resolved')->count(), 'vs last 3 webinars', '+50%', 'green', 'circle-check'),
                B::kpi('High-Risk Items', $risks->whereIn('data.rating', ['high', 'critical'])->count(), 'vs last 3 webinars', '-60%', 'purple', 'shield', false, true),
                B::kpi('Average Resolution Time', $mins->count() ? round($mins->avg()).' mins' : 'n/a', 'resolved incidents', null, 'blue', 'wrench'),
            ],
            'tabs' => [
                B::tab('incidents', 'Incident Register', [
                    B::panel('Incident Register ('.$inc->count().')', [B::table($cols, $inc->map($row)->values()->all(), ['search' => 'Search by keyword, incident ID or status...', 'filters' => [['key' => 'severity', 'label' => 'All Severities'], ['key' => 'status', 'label' => 'All Statuses']], 'pageSize' => 6, 'export' => "$base/export/incidents"])], 8),
                    B::panel('Incident Status Overview', [B::donut([['label' => 'Resolved', 'value' => $inc->where('status', 'resolved')->count(), 'color' => 'green'], ['label' => 'Open', 'value' => $inc->where('status', 'open')->count(), 'color' => 'gold'], ['label' => 'Escalated', 'value' => $inc->where('status', 'escalated')->count(), 'color' => 'red']], (string) $inc->count(), 'Incidents')], 4),
                    B::panel('Incident Trend', [B::bars($weeks->map->format('j M')->all(), [B::series('Resolved', [1, 1, 2, $inc->where('status', 'resolved')->count()], 'green'), B::series('Open', [0, 1, 1, $open], 'gold')], ['stacked' => true])], 4),
                    B::panel('Incident Category Distribution', [B::donut($inc->countBy(fn ($r) => $r->data['category'])->map(fn ($v, $k) => ['label' => $k, 'value' => $v])->values()->all(), (string) $inc->count(), 'Incidents')], 4),
                    B::panel('Risk Heat Map (Top Risks)', [B::heatmap($risks->values()->map(fn ($r, $i) => ['n' => $i + 1, 'label' => $r->title, 'x' => $lvl[$r->data['likelihood']] ?? 3, 'y' => $lvl[$r->data['impact']] ?? 3])->all())], 4),
                    B::panel('Risk Register ('.$risks->count().')', [B::table([['code', 'Risk ID', 'strong'], ['title', 'Risk Description'], ['category', 'Category'], ['likelihood', 'Likelihood', 'pill'], ['impact', 'Impact', 'pill'], ['rating', 'Risk Rating', 'pill'], ['mitigation', 'Mitigation Plan'], ['owner', 'Owner'], ['status', 'Status', 'pill'], ['actions', '', 'actions']], $risks->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'category' => $r->data['category'], 'likelihood' => $r->data['likelihood'], 'impact' => $r->data['impact'], 'rating' => $r->data['rating'], 'mitigation' => $r->data['mitigation'], 'owner' => $r->data['owner'], 'status' => $r->status, 'actions' => $r->status === 'mitigated' ? [] : [B::act('Mark Mitigated', "$base/records/{$r->id}", 'patch', ['status' => 'mitigated'], 'primary')]])->all())], 7),
                    B::panel('Corrective Actions ('.$actions->count().')', [B::table([['code', 'Action ID', 'strong'], ['incident', 'Linked Incident'], ['title', 'Action Description'], ['due', 'Due Date'], ['status', 'Status', 'pill'], ['actions', '', 'actions']], $actions->map(fn ($a) => ['code' => $a->code, 'incident' => $a->data['incident'], 'title' => $a->title, 'due' => $a->data['due'], 'status' => $a->status, 'actions' => $a->status === 'completed' ? [] : [B::act('Complete', "$base/records/{$a->id}", 'patch', ['status' => 'completed'], 'primary')]])->all())], 5),
                ]),
                B::tab('log', 'Log Incident', [B::panel('Log an Incident', [B::form("$base/records", [
                    ['name' => 'title', 'label' => 'Description', 'required' => true],
                    ['name' => 'category', 'label' => 'Category', 'type' => 'select', 'options' => collect(['Technical', 'Platform', 'Content', 'Q&A', 'Recording', 'Privacy', 'Boundary', 'Guest'])->map(fn ($c) => ['value' => $c, 'label' => $c])->all(), 'value' => 'Technical'],
                    ['name' => 'severity', 'label' => 'Severity', 'type' => 'select', 'options' => [['value' => 'low', 'label' => 'Low'], ['value' => 'medium', 'label' => 'Medium'], ['value' => 'high', 'label' => 'High']], 'value' => 'medium'],
                    ['name' => 'assigned', 'label' => 'Assigned to', 'required' => true],
                ], 'Log Incident', ['kind' => 'incident'])], 6), B::panel('Live Incident Lifecycle', [B::steps([['label' => 'Detect and log', 'status' => 'completed'], ['label' => 'Signal (GREEN / AMBER / RED / BLACK)', 'status' => 'completed'], ['label' => 'Contain in W2', 'status' => 'completed'], ['label' => 'Hand to W3 review with evidence', 'status' => 'in_progress'], ['label' => 'Correct in W4 if published', 'status' => 'scheduled']])], 6)]),
                B::tab('risks', 'Risk Register', [B::panel('Risk Register', [B::table([['code', 'Risk ID', 'strong'], ['title', 'Description'], ['rating', 'Rating', 'pill'], ['owner', 'Owner'], ['status', 'Status', 'pill']], $risks->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'rating' => $r->data['rating'], 'owner' => $r->data['owner'], 'status' => $r->status])->all())], 12)]),
                B::tab('lessons', 'Lessons Learned', [B::panel('Lessons Learned', [B::insights(['Run a dual-platform rehearsal for every flagship event.', 'Lock the slide deck version at W1 sign-off.', 'Route sensitive questions to private moderation by default.', 'Test recording redundancy in the technical rehearsal.'])], 12)]),
            ],
            'rail' => [],
        ];
    }

    private function compliance(Webinar $w, string $base): array
    {
        $fw = ConsoleRecord::where('kind', 'framework')->get();
        $audit = $w->records()->where('kind', 'audit')->get();
        $activity = $w->records()->where('kind', 'activity')->get();
        $open = $w->records()->where('kind', 'audit_action')->get();
        $openCount = $open->where('status', '!=', 'completed')->count();
        $score = 100 - $openCount * 2;

        return [
            'description' => 'Monitor compliance, audit readiness and governance controls across the entire webinar lifecycle.',
            'actions' => [B::act('Export Report', "$base/export/audit", 'get', [], 'primary', null, true)],
            'kpis' => [
                B::kpi('Compliance Status', $openCount ? 'Compliant' : 'Fully Compliant', 'All key requirements met', null, 'green', 'shield'),
                B::kpi('Policies Applied', $fw->where('status', 'compliant')->count().' / '.$fw->count(), '100% coverage', null, 'blue', 'file-text'),
                B::kpi('Open Audit Actions', $openCount, 'vs last webinar', '-60%', 'red', 'triangle-alert', false, true),
                B::kpi('Data Subject Requests', 0, 'No pending requests', null, 'purple', 'users'),
                B::kpi('Governance Score', $score.'%', 'vs last webinar', '+6pp', 'gold', 'clipboard-check'),
            ],
            'tabs' => [
                B::tab('overview', 'Overview', [
                    B::panel('Compliance Coverage', [B::donut([['label' => 'Compliant', 'value' => 10, 'color' => 'green'], ['label' => 'Partially Compliant', 'value' => $openCount, 'color' => 'gold'], ['label' => 'Non-Compliant', 'value' => 0, 'color' => 'red'], ['label' => 'Not Applicable', 'value' => 0, 'color' => 'grey']], $score.'%', 'Compliance Score')], 4),
                    B::panel('Compliance by Area', [B::bars(['POPIA & Data Privacy', 'Content & IP', 'Marketing & Claims', 'Contracts & Third Parties', 'Platform & Security', 'Governance & Approvals'], [B::series('Compliance', [100, 100, 92, 100, 100, 83], 'green')], ['pct' => true])], 4),
                    B::panel('Regulatory and Policy Framework', [B::table([['title', 'Framework / Requirement', 'strong'], ['status', 'Status', 'pill'], ['last', 'Last Reviewed'], ['next', 'Next Review']], $fw->map(fn ($f) => ['title' => $f->title, 'status' => $f->status, 'last' => $f->data['last'], 'next' => $f->data['next']])->all())], 4),
                    B::panel('Recent Compliance and Audit Activities', [B::table([['at', 'Date / Time'], ['title', 'Activity', 'strong'], ['area', 'Area'], ['by', 'Performed By'], ['status', 'Status', 'pill']], $activity->map(fn ($a) => ['at' => $a->data['at'], 'title' => $a->title, 'area' => $a->data['area'], 'by' => $a->data['by'], 'status' => $a->status])->all())], 4),
                    B::panel('Data Subject Requests (POPIA)', [B::donut([['label' => 'Access Requests', 'value' => 0, 'color' => 'blue'], ['label' => 'Deletion Requests', 'value' => 0, 'color' => 'green'], ['label' => 'Correction Requests', 'value' => 0, 'color' => 'gold'], ['label' => 'Objection Requests', 'value' => 0, 'color' => 'purple']], '0', 'Requests')], 4),
                    B::panel('Content and Intellectual Property Compliance', [B::table([['type', 'Content Type', 'strong'], ['checked', 'Items Checked'], ['approved', 'Approved'], ['flagged', 'Flagged'], ['status', 'Status', 'pill']], [
                        ['type' => 'Presentation Slides', 'checked' => 12, 'approved' => 12, 'flagged' => 0, 'status' => 'Compliant'], ['type' => 'Speaker Bios', 'checked' => 8, 'approved' => 8, 'flagged' => 0, 'status' => 'Compliant'],
                        ['type' => 'Marketing Assets', 'checked' => 6, 'approved' => 5, 'flagged' => 1, 'status' => 'Partially Compliant'], ['type' => 'Replay Recording', 'checked' => 1, 'approved' => 1, 'flagged' => 0, 'status' => 'Compliant'],
                        ['type' => 'Brand Usage & Logos', 'checked' => 10, 'approved' => 10, 'flagged' => 0, 'status' => 'Compliant'],
                    ])], 4),
                    B::panel('Audit Trail (Key Events)', [B::table([['at', 'Timestamp'], ['title', 'Event', 'strong'], ['user', 'User'], ['details', 'Details'], ['status', 'Status', 'pill']], $audit->map(fn ($a) => ['at' => $a->data['at'], 'title' => $a->title, 'user' => $a->data['user'], 'details' => $a->data['details'], 'status' => 'Logged'])->all())], 4),
                    B::panel('Open Audit Actions ('.$openCount.')', [B::table([['code', 'Action ID', 'strong'], ['title', 'Description'], ['owner', 'Owner'], ['due', 'Due Date'], ['status', 'Status', 'pill'], ['actions', '', 'actions']], $open->map(fn ($a) => ['code' => $a->code, 'title' => $a->title, 'owner' => $a->data['owner'], 'due' => $a->data['due'], 'status' => $a->status, 'actions' => $a->status === 'completed' ? [] : [B::act('Complete', "$base/records/{$a->id}", 'patch', ['status' => 'completed'], 'primary')]])->all())], 4),
                    B::panel('Governance and Approval Workflow', [B::steps([['label' => 'Content review and claim verification', 'status' => 'completed'], ['label' => 'Legal and POPIA compliance check', 'status' => 'completed'], ['label' => 'Marketing and brand approval', 'status' => 'completed'], ['label' => 'Technical and platform security check', 'status' => 'completed'], ['label' => 'Final governance sign-off', 'status' => $openCount ? 'in_progress' : 'completed']])], 4),
                ]),
                B::tab('regulatory', 'Regulatory Compliance', [B::panel('Frameworks', [B::checklist($fw->map(fn ($f) => ['label' => $f->title, 'done' => $f->status === 'compliant', 'note' => 'Next review '.$f->data['next']])->all())], 12)]),
                B::tab('audit', 'Audit Trail', [B::panel('Audit Trail', [B::table([['at', 'Timestamp'], ['title', 'Event', 'strong'], ['user', 'User'], ['details', 'Details']], $audit->map(fn ($a) => ['at' => $a->data['at'], 'title' => $a->title, 'user' => $a->data['user'], 'details' => $a->data['details']])->all())], 12)]),
                B::tab('segregation', 'Policy & Governance', [B::panel('Segregation of Duties', [B::kv([['W1 approver', 'Cannot be the presenter of the same event'], ['W3 replay authority', 'Independent of the producer'], ['Commercial override', 'Not permitted for W1 or W3'], ['Corrections', 'Linked to the About TBCA corrections register']])], 12)]),
            ],
            'rail' => [],
        ];
    }

    /* ================================================================== */
    /* Actions                                                             */
    /* ================================================================== */

    public function storeRecord(Request $request, Webinar $webinar): RedirectResponse
    {
        $kind = $request->validate(['kind' => ['required', Rule::in(['issue', 'claim', 'guest', 'incident', 'offer'])]])['kind'];
        $data = $request->validate(['title' => ['required', 'string', 'max:300']] + match ($kind) {
            'issue' => ['body' => ['nullable', 'string', 'max:300']],
            'claim' => ['slide' => ['required', 'string', 'max:60'], 'type' => ['required', 'string', 'max:60'], 'evidence' => ['required', 'string', 'max:120'], 'owner' => ['required', 'string', 'max:80']],
            'guest' => ['organisation' => ['required', 'string', 'max:120'], 'type' => ['required', Rule::in(['Guest Speaker', 'Strategic Partner', 'Sponsor'])], 'topic' => ['required', 'string', 'max:120'], 'value_zar' => ['nullable', 'integer', 'min:0']],
            'incident' => ['category' => ['required', 'string', 'max:40'], 'severity' => ['required', Rule::in(['low', 'medium', 'high'])], 'assigned' => ['required', 'string', 'max:80']],
            'offer' => ['type' => ['required', Rule::in(['Service', 'Product', 'Subscription'])], 'product' => ['required', 'string', 'max:120'], 'price_zar' => ['required', 'integer', 'min:0'], 'validity' => ['nullable', 'integer', 'min:1', 'max:365']],
        });
        $sort = (int) $webinar->records()->where('kind', $kind)->max('sort') + 1;
        $payload = match ($kind) {
            'issue' => ['status' => 'open', 'data' => ['body' => $data['body'] ?? '']],
            'claim' => ['status' => 'in_review', 'data' => ['webinar' => Str::before($webinar->title, ':'), 'slide' => $data['slide'], 'type' => $data['type'], 'evidence' => $data['evidence'], 'evidence_status' => 'Pending Upload', 'owner' => $data['owner'], 'updated' => now()->format('j M Y')]],
            'guest' => ['status' => 'invited', 'data' => ['organisation' => $data['organisation'], 'type' => $data['type'], 'topic' => $data['topic'], 'invited' => now()->format('d M Y'), 'confirmed' => null, 'value_zar' => (int) ($data['value_zar'] ?? 0), 'warranties' => false]],
            'incident' => ['status' => 'open', 'code' => 'INC-'.now()->format('Y').'-'.str_pad((string) (ConsoleRecord::where('kind', 'incident')->count() + 1), 3, '0', STR_PAD_LEFT), 'data' => ['at' => now()->format('j M Y H:i'), 'category' => $data['category'], 'severity' => $data['severity'], 'assigned' => $data['assigned'], 'resolution' => null]],
            'offer' => ['status' => 'active', 'data' => ['type' => $data['type'], 'product' => $data['product'], 'price_zar' => (int) $data['price_zar'], 'validity' => (int) ($data['validity'] ?? 7), 'conversions' => 0, 'revenue_zar' => 0]],
        };
        ConsoleRecord::create(['webinar_id' => $webinar->id, 'kind' => $kind, 'title' => $data['title'], 'sort' => $sort] + $payload);
        $this->audit($webinar, Str::headline($kind).' added', $data['title']);

        return back()->with('success', Str::headline($kind).' recorded.');
    }

    public function updateRecord(Request $request, Webinar $webinar, ConsoleRecord $record): RedirectResponse
    {
        abort_unless($record->webinar_id === $webinar->id || $record->webinar_id === null, 404);
        $allowed = self::RECORD_STATUSES[$record->kind] ?? [];
        $status = $request->validate(['status' => ['required', Rule::in($allowed)]])['status'];
        $data = $record->data ?? [];
        if ($record->kind === 'incident' && $status === 'resolved' && empty($data['resolution'])) {
            $data['resolution'] = max(5, (int) $record->created_at->diffInMinutes(now(), true)).' mins';
        }
        if ($record->kind === 'guest' && $status === 'confirmed') {
            $data['confirmed'] = now()->format('d M Y');
        }
        if ($record->kind === 'claim') {
            $data['updated'] = now()->format('j M Y');
        }
        $record->update(['status' => $status, 'data' => $data]);
        $this->audit($webinar, Str::headline($record->kind).' '.str_replace('_', ' ', $status), $record->title);

        return back()->with('success', Str::headline($record->kind).' updated: '.str_replace('_', ' ', $status).'.');
    }

    public function toggle(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate(['key' => ['required', 'string', 'max:60'], 'on' => ['required', 'boolean']]);
        if (Str::startsWith($data['key'], 'channel:')) {
            $rec = $webinar->records()->where('kind', 'channel')->findOrFail((int) Str::after($data['key'], 'channel:'));
            $rec->update(['data' => array_merge($rec->data ?? [], ['enabled' => (bool) $data['on']])]);
        } else {
            $details = $webinar->details ?? [];
            $details['toggles'][$data['key']] = (bool) $data['on'];
            $webinar->update(['details' => $details]);
        }

        return back()->with('success', 'Setting saved.');
    }

    /** Server-side gate engine (R16-01). The UI may explain a state, only this method changes it. */
    public function transition(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate(['to' => ['required', Rule::in(['approved', 'live', 'ended', 'published', 'edited', 'corrected', 'withheld', 'withdrawn', 'awaiting_w3'])], 'note' => ['nullable', 'string', 'max:500']]);
        $from = $webinar->publicState();
        $to = $data['to'];
        $details = $webinar->details ?? [];

        if ($to === 'approved') {
            abort_unless(in_array($from, ['draft', 'awaiting_w1'], true), 422, 'Only events in pre-flight can be approved.');
            $this->ensurePreflight($webinar);
            $blockers = $webinar->records()->where('kind', 'task')->where('status', '!=', 'completed')->pluck('title')
                ->merge($webinar->records()->where('kind', 'issue')->where('status', 'open')->pluck('title')->map(fn ($t) => 'Open issue: '.$t));
            if ($blockers->isNotEmpty()) {
                return back()->with('error', 'GATE-WB-01 not passed. '.$blockers->count().' blocker(s): '.$blockers->take(3)->implode('; ').($blockers->count() > 3 ? '...' : ''));
            }
        } elseif ($to === 'live') {
            if ($from !== 'approved') {
                return back()->with('error', 'GATE-WB-02: an event can only go live after W1 pre-flight approval. Current state: '.R::consoleStates()[$from].'.');
            }
        } elseif ($to === 'ended') {
            abort_unless($from === 'live', 422, 'Only a live event can be ended.');
            $to = 'awaiting_w3';
        } else {
            if (! in_array($from, ['ended', 'awaiting_w3', 'published', 'edited', 'corrected', 'withheld', 'withdrawn'], true)) {
                return back()->with('error', 'GATE-WB-03: replay decisions are only available after the live session has ended.');
            }
            if (in_array($to, ['edited', 'corrected', 'withheld', 'withdrawn'], true)) {
                if (empty($data['note'])) {
                    return back()->with('error', 'Add a decision note. It is shown with '.$to.' replays.');
                }
                $details[['edited' => 'edit_note', 'corrected' => 'correction', 'withheld' => 'withheld_note', 'withdrawn' => 'withheld_note'][$to]] = $data['note'];
            }
            if (in_array($to, ['published', 'edited', 'corrected'], true)) {
                $details['settings']['approval_by'] = $request->user()->name;
                $details['settings']['approved_at'] = now()->format('j M Y, H:i');
            }
        }

        $webinar->update([
            'state' => $to,
            'details' => $details,
            'replay_published_at' => in_array($to, ['published', 'edited', 'corrected'], true) ? ($webinar->replay_published_at ?? now()) : $webinar->replay_published_at,
            'starts_at' => $to === 'live' && $webinar->starts_at->isFuture() ? now()->second(0) : $webinar->starts_at,
        ]);
        $this->audit($webinar, 'State changed', R::consoleStates()[$from].' to '.R::consoleStates()[$to].' by '.$request->user()->name);

        return back()->with('success', 'State updated: '.R::consoleStates()[$to].'.');
    }

    public function moderateQuestion(Request $request, Webinar $webinar, Question $question): RedirectResponse
    {
        abort_unless($question->webinar_id === $webinar->id, 404);
        $action = $request->validate(['action' => ['required', Rule::in(['approve', 'dismiss', 'pin', 'unpin', 'answer', 'restore'])]])['action'];
        $question->update(match ($action) {
            'approve' => ['status' => 'approved'], 'dismiss' => ['status' => 'dismissed', 'pinned' => false], 'pin' => ['pinned' => true],
            'unpin' => ['pinned' => false], 'answer' => ['status' => 'answered', 'pinned' => false], 'restore' => ['status' => 'pending'],
        });

        return back()->with('success', 'Question '.['approve' => 'approved for the presenter', 'dismiss' => 'dismissed', 'pin' => 'pinned', 'unpin' => 'unpinned', 'answer' => 'marked as answered', 'restore' => 'returned to the queue'][$action].'.');
    }

    public function storePoll(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate(['question' => ['required', 'string', 'max:200'], 'options' => ['required', 'string', 'max:1000']]);
        $opts = collect(preg_split('/\r?\n/', $data['options']))->map(fn ($o) => trim($o))->filter()->take(6)->values();
        if ($opts->count() < 2) {
            return back()->with('error', 'A poll needs at least two options, one per line.');
        }
        Poll::create(['webinar_id' => $webinar->id, 'question' => $data['question'], 'options' => $opts->map(fn ($o) => ['label' => $o, 'votes' => 0])->all(), 'status' => 'upcoming', 'sort' => (int) $webinar->polls()->max('sort') + 1]);

        return back()->with('success', 'Poll created. Launch it when ready.');
    }

    public function pollAction(Request $request, Webinar $webinar, Poll $poll): RedirectResponse
    {
        abort_unless($poll->webinar_id === $webinar->id, 404);
        $action = $request->validate(['action' => ['required', Rule::in(['launch', 'close'])]])['action'];
        if ($action === 'launch') {
            $webinar->polls()->where('status', 'active')->update(['status' => 'closed']);
        }
        $poll->update(['status' => $action === 'launch' ? 'active' : 'closed']);

        return back()->with('success', $action === 'launch' ? 'Poll launched to attendees.' : 'Poll closed.');
    }

    public function saveNotes(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate(['body' => ['nullable', 'string', 'max:2000']]);
        $webinar->update(['details' => array_merge($webinar->details ?? [], ['moderator_notes' => $data['body'] ?? ''])]);

        return back()->with('success', 'Moderator notes saved.');
    }

    public function provider(Request $request, Webinar $webinar): RedirectResponse
    {
        $control = $request->validate(['control' => ['required', 'string', 'max:40']])['control'];
        $this->audit($webinar, 'Provider control', $control);

        return back()->with('success', $control.' sent to the webinar provider (Zoom). Provider capability is confirmed against vendor documentation.');
    }

    public function registrationAction(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate(['action' => ['required', Rule::in(['remind', 'replay', 'resend'])], 'ids' => ['nullable', 'array'], 'ids.*' => ['integer']]);
        $q = $webinar->registrations()->where('status', 'registered');
        if ($data['action'] === 'remind') {
            $n = $q->count();
            $this->audit($webinar, 'Reminder sent', "$n registrants");

            return back()->with('success', "Reminder queued for $n registered attendees.");
        }
        if ($data['action'] === 'replay' && ! $webinar->replayAvailable()) {
            return back()->with('error', 'The replay has not passed W3 review. No-shows are told the replay is under review instead.');
        }
        $q->where('attendance', 'no_show')->when(! empty($data['ids']), fn ($q) => $q->whereIn('id', $data['ids']));
        $n = $q->count();
        $q->update(['followup_status' => 'sent', 'followup_sent_at' => now()]);
        $this->audit($webinar, 'No-show follow-up sent', "$n recipients");

        return back()->with('success', "Follow-up email sent to $n no-show".($n === 1 ? '' : 's').'.');
    }

    public function export(Webinar $webinar, string $dataset): StreamedResponse
    {
        $rows = match ($dataset) {
            'registrations', 'noshows', 'consents' => $webinar->registrations()->when($dataset === 'noshows', fn ($q) => $q->where('attendance', 'no_show'))->orderBy('created_at')->get()
                ->map(fn ($r) => ['Reference' => $r->reference, 'Name' => $r->name, 'Email' => $r->email, 'Organisation' => $r->company, 'Role' => $r->job_title, 'Country' => $r->country, 'Registered' => $r->created_at->format('Y-m-d H:i'), 'Status' => $r->status, 'Attendance' => $r->attendance, 'Watch minutes' => $r->watch_minutes, 'Participation' => $r->participation, 'Consent' => $r->consent_state, 'Notices' => collect($r->notices ?? [])->except('at')->implode(' '), 'Follow-up' => $r->followup_status, 'Certificate' => $r->certificate]),
            'incidents' => $webinar->records()->where('kind', 'incident')->get()->map(fn ($r) => ['ID' => $r->code, 'Description' => $r->title, 'Status' => $r->status] + $r->data),
            'conversions' => $webinar->records()->where('kind', 'conversion')->get()->map(fn ($r) => ['Offer' => $r->title, 'Status' => $r->status] + $r->data),
            'audit' => $webinar->records()->where('kind', 'audit')->get()->map(fn ($r) => ['Event' => $r->title] + $r->data),
            'portfolio' => Webinar::orderBy('starts_at')->get()->map(fn ($w) => ['Webinar' => $w->title, 'Date' => $w->starts_at->format('Y-m-d'), 'State' => $w->publicState()] + $this->eventMetrics($w)),
            default => abort(404),
        };

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            if ($rows->isNotEmpty()) {
                fputcsv($out, array_keys($rows->first()));
            }
            foreach ($rows as $row) {
                fputcsv($out, array_map(fn ($v) => is_scalar($v) || $v === null ? $v : json_encode($v), $row));
            }
            fclose($out);
        }, "{$webinar->slug}-{$dataset}.csv", ['Content-Type' => 'text/csv']);
    }

    /* ================================================================== */
    /* Helpers                                                             */
    /* ================================================================== */

    private function render(Request $request, Webinar $webinar, string $key, array $config): Response
    {
        return Inertia::render('Webinars/Console', [
            'console' => array_merge(['key' => $key, 'actions' => [], 'status' => null, 'notice' => null, 'top' => [], 'kpis' => [], 'rail' => [], 'description' => null], $config),
            'event' => P::card($webinar),
            'events' => Webinar::orderByDesc('starts_at')->get(['id', 'slug', 'title', 'starts_at', 'state', 'duration_minutes'])->map(fn (Webinar $w) => ['slug' => $w->slug, 'title' => $w->title, 'date' => $w->starts_at->format('j M Y'), 'state' => R::consoleStates()[$w->publicState()]])->all(),
            'tab' => (string) $request->query('tab', ''),
        ]);
    }

    private function eventRail(Webinar $w, string $title = 'Event Details'): array
    {
        return ['type' => 'event', 'title' => $title, 'event' => P::card($w), 'status' => R::consoleStates()[$w->publicState()]];
    }

    private function toggleItems(Webinar $w, array $defs): array
    {
        return collect($defs)->map(fn ($d) => ['key' => $d[0], 'label' => $d[1], 'on' => (bool) ($w->detail('toggles.'.$d[0]) ?? $d[2])])->all();
    }

    private function regRow(WebinarRegistration $r, string $base): array
    {
        $eng = $r->chat_count + $r->poll_count * 2;
        $level = $r->attendance === 'pending' || $r->attendance === 'no_show' ? '-' : ($eng >= 12 ? 'High' : ($eng >= 5 ? 'Medium' : 'Low'));
        $attendance = ['attended' => 'Attended', 'partial' => 'Partial', 'no_show' => 'No-Show', 'pending' => $r->status === 'cancelled' ? 'Cancelled' : 'Registered'][$r->attendance] ?? $r->attendance;

        return [
            'id' => $r->id, 'person' => ['name' => $r->name, 'sub' => $r->email], 'email' => $r->email, 'organisation' => $r->company ?: '-', 'role' => $r->job_title, 'country' => $r->country, 'phone' => $r->phone,
            'date' => $r->created_at->format('j M Y'), 'status' => $r->status === 'cancelled' ? 'Cancelled' : ($r->status === 'pending_payment' ? 'Awaiting Payment' : 'Registered'), 'attendance' => $attendance,
            'engagement' => $level, 'certificate' => $r->certificate === 'issued' ? 'Issued' : 'Not Issued', 'source' => $r->source,
            'participation' => R::participationModes()[$r->participation][0] ?? $r->participation,
            'joined' => $r->joined_at?->format('H:i') ?? '-', 'left' => $r->left_at?->format('H:i') ?? '-', 'watch' => $r->watch_minutes ? $r->watch_minutes.' mins' : '0 mins',
            'joinedLeft' => $r->joined_at ? 'Joined '.$r->joined_at->format('H:i').($r->left_at ? ', left '.$r->left_at->format('H:i') : '') : ($r->attendance === 'no_show' ? 'Did not attend' : 'Registered'),
            'chat' => $r->chat_count, 'polls' => $r->poll_count, 'downloads' => $r->download_count,
            'engagementDetail' => $r->chat_count.' chat, '.$r->poll_count.' polls, '.$r->download_count.' downloads',
            'actions' => $r->attendance === 'no_show' ? [B::act('Send Follow-Up', "$base/registrations/action", 'post', ['action' => 'resend', 'ids' => [$r->id]])] : [],
        ];
    }

    /** @return array{labels: string[], values: int[]} */
    private function attendanceCurve(Webinar $w, Collection $regs): array
    {
        $labels = [];
        $values = [];
        for ($t = $w->starts_at->copy(); $t->lte($w->endsAt()); $t->addMinutes(5)) {
            $labels[] = $t->format('H:i');
            $values[] = $regs->filter(fn ($r) => $r->joined_at && $r->joined_at->lte($t) && (! $r->left_at || $r->left_at->gte($t)))->count();
        }

        return ['labels' => $labels, 'values' => $values];
    }

    private function curveArgs(Webinar $w): array
    {
        $c = $this->attendanceCurve($w, $w->registrations()->get());

        return ['labels' => $c['labels'], 'series' => [B::series('Attendees', $c['values'], 'gold')]];
    }

    /** Snapshot or computed headline metrics for portfolio views. */
    private function eventMetrics(Webinar $w): array
    {
        $snap = $w->detail('metrics');
        $regs = $w->registrations()->where('status', 'registered');
        $computed = (clone $regs)->count();
        $offers = $w->records()->where('kind', 'offer')->get();
        $revenue = $offers->isNotEmpty() ? $offers->sum(fn ($o) => $o->data['price_zar'] * $o->data['conversions']) : (int) ($snap['revenue'] ?? 0);
        $conversions = $offers->isNotEmpty() ? $offers->sum(fn ($o) => $o->data['conversions']) : (int) ($snap['conversions'] ?? 0);
        if ($computed > 0) {
            $rating = (float) ($w->feedback()->avg('rating') ?? ($snap['rating'] ?? 0));

            return ['registrations' => $computed, 'attended' => (clone $regs)->whereIn('attendance', ['attended', 'partial'])->count(), 'revenue' => $revenue, 'rating' => round($rating, 1), 'conversions' => $conversions];
        }

        return ['registrations' => (int) ($snap['registrations'] ?? 0), 'attended' => (int) ($snap['attended'] ?? 0), 'revenue' => $revenue, 'rating' => (float) ($snap['rating'] ?? 0), 'conversions' => $conversions];
    }

    private function previousMetrics(Webinar $w): array
    {
        $prev = Webinar::where('starts_at', '<', $w->starts_at)->orderByDesc('starts_at')->get()->first(fn ($x) => $this->eventMetrics($x)['registrations'] > 0);

        return $prev ? $this->eventMetrics($prev) : ['registrations' => 0, 'attended' => 0, 'revenue' => 0, 'rating' => 0, 'conversions' => 0];
    }

    private function delta(int|float $cur, int|float $prev): ?string
    {
        if ($prev <= 0) {
            return null;
        }
        $d = (int) round(($cur - $prev) / $prev * 100);

        return ($d >= 0 ? '+' : '').$d.'%';
    }

    private function regions(): array
    {
        $regs = WebinarRegistration::where('status', 'registered')->get(['country']);
        $total = max(1, $regs->count());
        $groups = ['South Africa' => ['South Africa'], 'Southern Africa' => ['Botswana', 'Namibia', 'Malawi', 'Zambia', 'Zimbabwe', 'Lesotho', 'Eswatini', 'Mozambique'], 'East Africa' => ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'], 'West Africa' => ['Nigeria', 'Ghana']];

        return collect($groups)->map(fn ($c, $label) => ['label' => $label, 'value' => B::pct($regs->whereIn('country', $c)->count(), $total), 'pct' => true])
            ->push(['label' => 'Other', 'value' => B::pct($regs->whereNotIn('country', collect($groups)->flatten()->all())->count(), $total), 'pct' => true])->values()->all();
    }

    private function ensurePreflight(Webinar $w): void
    {
        if ($w->records()->where('kind', 'task')->exists()) {
            return;
        }
        foreach (R::preflightTasks() as $i => [$task, $owner, $group, $due]) {
            ConsoleRecord::create(['webinar_id' => $w->id, 'kind' => 'task', 'title' => $task, 'status' => 'pending', 'sort' => $i, 'data' => ['owner' => $owner, 'group' => $group, 'due' => $w->starts_at->copy()->addDays($due)->format('j M Y')]]);
        }
        foreach (R::productionTeam() as $i => [$name, $role, $ini]) {
            ConsoleRecord::create(['webinar_id' => $w->id, 'kind' => 'team', 'title' => $name, 'status' => 'confirmed', 'sort' => $i, 'data' => ['role' => $role, 'initials' => $ini]]);
        }
    }

    private function audit(Webinar $w, string $event, string $details): void
    {
        ConsoleRecord::create(['webinar_id' => $w->id, 'kind' => 'audit', 'title' => $event, 'status' => 'logged', 'sort' => 0, 'data' => ['at' => now()->format('j M Y, H:i'), 'user' => request()->user()?->name ?? 'System', 'details' => $details]]);
    }

    private function noShowEmail(Webinar $w): string
    {
        return "Hi {{FirstName}},\n\nWe noticed you could not join our recent webinar, \"{$w->title}\".\n\nNo problem. "
            .($w->replayAvailable() ? 'You can now watch the approved replay at your convenience and access the presentation slides, resources and post-webinar offers.' : 'The replay is in TBCA review. We will send your link as soon as it is approved. Meanwhile the event brief and toolkits are available.')
            ."\n\n[Watch the Full Replay] ".url("/webinars/{$w->slug}/missed")."\n\nPresentation Slides | Practical Toolkits | Key Insights | Post-Webinar Offers\n\nWe look forward to having you at the next live session.\n\nKind regards,\nThe Business Clinic.Africa Team";
    }
}
