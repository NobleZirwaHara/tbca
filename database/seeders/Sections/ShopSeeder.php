<?php

namespace Database\Seeders\Sections;

use App\Models\Order;
use App\Models\Shop\AuditEvent;
use App\Models\Shop\Brief;
use App\Models\Shop\DuplicateGroup;
use App\Models\Shop\Handoff;
use App\Models\Shop\MerchRoute;
use App\Models\Shop\Product;
use App\Models\Shop\Quote;
use App\Models\Shop\ReleaseMetric;
use App\Models\Shop\RetainerCapacity;
use App\Models\Shop\UatCase;
use App\Models\Submission;
use App\Models\User;
use App\Support\Platform\Money;
use App\Support\Shop\ListingGate;
use App\Support\Shop\ProductRegister;
use App\Support\Shop\Reconciler;
use Illuminate\Database\Seeder;

/**
 * Online Shop demo data from the Online Shop mockups. Idempotent.
 */
class ShopSeeder extends Seeder
{
    public function run(): void
    {
        $this->products();
        $this->capacities();
        $this->routes();
        $this->handoffs();
        $this->duplicates();
        $this->release();
        $this->audit();
        $this->commerce();

        ListingGate::scan();
    }

    private function products(): void
    {
        $defaults = [
            'sprint_code' => null, 'price_zar' => null, 'price_unit' => null, 'indicative_zar' => null, 'floor_zar' => null, 'tax_treatment' => 'standard',
            'tax_confirmed' => true, 'delivery' => null, 'output_format' => null, 'buyer_types' => null, 'best_for' => null, 'featured' => false, 'rating' => null,
            'reviews_count' => 0, 'source_records' => 1, 'aliases' => null, 'content' => null, 'variants' => null, 'gates' => null, 'recurrence' => null, 'version' => 'v1.0', 'status' => 'active',
        ];

        foreach (ProductRegister::products() as $row) {
            Product::query()->updateOrCreate(['slug' => $row['slug']], [...$defaults, ...$row]);
        }
    }

    private function id(string $slug): ?int
    {
        return Product::query()->where('slug', $slug)->value('id');
    }

    private function capacities(): void
    {
        $all = ['c1' => true, 'c2' => true, 'c3' => true, 'c4' => true, 'c5' => true];
        $rows = [
            ['RE-10012', null, 'SME Legal Support Retainer', 20, 'HOUR', 'Standard Scope', 'NAMED_PERSON', 'Thandi M.', $all, 20, 8.5, 1],
            ['RE-10028', null, 'HR Compliance Retainer', 10, 'HOUR', 'HR Compliance Only', 'DEFINED_ROLE', 'HR Advisor', $all, 10, 3, 7],
            ['RE-10047', null, 'Tax Advisory Retainer', 15, 'HOUR', 'Tax Advisory Only', 'NAMED_PERSON', 'Jason K.', $all, 15, 12.75, 0],
            ['RE-10053', null, 'Finance Director Support', 25, 'HOUR', 'Finance Leadership', 'TEAM', 'Finance Leadership Team', $all, 25, 20.25, 0],
            ['RE-10067', null, 'Operations Advisory Retainer', 12, 'HOUR', 'Ops Advisory Only', 'DEFINED_ROLE', 'Ops Advisor', ['c1' => true, 'c2' => true, 'c3' => true, 'c4' => false, 'c5' => false], 0, 0, 0],
            ['RE-10081', null, 'Documentation Review', 30, 'DELIVERABLE', 'Docs Review Only', 'TEAM', 'Legal Support Team', $all, 30, 9, 6],
            ['RE-10093', null, 'Environmental Compliance Retainer', 8, 'TICKET', 'Environmental Only', 'NAMED_PERSON', 'Nadia P.', ['c1' => true, 'c2' => false, 'c3' => true, 'c4' => false, 'c5' => true], 0, 0, 0],
            ['RE-10105', 'strategic-advisory-retainer', 'Board Advisory Retainer', 18, 'HOUR', 'Board Advisory Only', 'NAMED_PERSON', 'Daniel R.', $all, 18, 6.75, 6],
            ['RE-01012', 'retainer-compliance-advisory', 'Retainer: Compliance Advisory', 22, 'HOUR', 'Compliance Advisory', 'NAMED_PERSON', 'N. Dlamini', $all, 22, 14, 0],
            ['PA-30085', 'business-rescue-advisory-sprint', 'Business Rescue Advisory', 0, 'HOUR', null, 'NAMED_PERSON', 'Partner (TBC)', ['c1' => false, 'c2' => false, 'c3' => true, 'c4' => false, 'c5' => false], 0, 0, 0],
        ];

        foreach ($rows as [$code, $slug, $name, $allowance, $unit, $scope, $model, $owner, $elements, $reserved, $utilised, $underUse]) {
            RetainerCapacity::query()->updateOrCreate(['code' => $code], [
                'product_id' => $slug ? $this->id($slug) : null, 'name' => $name, 'allowance' => $allowance, 'unit' => $unit, 'period' => 'Monthly',
                'scope' => $scope, 'owner_model' => $model, 'owner' => $owner, 'elements' => $elements, 'reserved' => $reserved, 'utilised' => $utilised, 'under_use_months' => $underUse,
            ]);
        }
    }

