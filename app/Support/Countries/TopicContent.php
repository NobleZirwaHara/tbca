<?php

namespace App\Support\Countries;

use App\Models\Countries\Country;

/**
 * Country disclosure topics (CT-011 to CT-016). South Africa carries evidence-backed
 * content; every shell country returns the governed UNRESOLVED treatment (Appendix W:
 * never populate a country's tax, language, legal or privacy facts from model memory).
 *
 * Block types: kv (label/value/check), checklist, table, cards, note.
 * Action kinds: tab:<Tab>, href:<path>, ask, download, resolver.
 */
class TopicContent
{
    public const TOPICS = ['tax', 'payments', 'languages', 'partners', 'legal', 'privacy'];

    public const TRUST = [
        ['Evidence First', 'All statements are evidence-backed and date-stamped.'],
        ['Secure & Compliant', 'POPIA & ISO 27001 aligned. Enterprise-grade controls.'],
        ['Human-Reviewed', 'All content reviewed by qualified subject matter experts.'],
        ['Always Current', 'Real-time updates and continuous monitoring.'],
    ];

    public static function titles(): array
    {
        return [
            'tax' => 'Country Tax and Statutory Disclosure',
            'payments' => 'Country Payment Methods',
            'languages' => 'Country Language and Localisation',
            'partners' => 'Country Partner and Professional Boundary',
            'legal' => 'Country Legal and Regulatory Boundary',
            'privacy' => 'Country Privacy and Data Residency',
        ];
    }

    public static function for(Country $country, string $topic): array
    {
        if ($country->iso2 === 'ZA') {
            return ['key' => $topic, 'title' => self::titles()[$topic], ...self::southAfrica($topic)];
        }

        return self::unresolved($country, $topic);
    }

    private static function unresolved(Country $country, string $topic): array
    {
        $fields = [
            'tax' => ['Tax framework and administering authority', 'VAT / indirect tax treatment', 'Corporate income tax rate', 'Withholding taxes', 'Statutory obligations register', 'Filing and payment rules'],
            'payments' => ['Verified payment rails', 'Settlement model and timing', 'Refund and chargeback rules', 'FX convertibility and transferability', 'Repatriation conditions', 'Gateway permission'],
            'languages' => ['Official languages (country source)', 'Approved publication languages', 'Script and RTL controls', 'Legal-copy translation status', 'Terminology control'],
            'partners' => ['Verified professional partners', 'Reserved professional services', 'Regulatory authorities for reserved services', 'Conflict and independence records', 'Partner capacity'],
            'legal' => ['Legal system (qualified source)', 'Supply permission', 'Licensing requirements', 'Consumer protection rules', 'Dispute resolution route', 'Sanctions / prohibition screening'],
            'privacy' => ['Privacy regime and regulator', 'Lawful basis rules', 'Data residency requirement', 'Cross-border transfer rules', 'Breach notification rules', 'Processor approvals'],
        ][$topic];

        $codes = ['tax' => 'ABS-05', 'payments' => 'ABS-06', 'languages' => 'ABS-01', 'partners' => 'ABS-07', 'legal' => 'ABS-05', 'privacy' => 'ABS-01'];

        return [
            'key' => $topic,
            'title' => self::titles()[$topic],
            'lead' => "{$country->name} is a shell country object. These fields are UNRESOLVED and will only be populated from approved country evidence.",
            'kpis' => [
                ['label' => 'Country State', 'value' => 'Shell', 'caption' => 'Not active / not authorised', 'icon' => 'layers'],
                ['label' => 'Fields Resolved', 'value' => '0 of '.count($fields), 'caption' => 'Populate from approved source', 'icon' => 'database'],
                ['label' => 'Commercial Treatment', 'value' => 'No transaction', 'caption' => 'No numeric price', 'icon' => 'lock'],
                ['label' => 'Gate Status', 'value' => 'G-D1..G-D9', 'caption' => 'Not passed for activation', 'icon' => 'shield'],
            ],
            'tabs' => ['Overview'],
            'blocks' => [
                [
                    'type' => 'table', 'title' => 'Required fields — current state', 'span' => 2, 'tabs' => ['Overview'],
                    'intro' => 'Do not populate a country\'s facts from model memory. Each field below needs current approved country evidence.',
                    'columns' => ['Field', 'State', 'Absence Code', 'Why it matters', 'Closure path'],
                    'rows' => array_map(fn ($f) => [$f, 'UNRESOLVED', $codes[$topic], 'Blocks price, route and publication for this country.', 'Sovereign source sweep and qualified review'], $fields),
                ],
                ['type' => 'note', 'title' => 'Honest absence', 'span' => 2, 'tabs' => ['Overview'], 'tone' => 'warn', 'body' => CountryRegister::absenceCopy($codes[$topic])],
            ],
            'status' => ['title' => 'Resolution Status', 'rows' => [
                ['Country State', 'Shell', 'warn'], ['Programme Status', $country->programme_status, 'neutral'],
                ['Fields Resolved', '0 / '.count($fields), 'bad'], ['Commercial Availability', 'Not authorised', 'bad'],
            ]],
            'important' => 'Country search does not imply commercial permission. No Resolution, No Price.',
            'actions' => [
                ['label' => 'Register Interest', 'kind' => 'href:/countries/'.$country->slug.'/waitlist'],
                ['label' => 'View Limitations & Absence', 'kind' => 'href:/countries/'.$country->slug.'/limitations'],
                ['label' => 'Ask a Question', 'kind' => 'ask'],
            ],
            'advisor' => ['Need Guidance?', 'Speak to a TBCA Advisor about this market.'],
            'trust' => self::TRUST,
            'footer' => 'Information only. Not legal or tax advice.',
        ];
    }

