<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Platform\Basket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Existing Client Login and the five-step New Client Registration
 * (Client Type -> Particulars -> Interests -> Documents -> Consent & Submit).
 * Registration progress is held in the session until the final step creates the account.
 */
class AuthController extends Controller
{
    public const REGISTRATION_STEPS = 5;

    public const CLIENT_TYPES = [
        'individual' => 'Individual / Professional',
        'entrepreneur' => 'Entrepreneur / Sole Proprietor',
        'sme' => 'Startup / SME',
        'corporate' => 'Corporate Organisation',
        'investor' => 'Investor / Funder',
        'sponsor' => 'Project Sponsor / Developer',
        'supplier' => 'Supplier / Service Provider',
        'public' => 'Public Institution',
        'ngo' => 'NGO / Non-Profit',
        'partner' => 'Partner / Professional Adviser',
        'other' => 'Other',
    ];

    public const INTERESTS = [
        'Business & Management Consulting', 'Business Health Diagnostic', 'TBCA Sprints & Online Shop', 'Africa Investment Intelligence Map', 'Due Diligence',
        'Virtual Deal Room', 'Project Development & Advisory', 'Investment Readiness', 'Funding & Capital Raising Support', 'Financial Modelling',
        'Technology Solutions', 'Zoho One Implementation', 'AI & Automation', 'RPA & Workflow Automation', 'Data, Analytics & Dashboards',
        'Digital Products & Toolkits', 'Subscriptions & Retainers', 'Training & Capacity Building', 'Country & Market Entry Support',
        'Partner-Delivered Services', 'Marketplace Services', 'Other',
    ];

    public const DOCUMENT_TYPES = [
        'Identity Document', 'Proof of Address', 'Company Registration Document', 'Company Profile', 'Business Plan', 'Pitch Deck', 'Project Concept Note',
        'Feasibility Study', 'Financial Statements', 'Financial Model', 'Funding Request', 'NDA', 'Other Supporting Document',
    ];

    public const DECLARATIONS = [
        'accurate' => 'I confirm that the information submitted is accurate to the best of my knowledge.',
        'authorised' => 'I confirm that I am authorised to submit information and documents for this registration.',
        'privacy' => 'I have read and accept the TBCA Privacy Notice.',
        'profile' => 'I consent to TBCA creating or updating my client and commercial profile.',
        'no_guarantee' => 'I understand that submission does not guarantee account approval, service acceptance, funding or a positive Due Diligence result.',
        'dd_processing' => 'I consent to the collection and processing of information required for the selected Due Diligence service.',
        'verification' => 'I authorise TBCA to use approved verification providers where required.',
        'third_party' => 'I confirm that I have the necessary authority or consent to submit third-party information.',
    ];

    public const OPTIONAL_CONSENTS = [
        'insights' => 'I consent to receiving relevant TBCA insights, product information and invitations.',
        'marketing' => 'I consent to TBCA sending me newsletters and marketing communications.',
        'improvement' => 'I consent to TBCA using my information to improve products, services and client experience.',
    ];

    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $field = str_contains($credentials['login'], '@') ? 'email' : 'client_id';
        $guestSession = $request->session()->get('basket_token');

        if (! Auth::attempt([$field => $credentials['login'], 'password' => $credentials['password']], $credentials['remember'] ?? false)) {
            throw ValidationException::withMessages([
                'login' => 'Those details do not match an active client account.',
            ]);
        }

        Basket::claimFor(Auth::id(), $guestSession);
        $request->session()->regenerate();

        $home = $request->user()->isAdmin() ? '/admin' : '/portal/dashboard';

        return redirect()->intended($home);
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    public function showRegister(Request $request, int $step = 1): Response|RedirectResponse
    {
        $data = $request->session()->get('registration', []);
        $completed = $data['_completed'] ?? 0;

        if ($step < 1 || $step > self::REGISTRATION_STEPS || $step > $completed + 1) {
            return redirect()->route('register', ['step' => min($completed + 1, self::REGISTRATION_STEPS)]);
        }

        return Inertia::render('Auth/Register', [
            'step' => $step,
            'totalSteps' => self::REGISTRATION_STEPS,
            'completed' => $completed,
            'data' => collect($data)->except(['password', 'password_confirmation', '_completed'])->all(),
            'options' => [
                'clientTypes' => collect(self::CLIENT_TYPES)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
                'interests' => self::INTERESTS,
                'documentTypes' => self::DOCUMENT_TYPES,
                'declarations' => self::DECLARATIONS,
                'optionalConsents' => self::OPTIONAL_CONSENTS,
                'countries' => self::countries(),
            ],
            'reference' => $data['_reference'] ?? null,
        ]);
    }

