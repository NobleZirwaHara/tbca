<?php

namespace Tests\Feature\CountryHub;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\CountryState;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Countries tab (MP-COUNTRIES-1.0 prototype): data load, landing, explorer, country resolution and visitor state. */
class LandingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);
        IndustryData::forget();
    }

    public function test_seeder_loads_every_register_and_document_and_is_idempotent(): void
    {
        $this->assertSame(63, DB::table('ind_register_rows')->distinct()->count('register'));
        $rows = DB::table('ind_register_rows')->count();
        $this->assertSame(8, DB::table('cty_meta')->count());

        $this->seed(CountryHubSeeder::class);
        $this->assertSame($rows, DB::table('ind_register_rows')->count());

        $this->assertCount(83, CountryHub::register('BW_Towns'));
        $this->assertCount(18810, CountryHub::register('BW_Investor_InfoTypes'));
        $this->assertCount(15, CountryHub::meta('geo_bw')['districts']);
        $this->assertCount(636, CountryHub::meta('pack_doc'));
        $this->assertCount(1814, CountryHub::meta('sprint_topics'));
        $this->assertSame('AAB-UP07-NONE-RUBRIC', CountryHub::market('TBCA-G-0002')['arch']);
    }

    public function test_landing_and_explorer(): void
    {
        $this->get('/countries')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Landing')
            ->has('map', 54)->where('activated', 54)->where('sellable', 64)->has('waves', 7)->has('updates', 5));
        $this->get('/countries/explorer')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Explorer')->has('rows', 54)->where('sellable', 64));
    }

    public function test_country_resolves_by_slug_iso3_and_iso2_and_unknown_is_404(): void
    {
        foreach (['botswana', 'BWA', 'bwa', 'bw'] as $key) {
            $this->get("/countries/{$key}")->assertOk()->assertInertia(fn (Assert $p) => $p->where('base.c.iso3', 'BWA')->where('base.c.isBW', true));
        }
        $this->get('/countries/atlantis')->assertNotFound();
    }

    public function test_visitor_state_endpoint_only_takes_allowed_keys(): void
    {
        $this->postJson('/countries/state', ['key' => 'saved', 'value' => ['BWA']])->assertNoContent();
        $this->assertSame(['BWA'], CountryState::get('saved'));
        $this->postJson('/countries/state', ['key' => 'plan.ready-bwa', 'value' => [1, 2]])->assertNoContent();
        $this->postJson('/countries/state', ['key' => 'journey', 'value' => ['paid' => true]])->assertUnprocessable();
        $this->postJson('/countries/state', ['key' => 'role', 'value' => 'admin'])->assertUnprocessable();
    }
}
