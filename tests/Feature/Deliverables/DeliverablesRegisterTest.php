<?php

namespace Tests\Feature\Deliverables;

use App\Models\Deliverables\CountryMatrixEntry;
use App\Models\Deliverables\Deliverable;
use App\Models\Deliverables\DeliverableSprint;
use App\Models\Deliverables\DeliverableText;
use App\Models\Deliverables\IntegrationSpec;
use App\Models\Deliverables\PaymentLoop;
use App\Models\Deliverables\Safeguard;
use App\Models\Deliverables\Standard;
use App\Models\IntegrationEvent;
use App\Models\Order;
use App\Models\Sprint;
use App\Models\User;
use Database\Seeders\Sections\DeliverablesRegisterSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The client's Registry of Deliverables (MP-DEL-2.0, 25 October 2026).
 */
class DeliverablesRegisterTest extends TestCase
{
    use RefreshDatabase;

    /** A published Sprint carrying the register code of DEL-SV-0562 (Cash Crisis Premium Sprint). */
    private function sprint(string $code = 'TBCA-4C-5288', ?string $registerId = null, string $slug = 'cash-crisis-premium-sprint'): Sprint
    {
        return Sprint::create([
            'code' => $code, 'register_id' => $registerId, 'slug' => $slug, 'title' => 'Cash Crisis Premium Sprint', 'type' => 'premium',
            'category' => 'finance', 'summary' => 'Funding support route.', 'price_zar' => 6240, 'commercial_act' => 'purchase', 'status' => 'published',
            'attributes' => ['template' => 'generic'],
        ]);
    }

    private function checksum(): string
    {
        $rows = [];
        foreach (['deliverables' => 'ref', 'deliverable_sprints' => 'sprint_code', 'deliverable_texts' => 'hash', 'deliverable_standards' => 'id', 'deliverable_safeguards' => 'code', 'deliverable_payment_loops' => 'loop_id', 'deliverable_integration_specs' => 'id', 'deliverable_country_matrix' => 'id', 'deliverable_products' => 'id'] as $table => $order) {
            $rows[$table] = DB::table($table)->orderBy($order)->get()->map(fn ($r) => collect((array) $r)->except(['created_at', 'updated_at'])->all())->all();
        }

        return md5(serialize($rows));
    }

    public function test_seeder_loads_every_sheet_and_is_idempotent(): void
    {
        $this->seed(DeliverablesRegisterSeeder::class);

        $this->assertSame(8318, Deliverable::where('ref', 'not like', 'DEL-GEN-%')->count());
        $this->assertSame(7457, Deliverable::where('v2_status', 'NEW from Sprint catalogue')->count());
        $register = fn () => Deliverable::where('ref', 'not like', 'DEL-GEN-%');
        $this->assertSame(2112, $register()->where('tab', 'Services')->count());
        $this->assertSame(1933, $register()->where('format_class', 'Report')->count());
        $this->assertSame(23, Deliverable::distinct()->count('tab'));
        $this->assertSame(196, Deliverable::where('v2_status', 'TBCA generated (Oct 2026)')->count());
        $this->assertSame(0, Deliverable::whereNull('loop_id')->count());
        $this->assertSame(0, Deliverable::whereNull('format_code')->count());
        $this->assertSame(7589, DeliverableSprint::where('status', 'not like', 'TBCA generated%')->count());
        $this->assertSame(132, DeliverableSprint::where('status', 'like', 'LINKED%')->count());
        $this->assertSame(30, Safeguard::count());
        $this->assertSame(17, PaymentLoop::count());
        $this->assertSame(18, IntegrationSpec::count());
        $this->assertSame(540, CountryMatrixEntry::count());
        $this->assertSame(54, CountryMatrixEntry::distinct()->count('iso3'));
        $this->assertSame(50, Standard::count());
        $this->assertSame(20, Standard::where('section', 'format')->count());

        // Every crosswalk ref is a register deliverable; with no Sprints in the app every code is kept as unmatched.
        $this->assertSame(0, DeliverableSprint::whereNotIn('deliverable_ref', Deliverable::select('ref'))->count());
        $this->assertSame(7785, DeliverableSprint::where('match', 'unmatched')->count());

        // The client's text is carried as written, including the pooled columns.
        $d = Deliverable::where('ref', 'DEL-SV-0562')->sole();
        $this->assertSame('Cash Crisis Premium Sprint', $d->name);
        $this->assertSame(['15–22', '30–45', '52–68'], [$d->pages_basic, $d->pages_standard, $d->pages_premium]);
        $this->assertStringStartsWith('Board-ready report: Standard scope plus', $d->text('extent_premium'));
        $this->assertStringStartsWith('McKinsey SCR storyline', $d->text('consulting_standard'));
        $this->assertSame('LOOP-PAY-UP-01', $d->loop_id);
        $this->assertSame('BP-02 Services Resolver', $d->owner_blueprint);
        $this->assertStringStartsWith('EVT-006 Payment Confirmed', $d->trigger());
        $this->assertSame('n8n orchestrator', $d->workflowSteps()[0]);
        $this->assertCount(28, $d->safeguardCodes());
        $this->assertNotContains('SG-12', $d->safeguardCodes());
        $this->assertSame(0.99, $d->csat_premium);

        $texts = DeliverableText::count();
        $before = $this->checksum();

        $this->seed(DeliverablesRegisterSeeder::class);

        $this->assertSame(8514, Deliverable::count());
        $this->assertSame(7785, DeliverableSprint::count());
        $this->assertSame($texts, DeliverableText::count());
        $this->assertSame($before, $this->checksum());
    }

