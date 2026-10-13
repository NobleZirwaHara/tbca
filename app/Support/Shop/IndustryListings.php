<?php

namespace App\Support\Shop;

use App\Models\Sprint;
use App\Support\Insights\IndustryRegister;
use App\Support\Sprints\Register;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Once;
use Illuminate\Support\Str;

/**
 * Cross-listing of Sprints in the industry aisles of the Online Shop.
 *
 * The client's register is organised by service, so every Sprint's home aisle (sprints.shop_aisle)
 * is a service aisle and the six industry aisles plus Risk & Cybersecurity were empty. A Sprint
 * keeps its home aisle and can also be listed in these aisles (table shop_aisle_listings). The
 * rules are deterministic, so a rebuild on the same data always gives the same placements.
 *
 * 1. Named. The Sprint names the industry: a whole-word keyword (or a phrase, or a stem ending in
 *    "*") in its title, summary, description, or the register's problem, promise, deliverable or
 *    subcategory. Before matching, text is lower-cased and reduced to letters, digits and single
 *    spaces; the register's category names are removed (a title such as "Portal Scoping Sprint -
 *    Technology, Digital Transformation, Cybersecurity and Cloud" does not name cybersecurity);
 *    and the exclusion phrases for that aisle are removed ("power bi", "data mining", "business
 *    health", "lodge a" and so on). Every named match is listed, without a cap.
 * 2. Relevant. A general Sprint every sector buys (feasibility, bankable plans, funding and
 *    investment readiness, project finance and PPP, ESG and impact, licensing and permits, market
 *    entry, export, value and supply chain, financial models, due diligence), plus the aisle's own
 *    signals (for example lean and quality for manufacturing). Only the base title counts (the
 *    audience a register variant adds after a dash is ignored), and audience words that open many
 *    summaries ("Project sponsors require...", "Enterprise suppliers require...") are not keywords. Score: register subcategory in the
 *    aisle's list 4, in the shared list 3; aisle keyword in the title 3, elsewhere 2; shared keyword
 *    in the title 2, elsewhere 1; the Industries module's Sprint category for that industry 1;
 *    featured 1. A Sprint needs a score of 3 or more. Each aisle takes the top RELEVANT_CAP by
 *    score, then rating, then title, with at most RELEVANT_PER_SUBCATEGORY from one subcategory.
 * 3. Manual. database/seeders/Sections/data/shop/aisle-overrides.csv (code, aisle, action, note)
 *    is applied last: "add" lists the Sprint in the aisle, "remove" takes it out whatever the rule.
 *
 * Aisle order: manual and named placements first (by title), then relevant ones by score.
 */
class IndustryListings
{
    public const TABLE = 'shop_aisle_listings';

    public const OVERRIDES = 'database/seeders/Sections/data/shop/aisle-overrides.csv';

    /** Source of rule rows and of manual rows that come from the overrides file. */
    public const SOURCE_RULES = 'rules-v1';

    public const SOURCE_FILE = 'aisle-overrides.csv';

    public const RELEVANT_CAP = 150;

    public const RELEVANT_PER_SUBCATEGORY = 25;

    public const MIN_RELEVANT_SCORE = 3;

    /** Industries module industry behind each aisle (its Sprint category adds 1 to the relevant score). */
    private const INDUSTRY = [
        'agriculture-agri-business' => 'agriculture-agro-industry',
        'energy-utilities' => 'energy-utilities',
        'health-life-sciences' => 'health-pharmaceuticals',
        'manufacturing-industry' => 'manufacturing-industrial',
        'mining-natural-resources' => 'mining-minerals',
        'tourism-hospitality' => 'tourism-hospitality',
    ];

    /** Removed from every text before named matching: TBCA's own name and template wording. */
    private const SHARED_EXCLUDE = ['the business clinic africa', 'business clinic africa', 'business clinic'];

    /** Register subcategories every sector buys (relevant rule, score 3). */
    private const COMMON_SUBCATEGORIES = [
        'Feasibility', 'Pre-Feasibility Starter', 'Feasibility Evidence Pack', 'Project advisory and feasibility', 'New Product Feasibility Starter',
        'Project Finance', 'Project Finance Readiness', 'PPP', 'PPP Readiness', 'Capital Projects', 'Project Concept Note',
        'Investment Readiness', 'Investment readiness and transactions', 'Investor Readiness', 'Growth Capital Readiness',
        'Funding Readiness', 'Funding Support', 'Funding Advisory', 'Grant Support', 'Bankability Review', 'Loan Readiness',
        'Financial Model', 'Five-Year Forecast', 'Due Diligence Finance Pack', 'Project Sponsor Due Diligence Pack',
        'ESG', 'ESG and impact', 'ESG Baseline', 'Sustainability', 'Sustainability Strategy Starter', 'Climate', 'Impact',
        'Export', 'Export Readiness', 'Export Growth', 'Export Document Pack', 'Cross-border trade and market entry', 'Market Entry',
        'Supply Chain', 'Supply Chain Readiness', 'Licensing Evidence Pack', 'Regulatory Evidence Folder',
    ];

