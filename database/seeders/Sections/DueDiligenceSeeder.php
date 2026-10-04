<?php

namespace Database\Seeders\Sections;

use App\Models\DueDiligence\Batch;
use App\Models\DueDiligence\CaseFile;
use App\Models\DueDiligence\EnterpriseRequest;
use App\Models\DueDiligence\Quote;
use App\Models\Order;
use App\Models\User;
use App\Support\DueDiligence\Catalogue;
use App\Support\DueDiligence\CaseStateMachine;
use App\Support\DueDiligence\Pricing;
use App\Support\DueDiligence\Workflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo Due Diligence data from the mock-up pack: the illustrative sample case
 * "Amari Infrastructure Holdings (fictional) checking Kanyisa Power Systems
 * (fictional)" in several lifecycle states, an open quote, an enterprise
 * request and bulk screening batches. Idempotent: sample cases are rebuilt.
 */
class DueDiligenceSeeder extends Seeder
{
    private User $client;

    public function run(): void
    {
        $this->client = User::where('email', 'amahle@agritechsa.co.za')->first()
            ?? User::updateOrCreate(['email' => 'amahle@agritechsa.co.za'], ['name' => 'Amahle Dlamini', 'password' => Hash::make('Password123!'), 'company' => 'AgriTech SA', 'role' => 'client']);

        $subject = [
            'registered_name' => 'Kanyisa Power Systems (Pty) Ltd', 'trading_name' => 'Kanyisa Power Systems', 'registration_number' => '2018/345678/07',
            'entity_type' => 'Private company', 'incorporation_date' => '2018-03-15', 'country' => 'South Africa', 'industry' => 'Utilities & Energy',
            'nature_of_business' => 'Renewable energy solutions and power systems', 'head_office' => '14 Rivonia Road, Sandton, Johannesburg',
            'group' => 'Amari Infrastructure Holdings (Pty) Ltd', 'ownership' => '100% owned', 'employees' => 45, 'turnover' => '60 – 100 million',
            'website' => 'www.kanyisa.co.za', 'email' => 'info@kanyisa.co.za', 'phone' => '+27 11 555 6789', 'authority_confirmed' => true,
            'directors' => [
                ['name' => 'Thabo Nkosi', 'role' => 'Managing Director', 'ownership' => 0],
                ['name' => 'Lerato Mokoena', 'role' => 'Financial Director', 'ownership' => 0],
                ['name' => 'Amari Infrastructure Holdings', 'role' => 'Shareholder (UBO chain)', 'ownership' => 100],
            ],
        ];

        // 1. Main sample case: delivered, disputed and corrected, now monitored (DD-042 to DD-051).
        $main = $this->makeCase('DD-SA-2026-00047', 'Q-DD-2026-00047', 'DD-COMP-EDD', $subject, 'Investment decision', 20);
        $this->completeIntake($main);
        $this->runChecks($main, true);
        $main->update(['reviewer_name' => 'Thandiwe Dlamini', 'reviewer_role' => 'DD Analyst', 'review_started_at' => now()->subDays(15), 'review_due_at' => now()->subDays(13), 'review_decision' => 'Adverse media item relates to a similarly named entity; no adverse finding against the subject.', 'risk_rating' => 'low',
            'partner' => ['name' => 'Mbatha Legal Partners (fictional)', 'type' => 'Legal & Regulatory', 'scope' => 'Company registration and legal status, litigation, regulatory actions and compliance obligations', 'lead' => 'Adv. Sipho Mbatha', 'contact' => 'sipho.mbatha@example.org', 'location' => 'Johannesburg, South Africa'], 'partner_review' => true]);
        $main->findings()->create(['reference' => 'LEX-OSM-2026-0507-3321', 'report_ref' => 'RR-07', 'check_category' => 'Director & UBO Checks', 'flag_type' => 'Adverse Media Mentions', 'source' => 'Open Source Media Screening', 'severity' => 'medium', 'status' => 'cleared', 'summary' => 'A potential adverse media mention was identified that may be relevant to the subject.', 'response_type' => 'explanation', 'client_response' => 'The adverse media item relates to a company with a similar name in a different country. Our company has no connection to the matter.', 'disposition' => 'Corrected after dispute DISP-2026-00047-001', 'detected_at' => now()->subDays(16)]);
        $this->state($main, 'approved_for_release', 'Report approved for release');
        $this->qaTasks($main, 100);
        $sections = Workflow::composeSections($main->fresh());
        $main->reports()->create(['version' => 'Final v1.0', 'status' => 'superseded', 'sections' => $sections, 'deliverables' => Workflow::deliverables(), 'hash' => hash('sha256', 'v1.0'.$main->reference), 'approved_by' => 'Thandiwe Dlamini', 'approved_at' => now()->subDays(12)]);
        $corrected = array_merge($sections, [['key' => 'correction', 'title' => 'Correction Notice', 'body' => ['DISP-2026-00047-001: Source data mismatch due to incorrect entity identifier used during screening.', 'Outcome: Corrected. TBCA error corrections are made at no charge.']]]);
        $main->reports()->create(['version' => 'Final v1.1 (Corrected)', 'status' => 'final', 'sections' => $corrected, 'deliverables' => Workflow::deliverables(), 'hash' => hash('sha256', 'v1.1'.$main->reference), 'approved_by' => 'Sipho Mbatha', 'approved_at' => now()->subDays(10),
            'access_log' => [['at' => now()->subDays(12)->toIso8601String(), 'action' => 'Viewed online', 'by' => $this->client->name, 'device' => 'Chrome / Windows', 'ip' => '102.176.**.**'], ['at' => now()->subDays(12)->toIso8601String(), 'action' => 'Downloaded report', 'by' => $this->client->name, 'device' => 'Chrome / Windows', 'ip' => '102.176.**.**']]]);
        $main->update(['limitations_acknowledged_at' => now()->subDays(12), 'credits_zar' => 288]);
        $this->state($main, 'delivered', 'Report released to client portal');
        $main->disputes()->create(['reference' => 'DISP-2026-00047-001', 'report_section' => 'Risk Register', 'finding' => 'High risk indicator: Adverse media association', 'finding_ref' => 'RR-07', 'page' => '12',
            'description' => 'The adverse media item relates to a company with a similar name in a different country. Our company has no connection to the matter.', 'remedy' => 'correct', 'status' => 'decided', 'outcome' => 'corrected',
            'reason' => 'Source data mismatch due to incorrect entity identifier used during screening.', 'actions' => ['Incorrect record removed', 'Correct entity data applied', 'Risk assessment recalculated', 'Report updated and re-issued'],
            'reviewer' => 'Thandiwe Dlamini (Senior Reviewer)', 'approved_by' => 'Sipho Mbatha (Report Approver)', 'refund_zar' => 288, 'new_version' => 'Final v1.1 (Corrected)', 'decided_at' => now()->subDays(10)]);
        CaseStateMachine::record($main, 'dd.dispute_opened', $this->client->name, 'client', 'Dispute DISP-2026-00047-001 opened on Risk Register');
        CaseStateMachine::record($main, 'dd.dispute_decided', 'Sipho Mbatha', 'staff', 'Dispute DISP-2026-00047-001: corrected, refund R288');
        $sub = $main->subscriptions()->create(['reference' => 'SUB-SA-2026-00047', 'user_id' => $this->client->id, 'plan_code' => 'DD-MON-S13-851', 'plan_name' => 'Business (Annual)', 'billing_cycle' => 'Annual', 'recurring_zar' => 5500, 'status' => 'active', 'subjects' => 24, 'alert_allowance' => 100, 'included_reviews' => 2, 'included_rechecks' => 1, 'started_at' => now()->subDays(9), 'next_renewal_at' => now()->addYear()->subDays(9)]);
        foreach ([
            ['AL-2026-0152', 'Adverse media mention', 'News Feed', 'high', 'under_review', 'Independent Reviewer', 1],
            ['AL-2026-0151', 'Register update', 'Company Register', 'medium', 'reviewed', 'Sipho Mbatha', 2],
            ['AL-2026-0150', 'Litigation record', 'Court Records', 'high', 'pending_review', null, 5],
            ['AL-2026-0149', 'Sanctions watch', 'Global Sanctions', 'critical', 'reviewed', 'Thandiwe Dlamini', 7],
            ['AL-2026-0148', 'Director change', 'Company Register', 'low', 'reviewed', 'Thandiwe Dlamini', 9],
            ['AL-2026-0147', 'Tax compliance change', 'SARS', 'medium', 'reviewed', 'Thandiwe Dlamini', 11],
            ['AL-2026-0146', 'Adverse media mention', 'News Feed', 'medium', 'reviewed', 'Sipho Mbatha', 14],
        ] as [$ref, $type, $source, $level, $status, $reviewer, $days]) {
            $sub->alerts()->create(['reference' => $ref, 'subject' => 'Kanyisa Power Systems (Pty) Ltd', 'alert_type' => $type, 'source' => $source, 'risk_level' => $level, 'status' => $status, 'reviewer' => $reviewer, 'detected_at' => now()->subDays($days), 'reviewed_at' => $status === 'reviewed' ? now()->subDays($days - 1) : null]);
        }
        $this->state($main, 'monitoring', 'Monitoring plan Business (Annual) activated');

        // 2. Intake in progress (DD-031 to DD-036).
        $intake = $this->makeCase('DD-SA-2026-00031', 'Q-DD-2026-00031', 'DD-COMP-EDD', array_merge($subject, ['head_office' => null, 'authority_confirmed' => null, 'directors' => array_slice($subject['directors'], 0, 2)]), 'Supplier onboarding', 3);
        $intake->consents()->where('type', 'subject')->update(['status' => 'received', 'given_by' => 'Company Secretary', 'method' => 'Secure consent link', 'received_at' => now()->subDay(), 'valid_until' => now()->addYear()]);
        $intake->consents()->where('type', 'report_delivery')->update(['status' => 'received', 'given_by' => $this->client->name, 'method' => 'Client acknowledgement (portal)', 'received_at' => now()->subDay(), 'valid_until' => now()->addYear()]);
        $intake->consents()->where('type', 'authorised_request')->update(['status' => 'received', 'given_by' => 'Authorised Director', 'method' => 'Secure consent link', 'received_at' => now()->subHours(20), 'valid_until' => now()->addYear()]);
        $intake->consentRequests()->create(['token' => 'demo-consent-00031-company-secretary-link-0001', 'recipient_name' => 'Zanele Khumalo', 'recipient_role' => 'Company Secretary', 'recipient_email' => 'cosec@kanyisa.example', 'channel' => 'Email', 'status' => 'completed', 'expires_at' => now()->addDays(13), 'completed_at' => now()->subDay()]);
        $this->state($intake, 'intake_open', 'Consent gate complete: intake opened');
        foreach (['incorporation', 'moi', 'shareholder_register', 'financials'] as $key) {
            $this->fakeDoc($intake, $key);
        }

        // 3. Risk flag under human review (DD-038 / DD-039).
        $review = $this->makeCase('DD-SA-2026-00052', 'Q-DD-2026-00052', 'DD-DIR-UBO', array_merge($subject, ['registered_name' => 'Kanyisa Energy Solutions (Pty) Ltd']), 'Investment decision', 8);
        $this->completeIntake($review);
        $this->runChecks($review, false);
        $review->update(['reviewer_name' => 'Thandiwe Dlamini', 'reviewer_role' => 'DD Analyst']);
        $review->findings()->create(['reference' => 'LEX-OSM-2026-0507-3322', 'report_ref' => 'RR-03', 'check_category' => 'Director & UBO Checks', 'flag_type' => 'Adverse Media Mentions', 'source' => 'Open Source Media Screening', 'severity' => 'medium', 'status' => 'open', 'summary' => 'A potential adverse media mention was identified that may be relevant to the subject. This is not a determination of wrongdoing.', 'detected_at' => now()->subDay()]);
        $this->state($review, 'review_required', 'Risk flag raised: release locked pending human review (G7)');
        $review->requests()->create(['reference' => 'IR-0001', 'type' => 'information', 'title' => 'Updated shareholder register', 'detail' => 'Include all direct and indirect shareholders', 'reason' => 'To verify ownership structure', 'requested_by' => 'Thandiwe Dlamini', 'due_at' => now()->addDay(), 'status' => 'open']);

        // 4. Qualified partner review (DD-040).
        $partner = $this->makeCase('DD-SA-2026-00058', 'Q-DD-2026-00058', 'DD-COMP-EXE', array_merge($subject, ['registered_name' => 'KPS Holdings (Pty) Ltd']), 'M&A transaction', 6);
        $this->completeIntake($partner);
        $this->runChecks($partner, true);
        $partner->findings()->create(['reference' => 'CRT-2026-0507-0091', 'report_ref' => 'RR-02', 'check_category' => 'Litigation & Judgments', 'flag_type' => 'Litigation record', 'source' => 'Court records', 'severity' => 'high', 'status' => 'reviewing', 'summary' => 'Possible pending litigation reference requires legal confirmation.', 'detected_at' => now()->subDays(2)]);
        $partner->update(['reviewer_name' => 'Thandiwe Dlamini', 'reviewer_role' => 'DD Analyst', 'review_decision' => 'Refer litigation item to qualified legal partner.', 'partner' => ['name' => 'Mbatha Legal Partners (fictional)', 'type' => 'Legal & Regulatory', 'scope' => 'Company registration and legal status, litigation, regulatory actions and compliance obligations', 'lead' => 'Adv. Sipho Mbatha', 'contact' => 'sipho.mbatha@example.org', 'location' => 'Johannesburg, South Africa']]);
        $this->state($partner, 'review_required', 'Risk flag raised');
        $this->state($partner, 'partner_review', 'Referred to qualified partner Mbatha Legal Partners (RL4)');
        foreach ([[60, 'in_progress'], [40, 'in_progress'], [30, 'in_progress'], [0, 'pending']] as $i => [$p, $s]) {
            $partner->tasks()->where('kind', 'partner')->orderBy('sort')->skip($i)->first()?->update(['progress' => $p, 'status' => $s]);
        }
        $partner->requests()->create(['reference' => 'PR-0001', 'type' => 'partner', 'title' => 'Please provide the latest shareholder register (certified)', 'requested_by' => 'Adv. Sipho Mbatha', 'due_at' => now()->addDay(), 'status' => 'open']);

        // 5. Draft report in QA (DD-041).
        $qa = $this->makeCase('DD-SA-2026-00063', 'Q-DD-2026-00063', 'DD-SUP-ENH', array_merge($subject, ['registered_name' => 'KPS Trading (Pty) Ltd']), 'Procurement / tender', 4);
        $this->completeIntake($qa);
        $this->runChecks($qa, true);
        $qa->update(['reviewer_name' => 'Thandiwe Dlamini', 'reviewer_role' => 'DD Analyst', 'review_decision' => 'No material findings.', 'risk_rating' => 'low']);
        $this->state($qa, 'review_required', 'Mandatory human review (enhanced package)');
        $this->state($qa, 'report_draft', 'Draft report assembled for QA');
        $this->qaTasks($qa, null);
        $qa->requests()->create(['reference' => 'CL-0001', 'type' => 'clarification', 'title' => 'Clarify ownership structure for KPS Trading', 'requested_by' => 'QA Desk', 'due_at' => now()->addDays(2), 'status' => 'open']);
        $qa->requests()->create(['reference' => 'CL-0002', 'type' => 'clarification', 'title' => 'Confirm outstanding litigation reference', 'requested_by' => 'QA Desk', 'due_at' => now()->addDays(3), 'status' => 'open']);

        // Open quote at the manifest step.
        $sku = Catalogue::sku('DD-IND-EDD');
        $req = ['subject_type' => 'individual', 'jurisdiction' => 'South Africa', 'purpose' => 'Employment or appointment', 'expected_use' => 'Board or committee approval', 'entity_type' => 'Natural person', 'record_age' => 10, 'complexity' => 'standard', 'evidence_readiness' => 'high', 'sla' => 'standard', 'related_parties' => 2];
        Quote::updateOrCreate(['reference' => 'Q-DD-2026-00071'], [
            'user_id' => $this->client->id, 'family' => 'individual', 'sku_code' => 'DD-IND-EDD', 'status' => 'scoped', 'step' => 6, 'requirements' => $req,
            'inputs' => $req + ['subject_name' => 'Sipho Ndlovu', 'accurate' => true, 'permitted_purpose' => true, 'privacy_notice' => true],
            'addons' => ['DD-ADD-MEDIA'], 'payer_name' => 'AgriTech SA', 'manifest' => null,
        ]);

        // Enterprise request and batches (DD-023 / DD-049).
        $fee = \App\Http\Controllers\DueDiligence\EnterpriseController::feeView(['volume' => 250, 'modules' => ['company', 'sanctions', 'media', 'ubo', 'financial', 'compliance', 'monitoring'], 'extra_jurisdictions' => 2]);
        EnterpriseRequest::updateOrCreate(['reference' => 'ENT-DD-2026-00012'], [
            'user_id' => $this->client->id, 'status' => 'scoping', 'submitted_at' => now()->subDays(3), 'fee_view' => $fee,
            'data' => ['name' => 'Amari Holdings – Kanyisa Power Systems Screening', 'purpose' => 'Supplier & Contractor Due Diligence', 'client_type' => 'Enterprise (Large / Group)', 'population' => ['suppliers', 'companies', 'directors', 'mixed'], 'volume' => 250, 'batch_size' => 'Up to 500 records', 'jurisdictions' => 'South Africa (Primary), Botswana, Namibia', 'extra_jurisdictions' => 2, 'turnaround' => 'Standard (7–10 business days)', 'frequency' => 'recurring', 'cadence' => 'Monthly', 'modules' => ['company', 'sanctions', 'media', 'ubo', 'financial', 'compliance', 'monitoring'], 'delivery' => ['portal', 'upload', 'alerts'], 'notes' => 'Group-wide supplier refresh.', 'files' => []],
        ]);
        foreach ([['B-2026-0514', 'KPS_Batch_0514.csv', 'processing', 65, 480, 472, 5], ['B-2026-0513', 'KPS_Batch_0513.csv', 'queued', 20, 300, 298, 0], ['B-2026-0512', 'KPS_Batch_0512.csv', 'completed', 100, 420, 418, 2]] as [$ref, $file, $status, $progress, $rows, $valid, $dupes]) {
            Batch::updateOrCreate(['reference' => $ref], ['user_id' => $this->client->id, 'file_name' => $file, 'path' => null, 'rows' => $rows, 'valid_rows' => $valid, 'duplicates' => $dupes, 'exceptions' => $dupes ? ["{$dupes} duplicate subject(s) merged"] : [], 'status' => $status, 'progress' => $progress]);
        }
    }

