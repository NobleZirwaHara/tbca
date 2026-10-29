<?php

namespace App\Models\Deliverables;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * One country and country-deliverable status from the Country Matrix (54 countries).
 */
#[Unguarded]
class CountryMatrixEntry extends Model
{
    protected $table = 'deliverable_country_matrix';
}