    public function register(Request $request, int $step): RedirectResponse
    {
        abort_unless($step >= 1 && $step <= self::REGISTRATION_STEPS, 404);
        $session = $request->session()->get('registration', []);

        if ($step > ($session['_completed'] ?? 0) + 1) {
            return redirect()->route('register', ['step' => ($session['_completed'] ?? 0) + 1]);
        }

        // Save and Continue Later: keep what has been typed so far, without validating.
        if ($request->input('intent') === 'save') {
            $partial = collect($request->except(['_token', 'intent', 'password', 'password_confirmation', 'documents', 'keep_documents']))
                ->filter(fn ($v) => $v !== null && $v !== '')
                ->all();
            $request->session()->put('registration', [...$session, ...$partial]);

            return back()->with('success', 'Your registration progress has been saved for this session. Return to /register to continue.');
        }

        $validated = $request->validate($this->rules($request, $step), [
            'declarations.*.accepted' => 'This declaration is required.',
            'interests.required' => 'Select at least one area of interest.',
            'primary_interest.in' => 'Your primary area of interest must be one of the interests you selected.',
        ]);

        if ($step === 4) {
            $validated = $this->storeDocuments($request, $session, $validated);
        }

        $data = [...$session, ...collect($validated)->except(['keep_documents', 'document_types'])->all()];
        $data['_completed'] = max($data['_completed'] ?? 0, $step);
        $data['_reference'] ??= 'TBCA-REG-'.strtoupper(Str::random(6));

        if ($step < self::REGISTRATION_STEPS) {
            $request->session()->put('registration', $data);

            return redirect()->route('register', ['step' => $step + 1]);
        }

        return $this->createAccount($request, $data);
    }

