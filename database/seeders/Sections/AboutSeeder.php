<?php

namespace Database\Seeders\Sections;

use App\Models\About\Application;
use App\Models\About\CertAsset;
use App\Models\About\Claim;
use App\Models\About\Correction;
use App\Models\About\Evidence;
use App\Models\About\Institution;
use App\Models\About\NewsItem;
use App\Models\About\StatusComponent;
use App\Models\About\StatusIncident;
use App\Models\About\Testimonial;
use App\Models\About\TrustCase;
use App\Models\About\Vacancy;
use App\Models\About\WhistleReport;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * About TBCA + Trust demo data (from the About_TBCA mockups). Idempotent.
 * Evidence and validity dates are relative to today so the register always
 * shows a realistic mix of current, expiring and expired evidence.
 */
class AboutSeeder extends Seeder
{
    public function run(): void
    {
        $assets = $this->certAssets();
        $this->claims($assets);
        $this->institutions();
        $this->testimonials();
        $this->corrections();
        $this->careers();
        $this->news();
        $this->status();
        $this->cases();
    }

    private function d(?int $days): ?string
    {
        return $days === null ? null : now()->addDays($days)->toDateString();
    }

    /** @return array<string, CertAsset> */
    private function certAssets(): array
    {
        $rows = [
            ['TM-001', 'TBCA Word Mark', 'trade_mark', 'South Africa', '2022/15478', 'CIPC Trade Marks Office', '®', '2022-04-15', '2032-04-15', 'TBCA Holdings (Pty) Ltd'],
            ['TM-002', 'TBCA Logo Mark', 'trade_mark', 'South Africa', '2022/15479', 'CIPC Trade Marks Office', '®', '2022-04-15', '2032-04-15', 'TBCA Holdings (Pty) Ltd'],
            ['TM-003', 'The Business Clinic.Africa™', 'trade_mark', 'WIPO (Madrid)', '1835123', 'WIPO Madrid System', '™', '2023-06-22', '2033-06-22', 'TBCA Holdings (Pty) Ltd'],
            ['TM-006', 'Humans Lead®', 'trade_mark', 'South Africa', '2023/04417', 'CIPC Trade Marks Office', '®', '2023-03-01', '2033-03-01', 'TBCA Holdings (Pty) Ltd'],
            ['CERT-001', 'ISO/IEC 27001:2022', 'certification', 'South Africa', 'ISOCZA27001/2025/045', 'Accredited ISMS Certification Body', null, $this->d(-600), $this->d(495), 'TBCA Operations'],
            ['CERT-002', 'ISO 9001:2015', 'certification', 'South Africa', 'QMS/2023/3891', 'Accredited QMS Certification Body', null, $this->d(-900), $this->d(120), 'TBCA Operations'],
            ['CERT-003', 'Level 1 B-BBEE Contributor', 'certification', 'South Africa', 'SANAS/BBBEE/2025/1123', 'SANAS-accredited Verification Agency', null, $this->d(-320), $this->d(45), 'TBCA Operations'],
            ['ATT-001', 'POPIA Compliance Attestation', 'attestation', 'South Africa', 'ATT-AB-001', 'TBCA Information Officer', null, $this->d(-51), $this->d(314), 'TBCA Governance'],
            ['TM-004', 'Future Builders™', 'trade_mark', 'South Africa', '2023/18890', 'CIPC Trade Marks Office', '™', '2023-07-05', $this->d(-90), 'TBCA Holdings (Pty) Ltd'],
            ['TM-005', 'AIMM™', 'trade_mark', 'WIPO (Madrid)', '1798540', 'WIPO Madrid System', '™', '2022-01-18', $this->d(-260), 'TBCA Holdings (Pty) Ltd'],
        ];

        $out = [];
        foreach ($rows as [$code, $name, $type, $jur, $reg, $issuer, $symbol, $from, $to, $owner]) {
            $out[$code] = CertAsset::updateOrCreate(['code' => $code], [
                'name' => $name, 'asset_type' => $type, 'jurisdiction' => $jur, 'registration_no' => $reg,
                'issuer' => $issuer, 'symbol' => $symbol, 'state' => 'active', 'valid_from' => $from, 'valid_to' => $to, 'owner' => $owner,
            ]);
        }

        return $out;
    }

