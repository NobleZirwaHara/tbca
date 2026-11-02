<?php

namespace Tests\Feature\Aiim;

use App\Models\Aiim\CaseFile;
use App\Models\Aiim\Engagement;
use App\Models\Booking;
use App\Models\Sprint;
use App\Models\User;
use App\Support\Aiim\EngagementFlow;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\ProtoEngagement;
use App\Support\Industries\IndustryData;
use Database\Seeders\Sections\AiimSeeder;
use Database\Seeders\Sections\CountryHubSeeder;
use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Engagement and mandate pages of the "TBCA AIIM Botswana" prototype (mock-ups 39 to 70):
 * request forms and review, discovery booking, quotation (QLINES priced from the app),
 * letter, signature, deposit, the custom intelligence report and the mandate-stage pages
 * with their actions.
 */
class EngagementTest extends TestCase
{
    use RefreshDatabase;

    private const PRICES = ['AAB-EMB-205' => 3050, 'AAB-EMB-210' => 3050, 'AAB-EMB-211' => 3100, 'AAB-EMB-171' => 3100, 'AAB-EMB-197' => 3100, 'AAB-EMB-123' => 1750, 'AAB-EMB-168' => 2000, 'AAB-EMB-204' => 2000];

    protected function setUp(): void
    {
        parent::setUp();
        User::factory()->create(['email' => 'amahle@agritechsa.co.za', 'name' => 'Amahle Dlamini', 'role' => 'client']);
        $this->seed([IndustriesSeeder::class, CountryHubSeeder::class, AiimSeeder::class]);
        $i = 0;
        foreach (self::PRICES as $code => $zar) {
            Sprint::create(['code' => $code, 'slug' => 'aiim-eng-test-'.$i++, 'title' => $code, 'type' => 'sprint', 'category' => 'research-reports', 'summary' => $code, 'description' => $code,
                'price_zar' => $zar, 'status' => 'published', 'packages' => [['key' => 'basic', 'name' => 'Basic', 'zar' => $zar], ['key' => 'standard', 'name' => 'Standard', 'zar' => $zar * 2], ['key' => 'premium', 'name' => 'Premium', 'zar' => $zar * 3]]]);
        }
        IndustryData::forget();
    }

    private function amahle(): User
    {
        return User::query()->where('email', 'amahle@agritechsa.co.za')->firstOrFail();
    }

    /** A Botswana custom intelligence mandate in progress (copper, Ghanzi). */
    private function bwMandate(User $u, array $over = []): Engagement
    {
        return Engagement::create($over + [
            'reference' => 'ENG-TEST-BW1', 'mandate_reference' => 'MND-TEST-BW1', 'user_id' => $u->id, 'type' => 'custom-intelligence', 'status' => 'in_progress',
            'title' => 'Copper belt supplier niches', 'progress' => 30, 'step' => 5,
            'request' => ['detail' => 'Which Kalahari Copper Belt supplier niches can a foreign SME enter?', 'countries' => ['botswana'], 'sector_code' => 'MIN', 'unit' => 'Ghanzi'],
            'quote' => Pricing::engagement(EngagementFlow::quoteTemplate('custom-intelligence')) + ['number' => 'FQ-TEST', 'valid_until' => now()->addDays(10)->toDateString()],
            'deposit_paid_at' => now()->subDay(),
        ]);
    }

    public function test_custom_request_form_renders_for_botswana_and_another_country(): void
    {
        $u = $this->amahle();
        $this->actingAs($u)->get('/aiim/custom-intelligence')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/RequestWizard')
            ->where('type', 'custom-intelligence')
            ->where('country.slug', 'botswana')->where('country.isBw', true)
            ->has('options.sectors', 18)->where('options.sectors.2.name', 'Diamonds, Copper & Mining')
            ->has('options.units', 16)
            ->has('options.tickets', 4)
            ->has('rail.items', 3)->where('rail.items.0.code', 'AAB-EMB-123')->where('rail.items.0.price', 1750));

