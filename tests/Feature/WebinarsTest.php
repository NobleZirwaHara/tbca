<?php

namespace Tests\Feature;

use App\Http\Controllers\Webinars\WebinarConsoleController;
use App\Models\Insights\Webinar;
use App\Models\Insights\WebinarRegistration;
use App\Models\User;
use App\Models\Webinars\ConsoleRecord;
use App\Models\Webinars\Poll;
use App\Models\Webinars\Question;
use Database\Seeders\Sections\WebinarsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WebinarsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(WebinarsSeeder::class);
    }

    /** The package default page path is resources/js/pages (lower case), so existence is checked here. */
    private function assertPageFile(string $component): void
    {
        $this->assertFileExists(resource_path("js/Pages/{$component}.tsx"));
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_every_public_webinar_page_renders(): void
    {
        $pages = [
            '/webinars' => 'Webinars/Index',
            '/webinars/replays' => 'Webinars/Replays',
            '/webinars/my-registrations' => 'Webinars/MyRegistrations',
            '/webinars/from-vision-to-execution' => 'Webinars/Show',
            '/webinars/accessing-funding-in-africa/register' => 'Webinars/Register',
            '/webinars/from-vision-to-execution/my-registration' => 'Webinars/MyRegistration',
            '/webinars/accessing-funding-in-africa/pre-event' => 'Webinars/PreEvent',
            '/webinars/ai-for-african-smes/live' => 'Webinars/Live',
            '/webinars/ai-for-african-smes/live/qa' => 'Webinars/LiveQa',
            '/webinars/ai-for-african-smes/live/polls' => 'Webinars/LivePolls',
            '/webinars/from-vision-to-execution/thank-you' => 'Webinars/ThankYou',
            '/webinars/from-vision-to-execution/offers' => 'Webinars/Offers',
            '/webinars/from-vision-to-execution/missed' => 'Webinars/Missed',
            '/webinars/from-vision-to-execution/replay' => 'Webinars/ReplayLibrary',
            '/webinars/from-vision-to-execution/replay/watch' => 'Webinars/Watch',
        ];

        foreach ($pages as $url => $component) {
            $this->assertPageFile($component);
            $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page->component($component, false));
        }

        $this->get('/webinars/from-vision-to-execution/calendar.ics')->assertOk()->assertHeader('Content-Type', 'text/calendar; charset=UTF-8');
        $this->get('/webinars/from-vision-to-execution/resources/brief')->assertOk();
        $this->get('/webinars/governance-for-growing-businesses')->assertNotFound();
    }

    public function test_find_webinars_filters_by_keyword_category_and_when(): void
    {
        $this->get('/webinars?q=funding')->assertInertia(fn (Assert $p) => $p
            ->where('searched', true)
            ->where('upcoming.0.slug', 'accessing-funding-in-africa')
            ->where('counts.total', fn ($n) => $n >= 1 && $n < 10));

        $this->get('/webinars?category=marketing&when=upcoming')->assertInertia(fn (Assert $p) => $p
            ->has('upcoming', 1)->where('upcoming.0.slug', 'digital-marketing-for-growth')->has('past', 0)->has('live', 0));

        $this->get('/webinars?when=replays&q=vision')->assertInertia(fn (Assert $p) => $p
            ->has('upcoming', 0)->where('past.0.slug', 'from-vision-to-execution'));

        $this->get('/webinars?q=zzzz-no-match')->assertInertia(fn (Assert $p) => $p->where('counts.total', 0));
        $this->get('/webinars?price=paid')->assertInertia(fn (Assert $p) => $p->where('upcoming.0.slug', 'sme-export-readiness'));
    }

    public function test_registration_flow_captures_notices_and_unlocks_attendee_pages(): void
    {
        $this->post('/webinars/accessing-funding-in-africa/register', [
            'first_name' => 'Thabo', 'last_name' => 'Maseko', 'email' => 'thabo@example.org', 'phone' => '+27 82 123 4567', 'country' => 'South Africa',
            'organisation' => 'Maseko Consulting', 'role' => 'Business Owner / Founder', 'industry' => 'Professional Services', 'participation' => 'live_hidden',
            'accept_privacy' => '1', 'accept_recording' => '1', 'accept_confidentiality' => '1', 'accept_offer' => '1', 'accept_boundary' => '1',
        ])->assertRedirect('/webinars/accessing-funding-in-africa/confirmed');

        $reg = WebinarRegistration::where('email', 'thabo@example.org')->firstOrFail();
        $this->assertSame('live_hidden', $reg->participation);
        $this->assertSame('WB-R1-2026.08', $reg->notices['recording']);

        $this->get('/webinars/accessing-funding-in-africa/confirmed')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Webinars/Confirmed', false)->where('registration.reference', $reg->reference));
        $this->get('/webinars/accessing-funding-in-africa/my-registration')->assertInertia(fn (Assert $p) => $p->where('registration.participationLabel', 'Attend Live (Do Not Appear in Replay)'));
        $this->get('/webinars/my-registrations')->assertInertia(fn (Assert $p) => $p->has('registrations', 1));
    }

    public function test_registration_requires_declarations_and_open_state(): void
    {
        $this->post('/webinars/accessing-funding-in-africa/register', ['first_name' => 'A', 'last_name' => 'B', 'email' => 'a@b.co', 'phone' => '1', 'country' => 'Kenya', 'role' => 'Other', 'participation' => 'live_recorded'])
            ->assertSessionHasErrors(['accept_privacy', 'accept_recording', 'accept_offer', 'accept_boundary']);

        $this->get('/webinars/from-vision-to-execution/register')->assertRedirect('/webinars/from-vision-to-execution');
    }

    public function test_paid_event_registration_goes_to_checkout(): void
    {
        $response = $this->post('/webinars/sme-export-readiness/register', [
            'first_name' => 'Ama', 'last_name' => 'Mensah', 'email' => 'ama@example.org', 'phone' => '+233 20 000 0000', 'country' => 'Ghana', 'role' => 'Entrepreneur',
            'participation' => 'live_recorded', 'accept_privacy' => '1', 'accept_recording' => '1', 'accept_confidentiality' => '1', 'accept_offer' => '1', 'accept_boundary' => '1',
        ]);
        $response->assertRedirect();
        $this->assertStringContainsString('/checkout/', $response->headers->get('Location'));
        $this->assertSame('pending_payment', WebinarRegistration::where('email', 'ama@example.org')->value('status'));
    }

    public function test_live_room_questions_and_votes_require_participation(): void
    {
        $live = Webinar::where('slug', 'ai-for-african-smes')->firstOrFail();
        $poll = Poll::where('webinar_id', $live->id)->where('status', 'active')->firstOrFail();

        $this->post("/webinars/{$live->slug}/live/questions", ['body' => 'How do we start?', 'category' => 'General Question'])->assertForbidden();

        $client = User::factory()->create();
        $this->actingAs($client)->post("/webinars/{$live->slug}/live/questions", ['body' => 'How do we start with AI?', 'category' => 'General Question'])->assertSessionHas('success');
        $this->assertSame('pending', Question::where('body', 'How do we start with AI?')->value('status'));

        $before = collect($poll->options)->sum('votes');
        $this->actingAs($client)->post("/webinars/{$live->slug}/live/polls/{$poll->id}/vote", ['option' => 1])->assertSessionHas('success');
        $this->actingAs($client)->post("/webinars/{$live->slug}/live/polls/{$poll->id}/vote", ['option' => 2]);
        $this->assertSame($before + 1, collect($poll->fresh()->options)->sum('votes'));
    }

    public function test_feedback_and_notes_are_saved(): void
    {
        $this->post('/webinars/from-vision-to-execution/feedback', ['rating' => 5, 'relevance' => 'Extremely relevant', 'valuable' => ['Expert insights']])->assertSessionHas('success');
        $this->post('/webinars/from-vision-to-execution/replay/notes', ['body' => 'Chapter 3 is key.'])->assertSessionHas('success');
        $this->get('/webinars/from-vision-to-execution/replay/watch')->assertInertia(fn (Assert $p) => $p->where('note', 'Chapter 3 is key.')->where('feedbackGiven', true));
    }

    public function test_staff_consoles_are_gated_and_render(): void
    {
        $this->get('/admin/webinars')->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['role' => 'client']))->get('/admin/webinars')->assertForbidden();

        $admin = $this->admin();
        $this->assertPageFile('Webinars/Console');
        $this->assertPageFile('Webinars/Confirmed');
        $this->actingAs($admin)->get('/admin/webinars')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Webinars/Console', false)->where('console.key', 'command-centre'));

        foreach (array_keys(WebinarConsoleController::CONSOLES) as $key) {
            $slug = $key === 'moderation' ? 'ai-for-african-smes' : ($key === 'preflight' ? 'accessing-funding-in-africa' : 'from-vision-to-execution');
            $this->actingAs($admin)->get("/admin/webinars/{$slug}/{$key}")->assertOk()->assertInertia(fn (Assert $p) => $p->component('Webinars/Console', false)->where('console.key', $key)->has('console.tabs'));
        }

        $this->actingAs($admin)->get('/admin/webinars/from-vision-to-execution/export/registrations')->assertOk();
    }

    public function test_gate_engine_blocks_go_live_until_preflight_passes(): void
    {
        $admin = $this->admin();
        $w = Webinar::where('slug', 'accessing-funding-in-africa')->firstOrFail();

        $this->actingAs($admin)->post("/admin/webinars/{$w->slug}/transition", ['to' => 'live'])->assertSessionHas('error');
        $this->actingAs($admin)->post("/admin/webinars/{$w->slug}/transition", ['to' => 'approved'])->assertSessionHas('error');
        $this->assertSame('awaiting_w1', $w->fresh()->state);

        ConsoleRecord::where('webinar_id', $w->id)->where('kind', 'task')->update(['status' => 'completed']);
        ConsoleRecord::where('webinar_id', $w->id)->where('kind', 'issue')->update(['status' => 'resolved']);
        $this->actingAs($admin)->post("/admin/webinars/{$w->slug}/transition", ['to' => 'approved'])->assertSessionHas('success');
        $this->actingAs($admin)->post("/admin/webinars/{$w->slug}/transition", ['to' => 'live'])->assertSessionHas('success');
        $this->assertSame('live', $w->fresh()->state);

        $this->actingAs($admin)->post("/admin/webinars/{$w->slug}/transition", ['to' => 'ended'])->assertSessionHas('success');
        $this->assertSame('awaiting_w3', $w->fresh()->state, 'An ended event never auto-publishes.');

        $this->actingAs($admin)->post("/admin/webinars/{$w->slug}/transition", ['to' => 'withheld'])->assertSessionHas('error');
        $this->actingAs($admin)->post("/admin/webinars/{$w->slug}/transition", ['to' => 'published'])->assertSessionHas('success');
        $this->assertTrue($w->fresh()->replayAvailable());
    }

    public function test_moderation_and_record_actions(): void
    {
        $admin = $this->admin();
        $live = Webinar::where('slug', 'ai-for-african-smes')->firstOrFail();
        $q = Question::where('webinar_id', $live->id)->where('status', 'pending')->firstOrFail();
        $this->actingAs($admin)->post("/admin/webinars/{$live->slug}/questions/{$q->id}", ['action' => 'approve'])->assertSessionHas('success');
        $this->assertSame('approved', $q->fresh()->status);

        $flag = Webinar::where('slug', 'from-vision-to-execution')->firstOrFail();
        $this->actingAs($admin)->post("/admin/webinars/{$flag->slug}/records", ['kind' => 'incident', 'title' => 'Caption feed lagged', 'category' => 'Technical', 'severity' => 'low', 'assigned' => 'N. Singh'])->assertSessionHas('success');
        $inc = ConsoleRecord::where('title', 'Caption feed lagged')->firstOrFail();
        $this->actingAs($admin)->patch("/admin/webinars/{$flag->slug}/records/{$inc->id}", ['status' => 'resolved'])->assertSessionHas('success');
        $this->assertSame('resolved', $inc->fresh()->status);

        $this->actingAs($admin)->post("/admin/webinars/{$flag->slug}/registrations/action", ['action' => 'replay'])->assertSessionHas('success');
        $this->assertSame(0, WebinarRegistration::where('webinar_id', $flag->id)->where('attendance', 'no_show')->where('followup_status', '!=', 'sent')->count());
    }
}
