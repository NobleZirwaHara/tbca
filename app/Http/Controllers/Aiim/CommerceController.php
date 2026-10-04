<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Entitlement;
use App\Models\Aiim\Project;
use App\Models\Aiim\Quote;
use App\Models\Aiim\WalletTransaction;
use App\Models\Order;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\Fulfilment;
use App\Support\Aiim\Grades;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\WalletService;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;
use RuntimeException;

/**
 * Stages C and 2: free fee discovery and itemised fee manifest, locked premium
 * objects with metered unlock approval, the AIIM wallet, the AIIM checkout
 * review, payment confirmation and entitlement unlock.
 */
class CommerceController extends AiimController
{
    private const FEE_TYPES = ['opportunity', 'project', 'investor', 'funder', 'corridor', 'source'];

    /* ------------------------------------------------------ fee discovery */

    private function feeItems(Request $request): array
    {
        return $request->session()->get('aiim.fee_items', []);
    }

    public function discover(Request $request): Response
    {
        $items = collect($this->feeItems($request))->map(fn ($i) => ($c = Catalogue::card($i['type'], $i['key'])) ? $c + ['typeLabel' => Catalogue::typeLabel($i['type'])] : null)->filter()->values();

        return $this->render($request, 'Aiim/Commerce/FeeDiscovery', [
            'items' => $items,
            'estimate' => Pricing::manifest($items->map(fn ($i) => ['type' => $i['type'], 'key' => $i['key'], 'label' => $i['name']])->all()),
        ], 'Fee Discovery ('.$items->count().' items)');
    }

    public function addFeeItem(Request $request): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', Rule::in(self::FEE_TYPES)], 'key' => ['required', 'string']]);
        $card = Catalogue::card($data['type'], $data['key']);
        abort_unless($card, 404);
        $items = collect($this->feeItems($request));
        if (! $items->contains(fn ($i) => $i['type'] === $data['type'] && $i['key'] === $card['key'])) {
            $items->push(['type' => $data['type'], 'key' => $card['key']]);
        }
        $request->session()->put('aiim.fee_items', $items->take(10)->values()->all());

        return redirect('/aiim/fees/discover')->with('success', "{$card['name']} added for pricing.");
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
        $items = collect($this->feeItems($request))->map(fn ($i) => ($c = Catalogue::card($i['type'], $i['key'])) ? ['type' => $i['type'], 'key' => $c['key'], 'label' => $c['name'], 'confidence' => $c['confidence']] : null)->filter()->values();
        if ($items->isEmpty()) {
            return back()->with('error', 'Select at least one item before requesting a fee manifest.');
        }
        $blocked = $items->first(fn ($i) => ! Grades::sellable($i['confidence']));
        if ($blocked) {
            return back()->with('error', "{$blocked['label']} is below the sellability confidence threshold and cannot be sold yet.");
        }