    private function routes(): void
    {
        $rows = [
            // Related offers for the Market Entry Strategy Sprint (OS-021).
            ['market-entry-strategy-sprint', 'sprint', 'Next Best / Upsell', 'financial-feasibility-analysis-sprint', 'ACTIVE_PURCHASE', 'After defining your market entry strategy, validate your financial feasibility.', 'N. Dlamini', 0],
            ['market-entry-strategy-sprint', 'sprint', 'Attach Path: Related Sprint', 'competitor-landscape-sprint', 'ACTIVE_PURCHASE', 'Understand competitors before you enter.', 'N. Dlamini', 1],
            ['market-entry-strategy-sprint', 'digital_product', 'Attach Path: Toolkit', 'regulatory-compliance-check', 'ACTIVE_PURCHASE', 'Check regulatory requirements in your target market.', 'K. Govender', 2],
            ['market-entry-strategy-sprint', 'sprint', 'Next Best / Upsell', 'go-to-market-roadmap-sprint', 'ACTIVE_PURCHASE', 'Turn strategy into a launch roadmap.', 'N. Dlamini', 3],
            ['market-entry-strategy-sprint', 'sprint', 'Attach Path: Partner', 'local-partner-identification', 'ACTIVE_PURCHASE', 'Find trusted local partners.', 'T. Moremi', 4],
            ['country-entry-framework-digital', 'sprint', 'Next Best / Upsell', 'market-entry-strategy-sprint', 'ACTIVE_PURCHASE', 'Have TBCA build the strategy with you.', 'K. Govender', 0],
            ['business-planning-subscription', 'sprint', 'Attach Path: Plan', 'business-plan-development', 'ACTIVE_PURCHASE', 'Start with an investor-ready plan.', 'L. Mokoena', 0],
            // Legacy merchandising relationships under remediation (OS-042).
            ['popia-compliance-health-check', 'retainer', 'Attach Path: Retainer Next Best', 'retainer-compliance-advisory', 'ACTIVE_PROPOSAL', 'Ongoing compliance support after the health check.', 'N. Dlamini', 5],
            ['popia-compliance-health-check', 'digital_product', 'Next Best / Upsell', 'popia-policy-template-pack', 'ACTIVE_PURCHASE', 'Adopt the policies the health check recommends.', 'K. Govender', 6],
            ['popia-policy-template-pack', 'subscription', 'Recurring: Monthly Attach Path', 'compliance-intelligence-subscription', 'ACTIVE_PURCHASE', 'Keep policies current with monthly alerts.', 'L. Mokoena', 0],
            ['tax-bulletin-monthly', 'subscription', 'Recurring: Monthly Attach Path', 'ai-compliance-monitor', 'HONEST_HOLD', 'Destination subscription not certified (R2 fail).', 'L. Mokoena', 0],
            ['investment-readiness-assessment-sprint', 'retainer', 'Attach Path: Advisory Retainer', 'strategic-advisory-retainer', 'ACTIVE_PROPOSAL', 'Senior adviser support through the raise.', 'T. Moremi', 0],
            ['business-health-diagnostic-sprint', 'retainer', 'Attach Path: Ops Retainer', 'business-rescue-advisory-sprint', 'HONEST_HOLD', 'Destination retainer is C1-C5 incomplete.', 'S. Naidoo', 0],
            ['cybersecurity-risk-assessment', 'sprint', 'Next Best / Upsell', 'cloud-migration-assessment', 'SUPPRESSED_BROKEN', 'Destination blocked at listing gate.', 'K. Govender', 0],
        ];

        foreach ($rows as [$src, $type, $legacy, $dst, $disp, $fit, $owner, $pos]) {
            $source = Product::query()->where('slug', $src)->first();
            $dest = Product::query()->where('slug', $dst)->first();
            MerchRoute::query()->updateOrCreate(['source_code' => $source->sprint_code ?? $source->code, 'destination_code' => $dest->code], [
                'source_product_id' => $source->id, 'source_name' => $source->name, 'relationship_type' => $type, 'legacy_relationship' => $legacy,
                'destination_product_id' => $dest->id, 'destination_name' => $dest->name, 'destination_vehicle' => "{$dest->vehicle_code} {$dest->vehicle}",
                'destination_act' => $dest->act, 'disposition' => $disp, 'fit_reason' => $fit, 'owner' => $owner, 'position' => $pos,
            ]);
        }
    }

