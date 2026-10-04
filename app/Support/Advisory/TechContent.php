<?php

namespace App\Support\Advisory;

/**
 * Technology Solutions content register (TS-TEB v2.1): towers, configurator,
 * readiness diagnostic and the three-ledger (T / X / S) fee model.
 */
class TechContent
{
    public const JOURNEY = ['Context', 'Towers', 'Diagnose', 'Configure', 'Fees', 'Letter'];

    public const TRACKER = ['Context', 'Towers', 'Diagnose', 'Configure', 'Fees', 'Letter', 'Kickoff', 'Build', 'UAT', 'Acceptance'];

    public static function towers(): array
    {
        $t = [
            ['TS-1', 'business-systems-zoho-one', 'Business Systems & Zoho One', 'layers', 'Zoho CRM, Books, People, Forms, Projects and more – one connected business operating system.', 312, 'S0',
                'Design, implement and optimise connected business systems using Zoho CRM, Books, People, Forms, Projects and other operating tools.', 'Vendor licences'],
            ['TS-2', 'data-bi-dashboards', 'Data, BI & Dashboards', 'bar-chart-3', 'Turn data into insight with modern dashboards, reports and executive intelligence that drive decisions.', 276, 'S2',
                'Build data models, dashboards and executive reporting that turn operational data into decisions.', 'BI licences and data feeds'],
            ['TS-3', 'ai-agentic-automation', 'AI & Agentic Automation', 'bot', 'AI-powered agents, copilots and smart automations to assist, decide and execute business tasks.', 284, 'S2',
                'Design and deploy AI agents, copilots and automations with human oversight and metered consumption caps.', 'Model / API consumption'],
            ['TS-4', 'rpa-workflow-automation', 'RPA & Workflow Automation', 'workflow', 'Robotic process automation and intelligent workflows that remove manual work and improve accuracy.', 268, 'S2',
                'Automate repetitive processes with RPA bots and orchestrated workflows that remove manual effort.', 'Bot / orchestration licences'],
            ['TS-5', 'web-ecommerce-portals', 'Web, eCommerce, Portals & Online Shops', 'globe', 'Build websites, online shops, client portals and digital experiences that convert and scale.', 401, 'S1',
                'Build websites, online shops and client portals that convert, integrate and scale.', 'Hosting, domains, plugins and gateway'],
            ['TS-6', 'cloud-cyber-infrastructure', 'Cloud, Cybersecurity & Digital Infrastructure', 'shield', 'Secure cloud, infrastructure and cybersecurity to protect your business, data and customer trust.', 267, 'S2',
                'Migrate, secure and operate cloud infrastructure with backups, monitoring and cybersecurity controls.', 'Cloud and security tooling'],
            ['TS-7', 'experience-design-product', 'Experience, Design & Product', 'pen-tool', 'Design thinking, UX/UI, branding and product strategy for human-centred digital experiences.', 160, 'S1',
                'Shape products and experiences with research, UX/UI design and product strategy.', 'Media, stock and design assets'],
        ];
        $out = [];
        foreach ($t as [$code, $slug, $name, $icon, $blurb, $services, $start, $intro, $dep]) {
            $out[$slug] = compact('code', 'slug', 'name', 'icon', 'blurb', 'services', 'start', 'intro', 'dep');
        }

        return $out;
    }

    public static function towerByCode(string $code): ?array
    {
        return collect(self::towers())->firstWhere('code', $code);
    }