        $totals = Pricing::manifest($items->all());
        $quote = Quote::create([
            'reference' => 'AIIM-QUOTE-'.now()->format('Ymd').'-'.strtoupper(substr(md5(uniqid('', true)), 0, 4)),
            'user_id' => $request->user()->id,
            'items' => $items->all(),
            'lines' => $totals['lines'],
            'subtotal_zar' => $totals['subtotal'],
            'vat_zar' => $totals['vat'],
            'total_zar' => $totals['total'],
            'hash' => hash('sha256', json_encode([$items, $totals['lines']])),
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
                'daysLeft' => max(0, (int) now()->startOfDay()->diffInDays($quote->valid_until, false)),
                'status' => $expired ? 'expired' : $quote->status, 'items' => $quote->items, 'lines' => $quote->lines,
                'subtotal' => $quote->subtotal_zar, 'vat' => $quote->vat_zar, 'total' => $quote->total_zar, 'hash' => substr($quote->hash, 0, 12),
                'order' => $quote->order?->reference,
            ],
        ], 'Fee Manifest');
    }

    /** G3 acceptance of the manifest -> order for the shared payment gateway. */
    public function checkoutManifest(Request $request, Quote $quote): RedirectResponse
    {
        abort_unless($quote->user_id === $request->user()->id, 403);
        if ($quote->status === 'paid') {
            return back()->with('error', 'This quote has already been paid.');
        }
        if ($quote->valid_until->isPast()) {
            return back()->with('error', 'This quote has expired. Please request a new fee manifest.');
        }
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Please accept the Terms of Use, Privacy Policy and Refund Policy.']);

        $order = Checkout::createOrder(
            collect($quote->lines)->map(fn ($l) => ['item_type' => 'aiim-fee', 'item_code' => $l['code'], 'name' => $l['label'], 'unit_zar' => (int) round($l['amount']), 'meta' => ['quote' => $quote->reference]])->all(),
            $request->user(), 'aiim',
            ['title' => 'AIIM premium intelligence', 'aiim' => ['kind' => 'manifest', 'quote' => $quote->reference, 'label' => count($quote->items).' premium items']],
        );
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);
        $quote->update(['order_id' => $order->id]);

        return redirect("/aiim/checkout/{$order->reference}");
    }

    /* --------------------------------------------- locked object & unlock */

    private function project(string $code): Project
    {
        $p = Project::query()->where('code', $code)->firstOrFail();
        abort_unless($p->premium, 404);

        return $p;
    }

    public function locked(Request $request, string $code): Response
    {
        $p = $this->project($code);
        $ent = $this->entitled($request->user(), 'project', $p->code);
        $this->select($request, ['province' => $p->province_slug, 'sector' => $p->sector_slug, 'item' => $p->name]);
        $watch = $request->user() ? \App\Models\Aiim\SavedItem::query()->where(['user_id' => $request->user()->id, 'list' => 'watchlist', 'entity_key' => $p->slug])->first() : null;

        return $this->render($request, 'Aiim/Commerce/Locked', [
            'item' => Catalogue::project($p, true),
            'price' => Pricing::unlock($p),
            'entitlement' => $ent?->reference,
            'watchedOn' => $watch?->created_at->format('j M Y'),
        ], 'Locked Premium Object');
    }

    public function approval(Request $request, string $code): Response|RedirectResponse
    {
        $p = $this->project($code);
        if ($ent = $this->entitled($request->user(), 'project', $p->code)) {
            return redirect("/aiim/workspace/entitlements/{$ent->reference}")->with('success', 'You already hold an active entitlement to this object.');
        }
        $extra = max(0, min(10, (int) $request->query('extra', 2)));

        return $this->render($request, 'Aiim/Commerce/UnlockApproval', [
            'item' => Catalogue::project($p, true),
            'extra' => $extra,
            'price' => Pricing::unlock($p, $extra),
            'wallet' => WalletService::balance($request->user()),
            'user' => ['name' => $request->user()->name],
            'requestedOn' => now()->format('j M Y, H:i').' SAST',
        ], 'Metered Unlock Approval');
    }

    public function approve(Request $request, string $code): RedirectResponse
    {
        $p = $this->project($code);
        $data = $request->validate([
            'authoriser' => ['required', 'string', 'max:120'],
            'purpose' => ['required', 'string', 'max:120'],
            'method' => ['required', Rule::in(['wallet', 'card'])],
            'extra_views' => ['required', 'integer', 'min:0', 'max:10'],
            'confirm' => ['accepted'],
        ], ['confirm.accepted' => 'Please confirm this unlock is required for investment decision-making.']);

        if (! Grades::sellable($p->confidence)) {
            return back()->with('error', 'This object is below the minimum confidence threshold and cannot be unlocked yet.');
        }
        if ($ent = $this->entitled($request->user(), 'project', $p->code)) {
            return redirect("/aiim/workspace/entitlements/{$ent->reference}");
        }

        $price = Pricing::unlock($p, (int) $data['extra_views']);
        $meta = ['purpose' => $data['purpose'], 'authorised_by' => $data['authoriser']];

        if ($data['method'] === 'wallet') {
            // Credits are bought VAT-inclusive, so the wallet is debited the ex-VAT subtotal (G4: confirmed wallet debit).
            try {
                $tx = WalletService::debit($request->user(), $price['subtotal'], "Unlock: {$p->name}", $p->code);
            } catch (RuntimeException $e) {
                return back()->with('error', $e->getMessage());
            }
            $ent = Fulfilment::grantUnlock($request->user(), $p, $price['views'], $price['subtotal'], 'Wallet / Credits', null, $meta + ['wallet_tx' => $tx->reference]);

            return redirect("/aiim/workspace/entitlements/{$ent->reference}")->with('success', 'Unlock approved. '.number_format($price['subtotal'], 2).' credits debited.');
        }

        $order = Checkout::createOrder(
            collect($price['lines'])->map(fn ($l) => ['item_type' => 'aiim-unlock', 'item_code' => $l['code'], 'name' => $l['label'], 'unit_zar' => (int) round($l['amount']), 'meta' => ['object' => $p->code]])->all(),
            $request->user(), 'aiim',
            ['title' => "Metered unlock — {$p->name}", 'aiim' => ['kind' => 'unlock', 'object' => $p->code, 'views' => $price['views'], 'label' => $p->name] + $meta],
        );
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);

        return redirect("/aiim/checkout/{$order->reference}");
    }

    /* ------------------------------------------------------------- wallet */

    public function wallet(Request $request): Response
    {
        $this->sync($request);
        $user = $request->user();

        return $this->render($request, 'Aiim/Commerce/Wallet', [
            'summary' => WalletService::summary($user),
            'wallet' => WalletService::wallet($user)->only(['auto_recharge', 'auto_recharge_threshold_zar', 'auto_recharge_amount_zar']),
            'packs' => Pricing::creditPacks(),
            'transactions' => WalletTransaction::query()->where('user_id', $user->id)->latest('id')->take(25)->get()
                ->map(fn ($t) => ['reference' => $t->reference, 'date' => $t->created_at->format('j M Y, H:i'), 'description' => $t->description, 'type' => $t->type, 'amount' => $t->amount_zar, 'balance' => $t->balance_zar]),
            'usage' => WalletTransaction::query()->where('user_id', $user->id)->where('type', 'debit')->count(),
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
            'billing' => ($order->billing ?? []) + ['name' => $request->user()->name, 'email' => $request->user()->email, 'phone' => $request->user()->phone, 'company' => $request->user()->company],
        ], 'Secure Checkout');
    }

    public function billing(Request $request, string $reference): RedirectResponse
    {
        $order = $this->order($request, $reference);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'country' => ['required', 'string', 'max:60'],
            'company' => ['nullable', 'string', 'max:190'],
            'vat_number' => ['nullable', 'string', 'max:30'],
            'phone' => ['required', 'string', 'max:30'],
        ]);
        $order->update(['billing' => array_filter($data)]);

        return redirect()->route('checkout.show', $order);
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
        $ent = Entitlement::query()->where('order_id', $order->id)->latest('id')->first();
        if ($ent) {
            $next = ['label' => 'View Entitlement', 'url' => "/aiim/workspace/entitlements/{$ent->reference}"];
        }
        $payment = $order->payments()->latest('id')->first();

        return $this->render($request, 'Aiim/Commerce/Payment', [
            'order' => $this->orderProps($order),
            'paid' => $order->isPaid(),
            'payment' => $payment ? ['reference' => $payment->reference, 'method' => $payment->method, 'status' => $payment->status, 'last4' => $payment->meta['last4'] ?? null, 'reason' => $payment->failure_reason] : null,
            'next' => $next ?? ['label' => 'Go to My Workspace', 'url' => '/aiim/workspace'],
            'entitlement' => $ent ? ['reference' => $ent->reference, 'title' => $ent->title, 'access' => $ent->access_type, 'views' => $ent->views_included, 'expires' => $ent->expires_at?->format('j M Y')] : null,
        ], $order->isPaid() ? 'Payment Confirmation' : 'Payment Processing');
    }

    private function orderProps(Order $order): array
    {
        return [
            'reference' => $order->reference, 'title' => $order->meta['title'] ?? 'AIIM order', 'kind' => $order->meta['aiim']['kind'] ?? null,
            'label' => $order->meta['aiim']['label'] ?? null, 'status' => $order->status,
            'items' => $order->items->map(fn ($i) => ['name' => $i->name, 'code' => $i->item_code, 'amount' => $i->line_zar])->all(),
            'subtotal' => $order->subtotal_zar, 'vat' => $order->vat_zar, 'fees' => $order->fees_zar, 'total' => $order->total_zar,
            'date' => ($order->paid_at ?? $order->created_at)->format('j M Y, H:i').' SAST', 'payer' => $order->billing['name'] ?? null, 'email' => $order->billing['email'] ?? null,
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

    public function entitlement(Request $request, Entitlement $entitlement): Response
    {
        abort_unless($entitlement->user_id === $request->user()->id, 403);
        $project = $entitlement->object_type === 'project' ? Project::query()->where('code', $entitlement->object_key)->first() : null;

        return $this->render($request, 'Aiim/Commerce/Entitlement', [
            'ent' => $this->entProps($entitlement),
            'item' => $project ? Catalogue::project($project, true) : null,
            'order' => $entitlement->order?->only(['reference', 'total_zar']),
        ], 'Entitlement Unlock');
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
