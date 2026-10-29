<?php

namespace App\Models\Deliverables;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * An automated fail-closed safeguard (SG-01 to SG-30) with the OSS stage and loop that apply it.
 */
#[Unguarded]
class Safeguard extends Model
{
    protected $table = 'deliverable_safeguards';
}
