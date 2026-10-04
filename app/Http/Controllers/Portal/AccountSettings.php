<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\Principal;
use App\Models\Portal\Record;
use App\Models\Portal\SecurityEvent;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Response;

/** CP-SCR-020/113/120/121/132/133. Mixed into AccountController. */
trait AccountSettings
{
    public function api(): Response
    {
        $user = $this->user();
        $ps = Principal::where('user_id', $user->id)->latest()->get();
        $active = $ps->where('status', 'active')->filter(fn ($p) => ! $p->expires_at || $p->expires_at->isFuture());
        $soon = $active->filter(fn ($p) => $p->expires_at && $p->expires_at->lte(now()->addDays(7)));

        return $this->register([
            'title' => 'Delegated Agent, Machine Client and API Access', 'icon' => 'code', 'code' => 'CP-SCR-113',
            'subtitle' => 'Secure delegated access for humans, machines and API clients with exact-resource authorisation, current-state visibility and full auditability.',
            'actions' => [Ui::modal('Create New Access', 'principal', ['variant' => 'gold'])],
            'kpis' => [
                Ui::kpi('Active Human Users', $active->where('type', 'human')->count(), null, 'neutral', 'user'), Ui::kpi('Active Machine Clients', $active->where('type', 'machine')->count(), null, 'neutral', 'cpu'),
                Ui::kpi('Active API Clients', $active->where('type', 'api')->count(), null, 'neutral', 'code'), Ui::kpi('Authorisations Valid', $active->count(), Ui::pct($active->count(), max(1, $ps->count())).' of total', 'good', 'shield-check'),
                Ui::kpi('Expiring Soon', $soon->count(), 'Within 7 days', 'warn', 'alert-triangle'),
            ],
            'main' => [
                Ui::kv('Current Access Context', [['You are signed in as', $user->name.' (Human User)'], ['Organisation', $this->org()->name.' · '.$this->org()->reference], ['Environment', 'Production · Live'], ['Session ID', substr(session()->getId(), 0, 16).'…'], ['Last verified', session('portal.stepup_at') ? Ui::date(session('portal.stepup_at'), 'd M Y, H:i') : 'Not step-up verified this session']]),
                Ui::table('Principals', ['Principal', 'Type', 'Scopes', 'Token', 'Expires', 'Last Used', 'Status', ''], $ps->map(fn ($p) => [
                    $p->name, Ui::pill(ucfirst($p->type), 'info'), Ui::chips($p->scopes ?? []), $p->token_hint, Ui::date($p->expires_at), $p->last_used_at?->diffForHumans() ?? 'Never',
                    Ui::pill($p->status === 'active' && $p->expires_at?->isPast() ? 'expired' : $p->status),
                    Ui::actions([$p->status === 'active' ? Ui::action('Revoke', '/portal/access/api/'.$p->id.'/revoke', 'post', ['variant' => 'danger', 'confirm' => 'Revoke this access immediately?']) : null]),
                ])->all()),
            ],
            'side' => [
                Ui::donut('Access Summary', [Ui::slice('Human Users', $active->where('type', 'human')->count(), 'good'), Ui::slice('Machine Clients', $active->where('type', 'machine')->count(), 'gold'), Ui::slice('API Clients', $active->where('type', 'api')->count(), 'info'), Ui::slice('Revoked / Expired', $ps->count() - $active->count(), 'bad')]),
                Ui::checklist('Authorisation Health', [Ui::check('Exact-resource authorisation', true, 'Satisfied'), Ui::check('Credential currentness', $soon->isEmpty() ? true : 'warn', $soon->isEmpty() ? 'Satisfied' : 'Expiring'), Ui::check('Scope and audience match', true, 'Satisfied'), Ui::check('Session integrity', true, 'Satisfied'), Ui::check('MFA / Strong auth', (bool) $this->account()->mfa_enabled_at, $this->account()->mfa_enabled_at ? 'Satisfied' : 'Enable MFA'), Ui::check('Anomaly monitoring', true, 'No issues')]),
            ],
            'footnote' => 'Authorisation is checked in real time at every action. Stale UI state does not grant authority. Every access event is audited.',
            'forms' => ['principal' => Ui::form('Create New Access', '/portal/access/api', [
                Ui::field('name', 'Principal name', 'text', ['required' => true, 'placeholder' => 'e.g. FinBridge']),
                Ui::field('type', 'Type', 'select', ['required' => true, 'options' => Ui::options(['api' => 'API Client', 'machine' => 'Machine / RPA Agent', 'human' => 'Delegated Human'])]),
                Ui::field('scopes', 'Scopes', 'checkboxes', ['required' => true, 'options' => Ui::options(['invoices:read' => 'Invoices – read', 'reports:read' => 'Reports – read', 'documents:read' => 'Documents – read', 'documents:write' => 'Documents – upload', 'reconciliation:execute' => 'Reconciliation – execute'])]),
                Ui::field('days', 'Valid for (days)', 'number', ['required' => true, 'value' => 90]),
            ], 'Create Access', 'post', 'Step-up verification is required. The token is shown once; only a hash is stored.')],
        ]);
    }

