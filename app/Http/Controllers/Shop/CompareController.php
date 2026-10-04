<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Shop\Product;
use App\Support\Shop\ProductPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Side-by-side comparison of up to four Product Masters (OS-009). */
class CompareController extends Controller
{
    public const MAX = 4;

    public function show(Request $request): Response
    {
        $codes = collect(explode(',', (string) $request->query('items', '')))
            ->map(fn ($c) => strtoupper(trim($c)))->filter()->unique()->take(self::MAX)->values();

        $products = Product::query()->listed()->whereIn('code', $codes)->get()
            ->sortBy(fn ($p) => $codes->search($p->code))->values()
            ->map(function (Product $p) {
                $d = ProductPresenter::detail($p);
                $c = $d['content'];

                return [
                    ...ProductPresenter::card($p),
                    'rows' => [
                        'commercial_act' => $d['act_label'],
                        'best_for' => $p->best_for,
                        'format_access' => $c['format_access'] ?? $p->output_format,
                        'delivery' => $p->delivery,
                        'human_review' => in_array($p->act, ['A2', 'A7'], true) ? 'Self-Service' : 'Included',
                        'key_outcome' => $c['key_outcome'] ?? null,
                        'includes' => $c['includes_summary'] ?? null,
                        'updates' => $c['updates'] ?? null,
                        'support' => $c['support'] ?? null,
                        'licence' => $c['licence_usage'] ?? null,
                    ],
                ];
            });

        $q = trim((string) $request->query('q', ''));
        $candidates = Product::query()->listed()
            ->when($q !== '', fn ($query) => $query->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('code', 'like', "%{$q}%")))
            ->whereNotIn('code', $codes)->whereIn('act', ['A1', 'A2', 'A3'])
            ->orderByDesc('featured')->orderBy('name')->take($q !== '' ? 8 : 4)->get()
            ->map(fn ($p) => ProductPresenter::card($p));

        return Inertia::render('Shop/Compare', [
            'products' => $products,
            'candidates' => $candidates,
            'codes' => $codes,
            'q' => $q,
            'max' => self::MAX,
            'shareUrl' => url('/shop/compare?items='.$codes->implode(',')),
            'slugHint' => Str::slug($q),
        ]);
    }

    /** CSV export of the current comparison. */
    public function export(Request $request)
    {
        $codes = collect(explode(',', (string) $request->query('items', '')))->map(fn ($c) => strtoupper(trim($c)))->filter()->take(self::MAX);
        $products = Product::query()->whereIn('code', $codes)->get();

        $rows = [['Criteria', ...$products->pluck('name')->all()]];
        $fields = ['Code' => 'code', 'Commercial Act' => fn ($p) => $p->actLabel(), 'Best For' => 'best_for', 'Delivery Time' => 'delivery',
            'Output' => 'output_format', 'Price (Excl. VAT)' => fn ($p) => $p->price_zar ? 'ZAR '.number_format($p->price_zar).($p->price_unit ? ' /'.$p->price_unit : '') : 'On request'];
        foreach ($fields as $label => $f) {
            $rows[] = [$label, ...$products->map(fn ($p) => is_callable($f) ? $f($p) : $p->{$f})->all()];
        }

        $csv = collect($rows)->map(fn ($r) => collect($r)->map(fn ($v) => '"'.str_replace('"', '""', (string) $v).'"')->implode(','))->implode("\n");

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="tbca-comparison.csv"',
        ]);
    }
}
