<?php

namespace App\Support\DueDiligence\Identity;

use App\Models\DueDiligence\CaseFile;
use App\Models\DueDiligence\Check;
use App\Models\DueDiligence\IdentityVerification;
use App\Models\IntegrationEvent;
use App\Support\DueDiligence\CaseStateMachine;
use App\Support\Integrations\Ledger;
use Illuminate\Support\Str;
use Throwable;

/**
 * Runs identity verification for Due Diligence checks through the configured
 * provider (services.identity_verification.driver) and applies results to
 * the check, the case timeline and the integration ledger.
 *
 * A clear result completes the check automatically. A possible match,
 * suspected document or rejection puts the check on hold for an analyst and
 * makes expert review mandatory: the guide keeps those decisions human.
 */
class IdentityVerifications
{
    public function provider(): IdentityVerificationProvider
    {
        return match (config('services.identity_verification.driver', 'simulated')) {
            'vove' => app(VoveIdProvider::class),
            default => app(SimulatedProvider::class),
        };
    }

    /**
     * Start the verification for one check. Returns the verification and, for
     * journeys the subject completes, a one-time TBCA link to send them.
     *
     * @return array{verification: IdentityVerification, link: ?string}
     */
    public function startForCheck(Check $check, ?string $kind = null): array
    {
        $case = $check->caseFile;
        $kind ??= CheckMap::kindFor($check->category, $case->subject_type);
        if (! $kind) {
            throw new IdentityProviderException("No identity provider covers the check \"{$check->category}\".");
        }

        $provider = $this->provider();
        $refId = sprintf('TBCA-%s-%s-%d', strtoupper(str_replace('_', '-', $kind)), $case->reference, $check->id);

        $verification = IdentityVerification::firstOrCreate(['ref_id' => $refId], [
            'case_id' => $case->id,
            'check_id' => $check->id,
            'provider' => $provider->key(),
            'kind' => $kind,
            'subject_name' => $this->subjectName($case),
            'subject_type' => $case->subject_type === 'individual' ? 'individual' : 'entity',
            'status' => 'started',
        ]);

        if ($verification->isTerminal()) {
            return ['verification' => $verification, 'link' => null];
        }

        $started = $provider->start($verification, $this->subject($case));
        $verification->update(['provider_case_id' => $started['provider_case_id'] ?? $verification->provider_case_id]);
        $this->apply($verification, $started['provider_status'], $started['summary'] ?? []);

        $link = null;
        if ($verification->needsSubject() && ! $verification->isTerminal()) {
            $token = Str::random(48);
            $verification->update([
                'link_hash' => hash('sha256', $token),
                'link_expires_at' => now()->addHours((int) config('services.identity_verification.link_ttl_hours', 72)),
            ]);
            $link = url('/due-diligence/verify/'.$token);
        }

        CaseStateMachine::record($case, 'dd.identity_check_started', $provider->label(), 'system',
            "{$check->category}: {$this->kindLabel($kind)} started with {$provider->label()}.", meta: ['ref_id' => $refId]);

        return ['verification' => $verification->fresh(), 'link' => $link];
    }

    /** Start every mapped check that has not started yet (used when a case enters Checks Running). */
    public function startForCase(CaseFile $case): int
    {
        $started = 0;
        foreach ($case->checks()->whereIn('status', ['not_started', 'pending'])->get() as $check) {
            if (! CheckMap::kindFor($check->category, $case->subject_type)) {
                continue;
            }
            try {
                $this->startForCheck($check);
                $started++;
            } catch (Throwable $e) {
                report($e);
            }
        }

        return $started;
    }

    /** Resolve a subject link token to its open verification. */
    public function forLink(string $token): ?IdentityVerification
    {
        $verification = IdentityVerification::where('link_hash', hash('sha256', $token))->first();

        if (! $verification || $verification->isTerminal() || ($verification->link_expires_at && $verification->link_expires_at->isPast())) {
            return null;
        }

        return $verification;
    }

    /** Apply a verified webhook delivery (stored in the ledger) from the provider. */
    public function handleWebhookEvent(IntegrationEvent $event): void
    {
        $payload = $event->payload ?? [];
        $refId = (string) ($payload['refId'] ?? $payload['data']['refId'] ?? '');
        $verification = $refId !== '' ? IdentityVerification::where('ref_id', $refId)->first() : null;

        try {
            if ($verification) {
                $status = (string) ($payload['status'] ?? $payload['data']['status'] ?? 'unknown');
                $this->refresh($verification, $status);
            }

            $event->forceFill([
                'status' => 'complete',
                'attempts' => $event->attempts + 1,
                'handled_by' => 'automated',
                'last_error' => $verification ? null : 'No TBCA verification for this refId; ignored.',
                'completed_at' => now(),
            ])->save();
        } catch (Throwable $e) {
            $event->forceFill(['status' => 'failed', 'attempts' => $event->attempts + 1, 'last_error' => mb_substr($e->getMessage(), 0, 1000)])->save();
            if (! $e instanceof IdentityProviderException) {
                report($e);
            }
        }
    }

