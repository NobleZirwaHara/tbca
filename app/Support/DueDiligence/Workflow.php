<?php

namespace App\Support\DueDiligence;

use App\Models\DueDiligence\CaseFile;
use App\Models\DueDiligence\Document;
use App\Models\DueDiligence\EvidenceItem;
use App\Models\DueDiligence\MonitoringSubscription;
use App\Models\DueDiligence\Quote;
use App\Models\DueDiligence\Report;
use App\Models\Order;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Case engine: activation after verified payment, consent and evidence
 * gates, transition side effects, report assembly and document storage.
 */
class Workflow
{
    public const DISK = 'local';

    /* ------------------------------------------------------------------ */
    /* Activation (G5 -> EN2)                                              */
    /* ------------------------------------------------------------------ */

    /**
     * Opens the case for a paid quote. Idempotent: duplicate return visits or
     * repeated webhooks never create a second case.
     */
    public static function activateQuote(Quote $quote): ?CaseFile
    {
        $order = $quote->order;
        if ($order === null || ! $order->isPaid()) {
            return null;
        }

        return DB::transaction(function () use ($quote, $order) {
            $existing = CaseFile::where('quote_id', $quote->id)->lockForUpdate()->first();
            if ($existing) {
                return $existing;
            }

            $sku = Catalogue::sku($quote->sku_code);
            $family = Catalogue::family($quote->family);
            $req = $quote->requirements ?? [];
            $inputs = $quote->inputs ?? [];
            $manifest = $quote->manifest ?? Pricing::quote($sku, $req, $quote->addons ?? []);
            $subjectType = $inputs['subject_type'] ?? $req['subject_type'] ?? $family['subjectType'];
            $subjectName = $inputs['subject_name'] ?? 'Subject to be confirmed';
            $client = $quote->payer_name ?: ($quote->user->company ?: $quote->user->name);
            [, $maxDays] = $manifest['days'] ?? Pricing::days($sku['timeline']);

            $case = CaseFile::create([
                'reference' => Refs::next('DD-SA', 'dd_cases'),
                'user_id' => $quote->user_id,
                'quote_id' => $quote->id,
                'order_id' => $order->id,
                'family' => $quote->family,
                'sku_code' => $quote->sku_code,
                'package_name' => $sku['name'],
                'case_name' => "{$client} checking {$subjectName}",
                'client_name' => $client,
                'subject_name' => $subjectName,
                'subject_type' => $subjectType,
                'jurisdiction' => $inputs['jurisdiction'] ?? $req['jurisdiction'] ?? 'South Africa',
                'purpose' => $inputs['purpose'] ?? $req['purpose'] ?? null,
                'requirements' => $req,
                'subject' => [
                    'registered_name' => $subjectName,
                    'registration_number' => $inputs['registration_number'] ?? null,
                    'entity_type' => $inputs['entity_type'] ?? null,
                    'incorporation_date' => $inputs['incorporation_date'] ?? null,
                    'industry' => $inputs['industry'] ?? null,
                    'country' => $inputs['jurisdiction'] ?? 'South Africa',
                    'ownership_structure' => $inputs['ownership_structure'] ?? null,
                    'directors' => [],
                ],
                'status' => 'consent_pending',
                'stage' => 1,
                'review_mandatory' => $sku['reviewMandatory'],
                'coordinator_name' => 'Naledi Mkhize',
                'coordinator_email' => 'ddteam@thebusinessclinic.africa',
                'fees_ex_vat_zar' => $order->subtotal_zar,
                'vat_zar' => $order->vat_zar,
                'total_paid_zar' => $order->total_zar,
                'fee_lines' => $manifest['lines'],
                'sla_due_at' => now()->addWeekdays($maxDays),
            ]);

            self::seedConsents($case, $quote);
            self::seedEvidence($case);
            self::seedChecks($case, $sku['tier'], (int) round($manifest['external'] ?? 0));

            // Documents uploaded during scoping move into the case evidence register.
            foreach ($quote->documents()->get() as $doc) {
                $key = explode(':', (string) $doc->category)[1] ?? null;
                $item = $key ? $case->evidence()->where('key', $key)->first() : null;
                $doc->update(['case_id' => $case->id, 'evidence_item_id' => $item?->id, 'category' => 'evidence']);
                if ($item) {
                    self::refreshEvidence($item);
                }
            }

            $quote->update(['status' => 'converted']);

            CaseStateMachine::record($case, 'dd.payment_verified', 'System', 'system', "Payment verified ({$order->reference}) and case activated", null, 'consent_pending', ['order' => $order->reference]);
            CaseStateMachine::record($case, 'dd.case_assigned', 'System', 'system', 'Case assigned to coordinator Naledi Mkhize');
            CaseStateMachine::record($case, 'dd.evidence_requested', 'System', 'system', 'Evidence request and consent checklist issued to client');

            return $case;
        });
    }

