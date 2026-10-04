<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Support\Advisory\ServicesContent;
use App\Support\Advisory\TechContent;
use App\Support\Advisory\TechWorkflow;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public Technology Solutions journey (S0-S4 are free): Context -> Towers -> Diagnose ->
 * Configure -> Fees -> Letter. State is held server-side in the session until the
 * engagement letter is signed, which creates the engagement and presents Gate 1.
 */
class TechJourneyController extends Controller
{
    private const KEY = 'adv_ts';

    private function journey(Request $request): array
    {
        return $request->session()->get(self::KEY, []);
    }

    private function put(Request $request, array $patch): void
    {
        $request->session()->put(self::KEY, array_merge($this->journey($request), $patch));
    }

    private function progress(array $j): array
    {
        return [
            'context' => isset($j['context']), 'towers' => isset($j['tower']), 'diagnose' => isset($j['diagnostic']),
            'configure' => isset($j['config']), 'fees' => isset($j['fees_reviewed']), 'letter' => false,
        ];
    }

    private function shared(Request $request): array
    {
        $j = $this->journey($request);

        return ['journey' => ['tower' => $j['tower'] ?? null, 'progress' => $this->progress($j), 'org' => $j['context']['legal_name'] ?? null]];
    }

    public function index(): Response
    {
        return Inertia::render('Advisory/Tech/Index', ['towers' => array_values(TechContent::towers())]);
    }

    public static function contextDefaults(?\App\Models\User $u = null): array
    {
        return [
            'country' => 'South Africa', 'language' => 'English', 'currency' => 'ZAR', 'usd' => 'By Product',
            'legal_name' => $u?->company ? "{$u->company} (Pty) Ltd" : '', 'trading_name' => $u?->company ?? '', 'registration' => '', 'email' => $u?->email ?? '', 'phone' => $u?->phone ?? '', 'website' => '',
            'industry' => 'Manufacturing', 'model' => 'B2B', 'objective' => 'Scale Operations & Improve Efficiency', 'challenge' => '',
            'crm' => 'Zoho CRM', 'accounting' => 'QuickBooks Online Plus', 'platforms' => '', 'size' => '51 – 250 Employees', 'users' => 120, 'sites' => 2,
            'revenue' => 'R50m – R250m', 'data' => 'Medium (10GB – 1TB)',
        ];
    }

    public function context(Request $request): Response
    {
        return Inertia::render('Advisory/Tech/Context', [
            ...$this->shared($request),
            'context' => $this->journey($request)['context'] ?? self::contextDefaults($request->user()),
            'options' => [
                'industries' => ['Manufacturing', 'Agriculture', 'Financial Services', 'Retail & eCommerce', 'Professional Services', 'Logistics & Transport', 'Health', 'Construction', 'Public Sector', 'Other'],
                'models' => ['B2B', 'B2C', 'B2B2C', 'Public / Non-profit'],
                'objectives' => ['Scale Operations & Improve Efficiency', 'Improve Data Visibility & Reporting', 'Automate Manual Processes', 'Launch Digital Channels', 'Strengthen Security & Compliance'],
                'crms' => ['Zoho CRM', 'HubSpot', 'Salesforce', 'Microsoft Dynamics', 'None / Spreadsheets'],
                'accounting' => ['QuickBooks Online Plus', 'Xero', 'Sage', 'Zoho Books', 'Other'],
                'sizes' => ['1 – 10 Employees', '11 – 50 Employees', '51 – 250 Employees', '251 – 1,000 Employees', '1,000+ Employees'],
                'revenues' => ['Under R5m', 'R5m – R50m', 'R50m – R250m', 'R250m – R1bn', 'Over R1bn'],
                'data' => ['Small (< 10GB)', 'Medium (10GB – 1TB)', 'Large (1TB – 10TB)', 'Very Large (10TB+)'],
            ],
        ]);
    }

