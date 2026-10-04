import { router, useForm } from '@inertiajs/react';
import { Download, Eye, FileText, Folder, Search, ShieldAlert, Stamp } from 'lucide-react';
import { useState } from 'react';
import RoomShell, { roomUrl } from '@/Components/DealRoom/RoomShell';
import { fileSize, UploadForm } from '@/Components/DealRoom/stages/DataPanels';
import { AuditPanel, Empty } from '@/Components/DealRoom/Ui';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import { Modal, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { DocumentRow, FolderRow, RoomPageProps } from '@/types/deal-room';

interface Props extends RoomPageProps {
    folders: FolderRow[];
    folderId: number;
    documents: DocumentRow[];
    ndaRequired: boolean;
    permissions: Record<string, string>;
    watermark: string;
    security: Record<string, string | number | boolean>;
    filters: { q: string };
}

/** Secure data room browser: NDA gate, role-filtered folders, watermarked viewing, permission-checked downloads. */
export default function DataRoom({ room, audit, folders, folderId, documents, ndaRequired, permissions, watermark, security, filters }: Props) {
    const nda = useForm({ accept: false });
    const [q, setQ] = useState(filters.q);
    const [viewing, setViewing] = useState<DocumentRow | null>(null);
    const folder = folders.find((f) => f.id === folderId);
    const canDownload = permissions.download && permissions.download !== 'no';
    const open = (d: DocumentRow) => {
        setViewing(d);
        router.post(roomUrl(room.slug, `documents/${d.id}/view`), {}, { preserveScroll: true, preserveState: true, only: [] });
    };

    return (
        <RoomShell room={room} title="Secure Data Room" eyebrow="Data Room" description="Controlled, watermarked, role-based access to confidential transaction documents. Every view and download is logged." activeStage={room.currentStage.code}>
            <Modal open={ndaRequired} onClose={() => router.visit('/virtual-deal-room/rooms')} title="Non-Disclosure Agreement" size="lg"
                footer={<Button type="button" disabled={!nda.data.accept || nda.processing} onClick={() => nda.post(roomUrl(room.slug, 'nda'))}>Accept NDA and enter</Button>}>
                <div className="space-y-3 text-sm text-ink-700">
                    <p>Access to the <strong>{room.name}</strong> data room is conditional on your acceptance of this NDA.</p>
                    <ol className="list-decimal space-y-1 pl-5 text-xs">
                        <li>All information is confidential and may be used only to evaluate the proposed transaction.</li>
                        <li>You may not copy, forward, screenshot or disclose documents except as permitted by your role.</li>
                        <li>Documents are dynamically watermarked with your identity; activity is logged and auditable.</li>
                        <li>Access may be revoked at any time and expires with your invitation or the room’s link policy ({String(security.link_expiry_days ?? 7)} days).</li>
                        <li>Personal information is processed in line with POPIA.</li>
                    </ol>
                    <Checkbox label="I have read and accept the NDA and the data room rules." checked={nda.data.accept} onChange={(e) => nda.setData('accept', e.target.checked)} />
                    {nda.errors.accept && <p role="alert" className="text-xs text-risk-500">{nda.errors.accept}</p>}
                </div>
            </Modal>

            <div className="flex flex-wrap items-center gap-2 rounded-[6px] border border-gold-400/60 bg-gold-50 px-3 py-2 text-xs text-ink-700">
                <Stamp className="size-4 text-gold-700" aria-hidden />
                <span>Watermark: <strong>{watermark}</strong></span>
                <span className="ml-auto">Downloads: <strong>{security.download_restricted && permissions.download !== 'yes' ? 'Restricted (view-only)' : canDownload ? 'Permitted' : 'Not permitted'}</strong></span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
                <Panel title="Folders">
                    <ul className="space-y-0.5">
                        {folders.map((f) => (
                            <li key={f.id}>
                                <button type="button" onClick={() => router.get(roomUrl(room.slug, 'data-room'), { folder: f.id }, { preserveState: true })} className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[0.8125rem]', f.id === folderId ? 'bg-gold-50 font-semibold text-gold-800' : 'hover:bg-parchment-200')}>
                                    <Folder className="size-4 shrink-0 text-gold-500" aria-hidden /><span className="flex-1 truncate">{f.name}</span><span className="text-xs text-ink-400">{f.documents}</span>
                                </button>
                            </li>
                        ))}
                        {folders.length === 0 && <li className="text-xs text-ink-400">No folders have been released to your role yet.</li>}
                    </ul>
                </Panel>
                <div className="min-w-0 space-y-5">
                    <Panel title={folder?.name ?? 'Documents'} action={
                        <form onSubmit={(e) => { e.preventDefault(); router.get(roomUrl(room.slug, 'data-room'), { folder: folderId, q }, { preserveState: true }); }} className="flex items-center gap-1">
                            <label htmlFor="doc-search" className="sr-only">Search documents</label>
                            <input id="doc-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-8 w-40 rounded border border-parchment-500 px-2 text-xs" />
                            <button type="submit" aria-label="Search" className="rounded p-1 text-ink-500 hover:text-ink-900"><Search className="size-4" /></button>
                        </form>
                    }>
                        {ndaRequired ? <Empty>Accept the NDA to view documents.</Empty> : (
                            <SimpleTable
                                columns={['Document', 'Version', 'Size', 'Status', 'Uploaded', '']}
                                empty="No documents in this folder."
                                rows={documents.map((d) => [
                                    <span key="n" className="flex items-center gap-2 font-medium"><FileText className="size-4 shrink-0 text-risk-500" aria-hidden />{d.name}</span>,
                                    `v${d.version}`, fileSize(d.size), <StatusPill key="s" status={d.status} />, d.uploaded,
                                    <span key="a" className="flex gap-2">
                                        <button type="button" onClick={() => open(d)} className="inline-flex items-center gap-1 text-xs text-controlled-700 hover:underline"><Eye className="size-3.5" aria-hidden />View</button>
                                        {canDownload && d.downloadable && <a href={roomUrl(room.slug, `documents/${d.id}/download`)} className="inline-flex items-center gap-1 text-xs text-controlled-700 hover:underline"><Download className="size-3.5" aria-hidden />Download</a>}
                                    </span>,
                                ])}
                            />
                        )}
                    </Panel>
                    {permissions.upload && permissions.upload !== 'no' && !ndaRequired && folders.length > 0 && (
                        <Panel title="Upload to this data room"><UploadForm slug={room.slug} folders={folders} defaultFolder={folderId} /></Panel>
                    )}
                    {room.manages && <AuditPanel audit={audit} />}
                </div>
            </div>

            <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name ?? ''} size="lg">
                {viewing && (
                    <div className="relative overflow-hidden rounded border border-parchment-400 bg-parchment-100 p-6 select-none" onContextMenu={(e) => e.preventDefault()}>
                        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-wrap content-center justify-center gap-10 opacity-15">
                            {Array.from({ length: 6 }).map((_, i) => <span key={i} className="-rotate-30 text-sm font-bold whitespace-nowrap text-ink-900">{watermark}</span>)}
                        </div>
                        <p className="flex items-center gap-1 text-xs text-ink-500"><ShieldAlert className="size-3.5" aria-hidden /> Secure viewer — copy, print and screenshots are restricted. This view has been logged.</p>
                        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <dt className="text-ink-500">Folder</dt><dd>{viewing.folder}</dd>
                            <dt className="text-ink-500">AI classification</dt><dd>{viewing.category ?? '—'} ({viewing.confidence ?? '—'}%)</dd>
                            <dt className="text-ink-500">Integrity hash</dt><dd className="font-mono">{viewing.hash ?? '—'}</dd>
                            <dt className="text-ink-500">Version</dt><dd>v{viewing.version}</dd>
                        </dl>
                    </div>
                )}
            </Modal>
        </RoomShell>
    );
}