    /** Keywords for Sprints every sector buys (relevant rule, 2 in the title, 1 elsewhere). */
    private const COMMON_KEYWORDS = [
        'feasibility', 'pre feasibility', 'bankable', 'bankability', 'business plan', 'funding readiness', 'investment readiness',
        'investor readiness', 'project finance', 'ppp', 'public private partnership', 'esg', 'impact', 'licensing', 'licence', 'license',
        'permit', 'permits', 'permitting', 'market entry', 'value chain', 'supply chain', 'export', 'export readiness',
        'financial model', 'due diligence',
    ];

    /** The aisles that take cross-listings. */
    public static function aisles(): array
    {
        return array_keys(self::rules());
    }

    /**
     * Rules per aisle.
     *
     * @return array<string, array{named: list<string>, exclude: list<string>, subcategories: list<string>, keywords: list<string>, common: bool}>
     */
    public static function rules(): array
    {
        return [
            'agriculture-agri-business' => [
                'named' => [
                    'agri*', 'agro*', 'farm', 'farms', 'farmer*', 'farming', 'crop', 'crops', 'livestock', 'poultry', 'dairy', 'cattle',
                    'food', 'foods', 'food security', 'food safety', 'food processing', 'fisheries', 'fishery', 'fishing', 'aquaculture',
                    'horticultur*', 'irrigation', 'smallholder*', 'harvest', 'harvests', 'post harvest', 'grain', 'grains', 'maize',
                    'forestry', 'timber', 'abattoir*', 'packhouse*', 'agro processing', 'agribusiness',
                ],
                'exclude' => [
                    'food for thought', 'farm out', 'farmed out', 'farming out', 'server farm*', 'link farm*', 'content farm*', 'click farm*',
                    'bot farm*', 'crop image*', 'crop photo*', 'data harvest*', 'harvest data',
                ],
                'subcategories' => ['Supplier Development Pack', 'Quality Checklist', 'Standards', 'ISO Readiness', 'Climate Risk Checklist', 'SADC Entry Pack', 'Trade Partner Scan', 'Distributor Prospectus'],
                'keywords' => ['cooperative*', 'co operative*', 'smallholder*', 'traceability', 'cold chain', 'climate', 'food safety', 'quality standards', 'distributor*', 'off taker*', 'offtake*', 'grant', 'grants', 'blended finance', 'rural'],
                'common' => true,
            ],
            'energy-utilities' => [
                'named' => [
                    // "power" counts only in energy phrases: alone it is mostly "Power BI", "power AI" or "power your growth".
                    'energy', 'power generation', 'power plant*', 'power station*', 'power project*', 'power sector', 'power supply',
                    'power utility', 'power utilities', 'power producer*', 'power grid', 'power distribution', 'power transmission',
                    'electric power', 'solar power', 'hydro power', 'solar', 'renewable*', 'electricity', 'electrification', 'electric utility', 'utility', 'utilities',
                    'oil and gas', 'petroleum', 'ipp', 'ipps', 'independent power producer*', 'grid', 'mini grid*', 'off grid', 'water utility',
                    'water utilities', 'water and sanitation', 'sanitation', 'hydropower', 'hydroelectric', 'hydrogen', 'wind farm*',
                    'wind energy', 'wind power', 'battery storage', 'energy storage', 'fuel', 'fuels', 'lpg', 'coal', 'nuclear',
                    'megawatt*', 'kwh', 'power purchase agreement*',
                ],
                'exclude' => [
                    'power bi', 'power automate', 'power apps', 'power app', 'power platform', 'power pages', 'power query', 'power virtual agent*',
                    'power point', 'power user*', 'power skill*', 'power of', 'purchasing power', 'bargaining power', 'buying power',
                    'staying power', 'brand power', 'pricing power', 'power up', 'power your', 'powered by', 'power hour*', 'power word*',
                    'power move*', 'power dynamic*', 'people power', 'power map*', 'grid view', 'grid layout', 'data grid', 'css grid',
                    'grid system', 'utility function*', 'utility class*', 'utility app*', 'utility tool*', 'utility token*', 'software utilit*',
                    'productivity utilit*', 'fuel growth', 'fuel your', 'fuels growth', 'fuel the', 'fuels the',
                ],
                'subcategories' => ['Commissioning Checklist', 'Handover Plan', 'Project Readiness', 'Project Data Room', 'Project Risk Register', 'Climate Risk Checklist', 'Greenwashing Risk Review', 'Sustainability Report Pack'],
                'keywords' => ['infrastructure', 'capital project*', 'commissioning', 'concession*', 'climate', 'carbon', 'emission*', 'net zero', 'tariff*', 'environmental'],
                'common' => true,
            ],
            'health-life-sciences' => [
                'named' => [
                    'health', 'healthcare', 'health care', 'public health', 'hospital*', 'clinic', 'clinics', 'clinical', 'pharma*',
                    'medical', 'medicine', 'medicines', 'medtech', 'med tech', 'patient', 'patients', 'nursing', 'nurse', 'nurses',
                    'life sciences', 'biotech*', 'laboratory', 'laboratories', 'wellness', 'primary care',
                ],
                'exclude' => [
                    'business health', 'financial health', 'cash flow health', 'cashflow health', 'pipeline health', 'governance health',
                    'technical seo health', 'seo health', 'data health', 'crm data health', 'brand health', 'organisational health',
                    'organizational health', 'portfolio health', 'integration health', 'system health', 'website health', 'site health',
                    'account health', 'customer health', 'health check*', 'health score*', 'health scorecard*', 'health monitoring',
                    'health diagnostic*', 'health calculator*', 'health review*', 'health index', 'health and safety', 'occupational health',
                    'founder clinic*', 'coaching clinic*', 'sales clinic*', 'patient capital', 'clinical precision', 'clinically',
                ],
                'subcategories' => ['Compliance', 'Privacy Operations', 'Privacy Readiness', 'POPIA/GDPR Evidence Pack', 'Quality and performance management', 'ISO Readiness', 'QA', 'Standards', 'Standards Evidence Pack', 'Quality Manual Starter', 'Service Quality Dashboard', 'Customer Complaint Tracker'],
                'keywords' => ['accreditation', 'quality management', 'quality manual', 'iso', 'standards', 'privacy', 'popia', 'data protection', 'complaint*', 'service quality', 'regulatory'],
                'common' => true,
            ],
            'manufacturing-industry' => [
                'named' => [
                    'manufactur*', 'factory', 'factories', 'industrial', 'industrialisation', 'industrialization', 'production plant*',
                    'production line*', 'assembly line*', 'processing plant*', 'beneficiation', 'fabrication', 'automotive', 'textile*',
                    'plastics', 'chemicals', 'foundry', 'foundries', 'industrial park*', 'special economic zone*', 'oem', 'oems',
                ],
                'exclude' => [
                    // Agro-processing belongs to agriculture.
                    'agro processing', 'agro industr*', 'agro industrial',
                    'content factory', 'content factories', 'delivery factory', 'service factory', 'software factory', 'proposal factory',
                    'sprint factory', 'idea factory', 'factory reset', 'industrial relations',
                ],
                'subcategories' => ['Operations and process improvement', 'Operations Transformation', 'Process Excellence', 'Process Improvement', 'Lean Improvement Pack', 'Bottleneck Review', 'Inventory Control Dashboard', 'Quality', 'Quality Checklist', 'Quality Monitoring', 'Process Audit', 'ISO Readiness', 'Standards', 'Standards Evidence Pack', 'Supplier Development Pack', 'Supplier Tracker', 'Procurement Process Map', 'Operations Control Dashboard', 'Commissioning Checklist'],
                'keywords' => ['lean', 'inventory', 'stock control', 'quality', 'iso', 'standards', 'procurement', 'process improvement', 'productivity', 'bottleneck*', 'workflow redesign', 'cost reduction'],
                'common' => true,
            ],
            'mining-natural-resources' => [
                'named' => [
                    'mining', 'mine', 'mines', 'mineral*', 'metals', 'quarry', 'quarries', 'quarrying', 'extractive*', 'beneficiation',
                    'smelter*', 'smelting', 'gold mine*', 'gold mining', 'platinum group metal*', 'pgm', 'pgms', 'diamond mining', 'copper',
                    'lithium', 'cobalt', 'manganese', 'iron ore', 'chrome ore', 'tailings', 'natural resource*', 'mining charter',
                    'mineral exploration', 'exploration licence*', 'exploration license*',
                ],
                'exclude' => [
                    'data mining', 'text mining', 'process mining', 'opinion mining', 'crypto mining', 'bitcoin mining', 'mining data',
                    'mining the data', 'mine of information', 'data mine', 'mine data',
                ],
                'subcategories' => ['ESG Data Room', 'ESG Evidence Register', 'ESG Monitoring', 'Social Impact Report', 'Supplier Development Pack', 'Enterprise Development', 'Commissioning Checklist', 'Project Data Room', 'Project Risk Register', 'Climate Risk Checklist', 'Compliance'],
                'keywords' => ['social licence', 'local content', 'local procurement', 'supplier development', 'environmental', 'rehabilitation', 'capital project*', 'stakeholder engagement'],
                'common' => true,
            ],
            'tourism-hospitality' => [
                'named' => [
                    'tourism', 'tourist*', 'hospitality', 'hotel*', 'lodge', 'lodges', 'guest house*', 'guesthouse*', 'bed and breakfast',
                    'resort*', 'travel', 'destination*', 'safari*', 'game reserve*', 'ecotourism', 'eco tourism', 'restaurant*', 'catering',
                    'leisure', 'accommodation', 'airline*', 'visitor economy', 'events and conferences', 'conference venue*',
                ],
                'exclude' => [
                    'lodge a', 'lodge an', 'lodge the', 'lodge your', 'lodge their', 'lodge objection*', 'lodge complaint*', 'lodge claim*',
                    'lodge return*', 'travel expense*', 'travel and expense*', 'travel claim*', 'travel policy', 'travel allowance*',
                    'travel cost*', 'travel time', 'travel and subsistence', 'destination url*', 'destination folder*', 'destination page*',
                    'destination system*', 'destination field*', 'destination database*', 'data destination*', 'reasonable accommodation',
                    'resort to', 'last resort', 'catering to', 'catering for',
                ],
                'subcategories' => ['Customer Journey', 'Reputation Management', 'Service Quality Dashboard', 'Customer Complaint Tracker', 'Customer Service SOP', 'Country Market Brief', 'Digital Growth', 'Online Shop Setup', 'Website', 'Enterprise Development', 'Impact'],
                'keywords' => ['customer experience', 'customer journey', 'reputation', 'reviews', 'booking*', 'guest*', 'service quality', 'country market', 'investment promotion', 'investor introduction*', 'heritage'],
                'common' => true,
            ],
            'risk-cybersecurity' => [
                'named' => [
                    'cyber*', 'information security', 'infosec', 'iso 27001', 'iso iec 27001', 'popia security', 'security safeguard*',
                    'penetration test*', 'pen test*', 'vulnerability', 'vulnerabilities', 'risk register*', 'enterprise risk*', 'business continuity',
                    'disaster recovery', 'resilience', 'operational resilience', 'incident response', 'security incident*', 'data breach*',
                    'ransomware', 'phishing', 'firewall*', 'soc 2', 'siem', 'security awareness', 'security audit*', 'security assessment*',
                    'security review*', 'identity and access', 'threat intelligence', 'threat detection', 'threat model*',
                    'risk management', 'risk assessment*', 'risk framework*', 'risk appetite', 'risk governance', 'risk dashboard*',
                    'fraud risk', 'fraud prevention', 'third party risk', 'operational risk*',
                ],
                'exclude' => ['cash resilience'],
                'subcategories' => ['Risk', 'Compliance Monitoring', 'Technology Governance', 'AI Governance', 'AI Governance Pack', 'Privacy Operations', 'Privacy Readiness', 'POPIA/GDPR Evidence Pack', 'Data Governance', 'Data Governance Starter', 'Financial Controls', 'AML/KYC Readiness', 'Greenwashing Risk Review', 'Climate Risk Checklist', 'Supplier Risk Dashboard', 'Internal Audit & Controls'],
                'keywords' => ['risk', 'risks', 'controls', 'internal control*', 'audit', 'privacy', 'popia', 'gdpr', 'data protection', 'aml', 'kyc', 'fraud', 'governance'],
                'common' => false,
            ],
        ];
    }

