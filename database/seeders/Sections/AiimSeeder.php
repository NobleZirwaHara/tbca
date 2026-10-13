<?php

namespace Database\Seeders\Sections;

use App\Models\Aiim\Advisor;
use App\Models\Aiim\Alert;
use App\Models\Aiim\ApiKey;
use App\Models\Aiim\ArchiveItem;
use App\Models\Aiim\Brief;
use App\Models\Aiim\CaseFile;
use App\Models\Aiim\Comparison;
use App\Models\Aiim\Corridor;
use App\Models\Aiim\Country;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\EngagementEvent;
use App\Models\Aiim\Entitlement;
use App\Models\Aiim\FeeCode;
use App\Models\Aiim\Handoff;
use App\Models\Aiim\Introduction;
use App\Models\Aiim\IntroductionParty;
use App\Models\Aiim\LedgerEntry;
use App\Models\Aiim\Organisation;
use App\Models\Aiim\Project;
use App\Models\Aiim\Province;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\SavedItem;
use App\Models\Aiim\Sector;
use App\Models\Aiim\Source;
use App\Models\Aiim\VerificationItem;
use App\Models\Aiim\WalletTransaction;
use App\Models\User;
use App\Support\Aiim\CountryData;
use App\Support\Aiim\EngagementFlow;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\SeedData;
use Illuminate\Database\Seeder;

/**
 * AIIM catalogue and demo workspace, taken from the AIIM mockups. Idempotent.
 */
class AiimSeeder extends Seeder
{
    public function run(): void
    {
        foreach (CountryData::rows() as $c) {
            Country::updateOrCreate(['iso2' => $c['iso2']], $c);
        }
        foreach (SeedData::provinces() as $i => $p) {
            Province::updateOrCreate(['slug' => $p['slug']], $p + ['rank' => $i + 1]);
        }
        foreach (SeedData::sectors() as $i => $s) {
            Sector::updateOrCreate(['slug' => $s['slug']], $s + ['sort' => $i]);
        }
        foreach (SeedData::sources() as $s) {
            Source::updateOrCreate(['code' => $s['code']], $s);
        }
        foreach (SeedData::projects() as $p) {
            Project::updateOrCreate(['code' => $p['code']], $p);
        }
        foreach (SeedData::organisations() as $o) {
            Organisation::updateOrCreate(['slug' => $o['slug']], $o);
        }
        foreach (SeedData::corridors() as $c) {
            Corridor::updateOrCreate(['slug' => $c['slug']], $c);
        }
        foreach (SeedData::briefs() as $b) {
            Brief::updateOrCreate(['sku' => $b['sku']], $b);
        }
        foreach (SeedData::feeCodes() as $f) {
            FeeCode::updateOrCreate(['code' => $f['code']], $f);
        }
        foreach (SeedData::advisors() as $a) {
            Advisor::updateOrCreate(['slug' => $a['slug']], $a);
        }
        foreach (SeedData::alerts() as $a) {
            Alert::updateOrCreate(['title' => $a['title'], 'user_id' => null], $a);
        }

        // 54-country geography, map layers, project briefs, registers and the Botswana country pack.
        $this->call(AiimGeoSeeder::class);

        Pricing::flush();

        $client = User::query()->where('email', 'amahle@agritechsa.co.za')->first();
        if ($client) {
            $this->workspace($client);
        }
    }

