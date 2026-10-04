<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Document;
use App\Models\DealRoom\Folder;
use App\Models\DealRoom\Item;
use App\Models\DealRoom\Offer;
use App\Models\DealRoom\Party;
use App\Models\DealRoom\Question;
use App\Models\DealRoom\Room;
use App\Models\User;

/** Page-specific payloads for the shared stage template. */
class StageData
{
    public static function for(Room $room, string $page, ?User $user): array
    {
        return match ($page) {
            'diagnostic' => self::diagnostic($room),
            'mandate' => self::mandate($room),
            'created' => self::created($room),
            'data-room-build' => self::dataRoom($room, $user),
            'ai-intake-review' => self::intake($room),
            'counterparty-qualification', 'review-and-send-invitations' => self::counterparties($room),
            'controlled-access-and-disclosure' => self::access($room),
            'ai-qa-assistant' => self::qa($room),
            'live-negotiation' => self::negotiation($room),
            'offer-term-sheet-management' => self::offers($room),
            'legal-documentation' => ['docs' => self::items($room, 'legal_doc'), 'issues' => self::items($room, 'legal_issue')],
            'conditions-precedent' => self::conditions($room),
            'signing-completion-close' => self::signing($room),
            'post-closing-handover' => ['handover' => self::items($room, 'handover'), 'workstreams' => self::items($room, 'workstream'), 'risks' => self::items($room, 'post_close_risk')],
            'archive-monitoring-exit', 'archive-renewal' => self::archive($room),
            default => [],
        };
    }

    public static function items(Room $room, string $kind): array
    {
        return $room->items()->where('kind', $kind)->get()->map(fn (Item $i) => [
            'id' => $i->id, 'title' => $i->title, 'owner' => $i->owner, 'status' => $i->status,
            'due' => $i->due_date?->format('d M Y'), 'meta' => $i->meta ?? [], 'updated' => $i->updated_at->format('d M Y'),
        ])->all();
    }

    protected static function diagnostic(Room $room): array
    {
        $estimate = Pricing::estimate($room);

        return [
            'progress' => Pricing::diagnosticProgress($room),
            'sections' => Pricing::diagnosticSections(),
            'answers' => $room->diagnostic['answers'] ?? (object) [],
            'options' => Pricing::DIAGNOSTIC_OPTIONS,
            'proposal' => [
                'package' => 'Growth Capital Raise Package',
                'model' => 'Hybrid (Retainer + Stage Gates + Usage)',
                'duration' => '4 – 6 months',
                'experts' => 'Deal Advisor, Financial Modeler, Legal Counsel',
                'external' => 'Tax Advisor, Valuer, Technology Due Diligence',
                'investment' => [$estimate['expert'][0] - 100000, $estimate['expert'][1] - 540000],
            ],
            'pathway' => ['Growth Capital Raise', 'Strategic Investor Engagement', 'Due Diligence & Valuation', 'Term Sheet Negotiation', 'Legal Docs & Closing', 'Post-Investment Support'],
            'evidence' => ['documents' => $room->documents()->count(), 'benchmarks' => 8, 'comparables' => 6, 'reports' => 5],
        ];
    }

    protected static function mandate(Room $room): array
    {
        $c = $room->commercial ?? [];
        $deposit = $room->charges()->where('kind', 'deposit')->latest('id')->first();

        return [
            'commercial' => $c,
            'deposit' => $deposit ? Billing::present($deposit) : null,
            'pack' => [
                ['label' => 'Full conflict clearance completed', 'done' => true],
                ['label' => 'Represented side: Founder / Seller', 'done' => true],
                ['label' => 'Engagement schedule approved', 'done' => ! empty($c['scope_accepted_at'] ?? null)],
                ['label' => 'AI use disclosure accepted', 'done' => ! empty($c['engagement_signed_at'] ?? null)],
                ['label' => 'POPIA notice acknowledged', 'done' => ! empty($c['engagement_signed_at'] ?? null)],
                ['label' => 'Fee schedule accepted', 'done' => ! empty($c['fee_ack_at'] ?? null)],
            ],
            'signatures' => [
                ['name' => $c['signatory'] ?? 'Sponsor Principal', 'authority' => 'Sponsor Principal', 'status' => ! empty($c['engagement_signed_at'] ?? null) ? 'signed' : 'pending'],
                ['name' => 'John Dlamini', 'authority' => 'TBCA Deal Advisor', 'status' => ! empty($c['engagement_signed_at'] ?? null) ? 'signed' : 'pending'],
                ['name' => 'Finance Controller', 'authority' => 'Pricing approval', 'status' => ! empty($c['fee_ack_at'] ?? null) ? 'approved' : 'pending'],
            ],
        ];
    }

