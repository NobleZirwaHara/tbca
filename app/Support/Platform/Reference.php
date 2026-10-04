<?php

namespace App\Support\Platform;

use Illuminate\Support\Str;

/**
 * Human-readable record references, e.g. TBCA-ORD-2026-7KQ2M9.
 * Every section uses the same shape so a client can quote any reference to support.
 */
class Reference
{
    public static function make(string $prefix): string
    {
        return sprintf('TBCA-%s-%s-%s', strtoupper($prefix), now()->format('Y'), strtoupper(Str::random(6)));
    }
}
