<?php

namespace App\Http\Controllers\Sprints;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use App\Models\Submission;
use App\Support\Platform\Reference;
use App\Support\Sprints\SprintOffer;
use App\Support\Sprints\Taxonomy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Request a Quote: the general Sprint Support form and the per-sprint quote route
 * (commercial_act = quote). Stores a "quote-request" Submission; "Save and Continue
 * Later" keeps a draft in the session.
 */
class QuoteController extends Controller
{
    private const DRAFT_KEY = 'sprints.quote_draft';

    public function show(Request $request, ?string $slug = null): Response
    {
        $sprint = $slug ? SprintController::find($slug) : null;
        $user = $request->user();
        $submitted = $request->query('submitted')
            ? Submission::query()->where('reference', (string) $request->query('submitted'))->where('type', 'quote-request')->first(['reference', 'subject', 'email', 'created_at'])
            : null;

        return Inertia::render('Sprints/RequestQuote', [
            'sprint' => $sprint,
            'package' => $sprint ? SprintOffer::package($sprint, $request->query('package')) : null,
            'categories' => collect(Taxonomy::categories())->map(fn ($c, $k) => ['value' => $k, 'label' => $c['label']])->values(),
            'options' => self::options(),
            'prefill' => [
                ...($user ? [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'organisation' => $user->company,
                    'role' => $user->job_title,
                ] : []),
                ...((array) $request->session()->get(self::DRAFT_KEY.($slug ? ".{$slug}" : '.general'), [])),
            ],
            'submitted' => $submitted,
        ]);
    }

    public function store(Request $request, ?string $slug = null): RedirectResponse
    {
        $sprint = $slug ? SprintController::find($slug) : null;
        $draftKey = self::DRAFT_KEY.($slug ? ".{$slug}" : '.general');
        $path = $sprint ? "/sprints/{$sprint->slug}/quote" : '/sprints/request-a-quote';

        if ($request->input('action') === 'save') {
            $request->session()->put($draftKey, $request->except(['_token', 'attachments', 'action']));

            return redirect($path)->with('success', 'Your request has been saved. You can continue later from this browser.');
        }

        $o = self::options();
        $data = $request->validate([
            'need' => ['required', 'string', 'min:10', 'max:2000'],
            'category' => ['nullable', Rule::in(array_keys(Taxonomy::categories()))],
            'organisation' => ['required', 'string', 'max:190'],
            'role' => ['required', 'string', 'max:120'],
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'min:7', 'max:30'],
            'language' => ['required', Rule::in(['English', 'Afrikaans'])],
            'currency' => ['required', Rule::in(['ZAR', 'USD'])],
            'source' => ['nullable', Rule::in($o['sources'])],
            'project_type' => ['nullable', Rule::in($o['projectTypes'])],
            'scope' => ['nullable', Rule::in($o['scopes'])],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'budget' => ['nullable', Rule::in($o['budgets'])],
            'details' => ['nullable', 'string', 'max:3000'],
            'package' => ['nullable', 'string', 'max:40'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'mimes:pdf,docx,xlsx,pptx,zip', 'max:10240'],
        ], [
            'need.required' => 'Tell us what you need help with.',
        ]);

        $files = collect($request->file('attachments', []))
            ->map(fn ($f) => ['name' => $f->getClientOriginalName(), 'path' => $f->store('sprints/quotes', 'local')])
            ->all();

        $submission = Submission::create([
            'reference' => Reference::make('QTE'),
            'user_id' => $request->user()?->id,
            'type' => 'quote-request',
            'section' => 'sprints',
            'subject' => $sprint ? "Quote: {$sprint->title}" : 'Custom Sprint quote request',
            'name' => $data['name'] ?? $request->user()?->name ?? $data['organisation'],
            'email' => $data['email'],
            'payload' => [
                ...collect($data)->except(['name', 'email', 'attachments'])->all(),
                'sprint' => $sprint?->code,
                'slug' => $sprint?->slug,
                'attachments' => $files,
            ],
            'status' => 'received',
        ]);

        $request->session()->forget($draftKey);

        return redirect("{$path}?submitted={$submission->reference}")
            ->with('success', "Thank you. Your quote request {$submission->reference} has been received.")
            ->with('reference', $submission->reference);
    }

    public static function options(): array
    {
        return [
            'projectTypes' => ['New Sprint / custom scope', 'Business planning', 'Funding and investment', 'Project advisory', 'Data and dashboards', 'AI and automation', 'Research and reports', 'Training and learning', 'Due diligence', 'Ongoing retainer'],
            'scopes' => ['Small (single deliverable)', 'Medium (multiple deliverables)', 'Large (programme / multi-phase)', 'Not sure yet'],
            'budgets' => ['Under R10 000', 'R10 000 – R25 000', 'R25 000 – R50 000', 'R50 000 – R150 000', 'Over R150 000', 'Not sure yet'],
            'sources' => ['Search engine', 'LinkedIn', 'Referral', 'Event or webinar', 'Partner organisation', 'Existing client', 'Other'],
        ];
    }
}
