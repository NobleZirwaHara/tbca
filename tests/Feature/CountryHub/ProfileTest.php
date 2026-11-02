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
 * Country Profile & Planning (prototype pages-profile.js): P03 to P16 and P56 for Botswana (full
 * BW-1.0 pack), South Africa (its own branch) and Kenya (the non-BW branch).
 */
class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private const PAGES = [
        'evidence' => 'Evidence', 'availability' => 'Availability', 'catalogue' => 'Catalogue', 'resolver' => 'Resolver', 'impact' => 'Impact',
        'limitations' => 'Limitations', 'tax' => 'Tax', 'payments' => 'Payments', 'language' => 'Language', 'partners' => 'Partners',
        'legal' => 'Legal', 'privacy' => 'Privacy', 'history' => 'History',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);

        // App Sprint records so the country Sprints price by code (prices come only from these rows).
        foreach ([['TBCA-G-0002', 'Export Readiness Score Sprint', 1220], ['TBCA-F-0239', 'VAT Readiness Checklist Sprint', 1500], ['TBCA-D-0187', 'Country Brief Sprint', 900]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'cty-profile-test-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    public function test_every_profile_page_renders_for_botswana_south_africa_and_kenya(): void
    {
        foreach (['botswana' => 'BWA', 'south-africa' => 'ZAF', 'kenya' => 'KEN'] as $slug => $iso) {
            $this->get('/countries/'.$slug)->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Profile/Profile')
                ->where('base.c.iso3', $iso)->where('live', true)->has('shelf.items')->where('shelf.title', 'Start here — country Sprints'));
            foreach (self::PAGES as $path => $page) {
                $this->get("/countries/{$slug}/{$path}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Profile/'.$page)->where('base.c.iso3', $iso));
            }
            $this->get("/countries/{$slug}/service/TBCA-G-0002")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Profile/Service')
                ->where('s.code', 'TBCA-G-0002')->where('s.ep', 1220)->where('s.tiers.2.price', 3660)->where('live', true)->where('vat', $iso === 'BWA' ? 0.14 : 0.15));
        }
        $this->get('/countries/kenya/service/NOT-A-CODE')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Profile/Service')->where('s', null)->where('code', 'NOT-A-CODE'));
        $this->get('/countries/atlantis')->assertNotFound();
    }

    public function test_botswana_pages_carry_the_bw_pack_and_other_countries_the_prototype_branches(): void
    {
        $this->get('/countries/botswana')->assertInertia(fn (Assert $p) => $p->where('summary.facts', 102)->where('summary.validator', '30/30')->has('updates', 6)->where('bench', null));
        $this->get('/countries/kenya')->assertInertia(fn (Assert $p) => $p->where('summary', null)->has('updates', 0));

        $this->get('/countries/botswana/evidence')->assertInertia(fn (Assert $p) => $p->has('bw.all', 129)->has('bw.doms', 18)->has('bw.sources', 90)->has('bw.conflicts', 20)->has('bw.verify', 18));
        $this->get('/countries/south-africa/evidence')->assertInertia(fn (Assert $p) => $p->where('bw', null)->where('base.c.isZA', true));
        $this->get('/countries/botswana/availability')->assertInertia(fn (Assert $p) => $p->has('cats', 9)->has('permits', 18)->where('cats.0.k', 'market-entry')->where('cats.0.a', 138));
        $this->get('/countries/kenya/availability')->assertInertia(fn (Assert $p) => $p->where('permits', null));
        $this->get('/countries/botswana/resolver')->assertInertia(fn (Assert $p) => $p->has('validator', 30)->has('cpds', 12));
        $this->get('/countries/botswana/limitations')->assertInertia(fn (Assert $p) => $p->has('bw.gaps', 16)->has('bw.closed', 5));
        $this->get('/countries/botswana/tax')->assertInertia(fn (Assert $p) => $p->where('bw.f18.Fact ID', 'BW-MAC-F18')->has('bw.fiscal', 4));
        $this->get('/countries/botswana/payments')->assertInertia(fn (Assert $p) => $p->has('bw.fx', 4)->where('bw.f11.Fact ID', 'BW-MAC-F11'));
        $this->get('/countries/botswana/language')->assertInertia(fn (Assert $p) => $p->has('products', 55));
        $this->get('/countries/botswana/partners')->assertInertia(fn (Assert $p) => $p->has('institutions', 50)->where('permits.0.SectorName', 'Energy & Power'));
        $this->get('/countries/botswana/legal')->assertInertia(fn (Assert $p) => $p->has('bw.rules', 4)->has('bw.changes', 14)->has('bw.policy', 44));
        $this->get('/countries/botswana/history')->assertInertia(fn (Assert $p) => $p->has('bw.editions', 9)->has('bw.challenge', 15));
        foreach (['limitations', 'tax', 'legal', 'history'] as $page) {
            $this->get('/countries/kenya/'.$page)->assertInertia(fn (Assert $p) => $p->where('bw', null));
        }
    }

    public function test_catalogue_counts_topic_filter_server_paging_and_csv(): void
    {
        $this->get('/countries/kenya/catalogue')->assertInertia(fn (Assert $p) => $p->where('topic', null)
            ->where('kpi.total', 1814)->where('kpi.a', 1435)->where('kpi.r', 184)->where('kpi.u', 195)->where('table.total', 1814)->has('table.rows', 15));
        $this->get('/countries/kenya/catalogue?topic=tax&q=VAT%20Readiness')->assertInertia(fn (Assert $p) => $p->where('topic', 'tax')->where('table.total', 70)
            ->where('table.rows.0.code', 'TBCA-F-0239')->where('table.rows.0.price', 1500)->where('table.rows.0.avail', 'Available'));
        $this->get('/countries/kenya/catalogue?topic=bogus')->assertInertia(fn (Assert $p) => $p->where('topic', null));
        $csv = $this->get('/countries/botswana/catalogue?csv=1&topic=tax')->assertOk();
        $this->assertStringContainsString('TBCA-F-0239', $csv->streamedContent());
    }

    public function test_impact_compares_with_a_default_or_chosen_country(): void
    {
        $this->get('/countries/botswana/impact')->assertInertia(fn (Assert $p) => $p->where('o.iso3', 'KEN')->where('bench', null)->where('a.svc', '1,435 of 1,814'));
        $this->get('/countries/south-africa/impact')->assertInertia(fn (Assert $p) => $p->where('o.iso3', 'BWA')->has('bench', 9)->where('b.pay', 'Methods resolved (pula, crawling peg)'));
        $this->get('/countries/kenya/impact?with=ghana')->assertInertia(fn (Assert $p) => $p->where('o.iso3', 'GHA')->where('bench', null));
        $this->get('/countries/kenya/impact?with=nowhere')->assertInertia(fn (Assert $p) => $p->where('o.iso3', 'KEN'));
    }

    public function test_save_stores_the_country_in_saved_items(): void
    {
        $this->get('/countries/botswana')->assertInertia(fn (Assert $p) => $p->where('saved', []));
        $this->postJson('/countries/state', ['key' => 'saved', 'value' => ['BWA']])->assertNoContent();
        $this->postJson('/countries/state', ['key' => 'saved', 'value' => ['BWA', 'KEN']])->assertNoContent();
        $this->get('/countries/kenya')->assertInertia(fn (Assert $p) => $p->where('saved', ['BWA', 'KEN']));
    }
}
