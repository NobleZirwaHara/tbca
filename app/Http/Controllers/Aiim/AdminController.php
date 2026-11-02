<?php

namespace App\Http\Controllers\Aiim;

use App\Http\Controllers\Controller;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\FeeCode;
use App\Models\Aiim\LedgerEntry;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\Source;
use App\Models\Order;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\DeskData;
use App\Support\Aiim\EngagementFlow;
use App\Support\Industries\ServerTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Staff consoles under /admin/aiim: advisor dashboard (mock 78), finance dashboard (79), admin and
 * pack controls (80), pricing administration (81) and source and confidence administration (82),
 * rebuilt from the "TBCA AIIM Botswana" prototype. The live engagement queue, AIIM orders and fee
 * codes stay on their pages.
 */
class AdminController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Aiim/Admin/Dashboard', DeskData::admin());
    }

    public function advisor(): Response
    {
        return Inertia::render('Aiim/Admin/Advisor', DeskData::advisor() + [
            'queue' => Engagement::query()->with('user', 'advisor')->latest('id')->get()->map(fn ($e) => [
                'reference' => $e->reference, 'title' => $e->title, 'client' => $e->user->name, 'company' => $e->user->company, 'type' => $e->type,
                'status' => EngagementFlow::label($e->status), 'rawStatus' => $e->status, 'advisor' => $e->advisor?->name, 'updated' => $e->updated_at->diffForHumans(),
            ])->values(),
            'reports' => ReportRequest::query()->with('user')->whereIn('status', ['paid', 'in_production'])->get()->map(fn ($r) => ['reference' => $r->reference, 'title' => $r->title, 'client' => $r->user->name, 'status' => $r->status])->values(),
        ]);
    }

    public function finance(): Response
    {
        $orders = Order::query()->where('section', 'aiim')->latest('id')->get();

        return Inertia::render('Aiim/Admin/Finance', DeskData::finance() + [
            'ledger' => ['entries' => LedgerEntry::query()->count(), 'net' => abs((float) LedgerEntry::query()->sum('amount_zar'))],
            'orders' => $orders->take(20)->map(fn ($o) => ['reference' => $o->reference, 'date' => $o->created_at->format('d M Y H:i'), 'kind' => $o->meta['aiim']['kind'] ?? '', 'label' => $o->meta['aiim']['label'] ?? $o->meta['title'] ?? '', 'payer' => $o->billing['name'] ?? '', 'subtotal' => (float) $o->subtotal_zar, 'total' => (float) $o->total_zar, 'status' => $o->status])->values(),
        ]);
    }

    public function pricing(Request $request): Response|StreamedResponse
    {
        if ($request->boolean('csv')) {
            return ServerTable::csv('aiim-price-book', DeskData::priceRows(), $request, DeskData::PRICE_SEARCH, DeskData::PRICE_SORT, [
                'Code' => 'Code', 'Service' => 'Service', 'Module' => 'Module', 'Authority' => 'Authority', 'Benchmark' => 'Benchmark',
                'Bench Basic (ZAR)' => 'Bench Basic', 'Bench Std (ZAR)' => 'Bench Std', 'Entry tier' => 'Entry tier', 'Entry price (ZAR ex VAT)' => 'Entry price',
            ]);
        }

        return Inertia::render('Aiim/Admin/Pricing', [
            'book' => DeskData::pricing($request),
            'feeCodes' => FeeCode::query()->orderBy('category')->orderBy('code')->get()->map(fn ($c) => $c->only(['code', 'name', 'category', 'fee_type', 'pricing_model', 'amount_zar', 'rate', 'status']) + ['effective' => $c->effective_from?->format('d M Y')])->values(),
        ]);
    }

    public function sources(): Response
    {
        return Inertia::render('Aiim/Admin/Sources', DeskData::sources() + [
            'registry' => Source::query()->orderBy('tier')->orderByDesc('confidence')->get()->map(fn ($s) => Catalogue::source($s))->values(),
        ]);
    }
}
