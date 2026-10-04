<?php

namespace App\Http\Controllers\About\Admin;

use App\Http\Controllers\Controller;
use App\Models\About\Claim;
use App\Models\About\Correction;
use App\Models\About\Testimonial;
use App\Support\About\Codes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Consent & Testimonial Manager (37) and Correction Workflow (38). */
class GovernanceAdminController extends Controller
{
    /* ---------------- Testimonials ---------------- */

    public function testimonials(Request $request): Response
    {
        $all = Testimonial::all();
        $consent = $all->countBy(fn ($t) => $t->consentState());
        $live = Testimonial::query()->displayable()->pluck('id')->all();
        $channelCounts = collect(Testimonial::CHANNELS)->mapWithKeys(fn ($c) => [$c => $all->filter(fn ($t) => in_array($c, $t->channels ?? [], true))->count()]);

        $items = Testimonial::query()
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w->where('company', 'like', "%{$s}%")->orWhere('person_name', 'like', "%{$s}%")->orWhere('quote', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%")))
            ->when($request->string('status')->toString(), fn ($q, $v) => $q->where('status', $v))
            ->when($request->string('industry')->toString(), fn ($q, $v) => $q->where('industry', $v))
            ->when($request->string('service')->toString(), fn ($q, $v) => $q->where('service_used', $v))
            ->orderByDesc('code')->get()
            ->filter(fn ($t) => ! $request->filled('consent') || $t->consentState() === $request->string('consent')->toString())
            ->values();

        return Inertia::render('About/Admin/Testimonials', [
            'items' => $items->map(fn (Testimonial $t) => [
                'id' => $t->id, 'code' => $t->code, 'company' => $t->company, 'person' => $t->person_name, 'role' => $t->person_role,
                'industry' => $t->industry, 'service' => $t->service_used, 'quote' => $t->quote, 'status' => $t->status,
                'consent' => $t->consentState(), 'consent_date' => optional($t->consent_date)->toDateString(),
                'expires' => optional($t->consent_expires_at)->toDateString(), 'channels' => $t->channels ?? [],
                'live' => in_array($t->id, $live, true), 'featured' => $t->featured,
            ]),
            'kpis' => [
                'total' => $all->count(),
                'published' => $all->where('status', 'published')->count(),
                'live' => count($live),
                'pending' => $all->where('status', 'pending_review')->count(),
                'draft' => $all->where('status', 'draft')->count(),
                'expired' => (int) ($consent['expired'] ?? 0),
                'declined' => $all->where('status', 'declined')->count(),
            ],
            'consent' => collect(['active', 'expired', 'revoked', 'pending', 'declined'])->map(fn ($k) => ['key' => $k, 'count' => (int) ($consent[$k] ?? 0)])->values(),
            'channels' => $channelCounts,
            'filters' => $request->only(['q', 'status', 'industry', 'consent', 'service']),
            'options' => [
                'industries' => $all->pluck('industry')->filter()->unique()->sort()->values(),
                'services' => $all->pluck('service_used')->filter()->unique()->sort()->values(),
            ],
        ]);
    }

    public function testimonialStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'company' => ['required', 'string', 'max:160'],
            'person_name' => ['nullable', 'string', 'max:120'],
            'person_role' => ['nullable', 'string', 'max:120'],
            'industry' => ['nullable', 'string', 'max:80'],
            'service_used' => ['required', 'string', 'max:80'],
            'quote' => ['required', 'string', 'max:600'],
            'consent_date' => ['nullable', 'date', 'before_or_equal:today'],
            'consent_expires_at' => ['nullable', 'date', 'after:today'],
            'channels' => ['array'],
            'channels.*' => [Rule::in(Testimonial::CHANNELS)],
        ]);

        $t = Testimonial::create($data + [
            'code' => Codes::next(Testimonial::class, 'TS-'),
            'status' => 'draft',
            'consent_status' => ! empty($data['consent_date']) ? 'active' : 'pending',
            'rating' => 5,
            'channels' => $data['channels'] ?? [],
        ]);

        return back()->with('success', "{$t->code} created as draft.");
    }

    public function testimonialAction(Request $request, Testimonial $testimonial): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['submit', 'publish', 'unpublish', 'decline', 'revoke_consent', 'renew_consent'])],
            'expires' => ['nullable', 'required_if:action,renew_consent', 'date', 'after:today'],
        ]);

        if ($data['action'] === 'publish' && $testimonial->consentState() !== 'active') {
            return back()->with('error', "{$testimonial->code} cannot be published without active, unexpired consent.");
        }

        match ($data['action']) {
            'submit' => $testimonial->update(['status' => 'pending_review']),
            'publish' => $testimonial->update(['status' => 'published']),
            'unpublish' => $testimonial->update(['status' => 'draft']),
            'decline' => $testimonial->update(['status' => 'declined']),
            // Withdrawal is first-class: revoking consent suppresses every publication instance immediately.
            'revoke_consent' => $testimonial->update(['consent_status' => 'revoked', 'consent_revoked_at' => now()]),
            'renew_consent' => $testimonial->update(['consent_status' => 'active', 'consent_revoked_at' => null, 'consent_date' => now()->toDateString(), 'consent_expires_at' => $data['expires']]),
        };

        return back()->with('success', "{$testimonial->code}: ".str_replace('_', ' ', $data['action']).' recorded.');
    }

    public function consentExport()
    {
        return Codes::csv('tbca-consent-register.csv',
            ['ID', 'Company', 'Person', 'Service', 'Status', 'Consent', 'Consent Date', 'Expiry', 'Channels'],
            Testimonial::orderBy('code')->get()->map(fn ($t) => [
                $t->code, $t->company, $t->person_name, $t->service_used, $t->status, $t->consentState(),
                optional($t->consent_date)->toDateString(), optional($t->consent_expires_at)->toDateString(), implode('|', $t->channels ?? []),
            ]));
    }

    /* ---------------- Correction Workflow ---------------- */

    public function corrections(Request $request): Response
    {
        $all = Correction::all();
        $counts = $all->countBy('status');

        $items = Correction::query()
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w->where('code', 'like', "%{$s}%")->orWhere('title', 'like', "%{$s}%")->orWhere('submitted_by', 'like', "%{$s}%")))
            ->when($request->string('status')->toString(), fn ($q, $v) => $q->where('status', $v))
            ->when($request->string('platform')->toString(), fn ($q, $v) => $q->where('platform', $v))
            ->when($request->string('priority')->toString(), fn ($q, $v) => $q->where('priority', $v))
            ->when($request->date('from'), fn ($q, $d) => $q->whereDate('submitted_at', '>=', $d))
            ->when($request->date('to'), fn ($q, $d) => $q->whereDate('submitted_at', '<=', $d))
            ->orderByDesc('submitted_at')
            ->paginate(10)->withQueryString();

        $map = fn (Correction $c) => [
            'id' => $c->id, 'code' => $c->code, 'title' => $c->title, 'platform' => $c->platform, 'submitted_by' => $c->submitted_by,
            'submitter_email' => $c->submitter_email, 'status' => $c->status, 'priority' => $c->priority,
            'submitted_at' => optional($c->submitted_at)->toIso8601String(), 'target_publish_at' => optional($c->target_publish_at)->toDateString(),
            'assigned_to' => $c->assigned_to, 'description' => $c->description, 'evidence_name' => $c->evidence_name,
            'is_public' => $c->is_public, 'previous_wording' => $c->previous_wording, 'corrected_position' => $c->corrected_position,
            'reason' => $c->reason, 'claim_code' => $c->claim?->code, 'last_verified_at' => optional($c->last_verified_at)->toDateString(),
            'history' => $c->history ?? [],
        ];

        $selected = $request->filled('selected') ? Correction::where('code', $request->string('selected')->toString())->first() : null;
        $selected ??= $items->first();

        return Inertia::render('About/Admin/Corrections', [
            'items' => $items->through($map),
            'selected' => $selected ? $map($selected) : null,
            'kpis' => [
                'total' => $all->count(),
                'open' => (int) (($counts['submitted'] ?? 0) + ($counts['triage'] ?? 0)),
                'in_review' => (int) (($counts['in_review'] ?? 0) + ($counts['awaiting_approval'] ?? 0)),
                'approved' => (int) ($counts['approved'] ?? 0),
                'published' => (int) ($counts['published'] ?? 0),
                'rejected' => (int) ($counts['rejected'] ?? 0),
            ],
            'pipeline' => collect(Correction::PIPELINE)->map(fn ($s) => ['key' => $s, 'count' => (int) ($counts[$s] ?? 0)])->values(),
            'filters' => $request->only(['q', 'status', 'platform', 'priority', 'from', 'to']),
            'options' => [
                'platforms' => $all->pluck('platform')->filter()->unique()->sort()->values(),
                'claims' => Claim::orderBy('code')->get(['id', 'code', 'label', 'statement'])->map(fn ($c) => ['id' => $c->id, 'label' => $c->code.' · '.($c->label ?? $c->statement)]),
            ],
        ]);
    }

    public function correctionStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'platform' => ['required', 'string', 'max:120'],
            'priority' => ['required', Rule::in(Correction::PRIORITIES)],
            'description' => ['required', 'string', 'max:3000'],
            'claim_id' => ['nullable', 'exists:abt_claims,id'],
            'target_publish_at' => ['nullable', 'date', 'after_or_equal:today'],
        ]);

        $c = new Correction($data + [
            'code' => Codes::next(Correction::class, 'COR-'.now()->year.'-'),
            'affected_surface' => $data['platform'],
            'status' => 'submitted',
            'submitted_by' => $request->user()->name,
            'submitter_email' => $request->user()->email,
            'submitted_at' => now(),
        ]);
        $c->log('submitted', null, $request->user()->name);
        $c->save();

        return redirect()->route('admin.about.corrections', ['selected' => $c->code])->with('success', "{$c->code} submitted.");
    }

    public function correctionAction(Request $request, Correction $correction): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['advance', 'reject', 'assign', 'note', 'request_info', 'escalate', 'verify', 'reopen'])],
            'assigned_to' => ['nullable', 'required_if:action,assign', 'string', 'max:120'],
            'note' => ['nullable', 'required_if:action,note', 'required_if:action,request_info', 'string', 'max:2000'],
            'is_public' => ['boolean'],
            'previous_wording' => ['nullable', 'string', 'max:600'],
            'corrected_position' => ['nullable', 'string', 'max:600'],
            'reason' => ['nullable', 'string', 'max:400'],
        ]);
        $by = $request->user()->name;
        $pipeline = Correction::PIPELINE;

        switch ($data['action']) {
            case 'advance':
                $i = array_search($correction->status, $pipeline, true);
                if ($i === false || $correction->status === 'closed') {
                    return back()->with('error', "{$correction->code} cannot advance from {$correction->status}.");
                }
                $next = $pipeline[$i + 1];
                if ($next === 'approved') {
                    if (! $correction->corrected_position && empty($data['corrected_position'])) {
                        return back()->with('error', 'Record the corrected position before approval.');
                    }
                }
                if ($next === 'closed' && ! $correction->last_verified_at) {
                    return back()->with('error', 'Close only with propagation evidence: verify the correction first.');
                }
                $correction->fill(collect($data)->only(['previous_wording', 'corrected_position', 'reason', 'is_public'])->filter(fn ($v) => $v !== null)->all());
                $correction->status = $next;
                if ($next === 'published') {
                    $correction->effective_at = now()->toDateString();
                    // The corrected claim supersedes the old public version.
                    if ($correction->claim) {
                        $correction->claim->update(['correction_id' => $correction->id, 'last_reviewed_at' => now()]);
                    }
                }
                $correction->log($next, $data['note'] ?? null, $by);
                break;
            case 'reject':
                if (in_array($correction->status, ['published', 'closed'], true)) {
                    return back()->with('error', 'Published corrections cannot be rejected.');
                }
                $correction->status = 'rejected';
                $correction->log('rejected', $data['note'] ?? null, $by);
                break;
            case 'reopen':
                $correction->status = 'triage';
                $correction->log('reopened', $data['note'] ?? null, $by);
                break;
            case 'assign':
                $correction->assigned_to = $data['assigned_to'];
                $correction->log('assigned', $data['assigned_to'], $by);
                break;
            case 'note':
                $correction->log('note', $data['note'], $by);
                break;
            case 'request_info':
                $correction->log('more information requested', $data['note'], $by);
                break;
            case 'escalate':
                $i = array_search($correction->priority, Correction::PRIORITIES, true);
                $correction->priority = Correction::PRIORITIES[min($i + 1, count(Correction::PRIORITIES) - 1)];
                $correction->log('escalated', 'Priority now '.$correction->priority, $by);
                break;
            case 'verify':
                if (! in_array($correction->status, ['published', 'closed'], true)) {
                    return back()->with('error', 'Only published corrections can be verified for propagation.');
                }
                $correction->last_verified_at = now()->toDateString();
                $correction->log('propagation verified', $data['note'] ?? null, $by);
                break;
        }
        $correction->save();

        return redirect()->route('admin.about.corrections', array_filter(['selected' => $correction->code] + $request->only(['status', 'q'])))
            ->with('success', "{$correction->code} updated.");
    }
}
