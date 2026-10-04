<?php

namespace App\Http\Controllers\Portal;

use App\Models\Booking;
use App\Models\Portal\Deliverable;
use App\Models\Portal\Document;
use App\Models\Portal\EvidenceRequest;
use App\Models\Portal\Project;
use App\Models\Portal\Task;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-037/038/042/049/050 (+ deliverables, approvals, intake and data reuse via DeliveryReviews). */
class DeliveryController extends PortalController
{
    use DeliveryReviews;

    private function projectsQuery()
    {
        return Project::where('user_id', $this->user()->id);
    }

    public function projects(Request $request): Response
    {
        $all = $this->projectsQuery()->latest('updated_at')->get();
        $rows = Ui::filter($all, $request, ['name', 'reference', 'manager'], ['status' => 'status', 'health' => 'health']);

        return $this->register([
            'title' => 'Projects', 'icon' => 'folder-kanban', 'subtitle' => 'Every engagement with its stage, health, owner and next milestone.',
            'actions' => [Ui::action('Start a Project', '/portal/intake', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Active Projects', $all->where('status', '!=', 'completed')->count(), null, 'good', 'folder-kanban'), Ui::kpi('On Track', $all->where('health', 'good')->count(), null, 'good', 'badge-check'), Ui::kpi('At Risk', $all->where('health', 'at_risk')->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Pending Client', $all->where('status', 'pending_client')->count(), 'Waiting on you', 'warn', 'inbox'), Ui::kpi('Completed', $all->where('status', 'completed')->count(), null, 'neutral', 'flag')],
            'search' => 'Search projects…', 'filters' => [Ui::selectFilter('status', 'Status', ['in_progress' => 'In Progress', 'pending_client' => 'Pending Client', 'on_hold' => 'On Hold', 'completed' => 'Completed']), Ui::selectFilter('health', 'Health', ['good' => 'Good', 'fair' => 'Fair', 'at_risk' => 'At Risk'])],
            'main' => [Ui::table(null, ['Project', 'Category', 'Stage', 'Status', 'Health', 'Progress', 'Due', 'Lead'], $rows->map(fn ($p) => [Ui::stack($p->name, $p->reference, '/portal/projects/'.$p->reference), $p->category, $p->current_stage, Ui::pill($p->status), Ui::pill($p->health, ['good' => 'good', 'fair' => 'warn', 'at_risk' => 'bad'][$p->health] ?? null), Ui::progress($p->progress), Ui::date($p->due_on), Ui::person($p->manager ?? '—', 'Project Manager')])->all())],
            'side' => [Ui::donut('Project Health', [Ui::slice('Good', $all->where('health', 'good')->count(), 'good'), Ui::slice('Fair', $all->where('health', 'fair')->count(), 'warn'), Ui::slice('At Risk', $all->where('health', 'at_risk')->count(), 'bad')]), Ui::quick('Quick Actions', [Ui::action('Tasks & Milestones', '/portal/tasks'), Ui::action('Deliverables', '/portal/deliverables'), Ui::action('Decision Timeline', '/portal/timeline')])],
        ]);
    }

