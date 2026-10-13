<?php

namespace App\Support\Content;

use App\Support\CorePages\InfoContent;
use Illuminate\Support\Str;

/**
 * KP Thought Leadership content register.
 *
 * Article bodies are supplied by Kruger Phiri. Until an article is received the entry
 * stays in the "pending" state: the title, theme and format are listed and the page says
 * the article is pending. To publish, set 'status' => 'published' and add 'body'
 * (array of paragraphs), 'published' (date) and optionally 'read_minutes'.
 */
class KpThoughtLeadership
{
    /** Pages planned for the section in the client brief; designs and articles to be supplied by KP. */
    public const PLANNED_PAGES = 72;

    public static function themes(): array
    {
        return [
            ['slug' => 'business-strategy-growth', 'label' => 'Business Strategy & Growth', 'icon' => 'target', 'blurb' => 'Building competitive, resilient and scalable African businesses.'],
            ['slug' => 'investment-capital-raising', 'label' => 'Investment & Capital Raising', 'icon' => 'coins', 'blurb' => 'Funding readiness, investor expectations and capital mobilisation.'],
            ['slug' => 'entrepreneurship-startups', 'label' => 'Entrepreneurship & Startups', 'icon' => 'rocket', 'blurb' => 'From idea to first customer and first funding.'],
            ['slug' => 'infrastructure-development', 'label' => 'Infrastructure & Development', 'icon' => 'building-2', 'blurb' => 'Project development, bankability and delivery.'],
            ['slug' => 'ai-innovation-automation', 'label' => 'AI, Innovation & Automation', 'icon' => 'bot', 'blurb' => 'Practical adoption of AI agents and automation with governance in place.'],
            ['slug' => 'leadership-governance', 'label' => 'Leadership & Governance', 'icon' => 'users', 'blurb' => 'Boards, accountability and leadership for transformation.'],
            ['slug' => 'sustainability-esg', 'label' => 'Sustainability & ESG', 'icon' => 'sparkles', 'blurb' => 'Sustainability as a condition of access to capital and markets.'],
            ['slug' => 'markets-economic-trends', 'label' => 'Markets & Economic Trends', 'icon' => 'globe', 'blurb' => 'Trade, corridors and the economic outlook across Africa.'],
        ];
    }

    public static function formats(): array
    {
        return [
            'article' => ['Article', 'Articles', 'file-text'],
            'report' => ['Report or Whitepaper', 'Reports & Whitepapers', 'book-open'],
            'interview' => ['Interview', 'Interviews & Media', 'mic'],
            'podcast' => ['Podcast', 'Podcasts', 'radio'],
            'keynote' => ['Keynote', 'Keynote Speeches', 'presentation'],
            'video' => ['Video', 'Videos', 'video'],
        ];
    }

    /** Every library entry. Entries without a body render as "Article pending from KP". */
    public static function items(): array
    {
        $themes = collect(self::themes())->keyBy('label');
        $items = [];

        foreach (InfoContent::kpInsights() as $i) {
            $items[] = [
                'slug' => $i['slug'],
                'title' => $i['title'],
                'summary' => $i['body'],
                'theme' => $themes[$i['topic']]['slug'] ?? 'business-strategy-growth',
                'format' => $i['format'],
                'featured' => $i['featured'],
                'status' => 'pending',
                'series' => null,
            ];
        }

        foreach (self::themes() as $t) {
            foreach ([1, 2] as $n) {
                $items[] = [
                    'slug' => "pending-{$t['slug']}-{$n}",
                    'title' => "{$t['label']}: article {$n} (title to be confirmed)",
                    'summary' => null,
                    'theme' => $t['slug'],
                    'format' => 'article',
                    'featured' => false,
                    'status' => 'pending',
                    'series' => null,
                ];
            }
        }

        $seriesByTheme = collect(self::series())->flatMap(fn ($s) => collect($s['themes'])->mapWithKeys(fn ($t) => [$t => $s['slug']]));

        return array_map(function ($item) use ($seriesByTheme) {
            $item['series'] ??= $seriesByTheme[$item['theme']] ?? null;
            $item['body'] = $item['body'] ?? [];
            $item['published'] = $item['published'] ?? null;
            $item['read_minutes'] = $item['read_minutes'] ?? null;

            return $item;
        }, $items);
    }

