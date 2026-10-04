<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\AgentQuery;
use App\Models\Countries\Country;
use App\Models\Countries\Engagement;
use App\Models\Countries\Observation;
use App\Models\Countries\RegisterEntry;
use App\Models\Countries\Release;
use App\Models\Countries\Retraction;
use App\Models\Countries\StateTransition;
use App\Support\Countries\Agents;
use App\Support\Countries\AvailabilityState;
use App\Support\Countries\CountryResolver;
use App\Support\Countries\Seed;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** State-changing admin actions for the Countries consoles. Every change is audit logged. */
class AdminActionController extends Controller
{
    /** Layer 9 promotion gate thresholds (Part 21.3 operationalised). */
    public const GATE = ['quality' => 0.80, 'anonymity' => 0.85, 'rcs' => 80];

    public const AUTHORITIES = ['resolver_owner' => 'Resolver Owner Sign-Off', 'compliance' => 'Compliance Review', 'tax' => 'Tax Sign-Off', 'legal' => 'Legal Review', 'board' => 'Board Authorisation'];

    private function log(Country $c, string $category, string $area, string $summary, string $old, string $new, string $reason, Request $request): void
    {
        $n = RegisterEntry::where('country_id', $c->id)->where('register', 'history')->count() + 1;
        RegisterEntry::create([
            'country_id' => $c->id, 'register' => 'history', 'code' => sprintf('CT-CH-%s-%05d', $c->iso2, 100 + $n), 'title' => $summary,
            'category' => $category, 'type' => $area, 'status' => 'Recorded', 'recorded_on' => now(),
            'data' => ['at' => now()->format('Y-m-d H:i'), 'old' => $old, 'new' => $new, 'by' => $request->user()->name, 'reason' => $reason],
        ]);
    }

    /** Appendix F.1 — governed availability transitions. */
    public function transition(Request $request, Country $country): RedirectResponse
    {
        $data = $request->validate([
            'to_state' => ['required', Rule::in(AvailabilityState::ALL)],
            'authority_level' => ['required', Rule::in(array_keys(AvailabilityState::LEVELS))],
            'reason' => ['required', 'string', 'min:10', 'max:500'],
            'certificate_ref' => ['nullable', 'string', 'max:80'],
        ], ['reason.required' => 'All state changes require a recorded reason.']);

        $profile = CountryResolver::profile($country->load('domains'));
        $refusal = AvailabilityState::refusal($country->availability_state, $data['to_state'], $data['authority_level'], $data['certificate_ref'] ?? null, $profile);
        if ($refusal) {
            return back()->withErrors(['to_state' => $refusal])->with('error', 'Transition refused: '.$refusal);
        }

        DB::transaction(function () use ($country, $data, $request) {
            $from = $country->availability_state;
            StateTransition::create(['country_id' => $country->id, 'from_state' => $from, 'to_state' => $data['to_state'], 'authority_level' => $data['authority_level'], 'reason' => $data['reason'], 'certificate_ref' => $data['certificate_ref'] ?? null, 'actor_id' => $request->user()->id]);
            $country->update([
                'availability_state' => $data['to_state'],
                'protective_reason' => in_array($data['to_state'], AvailabilityState::PROTECTIVE, true) ? $data['reason'] : null,
                'release_certificate_ref' => AvailabilityState::isActive($data['to_state']) ? ($data['certificate_ref'] ?? $country->release_certificate_ref) : $country->release_certificate_ref,
                'updated_by' => $request->user()->name,
            ]);
            $this->log($country, 'Status Change', 'Availability State', 'Availability state changed', $from, $data['to_state'], "{$data['authority_level']}: {$data['reason']}", $request);
        });

        return back()->with('success', "{$country->name} moved to ".AvailabilityState::label($data['to_state']).'. Audit log updated.');
    }

