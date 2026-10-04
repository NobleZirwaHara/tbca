<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\Membership;
use App\Models\Portal\Organisation;
use App\Models\Portal\Project;
use App\Models\Portal\SecurityEvent;
use App\Support\Portal\Portal;
use App\Support\Portal\Roles;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Response;

/** CP-SCR-015/016/017/018/127 (+ settings, access and participants via AccountSettings). */
class AccountController extends PortalController
{
    use AccountSettings;

    public function profile(): Response
    {
        $user = $this->user();
        $account = $this->account();
        $m = Portal::membership($user);
        $events = SecurityEvent::where('user_id', $user->id)->latest('occurred_at')->take(5)->get();

        return $this->register([
            'title' => 'My Profile', 'icon' => 'user', 'subtitle' => 'View and manage your personal information, preferences and account settings.',
            'actions' => [Ui::modal('Edit Profile', 'profile', ['variant' => 'gold'])],
            'main' => [
                Ui::kv('Personal Information', [
                    ['Full Name', $user->name], ['Preferred Name', $account->preferences['preferred_name'] ?? explode(' ', $user->name)[0]],
                    ['Email', $user->email.'  ✓ Verified'], ['Mobile', ($user->phone ?? '—').'  ✓ Verified'], ['Client ID', $user->client_id],
                    ['Job Title', $user->job_title ?? $m?->job_title], ['Department', $m?->department ?? '—'],
                    ['Language Preference', Portal::pref($user, 'language', 'English')], ['Time Zone', Portal::pref($user, 'timezone')],
                ]),
                Ui::text('About Me', $account->preferences['about'] ?? 'Strategic leader focused on delivering impactful solutions and driving organisational growth.'),
                Ui::table('Recent Activity', ['Event', 'Device', 'When', 'Status'], $events->map(fn ($e) => [ucwords(str_replace('_', ' ', $e->event)), $e->device, $e->occurred_at?->diffForHumans(), Ui::pill($e->status)])->all()),
            ],
            'side' => [
                Ui::info('Account in Good Standing', $account->account_state === 'active' ? 'All systems operational.' : 'Account state: '.$account->account_state, $account->account_state === 'active' ? 'good' : 'warn', Ui::action('View Account Health', '/portal/account/status')),
                Ui::kv('Security Summary', [['Password', 'Last changed '.Ui::date($account->password_changed_at)], ['Two-Factor Authentication', $account->mfa_enabled_at ? 'Enabled' : 'Not enabled'], ['Active Sessions', 'Manage on Sessions page']], Ui::action('Manage Security', '/portal/security')),
                Ui::quick('Quick Links', [Ui::action('Reset Password', '/portal/security'), Ui::action('Manage Devices', '/portal/security/sessions'), Ui::action('Download My Data', '/portal/privacy/data/export', 'get', ['download' => true]), Ui::action('Deactivate Account', '/portal/account/exit')]),
            ],
            'forms' => ['profile' => Ui::form('Edit Profile', '/portal/profile', [
                Ui::field('name', 'Full Name', 'text', ['required' => true, 'value' => $user->name]),
                Ui::field('preferred_name', 'Preferred Name', 'text', ['value' => $account->preferences['preferred_name'] ?? '']),
                Ui::field('phone', 'Mobile', 'text', ['value' => $user->phone]),
                Ui::field('job_title', 'Job Title', 'text', ['value' => $user->job_title]),
                Ui::field('department', 'Department', 'text', ['value' => $m?->department]),
                Ui::field('about', 'About Me', 'textarea', ['value' => $account->preferences['about'] ?? '']),
            ], 'Save Profile', 'put')],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => 'required|string|max:120', 'preferred_name' => 'nullable|string|max:60', 'phone' => 'nullable|string|max:40', 'job_title' => 'nullable|string|max:120', 'department' => 'nullable|string|max:120', 'about' => 'nullable|string|max:1000']);
        $user = $this->user();
        $user->update(['name' => $data['name'], 'phone' => $data['phone'], 'job_title' => $data['job_title']]);
        Portal::membership($user)?->update(['name' => $data['name'], 'job_title' => $data['job_title'], 'department' => $data['department']]);
        Portal::setPref($user, 'preferred_name', $data['preferred_name']);
        Portal::setPref($user, 'about', $data['about']);

        return back()->with('success', 'Profile updated.');
    }

