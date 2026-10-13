<?php

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessInboundIntegrationEvent;
use App\Support\DueDiligence\Identity\VoveIdProvider;
use App\Support\Integrations\Ledger;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * POST /integrations/vove/webhook
 *
 * VOVE ID KYC, KYB and AML status events, signed with Svix. The raw body is
 * verified, the delivery is stored once per svix-id, and 204 is returned
 * quickly; the result is applied on the queue after the provider confirms it.
 */
class VoveWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $secret = (string) config('services.vove.webhook_secret');
        if ($secret === '') {
            return response('VOVE ID webhook is not configured.', 503);
        }

        $id = $request->header('svix-id');
        $valid = VoveIdProvider::verifySignature(
            $secret,
            $id,
            $request->header('svix-timestamp'),
            $request->header('svix-signature'),
            $request->getContent(),
            (int) config('services.vove.webhook_tolerance', 300),
        );

        if (! $valid) {
            return response('Invalid signature.', 400);
        }

        $payload = json_decode($request->getContent(), true);
        if (! is_array($payload)) {
            return response('Invalid JSON.', 400);
        }

        [$event, $isNew] = Ledger::storeInbound('vove', (string) $id, 'vove.webhook', array_intersect_key($payload, array_flip(['refId', 'status', 'previousStatus', 'reason', 'type', 'data'])));

        if ($isNew) {
            ProcessInboundIntegrationEvent::dispatch($event->id);
        }

        return response()->noContent();
    }
}
