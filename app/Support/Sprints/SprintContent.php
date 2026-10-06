<?php

namespace App\Support\Sprints;

use Illuminate\Support\Str;

/**
 * Builds complete, data-driven sprint records for the generic sprint template.
 *
 * A short spec (title, category, price, delivery ...) is expanded into packages,
 * deliverables, process, inputs, add-ons, risk review, FAQs and reviews. Any key
 * supplied in $spec['attributes'] overrides the generated default, so flagship
 * sprints can carry their exact mockup content.
 */
class SprintContent
{
    /**
     * @param  array<string, mixed>  $spec
     * @return array<string, mixed> row for the sprints table (without code)
     */
    public static function build(array $spec): array
    {
        $title = $spec['title'];
        $topic = self::topic($title);
        $act = $spec['act'] ?? 'purchase';
        $price = $spec['price'] ?? null;
        $delivery = $spec['delivery'] ?? null;

        $packages = $spec['packages'] ?? ($act === 'quote' || $price === null ? null : self::packages($title, $price, $delivery, $spec['package_style'] ?? 'tiered', $act));
        // Every sprint sells exactly Basic / Standard / Premium.
        $mapped = Packages::map($packages, ['price' => $price, 'delivery' => $delivery, 'act' => $act, 'title' => $title]);
        $packages = $mapped['packages'];
        $priced = array_filter(array_column($packages, 'zar'), fn ($z) => $z !== null);
        $why = $spec['why'] ?? self::defaultWhy($topic);
        $overrides = Packages::remapAttributes(Packages::relabel($spec['attributes'] ?? [], $mapped['names']), $mapped['renames'], $packages);

        $attributes = array_merge([
            'icon' => $spec['icon'] ?? (Taxonomy::categories()[$spec['category']]['icon'] ?? 'briefcase'),
            'badge' => $spec['badge'] ?? null,
            'reviews' => $spec['reviews'] ?? 24,
            'ideal_for' => $spec['ideal_for'] ?? ['SMEs', 'Founders'],
            'needs' => $spec['needs'] ?? [],
            'keywords' => $spec['keywords'] ?? [],
            'price_display' => $spec['price_display'] ?? null,
            'marketplace' => $spec['marketplace'] ?? false,
            'partner_delivered' => $spec['partner_delivered'] ?? false,
            'spotlight' => $spec['spotlight'] ?? false,
            'billing_period' => in_array($act, ['subscription', 'retainer'], true) ? 'month' : null,
            'format' => $spec['format'] ?? 'Digital (PDF + editable source files)',
            'why' => $why,
            'outcomes' => $why,
            'included_intro' => "Our {$title} includes a structured set of expert-led workstreams designed to deliver practical, decision-ready outputs.",
            'included' => self::included($topic, $why),
            'scope' => [
                ['title' => 'Discovery', 'items' => ['Kick-off and objectives', 'Current-state review', 'Stakeholder input']],
                ['title' => 'Analysis', 'items' => ["{$topic} analysis", 'Benchmarking and insights', 'Options and recommendations']],
                ['title' => 'Build', 'items' => ["{$topic} deliverables", 'Supporting models and evidence', 'Quality review']],
                ['title' => 'Delivery Outputs', 'items' => ['Executive summary', 'Implementation roadmap', 'Handover via Client Portal']],
            ],
            'final_deliverables' => ["{$topic} report or pack", 'Editable source files where applicable', 'Structured recommendations', 'Human-reviewed final outputs'],
            'deliverables' => [
                ['title' => "{$topic} Pack", 'body' => 'The core output, structured and ready to use.', 'icon' => 'file-text'],
                ['title' => 'Executive Summary', 'body' => 'A concise overview for decision-makers.', 'icon' => 'clipboard-list'],
                ['title' => 'Analysis & Insights', 'body' => 'Evidence, benchmarks and key findings.', 'icon' => 'bar-chart-3'],
                ['title' => 'Recommendations', 'body' => 'Prioritised actions with clear owners.', 'icon' => 'target'],
                ['title' => 'Implementation Roadmap', 'body' => 'An actionable plan to execute and scale.', 'icon' => 'map'],
                ['title' => 'Portal Handover', 'body' => 'Secure delivery through the Client Portal.', 'icon' => 'folder-lock'],
            ],
            'delivery_pack' => ["{$topic} document", 'Presentation-ready executive summary', 'Editable source files where applicable', 'Structured recommendations', 'Review-ready supporting content', 'Delivery through secure Client Portal'],
            'deliverable_groups' => [
                ['title' => 'Core Documents', 'icon' => 'file-text', 'items' => ["Full {$topic} document", 'Executive summary', 'Context and objectives', 'Key findings narrative']],
                ['title' => 'Research & Analysis', 'icon' => 'search', 'items' => ['Market and context research', 'Benchmarking', 'Gap and opportunity analysis', 'Risk scan']],
                ['title' => 'Supporting Outputs', 'icon' => 'bar-chart-3', 'items' => ['Supporting tables and models', 'Assumptions register', 'Evidence references', 'Data sources']],
                ['title' => 'Strategy & Execution', 'icon' => 'target', 'items' => ['Recommendations', 'Implementation roadmap', 'Owners and milestones', 'Next-step options']],
            ],
            'delivery_standards' => self::deliveryStandards(),
            'comparison' => $packages && count($packages) === 3 ? [
                ['label' => "Core {$topic} output", 'values' => ['Standard', 'Comprehensive', 'Executive-grade']],
                ['label' => 'Analysis depth', 'values' => ['Essential', 'Detailed', 'In-depth with scenarios']],
                ['label' => 'Implementation roadmap', 'values' => ['High-level roadmap', 'Detailed roadmap', 'Detailed roadmap with milestones']],
                ['label' => 'Revision rounds', 'values' => ['1 round', '2 rounds', '3 rounds']],
                ['label' => 'Expert sessions', 'values' => ['Not included', '1 session', '2 sessions']],
                ['label' => 'Executive refinement', 'values' => ['Standard review', 'Enhanced review', 'Executive-level refinement']],
            ] : null,
            'timeline' => self::timeline(),
            'process' => self::process($topic),
            'inputs' => self::inputs($topic),
            'addons' => self::addons($topic),
            'risks' => self::risks(),
            'qa' => self::qa(),
            'terms' => null, // derived from the selected package in the template
            'faqs' => self::faqs($title, $topic, $packages, $delivery),
            'reviews_data' => self::reviews($title, $spec['rating'] ?? 4.6, $spec['reviews'] ?? 24, $packages),
            'package_guidance' => $packages && count($packages) === 3 ? [
                $packages[0]['key'] => 'Perfect for teams that need a solid, essential output to get started.',
                $packages[1]['key'] => 'Best for growing organisations that need depth, analysis and expert input.',
                $packages[2]['key'] => 'Ideal for complex, high-stakes or investor-facing requirements.',
            ] : null,
            'why_tbca' => [
                ['title' => 'Pan-African Expertise', 'icon' => 'globe'],
                ['title' => 'Data-Driven Approach', 'icon' => 'bar-chart-3'],
                ['title' => 'Bankable Deliverables', 'icon' => 'badge-check'],
                ['title' => 'Proven Track Record', 'icon' => 'trending-up'],
            ],
            'brief' => null,
        ], $overrides);

        return [
            'slug' => $spec['slug'] ?? Str::slug($title),
            'title' => $title,
            'type' => $spec['type'] ?? 'core-service',
            'category' => $spec['category'],
            'subcategory' => $spec['subcategory'] ?? null,
            'audience' => $spec['audience'] ?? 'smes,founders',
            'summary' => $spec['summary'],
            'description' => $spec['description'] ?? "Our {$title} is a fixed-scope, expert-led engagement. {$spec['summary']} Every output is human-reviewed by TBCA experts and delivered securely through the Client Portal.",
            'price_zar' => $act === 'quote' ? null : ($priced ? min($priced) : $price),
            'delivery' => $delivery,
            'commercial_act' => $act,
            'packages' => $packages,
            'attributes' => array_filter($attributes, fn ($v) => $v !== null),
            'featured' => $spec['featured'] ?? false,
            'popular' => $spec['popular'] ?? false,
            'is_new' => $spec['new'] ?? false,
            'rating' => $spec['rating'] ?? 4.6,
            'status' => 'published',
        ];
    }

