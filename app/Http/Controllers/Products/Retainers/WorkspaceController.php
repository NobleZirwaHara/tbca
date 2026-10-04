<?php

namespace App\Http\Controllers\Products\Retainers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Retainers\Event;
use App\Models\Products\Retainers\Period;
use App\Models\Products\Retainers\Proposal;
use App\Models\Products\Retainers\Retainer;
use App\Models\Products\Retainers\Usage;
use App\Support\Products\Retainers\Catalogue;
use App\Support\Products\Retainers\Engine;
use App\Support\Products\Retainers\Presenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/** Track B: the signed-in client's Retainer workspace (/retainers/account/...). */
class WorkspaceController extends Controller
{
    protected function own(Request $request, Retainer $retainer): Retainer
    {
        $user = $request->user();
        abort_unless($retainer->user_id === $user->id || $user->role === 'admin', 403);
        Engine::syncActivation($retainer);
        Engine::expireOverages($retainer);

        return $retainer->fresh();
    }

    /** Shared header props for every retainer page. */
    protected function context(Retainer $r): array
    {
        $order = $r->order_id ? Order::find($r->order_id) : null;

        return [
            'retainer' => Presenter::retainer($r),
            'meter' => Engine::meter($r),
            'badges' => [
                'overage' => $r->overages()->where('status', 'requested')->count(),
                'substitution' => $r->substitutions()->whereIn('status', ['awaiting_approval', 'discuss'])->count(),
                'alert' => $r->alerts()->whereIn('status', ['new', 'in_progress', 'escalated'])->exists(),
                'disputes' => $r->disputes()->where('status', 'under_review')->count(),
            ],
            'order' => $order ? ['reference' => $order->reference, 'status' => $order->status, 'total_zar' => $order->total_zar] : null,
        ];
    }

