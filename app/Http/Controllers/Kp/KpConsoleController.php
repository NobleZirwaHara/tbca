<?php

namespace App\Http\Controllers\Kp;

use App\Http\Controllers\Controller;
use App\Models\Kp\KpAnswer;
use App\Models\Kp\KpRecord;
use App\Support\Content\KpThoughtLeadership as Kp;
use App\Support\Webinars\Board as B;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * KP Thought Leadership governance consoles KP-SCR-051 to KP-SCR-072 (blueprint 27.2).
 * Staff only (auth + admin). KP supplied no mockups for these screens, so each console
 * follows the blueprint specification: states, actions, audit, AI role, human override
 * and acceptance rule, rendered with the shared Board blocks.
 */
class KpConsoleController extends Controller
{
    /** Blueprint 27.2: [audit/exceptions, AI role, human override, acceptance]. */
    private const RULES = [
        'topics' => ['Taxonomy audit; conflict queue', 'Tag and risk suggestion', 'HO-3', 'No unclassified public topic'],
        'lifecycle' => ['Immutable transition; lock errors', 'Stale and quality flags', 'HO-3', 'No lock bypass'],
        'voice' => ['Before and after voice recorded', 'Suggest only', 'HO-3', 'Zero null voice'],
        'review' => ['Conflict and rationale mandatory', 'Builds review pack', 'HO-4 editorial only', 'Hard block cannot be overridden'],
        'ai-outputs' => ['Model, prompt and sources immutable', 'Primary object', 'HO-2', 'Citation and boundary pass'],
        'synthetic' => ['Consent and asset lineage', 'No autonomous approval', 'HO-0 if consent missing', 'No valid rights means no output'],
        'claims' => ['Exact wording versioned', 'Extract candidate claims', 'HO-2, no evidence bypass', 'Only APPROVED claims render'],
        'utm' => ['Historical defect retained', 'Detect missing tags', 'HO-1', 'No fabricated UTM'],
        'd023' => ['Metric version and export audit', 'Summarise only', 'HO-0 on values', 'Exact formulas'],
        'customer-value' => ['KPI lineage', 'Find weak-value assets', 'HO-0 on values', 'No vanity-only score'],
        'capacity' => ['Hours and source audit', 'Forecast only if labelled', 'HO-2', 'No overbooking'],
        'sessions' => ['Route and substitution audit', 'Prepare qualification', 'HO-2', 'Delivery mode explicit'],
        'contested' => ['Reclassification history', 'Risk suggestions', 'HO-4 editorial only', 'Band D cannot publish'],
        'duplicates' => ['Canonical history', 'Semantic detection', 'HO-2', 'One canonical truth'],
        'graph' => ['Graph version audit', 'Relationship suggestions', 'HO-2', 'Active nodes are sourced'],
        'freshness' => ['Replacement lineage', 'Stale detection', 'HO-2', 'Ineligible stale sources excluded'],
        'coverage' => ['Country activation history', 'Overgeneralisation flags', 'HO-2', 'Live country claims are locally sourced'],
        'translation' => ['Source and target version pair', 'Draft and QA assist', 'HO-2', 'High-risk text is not auto-published'],
        'safety' => ['Safeguarding audit', 'Youth safety flags', 'HO-0 hard safety', 'No commercial targeting of minors'],
        'agents' => ['Prompt, model and tool audit', 'Monitored object', 'HO-2 segregation', 'Kill switch is independent'],
        'corrections' => ['Full correction lineage', 'Impact scan', 'HO-2', 'CMS and retrieval cascade verified'],
        'experiments' => ['Hypothesis, metrics and ethics', 'Analysis support', 'HO-2', 'Cannot bypass privacy, safety or voice rules'],
    ];

    /** Status sets for operational records that are not console rows. */
    public const KIND_STATES = [
        'session_request' => ['Requested', 'Qualified', 'Waitlist', 'Booked', 'Routed', 'Closed'],
        'correction' => ['Reported', 'Under Review', 'Corrected', 'Updated', 'No Change', 'Withdrawn'],
        'fb_challenge' => ['Pending review', 'Approved', 'Restricted'],
        'educator_request' => ['Pending verification', 'Verified', 'Declined'],
        'guardian_query' => ['Open', 'Answered'],
        'project_brief' => ['Submitted', 'Scoping', 'Accepted', 'Declined'],
    ];

