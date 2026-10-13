<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * Maps a local record to its ID in an external system (for example an order
 * to its Zoho Books invoice). One row per local record, system and module, so
 * a repeated sync finds the existing external record instead of creating another.
 */
#[Unguarded]
class IntegrationLink extends Model
{
    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public static function externalId(string $localType, string|int $localId, string $system, string $module): ?string
    {
        return static::query()
            ->where(['local_type' => $localType, 'local_id' => (string) $localId, 'system' => $system, 'module' => $module])
            ->value('external_id');
    }

    public static function remember(string $localType, string|int $localId, string $system, string $module, string $externalId, array $meta = []): void
    {
        static::query()->updateOrCreate(
            ['local_type' => $localType, 'local_id' => (string) $localId, 'system' => $system, 'module' => $module],
            ['external_id' => $externalId, 'meta' => $meta ?: null],
        );
    }

    /** Local record ID for an external ID, for inbound webhooks. */
    public static function localFor(string $system, string $module, string $externalId, string $localType): ?string
    {
        return static::query()
            ->where(['system' => $system, 'module' => $module, 'external_id' => $externalId, 'local_type' => $localType])
            ->value('local_id');
    }
}
