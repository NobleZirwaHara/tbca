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
        'phone' => '+27 12 001 0557',
        'email' => 'info@thebusinessclinic.africa',
        'whatsapp' => '+27 12 001 0557',
    ],

    /*
    | Phase 1 approved languages and currencies (Wave 1 — South Africa).
    */
    'languages' => [
        ['code' => 'en', 'label' => 'English', 'status' => 'approved'],
        ['code' => 'af', 'label' => 'Afrikaans', 'status' => 'approved'],
    ],

    'currencies' => [
        ['code' => 'ZAR', 'symbol' => 'R', 'label' => 'South African Rand', 'status' => 'approved'],
        ['code' => 'USD', 'symbol' => '$', 'label' => 'United States Dollar', 'status' => 'approved'],
    ],

    'default_country' => 'ZA',

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
        ['value' => 'South Africa', 'label' => 'Active Market', 'icon' => 'map'],
        ['value' => '100+', 'label' => 'Business Tools, Templates & Calculators', 'icon' => 'wrench'],
        ['value' => '24/7', 'label' => 'Digital Platform Availability', 'icon' => 'clock'],
        ['value' => 'ZAR and USD', 'label' => 'Approved Phase 1 Currency Architecture', 'icon' => 'coins'],
        ['value' => 'English and Afrikaans', 'label' => 'Approved Languages', 'icon' => 'languages'],
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
