<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Models\DueDiligence\ConsentRequest;
use App\Support\DueDiligence\CaseStateMachine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Secure consent link opened by a data subject or authorised signatory.
 * Shows only the purpose, requester and notice — never case results.
 */
class ConsentLinkController extends Controller
{
    public function show(string $token): Response
    {
        $req = ConsentRequest::where('token', $token)->firstOrFail();
        $case = $req->caseFile;

        return Inertia::render('DueDiligence/ConsentLink', [
            'token' => $token,
            'request' => [
                'recipient' => $req->recipient_name,
                'role' => $req->recipient_role,
                'status' => $req->expires_at && $req->expires_at->isPast() && ! in_array($req->status, ['completed', 'declined'], true) ? 'expired' : $req->status,
                'consent' => $req->consent?->label,
                'expiresAt' => $req->expires_at?->toIso8601String(),
            ],
            'purpose' => [
                'requester' => $case->client_name,
                'subject' => $case->subject_name,
                'purpose' => $case->purpose,
                'jurisdiction' => $case->jurisdiction,
                'reference' => $case->reference,
            ],
        ]);
    }

    public function respond(Request $request, string $token): RedirectResponse
    {
        $req = ConsentRequest::where('token', $token)->whereIn('status', ['pending', 'delivered'])->firstOrFail();
        abort_if($req->expires_at && $req->expires_at->isPast(), 410, 'This consent link has expired. Ask the requester to resend it.');

        $data = $request->validate([
            'decision' => ['required', 'in:grant,decline'],
            'full_name' => ['required', 'string', 'max:120'],
            'confirm' => ['required_if:decision,grant', 'nullable', 'accepted'],
        ]);
        $case = $req->caseFile;

        if ($data['decision'] === 'grant') {
            $req->update(['status' => 'completed', 'completed_at' => now()]);
            $req->consent?->update([
                'status' => 'received', 'given_by' => $data['full_name'].' ('.$req->recipient_role.')', 'method' => 'Secure consent link',
                'received_at' => now(), 'valid_until' => now()->addYear(),
            ]);
            CaseStateMachine::record($case, 'dd.consent_received', $data['full_name'], 'subject', ($req->consent?->label ?? 'Consent').' granted via secure link');
        } else {
            $req->update(['status' => 'declined', 'completed_at' => now()]);
            CaseStateMachine::record($case, 'dd.consent_declined', $data['full_name'], 'subject', ($req->consent?->label ?? 'Consent').' declined via secure link');
        }

        return back()->with('success', $data['decision'] === 'grant' ? 'Thank you. Your consent has been recorded.' : 'Your decision has been recorded. No processing will take place on the basis of this request.');
    }
}
