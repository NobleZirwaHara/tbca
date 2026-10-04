<?php

namespace App\Models\Shop;

use App\Models\Order;
use App\Models\Submission;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Quote extends Model
{
    protected $table = 'shop_quotes';

    protected function casts(): array
    {
        return ['lines' => 'array', 'deliverables' => 'array', 'terms' => 'array', 'history' => 'array', 'valid_until' => 'date', 'issued_at' => 'datetime'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
