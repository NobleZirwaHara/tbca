<?php

namespace App\Support\Portal;

use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Builders for the generic portal "register" page (resources/js/Pages/Portal/Register.tsx).
 * Every helper returns plain arrays that match resources/js/types/portal.ts.
 */
class Ui
{
    /* --- Cells ------------------------------------------------------------ */

    public static function ref(string $value, ?string $href = null): array
    {
        return ['t' => 'ref', 'v' => $value, 'href' => $href];
    }

    public static function pill(?string $value, ?string $tone = null): array
    {
        return ['t' => 'pill', 'v' => (string) $value, 'tone' => $tone];
    }

    public static function money(int|float|null $zar, bool $signed = false): array
    {
        return ['t' => 'money', 'v' => $zar === null ? null : (int) round($zar), 'signed' => $signed];
    }

    public static function progress(int|float $value, ?string $label = null): array
    {
        return ['t' => 'progress', 'v' => (int) round($value), 'label' => $label];
    }

    public static function link(string $label, string $href): array
    {
        return ['t' => 'link', 'v' => $label, 'href' => $href];
    }

    public static function stack(string $title, ?string $sub = null, ?string $href = null): array
    {
        return ['t' => 'stack', 'v' => $title, 'sub' => $sub, 'href' => $href];
    }

    public static function chips(array $values): array
    {
        return ['t' => 'chips', 'v' => array_values(array_filter($values))];
    }

    public static function person(string $name, ?string $sub = null): array
    {
        return ['t' => 'person', 'v' => $name, 'sub' => $sub];
    }

    /** @param list<array> $actions */
    public static function actions(array $actions): array
    {
        return ['t' => 'actions', 'v' => array_values(array_filter($actions))];
    }

    /* --- Actions ---------------------------------------------------------- */

    /**
     * A button/link. $method get = Link, post/put/delete = Inertia request.
     * Options: confirm, data, modal (form key), variant (gold|outline|ghost|danger), icon.
     */
    public static function action(string $label, ?string $href = null, string $method = 'get', array $opts = []): array
    {
        return array_merge(['label' => $label, 'href' => $href, 'method' => $method], $opts);
    }

    public static function modal(string $label, string $form, array $opts = []): array
    {
        return array_merge(['label' => $label, 'modal' => $form, 'method' => 'get'], $opts);
    }

    /* --- Blocks ----------------------------------------------------------- */

    public static function kpi(string $label, string|int|float $value, ?string $caption = null, string $tone = 'neutral', ?string $icon = null, ?string $href = null): array
    {
        return compact('label', 'value', 'caption', 'tone', 'icon', 'href');
    }

    /**
     * @param  list<array{label:string,value:int|float,display?:string,tone?:string}>  $items
     */
    public static function donut(string $title, array $items, string|int|null $center = null, ?string $centerLabel = 'Total', ?array $link = null): array
    {
        $center ??= array_sum(array_column($items, 'value'));

        return ['kind' => 'donut', 'title' => $title, 'items' => $items, 'center' => (string) $center, 'centerLabel' => $centerLabel, 'link' => $link];
    }

    public static function slice(string $label, int|float $value, string $tone, ?string $display = null): array
    {
        return compact('label', 'value', 'tone', 'display');
    }

    /** @param list<array{label:string,value?:string,sub?:string,tone?:string,href?:string}> $items */
    public static function list(string $title, array $items, ?array $link = null): array
    {
        return ['kind' => 'list', 'title' => $title, 'items' => $items, 'link' => $link];
    }

    public static function item(string $label, ?string $value = null, ?string $sub = null, ?string $tone = null, ?string $href = null): array
    {
        return array_filter(compact('label', 'value', 'sub', 'tone', 'href'), fn ($v) => $v !== null);
    }

    /** @param list<array> $actions */
    public static function quick(string $title, array $actions): array
    {
        return ['kind' => 'actions', 'title' => $title, 'items' => $actions];
    }

    public static function info(string $title, string $body, string $tone = 'info', ?array $cta = null): array
    {
        return ['kind' => 'info', 'title' => $title, 'body' => $body, 'tone' => $tone, 'cta' => $cta];
    }

    /** @param list<array{0:string,1:mixed}> $rows */
    public static function kv(string $title, array $rows, ?array $cta = null): array
    {
        return ['kind' => 'kv', 'title' => $title, 'rows' => array_map(fn ($r) => [$r[0], $r[1]], $rows), 'cta' => $cta];
    }

    /** @param list<array{label:string,value:int|float,display?:string,tone?:string}> $items */
    public static function bars(string $title, array $items, ?array $link = null): array
    {
        return ['kind' => 'bars', 'title' => $title, 'items' => $items, 'link' => $link];
    }

    public static function bar(string $label, int|float $value, ?string $display = null, ?string $tone = null): array
    {
        return compact('label', 'value', 'display', 'tone');
    }

    /** @param list<array{title:string,sub?:string,meta?:string,tone?:string}> $items */
    public static function timeline(string $title, array $items, ?array $link = null): array
    {
        return ['kind' => 'timeline', 'title' => $title, 'items' => $items, 'link' => $link];
    }

