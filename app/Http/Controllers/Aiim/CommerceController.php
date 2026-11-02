<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Engagement;
use App\Models\Aiim\Entitlement;
use App\Models\Aiim\Project;
use App\Models\Aiim\Quote;
use App\Models\Aiim\WalletTransaction;
use App\Models\Order;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\Fulfilment;
use App\Support\Aiim\Grades;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\ProtoAccount;
use App\Support\Aiim\Refs;
use App\Support\Aiim\WalletService;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Response;
use RuntimeException;

/**
 * Buying journey (mock-ups 25 to 33): fee discovery and the itemised fee manifest, locked
 * premium objects with metered unlock approval, the AIIM wallet, secure checkout, payment
 * processing and confirmation, and entitlement unlock.
 */
class CommerceController extends AiimController
{
    private const FEE_TYPES = ['opportunity', 'project', 'investor', 'funder', 'corridor', 'source', 'service', 'template'];

    /** Buying journey steps (prototype BUY). */
    public const STEPS = ['Discover', 'Manifest', 'Approve', 'Pay', 'Confirm', 'Unlock'];

    /* ------------------------------------------------------ fee discovery */

    private function feeItems(Request $request): array
    {
        return $request->session()->get('aiim.fee_items', []);
    }

    /**
     * Resolve a fee item: embedded services and Botswana templates are priced from the app's
     * Sprint record of the service; catalogue objects through the fee-code manifest.
     */
    private function resolveItem(array $i): ?array
    {
        if ($i['type'] === 'service' || $i['type'] === 'template') {
            $code = $i['type'] === 'service' ? $i['key'] : ProtoAccount::UNLOCK_SERVICE;
            $svc = ProtoAccount::service($code);
            if (! $svc || $svc['price'] === null || ($i['type'] === 'template' && ! ProtoAccount::template($i['key']))) {
                return null;
            }
            $label = $i['type'] === 'service' ? $svc['name'] : "{$i['key']} full record";

            return ['type' => $i['type'], 'key' => $i['key'], 'label' => $label, 'code' => $code, 'service' => $svc['name'], 'context' => $i['ctx'] ?? ($i['type'] === 'template' ? $label : ''), 'delivery' => $svc['delivery'], 'price' => $svc['price'], 'confidence' => 100, 'url' => $i['type'] === 'service' ? "/aiim/services/{$code}" : "/aiim/unlock/{$i['key']}"];
        }
        $c = Catalogue::card($i['type'], $i['key']);

        return $c ? ['type' => $i['type'], 'key' => $c['key'], 'label' => $c['name'], 'code' => null, 'service' => Catalogue::typeLabel($i['type']).' premium record', 'context' => $c['name'], 'delivery' => 'On payment', 'price' => null, 'confidence' => $c['confidence'], 'url' => $c['url']] : null;
    }

    /** Fee lines and totals for resolved items: one line per service, the fee-code manifest for catalogue objects. */
    private function priceItems(array $items): array
    {
        $lines = [];
        foreach ($items as $i) {
            if ($i['code']) {
                $lines[] = ['code' => $i['code'], 'label' => $i['label'], 'description' => $i['context'], 'basis' => $i['delivery'], 'unit' => (float) $i['price'], 'quantity' => 1, 'amount' => (float) $i['price'], 'notes' => $i['service'], 'name' => $i['service']];
            }
        }
        $catalogue = array_values(array_filter($items, fn ($i) => ! $i['code']));
        if ($catalogue) {
            foreach (Pricing::manifest(array_map(fn ($i) => ['type' => $i['type'], 'key' => $i['key'], 'label' => $i['label']], $catalogue))['lines'] as $l) {
                $lines[] = $l + ['description' => $l['description'] ?? '', 'basis' => $l['basis'] ?? ''];
            }
        }

        return Pricing::totals($lines);
    }

    private function resolvedItems(Request $request): array
    {
        return array_values(array_filter(array_map(fn ($i) => $this->resolveItem($i), $this->feeItems($request))));
    }

