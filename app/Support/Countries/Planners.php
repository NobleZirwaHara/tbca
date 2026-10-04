<?php

namespace App\Support\Countries;

/**
 * Market-entry journey planners (CT-017 to CT-026). Every planner is driven by a
 * list of requirement items; the score, domain progress, summary counts and
 * critical gaps are always computed from item statuses — never typed in.
 *
 * Item tuple: [code, title, category, owner, due (Y-m-d), priority, status, critical?]
 */
class Planners
{
    public const STATUSES = ['completed', 'in_progress', 'planned', 'not_started', 'blocked', 'not_applicable'];

    public const ORDER = ['readiness', 'landing', 'localisation', 'payments', 'language-pack', 'compliance', 'launch', 'evidence-audit', 'exit', 'diaspora'];

    public static function nav(): array
    {
        return [
            'readiness' => 'Market Entry Readiness',
            'landing' => 'Country Landing Plan',
            'localisation' => 'Localisation Planner',
            'payments' => 'Payment Localisation Planner',
            'language-pack' => 'Language Pack Builder',
            'compliance' => 'Country Compliance Planner',
            'launch' => 'Country Launch Readiness',
            'evidence-audit' => 'Country Evidence Audit',
            'exit' => 'Country Exit and Deregistration',
            'diaspora' => 'Diaspora & Inbound Capital',
        ];
    }

    /** Score from items: completed / applicable. */
    public static function score(array $items): array
    {
        $applicable = array_values(array_filter($items, fn ($i) => $i['status'] !== 'not_applicable'));
        $counts = array_fill_keys(self::STATUSES, 0);
        foreach ($items as $i) {
            $counts[$i['status']]++;
        }
        $total = count($applicable);
        $score = $total ? (int) round($counts['completed'] / $total * 100) : 0;

        $domains = [];
        foreach ($applicable as $i) {
            $domains[$i['category']] ??= ['done' => 0.0, 'total' => 0, 'open' => 0];
            $domains[$i['category']]['total']++;
            $domains[$i['category']]['done'] += match ($i['status']) {
                'completed' => 1, 'in_progress' => 0.5, default => 0,
            };
            if ($i['status'] !== 'completed') {
                $domains[$i['category']]['open']++;
            }
        }

        $bars = [];
        foreach ($domains as $label => $d) {
            $pct = (int) round($d['done'] / max(1, $d['total']) * 100);
            $bars[] = [
                'label' => $label,
                'pct' => $pct,
                'status' => $pct >= 100 ? 'Completed' : ($pct >= 75 ? 'Ready' : ($pct === 0 ? 'Not Started' : 'In Progress')),
                'open' => $d['open'],
            ];
        }

        return [
            'score' => $score,
            'level' => $score >= 75 ? 'Ready' : ($score >= 50 ? 'Ready with Actions' : 'Not Ready'),
            'counts' => $counts,
            'total' => count($items),
            'applicable' => $total,
            'completed' => $counts['completed'],
            'bars' => $bars,
            'critical_open' => count(array_filter($items, fn ($i) => ! empty($i['critical']) && $i['status'] !== 'completed')),
        ];
    }

    public static function definition(string $kind): ?array
    {
        $defs = self::definitions();

        return $defs[$kind] ?? null;
    }

    public static function template(string $kind): array
    {
        return array_map(fn ($t) => [
            'code' => $t[0], 'title' => $t[1], 'category' => $t[2], 'owner' => $t[3], 'due_date' => $t[4],
            'priority' => $t[5], 'status' => $t[6], 'critical' => $t[7] ?? false,
        ], self::definitions()[$kind]['items'] ?? []);
    }

