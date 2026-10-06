<?php

namespace App\Http\Controllers\Portal;

use App\Models\Portal\Device;
use App\Models\Portal\PortalCase;
use App\Models\Portal\SecurityEvent;
use App\Support\Portal\Portal;
use App\Support\Portal\Totp;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Response;

/** CP-SCR-007 step-up, 082 security history, 083 sessions, 084 ownership disputes; password and MFA. */
class SecurityController extends PortalController
{
    private function label(string $event): string
    {
        return ucwords(str_replace('_', ' ', $event));
    }

    public function index(): Response
    {
        $user = $this->user();
        $account = $this->account();
        $events = SecurityEvent::where('user_id', $user->id)->latest('occurred_at')->get();
        $recent = $events->where('occurred_at', '>=', now()->subDays(30));
        $flagged = $events->where('status', 'flagged')->whereNull('reviewed_at');
        $score = max(40, 100 - ($account->mfa_enabled_at ? 0 : 20) - $flagged->count() * 4 - ($account->password_changed_at?->lt(now()->subMonths(6)) ? 8 : 0));
        $mfaPending = session('portal.mfa_secret');

        return $this->register([
            'title' => 'Security and Access History', 'icon' => 'shield', 'subtitle' => 'Review your sign-ins, access events, suspicious activity, and account protection history.',
            'kpis' => [
                Ui::kpi('Security Score', $score.' / 100', $score >= 85 ? 'Excellent' : 'Improve protection', $score >= 85 ? 'good' : 'warn', 'shield-check'),
                Ui::kpi('Successful Sign-ins', $recent->where('event', 'sign_in')->count(), 'This 30 days', 'good', 'lock'),
                Ui::kpi('Flagged Events', $flagged->count(), 'Awaiting review', $flagged->count() ? 'bad' : 'good', 'flag'),
                Ui::kpi('Active Devices', Device::where('user_id', $user->id)->where('last_seen_at', '>=', now()->subDays(7))->count(), 'Seen in last 7 days', 'neutral', 'monitor-smartphone', '/portal/security/sessions'),
            ],
            'main' => array_values(array_filter([
                $mfaPending ? Ui::info('Finish MFA enrolment', "Add this key to your authenticator app, then enter the 6-digit code.\nSecret: {$mfaPending}\nURI: ".Totp::uri($mfaPending, $user->email)."\nDemo code (no authenticator connected in this environment): ".Totp::code($mfaPending), 'gold', Ui::modal('Enter verification code', 'mfa-verify', ['variant' => 'gold'])) : null,
                Ui::table('Access History', ['Event Type', 'Date & Time', 'Channel / Device', 'Location', 'Status', ''], $events->take(12)->map(fn ($e) => [
                    $this->label($e->event), $e->occurred_at?->format('d M Y, H:i'), $e->device, $e->location, Ui::pill($e->reviewed_at ? 'reviewed' : $e->status),
                    Ui::actions([$e->status === 'flagged' && ! $e->reviewed_at ? Ui::action('Mark as Reviewed', '/portal/security/events/'.$e->id.'/review', 'post') : null]),
                ])->all(), ['link' => ['label' => 'Sessions, Devices & Login History', 'href' => '/portal/security/sessions']]),
                Ui::row([
                    ['kind' => 'form', 'title' => 'Change Password', 'form' => Ui::form('Change Password', '/portal/security/password', [
                        Ui::field('current_password', 'Current password', 'password', ['required' => true, 'span' => 2]),
                        Ui::field('password', 'New password', 'password', ['required' => true, 'hint' => 'At least 10 characters with upper/lower case, a number and a symbol.']),
                        Ui::field('password_confirmation', 'Confirm new password', 'password', ['required' => true]),
                    ], 'Update Password')],
                    Ui::list('Security Alerts', $flagged->take(4)->map(fn ($e) => Ui::item($this->label($e->event), 'Flagged', $e->details.' · '.$e->location.' · '.$e->occurred_at?->format('d M Y'), 'bad'))->values()->all()),
                ]),
            ])),
            'side' => [
                Ui::kv('Account Protection', [['Multi-factor Authentication (MFA)', $account->mfa_enabled_at ? Ui::pill('On', 'good') : Ui::pill('Off', 'bad')], ['Recovery Email', 'Verified'], ['Backup Codes', $account->mfa_enabled_at ? 'Available' : '—'], ['Last Password Change', Ui::date($account->password_changed_at)]],
                    $account->mfa_enabled_at ? Ui::action('Disable MFA', '/portal/security/mfa/disable', 'post', ['confirm' => 'Disable multi-factor authentication?', 'variant' => 'danger']) : Ui::action('Enable MFA', '/portal/security/mfa/start', 'post', ['variant' => 'gold'])),
                Ui::quick('Quick Actions', [Ui::action('Review Sessions', '/portal/security/sessions'), Ui::action('Step-up Verification', '/portal/security/step-up'), Ui::action('Account Ownership Dispute', '/portal/security/ownership-dispute'), Ui::action('Security Settings', '/portal/settings')]),
                Ui::info('Need Security Help?', 'TBCA will never ask for your password, OTP, PIN or security key through WhatsApp, email or KAREN.', 'info', Ui::action('Chat with KAREN', '/portal/natasha')),
            ],
            'forms' => ['mfa-verify' => Ui::form('Verify authenticator code', '/portal/security/mfa/verify', [Ui::field('code', '6-digit code', 'text', ['required' => true, 'placeholder' => '123456'])], 'Verify & Enable')],
        ]);
    }