    public static function find(string $slug): ?array
    {
        return collect(self::items())->firstWhere('slug', $slug);
    }

    public static function series(): array
    {
        return [
            ['slug' => 'building-african-enterprises', 'title' => 'Building African Enterprises', 'icon' => 'crown', 'themes' => ['business-strategy-growth', 'entrepreneurship-startups'], 'blurb' => 'A collection on strategy, scale and the operating systems behind growing African businesses.'],
            ['slug' => 'capital-for-african-growth', 'title' => 'Capital for African Growth', 'icon' => 'coins', 'themes' => ['investment-capital-raising', 'infrastructure-development'], 'blurb' => 'A collection on funding readiness, bankable projects and capital mobilisation.'],
            ['slug' => 'leading-the-transformation', 'title' => 'Leading the Transformation', 'icon' => 'mountain', 'themes' => ['leadership-governance', 'sustainability-esg'], 'blurb' => 'A collection on leadership, governance and sustainability.'],
            ['slug' => 'ai-and-the-african-advantage', 'title' => 'AI and the African Advantage', 'icon' => 'lightbulb', 'themes' => ['ai-innovation-automation', 'markets-economic-trends'], 'blurb' => 'A collection on AI adoption, automation and Africa in the global economy.'],
        ];
    }

    public static function engagementTypes(): array
    {
        return [
            ['key' => 'keynote', 'label' => 'Keynote Speech', 'icon' => 'presentation', 'body' => 'Conference, summit and corporate event keynotes.'],
            ['key' => 'panel', 'label' => 'Panel or Fireside Chat', 'icon' => 'users', 'body' => 'Moderated panels and fireside conversations.'],
            ['key' => 'boardroom', 'label' => 'Boardroom Briefing', 'icon' => 'briefcase', 'body' => 'Private briefings for boards and executive teams.'],
            ['key' => 'advisory', 'label' => 'Advisory Session', 'icon' => 'calendar-days', 'body' => 'One-to-one strategy session with Kruger Phiri.'],
            ['key' => 'media', 'label' => 'Media Interview', 'icon' => 'mic', 'body' => 'Print, broadcast and online media interviews.'],
            ['key' => 'podcast', 'label' => 'Podcast Guest', 'icon' => 'radio', 'body' => 'Podcast and webcast guest appearances.'],
        ];
    }

    /** Section map used by the landing page and the KP sub-navigation. */
    public static function sections(): array
    {
        return [
            ['href' => '/kp-thought-leadership', 'label' => 'Overview', 'icon' => 'layout-dashboard', 'body' => 'Start here.'],
            ['href' => '/kp-thought-leadership/articles', 'label' => 'Article Library', 'icon' => 'file-text', 'body' => 'Search and filter every article by theme and format.'],
            ['href' => '/kp-thought-leadership/series', 'label' => 'Series & Collections', 'icon' => 'layers', 'body' => 'Curated collections that read in sequence.'],
            ['href' => '/kp-thought-leadership/about-kruger-phiri', 'label' => 'About Kruger Phiri', 'icon' => 'user', 'body' => 'Verified profile, expertise and qualifications.'],
            ['href' => '/kp-thought-leadership/speaking', 'label' => 'Speaking & Media', 'icon' => 'mic', 'body' => 'Keynotes, panels, interviews and media requests.'],
            ['href' => '/kp-thought-leadership/events', 'label' => 'Events', 'icon' => 'calendar-days', 'body' => 'Upcoming webinars and KP sessions.'],
            ['href' => '/kp-thought-leadership/podcasts', 'label' => 'Podcasts & Videos', 'icon' => 'video', 'body' => 'Listen and watch.'],
            ['href' => '/kp-thought-leadership/downloads', 'label' => 'Reports & Downloads', 'icon' => 'download', 'body' => 'Reports, whitepapers and the media kit.'],
            ['href' => '/kp-thought-leadership/newsletter', 'label' => 'Newsletter', 'icon' => 'mail', 'body' => 'Receive new insight when it publishes.'],
            ['href' => '/kp-thought-leadership/book', 'label' => 'Book KP', 'icon' => 'calendar-check', 'body' => 'Request a keynote, briefing or advisory session.'],
        ];
    }

    public static function themeLabel(string $slug): string
    {
        return collect(self::themes())->firstWhere('slug', $slug)['label'] ?? Str::headline($slug);
    }
}
