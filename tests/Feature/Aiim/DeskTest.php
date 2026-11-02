<?php

namespace Tests\Feature\Aiim;

use App\Models\Aiim\SavedItem;
use App\Models\Sprint;
use App\Models\User;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\AiimSeeder;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Desks and dashboards rebuilt from the "TBCA AIIM Botswana" prototype: Enterprise (mock 72), API and
 * white label (73), Government and DFI (74), Monitoring alerts (75), Archive and deletion (76) and the
 * staff consoles for the advisor (78), finance (79), admin (80), pricing (81) and sources (82).
 */
class DeskTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([IndustriesSeeder::class, CountryHubSeeder::class, AiimSeeder::class]);

        // App Sprint records so embedded-service prices resolve by code (prices come only from these rows).
        foreach ([['AAB-EMB-225', 'Multi-seat team workspace', 3050], ['AAB-EMB-221', 'Government investment promotion dashboard', 3100], ['AAB-EMB-233', 'Invoicing, receipts and tax documents', 1750]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'aiim-desk-test-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    private function client(): User
    {
        return User::factory()->create(['role' => 'client']);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_workspace_desks_need_sign_in(): void
    {
        foreach (['enterprise', 'developer', 'institutional', 'alerts', 'archive'] as $page) {
            $this->get("/aiim/workspace/{$page}")->assertRedirect('/login');
        }
    }

    public function test_enterprise_desk_lists_the_six_services_with_app_prices(): void
    {
        $this->actingAs($this->client())->get('/aiim/workspace/enterprise')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Desk/Enterprise')
            ->has('services', 6)
            ->where('services.0.code', 'AAB-EMB-225')
            ->where('services.0.ep', 3050)
            ->where('services.0.inApp', true)
            // No app record in this test: never priced from the prototype.
            ->where('services.1.code', 'AAB-EMB-219')
            ->where('services.1.ep', null)
            ->where('services.1.inApp', false));
    }

    public function test_api_desk_maps_one_endpoint_per_register(): void
    {
        $this->actingAs($this->client())->get('/aiim/workspace/developer')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Desk/Developer')
            ->has('endpoints', 63)
            ->where('endpoints.1', ['sheet' => 'BW_Summary', 'rows' => 28, 'cols' => 2])
            ->where('rail.title', 'Embedded services on this page')
            ->has('rail.items', 4)
            ->where('rail.total', 581)
            ->has('keys'));
    }

    public function test_government_and_dfi_desk(): void
    {
        $this->actingAs($this->client())->get('/aiim/workspace/institutional')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Desk/Institutional')
            ->has('envelopes', 16)
            ->where('envelopes.0', ['unit' => 'Gaborone', 'code' => 'GA', 'tierA' => 51, 'env' => 24.75])
            ->where('plan.name', 'BW_Plan90')
            ->has('plan.rows', 6)
            ->where('rules.0', ['Rule', 'Source', 'What it means for a foreign investor'])
            ->where('reserved.0', ['Sector', 'Citizen-reserved templates', 'Templates'])
            ->where('rail.title', 'Desk services')
            ->where('rail.items.0.ep', 3100));
    }

    public function test_monitoring_alerts(): void
    {
        $this->actingAs($this->client())->get('/aiim/workspace/alerts')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Desk/Alerts')
            ->has('changes', 14)
            ->where('changes.0.ID', 'R-01')
            ->where('freshness.name', 'BW_Freshness')
            ->has('gaps.rows', 16)
            ->has('rail.items', 8)
            ->has('feed'));
    }

    public function test_archive_shows_account_counts_and_deletes_nothing(): void
    {
        $user = $this->client();
        SavedItem::create(['user_id' => $user->id, 'list' => 'saved', 'entity_type' => 'source', 'entity_key' => 'x', 'label' => 'X']);
        SavedItem::create(['user_id' => $user->id, 'list' => 'watchlist', 'entity_type' => 'source', 'entity_key' => 'y', 'label' => 'Y']);

        $this->actingAs($user)->get('/aiim/workspace/archive')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Desk/Archive')
            ->where('stored.saved', 1)
            ->where('stored.watchlist', 1)
            ->where('stored.comparisons', 0)
            ->where('stored.ledger', 0)
            ->has('items'));

        // No deletion endpoint: the confirmation explains how to send the request instead.
        $this->actingAs($user)->post('/aiim/workspace/archive')->assertStatus(405);
        $this->actingAs($user)->delete('/aiim/workspace/archive')->assertStatus(405);
        $this->assertSame(2, SavedItem::query()->where('user_id', $user->id)->count());
    }

    public function test_service_add_goes_to_the_site_basket_at_the_app_price(): void
    {
        $this->actingAs($this->client())->post('/basket', [
            'item_type' => 'sprint', 'item_code' => 'AAB-EMB-225', 'name' => 'Multi-seat team workspace', 'variant' => 'Basic', 'unit_zar' => 3050,
            'commercial_act' => 'purchase', 'meta' => ['section' => 'aiim', 'country' => 'BWA'],
        ])->assertRedirect()->assertSessionHas('success');
    }

    public function test_staff_consoles_stay_behind_the_admin_middleware(): void
    {
        $pages = ['', '/advisor', '/finance', '/pricing', '/sources'];
        foreach ($pages as $page) {
            $this->get("/admin/aiim{$page}")->assertRedirect('/login');
        }
        $client = $this->client();
        foreach ($pages as $page) {
            $this->actingAs($client)->get("/admin/aiim{$page}")->assertForbidden();
        }
    }

    public function test_admin_dashboard(): void
    {
        $this->actingAs($this->admin())->get('/admin/aiim')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Admin/Dashboard')
            ->where('controls.0', ['Control', 'Rule'])
            ->has('validator.rows', 30)
            ->has('editions.rows', 9)
            ->where('decisions.0', ['#', 'Open decision', 'Recommendation'])
            ->has('roles.rows', 30)
            ->has('rollout.rows', 4));
    }

    public function test_advisor_dashboard(): void
    {
        $this->actingAs($this->admin())->get('/admin/aiim/advisor')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Admin/Advisor')
            ->where('kpis.leads', 126)
            ->has('leads', 126)
            ->has('byOwner', 12)
            ->where('plan.name', 'BW_Plan90')
            ->has('queue')
            ->has('reports'));
    }

    public function test_finance_dashboard_uses_app_prices(): void
    {
        $this->actingAs($this->admin())->get('/admin/aiim/finance')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Admin/Finance')
            ->where('listed', 403)
            ->where('saleable', 3)
            ->has('automation', 3)
            ->where('rail.items.0.code', 'AAB-EMB-233')
            ->where('rail.items.0.ep', 1750)
            ->has('ledger.entries')
            ->has('orders'));
    }

    public function test_pricing_administration_pages_the_price_book_on_the_server(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)->get('/admin/aiim/pricing')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Admin/Pricing')
            ->where('book.total', 581)
            ->where('book.size', 25)
            ->has('book.rows', 25)
            ->has('feeCodes'));

        $this->actingAs($admin)->get('/admin/aiim/pricing?q=AAB-EMB-225')->assertInertia(fn (Assert $p) => $p
            ->where('book.count', 1)
            ->where('book.rows.0.Code', 'AAB-EMB-225')
            ->where('book.rows.0.Entry price', 3050));

        $this->actingAs($admin)->get('/admin/aiim/pricing?f[Module]=AIIM')->assertInertia(fn (Assert $p) => $p->where('book.count', 162));

        $csv = $this->actingAs($admin)->get('/admin/aiim/pricing?csv=1&q=AAB-EMB-225');
        $csv->assertOk();
        $this->assertStringContainsString('AAB-EMB-225', $csv->streamedContent());
    }

    public function test_source_administration(): void
    {
        $this->actingAs($this->admin())->get('/admin/aiim/sources')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Admin/Sources')
            ->has('sources.rows', 90)
            ->where('conflicts.name', 'BW_Conflicts')
            ->has('verify.rows', 18)
            ->where('policy.0', ['Marker', 'Meaning'])
            ->has('registry'));
    }
}