    /** Running balance after each confirmed included line, within a period. */
    protected function withBalance(Period $p, Collection $lines): Collection
    {
        $balance = $p->opening_units + $p->carry_units + $p->credit_units;
        $map = [];
        foreach ($lines->sortBy('occurred_at') as $u) {
            if ($u->billing_effect === 'INCLUDED' && in_array($u->status, ['confirmed', 'corrected'], true)) {
                $balance -= $u->units;
            }
            $map[$u->id] = round(max(0, $balance), 2);
        }

        return $lines->map(fn (Usage $u) => [...Presenter::usage($u), 'balance_after' => $map[$u->id] ?? null]);
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $retainers = Retainer::where('user_id', $user->id)->orderBy('code')->get();
        $retainers->each(fn ($r) => Engine::syncActivation($r));
        $retainers = $retainers->map->fresh();

        $rows = $retainers->map(fn (Retainer $r) => [...Presenter::retainer($r), 'meter' => Engine::meter($r), 'order_status' => $r->order_id ? Order::find($r->order_id)?->status : null]);
        $live = $rows->whereIn('status', ['active', 'cancelling']);

        // Utilisation trend: last six periods across live retainers.
        $trend = collect(range(5, 0))->map(function ($back) use ($retainers) {
            $used = 0;
            $den = 0;
            $label = null;
            foreach ($retainers as $r) {
                $p = $r->periods()->orderByDesc('starts_on')->skip($back)->first();
                if ($p) {
                    $m = Engine::meter($r, $p);
                    $used += $m['confirmed'];
                    $den += $m['denominator'];
                    $label ??= $p->starts_on->format('M');
                }
            }

            return ['label' => $label ?? '', 'value' => $den > 0 ? round($used / $den * 100) : 0];
        })->filter(fn ($x) => $x['label'] !== '')->values();

        $alerts = [];
        foreach ($retainers as $r) {
            $m = Engine::meter($r);
            if (($m['state'] ?? null) === 'NEAR_EXHAUSTION') {
                $alerts[] = ['tone' => 'bad', 'title' => 'Retainer limit approaching', 'body' => "{$r->name} is at {$m['utilisation']}% utilisation with {$m['days_left']} days left.", 'href' => "/retainers/account/{$r->code}"];
            }
            foreach ($r->overages()->where('status', 'requested')->get() as $o) {
                $alerts[] = ['tone' => 'warn', 'title' => 'Overage approval required', 'body' => "{$o->units} hours overage pending your prior approval.", 'href' => "/retainers/account/{$r->code}/overage"];
            }
            if ($r->substitutions()->where('status', 'awaiting_approval')->exists()) {
                $alerts[] = ['tone' => 'warn', 'title' => 'Substitution notice', 'body' => "A change to your named adviser on {$r->name} needs your decision.", 'href' => "/retainers/account/{$r->code}/substitution"];
            }
            if ($r->alerts()->whereIn('status', ['in_progress', 'escalated'])->whereNotNull('notice_sent_at')->exists()) {
                $alerts[] = ['tone' => 'info', 'title' => 'Utilisation review ready', 'body' => "Your use of {$r->name} has met the review condition. Choose an option.", 'href' => "/retainers/account/{$r->code}/utilisation"];
            }
            $closed = $r->periods()->where('status', 'closed')->whereNull('statement_ack_at')->latest('ends_on')->first();
            if ($closed) {
                $alerts[] = ['tone' => 'info', 'title' => 'Statement ready', 'body' => 'Period statement – '.$closed->ends_on->format('F Y').' is ready to review.', 'href' => "/retainers/account/{$r->code}/statement?period={$closed->id}"];
            }
        }

        $activity = Event::whereIn('retainer_id', $retainers->pluck('id'))->latest('id')->limit(5)->get()
            ->map(fn ($e) => ['type' => $e->type, 'summary' => $e->summary, 'at' => $e->created_at->toDateTimeString(), 'retainer' => $retainers->firstWhere('id', $e->retainer_id)?->name]);
        if ($activity->isEmpty()) {
            $activity = Usage::whereIn('retainer_id', $retainers->pluck('id'))->latest('occurred_at')->limit(3)->get()
                ->map(fn ($u) => ['type' => 'usage', 'summary' => "Usage recorded: {$u->units} hours", 'at' => $u->occurred_at->toDateTimeString(), 'retainer' => $retainers->firstWhere('id', $u->retainer_id)?->name.' • '.$u->activity]);
        }

        $proposals = Proposal::where('user_id', $user->id)->latest()->get()->map(fn ($p) => ['reference' => $p->reference, 'status' => $p->status, 'service' => $p->service->name, 'monthly_fee_zar' => $p->monthly_fee_zar, 'valid_until' => $p->valid_until?->toDateString(), 'hold_reason' => $p->hold_reason, 'retainer' => $p->retainer?->code]);

        return Inertia::render('Products/Retainers/Account/Index', [
            'retainers' => $rows->values(),
            'summary' => [
                'active' => $live->count(),
                'allowance' => round($live->sum(fn ($r) => $r['meter']['denominator'] ?? 0), 1),
                'used' => round($live->sum(fn ($r) => $r['meter']['confirmed'] ?? 0), 1),
            ],
            'trend' => $trend,
            'alerts' => array_slice($alerts, 0, 5),
            'activity' => $activity,
            'proposals' => $proposals,
        ]);
    }

    public function meter(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $period = $r->currentPeriod();
        $lines = $period ? $this->withBalance($period, $period->usage()->get())->sortByDesc('occurred_at')->take(5)->values() : collect();

        return Inertia::render('Products/Retainers/Account/Meter', [...$this->context($r), 'recent' => $lines,
            'last_reset' => $period?->starts_on->toDateString(), 'paid' => (bool) ($r->order_id === null || Order::find($r->order_id)?->isPaid())]);
    }