    private function rules(Request $request, int $step): array
    {
        $individual = $request->boolean('individual');

        return match ($step) {
            1 => [
                'client_type' => ['required', Rule::in(array_keys(self::CLIENT_TYPES))],
                'client_type_other' => ['nullable', 'required_if:client_type,other', 'string', 'max:120'],
            ],
            2 => [
                'title' => ['required', Rule::in(['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Adv', 'Mx'])],
                'first_name' => ['required', 'string', 'max:80'],
                'middle_name' => ['nullable', 'string', 'max:80'],
                'last_name' => ['required', 'string', 'max:80'],
                'preferred_name' => ['nullable', 'string', 'max:80'],
                'job_title' => ['required', 'string', 'max:120'],
                'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')],
                'phone' => ['required', 'string', 'min:7', 'max:30'],
                'whatsapp' => ['nullable', 'string', 'max:30'],
                'contact_channel' => ['required', Rule::in(['Email', 'Phone', 'WhatsApp', 'Client Portal'])],
                'contact_time' => ['nullable', Rule::in(['Morning', 'Afternoon', 'Any time'])],
                'language' => ['required', Rule::in(['English', 'Afrikaans'])],
                'country' => ['required', 'string', 'size:2', Rule::in(array_column(self::countries(), 'value'))],
                'province' => ['required', 'string', 'max:80'],
                'city' => ['required', 'string', 'max:80'],
                'postal_code' => ['nullable', 'string', 'max:12'],
                'individual' => ['boolean'],
                'company' => [Rule::requiredIf(! $individual), 'nullable', 'string', 'max:190'],
                'trading_name' => ['nullable', 'string', 'max:190'],
                'registration_number' => ['nullable', 'string', 'max:60'],
                'organisation_type' => [Rule::requiredIf(! $individual), 'nullable', 'string', 'max:60'],
                'industry' => [Rule::requiredIf(! $individual), 'nullable', 'string', 'max:120'],
                'company_size' => [Rule::requiredIf(! $individual), 'nullable', 'string', 'max:40'],
                'employees' => ['nullable', 'string', 'max:40'],
                'registration_country' => [Rule::requiredIf(! $individual), 'nullable', 'string', 'max:80'],
                'org_province' => ['nullable', 'string', 'max:80'],
                'year_established' => ['nullable', 'integer', 'min:1800', 'max:'.now()->year],
                'website' => ['nullable', 'string', 'max:190'],
                'registered_address' => [Rule::requiredIf(! $individual), 'nullable', 'string', 'max:255'],
                'operating_address' => ['nullable', 'string', 'max:255'],
                'tax_number' => ['nullable', 'string', 'max:30'],
                'parent_organisation' => ['nullable', 'string', 'max:190'],
                'group_status' => ['nullable', 'string', 'max:40'],
                'decision_maker' => ['nullable', 'string', 'max:190'],
            ],
            3 => [
                'interests' => ['required', 'array', 'min:1'],
                'interests.*' => [Rule::in(self::INTERESTS)],
                'primary_interest' => ['required', Rule::in($request->input('interests', []))],
                'assistance' => ['required', 'string', 'max:1000'],
                'project_name' => ['nullable', 'string', 'max:190'],
                'project_country' => ['nullable', 'string', 'max:80'],
                'project_stage' => ['nullable', 'string', 'max:60'],
                'capital_requirement' => ['nullable', 'string', 'max:60'],
                'preferred_currency' => ['nullable', Rule::in(['ZAR', 'USD'])],
                'capital_type' => ['nullable', 'string', 'max:60'],
                'target_date' => ['nullable', 'date'],
                'nda_required' => ['boolean'],
                'project_details' => ['nullable', 'string', 'max:1000'],
                'dd_for' => ['nullable', 'string', 'max:80'],
                'dd_subject_type' => ['nullable', 'string', 'max:60'],
                'dd_purpose' => ['nullable', 'string', 'max:80'],
                'dd_relationship' => ['nullable', 'string', 'max:80'],
            ],
            4 => [
                'documents' => ['nullable', 'array', 'max:8'],
                'documents.*' => ['file', 'max:25600', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg'],
                'document_types' => ['nullable', 'array'],
                'document_types.*' => ['nullable', Rule::in(self::DOCUMENT_TYPES)],
                'keep_documents' => ['nullable', 'array'],
                'contact_channels' => ['required', 'array', 'min:1'],
                'contact_channels.*' => [Rule::in(['Email', 'Telephone', 'WhatsApp', 'Client Portal Notification'])],
                'comm_language' => ['required', Rule::in(['English', 'Afrikaans', 'Portuguese', 'Chinese (Mandarin)', 'French', 'Swahili', 'Arabic'])],
                'comm_purposes' => ['nullable', 'array'],
                'comm_purposes.*' => ['string', 'max:80'],
            ],
            5 => [
                'declarations' => ['required', 'array'],
                ...collect(array_keys(self::DECLARATIONS))->mapWithKeys(fn ($k) => ["declarations.{$k}" => ['accepted']])->all(),
                'optional_consents' => ['nullable', 'array'],
                'optional_consents.*' => ['boolean'],
                'accept_terms' => ['accepted'],
                'password' => ['required', 'confirmed', Password::min(10)->mixedCase()->numbers()],
            ],
            default => abort(404),
        };
    }

    /** Keep previously uploaded files the client did not remove and store new ones privately. */
    private function storeDocuments(Request $request, array $session, array $validated): array
    {
        $keep = $request->input('keep_documents', []);
        $docs = array_values(array_filter($session['documents'] ?? [], fn ($d) => in_array($d['path'], $keep, true)));
        $types = $request->input('document_types', []);

        foreach ($request->file('documents', []) as $i => $file) {
            $docs[] = [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'type' => $types[$i] ?? 'Other Supporting Document',
                'path' => $file->store('registrations', 'local'),
                'status' => 'Securely Stored',
            ];
        }

        return [...$validated, 'documents' => array_slice($docs, 0, 8)];
    }

    private function createAccount(Request $request, array $data): RedirectResponse
    {
        $guestSession = $request->session()->get('basket_token');
        $reference = $data['_reference'];

        $user = User::create([
            'name' => trim($data['first_name'].' '.$data['last_name']),
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'client_id' => 'TBCA-C-'.str_pad((string) (User::max('id') + 1), 6, '0', STR_PAD_LEFT),
            'phone' => $data['phone'],
            'company' => ($data['individual'] ?? false) ? null : ($data['company'] ?? null),
            'job_title' => $data['job_title'] ?? null,
            'country' => $data['country'],
            'client_type' => $data['client_type'],
            'profile' => [
                ...collect($data)->except(['password', 'password_confirmation', 'first_name', 'last_name', 'email', 'phone', 'company', 'job_title', 'country', 'client_type', '_completed', '_reference'])->all(),
                'registration_reference' => $reference,
                'registration_status' => 'under_review',
                'registration_source' => 'Website – /register',
                'assigned_team' => 'Client Onboarding Team',
                'submitted_at' => now()->toIso8601String(),
            ],
        ]);

        $request->session()->forget('registration');
        Auth::login($user);
        Basket::claimFor($user->id, $guestSession);
        $request->session()->regenerate();

        return redirect('/portal')
            ->with('success', "Registration {$reference} submitted and under review. Your Client ID is {$user->client_id}.")
            ->with('reference', $reference);
    }

    /** @return list<array{value: string, label: string}> The 54 African countries, then key markets outside Africa. */
    public static function countries(): array
    {
        $africa = collect(\App\Support\Platform\Africa::all())
            ->map(fn (array $c) => ['value' => $c['iso2'], 'label' => $c['short_name']])
            ->sortBy('label')->values();

        return $africa->concat([
            ['value' => 'GB', 'label' => 'United Kingdom'],
            ['value' => 'US', 'label' => 'United States'],
            ['value' => 'AE', 'label' => 'United Arab Emirates'],
            ['value' => 'CN', 'label' => 'China'],
        ])->all();
    }
}