    /** @param array<string, CertAsset> $assets */
    private function claims(array $assets): void
    {
        $ethicalPopover = [
            'overview' => [
                ['title' => 'Independent Governance', 'body' => 'Our governance framework is independently reviewed and continuously enforced.'],
                ['title' => 'Conflict of Interest Controls', 'body' => 'Strict conflict screening and management processes are in place across all engagements.'],
                ['title' => 'Ethics & Conduct', 'body' => 'All team members sign and adhere to our Code of Ethics and Conduct.'],
                ['title' => 'Third-Party Oversight', 'body' => 'Suppliers and partners are vetted against our ethical standards.'],
                ['title' => 'Whistleblowing Protection', 'body' => 'We provide a safe, anonymous channel for reporting concerns.'],
            ],
            'metrics' => [
                ['value' => '0', 'label' => 'Confirmed Breaches', 'caption' => '(Last 24 months)'],
                ['value' => '100%', 'label' => 'Team Code of Ethics Acknowledged', 'caption' => null],
                ['value' => '24/7', 'label' => 'Whistleblowing Channel Available', 'caption' => null],
            ],
            'governance' => ['Risk & Governance Committee oversight', 'Quarterly conflict-of-interest declarations', 'Independent case ownership for ethics reports'],
            'policies' => ['Code of Ethics and Conduct v2.1', 'Conflict of Interest Policy', 'Whistleblowing Policy', 'Supplier Code of Conduct'],
            'proof_points' => ['Annual ethics acknowledgement completed by all staff', 'Conflict screening logged on every engagement', 'Whistleblowing channel isolated from CRM and marketing tracking'],
        ];

        $securePopover = [
            'overview' => [
                ['title' => 'Certified ISMS', 'body' => 'Information security is managed under an ISO/IEC 27001 certified management system.'],
                ['title' => 'POPIA-aligned Processing', 'body' => 'Personal information is processed lawfully, minimally and for a stated purpose.'],
                ['title' => 'Access Governance', 'body' => 'Access is role-based, least-privilege and reviewed routinely.'],
                ['title' => 'Encryption', 'body' => 'Client data is encrypted in transit and at rest.'],
            ],
            'metrics' => [
                ['value' => 'ISO 27001', 'label' => 'Certified ISMS', 'caption' => 'Ledger V'],
                ['value' => 'POPIA', 'label' => 'TBCA Attested', 'caption' => 'Ledger A'],
                ['value' => 'Quarterly', 'label' => 'Access Reviews', 'caption' => null],
            ],
            'governance' => ['Information Officer appointed', 'Security governance board review'],
            'policies' => ['Information Security Policy', 'Privacy Policy', 'Access Control Standard'],
            'proof_points' => ['Certificate bound from the Certification Register', 'POPIA attestation reviewed by the Information Officer'],
        ];

        $impactPopover = [
            'overview' => [
                ['title' => 'Defined Metrics', 'body' => 'Every public metric has a definition, source, period and named owner.'],
                ['title' => 'Transaction Register', 'body' => 'Projects and capital figures are drawn from the controlled transaction register.'],
                ['title' => 'Independent Surveys', 'body' => 'Client outcome figures come from independently administered surveys.'],
            ],
            'metrics' => [
                ['value' => '1,263+', 'label' => 'Projects Delivered', 'caption' => 'Transaction Register'],
                ['value' => 'R12.6B+', 'label' => 'Capital Unlocked', 'caption' => 'Capital Mobilisation Report'],
                ['value' => '45', 'label' => 'African Countries', 'caption' => 'Country Activation Register'],
            ],
            'governance' => ['Public Metric Rule: missing data never renders as zero or green'],
            'policies' => ['Public Metric Standard', 'Claim Governance Procedure'],
            'proof_points' => ['Metrics expire with their evidence and show "Under review" until re-verified'],
        ];

        // key, code, statement, value, label, description, category, type, ledger, surfaces, icon, review, verification, authority, owner, action[label, href], popover, evidence[]
        // evidence: [code, title, type, issuer, status, expiryDays|null, asAtDays, ref|null, certCode|null, owner]
        $claims = [
            ['iso-27001', 'CLM-001', 'ISO 27001 Certified', 'ISO 27001', 'ISO 27001 Certified', 'Information security management system certified to ISO/IEC 27001.', 'Security', 'Certification', 'V', ['landing', 'certifications', 'trust-badge'], 'shield-check', 'approved', 'verified', 'Board of Directors', 'Head: Security', ['Verify Certification', '/about/certifications#iso-27001'], $securePopover,
                [['EV-CERT-001', 'ISO/IEC 27001:2022 Certificate', 'Certificate', 'Accredited ISMS Certification Body', 'verified', 495, -600, 'ISOCZA27001/2025/045', 'CERT-001', 'Security Team']]],
            ['popia', 'CLM-002', 'POPIA Compliant', 'POPIA', 'POPIA Compliant', 'Personal information protection aligned with POPIA requirements.', 'Privacy', 'Compliance Attestation', 'A', ['landing', 'certifications', 'trust-badge'], 'user-check', 'approved', 'verified', 'Risk & Governance Committee', 'Information Officer', ['View Privacy Controls', '/privacy'], null,
                [['EV-ATT-001', 'POPIA Compliance Attestation & Privacy Controls Register', 'Attestation', 'TBCA Information Officer', 'verified', 314, -51, 'ATT-AB-001', 'ATT-001', 'Governance Team']]],
            ['security-governance', 'CLM-003', 'Evidence-controlled security governance and oversight', 'Security Governance', 'Security Governance', 'Governance-led security program with evidence-controlled oversight.', 'Security', 'Security', 'G', ['landing'], 'shield', 'approved', 'verified', 'Risk & Governance Committee', 'Head: Security', ['View Security Governance', '/about/governance#security'], null,
                [['EV-2024-010', 'Security Governance Framework v3.0', 'Policy Framework', 'TBCA Governance Office', 'verified', 240, -90, null, null, 'Security Team']]],
            ['trade-mark', 'CLM-004', 'Registered Trade Mark — The Business Clinic.Africa™', 'Trade Mark', 'Registered Trade Mark', 'The Business Clinic.Africa™ mark registered under the Madrid System.', 'Brand & Positioning', 'Registration', 'V', ['certifications'], 'badge-check', 'approved', 'verified', 'Board of Directors', 'Company Secretary', ['View Registration Details', '/about/certifications#trade-mark'], null,
                [['EV-TM-003', 'WIPO Madrid Registration 1835123', 'Registration Record', 'WIPO Madrid System', 'verified', null, -400, '1835123', 'TM-003', 'Legal Team']]],
            ['institutional-relationships', 'CLM-005', 'Institutional relationships recorded and disclosed as REFERENCED', 'Relationships', 'Institutional Relationships', 'Trusted institutions we work with, each governed by a permission record.', 'Institutional', 'Institutional Relationship', 'R', ['certifications'], 'handshake', 'approved', 'verified', 'Chief Strategy Officer', 'Partnerships Lead', ['View Relationships', '/about/relationships'], null,
                [['EV-2024-011', 'Institutional permission records and relationship agreements', 'Permission Record', 'Institutional counterparties', 'verified', 200, -60, 'AUTH-AB-003', null, 'Partnerships Team']]],
            ['ethical-ai', 'CLM-006', 'TBCA Ethical AI Framework — human oversight on every material decision', 'Human Oversight', 'TBCA Ethical AI Framework', 'AI assists; accountable humans approve material conclusions.', 'Ethics & Governance', 'AI Disclosure', 'A', ['trust-badge'], 'cpu', 'approved', 'verified', 'Risk & Governance Committee', 'Head: AI & Automation', ['Our AI Disclosure', '/about/ai-disclosure'], null,
                [['EV-2024-012', 'Ethical AI Framework v1.4 & model use-list', 'Policy Framework', 'TBCA AI Governance Board', 'verified', 280, -40, null, null, 'AI Team']]],
            ['registered-entity', 'CLM-007', 'Registered Entity — South Africa, Reg. No. 2023/123456/07', '2023/123456/07', 'Registered Entity', 'South Africa company registration.', 'Entity', 'Entity Fact', 'V', ['trust-badge'], 'landmark', 'approved', 'verified', 'Company Secretary', 'Company Secretary', null, null,
                [['EV-2024-013', 'CIPC Company Registration Certificate', 'Registration Record', 'CIPC', 'verified', null, -700, '2023/123456/07', null, 'Company Secretary']]],
            ['tax-compliant', 'CLM-008', 'Tax Compliant — SARS tax compliance status', 'TAX CLEAR', 'Tax Compliant', 'SARS tax compliance status pin.', 'Entity', 'Compliance Attestation', 'V', ['trust-badge'], 'globe', 'approved', 'verified', 'Chief Financial Officer', 'Finance Team', null, null,
                [['EV-2024-014', 'SARS Tax Compliance Status PIN', 'Compliance Status', 'SARS', 'verified', 21, -344, 'TCS-PIN', null, 'Finance Team']]],

            // Our Promise claim cards (evidence popover)
            ['ethical', 'CLM-051', 'We operate with integrity, transparency and zero tolerance for conflict.', null, 'Ethical', 'We operate with integrity, transparency and zero tolerance for conflict.', 'Ethics & Governance', 'Governance', 'A', ['promise-cards'], 'shield-check', 'approved', 'verified', 'Risk & Governance Committee', 'Head: Governance', ['View Full Governance', '/about/governance'], $ethicalPopover,
                [['EV-2024-020', 'Code of Ethics and Conduct v2.1', 'Policy', 'TBCA Governance Office', 'verified', 220, -30, null, null, 'Governance Team'],
                    ['EV-2024-021', 'Ethics acknowledgement register (all staff)', 'Register', 'People & Culture', 'verified', 150, -20, null, null, 'People Team']]],
            ['data-secured', 'CLM-052', 'Your data is protected with industry-leading security and privacy controls.', null, 'Data-Secured', 'Your data is protected with industry-leading security and privacy controls.', 'Security', 'Security', 'A', ['promise-cards'], 'lock', 'approved', 'verified', 'Risk & Governance Committee', 'Head: Security', ['View Privacy Standards', '/privacy'], $securePopover,
                [['EV-2024-022', 'ISO/IEC 27001:2022 Certificate (bound)', 'Certificate', 'Accredited ISMS Certification Body', 'verified', 495, -600, null, 'CERT-001', 'Security Team']]],
            ['measurable-impact', 'CLM-053', 'We are committed to creating real, measurable value for clients and communities.', null, 'Measurable Impact', 'We are committed to creating real, measurable value for clients and communities.', 'Impact & Results', 'Performance', 'A', ['promise-cards'], 'target', 'approved', 'verified', 'Board of Directors', 'Impact Team', ['Our Methodology', '/about/methodology'], $impactPopover,
                [['EV-2024-023', 'Impact Measurement Framework 2026', 'Framework', 'TBCA Impact Office', 'verified', 300, -45, null, null, 'Impact Team']]],

            // Our Promise statistics (claims CLM-039..048 from the Claim Register Console)
            ['clients-served', 'CLM-039', '18,742+ clients served across Africa', '18,742+', 'Clients Served', 'Organisations and entrepreneurs supported across Africa.', 'Brand & Positioning', 'Scale', 'A', ['promise-stats', 'testimonials'], 'users', 'approved', 'verified', 'Chief Executive Officer', 'Impact Team', null, null,
                [['EV-2024-001', 'Client Impact Survey 2026 (Q1–Q2)', 'Survey Report', 'Independent research partner', 'verified', 270, -95, null, null, 'Impact Team']]],
            ['african-countries', 'CLM-041', 'African footprint in 45 countries where we operate', '45', 'African Countries', 'Where our projects and partners have impact.', 'Geographic Presence', 'Scale', 'A', ['promise-stats', 'testimonials'], 'globe', 'approved', 'verified', 'Chief Strategy Officer', 'Strategy Team', null, null,
                [['EV-2024-002', 'Country Activation Register v2.1', 'Operations Report', 'TBCA Strategy Office', 'verified', 40, -320, null, null, 'Strategy Team']]],
            ['projects-delivered', 'CLM-040', '1,263+ projects delivered from diagnostics to bankability & beyond', '1,263+', 'Projects Delivered', 'From diagnostics to bankability and beyond.', 'Client Outcomes', 'Performance', 'A', ['promise-stats'], 'clipboard-check', 'approved', 'verified', 'Board of Directors', 'Delivery Team', null, null,
                [['EV-2024-003', 'Transaction Register (2019–2026)', 'Transaction Register', 'TBCA Delivery Office', 'verified', 330, -30, null, null, 'Delivery Team']]],
            ['client-satisfaction', 'CLM-047', '98% client satisfaction based on independent surveys', '98%', 'Client Satisfaction', 'Based on independent client feedback surveys.', 'Client Outcomes', 'Performance', 'A', ['promise-stats', 'testimonials'], 'shield-check', 'approved', 'verified', 'Chief Executive Officer', 'Client Success Team', null, null,
                [['EV-2024-004', 'Client Satisfaction Survey Q4 2024', 'Survey Report', 'Independent research partner', 'verified', -81, -440, null, null, 'Client Success Team']]],
            ['capital-unlocked', 'CLM-046', 'R12.6B+ capital unlocked for projects and businesses', 'R12.6B+', 'Capital Unlocked', 'Funding facilitated for projects and businesses.', 'Impact & Results', 'Performance', 'A', ['promise-stats'], 'bar-chart-3', 'approved', 'verified', 'Board of Directors', 'Finance Team', null, null,
                [['EV-2024-005', 'Capital Mobilisation Report 2025/26', 'Financial Report', 'TBCA Finance Office', 'in_review', 360, -10, null, null, 'Finance Team'],
                    ['EV-2024-007', 'Capital Mobilisation Report 2024/25', 'Financial Report', 'TBCA Finance Office', 'verified', 35, -330, null, null, 'Finance Team']]],
            ['client-support', 'CLM-045', '24/7 client support via chat, WhatsApp and email', '24/7', 'Client Support', 'Always-on support via chat, WhatsApp and email.', 'Service Delivery', 'Availability', 'A', ['promise-stats'], 'clock', 'approved', 'verified', 'Chief Operating Officer', 'Support Ops', null, null,
                [['EV-2024-006', 'Support System Logs (rolling 90 days)', 'System Log', 'TBCA Support Operations', 'verified', null, -2, null, null, 'Support Ops']]],
            ['resources-published', 'CLM-044', "3,850+ resources published for Africa's doers and leaders", '3,850+', 'Resources Published', "Guides, templates and tools for Africa's doers and leaders.", 'Content & Resources', 'Catalogue', 'A', ['promise-stats'], 'graduation-cap', 'approved', 'verified', 'Head: Content & Knowledge', 'Content Team', null, null,
                [['EV-2024-008', 'Resource Library Analytics Report', 'Analytics Report', 'TBCA Content Office', 'verified', 210, -25, null, null, 'Content Team']]],
            ['ethical-commitment', 'CLM-043', 'Ethical commitment: zero tolerance for conflict', '100%', 'Ethical Commitment', 'Human-led. Ethical by design. Zero tolerance for conflict.', 'Ethics & Governance', 'Governance', 'A', ['promise-stats'], 'shield-check', 'approved', 'verified', 'Risk & Governance Committee', 'Governance Team', null, $ethicalPopover,
                [['EV-2024-009', 'Code of Ethics v2.1', 'Policy', 'TBCA Governance Office', 'verified', 220, -30, null, null, 'Governance Team']]],
            ['integrity-claim', 'CLM-042', 'Operate with integrity, transparency and accountability', null, 'Integrity', null, 'Ethics & Governance', 'Governance', 'A', ['promise-stats'], 'shield', 'under_review', 'in_progress', 'Board of Directors', 'Governance Team', null, null,
                [['EV-2024-015', 'Governance Framework v3.0', 'Policy Framework', 'TBCA Governance Office', 'in_review', 365, -5, null, null, 'Governance Team']]],
            ['trusted-ecosystem', 'CLM-048', "Africa's most trusted ecosystem of thinkers, doers and leaders.", null, 'Most Trusted Ecosystem', null, 'Brand & Positioning', 'Positioning', 'A', ['promise-stats'], 'award', 'under_review', 'verified', 'Risk & Governance Committee', 'Brand Team', null, null,
                [['EV-2024-016', 'Brand Trust Survey 2024 (N = 1,263)', 'Survey Report', 'Independent research partner', 'verified', 120, -150, null, null, 'Brand Team']]],

            // TBCA at a glance (dark band on /about)
            ['glance-countries', 'CLM-060', '54 countries served by the TBCA platform', '54', 'Countries We Serve', null, 'Geographic Presence', 'Scale', 'A', ['glance'], 'globe', 'approved', 'verified', 'Chief Strategy Officer', 'Strategy Team', null, null,
                [['EV-2024-030', 'Platform Country Coverage Register', 'Operations Report', 'TBCA Strategy Office', 'verified', 180, -20, null, null, 'Strategy Team']]],
            ['glance-clients-target', 'CLM-061', '50,000+ paying clients target', '50,000+', 'Paying Clients Target', null, 'Brand & Positioning', 'Positioning', 'G', ['glance'], 'users', 'approved', 'verified', 'Board of Directors', 'Strategy Team', null, null,
                [['EV-2024-031', 'Board-approved Growth Plan 2026–2030', 'Plan', 'TBCA Board', 'verified', 365, -120, null, null, 'Strategy Team']]],
            ['glance-sprints', 'CLM-062', '7,008 governed digital products (Sprints)', '7,008', 'Digital Products (Sprints)', null, 'Content & Resources', 'Catalogue', 'A', ['glance'], 'briefcase', 'approved', 'verified', 'Chief Operating Officer', 'Catalogue Team', null, null,
                [['EV-2024-032', 'Sprint Catalogue Master Register', 'Register', 'TBCA Catalogue Office', 'verified', null, -3, null, null, 'Catalogue Team']]],
            ['glance-automation', 'CLM-063', '80–95% automation level across delivery workflows', '80–95%', 'Automation Level', null, 'Service Delivery', 'Capability', 'A', ['glance'], 'bot', 'approved', 'verified', 'Head: AI & Automation', 'AI Team', null, null,
                [['EV-2024-033', 'Automation Coverage Report', 'Analytics Report', 'TBCA AI Office', 'verified', 150, -30, null, null, 'AI Team']]],
            ['glance-languages', 'CLM-064', '7 platform languages', '7', 'Languages', null, 'Service Delivery', 'Capability', 'A', ['glance'], 'messages-square', 'approved', 'verified', 'Chief Operating Officer', 'Platform Team', null, null,
                [['EV-2024-034', 'Localisation Register', 'Register', 'TBCA Platform Office', 'verified', null, -10, null, null, 'Platform Team']]],
            ['glance-currencies', 'CLM-065', '5 supported currencies', '5', 'Currencies', null, 'Commercial', 'Commercial Architecture', 'A', ['glance'], 'circle-dollar-sign', 'approved', 'verified', 'Chief Financial Officer', 'Finance Team', null, null,
                [['EV-2024-035', 'Currency & Pricing Register', 'Register', 'TBCA Finance Office', 'verified', null, -10, null, null, 'Finance Team']]],
            ['glance-quality', 'CLM-066', '100% quality & security committed', '100%', 'Quality & Security Committed', null, 'Security', 'Governance', 'A', ['glance'], 'shield-check', 'approved', 'verified', 'Risk & Governance Committee', 'Governance Team', null, null,
                [['EV-2024-036', 'Quality & Security Charter', 'Policy', 'TBCA Governance Office', 'verified', 200, -40, null, null, 'Governance Team']]],
            ['glance-impact', 'CLM-067', 'Pan-African, impact-driven', 'Pan-African', 'Impact Driven', null, 'Brand & Positioning', 'Positioning', 'G', ['glance'], 'rocket', 'approved', 'verified', 'Chief Executive Officer', 'Brand Team', null, null,
                [['EV-2024-037', 'Impact Charter', 'Charter', 'TBCA Board', 'verified', null, -200, null, null, 'Brand Team']]],

            // Track record — unevidenced items are safely omitted (AB-CLAIM-BLD-014)
            ['track-projects-advised', 'CLM-070', '10,000+ projects advised', '10,000+', 'Projects Advised', null, 'Client Outcomes', 'Performance', 'A', ['track-record'], 'file-text', 'proposed', 'unverified', 'Board of Directors', 'Delivery Team', null, null,
                [['EV-2024-040', 'Advisory activity log (unreconciled)', 'Analytics Report', 'TBCA Delivery Office', 'in_review', null, -5, null, null, 'Delivery Team']]],
            ['track-capital', 'CLM-071', 'R500B+ capital mobilised', 'R500B+', 'Capital Mobilised', null, 'Impact & Results', 'Performance', 'A', ['track-record'], 'circle-dollar-sign', 'proposed', 'unverified', 'Board of Directors', 'Finance Team', null, null,
                [['EV-2024-041', 'Pipeline value estimate (not reconciled)', 'Financial Report', 'TBCA Finance Office', 'in_review', null, -5, null, null, 'Finance Team']]],
            ['track-industries', 'CLM-072', '25+ industries served', '25+', 'Industries Served', null, 'Client Outcomes', 'Scale', 'A', ['track-record'], 'bar-chart-3', 'approved', 'verified', 'Chief Strategy Officer', 'Strategy Team', null, null,
                [['EV-2024-042', 'Sector Coverage Register', 'Register', 'TBCA Strategy Office', 'verified', 250, -15, null, null, 'Strategy Team']]],
            ['track-confidential', 'CLM-073', '100% confidential & secure engagements', '100%', 'Confidential & Secure', null, 'Security', 'Security', 'A', ['track-record'], 'lock', 'approved', 'verified', 'Head: Security', 'Security Team', null, null,
                [['EV-2024-043', 'NDA & confidentiality register', 'Register', 'TBCA Legal Office', 'verified', 300, -12, null, null, 'Legal Team']]],
            ['track-turnaround', 'CLM-074', '24-hour turnaround promise on enquiries', '24-Hour', 'Turnaround Promise', null, 'Service Delivery', 'Duration', 'A', ['track-record'], 'clock', 'approved', 'verified', 'Chief Operating Officer', 'Support Ops', null, null,
                [['EV-2024-044', 'Enquiry response SLA report', 'System Log', 'TBCA Support Operations', 'verified', 90, -7, null, null, 'Support Ops']]],
        ];

        foreach ($claims as $i => [$key, $code, $statement, $value, $label, $desc, $cat, $type, $ledger, $surfaces, $icon, $review, $verification, $authority, $owner, $action, $popover, $evidence]) {
            $claim = Claim::updateOrCreate(['key' => $key], [
                'code' => $code, 'statement' => $statement, 'value' => $value, 'label' => $label, 'description' => $desc,
                'category' => $cat, 'claim_type' => $type, 'ledger' => $ledger, 'surfaces' => $surfaces, 'icon' => $icon,
                'sort' => $i, 'review_status' => $review, 'verification_status' => $verification, 'lifecycle' => 'active',
                'approval_authority' => $authority, 'owner' => $owner,
                'claimed_on' => now()->subDays(120 + $i * 3)->toDateString(),
                'last_reviewed_at' => now()->subDays(5 + $i)->setTime(10, 0),
                'action_label' => $action[0] ?? null, 'action_href' => $action[1] ?? null, 'popover' => $popover,
            ]);

            foreach ($evidence as [$evCode, $title, $evType, $issuer, $status, $expiry, $asAt, $ref, $cert, $evOwner]) {
                Evidence::updateOrCreate(['code' => $evCode], [
                    'claim_id' => $claim->id, 'cert_asset_id' => $cert ? $assets[$cert]->id : null,
                    'title' => $title, 'evidence_type' => $evType, 'issuer' => $issuer, 'verification_status' => $status,
                    'reference_no' => $ref, 'as_at_date' => $this->d($asAt), 'expiry_date' => $this->d($expiry), 'owner' => $evOwner,
                ]);
            }
        }

        // One archived claim kept as evidence history only.
        Claim::updateOrCreate(['key' => 'bank-grade-security'], [
            'code' => 'CLM-030', 'statement' => 'Bank-grade security', 'value' => null, 'label' => 'Bank-Grade Security',
            'category' => 'Security', 'claim_type' => 'Security', 'ledger' => 'A', 'surfaces' => ['footer'], 'sort' => 99,
            'review_status' => 'rejected', 'verification_status' => 'unverified', 'lifecycle' => 'archived',
            'approval_authority' => 'Risk & Governance Committee', 'owner' => 'Brand Team',
            'claimed_on' => '2024-02-01', 'last_reviewed_at' => '2024-04-21 10:00:00',
        ]);
    }

