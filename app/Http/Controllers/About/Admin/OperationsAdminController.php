<?php

namespace App\Http\Controllers\About\Admin;

use App\Http\Controllers\Controller;
use App\Models\About\Application;
use App\Models\About\StatusComponent;
use App\Models\About\StatusIncident;
use App\Models\About\TrustCase;
use App\Models\About\Vacancy;
use App\Models\About\WhistleReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Careers applications, non-client cases (complaints, media, partner, whistleblowing) and system status. */
class OperationsAdminController extends Controller
{
    public function careers(Request $request): Response
    {
        return Inertia::render('About/Admin/Careers', [
            'applications' => Application::with('vacancy')
                ->when($request->string('status')->toString(), fn ($q, $v) => $q->where('status', $v))
                ->latest()->paginate(15)->withQueryString()
                ->through(fn (Application $a) => [
                    'id' => $a->id, 'reference' => $a->reference, 'name' => $a->full_name, 'email' => $a->email,
                    'role' => $a->vacancy->title, 'status' => $a->status, 'cv_name' => $a->cv_name, 'has_cv' => (bool) $a->cv_path,
                    'location' => $a->location, 'submitted_at' => $a->created_at->toIso8601String(),
                    'experience' => $a->experience, 'screening' => $a->screening,
                ]),
            'vacancies' => Vacancy::withCount('applications')->orderBy('code')->get()->map(fn (Vacancy $v) => $v->summary() + [
                'id' => $v->id, 'status' => $v->status, 'applications' => $v->applications_count,
            ]),
            'statuses' => Application::STATUSES,
            'filters' => $request->only(['status']),
        ]);
    }

