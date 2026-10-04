<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class BenchmarkConsent extends Model
{
    protected $table = 'ins_benchmark_consents';
}
