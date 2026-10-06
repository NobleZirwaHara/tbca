<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\ExceptionItem;
use App\Models\Advisory\TechEngagement;
use App\Models\Advisory\TechTicket;
use App\Models\Order;
use App\Support\Advisory\ServicesContent;
use App\Support\Advisory\TechContent;
use App\Support\Advisory\TechWorkflow;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Signed-in Technology Solutions client portal (dashboard, gates, ledgers, delivery, renewal and exit). */
class TechWorkspaceController extends Controller
{
    private function load(Request $request, TechEngagement $e): TechEngagement
    {
        abort_unless((int) $e->user_id === (int) $request->user()->id || $request->user()->role === 'admin', 403);
        TechWorkflow::reconcile($e);

        return $e->refresh()->load('gates');
    }

    public static function header(TechEngagement $e): array
    {
        $tower = TechContent::towerByCode($e->tower);
        $last = $e->gates->where('status', 'approved')->sortBy('number')->last();
        $presented = $e->gates->firstWhere('status', 'presented');
        $stageNames = [7 => 'Kickoff', 8 => 'Delivery & Build', 9 => 'Delivery & Validation', 10 => 'Acceptance'];

        return [
            'reference' => $e->reference, 'organisation' => $e->organisation, 'tower' => $tower ? "{$tower['code']} {$tower['name']}" : $e->tower, 'tower_code' => $e->tower,
            'owner' => $e->owner, 'status' => $e->status, 'health' => $e->health, 'stage' => $e->stage, 'stage_name' => $stageNames[$e->stage] ?? 'Commercial & Setup',
            'gate_label' => $last ? "Gate {$last->number} Approved" : 'Gate 1 Pending', 'presented' => $presented ? ['number' => $presented->number, 'name' => $presented->name] : null,
            'tracker' => array_map(fn ($s, $i) => ['label' => $s, 'state' => $i + 1 < $e->stage ? 'done' : ($i + 1 === $e->stage ? 'current' : 'todo')], TechContent::TRACKER, array_keys(TechContent::TRACKER)),
            'readonly' => ($e->exit_plan['closed_at'] ?? null) !== null,
        ];
    }

    private function render(string $page, Request $request, TechEngagement $e, array $props = []): Response
    {
        return Inertia::render("Advisory/Tech/Workspace/{$page}", ['engagement' => self::header($e), ...$props]);
    }

    public function index(Request $request): Response
    {
        $list = TechEngagement::query()->where('user_id', $request->user()->id)->with('gates')->latest()->get();
        foreach ($list as $e) {
            TechWorkflow::reconcile($e);
        }

        return Inertia::render('Advisory/Tech/Workspace/Index', ['engagements' => $list->map(fn ($e) => self::header($e->refresh()->load('gates')))]);
    }

    private function ledgerPositions(TechEngagement $e): array
    {
        $totals = TechContent::ledgerTotals($e->fee_lines ?? []);
        $gates = $e->gates;
        $tPaid = $gates->where('status', 'approved')->sum('t_amount_zar');
        $tApproved = $gates->where('status', 'approved_not_paid')->sum('t_amount_zar');
        $tFuture = $gates->whereIn('status', ['locked', 'presented'])->sum('t_amount_zar');
        $xFunded = $gates->where('x_funded', true)->sum('x_high_zar');
        $xPending = $gates->where('x_funded', false)->whereIn('status', ['approved', 'approved_not_paid', 'presented'])->sum('x_high_zar');
        $xFuture = [$gates->where('x_funded', false)->where('status', 'locked')->sum('x_low_zar'), $gates->where('x_funded', false)->where('status', 'locked')->sum('x_high_zar')];

        return [
            'T' => ['paid' => $tPaid, 'approved' => $tApproved, 'future' => $tFuture, 'range' => $totals['T']],
            'X' => ['funded' => $xFunded, 'pending' => $xPending, 'future' => $xFuture, 'range' => $totals['X']],
            'S' => ['vat_paid' => (int) round($tPaid * ServicesContent::VAT), 'filing' => [2000, 10000], 'range' => $totals['S']],
        ];
    }