    /** "Business Plan Development Sprint" -> "Business Plan Development". */
    public static function topic(string $title): string
    {
        return trim(preg_replace('/\s+(Sprint|Toolkit|Diagnostic|Subscription|Retainer)$/i', '', $title));
    }

    /** @return list<array<string, mixed>> */
    public static function packages(string $title, int $price, ?string $delivery, string $style, string $act): array
    {
        $days = Catalogue::deliveryDays($delivery);
        preg_match_all('/\d+/', (string) $delivery, $m);
        $min = $m[0] ? (int) min($m[0]) : null;
        $max = $days;
        $mid = $min !== null && $max !== null ? (int) round(($min + $max) / 2) : null;
        $label = fn (?int $d) => $d === null ? 'Confirmed after scope' : ($d <= 1 ? 'Instant access' : "{$d} days delivery");
        $topic = self::topic($title);
        $round = fn (float $v) => (int) (round($v / 100) * 100);

        if ($style === 'single') {
            return [['key' => 'standard', 'name' => 'Standard', 'zar' => $price, 'delivery' => $label($max), 'description' => "Complete {$topic} with licence and support.", 'features' => ['Instant secure download', 'Single-organisation licence', 'Free version updates for 12 months', 'Email support'], 'popular' => true]];
        }

        if (in_array($act, ['subscription', 'retainer'], true)) {
            return [
                ['key' => 'essential', 'name' => 'Essential', 'zar' => $price, 'delivery' => 'Monthly', 'description' => 'Core monthly support for smaller teams.', 'features' => ['Monthly review session', 'Email support', 'Monthly summary report']],
                ['key' => 'growth', 'name' => 'Growth', 'zar' => $round($price * 1.8), 'delivery' => 'Monthly', 'description' => 'Hands-on monthly support with priority access.', 'features' => ['Fortnightly sessions', 'Priority WhatsApp support', 'Monthly dashboard and report', 'Quarterly strategy review'], 'popular' => true],
                ['key' => 'executive', 'name' => 'Executive', 'zar' => $round($price * 3), 'delivery' => 'Monthly', 'description' => 'Dedicated senior advisory for leadership teams.', 'features' => ['Weekly sessions', 'Dedicated senior advisor', 'Board-ready reporting', 'Unlimited email and WhatsApp support']],
            ];
        }

        return [
            ['key' => 'starter', 'name' => 'Starter', 'zar' => $price, 'delivery' => $label($min ?? $max), 'description' => "Essential {$topic} for early-stage needs.", 'features' => ["Core {$topic} output", 'Essential analysis', 'High-level roadmap', '1 round of revisions']],
            ['key' => 'growth', 'name' => 'Growth', 'zar' => $round($price * 1.93), 'delivery' => $label($mid ?? $max), 'description' => "Comprehensive {$topic} with deeper analysis and strategy.", 'features' => ["Comprehensive {$topic} output", 'Detailed analysis and insights', 'Detailed implementation roadmap', '1 expert session', '2 rounds of revisions'], 'popular' => true],
            ['key' => 'executive', 'name' => 'Executive', 'zar' => $round($price * 3.27), 'delivery' => $label($max), 'description' => "Executive-grade {$topic} with deep analysis and expert insight.", 'features' => ["Executive-grade {$topic} output", 'In-depth analysis with scenarios', 'Roadmap with milestones and owners', '2 expert sessions', '3 rounds of revisions', 'Executive-level refinement']],
        ];
    }

