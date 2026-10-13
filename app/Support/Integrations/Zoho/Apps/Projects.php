<?php

namespace App\Support\Integrations\Zoho\Apps;

use App\Support\Integrations\Zoho\ZohoClient;
use App\Support\Integrations\Zoho\ZohoConfig;
use App\Support\Integrations\Zoho\ZohoException;

/** Zoho Projects: create a delivery project from the approved Sprint template. */
class Projects
{
    public function __construct(private ZohoClient $client) {}

    public function createFromTemplate(string $name, string $description, ?string $templateId = null): string
    {
        $portal = ZohoConfig::org('projects', 'portal_id') ?? throw new ZohoException('ZOHO_PROJECTS_PORTAL_ID is not set.', retryable: false);

        $body = $this->client->request('POST', ZohoConfig::host('projects')."/restapi/portal/{$portal}/projects/", [
            'form' => array_filter([
                'name' => $name,
                'description' => $description,
                'template_id' => $templateId ?? ZohoConfig::org('projects', 'template_id'),
            ]),
        ]);

        $project = $body['projects'][0] ?? null;
        $id = $project['id_string'] ?? $project['id'] ?? null;
        if (! $id) {
            throw new ZohoException('Projects did not return a project id.', retryable: false);
        }

        return (string) $id;
    }
}