    private static function southAfrica(string $topic): array
    {
        $slug = '/countries/south-africa';

        return match ($topic) {
            'tax' => [
                'lead' => 'Understand the applicable tax framework, statutory obligations and compliance considerations for commercial engagement.',
                'kpis' => [
                    ['label' => 'Tax Framework', 'value' => 'SARS', 'caption' => 'Administered by SARS', 'icon' => 'landmark'],
                    ['label' => 'VAT Rate (Standard)', 'value' => '15%', 'caption' => 'Effective 1 Apr 2018', 'icon' => 'percent'],
                    ['label' => 'Corporate Income Tax', 'value' => '27%', 'caption' => 'Standard rate', 'icon' => 'briefcase'],
                    ['label' => 'Disclosure Status', 'value' => 'Current', 'caption' => 'All critical items current', 'icon' => 'shield-check'],
                ],
                'tabs' => ['Tax Overview', 'VAT / Indirect Taxes', 'Corporate Taxes', 'Other Taxes', 'Withholding Taxes', 'Statutory Obligations', 'Incentives & Relief', 'Double Taxation', 'Filing & Payments', 'Change History'],
                'blocks' => [
                    ['type' => 'kv', 'title' => 'Tax Overview', 'tabs' => ['Tax Overview', 'Other Taxes', 'Withholding Taxes'], 'intro' => 'South Africa applies a territorial tax system with a self-assessment basis. Taxes are administered by the South African Revenue Service (SARS).', 'head' => ['Tax Type', 'Applies'], 'rows' => [
                        ['Value Added Tax (VAT)', 'Yes', 'ok'], ['Corporate Income Tax (CIT)', 'Yes', 'ok'], ['Pay-As-You-Earn (PAYE)', 'Yes', 'ok'], ['Skills Development Levy (SDL)', 'Yes', 'ok'],
                        ['Unemployment Insurance Fund (UIF)', 'Yes', 'ok'], ['Capital Gains Tax (CGT)', 'Yes', 'ok'], ['Dividends Tax', 'Yes', 'ok'], ['Withholding Taxes', 'Yes', 'ok'],
                        ['Excise Duties', 'Yes', 'ok'], ['Transfer Duties', 'Yes', 'ok'], ['Provincial Taxes', 'No', 'no'], ['Local Taxes', 'Varies by municipality', 'warn'],
                    ]],
                    ['type' => 'checklist', 'title' => 'Key Tax Highlights', 'tabs' => ['Tax Overview', 'VAT / Indirect Taxes', 'Corporate Taxes', 'Filing & Payments'], 'items' => [
                        'VAT is charged on most goods and services at the standard rate of 15%.',
                        'Corporate Income Tax standard rate is 27% (2024/25).',
                        'Provisional tax system applies to all corporate taxpayers.',
                        'Transfer pricing rules apply to connected persons.',
                        'Electronic filing and payment are mandatory for most taxes.',
                        'Non-residents may be subject to withholding taxes on South African sourced income.',
                    ]],
                    ['type' => 'note', 'title' => 'Important Disclaimer', 'tabs' => ['Tax Overview', 'Incentives & Relief', 'Double Taxation'], 'tone' => 'info', 'body' => 'This information is provided for general guidance only and does not constitute tax advice. Tax treatment depends on your specific facts and circumstances. Consult a qualified tax professional for tailored advice.', 'cta' => ['Speak to a TBCA Advisor', 'ask']],
                    ['type' => 'list', 'title' => 'Source & Authority', 'tabs' => ['Tax Overview', 'Statutory Obligations', 'Double Taxation'], 'items' => ['South African Revenue Service (SARS)', 'Income Tax Act, 1962 (Act 58 of 1962)', 'Value Added Tax Act, 1991 (Act 89 of 1991)', 'Customs and Excise Act, 1964 (Act 91 of 1964)'], 'cta' => ['View All Sources', 'href:'.$slug.'/registers/sources']],
                    ['type' => 'list', 'title' => 'Statutory Stores & Registers', 'tabs' => ['Statutory Obligations', 'Filing & Payments'], 'items' => ['Companies and Intellectual Property Commission (CIPC)', 'SARS eFiling', 'Unemployment Insurance Fund (UIF)', 'Compensation Fund (COIDA)']],
                ],
                'status' => ['title' => 'Tax Treatment Summary', 'rows' => [
                    ['Tax Residency Rules', 'Based on residence & source principles', 'neutral'], ['Basis of Taxation', 'Self-assessment', 'neutral'], ['Tax Year', '1 Mar – 28/29 Feb', 'neutral'],
                    ['Returns Filing Frequency', 'Annual / Monthly', 'neutral'], ['E-Invoicing Requirement', 'Phased rollout', 'neutral'], ['Primary Regulator', 'SARS', 'neutral'],
                ], 'cta' => ['View Full Tax Guide', 'download']],
                'important' => null,
                'actions' => [['label' => 'Check Tax Applicability', 'kind' => 'resolver'], ['label' => 'Download Tax Summary (PDF)', 'kind' => 'download'], ['label' => 'Request Tax Clarification', 'kind' => 'ask'], ['label' => 'Ask a Question', 'kind' => 'ask']],
                'advisor' => ['Need Specialist Input?', 'Speak to a TBCA Advisor for tailored tax guidance.'],
                'trust' => self::TRUST,
                'footer' => 'Information only. Not legal or tax advice.',
            ],
            'payments' => [
                'lead' => 'Understand the payment methods, settlement conditions and resolver-controlled payment rules for commercial engagement.',
                'kpis' => [
                    ['label' => 'Payment Framework', 'value' => 'Resolver-Governed', 'caption' => '', 'icon' => 'shield'],
                    ['label' => 'Resolver Status', 'value' => 'Complete', 'caption' => '', 'icon' => 'shield-check'],
                    ['label' => 'Gateway Status', 'value' => 'Conditional', 'caption' => 'by method', 'icon' => 'wallet'],
                    ['label' => 'Evidence Status', 'value' => 'Current', 'caption' => 'All critical items current', 'icon' => 'badge-check'],
                ],
                'tabs' => ['Payment Overview', 'Available Methods', 'Settlement & Timing', 'FX & Currency', 'Gateway & Compliance', 'Limitations', 'Change History'],
                'blocks' => [
                    ['type' => 'table', 'title' => 'Payment Method Availability', 'span' => 2, 'tabs' => ['Payment Overview', 'Available Methods', 'Settlement & Timing'], 'columns' => ['Method', 'Use Case', 'Availability State', 'Resolver Dependency', 'Settlement Model'], 'rows' => [
                        ['Bank Transfer / EFT', 'Local payments, supplier settlement, invoicing', 'Available', 'Resolver data complete', 'T+1 to T+2 (business days)'],
                        ['Invoice Settlement', 'B2B invoicing, milestone and project billing', 'Active-Limited', 'Depends on resolver and credit context', 'Agreed terms (case-by-case)'],
                        ['Card Payment', 'Online payments, one-off purchases', 'Active-Limited', 'Gateway and risk conditions apply', 'Near real-time authorization'],
                        ['Recurring Collection', 'Subscriptions, mandates, recurring billing', 'Conditional', 'Mandate, resolver and customer consent', 'Per cycle mandate execution'],
                        ['Foreign Currency Inbound', 'Inbound payments in foreign currency', 'Conditional', 'FX handling and licence checks', 'T+1 to T+3 (subject to FX)'],
                        ['Cross-Border Settlement', 'Inter-country funds movement', 'Quote-Only', 'Pair-specific corridor and compliance checks', 'Varies by pair and corridor'],
                        ['Cash', 'Cash payments and collections', 'Not Permitted', 'Policy and compliance restriction', 'Not applicable'],
                    ]],
                    ['type' => 'checklist', 'title' => 'Payment Principles', 'tabs' => ['Payment Overview', 'Gateway & Compliance', 'FX & Currency'], 'items' => ['No resolution, no price', 'No unsupported FX conversion', 'Gateway depends on context', 'Liquidity and licence checks apply', 'Commercial availability is service-by-service', 'Sanctions and prohibitions cannot be overridden']],
                    ['type' => 'list', 'title' => 'Settlement Notes', 'tabs' => ['Payment Overview', 'Settlement & Timing', 'Limitations'], 'items' => ['Local methods may be available when resolver fields are complete', 'Cross-border settlement is pair-specific', 'Payment terms follow service context and commercial permission', 'Audit trail required for all material transactions']],
                    ['type' => 'note', 'title' => 'Commercial Guardrail', 'tabs' => ['Payment Overview', 'Limitations'], 'tone' => 'warn', 'body' => 'No Resolution, No Price. Payment readiness does not itself create price authority.'],
                ],
                'status' => ['title' => 'Payment Control Summary', 'rows' => [
                    ['Country State', 'Activated', 'good'], ['Resolver Completeness', '100%', 'neutral'], ['Evidence Status', 'Current', 'good'], ['Base Currency', 'ZAR', 'neutral'],
                    ['Commercial Availability', 'Service-by-service', 'gold'], ['Cross-Border Settlement', 'Pair-specific permission required', 'gold'],
                ]],
                'important' => 'Country search does not imply commercial permission. No Resolution, No Price.',
                'actions' => [['label' => 'Check Payment Eligibility', 'kind' => 'resolver'], ['label' => 'Download Payment Guide', 'kind' => 'download'], ['label' => 'Request Payment Clarification', 'kind' => 'ask'], ['label' => 'Ask a Question', 'kind' => 'ask']],
                'advisor' => null,
                'trust' => [...self::TRUST, ['Audit Ready', 'Comprehensive audit trail for all payment-related actions.']],
                'footer' => 'Information only. Not legal or tax advice.',
            ],
            'languages' => [
                'lead' => 'Manage supported languages, content localisation, terminology and cultural adaptation for South Africa.',
                'kpis' => [
                    ['label' => 'Primary Languages', 'value' => 'English, Afrikaans', 'caption' => '2 primary', 'icon' => 'message-circle'],
                    ['label' => 'Content Localised', 'value' => '87%', 'caption' => 'Of active content', 'icon' => 'globe'],
                    ['label' => 'Last Updated', 'value' => '15 Aug 2026', 'caption' => '10:24 SAST', 'icon' => 'languages'],
                    ['label' => 'Localisation Status', 'value' => 'Current', 'caption' => 'All critical content current', 'icon' => 'shield-check'],
                ],
                'tabs' => ['Overview', 'Supported Languages', 'Content Languages', 'Terminology & Style', 'Formatting & Units', 'Date & Time', 'Numbers & Currency', 'Localisation Assets', 'Change History'],
                'blocks' => [
                    ['type' => 'kv', 'title' => 'Language Overview', 'tabs' => ['Overview', 'Content Languages', 'Formatting & Units', 'Date & Time', 'Numbers & Currency'], 'intro' => 'South Africa supports multiple official languages and operates in a bilingual business environment.', 'rows' => [
                        ['Primary Languages', 'English, Afrikaans', null], ['Other Official Languages', '11', null], ['Content Available In', 'EN, AF', null], ['RTL Support', 'No', null],
                        ['Unicode & UTF-8', 'Supported', null], ['Character Set', 'Latin', null], ['Localisation Completion', '87%', null],
                    ], 'footer' => 'English is the predominant business language. Afrikaans content is fully supported. Other official languages are not currently localised.'],
                    ['type' => 'table', 'title' => 'Supported Languages', 'tabs' => ['Overview', 'Supported Languages', 'Localisation Assets'], 'intro' => 'Languages available for content, documents and communications.', 'columns' => ['Language', 'Code', 'Native Name', 'Status', 'Content Coverage'], 'rows' => [
                        ['English', 'EN', 'English', 'Primary', '100%'], ['Afrikaans', 'AF', 'Afrikaans', 'Primary', '100%'], ['Zulu', 'ZU', 'isiZulu', 'Available', '15%'],
                        ['Xhosa', 'XH', 'isiXhosa', 'Planned', '0%'], ['Sesotho', 'ST', 'Sesotho', 'Planned', '0%'], ['Tswana', 'TN', 'Setswana', 'Planned', '0%'],
                    ]],
                    ['type' => 'checklist', 'title' => 'Terminology & Style Controls', 'tabs' => ['Terminology & Style'], 'items' => ['English is the controlled source language', 'Afrikaans legal and commercial copy requires human review before publication', 'TBCA Terminology Standard applies to all translations', 'Absence and limitation copy is published from the controlled EN/AF copy set']],
                ],
                'status' => ['title' => 'Localisation Readiness', 'rows' => [
                    ['Language Framework', 'Complete', 'good'], ['Primary Languages', 'Complete', 'good'], ['Content Localisation', '87%', 'neutral'],
                    ['Legal Translations', 'Current', 'good'], ['Terminology Control', 'Complete', 'good'], ['Cultural Adaptation', 'In Progress', 'info'],
                ]],
                'important' => 'Content in other official languages is not currently localised. English and Afrikaans content is complete.',
                'actions' => [['label' => 'Manage Supported Languages', 'kind' => 'href:'.$slug.'/plan/language-pack'], ['label' => 'View Localisation Assets', 'kind' => 'tab:Localisation Assets'], ['label' => 'Download Language Pack', 'kind' => 'download'], ['label' => 'Request Translation', 'kind' => 'ask'], ['label' => 'Ask a Question', 'kind' => 'ask']],
                'advisor' => ['Need Localisation Support?', 'Speak to a TBCA Advisor for translation, localisation or content adaptation needs.'],
                'trust' => [...self::TRUST, ['Cultural Accuracy', 'Content adapted for local context, not just translated.']],
                'footer' => 'Information only. Not legal or tax advice.',
            ],
            'partners' => [
                'lead' => 'Confirm partner ecosystem, professional boundaries and regulated service routing for South Africa.',
                'kpis' => [
                    ['label' => 'Approved Partners', 'value' => '312', 'caption' => 'Across 14 categories', 'icon' => 'users'],
                    ['label' => 'Professional Boundaries', 'value' => '24', 'caption' => 'Mandatory rules active', 'icon' => 'shield'],
                    ['label' => 'Boundary Breaches Prevented', 'value' => '0', 'caption' => 'Last 30 days', 'icon' => 'triangle-alert'],
                    ['label' => 'Last Reviewed', 'value' => '15 Aug 2026', 'caption' => '10:24 SAST', 'icon' => 'calendar-days'],
                ],
                'tabs' => ['Overview', 'Partner Directory', 'Professional Boundary Rules', 'Regulated Services', 'Routing & Requirements', 'Conflict & Independence', 'Change History'],
                'blocks' => [
                    ['type' => 'cards', 'title' => 'Professional Boundary Overview', 'tabs' => ['Overview', 'Professional Boundary Rules', 'Routing & Requirements'], 'intro' => 'How we distinguish TBCA advisory from regulated professional services and partner engagement.', 'items' => [
                        ['Advisory Services (TBCA)', 'Business advisory, information and documentation support.', 'Permitted', 'good'],
                        ['Partner-Delivered Services', 'Provided by verified independent partners under mandate.', 'Route via Partner', 'warn'],
                        ['Reserved / Regulated Services', 'Legally reserved for licensed professionals.', 'Not Provided by TBCA', 'bad'],
                        ['Referral / Introductions', 'Introductions only. No advice or execution by TBCA.', 'Permitted with Rules', 'info'],
                    ]],
                    ['type' => 'checklist', 'title' => 'Professional Boundary Principles', 'tabs' => ['Overview', 'Professional Boundary Rules', 'Conflict & Independence'], 'items' => ['TBCA does not provide reserved professional services.', 'All regulated services are routed to appropriately licensed partners.', 'No staff member will act in a reserved capacity.', 'Partner engagement follows independence and conflict rules.', 'Clients are informed of the boundary before engagement.', 'Evidence of boundary compliance is retained.']],
                    ['type' => 'table', 'title' => 'Reserved / Regulated Services – TBCA Does Not Provide', 'span' => 2, 'tabs' => ['Overview', 'Regulated Services', 'Routing & Requirements', 'Partner Directory'], 'columns' => ['Service Category', 'Examples', 'Regulatory Authority', 'Routing Requirement', 'Status'], 'rows' => [
                        ['Legal Services', 'Litigation, Legal opinions, Conveyancing', 'Legal Practice Council (LPC)', 'Route to Independent Attorney', 'Not Provided'],
                        ['Audit & Assurance', 'Statutory audits, Reviews, Compilations', 'IRBA', 'Route to Registered Auditor', 'Not Provided'],
                        ['Tax Compliance (Practising)', 'Tax return submission, Tax opinions', 'SARS / SAICA', 'Route to Tax Practitioner', 'Not Provided'],
                        ['Financial Advisory (Regulated)', 'Investment advice, Underwriting', 'FSCA', 'Route to Licensed Provider', 'Not Provided'],
                        ['Company Secretarial (Statutory)', 'Company secretarial officer services', 'CIPC', 'Route to Accredited Provider', 'Not Provided'],
                    ], 'cta' => ['View All Reserved Services (24)', 'href:/countries/south-africa/sovereign-panel']],
                ],
                'status' => ['title' => 'Boundary Compliance Status', 'rows' => [
                    ['Overall Compliance', 'Compliant', 'good'], ['Partner Boundary Agreements', '312 / 312', 'neutral'], ['Independence Confirmations', '312 / 312', 'neutral'],
                    ['Conflict Checks (30 days)', '1 184', 'neutral'], ['Breaches Logged (30 days)', '0', 'neutral'],
                ]],
                'important' => 'Using a non-compliant route for regulated services may create legal or professional consequences. Obtain independent legal or regulatory advice where required.',
                'actions' => [['label' => 'View Partner Directory', 'kind' => 'href:/countries/sovereign/panel'], ['label' => 'View Boundary Rules', 'kind' => 'tab:Professional Boundary Rules'], ['label' => 'View Regulated Services', 'kind' => 'tab:Regulated Services'], ['label' => 'Check Conflict Before Engagement', 'kind' => 'ask'], ['label' => 'Download Boundary Guide', 'kind' => 'download']],
                'advisor' => ['Need Guidance?', 'Speak to a TBCA Advisor for boundary or partner engagement guidance.'],
                'trust' => [...self::TRUST, ['Expert Support', 'Get advice from our network of qualified professionals.']],
                'footer' => 'Information only. Not legal or tax advice.',
            ],
            'legal' => [
                'lead' => 'Understand jurisdictional limits, licensing requirements, regulatory scope and legal boundaries for commercial engagement in South Africa.',
                'kpis' => [
                    ['label' => 'Regulatory Environment', 'value' => 'Developed', 'caption' => 'Predictable & well established', 'icon' => 'scale'],
                    ['label' => 'Licensing Requirements', 'value' => 'Medium', 'caption' => 'Sector specific', 'icon' => 'clipboard-list'],
                    ['label' => 'Legal System', 'value' => 'Common Law', 'caption' => 'Based on Roman-Dutch law', 'icon' => 'shield'],
                    ['label' => 'Last Reviewed', 'value' => '15 Aug 2026', 'caption' => '10:24 SAST', 'icon' => 'calendar-days'],
                ],
                'tabs' => ['Overview', 'Legal Framework', 'Regulatory Authorities', 'Licences & Registrations', 'Sector Restrictions', 'Compliance Obligations', 'Dispute Resolution', 'Change History'],
                'blocks' => [
                    ['type' => 'kv', 'title' => 'Jurisdictional Overview', 'tabs' => ['Overview', 'Legal Framework', 'Dispute Resolution'], 'intro' => 'South Africa operates under a constitutional democracy with an independent judiciary.', 'rows' => [
                        ['Constitution', 'Constitution of the Republic of South Africa, 1996', null], ['Legal System', 'Common Law (Roman-Dutch foundation)', null], ['Government Type', 'Parliamentary Republic', null],
                        ['Regulator Independence', 'High', 'ok'], ['Judicial Independence', 'High', 'ok'], ['Contract Enforceability', 'Strong', 'ok'], ['Arbitration Recognition', 'Enforced (New York Convention)', 'ok'],
                        ['Language of Law', 'English (primary), Afrikaans (co-official)', null], ['Time Zone', 'SAST (UTC+2)', null], ['Date of Law', '01 Jul 2026', null],
                    ]],
                    ['type' => 'checklist', 'title' => 'Key Legal Implications for Engagement', 'tabs' => ['Overview', 'Compliance Obligations', 'Licences & Registrations', 'Sector Restrictions'], 'items' => ['All engagements must comply with South African law and applicable sector regulations.', 'Certain services require licensing, registration or specific professional accreditation.', 'Foreign entities may be subject to local incorporation or registration requirements.', 'Consumer protection, POPIA and tax compliance obligations apply to all engagements.', 'Cross-border data transfers are governed by POPIA and data adequacy rules.', 'Dispute resolution through courts or arbitration within South Africa is available.']],
                    ['type' => 'list', 'title' => 'Regulatory Boundary Principles', 'tabs' => ['Overview', 'Sector Restrictions'], 'items' => ['TBCA does not provide reserved legal or regulated professional services.', 'All regulated services are delivered by licensed, independent partners.', 'Engagements follow all mandatory legal, regulatory and professional rules.', 'Operating outside the legal boundary may create legal or regulatory consequences.']],
                    ['type' => 'table', 'title' => 'Key Regulatory Authorities', 'span' => 2, 'tabs' => ['Overview', 'Regulatory Authorities', 'Licences & Registrations'], 'columns' => ['Authority', 'Mandate', 'Website', 'Relevance', 'Engagement Requirement'], 'rows' => [
                        ['Companies and Intellectual Property Commission (CIPC)', 'Company registration, IP, business records', 'www.cipc.co.za', 'High', 'Registration / Compliance'],
                        ['Financial Sector Conduct Authority (FSCA)', 'Financial services regulation', 'www.fsca.co.za', 'High', 'Authorisation / Compliance'],
                        ['South African Revenue Service (SARS)', 'Tax administration and customs', 'www.sars.gov.za', 'High', 'Tax Compliance'],
                        ['Information Regulator (IR)', 'POPIA enforcement and data protection', 'www.justice.gov.za/inforeg', 'Medium', 'Data Protection Compliance'],
                        ['Competition Commission', 'Competition regulation and mergers', 'www.compcom.co.za', 'Medium', 'Merger Notification'],
                    ]],
                ],
                'status' => ['title' => 'Legal & Regulatory Compliance Status', 'rows' => [
                    ['Overall Compliance', 'Compliant', 'good'], ['Regulatory Mapping', 'Complete', 'good'], ['Licensing Requirements', 'Complete', 'good'], ['Legal Restrictions', '0 Open', 'neutral'],
                    ['Regulator Confirmations', '14 / 14', 'neutral'], ['Compliance Obligations', 'Complete', 'good'], ['Boundary Breaches (30 days)', '0', 'neutral'], ['Last Legal Review', '15 Aug 2026', 'neutral'],
                ]],
                'important' => 'This information is general in nature and does not constitute legal advice. Specific legal advice must be obtained for your circumstances.',
                'actions' => [['label' => 'View Legal Framework', 'kind' => 'tab:Legal Framework'], ['label' => 'View Regulatory Authorities', 'kind' => 'tab:Regulatory Authorities'], ['label' => 'View Licences & Registrations', 'kind' => 'tab:Licences & Registrations'], ['label' => 'Download Legal Boundary Guide', 'kind' => 'download'], ['label' => 'Export Legal Summary', 'kind' => 'download'], ['label' => 'Ask a Legal Advisor', 'kind' => 'ask']],
                'advisor' => ['Need Legal Guidance?', 'Speak to a TBCA legal advisor for tailored guidance on legal and regulatory matters.'],
                'trust' => [...self::TRUST, ['Audit Ready', 'Full change history and audit trail maintained.']],
                'footer' => 'Information only. Not legal or tax advice.',
            ],
            'privacy' => [
                'lead' => 'Understand how your data is collected, stored, processed and protected for South Africa.',
                'kpis' => [
                    ['label' => 'Privacy Regime', 'value' => 'POPIA', 'caption' => 'In force since 1 Jul 2021', 'icon' => 'shield'],
                    ['label' => 'Data Residency', 'value' => 'Local', 'caption' => 'Stored in South Africa', 'icon' => 'database'],
                    ['label' => 'Protection Level', 'value' => 'High', 'caption' => 'Strong legal safeguards', 'icon' => 'lock'],
                    ['label' => 'Last Reviewed', 'value' => '15 Aug 2026', 'caption' => '10:24 SAST', 'icon' => 'calendar-days'],
                ],
                'tabs' => ['Overview', 'Data Collection', 'Use & Processing', 'Data Storage & Transfer', 'Your Rights', 'Security Measures', 'Partners & Processors', 'Change History'],
                'blocks' => [
                    ['type' => 'kv', 'title' => 'Privacy Overview', 'tabs' => ['Overview', 'Data Collection', 'Use & Processing', 'Your Rights'], 'intro' => 'TBCA complies with the Protection of Personal Information Act (POPIA) and other applicable privacy laws in South Africa.', 'rows' => [
                        ['Privacy Law', 'POPIA (Act 4 of 2013)', 'ok'], ['Regulator', 'Information Regulator (IR)', 'ok'], ['Data Protection Officer', 'Yes', 'ok'], ['Lawful Basis for Processing', 'Consent / Contract / Legal obligation', 'ok'],
                        ['Cross-Border Transfer', 'Permitted with safeguards', 'ok'], ['Automated Decision Making', 'No', 'ok'], ["Children's Data", 'Not knowingly collected', 'ok'], ['Data Breach Notification', '72 hours to IR and affected parties', 'ok'], ['Privacy Impact Assessment', 'Conducted for high-risk processing', 'ok'],
                    ], 'footer' => 'We only collect what is necessary and use it for the purposes stated in our Privacy Notice.'],
                    ['type' => 'kv', 'title' => 'Data Residency and Storage', 'tabs' => ['Overview', 'Data Storage & Transfer', 'Security Measures'], 'intro' => 'Your data is stored securely within South Africa.', 'rows' => [
                        ['Primary Storage Location', 'South Africa — AWS Africa (Cape Town)', 'ok'], ['Backup Location', 'South Africa (Secondary Region) — AWS Africa (Cape Town)', 'ok'],
                        ['Data Retention', 'As per retention schedule', 'ok'], ['Data Transfer Outside SA', 'Permitted with safeguards — Standard contractual clauses applied', 'ok'],
                    ], 'footer' => 'International Transfers: Where data is transferred outside South Africa, we ensure an adequate level of protection through Standard Contractual Clauses (SCCs), Transfer Impact Assessments (TIAs) and encryption in transit and at rest.'],
                    ['type' => 'table', 'title' => 'Third-Party Processors and Data Recipients', 'span' => 2, 'tabs' => ['Overview', 'Partners & Processors', 'Data Storage & Transfer'], 'intro' => 'We share data only with approved processors bound by strict data protection obligations.', 'columns' => ['Processor / Recipient', 'Purpose', 'Location', 'POPIA Agreement', 'Data Shared', 'Status'], 'rows' => [
                        ['Amazon Web Services (AWS) — Cloud infrastructure', 'Hosting, storage, disaster recovery', 'South Africa (Cape Town)', 'Signed', 'Account data, usage logs', 'Approved'],
                        ['SendGrid (Twilio) — Email communications', 'Transactional emails and notifications', 'EU (Ireland)', 'Signed', 'Email address, name', 'Approved'],
                        ['QuickBooks Online (Intuit) — Accounting integration', 'Invoicing and financial records', 'US', 'Signed', 'Company, financial data', 'Approved'],
                        ['Google Analytics 4 — Website analytics', 'Analytics and performance', 'EU (Germany)', 'Signed', 'Usage analytics (pseudonymised)', 'Approved'],
                    ]],
                ],
                'status' => ['title' => 'Privacy Compliance Status', 'rows' => [
                    ['Overall Compliance', 'Compliant', 'good'], ['POPIA Alignment', 'Compliant', 'good'], ['Data Mapping', 'Complete', 'good'], ['DPO Appointed', 'Yes', 'good'],
                    ['Vendor Assessments', '14 / 14', 'neutral'], ['Privacy Impact Assessments', '3', 'neutral'], ['Breach Incidents (12 months)', '0', 'neutral'], ['Last Compliance Review', '15 Aug 2026', 'neutral'],
                ]],
                'important' => "You have rights over your personal information. See the 'Your Rights' tab for details on how to access, correct or delete your data.",
                'actions' => [['label' => 'View Data Collection Details', 'kind' => 'tab:Data Collection'], ['label' => 'View Data Storage Map', 'kind' => 'tab:Data Storage & Transfer'], ['label' => 'View Third-Party Processors', 'kind' => 'tab:Partners & Processors'], ['label' => 'Download Privacy Summary (PDF)', 'kind' => 'download'], ['label' => 'Ask a Privacy Question', 'kind' => 'ask']],
                'advisor' => ['Need Privacy Advice?', 'Speak to a TBCA Privacy Advisor for tailored guidance on POPIA or data protection matters.'],
                'trust' => [...self::TRUST, ['Your Privacy Matters', 'We respect your rights and protect your personal information.']],
                'footer' => 'Information only. Not legal or tax advice.',
            ],
        };
    }
}
