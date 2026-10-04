<?php

namespace App\Support\Portal;

use App\Models\Order;
use App\Models\Portal\Account;
use App\Models\Portal\Consent;
use App\Models\Portal\Membership;
use App\Models\Portal\Notice;
use App\Models\Portal\Organisation;
use App\Models\Portal\SecurityEvent;
use App\Models\User;
use App\Support\Platform\Reference;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Portal context: bootstraps a client's portal account the first time they
 * arrive, resolves their current organisation and exposes the account-state
 * rules (protected client floor, degradation ladder).
 */
class Portal
{
    public const ONBOARDING = [
        'account_activated' => ['Account Activated', 'Your portal account is active and secure.', null],
        'identity_verified' => ['Identity Verified', 'Confirm your contact details and identity evidence.', '/portal/journeys/verification'],
        'organisation_matched' => ['Organisation Matched', 'Link your profile to your verified organisation.', '/portal/journeys/organisation'],
        'authority_setup' => ['Authority & Delegation Setup', 'Confirm your role, authority basis and delegates.', '/portal/journeys/authority'],
        'terms_consent' => ['Terms, Privacy & Consent', 'Review the terms, privacy notice and your consent choices.', '/portal/journeys/terms'],
        'payment_method' => ['Payment Method', 'Add a payment method for secure transactions.', '/portal/settings?section=billing'],
        'service_preferences' => ['Service Preferences', 'Tell us about your goals and service preferences.', '/portal/intake'],
        'notifications_setup' => ['Notifications Setup', 'Choose how and when we contact you.', '/portal/settings?section=notifications'],
        'explore_portal' => ['Explore Portal', 'Take a quick tour of the portal map.', '/portal/sitemap'],
    ];

    public const CONSENTS = [
        'essential' => ['Essential Platform Consent', 'Agree to the Terms of Use and acknowledge the Privacy Notice for account operation.', true],
        'data_processing' => ['Data Processing', 'Process personal data to provide services and support.', true],
        'cloud_storage' => ['Cloud Storage', 'Store documents and files in secure cloud services.', false],
        'service_updates' => ['Service Updates', 'Receive updates about your engagements and platform changes.', false],
        'marketing' => ['Marketing Communications', 'Receive updates, offers and news via email and SMS.', false],
        'whatsapp' => ['WhatsApp Communications', 'Receive important notifications via WhatsApp.', false],
        'analytics' => ['Analytics & Improvement', 'Use data to improve platform performance and user experience.', false],
    ];

    public static function account(User $user): Account
    {
        $account = Account::where('user_id', $user->id)->first();
        if ($account) {
            return $account;
        }

        $org = Organisation::create([
            'reference' => 'ORG-'.str_pad((string) (Organisation::max('id') + 1), 3, '0', STR_PAD_LEFT),
            'name' => $user->company ?: $user->name.' (Personal)',
            'country' => 'South Africa',
            'org_type' => 'Corporate',
            'email' => $user->email,
            'phone' => $user->phone,
            'verified' => false,
        ]);

        Membership::create([
            'organisation_id' => $org->id,
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'job_title' => $user->job_title,
            'role' => 'owner',
            'access_group' => 'Full Access',
            'status' => 'active',
            'is_primary' => true,
            'last_active_at' => now(),
        ]);

        $onboarding = array_fill_keys(array_keys(self::ONBOARDING), 'pending');
        $onboarding['account_activated'] = 'completed';

        $account = Account::create([
            'user_id' => $user->id,
            'organisation_id' => $org->id,
            'account_state' => 'active',
            'preferences' => self::defaultPreferences(),
            'onboarding' => $onboarding,
            'password_changed_at' => $user->created_at,
        ]);

        foreach (self::CONSENTS as $key => [$label, $purpose, $essential]) {
            Consent::firstOrCreate(['user_id' => $user->id, 'key' => $key], [
                'label' => $label,
                'purpose' => $purpose,
                'essential' => $essential,
                'status' => $essential ? 'active' : 'pending',
                'given_at' => $essential ? now() : null,
            ]);
        }

        Notice::create([
            'user_id' => $user->id,
            'type' => 'system',
            'category' => 'System',
            'title' => 'Welcome to your TBCA Client Portal',
            'body' => 'Complete your guided setup to unlock all portal features.',
            'related_label' => 'Guided Setup',
            'related_url' => '/portal/welcome',
        ]);

        return $account;
    }

    public static function defaultPreferences(): array
    {
        return [
            'landing_page' => 'Dashboard',
            'timezone' => '(UTC+02:00) Harare, Pretoria',
            'date_format' => 'DD MMM YYYY',
            'currency' => 'ZAR',
            'week_start' => 'Monday',
            'language' => 'English',
            'secondary_language' => 'Afrikaans',
            'language_behaviour' => 'user',
            'notify' => ['email' => true, 'portal' => true, 'invoices' => true, 'meetings' => true, 'documents' => true, 'projects' => true],
            'channels' => ['email' => true, 'secure' => true, 'whatsapp' => false],
            'whatsapp' => ['general' => true, 'projects' => true, 'marketing' => false, 'reminders' => true, 'support' => true, 'notifications' => true, 'secure' => true, 'number' => null],
            'a11y' => ['text_size' => 100, 'contrast' => 'standard', 'colour' => 'default', 'focus' => true, 'density' => 'comfortable', 'hide_decorative' => false, 'reduce_motion' => false, 'simplify_charts' => false],
            'low_data' => ['text_first' => false, 'compress' => true, 'no_background_sync' => false, 'wifi_only' => false, 'auto_resume' => true, 'cache_docs' => true],
            'payment_method' => null,
        ];
    }

