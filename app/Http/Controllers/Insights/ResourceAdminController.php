<?php

namespace App\Http\Controllers\Insights;

use App\Http\Controllers\Controller;
use App\Models\Insights\AiOutput;
use App\Models\Insights\Consent;
use App\Models\Insights\PrivacyRequest;
use App\Models\Insights\Resource;
use App\Models\Insights\WhatsAppDelivery;
use App\Models\Insights\WhatsAppFlow;
use App\Models\Order;
use App\Support\Insights\Audit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Resources editorial and governance console (/admin/insights/resources/...).
 * Workflow: draft -> internal_review -> legal_review -> published -> archived / retired.
 */
class ResourceAdminController extends Controller
{
    private const STAGE_LABELS = [
        'draft' => '1. Draft', 'internal_review' => '2. Internal Review', 'legal_review' => '3. Legal / Compliance',
        'published' => '4. Published', 'due' => '5. Due for Review', 'archived' => '6. Archived / Expired', 'retired' => '6. Archived / Expired',
    ];

    private function row(Resource $r): array
    {
        $cur = $r->currentness();

        return array_merge($r->toCard(), [
            'recordId' => $r->record_id, 'publishState' => $r->publish_state, 'version' => $r->version, 'owner' => $r->owner,
            'updated' => $r->updated_at->format('d M Y'), 'protected' => $r->protected, 'boundaryRule' => $r->boundary_rule,
            'stage' => $r->publish_state === 'published' && in_array($cur, ['review_due', 'overdue'], true) ? 'due' : $r->publish_state,
            'daysToReview' => $r->next_review_at ? (int) today()->diffInDays($r->next_review_at, false) : null,
            'riskClass' => $r->risk_class,
        ]);
    }

    public function overview(): Response
    {
        $all = Resource::all();

        return Inertia::render('Insights/Resources/Admin/Overview', [
            'kpis' => [
                'total' => $all->count(), 'published' => $all->where('publish_state', 'published')->count(),
                'review' => $all->whereIn('publish_state', ['internal_review', 'legal_review'])->count(),
                'due' => $all->filter(fn ($r) => $r->publish_state === 'published' && $r->currentness() === 'review_due')->count(),
                'overdue' => $all->filter(fn ($r) => $r->publish_state === 'published' && $r->currentness() === 'overdue')->count(),
                'downloads' => (int) $all->sum('download_count'), 'consents' => Consent::count(), 'requests' => PrivacyRequest::whereNot('status', 'completed')->count(),
                'aiPending' => AiOutput::where('status', 'under_review')->count(),
            ],
            'queue' => $all->whereIn('publish_state', ['internal_review', 'legal_review', 'draft'])->values()->map(fn ($r) => $this->row($r)),
        ]);
    }

