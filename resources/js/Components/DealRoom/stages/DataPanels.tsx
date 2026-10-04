import { Link, router, useForm } from '@inertiajs/react';
import { FileText, Folder, FolderPlus, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Panel, SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import type { DocumentRow, FolderRow, RoomHeader } from '@/types/deal-room';
import { roomUrl } from '../RoomShell';
import { Bar, CheckItem, Empty, Gauge, KvList, Stat } from '../Ui';

export const fileSize = (b: number) => (b >= 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`);

/** Upload form shared by the build stage and the data room browser. */
export function UploadForm({ slug, folders, defaultFolder }: { slug: string; folders: FolderRow[]; defaultFolder?: number }) {
    const form = useForm<{ folder_id: number | ''; files: File[] }>({ folder_id: defaultFolder ?? folders[0]?.id ?? '', files: [] });
    const [drag, setDrag] = useState(false);
    const submit = () => form.post(roomUrl(slug, 'documents'), { forceFormData: true, preserveScroll: true, onSuccess: () => form.reset('files') });
    const errs = Object.entries(form.errors).filter(([k]) => k.startsWith('files'));

    return (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-3">
            <label className="block text-[0.8125rem] font-medium text-ink-800">
                Destination folder
                <select value={form.data.folder_id} onChange={(e) => form.setData('folder_id', Number(e.target.value))} className="mt-1 h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-sm">
                    {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </label>
            <label
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); form.setData('files', Array.from(e.dataTransfer.files)); }}
                className={`flex cursor-pointer flex-col items-center rounded-[6px] border-2 border-dashed p-6 text-center text-sm ${drag ? 'border-gold-500 bg-gold-50' : 'border-parchment-500 bg-parchment-100'}`}
            >
                <UploadCloud className="mb-1 size-7 text-ink-500" aria-hidden />
                <span className="font-semibold text-ink-800">Drag & drop files here</span>
                <span className="text-xs text-ink-500">or choose files · PDF, Office, CSV, images, ZIP · max 50 MB each · up to 10</span>
                <input type="file" multiple className="sr-only" onChange={(e) => form.setData('files', Array.from(e.target.files ?? []))} />
            </label>
            {form.data.files.length > 0 && <p className="text-xs text-ink-600">{form.data.files.length} file(s): {form.data.files.map((f) => f.name).join(', ')}</p>}
            {errs.map(([k, v]) => <p key={k} role="alert" className="text-xs text-risk-500">{v}</p>)}
            {form.errors.folder_id && <p role="alert" className="text-xs text-risk-500">{form.errors.folder_id}</p>}
            <Button type="submit" size="sm" disabled={form.processing || form.data.files.length === 0}>Upload securely</Button>
        </form>
    );
}

interface DataRoomData {
    folders: FolderRow[];
    recent: DocumentRow[];
    totalDocuments: number;
    foldersWithDocs: number;
    health: number;
    security: Record<string, string | number | boolean>;
}

export function DataRoomBuildPanel({ room, data }: { room: RoomHeader; data: DataRoomData }) {
    const folder = useForm({ name: '' });
    const s = data.security;
    return (
        <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="1. Build Data Room Structure">
                <p className="mb-2 flex items-center gap-1.5 text-[0.8125rem] font-semibold"><Folder className="size-4 text-gold-600" aria-hidden />{room.name} Data Room</p>
                <ul className="space-y-1 border-l border-parchment-400 pl-3">
                    {data.folders.map((f) => (
                        <li key={f.id} className="flex items-center justify-between text-[0.8125rem]">
                            <Link href={`${roomUrl(room.slug, 'data-room')}?folder=${f.id}`} className="flex items-center gap-1.5 hover:text-gold-700"><Folder className="size-3.5 text-gold-500" aria-hidden />{f.name}</Link>
                            <span className="text-xs text-ink-400">{f.documents}</span>
                        </li>
                    ))}
                </ul>
                <form onSubmit={(e) => { e.preventDefault(); folder.post(roomUrl(room.slug, 'folders'), { preserveScroll: true, onSuccess: () => folder.reset() }); }} className="mt-3 flex gap-2">
                    <input aria-label="New folder name" value={folder.data.name} onChange={(e) => folder.setData('name', e.target.value)} placeholder="Add folder" className="h-8 min-w-0 flex-1 rounded-[4px] border border-parchment-500 px-2 text-sm" />
                    <Button type="submit" size="sm" variant="outline" disabled={!folder.data.name}><FolderPlus className="size-4" aria-hidden /></Button>
                </form>
                <p className="mt-3 rounded bg-verified-50 p-2 text-xs text-verified-700">Structure is valid. {data.foldersWithDocs} of {data.folders.length} folders populated.</p>
            </Panel>
            <Panel title="2. Upload Documents">
                <UploadForm slug={room.slug} folders={data.folders} />
                <p className="mt-4 mb-1 text-xs font-bold text-ink-900 uppercase">Recent Uploads</p>
                <ul className="space-y-1.5">
                    {data.recent.slice(0, 5).map((d) => (
                        <li key={d.id} className="flex items-center gap-2 text-xs">
                            <FileText className="size-4 shrink-0 text-risk-500" aria-hidden />
                            <span className="min-w-0 flex-1 truncate">{d.name}<span className="block text-ink-400">{fileSize(d.size)} · {d.uploaded}</span></span>
                            <StatusPill status={d.status} />
                        </li>
                    ))}
                </ul>
                <p className="mt-2 text-xs text-ink-500">{data.totalDocuments} documents uploaded.</p>
            </Panel>
            <div className="space-y-5">
                <Panel title="3. Document Settings & Security">
                    <KvList rows={[
                        ['Default Access Level', s.view_only_default ? 'Internal Only' : 'Role-based'],
                        ['Watermark', s.watermark ? 'Dynamic (User + Date)' : 'Off'],
                        ['Download Permission', s.download_restricted ? 'View Only' : 'Allowed'],
                        ['Print Permission', String(s.print ?? 'Restricted')],
                        ['Version Control', 'Enabled'],
                        ['Virus Scan', 'Enabled'],
                    ]} />
                    <Link href={roomUrl(room.slug, 'setup/security-setup')} className="mt-2 inline-block text-xs font-semibold text-gold-700 hover:underline">Change security settings</Link>
                </Panel>
                <Panel title="Data Room Health">
                    <div className="flex items-center gap-4">
                        <Gauge value={data.health} label={data.health >= 80 ? 'Excellent' : data.health >= 60 ? 'Good' : 'Needs attention'} />
                        <p className="text-xs text-ink-500">Scored on folder coverage (60%) and documents approved for release (40%).</p>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

interface IntakeData {
    documents: DocumentRow[];
    counts: { total: number; ready: number; flagged: number; approved: number; released: number };
    classification: { label: string; count: number; pct: number }[];
}

/** AI intake review & release queue: approve, flag, resolve, release — all documents must clear before Stage 3. */
export function IntakePanel({ room, data }: { room: RoomHeader; data: IntakeData }) {
    const [tab, setTab] = useState('all');
    const act = (id: number, action: string, issue?: string) => router.post(roomUrl(room.slug, `documents/${id}/review`), { action, issue }, { preserveScroll: true });
    const rows = data.documents.filter((d) => tab === 'all' || (tab === 'approved' ? ['approved', 'released'].includes(d.status) : d.status === tab));
    const c = data.counts;
    const reviewed = c.total ? Math.round(((c.approved + c.released) / c.total) * 100) : 0;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Stat label="Total Documents" value={c.total} caption="Uploaded" />
                <Stat label="AI Processed" value={c.total} caption="100%" tone="good" />
                <Stat label="Ready for Review" value={c.ready} tone="warn" />
                <Stat label="Issues / Flags" value={c.flagged} tone={c.flagged ? 'bad' : 'good'} />
                <Stat label="Approved / Released" value={c.approved + c.released} caption={`${reviewed}%`} tone="good" />
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. AI Classification Overview">
                    <ul className="space-y-2">
                        {data.classification.map((k) => (
                            <li key={k.label} className="text-xs"><span className="flex justify-between"><span>{k.label}</span><span>{k.count} docs · {k.pct}%</span></span><Bar value={k.pct} tone="good" /></li>
                        ))}
                    </ul>
                    {data.classification.length === 0 && <Empty>No documents processed yet.</Empty>}
                </Panel>
                <Panel title="2. Document Review Queue" className="lg:col-span-2" action={room.manages && c.ready > 0 ? <Button type="button" size="sm" variant="outline" onClick={() => router.post(roomUrl(room.slug, `documents/${data.documents[0].id}/review`), { action: 'approve_all' }, { preserveScroll: true })}>Approve all ready</Button> : undefined}>
                    <Tabs value={tab} onChange={setTab} tabs={[{ key: 'all', label: 'All', count: c.total }, { key: 'ready', label: 'Ready', count: c.ready }, { key: 'flagged', label: 'Flagged', count: c.flagged }, { key: 'approved', label: 'Approved', count: c.approved + c.released }]} className="mb-3" />
                    <SimpleTable
                        columns={['Document', 'Category', 'AI Confidence', 'Status', 'Uploaded', 'Action']}
                        empty="Nothing in this queue."
                        rows={rows.map((d) => [
                            <span key="n" className="font-medium">{d.name}{d.issue && <span className="block text-[0.6875rem] text-risk-700">{d.issue} ({d.severity})</span>}</span>,
                            d.category ?? '—',
                            d.confidence ? `${d.confidence}%` : '—',
                            <StatusPill key="s" status={d.status} />,
                            d.uploaded,
                            room.manages ? (
                                <span key="a" className="flex flex-wrap gap-1">
                                    {d.status === 'ready' && <button type="button" className="rounded border border-verified-500/40 px-2 py-0.5 text-xs text-verified-700" onClick={() => act(d.id, 'approve')}>Approve</button>}
                                    {d.status === 'ready' && <button type="button" className="rounded border border-risk-500/40 px-2 py-0.5 text-xs text-risk-700" onClick={() => act(d.id, 'flag', 'Reviewer query raised')}>Flag</button>}
                                    {d.status === 'flagged' && <button type="button" className="rounded border border-gold-500/60 px-2 py-0.5 text-xs text-gold-800" onClick={() => act(d.id, 'resolve')}>Resolve</button>}
                                    {d.status === 'approved' && <button type="button" className="rounded border border-controlled-500/40 px-2 py-0.5 text-xs text-controlled-700" onClick={() => act(d.id, 'release')}>Release</button>}
                                </span>
                            ) : '—',
                        ])}
                    />
                </Panel>
            </div>
            <Panel title="Review & Release Status">
                <ul className="grid gap-2 sm:grid-cols-4">
                    <CheckItem done={c.ready === 0} pending={c.ready > 0}>Pending human review: {c.ready} documents</CheckItem>
                    <CheckItem done={c.flagged === 0} pending={c.flagged > 0}>Awaiting information: {c.flagged} documents</CheckItem>
                    <CheckItem done={c.approved > 0}>Approved: {c.approved} documents</CheckItem>
                    <CheckItem done={c.released > 0}>Released to participants: {c.released} documents</CheckItem>
                </ul>
                <p className="mt-3 text-xs text-ink-500">Stage gate: all documents must be approved (and flagged items resolved) to proceed to Counterparty Qualification.</p>
            </Panel>
        </div>
    );
}
