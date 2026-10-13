<?php

namespace Tests\Feature\Shop;

use App\Models\Sprint;
use App\Support\Shop\Catalogue;
use App\Support\Shop\IndustryListings;
use Database\Seeders\Sections\ShopAisleListingsSeeder;
use Database\Seeders\Sections\SprintsRegisterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Cross-listing of Sprints in the industry aisles and Risk & Cybersecurity (shop_aisle_listings).
 */
class IndustryListingsTest extends TestCase
{
    use RefreshDatabase;

    private function named(string $aisle, string $text): ?string
    {
        return IndustryListings::namedMatch($aisle, ['title' => $text])['keyword'] ?? null;
    }

    public function test_named_rule_matches_whole_words_and_skips_known_false_positives(): void
    {
        // Matches.
        $this->assertSame('solar', $this->named('energy-utilities', 'Solar Mini-Grid Feasibility'));
        $this->assertSame('independent power producer', $this->named('energy-utilities', 'Independent Power Producer bid pack'));
        $this->assertSame('hospital', $this->named('health-life-sciences', 'Hospital licensing pack'));
        $this->assertSame('agro processing', $this->named('agriculture-agri-business', 'Agro-processing feasibility'));
        $this->assertSame('smallholder', $this->named('agriculture-agri-business', 'Smallholder farmer finance'));
        $this->assertSame('factory', $this->named('manufacturing-industry', 'Factory floor productivity review'));
        $this->assertSame('manufacturing', $this->named('manufacturing-industry', 'Manufacturing export readiness'));
        $this->assertSame('mining charter', $this->named('mining-natural-resources', 'Mining Charter compliance'));
        $this->assertSame('hotel', $this->named('tourism-hospitality', 'Boutique hotel feasibility'));
        $this->assertSame('cybersecurity', $this->named('risk-cybersecurity', 'Cybersecurity Baseline Sprint'));
        $this->assertSame('risk register', $this->named('risk-cybersecurity', 'Project Risk Register Template'));

        // Known false positives.
        foreach ([
            'energy-utilities' => ['Power BI Dashboard Setup', 'PowerPoint deck design', 'Empower your sales team', 'Power Automate Workflow Checklist', 'Data that can drive automation and power AI', 'Grid view of your pipeline'],
            'health-life-sciences' => ['Business Health Score Sprint', 'Cash Flow Health Diagnostic', 'Sales pipeline health review', 'Founder Clinic Sprint', 'Sales Coaching Clinic', 'The Business Clinic.Africa brand refresh', 'Occupational health and safety file', 'Patient capital for founders'],
            'agriculture-agri-business' => ['Food for thought newsletter', 'Farm out your admin', 'Server farm migration'],
            'manufacturing-industry' => ['Service Delivery Factory Setup', 'SEO Content Factory Sprint', 'Industrial relations policy', 'Agro-industrial park feasibility'],
            'mining-natural-resources' => ['Data mining dashboard', 'Process mining review'],
            'tourism-hospitality' => ['Lodge a complaint with the regulator', 'Travel expense claims policy', 'Funding of last resort'],
            // The register's titles append the category name after a long dash (U+2014).
            'risk-cybersecurity' => ["Portal Scoping Sprint \u{2014} Technology, Digital Transformation, Cybersecurity and Cloud", 'Strengthen cash resilience'],
        ] as $aisle => $texts) {
            foreach ($texts as $text) {
                $this->assertNull($this->named($aisle, $text), "{$aisle}: {$text}");
            }
        }

        // Agro-processing belongs to agriculture, not manufacturing.
        $this->assertNull($this->named('manufacturing-industry', 'Agro-processing plant'));
    }

