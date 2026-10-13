<?php

namespace App\Support\Integrations\Zoho\Apps;

use App\Support\Integrations\Zoho\ZohoException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Zoho Flow webhook trigger. The trigger URL created in Flow carries its own
 * key, so no OAuth token is sent. Keep the URLs in .env, never in code.
 */
class Flow
{
    public function trigger(string $url, array $envelope): void
    {
        try {
            $response = Http::acceptJson()->timeout((int) config('zoho.sync.timeout', 20))->post($url, $envelope);
        } catch (ConnectionException $e) {
            throw new ZohoException('Zoho Flow unreachable: '.$e->getMessage());
        }

        if ($response->failed()) {
            throw new ZohoException('Zoho Flow webhook returned '.$response->status(), $response->status() === 429 || $response->serverError(), $response->status());
        }
    }
}
