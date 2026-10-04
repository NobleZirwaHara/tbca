<?php

namespace Database\Seeders\Sections;

use App\Models\Insights\AiOutput;
use App\Models\Insights\Benchmark;
use App\Models\Insights\Consent;
use App\Models\Insights\Engagement;
use App\Models\Insights\Entitlement;
use App\Models\Insights\EvidenceRequest;
use App\Models\Insights\Faq;
use App\Models\Insights\Gate;
use App\Models\Insights\Industry;
use App\Models\Insights\LedgerEntry;
use App\Models\Insights\Misdeclaration;
use App\Models\Insights\Obligation;
use App\Models\Insights\ReclassNotice;
use App\Models\Insights\Regulator;
use App\Models\Insights\Resource;
use App\Models\Insights\ResourceAsset;
use App\Models\Insights\Sku;
use App\Models\Insights\SubIndustry;
use App\Models\Insights\Subscription;
use App\Models\Insights\Task;
use App\Models\Insights\TaxonomyChange;
use App\Models\Insights\Webinar;
use App\Models\Insights\WhatsAppDelivery;
use App\Models\Insights\WhatsAppFlow;
use App\Models\User;
use App\Support\Insights\IndustryRegister;
use App\Support\Insights\ResourceRegister;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Idempotent demo data for Industries + Resources (section "Insights").
 */
class InsightsSeeder extends Seeder
{
    public function run(): void
    {
        $this->industries();
        $this->skus();
        $this->regulators();
        $this->misdeclarations();
        $this->benchmarks();
        $this->whatsapp();
        $this->resources();
        $this->webinars();
        $this->faqs();
        $this->aiOutputs();
        $this->consents();
        $this->clientData();
    }

    private function industries(): void
    {
        foreach (IndustryRegister::industries() as $r) {
            [$num, $short, $slug, $name, $icon, $blurb, $cat, $class, $reg, $gate, $stage, $score, $owner, $target, $total, $activated, $risks, $sprintCat, $keywords, $subs] = $r;
            $profile = IndustryRegister::profile($slug, $name, $subs, $cat);

            $industry = Industry::updateOrCreate(['slug' => $slug], [
                'code' => sprintf('IND-%02d', $num),
                'short_code' => $short,
                'number' => $num,
                'name' => $name,
                'icon' => $icon,
                'blurb' => $blurb,
                'description' => $slug === 'agriculture-agro-industry'
                    ? 'Activities related to the cultivation of crops, rearing of animals, forestry, fisheries and related support activities, including primary production and value-add processing.'
                    : "Organisations operating in {$name}: ".rtrim($blurb, '.').'.',
                'tagline' => $profile['tagline'],
                'intro' => $profile['intro'],
                'catalogue_state' => $cat,
                'operating_mode' => match ($cat) { 'deep' => 'FULL_SERVICE', 'thin' => 'CONDITIONAL_FULL_SERVICE', default => 'INTELLIGENCE_ONLY' },
                'complexity_class' => $class,
                'regulatory_state' => $reg,
                'professional_gate' => $gate,
                'status' => 'active',
                'activation_stage' => $stage,
                'activation_score' => $score,
                'owner' => $owner,
                'target_live_date' => $target,
                'sprints_total' => $total,
                'sprints_activated' => $activated,
                'key_risks' => $risks,
                'sprint_category' => $sprintCat,
                'sprint_keywords' => $keywords,
                'version' => $slug === 'agriculture-agro-industry' ? '3.1' : '1.0',
                'examples' => $slug === 'agriculture-agro-industry'
                    ? ['Crop production', 'Livestock farming', 'Food processing', 'Forestry', 'Fisheries', 'Agri-support services']
                    : collect($subs)->pluck(1)->take(5)->all(),
                'rules' => ['Standard complexity model applies', 'SA Phase 1 classification', 'Human gate required for C3 - C4', 'Benchmark eligible (if consented)'],
                'profile' => $profile,
            ]);

            foreach ($subs as $i => [$code, $sname, $desc, $bands, $count]) {
                SubIndustry::updateOrCreate(['code' => $code], [
                    'industry_id' => $industry->id, 'name' => $sname, 'description' => $desc,
                    'complexity_bands' => $bands, 'status' => 'active', 'sprint_count' => $count ?: 20 + ($num * 7 + $i * 11) % 60, 'sort' => $i,
                ]);
            }
        }

        $agri = Industry::where('slug', 'agriculture-agro-industry')->first();
        foreach ([
            ['2026-05-12 10:05', 'Created', 'Initial creation', '1.0'],
            ['2026-07-22 11:32', 'Added', 'Added sub-industry AGR03', '3.0'],
            ['2026-08-14 09:10', 'Updated', 'Updated description and examples', '3.1'],
        ] as [$at, $type, $details, $v]) {
            TaxonomyChange::updateOrCreate(['industry_id' => $agri->id, 'version' => $v], [
                'changed_by' => 'Admin', 'change_type' => $type, 'details' => $details, 'created_at' => $at, 'updated_at' => $at,
            ]);
        }
    }

