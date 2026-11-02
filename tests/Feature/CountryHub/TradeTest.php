<?php

namespace Tests\Feature\CountryHub;

use App\Models\Sprint;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Import & Export heat maps (prototype pages-trade.js): the hub and the four views on the modelled
 * intra-African trade matrix, all ten HS groups, for every country.
 */
class TradeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);

        // App Sprint records so the trade shelves price by code (prices come only from these rows).
        foreach ([['TBCA-X-0490', 'Export Readiness Score Checklist Sprint', 1100], ['TBCA-G-0002', 'Export Readiness Score Sprint', 1220]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'cty-trade-test-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    public function test_hub_renders_for_botswana_south_africa_and_kenya(): void
    {
        foreach (['botswana' => 'BWA', 'south-africa' => 'ZAF', 'kenya' => 'KEN'] as $slug => $iso) {
            $this->get("/countries/{$slug}/trade")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Trade/Hub')
                ->where('base.c.iso3', $iso)->has('groups', 10)->has('E', 10)->has('M', 10)->has('partners', 53)
                ->has('basis')->has('anchors.bw_imp_from_za')->where('shelf.title', 'Act on the heat map — trade Sprints')->has('shelf.items.0'));
        }
    }

    public function test_africa_views_send_partner_rows_by_product_group(): void
    {
        foreach (['botswana' => 'BWA', 'south-africa' => 'ZAF', 'kenya' => 'KEN'] as $slug => $iso) {
            foreach ([1 => 'import', 3 => 'export'] as $v => $who) {
                $this->get("/countries/{$slug}/trade/{$v}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Trade/View')
                    ->where('base.c.iso3', $iso)->where('view', $v)->where('who', $who)->where('partner', null)->has('rows', 53)->has('rows.0.f', 10)->has('rows.0.base', 10)->missing('pair'));
            }
        }
        // Botswana's largest African supplier is South Africa (the BW anchor).
        $this->get('/countries/botswana/trade/1')->assertInertia(fn (Assert $p) => $p->where('rows.0.iso3', 'ZAF'));
    }

    public function test_partner_views_pick_the_partner_default_and_swap(): void
    {
        $this->get('/countries/botswana/trade/2?partner=KEN')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Trade/View')
            ->where('partner.iso3', 'KEN')->where('who', 'import')->has('pair', 10)->has('pair.0.pot')->missing('rows'));
        $this->get('/countries/kenya/trade/4?partner=BWA')->assertOk()->assertInertia(fn (Assert $p) => $p->where('partner.iso3', 'BWA')->where('who', 'export')->has('pair', 10));
        // Default partner: South Africa, or Botswana when South Africa is selected; the selected country is never its own partner.
        $this->get('/countries/kenya/trade/2')->assertInertia(fn (Assert $p) => $p->where('partner.iso3', 'ZAF'));
        $this->get('/countries/south-africa/trade/4')->assertInertia(fn (Assert $p) => $p->where('partner.iso3', 'BWA'));
        $this->get('/countries/kenya/trade/2?partner=KEN')->assertInertia(fn (Assert $p) => $p->where('partner.iso3', 'ZAF'));
        $this->get('/countries/south-africa/trade/2?partner=atlantis')->assertInertia(fn (Assert $p) => $p->where('partner.iso3', 'BWA'));
        // Headroom is never negative.
        $this->get('/countries/botswana/trade/2?partner=ZAF')->assertInertia(fn (Assert $p) => $p->where('pair', fn ($rows) => collect($rows)->every(fn ($r) => $r['pot'] >= 0)));
        $this->get('/countries/botswana/trade/5')->assertNotFound();
        $this->get('/countries/atlantis/trade')->assertNotFound();
    }
}
