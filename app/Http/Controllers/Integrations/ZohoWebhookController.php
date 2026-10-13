<?php

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessInboundIntegrationEvent;
use App\Support\Integrations\Ledger;
use App\Support\Integrations\Processes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * POST /integrations/zoho/webhook
 *
 * Signed inbound events from Zoho Flow (or a relay). The request is accepted
 * only when X-TBCA-Signature equals "sha256=" + hex HMAC-SHA256 of
 * "{X-TBCA-Timestamp}.{raw body}" with ZOHO_WEBHOOK_SECRET, and the timestamp
 * is inside the replay window. Each event_id is stored once; a replay returns
 * 200 without doing the work again. The work runs on the queue after the reply.
 */
class ZohoWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $secret = (string) config('zoho.webhook.secret');
        if ($secret === '') {
            return response()->json(['error' => 'Zoho webhook is not configured.'], 503);
        }

        $timestamp = (string) $request->header('X-TBCA-Timestamp', '');
        $signature = (string) $request->header('X-TBCA-Signature', '');
        $tolerance = (int) config('zoho.webhook.tolerance_seconds', 300);

        if (! ctype_digit($timestamp) || abs(time() - (int) $timestamp) > $tolerance) {
            return response()->json(['error' => 'Timestamp missing or outside the replay window.'], 401);
        }

        $expected = 'sha256='.hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);
        if (! hash_equals($expected, $signature)) {
            return response()->json(['error' => 'Invalid signature.'], 401);
        }

        $body = json_decode($request->getContent(), true);
        $eventId = is_array($body) ? ($body['event_id'] ?? null) : null;
        $type = is_array($body) ? ($body['event_type'] ?? null) : null;

        if (! is_string($eventId) || $eventId === '' || strlen($eventId) > 100 || ! is_array($body['data'] ?? null)) {
            return response()->json(['error' => 'event_id and data are required.'], 422);
        }
        if (! in_array($type, Processes::inboundTypes(), true)) {
            return response()->json(['error' => 'Unknown event_type.'], 422);
        }

        [$event, $isNew] = Ledger::storeInbound('zoho', $eventId, $type, [
            'occurred_at' => $body['occurred_at'] ?? null,
            'organisation_id' => $body['organisation_id'] ?? null,
            'data' => $body['data'],
        ]);

        if ($isNew) {
            ProcessInboundIntegrationEvent::dispatch($event->id);
        }

        return response()->json(['received' => true, 'duplicate' => ! $isNew, 'event_id' => $eventId], $isNew ? 202 : 200);
    }
}
