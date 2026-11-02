<?php

namespace Tests\Feature\Aiim;

use App\Models\Aiim\SavedItem;
use App\Models\Sprint;
use App\Models\User;
use App\Support\Aiim\Catalogue;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\AiimSeeder;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * AIIM search and object pages rebuilt from the "TBCA AIIM Botswana" prototype (mock-ups 7 to 16)
 * plus the leads centre, the HS code mapper and the investor and trader information types.
 * Botswana carries the BW-1.0 registers; other countries keep the app's own records.
 */
class SearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([AiimSeeder::class, IndustriesSeeder::class, CountryHubSeeder::class]);
        // Prices come only from app Sprint records matched by code.
        foreach ([['AAB-EMB-139', 'Opportunity card full record', 2850], ['AAB-EMB-188', 'Investor Matching Agent run', 1750]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'aiim-search-test-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2]]]);
        }
        IndustryData::forget();
    }

    public function test_search_pages_default_to_botswana_with_the_prototype_registers(): void
    {
        $this->get('/aiim/opportunities')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Opportunities')
            ->where('country', 'botswana')->has('countries', 54)->has('kpi', 6)->has('top30', 30)
            ->where('priority.total', 321)->has('priority.rows', 25)->where('register.total', 610)->where('issue2.total', 744)
            ->has('rail.items')->has('facts'));

        $this->get('/aiim/projects')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Projects')
            ->has('precedents', 18)->has('hotspots', 42)->has('d4'));

        $this->get('/aiim/investors')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Investors')
            ->has('personas', 6)->where('personas.0.code', 'SME')->has('strategic', 6)->has('finFacts')->where('matching.price', 1750));

        $this->get('/aiim/funders')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Funders')
            ->has('funders', 12)->where('funders.0.code', 'CEDA')->has('envelopes', 16)->has('policy', 44)->has('gaps', 16));

        $this->get('/aiim/corridors')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Corridors')
            ->has('corridors', 7)->has('map.geo.districts')->has('map.gateways', 6)->has('d2')->has('transport'));
    }

    public function test_big_registers_are_paged_on_the_server_per_table(): void
    {
        $this->get('/aiim/opportunities?prpage=1&prf[Sector]=MIN&obsize=50')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('priority.f.Sector', 'MIN')->where('priority.count', fn ($n) => $n > 0 && $n < 321)->where('priority.page', fn ($n) => $n <= 1)
            ->where('register.size', 50)->has('register.rows', 50)->where('issue2.page', 0));

        $this->get('/aiim/opportunities?prq=copper')->assertInertia(fn (Assert $p) => $p->where('priority.q', 'copper')->where('priority.count', fn ($n) => $n > 0 && $n < 321));

        $this->get('/aiim/country/botswana/leads?rlpage=2&cvf[Tier]=A%2B')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Leads')
            ->where('bw', true)->where('ranked.total', 2137)->where('ranked.page', 2)->where('coverage.total', 10346)->where('coverage.f.Tier', 'A+')
            ->has('hotLeads', 126)->has('partG')->has('g3', 6));
    }

    public function test_botswana_object_pages(): void
    {
        $this->get('/aiim/opportunities/BW-CSP-S01')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Opportunity')
            ->where('id', 'BW-CSP-S01')->where('score.score', 12)->where('score.ra', 11)->where('sector.code', 'CSP')->has('ranked', 2)->has('map.towns')
            ->where('unlock.price', 2850)->where('policy.Code', 'EVENTS')->has('facts.BW-CSP-F1'));
        $this->get('/aiim/opportunities/PP-01')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Opportunity')->where('kindLabel', 'Issue 2.0')->where('score', null));
        $this->get('/aiim/opportunities/BW-XXX-S99')->assertNotFound();

        $this->get('/aiim/projects/P-02')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Project')->where('kind', 'precedent')->where('sector.code', 'MIN')->has('templates'));
        $this->get('/aiim/projects/H0')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Project')->where('kind', 'hotspot')->where('hotspot.Hotspot', 'Debswana Jwaneng mine')->has('leads')->has('map.hot', 42));
        $this->get('/aiim/projects/H99')->assertNotFound();

        $this->get('/aiim/investors/CORP')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Investor')->where('code', 'CORP')->where('name', 'Strategic corporate')->has('templates')->has('units'));
        $this->get('/aiim/investors/corp')->assertOk()->assertInertia(fn (Assert $p) => $p->where('code', 'CORP'));
        $this->get('/aiim/funders/CEDA')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Funder')->where('code', 'CEDA')->has('factRows')->has('templates'));
        $this->get('/aiim/corridors/KAZ')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Corridor')->where('corridor.id', 'KAZ')->where('gateway.i', 0)->where('policy.Code', 'KAZUNGULA')->has('catchment'));
        $this->get('/aiim/corridors/ZZZ')->assertNotFound();
    }

    public function test_other_countries_keep_the_app_records(): void
    {
        $this->get('/aiim/opportunities?country=south-africa')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Search')
            ->where('country', 'south-africa')->where('results.total', fn ($n) => $n > 0)->where('packLoading', false));
        $this->get('/aiim/opportunities?country=malawi')->assertOk()->assertInertia(fn (Assert $p) => $p->where('results.total', 17));
        $this->get('/aiim/projects?country=chad')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Search')->where('results.total', 0)->where('packLoading', true));
        $this->get('/aiim/projects?country=all')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Search')->where('results.total', fn ($n) => $n > 0));

        $this->get('/aiim/investors?country=south-africa')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/OrgSearch')->where('results.total', fn ($n) => $n > 0));
        $this->get('/aiim/funders?country=kenya')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/OrgSearch')->where('results.total', 0)->where('packLoading', true));
        $this->get('/aiim/corridors?country=namibia')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/CorridorSearch')->where('results.total', fn ($n) => $n >= 1));

        $this->get('/aiim/opportunities/lilongwe-cement-grinding-bagging-station-600-ktpa')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/OpportunityShow'));
        $org = \App\Models\Aiim\Organisation::query()->where('kind', 'investor')->firstOrFail();
        $this->get("/aiim/investors/{$org->slug}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/OrgShow'));
        $corr = \App\Models\Aiim\Corridor::query()->firstOrFail();
        $this->get("/aiim/corridors/{$corr->slug}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/CorridorShow'));
    }

    public function test_country_pages_for_botswana_and_another_country(): void
    {
        $this->get('/aiim/country/botswana/leads/BW-HL-0001')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Lead')->where('lead.Lead ID', 'BW-HL-0001')->has('brief'));
        $this->get('/aiim/country/botswana/leads/NOPE')->assertNotFound();
        $this->get('/aiim/country/botswana/hs')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Hs')->where('bw', true)->has('groups')->has('commodities', 85));
        $this->get('/aiim/country/botswana/hs/'.rawurlencode('Rough diamonds (gem)'))->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/HsProduct')
            ->where('hs', '7102.31')->where('product.Setswana [VERIFY]', 'Diamane')->has('rows'));
        $this->get('/aiim/country/botswana/investor-questions?bwf[Sector]=ENR')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/InvestorQuestions')
            ->has('chain', 45)->where('bwRows.total', 18810)->where('bwRows.f.Sector', 'ENR')->has('bwRows.rows', 20)->where('i2Rows.total', 4600)->has('assets', 97));
        $this->get('/aiim/country/botswana/trader-questions')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/TraderQuestions')
            ->has('chain', 40)->where('bwRows.total', 5600)->where('i2Rows.total', 3523));

        $this->get('/aiim/country/kenya/leads')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Leads')->where('bw', false)->where('c.name', 'Kenya'));
        $this->get('/aiim/country/kenya/leads/BW-HL-0001')->assertOk()->assertInertia(fn (Assert $p) => $p->where('lead', null));
        $this->get('/aiim/country/kenya/hs')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/Hs')->where('bw', false)->has('groups', 0)->has('commodities', 85));
        $this->get('/aiim/country/kenya/hs/'.rawurlencode('Maize (white/yellow)'))->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Intel/HsProduct')->where('product', null)->has('rows'));
        $this->get('/aiim/country/kenya/investor-questions')->assertOk()->assertInertia(fn (Assert $p) => $p->where('bw', false)->where('bwRows', null)->where('i2Rows.total', 4600));
        $this->get('/aiim/country/kenya/trader-questions')->assertOk()->assertInertia(fn (Assert $p) => $p->where('bw', false)->where('bwRows', null)->where('i2Rows.total', 3523));
        $this->get('/aiim/country/atlantis/leads')->assertNotFound();
    }

    public function test_botswana_objects_work_with_save_watch_compare_and_fees(): void
    {
        foreach ([['opportunity', 'BW-CSP-S01'], ['opportunity', 'PP-01'], ['project', 'H0'], ['project', 'P-02'], ['investor', 'CORP'], ['funder', 'CEDA'], ['corridor', 'KAZ'],
            ['place', 'T15783'], ['unit', 'GA'], ['lead', 'BW-HL-0001'], ['product', 'Rough diamonds (gem)']] as [$type, $key]) {
            $card = Catalogue::card($type, $key);
            $this->assertNotNull($card, "$type $key");
            $this->assertSame($key, $card['key']);
            $this->assertTrue($card['bw']);
            $this->assertNotSame('#', $card['url']);
        }
        $this->assertNull(Catalogue::card('opportunity', 'BW-XXX-S99'));
        $this->assertContains('place', Catalogue::TYPES);

        $user = User::factory()->create();
        $this->actingAs($user);
        $this->from('/aiim/opportunities/BW-CSP-S01')->post('/aiim/workspace/items', ['list' => 'saved', 'type' => 'opportunity', 'key' => 'BW-CSP-S01'])->assertRedirect();
        $this->from('/aiim/projects/H0')->post('/aiim/workspace/items', ['list' => 'watchlist', 'type' => 'project', 'key' => 'H0'])->assertRedirect();
        $this->post('/aiim/workspace/items', ['list' => 'saved', 'type' => 'unit', 'key' => 'GA'])->assertRedirect();
        $this->assertSame(3, SavedItem::query()->where('user_id', $user->id)->count());
        $this->assertSame('Event management (World Athletics Relays legacy)', SavedItem::query()->where('entity_key', 'BW-CSP-S01')->value('label'));

        $this->get('/aiim/opportunities/BW-CSP-S01')->assertInertia(fn (Assert $p) => $p->where('saved', fn ($s) => collect($s)->contains('saved:opportunity:BW-CSP-S01')));

        $this->post('/aiim/workspace/compare/items', ['type' => 'corridor', 'key' => 'KAZ'])->assertRedirect();
        $this->post('/aiim/fees/items', ['type' => 'funder', 'key' => 'CEDA'])->assertRedirect('/aiim/fees/discover');
    }
}