    public static function defaultWhy(string $topic): array
    {
        return ["Clear, structured {$topic} output", 'Practical, evidence-based recommendations', 'Human-reviewed by TBCA experts', 'Actionable implementation roadmap'];
    }

    public static function included(string $topic, array $why): array
    {
        $icons = ['search', 'target', 'bar-chart-3', 'trending-up', 'shield-check', 'file-text', 'layers', 'map'];
        $items = array_merge(["{$topic} Analysis", 'Context & Market Review', 'Options & Recommendations', 'Risk & Mitigation', 'Implementation Roadmap'], []);

        return collect($items)->values()->map(fn ($t, $i) => ['title' => $t, 'icon' => $icons[$i % count($icons)]])->all();
    }

    public static function deliveryStandards(): array
    {
        return [
            ['title' => 'Human Reviewed', 'body' => 'By TBCA experts', 'icon' => 'user-check'],
            ['title' => 'Professionally Structured', 'body' => 'Investor-grade quality', 'icon' => 'badge-check'],
            ['title' => 'Editable Formats', 'body' => 'Word, Excel, PPT', 'icon' => 'file-text'],
            ['title' => 'Portal Delivery', 'body' => 'Through secure Client Portal', 'icon' => 'layout-dashboard'],
            ['title' => 'Secure Handover', 'body' => 'Confidential & encrypted', 'icon' => 'lock'],
        ];
    }

