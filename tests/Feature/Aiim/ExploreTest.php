<?php

namespace Tests\Feature\Aiim;

use App\Models\BasketItem;
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
 * Explore pages rebuilt from the "TBCA AIIM Botswana" prototype: landing (1), cockpit (2), units (3),
 * unit profile (4), sectors (5, 6), risk (17), evidence (18), Map View, town profile and unit economics.
 */
class ExploreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);
        $this->seed(AiimSeeder::class);
        // Prices come only from app Sprint records matched by service code.
        Sprint::create(['code' => 'AAB-EMB-192', 'slug' => 'explore-test-192', 'title' => 'Country Investment Brief', 'type' => 'sprint', 'category' => 'research-reports', 'summary' => 'x', 'description' => 'x',
            'price_zar' => 3100, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => 3100], ['key' => 'standard', 'name' => 'Standard', 'zar' => 4650]]]);
        IndustryData::forget();
    }

    public function test_landing_lists_54_countries_with_rollout_and_priced_actions(): void
    {
        $this->get('/aiim')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Landing')
            ->has('countries', 54)->has('coverage', 54)->has('rollout', 4)->has('regions', 5)->has('top30', 5)->has('actions', 5)
            ->where('countries', fn ($c) => collect($c)->firstWhere('iso3', 'BWA')['state'] === 'live' && collect($c)->firstWhere('iso3', 'ZAF')['state'] === 'issued')
            ->where('actions.0.code', 'AAB-EMB-192')->where('actions.0.from', 3100)->where('actions.0.inApp', true)
            ->where('actions.1.inApp', false)->where('actions.1.from', null));
    }

    public function test_botswana_cockpit_carries_the_pack_and_other_countries_use_the_template(): void
    {
        $this->get('/aiim/country/botswana')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Cockpit')
            ->where('intel', null)
            ->where('bw.summary.Sweep templates', 321)
            ->has('bw.topUnits', 9)->has('bw.sectors', 8)->has('bw.headline', 14)->has('bw.map.units', 16)->has('bw.map.towns', 83)->has('bw.map.hotspots', 42)
            ->where('bw.map.geo', fn ($g) => is_string($g) && str_contains($g, 'districts'))
            ->where('bw.briefs.0.from', 3100)->has('bw.rail', 6)->has('bw.partA')->where('fees', 0));

        // Deep links to the drill-down explorer still load it for Botswana.
        $this->get('/aiim/country/botswana?tab=map&unit=gaborone')->assertOk()->assertInertia(fn (Assert $p) => $p->where('initialTab', 'map')->where('initialUnit', 'gaborone')->has('intel.units', 99)->has('bw'));

        $this->get('/aiim/country/south-africa')->assertOk()->assertInertia(fn (Assert $p) => $p->where('bw', null)->has('content.kpis')->has('intel.units')->has('provinces', 9)->has('benchmark', 9));
        $this->get('/aiim/country/malawi')->assertOk()->assertInertia(fn (Assert $p) => $p->where('bw', null)->where('content', null)->where('intel.coverage.projects', 17)->has('benchmark', 9));
        $this->get('/aiim/country/chad')->assertOk()->assertInertia(fn (Assert $p) => $p->where('bw', null)->has('intel.units', 0)->where('benchmark', null));
        $this->get('/aiim/country/atlantis')->assertNotFound();
    }

    public function test_unit_selector_for_botswana_south_africa_and_others(): void
    {
        $this->get('/aiim/country/botswana/provinces')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Provinces')->where('mode', 'bw')
            ->has('bw.cards', 16)->where('bw.cards.0.code', 'CE')->has('bw.units.rows', 16)->has('bw.envelopes.rows', 16)->has('bw.institutions.rows', 50));
        $this->get('/aiim/country/south-africa/provinces')->assertOk()->assertInertia(fn (Assert $p) => $p->where('mode', 'sa')->has('sa.provinces', 9));
        $this->get('/aiim/country/malawi/provinces')->assertOk()->assertInertia(fn (Assert $p) => $p->where('mode', 'units')->has('units', 3));
        $this->get('/aiim/country/chad/provinces')->assertOk()->assertInertia(fn (Assert $p) => $p->where('mode', 'none')->has('units', 0));
    }

    public function test_unit_profile_resolves_botswana_codes_and_south_african_provinces(): void
    {
        foreach (['GA', 'ga', 'bw-ga', 'gaborone'] as $key) {
            $this->get("/aiim/province/{$key}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Province')->where('mode', 'bw')
                ->where('unit.code', 'GA')->where('unit.pop', 246325)->has('towns', 1)->has('ranked')->has('rail', 5)->where('map.geo', fn ($g) => str_contains($g, 'rivers')));
        }
        $this->get('/aiim/province/CH')->assertOk()->assertInertia(fn (Assert $p) => $p->where('unit.code', 'CH'));
        $this->get('/aiim/province/gauteng')->assertOk()->assertInertia(fn (Assert $p) => $p->where('mode', 'sa')->where('province.slug', 'gauteng'));
        $this->get('/aiim/province/zz')->assertNotFound();
    }

    public function test_sector_selector_and_profile(): void
    {
        $this->get('/aiim/sectors')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Sectors')->where('mode', 'bw')->has('cards', 18)->has('shocks', 19)->has('scoreboard'));
        $this->get('/aiim/sectors?province=gauteng')->assertOk()->assertInertia(fn (Assert $p) => $p->where('mode', 'sa')->where('province.slug', 'gauteng'));

        $this->get('/aiim/sector/ICT')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Sector')->where('mode', 'bw')->where('code', 'ICT')->where('n', 10)
            ->has('sweep.rows', 17)->has('facts', 5)->has('anchors', 4)->has('worked')->has('heat')->has('rail'));
        $this->get('/aiim/sector/bw-min')->assertOk()->assertInertia(fn (Assert $p) => $p->where('code', 'MIN')->has('premium', 2));
        $this->get('/aiim/sector/energy')->assertOk()->assertInertia(fn (Assert $p) => $p->where('mode', 'sa')->where('sector.slug', 'energy'));
        $this->get('/aiim/sector/XYZ')->assertNotFound();
    }

    public function test_risk_and_evidence_pages(): void
    {
        $this->get('/aiim/risk?tab=gaps')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Risk')->where('ready', true)->where('initialTab', 'gaps')
            ->has('risk.shocks', 19)->has('risk.sheets.BW_DataGaps.rows', 16)->has('risk.sheets.BW_FX.rows', 4)->has('risk.downturn')->has('risk.rail', 8));

        $this->get('/aiim/sources/SRC-TBCA-BW-PACK-1.0')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Source')
            ->where('source.code', 'SRC-TBCA-BW-PACK-1.0')->has('evidence.facts.rows', 102)->has('evidence.sources.rows', 90)->has('evidence.validator.rows', 30)
            ->where('evidence.grades.3', 98)->where('fact', null));
        $this->get('/aiim/sources/IMF-WEO-2025-04?fact=BW-MAC-F1')->assertOk()->assertInertia(fn (Assert $p) => $p->where('source.code', 'IMF-WEO-2025-04')
            ->where('fact.fact.Fact ID', 'BW-MAC-F1')->has('evidence.facts.rows', 102));
        $this->get('/aiim/sources/IMF-WEO-2025-04?fact=BW-NOPE-F9')->assertOk()->assertInertia(fn (Assert $p) => $p->where('fact.missing', 'BW-NOPE-F9'));
        $this->get('/aiim/methodology')->assertOk();
    }

    public function test_map_view_with_cards_for_each_drill_level(): void
    {
        $this->get('/aiim/country/botswana/map?focus=GA')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Geo/Map')->where('focus', 'GA')
            ->has('bw.map.units', 16)->where('bw.filters', fn ($f) => count(json_decode($f, true)['rl']) === 2137)
            ->has('bw.mapstack.rows', 90)->has('bw.layers.rows')->has('bw.rail', 8)->where('card', null));

        $this->get('/aiim/country/botswana/map?sel=unit:GA')->assertOk()->assertInertia(fn (Assert $p) => $p->where('card.type', 'unit')->where('card.code', 'GA'));
        $this->get('/aiim/country/botswana/map?sel=town:T15729')->assertOk()->assertInertia(fn (Assert $p) => $p->where('card.type', 'town')->where('card.name', 'Bokaa')->has('card.top'));
        $this->get('/aiim/country/botswana/map?sel=hot:0')->assertOk()->assertInertia(fn (Assert $p) => $p->where('card.type', 'hot')->has('card.leadRows'));
        $this->get('/aiim/country/botswana/map?sel=gw:1')->assertOk()->assertInertia(fn (Assert $p) => $p->where('card.type', 'gw')->has('card.towns'));
        $this->get('/aiim/country/botswana/map?sel=town:NOPE')->assertOk()->assertInertia(fn (Assert $p) => $p->where('card', null));

        // A click reloads the card alone.
        $version = $this->get('/aiim')->viewData('page')['version'] ?? '';
        $this->get('/aiim/country/botswana/map?sel=unit:KW', ['X-Inertia' => 'true', 'X-Inertia-Version' => $version, 'X-Inertia-Partial-Component' => 'Aiim/Geo/Map', 'X-Inertia-Partial-Data' => 'card,sel'])
            ->assertOk()->assertJsonPath('props.card.code', 'KW')->assertJsonMissingPath('props.bw');

        $this->get('/aiim/country/malawi/map')->assertOk()->assertInertia(fn (Assert $p) => $p->where('bw', null)->where('intel.coverage.projects', 17));
        $this->get('/aiim/country/chad/map')->assertOk()->assertInertia(fn (Assert $p) => $p->where('bw', null)->where('intel', null));
    }

    public function test_town_and_unit_economics(): void
    {
        $this->get('/aiim/country/botswana/towns/T15729')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Geo/Town')
            ->where('town.id', 'T15729')->where('town.unit', 'KL')->has('coverage', 106)->has('ranked', 50)->where('brief.from', null));
        $this->get('/aiim/country/botswana/towns/NOPE')->assertNotFound();
        $this->get('/aiim/country/chad/towns/T15729')->assertOk()->assertInertia(fn (Assert $p) => $p->where('town', null));

        $this->get('/aiim/country/botswana/economics')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Geo/Economics')
            ->has('eco.ue.rows', 14)->has('eco.tornado', 14)->has('eco.numbers')->has('eco.fx.rows', 4));
        $this->get('/aiim/country/kenya/economics')->assertOk()->assertInertia(fn (Assert $p) => $p->where('eco', null));
    }

    public function test_service_add_and_save_actions_used_by_the_pages(): void
    {
        // "Get the Brief" / "Add": the embedded service goes into the basket at the app's Sprint price.
        $this->from('/aiim/country/botswana')->post('/basket', ['item_type' => 'aiim-service', 'item_code' => 'AAB-EMB-192', 'name' => 'Country Investment Brief (Botswana Country Investment Brief)',
            'variant' => 'Basic', 'unit_zar' => 3100, 'commercial_act' => 'purchase', 'meta' => ['section' => 'aiim', 'country' => 'botswana']])->assertRedirect('/aiim/country/botswana');
        $this->assertSame(1, BasketItem::query()->where('item_code', 'AAB-EMB-192')->where('unit_zar', 3100)->count());

        // "Save" on a unit, town, sector or cockpit uses the site's saved items (signed in).
        $this->post('/saved', ['item_type' => 'aiim-unit', 'item_key' => 'BW-GA', 'label' => 'Gaborone', 'url' => '/aiim/province/GA'])->assertRedirect('/login');
        $user = User::factory()->create();
        $this->actingAs($user)->from('/aiim/province/GA')->post('/saved', ['item_type' => 'aiim-unit', 'item_key' => 'BW-GA', 'label' => 'Gaborone', 'url' => '/aiim/province/GA'])->assertRedirect('/aiim/province/GA');
        $this->assertSame(1, $user->savedItems()->where('item_key', 'BW-GA')->count());
    }
}
