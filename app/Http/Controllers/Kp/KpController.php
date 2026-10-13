<?php

namespace App\Http\Controllers\Kp;

use App\Http\Controllers\Controller;
use App\Models\Insights\Industry;
use App\Models\Insights\Webinar;
use App\Models\Kp\KpRecord;
use App\Support\About\Content as AboutContent;
use App\Support\Content\KpThoughtLeadership as Kp;
use App\Support\Content\KpTools;
use App\Support\Webinars\WebinarPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * KP Thought Leadership public pages (KP-SCR-001 to KP-SCR-017, 032, 033, 043 to 050).
 */
class KpController extends Controller
{
    /* ------------------------------------------------------------------ */
    /* Landing, handoff and authority */
    /* ------------------------------------------------------------------ */

    public function home(Request $request): Response
    {
        $tab = (string) $request->query('tab', 'featured');
        $items = collect(Kp::items());
        $list = match ($tab) {
            'articles' => $items->where('type', 'article'),
            'interviews' => $items->where('type', 'interview'),
            'notes' => $items->where('type', 'founders-note'),
            'frameworks' => $items->where('type', 'framework'),
            default => $items->where('featured', true),
        };

        return $this->page('Kp/Home', null, [
            'tab' => $tab,
            'items' => $list->take(5)->map(fn ($i) => $this->card($i))->values(),
            'themes' => $this->themesWithCounts(),
            'focusAreas' => Kp::focusAreas(),
            'engage' => [['Book KP to Speak', 'Keynotes & Conferences', 'mic', Kp::BASE.'/speaking-media'], ['Advisory Session', 'One-to-one strategy', 'users', Kp::BASE.'/work-with-kruger'], ['Boardroom Briefing', 'Executive insights', 'briefcase', Kp::BASE.'/book?offer=board-dialogue'], ['Media & Interviews', 'Press & broadcast', 'video', Kp::BASE.'/speaking-media#enquiry']],
        ]);
    }

    public function handoff(Request $request): Response
    {
        return $this->page('Kp/Handoff', '001', [
            'mode' => 'handoff',
            'handoffId' => 'KP-HO-'.now()->format('Y-m-d').'-'.Str::upper(Str::random(4)),
            'source' => $request->headers->get('referer') ? parse_url((string) $request->headers->get('referer'), PHP_URL_HOST) : 'businessclinic.africa',
        ]);
    }

    public function legacyBridge(): Response
    {
        return $this->page('Kp/Handoff', '002', [
            'mode' => 'bridge',
            'handoffId' => 'KP-LB-'.now()->format('Ymd'),
            'source' => 'businessclinic.africa',
            'mapping' => [
                [Kp::BASE, '/'], [Kp::BASE.'/insights', '/insights'], [Kp::BASE.'/founders-notes', '/founders-notes'], [Kp::BASE.'/work-with-kruger', '/work-with-kruger'], [Kp::BASE.'/future-builders', '/future-builders'],
            ],
        ]);
    }

    public function authority(): Response
    {
        return $this->page('Kp/Authority', '003', [
            'pillars' => Kp::corePillars(),
            'latest' => collect(Kp::items())->take(4)->map(fn ($i) => $this->card($i))->values(),
            'rules' => Kp::integrityRules(),
            'tools' => [['Capital Readiness Scorecard', Kp::BASE.'/tools/scorecards/capital-readiness'], ['Project Fatal-Flaw Explorer', Kp::BASE.'/project-fatal-flaw'], ['Boardroom Decision Sheet', Kp::BASE.'/decision-sheet'], ['Funder Readiness Interviewer', Kp::BASE.'/funder-readiness']],
        ]);
    }

