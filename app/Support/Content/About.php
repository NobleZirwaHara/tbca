<?php

namespace App\Support\Content;

/**
 * About TBCA cluster: story, trust rail, certifications, team and entity position.
 */
class About
{
    public static function identity(): array
    {
        return [
            'statement' => 'The Business Clinic.Africa™ (TBCA) is an AI-enabled advisory and project development platform.',
            'purpose' => 'We exist to level the playing field for entrepreneurs, businesses, investors and governments, providing world-class intelligence, tools and execution support to build sustainable impact and shared prosperity across Africa.',
            'mission' => 'To be Africa\'s most trusted platform for business advisory and project development, combining human expertise, AI intelligence and robotic automation to empower our clients to think bigger, move faster and achieve lasting impact.',
            'story_intro' => 'The Business Clinic.Africa™ exists to unlock African potential through intelligent advisory, data-driven insight and disciplined execution. We combine AI-powered systems, robotic automation and human authority to help businesses, investors and institutions make better decisions and achieve measurable impact.',
        ];
    }

    /** TBCA Trust Rail — evidence classes at a glance. */
    public static function trustRail(): array
    {
        return [
            ['title' => 'Compliance', 'body' => 'Certified standards and compliance controls.', 'icon' => 'file-check'],
            ['title' => 'Privacy', 'body' => 'Data protection and privacy commitments.', 'icon' => 'lock'],
            ['title' => 'Security Governance', 'body' => 'Evidence-controlled security governance and oversight.', 'icon' => 'shield-check'],
            ['title' => 'Operational Integrity', 'body' => 'Process integrity, quality and ethical execution.', 'icon' => 'circle-check'],
        ];
    }

    public static function storyFacts(): array
    {
        return [
            ['label' => 'Phase 1', 'value' => 'South Africa', 'icon' => 'map-pin'],
            ['label' => 'Our Ambition', 'value' => 'Pan-African Impact', 'icon' => 'target'],
            ['label' => 'Who We Serve', 'value' => 'Entrepreneurs, Businesses, Investors & Institutions', 'icon' => 'users'],
            ['label' => 'Our Commitment', 'value' => 'Quality, Integrity, Security & Accountability', 'icon' => 'shield-check'],
        ];
    }

    /** Certifications and verifications register. */
    public static function certifications(): array
    {
        return [
            [
                'name' => 'ISO 27001 Certified',
                'subtitle' => 'Information Security Management System',
                'class' => 'V',
                'icon' => 'shield-check',
                'rows' => [
                    ['label' => 'Standard', 'value' => 'ISO/IEC 27001:2022'],
                    ['label' => 'Scope', 'value' => 'Information Security Management across our platform and operations'],
                    ['label' => 'Status', 'value' => 'Certified'],
                    ['label' => 'Currentness', 'value' => 'Under current certificate'],
                ],
                'action' => ['label' => 'Verify Certification', 'href' => '/about/governance#security'],
            ],
            [
                'name' => 'POPIA Compliant',
                'subtitle' => 'Protection of Personal Information Act',
                'class' => 'A',
                'icon' => 'user-check',
                'rows' => [
                    ['label' => 'Standard', 'value' => 'POPIA, Act No. 4 of 2013'],
                    ['label' => 'Our Position', 'value' => 'We are POPIA compliant and follow lawful processing practices'],
                    ['label' => 'Status', 'value' => 'TBCA ATTESTED'],
                    ['label' => 'Currentness', 'value' => 'Reviewed 14 August 2026'],
                ],
                'action' => ['label' => 'View Privacy Controls', 'href' => '/about/governance#privacy'],
            ],
            [
                'name' => 'Registered Trade Mark',
                'subtitle' => 'The Business Clinic.Africa™',
                'class' => 'V',
                'icon' => 'badge-check',
                'rows' => [
                    ['label' => 'Registrand Type', 'value' => 'Trade Mark'],
                    ['label' => 'Jurisdiction', 'value' => 'South Africa'],
                    ['label' => 'Status', 'value' => 'Registered'],
                    ['label' => 'Currentness', 'value' => 'Under current registration'],
                ],
                'action' => ['label' => 'View Registration Details', 'href' => '/about/governance'],
            ],
            [
                'name' => 'Institutional Relationships',
                'subtitle' => 'Trusted institutions we work with',
                'class' => 'R',
                'icon' => 'handshake',
                'rows' => [
                    ['label' => 'Classification', 'value' => 'REFERENCED'],
                    ['label' => 'Basis', 'value' => 'Institutional permission records and relationship agreements'],
                    ['label' => 'Status', 'value' => 'Current'],
                    ['label' => 'View', 'value' => 'About Our Relationships'],
                ],
                'action' => ['label' => 'View Relationships', 'href' => '/about#relationships'],
            ],
        ];
    }

