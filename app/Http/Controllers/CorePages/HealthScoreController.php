<?php

namespace App\Http\Controllers\CorePages;

use App\Http\Controllers\Controller;
use App\Models\CorePages\HealthAssessment;
use App\Support\CorePages\HealthScore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Business Health Score: seven-step diagnostic with server-side progress,
 * save-and-continue-later (resumable for 30 days), scored results and recommendations.
 */
class HealthScoreController extends Controller
{
    private const SESSION = 'health_assessment_id';

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        $assessment = $this->current($request);
        $completed = $assessment?->completed_step ?? 0;

        if ($step < 1 || $step > 7) {
            abort(404);
        }
        if ($step > $completed + 1) {
            return redirect()->route('core.health.step', ['step' => min($completed + 1, 7)]);
        }
        if ($assessment?->isSubmitted()) {
            return redirect()->route('core.health.results', $assessment);
        }

        $user = $request->user();
        $profile = $assessment?->profile ?? [];
        $nameParts = explode(' ', (string) $user?->name, 2);

        return Inertia::render('CorePages/HealthScore/Step', [
            'step' => $step,
            'steps' => array_values(HealthScore::STEPS),
            'completed' => $completed,
            'section' => $step >= 2 && $step <= 6 ? HealthScore::publicSections()[HealthScore::STEPS[$step]['key']] : null,
            'sectionKey' => HealthScore::STEPS[$step]['key'],
            'sections' => $step === 7 ? collect(HealthScore::publicSections())->map(fn ($s, $k) => ['key' => $k, 'title' => HealthScore::DIMENSIONS[$k], 'about' => $s['about']])->values() : null,
            'answers' => $step >= 2 && $step <= 6 ? ($assessment?->answers[HealthScore::STEPS[$step]['key']] ?? (object) []) : (object) [],
            'profile' => [
                'first_name' => $profile['first_name'] ?? ($user ? $nameParts[0] : ''),
                'last_name' => $profile['last_name'] ?? ($user ? ($nameParts[1] ?? '') : ''),
                'business_name' => $profile['business_name'] ?? $user?->company ?? '',
                'email' => $profile['email'] ?? $user?->email ?? '',
                'mobile' => $profile['mobile'] ?? $user?->phone ?? '',
                'country' => $profile['country'] ?? 'South Africa',
                'province' => $profile['province'] ?? '',
                'industry' => $profile['industry'] ?? '',
                'stage' => $profile['stage'] ?? '',
                'revenue_band' => $profile['revenue_band'] ?? '',
                'employees' => $profile['employees'] ?? '',
                'language' => $profile['language'] ?? 'English',
                'currency' => $profile['currency'] ?? 'ZAR',
                'consent_privacy' => (bool) ($profile['consent_privacy'] ?? false),
                'consent_contact' => (bool) ($profile['consent_contact'] ?? false),
                'consent_benchmark' => (bool) ($profile['consent_benchmark'] ?? false),
                'client_mode' => $profile['client_mode'] ?? ($user ? 'existing' : 'new'),
            ],
            'options' => HealthScore::profileOptions(),
            'reference' => $assessment?->reference,
        ]);
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        abort_unless($step >= 1 && $step <= 7, 404);
        $save = $request->input('intent') === 'save';
        $assessment = $this->current($request);

        if ($step > ($assessment?->completed_step ?? 0) + 1) {
            return redirect()->route('core.health.step', ['step' => ($assessment?->completed_step ?? 0) + 1]);
        }