    private function handoffs(): void
    {
        $rows = [
            ['HN-2026-0186', 'RE-10102', 'SME Legal Support Retainer', 'VEH-05 Retainers', 'A4 Retainer', 'Thandi M. Attorneys Inc.', 'Legal Professionals', 'handoff_in_progress', 'low', 'within', '2026-10-06'],
            ['HN-2026-0185', 'PA-20018', 'B-BBEE Verification', 'VEH-12 Project Advisory', 'A5 Marketplace', 'BEE Verified Partners', 'Accountants / Auditors', 'accepted', 'low', 'within', null],
            ['HN-2026-0184', 'TE-30045', 'Cloud Migration Assessment', 'VEH-12 Project Advisory', 'A5 Marketplace', 'CloudBase Solutions (Pty) Ltd', 'Engineers / Technical', 'handoff_in_progress', 'medium', 'at_risk', '2026-10-05'],
            ['HN-2026-0183', 'TX-10067', 'Tax Advisory (Complex)', 'VEH-12 Project Advisory', 'A5 Marketplace', 'Jason K. Tax Specialists', 'Tax Practitioners', 'escalated', 'high', 'breached', null],
            ['HN-2026-0182', 'AU-40021', 'Audit & Assurance Engagement', 'VEH-12 Project Advisory', 'A5 Marketplace', 'AuditRight Professionals', 'Accountants / Auditors', 'accepted', 'low', 'within', null],
        ];
        foreach ($rows as [$ref, $code, $name, $veh, $act, $pro, $type, $stage, $risk, $boundary, $sla]) {
            Handoff::query()->updateOrCreate(['reference' => $ref], [
                'sprint_code' => $code, 'product_name' => $name, 'vehicle' => $veh, 'act' => $act, 'professional' => $pro, 'professional_type' => $type,
                'stage' => $stage, 'risk' => $risk, 'boundary' => $boundary, 'sla_due' => $sla,
            ]);
        }
    }

