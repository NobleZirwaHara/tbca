import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Circle, FileText, Info, Plus } from 'lucide-react';
import { Modal, Stepper } from '@/Components/ui/Kit';
import { Field, Textarea } from '@/Components/ui/Form';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Donut, Legend, Status, Table } from '@/Components/Insights/Shared';
import type { WorkspaceBase } from '@/types/insights';

interface Specialist { discipline: string; name: string; id: string; qualifications: string; role: string; status: string; signature: string | null; date: string | null }
interface Props extends WorkspaceBase {
    specialists: Specialist[];
    checklist: { label: string; state: string }[];
    stats: { completed: number; inReview: number; pending: number; notRequired: number; percent: number };
    releasable: boolean;
    clientAck: boolean;
    requests: { note: string; at: string; status: string }[];
    isAdmin: boolean;
    summary: { complexity: string | null; due: string | null; disciplines: number };
}

export default function SpecialistReview(props: Props) {
    const { engagement: e, specialists, checklist, stats, releasable, clientAck, requests, isAdmin, summary } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [ask, setAsk] = useState(false);
    const form = useForm({ action: 'request', note: '' });
    const step = clientAck ? 5 : releasable ? 4 : 3;

    return (
        <WorkspaceShell
            base={props}
            title="Specialist Review and Sign-Off"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="Qualified specialist review and sign-off are required before this engagement can be delivered."
            actions={<button type="button" onClick={() => setAsk(true)} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Request Additional Review</button>}
            right={
                <>
                    <Box title="Review Status" action={<Status value={releasable ? 'completed' : 'in_progress'} />}>
                        <div className="flex items-center gap-4">
                            <Donut value={stats.percent} label={`${stats.percent}%`} sub="Review Complete" size={110} segments={[{ value: stats.percent, color: '#d6a32e' }, { value: 100 - stats.percent, color: '#e8e1d2' }]} />
                            <Legend items={[{ label: 'Completed', value: stats.completed, color: '#2f9e5b' }, { label: 'In Review', value: stats.inReview, color: '#d6a32e' }, { label: 'Pending', value: stats.pending, color: '#9aa0a6' }, { label: 'Not Required', value: stats.notRequired, color: '#e8e1d2' }]} />
                        </div>
                    </Box>
                    <Box title="Documents Under Review">
                        <ul className="space-y-2 text-xs">{['Market Intelligence Report (Draft)|D1.pdf', 'Data Tables & Annexures|A.xlsx', 'Methodology & Sources|M.pdf', 'Limitations & Assumptions|L.pdf'].map((d) => { const [t, f] = d.split('|'); return <li key={t} className="flex gap-2"><FileText className="size-4 text-ink-500" /><span><strong className="block">{t}</strong>{e.reference}-{f}</span></li>; })}</ul>
                    </Box>
                    <Box tone="blue" title="Important"><ul className="space-y-1 text-xs"><li>Specialist opinions are independent of TBCA.</li><li>No specialist provides legal, tax or regulatory advice.</li><li>All reviews are recorded for audit purposes.</li></ul></Box>
                </>
            }
        >
            <Box><Stepper steps={['Scope & Classification', 'Data & Analysis', 'Specialist Review', 'Client Acknowledgement', 'Sign-Off & Release']} current={step} /></Box>
            <Box title="Engagement Summary">
                <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 xl:grid-cols-7">
                    {[['Engagement', e.title], ['Reference', e.reference], ['Industry', e.industry], ['Country', e.country], ['Complexity Class', summary.complexity], ['Required Specialists', `${summary.disciplines} Disciplines`], ['Due Date', summary.due]].map(([k, v]) => <div key={k as string}><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v ?? '—'}</dd></div>)}
                </dl>
            </Box>
            <Box title="Specialist Review Panel">
                <p className="-mt-2 mb-3 text-xs text-ink-500">At least two qualified specialists must review and sign-off in their discipline.</p>
                <Table
                    head={['#', 'Discipline', 'Specialist', 'Qualifications & Registration', 'Role', 'Review Status', 'Signature', 'Date', ...(isAdmin ? [''] : [])]}
                    rows={specialists.map((s, i) => [
                        i + 1, s.discipline,
                        <span key="n"><strong className="block">{s.name}</strong><span className="text-xs text-ink-400">ID: {s.id}</span></span>,
                        <span key="q" className="text-xs">{s.qualifications}</span>, <span key="r" className="text-xs">{s.role}</span>, <Status key="s" value={s.status} />,
                        <span key="g" className="font-serif text-sm italic">{s.signature ?? '—'}</span>, s.date ?? '—',
                        ...(isAdmin ? [s.status !== 'completed' ? <button key="x" type="button" onClick={() => router.post(`${root}/specialist-review`, { action: 'sign', index: i }, { preserveScroll: true })} className="rounded border px-2 py-0.5 text-xs">Record sign-off</button> : null] : []),
                    ])}
                    empty="No specialist review is required for this engagement."
                />
                {!releasable && specialists.length > 0 && <p className="mt-3 flex items-center gap-2 rounded bg-attested-50 p-2 text-xs text-attested-700"><AlertTriangle className="size-4" /> Engagement will not be released until all required specialist reviews are complete and at least two disciplines have signed off.</p>}
            </Box>
            <Box title="Review Checklist">
                <p className="-mt-2 mb-3 text-xs text-ink-500">Specialists must confirm the following before sign-off.</p>
                <ul className="grid gap-2 sm:grid-cols-2">{checklist.map((c) => <li key={c.label} className="flex items-center gap-2 rounded border border-parchment-300 p-2 text-xs">{c.state === 'passed' ? <CheckCircle2 className="size-4 text-verified-500" /> : c.state === 'warning' ? <AlertTriangle className="size-4 text-attested-500" /> : <Circle className="size-4 text-ink-300" />}{c.label}</li>)}</ul>
            </Box>
            {requests.length > 0 && <Box title="Additional review requests"><ul className="space-y-1 text-xs">{requests.map((r, i) => <li key={i}>{r.at} — {r.note} <Status value={r.status} /></li>)}</ul></Box>}
            {clientAck ? (
                <p className="flex items-center gap-2 rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-sm text-verified-700"><CheckCircle2 className="size-5" /> Client acknowledgement recorded. The Acceptance Gate (G5) can now be approved.</p>
            ) : (
                <div className="flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center">
                    <Info className="size-5 text-gold-700" />
                    <p className="flex-1 text-sm">Client acknowledgement is available once specialist review is complete.</p>
                    <button type="button" disabled={!releasable} onClick={() => router.post(`${root}/specialist-review`, { action: 'acknowledge' }, { preserveScroll: true })} className="rounded bg-gold-500 px-4 py-2 text-xs font-bold disabled:opacity-50">Acknowledge Review</button>
                </div>
            )}
            <Modal open={ask} onClose={() => setAsk(false)} title="Request Additional Review"
                footer={<button type="button" onClick={() => form.post(`${root}/specialist-review`, { preserveScroll: true, onSuccess: () => { setAsk(false); form.reset(); } })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Submit</button>}>
                <Field label="What should be reviewed further?" required error={form.errors.note}>{(id) => <Textarea id={id} value={form.data.note} onChange={(ev) => form.setData('note', ev.target.value)} />}</Field>
            </Modal>
        </WorkspaceShell>
    );
}