    protected static function created(Room $room): array
    {
        return [
            'roomUrl' => route('deal-room.rooms.show', $room),
            'invitationMode' => 'Controlled (Admin Approval)',
            'mfa' => (bool) ($room->security['mfa_external'] ?? true),
            'createdAt' => $room->setup['created_at'] ?? null,
            'template' => Rooms::TEMPLATES[$room->setup['template'] ?? 'fundraising']['name'] ?? 'Fundraising Room',
        ];
    }

    public static function folders(Room $room, ?string $role): array
    {
        Rooms::ensureFolders($room);

        return $room->folders()->withCount('documents')->get()
            ->filter(fn (Folder $f) => Access::folderVisible($f, $role))
            ->map(fn (Folder $f) => [
                'id' => $f->id, 'name' => $f->name, 'documents' => $f->documents_count, 'staged' => $f->staged,
                'released' => (bool) $f->released_at, 'roles' => $f->roles ?? [],
            ])->values()->all();
    }

    public static function presentDocument(Document $d): array
    {
        return [
            'id' => $d->id, 'name' => $d->name, 'folderId' => $d->folder_id, 'folder' => $d->folder?->name,
            'size' => (int) $d->size, 'version' => $d->version, 'category' => $d->category, 'confidence' => $d->confidence,
            'status' => $d->review_status, 'issue' => $d->flag_issue, 'severity' => $d->flag_severity,
            'hash' => $d->sha256 ? substr($d->sha256, 0, 6).'…'.substr($d->sha256, -4) : null,
            'uploaded' => $d->created_at->format('d M Y, H:i'), 'downloadable' => (bool) $d->path,
        ];
    }

    protected static function dataRoom(Room $room, ?User $user): array
    {
        $folders = self::folders($room, Access::role($room, $user));
        $withDocs = collect($folders)->where('documents', '>', 0)->count();
        $docs = $room->documents()->with('folder')->latest('id')->limit(8)->get();
        $approved = $room->documents()->whereIn('review_status', ['approved', 'released'])->count();
        $total = $room->documents()->count();

        return [
            'folders' => $folders,
            'recent' => $docs->map(fn ($d) => self::presentDocument($d))->all(),
            'totalDocuments' => $total,
            'foldersWithDocs' => $withDocs,
            'health' => $folders ? (int) round(($withDocs / count($folders)) * 60 + ($total ? $approved / $total * 40 : 0)) : 0,
            'security' => $room->security ?? Rooms::defaultSecurity(),
        ];
    }

    protected static function intake(Room $room): array
    {
        $docs = $room->documents()->with('folder')->orderBy('id')->get();
        $total = $docs->count();
        $byCat = $docs->groupBy(fn ($d) => $d->category ?? 'Other')->map->count();

        return [
            'documents' => $docs->map(fn ($d) => self::presentDocument($d))->all(),
            'counts' => [
                'total' => $total,
                'ready' => $docs->where('review_status', 'ready')->count(),
                'flagged' => $docs->where('review_status', 'flagged')->count(),
                'approved' => $docs->where('review_status', 'approved')->count(),
                'released' => $docs->where('review_status', 'released')->count(),
            ],
            'classification' => $byCat->map(fn ($n, $cat) => ['label' => $cat, 'count' => $n, 'pct' => $total ? (int) round($n / $total * 100) : 0])->values()->all(),
        ];
    }