    public function contextStore(Request $request): RedirectResponse
    {
        $d = $request->validate([
            'country' => ['required', Rule::in(['South Africa'])], 'language' => ['required', Rule::in(['English', 'Afrikaans'])], 'currency' => ['required', Rule::in(['ZAR'])], 'usd' => ['required', 'string'],
            'legal_name' => ['required', 'string', 'max:160'], 'trading_name' => ['nullable', 'string', 'max:160'], 'registration' => ['required', 'regex:/^\d{4}\/\d{6}\/\d{2}$/'],
            'email' => ['required', 'email'], 'phone' => ['required', 'string', 'max:40'], 'website' => ['nullable', 'string', 'max:160'],
            'industry' => ['required', 'string'], 'model' => ['required', 'string'], 'objective' => ['required', 'string'], 'challenge' => ['required', 'string', 'min:20', 'max:500'],
            'crm' => ['required', 'string'], 'accounting' => ['required', 'string'], 'platforms' => ['nullable', 'string', 'max:200'],
            'size' => ['required', 'string'], 'users' => ['required', 'integer', 'min:1', 'max:100000'], 'sites' => ['required', 'integer', 'min:1', 'max:1000'],
            'revenue' => ['required', 'string'], 'data' => ['required', 'string'], 'draft' => ['boolean'],
        ], ['country.in' => 'Phase 1: South Africa only. Other countries coming soon.', 'registration.regex' => 'Use the CIPC format YYYY/NNNNNN/NN.']);
        $draft = $request->boolean('draft');
        unset($d['draft']);
        $this->put($request, ['context' => $d]);

        return $draft ? back()->with('success', 'Context saved as draft.') : redirect()->route('adv.ts.towers');
    }

    public function towers(Request $request): Response
    {
        return Inertia::render('Advisory/Tech/Towers', [...$this->shared($request), 'towers' => array_values(TechContent::towers())]);
    }

    public function towersStore(Request $request): RedirectResponse
    {
        $d = $request->validate(['tower' => ['required', Rule::in(array_column(TechContent::towers(), 'code'))], 'draft' => ['boolean']]);
        $this->put($request, ['tower' => $d['tower']]);

        return $request->boolean('draft') ? back()->with('success', 'Tower selection saved.') : redirect()->route('adv.ts.readiness');
    }

    public function tower(string $slug): Response
    {
        abort_unless(isset(TechContent::towers()[$slug]), 404);

        return Inertia::render('Advisory/Tech/Tower', ['tower' => TechContent::towerDetail($slug)]);
    }

    public function readiness(Request $request): Response
    {
        $answers = $this->journey($request)['diagnostic']['answers'] ?? ['tools_0' => 2, 'tools_1' => 3, 'data_0' => 3, 'data_1' => 2, 'integrations_0' => 2, 'integrations_1' => 1, 'security_0' => 3, 'security_1' => 2, 'automation_0' => 1, 'automation_1' => 2, 'capacity_0' => 2, 'capacity_1' => 1];

        return Inertia::render('Advisory/Tech/Readiness', [
            ...$this->shared($request),
            'dimensions' => array_map(fn ($d) => ['key' => $d[0], 'name' => $d[1], 'questions' => $d[2], 'tower' => $d[3]], TechContent::diagnosticDimensions()),
            'levels' => TechContent::LEVELS, 'answers' => $answers, 'result' => TechContent::readiness($answers),
            'towerNames' => collect(TechContent::towers())->mapWithKeys(fn ($t) => [$t['code'] => $t['name']]),
        ]);
    }