        $this->actingAs($u)->get('/aiim/custom-intelligence?country=malawi')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->where('country.slug', 'malawi')->where('country.isBw', false)
            ->has('options.sectors', 18)->where('options.sectors.2.name', 'Mining & Minerals'));

        $this->actingAs($u)->get('/aiim/workspace/advisor-request')->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/RequestWizard')->where('type', 'advisory')->where('user.email', $u->email)->has('options.desks', 6)->has('options.channels', 4));
    }

    public function test_custom_request_submits_and_shows_the_analyst_review(): void
    {
        $u = $this->amahle();
        $this->actingAs($u)->post('/aiim/workspace/engagements/request', ['type' => 'custom-intelligence', 'country' => 'botswana', 'question' => ''])
            ->assertSessionHasErrors(['question']);

        $res = $this->actingAs($u)->post('/aiim/workspace/engagements/request', [
            'type' => 'custom-intelligence', 'country' => 'botswana', 'question' => 'Which copper belt supplier niches suit a foreign SME?', 'sector' => 'MIN', 'unit' => 'Ghanzi', 'ticket' => ProtoEngagement::TICKETS[1],
        ]);
        $e = Engagement::query()->where('user_id', $u->id)->latest('id')->firstOrFail();
        $res->assertRedirect("/aiim/custom-intelligence?ref={$e->reference}");
        $this->assertSame('submitted', $e->status);
        $this->assertSame(['mining-minerals'], $e->request['sectors']);

        $this->actingAs($u)->get("/aiim/custom-intelligence?ref={$e->reference}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/CustomReview')
            ->where('engagement.reference', $e->reference)
            ->where('sectorName', 'Diamonds, Copper & Mining')
            ->where('coverage.templates', fn ($n) => $n > 0)
            ->has('gaps', 16));

        // Another country: review renders with the pack still loading.
        $this->actingAs($u)->post('/aiim/workspace/engagements/request', ['type' => 'custom-intelligence', 'country' => 'malawi', 'question' => 'Where are the agro-processing gaps in Malawi?', 'sector' => 'AGR', 'ticket' => ProtoEngagement::TICKETS[0]]);
        $m = Engagement::query()->where('user_id', $u->id)->latest('id')->firstOrFail();
        $this->actingAs($u)->get("/aiim/custom-intelligence?ref={$m->reference}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/CustomReview')->where('country.slug', 'malawi')->where('coverage', null)->has('gaps', 0));
    }

    public function test_advisor_request_books_a_discovery_slot(): void
    {
        $u = $this->amahle();
        $this->actingAs($u)->post('/aiim/workspace/engagements/request', [
            'type' => 'advisory', 'country' => 'botswana', 'name' => $u->name, 'email' => $u->email, 'desk' => ProtoEngagement::DESKS[1], 'channel' => 'Video call', 'topic' => 'Solar O&M market entry near Jwaneng',
        ])->assertRedirect();
        $e = Engagement::query()->where('user_id', $u->id)->where('type', 'advisory')->latest('id')->firstOrFail();
        $this->assertSame('submitted', $e->status);

        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/discovery")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/Discovery')->has('days', 5)->has('days.0.slots', 4)->where('days.0.slots.0.time', '09:00'));

        $date = now()->addWeekday()->toDateString();
        $this->actingAs($u)->post('/bookings', [
            'type' => 'aiim-discovery', 'topic' => 'Solar O&M', 'date' => $date, 'time' => '11:00', 'duration_minutes' => 30, 'channel' => 'video',
            'name' => $u->name, 'email' => $u->email, 'meta' => ['engagement' => $e->reference], 'redirect' => "/aiim/workspace/engagements/{$e->reference}/booked?booking={reference}",
        ])->assertRedirect();
        $b = Booking::query()->latest('id')->firstOrFail();
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/booked?booking={$b->reference}")->assertRedirect("/aiim/workspace/engagements/{$e->reference}/discovery/confirmed");
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/discovery/confirmed")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/DiscoveryConfirmed')->where('booking.reference', $b->reference)->where('booking.duration', 30));
    }

    public function test_quotation_uses_qlines_priced_from_the_app_and_the_flow_reaches_checkout(): void
    {
        $u = $this->amahle();
        $items = EngagementFlow::quoteTemplate('advisory');
        $this->assertSame(ProtoEngagement::QLINES, array_column($items, 'code'));
        $this->assertSame(3050, $items[0]['amount']);

        $e = $this->bwMandate($u, ['status' => 'quoted', 'deposit_paid_at' => null, 'outcome' => ['objectives' => ['Market entry'], 'points' => ['BW-GRN-F2'], 'next' => ['Memo', 'Pre-feasibility']]]);
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/outcome")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/Outcome')->where('rows.0.0', 'Need')->where('rows.2.0', 'Recommended')->where('rows.2.1', 'Memo → Pre-feasibility')->has('rail.items', 3));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/quote")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/Quote')->has('engagement.quote.items', 5)->where('engagement.quote.items.2.code', 'AAB-EMB-211'));

        $this->actingAs($u)->post("/aiim/workspace/engagements/{$e->reference}/quote", ['accept' => 1])->assertRedirect("/aiim/workspace/engagements/{$e->reference}/letter");
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/letter")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Engagement/Letter')->where('mode', 'review')->where('country.isBw', true));
        $this->actingAs($u)->post("/aiim/workspace/engagements/{$e->reference}/letter", ['decision' => 'accept', 'accept' => 0])->assertSessionHasErrors('accept');
        $this->actingAs($u)->post("/aiim/workspace/engagements/{$e->reference}/letter", ['decision' => 'accept', 'accept' => 1])->assertRedirect("/aiim/workspace/engagements/{$e->reference}/sign");
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/sign")->assertOk()->assertInertia(fn (Assert $p) => $p->where('mode', 'sign'));
        $this->actingAs($u)->post("/aiim/workspace/engagements/{$e->reference}/sign", ['signature' => 'Someone Else', 'agree' => 1])->assertSessionHasErrors('signature');
        $this->actingAs($u)->post("/aiim/workspace/engagements/{$e->reference}/sign", ['signature' => $u->name, 'drawn' => 'data:image/png;base64,AAAA', 'agree' => 1])->assertRedirect("/aiim/workspace/engagements/{$e->reference}/pay");
        $this->assertSame('signed', $e->fresh()->status);
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/pay")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Aiim/Engagement/Deposit'));
        $this->actingAs($u)->post("/aiim/workspace/engagements/{$e->reference}/pay", ['method' => 'card'])->assertRedirect();
        $this->assertNotNull($e->fresh()->deposit_order_id);
    }

    public function test_custom_intelligence_report_for_botswana_and_another_country(): void
    {
        $u = $this->amahle();
        $e = $this->bwMandate($u);
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/Mandate')
            ->where('country.isBw', true)
            ->where('report.sector', 'MIN')
            ->where('report.facts', fn ($f) => count($f) > 0)
            ->where('report.templates', fn ($t) => count($t) > 0)
            ->where('report.permits.issuer', fn ($s) => filled($s))
            ->where('brief.code', 'AAB-EMB-193'));

        $sa = Engagement::query()->where('reference', 'ENG-20250507-001')->firstOrFail();
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$sa->reference}")->assertOk()->assertInertia(fn (Assert $p) => $p
            ->component('Aiim/Engagement/Mandate')->where('country.slug', 'south-africa')->where('report', null));

        $this->actingAs(User::factory()->create())->get("/aiim/workspace/engagements/{$e->reference}")->assertForbidden();
    }

    public function test_mandate_pages_render_for_botswana_and_another_country(): void
    {
        $u = $this->amahle();
        $bw = $this->bwMandate($u);
        $sa = Engagement::query()->where('reference', 'ENG-20250507-001')->firstOrFail();
        $pages = [
            'verification/scope' => 'Aiim/Mandate/Verification', 'verification/costs' => 'Aiim/Mandate/Verification', 'verification/progress' => 'Aiim/Mandate/Verification',
            'verification/report' => 'Aiim/Mandate/Verification', 'deep-dive' => 'Aiim/Mandate/DeepDive', 'packaging' => 'Aiim/Mandate/Packaging',
            'introductions' => 'Aiim/Mandate/IntroConsent', 'introductions/room' => 'Aiim/Mandate/IntroRoom', 'handoff/dd' => 'Aiim/Mandate/Handoff',
            'handoff/vdr' => 'Aiim/Mandate/Handoff', 'handoff/project-advisory' => 'Aiim/Mandate/Handoff', 'delivery' => 'Aiim/Mandate/Delivery',
            'change' => 'Aiim/Mandate/Case', 'refund' => 'Aiim/Mandate/Case', 'dispute' => 'Aiim/Mandate/Case', 'pause' => 'Aiim/Mandate/Case',
            'restart' => 'Aiim/Mandate/Case', 'cancel' => 'Aiim/Mandate/Case', 'ledger' => 'Aiim/Mandate/Ledger',
        ];
        foreach ([$bw, $sa] as $e) {
            foreach ($pages as $path => $component) {
                $this->actingAs($u)->get("/aiim/workspace/engagements/{$e->reference}/{$path}")->assertOk()->assertInertia(fn (Assert $p) => $p->component($component)->where('engagement.reference', $e->reference));
            }
        }

        $this->actingAs($u)->get("/aiim/workspace/engagements/{$bw->reference}/verification/scope")->assertInertia(fn (Assert $p) => $p
            ->where('view', 'scope')->has('hotspots', 42)->where('estimate.base.price', 3100));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$sa->reference}/verification/scope")->assertInertia(fn (Assert $p) => $p->has('hotspots', 0)->where('hotspot', null));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$bw->reference}/deep-dive")->assertInertia(fn (Assert $p) => $p->has('sectors', 18)->where('initial', 'MIN'));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$sa->reference}/deep-dive")->assertInertia(fn (Assert $p) => $p->has('sectors', 0));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$bw->reference}/packaging")->assertInertia(fn (Assert $p) => $p->has('items', 8)->where('items.1.svc.code', 'AAB-EMB-211')->where('items.1.done', false));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$bw->reference}/handoff/dd")->assertInertia(fn (Assert $p) => $p->where('cat', 'Due Diligence')->where('site', '/due-diligence')->has('services', 15));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$sa->reference}/handoff/dd")->assertInertia(fn (Assert $p) => $p->where('handoff.reference', 'HD-2025-05-07-001'));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$sa->reference}/ledger")->assertInertia(fn (Assert $p) => $p->has('entries', 6)->where('totals.paid', 51750));
        $this->actingAs($u)->get("/aiim/workspace/engagements/{$bw->reference}/change")->assertInertia(fn (Assert $p) => $p->where('kind', 'change')->has('services', 4));
    }

    public function test_mandate_actions_record_real_changes(): void
    {
        $u = $this->amahle();
        $e = $this->bwMandate($u);
        $post = fn (array $data) => $this->actingAs($u)->post("/aiim/workspace/engagements/{$e->reference}/message", $data);
        $base = "/aiim/workspace/engagements/{$e->reference}";

        $post(['action' => 'verify-scope', 'hotspot' => 3, 'checks' => ['gps', 'sanctions']])->assertRedirect("{$base}/verification/costs");
        $this->assertSame(3, $e->fresh()->verification['scope']['hotspot']);
        $this->actingAs($u)->get("{$base}/verification/costs")->assertInertia(fn (Assert $p) => $p->where('hotspot.i', 3));

        $post(['action' => 'ext-cost', 'caps' => [1000, 500, 0, 250]])->assertSessionHasErrors('approve');
        $post(['action' => 'ext-cost', 'caps' => [1000, 500, 0, 250], 'approve' => 1])->assertRedirect("{$base}/verification/progress");
        $this->assertEquals(1750, $e->fresh()->verification['approved_external']);

        $post(['action' => 'consent', 'share' => 1, 'verified' => 1])->assertRedirect("{$base}/introductions/room");
        $this->assertNotNull($e->fresh()->introduction?->client_consented_at);
        $post(['action' => 'intro-message', 'message' => 'Happy to share the teaser.'])->assertRedirect();
        $this->assertSame('Happy to share the teaser.', collect($e->fresh()->introduction->activity)->last()['text']);

        $post(['action' => 'refund', 'reason' => 'Not as described', 'details' => 'The draft missed Ghanzi.'])->assertRedirect("{$base}/ledger");
        $this->assertSame('submitted', CaseFile::query()->where('engagement_id', $e->id)->where('type', 'refund')->value('status'));
        $post(['action' => 'cancel', 'reason' => 'Budget'])->assertSessionHasErrors('flag');
        $post(['action' => 'pause', 'date' => now()->addWeek()->toDateString(), 'reason' => 'Board review'])->assertRedirect("{$base}/ledger");

        $post(['action' => 'change', 'what' => 'Add Kgalagadi sites', 'service' => 'AAB-EMB-171', 'approve' => 1])->assertRedirect();
        $case = CaseFile::query()->where('engagement_id', $e->id)->where('type', 'scope-change')->firstOrFail();
        $this->assertSame('approved_awaiting_payment', $case->status);
        $this->assertEquals(3100, $case->amount_zar);

        $post(['action' => 'acceptance', 'received' => 1])->assertSessionHas('error');
        $e->update(['status' => 'delivered']);
        $post(['action' => 'acceptance', 'received' => 1, 'comments' => 'All good'])->assertRedirect();
        $this->assertSame('accepted', $e->fresh()->status);

        $post(['message' => 'Thanks for the update'])->assertSessionHas('success');
        $this->actingAs(User::factory()->create())->post("{$base}/message", ['action' => 'refund', 'reason' => 'x', 'details' => 'y'])->assertForbidden();
    }
}
