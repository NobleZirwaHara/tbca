<?php

namespace App\Support\DueDiligence;

use App\Models\DueDiligence\CaseFile;

/** Shapes a case for the client workspace and admin console. */
class CasePresenter
{
    public const ORDER = ['consent_pending', 'intake_open', 'ready_for_checks', 'checks_running', 'review_required', 'partner_review', 'report_draft', 'approved_for_release', 'delivered', 'disputed', 'monitoring', 'closed'];

    public static function rank(string $status): int
    {
        $i = array_search($status, self::ORDER, true);

        return $i === false ? 0 : $i;
    }

    public static function riskState(CaseFile $case): string
    {
        return match (true) {
            $case->status === 'closed' => 'RK5 Closed',
            $case->status === 'disputed' => 'RK3 Disputed',
            $case->status === 'monitoring' => 'RK4 Dynamic',
            $case->findings()->whereIn('status', ['open', 'client_responded', 'reviewing'])->exists() => 'RK1 Flagged',
            in_array($case->status, ['approved_for_release', 'delivered'], true) || $case->findings()->exists() => 'RK2 Assessed',
            default => 'RK0 None',
        };
    }

    public static function paymentState(CaseFile $case): string
    {
        return match (true) {
            $case->status === 'closed' => 'PY6 Finalised',
            $case->status === 'monitoring' => 'PY5 Recurring',
            $case->credits_zar > 0 => 'PY3 Refund State',
            default => 'PY3 Paid',
        };
    }

    public static function entitlement(CaseFile $case): string
    {
        return match ($case->status) {
            'delivered' => 'EN3 Report',
            'disputed' => 'EN3 Restricted',
            'monitoring' => 'EN4 Subscription',
            'closed' => 'EN6 Archive/Closed',
            default => 'EN2 Case-Active',
        };
    }

    public static function header(CaseFile $case): array
    {
        [$label, $code, $step, $stage, $review] = CaseStateMachine::STATES[$case->status];
        $consentsOk = Workflow::consentsComplete($case);

        return [
            'reference' => $case->reference,
            'caseName' => $case->case_name,
            'clientName' => $case->client_name,
            'subjectName' => $case->subject_name,
            'subjectType' => $case->subject_type,
            'family' => $case->family,
            'familyName' => Catalogue::family($case->family)['name'] ?? $case->family,
            'package' => $case->package_name,
            'skuCode' => $case->sku_code,
            'status' => $case->status,
            'statusLabel' => $label,
            'step' => $step,
            'stage' => $stage,
            'stageLabel' => Content::lifecycle()[$stage],
            'isSample' => $case->is_sample,
            'createdAt' => $case->created_at->toIso8601String(),
            'updatedAt' => $case->updated_at->toIso8601String(),
            'slaDueAt' => $case->sla_due_at?->toIso8601String(),
            'chips' => [
                ['label' => 'Lifecycle Stage', 'value' => (string) $stage],
                ['label' => 'Public Stage', 'value' => $step.' '.Content::journey()[$step - 1]['label']],
                ['label' => 'Case State', 'value' => $code.($case->status === 'consent_pending' ? ' · Consent Pending' : '')],
                ['label' => 'Consent', 'value' => $consentsOk ? 'Granted' : 'Pending'],
                ['label' => 'Payment State', 'value' => self::paymentState($case)],
                ['label' => 'Entitlement', 'value' => self::entitlement($case)],
                ['label' => 'Review State', 'value' => $review],
                ['label' => 'Risk State', 'value' => self::riskState($case)],
            ],
            'consentsComplete' => $consentsOk,
            'counts' => [
                'openFlags' => $case->findings()->whereIn('status', ['open'])->count(),
                'openRequests' => $case->requests()->where('status', 'open')->whereIn('type', ['information', 'partner', 'clarification'])->count(),
                'disputes' => $case->disputes()->count(),
                'hasFinal' => $case->reports()->where('status', 'final')->exists(),
                'subscription' => $case->subscriptions()->where('status', 'active')->exists(),
            ],
        ];
    }

    /** Required client actions, highest priority first (DD-031). */
    public static function nextActions(CaseFile $case): array
    {
        $r = $case->reference;
        $base = "/due-diligence/cases/{$r}";
        $actions = [];

        if (! Workflow::consentsComplete($case)) {
            $actions[] = ['title' => 'Complete the consent gate', 'body' => 'Mandatory consents are outstanding. Screening cannot begin.', 'priority' => 'High', 'href' => "{$base}/consent"];
        }
        if ($missing = Workflow::missingSubjectFields($case)) {
            $actions[] = ['title' => 'Complete subject details', 'body' => 'Provide '.strtolower(implode(', ', array_slice($missing, 0, 2))).(count($missing) > 2 ? ' and more' : '').'.', 'priority' => 'High', 'href' => "{$base}/subject"];
        }
        $outstanding = $case->evidence()->where('required', true)->whereNotIn('status', ['uploaded', 'approved', 'waived'])->count();
        if ($outstanding > 0 && CasePresenter::rank($case->status) <= 2) {
            $actions[] = ['title' => 'Upload missing evidence', 'body' => "{$outstanding} item(s) require your attention.", 'priority' => 'High', 'href' => "{$base}/evidence"];
        }
        if ($case->status === 'intake_open' && Workflow::intakeBlocker($case) === null) {
            $actions[] = ['title' => 'Submit intake for screening', 'body' => 'All required items are complete. Submit to move to checks.', 'priority' => 'High', 'href' => "{$base}/evidence"];
        }
        if ($case->findings()->where('status', 'open')->exists()) {
            $actions[] = ['title' => 'Respond to risk flag', 'body' => 'A potential risk signal is under review. Provide your input.', 'priority' => 'High', 'href' => "{$base}/risk"];
        }
        $open = $case->requests()->where('status', 'open')->whereIn('type', ['information', 'partner', 'clarification'])->count();
        if ($open > 0) {
            $actions[] = ['title' => 'Respond to information requests', 'body' => "{$open} open request(s) from your reviewer.", 'priority' => 'Medium', 'href' => "{$base}/review"];
        }
        if ($case->status === 'approved_for_release') {
            $actions[] = ['title' => 'Acknowledge report limitations', 'body' => 'Your report is approved. Acknowledge limitations to access it.', 'priority' => 'High', 'href' => "{$base}/report-ready"];
        }
        if ($case->status === 'delivered' && ! $case->subscriptions()->where('status', 'active')->exists()) {
            $actions[] = ['title' => 'Consider ongoing monitoring', 'body' => 'Track sanctions, media and status changes after the report.', 'priority' => 'Low', 'href' => "{$base}/monitoring-offer"];
        }
        $actions[] = ['title' => 'Review scope and exclusions', 'body' => 'Confirm the screening scope and fee lines.', 'priority' => 'Low', 'href' => "{$base}/overview"];

        return $actions;
    }

