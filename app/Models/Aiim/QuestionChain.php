<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class QuestionChain extends Model
{
    protected $table = 'aiim_question_chains';

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }
}
