<?php

namespace Tests\Feature\Sprints;

use App\Models\Order;
use App\Models\Submission;
use App\Models\User;
use App\Support\Platform\Checkout;
use Database\Seeders\Sections\SprintsCatalogueSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SprintsOrderFlowTest extends TestCase
{
    use RefreshDatabase;

    private const SLUG = 'business-plan-development-sprint';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SprintsCatalogueSeeder::class);
    }

    private function payload(array $overrides = []): array
    {
        return [
            'package' => 'growth',
            'addons' => [],
            'name' => 'Thabo Nkosi',
            'email' => 'thabo@example.co.za',
            'phone' => '+27 71 123 4567',
            'company' => 'Nkosi Agri',
            'role' => 'Founder',
            'country' => 'South Africa',
            'language' => 'English',
            'account' => 'guest',
            'project_name' => 'Nkosi Agri Expansion',
            'industry' => 'Agriculture & Agri-processing',
            'stage' => 'Early growth',
            'description' => 'We process maize and sorghum for regional retailers and want to expand.',
            'purposes' => ['Funding', 'Expansion Planning'],
            'channel' => 'whatsapp',
            'start' => 'asap',
            'accept_terms' => true,
            ...$overrides,
        ];
    }

    public function test_order_page_new_and_existing_customer_variants(): void
    {
        $this->get('/sprints/'.self::SLUG.'/order?package=executive&addons=nope')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Order')
            ->where('selectedPackage', 'executive')
            ->where('selectedAddons', [])
            ->where('customer', null));

        $user = User::factory()->create(['phone' => '+27 82 123 4567', 'company' => 'AgriTech SA']);
        $this->actingAs($user)->get('/sprints/'.self::SLUG.'/order')->assertInertia(fn (Assert $p) => $p
            ->where('selectedPackage', 'growth')
            ->where('customer.email', $user->email));
    }

    public function test_guest_order_creates_order_and_redirects_to_checkout_then_success(): void
    {
        $response = $this->post('/sprints/'.self::SLUG.'/order', $this->payload(['addons' => ['executive-summary']]));

        $order = Order::with('items')->firstOrFail();
        $response->assertRedirect(route('checkout.show', $order));
        $this->assertSame('sprints', $order->section);
        $this->assertSame(14500 + 2500, $order->subtotal_zar);
        $this->assertCount(2, $order->items);
        $this->assertSame("/sprints/".self::SLUG."/success?order={$order->reference}", $order->meta['return_url']);
        $this->assertSame('thabo@example.co.za', $order->billing['email']);
        $this->assertSame('guest', $order->meta['customer']['type']);

        // Unpaid -> back to checkout.
        $this->get("/sprints/".self::SLUG."/success?order={$order->reference}")->assertRedirect(route('checkout.show', $order));

        Checkout::pay($order, 'card', ['card_number' => '4111111111111111']);
        $this->get("/sprints/".self::SLUG."/success?order={$order->reference}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Success')
            ->where('order.reference', $order->reference)
            ->where('package.key', 'growth'));
    }

    public function test_success_page_is_private_to_the_ordering_visitor(): void
    {
        $this->post('/sprints/'.self::SLUG.'/order', $this->payload());
        $order = Order::firstOrFail();
        Checkout::pay($order, 'card', ['card_number' => '4111111111111111']);

        $this->flushSession();
        $this->get("/sprints/".self::SLUG."/success?order={$order->reference}")->assertForbidden();
        $this->get('/sprints/'.self::SLUG.'/success?order=TBCA-ORD-0000-XXXXXX')->assertNotFound();
    }

    public function test_existing_customer_order_uses_account_details(): void
    {
        $user = User::factory()->create(['phone' => '+27 82 123 4567', 'company' => 'AgriTech SA']);
        $payload = $this->payload();
        unset($payload['name'], $payload['email'], $payload['phone'], $payload['company'], $payload['role'], $payload['country'], $payload['account']);

        $this->actingAs($user)->post('/sprints/'.self::SLUG.'/order', $payload)->assertRedirect();
        $order = Order::firstOrFail();
        $this->assertSame($user->id, $order->user_id);
        $this->assertSame($user->email, $order->billing['email']);
        $this->assertSame('existing', $order->meta['customer']['type']);
    }

    public function test_new_customer_can_create_an_account_while_ordering(): void
    {
        $this->post('/sprints/'.self::SLUG.'/order', $this->payload([
            'account' => 'create', 'password' => 'Password123!', 'password_confirmation' => 'Password123!',
        ]))->assertRedirect();

        $user = User::where('email', 'thabo@example.co.za')->firstOrFail();
        $this->assertNotNull($user->client_id);
        $this->assertAuthenticatedAs($user);
        $this->assertSame($user->id, Order::firstOrFail()->user_id);
    }

    public function test_order_validates_brief_terms_and_package(): void
    {
        $this->post('/sprints/'.self::SLUG.'/order', $this->payload(['package' => 'platinum', 'purposes' => [], 'description' => 'short', 'accept_terms' => false]))
            ->assertSessionHasErrors(['package', 'purposes', 'description', 'accept_terms']);
        $this->assertSame(0, Order::count());
    }

    public function test_free_sprint_confirms_instantly(): void
    {
        $this->post('/sprints/business-health-check/order', $this->payload(['package' => 'free', 'purposes' => ['Funding']]))
            ->assertRedirect();
        $order = Order::firstOrFail();
        $this->assertTrue($order->isPaid());
        $this->assertSame(0, $order->total_zar);
        $this->get("/sprints/business-health-check/success?order={$order->reference}")->assertOk();
    }

    public function test_retainer_order_is_flagged_recurring(): void
    {
        $this->post('/sprints/growth-advisory-retainer/order', $this->payload(['package' => 'growth', 'purposes' => ['Funding']]))->assertRedirect();
        $order = Order::firstOrFail();
        $this->assertSame('retainer', $order->meta['commercial_act']);
        $this->assertSame('month', $order->meta['recurring']['period']);
    }

    public function test_quote_sprint_routes_to_quote_request(): void
    {
        $this->get('/sprints/project-structuring-sprint/order')->assertRedirect('/sprints/project-structuring-sprint/quote');
        $this->post('/sprints/project-structuring-sprint/order', $this->payload())->assertStatus(422);

        $this->post('/sprints/project-structuring-sprint/quote', [
            'need' => 'Structure a 40MW solar project for lender engagement.',
            'organisation' => 'Sun Co', 'role' => 'Sponsor', 'email' => 'sponsor@example.com', 'phone' => '+27 82 000 0000',
            'language' => 'English', 'currency' => 'ZAR',
        ])->assertRedirect();

        $submission = Submission::firstOrFail();
        $this->assertSame('quote-request', $submission->type);
        $this->assertSame('sprints', $submission->section);
        $this->assertSame('project-structuring-sprint', $submission->payload['slug']);

        $this->get("/sprints/project-structuring-sprint/quote?submitted={$submission->reference}")
            ->assertInertia(fn (Assert $p) => $p->component('Sprints/RequestQuote')->where('submitted.reference', $submission->reference));
    }

    public function test_general_quote_form_validates_saves_draft_and_submits(): void
    {
        $this->post('/sprints/request-a-quote', ['need' => ''])->assertSessionHasErrors(['need', 'organisation', 'role', 'email', 'phone']);

        $this->post('/sprints/request-a-quote', ['action' => 'save', 'need' => 'Draft text', 'organisation' => 'Draft Co'])->assertRedirect('/sprints/request-a-quote');
        $this->get('/sprints/request-a-quote')->assertInertia(fn (Assert $p) => $p->where('prefill.organisation', 'Draft Co'));

        $this->post('/sprints/request-a-quote', [
            'need' => 'We need a custom board governance Sprint.', 'organisation' => 'Draft Co', 'role' => 'CEO',
            'email' => 'ceo@example.com', 'phone' => '+27 82 000 0000', 'language' => 'English', 'currency' => 'USD', 'budget' => 'Not sure yet',
        ])->assertRedirect();
        $this->assertSame(1, Submission::where('type', 'quote-request')->count());
    }

    public function test_ask_a_question_creates_submission(): void
    {
        $this->post('/sprints/'.self::SLUG.'/question', [
            'name' => 'Amahle Dlamini', 'email' => 'amahle@example.com', 'contact_method' => 'email',
            'package' => 'growth', 'topic' => 'Timeline and delivery', 'question' => 'How soon can we start the Growth package?',
        ])->assertRedirect()->assertSessionHas('reference');

        $this->assertSame('sprint-question', Submission::firstOrFail()->type);
    }
}