    private function workspace(User $u): void
    {
        $saved = [
            ['saved', 'opportunity', 'gauteng-data-centre-campus', 'Gauteng Data Centre Campus'],
            ['saved', 'project', 'fintech-innovation-hub-expansion', 'Fintech Innovation Hub Expansion'],
            ['saved', 'project', 'gautrain-digital-upgrade', 'Gautrain Digital Upgrade'],
            ['saved', 'corridor', 'north-corridor', 'North Corridor Trade & Logistics Route'],
            ['saved', 'investor', 'ai-data-sovereignty-partner-fund', 'AI & Data Sovereignty Partner Fund'],
            ['saved', 'report', 'SA-IC-2025', 'South Africa Investment Climate Brief 2025'],
            ['watchlist', 'opportunity', 'gauteng-data-centre-campus', 'Gauteng Data Centre Campus'],
            ['watchlist', 'project', 'fintech-innovation-hub-expansion', 'Fintech Innovation Hub Expansion'],
            ['watchlist', 'investor', 'ai-data-sovereignty-partner-fund', 'AI & Data Sovereignty Partner Fund'],
            ['watchlist', 'funder', 'ai-sovereignty-venture-fund', 'AI Sovereignty Venture Fund'],
            ['watchlist', 'corridor', 'north-corridor', 'North Corridor Trade & Logistics Route'],
        ];
        foreach ($saved as [$list, $type, $key, $label]) {
            SavedItem::updateOrCreate(['user_id' => $u->id, 'list' => $list, 'entity_type' => $type, 'entity_key' => $key], ['label' => $label, 'alerts' => true]);
        }

        Comparison::updateOrCreate(['reference' => 'cmp_20250506_001'], [
            'user_id' => $u->id,
            'items' => [
                ['type' => 'opportunity', 'key' => 'gauteng-data-centre-campus'],
                ['type' => 'project', 'key' => 'fintech-innovation-hub-expansion'],
                ['type' => 'investor', 'key' => 'ai-data-sovereignty-partner-fund'],
            ],
            'saved' => true,
        ]);

        // Wallet: R5 000 top-up, two unlocks, one refund.
        if (! WalletTransaction::query()->where('user_id', $u->id)->exists()) {
            $rows = [
                ['top-up', 5000, 'Payment: Card ending 1234', '-6 days 11:45'],
                ['debit', -285, 'Unlock: Gauteng Data Centre Campus (extra view)', '-6 days 11:50'],
                ['debit', -570, 'Unlock: Fintech Innovation Hub Expansion (extra views)', '-6 days 12:05'],
                ['credit', 285, 'Refund: Unlock cancelled', '-6 days 12:30'],
            ];
            $balance = 0;
            foreach ($rows as $i => [$type, $amount, $desc, $when]) {
                $balance += $amount;
                WalletTransaction::create([
                    'reference' => 'WTX-SEED-'.$u->id.'-'.$i, 'user_id' => $u->id, 'type' => $type,
                    'amount_zar' => $amount, 'balance_zar' => $balance, 'description' => $desc,
                    'created_at' => now()->modify($when), 'updated_at' => now()->modify($when),
                ]);
            }
        }

        Entitlement::updateOrCreate(['reference' => 'ENT-20250506-7890'], [
            'user_id' => $u->id, 'object_type' => 'project', 'object_key' => 'OPP-GA-FIH-002', 'title' => 'Fintech Innovation Hub Expansion',
            'product_type' => 'Premium Financial Model', 'access_type' => 'pay-per-view', 'views_included' => 10, 'views_used' => 3,
            'extra_view_zar' => 285, 'amount_zar' => 2622, 'payment_method' => 'Wallet', 'status' => 'active',
            'expires_at' => now()->addDays(5), 'meta' => ['item' => 'Detailed financial model'],
        ]);

        ReportRequest::updateOrCreate(['reference' => 'REP-20250506-0037'], [
            'quote_reference' => 'AIIM-QR-20250506-037', 'user_id' => $u->id, 'brief_sku' => 'SA-EC-IPAP-2025',
            'title' => 'Eastern Cape Industrial Parks Attractiveness Profile 2025', 'report_type' => 'AIIM-RPT-PFM-001',
            'config' => ['type' => 'AIIM-RPT-PFM-001', 'nationwide' => true, 'provinces' => ['eastern-cape'], 'sectors' => ['ict-digital-services', 'manufacturing', 'renewable-energy'], 'modules' => ['market-overview', 'growth-drivers', 'investment-opportunities', 'regulatory', 'infrastructure', 'risk', 'swot'], 'delivery' => 'standard', 'format' => 'pdf-excel'],
            'step' => 4, 'lines' => Pricing::report(['type' => 'AIIM-RPT-PFM-001', 'nationwide' => true, 'provinces' => ['eastern-cape'], 'sectors' => ['a', 'b', 'c'], 'modules' => [1, 2, 3, 4, 5, 6, 7]])['lines'],
            'subtotal_zar' => 7700, 'vat_zar' => 1155, 'total_zar' => 8855, 'status' => 'delivered', 'valid_until' => now()->addDays(7),
            'delivered_at' => now()->subDays(5), 'delivery' => ['pages' => 48, 'size' => '5.2 MB', 'email' => $u->email],
        ]);

        $this->mandate($u);
        $this->quotedEngagement($u);

        foreach ([
            ['Mandate', 'Renewable Energy Opportunities', 'MND-2025-05-07-001', '-10 days', '2.4 GB', 'Sipho Maseko'],
            ['Report', 'Market & Sector Deep Dive Report', 'REP-2025-05-07-015', '-11 days', '45.7 MB', 'System'],
            ['Document', 'Due Diligence Evidence Pack', 'MND-2025-04-15-002', '-12 days', '1.2 GB', 'Thabo Mokoena'],
            ['Data Set', 'Investor Mapping Dataset', 'DATA-2025-05-01-003', '-13 days', '880 MB', 'System'],
            ['Report', 'Provincial Infrastructure Pipeline', 'REP-2025-04-20-006', '-14 days', '32.1 MB', 'Sipho Maseko'],
        ] as [$type, $name, $related, $when, $size, $by]) {
            ArchiveItem::updateOrCreate(['user_id' => $u->id, 'name' => $name], [
                'type' => $type, 'related' => $related, 'archived_on' => now()->modify($when), 'retain_until' => now()->modify($when)->addYears(7),
                'size' => $size, 'archived_by' => $by,
            ]);
        }

        foreach ([['Production Key', 'live', 'a7f9', '-200 days'], ['Analytics Service', 'live', 'c3d2', '-160 days'], ['Dev Integration', 'test', 'b8e1', '-240 days'], ['Reporting Tool', 'live', 'd9f4', '-190 days']] as [$name, $env, $last4, $when]) {
            ApiKey::updateOrCreate(['user_id' => $u->id, 'name' => $name], [
                'environment' => $env, 'prefix' => "aiim_{$env}_", 'last_four' => $last4, 'key_hash' => hash('sha256', $name.$last4),
                'created_at' => now()->modify($when),
            ]);
        }
    }

