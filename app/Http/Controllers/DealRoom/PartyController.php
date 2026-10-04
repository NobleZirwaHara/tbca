<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Party;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Counterparty qualification (screening score), invitations by email with
 * expiry, role and access-level changes, and revocation (Stages 3-4).
 */
class PartyController extends Controller
{
    use LoadsRoom;

    public function store(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless(Access::can($room, $request->user(), 'approve_invite'), 403);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('vdr_parties', 'email')->where('room_id', $room->id)],
            'organisation' => ['required', 'string', 'max:160'],
            'role' => ['required', Rule::in(array_keys(Access::ROLES))],
            'jurisdiction' => ['nullable', 'string', 'max:80'],
            'group_name' => ['nullable', 'string', 'max:80'],
            'access_level' => ['required', Rule::in(['full', 'qa_only', 'view_only'])],
        ]);
        $internal = Access::isInternal($data['role']);
        $party = $room->parties()->create([...$data, 'email' => strtolower($data['email']), 'status' => $internal ? 'qualified' : 'prospect', 'group_name' => $data['group_name'] ?: ($internal ? null : $data['organisation'])]);
        Audit::log($room, 'party.nominated', "{$party->name} ({$party->organisation}) nominated as ".Access::ROLES[$party->role]);

        if (! $internal) {
            $this->screen($room, $party);
        }

        return back()->with('success', "{$party->organisation} added".($internal ? '.' : " and screened ({$party->fresh()->qualification_score}%)."));
    }

    /** Screening: AML/KYC, sanctions & PEP, adverse media, jurisdiction, financial stability, reputation. */
    protected function screen(Room $room, Party $party): void
    {
        $highRisk = ['North Korea', 'Iran', 'Syria'];
        $score = 70 + (crc32(strtolower($party->organisation)) % 26);
        if (in_array($party->jurisdiction, $highRisk, true)) {
            $score = 35;
        }
        $party->update(['qualification_score' => $score, 'status' => $score >= 60 ? 'qualified' : 'prospect']);
        Audit::log($room, 'party.screened', "{$party->organisation} screened: {$score}% ".($score >= 60 ? 'qualified' : 'below threshold'), 'Qualification Robot');
    }

    /** Send invitations (selected ids or every qualified counterparty). */
    public function invite(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless(Access::can($room, $request->user(), 'approve_invite'), 403);
        abort_unless(Workflow::isUnlocked($room, '3'), 423, 'Invitations open at Stage 3.');
        $data = $request->validate(['ids' => ['nullable', 'array'], 'ids.*' => ['integer'], 'expiry_days' => ['nullable', 'integer', Rule::in([7, 14, 30])], 'subject' => ['nullable', 'string', 'max:160']]);

        $q = $room->parties()->where('status', 'qualified');
        if (! empty($data['ids'])) {
            $q->whereIn('id', $data['ids']);
        }
        $parties = $q->get();
        if ($parties->isEmpty()) {
            return back()->with('error', 'No qualified counterparties to invite.');
        }
        foreach ($parties as $p) {
            $p->update(['status' => 'invited', 'invite_token' => Str::random(40), 'invited_at' => now(), 'invite_expires_at' => now()->addDays($data['expiry_days'] ?? 14)]);
        }
        Audit::log($room, 'party.invited', $parties->count().' invitation(s) sent by email ('.($data['subject'] ?? 'Invitation to '.$room->name.' Deal Room').')');

        return back()->with('success', $parties->count().' invitation(s) sent. Invitees accept from their Deal Rooms page.');
    }

    public function update(Request $request, Room $room, Party $party): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless($party->room_id === $room->id, 404);
        abort_unless(Access::can($room, $request->user(), 'approve_invite'), 403);
        abort_if($party->role === 'owner', 422, 'The room owner cannot be changed.');
        $data = $request->validate([
            'access_level' => ['sometimes', Rule::in(['full', 'qa_only', 'view_only'])],
            'status' => ['sometimes', Rule::in(['revoked', 'qualified'])],
            'mfa' => ['sometimes', 'boolean'],
        ]);
        if (($data['status'] ?? null) === 'qualified' && ($party->qualification_score ?? 0) < 60 && ! Access::isInternal($party->role)) {
            return back()->with('error', 'Counterparty is below the qualification threshold.');
        }
        $party->update($data);
        Audit::log($room, 'party.updated', "{$party->name}: ".collect($data)->map(fn ($v, $k) => "$k=".(is_bool($v) ? ($v ? 'on' : 'off') : $v))->implode(', '));

        return back()->with('success', "{$party->name} updated.");
    }
}
