<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class CountryPack extends Model
{
    protected $table = 'aiim_country_packs';

    protected function casts(): array
    {
        return ['summary' => 'array', 'macro' => 'array', 'products' => 'array', 'institutions' => 'array', 'one_stop_shop' => 'array', 'sectors' => 'array', 'top_opportunities' => 'array', 'benchmark' => 'array', 'rollout' => 'array', 'geo' => 'array', 'issued_on' => 'date'];
    }
}
