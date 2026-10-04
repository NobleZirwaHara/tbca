<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts the admin consoles to TBCA staff accounts.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect()->guest(route('login'));
        }

        abort_unless($request->user()->isAdmin(), 403, 'This console is restricted to TBCA staff.');

        return $next($request);
    }
}