    public function about(): Response
    {
        $leader = AboutContent::findLeader('kruger-phiri') ?? [];

        return $this->page('Kp/Founder', '004', [
            'leader' => collect($leader)->only(['name', 'post_nominal', 'role', 'summary', 'bio', 'expertise', 'qualifications', 'state', 'reviewed'])->all(),
            'focusAreas' => Kp::focusAreas(),
            'rules' => Kp::integrityRules(),
            'claims' => KpRecord::where('kind', 'console')->where('data->console', 'claims')->orderBy('sort')->get()->map(fn ($r) => ['code' => $r->code, 'claim' => $r->status === 'Approved' ? $r->title : null, 'status' => $r->status])->all(),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Insights, notes, clinic and topics */
    /* ------------------------------------------------------------------ */

    public function insights(Request $request): Response
    {
        $f = $this->insightFilters($request);
        $all = collect(Kp::items())->where('type', '!=', 'founders-note');

        return $this->page('Kp/Insights', '005', $this->listing($all, $f, 9) + [
            'voices' => collect(Kp::voices())->map(fn ($v, $k) => ['code' => $k, 'label' => $v[0], 'body' => $v[1]])->values(),
            'typeCounts' => collect(Kp::types())->except('founders-note')->map(fn ($t, $k) => ['key' => $k, 'label' => $t[1], 'count' => $all->where('type', $k)->count()])->values(),
            'stats' => ['total' => $all->count(), 'current' => $all->where('freshness', 'current')->count(), 'reviewDue' => $all->where('freshness', 'review-due')->count(), 'stale' => $all->where('freshness', 'stale')->count(), 'excerpt' => $all->whereIn('status', ['published', 'excerpt'])->count()],
            'themes' => $this->themesWithCounts(),
        ]);
    }

    public function article(string $slug): Response
    {
        $item = Kp::find($slug);
        abort_unless($item, 404);
        $leader = AboutContent::findLeader('kruger-phiri') ?? [];

        return $this->page('Kp/Article', '006', [
            'item' => $this->card($item) + ['excerpt' => $item['excerpt'], 'body' => $item['body'], 'readMinutes' => $item['read_minutes']],
            'related' => collect(Kp::items())->where('theme', $item['theme'])->where('slug', '!=', $slug)->take(3)->map(fn ($i) => $this->card($i))->values(),
            'author' => ['name' => $leader['name'] ?? 'Kruger Phiri', 'role' => $leader['role'] ?? 'Founder'],
        ]);
    }

    public function foundersNotes(Request $request): Response
    {
        $f = $this->insightFilters($request);

        return $this->page('Kp/FoundersNotes', '007', $this->listing(collect(Kp::items())->where('type', 'founders-note'), $f, 8) + [
            'themes' => Kp::themes(),
        ]);
    }

    public function clinic(Request $request): Response
    {
        $items = collect(Kp::items());

        return $this->page('Kp/Clinic', '008', [
            'q' => (string) $request->query('q', ''),
            'hubs' => $this->themesWithCounts(),
            'explainers' => $items->whereIn('type', ['explainer', 'article'])->take(6)->map(fn ($i) => $this->card($i))->values(),
            'diagnostics' => [
                ['Business Health Check', 'Overall business performance', '/business-health-score'],
                ['Capital Readiness Diagnostic', 'Are you ready for funding?', Kp::BASE.'/tools/scorecards/capital-readiness'],
                ['Project Readiness Test', 'Is your project investment-ready?', Kp::BASE.'/project-fatal-flaw'],
                ['Market Opportunity Check', 'Validate your market opportunity', Kp::BASE.'/diagnostic-questions?topic=market-customers'],
                ['Operational Maturity Scan', 'Assess your operations', Kp::BASE.'/diagnostic-questions?topic=operations'],
            ],
            'tools' => [['Capital Readiness Scorecard', Kp::BASE.'/tools/scorecards/capital-readiness'], ['Project Fatal-Flaw Explorer', Kp::BASE.'/project-fatal-flaw'], ['Boardroom Decision Sheet', Kp::BASE.'/decision-sheet'], ['Funding Readiness Interviewer', Kp::BASE.'/funder-readiness'], ['Investment Case Calculator', Kp::BASE.'/tools/calculators/investment-case']],
        ]);
    }

    public function topics(Request $request): Response
    {
        $q = Str::lower(trim((string) $request->query('q', '')));
        $themes = collect($this->themesWithCounts())->when($q !== '', fn ($c) => $c->filter(fn ($t) => Str::contains(Str::lower($t['label'].' '.$t['blurb']), $q)))->values();

        return $this->page('Kp/Topics', '014', [
            'q' => $q,
            'topics' => $themes,
            'all' => $this->themesWithCounts(),
            'latest' => collect(Kp::items())->whereIn('type', ['framework', 'article'])->take(3)->map(fn ($i) => $this->card($i))->values(),
            'current' => null,
        ]);
    }

    public function topic(string $slug): Response
    {
        $theme = collect($this->themesWithCounts())->firstWhere('slug', $slug);
        abort_unless($theme, 404);
        $items = collect(Kp::items())->where('theme', $slug);

        return $this->page('Kp/Topics', '014', [
            'q' => '',
            'topics' => [],
            'all' => $this->themesWithCounts(),
            'latest' => [],
            'current' => $theme + [
                'items' => $items->map(fn ($i) => $this->card($i))->values(),
                'resources' => collect(Kp::resources())->filter(fn ($r) => Str::contains(Str::lower($theme['label']), Str::lower($r[3])))->map(fn ($r) => $this->resourceRow($r))->values(),
            ],
        ]);
    }

    public function search(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $types = array_values(array_filter((array) $request->query('types', [])));
        $sort = (string) $request->query('sort', 'relevance');
        $results = $q === '' ? collect() : $this->searchAll($q);
        $counts = $results->countBy('group');
        $filtered = $results->when($types !== [], fn ($c) => $c->whereIn('group', $types))->when($sort === 'title', fn ($c) => $c->sortBy('title'))->values();
        $page = max(1, (int) $request->query('page', 1));

        return $this->page('Kp/Search', '015', [
            'q' => $q,
            'types' => $types,
            'sort' => $sort,
            'results' => $filtered->forPage($page, 10)->values(),
            'pagination' => ['page' => $page, 'last' => max(1, (int) ceil($filtered->count() / 10)), 'total' => $filtered->count()],
            'groups' => collect(['Insights & Articles', "Founder's Notes", 'African Business Clinic', 'KP Resources', 'Tools & Frameworks', 'Webinars', 'Topics'])->map(fn ($g) => ['label' => $g, 'count' => $counts[$g] ?? 0])->values(),
            'popular' => ['strategy execution', 'capital readiness', 'board effectiveness', 'project development', 'African growth agenda'],
            'glance' => ['total' => $results->count(), 'kp' => $results->where('author', 'Kruger Phiri')->count(), 'categories' => $counts->count()],
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Engagement */
    /* ------------------------------------------------------------------ */

    public function work(): Response
    {
        return $this->page('Kp/Work', '009', [
            'offers' => Kp::offers(),
            'modes' => Kp::deliveryModes(),
            'availability' => KpRecord::where('kind', 'console')->where('data->console', 'capacity')->orderBy('sort')->get()->map(fn ($r) => ['week' => $r->title, 'status' => $r->status])->all(),
        ]);
    }

    public function book(Request $request): Response
    {
        $offers = Kp::offers();

        return $this->page('Kp/Book', '010', [
            'offers' => $offers,
            'slots' => Kp::timeSlots(),
            'preset' => collect($offers)->contains('key', $request->query('offer')) ? $request->query('offer') : $offers[0]['key'],
            'minDate' => now()->addDays(3)->toDateString(),
            'reference' => session('kp_request_reference'),
        ]);
    }

    public function storeBooking(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'offer' => ['required', Rule::in(array_column(Kp::offers(), 'key'))],
            'date' => ['required', 'date', 'after_or_equal:'.now()->addDays(3)->toDateString()],
            'slot' => ['required', Rule::in(Kp::timeSlots())],
            'challenge' => ['required', 'string', 'min:20', 'max:500'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'organisation' => ['nullable', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'founder_preference' => ['nullable', Rule::in(['founder', 'best-fit'])],
        ]);
        $offer = collect(Kp::offers())->firstWhere('key', $data['offer']);
        $ref = 'KP-REQ-'.str_pad((string) (KpRecord::where('kind', 'session_request')->count() + 1002), 4, '0', STR_PAD_LEFT);
        KpRecord::create(['kind' => 'session_request', 'code' => $ref, 'title' => $offer['title'], 'status' => 'Requested', 'user_id' => $request->user()?->id, 'data' => [
            'name' => $data['name'], 'email' => $data['email'], 'organisation' => $data['organisation'] ?? '', 'phone' => $data['phone'] ?? '', 'brief' => $data['challenge'],
            'preferred' => $data['date'].' '.$data['slot'], 'founder_preference' => $data['founder_preference'] ?? 'best-fit', 'mode' => null, 'received' => now()->format('j M Y'), 'offer' => $data['offer'], 'code' => $offer['code'],
        ]]);

        return back()->with('success', "Request $ref received. This is a request, not a booking: TBCA confirms availability, delivery mode and fee before anything is booked.")->with('kp_request_reference', $ref);
    }

    public function projectDesk(Request $request): Response
    {
        $user = $request->user();
        $projects = $user ? KpRecord::where('kind', 'project')->where('user_id', $user->id)->orderBy('sort')->get() : collect();

        return $this->page('Kp/ProjectDesk', '011', [
            'signedIn' => (bool) $user,
            'projects' => $projects->map(fn ($p) => ['code' => $p->code, 'title' => $p->title, 'stage' => $p->status] + $p->data)->all(),
            'counts' => ['active' => $projects->count(), 'inProgress' => $projects->where('status', '!=', 'Implementation')->count(), 'completed' => 0],
            'support' => [['concept', 'Project Concept & Feasibility', 'Validate the concept, market need and feasibility.', 'lightbulb'], ['readiness', 'Investment Readiness & Bankability', 'Prepare a bankable project that attracts capital.', 'bar-chart-3'], ['structuring', 'Financial Structuring & Modelling', 'Build financial models and funding structures.', 'settings'], ['implementation', 'Implementation & Execution Support', 'From planning to delivery with accountability.', 'users'], ['health-check', 'Project Health Check', 'Assess current projects and identify gaps.', 'shield-check']],
        ]);
    }

    public function storeProjectBrief(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'support' => ['required', 'string', 'max:40'],
            'project' => ['required', 'string', 'max:160'],
            'location' => ['required', 'string', 'max:120'],
            'stage' => ['required', Rule::in(KpTools::projectStages())],
            'brief' => ['required', 'string', 'min:20', 'max:800'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
        ]);
        $ref = 'KP-PRJ-'.(400 + KpRecord::where('kind', 'project_brief')->count() + 1);
        KpRecord::create(['kind' => 'project_brief', 'code' => $ref, 'title' => $data['project'], 'status' => 'Submitted', 'user_id' => $request->user()?->id, 'data' => $data + ['received' => now()->format('j M Y')]]);

        return back()->with('success', "Project brief $ref received. A TBCA project adviser reviews scope and confirms the next step. Feasibility work is a paid engagement.");
    }

    public function speaking(): Response
    {
        return $this->page('Kp/Speaking', '012', [
            'formats' => Kp::speakingFormats(),
            'topics' => Kp::speakingTopics(),
            'appearances' => Kp::appearances(),
            'focusAreas' => Kp::focusAreas(),
        ]);
    }

    public function storeSpeaking(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'format' => ['required', Rule::in(array_column(Kp::speakingFormats(), 0))],
            'event' => ['required', 'string', 'max:160'],
            'date' => ['required', 'date', 'after:today'],
            'audience' => ['required', 'string', 'max:160'],
            'topic' => ['required', 'string', 'max:160'],
            'recording' => ['nullable', 'boolean'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
        ]);
        $ref = 'KP-REQ-'.str_pad((string) (KpRecord::where('kind', 'session_request')->count() + 1002), 4, '0', STR_PAD_LEFT);
        KpRecord::create(['kind' => 'session_request', 'code' => $ref, 'title' => collect(Kp::speakingFormats())->firstWhere(0, $data['format'])[1], 'status' => 'Requested', 'user_id' => $request->user()?->id, 'data' => ['name' => $data['name'], 'email' => $data['email'], 'organisation' => $data['event'], 'brief' => $data['topic'].' for '.$data['audience'].' on '.$data['date'].(! empty($data['recording']) ? ' (recorded)' : ''), 'mode' => null, 'received' => now()->format('j M Y')]]);

        return back()->with('success', "Enquiry $ref received. Founder capacity is checked before any confirmation.");
    }

    /* ------------------------------------------------------------------ */
    /* Resources and lenses */
    /* ------------------------------------------------------------------ */

    public function resources(Request $request): Response
    {
        $cat = (string) $request->query('category', 'all');
        $q = Str::lower(trim((string) $request->query('q', '')));
        $all = collect(Kp::resources());
        $rows = $all->when($cat !== 'all', fn ($c) => $c->where(2, $cat))->when($q !== '', fn ($c) => $c->filter(fn ($r) => Str::contains(Str::lower($r[1].' '.$r[4].' '.$r[3]), $q)))->values();

        return $this->page('Kp/Resources', '013', [
            'category' => $cat,
            'q' => $q,
            'categories' => collect(Kp::resourceCategories())->map(fn ($l, $k) => ['key' => $k, 'label' => $l, 'count' => $all->where(2, $k)->count()])->values(),
            'total' => $all->count(),
            'featured' => $all->where(6, true)->map(fn ($r) => $this->resourceRow($r))->values(),
            'rows' => $rows->map(fn ($r) => $this->resourceRow($r))->values(),
        ]);
    }

    public function downloadResource(string $slug): HttpResponse
    {
        $r = collect(Kp::resources())->firstWhere(0, $slug);
        abort_unless($r, 404);
        $body = implode("\n", [
            'KP THOUGHT LEADERSHIP RESOURCE', strtoupper($r[1]), str_repeat('=', 60), $r[4], '',
            'Category: '.(Kp::resourceCategories()[$r[2]] ?? $r[2]), 'Topic: '.$r[3], 'Format of the full resource: '.$r[5], '',
            'The full '.$r[5].' file is published when KP supplies the final version. This summary sheet lets you plan with the resource now.',
            '', 'Professional boundary: general information only. It is not legal, tax, financial or investment advice.',
            'The Business Clinic.Africa | consult@thebusinessclinic.africa',
        ]);

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.$slug.'.txt"']);
    }

    public function country(Request $request, ?string $slug = null): Response|RedirectResponse
    {
        if (! $slug) {
            return redirect(Kp::BASE.'/africa/'.($request->query('country') ?: 'kenya'));
        }
        $c = DB::table('aiim_countries')->where('slug', $slug)->first();
        abort_unless($c, 404);
        $ind = collect(json_decode($c->indicators ?? '[]', true));
        $iso = $c->iso2;

        return $this->page('Kp/Lens', '016', [
            'mode' => 'country',
            'current' => ['slug' => $c->slug, 'name' => $c->name, 'region' => Str::headline((string) ($c->au_region ?: $c->region)).' Africa', 'capital' => $c->capital, 'currency' => $c->currency_name.' ('.$c->currency_code.')', 'iso2' => $iso, 'packStatus' => $c->pack_status ?: 'Not started'],
            'options' => DB::table('aiim_countries')->orderBy('name')->get(['slug', 'name'])->map(fn ($r) => ['value' => $r->slug, 'label' => $r->name])->all(),
            'facts' => $ind->map(fn ($v) => ['label' => $v['label'], 'value' => rtrim(rtrim(number_format((float) $v['value'], 1), '0'), '.').' '.$v['unit'], 'year' => $v['year'], 'source' => $v['source'], 'status' => $v['status'] ?? 'placeholder'])->values(),
            'sections' => ['Overview', 'Economy', 'Business Environment', 'Regulation & Tax', 'Sectors & Opportunities', 'Risks & Challenges', 'Insights & Commentary', 'Tools & Resources', 'Related Content'],
            'insights' => collect(Kp::items())->where('scope', 'AFR-G3')->filter(fn ($i) => Str::contains(Str::lower($i['title']), Str::lower($c->name)))->map(fn ($i) => $this->card($i))->values(),
            'deepLink' => '/aiim/country/'.$c->slug,
        ]);
    }

    public function sector(Request $request, ?string $slug = null): Response|RedirectResponse
    {
        if (! $slug) {
            return redirect(Kp::BASE.'/sectors/'.($request->query('sector') ?: 'financial-services'));
        }
        $s = Industry::where('slug', $slug)->first();
        abort_unless($s, 404);

        return $this->page('Kp/Lens', '017', [
            'mode' => 'sector',
            'current' => ['slug' => $s->slug, 'name' => $s->name, 'region' => $s->tagline, 'capital' => null, 'currency' => null, 'iso2' => null, 'packStatus' => Str::headline((string) $s->catalogue_state).' catalogue', 'intro' => $s->intro, 'blurb' => $s->blurb, 'complexity' => $s->complexity_class, 'regulatory' => $s->regulatory_state],
            'options' => Industry::orderBy('name')->get(['slug', 'name'])->map(fn ($r) => ['value' => $r->slug, 'label' => $r->name])->all(),
            'facts' => [
                ['label' => 'Description', 'value' => $s->blurb, 'year' => null, 'source' => 'TBCA industry register', 'status' => 'verified'],
                ['label' => 'Complexity class', 'value' => $s->complexity_class, 'year' => null, 'source' => 'TBCA industry register', 'status' => 'verified'],
                ['label' => 'Regulatory intensity', 'value' => Str::headline((string) $s->regulatory_state), 'year' => null, 'source' => 'TBCA industry register', 'status' => 'verified'],
                ['label' => 'Market size and growth', 'value' => 'Evidence pending', 'year' => null, 'source' => 'Data Bank source to be approved', 'status' => 'placeholder'],
            ],
            'sections' => ['Overview', 'Market Size & Growth', 'Key Trends', 'Opportunities', 'Challenges & Risks', 'Regulation & Policy', 'Key Players', 'Case Studies', 'KP Insights', 'Tools & Resources', 'Related Content'],
            'insights' => collect(Kp::items())->filter(fn ($i) => Str::contains(Str::lower($i['title'].' '.$i['summary']), Str::lower(Str::before($s->name, ' '))))->map(fn ($i) => $this->card($i))->values(),
            'deepLink' => '/industries/'.$s->slug,
        ]);
    }

    public function lensBrief(string $mode, string $slug): HttpResponse
    {
        $name = $mode === 'country' ? DB::table('aiim_countries')->where('slug', $slug)->value('name') : Industry::where('slug', $slug)->value('name');
        abort_unless($name, 404);
        $body = implode("\n", ['KP '.strtoupper($mode).' LENS BRIEF', $name, str_repeat('=', 60), 'Scope: '.($mode === 'country' ? 'Country (AFR-G3)' : 'Sector'), '', 'Figures marked placeholder are not yet verified and must not be relied on.', 'For verified detail see the AIIM and Industries modules on businessclinic.africa.', '', 'Professional boundary: general information only.']);

        return response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="kp-'.$mode.'-brief-'.$slug.'.txt"']);
    }

    /* ------------------------------------------------------------------ */
    /* Disclosure, route and standards components */
    /* ------------------------------------------------------------------ */

    public function freePaid(): Response
    {
        return $this->page('Kp/FreePaid', '032', [
            'plans' => [['Pro Access', 299, '/ month', 'users'], ['Team Access', 799, '/ month', 'users'], ['Enterprise Access', null, 'Custom pricing', 'building-2']],
            'rows' => [
                ['Insights & Summaries', 'High-level insights and summaries', 'Limited', '3 per topic per day', 'Unlimited', 'Full insights and deeper analysis'],
                ['Diagnostic Questions', 'Answer targeted diagnostic questions', 'Limited', '10 per topic per day', 'Unlimited', 'All questions and follow-ups'],
                ['Calculators & Tools', 'Use calculators and modelling tools', 'Limited', '1 calculation per tool per day', 'Unlimited', 'All tools, unlimited calculations'],
                ['Downloads & Reports', 'Download reports and templates', 'Sample', 'Watermarked reports', 'Full Access', 'High-quality, branded downloads'],
                ['Data & Sources', 'Access to data and source details', 'Summary', 'Top-level sources only', 'Full Access', 'All sources and confidence data'],
                ['Support', 'Get help when you need it', 'Self-serve', 'Help articles and FAQs', 'Priority Support', 'Expert support via chat or email'],
                ['Human Review', 'Expert review of outputs', 'Not included', 'AI-generated only', 'Included', 'Reviewed where applicable'],
            ],
        ]);
    }

    public function relatedRoute(): Response
    {
        return $this->page('Kp/RelatedRoute', '033', [
            'insight' => $this->card(Kp::find('ai-wont-replace-you')),
            'steps' => [['Understand', 'Explore & Diagnose', 'Start with Diagnostics', 'Answer targeted questions to understand your digital maturity.', 'Go to Diagnostics', Kp::BASE.'/diagnostic-questions?topic=technology-data'], ['Assess', 'Evaluate & Prioritise', 'Run Digital Readiness', 'Assess your current capabilities and readiness to scale.', 'Readiness Scorecard', Kp::BASE.'/tools/scorecards/capital-readiness'], ['Plan', 'Design & Roadmap', 'Build Action Plan', 'Create a roadmap tailored to your business.', 'Action Plan Builder', Kp::BASE.'/action-pack/the-real-problem-isnt-capital'], ['Act', 'Implement & Execute', 'Choose Solutions', 'Find TBCA services, products or partners to implement.', 'Browse Solutions', '/technology-solutions'], ['Measure', 'Track & Improve', 'Track Results', 'Measure impact and continuously optimise outcomes.', 'View Scorecard', Kp::BASE.'/tools/scorecards/capital-readiness']],
            'paths' => [['Business Growth', 'Strategies and tools to grow revenue and market share.', '/services'], ['Technology & Data', 'Adopt the right tools and data practices to scale.', '/technology-solutions'], ['People & Culture', 'Build the right team and culture to sustain change.', '/sprints'], ['Governance & Compliance', 'Ensure your digital journey is secure and compliant.', '/due-diligence']],
            'tools' => [['Diagnostic Questions', Kp::BASE.'/diagnostic-questions'], ['Capital Readiness Scorecard', Kp::BASE.'/tools/scorecards/capital-readiness'], ['Investment Case Calculator', Kp::BASE.'/tools/calculators/investment-case'], ['Decision Checklist', Kp::BASE.'/tools/checklists/go-no-go'], ['Project Fatal-Flaw Explorer', Kp::BASE.'/project-fatal-flaw']],
            'products' => [['Digital Products', '/digital-products'], ['Sprints', '/sprints'], ['Subscriptions', '/subscriptions'], ['Templates & Tools', '/tools']],
        ]);
    }

    public function standard(string $component): Response
    {
        $map = ['voice-badge' => '043', 'synthetic-disclosure' => '044', 'founder-attribution' => '045', 'evidence-popover' => '046', 'professional-limitation' => '047', 'geographic-scope' => '048', 'freshness' => '049', 'correction-notice' => '050'];
        abort_unless(isset($map[$component]), 404);

        return $this->page('Kp/Standard', $map[$component], [
            'component' => $component,
            'voices' => collect(Kp::voices())->map(fn ($v, $k) => ['code' => $k, 'label' => $v[0], 'body' => $v[1]])->values(),
            'scopes' => collect(Kp::scopes())->map(fn ($v, $k) => ['code' => $k, 'label' => $v[0], 'body' => $v[1]])->values(),
            'freshness' => collect(Kp::freshness())->map(fn ($v, $k) => ['key' => $k, 'label' => $v[0], 'body' => $v[1]])->values(),
            'corrections' => KpRecord::where('kind', 'correction')->whereIn('status', KpToolsController::PUBLIC_CORRECTION_STATES)->orderBy('sort')->take(3)->get()->map(fn ($r) => ['code' => $r->code, 'title' => $r->title, 'status' => $r->status] + $r->data)->all(),
            'others' => collect($map)->map(fn ($n, $k) => ['key' => $k, 'title' => Kp::screen($n)['title'], 'id' => 'KP-SCR-'.$n])->values(),
        ]);
    }

    public function events(): Response
    {
        return $this->page('Kp/Events', null, [
            'webinars' => Webinar::where('speaker', 'Kruger Phiri')->where('state', '!=', 'draft')->orderByDesc('starts_at')->get()->sortBy(fn (Webinar $w) => $w->registrationOpen() ? 0 : 1)->values()->map(fn (Webinar $w) => WebinarPresenter::card($w)),
        ]);
    }

    public function newsletter(): Response
    {
        return $this->page('Kp/Newsletter', null, []);
    }

    /* ------------------------------------------------------------------ */
    /* Helpers */
    /* ------------------------------------------------------------------ */

    /** Shared props for every KP page. */
    public static function shared(?string $screen): array
    {
        $b = Kp::BASE;

        return [
            'screen' => $screen ? Kp::screen($screen) : null,
            'kpNav' => [
                ['Home', $b], ['Insights', "$b/insights"], ["Founder's Notes", "$b/founders-notes"], ['Business Clinic', "$b/african-business-clinic"],
                ['Topics', "$b/topics"], ['Ask KP Assistant', "$b/ask"], ['Africa Lens', "$b/africa/kenya"], ['Work With Kruger', "$b/work-with-kruger"],
                ['Speaking & Media', "$b/speaking-media"], ['Resources', "$b/resources"], ['Future Builders', "$b/future-builders"], ['About', "$b/about"],
            ],
        ];
    }

    private function page(string $component, ?string $screen, array $props): Response
    {
        return Inertia::render($component, self::shared($screen) + $props);
    }

    public static function card(?array $i): ?array
    {
        if (! $i) {
            return null;
        }
        $t = Kp::types()[$i['type']] ?? ['Article', 'Articles', 'file-text'];

        return [
            'slug' => $i['slug'], 'title' => $i['title'], 'summary' => $i['summary'], 'type' => $i['type'], 'typeLabel' => $t[0], 'icon' => $t[2],
            'theme' => $i['theme'], 'themeLabel' => Kp::themeLabel($i['theme']), 'voice' => $i['voice'], 'voiceLabel' => Kp::voices()[$i['voice']][0] ?? $i['voice'],
            'scope' => $i['scope'], 'scopeLabel' => Kp::scopes()[$i['scope']][0] ?? $i['scope'], 'freshness' => $i['freshness'], 'status' => $i['status'],
            'featured' => $i['featured'], 'published' => $i['published'], 'author' => $i['author'], 'href' => Kp::BASE.'/insights/'.$i['slug'],
        ];
    }

    private function resourceRow(array $r): array
    {
        return ['slug' => $r[0], 'title' => $r[1], 'category' => $r[2], 'categoryLabel' => Kp::resourceCategories()[$r[2]] ?? $r[2], 'topic' => $r[3], 'body' => $r[4], 'format' => $r[5], 'featured' => $r[6], 'href' => Kp::BASE.'/resources/'.$r[0].'/download'];
    }

    private function themesWithCounts(): array
    {
        $items = collect(Kp::items());
        $res = collect(Kp::resources());

        return collect(Kp::themes())->map(fn ($t) => $t + [
            'articles' => $items->where('theme', $t['slug'])->count(),
            'tools' => $res->filter(fn ($r) => Str::contains(Str::lower($t['label']), Str::lower($r[3])))->count(),
            'href' => Kp::BASE.'/topics/'.$t['slug'],
        ])->all();
    }

    private function insightFilters(Request $request): array
    {
        return $request->validate([
            'q' => ['nullable', 'string', 'max:80'],
            'types' => ['nullable', 'array'], 'types.*' => ['string', Rule::in(array_keys(Kp::types()))],
            'theme' => ['nullable', 'string', 'max:60'],
            'voice' => ['nullable', Rule::in(array_keys(Kp::voices()))],
            'region' => ['nullable', Rule::in(array_keys(Kp::scopes()))],
            'freshness' => ['nullable', 'array'], 'freshness.*' => ['string', Rule::in(array_keys(Kp::freshness()))],
            'sort' => ['nullable', Rule::in(['recent', 'title'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);
    }

    private function listing(Collection $all, array $f, int $per): array
    {
        $rows = $all
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($i) => Str::contains(Str::lower($i['title'].' '.$i['summary'].' '.Kp::themeLabel($i['theme']).' '.$i['author']), Str::lower(trim($q)))))
            ->when(! empty($f['types']), fn ($c) => $c->whereIn('type', $f['types']))
            ->when($f['theme'] ?? null, fn ($c, $t) => $c->where('theme', $t))
            ->when($f['voice'] ?? null, fn ($c, $v) => $c->where('voice', $v))
            ->when($f['region'] ?? null, fn ($c, $r) => $c->where('scope', $r))
            ->when(! empty($f['freshness']), fn ($c) => $c->whereIn('freshness', $f['freshness']))
            ->when(($f['sort'] ?? 'recent') === 'title', fn ($c) => $c->sortBy('title'))
            ->values();
        $page = (int) ($f['page'] ?? 1);

        return [
            'items' => $rows->take($page * $per)->map(fn ($i) => $this->card($i))->values(),
            'pagination' => ['shown' => min($rows->count(), $page * $per), 'total' => $rows->count(), 'page' => $page, 'more' => $rows->count() > $page * $per],
            'filters' => ['q' => $f['q'] ?? '', 'types' => $f['types'] ?? [], 'theme' => $f['theme'] ?? '', 'voice' => $f['voice'] ?? '', 'region' => $f['region'] ?? '', 'freshness' => $f['freshness'] ?? [], 'sort' => $f['sort'] ?? 'recent'],
            'scopes' => collect(Kp::scopes())->map(fn ($v, $k) => ['code' => $k, 'label' => $v[0]])->values(),
            'typeOptions' => collect(Kp::types())->map(fn ($t, $k) => ['key' => $k, 'label' => $t[1]])->values(),
        ];
    }

    /** Search across insights, resources, topics, tools and webinars. */
    public static function searchAll(string $q): Collection
    {
        $needle = Str::lower($q);
        $words = array_filter(preg_split('/\s+/', $needle) ?: [], fn ($w) => strlen($w) > 2);
        $score = function (string $hay) use ($needle, $words): int {
            $hay = Str::lower($hay);
            $s = Str::contains($hay, $needle) ? 10 : 0;
            foreach ($words as $w) {
                $s += Str::contains($hay, $w) ? 2 : 0;
            }

            return $s;
        };
        $out = collect();
        foreach (Kp::items() as $i) {
            $group = match ($i['type']) {
                'founders-note' => "Founder's Notes", 'explainer' => 'African Business Clinic', 'framework' => 'Tools & Frameworks', default => 'Insights & Articles'
            };
            $out->push(['group' => $group, 'kind' => (Kp::types()[$i['type']][0] ?? 'Article'), 'title' => $i['title'], 'summary' => $i['summary'], 'href' => Kp::BASE.'/insights/'.$i['slug'], 'tags' => [Kp::themeLabel($i['theme'])], 'author' => $i['author'], 'meta' => $i['status'] === 'pending' ? 'Full text pending' : 'Excerpt available', 'score' => $score($i['title'].' '.$i['summary'].' '.Kp::themeLabel($i['theme']))]);
        }
        foreach (Kp::resources() as $r) {
            $out->push(['group' => 'KP Resources', 'kind' => Kp::resourceCategories()[$r[2]] ?? 'Resource', 'title' => $r[1], 'summary' => $r[4], 'href' => Kp::BASE.'/resources?q='.urlencode($r[1]), 'tags' => [$r[3], $r[5]], 'author' => 'The Business Clinic.Africa', 'meta' => $r[5], 'score' => $score($r[1].' '.$r[4].' '.$r[3])]);
        }
        foreach (Kp::themes() as $t) {
            $out->push(['group' => 'Topics', 'kind' => 'Topic', 'title' => $t['label'], 'summary' => $t['blurb'], 'href' => Kp::BASE.'/topics/'.$t['slug'], 'tags' => ['Topic'], 'author' => 'The Business Clinic.Africa', 'meta' => 'Topic hub', 'score' => $score($t['label'].' '.$t['blurb'])]);
        }
        foreach ([['Capital Readiness Scorecard', 'Score ten readiness areas.', '/tools/scorecards/capital-readiness'], ['Investment Case Calculator', 'NPV, ROI, payback and IRR.', '/tools/calculators/investment-case'], ['Decision Checklist', 'Validate decision criteria before acting.', '/tools/checklists/go-no-go'], ['Project Fatal-Flaw Explorer', 'Find deal-breakers early.', '/project-fatal-flaw'], ['Funder Readiness Interviewer', 'Practise funder questions.', '/funder-readiness'], ['Decision Sheet', 'Capture and act on key decisions.', '/decision-sheet'], ['Boardroom Challenger', 'Challenge a decision before the board does.', '/boardroom-challenger']] as [$t, $s, $h]) {
            $out->push(['group' => 'Tools & Frameworks', 'kind' => 'Tool', 'title' => $t, 'summary' => $s, 'href' => Kp::BASE.$h, 'tags' => ['Tool'], 'author' => 'The Business Clinic.Africa', 'meta' => 'Free tool', 'score' => $score($t.' '.$s)]);
        }
        foreach (Webinar::whereNotIn('state', ['draft'])->get() as $w) {
            $out->push(['group' => 'Webinars', 'kind' => 'Webinar', 'title' => $w->title, 'summary' => $w->summary, 'href' => '/webinars/'.$w->slug, 'tags' => [$w->topic], 'author' => $w->speaker, 'meta' => $w->starts_at->format('j M Y'), 'score' => $score($w->title.' '.$w->summary.' '.$w->topic)]);
        }

        return $out->where('score', '>', 0)->sortByDesc('score')->values();
    }
}
