<?php

namespace App\Http\Controllers\CorePages;

use App\Http\Controllers\Controller;
use App\Models\CorePages\ServiceFinderRequest;
use App\Models\Submission;
use App\Support\CorePages\ServiceMatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Find the Right Service: Your Need -> About You -> Business Context -> Timing & Budget ->
 * Recommendations -> (optional) Request Human Assistance -> Request Submitted.
 */
class ServiceFinderController extends Controller
{
    private const SESSION = 'service_finder_id';

    public function start(): RedirectResponse
    {
        return redirect()->route('core.finder.step', ['stage' => 'your-need']);
    }

    public function show(Request $request, string $stage): Response|RedirectResponse
    {
        $step = $this->stepFor($stage);
        $finder = $this->current($request);
        $completed = $finder?->completed_step ?? 0;

        if ($step > $completed + 1) {
            return redirect()->route('core.finder.step', ['stage' => ServiceMatcher::STEPS[$completed + 1]['slug']]);
        }

        $user = $request->user();
        $answers = $finder?->answers ?? [];

        return Inertia::render('CorePages/ServiceFinder/Step', [
            ...$this->shared($finder),
            'step' => $step,
            'needs' => ServiceMatcher::needs(),
            'options' => ServiceMatcher::options(),
            'answers' => [
                'need' => $answers['need'] ?? '',
                'description' => $answers['description'] ?? '',
                'describes' => $answers['describes'] ?? '',
                'role' => $answers['role'] ?? '',
                'heard_from' => $answers['heard_from'] ?? '',
                'language' => $answers['language'] ?? 'English',
                'currency' => $answers['currency'] ?? 'ZAR (South African Rand)',
                'engage' => $answers['engage'] ?? '',
                'email' => $answers['email'] ?? $user?->email ?? '',
                'whatsapp' => $answers['whatsapp'] ?? $user?->phone ?? '',
                'business_name' => $answers['business_name'] ?? $user?->company ?? '',
                'stage' => $answers['stage'] ?? '',
                'industry' => $answers['industry'] ?? '',
                'company_size' => $answers['company_size'] ?? '',
                'country' => $answers['country'] ?? 'South Africa',
                'province' => $answers['province'] ?? '',
                'turnover' => $answers['turnover'] ?? '',
                'challenge' => $answers['challenge'] ?? '',
                'looking_for' => $answers['looking_for'] ?? [],
                'context' => $answers['context'] ?? '',
                'how_soon' => $answers['how_soon'] ?? '',
                'timeline' => $answers['timeline'] ?? '',
                'budget' => $answers['budget'] ?? '',
                'purchase' => $answers['purchase'] ?? '',
                'formats' => $answers['formats'] ?? [],
                'support' => $answers['support'] ?? '',
                'alternatives' => $answers['alternatives'] ?? '',
                'notes' => $answers['notes'] ?? '',
            ],
        ]);
    }

    public function store(Request $request, string $stage): RedirectResponse
    {
        $step = $this->stepFor($stage);
        $finder = $this->current($request);
        if ($step > ($finder?->completed_step ?? 0) + 1) {
            return redirect()->route('core.finder.step', ['stage' => 'your-need']);
        }

        $save = $request->input('intent') === 'save';
        $rules = ServiceMatcher::rules($step);
        if ($save) {
            $rules = collect($rules)->map(fn ($r) => ['nullable', ...array_filter($r, fn ($x) => $x !== 'required')])->all();
        }
        $data = $request->validate($rules, [
            'need.required' => 'Please select the option that best describes your immediate priority.',
            'looking_for.required' => 'Select at least one thing you are looking for.',
            'formats.required' => 'Select at least one format.',
        ]);

        $finder ??= ServiceFinderRequest::create([
            'reference' => 'TBCA-FRS-'.now()->format('Y').'-'.strtoupper(Str::random(6)),
            'user_id' => $request->user()?->id,
        ]);
        $finder->answers = [...($finder->answers ?? []), ...array_filter($data, fn ($v) => $v !== null)];
        $finder->email = $finder->answers['email'] ?? $finder->email;
        if (! $save) {
            $finder->completed_step = max($finder->completed_step, $step);
            // Changing an earlier answer invalidates previously generated recommendations.
            if ($finder->status === 'recommended') {
                $finder->status = 'in_progress';
                $finder->recommendations = null;
            }
        }
        $finder->save();
        $request->session()->put(self::SESSION, $finder->id);

        if ($save) {
            return back()->with('success', "Progress saved. Resume anytime with reference {$finder->reference}: ".route('core.finder.resume', $finder));
        }

        return $step === 4
            ? redirect()->route('core.finder.recommendations')
            : redirect()->route('core.finder.step', ['stage' => ServiceMatcher::STEPS[$step + 1]['slug']]);
    }