    public function test_crosswalk_links_sprints_by_code_and_by_register_id(): void
    {
        $byCode = $this->sprint();
        $byRegister = $this->sprint('OLD-PG-001', 'TBCA-4C-5001', 'enterprise-admin-desk-sprint');

        $this->seed(DeliverablesRegisterSeeder::class);
        $report = DeliverablesRegisterSeeder::$report;

        $this->assertSame(1, $report['matched_code']);
        $this->assertSame(1, $report['matched_register_id']);
        $this->assertSame(7783, $report['unmatched']);
        $this->assertSame($byCode->id, DeliverableSprint::where('sprint_code', 'TBCA-4C-5288')->value('sprint_id'));
        $this->assertSame('register_id', DeliverableSprint::where('sprint_code', 'TBCA-4C-5001')->value('match'));
        $this->assertSame(['DEL-SV-0062'], Deliverable::forSprint($byRegister)->pluck('ref')->all());
    }

    public function test_sprint_page_shows_what_you_will_receive_for_the_selected_tier(): void
    {
        $sprint = $this->sprint();
        $this->seed(DeliverablesRegisterSeeder::class);

        $this->get("/sprints/{$sprint->slug}?package=premium")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Sprints/Show')
            ->where('selectedPackage', 'premium')
            ->has('deliverables', 1)
            ->where('deliverables.0.ref', 'DEL-SV-0562')
            ->where('deliverables.0.name', 'Cash Crisis Premium Sprint')
            ->where('deliverables.0.format', 'Report')
            ->where('deliverables.0.keyIssues.0', 'current position, objectives and success measures')
            ->where('deliverables.0.tiers.basic.pages', '15–22')
            ->where('deliverables.0.tiers.premium.pages', '52–68')
            ->where('deliverables.0.tiers.premium.extent', fn ($t) => str_starts_with($t, 'Board-ready report'))
            ->where('deliverables.0.pageUnit', 'pages'));

