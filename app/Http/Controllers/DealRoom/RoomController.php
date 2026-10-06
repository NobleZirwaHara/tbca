<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Approval;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Billing;
use App\Support\DealRoom\Pricing;
use App\Support\DealRoom\Requests;
use App\Support\DealRoom\StageContent;
use App\Support\DealRoom\StageData;
use App\Support\DealRoom\Stages;
use App\Support\DealRoom\Usage;
use App\Support\DealRoom\Workflow;
use App\Support\Platform\EmbeddedServices;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Room dashboard and every transaction stage screen (one shared template),
 * plus the gate actions: tick a completion-test item, decide an approval,
 * pay the stage fee and complete the stage.
 */
class RoomController extends Controller
{
    use LoadsRoom;

    /** Pages a non-managing party (investor, lender, adviser) may open. */
    protected const PARTY_PAGES = ['ai-qa-assistant', 'live-negotiation', 'offer-term-sheet-management'];

    public function show(Request $request, Room $room): Response
    {
        $this->enter($request, $room);

        $charges = $room->charges()->latest('id')->limit(6)->get()->map(fn ($c) => Billing::present($c));
        $current = (string) $room->current_stage;

        return Inertia::render('DealRoom/Room/Dashboard', [
            ...$this->shared($request, $room),
            'gate' => Workflow::gate($room, $current),
            'charges' => $charges,
            'usage' => collect(Usage::summary($room)['rows'])->take(5)->values(),
            'counts' => [
                'documents' => $room->documents()->count(),
                'parties' => $room->parties()->where('status', 'active')->count(),
                'questions' => $room->questions()->where('status', 'open')->count(),
                'approvals' => $room->approvals()->where('status', 'pending')->count(),
            ],
            'embedded' => EmbeddedServices::forModule('virtual-deal-room'),
        ]);
    }

    public function page(Request $request, Room $room, string $page): Response|RedirectResponse
    {
        $role = $this->enter($request, $room);
        $code = Stages::forPage($page);
        abort_if($code === null || in_array($code, ['A'], true), 404);
        if ($code === '0' && $page !== 'created') {
            return redirect()->route('deal-room.setup', [$room, 'deal-basics']);
        }
        abort_unless(Access::manages($room, $request->user()) || in_array($page, self::PARTY_PAGES, true), 403, 'Your role does not have access to this stage.');

        $stage = Workflow::stage($room, $code);
        if ($page === 'ai-qa-assistant' && $role !== 'owner' && ! Access::can($room, $request->user(), 'ask_qa')) {
            abort(403);
        }

        $def = Stages::get($code);

        return Inertia::render('DealRoom/Room/Stage', [
            ...$this->shared($request, $room),
            'page' => $page,
            'stage' => [
                'code' => $code, 'name' => $def['name'], 'phase' => $def['phase'], 'status' => $stage->status,
                'start' => $def['start'], 'output' => $def['output'], 'revenue' => $def['revenue'],
                'unlockedAt' => $stage->unlocked_at?->format('d M Y'), 'completedAt' => $stage->completed_at?->format('d M Y H:i'),
                'next' => Stages::next($code) !== null ? ['code' => Stages::next($code), 'name' => Stages::get(Stages::next($code))['name'], 'page' => Stages::get(Stages::next($code))['page']] : null,
                'lockRule' => Stages::LOCK_RULE,
            ],
            'gate' => Workflow::gate($room, $code),
            'blocks' => $page === 'archive-renewal' ? [] : StageContent::blocks($code),
            'data' => $stage->status === 'locked' ? [] : StageData::for($room, $page, $request->user()),
        ]);
    }

    public function tick(Request $request, Room $room, string $code): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $data = $request->validate(['key' => ['required', 'string'], 'done' => ['required', 'boolean']]);
        Workflow::tick($room, $code, $data['key'], $data['done']);

        return back();
    }

    public function complete(Request $request, Room $room, string $code): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        Workflow::complete($room, $code, $this->actor($request));
        $room->refresh();
        $next = Stages::next($code);

        if ($next === null) {
            return back()->with('success', 'Final stage complete. The room is now under archive control.');
        }
        $page = $code === 'C' ? 'setup' : Stages::get($next)['page'];
        $target = $code === 'C'
            ? route('deal-room.billing', [$room, 'stage-gate-unlock'])
            : ($code === '0' ? route('deal-room.rooms.page', [$room, 'created']) : route('deal-room.rooms.page', [$room, $page]));

        return redirect($target)->with('success', 'Stage '.$code.' completed. Stage '.$next.' is now unlocked.');
    }

    /** Record a named approval. Client-side approvals may be recorded by the room owner; TBCA-side ones need an administrator. */
    public function decide(Request $request, Room $room, Approval $approval): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless($approval->room_id === $room->id, 404);
        $data = $request->validate(['decision' => ['required', Rule::in(['approved', 'rejected'])], 'note' => ['nullable', 'string', 'max:255']]);
        $user = $request->user();
        abort_unless($user->isAdmin() || ($room->user_id === $user->id && Access::clientCanDecide($approval->approver_role)), 403, 'This approval must be recorded by TBCA.');

        $approval->update(['status' => $data['decision'], 'decided_by' => $user->name, 'decided_at' => now(), 'note' => $data['note'] ?? null]);
        Audit::log($room, 'approval.'.$data['decision'], "{$approval->approver_role} ({$approval->approver}) {$data['decision']} for {$approval->subject}");

        if (str_starts_with($approval->subject, 'request:') && $req = $room->requests()->find((int) substr($approval->subject, 8))) {
            Requests::advance($req);
        }

        return back()->with('success', "Approval recorded: {$approval->approver_role} {$data['decision']}.");
    }

    public function payStageFee(Request $request, Room $room, string $code): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $charge = Workflow::feeCharge($room, $code);
        abort_unless($charge, 404);

        return Billing::pay($room, [$charge], $request->user(), route('deal-room.rooms.page', [$room, Stages::get($code)['page']], false));
    }

    /** Stage B questionnaire: partial saves allowed; scores recompute on every save. */
    public function saveDiagnostic(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        abort_unless(Workflow::isUnlocked($room, 'B'), 423);

        $rules = [];
        foreach (Pricing::diagnosticSections() as $key => $s) {
            foreach (array_keys($s['questions']) as $q) {
                $rules["answers.$key.$q"] = ['nullable', Rule::in(array_keys(Pricing::DIAGNOSTIC_OPTIONS))];
            }
        }
        $data = $request->validate($rules);
        $answers = array_replace_recursive($room->diagnostic['answers'] ?? [], $data['answers'] ?? []);
        $room->update(['diagnostic' => [...($room->diagnostic ?? []), 'answers' => $answers, 'saved_at' => now()->toIso8601String()]]);
        $p = Pricing::diagnosticProgress($room->fresh());
        Audit::log($room, 'diagnostic.saved', "Diagnostic saved: {$p['answered']}/{$p['total']} answered, readiness {$p['readiness']}%");

        return back()->with('success', "Diagnostic saved — {$p['answered']} of {$p['total']} answered, readiness {$p['readiness']}%.");
    }
}
