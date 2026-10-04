<?php

namespace App\Support\Portal;

/** Read-only portal content registers (events, KP sessions, resources, library, benchmarks, knowledge base). */
class Catalogue
{
    public static function events(): array
    {
        return [
            'renewable-energy' => ['Renewable Energy Investment Opportunities in Africa', 7, '10:00 – 11:30', 'Energy', true],
            'ppp-structures' => ['PPP Transaction Structures and Risk Allocation', 14, '11:00 – 12:30', 'Transaction Advisory', true],
            'ai-infrastructure' => ['AI in Infrastructure Delivery: Trends and Tools', 21, '10:00 – 11:30', 'Technology Solutions', false],
            'infra-financing' => ['Infrastructure Financing Landscape Update', 28, '10:00 – 11:30', 'Finance', false],
            'esg-delivery' => ['Governance and ESG in Project Delivery', 35, '10:00 – 11:30', 'Governance', false],
        ];
    }

    public static function replays(): array
    {
        return [['Port Infrastructure Outlook 2026', 'Added 15 Sep'], ['Water Security and Infrastructure', 'Added 08 Sep'], ['Digital Transformation in Projects', 'Added 01 Sep']];
    }

    public static function kpSessions(): array
    {
        return [
            'project-finance-code' => ['Cracking the Project Finance Code', 'Masterclass', 7, '10:00 – 11:30', 'Project Finance'],
            'doing-business-africa' => ['Doing Business in Africa', 'Strategy Session', 14, '11:00 – 12:30', 'Market Entry'],
            'infrastructure-delivery' => ['Infrastructure Delivery', 'Practical Insights', 21, '10:00 – 11:30', 'Infrastructure'],
            'aiim-in-action' => ['AIIM in Action: Real Use Cases', 'Workshop', 28, '14:00 – 15:30', 'AI & Automation'],
            'esg-value' => ['Governance & ESG for Value Creation', 'Masterclass', 35, '10:00 – 11:30', 'Governance'],
        ];
    }

    public static function resources(): array
    {
        return [
            'feasibility-guide' => ['Feasibility Study Methodology Guide', 'Comprehensive guide to TBCA feasibility methodology and evaluation framework.', 'Guides', 'PDF', 'Feasibility', 'Client'],
            'financial-model-template' => ['Financial Model Template (v3.2)', 'Advanced financial model template for infrastructure projects.', 'Templates', 'XLSX', 'Financial Modelling', 'Client'],
            'renewable-report-2026' => ['Renewable Energy Market Report 2026', 'Market analysis and outlook for renewable energy in Africa.', 'Reports', 'PDF', 'Energy', 'Partner'],
            'ppp-overview' => ['PPP Transaction Process Overview', 'Step-by-step overview of the PPP transaction process.', 'Presentations', 'PPTX', 'Transaction Advisory', 'Client'],
            'ports-benchmark' => ['Ports Infrastructure Benchmark 2026', 'Benchmarking data and insights for port infrastructure projects.', 'Benchmarks', 'XLSX', 'Infrastructure', 'Client'],
            'business-plan-pack' => ['Business Plan Template Pack', 'Investor-ready business plan templates with guidance notes.', 'Templates', 'DOCX', 'Business Planning', 'Client'],
            'popia-checklist' => ['POPIA Compliance Checklist', 'Practical checklist for POPIA readiness in SMEs.', 'Legal & Regulatory', 'PDF', 'Compliance', 'Client'],
        ];
    }

    public static function library(): array
    {
        return [
            'DP-AMI-2026' => ['Africa Market Intelligence Pack 2026', 'Market Intelligence', 'PDF', '2.0'],
            'DP-SDD-01' => ['SME Due Diligence Toolkit', 'Due Diligence', 'Toolkit', '1.3'],
            'DP-BPT-03' => ['Business Plan Template Pack', 'Business Planning', 'Template', '3.1'],
            'DP-IMG-01' => ['Investment Memo Guide', 'Investor Relations', 'Guide', '1.0'],
            'DP-NCB-26' => ['Nigeria Country Brief Pack 2026', 'Country Intelligence', 'PDF', '1.2'],
            'DP-FMT-24' => ['Financial Model Template (Excel)', 'Financial Modelling', 'XLSX', '2.4'],
            'DP-RAT-11' => ['Risk Assessment Toolkit', 'Risk & Compliance', 'Toolkit', '1.1'],
            'DP-CFF-21' => ['Cash Flow Forecast Model', 'Financial Modelling', 'XLSX', '2.1'],
        ];
    }

    public static function benchmarks(): array
    {
        return [
            'infrastructure-delivery' => ['Infrastructure Delivery Benchmark 2026', 'Project execution performance across Africa', 'Infrastructure', 'Verified', 186, 250],
            'project-finance-terms' => ['Project Finance Terms Benchmark', 'Financing terms and conditions analysis', 'Finance', 'Verified', 128, 200],
            'renewable-energy-cost' => ['Renewable Energy Cost Benchmark', 'Cost trends and performance metrics', 'Energy', 'Verified', 214, 200],
            'transport-corridor' => ['Transport Corridor Performance', 'Operational & maintenance benchmarking', 'Transport', 'Preliminary', 92, 200],
            'digital-maturity' => ['Digital Transformation Maturity Index', 'Organisation digital maturity scoring', 'Technology', 'Verified', 122, 150],
        ];
    }

    public static function articles(): array
    {
        return [
            ['Getting Started: Set Up Your Account', 'Learn how to activate your account, complete your profile, and set security preferences.', 'Getting Started', 5, '/portal/welcome'],
            ['Understanding Your Invoices and Payments', 'A guide to viewing invoices, payment methods, and downloading receipts.', 'Accounts & Billing', 6, '/portal/invoices'],
            ['Managing Your Subscriptions', 'Update, upgrade, downgrade, or cancel your subscriptions with ease.', 'Subscriptions', 4, '/subscriptions/account'],
            ['How to Raise a Complaint or Request Support', 'Step-by-step guide to submitting a complaint and tracking its status.', 'Complaints & Support', 6, '/portal/support'],
            ['Using AIIM for Smarter Business Decisions', 'Discover how AIIM insights and analytics can help you grow and stay ahead.', 'AIIM & Intelligence', 7, '/aiim/workspace'],
            ['Accepting or Correcting a Deliverable', 'How release, acceptance and correction work for your deliverables.', 'Services & Deliverables', 5, '/portal/approvals'],
            ['Exercising Your POPIA Data Rights', 'Request access, export, correction or deletion of your personal data.', 'Client Portal', 4, '/portal/privacy/data'],
            ['Understanding Your Statement of Account', 'Read your running balance, ageing and credits.', 'Accounts & Billing', 5, '/portal/statement'],
        ];
    }
}