    public function organisation(): Response
    {
        $org = $this->org();
        $c = $org->meta['compliance'] ?? ['valid' => 0, 'expiring' => 0, 'expired' => 0, 'review' => 0];
        $contacts = Membership::where('organisation_id', $org->id)->whereIn('status', ['active'])->take(4)->get();

        return $this->register([
            'title' => 'Organisation Profile', 'icon' => 'building', 'subtitle' => $org->name.($org->verified ? ' · Verified' : ' · Unverified'),
            'actions' => [Ui::action('Manage Team', '/portal/team'), Ui::modal('Edit Profile', 'org', ['variant' => 'gold'])],
            'main' => [
                Ui::row([
                    Ui::kv('Organisation', [['Name', $org->name], ['Registration Number', $org->registration_number], ['Industry', $org->industry], ['Website', $org->website], ['Email', $org->email], ['Phone', $org->phone]]),
                    Ui::kv('Legal & Tax', [['Type of Entity', $org->entity_type], ['Country', $org->country], ['Incorporation Date', Ui::date($org->incorporated_on)], ['Tax Number', $org->tax_number], ['VAT Number', $org->vat_number], ['Reference', $org->reference]]),
                ]),
                Ui::text('About Organisation', $org->about ?? 'No description yet.'),
                Ui::kv('Key Facts', [['Year Established', (string) ($org->meta['year_established'] ?? '—')], ['Employees', $org->employees], ['Annual Revenue Range', $org->revenue_range], ['Head Office', $org->head_office]]),
                Ui::table('Key Contacts', ['Contact', 'Role', 'Email', 'Phone', ''], $contacts->map(fn ($m) => [Ui::person($m->name, $m->job_title), Ui::pill(Roles::label($m->role), $m->is_primary ? 'gold' : 'neutral'), $m->email, $m->phone, $m->is_primary ? Ui::pill('Primary', 'gold') : ''])->all(), ['link' => ['label' => 'View all contacts', 'href' => '/portal/team']]),
            ],
            'side' => [
                Ui::gauge('Organisation Health', $org->health_score, $org->health_score >= 80 ? 'Good Standing' : 'Needs Attention'),
                Ui::donut('Compliance Summary', [Ui::slice('Valid', $c['valid'], 'good'), Ui::slice('Expiring Soon', $c['expiring'], 'warn'), Ui::slice('Expired', $c['expired'], 'bad'), Ui::slice('Under Review', $c['review'], 'info')]),
                Ui::quick('Quick Actions', [Ui::action('Upload Document', '/portal/documents/upload'), Ui::modal('Update Details', 'org'), Ui::action('Manage Team', '/portal/team'), Ui::action('View Reports', '/portal/reports')]),
            ],
            'forms' => ['org' => Ui::form('Edit Organisation Profile', '/portal/organisation', [
                Ui::field('name', 'Organisation Name', 'text', ['required' => true, 'value' => $org->name]),
                Ui::field('registration_number', 'Registration Number', 'text', ['value' => $org->registration_number]),
                Ui::field('industry', 'Industry', 'text', ['value' => $org->industry]),
                Ui::field('website', 'Website', 'text', ['value' => $org->website]),
                Ui::field('email', 'Email', 'email', ['value' => $org->email]),
                Ui::field('phone', 'Phone', 'text', ['value' => $org->phone]),
                Ui::field('tax_number', 'Tax Number', 'text', ['value' => $org->tax_number]),
                Ui::field('vat_number', 'VAT Number', 'text', ['value' => $org->vat_number]),
                Ui::field('employees', 'Employees', 'select', ['value' => $org->employees, 'options' => Ui::options(['1-10', '11-50', '51-100', '101-500', '500+'])]),
                Ui::field('head_office', 'Head Office', 'text', ['value' => $org->head_office]),
                Ui::field('about', 'About', 'textarea', ['value' => $org->about]),
            ], 'Save Changes', 'put')],
        ]);
    }

