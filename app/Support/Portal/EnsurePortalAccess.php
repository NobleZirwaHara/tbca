<?php

namespace App\Support\Portal;

use App\Models\Portal\Notice;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Portal request guard: bootstraps the portal account, records the session
 * sign-in once, shares the portal shell props and enforces the protected
 * client floor when an account is restricted, suspended or exited (CP-TEB Part 18).
 */
class EnsurePortalAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->guest(route('login'));
        }

        $account = Portal::account($user);
        Portal::touch($request);

        if (Portal::isRestricted($account)) {
            $path = trim($request->path(), '/');
            $allowed = collect(Portal::FLOOR_PATHS)->contains(fn ($p) => $path === $p || str_starts_with($path, $p.'/'));
            if (! $allowed) {
                return redirect('/portal/account/status')->with('error', 'This area is restricted while your account is under review. Your protected client floor remains available.');
            }
        }

        Inertia::share('portal', function () use ($user) {
            $account = Portal::account($user)->fresh();
            $actions = Actions::for($user)->count();
            $unread = Notice::where('user_id', $user->id)->whereNull('read_at')->count();
            $nav = Nav::client();
            foreach ($nav as &$group) {
                foreach ($group['items'] as &$item) {
                    if ($item['href'] === '/portal/actions') {
                        $item['badge'] = $actions;
                    } elseif ($item['href'] === '/portal/notifications') {
                        $item['badge'] = $unread;
                    }
                }
            }

            return [
                'nav' => $nav,
                'user' => [
                    'name' => $user->name,
                    'initials' => Portal::initials($user->name),
                    'organisation' => $account->organisation?->name ?? $user->company ?? '—',
                    'client_id' => $user->client_id,
                    'state' => $account->account_state,
                    'role' => Portal::membership($user)?->role ?? 'owner',
                ],
                'unread' => $unread,
                'actions' => $actions,
                'a11y' => array_merge(Portal::defaultPreferences()['a11y'], $account->preferences['a11y'] ?? []),
            ];
        });

        return $next($request);
    }
}
