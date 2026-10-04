<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\Application;
use App\Models\About\Vacancy;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Careers: authorised vacancies, role detail and a six-step candidate application.
 * Draft progress is kept server-side in the session; CVs go to private storage
 * (storage/app/private/careers). Candidate Privacy must be acknowledged to submit.
 */
class CareersController extends Controller
{
    public const STEPS = [
        'personal' => 'Personal Information',
        'experience' => 'Experience',
        'education' => 'Education',
        'skills' => 'Skills & Questions',
        'documents' => 'Documents',
        'review' => 'Review & Submit',
    ];

    public function index(Request $request): Response
    {
        $open = Vacancy::query()->open();

        $roles = (clone $open)
            ->when($request->string('q')->toString(), fn ($q, $s) => $q->where(fn ($w) => $w
                ->where('title', 'like', "%{$s}%")->orWhere('department', 'like', "%{$s}%")->orWhere('skills', 'like', "%{$s}%")))
            ->when($request->string('department')->toString(), fn ($q, $v) => $q->where('department', $v))
            ->when($request->string('location')->toString(), fn ($q, $v) => $q->where('location', $v))
            ->when($request->string('type')->toString(), fn ($q, $v) => $q->where('employment_type', $v))
            ->orderBy('posted_at', 'desc')->get();

        return Inertia::render('About/Careers/Index', [
            'roles' => $roles->map->summary()->values(),
            'total' => (clone $open)->count(),
            'filters' => $request->only(['q', 'department', 'location', 'type']),
            'options' => [
                'departments' => (clone $open)->distinct()->orderBy('department')->pluck('department'),
                'locations' => (clone $open)->distinct()->orderBy('location')->pluck('location'),
                'types' => (clone $open)->distinct()->orderBy('employment_type')->pluck('employment_type'),
            ],
        ]);
    }

    public function show(Vacancy $vacancy): Response
    {
        abort_if($vacancy->status === 'draft', 404);

        return Inertia::render('About/Careers/Role', [
            'role' => $vacancy->summary() + [
                'overview' => $vacancy->overview,
                'impact' => $vacancy->impact,
                'responsibilities' => $vacancy->responsibilities ?? [],
                'requirements' => $vacancy->requirements ?? [],
                'offer' => $vacancy->offer ?? [],
                'skills' => $vacancy->skills ?? [],
                'department_about' => $vacancy->department_about,
            ],
        ]);
    }

    private function key(Vacancy $vacancy): string
    {
        return 'about.careers.'.$vacancy->slug;
    }

    private function draft(Request $request, Vacancy $vacancy): array
    {
        return $request->session()->get($this->key($vacancy), ['completed' => [], 'data' => []]);
    }

