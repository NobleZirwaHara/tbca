<?php

namespace App\Support\Integrations\Zoho\Apps;

use App\Support\Integrations\Zoho\ZohoClient;
use App\Support\Integrations\Zoho\ZohoConfig;
use App\Support\Integrations\Zoho\ZohoException;

/** Zoho Desk tickets. Every call carries the orgId header. */
class Desk
{
    public function __construct(private ZohoClient $client) {}

    /** @return array{id: string, number: ?string} */
    public function createTicket(array $ticket): array
    {
        $body = $this->client->request('POST', ZohoConfig::host('desk').'/api/v1/tickets', [
            'headers' => $this->headers(),
            'json' => array_filter(['departmentId' => ZohoConfig::org('desk', 'department_id'), ...$ticket], fn ($v) => $v !== null),
        ]);

        if (empty($body['id'])) {
            throw new ZohoException('Desk did not return a ticket id.', retryable: false);
        }

        return ['id' => (string) $body['id'], 'number' => isset($body['ticketNumber']) ? (string) $body['ticketNumber'] : null];
    }

    public function getTicket(string $id): array
    {
        return $this->client->request('GET', ZohoConfig::host('desk')."/api/v1/tickets/{$id}", ['headers' => $this->headers()]);
    }

    private function headers(): array
    {
        $org = ZohoConfig::org('desk', 'org_id') ?? throw new ZohoException('ZOHO_DESK_ORG_ID is not set.', retryable: false);

        return ['orgId' => $org];
    }
}
