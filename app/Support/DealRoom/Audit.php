<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Room;

/** Tamper-evident audit trail using the blueprint's commercial event catalogue ids. */
class Audit
{
    public static function log(Room $room, string $event, string $description, ?string $actor = null, array $meta = []): void
    {
        $room->events()->create([
            'event' => $event,
            'description' => $description,
            'actor' => $actor ?? auth()->user()?->name ?? 'System',
            'meta' => $meta ?: null,
        ]);
    }

    public static function recent(Room $room, int $limit = 8): array
    {
        return $room->events()->latest('id')->limit($limit)->get()->map(fn ($e) => [
            'id' => $e->id,
            'event' => $e->event,
            'description' => $e->description,
            'actor' => $e->actor,
            'at' => $e->created_at->format('d M Y, H:i'),
        ])->all();
    }

    /** Short deterministic reference for an evidence or audit record. */
    public static function ref(Room $room, string $prefix): string
    {
        return sprintf('%s-%s-%06d', $prefix, $room->created_at?->format('Y') ?? now()->format('Y'), $room->id + 127);
    }
}
