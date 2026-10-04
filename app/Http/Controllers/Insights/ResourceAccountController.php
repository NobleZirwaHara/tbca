<?php

namespace App\Http\Controllers\Insights;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Insights\Download;
use App\Models\Insights\Entitlement;
use App\Models\Insights\Handoff;
use App\Models\Insights\Resource;
use App\Models\Insights\Subscription;
use App\Support\Insights\ResourceAccess;
use App\Support\Platform\Checkout;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Signed-in resource account: subscription management, entitlement library,
 * and the service-line handoff triggered by resource usage.
 */
class ResourceAccountController extends Controller
{
    /** Handoff complexity threshold: number of resources used (blueprint: self-serve -> professional). */
    public const HANDOFF_THRESHOLD = 5;

    public function subscription(Request $request): Response
    {
        $user = $request->user();
        ResourceAccess::syncPaid($user);
        $sub = Subscription::where('user_id', $user->id)->latest()->first();

        return Inertia::render('Insights/Resources/Account/Subscription', [
            'subscription' => $sub ? [
                'id' => $sub->id, 'plan' => 'Premium Resources Plan', 'status' => $sub->status, 'cycle' => Str::headline($sub->billing_cycle),
                'amountZar' => $sub->amount_zar, 'startedAt' => $sub->started_at->format('d F Y'), 'nextBilling' => $sub->next_billing_at?->format('d F Y'),
                'usage' => $sub->usage ?? ['downloads' => 0, 'downloadsLimit' => 50, 'templates' => 0, 'templatesLimit' => 20, 'reports' => 0, 'reportsLimit' => 10],
                'periodStart' => today()->startOfMonth()->format('j M'), 'periodEnd' => today()->endOfMonth()->format('j M Y'),
            ] : null,
            'planZar' => ResourceAccess::PLAN_ZAR,
            'included' => ['Premium Guides', 'Business Templates', 'Financial Tools', 'Exclusive Insights', 'Priority Support'],
            'invoices' => \App\Models\Order::where('user_id', $user->id)->where('section', 'resources')->latest()->limit(6)->get()->map(fn ($o) => ['reference' => $o->reference, 'status' => $o->status, 'total' => $o->total_zar, 'date' => $o->created_at->format('d M Y')]),
        ]);
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (ResourceAccess::activeSubscription($user)) {
            return back()->with('error', 'You already have an active Premium Resources subscription.');
        }
        $order = Checkout::createOrder([[
            'item_type' => 'subscription', 'item_code' => 'TBCA-RS-PREMIUM-M', 'name' => 'Premium Resources Plan (Monthly)', 'unit_zar' => ResourceAccess::PLAN_ZAR,
        ]], $user, 'resources', ['return_url' => '/resources/account/subscription', 'title' => 'Premium Resources subscription']);
        Subscription::create(['user_id' => $user->id, 'status' => 'awaiting_payment', 'billing_cycle' => 'monthly', 'amount_zar' => ResourceAccess::PLAN_ZAR, 'started_at' => today(), 'order_id' => $order->id]);

        return redirect()->route('checkout.show', $order);
    }

    public function manage(Request $request, string $action): RedirectResponse
    {
        $sub = Subscription::where('user_id', $request->user()->id)->whereIn('status', ['active', 'paused'])->latest()->firstOrFail();
        $allowed = ['pause' => ['active'], 'resume' => ['paused'], 'cancel' => ['active', 'paused']];
        if (! in_array($sub->status, $allowed[$action], true)) {
            return back()->with('error', "Your subscription cannot be {$action}d from its current state.");
        }
        $sub->update(match ($action) {
            'pause' => ['status' => 'paused'],
            'resume' => ['status' => 'active', 'next_billing_at' => today()->addMonth()],
            'cancel' => ['status' => 'cancelled', 'next_billing_at' => null],
        });

        return back()->with('success', ['pause' => 'Subscription paused. Billing is on hold.', 'resume' => 'Subscription resumed.', 'cancel' => 'Subscription cancelled. Entitlements already downloaded remain in your library until they expire.'][$action]);
    }

