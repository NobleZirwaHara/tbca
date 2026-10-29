<?php

namespace Database\Seeders\Sections;

use App\Models\Kp\KpRecord;
use App\Models\User;
use App\Support\Content\KpThoughtLeadership as Kp;
use Illuminate\Database\Seeder;

/**
 * Idempotent demo data for the KP Thought Leadership governance consoles (KP-SCR-051 to 072),
 * the public corrections timeline, the Project Development Desk and the session pipeline.
 * Rows are operational demo records; they make no claim about Kruger Phiri.
 */
class KpSeeder extends Seeder
{
    public function run(): void
    {
        KpRecord::query()->whereIn('kind', ['console', 'correction', 'project', 'session_request', 'fb_activity'])->delete();

        $items = collect(Kp::items());
        $rows = [
            'topics' => collect(Kp::themes())->map(fn ($t, $i) => [$t['slug'], $t['label'], $i < 7 ? 'Active' : 'Draft', 'Content Lead', $items->filter(fn ($it) => in_array($t['slug'], $it['themes'], true))->count().' content items'])->all(),
            'lifecycle' => $items->take(10)->values()->map(fn ($it, $i) => ['KP-CONT-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT), $it['title'], $it['status'] === 'published' ? 'Published' : 'Drafting', $it['author'], $it['status'] === 'published' ? 'Full text supplied by KP on 18 Oct 2026' : 'Awaiting full text from KP'])->all(),
            'voice' => $items->take(10)->values()->map(fn ($it, $i) => ['KP-CONT-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT), $it['title'], $it['voice'], 'Editorial', Kp::voices()[$it['voice']][0]])->all(),
            'review' => [
                ['REV-0041', "The Real Problem Isn't Capital. It's Readiness.", 'Reviewing', 'Independent Reviewer', 'Source dates to confirm'],
                ['REV-0040', 'Doing Business in Nigeria: What the Data Actually Shows.', 'Submitted', 'Country Reviewer', 'Country evidence required'],
                ['REV-0039', 'Black Economic Empowerment: Beyond the Compliance Box.', 'Returned', 'Legal Reviewer', 'Professional boundary wording'],
                ['REV-0038', 'Why Projects Fail Before They Start', 'Approved', 'Independent Reviewer', 'Approved for publication'],
                ['REV-0037', 'Mockup statistics panel (20+ years, 1,000+ projects)', 'Blocked', 'Claims Reviewer', 'Hard block: no evidence (blueprint 12.5)'],
            ],
            'ai-outputs' => [
                ['AIO-0102', 'Answer: What are the 5 pillars of execution?', 'Released', 'AI Quality Lead', 'Citations verified'],
                ['AIO-0101', 'Explain at level: I am 12', 'Review', 'Education Reviewer', 'Age-appropriate check'],
                ['AIO-0100', 'Answer: Digital payments adoption in Kenya', 'QA', 'AI Quality Lead', 'Source currency check'],
                ['AIO-0099', 'Decision Sheet draft summary', 'Generated', 'AI Quality Lead', 'Working draft watermark'],
                ['AIO-0098', 'Answer: Carbon tax thresholds', 'Blocked', 'Tax Specialist', 'Regulated topic: route to professional'],
            ],
            'synthetic' => [
                ['SYN-0004', 'Founder voice clone for course narration', 'Blocked', 'Founder Office', 'No consent instrument (blueprint 11.2)'],
                ['SYN-0003', 'AI-animated Founder image for social', 'Consent Pending', 'Brand Lead', 'Consent and rights review'],
                ['SYN-0002', 'Synthetic lesson presenter (non-Founder)', 'Published', 'Education Lead', 'Disclosure ID DISC-0002'],
                ['SYN-0001', 'AI-read article audio', 'Review', 'Editorial', 'Label as synthetic audio'],
            ],
            'claims' => [
                ['CLM-0012', '20+ Years of Experience', 'Required', 'Claims Owner', 'Do not render until evidenced'],
                ['CLM-0011', '1,000+ Projects Advised', 'Required', 'Claims Owner', 'Counting method required'],
                ['CLM-0010', '54 Countries Engaged', 'Required', 'Claims Owner', 'Do not render until evidenced'],
                ['CLM-0009', '10,000+ Entrepreneurs Empowered', 'Required', 'Claims Owner', 'Do not render until evidenced'],
                ['CLM-0008', 'Fellow, Chartered Certified Accountant (FCCA)', 'Received', 'Claims Owner', 'Certificate received, verification due'],
                ['CLM-0007', 'Founder, The Business Clinic.Africa', 'Approved', 'Claims Owner', 'Company record'],
                ['CLM-0006', 'Countless Lives Impacted', 'Expired', 'Claims Owner', 'Retired (blueprint 12.5)'],
            ],
            'utm' => [
                ['UTM-0031', 'TBCA nav to KP handoff', 'Tracked', 'Growth', 'utm_source=businessclinic.africa'],
                ['UTM-0030', 'Founder newsletter link', 'Missing', 'Growth', 'Link created without campaign'],
                ['UTM-0029', 'LinkedIn insight post', 'Conflict', 'Growth', 'Two campaign names in use'],
                ['UTM-0028', 'Webinar replay to Work With Kruger', 'Fixed', 'Growth', 'Future links patched'],
            ],
            'd023' => [
                ['D023-01', 'Insight readers', 'Current', 'Analytics', 'Measure only; no target set'],
                ['D023-02', 'Newsletter subscribers', 'Current', 'Analytics', 'Explicit subscription only'],
                ['D023-03', 'Diagnostic starts from insights', 'Reconciling', 'Analytics', 'Attribution window review'],
                ['D023-04', 'Session requests from KP pages', 'Current', 'Analytics', 'Request is not a booking'],
                ['D023-05', 'Paid engagements from KP source', 'Stale', 'Finance', 'Awaiting reconciliation'],
            ],
            'customer-value' => [
                ['CV-01', 'Action pack downloads per insight', 'Current', 'Content Lead', 'Value evidence'],
                ['CV-02', 'Tool completions (scorecard, checklist)', 'Incomplete', 'Product', 'Event tracking partial'],
                ['CV-03', 'Helpful votes on AI answers', 'Current', 'AI Quality Lead', 'Yes, Somewhat, No'],
                ['CV-04', 'Learner lesson completions', 'Review', 'Education Lead', 'Aggregate only'],
            ],
            'capacity' => [
                ['CAP-W42', 'Week 42 Founder hours', 'Throttled', 'Founder Office', '6 of 8 advisory hours allocated'],
                ['CAP-W43', 'Week 43 Founder hours', 'Available', 'Founder Office', '3 of 8 advisory hours allocated'],
                ['CAP-W44', 'Week 44 Founder hours', 'Reserve Protected', 'Founder Office', 'Board and family reserve'],
                ['CAP-W45', 'Week 45 Founder hours', 'Full', 'Founder Office', 'Conference travel'],
            ],
            'contested' => [
                ['CT-0005', 'Black Economic Empowerment commentary', 'C', 'Editorial', 'Independent review required'],
                ['CT-0004', 'Migration and labour commentary', 'D', 'Editorial', 'Band D cannot publish'],
                ['CT-0003', 'AI and jobs', 'B', 'Editorial', 'Balanced sources required'],
                ['CT-0002', 'Cash flow discipline', 'A', 'Editorial', 'Standard review'],
            ],
            'duplicates' => [
                ['DUP-0006', 'Cash Flow Is a Behaviour (note) / (explainer)', 'Candidate', 'Content Lead', 'Two expressions of one concept'],
                ['DUP-0005', 'Strategy Is Easy (note) / (explainer)', 'Confirmed', 'Content Lead', 'Choose canonical'],
                ['DUP-0004', 'Three Questions Every Founder Must Outgrow', 'Accepted Variation', 'Content Lead', 'Note and explainer serve different audiences'],
                ['DUP-0003', 'Execution Excellence Framework / Playbook', 'Merged', 'Content Lead', 'Canonical: framework'],
            ],
            'graph' => [
                ['KP-KN-0001', 'Capital Readiness', 'Active', 'Knowledge Lead', '5 linked assets'],
                ['KP-KN-0002', 'Execution Discipline', 'Active', 'Knowledge Lead', '6 linked assets'],
                ['KP-KN-0003', 'Project Bankability', 'Active', 'Knowledge Lead', '4 linked assets'],
                ['KP-KN-0004', 'Boardroom Decision Quality', 'Draft', 'Knowledge Lead', 'Definition under review'],
                ['KP-KN-0005', 'Business Diagnosis', 'Active', 'Knowledge Lead', '3 linked assets'],
            ],
            'freshness' => [
                ['SRC-0014', 'World Bank Enterprise Surveys (2023 Update)', 'Current', 'Data Lead', 'Next review Jan 2027'],
                ['SRC-0013', 'IMF Financing for Development (2024)', 'Current', 'Data Lead', 'Next review Jan 2027'],
                ['SRC-0012', 'AfDB Project Preparation Report (2023)', 'Due', 'Data Lead', 'Review due'],
                ['SRC-0011', 'UNCTAD Investment Readiness Indicators (2023)', 'Current', 'Data Lead', 'Next review Mar 2027'],
                ['SRC-0010', 'Country indicator placeholders (AIIM)', 'Stale', 'Data Lead', 'Replace with verified figures'],
            ],
            'coverage' => [
                ['AFR-ZA', 'South Africa', 'Partial', 'Country Lead', 'AIIM pack in progress'],
                ['AFR-BW', 'Botswana', 'Verified', 'Country Lead', 'Country Pack BW-1.0 loaded'],
                ['AFR-KE', 'Kenya', 'Preview', 'Country Lead', 'Indicators are placeholders'],
                ['AFR-NG', 'Nigeria', 'Preview', 'Country Lead', 'Country evidence required'],
                ['AFR-MW', 'Malawi', 'Partial', 'Country Lead', 'Drill-down data loaded'],
            ],
            'translation' => [
                ['TR-0009', 'Professional limitation notice (Afrikaans)', 'Specialist', 'Translation Lead', 'Legal wording check'],
                ['TR-0008', 'Future Builders lesson 1 (isiZulu)', 'Linguistic', 'Translation Lead', 'Pending reviewer'],
                ['TR-0007', 'Insight summary (French)', 'Approved', 'Translation Lead', 'Ready to publish'],
                ['TR-0006', 'Voice labels (Portuguese)', 'Live', 'Translation Lead', 'Published'],
            ],
            'safety' => [
                ['FBS-0006', 'Learner challenge submission', 'Review', 'Safeguarding Lead', 'Check for personal details'],
                ['FBS-0005', 'AI assistant learner prompts (weekly sample)', 'Clear', 'Safeguarding Lead', 'No issues found'],
                ['FBS-0004', 'Commercial link inside learner page', 'Restricted', 'Safeguarding Lead', 'No child commercial CTA'],
                ['FBS-0003', 'Reported comment', 'Incident', 'Safeguarding Lead', 'Escalated to guardian route'],
            ],
            'agents' => [
                ['AGT-KA', 'KP Knowledge Assistant', 'Active', 'AI Platform', 'Grounded answers with citations'],
                ['AGT-FB', 'Future Builders Learning Assistant', 'Human Review Only', 'AI Platform', 'Learner-safe shell'],
                ['AGT-FR', 'Funder Readiness Interviewer', 'Active', 'AI Platform', 'No funding guarantee'],
                ['AGT-BC', 'Boardroom Challenger', 'Restricted', 'AI Platform', 'No autonomous approval'],
                ['AGT-SY', 'Synthetic voice renderer', 'Disabled', 'AI Platform', 'Kill switch engaged'],
            ],
            'corrections' => [
                ['COR-0012', 'Digital Payments Adoption in Kenya', 'Closed', 'Content Lead', 'Mobile money figure updated'],
                ['COR-0011', 'ESG Reporting Requirements (IFRS S1 and S2)', 'Publishing', 'Content Lead', 'Effective date updated'],
                ['COR-0010', 'SA Carbon Tax Thresholds', 'Reviewing', 'Tax Specialist', 'Draft amendment bill'],
                ['COR-0009', 'Kenya Fintech Market Size', 'Approved', 'Content Lead', 'Market size corrected'],
            ],
            'experiments' => [
                ['EXP-0004', 'Insight page: action pack above the fold', 'Running', 'Growth', 'Measure action pack use'],
                ['EXP-0003', 'Newsletter prompt after second insight', 'Proposed', 'Growth', 'Ethics review required'],
                ['EXP-0002', 'Learner streak reminders', 'Rejected', 'Education Lead', 'Not appropriate for minors'],
                ['EXP-0001', 'Assistant suggested questions', 'Completed', 'AI Platform', 'Adopted'],
            ],
        ];

        $sort = 0;
        foreach ($rows as $console => $list) {
            foreach ($list as [$code, $title, $status, $owner, $note]) {
                KpRecord::create(['kind' => 'console', 'code' => $code, 'title' => $title, 'status' => $status, 'sort' => $sort++, 'data' => ['console' => $console, 'owner' => $owner, 'note' => $note, 'updated' => now()->subDays($sort % 9)->format('j M Y')]]);
            }
        }

        // Session pipeline (KP-SCR-062): demo requests. A request is not a booking.
        foreach ([
            ['KP-REQ-1001', 'Strategic Advisory Session', 'Requested', 'Amahle Dlamini', 'AgriTech SA', 'Capital raise readiness for a processing plant'],
            ['KP-REQ-1000', 'Depth Diagnostic & Clarity Session', 'Qualified', 'Sipho Ndlovu', 'Ndlovu Logistics', 'Margin pressure across two depots'],
            ['KP-REQ-0999', 'Executive Board Dialogue', 'Waitlist', 'Grace Banda', 'Banda Holdings', 'Board strategy offsite'],
            ['KP-REQ-0998', 'Project Development Engagement', 'Routed', 'Kofi Mensah', 'Mensah Energy', 'Mini-grid feasibility; routed to Project Advisory (K3)'],
            ['KP-REQ-0997', 'Keynote Speaking', 'Booked', 'Event Organiser', 'SME Growth Summit', 'Keynote on capital readiness'],
        ] as $i => [$code, $title, $status, $name, $org, $brief]) {
            KpRecord::create(['kind' => 'session_request', 'code' => $code, 'title' => $title, 'status' => $status, 'sort' => $i, 'data' => ['name' => $name, 'organisation' => $org, 'brief' => $brief, 'mode' => $status === 'Routed' ? 'K3' : 'K1', 'received' => now()->subDays($i + 1)->format('j M Y')]]);
        }

        // Public correction timeline (KP-SCR-026).
        foreach ([
            ['Digital Payments Adoption in Kenya', 'Factual Correction', 'Fintech / Payments', 'Corrected', 'Corrected data on mobile money penetration based on the latest central bank report.', 'AI + Human Review', 'high'],
            ['ESG Reporting Requirements (IFRS S1 & S2)', 'Update', 'ESG / Sustainability', 'Updated', 'Updated guidance to reflect the IFRS S1 effective date.', 'AI Update', 'medium'],
            ['SA Carbon Tax Thresholds', 'Under Review', 'Tax / Compliance', 'Under Review', 'Reviewing the new draft Carbon Tax Amendment Bill.', 'Human Review', 'high'],
            ['Project Finance Trends in Africa 2024', 'No Change', 'Project Finance', 'No Change', 'No material change. Source rechecked. Data remains accurate.', 'AI Check', 'low'],
            ['Kenya Fintech Market Size 2024', 'Factual Correction', 'Market Research', 'Corrected', 'Corrected market size based on a newer published report.', 'AI + Human Review', 'high'],
            ['Funding Readiness Checklist', 'Clarification Added', 'Capital & Funding', 'Updated', 'Added a note that grant criteria differ by funder.', 'Human Review', 'low'],
            ['Board Effectiveness Checklist', 'Source Update', 'Governance', 'Corrected', 'Replaced an outdated governance code reference.', 'Human Review', 'medium'],
            ['Cash Flow Forecast Template', 'No Change', 'Finance', 'No Change', 'Formula check completed. No change needed.', 'AI Check', 'low'],
        ] as $i => [$title, $type, $topic, $status, $note, $by, $impact]) {
            KpRecord::create(['kind' => 'correction', 'code' => 'COR-'.str_pad((string) (20 - $i), 4, '0', STR_PAD_LEFT), 'title' => $title, 'status' => $status, 'sort' => $i, 'data' => ['type' => $type, 'topic' => $topic, 'note' => $note, 'by' => $by, 'impact' => $impact, 'date' => now()->subDays($i * 3 + 1)->format('j M Y')]]);
        }

        // Project Development Desk (KP-SCR-011): demo projects for the demo client.
        $client = User::where('email', 'amahle@agritechsa.co.za')->first();
        foreach ([
            ['Solar Mini-Grid Development', 'Northern Cape, South Africa', 'Feasibility Study', 45, 'Market Analysis', 7],
            ['Agri-Processing Facility', 'Eastern Uganda', 'Investment Readiness', 60, 'Financial Model Review', 5],
            ['Eco-Tourism Lodge', 'Western Cape, South Africa', 'Implementation', 75, 'Implementation Plan', 12],
        ] as $i => [$title, $place, $stage, $progress, $next, $due]) {
            KpRecord::create(['kind' => 'project', 'code' => 'KP-PRJ-'.(301 + $i), 'title' => $title, 'status' => $stage, 'user_id' => $client?->id, 'sort' => $i, 'data' => ['place' => $place, 'progress' => $progress, 'next' => $next, 'due' => now()->addDays($due)->format('j M Y'), 'updated' => now()->subDays($i + 2)->format('j M Y')]]);
        }
    }
}
