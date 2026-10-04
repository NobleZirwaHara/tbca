<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Provider;
use App\Models\User;
use App\Support\Marketplace\Content;
use App\Support\Marketplace\Options;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Partner Network application (PS-016..018): Entity Details, Practitioner Details,
 * Verification & Documents, Partner Agreement, Sign & Execute, Final Review -> Approval.
 * Progress is kept in the session; submission creates the partner firm in
 * PENDING_VERIFICATION (status "verification") for admin approval in the Live Partner Register.
 */
class PartnerApplicationController extends Controller
{
    public const STEPS = ['Entity Details', 'Practitioner Details', 'Verification & Documents', 'Partner Agreement', 'Sign & Execute', 'Final Review', 'Approval'];

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        $app = $request->session()->get('mkt.partner_app', ['reached' => 1, 'data' => [], 'ref' => null]);
        if (! $app['ref']) {
            $app['ref'] = sprintf('PSA-2026-%06d', random_int(100, 999999));
            $request->session()->put('mkt.partner_app', $app);
        }
        $step = max(1, min(6, $step));
        if ($step > $app['reached']) {
            return redirect()->route('partner-services.apply', $app['reached']);
        }

        return Inertia::render('Marketplace/Partner/Apply', [
            'step' => $step,
            'steps' => self::STEPS,
            'data' => $app['data'],
            'reference' => $app['ref'],
            'documents' => Content::partnerDocuments(),
            'agreementDocs' => Content::partnerAgreementDocs(),
            'guest' => ! $request->user(),
            'options' => [
                'entityTypes' => Options::select(Options::ENTITY_TYPES),
                'countries' => Options::select(Options::COUNTRIES),
                'provinces' => Options::select(Options::PROVINCES),
                'bbbee' => Options::select(Options::BBBEE),
                'professions' => Options::select(Options::PROFESSIONS),
            ],
        ]);
    }

    private function rules(int $step, Request $request): array
    {
        return match ($step) {
            1 => [
                'legal_name' => 'required|string|max:150',
                'entity_type' => ['required', Rule::in(Options::ENTITY_TYPES)],
                'year_established' => 'required|integer|min:1900|max:'.date('Y'),
                'trading_name' => 'nullable|string|max:150',
                'country' => ['required', Rule::in(Options::COUNTRIES)],
                'bbbee' => 'nullable|string|max:40',
                'registration_number' => 'required|string|max:40',
                'vat_number' => 'nullable|string|max:30',
                'primary_contact' => 'required|string|max:120',
                'physical_address' => 'required|string|max:300',
                'postal_address' => 'nullable|string|max:300',
                'city' => 'required|string|max:80',
                'province' => 'required|string|max:80',
                'code' => 'required|string|max:10',
                'telephone' => 'required|string|max:30',
                'mobile' => 'nullable|string|max:30',
                'email' => 'required|email|max:150',
                'website' => 'nullable|url|max:200',
            ],
            2 => [
                'practitioner_name' => 'required|string|max:120',
                'profession' => ['required', Rule::in(Options::PROFESSIONS)],
                'specialisation' => 'required|string|max:120',
                'registration_body' => 'required|string|max:80',
                'professional_registration' => 'required|string|max:60',
                'jurisdictions' => 'required|array|min:1',
                'jurisdictions.*' => [Rule::in(Options::COUNTRIES)],
                'experience' => 'required|integer|min:0|max:60',
            ],
            3 => [
                'documents' => 'required|array',
                'documents.company_registration' => 'required|string|max:200',
                'documents.proof_address' => 'required|string|max:200',
                'documents.professional_registration' => 'required|string|max:200',
                'documents.qualifications' => 'required|string|max:200',
                'documents.indemnity' => 'required|string|max:200',
                'documents.tax_clearance' => 'required|string|max:200',
                'documents.identity' => 'required|string|max:200',
                'documents.bbbee' => 'nullable|string|max:200',
                'indemnity_expiry' => 'required|date|after:today',
            ],
            4 => ['read_documents' => 'accepted'],
            5 => [
                'signatory' => 'required|string|max:120',
                'capacity' => 'required|string|max:80',
                'signature' => 'required|string|max:120',
                'ack_independence' => 'accepted',
                'ack_conflicts' => 'accepted',
                'ack_indemnity' => 'accepted',
            ],
            6 => array_filter([
                'confirm_accuracy' => 'accepted',
                'consent_verification' => 'accepted',
                'password' => $request->user() ? null : 'required|string|min:8|confirmed',
            ]),
        };
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        $step = max(1, min(6, $step));
        $app = $request->session()->get('mkt.partner_app', ['reached' => 1, 'data' => [], 'ref' => null]);
        abort_if($step > $app['reached'], 422, 'Complete the earlier steps first.');

        if ($request->boolean('save_exit')) {
            $app['data'] = [...$app['data'], ...$request->except(['save_exit', 'password', 'password_confirmation'])];
            $request->session()->put('mkt.partner_app', $app);

            return redirect()->route('partner-services.network')->with('success', 'Application saved. You can continue later from this browser session.');
        }

        $data = $request->validate($this->rules($step, $request));
        if ($step === 1 && ! $request->user() && User::where('email', $data['email'])->exists()) {
            return back()->withErrors(['email' => 'An account with this email exists. Sign in first to link your application.']);
        }
        unset($data['password'], $data['password_confirmation']);
        if ($step === 5) {
            $data['signed_at'] = now()->format('d M Y, H:i');
        }
        $app['data'] = [...$app['data'], ...$data];
        $app['reached'] = max($app['reached'], min(6, $step + 1));
        $request->session()->put('mkt.partner_app', $app);

        if ($step < 6) {
            return redirect()->route('partner-services.apply', $step + 1);
        }

        $d = $app['data'];
        $user = $request->user();
        if (! $user) {
            $user = User::create([
                'name' => $d['primary_contact'], 'email' => $d['email'], 'password' => $request->input('password'),
                'role' => 'partner', 'phone' => $d['telephone'], 'company' => $d['legal_name'], 'country' => 'ZA',
            ]);
            Auth::login($user);
        }

        $seq = Provider::where('kind', 'partner')->count() + 60;
        Provider::create([
            'code' => sprintf('P-2026-%05d', $seq),
            'slug' => Str::slug($d['legal_name']).'-'.Str::lower(Str::random(4)),
            'kind' => 'partner',
            'user_id' => $user->id,
            'name' => $d['legal_name'],
            'profession' => $d['profession'],
            'category' => $d['specialisation'],
            'city' => $d['city'],
            'country' => $d['country'],
            'status' => 'verification',
            'application_ref' => $app['ref'],
            'next_review_at' => $d['indemnity_expiry'],
            'application' => $d,
            'profile' => [
                'practitioner' => $d['practitioner_name'], 'lead' => $d['practitioner_name'], 'specialisation' => $d['specialisation'],
                'registration_body' => $d['registration_body'], 'professional_registration' => $d['professional_registration'],
                'registration' => $d['registration_number'], 'address' => $d['city'].', '.$d['province'], 'experience' => $d['experience'].'+ years',
                'jurisdictions' => $d['jurisdictions'], 'indemnity' => 'PENDING_VERIFICATION', 'verification' => 'PENDING_VERIFICATION', 'panel' => 'INACTIVE',
                'standard_fee' => 68500,
            ],
        ]);

        $request->session()->forget('mkt.partner_app');
        $request->session()->put('mkt.partner_submitted', $app['ref']);

        return redirect()->route('partner-services.apply.submitted');
    }

    public function submitted(Request $request): Response
    {
        $ref = $request->session()->get('mkt.partner_submitted');

        return Inertia::render('Marketplace/Partner/ApplySubmitted', [
            'reference' => $ref,
            'name' => $ref ? Provider::where('application_ref', $ref)->value('name') : null,
            'steps' => self::STEPS,
        ]);
    }
}