    private function skus(): void
    {
        $ind = Industry::pluck('id', 'slug');
        $agri = $ind['agriculture-agro-industry'];

        $addOns = [
            ['component' => 'Legal & Regulatory Review', 'detail' => 'Review of applicable export laws, permits and trade regulations.', 'purpose' => 'Ensures legal compliance and reduces regulatory risk.', 'ledger' => 'P', 'fee' => 7500],
            ['component' => 'Export Documentation Verification', 'detail' => 'Verification of export documentation requirements and readiness.', 'purpose' => 'Ensures documentation accuracy and compliance.', 'ledger' => 'P', 'fee' => 3500],
            ['component' => 'Product Quality / Lab Testing', 'detail' => 'Independent lab testing where required for target markets.', 'purpose' => 'Confirms product meets market and safety standards.', 'ledger' => 'X', 'fee' => 2800],
            ['component' => 'Government Fees & Charges', 'detail' => 'Statutory fees for permits, certifications and clearances.', 'purpose' => 'Settlement of mandatory government charges.', 'ledger' => 'S', 'fee' => null],
        ];
        $limitation = [
            'id' => 'IN-LIM-AGR-001', 'version' => '1.0', 'effective' => '14 May 2026',
            'scope' => 'This diagnostic assesses your operational, compliance and market readiness to access export markets with confidence.',
            'scopeItems' => ['Assesses business systems, processes and documentation readiness.', 'Benchmarks against sector standards and export market requirements.', 'Identifies risks, gaps and priority actions.', 'Provides recommendations and next steps.', 'Information only – not a certification or approval.'],
            'limitations' => ['Not legal advice. Consult your legal advisor for legal interpretations.', "Not regulatory approval. Export clearance remains the authority's responsibility.", 'Not a substitute for mandatory inspections, lab testing or certifications.', 'Relies on information provided by you. Results are only as accurate as the information and evidence supplied.', 'Market conditions change. Reassessments are recommended before final execution.'],
            'outOfScope' => ['We do not act as customs brokers or clearing agents.', 'We do not issue export permits, licences or phytosanitary certificates.', 'We do not provide financial, tax or investment advice.', 'We do not guarantee export success, buyer acceptance or market access.'],
        ];

        $rows = [
            // code, slug, title, industry, sub, type, price, state, drivers, base, guidance, block fields, public extras
            ['AGR-101', 'agriculture-export-readiness-diagnostic', 'Agriculture Export Readiness Diagnostic', $agri, 'Crop Production', 'diagnostic', 9950, 'sellable', ['R' => 2, 'Q' => 1, 'E' => 2, 'L' => 1, 'V' => 1, 'W' => 0], 6200, 9950, [], [
                'summary' => 'Sector-adapted diagnostic that assesses your readiness to access export markets with confidence.',
                'description' => 'This diagnostic evaluates your operational, compliance and market readiness to participate in export value chains. You receive an actionable roadmap with prioritised recommendations.',
                'included' => ['Comprehensive readiness assessment', 'Market & regulatory gap analysis', 'Prioritised action plan', 'Benchmarking against sector peers', 'AIIM-powered insights & recommendations', 'PDF report + data tables'],
                'add_ons' => $addOns, 'limitation' => $limitation]],
            ['AGR-102', 'agri-business-diagnostic', 'Agri-Business Diagnostic', $agri, 'Crop Production', 'diagnostic', 9950, 'sellable', ['R' => 1, 'Q' => 1, 'E' => 2, 'L' => 1, 'V' => 1, 'W' => 0], 5900, 9950, [], [
                'summary' => 'Sector-adapted diagnostic for Agriculture & Agro-Industry businesses.',
                'description' => 'The Agri-Business Diagnostic helps you understand your business position, risks and opportunities within the Agriculture & Agro-Industry sector.',
                'included' => ['Business readiness assessment', 'Financial health overview', 'Operational efficiency review', 'Risk & compliance scan', 'Sector benchmarking', 'Action plan & priority matrix'],
                'add_ons' => [], 'limitation' => array_merge($limitation, ['id' => 'IN-LIM-AGR-002', 'scope' => 'This diagnostic assesses business readiness, risks and opportunities in the agricultural sector.'])]],
            ['IN-AAG-PS-001', 'agri-business-statutory-audit', 'Agri-Business Statutory Audit', $agri, 'Crop Production', 'audit', null, 'blocked', ['R' => 4, 'Q' => 4, 'E' => 3, 'L' => 3, 'V' => 2, 'W' => 0, 'override' => true], null, null, [
                'block_status' => 'active', 'block_code' => 'IN-BLOCK-042', 'block_reason' => 'Professional boundary: Reserved professional service',
                'block_detail' => 'Statutory audit is a reserved activity under the Accountancy Act. It must be performed by a registered auditor in public practice. TBCA does not provide or sell this service.',
                'client_message' => 'This engagement is by reference to a registered auditor.',
                'block_rules' => ['Accountancy Act 2000 (Act 26 of 2000) – Reserved activities', 'Independent Regulatory Board for Auditors (IRBA) Code of Professional Conduct', 'TBCA Boundary & Risk Policy v1.0', 'Four-Ledger Model – Professional (P) ledger boundary'],
                'blocked_on' => '2026-08-12'], ['summary' => 'Statutory audit of agricultural entities.']],
            ['AGR-001', 'market-intelligence-report-agri', 'Market Intelligence Report', $agri, 'Crop Production', 'report', 6990, 'sellable', ['R' => 1, 'Q' => 1, 'E' => 2, 'L' => 1, 'V' => 1, 'W' => 0], 4250, 6990, [], ['summary' => 'Country and crop market intelligence report with trade flows and buyers.', 'included' => ['Country selection & fee sweep', 'Market intelligence report', 'Sector analysis', 'Risk & policy overview', 'Opportunity assessment'], 'description' => 'Market intelligence for a selected country and crop, delivered with sources and confidence grading.']],
            ['AGR-002', null, 'Crop Production Feasibility Study', $agri, 'Crop Production', 'feasibility', null, 'sellable', ['R' => 2, 'Q' => 2, 'E' => 2, 'L' => 2, 'V' => 1, 'W' => 0], 8750, 13800, [], []],
            ['AGR-010', null, 'Livestock Breeding Plan', $agri, 'Livestock & Animal Production', 'plan', null, 'sellable', ['R' => 2, 'Q' => 2, 'E' => 2, 'L' => 1, 'V' => 1, 'W' => 1], 9600, 13000, [], []],
            ['MFG-045', null, 'Manufacturing Process Review', $ind['manufacturing-industrial'], 'Light Manufacturing', 'review', null, 'sellable', ['R' => 1, 'Q' => 1, 'E' => 1, 'L' => 1, 'V' => 1, 'W' => 0], 6100, 8400, [], []],
            ['ENE-032', null, 'Energy Efficiency Audit', $ind['energy-utilities'], 'Electricity Generation', 'audit', null, 'sellable', ['R' => 1, 'Q' => 0, 'E' => 1, 'L' => 0, 'V' => 1, 'W' => 0], 3200, 3900, [], []],
            ['HCT-078', null, 'Private Hospital Compliance Audit', $ind['health-pharmaceuticals'], 'Hospitals & Clinics', 'audit', null, 'sellable', ['R' => 3, 'Q' => 3, 'E' => 3, 'L' => 3, 'V' => 2, 'W' => 1], 18600, 38000, [], []],
            ['FIN-210', null, 'Retail Cash Flow Model', $ind['financial-services'], 'Banking & Credit', 'model', null, 'sellable', ['R' => 1, 'Q' => 1, 'E' => 1, 'L' => 1, 'V' => 1, 'W' => 0], 2400, 2950, [], []],
            ['RET-118', null, 'Retail Customer Insights Sprint', $ind['retail-consumer-commerce'], 'Retail Stores & Chains', 'research', null, 'sellable', ['R' => 0, 'Q' => 1, 'E' => 1, 'L' => 0, 'V' => 1, 'W' => 0], 3800, 5900, [], []],
            ['TOU-014', null, 'Tourism Opportunity Scan', $ind['tourism-hospitality'], 'Accommodation', 'research', null, 'sellable', ['R' => 0, 'Q' => 0, 'E' => 1, 'L' => 0, 'V' => 1, 'W' => 0], 2900, 4200, [], []],
            // Blocked / restricted register
            ['FIN-330', null, 'Independent Investment Advice Sprint', $ind['financial-services'], 'Investment Management', 'advisory', null, 'blocked', ['R' => 4, 'Q' => 4, 'E' => 2, 'L' => 3, 'V' => 2, 'override' => true], null, null, ['block_status' => 'under_review', 'block_reason' => 'Regulated activity – FAIS licence required', 'client_message' => 'Requires licensed financial adviser. Contact TBCA Advisor.', 'blocked_on' => '2026-08-14', 'review_by' => '2026-08-21'], ['industry_label' => 'Financial Services']],
            ['AUD-210', null, 'Statutory Audit – Listed Entities', $ind['professional-services'], 'Public Companies', 'audit', null, 'blocked', ['R' => 4, 'Q' => 4, 'E' => 3, 'L' => 3, 'V' => 2, 'override' => true], null, null, ['block_status' => 'active', 'block_reason' => 'Reserved for registered auditors', 'client_message' => 'This engagement is by reference to a registered auditor.', 'blocked_on' => '2026-08-12'], ['industry_label' => 'Audit & Assurance']],
            ['TAX-145', null, 'Tax Opinion – Cross Border', $ind['professional-services'], 'International Tax', 'opinion', null, 'blocked', ['R' => 3, 'Q' => 4, 'E' => 2, 'L' => 3, 'V' => 2, 'override' => true], null, null, ['block_status' => 'active', 'block_reason' => 'Opinion beyond permitted scope', 'client_message' => 'Professional advice required. Speak to a TBCA tax adviser.', 'blocked_on' => '2026-08-10'], ['industry_label' => 'Tax Advisory']],
            ['LEG-075', null, 'Litigation Representation (South Africa)', $ind['professional-services'], 'Litigation', 'legal', null, 'blocked', ['R' => 4, 'Q' => 4, 'E' => 2, 'L' => 3, 'V' => 2, 'override' => true], null, null, ['block_status' => 'under_review', 'block_reason' => 'Attorney conduct rules – per se conflict', 'client_message' => 'This work must be undertaken by an attorney.', 'blocked_on' => '2026-08-09', 'review_by' => '2026-08-18'], ['industry_label' => 'Legal Services']],
            ['ENV-060', null, 'Environmental Authorisation (Full EIA)', $ind['energy-utilities'], 'Authorisations', 'permit', null, 'restricted', ['R' => 3, 'Q' => 3, 'E' => 3, 'L' => 2, 'V' => 2], 22000, 34000, ['block_status' => 'active', 'block_reason' => 'Regulator discretion and site specific', 'client_message' => 'Subject to regulator requirements and site conditions.', 'blocked_on' => '2026-08-07'], ['industry_label' => 'Environmental Services']],
            ['BST-120', null, 'Business Rescue – Act 71 Engagement', $ind['professional-services'], 'Rescue', 'advisory', null, 'restricted', ['R' => 3, 'Q' => 3, 'E' => 2, 'L' => 3, 'V' => 2], 30000, 52000, ['block_status' => 'active', 'block_reason' => 'Court supervision and eligibility', 'client_message' => 'Engagement subject to court approval and practitioner availability.', 'blocked_on' => '2026-08-05'], ['industry_label' => 'Business Rescue Advisory']],
            ['COM-410', null, 'Competition Filing – Large Merger', $ind['professional-services'], 'Competition', 'filing', null, 'restricted', ['R' => 3, 'Q' => 3, 'E' => 2, 'L' => 2, 'V' => 2], 26000, 42000, ['block_status' => 'active', 'block_reason' => 'Notification thresholds apply', 'client_message' => 'Threshold and timing assessment required.', 'blocked_on' => '2026-08-03'], ['industry_label' => 'Specialist Compliance']],
            ['LAB-090', null, 'Collective Bargaining Strategy', $ind['professional-services'], 'Industrial Relations', 'advisory', null, 'restricted', ['R' => 2, 'Q' => 2, 'E' => 2, 'L' => 2, 'V' => 1], 9000, 14500, ['block_status' => 'active', 'block_reason' => 'Adviser independence required', 'client_message' => 'Subject to adviser independence checks.', 'blocked_on' => '2026-08-01'], ['industry_label' => 'Labour & Employment']],
            // Classification queue
            ['ICT-220', null, 'Cyber Risk Assessment', $ind['technology-ict-digital'], 'Cybersecurity', 'assessment', null, 'sellable', ['R' => 1, 'Q' => 2, 'E' => 2, 'L' => 2, 'V' => 1], 7800, 11200, [], ['classification_state' => 'HUMAN_REVIEW', 'classification_method' => 'AI_SEMANTIC', 'ai_confidence' => 0.934]],
            ['EDU-015', null, 'Private School Registration Support', $ind['education-skills'], 'Basic Education', 'support', null, 'sellable', ['R' => 2, 'Q' => 1, 'E' => 2, 'L' => 1, 'V' => 1], 5200, 7800, [], ['classification_state' => 'AI_CANDIDATE', 'classification_method' => 'AI_SEMANTIC', 'ai_confidence' => 0.981]],
            ['GEN-501', null, 'Board Pack Sprint', null, null, 'governance', null, 'sellable', ['R' => 0, 'Q' => 1, 'E' => 1, 'L' => 1, 'V' => 1], 4200, 6500, [], ['classification_state' => 'UNCLASSIFIED']],
            ['GEN-502', null, 'Stakeholder Alignment Sprint', null, null, 'advisory', null, 'sellable', ['R' => 0, 'Q' => 0, 'E' => 1, 'L' => 0, 'V' => 1], 3600, 5400, [], ['classification_state' => 'AI_CANDIDATE', 'classification_method' => 'AI_SEMANTIC', 'ai_confidence' => 0.912]],
            ['PRC-077', null, 'Property Development Feasibility', $ind['property-construction'], 'Property Development', 'feasibility', null, 'sellable', ['R' => 2, 'Q' => 2, 'E' => 2, 'L' => 2, 'V' => 1], 11200, 16400, [], ['classification_state' => 'RECLASSIFICATION_REQUIRED', 'classification_method' => 'HUMAN_CLASSIFIED']],
        ];

        foreach ($rows as [$code, $slug, $title, $industryId, $sub, $type, $price, $state, $drivers, $base, $guidance, $block, $extra]) {
            Sku::updateOrCreate(['code' => $code], array_merge([
                'industry_id' => $industryId, 'slug' => $slug, 'title' => $title, 'sub_industry' => $sub, 'product_type' => $type,
                'price_zar' => $price, 'sale_state' => $state, 'drivers' => $drivers, 'base_cost_zar' => $base, 'guidance_price_zar' => $guidance,
                'classification_state' => 'APPROVED', 'classification_method' => 'HUMAN_CONFIRMED', 'public' => $slug !== null,
            ], $block, $extra));
        }
    }

