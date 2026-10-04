<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Order;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformCoreTest extends TestCase
{
    use RefreshDatabase;

    private function line(array $overrides = []): array
    {
        return [
            'item_type' => 'sprint',
            'item_code' => 'SPR-BPD',
            'name' => 'Business Plan Development Sprint',
            'variant' => 'growth',
            'unit_zar' => 14500,
            ...$overrides,
        ];
    }

    public function test_guest_can_add_to_basket_and_check_out_with_card(): void
    {
        $this->post('/basket', $this->line())->assertRedirect();
        $this->post('/basket/checkout')->assertRedirect();

        $order = Order::firstOrFail();
        $this->assertSame(14500, $order->subtotal_zar);
        $this->assertSame(2175, $order->vat_zar);

        $this->post("/checkout/{$order->reference}/pay", [
            'method' => 'card',
            'card_name' => 'Amahle Dlamini',
            'card_number' => '4111 1111 1111 1111',
            'expiry' => '12 / 29',
            'cvv' => '123',
            'billing_name' => 'Amahle Dlamini',
            'billing_email' => 'amahle@example.com',
            'accept_terms' => true,
        ])->assertRedirect("/checkout/{$order->reference}/confirmation");

        $order->refresh();
        $this->assertSame('paid', $order->status);
        // 14 500 + 15% VAT + R250 platform + 1% card charge
        $this->assertSame(14500 + 2175 + 250 + 145, $order->total_zar);
    }

    public function test_declined_card_keeps_order_unpaid(): void
    {
        $this->post('/basket', [...$this->line(), 'checkout' => true]);
        $order = Order::firstOrFail();

        $this->post("/checkout/{$order->reference}/pay", [
            'method' => 'card',
            'card_name' => 'A',
            'card_number' => '4000 0000 0000 0002',
            'expiry' => '12/29',
            'cvv' => '123',
            'billing_name' => 'A',
            'billing_email' => 'a@example.com',
            'accept_terms' => true,
        ])->assertSessionHas('error');

        $this->assertSame('failed', $order->fresh()->status);
    }

    public function test_client_orders_are_private(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($owner)->post('/basket', [...$this->line(), 'checkout' => true]);
        $order = Order::firstOrFail();

        $this->actingAs($other)->get("/checkout/{$order->reference}")->assertForbidden();
    }

    public function test_login_by_email_or_client_id(): void
    {
        User::factory()->create(['email' => 'c@example.com', 'client_id' => 'TBCA-C-000009', 'password' => 'Secret12345A']);

        $this->post('/login', ['login' => 'TBCA-C-000009', 'password' => 'Secret12345A'])->assertRedirect('/portal/dashboard');
        $this->assertAuthenticated();
    }

    public function test_registration_steps_cannot_be_skipped(): void
    {
        $this->get('/register/4')->assertRedirect('/register/1');
    }

    public function test_admin_hub_is_staff_only(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin')->assertOk();
    }

    public function test_forms_and_bookings_are_recorded(): void
    {
        $this->post('/forms/question', ['name' => 'N', 'email' => 'n@example.com', 'message' => 'Hi'])->assertSessionHas('reference');
        $this->assertSame('question', Submission::firstOrFail()->type);

        $date = now()->addDays(3)->format('Y-m-d');
        $payload = ['date' => $date, 'time' => '10:00', 'name' => 'N', 'email' => 'n@example.com'];
        $this->post('/bookings', $payload)->assertSessionHas('reference');
        $this->post('/bookings', $payload)->assertSessionHasErrors('time');
        $this->assertSame(1, Booking::count());
    }
}
