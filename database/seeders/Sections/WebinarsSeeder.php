<?php

namespace Database\Seeders\Sections;

use App\Models\Insights\Webinar;
use App\Models\Insights\WebinarRegistration;
use App\Models\User;
use App\Models\Webinars\ChatMessage;
use App\Models\Webinars\ConsoleRecord;
use App\Models\Webinars\Poll;
use App\Models\Webinars\Question;
use App\Support\Webinars\WebinarRegister;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Idempotent demo data for the Webinars transaction ecosystem.
 *
 * The flagship "From Vision to Execution" event (15 Aug 2026) is complete with an
 * approved replay and carries the full staff-console registers. Upcoming events are
 * dated relative to today so countdowns and registration always work; one event is
 * seeded in the LIVE state for the live room, Q&A, polls and moderation console.
 */
class WebinarsSeeder extends Seeder
{
    private const FIRST = ['Thandi', 'Michael', 'Ayesha', 'Sibusiso', 'Lerato', 'Thabo', 'Sarah', 'Amina', 'James', 'Fatima', 'Kwame', 'Nomvula', 'Peter', 'Zanele', 'David', 'Grace', 'Tendai', 'Chipo', 'Musa', 'Naledi', 'Kofi', 'Esther', 'Brian', 'Palesa', 'Joseph', 'Lindiwe', 'Samuel', 'Refilwe', 'Daniel', 'Busisiwe', 'Ahmed', 'Mpho', 'Ruth', 'Tariro', 'Olu', 'Nandi'];

    private const LAST = ['Nkosi', 'Dlamini', 'Patel', 'Mthembu', 'Molefe', 'Khumalo', 'Ndlovu', 'Mohammed', 'Lartey', 'Diallo', 'Mensah', 'Sithole', 'Radebe', 'Moyo', 'Okafor', 'Banda', 'Phiri', 'Mokoena', 'Hassan', 'Okoth', 'Chen', 'Kimani', 'Mwangi', 'Ahmed', 'Nyathi', 'Zulu', 'Mutasa', 'Boateng', 'Achieng', 'Kariuki'];

    private const ORG = ['Holdings', 'Consulting', 'Advisors', 'Trading', 'Group', 'Projects', 'Ventures', 'Capital', 'Logistics', 'Agri'];

    private const SOURCES = [['TBCA Website', 42], ['Email Campaign', 26], ['Social Media', 18], ['Partner Referral', 9], ['Other', 5]];

    public function run(): void
    {
        $events = [];
        foreach ($this->events() as $e) {
            $events[$e['slug']] = Webinar::updateOrCreate(['slug' => $e['slug']], collect($e)->except('slug')->all());
        }

        // The Resources register shares this catalogue; give its events an honest state and category.
        $map = ['Project Advisory' => 'infrastructure', 'Finance' => 'finance', 'Technology' => 'technology', 'Strategy' => 'strategy', 'Legal & Compliance' => 'compliance', 'People & Leadership' => 'leadership', 'Marketing & Sales' => 'marketing', 'Operations' => 'strategy'];
        Webinar::whereNotIn('slug', array_keys($events))->get()->each(function (Webinar $w) use ($map) {
            $w->update([
                'category' => $map[$w->topic] ?? 'strategy',
                'state' => $w->endsAt()->isPast() ? 'published' : 'approved',
                'replay_published_at' => $w->endsAt()->isPast() ? $w->endsAt()->addDays(3) : null,
            ]);
        });

        $flagship = $events['from-vision-to-execution'];
        $live = $events['ai-for-african-smes'];
        $next = $events['accessing-funding-in-africa'];

        $this->registrations($flagship, 412, 28, 287, '2026-08-01');
        $this->registrations($live, 296, 6, 248, now()->subDays(14)->toDateString(), live: true);
        $this->registrations($next, 186, 4, 0, now()->subDays(10)->toDateString());
        $this->registrations($events['digital-marketing-for-growth'], 94, 1, 0, now()->subDays(6)->toDateString());
        $this->registrations($events['sme-export-readiness'], 41, 0, 0, now()->subDays(3)->toDateString());
        $this->registrations($events['scaling-african-smes'], 233, 9, 161, '2026-09-10');

        $this->liveRoom($live);
        $this->flagshipRoom($flagship);
        $this->feedback($flagship, 214);
        $this->consoleRecords($flagship);
        $this->preflight($next, false);
        $this->preflight($flagship, true);
        $this->preflight($live, true);
        $this->demoClient([$flagship, $live, $next]);
    }