    private function institutions(): void
    {
        $rows = [
            // slug, name, acronym, ledger, description, surfaces, color, state
            ['idc', 'Industrial Development Corporation (IDC)', 'IDC', 'R', 'Development finance and industrial growth partner.', ['relationships'], '#1d4ed8', 'confirmed'],
            ['dbsa', 'Development Bank of Southern Africa (DBSA)', 'DBSA', 'R', 'Infrastructure funding and project preparation collaboration.', ['relationships', 'trusted-strip'], '#0f766e', 'confirmed'],
            ['nedbank', 'Nedbank', 'Nedbank', 'R', 'Financial services and strategic partnership.', ['relationships'], '#166534', 'confirmed'],
            ['standard-bank', 'Standard Bank Group', 'Standard Bank', 'R', 'Financial services and client solution delivery.', ['relationships'], '#1e3a8a', 'confirmed'],
            ['sars', 'South African Revenue Service (SARS)', 'SARS', 'V', 'Tax compliance, regulatory engagement and cooperation.', ['relationships'], '#1e40af', 'confirmed'],
            ['information-regulator', 'Information Regulator (South Africa)', 'InfoReg', 'V', 'Information protection oversight and regulatory engagement.', ['relationships'], '#92400e', 'confirmed'],
            ['fic', 'Financial Intelligence Centre (FIC)', 'FIC', 'V', 'Financial crime oversight and compliance collaboration.', ['relationships'], '#1e3a8a', 'confirmed'],
            ['fsca', 'Financial Sector Conduct Authority (FSCA)', 'FSCA', 'V', 'Regulatory oversight and industry engagement.', ['relationships'], '#111827', 'confirmed'],
            ['afdb', 'African Development Bank Group', 'AfDB', 'R', 'Development finance engagement on project preparation.', ['trusted-strip'], '#15803d', 'confirmed'],
            ['ifc', 'International Finance Corporation', 'IFC', 'R', 'Private-sector development finance engagement.', ['trusted-strip'], '#1d4ed8', 'confirmed'],
            ['african-union', 'African Union', 'African Union', 'R', 'Continental development programme engagement.', ['trusted-strip'], '#a16207', 'confirmed'],
            ['giz', 'Deutsche Gesellschaft für Internationale Zusammenarbeit', 'giz', 'R', 'Development cooperation programme engagement.', ['trusted-strip'], '#b91c1c', 'confirmed'],
            ['usaid', 'United States Agency for International Development', 'USAID', 'R', 'Development programme engagement.', ['trusted-strip'], '#1e3a8a', 'confirmed'],
            ['eib', 'European Investment Bank', 'EIB', 'R', 'Development finance engagement.', ['trusted-strip'], '#1e40af', 'confirmed'],
            ['undp', 'United Nations Development Programme', 'UNDP', 'R', 'Development programme engagement.', ['trusted-strip'], '#0369a1', 'confirmed'],
            // Permission revoked: suppressed from every surface automatically.
            ['absa', 'Absa Group', 'Absa', 'R', 'Financial services collaboration.', ['relationships', 'trusted-strip'], '#be123c', 'revoked'],
        ];

        foreach ($rows as $i => [$slug, $name, $acronym, $ledger, $desc, $surfaces, $color, $state]) {
            Institution::updateOrCreate(['slug' => $slug], [
                'name' => $name, 'acronym' => $acronym, 'ledger' => $ledger, 'relationship_description' => $desc,
                'relationship_detail' => "TBCA's relationship with {$name} is recorded under a documented permission with a defined purpose and periodic review. It does not imply endorsement, investment or client status unless specifically stated.",
                'permission_state' => $state, 'permission_expires_at' => $this->d(300 - $i * 7), 'surfaces' => $surfaces, 'color' => $color, 'sort' => $i,
            ]);
        }
    }

