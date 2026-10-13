<?php

namespace App\Support\Integrations\Zoho\Apps;

use App\Support\Integrations\Zoho\ZohoClient;
use App\Support\Integrations\Zoho\ZohoConfig;
use App\Support\Integrations\Zoho\ZohoException;

/**
 * Zoho Creator: control records in the "TBCA Operations" application
 * (Engagements, DD Cases, Deal Rooms, Approvals, Automation Runs).
 */
class Creator
{
    public function __construct(private ZohoClient $client) {}

    public function addRecord(string $form, array $data): string
    {
        $body = $this->client->request('POST', $this->base()."/form/{$form}", ['json' => ['data' => $data]]);

        $id = $body['data']['ID'] ?? $body['data'][0]['data']['ID'] ?? null;
        if (($body['code'] ?? 3000) !== 3000 || ! $id) {
            throw new ZohoException("Creator {$form} record rejected: ".json_encode($body['error'] ?? $body['message'] ?? $body['code'] ?? null), retryable: false);
        }

        return (string) $id;
    }

    /** First record in a report matching a criteria string such as (TBCA_Reference == "DD-SA-2026-00047"). */
    public function findRecord(string $report, string $criteria): ?string
    {
        try {
            $body = $this->client->request('GET', $this->base()."/report/{$report}", ['query' => ['criteria' => $criteria, 'max_records' => 200]]);
        } catch (ZohoException $e) {
            if ($e->status === 404) {
                return null;
            }
            throw $e;
        }

        return isset($body['data'][0]['ID']) ? (string) $body['data'][0]['ID'] : null;
    }

    private function base(): string
    {
        $owner = ZohoConfig::org('creator', 'owner') ?? throw new ZohoException('ZOHO_CREATOR_OWNER is not set.', retryable: false);
        $app = ZohoConfig::org('creator', 'app');

        return ZohoConfig::host('api')."/creator/v2.1/data/{$owner}/{$app}";
    }
}
