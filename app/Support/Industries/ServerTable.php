<?php

namespace App\Support\Industries;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Search, filter, sort and paginate a large in-memory row set on the server, so pages with
 * thousands of Sprints send one page at a time (same controls as the prototype's data table:
 * search, column filters, sortable headers, pager, rows per page and CSV export).
 */
class ServerTable
{
    /**
     * @param  array<int, array>  $rows
     * @param  string[]  $search  keys searched by the free-text box
     * @param  string[]  $filters  keys offered as column filters
     * @param  string[]  $sortKeys  sort key per column index
     */
    public static function make(array $rows, Request $request, array $search, array $filters, array $sortKeys, int $defaultSize = 15, ?int $defaultSort = null, int $defaultDir = 1): array
    {
        $q = trim((string) $request->query('q', ''));
        $f = array_filter((array) $request->query('f', []), fn ($v) => $v !== null && $v !== '');
        $sort = $request->query('sort');
        $sort = $sort === null || $sort === '' ? $defaultSort : (int) $sort;
        $dir = (int) $request->query('dir', $defaultDir) < 0 ? -1 : 1;
        $size = in_array((int) $request->query('size'), [10, 15, 25, 50, 100], true) ? (int) $request->query('size') : $defaultSize;

        $options = [];
        foreach ($filters as $k) {
            $vals = array_values(array_unique(array_filter(array_map(fn ($r) => $r[$k] ?? null, $rows), fn ($v) => $v !== null && $v !== '')));
            sort($vals);
            $options[$k] = array_map('strval', $vals);
        }

        $out = self::apply($rows, $q, $f, $search, $sort, $dir, $sortKeys);
        $pages = max(1, (int) ceil(count($out) / $size));
        $page = min(max(0, (int) $request->query('page', 0)), $pages - 1);

        return [
            'rows' => array_values(array_slice($out, $page * $size, $size)),
            'total' => count($rows), 'count' => count($out), 'page' => $page, 'pages' => $pages, 'size' => $size,
            'q' => $q, 'f' => (object) $f, 'sort' => $sort, 'dir' => $dir, 'options' => (object) $options,
        ];
    }

    public static function apply(array $rows, string $q, array $f, array $search, ?int $sort, int $dir, array $sortKeys): array
    {
        if ($q !== '') {
            $needle = mb_strtolower($q);
            $rows = array_filter($rows, function ($r) use ($needle, $search) {
                foreach ($search as $k) {
                    if (str_contains(mb_strtolower((string) ($r[$k] ?? '')), $needle)) {
                        return true;
                    }
                }

                return false;
            });
        }
        foreach ($f as $k => $v) {
            $rows = array_filter($rows, fn ($r) => (string) ($r[$k] ?? '') === (string) $v);
        }
        if ($sort !== null && isset($sortKeys[$sort])) {
            $k = $sortKeys[$sort];
            usort($rows, function ($a, $b) use ($k, $dir) {
                $x = $a[$k] ?? null;
                $y = $b[$k] ?? null;
                if (is_numeric($x) && is_numeric($y)) {
                    return ($x <=> $y) * $dir;
                }

                return strcmp((string) $x, (string) $y) * $dir;
            });
        }

        return array_values($rows);
    }

    /** CSV download of the filtered rows. @param array<string, string> $cols label => key */
    public static function csv(string $name, array $rows, Request $request, array $search, array $sortKeys, array $cols): StreamedResponse
    {
        $q = trim((string) $request->query('q', ''));
        $f = array_filter((array) $request->query('f', []), fn ($v) => $v !== null && $v !== '');
        $sort = $request->query('sort');
        $rows = self::apply($rows, $q, $f, $search, $sort === null || $sort === '' ? null : (int) $sort, (int) $request->query('dir', 1) < 0 ? -1 : 1, $sortKeys);

        return response()->streamDownload(function () use ($rows, $cols) {
            $out = fopen('php://output', 'w');
            fputcsv($out, array_keys($cols));
            foreach ($rows as $r) {
                fputcsv($out, array_map(fn ($k) => $r[$k] ?? '', array_values($cols)));
            }
            fclose($out);
        }, $name.'.csv', ['Content-Type' => 'text/csv']);
    }
}
