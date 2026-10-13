<?php

namespace App\Console\Commands;

use App\Models\IntegrationEvent;
use App\Support\Integrations\Ledger;
use App\Support\Integrations\Zoho\Dispatcher;
use App\Support\Integrations\Zoho\ZohoConfig;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('zoho:sync {--limit= : Maximum events to send in this run} {--release-held : Queue events recorded while the integration was off} {--status : Show ledger counts and stop}')]
#[Description('Send pending integration events to Zoho One (outbox dispatcher)')]
class ZohoSync extends Command
{
    public function handle(Dispatcher $dispatcher): int
    {
        if ($this->option('status')) {
            $counts = IntegrationEvent::query()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
            foreach (IntegrationEvent::STATUSES as $status) {
                $this->line(sprintf('%-9s %d', $status, $counts[$status] ?? 0));
            }

            return self::SUCCESS;
        }

        if (! ZohoConfig::enabled()) {
            $this->warn('Zoho integration is off. Set ZOHO_ENABLED=true and the ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN values first.');

            return self::SUCCESS;
        }

        if ($this->option('release-held')) {
            $this->info(Ledger::releaseHeld().' held events queued for sending.');
        }

        $stats = $dispatcher->run($this->option('limit') ? (int) $this->option('limit') : null);
        $this->info(sprintf('Processed %d: %d complete, %d sent to Flow, %d failed.', $stats['processed'], $stats['complete'], $stats['sent'], $stats['failed']));

        return self::SUCCESS;
    }
}