    private function regulators(): void
    {
        foreach ([
            ['Auditing & Assurance Standards Board', 'AASB', 'Standards Setter', 'Audit & Assurance', 'Opinion', 'active', '31 Dec 2026', 'yes'],
            ['Independent Regulatory Board for Auditors', 'IRBA', 'Regulatory Body', 'Audit & Assurance', 'Permission', 'active', '30 Jun 2027', 'yes'],
            ['South African Revenue Service', 'SARS', 'Government Authority', 'Tax Advisory, Customs', 'Opinion / Guidance', 'active', 'Continuous', 'yes'],
            ['Companies and Intellectual Property Commission', 'CIPC', 'Government Authority', 'Corporate Governance', 'Information / Requirements', 'active', 'Continuous', 'yes'],
            ['Financial Sector Conduct Authority', 'FSCA', 'Regulatory Body', 'Financial Services', 'Permission', 'under_review', '15 Sep 2026', 'yes'],
            ['Independent Communications Authority of SA', 'ICASA', 'Regulatory Body', 'ICT & Digital Services', 'Permission / Approval', 'active', '28 Feb 2027', 'yes'],
            ['Department of Labour', 'DoL', 'Government Authority', 'Labour & Employment', 'Requirements', 'active', 'Continuous', 'yes'],
            ['Competition Commission South Africa', 'CCSA', 'Regulatory Body', 'All Sectors', 'Guidance', 'active', 'Continuous', 'yes'],
            ['National Environmental Management Authority', 'NEMA', 'Regulatory Body', 'Environment', 'Permission', 'under_review', '20 Oct 2026', 'conditional'],
            ['Prudential Authority', 'PA', 'Regulatory Body', 'Financial Services', 'Permission', 'active', '31 Mar 2027', 'no'],
            ['Health Professions Council of SA', 'HPCSA', 'Regulatory Body', 'Health & Social Care', 'Permission', 'conditional', '30 Nov 2026', 'conditional'],
            ['Information Regulator', 'InfoReg', 'Regulatory Body', 'All Sectors', 'Guidance', 'active', 'Continuous', 'yes'],
            ['Department of Agriculture, Land Reform and Rural Development', 'DALRRD', 'Government Authority', 'Agriculture', 'Requirements', 'active', 'Continuous', 'yes'],
            ['Legal Practice Council', 'LPC', 'Regulatory Body', 'Legal Services', 'Permission', 'expired', '30 Jun 2026', 'no'],
        ] as [$name, $acr, $type, $sectors, $perm, $op, $renew, $allows]) {
            Regulator::updateOrCreate(['acronym' => $acr], [
                'name' => $name, 'type' => $type, 'sectors' => $sectors, 'jurisdiction' => 'South Africa', 'permissions' => $perm,
                'opinion_status' => $op, 'renewal' => $renew, 'allows_sprints' => $allows, 'status' => 'active',
            ]);
        }
    }