    private function testimonials(): void
    {
        $rows = [
            // code, company, person, role, attribution, industry, service, quote, status, consent, consentDays, expiryDays, channels, featured
            ['TS-001', 'Approved Client', null, null, 'Approved Client', 'SME', 'Project Advisory', 'TBCA delivered a bankable business plan that secured our funding within 45 days.', 'published', 'active', -200, 165, ['website', 'proposals'], true],
            ['TS-069', 'Ubumbano Energy', 'Sipho Mokoena', 'CEO, Ubumbano Energy', null, 'Renewable Energy', 'Due Diligence', "TBCA's due diligence gave us confidence to secure funding. Their insights were practical, rigorous and unstoppably African.", 'published', 'active', -120, 245, ['website', 'linkedin'], false],
            ['TS-070', 'AgriNova Africa', 'Amina Diallo', 'Founder, AgriNova Africa', null, 'Agribusiness', 'Project Advisory', "The advisory team challenged our assumptions and strengthened our business case. We wouldn't be where we are without TBCA.", 'published', 'active', -100, 265, ['website'], false],
            ['TS-071', 'InfraBridge Capital', 'Dr. Kwame Mensah', 'Director, InfraBridge Capital', null, 'Infrastructure', 'Project Advisory', "Professional, responsive and deeply committed to Africa's development. Their methodology is world-class.", 'published', 'active', -90, 275, ['website', 'presentations'], false],
            ['TS-072', 'HealthNet Solutions', 'Thandiwe Ndlovu', 'CFO, HealthNet Solutions', null, 'Healthcare', 'Diagnostics', 'From feasibility to financial close, TBCA was with us every step. Their AI-powered tools saved us time and money.', 'published', 'active', -80, 285, ['website', 'linkedin'], false],
            ['TS-073', 'Kamanzi Ventures', 'Jean-Paul Kamanzi', 'Managing Partner, Kamanzi Ventures', null, 'Private Equity', 'Due Diligence', 'Clear fees, honest advice and measurable outcomes. TBCA delivers on its promise.', 'published', 'active', -60, 305, ['website'], false],
            ['TS-068', 'African Trade Finance Corp.', 'Naledi Khumalo', 'Head of Strategy', null, 'Financial Services', 'Project Advisory', 'TBCA provided strategic clarity and execution support that unlocked funding for our expansion.', 'published', 'active', -140, 225, ['linkedin', 'website', 'proposals'], false],
            ['TS-067', 'GreenGrid Energy Solutions', 'Pieter van Wyk', 'COO', null, 'Renewable Energy', 'Due Diligence', 'Exceptional due diligence and insights. Their team is world-class.', 'published', 'active', -160, 205, ['linkedin', 'proposals'], false],
            ['TS-066', 'ZamMetro Infrastructure', 'Mwila Banda', 'Project Director', null, 'Infrastructure', 'Project Advisory', 'Their advisory helped us structure a bankable PPP with confidence.', 'pending_review', 'active', -30, 335, ['website', 'linkedin'], false],
            ['TS-065', 'AgriConnect Africa', 'Grace Achieng', 'CEO', null, 'Agribusiness', 'Diagnostics', 'The diagnostics report was thorough, practical and actionable.', 'draft', 'active', -10, 355, ['website'], false],
            ['TS-064', 'NorthStar Capital', 'Tendai Moyo', 'Partner', null, 'Private Equity', 'Due Diligence', 'Accurate, timely and professional. Great experience overall.', 'published', 'active', -400, -35, ['linkedin', 'website'], false],
            ['TS-063', 'Kalahari Logistics', 'Johan Pretorius', 'MD', null, 'Logistics', 'Project Advisory', 'TBCA helped us prepare an investor-ready plan in record time.', 'published', 'revoked', -300, 65, ['website'], false],
            ['TS-062', 'Sahel Solar Co-op', 'Fatou Ndiaye', 'Chair', null, 'Renewable Energy', 'Diagnostics', 'A clear, honest diagnostic of where we stood.', 'declined', 'declined', null, null, [], false],
        ];

        foreach ($rows as [$code, $company, $person, $role, $attr, $industry, $service, $quote, $status, $consent, $cDays, $eDays, $channels, $featured]) {
            Testimonial::updateOrCreate(['code' => $code], [
                'company' => $company, 'person_name' => $person, 'person_role' => $role, 'attribution' => $attr, 'industry' => $industry,
                'service_used' => $service, 'quote' => $quote, 'rating' => 5, 'status' => $status, 'consent_status' => $consent,
                'consent_date' => $this->d($cDays), 'consent_expires_at' => $this->d($eDays),
                'consent_revoked_at' => $consent === 'revoked' ? now()->subDays(12) : null,
                'channels' => $channels, 'image_permission' => $person !== null && $code !== 'TS-073', 'featured' => $featured,
            ]);
        }
    }

