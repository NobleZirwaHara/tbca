<?php

namespace App\Support\About;

use Illuminate\Database\Eloquent\Model;

/** Sequential register codes, e.g. COR-2026-047, CLM-075, TS-074. */
class Codes
{
    /** @param class-string<Model> $model */
    public static function next(string $model, string $prefix, int $pad = 3, string $column = 'code'): string
    {
        $max = 0;
        foreach ($model::query()->where($column, 'like', $prefix.'%')->pluck($column) as $code) {
            $n = (int) preg_replace('/\D/', '', substr($code, strlen($prefix)));
            $max = max($max, $n);
        }

        return $prefix.str_pad((string) ($max + 1), $pad, '0', STR_PAD_LEFT);
    }

    /** Stream rows as a CSV download. */
    public static function csv(string $filename, array $header, iterable $rows)
    {
        return response()->streamDownload(function () use ($header, $rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $header);
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
