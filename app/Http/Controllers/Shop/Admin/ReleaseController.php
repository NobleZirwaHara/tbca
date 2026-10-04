<?php

namespace App\Http\Controllers\Shop\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop\AuditEvent;
use App\Models\Shop\Product;
use App\Models\Shop\ReleaseMetric;
use App\Models\Shop\UatCase;
use App\Support\Shop\Audit;
use App\Support\Shop\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Release and UAT Control Tower (OS-045) and the audit trail. Production is
 * authorised only when all ten release metrics are closed with evidence and
 * every failed UAT case carries a logged exception.
 */
class ReleaseController extends Controller
{
    public function releases(): Response
    {
        $metrics = ReleaseMetric::query()->orderBy('code')->get();
        $cases = UatCase::query()->orderBy('code')->get();

        return Inertia::render('Shop/Admin/Releases', [
            'metrics' => $metrics->map(fn ($m) => [...$m->toArray(), 'closed_at' => $m->closed_at?->toIso8601String()]),
            'cases' => $cases->map(fn ($c) => [...$c->toArray(), 'executed_at' => $c->executed_at?->toIso8601String()]),
            'kpis' => [
                'products' => Product::query()->count(),
                'metrics' => $metrics->count(), 'closed' => $metrics->where('status', 'closed')->count(), 'open' => $metrics->where('status', 'open')->count(),
                'cases' => $cases->count(), 'executed' => $cases->where('result', '!=', 'not_executed')->count(),
                'passed' => $cases->where('result', 'pass')->count(), 'failed' => $cases->where('result', 'fail')->count(), 'blocked' => $cases->where('result', 'blocked')->count(),
            ],
            'release' => [
                'status' => Setting::get('release_status', 'pending'),
                'authorised_at' => Setting::get('release_authorised_at'),
                'authorised_by' => Setting::get('release_authorised_by'),
                'candidate' => 'OS Production Release v3.1',
            ],
            'blockers' => $this->blockers(),
        ]);
    }

    /** @return list<string> */
    private function blockers(): array
    {
        $open = ReleaseMetric::query()->where('status', 'open')->pluck('code')->all();
        $unexcused = UatCase::query()->where('result', 'fail')->whereNull('exception')->pluck('code')->all();
        $blocked = UatCase::query()->whereIn('result', ['blocked', 'not_executed'])->pluck('code')->all();

        return array_values(array_filter([
            $open ? 'Open metrics: '.implode(', ', $open) : null,
            $unexcused ? 'Failed UAT without logged exception: '.implode(', ', $unexcused) : null,
            $blocked ? 'UAT not executed or blocked: '.implode(', ', $blocked) : null,
        ]));
    }

    private function revoke(string $why): void
    {
        if (Setting::get('release_status') === 'authorised') {
            Setting::put('release_status', 'pending');
            Audit::log('release-revoked', 'OS Production Release v3.1', "Authorisation withdrawn: {$why}");
        }
    }

    public function closeMetric(Request $request, ReleaseMetric $metric): RedirectResponse
    {
        $data = $request->validate(['evidence' => ['required', 'string', 'max:120'], 'measured' => ['required', 'string', 'max:60']]);
        $metric->update([...$data, 'status' => 'closed', 'closed_at' => now()]);
        Audit::log('metric-close', $metric->code, "{$metric->metric} closed with {$data['evidence']}");

        return back()->with('success', "{$metric->code} closed.");
    }

    public function reopenMetric(ReleaseMetric $metric): RedirectResponse
    {
        $metric->update(['status' => 'open', 'closed_at' => null]);
        $this->revoke("{$metric->code} reopened");
        Audit::log('metric-reopen', $metric->code, "{$metric->metric} reopened");

        return back()->with('success', "{$metric->code} reopened.");
    }

    public function uat(Request $request, UatCase $case): RedirectResponse
    {
        $data = $request->validate(['result' => ['required', 'in:pass,fail,blocked,not_executed'], 'exception' => ['nullable', 'string', 'max:200']]);
        $case->update([
            'result' => $data['result'],
            'exception' => $data['result'] === 'fail' ? ($data['exception'] ?? $case->exception) : null,
            'executed_by' => $request->user()->name,
            'executed_at' => now(),
        ]);
        if ($data['result'] === 'fail' && ! $case->exception) {
            $this->revoke("{$case->code} failed without exception");
        }
        Audit::log('uat', $case->code, "UAT result {$data['result']}".($case->exception ? " (exception: {$case->exception})" : ''));

        return back()->with('success', "{$case->code} recorded as {$data['result']}.");
    }

    public function authorise(Request $request): RedirectResponse
    {
        $blockers = $this->blockers();
        if ($blockers !== []) {
            return back()->with('error', 'Production cannot be authorised. '.implode('; ', $blockers).'.');
        }
        Setting::put('release_status', 'authorised');
        Setting::put('release_authorised_at', now()->toIso8601String());
        Setting::put('release_authorised_by', $request->user()->name);
        Audit::log('release-authorise', 'OS Production Release v3.1', 'Production authorised: all gates at zero');

        return back()->with('success', 'Production authorised. All gates at zero.');
    }

    public function audit(Request $request): Response
    {
        $events = AuditEvent::query()
            ->when($request->query('q'), fn ($q, $v) => $q->where(fn ($w) => $w->where('subject', 'like', "%{$v}%")->orWhere('summary', 'like', "%{$v}%")->orWhere('actor', 'like', "%{$v}%")))
            ->when($request->query('action'), fn ($q, $v) => $q->where('action', $v))
            ->latest()->paginate(25)->withQueryString();

        return Inertia::render('Shop/Admin/Audit', [
            'events' => ['data' => collect($events->items())->map(fn ($e) => [...$e->only(['id', 'actor', 'action', 'subject', 'summary', 'version']), 'created_at' => $e->created_at?->toIso8601String()]), 'links' => $events->linkCollection(), 'total' => $events->total()],
            'actions' => AuditEvent::query()->distinct()->orderBy('action')->pluck('action'),
            'filters' => $request->only(['q', 'action']),
        ]);
    }
}