        if ($step === 1) {
            $options = HealthScore::profileOptions();
            $profile = $request->validate($save ? [
                'email' => ['required', 'email', 'max:190'],
                ...collect(['first_name', 'last_name', 'business_name', 'mobile', 'country', 'province', 'industry', 'stage', 'revenue_band', 'employees', 'language', 'currency', 'client_mode'])->mapWithKeys(fn ($k) => [$k => ['nullable', 'string', 'max:190']])->all(),
                'consent_privacy' => ['boolean'], 'consent_contact' => ['boolean'], 'consent_benchmark' => ['boolean'],
            ] : [
                'first_name' => ['required', 'string', 'max:80'],
                'last_name' => ['required', 'string', 'max:80'],
                'business_name' => ['required', 'string', 'max:190'],
                'email' => ['required', 'email', 'max:190'],
                'mobile' => ['required', 'string', 'min:7', 'max:30'],
                'country' => ['required', Rule::in($options['countries'])],
                'province' => ['required', 'string', 'max:80'],
                'industry' => ['required', Rule::in($options['industries'])],
                'stage' => ['required', Rule::in($options['stages'])],
                'revenue_band' => ['required', Rule::in($options['revenue_bands'])],
                'employees' => ['required', Rule::in($options['employees'])],
                'language' => ['required', Rule::in(['English', 'Afrikaans'])],
                'currency' => ['required', Rule::in(['ZAR', 'USD'])],
                'consent_privacy' => ['accepted'],
                'consent_contact' => ['boolean'],
                'consent_benchmark' => ['boolean'],
                'client_mode' => ['nullable', Rule::in(['new', 'existing'])],
            ], ['consent_privacy.accepted' => 'Please accept the Privacy Notice consent to calculate your score.']);

            $assessment ??= HealthAssessment::create([
                'reference' => $this->reference(),
                'resume_token' => Str::random(48),
                'user_id' => $request->user()?->id,
            ]);
            $assessment->fill([
                'profile' => [...($assessment->profile ?? []), ...$profile],
                'email' => $profile['email'],
                'business_name' => $profile['business_name'] ?? $assessment->business_name,
            ]);
            $request->session()->put(self::SESSION, $assessment->id);
        } elseif ($step <= 6) {
            abort_unless($assessment, 404);
            $section = HealthScore::STEPS[$step]['key'];
            $rules = HealthScore::rulesFor($section);
            if ($save) {
                $rules = collect($rules)->map(fn ($r) => ['nullable', ...array_filter($r, fn ($x) => $x !== 'required')])->all();
            }
            $validated = $request->validate($rules, collect($rules)->keys()->mapWithKeys(fn ($k) => ["{$k}.required" => 'Please answer this question.'])->all());
            $answers = $assessment->answers ?? [];
            $answers[$section] = [...($answers[$section] ?? []), ...array_filter($validated['answers'] ?? [], fn ($v) => $v !== null)];
            $assessment->answers = $answers;
        } else {
            abort_unless($assessment && $assessment->completed_step >= 6, 404);
            if ($save) {
                $assessment->saved_at = now();
                $assessment->save();

                return redirect()->route('core.health.saved');
            }

            $result = HealthScore::score($assessment->answers ?? []);
            $assessment->update([
                'status' => 'submitted',
                'completed_step' => 7,
                'scores' => $result,
                'overall_score' => $result['overall'],
                'band' => $result['band']['key'],
                'submitted_at' => now(),
                'user_id' => $assessment->user_id ?? $request->user()?->id,
            ]);

            return redirect()->route('core.health.results', $assessment)->with('success', 'Your Business Health Score has been calculated.');
        }

        if ($save) {
            $assessment->saved_at = now();
            $assessment->save();

            return redirect()->route('core.health.saved');
        }

        $assessment->completed_step = max($assessment->completed_step, $step);
        $assessment->save();

