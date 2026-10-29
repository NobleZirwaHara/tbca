<?php

namespace Tests\Feature\Industries;

use App\Models\Sprint;
use App\Models\User;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Industries tab rebuilt from the client's "TBCA Industries Prototype" (MP-INDUSTRIES-1.0):
 * 17 industries active in all 54 countries, the intersection pages, the Import and Export heat
 * maps, the engagement journey and the admin console.
 */
class IndustriesTest extends TestCase
{
    use RefreshDatabase;

    private const AGR = '/industries/agriculture-agro-industry';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndustriesSeeder::class);

        // A few app Sprint records so the catalogue prices resolve by code (prices come only from these rows).
        foreach ([['TBCA-D-0604', 'Sector Opportunity Scan Sprint', 1220], ['TBCA-D-0451', 'Market Sizing Sprint', 4900], ['TBCA-O-0630', 'Bottleneck Review Checklist Sprint', 1200]] as $i => [$code, $title, $zar]) {
            Sprint::create(['code' => $code, 'slug' => 'ind-test-'.$i, 'title' => $title, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $title, 'description' => $title,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    public function test_seeder_loads_the_prototype_model_and_is_idempotent(): void
    {
        $this->assertSame(17, DB::table('ind_industries')->count());
        $this->assertSame(56, DB::table('ind_sub_industries')->count());
        $this->assertSame(54, DB::table('ind_countries')->count());
        $this->assertSame(918, DB::table('ind_country_scores')->count());
        $this->assertSame(7589, DB::table('ind_sprints')->count());
        $this->assertSame(2862, DB::table('ind_trade_flows')->count());

        $this->seed(IndustriesSeeder::class);
        $this->assertSame(918, DB::table('ind_country_scores')->count());
        $this->assertSame(7589, DB::table('ind_sprints')->count());

        // Prices only from app Sprint records, matched by code.
        $this->assertSame(1220, IndustryData::sprint('TBCA-D-0604')['ep']);
        $this->assertNull(IndustryData::sprint('TBCA-D-0605')['ep'] ?? null);
    }

    public function test_landing_selector_hubs_heatmap_and_component_pages(): void
    {
        $this->get('/industries')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Landing')->has('all', 17)->where('total', 7589)->has('map', 54));
        $this->get('/industries/select?multi=1')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Select')->where('multi', true)->has('all', 17));
        $this->get('/industries/instances')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Instances')->where('regulated.code', 'FIN')->where('thin.cat', 'Below threshold'));
        $this->get('/industries/selector-component')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/SelectorComponent'));
        foreach (['diagnostics', 'sector-intelligence', 'benchmarks', 'partners'] as $hub) {
            $this->get('/industries/'.$hub)->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Hub')->has('all', 17));
        }
        $this->get('/industries/heatmap?metric=exp&region=Southern&ind=MIN')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Industries/Heatmap')->where('metric', 'exp')->where('region', 'Southern')->where('sel', 'MIN')->has('matrix', 17)->has('matrix.AGR', 54));

        $this->post('/industries/context', ['ind' => 'MIN', 'sub' => 'MIN2', 'iso' => 'KEN'])->assertRedirect('/industries/mining-minerals');
        $this->get('/industries/select')->assertInertia(fn (Assert $p) => $p->where('start.ind', 'MIN')->where('start.iso', 'KEN'));
    }

    public function test_every_industry_page_renders_with_all_sections(): void
    {
        foreach (IndustryData::industries() as $ind) {
            $base = '/industries/'.$ind['slug'];
            $this->get($base)->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Overview')->where('ind.code', $ind['code'])->has('map', 54)->has('top10', 10));
            foreach (['services' => 'Services', 'diagnostic' => 'Diagnostic', 'intelligence' => 'Intelligence', 'benchmarks' => 'Benchmarks', 'partners' => 'Partners', 'countries' => 'Countries', 'chains' => 'Chains',
                'opps' => 'Opps', 'commodities' => 'Commodities', 'economics' => 'Economics', 'regulators' => 'Regulators', 'limits' => 'Limits', 'engage' => 'Engage', 'verify' => 'Verify', 'reclass' => 'Reclass'] as $path => $page) {
                $this->get("{$base}/{$path}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/'.$page));
            }
        }
        $this->get(self::AGR.'/intelligence?tab=trade')->assertInertia(fn (Assert $p) => $p->where('tab', 'trade')->has('flows', 15));
        $this->get(self::AGR.'/services?f[status]=Blocked&sort=0')->assertInertia(fn (Assert $p) => $p->where('table.f.status', 'Blocked')->where('kpi.mapped', 3929));
        $this->get(self::AGR.'/services?csv=1')->assertOk()->assertHeader('content-type', 'text/csv; charset=utf-8');
        $this->get(self::AGR.'/countries')->assertInertia(fn (Assert $p) => $p->has('rows', 54));
        $this->get('/industries/AGR')->assertRedirect(self::AGR);
        $this->get('/industries/nope')->assertNotFound();
    }

    public function test_all_918_industry_country_intersections_render(): void
    {
        $count = 0;
        foreach (IndustryData::industries() as $ind) {
            foreach (IndustryData::countries() as $c) {
                $this->get("/industries/{$ind['slug']}/country/{$c['slug']}")->assertOk();
                $count++;
            }
        }
        $this->assertSame(918, $count);
    }

    public function test_intersections_across_regions_and_their_tabs(): void
    {
        // Botswana deep (9 tabs incl. Where to Land), South Africa worked example, continental elsewhere.
        $this->get(self::AGR.'/country/botswana')->assertInertia(fn (Assert $p) => $p->component('Industries/Intersection')->where('bw', true)->has('tabs', 9)->where('country.iso3', 'BWA'));
        $this->get(self::AGR.'/country/botswana?tab=land')->assertInertia(fn (Assert $p) => $p->where('tab', 'land')->where('land.total', fn ($n) => $n > 0));
        $this->get('/industries/financial-services/country/south-africa?tab=reg')->assertInertia(fn (Assert $p) => $p->where('za', true)->has('tabs', 8)->where('regs.0.src', 'Reference'));
        foreach (['egypt' => 'North', 'nigeria' => 'West', 'cameroon' => 'Central', 'kenya' => 'East', 'zambia' => 'Southern'] as $slug => $region) {
            $this->get("/industries/mining-minerals/country/{$slug}")->assertOk()->assertInertia(fn (Assert $p) => $p->where('country.region', $region)->where('bw', false)->where('za', false)->has('tabs', 8)->where('regs.0.src', 'Placeholder'));
        }
        foreach (['subs', 'market', 'reg', 'incent', 'risks', 'tbca', 'sources'] as $tab) {
            $this->get("/industries/mining-minerals/country/ghana?tab={$tab}")->assertOk()->assertInertia(fn (Assert $p) => $p->where('tab', $tab));
        }
        // Earlier URL shapes still work.
        $this->get('/industries/AGR/country/BWA')->assertRedirect(self::AGR.'/country/botswana');
        $this->get('/industries/sector-intelligence/financial-services')->assertRedirect('/industries/financial-services/intelligence');
    }

    public function test_import_and_export_heat_maps_are_restricted_to_industry_hs_groups(): void
    {
        foreach ([1, 3] as $v) {
            $this->get(self::AGR."/country/botswana/trade?view={$v}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Trade')
                ->where('view', $v)->where('partner', null)->has('groups', 5)->has('rows', 53));
        }
        foreach ([2, 4] as $v) {
            $this->get(self::AGR."/country/botswana/trade?view={$v}&partner=namibia")->assertInertia(fn (Assert $p) => $p->where('view', $v)->where('partner.iso3', 'NAM'));
        }
        $this->get(self::AGR.'/country/south-africa/trade?view=2')->assertInertia(fn (Assert $p) => $p->where('partner.iso3', 'BWA'));
        // Services industries carry no goods groups.
        $this->get('/industries/financial-services/country/kenya/trade')->assertOk()->assertInertia(fn (Assert $p) => $p->has('groups', 0)->has('rows', 0));
    }

    public function test_engagement_journey_runs_end_to_end_for_a_guest(): void
    {
        $this->get('/industries/workspace')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Workspace')->where('e', null));
        $this->get(self::AGR.'/sprint/TBCA-D-0604')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Product')->where('s.ep', 1220));
        $this->get(self::AGR.'/sprint/IN-AAG-PS-001')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Blocked'));
        $this->get(self::AGR.'/sprint/TBCA-D-0604/addons')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Addons'));
        $this->get(self::AGR.'/engage?sub=AGR2&iso=BWA&sprint=TBCA-D-0604')->assertInertia(fn (Assert $p) => $p->where('pre', 'TBCA-D-0604'));

        $this->post(self::AGR.'/engage', ['sprint' => 'TBCA-D-0604', 'tier' => 'Standard', 'sub' => 'AGR2', 'iso' => 'BWA'])->assertRedirect('/industries/engage/gates');
        $this->get('/industries/engage/gates')->assertInertia(fn (Assert $p) => $p->component('Industries/Gates')->where('cur', 'G0')->where('e.price', 2440)->where('tt.vat', 342));

        $this->post('/industries/engage/action', ['do' => 'gate', 'gate' => 'G1'])->assertSessionHas('error');
        $this->post('/industries/engage/action', ['do' => 'gate', 'gate' => 'G0']);
        $this->post('/industries/engage/action', ['do' => 'gate', 'gate' => 'G1', 'n' => 'Kagiso Molefe', 'o' => 'Kgalagadi Beef', 'e' => 'kagiso@example.co.bw']);
        $this->post('/industries/engage/action', ['do' => 'gate', 'gate' => 'G2']);
        $this->post('/industries/engage/action', ['do' => 'gate', 'gate' => 'G3'])->assertRedirect('/industries/engage/letter');
        $this->post('/industries/engage/action', ['do' => 'letter'])->assertRedirect('/industries/engage/checkout');
        $this->get('/industries/engage/checkout')->assertInertia(fn (Assert $p) => $p->component('Industries/Checkout')->where('tt.out', 2782));
        $splits = [['m' => 'Corporate card', 'who' => 'Kgalagadi Beef', 'pct' => 60], ['m' => 'Bank transfer (EFT)', 'who' => 'Co-funder', 'pct' => 40]];
        $this->post('/industries/engage/action', ['do' => 'pay', 'splits' => $splits])->assertRedirect('/industries/workspace');

        $this->get('/industries/workspace')->assertInertia(fn (Assert $p) => $p->where('tt.out', 0)->where('tt.paid', 2782)->where('e.gates.G4', fn ($v) => (bool) $v));
        $this->post('/industries/engage/action', ['do' => 'partner', 'cat' => 'Veterinary & Animal Health']);
        $this->post('/industries/engage/action', ['do' => 'advance']);
        $this->post('/industries/engage/action', ['do' => 'accept'])->assertRedirect('/industries/workspace/review');
        $this->post('/industries/engage/action', ['do' => 'sign', 'discipline' => 'Agricultural Economics']);
        $this->post('/industries/engage/action', ['do' => 'sign', 'discipline' => 'Commodity Markets']);
        $this->post('/industries/engage/action', ['do' => 'accept']);
        $this->post('/industries/engage/action', ['do' => 'consent', 'ind' => 'AGR', 'choice' => 'yes']);

        foreach (['ledger' => 'Ledger', 'partner' => 'PartnerRoute', 'review' => 'Review', 'calendar' => 'Calendar', 'benchmark' => 'BenchmarkConsent', 'abort' => 'Abort', 'verify' => 'Verify', 'reclass' => 'Reclass'] as $path => $page) {
            $this->get('/industries/workspace/'.$path)->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/'.$page));
        }
        $this->get('/industries/workspace')->assertInertia(fn (Assert $p) => $p->where('e.gates.G5', fn ($v) => (bool) $v)->where('e.gates.G7', fn ($v) => (bool) $v)->where('e.partner.cat', 'Veterinary & Animal Health'));
        $this->get('/industries/workspace/calendar.ics')->assertOk()->assertHeader('content-type', 'text/calendar; charset=utf-8');

        $this->post('/industries/engage/action', ['do' => 'abort'])->assertRedirect('/industries/workspace/ledger');
        $this->get('/industries/workspace/ledger')->assertInertia(fn (Assert $p) => $p->where('e.aborted', true));

        // Earlier workspace URLs redirect.
        $this->get('/industries/workspace/AGRI-2026-EGY-001/split-checkout')->assertRedirect('/industries/engage/checkout');
    }

    public function test_signed_in_users_keep_their_engagement_on_the_account(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post(self::AGR.'/engage', ['sprint' => 'TBCA-D-0604', 'tier' => 'Basic', 'sub' => '', 'iso' => 'ZAF'])->assertRedirect('/industries/engage/gates');
        $this->assertTrue(DB::table('ind_states')->where('scope', 'u:'.$user->id)->where('key', 'ieng')->exists());
        $this->postJson('/industries/state', ['key' => 'diag-AGR', 'value' => ['step' => 2, 'prof' => ['name' => 'Kgalagadi'], 'ans' => ['ma0' => 3]]])->assertNoContent();
        $this->get(self::AGR.'/diagnostic')->assertInertia(fn (Assert $p) => $p->where('state.step', 2)->where('state.prof.name', 'Kgalagadi'));
        $this->postJson('/industries/state', ['key' => 'not-allowed', 'value' => 1])->assertStatus(422);
    }

    public function test_admin_console_is_behind_the_staff_gate(): void
    {
        $this->get('/admin/industries')->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['role' => 'client']))->get('/admin/industries')->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        $pages = ['' => 'Overview', '/taxonomy?ind=FIN' => 'Taxonomy', '/classification' => 'Classification', '/margin?ind=MIN' => 'Margin', '/blocked' => 'Blocked', '/regulators?iso=ZAF' => 'Regulators',
            '/misdeclaration' => 'Misdeclaration', '/benchmarks' => 'Benchmarks', '/pipeline' => 'Pipeline', '/whatsapp?flow=WA-IN-005' => 'WhatsApp'];
        foreach ($pages as $path => $page) {
            $this->actingAs($admin)->get('/admin/industries'.$path)->assertOk()->assertInertia(fn (Assert $p) => $p->component('Industries/Admin/'.$page));
        }
        $this->actingAs($admin)->get('/admin/industries/classification')->assertInertia(fn (Assert $p) => $p->where('table.total', 7589)->where('match.total', 7589)->where('match.matched', 3));
        $this->actingAs($admin)->get('/admin/industries/classification?csv=1')->assertOk();
        $this->actingAs($admin)->post('/admin/industries/misdeclaration', ['i' => 0]);
        $this->actingAs($admin)->get('/admin/industries/misdeclaration')->assertInertia(fn (Assert $p) => $p->where('rows.0.status', 'Resolved — reclassified'));
        $this->actingAs($admin)->get('/admin/insights/industries/activation')->assertRedirect('/admin/industries/pipeline');
    }
}
