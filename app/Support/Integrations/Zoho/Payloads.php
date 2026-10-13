<?php

namespace App\Support\Integrations\Zoho;

use App\Models\DealRoom\Room;
use App\Models\DueDiligence\CaseFile;
use App\Models\Insights\WebinarRegistration;
use App\Models\Order;
use App\Models\Portal\Ticket;
use App\Models\Submission;
use App\Models\User;

/**
 * Snapshot of what each event needs, taken when the event is recorded. The
 * dispatcher sends the snapshot, so a later edit to the record cannot change
 * what an earlier event meant.
 */
class Payloads
{
    /** Stable business reference shared by every Zoho record (tbca_business_id in the guide). */
    public static function businessId(?User $user): ?string
    {
        if (! $user) {
            return null;
        }

        return $user->client_id ?: 'TBCA-B-'.str_pad((string) $user->id, 6, '0', STR_PAD_LEFT);
    }

    /** Stable person reference, independent of email (tbca_person_id in the guide). */
    public static function personId(?User $user): ?string
    {
        return $user ? 'TBCA-P-'.str_pad((string) $user->id, 6, '0', STR_PAD_LEFT) : null;
    }

    public static function party(?User $user, ?string $name = null, ?string $email = null, ?string $company = null, ?string $phone = null): array
    {
        return [
            'business_id' => self::businessId($user),
            'person_id' => self::personId($user),
            'name' => $user?->name ?? $name,
            'email' => $user?->email ?? $email,
            'company' => $user?->company ?? $company,
            'phone' => $user?->phone ?? $phone,
            'country' => $user?->country,
        ];
    }

    public static function order(Order $order): array
    {
        $billing = $order->billing ?? [];

        return [
            'order_id' => $order->reference,
            'section' => $order->section,
            'currency' => $order->currency ?: 'ZAR',
            'subtotal_zar' => (int) $order->subtotal_zar,
            'vat_zar' => (int) $order->vat_zar,
            'fees_zar' => (int) $order->fees_zar,
            'total_zar' => (int) $order->total_zar,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'paid_via' => $order->meta['paid_via'] ?? 'tbca_checkout',
            'payment_reference' => $order->payments()->where('status', 'succeeded')->latest('id')->value('reference'),
            'payment_method' => $order->payments()->where('status', 'succeeded')->latest('id')->value('method'),
            'items' => $order->items()->get(['item_type', 'item_code', 'name', 'variant', 'quantity', 'unit_zar', 'line_zar'])->toArray(),
            'party' => self::party($order->user, $billing['name'] ?? null, $billing['email'] ?? null, $billing['company'] ?? null, $billing['phone'] ?? null),
        ];
    }

    public static function submission(Submission $s): array
    {
        return [
            'reference' => $s->reference,
            'type' => $s->type,
            'section' => $s->section,
            'subject' => $s->subject,
            'party' => self::party($s->user, $s->name, $s->email),
        ];
    }

    public static function ticket(Ticket $t): array
    {
        return [
            'reference' => $t->reference,
            'subject' => $t->subject,
            'category' => $t->category,
            'priority' => $t->priority,
            'area' => $t->area,
            'source' => $t->source,
            'party' => self::party($t->user),
        ];
    }

    public static function ddCase(CaseFile $case): array
    {
        return [
            'case_id' => $case->reference,
            'family' => $case->family,
            'sku' => $case->sku_code,
            'package' => $case->package_name,
            'subject_type' => $case->subject_type,
            'jurisdiction' => $case->jurisdiction,
            'purpose' => $case->purpose,
            'status' => $case->status,
            'order_id' => $case->order?->reference,
            'party' => self::party($case->user, $case->client_name),
        ];
    }

    public static function room(Room $room): array
    {
        return [
            'room_id' => $room->reference,
            'company' => $room->company,
            'country' => $room->country,
            'sector' => $room->sector,
            'deal_type' => $room->deal_type,
            'transaction_type' => $room->transaction_type,
            'amount_zar' => (int) $room->amount_zar,
            'fit_score' => $room->enquiry['score'] ?? null,
            'party' => self::party($room->owner),
        ];
    }

    public static function webinarRegistration(WebinarRegistration $r): array
    {
        return [
            'reference' => $r->reference,
            'webinar' => $r->webinar?->title,
            'opt_offers' => (bool) $r->opt_offers,
            'party' => self::party(null, $r->name, $r->email, $r->company, $r->phone) + ['job_title' => $r->job_title, 'country' => $r->country],
        ];
    }
}