    public static function towerDetail(string $slug): array
    {
        $tower = self::towers()[$slug];
        $isZoho = $slug === 'business-systems-zoho-one';
        $caps = $isZoho
            ? [['CRM Setup', 'Leads, contacts, pipeline and deal management', 'users'], ['Finance Automation', 'Invoicing, expenses, banking & reconciliation', 'receipt'], ['People & HR Workflows', 'Employee records, leave, attendance & self-service', 'user-check'], ['Custom Forms', 'Web forms, approvals and data capture', 'clipboard-list'], ['Project Tracking', 'Tasks, milestones, time & collaboration', 'list-checks'], ['Dashboards & Reports', 'Real-time insights and performance tracking', 'bar-chart-3'], ['Integrations', 'Connect apps, APIs and third-party tools', 'plug'], ['Permissions & Roles', 'Data access, roles and team security', 'lock'], ['Admin Optimisation', 'System configuration and performance tuning', 'settings']]
            : [['Discovery & Architecture', 'Requirements, current state and target design', 'compass'], ['Configuration', 'Platform setup, roles and workflows', 'settings'], ['Integrations', 'Connect apps, APIs and data sources', 'plug'], ['Data & Reporting', 'Data models, dashboards and KPIs', 'bar-chart-3'], ['Security & Access', 'Roles, permissions and controls', 'lock'], ['Testing & UAT', 'Test plans, cases and evidence', 'clipboard-check'], ['Training & Adoption', 'Role-based training and enablement', 'graduation-cap'], ['Go-Live & Hypercare', 'Deployment and stabilisation support', 'rocket'], ['Managed Support', 'Ongoing administration and optimisation', 'life-buoy']];
        $sprints = $isZoho
            ? [['Zoho CRM Setup Sprint', 'Configure CRM modules, pipelines, automation and key reports', 'S0', 'Fixed', 'zoho-crm-setup-sprint'], ['Zoho Books Finance Setup Sprint', 'Configure chart of accounts, tax, invoicing, expenses and bank feeds', 'S0', 'Fixed', 'zoho-books-finance-setup-sprint'], ['Workflow Approval Automation Sprint', 'Design and implement approval workflows and notifications', 'S2', 'Capped', 'workflow-approval-automation-sprint'], ['Management Dashboard Sprint', 'Build executive dashboards and KPI reports for decision makers', 'S1', 'Fixed', 'management-dashboard-sprint'], ['User Training & Enablement Sprint', 'Role-based training and adoption support for teams', 'S1', 'Capped', 'user-training-enablement-sprint'], ['Data Migration Support Sprint', 'Migrate and validate data from legacy systems into Zoho One', 'S2', 'Quote-on-Trigger', 'data-migration-support-sprint']]
            : [["{$tower['name']} Discovery Sprint", 'Confirm goals, current state and solution fit', 'S0', 'Fixed', 'discovery-sprint'], ["{$tower['name']} Architecture Sprint", 'Design the target solution and integration map', 'S1', 'Fixed', 'architecture-sprint'], ["{$tower['name']} Build Sprint", 'Configure and build the agreed scope', 'S2', 'Capped', 'build-sprint'], ['Integration Sprint', 'Connect systems, APIs and data sources', 'S2', 'Quote-on-Trigger', 'integration-sprint'], ['Training & Adoption Sprint', 'Role-based training and adoption support', 'S1', 'Capped', 'training-sprint'], ['Hypercare Sprint', 'Go-live support and stabilisation', 'S1', 'Fixed', 'hypercare-sprint']];

        return [
            ...$tower,
            'capabilities' => array_map(fn ($c) => ['title' => $c[0], 'body' => $c[1], 'icon' => $c[2]], $caps),
            'sprints' => array_map(fn ($s) => ['title' => $s[0], 'body' => $s[1], 'tier' => $s[2], 'posture' => $s[3], 'slug' => $s[4]], $sprints),
            'dependencies' => [
                [$isZoho ? 'Zoho Licences' : 'Vendor Licences', $isZoho ? 'Active Zoho One or standalone app licences purchased separately' : "{$tower['dep']} purchased separately"],
                ['Third-Party Email / Domain Services', 'Email hosting, domains and DNS managed by external providers'],
                ['Data Migration Inputs', 'Clean, complete source data supplied by the client'],
                ['Client User Access', 'User accounts, permissions and access provided by the client'],
                ['External Integration APIs', 'APIs, connectors or services owned and billed by third parties'],
            ],
            'pathways' => [['Managed Admin Support', 'Ongoing system administration and issue resolution', 'Monthly'], ['Reporting Maintenance', 'Maintain dashboards, KPIs and report accuracy', 'Monthly / Quarterly'], ['Automation Monitoring', 'Monitor workflows, alerts and system health', 'Monthly'], ['Quarterly Optimisation', 'Quarterly reviews and system optimisation sessions', 'Quarterly']],
        ];
    }

