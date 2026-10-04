<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\Mandate;
use App\Models\Advisory\StopRule;
use App\Support\Advisory\MandateWorkflow;
use App\Support\Advisory\PaContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Project Advisory Control Tower: qualification, method cards, evidence and Stop-Now governance. */
class PaAdminController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $q = trim((string) $request->query('q', ''));
        $mandates = Mandate::query()->with(['gates', 'depositOrder'])
            ->when($status, fn ($b) => $b->where('status', $status))
            ->when($q !== '', fn ($b) => $b->where(fn ($w) => $w->where('reference', 'like', "%{$q}%")->orWhere('project_name', 'like', "%{$q}%")->orWhere('organisation', 'like', "%{$q}%")))
            ->latest()->get();
        $all = Mandate::query()->get(['status', 'stage']);
        $funnel = array_map(fn ($l, $i) => ['code' => $l[0], 'label' => $l[1], 'count' => $all->where('stage', $i)->count()], PaContent::LIFECYCLE, array_keys(PaContent::LIFECYCLE));

        return Inertia::render('Advisory/Admin/Mandates', [
            'mandates' => $mandates->map(fn ($m) => [...PaWorkspaceController::present($m), 'signals' => $m->qualification['signals'] ?? [], 'created' => $m->created_at->format('d M Y')]),
            'filters' => ['status' => $status, 'q' => $q],
            'statusCounts' => $all->groupBy('status')->map->count(),
            'funnel' => $funnel,
            'blocks' => Mandate::query()->get()->sum(fn ($m) => count(MandateWorkflow::stopNow($m))),
        ]);
    }

    public function show(Mandate $mandate): Response
    {
        MandateWorkflow::reconcile($mandate);
        $mandate->refresh()->load(['gates', 'lines.order', 'events', 'depositOrder']);

        return Inertia::render('Advisory/Admin/MandateShow', [
            'mandate' => PaWorkspaceController::present($mandate),
            'ledgers' => PaWorkspaceController::ledgerSummary($mandate),
            'events' => $mandate->events->take(20)->map(fn ($e) => ['actor' => $e->actor, 'event' => $e->event, 'ref' => $e->ref, 'at' => $e->created_at->format('d M Y H:i')])->values(),
            'qualification' => $mandate->qualification ?? [],
            'services' => collect(PaContent::services())->map(fn ($s) => ['slug' => $s['slug'], 'name' => "{$s['code']} {$s['name']}"])->values(),
            'rules' => PaContent::stopNowRules(),
            'flags' => $mandate->meta['flags'] ?? [],
        ]);
    }

    public function action(Request $request, Mandate $mandate): RedirectResponse
    {
        $d = ['service' => null, 'item' => null, 'index' => null, 'line' => null, 'flag' => null, ...$request->validate([
            'action' => ['required', Rule::in(['qualify', 'decline', 'method_card', 'request_evidence', 'accept_evidence', 'add_deliverable', 'deliver', 'earn', 'flag', 'next_tbca'])],
            'service' => ['nullable', Rule::in(array_keys(PaContent::services()))],
            'item' => ['nullable', 'string', 'max:160'],
            'index' => ['nullable', 'integer'],
            'line' => ['nullable', 'integer'],
            'flag' => ['nullable', 'string'],
        ])];
        $meta = $mandate->meta ?? [];
        $admin = $request->user()->name;
        switch ($d['action']) {
            case 'qualify':
                $mandate->update(['status' => $mandate->status === 'enquiry' ? 'qualified' : $mandate->status, 'stage' => max($mandate->stage, 2)]);
                $mandate->log($admin, 'Qualification, conflicts and capacity cleared');
                break;
            case 'decline':
                $mandate->update(['status' => 'declined']);
                $mandate->log($admin, 'Honest decline issued — not the right fit at this stage');
                break;
            case 'method_card':
                if (! $d['service']) {
                    return back()->with('error', 'Choose the service for the Method Card.');
                }
                MandateWorkflow::issueMethodCard($mandate, $d['service']);
                break;
            case 'request_evidence':
                $meta['evidence_requests'][] = ['item' => $d['item'] ?: 'Supporting evidence', 'requested' => now()->format('d M Y'), 'status' => 'Outstanding', 'required_by' => now()->addDays(14)->format('d M Y')];
                $mandate->update(['meta' => $meta]);
                $mandate->log($admin, 'Evidence requested: '.($d['item'] ?: 'Supporting evidence'));
                break;
            case 'accept_evidence':
                if (isset($meta['evidence_requests'][$d['index']])) {
                    $meta['evidence_requests'][$d['index']]['status'] = 'Accepted';
                    $mandate->update(['meta' => $meta]);
                }
                break;
            case 'add_deliverable':
                $meta['deliverables'][] = ['name' => $d['item'] ?: 'Deliverable', 'ref' => strtoupper(substr(md5((string) microtime(true)), 0, 6)), 'due' => now()->addDays(14)->format('d M Y'), 'status' => 'In Preparation', 'owner' => 'TBCA Lead'];
                $mandate->update(['meta' => $meta]);
                break;
            case 'deliver':
                if (isset($meta['deliverables'][$d['index']])) {
                    $meta['deliverables'][$d['index']]['status'] = 'Ready for Review';
                    $mandate->update(['meta' => $meta]);
                    $mandate->log($admin, 'Deliverable ready for review: '.$meta['deliverables'][$d['index']]['name']);
                }
                break;
            case 'earn':
                $line = $mandate->lines()->findOrFail($d['line']);
                $line->update(['earned_zar' => $line->expected_zar]);
                $mandate->log($admin, "Milestone earned (approved event): {$line->item}");
                break;
            case 'flag':
                $meta['flags'][$d['flag']] = empty($meta['flags'][$d['flag']] ?? null);
                $mandate->update(['meta' => $meta]);
                $mandate->log($admin, ($meta['flags'][$d['flag']] ? 'Stop-Now raised: ' : 'Stop-Now cleared: ').$d['flag']);
                break;
            case 'next_tbca':
                $meta['next_tbca'] = $d['item'];
                $mandate->update(['meta' => $meta]);
                break;
        }

        return back()->with('success', 'Mandate updated.');
    }

    public function stopNow(): Response
    {
        $blocks = Mandate::query()->get()->flatMap(fn ($m) => array_map(fn ($b) => [...$b, 'mandate' => $m->reference], MandateWorkflow::stopNow($m)))->values();

        return Inertia::render('Advisory/Admin/StopNow', ['rules' => StopRule::query()->orderBy('code')->get(), 'blocks' => $blocks]);
    }

    public function toggleRule(StopRule $rule): RedirectResponse
    {
        $rule->update(['enabled' => ! $rule->enabled]);

        return back()->with('success', "{$rule->code} ".($rule->enabled ? 'enforced' : 'disabled (logged)').'.');
    }
}
