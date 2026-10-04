<?php

namespace App\Http\Controllers\CorePages;

use App\Http\Controllers\Controller;
use App\Models\CorePages\ToolEntitlement;
use App\Models\Order;
use App\Support\CorePages\ToolsCatalogue;
use App\Support\Platform\Checkout;
use App\Support\Platform\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Tools, Templates & Calculators: catalogue -> product (live calculator) -> checkout ->
 * shared payment -> entitlement -> My Downloads / Secure Download -> Download Complete.
 */
class ToolsController extends Controller
{
    public const LINK_DAYS = 7;

    public function index(Request $request, ?string $type = null): Response
    {
        abort_if($type !== null && ! array_key_exists($type, ToolsCatalogue::TYPES), 404);

        $query = $request->only(['need', 'audience', 'language', 'format', 'price', 'instant', 'search', 'sort']);
        $query['type'] = $type ?? $request->query('type');
        $view = $request->query('view') === 'list' ? 'list' : 'grid';

        return Inertia::render('CorePages/Tools/Catalogue', [
            'type' => $type,
            'products' => ToolsCatalogue::filter($query),
            'filters' => [...$query, 'view' => $view],
            'types' => ToolsCatalogue::TYPES,
            'needs' => ToolsCatalogue::needs(),
            'audiences' => ToolsCatalogue::audiences(),
            'saved' => $request->user()?->savedItems()->where('item_type', 'tool')->pluck('item_key') ?? [],
        ]);
    }

    public function show(Request $request, string $type, string $slug): Response
    {
        $product = ToolsCatalogue::find($type, $slug) ?? abort(404);
        $inputs = $product['calculator'] ? ToolsCatalogue::inputsFor($product['calculator'], $request->query()) : [];

        return Inertia::render('CorePages/Tools/Product', [
            'product' => $product,
            'typeLabel' => ToolsCatalogue::TYPES[$type],
            'calculator' => $product['calculator'] ? [
                'inputs' => ToolsCatalogue::calculatorInputs($product['calculator']),
                'values' => $inputs,
                'result' => ToolsCatalogue::calculate($product['calculator'], $inputs),
            ] : null,
            'licences' => collect(ToolsCatalogue::LICENCES)->map(fn ($l, $k) => ['key' => $k, 'label' => $l['label'], 'zar' => (int) round($product['zar'] * $l['multiplier'])])->values(),
            'related' => collect(ToolsCatalogue::products())->where('type', $type)->where('slug', '!=', $slug)->take(4)->values(),
            'isSaved' => (bool) $request->user()?->savedItems()->where('item_type', 'tool')->where('item_key', $slug)->exists(),
            'owned' => $request->user() ? ToolEntitlement::where('user_id', $request->user()->id)->where('product_slug', $slug)->value('token') : null,
        ]);
    }

    public function checkout(Request $request, string $type, string $slug): Response
    {
        $product = ToolsCatalogue::find($type, $slug) ?? abort(404);
        $user = $request->user();
        $names = explode(' ', (string) $user?->name, 2);

        return Inertia::render('CorePages/Tools/Checkout', [
            'product' => $product,
            'typeLabel' => ToolsCatalogue::TYPES[$type],
            'licences' => collect(ToolsCatalogue::LICENCES)->map(fn ($l, $k) => ['key' => $k, 'label' => $l['label'], 'licence' => $l['licence'], 'zar' => (int) round($product['zar'] * $l['multiplier'])])->values(),
            'selected' => $request->query('licence', 'single'),
            'quotes' => collect(['card', 'eft', 'wallet'])->mapWithKeys(fn ($m) => [$m => Money::fees(1000, $m)])->all(),
            'commerce' => [
                'vat_rate' => (float) config('tbca.commerce.vat_rate'),
                'platform_fee' => (int) config('tbca.commerce.platform_fee_zar'),
                'bank_rates' => config('tbca.commerce.bank_charge_rates'),
            ],
            'billing' => [
                'first_name' => $user ? $names[0] : '',
                'last_name' => $user ? ($names[1] ?? '') : '',
                'company' => $user?->company ?? '',
                'email' => $user?->email ?? '',
                'phone' => $user?->phone ?? '',
                'country' => 'South Africa',
                'city' => '',
                'vat_number' => '',
            ],
        ]);
    }