    public static function diagnosticDimensions(): array
    {
        return [
            ['tools', 'Tools & Systems', ['How mature is your primary business system (e.g., Zoho One, ERP, CRM)?', 'How consistent and up-to-date are your core system configurations?'], 'TS-1'],
            ['data', 'Data & Reporting', ['How visible and accurate is your key business data?', 'How easy is it to generate reports and dashboards for decisions?'], 'TS-2'],
            ['integrations', 'Integrations', ['How well do your systems and apps integrate with each other?', 'Do you use APIs or middleware to connect critical systems?'], 'TS-4'],
            ['security', 'Security & Compliance', ['How mature are your cybersecurity controls and access management?', 'Do you have data backup, disaster recovery and compliance processes?'], 'TS-6'],
            ['automation', 'Automation', ['How many processes are automated end-to-end?', 'Do you use workflow automation to reduce manual tasks?'], 'TS-3'],
            ['capacity', 'Internal Capacity', ['How equipped is your team with digital skills and system ownership?', 'Do you have internal capacity to maintain and improve systems?'], 'TS-7'],
        ];
    }

    public const LEVELS = ['Not Started', 'Basic', 'Developing', 'Managed', 'Advanced'];

    /** Readiness score: 5-level scale (0-4) averaged to /100, weakest dimensions drive tower recommendations. */
    public static function readiness(array $answers): array
    {
        $dims = self::diagnosticDimensions();
        $total = 0;
        $count = 0;
        $dimScores = [];
        foreach ($dims as [$key, $name, $qs, $tower]) {
            $sum = 0;
            foreach (array_keys($qs) as $i) {
                $v = (int) ($answers["{$key}_{$i}"] ?? 0);
                $sum += $v;
                $total += $v;
                $count++;
            }
            $dimScores[$key] = ['name' => $name, 'score' => (int) round($sum / (count($qs) * 4) * 100), 'tower' => $tower];
        }
        $score = $count ? (int) round($total / ($count * 4) * 100) : 0;
        $band = match (true) {
            $score >= 80 => 'Advanced — ready to optimise and scale.',
            $score >= 60 => 'Good foundation, with key gaps to address.',
            $score >= 40 => 'Developing — several foundations need attention.',
            default => 'Early stage — start with core systems and data.',
        };
        $sorted = collect($dimScores)->sortBy('score');
        $strengths = collect($dimScores)->sortByDesc('score')->take(3)->map(fn ($d) => "{$d['name']}: managed foundation in place ({$d['score']}%).")->values()->all();
        $gaps = $sorted->take(3)->map(fn ($d) => "{$d['name']}: maturity at {$d['score']}% — key gap to address.")->values()->all();
        $recommended = $sorted->take(3)->values()->map(fn ($d, $i) => [
            'code' => $d['tower'], 'name' => self::towerByCode($d['tower'])['name'] ?? $d['tower'], 'impact' => $i < 2 ? 'High Impact' : 'Medium Impact',
        ])->all();

        return ['score' => $score, 'band' => $band, 'dimensions' => $dimScores, 'strengths' => $strengths, 'gaps' => $gaps, 'recommended' => $recommended];
    }

