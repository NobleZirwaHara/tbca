<?php

namespace App\Http\Controllers\Aiim;

use App\Models\User;
use App\Support\Aiim\ProtoAccount;
use App\Support\Aiim\Refs;
use App\Support\Aiim\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Response;

/**
 * AIIM registration (mock-ups 19 and 20, gate G1): one form that creates the free
 * account with consent, the investor type, display preferences and sectors of interest.
 */
class AccountController extends AiimController
{
    public const CURRENCIES = ['BWP', 'USD', 'ZAR'];

    public const LANGUAGES = ['English', 'Setswana'];

    /** Investor persona => users.client_type. */
    private const CLIENT_TYPE = ['SME' => 'sme', 'DFI' => 'investor', 'CORP' => 'corporate', 'INF' => 'investor', 'TRD' => 'sme', 'DIA' => 'investor'];

    public function show(Request $request, int $step = 1): Response|RedirectResponse
    {
        if ($step !== 1) {
            return redirect('/aiim/register');
        }

        return $this->render($request, 'Aiim/Register', [
            'options' => [
                'personas' => collect(ProtoAccount::PERSONAS)->map(fn ($l, $c) => ['code' => $c, 'label' => $l])->values(),
                'currencies' => self::CURRENCIES,
                'languages' => self::LANGUAGES,
                'sectors' => collect(ProtoAccount::sectors())->map(fn ($s) => ['code' => $s['code'], 'name' => $s['name']]),
            ],
            'services' => ProtoAccount::rail(['AAB-EMB-093', 'AAB-EMB-094', 'AAB-EMB-113'], 3),
        ], 'Registration');
    }

    public function store(Request $request, int $step): RedirectResponse
    {
        if ($step !== 1) {
            return redirect('/aiim/register');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')],
            'organisation' => ['nullable', 'string', 'max:190'],
            'persona' => ['required', Rule::in(array_keys(ProtoAccount::PERSONAS))],
            'currency' => ['required', Rule::in(self::CURRENCIES)],
            'language' => ['required', Rule::in(self::LANGUAGES)],
            'sectors' => ['array'],
            'sectors.*' => [Rule::in(array_keys(ProtoAccount::SECTORS))],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'terms' => ['accepted'],
            'marketing' => ['boolean'],
        ], ['terms.accepted' => 'Please agree to the Terms and the Privacy Notice.']);

        $accountId = 'AIIM-'.now()->format('ymd-Hi').'-'.strtoupper(substr(md5($data['email']), 0, 4));
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'client_id' => 'TBCA-C-'.str_pad((string) (User::max('id') + 1), 6, '0', STR_PAD_LEFT),
            'role' => 'client',
            'company' => $data['organisation'] ?? null,
            'client_type' => self::CLIENT_TYPE[$data['persona']],
            'profile' => ['aiim' => [
                'account_id' => $accountId,
                'persona' => $data['persona'],
                'currency' => $data['currency'],
                'language' => $data['language'],
                'sectors' => array_values($data['sectors'] ?? []),
                'marketing' => (bool) ($data['marketing'] ?? false),
                'verification' => 'pending',
                'registered_at' => now()->toIso8601String(),
                'source' => 'aiim',
            ]],
        ]);

        WalletService::wallet($user);
        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/aiim/welcome')->with('success', "Account created. Your account ID is {$accountId}.");
    }

    public function welcome(Request $request): Response
    {
        $user = $request->user();
        $p = $user->profile['aiim'] ?? [];

        return $this->render($request, 'Aiim/Welcome', [
            'account' => [
                'name' => $user->name,
                'accountId' => $p['account_id'] ?? Refs::make('AIIM'),
                'persona' => ProtoAccount::PERSONAS[$p['persona'] ?? ''] ?? null,
                'sectors' => array_map(fn ($c) => ProtoAccount::sectorName($c), $p['sectors'] ?? []),
            ],
            'top' => array_slice(ProtoAccount::top30(), 0, 6),
        ], 'Registration');
    }
}