    public function discover(Request $request): Response
    {
        $items = $this->resolvedItems($request);

        return $this->render($request, 'Aiim/Commerce/FeeDiscovery', [
            'items' => $items,
            'estimate' => $this->priceItems($items),
            'prices' => ProtoAccount::entryPrices(),
            'journey' => ProtoAccount::journey(),
            'steps' => self::STEPS,
        ], 'Fee Discovery ('.count($items).' items)');
    }

    public function addFeeItem(Request $request): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', Rule::in(self::FEE_TYPES)], 'key' => ['required', 'string', 'max:120'], 'ctx' => ['nullable', 'string', 'max:190']]);
        $resolved = $this->resolveItem($data);
        if (! $resolved && in_array($data['type'], ['service', 'template'], true)) {
            return back()->with('error', 'This service is not in the app catalogue yet.');
        }
        abort_unless($resolved, 404);
        $items = collect($this->feeItems($request));
        if (! $items->contains(fn ($i) => $i['type'] === $data['type'] && $i['key'] === $resolved['key'])) {
            $items->push(array_filter(['type' => $data['type'], 'key' => $resolved['key'], 'ctx' => $data['ctx'] ?? null]));
        }
        $request->session()->put('aiim.fee_items', $items->take(20)->values()->all());

        if (in_array($data['type'], ['service', 'template'], true)) {
            return back()->with('success', "Added {$resolved['label']} to the fee manifest.");
        }

