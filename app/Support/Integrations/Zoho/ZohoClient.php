<?php

namespace App\Support\Integrations\Zoho;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Authenticated HTTP to Zoho APIs. Sends "Authorization: Zoho-oauthtoken",
 * refreshes the token once on 401, and turns failures into ZohoException
 * (retryable for 429, 5xx and network errors).
 */
class ZohoClient
{
    public function __construct(private ZohoAuth $auth) {}

    /**
     * @param  array{query?: array, json?: array, form?: array, headers?: array}  $options
     */
    public function request(string $method, string $url, array $options = []): array
    {
        $response = $this->send($method, $url, $options);

        if ($response->status() === 401) {
            $this->auth->forget();
            $response = $this->send($method, $url, $options);
        }

        if ($response->status() === 204) {
            return [];
        }

        if ($response->failed()) {
            $retryable = $response->status() === 429 || $response->serverError();
            $detail = $response->json('message') ?? $response->json('data.0.message') ?? $response->json('code') ?? substr($response->body(), 0, 200);
            throw new ZohoException(sprintf('%s %s returned %d: %s', $method, parse_url($url, PHP_URL_PATH), $response->status(), is_string($detail) ? $detail : json_encode($detail)), $retryable, $response->status());
        }

        return $response->json() ?? [];
    }

    private function send(string $method, string $url, array $options): Response
    {
        $request = $this->pending($options['headers'] ?? []);

        if (isset($options['query'])) {
            $request = $request->withQueryParameters($options['query']);
        }

        try {
            return match (true) {
                isset($options['form']) => $request->asForm()->send($method, $url, ['form_params' => $options['form']]),
                isset($options['json']) => $request->send($method, $url, ['json' => $options['json']]),
                default => $request->send($method, $url),
            };
        } catch (ConnectionException $e) {
            throw new ZohoException('Zoho unreachable: '.$e->getMessage());
        }
    }

    private function pending(array $headers): PendingRequest
    {
        return Http::acceptJson()
            ->withHeaders(['Authorization' => 'Zoho-oauthtoken '.$this->auth->accessToken(), ...$headers])
            ->timeout((int) config('zoho.sync.timeout', 20));
    }
}
