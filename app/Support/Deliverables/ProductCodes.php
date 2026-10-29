<?php

namespace App\Support\Deliverables;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Gives a stable product code to app products that had none, so register deliverables
 * can be linked to them by code (scheme in ProductCatalogue).
 *
 * Codes are issued once and never changed: rows that already carry a code keep it, and
 * rows without one get the next number in slug order. Safe to run again.
 */
class ProductCodes
{
    /** table => [prefix, optional where column => value] */
    public const SCHEMES = [
        'WBN' => ['ins_webinars', null],
        'MKT' => ['mkt_listings', ['kind', '!=', 'partner']],
        'PSV' => ['mkt_listings', ['kind', '=', 'partner']],
        'SVC' => ['adv_services', null],
    ];

    /** @return array<string, int> prefix => codes issued in this run */
    public static function backfill(): array
    {
        $issued = [];
        foreach (self::SCHEMES as $prefix => [$table, $where]) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'code')) {
                continue;
            }
            $scope = fn () => DB::table($table)->when($where, fn ($q) => $q->where(...$where));

            $max = (int) $scope()->where('code', 'like', $prefix.'-%')->pluck('code')
                ->map(fn ($c) => (int) substr($c, strlen($prefix) + 1))->max();

            $missing = $scope()->whereNull('code')->orderBy('slug')->orderBy('id')->get(['id']);
            foreach ($missing as $row) {
                DB::table($table)->where('id', $row->id)->update(['code' => sprintf('%s-%03d', $prefix, ++$max)]);
            }
            $issued[$prefix] = $missing->count();
        }

        return $issued;
    }
}