    public function ledger(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $periods = $r->periods()->get();
        $periodId = (int) $request->query('period', 0);
        $period = $periods->firstWhere('id', $periodId) ?? $r->currentPeriod();
        $all = $period ? $this->withBalance($period, $period->usage()->get()) : collect();

        $f = ['adviser' => (string) $request->query('adviser', ''), 'category' => (string) $request->query('category', ''), 'status' => (string) $request->query('status', ''), 'sort' => $request->query('sort') === 'asc' ? 'asc' : 'desc'];
        $filtered = $all
            ->when($f['adviser'] !== '', fn ($c) => $c->where('adviser', $f['adviser']))
            ->when($f['category'] !== '', fn ($c) => $c->where('category', $f['category']))
            ->when($f['status'] !== '', fn ($c) => $c->where('status', $f['status']));
        $filtered = $f['sort'] === 'asc' ? $filtered->sortBy('occurred_at') : $filtered->sortByDesc('occurred_at');
        $page = max(1, (int) $request->query('page', 1));
        $per = 8;

        $toDate = (float) $r->usage()->where('billing_effect', 'INCLUDED')->whereIn('status', ['confirmed', 'corrected'])->sum('units');
        $toDateAllowance = (float) $periods->sum(fn ($p) => $p->opening_units + $p->carry_units + $p->credit_units);

        return Inertia::render('Products/Retainers/Account/Ledger', [...$this->context($r),
            'entries' => $filtered->slice(($page - 1) * $per, $per)->values(),
            'pagination' => ['page' => $page, 'per' => $per, 'total' => $filtered->count()],
            'filters' => $f,
            'options' => ['advisers' => $all->pluck('adviser')->unique()->values(), 'categories' => $all->pluck('category')->unique()->values(), 'periods' => $periods->sortByDesc('starts_on')->map(fn ($p) => ['id' => $p->id, 'label' => $p->starts_on->format('d M Y').' – '.$p->ends_on->format('d M Y')])->values()],
            'selected_period' => $period ? Presenter::period($period) : null,
            'totals' => ['entries' => $all->count(), 'advisers' => $all->pluck('adviser')->unique()->count(), 'to_date' => round($toDate, 2), 'to_date_pct' => $toDateAllowance > 0 ? round($toDate / $toDateAllowance * 100) : 0],
        ]);
    }

    public function dispute(Request $request, Retainer $retainer, Usage $usage): Response
    {
        $r = $this->own($request, $retainer);
        abort_unless($usage->retainer_id === $r->id, 404);
        $period = $usage->period;
        $line = $this->withBalance($period, $period->usage()->get())->firstWhere('id', $usage->id);

        return Inertia::render('Products/Retainers/Account/Dispute', [...$this->context($r),
            'entry' => $line,
            'disputes' => $usage->disputes()->latest()->get()->map(fn ($d) => ['reference' => $d->reference, 'status' => $d->status, 'reason' => $d->reason, 'outcome' => $d->outcome, 'decision_note' => $d->decision_note, 'created_at' => $d->created_at->toDateTimeString(), 'decided_at' => $d->decided_at?->toDateTimeString()]),
        ]);
    }