    /** Four Sprints with known placements. */
    private function fixture(): array
    {
        $make = fn (string $code, string $title, string $home) => Sprint::create([
            'code' => $code, 'slug' => strtolower($code), 'title' => $title, 'type' => 'fixed-scope', 'shop_aisle' => $home, 'status' => 'published',
        ]);

        return [
            'solar' => $make('TST-001', 'Solar Mini-Grid Feasibility', 'finance-investment'),
            'clinic' => $make('TST-002', 'Founder Clinic Sprint', 'education-skills'),
            'board' => $make('TST-003', 'Board Pack Review', 'business-strategy-planning'),
            'cyber' => $make('TST-004', 'Cybersecurity Baseline Sprint', 'ict-digital-economy'),
        ];
    }

    private function placements(): array
    {
        return DB::table(IndustryListings::TABLE)->orderBy('sprint_id')->orderBy('aisle')->get(['sprint_id', 'aisle', 'reason'])
            ->map(fn ($r) => "{$r->sprint_id}|{$r->aisle}|{$r->reason}")->all();
    }

    public function test_rebuild_is_idempotent_and_never_repeats_the_home_aisle(): void
    {
        $s = $this->fixture();

        $this->seed(ShopAisleListingsSeeder::class);
        $first = $this->placements();
        $this->assertContains("{$s['solar']->id}|energy-utilities|named", $first);
        $this->assertContains("{$s['cyber']->id}|risk-cybersecurity|named", $first);
        $this->assertNotContains("{$s['clinic']->id}|health-life-sciences|named", $first);

        $this->seed(ShopAisleListingsSeeder::class);
        $this->assertSame($first, $this->placements());
        $this->assertSame(count($first), ShopAisleListingsSeeder::$report['total']);

        $this->assertSame(0, DB::table(IndustryListings::TABLE.' as l')->join('sprints as s', 's.id', '=', 'l.sprint_id')->whereColumn('s.shop_aisle', 'l.aisle')->count());
    }

    public function test_overrides_add_and_remove_placements_and_are_applied_last(): void
    {
        $s = $this->fixture();
        $this->assertSame("code,aisle,action,note\n", file_get_contents(base_path(IndustryListings::OVERRIDES)));

        // A manual row from another source (not the overrides file) survives every rebuild.
        DB::table(IndustryListings::TABLE)->insert(['sprint_id' => $s['board']->id, 'aisle' => 'mining-natural-resources', 'reason' => 'manual', 'source' => 'admin', 'created_at' => now(), 'updated_at' => now()]);

        $csv = tempnam(sys_get_temp_dir(), 'ovr');
        file_put_contents($csv, implode("\n", [
            'code,aisle,action,note',
            'TST-003,tourism-hospitality,add,Board packs for lodge owners',
            'TST-001,energy-utilities,remove,Not an energy Sprint',
            'TST-004,ict-digital-economy,add,Already its home aisle',
            'NOPE-1,energy-utilities,add,Unknown code',
            'TST-002,energy-utilities,move,Bad action',
        ])."\n");

        $result = IndustryListings::rebuild(false, $csv);
        $rows = $this->placements();

        $this->assertContains("{$s['board']->id}|tourism-hospitality|manual", $rows);
        $this->assertNotContains("{$s['solar']->id}|energy-utilities|named", $rows);
        $this->assertContains("{$s['board']->id}|mining-natural-resources|manual", $rows);
        $this->assertSame(1, $result['overrides']['added']);
        $this->assertSame(1, $result['overrides']['removed']);
        $this->assertCount(3, $result['overrides']['skipped']);
        $this->assertSame('override: Board packs for lodge owners', DB::table(IndustryListings::TABLE)->where('sprint_id', $s['board']->id)->where('aisle', 'tourism-hospitality')->value('matched'));

        // Without the file the rules come back and the file's manual row goes; the admin row stays.
        IndustryListings::rebuild(false, $csv.'.missing');
        $rows = $this->placements();
        $this->assertContains("{$s['solar']->id}|energy-utilities|named", $rows);
        $this->assertNotContains("{$s['board']->id}|tourism-hospitality|manual", $rows);
        $this->assertContains("{$s['board']->id}|mining-natural-resources|manual", $rows);

        unlink($csv);
    }