    public static function timeline(): array
    {
        return [
            ['title' => 'Draft', 'body' => 'Draft prepared by TBCA experts', 'duration' => '2–4 days'],
            ['title' => 'Feedback', 'body' => 'You provide feedback and review notes', 'duration' => '1–2 days'],
            ['title' => 'Review', 'body' => 'Expert review of your feedback', 'duration' => '1–2 days'],
            ['title' => 'Refinement', 'body' => 'We enhance based on your input', 'duration' => '1–3 days'],
            ['title' => 'Final', 'body' => 'Final assets compiled and quality-assured', 'duration' => '1 day'],
            ['title' => 'Client Portal', 'body' => 'Delivered securely via Client Portal', 'duration' => 'Immediate'],
        ];
    }

    public static function process(string $topic): array
    {
        return [
            ['title' => 'Discovery & Briefing', 'icon' => 'search', 'items' => ['Kick-off call to understand your goals', 'Complete our structured intake questionnaire', 'Share existing documents and data', 'Confirm scope, timeline and package'], 'output' => 'Project plan and data request list'],
            ['title' => 'Research & Analysis', 'icon' => 'bar-chart-3', 'items' => ['Market and context research', 'Benchmarking and comparison', 'Stakeholder and data review', 'Risk and environment scan'], 'output' => 'Research & analysis notes'],
            ['title' => 'Build & Develop', 'icon' => 'target', 'items' => ["Develop the {$topic} outputs", 'Options and recommendations', 'Supporting models and evidence', 'Scenario testing where relevant'], 'output' => 'Draft outputs'],
            ['title' => 'Draft & Review', 'icon' => 'clipboard-check', 'items' => ['Compile the full draft', 'Internal expert review', 'Your review & feedback', 'Quality assurance check'], 'output' => 'Draft for approval'],
            ['title' => 'Final Delivery & Handover', 'icon' => 'download', 'items' => ['Finalise and format outputs', 'Executive summary pack', 'Handover via Client Portal', 'Post-delivery support included'], 'output' => "Final {$topic} pack"],
        ];
    }

    public static function inputs(string $topic): array
    {
        return [
            ['title' => 'Organisation Information', 'icon' => 'building', 'items' => ['Organisation overview and background', 'Structure and ownership', 'Products, services or programmes', 'Registration documents', 'Logo and brand guidelines (if available)']],
            ['title' => 'Context & Market Information', 'icon' => 'globe', 'items' => ['Target market or beneficiaries', 'Competitors or comparable organisations', 'Key challenges and opportunities', 'Any existing research or reports']],
            ['title' => 'Financial & Performance Information', 'icon' => 'bar-chart-3', 'items' => ['Recent financial statements (if available)', 'Current year management accounts', 'Key performance indicators', 'Budgets, targets or projections']],
            ['title' => 'Objectives & Constraints', 'icon' => 'target', 'items' => ["What you want the {$topic} to achieve", 'Decision-makers and audience', 'Deadlines and constraints', 'Known risks or sensitivities']],
        ];
    }

