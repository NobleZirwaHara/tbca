<?php

namespace Tests\Feature\CountryHub;

use App\Models\Sprint;
use App\Support\CountryHub\Corridors;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Corridors & Ledgers P35 to P48 (prototype pages-corridors.js). */
class CorridorsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);

        // Two of the eight corridor Sprints get app prices, so ledger T resolves part of its lines.
        foreach ([['TBCA-X-1694', 'Trade Partner Scan Sprint', 1220], ['TBCA-X-1443', 'Import/Export Risk Register Sprint', 1850]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'cor-test-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    public function test_corridor_model_matches_the_prototype(): void
    {
        $this->assertCount(2862, Corridors::all());
        $this->assertSame(64, Corridors::sellableCount());
        $this->assertSame(['High Confidence' => 20, 'Evidence Available' => 44, 'Limited Evidence' => 776, 'No Evidence' => 2022], Corridors::counts());
        $this->assertSame(['TBCA-X-1694', 'TBCA-X-1443', 'TBCA-X-1185', 'TBCA-D-0592', 'TBCA-X-0687', 'TBCA-X-1177', 'TBCA-G-0002', 'TBCA-G-0363'], array_column(Corridors::corrSprints(), 'code'));

        $t = Corridors::ledgerTotals(Corridors::pair('BWA', 'ZAF'));
        $this->assertEquals(1220 + 1850, $t['T']);
        $this->assertEqualsWithDelta((1220 + 1850) / 0.175 * 0.391, $t['X'], 0.01);
        $this->assertEqualsWithDelta((1220 + 1850) / 0.175 * 0.051 * 1.15, Corridors::ledgerTotals(Corridors::pair('BWA', 'ZMB'))['S'], 0.01);
        $this->assertEqualsWithDelta((1220 + 1850) / 0.175 * 0.051 * 1.4, Corridors::ledgerTotals(Corridors::pair('KEN', 'BEN'))['S'], 0.01);
    }

    public function test_landing_selector_and_network(): void
    {
        $this->get('/countries/corridors')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Landing')
            ->where('from.iso3', 'BWA')->has('map', 54)->has('mine', 53)->where('sellable', 64)->where('cnt.High Confidence', 20)->has('countries', 54));
        foreach (['south-africa' => 'ZAF', 'KEN' => 'KEN', 'bogus' => 'BWA'] as $q => $iso) {
            $this->get('/countries/corridors?from='.$q)->assertOk()->assertInertia(fn (Assert $p) => $p->where('from.iso3', $iso));
        }

        $this->get('/countries/corridors/select?from=ZAF')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Select')->where('from.iso3', 'ZAF')->where('to', null)->has('rows', 53));
        $this->get('/countries/corridors/select?from=BWA&to=ZAF')->assertOk()->assertInertia(fn (Assert $p) => $p->where('to.iso3', 'ZAF')->has('rows', 1)->where('rows.0.st', 'High Confidence')->where('rows.0.sellable', true));

        $this->get('/countries/corridors/network')->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Network')
            ->has('lines', 64)->where('regions', ['North', 'West', 'Central', 'East', 'Southern'])->where('heat.Southern.Southern', ['n' => 90, 'e' => 90, 'p' => 100]));
        $csv = $this->get('/countries/corridors/network?export=csv');
        $csv->assertOk();
        $this->assertStringStartsWith('From,To,Status,Items,Confidence', $csv->streamedContent());
        $this->assertSame(2863, substr_count(trim($csv->streamedContent()), "\n") + 1);
    }

    public function test_pair_and_ledger_views_for_three_departures(): void
    {
        foreach ([['BWA', 'ZAF'], ['ZAF', 'BWA'], ['KEN', 'NGA']] as [$a, $b]) {
            $this->get("/countries/corridors/detail/{$a}/{$b}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Detail')
                ->where('cr.a', $a)->where('cr.B.iso3', $b)->has('tot', 6)->has('map', 54)->has('fl')->has('rv'));
            $this->get("/countries/corridors/compare/{$a}/{$b}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Compare')->where('ea.iso3', $a)->where('eb.iso3', $b));
            $this->get("/countries/corridors/evidence/{$a}/{$b}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Evidence')->has('items'));
            $this->get("/countries/corridors/fees/{$a}/{$b}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Fees')->has('tot', 6));
            $this->get("/countries/corridors/outlook/{$a}/{$b}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Outlook')->has('tot', 6));
            foreach (['T', 'X', 'S', 'P', 'D', 'CT-C'] as $l) {
                $this->get("/countries/corridors/ledger/{$l}/{$a}/{$b}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Corridors/Ledger')->where('ledger', $l)->has('lines'));
            }
        }

        // Botswana pairs carry the BW-1.0 gateways, facts and permits; others the placeholders.
        $this->get('/countries/corridors/detail/BWA/ZAF')->assertInertia(fn (Assert $p) => $p->has('gw', 6)->where('sacu', true)->where('cr.st', 'High Confidence'));
        $this->get('/countries/corridors/compare/BWA/ZAF')->assertInertia(fn (Assert $p) => $p->has('ea.bench', 5)->has('eb.bench', 5));
        $this->get('/countries/corridors/compare/KEN/NGA')->assertInertia(fn (Assert $p) => $p->has('ea.bench', 0)->has('eb.bench', 5));
        $this->get('/countries/corridors/evidence/BWA/ZAF')->assertInertia(fn (Assert $p) => $p->where('bw', true)->has('items', 6)->where('items.0.3', fn ($v) => str_contains($v, 'PwC')));
        $this->get('/countries/corridors/evidence/KEN/UGA')->assertInertia(fn (Assert $p) => $p->where('bw', false)->has('items', 2)->where('items.0.5', true));
        $this->get('/countries/corridors/ledger/T/BWA/ZAF')->assertInertia(fn (Assert $p) => $p->has('lines', 9)->where('lines.0.amount', 1220)->where('lines.0.code', 'TBCA-X-1694')->where('lines.8.cert', 'Price Suppressed'));
        $this->get('/countries/corridors/ledger/S/BWA/ZAF')->assertInertia(fn (Assert $p) => $p->has('lines', 4)->where('lines.0.name', fn ($v) => str_contains($v, '(BERA; BPC; DEA)')));
        $this->get('/countries/corridors/ledger/X/KEN/BEN')->assertInertia(fn (Assert $p) => $p->where('cr.st', 'No Evidence')->where('lines.0.cert', 'Price Suppressed'));
    }

    public function test_lower_case_redirects_and_unknown_pairs_404(): void
    {
        $this->get('/countries/corridors/detail/bwa/zaf')->assertRedirect('/countries/corridors/detail/BWA/ZAF');
        $this->get('/countries/corridors/ledger/T/bwa/zaf')->assertRedirect('/countries/corridors/ledger/T/BWA/ZAF');
        $this->get('/countries/corridors/detail/BWA/BWA')->assertNotFound();
        $this->get('/countries/corridors/fees/XXX/ZAF')->assertNotFound();
        $this->get('/countries/corridors/ledger/Q/BWA/ZAF')->assertNotFound();
    }
}
