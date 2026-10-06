<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\Message;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Record;
use App\Models\Portal\Thread;
use App\Models\Portal\Ticket;
use App\Models\Portal\TicketMessage;
use App\Support\Portal\Catalogue;
use App\Support\Portal\Natasha;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** CP-SCR-070..079, 130, 131: messages, WhatsApp, tickets, KAREN, handoff, help, status, escalations, feedback. */
class SupportController extends PortalController
{
    use SupportExtras;

    public function messages(Request $request): Response
    {
        $user = $this->user();
        $threads = Thread::where('user_id', $user->id)->orderByDesc('pinned')->orderByDesc('last_activity_at')->get();
        $active = $threads->firstWhere('id', (int) $request->query('thread')) ?? $threads->first();
        if ($active && $active->unread) {
            $active->update(['unread' => 0]);
        }

        return Inertia::render('Portal/Messages', [
            'threads' => $threads->map(fn ($t) => ['id' => $t->id, 'title' => $t->title, 'preview' => optional($t->messages()->latest()->first())->body, 'at' => $t->last_activity_at?->diffForHumans(), 'unread' => $t->id === $active?->id ? 0 : $t->unread, 'pinned' => $t->pinned])->values(),
            'active' => $active ? [
                'id' => $active->id, 'title' => $active->title, 'reference' => $active->reference, 'purpose' => $active->purpose, 'project' => $active->project_name, 'owner' => $active->owner,
                'classification' => $active->classification, 'status' => $active->status, 'pinned' => $active->pinned, 'participants' => $active->participants ?? [], 'started' => $active->created_at->format('d M Y'),
                'messages' => $active->messages()->oldest()->get()->map(fn ($m) => ['id' => $m->id, 'author' => $m->author_name, 'role' => $m->author_role, 'mine' => $m->is_mine, 'kind' => $m->kind, 'body' => $m->body, 'attachments' => $m->attachments ?? [], 'at' => $m->created_at->format('d M, H:i')])->values(),
            ] : null,
        ]);
    }

    public function newThread(Request $request): RedirectResponse
    {
        $d = $request->validate(['title' => 'required|string|max:160', 'body' => 'required|string|max:5000']);
        $t = Thread::create(['user_id' => $this->user()->id, 'reference' => 'MSG-'.now()->format('Y').'-'.random_int(10000, 99999), 'title' => $d['title'], 'purpose' => 'Client enquiry', 'owner' => 'TBCA Client Success', 'participants' => [$this->user()->name, 'TBCA Client Success'], 'last_activity_at' => now()]);
        Message::create(['thread_id' => $t->id, 'author_name' => $this->user()->name.' (You)', 'is_mine' => true, 'body' => $d['body']]);

        return redirect('/portal/messages?thread='.$t->id)->with('success', 'Secure message sent.');
    }

    public function reply(Request $request, Thread $thread): RedirectResponse
    {
        $this->ownOrFail($thread);
        $d = $request->validate(['body' => 'required|string|max:5000', 'kind' => 'nullable|in:reply,note', 'file' => 'nullable|file|max:25600|mimes:'.DocumentController::MIMES]);
        $att = null;
        if ($request->hasFile('file')) {
            $doc = DocumentController::storeUpload($request->file('file'), $this->user(), ['doc_type' => 'Attachment', 'tags' => ['Message']]);
            $att = [['name' => $doc->name, 'size' => number_format($doc->size_bytes / 1024).' KB', 'href' => '/portal/documents/'.$doc->id]];
        }
        Message::create(['thread_id' => $thread->id, 'author_name' => $this->user()->name.' (You)', 'is_mine' => true, 'kind' => $d['kind'] ?? 'reply', 'body' => $d['body'], 'attachments' => $att]);
        $thread->update(['last_activity_at' => now()]);

        return back()->with('success', ($d['kind'] ?? 'reply') === 'note' ? 'Internal note saved (visible to your organisation only).' : 'Sent securely.');
    }