    /** Lower case, "&" as "and", only letters, digits and single spaces, padded with one space each side. */
    public static function normalise(?string $text): string
    {
        $text = Str::lower(Str::ascii(str_replace('&', ' and ', (string) $text)));

        return ' '.trim((string) preg_replace('/[^a-z0-9]+/', ' ', $text)).' ';
    }

    /** One regex for a keyword list: whole words or phrases; a trailing "*" matches any word ending. */
    public static function pattern(array $keywords): ?string
    {
        $alts = collect($keywords)->map(function (string $k) {
            $stem = rtrim($k, '*');
            $quoted = preg_quote(trim(self::normalise($stem)), '/');

            return $quoted.(str_ends_with($k, '*') ? '[a-z0-9]*' : '');
        })->filter()->unique()->sortByDesc(fn ($p) => strlen($p))->values();

        return $alts->isEmpty() ? null : '/(?<= )(?:'.$alts->implode('|').')(?= )/';
    }

    /** @return array{patterns: array<string, array{named: ?string, exclude: ?string, sub: array<string, true>, common_sub: array<string, true>, keywords: ?string}>, common: ?string, strip: ?string} */
    private static function compiled(): array
    {
        return once(function () {
            $categories = self::registerCategories();
            $patterns = [];
            foreach (self::rules() as $aisle => $rule) {
                $patterns[$aisle] = [
                    'named' => self::pattern($rule['named']),
                    'exclude' => self::pattern([...self::SHARED_EXCLUDE, ...$rule['exclude']]),
                    'sub' => array_fill_keys(array_map(fn ($s) => trim(self::normalise($s)), $rule['subcategories']), true),
                    'common_sub' => $rule['common'] ? array_fill_keys(array_map(fn ($s) => trim(self::normalise($s)), self::COMMON_SUBCATEGORIES), true) : [],
                    'keywords' => self::pattern($rule['keywords']),
                    'common' => $rule['common'],
                ];
            }

            return ['patterns' => $patterns, 'common' => self::pattern(self::COMMON_KEYWORDS), 'strip' => self::pattern($categories)];
        });
    }