    private function events(): array
    {
        $kp = ['speaker' => 'Kruger Phiri', 'speaker_role' => 'Founder, The Business Clinic.Africa'];
        $at = fn (int $days, int $hour = 14) => today()->addDays($days)->setTime($hour, 0);
        $metrics = fn (int $reg, int $att, int $rev, float $rating, int $conv) => ['registrations' => $reg, 'attended' => $att, 'revenue' => $rev, 'rating' => $rating, 'conversions' => $conv];

        return [
            [
                'slug' => 'from-vision-to-execution', 'title' => 'From Vision to Execution: Building Scalable African Businesses',
                'tagline' => 'Practical frameworks, real African case studies and actionable steps to help you grow, scale and compete.',
                'summary' => 'Practical frameworks to turn your business vision into measurable growth.',
                ...$kp, 'topic' => 'Growth', 'category' => 'strategy', 'audience' => 'Business owners, SME managers and investors',
                'starts_at' => Carbon::parse('2026-08-15 14:00'), 'duration_minutes' => 90, 'cpd' => true, 'icon' => 'target', 'featured' => true,
                'state' => 'published', 'replay_published_at' => Carbon::parse('2026-08-18 14:30'), 'views' => 2436, 'capacity' => 500,
                'replay_version' => 'Replay v1.0 (approved 18 Aug 2026)', 'review_due' => Carbon::parse('2027-08-15'),
                'details' => [
                    'about' => [
                        'This webinar shows you how to move from a solid business idea to a scalable, investor-ready and sustainable African business. You will learn practical steps, proven frameworks and real African examples that can be applied immediately.',
                        'The session is designed for business owners, entrepreneurs, SME managers, investors and development partners who want clear, practical guidance on building and scaling businesses in African markets.',
                    ],
                    'speakers' => [['Kruger Phiri', 'Founder, The Business Clinic.Africa'], ['Nitesh Singh', 'Technical Producer, Right Click AI Media'], ['Guest Panel', 'Verified guest speakers']],
                    'quote' => ['Ideas are powerful. Execution creates freedom.', 'Kruger Phiri'],
                    'replay_duration' => '1:32:15', 'file' => ['HD 1080p (MP4)', '1.2 GB'],
                    'metrics' => $metrics(412, 287, 223680, 4.8, 64),
                    'settings' => ['approval_by' => 'Kruger Phiri', 'approved_at' => '18 Aug 2026, 11:24'],
                    // Channel snapshots from Zoho Campaigns / Analytics (demo values).
                    'reach' => 1284, 'offer_clicks' => 224, 'offer_engaged' => 155, 'reactions' => 412,
                    'replay_stats' => ['reach' => 5842, 'views' => 2436, 'downloads' => 1128, 'cta' => 214, 'avg_watch' => '28:12', 'daily' => [148, 121, 96, 84, 70, 61, 55, 49, 44, 40, 37, 33, 30, 26], 'reach_delta' => 42, 'views_delta' => 35, 'downloads_delta' => 48, 'cta_delta' => 26],
                    'followup' => ['views' => 68, 'clicks' => 21, 'booked' => 8],
                ],
            ],
            [
                'slug' => 'ai-for-african-smes', 'title' => 'AI for African SMEs: From Tools to Real Results',
                'tagline' => 'A practical guide to using AI to improve productivity and profitability.',
                'summary' => 'A practical guide to using AI to improve productivity and profitability.',
                'speaker' => 'Tariro Moyo', 'speaker_role' => 'AI and Digital Transformation Lead', 'topic' => 'Technology', 'category' => 'technology',
                'starts_at' => now()->subMinutes(36)->second(0), 'duration_minutes' => 90, 'cpd' => true, 'icon' => 'bot', 'featured' => true, 'state' => 'live', 'capacity' => 500,
                'details' => ['current_topic' => 'Key Sectors Driving African Growth', 'slide' => [7, 12], 'quote' => ['Knowledge shared today builds the businesses, jobs and opportunities of tomorrow.', 'Kruger Phiri']],
            ],
            [
                'slug' => 'accessing-funding-in-africa', 'title' => 'Accessing Funding in Africa: Grants, Investors and Beyond',
                'tagline' => 'How to prepare, position and access the right funding for your business.',
                'summary' => 'How to prepare, position and access the right funding for your business.',
                'speaker' => 'Nomsa Dlamini', 'speaker_role' => 'Investment Specialist', 'topic' => 'Funding', 'category' => 'finance',
                'starts_at' => $at(5), 'duration_minutes' => 90, 'cpd' => true, 'icon' => 'coins', 'featured' => true, 'state' => 'awaiting_w1', 'capacity' => 500,
            ],
            [
                'slug' => 'digital-marketing-for-growth', 'title' => 'Digital Marketing for Growth: Attract, Convert, Retain',
                'tagline' => 'Proven strategies to grow your brand and customer base in African markets.',
                'summary' => 'Proven strategies to grow your brand and customer base in African markets.',
                'speaker' => 'Daniel Okafor', 'speaker_role' => 'Marketing Strategist', 'topic' => 'Marketing', 'category' => 'marketing',
                'starts_at' => $at(12), 'duration_minutes' => 90, 'cpd' => false, 'icon' => 'trending-up', 'featured' => true, 'state' => 'approved',
            ],
            [
                'slug' => 'infrastructure-investment-readiness', 'title' => 'Infrastructure Investment Readiness',
                'tagline' => 'From concept note to bankable project: what funders need to see.',
                'summary' => 'From concept note to bankable project: what funders need to see.',
                ...$kp, 'topic' => 'Funding', 'category' => 'infrastructure',
                'starts_at' => $at(19, 11), 'duration_minutes' => 75, 'cpd' => true, 'icon' => 'building-2', 'state' => 'approved',
            ],
            [
                'slug' => 'sme-export-readiness', 'title' => 'SME Export Readiness under AfCFTA',
                'tagline' => 'Prepare your products, paperwork and partners for regional trade.',
                'summary' => 'Prepare your products, paperwork and partners for regional trade. Paid masterclass with workbook.',
                'speaker' => 'Amina Hassan', 'speaker_role' => 'Trade and Market Entry Advisor', 'topic' => 'Markets', 'category' => 'trade',
                'starts_at' => $at(26), 'duration_minutes' => 120, 'cpd' => true, 'icon' => 'globe', 'state' => 'approved', 'price_zar' => 950, 'capacity' => 150,
            ],
            [
                'slug' => 'governance-for-growing-businesses', 'title' => 'Governance for Growing Businesses',
                'tagline' => 'Boards, controls and POPIA basics before you raise capital.',
                'summary' => 'Boards, controls and POPIA basics before you raise capital.',
                'speaker' => 'Lerato Dlamini', 'speaker_role' => 'Compliance Lead', 'topic' => 'Governance', 'category' => 'compliance',
                'starts_at' => $at(40), 'duration_minutes' => 60, 'cpd' => true, 'icon' => 'shield-check', 'state' => 'draft',
            ],
            [
                'slug' => 'scaling-african-smes', 'title' => 'Scaling African SMEs: Systems Before Size',
                'tagline' => 'The operating systems that let small firms grow without breaking.',
                'summary' => 'The operating systems that let small firms grow without breaking.',
                ...$kp, 'topic' => 'Growth', 'category' => 'strategy',
                'starts_at' => Carbon::parse('2026-09-24 14:00'), 'duration_minutes' => 75, 'cpd' => true, 'icon' => 'layers', 'state' => 'awaiting_w3',
                'details' => ['metrics' => $metrics(233, 161, 0, 0, 0), 'replay_duration' => '1:14:02'],
            ],
            [
                'slug' => 'ai-for-business-growth', 'title' => 'AI for Business Growth',
                'tagline' => 'Where AI creates leverage in sales, service and operations.',
                'summary' => 'Where AI creates leverage in sales, service and operations.',
                'speaker' => 'Tariro Moyo', 'speaker_role' => 'AI and Digital Transformation Lead', 'topic' => 'Technology', 'category' => 'technology',
                'starts_at' => Carbon::parse('2026-07-30 14:00'), 'duration_minutes' => 90, 'cpd' => true, 'icon' => 'cpu', 'state' => 'published',
                'replay_published_at' => Carbon::parse('2026-08-03 10:00'), 'views' => 1820,
                'details' => ['metrics' => $metrics(368, 251, 151260, 4.7, 41), 'replay_duration' => '1:28:40'],
            ],
            [
                'slug' => 'from-ideas-to-funding', 'title' => 'From Ideas to Funding',
                'tagline' => 'Turning a strong idea into a fundable proposition.',
                'summary' => 'Turning a strong idea into a fundable proposition.',
                'speaker' => 'Nomsa Dlamini', 'speaker_role' => 'Investment Specialist', 'topic' => 'Funding', 'category' => 'finance',
                'starts_at' => Carbon::parse('2026-07-16 14:00'), 'duration_minutes' => 75, 'cpd' => true, 'icon' => 'coins', 'state' => 'edited',
                'replay_published_at' => Carbon::parse('2026-07-21 10:00'), 'views' => 1544,
                'details' => ['metrics' => $metrics(326, 221, 131040, 4.6, 38), 'replay_duration' => '1:09:12', 'edit_note' => 'Edited for participant privacy: two attendee questions removed.'],
            ],
            [
                'slug' => 'automation-for-smes', 'title' => 'Automation for SMEs',
                'tagline' => 'Simple automations that save hours every week.',
                'summary' => 'Simple automations that save hours every week.',
                ...$kp, 'topic' => 'Technology', 'category' => 'technology',
                'starts_at' => Carbon::parse('2026-07-02 14:00'), 'duration_minutes' => 60, 'cpd' => false, 'icon' => 'zap', 'state' => 'corrected',
                'replay_published_at' => Carbon::parse('2026-07-07 10:00'), 'views' => 1290,
                'details' => ['metrics' => $metrics(298, 202, 100430, 4.5, 31), 'replay_duration' => '58:47', 'correction' => 'Correction 12 Jul 2026: a quoted productivity statistic was updated to the current published source.'],
            ],
            [
                'slug' => 'market-entry-in-africa', 'title' => 'Market Entry in Africa',
                'tagline' => 'Choosing the right first market and route to customers.',
                'summary' => 'Choosing the right first market and route to customers.',
                'speaker' => 'Amina Hassan', 'speaker_role' => 'Trade and Market Entry Advisor', 'topic' => 'Markets', 'category' => 'trade',
                'starts_at' => Carbon::parse('2026-06-18 14:00'), 'duration_minutes' => 75, 'cpd' => true, 'icon' => 'map', 'state' => 'withheld',
                'details' => ['metrics' => $metrics(274, 188, 82050, 4.4, 24), 'withheld_note' => 'Replay withheld after W3 review: guest claim could not be substantiated. The slides and checklist remain available.'],
            ],
        ];
    }

