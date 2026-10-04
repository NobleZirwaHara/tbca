<?php

namespace App\Http\Controllers\Portal;

use App\Models\Order;
use App\Models\Portal\Deliverable;
use App\Models\Portal\Document;
use App\Models\Portal\PortalCase;
use App\Models\Portal\Project;
use App\Models\Portal\ShareLink;
use App\Models\Portal\Ticket;
use App\Models\User;
use App\Support\Portal\Portal;
use App\Support\Portal\Ui;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Response;

/** CP-SCR-039/040/041 document vault and CP-SCR-129 portability exports. Files live on the private local disk under portal/. */
class DocumentController extends PortalController
{
    public const MIMES = 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,zip';

    public static function storeUpload(UploadedFile $file, User $user, array $attrs = []): Document
    {
        $path = $file->store('portal/'.$user->id.'/vault', 'local');

        return Document::create(array_merge([
            'user_id' => $user->id, 'organisation_id' => Portal::account($user)->organisation_id, 'name' => $file->getClientOriginalName(),
            'extension' => strtolower($file->getClientOriginalExtension()), 'mime' => $file->getClientMimeType(), 'size_bytes' => $file->getSize(),
            'path' => $path, 'checksum' => hash_file('sha256', Storage::disk('local')->path($path)), 'uploaded_by' => $user->name,
            'meta' => ['versions' => [['version' => 1, 'date' => now()->toDateString(), 'by' => $user->name, 'note' => 'Initial upload']]],
        ], $attrs));
    }

    private function docs()
    {
        return Document::with('project')->where('user_id', $this->user()->id);
    }

    private function size(int $bytes): string
    {
        return $bytes >= 1048576 ? number_format($bytes / 1048576, 1).' MB' : number_format($bytes / 1024).' KB';
    }

