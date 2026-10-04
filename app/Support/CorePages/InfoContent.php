<?php

namespace App\Support\CorePages;

/**
 * Content registers for Contact, Webinars, KP Thought Leadership and Diagnostics.
 */
class InfoContent
{
    public static function offices(): array
    {
        return [
            ['title' => 'South Africa – Head Office', 'lines' => ['5th Floor, Blocktrax Building,', 'Blue Gate Road, Lynnwood Ridge,', 'Pretoria, 0081, South Africa'], 'phone' => '+27 12 001 0567'],
            ['title' => 'Malawi – Regional Office', 'lines' => ['Area 18, Plot 473,', 'Lilongwe, Malawi'], 'phone' => '+265 1 770 050'],
            ['title' => 'West Africa – Regional Office', 'lines' => ['Liberia, Accra,', 'Ghana'], 'phone' => '+233 30 276 3400'],
        ];
    }

    public static function serviceAreas(): array
    {
        return [
            'Business & Project Advisory',
            'Investment & Capital Raising',
            'AI Automation & Digital Solutions',
            'Market Research & Intelligence',
            'Due Diligence & Risk Assessment',
            'Training, Workshops & Webinars',
            'Strategic Partnerships',
        ];
    }

    public static function officeHours(): array
    {
        return [
            ['day' => 'Monday - Thursday', 'hours' => '08:00 - 17:00'],
            ['day' => 'Friday', 'hours' => '08:00 - 16:00'],
            ['day' => 'Saturday', 'hours' => 'By Appointment'],
            ['day' => 'Sunday', 'hours' => 'Closed'],
        ];
    }

    public static function webinarCategories(): array
    {
        return [
            ['key' => 'all', 'label' => 'All Webinars', 'icon' => 'play'],
            ['key' => 'strategy', 'label' => 'Business Strategy', 'icon' => 'target'],
            ['key' => 'investment', 'label' => 'Investment & Finance', 'icon' => 'bar-chart-3'],
            ['key' => 'leadership', 'label' => 'Leadership & Governance', 'icon' => 'users'],
            ['key' => 'ai', 'label' => 'AI, Innovation & Automation', 'icon' => 'bot'],
            ['key' => 'infrastructure', 'label' => 'Infrastructure & Development', 'icon' => 'building-2'],
            ['key' => 'economy', 'label' => 'Markets & Economics', 'icon' => 'globe'],
            ['key' => 'sustainability', 'label' => 'Sustainability & ESG', 'icon' => 'sparkles'],
            ['key' => 'startups', 'label' => 'Startups & Entrepreneurship', 'icon' => 'rocket'],
        ];
    }

    public static function webinars(): array
    {
        return [
            ['slug' => 'africas-business-opportunity-2026', 'category' => 'strategy', 'tag' => 'Strategy', 'title' => "Africa's Business Opportunity in 2026", 'speaker' => 'Kruger Phiri', 'date' => '2026-04-16', 'duration' => '56:12', 'topic' => 'Growth', 'icon' => 'target'],
            ['slug' => 'raising-capital-high-impact-projects', 'category' => 'investment', 'tag' => 'Investment', 'title' => 'Raising Capital for High-Impact Projects', 'speaker' => 'Mpho Dlamini', 'date' => '2026-04-02', 'duration' => '48:33', 'topic' => 'Funding', 'icon' => 'coins'],
            ['slug' => 'building-high-performance-teams', 'category' => 'leadership', 'tag' => 'Leadership', 'title' => 'Building High-Performance Teams for Growth', 'speaker' => 'Kruger Phiri', 'date' => '2026-03-19', 'duration' => '45:10', 'topic' => 'People', 'icon' => 'users'],
            ['slug' => 'ai-agents-automation-future-of-work', 'category' => 'ai', 'tag' => 'AI & Automation', 'title' => 'AI, Agents & Automation: The Future of Work', 'speaker' => 'Thandiwe Maseko', 'date' => '2026-03-05', 'duration' => '52:05', 'topic' => 'Technology', 'icon' => 'bot'],
            ['slug' => 'africas-economic-outlook-market-trends', 'category' => 'economy', 'tag' => 'Economy', 'title' => "Africa's Economic Outlook & Market Trends", 'speaker' => 'Dr. Sipho Mthembu', 'date' => '2026-02-20', 'duration' => '39:44', 'topic' => 'Markets', 'icon' => 'globe'],
            ['slug' => 'sustainability-competitive-advantage', 'category' => 'sustainability', 'tag' => 'Sustainability', 'title' => 'Sustainability as a Competitive Advantage', 'speaker' => 'Lerato Khumalo', 'date' => '2026-02-06', 'duration' => '42:18', 'topic' => 'ESG', 'icon' => 'sparkles'],
            ['slug' => 'infrastructure-pipelines-africa', 'category' => 'infrastructure', 'tag' => 'Infrastructure', 'title' => 'Bankable Infrastructure Pipelines in Southern Africa', 'speaker' => 'Kruger Phiri', 'date' => '2026-01-22', 'duration' => '50:41', 'topic' => 'Funding', 'icon' => 'building-2'],
            ['slug' => 'from-idea-to-first-customer', 'category' => 'startups', 'tag' => 'Startups', 'title' => 'From Idea to First Customer: A Founder Playbook', 'speaker' => 'Mpho Dlamini', 'date' => '2026-01-08', 'duration' => '37:26', 'topic' => 'Growth', 'icon' => 'rocket'],
        ];
    }

