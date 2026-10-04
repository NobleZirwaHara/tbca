<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\PortalCase;
use App\Models\Portal\Record;
use App\Models\Portal\Ticket;
use App\Models\Portal\TicketMessage;
use App\Support\Portal\Natasha;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-071/078/079/130/131. Mixed into SupportController. */
trait SupportExtras
{
    public const HANDOFF_TEAMS = ['general' => ['General Enquiry', 'Client Support Team'], 'advisory' => ['Project Advisory', 'Project Advisory Team'], 'marketplace' => ['Marketplace', 'Marketplace Support'], 'technical' => ['Technical Issue', 'Technology Solutions'], 'complaints' => ['Complaints', 'Complaints & Recovery']];

    public function whatsapp(): Response
    {
        $w = array_merge(Portal::defaultPreferences()['whatsapp'], $this->account()->preferences['whatsapp'] ?? []);
        $handoffs = PortalCase::where('user_id', $this->user()->id)->where('kind', 'whatsapp_handoff')->latest()->take(6)->get();
        $yes = fn ($b) => $b ? 'On' : 'Off';

        return $this->register([
            'title' => 'WhatsApp Preferences and Secure Handoffs', 'icon' => 'message-circle', 'subtitle' => 'Manage your WhatsApp communication preferences, security settings and handoffs to the right team — all in one place.',
            'kpis' => [Ui::kpi('WhatsApp Number', $w['number'] ?: ($this->user()->phone ?? 'Not set'), $w['number'] || $this->user()->phone ? 'Verified · Linked to your account' : 'Add a number', 'good', 'message-circle'), Ui::kpi('Message Notifications', $yes($w['notifications']), null, 'neutral', 'bell'), Ui::kpi('Secure Messaging', $yes($w['secure']), 'End-to-end encrypted (WhatsApp Business)', 'good', 'lock'), Ui::kpi('Handoffs', $handoffs->count(), 'Routed this month', 'info', 'route')],
            'main' => [
                ['kind' => 'form', 'title' => 'WhatsApp Preferences', 'form' => Ui::form('WhatsApp', '/portal/whatsapp', [
                    Ui::field('number', 'WhatsApp number', 'text', ['value' => $w['number'] ?: $this->user()->phone]),
                    Ui::field('topics', 'Control how we contact you and what you receive', 'checkboxes', ['value' => array_keys(array_filter(array_intersect_key($w, array_flip(['general', 'projects', 'marketing', 'reminders', 'support'])))), 'options' => [['value' => 'general', 'label' => 'General Communications', 'hint' => 'Updates, news, platform changes and service announcements'], ['value' => 'projects', 'label' => 'Project Updates', 'hint' => 'Milestones, deliverables and action items'], ['value' => 'marketing', 'label' => 'Marketing & Insights', 'hint' => 'Relevant offers, events and thought leadership (optional)'], ['value' => 'reminders', 'label' => 'Reminders & Follow-ups', 'hint' => 'Meetings, tasks and outstanding actions'], ['value' => 'support', 'label' => 'WhatsApp Support', 'hint' => 'Direct access to support and helpdesk']]]),
                    Ui::field('notifications', 'Message notifications', 'checkbox', ['value' => (bool) $w['notifications']]), Ui::field('secure', 'Secure messaging', 'checkbox', ['value' => (bool) $w['secure']]),
                ], 'Save Preferences', 'put')],
                Ui::table('Recent Handoffs', ['Reference', 'Route', 'Team', 'Status', 'When'], $handoffs->map(fn ($h) => [Ui::ref($h->reference), $h->title, $h->payload['team'] ?? '', Ui::pill($h->status), $h->created_at->diffForHumans()])->all(), ['empty' => 'No handoffs yet.']),
            ],
            'side' => [
                Ui::cards('Secure Handoffs', collect(self::HANDOFF_TEAMS)->map(fn ($t, $k) => Ui::card($t[0], 'Routing to '.$t[1], 'Active', null, 'route', 'good', [Ui::modal('Request handoff', 'handoff', ['data' => ['route' => $k]])]))->values()->all(), 2),
                Ui::info('Your Privacy Matters', 'We only use WhatsApp for authorised communications related to your account. High-risk approvals are never accepted through WhatsApp alone.', 'info'),
            ],
            'forms' => ['handoff' => Ui::form('Request a Secure Handoff', '/portal/whatsapp/handoff', [Ui::field('route', 'Route to', 'select', ['required' => true, 'options' => collect(self::HANDOFF_TEAMS)->map(fn ($t, $k) => ['value' => $k, 'label' => $t[0].' → '.$t[1]])->values()->all()]), Ui::field('message', 'Message', 'textarea', ['required' => true])], 'Send Handoff', 'post', 'All handoffs are logged, tracked and secured. You will receive a confirmation once routed.')],
        ]);
    }

