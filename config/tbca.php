<?php

/*
|--------------------------------------------------------------------------
| TBCA Platform Configuration
|--------------------------------------------------------------------------
| Source: TBCA Pan-African AI Consultancy Operating System —
| Final Developer Implementation Blueprint.
*/

return [

    'brand' => [
        'name' => 'The Business Clinic.Africa',
        'short' => 'TBCA',
        'trademark' => 'The Business Clinic.Africa™',
        'promise' => 'AI Agents Think | Robots Execute | Humans Lead®',
        'doctrine' => 'TBCA is building an operating system, not a brochure website.',
    ],

    'contact' => [
        'address_lines' => [
            '5th Floor, Blocktrans Building,',
            'Blue Gum Road, Lynnwood Ridge,',
            'Pretoria, 0081, South Africa',
        ],
        'phone' => '+27 60 801 1365',
        'email' => 'Consult@thebusinessclinic.africa',
        'whatsapp' => '+27 60 801 1365',
        'whatsapp_url' => 'https://wa.me/27608011365',
    ],

    /*
    | Platform languages and currencies — Africa (Active).
    | Languages: UI chrome is English-only until a translation provider is chosen;
    | the selection persists and sets <html lang/dir> (Arabic is right-to-left).
    */
    'languages' => [
        ['code' => 'en', 'label' => 'English', 'native' => 'English', 'html' => 'en', 'dir' => 'ltr', 'status' => 'live'],
        ['code' => 'af', 'label' => 'Afrikaans', 'native' => 'Afrikaans', 'html' => 'af', 'dir' => 'ltr', 'status' => 'coming_soon'],
        ['code' => 'pt', 'label' => 'Portuguese', 'native' => 'Português', 'html' => 'pt', 'dir' => 'ltr', 'status' => 'coming_soon'],
        ['code' => 'zh', 'label' => 'Chinese (Mandarin)', 'native' => '中文', 'html' => 'zh-Hans', 'dir' => 'ltr', 'status' => 'coming_soon'],
        ['code' => 'fr', 'label' => 'French', 'native' => 'Français', 'html' => 'fr', 'dir' => 'ltr', 'status' => 'coming_soon'],
        ['code' => 'sw', 'label' => 'Swahili', 'native' => 'Kiswahili', 'html' => 'sw', 'dir' => 'ltr', 'status' => 'coming_soon'],
        ['code' => 'ar', 'label' => 'Arabic', 'native' => 'العربية', 'html' => 'ar', 'dir' => 'rtl', 'status' => 'coming_soon'],
    ],

    /*
    | Display currencies. Prices are stored and charged in ZAR; other currencies
    | are display conversions using the live daily FX feed (App\Support\Platform\Fx).
    | `fallback_rate` = units of the currency per 1 ZAR, used when the feed fails.
    */
    'currencies' => [
        ['code' => 'ZAR', 'display' => 'ZAR', 'symbol' => 'R', 'label' => 'South African Rand', 'fallback_rate' => 1.0, 'decimals' => 0, 'status' => 'approved'],
        ['code' => 'USD', 'display' => 'USD', 'symbol' => '$', 'label' => 'United States Dollar', 'fallback_rate' => 0.060, 'decimals' => 0, 'status' => 'approved'],
        ['code' => 'XOF', 'display' => 'XOF', 'symbol' => 'CFA', 'label' => 'West African CFA Franc', 'fallback_rate' => 35.1, 'decimals' => 0, 'status' => 'approved'],
        ['code' => 'EUR', 'display' => 'EUR', 'symbol' => '€', 'label' => 'Euro', 'fallback_rate' => 0.0536, 'decimals' => 0, 'status' => 'approved'],
        ['code' => 'CNY', 'display' => 'RMB', 'symbol' => '¥', 'label' => 'Chinese Yuan Renminbi (RMB)', 'fallback_rate' => 0.4035, 'decimals' => 0, 'status' => 'approved'],
    ],

    /*
    | Live FX feed (ZAR base, free, no key). Cached for a day; falls back to the
    | currency `fallback_rate` values on any failure.
    */
    'fx' => [
        'url' => env('TBCA_FX_URL', 'https://open.er-api.com/v6/latest/ZAR'),
        'cache_seconds' => 86400,
        'timeout_seconds' => 3,
    ],

    'default_country' => 'ZA',

    /*
    | Checkout pricing rules (Money). Amounts are whole ZAR.
    */
    'commerce' => [
        'vat_rate' => 0.15,
        'zar_per_usd' => 18.0,
        'platform_fee_zar' => 250,
        'bank_charge_rates' => ['card' => 0.01, 'eft' => 0, 'wallet' => 0],
    ],

    /*
    | Evidence classes. Every public trust claim carries one.
    */
    'ledger_classes' => [
        'V' => ['key' => 'verified', 'label' => 'Ledger V — VERIFIED', 'short' => 'VERIFIED'],
        'A' => ['key' => 'attested', 'label' => 'Ledger A — TBCA ATTESTED', 'short' => 'TBCA ATTESTED'],
        'R' => ['key' => 'referenced', 'label' => 'Ledger R — REFERENCED', 'short' => 'REFERENCED'],
        'G' => ['key' => 'controlled', 'label' => 'Ledger G — EVIDENCE-CONTROLLED', 'short' => 'EVIDENCE-CONTROLLED'],
    ],

    'trust_badges' => [
        ['label' => 'ISO 27001 Certified', 'class' => 'V', 'icon' => 'shield-check'],
        ['label' => 'POPIA Compliant', 'class' => 'A', 'icon' => 'lock'],
        ['label' => 'Security Governance', 'class' => 'G', 'icon' => 'shield'],
    ],

    /*
    | Platform statistics band (Home).
    */
    'stats' => [
        ['value' => '7,008', 'label' => 'Governed TBCA Sprints', 'icon' => 'rocket'],
        ['value' => 'Africa', 'label' => 'Africa (Active)', 'icon' => 'map'],
        ['value' => '100+', 'label' => 'Business Tools, Templates & Calculators', 'icon' => 'wrench'],
        ['value' => '24/7', 'label' => 'Digital Platform Availability', 'icon' => 'clock'],
        ['value' => '5 Currencies', 'label' => 'ZAR, USD, XOF, EUR and RMB with Daily FX', 'icon' => 'coins'],
        ['value' => '7 Languages', 'label' => 'English, Afrikaans, Portuguese, Mandarin, French, Swahili and Arabic', 'icon' => 'languages'],
    ],

    /*
    | Institutional relationship groups. Display is permission- and record-governed.
    */
    'institutional_relationships' => [
        'DFI Group',
        'Development Partners',
        'National Institutions',
        'Private Sector Associations',
        'Academic Institutions',
        'Professional Bodies',
    ],
];
