<?php

namespace App\Http\Controllers\Shop\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop\Handoff;
use App\Models\Shop\Mandate;
use App\Models\Shop\Product;
use App\Models\Shop\RetainerCapacity;
use App\Support\Shop\Audit;
use App\Support\Shop\ListingGate;
use App\Support\Shop\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Subscription recurrence certification (OS-038), retainer capacity and
 * C1-C5 (OS-039) and native handoff / professional boundary (OS-040).
 */
class CapacityController extends Controller
{
    public const REQUIREMENTS = [
        'r1' => ['Native Recurring Capability', 'The product is delivered through a native, integrated platform or process that supports recurring delivery.'],
        'r2' => ['Ongoing Delivery Value', 'Provides ongoing value or updates each billing period.'],
        'r3' => ['Transparent Features', 'Features, entitlements and limits are clearly stated and visible to clients.'],
        'r4' => ['Cancellation & Renewal Terms', 'Cancellation is possible as per policy; renewal terms are clear and fair.'],
        'r5' => ['Explicit Mandate Captured', 'Client mandate recorded explicitly before first charge and stored.'],
    ];

    /* --- OS-038 Subscription Recurrence Certification ------------------------- */

    public static function overall(Product $p): string
    {
        $r = collect($p->recurrence ?? [])->only(array_keys(self::REQUIREMENTS));
        if ($p->isCertifiedSubscription()) {
            $expires = $p->recurrence['expires_at'] ?? null;

            return $expires && now()->addDays(30)->gte($expires) ? 'expiring' : 'certified';
        }

        return $r->contains('fail') ? 'not_certified' : 'pending';
    }

    public function subscriptions(Request $request): Response
    {
        $all = Product::query()->where('act', 'A3')->orderBy('sprint_code')->get();
        $rows = $all->when($request->query('status'), fn ($c, $v) => $c->filter(fn ($p) => self::overall($p) === $v));

        return Inertia::render('Shop/Admin/Subscriptions', [
            'rows' => $rows->values()->map(fn (Product $p) => [
                'slug' => $p->slug, 'code' => $p->sprint_code, 'name' => $p->name, 'vehicle' => $p->vehicle, 'sku' => $p->sprint_code.'-SA-A3',
                'period' => $p->price_unit === 'week' ? 'Weekly' : 'Monthly', 'price_incl' => $p->price_zar !== null ? round($p->price_zar * 1.15, 2) : null,
                'r' => collect(self::REQUIREMENTS)->keys()->mapWithKeys(fn ($k) => [$k => $p->recurrence[$k] ?? 'pending']),
                'overall' => self::overall($p), 'mandate' => $p->recurrence['mandate'] ?? 'not_captured',
                'certified_at' => $p->recurrence['certified_at'] ?? null, 'expires_at' => $p->recurrence['expires_at'] ?? null, 'state' => $p->listing_state,
            ]),
            'requirements' => collect(self::REQUIREMENTS)->map(fn ($r, $k) => ['key' => strtoupper($k), 'title' => $r[0], 'body' => $r[1]])->values(),
            'kpis' => [
                'total' => $all->count(), 'certified' => $all->filter(fn ($p) => $p->isCertifiedSubscription())->count(),
                'pending' => $all->filter(fn ($p) => self::overall($p) === 'pending')->count(), 'not_certified' => $all->filter(fn ($p) => self::overall($p) === 'not_certified')->count(),
                'expiring' => $all->filter(fn ($p) => self::overall($p) === 'expiring')->count(), 'last' => Setting::get('recurrence_last_audit'),
                'mandates' => Mandate::query()->where('status', 'active')->count(),
            ],
            'reasons' => collect(self::REQUIREMENTS)->map(fn ($r, $k) => ['reason' => strtoupper($k).': '.$r[0], 'count' => $all->filter(fn ($p) => ($p->recurrence[$k] ?? null) !== 'pass')->count()])->values(),
            'filters' => $request->only(['status']),
        ]);
    }

    public function requirement(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->act === 'A3', 404);
        $data = $request->validate(['key' => ['required', 'in:r1,r2,r3,r4,r5'], 'status' => ['required', 'in:pass,pending,fail']]);
        $rec = $product->recurrence ?? [];
        $rec[$data['key']] = $data['status'];
        if ($data['key'] === 'r5') {
            $rec['mandate'] = $data['status'] === 'pass' ? 'captured' : ($data['status'] === 'fail' ? 'not_captured' : 'pending');
        }
        if ($data['status'] !== 'pass') {
            $rec['certified_at'] = null;
            $rec['expires_at'] = null;
        }
        $product->update(['recurrence' => $rec]);
        ListingGate::apply($product);
        Audit::log('recurrence', $product->sprint_code ?? $product->code, strtoupper($data['key'])." set to {$data['status']}");