    private function misdeclarations(): void
    {
        foreach ([
            ['MDV-2026-0187', 'FIN-330', 'Independent Investment Advice Sprint', 'Alpha Holdings (Pty) Ltd', 'Financial Services', 'General Business', 'high', 'under_review', 'P. Naidoo', -2],
            ['MDV-2026-0182', 'TAX-145', 'Tax Opinion – Cross Border', 'Beta Traders (Pty) Ltd', 'Financial Services', 'General Business', 'high', 'under_review', 'S. Mthembu', -1],
            ['MDV-2026-0179', 'AUD-210', 'Statutory Audit – Listed Entities', 'Gamma Limited', 'Financial Services', 'General Business', 'high', 'information_requested', 'L. Mokoena', 0],
            ['MDV-2026-0174', 'LEG-075', 'Litigation Representation (South Africa)', 'Delta Group (Pty) Ltd', 'Legal Services', 'Consulting Services', 'medium', 'assigned', 'T. Dlamini', 2],
            ['MDV-2026-0173', 'ENV-060', 'Environmental Authorisation (Full EIA)', 'EnviroCo (Pty) Ltd', 'Environmental Services', 'General Business', 'medium', 'under_review', 'N. Dube', 3],
            ['MDV-2026-0171', 'COM-410', 'Competition Filing – Large Merger', 'RetailCo (Pty) Ltd', 'Legal Services', 'General Business', 'medium', 'pending_evidence', 'P. Naidoo', 4],
            ['MDV-2026-0168', 'ICT-220', 'Cyber Risk Assessment', 'TechNova (Pty) Ltd', 'ICT & Digital Services', 'General Business', 'low', 'new', 'R. Isaacs', 6],
            ['MDV-2026-0165', 'HCT-078', 'Private Hospital Compliance Audit', 'CareWell Hospitals (Pty) Ltd', 'Health & Social Care', 'General Business', 'low', 'new', 'S. Mthembu', 6],
            ['MDV-2026-0162', 'EDU-015', 'Private School Registration Support', 'Bright Future Schools', 'Education', 'General Business', 'low', 'information_requested', 'T. Dlamini', 7],
            ['MDV-2026-0159', 'BST-120', 'Business Rescue – Act 71 Engagement', 'Heritage Textiles (Pty) Ltd', 'Financial Services', 'General Business', 'high', 'under_review', 'L. Mokoena', 8],
            ['MDV-2026-0151', 'RET-118', 'Retail Customer Insights Sprint', 'Shoprite Franchisee Group', 'Retail & Consumer Commerce', 'General Business', 'low', 'reclassified', 'R. Isaacs', -12],
        ] as [$id, $sku, $title, $client, $sus, $dec, $pri, $status, $who, $days]) {
            Misdeclaration::updateOrCreate(['case_id' => $id], [
                'sku_code' => $sku, 'sprint_title' => $title, 'client' => $client, 'suspected_industry' => $sus, 'declared_industry' => $dec,
                'priority' => $pri, 'status' => $status, 'assigned_to' => $who, 'due_on' => today()->addDays($days),
                'resolved_at' => $status === 'reclassified' ? now()->subDays(10) : null,
                'resolution' => $status === 'reclassified' ? 'Reclassified to Retail & Consumer Commerce' : null,
            ]);
        }
    }

    private function benchmarks(): void
    {
        $ind = Industry::pluck('id', 'slug');
        $agriBands = [
            ['metric' => 'Gross Margin (%)', 'low' => '18%', 'high' => '34%', 'value' => '26.4%', 'icon' => 'leaf'],
            ['metric' => 'Operating Expense (%)', 'low' => '12%', 'high' => '26%', 'value' => '18.9%', 'icon' => 'pie-chart'],
            ['metric' => 'EBITDA Margin (%)', 'low' => '8%', 'high' => '20%', 'value' => '13.2%', 'icon' => 'trending-up'],
            ['metric' => 'Asset Turnover (x)', 'low' => '0.6x', 'high' => '1.2x', 'value' => '0.88x', 'icon' => 'layers'],
            ['metric' => 'Revenue per Employee (ZAR)', 'low' => '250k', 'high' => '650k', 'value' => '412k', 'icon' => 'user'],
        ];

        foreach ([
            ['Banking', 'Cost to Serve (ZAR)', 'Cost Benchmark', 20, 5, 70, 34, 8, 78, 'No cell < 5; No client > 20%', false, null, false, 'financial-services', null],
            ['Retail', 'Gross Margin (%)', 'Margin Benchmark', 25, 7, 75, 41, 9, 81, 'No cell < 5; No client > 20%', false, null, false, 'retail-consumer-commerce', null],
            ['Manufacturing', 'Labour Productivity (Index)', 'Productivity Benchmark', 30, 7, 70, 22, 6, 64, 'No cell < 7; No client > 15%', false, null, false, 'manufacturing-industrial', null],
            ['Construction', 'Project Overrun (%)', 'Project Benchmark', 15, 5, 60, 11, 4, 52, 'No cell < 5; No client > 20%', false, null, false, 'property-construction', null],
            ['Healthcare', 'Patient Cost per Case (ZAR)', 'Cost Benchmark', 18, 6, 65, 19, 6, 66, 'No cell < 6; No client > 20%', false, null, true, 'health-pharmaceuticals', null],
            ['Insurance', 'Claims Ratio (%)', 'Cost Benchmark', 25, 7, 75, 30, 8, 77, 'No cell < 7; No client > 15%', false, null, false, 'financial-services', null],
            ['ICT & Digital', 'IT Spend as % Revenue', 'Cost Benchmark', 22, 6, 70, 26, 7, 72, 'No cell < 6; No client > 20%', true, 'Client concentration > 20%', false, 'technology-ict-digital', null],
            ['Agriculture', 'Agri-Business Sector Benchmark', 'Operational Benchmark', 30, 10, 60, 42, 8, 58, 'No cell < 5; No client > 20%', false, null, false, 'agriculture-agro-industry', $agriBands],
            ['Energy', 'Revenue per Site', 'Operational Benchmark', 20, 5, 60, 9, 3, 41, 'No cell < 5; No client > 20%', true, 'n < minimum threshold', false, 'energy-utilities', null],
            ['Consumer Goods', 'Inventory Days', 'Operational Benchmark', 20, 5, 60, 48, 11, 83, 'No cell < 5; No client > 20%', false, null, false, 'retail-consumer-commerce', null],
        ] as $i => [$sector, $name, $type, $n, $k, $div, $nc, $kc, $dc, $rule, $sup, $reason, $review, $slug, $bands]) {
            Benchmark::updateOrCreate(['sector' => $sector, 'name' => $name], [
                'industry_id' => $ind[$slug] ?? null, 'type' => $type, 'min_n' => $n, 'min_k' => $k, 'min_diversity' => $div,
                'n_current' => $nc, 'k_current' => $kc, 'diversity_current' => $dc, 'suppression_rule' => $rule,
                'suppressed' => $sup, 'suppression_reason' => $reason, 'under_review' => $review,
                'last_review' => Carbon::parse('2026-05-12')->subDays($i), 'next_review' => Carbon::parse('2026-11-10')->subDays($i), 'bands' => $bands,
            ]);
        }
    }

    private function whatsapp(): void
    {
        foreach ([
            ['WA-IN-001', 'Welcome & How We Help', 'Welcome / Orientation', 'All (17)', 'S0', 'Informational'],
            ['WA-IN-002', 'Industry Selection Support', 'Selection Guidance', 'All (17)', 'S0 – S1', 'Informational'],
            ['WA-IN-003', 'Control Resolution Reminder', 'Action Reminder', 'All (17)', 'S2 – S3', 'Reminder'],
            ['WA-IN-004', 'Engagement Setup Next Steps', 'Guidance', 'All (17)', 'S3 – S4', 'Informational'],
            ['WA-IN-005', 'Compliance & Monitoring Alerts', 'Regulatory / Compliance', 'All (17)', 'S4 – S8', 'Reminder'],
            ['WA-IN-006', 'Professional Route Guidance', 'Routing Guidance', 'Regulated Only', 'S2 – S6', 'Informational'],
            ['WA-IN-007', 'Risk / Data Quality Alert', 'Risk Notification', 'All (17)', 'S1 – S8', 'Alert'],
            ['WA-IN-008', 'Human Support Escalation', 'Support', 'All (17)', 'S0 – S8', 'Support'],
            ['WA-IN-009', 'Benchmark Contribution Invite', 'Opt-In Invitation', 'All (17)', 'S4 – S8', 'Support'],
            ['WA-IN-010', 'General Help & FAQs', 'General Support', 'All (17)', 'S0 – S8', 'Informational'],
        ] as $i => [$code, $name, $intent, $inds, $stages, $type]) {
            WhatsAppFlow::updateOrCreate(['code' => $code], ['area' => 'industries', 'name' => $name, 'intent' => $intent, 'industries' => $inds, 'stages' => $stages, 'message_type' => $type, 'status' => 'active', 'language' => 'EN', 'usage_30d' => 1200 - $i * 70]);
        }
        foreach ([
            ['WA-RS-001', 'Welcome & Opt-in', 'Welcome', 12842], ['WA-RS-002', 'Resource Delivery', 'Delivery', 18763], ['WA-RS-003', 'Nurture – Tip of the Day', 'Nurture', 9152],
            ['WA-RS-004', 'Event Invitation', 'Nurture', 3214], ['WA-RS-005', 'Re-engagement', 'Re-engage', 4328], ['WA-RS-006', 'Conversion Nudge', 'Conversion', 2912],
        ] as [$code, $name, $type, $usage]) {
            WhatsAppFlow::updateOrCreate(['code' => $code], ['area' => 'resources', 'name' => $name, 'intent' => $type, 'industries' => 'All', 'stages' => null, 'message_type' => $type, 'status' => 'active', 'language' => 'EN', 'usage_30d' => $usage]);
        }
        foreach ([
            ['2026-05-21 10:24', 'Mandisa Khumalo', '+27 82 123 4567', 'SME Nurture Flow', 'Business Plan Template', 'Template', true, false],
            ['2026-05-21 10:22', 'James Ngwenya', '+27 71 987 6543', 'Financial Literacy', 'Cash Flow Calculator', 'Tool', true, true],
            ['2026-05-21 10:21', 'Priya Thakur', '+27 63 555 9821', 'Legal Essentials', 'Tax Compliance Checklist', 'Checklist', false, false],
            ['2026-05-21 10:18', 'Sipho Dlamini', '+27 76 234 5678', 'SME Nurture Flow', 'Marketing Plan Template', 'Template', true, false],
            ['2026-05-21 10:16', 'Aisha Seedat', '+27 72 345 6789', 'Re-engagement', 'POPIA Consent Guide', 'Guide', true, false],
        ] as [$at, $contact, $phone, $camp, $res, $type, $eng, $conv]) {
            WhatsAppDelivery::updateOrCreate(['sent_at' => $at, 'contact' => $contact], ['phone' => $phone, 'campaign' => $camp, 'resource' => $res, 'type' => $type, 'status' => 'delivered', 'engaged' => $eng, 'converted' => $conv]);
        }
    }

