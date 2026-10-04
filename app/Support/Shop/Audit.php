<?php

namespace App\Support\Shop;

use App\Models\Shop\AuditEvent;

/** Every console action writes an audit event (blueprint 9.12: audit event + owner). */
class Audit
{
    public static function log(string $action, string $subject, string $summary, ?string $version = null, array $meta = []): AuditEvent
    {
        $user = auth()->user();

        return AuditEvent::create([
            'user_id' => $user?->id,
            'actor' => $user?->name ?? 'System',
            'action' => $action,
            'subject' => $subject,
            'summary' => $summary,
            'version' => $version,
            'meta' => $meta ?: null,
        ]);
    }
}
