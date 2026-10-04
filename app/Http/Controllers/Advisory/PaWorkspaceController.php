<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\Mandate;
use App\Models\Advisory\MandateGate;
use App\Models\Advisory\MandateLine;
use App\Support\Advisory\MandateWorkflow;
use App\Support\Advisory\PaContent;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Signed-in Project Advisory workspace: NDA, method card, letters, gates, ledgers and settlement. */
class PaWorkspaceController extends Controller
{
    private function authorizeMandate(Request $request, Mandate $mandate): void
    {
        abort_unless($mandate->user_id === $request->user()->id || $request->user()->role === 'admin', 403);
        MandateWorkflow::reconcile($mandate);
        $mandate->refresh();
    }

    public static function present(Mandate $m): array
    {
        $svc = $m->service_code ? (PaContent::services()[$m->service_code] ?? null) : null;
        $stage = PaContent::LIFECYCLE[$m->stage] ?? PaContent::LIFECYCLE[0];
        $pending = $m->gates->firstWhere('status', 'pending');

        return [
            'reference' => $m->reference, 'project' => $m->project_name, 'organisation' => $m->organisation, 'country' => $m->country,
            'sector' => PaContent::SECTORS[$m->sector][0] ?? $m->sector, 'stage_index' => $m->stage, 'stage' => "{$stage[0]} {$stage[1]}", 'stage_name' => $stage[2],
            'status' => $m->status, 'gate' => $m->current_gate, 'route' => $m->engagement_route, 'entry' => $m->entry_route,
            'service' => $svc ? ['slug' => $svc['slug'], 'name' => $svc['name'], 'code' => $svc['code'], 'price' => $svc['price'], 'duration' => $svc['duration']] : null,
            'method_card_ref' => $svc ? 'MC-'.substr($stage[0], 0).'-'.strtoupper(substr($svc['slug'], 0, 4)).'-02' : null,
            'lead' => $m->lead_adviser, 'reviewer' => $m->senior_reviewer,
            'nda_signed' => $m->nda_signed_at?->format('d M Y'), 'method_approved' => $m->method_card_approved_at?->format('d M Y'),
            'letter_signed' => $m->letter_signed_at?->format('d M Y'), 'mandate_signed' => $m->mandate_signed_at?->format('d M Y'),
            'deposit' => $m->depositOrder ? ['reference' => $m->depositOrder->reference, 'status' => $m->depositOrder->status, 'total' => $m->depositOrder->total_zar] : null,
            'lifecycle' => array_map(fn ($l, $i) => ['code' => $l[0], 'label' => $l[1], 'state' => $i < $m->stage ? 'done' : ($i === $m->stage ? 'current' : 'todo')], PaContent::LIFECYCLE, array_keys(PaContent::LIFECYCLE)),
            'gates' => $m->gates->map(fn ($g) => ['code' => $g->code, 'name' => $g->name, 'binds' => $g->binds, 'status' => $g->status, 'amount' => $g->amount_zar, 'decided' => $g->decided_at?->format('d M Y'), 'by' => $g->decided_by, 'expires' => $g->expires_at?->format('d M Y, H:i')])->values(),
            'pending_gate' => $pending?->code,
            'meta' => $m->meta ?? [],
            'signals' => $m->qualification['signals'] ?? [],
            'stop_blocks' => MandateWorkflow::stopNow($m),
            'next' => self::nextAction($m),
        ];
    }