    public function updateWhatsapp(Request $request): RedirectResponse
    {
        $d = $request->validate(['number' => 'nullable|string|max:30', 'topics' => 'array', 'notifications' => 'boolean', 'secure' => 'boolean']);
        $prefs = ['number' => $d['number'] ?? null, 'notifications' => (bool) ($d['notifications'] ?? false), 'secure' => (bool) ($d['secure'] ?? false)];
        foreach (['general', 'projects', 'marketing', 'reminders', 'support'] as $t) {
            $prefs[$t] = in_array($t, $d['topics'] ?? [], true);
        }
        Portal::setPref($this->user(), 'whatsapp', $prefs);
        Portal::setPref($this->user(), 'channels.whatsapp', $prefs['notifications']);
        \App\Models\Portal\Consent::where('user_id', $this->user()->id)->where('key', 'whatsapp')->update($prefs['notifications'] ? ['status' => 'active', 'given_at' => now()] : ['status' => 'withdrawn', 'withdrawn_at' => now()]);

        return back()->with('success', 'WhatsApp preferences saved.');
    }

    public function whatsappHandoff(Request $request): RedirectResponse
    {
        $d = $request->validate(['route' => 'required|in:'.implode(',', array_keys(self::HANDOFF_TEAMS)), 'message' => 'required|string|max:2000']);
        [$label, $team] = self::HANDOFF_TEAMS[$d['route']];
        $ref = 'HND-'.now()->format('Ymd').'-'.random_int(100, 999);
        PortalCase::create(['user_id' => $this->user()->id, 'kind' => 'whatsapp_handoff', 'reference' => $ref, 'title' => $label, 'status' => 'routed', 'payload' => ['team' => $team, 'message' => $d['message'], 'channel' => 'WhatsApp'], 'submitted_at' => now(), 'step' => 99]);

        return back()->with('success', "Handoff {$ref} routed to {$team}.");
    }

    public function handoff(): Response
    {
        $handoffs = Ticket::where('user_id', $this->user()->id)->whereIn('source', ['natasha', 'escalation'])->latest()->get();

        return $this->register([
            'title' => 'Human Handoff and Escalation', 'icon' => 'user-round', 'subtitle' => 'Transfer your query to a human agent or escalate for priority support.',
            'kpis' => [Ui::kpi('Pending Handovers', $handoffs->whereIn('status', ['open', 'in_progress'])->count(), 'Awaiting agent', 'warn', 'user-round'), Ui::kpi('Avg. Handoff Time', '3m 24s', 'This month', 'neutral', 'history'), Ui::kpi('Resolved by Humans', $handoffs->whereIn('status', ['resolved', 'closed'])->count(), null, 'good', 'badge-check'), Ui::kpi('Escalations', $handoffs->where('escalation_level', '>', 0)->count(), null, 'bad', 'trending-up')],
            'main' => [
                ['kind' => 'form', 'title' => '1. Request Human Handoff', 'form' => Ui::form('Handoff', '/portal/natasha/handoff', [
                    Ui::field('subject', 'Subject', 'select', ['required' => true, 'options' => Ui::options(['Billing & Payments', 'Projects & Deliverables', 'Access & Security', 'Documents', 'Privacy & Data', 'Other'])]),
                    Ui::field('priority', 'Priority', 'select', ['required' => true, 'value' => 'medium', 'options' => Ui::options(['low' => 'Low', 'medium' => 'Medium', 'high' => 'High'])]),
                    Ui::field('body', 'Detailed description', 'textarea', ['required' => true]),
                    Ui::field('channel', 'Preferred channel', 'radio', ['required' => true, 'value' => 'Portal Message', 'options' => [['value' => 'Portal Message', 'label' => 'Portal Message'], ['value' => 'Email', 'label' => 'Email'], ['value' => 'Phone Call', 'label' => 'Phone Call']]]),
                    Ui::field('escalate', 'Escalate as urgent (mark high priority)', 'checkbox'),
                ], 'Request Handoff')],
                Ui::table('Handoff History', ['Ticket', 'Subject', 'Priority', 'Status', 'When'], $handoffs->map(fn ($t) => [Ui::ref($t->reference, '/portal/support/'.$t->reference), $t->subject, Ui::pill($t->priority), Ui::pill($t->status), $t->created_at->diffForHumans()])->all()),
            ],
            'side' => [Ui::timeline('2. What Happens Next?', [['title' => 'Assigned to Agent', 'sub' => 'Your request is assigned to the best available support agent.'], ['title' => 'Agent Will Contact You', 'sub' => 'Via your preferred channel.'], ['title' => 'Issue Resolution', 'sub' => 'Our agent works with you until your issue is resolved.']]), Ui::kv('Support Availability', [['Status', Ui::pill('We\'re Online', 'good')], ['Operating Hours', 'Mon – Fri 08:00 – 18:00 (SAST)']])],
        ]);
    }

