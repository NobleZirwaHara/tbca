<?php

namespace Tests\Feature;

use App\Models\Aiim\AdminUnit;
use App\Models\Aiim\Country;
use App\Models\Aiim\OpportunityTemplate;
use App\Models\Aiim\Project;
use App\Support\Aiim\ProjectBriefs;
use Database\Seeders\Sections\AiimSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AiimGeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AiimSeeder::class);
    }

    public function test_all_54_countries_carry_activation_and_outline(): void
    {
        $this->assertSame(54, Country::count());
        $this->assertSame(0, Country::query()->whereNull('activation_wave')->count());
        $this->assertSame(0, Country::query()->whereNull('outline')->count());
        $this->assertSame('Pack loaded', Country::query()->where('iso2', 'BW')->value('pack_status'));
    }

    public function test_project_briefs_are_loaded_with_zar_amounts_and_locations(): void
    {
        $this->assertSame(26, Project::query()->whereIn('screening_status', ['QUALIFIED', 'WATCHLIST'])->count());
        $this->assertSame(54, Project::query()->whereNotNull('screening_status')->count());

        $cement = Project::query()->where('code', 'MW-IND-01')->firstOrFail();
        $this->assertSame('MW', $cement->country_iso2);
        $this->assertSame((int) round(52 * 1_000_000 * ProjectBriefs::ZAR_PER_USD), $cement->capex_zar);
        $this->assertSame('USD', $cement->screening['currency']);
        $this->assertSame('Kanengo Industrial Area', AdminUnit::query()->find($cement->admin_unit_id)?->name);

        $hemp = Project::query()->where('code', 'ZA-AGR-03')->firstOrFail();
        $this->assertTrue($hemp->coordinates_placeholder);
        $this->assertSame('limpopo', $hemp->province_slug);
    }

    public function test_botswana_hierarchy_and_opportunities(): void
    {
        $this->assertSame(16, AdminUnit::query()->where('country_iso2', 'BW')->where('level', 1)->count());
        $this->assertSame(83, AdminUnit::query()->where('country_iso2', 'BW')->where('level', 5)->count());
        $this->assertSame(610, OpportunityTemplate::query()->where('country_iso2', 'BW')->count());
        $this->assertSame(321, OpportunityTemplate::query()->where('country_iso2', 'BW')->whereNotNull('latitude')->count());
    }

    public function test_seeder_is_idempotent(): void
    {
        $counts = [AdminUnit::count(), Project::count(), OpportunityTemplate::count()];
        $this->seed(AiimSeeder::class);
        $this->assertSame($counts, [AdminUnit::count(), Project::count(), OpportunityTemplate::count()]);
    }

    public function test_country_pages_render_with_map_payload(): void
    {
        $this->get('/aiim/country/botswana?tab=map')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->where('initialTab', 'map')
            ->where('intel.coverage.hasPack', true)
            ->has('intel.units', 99)
            ->has('intel.map.areas', 15));

        $this->get('/aiim/country/malawi?tab=opportunities')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->where('intel.coverage.projects', 17)
            ->has('intel.projects', 33));

        // A country without loaded data still renders, with empty lists rather than filler.
        $this->get('/aiim/country/chad')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->has('intel.units', 0)
            ->has('intel.projects', 0)
            ->where('intel.pack', null));

        $this->get('/aiim')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page->has('coverage', 54));
    }

    public function test_brief_opportunity_page_and_country_filter(): void
    {
        $this->get('/aiim/opportunities/lilongwe-cement-grinding-bagging-station-600-ktpa')->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('item.country.slug', 'malawi')->where('item.screening.status', 'QUALIFIED'));

        $this->get('/aiim/opportunities?country=malawi')->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('results.total', 17));
    }
}
