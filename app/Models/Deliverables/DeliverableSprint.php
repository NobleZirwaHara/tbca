<?php

namespace App\Models\Deliverables;

use App\Models\Sprint;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row of the Sprint Crosswalk: a register Sprint code and the deliverable it
 * produces. sprint_id links the app's Sprint record when one carries the code (as
 * its code or its register_id); unmatched codes are kept with match = "unmatched".
 */
#[Unguarded]
class DeliverableSprint extends Model
{
    protected $table = 'deliverable_sprints';

    public function deliverable(): BelongsTo
    {
        return $this->belongsTo(Deliverable::class, 'deliverable_ref', 'ref');
    }

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }
}