    public function index(Request $request): Response
    {
        $folder = $request->query('folder');
        $bin = $request->query('tab') === 'bin';
        $q = $this->docs()->where('status', $bin ? 'deleted' : 'active');
        if (! $bin && ! $request->filled('q')) {
            $folder ? $q->where('parent_id', $folder) : $q->whereNull('parent_id');
        }
        $all = $q->orderByDesc('is_folder')->latest()->get();
        $rows = Ui::filter($all, $request, ['name', 'doc_type'], ['project' => fn ($d, $v) => $d->project?->reference === $v, 'type' => 'doc_type']);
        $page = Ui::page($rows, $request, 15);
        $files = $this->docs()->where('is_folder', false)->where('status', 'active')->get();
        $used = (int) $files->sum('size_bytes');
        $quota = 50 * 1073741824;
        $current = $folder ? Document::find($folder) : null;
        $folders = $this->docs()->where('is_folder', true)->where('status', 'active')->get();
        $projects = Project::where('user_id', $this->user()->id)->get();

        return $this->register([
            'title' => 'Document Vault', 'icon' => 'folder', 'subtitle' => $current ? 'Folder: '.$current->name : 'All your documents, encrypted at rest and in transit, with version history and access logging.',
            'crumbs' => array_values(array_filter([['label' => 'Document Vault', 'href' => '/portal/documents'], $current ? ['label' => $current->name] : null])),
            'actions' => [Ui::modal('New Folder', 'folder'), Ui::action('Upload Documents', '/portal/documents/upload', 'get', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Documents', $files->count(), 'Across all projects', 'neutral', 'folder'), Ui::kpi('Recently Added', $files->where('created_at', '>=', now()->subDays(7))->count(), 'In the last 7 days', 'good', 'upload'), Ui::kpi('Secure Storage', '100%', 'Encrypted at rest & in transit', 'good', 'lock'), Ui::kpi('Last Accessed', optional($files->sortByDesc('last_accessed_at')->first())->name ?? '—', null, 'neutral', 'history'), Ui::kpi('Storage Used', $this->size($used), Ui::pct($used, $quota).' of 50 GB', 'neutral', 'database')],
            'tabs' => Ui::tabs(['all' => 'Documents', 'bin' => ['Recycle Bin', $this->docs()->where('status', 'deleted')->count()]]), 'tab' => $bin ? 'bin' : 'all', 'search' => 'Search documents…',
            'filters' => [Ui::selectFilter('project', 'Project', $projects->mapWithKeys(fn ($p) => [$p->reference => $p->name])->all()), Ui::selectFilter('type', 'Document Type', $files->pluck('doc_type')->filter()->unique()->values()->all())],
            'main' => [Ui::table(null, ['Name', 'Project / Service', 'Type', 'Added On', 'Added By', 'Size', 'Tags', ''], $page['items']->map(fn ($d) => [
                $d->is_folder ? Ui::stack('📁 '.$d->name, $this->docs()->where('parent_id', $d->id)->count().' items', '/portal/documents?folder='.$d->id) : Ui::stack($d->name, strtoupper((string) $d->extension).' · v'.$d->version, '/portal/documents/'.$d->id),
                $d->project?->name ?? '—', $d->is_folder ? 'Folder' : $d->doc_type, $d->created_at->format('d M Y'), $d->uploaded_by, $d->is_folder ? '—' : $this->size($d->size_bytes), Ui::chips($d->tags ?? []),
                Ui::actions($bin ? [Ui::action('Restore', '/portal/documents/'.$d->id.'/restore', 'post')] : ($d->is_folder ? [Ui::action('Open', '/portal/documents?folder='.$d->id)] : [Ui::action('Download', '/portal/documents/'.$d->id.'/download', 'get', ['download' => true]), Ui::action('View', '/portal/documents/'.$d->id)])),
            ])->all(), ['pagination' => $page['pagination'], 'empty' => 'This folder is empty.'])],
            'side' => [
                Ui::gauge('Storage Overview', round($used / $quota * 100, 1), $this->size($used).' of 50 GB'),
                Ui::list('Folders', $folders->map(fn ($f) => Ui::item($f->name, null, null, null, '/portal/documents?folder='.$f->id))->all()),
                Ui::quick('Quick Actions', [Ui::action('Upload Documents', '/portal/documents/upload'), Ui::modal('New Folder', 'folder'), Ui::action('Evidence Requests', '/portal/evidence'), Ui::action('Recycle Bin', '/portal/documents?tab=bin'), Ui::action('Export Everything', '/portal/exports')]),
            ],
            'forms' => ['folder' => Ui::form('New Folder', '/portal/documents/folders', [Ui::field('name', 'Folder name', 'text', ['required' => true]), Ui::field('project', 'Project (optional)', 'select', ['options' => $projects->map(fn ($p) => ['value' => $p->reference, 'label' => $p->name])->values()->all()]), Ui::field('parent_id', 'parent', 'hidden', ['value' => $folder])], 'Create Folder')],
        ]);
    }

    public function upload(Request $request): Response
    {
        $projects = Project::where('user_id', $this->user()->id)->get();
        $folders = $this->docs()->where('is_folder', true)->where('status', 'active')->get();

        return $this->register([
            'title' => 'Document Upload', 'icon' => 'upload', 'crumbs' => [['label' => 'Document Vault', 'href' => '/portal/documents'], ['label' => 'Upload']],
            'subtitle' => 'Upload documents securely to your vault. Files are encrypted and linked to the project you choose.',
            'actions' => [Ui::action('Back to Document Vault', '/portal/documents')],
            'main' => [['kind' => 'form', 'title' => 'Upload Your Documents', 'form' => Ui::form('Upload', '/portal/documents', [
                Ui::field('project', '1. Select Project / Service (optional)', 'select', ['value' => $request->query('project'), 'options' => $projects->map(fn ($p) => ['value' => $p->reference, 'label' => $p->name.' ('.$p->reference.')'])->values()->all()]),
                Ui::field('doc_type', '2. Document Type', 'select', ['required' => true, 'options' => Ui::options(['Company Profile', 'Financial', 'Legal', 'Compliance', 'Tax', 'Technical', 'Report', 'Image', 'Other'])]),
                Ui::field('file', '3. Choose file (max 25 MB · pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, png, zip)', 'file', ['required' => true, 'span' => 2]),
                Ui::field('folder', 'Folder (optional)', 'select', ['options' => $folders->map(fn ($f) => ['value' => (string) $f->id, 'label' => $f->name])->values()->all()]),
                Ui::field('title', 'Document title (optional)', 'text'), Ui::field('tags', 'Tags (comma separated)', 'text'),
                Ui::field('confidentiality', 'Confidentiality', 'select', ['value' => 'Confidential', 'options' => Ui::options(['Confidential', 'Internal', 'Restricted'])]),
                Ui::field('description', '4. Description / Notes (optional)', 'textarea'),
            ], 'Upload Document')]],
            'side' => [
                Ui::checklist('Accepted File Types', [Ui::check('PDF'), Ui::check('Word (.doc, .docx)'), Ui::check('Excel (.xls, .xlsx)'), Ui::check('PowerPoint (.ppt, .pptx)'), Ui::check('Images (.jpg, .jpeg, .png)'), Ui::check('Archives (.zip)')]),
                Ui::info('Important Notes', "Make sure documents are clear and readable.\nAvoid password-protected files.\nDo not upload sensitive personal information unless it is required.\nAll uploads are encrypted and access is logged.", 'info'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $d = $request->validate(['file' => 'required|file|max:25600|mimes:'.self::MIMES, 'project' => 'nullable|string', 'doc_type' => 'required|string|max:60', 'folder' => 'nullable|integer', 'title' => 'nullable|string|max:160', 'tags' => 'nullable|string|max:200', 'confidentiality' => 'nullable|string|max:40', 'description' => 'nullable|string|max:2000']);
        $project = ! empty($d['project']) ? Project::where('user_id', $this->user()->id)->where('reference', $d['project'])->first() : null;
        $folder = ! empty($d['folder']) ? $this->docs()->where('is_folder', true)->find($d['folder']) : null;
        $doc = self::storeUpload($request->file('file'), $this->user(), array_filter([
            'project_id' => $project?->id, 'parent_id' => $folder?->id, 'doc_type' => $d['doc_type'], 'description' => $d['description'] ?? null,
            'confidentiality' => $d['confidentiality'] ?? 'Confidential', 'tags' => ! empty($d['tags']) ? array_values(array_filter(array_map('trim', explode(',', $d['tags'])))) : null,
        ]) + (! empty($d['title']) ? ['name' => $d['title'].'.'.strtolower($request->file('file')->getClientOriginalExtension())] : []));

        return redirect('/portal/documents/'.$doc->id)->with('success', 'Document uploaded securely.');
    }

    public function folder(Request $request): RedirectResponse
    {
        $d = $request->validate(['name' => 'required|string|max:120', 'project' => 'nullable|string', 'parent_id' => 'nullable|integer']);
        $project = ! empty($d['project']) ? Project::where('user_id', $this->user()->id)->where('reference', $d['project'])->first() : null;
        Document::create(['user_id' => $this->user()->id, 'organisation_id' => $this->account()->organisation_id, 'project_id' => $project?->id, 'parent_id' => $d['parent_id'] ?? null, 'is_folder' => true, 'name' => $d['name'], 'doc_type' => 'Folder', 'uploaded_by' => $this->user()->name]);

        return back()->with('success', 'Folder created.');
    }

    public function show(Document $document): Response
    {
        $this->ownOrFail($document);
        abort_if($document->is_folder, 404);
        $document->load('project');
        $links = ShareLink::where('target_type', 'document')->where('target_id', $document->id)->latest()->get();
        $expiry = $document->created_at->copy()->addYears($document->retention_years);

        return $this->register([
            'title' => $document->name, 'icon' => 'file-text', 'code' => 'v'.$document->version, 'crumbs' => [['label' => 'Document Vault', 'href' => '/portal/documents'], ['label' => $document->name]],
            'subtitle' => strtoupper((string) $document->extension).' Document · '.$this->size($document->size_bytes).' · Encrypted · Version '.$document->version.' (Latest)',
            'actions' => [Ui::action($document->starred ? 'Remove from Favourites' : 'Add to Favourites', '/portal/documents/'.$document->id.'/star', 'post'), Ui::modal('Share Secure Link', 'share'), Ui::action('Download', '/portal/documents/'.$document->id.'/download', 'get', ['variant' => 'gold', 'download' => true])],
            'main' => [
                Ui::row([
                    Ui::kv('Document Information', [['Document Title', $document->name], ['Document Type', $document->doc_type], ['Project / Service', $document->project?->name ?? '—'], ['Uploaded By', $document->uploaded_by], ['Uploaded On', $document->created_at->format('d M Y, H:i')], ['Version', $document->version.' (Latest)'], ['Status', Ui::pill($document->status)]]),
                    Ui::kv('File', [['File Type', $document->mime], ['File Size', $this->size($document->size_bytes)], ['Pages', (string) ($document->meta['pages'] ?? '—')], ['Checksum (SHA-256)', substr((string) $document->checksum, 0, 24).'…'], ['Tags', Ui::chips($document->tags ?? [])]]),
                ]),
                ['kind' => 'form', 'title' => 'Description / Notes', 'form' => Ui::form('Edit', '/portal/documents/'.$document->id, [Ui::field('description', 'Description', 'textarea', ['value' => $document->description]), Ui::field('tags', 'Tags (comma separated)', 'text', ['value' => implode(', ', $document->tags ?? [])])], 'Save Notes', 'put')],
                Ui::table('Version History', ['Version', 'Date', 'By', 'Note'], collect($document->meta['versions'] ?? [])->map(fn ($v) => [$v['version'], Ui::date($v['date']), $v['by'], $v['note']])->all()),
                Ui::table('Secure Links', ['Recipient', 'Status', 'Expires', 'Accesses'], $links->map(fn ($l) => [$l->recipient, Ui::pill($l->expires_at?->isPast() && $l->status === 'pending' ? 'expired' : $l->status), Ui::date($l->expires_at), $l->access_count])->all(), ['empty' => 'No secure links yet.']),
            ],
            'side' => [
                Ui::kv('Access Summary', [['Total Accesses', (string) $document->access_count], ['Last Accessed', $document->last_accessed_at?->diffForHumans() ?? 'Never'], ['Last Viewed By', $document->last_accessed_by ?? '—']]),
                Ui::kv('Compliance & Retention', [['Retention Policy', $document->retention_years.' Years (Corporate Documents)'], ['Retention Expiry', $expiry->format('d M Y')], ['Legal Hold', $document->legal_hold ? 'Yes' : 'No'], ['Confidentiality', $document->confidentiality]]),
                Ui::quick('Quick Actions', [Ui::action('Download Document', '/portal/documents/'.$document->id.'/download', 'get', ['download' => true]), Ui::modal('Share Secure Link', 'share'), Ui::action('Request New Version', '/portal/documents/upload'), Ui::action('Delete Document', '/portal/documents/'.$document->id, 'delete', ['variant' => 'danger', 'confirm' => 'Move this document to the recycle bin?'])]),
            ],
            'forms' => ['share' => Ui::form('Share Secure Link', '/portal/documents/'.$document->id.'/share', [Ui::field('recipient', 'Recipient email', 'email', ['required' => true]), Ui::field('days', 'Expires after (days)', 'select', ['value' => '7', 'options' => Ui::options(['1' => '1 day', '7' => '7 days', '30' => '30 days'])])], 'Create Link', 'post', 'The recipient confirms receipt through the secure link; access is logged and you can revoke it at any time.')],
        ]);
    }

    public function download(Document $document)
    {
        $this->ownOrFail($document);
        abort_if($document->is_folder || ! $document->path || ! Storage::disk('local')->exists($document->path), 404);
        $document->increment('access_count');
        $document->update(['last_accessed_at' => now(), 'last_accessed_by' => $this->user()->name]);

        return Storage::disk('local')->download($document->path, $document->name);
    }

    public function share(Request $request, Document $document): RedirectResponse
    {
        $this->ownOrFail($document);
        $d = $request->validate(['recipient' => 'required|email', 'days' => 'required|integer|min:1|max:30']);
        $link = ShareLink::create(['user_id' => $this->user()->id, 'token' => Str::random(40), 'target_type' => 'document', 'target_id' => $document->id, 'label' => $document->name, 'recipient' => $d['recipient'], 'status' => 'pending', 'expires_at' => now()->addDays((int) $d['days'])]);

        return back()->with('success', 'Secure link created: '.url('/portal/s/'.$link->token));
    }

    public function star(Document $document): RedirectResponse
    {
        $this->ownOrFail($document);
        $document->update(['starred' => ! $document->starred]);

        return back();
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $this->ownOrFail($document);
        $d = $request->validate(['description' => 'nullable|string|max:2000', 'tags' => 'nullable|string|max:200']);
        $document->update(['description' => $d['description'] ?? null, 'tags' => array_values(array_filter(array_map('trim', explode(',', (string) ($d['tags'] ?? '')))))]);

        return back()->with('success', 'Document notes saved.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $this->ownOrFail($document);
        abort_if($document->legal_hold, 422, 'This document is under legal hold and cannot be deleted.');
        $document->update(['status' => 'deleted']);

        return redirect('/portal/documents')->with('success', 'Document moved to the recycle bin.');
    }

    public function restore(Document $document): RedirectResponse
    {
        $this->ownOrFail($document);
        $document->update(['status' => 'active']);

        return back()->with('success', 'Document restored.');
    }

    public function exports(): Response
    {
        $cases = PortalCase::where('user_id', $this->user()->id)->where('kind', 'export')->latest()->get();

        return $this->register([
            'title' => 'Deliverable Portability and Full Export', 'icon' => 'archive', 'code' => 'CP-SCR-129', 'subtitle' => 'Export your deliverables, records and data in a complete, portable and secure format — at any time, including after exit.',
            'actions' => [Ui::modal('New Export Request', 'export', ['variant' => 'gold'])],
            'kpis' => [Ui::kpi('Total Exports', $cases->count(), 'All formats', 'neutral', 'archive'), Ui::kpi('Successful Exports', $cases->where('status', 'completed')->count(), Ui::pct($cases->where('status', 'completed')->count(), max(1, $cases->count())).' success rate', 'good', 'badge-check'), Ui::kpi('In Progress', $cases->where('status', 'in_progress')->count(), null, 'info', 'history'), Ui::kpi('Failed Exports', $cases->where('status', 'failed')->count(), null, 'bad', 'alert-triangle'), Ui::kpi('Last Export', $cases->first()?->created_at->format('d M Y') ?? '—', $cases->first()?->created_at->format('H:i'), 'neutral', 'calendar')],
            'main' => [Ui::table('Export Requests', ['Export ID', 'Type', 'Format', 'Scope', 'Requested By', 'Requested On', 'Status', 'Size', ''], $cases->map(fn ($c) => [Ui::ref($c->reference), ucfirst($c->payload['type'] ?? ''), strtoupper($c->payload['format'] ?? ''), $c->payload['scope'] ?? '', $this->user()->name, $c->created_at->format('d M Y, H:i'), Ui::pill($c->status), $c->payload['size'] ?? '—', Ui::actions([$c->status === 'completed' && ! empty($c->payload['path']) ? Ui::action('Download', '/portal/exports/'.$c->id.'/download', 'get', ['download' => true, 'variant' => 'gold']) : null])])->all())],
            'side' => [Ui::checklist('Supported Formats', [Ui::check('JSON (JavaScript Object Notation)'), Ui::check('CSV (Comma Separated Values)')]), Ui::info('Portability', 'Exports are generated from your live records and stored privately for 30 days. Exit never removes your right to export.', 'info')],
            'forms' => ['export' => Ui::form('New Export Request', '/portal/exports', [
                Ui::field('type', 'Export type', 'select', ['required' => true, 'options' => Ui::options(['deliverables' => 'Deliverables register', 'records' => 'All records (projects, tasks, tickets, documents)', 'financial' => 'Financial data (orders & payments)'])]),
                Ui::field('format', 'Format', 'select', ['required' => true, 'options' => Ui::options(['json' => 'JSON', 'csv' => 'CSV'])]),
            ], 'Generate Export')],
        ]);
    }

    public function createExport(Request $request): RedirectResponse
    {
        $d = $request->validate(['type' => 'required|in:deliverables,records,financial', 'format' => 'required|in:json,csv']);
        $uid = $this->user()->id;
        $rows = match ($d['type']) {
            'deliverables' => Deliverable::where('user_id', $uid)->get(['reference', 'title', 'type', 'version', 'qa_state', 'release_state', 'acceptance_state', 'released_at'])->toArray(),
            'financial' => Order::where('user_id', $uid)->get(['reference', 'section', 'status', 'subtotal_zar', 'vat_zar', 'fees_zar', 'total_zar', 'paid_at', 'created_at'])->toArray(),
            default => array_merge(
                Project::where('user_id', $uid)->get(['reference', 'name', 'status', 'progress', 'due_on'])->map(fn ($p) => ['record' => 'project'] + $p->toArray())->all(),
                Ticket::where('user_id', $uid)->get(['reference', 'subject', 'status', 'priority'])->map(fn ($t) => ['record' => 'ticket'] + $t->toArray())->all(),
                Document::where('user_id', $uid)->where('is_folder', false)->get(['name', 'doc_type', 'size_bytes', 'created_at'])->map(fn ($x) => ['record' => 'document'] + $x->toArray())->all(),
            ),
        };
        if ($d['format'] === 'json') {
            $content = json_encode(['exported_at' => now()->toIso8601String(), 'client_id' => $this->user()->client_id, 'type' => $d['type'], 'records' => $rows], JSON_PRETTY_PRINT);
        } else {
            $fh = fopen('php://temp', 'r+');
            $keys = collect($rows)->flatMap(fn ($r) => array_keys($r))->unique()->values()->all();
            fputcsv($fh, $keys);
            foreach ($rows as $r) {
                fputcsv($fh, array_map(fn ($k) => is_array($r[$k] ?? null) ? json_encode($r[$k]) : ($r[$k] ?? ''), $keys));
            }
            rewind($fh);
            $content = stream_get_contents($fh);
        }
        $ref = 'EXP-'.now()->format('Y').'-'.str_pad((string) (PortalCase::where('kind', 'export')->count() + 42), 3, '0', STR_PAD_LEFT);
        $path = 'portal/'.$uid.'/exports/'.$ref.'.'.$d['format'];
        Storage::disk('local')->put($path, $content);
        PortalCase::create(['user_id' => $uid, 'kind' => 'export', 'reference' => $ref, 'title' => ucfirst($d['type']), 'status' => 'completed', 'payload' => $d + ['scope' => ucfirst($d['type']), 'path' => $path, 'size' => $this->size(strlen($content))], 'submitted_at' => now(), 'step' => 99]);

        return back()->with('success', "Export {$ref} is ready to download.");
    }

    public function downloadExport(PortalCase $case)
    {
        $this->ownOrFail($case);
        abort_unless($case->kind === 'export' && ! empty($case->payload['path']) && Storage::disk('local')->exists($case->payload['path']), 404);

        return Storage::disk('local')->download($case->payload['path'], basename($case->payload['path']));
    }
}
