<?php

namespace App\Models\DealRoom;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A Virtual Deal Room: one transaction walking stages A, B, C, 0-15.
 */
#[Unguarded]
class Room extends Model
{
    protected $table = 'vdr_rooms';

    protected function casts(): array
    {
        return [
            'enquiry' => 'array',
            'diagnostic' => 'array',
            'commercial' => 'array',
            'setup' => 'array',
            'security' => 'array',
            'plan' => 'array',
            'state' => 'array',
            'target_close_date' => 'date',
            'paused_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function stages(): HasMany
    {
        return $this->hasMany(Stage::class, 'room_id');
    }

    public function parties(): HasMany
    {
        return $this->hasMany(Party::class, 'room_id');
    }

    public function folders(): HasMany
    {
        return $this->hasMany(Folder::class, 'room_id')->orderBy('position');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'room_id');
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class, 'room_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'room_id');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'room_id');
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(Condition::class, 'room_id')->orderBy('number');
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'room_id')->orderBy('position');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class, 'room_id');
    }

    public function charges(): HasMany
    {
        return $this->hasMany(Charge::class, 'room_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(CommercialRequest::class, 'room_id');
    }

    public function usage(): HasMany
    {
        return $this->hasMany(Usage::class, 'room_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(DealEvent::class, 'room_id');
    }

    public function isPaused(): bool
    {
        return $this->status === 'paused';
    }

    /** Read a value from the per-stage working state. */
    public function stateGet(string $key, mixed $default = null): mixed
    {
        return data_get($this->state ?? [], $key, $default);
    }

    public function stateSet(string $key, mixed $value): void
    {
        $state = $this->state ?? [];
        data_set($state, $key, $value);
        $this->state = $state;
    }
}
