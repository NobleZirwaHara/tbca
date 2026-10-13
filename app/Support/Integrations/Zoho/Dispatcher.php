<?php

namespace App\Support\Integrations\Zoho;

use App\Models\IntegrationEvent;
use Throwable;

/**
 * The outbox dispatcher behind `php artisan zoho:sync`.
 *
 * Each due event is claimed with a conditional update (so two workers never
 * send the same event), handed to OutboundSync, and then marked complete,
 * sent (awaiting Zoho Flow), or failed. Retryable failures wait for the next
 * backoff slot with jitter; validation failures and events that used all
 * attempts are parked for a person on the admin status page.
 */
class Dispatcher
{
    public function __construct(private OutboundSync $sync) {}

    /** @return array{processed: int, complete: int, sent: int, failed: int} */
    public function run(?int $limit = null): array
    {
        $stats = ['processed' => 0, 'complete' => 0, 'sent' => 0, 'failed' => 0];

        $events = IntegrationEvent::query()->due()->orderBy('id')->limit($limit ?? (int) config('zoho.sync.batch', 50))->get();

        foreach ($events as $event) {
            $outcome = $this->process($event);
            if ($outcome !== null) {
                $stats['processed']++;
                $stats[$outcome]++;
            }
        }

        return $stats;
    }

    /** Process one event. Returns complete, sent or failed, or null if another worker claimed it. */
    public function process(IntegrationEvent $event): ?string
    {
        if (! $this->claim($event)) {
            return null;
        }

        try {
            $awaitingFlow = $this->sync->handle($event);
        } catch (Throwable $e) {
            return $this->fail($event, $e);
        }

        $event->forceFill([
            'status' => $awaitingFlow ? 'sent' : 'complete',
            'handled_by' => $event->handled_by ?? 'automated',
            'last_error' => null,
            'available_at' => null,
            'sent_at' => now(),
            'completed_at' => $awaitingFlow ? null : now(),
        ])->save();

        return $awaitingFlow ? 'sent' : 'complete';
    }

    private function claim(IntegrationEvent $event): bool
    {
        $claimed = IntegrationEvent::query()
            ->whereKey($event->id)
            ->whereIn('status', ['pending', 'failed'])
            ->where('attempts', $event->attempts)
            ->update(['attempts' => $event->attempts + 1, 'available_at' => now()->addMinutes(10), 'updated_at' => now()]);

        if ($claimed === 1) {
            $event->refresh();

            return true;
        }

        return false;
    }

    private function fail(IntegrationEvent $event, Throwable $e): string
    {
        $retryable = $e instanceof ZohoException ? $e->retryable : false;
        $max = (int) config('zoho.sync.max_attempts', 6);

        $next = null;
        if ($retryable && $event->attempts < $max) {
            $backoff = config('zoho.sync.backoff', [60]);
            $base = $backoff[min($event->attempts - 1, count($backoff) - 1)] ?? 60;
            $next = now()->addSeconds($base + random_int(0, (int) ceil($base * 0.2)));
        }

        if (! $e instanceof ZohoException) {
            report($e);
        }

        $event->forceFill([
            'status' => 'failed',
            'last_error' => mb_substr(get_class($e) === ZohoException::class ? $e->getMessage() : class_basename($e).': '.$e->getMessage(), 0, 1000),
            'available_at' => $next,
        ])->save();

        return 'failed';
    }
}