        // A Sprint with no register entry renders without the panel data.
        $other = $this->sprint('TBCA-ZZ-9999', null, 'no-register-sprint');
        $this->get("/sprints/{$other->slug}")->assertOk()->assertInertia(fn (Assert $p) => $p->where('deliverables', []));
    }

    public function test_admin_console_is_staff_only_and_renders_every_view(): void
    {
        $this->sprint();
        $this->seed(DeliverablesRegisterSeeder::class);

        $this->get('/admin/deliverables')->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['role' => 'client']))->get('/admin/deliverables')->assertForbidden();
        $this->get('/admin/deliverables/export.csv')->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $this->get('/admin/deliverables?tab=Webinars&tier=premium')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Admin/Deliverables/Index')
            ->where('results.total', 4)
            ->where('filters.tier', 'premium')
            ->where('stats.deliverables', 8514)
            ->where('stats.crosswalk', 7785));

        $this->get('/admin/deliverables?q=Cash+Crisis+Premium&format=Report')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('results.data', fn ($rows) => collect($rows)->pluck('ref')->contains('DEL-SV-0562')));

        $this->get('/admin/deliverables/DEL-SV-0562')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Admin/Deliverables/Show')
            ->where('register.ref', 'DEL-SV-0562')
            ->where('derived.loop_id', 'LOOP-PAY-UP-01')
            ->where('loop.owning_blueprint', 'BP-02 Services Resolver')
            ->where('formatStandard.code', 'RPT')
            ->where('derived.market_median', 'B R2,080 / S R5,200 / P R11,440')
            ->has('safeguards', 28)
            ->where('sprints.0.code', 'TBCA-4C-5288')
            ->where('sprints.0.href', '/sprints/cash-crisis-premium-sprint'));
        $this->get('/admin/deliverables/DEL-XX-0000')->assertNotFound();

        $this->get('/admin/deliverables/crosswalk?match=unmatched')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Admin/Deliverables/Crosswalk')
            ->where('stats.codes', 7785)
            ->where('stats.code', 1)
            ->where('rows.total', 7784));
        $this->get('/admin/deliverables/automation')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Admin/Deliverables/Automation')->has('loops', 17)->has('safeguards', 30)->has('specs', 9));
        $this->get('/admin/deliverables/standards')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Admin/Deliverables/Standards')->has('formats', 20)->has('countries', 54));

        // The admin hub lists the console.
        $this->get('/admin')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('consoles', fn ($c) => collect($c)->pluck('section')->contains('Deliverables')));
    }

    public function test_csv_export_carries_every_register_column_for_the_filtered_rows(): void
    {
        $this->seed(DeliverablesRegisterSeeder::class);

        $response = $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin/deliverables/export.csv?tab=Webinars');
        $response->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $content);
        $fh = fopen('php://memory', 'r+');
        fwrite($fh, substr($content, 3));
        rewind($fh);
        $lines = [];
        while (($row = fgetcsv($fh, escape: '')) !== false) {
            $lines[] = $row;
        }
        $this->assertSame('Ref', $lines[0][0]);
        $this->assertSame('V2 status', $lines[0][48]);
        $this->assertSame('Payment-trigger loop', $lines[0][50]);
        $this->assertCount(5, $lines);
        $this->assertSame('Webinars', $lines[1][1]);
        $this->assertCount(55, $lines[1]);
        $this->assertStringStartsWith('BASIC:', $lines[1][42]);
    }

    public function test_paid_sprint_order_records_deliverables_and_loop_in_the_ledger_event(): void
    {
        Http::fake();
        $sprint = $this->sprint();
        $this->seed(DeliverablesRegisterSeeder::class);

        $user = User::factory()->create();
        $order = Order::create([
            'reference' => 'TBCA-ORD-DEL-001', 'user_id' => $user->id, 'section' => 'sprints', 'status' => 'awaiting_payment',
            'currency' => 'ZAR', 'subtotal_zar' => 13728, 'vat_zar' => 2059, 'fees_zar' => 250, 'total_zar' => 16037,
        ]);
        $order->items()->create(['item_type' => 'sprint', 'item_code' => $sprint->code, 'name' => 'Cash Crisis Premium Sprint (Premium)', 'variant' => 'premium', 'quantity' => 1, 'unit_zar' => 13728, 'line_zar' => 13728]);
        $order->items()->create(['item_type' => 'sprint-addon', 'item_code' => "{$sprint->code}-rush", 'name' => 'Add-on: Rush', 'variant' => 'rush', 'quantity' => 1, 'unit_zar' => 0, 'line_zar' => 0]);

        $this->assertSame(0, IntegrationEvent::count(), 'Nothing is recorded before payment.');

        $order->update(['status' => 'paid', 'paid_at' => now()]);

        $event = IntegrationEvent::where('type', 'order.payment_verified')->sole();
        $plan = $event->payload['delivery_plan'];
        $this->assertSame('held', $event->status, 'Zoho stays off; the event is only recorded.');
        $this->assertSame('MP-DEL-2.0', $plan['register']);
        $this->assertCount(1, $plan['lines']);

        $line = $plan['lines'][0];
        $this->assertSame('TBCA-4C-5288', $line['item_code']);
        $this->assertSame('premium', $line['tier']);
        $this->assertSame('DEL-SV-0562', $line['deliverables'][0]['ref']);
        $this->assertSame('52–68', $line['deliverables'][0]['pages']);
        $this->assertSame('LOOP-PAY-UP-01', $line['deliverables'][0]['loop_id']);
        $this->assertContains('SG-01', $line['deliverables'][0]['safeguards']);
        $this->assertSame([['loop_id' => 'LOOP-PAY-UP-01', 'family' => 'Core advisory and service Sprints', 'owning_blueprint' => 'BP-02 Services Resolver']], $line['loops']);
        $this->assertSame('n8n orchestrator', $line['workflow'][0]);

        // The Zoho payload is unchanged apart from the added plan.
        $this->assertSame('TBCA-ORD-DEL-001', $event->payload['order_id']);
        Http::assertNothingSent();
    }

    public function test_load_migration_skips_an_empty_database_and_loads_a_seeded_one(): void
    {
        $migration = require database_path('migrations/2026_10_29_120000_load_deliverables_register.php');

        $migration->up();
        $this->assertSame(0, Deliverable::count(), 'An empty database is left to db:seed.');

        $this->sprint();
        $migration->up();
        $this->assertSame(8514, Deliverable::count());
        $this->assertSame(1, DeliverableSprint::where('match', 'code')->count());
        $this->assertSame(0, IntegrationEvent::count());
    }
}
