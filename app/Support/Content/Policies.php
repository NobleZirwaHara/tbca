<?php

namespace App\Support\Content;

/**
 * Platform policies hub (/policies) and the short draft policies served at
 * /policies/{slug}. Draft text is placeholder copy written from what the platform
 * already implements; it is clearly marked "Draft — pending client approval".
 */
class Policies
{
    public const DRAFT = 'Draft — pending client approval';

    public const PUBLISHED = 'Published';

    /** Every platform policy, for the hub page. */
    public static function hub(): array
    {
        $existing = [
            ['slug' => 'privacy', 'title' => 'Privacy Policy', 'href' => '/privacy', 'group' => 'Privacy & Data', 'summary' => 'What personal information we collect, why, how we protect it and your rights.'],
            ['slug' => 'candidate-privacy', 'title' => 'Candidate Privacy Notice', 'href' => '/candidate-privacy', 'group' => 'Privacy & Data', 'summary' => 'How we handle information you share when you apply for a role at TBCA.'],
            ['slug' => 'terms', 'title' => 'Terms of Service', 'href' => '/terms', 'group' => 'Using TBCA', 'summary' => 'The terms that govern your use of our website, services, content and platforms.'],
            ['slug' => 'ai-disclosure', 'title' => 'AI Disclosure', 'href' => '/about/ai-disclosure', 'group' => 'Trust & Governance', 'summary' => 'How AI is used across TBCA and where qualified humans review the output.'],
            ['slug' => 'professional-boundaries', 'title' => 'Professional Boundaries', 'href' => '/about/professional-boundaries', 'group' => 'Trust & Governance', 'summary' => 'What we do and do not provide, and when licensed professionals are required.'],
            ['slug' => 'trust-centre', 'title' => 'Trust Centre', 'href' => '/trust-centre', 'group' => 'Trust & Governance', 'summary' => 'Security, privacy and compliance evidence in one place.'],
        ];

        $drafts = array_map(fn (array $p) => [
            'slug' => $p['slug'], 'title' => $p['title'], 'href' => '/policies/'.$p['slug'], 'group' => $p['group'], 'summary' => $p['summary'],
        ], self::drafts());

        return array_map(fn (array $p) => $p + ['status' => self::find($p['slug']) ? self::DRAFT : self::PUBLISHED], [...$existing, ...$drafts]);
    }

    public static function groups(): array
    {
        return ['Privacy & Data', 'Using TBCA', 'Payments & Refunds', 'Trust & Governance'];
    }

    public static function slugs(): array
    {
        return array_column(self::drafts(), 'slug');
    }

    public static function find(string $slug): ?array
    {
        foreach (self::drafts() as $p) {
            if ($p['slug'] === $slug) {
                return $p + ['status' => self::DRAFT, 'updated' => '2026-10-06', 'contact' => 'Consult@thebusinessclinic.africa'];
            }
        }

        return null;
    }