    /** The flagship mandate shown across the mandate-stage screens. */
    private function mandate(User $u): void
    {
        $advisor = Advisor::query()->where('slug', 'sipho-maseko')->first();
        $quote = Pricing::engagement(EngagementFlow::quoteTemplate('advisory', 'renewable energy'));
        $quote += ['number' => 'TQ-20250507-001', 'issued' => now()->subDays(12)->toDateString(), 'valid_until' => now()->addDays(2)->toDateString(), 'duration' => '4–6 weeks', 'engagement_type' => 'Advisory'];

        $e = Engagement::updateOrCreate(['reference' => 'ENG-20250507-001'], [
            'mandate_reference' => 'MND-2025-05-07-001',
            'user_id' => $u->id,
            'advisor_id' => $advisor?->id,
            'type' => 'advisory',
            'title' => 'Renewable Energy Investment Opportunity Analysis – South Africa',
            'status' => 'in_progress',
            'stage' => 'Market & Sector Deep Dive',
            'progress' => 48,
            'step' => 5,
            'request' => [
                'areas' => ['Investment strategy & structuring', 'Project due diligence support', 'Stakeholder & partner introductions'],
                'purpose' => 'Explore investment opportunities',
                'focus' => 'Renewable Energy',
                'additional' => ['Project due diligence support'],
                'provinces' => ['eastern-cape'],
                'sectors' => ['renewable-energy', 'ict-digital-services', 'manufacturing'],
                'summary' => 'We are evaluating renewable energy opportunities in South Africa with a focus on solar and storage projects.',
                'engagement_type' => 'Virtual advisory (online)',
                'timeline' => '1–3 months',
            ],
            'booking_reference' => 'DSC-20250507-001',
            'discovery_at' => now()->subDays(12)->setTime(11, 0),
            'outcome' => SeedData::discoveryOutcome(),
            'quote' => $quote,
            'quote_accepted_at' => now()->subDays(12),
            'letter_accepted_at' => now()->subDays(12),
            'signature_name' => $u->name,
            'signature_title' => 'Managing Director',
            'signed_at' => now()->subDays(12),
            'deposit_paid_at' => now()->subDays(11),
            'workplan' => [
                ['key' => 'setup', 'label' => 'Mandate Setup', 'status' => 'completed', 'date' => now()->subDays(12)->format('j M Y')],
                ['key' => 'research', 'label' => 'Research & Analysis', 'status' => 'in_progress', 'date' => 'Day 6 of 20'],
                ['key' => 'draft', 'label' => 'Draft Report', 'status' => 'pending', 'date' => 'From Day 16'],
                ['key' => 'review', 'label' => 'Client Review', 'status' => 'pending', 'date' => 'From Day 18'],
                ['key' => 'final', 'label' => 'Final Report', 'status' => 'pending', 'date' => 'Due '.now()->addDays(16)->format('j M Y')],
            ],
            'deliverables' => SeedData::deliverables(),
            'verification' => ['approved_external' => 2880, 'approved_at' => now()->subDays(10)->toDateString()],
            'deep_dive' => SeedData::deepDive(),
            'packaging' => SeedData::packaging(),
            'delivery' => SeedData::delivery(),
            'original_end_date' => now()->addDays(16)->toDateString(),
            'end_date' => now()->addDays(16)->toDateString(),
        ]);

        if (! $e->events()->exists()) {
            foreach ([
                ['client', 'Request submitted', null, 'submitted', -14], ['staff', 'Discovery booked', 'submitted', 'discovery_booked', -13],
                ['staff', 'Discovery completed', 'discovery_booked', 'discovery_completed', -12], ['staff', 'Quotation issued', 'discovery_completed', 'quoted', -12],
                ['client', 'Quote accepted', 'quoted', 'quote_accepted', -12], ['client', 'Letter accepted', 'quote_accepted', 'letter_accepted', -12],
                ['client', 'Signed — Deposit Due', 'letter_accepted', 'signed', -12], ['system', 'In Progress', 'signed', 'in_progress', -11],
            ] as [$actor, $action, $from, $to, $days]) {
                EngagementEvent::create(['engagement_id' => $e->id, 'actor' => $actor, 'action' => $action, 'from_status' => $from, 'to_status' => $to, 'created_at' => now()->addDays($days)]);
            }
        }

        foreach (SeedData::verificationItems() as $i => $item) {
            VerificationItem::updateOrCreate(['engagement_id' => $e->id, 'code' => $item['code']], $item + ['sort' => $i]);
        }

        $intro = Introduction::updateOrCreate(['reference' => 'INT-2025-05-07-001'], [
            'engagement_id' => $e->id,
            'project_name' => 'Jeffreys Bay Wind Farm',
            'project' => ['sector' => 'Renewable Energy – Wind', 'location' => 'Jeffreys Bay, Eastern Cape', 'capacity' => '150 MW', 'capex' => 'ZAR 3.28 Billion'],
            'sharing' => SeedData::sharing(),
            'status' => 'awaiting_consent',
            'activity' => [],
        ]);
        foreach (SeedData::introParties() as $p) {
            IntroductionParty::updateOrCreate(['introduction_id' => $intro->id, 'name' => $p['name']], $p);
        }

        foreach (['dd' => 'HD-2025-05-07-001', 'vdr' => 'HD-2025-05-07-002', 'project-advisory' => 'HD-2025-05-07-003'] as $target => $ref) {
            Handoff::updateOrCreate(['engagement_id' => $e->id, 'target' => $target], [
                'reference' => $ref, 'status' => 'pending_approval', 'packets' => SeedData::handoffPackets($target), 'summary' => SeedData::handoffSummary($target),
            ]);
        }

        if (! LedgerEntry::query()->where('engagement_id', $e->id)->exists()) {
            foreach ([
                ['INV-2025-05-12-001', 'payment', 'Deposit Payment (50%)', 'AIIM-PAY-S1-001', 'Deposit', 51750, 'Paid', -8],
                ['INV-2025-05-09-001', 'fee', 'Market & Sector Deep Dive', 'AIIM-EXR-S8-290', 'Expert Fee', 12500, 'Billed', -11],
                ['INV-2025-05-09-002', 'fee', 'Platform Administration', 'AIIM-PLT-S8-020', 'Platform Fee', 1250, 'Billed', -11],
                ['INV-2025-05-09-003', 'fee', 'External Supplier Cost Allocation', 'AIIM-EXT-S8-410', 'External Cost', 6800, 'Billed', -11],
                ['ADJ-2025-05-08-001', 'adjustment', 'Scope Change Adjustment', 'AIIM-ADJ-S8-600', 'Adjustment', 2000, 'Approved', -12],
                ['INV-2025-05-06-001', 'fee', 'Verification - External Reports', 'AIIM-EXR-S7-201', 'Expert Fee', 8000, 'Billed', -13],
            ] as [$ref, $type, $desc, $code, $cat, $amount, $status, $days]) {
                LedgerEntry::create([
                    'reference' => $ref, 'engagement_id' => $e->id, 'user_id' => $u->id, 'type' => $type, 'description' => $desc,
                    'fee_code' => $code, 'category' => $cat, 'amount_zar' => $amount, 'vat_zar' => round($amount * 0.15, 2),
                    'status' => $status, 'document' => $ref, 'posted_at' => now()->addDays($days),
                ]);
            }
        }

        CaseFile::updateOrCreate(['reference' => 'CHG-2025-05-12-001'], [
            'engagement_id' => $e->id, 'user_id' => $u->id, 'type' => 'scope-change', 'status' => 'pending_approval',
            'payload' => SeedData::scopeChange(), 'amount_zar' => 22500,
        ]);
    }

