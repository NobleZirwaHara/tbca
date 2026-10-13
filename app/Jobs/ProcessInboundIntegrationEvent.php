<?php

namespace App\Jobs;

use App\Models\IntegrationEvent;
use App\Support\DueDiligence\Identity\IdentityVerifications;
use App\Support\Integrations\Zoho\InboundHandler;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/** Applies a stored, verified inbound webhook delivery after the endpoint has answered. */
class ProcessInboundIntegrationEvent implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $eventId) {}

    public function handle(InboundHandler $zoho, IdentityVerifications $identity): void
    {
        $event = IntegrationEvent::find($this->eventId);
        if (! $event || $event->status === 'complete') {
            return;
        }

        match ($event->source) {
            'vove' => $identity->handleWebhookEvent($event),
            default => $zoho->handle($event),
        };
    }
}
