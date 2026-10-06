<?php

namespace Tests\Feature\Sprints;

use App\Models\Sprint;
use Database\Seeders\Sections\SprintsCatalogueSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SprintsCatalogueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SprintsCatalogueSeeder::class);
    }

    public function test_seeder_is_idempotent(): void
    {
        $count = Sprint::count();
        $this->seed(SprintsCatalogueSeeder::class);
        $this->assertSame($count, Sprint::count());
        $this->assertTrue(Sprint::where('code', 'like', 'SPR-%')->count() > 90);
    }

    public function test_browse_all_lists_paginated_sprints(): void
    {
        $this->get('/sprints')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Catalogue')
            ->where('view.key', 'all')
            ->has('results.data', 12)
            ->where('results.total', Sprint::count())
            ->has('facets.categories'));
    }

    public function test_search_and_filters_narrow_results_server_side(): void
    {
        $this->get('/sprints?q=pitch+deck')->assertInertia(fn (Assert $p) => $p
            ->where('results.data', fn ($items) => collect($items)->every(fn ($i) => str_contains(strtolower($i['title'].' '.$i['summary']), 'pitch')))
            ->where('results.total', fn ($n) => $n >= 2 && $n < 10));

        $this->get('/sprints?category=diagnostics&sort=price_asc')->assertInertia(fn (Assert $p) => $p
            ->where('results.data', fn ($items) => collect($items)->every(fn ($i) => $i['category'] === 'diagnostics'))
            ->where('results.data.0.slug', 'business-health-check'));

        $this->get('/sprints?price=quote')->assertInertia(fn (Assert $p) => $p
            ->where('results.data', fn ($items) => collect($items)->every(fn ($i) => $i['price_zar'] === null)));

        $this->get('/sprints?delivery=up-to-7&audience=founders')->assertInertia(fn (Assert $p) => $p
            ->where('results.data', fn ($items) => collect($items)->every(fn ($i) => in_array('founders', $i['audience'], true))));
    }

    public function test_curated_views_category_and_audience_pages(): void
    {
        $this->get('/sprints/featured')->assertInertia(fn (Assert $p) => $p
            ->where('view.key', 'featured')
            ->where('results.data', fn ($items) => collect($items)->every(fn ($i) => $i['featured']))
            ->whereNot('spotlight', null));

        $this->get('/sprints/new')->assertInertia(fn (Assert $p) => $p->where('results.data', fn ($items) => collect($items)->every(fn ($i) => $i['is_new'])));
        $this->get('/sprints/popular')->assertOk();
        $this->get('/sprints/recommended')->assertOk();
        $this->get('/sprints/marketplace')->assertInertia(fn (Assert $p) => $p->where('results.total', fn ($n) => $n > 5));

        $this->get('/sprints/category/ai-automation')->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Catalogue')
            ->where('view.title', 'AI and Automation')
            ->where('results.data', fn ($items) => collect($items)->every(fn ($i) => $i['category'] === 'ai-automation')));
        $this->get('/sprints/category/unknown')->assertNotFound();

        $this->get('/sprints/for/ngos')->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Audience')
            ->where('results.data', fn ($items) => collect($items)->every(fn ($i) => in_array('ngos', $i['audience'], true))));

        $this->get('/sprints/a-z?letter=B')->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/AToZ')
            ->where('results', fn ($items) => collect($items)->every(fn ($i) => str_starts_with($i['title'], 'B'))));
    }

    public function test_mockup_aliases_redirect(): void
    {
        $this->get('/sprints/featured-sprints')->assertRedirect('/sprints/featured');
        $this->get('/sprints/founders-and-startups')->assertRedirect('/sprints/for/founders');
        $this->get('/sprints/category/research-and-reports')->assertRedirect('/sprints/category/research-reports');
    }

    public function test_sprint_detail_dispatches_with_contract_props(): void
    {
        $this->get('/sprints/business-plan-development-sprint')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Show')
            ->where('sprint.slug', 'business-plan-development-sprint')
            ->where('sprint.packages.1.zar', 14500)
            ->has('related')
            ->where('tab', 'overview'));

        $this->get('/sprints/investor-readiness-pitch-deck-sprint/add-ons?package=standard')->assertInertia(fn (Assert $p) => $p
            ->where('tab', 'add-ons')
            ->where('selectedPackage', 'standard'));

        $this->get('/sprints/does-not-exist')->assertNotFound();
    }
}