    /** The five new short policies. Sections: [heading, list of paragraphs|bullets]. */
    private static function drafts(): array
    {
        return [
            [
                'slug' => 'refund-and-cancellation',
                'title' => 'Refund & Cancellation Policy',
                'group' => 'Payments & Refunds',
                'summary' => 'When orders can be cancelled, which purchases are refundable and how refunds are paid.',
                'sections' => [
                    ['Cancelling before payment', ['Unpaid orders, baskets and quotations can be cancelled at any time from your Client Portal (My Orders) at no charge.']],
                    ['Sprints and advisory services', [
                        'A paid service may be cancelled before work starts for a full refund, less any non-recoverable third-party costs disclosed at checkout.',
                        'Once work has started, fees for work already delivered are earned. Any refund for the undelivered portion is assessed case by case through the Disputes & Refunds route in the Client Portal.',
                    ]],
                    ['Digital products, templates and tools', [
                        'Digital products are non-refundable once downloaded or accessed, unless the product is defective, materially different from its description, corrupt, or the wrong product, format or language was supplied.',
                        'Where a product is defective, we will offer a corrected file, replacement, licence change or a full or partial refund. Requests are made from My Resource Library → Refund and Issue.',
                    ]],
                    ['Virtual Deal Room mandates', [
                        'Refund requests must be made within 7 calendar days of payment.',
                        'Before mandate activation (Stage 0): up to 30% of the net fee is refundable.',
                        'After Stage 1 activation: refunds are at TBCA\'s discretion, up to 30% of the net fee.',
                        'After Stage 2 activation: no refund of the deposit, as delivered work is earned.',
                        'Refunds require approval by the deal advisor, the client\'s authorised signatory and TBCA Finance.',
                    ]],
                    ['How refunds are paid', [
                        'Approved refunds are paid to the original payment method within 5 business days and a credit note is issued. Access and licences linked to a refunded purchase are revoked.',
                        'Platform and bank charges shown at checkout are non-refundable unless the refund is due to a TBCA error.',
                    ]],
                    ['Disputes', ['If you disagree with a decision, raise a dispute from Disputes & Refunds in your Client Portal or email us. Your statutory rights under the Consumer Protection Act and ECTA are not affected.']],
                ],
            ],
            [
                'slug' => 'cookies',
                'title' => 'Cookie Policy',
                'group' => 'Privacy & Data',
                'summary' => 'Which cookies and similar technologies we use, and how to control them.',
                'sections' => [
                    ['What cookies are', ['Cookies are small text files stored on your device. We also use browser storage for similar purposes, for example to remember your language or currency.']],
                    ['Cookies we use', [
                        'Strictly necessary: sign-in sessions, security (CSRF protection), basket and checkout. These cannot be switched off.',
                        'Preferences: language, currency, country context and accessibility settings.',
                        'Analytics: aggregated, privacy-respecting measurement of how pages are used, only where you have consented.',
                    ]],
                    ['Third-party content', ['Some pages embed third-party services (for example Google Maps on our Contact page, or video players). These providers may set their own cookies when the embedded content loads.']],
                    ['Managing cookies', ['You can manage optional cookies in the Preference Centre and block or delete cookies in your browser settings. Blocking strictly necessary cookies will stop sign-in and checkout working.']],
                ],
            ],
            [
                'slug' => 'popia-paia',
                'title' => 'POPIA & PAIA Notice',
                'group' => 'Privacy & Data',
                'summary' => 'Your rights under South Africa\'s POPIA and how to request access to records under PAIA.',
                'sections' => [
                    ['Our commitment', ['TBCA processes personal information in line with the Protection of Personal Information Act 4 of 2013 (POPIA) and applicable data-protection laws in the African countries where we operate.']],
                    ['Information Officer', ['Requests and complaints about personal information can be sent to our Information Officer / Privacy Lead at informationofficer@thebusinessclinic.africa (mailbox being set up; until it is live, use Consult@thebusinessclinic.africa).']],
                    ['Your rights', [
                        'Ask whether we hold your personal information and request a copy.',
                        'Ask us to correct, update or delete information.',
                        'Object to processing, including direct marketing, and withdraw consent.',
                        'Complain to the Information Regulator (South Africa).',
                    ]],
                    ['PAIA manual and access requests', ['Requests for access to records under the Promotion of Access to Information Act 2 of 2000 (PAIA) may be made to the Information Officer using the prescribed form. Our PAIA manual will be published here once approved.']],
                ],
            ],
            [
                'slug' => 'acceptable-use',
                'title' => 'Acceptable Use Policy',
                'group' => 'Using TBCA',
                'summary' => 'The rules for using TBCA platforms, workspaces, AI tools and downloads.',
                'sections' => [
                    ['You may not', [
                        'Break the law, infringe others\' rights or upload material you are not entitled to share.',
                        'Upload malware, probe or disrupt our systems, or bypass access controls, rate limits or paywalls.',
                        'Share account credentials, or resell or redistribute licensed content beyond your licence.',
                        'Use our AI assistants to generate unlawful, deceptive or harmful content, or present AI output as professional sign-off.',
                        'Upload personal information about others without a lawful basis, or misuse due-diligence results.',
                    ]],
                    ['Deal rooms and confidential workspaces', ['Information in deal rooms and engagement workspaces is confidential and covered by the applicable NDA. Activity is logged for audit.']],
                    ['Enforcement', ['We may suspend or restrict access where this policy is breached, after notice where practical. Serious breaches may be reported to the authorities.']],
                ],
            ],
            [
                'slug' => 'payments-and-billing',
                'title' => 'Payments & Billing Policy',
                'group' => 'Payments & Refunds',
                'summary' => 'Currencies, payment methods, invoices, VAT, fees and overdue accounts.',
                'sections' => [
                    ['Pricing and currency', ['Prices are set and charged in South African Rand (ZAR). Other currencies shown on the site are indicative conversions at the daily exchange rate.']],
                    ['Payment methods', ['Card (Visa / Mastercard), EFT / bank transfer and TBCA Wallet are accepted today. Further gateways and methods (including mobile money, instant EFT and payment links) are being integrated; see Payment Methods in your Client Portal.']],
                    ['VAT and fees', ['VAT is added at the applicable rate and shown separately. A platform fee and any bank charge for your chosen payment method are shown before you pay.']],
                    ['Invoices and EFT', ['A tax invoice is available in your Client Portal for every paid order. EFT payments must quote the order reference and usually clear in 1–2 business days; the order stays pending until the payment is reconciled.']],
                    ['Overdue accounts', ['Reminders are sent from day 1 after the due date. Continued non-payment may limit new orders and, after 45 days, lead to suspension of new work. Payment plans and hardship support are available from Arrears & Payment Help.']],
                ],
            ],
        ];
    }
}