    public function applicationStatus(Request $request, Application $application): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Application::STATUSES)],
            'note' => ['nullable', 'string', 'max:500'],
        ]);
        $application->status = $data['status'];
        $application->log($data['status'], $data['note'] ?? null);
        $application->save();

        return back()->with('success', "{$application->reference} moved to {$data['status']} (human decision recorded).");
    }

    public function applicationCv(Application $application)
    {
        abort_unless($application->cv_path && Storage::disk('local')->exists($application->cv_path), 404);

        return Storage::disk('local')->download($application->cv_path, $application->cv_name);
    }

    public function vacancyStatus(Request $request, Vacancy $vacancy): RedirectResponse
    {
        $status = $request->validate(['status' => ['required', Rule::in(['draft', 'open', 'closed'])]])['status'];
        $vacancy->update(['status' => $status, 'posted_at' => $status === 'open' ? ($vacancy->posted_at ?? now()) : $vacancy->posted_at]);

        return back()->with('success', "{$vacancy->code} is now {$status}.");
    }

    public function cases(Request $request): Response
    {
        $type = $request->string('type')->toString() ?: 'complaint';

        $props = [
            'type' => $type,
            'counts' => [
                'complaint' => TrustCase::where('type', 'complaint')->whereNotIn('status', ['closed'])->count(),
                'media' => TrustCase::where('type', 'media')->whereNotIn('status', ['closed'])->count(),
                'partner' => TrustCase::where('type', 'partner')->whereNotIn('status', ['closed', 'declined'])->count(),
                'whistleblowing' => WhistleReport::where('status', '!=', 'closed')->count(),
            ],
        ];

        if ($type === 'whistleblowing') {
            $props['reports'] = WhistleReport::latest()->get()->map(fn (WhistleReport $r) => [
                'id' => $r->id, 'reference' => $r->reference, 'category' => $r->category, 'subject' => $r->subject,
                'description' => $r->description, 'status' => $r->status, 'anonymous' => $r->anonymous,
                'relationship' => $r->relationship, 'route' => $r->follow_up_route, 'evidence' => $r->evidence_name,
                'reporter' => $r->anonymous ? null : trim(($r->reporter_name ?? '').' '.($r->reporter_email ? "<{$r->reporter_email}>" : '')),
                'messages' => $r->messages ?? [], 'submitted_at' => $r->created_at->toIso8601String(),
            ]);
            $props['statuses'] = WhistleReport::STATUSES;
        } else {
            $props['cases'] = TrustCase::where('type', $type)->latest()->get()->map(fn (TrustCase $c) => [
                'id' => $c->id, 'reference' => $c->reference, 'name' => $c->name, 'email' => $c->email, 'organisation' => $c->organisation,
                'category' => $c->category, 'subject' => $c->subject, 'message' => $c->message, 'status' => $c->status,
                'attachment' => $c->attachment_name, 'details' => $c->details ?? [], 'history' => $c->history ?? [],
                'submitted_at' => $c->created_at->toIso8601String(),
            ]);
            $props['statuses'] = TrustCase::STATUSES[$type] ?? [];
        }

        return Inertia::render('About/Admin/Cases', $props);
    }

    public function caseStatus(Request $request, TrustCase $case): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(TrustCase::STATUSES[$case->type] ?? [])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);
        // A complaint is not closed merely because a response was sent.
        if ($case->type === 'complaint' && $data['status'] === 'closed' && $case->status !== 'resolved') {
            return back()->with('error', 'A complaint can only be closed after it is resolved.');
        }
        $case->status = $data['status'];
        $case->log($data['status'], $data['note'] ?? null);
        $case->save();

        return back()->with('success', "{$case->reference} is now {$data['status']}.");
    }

    public function whistleUpdate(Request $request, WhistleReport $report): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(WhistleReport::STATUSES)],
            'message' => ['nullable', 'string', 'max:3000'],
        ]);
        if (! empty($data['status'])) {
            $report->status = $data['status'];
        }
        if (! empty($data['message'])) {
            $report->addMessage('case_owner', $data['message']);
        }
        $report->save();

        return back()->with('success', "{$report->reference} updated.");
    }

    public function status(): Response
    {
        return Inertia::render('About/Admin/Status', [
            'components' => StatusComponent::orderBy('sort')->get(['id', 'name', 'status', 'uptime_30d', 'response_ms']),
            'incidents' => StatusIncident::with('component')->orderByDesc('starts_at')->limit(30)->get()->map(fn ($i) => [
                'id' => $i->id, 'kind' => $i->kind, 'title' => $i->title, 'status' => $i->status, 'impact' => $i->impact,
                'component' => $i->component?->name, 'starts_at' => optional($i->starts_at)->toIso8601String(),
                'resolved_at' => optional($i->resolved_at)->toIso8601String(),
            ]),
            'statuses' => StatusComponent::STATUSES,
        ]);
    }

    public function componentUpdate(Request $request, StatusComponent $component): RedirectResponse
    {
        $component->update($request->validate(['status' => ['required', Rule::in(StatusComponent::STATUSES)]]));

        return back()->with('success', "{$component->name} set to ".str_replace('_', ' ', $component->status).'.');
    }

    public function incidentStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in(['incident', 'maintenance', 'notice'])],
            'title' => ['required', 'string', 'max:160'],
            'body' => ['nullable', 'string', 'max:2000'],
            'component_id' => ['nullable', 'exists:abt_status_components,id'],
            'impact' => ['required', Rule::in(['none', 'minor', 'major'])],
            'starts_at' => ['nullable', 'date'],
        ]);
        StatusIncident::create($data + [
            'status' => $data['kind'] === 'maintenance' ? 'scheduled' : 'investigating',
            'starts_at' => $data['starts_at'] ?? now(),
        ]);
        if ($data['kind'] === 'incident' && ! empty($data['component_id'])) {
            StatusComponent::whereKey($data['component_id'])->update(['status' => $data['impact'] === 'major' ? 'major_outage' : 'degraded']);
        }

        return back()->with('success', 'Status entry published.');
    }

    public function incidentResolve(StatusIncident $incident): RedirectResponse
    {
        $incident->update(['status' => $incident->kind === 'maintenance' ? 'completed' : 'resolved', 'resolved_at' => now()]);
        if ($incident->kind === 'incident' && $incident->component) {
            $incident->component->update(['status' => 'operational']);
        }

        return back()->with('success', 'Entry resolved.');
    }
}