    private function resources(): void
    {
        $owners = ['Lerato M.', 'Sipho N.', 'Thandiwe P.', 'David K.', 'Finance Content Team'];
        $cases = ResourceRegister::caseStudies();
        $roi = [
            'business-plan-template' => [186432, 72481, 2381, 1684920],
            'capital-readiness-guide' => [154821, 61233, 2122, 1452340],
            'cash-flow-calculator' => [142773, 58201, 1812, 1128630],
            'tax-compliance-guide-sa' => [98642, 40332, 1245, 987210],
            'market-entry-report-kenya' => [76284, 32881, 987, 865540],
        ];

        $replacements = [];
        $n = 100;
        foreach (ResourceRegister::rows() as [$slug, $title, $type, $collection, $category, $format, $minutes, $pages, $summary, $access, $price, $list, $source, $risk, $rev, $next, $state, $flags, $downloads, $extra]) {
            $n++;
            $meta = array_intersect_key($extra, array_flip(['use_time', 'highlights', 'first_published', 'last_reviewed', 'retired_on', 'retired_reason', 'audience', 'topics']));
            if (isset($cases[$slug])) {
                $meta = array_merge($meta, $cases[$slug]);
            }
            $metrics = isset($roi[$slug])
                ? ['views' => $roi[$slug][0], 'users' => $roi[$slug][1], 'conversions' => $roi[$slug][2], 'revenue' => $roi[$slug][3]]
                : ['views' => $downloads * 38 + 400, 'users' => $downloads * 15 + 150, 'conversions' => (int) round($downloads * 0.4), 'revenue' => (int) round($downloads * 210)];

            $resource = Resource::updateOrCreate(['slug' => $slug], [
                'record_id' => $extra['record_id'] ?? sprintf('RS-2026-%s-%05d', strtoupper(substr($type, 0, 2)), $n),
                'title' => $title, 'type' => $type, 'collection' => $collection, 'category' => $category,
                'industries' => $extra['industries'] ?? [], 'countries' => ['South Africa'],
                'format' => $format, 'minutes' => $minutes, 'pages' => $pages, 'file_size' => $extra['file_size'] ?? null,
                'summary' => $summary, 'meta_description' => mb_substr($summary, 0, 158),
                'body' => ResourceRegister::body($slug, $title, $type, $summary),
                'access' => $access, 'price_zar' => $price, 'list_price_zar' => $list,
                'source' => $source, 'source_basis' => $extra['boundary_note'] ?? null ? 'Primary Research' : $source, 'source_count' => $extra['source_count'] ?? 6,
                'risk_class' => $risk,
                'reviewed_at' => today()->addDays($rev), 'next_review_at' => $next === null ? null : today()->addDays($next),
                'restricted' => in_array('restricted', $flags, true),
                'human_review' => $state === 'draft' ? 'pending' : 'completed',
                'ai_assisted' => in_array('ai', $flags, true),
                'publish_state' => $state,
                'published_at' => in_array($state, ['published', 'retired', 'archived'], true) ? today()->addDays($rev) : null,
                'retired_at' => $extra['retired_on'] ?? null, 'retired_reason' => $extra['retired_reason'] ?? null,
                'version' => match (true) { $downloads > 2000 => '3.0', $downloads > 1000 => '2.1', default => '1.'.($n % 4) },
                'owner' => $owners[$n % count($owners)], 'editor' => 'Lebo Mokoena', 'reviewer' => 'Sipho Dlamini',
                'boundary_rule' => match ($access) { 'free', 'gated' => 'Rule 1: Public Knowledge', 'restricted' => 'Rule 5: Protected Services', default => 'Rule 3: Monetised Offerings' },
                'boundary_note' => $extra['boundary_note'] ?? null, 'linked_product' => $extra['linked_product'] ?? null,
                'protected' => in_array('protected', $flags, true) || $access === 'restricted',
                'featured' => in_array('featured', $flags, true), 'editors_pick' => in_array('editors_pick', $flags, true), 'popular' => in_array('popular', $flags, true),
                'download_count' => $downloads, 'view_count' => $metrics['views'], 'metrics' => $metrics, 'meta' => $meta ?: null,
            ]);

            if (isset($extra['replacement'])) {
                $replacements[$slug] = $extra['replacement'];
            }
        }

        foreach ($replacements as $slug => $rep) {
            Resource::where('slug', $slug)->update(['replacement_id' => Resource::where('slug', $rep)->value('id')]);
        }

        $cf = Resource::where('slug', 'cash-flow-forecast-template')->first();
        foreach ([
            ['Cash Flow Forecast Template (XLSX)', 'Template', '1.3', 'gated'], ['Cash Flow Forecast Template – Guide', 'Toolkit', '1.2', 'free'],
            ['How to Use the Cash Flow Template', 'Guide', '1.1', 'free'], ['Cash Flow Forecast – Example Dataset', 'Dataset', '1.0', 'gated'],
            ['Cash Flow Forecast – Walkthrough Video', 'Video', '1.0', 'free'], ['Cash Flow Forecast – FAQs', 'FAQ', '1.0', 'free'],
        ] as [$name, $type, $v, $acc]) {
            ResourceAsset::updateOrCreate(['resource_id' => $cf->id, 'name' => $name], ['type' => $type, 'version' => $v, 'access' => $acc, 'status' => 'published']);
        }
    }

    private function webinars(): void
    {
        $gains = ['Practical framework you can apply immediately', 'Tools and templates to use after the session', 'Checklist you can use immediately', 'Live Q&A with our expert'];
        foreach (ResourceRegister::webinars() as [$slug, $title, $tag, $summary, $speaker, $role, $topic, $days, $hour, $mins, $cpd, $icon]) {
            $starts = today()->addDays($days)->setTime($hour, 0);
            Webinar::updateOrCreate(['slug' => $slug], [
                'title' => $title, 'tagline' => $tag, 'summary' => $summary, 'speaker' => $speaker, 'speaker_role' => $role, 'topic' => $topic,
                'audience' => $topic === 'Finance' ? 'SMEs & Founders' : 'All Audiences', 'starts_at' => $starts, 'duration_minutes' => $mins, 'cpd' => $cpd, 'icon' => $icon,
                'gains' => $slug === 'cash-flow-that-works' ? ['Practical framework to improve cash flow', 'Tools to manage working capital effectively', 'Checklist you can use immediately', 'Live Q&A with our finance expert'] : $gains,
                'review_due' => $starts->copy()->addYear(),
            ]);
        }
    }

