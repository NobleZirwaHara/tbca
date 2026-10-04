<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A controlled introduction (gate G10). The room only opens once the client has
 * given consent AND at least one counterparty has accepted; contact details of a
 * counterparty are only released once that counterparty has accepted.
 */
#[Unguarded]
class Introduction extends Model
{
    protected $table = 'aiim_introductions';

    protected function casts(): array
    {
        return [
            'project' => 'array',
            'sharing' => 'array',
            'activity' => 'array',
            'client_consented_at' => 'datetime',
        ];
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }

    public function parties(): HasMany
    {
        return $this->hasMany(IntroductionParty::class);
    }

    public function clientConsented(): bool
    {
        return $this->client_consented_at !== null;
    }

    public function roomOpen(): bool
    {
        return $this->clientConsented()
            && $this->parties->where('selected', true)->where('consent_status', 'accepted')->isNotEmpty();
    }
}
