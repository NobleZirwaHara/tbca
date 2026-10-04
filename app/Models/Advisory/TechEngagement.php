<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class TechEngagement extends Model
{
    protected $table = 'adv_tech_engagements';

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'diagnostic' => 'array',
            'config' => 'array',
            'fee_lines' => 'array',
            'meters' => 'array',
            'uat' => 'array',
            'subscription' => 'array',
            'exit_plan' => 'array',
            'transactions' => 'array',
            'timeline' => 'array',
            'letter_signed_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function gates(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TechGate::class, 'engagement_id')->orderBy('number');
    }

    public function tasks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TechTask::class, 'engagement_id')->orderBy('due_date');
    }

    public function documents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TechDocument::class, 'engagement_id')->latest('uploaded_at');
    }

    public function tickets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TechTicket::class, 'engagement_id')->latest('id');
    }

    public function addTimeline(string $event, string $by): void
    {
        $timeline = $this->timeline ?? [];
        array_unshift($timeline, ['at' => now()->format('d M Y H:i'), 'event' => $event, 'by' => $by]);
        $this->timeline = array_slice($timeline, 0, 40);
        $this->save();
    }
}
