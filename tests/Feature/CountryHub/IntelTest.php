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
 * Intelligence (AIIM) part 1 (prototype pages-intel.js): Economy & Macro, 18 Sectors, sector pages,
 * Opportunities, the opportunity page, Geography & Places with the Botswana map, unit and place
 * profiles and Ranked Leads. Botswana carries BW-1.0; other countries follow the non-BW branches.
 */
class IntelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);

        foreach ([['TBCA-D-0187', 'Country Market Brief Checklist Sprint', 900], ['TBCA-F-0229', 'Funding Readiness Score Sprint', 1500], ['TBCA-G-0002', 'Export Readiness Score Sprint', 1220]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'cty-intel-test-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    public function test_every_route_renders_for_botswana_south_africa_and_kenya(): void
    {
        $paths = ['economy', 'sectors', 'sector/TRD', 'opps', 'opps?tab=priority', 'opps?tab=register', 'opps?tab=persona', 'opps?tab=downturn', 'opp/BW-ENR-S01',
            'geo', 'geo?metric=tierA', 'geo/unit/CE', 'geo/town/T15783', 'geo/town/UJW', 'leads', 'leads?tab=hotspot', 'leads?tab=coverage', 'leads?tab=envelopes'];
        foreach (['botswana' => 'BWA', 'south-africa' => 'ZAF', 'kenya' => 'KEN'] as $slug => $iso) {
            foreach ($paths as $path) {
                $this->get("/countries/{$slug}/{$path}")->assertOk()->assertInertia(fn (Assert $p) => $p->where('base.c.iso3', $iso));
            }
        }
    }

    public function test_botswana_pages_carry_the_bw_pack(): void
    {
        $this->get('/countries/botswana/economy')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Economy')->where('bw', true)
            ->has('macro', 27)->has('fxScen', 4)->has('benchmark', 9)->has('freshness', 9)->where('doc.0.x', 'A-2 Macro fact base')->has('shelf.items.0'));
        $this->get('/countries/botswana/sectors')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Sectors')->has('cards', 18)->has('shocks', 19)
            ->where('cards.0.code', 'ENR')->where('cards.0.index', 5));
        $this->get('/countries/botswana/sector/trd')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Sector')->where('code', 'TRD')
            ->where('shock.Sector', 'TRD')->has('pri', 16)->has('sect', 18)->where('doc.0.x', 'E16. Trade, Retail & Citizen Markets (TRD)'));
        $this->get('/countries/botswana/opps')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Opps')->where('tab', 'top30')->has('data', 30)->where('kpi.templates', 321));
        $this->get('/countries/botswana/opps?tab=priority')->assertInertia(fn (Assert $p) => $p->where('tab', 'priority')->has('data', 321));
        $this->get('/countries/botswana/opps?tab=register')->assertInertia(fn (Assert $p) => $p->where('tab', 'register')->where('table.total', 610)->has('table.rows', 15));
        $this->get('/countries/botswana/opps?tab=register&csv=1')->assertOk()->assertHeader('content-type', 'text/csv; charset=utf-8');
        $this->get('/countries/botswana/opps?tab=persona')->assertInertia(fn (Assert $p) => $p->has('data', 6)->has('data.0.rows', 5));
        $this->get('/countries/botswana/opps?tab=downturn')->assertInertia(fn (Assert $p) => $p->has('data', 86));
        $this->get('/countries/botswana/geo?metric=env')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Geo')->where('metric', 'env')
            ->has('geo.districts')->has('geo.rail')->missing('geo.places')->has('units', 16)->has('towns', 83)->has('gateways', 6)->has('hotspots', 42));
        $this->get('/countries/botswana/geo?metric=bogus')->assertInertia(fn (Assert $p) => $p->where('metric', 'pop'));
        $this->get('/countries/botswana/geo/unit/CE')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Unit')->where('u.Unit', 'Central')
            ->has('leads', 266)->where('covCount', 4455));
        $this->get('/countries/botswana/geo/town/UJW')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Town')->where('t.Place', 'Jwaneng (council point)'));
    }

    public function test_ranked_leads_and_coverage_are_paged_on_the_server(): void
    {
        $this->get('/countries/botswana/leads')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Leads')->where('tab', 'ranked')
            ->where('table.total', 2137)->where('table.count', 2137)->has('table.rows', 15)->where('rows', null));
        $this->get('/countries/botswana/leads?f[Unit]=Central&size=50&page=1')->assertInertia(fn (Assert $p) => $p->where('table.count', 266)->where('table.page', 1)->has('table.rows', 50));
        $this->get('/countries/botswana/leads?tab=coverage&q=Gobojango')->assertInertia(fn (Assert $p) => $p->where('table.total', 10346)->where('table.rows.0.Place', 'Gobojango'));
        $this->get('/countries/botswana/leads?tab=coverage&csv=1')->assertOk()->assertHeader('content-type', 'text/csv; charset=utf-8');
        $this->get('/countries/botswana/leads?tab=hotspot')->assertInertia(fn (Assert $p) => $p->has('rows', 126)->where('table', null));
        $this->get('/countries/botswana/leads?tab=envelopes')->assertInertia(fn (Assert $p) => $p->has('rows', 16));
    }

    public function test_other_countries_follow_the_prototype_branches(): void
    {
        foreach (['kenya', 'south-africa'] as $slug) {
            foreach (['sectors' => 'sectors', 'sector/TRD' => 'sectors', 'opps' => 'opps', 'geo' => 'geo', 'leads' => 'leads'] as $path => $key) {
                $this->get("/countries/{$slug}/{$path}")->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/BwOnly')->where('pageKey', $key)->missing('geo'));
            }
        }
        $this->get('/countries/kenya/sector/TRD')->assertInertia(fn (Assert $p) => $p->where('title', 'Trade, Retail & Citizen Markets'));
        // Economy: the benchmark card where BW_Benchmark has a column, else only the pack panel.
        $this->get('/countries/kenya/economy')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Economy')->where('bw', false)->where('bench', null));
        $this->get('/countries/south-africa/economy')->assertInertia(fn (Assert $p) => $p->where('bw', false)->has('bench', 9)->where('bench.1.0', 'Policy rate'));
        // Opportunity, unit and place pages show the Botswana record under any country, as in the prototype.
        $this->get('/countries/kenya/opp/BW-ENR-S01')->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Opp')->where('found', true)->where('all.Opp ID', 'BW-ENR-S01'));
    }

    public function test_opportunity_page_and_save_action(): void
    {
        $this->get('/countries/botswana/opp/BW-CSP-S01')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Intel/Opp')
            ->where('found', true)->where('all.Rank', 1)->where('all.Tier', 'A+')->where('sectorName', 'Creative, Sport & Professional Services')
            ->where('fact.Fact ID', 'BW-CSP-F1')->has('leads')->where('saved', false));
        $this->get('/countries/botswana/opp/NOPE-1')->assertOk()->assertInertia(fn (Assert $p) => $p->where('found', false)->where('id', 'NOPE-1'));

        // The Save button stores the opportunity in the visitor's saved list (prototype S.saved).
        $this->postJson('/countries/state', ['key' => 'saved', 'value' => ['BW-CSP-S01']])->assertNoContent();
        $this->get('/countries/botswana/opp/BW-CSP-S01')->assertInertia(fn (Assert $p) => $p->where('saved', true)->where('savedList', ['BW-CSP-S01']));
    }

    public function test_unknown_codes_return_not_found(): void
    {
        $this->get('/countries/botswana/sector/XYZ')->assertNotFound();
        $this->get('/countries/botswana/geo/unit/ZZ')->assertNotFound();
        $this->get('/countries/botswana/geo/town/T0')->assertNotFound();
        $this->get('/countries/atlantis/economy')->assertNotFound();
    }
}
