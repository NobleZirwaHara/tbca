<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\Provider;
use App\Models\User;

/**
 * Resolves the provider (marketplace) or partner firm (partner services)
 * that the signed-in user operates. TBCA admins may preview the demo
 * workspace of the first active record of that kind.
 */
class ProviderContext
{
    public static function for(?User $user, string $kind = 'marketplace'): ?Provider
    {
        if (! $user) {
            return null;
        }

        $own = Provider::where('kind', $kind)->where('user_id', $user->id)->first();
        if ($own) {
            return $own;
        }

        if ($user->isAdmin()) {
            return Provider::where('kind', $kind)->where('status', 'active')->whereNotNull('user_id')->orderBy('id')->first()
                ?? Provider::where('kind', $kind)->orderBy('id')->first();
        }

        return null;
    }

    public static function require(?User $user, string $kind = 'marketplace'): Provider
    {
        $provider = self::for($user, $kind);
        abort_if(! $provider, 403, $kind === 'partner'
            ? 'The Partner workspace is available to approved Partner Network firms.'
            : 'The Provider portal is available to approved Marketplace providers.');

        return $provider;
    }
}
