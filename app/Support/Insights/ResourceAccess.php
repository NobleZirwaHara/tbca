<?php

namespace App\Support\Insights;

use App\Models\Insights\Download;
use App\Models\Insights\Entitlement;
use App\Models\Insights\Resource;
use App\Models\Insights\Subscription;
use App\Models\Order;
use App\Models\User;
use App\Support\Platform\Reference;
use Illuminate\Support\Carbon;

/**
 * Gating and entitlement rules for Resources.
 *
 *  free         -> open download (anonymous ungated content creates no entitlement)
 *  gated        -> value exchange (email + first name) creates one idempotent R0 entitlement
 *  paid         -> sign in, order via Checkout, entitlement activates when the order is paid
 *  subscription -> active Premium Resources subscription
 *  restricted   -> authorised users only (no self-serve)
 * OVERDUE / RESTRICTED / RETIRED currentness blocks any new delivery (blueprint 6.6).
 */
class ResourceAccess
{
    public const SESSION_EMAIL = 'insights.gate_email';

    /** Monthly Premium Resources plan, USD 29 at the platform rate. */
    public const PLAN_ZAR = 522;

    public static function sessionEmail(): ?string
    {
        return session(self::SESSION_EMAIL);
    }

    /** Activate entitlements and subscriptions whose orders have been paid. */
    public static function syncPaid(?User $user): void
    {
        if (! $user) {
            return;
        }

        Entitlement::query()
            ->where('user_id', $user->id)
            ->where('state', 'pending_payment')
            ->whereNotNull('order_id')
            ->get()
            ->each(function (Entitlement $e) {
                if (Order::find($e->order_id)?->isPaid()) {
                    $e->update(['state' => 'active', 'acquired_at' => now()]);
                }
            });

        Subscription::query()
            ->where('user_id', $user->id)
            ->where('status', 'awaiting_payment')
            ->whereNotNull('order_id')
            ->get()
            ->each(function (Subscription $s) {
                if (Order::find($s->order_id)?->isPaid()) {
                    $s->update(['status' => 'active', 'started_at' => today(), 'next_billing_at' => today()->addMonth()]);
                }
            });
    }

    public static function activeSubscription(?User $user): ?Subscription
    {
        return $user ? Subscription::query()->where('user_id', $user->id)->where('status', 'active')->latest()->first() : null;
    }

    public static function entitlement(Resource $resource, ?User $user): ?Entitlement
    {
        $email = $user?->email ?? self::sessionEmail();
        if (! $user && ! $email) {
            return null;
        }

        return Entitlement::query()
            ->where('resource_id', $resource->id)
            ->where('state', 'active')
            ->where(fn ($q) => $q->when($user, fn ($q) => $q->where('user_id', $user->id))->orWhere('email', $email))
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest()
            ->first();
    }

    /**
     * @return array{state:string,canDownload:bool,reason:?string}
     * state: retired, blocked, entitled, open, gate, login, purchase, subscribe, restricted
     */
    public static function resolve(Resource $resource, ?User $user): array
    {
        $currentness = $resource->currentness();

        if ($currentness === 'retired') {
            return ['state' => 'retired', 'canDownload' => false, 'reason' => 'This resource has been retired and is no longer maintained.'];
        }
        if ($currentness === 'overdue') {
            return ['state' => 'blocked', 'canDownload' => false, 'reason' => 'This resource is past its review date. New downloads are paused until it is reviewed.'];
        }
        if ($currentness === 'restricted' && ! ($user?->role === 'admin')) {
            return ['state' => 'restricted', 'canDownload' => false, 'reason' => 'Access is limited to authorised users.'];
        }
        if ($resource->publish_state !== 'published' && ! ($user?->role === 'admin')) {
            return ['state' => 'blocked', 'canDownload' => false, 'reason' => 'This resource is not currently published.'];
        }

        if (self::entitlement($resource, $user)) {
            return ['state' => 'entitled', 'canDownload' => true, 'reason' => null];
        }

        return match ($resource->access) {
            'free' => ['state' => 'open', 'canDownload' => true, 'reason' => null],
            'gated' => ['state' => 'gate', 'canDownload' => false, 'reason' => 'Complete the value exchange to receive this controlled resource.'],
            'paid' => $user
                ? ['state' => 'purchase', 'canDownload' => false, 'reason' => 'Purchase once to unlock this resource.']
                : ['state' => 'login', 'canDownload' => false, 'reason' => 'Sign in or register to purchase this resource.'],
            'subscription' => self::activeSubscription($user)
                ? ['state' => 'entitled', 'canDownload' => true, 'reason' => null]
                : ['state' => $user ? 'subscribe' : 'login', 'canDownload' => false, 'reason' => 'Included with the Premium Resources subscription.'],
            default => ['state' => 'restricted', 'canDownload' => false, 'reason' => 'Access is limited to authorised users.'],
        };
    }

    /** Records a download, creating a subscription entitlement where that is the basis. */
    public static function recordDownload(Resource $resource, ?User $user): Download
    {
        $entitlement = self::entitlement($resource, $user);

        if (! $entitlement && $resource->access === 'subscription' && $user) {
            $entitlement = Entitlement::create([
                'reference' => Reference::make('ENT'),
                'user_id' => $user->id,
                'email' => $user->email,
                'first_name' => strtok($user->name, ' '),
                'resource_id' => $resource->id,
                'source' => 'subscription',
                'state' => 'active',
                'content_version' => $resource->version,
                'acquired_at' => now(),
                'expires_at' => now()->addYear(),
            ]);
        }

        if ($user && ($sub = self::activeSubscription($user))) {
            $usage = $sub->usage ?? ['downloads' => 0, 'downloadsLimit' => 50, 'templates' => 0, 'templatesLimit' => 20, 'reports' => 0, 'reportsLimit' => 10];
            $usage['downloads'] = ($usage['downloads'] ?? 0) + 1;
            if (in_array($resource->type, ['template', 'toolkit', 'sop-pack'], true)) {
                $usage['templates'] = ($usage['templates'] ?? 0) + 1;
            }
            if ($resource->type === 'report') {
                $usage['reports'] = ($usage['reports'] ?? 0) + 1;
            }
            $sub->update(['usage' => $usage]);
        }

        $resource->increment('download_count');

        return Download::create([
            'resource_id' => $resource->id,
            'user_id' => $user?->id,
            'entitlement_id' => $entitlement?->id,
        ]);
    }

    /** Entitlement status for the account library, honouring expiry windows. */
    public static function entitlementStatus(Entitlement $e, ?Carbon $now = null): string
    {
        $now ??= now();
        if ($e->state !== 'active') {
            return $e->state;
        }
        if ($e->expires_at && $e->expires_at->lte($now)) {
            return 'expired';
        }
        if ($e->expires_at && $e->expires_at->lte($now->copy()->addDays(30))) {
            return 'expiring_soon';
        }

        return 'active';
    }
}