    public function library(Request $request): Response
    {
        $user = $request->user();
        ResourceAccess::syncPaid($user);
        $f = $request->validate([
            'status' => ['nullable', 'array'], 'status.*' => ['in:active,expiring_soon,expired'],
            'type' => ['nullable', 'array'], 'type.*' => ['string'],
            'source' => ['nullable', 'array'], 'source.*' => ['in:one_time,subscription,retainer,free_download,gated'],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:newest,oldest,title,expiry'],
        ]);

        $all = Entitlement::with('resource')->where('user_id', $user->id)->whereIn('state', ['active', 'expired'])->get()
            ->map(fn (Entitlement $e) => [
                'id' => $e->id, 'reference' => $e->reference, 'title' => $e->resource->title, 'summary' => $e->resource->summary, 'slug' => $e->resource->slug,
                'url' => $e->resource->url(), 'type' => $e->resource->type, 'source' => $e->source, 'acquired' => $e->acquired_at?->format('d M Y'),
                'acquiredTs' => $e->acquired_at?->timestamp ?? 0, 'expires' => $e->expires_at?->format('d M Y'), 'expiresTs' => $e->expires_at?->timestamp ?? PHP_INT_MAX,
                'status' => ResourceAccess::entitlementStatus($e),
            ]);

        $group = fn ($t) => match (true) { in_array($t, ['guide', 'article', 'insight'], true) => 'guides', in_array($t, ['template', 'sop-pack', 'toolkit', 'playbook'], true) => 'templates', in_array($t, ['calculator', 'dashboard', 'scorecard'], true) => 'tools', $t === 'report' => 'reports', default => 'checklists' };

        $rows = $all
            ->when($f['status'] ?? null, fn ($c, $s) => $c->whereIn('status', $s))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->filter(fn ($r) => in_array($group($r['type']), $t, true)))
            ->when($f['source'] ?? null, fn ($c, $s) => $c->whereIn('source', $s))
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r['title']), Str::lower($q))));
        $rows = match ($f['sort'] ?? 'newest') {
            'oldest' => $rows->sortBy('acquiredTs'), 'title' => $rows->sortBy('title'), 'expiry' => $rows->sortBy('expiresTs'), default => $rows->sortByDesc('acquiredTs'),
        };
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('Insights/Resources/Account/Library', [
            'filters' => array_merge(['status' => [], 'type' => [], 'source' => []], $f),
            'rows' => $rows->values()->forPage($page, 10)->values(),
            'pagination' => ['page' => $page, 'lastPage' => max(1, (int) ceil($rows->count() / 10)), 'total' => $rows->count()],
            'kpis' => ['total' => $all->count(), 'active' => $all->whereIn('status', ['active', 'expiring_soon'])->count(), 'expiring' => $all->where('status', 'expiring_soon')->count(), 'expired' => $all->where('status', 'expired')->count()],
            'facets' => [
                'status' => ['active' => $all->where('status', 'active')->count(), 'expiring_soon' => $all->where('status', 'expiring_soon')->count(), 'expired' => $all->where('status', 'expired')->count()],
                'type' => collect(['guides', 'templates', 'tools', 'reports', 'checklists'])->mapWithKeys(fn ($g) => [$g => $all->filter(fn ($r) => $group($r['type']) === $g)->count()]),
                'source' => collect(['one_time', 'subscription', 'retainer', 'free_download', 'gated'])->mapWithKeys(fn ($s) => [$s => $all->where('source', $s)->count()]),
            ],
        ]);
    }

    /** Computes usage and raises a handoff when the complexity threshold is reached. */
    public function handoff(Request $request): Response
    {
        $user = $request->user();
        $entitlements = Entitlement::with('resource')->where('user_id', $user->id)->get();
        $downloads = Download::where('user_id', $user->id)->count();
        $types = $entitlements->map(fn ($e) => $e->resource->type);
        $usage = [
            'templates' => $types->filter(fn ($t) => in_array($t, ['template', 'sop-pack', 'toolkit', 'calculator', 'scorecard', 'dashboard'], true))->count(),
            'reports' => $types->filter(fn ($t) => $t === 'report')->count(),
            'checklists' => $types->filter(fn ($t) => $t === 'checklist')->count(),
            'guides' => $types->filter(fn ($t) => in_array($t, ['guide', 'article'], true))->count(),
            'downloads' => $downloads,
        ];
        $used = $entitlements->count() + $downloads;

        $handoff = Handoff::where('user_id', $user->id)->whereIn('status', ['ready_to_book', 'booked'])->latest()->first();
        if (! $handoff && $used >= self::HANDOFF_THRESHOLD) {
            $top = $entitlements->groupBy(fn ($e) => $e->resource->category)->sortByDesc(fn ($g) => $g->count())->keys()->first() ?? 'finance-funding';
            $service = ['finance-funding' => 'Capital Readiness', 'strategy-planning' => 'Strategy & Planning', 'risk-compliance' => 'Compliance', 'market-intelligence' => 'Market Entry', 'due-diligence' => 'Due Diligence Readiness'][$top] ?? 'Business Growth';
            $handoff = Handoff::create([
                'reference' => Reference::make('HND'), 'user_id' => $user->id, 'trigger_type' => 'Complexity Threshold',
                'resource_id' => $entitlements->sortByDesc('acquired_at')->first()?->resource_id, 'usage' => $usage,
                'service_category' => $service, 'recommended_service' => "{$service} Advisory Session", 'priority' => $used >= 10 ? 'high' : 'medium',
            ]);
        }

        return Inertia::render('Insights/Resources/Account/Handoff', [
            'threshold' => self::HANDOFF_THRESHOLD,
            'used' => $used,
            'usage' => $usage,
            'handoff' => $handoff ? [
                'reference' => $handoff->reference, 'triggerType' => $handoff->trigger_type, 'triggered' => $handoff->created_at->format('d M Y, H:i'),
                'resource' => $handoff->resource?->title, 'usage' => $handoff->usage, 'category' => $handoff->service_category, 'service' => $handoff->recommended_service,
                'priority' => $handoff->priority, 'status' => $handoff->status, 'booking' => $handoff->booking_reference,
            ] : null,
        ]);
    }

    public function bookHandoff(Request $request): RedirectResponse
    {
        $user = $request->user();
        $handoff = Handoff::where('user_id', $user->id)->where('status', 'ready_to_book')->latest()->firstOrFail();
        $data = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
            'channel' => ['required', 'in:video,phone,in-person'],
        ]);
        $startsAt = Carbon::parse("{$data['date']} {$data['time']}");
        if (Booking::where('starts_at', $startsAt)->where('status', '!=', 'cancelled')->exists()) {
            return back()->withErrors(['time' => 'That slot has just been booked. Please choose another time.']);
        }
        $booking = Booking::create([
            'reference' => Reference::make('BKG'), 'user_id' => $user->id, 'type' => 'discovery-call', 'topic' => $handoff->recommended_service,
            'starts_at' => $startsAt, 'duration_minutes' => 60, 'channel' => $data['channel'], 'name' => $user->name, 'email' => $user->email,
            'phone' => $user->phone, 'company' => $user->company, 'meta' => ['handoff' => $handoff->reference],
        ]);
        $handoff->update(['status' => 'booked', 'booking_reference' => $booking->reference]);

        return back()->with('success', "Discovery call booked for {$startsAt->format('d M Y H:i')}. Reference {$booking->reference}.")->with('reference', $booking->reference);
    }
}
