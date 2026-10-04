<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class TaxonomyChange extends Model
{
    protected $table = 'ins_taxonomy_changes';
}