    private function corrections(): void
    {
        $public = [
            ['COR-2024-0004', 'AI capability claim', 'AI Disclosure', 'About TBCA Landing', 'Suggested AI can approve material decisions independently.', 'AI assists with analysis and organisation. Material decisions remain under human authority.', 'Clarify human authority and professional boundary.', '2024-08-14', '2025-04-21'],
            ['COR-2024-0003', 'Methodology description', 'Methodology', 'Our Methodology', 'Stated 6-step methodology.', 'Confirmed 5 enterprise phases: Diagnose, Select, Collaborate, Deliver, Scale.', 'Align with canonical enterprise method.', '2024-07-03', '2025-04-19'],
            ['COR-2024-0002', 'POPIA representation', 'Compliance Attestation', 'Certifications & Verifications', 'Implied third-party POPIA certification.', 'Corrected to POPIA Compliant (TBCA ATTESTED).', 'Clarify attestation vs. independent certification.', '2024-05-12', '2025-04-18'],
            ['COR-2024-0001', 'Institutional relationship label', 'Institutional Relationship', 'Institutional Relationships', "Listed institution under 'Partners' heading.", 'Updated to relationship-aware REFERENCED disclosure.', 'Relationship clarification and permissions review.', '2024-02-20', '2025-04-17'],
        ];
        foreach ($public as [$code, $title, $type, $surface, $prev, $corrected, $reason, $date, $verified]) {
            Correction::updateOrCreate(['code' => $code], [
                'title' => $title, 'claim_type' => $type, 'platform' => 'Website', 'affected_surface' => $surface,
                'previous_wording' => $prev, 'corrected_position' => $corrected, 'reason' => $reason,
                'status' => 'published', 'priority' => 'high', 'is_public' => true, 'submitted_by' => 'Internal QA',
                'assigned_to' => 'Claim Governance', 'submitted_at' => Carbon::parse($date)->subDays(4), 'target_publish_at' => $date,
                'effective_at' => $date, 'last_verified_at' => $verified,
                'history' => [['at' => Carbon::parse($date)->toIso8601String(), 'by' => 'Governance Approver', 'action' => 'published', 'note' => 'Correction approved and propagated.']],
            ]);
        }

        $workflow = [
            ['COR-2025-046', 'Incorrect VAT rate on FAQ page', 'Website', 'Client: M. Nkosi', 'm.nkosi@example.com', 'in_review', 'high', -6, 2, 'Content Team', 'The VAT rate listed as 16% is incorrect. Please update to the current official rate.', 'vat_official_notice_2025.pdf', 'Commercial Fact'],
            ['COR-2025-045', 'Typo in AIMM data source citation', 'AIMM', 'Research Team', null, 'triage', 'medium', -6, null, null, 'Citation names the wrong statistics agency for the 2024 dataset.', null, 'Factual Error'],
            ['COR-2025-044', 'Outdated partner logo in marketplace', 'Marketplace', 'Partner Services', null, 'awaiting_approval', 'medium', -8, -1, 'Brand Team', 'Partner rebranded; marketplace still shows previous logo variant.', null, 'Institutional Permission'],
            ['COR-2025-043', 'Broken link in Retainers landing page', 'Retainers', 'Client: A. Dlamini', 'a.dlamini@example.com', 'approved', 'high', -9, -4, 'Web Team', 'The "Compare retainers" link returns a 404.', null, 'Internal QA'],
            ['COR-2025-042', 'Misstatement in KP Thought article', 'KP Thought Leadership', 'Content Team', null, 'published', 'medium', -11, -9, 'Content Team', 'Article overstated the number of countries covered by the 2024 survey.', null, 'Factual Error'],
            ['COR-2025-041', 'Incorrect email in contact footer', 'Website', 'System Monitor', null, 'closed', 'low', -12, -11, 'Web Team', 'Footer showed an outdated .co.za email address instead of the .africa domain.', null, 'Factual Error'],
            ['COR-2025-040', 'Wrong fee shown for due diligence service', 'Due Diligence', 'Client: P. Naidoo', 'p.naidoo@example.com', 'submitted', 'high', -13, null, null, 'Due diligence package page shows an outdated fee.', null, 'Commercial Fact'],
            ['COR-2025-039', 'Translation error in Afrikaans page', 'Website (AF)', 'Client: J. Botha', 'j.botha@example.com', 'rejected', 'low', -15, null, 'Localisation Team', 'Reporter believed "Sprint" should be translated; brand term is intentionally untranslated.', null, 'Translation Error'],
        ];
        foreach ($workflow as [$code, $title, $platform, $by, $email, $status, $priority, $sub, $target, $assigned, $desc, $file, $type]) {
            $submitted = now()->addDays($sub)->setTime(10, 15);
            Correction::updateOrCreate(['code' => $code], [
                'title' => $title, 'platform' => $platform, 'affected_surface' => $platform, 'claim_type' => $type,
                'submitted_by' => $by, 'submitter_email' => $email, 'status' => $status, 'priority' => $priority,
                'is_public' => false, 'submitted_at' => $submitted, 'target_publish_at' => $target === null ? null : now()->addDays($target)->toDateString(),
                'assigned_to' => $assigned, 'description' => $desc, 'evidence_name' => $file,
                'effective_at' => in_array($status, ['published', 'closed'], true) ? now()->addDays($target ?? 0)->toDateString() : null,
                'last_verified_at' => $status === 'closed' ? now()->addDays(($target ?? 0) + 1)->toDateString() : null,
                'history' => [['at' => $submitted->toIso8601String(), 'by' => $by, 'action' => 'submitted', 'note' => null]],
            ]);
        }
    }

