<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\DealRoom\Concerns\LoadsRoom;
use App\Models\DealRoom\Document;
use App\Models\DealRoom\Folder;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\StageData;
use App\Support\DealRoom\Usage;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Secure data room: role-filtered folders, NDA gate, private-disk uploads
 * (storage/app/private/vdr/{room}), AI intake classification and review /
 * release queue, permission-checked watermarked downloads and an access log.
 */
class DataRoomController extends Controller
{
    use LoadsRoom;

    protected const CATEGORIES = [
        'Financial' => ['financ', 'projection', 'budget', 'account', 'audit', 'tax', 'bank', 'model', 'xlsx'],
        'Legal & Corporate' => ['agreement', 'resolution', 'register', 'contract', 'licence', 'license', 'corporate', 'moi', 'legal'],
        'Operational & Commercial' => ['memo', 'teaser', 'customer', 'operation', 'commercial', 'pitch', 'plan'],
        'Governance & Compliance' => ['governance', 'policy', 'compliance', 'environment', 'esg', 'board'],
    ];

    public function index(Request $request, Room $room): Response
    {
        $role = $this->enter($request, $room);
        $user = $request->user();
        $party = Access::party($room, $user);
        $ndaRequired = ($room->security['nda_gate'] ?? true) && ! Access::isInternal($role) && ! $party?->nda_accepted_at;

        $folders = StageData::folders($room, $role);
        $folderId = (int) $request->query('folder', $folders[0]['id'] ?? 0);
        $visibleIds = collect($folders)->pluck('id');
        abort_if($folderId && ! $visibleIds->contains($folderId), 403);

        $docs = $ndaRequired ? collect() : $room->documents()->with('folder')->where('folder_id', $folderId)
            ->when(! Access::isInternal($role), fn ($q) => $q->where('review_status', 'released'))
            ->when($request->query('q'), fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest('id')->get();

        return Inertia::render('DealRoom/Room/DataRoom', [
            ...$this->shared($request, $room),
            'folders' => $folders,
            'folderId' => $folderId,
            'documents' => $docs->map(fn ($d) => StageData::presentDocument($d))->values(),
            'ndaRequired' => $ndaRequired,
            'permissions' => Access::matrix()[$role] ?? [],
            'watermark' => Access::watermark($user),
            'security' => $room->security,
            'filters' => ['q' => $request->query('q', '')],
        ]);
    }

    public function acceptNda(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'You must accept the NDA to enter the data room.']);
        $party = Access::party($room, $request->user());
        abort_unless($party, 403);
        $party->update(['nda_accepted_at' => now()]);
        $room->accessLogs()->create(['user_id' => $request->user()->id, 'action' => 'nda_accept', 'ip' => $request->ip()]);
        Audit::log($room, 'party.nda_accepted', "{$party->name} accepted the NDA");
        Workflow::attempt($room->fresh(), '4');

