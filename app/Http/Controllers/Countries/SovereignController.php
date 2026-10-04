<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\Country;
use App\Models\Countries\SovereignEngagement;
use App\Support\Countries\Present;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Track E — sovereign client journey (CT-057 to CT-064) and the conflict regime (Part 15).
 * Stages: 1 Intake -> 2 Conflict & Independence -> 3 Evidence Review -> 4 Deliverable Release -> 5 Closure.
 * No payer, sponsor or interested party can buy, edit or suppress evidence-led findings.
 */
class SovereignController extends Controller
{
    /** SC-02 / SC-03 / SC-04 requests cannot be mitigated — they force a decline. */
    public const DECLINE_TYPES = ['Source Suppression Request', 'Favourable Ranking Request', 'Adverse Fact Removal Request'];

    public const DECLARATION_TYPES = ['Financial Interest', 'Employment History', 'Business Relationship', 'Family / Personal Relationship', 'Client Funds Research About Itself', 'TBCA Advises Counterparty', 'Partner Serves Conflicting Parties', 'Source Suppression Request', 'Favourable Ranking Request', 'Adverse Fact Removal Request', 'No Conflict'];

    public const PANEL = [
        ['John Naidoo', 'Naidoo Advisory', 'Reviewer', 'Economic Policy, Fiscal Management', 24, 'TBCA Independent Reviewer', 95, 4.9, true, 'Lead Reviewer'],
        ['Sarah Mokoena', 'Mokoena & Associates', 'Partner', 'Public Finance, Governance', 22, 'TBCA Accredited Partner', 90, 4.8, true, null],
        ['Richard Govender', 'Govender Strategic Solutions', 'Dual', 'Infrastructure, PPP Advisory', 19, 'TBCA Accredited Partner', 85, 4.8, true, null],
        ['Lindiwe Petersen', 'Petersen Legal Advisors', 'Partner', 'Legal, Regulatory, Compliance', 17, 'TBCA Accredited Partner', 80, 4.7, true, null],
        ['Thabo Khumalo', 'Khumalo Economic Consulting', 'Reviewer', 'Macroeconomics, Policy Analysis', 21, 'TBCA Independent Reviewer', 90, 4.8, true, null],
        ['Thandi Mokoena', 'TBCA Independent Review Panel', 'Reviewer', 'Evidence Review, Methodology', 18, 'TBCA Independent Reviewer', 75, 4.9, true, null],
        ['Dr. Pieter Jacobs', 'Jacobs Sector Insights', 'Reviewer', 'Sector Analysis, Mining', 26, 'TBCA Independent Reviewer', 70, 4.7, true, null],
        ['Aisha Hassan', 'Hassan Evidence Analytics', 'Reviewer', 'QA & Evidence Analysis', 12, 'TBCA Independent Reviewer', 88, 4.6, false, null],
        ['Sipho Dlamini', 'TBCA Ethics Office', 'Reviewer', 'Independence & Ethics', 20, 'TBCA Independence Officer', 92, 4.9, true, null],
        ['Nomvula Zulu', 'Zulu Public Sector Advisory', 'Partner', 'Public Procurement, PFMA', 16, 'TBCA Accredited Partner', 84, 4.6, true, null],
        ['Kwame Mensah', 'Mensah & Partners (Accra)', 'Dual', 'Trade Policy, AfCFTA', 23, 'TBCA Accredited Partner', 66, 4.7, false, null],
        ['Fatima Bello', 'Bello Fiscal Consulting', 'Partner', 'Tax Policy, Revenue Administration', 19, 'TBCA Accredited Partner', 72, 4.5, false, null],
        ['Johan van Wyk', 'Van Wyk Infrastructure', 'Partner', 'Energy, Utilities Regulation', 21, 'TBCA Accredited Partner', 81, 4.6, true, null],
        ['Grace Achieng', 'Achieng Data Governance', 'Dual', 'Statistics, Data Governance', 14, 'TBCA Accredited Partner', 90, 4.8, false, null],
        ['Mandla Ngcobo', 'Ngcobo Monitoring & Evaluation', 'Reviewer', 'M&E, Programme Evaluation', 17, 'TBCA Independent Reviewer', 86, 4.7, true, null],
    ];

    private function own(Request $request, SovereignEngagement $e): void
    {
        abort_unless($e->user_id === $request->user()->id || $request->user()->role === 'admin', 403);
    }

