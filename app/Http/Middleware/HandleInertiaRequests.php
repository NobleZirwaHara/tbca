<?php

namespace App\Http\Middleware;

use App\Support\Content\Navigation;
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

            'trustBadges' => config('tbca.trust_badges'),

            'flash' => fn () => [
                'message' => $request->session()->get('message'),
            ],

            'url' => [
                'path' => '/'.ltrim($request->path() === '/' ? '' : $request->path(), '/'),
            ],
        ];
    }
}
