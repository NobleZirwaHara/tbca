<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Mandate extends Model
{
    protected $table = 'adv_mandates';

    protected function casts(): array
    {
        return [
            'qualification' => 'array',
            'context' => 'array',
            'readiness' => 'array',
            'meta' => 'array',
            'nda_signed_at' => 'datetime',
            'method_card_approved_at' => 'datetime',
            'letter_signed_at' => 'datetime',
            'mandate_signed_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function gates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MandateGate::class)->orderBy('id');
    }

    public function lines(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MandateLine::class)->orderBy('id');
    }

    public function events(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MandateEvent::class)->latest('id');
    }

    public function depositOrder(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Order::class, 'deposit_order_id');
    }

    public function log(string $actor, string $event, ?string $ref = null): void
    {
        $this->events()->create(['actor' => $actor, 'event' => $event, 'ref' => $ref]);
    }
}