    private const TONES = ['green', 'blue', 'gold', 'orange', 'purple', 'red', 'grey', 'teal'];

    public function index(): Response
    {
        $records = KpRecord::where('kind', 'console')->get()->groupBy(fn ($r) => $r->data['console']);
        $screens = collect(Kp::screens());

        return Inertia::render('Kp/ConsoleIndex', [
            'screens' => $screens->map(fn ($s) => $s + ['built' => true])->values(),
            'stats' => [
                'total' => $screens->count(),
                'public' => $screens->where('surface', 'Public')->count(),
                'admin' => $screens->where('surface', 'Admin')->count(),
                'mockups' => $screens->whereNotNull('mockup')->count(),
            ],
            'consoles' => collect(Kp::consoles())->values()->map(fn ($c, $i) => ['key' => $c[0], 'title' => $c[1], 'id' => 'KP-SCR-'.str_pad((string) (51 + $i), 3, '0', STR_PAD_LEFT), 'records' => ($records[$c[0]] ?? collect())->count(), 'open' => ($records[$c[0]] ?? collect())->whereNotIn('status', ['Closed', 'Retired', 'Completed', 'Fixed', 'Live', 'Approved', 'Published', 'Clear'])->count()])->all(),
            'queues' => [
                ['label' => 'Session requests awaiting qualification', 'value' => KpRecord::where('kind', 'session_request')->where('status', 'Requested')->count(), 'href' => '/admin/kp/sessions'],
                ['label' => 'Correction reports to assess', 'value' => KpRecord::where('kind', 'correction')->where('status', 'Reported')->count(), 'href' => '/admin/kp/corrections?tab=public'],
                ['label' => 'Learner submissions to review', 'value' => KpRecord::where('kind', 'fb_challenge')->where('status', 'Pending review')->count(), 'href' => '/admin/kp/safety?tab=submissions'],
                ['label' => 'Educator requests to verify', 'value' => KpRecord::where('kind', 'educator_request')->where('status', 'Pending verification')->count(), 'href' => '/admin/kp/safety?tab=educators'],
                ['label' => 'AI answers reported by visitors', 'value' => KpAnswer::where('feedback', 'report')->count(), 'href' => '/admin/kp/ai-outputs?tab=answers'],
            ],
            'quarantined' => Kp::quarantined(),
            'consoleNav' => $this->nav(),
        ]);
    }

