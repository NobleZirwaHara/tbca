<?php

namespace App\Models\Deliverables;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * One element of the HeyGen and Infogram integration specification.
 */
#[Unguarded]
class IntegrationSpec extends Model
{
    protected $table = 'deliverable_integration_specs';
}
