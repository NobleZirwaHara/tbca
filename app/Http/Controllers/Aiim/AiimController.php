<?php

namespace App\Http\Controllers\Aiim;

use App\Http\Controllers\Controller;
use App\Models\Aiim\Comparison;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\Entitlement;
use App\Models\Aiim\Province;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\SavedItem;
use App\Models\Aiim\Sector;
use App\Models\User;
use App\Support\Aiim\Fulfilment;
use App\Support\Aiim\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Base for AIIM controllers: the "Your Selection" context held in the session
 * and the workspace snapshot shown in the right rail of every AIIM screen.
 */
abstract class AiimController extends Controller
{
    protected function select(Request $request, array $values): void
    {
        $request->session()->put('aiim.selection', array_merge($this->selection($request), array_filter($values, fn ($v) => $v !== null)));
    }

    protected function selection(Request $request): array
    {
        return $request->session()->get('aiim.selection', ['country' => 'Africa (all 54 countries)']);
    }

    protected function render(Request $request, string $page, array $props = [], ?string $context = null): Response
    {
        $sel = $this->selection($request);
        $province = isset($sel['province']) ? Province::query()->where('slug', $sel['province'])->value('name') : null;
        $sector = isset($sel['sector']) ? Sector::query()->where('slug', $sel['sector'])->value('name') : null;

        return Inertia::render($page, $props + [
            'selection' => [
                'country' => $sel['country'] ?? 'Africa (all 54 countries)',
                'province' => $province,
                'provinceSlug' => $sel['province'] ?? null,
                'sector' => $sector,
                'sectorSlug' => $sel['sector'] ?? null,
                'item' => $sel['item'] ?? null,
                'context' => $context,
            ],
            'snapshot' => $request->user() ? $this->snapshot($request->user()) : null,
        ]);
    }

    protected function snapshot(User $user): array
    {
        return [
            'saved' => SavedItem::query()->where('user_id', $user->id)->where('list', 'saved')->count(),
            'watchlist' => SavedItem::query()->where('user_id', $user->id)->where('list', 'watchlist')->count(),
            'comparisons' => Comparison::query()->where('user_id', $user->id)->count(),
            'reports' => ReportRequest::query()->where('user_id', $user->id)->where('status', '!=', 'draft')->count(),
            'entitlements' => Entitlement::query()->where('user_id', $user->id)->where('status', 'active')->count(),
            'mandates' => Engagement::query()->where('user_id', $user->id)->whereNotIn('status', ['draft', 'cancelled', 'closed'])->count(),
            'wallet' => WalletService::balance($user),
        ];
    }

    protected function sync(Request $request): void
    {
        if ($request->user()) {
            Fulfilment::syncUser($request->user());
        }
    }

    /** Whether the user holds an active entitlement to an object. */
    protected function entitled(?User $user, string $objectType, string $key): ?Entitlement
    {
        if (! $user) {
            return null;
        }

        return Entitlement::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where(fn ($q) => $q->where(fn ($w) => $w->where('object_type', $objectType)->where('object_key', $key))
                ->orWhere(fn ($w) => $w->where('object_type', 'premium')->where('object_key', 'like', '%:'.$key)))
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest('id')
            ->first();
    }

    protected function savedKeys(?User $user): array
    {
        if (! $user) {
            return [];
        }

        return SavedItem::query()->where('user_id', $user->id)->get()
            ->map(fn ($s) => "{$s->list}:{$s->entity_type}:{$s->entity_key}")->values()->all();
    }
}