    private function payload(SovereignEngagement $e): array
    {
        return [
            'reference' => $e->reference, 'stage' => $e->stage, 'status' => $e->status, 'intake' => $e->intake, 'declarations' => $e->declarations ?? [],
            'conflict_outcome' => $e->conflict_outcome, 'disclosure_submitted' => $e->disclosure_submitted_at?->format('d M Y H:i'),
            'independence_confirmed' => $e->independence_confirmed_at?->format('d M Y H:i'), 'evidence_approved' => $e->evidence_approved_at?->format('d M Y H:i'),
            'deliverables' => $e->deliverables ?? [], 'closure' => $e->closure, 'closed' => $e->closed_at?->format('d M Y H:i'),
        ];
    }

    private function za(): Country
    {
        return Country::with('domains')->where('iso2', 'ZA')->firstOrFail();
    }

    private function page(string $name, Request $request, ?SovereignEngagement $e, array $extra = []): Response
    {
        if ($e) {
            $this->own($request, $e);
        }

        return Inertia::render("Countries/Sovereign/{$name}", [
            'country' => Present::country($e?->country()->with('domains')->first() ?? $this->za()),
            'engagement' => $e ? $this->payload($e) : null,
            'isAdmin' => $request->user()?->role === 'admin',
            ...$extra,
        ]);
    }

    public function landing(Request $request): Response
    {
        $mine = $request->user() ? SovereignEngagement::where('user_id', $request->user()->id)->latest()->get() : collect();

        return $this->page('Landing', $request, null, [
            'engagements' => $mine->map(fn ($e) => ['reference' => $e->reference, 'title' => $e->intake['title'] ?? '', 'stage' => $e->stage, 'status' => $e->status, 'updated' => $e->updated_at->format('d M Y')]),
            'counts' => ['active' => $mine->whereNotIn('status', ['closed', 'declined'])->count(), 'review' => $mine->whereIn('status', ['evidence_review', 'disclosure'])->count(), 'pending' => $mine->where('status', 'independence')->count(), 'completed' => $mine->where('status', 'closed')->count()],
        ]);
    }

    public function intake(Request $request): Response
    {
        return $this->page('Intake', $request, null);
    }