    public function resume(Request $request, ServiceFinderRequest $finder): RedirectResponse
    {
        abort_if($finder->updated_at->lt(now()->subDays(30)), 410, 'This saved journey has expired.');
        $request->session()->put(self::SESSION, $finder->id);
        $next = min($finder->completed_step + 1, 5);

        return $next === 5
            ? redirect()->route('core.finder.recommendations')
            : redirect()->route('core.finder.step', ['stage' => ServiceMatcher::STEPS[$next]['slug']]);
    }

    public function recommendations(Request $request): Response|RedirectResponse
    {
        $finder = $this->current($request);
        if (! $finder || $finder->completed_step < 4) {
            return redirect()->route('core.finder.step', ['stage' => ServiceMatcher::STEPS[($finder?->completed_step ?? 0) + 1]['slug']]);
        }

        if (! $finder->recommendations) {
            $finder->update([
                'recommendations' => ServiceMatcher::match($finder->answers),
                'status' => $finder->status === 'assistance_requested' ? 'assistance_requested' : 'recommended',
                'completed_step' => 5,
            ]);
        }

        return Inertia::render('CorePages/ServiceFinder/Recommendations', [
            ...$this->shared($finder),
            'step' => 5,
            'recommendations' => $finder->recommendations,
            'saved' => $request->user()?->savedItems()->where('item_type', 'service')->pluck('item_key') ?? [],
        ]);
    }

    public function assistance(Request $request): Response|RedirectResponse
    {
        $finder = $this->current($request);
        if (! $finder || ! $finder->recommendations) {
            return redirect()->route('core.finder.step', ['stage' => 'your-need'])->with('error', 'Please complete the service finder first so our specialist has your context.');
        }

        $items = collect([...$finder->recommendations['best'], ...$finder->recommendations['also']])->pluck('name')->values();
        $selected = $request->query('item');

        return Inertia::render('CorePages/ServiceFinder/Assistance', [
            ...$this->shared($finder),
            'step' => 6,
            'items' => [...$items, 'Something else / not listed'],
            'options' => ServiceMatcher::options(),
            'draft' => [
                'help_with' => $finder->assistance['help_with'] ?? (($finder->answers['need'] ?? '') === 'buy' ? 'Buying a Sprint, Tool or Template' : 'Understanding my recommendations'),
                'item' => $selected && $items->contains($selected) ? $selected : ($finder->assistance['item'] ?? $items->first()),
                'assistance_type' => $finder->assistance['assistance_type'] ?? 'I need advice before I purchase',
                'assist_how' => $finder->assistance['assist_how'] ?? 'Help me understand what I need',
                'details' => $finder->assistance['details'] ?? '',
                'urgency' => $finder->assistance['urgency'] ?? 'Within 5 business days',
                'preferred_date' => $finder->assistance['preferred_date'] ?? '',
                'preferred_time' => $finder->assistance['preferred_time'] ?? 'Morning (08:00 – 12:00 SAST)',
                'contact_channel' => $finder->assistance['contact_channel'] ?? 'WhatsApp',
            ],
        ]);
    }