    public static function addons(string $topic): array
    {
        return [
            ['key' => 'executive-summary', 'name' => 'Executive Summary (1-Pager)', 'zar' => 2500, 'body' => 'Compelling one-page summary for quick stakeholder review.', 'icon' => 'file-text'],
            ['key' => 'presentation-pack', 'name' => 'Presentation Pack', 'zar' => 3500, 'body' => "Board- or investor-ready slides summarising the {$topic}.", 'icon' => 'layout-template', 'tag' => 'Most Popular'],
            ['key' => 'expert-workshop', 'name' => 'Expert Workshop (2 hours)', 'zar' => 4000, 'body' => 'Facilitated working session with a senior TBCA consultant.', 'icon' => 'users'],
            ['key' => 'extra-revision', 'name' => 'Additional Revision Round', 'zar' => 1500, 'body' => 'One further round of revisions after final delivery.', 'icon' => 'history'],
            ['key' => 'priority-delivery', 'name' => 'Priority Delivery', 'zar' => 2000, 'body' => 'Move your Sprint to the front of the delivery queue.', 'icon' => 'zap'],
            ['key' => 'afrikaans-version', 'name' => 'Afrikaans Version', 'zar' => 1800, 'body' => 'Professionally translated Afrikaans copy of the main output.', 'icon' => 'languages', 'tag' => 'New'],
        ];
    }

    public static function risks(): array
    {
        return [
            ['risk' => 'Incomplete or delayed inputs', 'impact' => 'High', 'mitigation' => 'Clear input checklist, reminders & client support'],
            ['risk' => 'Market data limitations', 'impact' => 'Medium', 'mitigation' => 'Use of reputable sources & industry benchmarks'],
            ['risk' => 'Scope changes', 'impact' => 'Medium', 'mitigation' => 'Change control process & timeline alignment'],
            ['risk' => 'Confidentiality breach', 'impact' => 'Low', 'mitigation' => 'Strict NDAs, secure systems & access controls'],
            ['risk' => 'Technical or file issues', 'impact' => 'Low', 'mitigation' => 'QA checks, backups & delivery validation'],
        ];
    }

    public static function qa(): array
    {
        return [
            ['title' => 'Research & Data Validation', 'body' => 'All data is cross-checked for accuracy and relevance.', 'icon' => 'search'],
            ['title' => 'Content Review', 'body' => 'Expert review for clarity, logic and decision-readiness.', 'icon' => 'file-text'],
            ['title' => 'Design & Presentation QA', 'body' => 'Formatting, visuals and flow checked for impact.', 'icon' => 'layout-template'],
            ['title' => 'Final Approval', 'body' => 'Senior consultant sign-off before delivery.', 'icon' => 'shield-check'],
        ];
    }

