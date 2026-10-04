<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class WebinarRegistration extends Model
{
    protected $table = 'ins_webinar_registrations';

    protected function casts(): array
    {
        return [
            'opt_resources' => 'boolean',
            'opt_offers' => 'boolean',
        ];
    }

    public function webinar(): BelongsTo
    {
        return $this->belongsTo(Webinar::class);
    }
}