    private function faqs(): void
    {
        foreach (ResourceRegister::faqs() as $i => [$q, $a, $topic, $geo, $steps, $related]) {
            Faq::updateOrCreate(['question' => $q], ['answer' => $a, 'topic' => $topic, 'geo' => $geo, 'steps' => $steps, 'related' => $related, 'sort' => $i]);
        }
    }

    private function aiOutputs(): void
    {
        foreach ([
            ['AI-0008742', 'Business Plan Template', 'Executive summary draft', 'Template', 'GPT-4o', 'Generate executive summary for business plan template for SMEs.', 'Mandisa K.', '2026-05-20 10:24', 'approved', 'low', 'Sipho N.', '2026-05-20 11:02'],
            ['AI-0008741', 'Cash Flow Guide', 'Section 2 draft', 'Guide', 'Claude 3.5', 'Draft section on operating cash flows for a cash flow guide.', 'Priya T.', '2026-05-20 09:18', 'under_review', 'medium', null, null],
            ['AI-0008740', 'Tax Compliance Checklist (SA)', 'Checklist items', 'Checklist', 'GPT-4o', 'Create checklist for tax compliance for small businesses in SA.', 'David L.', '2026-05-19 16:45', 'approved', 'low', 'Aisha S.', '2026-05-19 17:20'],
            ['AI-0008739', 'Marketing Email Sequence', '5-part nurture sequence', 'Email', 'Gemini 1.5', 'Create 5-part email sequence for SME marketing nurture campaign.', 'James N.', '2026-05-19 14:12', 'rejected', 'high', 'Sipho N.', '2026-05-19 15:05'],
            ['AI-0008738', 'POPIA Consent Clause', 'Website clause draft', 'Legal Text', 'Claude 3.5', 'Draft POPIA consent clause for website forms.', 'Mandisa K.', '2026-05-19 11:27', 'approved', 'low', 'David L.', '2026-05-19 12:10'],
            ['AI-0008737', 'Quarterly Budget Planner', 'Spreadsheet content', 'Tool', 'GPT-4o', 'Create budget planner categories and descriptions.', 'Priya T.', '2026-05-18 10:05', 'under_review', 'medium', null, null],
            ['AI-0008736', 'Industry Benchmark Note', 'Retail sector note', 'Report', 'Perplexity', 'Write benchmark note for retail sector in South Africa.', 'David L.', '2026-05-18 09:22', 'approved', 'low', 'Sipho N.', '2026-05-18 10:31'],
            ['AI-0008735', 'Employee Handbook Section', 'Leave policy draft', 'Policy', 'Gemini 1.5', 'Draft leave policy section for employee handbook.', 'James N.', '2026-05-17 15:30', 'rejected', 'high', 'Sipho N.', '2026-05-17 16:18'],
            ['AI-0008734', 'Investor Readiness Insight', 'Founder checklist', 'Article', 'Claude 3.5', 'Draft checklist of founder readiness gaps before capital raise.', 'Mandisa K.', '2026-05-17 09:12', 'under_review', 'critical', null, null],
        ] as [$id, $title, $subject, $type, $model, $prompt, $by, $at, $status, $risk, $rev, $revAt]) {
            AiOutput::updateOrCreate(['output_id' => $id], ['title' => $title, 'subject' => $subject, 'content_type' => $type, 'model' => $model, 'prompt' => $prompt, 'created_by' => $by, 'status' => $status, 'risk' => $risk, 'reviewed_by' => $rev, 'reviewed_at' => $revAt, 'created_at' => $at]);
        }
    }

    private function consents(): void
    {
        foreach ([
            ['U-0001247', 'Mandisa Khumalo', 'mandisa.k@mail.com', 'newsletters', 'consent', 'web', '2026-05-10 09:14', 'granted', '2027-05-10'],
            ['U-0001248', 'James Ngwenya', 'james.ngwenya@mail.com', 'essential', 'contract', 'web', '2026-05-08 14:22', 'granted', null],
            ['U-0001249', 'Priya Thakur', 'priya.t@mail.com', 'analytics', 'consent', 'mobile', '2026-05-05 11:03', 'expired', '2026-05-05'],
            ['U-0001250', 'David Louw', 'david.louw@mail.com', 'partners', 'consent', 'web', '2026-05-02 16:45', 'withdrawn', null],
            ['U-0001251', 'Aisha Seedat', 'aisha.seedat@mail.com', 'newsletters', 'consent', 'whatsapp', '2026-04-30 13:32', 'granted', '2027-04-30'],
            ['U-0001252', 'Robert Williams', 'robert.w@mail.com', 'essential', 'contract', 'web', '2026-04-28 09:20', 'granted', null],
            ['U-0001253', 'Zanele Dlamini', 'zanele.d@mail.com', 'analytics', 'consent', 'mobile', '2026-04-20 08:41', 'pending', null],
            ['U-0001254', 'Benjamin Tshiabala', 'benjamin.t@mail.com', 'partners', 'consent', 'web', '2026-04-15 12:05', 'withdrawn', null],
        ] as [$ref, $name, $email, $purpose, $basis, $channel, $at, $state, $exp]) {
            Consent::updateOrCreate(['email' => $email, 'purpose' => $purpose], [
                'subject_ref' => $ref, 'name' => $name, 'legal_basis' => $basis, 'channel' => $channel, 'state' => $state,
                'granted_at' => $state === 'pending' ? null : $at, 'expires_at' => $exp, 'withdrawn_at' => $state === 'withdrawn' ? Carbon::parse($at)->addDay() : null,
                'created_at' => $at,
            ]);
        }
    }

