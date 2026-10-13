<?php

namespace App\Http\Controllers\Integrations;

use App\Http\Controllers\Controller;
use App\Jobs\SyncIntegrationEvent;
use App\Models\DueDiligence\Check;
use App\Models\DueDiligence\IdentityVerification;
use App\Models\IntegrationEvent;
use App\Support\DueDiligence\Identity\CheckMap;
use App\Support\DueDiligence\Identity\IdentityProviderException;
use App\Support\DueDiligence\Identity\IdentityVerifications;
use App\Support\Integrations\AutomationCoverage;
use App\Support\Integrations\Ledger;
use App\Support\Integrations\Processes;
use App\Support\Integrations\Zoho\ZohoConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * /admin/integrations: integration health, the event ledger, the automation
 * coverage measure and identity verification for Due Diligence checks.
 */
class AdminController extends Controller
{
    public function index(Request $request): Response
    {
        $filter = $request->query('status');
        $filter = in_array($filter, IntegrationEvent::STATUSES, true) ? $filter : null;

        $counts = IntegrationEvent::query()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        $oldestPending = IntegrationEvent::where('direction', 'outbound')->where('status', 'pending')->min('created_at');

        $events = IntegrationEvent::query()
            ->when($filter, fn ($q) => $q->where('status', $filter))
            ->latest('id')->limit(60)->get()
            ->map(fn (IntegrationEvent $e) => [
                'id' => $e->id,
                'eventId' => $e->event_id,
                'source' => $e->source,
                'direction' => $e->direction,
                'type' => $e->type,
                'label' => Processes::TYPES[$e->type][3] ?? $e->type,
                'process' => $e->process,
                'aggregate' => trim(($e->aggregate_type ?? '').' '.($e->aggregate_id ?? '')),
                'status' => $e->status,
                'handledBy' => $e->handled_by,
                'attempts' => $e->attempts,
                'lastError' => $e->last_error,
                'nextAttempt' => $e->status === 'failed' ? $e->available_at?->toIso8601String() : null,
                'steps' => array_keys($e->result['steps'] ?? []),
                'createdAt' => $e->created_at?->toIso8601String(),
            ]);

        $identity = app(IdentityVerifications::class);

        return Inertia::render('Admin/Integrations', [
            'health' => [
                'enabled' => ZohoConfig::enabled(),
                'switchedOn' => (bool) config('zoho.enabled'),
                'hasCredentials' => ZohoConfig::hasCredentials(),
                'dc' => config('zoho.dc'),
                'accountsHost' => ZohoConfig::host('accounts'),
                'apiHost' => ZohoConfig::host('api'),
                'tokenCached' => Cache::has(config('zoho.oauth.cache_key')),
                'webhookSecret' => filled(config('zoho.webhook.secret')),
                'apps' => collect(ZohoConfig::appReadiness())->map(fn ($ok, $app) => ['app' => $app, 'ready' => $ok])->values(),
                'counts' => collect(IntegrationEvent::STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($counts[$s] ?? 0)]),
                'oldestPending' => $oldestPending ? (string) $oldestPending : null,
                'lastComplete' => IntegrationEvent::where('direction', 'outbound')->max('completed_at'),
            ],
            'filter' => $filter,
            'events' => $events,
            'coverage' => AutomationCoverage::report(),
            'identity' => [
                'driver' => $identity->provider()->key(),
                'label' => $identity->provider()->label(),
                'autoStart' => (bool) config('services.identity_verification.auto_start'),
                'vove' => [
                    'environment' => config('services.vove.environment'),
                    'apiKey' => filled(config('services.vove.api_key')),
                    'publicKey' => filled(config('services.vove.public_key')),
                    'webhookSecret' => filled(config('services.vove.webhook_secret')),
                    'flows' => collect(config('services.vove.flows', []))->map(fn ($v) => filled($v)),
                ],
                'map' => CheckMap::table(),
                'eligible' => $this->eligibleChecks(),
                'recent' => IdentityVerification::with('caseFile:id,reference', 'check:id,category')->latest('id')->limit(20)->get()->map(fn ($v) => [
                    'id' => $v->id,
                    'case' => $v->caseFile?->reference,
                    'check' => $v->check?->category,
                    'kind' => $identity->kindLabel($v->kind),
                    'provider' => $v->provider,
                    'status' => $v->status,
                    'providerStatus' => $v->provider_status,
                    'updatedAt' => $v->updated_at?->toIso8601String(),
                ]),
            ],
        ]);
    }

    public function retry(IntegrationEvent $event): RedirectResponse
    {
        abort_unless($event->direction === 'outbound' && in_array($event->status, ['failed', 'pending', 'held'], true), 422, 'Only outbound events that are not finished can be retried.');

        $event->forceFill(['status' => 'pending', 'available_at' => now()])->save();

        if (ZohoConfig::enabled()) {
            SyncIntegrationEvent::dispatch($event->id);
        }

        return back()->with('success', ZohoConfig::enabled() ? 'Event queued for sending.' : 'Event queued. It will be sent once the Zoho integration is switched on.');
    }

    /** A person finished the step by hand. It counts as human-handled in the automation measure. */
    public function resolve(Request $request, IntegrationEvent $event): RedirectResponse
    {
        $data = $request->validate([
            'minutes' => ['required', 'integer', 'min:0', 'max:960'],
            'note' => ['nullable', 'string', 'max:300'],
        ]);
        abort_if($event->status === 'complete', 422, 'This event is already complete.');

        $result = $event->result ?? [];
        $result['resolution'] = ['by' => $request->user()->name, 'note' => $data['note'] ?? null, 'at' => now()->toIso8601String()];

        $event->forceFill([
            'status' => 'complete',
            'handled_by' => 'human',
            'human_minutes' => $data['minutes'],
            'completed_at' => now(),
            'available_at' => null,
            'result' => $result,
        ])->save();

        return back()->with('success', 'Event marked as resolved by staff.');
    }

    public function releaseHeld(): RedirectResponse
    {
        abort_unless(ZohoConfig::enabled(), 422, 'Switch the Zoho integration on before releasing held events.');

        return back()->with('success', Ledger::releaseHeld().' held events queued for sending.');
    }

    public function startCheck(Request $request, Check $check, IdentityVerifications $identity): RedirectResponse
    {
        $data = $request->validate(['kind' => ['nullable', Rule::in(['kyc', 'kyc_address', 'kyb', 'aml_individual', 'aml_entity'])]]);

        try {
            ['verification' => $v, 'link' => $link] = $identity->startForCheck($check, $data['kind'] ?? null);
        } catch (IdentityProviderException $e) {
            return back()->with('error', 'Verification not started: '.$e->getMessage());
        }

        $message = "{$check->category} for {$check->caseFile->reference}: {$identity->kindLabel($v->kind)} is ".str_replace('_', ' ', $v->status).'.';
        if ($link) {
            $message .= ' Send this one-time link to the subject (valid for '.config('services.identity_verification.link_ttl_hours').' hours): '.$link;
        }

        return back()->with('success', $message);
    }

    private function eligibleChecks(): array
    {
        return Check::query()
            ->with('caseFile:id,reference,subject_name,subject_type,status')
            ->whereIn('category', array_keys(CheckMap::CHECKS))
            ->whereIn('status', ['not_started', 'pending', 'in_progress', 'on_hold'])
            ->whereHas('caseFile', fn ($q) => $q->whereIn('status', ['ready_for_checks', 'checks_running', 'review_required']))
            ->latest('id')->limit(25)->get()
            ->map(fn (Check $c) => [
                'id' => $c->id,
                'case' => $c->caseFile->reference,
                'caseStatus' => $c->caseFile->status,
                'subject' => $c->caseFile->subject_name,
                'category' => $c->category,
                'kind' => CheckMap::kindFor($c->category, $c->caseFile->subject_type),
                'coverage' => CheckMap::coverage($c->category),
                'status' => $c->status,
                'started' => IdentityVerification::where('check_id', $c->id)->exists(),
            ])->all();
    }
}