    private static function seedConsents(CaseFile $case, Quote $quote): void
    {
        $by = $quote->user->name;
        $crossBorder = $case->jurisdiction !== 'South Africa';
        $rows = [
            ['subject', 'Subject Consent', $case->subject_type === 'project' ? 'not_required' : 'required', null],
            ['authorised_request', 'Authorised Company Request', in_array($case->subject_type, ['company', 'institution'], true) ? 'required' : 'not_required', null],
            ['lawful_purpose', 'Lawful Purpose Confirmation', 'required', $quote->consented_at ?? now()],
            ['cross_border', 'Cross Border Transfer Acknowledgement', $crossBorder ? 'required' : 'not_required', null],
            ['monitoring', 'Monitoring Consent (optional)', 'optional', null],
            ['report_delivery', 'Report Delivery Acknowledgement', 'required', null],
        ];

        foreach ($rows as [$type, $label, $requirement, $received]) {
            $case->consents()->create([
                'type' => $type,
                'label' => $label,
                'requirement' => $requirement,
                'status' => $received ? 'received' : match ($requirement) {
                    'not_required' => 'not_required', 'optional' => 'optional', default => 'pending',
                },
                'given_by' => $received ? $by : null,
                'method' => $received ? 'Consent, Privacy and Purpose Gate' : null,
                'received_at' => $received,
                'valid_until' => $received ? now()->addYear() : null,
            ]);
        }
    }

    private static function seedEvidence(CaseFile $case): void
    {
        foreach (Content::evidenceTemplate($case->subject_type) as $i => $row) {
            $case->evidence()->create([
                'key' => $row['key'], 'label' => $row['label'], 'description' => $row['description'], 'why' => $row['why'],
                'evidence_type' => $row['type'], 'required' => $row['required'] ?? true, 'priority' => $row['priority'],
                'expected' => $row['expected'], 'status' => 'pending', 'sort' => $i,
            ]);
        }
    }

    private static function seedChecks(CaseFile $case, string $tier, int $external): void
    {
        $rows = Content::checkTemplate($case->subject_type, $tier);
        $share = $rows ? (int) floor($external / count($rows)) : 0;
        foreach ($rows as $i => $row) {
            $case->checks()->create($row + ['status' => 'not_started', 'done' => 0, 'external_approved_zar' => $share, 'sort' => $i]);
        }
    }

    /** Activates a monitoring subscription once its order is paid. Idempotent. */
    public static function activateSubscription(MonitoringSubscription $sub): MonitoringSubscription
    {
        if ($sub->status === 'active' || ! $sub->order?->isPaid()) {
            return $sub;
        }

        $sub->update(['status' => 'active', 'started_at' => now(), 'next_renewal_at' => now()->addMonth()]);
        $case = $sub->caseFile;
        if ($case) {
            $case->consents()->where('type', 'monitoring')->update(['status' => 'received', 'received_at' => now(), 'given_by' => $sub->user->name, 'method' => 'Monitoring Offer']);
            CaseStateMachine::record($case, 'dd.monitoring_activated', 'System', 'system', "Monitoring plan {$sub->plan_name} activated ({$sub->reference})");
            if ($case->status === 'delivered') {
                CaseStateMachine::transition($case, 'monitoring', 'System', 'system');
            }
        }

        return $sub->fresh();
    }

