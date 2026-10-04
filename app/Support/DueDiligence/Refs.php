<?php

namespace App\Support\DueDiligence;

use Illuminate\Support\Facades\DB;

/** Sequential, human-readable Due Diligence references, e.g. Q-DD-2026-00047 or DD-SA-2026-00047. */
class Refs
{
    public static function next(string $prefix, string $table, string $column = 'reference', int $pad = 5): string
    {
        $year = now()->format('Y');
        $n = DB::table($table)->where($column, 'like', "{$prefix}-{$year}-%")->count() + 1;

        do {
            $ref = sprintf('%s-%s-%s', $prefix, $year, str_pad((string) $n, $pad, '0', STR_PAD_LEFT));
            $n++;
        } while (DB::table($table)->where($column, $ref)->exists());

        return $ref;
    }

    /** Per-case child references, e.g. IR-0001. */
    public static function child(string $prefix, int $count): string
    {
        return sprintf('%s-%s', $prefix, str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT));
    }
}