    private function duplicates(): void
    {
        $rows = [
            ['DG-0001', 'Portal Scoping | Premium tier', 'Product Name & Description', 24, 'PM-01023', 98, 'VEH-01 Sprint', 'One-off Sprint', 'consolidated'],
            ['DG-0002', 'HR Compliance Retainer | Monthly', 'Product Name', 18, 'PM-02011', 95, 'VEH-05 Retainer', 'Retainer', 'consolidated'],
            ['DG-0003', 'Tax Bulletin | Monthly Subscription', 'Product Name', 16, 'PM-03005', 94, 'VEH-04 Subscription', 'Subscription', 'consolidated'],
            ['DG-0004', 'B-BBEE Verification | Standard', 'Name & Description', 12, 'PM-04007', 96, 'VEH-05 Retainer', 'Request Proposal', 'pending_review'],
            ['DG-0005', 'ESG Insights | Weekly Report', 'Description', 10, 'PM-05002', 93, 'VEH-04 Subscription', 'Subscription', 'pending_validation'],
            ['DG-0006', 'Financial Model Template', 'Name & Media', 9, 'PM-06015', 92, 'VEH-02 Digital', 'Digital Product', 'consolidated'],
            ['DG-0007', 'Company Valuation Advisory', 'Name', 8, 'PM-07003', 93, 'VEH-05 Retainer', 'Request Proposal', 'pending_review'],
            ['DG-0008', 'POPIA Compliance Sprint', 'Name & Description', 7, 'PM-01045', 91, 'VEH-01 Sprint', 'One-off Sprint', 'consolidated'],
            ['DG-0009', 'Market Entry Strategy Sprint', 'Name & Description', 8, 'MES-SPR-001', 97, 'VEH-02 Sprint', 'One-off Sprint', 'pending_review'],
            ['DG-0010', 'Go-to-Market Strategy Sprint', 'Product Name', 6, 'GMS-SPR-016', 94, 'VEH-02 Sprint', 'One-off Sprint', 'pending_validation'],
        ];
        foreach ($rows as [$code, $title, $type, $dups, $canon, $score, $veh, $act, $status]) {
            DuplicateGroup::query()->updateOrCreate(['group_code' => $code], [
                'title' => $title, 'content_type' => $type, 'duplicates' => $dups, 'canonical_code' => $canon, 'match_score' => $score,
                'vehicle' => $veh, 'act' => $act, 'status' => $status,
                'members' => collect(range(1, min($dups, 4)))->map(fn ($i) => "{$title} (legacy source {$i})")->all(),
            ]);
        }
    }

    private function release(): void
    {
        $metrics = [
            ['MET-01', 'Catalogue Completeness', 'All required fields complete', 'L1 + L2', '100%', 'P. Govender'],
            ['MET-02', 'Listing-State Derivation', 'LS = f(CA) proven for all', 'L1 + L2', '100%', 'N. Dlamini'],
            ['MET-03', 'Vehicle & Act Consistency', 'Vehicle/Act valid for all', 'L1', '100%', 'L. Mokoena'],
            ['MET-04', 'Price, Floor & Tax Validity', 'Price >= Floor & Tax profile valid', 'L1 + L2', '100%', 'T. Moreni'],
            ['MET-05', 'Content & Language Readiness', 'EN ready, AF governance met', 'L1 + L2', '100%', 'K. Naidoo'],
            ['MET-06', 'Licensing / IP Clearance', 'Correct L4 scope applied', 'L2', '100%', 'R. Jacobs'],
            ['MET-07', 'QA & Quality Assurance', 'Creation QA pass', 'L2', '100%', 'S. Botha'],
            ['MET-08', 'Relationship Remediation', 'Route remediation done', 'L2', '100%', 'P. Govender'],
            ['MET-09', 'Commerce & Reconciliation', 'QBO & entitlement sync', 'L2 + L3', '0 Exceptions', 'F. Adams'],
            ['MET-10', 'Adversarial & Risk Review', 'All adversarial risks closed', 'L2 + L3', '0 Open', 'Exec Committee'],
        ];
        foreach ($metrics as $i => [$code, $metric, $def, $method, $target, $owner]) {
            $closed = $i < 8;
            ReleaseMetric::query()->firstOrCreate(['code' => $code], [
                'metric' => $metric, 'definition' => $def, 'closure_method' => $method, 'target' => $target, 'owner' => $owner,
                'evidence' => $closed ? 'EV-'.$code.'.pdf' : null, 'measured' => $closed ? 'Met' : null,
                'status' => $closed ? 'closed' : 'open', 'closed_at' => $closed ? now()->subHours(10 - $i) : null,
            ]);
        }

        $cases = [
            ['OS-UAT-035', 'Basket partition: A1 + A4 split before commitment', 'pass', 'L. Mokoena'],
            ['OS-UAT-036', 'Declined card keeps order unpaid with recovery route', 'pass', 'N. Dlamini'],
            ['OS-UAT-037', 'Below-floor product cannot be added to basket', 'pass', 'T. Moremi'],
            ['OS-UAT-038', 'Uncertified subscription shows View Current Options', 'pass', 'K. Naidoo'],
            ['OS-UAT-039', 'Free activation requires eligibility (no payment)', 'pass', 'P. Govender'],
            ['OS-UAT-040', 'Quote acceptance converts to checkout order', 'pass', 'F. Adams'],
            ['OS-UAT-041', 'Legacy Attach Path Subscription but uncertified', 'pass', 'L. Mokoena'],
            ['OS-UAT-042', 'Route remediation full batch', 'pass', 'N. Dlamini'],
            ['OS-UAT-043', 'A1 end-to-end: Sprint -> entitlement', 'pass', 'T. Moremi'],
            ['OS-UAT-044', 'A2 end-to-end: Digital Product entitlement', 'pass', 'K. Naidoo'],
            ['OS-UAT-045', 'Adversarial: unresolvable purchase paths', 'pass', 'P. Govender'],
            ['OS-UAT-046', 'VAT populated but unconfirmed payment blocked', 'fail', 'L. Mokoena'],
        ];
        foreach ($cases as $i => [$code, $scenario, $result, $by]) {
            UatCase::query()->firstOrCreate(['code' => $code], [
                'scenario' => $scenario, 'result' => $result, 'executed_by' => $by, 'executed_at' => now()->subMinutes(60 - $i * 2),
            ]);
        }
    }