    public function readinessStore(Request $request): RedirectResponse
    {
        $rules = ['next' => ['required', Rule::in(['save', 'configure'])]];
        foreach (TechContent::diagnosticDimensions() as [$key, , $qs]) {
            foreach (array_keys($qs) as $i) {
                $rules["answers.{$key}_{$i}"] = ['required', 'integer', 'between:0,4'];
            }
        }
        $d = $request->validate($rules, ['answers.*.required' => 'Answer every question to generate an accurate result.']);
        $result = TechContent::readiness($d['answers']);
        $this->put($request, ['diagnostic' => ['answers' => $d['answers'], 'score' => $result['score'], 'recommended' => array_column($result['recommended'], 'code')]]);

        return $d['next'] === 'save' ? back()->with('success', "Diagnostic saved — readiness {$result['score']}/100.") : redirect()->route('adv.ts.configure');
    }

    public function configure(Request $request): Response
    {
        $config = $this->journey($request)['config'] ?? TechContent::defaultConfig();

        return Inertia::render('Advisory/Tech/Configure', [...$this->shared($request), 'options' => TechContent::configOptions(), 'config' => $config, 'summary' => TechContent::configSummary($config), 'defaults' => TechContent::defaultConfig()]);
    }

    public function configureStore(Request $request): RedirectResponse
    {
        $opts = collect(TechContent::configOptions())->keyBy('key');
        $vals = fn ($k) => array_column($opts[$k]['options'], 0);
        $d = $request->validate([
            'agents' => ['array'], 'agents.*' => [Rule::in($vals('agents'))],
            'automation' => ['required', Rule::in($vals('automation'))],
            'integrations' => ['array'], 'integrations.*' => [Rule::in($vals('integrations'))],
            'analytics' => ['required', Rule::in($vals('analytics'))], 'security' => ['required', Rule::in($vals('security'))],
            'compliance' => ['array'], 'compliance.*' => [Rule::in(['POPIA', 'ISO 27001', 'GDPR', 'PCI DSS'])],
            'deployment' => ['required', Rule::in($vals('deployment'))], 'scale' => ['required', Rule::in($vals('scale'))], 'support' => ['required', Rule::in($vals('support'))],
            'next' => ['required', Rule::in(['save', 'continue'])],
        ]);
        $next = $d['next'];
        unset($d['next']);
        $d['agents'] ??= [];
        $d['integrations'] ??= [];
        $d['compliance'] ??= [];
        $this->put($request, ['config' => $d]);

        return $next === 'save' ? back()->with('success', 'Configuration saved.') : redirect()->route('adv.ts.fees');
    }

    private function feeData(Request $request): array
    {
        $j = $this->journey($request);
        $config = $j['config'] ?? TechContent::defaultConfig();
        $lines = TechContent::feeLines($config);
        $opts = collect(TechContent::configOptions())->keyBy('key');
        $label = fn ($k) => collect($opts[$k]['options'])->firstWhere(0, $config[$k])[1] ?? $config[$k];
        $tower = TechContent::towerByCode($j['tower'] ?? 'TS-1');

        return [
            ...$this->shared($request),
            'lines' => $lines, 'totals' => TechContent::ledgerTotals($lines),
            'summary' => [
                'tower' => $tower['code'].' '.$tower['name'], 'deployment' => $label('deployment'), 'support' => $label('support'), 'scale' => $label('scale'),
                'complexity' => TechContent::configSummary($config)['complexity'].' ('.TechContent::configSummary($config)['timeline'].')', 'status' => 'Draft (Review Required)',
            ],
            'gates' => TechContent::gatePlan(TechContent::ledgerTotals($lines)),
            'plan' => $j['payment_plan'] ?? 'deposit_milestones',
            'context' => $j['context'] ?? null,
            'configured' => isset($j['config']),
        ];
    }

    public function fees(Request $request): Response
    {
        $this->put($request, ['fees_reviewed' => true]);

        return Inertia::render('Advisory/Tech/Fees', $this->feeData($request));
    }