    public function test_register_sprints_fill_every_industry_aisle_and_counts_and_pages_include_them(): void
    {
        $this->seed([SprintsRegisterSeeder::class, ShopAisleListingsSeeder::class]);
        $report = ShopAisleListingsSeeder::$report;
        $total = DB::table(IndustryListings::TABLE)->count();

        $this->assertCount(7, IndustryListings::aisles());
        foreach (IndustryListings::aisles() as $aisle) {
            $n = DB::table(IndustryListings::TABLE)->where('aisle', $aisle)->count();
            $this->assertGreaterThan(0, $n, $aisle);
            $this->assertLessThanOrEqual(IndustryListings::RELEVANT_CAP, $report['aisles'][$aisle]['relevant'], $aisle);
            $this->assertSame($n, Catalogue::sprintCountForAisle($aisle) - Catalogue::homeSprintCountForAisle($aisle), $aisle);

            $this->get("/shop/aisle/{$aisle}")->assertOk()->assertInertia(fn (Assert $p) => $p
                ->component('Shop/Aisle')
                ->where('sprintCount', Catalogue::sprintCountForAisle($aisle))
                ->where('sprints.total', Catalogue::sprintCountForAisle($aisle))
                ->has('sprints.data', min(12, Catalogue::sprintCountForAisle($aisle)))
                ->where('sprints.data', fn ($items) => collect($items)->every(fn ($i) => $i['listing'] !== null || $i['aisle'] === $aisle)));
        }

        // Counts include each cross-listed Sprint once per aisle it is listed in.
        $this->get('/shop/a-z')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('aisles', fn ($aisles) => collect($aisles)->sum('products') === 7008 + $total));

        // Industry aisle: cross-listed Sprints carry "Also in {home aisle}"; named ones come first.
        $energy = DB::table(IndustryListings::TABLE)->where('aisle', 'energy-utilities')->count();
        $this->get('/shop/aisle/energy-utilities')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('homeSprintCount', 0)
            ->where('sprints.data.0.listing', fn ($l) => in_array($l, ['named', 'relevant'], true))
            ->where('sprints.data.0.also_in', fn ($name) => is_string($name) && $name !== ''));
        $this->get('/shop/aisle/energy-utilities?page=2')->assertOk()->assertInertia(fn (Assert $p) => $p->where('sprints.current_page', 2));

        // Search and the shop filters by aisle include cross-listings (search folds Sprints with the same name into one result).
        $this->get('/search?category=energy-utilities&all=1')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('search.total', fn ($n) => $n > 0 && $n <= $energy)
            ->where('search.facets.aisles.energy-utilities', fn ($n) => $n > 0 && $n <= $energy)
            ->where('search.results', fn ($items) => collect($items)->every(fn ($r) => $r['listing'] !== null && $r['also_in'] !== null)));
        $this->get('/shop?category=risk-cybersecurity')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('results.total', fn ($n) => $n > 1)
            ->where('results.items', fn ($items) => collect($items)->every(fn ($r) => $r['aisle'] === 'risk-cybersecurity' || $r['listing'] !== null)));

        // The Sprint page lists its home aisle and the aisles it is also listed in.
        $listing = DB::table(IndustryListings::TABLE)->where('aisle', 'risk-cybersecurity')->where('reason', 'named')->first();
        $sprint = Sprint::find($listing->sprint_id);
        $this->get("/sprints/{$sprint->slug}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('listedIn.0.slug', $sprint->shop_aisle)
            ->where('listedIn.0.home', true)
            ->where('listedIn', fn ($chips) => collect($chips)->contains(fn ($c) => $c['slug'] === 'risk-cybersecurity' && $c['home'] === false && $c['reason'] === 'named')));
    }
}
