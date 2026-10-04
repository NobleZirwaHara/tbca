<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Models\DueDiligence\Batch;
use App\Models\DueDiligence\EnterpriseRequest;
use App\Models\DueDiligence\MonitoringAlert;
use App\Models\DueDiligence\MonitoringSubscription;
use App\Support\DueDiligence\Content;
use App\Support\DueDiligence\Refs;
use App\Support\DueDiligence\Workflow;
use App\Support\Platform\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Enterprise screening request (DD-023) and bulk screening dashboard (DD-049).
 */
class EnterpriseController extends Controller
{
    public const POPULATIONS = ['suppliers' => 'Suppliers', 'companies' => 'Companies', 'directors' => 'Directors & UBOs', 'investors' => 'Investors', 'sponsors' => 'Project Sponsors', 'institutions' => 'Institutions', 'mixed' => 'Mixed Portfolio'];

    public const MODULES = ['company' => 'Company Verification', 'sanctions' => 'Sanctions & PEP Screening', 'media' => 'Adverse Media Screening', 'ubo' => 'Ownership & UBO Mapping', 'financial' => 'Financial Health Check', 'compliance' => 'Compliance Review', 'monitoring' => 'Monitoring Add-on'];

    public const DELIVERY = ['portal' => 'Secure Client Portal', 'upload' => 'Spreadsheet Upload', 'api' => 'API Connection', 'alerts' => 'Alerts & Dashboards'];

    public function request(Request $request): Response
    {
        $draft = EnterpriseRequest::where('user_id', $request->user()->id)->where('status', 'draft')->latest()->first();

        return Inertia::render('DueDiligence/Enterprise/Request', [
            'draft' => $draft?->data,
            'draftReference' => $draft?->reference,
            'submitted' => EnterpriseRequest::where('user_id', $request->user()->id)->where('status', '!=', 'draft')->latest()->get(['reference', 'status', 'submitted_at', 'fee_view']),
            'populations' => self::POPULATIONS,
            'modules' => self::MODULES,
            'delivery' => self::DELIVERY,
            'purposes' => ['Supplier & Contractor Due Diligence', 'Customer / Counterparty Onboarding', 'Investor & Shareholder Screening', 'Third-Party Risk Management', 'Periodic Compliance Screening'],
            'clientTypes' => ['Enterprise (Large / Group)', 'Mid-market Company', 'Financial Institution', 'Public Sector Entity', 'Development Finance Institution'],
            'turnarounds' => ['Standard (7–10 business days)', 'Expedited (3–5 business days)', 'Batch SLA (contracted)'],
            'journey' => Content::journey(),
        ]);
    }

    /** Preliminary fee view: indicative only, a specialist validates scope before quotation. */
    public static function feeView(array $data): array
    {
        $volume = max(1, (int) ($data['volume'] ?? 1));
        $modules = count($data['modules'] ?? []);
        $jurisdictions = 1 + (int) ($data['extra_jurisdictions'] ?? 0);
        $expert = (int) (round((2500 + $volume * 20 * max(1, $modules) / 3 * (1 + 0.15 * ($jurisdictions - 1))) / 100) * 100);
        $platform = (int) (round((1800 + $volume * 32) / 100) * 100);
        $subtotal = $expert + $platform;
        $totals = Money::totals($subtotal, 'eft');

        return ['expert' => $expert, 'platform' => $platform, 'external' => null, 'subtotal' => $subtotal, 'vat' => $totals['vat'], 'handling' => $totals['fees'], 'total' => $totals['total']];
    }

