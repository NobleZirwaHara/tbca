<?php

namespace Tests\Feature\SprintTypesB;

use App\Models\Sprint;
use Database\Seeders\Sections\SprintTypesBSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SprintTypesBTest extends TestCase
{
    use RefreshDatabase;

    private const TYPES = [
        'digital-toolkit', 'training', 'template', 'report', 'quote-route', 'premium',
        'premium-advisory-feeder', 'implementation-pack', 'due-diligence-trust', 'dashboard',
        'dashboard-data', 'subscription', 'retainer',
    ];

    private const CATEGORIES = [
        'business-management', 'ai-automation', 'data-dashboards', 'courses-learning', 'diagnostics',
        'digital-products', 'project-advisory', 'research-reports', 'templates-toolkits', 'technology',
        'due-diligence', 'subscriptions-retainers',
    ];

    private const AUDIENCES = ['smes', 'founders', 'corporates', 'investors', 'ngos', 'sponsors', 'public-sector'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SprintTypesBSeeder::class);
    }

    public function test_every_group_b_type_is_seeded(): void
    {
        foreach (self::TYPES as $type) {
            $this->assertGreaterThan(0, Sprint::where('type', $type)->count(), "No sprints seeded for type {$type}");
        }
    }

    public function test_all_320_dashboard_register_rows_are_seeded(): void
    {
        $register = Sprint::where('type', 'dashboard')->whereNotNull('attributes->register->no')->count();
        $this->assertSame(320, $register);

        // Register rows depicted by a DASH mockup keep the register code and carry the mockup data.
        $programme = Sprint::where('code', 'TBCA-4B-2035')->firstOrFail();
        $this->assertSame('Programme Admin Support - Dashboard Country', $programme->title);
        $this->assertSame('DASH-PG-003', $programme->attributes['mockup_code']);
        $this->assertSame(14000, $programme->price_zar);
    }

    public function test_seeded_rows_use_the_controlled_vocabularies(): void
    {
        Sprint::query()->whereIn('type', self::TYPES)->each(function (Sprint $sprint) {
            $this->assertContains($sprint->category, self::CATEGORIES, "{$sprint->code} has category {$sprint->category}");
            foreach (explode(',', (string) $sprint->audience) as $audience) {
                $this->assertContains($audience, self::AUDIENCES, "{$sprint->code} has audience {$audience}");
            }
            $this->assertContains($sprint->commercial_act, ['purchase', 'quote', 'subscription', 'retainer', 'free']);
            foreach ($sprint->packages ?? [] as $package) {
                $this->assertArrayHasKey('key', $package);
                // Tiers priced "On request" carry no amount.
                $this->assertTrue($package['zar'] === null || is_int($package['zar']));
            }
        });
    }

    public function test_mockup_data_is_seeded_exactly(): void
    {
        $dash = Sprint::where('code', 'DASH-PG-001')->firstOrFail();
        $this->assertSame('Financial Performance Overview Dashboard', $dash->title);
        $this->assertSame([14800, 24500, 34900], array_column($dash->packages, 'zar'));

        $retainer = Sprint::where('slug', 'risk-governance-retainer-sprint')->firstOrFail();
        $this->assertSame('retainer', $retainer->commercial_act);
        // The mockup's single R58 000 price is the Standard package; Basic/Premium are derived.
        $this->assertSame(58000, collect($retainer->packages)->firstWhere('key', 'standard')['zar']);

        $sub = Sprint::where('code', 'SUB-PG-003')->firstOrFail();
        $this->assertSame('subscription', $sub->commercial_act);
        $this->assertSame(650000, $sub->attributes['price_cents']);

        $quoteOnly = Sprint::where('code', 'DDA-PG-002')->firstOrFail();
        $this->assertSame('quote', $quoteOnly->commercial_act);
    }

    public function test_seeder_is_idempotent(): void
    {
        $before = Sprint::count();
        $this->seed(SprintTypesBSeeder::class);
        $this->assertSame($before, Sprint::count());
        $this->assertSame(Sprint::count(), Sprint::distinct()->count('slug'));
    }

    public function test_product_page_renders_for_one_sprint_of_each_type(): void
    {
        if (! Route::has('sprints.show')) {
            $this->markTestSkipped('The /sprints/{slug} route is owned by the Sprints catalogue section and is not registered yet.');
        }

        foreach (self::TYPES as $type) {
            $sprint = Sprint::where('type', $type)->orderBy('id')->firstOrFail();
            $this->get("/sprints/{$sprint->slug}")
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Sprints/Show', false)
                    ->where('sprint.slug', $sprint->slug)
                    ->where('sprint.type', $type));
        }
    }
}
