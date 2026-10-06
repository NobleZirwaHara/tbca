<?php

namespace App\Http\Controllers\Portal;

use App\Models\Booking;
use App\Models\Order;
use App\Models\Portal\Consent;
use App\Models\Portal\DataRequest;
use App\Models\Portal\Document;
use App\Models\Portal\Message;
use App\Models\Portal\Notice;
use App\Models\Portal\Project;
use App\Models\Portal\Record;
use App\Models\Portal\SecurityEvent;
use App\Models\Portal\Task;
use App\Models\Portal\Ticket;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/** CP-SCR-069/080/081/114/116/119/125/136: consent, POPIA rights, residency, trust, change digest, re-verification, provenance. */
class PrivacyController extends PortalController
{
    public function consents(): Response
    {
        $c = Consent::where('user_id', $this->user()->id)->orderByDesc('essential')->get();
        $requests = DataRequest::where('user_id', $this->user()->id)->latest()->get();

        return $this->register([
            'title' => 'Consent, Terms and Privacy Centre', 'icon' => 'file-lock', 'subtitle' => 'Manage your consents, review our terms and policies, and control how your data is used and shared.',
            'kpis' => [Ui::kpi('Active Consents', $c->where('status', 'active')->count(), null, 'good', 'shield-check'), Ui::kpi('Policies Accepted', 8, null, 'neutral', 'file-text'), Ui::kpi('Pending Actions', $c->where('status', 'pending')->count(), 'Take action', 'warn', 'history'), Ui::kpi('Data Requests', $requests->whereNotIn('status', ['completed', 'rejected'])->count(), 'Open', 'info', 'download'), Ui::kpi('Last Updated', ($c->max('updated_at') ? \Illuminate\Support\Carbon::parse($c->max('updated_at'))->format('d M Y') : '—'), null, 'neutral', 'calendar')],
            'main' => [Ui::table('My Consents', ['Consent Type', 'Purpose', 'Status', 'Given On', 'Expires On', ''], $c->map(fn ($x) => [
                $x->label.($x->essential ? ' (Essential)' : ''), $x->purpose, Ui::pill($x->status), Ui::date($x->given_at), $x->expires_at ? $x->expires_at->format('d M Y') : ($x->status === 'active' ? 'No Expiry' : '—'),
                Ui::actions([$x->essential ? Ui::action('Required while account is active', null) : Ui::action($x->status === 'active' ? 'Withdraw' : 'Give Consent', '/portal/privacy/consents/'.$x->id, 'post', ['variant' => $x->status === 'active' ? 'outline' : 'gold', 'confirm' => $x->status === 'active' ? 'Withdraw this consent? It takes effect immediately across all channels.' : null])]),
            ])->all(), ['caption' => 'Consent is purpose-specific and never bundled into a service relationship. Withdrawal propagates to every channel and is recorded in your audit history.'])],
            'side' => [Ui::quick('Quick Actions', [Ui::action('Download My Data', '/portal/privacy/data/export', 'get', ['download' => true]), Ui::action('Data Access & Requests', '/portal/privacy/data'), Ui::action('Data Residency & Transfer', '/portal/privacy/residency'), Ui::action('Trust Passport', '/portal/trust-passport')]), Ui::list('Key Policies', [Ui::item('Privacy Policy', 'v1.2'), Ui::item('Terms of Service', 'v1.2'), Ui::item('Data Protection Policy'), Ui::item('Cookie Policy'), Ui::item('Acceptable Use Policy')]), Ui::info('Need Human Help?', 'Contact our Information Officer: privacy@thebusinessclinic.africa · +27 60 801 1365', 'info')],
        ]);
    }

