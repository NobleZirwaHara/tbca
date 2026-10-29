<?php

namespace App\Models\Deliverables;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * A deliverable design standard (Standards sheet): tier ladder parameter, size multiplier, page standard by format or CSAT rule.
 */
#[Unguarded]
class Standard extends Model
{
    protected $table = 'deliverable_standards';
}
