<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class ResourceAsset extends Model
{
    protected $table = 'ins_resource_assets';
}