    public function apply(Request $request, Vacancy $vacancy, ?string $step = null): Response|RedirectResponse
    {
        abort_unless($vacancy->isOpen(), 404);
        $draft = $this->draft($request, $vacancy);
        $keys = array_keys(self::STEPS);
        $step ??= collect($keys)->first(fn ($k) => ! in_array($k, $draft['completed'], true)) ?? 'review';
        abort_unless(isset(self::STEPS[$step]), 404);

        // Cannot jump past the first incomplete step.
        $firstIncomplete = collect($keys)->first(fn ($k) => ! in_array($k, $draft['completed'], true)) ?? 'review';
        if (array_search($step, $keys, true) > array_search($firstIncomplete, $keys, true)) {
            return redirect()->route('careers.apply', [$vacancy, $firstIncomplete]);
        }

        return Inertia::render('About/Careers/Apply', [
            'role' => $vacancy->summary() + ['skills' => $vacancy->skills ?? []],
            'steps' => collect(self::STEPS)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'done' => in_array($key, $draft['completed'], true)])->values(),
            'step' => $step,
            'data' => $draft['data'],
        ]);
    }

    private function rules(string $step): array
    {
        return match ($step) {
            'personal' => [
                'full_name' => ['required', 'string', 'max:120'],
                'email' => ['required', 'email', 'max:160'],
                'phone' => ['required', 'string', 'max:30'],
                'location' => ['required', 'string', 'max:120'],
                'nationality' => ['required', 'string', 'max:80'],
                'work_authorization' => ['required', 'string', 'max:80'],
                'linkedin' => ['nullable', 'url', 'max:255'],
                'portfolio' => ['nullable', 'url', 'max:255'],
            ],
            'experience' => [
                'years' => ['required', 'string', 'max:40'],
                'title' => ['required', 'string', 'max:120'],
                'employer' => ['required', 'string', 'max:120'],
                'from' => ['required', 'date_format:Y-m'],
                'current' => ['boolean'],
                'to' => ['nullable', 'required_unless:current,true', 'date_format:Y-m', 'after_or_equal:from'],
            ],
            'education' => [
                'level' => ['required', 'string', 'max:80'],
                'institution' => ['required', 'string', 'max:160'],
                'field' => ['required', 'string', 'max:120'],
                'year' => ['required', 'digits:4', 'integer', 'min:1960', 'max:'.(now()->year + 6)],
            ],
            'skills' => [
                'skills' => ['required', 'array', 'min:1'],
                'skills.*' => ['string', 'max:60'],
                'notice_period' => ['required', 'string', 'max:40'],
                'motivation' => ['required', 'string', 'min:20', 'max:2000'],
            ],
            'documents' => [
                'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
                'cover_letter' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            ],
            'review' => [
                'privacy_ack' => ['accepted'],
                'accuracy_ack' => ['accepted'],
            ],
            default => abort(404),
        };
    }

    public function save(Request $request, Vacancy $vacancy, string $step): RedirectResponse
    {
        abort_unless($vacancy->isOpen() && isset(self::STEPS[$step]), 404);
        $draft = $this->draft($request, $vacancy);
        $isDraft = $request->boolean('save_draft');

        if ($step === 'review') {
            $request->validate($this->rules('review'));

            return $this->submit($request, $vacancy, $draft);
        }

        $rules = $this->rules($step);
        if ($isDraft) {
            $rules = array_map(fn ($r) => array_values(array_filter($r, fn ($x) => ! is_string($x) || ! str_starts_with($x, 'required'))), $rules);
            array_walk($rules, function (&$r) {
                array_unshift($r, 'nullable');
            });
        }
        $valid = $request->validate($rules);

        if ($step === 'documents') {
            $docs = $draft['data']['documents'] ?? [];
            foreach (['cv', 'cover_letter'] as $field) {
                if ($request->hasFile($field)) {
                    $file = $request->file($field);
                    $docs[$field] = [
                        'path' => $file->store('careers', 'local'),
                        'name' => $file->getClientOriginalName(),
                    ];
                }
            }
            if (! $isDraft && empty($docs['cv'])) {
                return back()->withErrors(['cv' => 'Please upload your CV / résumé.']);
            }
            $valid = $docs;
        }

        $draft['data'][$step] = $valid;
        if (! $isDraft && ! in_array($step, $draft['completed'], true)) {
            $draft['completed'][] = $step;
        }
        $request->session()->put($this->key($vacancy), $draft);

        if ($isDraft) {
            return back()->with('success', 'Draft saved. You can return to this application at any time in this session.');
        }

        $keys = array_keys(self::STEPS);

        return redirect()->route('careers.apply', [$vacancy, $keys[array_search($step, $keys, true) + 1]]);
    }

    private function submit(Request $request, Vacancy $vacancy, array $draft): RedirectResponse
    {
        $missing = array_diff(array_slice(array_keys(self::STEPS), 0, 5), $draft['completed']);
        if ($missing) {
            return redirect()->route('careers.apply', [$vacancy, reset($missing)])->with('error', 'Please complete every step before submitting.');
        }

        $d = $draft['data'];
        $app = Application::create([
            'reference' => Reference::make('APP'),
            'vacancy_id' => $vacancy->id,
            'status' => 'submitted',
            'full_name' => $d['personal']['full_name'],
            'email' => $d['personal']['email'],
            'phone' => $d['personal']['phone'],
            'location' => $d['personal']['location'],
            'nationality' => $d['personal']['nationality'],
            'work_authorization' => $d['personal']['work_authorization'],
            'linkedin' => $d['personal']['linkedin'] ?? null,
            'portfolio' => $d['personal']['portfolio'] ?? null,
            'experience' => $d['experience'],
            'education' => $d['education'],
            'screening' => $d['skills'],
            'cv_name' => $d['documents']['cv']['name'] ?? null,
            'cv_path' => $d['documents']['cv']['path'] ?? null,
            'cover_letter_name' => $d['documents']['cover_letter']['name'] ?? null,
            'cover_letter_path' => $d['documents']['cover_letter']['path'] ?? null,
            'privacy_acknowledged_at' => now(),
            'history' => [['at' => now()->toIso8601String(), 'status' => 'submitted', 'note' => 'Application received.']],
        ]);

        $request->session()->forget($this->key($vacancy));
        $request->session()->put('about.careers.submitted', $app->reference);

        return redirect()->route('careers.status', ['reference' => $app->reference])
            ->with('success', 'Application submitted.')->with('reference', $app->reference);
    }

    public function status(Request $request): Response
    {
        $reference = strtoupper(trim($request->string('reference')->toString()));
        $email = strtolower(trim($request->string('email')->toString()));
        $application = null;
        $notFound = false;

        if ($reference !== '') {
            $found = Application::with('vacancy')->where('reference', $reference)->first();
            $allowed = $found && ($request->session()->get('about.careers.submitted') === $found->reference || ($email !== '' && strtolower($found->email) === $email));
            if ($allowed) {
                $application = [
                    'reference' => $found->reference,
                    'status' => $found->status,
                    'role' => $found->vacancy->title,
                    'role_slug' => $found->vacancy->slug,
                    'name' => $found->full_name,
                    'submitted_at' => $found->created_at->toIso8601String(),
                    'cv_name' => $found->cv_name,
                    'history' => $found->history ?? [],
                    'just_submitted' => $request->session()->get('about.careers.submitted') === $found->reference,
                ];
            } else {
                $notFound = $email !== '' || ! $found;
            }
        }

        return Inertia::render('About/Careers/Status', [
            'application' => $application,
            'notFound' => $notFound,
            'statuses' => Application::STATUSES,
            'query' => ['reference' => $reference, 'email' => $email],
        ]);
    }

    public function candidatePrivacy(): Response
    {
        return Inertia::render('About/Careers/CandidatePrivacy', ['content' => \App\Support\About\Copy::candidatePrivacy()]);
    }
}
