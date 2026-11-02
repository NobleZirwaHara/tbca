<?php

namespace Tests\Feature\CountryHub;

use App\Models\Sprint;
use App\Support\CountryHub\CountryHub;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Once;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Intelligence (AIIM) part 2 (prototype pages-intel.js from the Investment case to the Data Room):
 * Botswana carries the BW-1.0 registers and pack text; other countries get the bwOnly panel, except
 * the Continental Model and the register pages. Big registers page on the server.
 */
class IntelDataTest extends TestCase
{
    use RefreshDatabase;

    private const PAGES = ['invest' => 'Invest', 'risk' => 'Risk', 'products' => 'Products', 'infotypes' => 'Infotypes', 'continental' => 'Continental', 'onestop' => 'Onestop', 'pack' => 'Pack', 'dataroom' => 'Dataroom'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);

        // App Sprint records (prices come only from these rows) for a few Sprints in the shelf topics.
        $i = 0;
        foreach (['intelligence', 'investment', 'trade', 'risk', 'regulatory'] as $topic) {
            $pick = array_slice(array_filter(CountryHub::sprints(), fn ($s) => $s['topic'] === $topic && $s['viable'] && $s['pop'] === 'PUBLISHED'), 0, 2);
            foreach ($pick as $s) {
                $zar = 1500 + 100 * $i;
                Sprint::create(['code' => $s['code'], 'slug' => 'cty-intel-test-'.$i++, 'title' => $s['name'], 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $s['name'], 'description' => $s['name'],
                    'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar]]]);
            }
        }
        Once::flush();
        IndustryData::forget();
    }

    public function test_every_page_renders_for_botswana_south_africa_and_kenya(): void
    {
        foreach (['botswana', 'south-africa', 'kenya'] as $slug) {
            foreach (self::PAGES as $key => $page) {
                $this->get("/countries/{$slug}/{$key}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/IntelData/'.$page)->has('base.c'));
            }
        }
    }

    public function test_other_countries_get_the_pack_loading_panel(): void
    {
        foreach (['south-africa', 'kenya'] as $slug) {
            foreach (array_diff_key(self::PAGES, ['continental' => 1]) as $key => $page) {
                $this->get("/countries/{$slug}/{$key}")->assertInertia(fn (Assert $p) => $p->whereNot('bwOnly', null)->has('shelf.items')->missing('blocks')->missing('ue'));
            }
        }
        $this->get('/countries/kenya/invest')->assertInertia(fn (Assert $p) => $p->where('bwOnly.title', 'Investment Case')->has('shelf.items', 2));
    }

    public function test_botswana_investment_risk_products_and_one_stop_shop(): void
    {
        $this->get('/countries/botswana/invest')->assertInertia(fn (Assert $p) => $p->where('bwOnly', null)->has('ue', 14)->has('tornado', 14)->has('precedents', 18)->has('scenarios', 4)
            ->where('tornado.0.Pack', 'Solar O&M company, 100 MW under contract')->where('method.0.x', 'H-1a Logic [assumptions PROPOSED]')->where('shelf.title', 'Investor-readiness Sprints'));

        $this->get('/countries/botswana/risk')->assertInertia(fn (Assert $p) => $p->where('downturn.ap', '28 → 28')->where('downturn.down', 19)->has('downgraded', 19)
            ->has('regChange', 14)->has('gaps', 8)->where('political.Fact ID', 'BW-MAC-F24')->where('exposed.0.text', '9 / 7'));

        $this->get('/countries/botswana/products')->assertInertia(fn (Assert $p) => $p->has('products', 55)->has('traderChain', 40)->has('commodities', 85));

        $this->get('/countries/botswana/onestop')->assertInertia(fn (Assert $p) => $p->has('premium', 17)->has('features', 80)->has('plan90', 6)->has('rollout', 4)->has('readme', 5)->has('summary', 28));
    }

    public function test_info_types_page_on_the_server(): void
    {
        $this->get('/countries/botswana/infotypes')->assertInertia(fn (Assert $p) => $p->where('tab', 'investor')->has('chain', 45)->where('table', null)->has('tabs', 4));

        $this->get('/countries/botswana/infotypes?tab=bwi&f[Sector]=ENR&size=25&page=1')->assertInertia(fn (Assert $p) => $p->where('tab', 'bwi')->where('table.total', 18810)
            ->has('table.rows', 25)->where('table.page', 1)->where('table.rows.0.Sector', 'ENR')->where('filters', ['Sector', 'Q', 'Tag']));

        $this->get('/countries/botswana/infotypes?tab=bwt&q=diamond')->assertInertia(fn (Assert $p) => $p->where('table.total', 5600)->where('table.q', 'diamond')->has('table.rows', 15));

        $csv = $this->get('/countries/botswana/infotypes?tab=bwt&f[Q]=TQ01&csv=1');
        $csv->assertOk();
        $this->assertSame(141, count(array_filter(explode("\n", $csv->streamedContent()))));
    }

    public function test_continental_model_for_every_country(): void
    {
        $this->get('/countries/kenya/continental')->assertInertia(fn (Assert $p) => $p->where('tab', 'activation')->where('sheet', 'I2_Country_Activation')->has('map', 54)
            ->has('activation', 54)->where('table.total', 54)->where('filters', ['AU region', 'Wave [PROPOSED]', 'Pack status']));

        $this->get('/countries/botswana/continental?tab=inv&page=3')->assertInertia(fn (Assert $p) => $p->where('sheet', 'I2_Investor_InfoTypes')->where('label', 'Investor info types (4,600)')
            ->where('table.total', 4600)->has('table.rows', 15)->where('table.page', 3)->where('activation', null)->has('tabs', 14));

        $this->get('/countries/botswana/continental?tab=trd')->assertInertia(fn (Assert $p) => $p->where('table.total', 3523));
    }

    public function test_pack_reader_and_data_room(): void
    {
        $this->get('/countries/botswana/pack')->assertInertia(fn (Assert $p) => $p->has('blocks', 636)->where('blocks.0.s', 'Title'));

        $this->get('/countries/botswana/dataroom')->assertInertia(fn (Assert $p) => $p->has('index', 63)->where('totalRows', 49610)->has('coverage.sheets', 63)
            ->where('coverage.sheets.0.s', 'README'));

        $this->get('/countries/botswana/dataroom/BW_Tornado')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/IntelData/Sheet')->where('rowCount', 14)
            ->where('headers.9', 'Col 10')->where('table.rows.0.Col 10', 'Volume'));

        $this->get('/countries/kenya/dataroom/BW_Coverage?sort=12&dir=-1')->assertOk()->assertInertia(fn (Assert $p) => $p->where('rowCount', 10346)->has('table.rows', 20)
            ->where('table.total', 10346)->where('table.sort', 12));

        $this->get('/countries/botswana/dataroom/BW_Coverage?csv=1&f[Unit code]=CE')->assertOk()->assertHeader('content-type', 'text/csv; charset=utf-8');
        $this->get('/countries/botswana/dataroom/NOT_A_SHEET')->assertNotFound();
        $this->get('/countries/atlantis/dataroom')->assertNotFound();
    }
}