    private function name(int $i): array
    {
        $first = self::FIRST[$i % count(self::FIRST)];
        $last = self::LAST[($i * 7 + intdiv($i, count(self::FIRST))) % count(self::LAST)];

        return [$first, $last];
    }

    private function registrations(Webinar $w, int $active, int $cancelled, int $attended, string $from, bool $live = false): void
    {
        WebinarRegistration::where('webinar_id', $w->id)->where('reference', 'like', 'WBS-%')->delete();
        $bag = fn (array $weights) => collect($weights)->flatMap(fn ($n, $k) => array_fill(0, $n, $k))->all();
        $roles = $bag(['Business Owner / Founder' => 34, 'Executive / Senior Manager' => 22, 'Consultant / Advisor' => 16, 'Entrepreneur' => 12, 'Student / Early Career' => 8, 'Other' => 8]);
        $industries = $bag(['Agriculture & Agro-Processing' => 28, 'Renewable Energy' => 22, 'Infrastructure & Logistics' => 18, 'Manufacturing' => 16, 'Digital Economy' => 10, 'Professional Services' => 6]);
        $countries = ['South Africa', 'South Africa', 'South Africa', 'Botswana', 'Kenya', 'Nigeria', 'Ghana', 'Malawi', 'Zambia', 'Namibia'];
        $sourceBag = collect(self::SOURCES)->flatMap(fn ($s) => array_fill(0, $s[1], $s[0]))->all();
        $start = Carbon::parse($from);
        $span = max(1, (int) $start->diffInDays($w->starts_at->copy()->startOfDay(), true));
        $rows = [];
        $total = $active + $cancelled;
        $partialEvery = 7;

        for ($i = 0; $i < $total; $i++) {
            [$first, $last] = $this->name($i);
            $isCancelled = $i >= $active;
            $didAttend = ! $isCancelled && $i < $attended;
            $partial = $didAttend && $i % $partialEvery === 3;
            $watch = $didAttend ? ($partial ? 25 + ($i * 7) % 30 : 60 + ($i * 11) % 31) : 0;
            $joined = $didAttend ? $w->starts_at->copy()->addMinutes(($i * 3) % 22) : null;
            $created = $start->copy()->addDays((int) floor(pow(($i % 97) / 97, 0.6) * $span))->setTime(8 + $i % 10, ($i * 13) % 60);
            $status = $isCancelled ? 'cancelled' : 'registered';
            $attendance = $isCancelled ? 'pending' : ($didAttend ? ($partial ? 'partial' : 'attended') : ($attended > 0 && ! $live ? 'no_show' : 'pending'));
            $consent = $i % 103 === 50 ? 'limited' : ($i === 211 ? 'pending' : ($i === 389 ? 'declined' : 'full'));
            $rows[] = [
                'reference' => sprintf('WBS-%d-%04d', $w->id, $i + 1),
                'webinar_id' => $w->id,
                'name' => "$first $last",
                'email' => Str::lower("$first.$last").($i >= count(self::FIRST) ? $i : '').'@example.com',
                'job_title' => $roles[($i * 17) % count($roles)],
                'company' => "$last ".self::ORG[$i % count(self::ORG)],
                'country' => $countries[$i % count($countries)],
                'phone' => '+27 8'.(2 + $i % 7).' '.str_pad((string) (100 + $i % 900), 3, '0').' '.str_pad((string) (1000 + ($i * 37) % 9000), 4, '0'),
                'industry' => $industries[($i * 13) % count($industries)],
                'source' => $sourceBag[($i * 7) % count($sourceBag)],
                'participation' => $i % 9 === 4 ? 'live_hidden' : ($i % 13 === 6 ? 'replay_only' : 'live_recorded'),
                'status' => $status,
                'attendance' => $attendance,
                'joined_at' => $joined,
                'left_at' => $joined && ! $live ? $joined->copy()->addMinutes($watch) : null,
                'watch_minutes' => $watch,
                'chat_count' => $didAttend ? ($i * 5) % 19 : 0,
                'poll_count' => $didAttend && $i % 5 !== 0 ? 1 + $i % 3 : 0,
                'download_count' => $didAttend ? $i % 9 : ($i % 4 === 0 ? 1 : 0),
                'consent_state' => $consent,
                'certificate' => $didAttend && ! $partial && ! $live && $w->cpd ? 'issued' : 'not_issued',
                'followup_status' => $attendance === 'no_show' ? ($i % 25 === 2 ? 'pending' : 'sent') : null,
                'followup_sent_at' => $attendance === 'no_show' && $i % 25 !== 2 ? $w->endsAt()->addDay()->setTime(9, 12 + $i % 40) : null,
                'opt_resources' => $i % 3 !== 0,
                'opt_offers' => $i % 4 === 0,
                'notices' => json_encode(['recording' => 'WB-R1-2026.08', 'offer' => 'WB-O1-2026.08', 'boundary' => 'WB-B1-2026.08', 'at' => $created->toIso8601String()]),
                'access_token' => Str::random(40),
                'created_at' => $created,
                'updated_at' => $created,
            ];
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('ins_webinar_registrations')->insert($chunk);
        }
    }