    public function tickets(Request $request): Response
    {
        $all = Ticket::where('user_id', $this->user()->id)->latest('updated_at')->get();
        $rows = Ui::filter($all, $request, ['reference', 'subject', 'area'], ['status' => 'status', 'category' => 'category', 'priority' => 'priority']);
        $page = Ui::page($rows, $request, 10);
        $responded = $all->filter(fn ($t) => $t->first_response_at);
        $avg = $responded->count() ? (int) round($responded->avg(fn ($t) => $t->created_at->diffInMinutes($t->first_response_at, true))) : 0;

        return $this->register([
            'title' => 'Support Tickets', 'icon' => 'life-buoy', 'subtitle' => 'Track and manage all your support requests. Our team is here to help.',
            'actions' => [Ui::modal('New Support Ticket', 'ticket', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('All Tickets', $all->count(), null, 'neutral', 'life-buoy'), Ui::kpi('Open', $all->where('status', 'open')->count(), 'Requires attention', 'warn', 'inbox'), Ui::kpi('In Progress', $all->where('status', 'in_progress')->count(), 'Being resolved', 'info', 'history'), Ui::kpi('On Hold', $all->where('status', 'on_hold')->count(), 'Waiting for your input', 'warn', 'circle-pause'), Ui::kpi('Resolved', $all->whereIn('status', ['resolved', 'closed'])->count(), null, 'good', 'badge-check'), Ui::kpi('Avg. Response Time', intdiv($avg, 60).'h '.($avg % 60).'m', 'First response', 'neutral', 'history')],
            'search' => 'Search tickets…',
            'filters' => [Ui::selectFilter('status', 'Status', ['open' => 'Open', 'in_progress' => 'In Progress', 'on_hold' => 'On Hold', 'resolved' => 'Resolved', 'closed' => 'Closed']), Ui::selectFilter('category', 'Category', ['Technical', 'Billing', 'Access', 'Communication', 'General', 'Account']), Ui::selectFilter('priority', 'Priority', ['critical' => 'Critical', 'high' => 'High', 'medium' => 'Medium', 'low' => 'Low'])],
            'main' => [Ui::table(null, ['Ticket ID', 'Subject', 'Category', 'Priority', 'Status', 'SLA / Next Response', 'Last Updated'], $page['items']->map(fn ($t) => [
                Ui::ref($t->reference, '/portal/support/'.$t->reference), Ui::stack($t->subject, $t->area, '/portal/support/'.$t->reference), $t->category, Ui::pill($t->priority), Ui::pill($t->status),
                in_array($t->status, ['resolved', 'closed'], true) ? '—' : ($t->sla_due_at?->isPast() ? Ui::pill('Breached', 'bad') : $t->sla_due_at?->diffForHumans()), $t->updated_at->format('d M Y, H:i'),
            ])->all(), ['pagination' => $page['pagination']])],
            'side' => [Ui::quick('Quick Actions', [Ui::modal('Create New Ticket', 'ticket'), Ui::action('View Knowledge Base', '/portal/help'), Ui::action('System Status', '/portal/status'), Ui::action('Escalation Ladder', '/portal/escalations')]), Ui::list('Top Categories', $all->groupBy('category')->map(fn ($g, $k) => Ui::item($k, (string) $g->count()))->values()->all())],
            'forms' => ['ticket' => $this->ticketForm()],
        ]);
    }

    private function ticketForm(): array
    {
        return Ui::form('New Support Ticket', '/portal/support', [
            Ui::field('subject', 'Subject', 'text', ['required' => true]),
            Ui::field('category', 'Category', 'select', ['required' => true, 'options' => Ui::options(['Technical', 'Billing', 'Access', 'Communication', 'General', 'Account'])]),
            Ui::field('priority', 'Priority', 'select', ['required' => true, 'value' => 'medium', 'options' => Ui::options(['low' => 'Low', 'medium' => 'Medium', 'high' => 'High', 'critical' => 'Critical'])]),
            Ui::field('area', 'Affected area (optional)', 'text', ['placeholder' => 'e.g. Document Vault']),
            Ui::field('body', 'Describe the issue', 'textarea', ['required' => true]),
            Ui::field('file', 'Attachment (optional, max 25 MB)', 'file'),
        ], 'Submit Ticket', 'post', 'Response targets: Critical 1h · High 4h · Medium 8h · Low 24h.');
    }

    public static function createTicket($user, array $d, string $source = 'portal', ?array $attachments = null): Ticket
    {
        $prio = $d['priority'] ?? 'medium';
        $t = Ticket::create(['user_id' => $user->id, 'reference' => 'TKT-'.now()->format('Y').'-'.str_pad((string) (Ticket::count() + 725), 4, '0', STR_PAD_LEFT), 'subject' => $d['subject'], 'area' => $d['area'] ?? null, 'category' => $d['category'] ?? 'General', 'priority' => $prio, 'status' => 'open', 'source' => $source, 'sla_due_at' => now()->addHours(Natasha::SLA_HOURS[$prio] ?? 8), 'preferred_channel' => $d['channel'] ?? 'Portal Messages & Email']);
        TicketMessage::create(['ticket_id' => $t->id, 'author_name' => $user->name, 'author_role' => 'Requestor', 'body' => $d['body'], 'attachments' => $attachments]);
        TicketMessage::create(['ticket_id' => $t->id, 'author_name' => 'System Update', 'author_role' => 'System', 'is_staff' => true, 'kind' => 'system', 'body' => 'Ticket created via '.$source.'. Assigned to TBCA Support Team. Next response due by '.$t->sla_due_at->format('d M Y, H:i').'.']);
        Portal::notify($user, 'Ticket '.$t->reference.' created', $t->subject, 'system', '/portal/support/'.$t->reference, 'Support', 'System');

        return $t;
    }

    public function storeTicket(Request $request): RedirectResponse
    {
        $d = $request->validate(['subject' => 'required|string|max:160', 'category' => 'required|string|max:40', 'priority' => 'required|in:low,medium,high,critical', 'area' => 'nullable|string|max:120', 'body' => 'required|string|max:5000', 'file' => 'nullable|file|max:25600|mimes:'.DocumentController::MIMES]);
        $att = null;
        if ($request->hasFile('file')) {
            $doc = DocumentController::storeUpload($request->file('file'), $this->user(), ['doc_type' => 'Attachment', 'tags' => ['Support']]);
            $att = [['name' => $doc->name, 'size' => number_format($doc->size_bytes / 1024).' KB', 'href' => '/portal/documents/'.$doc->id]];
        }
        $t = self::createTicket($this->user(), $d, 'portal', $att);

        return redirect('/portal/support/'.$t->reference)->with('success', 'Ticket '.$t->reference.' created.');
    }

    public function ticket(Ticket $ticket): Response
    {
        $this->ownOrFail($ticket);
        $level = Natasha::LADDER[min(4, $ticket->escalation_level)];

        return Inertia::render('Portal/Ticket', [
            'ticket' => [
                'reference' => $ticket->reference, 'subject' => $ticket->subject, 'status' => $ticket->status, 'priority' => $ticket->priority, 'category' => $ticket->category, 'area' => $ticket->area,
                'submitted' => $ticket->created_at->format('d M Y, H:i'), 'updated' => $ticket->updated_at->format('d M Y, H:i'), 'team' => $ticket->assigned_team, 'assignee' => $ticket->assignee,
                'sla' => in_array($ticket->status, ['resolved', 'closed'], true) ? null : ['due' => $ticket->sla_due_at?->format('d M Y, H:i'), 'in' => $ticket->sla_due_at?->diffForHumans(), 'breached' => (bool) $ticket->sla_due_at?->isPast()],
                'escalation' => ['level' => $level[0], 'who' => $level[1], 'target' => $level[4]], 'canEscalate' => $ticket->escalation_level < 4 && ! in_array($ticket->status, ['resolved', 'closed'], true),
                'channel' => $ticket->preferred_channel, 'project' => $ticket->related_project, 'source' => $ticket->source, 'requester' => $this->user()->name, 'organisation' => $this->org()->name,
                'messages' => $ticket->messages()->oldest()->get()->map(fn ($m) => ['id' => $m->id, 'author' => $m->author_name, 'role' => $m->author_role, 'staff' => $m->is_staff, 'kind' => $m->kind, 'body' => $m->body, 'attachments' => $m->attachments ?? [], 'at' => $m->created_at->format('d M Y, H:i')])->values(),
                'closed' => in_array($ticket->status, ['resolved', 'closed'], true),
            ],
        ]);
    }

    public function replyTicket(Request $request, Ticket $ticket): RedirectResponse
    {
        $this->ownOrFail($ticket);
        $d = $request->validate(['body' => 'required|string|max:5000', 'file' => 'nullable|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg']);
        $att = null;
        if ($request->hasFile('file')) {
            $doc = DocumentController::storeUpload($request->file('file'), $this->user(), ['doc_type' => 'Attachment', 'tags' => ['Support']]);
            $att = [['name' => $doc->name, 'size' => number_format($doc->size_bytes / 1024).' KB', 'href' => '/portal/documents/'.$doc->id]];
        }
        TicketMessage::create(['ticket_id' => $ticket->id, 'author_name' => $this->user()->name, 'author_role' => 'Requestor', 'body' => $d['body'], 'attachments' => $att]);
        $ticket->update(['status' => in_array($ticket->status, ['on_hold', 'resolved'], true) ? 'open' : $ticket->status, 'sla_due_at' => now()->addHours(Natasha::SLA_HOURS[$ticket->priority] ?? 8)]);

        return back()->with('success', 'Update sent to the support team.');
    }

    public function escalate(Request $request, Ticket $ticket): RedirectResponse
    {
        $this->ownOrFail($ticket);
        abort_if($ticket->escalation_level >= 4, 422, 'This ticket is already at the highest escalation level.');
        $d = $request->validate(['reason' => 'nullable|string|max:1000']);
        $ticket->update(['escalation_level' => $ticket->escalation_level + 1, 'priority' => $ticket->priority === 'low' ? 'medium' : ($ticket->priority === 'medium' ? 'high' : $ticket->priority)]);
        $lvl = Natasha::LADDER[$ticket->escalation_level];
        $ticket->update(['sla_due_at' => now()->addHours((int) $lvl[4])]);
        TicketMessage::create(['ticket_id' => $ticket->id, 'author_name' => 'System Update', 'author_role' => 'Escalation', 'is_staff' => true, 'kind' => 'system', 'body' => "Escalated to {$lvl[0]} – {$lvl[1]} ({$lvl[3]}). Target response {$lvl[4]}.".(! empty($d['reason']) ? ' Reason: '.$d['reason'] : '')]);

        return back()->with('success', "Escalated to {$lvl[0]} – {$lvl[1]}.");
    }

    public function closeTicket(Ticket $ticket): RedirectResponse
    {
        $this->ownOrFail($ticket);
        $ticket->update(['status' => 'closed', 'resolved_at' => now()]);
        TicketMessage::create(['ticket_id' => $ticket->id, 'author_name' => 'System Update', 'author_role' => 'System', 'is_staff' => true, 'kind' => 'system', 'body' => 'Ticket closed at the requester\'s request.']);

        return back()->with('success', 'Ticket closed. You can reopen it by sending an update.');
    }

    public function natasha(): Response
    {
        $log = Record::where('user_id', $this->user()->id)->where('register', 'natasha_log')->latest()->take(10)->get()->reverse()->values();

        return Inertia::render('Portal/Natasha', [
            'name' => explode(' ', $this->user()->name)[0],
            'disabled' => Natasha::killSwitchOn(),
            'conversation' => $log->map(fn ($r) => ['question' => $r->title, 'answer' => $r->data['answer'] ?? null, 'at' => $r->created_at->format('H:i')])->all(),
            'prompts' => ['Where is my invoice?', 'Track my task', 'How do I upload a document?', 'Explain my complaint status', 'Find a deliverable', 'Book human support'],
        ]);
    }

    public function ask(Request $request): RedirectResponse
    {
        $q = $request->validate(['question' => 'required|string|max:500'])['question'];
        if (Natasha::killSwitchOn()) {
            return back()->with('error', 'KAREN is temporarily unavailable. Please contact support.');
        }
        if (str_contains(mb_strtolower($q), 'human')) {
            return redirect('/portal/natasha/handoff');
        }
        Record::create(['user_id' => $this->user()->id, 'register' => 'natasha_log', 'title' => $q, 'status' => 'answered', 'data' => ['answer' => Natasha::answer($this->user(), $q)]]);

        return back();
    }

    public function help(Request $request): Response
    {
        $q = mb_strtolower(trim((string) $request->query('q', '')));
        $articles = collect(Catalogue::articles())->filter(fn ($a) => $q === '' || str_contains(mb_strtolower($a[0].' '.$a[1].' '.$a[2]), $q));
        $cats = collect(Catalogue::articles())->groupBy(2);

        return $this->register([
            'title' => 'Knowledge Base and Guided Help', 'icon' => 'book-open', 'subtitle' => 'Find answers, step-by-step guides, FAQs, and support resources to help you succeed on the TBCA Client Portal.',
            'search' => 'Search articles, guides, and topics…',
            'main' => [
                Ui::cards('Browse by Category', $cats->map(fn ($g, $k) => Ui::card($k, $g->count().' articles', null, '/portal/help?q='.urlencode($k), 'book-open'))->values()->all(), 4),
                Ui::table($q ? 'Search results' : 'Featured Articles', ['Article', 'Category', 'Read time', ''], $articles->map(fn ($a) => [Ui::stack($a[0], $a[1]), Ui::pill($a[2], 'gold'), $a[3].' min read', Ui::actions([Ui::action('Open', $a[4])])])->values()->all(), ['empty' => 'No articles match — try KAREN or contact support.']),
                Ui::info('Guided Help', 'Get step-by-step assistance for common tasks with KAREN, your client journey assistant.', 'gold', Ui::action('Start Guided Help', '/portal/natasha', 'get', ['variant' => 'gold'])),
            ],
            'side' => [Ui::quick('Need More Help?', [Ui::action('Contact Support', '/portal/support?new=1'), Ui::action('Live Chat (KAREN)', '/portal/natasha'), Ui::action('Book a Guided Session', '/portal/meetings'), Ui::action('Call Us: +27 60 801 1365', 'tel:+27608011365', 'get', ['external' => true])]), Ui::checklist('Quick Tips', [Ui::check('Use the search bar to quickly find what you need.'), Ui::check('Guided Help walks you through tasks step-by-step.'), Ui::check("Can't find an answer? Our support team is ready to help.")])],
        ]);
    }
}
