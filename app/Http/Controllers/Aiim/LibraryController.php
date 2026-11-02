<?php

namespace App\Http\Controllers\Aiim;

use App\Support\Aiim\ProtoLibrary;
use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\IntelData;
use App\Support\Industries\ServerTable;
use Illuminate\Http\Request;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Library pages of the client's "TBCA AIIM Botswana" prototype that carry no mock-up number:
 * Country Pack reader, Data Room (register index and one register per page, paged on the server),
 * coverage report, the embedded 581-service catalogue and service detail, the One-Stop Shop, the
 * prompt pack and the page index. Botswana carries the BW-1.0 pack; other countries show the same
 * template with a "country pack loading" state and the continental registers.
 */
class LibraryController extends AiimController
{
    /** Embedded services on the Data Room call to action (prototype Page "registers"). */
    private const DATA_SERVICES = ['AAB-EMB-218', 'AAB-EMB-219'];

    /* ------------------------------------------------------------------ Country Pack */

    public function pack(Request $request, string $slug): Response
    {
        $c = ProtoLibrary::country($slug);
        $this->select($request, ['country' => $c['name']]);
        $blocks = $c['isBW'] ? IntelData::docBlocks() : [];

        return $this->render($request, 'Aiim/Library/Pack', [
            'country' => $c,
            'blocks' => $blocks,
            'stats' => $c['isBW'] ? [
                'blocks' => count($blocks),
                'tables' => count(array_filter($blocks, fn ($b) => $b['t'] === 'tbl')),
                'words' => array_sum(array_map(fn ($b) => $b['t'] === 'p'
                    ? count(preg_split('/\s+/', (string) $b['x']))
                    : count(preg_split('/\s+/', implode(' ', array_map(fn ($r) => implode(' ', array_map('strval', $r)), $b['rows'])))), $blocks)),
            ] : null,
        ], 'Country Pack');
    }

    /* ------------------------------------------------------------------ Data Room */

    public function registers(Request $request, string $slug): Response
    {
        $c = ProtoLibrary::country($slug);
        $this->select($request, ['country' => $c['name']]);
        $idx = array_map(fn ($x) => ['sheet' => $x['sheet'], 'rows' => (int) $x['rows'], 'cols' => (int) $x['cols'], 'h' => array_slice(array_map('strval', $x['h'] ?? []), 0, 5)], CountryHub::registerIndex());
        // Countries without a pack still get the continental (I2_*) registers, which cover all 54.
        $visible = $c['isBW'] ? $idx : array_values(array_filter($idx, fn ($x) => str_starts_with($x['sheet'], 'I2_')));

        return $this->render($request, 'Aiim/Library/Registers', [
            'country' => $c,
            'index' => $visible,
            'totals' => ['rows' => array_sum(array_column($idx, 'rows')), 'cells' => array_sum(array_map(fn ($x) => $x['rows'] * $x['cols'], $idx)), 'sheets' => count($idx) - 1],
            'readme' => $c['isBW'] ? array_map(fn ($r) => (string) (array_values($r)[0] ?? ''), CountryHub::register('README')) : [],
            'services' => ProtoLibrary::rail(self::DATA_SERVICES),
        ], 'Data Room');
    }

    public function sheet(Request $request, string $slug, string $sheet): Response|StreamedResponse
    {
        $c = ProtoLibrary::country($slug);
        $x = IntelData::sheet($sheet);
        abort_unless($x !== null, 404);
        $available = $c['isBW'] || str_starts_with($sheet, 'I2_');
        $rows = $available ? CountryHub::register($sheet) : [];
        $h = IntelData::headers($sheet);
        $filters = $available ? IntelData::lowcard($rows, $h, 30) : [];
        if ($available && $request->query('csv')) {
            return ServerTable::csv($sheet, $rows, $request, $h, $h, array_combine($h, $h));
        }

        return $this->render($request, 'Aiim/Library/Sheet', [
            'country' => $c,
            'sheet' => $sheet,
            'headers' => $h,
            'rowCount' => (int) $x['rows'],
            'available' => $available,
            'filters' => $filters,
            'table' => $available ? ServerTable::make($rows, $request, $h, $filters, $h, 25) : null,
        ], 'Data Room');
    }

    /* ------------------------------------------------------------------ Coverage */

    public function coverage(Request $request, string $slug): Response
    {
        $c = ProtoLibrary::country($slug);
        $cov = CountryHub::meta('coverage') ?? [];
        $blocks = $c['isBW'] ? IntelData::docBlocks() : [];
        $rows = $c['isBW'] ? array_map(fn ($s) => [
            'sheet' => $s['sheet'], 'rows' => (int) $s['rows'], 'cols' => (int) $s['cols'], 'cells' => (int) $s['rows'] * (int) $s['cols'],
            'src' => $cov['sheets'][$s['sheet']] ?? null, 'pages' => ProtoLibrary::SHEETPAGES[$s['sheet']] ?? 'Data Room',
        ], CountryHub::registerIndex()) : [];

        return $this->render($request, 'Aiim/Library/Coverage', [
            'country' => $c,
            'summary' => $c['isBW'] ? ($cov['summary'] ?? '') : null,
            'kpis' => $c['isBW'] ? [
                'blocks' => count($blocks), 'blocksSrc' => $cov['doc']['blocks'] ?? null,
                'tables' => count(array_filter($blocks, fn ($b) => $b['t'] === 'tbl')), 'tablesSrc' => $cov['doc']['tables'] ?? null,
                'cells' => array_sum(array_column($rows, 'cells')), 'cellsSrc' => $cov['cells'] ?? null,
                'services' => count(ProtoLibrary::raw()),
            ] : null,
            'rows' => $rows,
        ], 'Coverage Report');
    }

