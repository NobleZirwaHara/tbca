<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets the application locale from the visitor's language choice (session
 * `tbca.language`, set by POST /context) so `__()` on the server reads the same
 * `lang/{locale}.json` dictionaries as `t()` in the front end.
 */
class ApplyLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $code = (string) $request->session()->get('tbca.language', 'en');
        $codes = collect(config('tbca.languages'))->pluck('code');

        App::setLocale($codes->contains($code) ? $code : 'en');

        return $next($request);
    }
}