    public static function presentParty(Party $p): array
    {
        return [
            'id' => $p->id, 'name' => $p->name, 'email' => $p->email, 'organisation' => $p->organisation, 'role' => $p->role,
            'roleLabel' => Access::ROLES[$p->role] ?? $p->role, 'group' => $p->group_name, 'jurisdiction' => $p->jurisdiction,
            'accessLevel' => $p->access_level, 'status' => $p->status, 'score' => $p->qualification_score, 'mfa' => $p->mfa,
            'nda' => $p->nda_accepted_at?->format('d M Y'), 'invitedAt' => $p->invited_at?->format('d M Y'),
            'expires' => $p->invite_expires_at?->format('d M Y'), 'lastAccess' => $p->last_access_at?->format('d M Y, H:i'),
            'internal' => Access::isInternal($p->role),
        ];
    }

    protected static function counterparties(Room $room): array
    {
        $parties = $room->parties()->orderByDesc('qualification_score')->get();
        $external = $parties->reject(fn ($p) => Access::isInternal($p->role));

        return [
            'parties' => $external->map(fn ($p) => self::presentParty($p))->values()->all(),
            'internal' => $parties->filter(fn ($p) => Access::isInternal($p->role))->map(fn ($p) => self::presentParty($p))->values()->all(),
            'counts' => [
                'invited' => $external->where('status', 'invited')->count(),
                'accepted' => $external->where('status', 'active')->count(),
                'pending' => $external->whereIn('status', ['qualified'])->count(),
                'declined' => $external->where('status', 'declined')->count(),
                'expired' => $external->where('status', 'expired')->count(),
                'high' => $external->where('qualification_score', '>=', 90)->count(),
                'good' => $external->whereBetween('qualification_score', [75, 89])->count(),
                'fair' => $external->whereBetween('qualification_score', [60, 74])->count(),
                'below' => $external->filter(fn ($p) => $p->qualification_score !== null && $p->qualification_score < 60)->count(),
            ],
            'roles' => Access::ROLES,
            'matrix' => Access::matrix(),
            'message' => "Dear {Name},\n\nYou are invited to join the {$room->name} Virtual Deal Room.\n\nYou will have controlled access to documents based on your role and permissions.\n\nPlease accept the invitation to proceed.\n\nBest regards,\nThe TBCA Deal Team",
        ];
    }

    protected static function access(Room $room): array
    {
        $docTotal = $room->documents()->count();
        $parties = $room->parties()->whereIn('status', ['active', 'invited'])->get();
        $logs = $room->accessLogs()->where('created_at', '>=', now()->subDays(7))->get();
        $visibleFolders = fn (Party $p) => $room->folders()->get()->filter(fn ($f) => Access::folderVisible($f, $p->role))->pluck('id');

        return [
            'participants' => $parties->map(fn ($p) => [
                ...self::presentParty($p),
                'docAccess' => $room->documents()->whereIn('folder_id', $visibleFolders($p))->count().' / '.$docTotal,
            ])->all(),
            'activity' => [
                'views' => $logs->where('action', 'view')->count(),
                'downloads' => $logs->where('action', 'download')->count(),
                'denied' => $logs->where('action', 'denied')->count(),
                'total' => $logs->count(),
            ],
            'log' => $room->accessLogs()->latest('id')->limit(10)->get()->map(fn ($l) => [
                'action' => $l->action, 'watermark' => $l->watermark, 'at' => $l->created_at->format('d M Y H:i'),
                'document' => $l->document_id ? Document::find($l->document_id)?->name : null,
            ])->all(),
            'security' => $room->security ?? Rooms::defaultSecurity(),
            'compliance' => [
                'activeUsers' => $parties->where('status', 'active')->count(),
                'roles' => $parties->pluck('role')->unique()->count(),
                'mfa' => $parties->where('mfa', true)->count(),
                'nda' => $parties->whereNotNull('nda_accepted_at')->count(),
                'expired' => $room->parties()->where('status', 'expired')->count(),
            ],
            'folders' => self::folders($room, 'owner'),
        ];
    }

