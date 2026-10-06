<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Deliverable;
use App\Models\Marketplace\Dispute;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\PartnerRequest;
use App\Models\Marketplace\Provider;

/** Serialises marketplace models into the shapes declared in resources/js/types/marketplace.ts. */
class Presenter
{
    public static function provider(?Provider $p): ?array
    {
        if (! $p) {
            return null;
        }
        $profile = $p->profile ?? [];

        return [
            'id' => $p->id,
            'code' => $p->code,
            'slug' => $p->slug,
            'kind' => $p->kind,
            'name' => $p->name,
            'category' => $p->category,
            'categoryLabel' => Options::CATEGORIES[$p->category] ?? $p->category,
            'profession' => $p->profession,
            'city' => $p->city,
            'country' => $p->country,
            'status' => $p->status,
            'statusLabel' => Workflow::PROVIDER_STATUSES[$p->status] ?? $p->status,
            'tier' => $p->tier,
            'rating' => $p->rating,
            'reviewsCount' => $p->reviews_count,
            'engagementsCount' => $p->engagements_count,
            'score' => $p->score,
            'applicationRef' => $p->application_ref,
            'lastVerified' => $p->last_verified_at?->format('d M Y'),
            'nextReview' => $p->next_review_at?->format('d M Y'),
            'nextReviewDays' => $p->next_review_at ? (int) now()->startOfDay()->diffInDays($p->next_review_at, false) : null,
            'agreementSigned' => $p->agreement_signed_at?->format('d M Y'),
            'routable' => $p->isRoutable(),
            'profile' => $profile,
        ];
    }

    public static function listing(Listing $l): array
    {
        return [
            'id' => $l->id,
            'slug' => $l->slug,
            'kind' => $l->kind,
            'title' => $l->title,
            'category' => $l->category,
            'categoryLabel' => Options::CATEGORIES[$l->category] ?? (Content::PS_CATEGORIES[$l->category] ?? $l->category),
            'subcategory' => $l->subcategory,
            'summary' => $l->summary,
            'priceZar' => $l->price_zar,
            'period' => $l->period,
            'rating' => $l->rating,
            'reviewsCount' => $l->reviews_count,
            'badge' => $l->badge,
            'status' => $l->status,
            'details' => $l->details ?? [],
            'packages' => Packages::for($l),
            'provider' => $l->relationLoaded('provider') && $l->provider ? ['name' => $l->provider->name, 'slug' => $l->provider->slug, 'status' => $l->provider->status] : null,
        ];
    }

    public static function brief(Brief $b): array
    {
        $data = $b->data ?? [];

        return [
            'id' => $b->id,
            'reference' => $b->reference,
            'title' => $b->title ?? ($data['title'] ?? 'Untitled brief'),
            'category' => $b->category,
            'categoryLabel' => Options::CATEGORIES[$b->category] ?? $b->category,
            'clientName' => $b->client_name,
            'status' => $b->status,
            'statusLabel' => Workflow::BRIEF_STATUSES[$b->status] ?? $b->status,
            'step' => $b->step,
            'priorityScore' => $b->priority_score,
            'openToProviders' => $b->open_to_providers,
            'data' => $data,
            'scope' => $b->scope ?? [],
            'disclosure' => $b->disclosure ?? [],
            'budgetLabel' => Options::BUDGETS[$data['budget'] ?? ''] ?? ($data['budget_label'] ?? null),
            'countryLabel' => $data['country'] ?? null,
            'provider' => self::provider($b->relationLoaded('provider') ? $b->provider : null),
            'createdAt' => $b->created_at?->format('d M Y, H:i'),
            'journeyStep' => Workflow::briefJourneyStep($b->status),
        ];
    }

