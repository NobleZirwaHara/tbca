<?php

namespace Tests\Feature\Integrations;

use App\Models\IntegrationEvent;
use App\Models\IntegrationLink;
use App\Models\Order;
use App\Models\Portal\Ticket;
use App\Models\Submission;
use App\Models\User;
use App\Support\Integrations\AutomationCoverage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ZohoOutboxTest extends TestCase
{
    use RefreshDatabase;
    use ZohoTestHelpers;

    private function paidSprintOrder(): Order
    {
        $user = User::factory()->create(['name' => 'Amina Example', 'company' => 'Demo Business A', 'client_id' => 'TBCA-C-DEMO-A']);
        $order = Order::create([
            'reference' => 'TBCA-ORD-DEMO-101', 'user_id' => $user->id, 'section' => 'sprints', 'status' => 'awaiting_payment',
            'currency' => 'ZAR', 'subtotal_zar' => 6609, 'vat_zar' => 991, 'fees_zar' => 0, 'total_zar' => 7600,
        ]);
        $order->items()->create(['item_type' => 'sprint', 'item_code' => 'SPRINT-BUSINESS-PLAN-V1', 'name' => 'Business Plan Sprint', 'quantity' => 1, 'unit_zar' => 7600, 'line_zar' => 7600]);
        $order->payments()->create(['reference' => 'TBCA-PAY-DEMO-101', 'method' => 'card', 'status' => 'succeeded', 'amount_zar' => 7600]);
        $order->update(['status' => 'paid', 'paid_at' => now()]);

        return $order;
    }

    public function test_events_are_held_while_the_integration_is_off_and_nothing_is_sent(): void
    {
        Http::fake();
        $this->paidSprintOrder();

        $event = IntegrationEvent::sole();
        $this->assertSame('order.payment_verified', $event->type);
        $this->assertSame('held', $event->status);
        $this->assertSame('A2', $event->process);
        $this->assertSame('TBCA-C-DEMO-A', $event->payload['party']['business_id']);

        $this->artisan('zoho:sync')->expectsOutputToContain('Zoho integration is off')->assertSuccessful();
        Http::assertNothingSent();
    }

    public function test_a_paid_order_is_recorded_once_even_if_saved_again(): void
    {
        $this->enableZoho();
        $order = $this->paidSprintOrder();
        $order->update(['status' => 'paid', 'meta' => ['note' => 'x']]);
        $order->update(['status' => 'refunded']);
        $order->update(['status' => 'paid']);

        $this->assertSame(1, IntegrationEvent::where('type', 'order.payment_verified')->count());
        $this->assertSame('pending', IntegrationEvent::sole()->status);
    }

    public function test_sync_sends_a_paid_order_to_crm_books_projects_and_workdrive_once(): void
    {
        $this->enableZoho();
        Http::fake($this->zohoFakes());
        $this->paidSprintOrder();

        $this->artisan('zoho:sync')->expectsOutputToContain('Processed 1: 1 complete')->assertSuccessful();

        $event = IntegrationEvent::sole();
        $this->assertSame('complete', $event->status);
        $this->assertSame('automated', $event->handled_by);
        $this->assertEqualsCanonicalizing(
            ['crm_account', 'crm_contact', 'crm_deal', 'books_customer', 'books_invoice', 'books_payment', 'projects_project', 'workdrive_folder'],
            array_keys($event->result['steps']),
        );
        $this->assertSame('bk-inv-1', IntegrationLink::externalId('order', 'TBCA-ORD-DEMO-101', 'zoho_books', 'invoices'));
        $this->assertSame('prj-1', IntegrationLink::externalId('order', 'TBCA-ORD-DEMO-101', 'zoho_projects', 'projects'));

        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/books/v3/invoices') && $r->method() === 'POST' && $r['reference_number'] === 'TBCA-ORD-DEMO-101');
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/customerpayments') && $r['invoices'][0]['invoice_id'] === 'bk-inv-1' && $r['amount'] === 7600);
        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/Deals/upsert') && $r['data'][0]['TBCA_Order_ID'] === 'TBCA-ORD-DEMO-101');

        // A second run has nothing to do.
        $sent = count(Http::recorded());
        $this->artisan('zoho:sync')->expectsOutputToContain('Processed 0')->assertSuccessful();
        $this->assertCount($sent, Http::recorded());
    }

    public function test_a_failed_step_retries_with_backoff_and_resumes_without_repeating_finished_steps(): void
    {
        $this->enableZoho();
        $invoiceCalls = 0;
        Http::fake($this->zohoFakes([
            'www.zohoapis.eu/books/v3/invoices*' => function (Request $r) use (&$invoiceCalls) {
                if ($r->method() === 'GET') {
                    return Http::response(['invoices' => []]);
                }
                $invoiceCalls++;

                return $invoiceCalls === 1
                    ? Http::response(['message' => 'Service unavailable'], 503)
                    : Http::response(['invoice' => ['invoice_id' => 'bk-inv-9']]);
            },
        ]));
        $this->paidSprintOrder();

        $this->artisan('zoho:sync')->assertSuccessful();
        $event = IntegrationEvent::sole();
        $this->assertSame('failed', $event->status);
        $this->assertSame(1, $event->attempts);
        $this->assertStringContainsString('503', $event->last_error);
        $this->assertTrue($event->available_at->isFuture());
        $this->assertArrayHasKey('crm_deal', $event->result['steps']);

        // Not due yet: nothing happens.
        $this->artisan('zoho:sync')->expectsOutputToContain('Processed 0')->assertSuccessful();

        $this->travel(5)->minutes();
        $this->artisan('zoho:sync')->expectsOutputToContain('1 complete')->assertSuccessful();

        $event->refresh();
        $this->assertSame('complete', $event->status);
        $this->assertSame(2, $event->attempts);
        $this->assertSame('bk-inv-9', $event->result['steps']['books_invoice']['invoice_id']);
        $accountUpserts = collect(Http::recorded())->filter(fn ($pair) => str_contains($pair[0]->url(), '/Accounts/upsert'))->count();
        $this->assertSame(1, $accountUpserts, 'The CRM account step finished in the first attempt and must not run again.');
    }

    public function test_a_validation_error_parks_the_event_for_a_person(): void
    {
        $this->enableZoho();
        Http::fake($this->zohoFakes());
        Submission::create(['reference' => 'TBCA-Q-DEMO-1', 'type' => 'question', 'section' => 'contact', 'name' => 'No Email', 'email' => null, 'status' => 'received']);

        $this->artisan('zoho:sync')->assertSuccessful();

        $event = IntegrationEvent::sole();
        $this->assertSame('enquiry.received', $event->type);
        $this->assertSame('failed', $event->status);
        $this->assertNull($event->available_at);
        $this->assertSame(0, IntegrationEvent::query()->due()->count());
    }

    public function test_enquiries_tickets_and_complaints_reach_crm_and_desk(): void
    {
        $this->enableZoho();
        Http::fake($this->zohoFakes());
        $user = User::factory()->create(['name' => 'Kofi Mensah']);

        Submission::create(['reference' => 'TBCA-Q-DEMO-2', 'type' => 'contact', 'section' => 'contact', 'subject' => 'Market entry', 'name' => 'Lerato Demo', 'email' => 'lerato@example.test', 'status' => 'received']);
        Submission::create(['reference' => 'TBCA-C-DEMO-3', 'type' => 'complaint', 'section' => 'about', 'subject' => 'Late reply', 'name' => 'Sam Demo', 'email' => 'sam@example.test', 'status' => 'received']);
        Ticket::create(['user_id' => $user->id, 'reference' => 'TKT-2026-0900', 'subject' => 'Cannot download report', 'priority' => 'high', 'status' => 'open']);

        $this->assertEqualsCanonicalizing(['enquiry.received', 'support.requested', 'support.requested'], IntegrationEvent::pluck('type')->all());

        $this->artisan('zoho:sync')->expectsOutputToContain('3 complete')->assertSuccessful();

        Http::assertSent(fn (Request $r) => str_contains($r->url(), '/Leads/upsert') && $r['data'][0]['Email'] === 'lerato@example.test' && $r['duplicate_check_fields'] === ['Email']);
        Http::assertSent(fn (Request $r) => str_contains($r->url(), 'desk.zoho.eu/api/v1/tickets') && $r['cf']['cf_tbca_reference'] === 'TKT-2026-0900' && $r['priority'] === 'High');
        $this->assertSame('desk-1', IntegrationLink::externalId('support', 'TKT-2026-0900', 'zoho_desk', 'tickets'));
    }

    public function test_flow_webhook_receives_the_event_envelope_and_can_hold_the_event_as_sent(): void
    {
        $this->enableZoho([
            'zoho.flow.webhooks.enquiry.received' => 'https://flow.zoho.eu/1/flow/webhook/incoming?zapikey=test',
            'zoho.flow.await_confirmation' => true,
        ]);
        Http::fake($this->zohoFakes(['flow.zoho.eu/*' => ['status' => 'success']]));
        Submission::create(['reference' => 'TBCA-Q-DEMO-4', 'type' => 'contact', 'name' => 'Ade Demo', 'email' => 'ade@example.test', 'status' => 'received']);

        $this->artisan('zoho:sync')->expectsOutputToContain('1 sent to Flow')->assertSuccessful();

        $event = IntegrationEvent::sole();
        $this->assertSame('sent', $event->status);
        Http::assertSent(fn (Request $r) => str_starts_with($r->url(), 'https://flow.zoho.eu/') && $r['event_id'] === $event->event_id
            && $r['event_type'] === 'enquiry.received' && $r['schema_version'] === 1 && $r['zoho_ids']['crm_lead'] === 'crm-lead-1');
    }

    public function test_automation_coverage_counts_automated_and_human_work(): void
    {
        $this->enableZoho();
        Http::fake($this->zohoFakes());
        foreach (range(1, 9) as $i) {
            Submission::create(['reference' => "TBCA-Q-COV-{$i}", 'type' => 'contact', 'name' => "Person {$i}", 'email' => "p{$i}@example.test", 'status' => 'received']);
        }
        Submission::create(['reference' => 'TBCA-Q-COV-10', 'type' => 'contact', 'name' => 'No Email', 'status' => 'received']);
        $this->artisan('zoho:sync')->assertSuccessful();

        $admin = User::factory()->create(['role' => 'admin']);
        $failed = IntegrationEvent::where('status', 'failed')->sole();
        $this->actingAs($admin)->post("/admin/integrations/events/{$failed->id}/resolve", ['minutes' => 12, 'note' => 'Email found by phone'])->assertRedirect();

        $report = AutomationCoverage::report();
        $a1 = collect($report['processes'])->firstWhere('code', 'A1');
        $this->assertSame(10, $a1['tasks']);
        $this->assertSame(9, $a1['automated']);
        $this->assertSame(1, $a1['human']);
        $this->assertSame(12, $a1['humanMinutes']);
        $this->assertSame(0.9, $a1['automationShare']);
        $this->assertSame(0.9, $report['totals']['straightThrough']);
        $this->assertFalse(collect($report['processes'])->firstWhere('code', 'A9')['instrumented']);
    }

    public function test_admin_status_page_is_staff_only_and_lists_the_ledger(): void
    {
        $this->paidSprintOrder();

        $this->actingAs(User::factory()->create(['role' => 'client']))->get('/admin/integrations')->assertForbidden();

        $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin/integrations')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Integrations', false)
                ->where('health.enabled', false)
                ->where('health.counts.held', 1)
                ->where('events.0.type', 'order.payment_verified')
                ->has('coverage.processes', 10)
                ->where('identity.driver', 'simulated'));

        $this->assertFileExists(resource_path('js/Pages/Admin/Integrations.tsx'));
    }
}
