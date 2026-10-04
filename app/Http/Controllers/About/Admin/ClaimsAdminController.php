<?php

namespace App\Http\Controllers\About\Admin;

use App\Http\Controllers\Controller;
use App\Models\About\Application;
use App\Models\About\CertAsset;
use App\Models\About\Claim;
use App\Models\About\Correction;
use App\Models\About\Evidence;
use App\Models\About\Testimonial;
use App\Models\About\TrustCase;
use App\Models\About\WhistleReport;
use App\Support\About\Codes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Claim Register Console (34), Evidence & Expiry Monitor (35), Certification & Trade Mark Manager (36). */
class ClaimsAdminController extends Controller
{
    public function overview(): Response
    {
        $publishedKeys = Claim::query()->published()->pluck('key');
        $evidence = Evidence::query()->get();

        return Inertia::render('About/Admin/Overview', [
            'kpis' => [
                'claims' => Claim::count(),
                'published' => $publishedKeys->count(),
                'evidence_expired' => $evidence->filter(fn ($e) => $e->expiryStatus() === 'expired')->count(),
                'evidence_expiring' => $evidence->filter(fn ($e) => $e->expiryStatus() === 'expiring_soon')->count(),
                'assets_attention' => CertAsset::all()->filter(fn ($a) => in_array($a->status(), ['expired', 'expiring_soon'], true))->count(),
                'testimonials_live' => Testimonial::query()->displayable()->count(),
                'corrections_open' => Correction::whereNotIn('status', ['published', 'closed', 'rejected'])->count(),
                'applications' => Application::whereIn('status', ['submitted', 'screening'])->count(),
                'cases_open' => TrustCase::whereNotIn('status', ['closed', 'resolved', 'declined'])->count(),
                'whistle_open' => WhistleReport::where('status', '!=', 'closed')->count(),
            ],
            'attention' => Evidence::with('claim')->get()
                ->filter(fn ($e) => in_array($e->expiryStatus(), ['expired', 'expiring_soon'], true))
                ->sortBy('expiry_date')->take(8)
                ->map(fn ($e) => ['code' => $e->code, 'claim' => $e->claim->code.' · '.($e->claim->label ?? $e->claim->statement), 'expiry' => optional($e->expiry_date)->toDateString(), 'status' => $e->expiryStatus()])
                ->values(),
        ]);
    }

    /* ---------------- Claim Register ---------------- */