    public function saveRequest(Request $request): RedirectResponse
    {
        $submit = $request->input('intent') === 'submit';
        $req = $submit ? 'required' : 'nullable';
        $data = $request->validate([
            'name' => ['required', 'string', 'max:190'],
            'purpose' => [$req, 'nullable', 'string', 'max:120'],
            'client_type' => [$req, 'nullable', 'string', 'max:120'],
            'population' => [$submit ? 'required' : 'nullable', 'array'],
            'population.*' => [Rule::in(array_keys(self::POPULATIONS))],
            'volume' => [$req, 'nullable', 'integer', 'min:1', 'max:100000'],
            'batch_size' => ['nullable', 'string', 'max:40'],
            'jurisdictions' => ['nullable', 'string', 'max:255'],
            'extra_jurisdictions' => ['nullable', 'integer', 'min:0', 'max:50'],
            'turnaround' => [$req, 'nullable', 'string', 'max:60'],
            'frequency' => ['nullable', Rule::in(['one-time', 'recurring'])],
            'cadence' => ['nullable', Rule::in(['Weekly', 'Monthly', 'Quarterly'])],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'modules' => [$submit ? 'required' : 'nullable', 'array'],
            'modules.*' => [Rule::in(array_keys(self::MODULES))],
            'delivery' => ['nullable', 'array'],
            'delivery.*' => [Rule::in(array_keys(self::DELIVERY))],
            'notes' => ['nullable', 'string', 'max:1000'],
            'screening_list' => [$submit && ! $request->filled('existing_list') ? 'required' : 'nullable', 'file', 'max:25600', 'mimes:csv,xlsx,txt'],
            'register_extract' => ['nullable', 'file', 'max:25600', 'mimes:pdf,docx,xlsx,csv'],
            'memo' => ['nullable', 'file', 'max:25600', 'mimes:pdf,docx'],
            'supporting' => ['nullable', 'file', 'max:25600', 'mimes:pdf,docx,xlsx,csv,jpg,png'],
            'existing_list' => ['nullable', 'string'],
        ], ['screening_list.required' => 'Upload the screening list (CSV/Excel) to submit.']);

        $user = $request->user();
        $model = EnterpriseRequest::where('user_id', $user->id)->where('status', 'draft')->latest()->first()
            ?? new EnterpriseRequest(['reference' => Refs::next('ENT-DD', 'dd_enterprise_requests'), 'user_id' => $user->id, 'status' => 'draft']);

        $payload = collect($data)->except(['screening_list', 'register_extract', 'memo', 'supporting'])->all();
        $files = $model->data['files'] ?? [];
        foreach (['screening_list', 'register_extract', 'memo', 'supporting'] as $f) {
            if ($request->hasFile($f)) {
                $files[$f] = ['name' => $request->file($f)->getClientOriginalName(), 'path' => $request->file($f)->store("dd/enterprise/{$model->reference}", Workflow::DISK)];
            }
        }
        $payload['files'] = $files;

        $model->fill(['data' => $payload, 'fee_view' => self::feeView($payload)]);
        if ($submit) {
            $model->fill(['status' => 'submitted', 'submitted_at' => now()]);
        }
        $model->save();

        return $submit
            ? redirect()->route('due-diligence.enterprise.dashboard')->with('success', "Request {$model->reference} submitted. A specialist will validate scope before any quotation or payment.")->with('reference', $model->reference)
            : back()->with('success', "Draft {$model->reference} saved.");
    }

    public function dashboard(Request $request): Response
    {
        $user = $request->user();
        $subs = MonitoringSubscription::where('user_id', $user->id)->where('status', 'active')->get();
        $alerts = MonitoringAlert::whereIn('subscription_id', $subs->pluck('id'))->where('detected_at', '>=', now()->subDays(30))->get();
        $batches = Batch::where('user_id', $user->id)->latest()->get();
        $subjects = $subs->sum('subjects') + $batches->where('status', 'completed')->sum('valid_rows');
        $allowance = max(1, $subs->sum('alert_allowance') * 15);

        return Inertia::render('DueDiligence/Enterprise/Dashboard', [
            'kpis' => [
                'subjects' => $subjects,
                'alerts' => $alerts->count(),
                'alertsByRisk' => collect(['critical', 'high', 'medium', 'low'])->mapWithKeys(fn ($l) => [$l => $alerts->where('risk_level', $l)->count()]),
                'awaiting' => $alerts->whereIn('status', ['pending_review', 'under_review'])->count(),
                'batches' => $batches->where('created_at', '>=', now()->subDays(30))->count(),
                'batchStates' => collect(['completed', 'processing', 'queued', 'failed'])->mapWithKeys(fn ($s) => [$s => $batches->where('status', $s)->count()]),
                'usage' => $subjects,
                'allowance' => $allowance,
            ],
            'batches' => $batches->take(6)->map(fn ($b) => $b->only('reference', 'file_name', 'status', 'progress', 'rows', 'valid_rows', 'duplicates', 'exceptions') + ['createdAt' => $b->created_at->toIso8601String()]),
            'lastBatch' => $batches->first()?->only('reference', 'file_name', 'rows', 'valid_rows', 'duplicates', 'exceptions', 'status'),
            'exceptions' => [
                'schema' => $batches->sum(fn ($b) => count($b->exceptions ?? [])),
                'duplicates' => $batches->sum('duplicates'),
                'alerts' => $alerts->whereIn('status', ['pending_review', 'under_review'])->count(),
                'qa' => $batches->where('status', 'completed')->count() > 0 ? 2 : 0,
                'unresolved' => $alerts->where('status', 'escalated')->count(),
            ],
            'subjects' => $alerts->sortByDesc('detected_at')->unique('subject')->take(6)->values()->map(fn ($a) => ['subject' => $a->subject, 'lastAlert' => $a->detected_at?->toIso8601String(), 'risk' => $a->risk_level, 'status' => $a->status]),
            'subscriptions' => $subs->map(fn ($s) => $s->only('reference', 'plan_name', 'plan_code', 'billing_cycle', 'status') + ['nextRenewalAt' => $s->next_renewal_at?->toIso8601String()]),
            'requests' => EnterpriseRequest::where('user_id', $user->id)->latest()->get(['reference', 'status', 'submitted_at']),
            'journey' => Content::journey(),
        ]);
    }