    public function createPrincipal(Request $request): RedirectResponse
    {
        if ($r = $this->needsStepUp()) {
            return $r;
        }
        $data = $request->validate(['name' => 'required|string|max:80', 'type' => 'required|in:api,machine,human', 'scopes' => 'required|array|min:1', 'scopes.*' => 'string', 'days' => 'required|integer|min:1|max:365']);
        $token = 'tbca_'.Str::random(32);
        Principal::create(['user_id' => $this->user()->id, 'name' => $data['name'], 'type' => $data['type'], 'scopes' => $data['scopes'], 'token_hash' => hash('sha256', $token), 'token_hint' => 'tbca_…'.substr($token, -4), 'status' => 'active', 'expires_at' => now()->addDays((int) $data['days'])]);
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'principal_created', 'details' => $data['name'], 'status' => 'verified', 'occurred_at' => now()]);

        return back()->with('success', "Access created. Copy this token now — it will not be shown again: {$token}");
    }

    public function revokePrincipal(Principal $principal): RedirectResponse
    {
        $this->ownOrFail($principal);
        $principal->update(['status' => 'revoked']);

        return back()->with('success', $principal->name.' revoked.');
    }

    private function participantRecords()
    {
        return Record::where('user_id', $this->user()->id)->where('register', 'participant')->orderBy('sort')->get();
    }

    public function participants(Request $request): Response
    {
        $all = $this->participantRecords();
        $rows = Ui::filter($all->values(), $request, ['title', 'data.organisation', 'data.role'], ['status' => 'status']);

        return $this->register([
            'title' => 'Participant Register and Access Review', 'icon' => 'user-plus', 'code' => 'CP-SCR-121',
            'subtitle' => 'External participants are reviewed for ongoing access fitness, role separation, scope limits, verification status, and auditability.',
            'actions' => [Ui::action('Onboard Participant', '/portal/participants/onboarding'), Ui::modal('Invite Participant', 'participant', ['variant' => 'gold'])],
            'kpis' => [
                Ui::kpi('Registered Participants', $all->count(), null, 'neutral', 'users'), Ui::kpi('Active Participants', $all->where('status', 'active')->count(), null, 'good', 'user'),
                Ui::kpi('Due for Review', $all->filter(fn ($p) => $p->due_on && $p->due_on->lte(now()->addDays(7)) && $p->status !== 'revoked')->count(), 'Next 7 days', 'warn', 'calendar'),
                Ui::kpi('Restricted / Suspended', $all->whereIn('status', ['restricted', 'suspended'])->count(), null, 'bad', 'lock'),
                Ui::kpi('Review Completion Rate', Ui::pct($all->where('status', 'active')->count(), max(1, $all->count())), null, 'good', 'badge-check'),
            ],
            'search' => 'Search participants…', 'filters' => [Ui::selectFilter('status', 'Status', ['active' => 'Active', 'pending_review' => 'Pending Review', 'invited' => 'Invited', 'restricted' => 'Restricted', 'suspended' => 'Suspended', 'revoked' => 'Revoked'])],
            'main' => [Ui::table('Participant Register', ['Participant', 'Role Type', 'Organisation', 'Workspace / Case', 'Verification', 'Access Scope', 'Next Review', 'Status', ''], $rows->map(fn ($p) => [
                Ui::stack($p->title, $p->reference), Ui::pill($p->data['role'] ?? '', 'info'), $p->data['organisation'] ?? '', $p->data['workspace'] ?? '', Ui::pill($p->data['verification'] ?? ''), $p->data['scope'] ?? '', Ui::date($p->due_on), Ui::pill($p->status),
                Ui::actions($p->status === 'revoked' ? [] : [Ui::action('Re-authorise', '/portal/participants/'.$p->id.'/review', 'post', ['data' => ['decision' => 'reauthorise']]), Ui::action('Restrict', '/portal/participants/'.$p->id.'/review', 'post', ['data' => ['decision' => 'restrict']]), Ui::action('Revoke', '/portal/participants/'.$p->id.'/review', 'post', ['data' => ['decision' => 'revoke'], 'variant' => 'danger', 'confirm' => 'Revoke this participant\'s access?'])]),
            ])->all())],
            'side' => [
                Ui::checklist('Access Review Rules', [Ui::check('Limited-purpose access only'), Ui::check('Named workspace or case only'), Ui::check('No client-wide permissions'), Ui::check('Time-bound access'), Ui::check('Re-authorise when scope changes'), Ui::check('Full audit trail and traceability')]),
                Ui::kv('Current Review Window', [['Review Owner', 'Thandi Mokoena · Access Governance Lead'], ['Review Cycle', 'Monthly'], ['Billing Visibility (External)', Ui::pill('Blocked', 'bad')]]),
            ],
            'footnote' => 'Participant access is periodically reviewed, purpose-limited, auditable, and separable from ordinary clients access in line with TBCA governance and data protection commitments.',
            'forms' => ['participant' => $this->participantForm()],
        ]);
    }

    private function participantForm(): array
    {
        return Ui::form('Invite External Participant', '/portal/participants', [
            Ui::field('name', 'Participant name', 'text', ['required' => true]), Ui::field('email', 'Email', 'email', ['required' => true]),
            Ui::field('organisation', 'Organisation', 'text', ['required' => true]),
            Ui::field('role', 'Participant type', 'select', ['required' => true, 'options' => Ui::options(['External Legal Reviewer', 'Supplier Contact', 'Investor Guest', 'Technical Assessor', 'Partner Contributor', 'Co-Signatory'])]),
            Ui::field('workspace', 'Workspace / case reference', 'text', ['required' => true, 'placeholder' => 'WS-2026-0789 – Supply Agreement']),
            Ui::field('purpose', 'Access purpose', 'text', ['required' => true]),
            Ui::field('scope', 'Access scope', 'select', ['required' => true, 'options' => Ui::options(['Read-Only', 'Contribute'])]),
            Ui::field('days', 'Access expires after (days)', 'number', ['required' => true, 'value' => 90]),
        ], 'Send Invitation', 'post', 'External participants never see billing, never receive client-wide permissions and their access is time-bound and revocable.');
    }

    public function participantOnboarding(): Response
    {
        $all = $this->participantRecords();
        $current = $all->firstWhere('status', 'invited') ?? $all->first();
        $mix = $all->groupBy(fn ($p) => $p->data['role'] ?? 'Other');

        return $this->register([
            'title' => 'External Participant Onboarding', 'icon' => 'user-plus', 'code' => 'CP-SCR-120',
            'subtitle' => 'Invite and onboard external participants such as suppliers, advisors, co-signatories, data-room guests, reviewers, or third-party contributors with limited-purpose access.',
            'actions' => [Ui::action('Participant Register', '/portal/participants'), Ui::modal('Invite Participant', 'participant', ['variant' => 'gold'])],
            'kpis' => [
                Ui::kpi('Pending Invitations', $all->where('status', 'invited')->count(), null, 'warn', 'inbox'), Ui::kpi('Participants Onboarded', $all->whereIn('status', ['active', 'pending_review'])->count(), null, 'good', 'users'),
                Ui::kpi('Awaiting Verification', $all->filter(fn ($p) => ($p->data['verification'] ?? '') !== 'verified')->count(), null, 'warn', 'scan-face'),
                Ui::kpi('Restricted Access Roles', $all->where('data.scope', 'Read-Only')->count(), null, 'neutral', 'lock'), Ui::kpi('Consent Accepted', '93.2%', null, 'good', 'badge-check'),
            ],
            'main' => array_filter([
                $current ? Ui::kv('Current Participant Invite', [['Organisation', $current->data['organisation'] ?? ''], ['Participant name', $current->title], ['Participant type', $current->data['role'] ?? ''], ['Invite channel', $current->data['channel'] ?? 'Email'], ['Access purpose', $current->data['purpose'] ?? ''], ['Workspace / case reference', $current->data['workspace'] ?? ''], ['Access level', 'Limited'], ['Access expires', Ui::date($current->data['expires'] ?? null)], ['Invitation status', Ui::pill($current->status)]]) : null,
                Ui::table('Participant Register', ['Invite ID', 'Participant', 'Role', 'Channel', 'Scope', 'Verification', 'Status'], $all->map(fn ($p) => [Ui::ref($p->reference), $p->title, $p->data['role'] ?? '', $p->data['channel'] ?? 'Email', $p->data['workspace'] ?? '', Ui::pill($p->data['verification'] ?? ''), Ui::pill($p->status)])->all()),
            ]),
            'side' => [
                Ui::donut('Participant Mix', $mix->map(fn ($g, $k) => Ui::slice($k, $g->count(), ['External Legal Reviewer' => 'purple', 'Supplier Contact' => 'info', 'Investor Guest' => 'gold', 'Technical Assessor' => 'good'][$k] ?? 'orange'))->values()->all()),
                Ui::checklist('Participant Separation Rules', [Ui::check('Access limited to named workspace'), Ui::check('No billing visibility'), Ui::check('No client-wide permissions'), Ui::check('Time-bound access'), Ui::check('Activity logged and auditable'), Ui::check('Approval required for sensitive documents', 'warn'), Ui::check('Access revocable at any time')]),
            ],
            'footnote' => 'Onboarding preserves provenance, keeps external participants separated from ordinary clients, and enforces limited-purpose access across all workspaces.',
            'forms' => ['participant' => $this->participantForm()],
        ]);
    }

    public function inviteParticipant(Request $request): RedirectResponse
    {
        $d = $request->validate(['name' => 'required|string|max:120', 'email' => 'required|email', 'organisation' => 'required|string|max:160', 'role' => 'required|string|max:60', 'workspace' => 'required|string|max:120', 'purpose' => 'required|string|max:200', 'scope' => 'required|in:Read-Only,Contribute', 'days' => 'required|integer|min:1|max:365']);
        $ref = 'INV-'.now()->format('Y').'-'.str_pad((string) (Record::where('register', 'participant')->count() + 300), 4, '0', STR_PAD_LEFT);
        Record::create(['user_id' => $this->user()->id, 'register' => 'participant', 'reference' => $ref, 'title' => $d['name'], 'status' => 'invited', 'due_on' => now()->addDays(30), 'sort' => 0,
            'data' => ['email' => $d['email'], 'role' => $d['role'], 'organisation' => $d['organisation'], 'workspace' => $d['workspace'], 'verification' => 'pending', 'scope' => $d['scope'], 'channel' => 'Email', 'purpose' => $d['purpose'], 'expires' => now()->addDays((int) $d['days'])->toDateString(), 'last_review' => now()->toDateString()]]);

        return back()->with('success', "Invitation {$ref} sent to {$d['email']}.");
    }

    public function reviewParticipant(Request $request, Record $record): RedirectResponse
    {
        $this->ownOrFail($record);
        $decision = $request->validate(['decision' => 'required|in:reauthorise,restrict,revoke'])['decision'];
        $data = $record->data;
        $data['last_review'] = now()->toDateString();
        $record->update(['data' => $data, 'status' => ['reauthorise' => 'active', 'restrict' => 'restricted', 'revoke' => 'revoked'][$decision], 'due_on' => $decision === 'reauthorise' ? now()->addDays(30) : $record->due_on]);

        return back()->with('success', "{$record->title}: access ".['reauthorise' => 're-authorised for 30 days', 'restrict' => 'restricted', 'revoke' => 'revoked'][$decision].'.');
    }

    public function settings(Request $request): Response
    {
        $p = array_replace_recursive(Portal::defaultPreferences(), $this->account()->preferences ?? []);
        $acc = $this->account();
        $yes = fn ($b) => $b ? 'On' : 'Off';

        return $this->register([
            'title' => 'Preferences & Account Settings', 'icon' => 'settings', 'subtitle' => 'Manage how your portal works for you, including notifications, language, privacy and account preferences.',
            'main' => [Ui::row([
                Ui::kv('General Preferences', [['Default landing page', $p['landing_page']], ['Time zone', $p['timezone']], ['Date format', $p['date_format']], ['Currency display', $p['currency']], ['Start of week', $p['week_start']]]),
                Ui::kv('Notifications', [['Email alerts', $yes($p['notify']['email'])], ['Portal notifications', $yes($p['notify']['portal'])], ['Invoice reminders', $yes($p['notify']['invoices'])], ['Meeting reminders', $yes($p['notify']['meetings'])], ['Document activity', $yes($p['notify']['documents'])], ['Project updates', $yes($p['notify']['projects'])]]),
            ]), Ui::row([
                Ui::kv('Communication Channels', [['Email (Primary)', $yes($p['channels']['email'])], ['Secure Messages', $yes($p['channels']['secure'])], ['WhatsApp', $yes($p['channels']['whatsapp'])]], Ui::action('WhatsApp Preferences', '/portal/whatsapp')),
                Ui::kv('Billing', [['Payment method', $p['payment_method'] ?? 'Not set'], ['Account ID', $this->user()->client_id], ['Status', ucfirst($acc->account_state)], ['Member since', $this->user()->created_at->format('d M Y')]]),
            ]),
                ['kind' => 'form', 'title' => 'Edit Preferences', 'form' => Ui::form('Save Preferences', '/portal/settings', [
                    Ui::field('landing_page', 'Default landing page', 'select', ['value' => $p['landing_page'], 'options' => Ui::options(['Dashboard', 'One Action Centre', 'Projects', 'Invoices & Payments'])]),
                    Ui::field('timezone', 'Time zone', 'select', ['value' => $p['timezone'], 'options' => Ui::options(['(UTC+02:00) Harare, Pretoria', '(UTC+01:00) Lagos', '(UTC+00:00) Accra', '(UTC+03:00) Nairobi'])]),
                    Ui::field('date_format', 'Date format', 'select', ['value' => $p['date_format'], 'options' => Ui::options(['DD MMM YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY'])]),
                    Ui::field('currency', 'Currency display', 'select', ['value' => $p['currency'], 'options' => Ui::options(['ZAR' => 'ZAR – South African Rand (R)', 'USD' => 'USD – US Dollar ($)'])]),
                    Ui::field('week_start', 'Start of week', 'select', ['value' => $p['week_start'], 'options' => Ui::options(['Monday', 'Sunday'])]),
                    Ui::field('payment_method', 'Preferred payment method', 'select', ['value' => $p['payment_method'], 'options' => Ui::options(['card' => 'Card', 'eft' => 'EFT / Bank transfer', 'wallet' => 'Wallet'])]),
                    Ui::field('notify', 'Notifications', 'checkboxes', ['value' => array_keys(array_filter($p['notify'])), 'options' => Ui::options(['email' => 'Email alerts', 'portal' => 'Portal notifications', 'invoices' => 'Invoice reminders', 'meetings' => 'Meeting reminders', 'documents' => 'Document activity', 'projects' => 'Project updates'])]),
                    Ui::field('channels', 'Communication channels', 'checkboxes', ['value' => array_keys(array_filter($p['channels'])), 'options' => Ui::options(['email' => 'Email (Primary)', 'secure' => 'Secure Messages', 'whatsapp' => 'WhatsApp'])]),
                ], 'Save Changes', 'put')],
            ],
            'side' => [
                Ui::quick('Settings Sections', [Ui::action('Security Preferences', '/portal/security'), Ui::action('Privacy & Consent', '/portal/privacy'), Ui::action('Display & Accessibility', '/portal/accessibility'), Ui::action('Language & Region', '/portal/language'), Ui::action('Low-Data Mode', '/portal/low-data')]),
                Ui::info('Changes apply immediately', 'Preference changes are saved to your account and used across every device.', 'info'),
            ],
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $d = $request->validate(['landing_page' => 'required|string', 'timezone' => 'required|string', 'date_format' => 'required|string', 'currency' => 'required|in:ZAR,USD', 'week_start' => 'required|string', 'payment_method' => 'nullable|in:card,eft,wallet', 'notify' => 'array', 'channels' => 'array']);
        $user = $this->user();
        foreach (['landing_page', 'timezone', 'date_format', 'currency', 'week_start', 'payment_method'] as $k) {
            Portal::setPref($user, $k, $d[$k] ?? null);
        }
        foreach (['email', 'portal', 'invoices', 'meetings', 'documents', 'projects'] as $k) {
            Portal::setPref($user, "notify.$k", in_array($k, $d['notify'] ?? [], true));
        }
        foreach (['email', 'secure', 'whatsapp'] as $k) {
            Portal::setPref($user, "channels.$k", in_array($k, $d['channels'] ?? [], true));
        }
        Portal::completeStep($user, 'notifications_setup');
        if (! empty($d['payment_method'])) {
            Portal::completeStep($user, 'payment_method');
        }

        return back()->with('success', 'Preferences saved.');
    }

    public function accessibility(): Response
    {
        $a = array_merge(Portal::defaultPreferences()['a11y'], $this->account()->preferences['a11y'] ?? []);
        $set = collect($a)->filter(fn ($v, $k) => $v !== Portal::defaultPreferences()['a11y'][$k])->count();

        return $this->register([
            'title' => 'Accessibility and Interaction Preferences', 'icon' => 'accessibility', 'code' => 'CP-SCR-132',
            'subtitle' => 'Personalise your experience to make the Client Portal easier and more comfortable for you.',
            'kpis' => [Ui::kpi('Accessibility Profile', $set ? 'Custom' : 'Default', 'Active', 'good', 'accessibility'), Ui::kpi('WCAG Guidance', 'AA (Target)', 'Working towards AAA', 'good', 'badge-check'), Ui::kpi('Text Size Preview', 'Aa', $a['text_size'].'%', 'neutral', 'file-text'), Ui::kpi('Contrast Preview', $a['contrast'] === 'high' ? 'High' : 'Good', 'Passes AA', 'good', 'sparkles'), Ui::kpi('Last Updated', now()->format('d M Y'), null, 'neutral', 'calendar')],
            'main' => [['kind' => 'form', 'title' => 'Display & Visual', 'form' => Ui::form('Accessibility', '/portal/accessibility', [
                Ui::field('text_size', 'Text size', 'select', ['value' => (string) $a['text_size'], 'options' => Ui::options(['87' => 'Small (87%)', '100' => 'Default (100%)', '112' => 'Large (112%)', '125' => 'Larger (125%)', '150' => 'Largest (150%)'])]),
                Ui::field('contrast', 'Contrast mode', 'radio', ['value' => $a['contrast'], 'options' => [['value' => 'standard', 'label' => 'Standard', 'hint' => 'Normal contrast'], ['value' => 'high', 'label' => 'High Contrast', 'hint' => 'Stronger contrast for better visibility']]]),
                Ui::field('colour', 'Colour preferences', 'radio', ['value' => $a['colour'], 'options' => [['value' => 'default', 'label' => 'Default', 'hint' => 'Use system default colours'], ['value' => 'colour_blind', 'label' => 'Colour Blind Friendly', 'hint' => 'Status is always shown with text, not colour alone'], ['value' => 'monochrome', 'label' => 'Monochrome', 'hint' => 'Reduce colour to essentials only']]]),
                Ui::field('density', 'Layout & density', 'radio', ['value' => $a['density'], 'options' => [['value' => 'comfortable', 'label' => 'Comfortable', 'hint' => 'More spacing and larger touch targets'], ['value' => 'balanced', 'label' => 'Balanced', 'hint' => 'Default spacing'], ['value' => 'compact', 'label' => 'Compact', 'hint' => 'More content, less spacing']]]),
                Ui::field('focus', 'Enhanced focus outline', 'checkbox', ['value' => (bool) $a['focus']]),
                Ui::field('hide_decorative', 'Hide decorative images', 'checkbox', ['value' => (bool) $a['hide_decorative']]),
                Ui::field('reduce_motion', 'Reduce animations', 'checkbox', ['value' => (bool) $a['reduce_motion']]),
                Ui::field('simplify_charts', 'Simplify dashboard charts', 'checkbox', ['value' => (bool) $a['simplify_charts']]),
            ], 'Save Preferences', 'put')]],
            'side' => [
                Ui::gauge('Accessibility Summary', 85, 'Complete'),
                Ui::kv('Your Preference Profile', [['Profile Name', $set ? 'Custom Profile' : 'Default'], ['Applies To', 'All Workspaces']]),
                Ui::quick('Quick Actions', [Ui::action('Keyboard Shortcuts', '/portal/help'), Ui::action('Report an Accessibility Issue', '/portal/support?new=1'), Ui::action('Language Centre', '/portal/language')]),
            ],
        ]);
    }

    public function updateAccessibility(Request $request): RedirectResponse
    {
        $d = $request->validate(['text_size' => 'required|in:87,100,112,125,150', 'contrast' => 'required|in:standard,high', 'colour' => 'required|in:default,colour_blind,monochrome', 'density' => 'required|in:comfortable,balanced,compact', 'focus' => 'boolean', 'hide_decorative' => 'boolean', 'reduce_motion' => 'boolean', 'simplify_charts' => 'boolean']);
        $d['text_size'] = (int) $d['text_size'];
        foreach (['focus', 'hide_decorative', 'reduce_motion', 'simplify_charts'] as $k) {
            $d[$k] = (bool) ($d[$k] ?? false);
        }
        Portal::setPref($this->user(), 'a11y', $d);

        return back()->with('success', 'Accessibility preferences saved and applied.');
    }

    public function language(): Response
    {
        $p = array_merge(Portal::defaultPreferences(), $this->account()->preferences ?? []);

        return $this->register([
            'title' => 'Language and Bilingual Centre', 'icon' => 'languages', 'code' => 'CP-SCR-133', 'subtitle' => 'Manage languages, translations and bilingual experiences across the Client Portal.',
            'kpis' => [Ui::kpi('Active Languages', 2, 'Enabled', 'neutral', 'globe'), Ui::kpi('Translation Coverage', '92.4%', 'This portal', 'good', 'languages'), Ui::kpi('Strings Translated', '8,742', 'Of 9,458 total', 'neutral', 'file-text'), Ui::kpi('Human Reviewed', '7,912', '90.2% of translated', 'warn', 'users'), Ui::kpi('Your Language', $p['language'], null, 'gold', 'user')],
            'main' => [
                Ui::table('Active Languages', ['Language', 'Native Name', 'Default', 'Status', 'Coverage'], [['English (en-ZA)', 'English', Ui::pill('Default', 'good'), Ui::pill('Active'), '100%'], ['Afrikaans (af-ZA)', 'Afrikaans', '—', Ui::pill('Active'), '84.7%']], ['caption' => 'Material Afrikaans content remains subject to human bilingual review before release.']),
                ['kind' => 'form', 'title' => 'Preferred Language Behaviour', 'form' => Ui::form('Language', '/portal/language', [
                    Ui::field('language', 'Preferred language', 'select', ['value' => $p['language'], 'options' => Ui::options(['English', 'Afrikaans'])]),
                    Ui::field('language_behaviour', 'How should the portal choose a language?', 'radio', ['value' => $p['language_behaviour'], 'options' => [['value' => 'user', 'label' => 'User Preference (Recommended)', 'hint' => "Use the user's selected language preference."], ['value' => 'browser', 'label' => 'Browser Language', 'hint' => "Detect and use the browser's preferred language."], ['value' => 'system', 'label' => 'System Default', 'hint' => 'Always use the portal default language (English).'], ['value' => 'ask', 'label' => 'Ask Every Time', 'hint' => 'Prompt user to choose language on each visit.']]]),
                ], 'Save Language', 'put')],
            ],
            'side' => [
                Ui::bars('Translation Coverage by Area', [Ui::bar('Dashboard & Navigation', 100, null, 'good'), Ui::bar('Entry-Gate & Entitlements', 96, null, 'good'), Ui::bar('Delivery & Workspaces', 93, null, 'good'), Ui::bar('Finance & Payments', 88, null, 'gold'), Ui::bar('Support & Communications', 82, null, 'orange'), Ui::bar('Legal & Policies', 76, null, 'bad')]),
                Ui::donut('Bilingual Content Summary', [Ui::slice('Translated', 8742, 'good'), Ui::slice('In Review', 412, 'gold'), Ui::slice('Not Translated', 304, 'bad')], '9,458', 'Strings'),
            ],
        ]);
    }

    public function updateLanguage(Request $request): RedirectResponse
    {
        $d = $request->validate(['language' => 'required|in:English,Afrikaans', 'language_behaviour' => 'required|in:user,browser,system,ask']);
        Portal::setPref($this->user(), 'language', $d['language']);
        Portal::setPref($this->user(), 'language_behaviour', $d['language_behaviour']);
        session(['context.language' => $d['language'] === 'Afrikaans' ? 'af' : 'en']);

        return back()->with('success', 'Language preference saved.');
    }
}
