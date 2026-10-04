<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\Correction;
use App\Support\About\Codes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Public Corrections Register (AB-TEB 10.4) and correction concern intake. */
class CorrectionsController extends Controller
{
    private function filtered(Request $request): Builder
    {
        return Correction::query()->publicRegister()
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w
                ->where('code', 'like', "%{$s}%")->orWhere('title', 'like', "%{$s}%")
                ->orWhere('previous_wording', 'like', "%{$s}%")->orWhere('corrected_position', 'like', "%{$s}%")))
            ->when($request->string('claim_type')->toString(), fn ($q, $v) => $q->where('claim_type', $v))
            ->when($request->string('surface')->toString(), fn ($q, $v) => $q->where('affected_surface', $v))
            ->when($request->string('status')->toString(), fn ($q, $v) => $q->where('status', $v))
            ->when($request->date('from'), fn ($q, $d) => $q->whereDate('effective_at', '>=', $d))
            ->when($request->date('to'), fn ($q, $d) => $q->whereDate('effective_at', '<=', $d))
            ->orderBy('effective_at', $request->string('sort')->toString() === 'asc' ? 'asc' : 'desc');
    }

    private function row(Correction $c): array
    {
        return [
            'code' => $c->code,
            'date' => optional($c->effective_at)->toDateString(),
            'claim' => $c->title,
            'claim_type' => $c->claim_type,
            'affected_surface' => $c->affected_surface,
            'previous_wording' => $c->previous_wording,
            'corrected_position' => $c->corrected_position,
            'reason' => $c->reason,
            'status' => $c->status,
            'effective_at' => optional($c->effective_at)->toDateString(),
            'last_verified_at' => optional($c->last_verified_at)->toDateString(),
        ];
    }

    public function index(Request $request): Response
    {
        $base = Correction::query()->publicRegister();

        return Inertia::render('About/Corrections', [
            'corrections' => $this->filtered($request)->get()->map(fn ($c) => $this->row($c)),
            'filters' => $request->only(['q', 'claim_type', 'surface', 'status', 'from', 'to', 'sort']),
            'options' => [
                'claim_types' => (clone $base)->distinct()->orderBy('claim_type')->pluck('claim_type')->filter()->values(),
                'surfaces' => (clone $base)->distinct()->orderBy('affected_surface')->pluck('affected_surface')->filter()->values(),
                'statuses' => ['published', 'closed'],
            ],
        ]);
    }

    public function export(Request $request)
    {
        $rows = $this->filtered($request)->get()->map(fn ($c) => array_values($this->row($c)));

        return Codes::csv('tbca-corrections-register.csv',
            ['Correction ID', 'Date', 'Claim', 'Claim Type', 'Affected Surface', 'Previous Wording', 'Corrected Position', 'Reason', 'Status', 'Effective Date', 'Last Verification'],
            $rows);
    }

    public function concern(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'surface' => ['required', 'string', 'max:160'],
            'claim' => ['required', 'string', 'max:255'],
            'details' => ['required', 'string', 'max:3000'],
        ]);

        $correction = Correction::create([
            'code' => Codes::next(Correction::class, 'COR-'.now()->year.'-'),
            'title' => $data['claim'],
            'platform' => $data['surface'],
            'affected_surface' => $data['surface'],
            'description' => $data['details'],
            'status' => 'submitted',
            'priority' => 'medium',
            'is_public' => false,
            'submitted_by' => $data['name'],
            'submitter_email' => $data['email'],
            'submitted_at' => now(),
            'history' => [['at' => now()->toIso8601String(), 'by' => $data['name'], 'action' => 'submitted', 'note' => 'Public correction concern']],
        ]);

        return back()->with('success', 'Thank you. Your correction concern has been logged for triage.')->with('reference', $correction->code);
    }
}
