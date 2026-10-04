<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\BiasAlert;
use App\Models\Advisory\Crosswalk;
use App\Models\Advisory\Disposition;
use App\Models\Advisory\Proposal;
use App\Models\Advisory\SpineCheck;
use App\Models\Advisory\Vehicle;
use App\Models\Advisory\VehicleChange;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Services governance consoles: vehicle register, crosswalks, dispositions, floor, bias, spine and performance. */
class ServicesAdminController extends Controller
{
    public const SPINE_RULES = [
        1 => 'Engagement Architecture', 2 => 'Vehicle & Pricing Integrity', 3 => 'Multi-Vehicle Integrity', 4 => 'Transaction & Payment',
        5 => 'Disclosures & Transparency', 6 => 'Margin & Fairness', 7 => 'Data, VAT & Disbursements', 8 => 'Audit & Traceability',
    ];

    public function vehicles(Request $request): Response
    {
        $f = $request->only(['q', 'client', 'status', 'type', 'owner']);
        $q = Vehicle::query()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%")->orWhere('client', 'like', "%{$v}%")))
            ->when($f['client'] ?? null, fn ($b, $v) => $b->where('client', $v))
            ->when($f['status'] ?? null, fn ($b, $v) => $b->where('status', $v))
            ->when($f['type'] ?? null, fn ($b, $v) => $b->where('type', $v))
            ->when($f['owner'] ?? null, fn ($b, $v) => $b->where('owner', $v))
            ->orderBy('code');
        $all = Vehicle::query()->get();

        return Inertia::render('Advisory/Admin/Vehicles', [
            'vehicles' => $q->paginate(10)->withQueryString()->through(fn (Vehicle $v) => [
                'code' => $v->code, 'name' => $v->name, 'client' => $v->client, 'type' => $v->type, 'engagement' => $v->engagement_ref,
                'status' => $v->status, 'start' => $v->start_date?->format('d M Y'), 'milestone' => $v->next_milestone,
                'milestone_date' => $v->next_due_date?->format('d M Y'), 'owner' => $v->owner, 'health' => $v->health, 'last' => $v->last_activity?->format('d M Y'),
            ]),
            'filters' => $f,
            'options' => ['clients' => $all->pluck('client')->unique()->sort()->values(), 'owners' => $all->pluck('owner')->filter()->unique()->sort()->values(), 'types' => ['Mandate', 'Sprint', 'Subscription', 'Product', 'Retainer']],
            'summary' => [
                'total' => $all->count(), 'active' => $all->where('status', 'active')->count(), 'completed' => $all->where('status', 'completed')->count(),
                'on_hold' => $all->where('status', 'on_hold')->count(), 'archived' => $all->where('status', 'archived')->count(),
                'clients' => $all->pluck('client')->unique()->count(), 'engagements' => $all->pluck('engagement_ref')->unique()->count(),
                'health' => (int) round($all->whereNotNull('health')->avg('health') ?? 0),
            ],
        ]);
    }

    public function vehicleStore(Request $request): RedirectResponse
    {
        $d = $request->validate([
            'name' => ['required', 'string', 'max:120'], 'client' => ['required', 'string', 'max:160'],
            'type' => ['required', Rule::in(['Mandate', 'Sprint', 'Subscription', 'Product', 'Retainer'])],
            'owner' => ['required', 'string', 'max:80'], 'value' => ['required', 'integer', 'min:0'],
        ]);
        $n = Vehicle::query()->count() + 1;
        do {
            $code = sprintf('VEH-%s-%04d', now()->format('Y'), $n++);
        } while (Vehicle::query()->where('code', $code)->exists());
        $prefix = ['Mandate' => 'MD', 'Sprint' => 'SP', 'Subscription' => 'SUB', 'Product' => 'PROD', 'Retainer' => 'RET'][$d['type']];
        Vehicle::create([
            'code' => $code, 'name' => $d['name'], 'client' => $d['client'], 'type' => $d['type'], 'owner' => $d['owner'],
            'engagement_ref' => sprintf('%s-%s-%05d', $prefix, now()->format('Y'), random_int(100, 999)), 'status' => 'active',
            'start_date' => now(), 'next_milestone' => 'Kick-off', 'next_due_date' => now()->addWeeks(2), 'health' => 100, 'last_activity' => now(),
            'current_price_zar' => $d['value'], 'floor_price_zar' => $d['value'], 'revenue_zar' => 0, 'direct_cost_zar' => 0, 'meta' => ['progress' => 0],
        ]);

        return back()->with('success', "Vehicle {$code} registered.");
    }

