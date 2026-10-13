<?php

namespace App\Support\Integrations\Zoho\Apps;

use App\Support\Integrations\Zoho\ZohoClient;
use App\Support\Integrations\Zoho\ZohoConfig;
use App\Support\Integrations\Zoho\ZohoException;

/** Zoho WorkDrive: create the engagement folder under the configured team folder. */
class WorkDrive
{
    public function __construct(private ZohoClient $client) {}

    public function createFolder(string $name, ?string $parentId = null): string
    {
        $parent = $parentId ?? ZohoConfig::org('workdrive', 'parent_folder_id') ?? throw new ZohoException('ZOHO_WORKDRIVE_PARENT_FOLDER_ID is not set.', retryable: false);

        $body = $this->client->request('POST', ZohoConfig::host('api').'/workdrive/api/v1/files', [
            'headers' => ['Accept' => 'application/vnd.api+json'],
            'json' => ['data' => ['attributes' => ['name' => $name, 'parent_id' => $parent], 'type' => 'files']],
        ]);

        return (string) ($body['data']['id'] ?? throw new ZohoException('WorkDrive did not return a folder id.', retryable: false));
    }
}