    public static function configOptions(): array
    {
        return [
            ['key' => 'agents', 'title' => 'AI Agent Suite', 'multi' => true, 'hint' => 'Select intelligent agents to automate and augment your operations', 'options' => [['research', 'Research Agent', 'Market, competitor & opportunity research'], ['compliance', 'Compliance Agent', 'Regulatory, risk & compliance monitoring'], ['finance', 'Finance Agent', 'Financial analysis & forecasting'], ['operations', 'Operations Agent', 'Process automation & optimization'], ['customer', 'Customer Agent', 'Customer support & engagement']]],
            ['key' => 'automation', 'title' => 'Automation Workflows', 'multi' => false, 'hint' => 'Choose workflow automation for key business processes', 'options' => [['standard', 'Standard Automation', 'Pre-built workflows'], ['advanced', 'Advanced Automation', 'Custom multi-step workflows'], ['hyper', 'Hyper Automation', 'End-to-end process automation'], ['ai', 'AI-Driven Automation', 'Autonomous decision workflows']]],
            ['key' => 'integrations', 'title' => 'Data & Integrations', 'multi' => true, 'hint' => 'Connect your data sources and third-party systems', 'options' => [['internal', 'Internal Data Integration', 'ERP, CRM, databases'], ['external', 'External APIs', 'Third-party data & services'], ['documents', 'Document Intelligence', 'OCR, NLP & document processing'], ['streams', 'Real-time Data Streams', 'Live feeds & event processing'], ['legacy', 'Legacy System Connectors', 'Mainframe & legacy integration']]],
            ['key' => 'analytics', 'title' => 'Analytics & Intelligence', 'multi' => false, 'hint' => 'Select analytics and AI capabilities', 'options' => [['descriptive', 'Descriptive Analytics', 'What happened?'], ['diagnostic', 'Diagnostic Analytics', 'Why did it happen?'], ['predictive', 'Predictive Analytics', 'What will happen?'], ['prescriptive', 'Prescriptive Analytics', 'What should we do?'], ['generative', 'Generative AI', 'Content & insights generation']]],
            ['key' => 'security', 'title' => 'Security & Governance', 'multi' => false, 'hint' => 'Define security, compliance and governance framework', 'options' => [['standard', 'Standard Security', 'Basic security controls'], ['enhanced', 'Enhanced Security', 'Advanced security & encryption'], ['enterprise', 'Enterprise Security', 'Zero trust & advanced threat protection']]],
            ['key' => 'deployment', 'title' => 'Deployment & Infrastructure', 'multi' => false, 'hint' => 'Choose where your solution runs', 'options' => [['cloud', 'Cloud (SaaS)', 'Public cloud deployment'], ['private', 'Private Cloud', 'Dedicated cloud environment'], ['onprem', 'On-Premise', 'On-premise infrastructure'], ['hybrid', 'Hybrid', 'Combination deployment']]],
            ['key' => 'scale', 'title' => 'Scalability & Performance', 'multi' => false, 'hint' => 'Size the solution to your user base', 'options' => [['standard', 'Standard', 'Up to 100 users'], ['professional', 'Professional', '100 - 1,000 users'], ['enterprise', 'Enterprise', '1,000 - 10,000 users'], ['custom', 'Custom', '10,000+ users']]],
            ['key' => 'support', 'title' => 'Support & Maintenance', 'multi' => false, 'hint' => 'Choose your support tier', 'options' => [['standard', 'Standard Support', 'Business hours support'], ['priority', 'Priority Support', '24/7 priority support'], ['dedicated', 'Dedicated Support', 'Dedicated team & SLA'], ['premium', 'Premium Support', 'White-glove service']]],
        ];
    }

    public static function defaultConfig(): array
    {
        return ['agents' => ['research', 'compliance', 'finance'], 'automation' => 'advanced', 'integrations' => ['external', 'documents'], 'analytics' => 'diagnostic', 'security' => 'enhanced', 'compliance' => ['POPIA'], 'deployment' => 'cloud', 'scale' => 'professional', 'support' => 'priority'];
    }

