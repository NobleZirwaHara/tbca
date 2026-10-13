<?php

namespace App\Support\Integrations\Zoho\Apps;

use App\Support\Integrations\Zoho\ZohoClient;
use App\Support\Integrations\Zoho\ZohoConfig;
use App\Support\Integrations\Zoho\ZohoException;

/**
 * Zoho CRM: upsert Accounts, Contacts, Deals and Leads by an external TBCA ID.
 * The custom fields (TBCA_Business_ID, TBCA_Person_ID, TBCA_Order_ID) must
 * exist in CRM and be marked unique, see docs/INTEGRATIONS_PLAN.md.
 */
class Crm
{
    public function __construct(private ZohoClient $client) {}

    /** @return array{id: string, action: string} */
    public function upsert(string $module, array $record, array $duplicateCheckFields): array
    {
        $version = config('zoho.orgs.crm.api_version', 'v8');
        $body = $this->client->request('POST', ZohoConfig::host('api')."/crm/{$version}/{$module}/upsert", [
            'json' => ['data' => [$record], 'duplicate_check_fields' => $duplicateCheckFields],
        ]);

        $row = $body['data'][0] ?? [];
        if (($row['status'] ?? null) !== 'success' || empty($row['details']['id'])) {
            throw new ZohoException("CRM {$module} upsert rejected: ".($row['message'] ?? $row['code'] ?? 'no result'), retryable: false);
        }

        return ['id' => (string) $row['details']['id'], 'action' => (string) ($row['action'] ?? 'upsert')];
    }

    public function upsertAccount(string $businessId, array $fields): array
    {
        return $this->upsert('Accounts', ['TBCA_Business_ID' => $businessId, ...$fields], ['TBCA_Business_ID']);
    }

    public function upsertContact(string $personId, array $fields): array
    {
        return $this->upsert('Contacts', ['TBCA_Person_ID' => $personId, ...$fields], ['TBCA_Person_ID']);
    }

    public function upsertDeal(string $orderId, array $fields): array
    {
        $pipeline = ZohoConfig::org('crm', 'pipeline');

        return $this->upsert('Deals', array_filter(['TBCA_Order_ID' => $orderId, 'Pipeline' => $pipeline, ...$fields], fn ($v) => $v !== null), ['TBCA_Order_ID']);
    }

    /** Unqualified prospects. Email is the duplicate check because an anonymous enquiry has no TBCA person ID. */
    public function upsertLead(array $fields): array
    {
        return $this->upsert('Leads', $fields, ['Email']);
    }
}
