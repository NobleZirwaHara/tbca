<?php

namespace App\Support\Webinars;

/**
 * Block builders for the Webinars staff consoles. Each console is described as data
 * (KPI row, tabs of panels, right rail) and rendered by one React board component,
 * so a console can change without a front-end rebuild of its layout.
 *
 * Money values are whole ZAR and flagged with `money` so the front end formats them
 * in the visitor's selected currency.
 */
class Board
{
    public static function kpi(string $label, int|float|string $value, ?string $sub = null, ?string $delta = null, string $tone = 'blue', string $icon = 'users', bool $money = false, bool $down = false): array
    {
        return compact('label', 'value', 'sub', 'delta', 'tone', 'icon', 'money', 'down');
    }

    public static function panel(string $title, array $body, int $span = 4, ?array $action = null, ?string $icon = null): array
    {
        return ['type' => 'panel', 'title' => $title, 'body' => $body, 'span' => $span, 'action' => $action, 'icon' => $icon];
    }

    public static function act(string $label, ?string $href = null, string $method = 'get', array $data = [], string $tone = 'secondary', ?string $confirm = null, bool $download = false): array
    {
        return compact('label', 'href', 'method', 'data', 'tone', 'confirm', 'download');
    }

    /** @param array<int, array{0:string,1:string,2?:string}> $columns [key, label, kind] */
    public static function table(array $columns, array $rows, array $opts = []): array
    {
        return ['type' => 'table', 'columns' => array_map(fn ($c) => ['key' => $c[0], 'label' => $c[1], 'kind' => $c[2] ?? 'text'], $columns), 'rows' => array_values($rows)] + $opts;
    }

    public static function line(array $labels, array $series, array $opts = []): array
    {
        return ['type' => 'line', 'labels' => $labels, 'series' => $series] + $opts;
    }

    public static function bars(array $labels, array $series, array $opts = []): array
    {
        return ['type' => 'bars', 'labels' => $labels, 'series' => $series] + $opts;
    }

    public static function series(string $label, array $values, string $color = 'gold', string $kind = 'bar'): array
    {
        return compact('label', 'values', 'color', 'kind');
    }

    public static function hbars(array $rows, array $opts = []): array
    {
        return ['type' => 'hbars', 'rows' => $rows] + $opts;
    }

    public static function donut(array $slices, string $center, string $sub = '', array $opts = []): array
    {
        return ['type' => 'donut', 'slices' => $slices, 'center' => $center, 'sub' => $sub] + $opts;
    }

    public static function funnel(array $steps): array
    {
        return ['type' => 'funnel', 'steps' => $steps];
    }

    public static function checklist(array $items): array
    {
        return ['type' => 'checklist', 'items' => $items];
    }

    public static function steps(array $items): array
    {
        return ['type' => 'steps', 'items' => $items];
    }

    public static function toggles(array $items, string $endpoint): array
    {
        return ['type' => 'toggles', 'items' => $items, 'endpoint' => $endpoint];
    }

    public static function kv(array $rows): array
    {
        return ['type' => 'kv', 'rows' => $rows];
    }

    public static function insights(array $items): array
    {
        return ['type' => 'insights', 'items' => $items];
    }

    public static function metrics(array $items, int $cols = 2): array
    {
        return ['type' => 'metrics', 'items' => $items, 'cols' => $cols];
    }

    public static function text(string $body, string $tone = 'plain', ?string $title = null): array
    {
        return ['type' => 'text', 'body' => $body, 'tone' => $tone, 'title' => $title];
    }

    public static function buttons(array $acts, bool $stack = false): array
    {
        return ['type' => 'buttons', 'acts' => $acts, 'stack' => $stack];
    }

    /** @param array<int, array{name:string,label:string,type?:string,options?:array,required?:bool,value?:mixed}> $fields */
    public static function form(string $endpoint, array $fields, string $submit, array $hidden = [], string $method = 'post'): array
    {
        return ['type' => 'form', 'endpoint' => $endpoint, 'fields' => $fields, 'submit' => $submit, 'hidden' => $hidden, 'method' => $method];
    }

    public static function notes(string $endpoint, string $value, string $placeholder = 'Write notes here...'): array
    {
        return ['type' => 'notes', 'endpoint' => $endpoint, 'value' => $value, 'placeholder' => $placeholder];
    }

    public static function media(string $title, array $lines = [], ?string $badge = null, ?string $caption = null, array $thumbs = []): array
    {
        return ['type' => 'media', 'title' => $title, 'lines' => $lines, 'badge' => $badge, 'caption' => $caption, 'thumbs' => $thumbs];
    }

    public static function list(array $items): array
    {
        return ['type' => 'list', 'items' => $items];
    }

    public static function heatmap(array $points): array
    {
        return ['type' => 'heatmap', 'points' => $points];
    }

    public static function countdown(string $iso, string $label = ''): array
    {
        return ['type' => 'countdown', 'target' => $iso, 'label' => $label];
    }

    public static function stepper(array $steps, int $current): array
    {
        return ['type' => 'stepper', 'steps' => $steps, 'current' => $current];
    }

    public static function tab(string $key, string $label, array $blocks, ?int $count = null): array
    {
        return ['key' => $key, 'label' => $label, 'blocks' => $blocks, 'count' => $count];
    }

    public static function pct(int|float $n, int|float $d): int
    {
        return $d > 0 ? (int) round($n / $d * 100) : 0;
    }
}
