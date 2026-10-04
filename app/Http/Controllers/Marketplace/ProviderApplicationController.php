<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Provider;
use App\Models\User;
use App\Support\Marketplace\Options;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Marketplace provider application (MP-SCR-015, GATE-MP-13): 7 steps kept in the
 * session; the final step creates the provider record in state APPLIED and, for
 * new applicants, a provider-portal account (role "partner").
 */
class ProviderApplicationController extends Controller
{
    public const STEPS = [
        ['Business Information', 'Basic business details'],
        ['Contact Person', 'Primary contact details'],
        ['Business Overview', 'About your business'],
        ['Experience & Capability', 'Your experience and team'],
        ['Geographic Coverage', 'Where you operate'],
        ['Certifications & Memberships', 'Professional credentials'],
        ['Review & Submit', 'Review and submit application'],
    ];

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        $app = $request->session()->get('mkt.provider_app', ['reached' => 1, 'data' => []]);
        $step = max(1, min(7, $step));
        if ($step > $app['reached']) {
            return redirect()->route('marketplace.apply', $app['reached']);
        }

        return Inertia::render('Marketplace/ProviderApply', [
            'step' => $step,
            'steps' => self::STEPS,
            'data' => $app['data'],
            'options' => [
                'countries' => Options::select(Options::COUNTRIES),
                'businessTypes' => Options::select(Options::BUSINESS_TYPES),
                'years' => Options::select(Options::YEARS),
                'headcount' => Options::select(Options::HEADCOUNT),
                'services' => Options::select(Options::CATEGORIES),
                'established' => array_map(fn ($y) => ['value' => (string) $y, 'label' => (string) $y], range((int) date('Y'), 1980)),
            ],
            'guest' => ! $request->user(),
        ]);
    }

    private function rules(int $step, Request $request): array
    {
        return match ($step) {
            1 => [
                'registered_name' => 'required|string|max:150',
                'trading_name' => 'nullable|string|max:150',
                'registration_number' => 'required|string|max:40',
                'country' => ['required', Rule::in(Options::COUNTRIES)],
                'year_established' => 'required|integer|min:1900|max:'.date('Y'),
                'business_type' => ['required', Rule::in(Options::BUSINESS_TYPES)],
                'vat_number' => 'nullable|string|max:30',
            ],
            2 => [
                'contact_name' => 'required|string|max:120',
                'designation' => 'required|string|max:120',
                'email' => 'required|email|max:150',
                'phone' => 'required|string|max:30',
                'linkedin' => 'nullable|url|max:200',
            ],
            3 => [
                'description' => 'required|string|min:30|max:500',
                'services' => 'required|array|min:1',
                'services.*' => [Rule::in(array_keys(Options::CATEGORIES))],
            ],
            4 => [
                'years_operating' => ['required', Rule::in(Options::YEARS)],
                'professionals' => ['required', Rule::in(Options::HEADCOUNT)],
                'portfolio' => 'nullable|string|max:500',
            ],
            5 => [
                'countries' => 'required|array|min:1',
                'countries.*' => [Rule::in(Options::COUNTRIES)],
            ],
            6 => [
                'certifications' => 'nullable|array',
                'certifications.*' => 'string|max:200',
                'additional' => 'nullable|string|max:500',
            ],
            7 => array_filter([
                'confirm_accuracy' => 'accepted',
                'consent_vetting' => 'accepted',
                'password' => $request->user() ? null : 'required|string|min:8|confirmed',
            ]),
        };
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        $step = max(1, min(7, $step));
        $app = $request->session()->get('mkt.provider_app', ['reached' => 1, 'data' => []]);
        abort_if($step > $app['reached'], 422, 'Complete the earlier steps first.');

        if ($request->boolean('save_exit')) {
            $app['data'] = [...$app['data'], ...$request->except(['save_exit', 'password', 'password_confirmation'])];
            $request->session()->put('mkt.provider_app', $app);

            return redirect()->route('marketplace.providers')->with('success', 'Application progress saved. Return any time to continue.');
        }

        $data = $request->validate($this->rules($step, $request));

        if ($step === 2 && ! $request->user() && User::where('email', $data['email'])->exists()) {
            return back()->withErrors(['email' => 'An account with this email exists. Sign in first to link your application.']);
        }

        unset($data['password'], $data['password_confirmation'], $data['confirm_accuracy'], $data['consent_vetting']);
        $app['data'] = [...$app['data'], ...$data];
        $app['reached'] = max($app['reached'], min(7, $step + 1));
        $request->session()->put('mkt.provider_app', $app);

        if ($step < 7) {
            return redirect()->route('marketplace.apply', $step + 1);
        }

        $d = $app['data'];
        $user = $request->user();
        if (! $user) {
            $user = User::create([
                'name' => $d['contact_name'],
                'email' => $d['email'],
                'password' => $request->input('password'),
                'role' => 'partner',
                'phone' => $d['phone'],
                'company' => $d['registered_name'],
                'job_title' => $d['designation'],
                'country' => 'ZA',
            ]);
            Auth::login($user);
        }

        $seq = Provider::where('kind', 'marketplace')->count() + 40;
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $d['services'][0] ?? 'GEN'), 0, 3));
        $provider = Provider::create([
            'code' => sprintf('%s-PRV-%03d', $prefix, $seq),
            'slug' => Str::slug($d['registered_name']).'-'.Str::lower(Str::random(4)),
            'kind' => 'marketplace',
            'user_id' => $user->id,
            'name' => $d['registered_name'],
            'category' => $d['services'][0],
            'city' => null,
            'country' => $d['country'],
            'status' => 'applied',
            'application_ref' => sprintf('PV-2026-%04d', $seq + 100),
            'score' => 0,
            'application' => $d,
            'profile' => ['categories' => $d['services'], 'countries' => $d['countries'], 'skills' => [], 'capacity' => 80, 'base_rate' => 30000, 'typical_days' => 10, 'compliance' => ['kyc' => false]],
            'vetting' => ['stage' => 'Initial Screen', 'checklist' => self::checklist(), 'activity' => [['at' => now()->format('d M Y, H:i'), 'body' => 'Application submitted by applicant']]],
        ]);

        $request->session()->forget('mkt.provider_app');
        $request->session()->put('mkt.provider_submitted', $provider->application_ref);

        return redirect()->route('marketplace.apply.submitted');
    }

    public static function checklist(): array
    {
        return collect([
            ['Business Registration', 'CIPC registration, status and directors'],
            ['Tax Compliance', 'SARS Tax Compliance Status PIN'],
            ['Financial Standing', 'Financial statements or bank reference'],
            ['Professional Credentials', 'Qualifications and professional memberships'],
            ['Insurance', 'Professional indemnity insurance'],
            ['References', 'Client references and testimonials'],
            ['Legal & Compliance', 'POPIA, Anti-Bribery and TBCA Terms acceptance'],
            ['Sanctions & PEP Screening', 'Sanctions and politically exposed persons check'],
        ])->map(fn ($r) => ['area' => $r[0], 'description' => $r[1], 'status' => 'pending', 'evidence' => null, 'note' => null])->all();
    }

    public function submitted(Request $request): Response
    {
        $ref = $request->session()->get('mkt.provider_submitted');
        $provider = $ref ? Provider::where('application_ref', $ref)->first() : null;

        return Inertia::render('Marketplace/ProviderApplySubmitted', [
            'reference' => $ref,
            'name' => $provider?->name,
        ]);
    }
}