    private function gatePayload(TechEngagement $e): ?array
    {
        $g = $e->gates->firstWhere('status', 'presented') ?? $e->gates->firstWhere('status', 'approved_not_paid');
        if (! $g) {
            return null;
        }

        return ['number' => $g->number, 'name' => $g->name, 'assent' => $g->assent, 'status' => $g->status, 't' => $g->t_amount_zar, 'x' => [$g->x_low_zar, $g->x_high_zar],
            'x_funded' => $g->x_funded, 'vat' => (int) round($g->t_amount_zar * ServicesContent::VAT), 'fingerprint' => $g->fingerprint, 'expires' => $g->expires_at?->format('d M Y H:i'),
            'order' => $g->order?->reference, 'order_status' => $g->order?->status];
    }

    public function dashboard(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $tasks = $e->tasks()->get();
        $open = $e->tickets()->where('kind', 'ticket')->where('status', '!=', 'Resolved')->get();
        $done = $tasks->where('status', 'completed')->count();

        return $this->render('Dashboard', $request, $e, [
            'ledgers' => $this->ledgerPositions($e),
            'gate' => $this->gatePayload($e),
            'openGate' => $request->boolean('gate'),
            'tasks' => $tasks->map(fn ($t) => [...$t->toArray(), 'due' => $t->due_date->format('d M Y')])->values(),
            'documents' => $e->documents()->limit(5)->get(),
            'tickets' => $open->take(3)->values(),
            'kpis' => ['completion' => (int) round(($e->stage / 10) * 100 * 0.6 + ($tasks->count() ? $done / $tasks->count() * 40 : 0)), 'blockers' => $tasks->where('status', 'blocked')->count() + $tasks->where('priority', 'critical')->where('status', '!=', 'completed')->count(),
                'next_due' => $tasks->where('status', '!=', 'completed')->sortBy('due_date')->first()?->due_date?->format('d M Y'),
                'days' => ($n = $tasks->where('status', '!=', 'completed')->sortBy('due_date')->first()) ? max(0, (int) now()->diffInDays($n->due_date, false)) : null],
            'uat' => $e->uat,
            'timeline' => array_slice($e->timeline ?? [], 0, 6),
        ]);
    }

    public function scope(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $lines = $e->fee_lines ?? [];

        return Inertia::render('Advisory/Tech/Scope', ['engagement' => self::header($e), 'lines' => $lines, 'totals' => TechContent::ledgerTotals($lines), 'context' => $e->context,
            'summary' => ['tower' => self::header($e)['tower'], 'complexity' => TechContent::configSummary($e->config ?? [])['complexity'].' ('.TechContent::configSummary($e->config ?? [])['timeline'].')'], 'journey' => null, 'gates' => [], 'plan' => $e->payment_plan, 'configured' => true]);
    }

    public function feeMeter(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $next = $e->gates->firstWhere('status', 'presented') ?? $e->gates->firstWhere('status', 'locked');
        $events = Order::query()->where('section', 'advisory')->where('meta->engagement', $e->reference)->latest()->limit(6)->get(['reference', 'status', 'subtotal_zar', 'meta', 'created_at']);

        return $this->render('FeeMeter', $request, $e, [
            'ledgers' => $this->ledgerPositions($e), 'gates' => $e->gates->map(fn ($g) => ['number' => $g->number, 'name' => $g->name, 'status' => $g->status, 't' => $g->t_amount_zar, 'x' => [$g->x_low_zar, $g->x_high_zar], 'x_funded' => $g->x_funded])->values(),
            'next' => $next ? ['number' => $next->number, 'name' => $next->name, 't' => $next->t_amount_zar, 'x' => [$next->x_low_zar, $next->x_high_zar], 'expires' => $next->expires_at?->format('d M Y')] : null,
            'meter' => TechWorkflow::usage($e->meters ?? TechWorkflow::defaultMeters()),
            'events' => $events->map(fn ($o) => ['date' => $o->created_at->format('d M Y'), 'label' => ($o->meta['title'] ?? 'Payment').' ('.$o->reference.')', 'amount' => $o->subtotal_zar, 'status' => $o->status])->values(),
            'fundable' => $e->gates->first(fn ($g) => $g->x_high_zar > 0 && ! $g->x_funded && in_array($g->status, ['presented', 'approved', 'approved_not_paid'], true))?->number,
        ]);
    }