    private static function definitions(): array
    {
        return [
            'readiness' => [
                'title' => 'Market Entry Readiness',
                'lead' => 'Assess your organisation\'s readiness to enter and operate in South Africa.',
                'score_title' => 'Overall Readiness Score', 'score_label' => 'Overall Readiness',
                'kpis' => [['Estimated Time to Launch', '8 – 12 weeks', 'With current plan', 'calendar-days']],
                'tabs' => ['Overview', 'Readiness Assessment', 'Gap Analysis', 'Action Plan', 'Requirements', 'Dependencies', 'Change History'],
                'domains_title' => 'Readiness by Domain', 'domains_intro' => 'Six key domains determine your readiness to enter the South African market.',
                'domains_note' => 'Readiness is calculated based on completed requirements, conditions and country-specific facts.',
                'panels' => [
                    ['type' => 'guidance', 'title' => 'Readiness Guidance', 'intro' => 'You are well positioned for market entry with some priority actions.', 'items' => [
                        ['ok', 'Strong legal foundation and regulatory understanding'], ['ok', 'Tax compliance framework largely in place'],
                        ['warn', 'Licensing and operational registrations in progress'], ['warn', 'Go-to-market strategy requires localisation refinement'],
                        ['bad', 'Critical data residency assessment outstanding'], ['bad', 'Partnership agreements not yet finalised'],
                    ], 'footer' => 'Address critical gaps to improve readiness score and reduce time to launch.'],
                ],
                'items_title' => 'Top Critical Gaps', 'items_filter' => 'critical',
                'actions' => ['View Detailed Assessment', 'View Gap Analysis', 'View Action Plan', 'Download Readiness Report (PDF)', 'Share with Team'],
                'advisor' => ['Need Expert Guidance?', 'Speak to a TBCA Advisor for tailored support to accelerate your market entry.'],
                'items' => [
                    ['MER-001', 'Company law and regulatory framework mapped', 'Legal & Regulatory', 'Legal Team', '2026-07-20', 'High', 'completed'],
                    ['MER-002', 'Consumer protection obligations confirmed', 'Legal & Regulatory', 'Legal Team', '2026-07-25', 'Medium', 'completed'],
                    ['MER-003', 'Data Residency Assessment', 'Legal & Regulatory', 'Legal / IT', '2026-08-22', 'High', 'not_started', true],
                    ['MER-004', 'CIPC company registration', 'Licensing & Registration', 'Legal Team', '2026-07-30', 'High', 'completed'],
                    ['MER-005', 'Sector licence applications', 'Licensing & Registration', 'Compliance', '2026-09-05', 'High', 'in_progress'],
                    ['MER-006', 'Tax and VAT registration', 'Tax & Finance', 'Finance Team', '2026-07-28', 'High', 'completed'],
                    ['MER-007', 'Local banking relationship', 'Tax & Finance', 'Finance Team', '2026-08-10', 'Medium', 'completed'],
                    ['MER-008', 'Registered office and premises', 'Operations & Infrastructure', 'Operations', '2026-08-01', 'Medium', 'completed'],
                    ['MER-009', 'Systems and integrations configured', 'Operations & Infrastructure', 'IT Team', '2026-09-01', 'Medium', 'in_progress'],
                    ['MER-010', 'Operational support model', 'Operations & Infrastructure', 'Operations', '2026-09-10', 'Medium', 'not_started'],
                    ['MER-011', 'Local Partnership Agreements', 'People & Partnerships', 'Partnerships', '2026-08-29', 'High', 'in_progress', true],
                    ['MER-012', 'Key staff contracts and EE plan', 'People & Partnerships', 'HR Team', '2026-08-05', 'Medium', 'completed'],
                    ['MER-013', 'Partner due diligence completed', 'People & Partnerships', 'Partnerships', '2026-08-08', 'Medium', 'completed'],
                    ['MER-014', 'Pricing in ZAR approved', 'Go-to-Market & Localisation', 'Commercial', '2026-08-12', 'Medium', 'completed'],
                    ['MER-015', 'English / Afrikaans content pack', 'Go-to-Market & Localisation', 'Content Team', '2026-08-14', 'Medium', 'completed'],
                    ['MER-016', 'Go-to-market channel plan', 'Go-to-Market & Localisation', 'Marketing', '2026-09-12', 'Medium', 'completed'],
                ],
            ],
            'landing' => [
                'title' => 'Country Landing Plan',
                'lead' => 'Plan the legal entity, banking, premises and people you need to land in South Africa.',
                'score_title' => 'Landing Plan Score', 'score_label' => 'Landing Progress',
                'kpis' => [['Target Landing', '30 Sep 2026', 'In 6 weeks', 'calendar-days']],
                'tabs' => ['Overview', 'Entity & Presence', 'Banking', 'Premises & People', 'Go-to-Market', 'Change History'],
                'domains_title' => 'Landing Workstreams', 'domains_intro' => 'Four workstreams take you from intent to a landed operation.',
                'domains_note' => 'Progress is calculated from completed landing tasks per workstream.',
                'panels' => [
                    ['type' => 'kv', 'title' => 'Landing Configuration', 'rows' => [['Entry Vehicle', 'Private Company (Pty) Ltd'], ['Registered Office', 'Gauteng (Pretoria)'], ['Operating Currency', 'ZAR'], ['Publishing Languages', 'English, Afrikaans'], ['Partner Route', 'Verified local partners for reserved services']]],
                ],
                'items_title' => 'Open Landing Tasks', 'items_filter' => 'open',
                'actions' => ['Edit Landing Plan', 'Add Landing Task', 'Export Landing Plan (PDF)', 'Share Plan'],
                'advisor' => ['Need Landing Support?', 'Speak to a TBCA Market Entry Advisor for guidance on landing in South Africa.'],
                'items' => [
                    ['LND-001', 'Name reservation with CIPC', 'Entity & Presence', 'Legal Team', '2026-07-22', 'High', 'completed'],
                    ['LND-002', 'Company incorporation (Pty) Ltd', 'Entity & Presence', 'Legal Team', '2026-07-30', 'High', 'completed'],
                    ['LND-003', 'Beneficial ownership filing', 'Entity & Presence', 'Legal Team', '2026-08-05', 'Medium', 'completed'],
                    ['LND-004', 'Business bank account opened', 'Banking', 'Finance Team', '2026-08-10', 'High', 'completed'],
                    ['LND-005', 'Payment gateway onboarding', 'Banking', 'Finance Team', '2026-09-01', 'High', 'in_progress'],
                    ['LND-006', 'Registered office lease', 'Premises & People', 'Operations', '2026-08-01', 'Medium', 'completed'],
                    ['LND-007', 'Country lead appointed', 'Premises & People', 'HR Team', '2026-08-12', 'High', 'completed'],
                    ['LND-008', 'Local hiring plan', 'Premises & People', 'HR Team', '2026-09-15', 'Medium', 'planned'],
                    ['LND-009', 'Launch messaging (EN/AF)', 'Go-to-Market', 'Marketing', '2026-08-20', 'Medium', 'completed'],
                    ['LND-010', 'Channel partner shortlist', 'Go-to-Market', 'Partnerships', '2026-09-05', 'Medium', 'in_progress'],
                    ['LND-011', 'Launch event plan', 'Go-to-Market', 'Marketing', '2026-09-25', 'Low', 'not_started'],
                    ['LND-012', 'Customer support line (local)', 'Go-to-Market', 'Operations', '2026-09-20', 'Medium', 'planned'],
                ],
            ],
            'localisation' => [
                'title' => 'Localisation Planner',
                'lead' => 'Plan and track localisation requirements to successfully enter and operate in South Africa.',
                'score_title' => 'Localisation Readiness Score', 'score_label' => 'Overall Progress',
                'kpis' => [['Languages in Scope', '3', 'Primary pack', 'globe'], ['Target Launch', '15 Jan 2027', 'In 15 weeks', 'calendar-days']],
                'tabs' => ['Overview', 'Content & Translation', 'Formats & Units', 'Localisation Requirements', 'Compliance & Legal', 'Quality Assurance', 'Vendors & Resources', 'Change History'],
                'domains_title' => 'Localisation Overview', 'domains_intro' => 'Key localisation elements required for successful market entry.',
                'domains_note' => 'Localisation progress is based on completed tasks against the total required for each category.',
                'panels' => [
                    ['type' => 'table', 'title' => 'Target Languages', 'intro' => 'Primary languages selected for South Africa.', 'columns' => ['Language', 'Role', 'Locale', 'Native Name', 'Status', 'Coverage', 'Priority'], 'rows' => [
                        ['English', 'Primary', 'en-ZA', 'English', 'In Progress', '90%', 'High'], ['Afrikaans', 'Primary', 'af-ZA', 'Afrikaans', 'In Progress', '60%', 'High'], ['isiZulu', 'Secondary', 'zu-ZA', 'isiZulu', 'Planned', '25%', 'Medium'],
                    ]],
                    ['type' => 'bars', 'title' => 'Content Localisation Snapshot', 'intro' => 'By content type', 'rows' => [['Legal & Compliance', 75], ['Marketing & Sales', 60], ['Product Content', 55], ['Support & Help', 45], ['UI / Website', 70]]],
                ],
                'items_title' => 'Top Localisation Actions', 'items_filter' => 'open',
                'actions' => ['Edit Localisation Plan', 'Add Localisation Requirement', 'Upload Translation Asset', 'Export Localisation Plan (PDF)', 'Share Plan'],
                'advisor' => ['Need Localisation Help?', 'Speak to a TBCA Market Entry Advisor for guidance on localisation and content adaptation.'],
                'items' => [
                    ['LOC-25-001', 'Translate legal disclosures', 'Regulatory & Compliance', 'Legal Team', '2026-08-25', 'High', 'in_progress'],
                    ['LOC-25-002', 'Localise pricing & currency', 'Formats & Units', 'Finance Team', '2026-08-28', 'High', 'in_progress'],
                    ['LOC-25-003', 'Adapt terms & conditions', 'Content Adaptation', 'Legal Team', '2026-09-01', 'High', 'not_started', true],
                    ['LOC-25-004', 'Localise website UI', 'UI / UX Localisation', 'Product Team', '2026-09-05', 'Medium', 'in_progress'],
                    ['LOC-25-005', 'Prepare isiZulu content pack', 'Language', 'Content Team', '2026-09-12', 'Medium', 'planned'],
                    ['LOC-25-006', 'English source content freeze', 'Language', 'Content Team', '2026-07-20', 'High', 'completed'],
                    ['LOC-25-007', 'Afrikaans core translation', 'Language', 'Content Team', '2026-08-01', 'High', 'completed'],
                    ['LOC-25-008', 'Afrikaans human legal review', 'Language', 'Legal Team', '2026-08-10', 'High', 'completed'],
                    ['LOC-25-009', 'Glossary and terminology standard', 'Language', 'Content Team', '2026-07-25', 'Medium', 'completed'],
                    ['LOC-25-010', 'Date and time formats (en-ZA)', 'Formats & Units', 'Product Team', '2026-07-28', 'Medium', 'completed'],
                    ['LOC-25-011', 'Number and ZAR formatting', 'Formats & Units', 'Product Team', '2026-07-28', 'Medium', 'completed'],
                    ['LOC-25-012', 'Address and phone formats', 'Formats & Units', 'Product Team', '2026-08-02', 'Low', 'completed'],
                    ['LOC-25-013', 'Cultural review of imagery', 'Content Adaptation', 'Marketing', '2026-08-05', 'Medium', 'completed'],
                    ['LOC-25-014', 'Local case studies', 'Content Adaptation', 'Marketing', '2026-08-15', 'Medium', 'completed'],
                    ['LOC-25-015', 'POPIA notice localisation', 'Regulatory & Compliance', 'Legal Team', '2026-08-08', 'High', 'completed'],
                    ['LOC-25-016', 'Consumer disclosures (CPA)', 'Regulatory & Compliance', 'Legal Team', '2026-08-12', 'High', 'completed'],
                    ['LOC-25-017', 'Absence copy set EN/AF', 'Regulatory & Compliance', 'Content Team', '2026-08-30', 'High', 'in_progress', true],
                    ['LOC-25-018', 'Navigation and menus', 'UI / UX Localisation', 'Product Team', '2026-08-06', 'Medium', 'completed'],
                    ['LOC-25-019', 'Forms and validation messages', 'UI / UX Localisation', 'Product Team', '2026-08-09', 'Medium', 'completed'],
                    ['LOC-25-020', 'Email notification templates', 'UI / UX Localisation', 'Comms Team', '2026-08-30', 'Medium', 'in_progress'],
                    ['LOC-25-021', 'Accessibility review (localised)', 'UI / UX Localisation', 'QA Team', '2026-09-20', 'Low', 'planned'],
                    ['LOC-25-022', 'Help centre articles', 'Content Adaptation', 'Support Team', '2026-08-18', 'Medium', 'completed', true],
                ],
            ],
            'payments' => [
                'title' => 'Payment Localisation Planner',
                'lead' => 'Plan and track payment methods, currencies, taxes and settlement requirements for South Africa.',
                'score_title' => 'Payment Readiness Score', 'score_label' => 'Overall Progress',
                'kpis' => [['Currencies Supported', '2', 'Primary currencies', 'coins'], ['Payment Methods', '8', 'Active methods', 'wallet'], ['Target Launch', '15 Jan 2027', 'In 15 weeks', 'calendar-days']],
                'tabs' => ['Overview', 'Payment Methods', 'Currencies & Taxes', 'Settlement & Payouts', 'Compliance & Risk', 'Integration & Providers', 'Testing & Go-Live', 'Change History'],
                'domains_title' => 'Payment Workstreams', 'domains_intro' => 'Availability and readiness of payment methods for South Africa.',
                'domains_note' => 'All prices displayed to customers will be in ZAR. Multi-currency processing available at checkout.',
                'panels' => [
                    ['type' => 'table', 'title' => 'Payment Methods Overview', 'intro' => 'Availability and readiness of payment methods for South Africa.', 'columns' => ['Method', 'Type', 'Provider / Network', 'Coverage', 'Status', 'Priority'], 'rows' => [
                        ['Credit / Debit Cards', 'Card', 'Visa, Mastercard', '95%', 'Ready', 'High'], ['Instant EFT', 'Bank Transfer', 'Ozow', '90%', 'Ready', 'High'], ['Bank Transfer (EFT)', 'Bank Transfer', 'All Major Banks', '100%', 'Ready', 'High'],
                        ['Payflex', 'Buy Now Pay Later', 'Payflex', '60%', 'In Progress', 'Medium'], ['PayJustNow', 'Buy Now Pay Later', 'PayJustNow', '50%', 'In Progress', 'Medium'], ['SnapScan', 'Digital Wallet', 'SnapScan', '40%', 'Planned', 'Medium'],
                        ['Mobicred', 'Buy Now Pay Later', 'Mobicred', '30%', 'Planned', 'Low'], ['Cash on Delivery', 'Cash', 'Local Couriers', '20%', 'Not Planned', 'Low'],
                    ]],
                    ['type' => 'kv', 'title' => 'Currencies & Tax Overview', 'rows' => [['ZAR — South African Rand', 'Primary'], ['USD — US Dollar', 'Secondary'], ['VAT (Standard Rate)', '15%'], ['VAT (Zero Rated)', '0%'], ['VAT (Exempt)', 'Supported'], ['VAT Number Capture', 'Required'], ['Invoice Language', 'EN / AF']]],
                    ['type' => 'kv', 'title' => 'Settlement & Payout Configuration', 'rows' => [['Settlement Currency', 'ZAR'], ['Settlement Frequency', 'Daily'], ['Partner Payout Currency', 'ZAR'], ['Payout Frequency', 'Weekly'], ['Payout Methods', 'Bank Transfer'], ['Minimum Payout Threshold', 'ZAR 1,000'], ['Chargeback Handling', 'TBCA Policy'], ['Refund Handling', 'Automated Rules']]],
                ],
                'items_title' => 'Top Actions & Gaps', 'items_filter' => 'open',
                'actions' => ['Edit Payment Plan', 'Add Payment Method', 'Configure Taxes', 'Upload Provider Document', 'Export Payment Plan (PDF)', 'Share Plan'],
                'advisor' => ['Need Payment Setup Help?', 'Speak to a TBCA Payments Advisor for guidance on payment localisation.'],
                'items' => [
                    ['PAY-20-001', 'Enable Payflex in checkout', 'Payment Methods', 'Payments Team', '2026-08-25', 'High', 'in_progress', true],
                    ['PAY-20-002', 'Complete Ozow integration', 'Integration & Providers', 'Tech Team', '2026-08-28', 'High', 'in_progress'],
                    ['PAY-20-003', 'Configure VAT invoice format', 'Currencies & Taxes', 'Finance Team', '2026-08-30', 'Medium', 'in_progress'],
                    ['PAY-20-004', 'Enable Mobicred as option', 'Payment Methods', 'Payments Team', '2026-09-05', 'Low', 'planned'],
                    ['PAY-20-005', 'Fraud rules tuning & testing', 'Compliance & Risk', 'Risk Team', '2026-09-09', 'High', 'not_started', true],
                    ['PAY-20-006', 'Card acquiring agreement', 'Integration & Providers', 'Finance Team', '2026-07-20', 'High', 'completed'],
                    ['PAY-20-007', '3-D Secure enabled', 'Compliance & Risk', 'Tech Team', '2026-07-25', 'High', 'completed'],
                    ['PAY-20-008', 'EFT reconciliation rules', 'Settlement & Payouts', 'Finance Team', '2026-07-28', 'Medium', 'completed'],
                    ['PAY-20-009', 'ZAR pricing display', 'Currencies & Taxes', 'Product Team', '2026-07-30', 'High', 'completed'],
                    ['PAY-20-010', 'USD secondary display rules', 'Currencies & Taxes', 'Product Team', '2026-08-02', 'Medium', 'completed'],
                    ['PAY-20-011', 'VAT number capture', 'Currencies & Taxes', 'Product Team', '2026-08-04', 'Medium', 'completed'],
                    ['PAY-20-012', 'Daily settlement schedule', 'Settlement & Payouts', 'Finance Team', '2026-08-06', 'Medium', 'completed'],
                    ['PAY-20-013', 'Partner payout workflow', 'Settlement & Payouts', 'Finance Team', '2026-08-08', 'Medium', 'completed'],
                    ['PAY-20-014', 'Refund automation rules', 'Settlement & Payouts', 'Finance Team', '2026-08-10', 'Medium', 'completed'],
                    ['PAY-20-015', 'Chargeback policy published', 'Compliance & Risk', 'Risk Team', '2026-08-11', 'Medium', 'completed'],
                    ['PAY-20-016', 'PCI DSS attestation', 'Compliance & Risk', 'Risk Team', '2026-08-12', 'High', 'completed'],
                    ['PAY-20-017', 'Instant EFT sandbox tests', 'Integration & Providers', 'Tech Team', '2026-08-14', 'Medium', 'completed'],
                    ['PAY-20-018', 'Bank EFT details on invoices', 'Payment Methods', 'Finance Team', '2026-08-01', 'Medium', 'completed'],
                    ['PAY-20-019', 'Card method go-live', 'Payment Methods', 'Payments Team', '2026-08-15', 'High', 'completed'],
                    ['PAY-20-020', 'PayJustNow onboarding', 'Payment Methods', 'Payments Team', '2026-09-02', 'Medium', 'in_progress'],
                    ['PAY-20-021', 'SnapScan evaluation', 'Payment Methods', 'Payments Team', '2026-09-15', 'Medium', 'planned'],
                    ['PAY-20-022', 'Go-live payment test plan', 'Integration & Providers', 'QA Team', '2026-08-16', 'High', 'completed'],
                ],
            ],
            'language-pack' => [
                'title' => 'Language Pack Builder',
                'lead' => 'Create and manage multi-language packs for South Africa to localise your content and user experience.',
                'score_title' => 'Language Pack Readiness Score', 'score_label' => 'Overall Progress',
                'kpis' => [['Languages in Pack', '5', 'Ready', 'globe'], ['Content Items', '1,248', 'In this pack', 'file-text'], ['Target Publish', '15 Jan 2027', 'In 15 weeks', 'calendar-days']],
                'tabs' => ['Overview', 'Languages', 'Content & Translation', 'Formats & Units', 'QA & Review', 'Cultural Adaptation', 'Accessibility', 'Publishing', 'Change History'],
                'domains_title' => 'Language Pack Progress', 'domains_intro' => 'Status of the primary language pack for South Africa.',
                'domains_note' => 'All translations follow TBCA Terminology Standard and South African localisation guidelines.',
                'panels' => [
                    ['type' => 'table', 'title' => 'Language Pack Coverage', 'intro' => 'Coverage of languages and content readiness.', 'columns' => ['Language', 'Role', 'Locale', 'Content Items', 'Completion', 'Status'], 'rows' => [
                        ['English', 'Primary', 'en-ZA', '1,248', '100%', 'Ready'], ['Afrikaans', 'Primary', 'af-ZA', '1,102', '90%', 'Ready'], ['isiZulu', 'Secondary', 'zu-ZA', '856', '68%', 'In Progress'],
                        ['isiXhosa', 'Secondary', 'xh-ZA', '612', '55%', 'In Progress'], ['Sesotho', 'Additional', 'st-ZA', '324', '40%', 'Planned'],
                    ]],
                    ['type' => 'table', 'title' => 'Content Translation Status', 'intro' => 'Translation progress by content type.', 'columns' => ['Content Type', 'Items', 'Translated', 'Completion', 'Status'], 'rows' => [
                        ['Web Pages', '412', '342', '83%', 'Ready'], ['Documents & Guides', '298', '196', '66%', 'In Progress'], ['Forms & Templates', '186', '132', '71%', 'In Progress'],
                        ['Emails & Notifications', '152', '98', '64%', 'In Progress'], ['System Messages', '200', '148', '74%', 'Ready'],
                    ]],
                ],
                'items_title' => 'Top Actions & Review Queue', 'items_filter' => 'open',
                'actions' => ['Edit Language Pack', 'Add Language', 'Upload Translation', 'Download Template', 'Export Language Pack (XLIFF)', 'Share Language Pack'],
                'advisor' => ['Need Translation Support?', 'Speak to a TBCA Localisation Advisor for expert translation and localisation.'],
                'items' => [
                    ['LPK-21-001', 'Review isiZulu legal terms', 'isiZulu', 'Legal Team', '2026-08-20', 'High', 'in_progress', true],
                    ['LPK-21-002', 'Translate new pricing page', 'Afrikaans', 'Content Team', '2026-08-22', 'High', 'in_progress'],
                    ['LPK-21-003', 'QA isiXhosa templates', 'isiXhosa', 'QA Team', '2026-08-25', 'Medium', 'planned'],
                    ['LPK-21-004', 'Localise email notifications', 'All Secondary', 'Comms Team', '2026-08-28', 'Medium', 'planned'],
                    ['LPK-21-005', 'Accessibility review (All)', 'All Languages', 'Accessibility Team', '2026-09-01', 'Low', 'not_started'],
                    ['LPK-21-006', 'English source pack', 'English', 'Content Team', '2026-07-15', 'High', 'completed'],
                    ['LPK-21-007', 'English QA sign-off', 'English', 'QA Team', '2026-07-18', 'High', 'completed'],
                    ['LPK-21-008', 'English glossary', 'English', 'Content Team', '2026-07-20', 'Medium', 'completed'],
                    ['LPK-21-009', 'Afrikaans web pages', 'Afrikaans', 'Content Team', '2026-07-25', 'High', 'completed'],
                    ['LPK-21-010', 'Afrikaans legal review', 'Afrikaans', 'Legal Team', '2026-08-01', 'High', 'completed'],
                    ['LPK-21-011', 'Afrikaans system messages', 'Afrikaans', 'Product Team', '2026-08-03', 'Medium', 'completed'],
                    ['LPK-21-012', 'isiZulu web pages', 'isiZulu', 'Content Team', '2026-08-05', 'Medium', 'completed'],
                    ['LPK-21-013', 'isiZulu forms', 'isiZulu', 'Content Team', '2026-08-07', 'Medium', 'completed'],
                    ['LPK-21-014', 'isiXhosa web pages', 'isiXhosa', 'Content Team', '2026-08-09', 'Medium', 'completed'],
                    ['LPK-21-015', 'isiXhosa forms', 'isiXhosa', 'Content Team', '2026-08-11', 'Medium', 'completed'],
                    ['LPK-21-016', 'Sesotho glossary', 'Sesotho', 'Content Team', '2026-08-12', 'Low', 'completed'],
                    ['LPK-21-017', 'Sesotho web pages', 'Sesotho', 'Content Team', '2026-09-10', 'Low', 'planned'],
                    ['LPK-21-018', 'Date and number formats', 'All Languages', 'Product Team', '2026-07-22', 'Medium', 'completed'],
                    ['LPK-21-019', 'Cultural adaptation review', 'All Languages', 'Marketing', '2026-08-13', 'Medium', 'completed'],
                    ['LPK-21-020', 'Publishing workflow', 'All Languages', 'Product Team', '2026-08-14', 'Medium', 'completed'],
                    ['LPK-21-021', 'XLIFF export pipeline', 'All Languages', 'Tech Team', '2026-08-15', 'Medium', 'completed'],
                    ['LPK-21-022', 'Release notes (EN/AF)', 'All Languages', 'Content Team', '2026-08-16', 'Low', 'completed'],
                ],
            ],
            'compliance' => [
                'title' => 'Country Compliance Planner',
                'lead' => 'Plan statutory, tax, labour, data protection and sector compliance obligations for South Africa.',
                'score_title' => 'Compliance Readiness Score', 'score_label' => 'Compliance Progress',
                'kpis' => [['Obligations Tracked', '15', 'Statutory & regulatory', 'clipboard-list'], ['Next Filing', '31 Aug 2026', 'VAT201 return', 'calendar-days']],
                'tabs' => ['Overview', 'Corporate', 'Tax', 'Labour', 'Data Protection', 'Sector', 'Change History'],
                'domains_title' => 'Compliance by Domain', 'domains_intro' => 'Obligations grouped by regulatory domain.',
                'domains_note' => 'Compliance planning is general guidance only; reserved professional services are routed to licensed partners.',
                'panels' => [
                    ['type' => 'guidance', 'title' => 'Compliance Boundary', 'intro' => 'What this planner does and does not do.', 'items' => [
                        ['ok', 'Maps statutory obligations from current evidence'], ['ok', 'Tracks owners, due dates and status'],
                        ['warn', 'Tax filings on your behalf require a registered tax practitioner'], ['bad', 'TBCA does not provide legal opinions or statutory audits'],
                    ]],
                ],
                'items_title' => 'Open Compliance Obligations', 'items_filter' => 'open',
                'actions' => ['Edit Compliance Plan', 'Add Obligation', 'Export Compliance Plan (PDF)', 'Share Plan'],
                'advisor' => ['Need Compliance Support?', 'Speak to a TBCA Advisor for compliance planning guidance.'],
                'items' => [
                    ['CMP-001', 'CIPC annual return', 'Corporate', 'Legal Team', '2026-09-30', 'High', 'planned'],
                    ['CMP-002', 'Beneficial ownership register', 'Corporate', 'Legal Team', '2026-08-05', 'High', 'completed'],
                    ['CMP-003', 'Share register maintained', 'Corporate', 'Legal Team', '2026-08-01', 'Medium', 'completed'],
                    ['CMP-004', 'VAT201 monthly return', 'Tax', 'Finance Team', '2026-08-31', 'High', 'in_progress', true],
                    ['CMP-005', 'EMP201 monthly PAYE', 'Tax', 'Finance Team', '2026-08-07', 'High', 'completed'],
                    ['CMP-006', 'Provisional tax (IRP6)', 'Tax', 'Finance Team', '2026-08-31', 'High', 'in_progress'],
                    ['CMP-007', 'Tax compliance status pin', 'Tax', 'Finance Team', '2026-08-10', 'Medium', 'completed'],
                    ['CMP-008', 'UIF registration', 'Labour', 'HR Team', '2026-07-30', 'High', 'completed'],
                    ['CMP-009', 'COIDA registration', 'Labour', 'HR Team', '2026-08-02', 'High', 'completed'],
                    ['CMP-010', 'Employment Equity report', 'Labour', 'HR Team', '2027-01-15', 'Medium', 'planned'],
                    ['CMP-011', 'Information Officer registration', 'Data Protection', 'Legal Team', '2026-08-04', 'High', 'completed'],
                    ['CMP-012', 'PAIA manual published', 'Data Protection', 'Legal Team', '2026-08-06', 'Medium', 'completed'],
                    ['CMP-013', 'Processor agreements (POPIA)', 'Data Protection', 'Legal Team', '2026-08-08', 'High', 'completed'],
                    ['CMP-014', 'Sector licence conditions', 'Sector', 'Compliance', '2026-09-05', 'High', 'not_started', true],
                    ['CMP-015', 'B-BBEE affidavit', 'Sector', 'Compliance', '2026-08-20', 'Medium', 'in_progress'],
                ],
            ],
            'launch' => [
                'title' => 'Country Launch Readiness',
                'lead' => 'Validate and confirm all dependencies are in place for a successful market entry launch in South Africa.',
                'score_title' => 'Launch Readiness Score', 'score_label' => 'Overall Readiness',
                'kpis' => [['Key Dependencies', '5', 'In progress', 'link'], ['Target Launch', '15 Jan 2027', 'In 15 weeks', 'calendar-days']],
                'tabs' => ['Readiness Overview', 'Dependency Check', 'Go-Live Checklist', 'Testing & Validation', 'Stakeholders', 'Risks & Issues', 'Documents', 'Change History'],
                'domains_title' => 'Readiness by Category', 'domains_intro' => 'Progress across all launch readiness categories.',
                'domains_note' => 'A launch cannot proceed while any blocking check remains open.',
                'panels' => [
                    ['type' => 'table', 'title' => 'Launch Dependency Status', 'intro' => 'Key dependencies and their current status.', 'columns' => ['Dependency', 'Owner', 'Status', 'Due Date'], 'rows' => [
                        ['Regulatory approvals', 'Legal Team', 'Completed', '20 Aug 2026'], ['Partner agreements', 'Partner Manager', 'In Progress', '25 Aug 2026'], ['Payment provider activation', 'Finance Team', 'In Progress', '28 Aug 2026'],
                        ['Content localisation sign-off', 'Content Team', 'Completed', '18 Aug 2026'], ['Systems integration testing', 'IT Team', 'In Progress', '02 Sep 2026'], ['Go-live support model', 'Operations', 'Not Started', '05 Sep 2026'],
                    ]],
                    ['type' => 'table', 'title' => 'Recent Milestones', 'intro' => 'Key milestones on the path to launch.', 'columns' => ['Milestone', 'Target Date', 'Status'], 'rows' => [
                        ['Country landing plan approved', '18 Aug 2026', 'Completed'], ['Compliance plan approved', '25 Aug 2026', 'Completed'], ['Payment providers activated', '28 Aug 2026', 'In Progress'],
                        ['User acceptance testing', '05 Sep 2026', 'In Progress'], ['Go-live readiness sign-off', '12 Jan 2027', 'Pending'], ['Official market launch', '15 Jan 2027', 'Pending'],
                    ]],
                ],
                'items_title' => 'Critical Blockers', 'items_filter' => 'blocked',
                'actions' => ['Edit Launch Plan', 'Run Readiness Assessment', 'View Go-Live Checklist', 'Upload Evidence Document', 'Export Launch Plan (PDF)', 'Share Plan'],
                'advisor' => ['Need Launch Support?', 'Speak to a TBCA Market Entry Advisor for guidance on your go-live readiness.'],
                'items' => [
                    ['LCH-001', 'Regulatory approvals received', 'Legal & Regulatory', 'Legal Team', '2026-08-20', 'High', 'completed'],
                    ['LCH-002', 'Licence conditions accepted', 'Legal & Regulatory', 'Legal Team', '2026-08-18', 'High', 'completed'],
                    ['LCH-003', 'Outstanding regulatory confirmation: FICA exemption', 'Compliance & Risk', 'Legal Team', '2026-08-20', 'High', 'blocked', true],
                    ['LCH-004', 'Risk register signed off', 'Compliance & Risk', 'Risk Team', '2026-08-15', 'High', 'completed'],
                    ['LCH-005', 'Compliance monitoring live', 'Compliance & Risk', 'Compliance', '2026-08-22', 'Medium', 'completed'],
                    ['LCH-006', 'Payment providers activated', 'Payments & Settlement', 'Finance Team', '2026-08-28', 'High', 'in_progress'],
                    ['LCH-007', 'Settlement reconciliation tested', 'Payments & Settlement', 'Finance Team', '2026-08-26', 'Medium', 'completed'],
                    ['LCH-008', 'Content localisation sign-off', 'Localisation (Content & UX)', 'Content Team', '2026-08-18', 'High', 'completed'],
                    ['LCH-009', 'UX review in Afrikaans', 'Localisation (Content & UX)', 'Product Team', '2026-08-30', 'Medium', 'in_progress'],
                    ['LCH-010', 'Systems integration testing', 'Technology & Integrations', 'IT Team', '2026-09-02', 'High', 'in_progress'],
                    ['LCH-011', 'Monitoring and alerting', 'Technology & Integrations', 'IT Team', '2026-09-03', 'Medium', 'in_progress'],
                    ['LCH-012', 'Partner agreements signed', 'Partner & Provider Setup', 'Partner Manager', '2026-08-25', 'High', 'in_progress'],
                    ['LCH-013', 'Provider SLAs agreed', 'Partner & Provider Setup', 'Partner Manager', '2026-09-08', 'Medium', 'not_started'],
                    ['LCH-014', 'Go-live support model', 'Operations & Support', 'Operations', '2026-09-05', 'High', 'not_started'],
                    ['LCH-015', 'Service desk staffed', 'Operations & Support', 'Operations', '2026-09-12', 'Medium', 'in_progress'],
                    ['LCH-016', 'Incident runbook', 'Operations & Support', 'Operations', '2026-08-29', 'Medium', 'completed'],
                    ['LCH-017', 'Staff training plan', 'Training & Enablement', 'HR Team', '2026-09-15', 'Medium', 'not_started'],
                    ['LCH-018', 'Partner enablement sessions', 'Training & Enablement', 'Partner Manager', '2026-09-20', 'Medium', 'not_started'],
                    ['LCH-019', 'Client onboarding guide', 'Training & Enablement', 'Content Team', '2026-09-10', 'Low', 'in_progress'],
                    ['LCH-020', 'Data migration rehearsal', 'Technology & Integrations', 'IT Team', '2026-09-06', 'High', 'in_progress'],
                    ['LCH-021', 'Rollback plan proven', 'Technology & Integrations', 'IT Team', '2026-08-27', 'High', 'completed'],
                    ['LCH-022', 'Launch communications', 'Localisation (Content & UX)', 'Marketing', '2026-09-25', 'Low', 'not_started'],
                    ['LCH-023', 'Executive go-live approval', 'Legal & Regulatory', 'Executive', '2026-08-31', 'High', 'completed'],
                ],
            ],
            'evidence-audit' => [
                'title' => 'Country Evidence Audit',
                'lead' => 'Audit the currentness, completeness and lineage of all country evidence used across the ecosystem.',
                'score_title' => 'Evidence Audit Score', 'score_label' => 'Evidence Health',
                'kpis' => [['Last Full Audit', '15 Aug 2026', '10:24 SAST', 'calendar-days'], ['Next Audit Due', '15 Nov 2026', 'In 6 weeks', 'refresh']],
                'tabs' => ['Evidence Inventory', 'Currentness & Expiry', 'Completeness', 'Lineage & Source', 'Change Log', 'Issues & Exceptions', 'Audit History'],
                'domains_title' => 'Evidence Health by Domain', 'domains_intro' => 'Share of verified, current evidence per domain.',
                'domains_note' => 'Expired evidence is shown as expired — it is never silently used as current.',
                'panels' => [
                    ['type' => 'table', 'title' => 'Top Issues Requiring Attention', 'columns' => ['Issue', 'Impact', 'Count', 'Oldest Item', 'Owner'], 'rows' => [
                        ['Out of date evidence', 'High', '42', '15 Sep 2025', 'Legal Team'], ['Missing evidence', 'High', '18', '—', 'Content Team'], ['Expiry within 30 days', 'Medium', '36', '25 Aug 2026', 'Compliance Team'],
                        ['Source verification pending', 'Medium', '28', '18 Aug 2026', 'QA Team'], ['Lineage not documented', 'Low', '15', '—', 'Data Team'],
                    ]],
                    ['type' => 'bars', 'title' => 'Evidence Lineage Summary', 'rows' => [['Items with full lineage (612)', 72], ['Partial lineage (146)', 17], ['No lineage recorded (92)', 11]]],
                ],
                'items_title' => 'Evidence Inventory', 'items_filter' => 'all',
                'item_labels' => ['ID', 'Evidence Title', 'Domain', 'Source / Owner', 'Expiry Date', 'Priority', 'Status'],
                'actions' => ['Run Full Evidence Audit', 'Upload Evidence Document', 'Request Source Update', 'Link / Update Lineage', 'Export Audit Report (PDF)', 'Share Audit Report'],
                'advisor' => ['Need Evidence Support?', 'Speak to a TBCA Evidence Advisor for guidance on sourcing or validating evidence.'],
                'items' => [
                    ['EVD-ZA-0001', 'Companies Act 71 of 2008 (Consolidated)', 'Legal & Regulatory', 'Government Gazette', '2027-06-30', 'High', 'completed'],
                    ['EVD-ZA-0002', 'SARS Guide: VAT Act No 89 of 1991', 'Tax & Statutory', 'SARS', '2027-07-12', 'High', 'completed'],
                    ['EVD-ZA-0003', 'POPIA Act 4 of 2013', 'Data & Privacy', 'Government Gazette', '2027-06-20', 'High', 'completed'],
                    ['EVD-ZA-0004', 'CIPC Filing Requirements Manual', 'Compliance & Risk', 'CIPC', '2027-05-28', 'Medium', 'in_progress'],
                    ['EVD-ZA-0005', 'SARB Exchange Control Regulations', 'Payments & Settlement', 'SARB', '2026-10-10', 'High', 'in_progress'],
                    ['EVD-ZA-0006', 'B-BBEE Codes of Good Practice (Gazette 36928)', 'Compliance & Risk', 'DTIC', '2025-09-15', 'Medium', 'blocked', true],
                    ['EVD-ZA-0007', 'FICA Exemption Lists', 'Legal & Regulatory', 'FIC', '2026-02-11', 'High', 'blocked', true],
                    ['EVD-ZA-0008', 'Industry Code: Financial Services Board', 'Industry Specific', 'FSB', '2027-08-05', 'Medium', 'completed'],
                    ['EVD-ZA-0009', 'Income Tax Act 58 of 1962', 'Tax & Statutory', 'Government Gazette', '2027-07-01', 'High', 'completed'],
                    ['EVD-ZA-0010', 'Labour Relations Act 66 of 1995', 'Legal & Regulatory', 'Government Gazette', '2027-07-01', 'Medium', 'completed'],
                    ['EVD-ZA-0011', 'Consumer Protection Act 68 of 2008', 'Legal & Regulatory', 'Government Gazette', '2027-07-01', 'Medium', 'completed'],
                    ['EVD-ZA-0012', 'SARB Exchange Rates (daily)', 'Payments & Settlement', 'SARB', '2026-10-15', 'High', 'completed'],
                    ['EVD-ZA-0013', 'Information Regulator Guidance Notes', 'Data & Privacy', 'Information Regulator', '2027-03-01', 'Medium', 'completed'],
                    ['EVD-ZA-0014', 'Competition Act 89 of 1998', 'Compliance & Risk', 'Government Gazette', '2027-07-01', 'Medium', 'completed'],
                    ['EVD-ZA-0015', 'Customs and Excise Act 91 of 1964', 'Tax & Statutory', 'Government Gazette', '2027-07-01', 'Medium', 'completed'],
                    ['EVD-ZA-0016', 'Banks Act 94 of 1990', 'Industry Specific', 'Government Gazette', '2027-07-01', 'Low', 'completed'],
                    ['EVD-ZA-0017', 'Municipal tariff benchmark', 'Industry Specific', 'SALGA', '2026-12-31', 'Low', 'in_progress'],
                    ['EVD-ZA-0018', 'Payment rail verification pack', 'Payments & Settlement', 'Finance', '2026-11-30', 'High', 'completed'],
                ],
            ],
            'exit' => [
                'title' => 'Country Exit and Deregistration',
                'lead' => 'Safely plan and execute exit from the South African market, including object closure, data handling and deregistration.',
                'score_title' => 'Exit Readiness Score', 'score_label' => 'Exit Readiness',
                'kpis' => [['Critical Dependencies', '3', 'In progress', 'link'], ['Target Exit Date', '30 Nov 2026', 'In 8 weeks', 'calendar-days']],
                'tabs' => ['Exit Overview', 'Exit Plan', 'Object Inventory', 'Deregistration Tasks', 'Data & Records', 'Legal & Regulatory', 'Stakeholders', 'Communications', 'Exit History'],
                'domains_title' => 'Exit Phases', 'domains_intro' => 'Progress across the exit lifecycle.',
                'domains_note' => 'Existing obligations are preserved and resolved according to engagement and law (AL-10 Exit / wind-down).',
                'panels' => [
                    ['type' => 'kv', 'title' => 'Data & Records Handling', 'rows' => [['Data Retention', '7 years'], ['Retention Basis', 'Tax, legal and regulatory'], ['Data Disposition', 'Secure deletion'], ['Records Storage', 'Cloud archive (encrypted)'], ['Access After Exit', 'Restricted (admin only)']]],
                    ['type' => 'guidance', 'title' => 'Post-Exit Obligations', 'intro' => 'Key obligations that continue after market exit.', 'items' => [
                        ['ok', 'Record Retention — maintain records for 7 years or as required by law.'], ['ok', 'Tax Obligations — final tax filings and disputes may continue.'],
                        ['ok', 'Contractual Obligations — existing contracts must be honoured until expiry.'], ['warn', 'Regulatory Updates — monitor regulatory changes affecting obligations.'],
                        ['warn', 'Final Review — post-exit review 90 days after completion.'],
                    ]],
                ],
                'items_title' => 'Critical Issues & Deregistration Tasks', 'items_filter' => 'open',
                'actions' => ['Edit Exit Plan', 'Add Exit Task', 'Request Stakeholder Approval', 'Upload Closure Evidence', 'Export Exit Plan (PDF)', 'Share Exit Plan'],
                'advisor' => ['Need Exit Support?', 'Speak to a TBCA Exit Advisor for guidance on a compliant and risk-free exit.'],
                'items' => [
                    ['EXT-001', 'Exit plan approved', '1. Planning & Approval', 'Exit Manager', '2026-08-20', 'High', 'completed'],
                    ['EXT-002', 'Stakeholder map and approvals', '1. Planning & Approval', 'Exit Manager', '2026-08-20', 'High', 'completed'],
                    ['EXT-003', 'Disable new activity', '2. Decommissioning', 'Operations', '2026-09-01', 'High', 'completed'],
                    ['EXT-004', 'Client notifications issued', '2. Decommissioning', 'Comms Team', '2026-09-05', 'High', 'completed'],
                    ['EXT-005', 'Outstanding VAT deregistration', '2. Decommissioning', 'Tax Team', '2026-08-25', 'High', 'in_progress', true],
                    ['EXT-006', 'Partner agreement terminations', '3. Object Closure', 'Partner Manager', '2026-08-28', 'High', 'blocked', true],
                    ['EXT-007', 'Close payment gateways', '3. Object Closure', 'Finance Team', '2026-09-05', 'Medium', 'in_progress'],
                    ['EXT-008', 'Close commercial objects', '3. Object Closure', 'Operations', '2026-09-20', 'Medium', 'completed'],
                    ['EXT-009', 'SARS deregistration', '4. Deregistration', 'Tax Team', '2026-09-12', 'High', 'completed'],
                    ['EXT-010', 'CIPC deregistration', '4. Deregistration', 'Legal Team', '2026-09-25', 'High', 'blocked'],
                    ['EXT-011', 'Bank account closure', '4. Deregistration', 'Finance Team', '2026-10-10', 'Medium', 'completed'],
                    ['EXT-012', 'Domain & digital assets closure', '4. Deregistration', 'IT Team', '2026-11-05', 'Low', 'completed'],
                    ['EXT-013', 'Records archived (7-year retention)', '5. Post-Exit Monitoring', 'Data Team', '2026-11-20', 'Medium', 'completed'],
                    ['EXT-014', 'Post-exit review scheduled', '5. Post-Exit Monitoring', 'Exit Manager', '2027-01-31', 'Low', 'not_started'],
                ],
            ],
            'diaspora' => [
                'title' => 'Diaspora and Inbound Capital',
                'lead' => 'Country-context information to help diaspora and foreign investors explore opportunities in South Africa. Not investment advice. Professional advice required.',
                'score_title' => 'Capital Opportunity Score', 'score_label' => 'Inbound Capital Readiness',
                'kpis' => [['Key Opportunities', '12', 'High-potential sectors', 'trending-up'], ['Key Constraints', '4', 'Require attention', 'triangle-alert']],
                'tabs' => ['Overview', 'Diaspora Market', 'Inbound Capital Environment', 'Sectors & Opportunities', 'Regulatory & Legal', 'Incentives & Support', 'Money Movement', 'Risks & Mitigations'],
                'domains_title' => 'Inbound Capital Environment', 'domains_intro' => 'How welcoming is South Africa to foreign capital? (indicators met per area)',
                'domains_note' => 'Reflects overall attractiveness for diaspora and inbound capital. Not investment advice.',
                'panels' => [
                    ['type' => 'kv', 'title' => 'Diaspora Snapshot', 'intro' => 'South African diaspora at a glance.', 'rows' => [['Estimated Global Size', '3.0M+'], ['Top 5 Destinations', 'USA, UK, Australia, Canada, UAE'], ['Remittances to SA (Est.)', 'R18.5B (2024 est.)'], ['YoY Growth', '+6.2% (2023–2024)']]],
                    ['type' => 'table', 'title' => 'Top Sectors for Inbound Capital', 'columns' => ['Sector', 'Opportunity', 'Policy Support', 'Readiness'], 'rows' => [['Renewable Energy', 'High', 'High', '77%'], ['Mining & Critical Minerals', 'High', 'Medium', '74%'], ['Infrastructure (Transport)', 'High', 'High', '71%'], ['Agri-processing & Food', 'Medium', 'Medium', '66%'], ['Technology & Digital Services', 'Medium', 'Medium', '64%']]],
                    ['type' => 'table', 'title' => 'Incentives & Support', 'columns' => ['Incentive Type', 'Applicable To', 'Level', 'Status'], 'rows' => [['SEZ Tax Incentives', 'Manufacturing, Logistics', 'High', 'Active'], ['12I Tax Allowance', 'Greenfield Projects', 'High', 'Active'], ['Critical Infrastructure Support', 'Infrastructure Projects', 'Medium', 'Active'], ['Export Incentive Scheme', 'Export-Oriented', 'Medium', 'Active'], ['R&D Tax Incentive', 'Innovation Projects', 'Medium', 'Active']]],
                    ['type' => 'table', 'title' => 'Money Movement', 'columns' => ['Area', 'Ease', 'Notes'], 'rows' => [['Opening Local Account', 'Easy', 'Standard KYC/AML applies'], ['Forex Inflow', 'Easy', 'Via authorised dealers'], ['Profit Repatriation', 'Easy', 'Subject to tax compliance'], ['Capital Outflow', 'Conditional', 'Subject to SARB exchange control rules'], ['Remittances to SA', 'Easy', 'Multiple channels available']]],
                    ['type' => 'table', 'title' => 'Key Risks & Mitigations', 'columns' => ['Risk', 'Impact', 'Mitigation'], 'rows' => [['Regulatory Changes', 'Medium', 'Monitor policy updates'], ['Energy Supply Constraints', 'Medium', 'Diversify & plan'], ['Infrastructure Bottlenecks', 'Medium', 'Use SEZs / hubs'], ['Currency Volatility', 'Medium', 'Hedge where appropriate']]],
                ],
                'items_title' => 'Indicators Not Yet Met', 'items_filter' => 'open',
                'item_labels' => ['ID', 'Indicator', 'Area', 'Source', 'Review Date', 'Weight', 'Status'],
                'actions' => ['Request Professional Advice', 'Save to My Opportunities', 'Download Capital Brief (PDF)', 'Share This Page', 'Add to Watchlist'],
                'advisor' => ['Need Capital Guidance?', 'Speak to a TBCA Capital + Advisory Partner for country-specific, compliant guidance.'],
                'items' => [
                    ['DIC-001', 'Foreign ownership permitted', 'Inbound Capital Environment', 'DTIC', '2026-11-15', 'High', 'completed'],
                    ['DIC-002', 'Repatriation of capital', 'Inbound Capital Environment', 'SARB', '2026-11-15', 'High', 'completed'],
                    ['DIC-003', 'Currency convertibility', 'Inbound Capital Environment', 'SARB', '2026-11-15', 'High', 'completed'],
                    ['DIC-004', 'Profit repatriation', 'Inbound Capital Environment', 'SARS / SARB', '2026-11-15', 'High', 'completed'],
                    ['DIC-005', 'Regulatory transparency', 'Regulatory & Legal', 'Authority', '2026-11-15', 'Medium', 'in_progress'],
                    ['DIC-006', 'Diaspora population sourced', 'Diaspora Market', 'Stats SA', '2026-11-15', 'Medium', 'completed'],
                    ['DIC-007', 'Remittance flows sourced', 'Diaspora Market', 'SARB', '2026-11-15', 'Medium', 'completed'],
                    ['DIC-008', 'Destination country mapping', 'Diaspora Market', 'Research', '2026-11-15', 'Low', 'completed'],
                    ['DIC-009', 'Renewable energy pipeline', 'Sectors & Opportunities', 'IPPO', '2026-11-15', 'High', 'completed'],
                    ['DIC-010', 'Critical minerals policy', 'Sectors & Opportunities', 'DMRE', '2026-11-15', 'High', 'completed'],
                    ['DIC-011', 'Transport infrastructure pipeline', 'Sectors & Opportunities', 'Infrastructure SA', '2026-11-15', 'High', 'completed'],
                    ['DIC-012', 'Agri-processing incentives', 'Sectors & Opportunities', 'DALRRD', '2026-11-15', 'Medium', 'in_progress'],
                    ['DIC-013', 'SEZ incentives verified', 'Incentives & Support', 'DTIC', '2026-11-15', 'High', 'completed'],
                    ['DIC-014', '12I allowance verified', 'Incentives & Support', 'SARS', '2026-11-15', 'High', 'completed'],
                    ['DIC-015', 'R&D incentive verified', 'Incentives & Support', 'DSI', '2026-11-15', 'Medium', 'completed'],
                    ['DIC-016', 'Export incentive verified', 'Incentives & Support', 'DTIC', '2026-11-15', 'Medium', 'in_progress'],
                    ['DIC-017', 'Local account opening rules', 'Money Movement', 'Banks', '2026-11-15', 'Medium', 'completed'],
                    ['DIC-018', 'Forex inflow routes', 'Money Movement', 'SARB', '2026-11-15', 'Medium', 'completed'],
                    ['DIC-019', 'Capital outflow rules', 'Money Movement', 'SARB', '2026-11-15', 'High', 'blocked', true],
                    ['DIC-020', 'Investor visa pathways', 'Regulatory & Legal', 'DHA', '2026-11-15', 'Medium', 'in_progress'],
                    ['DIC-021', 'Investment protection law', 'Regulatory & Legal', 'Government Gazette', '2026-11-15', 'High', 'completed'],
                    ['DIC-022', 'Dispute resolution access', 'Regulatory & Legal', 'Courts', '2026-11-15', 'Medium', 'completed'],
                    ['DIC-023', 'Energy supply risk assessed', 'Risks & Mitigations', 'Eskom / NERSA', '2026-11-15', 'Medium', 'blocked', true],
                    ['DIC-024', 'Currency volatility assessed', 'Risks & Mitigations', 'SARB', '2026-11-15', 'Medium', 'in_progress'],
                    ['DIC-025', 'Infrastructure bottlenecks assessed', 'Risks & Mitigations', 'Transnet', '2026-11-15', 'Medium', 'not_started'],
                ],
            ],
        ];
    }
}