    /** The register's 26 category names (removed from text before named matching). */
    private static function registerCategories(): array
    {
        return once(function () {
            $path = base_path(Register::PATH);
            if (! is_file($path)) {
                return [];
            }
            $doc = json_decode((string) file_get_contents($path), true);
            $index = array_search('category', $doc['columns'] ?? [], true);
            $shared = $doc['shared']['category'] ?? null;

            return array_values(array_unique(array_filter($shared ?? array_map(fn ($r) => $r[$index] ?? null, $doc['rows'] ?? []))));
        });
    }

    /**
     * Prepares the text a named rule reads for one aisle: category names and the aisle's exclusion
     * phrases are replaced by a "#" so the words around them cannot form a keyword.
     */
    public static function clean(string $aisle, ?string $text): string
    {
        $c = self::compiled();
        $text = self::normalise($text);
        foreach ([$c['strip'], $c['patterns'][$aisle]['exclude']] as $pattern) {
            if ($pattern) {
                $text = (string) preg_replace($pattern, '#', $text);
            }
        }

        return $text;
    }

    /**
     * The first named keyword a Sprint carries for an aisle, in field order.
     *
     * @param  array<string, ?string>  $fields  label => text (title, summary, description, problem, promise, deliverable, subcategory)
     * @return array{field: string, keyword: string}|null
     */
    public static function namedMatch(string $aisle, array $fields): ?array
    {
        $pattern = self::compiled()['patterns'][$aisle]['named'] ?? null;
        if (! $pattern) {
            return null;
        }
        foreach ($fields as $field => $text) {
            if ($text !== null && $text !== '' && preg_match($pattern, self::clean($aisle, $text), $m)) {
                return ['field' => $field, 'keyword' => $m[0]];
            }
        }

        return null;
    }

