<?php

namespace App\Support\Integrations\Zoho;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * OAuth 2.0 refresh-token flow. The refresh token, client ID and secret come
 * from a Self Client or Server-based client in the Zoho API console. The
 * short-lived access token is cached until a minute before it expires.
 */
class ZohoAuth
{
    public function accessToken(): string
    {
        $key = config('zoho.oauth.cache_key');
        $cached = Cache::get($key);
        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        if (! ZohoConfig::hasCredentials()) {
            throw new ZohoException('Zoho OAuth credentials are not configured.', retryable: false);
        }

        try {
            $response = Http::asForm()
                ->timeout((int) config('zoho.sync.timeout', 20))
                ->post(ZohoConfig::host('accounts').'/oauth/v2/token', [
                    'grant_type' => 'refresh_token',
                    'refresh_token' => config('zoho.oauth.refresh_token'),
                    'client_id' => config('zoho.oauth.client_id'),
                    'client_secret' => config('zoho.oauth.client_secret'),
                ]);
        } catch (ConnectionException $e) {
            throw new ZohoException('Zoho accounts server unreachable: '.$e->getMessage());
        }

        $token = $response->json('access_token');
        if (! $response->successful() || ! is_string($token) || $token === '') {
            // Zoho answers 200 with {"error":"invalid_code"} for a revoked or wrong-DC refresh token.
            $error = $response->json('error') ?? 'HTTP '.$response->status();
            throw new ZohoException("Zoho token refresh failed: {$error}", retryable: $response->serverError(), status: $response->status());
        }

        $ttl = max(60, (int) $response->json('expires_in', 3600) - 60);
        Cache::put($key, $token, $ttl);

        return $token;
    }

    public function forget(): void
    {
        Cache::forget(config('zoho.oauth.cache_key'));
    }
}
