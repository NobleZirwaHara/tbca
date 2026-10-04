<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Support\DueDiligence\Catalogue;
use App\Support\DueDiligence\Content;
use App\Support\DueDiligence\Pricing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public Due Diligence screens: landing (DD-001), service selector (DD-002),
 * family overviews with tabs (DD-003 to DD-016) and package comparison /
 * price discovery (DD-017).
 */
class PublicController extends Controller
{
    public const TABS = [
        'overview' => 'Overview', 'packages' => 'Packages', 'included' => "What's Included", 'inputs-required' => 'Inputs Required',
        'process' => 'Process', 'deliverables' => 'Deliverables', 'risk-review' => 'Risk & Review', 'add-ons' => 'Add-ons',
        'faqs' => 'FAQs', 'support' => 'Support',
    ];

    public function index(): Response
    {
        return Inertia::render('DueDiligence/Index', [
            'families' => $this->cards(),
            'journey' => Content::journey(),
            'trust' => Content::landingTrust(),
        ]);
    }

    public function services(): Response
    {
        return Inertia::render('DueDiligence/Services', [
            'families' => $this->cards(),
            'journey' => Content::journey(),
            'trust' => Content::selectorTrust(),
        ]);
    }

    public function family(string $slug, string $tab = 'overview'): Response|RedirectResponse
    {
        if ($slug === 'enterprise-api') {
            return redirect('/due-diligence/portal-api', 301);
        }

        $family = Catalogue::family($slug);
        abort_if($family === null || ! array_key_exists($tab, self::TABS), 404);

        $skus = Catalogue::skus($slug);

        return Inertia::render('DueDiligence/Family', [
            'family' => $family,
            'skus' => array_map(fn ($s) => $s + ['purchasable' => Catalogue::purchasable($s)], $skus),
            'tab' => $tab,
            'tabs' => collect(self::TABS)->map(fn ($label, $key) => ['key' => $key, 'label' => $label])->values(),
            'journey' => Content::journey(),
            'governance' => Content::governance($family['sla']),
            'content' => [
                'inputs' => Content::inputs($family['subjectType'], $family['name']),
                'process' => Content::process($family['name']),
                'stages' => Content::stageDetails(),
                'safeguards' => Content::safeguards(),
                'included' => Content::included(),
                'notIncluded' => Content::notIncluded(),
                'limitations' => Content::limitations(),
                'reviewTriggers' => Content::reviewTriggers(),
                'releaseControls' => Content::releaseControls(),
                'addons' => Catalogue::addons(),
                'externalCosts' => Catalogue::externalCosts(),
                'faqs' => Content::faqs($family['name']),
                'boundary' => Content::BOUNDARY,
            ],
            'related' => collect(Catalogue::families())->where('slug', '!=', $slug)->take(6)->map(fn ($f) => ['slug' => $f['slug'], 'name' => $f['name'], 'icon' => $f['icon']])->values(),
        ]);
    }

    /** DD-017: server-side price discovery. Requirements arrive as query parameters so every edit recomputes. */
    public function pricing(Request $request): Response
    {
        $slug = (string) $request->query('family', 'company');
        $family = Catalogue::family($slug) ?? Catalogue::family('company');
        $skus = array_values(array_filter(Catalogue::skus($family['slug']), fn ($s) => Catalogue::purchasable($s)));
        abort_if($skus === [], 404, 'This service is quoted by a specialist. Please request a scope.');

        $selected = collect($skus)->firstWhere('code', $request->query('sku'))
            ?? collect($skus)->firstWhere('popular', true)
            ?? $skus[0];

        $req = self::sanitise((array) $request->query('req', []), $family);

        return Inertia::render('DueDiligence/Pricing', [
            'family' => ['slug' => $family['slug'], 'name' => $family['name'], 'icon' => $family['icon'], 'subjectType' => $family['subjectType']],
            'families' => collect(Catalogue::families())->filter(fn ($f) => collect(Catalogue::skus($f['slug']))->contains(fn ($s) => Catalogue::purchasable($s)))->map(fn ($f) => ['value' => $f['slug'], 'label' => $f['name']])->values(),
            'skus' => $skus,
            'selected' => $selected['code'],
            'requirements' => $req,
            'price' => Pricing::quote($selected, $req),
            'options' => Content::options(),
            'journey' => Content::journey(),
        ]);
    }

    public function start(): RedirectResponse
    {
        return redirect('/due-diligence/services');
    }

    /** Validated configurator inputs with defaults. */
    public static function defaults(array $family): array
    {
        return [
            'subject_type' => $family['subjectType'],
            'jurisdiction' => 'South Africa',
            'purpose' => 'Investment decision',
            'expected_use' => 'Internal decision making',
            'entity_type' => $family['subjectType'] === 'individual' ? 'Natural person' : 'Private company',
            'record_age' => 3,
            'complexity' => 'standard',
            'evidence_readiness' => 'medium',
            'sla' => 'standard',
            'related_parties' => 3,
        ];
    }

    public static function sanitise(array $in, array $family): array
    {
        $opts = Content::options();
        $req = self::defaults($family);

        $pick = fn (string $key, array $allowed) => in_array($in[$key] ?? null, $allowed, true) ? $in[$key] : $req[$key];
        $req['subject_type'] = $pick('subject_type', array_column($opts['subjectTypes'], 'value'));
        $req['jurisdiction'] = $pick('jurisdiction', array_column($opts['jurisdictions'], 'value'));
        $req['purpose'] = $pick('purpose', $opts['purposes']);
        $req['expected_use'] = $pick('expected_use', $opts['uses']);
        $req['entity_type'] = $pick('entity_type', $opts['entityTypes']);
        $req['complexity'] = $pick('complexity', array_column($opts['complexity'], 'value'));
        $req['evidence_readiness'] = $pick('evidence_readiness', array_column($opts['readiness'], 'value'));
        $req['sla'] = $pick('sla', array_column($opts['sla'], 'value'));
        $req['record_age'] = isset($in['record_age']) ? max(0, min(100, (int) $in['record_age'])) : $req['record_age'];
        $req['related_parties'] = isset($in['related_parties']) ? max(0, min(200, (int) $in['related_parties'])) : $req['related_parties'];

        return $req;
    }

    private function cards(): array
    {
        return collect(Catalogue::families())->map(fn ($f) => [
            'slug' => $f['slug'], 'name' => $f['name'], 'short' => $f['short'], 'selector' => $f['selector'], 'icon' => $f['icon'],
        ])->all();
    }
}
