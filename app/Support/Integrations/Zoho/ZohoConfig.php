<?php

namespace App\Support\Integrations\Zoho;

/** Reads config/zoho.php. */
class ZohoConfig
{
    /** On only when switched on and the OAuth credentials exist. */
    public static function enabled(): bool
    {
        return (bool) config('zoho.enabled') && self::hasCredentials();
    }

    public static function hasCredentials(): bool
    {
        return filled(config('zoho.oauth.client_id'))
            && filled(config('zoho.oauth.client_secret'))
            && filled(config('zoho.oauth.refresh_token'));
    }

    /** Host for accounts, api, desk or projects, from an override or the data centre map. */
    public static function host(string $name): string
    {
        $override = config("zoho.hosts.{$name}");
        if (filled($override)) {
            return rtrim($override, '/');
        }

        $dc = config('zoho.dc', 'eu');
        $map = config("zoho.datacentres.{$dc}") ?? config('zoho.datacentres.eu');

        return rtrim($map[$name], '/');
    }

    public static function org(string $app, string $key): ?string
    {
        $value = config("zoho.orgs.{$app}.{$key}");

        return filled($value) ? (string) $value : null;
    }

    /** Apps whose organisation or container ID is filled, for the status page. */
    public static function appReadiness(): array
    {
        return [
            'CRM' => true,
            'Books' => filled(self::org('books', 'organization_id')),
            'Desk' => filled(self::org('desk', 'org_id')),
            'Projects' => filled(self::org('projects', 'portal_id')),
            'WorkDrive' => filled(self::org('workdrive', 'parent_folder_id')),
            'Creator' => filled(self::org('creator', 'owner')),
            'Flow' => collect(config('zoho.flow.webhooks', []))->filter()->isNotEmpty(),
        ];
    }
}