        return redirect('/aiim/fees/discover')->with('success', "{$resolved['label']} added for pricing.");
    }

    public function removeFeeItem(Request $request): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', 'string'], 'key' => ['required', 'string']]);
        $request->session()->put('aiim.fee_items', collect($this->feeItems($request))->reject(fn ($i) => $i['type'] === $data['type'] && $i['key'] === $data['key'])->values()->all());

        return back();
    }

    public function clearFeeItems(Request $request): RedirectResponse
    {
        $request->session()->forget('aiim.fee_items');

        return back();
    }

    /** G2: issue a free, itemised fee manifest with a version hash and validity window. */
    public function createManifest(Request $request): RedirectResponse
    {
        $items = collect($this->resolvedItems($request));
        if ($items->isEmpty()) {
            return back()->with('error', 'Your manifest is empty. Add a service first.');
        }
        $blocked = $items->first(fn ($i) => ! $i['code'] && ! Grades::sellable($i['confidence']));
        if ($blocked) {
            return back()->with('error', "{$blocked['label']} is below the sellability confidence threshold and cannot be sold yet.");
        }

        $totals = $this->priceItems($items->all());
        $stored = $items->map(fn ($i) => ['type' => $i['type'], 'key' => $i['key'], 'label' => $i['label'], 'confidence' => $i['confidence'], 'context' => $i['context']])->all();
        $quote = Quote::create([
            'reference' => 'AIIM-QUOTE-'.now()->format('Ymd').'-'.strtoupper(substr(md5(uniqid('', true)), 0, 4)),
            'user_id' => $request->user()->id,
            'items' => $stored,
            'lines' => $totals['lines'],
            'subtotal_zar' => $totals['subtotal'],
            'vat_zar' => $totals['vat'],
            'total_zar' => $totals['total'],
            'hash' => hash('sha256', json_encode([$stored, $totals['lines']])),
            'valid_until' => now()->addDays(7),
        ]);

        return redirect("/aiim/fees/{$quote->reference}");
    }

    public function manifest(Request $request, Quote $quote): Response
    {
        abort_unless($quote->user_id === $request->user()->id, 403);
        $expired = $quote->status === 'pending' && $quote->valid_until->isPast();

        return $this->render($request, 'Aiim/Commerce/FeeManifest', [
            'quote' => [
                'reference' => $quote->reference, 'issued' => $quote->created_at->format('j M Y'), 'validUntil' => $quote->valid_until->format('j M Y'),
                'status' => $expired ? 'expired' : $quote->status, 'items' => $quote->items, 'lines' => $quote->lines,
                'subtotal' => (float) $quote->subtotal_zar, 'vat' => (float) $quote->vat_zar, 'total' => (float) $quote->total_zar, 'hash' => substr($quote->hash, 0, 12),
                'order' => $quote->order?->reference,
            ],
            'wallet' => WalletService::balance($request->user()),
            'steps' => self::STEPS,
        ], 'Fee Manifest');
    }

    /** G3 acceptance of the manifest: an order for secure checkout, or an immediate wallet debit. */
    public function checkoutManifest(Request $request, Quote $quote): RedirectResponse
    {
        abort_unless($quote->user_id === $request->user()->id, 403);
        if ($quote->status === 'paid') {
            return back()->with('error', 'This quote has already been paid.');
        }
        if ($quote->valid_until->isPast()) {
            return back()->with('error', 'This quote has expired. Please request a new fee manifest.');
        }
        $data = $request->validate(['method' => ['nullable', Rule::in(['checkout', 'wallet'])]]);

        $order = $quote->order && ! $quote->order->isPaid() ? $quote->order : Checkout::createOrder(
            collect($quote->lines)->map(fn ($l) => ['item_type' => 'aiim-fee', 'item_code' => $l['code'], 'name' => $l['label'], 'unit_zar' => (int) round($l['amount']), 'meta' => ['quote' => $quote->reference]])->all(),
            $request->user(), 'aiim',
            ['title' => 'AIIM premium intelligence', 'aiim' => ['kind' => 'manifest', 'quote' => $quote->reference, 'label' => count($quote->items).' items from fee manifest '.$quote->reference]],
        );
        if (! isset($order->meta['return_url'])) {
            $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);
        }
        $quote->update(['order_id' => $order->id]);

        if (($data['method'] ?? null) === 'wallet') {
            try {
                $this->payFromWallet($request, $order);
            } catch (RuntimeException $e) {
                return redirect('/aiim/wallet')->with('error', $e->getMessage());
            }

            return redirect("/aiim/checkout/{$order->reference}/success");
        }

        return redirect("/aiim/checkout/{$order->reference}");
    }

    /**
     * Pay an AIIM order from wallet credits. Credits are bought VAT-inclusive, so the wallet is
     * debited the ex-VAT subtotal; the order is then settled through the shared checkout.
     */
    private function payFromWallet(Request $request, Order $order, array $billing = []): void
    {
        abort_if(($order->meta['aiim']['kind'] ?? null) === 'topup', 422, 'Wallet credits cannot buy wallet credits.');
        DB::transaction(function () use ($request, $order, $billing) {
            WalletService::debit($request->user(), (float) $order->subtotal_zar, 'Payment: '.($order->meta['aiim']['label'] ?? $order->meta['title'] ?? $order->reference), $order->reference);
            Checkout::pay($order, 'wallet', [], $billing + ['name' => $request->user()->name, 'email' => $request->user()->email]);
        });
        Fulfilment::settle($order->refresh());
    }

    /* --------------------------------------------- locked object & unlock */

    private function project(string $code): Project
    {
        $p = Project::query()->where('code', $code)->firstOrFail();
        abort_unless($p->premium, 404);

        return $p;
    }

    /** Teaser keys shown free on a template (prototype locked page). */
    private const TEASER = ['Opp ID', 'Opportunity', 'Sector', 'Band', 'Tier', 'Score', 'RA', 'Time to revenue', 'Rank'];

    /** Locked-object payload for a Botswana template or a premium project; the full record only when entitled. */
    private function lockedObject(Request $request, string $code): array
    {
        if (ProtoAccount::isTemplate($code)) {
            $o = ProtoAccount::template($code);
            $ent = $this->entitled($request->user(), 'template', $code);
            $locked = array_values(array_diff(array_keys($o), self::TEASER));

            return [
                'code' => $code, 'kind' => 'template', 'name' => (string) $o['Opportunity'], 'title' => "{$code} full record", 'url' => ProtoAccount::oppUrl($code),
                'lead' => 'The teaser is free. The full 60-field record, counterparty list and pre-feasibility outline are premium.',
                'teaser' => [['Opportunity', (string) $o['Opportunity']], ['Sector', ProtoAccount::sectorName($o['Sector'] ?? null)], ['Band', (string) ($o['Band'] ?? '')], ['Tier', (string) ($o['Tier'] ?? '')], ['Score / RA', ($o['Score'] ?? '').' / '.($o['RA'] ?? '')], ['Time to revenue', (string) ($o['Time to revenue'] ?? '')]],
                'locked' => $locked,
                'full' => $ent ? array_map(fn ($k) => [$k, (string) $o[$k]], $locked) : null,
                'entitlement' => $ent?->reference,
                'tierKey' => 'Tier',
            ];
        }

        $p = $this->project($code);
        $ent = $this->entitled($request->user(), 'project', $p->code);
        $item = Catalogue::project($p);
        $this->select($request, ['province' => $p->province_slug, 'sector' => $p->sector_slug, 'item' => $p->name]);

        return [
            'code' => $p->code, 'kind' => 'project', 'name' => $p->name, 'title' => $p->premium['title'] ?? 'Detailed financial model', 'url' => $item['kind'] === 'project' ? "/aiim/projects/{$p->slug}" : "/aiim/opportunities/{$p->slug}",
            'lead' => 'The teaser is free. The '.strtolower($p->premium['title'] ?? 'detailed financial model').' and the full premium record are metered.',
            'teaser' => [['Opportunity', $p->name], ['Sector', $item['sectorName']], ['Investment size', $item['size']], ['Stage', (string) $p->stage], ['Score', (string) $item['score']], ['Location', (string) $p->location]],
            'locked' => array_values($p->premium['locked'] ?? []),
            'full' => null,
            'entitlement' => $ent?->reference,
            'tierKey' => null,
        ];
    }

    public function locked(Request $request, string $code): Response
    {
        $object = $this->lockedObject($request, $code);
        $price = $object['kind'] === 'project' ? Pricing::unlock($this->project($code))['subtotal'] : (ProtoAccount::service(ProtoAccount::UNLOCK_SERVICE)['price'] ?? null);

        return $this->render($request, 'Aiim/Commerce/Locked', [
            'object' => $object,
            'price' => $price,
            'services' => ProtoAccount::rail(['AAB-EMB-139', 'AAB-EMB-140', 'AAB-EMB-201'], 3),
        ], 'Locked Premium Object');
    }

    public function approval(Request $request, string $code): Response|RedirectResponse
    {
        $object = $this->lockedObject($request, $code);
        if ($object['entitlement']) {
            return redirect("/aiim/workspace/entitlements/{$object['entitlement']}")->with('success', 'You already hold an active entitlement to this object.');
        }
        $charge = $object['kind'] === 'project' ? Pricing::unlock($this->project($code))['subtotal'] : (ProtoAccount::service(ProtoAccount::UNLOCK_SERVICE)['price'] ?? null);

        return $this->render($request, 'Aiim/Commerce/UnlockApproval', [
            'object' => ['code' => $object['code'], 'kind' => $object['kind'], 'title' => $object['kind'] === 'template' ? $object['title'] : "{$object['name']}: {$object['title']}"],
            'charge' => $charge,
            'wallet' => WalletService::balance($request->user()),
            'steps' => self::STEPS,
        ], 'Metered Unlock Approval');
    }

    public function approve(Request $request, string $code): RedirectResponse
    {
        if (ProtoAccount::isTemplate($code)) {
            return $this->approveTemplate($request, $code);
        }

        $p = $this->project($code);
        $data = $request->validate([
            'authoriser' => ['nullable', 'string', 'max:120'],
            'purpose' => ['nullable', 'string', 'max:120'],
            'method' => ['required', Rule::in(['wallet', 'card'])],
            'extra_views' => ['nullable', 'integer', 'min:0', 'max:10'],
            'confirm' => ['accepted_if:method,wallet'],
        ], ['confirm.accepted' => 'Please approve the wallet debit.']);

        if (! Grades::sellable($p->confidence)) {
            return back()->with('error', 'This object is below the minimum confidence threshold and cannot be unlocked yet.');
        }
        if ($ent = $this->entitled($request->user(), 'project', $p->code)) {
            return redirect("/aiim/workspace/entitlements/{$ent->reference}");
        }

        $price = Pricing::unlock($p, (int) ($data['extra_views'] ?? 0));
        $meta = ['purpose' => $data['purpose'] ?? 'Investment evaluation', 'authorised_by' => $data['authoriser'] ?? $request->user()->name];

        if ($data['method'] === 'wallet') {
            try {
                $tx = WalletService::debit($request->user(), $price['subtotal'], "Unlock: {$p->name}", $p->code);
            } catch (RuntimeException $e) {
                return back()->with('error', $e->getMessage());
            }
            $ent = Fulfilment::grantUnlock($request->user(), $p, $price['views'], $price['subtotal'], 'Wallet / Credits', null, $meta + ['wallet_tx' => $tx->reference]);

            return redirect("/aiim/workspace/entitlements/{$ent->reference}")->with('success', 'Unlocked. '.number_format($price['subtotal'], 2).' credits debited.');
        }

        $order = Checkout::createOrder(
            collect($price['lines'])->map(fn ($l) => ['item_type' => 'aiim-unlock', 'item_code' => $l['code'], 'name' => $l['label'], 'unit_zar' => (int) round($l['amount']), 'meta' => ['object' => $p->code]])->all(),
            $request->user(), 'aiim',
            ['title' => "Metered unlock: {$p->name}", 'aiim' => ['kind' => 'unlock', 'object' => $p->code, 'views' => $price['views'], 'label' => $p->name] + $meta],
        );
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);

        return redirect("/aiim/checkout/{$order->reference}");
    }

    /** Wallet unlock of a Botswana template's full record, priced from the full-record service. */
    private function approveTemplate(Request $request, string $id): RedirectResponse
    {
        $request->validate(['confirm' => ['accepted']], ['confirm.accepted' => 'Please approve the wallet debit.']);
        if ($ent = $this->entitled($request->user(), 'template', $id)) {
            return redirect("/aiim/workspace/entitlements/{$ent->reference}");
        }
        $svc = ProtoAccount::service(ProtoAccount::UNLOCK_SERVICE);
        if (! $svc || $svc['price'] === null) {
            return back()->with('error', 'This service is not in the app catalogue yet.');
        }

        try {
            $ent = DB::transaction(function () use ($request, $id, $svc) {
                $tx = WalletService::debit($request->user(), (float) $svc['price'], "Unlock: {$id} full record", $id);

                return Entitlement::create([
                    'reference' => Refs::make('ENT'), 'user_id' => $request->user()->id,
                    'object_type' => 'template', 'object_key' => $id, 'title' => "{$id} full record",
                    'product_type' => $svc['name'], 'access_type' => 'permanent', 'amount_zar' => $svc['price'],
                    'payment_method' => 'Wallet / Credits', 'order_line_key' => 'wallet:'.$tx->reference,
                    'meta' => ['service' => $svc['code'], 'wallet_tx' => $tx->reference],
                ]);
            });
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect("/aiim/workspace/entitlements/{$ent->reference}")->with('success', 'Unlocked.');
    }

    /* ------------------------------------------------------------- wallet */

    public function wallet(Request $request): Response
    {
        $this->sync($request);
        $user = $request->user();
        $items = $this->resolvedItems($request);

        return $this->render($request, 'Aiim/Commerce/Wallet', [
            'summary' => WalletService::summary($user),
            'wallet' => WalletService::wallet($user)->only(['auto_recharge', 'auto_recharge_threshold_zar', 'auto_recharge_amount_zar']),
            'packs' => Pricing::creditPacks(),
            'count' => WalletTransaction::query()->where('user_id', $user->id)->count(),
            'transactions' => WalletTransaction::query()->where('user_id', $user->id)->latest('id')->take(10)->get()
                ->map(fn ($t) => ['reference' => $t->reference, 'date' => $t->created_at->format('d/m/Y, H:i'), 'description' => $t->description, 'type' => $t->type, 'amount' => (float) $t->amount_zar, 'related' => $t->related_key]),
            'manifest' => ['count' => count($items), 'total' => $this->priceItems($items)['subtotal']],
        ], 'Wallet and Credits');
    }

    public function topUp(Request $request): RedirectResponse
    {
        $packs = collect(Pricing::creditPacks());
        $data = $request->validate([
            'pack' => ['nullable', Rule::in($packs->pluck('code')->all())],
            'amount' => ['required_without:pack', 'nullable', 'integer', 'min:500', 'max:100000'],
        ]);
        $pack = $packs->firstWhere('code', $data['pack'] ?? null);
        $credits = $pack['credits'] ?? (int) $data['amount'];
        $price = $pack['price'] ?? (int) $data['amount'];
        $label = $pack ? "{$pack['label']} ({$credits} credits)" : "Wallet top-up ({$credits} credits)";

        $order = Checkout::createOrder(
            [['item_type' => 'aiim-credits', 'item_code' => $pack['code'] ?? 'AIIM-CRD-CUSTOM', 'name' => $label, 'unit_zar' => (int) $price]],
            $request->user(), 'aiim',
            ['title' => 'AIIM wallet top-up', 'aiim' => ['kind' => 'topup', 'credits' => $credits, 'label' => $label]],
        );
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);

        return redirect("/aiim/checkout/{$order->reference}");
    }

    public function autoRecharge(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'auto_recharge' => ['required', 'boolean'],
            'auto_recharge_threshold_zar' => ['required', 'integer', 'min:100', 'max:50000'],
            'auto_recharge_amount_zar' => ['required', 'integer', 'min:500', 'max:100000'],
        ]);
        WalletService::wallet($request->user())->update($data);

        return back()->with('success', $data['auto_recharge'] ? 'Auto-recharge switched on.' : 'Auto-recharge switched off.');
    }

    /* ----------------------------------------------- checkout & delivery */

    private function order(Request $request, string $reference): Order
    {
        $order = Order::query()->where('reference', $reference)->with('items')->firstOrFail();
        abort_unless($order->user_id === $request->user()->id && $order->section === 'aiim', 403);

        return $order;
    }

    public function checkout(Request $request, string $reference): Response|RedirectResponse
    {
        $order = $this->order($request, $reference);
        if ($order->isPaid()) {
            return redirect("/aiim/checkout/{$order->reference}/success");
        }

        return $this->render($request, 'Aiim/Commerce/Checkout', [
            'order' => $this->orderProps($order),
            'billing' => ['company' => $order->billing['company'] ?? $request->user()->company, 'vat_number' => $order->billing['vat_number'] ?? null],
            'wallet' => WalletService::balance($request->user()),
            'walletAllowed' => ($order->meta['aiim']['kind'] ?? null) !== 'topup',
            'steps' => self::STEPS,
        ], 'Secure Checkout');
    }

    /** Payment method and invoice details, then the payment provider's secure page (or an immediate wallet debit). */
    public function billing(Request $request, string $reference): RedirectResponse
    {
        $order = $this->order($request, $reference);
        abort_if($order->isPaid(), 409, 'This order has already been paid.');
        $data = $request->validate([
            'method' => ['required', Rule::in(['card', 'eft', 'wallet'])],
            'company' => ['nullable', 'string', 'max:190'],
            'vat_number' => ['nullable', 'string', 'max:30'],
            'terms' => ['accepted'],
        ], ['terms.accepted' => 'Please accept the Terms of Sale and the refund policy.']);
        $billing = array_filter(['name' => $request->user()->name, 'email' => $request->user()->email, 'phone' => $request->user()->phone, 'company' => $data['company'] ?? null, 'vat_number' => $data['vat_number'] ?? null]);

        if ($data['method'] === 'wallet') {
            if (($order->meta['aiim']['kind'] ?? null) === 'topup') {
                return back()->with('error', 'Wallet credits cannot buy wallet credits.');
            }
            try {
                $this->payFromWallet($request, $order, $billing);
            } catch (RuntimeException $e) {
                return back()->with('error', $e->getMessage());
            }

            return redirect("/aiim/checkout/{$order->reference}/success");
        }

        $order->update(['billing' => $billing, 'meta' => $order->meta + ['aiim_method' => $data['method']]]);

        return redirect(route('checkout.show', $order).'?method='.$data['method']);
    }

    public function success(Request $request, string $reference): Response
    {
        $order = $this->order($request, $reference);
        Fulfilment::settle($order);
        $order->refresh();
        $kind = $order->meta['aiim']['kind'] ?? null;

        $next = match ($kind) {
            'topup' => ['label' => 'Go to Wallet', 'url' => '/aiim/wallet'],
            'report' => ['label' => 'Track Report', 'url' => '/aiim/workspace/reports/'.($order->meta['aiim']['report'] ?? '')],
            'deposit', 'balance' => ['label' => 'Open Mandate Workspace', 'url' => '/aiim/workspace/engagements/'.($order->meta['aiim']['engagement'] ?? '')],
            default => null,
        };
        $ent = Entitlement::query()->where('order_id', $order->id)->oldest('id')->first();
        if ($ent) {
            $next = ['label' => 'See what is unlocked', 'url' => "/aiim/workspace/entitlements/{$ent->reference}"];
        }
        $payment = $order->payments()->latest('id')->first();
        $latest = Engagement::query()->where('user_id', $request->user()->id)->latest('id')->value('reference');

        return $this->render($request, 'Aiim/Commerce/Payment', [
            'order' => $this->orderProps($order),
            'paid' => $order->isPaid(),
            'payment' => $payment ? ['reference' => $payment->reference, 'method' => $payment->method, 'status' => $payment->status, 'reason' => $payment->failure_reason] : null,
            'next' => $next ?? ['label' => 'Go to My Workspace', 'url' => '/aiim/workspace'],
            'ledgerUrl' => $latest ? "/aiim/workspace/engagements/{$latest}/ledger" : '/aiim/wallet',
            'steps' => self::STEPS,
        ], $order->isPaid() ? 'Payment Confirmation' : 'Payment Processing');
    }

    private function orderProps(Order $order): array
    {
        return [
            'reference' => $order->reference, 'title' => $order->meta['title'] ?? 'AIIM order', 'kind' => $order->meta['aiim']['kind'] ?? null,
            'label' => $order->meta['aiim']['label'] ?? null, 'status' => $order->status,
            'items' => $order->items->map(fn ($i) => ['name' => $i->name, 'code' => $i->item_code, 'amount' => (float) $i->line_zar])->all(),
            'subtotal' => (float) $order->subtotal_zar, 'vat' => (float) $order->vat_zar, 'fees' => (float) $order->fees_zar, 'total' => (float) $order->total_zar,
            'date' => ($order->paid_at ?? $order->created_at)->format('j M Y, H:i'),
        ];
    }

    /* -------------------------------------------------------- entitlements */

    public function entitlements(Request $request): Response
    {
        $this->sync($request);

        return $this->render($request, 'Aiim/Commerce/Entitlements', [
            'items' => Entitlement::query()->where('user_id', $request->user()->id)->latest('id')->get()->map(fn ($e) => $this->entProps($e)),
        ], 'Entitlements');
    }

    /** Mock-up 33: what this payment unlocked (every entitlement of the same order). */
    public function entitlement(Request $request, Entitlement $entitlement): Response
    {
        abort_unless($entitlement->user_id === $request->user()->id, 403);
        $all = $entitlement->order_id
            ? Entitlement::query()->where('order_id', $entitlement->order_id)->where('user_id', $request->user()->id)->oldest('id')->get()
            : collect([$entitlement]);

        return $this->render($request, 'Aiim/Commerce/Entitlement', [
            'ent' => $this->entProps($entitlement),
            'unlocked' => $all->map(fn ($e) => $this->entProps($e) + $this->entTarget($e))->values(),
            'services' => ProtoAccount::rail(['AAB-EMB-191', 'AAB-EMB-238', 'AAB-EMB-240'], 3),
            'steps' => self::STEPS,
        ], 'Entitlement Unlock');
    }

    /** Where an entitlement leads: the record, the delivery tracker or the metered model. */
    private function entTarget(Entitlement $e): array
    {
        [$type, $key] = $e->object_type === 'premium' && str_contains($e->object_key, ':') ? explode(':', $e->object_key, 2) : [$e->object_type, $e->object_key];
        $svc = $type === 'service' ? ProtoAccount::service($key) : null;

        return match (true) {
            $type === 'service' => ['code' => $key, 'delivery' => $svc['delivery'] ?? null, 'action' => ['label' => 'Track delivery', 'url' => '/aiim/workspace/reports']],
            $type === 'template' => ['code' => $key, 'delivery' => null, 'action' => ['label' => 'Open record', 'url' => "/aiim/unlock/{$key}"]],
            $type === 'project' => ['code' => $key, 'delivery' => null, 'action' => ['label' => 'Open full model', 'post' => "/aiim/workspace/entitlements/{$e->reference}/view"]],
            $type === 'brief' => ['code' => $key, 'delivery' => null, 'action' => ['label' => 'Open brief', 'url' => "/aiim/store/{$key}"]],
            default => ['code' => $key, 'delivery' => null, 'action' => ($c = Catalogue::card($type, $key)) ? ['label' => 'Open record', 'url' => $c['url']] : null],
        };
    }

    /** Consume one view of a pay-per-view entitlement; extra views are charged to the wallet at the disclosed rate. */
    public function consume(Request $request, Entitlement $entitlement): RedirectResponse
    {
        abort_unless($entitlement->user_id === $request->user()->id, 403);
        if ($entitlement->expires_at && $entitlement->expires_at->isPast()) {
            $entitlement->update(['status' => 'expired']);

            return back()->with('error', 'This entitlement has expired.');
        }
        if ($entitlement->views_included !== null && $entitlement->views_used >= $entitlement->views_included) {
            try {
                WalletService::debit($request->user(), (float) $entitlement->extra_view_zar, "Extra view: {$entitlement->title}", $entitlement->object_key);
            } catch (RuntimeException $e) {
                return back()->with('error', 'All included views are used. Top up your wallet to pay R'.number_format($entitlement->extra_view_zar, 2).' per extra view.');
            }
        }
        $entitlement->increment('views_used');

        return back()->with('success', 'Full model opened. View recorded ('.$entitlement->views_used.($entitlement->views_included ? ' of '.$entitlement->views_included : '').').');
    }

    private function entProps(Entitlement $e): array
    {
        $active = $e->status === 'active' && (! $e->expires_at || $e->expires_at->isFuture());

        return [
            'reference' => $e->reference, 'title' => $e->title, 'objectType' => $e->object_type, 'objectKey' => $e->object_key,
            'productType' => $e->product_type, 'access' => $e->access_type, 'viewsIncluded' => $e->views_included, 'viewsUsed' => $e->views_used,
            'extraView' => $e->extra_view_zar, 'amount' => $e->amount_zar, 'method' => $e->payment_method,
            'status' => $active ? 'active' : 'expired', 'expires' => $e->expires_at?->format('j M Y, H:i'), 'unlocked' => $e->created_at->format('j M Y, H:i'),
            'meta' => $e->meta ?? [], 'order' => $e->order?->reference,
        ];
    }
}