    public function updateOrganisation(Request $request): RedirectResponse
    {
        abort_unless(Roles::can(Portal::membership($this->user())?->role, 'manage_org'), 403, 'Your role cannot edit the organisation profile.');
        $data = $request->validate(['name' => 'required|string|max:160', 'registration_number' => 'nullable|string|max:40', 'industry' => 'nullable|string|max:120', 'website' => 'nullable|string|max:160', 'email' => 'nullable|email', 'phone' => 'nullable|string|max:40', 'tax_number' => 'nullable|string|max:40', 'vat_number' => 'nullable|string|max:40', 'employees' => 'nullable|string|max:20', 'head_office' => 'nullable|string|max:160', 'about' => 'nullable|string|max:2000']);
        $this->org()->update($data);

        return back()->with('success', 'Organisation profile updated.');
    }

    public function organisations(): Response
    {
        $user = $this->user();
        $current = $this->account()->organisation_id;
        $ms = Membership::with('organisation')->where('user_id', $user->id)->get();
        $switches = SecurityEvent::where('user_id', $user->id)->where('event', 'context_switch')->latest()->take(5)->get();

        return $this->register([
            'title' => 'Multi-Organisation Context Switcher', 'icon' => 'arrow-left-right', 'code' => 'CP-SCR-127',
            'subtitle' => 'Switch context across your authorised organisations to access workspaces, entitlements, obligations and reports.',
            'kpis' => [
                Ui::kpi('Authorised Organisations', $ms->count(), $ms->where('status', 'active')->count().' active', 'good', 'building-2'),
                Ui::kpi('Current Context', $this->org()->name, 'Active context', 'good', 'badge-check'),
                Ui::kpi('Available Roles', $ms->pluck('role')->unique()->count(), 'Across all orgs', 'neutral', 'users'),
                Ui::kpi('Restricted Access', $ms->where('status', '!=', 'active')->count(), 'Requires authorisation', 'warn', 'lock'),
                Ui::kpi('Recent Switches', $switches->count(), 'Last 7 days', 'neutral', 'history'),
            ],
            'main' => [Ui::table('Your Authorised Organisations', ['Organisation', 'Type', 'My Role', 'Access Level', 'Status', 'Last Accessed', ''], $ms->map(fn ($m) => [
                Ui::stack($m->organisation->name, $m->organisation->reference), $m->organisation->org_type, Roles::label($m->role), Ui::pill($m->access_group, str_contains((string) $m->access_group, 'Full') ? 'good' : 'warn'),
                Ui::pill($m->organisation->status), $m->last_active_at?->diffForHumans() ?? '—',
                Ui::actions([$m->organisation_id === $current ? Ui::action('Current', null) : ($m->status === 'active' && $m->organisation->status === 'active' ? Ui::action('Switch', '/portal/organisations/'.$m->organisation_id.'/switch', 'post', ['variant' => 'gold']) : Ui::action('Unavailable', null))]),
            ])->all())],
            'side' => [
                Ui::kv('Current Context', [['Organisation', $this->org()->name], ['Reference', $this->org()->reference], ['Role', Roles::label(Portal::membership($user)?->role)]], Ui::action('View organisation profile', '/portal/organisation')),
                Ui::donut('Context Health', [Ui::slice('Active', $ms->where('status', 'active')->count(), 'good'), Ui::slice('Inactive', $ms->where('status', '!=', 'active')->count(), 'warn')]),
                Ui::list('Recent Switches', $switches->map(fn ($s) => Ui::item($s->details ?? 'Switch', $s->created_at->diffForHumans()))->all()),
            ],
        ]);
    }