    /**
     * Relevant score for one Sprint in one aisle (see the class notes).
     *
     * @param  array{title: ?string, summary: ?string, subcategory: ?string, category: ?string, featured: bool}  $s
     * @return array{score: int, matched: string}
     */
    public static function relevantScore(string $aisle, array $s): array
    {
        $c = self::compiled();
        $p = $c['patterns'][$aisle];
        $score = 0;
        $why = [];

        $sub = trim(self::normalise($s['subcategory'] ?? ''));
        if ($sub !== '' && isset($p['sub'][$sub])) {
            $score += 4;
            $why[] = "subcategory: {$s['subcategory']}";
        } elseif ($sub !== '' && isset($p['common_sub'][$sub])) {
            $score += 3;
            $why[] = "subcategory: {$s['subcategory']}";
        }

        $strip = fn (string $t) => $c['strip'] ? (string) preg_replace($c['strip'], '#', self::normalise($t)) : self::normalise($t);
        // Register variants add an audience after a dash ("Bankability Review - Monthly Supplier"); only the base name counts.
        $title = $strip((string) preg_split('/\s[-\x{2013}\x{2014}]\s/u', (string) ($s['title'] ?? ''))[0]);
        $rest = $strip(($s['summary'] ?? '').' '.($s['subcategory'] ?? ''));
        foreach ([[$p['keywords'], 3, 2], [$p['common'] ? $c['common'] : null, 2, 1]] as [$pattern, $inTitle, $elsewhere]) {
            if (! $pattern) {
                continue;
            }
            if (preg_match($pattern, $title, $m)) {
                $score += $inTitle;
                $why[] = "title: {$m[0]}";
            } elseif (preg_match($pattern, $rest, $m)) {
                $score += $elsewhere;
                $why[] = "text: {$m[0]}";
            }
        }

        $industry = self::INDUSTRY[$aisle] ?? null;
        if ($industry && ($s['category'] ?? null) !== null && $s['category'] === self::industrySprintCategory($industry)) {
            $score += 1;
            $why[] = "category: {$s['category']}";
        }
        if (! empty($s['featured'])) {
            $score += 1;
        }

        return ['score' => $score, 'matched' => implode('; ', $why)];
    }

    private static function industrySprintCategory(string $industry): ?string
    {
        $map = once(fn () => collect(IndustryRegister::industries())->mapWithKeys(fn ($i) => [$i[2] => $i[17]])->all());

        return $map[$industry] ?? null;
    }