    public function externalCosts(Request $request): Response
    {
        $suppliers = ['Third-Party Licences' => 'Microsoft, Zoho, Adobe, Others', 'API or Connector Subscriptions' => 'Zoho Marketplace, Microsoft Azure, Others', 'Cloud Hosting Estimate' => 'AWS, Azure, Zoho Cloud', 'Domain / Email Services' => 'GoDaddy, Zoho Mail, Google Workspace', 'Regulatory / Compliance Filing' => 'CIPC, SARS, Industry Regulators'];

        return Inertia::render('Advisory/Tech/ExternalCosts', [...$this->feeData($request), 'suppliers' => $suppliers]);
    }

    public function scope(Request $request): Response
    {
        $data = $this->feeData($request);

        return Inertia::render('Advisory/Tech/Scope', [...$data, 'engagement' => null]);
    }

    public function checkout(Request $request): Response
    {
        return Inertia::render('Advisory/Tech/Checkout', $this->feeData($request));
    }

    public function checkoutStore(Request $request): RedirectResponse
    {
        $d = $request->validate(['plan' => ['required', Rule::in(['deposit_milestones', 'full', 'custom'])]]);
        $this->put($request, ['payment_plan' => $d['plan']]);

        return redirect()->route('adv.ts.letter');
    }

    public function letter(Request $request): Response
    {
        $data = $this->feeData($request);
        $j = $this->journey($request);

        return Inertia::render('Advisory/Tech/Letter', [...$data, 'ready' => isset($j['context'], $j['config']), 'signedIn' => (bool) $request->user(), 'firstGate' => $data['gates'][0]]);
    }

    public function letterSign(Request $request): RedirectResponse
    {
        $d = $request->validate([
            'checks' => ['required', 'array', 'size:6'], 'checks.*' => ['accepted'], 'method' => ['required', Rule::in(['esign', 'manual'])],
            'name' => ['required', 'string', 'max:120'], 'authority' => ['accepted'], 'comments' => ['nullable', 'string', 'max:500'],
        ], ['checks.size' => 'Confirm every item on the review checklist.', 'authority.accepted' => 'Confirm you have authority to bind the organisation.']);
        $j = $this->journey($request);
        if (! isset($j['context'], $j['config'])) {
            return redirect()->route('adv.ts.context')->with('error', 'Complete your context and configuration before signing.');
        }
        $e = TechWorkflow::create($j, $request->user(), $d['name']);
        $request->session()->forget(self::KEY);
        $order = TechWorkflow::approveGate($e, $e->gates()->where('number', 1)->first(), $request->user());

        return $order ? redirect()->route('checkout.show', $order)->with('success', 'Engagement letter signed. Pay the Gate 1 deposit to activate your engagement.')
            : redirect()->route('adv.ts.ws.dashboard', $e);
    }

    public function sprint(Request $request, string $slug): Response
    {
        abort_unless($slug === 'ai-automation', 404);

        return Inertia::render('Advisory/Tech/Sprint', ['data' => TechContent::techSprint(), 'vat' => ServicesContent::VAT]);
    }

    public function sprintStart(Request $request, string $slug): RedirectResponse
    {
        $d = $request->validate(['package' => ['required', Rule::in(['starter', 'professional', 'advanced', 'custom'])]]);
        if ($d['package'] === 'custom') {
            return redirect()->route('adv.services.proposal')->with('success', 'Tell us about your requirements and we will quote a custom sprint.');
        }
        $pkg = collect(TechContent::techSprint()['packages'])->firstWhere('key', $d['package']);
        $deposit = (int) round($pkg['price'] * 0.30);
        $order = Checkout::createOrder([[
            'item_type' => 'sprint', 'item_code' => 'TS-AI-SPRINT-'.strtoupper($pkg['key']), 'name' => "AI & Automation Sprint — {$pkg['name']} (30% deposit on acceptance)",
            'unit_zar' => $deposit, 'variant' => $pkg['name'], 'meta' => ['package_total' => $pkg['price'], 'plan' => '30/40/30'],
        ]], $request->user(), 'advisory', ['return_url' => '/technology-solutions/workspace', 'title' => 'AI & Automation Sprint deposit']);

        return redirect()->route('checkout.show', $order);
    }
}
