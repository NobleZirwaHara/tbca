<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\WhistleReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Restricted whistleblowing route (AB-TEB 12.8 / 15.6). Reports never create a
 * Submission or CRM record. Anonymous reports store no identity. The reporter gets
 * a secret case token (shown once, stored hashed) to check status and reply.
 */
class WhistleblowingController extends Controller
{
    public const CATEGORIES = ['Fraud or financial misconduct', 'Corruption or bribery', 'Conflict of interest', 'Ethics or code of conduct breach', 'Retaliation', 'Privacy violation', 'Security concern', 'Harassment or discrimination', 'Other serious matter'];

    public const RELATIONSHIPS = ['Employee', 'Contractor', 'Client', 'Supplier / vendor', 'Partner', 'Former employee', 'Member of the public', 'Prefer not to say'];

    public const AREAS = ['Executive / leadership', 'Advisory delivery', 'Due diligence', 'Finance & billing', 'Procurement', 'Technology & data', 'Marketplace', 'People & culture', 'Other / unknown'];

    /** Follow-up routes and whether each supports anonymous reporting. */
    public const ROUTES = [
        'Case token (anonymous portal)' => true,
        'Email to a confidential address' => false,
        'Phone call from the case owner' => false,
    ];

    public function create(Request $request): Response
    {
        return Inertia::render('About/Whistleblowing', [
            'options' => [
                'categories' => self::CATEGORIES,
                'relationships' => self::RELATIONSHIPS,
                'areas' => self::AREAS,
                'routes' => collect(self::ROUTES)->map(fn ($anon, $label) => ['label' => $label, 'anonymous' => $anon])->values(),
            ],
            'draft' => $request->session()->get('about.whistle.draft'),
            'issued' => $request->session()->get('about.whistle.issued'),
        ]);
    }

    public function saveDraft(Request $request): RedirectResponse
    {
        $request->session()->put('about.whistle.draft', $request->except(['_token', 'evidence']));

        return back()->with('success', 'Draft saved in this browser session only. Nothing has been submitted.');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'category' => ['required', 'in:'.implode(',', self::CATEGORIES)],
            'relationship' => ['required', 'in:'.implode(',', self::RELATIONSHIPS)],
            'subject' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'min:30', 'max:4000'],
            'people_involved' => ['nullable', 'string', 'max:500'],
            'period' => ['nullable', 'string', 'max:120'],
            'business_area' => ['nullable', 'string', 'max:120'],
            'follow_up_route' => ['required', 'string', 'in:'.implode(',', array_keys(self::ROUTES))],
            'willing_contact' => ['required', 'boolean'],
            'anonymous' => ['boolean'],
            'reporter_name' => ['nullable', 'required_if:anonymous,false', 'string', 'max:120'],
            'reporter_email' => ['nullable', 'required_if:anonymous,false', 'email', 'max:160'],
            'evidence' => ['nullable', 'file', 'mimes:pdf,docx,xlsx,jpg,jpeg,png', 'max:10240'],
        ]);

        $anonymous = (bool) ($data['anonymous'] ?? false);
        if ($anonymous && ! self::ROUTES[$data['follow_up_route']]) {
            return back()->withErrors(['anonymous' => 'Anonymous reporting is only available with the case token follow-up route.'])->withInput();
        }

        $token = WhistleReport::makeToken();
        $file = $request->file('evidence');

        $report = WhistleReport::create([
            'reference' => 'WB-'.now()->year.'-'.strtoupper(Str::random(6)),
            'token_hash' => Hash::make($token),
            'category' => $data['category'],
            'relationship' => $data['relationship'],
            'subject' => $data['subject'],
            'description' => $data['description'],
            'people_involved' => $data['people_involved'] ?? null,
            'period' => $data['period'] ?? null,
            'business_area' => $data['business_area'] ?? null,
            'follow_up_route' => $data['follow_up_route'],
            'willing_contact' => (bool) $data['willing_contact'],
            'anonymous' => $anonymous,
            'reporter_name' => $anonymous ? null : ($data['reporter_name'] ?? null),
            'reporter_email' => $anonymous ? null : ($data['reporter_email'] ?? null),
            'evidence_name' => $file?->getClientOriginalName(),
            'evidence_path' => $file?->store('about/whistleblowing', 'local'),
            'status' => 'received',
            'messages' => [],
        ]);

        $request->session()->forget('about.whistle.draft');
        // Token is shown exactly once on the next page view.
        $request->session()->flash('about.whistle.issued', ['reference' => $report->reference, 'token' => $token]);

        return redirect()->route('whistleblowing.create');
    }

    public function followUp(): Response
    {
        return Inertia::render('About/WhistleFollowUp', ['report' => null]);
    }

    public function access(Request $request): RedirectResponse
    {
        $data = $request->validate(['reference' => ['required', 'string', 'max:40'], 'token' => ['required', 'string', 'max:40']]);
        $report = WhistleReport::findByToken($data['reference'], $data['token']);

        if (! $report) {
            return back()->withErrors(['token' => 'We could not match that reference and case token.']);
        }

        $request->session()->put('about.whistle.access', $report->id);

        return redirect()->route('whistleblowing.case');
    }

    public function showCase(Request $request): Response|RedirectResponse
    {
        $report = WhistleReport::find($request->session()->get('about.whistle.access'));
        if (! $report) {
            return redirect()->route('whistleblowing.follow-up');
        }

        return Inertia::render('About/WhistleFollowUp', [
            'report' => [
                'reference' => $report->reference,
                'status' => $report->status,
                'category' => $report->category,
                'subject' => $report->subject,
                'anonymous' => $report->anonymous,
                'submitted_at' => $report->created_at->toIso8601String(),
                'messages' => $report->messages ?? [],
                'pipeline' => WhistleReport::STATUSES,
            ],
        ]);
    }

    public function reply(Request $request): RedirectResponse
    {
        $report = WhistleReport::find($request->session()->get('about.whistle.access'));
        abort_unless($report, 403);
        $data = $request->validate(['body' => ['required', 'string', 'max:3000']]);
        abort_if($report->status === 'closed', 422, 'This case is closed.');

        $report->addMessage('reporter', $data['body']);
        $report->save();

        return back()->with('success', 'Your message has been added to the case securely.');
    }

    public function leave(Request $request): RedirectResponse
    {
        $request->session()->forget('about.whistle.access');

        return redirect()->route('whistleblowing.follow-up');
    }
}