    /**
     * Webhook statuses that end a journey are confirmed with the provider's
     * current resource before they change the check, as VOVE's documentation
     * requires; progress statuses are applied as received.
     */
    public function refresh(IdentityVerification $verification, ?string $hint = null): void
    {
        $progress = ['open', 'in-progress', 'in_progress', 'pending', 'NOT_STARTED', 'IN_PROGRESS'];

        if ($hint !== null && in_array($hint, $progress, true)) {
            $this->apply($verification, $hint);

            return;
        }

        $current = $this->provider()->fetch($verification);
        $this->apply($verification, $current['provider_status'], $current['summary'] ?? []);
    }

    /** Map a provider status to the local status and update the check, case timeline and ledger. */
    public function apply(IdentityVerification $verification, string $providerStatus, array $summary = []): void
    {
        $status = self::localStatus($verification->kind, $providerStatus);

        // Never move a finished verification back to an in-progress state on a late or replayed event.
        if ($verification->isTerminal() && ! in_array($status, IdentityVerification::TERMINAL, true)) {
            return;
        }

        $changed = $verification->status !== $status;
        $verification->update([
            'status' => $status,
            'provider_status' => $providerStatus,
            'summary' => $summary ? [...($verification->summary ?? []), ...$summary] : $verification->summary,
            'completed_at' => in_array($status, IdentityVerification::TERMINAL, true) ? ($verification->completed_at ?? now()) : null,
        ]);

        if (! $changed || ! in_array($status, ['passed', 'review', 'failed'], true)) {
            if ($verification->check && in_array($status, ['awaiting_subject', 'in_progress'], true) && $verification->check->status !== 'complete') {
                $verification->check->update(['status' => 'in_progress']);
            }

            return;
        }

        $this->updateCheck($verification, $status);

        $case = $verification->caseFile;
        CaseStateMachine::record($case, 'dd.identity_check_result', $this->provider()->label(), 'system',
            ($verification->check?->category ?? $this->kindLabel($verification->kind)).': '.match ($status) {
                'passed' => 'clear result received.',
                'review' => 'possible match or document concern; analyst review required.',
                default => 'rejected by the provider; expert review required.',
            }, meta: ['ref_id' => $verification->ref_id, 'provider_status' => $providerStatus]);

        Ledger::recordInternal('dd.verification_result', 'dd_case', $case->reference, $status === 'passed' ? 'automated' : 'human',
            ['ref_id' => $verification->ref_id, 'kind' => $verification->kind, 'status' => $status, 'provider' => $verification->provider],
            $case->user_id, "dd.verification_result:{$verification->ref_id}:{$status}");
    }

    public static function localStatus(string $kind, string $providerStatus): string
    {
        return match ($providerStatus) {
            'open', 'NOT_STARTED' => 'awaiting_subject',
            'in-progress', 'in_progress', 'pending', 'IN_PROGRESS' => 'in_progress',
            'successful', 'COMPLETED', 'NO_MATCH', 'CLEARED' => 'passed',
            'REJECTED' => 'failed',
            // suspected (KYC), IN_REVIEW (KYB or AML) and any unknown value wait for a person; never coerce to success.
            default => 'review',
        };
    }

    private function updateCheck(IdentityVerification $verification, string $status): void
    {
        $check = $verification->check;
        if (! $check) {
            return;
        }

        if ($status === 'passed') {
            $open = IdentityVerification::where('check_id', $check->id)->where('status', '!=', 'passed')->exists();
            $check->update($open
                ? ['status' => 'in_progress', 'done' => min($check->total, $check->done + 1)]
                : ['status' => CheckMap::coverage($check->category) === 'full' ? 'complete' : 'in_progress', 'done' => CheckMap::coverage($check->category) === 'full' ? $check->total : min($check->total, $check->done + 1), 'hold_reason' => null]);

            return;
        }

        $check->update([
            'status' => 'on_hold',
            'hold_reason' => $status === 'review'
                ? 'Possible match or document concern from the identity provider: analyst decision needed.'
                : 'Identity provider rejected the verification: expert review required.',
        ]);
        $verification->caseFile->update(['review_mandatory' => true]);
    }

    /** Subject data for the provider: name, and identity fields only when the case already holds them. */
    private function subject(CaseFile $case): array
    {
        $s = $case->subject ?? [];
        $name = $this->subjectName($case);
        $parts = preg_split('/\s+/', trim($name));
        $last = count($parts) > 1 ? array_pop($parts) : null;

        $dob = $s['date_of_birth'] ?? $s['dob'] ?? null;
        if ($dob && preg_match('/^(\d{4})-(\d{2})-(\d{2})/', (string) $dob, $m)) {
            $dob = "{$m[3]}.{$m[2]}.{$m[1]}";
        }

        return [
            'name' => $name,
            'first_name' => $case->subject_type === 'individual' ? implode(' ', $parts) : null,
            'last_name' => $case->subject_type === 'individual' ? $last : null,
            'dob' => $dob,
            'id_number' => $s['id_number'] ?? null,
            'country' => $s['country'] ?? $case->jurisdiction,
        ];
    }

    private function subjectName(CaseFile $case): string
    {
        return (string) (($case->subject['registered_name'] ?? null) ?: $case->subject_name);
    }

    public function kindLabel(string $kind): string
    {
        return [
            'kyc' => 'Identity verification',
            'kyc_address' => 'Proof of address',
            'kyb' => 'Business verification',
            'aml_individual' => 'AML screening (person)',
            'aml_entity' => 'AML screening (entity)',
        ][$kind] ?? $kind;
    }
}
