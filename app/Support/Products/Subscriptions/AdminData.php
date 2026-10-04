<?php

namespace App\Support\Products\Subscriptions;

/**
 * Portfolio baselines shown on the Subscriptions admin consoles (sample data from the
 * governance mockups). Live platform records are added on top of these by AdminController.
 */
class AdminData
{
    public const RECURRENCE_RESULTS = [
        ['R1', 'R1 Refreshed Content', 612, 598, 10, 4],
        ['R2', 'R2 Live System', 498, 475, 15, 8],
        ['R3', 'R3 Periodic Delivery', 801, 760, 28, 13],
        ['R4', 'R4 Standing Readiness', 403, 386, 17, 0],
        ['R5', 'R5 Accumulating Value', 202, 188, 8, 6],
    ];

    public const PASS_TREND = [['6 May', 94.1], ['7 May', 94.6], ['8 May', 93.9], ['9 May', 95.3], ['10 May', 96.1], ['11 May', 95.7], ['12 May', 95.66]];

    public const FAILURE_REASONS = [['No recurring value evidence', 12], ['Insufficient content updates', 7], ['Undefined delivery cadence', 6], ['Access not continuous', 4], ['Missing usage metrics', 2]];

    public const CLASS_REGISTER = [
        'R1' => ['Refreshed Content', 'Access to curated, updated information refreshed at least quarterly.', 41, 39, 1, 1, '14 Feb 2024'],
        'R2' => ['Live System', 'Continuous system access and live monitoring.', 38, 36, 2, 0, '02 Mar 2024'],
        'R3' => ['Periodic Delivery', 'Delivery of defined outputs at set intervals.', 42, 37, 3, 2, '21 Mar 2024'],
        'R4' => ['Standing Readiness', 'Reserved capacity and specialist availability on an ongoing basis.', 36, 33, 1, 2, '09 Apr 2024'],
        'R5' => ['Accumulating Value', 'Value grows through retained history and accumulated records.', 24, 22, 1, 1, '30 Apr 2024'],
    ];

    public const DEFERRED_TREND = [['Dec 2025', 13.9], ['Jan 2026', 14.1], ['Feb 2026', 14.2], ['Mar 2026', 14.4], ['Apr 2026', 14.6], ['May 2026', 14.26]];

    public const DEFERRED_BY_CLASS = [['R1', 'Refreshed Content', 2876530.19], ['R2', 'Live System', 3912880.45], ['R3', 'Periodic Delivery', 3245142.80], ['R4', 'Standing Readiness', 2951210.77], ['R5', 'Accumulating Value', 1272576.51]];

    public const DEFERRED_AGING = [['Current (≤ 30 days)', 2183450.18], ['31 – 90 Days', 4791210.44], ['91 – 365 Days', 6385680.10], ['> 365 Days', 897999.99]];

    public const RUN_PERFORMANCE = [['Dec 2025', 5980, 97.9], ['Jan 2026', 6040, 98.4], ['Feb 2026', 6010, 98.1], ['Mar 2026', 6135, 98.6], ['Apr 2026', 6342, 98.0], ['May 2026', 6162, 98.06]];

    public const INVOICE_EXCEPTIONS = [['Payment failed', 46, 182441.50, 14], ['On hold – Review required', 22, 95332.21, 12], ['Missing payment method', 8, 21884.30, 9], ['Duplicate detected', 3, 11746.00, 6], ['Tax / Compliance issue', 5, 7651.76, 7]];

    public const CHANNELS = [['Email', 5412], ['Portal', 721], ['Manual', 151], ['Other', 0]];

    public const DUNNING_AGING = [['1–7 Days Overdue', 26], ['8–14 Days Overdue', 18], ['15–30 Days Overdue', 21], ['31–60 Days Overdue', 13], ['> 60 Days Overdue', 6]];

    public const DUNNING_FUNNEL = [['Payment Failed', 122], ['1st Notice Sent', 98], ['2nd Notice Sent', 61], ['Final Notice Sent', 34], ['At Risk of Involuntary Churn', 23], ['Involuntary Churn', 23]];

    public const ENGAGEMENT_HEALTH = [['Healthy (High Engagement)', 1176], ['Moderate (Declining)', 450], ['At Risk (Low Engagement)', 158], ['High Risk (Very Low)', 58]];

    public const ENGAGEMENT_TREND = [
        ['Dec 2025', 1150, 420, 180, 70], ['Jan 2026', 1160, 430, 175, 66], ['Feb 2026', 1165, 440, 170, 63],
        ['Mar 2026', 1170, 445, 165, 61], ['Apr 2026', 1172, 448, 160, 59], ['May 2026', 1176, 450, 158, 58],
    ];

    public const DISUSE_INDICATORS = [['No sign-in/activity', 45], ['No content consumed', 34], ['No tool usage', 28], ['No report downloads', 19], ['No support interactions', 12], ['Other', 24]];

    public const DISUSE_BY_CLASS = [['R1 Refreshed Content', 86], ['R2 Live System', 52], ['R3 Periodic Delivery', 31], ['R4 Standing Readiness', 23], ['R5 Accumulating Value', 6]];

    public const CAPACITY_TREND = [['Dec 2025', 79.5], ['Jan 2026', 81.2], ['Feb 2026', 82.8], ['Mar 2026', 84.9], ['Apr 2026', 85.6], ['May 2026', 87.4]];

    public const CHURN_CAUSES = [['No longer needed', 18], ['Too expensive', 15], ['Low usage / Not using', 12], ['Switched provider', 9], ['Missing expected value', 8], ['Service / Support issue', 6], ['Other', 5]];

    public const CHURN_TREND = [['Dec 2025', 8.1, 4.6, 1.5], ['Jan 2026', 8.0, 4.4, 1.4], ['Feb 2026', 7.8, 4.2, 1.5], ['Mar 2026', 8.2, 5.3, 1.6], ['Apr 2026', 7.1, 4.3, 1.4], ['May 2026', 7.6, 4.3, 1.4]];

    public const CHURN_BY_CLASS = [['R1 Refreshed', 6.2], ['R2 Live System', 5.1], ['R3 Periodic Delivery', 8.7], ['R4 Standing Readiness', 9.6], ['R5 Accumulating Value', 7.3]];

    public const CHURN_TOP_LTM = [['No longer needed', 27.6], ['Too expensive', 21.3], ['Low usage / Not using', 17.0], ['Switched provider', 11.6], ['Missing expected value', 9.7], ['Service / Support issue', 7.6], ['Other', 4.9]];

    public const MRR_AT_RISK = [['Dec 2025', 241], ['Jan 2026', 236], ['Feb 2026', 228], ['Mar 2026', 219], ['Apr 2026', 219], ['May 2026', 219]];

    public const BELOW_FLOOR_SUBSCRIBERS = [
        ['Acme (Pty) Ltd', 'r1-legal-updates-monthly', 'R1 Legal Updates Monthly', '2026-01-12', 249.00, '2026-05-25'],
        ['BluePeak Holdings', 'r2-sop-library-access', 'R2 SOP Library Access', '2026-02-03', 399.00, '2026-05-31'],
        ['Cedar Logistics', 'r3-compliance-digest', 'R3 Compliance Digest', '2026-02-18', 199.00, '2026-05-28'],
        ['Delta Manufacturing', 'r4-hr-hotline-light', 'R4 HR Hotline Light', '2026-01-05', 450.00, '2026-05-22'],
        ['EverGreen Trust', 'r2-policy-pack-basic', 'R2 Policy Pack (Basic)', '2026-03-11', 245.83, '2026-05-30'],
    ];

    public const FLOOR_MARGIN = 35;
}