    private function liveRoom(Webinar $w): void
    {
        $w->questions()->delete();
        $w->chat()->delete();
        $w->polls()->delete();
        $t = $w->starts_at;

        foreach ([
            ['Sarah Ndlovu', 'Trade & Export', 'How is AfCFTA changing opportunities for agro-processing businesses in Southern Africa?', 24, true, 'approved'],
            ['Thabo Khumalo', 'Investment', 'What are the key regulatory steps for setting up a manufacturing plant in Kenya?', 18, false, 'approved'],
            ['Amina Mohammed', 'Finance', 'Can you explain the funding options available for renewable energy projects in West Africa?', 15, false, 'approved'],
            ['Daniel Lartey', 'Market Entry', 'What due diligence checks do you recommend before entering a new African market?', 12, false, 'approved'],
            ['James Okoro', 'Partnerships', 'How can we find reliable local partners for a distribution network?', 10, false, 'approved'],
            ['Thandi Mthembu', 'General Question', 'How can SMEs with limited budgets start using AI in their operations?', 9, false, 'pending'],
            ['James Mwangi', 'General Question', 'Are the toolkit templates available for immediate download?', 6, false, 'pending'],
            ['Sarah Ahmed', 'Market Entry', 'Can you share a real example of an African business that scaled using this approach?', 5, false, 'pending'],
            ['Kofi Mensah', 'Finance', 'Which AI tools give the fastest payback for a small finance team?', 4, false, 'pending'],
            ['Grace Banda', 'General Question', 'Will the slide deck be shared after the session?', 3, false, 'pending'],
            ['Peter Radebe', 'Investment', 'Do investors now ask about AI readiness in due diligence?', 8, false, 'answered'],
            ['Naledi Zulu', 'General Question', 'Is there a checklist for choosing an AI vendor?', 7, false, 'answered'],
            ['Musa Nyathi', 'Other', 'Can you review my specific tax position on imported equipment?', 1, false, 'dismissed'],
        ] as $i => [$name, $cat, $body, $votes, $priority, $status]) {
            Question::create(['webinar_id' => $w->id, 'name' => $name, 'category' => $cat, 'body' => $body, 'upvotes' => $votes, 'priority' => $priority, 'pinned' => $i < 2, 'status' => $status, 'asked_at' => $t->copy()->addMinutes(27 + $i)]);
        }

        foreach ([
            ['Sarah Ndlovu', 'Great insights so far. How do you see AfCFTA changing manufacturing opportunities?', false, 5],
            ['Thabo Khumalo', 'Very relevant. Can you share the template mentioned for market entry analysis?', false, 6],
            ['Amina Mohammed', 'This is exactly what we need in our country. Thank you TBCA!', false, 7],
            ['James Lartey', 'Will the slide deck be available after the session?', false, 8],
            ['Tariro Moyo (Host)', 'Yes, the slide deck and selected tools will be available after the event, once the replay has completed the review process.', true, 9],
        ] as [$name, $body, $host, $m]) {
            ChatMessage::create(['webinar_id' => $w->id, 'name' => $name, 'body' => $body, 'is_host' => $host, 'posted_at' => $t->copy()->addMinutes($m)]);
        }

        $opts = fn (array $pairs) => array_map(fn ($p) => ['label' => $p[0], 'votes' => $p[1]], $pairs);
        Poll::create(['webinar_id' => $w->id, 'sort' => 1, 'status' => 'active', 'question' => 'Which sector offers the biggest opportunity for investment in Africa over the next 5 years?', 'options' => $opts([['Agriculture & Agro-Processing', 98], ['Renewable Energy', 81], ['Infrastructure & Logistics', 63], ['Manufacturing', 29], ['Digital Economy', 16]])]);
        Poll::create(['webinar_id' => $w->id, 'sort' => 2, 'status' => 'upcoming', 'question' => 'How confident are you about doing business in Africa in the next 12 months?', 'options' => $opts([['Very confident', 0], ['Somewhat confident', 0], ['Neutral', 0], ['Somewhat uncertain', 0], ['Not confident', 0]])]);
        Poll::create(['webinar_id' => $w->id, 'sort' => 0, 'status' => 'closed', 'question' => 'What is your main objective for attending this webinar?', 'options' => $opts([['Find investment opportunities', 90], ['Learn about market entry', 56], ['Understand regulatory requirements', 39], ['Meet potential partners', 22], ['Other', 8]])]);
        Poll::create(['webinar_id' => $w->id, 'sort' => 3, 'status' => 'upcoming', 'question' => 'Should TBCA host a follow-up deep-dive session on this topic?', 'options' => $opts([['Yes', 0], ['No', 0], ['Maybe', 0]])]);
    }

