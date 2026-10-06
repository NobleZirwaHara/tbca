<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\Proposal;
use App\Models\Advisory\Vehicle;
use App\Models\Advisory\VehicleChange;
use App\Models\Order;
use App\Support\Advisory\ServicesContent;
use App\Support\Platform\Checkout;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Proposal requests, vehicle transitions (transition / upgrade / recurrence /
 * downgrade / switch / exit) and the signed-in multi-vehicle views.
 */
class ServicesClientController extends Controller
{
    /** Target vehicle catalogue for transitions: key => [label, vehicle type, value ZAR, monthly]. */
    public const TARGETS = [
        'project' => ['Operational Improvement Project', 'Project', 74850, false],
        'mandate' => ['Operational Excellence Mandate', 'Mandate', 84500, false],
        'retainer-mandate' => ['Retainer Mandate', 'Retainer', 9950, true],
        'subscription-plan' => ['Subscription Plan', 'Subscription', 990, true],
        'managed-service' => ['Managed Service', 'Retainer', 14500, true],
        'project-retainer' => ['Project Retainer', 'Retainer', 29750, true],
        'sprint' => ['One-off Sprint', 'Sprint', 2450, false],
    ];

    private function myVehicles(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return collect();
        }

        return Vehicle::query()->where('user_id', $user->id)->orderBy('start_date')->get()->map(fn (Vehicle $v) => $this->present($v));
    }

    private function present(Vehicle $v): array
    {
        return [
            'code' => $v->code, 'name' => $v->name, 'type' => $v->type, 'status' => $v->status, 'engagement' => $v->engagement_ref,
            'start' => $v->start_date?->format('d M Y'), 'next_due' => $v->next_due_date?->format('d M Y'), 'next_due_raw' => $v->next_due_date?->toDateString(),
            'invoiced' => $v->invoiced_zar, 'paid' => $v->paid_zar, 'outstanding' => $v->outstanding(), 'overdue' => $v->overdue_zar,
            'health' => $v->health, 'owner' => $v->owner, 'progress' => $v->meta['progress'] ?? 50, 'label' => $v->meta['label'] ?? $v->type,
            'billing' => $v->billing_cycle,
        ];
    }

    public function proposal(Request $request): Response
    {
        return Inertia::render('Advisory/Services/Proposal', [
            'draft' => $request->session()->get('adv_proposal_draft', []),
            'families' => array_merge(array_keys(ServicesContent::pillars()), array_keys(ServicesContent::capabilities())),
            'outcomes' => ServicesContent::outcomes(),
            'budgets' => ServicesContent::budgets(),
            'industries' => ServicesContent::industries(),
            'countries' => array_values(array_diff(ServicesContent::countries(), ['Outside Africa'])),
        ]);
    }

    public function proposalStore(Request $request): RedirectResponse
    {
        if ($request->boolean('draft')) {
            $request->session()->put('adv_proposal_draft', $request->except('draft'));

            return back()->with('success', 'Draft saved. You can return to it any time in this session.');
        }
        $data = $request->validate([
            'family' => ['required', 'string', 'max:80'],
            'outcome' => ['required', 'string', 'max:80'],
            'urgency' => ['required', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
            'context' => ['required', 'string', 'min:20', 'max:1000'],
            'budget' => ['required', 'string'],
            'start' => ['required', 'string'],
            'mode' => ['required', 'string'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'company' => ['required', 'string', 'max:160'],
            'role' => ['nullable', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'country' => ['required', Rule::in(ServicesContent::countries())],
            'industry' => ['nullable', 'string'],
            'heard' => ['nullable', 'string'],
        ]);
        $p = Proposal::create([
            'reference' => Reference::make('PRP'), 'user_id' => $request->user()?->id, 'status' => 'submitted', 'kind' => 'proposal',
            'name' => $data['name'], 'email' => $data['email'], 'company' => $data['company'], 'payload' => $data,
        ]);
        $request->session()->forget('adv_proposal_draft');

        return back()->with('success', 'Proposal request received. We will review it within 1 business day.')->with('reference', $p->reference);
    }

    private function changePage(Request $request, string $page, string $type): Response
    {
        $vehicles = $this->myVehicles($request);

        return Inertia::render("Advisory/Services/{$page}", [
            'vehicles' => $vehicles,
            'targets' => collect(self::TARGETS)->map(fn ($t, $k) => ['key' => $k, 'label' => $t[0], 'type' => $t[1], 'value' => $t[2], 'monthly' => $t[3]])->values(),
            'changes' => $request->user() ? VehicleChange::query()->where('user_id', $request->user()->id)->where('type', $type)->latest()->limit(5)->get() : [],
        ]);
    }

    public function transition(Request $request): Response
    {
        return $this->changePage($request, 'Transition', 'transition');
    }

    public function upgrade(Request $request): Response
    {
        return $this->changePage($request, 'Upgrade', 'upgrade');
    }

    public function recurrence(Request $request): Response
    {
        return $this->changePage($request, 'Recurrence', 'recurrence');
    }

    public function downgrade(Request $request): Response
    {
        return $this->changePage($request, 'Downgrade', 'downgrade');
    }

    /** Computes credits and payable-now amounts, persists the change and, where due, raises an order. */
    public function changeStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['transition', 'upgrade', 'recurrence', 'downgrade', 'switch', 'exit'])],
            'vehicle' => ['required', 'string'],
            'target' => ['nullable', Rule::in(array_keys(self::TARGETS))],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
        $vehicle = Vehicle::query()->where('code', $data['vehicle'])->where('user_id', $request->user()->id)->firstOrFail();
        $target = ($data['target'] ?? null) ? self::TARGETS[$data['target']] : null;
        if (in_array($data['type'], ['transition', 'upgrade', 'recurrence', 'switch'], true) && ! $target) {
            return back()->withErrors(['target' => 'Choose the vehicle you want to move to.']);
        }
        $progress = $vehicle->meta['progress'] ?? 50;
        $delivered = (int) round($vehicle->invoiced_zar * $progress / 100);
        $credit = match ($data['type']) {
            'transition', 'upgrade' => $vehicle->paid_zar, // investment to date carried forward as credit
            'downgrade', 'switch', 'exit' => max(0, $vehicle->paid_zar - $delivered), // pro-rata unearned credit
            default => 0,
        };
        $newValue = $target[2] ?? 0;
        $payableNow = match ($data['type']) {
            'transition', 'upgrade' => (int) round(max(0, $newValue - $credit) * 0.5),
            default => 0,
        };
        $change = VehicleChange::create([
            'reference' => Reference::make('VTC'), 'user_id' => $request->user()->id, 'vehicle_id' => $vehicle->id, 'type' => $data['type'],
            'status' => $payableNow > 0 ? 'awaiting_payment' : 'requested', 'from_vehicle' => $vehicle->type, 'to_vehicle' => $target[0] ?? null,
            'new_value_zar' => $newValue, 'credit_zar' => $credit, 'payable_now_zar' => $payableNow,
            'payload' => ['notes' => $data['notes'] ?? null, 'delivered' => $delivered, 'progress' => $progress],
        ]);
        if ($payableNow > 0) {
            $order = Checkout::createOrder([[
                'item_type' => 'advisory', 'item_code' => $change->reference, 'name' => ucfirst($data['type']).": {$vehicle->name} → {$target[0]} (50% upfront)",
                'unit_zar' => $payableNow, 'meta' => ['vehicle' => $vehicle->code, 'change' => $change->reference],
            ]], $request->user(), 'advisory', ['return_url' => '/services/statement', 'title' => 'Vehicle transition — 50% upfront']);
            $change->update(['order_id' => $order->id]);

            return redirect()->route('checkout.show', $order);
        }
        if ($data['type'] === 'exit') {
            $vehicle->update(['status' => 'on_hold', 'next_milestone' => 'Exit & handover requested']);
        }

        return back()->with('success', match ($data['type']) {
            'exit' => 'Exit requested. We will confirm your final statement and handover.',
            'recurrence' => 'Recurrence request received. A specialist will agree terms with you.',
            default => 'Change requested. We will confirm terms, credits and timing.',
        })->with('reference', $change->reference);
    }

    private function reconcileChanges(Request $request): void
    {
        foreach (VehicleChange::query()->where('user_id', $request->user()->id)->where('status', 'awaiting_payment')->with(['order', 'vehicle'])->get() as $c) {
            if ($c->order?->isPaid() && $c->vehicle) {
                $c->update(['status' => 'completed']);
                $c->vehicle->update(['status' => 'completed', 'next_milestone' => 'Transitioned to '.$c->to_vehicle]);
                $type = self::TARGETS[collect(self::TARGETS)->search(fn ($t) => $t[0] === $c->to_vehicle) ?: 'project'][1];
                Vehicle::create([
                    'code' => 'VEH-'.now()->format('Y').'-'.str_pad((string) (Vehicle::query()->count() + 1), 4, '0', STR_PAD_LEFT),
                    'user_id' => $c->user_id, 'name' => $c->to_vehicle, 'client' => $c->vehicle->client, 'type' => $type,
                    'engagement_ref' => $c->reference, 'status' => 'active', 'start_date' => now(), 'next_milestone' => 'Kick-off',
                    'next_due_date' => now()->addMonth(), 'owner' => $c->vehicle->owner, 'health' => 90, 'last_activity' => now(),
                    'invoiced_zar' => (int) round($c->new_value_zar * 1.15), 'paid_zar' => (int) round(($c->payable_now_zar + $c->credit_zar) * 1.15),
                    'meta' => ['progress' => 0, 'label' => $type],
                ]);
            }
        }
    }

    public function statement(Request $request): Response
    {
        $this->reconcileChanges($request);
        $vehicles = $this->myVehicles($request);
        $soon = now()->addDays(30)->toDateString();

        return Inertia::render('Advisory/Services/Statement', [
            'vehicles' => $vehicles,
            'totals' => [
                'count' => $vehicles->where('status', 'active')->count(),
                'invoiced' => $vehicles->sum('invoiced'), 'paid' => $vehicles->sum('paid'), 'outstanding' => $vehicles->sum('outstanding'),
                'overdue' => $vehicles->sum('overdue'),
                'upcoming' => $vehicles->filter(fn ($v) => $v['outstanding'] > 0 && $v['next_due_raw'] && $v['next_due_raw'] <= $soon)->sum('outstanding'),
                'upcoming_count' => $vehicles->filter(fn ($v) => $v['outstanding'] > 0 && $v['next_due_raw'] && $v['next_due_raw'] <= $soon)->count(),
            ],
            'orders' => Order::query()->where('user_id', $request->user()->id)->where('section', 'advisory')->latest()->limit(8)->get(['reference', 'status', 'total_zar', 'created_at']),
        ]);
    }

    public function relationship(Request $request): Response
    {
        $vehicles = $this->myVehicles($request);
        $soon = now()->addDays(30)->toDateString();
        $first = Vehicle::query()->where('user_id', $request->user()->id)->min('start_date');

        return Inertia::render('Advisory/Services/Relationship', [
            'client' => $request->user()->company ?: $request->user()->name,
            'vehicles' => $vehicles,
            'since' => $first ? Carbon::parse($first)->format('d M Y') : null,
            'upcoming' => $vehicles->filter(fn ($v) => $v['outstanding'] > 0 && $v['next_due_raw'] && $v['next_due_raw'] <= $soon)->values(),
            'counts' => ['total' => $vehicles->count(), 'active' => $vehicles->where('status', 'active')->count(), 'on_hold' => $vehicles->where('status', 'on_hold')->count(), 'completed' => $vehicles->where('status', 'completed')->count(), 'cancelled' => $vehicles->where('status', 'archived')->count()],
            'activity' => VehicleChange::query()->where('user_id', $request->user()->id)->latest()->limit(4)->get(['reference', 'type', 'status', 'to_vehicle', 'created_at']),
        ]);
    }

    /** Fee panel totals: VAT 15% on taxable lines (disbursements are pass-through, zero VAT). */
    public static function feeTotals(array $fees): array
    {
        $subtotal = 0;
        $vat = 0;
        $discounts = 0;
        foreach ($fees as $f) {
            if (($f['status'] ?? '') === 'Paid' || ($f['type'] ?? '') === 'Tax') {
                continue;
            }
            $amount = $f['qty'] * $f['unit'];
            $lineVat = ($f['type'] === 'Disbursement') ? 0 : $amount * ServicesContent::VAT;
            if ($amount < 0) {
                $discounts += $amount + $lineVat;
            }
            $subtotal += $amount;
            $vat += $lineVat;
        }

        return ['subtotal' => round($subtotal, 2), 'vat' => round($vat, 2), 'discounts' => round($discounts, 2), 'total' => round($subtotal + $vat, 2)];
    }

    /** Ownership check that tolerates drivers returning integer keys as strings (e.g. Postgres via PDO). */
    private static function owns(Request $request, Vehicle $vehicle): bool
    {
        return $vehicle->user_id !== null && (int) $vehicle->user_id === (int) $request->user()->id;
    }

    /** "Vehicle Fee Panel" entry point: opens the signed-in client's own vehicle with fees due. */
    public function myFees(Request $request): RedirectResponse
    {
        $mine = Vehicle::query()->where('user_id', $request->user()->id)->orderBy('start_date')->get();
        $vehicle = $mine->first(fn (Vehicle $v) => ! empty($v->fees) && $v->outstanding() > 0) ?? $mine->first(fn (Vehicle $v) => ! empty($v->fees)) ?? $mine->first();
        if (! $vehicle && $request->user()->role === 'admin') {
            $vehicle = Vehicle::query()->whereNotNull('fees')->orderBy('code')->first();
        }

        return $vehicle
            ? redirect()->route('adv.services.fees', $vehicle)
            : redirect()->route('adv.services.relationship')->with('error', 'You do not have any active vehicles yet, so there is no fee panel to show.');
    }

    public function fees(Request $request, Vehicle $vehicle): Response|RedirectResponse
    {
        if (! self::owns($request, $vehicle) && $request->user()->role !== 'admin') {
            return redirect()->route('adv.services.relationship')->with('error', "Vehicle {$vehicle->code} belongs to another client. Showing your own vehicles instead.");
        }
        $this->reconcileFees($vehicle);
        $fees = collect($vehicle->fees ?? [])->map(fn ($f) => [...$f, 'amount' => $f['type'] === 'Tax' ? null : $f['qty'] * $f['unit'], 'vat' => in_array($f['type'], ['Disbursement', 'Tax'], true) ? 0 : round($f['qty'] * $f['unit'] * ServicesContent::VAT, 2)])->all();

        return Inertia::render('Advisory/Services/FeePanel', [
            'vehicle' => $this->present($vehicle),
            'fees' => $fees,
            'totals' => self::feeTotals($vehicle->fees ?? []),
            'pendingOrder' => $vehicle->meta['pending_order'] ?? null,
        ]);
    }

    private function reconcileFees(Vehicle $vehicle): void
    {
        $ref = $vehicle->meta['pending_order'] ?? null;
        if ($ref && Order::query()->where('reference', $ref)->value('status') === 'paid') {
            $totals = self::feeTotals($vehicle->fees ?? []);
            $fees = collect($vehicle->fees)->map(fn ($f) => $f['type'] === 'Tax' ? $f : [...$f, 'status' => 'Paid'])->all();
            $meta = $vehicle->meta;
            unset($meta['pending_order']);
            $vehicle->update(['fees' => $fees, 'paid_zar' => $vehicle->paid_zar + (int) round($totals['total']), 'meta' => $meta]);
        }
    }

    public function pay(Request $request, Vehicle $vehicle): RedirectResponse
    {
        abort_unless(self::owns($request, $vehicle), 403);
        $totals = self::feeTotals($vehicle->fees ?? []);
        $taxable = 0;
        $disb = 0;
        foreach ($vehicle->fees ?? [] as $f) {
            if (($f['status'] ?? '') === 'Paid' || $f['type'] === 'Tax') {
                continue;
            }
            if ($f['type'] === 'Disbursement') {
                $disb += $f['qty'] * $f['unit'];
            } else {
                $taxable += $f['qty'] * $f['unit'];
            }
        }
        if ($totals['total'] <= 0) {
            return back()->with('error', 'Nothing is currently due on this vehicle.');
        }
        $lines = [['item_type' => 'advisory', 'item_code' => $vehicle->code.'-FEES', 'name' => "{$vehicle->name} — vehicle fees (excl. VAT)", 'unit_zar' => (int) round($taxable), 'meta' => ['vehicle' => $vehicle->code]]];
        if ($disb > 0) {
            $lines[] = ['item_type' => 'advisory', 'item_code' => $vehicle->code.'-DISB', 'name' => "{$vehicle->name} — disbursements (pass-through)", 'unit_zar' => (int) round($disb), 'meta' => ['vehicle' => $vehicle->code]];
        }
        $order = Checkout::createOrder($lines, $request->user(), 'advisory', ['return_url' => "/services/vehicles/{$vehicle->code}/fees", 'title' => 'Vehicle fee payment']);
        $vehicle->update(['meta' => [...($vehicle->meta ?? []), 'pending_order' => $order->reference]]);

        return redirect()->route('checkout.show', $order);
    }
}