        return back()->with('success', 'NDA accepted. Access is now granted under your role permissions.');
    }

    public function upload(Request $request, Room $room): RedirectResponse
    {
        $role = $this->enter($request, $room);
        abort_unless(Access::can($room, $request->user(), 'upload'), 403, 'Your role cannot upload documents.');
        abort_if($room->isPaused() && ! Access::manages($room, $request->user()), 423);
        $data = $request->validate([
            'folder_id' => ['required', 'integer'],
            'files' => ['required', 'array', 'max:10'],
            'files.*' => ['file', 'max:51200', 'mimes:pdf,doc,docx,xls,xlsx,csv,ppt,pptx,txt,png,jpg,jpeg,zip'],
        ]);
        $folder = $room->folders()->findOrFail($data['folder_id']);
        abort_unless(Access::folderVisible($folder, $role), 403);

        $flagged = 0;
        foreach ($request->file('files') as $file) {
            $path = $file->storeAs("vdr/{$room->id}", Str::random(40).'.'.strtolower($file->getClientOriginalExtension() ?: 'bin'), 'local');
            $name = $file->getClientOriginalName();
            [$category, $confidence] = $this->classify($name);
            $existing = $room->documents()->where('folder_id', $folder->id)->where('name', $name)->max('version');
            $pages = max(1, (int) ceil($file->getSize() / 60000));
            $issue = $this->detectIssue($name);
            $flagged += $issue ? 1 : 0;

            $doc = $room->documents()->create([
                'folder_id' => $folder->id, 'uploaded_by' => $request->user()->id, 'name' => $name, 'path' => $path,
                'size' => $file->getSize(), 'mime' => $file->getMimeType(), 'version' => ($existing ?? 0) + 1,
                'sha256' => hash_file('sha256', $file->getRealPath()), 'category' => $category, 'confidence' => $confidence,
                'review_status' => $issue ? 'flagged' : 'ready', 'flag_issue' => $issue[0] ?? null, 'flag_severity' => $issue[1] ?? null, 'pages' => $pages,
            ]);
            $room->accessLogs()->create(['user_id' => $request->user()->id, 'document_id' => $doc->id, 'action' => 'upload', 'ip' => $request->ip()]);
            Usage::increment($room, 'ocr_pages', $pages);
        }
        Audit::log($room, 'document.uploaded', count($request->file('files'))." document(s) uploaded to {$folder->name}".($flagged ? ", {$flagged} flagged by AI intake" : ''));

        return back()->with('success', count($request->file('files')).' document(s) uploaded and queued for AI intake review.');
    }

    /** Light deterministic classifier standing in for the AI intake agent. */
    protected function classify(string $name): array
    {
        $n = strtolower($name);
        foreach (self::CATEGORIES as $cat => $words) {
            foreach ($words as $w) {
                if (str_contains($n, $w)) {
                    return [$cat, 90 + (crc32($n) % 9)];
                }
            }
        }

        return ['Other', 70 + (crc32($n) % 15)];
    }

    protected function detectIssue(string $name): ?array
    {
        $n = strtolower($name);

        return match (true) {
            str_contains($n, 'draft') => ['Draft document — confirm final version and annexures', 'High'],
            str_contains($n, 'unsigned') => ['Signature page missing', 'Medium'],
            (bool) preg_match('/20(1\d|2[0-3])/', $n) => ['Document may be expired — check validity date', 'Low'],
            default => null,
        };
    }

    public function review(Request $request, Room $room, Document $document): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless($document->room_id === $room->id, 404);
        abort_unless(Access::can($room, $request->user(), 'approve_disclosure'), 403);
        $data = $request->validate(['action' => ['required', Rule::in(['approve', 'flag', 'resolve', 'release', 'approve_all'])], 'issue' => ['nullable', 'string', 'max:160']]);

        if ($data['action'] === 'approve_all') {
            $n = $room->documents()->where('review_status', 'ready')->update(['review_status' => 'approved']);
            Audit::log($room, 'document.approved', "{$n} ready documents approved after human review");

            return back()->with('success', "{$n} documents approved.");
        }

        $status = match ($data['action']) {
            'approve' => $document->review_status === 'flagged' ? abort(422, 'Resolve the flag before approving.') : 'approved',
            'flag' => 'flagged',
            'resolve' => 'ready',
            'release' => in_array($document->review_status, ['approved', 'released'], true) ? 'released' : abort(422, 'Only approved documents can be released.'),
        };
        $document->update([
            'review_status' => $status,
            'flag_issue' => $data['action'] === 'flag' ? ($data['issue'] ?? 'Flagged by reviewer') : ($data['action'] === 'resolve' ? null : $document->flag_issue),
            'flag_severity' => $data['action'] === 'flag' ? 'Medium' : ($data['action'] === 'resolve' ? null : $document->flag_severity),
        ]);
        Audit::log($room, 'document.'.$data['action'], "{$document->name}: {$status}");

        return back()->with('success', "{$document->name} marked {$status}.");
    }

    public function download(Request $request, Room $room, Document $document): StreamedResponse|RedirectResponse
    {
        $role = $this->enter($request, $room);
        abort_unless($document->room_id === $room->id, 404);
        $user = $request->user();
        $folder = $document->folder;
        $party = Access::party($room, $user);
        $allowed = Access::folderVisible($folder, $role)
            && (Access::isInternal($role) || $document->review_status === 'released')
            && (Access::isInternal($role) || ! ($room->security['nda_gate'] ?? true) || $party?->nda_accepted_at)
            && (Access::isInternal($role) || ! ($room->security['download_restricted'] ?? true) || (Access::matrix()[$role]['download'] ?? 'no') === 'yes');

        if (! $allowed || ! $document->path || ! Storage::disk('local')->exists($document->path)) {
            $room->accessLogs()->create(['user_id' => $user->id, 'document_id' => $document->id, 'action' => 'denied', 'ip' => $request->ip()]);

            return back()->with('error', $document->path ? 'Download restricted by your role and the room disclosure policy (view-only).' : 'This document is a register entry without a stored file.');
        }

        $mark = Access::watermark($user);
        $room->accessLogs()->create(['user_id' => $user->id, 'document_id' => $document->id, 'action' => 'download', 'watermark' => $mark, 'ip' => $request->ip()]);
        Usage::increment($room, 'exports');

        return Storage::disk('local')->download($document->path, $document->name, ['X-Watermark' => $mark, 'Cache-Control' => 'no-store']);
    }

    /** Record a view (used by the viewer panel) so activity analytics stay accurate. */
    public function view(Request $request, Room $room, Document $document): RedirectResponse
    {
        $role = $this->enter($request, $room);
        abort_unless($document->room_id === $room->id && Access::folderVisible($document->folder, $role), 403);
        $room->accessLogs()->create(['user_id' => $request->user()->id, 'document_id' => $document->id, 'action' => 'view', 'watermark' => Access::watermark($request->user()), 'ip' => $request->ip()]);

        return back();
    }

    public function storeFolder(Request $request, Room $room): RedirectResponse
    {
        $this->enter($request, $room);
        $this->manage($request, $room);
        $data = $request->validate(['name' => ['required', 'string', 'max:80']]);
        $pos = (int) $room->folders()->max('position') + 1;
        $room->folders()->create(['position' => $pos, 'name' => sprintf('%02d. %s', $pos, $data['name']), 'staged' => true]);
        Audit::log($room, 'folder.created', "Folder created: {$data['name']}");

        return back()->with('success', 'Folder added.');
    }

    /** Staged disclosure: release a folder to external roles (optionally restricted to some roles). */
    public function updateFolder(Request $request, Room $room, Folder $folder): RedirectResponse
    {
        $this->enter($request, $room);
        abort_unless($folder->room_id === $room->id, 404);
        abort_unless(Access::can($room, $request->user(), 'approve_disclosure'), 403);
        $data = $request->validate(['released' => ['required', 'boolean'], 'roles' => ['nullable', 'array'], 'roles.*' => [Rule::in(array_keys(Access::ROLES))]]);
        $folder->update(['released_at' => $data['released'] ? now() : null, 'roles' => $data['roles'] ?: null]);
        Audit::log($room, 'folder.'.($data['released'] ? 'released' : 'withheld'), "{$folder->name} ".($data['released'] ? 'released to '.($data['roles'] ? implode(', ', $data['roles']) : 'all external roles') : 'withheld'));

        return back()->with('success', $folder->name.($data['released'] ? ' released.' : ' withheld.'));
    }
}