    /** Architecture score, complexity and timeline derived from the configuration. */
    public static function configSummary(array $c): array
    {
        $rank = fn (string $key, ?string $v) => max(0, array_search($v, array_column(collect(self::configOptions())->firstWhere('key', $key)['options'], 0), true) ?: 0);
        $points = count($c['agents'] ?? []) * 2 + count($c['integrations'] ?? []) * 2
            + $rank('automation', $c['automation'] ?? null) * 2 + $rank('analytics', $c['analytics'] ?? null)
            + $rank('deployment', $c['deployment'] ?? null) + $rank('scale', $c['scale'] ?? null) * 2;
        $complexity = $points >= 16 ? 'High' : ($points >= 9 ? 'Medium' : 'Low');
        $weeks = match ($complexity) { 'High' => '8 – 12 weeks', 'Medium' => '5 – 8 weeks', default => '3 – 5 weeks' };
        $coverage = (int) min(100, 40 + count($c['agents'] ?? []) * 4 + count($c['integrations'] ?? []) * 4
            + ($rank('security', $c['security'] ?? null) * 8) + count($c['compliance'] ?? []) * 3 + ($rank('support', $c['support'] ?? null) * 3));
        $label = $coverage >= 80 ? 'Strong Architecture' : ($coverage >= 60 ? 'Sound Architecture' : 'Basic Architecture');

        return ['score' => $coverage, 'label' => $label, 'complexity' => $complexity, 'timeline' => $weeks, 'points' => $points];
    }

    /** Fee schedule: separate T, X and S ledgers; never blended. */
    public static function feeLines(array $c): array
    {
        $scale = match ($c['scale'] ?? 'professional') { 'standard' => 0.8, 'enterprise' => 1.4, 'custom' => 1.8, default => 1.0 };
        $auto = match ($c['automation'] ?? 'advanced') { 'standard' => 0.8, 'hyper' => 1.25, 'ai' => 1.4, default => 1.0 };
        $r = fn (float $v) => (int) (round($v / 1000) * 1000);
        $integrations = count($c['integrations'] ?? []);
        $lines = [
            ['T', 'Solution Architecture & Scoping', 'Business process mapping, solution design', 'Fixed', 'High', 'Included', 'Once-off', $r(75000 * $scale), null, 'Included', 'T03'],
            ['T', 'Implementation Configuration', 'Platform setup, workflows, role configuration', 'Fixed', 'High', 'Included', 'Once-off', $r(110000 * $scale * $auto), null, 'Included', 'T04'],
        ];
        if ($integrations > 0) {
            $lines[] = ['T', 'Integration Build', 'Custom integrations & connector development', 'Estimated', 'Medium', 'Approval Required', 'Once-off', $r(40000 * $integrations * $scale), $r(80000 * $integrations * $scale), 'Pending Quote', 'T06'];
        }
        $lines[] = ['T', 'Dashboard & Reporting Setup', 'Report design, dashboards, data models', 'Fixed', 'High', 'Included', 'Once-off', $r(60000 * $scale), null, 'Included', 'T05'];
        $lines[] = ['T', 'Training & Enablement', 'User training, documentation, handover', 'Fixed', 'High', 'Included', 'Once-off', $r(45000 * $scale), null, 'Included', 'T10'];
        $lines[] = ['T', 'Project Management', 'PMO, milestones, governance & QA', 'Fixed', 'High', 'Included', 'Once-off', $r(55000 * $scale), null, 'Included', 'T09'];
        $lines[] = ['X', 'Third-Party Licences', 'Software licences for selected tools', 'Variable', 'Medium', 'Approval Required', 'Annual', $r(120000 * $scale), $r(240000 * $scale), 'Pending Quote', 'X01'];
        if (in_array('external', $c['integrations'] ?? [], true) || in_array('streams', $c['integrations'] ?? [], true)) {
            $lines[] = ['X', 'API or Connector Subscriptions', 'Platform connectors & API access', 'Variable', 'Medium', 'Approval Required', 'Monthly', 5000, 15000, 'Pending Quote', 'X05'];
        }
        $lines[] = ['X', 'Cloud Hosting Estimate', 'Cloud compute, storage & environment', 'Variable', 'Low', 'Approval Required', 'Monthly', ($c['deployment'] ?? 'cloud') === 'onprem' ? 2000 : 8000, ($c['deployment'] ?? 'cloud') === 'onprem' ? 6000 : 20000, 'Pending Quote', 'X03'];
        $lines[] = ['X', 'Domain / Email Services', 'Domain registration & email add-ons', 'As Incurred', 'High', 'Approval Required', 'As Incurred', 1000, 2500, 'Pending Quote', 'X04'];
        $lines[] = ['S', 'VAT Treatment', 'VAT @ 15% on applicable TBCA services', 'Statutory', 'High', 'Included', 'As Applicable', null, null, 'Included', 'S01'];
        $lines[] = ['S', 'Regulatory / Compliance Filing', 'Where required by regulation', 'As Incurred', 'Medium', 'Approval Required', 'As Incurred', 2000, 10000, 'Pending Quote', 'S02'];

        return array_map(fn ($l) => [
            'ledger' => $l[0], 'item' => $l[1], 'covers' => $l[2], 'basis' => $l[3], 'certainty' => $l[4], 'gate' => $l[5],
            'frequency' => $l[6], 'low' => $l[7], 'high' => $l[8], 'status' => $l[9], 'class' => $l[10],
        ], $lines);
    }