    private function audit(): void
    {
        if (AuditEvent::query()->exists()) {
            return;
        }
        foreach ([
            ['Thandi M.', 'update', 'SMP-RA-001', 'Updated description and delivery window', 'v1.2', 3],
            ['Johan L.', 'create', 'RA-001-V3', 'Created Premium Advisory variant', 'v1.2', 4],
            ['Nadia P.', 'publish', 'RA-001-V1', 'Updated support profile', 'v1.1', 20],
        ] as [$actor, $action, $subject, $summary, $version, $hours]) {
            AuditEvent::create(['actor' => $actor, 'action' => $action, 'subject' => $subject, 'summary' => $summary, 'version' => $version,
                'created_at' => now()->subHours($hours), 'updated_at' => now()->subHours($hours)]);
        }
    }

    private function commerce(): void
    {
        $client = User::query()->where('email', 'amahle@agritechsa.co.za')->first();

        // A quote-request submission and the issued, versioned quote (OS-033).
        $submission = Submission::query()->updateOrCreate(['reference' => 'TBCA-SUB-2026-QT0047'], [
            'user_id' => $client?->id, 'type' => 'quote-request', 'section' => 'shop', 'subject' => 'Cybersecurity Risk Assessment',
            'name' => $client?->name ?? 'Amahle Dlamini', 'email' => $client?->email ?? 'amahle@agritechsa.co.za', 'status' => 'responded',
            'payload' => ['engagement_type' => 'Technology Solutions', 'budget' => 'ZAR 100,000 - ZAR 250,000', 'timeline' => '2 - 3 Weeks',
                'summary' => 'We need a comprehensive cybersecurity risk assessment across our IT infrastructure, applications and data handling processes.'],
        ]);
        Submission::query()->updateOrCreate(['reference' => 'TBCA-SUB-2026-QT0052'], [
            'user_id' => $client?->id, 'type' => 'quote-request', 'section' => 'shop', 'subject' => 'Tax Due Diligence and Compliance Review',
            'name' => $client?->name ?? 'Amahle Dlamini', 'email' => $client?->email ?? 'amahle@agritechsa.co.za', 'status' => 'received',
            'payload' => ['product' => 'tax-due-diligence-compliance-review', 'engagement_type' => 'Due Diligence', 'client_type' => 'Private Company',
                'budget' => 'ZAR 250,000 - ZAR 500,000', 'timeline' => '4 - 6 Weeks', 'industry' => 'Financial Services', 'country' => 'South Africa',
                'summary' => 'We require a comprehensive tax due diligence review of the target company including historical compliance, risk assessment and tax structuring recommendations.'],
        ]);

        Quote::query()->updateOrCreate(['reference' => 'TBCA-QTE-2026-000047'], [
            'submission_id' => $submission->id, 'user_id' => $client?->id, 'title' => 'Cybersecurity Risk Assessment', 'category' => 'Technology Solutions',
            'licence' => 'TS - Tech Solutions Engagement', 'provider' => 'SecureTech Solutions (Pty) Ltd', 'email' => $client?->email,
            'version' => 1, 'status' => 'issued', 'valid_until' => now()->addDays(14)->toDateString(), 'issued_at' => now()->subHours(2),
            'lines' => [['description' => 'Cybersecurity Risk Assessment', 'quantity' => 1, 'unit_zar' => 78000], ['description' => 'Executive Presentation', 'quantity' => 1, 'unit_zar' => 7500]],
            'deliverables' => ['Comprehensive vulnerability assessment', 'Risk identification and prioritisation', 'Mitigation recommendations and roadmap', 'Executive summary presentation', 'Technical report and evidence pack'],
            'terms' => [['Payment Terms', '50% upfront, 50% on delivery'], ['Validity', 'This quote is valid for 14 days'], ['Delivery Timeline', '2 - 3 weeks from engagement start'], ['Revisions', 'Up to 2 revision cycles included']],
            'history' => [['version' => 0, 'label' => 'V0 (Original)', 'subtotal_zar' => 91000, 'issued_at' => now()->subHours(6)->toIso8601String()]],
            'provider_note' => 'We appreciate the opportunity to support your organisation. Please let us know if you have any questions. - SecureTech Solutions Team',
        ]);

        Brief::query()->updateOrCreate(['reference' => 'TBCA-BRF-2026-000031'], [
            'user_id' => $client?->id, 'product_id' => $this->id('business-valuation-advisory-brief'), 'title' => 'Business Valuation Advisory - Manufacturing Company',
            'step' => 5, 'status' => 'matching', 'submitted_at' => now()->subDay(),
            'data' => ['title' => 'Business Valuation Advisory - Manufacturing Company', 'category' => 'Business Advisory', 'project_type' => 'One-off Project', 'industry' => 'Manufacturing',
                'country' => 'South Africa', 'value_band' => 'ZAR 250,000 - ZAR 500,000', 'start_date' => '2026-09-15', 'delivery_location' => 'Remote',
                'summary' => 'We require an independent business valuation of our manufacturing business for strategic planning and potential investor engagement.'],
        ]);

        // Demo paid orders so Orders & Accounting / QBO reconciliation show real records.
        $orders = [
            ['TBCA-ORD-2026-SHOP01', 'market-entry-strategy-sprint', 'paid', true],
            ['TBCA-ORD-2026-SHOP02', 'country-entry-framework-digital', 'paid', false],
            ['TBCA-ORD-2026-SHOP03', 'popia-policy-template-pack', 'refunded', true],
        ];
        foreach ($orders as $i => [$ref, $slug, $status, $reconcile]) {
            if (Order::query()->where('reference', $ref)->exists()) {
                continue;
            }
            $p = Product::query()->where('slug', $slug)->first();
            $t = Money::totals($p->price_zar, 'card');
            $order = Order::create([
                'reference' => $ref, 'user_id' => $client?->id, 'section' => 'shop', 'status' => $status,
                'subtotal_zar' => $t['subtotal'], 'vat_zar' => $t['vat'], 'fees_zar' => $t['fees'], 'total_zar' => $t['total'],
                'billing' => ['name' => $client?->name ?? 'Amahle Dlamini', 'email' => $client?->email ?? 'amahle@agritechsa.co.za', 'company' => 'AgriTech SA'],
                'meta' => [], 'paid_at' => now()->subDays(3 - $i),
            ]);
            $order->items()->create(['item_type' => $p->act === 'A2' ? 'digital-product' : 'sprint', 'item_code' => $p->code, 'name' => $p->name,
                'quantity' => 1, 'unit_zar' => $p->price_zar, 'line_zar' => $p->price_zar, 'meta' => ['slug' => $slug]]);
            $order->payments()->create(['reference' => 'TBCA-PAY-2026-SHOP0'.($i + 1), 'method' => 'card', 'status' => 'succeeded', 'amount_zar' => $t['total'], 'meta' => ['last4' => '1111', 'brand' => 'Visa']]);
            if ($reconcile) {
                if ($status === 'refunded') {
                    $order->update(['status' => 'paid']);
                    Reconciler::reconcile($order);
                    $order->update(['status' => 'refunded']);
                }
                Reconciler::reconcile($order->fresh());
            }
        }
    }
}