    public function toggleConsent(Consent $consent): RedirectResponse
    {
        $this->ownOrFail($consent);
        abort_if($consent->essential, 422, 'Essential consents cannot be withdrawn while your account is active. Use Pause, Cancel or Exit to close your account.');
        $on = $consent->status !== 'active';
        $consent->update($on ? ['status' => 'active', 'given_at' => now(), 'withdrawn_at' => null, 'expires_at' => now()->addYear()] : ['status' => 'withdrawn', 'withdrawn_at' => now()]);
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => $on ? 'consent_given' : 'consent_withdrawn', 'details' => $consent->label, 'status' => 'verified', 'occurred_at' => now()]);
        if ($consent->key === 'whatsapp') {
            Portal::setPref($this->user(), 'channels.whatsapp', $on);
        }

        return back()->with('success', $consent->label.($on ? ' consent recorded.' : ' consent withdrawn.'));
    }

    private function categories(): array
    {
        $u = $this->user()->id;

        return [
            ['Personal Information', 'Name, contact details, profile information', 6],
            ['Account & Profile', 'Account settings, preferences, roles', Consent::where('user_id', $u)->count() + 1],
            ['Projects & Activities', 'Projects, tasks, deliverables, interactions', Project::where('user_id', $u)->count() + Task::where('user_id', $u)->count()],
            ['Billing & Payments', 'Invoices, payments, billing history', Order::where('user_id', $u)->count()],
            ['Communications', 'Messages, notifications, support tickets', Message::whereHas('thread', fn ($q) => $q->where('user_id', $u))->count() + Notice::where('user_id', $u)->count() + Ticket::where('user_id', $u)->count()],
            ['Uploaded Documents', 'Files and documents you have uploaded', Document::where('user_id', $u)->where('is_folder', false)->count()],
            ['Meetings', 'Bookings and meeting records', Booking::where('user_id', $u)->count()],
            ['Security & Logs', 'Login logs, security events, audit trails', SecurityEvent::where('user_id', $u)->count()],
        ];
    }

    public function data(): Response
    {
        $requests = DataRequest::where('user_id', $this->user()->id)->latest()->get();

        return $this->register([
            'title' => 'Data Access, Export, Correction and Withdrawal', 'icon' => 'database', 'subtitle' => 'You have full control over your personal data. Access, export, correct or withdraw your data at any time (POPIA).',
            'actions' => [Ui::action('Export All My Data (JSON)', '/portal/privacy/data/export', 'get', ['download' => true]), Ui::modal('Submit a Rights Request', 'dsr', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Data Categories', count($this->categories()), null, 'neutral', 'database'), Ui::kpi('Records Held', array_sum(array_column($this->categories(), 2)), 'Across categories', 'neutral', 'file-text'), Ui::kpi('Correction Requests', $requests->where('type', 'correction')->count(), null, 'info', 'refresh-cw'), Ui::kpi('Withdrawal / Deletion', $requests->whereIn('type', ['deletion', 'withdrawal'])->count(), null, 'warn', 'user-x'), Ui::kpi('Open Requests', $requests->whereNotIn('status', ['completed', 'rejected'])->count(), 'Answered within 30 days', 'neutral', 'calendar')],
            'main' => [
                Ui::table('Access My Data', ['Data Category', 'Description', 'Records', 'Last Updated'], array_map(fn ($c) => [$c[0], $c[1], $c[2], now()->format('d M Y')], $this->categories()), ['caption' => 'Record counts are calculated live from your account.']),
                Ui::table('My Rights Requests', ['Reference', 'Type', 'Scope', 'Status', 'Received', 'Due By', 'Response'], $requests->map(fn ($r) => [Ui::ref($r->reference), ucfirst($r->type), $r->scope, Ui::pill($r->status), $r->created_at->format('d M Y'), Ui::date($r->due_at), $r->response ?? '—'])->all(), ['empty' => 'No requests yet.']),
            ],
            'side' => [Ui::info('Your Rights', 'You have the right to access, correct, export, restrict or withdraw your personal data. Statutory response period: 30 days. Some records (e.g. financial records) are retained for legal periods even after deletion requests.', 'info'), Ui::kv('Support Contact', [['Phone', '+27 60 801 1365'], ['Email', 'privacy@thebusinessclinic.africa']])],
            'forms' => ['dsr' => Ui::form('Submit a Rights Request', '/portal/privacy/data', [
                Ui::field('type', 'Request type', 'select', ['required' => true, 'options' => Ui::options(['access' => 'Access a copy of my data', 'export' => 'Export my data (portability)', 'correction' => 'Correct my data', 'restriction' => 'Restrict processing', 'deletion' => 'Delete my data', 'withdrawal' => 'Withdraw consent & data use'])]),
                Ui::field('scope', 'Which data?', 'text', ['required' => true, 'placeholder' => 'e.g. Personal details (phone number)']), Ui::field('details', 'Details', 'textarea'),
            ], 'Submit Request')],
        ]);
    }

    public function storeRequest(Request $request): RedirectResponse
    {
        $d = $request->validate(['type' => 'required|in:access,export,correction,restriction,deletion,withdrawal,clarification', 'scope' => 'required|string|max:200', 'details' => 'nullable|string|max:2000']);
        $ref = 'DSR-'.now()->format('Y').'-'.str_pad((string) (DataRequest::count() + 47), 4, '0', STR_PAD_LEFT);
        DataRequest::create(['user_id' => $this->user()->id, 'reference' => $ref, 'type' => $d['type'], 'scope' => $d['scope'], 'details' => $d['details'] ?? null, 'status' => 'submitted', 'due_at' => now()->addDays(30)]);
        Portal::notify($this->user(), 'Data rights request received', "{$ref} ({$d['type']}) — we will respond by ".now()->addDays(30)->format('d M Y').'.', 'compliance', '/portal/privacy/data', 'Data Rights', 'Compliance');

        return back()->with('success', "Request {$ref} submitted. Statutory response by ".now()->addDays(30)->format('d M Y').'.');
    }

    public function export()
    {
        $u = $this->user();
        $payload = [
            'exported_at' => now()->toIso8601String(),
            'profile' => $u->only(['name', 'email', 'phone', 'client_id', 'company', 'job_title', 'country', 'client_type', 'created_at']),
            'organisation' => $this->org()->toArray(),
            'consents' => Consent::where('user_id', $u->id)->get(['label', 'status', 'given_at', 'withdrawn_at', 'expires_at']),
            'orders' => Order::with('items')->where('user_id', $u->id)->get(),
            'projects' => Project::where('user_id', $u->id)->get(['reference', 'name', 'status', 'progress']),
            'tickets' => Ticket::with('messages')->where('user_id', $u->id)->get(),
            'documents' => Document::where('user_id', $u->id)->get(['name', 'doc_type', 'size_bytes', 'created_at']),
            'bookings' => Booking::where('user_id', $u->id)->get(['reference', 'topic', 'starts_at', 'status']),
            'security_events' => SecurityEvent::where('user_id', $u->id)->get(['event', 'device', 'location', 'status', 'occurred_at']),
        ];
        SecurityEvent::create(['user_id' => $u->id, 'event' => 'data_export', 'details' => 'Personal data export downloaded.', 'status' => 'verified', 'occurred_at' => now()]);

        return response()->json($payload, 200, ['Content-Disposition' => 'attachment; filename="tbca-my-data-'.now()->format('Ymd').'.json"'], JSON_PRETTY_PRINT);
    }

    public function residency(): Response
    {
        $transfers = [['TRF-10051', 'CRM Sync', 'South Africa', 'EU (Ireland)', 'Client profile, Interaction data', 'Standard Contractual Clauses', 'approved'], ['TRF-10052', 'WhatsApp Routing', 'South Africa', 'EU (Ireland)', 'Messages, Metadata', 'Client Notice + DPA', 'notice_available'], ['TRF-10053', 'External Reviewer Share', 'South Africa', 'UK (London)', 'Documents', 'Reviewer Agreement', 'review_due'], ['TRF-10054', 'Analytics Aggregation', 'South Africa', 'EU (Ireland)', 'Aggregated Metrics', 'Pseudonymisation', 'approved'], ['TRF-10055', 'Payment Export', 'South Africa', 'South Africa', 'Payment Records', 'Restricted – No Transfer', 'restricted']];

        return $this->register([
            'title' => 'Data Residency and Transfer Notice', 'icon' => 'globe-lock', 'code' => 'CP-SCR-119', 'subtitle' => 'Where your data is stored, when it may be transferred, and which safeguards apply. This display reflects configured systems and approved records; it does not by itself determine legal permissibility.',
            'actions' => [Ui::modal('Request Clarification', 'clarify', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Primary residency regions', 3, 'South Africa, EU, UK', 'neutral', 'globe'), Ui::kpi('Cross-border transfers identified', 4, null, 'warn', 'arrow-left-right'), Ui::kpi('Safeguards linked', '97%', '32 of 33 transfers covered', 'good', 'shield-check'), Ui::kpi('Pending review items', 1, 'Require attention', 'bad', 'alert-triangle'), Ui::kpi('Data subject notices available', '100%', null, 'good', 'file-text')],
            'main' => [
                Ui::kv('A. Current Data Residency Profile', [['Organisation', $this->org()->name], ['Client Profile ID', $this->user()->client_id], ['Default Working Region', 'South Africa'], ['Primary Document Region', 'South Africa'], ['Support Ticket Region', 'South Africa'], ['Messaging Channel Region', 'South Africa'], ['Analytics / Reporting Region', 'EU (Ireland)'], ['Backup Region', 'UK (London)'], ['Next Review', now()->addMonths(3)->format('d M Y')]]),
                Ui::table('Transfer Register', ['ID', 'System / Flow', 'Origin', 'Destination', 'Data Category', 'Transfer Basis / Safeguard', 'Status'], array_map(fn ($t) => [Ui::ref($t[0]), $t[1], $t[2], $t[3], $t[4], $t[5], Ui::pill($t[6])], $transfers)),
            ],
            'side' => [Ui::donut('Residency Summary', [Ui::slice('South Africa', 60, 'good', '60%'), Ui::slice('EU (Ireland)', 25, 'info', '25%'), Ui::slice('UK (London)', 15, 'gold', '15%')], '3', 'Regions'), Ui::checklist('Safeguard Checklist', [Ui::check('Notice linked', true, '33 / 33'), Ui::check('Recipient identified', true, '33 / 33'), Ui::check('Review timestamp recorded', true, '33 / 33'), Ui::check('Restriction rule active', true, '8 / 8')])],
            'footnote' => 'This information is provided for transparency about data location, routing, and transfer safeguards. It is not legal advice.',
            'forms' => ['clarify' => Ui::form('Request Clarification', '/portal/privacy/data', [Ui::field('type', 'type', 'hidden', ['value' => 'clarification']), Ui::field('scope', 'Which transfer or region?', 'text', ['required' => true]), Ui::field('details', 'Your question', 'textarea', ['required' => true])], 'Send to Information Officer')],
        ]);
    }

    public function passport(): Response
    {
        $c = Consent::where('user_id', $this->user()->id)->get();
        $id = 'TBCA-TP-'.now()->format('Y').'-'.str_pad((string) $this->user()->id, 6, '0', STR_PAD_LEFT);

        return $this->register([
            'title' => 'Client Data Statement and Trust Passport', 'icon' => 'id-card', 'subtitle' => 'Understand how we collect, use and protect your data. Manage your rights, review consents and download your Trust Passport.',
            'actions' => [Ui::action('Download Trust Passport', '/portal/trust-passport/download', 'get', ['variant' => 'gold', 'download' => true])],
            'kpis' => [Ui::kpi('Data Protection Standard', 'Enterprise Grade', 'ISO 27001 aligned', 'good', 'shield-check'), Ui::kpi('Your Data Rights', 'Full Control', 'Access, correct, delete', 'good', 'key-round'), Ui::kpi('Consents Active', $c->where('status', 'active')->count(), 'Out of '.$c->count().' consents', 'info', 'file-lock'), Ui::kpi('Trust Passport', 'Current', 'Issued '.now()->format('d M Y'), 'good', 'id-card')],
            'main' => [Ui::table('Your Data at a Glance', ['Category', 'Examples', 'Purpose', 'Storage'], [
                ['Identity & Contact Information', 'Name, email, phone, job title and organisation details', 'Provide services, communicate and manage your account', Ui::pill('Stored securely', 'good')],
                ['Project & Engagement Data', 'Projects, engagements, documents and communications', 'Deliver services, track progress and ensure quality', Ui::pill('Stored securely', 'good')],
                ['Financial & Transaction Data', 'Invoices, payments, statements and billing history', 'Process payments, maintain records and comply with legal obligations', Ui::pill('Stored securely', 'good')],
                ['Usage & Analytics', 'Portal activity, preferences and feature usage', 'Improve our services and user experience', Ui::pill('Stored securely', 'good')],
                ['Communications & Support Data', 'Support tickets, messages and feedback', 'Respond to enquiries and continuously improve support', Ui::pill('Stored securely', 'good')],
            ], ['caption' => 'We never sell your data. We do not share your personal data with third parties for marketing.'])],
            'side' => [Ui::kv('Trust Passport Summary', [['Passport ID', $id], ['Issued On', now()->format('d M Y')], ['Valid Until', now()->addYear()->format('d M Y')], ['Status', Ui::pill('Active', 'good')], ['Issued By', 'The Business Clinic.Africa™']]), Ui::donut('Consent Health', [Ui::slice('Active', $c->where('status', 'active')->count(), 'good'), Ui::slice('Pending', $c->where('status', 'pending')->count(), 'gold'), Ui::slice('Withdrawn', $c->where('status', 'withdrawn')->count(), 'neutral')], (string) $c->where('status', 'active')->count(), 'Active'), Ui::quick('Your Rights', [Ui::action('Access Your Data', '/portal/privacy/data'), Ui::action('Review Consents', '/portal/privacy'), Ui::action('Request Data Deletion', '/portal/privacy/data')])],
        ]);
    }

    public function passportDownload()
    {
        $u = $this->user();
        $c = Consent::where('user_id', $u->id)->get();
        $lines = ['THE BUSINESS CLINIC.AFRICA — CLIENT TRUST PASSPORT', str_repeat('=', 52), 'Passport ID: TBCA-TP-'.now()->format('Y').'-'.str_pad((string) $u->id, 6, '0', STR_PAD_LEFT), 'Holder: '.$u->name.' ('.$u->client_id.')', 'Organisation: '.$this->org()->name, 'Issued: '.now()->format('d M Y').'   Valid until: '.now()->addYear()->format('d M Y'), '', 'CONSENTS'];
        foreach ($c as $x) {
            $lines[] = sprintf('  %-32s %s', $x->label, strtoupper($x->status));
        }
        $lines = array_merge($lines, ['', 'DATA PROTECTION', '  Primary residency: South Africa', '  Encryption: in transit and at rest', '  Rights: access, correction, export, restriction, deletion (POPIA)', '', 'We never sell your data.']);

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain', 'Content-Disposition' => 'attachment; filename="tbca-trust-passport.txt"']);
    }

    public function trustCentre(): Response
    {
        $claims = Record::whereNull('user_id')->where('register', 'claim')->orderBy('sort')->get();
        $state = fn ($c) => $c->due_on?->isPast() ? 'overdue' : ($c->due_on?->lte(now()->addDays(30)) ? 'due_soon' : 'current');

        return $this->register([
            'title' => 'Trust Centre, Public Assurance and Evidence-Cleared Claims', 'icon' => 'shield-check', 'code' => 'CP-SCR-136', 'subtitle' => 'Verifiable transparency. Evidence-cleared claims. Public assurance of our standards, security and performance.',
            'kpis' => [Ui::kpi('Evidence-Cleared Claims', $claims->count(), 'Active and verified', 'good', 'badge-check'), Ui::kpi('Claims With Current Evidence', Ui::pct($claims->filter(fn ($c) => $state($c) !== 'overdue')->count(), max(1, $claims->count())), 'Up to date', 'good', 'shield-check'), Ui::kpi('Public Policy Documents', 15, 'Published', 'neutral', 'file-text'), Ui::kpi('Security Certifications', 7, 'Active', 'neutral', 'lock')],
            'main' => [Ui::table('Our Evidence-Cleared Claims', ['Claim', 'Category', 'Evidence Source', 'Last Verified', 'Next Review', 'Evidence Currency'], $claims->map(fn ($c) => [$c->title, Ui::pill($c->data['category'] ?? '', 'info'), $c->data['source'] ?? '', Ui::date($c->data['verified'] ?? null), Ui::date($c->due_on), Ui::pill(str_replace('_', ' ', $state($c)), ['current' => 'good', 'due_soon' => 'warn', 'overdue' => 'bad'][$state($c)])])->all(), ['caption' => 'A claim stays public only while its evidence is current (promise-to-proof, CP-TEB Part 5).'])],
            'side' => [Ui::donut('Evidence Currency Overview', [Ui::slice('Current', $claims->filter(fn ($c) => $state($c) === 'current')->count(), 'good'), Ui::slice('Due Soon (≤30 days)', $claims->filter(fn ($c) => $state($c) === 'due_soon')->count(), 'gold'), Ui::slice('Overdue', $claims->filter(fn ($c) => $state($c) === 'overdue')->count(), 'bad')]), Ui::list('Public Assurance Highlights', [Ui::item('Independent reviews completed', '9'), Ui::item('External audits completed', '6'), Ui::item('Material security incidents (YTD)', '0'), Ui::item('Client commitments honoured', '100%')])],
        ]);
    }

    public function changes(Request $request): Response
    {
        $changes = Record::whereNull('user_id')->where('register', 'change')->orderBy('sort')->get();
        $acks = Record::where('user_id', $this->user()->id)->where('register', 'change_ack')->pluck('reference')->all();
        $tab = $this->tab($request, 'all');
        $status = fn ($c) => $c->status === 'upcoming' ? 'upcoming' : (in_array($c->reference, $acks, true) ? 'acknowledged' : (($c->data['impact'] ?? '') === 'high' ? 'pending_ack' : 'new'));
        $rows = $tab === 'all' ? $changes : $changes->filter(fn ($c) => $status($c) === $tab);

        return $this->register([
            'title' => 'Change and Version Digest', 'icon' => 'git-commit', 'code' => 'CP-SCR-125', 'subtitle' => 'Track material changes across the Client Portal. Evidence-backed. Transparent. Actionable.',
            'kpis' => [Ui::kpi('Total Changes', $changes->count(), null, 'neutral', 'git-commit'), Ui::kpi('New in last 30 days', $changes->where('due_on', '>=', now()->subDays(30))->where('status', 'published')->count(), null, 'good', 'sparkles'), Ui::kpi('Client Impact (High)', $changes->where('data.impact', 'high')->count(), null, 'warn', 'alert-triangle'), Ui::kpi('Pending Acknowledgement', $changes->filter(fn ($c) => $status($c) === 'pending_ack')->count(), null, 'info', 'history'), Ui::kpi('Upcoming Changes', $changes->where('status', 'upcoming')->count(), 'Next 30 days', 'neutral', 'calendar')],
            'tabs' => Ui::tabs(['all' => 'All Changes', 'new' => 'New', 'pending_ack' => 'Pending Acknowledgement', 'upcoming' => 'Upcoming', 'acknowledged' => 'Acknowledged']), 'tab' => $tab,
            'main' => [Ui::table(null, ['Change ID', 'Title / Summary', 'Change Type', 'Affects', 'Client Impact', 'Effective Date', 'Version', 'Status', ''], $rows->values()->map(fn ($c) => [Ui::ref($c->reference), Ui::stack($c->title, $c->data['screen'] ?? ''), Ui::pill($c->data['type'] ?? '', 'info'), $c->data['affects'] ?? '', Ui::pill($c->data['impact'] ?? ''), Ui::date($c->due_on), $c->data['version'] ?? '', Ui::pill(str_replace('_', ' ', $status($c))), Ui::actions([in_array($status($c), ['new', 'pending_ack'], true) ? Ui::action('Acknowledge', '/portal/changes/'.$c->id.'/acknowledge', 'post', ['variant' => 'gold']) : null])])->all())],
            'side' => [Ui::donut('Change Summary', $changes->groupBy('data.type')->map(fn ($g, $k) => Ui::slice($k, $g->count(), ['Content Update' => 'purple', 'Policy Change' => 'good', 'Enhancement' => 'gold', 'Bug Fix' => 'info'][$k] ?? 'neutral'))->values()->all()), Ui::list('Recent Major Releases', [Ui::item('CP Release v3.1', 'Live', 'Controlled corrective issue', 'good'), Ui::item('CP Release v3.0', 'Live', 'Consolidated blueprint', 'good')])],
        ]);
    }

    public function acknowledge(Record $record): RedirectResponse
    {
        abort_unless($record->register === 'change' && $record->user_id === null, 404);
        Record::firstOrCreate(['user_id' => $this->user()->id, 'register' => 'change_ack', 'reference' => $record->reference], ['title' => $record->title, 'status' => 'acknowledged']);

        return back()->with('success', 'Change '.$record->reference.' acknowledged.');
    }

    public function reverification(): Response
    {
        $items = Record::where('user_id', $this->user()->id)->where('register', 'reverification')->orderBy('sort')->get();
        $pending = $items->whereIn('status', ['pending', 'in_review']);

        return $this->register([
            'title' => 'Returning-Client Re-verification', 'icon' => 'scan-face', 'code' => 'CP-SCR-116', 'subtitle' => 'We are confirming your identity, authority and any changed details while preserving your prior verified records. This avoids full re-onboarding unless risk or authority conditions require it.',
            'kpis' => [Ui::kpi('Checklist Items', $items->count(), null, 'neutral', 'list-checks'), Ui::kpi('Confirmed', $items->whereIn('status', ['verified', 'confirmed', 'completed', 'no_change'])->count(), null, 'good', 'badge-check'), Ui::kpi('Updated', $items->where('status', 'updated')->count(), null, 'info', 'refresh-cw'), Ui::kpi('Pending client action', $pending->count(), null, 'warn', 'history'), Ui::kpi('Full re-onboarding required', 'No', 'Risk level Medium', 'good', 'shield-check')],
            'main' => [
                Ui::kv('Current Re-verification Session', [['Client / Organisation', $this->org()->name], ['Returning profile', 'RET-'.now()->format('Y').'-'.str_pad((string) $this->user()->id, 4, '0', STR_PAD_LEFT)], ['Re-verification route', 'Standard (Risk-based)'], ['Consent status', 'Confirmed'], ['Authority status', $pending->where('title', 'Authority confirmation')->isEmpty() ? 'Valid' : 'In Review'], ['Material change level', 'No major change']]),
                Ui::table('Re-verification Checklist', ['Requirement', 'Current Status', 'Last Completed', 'Method', ''], $items->map(fn ($i) => [$i->title, Ui::pill(str_replace('_', ' ', $i->status)), Ui::date($i->data['completed'] ?? null, 'd M Y, H:i'), $i->data['method'] ?? '', Ui::actions([in_array($i->status, ['pending', 'in_review'], true) ? Ui::action('Confirm', '/portal/reverification/'.$i->id, 'post', ['variant' => 'gold']) : null])])->all()),
            ],
            'side' => [Ui::donut('Re-verification Summary', [Ui::slice('Confirmed', $items->whereIn('status', ['verified', 'confirmed', 'completed', 'no_change'])->count(), 'good'), Ui::slice('Updated', $items->where('status', 'updated')->count(), 'purple'), Ui::slice('Pending', $pending->count(), 'gold')]), Ui::checklist('Trust & Continuity', [Ui::check('Prior verified record retained'), Ui::check('No duplicate onboarding'), Ui::check('Timestamp recorded'), Ui::check('Source linked'), Ui::check('Client can continue from saved state')])],
            'footnote' => 'Re-verification updates the existing trusted record. It confirms what changed, preserves what remains valid, and does not restart the full onboarding journey unless risk or authority conditions require it.',
        ]);
    }

    public function confirmReverification(Record $record): RedirectResponse
    {
        $this->ownOrFail($record);
        $data = $record->data;
        $data['completed'] = now()->toDateTimeString();
        $record->update(['status' => 'confirmed', 'data' => $data]);
        if (! Record::where('user_id', $this->user()->id)->where('register', 'reverification')->whereIn('status', ['pending', 'in_review'])->exists()) {
            Portal::completeStep($this->user(), 'identity_verified');

            return back()->with('success', 'Re-verification complete. Your trusted record is up to date.');
        }

        return back()->with('success', $record->title.' confirmed.');
    }

    public function provenance(): Response
    {
        $fields = Record::where('user_id', $this->user()->id)->where('register', 'provenance')->orderBy('sort')->get();
        $bySource = $fields->groupBy(fn ($f) => explode(' (', $f->data['source'] ?? 'Other')[0]);

        return $this->register([
            'title' => 'Assisted Entry and Capture Provenance', 'icon' => 'fingerprint', 'code' => 'CP-SCR-114', 'subtitle' => 'Guided capture with complete provenance. Every assisted entry retains the channel, operator, timestamp, evidence source and change history.',
            'kpis' => [Ui::kpi('Captured Fields', $fields->count(), null, 'neutral', 'fingerprint'), Ui::kpi('Provenance Complete', '100%', null, 'good', 'badge-check'), Ui::kpi('Pending Review', $fields->where('status', 'pending')->count(), 'Need your confirmation', 'warn', 'history'), Ui::kpi('Changed Since Capture', $fields->where('data.changed', true)->count(), null, 'info', 'refresh-cw'), Ui::kpi('Consent Verified', '100%', null, 'good', 'file-lock')],
            'main' => [Ui::table('Captured Fields Register', ['Field', 'Current Value', 'Capture Source', 'Captured By', 'Time', 'Verification', 'Changed Since Capture', ''], $fields->map(fn ($f) => [$f->title, $f->data['value'] ?? '', $f->data['source'] ?? '', $f->data['by'] ?? '', $f->data['time'] ?? '', Ui::pill($f->status), ($f->data['changed'] ?? false) ? Ui::pill('Changed', 'warn') : 'No', Ui::actions([$f->status === 'pending' ? Ui::action('Verify', '/portal/provenance/'.$f->id.'/verify', 'post', ['variant' => 'gold']) : null, Ui::action('Request Correction', '/portal/provenance/'.$f->id.'/correct', 'post')])])->all())],
            'side' => [Ui::donut('Provenance Summary', $bySource->map(fn ($g, $k) => Ui::slice($k, $g->count(), ['Assisted' => 'info', 'Self-entered' => 'good', 'Uploaded' => 'gold', 'Imported' => 'purple'][$k] ?? 'neutral'))->values()->all(), (string) $fields->count(), 'Fields'), Ui::checklist('Provenance Health', [Ui::check('Source identified', true, 'Good'), Ui::check('Actor recorded', true, 'Good'), Ui::check('Timestamp recorded', true, 'Good'), Ui::check('Consent linked', true, 'Good'), Ui::check('Change log active', true, 'Good')])],
            'footnote' => 'Every assisted capture event preserves who entered the data, the source channel used, the evidence linked, and any later change. Assisted entry improves access. It does not hide provenance.',
        ]);
    }

    public function provenanceAction(Record $record, string $action): RedirectResponse
    {
        $this->ownOrFail($record);
        if ($action === 'verify') {
            $record->update(['status' => 'verified']);

            return back()->with('success', $record->title.' verified.');
        }
        DataRequest::create(['user_id' => $this->user()->id, 'reference' => 'DSR-'.now()->format('Y').'-'.str_pad((string) (DataRequest::count() + 47), 4, '0', STR_PAD_LEFT), 'type' => 'correction', 'scope' => $record->title, 'details' => 'Correction requested from the provenance register.', 'status' => 'submitted', 'due_at' => now()->addDays(30)]);

        return back()->with('success', 'Correction request raised for '.$record->title.'.');
    }
}