    private function careers(): void
    {
        $offer = ['Purpose-driven work with real impact', 'Continuous learning & development', 'Flexible & remote work options', 'Competitive remuneration', 'Diverse, inclusive & collaborative culture'];

        $roles = [
            ['ai-solutions-engineer', 'AI Solutions Engineer', 'AI & Automation', 'Pretoria, South Africa', 'Full-time', 'brain', 'Head: AI & Automation', 'Mid-level (3 – 5 years)', 'Occasional', ['Python', 'Machine Learning', 'LLMs', 'APIs', 'Data Engineering', 'Cloud (AWS / Azure)', 'Prompt Engineering', 'Automation', 'SQL'],
                [
                    "Design and develop AI-powered solutions and agents using TBCA's AIIM platform.",
                    'Integrate AI capabilities with data sources, APIs and enterprise systems.',
                    'Collaborate with project advisory teams to understand client needs and translate into solutions.',
                    'Build, test and deploy machine learning models and automation workflows.',
                    'Monitor solution performance and continuously improve models and processes.',
                    'Ensure solutions are secure, scalable and aligned with ethical AI principles.',
                ]],
            ['project-advisory-specialist', 'Project Advisory Specialist', 'Project Advisory', 'Johannesburg, South Africa', 'Full-time', 'briefcase', 'Head: Project Advisory', 'Senior (5 – 8 years)', 'Frequent', ['Project Finance', 'Feasibility Studies', 'PPP Structuring', 'Stakeholder Management', 'Financial Modelling'],
                ['Lead client engagements across the eight-step advisory sequence.', 'Prepare feasibility, bankability and investment-readiness outputs.', 'Coordinate qualified professionals where reserved conclusions are required.']],
            ['data-analyst', 'Data Analyst', 'Data & Analytics', 'Cape Town, South Africa', 'Full-time', 'bar-chart-3', 'Head: Data & Analytics', 'Mid-level (2 – 4 years)', 'None', ['SQL', 'Python', 'Power BI', 'Statistics', 'Data Visualisation'],
                ['Build dashboards and analytical datasets for AIIM and client engagements.', 'Maintain metric definitions behind public claims.', 'Support evidence assembly for the Claim Register.']],
            ['due-diligence-associate', 'Due Diligence Associate', 'Due Diligence', 'Pretoria, South Africa', 'Full-time', 'file-search', 'Head: Due Diligence', 'Junior (1 – 3 years)', 'Occasional', ['Financial Analysis', 'Risk Assessment', 'Research', 'Report Writing'],
                ['Assemble evidence packs and data rooms for due diligence engagements.', 'Run risk screens and issue lists.', 'Prepare draft findings for qualified review.']],
            ['marketplace-operations-coordinator', 'Marketplace Operations Coordinator', 'Marketplace', 'Remote (Africa)', 'Full-time', 'shopping-cart', 'Head: Marketplace', 'Mid-level (2 – 4 years)', 'None', ['Operations', 'Vendor Management', 'Customer Service', 'CRM'],
                ['Onboard and support marketplace providers.', 'Monitor listing quality and service levels.', 'Coordinate disputes with the governance team.']],
            ['content-creator-technical', 'Content Creator (Technical)', 'Digital Products', 'Remote (Africa)', 'Contract', 'pencil', 'Head: Content & Knowledge', 'Mid-level (2 – 4 years)', 'None', ['Technical Writing', 'Instructional Design', 'Research', 'Editing'],
                ['Write guides, templates and toolkits for the resource library.', 'Ensure every factual statement carries a Claim ID where required.', 'Work with subject-matter experts on accuracy reviews.']],
            ['finance-compliance-officer', 'Finance & Compliance Officer', 'Finance & Compliance', 'Pretoria, South Africa', 'Full-time', 'shield', 'Chief Financial Officer', 'Mid-level (3 – 5 years)', 'Occasional', ['Accounting', 'Compliance', 'POPIA', 'VAT', 'Reporting'],
                ['Maintain compliance registers and evidence for public trust claims.', 'Prepare management reporting and VAT submissions for review.', 'Coordinate external auditors.']],
            ['software-developer-backend', 'Software Developer (Backend)', 'Technology Solutions', 'Remote (Africa)', 'Full-time', 'code', 'Head: Technology Solutions', 'Mid-level (3 – 5 years)', 'None', ['PHP', 'Laravel', 'PostgreSQL', 'APIs', 'Testing'],
                ['Build and maintain platform services and APIs.', 'Write automated tests and participate in code review.', 'Implement security and privacy controls by design.']],
        ];

        foreach ($roles as $i => [$slug, $title, $dept, $loc, $type, $icon, $reports, $level, $travel, $skills, $resp]) {
            Vacancy::updateOrCreate(['slug' => $slug], [
                'code' => sprintf('VAC-2026-%03d', $i + 1), 'title' => $title, 'department' => $dept, 'location' => $loc,
                'employment_type' => $type, 'icon' => $icon, 'reports_to' => $reports, 'experience_level' => $level, 'travel' => $travel,
                'status' => 'open', 'posted_at' => $this->d(-20 + $i), 'closes_at' => $this->d(25 + $i * 3),
                'overview' => "The {$title} role sits within TBCA's {$dept} team. You will work at the intersection of technology, data and strategy to solve Africa's most complex challenges and deliver measurable impact for our clients.",
                'impact' => "You will contribute directly to TBCA's mission of mobilising \$1 trillion in infrastructure investment across Africa by 2030 using AI, human expertise and purpose.",
                'responsibilities' => $resp,
                'requirements' => ["Relevant degree or equivalent experience in {$dept}", "{$level} of relevant experience", 'Strong written and verbal communication', 'Commitment to ethical, evidence-based work', 'Right to work in the role location (or eligibility for remote contracting)'],
                'offer' => $offer, 'skills' => $skills,
                'department_about' => "The {$dept} department drives TBCA's innovation agenda by building intelligent agents, automation tools and data solutions that empower our teams and clients.",
            ]);
        }

        if ($v = Vacancy::where('slug', 'ai-solutions-engineer')->first()) {
            $v->update(['overview' => "The AI Solutions Engineer designs, builds and deploys intelligent solutions using TBCA's AI agents and automation platform. You will work at the intersection of technology, data and strategy to solve Africa's most complex challenges and deliver measurable impact for our clients."]);
        }

        // A closed and a draft vacancy that must not appear publicly.
        Vacancy::updateOrCreate(['slug' => 'graduate-analyst-2025'], [
            'code' => 'VAC-2025-019', 'title' => 'Graduate Analyst (2025 Intake)', 'department' => 'Project Advisory', 'location' => 'Pretoria, South Africa',
            'employment_type' => 'Full-time', 'icon' => 'graduation-cap', 'status' => 'open', 'posted_at' => $this->d(-120), 'closes_at' => $this->d(-60),
            'overview' => 'Closed graduate intake.', 'responsibilities' => [], 'requirements' => [], 'offer' => $offer, 'skills' => [],
        ]);
        Vacancy::updateOrCreate(['slug' => 'head-of-risk-draft'], [
            'code' => 'VAC-2026-099', 'title' => 'Head of Risk', 'department' => 'Governance', 'location' => 'Pretoria, South Africa',
            'employment_type' => 'Full-time', 'icon' => 'shield', 'status' => 'draft', 'posted_at' => null, 'closes_at' => null,
            'overview' => 'Draft — not yet approved to recruit.', 'responsibilities' => [], 'requirements' => [], 'offer' => $offer, 'skills' => [],
        ]);

        $vacancy = Vacancy::where('slug', 'data-analyst')->first();
        Application::updateOrCreate(['reference' => 'TBCA-APP-2026-DEMO01'], [
            'vacancy_id' => $vacancy->id, 'status' => 'screening', 'full_name' => 'Lindiwe Mahlangu', 'email' => 'lindiwe.m@example.com',
            'phone' => '+27 82 555 0101', 'location' => 'Cape Town, South Africa', 'nationality' => 'South African', 'work_authorization' => 'Citizen / permanent resident',
            'experience' => ['years' => '3-5 years', 'title' => 'BI Analyst', 'employer' => 'Coastal Insights', 'from' => '2022-02', 'to' => null, 'current' => true],
            'education' => ['level' => "Bachelor's degree", 'institution' => 'University of Cape Town', 'field' => 'Statistics', 'year' => '2021'],
            'screening' => ['skills' => ['SQL', 'Power BI'], 'notice_period' => '1 month', 'motivation' => 'I want my analysis to drive real investment decisions across Africa.'],
            'cv_name' => 'Lindiwe_Mahlangu_CV.pdf', 'privacy_acknowledged_at' => now()->subDays(6),
            'history' => [['at' => now()->subDays(6)->toIso8601String(), 'status' => 'submitted', 'note' => null], ['at' => now()->subDays(2)->toIso8601String(), 'status' => 'screening', 'note' => 'Human screening started.']],
        ]);
    }

