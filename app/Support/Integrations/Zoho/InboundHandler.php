<?php

namespace App\Support\Integrations\Zoho;

use App\Models\IntegrationEvent;
use App\Models\IntegrationLink;
use App\Models\Order;
use App\Models\Portal\Ticket;
use App\Support\Platform\Reference;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Applies a verified inbound Zoho event to local records.
 *
 * Sensitive changes are confirmed against the source API first, as section 8
 * of the guide requires: an "invoice paid" event only marks an order paid
 * after Books itself reports the invoice as paid for that order reference.
 */
class InboundHandler
{
    public function handle(IntegrationEvent $event): void
    {
        if ($event->status === 'complete') {
            return;
        }

        $data = $event->payload['data'] ?? [];

        try {
            $handledBy = match ($event->type) {
                'books.invoice_paid' => $this->invoicePaid($data),
                'desk.ticket_updated' => $this->ticketUpdated($data),
                'flow.completed' => $this->flowResult($data, true),
                'flow.failed' => $this->flowResult($data, false),
                'review.decided' => 'human',
                default => $data['handled_by'] ?? 'automated',     // billing, projects, sign: recorded for the dashboard and the measure
            };
        } catch (Throwable $e) {
            $event->forceFill([
                'status' => 'failed',
                'attempts' => $event->attempts + 1,
                'last_error' => mb_substr($e->getMessage(), 0, 1000),
            ])->save();

            if (! $e instanceof ZohoException) {
                report($e);
            }

            return;
        }

        $event->forceFill([
            'status' => 'complete',
            'handled_by' => in_array($handledBy, ['human', 'automated'], true) ? $handledBy : 'automated',
            'attempts' => $event->attempts + 1,
            'last_error' => null,
            'completed_at' => now(),
        ])->save();
    }

    private function invoicePaid(array $data): string
    {
        $invoiceId = (string) ($data['invoice_id'] ?? '');
        $reference = (string) ($data['reference_number'] ?? $data['tbca_order_id'] ?? '');
        if ($invoiceId === '' || $reference === '') {
            throw new ZohoException('books.invoice_paid needs invoice_id and reference_number.', retryable: false);
        }

        $invoice = Zoho::books()->getInvoice($invoiceId);
        if (($invoice['status'] ?? null) !== 'paid' || ($invoice['reference_number'] ?? null) !== $reference) {
            throw new ZohoException("Books does not confirm invoice {$invoiceId} as paid for {$reference}.", retryable: false);
        }

        $order = Order::where('reference', $reference)->first() ?? throw new ZohoException("No TBCA order {$reference}.", retryable: false);

        DB::transaction(function () use ($order, $invoiceId, $invoice) {
            IntegrationLink::remember('order', $order->reference, 'zoho_books', 'invoices', $invoiceId, ['number' => $invoice['invoice_number'] ?? null]);

            if ($order->isPaid()) {
                return;
            }

            $order->payments()->create([
                'reference' => Reference::make('PAY'),
                'method' => 'eft',
                'status' => 'succeeded',
                'amount_zar' => (int) round((float) ($invoice['total'] ?? $order->total_zar)),
                'meta' => ['source' => 'zoho_books', 'invoice_id' => $invoiceId],
            ]);
            $order->update(['status' => 'paid', 'paid_at' => now(), 'meta' => [...($order->meta ?? []), 'paid_via' => 'zoho_books']]);
        });

        return 'automated';
    }

    private function ticketUpdated(array $data): string
    {
        $reference = $data['tbca_reference'] ?? null;
        if (! $reference && isset($data['ticket_id'])) {
            $reference = IntegrationLink::localFor('zoho_desk', 'tickets', (string) $data['ticket_id'], 'support');
        }

        $ticket = $reference ? Ticket::where('reference', $reference)->first() : null;
        if (! $ticket) {
            // Support requests from forms (Submissions) have no portal ticket; the Desk state is kept in the ledger only.
            return $data['handled_by'] ?? 'human';
        }

        $status = match (strtolower((string) ($data['status'] ?? ''))) {
            'closed', 'resolved' => 'resolved',
            'on hold', 'on_hold' => 'on_hold',
            'escalated', 'in progress', 'in_progress' => 'in_progress',
            default => 'open',
        };

        $ticket->update([
            'status' => $status,
            'resolved_at' => $status === 'resolved' ? ($ticket->resolved_at ?? now()) : null,
            'assignee' => $data['assignee'] ?? $ticket->assignee,
        ]);

        return $data['handled_by'] ?? ($status === 'resolved' ? 'human' : 'automated');
    }

    /** Zoho Flow reports the result of an event it received from TBCA. */
    private function flowResult(array $data, bool $ok): string
    {
        $outbound = IntegrationEvent::where('source', 'tbca')->where('event_id', (string) ($data['event_id'] ?? ''))->first()
            ?? throw new ZohoException('Flow result for an unknown event id.', retryable: false);

        $outbound->forceFill($ok
            ? ['status' => 'complete', 'completed_at' => now(), 'last_error' => null]
            : ['status' => 'failed', 'available_at' => null, 'last_error' => mb_substr('Zoho Flow: '.($data['error'] ?? 'failed'), 0, 1000)]
        )->save();

        return 'automated';
    }
}