    public function externalCosts(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $lines = $e->fee_lines ?? [];

        return Inertia::render('Advisory/Tech/ExternalCosts', ['engagement' => self::header($e), 'lines' => $lines, 'totals' => TechContent::ledgerTotals($lines), 'journey' => null, 'summary' => [], 'gates' => [], 'plan' => $e->payment_plan, 'configured' => true,
            'suppliers' => ['Third-Party Licences' => 'Microsoft, Zoho, Adobe, Others', 'API or Connector Subscriptions' => 'Zoho Marketplace, Microsoft Azure, Others', 'Cloud Hosting Estimate' => 'AWS, Azure, Zoho Cloud', 'Domain / Email Services' => 'GoDaddy, Zoho Mail, Google Workspace', 'Regulatory / Compliance Filing' => 'CIPC, SARS, Industry Regulators']]);
    }

    public function payments(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $t = TechContent::ledgerTotals($e->fee_lines ?? [])['t_fixed'];
        $contract = (int) round($t * 1.15);
        $schedule = $e->gates->filter(fn ($g) => $g->t_amount_zar > 0)->values()->map(fn ($g, $i) => [
            'n' => $i + 1, 'milestone' => "Gate {$g->number} — {$g->name}", 'pct' => $t ? round($g->t_amount_zar / $t * 100) : 0,
            'amount' => (int) round($g->t_amount_zar * 1.15), 'status' => match ($g->status) { 'approved' => 'Paid', 'approved_not_paid' => 'Awaiting Payment', 'presented' => 'Upcoming', default => 'Pending' }, 'order' => $g->order?->reference,
        ]);
        $paid = $schedule->where('status', 'Paid')->sum('amount');
        $orders = Order::query()->where('section', 'advisory')->where('meta->engagement', $e->reference)->with('payments')->latest()->get();

        return $this->render('Payments', $request, $e, [
            'kpis' => ['contract' => $contract, 'contract_excl' => $t, 'paid' => $paid, 'outstanding' => max(0, $contract - $paid), 'count' => $schedule->where('status', 'Paid')->count(), 'next' => $schedule->firstWhere('status', '!=', 'Paid')],
            'schedule' => $schedule, 'transactions' => $orders->map(fn ($o) => ['date' => $o->created_at->format('d M Y'), 'type' => 'Invoice', 'desc' => $o->meta['title'] ?? 'Invoice', 'ref' => $o->reference, 'method' => $o->payments->last()?->method ?? '—', 'amount' => $o->total_zar, 'status' => $o->status])->values(),
        ]);
    }

    public function usage(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);