    private function news(): void
    {
        $launchBody = [
            "The Business Clinic.Africa™ (TBCA) today announced the launch of Africa's first AI-powered transaction ecosystem platform — a digital infrastructure that combines AI agents, human expertise and an integrated value chain to accelerate the delivery of bankable and investable projects across Africa.",
            "TBCA's platform unifies diagnostics, project advisory, due diligence, digital products, subscriptions, marketplace, partner services and technology solutions — all underpinned by ethical AI and rigorous human oversight.",
            '"Our mission is simple but bold: mobilise $1 trillion in infrastructure investment across Africa by 2030," said Kruger Phiri, Founder & CEO of TBCA. "This platform is how we scale impact, drive inclusion and build Africa\'s future — together."',
            "TBCA's launch marks a major milestone in the company's journey to become the continent's most trusted transaction ecosystem for infrastructure and development.",
        ];

        $items = [
            ['tbca-launches-ai-powered-transaction-ecosystem', 'news', 'press_release', "TBCA Launches Africa's First AI-Powered Transaction Ecosystem Platform", 'A new era of intelligent, human-led solutions for infrastructure and development across the continent.', '2025-05-15', true, $launchBody, "TBCA is not just a platform. It's a movement to unlock Africa's full potential through intelligent transactions and human purpose.", 'Kruger Phiri, Founder & CEO, TBCA', 'rocket'],
            ['tbca-appoints-new-advisory-board-members', 'news', 'announcement', 'TBCA Appoints New Advisory Board Members', 'Strengthening our leadership to accelerate impact across Africa.', '2025-05-12', false, ['TBCA has appointed three new members to its Advisory Board, bringing deep experience in development finance, infrastructure and digital transformation.', 'The Advisory Board provides independent perspective to TBCA leadership. It does not exercise executive authority over client engagements.'], null, null, 'users'],
            ['mobilising-africas-1-trillion-infrastructure-opportunity', 'news', 'insight', "Thought Leadership: Mobilising Africa's \$1 Trillion Infrastructure Opportunity", 'Key insights from our latest whitepaper.', '2025-05-08', false, ["Our latest whitepaper examines how project preparation, evidence quality and disciplined execution unlock capital for Africa's infrastructure pipeline.", 'The paper sets out five practical levers for governments, DFIs and project sponsors.'], null, null, 'file-text'],
            ['tbca-at-africa-investment-forum-2025', 'news', 'event', 'TBCA at Africa Investment Forum 2025', 'Connecting projects with capital. Building partnerships that transform.', '2025-05-01', false, ['TBCA joined the Africa Investment Forum 2025 to connect investment-ready projects with capital providers.', 'Our team hosted sessions on project bankability and evidence-backed investment readiness.'], null, null, 'calendar'],
            ['tbca-partners-with-dfis-to-de-risk-project-pipeline', 'news', 'press_release', "TBCA Partners with Leading DFIs to De-Risk Africa's Project Pipeline", 'New partnerships to unlock sustainable development.', '2025-04-28', false, ['TBCA has entered collaboration arrangements with development finance institutions to strengthen early-stage project preparation.', 'Each relationship is recorded and disclosed under TBCA\'s institutional relationship governance and does not imply endorsement.'], null, null, 'handshake'],
            ['tbca-expands-operations-to-54-african-markets', 'announcement', 'announcement', 'TBCA Expands Operations to 54 African Markets', null, '2025-05-06', false, ['TBCA platform services are now available to clients in 54 African markets.'], null, null, 'megaphone'],
            ['q1-2025-performance-update', 'announcement', 'announcement', 'Q1 2025 Performance Update: Strong Start, Stronger Impact', null, '2025-04-30', false, ['A summary of TBCA activity in the first quarter of 2025.'], null, null, 'file-text'],
            ['new-internship-programme', 'announcement', 'announcement', "New Internship Programme: Building Africa's Future Leaders", null, '2025-04-22', false, ['TBCA is launching a structured internship programme for graduates across the continent.'], null, null, 'users'],
            ['partnership-with-regional-chambers', 'news', 'partnership', 'TBCA Signs Collaboration with Regional Chambers of Commerce', 'Expanding SME access to diagnostics and advisory.', '2025-04-15', false, ['TBCA will collaborate with regional chambers to bring diagnostics to member SMEs.'], null, null, 'handshake'],
            ['governance-in-the-age-of-ai', 'news', 'thought_leadership', 'Governance in the Age of AI: Human Authority by Design', 'Why AI should assist, and accountable humans should decide.', '2025-04-10', false, ['AI can organise, summarise and surface patterns. Material conclusions remain with accountable, qualified humans.'], null, null, 'cpu'],
        ];

        foreach ($items as [$slug, $kind, $cat, $title, $sub, $date, $featured, $body, $quote, $quoteBy, $icon]) {
            NewsItem::updateOrCreate(['slug' => $slug], [
                'kind' => $kind, 'category' => $cat, 'title' => $title, 'subtitle' => $sub, 'location' => 'Pretoria, South Africa',
                'body' => $body, 'quote' => $quote, 'quote_by' => $quoteBy, 'status' => 'published',
                'published_at' => Carbon::parse($date)->setTime(9, 0), 'featured' => $featured, 'icon' => $icon,
            ]);
        }

        // Embargoed release: excluded from every public query until its time.
        NewsItem::updateOrCreate(['slug' => 'embargoed-annual-impact-report'], [
            'kind' => 'news', 'category' => 'press_release', 'title' => 'TBCA Annual Impact Report (Embargoed)', 'subtitle' => 'Embargoed.',
            'location' => 'Pretoria, South Africa', 'body' => ['Embargoed content.'], 'status' => 'embargoed',
            'published_at' => now()->addDays(14), 'featured' => false, 'icon' => 'file-text',
        ]);
    }

