<?php

namespace App\Support\Integrations;

use App\Models\IntegrationEvent;
use App\Support\Integrations\Zoho\ZohoConfig;
use Illuminate\Support\Str;
use Throwable;

/**
 * Writes the integration event ledger. Domain hooks call record(); nothing
 * here talks to Zoho. A failure to record is reported but never breaks the
 * customer action that triggered it.
 */
class Ledger
{
    /**
     * Record an outbound event once. The idempotency key defaults to
     * type + aggregate, so the same order paid twice gives one event.
     */
    public static function record(
        string $type,
        string $aggregateType,
        string|int $aggregateId,
        array $data = [],
        ?int $userId = null,
        ?string $idempotencyKey = null,
    ): ?IntegrationEvent {
        try {
            $key = $idempotencyKey ?? "{$type}:{$aggregateType}:{$aggregateId}";

            return IntegrationEvent::query()->createOrFirst(['idempotency_key' => $key], [
                'event_id' => (string) Str::uuid(),
                'source' => 'tbca',
                'direction' => 'outbound',
                'type' => $type,
                'process' => Processes::processOf($type),
                'aggregate_type' => $aggregateType,
                'aggregate_id' => (string) $aggregateId,
                'user_id' => $userId,
                'correlation_id' => "{$aggregateType}-{$aggregateId}",
                'payload' => $data,
                'status' => ZohoConfig::enabled() ? 'pending' : 'held',
                'available_at' => now(),
            ]);
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }

    /** Record work that finished inside the app (for example an identity check result) for the automation measure. */
    public static function recordInternal(
        string $type,
        string $aggregateType,
        string|int $aggregateId,
        string $handledBy,
        array $data = [],
        ?int $userId = null,
        ?string $idempotencyKey = null,
    ): ?IntegrationEvent {
        try {
            $key = $idempotencyKey ?? "{$type}:{$aggregateType}:{$aggregateId}:".Str::uuid();

            return IntegrationEvent::query()->createOrFirst(['idempotency_key' => $key], [
                'event_id' => (string) Str::uuid(),
                'source' => 'tbca',
                'direction' => 'internal',
                'type' => $type,
                'process' => Processes::processOf($type),
                'aggregate_type' => $aggregateType,
                'aggregate_id' => (string) $aggregateId,
                'user_id' => $userId,
                'payload' => $data,
                'status' => 'complete',
                'handled_by' => $handledBy,
                'completed_at' => now(),
            ]);
        } catch (Throwable $e) {
            report($e);

            return null;
        }
    }

    /**
     * Store a verified inbound delivery. Returns [event, isNew]; a replay of the
     * same source and event id returns the stored row and false.
     */
    public static function storeInbound(string $source, string $eventId, string $type, array $payload): array
    {
        $event = IntegrationEvent::query()->createOrFirst(
            ['source' => $source, 'event_id' => $eventId],
            [
                'direction' => 'inbound',
                'type' => $type,
                'process' => Processes::processOf($type),
                'idempotency_key' => "{$source}:{$eventId}",
                'payload' => $payload,
                'status' => 'pending',
            ],
        );

        return [$event, $event->wasRecentlyCreated];
    }

    /** Release events recorded while the integration was off, so the next sync sends them. */
    public static function releaseHeld(): int
    {
        return IntegrationEvent::query()->where('status', 'held')->update(['status' => 'pending', 'available_at' => now()]);
    }
}
