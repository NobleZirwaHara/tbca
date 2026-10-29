<?php

namespace Tests\Feature\Deliverables;

use App\Models\Deliverables\Deliverable;
use App\Models\Deliverables\DeliverableSprint;
use App\Models\Sprint;
use App\Support\Deliverables\ProductCodes;
use App\Support\Deliverables\ProductMapper;
use App\Support\Deliverables\SprintDeliverableGenerator;
use Database\Seeders\Sections\DeliverablesRegisterSeeder;
use Database\Seeders\Sections\SprintsCatalogueSeeder;
use Database\Seeders\Sections\SprintsRegisterSeeder;
use Database\Seeders\Sections\SprintTypesASeeder;
use Database\Seeders\Sections\SprintTypesBSeeder;
use Database\Seeders\Sections\WebinarsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Noble's decisions of 29 October 2026: a TBCA-generated deliverable for every app
 * Sprint the register does not cover, and links from Issue 1.0 deliverables to the
 * app's other products, shown on their pages.
 */
class DeliverablesProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_published_sprint_has_a_deliverable_after_a_full_sprint_seed(): void
    {
        $this->seed([SprintsCatalogueSeeder::class, SprintTypesASeeder::class, SprintTypesBSeeder::class, SprintsRegisterSeeder::class, DeliverablesRegisterSeeder::class]);

        $this->assertSame(196, Deliverable::where('ref', 'like', 'DEL-GEN-%')->count());
        $this->assertSame(196, DeliverableSprint::where('status', SprintDeliverableGenerator::SOURCE)->where('match', 'code')->count());
        // The Sprints the client register does not cover are exactly those with a generated deliverable.
        $this->assertEqualsCanonicalizing(
            (new SprintDeliverableGenerator)->uncovered()->pluck('code')->all(),
            Deliverable::where('ref', 'like', 'DEL-GEN-%')->pluck('linked_sprint_codes')->all(),
        );

        $covered = DB::table('deliverable_sprints')->select('sprint_code');
        $this->assertSame(0, Sprint::where('status', 'published')->whereNotIn('code', $covered)
            ->where(fn ($w) => $w->whereNull('register_id')->orWhereNotIn('register_id', DB::table('deliverable_sprints')->select('sprint_code')))->count());

        // A generated record follows the register's structure and says where it came from.
        $d = Deliverable::where('linked_sprint_codes', 'SPR-0001')->sole();
        $this->assertSame('DEL-GEN-0063', $d->ref);
        $this->assertSame(SprintDeliverableGenerator::SOURCE, $d->v2_status);
        $this->assertStringStartsWith('TBCA generated (Oct 2026) from app Sprint SPR-0001; comparable register deliverable DEL-', $d->source);
        $this->assertSame('Report', $d->format_class);
        $this->assertSame(['10–20', '20–50', '50–250'], [$d->pages_basic, $d->pages_standard, $d->pages_premium]);
        $this->assertStringStartsWith('Business Plan Development: ', $d->key_issues);
        $this->assertNotNull($d->loop_id);
        $this->assertStringStartsWith('EVT-006', $d->trigger());
        $this->assertNotEmpty($d->workflowSteps());

        $this->get('/sprints/business-plan-development-sprint')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('deliverables.0.ref', 'DEL-GEN-0063')
            ->where('deliverables.0.tiers.premium.pages', '50–250'));
    }

    public function test_generated_file_keeps_issued_refs(): void
    {
        $refs = SprintDeliverableGenerator::existingRefs();
        $this->assertCount(196, $refs);
        $this->assertSame('DEL-GEN-0063', $refs['SPR-0001']);
        $this->assertCount(196, array_unique($refs));
    }

    public function test_due_diligence_family_page_shows_its_check_and_every_case_output(): void
    {
        $this->seed(DeliverablesRegisterSeeder::class);

        $this->get('/due-diligence/individual')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('DueDiligence/Family')
            ->where('productDeliverables.items.0.ref', 'DEL-DD-001')
            ->where('productDeliverables.items.0.shared', false)
            ->where('productDeliverables.items', fn ($items) => collect($items)->where('shared', true)->pluck('ref')->contains('DEL-DD-028')
                && collect($items)->where('shared', true)->count() === 14)
            ->where('productDeliverables.tierAliases.essential', 'basic'));

        // Pages that are not product pages carry no panel data.
        $this->get('/due-diligence')->assertOk()->assertInertia(fn (Assert $p) => $p->where('productDeliverables', null));
    }

    public function test_tool_and_technology_tower_pages_show_linked_deliverables(): void
    {
        $this->seed(DeliverablesRegisterSeeder::class);

        $this->get('/tools/calculators/budget-variance-calculator')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('productDeliverables.items.0.ref', 'DEL-TC-029'));

        $this->get('/technology-solutions/towers/business-systems-zoho-one')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('productDeliverables.items.0.ref', 'DEL-TS-013')
            ->where('productDeliverables.items', fn ($items) => collect($items)->where('shared', true)->count() === 12));
    }

    public function test_product_codes_are_issued_once_and_webinar_pages_show_their_outputs(): void
    {
        $this->seed(WebinarsSeeder::class);
        $this->seed(DeliverablesRegisterSeeder::class);

        $codes = DB::table('ins_webinars')->orderBy('id')->pluck('code', 'slug');
        $this->assertTrue($codes->every(fn ($c) => preg_match('/^WBN-\d{3}$/', $c) === 1));
        $this->assertSame($codes->count(), $codes->unique()->count());

        $this->assertSame(['WBN' => 0, 'MKT' => 0, 'PSV' => 0, 'SVC' => 0], ProductCodes::backfill());
        $this->assertEquals($codes, DB::table('ins_webinars')->orderBy('id')->pluck('code', 'slug'));

        $slug = $codes->keys()->first();
        $this->get("/webinars/{$slug}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('productDeliverables.items', fn ($items) => collect($items)->pluck('ref')->sort()->values()->all() === ['DEL-WB-001', 'DEL-WB-002', 'DEL-WB-003', 'DEL-WB-004']));
    }

    public function test_mapping_files_agree_and_every_row_has_a_decision(): void
    {
        $links = array_map('str_getcsv', file(base_path(ProductMapper::LINKS), FILE_IGNORE_NEW_LINES));
        $review = array_map(fn ($l) => str_getcsv($l, escape: ''), file(base_path(ProductMapper::REVIEW), FILE_IGNORE_NEW_LINES));
        $head = array_shift($review);
        array_shift($links);
        $review = array_map(fn ($r) => array_combine($head, $r), $review);

        $this->assertCount(861, $review);
        $linked = collect($review)->where('decision', 'linked')->pluck('deliverable_ref')->all();
        $this->assertEqualsCanonicalizing(array_values(array_unique(array_column($links, 0))), $linked);
        $this->assertTrue(collect($review)->where('decision', 'not linked')->every(fn ($r) => $r['note'] !== ''));
        $this->assertTrue(collect($review)->where('decision', 'linked')->every(fn ($r) => $r['confidence'] === 'high' && $r['match_method'] !== ''));
    }
}