    public function project(Project $project): Response
    {
        $this->ownOrFail($project);
        $milestones = Task::where('project_id', $project->id)->where('kind', 'milestone')->orderBy('due_on')->get();
        $docs = Document::where('project_id', $project->id)->where('is_folder', false)->latest()->take(4)->get();
        $stageIndex = collect($project->stages ?? [])->search(fn ($s) => $s['status'] === 'in_progress');
        $daysLeft = $project->due_on ? (int) now()->diffInDays($project->due_on, false) : null;

        return $this->register([
            'title' => $project->name, 'code' => $project->reference, 'icon' => 'folder-kanban', 'crumbs' => [['label' => 'Projects', 'href' => '/portal/projects'], ['label' => $project->reference]],
            'subtitle' => $project->category.' · '.ucwords(str_replace('_', ' ', $project->status)),
            'actions' => [Ui::action('If I Stop Now', '/portal/if-i-stop-now?engagement='.$project->reference), Ui::action('Message Project Team', '/portal/messages', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Project Manager', $project->manager ?? '—', $project->manager_email, 'neutral', 'user'), Ui::kpi('Start Date', Ui::date($project->starts_on), null, 'neutral', 'calendar'), Ui::kpi('Target Completion', Ui::date($project->due_on), $daysLeft === null ? null : ($daysLeft >= 0 ? $daysLeft.' days left' : abs($daysLeft).' days overdue'), $daysLeft !== null && $daysLeft < 0 ? 'bad' : 'neutral', 'flag'), Ui::kpi('Overall Progress', $project->progress.'%', $project->current_stage, 'gold', 'activity'), Ui::kpi('Status', ucwords(str_replace('_', ' ', $project->status)), $project->health === 'good' ? 'On Track' : ucwords(str_replace('_', ' ', $project->health)), $project->health === 'good' ? 'good' : 'bad', 'badge-check')],
            'main' => [
                Ui::steps('Project Progress', collect($project->stages ?? [])->map(fn ($s) => ['label' => $s['label'], 'sub' => ucfirst(str_replace('_', ' ', $s['status'])).' · '.$s['date']])->all(), $stageIndex === false ? count($project->stages ?? []) + 1 : $stageIndex + 1),
                Ui::info($project->latest_update['title'] ?? 'Latest update', ($project->latest_update['body'] ?? '')."\n— ".($project->latest_update['by'] ?? ''), 'gold'),
                Ui::table('Upcoming Milestones', ['Milestone', 'Due Date', 'Status'], $milestones->map(fn ($m) => [$m->title, Ui::date($m->due_on), Ui::pill($m->status === 'completed' ? 'completed' : ($m->due_on?->isPast() ? 'overdue' : 'upcoming'))])->all(), ['link' => ['label' => 'View Tasks & Milestones', 'href' => '/portal/tasks?project='.$project->reference]]),
                Ui::table('Risks & Issues', ['Issue', 'Impact', 'Status'], collect($project->risks ?? [])->map(fn ($r) => [$r['issue'], Ui::pill($r['impact']), Ui::pill($r['status'])])->all()),
                Ui::table('Documents', ['Name', 'Type', 'Uploaded', ''], $docs->map(fn ($d) => [Ui::link($d->name, '/portal/documents/'.$d->id), $d->doc_type, $d->created_at->format('d M Y'), Ui::actions([Ui::action('Download', '/portal/documents/'.$d->id.'/download', 'get', ['download' => true])])])->all()),
            ],
            'side' => [
                Ui::kv('Project Summary', [['Project ID', $project->reference], ['Service Category', $project->category], ['Priority', ucfirst($project->priority)], ['Engagement Type', $project->engagement_type], ['Fee Structure', Ui::zar($project->fee_zar).' (excl. VAT)'], ['Billed To Date', Ui::zar($project->billed_zar).' ('.Ui::pct($project->billed_zar, max(1, $project->fee_zar)).')'], ['Next Invoice', Ui::date($project->next_invoice_on)]], Ui::action('View Fee & Payment Details', '/portal/fee-manifest')),
                Ui::list('Key Contacts', collect($project->team ?? [])->map(fn ($t) => Ui::item($t['name'], null, $t['role']))->all()),
                Ui::quick('Quick Actions', [Ui::action('View Tasks & Milestones', '/portal/tasks?project='.$project->reference), Ui::action('Upload Document', '/portal/documents/upload?project='.$project->reference), Ui::action('Evidence Requests', '/portal/evidence'), Ui::action('Deliverables', '/portal/deliverables?project='.$project->reference)]),
            ],
        ]);
    }

    public function tasks(Request $request): Response
    {
        $user = $this->user();
        $all = Task::with('project')->where('user_id', $user->id)->orderBy('due_on')->get();
        $today = now()->startOfDay();
        $isOverdue = fn ($t) => $t->status !== 'completed' && $t->due_on && $t->due_on->lt($today);
        $tab = $this->tab($request, 'all');
        $rows = match ($tab) { 'overdue' => $all->filter($isOverdue), 'milestones' => $all->where('kind', 'milestone'), 'mine' => $all->where('assignee', $user->name), default => $all };
        $rows = Ui::filter($rows->values(), $request, ['title', 'description', 'assignee'], ['project' => fn ($t, $v) => $t->project?->reference === $v, 'status' => 'status', 'priority' => 'priority']);
        $page = Ui::page($rows, $request, 12);
        $tasks = $all->where('kind', 'task');
        $projects = $this->projectsQuery()->get();

        return $this->register([
            'title' => 'Tasks and Milestones', 'icon' => 'check-square', 'subtitle' => 'Everything that needs to happen across your projects, with owners and due dates.',
            'actions' => [Ui::modal('Create New Task', 'task', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Tasks', $tasks->count(), 'Across '.$projects->count().' projects', 'neutral', 'check-square'), Ui::kpi('Completed', $tasks->where('status', 'completed')->count(), Ui::pct($tasks->where('status', 'completed')->count(), $tasks->count()).' completed', 'good', 'badge-check'), Ui::kpi('In Progress', $tasks->where('status', 'in_progress')->count(), null, 'info', 'history'), Ui::kpi('Not Started', $tasks->where('status', 'not_started')->count(), null, 'neutral', 'circle-pause'), Ui::kpi('Overdue', $tasks->filter($isOverdue)->count(), 'Require attention', 'bad', 'alert-triangle')],
            'tabs' => Ui::tabs(['all' => 'All Tasks', 'overdue' => 'Overdue', 'milestones' => 'Milestones', 'mine' => 'My Tasks']), 'tab' => $tab, 'search' => 'Search tasks…',
            'filters' => [Ui::selectFilter('project', 'Project', $projects->mapWithKeys(fn ($p) => [$p->reference => $p->name])->all()), Ui::selectFilter('status', 'Status', ['not_started' => 'Not Started', 'in_progress' => 'In Progress', 'completed' => 'Completed']), Ui::selectFilter('priority', 'Priority', ['high' => 'High', 'medium' => 'Medium', 'low' => 'Low'])],
            'main' => [Ui::table(null, ['Task / Milestone', 'Project', 'Assignee', 'Priority', 'Status', 'Due Date', 'Progress', ''], $page['items']->map(fn ($t) => [
                Ui::stack(($t->kind === 'milestone' ? '⚑ Milestone: ' : '').$t->title, $t->description), $t->project ? Ui::link($t->project->name, '/portal/projects/'.$t->project->reference) : '—', Ui::person($t->assignee ?? '—'), Ui::pill($t->priority),
                Ui::pill($isOverdue($t) ? 'overdue' : $t->status), Ui::date($t->due_on), Ui::progress($t->progress),
                Ui::actions([$t->status !== 'completed' && $t->kind === 'task' ? Ui::action('Mark Complete', '/portal/tasks/'.$t->id.'/complete', 'post') : null]),
            ])->all(), ['pagination' => $page['pagination']])],
            'side' => [
                Ui::list('Upcoming Milestones', $all->where('kind', 'milestone')->where('status', '!=', 'completed')->take(4)->map(fn ($m) => Ui::item($m->title, Ui::date($m->due_on), $m->due_on ? (int) now()->diffInDays($m->due_on, false).' days' : null))->values()->all()),
                Ui::list('My Overdue Tasks', $tasks->filter($isOverdue)->where('assignee', $user->name)->map(fn ($t) => Ui::item($t->title, 'Due '.Ui::date($t->due_on), null, 'bad'))->values()->all()),
                Ui::quick('Quick Actions', [Ui::modal('Create New Task', 'task'), Ui::action('Upload Documents', '/portal/documents/upload'), Ui::action('View Project Timeline', '/portal/timeline')]),
            ],
            'forms' => ['task' => Ui::form('Create New Task', '/portal/tasks', [
                Ui::field('title', 'Title', 'text', ['required' => true]), Ui::field('project', 'Project', 'select', ['required' => true, 'options' => $projects->map(fn ($p) => ['value' => $p->reference, 'label' => $p->name])->values()->all()]),
                Ui::field('kind', 'Type', 'select', ['value' => 'task', 'options' => Ui::options(['task' => 'Task', 'milestone' => 'Milestone'])]), Ui::field('priority', 'Priority', 'select', ['value' => 'medium', 'options' => Ui::options(['high' => 'High', 'medium' => 'Medium', 'low' => 'Low'])]),
                Ui::field('due_on', 'Due date', 'date', ['required' => true]), Ui::field('description', 'Description', 'textarea'),
            ], 'Create Task')],
        ]);
    }

    public function storeTask(Request $request): RedirectResponse
    {
        $d = $request->validate(['title' => 'required|string|max:160', 'project' => 'required|string', 'kind' => 'required|in:task,milestone', 'priority' => 'required|in:high,medium,low', 'due_on' => 'required|date', 'description' => 'nullable|string|max:255']);
        $project = $this->projectsQuery()->where('reference', $d['project'])->firstOrFail();
        Task::create(['user_id' => $this->user()->id, 'project_id' => $project->id, 'title' => $d['title'], 'kind' => $d['kind'], 'priority' => $d['priority'], 'due_on' => $d['due_on'], 'description' => $d['description'], 'assignee' => $this->user()->name, 'status' => 'not_started']);

        return back()->with('success', 'Task created.');
    }

    public function completeTask(Task $task): RedirectResponse
    {
        $this->ownOrFail($task);
        $task->update(['status' => 'completed', 'progress' => 100, 'completed_at' => now()]);

        return back()->with('success', '"'.$task->title.'" marked complete.');
    }

    public function evidence(Request $request): Response
    {
        $all = EvidenceRequest::with('project')->where('user_id', $this->user()->id)->orderBy('due_on')->get();
        $today = now()->startOfDay();
        $state = fn ($e) => $e->status === 'pending' && $e->due_on?->lt($today) ? 'overdue' : $e->status;
        $tab = $this->tab($request, 'all');
        $rows = $tab === 'all' ? $all : $all->filter(fn ($e) => $state($e) === $tab);

        return $this->register([
            'title' => 'Evidence Requests', 'icon' => 'file-search', 'subtitle' => 'Documents and information our teams need from you. Uploads are stored in your secure vault and linked to the request.',
            'kpis' => [Ui::kpi('Total Requests', $all->count(), null, 'neutral', 'file-search'), Ui::kpi('Submitted', $all->where('status', 'submitted')->count(), Ui::pct($all->where('status', 'submitted')->count(), $all->count()).' completed', 'good', 'badge-check'), Ui::kpi('Pending', $all->filter(fn ($e) => $state($e) === 'pending')->count(), null, 'warn', 'history'), Ui::kpi('Overdue', $all->filter(fn ($e) => $state($e) === 'overdue')->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Due This Week', $all->where('status', 'pending')->filter(fn ($e) => $e->due_on?->between($today, $today->copy()->addDays(7)))->count(), null, 'info', 'calendar')],
            'tabs' => Ui::tabs(['all' => 'All Requests', 'pending' => 'Pending', 'submitted' => 'Submitted', 'overdue' => 'Overdue']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Evidence Request', 'Project / Service', 'Requested By', 'Priority', 'Due Date', 'Status', 'Progress', ''], $rows->values()->map(fn ($e) => [
                Ui::stack($e->title, $e->description), $e->project?->name, Ui::person($e->requested_by ?? 'TBCA', Ui::date($e->requested_on)), Ui::pill($e->priority), Ui::date($e->due_on), Ui::pill($state($e)), Ui::progress($e->progress),
                Ui::actions([$e->status === 'pending' ? Ui::modal('Upload', 'evidence-'.$e->id, ['variant' => 'gold']) : ($e->document_id ? Ui::action('View', '/portal/documents/'.$e->document_id) : null)]),
            ])->all())],
            'side' => [Ui::list('My Overdue Requests', $all->filter(fn ($e) => $state($e) === 'overdue')->map(fn ($e) => Ui::item($e->title, 'Due '.Ui::date($e->due_on), (int) $e->due_on->diffInDays(now()).' days overdue', 'bad'))->values()->all()), Ui::info('Information', 'Accepted file types: PDF, Word, Excel, images and ZIP up to 25 MB. Submitting an upload marks the request as Submitted for TBCA review.', 'info')],
            'forms' => $all->where('status', 'pending')->mapWithKeys(fn ($e) => ['evidence-'.$e->id => Ui::form('Upload: '.$e->title, '/portal/evidence/'.$e->id.'/upload', [Ui::field('file', 'File', 'file', ['required' => true]), Ui::field('note', 'Note for TBCA (optional)', 'textarea')], 'Submit Evidence', 'post', $e->description)])->all(),
        ]);
    }

    public function uploadEvidence(Request $request, EvidenceRequest $evidence): RedirectResponse
    {
        $this->ownOrFail($evidence);
        $request->validate(['file' => 'required|file|max:25600|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,zip', 'note' => 'nullable|string|max:1000']);
        $doc = DocumentController::storeUpload($request->file('file'), $this->user(), ['project_id' => $evidence->project_id, 'doc_type' => 'Evidence', 'tags' => ['Evidence'], 'description' => $request->input('note') ?: 'Submitted for evidence request: '.$evidence->title]);
        $evidence->update(['status' => 'submitted', 'progress' => 100, 'document_id' => $doc->id, 'submitted_at' => now()]);
        Portal::notify($this->user(), 'Evidence submitted', $evidence->title.' was uploaded and sent for review.', 'compliance', '/portal/evidence', 'Evidence Requests', 'Compliance');

        return back()->with('success', 'Evidence uploaded and linked to the request.');
    }

    public function meetings(Request $request): Response
    {
        $user = $this->user();
        $all = Booking::where('user_id', $user->id)->orderBy('starts_at')->get();
        $tab = $this->tab($request, 'upcoming');
        $rows = match ($tab) { 'past' => $all->where('starts_at', '<', now())->sortByDesc('starts_at'), 'cancelled' => $all->where('status', 'cancelled'), default => $all->where('starts_at', '>=', now())->where('status', '!=', 'cancelled') };
        $next = $all->where('starts_at', '>=', now())->where('status', '!=', 'cancelled')->first();

        return $this->register([
            'title' => 'Meetings and Bookings', 'icon' => 'calendar', 'subtitle' => 'Your scheduled sessions with TBCA. Reschedule or cancel any upcoming booking.',
            'actions' => [Ui::action('Download Calendar (ICS)', '/portal/meetings/calendar.ics', 'get', ['download' => true]), Ui::modal('Book a Meeting', 'book', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Upcoming Meetings', $all->where('starts_at', '>=', now())->where('status', '!=', 'cancelled')->count(), 'Next 30 days', 'neutral', 'calendar'), Ui::kpi('Completed', $all->where('starts_at', '<', now())->where('status', '!=', 'cancelled')->count(), 'This year', 'good', 'badge-check'), Ui::kpi('Rescheduled', $all->where('status', 'rescheduled')->count(), null, 'warn', 'refresh-cw'), Ui::kpi('Cancelled', $all->where('status', 'cancelled')->count(), null, 'bad', 'user-x'), Ui::kpi('Total Meetings', $all->count(), 'This year', 'neutral', 'users')],
            'tabs' => Ui::tabs(['upcoming' => 'Upcoming', 'past' => 'Past Meetings', 'cancelled' => 'Cancelled']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Date & Time', 'Meeting / Subject', 'Project / Service', 'Type', 'Status', ''], $rows->values()->map(fn ($b) => [
                Ui::stack($b->starts_at->format('d M Y'), $b->starts_at->format('D H:i').' (SAST) · '.$b->duration_minutes.' min'), Ui::stack($b->topic ?? ucwords(str_replace('-', ' ', $b->type)), $b->reference), $b->meta['project'] ?? '—', ucfirst($b->channel), Ui::pill($b->status),
                Ui::actions($b->starts_at->isFuture() && $b->status !== 'cancelled' ? [Ui::modal('Reschedule', 'reschedule', ['data' => ['booking' => $b->reference]]), Ui::action('Cancel', '/portal/meetings/'.$b->reference.'/cancel', 'post', ['variant' => 'danger', 'confirm' => 'Cancel this meeting?'])] : []),
            ])->all())],
            'side' => array_values(array_filter([
                $next ? Ui::kv('Next Meeting', [['Subject', $next->topic], ['When', $next->starts_at->format('d M Y, H:i').' (SAST)'], ['Where', $next->meta['location'] ?? ucfirst($next->channel)], ['Host', $next->meta['host'] ?? 'TBCA Team']]) : null,
                Ui::quick('Quick Actions', [Ui::modal('Book a Meeting', 'book'), Ui::action('Request Consultation', '/portal/intake'), Ui::action('Download Calendar (ICS)', '/portal/meetings/calendar.ics', 'get', ['download' => true])]),
            ])),
            'forms' => [
                'book' => Ui::form('Book a Meeting', '/bookings', [
                    Ui::field('topic', 'Subject', 'text', ['required' => true]), Ui::field('type', 'Meeting type', 'select', ['value' => 'advisor-session', 'options' => Ui::options(['advisor-session' => 'Advisor Session', 'consultation' => 'Consultation', 'project-kickoff' => 'Project Kick-off', 'discovery-call' => 'Discovery Call'])]),
                    Ui::field('date', 'Date', 'date', ['required' => true]), Ui::field('time', 'Time', 'select', ['required' => true, 'options' => Ui::options(['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'])]),
                    Ui::field('channel', 'Channel', 'select', ['value' => 'video', 'options' => Ui::options(['video' => 'Video', 'phone' => 'Phone', 'in-person' => 'In-person'])]),
                    Ui::field('name', 'name', 'hidden', ['value' => $user->name]), Ui::field('email', 'email', 'hidden', ['value' => $user->email]), Ui::field('company', 'company', 'hidden', ['value' => $user->company]), Ui::field('redirect', 'redirect', 'hidden', ['value' => '/portal/meetings']),
                ], 'Book Meeting', 'post', 'Double-booked slots are rejected automatically.'),
                'reschedule' => Ui::form('Reschedule Meeting', '/portal/meetings/reschedule', [Ui::field('booking', 'booking', 'hidden'), Ui::field('date', 'New date', 'date', ['required' => true]), Ui::field('time', 'New time', 'select', ['required' => true, 'options' => Ui::options(['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'])])], 'Reschedule'),
            ],
        ]);
    }

    private function booking(string $ref): Booking
    {
        $b = Booking::where('reference', $ref)->firstOrFail();
        $this->ownOrFail($b);

        return $b;
    }

    public function cancelMeeting(string $booking): RedirectResponse
    {
        $this->booking($booking)->update(['status' => 'cancelled']);

        return back()->with('success', 'Meeting cancelled.');
    }

    public function rescheduleMeeting(Request $request, string $booking): RedirectResponse
    {
        $ref = $booking === 'reschedule' ? (string) $request->input('booking') : $booking;
        $b = $this->booking($ref);
        $d = $request->validate(['date' => 'required|date|after_or_equal:today', 'time' => 'required|date_format:H:i']);
        $start = \Illuminate\Support\Carbon::parse($d['date'].' '.$d['time']);
        abort_if(Booking::where('id', '!=', $b->id)->where('starts_at', $start)->where('status', '!=', 'cancelled')->exists(), 422, 'That slot is already taken. Please choose another time.');
        $b->update(['starts_at' => $start, 'status' => 'rescheduled']);

        return back()->with('success', 'Meeting rescheduled to '.$start->format('d M Y, H:i').'.');
    }

    public function calendar()
    {
        $lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TBCA//Client Portal//EN'];
        foreach (Booking::where('user_id', $this->user()->id)->where('status', '!=', 'cancelled')->where('starts_at', '>=', now())->get() as $b) {
            $lines = array_merge($lines, ['BEGIN:VEVENT', 'UID:'.$b->reference.'@thebusinessclinic.africa', 'DTSTART:'.$b->starts_at->utc()->format('Ymd\THis\Z'), 'DTEND:'.$b->starts_at->copy()->addMinutes($b->duration_minutes)->utc()->format('Ymd\THis\Z'), 'SUMMARY:'.($b->topic ?? 'TBCA meeting'), 'END:VEVENT']);
        }
        $lines[] = 'END:VCALENDAR';

        return response(implode("\r\n", $lines), 200, ['Content-Type' => 'text/calendar', 'Content-Disposition' => 'attachment; filename="tbca-meetings.ics"']);
    }

    public function closure(Request $request): Response
    {
        $projects = $this->projectsQuery()->get();
        $p = $projects->firstWhere('reference', $request->query('project')) ?? $projects->sortByDesc('progress')->first();
        $stage = (int) ($p->meta['closure'] ?? 5);
        $stages = [['Deliverables Finalised', 'All deliverables are approved, accepted and released.', 'TBCA Advisory Team'], ['Client Acceptances', 'All client acceptances recorded and no pending revisions.', 'Client'], ['Financial Settlement', 'All invoices settled or payment plans in place.', 'Finance Team'], ['Disputes Resolution', 'No open disputes on this engagement.', 'Client Success'], ['Handover Preparation', 'Documents, data and assets compiled for handover.', 'Project Manager'], ['Client Handover Review', 'Client review and confirmation of handover items.', 'Client'], ['Closure Documentation', 'Closure report and final documentation issued.', 'Project Manager'], ['Engagement Closed', 'Engagement closed and evidence preserved.', 'System']];
        $docs = Document::where('project_id', $p->id)->where('is_folder', false)->count();

        return $this->register([
            'title' => 'Completion, Closure & Handover', 'icon' => 'flag', 'subtitle' => 'Close an engagement properly: acceptances, settlement, handover and a durable closure record.',
            'filters' => [Ui::selectFilter('project', 'Engagement', $projects->mapWithKeys(fn ($x) => [$x->reference => $x->name])->all())],
            'kpis' => [Ui::kpi('Closure Progress', round(($stage) / 8 * 100).'%', $stage.' of 8 stages completed', 'gold', 'flag'), Ui::kpi('Pending Actions', max(0, 8 - $stage), null, 'warn', 'list-checks'), Ui::kpi('Handover Items Ready', $docs, 'Available for download', 'good', 'download'), Ui::kpi('Engagement', $p->name, $p->reference, 'neutral', 'folder-kanban'), Ui::kpi('Target Closure Date', Ui::date($p->due_on), null, 'neutral', 'calendar')],
            'main' => [Ui::table('Closure Checklist', ['#', 'Stage', 'Description', 'Owner', 'Status', ''], collect($stages)->map(fn ($s, $i) => [
                $i + 1, $s[0], $s[1], $s[2], Ui::pill($i < $stage ? 'completed' : ($i === $stage ? 'pending' : 'not started')),
                Ui::actions([$i === $stage && $s[2] === 'Client' ? Ui::action('Confirm', '/portal/closure/'.$p->reference.'/confirm', 'post', ['variant' => 'gold', 'confirm' => 'Confirm you have reviewed the handover items?']) : null]),
            ])->all())],
            'side' => [Ui::kv('Handover Summary', [['Documents', $docs.' ready for download'], ['Data Exports', 'Available via Portability & Export'], ['Access Returned', 'On closure']], Ui::action('Export All Deliverables', '/portal/exports')), Ui::info('Durable closure record', 'Closure produces a receipt and preserves your lawful retained rights to deliverables and evidence.', 'info')],
        ]);
    }

    public function confirmClosure(Project $project): RedirectResponse
    {
        $this->ownOrFail($project);
        $meta = $project->meta;
        $meta['closure'] = min(8, (int) ($meta['closure'] ?? 5) + 1);
        $project->update(['meta' => $meta]);

        return back()->with('success', 'Handover review confirmed. TBCA will issue the closure documentation.');
    }
}