    /** Opens cases for any paid DD orders whose client never returned from checkout. */
    public static function syncPaidOrders(?int $userId = null): void
    {
        Quote::query()
            ->whereNotNull('order_id')
            ->whereIn('status', ['payment_pending', 'payment_failed'])
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->whereHas('order', fn ($q) => $q->where('status', 'paid'))
            ->get()
            ->each(fn (Quote $q) => self::activateQuote($q));

        MonitoringSubscription::query()
            ->where('status', 'awaiting_payment')
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->whereHas('order', fn ($q) => $q->where('status', 'paid'))
            ->get()
            ->each(fn ($s) => self::activateSubscription($s));
    }

    /* ------------------------------------------------------------------ */
    /* Gates                                                               */
    /* ------------------------------------------------------------------ */

    public static function consentsComplete(CaseFile $case): bool
    {
        return ! $case->consents()
            ->where('requirement', 'required')
            ->where(fn ($q) => $q->where('status', '!=', 'received')->orWhere('valid_until', '<', now()))
            ->exists();
    }

    public static function consentPercent(CaseFile $case): int
    {
        $required = $case->consents()->where('requirement', 'required')->get();
        if ($required->isEmpty()) {
            return 100;
        }

        return (int) round(100 * $required->where('status', 'received')->count() / $required->count());
    }

    /** G6 completeness gate. */
    public static function intakeBlocker(CaseFile $case): ?string
    {
        if (! self::consentsComplete($case)) {
            return 'Mandatory consents are incomplete; screening cannot begin.';
        }
        $missing = self::missingSubjectFields($case);
        if ($missing) {
            return 'Complete the subject details first: '.implode(', ', $missing).'.';
        }
        $outstanding = $case->evidence()->where('required', true)->whereNotIn('status', ['uploaded', 'approved', 'waived'])->pluck('label');
        if ($outstanding->isNotEmpty()) {
            return 'Required evidence is outstanding: '.$outstanding->implode(', ').'. Upload it, propose an alternative or request a scope adjustment (G9).';
        }

        return null;
    }

    public static function missingSubjectFields(CaseFile $case): array
    {
        $s = $case->subject ?? [];
        $fields = $case->subject_type === 'individual'
            ? ['registered_name' => 'Full legal name', 'id_number' => 'ID / passport number', 'country' => 'Country', 'nationality' => 'Nationality']
            : ['registered_name' => 'Registered name', 'registration_number' => 'Registration number', 'entity_type' => 'Entity type', 'country' => 'Registered country', 'industry' => 'Industry sector', 'nature_of_business' => 'Nature of business'];

        return array_values(array_filter($fields, fn ($label, $key) => blank($s[$key] ?? null), ARRAY_FILTER_USE_BOTH));
    }

    public static function evidenceStats(CaseFile $case): array
    {
        $items = $case->evidence()->withCount('documents')->get();
        $required = $items->where('required', true);
        $complete = $required->whereIn('status', ['uploaded', 'approved', 'waived'])->count();

        return [
            'requiredItems' => $required->count(),
            'completeItems' => $complete,
            'pendingItems' => $required->count() - $complete,
            'issues' => $items->where('status', 'rejected')->count() + $items->where('status', 'alternative_proposed')->count(),
            'notProvided' => $required->where('documents_count', 0)->whereNotIn('status', ['waived'])->count(),
            'documents' => $items->sum('documents_count'),
            'expectedDocuments' => $required->sum('expected'),
            'percent' => $required->count() ? (int) round(100 * $complete / $required->count()) : 100,
        ];
    }