    public function show(Request $request, string $console): Response
    {
        $def = collect(Kp::consoles())->firstWhere(0, $console);
        abort_unless($def, 404);
        [$key, $title, $states, $actions] = $def;
        $idx = collect(Kp::consoles())->search(fn ($c) => $c[0] === $key);
        $id = 'KP-SCR-'.str_pad((string) (51 + $idx), 3, '0', STR_PAD_LEFT);
        $rows = KpRecord::where('kind', 'console')->where('data->console', $key)->orderBy('sort')->get();
        $rule = self::RULES[$key];

        $special = $this->specialTabs($key);
        $register = B::tab('register', 'Register', [B::panel($title.' Register', [$this->recordTable($rows, $states)], 12, B::act('Export CSV', "/admin/kp/$key/export", 'get', [], 'secondary', null, true), 'layers')], $rows->count());
        $tabs = $rows->isEmpty() && $special !== [] ? $special : array_merge([$register], $special);
        // Session Pipeline states are carried by the session request records themselves.
        $counted = $key === 'sessions' ? KpRecord::where('kind', 'session_request')->get() : $rows;
        $tabs[] = B::tab('states', 'State Summary', [
            B::panel('Records by State', [B::donut(collect($states)->values()->map(fn ($s, $i) => ['label' => $s, 'value' => $counted->where('status', $s)->count(), 'color' => self::TONES[$i % 8]])->all(), (string) $counted->count(), 'Records')], 6, null, 'activity'),
            B::panel('Allowed States', [B::steps(collect($states)->map(fn ($s) => ['label' => $s, 'sub' => $counted->where('status', $s)->count().' records', 'status' => $counted->where('status', $s)->isNotEmpty() ? 'in_progress' : 'pending'])->all())], 6, null, 'layers'),
        ]);
        // Session requests arrive from the public forms, so the pipeline has no manual add.
        if ($key !== 'sessions') {
            $tabs[] = B::tab('add', 'Add Record', [B::panel('Add a Record', [
                B::form("/admin/kp/$key/records", [
                    ['name' => 'title', 'label' => 'Title', 'required' => true],
                    ['name' => 'status', 'label' => 'State', 'type' => 'select', 'options' => array_map(fn ($s) => ['value' => $s, 'label' => $s], $states), 'value' => $states[0], 'required' => true],
                    ['name' => 'owner', 'label' => 'Owner', 'required' => true],
                    ['name' => 'note', 'label' => 'Note or rationale', 'type' => 'textarea'],
                ], 'Add Record'),
            ], 8, null, 'file-check')]);
        }

        return Inertia::render('Kp/Console', [
            'console' => [
                'key' => $key, 'id' => $id, 'title' => $title, 'actions' => $actions, 'states' => $states,
                'rule' => ['audit' => $rule[0], 'ai' => $rule[1], 'override' => $rule[2], 'acceptance' => $rule[3]],
                'kpis' => collect($states)->take(6)->values()->map(fn ($s, $i) => B::kpi($s, $counted->where('status', $s)->count(), 'records', null, self::TONES[$i % 8], 'layers'))->all(),
                'tabs' => $tabs,
            ],
            'tab' => (string) $request->query('tab', 'register'),
            'consoleNav' => $this->nav(),
        ]);
    }

    public function store(Request $request, string $console): RedirectResponse
    {
        $def = collect(Kp::consoles())->firstWhere(0, $console);
        abort_unless($def, 404);
        $data = $request->validate(['title' => ['required', 'string', 'max:200'], 'status' => ['required', Rule::in($def[2])], 'owner' => ['required', 'string', 'max:80'], 'note' => ['nullable', 'string', 'max:300']]);
        $prefix = Str::upper(Str::substr(str_replace('-', '', $console), 0, 3));
        $code = $prefix.'-'.str_pad((string) (KpRecord::where('kind', 'console')->where('data->console', $console)->count() + 101), 4, '0', STR_PAD_LEFT);
        KpRecord::create(['kind' => 'console', 'code' => $code, 'title' => $data['title'], 'status' => $data['status'], 'sort' => (int) KpRecord::max('sort') + 1, 'user_id' => $request->user()->id, 'data' => [
            'console' => $console, 'owner' => $data['owner'], 'note' => $data['note'] ?? '', 'updated' => now()->format('j M Y'),
            'history' => [['from' => null, 'to' => $data['status'], 'by' => $request->user()->name, 'at' => now()->format('j M Y H:i')]],
        ]]);

        return back()->with('success', "Record $code added.");
    }

    public function update(Request $request, KpRecord $record): RedirectResponse
    {
        $allowed = $record->kind === 'console'
            ? (collect(Kp::consoles())->firstWhere(0, $record->data['console'] ?? null)[2] ?? [])
            : (self::KIND_STATES[$record->kind] ?? []);
        abort_if($allowed === [], 404);
        $data = $request->validate([
            'status' => ['required', Rule::in($allowed)],
            'mode' => [Rule::requiredIf($record->kind === 'session_request' && in_array($request->input('status'), ['Booked', 'Routed'], true)), 'nullable', Rule::in(['K1', 'K2', 'K3', 'K4'])],
        ]);

        // Blueprint 27.2: a hard block from independent review cannot be overridden here.
        if ($record->kind === 'console' && $record->data['console'] === 'review' && $record->status === 'Blocked' && $data['status'] === 'Approved') {
            return back()->with('error', 'A hard block cannot be overridden. Return the item to the author instead.');
        }
        // Claim Evidence: only evidenced claims can be approved (blueprint 12.5).
        if ($record->kind === 'console' && $record->data['console'] === 'claims' && $data['status'] === 'Approved' && in_array($record->title, Kp::quarantined(), true)) {
            return back()->with('error', 'This claim has no evidence on file. Add evidence before approval.');
        }

        $d = $record->data ?? [];
        $d['history'][] = ['from' => $record->status, 'to' => $data['status'], 'by' => $request->user()->name, 'at' => now()->format('j M Y H:i')];
        $d['updated'] = now()->format('j M Y');
        if (! empty($data['mode'])) {
            $d['mode'] = $data['mode'];
        }
        $record->update(['status' => $data['status'], 'data' => $d]);

        return back()->with('success', $record->code.' moved to '.$data['status'].'.');
    }

