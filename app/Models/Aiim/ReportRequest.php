<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ReportRequest extends Model
{
    protected $table = 'aiim_report_requests';

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'lines' => 'array',
            'delivery' => 'array',
            'subtotal_zar' => 'float',
            'vat_zar' => 'float',
            'total_zar' => 'float',
            'valid_until' => 'date',
            'delivered_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Order::class);
    }
}