    public function submitAssistance(Request $request): RedirectResponse
    {
        $finder = $this->current($request);
        abort_unless($finder && $finder->recommendations, 404);
        $o = ServiceMatcher::options();
        $save = $request->input('intent') === 'save';

        $rules = [
            'help_with' => ['required', Rule::in($o['help_with'])],
            'item' => ['required', 'string', 'max:190'],
            'assistance_type' => ['required', Rule::in($o['assistance_type'])],
            'assist_how' => ['required', Rule::in($o['assist_how'])],
            'details' => ['required', 'string', 'min:10', 'max:2000'],
            'urgency' => ['required', Rule::in($o['urgency'])],
            'preferred_date' => ['nullable', 'date', 'after_or_equal:today'],
            'preferred_time' => ['nullable', Rule::in($o['preferred_time'])],
            'contact_channel' => ['required', Rule::in($o['contact_channel'])],
        ];
        if ($save) {
            $rules = collect($rules)->map(fn ($r) => ['nullable', ...array_filter($r, fn ($x) => $x !== 'required')])->all();
            unset($rules['details'][array_search('min:10', $rules['details'], true)]);
        }
        $data = $request->validate($rules);

        if ($save) {
            $finder->update(['assistance' => [...($finder->assistance ?? []), ...array_filter($data)]]);

            return back()->with('success', 'Your request has been saved. You can submit it later from this page.');
        }

        $reference = 'TBCA-HAR-'.now()->format('Y').'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        while (ServiceFinderRequest::where('assistance_reference', $reference)->exists()) {
            $reference = 'TBCA-HAR-'.now()->format('Y').'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        $finder->update([
            'assistance' => $data,
            'assistance_reference' => $reference,
            'assistance_requested_at' => now(),
            'status' => 'assistance_requested',
        ]);

        // Mirror into the shared inbound register so the team sees it with every other enquiry.
        Submission::create([
            'reference' => $reference,
            'user_id' => $request->user()?->id,
            'type' => 'human-assistance',
            'section' => 'core',
            'subject' => "Human assistance: {$data['item']}",
            'name' => $finder->answers['business_name'] ?? null,
            'email' => $finder->email,
            'payload' => ['finder_reference' => $finder->reference, 'answers' => $finder->answers, 'assistance' => $data],
        ]);

        return redirect()->route('core.finder.submitted', $reference);
    }

    public function submitted(Request $request, string $reference): Response
    {
        $finder = ServiceFinderRequest::where('assistance_reference', $reference)->firstOrFail();
        $user = $request->user();
        abort_unless($request->session()->get(self::SESSION) === $finder->id || ($user && ($finder->user_id === $user->id || $user->isAdmin())), 403);

        return Inertia::render('CorePages/ServiceFinder/Submitted', [
            ...$this->shared($finder),
            'step' => 6,
            'request' => [
                'reference' => $finder->assistance_reference,
                'submitted_on' => $finder->assistance_requested_at->format('d F Y | H:i').' SAST',
                ...$finder->assistance,
            ],
        ]);
    }

    public function restart(Request $request): RedirectResponse
    {
        $request->session()->forget(self::SESSION);

        return redirect()->route('core.finder.step', ['stage' => 'your-need']);
    }

    private function shared(?ServiceFinderRequest $finder): array
    {
        $a = $finder?->answers ?? [];

        return [
            'steps' => array_values(ServiceMatcher::STEPS),
            'completed' => $finder?->completed_step ?? 0,
            'reference' => $finder?->reference,
            'summary' => [
                'need' => ServiceMatcher::needTitle($a['need'] ?? null),
                'market' => $a['country'] ?? 'South Africa',
                'language' => $a['language'] ?? 'English',
                'currency' => str_starts_with($a['currency'] ?? 'ZAR', 'USD') ? 'USD' : 'ZAR',
                'formats' => isset($a['formats']) ? implode(' + ', $a['formats']) : null,
                'budget' => $a['budget'] ?? null,
                'status' => match ($finder?->status) {
                    'recommended' => 'Generated',
                    'assistance_requested' => 'Human assistance requested',
                    default => 'Not yet generated',
                },
            ],
        ];
    }

    private function stepFor(string $stage): int
    {
        $step = collect(ServiceMatcher::STEPS)->search(fn ($s) => $s['slug'] === $stage);
        abort_if($step === false || $step > 4, 404);

        return $step;
    }

    private function current(Request $request): ?ServiceFinderRequest
    {
        $id = $request->session()->get(self::SESSION);

        return $id ? ServiceFinderRequest::find($id) : null;
    }
}
