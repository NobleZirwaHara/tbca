<?php

namespace App\Support\Portal;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/** Shares the /admin/portal console sidebar with every admin portal page. */
class SharePortalAdminNav
{
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share('portalAdminNav', fn () => Nav::admin());

        return $next($request);
    }
}