    private function flagshipRoom(Webinar $w): void
    {
        $w->questions()->delete();
        $w->polls()->delete();
        $t = $w->starts_at;
        $cats = WebinarRegister::questionCategories();
        for ($i = 0; $i < 56; $i++) {
            [$f, $l] = $this->name($i + 3);
            Question::create(['webinar_id' => $w->id, 'name' => "$f $l", 'category' => $cats[$i % 6], 'body' => 'Question '.($i + 1).' about scaling, funding or partnerships (moderated and answered live).', 'upvotes' => ($i * 7) % 25, 'status' => $i % 9 === 0 ? 'dismissed' : 'answered', 'asked_at' => $t->copy()->addMinutes(20 + $i)]);
        }
        Poll::create(['webinar_id' => $w->id, 'sort' => 1, 'status' => 'closed', 'question' => 'What is your biggest business challenge today?', 'options' => array_map(fn ($p) => ['label' => $p[0], 'votes' => $p[1]], [['Access to finance', 92], ['Finding customers', 80], ['Operational efficiency', 69], ['Skills and talent', 46], ['Other', 23]])]);
    }

    private function feedback(Webinar $w, int $n): void
    {
        $w->feedback()->delete();
        $rel = ['Extremely relevant', 'Extremely relevant', 'Very relevant', 'Very relevant', 'Relevant', 'Somewhat relevant'];
        $rows = [];
        for ($i = 0; $i < $n; $i++) {
            $rows[] = ['webinar_id' => $w->id, 'rating' => $i % 6 === 5 ? 4 : 5 - ($i % 11 === 3 ? 1 : 0), 'relevance' => $rel[$i % 6], 'valuable' => json_encode(['Expert insights', 'Practical tools and templates']), 'contact_ok' => $i % 2 === 0, 'created_at' => $w->endsAt()->addMinutes(10 + $i), 'updated_at' => $w->endsAt()->addMinutes(10 + $i)];
        }
        DB::table('wb_feedback')->insert($rows);
    }

    private function preflight(Webinar $w, bool $complete): void
    {
        ConsoleRecord::where('webinar_id', $w->id)->whereIn('kind', ['task', 'team', 'issue'])->delete();
        foreach (WebinarRegister::preflightTasks() as $i => [$task, $owner, $group, $due]) {
            $status = $complete ? 'completed' : ($i < 3 || in_array($i, [5, 6, 8, 9, 11], true) ? 'completed' : ($i < 5 ? 'in_progress' : 'pending'));
            ConsoleRecord::create(['webinar_id' => $w->id, 'kind' => 'task', 'title' => $task, 'status' => $status, 'sort' => $i, 'data' => ['owner' => $owner, 'group' => $group, 'due' => $w->starts_at->copy()->addDays($due)->format('j M Y')]]);
        }
        foreach (WebinarRegister::productionTeam() as $i => [$name, $role, $ini]) {
            ConsoleRecord::create(['webinar_id' => $w->id, 'kind' => 'team', 'title' => $name, 'status' => 'confirmed', 'sort' => $i, 'data' => ['role' => $role, 'initials' => $ini]]);
        }
        if (! $complete) {
            ConsoleRecord::create(['webinar_id' => $w->id, 'kind' => 'issue', 'title' => 'Live poll testing pending', 'status' => 'open', 'data' => ['body' => 'Poll questions to be tested in final rehearsal.']]);
        }
    }