    /**
     * Published Sprints with the text the rules read. Register text (problem, promise, deliverable,
     * subcategory, category) comes from the register data file through the Sprint's register_id.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public static function candidates(): Collection
    {
        $register = is_file(base_path(Register::PATH)) ? collect(Register::load()['rows'])->keyBy('code') : collect();

        return Sprint::query()->where('status', 'published')->orderBy('id')
            ->get(['id', 'code', 'register_id', 'title', 'summary', 'description', 'category', 'subcategory', 'shop_aisle', 'featured', 'rating'])
            ->map(function (Sprint $s) use ($register) {
                $row = $s->register_id ? $register->get($s->register_id) : null;

                return [
                    'id' => $s->id,
                    'code' => $s->code,
                    'title' => $s->title,
                    'summary' => $s->summary,
                    'home' => $s->shop_aisle,
                    'category' => $s->category,
                    'subcategory' => $row['subcategory'] ?? $s->subcategory,
                    'featured' => (bool) $s->featured,
                    'rating' => (float) ($s->rating ?? 0),
                    'fields' => [
                        'title' => $s->title,
                        'summary' => $s->summary,
                        'description' => $s->description,
                        'problem' => $row['problem'] ?? null,
                        'promise' => $row['promise'] ?? null,
                        'deliverable' => $row['deliverable'] ?? null,
                        'subcategory' => $row['subcategory'] ?? null,
                    ],
                ];
            });
    }

    /**
     * Rule placements (named and relevant) for every aisle, before overrides.
     *
     * @return list<array{sprint_id: int, code: string, aisle: string, reason: string, matched: string, score: int, title: string}>
     */
    public static function rulePlacements(?Collection $candidates = null): array
    {
        $candidates ??= self::candidates();
        $out = [];

        foreach (self::aisles() as $aisle) {
            $named = [];
            foreach ($candidates as $s) {
                if ($s['home'] === $aisle) {
                    continue;
                }
                if ($hit = self::namedMatch($aisle, $s['fields'])) {
                    $named[$s['id']] = true;
                    $out[] = ['sprint_id' => $s['id'], 'code' => $s['code'], 'aisle' => $aisle, 'reason' => 'named', 'matched' => "{$hit['field']}: {$hit['keyword']}", 'score' => 0, 'title' => $s['title']];
                }
            }

            $scored = [];
            foreach ($candidates as $s) {
                if ($s['home'] === $aisle || isset($named[$s['id']])) {
                    continue;
                }
                $r = self::relevantScore($aisle, $s);
                if ($r['score'] >= self::MIN_RELEVANT_SCORE) {
                    $scored[] = [...$s, ...$r];
                }
            }
            usort($scored, fn ($a, $b) => [$b['score'], $b['rating'], $a['title'], $a['id']] <=> [$a['score'], $a['rating'], $b['title'], $b['id']]);

            $perSub = [];
            $taken = 0;
            foreach ($scored as $s) {
                if ($taken >= self::RELEVANT_CAP) {
                    break;
                }
                $key = Str::lower((string) $s['subcategory']);
                if (($perSub[$key] ?? 0) >= self::RELEVANT_PER_SUBCATEGORY) {
                    continue;
                }
                $perSub[$key] = ($perSub[$key] ?? 0) + 1;
                $taken++;
                $out[] = ['sprint_id' => $s['id'], 'code' => $s['code'], 'aisle' => $aisle, 'reason' => 'relevant', 'matched' => $s['matched'], 'score' => $s['score'], 'title' => $s['title']];
            }
        }

        return $out;
    }

    /** @return list<array{code: string, aisle: string, action: string, note: string}> */
    public static function overrides(?string $path = null): array
    {
        $path ??= base_path(self::OVERRIDES);
        if (! is_file($path) || ! ($h = fopen($path, 'r'))) {
            return [];
        }
        $rows = [];
        $header = null;
        while (($line = fgetcsv($h, escape: '\\')) !== false) {
            if ($line === [null] || $line === ['']) {
                continue;
            }
            if ($header === null) {
                $header = array_map(fn ($c) => Str::lower(trim((string) $c)), $line);

                continue;
            }
            $r = array_combine($header, array_pad(array_slice($line, 0, count($header)), count($header), ''));
            $rows[] = [
                'code' => strtoupper(trim((string) ($r['code'] ?? ''))),
                'aisle' => Str::lower(trim((string) ($r['aisle'] ?? ''))),
                'action' => Str::lower(trim((string) ($r['action'] ?? ''))),
                'note' => trim((string) ($r['note'] ?? '')),
            ];
        }
        fclose($h);

        return $rows;
    }