    public function storeHandoff(Request $request): RedirectResponse
    {
        $d = $request->validate(['subject' => 'required|string|max:120', 'priority' => 'required|in:low,medium,high', 'body' => 'required|string|max:5000', 'channel' => 'required|string|max:40', 'escalate' => 'boolean']);
        $t = SupportController::createTicket($this->user(), ['subject' => $d['subject'], 'priority' => ! empty($d['escalate']) ? 'high' : $d['priority'], 'body' => $d['body'], 'category' => 'General', 'channel' => $d['channel'], 'area' => 'NATASHA handoff'], 'natasha');
        if (! empty($d['escalate'])) {
            $t->update(['escalation_level' => 1]);
        }

        return redirect('/portal/support/'.$t->reference)->with('success', 'A human agent will take over. Reference '.$t->reference.'.');
    }

    public function status(): Response
    {
        $incidents = Record::whereNull('user_id')->where('register', 'incident')->orderBy('sort')->get();
        $active = $incidents->whereNotIn('status', ['resolved']);
        $maint = Record::whereNull('user_id')->where('register', 'maintenance')->where('status', 'upcoming')->get();
        $systems = ['Client Portal' => 'Client Portal', 'NATASHA Assistant' => 'NATASHA', 'Documents & Files' => 'Documents & Files', 'Payments' => 'Payment Gateway', 'WhatsApp Comms' => 'WhatsApp', 'Integrations' => 'CRM (Zoho)', 'Reports & Dashboards' => 'Reports & Dashboards', 'API Services' => 'Marketplace'];

        return $this->register([
            'title' => 'System Status and Incident Notices', 'icon' => 'activity', 'subtitle' => 'Real-time system status, incident updates, and maintenance notices to keep you informed.',
            'banner' => $active->isEmpty() ? ['tone' => 'good', 'title' => 'All Systems Operational', 'body' => 'All platforms and services are running normally.', 'meta' => 'Last updated: '.now()->format('d M Y, H:i').' (SAST)'] : ['tone' => 'warn', 'title' => $active->count().' active incident(s)', 'body' => 'Some services are degraded. Our team is working on it.', 'meta' => 'Last updated: '.now()->format('d M Y, H:i')],
            'main' => [
                Ui::cards('System Status Overview', collect($systems)->map(fn ($sys, $label) => ($inc = $active->firstWhere('data.system', $sys)) ? Ui::card($label, ucfirst($inc->data['severity']).' incident: '.$inc->title, 'Degraded', null, 'activity', 'warn') : Ui::card($label, 'Operational', '100% uptime (30 days)', null, 'badge-check', 'good'))->values()->all(), 4),
                Ui::table('Recent Incident History', ['Incident', 'System', 'Status', 'Severity', 'Started', 'Duration'], $incidents->map(fn ($i) => [$i->title, $i->data['system'] ?? '', Ui::pill($i->status), Ui::pill($i->data['severity'] ?? ''), Ui::date($i->data['opened'] ?? null, 'd M Y, H:i'), ($i->data['minutes'] ?? 0) >= 60 ? intdiv($i->data['minutes'], 60).'h '.($i->data['minutes'] % 60).'m' : ($i->data['minutes'] ?? 0).'m'])->all()),
            ],
            'side' => [Ui::list('Active Incidents', $active->map(fn ($i) => Ui::item($i->title, ucfirst($i->status), $i->data['system'] ?? '', 'warn'))->values()->all()), Ui::list('Scheduled Maintenance', $maint->map(fn ($m) => Ui::item($m->title, 'Upcoming', Ui::date($m->due_on).' · '.($m->data['window'] ?? ''), 'info'))->all())],
        ]);
    }

