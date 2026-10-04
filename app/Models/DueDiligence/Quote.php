<?php

namespace App\Models\DueDiligence;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A scoped Due Diligence quotation (DD-017 to DD-030). Carries the
 * pre-payment journey; a case is opened only once its order is paid.
 */
#[Unguarded]
class Quote extends Model
{
    protected $table = 'dd_quotes';

    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'inputs' => 'array',
            'addons' => 'array',
            'manifest' => 'array',
            'consent' => 'array',
            'engagement' => 'array',
            'billing' => 'array',
            'accepted_at' => 'datetime',
            'valid_until' => 'datetime',
            'consented_at' => 'datetime',
            'engaged_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'quote_id');
    }

    public function caseFile(): HasOne
    {
        return $this->hasOne(CaseFile::class, 'quote_id');
    }

    public function isAccepted(): bool
    {
        return $this->accepted_at !== null && ($this->valid_until === null || $this->valid_until->isFuture());
    }

    public function isConsented(): bool
    {
        return $this->consented_at !== null;
    }

    public function isEngaged(): bool
    {
        return $this->engaged_at !== null;
    }
}
