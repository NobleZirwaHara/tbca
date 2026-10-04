<?php

namespace App\Support\Products\Digital;

use App\Models\Products\Digital\DpEvent;
use Illuminate\Database\Eloquent\Model;

/** Append-only canonical events (Blueprint 16.3), e.g. DP_ENTITLEMENT_CREATED. */
class Audit
{
    public static function log(string $event, Model|string $subject, array $data = [], ?string $label = null): DpEvent
    {
        return DpEvent::create([
            'event' => $event,
            'subject_type' => is_string($subject) ? $subject : class_basename($subject),
            'subject_id' => is_string($subject) ? null : $subject->getKey(),
            'subject_label' => $label ?? (is_string($subject) ? null : ($subject->reference ?? $subject->name ?? $subject->product_name ?? null)),
            'actor_id' => auth()->id(),
            'data' => $data ?: null,
        ]);
    }

    /** Readable label for the activity feeds. */
    public static function describe(string $event): string
    {
        return [
            'DP_ENTITLEMENT_CREATED' => 'Entitlement created',
            'DP_PAYMENT_VERIFIED' => 'Payment verified',
            'DP_CHECKOUT_FROZEN' => 'Checkout manifest frozen',
            'DP_DOWNLOAD_SUCCEEDED' => 'Download recorded',
            'DP_DOWNLOAD_BLOCKED' => 'Download blocked',
            'DP_VERSION_RELEASED' => 'New version published',
            'DP_VERSION_WITHDRAWN' => 'Version withdrawn (unsafe)',
            'DP_VERSION_SUPERSEDED' => 'Version superseded',
            'DP_DEFENSIBILITY_PASSED' => 'Defensibility review passed (D1–D5)',
            'DP_DEFENSIBILITY_FAILED' => 'Defensibility referred / blocked',
            'DP_QA_PASSED' => 'Creation QA passed',
            'DP_QA_SUBMITTED' => 'Submitted for release review',
            'DP_IP_CLEARED' => 'IP clearance passed (GATE-DP-03)',
            'DP_IP_UPDATED' => 'IP / clearance status updated',
            'DP_CLAIM_UPDATED' => 'Claim verification decision',
            'DP_CORRECTION_OPENED' => 'Correction incident opened',
            'DP_CORRECTION_ADVANCED' => 'Correction advanced',
            'DP_LICENCE_CHANGED' => 'Licence upgraded',
            'DP_SUBSCRIPTION_ACTIVATED' => 'Maintained Access activated',
            'DP_REFUND_REQUESTED' => 'Refund / issue case opened',
            'DP_REFUND_APPROVED' => 'Refund request approved',
            'DP_REFUND_DECLINED' => 'Refund request declined',
            'DP_PRICE_UPDATED' => 'Price floor remediation step',
            'DP_PRODUCT_RECLASSIFIED_OR_ARCHIVED' => 'Disposition / reclassification change',
            'DP_RECLASS_ADVANCED' => 'Delivery reclassification step',
            'DP_CONVERSION_STARTED' => 'Sprint / advisory conversion started',
        ][$event] ?? str_replace('_', ' ', ucfirst(strtolower(substr($event, 3))));
    }
}
