<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class LedgerPosting extends Model
{
    protected $table = 'shop_ledger_postings';

    protected function casts(): array
    {
        return [];
    }
}
