<?php

namespace App\Http\Controllers\Aiim;

use App\Models\User;
use App\Support\Aiim\Refs;
use App\Support\Aiim\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Response;

/**
 * AIIM registration (stage B, gate G1): three steps held in the session until the
 * final step creates the account with consent and stated intent.
 */
class AccountController extends AiimController
{
    public const INTERESTS = ['Investing in opportunities', 'Trading & market entry', 'Raising capital for a project', 'Research & market intelligence', 'Government / DFI portfolio'];

    public const HEARD = ['Search engine', 'LinkedIn', 'Referral', 'Event or webinar', 'TBCA advisor', 'Other'];

    public const ORG_TYPES = ['Investor / Fund', 'Corporate', 'SME / Founder', 'Government / DFI', 'Advisor / Consultant', 'Research / Academia'];

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        $data = $request->session()->get('aiim.register', []);
        if ($step > 1 && empty($data['step1'])) {
            return redirect('/aiim/register');
        }
        if ($step > 2 && empty($data['step2'])) {
            return redirect('/aiim/register/2');
        }

        return $this->render($request, 'Aiim/Register', [
            'step' => max(1, min(3, $step)),
            'data' => collect($data)->map(fn ($s) => collect($s)->except(['password', 'password_confirmation']))->all(),
            'options' => ['interests' => self::INTERESTS, 'heard' => self::HEARD, 'orgTypes' => self::ORG_TYPES, 'provinces' => \App\Models\Aiim\Province::query()->orderBy('rank')->get(['slug', 'name']), 'sectors' => \App\Models\Aiim\Sector::query()->orderBy('sort')->get(['slug', 'name'])],
        ], 'Registration');
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        $data = $request->session()->get('aiim.register', []);

        if ($step === 1) {
            $valid = $request->validate([
                'name' => ['required', 'string', 'max:120'],
                'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')],
                'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
                'interest' => ['required', Rule::in(self::INTERESTS)],
                'heard' => ['nullable', Rule::in(self::HEARD)],
                'terms' => ['accepted'],
                'marketing' => ['boolean'],
            ], ['terms.accepted' => 'Please confirm you are over 18 and accept the Terms of Use and Privacy Policy.']);
            $valid['password'] = Hash::make($valid['password']);
            $data['step1'] = $valid;
            $request->session()->put('aiim.register', $data);

            return redirect('/aiim/register/2');
        }

        if ($step === 2) {
            abort_if(empty($data['step1']), 409);
            $data['step2'] = $request->validate([
                'company' => ['required', 'string', 'max:190'],
                'job_title' => ['required', 'string', 'max:120'],
                'org_type' => ['required', Rule::in(self::ORG_TYPES)],
                'phone' => ['required', 'string', 'max:30'],
                'province' => ['required', 'string', 'exists:aiim_provinces,slug'],
                'sector' => ['required', 'string', 'exists:aiim_sectors,slug'],
            ]);
            $request->session()->put('aiim.register', $data);

            return redirect('/aiim/register/3');
        }

        abort_unless($step === 3 && ! empty($data['step2']), 409);
        $request->validate([
            'id_type' => ['required', Rule::in(['South African ID', 'Passport', 'Company Registration'])],
            'id_number' => ['required', 'string', 'min:6', 'max:30'],
            'popia' => ['accepted'],
        ], ['popia.accepted' => 'Please consent to the processing of your information under POPIA.']);

        $s1 = $data['step1'];
        $s2 = $data['step2'];
        $accountId = 'AIIM-'.now()->format('ymd-Hi').'-'.strtoupper(substr(md5($s1['email']), 0, 4));
        $user = User::create([
            'name' => $s1['name'],
            'email' => $s1['email'],
            'password' => $s1['password'], // already hashed; the "hashed" cast does not re-hash it
            'client_id' => 'TBCA-C-'.str_pad((string) (User::max('id') + 1), 6, '0', STR_PAD_LEFT),
            'role' => 'client',
            'phone' => $s2['phone'],
            'company' => $s2['company'],
            'job_title' => $s2['job_title'],
            'country' => 'ZA',
            'client_type' => str_contains($s2['org_type'], 'Investor') ? 'investor' : 'corporate',
            'profile' => ['aiim' => [
                'account_id' => $accountId, 'interest' => $s1['interest'], 'heard' => $s1['heard'] ?? null, 'marketing' => (bool) ($s1['marketing'] ?? false),
                'org_type' => $s2['org_type'], 'province' => $s2['province'], 'sector' => $s2['sector'],
                'verification' => 'pending', 'id_type' => $request->input('id_type'), 'registered_at' => now()->toIso8601String(), 'source' => 'aiim',
            ]],
        ]);

        WalletService::wallet($user);
        $request->session()->forget('aiim.register');
        Auth::login($user);
        $request->session()->regenerate();
        $this->select($request, ['province' => $s2['province'], 'sector' => $s2['sector']]);

        return redirect('/aiim/welcome')->with('success', "Welcome to AIIM. Your account ID is {$accountId}.");
    }

    public function welcome(Request $request): Response
    {
        $user = $request->user();
        $p = $user->profile['aiim'] ?? [];

        return $this->render($request, 'Aiim/Welcome', [
            'account' => [
                'name' => $user->name, 'email' => $user->email, 'country' => 'South Africa',
                'province' => isset($p['province']) ? \App\Models\Aiim\Province::query()->where('slug', $p['province'])->value('name') : '—',
                'sector' => isset($p['sector']) ? \App\Models\Aiim\Sector::query()->where('slug', $p['sector'])->value('name') : '—',
                'type' => 'Standard (Free Access)',
                'registered' => isset($p['registered_at']) ? \Illuminate\Support\Carbon::parse($p['registered_at'])->format('j M Y, H:i').' SAST' : $user->created_at->format('j M Y, H:i'),
                'accountId' => $p['account_id'] ?? Refs::make('AIIM'),
                'verification' => ($p['verification'] ?? 'pending') === 'verified' ? 'Verified' : 'Pending Verification',
                'introducedBy' => 'Self Registration',
            ],
        ], 'Registration');
    }
}