    public static function nextAction(Mandate $m): array
    {
        $r = $m->reference;

        return match (true) {
            $m->status === 'declined' => ['label' => 'Engagement declined', 'href' => null, 'who' => 'TBCA'],
            in_array($m->status, ['paused', 'stopped'], true) => ['label' => 'Engagement paused at current boundary', 'href' => null, 'who' => 'Client'],
            $m->status === 'discovery' && ! ($m->depositOrder?->isPaid()) => ['label' => 'Complete Structured Discovery payment', 'href' => $m->depositOrder ? "/checkout/{$m->depositOrder->reference}" : null, 'who' => 'Client'],
            ! $m->nda_signed_at => ['label' => 'Review and sign the NDA', 'href' => "/project-advisory/workspace/{$r}/nda", 'who' => 'Client'],
            in_array($m->status, ['enquiry', 'qualified', 'discovery'], true) => ['label' => 'TBCA is preparing your Method Card', 'href' => null, 'who' => 'TBCA'],
            $m->status === 'method_card' => ['label' => 'Approve the Method Card', 'href' => "/project-advisory/workspace/{$r}/method-card", 'who' => 'Client'],
            $m->status === 'letter' && ! $m->letter_signed_at => ['label' => 'Sign the Engagement Letter', 'href' => "/project-advisory/workspace/{$r}/engagement-letter", 'who' => 'Client'],
            $m->status === 'letter' && ! $m->mandate_signed_at => ['label' => 'Sign the Mandate Letter', 'href' => "/project-advisory/workspace/{$r}/mandate-letter", 'who' => 'Client'],
            $m->status === 'letter' => ['label' => 'Pay the mandate deposit', 'href' => $m->depositOrder ? "/checkout/{$m->depositOrder->reference}" : null, 'who' => 'Client'],
            $m->gates->firstWhere('status', 'pending') !== null => ['label' => 'Review Gate '.$m->gates->firstWhere('status', 'pending')->code.': '.$m->gates->firstWhere('status', 'pending')->name, 'href' => "/project-advisory/workspace/{$r}?gate=1", 'who' => 'Client'],
            default => ['label' => $m->meta['next_tbca'] ?? 'TBCA delivery in progress', 'href' => null, 'who' => 'TBCA'],
        };
    }

    public static function ledgerSummary(Mandate $m): array
    {
        $out = [];
        foreach (PaContent::LEDGERS as $l => [$name, $recipient]) {
            $lines = $m->lines->where('ledger', $l);
            $expected = $lines->sum('expected_zar');
            $earned = $lines->sum('earned_zar');
            $due = $lines->whereIn('status', ['approved', 'invoiced']);
            $next = $lines->first(fn ($x) => ! in_array($x->status, ['paid', 'direct_paid'], true));
            $status = match ($l) {
                'C' => 'Conditional',
                'X' => $lines->where('status', 'approved')->count() ? 'In Progress' : 'Pending',
                'S' => $lines->sum('paid_zar') > 0 ? 'In Progress' : 'None Incurred',
                default => $lines->count() ? 'Active' : 'Not configured',
            };
            $out[$l] = [
                'ledger' => $l, 'name' => $name, 'recipient' => $lines->first()?->recipient ?? $recipient, 'payer' => $m->organisation, 'status' => $status,
                'paid' => $lines->sum('paid_zar'), 'earned' => $earned, 'unearned' => max(0, $expected - $earned), 'creditable' => $lines->sum('creditable_zar'),
                'refundable' => $m->status === 'stopped' ? max(0, $lines->sum('paid_zar') - $earned) : 0,
                'next_milestone' => $next?->item, 'next_due' => $l === 'C' ? null : $due->sum('expected_zar'), 'due_date' => $due->min('due_date') ? \Illuminate\Support\Carbon::parse($due->min('due_date'))->format('d M Y') : null,
                'lines' => $lines->map(fn ($x) => self::line($x))->values(),
            ];
        }

        return $out;
    }

    public static function line(MandateLine $x): array
    {
        return ['id' => $x->id, 'ledger' => $x->ledger, 'code' => $x->code, 'item' => $x->item, 'recipient' => $x->recipient, 'basis' => $x->basis, 'certainty' => $x->certainty,
            'status' => $x->status, 'low' => $x->low_zar, 'expected' => $x->expected_zar, 'high' => $x->high_zar, 'paid' => $x->paid_zar, 'earned' => $x->earned_zar,
            'creditable' => $x->creditable_zar, 'invoice' => $x->invoice_ref, 'due' => $x->due_date?->format('d M Y'), 'gate' => $x->gate_code,
            'route' => $x->payment_route, 'evidence' => $x->evidence, 'vat' => in_array($x->ledger, ['T', 'P'], true) ? (int) round($x->expected_zar * 0.15) : 0, 'order' => $x->order?->reference];
    }

    private function base(Mandate $m): array
    {
        $m->load(['gates', 'lines.order', 'events', 'depositOrder']);

        return ['mandate' => self::present($m), 'events' => $m->events->take(12)->map(fn ($e) => ['actor' => $e->actor, 'event' => $e->event, 'ref' => $e->ref, 'at' => $e->created_at->format('d M Y H:i'), 'ago' => $e->created_at->diffForHumans()])->values()];
    }