        return $this->render('Usage', $request, $e, ['usage' => TechWorkflow::usage($e->meters ?? TechWorkflow::defaultMeters()), 'requests' => $e->tickets()->where('category', 'Allowance Request')->get()]);
    }

    public function tasks(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $f = $request->only(['q', 'group', 'status', 'owner']);
        $q = $e->tasks()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where('title', 'like', "%{$v}%"))
            ->when($f['group'] ?? null, fn ($b, $v) => $b->where('group', $v))
            ->when($f['status'] ?? null, fn ($b, $v) => $b->where('status', $v))
            ->when($f['owner'] ?? null, fn ($b, $v) => $b->where('owner', $v));
        $all = $e->tasks()->get();

        return $this->render('Tasks', $request, $e, [
            'tasks' => $q->get()->map(fn ($t) => [...$t->toArray(), 'due' => $t->due_date->format('d M Y')])->values(), 'filters' => $f,
            'owners' => $all->pluck('owner')->unique()->values(),
            'blockers' => ['critical' => $all->where('priority', 'critical')->where('status', '!=', 'completed')->count(), 'high' => $all->where('priority', 'high')->whereIn('status', ['blocked', 'waiting_on_client'])->count(), 'medium' => $all->where('priority', 'medium')->whereIn('status', ['blocked', 'waiting_on_client'])->count()],
            'next' => ($n = $all->where('group', 'client')->where('status', '!=', 'completed')->sortBy('due_date')->first()) ? [...$n->toArray(), 'due' => $n->due_date->format('d M Y')] : null,
        ]);
    }

    public function documents(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $f = $request->only(['q', 'type', 'category', 'status', 'linked']);
        $q = $e->documents()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('name', 'like', "%{$v}%")->orWhere('type', 'like', "%{$v}%")))
            ->when($f['type'] ?? null, fn ($b, $v) => $b->where('type', $v))
            ->when($f['category'] ?? null, fn ($b, $v) => $b->where('category', $v))
            ->when($f['status'] ?? null, fn ($b, $v) => $b->where('status', $v))
            ->when($f['linked'] ?? null, fn ($b, $v) => $b->where('linked_to', $v));
        $all = $e->documents()->get();

        return $this->render('Documents', $request, $e, [
            'documents' => $q->paginate(8)->withQueryString()->through(fn ($d) => [...$d->toArray(), 'uploaded' => $d->uploaded_at->format('d M Y, H:i')]), 'filters' => $f,
            'options' => ['types' => $all->pluck('type')->unique()->values(), 'categories' => $all->pluck('category')->unique()->values(), 'statuses' => $all->pluck('status')->unique()->values(), 'linked' => $all->pluck('linked_to')->unique()->values()],
            'summary' => ['total' => $all->count(), 'verified' => $all->whereIn('status', ['Verified', 'Signed'])->count(), 'pending' => $all->whereIn('status', ['Pending Review', 'Pending Approval'])->count(), 'expired' => $all->where('status', 'Expired')->count(), 'shared' => $all->where('visibility', 'All Parties')->count()],
            'requests' => $e->tasks()->where('status', '!=', 'completed')->whereNotNull('evidence')->get(['id', 'title', 'evidence', 'status']),
        ]);
    }

    public function uat(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $u = $e->uat ?? [];
        $towers = $u['towers'] ?? [];
        $tot = ['total' => array_sum(array_column($towers, 'total')), 'passed' => array_sum(array_column($towers, 'passed')), 'failed' => array_sum(array_column($towers, 'failed')), 'blocked' => array_sum(array_column($towers, 'blocked'))];
        $tot['not'] = $tot['total'] - $tot['passed'] - $tot['failed'] - $tot['blocked'];
        $checks = [
            ['All critical test cases passed', ($u['critical_failed'] ?? 0) === 0 && $tot['total'] > 0],
            ['No open critical defects', ($u['critical_open'] ?? 0) === 0],
            ['Performance benchmarks met', (bool) ($u['checks']['performance'] ?? false)],
            ['Security scan completed', (bool) ($u['checks']['security'] ?? false)],
            ['Business sign-off pending', (bool) ($u['signoff'] ?? false)],
        ];

        return $this->render('Uat', $request, $e, ['uat' => $u, 'totals' => $tot, 'checks' => $checks, 'canAccept' => collect(array_slice($checks, 0, 4))->every(fn ($c) => $c[1]) && $tot['failed'] === 0]);
    }

    public function subscription(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);

        return $this->render('Subscription', $request, $e, ['subscription' => $e->subscription, 'usage' => TechWorkflow::usage($e->meters ?? TechWorkflow::defaultMeters())]);
    }

    public function statement(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $tx = $e->transactions ?? [];
        $f = $request->only(['type', 'status', 'from', 'to']);
        $st = TechWorkflow::statement($tx);
        $rows = collect($st['rows'])->filter(fn ($r) => (empty($f['type']) || $r['type'] === $f['type']) && (empty($f['status']) || $r['status'] === $f['status'])
            && (empty($f['from']) || $r['date'] >= $f['from']) && (empty($f['to']) || $r['date'] <= $f['to']))->values();
        $t = TechContent::ledgerTotals($e->fee_lines ?? [])['t_fixed'];

        return $this->render('Statement', $request, $e, ['statement' => [...$st, 'rows' => $rows], 'filters' => $f, 'contract' => (int) round($t * 1.15), 'contract_excl' => $t]);
    }

    public function support(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $tickets = $e->tickets()->get();

        return $this->render('Support', $request, $e, [
            'tickets' => $tickets->where('kind', 'ticket')->values(), 'disputes' => $tickets->where('kind', 'dispute')->values(),
            'kpis' => ['open' => $tickets->where('kind', 'ticket')->where('status', 'Open')->count(), 'progress' => $tickets->where('status', 'In Progress')->count(), 'awaiting' => $tickets->where('status', 'Awaiting Response')->count(), 'resolved' => $tickets->where('status', 'Resolved')->count()],
            'invoices' => collect($e->transactions ?? [])->where('type', 'Invoice')->pluck('ref')->values(),
        ]);
    }

    public function exit(Request $request, TechEngagement $engagement): Response
    {
        $e = $this->load($request, $engagement);
        $st = TechWorkflow::statement($e->transactions ?? []);
        $plan = $e->exit_plan ?? TechWorkflow::defaultExitPlan(now()->addYear());
        $steps = collect($plan['steps']);

        return $this->render('Exit', $request, $e, [
            'plan' => $plan, 'balance' => $st['balance'], 'documents' => $e->documents()->count(),
            'readiness' => ['complete' => $steps->where(3, 'completed')->count(), 'progress' => $steps->where(3, 'in_progress')->count(), 'pending' => $steps->where(3, 'pending')->count(), 'pct' => (int) round($steps->where(3, 'completed')->count() / max(1, $steps->count()) * 100)],
            'readonlyUntil' => \Illuminate\Support\Carbon::parse($plan['date'])->addDays((int) (\App\Models\Advisory\Setting::get('read_only_days', '90')))->format('d M Y'),
            'subscription' => $e->subscription,
        ]);
    }

    /* ---------------- actions ---------------- */

    public function gateDecision(Request $request, TechEngagement $engagement, int $number): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $g = $e->gates()->where('number', $number)->firstOrFail();
        $d = $request->validate(['decision' => ['required', Rule::in(['approve', 'decline', 'review', 'fund'])], 'confirm' => ['required_if:decision,approve', 'nullable', 'accepted']],
            ['confirm.required_if' => 'Tick the confirmation to approve this gate.', 'confirm.accepted' => 'Tick the confirmation to approve this gate.']);
        if ($d['decision'] === 'fund') {
            return redirect()->route('checkout.show', TechWorkflow::fundX($e, $g, $request->user()));
        }
        if ($d['decision'] === 'approve') {
            if ($g->status === 'approved_not_paid' && $g->order) {
                return redirect()->route('checkout.show', $g->order);
            }
            $order = TechWorkflow::approveGate($e, $g, $request->user());

            return $order ? redirect()->route('checkout.show', $order) : back()->with('success', "Gate {$number} approved. This approval covers only the current gate.");
        }
        if ($d['decision'] === 'decline') {
            TechWorkflow::decline($e, $g, $request->user());

            return back()->with('success', 'Gate declined. Work pauses at the current boundary; no future gate charges are approved.');
        }
        $g->update(['status' => 'review_requested']);
        $t = TechTicket::create(['engagement_id' => $e->id, 'reference' => 'TKT-'.now()->format('Y').'-'.str_pad((string) (TechTicket::query()->count() + 153), 4, '0', STR_PAD_LEFT), 'kind' => 'ticket', 'subject' => "Review requested: Gate {$number} {$g->name}", 'category' => 'Gate Review', 'priority' => 'Medium', 'status' => 'Open', 'assigned_to' => $e->owner]);
        $e->addTimeline("Review requested on Gate {$number}", $request->user()->name);

        return back()->with('success', 'Review requested — your engagement owner will respond.')->with('reference', $t->reference);
    }

    public function taskAction(Request $request, TechEngagement $engagement, int $task): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $t = $e->tasks()->findOrFail($task);
        $d = $request->validate(['action' => ['required', Rule::in(['complete', 'remind', 'escalate'])]]);
        if ($d['action'] === 'complete') {
            abort_unless($t->group === 'client', 403);
            $t->update(['status' => 'completed']);
            $e->addTimeline("Client task completed: {$t->title}", $request->user()->name);

            return back()->with('success', 'Task completed. Evidence will be reviewed by TBCA.');
        }
        if ($d['action'] === 'escalate') {
            ExceptionItem::create(['code' => 'EXC-'.now()->format('Y').'-'.str_pad((string) (ExceptionItem::query()->count() + 44), 4, '0', STR_PAD_LEFT), 'area' => 'Engagement', 'type' => 'Blocker Escalation', 'subject' => "{$t->title} ({$e->reference})", 'priority' => 'High', 'status' => 'new', 'raised_by' => $request->user()->name, 'assigned_to' => $e->owner ?? 'Unassigned', 'raised_at' => now(), 'sla_due' => now()->addDay()]);

            return back()->with('success', 'Blocker escalated to the TBCA review queue.');
        }

        return back()->with('success', "Reminder sent to {$t->owner}.");
    }

    public function documentStore(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $d = $request->validate(['file' => ['required', 'file', 'max:20480', 'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png'], 'type' => ['required', 'string', 'max:60'], 'category' => ['required', 'string', 'max:60'], 'linked_to' => ['required', 'string', 'max:80'], 'visibility' => ['required', Rule::in(['Internal', 'All Parties'])]]);
        $file = $request->file('file');
        $file->store("advisory/{$e->reference}", 'local');
        $e->documents()->create(['name' => $file->getClientOriginalName(), 'type' => $d['type'], 'category' => $d['category'], 'linked_to' => $d['linked_to'], 'uploaded_by' => $request->user()->name, 'uploaded_at' => now(), 'status' => 'Pending Review', 'visibility' => $d['visibility'], 'version' => 'v1.0']);
        $e->addTimeline('Document uploaded: '.$file->getClientOriginalName(), $request->user()->name);

        return back()->with('success', 'Document uploaded and queued for review.');
    }

    public function uatAction(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $d = $request->validate(['action' => ['required', Rule::in(['signoff', 'defect', 'accept'])], 'detail' => ['nullable', 'string', 'max:500']]);
        $u = $e->uat ?? [];
        if ($d['action'] === 'defect') {
            $u['defects_open'] = ($u['defects_open'] ?? 0) + 1;
            $u['activity'] = array_merge([['title' => 'Defect raised by client', 'detail' => $d['detail'] ?? 'Issue reported', 'at' => now()->format('d M Y, H:i'), 'by' => $request->user()->name]], $u['activity'] ?? []);
            $e->update(['uat' => $u]);

            return back()->with('success', 'Defect logged against the current UAT cycle.');
        }
        if ($d['action'] === 'signoff') {
            $u['signoff'] = true;
            $e->update(['uat' => $u]);
            $e->addTimeline('Business sign-off recorded for UAT', $request->user()->name);

            return back()->with('success', 'Business sign-off recorded.');
        }
        $towers = $u['towers'] ?? [];
        $failed = array_sum(array_column($towers, 'failed'));
        if (($u['critical_open'] ?? 0) > 0 || $failed > 0 || empty($u['signoff']) || empty($u['checks']['performance']) || empty($u['checks']['security'])) {
            return back()->with('error', 'Acceptance requires all readiness checks to pass: no failed cases, no open critical defects, benchmarks, security scan and business sign-off.');
        }
        $u['accepted_at'] = now()->toDateString();
        $e->update(['uat' => $u]);
        $g8 = $e->gates()->where('number', 6)->first();
        if ($g8 && $g8->status === 'presented') {
            TechWorkflow::approveGate($e, $g8, $request->user());
        }
        $e->addTimeline('Final acceptance requested — UAT accepted', $request->user()->name);

        return back()->with('success', 'UAT accepted. Acceptance date recorded.');
    }

    public function usageRequest(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $d = $request->validate(['service' => ['required', 'string'], 'amount' => ['required', 'integer', 'min:1'], 'reason' => ['nullable', 'string', 'max:500']]);
        $t = TechTicket::create(['engagement_id' => $e->id, 'reference' => 'TKT-'.now()->format('Y').'-'.str_pad((string) (TechTicket::query()->count() + 153), 4, '0', STR_PAD_LEFT), 'kind' => 'ticket', 'subject' => "Allowance increase: {$d['service']} +{$d['amount']}", 'category' => 'Allowance Request', 'priority' => 'Medium', 'status' => 'Open', 'assigned_to' => $e->owner, 'details' => $d['reason'] ?? null]);

        return back()->with('success', 'Allowance increase requested. A cap increase needs a fresh S13-CHANGE approval before it applies.')->with('reference', $t->reference);
    }

    public function subscriptionAction(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $d = $request->validate(['action' => ['required', Rule::in(['renew', 'auto_renew', 'pause', 'cancel', 'resume', 'activate'])]]);
        $s = $e->subscription ?? [];
        switch ($d['action']) {
            case 'renew':
            case 'activate':
                $early = $d['action'] === 'renew' && ($s['status'] ?? '') === 'Active';
                $amount = (int) round(($s['annual_fee'] ?? 24000) / 1.15 * ($early ? 0.95 : 1));
                $order = Checkout::createOrder([['item_type' => 'subscription', 'item_code' => $s['id'] ?? 'SUB-TS', 'name' => ($s['plan'] ?? 'Professional Plan').($early ? ' — early renewal (5% discount)' : ' — annual subscription'), 'unit_zar' => $amount, 'meta' => ['engagement' => $e->reference, 'subscription' => true]]],
                    $request->user(), 'advisory', ['return_url' => "/technology-solutions/workspace/{$e->reference}/subscription", 'title' => 'Subscription renewal (S13-RENEW)', 'engagement' => $e->reference, 'renewal' => $s['id'] ?? null]);
                $s['pending_order'] = $order->reference;
                $e->update(['subscription' => $s]);

                return redirect()->route('checkout.show', $order);
            case 'auto_renew':
                $s['auto_renew'] = ! ($s['auto_renew'] ?? false);
                break;
            case 'pause':
                $s['status'] = 'Paused';
                break;
            case 'resume':
                $s['status'] = 'Active';
                break;
            case 'cancel':
                $s['status'] = 'Cancelled';
                $s['auto_renew'] = false;
                break;
        }
        $e->update(['subscription' => $s]);
        $e->addTimeline('Subscription updated: '.str_replace('_', ' ', $d['action']), $request->user()->name);

        return back()->with('success', 'Subscription updated.');
    }

    public function ticketStore(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $d = $request->validate([
            'kind' => ['required', Rule::in(['ticket', 'dispute'])], 'subject' => ['required', 'string', 'max:160'],
            'category' => ['required_if:kind,ticket', 'nullable', Rule::in(['Billing Query', 'Technical Support', 'Account Management'])], 'priority' => ['required_if:kind,ticket', 'nullable', Rule::in(['Low', 'Medium', 'High'])],
            'related_to' => ['required_if:kind,dispute', 'nullable', 'string'], 'amount' => ['required_if:kind,dispute', 'nullable', 'integer', 'min:1'], 'details' => ['required', 'string', 'min:10', 'max:2000'],
        ]);
        $prefix = $d['kind'] === 'dispute' ? 'DSP' : 'TKT';
        $n = TechTicket::query()->where('kind', $d['kind'])->count() + ($d['kind'] === 'dispute' ? 8 : 153);
        $t = TechTicket::create(['engagement_id' => $e->id, 'reference' => sprintf('%s-%s-%04d', $prefix, now()->format('Y'), $n), 'kind' => $d['kind'], 'subject' => $d['subject'], 'category' => $d['category'] ?? 'Billing Dispute', 'priority' => $d['priority'] ?? 'High',
            'status' => $d['kind'] === 'dispute' ? 'Under Review' : 'Open', 'related_to' => $d['related_to'] ?? null, 'amount_zar' => $d['amount'] ?? null, 'assigned_to' => 'Lerato M.', 'details' => $d['details']]);
        $e->addTimeline(($d['kind'] === 'dispute' ? 'Dispute raised: ' : 'Support ticket raised: ').$d['subject'], $request->user()->name);

        return back()->with('success', $d['kind'] === 'dispute' ? 'Dispute received. Response SLA: '.\App\Models\Advisory\Setting::get('dispute_sla', '5 business days').'.' : 'Ticket raised. We respond within 4 business hours.')->with('reference', $t->reference);
    }

    public function exitAction(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $e = $this->load($request, $engagement);
        $d = $request->validate(['action' => ['required', Rule::in(['step', 'close', 'date', 'auto_renew'])], 'index' => ['nullable', 'integer', 'between:0,5'], 'date' => ['nullable', 'date', 'after_or_equal:today']]);
        $plan = $e->exit_plan ?? TechWorkflow::defaultExitPlan(now()->addYear());
        if ($d['action'] === 'step' && isset($plan['steps'][$d['index'] ?? -1])) {
            if ($d['index'] === 4 && TechWorkflow::statement($e->transactions ?? [])['balance'] > 0) {
                return back()->with('error', 'Outstanding amounts must be settled before this step can be completed.');
            }
            $plan['steps'][$d['index']][3] = $plan['steps'][$d['index']][3] === 'pending' && $d['index'] < 5 ? 'completed' : $plan['steps'][$d['index']][3];
        }
        if ($d['action'] === 'date' && ($d['date'] ?? null)) {
            $plan['date'] = $d['date'];
            foreach ($plan['steps'] as &$s) {
                $s[2] = $d['date'];
            }
            unset($s);
        }
        if ($d['action'] === 'auto_renew') {
            $sub = $e->subscription ?? [];
            $sub['auto_renew'] = false;
            $e->update(['subscription' => $sub]);
        }
        if ($d['action'] === 'close') {
            $open = collect(array_slice($plan['steps'], 0, 5))->where(3, '!=', 'completed')->count();
            if ($open > 0 || TechWorkflow::statement($e->transactions ?? [])['balance'] > 0) {
                return back()->with('error', 'Complete all exit steps and settle outstanding amounts before closing the engagement.');
            }
            $plan['steps'][5][3] = 'completed';
            $plan['status'] = 'Closed';
            $plan['closed_at'] = now()->toDateString();
            $e->update(['status' => 'exited']);
            $e->addTimeline('Engagement closed — read-only access window started', $request->user()->name);
        }
        $e->update(['exit_plan' => $plan]);

        return back()->with('success', 'Exit plan updated.');
    }
}
