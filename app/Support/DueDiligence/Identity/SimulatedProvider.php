<?php

namespace App\Support\DueDiligence\Identity;

use App\Models\DueDiligence\IdentityVerification;

/**
 * Default provider while no contract is in place. No network calls.
 * Screening returns a possible match when the subject name contains "PEP" or
 * "Sanction", so the review path can be demonstrated; everything else passes.
 */
class SimulatedProvider implements IdentityVerificationProvider
{
    public function key(): string
    {
        return 'simulated';
    }

    public function label(): string
    {
        return 'Simulated provider';
    }

    public function supports(): array
    {
        return ['kyc', 'kyc_address', 'kyb', 'aml_individual', 'aml_entity'];
    }

    public function start(IdentityVerification $verification, array $subject): array
    {
        if (str_starts_with($verification->kind, 'aml')) {
            return ['provider_status' => $this->screen($subject['name']), 'summary' => ['simulated' => true]];
        }

        return ['provider_status' => $verification->kind === 'kyb' ? 'NOT_STARTED' : 'open', 'summary' => ['simulated' => true]];
    }

    public function hostedUrl(IdentityVerification $verification, ?string $redirectUrl = null): ?string
    {
        return null;
    }

    public function fetch(IdentityVerification $verification): array
    {
        $status = match ($verification->kind) {
            'kyb' => 'COMPLETED',
            'aml_individual', 'aml_entity' => $verification->provider_status ?? $this->screen($verification->subject_name),
            default => 'successful',
        };

        return ['provider_status' => $status, 'summary' => ['simulated' => true]];
    }

    private function screen(string $name): string
    {
        return preg_match('/\b(pep|sanction)/i', $name) ? 'IN_REVIEW' : 'NO_MATCH';
    }
}