    public function vehicleStatus(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $d = $request->validate(['status' => ['required', Rule::in(['active', 'on_hold', 'completed', 'archived'])]]);
        $vehicle->update(['status' => $d['status'], 'last_activity' => now()]);

        return back()->with('success', "{$vehicle->code} set to ".str_replace('_', ' ', $d['status']).'.');
    }

    public function crosswalk(Request $request): Response
    {
        $f = $request->only(['q', 'source', 'target', 'relationship', 'status']);
        $q = Crosswalk::query()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('source_label', 'like', "%{$v}%")->orWhere('target_label', 'like', "%{$v}%")->orWhere('source_code', 'like', "%{$v}%")->orWhere('target_code', 'like', "%{$v}%")))
            ->when($f['source'] ?? null, fn ($b, $v) => $b->where('source_taxonomy', $v))
            ->when($f['target'] ?? null, fn ($b, $v) => $b->where('target_taxonomy', $v))
            ->when($f['relationship'] ?? null, fn ($b, $v) => $b->where('relationship', $v))
            ->when($f['status'] ?? null, fn ($b, $v) => $b->where('status', $v))
            ->orderBy('id');
        $all = Crosswalk::query()->get();

        return Inertia::render('Advisory/Admin/Crosswalk', [
            'rows' => $q->paginate(10)->withQueryString(),
            'filters' => $f,
            'options' => ['sources' => $all->pluck('source_taxonomy')->unique()->values(), 'targets' => $all->pluck('target_taxonomy')->unique()->values(), 'relationships' => ['Exact Match', 'Broad Match', 'Narrow Match', 'Related Match']],
            'summary' => [
                'total' => $all->count(), 'validated' => $all->where('status', 'validated')->count(), 'review' => $all->where('status', 'under_review')->count(),
                'attention' => $all->where('status', 'needs_attention')->count(), 'sources' => $all->pluck('source_taxonomy')->unique()->count(),
                'targets' => $all->pluck('target_taxonomy')->unique()->count(), 'confidence' => (int) round($all->avg('confidence') ?? 0),
                'low' => $all->where('confidence', '<', 80)->count(),
            ],
        ]);
    }

    public function crosswalkStore(Request $request): RedirectResponse
    {
        $d = $request->validate([
            'source_taxonomy' => ['required', 'string', 'max:80'], 'source_code' => ['required', 'string', 'max:40'], 'source_label' => ['required', 'string', 'max:160'],
            'target_taxonomy' => ['required', 'string', 'max:80'], 'target_code' => ['required', 'string', 'max:40'], 'target_label' => ['required', 'string', 'max:160'],
            'relationship' => ['required', Rule::in(['Exact Match', 'Broad Match', 'Narrow Match', 'Related Match'])], 'confidence' => ['required', 'integer', 'min:0', 'max:100'],
        ]);
        Crosswalk::updateOrCreate(['source_taxonomy' => $d['source_taxonomy'], 'source_code' => $d['source_code'], 'target_taxonomy' => $d['target_taxonomy']], [...$d, 'status' => 'under_review', 'last_verified' => null]);

        return back()->with('success', 'Mapping created and queued for review.');
    }

    /** Validation run: low confidence (<80%) needs attention; narrow matches stay under review. */
    public function crosswalkValidate(): RedirectResponse
    {
        $changed = 0;
        foreach (Crosswalk::query()->get() as $c) {
            $status = $c->confidence < 80 ? 'needs_attention' : ($c->relationship === 'Narrow Match' || $c->status === 'under_review' ? 'under_review' : 'validated');
            if ($status !== $c->status) {
                $c->update(['status' => $status]);
                $changed++;
            }
        }

        return back()->with('success', "Validation completed — {$changed} mapping(s) changed status.");
    }

    public function crosswalkVerify(Request $request, Crosswalk $crosswalk): RedirectResponse
    {
        if ($crosswalk->confidence < 80) {
            return back()->with('error', 'Mappings below 80% confidence cannot be validated. Raise confidence first.');
        }
        $crosswalk->update(['status' => 'validated', 'last_verified' => now()]);

        return back()->with('success', 'Mapping validated.');
    }

    public function dispositions(Request $request): Response
    {
        $f = $request->only(['q', 'client', 'vehicle', 'disposition', 'type', 'owner']);
        $q = Disposition::query()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('code', 'like', "%{$v}%")->orWhere('description', 'like', "%{$v}%")->orWhere('client', 'like', "%{$v}%")))
            ->when($f['client'] ?? null, fn ($b, $v) => $b->where('client', $v))
            ->when($f['vehicle'] ?? null, fn ($b, $v) => $b->where('vehicle_code', $v))
            ->when($f['disposition'] ?? null, fn ($b, $v) => $b->where('disposition', $v))
            ->when($f['type'] ?? null, fn ($b, $v) => $b->where('type', $v))
            ->when($f['owner'] ?? null, fn ($b, $v) => $b->where('owner', $v))
            ->orderByDesc('start_date');
        $all = Disposition::query()->get();
        $counts = $all->groupBy('disposition')->map->count();
        $vehicleNames = Vehicle::query()->pluck('name', 'code');

        return Inertia::render('Advisory/Admin/Dispositions', [
            'rows' => $q->paginate(10)->withQueryString()->through(fn ($d) => [...$d->toArray(), 'vehicle_name' => $vehicleNames[$d->vehicle_code] ?? '', 'start' => $d->start_date?->format('d M Y'), 'target' => $d->target_date?->format('d M Y')]),
            'filters' => $f,
            'counts' => $counts, 'total' => $all->count(), 'vehicleCount' => $all->pluck('vehicle_code')->unique()->count(),
            'progress' => $all->count() ? (int) round($all->whereIn('disposition', ['authorised', 'completed'])->count() / $all->count() * 100) : 0,
            'options' => ['clients' => $all->pluck('client')->unique()->values(), 'vehicles' => $all->pluck('vehicle_code')->unique()->sort()->values(), 'owners' => $all->pluck('owner')->unique()->values()],
        ]);
    }

    public function dispositionUpdate(Request $request, Disposition $disposition): RedirectResponse
    {
        $d = $request->validate([
            'disposition' => ['nullable', Rule::in(['authorised', 'awaiting_client_input', 'blocked', 'completed', 'cancelled'])],
            'owner' => ['nullable', 'string', 'max:80'],
            'vehicle_code' => ['nullable', 'string', 'exists:adv_vehicles,code'],
        ]);
        $patch = array_filter($d);
        if (isset($patch['disposition'])) {
            $patch['status'] = ['authorised' => 'In Progress', 'awaiting_client_input' => 'Awaiting Input', 'blocked' => 'Blocked', 'completed' => 'Completed', 'cancelled' => 'Cancelled'][$patch['disposition']];
        }
        $disposition->update($patch);

        return back()->with('success', "{$disposition->code} updated.");
    }

    /** Subscription-vs-Retainer disposition engine over a vehicle's sprint usage. */
    public static function analyse(Vehicle $v): array
    {
        $usage = $v->meta['usage'] ?? ['weeks' => [4, 5, 6, 5, 9, 4, 6, 5, 3], 'categories' => ['Strategy & Advisory' => [18, 'Increasing'], 'Diagnostics & Assessments' => [9, 'Stable'], 'Data & Product Access' => [7, 'Increasing'], 'Compliance & Verification' => [6, 'Stable'], 'Project & Execution' => [7, 'Stable']], 'processed' => 96, 'codes' => 18, 'value' => 47250];
        $weeks = $usage['weeks'];
        $total = array_sum(array_column($usage['categories'], 0));
        $mean = count($weeks) ? array_sum($weeks) / count($weeks) : 0;
        $sd = count($weeks) ? sqrt(array_sum(array_map(fn ($w) => ($w - $mean) ** 2, $weeks)) / count($weeks)) : 0;
        $cv = $mean > 0 ? $sd / $mean : 1;
        $days = $v->start_date ? (int) $v->start_date->diffInDays(now()) : 62;
        $days = min(max($days, 7), 365);
        $advisoryShare = $total ? ($usage['categories']['Strategy & Advisory'][0] ?? 0) / $total : 0;
        $consistency = $cv < 0.3 ? 'High' : ($cv < 0.5 ? 'Medium' : 'Low');
        $predictability = $cv < 0.25 ? 'High' : ($cv < 0.45 ? 'Medium' : 'Low');
        $capacity = max($weeks ?: [0]) > $mean * 1.5 ? 'Medium' : 'Low';
        $subscription = (int) (round(($mean * 4.33 * 820) / 250) * 250);
        $retainer = (int) (round(($mean * 4.33 * 1960) / 250) * 250);
        $recommend = ($advisoryShare > 0.55 && $predictability !== 'High') || $capacity === 'High' ? 'Retainer' : 'Subscription';

        return [
            'total' => $total, 'processed' => $usage['processed'], 'codes' => $usage['codes'], 'avg' => round($mean, 1), 'peak' => max($weeks ?: [0]),
            'age' => $days, 'value' => $usage['value'],
            'categories' => collect($usage['categories'])->map(fn ($c, $name) => ['name' => $name, 'used' => $c[0], 'pct' => $total ? round($c[0] / $total * 100) : 0, 'avg' => round($c[0] / max(1, count($weeks)), 1), 'trend' => $c[1]])->values(),
            'indicators' => ['Consistency' => $consistency, 'Predictability' => $predictability, 'Duration Fit' => $days >= 90 ? 'High' : 'Medium', 'Capacity Need' => $capacity, 'Budget Stability' => $consistency],
            'subscription' => $subscription, 'retainer' => $retainer, 'recommend' => $recommend,
            'savings' => $retainer - $subscription, 'savings_pct' => $retainer ? round(($retainer - $subscription) / $retainer * 100) : 0,
        ];
    }

    public function dispositionTool(Request $request): Response
    {
        $vehicles = Vehicle::query()->whereIn('status', ['active', 'on_hold'])->orderBy('client')->get();
        $selected = $vehicles->firstWhere('code', $request->query('vehicle')) ?? $vehicles->firstWhere('code', 'VEH-2025-0001') ?? $vehicles->first();

        return Inertia::render('Advisory/Admin/DispositionTool', [
            'vehicles' => $vehicles->map(fn ($v) => ['code' => $v->code, 'label' => "{$v->name} ({$v->engagement_ref})", 'client' => $v->client])->values(),
            'selected' => $selected?->code,
            'client' => $selected?->client,
            'analysis' => $selected ? self::analyse($selected) : null,
            'disposition' => $selected?->meta['disposition'] ?? null,
            'period' => $selected?->start_date ? $selected->start_date->format('d M Y').' – '.now()->format('d M Y') : null,
        ]);
    }

    public function dispositionApply(Request $request): RedirectResponse
    {
        $d = $request->validate(['vehicle' => ['required', 'exists:adv_vehicles,code'], 'to' => ['required', Rule::in(['Subscription', 'Retainer'])]]);
        $v = Vehicle::query()->where('code', $d['vehicle'])->firstOrFail();
        $a = self::analyse($v);
        VehicleChange::create([
            'reference' => Reference::make('VTC'), 'user_id' => $v->user_id, 'vehicle_id' => $v->id, 'type' => 'switch', 'status' => 'requested',
            'from_vehicle' => $v->type, 'to_vehicle' => $d['to'], 'new_value_zar' => $d['to'] === 'Subscription' ? $a['subscription'] : $a['retainer'],
            'payload' => ['source' => 'disposition-tool', 'recommendation' => $a['recommend']],
        ]);
        $v->update(['meta' => [...($v->meta ?? []), 'disposition' => ['to' => $d['to'], 'at' => now()->toDateString(), 'recommended' => $a['recommend']]]]);

        return back()->with('success', "Switch to {$d['to']} proposed for {$v->code}. The engagement manager will confirm with the client.");
    }

    public static function floorRow(Vehicle $v): array
    {
        $variance = $v->current_price_zar - $v->floor_price_zar;
        $pct = $v->floor_price_zar ? round($variance / $v->floor_price_zar * 100) : 0;
        $priority = $pct <= -40 ? 'high' : ($pct <= -10 ? 'medium' : 'low');

        return [
            'code' => $v->code, 'engagement' => $v->meta['eng'] ?? $v->engagement_ref, 'sprint' => $v->meta['sku'] ?? $v->engagement_ref, 'type' => $v->meta['label'] ?? $v->type,
            'client' => $v->client, 'current' => $v->current_price_zar, 'floor' => $v->floor_price_zar, 'variance' => $variance, 'pct' => $pct, 'priority' => $priority,
            'status' => $v->remediation_status ?? 'open', 'action' => $v->remediation_action ?? 'Increase Price', 'due' => $v->remediation_due?->format('d M Y'), 'owner' => $v->owner,
        ];
    }

    public function belowFloor(Request $request): Response
    {
        $f = $request->only(['q', 'type', 'status', 'priority']);
        $rows = Vehicle::query()->whereColumn('current_price_zar', '<', 'floor_price_zar')->orWhere('remediation_status', 'remediated')->get()
            ->map(fn ($v) => self::floorRow($v))
            ->filter(fn ($r) => (empty($f['q']) || str_contains(strtolower($r['client'].$r['engagement'].$r['sprint']), strtolower($f['q'])))
                && (empty($f['type']) || $r['type'] === $f['type']) && (empty($f['status']) || $r['status'] === $f['status']) && (empty($f['priority']) || $r['priority'] === $f['priority']))
            ->sortBy('pct')->values();
        $open = $rows->where('status', '!=', 'remediated');
        $floor = $open->sum('floor');
        $current = $open->sum('current');

        return Inertia::render('Advisory/Admin/BelowFloor', [
            'rows' => $rows, 'filters' => $f,
            'kpis' => [
                'count' => $open->count(), 'value' => $floor - $current, 'impact' => $floor ? round(($current - $floor) / $floor * 100) : 0,
                'action' => $open->whereIn('priority', ['high', 'medium'])->count(), 'remediated' => $rows->where('status', 'remediated')->count(),
                'floor' => $floor, 'current' => $current,
            ],
            'priority' => ['high' => $open->where('priority', 'high')->count(), 'medium' => $open->where('priority', 'medium')->count(), 'low' => $open->where('priority', 'low')->count()],
            'types' => $rows->pluck('type')->unique()->values(),
        ]);
    }

    public function remediate(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $d = $request->validate(['action' => ['required', Rule::in(['Increase Price', 'Top-up Invoice', 'Add Sprints', 'Re-scope', 'Adjust Retainer', 'Minor Adjust', 'Adjust Scope'])], 'complete' => ['boolean']]);
        if ($request->boolean('complete')) {
            $vehicle->update(['remediation_action' => $d['action'], 'remediation_status' => 'remediated', 'current_price_zar' => $vehicle->floor_price_zar]);

            return back()->with('success', "{$vehicle->code} remediated to floor ({$d['action']}).");
        }
        $vehicle->update(['remediation_action' => $d['action'], 'remediation_status' => 'in_progress', 'remediation_due' => $vehicle->remediation_due ?? now()->addDays(14)]);

        return back()->with('success', "Remediation plan set: {$d['action']}.");
    }

    public function marginBias(Request $request): Response
    {
        $all = BiasAlert::query()->get();
        $bucket = fn ($s) => $s < -0.40 ? 'high' : ($s < -0.10 ? 'medium' : ($s <= 0.10 ? 'low' : ($s <= 0.40 ? 'clean' : 'positive')));
        $dist = ['high' => 0, 'medium' => 0, 'low' => 0, 'clean' => 0, 'positive' => 0];
        foreach ($all as $a) {
            $dist[$bucket($a->score)]++;
        }
        $byCat = $all->groupBy('category')->map(fn ($g) => round($g->avg('score'), 2))->sort();
        $byOwner = $all->groupBy('owner')->map(fn ($g) => round($g->avg('score'), 2))->sort();

        return Inertia::render('Advisory/Admin/MarginBias', [
            'kpis' => ['total' => $all->count(), 'avg' => round($all->avg('score') ?? 0, 2), ...$dist],
            'byCategory' => $byCat,
            'high' => BiasAlert::query()->where('score', '<', -0.40)->orderBy('score')->get(),
            'summary' => ['negative' => [$byCat->keys()->first(), $byCat->first()], 'positive' => [$byCat->keys()->last(), $byCat->last()], 'biasedOwner' => $byOwner->keys()->first(), 'cleanOwner' => [$byOwner->keys()->last(), $byOwner->last()]],
            'drivers' => $all->where('score', '<', -0.10)->groupBy('reason')->map(fn ($g) => ['count' => $g->count(), 'impact' => round($g->avg('score'), 2)])->sortBy('impact')->take(5),
        ]);
    }

    public function biasUpdate(Request $request, BiasAlert $alert): RedirectResponse
    {
        $d = $request->validate(['status' => ['required', Rule::in(['open', 'under_review', 'resolved'])]]);
        $alert->update($d);

        return back()->with('success', "{$alert->engagement} marked ".str_replace('_', ' ', $d['status']).'.');
    }

    public function spine(Request $request): Response
    {
        $checks = SpineCheck::query()->orderByDesc('detected_on')->get();
        $base = 1200;
        $breach = $checks->whereIn('severity', ['high', 'medium', 'low'])->where('status', '!=', 'resolved')->count();
        $critical = $checks->where('severity', 'critical')->where('status', '!=', 'resolved')->count();
        $warning = 97;
        $total = $base + $checks->count();
        $compliant = $total - $breach - $critical - $warning;
        $rules = [];
        foreach (self::SPINE_RULES as $n => $name) {
            $open = $checks->where('rule_category', $n)->where('status', '!=', 'resolved')->count();
            $score = round(100 - $open * 1.6 - ($n === 6 ? 6 : ($n === 5 ? 4 : ($n === 3 ? 3.5 : 1.5))), 1);
            $rules[] = ['n' => $n, 'name' => $name, 'score' => $score, 'status' => $score >= 95 ? 'Healthy' : ($score >= 90 ? 'Monitor' : 'At Risk')];
        }

        return Inertia::render('Advisory/Admin/Spine', [
            'kpis' => ['total' => $total, 'compliant' => $compliant, 'warning' => $warning, 'breach' => $breach, 'critical' => $critical, 'score' => round($compliant / $total * 100 + ($warning / $total * 100) * 0.7, 1)],
            'rules' => $rules,
            'breaches' => $checks->where('status', '!=', 'resolved')->values(),
            'resolved' => $checks->where('status', 'resolved')->count(),
        ]);
    }

    /** Re-run the spine: flag every below-floor vehicle without an open Rule 6.2 breach. */
    public function spineRun(): RedirectResponse
    {
        $created = 0;
        foreach (Vehicle::query()->whereColumn('current_price_zar', '<', 'floor_price_zar')->where(fn ($q) => $q->whereNull('remediation_status')->orWhere('remediation_status', '!=', 'remediated'))->get() as $v) {
            $exists = SpineCheck::query()->where('engagement', 'like', $v->engagement_ref.'%')->where('rule', 'like', 'Rule 6.2%')->where('status', '!=', 'resolved')->exists();
            if (! $exists) {
                SpineCheck::create([
                    'code' => 'CHK-'.now()->format('Y').'-'.str_pad((string) (SpineCheck::query()->count() + 413), 4, '0', STR_PAD_LEFT),
                    'engagement' => "{$v->engagement_ref} / {$v->name}", 'client' => $v->client, 'rule' => 'Rule 6.2: Below-Floor Pricing', 'rule_category' => 6,
                    'breach_type' => 'Pricing Breach', 'severity' => 'high', 'detected_on' => now(), 'owner' => $v->owner ?? 'Unassigned', 'status' => 'open',
                    'action_required' => 'Adjust pricing to floor', 'due_date' => now()->addDays(10),
                ]);
                $created++;
            }
        }

        return back()->with('success', "Compliance check completed — {$created} new breach(es) detected.");
    }

    public function spineUpdate(Request $request, SpineCheck $check): RedirectResponse
    {
        $d = $request->validate(['status' => ['required', Rule::in(['open', 'in_progress', 'resolved'])]]);
        $check->update($d);

        return back()->with('success', "{$check->code} marked ".str_replace('_', ' ', $d['status']).'.');
    }

    /** Lifecycle recommendation from margin and utilisation. */
    public static function lifecycle(float $margin, int $util): string
    {
        return match (true) {
            $margin < 0 && $util < 20 => 'Retire / Sunset',
            $margin < 0 && $util < 25 => 'Consolidate / Merge',
            $margin < 10 => 'Optimise / Improve',
            $margin >= 40 && $util >= 80 => 'Growth / Scale',
            default => 'Maintain / Monitor',
        };
    }

    public function performance(Request $request): Response
    {
        $f = $request->only(['type', 'status']);
        $vehicles = Vehicle::query()->where('revenue_zar', '>', 0)->get()->map(function ($v) {
            $margin = $v->revenue_zar ? round(($v->revenue_zar - $v->direct_cost_zar) / $v->revenue_zar * 100, 1) : 0;
            $status = $margin < 0 ? 'Below Floor' : ($margin < 10 ? 'At Risk' : 'Healthy');

            return ['code' => $v->meta['perf_code'] ?? $v->code, 'name' => $v->name, 'type' => $v->type, 'engagement' => $v->meta['label'] ?? $v->type, 'revenue' => $v->revenue_zar, 'cost' => $v->direct_cost_zar,
                'margin' => $margin, 'util' => $v->utilisation, 'status' => $status, 'lifecycle' => self::lifecycle($margin, $v->utilisation), 'owner' => $v->owner];
        })->filter(fn ($r) => (empty($f['type']) || $r['type'] === $f['type']) && (empty($f['status']) || $r['status'] === $f['status']))->values();
        $rev = $vehicles->sum('revenue');
        $cost = $vehicles->sum('cost');
        $bucket = fn ($m) => $m >= 40 ? '≥ 40% (Excellent)' : ($m >= 30 ? '30% - 40% (Good)' : ($m >= 20 ? '20% - 30% (Acceptable)' : ($m >= 10 ? '10% - 20% (At Risk)' : '< 10% (Critical)')));
        $ubucket = fn ($u) => $u >= 80 ? '≥ 80% (High)' : ($u >= 50 ? '50% - 80% (Medium)' : ($u >= 25 ? '25% - 50% (Medium)' : ($u >= 10 ? '10% - 25% (Low)' : '< 10% (Very Low)')));

        return Inertia::render('Advisory/Admin/Performance', [
            'rows' => $vehicles->sortBy('margin')->values(),
            'filters' => $f,
            'kpis' => [
                'total' => $vehicles->count(), 'active' => Vehicle::query()->where('status', 'active')->count(), 'margin' => $rev ? round(($rev - $cost) / $rev * 100, 1) : 0,
                'below' => $vehicles->where('status', 'Below Floor')->count(), 'under' => $vehicles->where('util', '<', 25)->count(), 'retire' => $vehicles->where('lifecycle', 'Retire / Sunset')->count(),
                'revenue' => $rev, 'cost' => $cost, 'profit' => $rev - $cost, 'loss' => $vehicles->where('margin', '<', 0)->sum(fn ($r) => $r['revenue'] - $r['cost']),
            ],
            'marginDist' => $vehicles->groupBy(fn ($r) => $bucket($r['margin']))->map->count(),
            'utilDist' => $vehicles->groupBy(fn ($r) => $ubucket($r['util']))->map->count(),
            'lifecycle' => $vehicles->groupBy('lifecycle')->map->count(),
        ]);
    }

    public function proposals(): Response
    {
        return Inertia::render('Advisory/Admin/Proposals', [
            'proposals' => Proposal::query()->latest()->limit(50)->get(),
            'changes' => VehicleChange::query()->with('vehicle:id,code,name')->latest()->limit(30)->get(),
        ]);
    }

    public function proposalUpdate(Request $request, Proposal $proposal): RedirectResponse
    {
        $d = $request->validate(['status' => ['required', Rule::in(['submitted', 'in_review', 'proposal_sent', 'closed'])]]);
        $proposal->update($d);

        return back()->with('success', "{$proposal->reference} → ".str_replace('_', ' ', $d['status']).'.');
    }
}