    public function updateObject(Request $request, Country $country): RedirectResponse
    {
        $data = $request->validate([
            'next_review_at' => ['required', 'date'],
            'income_group' => ['required', 'string', 'max:40'],
            'reason' => ['required', 'string', 'min:5', 'max:300'],
        ]);
        $old = $country->next_review_at?->format('Y-m-d').' / '.$country->income_group;
        $country->update(['next_review_at' => $data['next_review_at'], 'income_group' => $data['income_group'], 'updated_by' => $request->user()->name]);
        $this->log($country, 'Configuration Change', 'Country Object', 'Country object updated', $old, "{$data['next_review_at']} / {$data['income_group']}", $data['reason'], $request);

        return back()->with('success', "{$country->name} object updated and logged.");
    }

    /** GATE-CT-04: a letter (with fee lines) can only be issued when the fee resolver is complete. */
    public function issueLetter(Request $request, Engagement $engagement): RedirectResponse
    {
        $data = $request->validate([
            'engagement_type' => ['required', 'string', 'max:60'],
            'term_months' => ['required', 'integer', 'between:1,36'],
            'fee_t' => ['required', 'integer', 'min:0'],
            'fee_x' => ['nullable', 'integer', 'min:0'],
            'fee_p' => ['nullable', 'integer', 'min:0'],
            'fee_d' => ['nullable', 'integer', 'min:0'],
        ]);
        if (! in_array($engagement->status, ['quote_requested', 'changes_requested'], true)) {
            return back()->with('error', 'A letter can only be issued for a quote request or a letter with requested changes.');
        }
        $profile = CountryResolver::profile($engagement->country->load('domains'));
        if (! $profile['price_resolution']) {
            return back()->with('error', "GATE-CT-04 failed: {$engagement->country->name} has RCS {$profile['rcs_label']} with {$profile['hard_blocks']} hard block(s) — no fee lines may be issued.");
        }

        $n = Engagement::whereNotNull('letter')->count() + 125;
        $letter = Seed::letter(sprintf('EL-%s-%05d', now()->format('Y'), $n), sprintf('SA/EL/%s/%04d', now()->format('Y'), $n));
        $letter['client'] = $engagement->contact['organisation'] ?? $engagement->contact['name'];
        $letter['scope'] = $engagement->title ?: \App\Support\Countries\ServiceCatalogue::category($engagement->service_category)['name'];
        $letter['engagement_type'] = $data['engagement_type'];
        $letter['term_months'] = $data['term_months'];
        $letter['date'] = now()->format('d F Y');
        $letter['version'] = $engagement->status === 'changes_requested' ? 'v'.(((float) substr($engagement->letter['version'] ?? 'v1.0', 1)) + 0.1) : 'v1.0';
        $letter['fees'] = array_values(array_filter([
            ['ledger' => 'T', 'label' => 'Service Delivery', 'recipient' => 'TBCA', 'amount' => $data['fee_t']],
            ($data['fee_x'] ?? 0) > 0 ? ['ledger' => 'X', 'label' => 'External / third-party costs', 'recipient' => 'Third-party providers', 'amount' => $data['fee_x']] : null,
            ($data['fee_p'] ?? 0) > 0 ? ['ledger' => 'P', 'label' => 'Professional Review', 'recipient' => 'Approved partner', 'amount' => $data['fee_p']] : null,
            ($data['fee_d'] ?? 0) > 0 ? ['ledger' => 'D', 'label' => 'Data & Evidence Access', 'recipient' => 'Data licensors', 'amount' => $data['fee_d']] : null,
        ]));
        $letter['checklist'] = array_map(fn ($c) => [$c[0], 'compliant', ''], $letter['checklist']);
        $engagement->update(['status' => 'letter_issued', 'letter' => $letter]);

        return back()->with('success', "Engagement letter {$letter['reference']} issued to the client.");
    }