    public static function engagement(Engagement $e): array
    {
        return [
            'id' => $e->id,
            'reference' => $e->reference,
            'assignmentRef' => $e->assignment_ref,
            'title' => $e->title,
            'service' => $e->service,
            'category' => $e->category,
            'categoryLabel' => Options::CATEGORIES[$e->category] ?? $e->category,
            'clientName' => $e->client_name,
            'stage' => $e->stage,
            'stageLabel' => Workflow::ENGAGEMENT_LABELS[$e->stage] ?? $e->stage,
            'priority' => $e->priority,
            'progress' => $e->progress,
            'valueZar' => $e->value_zar,
            'providerRateZar' => $e->provider_rate_zar,
            'paymentState' => $e->payment_state,
            'qaStandard' => $e->qa_standard,
            'targetDate' => $e->target_date?->format('d M Y'),
            'meta' => $e->meta ?? [],
            'briefRef' => $e->relationLoaded('brief') ? $e->brief?->reference : null,
            'provider' => self::provider($e->relationLoaded('provider') ? $e->provider : null),
            'listingSlug' => $e->relationLoaded('listing') ? $e->listing?->slug : null,
            'trackerStep' => Workflow::trackerStep($e),
            'deliverableStep' => Workflow::deliverableStep($e),
            'providerStep' => Workflow::providerStep($e),
        ];
    }

    public static function deliverable(Deliverable $d): array
    {
        return [
            'id' => $d->id,
            'reference' => $d->reference,
            'fileName' => $d->file_name,
            'version' => $d->version,
            'status' => $d->status,
            'reviewer' => $d->reviewer,
            'qa' => $d->qa ?? [],
            'meta' => $d->meta ?? [],
            'submittedAt' => $d->submitted_at?->format('d M Y, H:i'),
            'decidedAt' => $d->decided_at?->format('d M Y, H:i'),
        ];
    }

    public static function dispute(Dispute $d): array
    {
        return [
            'id' => $d->id,
            'reference' => $d->reference,
            'kind' => $d->kind,
            'type' => $d->type,
            'category' => $d->category,
            'priority' => $d->priority,
            'subject' => $d->subject,
            'description' => $d->description,
            'amountZar' => $d->amount_zar,
            'status' => $d->status,
            'step' => Workflow::disputeStep($d->status),
            'responseDue' => $d->response_due_at?->format('d M Y, H:i'),
            'responseDaysLeft' => $d->response_due_at ? max(0, (int) now()->startOfDay()->diffInDays($d->response_due_at->copy()->startOfDay(), false)) : null,
            'raisedOn' => $d->created_at?->format('d M Y, H:i'),
            'updatedOn' => $d->updated_at?->format('d M Y, H:i'),
            'meta' => $d->meta ?? [],
            'engagementRef' => $d->relationLoaded('engagement') ? $d->engagement?->reference : null,
            'engagementTitle' => $d->relationLoaded('engagement') ? $d->engagement?->title : null,
            'providerName' => $d->relationLoaded('provider') ? $d->provider?->name : null,
        ];
    }

    public static function partnerRequest(PartnerRequest $r): array
    {
        return [
            'id' => $r->id,
            'reference' => $r->reference,
            'title' => $r->title,
            'clientName' => $r->client_name,
            'stage' => $r->stage,
            'stageLabel' => Workflow::PS_STAGE_LABELS[$r->stage] ?? $r->stage,
            'step' => Workflow::psStep($r),
            'conflictState' => $r->conflict_state,
            'arrangement' => $r->arrangement,
            'feeMechanism' => $r->fee_mechanism,
            'permissionRef' => $r->permission_ref,
            'intake' => $r->intake ?? [],
            'resolution' => $r->resolution ?? [],
            'quote' => $r->quote ?? [],
            'meta' => $r->meta ?? [],
            'requestedOn' => $r->created_at?->format('d M Y'),
            'partner' => self::provider($r->relationLoaded('partner') ? $r->partner : null),
            'listing' => $r->relationLoaded('listing') && $r->listing ? ['title' => $r->listing->title, 'slug' => $r->listing->slug] : null,
            'orderRef' => $r->relationLoaded('order') ? $r->order?->reference : null,
            'orderStatus' => $r->relationLoaded('order') ? $r->order?->status : null,
            'page' => Workflow::PS_STAGE_PAGE[$r->stage] ?? 'resolution',
        ];
    }
}
