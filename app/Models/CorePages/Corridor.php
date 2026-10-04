<?php

namespace App\Models\CorePages;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * A governed sovereign corridor (Corridor Object Manager).
 * States: pending -> active (needs RCS >= 90 and sovereign approval) <-> on_hold; any -> retired.
 */
#[Unguarded]
class Corridor extends Model
{
    protected $table = 'core_corridors';

    public const STATES = ['pending', 'active', 'on_hold', 'retired'];

    public const ACTIVATION_RCS = 90;

    protected function casts(): array
    {
        return [
            'anchors' => 'array',
            'history' => 'array',
            'bidirectional' => 'boolean',
            'sovereign_approval' => 'boolean',
            'last_reviewed_at' => 'date',
            'next_review_at' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    /** @return array<string, list<string>> allowed transitions */
    public static function transitions(): array
    {
        return [
            'pending' => ['active', 'retired'],
            'active' => ['on_hold', 'retired'],
            'on_hold' => ['active', 'retired'],
            'retired' => [],
        ];
    }

    public function canMoveTo(string $state): bool
    {
        return in_array($state, self::transitions()[$this->state] ?? [], true);
    }

    /** Reason activation is blocked, or null if it may proceed. */
    public function activationBlocker(): ?string
    {
        if ($this->rcs < self::ACTIVATION_RCS) {
            return "Resolver completeness is {$this->rcs}%. At least ".self::ACTIVATION_RCS.'% is required before activation.';
        }
        if (! $this->sovereign_approval) {
            return 'A valid sovereign approval must be recorded before activation.';
        }

        return null;
    }
}
