<?php

namespace Tests\Feature\CountryHub;

use App\Models\Sprint;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Market Entry Journey P17 to P26 (prototype pages-journey.js). */
class JourneyTest extends TestCase
{
    use RefreshDatabase;

    private const PAGES = [
        'readiness' => 'Readiness', 'landing' => 'Landing', 'localisation' => 'Localisation', 'paylocal' => 'PayLocal', 'langpack' => 'LangPack',
        'compliance' => 'Compliance', 'launch' => 'Launch', 'audit' => 'Audit', 'diaspora' => 'Diaspora', 'exit' => 'Exit',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);
        foreach ([['TBCA-X-1690', 'Market Entry Retainer Sprint', 10600], ['TBCA-G-0002', 'Export Readiness Score Sprint', 1220]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'cty-journey-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    public function test_every_journey_page_renders_for_three_countries(): void
    {
        foreach (['botswana', 'south-africa', 'kenya'] as $c) {
            foreach (self::PAGES as $key => $component) {
                $this->get("/countries/{$c}/{$key}")->assertOk()
                    ->assertInertia(fn (Assert $p) => $p->component('CountryHub/Journey/'.$component)->where('base.c.slug', $c));
            }
        }
    }

    public function test_botswana_pages_carry_the_pack_data(): void
    {
        $this->get('/countries/botswana/readiness')->assertInertia(fn (Assert $p) => $p->has('req', 16)->has('vals', 16)->where('stateKey', 'plan.ready-bwa')->where('vals.0', 1)->where('vals.15', 0));

        $this->get('/countries/botswana/landing?sector=AGR&persona=SME')->assertInertia(fn (Assert $p) => $p->where('pack', true)->where('sector', 'AGR')->where('persona', 'SME')
            ->where('count', 175)->where('top.place', 'Kanye')->where('top.a', 7)->has('places', 14)->has('envelopes', 16)
            ->has('map.geo.districts')->has('map.units', 16)->has('map.towns', 83)->has('map.gateways', 6)->has('map.hotspots', 42));
        $this->get('/countries/botswana/landing?sector=NOPE')->assertInertia(fn (Assert $p) => $p->where('sector', 'ALL')->where('count', 2137));

        $this->get('/countries/botswana/compliance?sector=ENR')->assertInertia(fn (Assert $p) => $p->where('sector', 'ENR')->where('permit.items', ['Generation licence', 'PPA', 'EIA'])
            ->where('permit.lo', 6)->where('permit.hi', 18)->has('changes', 1)->has('rules', 4)->where('rules.0.Fact ID', 'BW-MAC-F20'));
        $this->get('/countries/botswana/compliance')->assertInertia(fn (Assert $p) => $p->where('sector', 'MIN'));

        $this->get('/countries/botswana/audit')->assertInertia(fn (Assert $p) => $p->has('items', 129)->where('score', 89)
            ->where('cnt', ['current' => 115, 'ageing' => 7, 'out' => 7])->where('verified', 18));
        $this->get('/countries/botswana/diaspora')->assertInertia(fn (Assert $p) => $p->has('fxOpps', 3)->has('precedents', 18)->where('tou.Fact ID', 'BW-TOU-F2'));
        $this->get('/countries/botswana/launch')->assertInertia(fn (Assert $p) => $p->has('plan90', 6));
        $this->get('/countries/botswana/localisation')->assertInertia(fn (Assert $p) => $p->where('products.count', 55)->has('products.rows', 8));
        $this->get('/countries/botswana/langpack')->assertInertia(fn (Assert $p) => $p->where('pending', 55));
    }

    public function test_other_countries_get_the_pack_loading_panel(): void
    {
        foreach (['landing', 'compliance', 'audit', 'diaspora'] as $key) {
            $this->get("/countries/kenya/{$key}")->assertInertia(fn (Assert $p) => $p->where('pack', false));
        }
        $this->get('/countries/south-africa/diaspora')->assertInertia(fn (Assert $p) => $p->where('pack', true)->missing('fxOpps'));
        $this->get('/countries/kenya/launch')->assertInertia(fn (Assert $p) => $p->where('plan90', null));
        $this->get('/countries/nowhere/readiness')->assertNotFound();
    }

    public function test_readiness_answers_persist_through_country_state(): void
    {
        $vals = array_fill(0, 16, 1);
        $vals[3] = 0.5;
        $this->postJson('/countries/state', ['key' => 'plan.ready-bwa', 'value' => $vals])->assertNoContent();
        $this->get('/countries/botswana/readiness')->assertInertia(fn (Assert $p) => $p->where('vals.3', 0.5)->where('vals.15', 1));

        // A malformed answer set falls back to the defaults.
        $this->postJson('/countries/state', ['key' => 'plan.ready-bwa', 'value' => [1, 2]])->assertNoContent();
        $this->get('/countries/botswana/readiness')->assertInertia(fn (Assert $p) => $p->where('vals.15', 0));
    }
}