    public function index(Request $request): Response
    {
        $mandates = Mandate::query()->where('user_id', $request->user()->id)->with(['gates', 'depositOrder'])->latest()->get();

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/Index', ['mandates' => $mandates->map(fn ($m) => self::present($m))]);
    }

    public function show(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);
        $base = $this->base($mandate);
        $gate = $mandate->gates->firstWhere('status', 'pending');

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/Show', [
            ...$base,
            'ledgers' => self::ledgerSummary($mandate),
            'gateDetail' => $gate && ! in_array($gate->code, ['G1', 'G2'], true) ? $this->gateDetail($mandate, $gate) : null,
            'openGate' => $request->boolean('gate'),
        ]);
    }

    private function gateDetail(Mandate $m, MandateGate $g): array
    {
        $checks = MandateWorkflow::gateChecks($m, $g);
        $svc = $m->service_code ? PaContent::services()[$m->service_code] : null;

        return [
            'code' => $g->code, 'name' => $g->name, 'binds' => $g->binds, 'expires' => $g->expires_at?->format('d M Y, H:i'),
            'checks' => $checks, 'blocking' => count(array_filter($checks, fn ($c) => $c['state'] === 'blocking')), 'unresolved' => count(array_filter($checks, fn ($c) => $c['state'] === 'unresolved')),
            'fingerprint' => MandateWorkflow::fingerprint($m), 'method_card' => $svc ? $svc['code'].' ('.$svc['pcode'].')' : '—',
            'ledgers' => collect(self::ledgerSummary($m))->map(fn ($l) => ['ledger' => $l['ledger'], 'name' => $l['name'], 'recipient' => $l['recipient'],
                'amount' => $m->lines->where('ledger', $l['ledger'])->where('gate_code', $g->code)->sum('expected_zar'),
                'basis' => $m->lines->where('ledger', $l['ledger'])->first()?->basis ?? '—'])->values(),
            'evidence' => $m->meta['evidence_requests'] ?? [],
        ];
    }

    public function nda(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/Nda', [...$this->base($mandate), 'clauses' => PaContent::ndaClauses(), 'fingerprint' => 'FP-'.strtoupper(implode('-', str_split(substr(md5($mandate->reference.'nda'), 0, 12), 4)))]);
    }

    public function ndaSign(Request $request, Mandate $mandate): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $d = $request->validate(['name' => ['required', 'string', 'max:120'], 'role' => ['required', 'string', 'max:120'], 'authority' => ['accepted'], 'esign' => ['accepted'], 'decision' => ['nullable', Rule::in(['sign', 'decline'])]],
            ['authority.accepted' => 'Confirm you have authority to sign (SN-06).', 'esign.accepted' => 'Consent to electronic signature is required.']);
        $mandate->update(['nda_signed_at' => now(), 'nda_signer' => "{$d['name']}, {$d['role']}", 'stage' => max($mandate->stage, 3)]);
        $mandate->log($d['name'], 'NDA v2.0 signed — protected evidence unlocked');

        return redirect()->route('adv.pa.ws.show', $mandate)->with('success', 'NDA signed. Protected evidence is now unlocked.');
    }

    public function methodCard(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);
        $base = $this->base($mandate);
        $svc = $mandate->service_code ? PaContent::services()[$mandate->service_code] : null;
        $t = $svc['price'] ?? 0;

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/MethodCard', [
            ...$base,
            'card' => $svc ? PaContent::methodCard(['service' => $mandate->service_code, 'stage_label' => $base['mandate']['stage'], 'lead' => $mandate->lead_adviser, 'reviewer' => $mandate->senior_reviewer]) : null,
            'earning' => array_map(fn ($e) => ['milestone' => $e[0], 'event' => $e[1], 'pct' => $e[2], 'timing' => $e[3], 'amount' => (int) round($t * $e[2] / 100), 'status' => $mandate->method_card_approved_at && $e[0] === 'M1 – Commencement' ? 'Earned on approval' : 'Pending'], PaContent::earningSchedule($t)),
            'ledgers' => self::ledgerSummary($mandate),
            'gate' => $mandate->gates->firstWhere('code', 'G1'),
            'checks' => ($g = $mandate->gates->firstWhere('code', 'G1')) ? MandateWorkflow::gateChecks($mandate, $g) : [],
        ]);
    }

    public function methodDecision(Request $request, Mandate $mandate): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $d = $request->validate(['decision' => ['required', Rule::in(['approve', 'change', 'decline'])], 'note' => ['nullable', 'string', 'max:1000']]);
        $g = $mandate->gates()->where('code', 'G1')->firstOrFail();
        if ($d['decision'] === 'approve') {
            MandateWorkflow::approveGate($mandate, $g, $request->user()->name);
            $mandate->update(['method_card_approved_at' => now(), 'status' => 'letter']);
            $mandate->gates()->where('code', 'G2')->update(['status' => 'pending', 'expires_at' => now()->addDays(14)]);

            return redirect()->route('adv.pa.ws.letter', $mandate)->with('success', 'Method Card approved. Review and sign your Engagement Letter.');
        }
        $g->update(['status' => $d['decision'] === 'change' ? 'change_requested' : 'declined', 'note' => $d['note'], 'decided_at' => now(), 'decided_by' => $request->user()->name]);
        if ($d['decision'] === 'decline') {
            $mandate->update(['status' => 'stopped']);
        }
        $mandate->log($request->user()->name, $d['decision'] === 'change' ? 'Method Card change requested' : 'Stage declined at Method Card');

        return back()->with('success', $d['decision'] === 'change' ? 'Change request sent to your Lead Adviser.' : 'Stage declined. No paid work will begin.');
    }

    public function letter(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/EngagementLetter', [...$this->base($mandate), 'ledgers' => self::ledgerSummary($mandate), 'fingerprint' => MandateWorkflow::fingerprint($mandate)]);
    }

    public function letterSign(Request $request, Mandate $mandate): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $request->validate(['read' => ['accepted'], 'terms' => ['accepted'], 'name' => ['required', 'string', 'max:120']]);
        if (! $mandate->method_card_approved_at) {
            throw ValidationException::withMessages(['read' => 'The Method Card must be approved before the Engagement Letter can be signed.']);
        }
        if ($blocks = MandateWorkflow::stopNow($mandate)) {
            throw ValidationException::withMessages(['read' => 'Stop-Now: '.$blocks[0]['message']]);
        }
        $mandate->update(['letter_signed_at' => now(), 'signer_name' => $request->input('name')]);
        $g = $mandate->gates()->where('code', 'G2')->first();
        if ($g && $g->status === 'pending') {
            MandateWorkflow::approveGate($mandate->fresh(), $g, $request->input('name'));
        }
        $mandate->log($request->input('name'), 'Engagement Letter EL-v2.3 signed (authority validated)');

        return redirect()->route('adv.pa.ws.mandate', $mandate)->with('success', 'Engagement Letter signed. One signature left: your Mandate Letter.');
    }

    public function mandateLetter(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);
        $t = $mandate->service_code ? PaContent::services()[$mandate->service_code]['price'] : 0;

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/MandateLetter', [
            ...$this->base($mandate), 'value' => $t, 'deposit' => (int) round($t * 0.2) + 1950,
            'letterRef' => 'TBCA-ML-'.now()->format('Y').'-'.substr(preg_replace('/\D/', '', $mandate->reference), -4).'-'.substr(md5($mandate->reference), 0, 4),
        ]);
    }

    public function mandateSign(Request $request, Mandate $mandate): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Confirm you accept the Mandate Letter to sign electronically.']);
        if (! $mandate->letter_signed_at) {
            throw ValidationException::withMessages(['accept' => 'Sign the Engagement Letter first.']);
        }
        $depositLines = $mandate->lines()->whereIn('ledger', ['T', 'P'])->where('gate_code', 'G2')->whereIn('status', ['approved', 'disclosed'])->get();
        if ($depositLines->isEmpty()) {
            throw ValidationException::withMessages(['accept' => 'No deposit lines are configured for this mandate.']);
        }
        $order = Checkout::createOrder($depositLines->map(fn ($l) => [
            'item_type' => 'advisory', 'item_code' => $l->code ?: 'PA-'.$l->id, 'name' => "[Ledger {$l->ledger}] {$l->item}", 'unit_zar' => $l->expected_zar,
            'meta' => ['mandate' => $mandate->reference, 'ledger' => $l->ledger, 'line' => $l->id],
        ])->all(), $request->user(), 'advisory', ['return_url' => "/project-advisory/workspace/{$mandate->reference}", 'title' => 'Mandate deposit', 'mandate' => $mandate->reference]);
        foreach ($depositLines as $l) {
            $l->update(['order_id' => $order->id, 'status' => 'invoiced', 'invoice_ref' => 'INV-'.$l->ledger.'-'.random_int(10000, 29999), 'due_date' => now()->addDays(7)]);
        }
        $mandate->update(['mandate_signed_at' => now(), 'deposit_order_id' => $order->id, 'status' => 'letter']);
        $mandate->log($request->user()->name, 'Mandate Letter signed — deposit invoiced', $order->reference);

        return redirect()->route('checkout.show', $order);
    }

    public function ledger(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);
        $last = $mandate->gates->where('status', 'approved')->last();

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/Ledger', [...$this->base($mandate), 'ledgers' => self::ledgerSummary($mandate),
            'stop' => ['position' => $last ? "End of {$last->code} – {$last->name}" : 'Before G0', 'date' => now()->format('d M Y'), 'resume' => $mandate->current_gate]]);
    }

    public function settlement(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/Settlement', [...$this->base($mandate), 'ledgers' => self::ledgerSummary($mandate)]);
    }

    public function payLine(Request $request, Mandate $mandate, int $line): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $l = $mandate->lines()->findOrFail($line);
        if ($l->order && $l->order->status === 'awaiting_payment') {
            return redirect()->route('checkout.show', $l->order);
        }

        return redirect()->route('checkout.show', MandateWorkflow::payLine($mandate, $l, $request->user()));
    }

    public function directPaid(Request $request, Mandate $mandate, int $line): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $d = $request->validate(['proof' => ['required', 'string', 'max:80']]);
        $l = $mandate->lines()->where('ledger', 'X')->findOrFail($line);
        if ($l->status !== 'approved') {
            return back()->with('error', 'External items can only be settled after line-by-line approval at G3.');
        }
        $l->update(['status' => 'direct_paid', 'paid_zar' => $l->expected_zar, 'evidence' => "Proof of payment {$d['proof']}"]);
        $mandate->log($request->user()->name, "Provider invoice settled direct: {$l->item}", $d['proof']);

        return back()->with('success', 'Direct provider payment recorded against its own evidence and ledger.');
    }

    public function feeMeter(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);
        $base = $this->base($mandate);
        $pendingCodes = $mandate->gates->where('status', 'pending')->pluck('code')->all();
        $rows = [];
        foreach (PaContent::LEDGERS as $l => [$name]) {
            $lines = $mandate->lines->where('ledger', $l);
            $rows[] = [
                'ledger' => $l, 'name' => $name,
                'paid' => $lines->sum('paid_zar'),
                'approved' => $lines->whereIn('status', ['approved', 'invoiced'])->sum('expected_zar'),
                'committed' => $lines->where('status', 'disclosed')->whereNotIn('gate_code', $pendingCodes)->filter(fn ($x) => $x->certainty !== 'quote_on_trigger')->sum('expected_zar'),
                'pending' => $lines->where('status', 'disclosed')->whereIn('gate_code', $pendingCodes)->sum('expected_zar'),
                'uncommitted' => $lines->where('status', 'disclosed')->whereNotIn('gate_code', $pendingCodes)->filter(fn ($x) => $x->certainty === 'quote_on_trigger')->sum('expected_zar'),
                'potential' => $l === 'C' ? $lines->sum('high_zar') : 0,
            ];
        }
        $gate = $mandate->gates->firstWhere('status', 'pending');

        return Inertia::render('Advisory/ProjectAdvisory/Workspace/FeeMeter', [...$base, 'rows' => $rows,
            'nextGate' => $gate ? ['code' => $gate->code, 'name' => $gate->name, 'binds' => $gate->binds, 'amount' => $mandate->lines->where('gate_code', $gate->code)->sum('expected_zar'), 'due' => $gate->expires_at?->format('d M Y')] : null,
            'cap' => $mandate->meta['contingent_cap'] ?? 450000]);
    }

    public function contingent(Request $request, Mandate $mandate): Response
    {
        $this->authorizeMandate($request, $mandate);
        $amount = max(1_000_000, min(500_000_000, (int) $request->query('amount', 40_000_000)));
        $c = $mandate->meta['contingent'] ?? [];
        $blocks = [
            ['Legal permission unresolved', $c['legal'] ?? 'Unresolved'], ['Board class activation unresolved', $c['board'] ?? 'Unresolved'],
            ['Conflict disclosure incomplete', $c['conflict'] ?? 'Incomplete'], ['Trigger evidence absent', $c['trigger'] ?? 'Absent'],
            ['Contingent term sheet not approved', $c['term_sheet'] ?? 'Not Approved'], ['Human reviewer sign-off pending', $c['reviewer'] ?? 'Pending'],
        ];

        return Inertia::render('Advisory/ProjectAdvisory/Contingent', ['calc' => PaContent::contingent($amount, (int) ($c['credit'] ?? 150000)), 'mandate' => $this->base($mandate)['mandate'], 'blocks' => $blocks]);
    }

    public function gateDecision(Request $request, Mandate $mandate, string $code): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $d = $request->validate(['decision' => ['required', Rule::in(['approve', 'decline', 'change'])], 'confirm' => ['required_if:decision,approve', 'boolean'], 'note' => ['nullable', 'string', 'max:1000']]);
        $g = $mandate->gates()->where('code', $code)->firstOrFail();
        if ($d['decision'] === 'approve') {
            if (! $request->boolean('confirm')) {
                throw ValidationException::withMessages(['confirm' => 'Confirm you have reviewed the gate before approving.']);
            }
            MandateWorkflow::approveGate($mandate, $g, $request->user()->name);

            return back()->with('success', "Gate {$code} approved. Approval recorded server-side with an immutable audit trail.");
        }
        $g->update(['status' => $d['decision'] === 'decline' ? 'declined' : 'change_requested', 'note' => $d['note'], 'decided_at' => now(), 'decided_by' => $request->user()->name]);
        if ($d['decision'] === 'decline') {
            $mandate->update(['status' => 'paused']);
        }
        $mandate->log($request->user()->name, $d['decision'] === 'decline' ? "Gate {$code} declined — work paused at boundary" : "Change requested on Gate {$code}");

        return back()->with('success', $d['decision'] === 'decline' ? 'Gate declined. Work pauses at the current boundary; no future charges are approved.' : 'Change request sent.');
    }

    public function evidenceUpload(Request $request, Mandate $mandate, int $index): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $request->validate(['file' => ['required', 'file', 'max:20480']]);
        $meta = $mandate->meta ?? [];
        abort_unless(isset($meta['evidence_requests'][$index]), 404);
        $path = $request->file('file')->store("advisory/{$mandate->reference}", 'local');
        $meta['evidence_requests'][$index]['status'] = 'Submitted';
        $meta['evidence_requests'][$index]['file'] = basename($path);
        $mandate->update(['meta' => $meta]);
        $mandate->log($request->user()->name, 'Evidence uploaded: '.$meta['evidence_requests'][$index]['item']);

        return back()->with('success', 'Evidence uploaded to the secure VDR.');
    }

    public function stop(Request $request, Mandate $mandate): RedirectResponse
    {
        $this->authorizeMandate($request, $mandate);
        $d = $request->validate(['action' => ['required', Rule::in(['pause', 'resume'])]]);
        if ($d['action'] === 'pause') {
            $mandate->update(['status' => 'paused']);
            $mandate->gates()->where('status', 'pending')->update(['status' => 'locked']);
            $mandate->log($request->user()->name, 'Stop / Pause requested — unapproved future phases will not become due');

            return back()->with('success', 'Engagement paused. You keep all approved work product.');
        }
        $mandate->update(['status' => 'active']);
        $mandate->gates()->where('code', $mandate->current_gate)->where('status', 'locked')->update(['status' => 'pending', 'expires_at' => now()->addDays(14)]);
        $mandate->log($request->user()->name, 'Engagement resumed');

        return back()->with('success', 'Engagement resumed.');
    }
}