    public function escalations(): Response
    {
        $tickets = Ticket::where('user_id', $this->user()->id)->where('escalation_level', '>', 0)->latest('updated_at')->get();
        $open = Ticket::where('user_id', $this->user()->id)->whereNotIn('status', ['resolved', 'closed'])->get();

        return $this->register([
            'title' => 'Escalation Ladder', 'icon' => 'trending-up', 'code' => 'CP-SCR-130', 'subtitle' => 'A clear, time-bound escalation path to the right people with full visibility and accountability.',
            'actions' => [Ui::modal('Raise Escalation', 'escalate', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Active Escalations', $tickets->whereNotIn('status', ['resolved', 'closed'])->count(), 'Across all levels', 'warn', 'trending-up'), Ui::kpi('SLA Breaches', $open->filter(fn ($t) => $t->sla_due_at?->isPast())->count(), 'Require attention', 'bad', 'alert-triangle'), Ui::kpi('Resolved', $tickets->whereIn('status', ['resolved', 'closed'])->count(), null, 'good', 'badge-check'), Ui::kpi('Top Category', $tickets->groupBy('category')->sortByDesc(fn ($g) => $g->count())->keys()->first() ?? '—', null, 'neutral', 'flag')],
            'main' => [
                Ui::table('Escalation Path & Responsibilities', ['Level', 'Who', 'Role / Team', 'Target Response', 'Target Resolution', 'Escalates To', 'Typical Reasons'], array_map(fn ($l) => [Ui::pill($l[0], 'gold'), Ui::stack($l[1], $l[2]), $l[3], $l[4], $l[5], $l[6], $l[7]], Natasha::LADDER)),
                Ui::table('My Escalations', ['Ticket', 'Subject', 'Level', 'Status', 'Next Response'], $tickets->map(fn ($t) => [Ui::ref($t->reference, '/portal/support/'.$t->reference), $t->subject, Ui::pill('L'.$t->escalation_level, 'warn'), Ui::pill($t->status), $t->sla_due_at?->diffForHumans()])->all(), ['empty' => 'You have no escalated tickets.']),
            ],
            'side' => [Ui::donut('Escalation Overview', collect(range(0, 4))->map(fn ($l) => Ui::slice('L'.$l, Ticket::where('user_id', $this->user()->id)->where('escalation_level', $l)->whereNotIn('status', ['resolved', 'closed'])->count(), ['good', 'info', 'gold', 'bad', 'purple'][$l]))->all())],
            'forms' => ['escalate' => Ui::form('Raise Escalation', '/portal/escalations', [Ui::field('ticket', 'Ticket to escalate', 'select', ['required' => true, 'options' => $open->map(fn ($t) => ['value' => $t->reference, 'label' => $t->reference.' – '.$t->subject.' (L'.$t->escalation_level.')'])->values()->all()]), Ui::field('reason', 'Reason for escalation', 'textarea', ['required' => true])], 'Escalate')],
        ]);
    }

    public function raiseEscalation(Request $request): RedirectResponse
    {
        $d = $request->validate(['ticket' => 'required|string', 'reason' => 'required|string|max:1000']);
        $t = Ticket::where('user_id', $this->user()->id)->where('reference', $d['ticket'])->firstOrFail();

        return $this->escalate($request, $t);
    }

    public function feedback(): Response
    {
        $all = PortalCase::where('user_id', $this->user()->id)->where('kind', 'feedback')->latest('submitted_at')->get();
        $types = ['general' => ['General Feedback', 'Share your experience or comments'], 'suggestion' => ['Suggestions', 'Ideas to help us serve you better'], 'issue' => ['Report an Issue', 'Something not working as expected'], 'compliment' => ['Compliment', 'Recognise great service or people'], 'information' => ['Request Information', 'Ask for information or clarification']];

        return $this->register([
            'title' => 'Feedback and Voice of Client', 'icon' => 'message-square-heart', 'code' => 'CP-SCR-131', 'subtitle' => 'Share your feedback, ideas, compliments or concerns. Your voice helps us build a better TBCA.',
            'actions' => [Ui::modal('New Feedback', 'feedback', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Feedback', $all->count(), 'Across all channels', 'neutral', 'message-square'), Ui::kpi('Compliments', $all->where('payload.type', 'compliment')->count(), null, 'good', 'sparkles'), Ui::kpi('Suggestions', $all->where('payload.type', 'suggestion')->count(), null, 'info', 'route'), Ui::kpi('Concerns / Issues', $all->where('payload.type', 'issue')->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Resolved', $all->where('status', 'resolved')->count(), Ui::pct($all->where('status', 'resolved')->count(), max(1, $all->count())).' resolution rate', 'good', 'badge-check')],
            'main' => [
                Ui::cards('Share Your Feedback', collect($types)->map(fn ($t, $k) => Ui::card($t[0], $t[1], null, null, 'message-square-heart', null, [Ui::modal('Start', 'feedback', ['data' => ['type' => $k]])]))->values()->all(), 5),
                Ui::table('Recent Feedback', ['ID', 'Type', 'Subject', 'Category', 'Status', 'Priority', 'Submitted On'], $all->map(fn ($f) => [Ui::ref($f->reference), ucfirst($f->payload['type'] ?? ''), $f->title, $f->payload['category'] ?? '', Ui::pill($f->status), Ui::pill($f->priority ?? 'low'), Ui::date($f->submitted_at, 'd M Y, H:i')])->all()),
            ],
            'side' => [Ui::donut('Feedback Overview', [Ui::slice('Positive', $all->where('payload.type', 'compliment')->count(), 'good'), Ui::slice('Suggestions', $all->where('payload.type', 'suggestion')->count(), 'info'), Ui::slice('Concerns', $all->where('payload.type', 'issue')->count(), 'bad')]), Ui::info('Confidential', 'All feedback is confidential and managed under our Privacy Policy.', 'neutral')],
            'forms' => ['feedback' => Ui::form('Share Your Feedback', '/portal/feedback', [
                Ui::field('type', 'Type', 'select', ['required' => true, 'options' => collect($types)->map(fn ($t, $k) => ['value' => $k, 'label' => $t[0]])->values()->all()]),
                Ui::field('category', 'Category', 'select', ['required' => true, 'options' => Ui::options(['Service Quality', 'System Performance', 'Feature Requests', 'Communication', 'Billing & Payments', 'Other'])]),
                Ui::field('subject', 'Subject', 'text', ['required' => true]), Ui::field('rating', 'Overall rating (1–5)', 'select', ['options' => Ui::options(['5', '4', '3', '2', '1'])]),
                Ui::field('body', 'Your feedback', 'textarea', ['required' => true]),
            ], 'Submit Feedback')],
        ]);
    }

    public function storeFeedback(Request $request): RedirectResponse
    {
        $d = $request->validate(['type' => 'required|in:general,suggestion,issue,compliment,information', 'category' => 'required|string|max:60', 'subject' => 'required|string|max:160', 'rating' => 'nullable|integer|min:1|max:5', 'body' => 'required|string|max:3000']);
        $ref = 'FB-'.now()->format('Y').'-'.(PortalCase::where('kind', 'feedback')->count() + 157);
        PortalCase::create(['user_id' => $this->user()->id, 'kind' => 'feedback', 'reference' => $ref, 'title' => $d['subject'], 'status' => 'submitted', 'priority' => $d['type'] === 'issue' ? 'high' : 'low', 'payload' => $d, 'submitted_at' => now(), 'step' => 99]);

        return back()->with('success', "Thank you — feedback {$ref} received.");
    }
}
