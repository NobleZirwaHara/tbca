<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Deliverable;
use App\Models\Marketplace\Dispute;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Review;
use App\Support\Marketplace\BriefService;
use App\Support\Marketplace\EngagementService;
use App\Support\Marketplace\Presenter;
use App\Support\Marketplace\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Buyer-side engagement tracking: assignment, progress, deliverable QA & acceptance, disputes, rating. */
class EngagementController extends Controller
{
    private function own(Request $request, Engagement $e): void
    {
        abort_unless($e->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
    }

    /** My Marketplace: briefs, engagements and disputes. Also activates paid catalogue orders. */
    public function index(Request $request): Response
    {
        $user = $request->user();

        Engagement::with('order')->where('user_id', $user->id)->where('stage', 'awaiting_payment')->get()
            ->each(function (Engagement $e) {
                if ($e->order?->isPaid()) {
                    $e->stage = 'assigned';
                    $e->progress = 10;
                    EngagementService::addEvent($e, 'Payment Received', "Order {$e->order->reference} paid", 'TBCA Marketplace');
                    EngagementService::addEvent($e, 'Provider Assigned', 'Listing provider assigned to engagement', 'TBCA Marketplace');
                    $e->save();
                }
            });

        Brief::with('order', 'provider', 'engagement')->where('user_id', $user->id)->where('status', 'awaiting_payment')->get()
            ->each(fn (Brief $b) => BriefService::syncPayment($b));

        return Inertia::render('Marketplace/MyMarketplace', [
            'briefs' => Brief::with('provider')->where('user_id', $user->id)->latest()->get()->map(fn ($b) => Presenter::brief($b)),
            'engagements' => Engagement::with('provider', 'brief', 'listing', 'deliverables')->where('user_id', $user->id)->latest()->get()
                ->map(fn ($e) => [...Presenter::engagement($e), 'latestDeliverable' => $e->deliverables->sortByDesc('id')->first()?->reference]),
            'disputes' => Dispute::with('engagement')->where('user_id', $user->id)->where('kind', 'dispute')->latest()->get()->map(fn ($d) => Presenter::dispute($d)),
        ]);
    }

    public function assignment(Request $request, Engagement $engagement): Response
    {
        $this->own($request, $engagement);
        $engagement->load('provider', 'brief', 'order');

        return Inertia::render('Marketplace/EngagementAssignment', [
            'engagement' => Presenter::engagement($engagement),
            'scope' => $engagement->brief?->scope ?? [],
        ]);
    }

    public function progress(Request $request, Engagement $engagement): Response
    {
        $this->own($request, $engagement);
        $engagement->load('provider', 'brief', 'deliverables');
        $latest = $engagement->deliverables->sortByDesc('id')->first();

        return Inertia::render('Marketplace/EngagementProgress', [
            'engagement' => Presenter::engagement($engagement),
            'stages' => Workflow::ENGAGEMENT_STAGES,
            'deliverable' => $latest ? Presenter::deliverable($latest) : null,
            'budget' => $engagement->brief ? ($engagement->brief->data['budget'] ?? null) : null,
            'openDispute' => $engagement->disputes()->whereNotIn('status', ['closed', 'withdrawn'])->first()?->reference,
        ]);
    }

    public function deliverable(Request $request, Engagement $engagement, Deliverable $deliverable): Response
    {
        $this->own($request, $engagement);
        abort_unless($deliverable->engagement_id === $engagement->id, 404);
        abort_if(in_array($deliverable->status, ['submitted', 'in_review', 'returned_r1', 'returned_r2', 'rejected'], true) && ! $request->user()->isAdmin(), 403, 'Provider drafts are not client-releasable until QA passes.');
        $engagement->load('provider', 'brief');

        return Inertia::render('Marketplace/Deliverable', [
            'engagement' => Presenter::engagement($engagement),
            'deliverable' => Presenter::deliverable($deliverable),
            'stages' => Workflow::DELIVERABLE_STAGES,
            'reviewed' => Review::where('provider_id', $engagement->provider_id)->where('user_id', $request->user()->id)->where('listing_id', $engagement->listing_id)->exists(),
        ]);
    }

    public function decide(Request $request, Engagement $engagement, Deliverable $deliverable): RedirectResponse
    {
        $this->own($request, $engagement);
        abort_unless($deliverable->engagement_id === $engagement->id, 404);
        $data = $request->validate([
            'decision' => 'required|in:accept,corrections,clarification',
            'comment' => 'required_unless:decision,accept|nullable|string|max:1000',
        ]);

        EngagementService::decide($deliverable, $data['decision'], $data['comment'] ?? '', $request->user());

        return back()->with('success', match ($data['decision']) {
            'accept' => 'Deliverable accepted. The engagement is closed and the provider payout has been released for processing.',
            'corrections' => 'Corrections requested. The provider has been notified and a correction cycle opened.',
            default => 'Clarification request sent to TBCA and the provider.',
        });
    }

    public function raiseDispute(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        abort_if($engagement->disputes()->where('kind', 'dispute')->whereNotIn('status', ['closed', 'withdrawn', 'won', 'lost'])->exists(), 422, 'A dispute is already open for this engagement.');

        $data = $request->validate([
            'type' => 'required|in:Quality / Deliverable,Timeliness / Delay,Scope Change,Billing / Fees,Conduct',
            'subject' => 'required|string|max:150',
            'description' => 'required|string|min:20|max:2000',
            'resolution_sought' => 'required|string|max:1000',
            'amount_zar' => 'nullable|integer|min:0|max:'.max(1, $engagement->value_zar),
            'priority' => 'required|in:low,medium,high',
        ]);
        $data['linked_deliverable'] = $engagement->deliverables()->latest('id')->value('file_name');

        $dispute = EngagementService::raiseDispute($engagement, $data, $request->user());

        return redirect()->route('marketplace.engagements.dispute', [$engagement, $dispute])->with('success', "Dispute {$dispute->reference} raised. TBCA will acknowledge within 1 business day.");
    }

    public function dispute(Request $request, Engagement $engagement, Dispute $dispute): Response
    {
        $this->own($request, $engagement);
        abort_unless($dispute->engagement_id === $engagement->id, 404);
        $engagement->load('provider');
        $dispute->load('engagement', 'provider');

        return Inertia::render('Marketplace/Dispute', [
            'engagement' => Presenter::engagement($engagement),
            'dispute' => Presenter::dispute($dispute),
            'stages' => Workflow::DISPUTE_STAGES,
        ]);
    }

    public function message(Request $request, Engagement $engagement, Dispute $dispute): RedirectResponse
    {
        $this->own($request, $engagement);
        abort_unless($dispute->engagement_id === $engagement->id, 404);
        abort_if(in_array($dispute->status, ['closed', 'withdrawn'], true), 422, 'This dispute is closed.');
        $data = $request->validate(['body' => 'required|string|min:2|max:1500', 'document' => 'nullable|string|max:200']);

        $meta = $dispute->meta ?? [];
        $meta['messages'][] = ['from' => 'You (Client)', 'role' => 'Client', 'at' => now()->format('d M Y, H:i'), 'body' => $data['body']];
        if (! empty($data['document'])) {
            $meta['documents'][] = ['name' => $data['document'], 'by' => 'You', 'at' => now()->format('d M Y'), 'size' => '—'];
        }
        $dispute->update(['meta' => $meta]);

        return back()->with('success', 'Message added to the dispute record.');
    }

    public function withdraw(Request $request, Engagement $engagement, Dispute $dispute): RedirectResponse
    {
        $this->own($request, $engagement);
        abort_unless($dispute->engagement_id === $engagement->id, 404);
        abort_if(in_array($dispute->status, ['closed', 'withdrawn', 'won', 'lost'], true), 422, 'This dispute can no longer be withdrawn.');

        $meta = $dispute->meta ?? [];
        $meta['timeline'][] = ['at' => now()->format('d M Y, H:i'), 'title' => 'Dispute Withdrawn', 'body' => 'Withdrawn by the client.'];
        $dispute->update(['status' => 'withdrawn', 'meta' => $meta]);
        EngagementService::releaseDispute($dispute);

        return redirect()->route('marketplace.engagements.progress', $engagement)->with('success', "Dispute {$dispute->reference} withdrawn.");
    }

    /** Rate the provider after acceptance (feeds provider rating and tier). */
    public function rate(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        abort_unless(in_array($engagement->stage, ['accepted', 'closed'], true), 422, 'You can rate the provider once the deliverable is accepted.');
        abort_if(Review::where('provider_id', $engagement->provider_id)->where('user_id', $request->user()->id)->where('listing_id', $engagement->listing_id)->exists(), 422, 'You have already rated this engagement.');
        $data = $request->validate(['rating' => 'required|integer|min:1|max:5', 'body' => 'required|string|min:10|max:1000']);

        Review::create([
            'listing_id' => $engagement->listing_id,
            'provider_id' => $engagement->provider_id,
            'user_id' => $request->user()->id,
            'author' => $request->user()->name,
            'company' => $request->user()->company,
            'rating' => $data['rating'],
            'body' => $data['body'],
        ]);

        $provider = $engagement->provider;
        if ($provider) {
            $count = $provider->reviews_count + 1;
            $provider->update([
                'rating' => round((($provider->rating ?? $data['rating']) * $provider->reviews_count + $data['rating']) / $count, 1),
                'reviews_count' => $count,
            ]);
        }
        if ($engagement->listing) {
            $l = $engagement->listing;
            $n = $l->reviews_count + 1;
            $l->update(['rating' => round((($l->rating ?? $data['rating']) * $l->reviews_count + $data['rating']) / $n, 1), 'reviews_count' => $n]);
        }

        return back()->with('success', 'Thank you – your rating has been recorded.');
    }
}
