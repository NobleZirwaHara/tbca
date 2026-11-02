<?php

namespace Tests\Feature\Aiim;

use App\Models\Aiim\Brief;
use App\Models\Aiim\Entitlement;
use App\Models\Aiim\ReportRequest;
use App\Models\Order;
use App\Models\Sprint;
use App\Models\User;
use App\Support\Aiim\Fulfilment;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\AiimSeeder;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Library and Premium store pages of the "TBCA AIIM Botswana" prototype: Pages 34 to 38 (store,
 * brief detail, report configuration, quotation, delivery) and the unnumbered Country Pack, Data
 * Room, register sheets, coverage, embedded services, One-Stop Shop, prompts and page index.
 */
class LibraryTest extends TestCase
{
    use RefreshDatabase;

    /** App Sprint prices by service code (prices come only from these rows). */
    private const PRICES = ['AAB-EMB-192' => 3100, 'AAB-EMB-193' => 1750, 'AAB-EMB-203' => 1750, 'AAB-EMB-242' => 3100, 'AAB-EMB-191' => 3100];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);
        $this->seed(AiimSeeder::class);
        $i = 0;
        foreach (self::PRICES as $code => $zar) {
            Sprint::query()->where('code', $code)->delete();
            Sprint::create(['code' => $code, 'slug' => 'aiim-lib-'.$i++, 'title' => $code, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $code, 'description' => $code,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        // A report format the app does not price.
        Sprint::query()->where('code', 'AAB-EMB-194')->delete();
        IndustryData::forget();
    }

    public function test_store_lists_botswana_briefs_report_formats_and_app_briefs(): void
    {
        $this->get('/aiim/store')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Store/Index')
            ->has('briefs', 17)
            ->where('briefs.7.code', 'BW-PB-08')
            ->where('briefs.7.svc.code', 'AAB-EMB-193')
            ->where('briefs.7.svc.from', 1750)
            ->has('formats', 12)
            ->where('formats.2.code', 'AAB-EMB-194')
            ->where('formats.2.status', 'missing')
            ->has('results.data'));
    }

    public function test_brief_detail_for_botswana_and_app_briefs(): void
    {
        $this->get('/aiim/store/BW-PB-08')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Store/Show')
            ->where('kind', 'bw')->where('bw.product', 'Solar, Storage and Mine Power Brief')
            ->where('pricing.from', 1750)->has('outline', 9)->has('preview', 6)->has('addons', 3)->where('owned', false));
        $this->get('/aiim/store/BW-PB-99')->assertNotFound();

        $sku = Brief::query()->value('sku');
        $this->get("/aiim/store/{$sku}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Store/Show')->where('kind', 'app')->where('item.sku', $sku));
    }

    public function test_buying_a_botswana_brief_goes_to_checkout_and_grants_the_entitlement(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post('/aiim/store/BW-PB-08/buy')->assertRedirectContains('/aiim/checkout/');
        $order = Order::query()->where('user_id', $user->id)->latest('id')->firstOrFail();
        $line = $order->items()->firstOrFail();
        $this->assertSame(['aiim-brief', 'BW-PB-08', 1750], [$line->item_type, $line->item_code, (int) $line->unit_zar]);

        $order->update(['status' => 'paid', 'paid_at' => now()]);
        Fulfilment::settle($order->fresh());
        $this->assertTrue(Entitlement::query()->where('user_id', $user->id)->where('object_type', 'brief')->where('object_key', 'BW-PB-08')->exists());
        $this->get('/aiim/store/BW-PB-08')->assertInertia(fn (Assert $p) => $p->where('owned', true));
        $this->post('/aiim/store/BW-PB-08/buy')->assertSessionHas('success');

        // The app's own briefs still buy as before.
        $sku = Brief::query()->value('sku');
        $this->post("/aiim/store/{$sku}/buy")->assertRedirectContains('/aiim/checkout/');
    }

    public function test_report_configuration_quotation_changes_and_acceptance(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/aiim/store/BW-PB-08/configure')->assertRedirectContains('/aiim/reports/');
        $r = ReportRequest::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertSame('service', $r->config['kind']);
        $this->assertSame('AAB-EMB-193', $r->config['type']);

        $this->get("/aiim/reports/{$r->reference}/configure")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Store/Configure')
            ->where('report.country', 'Botswana')->has('options.types', 12)->has('options.sectors', 18)->has('options.units', 16)->where('options.localise', true));

        // A format the app does not price cannot be quoted.
        $form = ['kind' => 'service', 'type' => 'AAB-EMB-194', 'sector' => 'ICT', 'unit' => 'GA', 'language' => 'tn', 'currency' => 'BWP', 'expedite' => true, 'sources' => true, 'quote' => true];
        $this->post("/aiim/reports/{$r->reference}/step", $form)->assertRedirect("/aiim/reports/{$r->reference}/configure")->assertSessionHas('error');
        $this->post("/aiim/reports/{$r->reference}/step", ['type' => 'AAB-EMB-192', 'unit' => 'NOPE'] + $form)->assertSessionHasErrors('unit');

        $this->post("/aiim/reports/{$r->reference}/step", ['type' => 'AAB-EMB-192'] + $form)->assertRedirect("/aiim/reports/{$r->reference}/quote");
        $r->refresh();
        $this->assertSame('quoted', $r->status);
        $this->assertSame(['AAB-EMB-192', 'AAB-EMB-242', 'AAB-EMB-203', 'AAB-EMB-191'], array_column($r->lines, 'code'));
        $this->assertEquals(3100 + 3100 + 1750 + 3100, $r->subtotal_zar);
        $this->assertSame(now()->addDays(14)->toDateString(), $r->valid_until->toDateString());

        $this->get("/aiim/reports/{$r->reference}/quote")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Store/Quote')
            ->where('report.typeCode', 'AAB-EMB-192')->where('report.scope', 'Botswana · Gaborone')->has('report.lines', 4)->has('rail', 3));

        $this->post("/aiim/reports/{$r->reference}/accept", [])->assertSessionHasErrors('accept');
        $this->post("/aiim/reports/{$r->reference}/changes")->assertRedirect("/aiim/reports/{$r->reference}/configure?step=1");
        $this->assertSame('changes_requested', $r->fresh()->status);

        $this->post("/aiim/reports/{$r->reference}/step", ['type' => 'AAB-EMB-193', 'language' => 'en', 'expedite' => false] + $form)->assertRedirect("/aiim/reports/{$r->reference}/quote");
        $this->assertEquals(1750 + 1750, $r->fresh()->subtotal_zar);
        $this->post("/aiim/reports/{$r->reference}/accept", ['accept' => true])->assertRedirectContains('/aiim/checkout/');
        $order = Order::query()->findOrFail($r->fresh()->order_id);
        $this->assertSame(['AAB-EMB-193', 'AAB-EMB-203'], $order->items()->pluck('item_code')->all());

        $order->update(['status' => 'paid', 'paid_at' => now()]);
        $this->get("/aiim/workspace/reports/{$r->reference}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Store/Delivery')->where('report.status', 'in_production')->where('report.paid', true));
        $this->get('/aiim/workspace/reports')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Store/Reports')->has('reports', 1));
    }

    public function test_generic_botswana_report_and_other_country_brief_configurations(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/aiim/store/BW-REPORT/configure')->assertRedirectContains('/aiim/reports/');
        $this->assertNull(ReportRequest::query()->latest('id')->value('brief_sku'));

        $sku = Brief::query()->value('sku');
        $this->get("/aiim/store/{$sku}/configure")->assertRedirectContains('/aiim/reports/');
        $r = ReportRequest::query()->where('brief_sku', $sku)->firstOrFail();
        $this->get("/aiim/reports/{$r->reference}/configure")->assertInertia(fn (Assert $p) => $p->where('report.country', 'South Africa')->has('options.units', 9)->where('options.localise', false));
        $this->post("/aiim/reports/{$r->reference}/step", ['kind' => 'service', 'type' => 'AAB-EMB-192', 'sector' => '', 'unit' => '', 'language' => 'tn', 'currency' => 'ZAR'])->assertSessionHasErrors('language');
    }

    public function test_country_pack_and_data_room(): void
    {
        $this->get('/aiim/country/botswana/pack')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Pack')
            ->where('country.isBW', true)->has('blocks', 636)->where('stats.tables', 223));
        $this->get('/aiim/country/south-africa/pack')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Pack')
            ->where('country.isBW', false)->where('country.packStatus', 'Model pack')->has('blocks', 0)->where('stats', null));
        $this->get('/aiim/country/atlantis/pack')->assertNotFound();

        $this->get('/aiim/country/botswana/registers')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Registers')
            ->has('index', 63)->has('readme', 5)->has('services', 2));
        $this->get('/aiim/country/malawi/registers')->assertOk()->assertInertia(fn (Assert $p) => $p->has('index', 15)->has('readme', 0));

        $this->get('/aiim/country/botswana/registers/BW_Premium')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Sheet')
            ->where('available', true)->where('table.total', 17)->has('headers', 4));
        $this->get('/aiim/country/botswana/registers/BW_Ranked_Leads?q=Gaborone&page=1')->assertOk()->assertInertia(fn (Assert $p) => $p->where('table.page', 1)->where('table.size', 25));
        $this->get('/aiim/country/malawi/registers/BW_Premium')->assertOk()->assertInertia(fn (Assert $p) => $p->where('available', false)->where('table', null));
        $this->get('/aiim/country/malawi/registers/I2_Commodity_HS')->assertOk()->assertInertia(fn (Assert $p) => $p->where('available', true)->where('table.total', 85));
        $this->get('/aiim/country/botswana/registers/NOPE')->assertNotFound();
        $csv = $this->get('/aiim/country/botswana/registers/BW_Premium?csv=1');
        $csv->assertOk();
        $this->assertStringContainsString('BW-PB-08', $csv->streamedContent());
    }

    public function test_coverage_report(): void
    {
        $this->get('/aiim/country/botswana/coverage')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Coverage')
            ->where('kpis.blocks', 636)->where('kpis.services', 581)->has('rows', 63)->where('rows.0.pages', 'Data Room'));
        $this->get('/aiim/country/kenya/coverage')->assertOk()->assertInertia(fn (Assert $p) => $p->where('kpis', null)->has('rows', 0));
    }

    public function test_embedded_services_catalogue_and_detail(): void
    {
        $this->get('/aiim/services')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Services')
            ->where('total', 581)->where('counts.internal', 12)->where('counts.aiim', 162)->has('journey', 14)->where('table.total', 581)->has('table.rows', 25));
        $this->get('/aiim/services?cat=Due%20Diligence')->assertOk()->assertInertia(fn (Assert $p) => $p->where('table.total', 15)->where('journey', null)->where('section', '/due-diligence'));
        $this->get('/aiim/services?cat=Nope')->assertNotFound();

        $this->get('/aiim/services/AAB-EMB-193')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Service')
            ->where('svc.status', 'priced')->where('svc.prices.Standard', 3500)->where('svc.from', 1750));
        $this->get('/aiim/services/AAB-EMB-194')->assertOk()->assertInertia(fn (Assert $p) => $p->where('svc.status', 'missing')->where('svc.from', null));
        $this->get('/aiim/services/AAB-INT-001')->assertOk()->assertInertia(fn (Assert $p) => $p->where('svc.internal', true));
        $this->get('/aiim/services/NOPE-1')->assertNotFound();
    }

    public function test_one_stop_shop_prompts_and_page_index(): void
    {
        $this->get('/aiim/one-stop-shop')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/OneStop')->has('features', 80)->has('gates'));
        $this->get('/aiim/prompts')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Prompts')
            ->where('markdown', fn ($m) => str_contains($m, 'MASTER PROMPT'))->has('master')->has('packPrompts'));
        $this->get('/aiim/sitemap')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Library/Sitemap')
            ->has('mock', 79)->where('mock.33.url', '/aiim/store')->where('mock.34.url', '/aiim/store/BW-PB-08')
            ->has('added', 13)->has('sectors', 18)->has('units', 16));
    }
}