    public function switchOrganisation(Organisation $organisation): RedirectResponse
    {
        $m = Membership::where('user_id', $this->user()->id)->where('organisation_id', $organisation->id)->first();
        abort_unless($m && $m->status === 'active' && $organisation->status === 'active', 403, 'You are not authorised for this organisation.');
        $this->account()->update(['organisation_id' => $organisation->id]);
        $m->update(['last_active_at' => now()]);
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'context_switch', 'details' => $organisation->name, 'status' => 'verified', 'occurred_at' => now(), 'device' => Portal::device((string) request()->userAgent())]);

        return redirect('/portal/dashboard')->with('success', 'Context switched to '.$organisation->name.'.');
    }

    public function team(Request $request): Response
    {
        $org = $this->org();
        $all = Membership::where('organisation_id', $org->id)->orderByDesc('is_primary')->get();
        $tab = $this->tab($request, 'members');
        $rows = $tab === 'invitations' ? $all->where('status', 'invited')->values() : $all->where('status', '!=', 'offboarded')->values();
        $rows = Ui::filter($rows, $request, ['name', 'email'], ['role' => 'role', 'status' => 'status']);
        $roleRows = collect(Roles::ROLES)->map(fn ($r, $key) => [Roles::label($key), $r['group'], implode(', ', array_map(fn ($p) => Roles::PERMISSIONS[$p], $r['permissions'])), $all->where('role', $key)->count()])->values()->all();

        $main = match ($tab) {
            'roles' => [Ui::table('Roles & Permissions', ['Role', 'Access Group', 'Permissions', 'Members'], $roleRows)],
            'audit' => [Ui::table('Access Audit Log', ['Event', 'Detail', 'When'], SecurityEvent::where('user_id', $this->user()->id)->whereIn('event', ['team_invite', 'team_update', 'team_offboard', 'context_switch'])->latest()->take(20)->get()->map(fn ($e) => [ucwords(str_replace('_', ' ', $e->event)), $e->details, $e->created_at->diffForHumans()])->all())],
            default => [Ui::table(null, ['Member', 'Role', 'Access Group', 'Status', 'Last Active', 'MFA', ''], $rows->map(fn ($m) => [
                Ui::person($m->name.($m->is_primary ? ' ★' : ''), $m->email), Ui::pill(Roles::label($m->role), 'info'), $m->access_group, Ui::pill($m->status),
                $m->last_active_at?->diffForHumans() ?? 'Never', $m->mfa ? '✓' : '—',
                Ui::actions(array_filter([
                    $m->status === 'invited' ? Ui::action('Approve', '/portal/team/'.$m->id.'/approve', 'post', ['variant' => 'gold']) : null,
                    $m->status === 'invited' ? Ui::action('Resend Invite', '/portal/team/'.$m->id.'/resend', 'post') : null,
                    $m->status === 'inactive' ? Ui::action('Reactivate', '/portal/team/'.$m->id.'/reactivate', 'post') : null,
                    $m->status === 'active' && ! $m->is_primary ? Ui::modal('Edit', 'role-'.$m->id) : null,
                    $m->status === 'active' && ! $m->is_primary ? Ui::action('Deactivate', '/portal/team/'.$m->id.'/deactivate', 'post', ['confirm' => "Deactivate {$m->name}?", 'variant' => 'danger']) : null,
                    $m->status === 'active' && ! $m->is_primary ? Ui::action('Offboard', '/portal/journeys/offboarding?member='.$m->id) : null,
                ])),
            ])->all())],
        };

        $forms = ['invite' => Ui::form('Invite Team Member', '/portal/team', [
            Ui::field('name', 'Full Name', 'text', ['required' => true]), Ui::field('email', 'Email Address', 'email', ['required' => true]),
            Ui::field('job_title', 'Job Title', 'text'), Ui::field('role', 'Role', 'select', ['required' => true, 'options' => Roles::options()]),
        ], 'Send Invitation', 'post', 'The invitation is one-use, expires in 14 days and contains no protected data. Email possession is not authority — the invitee verifies their identity on activation.')];
        foreach ($all->where('status', 'active') as $m) {
            $forms['role-'.$m->id] = Ui::form('Edit access for '.$m->name, '/portal/team/'.$m->id, [Ui::field('role', 'Role', 'select', ['required' => true, 'value' => $m->role, 'options' => Roles::options()]), Ui::field('job_title', 'Job Title', 'text', ['value' => $m->job_title])], 'Save', 'put');
        }
        $groups = $all->where('status', 'active')->groupBy('access_group');

        return $this->register([
            'title' => 'Team Members and User Access', 'icon' => 'users', 'subtitle' => 'Manage who can access your organisation workspace, their roles and permissions.',
            'actions' => [Ui::action('Offboard a Member', '/portal/journeys/offboarding'), Ui::modal('Invite Team Member', 'invite', ['variant' => 'gold'])],
            'kpis' => [
                Ui::kpi('Total Members', $all->where('status', '!=', 'offboarded')->count(), 'All users', 'neutral', 'users'),
                Ui::kpi('Active Users', $all->where('status', 'active')->count(), 'This month', 'good', 'user'),
                Ui::kpi('Pending Invitations', $all->where('status', 'invited')->count(), 'Awaiting acceptance', 'warn', 'user-plus'),
                Ui::kpi('Roles', count(Roles::ROLES), 'Defined roles', 'neutral', 'key-round'),
                Ui::kpi('Access Groups', $groups->count(), 'Configured groups', 'neutral', 'layout-grid'),
            ],
            'tabs' => Ui::tabs(['members' => 'Team Members', 'roles' => 'Roles & Permissions', 'invitations' => ['Invitations', $all->where('status', 'invited')->count()], 'audit' => 'Access Audit Log']),
            'tab' => $tab, 'search' => 'Search members…',
            'filters' => [Ui::selectFilter('role', 'Role', collect(Roles::ROLES)->mapWithKeys(fn ($r, $k) => [$k => $r['label']])->all()), Ui::selectFilter('status', 'Status', ['active' => 'Active', 'invited' => 'Pending', 'inactive' => 'Inactive'])],
            'main' => $main,
            'side' => [
                Ui::donut('Access Summary', $groups->map(fn ($g, $name) => Ui::slice($name ?: 'Unassigned', $g->count(), ['Full Access' => 'good', 'Finance Access' => 'info', 'Project Access' => 'gold', 'Compliance Access' => 'purple'][$name] ?? 'neutral'))->values()->all()),
                Ui::quick('Quick Actions', [Ui::modal('Invite Team Member', 'invite'), Ui::action('View Roles & Permissions', '/portal/team?tab=roles'), Ui::action('Offboard a Member', '/portal/journeys/offboarding'), Ui::action('View Access Audit Log', '/portal/team?tab=audit')]),
                Ui::info('Security Tip', 'Role and access changes require step-up verification and are logged in the access audit trail.', 'gold', Ui::action('Manage Security Settings', '/portal/security')),
            ],
            'forms' => $forms,
        ]);
    }

    public function invite(Request $request): RedirectResponse
    {
        if ($r = $this->needsStepUp()) {
            return $r;
        }
        abort_unless(Roles::can(Portal::membership($this->user())?->role, 'manage_team'), 403, 'Your role cannot invite team members.');
        $data = $request->validate(['name' => 'required|string|max:120', 'email' => 'required|email|max:160', 'job_title' => 'nullable|string|max:120', 'role' => 'required|in:'.implode(',', array_keys(Roles::ROLES))]);
        $org = $this->org();
        abort_if(Membership::where('organisation_id', $org->id)->where('email', $data['email'])->whereIn('status', ['active', 'invited'])->exists(), 422, 'This person is already a member or has a pending invitation.');
        $m = Membership::updateOrCreate(['organisation_id' => $org->id, 'email' => $data['email']], $data + [
            'access_group' => Roles::ROLES[$data['role']]['group'], 'status' => 'invited', 'invite_token' => Str::random(40),
            'invited_by' => $this->user()->name, 'invited_at' => now(), 'invite_expires_at' => now()->addDays(14),
        ]);
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'team_invite', 'details' => "Invited {$m->name} as ".Roles::label($m->role), 'status' => 'verified', 'occurred_at' => now()]);

        return back()->with('success', "Invitation sent to {$m->email}. Activation link: /portal/activate/{$m->invite_token}");
    }

    public function updateMember(Request $request, Membership $membership): RedirectResponse
    {
        if ($r = $this->needsStepUp()) {
            return $r;
        }
        abort_unless($membership->organisation_id === $this->account()->organisation_id && ! $membership->is_primary, 404);
        $data = $request->validate(['role' => 'required|in:'.implode(',', array_keys(Roles::ROLES)), 'job_title' => 'nullable|string|max:120']);
        $membership->update($data + ['access_group' => Roles::ROLES[$data['role']]['group']]);
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'team_update', 'details' => "{$membership->name} role set to ".Roles::label($data['role']), 'status' => 'verified', 'occurred_at' => now()]);

        return back()->with('success', 'Access updated for '.$membership->name.'.');
    }

    public function memberAction(Membership $membership, string $action): RedirectResponse
    {
        abort_unless($membership->organisation_id === $this->account()->organisation_id && ! $membership->is_primary, 404);
        match ($action) {
            'resend' => $membership->update(['invite_token' => Str::random(40), 'invited_at' => now(), 'invite_expires_at' => now()->addDays(14)]),
            'deactivate' => $membership->update(['status' => 'inactive']),
            'reactivate' => $membership->update(['status' => 'active']),
            'approve' => $membership->update(['status' => 'active', 'invite_token' => null, 'last_active_at' => now()]),
        };
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'team_update', 'details' => ucfirst($action)." {$membership->name}", 'status' => 'verified', 'occurred_at' => now()]);

        return back()->with('success', match ($action) {
            'resend' => "Invitation re-sent to {$membership->email}.", 'deactivate' => "{$membership->name} deactivated.",
            'reactivate' => "{$membership->name} reactivated.", default => "Access approved for {$membership->name}.",
        });
    }

    public function relationships(): Response
    {
        $org = $this->org();
        $members = Membership::where('organisation_id', $org->id)->where('status', 'active')->get();
        $projects = Project::where('user_id', $this->user()->id)->get();

        return $this->register([
            'title' => 'Relationship and Engagement Graph', 'icon' => 'network', 'subtitle' => 'See how people, organisations, engagements, contracts and services connect.',
            'kpis' => [
                Ui::kpi('Persons', $members->count(), 'Active contacts', 'neutral', 'users'), Ui::kpi('Organisations', Membership::where('user_id', $this->user()->id)->count(), 'Verified', 'good', 'building-2'),
                Ui::kpi('Engagements', $projects->where('status', '!=', 'completed')->count(), 'Active', 'neutral', 'folder-kanban'),
                Ui::kpi('Contracts', \App\Models\Portal\Record::where('user_id', $this->user()->id)->where('register', 'contract')->where('status', 'signed')->count(), 'In force', 'good', 'file-signature'),
                Ui::kpi('Services', $projects->count(), 'Active', 'neutral', 'key-round'),
            ],
            'main' => [
                Ui::cards($org->name.' — Organisation', array_merge(
                    $members->map(fn ($m) => Ui::card($m->name, $m->job_title, $m->is_primary ? 'Works For · Authorised By' : 'Works For'.($m->role === 'finance' ? ' · Delegated To' : ''), '/portal/team', 'user'))->all(),
                    $projects->map(fn ($p) => Ui::card($p->name, 'Engagement · '.$p->reference, 'Has Engagement · '.ucfirst(str_replace('_', ' ', $p->status)), '/portal/projects/'.$p->reference, 'folder-kanban', 'info'))->all(),
                ), 3),
            ],
            'side' => [
                Ui::kv('Selected Node', [['Organisation', $org->name], ['Type', $org->entity_type], ['Country', $org->country], ['Registration No.', $org->registration_number], ['VAT No.', $org->vat_number], ['Industry', $org->industry]], Ui::action('View Full Profile', '/portal/organisation')),
                Ui::list('Relationship Summary', [Ui::item('Works For', (string) $members->count()), Ui::item('Has Engagement', (string) $projects->count()), Ui::item('Authorised By', (string) $members->where('is_primary', true)->count()), Ui::item('Delegated To', (string) $members->where('role', 'finance')->count())]),
                Ui::quick('Quick Actions', [Ui::action('Add Engagement', '/portal/intake'), Ui::action('Add Authority Link', '/portal/journeys/authority'), Ui::action('Upload Document', '/portal/documents/upload'), Ui::action('Request Correction', '/portal/privacy/data')]),
            ],
        ]);
    }
}
