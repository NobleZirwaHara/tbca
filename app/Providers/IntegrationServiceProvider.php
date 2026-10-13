<?php

namespace App\Providers;

use App\Support\Integrations\DomainHooks;
use App\Support\Integrations\Zoho\ZohoAuth;
use Illuminate\Support\ServiceProvider;

/** Zoho One and identity-provider integration layer. */
class IntegrationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ZohoAuth::class);
    }

    public function boot(): void
    {
        DomainHooks::register();
    }
}