    private function consoleRecords(Webinar $w): void
    {
        ConsoleRecord::where('webinar_id', $w->id)->whereNotIn('kind', ['task', 'team', 'issue'])->delete();
        $add = function (string $kind, array $rows, callable $map) use ($w) {
            foreach ($rows as $i => $r) {
                ConsoleRecord::create(['webinar_id' => $w->id, 'kind' => $kind, 'sort' => $i] + $map($r));
            }
        };

        $add('claim', [
            ['From Vision to Execution', 'Slide 5 (02:15)', "Africa's MSMEs can unlock significant value by 2030.", 'Market Size', 'Research Report', 'Uploaded (2 files)', 'approved', 'K. Phiri', '12 Aug 2026'],
            ['From Vision to Execution', 'Slide 8 (04:32)', 'TBCA maintains a catalogue of ready-to-execute Sprints.', 'Product Claim', 'Internal Registry', 'Uploaded (1 file)', 'approved', 'N. Singh', '11 Aug 2026'],
            ['From Vision to Execution', 'Slide 11 (06:48)', 'Clients typically achieve 30-60% productivity gains.', 'Performance', 'Case Studies', 'Uploaded (3 files)', 'in_review', 'M. Dlamini', '14 Aug 2026'],
            ['From Vision to Execution', 'Slide 14 (08:20)', 'AI agents can automate a large share of routine tasks.', 'Technology', 'Benchmark Study', 'Uploaded (1 file)', 'approved', 'T. Ndlovu', '12 Aug 2026'],
            ['AI for Business Growth', 'Slide 7 (05:10)', 'Businesses using AI report faster decision making.', 'Customer Impact', 'Client Testimony', 'Uploaded (2 files)', 'approved', 'A. Hassan', '13 Aug 2026'],
            ['Funding Readiness', 'Slide 10 (07:45)', 'Well-prepared businesses are more likely to secure funding.', 'Market Research', 'External Study', 'Uploaded (1 file)', 'in_review', 'J. Okoth', '14 Aug 2026'],
            ['Automation for SMEs', 'Slide 6 (03:50)', 'SMEs can reduce operating costs by up to 40%.', 'Performance', 'Case Study / ROI', 'Uploaded (2 files)', 'changes', 'L. Mokoena', '11 Aug 2026'],
            ['Market Entry in Africa', 'Slide 9 (06:30)', 'Regional expansion can increase revenue by 50%+.', 'Growth Claim', 'Client Reference', 'Pending Upload', 'in_review', 'P. Chen', '14 Aug 2026'],
        ], fn ($r) => ['title' => $r[2], 'status' => $r[6], 'data' => ['webinar' => $r[0], 'slide' => $r[1], 'type' => $r[3], 'evidence' => $r[4], 'evidence_status' => $r[5], 'owner' => $r[7], 'updated' => $r[8]]]);

        $add('evidence', [
            ['GSMA_Africa_Digital_Report_2026.pdf', 'Research Report', 'Claim #1', 'K. Phiri', '12 Aug 2026', 'verified'],
            ['TBCA_Sprint_Registry_2026.xlsx', 'Internal Data', 'Claim #2', 'N. Singh', '11 Aug 2026', 'verified'],
            ['Client_Case_Study_Marula.pdf', 'Case Study', 'Claim #5', 'A. Hassan', '13 Aug 2026', 'verified'],
            ['AfDB_SME_Productivity_Study.pdf', 'External Study', 'Claim #3', 'M. Dlamini', '14 Aug 2026', 'in_review'],
            ['Webinar_Slide_Deck_v3.pptx', 'Presentation', 'Multiple', 'T. Ndlovu', '12 Aug 2026', 'verified'],
            ['Sponsor_Agreement_VivoEnergy.pdf', 'Contract', 'Claim #8', 'P. Chen', '14 Aug 2026', 'pending'],
        ], fn ($r) => ['title' => $r[0], 'status' => $r[5], 'data' => ['type' => $r[1], 'claim' => $r[2], 'by' => $r[3], 'date' => $r[4]]]);

        $add('guest', [
            ['Dr. Thandi Ndlovu', 'University of Limpopo', 'Guest Speaker', 'Opening Keynote', 'confirmed', '12 Jul 2026', '15 Jul 2026', 0],
            ['Mr. Sipho Dlamini', 'Marula Fund Management', 'Strategic Partner', 'Investment Insights', 'confirmed', '10 Jul 2026', '13 Jul 2026', 0],
            ['Ms. Amina Hassan', 'Sibanye Stillwater', 'Sponsor', 'Sponsor Address', 'confirmed', '08 Jul 2026', '10 Jul 2026', 120000],
            ['Mr. James Okoth', 'HG Global', 'Guest Speaker', 'Infrastructure Case Study', 'pending', '14 Jul 2026', null, 0],
            ['Ms. Lerato Mokoena', 'Vivo Energy', 'Sponsor', 'Energy Transition', 'confirmed', '09 Jul 2026', '11 Jul 2026', 250000],
            ['Prof. David Chen', 'Smart Space Network', 'Guest Speaker', 'Digital Transformation', 'confirmed', '11 Jul 2026', '12 Jul 2026', 0],
            ['Mr. Paulo Nogueira', '2Cents Solutions', 'Strategic Partner', 'SME Enablement', 'invited', '13 Jul 2026', null, 0],
            ['Ms. Grace Banda', 'Kimani Investments', 'Sponsor', 'In-kind Support', 'confirmed', '06 Jul 2026', '09 Jul 2026', 20000],
            ['Mr. Kofi Mensah', 'Boateng Capital', 'Sponsor', 'Silver Sponsor', 'confirmed', '05 Jul 2026', '08 Jul 2026', 60000],
        ], fn ($r) => ['title' => $r[0], 'status' => $r[4], 'data' => ['organisation' => $r[1], 'type' => $r[2], 'topic' => $r[3], 'invited' => $r[5], 'confirmed' => $r[6], 'value_zar' => $r[7], 'warranties' => $r[4] === 'confirmed']]);

        $add('communication', [
            ['14 Aug 2026, 10:32', 'James Okoth', 'Invitation: From Vision to Execution', 'sent'],
            ['14 Aug 2026, 09:15', 'Lerato Mokoena', 'Speaker Briefing Pack', 'delivered'],
            ['13 Aug 2026, 16:48', 'Paulo Nogueira', 'Partnership Discussion', 'replied'],
            ['13 Aug 2026, 14:22', 'Amina Hassan', 'Sponsorship Agreement v1', 'signed'],
            ['12 Aug 2026, 11:05', 'Thandi Ndlovu', 'Session Outline Confirmation', 'confirmed'],
        ], fn ($r) => ['title' => $r[2], 'status' => $r[3], 'data' => ['at' => $r[0], 'contact' => $r[1]]]);

        $add('incident', [
            ['INC-2026-001', '15 Aug 2026 14:05', 'Technical', 'Audio dropped for 2 minutes', 'high', 'resolved', 'T. Ndlovu', '45 mins'],
            ['INC-2026-002', '15 Aug 2026 14:22', 'Platform', 'Some attendees could not join from one network', 'high', 'open', 'N. Singh', null],
            ['INC-2026-003', '15 Aug 2026 14:35', 'Content', 'Wrong slide version displayed', 'medium', 'resolved', 'M. Dlamini', '30 mins'],
            ['INC-2026-004', '15 Aug 2026 15:10', 'Q&A', 'Inappropriate question submitted', 'low', 'resolved', 'A. Hassan', '15 mins'],
            ['INC-2026-005', '15 Aug 2026 15:28', 'Recording', 'Recording interrupted', 'high', 'open', 'P. Chen', null],
            ['INC-2026-006', '15 Aug 2026 14:48', 'Q&A', 'Attendee disclosed confidential client detail in a question', 'medium', 'resolved', 'L. Mokoena', '10 mins'],
        ], fn ($r) => ['code' => $r[0], 'title' => $r[3], 'status' => $r[5], 'data' => ['at' => $r[1], 'category' => $r[2], 'severity' => $r[4], 'assigned' => $r[6], 'resolution' => $r[7]]]);

        $add('risk', [
            ['RISK-001', 'Platform outage during live session', 'Technical', 'high', 'high', 'critical', 'Dual-platform backup', 'T. Ndlovu', 'open'],
            ['RISK-002', 'Poor internet connectivity (speakers)', 'Technical', 'medium', 'high', 'high', 'Pre-event connectivity test', 'N. Singh', 'in_progress'],
            ['RISK-003', 'Inappropriate content or comments', 'Reputational', 'medium', 'medium', 'medium', 'Live moderation rules', 'A. Hassan', 'mitigated'],
            ['RISK-004', 'Recording failure', 'Operational', 'low', 'high', 'medium', 'Redundant recording setup', 'P. Chen', 'open'],
        ], fn ($r) => ['code' => $r[0], 'title' => $r[1], 'status' => $r[8], 'data' => ['category' => $r[2], 'likelihood' => $r[3], 'impact' => $r[4], 'rating' => $r[5], 'mitigation' => $r[6], 'owner' => $r[7]]]);

        $add('action', [
            ['CA-001', 'INC-2026-001', 'Improve audio redundancy', '20 Aug 2026', 'completed'],
            ['CA-002', 'INC-2026-002', 'Scale waiting room capacity', '18 Aug 2026', 'in_progress'],
            ['CA-003', 'INC-2026-005', 'Fix recording workflow', '19 Aug 2026', 'open'],
            ['CA-004', 'INC-2026-003', 'Implement slide version control', '17 Aug 2026', 'completed'],
        ], fn ($r) => ['code' => $r[0], 'title' => $r[2], 'status' => $r[4], 'data' => ['incident' => $r[1], 'due' => $r[3]]]);

        $add('offer', [
            ['Strategy Sprint Post-Webinar Offer', 'Service', 'Strategy Sprint', 19950, 7, 'active', 28, 559200],
            ['Business Diagnostic', 'Service', 'Business Diagnostic', 89950, 14, 'active', 14, 719600],
            ['TBCA Plus Subscription', 'Subscription', 'TBCA Plus (12 months)', 34950, 14, 'active', 12, 419400],
            ['Advisory Retainer', 'Service', 'Advisory Retainer', 12500, 21, 'active', 10, 125000],
            ['Toolkit Bundle', 'Product', 'AI Toolkit Bundle', 4950, 14, 'active', 8, 39600],
        ], fn ($r) => ['title' => $r[0], 'status' => $r[5], 'data' => ['type' => $r[1], 'product' => $r[2], 'price_zar' => $r[3], 'validity' => $r[4], 'conversions' => $r[6], 'revenue_zar' => $r[7]]]);

        $add('conversion', [
            ['15 Aug 2026, 14:32', 'Thabo M.', 'Strategy Sprint', 19950, 'Card', 'Live Webinar', 'webinar-live'],
            ['15 Aug 2026, 14:28', 'Lerato N.', 'TBCA Plus Subscription', 34950, 'EFT', 'Follow-Up Email', 'email-replay'],
            ['15 Aug 2026, 14:25', 'Ahmed K.', 'Business Diagnostic', 89950, 'Card', 'Live Webinar', 'webinar-live'],
            ['14 Aug 2026, 16:42', 'Nomvula S.', 'Toolkit Bundle', 4950, 'Card', 'Replay Page', 'social-linkedin'],
            ['14 Aug 2026, 11:18', 'Peter D.', 'Advisory Retainer', 12500, 'EFT', 'Follow-Up Email', 'client-portal'],
        ], fn ($r) => ['title' => $r[2], 'status' => 'paid', 'data' => ['at' => $r[0], 'attendee' => $r[1], 'amount_zar' => $r[3], 'method' => $r[4], 'source' => $r[5], 'utm' => $r[6]]]);

        $add('channel', [
            ['TBCA Website', 'Public replay page', 'published', 'globe', true],
            ['Client Portal', 'Registered users', 'published', 'users', true],
            ['YouTube', 'TBCA Channel', 'published', 'play', true],
            ['LinkedIn', 'Company Page', 'scheduled', 'briefcase', true],
            ['Email Campaign', 'All registrants', 'sent', 'mail', true],
            ['WhatsApp Broadcast', 'Key segments', 'scheduled', 'message-circle', true],
            ['Social Media', 'Facebook, X, Instagram', 'published', 'radio', true],
        ], fn ($r) => ['title' => $r[0], 'status' => $r[2], 'data' => ['sub' => $r[1], 'icon' => $r[3], 'enabled' => $r[4]]]);

        $add('distribution', [
            ['TBCA Website', 'Public replay page live', 'All visitors', '18 Aug 2026, 14:30', 'published'],
            ['Client Portal', 'Replay for registered users', 'Registered attendees', '18 Aug 2026, 14:30', 'published'],
            ['YouTube', 'Replay upload and SEO', 'Public (Global)', '18 Aug 2026, 15:00', 'published'],
            ['LinkedIn', 'Campaign post with key insights', 'Business audience', '19 Aug 2026, 09:00', 'scheduled'],
            ['Email Campaign', 'Replay now available', 'All registrants (attended)', '18 Aug 2026, 16:00', 'sent'],
            ['WhatsApp Broadcast', 'Replay link and key takeaways', 'Key segments', '19 Aug 2026, 10:00', 'scheduled'],
            ['Social Media', 'Highlights and short clips', 'Facebook, X, Instagram followers', '19 Aug 2026, 12:00', 'published'],
        ], fn ($r) => ['title' => $r[1], 'status' => $r[4], 'data' => ['channel' => $r[0], 'audience' => $r[2], 'scheduled' => $r[3]]]);

        $add('audit', [
            ['15 Aug 2026, 10:00', 'Webinar started', 'System', 'Live session initiated'],
            ['15 Aug 2026, 12:30', 'Recording stopped', 'System', 'Recording saved to secure storage'],
            ['15 Aug 2026, 13:05', 'Replay published', 'P. Chen', 'Replay access configured'],
            ['15 Aug 2026, 14:20', 'Marketing email sent', 'T. Ndlovu', 'Post-event email (approved)'],
            ['15 Aug 2026, 16:10', 'Offer link activated', 'System', 'Offer live on landing page'],
        ], fn ($r) => ['title' => $r[1], 'status' => 'logged', 'data' => ['at' => $r[0], 'user' => $r[2], 'details' => $r[3]]]);

        $add('activity', [
            ['14 Aug 2026, 16:20', 'Content claim review', 'Marketing', 'A. Hassan'],
            ['14 Aug 2026, 14:15', 'Speaker consent check', 'POPIA', 'N. Singh'],
            ['13 Aug 2026, 11:40', 'Recording access control test', 'Security', 'P. Chen'],
            ['12 Aug 2026, 09:30', 'Third-party tool compliance review', 'Third Parties', 'M. Dlamini'],
            ['11 Aug 2026, 15:10', 'Marketing email approval', 'Marketing', 'T. Ndlovu'],
        ], fn ($r) => ['title' => $r[1], 'status' => 'completed', 'data' => ['at' => $r[0], 'area' => $r[2], 'by' => $r[3]]]);

        $add('framework', [
            ['POPIA (Data Protection)'], ['ECT Act (Electronic Communications)'], ['Consumer Protection Act'], ['Advertising Standards (ASA)'], ['TBCA Brand & Messaging Policy'], ['Content IP & Licensing Policy'],
        ], fn ($r) => ['title' => $r[0], 'status' => 'compliant', 'data' => ['last' => '05 Oct 2026', 'next' => '05 Oct 2027']]);

        $add('audit_action', [
            ['AUD-001', 'Update marketing asset claim evidence', 'A. Hassan', '20 Aug 2026', 'in_progress'],
            ['AUD-002', 'Complete third-party data processing review', 'N. Singh', '22 Aug 2026', 'in_progress'],
        ], fn ($r) => ['code' => $r[0], 'title' => $r[1], 'status' => $r[4], 'data' => ['owner' => $r[2], 'due' => $r[3]]]);

        $add('asset', [
            ['Live Recording (Raw)', 'recorded', 'Internal Only', '15 Aug 2027'],
            ['Edited Replay Video', 'processing', 'Registered Attendees', '15 Aug 2027'],
            ['Chat Transcript', 'available', 'Internal Only', '15 Aug 2027'],
            ['Q&A Transcript', 'available', 'Internal Only', '15 Aug 2027'],
            ['Poll Results', 'available', 'Internal Only', '15 Aug 2027'],
        ], fn ($r) => ['title' => $r[0], 'status' => $r[1], 'data' => ['access' => $r[2], 'expiry' => $r[3]]]);

        $settings = [];
        foreach ([...WebinarRegister::recordingControls(), ...WebinarRegister::publicationOptions(), ...WebinarRegister::automationRules(), ...WebinarRegister::offerAutomation(), ...WebinarRegister::moderationSettings()] as [$key, , $on]) {
            $settings[$key] = $on;
        }
        $w->update(['details' => array_merge($w->details ?? [], ['toggles' => $settings, 'moderator_notes' => "Key points to cover in Q&A:\n- Focus on practical implementation\n- Highlight toolkit access\n- Close with clear next steps"])]);
    }