    public static function organisation(User $user): Organisation
    {
        return self::account($user)->organisation ?? Organisation::findOrFail(self::account($user)->organisation_id);
    }

    public static function membership(User $user): ?Membership
    {
        $account = self::account($user);

        return Membership::where('organisation_id', $account->organisation_id)->where('user_id', $user->id)->first();
    }

    public static function pref(User $user, string $key, mixed $default = null): mixed
    {
        return data_get(self::account($user)->preferences ?? [], $key, $default);
    }

    public static function setPref(User $user, string $key, mixed $value): void
    {
        $account = self::account($user);
        $prefs = $account->preferences ?? self::defaultPreferences();
        data_set($prefs, $key, $value);
        $account->update(['preferences' => $prefs]);
    }

    public static function completeStep(User $user, string $step, string $state = 'completed'): void
    {
        $account = self::account($user);
        $onboarding = $account->onboarding ?? [];
        $onboarding[$step] = $state;
        $account->update(['onboarding' => $onboarding]);
    }

    /** Records a sign-in event once per session, so security history reflects real use. */
    public static function touch(Request $request): void
    {
        $user = $request->user();
        if (! $user || $request->session()->get('portal.touched') === $user->id) {
            return;
        }
        $request->session()->put('portal.touched', $user->id);
        $account = self::account($user);
        $account->update(['last_seen_at' => now()]);
        Membership::where('user_id', $user->id)->update(['last_active_at' => now()]);

        SecurityEvent::create([
            'user_id' => $user->id,
            'event' => 'sign_in',
            'device' => self::device((string) $request->userAgent()),
            'location' => 'South Africa',
            'ip' => $request->ip(),
            'status' => 'verified',
            'risk' => 'low',
            'details' => 'Successful sign-in to the Client Portal.',
            'occurred_at' => now(),
        ]);
    }

    public static function device(string $agent): string
    {
        $browser = match (true) {
            str_contains($agent, 'Edg') => 'Edge',
            str_contains($agent, 'Firefox') => 'Firefox',
            str_contains($agent, 'Chrome') => 'Chrome',
            str_contains($agent, 'Safari') => 'Safari',
            default => 'Browser',
        };
        $os = match (true) {
            str_contains($agent, 'Windows') => 'Windows',
            str_contains($agent, 'iPhone') => 'iOS',
            str_contains($agent, 'Android') => 'Android',
            str_contains($agent, 'Mac') => 'macOS',
            str_contains($agent, 'Linux') => 'Linux',
            default => 'Unknown OS',
        };

        return "{$browser} on {$os}";
    }

    public static function notify(User|int $user, string $title, string $body, string $type = 'system', ?string $url = null, ?string $label = null, string $category = 'System'): Notice
    {
        return Notice::create([
            'user_id' => $user instanceof User ? $user->id : $user,
            'type' => $type,
            'category' => $category,
            'title' => $title,
            'body' => $body,
            'related_url' => $url,
            'related_label' => $label,
        ]);
    }

    public static function reference(string $prefix): string
    {
        return $prefix.'-'.now()->format('Y').'-'.strtoupper(Str::random(5));
    }

    /* --- Account state, protected floor and degradation (CP-TEB Part 18) --- */

    public const FLOOR = [
        'View and download past invoices',
        'Download available documents',
        'Access support and raise tickets',
        'Track your case and review updates',
        'Privacy & data rights tools',
        'Account and profile information',
    ];

    public const RESTRICTED = [
        'Starting new sprints or projects',
        'Approving new work or orders',
        'Uploading certain documents',
        'Access to gated workspaces',
        'Payment method changes',
        'Inviting new users or collaborators',
    ];

    /** Paths that stay reachable in any account state (the client-information floor). */
    public const FLOOR_PATHS = [
        'portal/dashboard', 'portal/account', 'portal/invoices', 'portal/statement', 'portal/orders', 'portal/payments',
        'portal/documents', 'portal/support', 'portal/privacy', 'portal/profile', 'portal/notifications', 'portal/messages',
        'portal/natasha', 'portal/help', 'portal/status', 'portal/disputes', 'portal/security', 'portal/trust',
        'portal/sitemap', 'portal/journeys', 'portal/arrears', 'portal/resume', 'portal/exports', 'portal/feedback',
    ];

    public static function isRestricted(Account $account): bool
    {
        return in_array($account->account_state, ['restricted', 'suspended', 'exited'], true);
    }

    /** Degradation ladder from days overdue (CP-SCR-034 / CP-SCR-102). */
    public static function degradation(int $daysOverdue): array
    {
        return match (true) {
            $daysOverdue <= 7 => ['Full Access', 'good', 'None – Compliant'],
            $daysOverdue <= 30 => ['Limited Access', 'warn', 'Send Payment Reminder'],
            $daysOverdue <= 45 => ['Degraded', 'warn', 'Suspend Further Access'],
            default => ['Suspended', 'bad', 'Escalate to Manager'],
        };
    }

    /** Oldest unpaid order age in days for a user (0 when nothing is overdue). */
    public static function daysOverdue(User $user): int
    {
        $oldest = Order::where('user_id', $user->id)->whereIn('status', ['awaiting_payment', 'failed'])->min('created_at');

        return $oldest ? (int) max(0, now()->diffInDays($oldest, true) - 7) : 0;
    }

    public static function initials(string $name): string
    {
        return collect(preg_split('/\s+/', trim($name)))->filter()->take(2)->map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)))->implode('');
    }

    public static function newReference(string $prefix): string
    {
        return Reference::make($prefix);
    }
}