    /** Upload a batch: validates the schema immediately and records exceptions. */
    public function upload(Request $request): RedirectResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:51200', 'mimes:csv,txt']], ['file.mimes' => 'Upload a CSV file (export XLSX to CSV first).']);
        $file = $request->file('file');
        $rows = array_map('str_getcsv', array_filter(preg_split('/\r\n|\n|\r/', (string) file_get_contents($file->getRealPath()))));
        $header = array_map(fn ($h) => strtolower(trim((string) $h)), array_shift($rows) ?? []);
        $required = ['name', 'entity_type', 'country'];
        $exceptions = [];

        foreach (array_diff($required, $header) as $missing) {
            $exceptions[] = "Missing required column: {$missing}";
        }
        if (count($rows) > 10000) {
            $exceptions[] = 'Too many rows: maximum 10 000 per batch.';
        }

        $valid = 0;
        $seen = [];
        $dupes = 0;
        if (! array_diff($required, $header)) {
            $idx = array_flip($header);
            foreach ($rows as $i => $row) {
                $name = trim((string) ($row[$idx['name']] ?? ''));
                if ($name === '' || trim((string) ($row[$idx['country']] ?? '')) === '') {
                    if (count($exceptions) < 20) {
                        $exceptions[] = 'Row '.($i + 2).': name and country are required.';
                    }

                    continue;
                }
                $key = strtolower($name);
                if (isset($seen[$key])) {
                    $dupes++;

                    continue;
                }
                $seen[$key] = true;
                $valid++;
            }
        }

        $batch = Batch::create([
            'reference' => Refs::next('B', 'dd_batches', 'reference', 4),
            'user_id' => $request->user()->id,
            'file_name' => $file->getClientOriginalName(),
            'path' => $file->store('dd/batches', Workflow::DISK),
            'rows' => count($rows),
            'valid_rows' => $valid,
            'duplicates' => $dupes,
            'exceptions' => $exceptions,
            'status' => $valid === 0 ? 'failed' : 'queued',
            'progress' => 0,
        ]);

        return back()->with($valid === 0 ? 'error' : 'success', $valid === 0
            ? "Batch {$batch->reference} failed schema validation."
            : "Batch {$batch->reference} queued: {$valid} valid subject(s), {$dupes} duplicate(s), ".count($exceptions).' exception(s).');
    }

    public function template(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->streamDownload(function () {
            echo "name,entity_type,country,registration_number,id_number\n";
            echo "Kanyisa Power Systems (Pty) Ltd,company,South Africa,2018/345678/07,\n";
        }, 'tbca-dd-batch-template.csv', ['Content-Type' => 'text/csv']);
    }

    public function batchFile(Request $request, Batch $batch): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_unless($batch->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        return Storage::disk(Workflow::DISK)->download($batch->path, $batch->file_name);
    }
}