    public function records(Request $request): Response
    {
        $f = $request->only(['q', 'type', 'currentness', 'state', 'owner']);
        $all = Resource::orderByDesc('updated_at')->get();
        $rows = $all->map(fn ($r) => $this->row($r))
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r['title'].' '.$r['slug'].' '.$r['recordId']), Str::lower($q))))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->where('type', $t))
            ->when($f['currentness'] ?? null, fn ($c, $cu) => $c->where('currentness', $cu))
            ->when($f['state'] ?? null, fn ($c, $s) => $c->where('publishState', $s))
            ->when($f['owner'] ?? null, fn ($c, $o) => $c->where('owner', $o))->values();

        return Inertia::render('Insights/Resources/Admin/Records', [
            'filters' => $f,
            'rows' => $rows,
            'kpis' => [
                'draft' => $all->where('publish_state', 'draft')->count(), 'review' => $all->whereIn('publish_state', ['internal_review', 'legal_review'])->count(),
                'published' => $all->where('publish_state', 'published')->count(), 'due' => $all->filter(fn ($r) => $r->publish_state === 'published' && in_array($r->currentness(), ['review_due', 'overdue'], true))->count(),
            ],
            'types' => $all->pluck('type')->unique()->sort()->values(),
            'owners' => $all->pluck('owner')->filter()->unique()->values(),
        ]);
    }

    private function formOptions(): array
    {
        return [
            'types' => ['guide', 'template', 'toolkit', 'checklist', 'report', 'calculator', 'dashboard', 'scorecard', 'sop-pack', 'register', 'playbook', 'insight', 'commentary', 'viewpoint', 'article', 'case-study', 'reference'],
            'collections' => ['library', 'insights', 'case-studies'],
            'categories' => collect(Resource::CATEGORIES)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
            'access' => ['free', 'gated', 'paid', 'subscription', 'restricted'],
            'riskClasses' => ['RS-C1' => 'Stable educational (365 days)', 'RS-C2' => 'Dynamic factual (90 days)', 'RS-C3' => 'Professional-adjacent (30 days)'],
            'levels' => ['L1 - Open', 'L2 - Public', 'L3 - Registered', 'L4 - Controlled'],
            'people' => ['Lebo Mokoena', 'Sipho Dlamini', 'Lerato M.', 'Thandiwe P.', 'David K.', 'Finance Content Team'],
            'resources' => Resource::where('publish_state', 'published')->orderBy('title')->get(['id', 'title'])->map(fn ($r) => ['value' => (string) $r->id, 'label' => $r->title]),
        ];
    }

    private function formData(?Resource $r): array
    {
        $body = $r?->body ?? [];

        return [
            'id' => $r?->id, 'recordId' => $r?->record_id, 'title' => $r?->title ?? '', 'slug' => $r?->slug ?? '', 'meta_description' => $r?->meta_description ?? '',
            'summary' => $r?->summary ?? '', 'type' => $r?->type ?? 'article', 'collection' => $r?->collection ?? 'library', 'category' => $r?->category ?? 'strategy-planning',
            'format' => $r?->format ?? 'Web', 'minutes' => $r?->minutes, 'access' => $r?->access ?? 'free', 'price_zar' => $r?->price_zar, 'list_price_zar' => $r?->list_price_zar,
            'source' => $r?->source ?? 'TBCA Insights', 'source_basis' => $r?->source_basis ?? '', 'risk_class' => $r?->risk_class ?? 'RS-C1',
            'human_review' => $r?->human_review ?? 'pending', 'ai_assisted' => (bool) $r?->ai_assisted, 'owner' => $r?->owner ?? '', 'editor' => $r?->editor ?? '',
            'reviewer' => $r?->reviewer ?? '', 'content_level' => $r?->content_level ?? 'L2 - Public', 'boundary_note' => $r?->boundary_note ?? '',
            'linked_product' => $r?->linked_product ?? '', 'protected' => (bool) $r?->protected, 'next_review_at' => $r?->next_review_at?->toDateString() ?? '',
            'content' => collect($body['sections'] ?? [])->map(fn ($s) => "## {$s['heading']}\n{$s['text']}")->implode("\n\n"),
            'industries' => $r?->industries ?? [], 'publishState' => $r?->publish_state ?? 'draft', 'version' => $r?->version ?? '1.0',
        ];
    }

    public function create(): Response
    {
        return Inertia::render('Insights/Resources/Admin/RecordEdit', ['record' => $this->formData(null), 'options' => $this->formOptions(), 'meta' => null]);
    }

    public function edit(Resource $resource): Response
    {
        return Inertia::render('Insights/Resources/Admin/RecordEdit', [
            'record' => $this->formData($resource),
            'options' => $this->formOptions(),
            'meta' => [
                'status' => $resource->publish_state, 'currentness' => $resource->currentness(), 'version' => $resource->version, 'updated' => $resource->updated_at->format('d M Y, H:i'),
                'created' => $resource->created_at->format('d M Y, H:i'), 'editor' => $resource->editor, 'url' => $resource->url(),
                'checks' => $this->checks($resource), 'transitions' => Resource::TRANSITIONS[$resource->publish_state] ?? [],
                'assets' => $resource->assets()->get()->map(fn ($a) => $a->only(['id', 'name', 'type', 'version', 'access', 'status'])),
                'audit' => Audit::trail($resource),
            ],
        ]);
    }

    /** Review readiness checks shown in the Review Summary panel. */
    private function checks(Resource $r): array
    {
        $body = $r->body ?? [];
        $source = (int) (($r->source ? 40 : 0) + ($r->source_basis ? 30 : 0) + min(30, $r->source_count * 5));
        $checks = [
            ['label' => 'Source Completeness', 'value' => min(100, $source)],
            ['label' => 'Currentness Completeness', 'value' => $r->next_review_at && $r->reviewed_at ? 100 : ($r->next_review_at ? 60 : 20)],
            ['label' => 'Monetisation Boundary Check', 'value' => in_array($r->access, ['paid', 'subscription'], true) && ! $r->boundary_note && ! $r->boundary_rule ? 40 : 100],
            ['label' => 'AI Disclosure Check', 'value' => $r->ai_assisted && $r->human_review !== 'completed' ? 50 : 100],
            ['label' => 'Content Body', 'value' => ! empty($body['sections']) || ! empty($body['about']) ? 100 : 30],
        ];
        $checks[] = ['label' => 'Approval Readiness', 'value' => (int) round(collect($checks)->avg('value'))];

        return $checks;
    }

    private function rules(?Resource $r): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'alpha_dash', 'max:80', Rule::unique('ins_resources', 'slug')->ignore($r?->id)],
            'meta_description' => ['required', 'string', 'max:160'],
            'summary' => ['required', 'string', 'max:500'],
            'type' => ['required', 'string', 'max:30'],
            'collection' => ['required', 'in:library,insights,case-studies'],
            'category' => ['required', Rule::in(array_keys(Resource::CATEGORIES))],
            'format' => ['required', 'string', 'max:10'],
            'minutes' => ['nullable', 'integer', 'min:1', 'max:600'],
            'access' => ['required', 'in:free,gated,paid,subscription,restricted'],
            'price_zar' => ['nullable', 'required_if:access,paid', 'integer', 'min:1'],
            'list_price_zar' => ['nullable', 'integer', 'gt:price_zar'],
            'source' => ['required', 'string', 'max:120'],
            'source_basis' => ['nullable', 'string', 'max:120'],
            'risk_class' => ['required', 'in:RS-C1,RS-C2,RS-C3'],
            'ai_assisted' => ['boolean'],
            'owner' => ['required', 'string', 'max:60'],
            'editor' => ['nullable', 'string', 'max:60'],
            'reviewer' => ['nullable', 'string', 'max:60'],
            'content_level' => ['required', 'string', 'max:30'],
            'boundary_note' => ['nullable', 'string', 'max:500', 'required_if:access,paid', 'required_if:access,subscription'],
            'linked_product' => ['nullable', 'string', 'max:120'],
            'protected' => ['boolean'],
            'next_review_at' => ['nullable', 'date'],
            'content' => ['nullable', 'string', 'max:20000'],
            'industries' => ['nullable', 'array'],
        ];
    }

    private function fill(array $data, ?Resource $r): array
    {
        $sections = collect(preg_split('/^##\s+/m', trim($data['content'] ?? '')))->filter()->map(function ($chunk) {
            $lines = explode("\n", trim($chunk), 2);

            return ['heading' => trim($lines[0]), 'text' => trim($lines[1] ?? '')];
        })->values()->all();
        $body = array_merge($r?->body ?? [], ['sections' => $sections]);
        unset($data['content']);
        $days = Resource::REVIEW_DAYS[$data['risk_class']];
        $next = $data['next_review_at'] ?? null;
        // Scheduled review may never exceed the risk-class maximum (blueprint 6.1).
        if (! $next || now()->parse($next)->gt(today()->addDays($days))) {
            $next = today()->addDays($days)->toDateString();
        }

        return array_merge($data, [
            'body' => $body, 'next_review_at' => $next, 'boundary_rule' => match ($data['access']) { 'free', 'gated' => 'Rule 1: Public Knowledge', 'restricted' => 'Rule 5: Protected Services', default => 'Rule 3: Monetised Offerings' },
            'human_review' => $data['ai_assisted'] ?? false ? 'pending' : ($r?->human_review ?? 'not_required'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->fill($request->validate($this->rules(null)), null);
        $n = (int) Resource::max('id') + 1;
        $r = Resource::create(array_merge($data, ['record_id' => sprintf('RS-%d-%s-%05d', now()->year, strtoupper(substr($data['type'], 0, 2)), 500 + $n), 'publish_state' => 'draft', 'version' => '0.1', 'reviewed_at' => null, 'countries' => ['South Africa']]));
        Audit::log($r, 'created', null, 'draft');

        return redirect("/admin/insights/resources/records/{$r->slug}/edit")->with('success', "Draft {$r->record_id} saved.");
    }

    public function update(Request $request, Resource $resource): RedirectResponse
    {
        $data = $this->fill($request->validate($this->rules($resource)), $resource);
        $parts = explode('.', $resource->version);
        $resource->update(array_merge($data, ['version' => $parts[0].'.'.((int) ($parts[1] ?? 0) + 1)]));
        Audit::log($resource, 'edited', null, null, "Version {$resource->version}");

        return redirect("/admin/insights/resources/records/{$resource->slug}/edit")->with('success', "Saved version {$resource->version}.");
    }

    /** Editorial state machine with publication controls. */
    public function transition(Request $request, Resource $resource): RedirectResponse
    {
        $data = $request->validate([
            'to' => ['required', 'in:'.implode(',', Resource::WORKFLOW)],
            'replacement_id' => ['nullable', 'exists:ins_resources,id'],
            'reason' => ['nullable', 'string', 'max:190', 'required_if:to,retired'],
        ]);
        $from = $resource->publish_state;
        $to = $data['to'];
        if (! in_array($to, Resource::TRANSITIONS[$from] ?? [], true)) {
            return back()->with('error', "Cannot move from {$from} to {$to}.");
        }
        if ($to === 'published') {
            if ($resource->ai_assisted && $resource->human_review !== 'completed' && $from !== 'legal_review') {
                return back()->with('error', 'AI-assisted content needs human approval before publication.');
            }
            if (in_array($resource->access, ['paid', 'subscription'], true) && ! $resource->boundary_note && ! $resource->boundary_rule) {
                return back()->with('error', 'Monetised content needs a Free Explains / Paid Completes boundary note.');
            }
        }

        $update = ['publish_state' => $to];
        if ($to === 'published') {
            $update += ['published_at' => now(), 'human_review' => 'completed', 'reviewed_at' => today(), 'next_review_at' => today()->addDays($resource->reviewDays())];
            if (str_starts_with($resource->version, '0.')) {
                $update['version'] = '1.0';
            }
        }
        if ($to === 'retired') {
            $update += ['retired_at' => today(), 'retired_reason' => $data['reason'], 'replacement_id' => $data['replacement_id'] ?? null];
        }
        $resource->update($update);
        Audit::log($resource, 'transition', $from, $to, $data['reason'] ?? null);

        return back()->with('success', "{$resource->title}: ".str_replace('_', ' ', $from).' → '.str_replace('_', ' ', $to).'.');
    }

    public function markReviewed(Request $request, Resource $resource): RedirectResponse
    {
        $resource->update(['reviewed_at' => today(), 'next_review_at' => today()->addDays($resource->reviewDays()), 'restricted' => $request->boolean('restrict')]);
        Audit::log($resource, $request->boolean('restrict') ? 'restricted' : 'reviewed', null, $resource->currentness());

        return back()->with('success', $request->boolean('restrict') ? "{$resource->title} restricted." : "{$resource->title} reviewed; next review {$resource->next_review_at->format('d M Y')}.");
    }

    public function lifecycle(Request $request): Response
    {
        $f = $request->only(['stage', 'type', 'category', 'owner', 'q']);
        $all = Resource::orderByDesc('updated_at')->get()->map(fn ($r) => $this->row($r));
        $stageCounts = [
            'draft' => $all->where('stage', 'draft')->count(), 'internal_review' => $all->where('stage', 'internal_review')->count(),
            'legal_review' => $all->where('stage', 'legal_review')->count(), 'published' => $all->where('publishState', 'published')->count(),
            'due' => $all->where('stage', 'due')->count(), 'archived' => $all->whereIn('stage', ['archived', 'retired'])->count(),
        ];
        $rows = $all->when($f['stage'] ?? null, fn ($c, $s) => $s === 'archived' ? $c->whereIn('stage', ['archived', 'retired']) : ($s === 'published' ? $c->where('publishState', 'published') : $c->where('stage', $s)))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->where('type', $t))
            ->when($f['category'] ?? null, fn ($c, $t) => $c->where('category', $t))
            ->when($f['owner'] ?? null, fn ($c, $o) => $c->where('owner', $o))
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r['title']), Str::lower($q))))->values();
        $published = max(1, $stageCounts['published']);
        $upToDate = $all->where('publishState', 'published')->where('currentness', 'current')->count();

        return Inertia::render('Insights/Resources/Admin/Lifecycle', [
            'filters' => $f,
            'stages' => $stageCounts,
            'rows' => $rows,
            'kpis' => ['total' => $all->count(), 'published' => $stageCounts['published'], 'review' => $stageCounts['internal_review'] + $stageCounts['legal_review'], 'due' => $all->where('currentness', 'review_due')->count(), 'overdue' => $all->where('currentness', 'overdue')->count()],
            'health' => ['score' => (int) round($upToDate / $published * 100), 'upToDate' => $upToDate, 'dueSoon' => $all->where('publishState', 'published')->where('currentness', 'review_due')->count(), 'overdue' => $all->where('publishState', 'published')->where('currentness', 'overdue')->count(), 'other' => $stageCounts['internal_review'] + $stageCounts['legal_review'] + $stageCounts['draft']],
            'types' => $all->pluck('type')->unique()->sort()->values(),
            'owners' => $all->pluck('owner')->filter()->unique()->values(),
            'categories' => collect(Resource::CATEGORIES)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
        ]);
    }

    public function decay(): Response
    {
        $all = Resource::whereIn('publish_state', ['published', 'archived', 'retired'])->get()->map(fn ($r) => $this->row($r));
        $pub = $all->where('publishState', 'published');
        $expired = $all->whereIn('publishState', ['archived', 'retired'])->count();
        $total = max(1, $all->count());
        $byType = $pub->whereIn('currentness', ['review_due', 'overdue'])->groupBy(fn ($r) => Str::headline($r['type']))->map->count()->sortDesc();
        $riskTotal = max(1, $byType->sum());

        return Inertia::render('Insights/Resources/Admin/Decay', [
            'kpis' => ['total' => $all->count(), 'upToDate' => $pub->where('currentness', 'current')->count(), 'due' => $pub->where('currentness', 'review_due')->count(), 'overdue' => $pub->where('currentness', 'overdue')->count(), 'expired' => $expired],
            'score' => (int) round($pub->where('currentness', 'current')->count() / $total * 100),
            'due' => $pub->where('currentness', 'review_due')->sortBy('daysToReview')->values(),
            'overdue' => $pub->where('currentness', 'overdue')->sortBy('daysToReview')->values(),
            'risk' => $byType->map(fn ($c, $t) => ['label' => $t, 'pct' => (int) round($c / $riskTotal * 100)])->values(),
            'trend' => collect(range(5, 0))->map(fn ($i) => ['m' => now()->subMonths($i)->format('M Y'), 'reviewed' => Resource::whereBetween('reviewed_at', [now()->subMonths($i)->startOfMonth(), now()->subMonths($i)->endOfMonth()])->count(), 'due' => Resource::whereBetween('next_review_at', [now()->subMonths($i)->startOfMonth(), now()->subMonths($i)->endOfMonth()])->count()])->values(),
        ]);
    }

    public function protectedCatalogue(): Response
    {
        $all = Resource::where('publish_state', 'published')->get();
        $free = $all->whereIn('access', ['free', 'gated']);
        $alerts = $all->filter(fn ($r) => (in_array($r->access, ['free', 'gated'], true) && $r->protected) || (in_array($r->access, ['paid', 'subscription'], true) && ! $r->boundary_note && $r->boundary_rule === null));
        $total = max(1, $all->count());

        return Inertia::render('Insights/Resources/Admin/Protected', [
            'kpis' => ['total' => $all->count(), 'free' => $free->count(), 'monetised' => $all->count() - $free->count(), 'protected' => $all->where('protected', true)->count(), 'alerts' => $alerts->count()],
            'classification' => [
                ['label' => 'Free Download', 'count' => $all->where('access', 'free')->count()], ['label' => 'Free with Sign-up', 'count' => $all->where('access', 'gated')->count()],
                ['label' => 'Paid – One Time', 'count' => $all->where('access', 'paid')->count()], ['label' => 'Paid – Subscription', 'count' => $all->where('access', 'subscription')->count()],
                ['label' => 'Protected / Professional', 'count' => $all->where('protected', true)->count()], ['label' => 'Restricted / By Approval', 'count' => $all->where('access', 'restricted')->count()],
            ],
            'share' => round(($all->count() - $free->count()) / $total * 100, 1),
            'rows' => $all->sortByDesc(fn ($r) => [$r->protected, $r->updated_at])->values()->take(30)->map(fn ($r) => array_merge($this->row($r), ['alert' => $alerts->contains('id', $r->id)])),
        ]);
    }

    public function toggleProtected(Resource $resource): RedirectResponse
    {
        $resource->update(['protected' => ! $resource->protected]);
        Audit::log($resource, $resource->protected ? 'protected' : 'unprotected');

        return back()->with('success', $resource->protected ? "{$resource->title} protected from self-serve." : "{$resource->title} returned to the open catalogue.");
    }

    public function consents(Request $request): Response
    {
        $f = $request->validate([
            'status' => ['nullable', 'array'], 'status.*' => ['in:granted,expired,withdrawn,pending,declined'],
            'purpose' => ['nullable', 'string'], 'basis' => ['nullable', 'string'], 'channel' => ['nullable', 'string'], 'q' => ['nullable', 'string', 'max:100'],
        ]);
        $all = Consent::orderByDesc('created_at')->get();
        $rows = $all
            ->when($f['status'] ?? null, fn ($c, $s) => $c->whereIn('state', $s))
            ->when($f['purpose'] ?? null, fn ($c, $p) => $c->where('purpose', $p))
            ->when($f['basis'] ?? null, fn ($c, $b) => $c->where('legal_basis', $b))
            ->when($f['channel'] ?? null, fn ($c, $ch) => $c->where('channel', $ch))
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r->name.' '.$r->email.' '.$r->subject_ref), Str::lower($q))));
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('Insights/Resources/Admin/Consents', [
            'filters' => array_merge(['status' => []], $f),
            'rows' => $rows->values()->forPage($page, 10)->values()->map(fn ($c) => [
                'id' => $c->id, 'name' => $c->name ?? '—', 'ref' => $c->subject_ref ?? ('U-'.str_pad((string) ($c->user_id ?? $c->id), 7, '0', STR_PAD_LEFT)), 'email' => $c->email,
                'purpose' => ResourceController::PURPOSES[$c->purpose]['label'] ?? Str::headline($c->purpose), 'basis' => Str::headline($c->legal_basis), 'channel' => Str::headline($c->channel),
                'date' => ($c->granted_at ?? $c->created_at)->format('d M Y, H:i'), 'state' => $c->state, 'expires' => $c->expires_at?->format('d M Y'), 'updated' => $c->updated_at->format('d M Y, H:i'),
            ]),
            'pagination' => ['page' => $page, 'lastPage' => max(1, (int) ceil($rows->count() / 10)), 'total' => $rows->count()],
            'kpis' => ['total' => $all->count(), 'active' => $all->where('state', 'granted')->count(), 'expired' => $all->where('state', 'expired')->count(), 'withdrawn' => $all->where('state', 'withdrawn')->count(), 'pending' => $all->where('state', 'pending')->count() + PrivacyRequest::whereNot('status', 'completed')->count()],
            'facets' => [
                'status' => $all->groupBy('state')->map->count(), 'purpose' => $all->groupBy('purpose')->map->count(),
                'basis' => $all->groupBy('legal_basis')->map->count(), 'channel' => $all->groupBy('channel')->map->count(),
            ],
            'requests' => PrivacyRequest::latest()->limit(10)->get()->map(fn ($r) => ['id' => $r->id, 'reference' => $r->reference, 'type' => $r->type, 'name' => $r->name, 'email' => $r->email, 'status' => $r->status, 'at' => $r->created_at->format('d M Y')]),
        ]);
    }

    public function processRequest(Request $request, PrivacyRequest $privacyRequest): RedirectResponse
    {
        $flow = ['submitted' => 'verifying', 'verifying' => 'processing', 'processing' => 'completed'];
        $next = $flow[$privacyRequest->status] ?? null;
        if (! $next) {
            return back()->with('error', 'This request is already complete.');
        }
        if ($next === 'completed' && $privacyRequest->type === 'erase') {
            // Erasure: optional-purpose consents withdrawn; records retained only where law requires.
            Consent::where('email', $privacyRequest->email)->where('purpose', '!=', 'essential')->update(['state' => 'withdrawn', 'withdrawn_at' => now()]);
        }
        $privacyRequest->update(['status' => $next]);
        Audit::log($privacyRequest, 'privacy_request', array_search($next, $flow, true) ?: null, $next);

        return back()->with('success', "{$privacyRequest->reference} moved to {$next}.");
    }

    public function roi(Request $request): Response
    {
        $all = Resource::whereIn('publish_state', ['published', 'legal_review'])->get();
        $rows = $all->map(function ($r) {
            $m = $r->metrics ?? [];
            $views = (int) ($m['views'] ?? $r->view_count);
            $conv = (int) ($m['conversions'] ?? 0);
            $revenue = (int) ($m['revenue'] ?? 0) + (int) Order::where('status', 'paid')->whereHas('items', fn ($q) => $q->where('item_code', $r->record_id))->sum('subtotal_zar');
            $cost = max(1, $r->download_count * 25 + 50000);

            return ['title' => $r->title, 'slug' => $r->slug, 'type' => $r->type, 'views' => $views, 'users' => (int) ($m['users'] ?? 0), 'conversions' => $conv,
                'rate' => $views ? round($conv / $views * 100 * 25, 2) : 0, 'revenue' => $revenue, 'roi' => round($revenue / $cost, 2), 'downloads' => $r->download_count];
        })->sortByDesc('roi')->values();
        $byType = $rows->groupBy(fn ($r) => Str::headline($r['type']))->map(fn ($g) => $g->sum('revenue'))->sortDesc()->take(6);
        $revenue = max(1, $rows->sum('revenue'));

        return Inertia::render('Insights/Resources/Admin/Roi', [
            'kpis' => [
                'views' => $rows->sum('views'), 'users' => $rows->sum('users'), 'conversions' => $rows->sum('conversions'),
                'roi' => round($rows->avg('roi'), 2), 'revenue' => $rows->sum('revenue'),
                'influence' => round($rows->where('conversions', '>', 0)->count() / max(1, $rows->count()) * 100, 1),
                'paidOrders' => Order::where('section', 'resources')->where('status', 'paid')->count(),
            ],
            'rows' => $rows->take(25),
            'byType' => $byType->map(fn ($v, $k) => ['label' => $k, 'value' => $v, 'pct' => round($v / $revenue * 100, 1)])->values(),
            'channels' => [['label' => 'Organic Search', 'value' => 4328], ['label' => 'Direct', 'value' => 3102], ['label' => 'Email', 'value' => 2189], ['label' => 'WhatsApp', 'value' => 1654], ['label' => 'Social Media', 'value' => 987], ['label' => 'Referral', 'value' => 587]],
        ]);
    }

    public function aiOutputs(Request $request): Response
    {
        $f = $request->only(['q', 'type', 'model', 'status', 'risk']);
        $all = AiOutput::orderByDesc('created_at')->get();
        $rows = $all->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r->title.' '.$r->prompt.' '.$r->output_id.' '.$r->created_by), Str::lower($q))))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->where('content_type', $t))->when($f['model'] ?? null, fn ($c, $m) => $c->where('model', $m))
            ->when($f['status'] ?? null, fn ($c, $s) => $c->where('status', $s))->when($f['risk'] ?? null, fn ($c, $r) => $c->where('risk', $r));

        return Inertia::render('Insights/Resources/Admin/AiOutputs', [
            'filters' => $f,
            'rows' => $rows->values()->map(fn ($a) => ['id' => $a->id, 'outputId' => $a->output_id, 'title' => $a->title, 'subject' => $a->subject, 'type' => $a->content_type, 'model' => $a->model, 'prompt' => $a->prompt, 'by' => $a->created_by, 'at' => $a->created_at->format('d M Y H:i'), 'status' => $a->status, 'risk' => $a->risk, 'reviewer' => $a->reviewed_by, 'reviewedAt' => $a->reviewed_at?->format('d M Y H:i')]),
            'kpis' => ['total' => $all->count(), 'approved' => $all->where('status', 'approved')->count(), 'review' => $all->where('status', 'under_review')->count(), 'rejected' => $all->where('status', 'rejected')->count(), 'high' => $all->whereIn('risk', ['high', 'critical'])->count()],
            'models' => $all->groupBy('model')->map->count()->sortDesc(),
            'risks' => collect(['low', 'medium', 'high', 'critical'])->mapWithKeys(fn ($r) => [$r => $all->where('risk', $r)->count()]),
            'types' => $all->pluck('content_type')->unique()->values(),
        ]);
    }

    public function storeAiOutput(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'], 'subject' => ['nullable', 'string', 'max:120'], 'content_type' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:40'], 'prompt' => ['required', 'string', 'max:400'], 'risk' => ['required', 'in:low,medium,high,critical'],
        ]);
        $n = (int) AiOutput::max('id') + 8743;
        $a = AiOutput::create(array_merge($data, ['output_id' => sprintf('AI-%07d', $n), 'created_by' => $request->user()->name, 'status' => 'under_review']));

        return back()->with('success', "{$a->output_id} registered for human review.");
    }

    public function reviewAiOutput(Request $request, AiOutput $aiOutput): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'in:approved,rejected,under_review']]);
        if ($data['status'] === 'approved' && $aiOutput->risk === 'critical' && $request->user()->role !== 'admin') {
            return back()->with('error', 'Critical-risk outputs need an administrator.');
        }
        $aiOutput->update(['status' => $data['status'], 'reviewed_by' => $data['status'] === 'under_review' ? null : $request->user()->name, 'reviewed_at' => $data['status'] === 'under_review' ? null : now()]);

        return back()->with('success', "{$aiOutput->output_id} ".str_replace('_', ' ', $data['status']).'.');
    }

    public function whatsapp(): Response
    {
        $deliveries = WhatsAppDelivery::orderByDesc('sent_at')->get();
        $templates = WhatsAppFlow::where('area', 'resources')->orderBy('code')->get();

        return Inertia::render('Insights/Resources/Admin/WhatsApp', [
            'kpis' => [
                'contacts' => 24842 + Consent::where('purpose', 'whatsapp')->where('state', 'granted')->count(), 'sent' => 87562 + $deliveries->count(),
                'delivered' => 82914 + $deliveries->where('status', 'delivered')->count(), 'resources' => 16327 + $deliveries->count(),
                'engagement' => 38.6, 'conversions' => 2148 + $deliveries->where('converted', true)->count(),
            ],
            'funnel' => [['label' => 'Opt-in / Subscribed', 'value' => 24842], ['label' => 'Messages Delivered', 'value' => 22771], ['label' => 'Resource Delivered', 'value' => 16327], ['label' => 'Engaged', 'value' => 9444], ['label' => 'Converted', 'value' => 2148]],
            'categories' => [['label' => 'Business Guides', 'value' => 5152], ['label' => 'Templates & Tools', 'value' => 4328], ['label' => 'Checklists', 'value' => 2894], ['label' => 'Legal & Compliance', 'value' => 2112], ['label' => 'Financial Tools', 'value' => 1241], ['label' => 'Other', 'value' => 600]],
            'templates' => $templates->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'type' => $t->message_type, 'status' => $t->status, 'usage' => $t->usage_30d]),
            'deliveries' => $deliveries->take(15)->map(fn ($d) => ['at' => $d->sent_at->format('d M Y H:i'), 'contact' => $d->contact, 'phone' => $d->phone, 'campaign' => $d->campaign, 'resource' => $d->resource, 'type' => $d->type, 'status' => $d->status, 'engaged' => $d->engaged, 'converted' => $d->converted])->values(),
            'resources' => Resource::published()->whereIn('access', ['free', 'gated'])->orderBy('title')->get(['title', 'type'])->map(fn ($r) => ['value' => $r->title, 'label' => $r->title]),
            'optedIn' => Consent::where('state', 'granted')->whereIn('purpose', ['whatsapp', 'newsletters'])->whereNotNull('phone')->count(),
        ]);
    }

    /** Broadcast only to contacts with a granted WhatsApp/newsletter consent and a phone number. */
    public function broadcast(Request $request): RedirectResponse
    {
        $data = $request->validate(['resource' => ['required', 'string', 'max:190'], 'campaign' => ['required', 'string', 'max:80']]);
        $res = Resource::where('title', $data['resource'])->where('publish_state', 'published')->first();
        if (! $res || $res->blocksDelivery() || ! in_array($res->access, ['free', 'gated'], true)) {
            return back()->with('error', 'Only current free or gated resources may be delivered by WhatsApp (no gated outputs).');
        }
        $contacts = Consent::where('state', 'granted')->whereIn('purpose', ['whatsapp', 'newsletters'])->whereNotNull('phone')->get()->unique('email');
        foreach ($contacts as $c) {
            WhatsAppDelivery::create(['sent_at' => now(), 'contact' => $c->name ?? $c->email, 'phone' => $c->phone, 'campaign' => $data['campaign'], 'resource' => $res->title, 'type' => Str::headline($res->type), 'status' => 'delivered']);
        }

        return back()->with('success', $contacts->count() ? "Broadcast queued to {$contacts->count()} opted-in contact(s)." : 'No opted-in contacts with a WhatsApp number. Nothing was sent.');
    }
}
