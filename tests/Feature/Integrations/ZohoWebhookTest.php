<?php

namespace Tests\Feature\Integrations;

use App\Models\IntegrationEvent;
use App\Models\IntegrationLink;
use App\Models\Order;
use App\Models\Portal\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class ZohoWebhookTest extends TestCase
{
    use RefreshDatabase;
    use ZohoTestHelpers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->enableZoho();
    }

    private function postUnsigned(array $body, array $headers): TestResponse
    {
        return $this->call('POST', '/integrations/zoho/webhook', [], [], [], $this->transformHeadersToServerVars($headers), json_encode($body));
    }

    private function send(array $body, ?int $ts = null, ?string $secret = null): TestResponse
    {
        [$raw, $headers] = $this->signedZoho($body, $ts, $secret);

        return $this->call('POST', '/integrations/zoho/webhook', [], [], [], $this->transformHeadersToServerVars($headers), $raw);
    }

    public function test_a_signed_desk_update_resolves_the_portal_ticket_once(): void
    {
        $user = User::factory()->create();
        $ticket = Ticket::create(['user_id' => $user->id, 'reference' => 'TKT-2026-0901', 'subject' => 'Access', 'status' => 'open']);
        IntegrationLink::remember('support', 'TKT-2026-0901', 'zoho_desk', 'tickets', 'desk-55');

        $body = ['event_id' => 'zf-evt-001', 'event_type' => 'desk.ticket_updated', 'data' => ['ticket_id' => 'desk-55', 'status' => 'Closed', 'assignee' => 'Support Lead']];

        $this->send($body)->assertStatus(202)->assertJson(['received' => true, 'duplicate' => false]);
        $ticket->refresh();
        $this->assertSame('resolved', $ticket->status);
        $this->assertNotNull($ticket->resolved_at);
        $this->assertSame('Support Lead', $ticket->assignee);

        $inbound = IntegrationEvent::where('source', 'zoho')->sole();
        $this->assertSame('complete', $inbound->status);
        $this->assertSame('human', $inbound->handled_by);
        $this->assertSame('A8', $inbound->process);

        // Replaying the same delivery is accepted but does nothing.
        $ticket->update(['status' => 'open']);
        $this->send($body)->assertOk()->assertJson(['duplicate' => true]);
        $this->assertSame('open', $ticket->fresh()->status);
        $this->assertSame(1, IntegrationEvent::where('source', 'zoho')->count());
    }

    public function test_bad_signatures_stale_timestamps_and_unknown_types_are_rejected(): void
    {
        $body = ['event_id' => 'zf-evt-002', 'event_type' => 'desk.ticket_updated', 'data' => []];

        $this->send($body, secret: 'wrong-secret')->assertStatus(401);
        $this->send($body, ts: time() - 3600)->assertStatus(401);
        $this->postUnsigned($body, ['X-TBCA-Timestamp' => (string) time(), 'Content-Type' => 'application/json'])->assertStatus(401);
        $this->send(['event_id' => 'zf-evt-003', 'event_type' => 'crm.something', 'data' => []])->assertStatus(422);
        $this->send(['event_type' => 'desk.ticket_updated', 'data' => []])->assertStatus(422);

        $this->assertSame(0, IntegrationEvent::count());
    }

    public function test_the_endpoint_is_closed_until_a_secret_is_configured(): void
    {
        $body = ['event_id' => 'zf-evt-004', 'event_type' => 'desk.ticket_updated', 'data' => []];
        [$raw, $headers] = $this->signedZoho($body);
        config(['zoho.webhook.secret' => null]);

        $this->call('POST', '/integrations/zoho/webhook', [], [], [], $this->transformHeadersToServerVars($headers), $raw)->assertStatus(503);
    }

    public function test_invoice_paid_in_books_marks_the_order_paid_only_after_books_confirms_it(): void
    {
        Http::fake($this->zohoFakes([
            'www.zohoapis.eu/books/v3/invoices/bk-inv-77*' => ['invoice' => ['invoice_id' => 'bk-inv-77', 'status' => 'paid', 'reference_number' => 'TBCA-ORD-EFT-1', 'total' => 3450, 'invoice_number' => 'INV-77']],
        ]));
        $order = Order::create(['reference' => 'TBCA-ORD-EFT-1', 'section' => 'shop', 'status' => 'awaiting_payment', 'subtotal_zar' => 3000, 'vat_zar' => 450, 'total_zar' => 3450]);

        $this->send(['event_id' => 'zf-evt-010', 'event_type' => 'books.invoice_paid', 'data' => ['invoice_id' => 'bk-inv-77', 'reference_number' => 'TBCA-ORD-EFT-1']])->assertStatus(202);

        $order->refresh();
        $this->assertTrue($order->isPaid());
        $this->assertSame('zoho_books', $order->meta['paid_via']);
        $this->assertSame(1, $order->payments()->where('status', 'succeeded')->count());
        $this->assertSame('bk-inv-77', IntegrationLink::externalId('order', 'TBCA-ORD-EFT-1', 'zoho_books', 'invoices'));

        // The order.payment_verified event that follows reuses the Books invoice and does not record a second payment.
        $outbound = IntegrationEvent::where('type', 'order.payment_verified')->sole();
        $this->assertSame('zoho_books', $outbound->payload['paid_via']);
        $this->artisan('zoho:sync')->assertSuccessful();
        Http::assertNotSent(fn ($r) => str_contains($r->url(), '/customerpayments'));
        Http::assertNotSent(fn ($r) => str_contains($r->url(), '/books/v3/invoices') && $r->method() === 'POST');
    }

    public function test_an_unconfirmed_invoice_event_changes_nothing(): void
    {
        Http::fake($this->zohoFakes([
            'www.zohoapis.eu/books/v3/invoices/bk-inv-78*' => ['invoice' => ['invoice_id' => 'bk-inv-78', 'status' => 'sent', 'reference_number' => 'TBCA-ORD-EFT-2']],
        ]));
        $order = Order::create(['reference' => 'TBCA-ORD-EFT-2', 'section' => 'shop', 'status' => 'awaiting_payment', 'subtotal_zar' => 100, 'vat_zar' => 15, 'total_zar' => 115]);

        $this->send(['event_id' => 'zf-evt-011', 'event_type' => 'books.invoice_paid', 'data' => ['invoice_id' => 'bk-inv-78', 'reference_number' => 'TBCA-ORD-EFT-2']])->assertStatus(202);

        $this->assertFalse($order->fresh()->isPaid());
        $event = IntegrationEvent::where('source', 'zoho')->sole();
        $this->assertSame('failed', $event->status);
        $this->assertStringContainsString('does not confirm', $event->last_error);
    }

    public function test_flow_confirmation_completes_the_outbound_event(): void
    {
        $outbound = IntegrationEvent::create([
            'event_id' => 'aaaaaaaa-0000-4000-8000-000000000001', 'source' => 'tbca', 'direction' => 'outbound', 'type' => 'enquiry.received',
            'process' => 'A1', 'status' => 'sent', 'idempotency_key' => 'test-flow-1',
        ]);

        $this->send(['event_id' => 'zf-evt-020', 'event_type' => 'flow.completed', 'data' => ['event_id' => $outbound->event_id]])->assertStatus(202);

        $this->assertSame('complete', $outbound->fresh()->status);
    }
}