    public static function upcomingWebinar(): array
    {
        return [
            'slug' => 'ai-automation-africas-advantage',
            'title' => "AI, Automation & Africa's Advantage",
            'date' => '2026-05-24',
            'time' => '14:00 SAST',
            'speaker' => 'Kruger Phiri',
            'channel' => 'Live on Zoom',
        ];
    }

    public static function kpNumbers(): array
    {
        return [
            ['value' => '20+', 'label' => 'Years of Experience', 'icon' => 'badge-check'],
            ['value' => '1,000+', 'label' => 'Projects Advised', 'icon' => 'globe'],
            ['value' => '54', 'label' => 'Countries Engaged', 'icon' => 'map'],
            ['value' => '10,000+', 'label' => 'Entrepreneurs Empowered', 'icon' => 'users'],
            ['value' => 'Countless', 'label' => 'Lives Impacted', 'icon' => 'heart-pulse'],
        ];
    }

    public static function kpFormats(): array
    {
        return [
            ['key' => 'featured', 'label' => 'Featured Insights'],
            ['key' => 'article', 'label' => 'Articles'],
            ['key' => 'interview', 'label' => 'Interviews & Media'],
            ['key' => 'podcast', 'label' => 'Podcasts'],
            ['key' => 'keynote', 'label' => 'Keynote Speeches'],
            ['key' => 'video', 'label' => 'Videos'],
            ['key' => 'report', 'label' => 'Reports & Whitepapers'],
        ];
    }

    public static function kpTopics(): array
    {
        return [
            'Business Strategy & Growth',
            'Investment & Capital Raising',
            'Entrepreneurship & Startups',
            'Infrastructure & Development',
            'AI, Innovation & Automation',
            'Leadership & Governance',
            'Sustainability & ESG',
            'Markets & Economic Trends',
        ];
    }

    public static function kpInsights(): array
    {
        return [
            ['slug' => 'future-of-african-enterprises', 'tag' => 'Strategy', 'format' => 'article', 'featured' => true, 'topic' => 'Business Strategy & Growth', 'icon' => 'crown', 'title' => 'The Future of African Enterprises', 'body' => 'Building competitive, resilient and globally relevant African businesses for tomorrow.'],
            ['slug' => 'unlocking-capital-african-growth', 'tag' => 'Investment', 'format' => 'report', 'featured' => true, 'topic' => 'Investment & Capital Raising', 'icon' => 'coins', 'title' => 'Unlocking Capital for African Growth', 'body' => 'Innovative financing strategies that activate capital and accelerate sustainable development.'],
            ['slug' => 'leading-africas-next-transformation', 'tag' => 'Leadership', 'format' => 'keynote', 'featured' => true, 'topic' => 'Leadership & Governance', 'icon' => 'mountain', 'title' => "Leading Africa's Next Transformation", 'body' => 'Vision, courage and execution—the leadership qualities Africa needs now.'],
            ['slug' => 'ai-automation-african-advantage', 'tag' => 'Innovation', 'format' => 'podcast', 'featured' => true, 'topic' => 'AI, Innovation & Automation', 'icon' => 'lightbulb', 'title' => 'AI, Automation & The African Advantage', 'body' => 'How AI, automation and human ingenuity can leapfrog Africa into global leadership.'],
            ['slug' => 'africas-economic-renaissance', 'tag' => 'Economy', 'format' => 'video', 'featured' => true, 'topic' => 'Markets & Economic Trends', 'icon' => 'globe', 'title' => "Africa's Economic Renaissance", 'body' => 'Harnessing opportunities in trade, infrastructure, resources and the digital economy.'],
            ['slug' => 'founders-funding-readiness', 'tag' => 'Startups', 'format' => 'interview', 'featured' => false, 'topic' => 'Entrepreneurship & Startups', 'icon' => 'rocket', 'title' => 'What Funders Look for in African Founders', 'body' => 'KP on investor readiness, governance and the evidence that unlocks first funding.'],
            ['slug' => 'infrastructure-bankability', 'tag' => 'Infrastructure', 'format' => 'article', 'featured' => false, 'topic' => 'Infrastructure & Development', 'icon' => 'building-2', 'title' => 'Making African Infrastructure Bankable', 'body' => 'From concept note to financial close: the disciplines that move projects forward.'],
            ['slug' => 'esg-as-strategy', 'tag' => 'Sustainability', 'format' => 'report', 'featured' => false, 'topic' => 'Sustainability & ESG', 'icon' => 'sparkles', 'title' => 'ESG as Strategy, Not Compliance', 'body' => 'Why sustainability is becoming the cost of entry to global capital and supply chains.'],
        ];
    }