    private function makeCase(string $reference, string $quoteRef, string $skuCode, array $subject, string $purpose, int $daysAgo): CaseFile
    {
        CaseFile::where('reference', $reference)->first()?->delete();

        $sku = Catalogue::sku($skuCode);
        $req = ['subject_type' => 'company', 'jurisdiction' => 'South Africa', 'purpose' => $purpose, 'expected_use' => 'Internal decision making', 'entity_type' => 'Private company', 'record_age' => 8, 'complexity' => 'standard', 'evidence_readiness' => 'medium', 'sla' => 'standard', 'related_parties' => 6];
        $manifest = Pricing::quote($sku, $req, []);

        $order = Order::updateOrCreate(['reference' => 'TBCA-ORD-2026-'.str_replace('Q-DD-2026-', 'DD', $quoteRef)], [
            'user_id' => $this->client->id, 'section' => 'due-diligence', 'status' => 'paid', 'subtotal_zar' => $manifest['subtotal'], 'vat_zar' => $manifest['vat'],
            'fees_zar' => $manifest['handling'], 'total_zar' => $manifest['total'], 'paid_at' => now()->subDays($daysAgo),
            'billing' => ['name' => $this->client->name, 'email' => $this->client->email, 'company' => 'Amari Infrastructure Holdings (Pty) Ltd'],
            'meta' => ['title' => 'Due Diligence: '.$sku['name'], 'quote' => $quoteRef],
        ]);

        $quote = Quote::updateOrCreate(['reference' => $quoteRef], [
            'user_id' => $this->client->id, 'family' => $sku['family'], 'sku_code' => $skuCode, 'status' => 'payment_pending', 'step' => 9, 'requirements' => $req,
            'inputs' => $req + ['subject_name' => $subject['registered_name'], 'registration_number' => $subject['registration_number'], 'entity_type' => 'Private company', 'industry' => $subject['industry'], 'ubo_count' => 3],
            'addons' => [], 'manifest' => $manifest, 'price_version' => 'PV-2026-05-07-01', 'scope_hash' => 'A5F7-9D2B-1C8E', 'payer_name' => 'Amari Infrastructure Holdings (Pty) Ltd',
            'accepted_by' => 'Authorised Signatory', 'accepted_at' => now()->subDays($daysAgo + 1), 'valid_until' => now()->addDays(29 - $daysAgo),
            'consent' => ['purpose' => $purpose, 'authority_basis' => 'Board mandate', 'notice_version' => 'PN-DD-2026-05', 'by' => $this->client->name],
            'consented_at' => now()->subDays($daysAgo + 1), 'engaged_at' => now()->subDays($daysAgo + 1), 'order_id' => $order->id,
        ]);

        $case = Workflow::activateQuote($quote);
        $case->update(['reference' => $reference, 'subject' => $subject, 'subject_name' => $subject['registered_name'], 'case_name' => 'Amari Infrastructure Holdings (Pty) Ltd (fictional) checking '.str_replace('(Pty) Ltd', '(Pty) Ltd (fictional)', $subject['registered_name']), 'is_sample' => true, 'created_at' => now()->subDays($daysAgo)]);

        return $case->fresh();
    }

