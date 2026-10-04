<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Project extends Model
{
    protected $table = 'portal_projects';

    protected function casts(): array
    {
        return [
            'stages' => 'array',
            'team' => 'array',
            'latest_update' => 'array',
            'risks' => 'array',
            'meta' => 'array',
            'starts_on' => 'date',
            'due_on' => 'date',
            'next_invoice_on' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function deliverables(): HasMany
    {
        return $this->hasMany(Deliverable::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function evidenceRequests(): HasMany
    {
        return $this->hasMany(EvidenceRequest::class);
    }
}