    /** Milestone timeline (DD-031 Case Progress). */
    public static function milestones(CaseFile $case): array
    {
        $events = $case->events()->get();
        $at = fn (string $status) => $events->firstWhere('to_status', $status)?->created_at?->toIso8601String();
        $rank = self::rank($case->status);
        $row = fn (string $label, bool $done, bool $current, ?string $date) => ['label' => $label, 'state' => $done ? 'done' : ($current ? 'current' : 'pending'), 'date' => $date];
        $consentAt = $case->consents()->where('requirement', 'required')->max('received_at');

        return [
            $row('Order Activated', true, false, $case->created_at->toIso8601String()),
            $row('Payment Confirmed', true, false, $case->order?->paid_at?->toIso8601String() ?? $case->created_at->toIso8601String()),
            $row('Consent Complete', $rank >= 1, $rank === 0, $rank >= 1 && $consentAt ? \Illuminate\Support\Carbon::parse($consentAt)->toIso8601String() : null),
            $row('Intake & Evidence', $rank >= 2, $rank === 1, $at('ready_for_checks')),
            $row('Checks & Screening', $rank >= 4, in_array($rank, [2, 3], true), $at('checks_running')),
            $row('Human Review', $rank >= 6, in_array($rank, [4, 5], true), $at('review_required')),
            $row('Report QA & Release', $rank >= 7, $rank === 6, $at('approved_for_release')),
            $row('Report Delivered', $rank >= 8, $rank === 7, $at('delivered')),
        ];
    }

    public static function events(CaseFile $case, int $limit = 6, ?array $types = null): array
    {
        return $case->events()
            ->when($types, fn ($q) => $q->where(fn ($w) => collect($types)->each(fn ($t) => $w->orWhere('type', 'like', $t.'%'))))
            ->latest('id')->limit($limit)->get()
            ->map(fn ($e) => [
                'code' => $e->code, 'type' => $e->type, 'actor' => $e->actor, 'role' => $e->actor_role,
                'description' => $e->description, 'at' => $e->created_at->toIso8601String(),
            ])->all();
    }

    public static function commercial(CaseFile $case): array
    {
        $lines = collect($case->fee_lines ?? []);
        $sum = fn (string $cat) => (int) $lines->where('category', $cat)->sum('price');

        return [
            'expert' => $sum('expert'),
            'platform' => $sum('platform'),
            'external' => $sum('external'),
            'subtotal' => $case->fees_ex_vat_zar,
            'vat' => $case->vat_zar,
            'total' => $case->total_paid_zar,
            'credits' => $case->credits_zar,
            'lines' => $lines->values()->all(),
            'orderReference' => $case->order?->reference,
        ];
    }

    /** Lifecycle 0-14 detail (DD-032). */
    public static function lifecycle(CaseFile $case): array
    {
        $events = $case->events()->get();
        $current = $case->stage;
        $ownerFor = fn (int $s) => match (true) {
            $s === 0 => 'System', in_array($s, [1, 2], true) => 'You', in_array($s, [11, 14], true) => 'You', default => 'TBCA',
        };
        $statusForStage = [1 => 'consent_pending', 2 => 'intake_open', 3 => 'ready_for_checks', 5 => 'checks_running', 9 => 'review_required', 10 => 'report_draft', 11 => 'delivered', 12 => 'disputed', 13 => 'monitoring', 14 => 'closed'];

        return collect(Content::lifecycle())->map(function ($name, $s) use ($current, $events, $ownerFor, $statusForStage, $case) {
            $started = $s === 0 ? $case->created_at : ($events->firstWhere('to_status', $statusForStage[$s] ?? '__')?->created_at);
            $state = $s < $current ? 'completed' : ($s === $current ? 'in_progress' : (in_array($s, [12], true) ? 'locked' : 'not_started'));
            if (in_array($s, [12, 13], true) && $s < $current && ! $started) {
                $state = 'skipped';
            }

            return ['stage' => $s, 'name' => $name, 'state' => $state, 'started' => $started?->toIso8601String(), 'owner' => $ownerFor($s)];
        })->values()->all();
    }
}
