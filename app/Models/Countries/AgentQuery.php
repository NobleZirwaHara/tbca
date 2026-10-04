<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class AgentQuery extends Model
{
    protected $table = 'ctry_agent_queries';

    protected function casts(): array
    {
        return [
            'answer' => 'array',
        ];
    }

}
