<?php

namespace App\Support\DueDiligence\Identity;

use App\Models\DueDiligence\IdentityVerification;

/**
 * An identity-verification provider for Due Diligence checks.
 *
 * Kinds: kyc (ID document, liveness and face match), kyc_address (proof of
 * address), kyb (business registry, directors and beneficial owners),
 * aml_individual and aml_entity (sanctions, PEP, watchlists, adverse media).
 *
 * Every method returns the provider's own status string; the manager maps it
 * to the local status. Providers never return ID images or biometrics.
 */
interface IdentityVerificationProvider
{
    public function key(): string;

    public function label(): string;

    /** Kinds this provider can run. */
    public function supports(): array;

    /**
     * Create (or resume) the verification at the provider.
     *
     * @param  array{name: string, first_name: ?string, last_name: ?string, dob: ?string, id_number: ?string, country: ?string}  $subject
     * @return array{provider_status: string, provider_case_id?: ?string, summary?: array}
     */
    public function start(IdentityVerification $verification, array $subject): array;

    /** URL of the provider's hosted journey for the subject, minted fresh each time. Null when the provider has none. */
    public function hostedUrl(IdentityVerification $verification, ?string $redirectUrl = null): ?string;

    /**
     * Current result from the provider, the authority before any decision.
     *
     * @return array{provider_status: string, summary: array}
     */
    public function fetch(IdentityVerification $verification): array;
}