    public static function refreshEvidence(EvidenceItem $item): void
    {
        if (in_array($item->status, ['approved', 'waived', 'rejected'], true)) {
            return;
        }
        $count = $item->documents()->count();
        $item->update(['status' => $count === 0 ? ($item->status === 'alternative_proposed' ? 'alternative_proposed' : 'pending') : ($count < $item->expected && $item->required ? 'partial' : 'uploaded')]);
    }

    /* ------------------------------------------------------------------ */
    /* Transition side effects                                             */
    /* ------------------------------------------------------------------ */

    public static function afterTransition(CaseFile $case, string $from, string $to): void
    {
        match ($to) {
            'checks_running' => $case->checks()->where('status', 'not_started')->update(['status' => 'pending']),
            'partner_review' => self::seedPartnerTasks($case),
            'report_draft' => self::assembleDraft($case),
            'approved_for_release' => self::finaliseReport($case),
            default => null,
        };

        if ($to === 'consent_pending' && $from !== 'consent_pending') {
            CaseStateMachine::record($case, 'dd.processing_stopped', 'System', 'system', 'Consent withdrawn or expired: processing stopped until consent is restored');
        }
    }

    private static function seedPartnerTasks(CaseFile $case): void
    {
        if ($case->tasks()->where('kind', 'partner')->exists()) {
            return;
        }
        $rows = [
            ['Legal entity verification', 'Verify incorporation documents and legal status', 2],
            ['Director & UBO analysis', 'Review directors, UBOs and authority', 2],
            ['Litigation & regulatory search', 'Check litigation, regulatory and enforcement records', 3],
            ['Contract & compliance review', 'Review material contracts and compliance obligations', 4],
        ];
        foreach ($rows as $i => [$title, $desc, $days]) {
            $case->tasks()->create(['kind' => 'partner', 'title' => $title, 'description' => $desc, 'due_at' => now()->addWeekdays($days), 'sort' => $i]);
        }
        $case->update(['partner_review' => true]);
    }

    private static function assembleDraft(CaseFile $case): void
    {
        if (! $case->tasks()->where('kind', 'qa')->exists()) {
            $rows = [
                ['Factual consistency check', 'Verify facts against source evidence'],
                ['Evidence traceability check', 'Confirm all findings link to evidence'],
                ['Limitation wording review', 'Validate limitation statements'],
                ['Recommendation tone review', 'Ensure balanced, non-conclusive tone'],
                ['Formatting and appendix validation', 'Check layout, numbering and attachments'],
            ];
            foreach ($rows as $i => [$title, $desc]) {
                $case->tasks()->create(['kind' => 'qa', 'title' => $title, 'description' => $desc, 'due_at' => now()->addWeekdays($i < 2 ? 1 : 3), 'sort' => $i]);
            }
        }

        $drafts = $case->reports()->where('status', 'draft')->count();
        $case->reports()->where('status', 'draft')->update(['status' => 'superseded']);
        $case->reports()->create([
            'version' => 'Draft v1.'.$drafts,
            'status' => 'draft',
            'sections' => self::composeSections($case),
            'deliverables' => self::deliverables(),
        ]);
    }

    private static function finaliseReport(CaseFile $case): void
    {
        $draft = $case->reports()->where('status', 'draft')->latest('id')->first();
        if (! $draft) {
            return;
        }
        $finals = $case->reports()->where('status', 'final')->count();
        $case->reports()->where('status', 'final')->update(['status' => 'superseded']);
        $sections = self::composeSections($case);
        $draft->update([
            'status' => 'final',
            'version' => 'Final v1.'.$finals,
            'sections' => $sections,
            'hash' => hash('sha256', json_encode($sections).$case->reference),
            'approved_by' => $case->reviewer_name ?? 'Senior Reviewer',
            'approved_at' => now(),
        ]);
    }