    public function storeDispute(Request $request, Retainer $retainer, Usage $usage): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        abort_unless($usage->retainer_id === $r->id, 404);
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:120'],
            'explanation' => ['required', 'string', 'min:10', 'max:2000'],
            'outcome' => ['required', 'in:remove,adjust,other'],
            'proposed_units' => ['nullable', 'required_if:outcome,adjust', 'numeric', 'min:0', 'max:'.$usage->units],
            'files' => ['nullable', 'array', 'max:5'],
            'files.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg'],
        ]);
        $names = collect($request->file('files', []))->map(fn ($f) => $f->getClientOriginalName())->all();
        $dispute = Engine::raiseDispute($usage, [...$data, 'attachments' => $names ?: null]);

        return redirect("/retainers/account/{$r->code}/ledger/{$usage->id}/dispute")->with('success', 'Your dispute has been logged and acknowledged.')->with('reference', $dispute->reference);
    }

    public function utilisation(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $periods = $r->periods()->orderByDesc('starts_on')->limit(6)->get()->reverse()->values();
        $months = $periods->map(function (Period $p) use ($r) {
            $m = Engine::meter($r, $p);

            return ['label' => $p->starts_on->format('M Y').($p->status === 'open' ? ' (MTD)' : ''), 'allowance' => $m['denominator'], 'used' => $m['confirmed'], 'pct' => $m['utilisation'], 'remaining' => $m['remaining'], 'open' => $p->status === 'open', 'days_left' => $m['days_left']];
        });
        $closed = $months->where('open', false);
        $avg = $closed->count() ? round($closed->avg('used'), 1) : 0;
        $forecast = $closed->count() ? round($closed->take(-3)->avg('pct')) : 0;
        $alert = $r->alerts()->whereIn('status', ['new', 'in_progress', 'escalated'])->latest()->first();

        return Inertia::render('Products/Retainers/Account/Utilisation', [...$this->context($r),
            'months' => $months,
            'average' => $avg,
            'average_pct' => $r->allowance_qty > 0 ? round($avg / $r->allowance_qty * 100) : 0,
            'forecast_pct' => $forecast,
            'review_due' => (bool) $alert,
            'alert' => $alert ? ['level' => $alert->level, 'utilisation' => $alert->utilisation_pct, 'notice_sent_at' => $alert->notice_sent_at?->toDateTimeString()] : null,
            'decisions' => $r->decisions()->latest('id')->get()->map(fn ($d) => ['choice' => $d->choice, 'created_at' => $d->created_at->toDateTimeString(), 'effective_date' => $d->effective_date?->toDateString(), 'requested_allowance' => $d->requested_allowance]),
            'per_use_comparator' => null,
        ]);
    }

    public function storeUtilisation(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $data = $request->validate([
            'choice' => ['required', 'in:continue,right_size,pause,cancel'],
            'allowance' => ['nullable', 'required_if:choice,right_size', 'numeric', 'min:4', 'max:200'],
        ]);
        if (in_array($data['choice'], ['pause', 'cancel'], true) && ! in_array($r->status, ['active', 'paused'], true)) {
            return back()->withErrors(['choice' => "This Retainer is {$r->status}."]);
        }
        Engine::recordUtilisationChoice($r, $request->user(), $data['choice'], isset($data['allowance']) ? (float) $data['allowance'] : null);

        return back()->with('success', 'Your choice has been recorded: '.str_replace('_', '-', $data['choice']).'.');
    }

    public function scope(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);

        return Inertia::render('Products/Retainers/Account/ScopeChange', [...$this->context($r),
            'changes' => $r->scopeChanges()->where('raised_by', 'Client')->latest()->limit(8)->get()->map(fn ($c) => ['reference' => $c->reference, 'summary' => $c->summary, 'change_type' => $c->change_type, 'status' => $c->status, 'stage' => $c->stage, 'impact_hours' => $c->impact_hours, 'impact_zar' => $c->impact_zar, 'created_at' => $c->created_at->toDateString()]),
            'exclusions' => array_values(Catalogue::exclusions()),
        ]);
    }

    public function storeScope(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $data = $request->validate([
            'change_type' => ['required', 'in:Add / Remove Inclusions,Adjust Allowance,Adjust Cadence,Change Named Advisor,Other'],
            'summary' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'effective_from' => ['required', 'date', 'after_or_equal:today'],
            'reason' => ['required', 'string', 'max:120'],
        ]);
        $sc = Engine::requestScopeChange($r, $data);

        return back()->with('success', 'Change request submitted. Your existing allowance is not reduced merely because you submitted the request.')->with('reference', $sc->reference);
    }

    public function overage(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $open = $r->overages()->where('status', 'requested')->latest()->first() ?? $r->overages()->latest()->first();

        return Inertia::render('Products/Retainers/Account/Overage', [...$this->context($r),
            'overage' => $open ? [...$open->only(['id', 'reference', 'scope', 'lines', 'units', 'rate_zar', 'max_charge_zar', 'status', 'authorised_units', 'authorised_limit_zar', 'authorised_by', 'notes']), 'expires_at' => $open->expires_at?->toDateTimeString(), 'authorised_at' => $open->authorised_at?->toDateTimeString()] : null,
            'history' => $r->overages()->whereIn('status', ['authorised', 'cap_reached'])->latest('authorised_at')->limit(4)->get()->map(fn ($o) => ['label' => $o->authorised_at?->format('M Y'), 'units' => $o->authorised_units, 'amount' => $o->authorised_limit_zar, 'status' => $o->status]),
            'signatories' => array_values(array_unique(array_filter([$request->user()->name.' (Authorised Signatory)', ($r->signatory['name'] ?? null) ? $r->signatory['name'].' (Authorised Signatory)' : null]))),
        ]);
    }

    public function storeOverage(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $data = $request->validate([
            'overage' => ['required', 'integer'],
            'decision' => ['required', 'in:authorise,limit,decline'],
            'authorised_by' => ['required', 'string', 'max:120'],
            'limit' => ['nullable', 'required_if:decision,limit', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);
        $o = $r->overages()->findOrFail($data['overage']);
        Engine::decideOverage($o, $data['decision'], $data['authorised_by'], $data['limit'] ?? null, $data['notes'] ?? null);

        return back()->with('success', $data['decision'] === 'decline' ? 'Overage declined. Work stops at your allowance boundary.' : 'Overage authorised before work begins. It will appear on your next invoice.');
    }

    public function substitution(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $sub = $r->substitutions()->whereIn('status', ['awaiting_approval', 'discuss'])->latest()->first() ?? $r->substitutions()->whereNotIn('status', ['pending_notice'])->latest()->first();

        return Inertia::render('Products/Retainers/Account/Substitution', [...$this->context($r),
            'substitution' => $sub ? [...$sub->only(['id', 'reference', 'current_adviser', 'proposed_adviser', 'type', 'reason', 'reason_detail', 'risk', 'status', 'client_response', 'client_note']), 'effective_from' => $sub->effective_from->toDateString(), 'notice_sent_at' => $sub->notice_sent_at?->toDateTimeString()] : null,
        ]);
    }

    public function storeSubstitution(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $data = $request->validate(['substitution' => ['required', 'integer'], 'response' => ['required', 'in:accept,object,discuss'], 'note' => ['nullable', 'string', 'max:300']]);
        Engine::respondSubstitution($r->substitutions()->findOrFail($data['substitution']), $data['response'], $data['note'] ?? null);

        return back()->with('success', 'Your response has been logged.');
    }

    public function statement(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $periods = $r->periods()->get();
        $period = $periods->firstWhere('id', (int) $request->query('period')) ?? $r->periods()->where('status', 'closed')->latest('ends_on')->first() ?? $r->currentPeriod();
        $m = $period ? Engine::meter($r, $period) : null;
        $lines = $period ? $period->usage()->orderBy('occurred_at')->get()->map(fn ($u) => Presenter::usage($u)) : collect();
        $overageUnits = (float) $lines->where('billing_effect', 'OVERAGE_APPROVED')->whereIn('status', ['confirmed', 'corrected'])->sum('units');
        $overageAmount = (int) round($overageUnits * $r->overage_rate_zar);
        $prev = $period ? $r->periods()->where('starts_on', '<', $period->starts_on)->latest('starts_on')->first() : null;
        $prevUtil = $prev ? Engine::meter($r, $prev)['utilisation'] : null;

        return Inertia::render('Products/Retainers/Account/Statement', [...$this->context($r),
            'statement' => $period ? [
                'period' => Presenter::period($period),
                'meter' => $m,
                'lines' => $lines->values(),
                'overage_units' => $overageUnits,
                'overage_amount' => $overageAmount,
                'vat' => Catalogue::vatOf($overageAmount),
                'total_used' => round($m['confirmed'] + $overageUnits, 2),
                'utilisation_total' => $m['denominator'] > 0 ? round(($m['confirmed'] + $overageUnits) / $m['denominator'] * 100) : 0,
                'delta' => $prevUtil !== null ? round($m['utilisation'] - $prevUtil) : null,
                'prev_label' => $prev?->starts_on->format('M Y'),
                'next' => ['starts_on' => $period->ends_on->copy()->addDay()->toDateString(), 'ends_on' => $period->ends_on->copy()->addMonth()->toDateString()],
            ] : null,
            'periods' => $periods->sortByDesc('starts_on')->map(fn ($p) => ['id' => $p->id, 'label' => $p->starts_on->format('d M').' – '.$p->ends_on->format('d M Y'), 'status' => $p->status])->values(),
        ]);
    }

    public function acknowledgeStatement(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $period = $r->periods()->findOrFail($request->validate(['period' => ['required', 'integer']])['period']);
        if ($period->status !== 'closed') {
            return back()->withErrors(['period' => 'Only a closed, reconciled period statement can be acknowledged.']);
        }
        if (! $period->statement_ack_at) {
            $period->update(['statement_ack_at' => now()]);
            Engine::log('re.statement.acknowledged', 'Period statement '.$period->ends_on->format('M Y').' acknowledged', $r);
        }

        return back()->with('success', 'Statement acknowledged.');
    }

    public function renew(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $m = Engine::meter($r);
        $forecast = $m['period'] && $m['days_elapsed'] > 0 ? round($m['confirmed'] / $m['days_elapsed'] * $m['days_total'], 1) : $m['confirmed'] ?? 0;
        $history = $r->periods()->where('status', 'closed')->latest('starts_on')->limit(3)->get()->map(fn ($p) => ['label' => $p->starts_on->format('d M').' – '.$p->ends_on->format('d M Y'), 'allowance' => $p->opening_units, 'fee' => $r->monthly_fee_zar, 'status' => 'completed']);
        $options = collect([10, 15, 20, 25, 30, 40])->map(fn ($h) => ['hours' => $h, 'fee' => (int) round($r->hourlyBasis() * $h)]);

        return Inertia::render('Products/Retainers/Account/Renew', [...$this->context($r),
            'forecast' => $forecast,
            'estimated_overage' => max(0, round($forecast - ($m['denominator'] ?? 0), 1)),
            'holds' => Engine::renewalHolds($r),
            'history' => $history,
            'resize_options' => $options,
        ]);
    }

    public function storeRenew(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $data = $request->validate([
            'choice' => ['required', 'in:renew,resize,pause'],
            'allowance' => ['nullable', 'required_if:choice,resize', 'numeric', 'min:4', 'max:200'],
            'pause_from' => ['nullable', 'required_if:choice,pause', 'date', 'after_or_equal:today'],
            'resume_from' => ['nullable', 'date', 'after:pause_from'],
        ]);
        Engine::decideRenewal($r, $data['choice'], isset($data['allowance']) ? (float) $data['allowance'] : null, $data['pause_from'] ?? null, $data['resume_from'] ?? null);

        return back()->with('success', 'Your selection has been confirmed for the next period.');
    }

    public function cancel(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $authorised = $r->overages()->where('status', 'authorised')->get();
        $final = (int) $authorised->sum(fn ($o) => $o->authorised_units * $o->rate_zar);

        return Inertia::render('Products/Retainers/Account/Cancel', [...$this->context($r), 'final_invoice' => $final]);
    }

    public function storeCancel(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:120'], 'comments' => ['nullable', 'string', 'max:500'], 'confirm' => ['accepted']], ['confirm.accepted' => 'Please confirm that you want to cancel at the end of the current period.']);
        Engine::cancel($r, $data['reason'] ?? null, $data['comments'] ?? null);

        return back()->with('success', 'Cancellation confirmed. Your Retainer remains active until the end of the current period.');
    }

    public function sizing(Request $request, Retainer $retainer): Response
    {
        $r = $this->own($request, $retainer);
        $periods = $r->periods()->orderByDesc('starts_on')->limit(13)->get()->reverse()->values();
        $history = $periods->map(fn ($p) => ['label' => $p->starts_on->format('M'), 'used' => Engine::meter($r, $p)['confirmed'], 'open' => $p->status === 'open']);
        $ids = $periods->where('status', 'closed')->pluck('id');
        $dist = Usage::whereIn('period_id', $ids)->whereIn('status', ['confirmed', 'corrected'])->selectRaw('category, sum(units) as h')->groupBy('category')->orderByDesc('h')->get()->map(fn ($x) => ['label' => $x->category, 'hours' => round((float) $x->h, 1)]);

        $comparable = Retainer::with('service')->whereIn('status', ['active', 'cancelling'])->get()->groupBy(fn ($x) => $x->service->name)->map(function ($group, $name) {
            $used = $group->avg(fn ($x) => Engine::meter($x)['confirmed']);
            $allow = $group->avg('allowance_qty');

            return ['retainer' => $name, 'clients' => $group->count(), 'avg_allowance' => round($allow, 1), 'avg_used' => round($used, 1), 'utilisation' => $allow > 0 ? round($used / $allow * 100) : 0, 'overage' => (int) round($group->filter(fn ($x) => $x->overages()->whereIn('status', ['authorised', 'cap_reached'])->exists())->count() / max(1, $group->count()) * 100)];
        })->sortByDesc('clients')->take(4)->values();

        return Inertia::render('Products/Retainers/Account/Sizing', [...$this->context($r),
            'history' => $history,
            'distribution' => $dist,
            'comparable' => $comparable,
            'drivers' => Catalogue::drivers(),
            'saved' => $r->sizing,
        ]);
    }

    public function storeSizing(Request $request, Retainer $retainer): RedirectResponse
    {
        $r = $this->own($request, $retainer);
        $data = $request->validate([
            'recommended' => ['required', 'numeric', 'min:1', 'max:200'],
            'p50' => ['required', 'numeric'],
            'confidence' => ['required', 'numeric', 'min:0', 'max:100'],
            'drivers' => ['array'],
        ]);
        $r->update(['sizing' => [...$data, 'saved_at' => now()->toDateTimeString(), 'next_review' => today()->addMonths(3)->toDateString()]]);
        Engine::log('re.sizing.saved', "Allowance recommendation saved: {$data['recommended']}h (indicative only, no reservation)", $r);

        return back()->with('success', 'Allowance recommendation saved. It is indicative only — resizing goes through Renewal & Resize.');
    }
}