    /** A custom intelligence engagement with a quotation waiting for acceptance. */
    private function quotedEngagement(User $u): void
    {
        $advisor = Advisor::query()->where('slug', 'sipho-maseko')->first();
        $quote = Pricing::engagement(EngagementFlow::quoteTemplate('custom-intelligence', 'renewable energy'));
        $quote += ['number' => 'TQ-20250510-002', 'issued' => now()->subDay()->toDateString(), 'valid_until' => now()->addDays(13)->toDateString(), 'duration' => '3–4 weeks', 'engagement_type' => 'Custom Intelligence'];

        $e = Engagement::updateOrCreate(['reference' => 'ENG-20250510-002'], [
            'user_id' => $u->id,
            'advisor_id' => $advisor?->id,
            'type' => 'custom-intelligence',
            'title' => 'Renewable energy opportunities in the Eastern Cape',
            'status' => 'quoted',
            'stage' => 'Quotation',
            'step' => 5,
            'request' => SeedData::customRequest(),
            'booking_reference' => 'DSC-20250510-002',
            'discovery_at' => now()->subDays(2)->setTime(10, 0),
            'outcome' => SeedData::discoveryOutcome(),
            'quote' => $quote,
        ]);
        if (! $e->events()->exists()) {
            EngagementEvent::create(['engagement_id' => $e->id, 'actor' => 'client', 'action' => 'Submitted', 'to_status' => 'submitted', 'created_at' => now()->subDays(4)]);
            EngagementEvent::create(['engagement_id' => $e->id, 'actor' => 'staff', 'action' => 'Quotation Issued', 'from_status' => 'discovery_completed', 'to_status' => 'quoted', 'created_at' => now()->subDay()]);
        }
    }
}
