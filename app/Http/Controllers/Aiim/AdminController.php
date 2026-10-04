<?php

namespace App\Http\Controllers\Aiim;

use App\Http\Controllers\Controller;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\FeeCode;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\Source;
use App\Models\Order;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\DeskData;
use App\Support\Aiim\EngagementFlow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Staff consoles under /admin/aiim.
 *
 * TODO backend: read-only renders. Still to build: engagement queue actions
 * (review, record discovery outcome, issue quote, record counterparty consent,
 * deliver, update progress), report delivery, fee-code edits with pricing
 * version + dual approval, and source / confidence edits.
 */
class AdminController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Aiim/Admin/Dashboard', [
            'data' => DeskData::admin(),
            'counts' => [
                'engagements' => Engagement::query()->count(),
                'awaitingReview' => Engagement::query()->whereIn('status', ['submitted', 'under_review'])->count(),
                'reports' => ReportRequest::query()->whereIn('status', ['paid', 'in_production'])->count(),
                'sources' => Source::query()->count(),
                'feeCodes' => FeeCode::query()->where('status', 'active')->count(),
            ],
            'byStage' => Engagement::query()->get()->countBy(fn ($e) => EngagementFlow::label($e->status)),
        ]);
    }

    public function advisor(): Response
    {
        return Inertia::render('Aiim/Admin/Advisor', [
            'data' => DeskData::advisor(),
            'queue' => Engagement::query()->with('user', 'advisor')->latest('id')->get()->map(fn ($e) => [
                'reference' => $e->reference, 'title' => $e->title, 'client' => $e->user->name, 'company' => $e->user->company, 'type' => $e->type,
                'status' => EngagementFlow::label($e->status), 'rawStatus' => $e->status, 'advisor' => $e->advisor?->name, 'updated' => $e->updated_at->diffForHumans(),
            ]),
            'reports' => ReportRequest::query()->with('user')->whereIn('status', ['paid', 'in_production'])->get()->map(fn ($r) => ['reference' => $r->reference, 'title' => $r->title, 'client' => $r->user->name, 'status' => $r->status]),
        ]);
    }

    public function finance(): Response
    {
        $orders = Order::query()->where('section', 'aiim')->latest('id')->get();

        return Inertia::render('Aiim/Admin/Finance', [
            'totals' => [
                'revenue' => (float) $orders->where('status', 'paid')->sum('subtotal_zar'),
                'vat' => (float) $orders->where('status', 'paid')->sum('vat_zar'),
                'outstanding' => (float) $orders->where('status', '!=', 'paid')->sum('total_zar'),
                'count' => $orders->count(),
                'paid' => $orders->where('status', 'paid')->count(),
                'failed' => $orders->where('status', 'failed')->count(),
            ],
            'byKind' => $orders->where('status', 'paid')->groupBy(fn ($o) => $o->meta['aiim']['kind'] ?? 'other')->map(fn ($g) => round($g->sum('subtotal_zar'), 2)),
            'orders' => $orders->take(20)->map(fn ($o) => ['reference' => $o->reference, 'date' => $o->created_at->format('d M Y H:i'), 'kind' => $o->meta['aiim']['kind'] ?? '—', 'label' => $o->meta['aiim']['label'] ?? $o->meta['title'] ?? '', 'payer' => $o->billing['name'] ?? '—', 'subtotal' => $o->subtotal_zar, 'total' => $o->total_zar, 'status' => $o->status])->values(),
        ]);
    }

    public function pricing(Request $request): Response
    {
        $codes = FeeCode::query()
            ->when($request->query('q'), fn ($q, $s) => $q->where(fn ($w) => $w->where('code', 'like', "%{$s}%")->orWhere('name', 'like', "%{$s}%")))
            ->when($request->query('category'), fn ($q, $c) => $q->where('category', $c))
            ->orderBy('category')->orderBy('code')->get();

        return Inertia::render('Aiim/Admin/Pricing', [
            'codes' => $codes->map(fn ($c) => $c->only(['code', 'name', 'description', 'category', 'fee_type', 'pricing_model', 'amount_zar', 'rate', 'basis', 'components', 'trigger', 'refund_policy', 'status']) + ['effective' => $c->effective_from?->format('d M Y')])->values(),
            'categories' => FeeCode::query()->distinct()->orderBy('category')->pluck('category'),
            'filters' => ['q' => (string) $request->query('q', ''), 'category' => (string) $request->query('category', '')],
        ]);
    }

    public function sources(): Response
    {
        $sources = Source::query()->orderBy('tier')->orderByDesc('confidence')->get();

        return Inertia::render('Aiim/Admin/Sources', [
            'sources' => $sources->map(fn ($s) => Catalogue::source($s, true))->values(),
            'byCategory' => $sources->countBy('category'),
            'models' => $sources->groupBy('confidence_model')->map(fn ($g, $m) => ['model' => $m, 'avg' => round($g->avg('confidence')), 'count' => $g->count()])->values(),
        ]);
    }
}