        return redirect()->route('core.health.step', ['step' => $step + 1]);
    }

    public function saved(Request $request): Response|RedirectResponse
    {
        $assessment = $this->current($request);
        if (! $assessment) {
            return redirect()->route('core.health.step', ['step' => 1]);
        }

        $completed = $assessment->completed_step;

        return Inertia::render('CorePages/HealthScore/Saved', [
            'assessment' => [
                'reference' => $assessment->reference,
                'saved_on' => ($assessment->saved_at ?? $assessment->updated_at)->format('d F Y, H:i'),
                'completed_label' => $completed > 0 ? "Step {$completed} of 7: ".HealthScore::STEPS[$completed]['label'] : 'Not started',
                'progress' => (int) round($completed / 7 * 100),
                'next_step' => min($completed + 1, 7),
                'email' => $assessment->email,
                'resume_url' => route('core.health.resume', $assessment->resume_token),
                'expires_on' => ($assessment->saved_at ?? now())->copy()->addDays(30)->format('d F Y'),
                'reminder_at' => $assessment->reminder_at?->format('d F Y'),
                'link_sent' => (bool) ($assessment->profile['resume_link_sent_at'] ?? false),
            ],
        ]);
    }

    public function emailLink(Request $request): RedirectResponse
    {
        $assessment = $this->current($request);
        abort_unless($assessment && $assessment->email, 404);
        $assessment->update(['profile' => [...($assessment->profile ?? []), 'resume_link_sent_at' => now()->toIso8601String()]]);

        return back()->with('success', "A secure resume link has been sent to {$assessment->email}.");
    }

    public function reminder(Request $request): RedirectResponse
    {
        $assessment = $this->current($request);
        abort_unless($assessment, 404);
        $days = (int) $request->validate(['days' => ['required', Rule::in([1, 3, 7])]])['days'];
        $assessment->update(['reminder_at' => now()->addDays($days)]);

        return back()->with('success', 'Reminder set for '.now()->addDays($days)->format('d F Y').'.');
    }

    public function resume(Request $request, string $token): RedirectResponse
    {
        $assessment = HealthAssessment::where('resume_token', $token)->firstOrFail();
        if ($assessment->isSubmitted()) {
            $request->session()->put(self::SESSION, $assessment->id);

            return redirect()->route('core.health.results', $assessment);
        }
        if ($assessment->resumeExpired()) {
            return redirect()->route('core.health.step', ['step' => 1])->with('error', 'This resume link has expired. Saved diagnostics are kept for 30 days.');
        }
        $request->session()->put(self::SESSION, $assessment->id);

        return redirect()->route('core.health.step', ['step' => min($assessment->completed_step + 1, 7)])->with('success', 'Welcome back. Continue where you left off.');
    }

    public function restart(Request $request): RedirectResponse
    {
        $request->session()->forget(self::SESSION);

        return redirect()->route('core.health.step', ['step' => 1]);
    }

    public function results(Request $request, HealthAssessment $assessment): Response|RedirectResponse
    {
        $this->authorizeView($request, $assessment);
        if (! $assessment->isSubmitted()) {
            return redirect()->route('core.health.step', ['step' => min($assessment->completed_step + 1, 7)]);
        }

        return Inertia::render('CorePages/HealthScore/Results', [
            'assessment' => [
                'reference' => $assessment->reference,
                'business_name' => $assessment->business_name,
                'submitted_at' => $assessment->submitted_at->format('d M Y, H:i'),
                'email' => $assessment->email,
            ],
            'result' => $assessment->scores,
            'dimensions' => HealthScore::DIMENSIONS,
            'weights' => HealthScore::WEIGHTS,
            'steps' => array_values(HealthScore::STEPS),
        ]);
    }

    public function download(Request $request, HealthAssessment $assessment): HttpResponse
    {
        $this->authorizeView($request, $assessment);
        abort_unless($assessment->isSubmitted(), 404);
        $r = $assessment->scores;

        $lines = [
            'THE BUSINESS CLINIC.AFRICA — BUSINESS HEALTH SCORE SUMMARY',
            'Reference: '.$assessment->reference,
            'Business: '.$assessment->business_name,
            'Submitted: '.$assessment->submitted_at->format('d M Y H:i'),
            '',
            "OVERALL HEALTH SCORE: {$r['overall']} / 100",
            $r['band']['title'],
            $r['band']['body'],
            '',
            'FUNCTIONAL SCORE BREAKDOWN',
        ];
        foreach (HealthScore::DIMENSIONS as $k => $label) {
            $lines[] = sprintf('- %s: %d / 100 (weight %d%%)', $label, $r['dimensions'][$k], HealthScore::WEIGHTS[$k] * 100);
        }
        $lines[] = '';
        $lines[] = 'YOUR MOST IMPORTANT GAPS';
        foreach ($r['gaps'] as $i => $g) {
            $lines[] = ($i + 1).'. '.$g['title'].' ('.$g['dimension'].')';
        }
        $lines[] = '';
        $lines[] = 'YOUR 30-DAY PRIORITY ACTION PLAN';
        foreach ($r['actions'] as $i => $a) {
            $lines[] = ($i + 1).'. '.$a;
        }
        $lines[] = '';
        $lines[] = 'RECOMMENDED TBCA NEXT STEP: '.$r['recommendation']['name'];
        $lines[] = $r['recommendation']['body'];
        $lines[] = '';
        $lines[] = 'This diagnostic does not provide legal, tax, audit, investment or regulated financial advice.';

        return response(implode("\r\n", $lines), 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$assessment->reference.'-summary.txt"',
        ]);
    }

    public function send(Request $request, HealthAssessment $assessment): RedirectResponse
    {
        $this->authorizeView($request, $assessment);
        $channel = $request->validate(['channel' => ['required', Rule::in(['email', 'whatsapp'])]])['channel'];
        $assessment->update(['profile' => [...($assessment->profile ?? []), "summary_sent_{$channel}_at" => now()->toIso8601String()]]);
        $to = $channel === 'email' ? $assessment->email : ($assessment->profile['mobile'] ?? 'your WhatsApp number');

        return back()->with('success', 'Your summary has been sent to '.$to.'.');
    }

    private function current(Request $request): ?HealthAssessment
    {
        $id = $request->session()->get(self::SESSION);

        return $id ? HealthAssessment::find($id) : null;
    }

    private function authorizeView(Request $request, HealthAssessment $assessment): void
    {
        $user = $request->user();
        abort_unless(
            $request->session()->get(self::SESSION) === $assessment->id
            || ($user && ($assessment->user_id === $user->id || $user->isAdmin())),
            403
        );
    }

    private function reference(): string
    {
        return 'BHS-'.now()->format('Y-m-d-Hi').'-'.strtoupper(Str::random(4));
    }
}
