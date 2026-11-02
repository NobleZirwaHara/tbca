<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Alert;
use App\Models\Aiim\ApiKey;
use App\Models\Aiim\ArchiveItem;
use App\Models\Aiim\Comparison;
use App\Models\Aiim\LedgerEntry;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\SavedItem;
use App\Support\Aiim\DeskData;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Enterprise (mock 72), API and white label (73), Government and DFI (74), monitoring alerts (75)
 * and archive and deletion (76), rebuilt from the "TBCA AIIM Botswana" prototype.
 *
 * GET renders only. Archive and deletion shows what the account holds; deletion is not performed
 * online (the page says so and points to the data protection contact).
 */
class DeskController extends AiimController
{
    public function enterprise(Request $request): Response
    {
        return $this->render($request, 'Aiim/Desk/Enterprise', DeskData::enterprise(), 'Enterprise Desk');
    }

    public function institutional(Request $request): Response
    {
        return $this->render($request, 'Aiim/Desk/Institutional', DeskData::govDfi(), 'Government & DFI Desk');
    }

    public function developer(Request $request): Response
    {
        return $this->render($request, 'Aiim/Desk/Developer', DeskData::api() + [
            'keys' => ApiKey::query()->where('user_id', $request->user()->id)->latest()->get()->map(fn ($k) => ['name' => $k->name, 'preview' => $k->prefix.'••••••••'.$k->last_four, 'created' => $k->created_at->format('d M Y'), 'status' => $k->status])->values(),
        ], 'API & White-Label');
    }

    public function alerts(Request $request): Response
    {
        $feed = Alert::query()->where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', $request->user()->id))->latest('raised_at')->get();

        return $this->render($request, 'Aiim/Desk/Alerts', DeskData::alerts() + [
            'feed' => $feed->map(fn ($a) => ['id' => $a->id, 'risk' => $a->risk, 'category' => $a->category, 'title' => $a->title, 'entity' => $a->entity, 'status' => $a->status, 'channel' => $a->channel, 'raised' => $a->raised_at->format('d M Y')])->values(),
        ], 'Monitoring & Alerts');
    }

    public function archive(Request $request): Response
    {
        $user = $request->user();
        $items = ArchiveItem::query()->where('user_id', $user->id)->latest('archived_on')->get();

        return $this->render($request, 'Aiim/Desk/Archive', [
            'stored' => [
                'saved' => SavedItem::query()->where('user_id', $user->id)->where('list', 'saved')->count(),
                'watchlist' => SavedItem::query()->where('user_id', $user->id)->where('list', 'watchlist')->count(),
                'comparisons' => Comparison::query()->where('user_id', $user->id)->count(),
                'manifest' => count((array) $request->session()->get('aiim.fee_items', [])),
                'ledger' => LedgerEntry::query()->where('user_id', $user->id)->count(),
                'reports' => ReportRequest::query()->where('user_id', $user->id)->where('status', '!=', 'draft')->count(),
            ],
            'items' => $items->map(fn ($i) => ['type' => $i->type, 'name' => $i->name, 'related' => $i->related, 'archived' => $i->archived_on->format('d M Y'), 'retain' => $i->retain_until->format('d M Y'), 'size' => $i->size, 'status' => $i->status])->values(),
        ], 'Archive & Deletion');
    }
}