    public function storeIntake(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['Sovereign Activation', 'Evidence Assurance', 'Policy / Regulatory Advisory', 'Economic / Market Advisory', 'Capability Building'])],
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:500'],
            'priority' => ['required', Rule::in(['High', 'Medium', 'Low'])],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'duration' => ['nullable', 'string', 'max:40'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'entity' => ['required', 'string', 'max:160'],
            'contact' => ['required', 'string', 'max:120'],
            'designation' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'string', 'max:40'],
            'preferred' => ['nullable', 'string', 'max:20'],
            'areas' => ['required', 'array', 'min:1'],
            'areas.*' => ['string', 'max:60'],
            'scope' => ['required', Rule::in(['National (South Africa)', 'Provincial / Regional', 'Cross-Border / International'])],
            'instructions' => ['nullable', 'string', 'max:1000'],
        ], ['areas.required' => 'Select at least one area of support.']);

        $n = SovereignEngagement::count() + 2;
        $e = SovereignEngagement::create([
            'reference' => sprintf('SA-ENG-%s-%s-%03d', now()->format('Y'), now()->format('md'), $n),
            'user_id' => $request->user()->id, 'country_id' => $this->za()->id, 'stage' => 2, 'status' => 'disclosure', 'intake' => $data, 'declarations' => [],
        ]);

        return redirect("/countries/sovereign/{$e->reference}/conflicts")->with('success', 'Engagement intake received. Next: declare conflicts of interest.')->with('reference', $e->reference);
    }

    public function conflicts(Request $request, SovereignEngagement $engagement): Response
    {
        return $this->page('Conflicts', $request, $engagement, ['types' => self::DECLARATION_TYPES]);
    }

    public function addDeclaration(Request $request, SovereignEngagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        abort_unless($engagement->status === 'disclosure', 403);
        $data = $request->validate([
            'type' => ['required', Rule::in(self::DECLARATION_TYPES)],
            'party' => ['required', 'string', 'max:160'],
            'nature' => ['required', 'string', 'max:300'],
            'level' => ['required', Rule::in(['Actual', 'Potential', 'Perceived', 'None'])],
            'plan' => ['required_unless:level,None', 'nullable', 'string', 'max:300'],
        ], ['plan.required_unless' => 'Actual, potential or perceived conflicts need a management plan or safeguard.']);

        $list = $engagement->declarations ?? [];
        $list[] = [...$data, 'id' => sprintf('CD-%04d', count($list) + 1), 'by' => $request->user()->name, 'date' => now()->format('d M Y'), 'plan' => $data['plan'] ?? 'N/A'];
        $engagement->update(['declarations' => $list]);

        return back()->with('success', 'Declaration recorded.');
    }

    public function submitDisclosure(Request $request, SovereignEngagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        $list = collect($engagement->declarations ?? []);
        if ($list->isEmpty()) {
            return back()->with('error', 'Record at least one declaration (use "No Conflict" if none apply).');
        }
        if ($list->whereIn('type', self::DECLINE_TYPES)->isNotEmpty()) {
            $engagement->update(['status' => 'declined', 'conflict_outcome' => 'Declined — request to suppress, rank or remove evidence', 'disclosure_submitted_at' => now()]);

            return back()->with('error', 'Engagement declined: requests to suppress sources, secure favourable ranking or remove adverse facts cannot be mitigated (SC-02/03/04).');
        }
        $managed = $list->whereIn('level', ['Actual', 'Potential', 'Perceived'])->isNotEmpty();
        $engagement->update(['status' => 'independence', 'disclosure_submitted_at' => now(), 'conflict_outcome' => $managed ? 'Cleared with Safeguards' : 'Cleared']);

        return redirect("/countries/sovereign/{$engagement->reference}/independence")->with('success', 'Disclosure submitted: '.($managed ? 'Cleared with Safeguards.' : 'Cleared.'));
    }

    public function independence(Request $request, SovereignEngagement $engagement): Response
    {
        return $this->page('Independence', $request, $engagement);
    }

    public function confirmIndependence(Request $request, SovereignEngagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        $request->validate([
            'ack_payer' => ['accepted'], 'ack_sponsor' => ['accepted'], 'ack_publication' => ['accepted'],
        ], ['*.accepted' => 'All non-negotiable boundaries must be acknowledged.']);
        if ($engagement->status !== 'independence') {
            return back()->with('error', 'The conflict disclosure must be submitted first.');
        }
        $engagement->update(['status' => 'evidence_review', 'stage' => 3, 'independence_confirmed_at' => now()]);

        return redirect("/countries/sovereign/{$engagement->reference}/evidence-review")->with('success', 'Independence statement confirmed (v1.0). The engagement is now with the independent review panel.');
    }

    public function review(Request $request, SovereignEngagement $engagement): Response
    {
        return $this->page('EvidenceReview', $request, $engagement);
    }

    /** TBCA reviewer approval — admins only, and never the sponsor. */
    public function approveReview(Request $request, SovereignEngagement $engagement): RedirectResponse
    {
        abort_unless($request->user()->role === 'admin', 403);
        if ($engagement->status !== 'evidence_review') {
            return back()->with('error', 'This engagement is not awaiting evidence review.');
        }
        $deliverables = $engagement->deliverables ?: [
            ['name' => 'Country Activation Readiness Report', 'type' => 'Report', 'version' => 'v1.0', 'pack' => 'EV-SA-0001', 'reviewer' => 'TBCA Reviewer Panel', 'date' => now()->format('d M Y'), 'quality' => 94, 'status' => 'approved', 'package' => 'CAR-Report_v1.0.zip'],
            ['name' => 'Evidence Assurance Summary', 'type' => 'Summary', 'version' => 'v1.0', 'pack' => 'EV-SA-0002', 'reviewer' => 'Lead Reviewer', 'date' => now()->format('d M Y'), 'quality' => 92, 'status' => 'approved', 'package' => 'EAS_v1.0.zip'],
            ['name' => 'Independence & Conflict Statement', 'type' => 'Statement', 'version' => 'v1.0', 'pack' => 'EV-SA-0003', 'reviewer' => 'TBCA Independence Officer', 'date' => now()->format('d M Y'), 'quality' => 100, 'status' => 'approved', 'package' => 'ICS_v1.0.zip'],
        ];
        $engagement->update(['status' => 'release', 'stage' => 4, 'evidence_approved_at' => now(), 'deliverables' => $deliverables]);

        return back()->with('success', 'Evidence review approved for governed release.');
    }

    public function panel(Request $request): Response
    {
        $rows = collect(self::PANEL)->map(fn ($p) => ['name' => $p[0], 'organisation' => $p[1], 'role' => $p[2], 'expertise' => $p[3], 'experience' => $p[4], 'accreditation' => $p[5], 'availability' => $p[6], 'rating' => $p[7], 'local' => $p[8], 'badge' => $p[9]]);
        $all = $rows;
        if ($r = $request->query('role')) {
            $rows = $rows->where('role', $r);
        }
        if ($q = $request->query('q')) {
            $rows = $rows->filter(fn ($p) => str_contains(strtolower($p['name'].' '.$p['organisation'].' '.$p['expertise']), strtolower($q)));
        }
        if ($request->boolean('local')) {
            $rows = $rows->where('local', true);
        }
        if ($a = $request->query('availability')) {
            $rows = $rows->where('availability', '>=', (int) $a);
        }

        return $this->page('Panel', $request, null, [
            'rows' => $rows->values(), 'filters' => $request->only(['role', 'q', 'local', 'availability']),
            'overview' => ['partners' => $all->where('role', 'Partner')->count(), 'reviewers' => $all->where('role', 'Reviewer')->count(), 'dual' => $all->where('role', 'Dual')->count(), 'total' => $all->count(), 'experience' => round($all->avg('experience'), 1), 'rating' => round($all->avg('rating'), 1), 'availability' => (int) round($all->avg('availability'))],
        ]);
    }

    public function release(Request $request, SovereignEngagement $engagement): Response
    {
        return $this->page('Release', $request, $engagement);
    }

    public function releaseDeliverables(Request $request, SovereignEngagement $engagement): RedirectResponse
    {
        abort_unless($request->user()->role === 'admin', 403);
        $data = $request->validate(['index' => ['nullable', 'integer'], 'notes' => ['nullable', 'string', 'max:500']]);
        if ($engagement->status !== 'release' || ! $engagement->evidence_approved_at) {
            return back()->with('error', 'Deliverables can only be released after the evidence review is approved.');
        }
        $list = $engagement->deliverables;
        foreach ($list as $i => $d) {
            if (($data['index'] ?? null) === null || $data['index'] === $i) {
                if ($d['status'] === 'approved') {
                    $list[$i]['status'] = 'released';
                    $list[$i]['released'] = now()->format('d M Y');
                }
            }
        }
        $all = collect($list)->every(fn ($d) => $d['status'] === 'released');
        $engagement->update(['deliverables' => $list, 'status' => $all ? 'closure' : 'release', 'stage' => $all ? 5 : 4, 'closure' => [...($engagement->closure ?? []), 'release_notes' => $data['notes'] ?? null]]);

        return back()->with('success', $all ? 'All deliverables released to the client with evidence manifest and watermark.' : 'Deliverable released.');
    }

    public function closure(Request $request, SovereignEngagement $engagement): Response
    {
        return $this->page('Closure', $request, $engagement);
    }

    public function close(Request $request, SovereignEngagement $engagement): RedirectResponse
    {
        $this->own($request, $engagement);
        $data = $request->validate([
            'action' => ['required', 'in:acknowledge,close'],
            'rating' => ['required_if:action,close', 'nullable', 'integer', 'between:1,5'],
            'feedback' => ['nullable', 'string', 'max:500'],
        ]);
        if ($engagement->status !== 'closure') {
            return back()->with('error', 'All deliverables must be released before closure.');
        }
        $list = $engagement->deliverables;
        if ($data['action'] === 'acknowledge') {
            foreach ($list as $i => $d) {
                $list[$i]['acknowledged'] = now()->format('d M Y');
            }
            $engagement->update(['deliverables' => $list]);

            return back()->with('success', 'Client acknowledgement recorded for all deliverables.');
        }
        if (collect($list)->contains(fn ($d) => empty($d['acknowledged']))) {
            return back()->with('error', 'Acknowledge receipt of every deliverable before closing.');
        }
        $engagement->update(['status' => 'closed', 'closed_at' => now(), 'closure' => [...($engagement->closure ?? []), 'rating' => $data['rating'], 'feedback' => $data['feedback'], 'archived' => now()->format('d M Y')]]);

        return back()->with('success', 'Sovereign engagement closed and archived (7-year retention).');
    }
}
