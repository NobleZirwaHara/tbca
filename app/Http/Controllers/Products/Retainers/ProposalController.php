<?php

namespace App\Http\Controllers\Products\Retainers;

use App\Http\Controllers\Controller;
use App\Models\Products\Retainers\Proposal;
use App\Support\Products\Retainers\Engine;
use App\Support\Products\Retainers\Presenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Proposal review & acceptance (GATE-RE-06) and agreement execution (GATE-RE-07). */
class ProposalController extends Controller
{
    protected function authorise(Request $request, Proposal $proposal): void
    {
        $user = $request->user();
        abort_unless($proposal->user_id === $user->id || $user->role === 'admin', 403);
    }

    public function review(Request $request, Proposal $proposal): Response
    {
        $this->authorise($request, $proposal);
        Engine::expireIfLapsed($proposal);

        return Inertia::render('Products/Retainers/ProposalReview', [
            'proposal' => Presenter::proposal($proposal->fresh()),
            'retainer' => $proposal->retainer?->code,
        ]);
    }

    public function accept(Request $request, Proposal $proposal): RedirectResponse
    {
        $this->authorise($request, $proposal);
        Engine::accept($proposal);

        return redirect("/retainers/agreement/{$proposal->reference}")->with('success', 'Proposal accepted. Review and sign your Retainer Agreement.');
    }

    public function decline(Request $request, Proposal $proposal): RedirectResponse
    {
        $this->authorise($request, $proposal);
        Engine::decline($proposal);

        return back()->with('success', 'Proposal declined. No commitment was created.');
    }

    public function agreement(Request $request, Proposal $proposal): Response|RedirectResponse
    {
        $this->authorise($request, $proposal);
        if ($proposal->status === 'signed' && $proposal->retainer) {
            return redirect("/retainers/account/{$proposal->retainer->code}");
        }
        if ($proposal->status !== 'accepted') {
            return redirect("/retainers/proposal/{$proposal->reference}")->with('error', 'Accept the proposal before signing the agreement.');
        }

        return Inertia::render('Products/Retainers/Agreement', [
            'proposal' => Presenter::proposal($proposal),
            'signer' => ['name' => $request->user()->name, 'email' => $request->user()->email],
        ]);
    }

    public function sign(Request $request, Proposal $proposal): RedirectResponse
    {
        $this->authorise($request, $proposal);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'position' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email'],
            'signature' => ['required', 'string', 'min:3', 'max:120'],
            'agree' => ['accepted'],
            'authority' => ['accepted'],
        ], ['agree.accepted' => 'You must agree to the Retainer Agreement, SLA and Schedules.', 'authority.accepted' => 'Confirm that you have authority to sign.']);

        $retainer = Engine::sign($proposal, $request->user(), [
            'name' => $data['name'], 'position' => $data['position'], 'email' => $data['email'],
            'signature' => $data['signature'], 'ip' => $request->ip(), 'signed_at' => now()->toDateTimeString(),
        ]);

        return redirect()->route('checkout.show', $retainer->order);
    }
}
