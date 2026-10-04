<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Models\DueDiligence\Document;
use App\Models\DueDiligence\Quote;
use App\Support\DueDiligence\Catalogue;
use App\Support\DueDiligence\Content;
use App\Support\DueDiligence\Pricing;
use App\Support\DueDiligence\Recommender;
use App\Support\DueDiligence\Refs;
use App\Support\DueDiligence\Workflow;
use App\Support\Platform\Checkout;
use App\Support\Platform\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pre-payment journey (DD-018 to DD-028):
 * inputs -> process -> deliverables -> add-ons -> recommendation -> fee
 * manifest (G4 acceptance) -> consent, privacy and purpose gate (G2/G3)
 * -> engagement review -> secure checkout (G5). No checkout session is
 * created before purpose, consent and external-cost approval are recorded.
 */
class QuoteController extends Controller
{
    public const STEPS = [1 => 'inputs', 2 => 'process', 3 => 'deliverables', 4 => 'add-ons', 5 => 'recommendation', 6 => 'manifest', 7 => 'consent', 8 => 'review', 9 => 'checkout'];

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'family' => ['required', Rule::in(Catalogue::slugs())],
            'sku' => ['required', 'string'],
            'req' => ['nullable', 'array'],
        ]);

        $family = Catalogue::family($data['family']);
        $sku = Catalogue::sku($data['sku']);
        if (! $sku || $sku['family'] !== $family['slug'] || ! Catalogue::purchasable($sku)) {
            throw ValidationException::withMessages(['sku' => 'Select a package that can be ordered online.']);
        }

        $req = PublicController::sanitise($data['req'] ?? [], $family);
        $user = $request->user();

        $quote = Quote::create([
            'reference' => Refs::next('Q-DD', 'dd_quotes'),
            'user_id' => $user->id,
            'family' => $family['slug'],
            'sku_code' => $sku['code'],
            'status' => 'draft',
            'step' => 1,
            'requirements' => $req,
            'inputs' => [
                'subject_type' => $req['subject_type'], 'jurisdiction' => $req['jurisdiction'], 'purpose' => $req['purpose'],
                'expected_use' => $req['expected_use'], 'related_parties' => $req['related_parties'], 'entity_type' => $req['entity_type'],
            ],
            'addons' => in_array($req['sla'], ['priority'], true) ? ['DD-ADD-RUSH'] : [],
            'payer_name' => $user->company ?: $user->name,
        ]);

        return redirect()->route('due-diligence.quotes.step', [$quote, 'inputs'])->with('success', "Quote {$quote->reference} started. Complete the inputs to continue.");
    }

    public function show(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorise($request, $quote);
        if ($quote->status === 'converted' && $quote->caseFile) {
            return redirect()->route('due-diligence.cases.show', $quote->caseFile);
        }

        return redirect()->route('due-diligence.quotes.step', [$quote, self::STEPS[min(9, max(1, $quote->step))]]);
    }

    public function step(Request $request, Quote $quote, string $step): Response|RedirectResponse
    {
        $this->authorise($request, $quote);
        $n = array_search($step, self::STEPS, true);
        abort_if($n === false, 404);

        if ($quote->status === 'converted' && $quote->caseFile) {
            return redirect()->route('due-diligence.cases.show', $quote->caseFile);
        }
        if ($blocked = $this->blocked($quote, $n)) {
            return redirect()->route('due-diligence.quotes.step', [$quote, self::STEPS[$blocked[0]]])->with('error', $blocked[1]);
        }

        $sku = Catalogue::sku($quote->sku_code);
        $family = Catalogue::family($quote->family);
        $addons = $step === 'add-ons' && $request->has('preview')
            ? array_values(array_filter((array) $request->query('addons', []), fn ($c) => Catalogue::addon((string) $c) !== null))
            : ($quote->addons ?? []);
        $price = Pricing::quote($sku, $this->pricingReq($quote), $addons);

        $props = [
            'quote' => $this->quotePayload($quote),
            'family' => ['slug' => $family['slug'], 'name' => $family['name'], 'icon' => $family['icon'], 'subjectType' => $family['subjectType'], 'receive' => $family['receive']],
            'sku' => $sku,
            'price' => $price,
            'step' => $step,
            'steps' => self::STEPS,
            'journey' => Content::journey(),
        ];

        $props += match ($step) {
            'inputs' => [
                'options' => Content::options(),
                'evidence' => Content::evidenceTemplate($quote->inputs['subject_type'] ?? $family['subjectType']),
                'documents' => $quote->documents()->latest()->get(['id', 'original_name', 'category', 'size', 'created_at']),
                'progress' => $this->inputProgress($quote),
            ],
            'process' => ['process' => Content::process($family['name']), 'stages' => Content::stageDetails(), 'safeguards' => Content::safeguards()],
            'deliverables' => [
                'included' => Content::included(), 'notIncluded' => Content::notIncluded(), 'limitations' => Content::limitations(),
                'criteria' => Content::acceptanceCriteria(),
            ],
            'add-ons' => ['addons' => Catalogue::addons(), 'externalCosts' => Catalogue::externalCosts(), 'selectedAddons' => $addons],
            'recommendation' => ['recommendation' => $this->recommendation($quote)],
            'manifest' => [],
            'consent' => ['user' => ['name' => $request->user()->name]],
            'review' => ['included' => Content::included(), 'notIncluded' => Content::notIncluded()],
            'checkout' => [
                'user' => $request->user()->only('name', 'email', 'phone', 'company'),
                'methodTotals' => collect(['card', 'eft', 'wallet'])->mapWithKeys(fn ($m) => [$m => Money::totals($price['subtotal'], $m)]),
                'order' => $quote->order ? $quote->order->only('reference', 'status') : null,
            ],
        };

        $component = [
            'inputs' => 'Inputs', 'process' => 'Process', 'deliverables' => 'Deliverables', 'add-ons' => 'AddOns',
            'recommendation' => 'Recommendation', 'manifest' => 'Manifest', 'consent' => 'Consent', 'review' => 'Review', 'checkout' => 'Checkout',
        ][$step];

        return Inertia::render("DueDiligence/Quote/{$component}", $props);
    }

    public function save(Request $request, Quote $quote, string $step): RedirectResponse
    {
        $this->authorise($request, $quote);
        $n = array_search($step, self::STEPS, true);
        abort_if($n === false || $quote->status === 'converted', 404);
        if ($blocked = $this->blocked($quote, $n)) {
            return redirect()->route('due-diligence.quotes.step', [$quote, self::STEPS[$blocked[0]]])->with('error', $blocked[1]);
        }

        return match ($step) {
            'inputs' => $this->saveInputs($request, $quote),
            'process' => $this->advance($quote, 3),
            'deliverables' => $this->saveDeliverables($request, $quote),
            'add-ons' => $this->saveAddons($request, $quote),
            'recommendation' => $this->saveRecommendation($request, $quote),
            'manifest' => $this->acceptManifest($request, $quote),
            'consent' => $this->saveConsent($request, $quote),
            'review' => $this->saveReview($request, $quote),
            'checkout' => $this->checkout($request, $quote),
        };
    }

    public function upload(Request $request, Quote $quote): RedirectResponse
    {
        $this->authorise($request, $quote);
        abort_if($quote->status === 'converted', 409);
        $keys = array_column(Content::evidenceTemplate($quote->inputs['subject_type'] ?? 'company'), 'key');
        $data = $request->validate([
            'file' => ['required', 'file', 'max:25600', 'mimes:pdf,jpg,jpeg,png,docx,doc,xlsx,csv'],
            'evidence_key' => ['required', Rule::in($keys)],
        ]);

        Workflow::store($data['file'], "quotes/{$quote->reference}", [
            'quote_id' => $quote->id, 'category' => 'intake:'.$data['evidence_key'], 'uploaded_by' => $request->user()->name,
        ]);

        return back()->with('success', 'Document uploaded securely. It will move into your case evidence once the case is activated.');
    }

    public function deleteDocument(Request $request, Quote $quote, Document $document): RedirectResponse
    {
        $this->authorise($request, $quote);
        abort_unless($document->quote_id === $quote->id && $document->case_id === null, 404);
        Workflow::deleteDocument($document);

        return back()->with('success', 'Document removed.');
    }

    /* ------------------------------------------------------------------ */

    private function saveInputs(Request $request, Quote $quote): RedirectResponse
    {
        $opts = Content::options();
        $continue = $request->boolean('continue');
        $req = $continue ? 'required' : 'nullable';

        $data = $request->validate([
            'subject_type' => [$req, Rule::in(array_column($opts['subjectTypes'], 'value'))],
            'subject_name' => [$req, 'string', 'max:190'],
            'jurisdiction' => [$req, Rule::in(array_column($opts['jurisdictions'], 'value'))],
            'purpose' => [$req, Rule::in($opts['purposes'])],
            'expected_use' => [$req, Rule::in($opts['uses'])],
            'related_parties' => ['nullable', 'integer', 'min:0', 'max:200'],
            'registration_number' => ['nullable', 'string', 'max:60'],
            'entity_type' => ['nullable', Rule::in($opts['entityTypes'])],
            'incorporation_date' => ['nullable', 'date', 'before_or_equal:today'],
            'industry' => ['nullable', Rule::in($opts['industries'])],
            'ownership_structure' => ['nullable', 'string', 'max:500'],
            'ubo_count' => ['nullable', 'integer', 'min:0', 'max:100'],
            'accurate' => [$continue ? 'accepted' : 'nullable', 'boolean'],
            'permitted_purpose' => [$continue ? 'accepted' : 'nullable', 'boolean'],
            'privacy_notice' => [$continue ? 'accepted' : 'nullable', 'boolean'],
        ], [
            'accurate.accepted' => 'Confirm that the information supplied is accurate.',
            'permitted_purpose.accepted' => 'Confirm the check is requested for a permitted purpose.',
            'privacy_notice.accepted' => 'Confirm you have read the privacy notice and service limitations.',
        ]);

        $inputs = array_merge($quote->inputs ?? [], array_filter($data, fn ($v) => $v !== null));
        $requirements = array_merge($quote->requirements ?? [], array_intersect_key($inputs, array_flip(['subject_type', 'jurisdiction', 'purpose', 'expected_use', 'related_parties', 'entity_type'])));

        $this->changeScope($quote, ['inputs' => $inputs, 'requirements' => $requirements]);

        return $continue ? $this->advance($quote, 2, 'Inputs saved.') : back()->with('success', 'Progress saved.');
    }

    private function saveDeliverables(Request $request, Quote $quote): RedirectResponse
    {
        $rules = [];
        foreach (array_keys(Content::acceptanceCriteria()) as $key) {
            $rules["criteria.{$key}"] = ['accepted'];
        }
        $request->validate($rules, ['criteria.*.accepted' => 'Confirm each acceptance criterion to continue.']);
        $quote->update(['inputs' => array_merge($quote->inputs ?? [], ['deliverables_accepted_at' => now()->toIso8601String()])]);

        return $this->advance($quote, 4);
    }

    private function saveAddons(Request $request, Quote $quote): RedirectResponse
    {
        $data = $request->validate(['addons' => ['nullable', 'array'], 'addons.*' => [Rule::in(array_column(Catalogue::addons(), 'code'))]]);
        $this->changeScope($quote, ['addons' => array_values(array_unique($data['addons'] ?? []))]);

        return $this->advance($quote, 5, 'Add-ons saved. External costs will be approved separately before any work begins.');
    }

    private function saveRecommendation(Request $request, Quote $quote): RedirectResponse
    {
        $data = $request->validate(['choice' => ['required', Rule::in(['accept', 'keep'])]]);
        if ($data['choice'] === 'accept') {
            $rec = $this->recommendation($quote);
            if ($rec['sku'] && $rec['sku']['code'] !== $quote->sku_code) {
                $this->changeScope($quote, ['sku_code' => $rec['sku']['code']]);
            }
        }

        return $this->advance($quote, 6, 'Recommendation recorded. Review your itemised fee manifest.');
    }

    private function acceptManifest(Request $request, Quote $quote): RedirectResponse
    {
        $data = $request->validate([
            'external_tolerance' => ['required', Rule::in([10000, 25000, 50000])],
            'payer_name' => ['required', 'string', 'max:190'],
            'accepted_by' => ['required', Rule::in(['Authorised Signatory', 'Account Owner', 'Procurement Officer'])],
            'confirm' => ['accepted'],
        ], ['confirm.accepted' => 'Confirm the scope, fees and terms are understood and accepted.']);

        $manifest = Pricing::quote(Catalogue::sku($quote->sku_code), $this->pricingReq($quote), $quote->addons ?? []);
        $scope = strtoupper(substr(hash('sha256', json_encode([$quote->sku_code, $quote->requirements, $quote->addons, $quote->inputs['subject_name'] ?? null])), 0, 12));

        $quote->update([
            'manifest' => $manifest,
            'price_version' => 'PV-'.now()->format('Y-m-d').'-01',
            'scope_hash' => implode('-', str_split($scope, 4)),
            'external_tolerance_zar' => (int) $data['external_tolerance'],
            'payer_name' => $data['payer_name'],
            'accepted_by' => $data['accepted_by'],
            'accepted_at' => now(),
            'valid_until' => now()->addDays(30),
            'status' => $quote->isConsented() ? 'consented' : 'accepted',
        ]);

        return $this->advance($quote, 7, 'Quote accepted. Record purpose and consent next — no checks run until consent is recorded.');
    }

    private function saveConsent(Request $request, Quote $quote): RedirectResponse
    {
        if ($request->boolean('save_exit')) {
            return redirect()->route('due-diligence.cases.index')->with('success', "Quote {$quote->reference} saved. You can resume at any time.");
        }

        $keys = ['lawful_purpose', 'authority', 'privacy_read', 'processing_consent', 'notice_route', 'subject_rights'];
        $request->validate(
            collect($keys)->mapWithKeys(fn ($k) => [$k => ['accepted']])->all() + ['authority_basis' => ['required', Rule::in(['Board mandate', 'Delegated authority', 'Owner / sole proprietor', 'Power of attorney'])]],
            ['*.accepted' => 'This confirmation is required before any check can run.']
        );

        $quote->update([
            'consent' => [
                'purpose' => $quote->inputs['purpose'] ?? null,
                'authority_basis' => $request->input('authority_basis'),
                'notice_version' => 'PN-DD-2026-05',
                'notice_route' => 'Electronic notice via email and secure portal',
                'confirmed' => $keys,
                'by' => $request->user()->name,
                'ip' => $request->ip(),
            ],
            'consented_at' => now(),
            'status' => 'consented',
        ]);

        return $this->advance($quote, 8, 'Purpose and consent recorded.');
    }

    private function saveReview(Request $request, Quote $quote): RedirectResponse
    {
        $request->validate([
            'accept_terms' => ['accepted'],
        ], ['accept_terms.accepted' => 'Confirm you have read and agree to the Terms, Privacy Notice and DPA.']);

        $quote->update([
            'engagement' => ['terms' => 'v2.7', 'privacy' => 'v2.5', 'dpa' => 'v2.3', 'by' => $request->user()->name, 'at' => now()->toIso8601String()],
            'engaged_at' => now(),
            'status' => 'payment_pending',
        ]);

        return $this->advance($quote, 9, 'Engagement accepted. Complete payment to activate your case.');
    }

    private function checkout(Request $request, Quote $quote): RedirectResponse
    {
        $data = $request->validate([
            'organisation' => ['required', 'string', 'max:190'],
            'contact_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:255'],
            'vat_number' => ['nullable', 'string', 'max:30'],
            'po_reference' => ['nullable', 'string', 'max:60'],
            'pay_authority' => ['accepted'],
            'terms' => ['accepted'],
            'external_variance' => ['accepted'],
            'work_after_payment' => ['accepted'],
            'audit_logging' => ['accepted'],
        ], ['*.accepted' => 'This confirmation is required before payment.']);

        $quote->update(['billing' => $data]);
        $manifest = $quote->manifest;

        // Same order ID remains valid on retry; never create a duplicate for an unchanged scope.
        $order = $quote->order;
        if ($order && $order->isPaid()) {
            return redirect()->route('due-diligence.payment.status', $order);
        }
        if (! $order || $order->subtotal_zar !== $manifest['subtotal']) {
            $order = Checkout::createOrder(Pricing::orderLines($manifest, $quote->reference), $request->user(), 'due-diligence', [
                'title' => 'Due Diligence: '.Catalogue::sku($quote->sku_code)['name'],
                'quote' => $quote->reference,
            ]);
            $order->update([
                'meta' => [...$order->meta, 'return_url' => route('due-diligence.payment.status', $order, false)],
                'billing' => ['name' => $data['contact_name'], 'email' => $data['email'], 'phone' => $data['phone'] ?? null, 'company' => $data['organisation'], 'address' => $data['address']],
            ]);
            $quote->update(['order_id' => $order->id]);
        }

        $quote->update(['status' => 'payment_pending']);

        return redirect()->route('checkout.show', $order);
    }

    /* ------------------------------------------------------------------ */

    /** Hard gates: returns [step to send the client to, message] or null. */
    private function blocked(Quote $quote, int $n): ?array
    {
        if ($n > $quote->step) {
            return [$quote->step, 'Complete this step first.'];
        }
        if ($n >= 7 && ! $quote->isAccepted()) {
            return [6, $quote->accepted_at ? 'This quote has expired. Review and accept the refreshed fee manifest.' : 'Accept the fee manifest before consent (G4).'];
        }
        if ($n >= 8 && ! $quote->isConsented()) {
            return [7, 'Purpose and consent must be recorded before the engagement review (G2/G3).'];
        }
        if ($n >= 9 && ! $quote->isEngaged()) {
            return [8, 'Accept the engagement terms before checkout.'];
        }

        return null;
    }

    private function advance(Quote $quote, int $to, ?string $message = null): RedirectResponse
    {
        if ($quote->step < $to) {
            $quote->update(['step' => $to, 'status' => $quote->status === 'draft' && $to >= 2 ? 'scoped' : $quote->status]);
        }

        $redirect = redirect()->route('due-diligence.quotes.step', [$quote, self::STEPS[$to]]);

        return $message ? $redirect->with('success', $message) : $redirect;
    }

    /** G9: any scope change after acceptance voids the acceptance and engagement. */
    private function changeScope(Quote $quote, array $changes): void
    {
        $purposeChanged = isset($changes['inputs']['purpose']) && ($changes['inputs']['purpose'] ?? null) !== ($quote->inputs['purpose'] ?? null);
        $quote->fill($changes);
        $scopeChanged = $quote->isDirty(['sku_code', 'addons', 'requirements']) || $purposeChanged;

        if ($scopeChanged && $quote->accepted_at) {
            $quote->fill(['accepted_at' => null, 'manifest' => null, 'engaged_at' => null, 'status' => 'scoped', 'step' => min($quote->step, 6)]);
            if ($purposeChanged) {
                $quote->fill(['consented_at' => null]);
            }
            session()->flash('error', 'Scope changed: the previous acceptance was withdrawn. Review and accept the updated fee manifest (G9).');
        }
        $quote->save();
    }

    private function pricingReq(Quote $quote): array
    {
        return array_merge($quote->requirements ?? [], array_intersect_key($quote->inputs ?? [], array_flip(['jurisdiction', 'related_parties'])));
    }

    private function recommendation(Quote $quote): array
    {
        return Recommender::recommend($quote->family, array_merge($quote->requirements ?? [], $quote->inputs ?? []));
    }

    private function inputProgress(Quote $quote): array
    {
        $in = $quote->inputs ?? [];
        $sections = Content::inputSections();
        $count = fn (array $keys) => count(array_filter($keys, fn ($k) => filled($in[$k] ?? null)));
        $docs = $quote->documents()->count();
        $expected = count(array_filter(Content::evidenceTemplate($in['subject_type'] ?? 'company'), fn ($e) => $e['required'] ?? true));

        $rows = [
            ['key' => 'subject', 'label' => 'Subject Information', 'done' => $count($sections['subject']), 'total' => count($sections['subject']), 'unit' => 'fields completed'],
            ['key' => 'entity', 'label' => ($in['subject_type'] ?? '') === 'individual' ? 'Identity & Background' : 'Entity & Ownership', 'done' => $count($sections['entity']), 'total' => count($sections['entity']), 'unit' => 'fields completed'],
            ['key' => 'documents', 'label' => 'Document Uploads', 'done' => min($docs, $expected), 'total' => $expected, 'unit' => 'documents uploaded'],
            ['key' => 'declarations', 'label' => 'Declarations & Consents', 'done' => $count($sections['declarations']), 'total' => 3, 'unit' => 'consents completed'],
        ];
        $complete = count(array_filter($rows, fn ($r) => $r['done'] >= $r['total']));

        return ['sections' => $rows, 'complete' => $complete, 'percent' => (int) round(100 * $complete / 4)];
    }

    private function quotePayload(Quote $quote): array
    {
        return [
            'reference' => $quote->reference,
            'status' => $quote->status,
            'step' => $quote->step,
            'inputs' => $quote->inputs ?? [],
            'requirements' => $quote->requirements ?? [],
            'addons' => $quote->addons ?? [],
            'manifest' => $quote->manifest,
            'priceVersion' => $quote->price_version,
            'scopeHash' => $quote->scope_hash,
            'externalTolerance' => $quote->external_tolerance_zar,
            'payerName' => $quote->payer_name,
            'acceptedBy' => $quote->accepted_by,
            'acceptedAt' => $quote->accepted_at?->toIso8601String(),
            'validUntil' => $quote->valid_until?->toIso8601String(),
            'createdAt' => $quote->created_at->toIso8601String(),
            'consent' => $quote->consent,
            'consentedAt' => $quote->consented_at?->toIso8601String(),
            'engagedAt' => $quote->engaged_at?->toIso8601String(),
            'billing' => $quote->billing,
            'caseState' => $quote->engaged_at ? 'CS2 Order Draft' : 'CS1 Prospect',
        ];
    }

    private function authorise(Request $request, Quote $quote): void
    {
        $user = $request->user();
        abort_unless($user && ($quote->user_id === $user->id || $user->isAdmin()), 403);
    }
}