    /** Per-ledger subtotals [low, high]; VAT (S01) computed on the T ledger only. */
    public static function ledgerTotals(array $lines): array
    {
        $out = ['T' => [0, 0], 'X' => [0, 0], 'S' => [0, 0], 't_fixed' => 0];
        foreach ($lines as $l) {
            if ($l['low'] === null) {
                continue;
            }
            $out[$l['ledger']][0] += $l['low'];
            $out[$l['ledger']][1] += $l['high'] ?? $l['low'];
            if ($l['ledger'] === 'T' && $l['high'] === null) {
                $out['t_fixed'] += $l['low'];
            }
        }
        $out['vat'] = [(int) round($out['T'][0] * ServicesContent::VAT), (int) round($out['T'][1] * ServicesContent::VAT)];
        $out['S'] = [$out['S'][0] + $out['vat'][0], $out['S'][1] + $out['vat'][1]];

        return $out;
    }

    /** Gate plan GATE-TS-01..08 with the current-gate T amount (payment plan 30/30/30/10). */
    public static function gatePlan(array $totals): array
    {
        $t = $totals['t_fixed'];
        $intLow = $totals['T'][0] - $t;

        return [
            [1, 'Guided Discovery / Scoping', 'I approve this scoping stage and the fees shown for this gate.', (int) round($t * 0.30), 0, 0],
            [2, 'Solution Architecture', 'I approve this architecture stage only.', 0, 0, 0],
            [3, 'Licence / External Procurement', 'I approve the named external commitments and separate TBCA handling shown.', 0, $totals['X'][0], $totals['X'][1]],
            [4, 'Delivery & Validation', 'I approve this implementation milestone only.', (int) round($t * 0.30), 18000, 42500],
            [5, 'Migration / Integration', 'I approve this migration/integration stage only.', (int) round($t * 0.30) + $intLow, 0, 0],
            [6, 'Testing / UAT / QA', 'I approve this testing and review stage only.', 0, 0, 0],
            [7, 'Training / Adoption', 'I approve the training scope shown for this gate.', 0, 0, 0],
            [8, 'Go-Live / Hypercare', 'I approve production go-live and hypercare for the stated scope. This does not activate recurring support.', (int) round($t * 0.10), 0, 0],
        ];
    }

    public static function techSprint(): array
    {
        return [
            'packages' => [
                ['key' => 'starter', 'name' => 'Starter', 'title' => 'Quick Win Automation', 'body' => 'Ideal for small teams & pilot use cases', 'price' => 75000, 'timeline' => '4 – 6 weeks', 'team' => '2 – 3 specialists'],
                ['key' => 'professional', 'name' => 'Professional', 'title' => 'Full Process Automation', 'body' => 'Best fit for growing businesses', 'price' => 165000, 'timeline' => '8 – 12 weeks', 'team' => '5 – 8 specialists', 'popular' => true],
                ['key' => 'advanced', 'name' => 'Advanced', 'title' => 'Enterprise AI Solutions', 'body' => 'For complex, multi-system environments', 'price' => 295000, 'timeline' => '12 – 16 weeks', 'team' => '8 – 12 specialists'],
                ['key' => 'custom', 'name' => 'Custom', 'title' => 'Tailored to Your Needs', 'body' => 'Large-scale or specialised requirements', 'price' => null, 'timeline' => 'Scoped', 'team' => 'Scoped'],
            ],
        ];
    }
}
