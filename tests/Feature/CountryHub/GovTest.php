<?php

namespace Tests\Feature\CountryHub;

use App\Http\Controllers\CountryHub\GovController;
use App\Models\Sprint;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Governance, sovereign client and admin pages P49 to P84 (prototype pages-gov.js). */
class GovTest extends TestCase
{
    use RefreshDatabase;

    /** Keys whose Botswana page reads BW-1.0 registers and whose other-country page is the pack placeholder. */
    private const BW_ONLY = ['manifest', 'freshness', 'contradictions', 'licence', 'absence', 'changes', 'sovreview', 'panel'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);
        $this->seed(CountryHubSeeder::class);
        Sprint::create(['code' => 'TBCA-X-1694', 'slug' => 'gov-test-0', 'title' => 'Trade Partner Scan Sprint', 'type' => 'sprint', 'category' => 'research-reports', 'summary' => 'x', 'description' => 'x',
            'price_zar' => 1220, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => 1220]]]);
        IndustryData::forget();
    }

    public function test_hub_and_every_page_render_for_three_countries(): void
    {
        foreach (['botswana' => 'BWA', 'south-africa' => 'ZAF', 'kenya' => 'KEN'] as $slug => $iso) {
            $this->get("/countries/{$slug}/gov")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Gov/Hub')->where('base.c.iso3', $iso));
            foreach (GovController::KEYS as $k) {
                $this->get("/countries/{$slug}/gov/{$k}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('CountryHub/Gov/Page')->where('k', $k)->where('base.c.iso3', $iso));
            }
            $this->get("/countries/{$slug}/gov/nope")->assertNotFound();
        }
        $this->get('/countries/bwa/gov/tower')->assertOk();
        $this->get('/countries/atlantis/gov')->assertNotFound();
    }

    public function test_botswana_reads_the_registers_and_others_get_placeholders(): void
    {
        $this->get('/countries/botswana/gov/manifest')->assertInertia(fn (Assert $p) => $p->has('data.rows', 90));
        $this->get('/countries/botswana/gov/contradictions')->assertInertia(fn (Assert $p) => $p->has('data.rows', 20));
        $this->get('/countries/botswana/gov/absence')->assertInertia(fn (Assert $p) => $p->has('data.gaps', 16)->has('data.closed', 5));
        $this->get('/countries/botswana/gov/licence')->assertInertia(fn (Assert $p) => $p->where('data.blocks.0.x', 'ANNEX 3 — Data licences'));
        $this->get('/countries/botswana/gov/panel')->assertInertia(fn (Assert $p) => $p->has('data.rows', 18));
        $this->get('/countries/botswana/gov/intake')->assertInertia(fn (Assert $p) => $p->has('data.inst', 50));
        foreach (self::BW_ONLY as $k) {
            $this->get("/countries/kenya/gov/{$k}")->assertInertia(fn (Assert $p) => $p->where('data', null));
        }
        $this->get('/countries/kenya/gov/intake')->assertInertia(fn (Assert $p) => $p->has('data.inst', 0));
    }

    public function test_admin_consoles_and_agents(): void
    {
        $this->get('/countries/kenya/gov/activation')->assertInertia(fn (Assert $p) => $p->has('data.rows', 54)->where('data.rows.0.iso3', 'DZA'));
        $this->get('/countries/kenya/gov/workbench')->assertInertia(fn (Assert $p) => $p->where('data.rows.0.priority', 'High'));
        $this->get('/countries/kenya/gov/tower')->assertInertia(fn (Assert $p) => $p->where('data.cnt.Activated', 54)->where('data.sellable', 64)->where('data.gaps', 16)->has('data.map', 54));
        $this->get('/countries/kenya/gov/bias')->assertInertia(fn (Assert $p) => $p->where('data.rows.0', ['Investment, Funding & Due Diligence', 46]));
        $this->get('/countries/kenya/gov/corrresolver')->assertInertia(fn (Assert $p) => $p->has('data.rows', 53));
        $this->get('/countries/south-africa/gov/correcon')->assertInertia(fn (Assert $p) => $p->where('data.pair.b', 'BWA')->where('data.tot.T', 1220));
        $this->get('/countries/kenya/gov/correcon')->assertInertia(fn (Assert $p) => $p->where('data.pair.b', 'ZAF'));

        // 2,862 corridor objects are paged on the server.
        $this->get('/countries/botswana/gov/corrobj')->assertInertia(fn (Assert $p) => $p->where('data.table.total', 2862)->has('data.table.rows', 15));
        $this->get('/countries/botswana/gov/corrobj?f[st]=High%20Confidence&size=25')->assertInertia(fn (Assert $p) => $p->where('data.table.count', 20)->has('data.table.rows', 20));

        $this->get('/countries/kenya/gov/corragent')->assertInertia(fn (Assert $p) => $p
            ->where('data.answers.noEvidence', '2,022 of 2,862 directional pairs hold no evidence (modelled status).')
            ->where('data.answers.cost.T', 1220)
            ->where('data.answers.gaps', fn ($v) => str_starts_with($v, '16 open gaps, e.g. DG-01')));
    }
}
