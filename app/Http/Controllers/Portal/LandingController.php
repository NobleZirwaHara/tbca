<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Portal\Deliverable;
use App\Models\Portal\Document;
use App\Models\Portal\Membership;
use App\Models\Portal\ShareLink;
use App\Models\User;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/** Public portal surfaces: CP-SCR-001 landing, 003 activation, 008 recovery and secure share links. */
class LandingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Portal/Index');
    }

    private function publicForm(array $props): Response
    {
        return Inertia::render('Portal/PublicForm', array_merge(['message' => null, 'form' => null, 'facts' => [], 'steps' => [], 'current' => 1, 'aside' => []], $props));
    }

    public function activate(string $token): Response
    {
        $m = Membership::with('organisation')->where('invite_token', $token)->where('status', 'invited')->first();
        if (! $m || ($m->invite_expires_at && $m->invite_expires_at->isPast())) {
            return $this->publicForm(['title' => 'Invitation not valid', 'eyebrow' => 'Account Activation', 'subtitle' => 'This invitation link has expired or has already been used. Ask your organisation administrator to resend it, or contact portal support.', 'message' => 'For your security, invitation links are one-use and expire after 14 days.']);
        }
        $existing = User::where('email', $m->email)->exists();

        return $this->publicForm([
            'eyebrow' => 'CP-SCR-003 · Account Activation', 'title' => 'Activate Your Account', 'subtitle' => "You've been invited to join The Business Clinic.Africa Client Portal. Please confirm your details and set up your account to continue.",
            'facts' => [['Invitation from', $m->invited_by ?? 'TBCA'], ['Organisation', $m->organisation->name], ['Role', ucfirst($m->role).' – '.$m->access_group], ['Invitation expires', $m->invite_expires_at?->format('d M Y, H:i').' (SAST)']],
            'steps' => ['Verify Invitation', 'Identity Confirmation', 'Create Credentials', 'Review & Activate'], 'current' => 3,
            'form' => Ui::form('Activate', '/portal/activate/'.$token, array_values(array_filter([
                Ui::field('name', 'Full Name', 'text', ['required' => true, 'value' => $m->name]),
                Ui::field('email', 'Email Address', 'email', ['value' => $m->email, 'readonly' => true]),
                Ui::field('phone', 'Phone (optional)', 'text', ['value' => $m->phone]),
                Ui::field('job_title', 'Job Title', 'text', ['value' => $m->job_title]),
                $existing ? null : Ui::field('password', 'Create password', 'password', ['required' => true, 'hint' => 'At least 10 characters with upper/lower case, a number and a symbol.']),
                $existing ? null : Ui::field('password_confirmation', 'Confirm password', 'password', ['required' => true]),
                Ui::field('terms', 'I accept the Terms of Use and acknowledge the Privacy Notice.', 'checkbox', ['required' => true]),
            ])), 'Verify & Activate', 'post', $existing ? 'You already have a TBCA account with this email — activation links it to the organisation.' : null),
            'aside' => ['This link is unique to you and expires automatically.', 'TBCA will never ask for your password via email, WhatsApp or KAREN.', 'Email possession is not authority — your role is confirmed by your organisation administrator.'],
        ]);
    }

    public function activateStore(Request $request, string $token): RedirectResponse
    {
        $m = Membership::where('invite_token', $token)->where('status', 'invited')->firstOrFail();
        abort_if($m->invite_expires_at && $m->invite_expires_at->isPast(), 410, 'This invitation has expired.');
        $user = User::where('email', $m->email)->first();
        $d = $request->validate(['name' => 'required|string|max:120', 'phone' => 'nullable|string|max:40', 'job_title' => 'nullable|string|max:120', 'terms' => 'accepted'] + ($user ? [] : ['password' => ['required', 'confirmed', Password::min(10)->mixedCase()->numbers()->symbols()]]));
        if (! $user) {
            $user = User::create(['name' => $d['name'], 'email' => $m->email, 'password' => $d['password'], 'phone' => $d['phone'] ?? null, 'job_title' => $d['job_title'] ?? null, 'company' => $m->organisation->name, 'role' => 'client', 'client_id' => 'TBCA-C-'.str_pad((string) (User::max('id') + 1), 6, '0', STR_PAD_LEFT)]);
        }
        $m->update(['user_id' => $user->id, 'name' => $d['name'], 'phone' => $d['phone'] ?? $m->phone, 'job_title' => $d['job_title'] ?? $m->job_title, 'status' => 'active', 'invite_token' => null, 'last_active_at' => now()]);
        Portal::account($user)->update(['organisation_id' => $m->organisation_id]);
        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/portal/welcome')->with('success', 'Your account is active. Welcome to the TBCA Client Portal.');
    }

    public function recover(Request $request): Response
    {
        $state = $request->session()->get('portal.recover', []);
        $step = $state['step'] ?? 1;
        $fields = match ($step) {
            1 => [Ui::field('identifier', 'Email address or Client ID', 'text', ['required' => true])],
            2 => [Ui::field('code', '6-digit verification code', 'text', ['required' => true])],
            3 => [Ui::field('password', 'New password', 'password', ['required' => true, 'hint' => 'At least 10 characters with upper/lower case, a number and a symbol.']), Ui::field('password_confirmation', 'Confirm new password', 'password', ['required' => true])],
            default => [],
        };

        return $this->publicForm([
            'eyebrow' => 'CP-SCR-008 · Account Recovery', 'title' => 'Password and Account Recovery', 'subtitle' => 'Recover access to your account securely in a few steps.',
            'steps' => ['Enter account details', 'Verify your identity', 'Choose a new password', 'Access your account'], 'current' => $step,
            'message' => match ($step) { 2 => 'If an account exists for these details, we sent a code. Demo environment (no SMS/email gateway): your code is '.($state['code'] ?? '').'.', 4 => 'Your password has been reset. You can now sign in.', default => null },
            'form' => $step < 4 ? Ui::form('Recover', '/portal/recover', $fields, $step === 3 ? 'Reset Password' : 'Continue') : null,
            'links' => $step === 4 ? [['label' => 'Sign In', 'href' => '/login']] : [['label' => 'Back to Login', 'href' => '/login']],
            'aside' => ['Use a strong, unique password.', 'Enable multi-factor authentication after signing in.', 'Beware of phishing — TBCA never asks for codes by phone or WhatsApp.'],
        ]);
    }

    public function recoverStore(Request $request): RedirectResponse
    {
        $state = $request->session()->get('portal.recover', ['step' => 1]);
        switch ($state['step'] ?? 1) {
            case 1:
                $id = $request->validate(['identifier' => 'required|string|max:160'])['identifier'];
                $user = User::where('email', $id)->orWhere('client_id', $id)->first();
                $request->session()->put('portal.recover', ['step' => 2, 'user' => $user?->id, 'code' => (string) random_int(100000, 999999), 'expires' => now()->addMinutes(10)->toDateTimeString()]);
                break;
            case 2:
                $code = $request->validate(['code' => 'required|string'])['code'];
                if (! $state['user'] || $code !== $state['code'] || now()->gt($state['expires'])) {
                    return back()->withErrors(['code' => 'The code is incorrect or has expired.']);
                }
                $request->session()->put('portal.recover', ['step' => 3] + $state);
                break;
            case 3:
                $d = $request->validate(['password' => ['required', 'confirmed', Password::min(10)->mixedCase()->numbers()->symbols()]]);
                $user = User::findOrFail($state['user']);
                $user->update(['password' => $d['password']]);
                Portal::account($user)->update(['password_changed_at' => now()]);
                Portal::notify($user, 'Password reset', 'Your password was reset using account recovery.', 'system', '/portal/security', 'Security');
                $request->session()->put('portal.recover', ['step' => 4]);
                break;
            default:
                $request->session()->forget('portal.recover');
        }

        return redirect('/portal/recover');
    }

    private function link(string $token): ShareLink
    {
        return ShareLink::where('token', $token)->firstOrFail();
    }

    public function shared(string $token): Response
    {
        $l = $this->link($token);
        $valid = $l->status !== 'revoked' && (! $l->expires_at || $l->expires_at->isFuture());

        return $this->publicForm([
            'eyebrow' => 'Secure Link · The Business Clinic.Africa', 'title' => $valid ? $l->label : 'This secure link is no longer available',
            'subtitle' => $valid ? 'A document has been shared with you securely. Confirm receipt to download it.' : 'The link has expired or was revoked by the sender.',
            'facts' => [['Shared with', $l->recipient ?? '—'], ['Status', ucfirst($l->status)], ['Expires', $l->expires_at?->format('d M Y, H:i') ?? '—']],
            'form' => $valid && $l->status !== 'confirmed' ? Ui::form('Confirm', '/portal/s/'.$token, [Ui::field('email', 'Confirm your email address', 'email', ['required' => true])], 'Confirm Receipt') : null,
            'links' => $valid && $l->status === 'confirmed' ? [['label' => 'Download', 'href' => '/portal/s/'.$token.'/download', 'download' => true]] : [],
        ]);
    }

    public function sharedConfirm(Request $request, string $token): RedirectResponse
    {
        $l = $this->link($token);
        $email = $request->validate(['email' => 'required|email'])['email'];
        if (strcasecmp($email, (string) $l->recipient) !== 0) {
            return back()->withErrors(['email' => 'This email does not match the intended recipient.']);
        }
        $l->update(['status' => 'confirmed', 'confirmed_at' => now()]);

        return back()->with('success', 'Receipt confirmed. You can now download the file.');
    }

    public function sharedDownload(string $token)
    {
        $l = $this->link($token);
        abort_unless($l->status === 'confirmed' && (! $l->expires_at || $l->expires_at->isFuture()), 403);
        $l->increment('access_count');
        if ($l->target_type === 'document' && ($d = Document::find($l->target_id)) && $d->path && Storage::disk('local')->exists($d->path)) {
            return Storage::disk('local')->download($d->path, $d->name);
        }
        $deliv = $l->target_type === 'deliverable' ? Deliverable::find($l->target_id) : null;

        return response("The Business Clinic.Africa — shared item\n\n".($deliv?->title ?? $l->label)."\n".($deliv?->description ?? ''), 200, ['Content-Type' => 'text/plain', 'Content-Disposition' => 'attachment; filename="tbca-shared.txt"']);
    }
}
