<?php

namespace Tests\Feature\Sprints;

use App\Models\Sprint;
use App\Support\Sprints\Register;
use Database\Seeders\Sections\SprintsCatalogueSeeder;
use Database\Seeders\Sections\SprintsRegisterSeeder;
use Database\Seeders\Sections\SprintTypesASeeder;
use Database\Seeders\Sections\SprintTypesBSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The client's full Sprint Design Register (Volume 11, 7,008 Sprints).
 */
class SprintsRegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_file_holds_7008_unique_sprints(): void
    {
        $register = Register::load();

        $this->assertSame(7008, $register['count']);
        $this->assertCount(7008, $register['rows']);
        $this->assertSame([], $register['rejected']);
        $this->assertCount(7008, array_unique(array_column($register['rows'], 'code')));
        $this->assertCount(7008, array_unique(array_column($register['rows'], 'slug')));

        foreach ($register['rows'] as $row) {
            $this->assertNotEmpty($row['name'], $row['code']);
            $this->assertSame(['basic', 'standard', 'premium'], array_keys($row['prices']), $row['code']);
        }
    }

    public function test_seeder_links_existing_sprints_adds_the_rest_and_is_idempotent(): void
    {
        $this->seed([SprintsCatalogueSeeder::class, SprintTypesASeeder::class, SprintTypesBSeeder::class]);
        $before = Sprint::count();
        $mockup = Sprint::where('code', 'TBCA-G-0001')->first();

        $this->seed(SprintsRegisterSeeder::class);
        $report = SprintsRegisterSeeder::$report;
        $matched = $report['matched_by_code'] + $report['matched_by_attribute'] + $report['matched_by_title'];

        $this->assertSame(7008, $matched + $report['added']);
        $this->assertSame($before + $report['added'], Sprint::count());
        $this->assertSame(7008, Sprint::whereNotNull('register_id')->distinct()->count('register_id'));
        $this->assertSame(0, Sprint::query()->selectRaw('slug')->groupBy('slug')->havingRaw('count(*) > 1')->count());

        // Existing records keep their content and gain the register link.
        $linked = Sprint::where('code', 'TBCA-G-0001')->first();
        $this->assertSame($mockup->title, $linked->title);
        $this->assertSame($mockup->price_zar, $linked->price_zar);
        $this->assertSame($mockup->type, $linked->type);
        $this->assertSame('TBCA-G-0001', $linked->register_id);
        $this->assertSame('TBCA-G-0001-CRM-PIPELINE-SETUP', $linked->attributes['design_register']['sku']);
        $this->assertSame('mockup', $linked->attributes['source']);

        // A mockup page that names a register code is linked rather than duplicated.
        $this->assertSame('TBCA-4B-2276', Sprint::where('code', 'TIS-PG-030')->value('register_id'));
        $this->assertFalse(Sprint::where('code', 'TBCA-4B-2276')->exists());

        // The flagship slug still belongs to the Sprints catalogue.
        $this->assertSame('SPR-0001', Sprint::where('slug', 'business-plan-development-sprint')->value('code'));

        // Running again changes nothing.
        $count = Sprint::count();
        $this->seed(SprintsRegisterSeeder::class);
        $this->assertSame($count, Sprint::count());
        $this->assertSame(0, SprintsRegisterSeeder::$report['added']);
        $this->assertSame(0, SprintsRegisterSeeder::$report['updated']);
        $this->assertSame($report['added'], SprintsRegisterSeeder::$report['refreshed']);
    }

    public function test_catalogue_pages_paginate_the_full_register(): void
    {
        $this->seed(SprintsRegisterSeeder::class);
        $this->assertSame(7008, Sprint::count());

        $this->get('/sprints')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Catalogue')
            ->has('results.data', 12)
            ->where('results.total', 7008)
            ->where('total', 7008));

        $this->get('/sprints?page=584')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('results.current_page', 584)
            ->where('results.last_page', 584));

        $this->get('/sprints?q=crm&category=technology')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('results.data', fn ($items) => collect($items)->isNotEmpty() && collect($items)->every(fn ($i) => $i['category'] === 'technology')));

        $this->get('/sprints/a-z')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/AToZ')
            ->where('pagination', null)
            ->where('results', fn ($items) => collect($items)->countBy(fn ($i) => strtoupper($i['title'][0]))->max() <= 6));

        $this->get('/sprints/a-z?letter=C&page=2')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->has('results', 60)
            ->where('pagination.current_page', 2)
            ->where('pagination.per_page', 60)
            ->where('results', fn ($items) => collect($items)->every(fn ($i) => strtoupper($i['title'][0]) === 'C')));
    }

    public function test_new_register_sprints_render_with_the_generic_template(): void
    {
        $this->seed(SprintsRegisterSeeder::class);
        $rows = Register::load()['rows'];

        foreach ([0, 700, 1999, 2000, 3500, 4999, 5000, 6200, 7007] as $i) {
            $row = $rows[$i];
            $this->get('/sprints/'.$row['slug'])->assertOk()->assertInertia(fn (Assert $p) => $p
                ->component('Sprints/Show')
                ->where('sprint.code', $row['code'])
                ->where('sprint.title', $row['name'])
                ->where('sprint.attributes.template', 'generic')
                ->where('sprint.image_url', null)
                ->where('meta.packages', fn ($packages) => collect($packages)->pluck('zar', 'key')->all() === $row['prices']));
        }
    }

    public function test_shop_counts_come_from_the_data(): void
    {
        $this->seed(SprintsRegisterSeeder::class);

        $this->get('/shop')->assertOk()->assertInertia(fn (Assert $p) => $p->where('governedTotal', 7008));
        $this->get('/shop/a-z')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('totals.products', 7008)
            ->where('aisles', fn ($aisles) => collect($aisles)->sum('products') === 7008));

        $this->get('/shop/aisle/ict-digital-economy')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('sprintCount', Sprint::where('shop_aisle', 'ict-digital-economy')->count()));

        $this->get('/search?category=ict-digital-economy&all=1')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('search.total', fn ($n) => $n > 0)
            ->where('search.results', fn ($items) => collect($items)->every(fn ($r) => $r['aisle'] === 'ict-digital-economy')));
    }
}