    private function status(): void
    {
        $components = [
            ['website', 'TBCA Website & Public Pages', 'globe', 100.000, 210],
            ['client-portal', 'Client Portal', 'layout-dashboard', 100.000, 320],
            ['aiim', 'AIIM Platform', 'cpu', 99.980, 450],
            ['due-diligence', 'Due Diligence Platform', 'file-search', 100.000, 380],
            ['data-bank', 'Data Bank & APIs', 'database', 99.990, 280],
            ['marketplace', 'Marketplace', 'store', 99.990, 420],
            ['payments', 'Payment & Billing', 'credit-card', 100.000, 260],
            ['whatsapp', 'WhatsApp Integration', 'message-circle', 100.000, 190],
        ];

        foreach ($components as $i => [$key, $name, $icon, $uptime, $ms]) {
            $history = [];
            for ($d = 0; $d < 14; $d++) {
                $history[] = (int) round($ms * (0.85 + (($i * 7 + $d * 13) % 30) / 100));
            }
            StatusComponent::updateOrCreate(['key' => $key], [
                'name' => $name, 'icon' => $icon, 'status' => 'operational', 'uptime_30d' => $uptime, 'response_ms' => $ms,
                'history' => $history, 'sort' => $i,
            ]);
        }

        $aiim = StatusComponent::where('key', 'aiim')->first();
        StatusIncident::updateOrCreate(['title' => 'Elevated AIIM response times'], [
            'component_id' => $aiim->id, 'kind' => 'incident', 'impact' => 'minor', 'status' => 'resolved',
            'body' => 'A subset of AIIM dashboard queries responded slowly. A database index was rebuilt and response times returned to normal.',
            'starts_at' => now()->subDays(9)->setTime(8, 40), 'resolved_at' => now()->subDays(9)->setTime(9, 25),
        ]);
        StatusIncident::updateOrCreate(['title' => 'Scheduled payment gateway maintenance'], [
            'component_id' => StatusComponent::where('key', 'payments')->value('id'), 'kind' => 'maintenance', 'impact' => 'none', 'status' => 'completed',
            'body' => 'Planned certificate rotation on the payment gateway. No customer impact.',
            'starts_at' => now()->subDays(20)->setTime(23, 0), 'resolved_at' => now()->subDays(20)->setTime(23, 30),
        ]);
    }

    private function cases(): void
    {
        TrustCase::updateOrCreate(['reference' => 'TBCA-CMP-2026-DEMO01'], [
            'type' => 'complaint', 'status' => 'investigating', 'name' => 'Sizwe Nkosi', 'email' => 'sizwe.n@example.com', 'phone' => '+27 83 555 0199',
            'category' => 'Service delivery', 'subject' => 'Delayed diagnostic report', 'message' => 'My diagnostic report was promised within 5 business days and arrived after 9.',
            'details' => ['relationship' => 'Client', 'reference' => 'TBCA-ORD-2026-ABC123', 'outcome' => 'Explanation and a partial credit.'],
            'history' => [
                ['at' => now()->subDays(5)->toIso8601String(), 'status' => 'received', 'note' => null],
                ['at' => now()->subDays(4)->toIso8601String(), 'status' => 'acknowledged', 'note' => 'Receipt confirmed by Client Care.'],
                ['at' => now()->subDays(2)->toIso8601String(), 'status' => 'investigating', 'note' => 'Case owner assigned; delivery logs requested.'],
            ],
        ]);
        TrustCase::updateOrCreate(['reference' => 'TBCA-PRT-2026-DEMO01'], [
            'type' => 'partner', 'status' => 'screening', 'name' => 'Ama Owusu', 'email' => 'ama@greenbridge.example', 'organisation' => 'GreenBridge Advisory',
            'category' => 'Delivery partner', 'subject' => 'Partnership enquiry: GreenBridge Advisory', 'message' => 'We would like to deliver ESG screens for TBCA clients in West Africa.',
            'details' => ['organisation_type' => 'Professional services firm', 'industry' => 'Professional Services', 'country' => 'Ghana', 'size' => '11-50', 'job_title' => 'Managing Director', 'contact_method' => 'Email'],
            'history' => [['at' => now()->subDays(3)->toIso8601String(), 'status' => 'received', 'note' => null], ['at' => now()->subDay()->toIso8601String(), 'status' => 'screening', 'note' => 'Capability evidence requested.']],
        ]);

        WhistleReport::updateOrCreate(['reference' => 'WB-2026-DEMO01'], [
            'token_hash' => Hash::make('TBCA-DEMO-CASE-0001'), 'category' => 'Conflict of interest', 'relationship' => 'Supplier / vendor',
            'subject' => 'Undisclosed supplier relationship', 'description' => 'A procurement decision may have involved an undisclosed family relationship.',
            'follow_up_route' => 'Case token (anonymous portal)', 'willing_contact' => false, 'anonymous' => true, 'status' => 'case_review',
            'messages' => [['at' => now()->subDays(2)->toIso8601String(), 'from' => 'case_owner', 'body' => 'Thank you. An independent case owner has acknowledged your report and started a review.']],
        ]);
    }
}