    public static function deliverables(): array
    {
        return [
            ['name' => 'Executive Summary', 'description' => 'High-level findings and conclusions', 'pages' => 8],
            ['name' => 'Full Due Diligence Report', 'description' => 'Complete report within agreed scope', 'pages' => 68],
            ['name' => 'Risk Register', 'description' => 'Consolidated risk items and ratings', 'pages' => 12],
            ['name' => 'Management Responses', 'description' => 'Subject management responses', 'pages' => 9],
            ['name' => 'Report Limitation Addendum', 'description' => 'Scope, limitations and exclusions', 'pages' => 6],
            ['name' => 'Release Certificate', 'description' => 'Approval and release confirmation', 'pages' => 2],
        ];
    }

    /** Builds the controlled report body from case records: only reviewed, dispositioned facts. */
    public static function composeSections(CaseFile $case): array
    {
        $findings = $case->findings()->get();
        $checks = $case->checks()->get();
        $rating = $case->risk_rating ?? ($findings->where('status', 'confirmed')->isNotEmpty() ? 'medium' : 'low');

        return [
            ['key' => 'cover', 'title' => 'Cover Page', 'body' => [
                "Full Due Diligence Report — {$case->package_name}",
                $case->case_name,
                "Case reference {$case->reference}",
            ]],
            ['key' => 'summary', 'title' => 'Executive Summary', 'body' => [
                "TBCA completed the {$case->package_name} for {$case->subject_name} ({$case->jurisdiction}) for the stated purpose: ".($case->purpose ?? 'decision support').'.',
                $checks->count().' check categories were run through approved sources; '.$findings->count().' risk signal(s) were identified and dispositioned by a human reviewer.',
                'Overall risk position: '.ucfirst($rating).'. This is a risk indicator to support your decision, not a legal conclusion.',
                $case->review_decision ? 'Reviewer note: '.$case->review_decision : 'No reviewer qualification was recorded.',
            ]],
            ['key' => 'scope', 'title' => 'Scope & Method', 'body' => $checks->map(fn ($c) => "{$c->category} — {$c->detail} ({$c->vendor})")->all()],
            ['key' => 'risk', 'title' => 'Risk Register', 'body' => $findings->isEmpty()
                ? ['No risk flags were raised in the screening scope.']
                : $findings->map(fn ($f) => sprintf('%s | %s | %s severity | %s%s', $f->report_ref ?? $f->reference, $f->flag_type, ucfirst($f->severity), ucfirst(str_replace('_', ' ', $f->status)), $f->disposition ? ' — '.$f->disposition : ''))->all()],
            ['key' => 'responses', 'title' => 'Management Responses', 'body' => $findings->whereNotNull('client_response')->isEmpty()
                ? ['No management responses were submitted.']
                : $findings->whereNotNull('client_response')->map(fn ($f) => ($f->report_ref ?? $f->reference).': '.$f->client_response)->values()->all()],
            ['key' => 'limitations', 'title' => 'Limitations', 'body' => Content::limitations()],
            ['key' => 'appendices', 'title' => 'Appendices', 'body' => ['Evidence log: '.$case->documents()->count().' document(s) on file.', 'Consent record: '.$case->consents()->where('status', 'received')->count().' consent(s) received.']],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Documents                                                           */
    /* ------------------------------------------------------------------ */

    public static function store(UploadedFile $file, string $folder, array $attributes): Document
    {
        $path = $file->store("dd/{$folder}", self::DISK);

        return Document::create($attributes + [
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 190),
            'path' => $path,
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'checksum' => hash_file('sha256', $file->getRealPath()),
        ]);
    }

    public static function deleteDocument(Document $doc): void
    {
        Storage::disk(self::DISK)->delete($doc->path);
        $item = $doc->evidence_item_id ? EvidenceItem::find($doc->evidence_item_id) : null;
        $doc->delete();
        if ($item) {
            self::refreshEvidence($item);
        }
    }

    /** Monitoring order payment helper. */
    public static function subscriptionForOrder(Order $order): ?MonitoringSubscription
    {
        return MonitoringSubscription::where('order_id', $order->id)->first();
    }

    public static function latestFinal(CaseFile $case): ?Report
    {
        return $case->reports()->where('status', 'final')->latest('id')->first();
    }
}