    public function password(Request $request): RedirectResponse
    {
        $request->validate(['current_password' => 'required|string', 'password' => ['required', 'confirmed', Password::min(10)->mixedCase()->numbers()->symbols()]]);
        $user = $this->user();
        if (! Hash::check($request->input('current_password'), $user->password)) {
            return back()->withErrors(['current_password' => 'Your current password is incorrect.']);
        }
        $user->update(['password' => $request->input('password')]);
        $this->account()->update(['password_changed_at' => now()]);
        SecurityEvent::create(['user_id' => $user->id, 'event' => 'password_change', 'device' => Portal::device((string) $request->userAgent()), 'ip' => $request->ip(), 'location' => 'South Africa', 'status' => 'verified', 'details' => 'Password changed from the portal.', 'occurred_at' => now()]);
        Portal::notify($user, 'Your password was changed', 'If this was not you, contact support immediately.', 'system', '/portal/security', 'Security');

        return back()->with('success', 'Password updated.');
    }

    public function mfaStart(): RedirectResponse
    {
        session(['portal.mfa_secret' => Totp::secret()]);

        return back()->with('success', 'Scan the key with your authenticator app and enter the code to finish enrolment.');
    }

    public function mfaVerify(Request $request): RedirectResponse
    {
        $request->validate(['code' => 'required|string']);
        $secret = session('portal.mfa_secret');
        if (! $secret || ! Totp::verify($secret, $request->input('code'))) {
            return back()->withErrors(['code' => 'That code is not valid. Check your authenticator time and try again.']);
        }
        $this->account()->update(['mfa_secret' => $secret, 'mfa_enabled_at' => now()]);
        session()->forget('portal.mfa_secret');
        Portal::membership($this->user())?->update(['mfa' => true]);
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'mfa_enabled', 'status' => 'verified', 'device' => Portal::device((string) $request->userAgent()), 'details' => 'Authenticator app enrolled.', 'occurred_at' => now()]);

        return back()->with('success', 'Multi-factor authentication is now enabled.');
    }

    public function mfaDisable(): RedirectResponse
    {
        if ($r = $this->needsStepUp()) {
            return $r;
        }
        $this->account()->update(['mfa_secret' => null, 'mfa_enabled_at' => null]);
        Portal::membership($this->user())?->update(['mfa' => false]);
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'mfa_disabled', 'status' => 'flagged', 'risk' => 'medium', 'details' => 'MFA disabled by the account holder.', 'occurred_at' => now()]);

        return back()->with('success', 'MFA disabled.');
    }

    public function reviewEvent(SecurityEvent $event): RedirectResponse
    {
        $this->ownOrFail($event);
        $event->update(['reviewed_at' => now(), 'status' => 'resolved']);

        return back()->with('success', 'Event marked as reviewed.');
    }

    public function sessions(): Response
    {
        $user = $this->user();
        $sessions = DB::table('sessions')->where('user_id', $user->id)->orderByDesc('last_activity')->get();
        $events = SecurityEvent::where('user_id', $user->id)->whereIn('event', ['sign_in', 'failed_sign_in', 'unusual_sign_in', 'password_change', 'mfa_enabled'])->latest('occurred_at')->take(10)->get();
        $devices = Device::where('user_id', $user->id)->orderByDesc('last_seen_at')->get();
        $current = session()->getId();

        return $this->register([
            'title' => 'Sessions, Devices and Login History', 'icon' => 'monitor-smartphone', 'subtitle' => 'Review your active sessions, registered devices, sign-in history, and suspicious login activity.',
            'actions' => [Ui::action('Sign Out All Other Sessions', '/portal/security/sessions/others', 'post', ['variant' => 'gold', 'confirm' => 'Sign out every other session?'])],
            'kpis' => [
                Ui::kpi('Active Sessions', $sessions->count(), 'Now', 'good', 'monitor-smartphone'), Ui::kpi('Registered Devices', $devices->count(), $devices->where('trusted', true)->count().' trusted devices', 'neutral', 'monitor-smartphone'),
                Ui::kpi('Successful Logins', $events->where('event', 'sign_in')->count(), 'Recent', 'good', 'lock'), Ui::kpi('Flagged Login Events', $events->whereIn('status', ['flagged', 'failed'])->count(), 'Recent', 'bad', 'flag'),
            ],
            'main' => [
                Ui::table('Active Sessions', ['Session & Device', 'Last Activity', 'IP', ''], $sessions->map(fn ($s) => [
                    Ui::stack(($s->id === $current ? 'This Session (Current) · ' : '').Portal::device((string) $s->user_agent), substr((string) $s->user_agent, 0, 60)),
                    \Illuminate\Support\Carbon::createFromTimestamp($s->last_activity)->diffForHumans(), $s->ip_address,
                    Ui::actions([$s->id === $current ? null : Ui::action('Sign Out', '/portal/security/sessions/'.$s->id.'/revoke', 'post')]),
                ])->all()),
                Ui::table('Login History', ['Event Type', 'Date & Time', 'Device / Browser', 'Location', 'IP', 'Status'], $events->map(fn ($e) => [$this->label($e->event), $e->occurred_at?->format('d M Y, H:i'), $e->device, $e->location, $e->ip, Ui::pill($e->status)])->all()),
                Ui::table('Trusted / Registered Devices', ['Device Name', 'Operating System', 'First Seen', 'Last Seen', 'Status', ''], $devices->map(fn ($d) => [
                    $d->name, $d->os, Ui::date($d->first_seen_at), $d->last_seen_at?->diffForHumans(), Ui::pill($d->trusted ? 'Trusted' : 'Unverified', $d->trusted ? 'good' : 'warn'),
                    Ui::actions([$d->trusted ? null : Ui::action('Trust', '/portal/security/devices/'.$d->id.'/trust', 'post'), Ui::action('Remove', '/portal/security/devices/'.$d->id.'/remove', 'post', ['variant' => 'danger', 'confirm' => 'Remove this device?'])]),
                ])->all()),
            ],
            'side' => [
                Ui::list('Security Alerts & Suspicious Activity', SecurityEvent::where('user_id', $user->id)->whereIn('status', ['flagged', 'failed'])->latest('occurred_at')->take(3)->get()->map(fn ($e) => Ui::item($this->label($e->event), $e->risk === 'high' ? 'High' : 'Review', $e->location.' · '.$e->ip.' — '.$e->details, $e->risk === 'high' ? 'bad' : 'warn'))->all()),
                Ui::kv('Account Protection', [['Two-Factor Authentication (MFA)', $this->account()->mfa_enabled_at ? 'Enabled' : 'Disabled'], ['Recovery Email', 'Verified'], ['Last Password Change', Ui::date($this->account()->password_changed_at)]], Ui::action('Manage Protection Settings', '/portal/security')),
            ],
        ]);
    }

    public function signOutOthers(): RedirectResponse
    {
        $n = DB::table('sessions')->where('user_id', $this->user()->id)->where('id', '!=', session()->getId())->delete();
        SecurityEvent::create(['user_id' => $this->user()->id, 'event' => 'session_revoked', 'details' => "{$n} other session(s) signed out.", 'status' => 'verified', 'occurred_at' => now()]);

        return back()->with('success', "{$n} other session(s) signed out.");
    }

    public function revokeSession(string $session): RedirectResponse
    {
        DB::table('sessions')->where('user_id', $this->user()->id)->where('id', $session)->where('id', '!=', session()->getId())->delete();

        return back()->with('success', 'Session signed out.');
    }

    public function deviceAction(Device $device, string $action): RedirectResponse
    {
        $this->ownOrFail($device);
        $action === 'trust' ? $device->update(['trusted' => true]) : $device->delete();

        return back()->with('success', $action === 'trust' ? 'Device trusted.' : 'Device removed.');
    }

    public function stepUp(Request $request): Response
    {
        $account = $this->account();
        $challenge = session('portal.stepup_challenge');
        $intended = (string) $request->query('intended', '/portal/dashboard');

        return $this->register([
            'title' => 'MFA and Step-Up Verification', 'icon' => 'shield-check', 'code' => 'CP-SCR-007',
            'subtitle' => 'Confirm it is you before high-value or sensitive actions.',
            'banner' => ['tone' => 'warn', 'title' => 'Step-Up Verification Required', 'body' => 'For your security, sensitive actions require a fresh verification. Codes expire after 10 minutes.', 'meta' => $challenge ? 'Challenge ID '.$challenge['id'] : null],
            'main' => array_values(array_filter([
                $challenge && ! $account->mfa_enabled_at ? Ui::info('Code sent', 'We sent a 6-digit code to '.substr((string) ($this->user()->phone ?? '+27 •• ••• ••••'), 0, 6).' ••• ••••. Demo code (no SMS gateway in this environment): '.$challenge['code'], 'gold') : null,
                ['kind' => 'form', 'title' => $account->mfa_enabled_at ? 'Enter the 6-digit code from your authenticator app' : 'Enter 6-Digit Code', 'form' => Ui::form('Verify', '/portal/security/step-up', [
                    Ui::field('code', 'Verification code', 'text', ['required' => true, 'placeholder' => '••••••']), Ui::field('intended', 'intended', 'hidden', ['value' => $intended]),
                ], 'Verify & Continue')],
                $account->mfa_enabled_at ? Ui::info('Authenticator', 'Demo code for your enrolled authenticator: '.Totp::code($account->mfa_secret), 'neutral') : null,
                Ui::steps('Verification Status', [['label' => 'Challenge Initiated'], ['label' => 'Code Sent'], ['label' => 'Code Verified'], ['label' => 'Access Granted']], $challenge || $account->mfa_enabled_at ? 3 : 1),
            ])),
            'side' => [
                Ui::checklist('Why am I seeing this?', [Ui::check('Payment changes'), Ui::check('Contract approvals'), Ui::check('Organisation or role changes'), Ui::check('Access to financial data'), Ui::check('High-value operations')]),
                Ui::quick('Having Trouble?', [Ui::action($account->mfa_enabled_at ? 'Send SMS code instead' : 'Send / resend code', '/portal/security/step-up/send', 'post', ['variant' => 'gold']), Ui::action('Contact Support', '/portal/support?new=1')]),
            ],
        ]);
    }

    public function stepUpSend(): RedirectResponse
    {
        session(['portal.stepup_challenge' => ['id' => 'CHL-'.now()->format('Y').'-'.random_int(10000, 99999), 'code' => (string) random_int(100000, 999999), 'expires' => now()->addMinutes(10)->toDateTimeString()]]);

        return back()->with('success', 'A new verification code has been sent.');
    }

    public function stepUpVerify(Request $request): RedirectResponse
    {
        $request->validate(['code' => 'required|string', 'intended' => 'nullable|string']);
        $code = preg_replace('/\D/', '', $request->input('code'));
        $account = $this->account();
        $challenge = session('portal.stepup_challenge');
        $ok = ($account->mfa_enabled_at && Totp::verify($account->mfa_secret, $code))
            || ($challenge && now()->lt($challenge['expires']) && hash_equals($challenge['code'], $code));
        if (! $ok) {
            return back()->withErrors(['code' => 'The code is incorrect or has expired.']);
        }
        session(['portal.stepup_at' => now()->toDateTimeString()]);
        session()->forget('portal.stepup_challenge');
        $intended = (string) $request->input('intended', '/portal/dashboard');

        return redirect(str_starts_with($intended, '/portal') ? $intended : '/portal/dashboard')->with('success', 'Verified. You can now complete the sensitive action (valid for 15 minutes).');
    }

    public function ownershipDisputes(): Response
    {
        $cases = PortalCase::where('user_id', $this->user()->id)->where('kind', 'ownership_dispute')->latest('submitted_at')->get();

        return $this->register([
            'title' => 'Account Ownership Dispute', 'icon' => 'user-x', 'subtitle' => 'If you believe your account has been accessed without authorisation or there is a dispute about account ownership, raise a dispute and our security team will investigate.',
            'actions' => [Ui::action('Raise New Dispute', '/portal/journeys/ownership-dispute', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Disputes', $cases->count(), null, 'neutral', 'file-text'), Ui::kpi('Resolved Disputes', $cases->where('status', 'resolved')->count(), null, 'good', 'badge-check'), Ui::kpi('Under Review', $cases->whereIn('status', ['submitted', 'under_review'])->count(), null, 'warn', 'history'), Ui::kpi('Information Requested', $cases->where('status', 'information_requested')->count(), null, 'info', 'inbox'), Ui::kpi('Average Resolution Time', '2d 14h', 'This month', 'neutral', 'calendar')],
            'main' => [Ui::table('My Disputes', ['Dispute ID', 'Subject', 'Status', 'Raised On', 'Last Update', 'Priority'], $cases->map(fn ($c) => [Ui::ref($c->reference), $c->title, Ui::pill($c->status), Ui::date($c->submitted_at, 'd M Y, H:i'), $c->updated_at->diffForHumans(), Ui::pill($c->priority ?? 'medium')])->all())],
            'side' => [Ui::steps('Dispute Process', [['label' => 'Raise Dispute', 'sub' => 'Submit details'], ['label' => 'Under Review', 'sub' => 'We investigate'], ['label' => 'Resolution', 'sub' => 'We resolve and notify']], 2), Ui::info('About Account Disputes', 'Disputed ownership does not allow either side to self-approve. Our security team reviews evidence before any transfer. Contact security@thebusinessclinic.africa or +27 11 123 4567.', 'info')],
        ]);
    }
}
