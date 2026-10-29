<?php

namespace App\Models\Deliverables;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * A payment-triggered delivery loop (EVT-006 Payment Confirmed to LOOP-PAY-{family}), one per Universal Prompt family.
 */
#[Unguarded]
class PaymentLoop extends Model
{
    protected $table = 'deliverable_payment_loops';
}