    public static function faqs(string $title, string $topic, ?array $packages, ?string $delivery): array
    {
        $pkgNames = $packages ? implode(', ', array_column($packages, 'name')) : 'a scoped quote';
        $timeline = $packages
            ? implode(', ', array_map(fn ($p) => "{$p['name']} (".($p['delivery'] ?? $delivery).')', $packages))
            : 'the timeline confirmed in your quote';

        return [
            ['group' => 'General Questions', 'q' => "What is included in the {$title}?", 'a' => "The {$title} includes the core {$topic} output, an executive summary, supporting analysis, recommendations and an implementation roadmap. See the Deliverables tab for the full list."],
            ['group' => 'General Questions', 'q' => 'Who is this Sprint best suited for?', 'a' => 'It suits founders, SMEs, corporates, institutions and programme teams that need a structured, expert-led output in a fixed time and at a fixed price.'],
            ['group' => 'General Questions', 'q' => 'Will TBCA customise the work to my industry?', 'a' => 'Yes. Every Sprint starts with a discovery call and intake questionnaire so the outputs reflect your sector, market and objectives.'],
            ['group' => 'General Questions', 'q' => 'Is my information kept confidential?', 'a' => 'Yes. Your information is protected under NDA, stored in the secure Client Portal and used only to deliver your Sprint.'],
            ['group' => 'Scope & Deliverables', 'q' => 'What is the difference between the packages?', 'a' => "Packages ({$pkgNames}) differ in depth of analysis, number of revision rounds, expert sessions and executive refinement. Compare them on the Packages tab."],
            ['group' => 'Scope & Deliverables', 'q' => 'Can I add extra deliverables?', 'a' => 'Yes. Choose add-ons on the Add-ons tab or request a custom add-on and we will quote it.'],
            ['group' => 'Timeline & Process', 'q' => 'How long does delivery take?', 'a' => "Delivery timelines depend on the package: {$timeline}. Timelines start once we receive your brief and inputs."],
            ['group' => 'Timeline & Process', 'q' => 'How will I receive the final outputs?', 'a' => 'All outputs are delivered through your secure Client Portal, with editable source files where applicable.'],
            ['group' => 'Client Inputs', 'q' => 'What information do I need to provide?', 'a' => 'See the Inputs Required tab. The more complete your inputs, the stronger the result. We send a checklist after you order.'],
            ['group' => 'Revisions & Delivery', 'q' => 'How many revisions are included?', 'a' => 'Revision rounds depend on the package and are listed in the package comparison. Additional rounds are available as an add-on.'],
        ];
    }

    public static function reviews(string $title, float $rating, int $count, ?array $packages): array
    {
        $count = max($count, 6);
        $five = (int) round($count * max(0.5, min(0.9, ($rating - 3.8) / 1.25)));
        $four = (int) round(($count - $five) * 0.75);
        $three = max(0, $count - $five - $four - 2);
        $pk = $packages ? array_column($packages, 'name') : ['Standard'];
        $p = fn (int $i) => $pk[$i % count($pk)];

        return [
            'average' => $rating,
            'count' => $count,
            'distribution' => [5 => $five, 4 => $four, 3 => $three, 2 => min(1, $count - $five - $four - $three), 1 => max(0, $count - $five - $four - $three - 1)],
            'highlights' => ['Pan-African insight', 'Decision-ready output', 'Strong analysis', 'Excellent communication', 'Human-reviewed quality'],
            'items' => [
                ['name' => 'Amahle D.', 'role' => 'Founder, AgriTech (SA)', 'segment' => 'Startups', 'package' => $p(1), 'rating' => 5, 'title' => 'Clear, practical and professionally structured', 'body' => "The {$title} gave us exactly what we needed. The logic and presentation quality were excellent.", 'date' => 'May 2024'],
                ['name' => 'Kwame A.', 'role' => 'CEO, Logistics (Ghana)', 'segment' => 'SMEs', 'package' => $p(2), 'rating' => 5, 'title' => 'High-quality, expert work', 'body' => 'The insights exceeded our expectations. The team understood our context and packaged it convincingly.', 'date' => 'April 2024'],
                ['name' => 'Nneka O.', 'role' => 'Co-founder, HealthTech (Nigeria)', 'segment' => 'Startups', 'package' => $p(1), 'rating' => 5, 'title' => 'Insightful and highly practical', 'body' => 'Professional, insightful and truly Pan-African. We could use the output immediately.', 'date' => 'April 2024'],
                ['name' => 'Kabelo M.', 'role' => 'SME Owner, Manufacturing (SA)', 'segment' => 'SMEs', 'package' => $p(0), 'rating' => 4, 'title' => 'Thorough and responsive', 'body' => 'The team communicated well and refined the draft quickly. Very good commercial thinking.', 'date' => 'February 2024'],
                ['name' => 'Fatou B.', 'role' => 'Programme Lead, Social Enterprise (Senegal)', 'segment' => 'NGOs', 'package' => $p(2), 'rating' => 5, 'title' => 'Excellent for development-focused work', 'body' => 'The final output balanced strategy, impact and financial viability.', 'date' => 'January 2024'],
            ],
        ];
    }
}