        return back()->with('success', "{$product->name}: ".strtoupper($data['key'])." {$data['status']}.");
    }

    public function certify(Product $product): RedirectResponse
    {
        abort_unless($product->act === 'A3', 404);
        $rec = $product->recurrence ?? [];
        $failing = collect(array_keys(self::REQUIREMENTS))->reject(fn ($k) => ($rec[$k] ?? null) === 'pass');
        if ($failing->isNotEmpty()) {
            return back()->with('error', 'All five requirements (R1-R5) must be PASSED to certify. Outstanding: '.strtoupper($failing->implode(', ')));
        }
        $rec['certified_at'] = now()->toDateString();
        $rec['expires_at'] = now()->addYear()->toDateString();
        $product->update(['recurrence' => $rec]);
        ListingGate::apply($product);
        Audit::log('certify', $product->sprint_code ?? $product->code, 'Subscription certified (R1-R5 passed) until '.$rec['expires_at']);

        return back()->with('success', "{$product->name} certified. Recurring purchase is now enabled.");
    }

    public function audit(): RedirectResponse
    {
        Product::query()->where('act', 'A3')->each(fn ($p) => ListingGate::apply($p));
        Setting::put('recurrence_last_audit', now()->toIso8601String());
        Audit::log('recurrence-audit', 'Subscriptions', 'Recurrence audit run');

        return back()->with('success', 'Recurrence audit complete. Subscription listing states re-derived.');
    }

    /* --- OS-039 Retainer Capacity and C1-C5 ----------------------------------- */

    public function retainers(Request $request): Response
    {
        $all = RetainerCapacity::query()->with('product')->orderBy('code')->get();
        $complete = fn ($c) => ! collect($c->elements)->contains(false);
        $rows = $all
            ->when($request->query('status') === 'complete', fn ($c) => $c->filter($complete))
            ->when($request->query('status') === 'incomplete', fn ($c) => $c->reject($complete))
            ->when($request->query('owner'), fn ($c, $v) => $c->where('owner_model', $v));

        return Inertia::render('Shop/Admin/Retainers', [
            'rows' => $rows->values()->map(fn (RetainerCapacity $c) => [
                ...$c->only(['id', 'code', 'name', 'allowance', 'unit', 'period', 'scope', 'owner_model', 'owner', 'elements', 'reserved', 'utilised', 'under_use_months', 'review_state']),
                'complete' => $complete($c), 'utilisation' => $c->reserved > 0 ? round(100 * $c->utilised / $c->reserved, 2) : null,
                'under_use' => $c->under_use_months >= 6, 'product' => $c->product?->slug,
            ]),
            'kpis' => [
                'total' => $all->count(), 'complete' => $all->filter($complete)->count(), 'incomplete' => $all->reject($complete)->count(),
                'reserved' => $all->sum('reserved'), 'utilised' => $all->sum('utilised'), 'under_use' => $all->where('under_use_months', '>=', 6)->count(),
                'contracts' => $all->where('reserved', '>', 0)->count(),
            ],
            'elements' => collect(['c1' => 'Quantified Allowance', 'c2' => 'Bounded Scope + Exclusions', 'c3' => 'Reserved Capacity (Owner)', 'c4' => 'Unused Treatment', 'c5' => 'Overage Treatment'])
                ->map(fn ($label, $k) => ['key' => strtoupper($k), 'label' => $label, 'complete' => $all->filter(fn ($c) => $c->elements[$k] ?? false)->count(), 'missing' => $all->reject(fn ($c) => $c->elements[$k] ?? false)->count()])->values(),
            'rightSizing' => [
                'queue' => $all->where('under_use_months', '>=', 6)->whereNull('review_state')->count(),
                'review' => $all->where('review_state', 'under_review')->count(),
                'proposals' => $all->where('review_state', 'right_sizing_proposed')->count(),
                'adjusted' => $all->where('review_state', 'adjusted')->count(),
            ],
            'filters' => $request->only(['status', 'owner']),
        ]);
    }

    public function element(Request $request, RetainerCapacity $capacity): RedirectResponse
    {
        $data = $request->validate(['key' => ['required', 'in:c1,c2,c3,c4,c5']]);
        $elements = $capacity->elements;
        $elements[$data['key']] = ! ($elements[$data['key']] ?? false);
        $capacity->update(['elements' => $elements]);
        if ($capacity->product) {
            ListingGate::apply($capacity->product);
        }
        Audit::log('c1c5', $capacity->code, strtoupper($data['key']).' marked '.($elements[$data['key']] ? 'complete' : 'missing'));

        return back()->with('success', "{$capacity->name}: ".strtoupper($data['key']).' '.($elements[$data['key']] ? 'complete' : 'missing').'.');
    }

    public function review(RetainerCapacity $capacity): RedirectResponse
    {
        $next = match ($capacity->review_state) {
            null => 'under_review',
            'under_review' => 'right_sizing_proposed',
            'right_sizing_proposed' => 'adjusted',
            default => null,
        };
        abort_if($next === null, 409, 'Right-sizing already applied.');

        $update = ['review_state' => $next];
        if ($next === 'adjusted') {
            // Right-size to observed use (rounded up), never below one unit; reset the 6-month counter.
            $update += ['allowance' => max(1, ceil($capacity->utilised)), 'reserved' => max(1, ceil($capacity->utilised)), 'under_use_months' => 0];
        }
        $capacity->update($update);
        Audit::log('right-size', $capacity->code, 'Right-sizing -> '.str_replace('_', ' ', $next));

        return back()->with('success', "{$capacity->name}: ".str_replace('_', ' ', $next).'.');
    }

    /* --- OS-040 Native Handoff / Professional Boundary ------------------------ */

    public const STAGES = ['client_trigger', 'boundary_check', 'professional_match', 'handoff_in_progress', 'accepted', 'closed'];

    public function handoffs(Request $request): Response
    {
        $all = Handoff::query()->latest('id')->get();
        $rows = $all
            ->when($request->query('stage'), fn ($c, $v) => $c->where('stage', $v))
            ->when($request->query('type'), fn ($c, $v) => $c->where('professional_type', $v));

        return Inertia::render('Shop/Admin/Handoffs', [
            'rows' => $rows->values()->map(fn (Handoff $h) => [
                ...$h->only(['id', 'reference', 'sprint_code', 'product_name', 'vehicle', 'act', 'professional', 'professional_type', 'stage', 'risk', 'boundary', 'client_name', 'notes']),
                'date' => $h->created_at?->toIso8601String(), 'sla_due' => $h->sla_due?->toDateString(),
            ]),
            'kpis' => [
                'total' => $all->count(), 'handed' => $all->whereIn('stage', ['accepted', 'closed'])->count(),
                'progress' => $all->whereIn('stage', ['client_trigger', 'boundary_check', 'professional_match', 'handoff_in_progress'])->count(),
                'escalated' => $all->where('stage', 'escalated')->count(),
            ],
            'boundary' => $all->countBy('boundary'),
            'types' => $all->whereNotNull('professional_type')->countBy('professional_type'),
            'stages' => self::STAGES,
            'filters' => $request->only(['stage', 'type']),
        ]);
    }

    public function advance(Request $request, Handoff $handoff): RedirectResponse
    {
        $data = $request->validate(['professional' => ['nullable', 'string', 'max:190'], 'professional_type' => ['nullable', 'string', 'max:60']]);
        $stage = $handoff->stage === 'escalated' ? 'professional_match' : (self::STAGES[array_search($handoff->stage, self::STAGES, true) + 1] ?? null);
        abort_if($stage === null, 409, 'Handoff already closed.');

        if ($stage === 'handoff_in_progress' && ! ($data['professional'] ?? $handoff->professional)) {
            return back()->with('error', 'Match a verified professional before handing off.');
        }

        $handoff->update([
            'stage' => $stage,
            'professional' => $data['professional'] ?? $handoff->professional,
            'professional_type' => $data['professional_type'] ?? $handoff->professional_type,
            'boundary' => in_array($stage, ['professional_match', 'handoff_in_progress', 'accepted', 'closed'], true) && $handoff->boundary === 'pending_review' ? 'within' : $handoff->boundary,
        ]);
        Audit::log('handoff', $handoff->reference, 'Handoff -> '.str_replace('_', ' ', $stage));

        return back()->with('success', "{$handoff->reference} moved to ".str_replace('_', ' ', $stage).'.');
    }

    public function escalate(Request $request, Handoff $handoff): RedirectResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:300']]);
        $handoff->update(['stage' => 'escalated', 'risk' => 'high', 'boundary' => 'at_risk', 'notes' => trim(($handoff->notes ? $handoff->notes."\n" : '').'Escalated: '.$data['reason'])]);
        Audit::log('escalate', $handoff->reference, 'Boundary risk escalated: '.$data['reason']);

        return back()->with('success', "{$handoff->reference} escalated.");
    }
}