    private function demoClient(array $events): void
    {
        $client = User::where('email', 'amahle@agritechsa.co.za')->first();
        if (! $client) {
            return;
        }
        foreach ($events as $i => $w) {
            WebinarRegistration::updateOrCreate(['webinar_id' => $w->id, 'email' => $client->email], [
                'reference' => 'WB-'.$w->starts_at->format('Ymd').'-'.(1047 + $i),
                'user_id' => $client->id, 'name' => $client->name, 'job_title' => 'Business Owner / Founder', 'company' => $client->company ?? 'AgriTech SA',
                'country' => 'South Africa', 'phone' => $client->phone, 'industry' => 'Agriculture & Agro-Processing', 'participation' => 'live_recorded',
                'status' => 'registered', 'attendance' => $w->state === 'published' ? 'attended' : 'pending', 'watch_minutes' => $w->state === 'published' ? 86 : 0,
                'certificate' => $w->state === 'published' ? 'issued' : 'not_issued', 'consent_state' => 'full', 'opt_resources' => true,
                'notices' => ['recording' => 'WB-R1-2026.08', 'offer' => 'WB-O1-2026.08', 'boundary' => 'WB-B1-2026.08', 'at' => now()->toIso8601String()],
                'access_token' => Str::random(40),
                'created_at' => min(now(), $w->starts_at->copy()->subDays(9)),
            ]);
        }
    }
}
