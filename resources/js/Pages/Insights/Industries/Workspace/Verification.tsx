import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Clock, Download, FileText, MessageSquare, ShieldCheck, Upload } from 'lucide-react';
import { Modal, Tabs } from '@/Components/ui/Kit';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Status, Table } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { WorkspaceBase } from '@/types/insights';

interface Req { id: number; reqId: string; title: string; detail: string | null; sourceType: string; impact: string; priority: string; requestedOn: string; dueOn: string; daysLeft: number; status: string; submission: { note: string; link?: string | null; file?: string | null; at: string } | null }
interface Props extends WorkspaceBase {
    tab: string;
    counts: WorkspaceBase['counts'] & { requested: number; awaiting_review: number; resolved: number; all: number };
    summary: { status: string; outstanding: number; submitted: number; total: number; updated: string | null };
    requests: Req[];
}

export default function Verification(props: Props) {
    const { engagement: e, tab, counts, summary, requests } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [active, setActive] = useState<Req | null>(null);
    const form = useForm<{ note: string; link: string; file: File | null }>({ note: '', link: '', file: null });

    const submit = () => {
        if (!active) return;
        form.post(`${root}/verification/${active.id}`, { forceFormData: true, preserveScroll: true, onSuccess: () => { setActive(null); form.reset(); } });
    };

    return (
        <WorkspaceShell
            base={props}
            title="Industry Verification & Evidence Request"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="Verify the evidence for this industry's intelligence. Your review helps ensure accuracy and trust."
            right={
                <>
                    <Box title="How Verification Works">
                        <ol className="space-y-3 text-xs">
                            {[['1. Review Request', 'Understand the evidence required and why it is needed.'], ['2. Submit Evidence', 'Upload documents or provide links to credible sources.'], ['3. Under Review', 'Our analysts review and validate your evidence.'], ['4. Resolved', 'Verified data is published and used across AIIM.']].map(([t, s]) => <li key={t}><strong>{t}</strong><span className="block text-ink-500">{s}</span></li>)}
                        </ol>
                    </Box>
                    <Box title="Quick Info">
                        <p className="text-xs text-ink-600">Verification ensures the intelligence in AIIM is accurate, reliable and trusted by investors and governments.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Evidence request clarification – ${e.reference}`, section: 'industries' })} className="mt-3 flex items-center gap-1.5 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800"><MessageSquare className="size-4" /> Ask a Question</button>
                    </Box>
                    <Box title="Supporting Documents"><p className="text-xs text-ink-600">Download templates and guidance for acceptable evidence.</p><Link href="/resources/data-statement" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-controlled-700"><FileText className="size-4" /> View Documents</Link></Box>
                </>
            }
        >
            <div className="flex flex-col gap-4 rounded-[8px] border border-gold-300 bg-gold-50/60 p-4 lg:flex-row lg:items-center">
                <ShieldCheck className="size-10 text-gold-700" />
                <div className="flex-1"><p className="font-semibold">Why verification matters</p><p className="text-xs text-ink-600">Verified industries power trusted intelligence across AIIM. Your evidence helps us confirm regulations and market data used by investors, exporters and governments.</p></div>
                <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                    <div><dt className="text-ink-500">Verification Status</dt><dd className={cn('text-base font-bold', summary.status === 'Complete' ? 'text-verified-700' : 'text-attested-700')}>{summary.status}</dd></div>
                    <div><dt className="text-ink-500">Requests Outstanding</dt><dd className="text-base font-bold">{summary.outstanding} <span className="text-xs font-normal">of {summary.total}</span></dd></div>
                    <div><dt className="text-ink-500">Evidence Submitted</dt><dd className="text-base font-bold">{summary.submitted} <span className="text-xs font-normal">of {summary.total}</span></dd></div>
                    <div><dt className="text-ink-500">Last Updated</dt><dd className="font-semibold">{summary.updated}</dd></div>
                </dl>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
                <Tabs
                    tabs={[{ key: 'requested', label: 'Open Requests', count: counts.requested }, { key: 'awaiting_review', label: 'Awaiting Review', count: counts.awaiting_review }, { key: 'resolved', label: 'Resolved', count: counts.resolved }, { key: 'all', label: 'All Requests', count: counts.all }]}
                    value={tab}
                    onChange={(t) => router.get(`${root}/verification`, { tab: t }, { preserveScroll: true, preserveState: true })}
                />
                <a href={`${root}/verification-export`} className="flex items-center gap-1.5 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800"><Download className="size-4" /> Export List</a>
            </div>

            <Table
                head={['Request ID', 'Evidence Required', 'Source Type', 'Impact', 'Due Date', 'Priority', 'Status', 'Actions']}
                rows={requests.map((r) => [
                    <span key="a"><strong className="block">{r.reqId}</strong><span className="text-xs text-ink-400">Requested {r.requestedOn}</span></span>,
                    <span key="b"><strong className="block">{r.title}</strong><span className="text-xs text-ink-500">{r.detail}</span></span>,
                    <span key="c" className="text-xs">{r.sourceType}</span>,
                    <Status key="d" value={r.impact} />,
                    <span key="e" className="text-xs">{r.dueOn}{r.status === 'requested' && <span className={cn('block font-semibold', r.daysLeft < 0 ? 'text-risk-700' : 'text-attested-700')}>{r.daysLeft < 0 ? `${-r.daysLeft} days overdue` : `In ${r.daysLeft} days`}</span>}</span>,
                    <span key="f" className="text-xs capitalize">{r.priority}</span>,
                    <Status key="g" value={r.status} />,
                    r.status === 'requested' ? (
                        <button key="h" type="button" onClick={() => setActive(r)} className="flex items-center gap-1 rounded border border-parchment-500 px-2 py-1 text-xs font-semibold"><Upload className="size-3.5" /> Upload Evidence</button>
                    ) : (
                        <span key="h" className="flex items-center gap-1 text-xs text-ink-500"><Clock className="size-3.5" /> {r.submission?.at}</span>
                    ),
                ])}
                empty="No requests in this view."
            />
            <p className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700"><strong>Trust & Transparency.</strong> All submitted evidence is handled securely and confidentially. Only verified data is published on AIIM.</p>

            <Modal open={!!active} onClose={() => setActive(null)} title={`Submit evidence – ${active?.reqId ?? ''}`}
                footer={<><button type="button" onClick={() => setActive(null)} className="rounded border border-parchment-500 px-4 py-2 text-sm">Cancel</button><button type="button" onClick={submit} disabled={form.processing} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Submit Evidence</button></>}>
                <p className="mb-3 text-sm font-semibold">{active?.title}</p>
                <div className="space-y-3">
                    <Field label="Note to analyst" required error={form.errors.note}>{(id) => <Textarea id={id} value={form.data.note} onChange={(ev) => form.setData('note', ev.target.value)} placeholder="Describe the source, period and scope of the evidence" />}</Field>
                    <Field label="Link to credible source" error={form.errors.link} hint="Provide a link, upload a document, or both.">{(id) => <Input id={id} type="url" value={form.data.link} onChange={(ev) => form.setData('link', ev.target.value)} placeholder="https://" />}</Field>
                    <Field label="Upload document (PDF, XLSX, DOCX, CSV, image; max 10 MB)" error={form.errors.file}>{(id) => <input id={id} type="file" onChange={(ev) => form.setData('file', ev.target.files?.[0] ?? null)} className="text-sm" />}</Field>
                </div>
            </Modal>
        </WorkspaceShell>
    );
}