    public static function diagnosticCategories(): array
    {
        return [
            ['key' => 'business-health', 'title' => 'Business Health', 'icon' => 'heart-pulse', 'body' => 'Overall business performance and operational efficiency assessment.'],
            ['key' => 'financial-health', 'title' => 'Financial Health', 'icon' => 'bar-chart-3', 'body' => 'Liquidity, profitability, solvency and cash flow diagnostics.'],
            ['key' => 'operations', 'title' => 'Operations', 'icon' => 'settings', 'body' => 'Process efficiency, productivity and operational excellence review.'],
            ['key' => 'market-growth', 'title' => 'Market & Growth', 'icon' => 'trending-up', 'body' => 'Market position, growth potential and competitive advantage analysis.'],
            ['key' => 'risk-compliance', 'title' => 'Risk & Compliance', 'icon' => 'shield-check', 'body' => 'Risk exposure, compliance maturity and governance assessment.'],
            ['key' => 'people-culture', 'title' => 'People & Culture', 'icon' => 'users', 'body' => 'Organisational culture, talent health and leadership effectiveness.'],
            ['key' => 'technology', 'title' => 'Technology Maturity', 'icon' => 'cpu', 'body' => 'Digital readiness, technology infrastructure and innovation capability.'],
        ];
    }

    public static function diagnosticPacks(): array
    {
        return [
            ['code' => 'DX-BHC', 'title' => 'Business Health Check', 'icon' => 'heart-pulse', 'zar' => 1950, 'categories' => ['business-health'], 'body' => 'Quick overview of overall business health.', 'features' => ['15 Min Assessment', 'Health Score', 'Key Insights', 'PDF Report']],
            ['code' => 'DX-CBD', 'title' => 'Comprehensive Business Diagnostic', 'icon' => 'badge-check', 'zar' => 6950, 'categories' => ['business-health', 'risk-compliance', 'people-culture', 'technology'], 'body' => 'Deep dive into all critical business areas.', 'features' => ['45 Min Assessment', 'Detailed Analysis', 'Benchmarking', 'Action Plan']],
            ['code' => 'DX-FDD', 'title' => 'Financial Deep Dive', 'icon' => 'coins', 'zar' => 4950, 'categories' => ['financial-health'], 'body' => 'Detailed financial performance and risk analysis.', 'features' => ['Financial Ratios', 'Cash Flow Analysis', 'Risk Assessment', 'Recommendations']],
            ['code' => 'DX-OER', 'title' => 'Operations Efficiency Review', 'icon' => 'settings', 'zar' => 3450, 'categories' => ['operations', 'technology'], 'body' => 'Identify operational gaps and improvement opportunities.', 'features' => ['Process Mapping', 'Efficiency Score', 'Bottleneck Analysis', 'Improvement Plan']],
            ['code' => 'DX-MPA', 'title' => 'Market Position Analysis', 'icon' => 'target', 'zar' => 3950, 'categories' => ['market-growth'], 'body' => 'Understand your market position and opportunities.', 'features' => ['Market Analysis', 'Competitor Review', 'Growth Opportunities', 'Strategic Insights']],
            ['code' => 'DX-CUS', 'title' => 'Custom Diagnostic', 'icon' => 'wrench', 'zar' => 4950, 'from' => true, 'custom' => true, 'categories' => ['business-health', 'financial-health', 'operations', 'market-growth', 'risk-compliance', 'people-culture', 'technology'], 'body' => 'Tailored diagnostic for your specific business needs.', 'features' => ['Custom Assessment', 'Expert Consultation', 'Tailored Report', 'Priority Support']],
        ];
    }
}