    private function completeIntake(CaseFile $case): void
    {
        $case->consents()->where('requirement', 'required')->update(['status' => 'received', 'received_at' => $case->created_at, 'valid_until' => now()->addYear(), 'given_by' => 'Demo signatory', 'method' => 'Secure consent link']);
        $this->state($case, 'intake_open', 'Consent gate complete: intake opened');
        foreach ($case->evidence()->where('required', true)->get() as $item) {
            for ($i = 0; $i < $item->expected; $i++) {
                $this->fakeDoc($case, $item->key);
            }
        }
        $this->state($case, 'ready_for_checks', 'Intake submitted: evidence baseline frozen');
    }

    private function runChecks(CaseFile $case, bool $complete): void
    {
        $this->state($case, 'checks_running', 'Vendor run plan authorised');
        foreach ($case->checks()->get() as $i => $check) {
            $done = $complete ? $check->total : [$check->total, $check->total, (int) ceil($check->total * 0.7), 0, (int) ceil($check->total * 0.4), 0, 0][$i] ?? 0;
            $status = $complete ? 'complete' : (['complete', 'complete', 'in_progress', 'pending', 'in_progress', 'on_hold', 'not_started'][$i] ?? 'pending');
            $check->update(['status' => $status, 'done' => $done, 'hold_reason' => $status === 'on_hold' ? 'Additional subject details required' : null, 'external_used_zar' => $status === 'complete' ? (int) round($check->external_approved_zar * 0.65) : 0]);
            CaseStateMachine::record($case, 'dd.check_'.$status, 'TBCA Operations', 'staff', "{$check->category}: ".str_replace('_', ' ', $status));
        }
    }