    private function claimQuery(Request $request): Builder
    {
        return Claim::query()->withCount('evidence')
            ->with(['evidence' => fn ($q) => $q->orderBy('code')])
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w->where('code', 'like', "%{$s}%")->orWhere('statement', 'like', "%{$s}%")))
            ->when($request->string('category')->toString(), fn ($q, $v) => $q->where('category', $v))
            ->when($request->string('review')->toString(), fn ($q, $v) => $q->where('review_status', $v))
            ->when($request->string('verification')->toString(), fn ($q, $v) => $q->where('verification_status', $v))
            ->when($request->string('authority')->toString(), fn ($q, $v) => $q->where('approval_authority', $v))
            ->when($request->date('from'), fn ($q, $d) => $q->whereDate('claimed_on', '>=', $d))
            ->when($request->date('to'), fn ($q, $d) => $q->whereDate('claimed_on', '<=', $d))
            ->orderByDesc('code');
    }

    private function claimRow(Claim $c, array $publishedKeys): array
    {
        $needsAttention = $c->lifecycle === 'active' && $c->review_status === 'approved'
            && $c->evidence->where('verification_status', 'verified')->every(fn ($e) => $e->expiryStatus() === 'expired');

        return [
            'id' => $c->id,
            'code' => $c->code,
            'key' => $c->key,
            'statement' => $c->statement,
            'category' => $c->category,
            'ledger' => $c->ledger,
            'evidence_summary' => $c->evidence->first()?->title,
            'review_status' => $c->review_status,
            'verification_status' => $c->verification_status,
            'lifecycle' => $c->lifecycle,
            'approval_authority' => $c->approval_authority,
            'claimed_on' => optional($c->claimed_on)->toDateString(),
            'last_reviewed_at' => optional($c->last_reviewed_at)->toDateString(),
            'public' => in_array($c->key, $publishedKeys, true),
            'needs_attention' => $needsAttention,
            'surfaces' => $c->surfaces ?? [],
            'evidence' => $c->evidence->map(fn ($e) => [
                'code' => $e->code, 'title' => $e->title, 'issuer' => $e->issuer, 'verification_status' => $e->verification_status,
                'expiry' => optional($e->expiry_date)->toDateString(), 'expiry_status' => $e->expiryStatus(),
            ])->values(),
        ];
    }

    public function claims(Request $request): Response
    {
        $published = Claim::query()->published()->pluck('key')->all();
        $all = Claim::query()->with('evidence')->get();

        return Inertia::render('About/Admin/Claims', [
            'claims' => $this->claimQuery($request)->paginate(10)->withQueryString()->through(fn ($c) => $this->claimRow($c, $published)),
            'kpis' => [
                'total' => $all->count(),
                'verified' => $all->where('verification_status', 'verified')->count(),
                'under_review' => $all->where('review_status', 'under_review')->count(),
                'approved' => $all->where('review_status', 'approved')->count(),
                'attention' => $all->filter(fn ($c) => $c->lifecycle === 'active' && $c->review_status === 'approved' && $c->evidence->where('verification_status', 'verified')->every(fn ($e) => $e->expiryStatus() === 'expired'))->count(),
                'archived' => $all->where('lifecycle', 'archived')->count(),
            ],
            'filters' => $request->only(['q', 'category', 'review', 'verification', 'authority', 'from', 'to']),
            'options' => [
                'categories' => $all->pluck('category')->unique()->sort()->values(),
                'authorities' => $all->pluck('approval_authority')->filter()->unique()->sort()->values(),
            ],
        ]);
    }

    public function claimAction(Request $request, Claim $claim): RedirectResponse
    {
        $action = $request->validate(['action' => ['required', Rule::in(['approve', 'review', 'reject', 'archive', 'restore', 'withdraw', 'verify'])]])['action'];

        if ($action === 'approve' && ! $claim->evidence()->where('verification_status', 'verified')->exists()) {
            return back()->with('error', "{$claim->code} cannot be approved: no verified evidence is linked.");
        }

        $changes = match ($action) {
            'approve' => ['review_status' => 'approved', 'lifecycle' => 'active'],
            'review' => ['review_status' => 'under_review'],
            'reject' => ['review_status' => 'rejected'],
            'archive' => ['lifecycle' => 'archived'],
            'withdraw' => ['lifecycle' => 'withdrawn'],
            'restore' => ['lifecycle' => 'active', 'review_status' => 'under_review'],
            'verify' => ['verification_status' => 'verified'],
        };
        $claim->update($changes + ['last_reviewed_at' => now()]);

        return back()->with('success', "{$claim->code} updated ({$action}).");
    }

    public function claimsExport(Request $request)
    {
        $published = Claim::query()->published()->pluck('key')->all();

        return Codes::csv('tbca-claim-register.csv',
            ['Claim ID', 'Statement', 'Category', 'Ledger', 'Review Status', 'Verification Status', 'Lifecycle', 'Approval Authority', 'Date Claimed', 'Last Reviewed', 'Public'],
            $this->claimQuery($request)->get()->map(fn ($c) => [
                $c->code, $c->statement, $c->category, $c->ledger, $c->review_status, $c->verification_status, $c->lifecycle,
                $c->approval_authority, optional($c->claimed_on)->toDateString(), optional($c->last_reviewed_at)->toDateString(),
                in_array($c->key, $published, true) ? 'yes' : 'no',
            ]));
    }

    /* ---------------- Evidence & Expiry Monitor ---------------- */

    private function evidenceQuery(Request $request): Builder
    {
        return Evidence::query()->with('claim')
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w->where('code', 'like', "%{$s}%")->orWhere('title', 'like', "%{$s}%")
                ->orWhereHas('claim', fn ($c) => $c->where('statement', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%"))))
            ->when($request->string('category')->toString(), fn ($q, $v) => $q->whereHas('claim', fn ($c) => $c->where('category', $v)))
            ->when($request->string('type')->toString(), fn ($q, $v) => $q->where('evidence_type', $v))
            ->when($request->string('verification')->toString(), fn ($q, $v) => $q->where('verification_status', $v))
            ->when($request->string('expiry')->toString(), fn ($q, $v) => $q->expiryStatus($v))
            ->when($request->date('from'), fn ($q, $d) => $q->whereDate('expiry_date', '>=', $d))
            ->when($request->date('to'), fn ($q, $d) => $q->whereDate('expiry_date', '<=', $d))
            ->orderBy('code');
    }

    public function evidence(Request $request): Response
    {
        $all = Evidence::query()->with('claim')->get();
        $by = $all->countBy(fn ($e) => $e->expiryStatus());
        $total = max(1, $all->count());
        // Health score: current/no-expiry verified evidence scores 1, expiring 0.5, expired or unverified 0.
        $score = (int) round(100 * $all->sum(fn ($e) => $e->verification_status !== 'verified' ? 0.4 : match ($e->expiryStatus()) {
            'current', 'no_expiry' => 1, 'expiring_soon' => 0.6, default => 0,
        }) / $total);

        return Inertia::render('About/Admin/Evidence', [
            'items' => $this->evidenceQuery($request)->paginate(10)->withQueryString()->through(fn ($e) => [
                'id' => $e->id,
                'code' => $e->code,
                'claim_code' => $e->claim->code,
                'claim' => $e->claim->statement,
                'category' => $e->claim->category,
                'type' => $e->evidence_type,
                'source' => $e->title,
                'issuer' => $e->issuer,
                'verification_status' => $e->verification_status,
                'expiry' => optional($e->expiry_date)->toDateString(),
                'expiry_status' => $e->expiryStatus(),
                'owner' => $e->owner,
                'ledger' => $e->claim->ledger,
            ]),
            'kpis' => [
                'total' => $all->count(),
                'current' => (int) ($by['current'] ?? 0),
                'expiring_soon' => (int) ($by['expiring_soon'] ?? 0),
                'expired' => (int) ($by['expired'] ?? 0),
                'no_expiry' => (int) ($by['no_expiry'] ?? 0),
            ],
            'upcoming' => $all->filter(fn ($e) => $e->expiry_date && $e->expiry_date->between(now()->startOfDay(), now()->addDays(60)))
                ->sortBy('expiry_date')->take(5)
                ->map(fn ($e) => ['code' => $e->code, 'title' => $e->title, 'expiry' => $e->expiry_date->toDateString(), 'days' => (int) now()->startOfDay()->diffInDays($e->expiry_date)])->values(),
            'score' => $score,
            'filters' => $request->only(['q', 'category', 'type', 'verification', 'expiry', 'from', 'to']),
            'options' => [
                'categories' => $all->pluck('claim.category')->unique()->sort()->values(),
                'types' => $all->pluck('evidence_type')->unique()->sort()->values(),
            ],
        ]);
    }

    public function evidenceAction(Request $request, Evidence $evidence): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['verify', 'reject', 'renew'])],
            'expiry_date' => ['nullable', 'required_if:action,renew', 'date', 'after:today'],
        ]);

        match ($data['action']) {
            'verify' => $evidence->update(['verification_status' => 'verified']),
            'reject' => $evidence->update(['verification_status' => 'rejected']),
            'renew' => $evidence->update(['expiry_date' => $data['expiry_date'], 'as_at_date' => now()->toDateString(), 'verification_status' => 'verified']),
        };
        $evidence->claim->update(['last_reviewed_at' => now()]);

        return back()->with('success', "{$evidence->code}: {$data['action']} recorded.");
    }

    public function evidenceExport(Request $request)
    {
        return Codes::csv('tbca-evidence-monitor.csv',
            ['Evidence ID', 'Claim ID', 'Claim Statement', 'Category', 'Evidence Type', 'Source', 'Issuer', 'Verification', 'Expiry Date', 'Expiry Status', 'Owner'],
            $this->evidenceQuery($request)->get()->map(fn ($e) => [
                $e->code, $e->claim->code, $e->claim->statement, $e->claim->category, $e->evidence_type, $e->title, $e->issuer,
                $e->verification_status, optional($e->expiry_date)->toDateString(), $e->expiryStatus(), $e->owner,
            ]));
    }

    /* ---------------- Certification & Trade Mark Manager ---------------- */

    public function certifications(Request $request): Response
    {
        $all = CertAsset::all();
        $by = $all->countBy(fn ($a) => $a->status());

        $assets = CertAsset::query()
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w->where('code', 'like', "%{$s}%")->orWhere('name', 'like', "%{$s}%")->orWhere('registration_no', 'like', "%{$s}%")->orWhere('jurisdiction', 'like', "%{$s}%")))
            ->when($request->string('type')->toString(), fn ($q, $v) => $q->where('asset_type', $v))
            ->when($request->string('status')->toString(), fn ($q, $v) => $q->status($v))
            ->when($request->string('jurisdiction')->toString(), fn ($q, $v) => $q->where('jurisdiction', $v))
            ->when($request->string('owner')->toString(), fn ($q, $v) => $q->where('owner', $v))
            ->orderBy('code')
            ->paginate(10)->withQueryString()
            ->through(fn (CertAsset $a) => [
                'id' => $a->id, 'code' => $a->code, 'name' => $a->name, 'type' => $a->asset_type, 'jurisdiction' => $a->jurisdiction,
                'registration_no' => $a->registration_no, 'issuer' => $a->issuer, 'status' => $a->status(), 'state' => $a->state,
                'valid_from' => optional($a->valid_from)->toDateString(), 'valid_to' => optional($a->valid_to)->toDateString(),
                'owner' => $a->owner, 'symbol' => $a->displaySymbol(), 'days_left' => $a->daysLeft(),
                'linked_claims' => $a->evidence()->with('claim')->get()->pluck('claim.code')->unique()->values(),
            ]);

        return Inertia::render('About/Admin/Certifications', [
            'assets' => $assets,
            'kpis' => [
                'total' => $all->count(),
                'active' => (int) ($by['active'] ?? 0),
                'expiring_soon' => (int) ($by['expiring_soon'] ?? 0),
                'expired' => (int) ($by['expired'] ?? 0),
                'paused' => (int) (($by['paused'] ?? 0) + ($by['withdrawn'] ?? 0)),
                'jurisdictions' => $all->pluck('jurisdiction')->unique()->count(),
            ],
            'renewals' => $all->filter(fn ($a) => $a->valid_to && $a->state === 'active' && $a->daysLeft() >= 0)->sortBy('valid_to')->take(5)
                ->map(fn ($a) => ['code' => $a->code, 'name' => $a->name, 'valid_to' => $a->valid_to->toDateString(), 'days' => $a->daysLeft()])->values(),
            'filters' => $request->only(['q', 'type', 'status', 'jurisdiction', 'owner']),
            'options' => [
                'jurisdictions' => $all->pluck('jurisdiction')->unique()->sort()->values(),
                'owners' => $all->pluck('owner')->filter()->unique()->sort()->values(),
            ],
        ]);
    }

    public function certStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'asset_type' => ['required', Rule::in(['trade_mark', 'certification', 'attestation'])],
            'jurisdiction' => ['required', 'string', 'max:80'],
            'registration_no' => ['nullable', 'string', 'max:80'],
            'issuer' => ['nullable', 'string', 'max:160'],
            'symbol' => ['nullable', Rule::in(['™', '®'])],
            'valid_from' => ['required', 'date'],
            'valid_to' => ['nullable', 'date', 'after:valid_from'],
            'owner' => ['required', 'string', 'max:120'],
        ]);
        $prefix = ['trade_mark' => 'TM-', 'certification' => 'CERT-', 'attestation' => 'ATT-'][$data['asset_type']];
        $asset = CertAsset::create($data + ['code' => Codes::next(CertAsset::class, $prefix), 'state' => 'active']);

        return back()->with('success', "{$asset->code} added to the register.");
    }

    public function certRenew(Request $request, CertAsset $asset): RedirectResponse
    {
        $data = $request->validate([
            'valid_to' => ['required', 'date', 'after:today'],
            'registration_no' => ['nullable', 'string', 'max:80'],
        ]);
        $asset->update(['valid_to' => $data['valid_to'], 'registration_no' => $data['registration_no'] ?: $asset->registration_no, 'state' => 'active']);
        // Bound evidence follows the register (certificate metadata binds from the controlled record).
        $asset->evidence()->update(['expiry_date' => $data['valid_to'], 'as_at_date' => now()->toDateString(), 'verification_status' => 'verified']);

        return back()->with('success', "{$asset->code} renewed to {$data['valid_to']}; linked evidence updated.");
    }

    public function certState(Request $request, CertAsset $asset): RedirectResponse
    {
        $state = $request->validate(['state' => ['required', Rule::in(['active', 'paused', 'withdrawn'])]])['state'];
        $asset->update(['state' => $state]);
        // A paused / withdrawn certification can no longer support a current claim.
        $asset->evidence()->update(['verification_status' => $state === 'active' ? 'verified' : 'in_review']);

        return back()->with('success', "{$asset->code} set to {$state}.");
    }
}
