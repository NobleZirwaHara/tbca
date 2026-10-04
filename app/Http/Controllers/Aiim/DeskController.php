<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Alert;
use App\Models\Aiim\ApiKey;
use App\Models\Aiim\ArchiveItem;
use App\Models\Aiim\Engagement;
use App\Support\Aiim\DeskData;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Enterprise, Government/DFI and API desks, monitoring alerts and archive.
 *
 * TODO backend: GET renders only. Still to build: API key generation/revocation,
 * white-label settings, alert rules and status changes, archive / deletion
 * requests (POPIA retention), enterprise team and billing management.
 */
class DeskController extends AiimController
{
    public function enterprise(Request $request): Response
    {
        return $this->render($request, 'Aiim/Desk/Enterprise', ['desk' => DeskData::enterprise()], 'Enterprise Desk');
    }

    public function institutional(Request $request): Response
    {
        return $this->render($request, 'Aiim/Desk/Institutional', ['desk' => DeskData::institutional()], 'Government & DFI Desk');
    }

    public function developer(Request $request): Response
    {
        return $this->render($request, 'Aiim/Desk/Developer', [
            'desk' => DeskData::developer(),
            'keys' => ApiKey::query()->where('user_id', $request->user()->id)->latest()->get()->map(fn ($k) => ['name' => $k->name, 'preview' => $k->prefix.'••••••••'.$k->last_four, 'created' => $k->created_at->format('d M Y'), 'status' => $k->status]),
        ], 'API & White-Label');
    }

    public function alerts(Request $request): Response
    {
        $alerts = Alert::query()->where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', $request->user()->id))->latest('raised_at')->get();

        return $this->render($request, 'Aiim/Desk/Alerts', [
            'alerts' => $alerts->map(fn ($a) => ['id' => $a->id, 'risk' => $a->risk, 'category' => $a->category, 'title' => $a->title, 'entity' => $a->entity, 'source' => $a->source, 'confidence' => $a->confidence, 'status' => $a->status, 'channel' => $a->channel, 'raised' => $a->raised_at->format('d M Y H:i')]),
            'byRisk' => $alerts->countBy('risk'),
            'byCategory' => $alerts->countBy('category'),
            'byChannel' => $alerts->countBy('channel'),
            'mandates' => Engagement::query()->where('user_id', $request->user()->id)->whereIn('status', ['in_progress', 'paused', 'delivered'])->count(),
            'watchlists' => \App\Models\Aiim\SavedItem::query()->where('user_id', $request->user()->id)->where('list', 'watchlist')->count(),
        ], 'Monitoring & Alerts');
    }

    public function archive(Request $request): Response
    {
        $items = ArchiveItem::query()->where('user_id', $request->user()->id)->latest('archived_on')->get();

        return $this->render($request, 'Aiim/Desk/Archive', [
            'items' => $items->map(fn ($i) => ['type' => $i->type, 'name' => $i->name, 'related' => $i->related, 'archived' => $i->archived_on->format('d M Y'), 'retain' => $i->retain_until->format('d M Y'), 'size' => $i->size, 'by' => $i->archived_by, 'status' => $i->status]),
            'byType' => $items->countBy('type'),
        ], 'Archive & Deletion');
    }
}
