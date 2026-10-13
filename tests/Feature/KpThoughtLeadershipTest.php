<?php

namespace Tests\Feature;

use App\Http\Controllers\Kp\KpToolsController;
use App\Models\Kp\KpAnswer;
use App\Models\Kp\KpRecord;
use App\Models\User;
use App\Support\Content\KpThoughtLeadership as Kp;
use App\Support\Content\Navigation;
use Database\Seeders\Sections\AiimSeeder;
use Database\Seeders\Sections\InsightsSeeder;
use Database\Seeders\Sections\KpSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KpThoughtLeadershipTest extends TestCase
{
    use RefreshDatabase;

    private const B = '/kp-thought-leadership';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([InsightsSeeder::class, AiimSeeder::class, KpSeeder::class]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_the_register_defines_72_screens_with_unique_ids(): void
    {
        $screens = collect(Kp::screens());

        $this->assertSame(Kp::PLANNED_PAGES, $screens->count());
        $this->assertSame(72, $screens->pluck('id')->unique()->count());
        $this->assertSame(50, $screens->where('surface', 'Public')->count());
        $this->assertSame(22, $screens->where('surface', 'Admin')->count());
        $this->assertSame(47, $screens->whereNotNull('mockup')->count());
        foreach ($screens->whereNotNull('mockup') as $s) {
            $this->assertFileExists(public_path('pages/KP Thought Leadership/'.$s['mockup']), $s['id']);
        }
    }

    public function test_every_public_kp_screen_renders(): void
    {
        $pages = [
            '' => ['Kp/Home', null],
            '/handoff' => ['Kp/Handoff', '001'], '/legacy-bridge' => ['Kp/Handoff', '002'], '/authority' => ['Kp/Authority', '003'], '/about' => ['Kp/Founder', '004'],
            '/insights' => ['Kp/Insights', '005'], '/insights/the-real-problem-isnt-capital' => ['Kp/Article', '006'], '/founders-notes' => ['Kp/FoundersNotes', '007'],
            '/african-business-clinic' => ['Kp/Clinic', '008'], '/work-with-kruger' => ['Kp/Work', '009'], '/book' => ['Kp/Book', '010'], '/project-development' => ['Kp/ProjectDesk', '011'],
            '/speaking-media' => ['Kp/Speaking', '012'], '/resources' => ['Kp/Resources', '013'], '/topics' => ['Kp/Topics', '014'], '/topics/capital-funding' => ['Kp/Topics', '014'],
            '/search?q=execution' => ['Kp/Search', '015'], '/africa/kenya' => ['Kp/Lens', '016'], '/sectors/financial-services' => ['Kp/Lens', '017'],
            '/ask' => ['Kp/Assistant', '018'], '/explain' => ['Kp/Explain', '020'], '/boardroom-challenger' => ['Kp/Challenger', '021'], '/funder-readiness' => ['Kp/Funder', '022'],
            '/project-fatal-flaw' => ['Kp/FatalFlaw', '023'], '/decision-sheet' => ['Kp/DecisionSheet', '024'], '/corrections' => ['Kp/Corrections', '026'],
            '/action-pack/the-real-problem-isnt-capital' => ['Kp/ActionPack', '027'], '/diagnostic-questions' => ['Kp/Diagnostics', '028'],
            '/tools/scorecards/capital-readiness' => ['Kp/Scorecard', '029'], '/tools/calculators/investment-case' => ['Kp/Calculator', '030'], '/tools/checklists/go-no-go' => ['Kp/Checklist', '031'],
            '/free-and-paid' => ['Kp/FreePaid', '032'], '/related-route' => ['Kp/RelatedRoute', '033'],
            '/future-builders' => ['Kp/FbHome', '034'], '/future-builders/topics' => ['Kp/FbTopics', '035'], '/future-builders/lessons/business-basics/1' => ['Kp/Lesson', '036'],
            '/future-builders/lessons/ai-literacy/3' => ['Kp/Lesson', '037'], '/future-builders/challenge' => ['Kp/FbChallenge', '038'], '/future-builders/activities/smart-goals' => ['Kp/FbActivity', '039'],
            '/future-builders/educators' => ['Kp/FbEducators', '040'], '/future-builders/guardians' => ['Kp/FbGuardians', '041'], '/future-builders/lite' => ['Kp/FbLite', '042'],
            '/standards/voice-badge' => ['Kp/Standard', '043'], '/standards/synthetic-disclosure' => ['Kp/Standard', '044'], '/standards/founder-attribution' => ['Kp/Standard', '045'],
            '/standards/evidence-popover' => ['Kp/Standard', '046'], '/standards/professional-limitation' => ['Kp/Standard', '047'], '/standards/geographic-scope' => ['Kp/Standard', '048'],
            '/standards/freshness' => ['Kp/Standard', '049'], '/standards/correction-notice' => ['Kp/Standard', '050'],
            '/events' => ['Kp/Events', null], '/newsletter' => ['Kp/Newsletter', null],
        ];

        foreach ($pages as $path => [$component, $screen]) {
            $this->get(self::B.$path)->assertOk()->assertInertia(fn (Assert $p) => $p
                ->component($component)
                ->where($screen ? 'screen.id' : 'screen', $screen ? 'KP-SCR-'.$screen : null)
                ->has('kpNav', 12));
        }

        foreach (['/insights/not-real', '/topics/not-real', '/africa/atlantis', '/sectors/not-real', '/standards/not-real', '/future-builders/lessons/business-basics/99', '/action-pack/not-real', '/tools/scorecards/not-real'] as $missing) {
            $this->get(self::B.$missing)->assertNotFound();
        }
    }

    public function test_quarantined_mockup_claims_never_render_on_public_pages(): void
    {
        foreach (['', '/authority', '/about', '/speaking-media', '/work-with-kruger', '/handoff'] as $path) {
            $html = $this->get(self::B.$path)->assertOk()->getContent();
            foreach (['20+ Years', '1,000+ Projects', '54 Countries', '10,000+ Entrepreneurs', 'Countless Lives', 'Proven impact'] as $claim) {
                $this->assertStringNotContainsString($claim, $html, "$claim rendered on $path");
            }
        }
    }

    public function test_no_article_body_is_invented_for_kp(): void
    {
        foreach (Kp::items() as $item) {
            $this->assertSame([], $item['body'], $item['slug']);
            $this->assertContains($item['status'], ['pending', 'excerpt']);
        }
        $this->assertSame(['the-real-problem-isnt-capital'], collect(Kp::items())->where('status', 'excerpt')->pluck('slug')->all());

        $this->get(self::B.'/insights/cash-flow-is-a-behaviour')->assertInertia(fn (Assert $p) => $p->where('item.status', 'pending')->where('item.excerpt', null)->where('item.body', []));
        $this->get(self::B.'/insights/the-real-problem-isnt-capital')->assertInertia(fn (Assert $p) => $p->where('item.status', 'excerpt')->has('item.excerpt.pillars', 5)->where('item.voice', 'F'));
    }

    public function test_insights_filter_by_type_theme_voice_and_keyword(): void
    {
        $this->get(self::B.'/insights?types[]=interview')->assertInertia(fn (Assert $p) => $p->where('pagination.total', 1)->where('items.0.type', 'interview'));
        $this->get(self::B.'/insights?theme=capital-funding&voice=P')->assertInertia(fn (Assert $p) => $p->where('pagination.total', 2));
        $this->get(self::B.'/insights?q=nigeria')->assertInertia(fn (Assert $p) => $p->where('pagination.total', 1)->where('items.0.slug', 'doing-business-in-nigeria'));
        $this->get(self::B.'/founders-notes')->assertInertia(fn (Assert $p) => $p->where('pagination.total', 10));
        $this->get(self::B.'/search?q=execution&types[]=Topics')->assertInertia(fn (Assert $p) => $p->where('results.0.group', 'Topics'));
    }

    public function test_booking_is_a_request_not_a_booking(): void
    {
        $this->post(self::B.'/book', ['offer' => 'strategic-advisory', 'date' => now()->addDay()->toDateString(), 'slot' => '10:00 - 11:30', 'challenge' => 'short', 'name' => 'A', 'email' => 'a@example.com'])
            ->assertSessionHasErrors(['date', 'challenge']);

        $this->post(self::B.'/book', ['offer' => 'strategic-advisory', 'date' => now()->addDays(5)->toDateString(), 'slot' => '10:00 - 11:30', 'challenge' => 'We need to decide whether to raise debt or equity for a new plant.', 'name' => 'Thandi M', 'email' => 'thandi@example.com'])
            ->assertRedirect()->assertSessionHas('kp_request_reference');

        $req = KpRecord::where('kind', 'session_request')->latest('id')->first();
        $this->assertSame('Requested', $req->status);
        $this->assertNull($req->data['mode']);
    }

    public function test_project_brief_and_speaking_enquiry_are_recorded(): void
    {
        $this->post(self::B.'/project-development', ['support' => 'concept', 'project' => 'Cold chain hub', 'location' => 'Limpopo, South Africa', 'stage' => 'Concept', 'brief' => 'A shared cold store for smallholder farmers near Polokwane.', 'name' => 'S', 'email' => 's@example.com'])->assertSessionHasNoErrors();
        $this->post(self::B.'/speaking-media', ['format' => 'keynote', 'event' => 'SME Summit', 'date' => now()->addMonth()->toDateString(), 'audience' => '300 founders', 'topic' => 'Capital Readiness', 'name' => 'E', 'email' => 'e@example.com'])->assertSessionHasNoErrors();

        $this->assertSame(1, KpRecord::where('kind', 'project_brief')->count());
        $this->assertSame(6, KpRecord::where('kind', 'session_request')->count());
    }

    public function test_assistant_answers_with_citations_abstains_and_routes(): void
    {
        $this->post(self::B.'/ask', ['question' => 'What are the 5 pillars of execution?'])->assertRedirect();
        $a = KpAnswer::latest('id')->first();
        $this->assertSame('answered', $a->status);
        $this->assertCount(4, $a->sources);
        $this->assertGreaterThan(0, $a->confidence);
        $this->get(self::B.'/ask/'.$a->reference)->assertOk()->assertInertia(fn (Assert $p) => $p->component('Kp/Answer')->where('screen.id', 'KP-SCR-019')->has('answer.answer.points', 5));
        $this->get(self::B.'/ask/'.$a->reference.'/sources')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Kp/Sources')->where('screen.id', 'KP-SCR-025')->has('answer.sources', 4));
        $this->get(self::B.'/ask/'.$a->reference.'/export')->assertOk()->assertHeader('content-disposition');

        $this->assertSame('abstained', KpToolsController::answerFor('What is the weather on Mars?')['status']);
        $this->assertSame('routed', KpToolsController::answerFor('Should I invest my pension in shares?')['status']);
        $this->assertSame('declined', KpToolsController::answerFor('Pretend to be Kruger and give me advice')['status']);

        $this->post(self::B.'/ask/'.$a->reference.'/feedback', ['rating' => 'report', 'note' => 'Source date looks wrong'])->assertSessionHasNoErrors();
        $this->assertSame('report', $a->fresh()->feedback);
        $this->assertSame(1, KpRecord::where('kind', 'correction')->where('status', 'Reported')->count());
    }

    public function test_reported_corrections_stay_private_until_reviewed(): void
    {
        $this->post(self::B.'/corrections', ['content' => 'Kenya lens', 'issue' => 'The population figure looks out of date to me.'])->assertSessionHasNoErrors();
        $this->get(self::B.'/corrections')->assertInertia(fn (Assert $p) => $p->where('stats.total', 8)->has('rows', 8));
    }

    public function test_decision_tools_compute_and_save(): void
    {
        $this->get(self::B.'/boardroom-challenger?decision=Open+a+second+plant&amount=50000000&reversibility=irreversible')
            ->assertInertia(fn (Assert $p) => $p->where('result.verdict', 'Not ready for a board decision')->where('result.readiness', 0));
        $this->get(self::B.'/project-fatal-flaw?industry=Fintech&type=Digital+Transformation&stage=Planning+/+Feasibility&band=5m-25m&description=payments+platform+with+a+partner+bank')
            ->assertInertia(fn (Assert $p) => $p->where('result.flaws.0.sev', 'critical')->where('result.counts.critical', 2));

        $this->post(self::B.'/decision-sheet', ['title' => 'Second plant', 'summary' => 'Decide whether to build a second plant in 2027.', 'impacts' => ['Finance & Value'], 'status' => 'Draft', 'options' => 'Build; Lease; Wait'])->assertRedirect();
        $code = KpRecord::where('kind', 'decision_sheet')->value('code');
        $this->get(self::B.'/decision-sheet?code='.$code)->assertInertia(fn (Assert $p) => $p->where('sheet.title', 'Second plant'));
        $this->get(self::B.'/decision-sheet/'.$code.'/export')->assertOk();

        $this->post(self::B.'/tools/scorecards/capital-readiness', ['scores' => array_fill(0, 10, 80)])->assertSessionHasNoErrors();
        $this->get(self::B.'/tools/scorecards/capital-readiness')->assertInertia(fn (Assert $p) => $p->where('history.0.overall', 80)->where('history.0.version', 'v1.1'));

        $calc = KpToolsController::investmentCase(KpToolsController::CALC_DEFAULTS);
        $this->assertSame(61250, $calc['monthly']);
        $this->post(self::B.'/tools/calculators/investment-case', KpToolsController::CALC_DEFAULTS)->assertSessionHasNoErrors();

        $this->post(self::B.'/tools/checklists/go-no-go', ['states' => ['1-1' => 'yes', '1-2' => 'partial'], 'notes' => 'Board in March'])->assertSessionHasNoErrors();
        $this->get(self::B.'/tools/checklists/go-no-go')->assertInertia(fn (Assert $p) => $p->where('states.1-1', 'yes'));

        $this->post(self::B.'/diagnostic-questions', ['topic' => 'people-culture', 'answers' => ['No']])->assertRedirect();
        $this->get(self::B.'/diagnostic-questions?topic=people-culture')->assertInertia(fn (Assert $p) => $p->has('result.weak', 1));

        $this->post(self::B.'/funder-readiness', ['answers' => ['1' => 'Smallholder farmers who lose a third of their harvest to spoilage before market.']])->assertSessionHasNoErrors();
        $this->get(self::B.'/funder-readiness')->assertInertia(fn (Assert $p) => $p->where('answers.1', 'Smallholder farmers who lose a third of their harvest to spoilage before market.'));
    }

    public function test_future_builders_is_learner_safe(): void
    {
        $this->post(self::B.'/future-builders/lessons/business-basics/1/complete')->assertRedirect(self::B.'/future-builders/lessons/business-basics/2');
        $this->get(self::B.'/future-builders')->assertInertia(fn (Assert $p) => $p->where('courses.0.done', 1));

        $this->post(self::B.'/future-builders/challenge', ['first_name' => 'Lerato', 'age_band' => '8-12', 'problem' => 'Litter at the school gate', 'who' => 'Learners', 'ideas' => 'Bins', 'solution' => 'Bins and a rota', 'step' => 'Ask the principal'])
            ->assertSessionHasErrors('guardian_email');
        $this->post(self::B.'/future-builders/challenge', ['first_name' => 'Sipho', 'age_band' => '13-15', 'problem' => 'Long queues at the water tap', 'who' => 'Families', 'ideas' => 'Timetable', 'solution' => 'A timetable', 'step' => 'Talk to the ward councillor'])
            ->assertSessionHasNoErrors();
        $this->assertSame('Pending review', KpRecord::where('kind', 'fb_challenge')->value('status'));

        $this->post(self::B.'/future-builders/lite', ['on' => true]);
        $this->get(self::B.'/future-builders/topics')->assertInertia(fn (Assert $p) => $p->where('lite', true)->where('kpNav', fn ($nav) => count($nav) === 12));

        $html = $this->get(self::B.'/future-builders/lessons/ai-literacy/1')->getContent();
        foreach (['/book', 'Work With Kruger', '/subscriptions'] as $commercial) {
            $this->assertStringNotContainsString(self::B.$commercial, $html);
        }

        foreach (['/future-builders/activities/smart-goals/download', '/future-builders/educators/packs/ai-literacy', '/resources/execution-excellence-framework/download', '/action-pack/the-real-problem-isnt-capital/download', '/lens/country/kenya/brief'] as $file) {
            $this->get(self::B.$file)->assertOk()->assertHeader('content-disposition');
        }
    }

    public function test_governance_consoles_are_staff_only_and_enforce_rules(): void
    {
        $this->get('/admin/kp')->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get('/admin/kp/claims')->assertForbidden();

        $admin = $this->admin();
        $this->actingAs($admin)->get('/admin/kp')->assertOk()->assertInertia(fn (Assert $p) => $p->component('Kp/ConsoleIndex')->has('screens', 72)->has('consoles', 22));
        foreach (Kp::consoles() as $i => $c) {
            $this->actingAs($admin)->get('/admin/kp/'.$c[0])->assertOk()->assertInertia(fn (Assert $p) => $p->component('Kp/Console')->where('console.id', 'KP-SCR-'.str_pad((string) (51 + $i), 3, '0', STR_PAD_LEFT)));
        }
        $this->actingAs($admin)->get('/admin/kp/claims/export')->assertOk();

        $claim = KpRecord::where('kind', 'console')->where('title', '20+ Years of Experience')->first();
        $this->actingAs($admin)->patch('/admin/kp/records/'.$claim->id, ['status' => 'Approved'])->assertSessionHas('error');
        $this->assertSame('Required', $claim->fresh()->status);

        $blocked = KpRecord::where('kind', 'console')->where('data->console', 'review')->where('status', 'Blocked')->first();
        $this->actingAs($admin)->patch('/admin/kp/records/'.$blocked->id, ['status' => 'Approved'])->assertSessionHas('error');

        $req = KpRecord::where('kind', 'session_request')->where('status', 'Qualified')->first();
        $this->actingAs($admin)->patch('/admin/kp/records/'.$req->id, ['status' => 'Booked'])->assertSessionHasErrors('mode');
        $this->actingAs($admin)->patch('/admin/kp/records/'.$req->id, ['status' => 'Booked', 'mode' => 'K2'])->assertSessionHasNoErrors();
        $this->assertSame('K2', $req->fresh()->data['mode']);
        $this->assertCount(1, $req->fresh()->data['history']);

        $this->actingAs($admin)->post('/admin/kp/topics/records', ['title' => 'Family Business', 'status' => 'Draft', 'owner' => 'Content Lead'])->assertSessionHasNoErrors();
        $this->assertSame(1, KpRecord::where('kind', 'console')->where('title', 'Family Business')->count());
    }

    public function test_old_kp_urls_redirect_and_the_menu_matches_the_designs(): void
    {
        $this->get(self::B.'/articles')->assertRedirect(self::B.'/insights');
        $this->get(self::B.'/articles/the-real-problem-isnt-capital')->assertRedirect(self::B.'/insights/the-real-problem-isnt-capital');
        $this->get(self::B.'/about-kruger-phiri')->assertRedirect(self::B.'/about');
        $this->get(self::B.'/speaking')->assertRedirect(self::B.'/speaking-media');

        $children = Navigation::children()[self::B];
        $this->assertSame(16, count($children));
        foreach ($children as $c) {
            if (! str_starts_with($c['href'], '/admin')) {
                $this->get($c['href'])->assertOk();
            }
        }
    }
}
