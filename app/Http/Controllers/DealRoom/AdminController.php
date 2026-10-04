<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Models\DealRoom\Approval;
use App\Models\DealRoom\Charge;
use App\Models\DealRoom\CommercialRequest;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Billing;
use App\Support\DealRoom\Requests;
use App\Support\DealRoom\Stages;
use App\Support\DealRoom\Usage;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** TBCA Deal Room Control Tower: rooms, TBCA-side approvals, commercial requests and billing. */
class AdminController extends Controller
{
    protected function presentRoom(Room $r): array
    {
        return [
            'slug' => $r->slug, 'reference' => $r->reference, 'name' => $r->name, 'company' => $r->company, 'owner' => $r->owner?->name,
            'stage' => (string) $r->current_stage, 'stageName' => Stages::get((string) $r->current_stage)['name'], 'status' => $r->status,
            'documents' => $r->documents_count ?? 0, 'parties' => $r->parties_count ?? 0, 'updated' => $r->updated_at->format('d M Y'),
        ];
    }

    public function index(Request $request): Response
    {
        $rooms = Room::with('owner')->withCount(['documents', 'parties'])
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('q'), fn ($q, $s) => $q->where(fn ($q) => $q->where('name', 'like', "%$s%")->orWhere('reference', 'like', "%$s%")->orWhere('company', 'like', "%$s%")))
            ->latest('id')->get();

        $tbcaApprovals = Approval::with('room')->where('status', 'pending')->latest('id')->get()
            ->filter(fn ($a) => ! Access::clientCanDecide($a->approver_role))->take(20)
            ->map(fn ($a) => [...Workflow::presentApproval($a), 'subject' => $a->subject, 'room' => $a->room->name, 'slug' => $a->room->slug])->values();

        return Inertia::render('DealRoom/Admin/Index', [
            'rooms' => $rooms->map(fn ($r) => $this->presentRoom($r)),
            'approvals' => $tbcaApprovals,
            'kpis' => [
                'rooms' => Room::count(),
                'active' => Room::where('status', 'active')->count(),
                'paused' => Room::where('status', 'paused')->count(),
                'requests' => CommercialRequest::whereIn('status', ['submitted', 'under_review', 'resolution_proposed'])->count(),
                'collected' => (int) Charge::whereIn('status', ['paid', 'partially_refunded'])->sum('total_zar'),
                'outstanding' => (int) Charge::whereIn('status', ['issued', 'awaiting_payment', 'failed'])->sum('total_zar'),
            ],
            'stageDistribution' => collect(Stages::codes())->map(fn ($c) => ['code' => $c, 'short' => Stages::get($c)['short'], 'count' => $rooms->where('current_stage', $c)->count()]),
            'filters' => ['status' => $request->query('status', ''), 'q' => $request->query('q', '')],
        ]);
    }

    public function room(Room $room): Response
    {
        Billing::sync($room);
        Workflow::ensureStages($room);
        $room->loadCount(['documents', 'parties'])->load('owner');

        return Inertia::render('DealRoom/Admin/Room', [
            'room' => $this->presentRoom($room),
            'stages' => collect(Workflow::stepper($room))->map(fn ($s) => [...$s, 'gate' => in_array($s['status'], ['unlocked'], true) ? Workflow::gate($room, $s['code']) : null])->values(),
            'charges' => $room->charges()->latest('id')->get()->map(fn ($c) => Billing::present($c)),
            'requests' => $room->requests()->latest('id')->get()->map(fn ($r) => Requests::present($r)),
            'audit' => Audit::recent($room, 25),
            'usage' => Usage::summary($room),
        ]);
    }

    public function requests(Request $request): Response
    {
        $rows = CommercialRequest::with(['room', 'charge'])
            ->when($request->query('type'), fn ($q, $t) => $q->where('type', $t))
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->latest('id')->get();

        return Inertia::render('DealRoom/Admin/Requests', [
            'requests' => $rows->map(fn ($r) => [...Requests::present($r), 'room' => $r->room->name, 'slug' => $r->room->slug]),
            'filters' => ['type' => $request->query('type', ''), 'status' => $request->query('status', '')],
        ]);
    }

    public function billing(Request $request): Response
    {
        $rows = Charge::with(['room', 'order'])
            ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->query('kind'), fn ($q, $k) => $q->where('kind', $k))
            ->latest('id')->get();

        return Inertia::render('DealRoom/Admin/Billing', [
            'charges' => $rows->map(fn ($c) => [...Billing::present($c), 'room' => $c->room->name, 'slug' => $c->room->slug]),
            'filters' => ['status' => $request->query('status', ''), 'kind' => $request->query('kind', '')],
        ]);
    }

    /** Dispute review workflow: under review -> resolution proposed (with credit) -> client accepts; or reject. */
    public function review(Request $request, CommercialRequest $req): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['start_review', 'propose', 'reject'])],
            'resolution' => ['required_if:action,propose', 'nullable', 'string', 'max:1000'],
            'credit' => ['nullable', 'integer', 'min:0', 'max:'.max(0, $req->amount_zar)],
        ]);
        abort_unless($req->type === 'dispute', 422);
        match ($data['action']) {
            'start_review' => $req->update(['status' => 'under_review']),
            'propose' => $req->update(['status' => 'resolution_proposed', 'resolution' => $data['resolution'], 'payload' => [...($req->payload ?? []), 'credit' => (int) ($data['credit'] ?? 0)]]),
            'reject' => $req->update(['status' => 'rejected', 'resolution' => $data['resolution'] ?? 'Dispute not upheld.', 'decided_at' => now()]),
        };
        Audit::log($req->room, 'dispute.'.$data['action'], "Dispute {$req->reference}: ".str_replace('_', ' ', $data['action']), $request->user()->name);

        return back()->with('success', 'Dispute updated.');
    }
}
