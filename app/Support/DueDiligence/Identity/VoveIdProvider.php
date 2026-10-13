<?php

namespace App\Support\DueDiligence\Identity;

use App\Models\DueDiligence\IdentityVerification;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * VOVE ID (https://voveid.com), built against the public developer
 * documentation at https://docs.voveid.com (read 13 October 2026):
 *
 *   KYC  POST /v2/sessions            create or resume a session for a refId
 *        GET  /v2/users/{refId}        current result (status, document checks)
 *   KYB  POST /kyb/case               create or resume a business case, returns a 24-hour token
 *        GET  /kyb/case/{refId}/details
 *   AML  POST /aml/case               screen a person or entity with an AML flow
 *        GET  /aml/case/{refId}
 *
 * Authentication is the private API key in the x-api-key header, server side
 * only. Sandbox is https://api.voveid.net, Production https://api.voveid.com.
 * Webhooks are signed with Svix (svix-id, svix-timestamp, svix-signature).
 */
class VoveIdProvider implements IdentityVerificationProvider
{
    public function key(): string
    {
        return 'vove';
    }

    public function label(): string
    {
        return 'VOVE ID';
    }

    public function supports(): array
    {
        return ['kyc', 'kyc_address', 'kyb', 'aml_individual', 'aml_entity'];
    }

    public function start(IdentityVerification $verification, array $subject): array
    {
        return match ($verification->kind) {
            'kyc', 'kyc_address' => $this->startKyc($verification, $subject),
            'kyb' => $this->startKyb($verification),
            'aml_individual', 'aml_entity' => $this->startAml($verification, $subject),
            default => throw new IdentityProviderException("VOVE ID does not run {$verification->kind}."),
        };
    }

    public function hostedUrl(IdentityVerification $verification, ?string $redirectUrl = null): ?string
    {
        $base = rtrim((string) config('services.vove.hosted_url'), '/');
        $publicKey = (string) config('services.vove.public_key');
        $environment = (string) config('services.vove.environment', 'Sandbox');

        if ($verification->kind === 'kyb') {
            $token = $this->post('/kyb/case', array_filter(['refId' => $verification->ref_id, 'flow' => $this->flow('kyb')]))['token'] ?? null;

            return $token ? $base.'/kyb?'.http_build_query(['authToken' => $token, 'publicKey' => $publicKey, 'environment' => $environment]) : null;
        }

        if (in_array($verification->kind, ['kyc', 'kyc_address'], true)) {
            $token = $this->post('/v2/sessions', array_filter(['refId' => $verification->ref_id, 'flowId' => $this->flow($verification->kind), 'forceCreation' => false], fn ($v) => $v !== null))['token'] ?? null;

            return $token ? $base.'/?'.http_build_query(array_filter([
                'authToken' => $token,
                'publicKey' => $publicKey,
                'environment' => $environment,
                'lg' => app()->getLocale() === 'fr' ? 'fr' : (app()->getLocale() === 'ar' ? 'ar' : 'en'),
                'showUI' => 'true',
                'redirectURL' => $redirectUrl,
            ])) : null;
        }

        return null;
    }

    public function fetch(IdentityVerification $verification): array
    {
        $ref = rawurlencode($verification->ref_id);

        return match ($verification->kind) {
            'kyc', 'kyc_address' => $this->kycResult($this->get("/v2/users/{$ref}")),
            'kyb' => $this->kybResult($this->get("/kyb/case/{$ref}/details")),
            'aml_individual', 'aml_entity' => ['provider_status' => (string) ($this->get("/aml/case/{$ref}")['status'] ?? 'unknown'), 'summary' => []],
            default => throw new IdentityProviderException("VOVE ID does not run {$verification->kind}."),
        };
    }

    /**
     * Svix signature check: v1 = base64(HMAC-SHA256(secret, "{id}.{timestamp}.{raw body}")),
     * where the secret is the part after "whsec_", base64-decoded.
     */
    public static function verifySignature(string $secret, ?string $id, ?string $timestamp, ?string $signatures, string $body, int $tolerance = 300): bool
    {
        if (! $id || ! $timestamp || ! $signatures || ! ctype_digit($timestamp) || abs(time() - (int) $timestamp) > $tolerance) {
            return false;
        }

        $raw = str_starts_with($secret, 'whsec_') ? substr($secret, 6) : $secret;
        $key = base64_decode($raw, true);
        $expected = base64_encode(hash_hmac('sha256', "{$id}.{$timestamp}.{$body}", $key === false ? $raw : $key, true));

        foreach (preg_split('/\s+/', trim($signatures)) as $part) {
            [$version, $signature] = array_pad(explode(',', $part, 2), 2, null);
            if ($version === 'v1' && $signature !== null && hash_equals($expected, $signature)) {
                return true;
            }
        }

        return false;
    }

    private function startKyc(IdentityVerification $verification, array $subject): array
    {
        // Creates or resumes the session so it appears in the VOVE dashboard; the token is minted again when the subject opens the link.
        $this->post('/v2/sessions', array_filter([
            'refId' => $verification->ref_id,
            'flowId' => $this->flow($verification->kind),
            'forceCreation' => false,
            'user' => array_filter([
                'firstName' => $subject['first_name'] ?? null,
                'lastName' => $subject['last_name'] ?? null,
                'idNumber' => $subject['id_number'] ?? null,
                'dateOfBirth' => $subject['dob'] ?? null,
            ]) ?: null,
        ], fn ($v) => $v !== null));

        return ['provider_status' => 'open'];
    }

    private function startKyb(IdentityVerification $verification): array
    {
        $body = $this->post('/kyb/case', array_filter(['refId' => $verification->ref_id, 'flow' => $this->flow('kyb')]));

        return [
            'provider_status' => (string) ($body['kybCase']['status'] ?? 'NOT_STARTED'),
            'provider_case_id' => $body['kybCase']['_id'] ?? null,
        ];
    }

    private function startAml(IdentityVerification $verification, array $subject): array
    {
        $flow = $this->flow($verification->kind) ?? throw new IdentityProviderException('Set VOVE_'.strtoupper($verification->kind).'_FLOW_ID: an AML flow ID is required.');

        $body = $this->post('/aml/case', [
            'flowId' => $flow,
            'refId' => $verification->ref_id,
            'screeningData' => array_filter(['name' => $subject['name'], 'dob' => $subject['dob'] ?? null]),
        ]);

        return ['provider_status' => (string) ($body['status'] ?? 'unknown'), 'provider_case_id' => $body['id'] ?? null];
    }

    /** Decision fields only: no names, ID numbers, dates of birth, images or biometrics. */
    private function kycResult(array $body): array
    {
        $documents = collect($body['documents'] ?? [])->map(fn ($d) => array_filter([
            'step' => $d['stepId'] ?? null,
            'type' => $d['type'] ?? null,
            'issuing_country' => $d['issuingCountry'] ?? null,
            'match_level' => $d['matchLevel'] ?? null,
            'digital_id_spoof' => $d['digitalIDSpoof'] ?? null,
            'face_on_document' => $d['faceOnDocumentSpoof'] ?? null,
            'text_on_document' => $d['textOnDocumentSpoof'] ?? null,
            'mrz' => $d['mrzStatus'] ?? null,
            'expires' => $d['dateOfExpiration'] ?? null,
        ], fn ($v) => $v !== null))->values()->all();

        return ['provider_status' => (string) ($body['status'] ?? 'unknown'), 'summary' => ['documents' => $documents, 'updated_at' => $body['updatedAt'] ?? null]];
    }

    private function kybResult(array $body): array
    {
        $case = $body['data'][0] ?? $body;

        return [
            'provider_status' => (string) ($case['status'] ?? 'unknown'),
            'summary' => array_filter([
                'registry_verified' => $case['businessSearch']['verified'] ?? null,
                'ubo_count' => isset($case['ubos']) ? count($case['ubos']) : null,
                'ubo_statuses' => isset($case['ubos']) ? array_values(array_map(fn ($u) => $u['status'] ?? 'unknown', $case['ubos'])) : null,
                'website_risk' => $case['websiteAnalysis']['risk'] ?? null,
                'documents' => isset($case['documents']) ? count($case['documents']) : null,
            ], fn ($v) => $v !== null),
        ];
    }

    private function flow(string $kind): ?string
    {
        $value = config("services.vove.flows.{$kind}");

        return filled($value) ? (string) $value : null;
    }

    private function get(string $path): array
    {
        return $this->decode($this->send(fn ($http) => $http->get($this->url($path))), $path);
    }

    private function post(string $path, array $json): array
    {
        return $this->decode($this->send(fn ($http) => $http->post($this->url($path), $json)), $path);
    }

    private function send(callable $call): Response
    {
        $key = config('services.vove.api_key');
        if (blank($key)) {
            throw new IdentityProviderException('VOVE_API_KEY is not set.');
        }

        try {
            return $call(Http::acceptJson()->withHeaders(['x-api-key' => $key])->timeout((int) config('services.vove.timeout', 20)));
        } catch (ConnectionException $e) {
            throw new IdentityProviderException('VOVE ID unreachable: '.$e->getMessage());
        }
    }

    private function decode(Response $response, string $path): array
    {
        if ($response->failed()) {
            $message = $response->json('message');
            throw new IdentityProviderException(sprintf('VOVE ID %s returned %d%s', strtok($path, '?'), $response->status(), is_string($message) ? ': '.$message : ''), $response->status());
        }

        return $response->json() ?? [];
    }

    private function url(string $path): string
    {
        return rtrim((string) config('services.vove.base_url'), '/').$path;
    }
}