    /**
     * Rebuilds the rule rows and the manual rows that come from the overrides file. Manual rows from
     * another source are kept. Idempotent: the same data gives the same rows.
     *
     * @return array{aisles: array<string, array{named: int, relevant: int, manual: int, total: int}>, overrides: array{added: int, removed: int, skipped: list<string>}, rows: list<array<string, mixed>>}
     */
    public static function rebuild(bool $dryRun = false, ?string $overridesPath = null): array
    {
        $candidates = self::candidates();
        $byCode = $candidates->keyBy('code');
        $placements = collect(self::rulePlacements($candidates))->keyBy(fn ($p) => $p['sprint_id'].'|'.$p['aisle']);
        $report = ['added' => 0, 'removed' => 0, 'skipped' => []];

        foreach (self::overrides($overridesPath) as $i => $o) {
            $line = $i + 2;
            $s = $byCode->get($o['code']);
            $valid = Catalogue::aisle($o['aisle']) !== null;
            if (! $s || ! $valid || ! in_array($o['action'], ['add', 'remove'], true)) {
                $report['skipped'][] = "line {$line}: ".(! $s ? "unknown or unpublished Sprint {$o['code']}" : (! $valid ? "unknown aisle {$o['aisle']}" : 'action must be add or remove'));

                continue;
            }
            $key = $s['id'].'|'.$o['aisle'];
            if ($o['action'] === 'remove') {
                $report['removed'] += $placements->has($key) ? 1 : 0;
                $placements->forget($key);

                continue;
            }
            if ($s['home'] === $o['aisle']) {
                $report['skipped'][] = "line {$line}: {$o['code']} already has {$o['aisle']} as its home aisle";

                continue;
            }
            $placements->put($key, ['sprint_id' => $s['id'], 'code' => $s['code'], 'aisle' => $o['aisle'], 'reason' => 'manual', 'matched' => $o['note'] !== '' ? "override: {$o['note']}" : 'override', 'score' => 0, 'title' => $s['title'], 'source' => self::SOURCE_FILE]);
            $report['added']++;
        }

        // Manual rows set outside the file stay; their pairs are not re-added by the rules.
        $kept = DB::table(self::TABLE)->where('reason', 'manual')->where('source', '!=', self::SOURCE_FILE)->get(['sprint_id', 'aisle']);
        foreach ($kept as $k) {
            $placements->forget($k->sprint_id.'|'.$k->aisle);
        }

        $tier = ['manual' => 0, 'named' => 0, 'relevant' => 1];
        $rows = $placements->values()
            ->sortBy(fn ($p) => [$p['aisle'], $tier[$p['reason']], $p['reason'] === 'relevant' ? -$p['score'] : 0, Str::lower($p['title']), $p['sprint_id']])
            ->groupBy('aisle')
            ->flatMap(fn (Collection $g) => $g->values()->map(fn ($p, $i) => [...$p, 'position' => $i + 1]))
            ->values();

        $now = now();
        if (! $dryRun) {
            DB::transaction(function () use ($rows, $now) {
                DB::table(self::TABLE)->where(fn ($q) => $q->whereIn('reason', ['named', 'relevant'])->orWhere('source', self::SOURCE_FILE))->delete();
                foreach ($rows->chunk(500) as $chunk) {
                    DB::table(self::TABLE)->insert($chunk->map(fn ($p) => [
                        'sprint_id' => $p['sprint_id'], 'aisle' => $p['aisle'], 'reason' => $p['reason'],
                        'source' => $p['source'] ?? self::SOURCE_RULES, 'matched' => Str::limit((string) $p['matched'], 250, ''),
                        'score' => $p['score'], 'position' => $p['position'], 'created_at' => $now, 'updated_at' => $now,
                    ])->values()->all());
                }
            });
            self::forget();
        }

        $counts = [];
        foreach (array_unique([...self::aisles(), ...$rows->pluck('aisle')->all()]) as $slug) {
            $g = $rows->where('aisle', $slug);
            $counts[$slug] = ['named' => $g->where('reason', 'named')->count(), 'relevant' => $g->where('reason', 'relevant')->count(), 'manual' => $g->where('reason', 'manual')->count(), 'total' => $g->count()];
        }

        return ['aisles' => $counts, 'overrides' => $report, 'rows' => $rows->all()];
    }

    /** Version of the listings (row count and latest change); part of every cache key that reads them. */
    public static function version(): string
    {
        return once(function () {
            $v = DB::table(self::TABLE)->selectRaw('count(*) as n, max(updated_at) as t')->first();

            return ($v->n ?? 0).'-'.($v->t ?? '');
        });
    }

    /** Clears the per-request memo after a rebuild (cache keys carry the version, so nothing else is stale). */
    public static function forget(): void
    {
        Once::flush();
    }

    /**
     * Cross-listings of every published Sprint: sprint_id => [aisle => [reason, position]].
     *
     * @return array<int, array<string, array{0: string, 1: int}>>
     */
    public static function bySprint(): array
    {
        return once(fn () => Cache::remember('shop.aisle-listings.'.md5(self::version()), now()->addDay(), function () {
            $map = [];
            foreach (DB::table(self::TABLE)->orderBy('id')->get(['sprint_id', 'aisle', 'reason', 'position']) as $r) {
                $map[$r->sprint_id][$r->aisle] = [$r->reason, (int) $r->position];
            }

            return $map;
        }));
    }

    /** @return array<string, int> published cross-listed Sprints per aisle */
    public static function countsByAisle(): array
    {
        return DB::table(self::TABLE.' as l')
            ->whereExists(fn ($q) => $q->selectRaw('1')->from('sprints as s')->whereColumn('s.id', 'l.sprint_id')->where('s.status', 'published')
                ->where(fn ($q) => $q->whereNull('s.shop_aisle')->orWhereColumn('s.shop_aisle', '!=', 'l.aisle')))
            ->groupBy('l.aisle')->selectRaw('l.aisle, count(distinct l.sprint_id) as n')->pluck('n', 'l.aisle')
            ->map(fn ($n) => (int) $n)->all();
    }

