<?php

namespace App\Support\Insights;

use App\Models\Insights\AuditLog;
use Illuminate\Database\Eloquent\Model;

class Audit
{
    public static function log(Model $subject, string $action, ?string $from = null, ?string $to = null, ?string $note = null): void
    {
        AuditLog::create([
            'subject_type' => class_basename($subject),
            'subject_id' => $subject->getKey(),
            'actor' => auth()->user()?->name ?? 'System',
            'action' => $action,
            'from_state' => $from,
            'to_state' => $to,
            'note' => $note,
        ]);
    }

    public static function trail(Model $subject, int $limit = 10): array
    {
        return AuditLog::query()
            ->where('subject_type', class_basename($subject))
            ->where('subject_id', $subject->getKey())
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($l) => [
                'at' => $l->created_at->format('d M Y, H:i'),
                'actor' => $l->actor,
                'action' => $l->action,
                'from' => $l->from_state,
                'to' => $l->to_state,
                'note' => $l->note,
            ])
            ->all();
    }
}
