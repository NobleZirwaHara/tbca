<?php

namespace App\Http\Middleware;

use App\Models\Portal\Notice;
use App\Support\Content\Navigation;
use App\Support\Deliverables\ProductDeliverables;
use App\Support\Platform\Basket;
use App\Support\Platform\Fx;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Shared props. Country, language and currency persist across every route
     * (Table 2 — Main Navigation Implementation and Control Matrix).
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'brand' => config('tbca.brand'),
            'contact' => config('tbca.contact'),

            'nav' => [
                'primary' => Navigation::primary(),
                'secondary' => Navigation::secondary(),
                'children' => Navigation::children(),
                'footer' => Navigation::footer(),
            ],

            'context' => fn () => [
                'country' => $request->session()->get('tbca.country', config('tbca.default_country')),
                'language' => $request->session()->get('tbca.language', 'en'),
                'currency' => $request->session()->get('tbca.currency', 'ZAR'),
                'languages' => config('tbca.languages'),
                'currencies' => config('tbca.currencies'),
            ],

            // Daily ZAR-based display rates (live feed, cached 24h, config fallback).
            'fx' => fn () => Fx::snapshot(),

            'trustBadges' => config('tbca.trust_badges'),

            // "What you will receive" on product pages (Registry of Deliverables); null on every other page.
            'productDeliverables' => fn () => ProductDeliverables::forRequest($request),

            'auth' => fn () => [
                'user' => $request->user()?->only(['id', 'name', 'email', 'client_id', 'role', 'company', 'phone', 'country', 'client_type']),
            ],

            'basketCount' => fn () => app(Basket::class)->count(),

            'unreadNotifications' => fn () => $request->user()
                ? Notice::where('user_id', $request->user()->id)->whereNull('read_at')->count()
                : 0,

            'flash' => fn () => [
                'message' => $request->session()->get('message'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'reference' => $request->session()->get('reference'),
            ],

            'url' => [
                'path' => '/'.ltrim($request->path() === '/' ? '' : $request->path(), '/'),
            ],
        ];
    }
}