    /**
     * "Listed in" chips for a Sprint page: the home aisle first, then its cross-listings.
     *
     * @return list<array{slug: string, name: string, home: bool, reason: ?string}>
     */
    public static function listedIn(Sprint $sprint): array
    {
        $chips = [];
        if ($sprint->shop_aisle && ($a = Catalogue::aisle($sprint->shop_aisle))) {
            $chips[] = ['slug' => $a['slug'], 'name' => $a['name'], 'home' => true, 'reason' => null];
        }
        $rows = DB::table(self::TABLE)->where('sprint_id', $sprint->id)->orderBy('aisle')->get(['aisle', 'reason']);
        foreach ($rows as $r) {
            if ($a = Catalogue::aisle($r->aisle)) {
                $chips[] = ['slug' => $a['slug'], 'name' => $a['name'], 'home' => false, 'reason' => $r->reason];
            }
        }

        return $chips;
    }

    /**
     * One page of the Sprints in an aisle: Sprints shelved there first, then manual and named
     * cross-listings, then relevant ones by score. Two indexed lookups (sprints.shop_aisle and
     * shop_aisle_listings.aisle, each listing checked against sprints by primary key) feed a
     * UNION ALL; sprints is never scanned.
     */
    public static function aislePage(string $aisle, int $page = 1, int $perPage = 12): LengthAwarePaginator
    {
        $home = DB::table('sprints')->where('shop_aisle', $aisle)->where('status', 'published')
            ->selectRaw('id as sprint_id, 0 as tier, 0 as position, null as reason');
        $listed = DB::table(self::TABLE.' as l')->where('l.aisle', $aisle)
            ->whereExists(fn ($q) => $q->selectRaw('1')->from('sprints as s')->whereColumn('s.id', 'l.sprint_id')->where('s.status', 'published')
                ->where(fn ($q) => $q->whereNull('s.shop_aisle')->orWhere('s.shop_aisle', '!=', $aisle)))
            ->selectRaw("l.sprint_id, case when l.reason = 'relevant' then 2 else 1 end as tier, l.position, l.reason");
        $union = $home->unionAll($listed);

        $total = DB::query()->fromSub($union, 'x')->count();
        $page = max(1, min($page, (int) max(1, ceil($total / $perPage))));
        $slice = DB::query()->fromSub($union, 'x')->join('sprints', 'sprints.id', '=', 'x.sprint_id')
            ->orderBy('x.tier')->orderBy('x.position')->orderBy('sprints.title')->orderBy('sprints.id')
            ->forPage($page, $perPage)
            ->get(['x.sprint_id', 'x.reason']);

        $sprints = Sprint::query()->whereIn('id', $slice->pluck('sprint_id'))->get(['id', 'code', 'slug', 'title', 'type', 'category', 'subcategory', 'shop_aisle', 'summary', 'price_zar', 'delivery', 'commercial_act', 'featured', 'rating', 'image_url'])->keyBy('id');

        $items = $slice->map(function ($x) use ($sprints, $aisle) {
            $s = $sprints[$x->sprint_id];
            $r = collect(Search::fromSprint($s))->except(['haystack', 'listed_in'])->all();
            $r['listing'] = $x->reason;
            $r['also_in'] = $x->reason && $s->shop_aisle && $s->shop_aisle !== $aisle ? (Catalogue::aisle($s->shop_aisle)['name'] ?? null) : null;

            return $r;
        })->values();

        return new LengthAwarePaginator($items, $total, $perPage, $page, ['path' => "/shop/aisle/{$aisle}", 'pageName' => 'page']);
    }

    /**
     * Writes the review list (aisle, reason, code, name, home aisle, matched rule).
     */
    public static function export(string $path): int
    {
        $rows = DB::table(self::TABLE.' as l')->join('sprints as s', 's.id', '=', 'l.sprint_id')
            ->orderBy('l.aisle')->orderBy('l.position')
            ->get(['l.aisle', 'l.reason', 's.code', 's.title', 's.shop_aisle', 'l.matched', 'l.score']);

        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0775, true);
        }
        $h = fopen($path, 'w');
        fputcsv($h, ['aisle', 'reason', 'code', 'name', 'home_aisle', 'matched_rule', 'score'], escape: '\\');
        foreach ($rows as $r) {
            fputcsv($h, [
                Catalogue::aisle($r->aisle)['name'] ?? $r->aisle, $r->reason, $r->code, $r->title,
                $r->shop_aisle ? (Catalogue::aisle($r->shop_aisle)['name'] ?? $r->shop_aisle) : '', $r->matched, $r->reason === 'relevant' ? $r->score : '',
            ], escape: '\\');
        }
        fclose($h);

        return $rows->count();
    }
}
