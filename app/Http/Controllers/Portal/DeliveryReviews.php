<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\Deliverable;
use App\Models\Portal\EvidenceRequest;
use App\Models\Portal\Notice;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Record;
use App\Models\Portal\ShareLink;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** CP-SCR-035/036/043/044/045/046/047. Mixed into DeliveryController. */
trait DeliveryReviews
{
    private function deliverableRows()
    {
        return Deliverable::with('project')->where('user_id', $this->user()->id)->latest('released_at')->get();
    }

    public static function releaseLabel(string $s): string
    {
        return ['draft' => 'Not Released', 'in_review' => 'In Review', 'changes_required' => 'Corrections', 'release_approved' => 'Pending Release', 'delivered' => 'Released', 'retracted' => 'Retracted'][$s] ?? $s;
    }

    public function deliverables(Request $request): Response
    {
        $all = $this->deliverableRows();
        $rows = Ui::filter($all, $request, ['title', 'reference'], ['project' => fn ($d, $v) => $d->project?->reference === $v, 'type' => 'type', 'status' => 'release_state']);
        $overdue = $all->filter(fn ($d) => $d->acceptance_state === 'pending' && $d->release_state === 'delivered' && $d->acceptance_due_on?->isPast());

        return $this->register([
            'title' => 'Deliverables', 'icon' => 'package', 'subtitle' => 'Drafting, review, release, acceptance and correction are separate states. A deliverable is released only after QA and an authorised release decision.',
            'actions' => [Ui::action('Export All', '/portal/exports', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Deliverables', $all->count(), null, 'neutral', 'package'), Ui::kpi('Released', $all->where('release_state', 'delivered')->count(), Ui::pct($all->where('release_state', 'delivered')->count(), $all->count(), 1), 'good', 'badge-check'), Ui::kpi('In Review', $all->where('release_state', 'in_review')->count(), null, 'info', 'history'), Ui::kpi('Corrections', $all->where('release_state', 'changes_required')->count(), null, 'warn', 'refresh-cw'), Ui::kpi('Overdue Acceptance', $overdue->count(), null, 'bad', 'alert-triangle')],
            'search' => 'Search deliverables…',
            'filters' => [Ui::selectFilter('project', 'Project', $all->pluck('project')->filter()->unique('id')->mapWithKeys(fn ($p) => [$p->reference => $p->name])->all()), Ui::selectFilter('type', 'Type', ['Report', 'Model', 'Presentation', 'Document', 'Archive']), Ui::selectFilter('status', 'Release State', ['delivered' => 'Released', 'in_review' => 'In Review', 'changes_required' => 'Corrections'])],
            'main' => [Ui::table(null, ['Deliverable', 'Project / Service', 'Type', 'Version', 'Status', 'Acceptance Status', 'Released On', ''], $rows->map(fn ($d) => [
                Ui::stack($d->title, $d->reference, '/portal/deliverables/'.$d->id), $d->project?->name, $d->type, $d->version, Ui::pill(self::releaseLabel($d->release_state)), Ui::pill(str_replace('_', ' ', $d->acceptance_state)), Ui::date($d->released_at),
                Ui::actions([Ui::action('View', '/portal/deliverables/'.$d->id)]),
            ])->all())],
            'side' => [Ui::donut('Deliverables Overview', [Ui::slice('Released', $all->where('release_state', 'delivered')->count(), 'good'), Ui::slice('In Review', $all->where('release_state', 'in_review')->count(), 'info'), Ui::slice('Corrections', $all->where('release_state', 'changes_required')->count(), 'warn'), Ui::slice('Overdue Acceptance', $overdue->count(), 'bad')]), Ui::quick('Quick Actions', [Ui::action('Approval & Revision Centre', '/portal/approvals'), Ui::action('QA & Release Status', '/portal/qa-release'), Ui::action('Request New Deliverable', '/portal/intake')])],
        ]);
    }

    public function deliverable(Deliverable $deliverable): Response
    {
        $this->ownOrFail($deliverable);
        $d = $deliverable->load('project');

        return Inertia::render('Portal/Deliverable', [
            'deliverable' => [
                'id' => $d->id, 'reference' => $d->reference, 'title' => $d->title, 'type' => $d->type, 'format' => $d->format, 'version' => $d->version,
                'qa' => $d->qa_state, 'release' => $d->release_state, 'releaseLabel' => self::releaseLabel($d->release_state), 'acceptance' => $d->acceptance_state, 'decisionType' => $d->decision_type,
                'releasedAt' => $d->released_at?->format('d M Y'), 'acceptanceDue' => $d->acceptance_due_on?->format('d M Y'), 'daysLeft' => $d->acceptance_due_on ? (int) now()->diffInDays($d->acceptance_due_on, false) : null,
                'decidedAt' => $d->decided_at?->format('d M Y, H:i'), 'decisionNote' => $d->decision_note, 'fileName' => $d->file_name, 'size' => number_format($d->size_kb / 1024, 1).' MB', 'pages' => $d->pages,
                'checksum' => $d->checksum, 'confidentiality' => $d->confidentiality, 'tags' => $d->tags ?? [], 'topics' => $d->topics ?? [], 'versions' => $d->versions ?? [], 'description' => $d->description,
                'project' => $d->project ? ['name' => $d->project->name, 'reference' => $d->project->reference] : null, 'requestedBy' => $d->requested_by,
                'canDecide' => $d->release_state === 'delivered' && $d->acceptance_state === 'pending',
                'shares' => ShareLink::where('target_type', 'deliverable')->where('target_id', $d->id)->latest()->get()->map(fn ($s) => ['token' => $s->token, 'recipient' => $s->recipient, 'status' => $s->expires_at?->isPast() && $s->status === 'pending' ? 'expired' : $s->status, 'expires' => $s->expires_at?->format('d M Y')]),
            ],
        ]);
    }

    public function decide(Request $request, Deliverable $deliverable): RedirectResponse
    {
        $this->ownOrFail($deliverable);
        abort_unless($deliverable->release_state === 'delivered' && $deliverable->acceptance_state === 'pending', 422, 'This deliverable is not awaiting your decision.');
        $d = $request->validate(['decision' => 'required|in:accept,corrections,dispute', 'note' => 'required_unless:decision,accept|nullable|string|max:2000']);
        $state = ['accept' => 'accepted', 'corrections' => 'corrections_requested', 'dispute' => 'disputed'][$d['decision']];
        $deliverable->update(['acceptance_state' => $state, 'decided_at' => now(), 'decision_note' => $d['note'] ?? null, 'release_state' => $d['decision'] === 'corrections' ? 'changes_required' : $deliverable->release_state, 'qa_state' => $d['decision'] === 'corrections' ? 'corrections' : $deliverable->qa_state]);
        Portal::notify($this->user(), 'Decision recorded: '.$deliverable->title, ucfirst(str_replace('_', ' ', $state)).' · v'.$deliverable->version, 'project_update', '/portal/deliverables/'.$deliverable->id, 'Deliverables', 'Projects');

        return back()->with('success', ['accept' => 'Deliverable accepted. Thank you — your acceptance receipt is recorded.', 'corrections' => 'Corrections requested. The TBCA team will issue a revised version.', 'dispute' => 'Dispute raised. The contested deliverable is frozen; your other rights are unaffected.'][$d['decision']]);
    }

    public function shareDeliverable(Request $request, Deliverable $deliverable): RedirectResponse
    {
        $this->ownOrFail($deliverable);
        abort_unless($deliverable->release_state === 'delivered', 422, 'Only released deliverables can be shared.');
        $d = $request->validate(['recipient' => 'required|email', 'days' => 'required|integer|min:1|max:30']);
        $link = ShareLink::create(['user_id' => $this->user()->id, 'token' => Str::random(40), 'target_type' => 'deliverable', 'target_id' => $deliverable->id, 'label' => $deliverable->title.' v'.$deliverable->version, 'recipient' => $d['recipient'], 'status' => 'pending', 'expires_at' => now()->addDays((int) $d['days'])]);

        return back()->with('success', 'Secure link created for '.$d['recipient'].': '.url('/portal/s/'.$link->token));
    }

    public function downloadDeliverable(Deliverable $deliverable)
    {
        $this->ownOrFail($deliverable);
        if ($deliverable->document_id && ($doc = \App\Models\Portal\Document::find($deliverable->document_id)) && $doc->path && \Illuminate\Support\Facades\Storage::disk('local')->exists($doc->path)) {
            return \Illuminate\Support\Facades\Storage::disk('local')->download($doc->path, $deliverable->file_name ?? $doc->name);
        }
        $body = "The Business Clinic.Africa — Deliverable\n\n{$deliverable->title}\nReference: {$deliverable->reference}\nVersion: {$deliverable->version}\nRelease state: ".self::releaseLabel($deliverable->release_state)."\nChecksum: {$deliverable->checksum}\n\n{$deliverable->description}\n";

        return response($body, 200, ['Content-Type' => 'text/plain', 'Content-Disposition' => 'attachment; filename="'.Str::slug($deliverable->title).'-v'.$deliverable->version.'.txt"']);
    }

    public function approvals(Request $request): Response
    {
        $all = $this->deliverableRows();
        $state = fn ($d) => $d->acceptance_state === 'corrections_requested' ? 'revision_requested' : ($d->release_state === 'in_review' ? 'awaiting_review' : ($d->acceptance_state === 'pending' && $d->release_state === 'delivered' ? ($d->acceptance_due_on?->isPast() ? 'overdue' : 'pending_decision') : $d->acceptance_state));
        $rows = Ui::filter($all, $request, ['title', 'reference'], ['decision' => 'decision_type', 'status' => fn ($d, $v) => $state($d) === $v]);
        $counts = $all->groupBy($state)->map->count();

        return $this->register([
            'title' => 'Approval & Revision Centre', 'icon' => 'stamp', 'subtitle' => 'Review, approve, accept or request revisions for deliverables and documents.',
            'kpis' => [Ui::kpi('Pending Your Decision', ($counts['pending_decision'] ?? 0) + ($counts['overdue'] ?? 0), 'Requires action', 'warn', 'stamp'), Ui::kpi('Awaiting Review', $counts['awaiting_review'] ?? 0, 'In TBCA QA', 'info', 'history'), Ui::kpi('Revision Requested', $counts['revision_requested'] ?? 0, 'With TBCA', 'neutral', 'refresh-cw'), Ui::kpi('Approved / Accepted', $counts['accepted'] ?? 0, null, 'good', 'badge-check'), Ui::kpi('Overdue', $counts['overdue'] ?? 0, null, 'bad', 'alert-triangle')],
            'filters' => [Ui::selectFilter('decision', 'Decision Type', ['approval' => 'Approval', 'review' => 'Review', 'acceptance' => 'Acceptance']), Ui::selectFilter('status', 'Status', ['pending_decision' => 'Pending Decision', 'awaiting_review' => 'Awaiting Review', 'revision_requested' => 'Revision Requested', 'accepted' => 'Accepted', 'overdue' => 'Overdue'])],
            'main' => [Ui::table(null, ['Item', 'Project / Service', 'Type', 'Version', 'Decision Type', 'Requested By', 'Due Date', 'Status', ''], $rows->map(fn ($d) => [
                Ui::stack($d->title, $d->reference), $d->project?->name, $d->type, $d->version, ucfirst($d->decision_type), $d->requested_by, $d->acceptance_due_on ? $d->acceptance_due_on->format('d M Y').' ('.($d->acceptance_due_on->isPast() ? 'Overdue' : (int) now()->diffInDays($d->acceptance_due_on).' days left').')' : '—',
                Ui::pill(str_replace('_', ' ', $state($d))), Ui::actions([Ui::action(in_array($state($d), ['pending_decision', 'overdue'], true) ? 'Review' : 'View', '/portal/deliverables/'.$d->id, 'get', ['variant' => in_array($state($d), ['pending_decision', 'overdue'], true) ? 'gold' : 'outline'])]),
            ])->all())],
            'side' => [Ui::donut('Decision Summary', [Ui::slice('Pending Decision', ($counts['pending_decision'] ?? 0) + ($counts['overdue'] ?? 0), 'warn'), Ui::slice('Awaiting Review', $counts['awaiting_review'] ?? 0, 'info'), Ui::slice('Revision Requested', $counts['revision_requested'] ?? 0, 'purple'), Ui::slice('Approved / Accepted', $counts['accepted'] ?? 0, 'good')]), Ui::checklist('Authority & Security', [Ui::check('Your approval authority is valid', true, 'Valid'), Ui::check('Step-up authentication', true, session('portal.stepup_at') ? 'Verified' : 'Not required')])],
        ]);
    }

    public function qaRelease(): Response
    {
        $all = $this->deliverableRows();
        $qa = $all->groupBy('qa_state')->map->count();
        $rel = $all->groupBy('release_state')->map->count();
        $qaLabel = ['qa_approved' => 'QA Approved', 'in_qa' => 'In QA Review', 'corrections' => 'Corrections Issued', 'not_reviewed' => "Not Yet QA'd"];

        return $this->register([
            'title' => 'QA & Release Status', 'icon' => 'badge-check', 'subtitle' => 'Read-only view of quality assurance and release state for every deliverable. Last updated '.now()->format('d M Y, H:i').'.',
            'kpis' => [Ui::kpi('Total Deliverables', $all->count(), null, 'neutral', 'package'), Ui::kpi('Released', $rel['delivered'] ?? 0, Ui::pct($rel['delivered'] ?? 0, $all->count(), 1), 'good', 'badge-check'), Ui::kpi('In QA Review', $qa['in_qa'] ?? 0, null, 'info', 'history'), Ui::kpi('Corrections Issued', $qa['corrections'] ?? 0, null, 'warn', 'refresh-cw'), Ui::kpi('Not Released', $all->whereNotIn('release_state', ['delivered'])->count(), null, 'neutral', 'lock')],
            'main' => [
                Ui::table(null, ['Deliverable', 'Project / Service', 'Type', 'Version', 'QA State', 'Release State', 'Released On', 'Due Date'], $all->map(fn ($d) => [Ui::stack($d->title, $d->reference, '/portal/deliverables/'.$d->id), $d->project?->name, $d->type, $d->version, Ui::pill($qaLabel[$d->qa_state] ?? $d->qa_state), Ui::pill(self::releaseLabel($d->release_state)), Ui::date($d->released_at), Ui::date($d->acceptance_due_on)])->all()),
                Ui::row([
                    Ui::donut('QA State Distribution', collect($qaLabel)->map(fn ($l, $k) => Ui::slice($l, $qa[$k] ?? 0, ['qa_approved' => 'good', 'in_qa' => 'info', 'corrections' => 'warn', 'not_reviewed' => 'neutral'][$k]))->values()->all()),
                    Ui::kv('QA Cycle Performance', [['Average QA Cycle Time', '2.6 days'], ['QA Approval Rate (first pass)', Ui::pct($qa['qa_approved'] ?? 0, max(1, $all->count()))], ['On-Time QA Completion', '92%']]),
                ]),
            ],
            'side' => [Ui::info('Release rule', 'Judgement-heavy, regulated or partner-dependent outputs require the designated review class before release. Retraction cascades to every client surface without erasing audit history.', 'info')],
        ]);
    }

    public function timeline(Request $request): Response
    {
        $user = $this->user();
        $events = collect();
        foreach ($this->deliverableRows() as $d) {
            if ($d->released_at) {
                $events->push(['date' => $d->released_at, 'title' => 'Deliverable Released', 'sub' => "{$d->title} v{$d->version} has been released.", 'tone' => 'good', 'by' => 'TBCA Advisory Team', 'type' => 'deliverable']);
            }
            if ($d->decided_at) {
                $events->push(['date' => $d->decided_at, 'title' => 'Deliverable '.ucfirst(str_replace('_', ' ', $d->acceptance_state)), 'sub' => "{$d->title} v{$d->version}".($d->decision_note ? ' — '.$d->decision_note : ''), 'tone' => $d->acceptance_state === 'accepted' ? 'good' : 'warn', 'by' => $user->name, 'type' => 'decision']);
            }
        }
        foreach (EvidenceRequest::where('user_id', $user->id)->get() as $e) {
            $events->push(['date' => $e->requested_on ?? $e->created_at, 'title' => 'Evidence Request Raised', 'sub' => $e->title, 'tone' => 'info', 'by' => $e->requested_by, 'type' => 'evidence']);
            if ($e->submitted_at) {
                $events->push(['date' => $e->submitted_at, 'title' => 'Evidence Uploaded', 'sub' => $e->title, 'tone' => 'good', 'by' => $user->name, 'type' => 'evidence']);
            }
        }
        foreach (PortalCase::where('user_id', $user->id)->whereIn('kind', ['variation', 'dispute', 'intake'])->get() as $c) {
            $events->push(['date' => $c->submitted_at ?? $c->created_at, 'title' => ucfirst($c->kind).' '.ucfirst(str_replace('_', ' ', $c->status)), 'sub' => $c->reference.' · '.$c->title, 'tone' => 'gold', 'by' => $user->name, 'type' => 'decision']);
        }
        $type = (string) $request->query('type', '');
        $events = $events->filter(fn ($e) => $type === '' || $e['type'] === $type)->sortByDesc('date')->values();

        return $this->register([
            'title' => 'Decision & Evidence Timeline', 'icon' => 'history', 'subtitle' => 'An auditable history of releases, decisions, revisions and evidence across your engagements.',
            'filters' => [Ui::selectFilter('type', 'Event type', ['deliverable' => 'Deliverables', 'decision' => 'Decisions', 'evidence' => 'Evidence'])],
            'main' => [Ui::timeline('Timeline', $events->take(40)->map(fn ($e) => ['title' => $e['title'], 'sub' => $e['sub'], 'meta' => \Illuminate\Support\Carbon::parse($e['date'])->format('d M Y, H:i').' · '.$e['by'], 'tone' => $e['tone']])->all())],
            'side' => [Ui::list('Timeline Summary', [Ui::item('Total Events', (string) $events->count()), Ui::item('Decisions / Approvals', (string) $events->where('type', 'decision')->count()), Ui::item('Evidence Events', (string) $events->where('type', 'evidence')->count()), Ui::item('Deliverable Events', (string) $events->where('type', 'deliverable')->count())])],
        ]);
    }

    public function intake(): Response
    {
        $cases = PortalCase::where('user_id', $this->user()->id)->where('kind', 'intake')->latest('submitted_at')->get();
        $services = [['Market Entry Strategy', 'End-to-end market entry strategy and feasibility', 'Strategy', 'globe'], ['Business Plan Development', 'Investor-ready business plans and financial models', 'Advisory', 'file-text'], ['Due Diligence', 'Commercial, financial, legal and technical due diligence', 'Due Diligence', 'shield-check'], ['Feasibility Study', 'Robust feasibility studies with financial analysis', 'Advisory', 'activity'], ['Regulatory & Compliance', 'Regulatory approvals and compliance support', 'Compliance', 'scale'], ['Funding & Investor Support', 'Investor introductions and funding support', 'Funding', 'hand-coins'], ['Project Management', 'Project management and implementation support', 'Execution', 'folder-kanban'], ['Specialist Advisory', 'Specialist advisory across multiple disciplines', 'Advisory', 'compass']];

        return $this->register([
            'title' => 'Service Intake', 'icon' => 'inbox', 'subtitle' => 'Tell us what you need. Validated intake reuses information we already hold, so you never retell your story.',
            'actions' => [Ui::action('Start a Request', '/portal/journeys/intake', 'get', ['variant' => 'gold'])],
            'main' => [
                Ui::steps('How it works', [['label' => 'Choose Service'], ['label' => 'Provide Details'], ['label' => 'Review & Confirm'], ['label' => 'Submit Request'], ['label' => 'Next Steps']], 1),
                Ui::cards('Popular Services', array_map(fn ($s) => Ui::card($s[0], $s[1], $s[2], '/portal/journeys/intake?service='.urlencode($s[0]), $s[3]), $services), 4),
                Ui::table('My Recent Intake Requests', ['Request ID', 'Service', 'Status', 'Submitted On', 'Engagement Type', 'Assigned To'], $cases->map(fn ($c) => [Ui::ref($c->reference), $c->title, Ui::pill($c->status), Ui::date($c->submitted_at), $c->payload['engagement_type'] ?? '—', $c->payload['assigned'] ?? 'Being assigned'])->all()),
            ],
            'side' => [Ui::timeline('How Service Intake Works', [['title' => 'Choose a service'], ['title' => 'Provide key details'], ['title' => 'Review and confirm'], ['title' => 'Submit securely'], ['title' => 'Our team responds, usually within 1 business day']]), Ui::info('Need Help Choosing?', 'Speak to an advisor before you submit.', 'gold', Ui::action('Speak to an Advisor', '/portal/meetings'))],
        ]);
    }

    public function dataReuse(Request $request): Response
    {
        $all = Record::where('user_id', $this->user()->id)->where('register', 'data_reuse')->orderBy('sort')->get();
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $all : $all->where('status', $tab);

        return $this->register([
            'title' => 'No-Retelling Data Reuse Review', 'icon' => 'recycle', 'subtitle' => "Review, confirm or update your data so we can reuse it securely and you don't have to retell us what we already know.",
            'actions' => [Ui::action('Confirm All Reusable', '/portal/data-reuse/0/confirm-all', 'post', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Data Items', $all->count(), null, 'neutral', 'database'), Ui::kpi('Reusable', $all->where('status', 'reusable')->count(), Ui::pct($all->where('status', 'reusable')->count(), $all->count()).' can be reused', 'good', 'recycle'), Ui::kpi('Needs Review', $all->where('status', 'needs_review')->count(), null, 'warn', 'history'), Ui::kpi('Cannot Reuse', $all->where('status', 'cannot_reuse')->count(), 'Due to age or changes', 'bad', 'user-x'), Ui::kpi('Last Reviewed', $all->max('updated_at') ? \Illuminate\Support\Carbon::parse($all->max('updated_at'))->format('d M Y') : '—', null, 'neutral', 'calendar')],
            'tabs' => Ui::tabs(['all' => 'All Items', 'reusable' => 'Reusable', 'needs_review' => 'Needs Review', 'cannot_reuse' => 'Cannot Reuse', 'withdrawn' => 'Withdrawn']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Data Item', 'Type', 'Source Engagement', 'Last Updated', 'Status', 'Next Review Due', ''], $rows->values()->map(fn ($r) => [
                Ui::stack($r->title, $r->data['description'] ?? ''), $r->data['type'] ?? '', $r->data['source'] ?? '', Ui::date($r->data['updated'] ?? null), Ui::pill($r->status), Ui::date($r->due_on),
                Ui::actions(array_filter([$r->status !== 'reusable' && $r->status !== 'cannot_reuse' ? Ui::action('Confirm', '/portal/data-reuse/'.$r->id.'/confirm', 'post', ['variant' => 'gold']) : null, $r->status === 'cannot_reuse' ? Ui::action('Upload Update', '/portal/documents/upload') : null, $r->status !== 'withdrawn' ? Ui::action('Withdraw', '/portal/data-reuse/'.$r->id.'/withdraw', 'post') : null])),
            ])->all())],
            'side' => [Ui::checklist('Why This Matters', [Ui::check('Saves you time'), Ui::check('Reduces duplication'), Ui::check('Improves accuracy'), Ui::check('Keeps your data secure')]), Ui::info('Your Consent', 'We only reuse data you provided, that is accurate, and for which you have consented. Withdrawing stops reuse immediately.', 'info')],
        ]);
    }

    public function dataReuseAction(string $record, string $action): RedirectResponse
    {
        if ($action === 'confirm-all') {
            Record::where('user_id', $this->user()->id)->where('register', 'data_reuse')->where('status', 'needs_review')->update(['status' => 'reusable', 'due_on' => now()->addYear()]);

            return back()->with('success', 'All items needing review have been confirmed for reuse for 12 months.');
        }
        $r = Record::findOrFail($record);
        $this->ownOrFail($r);
        $r->update(match ($action) { 'confirm' => ['status' => 'reusable', 'due_on' => now()->addYear()], 'withdraw' => ['status' => 'withdrawn'], default => ['status' => 'needs_review'] });

        return back()->with('success', $r->title.': '.($action === 'confirm' ? 'confirmed for reuse until '.now()->addYear()->format('d M Y').'.' : 'reuse withdrawn.'));
    }
}
