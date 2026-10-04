<?php

namespace App\Support\DealRoom;

/**
 * Analysis blocks shown on the analytical stage screens (6, 7, 8, 9, 11, 14,
 * 15). Rendered by the shared stage template's block renderer; live records
 * (offers, CPs, signatures, handover items ...) are added by the controller.
 *
 * Block shapes: table {columns, rows}, kv {rows: [k, v][]}, list {items},
 * metrics {items: {label, value, caption}[]}, bars {items: {label, value, display}[]}.
 */
class StageContent
{
    public static function blocks(string $code): array
    {
        return match ($code) {
            '6' => [
                ['type' => 'table', 'title' => '1. Source-Data Mapping', 'span' => 2, 'columns' => ['Source Document', 'Period', 'Mapping', 'Evidence', 'Confidence', 'Owner'], 'rows' => [
                    ['Audited Financial Statements', 'FY2024', 'Mapped', 'Verified', 'High', 'Michael Tumi'],
                    ['Management Accounts YTD', 'Jan–Apr 2025', 'Mapped', 'Verified', 'High', 'Aisha Sekele'],
                    ['Trial Balance', 'Apr 2025', 'Mapped', 'Verified', 'High', 'Michael Tumi'],
                    ['AR Ageing', 'Apr 2025', 'Mapped', 'Verified', 'High', 'Michael Tumi'],
                    ['AP Ageing', 'Apr 2025', 'Mapped', 'Verified', 'Medium', 'Michael Tumi'],
                    ['Bank Statements', 'Jan–Apr 2025', 'Mapped', 'Verified', 'High', 'Michael Tumi'],
                    ['Payroll', 'Apr 2025', 'Mapped', 'Verified', 'High', 'John Dlamini'],
                    ['Tax Records (VAT, PAYE)', 'Q1 2025', 'Mapped', 'Verified', 'Medium', 'John Dlamini'],
                    ['Debt Schedule', 'May 2025', 'Mapped', 'Verified', 'High', 'Michael Tumi'],
                ]],
                ['type' => 'bars', 'title' => '2. Customer Concentration (FY2024)', 'items' => [
                    ['label' => 'Top 1 Customer', 'value' => 22, 'display' => '22%'],
                    ['label' => 'Top 5 Customers', 'value' => 61, 'display' => '61%'],
                    ['label' => 'Top 10 Customers', 'value' => 79, 'display' => '79%'],
                ], 'note' => 'Revenue concentration within acceptable limits. No single customer above 25% and diversified across long-term contracts.'],
                ['type' => 'table', 'title' => '3. EBITDA Bridge / QoE Adjustments (ZAR m)', 'columns' => ['Adjustment', 'ZAR m'], 'rows' => [
                    ['Reported EBITDA', '56.0'], ['Add-back: one-off legal', '+6.4'], ['Founder remuneration normalisation', '+5.2'],
                    ['FX loss normalisation', '+3.8'], ['Non-recurring consulting', '(2.1)'], ['Deferred revenue correction', '(3.7)'], ['Normalised EBITDA', '72.6'],
                ], 'note' => 'Total add-backs +15.4m · Deductions (5.8m) · Net adjustment +9.6m · Impact +17%.'],
                ['type' => 'metrics', 'title' => '4. Cash Conversion & Working Capital', 'items' => [
                    ['label' => 'Receivables Days', 'value' => '47', 'caption' => 'Good'], ['label' => 'Inventory Days', 'value' => '18', 'caption' => 'Good'],
                    ['label' => 'Payables Days', 'value' => '24', 'caption' => 'Good'], ['label' => 'Cash Conversion Cycle', 'value' => '41', 'caption' => 'Good'],
                    ['label' => 'Operating Cash Conversion', 'value' => '92%', 'caption' => 'Mapped · Efficient'], ['label' => 'Net Working Capital Requirement', 'value' => 'ZAR 45.2m', 'caption' => '12% of annual revenue · Healthy'],
                ]],
                ['type' => 'table', 'title' => '5. Debt Facilities & Covenants', 'columns' => ['Facility / Test', 'Lender / Requirement', 'Balance / Actual', 'Maturity / Headroom'], 'rows' => [
                    ['Term Loan', 'Standard Bank', 'ZAR 68.0m', 'Jun 2028'], ['Asset Finance', 'Absa', 'ZAR 12.5m', 'Mar 2027'], ['Overdraft', 'FNB', 'ZAR 5.2m', 'Renewable'],
                    ['Net Debt / EBITDA', '≤ 3.0x', '1.6x', '1.4x'], ['EBITDA / Interest', '≥ 3.0x', '5.1x', '2.1x'], ['Current Ratio', '≥ 1.2x', '1.8x', '0.6x'],
                ], 'note' => 'Total debt ZAR 85.7m.'],
                ['type' => 'table', 'title' => 'Disputed Items / Concerns', 'columns' => ['Item', 'Amount', 'Severity'], 'rows' => [
                    ['Revenue Cut-off (Apr)', 'ZAR 2.4m', 'High'], ['Related Party Expense', 'ZAR 1.7m', 'Medium'], ['Legacy Tax Penalty', 'ZAR 1.6m', 'Medium'], ['Stock Valuation Adj.', 'ZAR 1.1m', 'Low'],
                ]],
            ],
            '7' => [
                ['type' => 'table', 'title' => '1. Methodologies and Weighting', 'columns' => ['Methodology', 'Weight', 'Indicative Output (R million)'], 'rows' => [
                    ['DCF analysis', '35%', 'R170.0m'], ['Trading comparables', '20%', 'R165.0m'], ['Precedent transactions', '20%', 'R168.0m'], ['Revenue multiple / venture method', '25%', 'R162.0m'], ['Weighted neutral base value', '', 'R165.0m pre-money'],
                ], 'note' => 'Key assumptions: WACC 18.5% · Terminal growth 4.0% · FY2026 revenue growth 32% · TBCA EBITDA margin 21%.'],
                ['type' => 'table', 'title' => '2. Low / Base / High Valuation Cases', 'columns' => ['', 'Low Case', 'Base Case', 'High Case'], 'rows' => [
                    ['Pre-money valuation', 'R150.0m', 'R165.0m', 'R180.0m'], ['Equity dilution at raise', '20.0%', '20.0%', '20.0%'], ['Implied price per share', 'R7.50', 'R8.25', 'R9.00'], ['Investor entry range', 'R120.0m – R150.0m', 'R132.0m – R165.0m', 'R144.0m – R180.0m'],
                ]],
                ['type' => 'table', 'title' => '3. Seller View vs Buyer View vs TBCA Neutral Bridge (R million)', 'columns' => ['Bridge step', 'Impact'], 'rows' => [
                    ['Seller view (growth upside and strategic expansion narrative)', '180.0'], ['QoE normalisation', '(10.0)'], ['Customer concentration discount', '(10.0)'], ['Working capital adjustment', '(3.0)'],
                    ['Governance uplift', '+4.0'], ['Data quality discount', '(3.0)'], ['Growth upside premium', '+5.0'], ['Buyer view (execution risk and concentration)', '150.0'], ['TBCA neutral bridge (weighted, QoE-adjusted)', '165.0'],
                ]],
                ['type' => 'table', 'title' => '4. Sensitivity Matrix (R million) — WACC vs EBITDA Margin', 'columns' => ['WACC', '18%', '21% (Base)', '24%'], 'rows' => [
                    ['16%', '162.0', '180.0', '198.0'], ['18.5% (Base)', '148.5', '165.0', '181.5'], ['21%', '135.0', '150.0', '165.0'],
                ]],
                ['type' => 'table', 'title' => '8. Open Risks and Exceptions', 'columns' => ['Risk / Issue', 'Severity', 'Owner', 'Mitigation'], 'rows' => [
                    ['Forecast reliability', 'High', 'Thuste R.', 'Mitigation plan in progress'], ['Customer concentration', 'High', 'Lindiwe K.', 'Seeking pipeline evidence'],
                    ['Discount-rate disagreement', 'Medium', 'TBCA Valuation', 'Sensitivity analysis ongoing'], ['Working capital volatility', 'Medium', 'Finance Reviewer', 'Normalisation review'],
                ]],
            ],
            '8' => [
                ['type' => 'table', 'title' => '1. Team Alignment', 'columns' => ['Role', 'Member', 'Status'], 'rows' => [
                    ['Deal Lead', 'Kruger Phiri', 'Ready'], ['Finance Lead', 'Nolwazi M.', 'Ready'], ['Legal Counsel', 'Andre du Plessis', 'In Review'], ['Valuation Expert', 'Sipho Dlamini', 'Ready'], ['Commercial Advisor', 'Thandi Maseko', 'Ready'],
                ]],
                ['type' => 'kv', 'title' => '2. Negotiation Strategy', 'rows' => [
                    ['Primary Objective', 'Maximise valuation while ensuring strategic partnership'], ['Walk Away Position', 'ZAR 650.0m pre-money valuation'], ['Target Range', 'ZAR 720.0m – ZAR 820.0m pre-money valuation'],
                    ['Key Priorities', 'Valuation, Governance, Liquidity, Strategic Support'], ['Deal Structure Preference', 'Equity with board representation and information rights'],
                    ['Leverage Points', 'Strong revenue growth, IP portfolio, market position'], ['BATNA', 'Alternative investors in advanced discussions'], ['Concessions', 'Board seat on certain conditions, information rights'], ['Red Lines', 'Undervaluation, unfavourable liquidation preference'],
                ]],
                ['type' => 'kv', 'title' => '3. Key Terms Summary', 'rows' => [
                    ['Valuation (Pre-Money)', 'ZAR 720.0m – 820.0m'], ['Investment Amount', 'ZAR 150.0m'], ['Equity Offered', '15% – 18%'], ['Liquidation Preference', '1x Non-Participating'],
                    ['Board Representation', '1 of 5 Seats'], ['Information Rights', 'Quarterly Reporting'], ['Drag Along', 'Yes (75%)'], ['Tag Along', 'Yes (75%)'], ['Vesting', '4 Year Cliff 1 Year'], ['Exclusivity', '30 Days'], ['Deal Conditions', 'Customary Conditions'],
                ]],
                ['type' => 'metrics', 'title' => 'Negotiation Readiness', 'items' => [
                    ['label' => 'Team Members Ready', 'value' => '8/8'], ['label' => 'Tasks Completed', 'value' => '36/42'], ['label' => 'Key Docs Prepared', 'value' => '12'], ['label' => 'Readiness Score', 'value' => 'High'],
                    ['label' => 'Risk & Exposure', 'value' => '78%', 'caption' => 'Acceptable · Low 6 · Medium 3 · High 1'], ['label' => 'Est. Negotiation Period', 'value' => '21 Days'],
                ]],
            ],
            '9' => [
                ['type' => 'table', 'title' => 'Deal Terms Comparison', 'span' => 2, 'columns' => ['Term', 'Buyer Position', 'Seller Position', 'Current Negotiated'], 'rows' => [
                    ['Valuation (Pre-Money)', 'R 150M', 'R 180M', 'R 165M'], ['Equity %', '17.50%', '15%', '16%'], ['Board Seat Structure', '2 Buyer / 1 Observer', '1 Independent / 1 Observer', '2 Buyer / 1 Observer'],
                    ['Use of Proceeds', 'Growth & Expansion', 'Working Capital & Growth', 'Growth & Expansion'], ['Closing Conditions', '5 Conditions', '4 Conditions', '4 Conditions'], ['Exclusivity Period', '45 Days', '30 Days', '45 Days'],
                ]],
                ['type' => 'kv', 'title' => 'Buyer Negotiation Summary', 'rows' => [
                    ['Valuation Direction', 'Under Discussion'], ['Equity Requested', 'Under Discussion'], ['Due Diligence Conditions', 'Pending'], ['Governance Rights', 'Agreed'], ['Reporting Expectations', 'Under Discussion'], ['Funding Tranches', 'Under Discussion'], ['Key Concerns', 'Escalated'],
                ]],
                ['type' => 'kv', 'title' => 'Seller Negotiation Summary', 'rows' => [
                    ['Minimum Acceptable Valuation', 'Under Discussion'], ['Equity Offered', 'Under Discussion'], ['Board Structure & Position', 'Under Discussion'], ['Use of Proceeds', 'Agreed'], ['Disclosures & Confidentiality', 'Pending'], ['Warranties & IP', 'Under Discussion'], ['Key Concerns', 'Escalated'],
                ]],
            ],
            '11' => [
                ['type' => 'table', 'title' => '2. Clause Comparison — Share Subscription Agreement v3.2 vs v3.1', 'columns' => ['Clause', 'Change', 'Detail', 'Version'], 'rows' => [
                    ['2.1 Investment Amount', 'Modified', 'Amount updated from ZAR 120.0m to ZAR 150.0m', 'v3.2'],
                    ['4.2 Board Representation', 'Added', 'Investor to have 1 of 5 seats on the Board', 'v3.2'],
                    ['6.1 Liquidation Preference', 'Modified', 'Updated to 1x Non-Participating', 'v3.2'],
                    ['8.3 Information Rights', 'Removed', 'Removed monthly budget approval right', 'v3.2'],
                ], 'note' => 'Added 23 · Removed 15 · Modified 30.'],
                ['type' => 'list', 'title' => '5. Key Controls & Compliance', 'items' => [
                    'Document access restricted to authorised legal workspace', 'All drafts watermarked and audit logged', 'Redline comparisons retained', 'Legal hold enabled', 'Version control enforced', 'Confidentiality maintained',
                ]],
            ],
            '14' => [
                ['type' => 'table', 'title' => '3. Warranties, Earn-Outs and Deferred Consideration', 'span' => 2, 'columns' => ['Item', 'Category', 'Trigger', 'Value / Impact', 'Due Date', 'Status'], 'rows' => [
                    ['Investor Information Rights', 'Covenant', 'Upon Request', '—', 'Ongoing', 'Active'],
                    ['Board Observer Seat Activation', 'Governance', 'Post-Close', '—', '09 May 2025', 'Completed'],
                    ['Use of Funds Milestone', 'Milestone', '40% Deployed', 'ZAR 50.0m', '30 Jun 2025', 'In Progress'],
                    ['Performance Covenant (ARR Growth ≥ 25%)', 'KPI', 'FY2025', 'ZAR 30.0m Upside', '30 Jun 2025', 'Active'],
                    ['Deferred Advisory Deliverable', 'Service', 'Delivery', 'ZAR 2.0m', '30 Jun 2025', 'Scheduled'],
                    ['Unresolved Issue: Tax Interpretation', 'Issue', 'Clarification', 'Potential Exposure', '30 Jun 2025', 'Monitoring'],
                ]],
                ['type' => 'list', 'title' => '6. Ongoing Monitoring Options', 'items' => ['Warranty Tracking — Enabled', 'Earn-Out Monitoring — Enabled', 'Covenant Reporting — Enabled', 'Trust Passport / Verification — Enabled', 'Access Archive (Secure) — Enabled', 'Quarterly Review Support — Enabled']],
            ],
            '15' => [
                ['type' => 'kv', 'title' => '2. Retention, Legal Hold & Access Control', 'rows' => [
                    ['Retention Policy', '7 Years · Until 15 Jun 2032'], ['Legal Hold Status', 'Active · Board Directed'], ['Data Residency', 'South Africa · Local Cloud Region'],
                    ['Post-Close Access Groups', '4 Groups · Restricted'], ['Restricted Workspaces', '3 · Secure Containers'], ['Verified Deletion Status', 'Locked · All controls must clear'],
                ]],
                ['type' => 'table', 'title' => '3. Monitoring & Re-Verification', 'columns' => ['Monitoring Option', 'Status', 'Next Review'], 'rows' => [
                    ['Warranty Tracking', 'Active', '15 Sep 2025'], ['Earn-Out Monitoring', 'Active', '15 Sep 2025'], ['Covenant Reporting', 'Active', '15 Sep 2025'], ['Quarterly Review', 'Active', '15 Sep 2025'], ['Trust Passport / Re-Verification', 'Active', '15 Dec 2025'], ['Review Reminders', 'Scheduled', 'Automated'],
                ]],
                ['type' => 'table', 'title' => '1. Deal Bible & Final Archive Pack', 'columns' => ['Item', 'Owner', 'Status'], 'rows' => [
                    ['Final Deal Bible', 'Lerato Pillay', 'Archived'], ['Audit Export', 'Michael Tumi', 'Archived'], ['Closing Pack', 'Aisha Sekele', 'Archived'], ['Handover Records', 'Sarah L.', 'Archived'],
                    ['Legal Documentation Archive', 'John Dlamini', 'Archived'], ['Funds-Flow Evidence', 'Lerato Pillay', 'Archived'], ['Monitoring Setup', 'Sipho K.', 'Archived'], ['Closure Certificate', 'Aisha Sekele', 'Issued'],
                ]],
            ],
            default => [],
        };
    }
}