    /* ------------------------------------------------------------------ Services */

    public function services(Request $request): Response
    {
        $cat = (string) $request->query('cat', '');
        $all = ProtoLibrary::raw();
        $by = array_count_values(array_column($all, 'cat'));
        arsort($by);
        abort_if($cat !== '' && ! isset($by[$cat]), 404);

        $list = array_values(array_filter($all, fn ($s) => $cat === '' || $s['cat'] === $cat));
        $rows = array_map(function ($s) {
            $x = ProtoLibrary::shape($s);

            return [
                'Code' => $x['code'], 'Service' => $x['name'], 'Module' => $x['cat'], 'Subcategory' => $x['sub'], 'Entry tier' => $x['et'],
                'From' => $x['from'], 'Delivery' => $x['db'], 'AAI now' => $x['a0'], 'AAI H2' => $x['a2'],
                'status' => $x['status'], 'internal' => $x['internal'], 'entry' => $x['entry'], 'ep' => $x['ep'],
            ];
        }, $list);
        $keys = ['Code', 'Service', 'Module', 'Subcategory', 'Entry tier', 'From', 'Delivery', 'AAI now', 'AAI H2', 'internal'];

        $journey = null;
        if ($cat === '' || $cat === 'AIIM') {
            $aiim = array_filter($all, fn ($s) => $s['cat'] === 'AIIM');
            $journey = array_map(function ($g) use ($aiim) {
                $l = array_values(array_filter($aiim, fn ($s) => ProtoLibrary::num($s['code']) >= $g[1] && ProtoLibrary::num($s['code']) <= $g[2]));

                return ['title' => $g[0], 'count' => count($l), 'items' => ProtoLibrary::rail(array_column(array_slice($l, 0, 5), 'code'))];
            }, ProtoLibrary::JOURNEY);
        }

        return $this->render($request, 'Aiim/Library/Services', [
            'cat' => $cat,
            'cats' => collect($by)->map(fn ($n, $k) => ['cat' => $k, 'n' => $n, 'section' => ProtoLibrary::SECTION_LINKS[$k] ?? null])->values(),
            'total' => count($all),
            'counts' => ['internal' => count(array_filter($all, fn ($s) => str_starts_with($s['code'], 'AAB-INT'))), 'aiim' => $by['AIIM'] ?? 0],
            'journey' => $journey,
            'section' => ProtoLibrary::SECTION_LINKS[$cat] ?? null,
            'table' => ServerTable::make($rows, $request, ['Code', 'Service', 'Module', 'Subcategory'], ['Module', 'Entry tier', 'Delivery'], $keys, 25),
        ], 'Embedded Services');
    }

    public function service(Request $request, string $code): Response
    {
        $s = ProtoLibrary::service($code);
        abort_unless($s !== null, 404);

        return $this->render($request, 'Aiim/Library/Service', [
            'svc' => $s,
            'section' => ProtoLibrary::SECTION_LINKS[$s['cat']] ?? null,
        ], 'Embedded Services');
    }

    /* ------------------------------------------------------------------ One-Stop Shop */

    public function onestop(Request $request): Response
    {
        $rows = CountryHub::register('BW_OneStopShop');
        $gates = array_count_values(array_map(fn ($r) => (string) $r['Gate'], $rows));
        arsort($gates);
        $lead = collect(ProtoLibrary::slice('PART C'))->first(fn ($b) => ($b['s'] ?? '') === 'First Paragraph');

        return $this->render($request, 'Aiim/Library/OneStop', [
            'lead' => $lead['x'] ?? '',
            'gates' => collect($gates)->map(fn ($n, $g) => ['label' => $g, 'value' => $n])->values(),
            'features' => $rows,
        ], 'One-Stop Shop');
    }

    /* ------------------------------------------------------------------ Prompts */

    public function prompts(Request $request): Response
    {
        return $this->render($request, 'Aiim/Library/Prompts', [
            'markdown' => (string) (CountryHub::meta('aiim_prompts') ?? ''),
            'master' => array_slice(ProtoLibrary::slice('B1.'), 1),
            'packPrompts' => ProtoLibrary::table('B2.') ?? [],
        ], 'Master Prompt');
    }

    /* ------------------------------------------------------------------ Page index */

    public function sitemap(Request $request): Response
    {
        return $this->render($request, 'Aiim/Library/Sitemap', ProtoLibrary::sitemap(), 'Page Index');
    }
}
