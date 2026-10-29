<?php

namespace App\Support\Content;

use App\Models\Kp\KpArticle;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * KP Thought Leadership content register (KP TEB v2.0 Consolidated Blueprint and
 * KP's 48 page mockups, Drive folder "KP Thought Leadership", shared 13 Oct 2026).
 *
 * Content rules from the blueprint:
 *  - No Founder claim, statistic or quotation renders unless it is approved (Part 2.4, 12.5).
 *    The mockup figures (20+ years, 1,000+ projects, 54 countries, 10,000+ entrepreneurs,
 *    "countless lives") are quarantined and never rendered.
 *  - Every content item carries a voice class (P, F, I, S, E, A), a freshness state and a
 *    geographic scope (Parts 5.3, 6.5, 10.1).
 *
 * Articles: KP supplied his articles on 18 October 2026 (Drive folder
 * "ARTICLES-KP THOT LEADERSHIP"). They replace the title-only placeholders taken from
 * his page designs; see items() and KpArticles. Every article renders its full text.
 */
class KpThoughtLeadership
{
    /** Screens and components defined by the blueprint (Part 27). */
    public const PLANNED_PAGES = 72;

    public const BASE = '/kp-thought-leadership';

    /* ------------------------------------------------------------------ */
    /* Screen register: KP-SCR-001 to KP-SCR-072 */
    /* ------------------------------------------------------------------ */

    public static function screens(): array
    {
        $b = self::BASE;
        $pub = [
            ['001', 'TBCA KP Navigation Handoff', "$b/handoff", 'Page 1b- Navigation Handoff.png'],
            ['002', 'Legacy Bridge', "$b/legacy-bridge", 'Page 02- Legacy Bridge.png'],
            ['003', 'Authority Landing', "$b/authority", 'Page 03- Authority Landing.png'],
            ['004', 'Founder Authority Foundation', "$b/about", 'Page 04-Founder Authority Foundation.png'],
            ['005', 'Insights Home', "$b/insights", 'Page 05-Insights Home.png'],
            ['006', 'Insight Article', "$b/insights/the-real-problem-isnt-capital", 'Page 06-Insight Article.png'],
            ['007', "Founder's Notes", "$b/founders-notes", 'Page 07-Founders Notes.png'],
            ['008', 'African Business Clinic', "$b/african-business-clinic", 'Page 08-African Business Clinic.png'],
            ['009', 'Work With Kruger', "$b/work-with-kruger", 'Page 09- Work with Kruger.png'],
            ['010', 'Book Kruger', "$b/book", 'Page 10-Book Kruger Phiri- .png'],
            ['011', 'Project Development Desk', "$b/project-development", 'Page 11-Project Development Desk.png'],
            ['012', 'Speaking & Media', "$b/speaking-media", 'Page 12- Speaking & Media .png'],
            ['013', 'KP Resources', "$b/resources", 'Page 13- KP Resources.png'],
            ['014', 'Topic Hub', "$b/topics", 'Page 14-Topic Hub.png'],
            ['015', 'Search', "$b/search", 'Page 15- Search.png'],
            ['016', 'Country Lens', "$b/africa/kenya", 'Page 16- Country Lens.png'],
            ['017', 'Sector Lens', "$b/sectors/financial-services", 'Page 17- Sector Lens.png'],
            ['018', 'KP Knowledge Assistant', "$b/ask", 'Page 18- KP Knowledge Assistant.png'],
            ['019', 'AI Answer', "$b/ask", 'Page 19- AI Answer.png'],
            ['020', 'Explain It at My Level', "$b/explain", 'Page 20- Explain it at My Level.png'],
            ['021', 'Boardroom Challenger', "$b/boardroom-challenger", null],
            ['022', 'Funder Readiness Interviewer', "$b/funder-readiness", 'Page 22-Funder Reading Interviewer .png'],
            ['023', 'Project Fatal-Flaw Explorer', "$b/project-fatal-flaw", 'Page 23- Project Fatal Flow Explorer .png'],
            ['024', 'Decision Sheet', "$b/decision-sheet", 'Page 24- Decision Sheet.png'],
            ['025', 'Source & Confidence Panel', "$b/ask", 'Page 25- Source Confidence Panel.png'],
            ['026', 'AI Correction State', "$b/corrections", 'Page 26- AI Correction Site.png'],
            ['027', 'Insight Action Pack', "$b/action-pack/the-real-problem-isnt-capital", 'Page 27- Insight Action Pack.png'],
            ['028', 'Diagnostic Questions', "$b/diagnostic-questions", 'Page 28- Diagnostic Questions.png'],
            ['029', 'Scorecard', "$b/tools/scorecards/capital-readiness", 'Page 29- Scorecard.png'],
            ['030', 'Calculator', "$b/tools/calculators/investment-case", 'Page 30- Calculator.png'],
            ['031', 'Decision Checklist', "$b/tools/checklists/go-no-go", 'Page 31- Decision Checklist.png'],
            ['032', 'Free-to-Paid Disclosure', "$b/free-and-paid", 'Page 32- Free to Paid Disclosure.png'],
            ['033', 'Related TBCA Route', "$b/related-route", 'Page 33-Related TBCA Route.png'],
            ['034', 'Future Builders Home', "$b/future-builders", 'Page 34- Future Builders Home.png'],
            ['035', 'Learner Topic Hub', "$b/future-builders/topics", 'Page 35- Learner Topic Hub.png'],
            ['036', 'Business Basics Lesson', "$b/future-builders/lessons/business-basics/1", 'Page 36- Business Basic Lessons.png'],
            ['037', 'AI Literacy Lesson', "$b/future-builders/lessons/ai-literacy/1", 'Page 37- Ai Literacy Lesson.png'],
            ['038', 'Local Problem Challenge', "$b/future-builders/challenge", 'Page 38- Local Problem Challenge.png'],
            ['039', 'Printable Activity', "$b/future-builders/activities/smart-goals", 'Page 39-Printable Activity.png'],
            ['040', 'Educator Portal', "$b/future-builders/educators", 'Page 40- Educator Portal.png'],
            ['041', 'Guardian Page', "$b/future-builders/guardians", 'Page 41-Guardian Page.png'],
            ['042', 'Low-Bandwidth Mode', "$b/future-builders/lite", 'Page 42- Low-Bandwidth Mode.png'],
            ['043', 'Voice Badge', "$b/standards/voice-badge", 'Page 43- Voice Badge.png'],
            ['044', 'Synthetic Disclosure', "$b/standards/synthetic-disclosure", 'Page 44-Synthentic Disclosure .png'],
            ['045', 'Founder Attribution Block', "$b/standards/founder-attribution", 'Page 45-Founder Atribution.png'],
            ['046', 'Evidence Popover', "$b/standards/evidence-popover", 'Page 45-Evidence Popover.png'],
            ['047', 'Professional Limitation', "$b/standards/professional-limitation", 'Page 47-Professional Limitation.png'],
            ['048', 'Geographic Scope Badge', "$b/standards/geographic-scope", 'Page 48- Geographical Scope badge.png'],
            ['049', 'Freshness Badge', "$b/standards/freshness", null],
            ['050', 'Correction Notice', "$b/standards/correction-notice", null],
        ];
        $rows = array_map(fn ($s) => ['id' => 'KP-SCR-'.$s[0], 'title' => $s[1], 'href' => $s[2], 'mockup' => $s[3], 'surface' => 'Public'], $pub);
        foreach (self::consoles() as $i => $c) {
            $rows[] = ['id' => 'KP-SCR-'.str_pad((string) (51 + $i), 3, '0', STR_PAD_LEFT), 'title' => $c[1], 'href' => '/admin/kp/'.$c[0], 'mockup' => null, 'surface' => 'Admin'];
        }

        return $rows;
    }

    public static function screen(string $num): array
    {
        return collect(self::screens())->firstWhere('id', 'KP-SCR-'.$num) ?? ['id' => 'KP-SCR-'.$num, 'title' => '', 'href' => self::BASE, 'mockup' => null, 'surface' => 'Public'];
    }

    /** Admin consoles KP-SCR-051 to KP-SCR-072 (blueprint 27.2): [key, title, states, actions]. */
    public static function consoles(): array
    {
        return [
            ['topics', 'Content Topic Register', ['Draft', 'Active', 'Restricted', 'Retired'], 'Create, classify, merge and retire topics'],
            ['lifecycle', 'Content Lifecycle', ['Idea', 'Drafting', 'Review', 'Approved', 'Published', 'Retired'], 'Advance, return and restrict content'],
            ['voice', 'Voice Classification', ['Unclassified', 'P', 'F', 'I', 'S', 'E', 'A', 'Disputed'], 'Classify and reclassify voice'],
            ['review', 'Independent Review', ['Submitted', 'Reviewing', 'Returned', 'Blocked', 'Approved'], 'Claim, approve and block'],
            ['ai-outputs', 'AI Output Approval', ['Generated', 'QA', 'Review', 'Released', 'Blocked'], 'Compare, approve and reject AI output'],
            ['synthetic', 'Synthetic Register', ['Blocked', 'Consent Pending', 'Review', 'Rendered', 'Published', 'Withdrawn'], 'Register, approve render and suspend'],
            ['claims', 'Claim Evidence', ['Required', 'Received', 'Review', 'Approved', 'Expired', 'Disputed'], 'Add evidence, approve and withdraw claims'],
            ['utm', 'UTM Monitor', ['Tracked', 'Missing', 'Conflict', 'Fixed'], 'Reconcile and patch future links'],
            ['d023', 'D023 KP Brand Funnel', ['Current', 'Stale', 'Reconciling'], 'Filter, export and raise issues'],
            ['customer-value', 'Customer Value Dashboard', ['Current', 'Incomplete', 'Review'], 'Filter and investigate'],
            ['capacity', 'Founder Capacity', ['Available', 'Throttled', 'Full', 'Reserve Protected'], 'Allocate, reserve and close slots'],
            ['sessions', 'Session Pipeline', ['Requested', 'Qualified', 'Waitlist', 'Booked', 'Routed', 'Closed'], 'Qualify, route and book requests'],
            ['contested', 'Contested Topics', ['A', 'B', 'C', 'D', 'Review Due'], 'Band, reclassify and restrict'],
            ['duplicates', 'Duplication Console', ['Candidate', 'Confirmed', 'Merged', 'Accepted Variation'], 'Merge and canonicalise'],
            ['graph', 'Knowledge Graph', ['Draft', 'Active', 'Restricted', 'Retired'], 'Edit nodes and edges'],
            ['freshness', 'Source Freshness', ['Current', 'Due', 'Stale', 'Restricted'], 'Refresh, replace and restrict sources'],
            ['coverage', 'Africa Coverage', ['Verified', 'Partial', 'Preview', 'Not Covered'], 'Set scope and activate countries'],
            ['translation', 'Translation QA', ['Draft', 'Linguistic', 'Specialist', 'Approved', 'Live'], 'Compare, return and approve'],
            ['safety', 'Future Builders Safety', ['Clear', 'Review', 'Restricted', 'Incident'], 'Review, suspend and escalate'],
            ['agents', 'AI Agent Control', ['Active', 'Restricted', 'Human Review Only', 'Suspended', 'Disabled'], 'Enable, restrict and stop agents'],
            ['corrections', 'Corrections', ['Reported', 'Reviewing', 'Approved', 'Publishing', 'Closed', 'Withdrawn'], 'Assess, correct and cascade'],
            ['experiments', 'Experiment Console', ['Proposed', 'Approved', 'Running', 'Paused', 'Completed', 'Rejected'], 'Design, start and stop experiments'],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Taxonomy */
    /* ------------------------------------------------------------------ */

    /** Topic hub categories (Page 14). Counts are computed from the register. */
    public static function themes(): array
    {
        return [
            ['slug' => 'strategy-execution', 'label' => 'Strategy & Execution', 'icon' => 'target', 'blurb' => 'Turn strategy into results with clarity, alignment and disciplined execution.'],
            ['slug' => 'capital-funding', 'label' => 'Capital & Funding', 'icon' => 'coins', 'blurb' => 'Access the right capital and structure funding that drives sustainable growth.'],
            ['slug' => 'governance-boards', 'label' => 'Governance & Boards', 'icon' => 'users', 'blurb' => 'Stronger boards, better governance and ethical leadership.'],
            ['slug' => 'project-development', 'label' => 'Project Development', 'icon' => 'building-2', 'blurb' => 'From concept to bankability. Build investable, impactful projects.'],
            ['slug' => 'markets-growth', 'label' => 'Markets & Growth', 'icon' => 'trending-up', 'blurb' => 'Understand markets, customers and growth opportunities across Africa.'],
            ['slug' => 'leadership-people', 'label' => 'Leadership & People', 'icon' => 'user', 'blurb' => 'Build leadership capability and high-performing, future-ready teams.'],
            ['slug' => 'technology-ai', 'label' => 'Technology & AI', 'icon' => 'bot', 'blurb' => 'Leverage technology and AI to innovate, scale and stay competitive.'],
            ['slug' => 'risk-compliance', 'label' => 'Risk & Compliance', 'icon' => 'shield-check', 'blurb' => 'Manage risk, ensure compliance and build resilient, trusted organisations.'],
        ];
    }

    public static function themeLabel(string $slug): string
    {
        return collect(self::themes())->firstWhere('slug', $slug)['label'] ?? Str::headline($slug);
    }

    /** Insight types (Page 5 filters). */
    public static function types(): array
    {
        return [
            'article' => ['Article', 'Articles', 'file-text'],
            'founders-note' => ["Founder's Note", "Founder's Notes", 'pen'],
            'framework' => ['Framework', 'Frameworks', 'layers'],
            'interview' => ['Interview', 'Interviews', 'mic'],
            'explainer' => ['Explainer', 'Explainers', 'lightbulb'],
            'case-perspective' => ['Case Perspective', 'Case Perspectives', 'briefcase'],
            'field-note' => ['Field Note', 'Field Notes', 'map'],
            'long-read' => ['Long Read', 'Long Reads', 'book-open'],
        ];
    }

    /** Voice classes (blueprint 10.1, Page 5 rail). */
    public static function voices(): array
    {
        return [
            'P' => ['Professional Voice', 'Institutional, evidence-led analysis and frameworks.'],
            'F' => ['Founder Voice', "Kruger Phiri's personal notes, diagnoses and perspectives."],
            'I' => ['Institutional Voice', 'The Business Clinic.Africa research and positions.'],
            'S' => ['Subject-Matter Expert', 'Expert interviews and independent perspectives.'],
            'E' => ['Editorial Voice', 'Curated explainers and editorial commentary.'],
            'A' => ['AI Voice', 'KP Knowledge Assistant explanations and tools.'],
        ];
    }

    /** Freshness states (blueprint 6.5, Page 5). */
    public static function freshness(): array
    {
        return [
            'current' => ['Current', '0 to 90 days since review'],
            'review-due' => ['Review Due', '91 to 180 days since review'],
            'stale' => ['Stale', 'More than 180 days since review'],
            'restricted' => ['Restricted', 'Withheld from public use'],
        ];
    }

    /** Geographic scope (blueprint 5.3). */
    public static function scopes(): array
    {
        return [
            'AFR-G0' => ['General', 'Universal commercial principle'],
            'AFR-G1' => ['Pan-African', 'Pan-African observation'],
            'AFR-G2' => ['Regional', 'Region, economic bloc or corridor'],
            'AFR-G3' => ['Country', 'Country-specific evidence'],
            'AFR-G4' => ['Local', 'Province, city or community'],
            'AFR-G5' => ['Transaction', 'Transaction or entity specific'],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Insights, Founder's Notes and explainers */
    /* ------------------------------------------------------------------ */

    /**
     * Every published KP article (Insights, Founder's Notes and Resources), newest first
     * within each section. The texts are Kruger Phiri's own documents, loaded into
     * kp_articles from the versioned files (see KpArticles). Nothing is written for KP:
     * a title without a source document has no entry here.
     *
     * Items carry metadata only; find() adds the body, sources and notes.
     */
    public static function items(): array
    {
        try {
            $sig = DB::table('kp_articles')->selectRaw('count(*) as c, max(updated_at) as u')->first();
        } catch (QueryException) {
            return [];
        }
        $key = $sig->c.'|'.$sig->u;
        if (self::$memo !== null && self::$memo[0] === $key) {
            return self::$memo[1];
        }

        $order = array_flip(array_keys(KpArticles::CATEGORIES));
        $items = KpArticle::query()
            ->select(['slug', 'category', 'type', 'title', 'kicker', 'deck', 'published_on', 'date_note', 'author', 'voice', 'scope', 'theme', 'themes', 'countries', 'featured', 'read_minutes', 'word_count', 'source', 'sort'])
            ->orderBy('sort')->get()
            ->sortBy(fn (KpArticle $a) => sprintf('%d-%s', $order[$a->category] ?? 9, 99999999 - (int) ($a->published_on?->format('Ymd') ?? 0)))
            ->map(fn (KpArticle $a) => self::item($a))
            ->values()->all();

        self::$memo = [$key, $items];

        return $items;
    }

    /** @var array{0: string, 1: array}|null */
    private static ?array $memo = null;

    private static function item(KpArticle $a): array
    {
        $reviewed = $a->source['received'] ?? null;
        $age = $reviewed ? (int) Carbon::parse($reviewed)->diffInDays(now()) : 0;

        return [
            'slug' => $a->slug,
            'category' => $a->category,
            'categoryLabel' => KpArticles::CATEGORIES[$a->category][0] ?? 'Insights',
            'title' => $a->title,
            'summary' => (string) $a->deck,
            'kicker' => $a->kicker,
            'type' => $a->type,
            'theme' => $a->theme,
            'themes' => $a->themes,
            'countries' => $a->countries,
            'voice' => $a->voice,
            'scope' => $a->scope,
            'featured' => $a->featured,
            'freshness' => $age <= 90 ? 'current' : ($age <= 180 ? 'review-due' : 'stale'),
            'status' => 'published',
            'published' => $a->published_on?->toDateString(),
            'date_label' => KpArticles::dateLabel($a->published_on?->toDateString()),
            'date_note' => $a->date_note,
            'read_minutes' => $a->read_minutes,
            'word_count' => $a->word_count,
            'author' => $a->author,
            'href' => KpArticles::href($a->category, $a->slug),
        ];
    }

    /** One article with its full text, sources and notes, or null. */
    public static function find(string $slug): ?array
    {
        $item = collect(self::items())->firstWhere('slug', $slug);
        if (! $item) {
            return null;
        }
        $a = KpArticle::where('slug', $slug)->first();

        return $item + [
            'body' => (string) $a?->body,
            'byline' => $a?->byline ?? [],
            'sources_heading' => $a?->sources_heading,
            'sources' => $a?->sources ?? [],
            'notes' => $a?->notes ?? [],
            'source' => $a?->source ?? [],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Authority, engagement and sessions */
    /* ------------------------------------------------------------------ */

    /** Safe replacement for the quarantined mockup figures (blueprint 12.5). */
    public static function focusAreas(): array
    {
        return [
            ['Business Diagnosis', 'Find the real problem before treating symptoms.', 'search'],
            ['Capital Readiness', 'Become investable before you ask for capital.', 'coins'],
            ['Project Bankability', 'Move projects from concept to fundable.', 'building-2'],
            ['Execution Discipline', 'Turn strategy into measurable results.', 'target'],
            ['Boardroom Decision Quality', 'Test assumptions, options and risks before deciding.', 'scale'],
        ];
    }

    /** Mockup strings that must not render until evidence passes (blueprint 12.5). */
    public static function quarantined(): array
    {
        return ['20+ Years of Experience', '1,000+ Projects Advised', '54 Countries Engaged', '10,000+ Entrepreneurs Empowered', 'Countless Lives Impacted', 'Hero quotation', 'Proven impact'];
    }

    public static function integrityRules(): array
    {
        return ['No unsupported claims.', 'No synthetic Founder voice.', 'Human-authored or AI-assisted with full disclosure.', 'Corrections are visible.', 'Professional boundaries are explicit.'];
    }

    public static function corePillars(): array
    {
        $b = self::BASE;

        return [
            ['Insights & Thinking', 'Original frameworks, explainers and strategic perspectives.', 'lightbulb', 'Browse Insights', "$b/insights"],
            ['AI Decision Support', 'AI tools that challenge assumptions and strengthen your decisions.', 'bot', 'Try AI Assistant', "$b/ask"],
            ['Africa Lens', 'Country and sector insights with local context and evidence.', 'globe', 'Explore Africa', "$b/africa/kenya"],
            ['Tools & Diagnostics', 'Practical tools, scorecards and diagnostics for better execution.', 'clipboard-check', 'Use Tools', "$b/african-business-clinic"],
            ['Future Builders', "Free learning and resources to build Africa's next generation.", 'graduation-cap', 'Start Learning', "$b/future-builders"],
            ['Work With Kruger', 'Advisory, boardroom strategy and project development support.', 'handshake', 'View Services', "$b/work-with-kruger"],
        ];
    }

    /** Five ways to engage (Pages 9 and 10). Fees are indicative and confirmed before booking (blueprint 18.5). */
    public static function offers(): array
    {
        return [
            ['key' => 'strategic-advisory', 'code' => 'KP-S01', 'title' => 'Strategic Advisory Session', 'icon' => 'users', 'body' => 'High-level strategic guidance on your most important business or project decision.', 'features' => ['90-minute confidential session', 'Founder-level insight', 'Actionable next steps'], 'duration' => '90 minutes', 'zar' => 45000, 'from' => true, 'unit' => null, 'cta' => 'Request Session'],
            ['key' => 'depth-diagnostic', 'code' => 'KP-S02', 'title' => 'Depth Diagnostic & Clarity Session', 'icon' => 'search', 'body' => 'Deep diagnostic of a specific challenge with clear analysis and options.', 'features' => ['120-minute working session', 'Diagnostic report', 'Decision pathways'], 'duration' => '120 minutes', 'zar' => 75000, 'from' => true, 'unit' => null, 'cta' => 'Request Session'],
            ['key' => 'project-development', 'code' => 'KP-S03', 'title' => 'Project Development Engagement', 'icon' => 'target', 'body' => 'Hands-on advisory through key project development stages.', 'features' => ['Stage-based engagement', 'Tools and frameworks', 'Team alignment'], 'duration' => 'Scoped per stage', 'zar' => null, 'from' => false, 'unit' => null, 'cta' => 'Request Engagement'],
            ['key' => 'board-dialogue', 'code' => 'KP-S04', 'title' => 'Executive Board Dialogue', 'icon' => 'users', 'body' => 'Founder-facilitated offsite or boardroom dialogue on strategy, risk or growth.', 'features' => ['Half-day or full-day', 'Board-level dialogue', 'Strategic clarity'], 'duration' => 'Half-day or full-day', 'zar' => 120000, 'from' => true, 'unit' => null, 'cta' => 'Enquire Now'],
            ['key' => 'advisory-partnership', 'code' => 'KP-S05', 'title' => 'Ongoing Advisory Partnership', 'icon' => 'handshake', 'body' => 'Retainer-style engagement for continuous strategic support.', 'features' => ['Monthly or quarterly', 'Priority access', 'Ongoing guidance'], 'duration' => 'Monthly', 'zar' => 150000, 'from' => true, 'unit' => '/ month', 'cta' => 'Discuss Partnership'],
        ];
    }

    public static function deliveryModes(): array
    {
        return [
            ['K1', 'Founder Direct', 'Kruger personally prepares for and leads. Stated only after a confirmed booking.'],
            ['K2', 'Founder Anchored', 'A named TBCA professional leads; Kruger performs a specific, disclosed part.'],
            ['K3', 'KP-Originated, TBCA-Delivered', 'A named TBCA professional delivers; Kruger does not attend. You are told before payment.'],
            ['K4', 'Specialist-Led', 'A qualified specialist or partner leads, for a competence-based reason.'],
        ];
    }

    public static function timeSlots(): array
    {
        return ['08:00 - 09:30', '10:00 - 11:30', '12:00 - 13:30', '14:00 - 15:30', '16:00 - 17:30'];
    }

    public static function speakingFormats(): array
    {
        return [
            ['keynote', 'Keynote Speaking', 'Conferences, summits and corporate events.', 'mic', 'Request Kruger'],
            ['panel', 'Panel Participation', 'Strategic conversations that drive insight.', 'message-circle', 'Invite to Panel'],
            ['interview', 'Media Interviews', 'TV, radio, podcasts and digital media.', 'radio', 'Request Interview'],
            ['webinar', 'Webinars & Broadcasts', 'Live sessions and virtual keynotes.', 'video', 'Book a Session'],
            ['topics', 'Topics & Themes', "Explore Kruger's core focus areas.", 'file-text', 'View Topics'],
        ];
    }

    public static function speakingTopics(): array
    {
        return [
            ['Capital Readiness', 'How African businesses become investable and attract the right capital.', 'bar-chart-3'],
            ['Execution & Delivery', 'From strategy to results. Building execution systems that scale.', 'target'],
            ['Governance & Boards', 'High-performance boards, accountability and ethical leadership.', 'building-2'],
            ["Africa's Growth Agenda", 'Trends, opportunities and the future of business on the continent.', 'globe'],
            ['AI, Data & Productivity', 'Using technology, data and AI to drive productivity and competitive advantage.', 'lightbulb'],
        ];
    }

    /** Appearances shown in KP's design. They display only after the asset is verified (blueprint 2.2). */
    public static function appearances(): array
    {
        return [
            ['Keynote', 'Africa CEO Forum 2025', 'Keynote: Building Competitive African Businesses in a Global Economy.', 'May 2025', 'Johannesburg, SA'],
            ['TV Interview', 'CNBC Africa Power Lunch', "Interview: Africa's Investment Outlook and Capital Flows.", 'Apr 2025', 'CNBC Africa'],
            ['Podcast', 'Move the Needle Podcast', 'Episode: From Ideas to Impact. The Execution Gap.', 'Apr 2025', 'Move the Needle'],
            ['Radio', '702 Business Talk', "Interview: SMEs, Jobs and South Africa's Growth Plan.", 'Mar 2025', '702 Radio'],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Resources (Page 13) */
    /* ------------------------------------------------------------------ */

    public static function resourceCategories(): array
    {
        return ['framework' => 'Frameworks', 'template' => 'Templates', 'guide' => 'Guides', 'checklist' => 'Checklists', 'tool' => 'Tools', 'report' => 'Books & Reports', 'media' => 'Media'];
    }

    public static function resources(): array
    {
        return [
            ['execution-excellence-framework', 'Execution Excellence Framework', 'framework', 'Strategy', 'A practical framework for turning strategy into measurable results.', 'PDF', true],
            ['africa-business-outlook-2025', 'Africa Business Outlook 2025', 'report', 'Markets', 'Key trends, opportunities and risks shaping African business.', 'PDF', true],
            ['capital-readiness-diagnostic', 'Capital Readiness Diagnostic', 'tool', 'Funding', 'Assess your business readiness to attract and secure funding.', 'XLSX', true],
            ['board-effectiveness-checklist', 'Board Effectiveness Checklist', 'checklist', 'Governance', 'Evaluate board performance and governance maturity.', 'PDF', true],
            ['project-development-playbook', 'Project Development Playbook', 'guide', 'Projects', 'Step-by-step guide to move from concept to bankability.', 'PDF', true],
            ['strategic-planning-template', 'Strategic Planning Template', 'template', 'Strategy', 'One-page template for strategy development.', 'DOCX', false],
            ['africa-investor-presentation-deck', 'Africa Investor Presentation Deck', 'tool', 'Funding', 'Slide deck to engage investors effectively.', 'PPTX', false],
            ['measuring-what-matters', 'Measuring What Matters', 'guide', 'Performance', 'KPIs that drive growth and accountability.', 'PDF', false],
            ['risk-assessment-checklist', 'Risk Assessment Checklist', 'checklist', 'Risk', 'Identify and assess key business risks.', 'PDF', false],
            ['governance-principles-summary', 'Governance Principles Summary', 'guide', 'Governance', 'Core governance principles for boards.', 'PDF', false],
            ['cash-flow-forecast-template', 'Cash Flow Forecast Template', 'template', 'Finance', 'Thirteen-week cash flow forecast with scenario columns.', 'XLSX', false],
            ['decision-quality-framework', 'Decision Quality Framework', 'framework', 'Strategy', 'Test options, assumptions and risks before a board decision.', 'PDF', false],
        ];
    }
}
