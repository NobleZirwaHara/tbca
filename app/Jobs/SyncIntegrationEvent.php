<?php

namespace App\Jobs;

use App\Models\IntegrationEvent;
use App\Support\Integrations\Zoho\Dispatcher;
use App\Support\Integrations\Zoho\ZohoConfig;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/** Sends one outbound ledger event now (used by "Retry now" on the admin page). Retries follow the ledger's own backoff. */
class SyncIntegrationEvent implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(public int $eventId) {}

    public function handle(Dispatcher $dispatcher): void
    {
        $event = IntegrationEvent::find($this->eventId);

        if ($event && ZohoConfig::enabled() && $event->direction === 'outbound' && in_array($event->status, ['pending', 'failed'], true)) {
            $dispatcher->process($event);
        }
    }
}