    public static function gauge(string $title, int|float $value, string $label, array $items = []): array
    {
        return ['kind' => 'gauge', 'title' => $title, 'value' => $value, 'label' => $label, 'items' => $items];
    }

    /** @param list<array{label:string,ok:bool|string,value?:string}> $items */
    public static function checklist(string $title, array $items): array
    {
        return ['kind' => 'checklist', 'title' => $title, 'items' => $items];
    }

    public static function check(string $label, bool|string $ok = true, ?string $value = null): array
    {
        return compact('label', 'ok', 'value');
    }

    /**
     * @param  list<string>  $columns
     * @param  list<list<mixed>>  $rows
     */
    public static function table(?string $title, array $columns, array $rows, array $opts = []): array
    {
        return array_merge(['kind' => 'table', 'title' => $title, 'columns' => $columns, 'rows' => $rows], $opts);
    }

    public static function steps(string $title, array $steps, int $current): array
    {
        return ['kind' => 'steps', 'title' => $title, 'steps' => $steps, 'current' => $current];
    }

    public static function text(string $title, string $body): array
    {
        return ['kind' => 'text', 'title' => $title, 'body' => $body];
    }

    public static function cards(string $title, array $cards, int $cols = 4): array
    {
        return ['kind' => 'cards', 'title' => $title, 'cards' => $cards, 'cols' => $cols];
    }

    public static function card(string $title, ?string $body = null, ?string $meta = null, ?string $href = null, ?string $icon = null, ?string $tone = null, array $actions = []): array
    {
        return compact('title', 'body', 'meta', 'href', 'icon', 'tone', 'actions');
    }

    public static function row(array $panels): array
    {
        return ['kind' => 'row', 'panels' => $panels];
    }

    public static function chart(string $title, array $labels, array $series, string $type = 'stacked', ?string $note = null): array
    {
        return ['kind' => 'chart', 'title' => $title, 'labels' => $labels, 'series' => $series, 'type' => $type, 'note' => $note];
    }

    /* --- Forms (opened by modal actions) ---------------------------------- */

    public static function form(string $title, string $action, array $fields, string $submit = 'Submit', string $method = 'post', ?string $intro = null): array
    {
        return compact('title', 'action', 'fields', 'submit', 'method', 'intro');
    }

    public static function field(string $name, string $label, string $type = 'text', array $opts = []): array
    {
        return array_merge(['name' => $name, 'label' => $label, 'type' => $type], $opts);
    }

    public static function options(array $values): array
    {
        return array_map(fn ($v, $k) => is_string($k) ? ['value' => $k, 'label' => $v] : ['value' => (string) $v, 'label' => (string) $v], $values, array_keys($values));
    }

    /* --- Querying --------------------------------------------------------- */

    /**
     * Filter a collection of associative arrays by ?q= (search fields), ?status= / ?tab= and other keys.
     *
     * @param  array<string,string>  $map  query key => row key
     */
    public static function filter(Collection $rows, Request $request, array $searchKeys, array $map = []): Collection
    {
        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            $needle = mb_strtolower($q);
            $rows = $rows->filter(function ($row) use ($searchKeys, $needle) {
                foreach ($searchKeys as $k) {
                    if (str_contains(mb_strtolower((string) data_get($row, $k, '')), $needle)) {
                        return true;
                    }
                }

                return false;
            });
        }

        foreach ($map as $queryKey => $rowKey) {
            $val = (string) $request->query($queryKey, '');
            if ($val !== '' && $val !== 'all') {
                $rows = $rows->filter(fn ($row) => is_callable($rowKey) ? $rowKey($row, $val) : mb_strtolower((string) data_get($row, $rowKey)) === mb_strtolower($val));
            }
        }

        return $rows->values();
    }

    /** Server-side pagination of an already-filtered collection. */
    public static function page(Collection $rows, Request $request, int $per = 10): array
    {
        $total = $rows->count();
        $pages = max(1, (int) ceil($total / $per));
        $page = min($pages, max(1, (int) $request->query('page', 1)));

        return [
            'items' => $rows->slice(($page - 1) * $per, $per)->values(),
            'pagination' => ['page' => $page, 'pages' => $pages, 'total' => $total, 'per' => $per],
        ];
    }

    public static function selectFilter(string $name, string $label, array $values): array
    {
        return ['name' => $name, 'label' => $label, 'options' => self::options($values)];
    }

    public static function tabs(array $tabs): array
    {
        return array_map(fn ($label, $key) => is_array($label) ? ['key' => $key, 'label' => $label[0], 'count' => $label[1]] : ['key' => $key, 'label' => $label], $tabs, array_keys($tabs));
    }

    public static function pct(int|float $part, int|float $whole, int $dp = 0): string
    {
        return $whole > 0 ? round($part / $whole * 100, $dp).'%' : '0%';
    }

    public static function zar(int|float|null $zar): string
    {
        return $zar === null ? '—' : 'R '.number_format((float) $zar, 2, '.', ',');
    }

    public static function date($date, string $format = 'd M Y'): string
    {
        return $date ? \Illuminate\Support\Carbon::parse($date)->format($format) : '—';
    }
}