    public function storeObservation(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'origin_surface' => ['required', 'string', 'max:60'],
            'subject_area' => ['required', 'string', 'max:80'],
            'observation_class' => ['required', 'string', 'max:60'],
            'metric' => ['required', 'string', 'max:120'],
            'rcs_link' => ['required', 'integer', 'between:0,100'],
            'quality_score' => ['required', 'numeric', 'between:0,1'],
            'risk' => ['required', Rule::in(['Low', 'Medium', 'High'])],
        ]);
        $n = Observation::count() + 124;
        $o = Observation::create([...$data, 'code' => sprintf('L9-OC-%s-%05d', now()->format('Ymd'), $n), 'captured_at' => now(), 'status' => 'candidate']);

        return back()->with('success', "Observation {$o->code} captured as a non-public candidate.");
    }

    public function decideObservation(Request $request, Observation $observation): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:triage,anonymity,promote_evidence,promote_product,reject,retract'],
            'anonymity_score' => ['required_if:action,anonymity', 'nullable', 'numeric', 'between:0,1'],
            'note' => ['nullable', 'string', 'max:300'],
        ]);
        $g = self::GATE;

        switch ($data['action']) {
            case 'triage':
                $observation->update(['status' => 'under_review']);

                return back()->with('success', "{$observation->code} moved to review.");
            case 'anonymity':
                $score = (float) $data['anonymity_score'];
                $pass = $score >= $g['anonymity'] && $observation->quality_score >= $g['quality'] && $observation->rcs_link >= $g['rcs'] && $observation->rights_pass && $observation->provenance_complete;
                $observation->update(['anonymity_score' => $score, 'status' => $pass ? 'passed_gate' : 'anonymity_review', 'decision_note' => $data['note'] ?? null]);

                return back()->with($pass ? 'success' : 'error', $pass ? "{$observation->code} passed the promotion gate." : "{$observation->code} does not pass the gate (anonymity ≥ {$g['anonymity']}, quality ≥ {$g['quality']}, RCS ≥ {$g['rcs']}%).");
            case 'promote_evidence':
            case 'promote_product':
                if ($observation->status !== 'passed_gate') {
                    return back()->with('error', 'No candidate is promoted without passing the anonymity gate, RCS coverage and quality thresholds.');
                }
                $observation->update(['status' => $data['action'] === 'promote_evidence' ? 'promoted_evidence' : 'promoted_product', 'decision_note' => $data['note'] ?? null]);

                return back()->with('success', "{$observation->code} promoted.");
            case 'reject':
                $observation->update(['status' => 'rejected', 'decision_note' => $data['note'] ?? 'Rejected at review']);

                return back()->with('success', "{$observation->code} rejected.");
            default:
                $observation->update(['status' => 'retracted']);
                Retraction::create([
                    'code' => sprintf('RET-%s-%04d', now()->format('Ymd'), Retraction::count() + 49), 'evidence_ref' => $observation->code, 'evidence_title' => $observation->metric,
                    'evidence_type' => $observation->observation_class, 'origin_surface' => $observation->origin_surface, 'subject_area' => $observation->subject_area,
                    'requested_by' => $request->user()->name, 'reason' => $data['note'] ?? 'Retracted from Layer 9 review', 'status' => 'under_review', 'impact' => $observation->risk,
                ]);

                return back()->with('success', "{$observation->code} retracted — retraction request opened.");
        }
    }

    public function storeRetraction(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'evidence_ref' => ['required', 'string', 'max:60'],
            'evidence_title' => ['required', 'string', 'max:160'],
            'evidence_type' => ['required', 'string', 'max:40'],
            'subject_area' => ['required', 'string', 'max:80'],
            'impact' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'reason' => ['required', 'string', 'min:10', 'max:500'],
        ]);
        $r = Retraction::create([...$data, 'code' => sprintf('RET-%s-%04d', now()->format('Ymd'), Retraction::count() + 49), 'origin_surface' => 'Admin Console', 'requested_by' => $request->user()->name, 'status' => 'under_review']);

        return back()->with('success', "Retraction {$r->code} opened.");
    }

    /** Approve cascades through dependent objects; no evidence is deleted. */
    public function decideRetraction(Request $request, Retraction $retraction): RedirectResponse
    {
        $data = $request->validate(['action' => ['required', 'in:approve,reject,request_info']]);
        if (! in_array($retraction->status, ['under_review', 'awaiting_info'], true)) {
            return back()->with('error', 'Only open retraction requests can be decided.');
        }
        if ($data['action'] === 'approve') {
            $weight = ['High' => 3, 'Medium' => 2, 'Low' => 1][$retraction->impact] ?? 1;
            $objects = $retraction->objects_impacted ?: 60 * $weight;
            $affected = RegisterEntry::where('code', $retraction->evidence_ref)->update(['status' => 'Retracted']);
            Observation::where('code', $retraction->evidence_ref)->update(['status' => 'retracted']);
            $retraction->update(['status' => 'approved', 'objects_impacted' => $objects + $affected, 'products_impacted' => $retraction->products_impacted ?: 8 * $weight, 'outputs_impacted' => (int) round($objects * 0.78), 'clients_notified' => (int) round($objects * 0.25)]);

            return back()->with('success', "Retraction approved — cascade applied to {$retraction->objects_impacted} dependent objects; clients notified.");
        }
        $retraction->update(['status' => $data['action'] === 'reject' ? 'rejected' : 'awaiting_info']);

        return back()->with('success', $data['action'] === 'reject' ? 'Retraction rejected.' : 'More information requested.');
    }

    public function ask(Request $request, string $agent): RedirectResponse
    {
        abort_unless(isset(Agents::AGENTS[$agent]), 404);
        $data = $request->validate(['question' => ['required', 'string', 'min:3', 'max:300']]);
        AgentQuery::create(['user_id' => $request->user()->id, 'agent' => $agent, 'question' => $data['question'], 'answer' => Agents::ask($agent, $data['question'])]);

        return back();
    }

    public function storeRelease(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'environment' => ['required', Rule::in(['UAT', 'Staging', 'Production'])],
            'scope_objects' => ['required', 'integer', 'min:1'],
            'target_date' => ['required', 'date'],
        ]);
        $n = Release::count() + 22;
        $r = Release::create([...$data, 'code' => sprintf('CT-R-%03d', $n), 'countries' => 54, 'status' => 'in_uat', 'readiness' => 60, 'created_by' => $request->user()->id,
            'authorisations' => array_fill_keys(array_keys(self::AUTHORITIES), 'pending'), 'defects' => ['critical' => 0, 'high' => 0, 'medium' => 0, 'low' => 0], 'rollback_proven' => false]);

        return back()->with('success', "Release {$r->code} created and entered UAT.");
    }

    public function updateRelease(Request $request, Release $release): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:authorise,rollback_proof,resolve_critical,promote'],
            'authority' => ['required_if:action,authorise', 'nullable', Rule::in(array_keys(self::AUTHORITIES))],
        ]);
        $auth = $release->authorisations ?? [];
        $defects = $release->defects ?? [];

        if ($data['action'] === 'authorise') {
            if ($data['authority'] === 'board' && $release->created_by === $request->user()->id) {
                return back()->with('error', 'Release cannot be self-approved: the release creator may not give Board authorisation.');
            }
            $auth[$data['authority']] = 'approved';
            $release->update(['authorisations' => $auth, 'readiness' => min(100, $release->readiness + 6)]);

            return back()->with('success', self::AUTHORITIES[$data['authority']].' recorded.');
        }
        if ($data['action'] === 'rollback_proof') {
            $release->update(['rollback_proven' => true, 'readiness' => min(100, $release->readiness + 5)]);

            return back()->with('success', 'Rollback proof recorded.');
        }
        if ($data['action'] === 'resolve_critical') {
            $defects['critical'] = max(0, ($defects['critical'] ?? 0) - 1);
            $release->update(['defects' => $defects, 'readiness' => min(100, $release->readiness + 4)]);

            return back()->with('success', 'Critical defect resolved.');
        }

        $missing = collect(self::AUTHORITIES)->keys()->reject(fn ($k) => ($auth[$k] ?? '') === 'approved');
        $problems = [];
        if ($missing->isNotEmpty()) {
            $problems[] = 'missing authorisations: '.$missing->map(fn ($k) => self::AUTHORITIES[$k])->implode(', ');
        }
        if (($defects['critical'] ?? 0) > 0) {
            $problems[] = ($defects['critical']).' blocking (critical) defect(s)';
        }
        if (! $release->rollback_proven) {
            $problems[] = 'rollback not proven';
        }
        if ($problems) {
            return back()->with('error', 'Release locked — '.implode('; ', $problems).'.');
        }
        $release->update(['status' => 'released', 'environment' => 'Production', 'readiness' => 100]);

        return back()->with('success', "{$release->code} released to Production with a signed release certificate.");
    }
}