    protected static function qa(Room $room): array
    {
        $qs = $room->questions()->latest('id')->get();

        return [
            'questions' => $qs->map(fn (Question $q) => [
                'id' => $q->id, 'question' => $q->question, 'answer' => $q->answer, 'sources' => $q->sources ?? [], 'confidence' => $q->confidence,
                'status' => $q->status, 'askedBy' => $q->asked_by, 'answeredBy' => $q->answered_by, 'at' => $q->created_at->format('d M Y H:i'),
            ])->all(),
            'stats' => [
                'asked' => $qs->count(),
                'answered' => $qs->where('status', 'answered')->count(),
                'high' => $qs->where('confidence', '>=', 80)->count(),
                'medium' => $qs->whereBetween('confidence', [50, 79])->count(),
                'low' => $qs->filter(fn ($q) => $q->confidence !== null && $q->confidence < 50)->count(),
                'escalated' => $qs->where('status', 'escalated')->count(),
                'open' => $qs->where('status', 'open')->count(),
            ],
            'suggested' => [
                'What is the company\'s revenue for the last 3 years?', 'Show the latest audited financial statements.', 'What are the key risks highlighted in the risk register?',
                'Summarise the use of proceeds.', 'What are the material contracts?',
            ],
        ];
    }

    protected static function negotiation(Room $room): array
    {
        return [
            'state' => $room->stateGet('negotiation', []),
            'actions' => self::items($room, 'action'),
            'participants' => $room->parties()->where('status', 'active')->get()->map(fn ($p) => self::presentParty($p))->all(),
            'questions' => ['reviewed' => $room->questions()->count(), 'open' => $room->questions()->where('status', 'open')->count(), 'answered' => $room->questions()->where('status', 'answered')->count(), 'escalated' => $room->questions()->where('status', 'escalated')->count()],
        ];
    }

    public static function presentOffer(Offer $o): array
    {
        return [
            'id' => $o->id, 'version' => $o->version, 'label' => $o->label, 'side' => $o->side, 'submittedBy' => $o->submitted_by,
            'at' => $o->created_at->format('d M Y H:i'), 'valuation' => (int) $o->valuation_zar, 'investment' => (int) $o->investment_zar,
            'equity' => (float) $o->equity_pct, 'condition' => $o->key_condition, 'terms' => $o->terms ?? [], 'status' => $o->status,
            'approvedAt' => $o->approved_at?->format('d M Y'),
        ];
    }

    protected static function offers(Room $room): array
    {
        return ['offers' => $room->offers()->orderBy('id')->get()->map(fn ($o) => self::presentOffer($o))->all()];
    }

    protected static function conditions(Room $room): array
    {
        $cps = $room->conditions()->get();
        $total = max(1, $cps->count());

        return [
            'conditions' => $cps->map(fn ($c) => [
                'id' => $c->id, 'number' => $c->number, 'condition' => $c->condition, 'category' => $c->category, 'owner' => $c->owner,
                'due' => $c->due_date?->format('d M Y'), 'status' => $c->status, 'evidence' => $c->evidence, 'validated' => $c->validated,
            ])->all(),
            'readiness' => (int) round($cps->whereIn('status', ['satisfied', 'waived'])->count() / $total * 100),
            'counts' => [
                'satisfied' => $cps->whereIn('status', ['satisfied', 'waived'])->count(),
                'in_progress' => $cps->where('status', 'in_progress')->count(),
                'at_risk' => $cps->where('status', 'at_risk')->count(),
                'not_started' => $cps->where('status', 'not_started')->count(),
                'validated' => $cps->where('validated', true)->count(),
            ],
        ];
    }

    protected static function signing(Room $room): array
    {
        $fee = Workflow::feeCharge($room, '13');

        return [
            'signatures' => self::items($room, 'signature'),
            'pack' => self::items($room, 'legal_doc'),
            'funds' => $room->stateGet('funds_flow', []),
            'completed' => Workflow::stage($room, '13')->status === 'completed',
            'completedAt' => Workflow::stage($room, '13')->completed_at?->format('d M Y H:i'),
            'fee' => $fee ? Billing::present($fee) : null,
        ];
    }

    protected static function archive(Room $room): array
    {
        $charge = $room->charges()->where('kind', 'archive_renewal')->latest('id')->first();

        return [
            'archive' => $room->stateGet('archive', []),
            'packages' => Pricing::renewalPackages(),
            'renewalCharge' => $charge ? Billing::present($charge) : null,
            'approvals' => Workflow::approvalsFor($room, 'renewal')->map(fn ($a) => Workflow::presentApproval($a))->all(),
        ];
    }
}