    /** Demo client workspace: engagement, ledger, gates, evidence, obligations, entitlements, subscription. */
    private function clientData(): void
    {
        $client = User::where('email', 'amahle@agritechsa.co.za')->first();
        if (! $client) {
            return;
        }
        $agri = Industry::where('slug', 'agriculture-agro-industry')->first();

        $e = Engagement::updateOrCreate(['reference' => 'AGRI-2026-EGY-001'], [
            'user_id' => $client->id, 'industry_id' => $agri->id, 'sub_industry' => 'Crop Production', 'country' => 'Egypt',
            'title' => 'Market Intelligence Report', 'stage' => 'S5', 'status' => 'active', 'total_fee_zar' => 85000,
            'due_on' => '2026-05-30', 'progress' => 46, 'letter_status' => 'signed', 'letter_signed_at' => '2026-05-18 12:00', 'route_status' => 'pending',
            'created_at' => '2026-05-18 10:00',
            'data' => [
                'stage_label' => 'S5 – Reports',
                'timeline' => [
                    ['title' => 'Country Selection & Fee Sweep', 'status' => 'completed', 'date' => '18 May 2026'],
                    ['title' => 'Market Intelligence Access Activated', 'status' => 'completed', 'date' => '19 May 2026'],
                    ['title' => 'Sector Analysis', 'status' => 'in_progress', 'date' => 'Due: 25 May 2026'],
                    ['title' => 'Market Intelligence Report (Draft)', 'status' => 'pending', 'date' => 'Due: 28 May 2026'],
                    ['title' => 'Report Delivery & Acceptance (Gate G5)', 'status' => 'pending', 'date' => 'Due: 30 May 2026'],
                ],
                'activity' => [
                    ['title' => 'Payment received', 'text' => 'R25,000.00 via Visa **** 4242', 'at' => '25 May 2026, 11:02 AM', 'icon' => 'check'],
                    ['title' => 'Sector Analysis started', 'text' => 'Task assigned to TBCA Analyst', 'at' => '20 May 2026, 09:15 AM', 'icon' => 'file'],
                    ['title' => 'Document uploaded', 'text' => 'Crop Production Policy Summary.pdf', 'at' => '19 May 2026, 04:45 PM', 'icon' => 'upload'],
                    ['title' => 'New message from TBCA Advisor', 'text' => 'RE: Data clarification request', 'at' => '19 May 2026, 03:22 PM', 'icon' => 'message'],
                    ['title' => 'Task completed', 'text' => 'Data Provider Verification', 'at' => '18 May 2026, 02:10 PM', 'icon' => 'check'],
                ],
                'documents' => [
                    ['title' => 'Engagement Letter', 'file' => 'AGRI-2026-EGY-001-EL.pdf', 'status' => 'Signed'],
                    ['title' => 'Scope of Work (Schedule 1)', 'file' => 'SOW-AGRI-2026-EGY-001.pdf', 'status' => 'Signed'],
                    ['title' => 'Fee Schedule (Schedule 2)', 'file' => 'Fees-AGRI-2026-EGY-001.pdf', 'status' => 'Active'],
                    ['title' => 'Industry Classification Report', 'file' => 'Industry-Classification-Report.pdf', 'status' => 'View'],
                    ['title' => 'Confidentiality & Data Policy', 'file' => 'Data-Policy-Agreement.pdf', 'status' => 'Signed'],
                ],
                'deliverables' => [
                    ['title' => 'Country Selection & Fee Sweep (Egypt)', 'target' => 'Within 2 days of instruction'],
                    ['title' => 'Market Intelligence Report', 'target' => 'Within 7 days of payment'],
                    ['title' => 'Sector Analysis', 'target' => 'Within 10 days of payment'],
                    ['title' => 'Risk & Policy Overview', 'target' => 'Within 10 days of payment'],
                    ['title' => 'Opportunity Assessment', 'target' => 'Within 12 days of payment'],
                ],
                'advisor' => ['name' => 'Lebo Mokoena', 'role' => 'Industry Advisory Lead', 'email' => 'lebo.mokoena@tbca.africa', 'phone' => '+27 11 123 4567'],
                'partner_scope' => [
                    ['element' => 'Regulatory classification of crop inputs', 'input' => 'Interpretation of agricultural input registration rules', 'law' => 'Egypt Agricultural Input Law No. 53 of 1966 & Executive Regulations', 'profession' => 'Agricultural Regulatory Consultant'],
                    ['element' => 'Import duties & tax implications', 'input' => 'Tax treatment and duty classification advice', 'law' => 'Egypt Customs Law & Tax Code', 'profession' => 'Tax Advisor'],
                    ['element' => 'Contract review (supplier agreements)', 'input' => 'Legal review of commercial agreements', 'law' => 'Egypt Civil Code', 'profession' => 'Legal Practitioner (Egypt)'],
                    ['element' => 'Dispute resolution options', 'input' => 'Advisory on dispute resolution mechanisms', 'law' => 'Egypt Arbitration Law No. 27 of 1994', 'profession' => 'Dispute Resolution Specialist'],
                ],
                'partners' => [
                    ['id' => 'nile-agri-regulatory', 'name' => 'Nile Agri Regulatory Consultants', 'profession' => 'Agricultural Regulatory Consultant', 'verified' => 'Verified Aug 2026', 'fee' => 18500],
                    ['id' => 'cairo-tax-partners', 'name' => 'Cairo Tax Partners', 'profession' => 'Tax Advisor', 'verified' => 'Verified Jul 2026', 'fee' => 12000],
                    ['id' => 'el-masry-legal', 'name' => 'El-Masry & Co. Attorneys', 'profession' => 'Legal Practitioner (Egypt)', 'verified' => 'Verified Jun 2026', 'fee' => 16000],
                ],
                'selected_partner' => null,
                'specialists' => [
                    ['discipline' => 'Agricultural Economics', 'name' => 'Dr. Ahmed El-Sayed', 'id' => 'SP-AG-ECO-0071', 'qualifications' => 'PhD Ag Economics, EAES Member', 'role' => 'Lead Reviewer', 'status' => 'in_review', 'signature' => null, 'date' => null],
                    ['discipline' => 'Commodity Markets', 'name' => 'Dr. Rania Hassan', 'id' => 'SP-CM-0045', 'qualifications' => 'PhD Agri Trade, IFPRI Affiliate', 'role' => 'Specialist Reviewer', 'status' => 'completed', 'signature' => 'R. Hassan', 'date' => '14 Aug 2026'],
                    ['discipline' => 'Agri Policy & Regulation', 'name' => 'Prof. Karim El-Masry', 'id' => 'SP-APR-0023', 'qualifications' => 'Prof. Agri Policy, Registered Consultant', 'role' => 'Specialist Reviewer', 'status' => 'pending', 'signature' => null, 'date' => null],
                ],
                'checklist' => [
                    ['label' => 'Scope aligns with classification and client need', 'state' => 'passed'],
                    ['label' => 'Data sources are appropriate and credible', 'state' => 'passed'],
                    ['label' => 'Methodology is defensible and transparent', 'state' => 'passed'],
                    ['label' => 'Analysis is accurate and appropriately qualified', 'state' => 'warning'],
                    ['label' => 'Limitations and assumptions clearly stated', 'state' => 'pending'],
                    ['label' => 'Conclusions are balanced and unbiased', 'state' => 'pending'],
                ],
                'client_ack' => false,
            ],
        ]);

        foreach ([
            ['2026-05-18 10:45', 'charge', 'Country Selection Fee (Egypt)', 'Country selection and fee sweep', 25000, 'paid', 'Card **** 4242'],
            ['2026-05-18 10:48', 'payment', 'Payment for Country Selection Fee', 'Payment received', 25000, 'completed', 'Visa •• 4242'],
            ['2026-05-19 14:15', 'charge', 'Market Intelligence Report', 'Egypt – Crop Production', 85000, 'invoiced', null],
            ['2026-05-21 11:05', 'charge', 'Advisory Call – 60 Minutes', 'Human advisory consultation', 15000, 'paid', 'Card **** 4242'],
            ['2026-05-21 11:08', 'payment', 'Payment for Advisory Call', 'Payment received', 15000, 'completed', 'Visa •• 4242'],
            ['2026-05-22 09:30', 'disbursement', 'Government Filing Fee', 'On behalf of client', 3250, 'disbursed', 'Trust Account'],
            ['2026-05-22 09:31', 'disbursement', 'Data Provider Fee', 'Third-party data licensing', 2500, 'disbursed', 'Trust Account'],
        ] as [$at, $type, $desc, $detail, $amt, $status, $method]) {
            LedgerEntry::updateOrCreate(['engagement_id' => $e->id, 'description' => $desc], ['occurred_at' => $at, 'type' => $type, 'detail' => $detail, 'amount_zar' => $amt, 'status' => $status, 'method' => $method]);
        }

        foreach ([
            ['Complete Sector Analysis', 'Deliverable: Detailed sector opportunity assessment', 'high', '2026-05-25'],
            ['Provide Additional Data', 'Supply missing production volume data', 'medium', '2026-05-23'],
            ['Policy Impact Review', 'Review recent policy changes', 'medium', '2026-05-26'],
            ['Report Review & Feedback', 'Provide feedback on draft report', 'low', '2026-05-28'],
            ['Stakeholder Identification', 'Identify key local stakeholders', 'low', '2026-05-30'],
        ] as [$t, $d, $p, $due]) {
            Task::updateOrCreate(['engagement_id' => $e->id, 'title' => $t], ['detail' => $d, 'priority' => $p, 'due_on' => $due]);
        }

        foreach ([
            ['G0', 'Consent Gate', 'S0 – Arrival & Exploration', 'completed'], ['G1', 'Registration Gate', 'S1 – Registration & Intent Capture', 'completed'],
            ['G2', 'Disclosure Gate', 'S2 – Country Selection & Fee Sweep', 'completed'], ['G3', 'Quotation Gate', 'S5 – Report Commissioning', 'completed'],
            ['G4', 'Payment Gate', 'S6 – Payment', 'pending'], ['G5', 'Acceptance Gate', 'S5 – Report Delivery', 'locked'],
            ['G6', 'Escalation Gate', 'S6+ – Human Escalation', 'locked'], ['G7', 'Specialist Gate', 'S7 – Specialist Release', 'locked'], ['G8', 'Mandate Gate', 'S8 – Capital Mandate', 'locked'],
        ] as [$code, $name, $stage, $status]) {
            Gate::updateOrCreate(['engagement_id' => $e->id, 'code' => $code], ['name' => $name, 'stage' => $stage, 'status' => $status, 'decided_at' => $status === 'completed' ? '2026-05-18 10:00' : null]);
        }

        foreach ([
            ['001', '2025 Crop Production Output Data', 'Official data on total crop production volume for key commodities.', 'Official Statistics (Government)', 'high', '2026-05-16', 12, 'requested'],
            ['002', 'Fertilizer Import Statistics', 'Import volumes and values for fertilizers used in crop production.', 'Trade Data (Customs)', 'high', '2026-05-17', 13, 'requested'],
            ['003', 'Weather Impact Report 2024/2025', 'Evidence of weather patterns and their impact on crop yields.', 'Research Report (Industry)', 'medium', '2026-05-17', 18, 'requested'],
            ['004', 'Agricultural Policy Updates', 'Recent policy changes affecting crop production and trade.', 'Official Document (Government)', 'medium', '2026-05-18', 19, 'requested'],
            ['005', 'Market Price Benchmarks 2025', 'Verified price trends for major crops in local and export markets.', 'Market Report (Private)', 'low', '2026-05-18', 23, 'requested'],
            ['006', 'Irrigation Water Allocation Records', 'Water use licence allocations for the production region.', 'Official Document (Government)', 'medium', '2026-05-10', 10, 'awaiting_review'],
            ['007', 'Packhouse Certification Status', 'GLOBALG.A.P. and HACCP certificates for partner packhouses.', 'Certification (Private)', 'high', '2026-05-10', 8, 'awaiting_review'],
            ['008', 'Export Volumes to EU 2024', 'Export volumes by crop to EU markets.', 'Trade Data (Customs)', 'high', '2026-05-02', 7, 'resolved'],
            ['009', 'Cold Chain Capacity Survey', 'Available cold storage capacity in the region.', 'Research Report (Industry)', 'medium', '2026-05-02', 9, 'resolved'],
            ['010', 'Input Cost Index', 'Seed, fertiliser and fuel cost index.', 'Market Report (Private)', 'medium', '2026-05-03', 9, 'resolved'],
            ['011', 'Land Use Zoning Confirmation', 'Zoning confirmation for production land.', 'Official Document (Government)', 'low', '2026-05-04', 10, 'resolved'],
            ['012', 'Labour Availability Statistics', 'Seasonal labour availability and wage data.', 'Official Statistics (Government)', 'low', '2026-05-04', 11, 'resolved'],
        ] as [$n, $title, $detail, $src, $impact, $req, $dueIn, $status]) {
            EvidenceRequest::updateOrCreate(['req_id' => "REQ-AGRI-2026-{$n}"], [
                'engagement_id' => $e->id, 'title' => $title, 'detail' => $detail, 'source_type' => $src, 'impact' => $impact, 'priority' => $impact,
                'requested_on' => $req, 'due_on' => Carbon::parse($req)->addDays($dueIn + 2), 'status' => $status,
                'submission' => $status === 'requested' ? null : ['note' => 'Submitted via client workspace', 'link' => 'https://example.org/evidence/'.$n, 'at' => '12 May 2026'],
            ]);
        }

        $month = today()->startOfMonth();
        foreach ([
            ['Import Permit Renewal', 'Ministry of Trade & Industry', 'renewal', 1, true],
            ['Tax Return (VAT)', 'Egyptian Tax Authority', 'filing', 5, true],
            ['Pesticide License Renewal', 'Plant Protection Administration', 'renewal', 7, true],
            ['Labour Compliance Declaration', 'Ministry of Manpower', 'filing', 13, true],
            ['Environmental Report (Annual)', 'Ministry of Environment', 'reporting', 15, true],
            ['Water Use Reporting', 'Ministry of Water Resources', 'reporting', -2, true],
            ['Crop Export Certification', 'General Organization for Export & Import Control', 'filing', 25, false],
            ['Social Insurance Contribution', 'National Organization for Social Insurance', 'payment', 28, true],
            ['Customs Broker Licence Check', 'Egyptian Customs Authority', 'renewal', 48, true],
            ['Quarterly Statistical Return', 'CAPMAS', 'reporting', 70, true],
        ] as [$title, $auth, $type, $day, $rec]) {
            $due = $day < 0 ? today()->addDays($day) : $month->copy()->addDays($day - 1);
            Obligation::updateOrCreate(['engagement_id' => $e->id, 'title' => $title], ['authority' => $auth, 'type' => $type, 'due_on' => $due, 'recurring' => $rec, 'status' => 'upcoming']);
        }
        foreach (['Business Licence Renewal', 'Annual Return Filing', 'Fire Safety Certificate', 'Q1 VAT Return', 'Phytosanitary Registration'] as $i => $title) {
            Obligation::updateOrCreate(['engagement_id' => $e->id, 'title' => $title], ['authority' => 'Various', 'type' => 'filing', 'due_on' => today()->subMonths($i + 1), 'recurring' => false, 'status' => 'completed']);
        }

        ReclassNotice::updateOrCreate(['notice_id' => 'RCN-AGRI-2026-001'], [
            'engagement_id' => $e->id, 'issued_at' => '2026-05-18 10:45', 'effective_on' => '2026-05-25',
            'previous' => ['risk' => 'Medium Risk', 'category' => 'Category B', 'score' => 52, 'confidence' => 'Medium', 'date' => '02 Feb 2026'],
            'next' => ['risk' => 'High Risk', 'category' => 'Category C', 'score' => 71, 'confidence' => 'High', 'date' => '25 May 2026'],
            'reasons' => ['Increased input cost volatility and supply chain disruptions.', 'Policy uncertainty affecting export incentives.', 'Recent incidents impacting sector productivity.'],
            'evidence' => [['title' => '2024/2025 Crop Yield Report', 'source' => 'Official Statistics (Government)'], ['title' => 'Agricultural Policy Updates – Q1 2025', 'source' => 'Official Document (Government)'], ['title' => 'Market Price Benchmarks Report', 'source' => 'Market Report (Private)']],
            'status' => 'action_required',
        ]);

        // Resources entitlements and subscription for the demo client
        $sub = Subscription::updateOrCreate(['user_id' => $client->id, 'plan' => 'premium-resources'], [
            'status' => 'active', 'billing_cycle' => 'monthly', 'amount_zar' => 522, 'started_at' => '2026-03-15', 'next_billing_at' => today()->addDays(12),
            'usage' => ['downloads' => 24, 'downloadsLimit' => 50, 'templates' => 8, 'templatesLimit' => 20, 'reports' => 3, 'reportsLimit' => 10],
        ]);
        foreach ([
            ['capital-readiness-guide', 'subscription', -20, 345], ['business-plan-template', 'one_time', -23, null], ['cash-flow-calculator', 'subscription', -25, 340],
            ['market-entry-report-kenya', 'retainer', -27, null], ['funding-readiness-checklist', 'one_time', -30, null], ['strategic-planning-starter-guide', 'free_download', -40, null],
            ['industry-insights-reports', 'subscription', -60, 18], ['kpi-dashboard-template', 'free_download', -61, null], ['investor-readiness-scorecard', 'one_time', -200, -2],
        ] as $i => [$slug, $source, $acq, $exp]) {
            $r = Resource::where('slug', $slug)->first();
            Entitlement::updateOrCreate(['user_id' => $client->id, 'resource_id' => $r->id], [
                'reference' => sprintf('ENT-DEMO-%04d', $i + 1), 'email' => $client->email, 'first_name' => strtok($client->name, ' '),
                'source' => $source, 'state' => 'active', 'content_version' => $r->version,
                'acquired_at' => today()->addDays($acq), 'expires_at' => $exp === null ? null : today()->addDays($exp),
            ]);
        }
        unset($sub);

        foreach (['essential' => 'granted', 'newsletters' => 'granted', 'webinars' => 'granted', 'offers' => 'declined', 'partners' => 'declined'] as $purpose => $state) {
            Consent::updateOrCreate(['email' => $client->email, 'purpose' => $purpose], [
                'user_id' => $client->id, 'subject_ref' => 'U-0000001', 'name' => $client->name, 'state' => $state,
                'legal_basis' => $purpose === 'essential' ? 'contract' : 'consent', 'channel' => 'web', 'granted_at' => $state === 'granted' ? '2026-05-16 09:00' : null,
            ]);
        }
    }
}
