<?php

namespace App\Models\Deliverables;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * One shared long text from the Registry of Deliverables, referenced by the *_text_id columns on deliverables.
 */
#[Unguarded]
class DeliverableText extends Model
{
    protected $table = 'deliverable_texts';
}
