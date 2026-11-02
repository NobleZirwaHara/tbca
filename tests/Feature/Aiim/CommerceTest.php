<?php

namespace Tests\Feature\Aiim;

use App\Models\Aiim\Comparison;
use App\Models\Aiim\Entitlement;
use App\Models\Aiim\Project;
use App\Models\Aiim\Quote;
use App\Models\Aiim\SavedItem;
use App\Models\Order;
use App\Models\Sprint;
use App\Models\User;
use App\Support\Aiim\WalletService;
use App\Support\Industries\IndustryData;
use App\Support\Platform\Checkout;
use Database\Seeders\Sections\AiimSeeder;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Account, workspace and commerce pages of the "TBCA AIIM Botswana" prototype
 * (mock-ups 19 to 33 and 77) and the real flows behind them.
 */
class CommerceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([IndustriesSeeder::class, CountryHubSeeder::class, AiimSeeder::class]);

        // App Sprint records for the embedded services these pages price (prices come only from these rows).
        foreach ([['AAB-EMB-139', 2850], ['AAB-EMB-199', 3100], ['AAB-EMB-094', 2850], ['AAB-EMB-093', 1750]] as $i => [$code, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'aiim-test-'.$i, 'title' => $code, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $code, 'description' => $code,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    private function user(): User
    {
        return User::factory()->create();
    }

    /** Settle a top-up through the shared checkout's test card handling. */
    private function fund(User $user, string $pack = 'AIIM-CRD-10K'): void
    {
        $this->actingAs($user)->post('/aiim/wallet/top-up', ['pack' => $pack])->assertRedirect();
        $order = Order::query()->where('user_id', $user->id)->latest('id')->first();
        Checkout::pay($order, 'card', ['card_number' => '4111111111111111'], ['name' => $user->name, 'email' => $user->email]);
        $this->get("/aiim/checkout/{$order->reference}/success")->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Aiim/Commerce/Payment')->where('paid', true)->where('next.url', '/aiim/wallet'));
    }

    public function test_registration_creates_the_account_and_welcomes_the_user(): void
    {
        $this->get('/aiim/register')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Register')
            ->has('options.personas', 6)->has('options.sectors', 18)->where('options.currencies', ['BWP', 'USD', 'ZAR'])->has('services', 3));
        $this->get('/aiim/register/2')->assertRedirect('/aiim/register');

        $this->post('/aiim/register/1', ['name' => 'Neo Kgosi', 'email' => 'neo@example.com', 'persona' => 'SME', 'currency' => 'BWP', 'language' => 'English', 'sectors' => ['ENR', 'ICT'], 'password' => 'secret123', 'password_confirmation' => 'secret123'])
            ->assertSessionHasErrors('terms');

        $this->post('/aiim/register/1', ['name' => 'Neo Kgosi', 'email' => 'neo@example.com', 'organisation' => 'Kgosi Holdings', 'persona' => 'DFI', 'currency' => 'BWP', 'language' => 'Setswana', 'sectors' => ['ENR', 'ICT'], 'password' => 'secret123', 'password_confirmation' => 'secret123', 'terms' => true, 'marketing' => true])
            ->assertRedirect('/aiim/welcome');
        $user = User::query()->where('email', 'neo@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('Kgosi Holdings', $user->company);
        $this->assertSame(['ENR', 'ICT'], $user->profile['aiim']['sectors']);
        $this->assertSame('investor', $user->client_type);

        $this->get('/aiim/welcome')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Welcome')
            ->has('top', 6)->where('top.0.id', 'BW-CSP-S01')->where('account.persona', 'DFI / impact investor')->where('account.sectors', ['Energy & Power', 'Digital, Mobile Money & 5G']));
    }

    public function test_client_dashboard_saved_items_and_watchlist(): void
    {
        $user = $this->user();
        $p = Project::query()->where('kind', '!=', 'screened')->firstOrFail();
        $this->actingAs($user)->post('/aiim/workspace/items', ['list' => 'saved', 'type' => 'opportunity', 'key' => $p->slug])->assertRedirect();
        $this->post('/aiim/workspace/items', ['list' => 'watchlist', 'type' => 'opportunity', 'key' => $p->slug])->assertRedirect();

        $this->get('/aiim/workspace')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Workspace/Dashboard')
            ->where('kpis.saved', 1)->where('kpis.watchlist', 1)->has('top', 30)->has('alerts', 5)->where('ledgerUrl', '/aiim/wallet'));

        $this->get('/aiim/workspace/saved')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Workspace/Saved')
            ->where('list', 'saved')->has('items', 1)->where('items.0.label', $p->name)->has('services', 3)->missing('changes'));

        $item = SavedItem::query()->where('list', 'watchlist')->firstOrFail();
        $this->patch("/aiim/workspace/items/{$item->id}/alerts")->assertRedirect();
        $this->get('/aiim/workspace/watchlist')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Workspace/Saved')
            ->where('list', 'watchlist')->has('items', 1)->has('changes.rows', 14)->where('changes.cols.0', 'ID'));

        // Remove from the watchlist (toggle again).
        $this->post('/aiim/workspace/items', ['list' => 'watchlist', 'type' => 'opportunity', 'key' => $p->slug]);
        $this->assertSame(0, SavedItem::query()->where('list', 'watchlist')->count());
    }

    public function test_comparison_builder_and_results_for_botswana_templates(): void
    {
        $user = $this->user();
        $this->actingAs($user)->get('/aiim/workspace/compare?q=solar')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Workspace/CompareBuilder')
            ->where('max', 5)->has('draft.items', 0)->where('candidates.0.id', 'BW-ENR-S01')->has('services', 3));

        foreach (['BW-CSP-S01', 'BW-ENR-S01'] as $id) {
            $this->post('/aiim/workspace/compare/items', ['type' => 'template', 'key' => $id])->assertRedirect();
        }
        $this->post('/aiim/workspace/compare/items', ['type' => 'template', 'key' => 'BW-XXX-S99'])->assertNotFound();
        // A Botswana opportunity added from elsewhere compares as a template.
        $this->post('/aiim/workspace/compare/items', ['type' => 'opportunity', 'key' => 'BW-ENR-S02'])->assertRedirect();
        $this->get('/aiim/workspace/compare')->assertInertia(fn (Assert $a) => $a->has('draft.items', 3)->where('draft.items.0.tier', 'A+')->where('draft.items.2.type', 'template'));
        $this->delete('/aiim/workspace/compare/items', ['type' => 'template', 'key' => 'BW-ENR-S02'])->assertRedirect();

        $this->post('/aiim/workspace/compare/generate')->assertRedirect();
        $cmp = Comparison::query()->where('user_id', $user->id)->latest('id')->firstOrFail();
        $this->get("/aiim/workspace/compare/{$cmp->reference}")->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Workspace/CompareResults')
            ->has('templates', 2)->where('templates.0.id', 'BW-CSP-S01')->where('templates.0.fields.Institution to call', 'Ministry of Sport and Arts')
            ->has('fields', 19)->where('report.code', 'AAB-EMB-199'));
        $this->get("/aiim/workspace/compare/{$cmp->reference}/export")->assertOk()->assertSee('BW-ENR-S01', false);
    }

    public function test_fee_discovery_manifest_and_wallet_payment_unlock_services(): void
    {
        // Guests can price services; the manifest needs an account.
        $this->post('/aiim/fees/items', ['type' => 'service', 'key' => 'AAB-EMB-199', 'ctx' => 'Comparison report'])->assertRedirect();
        $this->post('/aiim/fees/items', ['type' => 'service', 'key' => 'AAB-EMB-001'])->assertSessionHas('error');
        $this->get('/aiim/fees/discover')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/FeeDiscovery')
            ->has('items', 1)->where('items.0.price', 3100)->where('items.0.context', 'Comparison report')->where('estimate.subtotal', 3100)
            ->has('journey', 14)->has('prices.rows'));

        $user = $this->user();
        $this->actingAs($user)->post('/aiim/fees/items', ['type' => 'template', 'key' => 'BW-CSP-S01', 'ctx' => 'BW-CSP-S01 full record']);
        $this->post('/aiim/fees/manifest')->assertRedirect();
        $quote = Quote::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertEquals(5950, (float) $quote->subtotal_zar);
        $this->get("/aiim/fees/{$quote->reference}")->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/FeeManifest')
            ->has('quote.lines', 2)->where('quote.lines.1.code', 'AAB-EMB-139')->where('quote.status', 'pending')->where('wallet', 0));

        // Not enough credit: sent to the wallet.
        $this->post("/aiim/fees/{$quote->reference}/checkout", ['method' => 'wallet'])->assertRedirect('/aiim/wallet');
        $this->assertSame(0, Entitlement::query()->count());

        $this->fund($user);
        $this->get('/aiim/wallet')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/Wallet')
            ->where('summary.balance', 10000)->has('packs', 3)->where('count', 1)->has('transactions', 1));

        $this->post("/aiim/fees/{$quote->reference}/checkout", ['method' => 'wallet'])->assertRedirect();
        $this->assertEquals(4050.0, WalletService::balance($user));
        $this->assertSame('paid', $quote->refresh()->status);
        $ent = Entitlement::query()->where('user_id', $user->id)->oldest('id')->firstOrFail();
        $this->get("/aiim/workspace/entitlements/{$ent->reference}")->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/Entitlement')
            ->has('unlocked', 2)->where('unlocked.0.action.label', 'Track delivery')->where('unlocked.1.action.url', '/aiim/unlock/BW-CSP-S01')->has('services', 3));

        // The paid template record is now unlocked.
        $this->get('/aiim/unlock/BW-CSP-S01')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/Locked')->whereNot('object.full', null));
    }

    public function test_secure_checkout_by_card_and_by_wallet(): void
    {
        $user = $this->user();
        $this->actingAs($user)->post('/aiim/fees/items', ['type' => 'service', 'key' => 'AAB-EMB-094']);
        $this->post('/aiim/fees/manifest');
        $quote = Quote::query()->where('user_id', $user->id)->firstOrFail();
        $this->post("/aiim/fees/{$quote->reference}/checkout")->assertRedirect();
        $order = Order::query()->findOrFail($quote->refresh()->order_id);

        $this->get("/aiim/checkout/{$order->reference}")->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/Checkout')
            ->where('order.reference', $order->reference)->where('walletAllowed', true)->has('order.items', 1));
        $this->post("/aiim/checkout/{$order->reference}", ['method' => 'card', 'company' => 'Kgosi Holdings'])->assertSessionHasErrors('terms');
        $this->post("/aiim/checkout/{$order->reference}", ['method' => 'card', 'company' => 'Kgosi Holdings', 'terms' => true])
            ->assertRedirect(route('checkout.show', $order).'?method=card');
        $this->assertSame('Kgosi Holdings', $order->refresh()->billing['company']);

        // Unpaid: the processing view.
        $this->get("/aiim/checkout/{$order->reference}/success")->assertOk()->assertInertia(fn (Assert $a) => $a->where('paid', false));

        // Pay the same order from the wallet.
        $this->fund($user, 'AIIM-CRD-5K');
        $this->post("/aiim/checkout/{$order->reference}", ['method' => 'wallet', 'terms' => true])->assertRedirect("/aiim/checkout/{$order->reference}/success");
        $this->assertTrue($order->refresh()->isPaid());
        $this->assertEquals(5000 - 2850, WalletService::balance($user));
        $this->get("/aiim/checkout/{$order->reference}/success")->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/Payment')
            ->where('paid', true)->where('payment.method', 'wallet')->where('next.label', 'See what is unlocked'));
    }

    public function test_locked_template_and_metered_wallet_unlock(): void
    {
        $this->get('/aiim/unlock/BW-CSP-S01')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/Locked')
            ->where('object.kind', 'template')->where('object.full', null)->where('price', 2850)->has('services', 3)
            ->where('object.teaser.0', ['Opportunity', 'Event management (World Athletics Relays legacy)']));
        // Locked values never reach the page.
        $this->get('/aiim/unlock/BW-CSP-S01')->assertDontSee('Ministry of Sport and Arts', false);

        $user = $this->user();
        $this->actingAs($user)->get('/aiim/unlock/BW-CSP-S01/approve')->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/UnlockApproval')
            ->where('object.title', 'BW-CSP-S01 full record')->where('charge', 2850)->where('wallet', 0));
        $this->post('/aiim/unlock/BW-CSP-S01/approve', ['confirm' => true])->assertSessionHas('error');

        $this->fund($user, 'AIIM-CRD-5K');
        $this->post('/aiim/unlock/BW-CSP-S01/approve', [])->assertSessionHasErrors('confirm');
        $this->post('/aiim/unlock/BW-CSP-S01/approve', ['confirm' => true])->assertRedirect();
        $ent = Entitlement::query()->where(['user_id' => $user->id, 'object_type' => 'template', 'object_key' => 'BW-CSP-S01'])->firstOrFail();
        $this->assertEquals(2150.0, WalletService::balance($user));
        $this->get('/aiim/unlock/BW-CSP-S01')->assertInertia(fn (Assert $a) => $a->where('object.entitlement', $ent->reference)->whereNot('object.full', null));
        $this->get('/aiim/unlock/BW-CSP-S01/approve')->assertRedirect("/aiim/workspace/entitlements/{$ent->reference}");
    }

    public function test_locked_south_african_project_keeps_metered_unlock(): void
    {
        $p = Project::query()->whereNotNull('premium')->where('confidence', '>=', 70)->firstOrFail();
        $this->get("/aiim/unlock/{$p->code}")->assertOk()->assertInertia(fn (Assert $a) => $a->component('Aiim/Commerce/Locked')
            ->where('object.kind', 'project')->where('object.code', $p->code)->has('object.locked'));

        $user = $this->user();
        $this->actingAs($user)->get("/aiim/unlock/{$p->code}/approve")->assertOk()->assertInertia(fn (Assert $a) => $a->where('object.kind', 'project'));
        $this->post("/aiim/unlock/{$p->code}/approve", ['method' => 'card'])->assertRedirect();
        $order = Order::query()->where('user_id', $user->id)->latest('id')->firstOrFail();
        $this->assertSame('unlock', $order->meta['aiim']['kind']);
        Checkout::pay($order, 'card', ['card_number' => '4111111111111111'], []);
        $this->get("/aiim/checkout/{$order->reference}/success")->assertOk()->assertInertia(fn (Assert $a) => $a->where('paid', true)->where('next.label', 'See what is unlocked'));
        $ent = Entitlement::query()->where(['user_id' => $user->id, 'object_type' => 'project'])->firstOrFail();
        $this->get("/aiim/workspace/entitlements/{$ent->reference}")->assertOk()->assertInertia(fn (Assert $a) => $a->where('unlocked.0.action.label', 'Open full model'));
        $this->post("/aiim/workspace/entitlements/{$ent->reference}/view")->assertRedirect();
        $this->assertSame(1, $ent->refresh()->views_used);
    }
}
