<?php

namespace App\Support\Aiim;

use Illuminate\Support\Str;

/**
 * AIIM record references, e.g. ENT-20261003-7K8B, AIIM-QUOTE-20261003-4F2A.
 */
class Refs
{
    public static function make(string $prefix): string
    {
        return sprintf('%s-%s-%s', strtoupper($prefix), now()->format('Ymd'), strtoupper(Str::random(4)));
    }

    /** Mandate style references: MND-2026-10-03-XK2. */
    public static function dated(string $prefix): string
    {
        return sprintf('%s-%s-%s', strtoupper($prefix), now()->format('Y-m-d'), strtoupper(Str::random(3)));
    }
}
