<?php

namespace App\Support\Integrations;

use App\Models\DealRoom\Room;
use App\Models\DueDiligence\CaseFile;
use App\Models\Insights\WebinarRegistration;
use App\Models\Order;
use App\Models\Portal\Ticket;
use App\Models\Submission;
use App\Support\Deliverables\DeliveryPlan;
use App\Support\DueDiligence\Identity\IdentityVerifications;
use App\Support\Integrations\Zoho\Payloads;
use Throwable;

/**
 * Model listeners that write integration events. They only record to the
 * ledger; Zoho is called later by `php artisan zoho:sync`, never inline, so a
 * slow or failing Zoho cannot affect checkout, enquiries or case work.
 */
class DomainHooks
{
    /** Submission types that are support requests rather than sales enquiries. */
    public const SUPPORT_SUBMISSIONS = ['complaint', 'human-assistance'];

    public static function register(): void
    {
        // A2: an order becomes paid (checkout, free Sprint, Books payment or admin change).
        Order::saved(function (Order $order) {
            $becamePaid = $order->status === 'paid' && ($order->wasRecentlyCreated || $order->wasChanged('status'));
            if ($becamePaid) {
                $payload = Payloads::order($order);
                // What the backend must produce: deliverables and payment-trigger loop per Sprint line (Registry of Deliverables).
                if ($plan = DeliveryPlan::forOrder($order)) {
                    $payload['delivery_plan'] = $plan;
                }
                Ledger::record('order.payment_verified', 'order', $order->reference, $payload, $order->user_id);
            }
        });

        // A1 / A8: every contact form, enquiry, quote request or complaint.
        Submission::created(function (Submission $s) {
            $type = in_array($s->type, self::SUPPORT_SUBMISSIONS, true) ? 'support.requested' : 'enquiry.received';
            Ledger::record($type, 'submission', $s->reference, Payloads::submission($s), $s->user_id);
        });

        // A8: a Client Portal support ticket.
        Ticket::created(function (Ticket $t) {
            Ledger::record('support.requested', 'ticket', $t->reference, Payloads::ticket($t), $t->user_id);
        });

        // A4: a paid Due Diligence case is opened; identity checks can start when it enters Checks Running.
        CaseFile::created(function (CaseFile $case) {
            if (! $case->is_sample) {
                Ledger::record('dd.case_created', 'dd_case', $case->reference, Payloads::ddCase($case), $case->user_id);
            }
        });

        CaseFile::updated(function (CaseFile $case) {
            if ($case->wasChanged('status') && $case->status === 'checks_running' && config('services.identity_verification.auto_start')) {
                try {
                    app(IdentityVerifications::class)->startForCase($case);
                } catch (Throwable $e) {
                    report($e);
                }
            }
        });

        // A5: a Virtual Deal Room enquiry (stage A) opens a room.
        Room::created(function (Room $room) {
            if (! empty($room->enquiry)) {
                Ledger::record('vdr.enquiry_submitted', 'vdr_room', $room->reference, Payloads::room($room), $room->user_id);
            }
        });

        // A1: webinar registration.
        WebinarRegistration::created(function (WebinarRegistration $r) {
            Ledger::record('webinar.registered', 'webinar_registration', $r->reference, Payloads::webinarRegistration($r), $r->user_id);
        });
    }
}