    private function qaTasks(CaseFile $case, ?int $all): void
    {
        $progress = [100, 60, 45, 0, 0];
        foreach ($case->tasks()->where('kind', 'qa')->orderBy('sort')->get() as $i => $task) {
            $p = $all ?? $progress[$i];
            $task->update(['progress' => $p, 'status' => $p >= 100 ? 'completed' : ($p > 0 ? 'in_progress' : 'pending')]);
        }
    }

    /** Applies a seeded status directly (bypassing guards) and records it on the timeline. */
    private function state(CaseFile $case, string $to, string $note): void
    {
        $from = $case->status;
        [, , , $stage, $review] = CaseStateMachine::STATES[$to];
        $case->update(['status' => $to, 'stage' => $stage, 'review_state' => $review]);
        CaseStateMachine::record($case, 'dd.status_'.$to, 'System', 'system', $note, $from, $to);
        Workflow::afterTransition($case->fresh(), $from, $to);
        $case->refresh();
    }

    private function fakeDoc(CaseFile $case, string $key): void
    {
        $item = $case->evidence()->where('key', $key)->first();
        \Illuminate\Support\Facades\Storage::disk(Workflow::DISK)->put("dd/seed/{$case->reference}/{$key}.pdf", "%PDF-1.4
% TBCA illustrative sample document (synthetic data)
");
        $case->documents()->create([
            'evidence_item_id' => $item?->id, 'category' => 'evidence', 'original_name' => str_replace(' ', '_', $item?->label ?? $key).'.pdf',
            'path' => "dd/seed/{$case->reference}/{$key}.pdf", 'mime' => 'application/pdf', 'size' => 245000, 'status' => 'received', 'uploaded_by' => $this->client->name,
        ]);
        if ($item) {
            Workflow::refreshEvidence($item->fresh());
        }
    }
}