    public static function certificationsDisclosure(): string
    {
        return 'Certifications and attestations do not guarantee outcomes. We maintain evidence, review regularly and correct transparently.';
    }

    /** Profile record states governing how team profiles publish. */
    public static function profileStates(): array
    {
        return [
            ['state' => 'Verified Current', 'body' => 'Evidence reviewed. Current to published date.', 'tone' => 'verified'],
            ['state' => 'Pending Review', 'body' => 'Evidence submitted. Under quality review.', 'tone' => 'attested'],
            ['state' => 'Controlled Placeholder', 'body' => 'Role exists in catalogue. Evidence not yet received.', 'tone' => 'controlled'],
        ];
    }

    /** Leadership. Team profiles publish only from approved records. */
    public static function leadership(): array
    {
        return [
            [
                'slug' => 'kruger-phiri',
                'name' => 'Kruger Phiri',
                'post_nominal' => 'FCCA',
                'role' => 'Founder & Managing Partner',
                'practice' => 'Executive Leadership',
                'state' => 'Verified Current',
                'reviewed' => '14 August 2026',
                'summary' => 'Entrepreneur, strategist and builder of digital businesses across Africa. Kruger leads TBCA\'s mission to unlock African potential through intelligent advisory, disciplined execution and measurable impact.',
                'bio' => [
                    'Kruger Phiri is the Founder and Managing Partner of The Business Clinic.Africa. He brings more than two decades of entrepreneurial leadership across business advisory, capital mobilisation, project development and digital transformation.',
                    'His focus is building scalable African enterprises and enabling institutions to make better decisions and deliver measurable results.',
                    'Kruger is a Chartered Certified Accountant (FCCA) and holds specialist training in strategy, finance, governance and technology.',
                ],
                'highlights' => [
                    '20+ Years Entrepreneurial Experience',
                    'Business & Technology Strategist',
                    'Capital Mobilisation & Project Development',
                    'Pan-African Impact Focus',
                ],
                'expertise' => [
                    'Strategy & Business Advisory',
                    'Capital Mobilisation & Funding Strategy',
                    'Project Development & PPP Structuring',
                    'Financial Modelling & Valuation',
                    'Corporate Governance & Board Advisory',
                    'Digital Transformation & Automation',
                    'AI Strategy & Intelligent Systems',
                    'Pan-African Business Development',
                ],
                'qualifications' => [
                    'Fellow, Chartered Certified Accountant (FCCA), UK',
                    'Advanced Diploma in Accounting & Business',
                    'Diploma in Taxation (SA)',
                    'Executive Education in Strategy & Leadership',
                    'AI & Machine Learning for Leaders (Executive Programme)',
                ],
                'languages' => ['English', 'Afrikaans', 'Shona', 'Swahili', 'Português'],
                'email' => 'kruger.phiri@thebusinessclinic.africa',
                'location' => 'Pretoria, South Africa',
            ],
        ];
    }

    public static function findLeader(string $slug): ?array
    {
        foreach (self::leadership() as $leader) {
            if ($leader['slug'] === $slug) {
                return $leader;
            }
        }

        return null;
    }

    /** Controlled placeholders. Role catalogues do not prove occupancy. */
    public static function teamDirectory(): array
    {
        $practices = [
            'Advisory & Strategy', 'Project Advisory', 'Due Diligence', 'AIIM Intelligence',
            'Technology & Automation', 'Finance & Commercial', 'Delivery & Quality Assurance',
            'Governance & Compliance', 'Client Success', 'Data & Analytics', 'Security', 'Support Desk',
        ];

        return array_map(fn ($practice) => [
            'label' => 'Controlled Profile Record',
            'practice' => $practice,
            'state' => 'Controlled Placeholder',
        ], $practices);
    }

    public static function limitations(): array
    {
        return [
            'title' => 'How We Can Support — And Where Professional Authority Applies',
            'body' => 'TBCA provides advisory, intelligence, tools and execution support. We do not provide legal, tax, audit, financial or regulatory sign-off. Engagements requiring licensed professional authority are referred to qualified professionals.',
        ];
    }

    public static function entitySummary(): string
    {
        return 'TBCA operates as an AI-enabled advisory and project development platform supporting clients across sectors and jurisdictions in Africa.';
    }
}