    public function export(string $console): StreamedResponse
    {
        abort_unless(collect(Kp::consoles())->contains(fn ($c) => $c[0] === $console), 404);
        $rows = KpRecord::where('kind', 'console')->where('data->console', $console)->orderBy('sort')->get();

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Code', 'Title', 'State', 'Owner', 'Note', 'Updated']);
            foreach ($rows as $r) {
                fputcsv($out, [$r->code, $r->title, $r->status, $r->data['owner'] ?? '', $r->data['note'] ?? '', $r->data['updated'] ?? '']);
            }
            fclose($out);
        }, "kp-$console.csv", ['Content-Type' => 'text/csv']);
    }

    /* ------------------------------------------------------------------ */

    private function recordTable(Collection $rows, array $states): array
    {
        return B::table([['code', 'ID', 'strong'], ['title', 'Item'], ['status', 'State', 'pill'], ['owner', 'Owner'], ['note', 'Note'], ['updated', 'Updated'], ['actions', 'Move to', 'actions']],
            $rows->map(fn (KpRecord $r) => ['code' => $r->code, 'title' => $r->title, 'status' => $r->status, 'owner' => $r->data['owner'] ?? '', 'note' => $r->data['note'] ?? '', 'updated' => $r->data['updated'] ?? '', 'actions' => $this->moves($r, $states)])->all(),
            ['search' => 'Search records...', 'filters' => [['key' => 'status', 'label' => 'All states']], 'pageSize' => 15, 'empty' => 'No records yet.']);
    }

    /** Next-state buttons: the states adjacent to the current one, plus the last (terminal) state. */
    private function moves(KpRecord $r, array $states, array $extra = []): array
    {
        $i = array_search($r->status, $states, true);
        $targets = collect([$states[$i === false ? 0 : $i + 1] ?? null, $i ? $states[$i - 1] : null])->filter()->unique()->reject(fn ($s) => $s === $r->status)->take(2);

        return $targets->map(fn ($s) => B::act($s, '/admin/kp/records/'.$r->id, 'patch', ['status' => $s] + $extra, $s === end($states) ? 'secondary' : 'primary'))->values()->all();
    }

    /** Extra tabs that read live operational data. */
    private function specialTabs(string $key): array
    {
        $req = fn () => KpRecord::where('kind', 'session_request')->orderByDesc('id')->get();

        return match ($key) {
            'sessions' => [B::tab('pipeline', 'Request Pipeline', [
                B::panel('Session Requests', [B::table([['code', 'Reference', 'strong'], ['title', 'Offer'], ['person', 'Requester', 'person'], ['brief', 'Brief'], ['mode', 'Mode', 'tag'], ['status', 'State', 'pill'], ['actions', 'Actions', 'actions']],
                    $req()->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'person' => ['name' => $r->data['name'] ?? '', 'sub' => $r->data['organisation'] ?? ''], 'brief' => Str::limit($r->data['brief'] ?? '', 80), 'mode' => $r->data['mode'] ?? 'Not set', 'status' => $r->status,
                        'actions' => match ($r->status) {
                            'Requested' => [B::act('Qualify', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Qualified'], 'primary'), B::act('Waitlist', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Waitlist'])],
                            'Qualified', 'Waitlist' => [B::act('Book K1', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Booked', 'mode' => 'K1'], 'primary'), B::act('Route K3', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Routed', 'mode' => 'K3'])],
                            'Booked', 'Routed' => [B::act('Close', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Closed'])],
                            default => [],
                        }])->all(), ['search' => 'Search requests...', 'filters' => [['key' => 'status', 'label' => 'All states']], 'pageSize' => 15])], 12, null, 'calendar-check'),
                B::panel('Delivery Modes', [B::kv(array_map(fn ($m) => [$m[0].' '.$m[1], $m[2]], Kp::deliveryModes()))], 6, null, 'users'),
                B::panel('Rule', [B::text('A request is not a booking. A booking needs an explicit delivery mode (K1 to K4) and the fee confirmed with the client before payment.', 'tip', 'Delivery mode explicit')], 6),
            ], $req()->count())],
            'corrections' => [B::tab('public', 'Public Timeline and Reports', [B::panel('Corrections and Visitor Reports', [B::table([['code', 'ID', 'strong'], ['title', 'Content'], ['type', 'Type', 'tag'], ['note', 'Change or report'], ['date', 'Date'], ['status', 'State', 'pill'], ['actions', 'Move to', 'actions']],
                KpRecord::where('kind', 'correction')->orderByRaw("status = 'Reported' desc")->orderBy('sort')->get()->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'type' => $r->data['type'] ?? '', 'note' => Str::limit($r->data['note'] ?? '', 90), 'date' => $r->data['date'] ?? '', 'status' => $r->status, 'actions' => $this->moves($r, self::KIND_STATES['correction'])])->all(),
                ['search' => 'Search corrections...', 'filters' => [['key' => 'status', 'label' => 'All states']], 'pageSize' => 15])], 12, null, 'file-check')])],
            'safety' => [
                B::tab('submissions', 'Learner Submissions', [B::panel('Local Problem Challenge Submissions', [B::table([['code', 'ID', 'strong'], ['name', 'First name'], ['age', 'Age band'], ['problem', 'Problem'], ['status', 'State', 'pill'], ['actions', 'Review', 'actions']],
                    KpRecord::where('kind', 'fb_challenge')->orderByDesc('id')->get()->map(fn ($r) => ['code' => $r->code, 'name' => $r->data['first_name'] ?? '', 'age' => $r->data['age_band'] ?? '', 'problem' => Str::limit($r->data['problem'] ?? '', 90), 'status' => $r->status, 'actions' => [B::act('Approve', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Approved'], 'primary'), B::act('Restrict', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Restricted'], 'danger')]])->all(),
                    ['empty' => 'No learner submissions yet.'])], 12, null, 'shield-check')]),
                B::tab('educators', 'Educators and Guardians', [
                    B::panel('Educator Access Requests', [B::table([['code', 'ID', 'strong'], ['school', 'School'], ['name', 'Educator'], ['role', 'Role'], ['status', 'State', 'pill'], ['actions', 'Actions', 'actions']],
                        KpRecord::where('kind', 'educator_request')->orderByDesc('id')->get()->map(fn ($r) => ['code' => $r->code, 'school' => $r->title, 'name' => $r->data['name'] ?? '', 'role' => $r->data['role'] ?? '', 'status' => $r->status, 'actions' => [B::act('Verify', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Verified'], 'primary'), B::act('Decline', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Declined'])]])->all(), ['empty' => 'No educator requests yet.'])], 12, null, 'graduation-cap'),
                    B::panel('Guardian Questions', [B::table([['code', 'ID', 'strong'], ['title', 'Question'], ['email', 'Reply to'], ['status', 'State', 'pill'], ['actions', 'Actions', 'actions']],
                        KpRecord::where('kind', 'guardian_query')->orderByDesc('id')->get()->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'email' => $r->data['email'] ?? '', 'status' => $r->status, 'actions' => [B::act('Mark answered', '/admin/kp/records/'.$r->id, 'patch', ['status' => 'Answered'], 'primary')]])->all(), ['empty' => 'No guardian questions yet.'])], 12, null, 'users'),
                ]),
            ],
            'ai-outputs' => [B::tab('answers', 'Assistant Answers', [B::panel('KP Knowledge Assistant Answers', [B::table([['reference', 'Reference', 'strong'], ['question', 'Question'], ['status', 'Outcome', 'pill'], ['confidence', 'Confidence'], ['feedback', 'Feedback'], ['date', 'Asked']],
                KpAnswer::latest()->take(100)->get()->map(fn (KpAnswer $a) => ['reference' => $a->reference, 'question' => Str::limit($a->question, 90), 'status' => $a->status, 'confidence' => $a->confidence ? $a->confidence.'%' : 'n/a', 'feedback' => $a->feedback ?? '', 'date' => $a->created_at->format('j M Y H:i'), '_href' => Kp::BASE.'/ask/'.$a->reference.'/sources'])->all(),
                ['search' => 'Search questions...', 'filters' => [['key' => 'status', 'label' => 'All outcomes']], 'pageSize' => 15, 'empty' => 'No questions asked yet.'])], 12, null, 'bot')], KpAnswer::count())],
            'd023', 'customer-value' => [B::tab('live', 'Live Measures', $this->measures())],
            'capacity' => [B::tab('requests', 'Demand', [B::panel('Requests by Offer', [B::hbars($req()->countBy('title')->map(fn ($v, $k) => ['label' => $k, 'value' => $v])->values()->all())], 6, null, 'bar-chart-3'),
                B::panel('Rule', [B::text('Founder hours are allocated from the weekly capacity register. Reserve-protected hours are never offered, and a full week cannot take another K1 booking.', 'tip', 'No overbooking')], 6)])],
            default => [],
        };
    }

    /** Live counts from KP records. Measures only; no targets or vanity scores. */
    private function measures(): array
    {
        $kinds = ['scorecard' => 'Scorecards saved', 'decision_sheet' => 'Decision sheets', 'diagnostic' => 'Diagnostics completed', 'checklist' => 'Checklists saved', 'calculation' => 'Calculator scenarios', 'funder_interview' => 'Funder interviews'];
        $counts = KpRecord::whereIn('kind', array_keys($kinds))->get()->countBy('kind');
        $answers = KpAnswer::count();
        $tools = $counts->sum();
        $requests = KpRecord::where('kind', 'session_request')->count();
        $booked = KpRecord::where('kind', 'session_request')->where('status', 'Booked')->count();

        return [
            B::panel('KP Journey (live counts)', [B::funnel([['label' => 'Assistant questions', 'value' => $answers], ['label' => 'Tool outputs saved', 'value' => $tools], ['label' => 'Session requests', 'value' => $requests], ['label' => 'Sessions booked', 'value' => $booked]])], 6, null, 'filter'),
            B::panel('Tool Use', [B::hbars(collect($kinds)->map(fn ($l, $k) => ['label' => $l, 'value' => $counts[$k] ?? 0])->values()->all())], 6, null, 'bar-chart-3'),
            B::panel('Answer Feedback', [B::donut([
                ['label' => 'Helpful', 'value' => KpAnswer::where('feedback', 'helpful')->count(), 'color' => 'green'],
                ['label' => 'Not helpful', 'value' => KpAnswer::where('feedback', 'not-helpful')->count(), 'color' => 'orange'],
                ['label' => 'Reported', 'value' => KpAnswer::where('feedback', 'report')->count(), 'color' => 'red'],
            ], (string) $answers, 'Answers')], 6, null, 'message-circle'),
            B::panel('Formula Notes', [B::kv([['Assistant questions', 'Count of kp_answers rows'], ['Tool outputs saved', 'Count of saved scorecards, sheets, diagnostics, checklists, scenarios and interviews'], ['Session requests', 'Count of session_request rows (a request is not a booking)'], ['Sessions booked', 'Requests in state Booked with a delivery mode']])], 6, null, 'file-text'),
        ];
    }

    private function nav(): array
    {
        return collect(Kp::consoles())->values()->map(fn ($c, $i) => ['key' => $c[0], 'title' => $c[1], 'id' => 'KP-SCR-'.str_pad((string) (51 + $i), 3, '0', STR_PAD_LEFT)])->all();
    }
}