    public function placeOrder(Request $request, string $type, string $slug): RedirectResponse
    {
        $product = ToolsCatalogue::find($type, $slug) ?? abort(404);

        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'company' => ['required', 'string', 'max:190'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'min:7', 'max:30'],
            'country' => ['required', 'string', 'max:80'],
            'city' => ['nullable', 'string', 'max:80'],
            'vat_number' => ['nullable', 'string', 'max:30'],
            'licence' => ['required', Rule::in(array_keys(ToolsCatalogue::LICENCES))],
            'language' => ['required', Rule::in(['English', 'Afrikaans'])],
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'method' => ['required', Rule::in(['card', 'eft', 'wallet'])],
            'accept_terms' => ['accepted'],
            'accept_delivery' => ['accepted'],
        ], [
            'accept_terms.accepted' => 'Please accept the Terms and Conditions and the Digital Products Disclaimer Policy.',
            'accept_delivery.accepted' => 'Please confirm you understand the product is delivered digitally.',
        ]);

        if ($data['language'] === 'Afrikaans' && ! in_array('AF', $product['languages'], true)) {
            return back()->withErrors(['language' => 'This product is not yet available in Afrikaans.']);
        }

        $licence = ToolsCatalogue::LICENCES[$data['licence']];
        $order = Checkout::createOrder([[
            'item_type' => 'digital-tool',
            'item_code' => $product['slug'],
            'name' => $product['title'],
            'unit_zar' => (int) round($product['zar'] * $licence['multiplier']),
            'variant' => $licence['label'],
            'quantity' => $data['quantity'],
            'meta' => ['type' => $type, 'language' => $data['language'], 'licence' => $licence['licence']],
        ]], $request->user(), 'tools', [
            'title' => $product['title'],
            'preferred_method' => $data['method'],
            'return_url' => '/tools/orders/{order}/complete',
        ]);

        $order->update([
            'billing' => [
                'name' => trim($data['first_name'].' '.$data['last_name']),
                'email' => $data['email'],
                'phone' => $data['phone'],
                'company' => $data['company'],
                'country' => $data['country'],
                'city' => $data['city'] ?? null,
                'vat_number' => $data['vat_number'] ?? null,
            ],
            'meta' => [...$order->meta, 'return_url' => "/tools/orders/{$order->reference}/complete"],
        ]);

        $request->session()->push('tool_orders', $order->reference);

        return redirect()->route('checkout.show', $order);
    }

    /** Return point after the shared payment page: grant entitlements for a paid order. */
    public function complete(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeOrder($request, $order);
        abort_unless($order->section === 'tools', 404);

        if (! $order->isPaid()) {
            return redirect()->route('checkout.show', $order)->with('error', 'Payment has not been confirmed yet.');
        }

        $entitlements = $this->grant($order);
        $count = $entitlements->count();

        if ($request->user()) {
            return redirect()->route('core.tools.downloads')->with('success', "Order successfully added to your downloads. {$count} new download".($count === 1 ? '' : 's').' available.');
        }

        return redirect()->route('core.tools.secure', $entitlements->first())->with('success', 'Payment confirmed. Your download is ready.');
    }

    public function downloads(Request $request): Response
    {
        $user = $request->user();
        $tab = $request->query('tab', 'all');
        $search = (string) $request->query('search', '');

        $entitlements = ToolEntitlement::with('order.payments')
            ->where(fn ($q) => $q->where('user_id', $user->id)->orWhere(fn ($q) => $q->whereNull('user_id')->where('email', $user->email)))
            ->latest()
            ->get();

        $items = $entitlements->map(fn (ToolEntitlement $e) => $this->presentEntitlement($e));

        $files = $items->flatMap(fn ($e) => [
            ['item' => $e['name'], 'type' => $e['type_label'], 'format' => $e['format'], 'added' => $e['added'], 'size' => $e['size'], 'status' => $e['expired'] ? 'Link expired' : 'Ready', 'href' => "/tools/downloads/{$e['token']}", 'group' => $e['type'] === 'calculators' ? 'calculators' : 'documents', 'recent' => $e['recent']],
            ['item' => 'Payment Receipt – '.$e['name'], 'type' => 'Document', 'format' => 'PDF', 'added' => $e['added'], 'size' => '84 KB', 'status' => 'Ready', 'href' => "/checkout/{$e['order_reference']}/confirmation", 'group' => 'documents', 'recent' => $e['recent']],
            ['item' => 'Purchase Invoice', 'type' => 'Document', 'format' => 'PDF', 'added' => $e['added'], 'size' => '96 KB', 'status' => 'Ready', 'href' => "/checkout/{$e['order_reference']}/confirmation", 'group' => 'documents', 'recent' => $e['recent']],
            ['item' => 'Quick Start Guide', 'type' => 'Document', 'format' => 'PDF', 'added' => $e['added'], 'size' => '1.1 MB', 'status' => 'Ready', 'href' => "/tools/downloads/{$e['token']}", 'group' => 'documents', 'recent' => $e['recent']],
        ])
            ->when($tab === 'calculators', fn ($c) => $c->where('group', 'calculators'))
            ->when($tab === 'documents', fn ($c) => $c->where('group', 'documents'))
            ->when($tab === 'recent', fn ($c) => $c->where('recent', true))
            ->when($search !== '', fn ($c) => $c->filter(fn ($f) => str_contains(strtolower($f['item']), strtolower($search))))
            ->values();

        return Inertia::render('CorePages/Tools/Downloads', [
            'featured' => $items->first(),
            'files' => $files,
            'stats' => [
                'total' => $files->count(),
                'ready' => $files->where('status', 'Ready')->count(),
                'recent' => $items->first() ? ['date' => $items->first()['added_date'], 'name' => $items->first()['name']] : null,
                'downloaded' => $entitlements->sum('download_count'),
            ],
            'filters' => ['tab' => $tab, 'search' => $search],
        ]);
    }

    public function secure(Request $request, ToolEntitlement $entitlement): Response
    {
        $this->authorizeEntitlement($request, $entitlement);

        return Inertia::render('CorePages/Tools/SecureDownload', [
            'entitlement' => $this->presentEntitlement($entitlement->load('order.payments')),
            'complete' => false,
        ]);
    }

    public function success(Request $request, ToolEntitlement $entitlement): Response
    {
        $this->authorizeEntitlement($request, $entitlement);

        return Inertia::render('CorePages/Tools/SecureDownload', [
            'entitlement' => $this->presentEntitlement($entitlement->load('order.payments')),
            'complete' => true,
        ]);
    }

    public function file(Request $request, ToolEntitlement $entitlement): HttpResponse
    {
        $this->authorizeEntitlement($request, $entitlement);
        if ($entitlement->isExpired()) {
            return redirect()->route('core.tools.secure', $entitlement)->with('error', 'This download link has expired. Re-issue it from My Downloads.');
        }

        $product = ToolsCatalogue::findBySlug($entitlement->product_slug) ?? abort(404);
        $entitlement->increment('download_count');
        $entitlement->update(['last_downloaded_at' => now()]);
        $file = ToolsCatalogue::downloadContent($product);

        return response($file['content'], 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$file['filename'].'"',
        ]);
    }

    /** Attach a guest purchase to the signed-in client's downloads, or re-issue an expired link. */
    public function claim(Request $request, ToolEntitlement $entitlement): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeEntitlement($request, $entitlement);
        abort_if($entitlement->user_id !== null && $entitlement->user_id !== $user->id, 403);

        $entitlement->update(['user_id' => $user->id, 'expires_at' => now()->addDays(self::LINK_DAYS)]);

        return redirect()->route('core.tools.downloads')->with('success', "{$entitlement->product_name} saved to My Downloads.");
    }

    private function grant(Order $order)
    {
        return $order->items()->where('item_type', 'digital-tool')->get()->map(function ($item) use ($order) {
            $product = ToolsCatalogue::findBySlug($item->item_code);

            return ToolEntitlement::firstOrCreate(
                ['order_id' => $order->id, 'product_slug' => $item->item_code],
                [
                    'token' => Str::random(48),
                    'user_id' => $order->user_id,
                    'product_name' => $product['title'] ?? $item->name,
                    'licence' => $item->meta['licence'] ?? 'Single-User / One-off',
                    'language' => $item->meta['language'] ?? 'English',
                    'email' => $order->billing['email'] ?? null,
                    'expires_at' => now()->addDays(self::LINK_DAYS),
                ]
            );
        });
    }

    private function presentEntitlement(ToolEntitlement $e): array
    {
        $product = ToolsCatalogue::findBySlug($e->product_slug) ?? [];
        $payment = $e->order?->payments?->where('status', 'succeeded')->last();
        $size = $product['size_kb'] ?? 300;

        return [
            'token' => $e->token,
            'name' => $e->product_name,
            'slug' => $e->product_slug,
            'type' => $product['type'] ?? 'calculators',
            'type_label' => ToolsCatalogue::TYPES[$product['type'] ?? 'calculators'],
            'format' => $product['calculator'] ?? false ? 'XLSX' : strtoupper(($product['formats'][0] ?? 'PDF') === 'Excel' ? 'XLSX' : ($product['formats'][0] ?? 'PDF')),
            'language' => $e->language,
            'languages' => collect($product['languages'] ?? ['EN'])->map(fn ($l) => $l === 'AF' ? 'Afrikaans' : 'English')->implode(' | '),
            'licence' => $e->licence,
            'version' => $product['version'] ?? '1.0',
            'size' => $size >= 1024 ? round($size / 1024, 1).' MB' : $size.' KB',
            'added' => $e->created_at->format('d M Y, H:i'),
            'added_date' => $e->created_at->format('d M Y'),
            'recent' => $e->created_at->gt(now()->subDays(7)),
            'expires' => $e->expires_at->format('d M Y'),
            'expired' => $e->isExpired(),
            'downloads' => $e->download_count,
            'last_downloaded' => $e->last_downloaded_at?->format('d M Y, H:i').($e->last_downloaded_at ? ' SAST' : ''),
            'order_reference' => $e->order?->reference,
            'purchase_date' => $e->order?->paid_at?->format('d M Y, H:i') ?? $e->created_at->format('d M Y, H:i'),
            'payment_reference' => $payment?->reference ?? '—',
            'amount' => $e->order?->total_zar ?? 0,
            'method' => $payment ? match ($payment->method) {
                'card' => ($payment->meta['brand'] ?? 'Card').' •••• '.($payment->meta['last4'] ?? '••••'),
                'eft' => 'EFT / Bank Transfer',
                default => 'Secure Wallet',
            } : '—',
            'product_href' => isset($product['type']) ? "/tools/{$product['type']}/{$e->product_slug}" : '/tools',
            'owned_by_user' => $e->user_id !== null,
        ];
    }

    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user();
        abort_unless(
            ($user && ($order->user_id === $user->id || $user->isAdmin()))
            || in_array($order->reference, $request->session()->get('tool_orders', []), true),
            403
        );
    }

    /** The token itself is the bearer secret for guests; signed-in owners always have access. */
    private function authorizeEntitlement(Request $request, ToolEntitlement $entitlement): void
    {
        $user = $request->user();
        if ($user && $entitlement->user_id !== null && $entitlement->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403);
        }
    }
}
