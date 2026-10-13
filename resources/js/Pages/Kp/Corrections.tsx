import { router, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, Field, Input, KpPage, Textarea, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Row { code: string; title: string; status: string; type: string; topic: string; note: string; by: string; impact: string; date: string }

interface Props extends KpShared {
    rows: Row[];
    types: string[];
    filters: { type: string; q: string };
    stats: { total: number; corrected: number; updated: number; review: number; nochange: number };
}

const STATUS: Record<string, [typeof L.CircleCheck, string, string]> = {
    Corrected: [L.CircleCheck, 'text-verified-500', 'bg-verified-50 text-verified-700'],
    Updated: [L.RefreshCw, 'text-controlled-500', 'bg-controlled-50 text-controlled-700'],
    'Under Review': [L.Clock, 'text-attested-500', 'bg-attested-50 text-attested-700'],
    'No Change': [L.CircleMinus, 'text-ink-400', 'bg-parchment-200 text-ink-600'],
};
const TABS = ['All', 'Corrected', 'Updated', 'Under Review', 'No Change'];
const IMPACT: Record<string, string> = { high: 'bg-risk-500', medium: 'bg-attested-500', low: 'bg-gold-400' };

/** KP-SCR-026 AI Correction State: a public timeline of corrections, updates and reviews. */
export default function Corrections({ screen, kpNav, rows, types, filters, stats }: Props) {
    const [tab, setTab] = useState('All');
    const [open, setOpen] = useState<string | null>(null);
    const report = useForm({ content: '', issue: '', email: '' });
    const view = rows.filter((r) => tab === 'All' || r.status === tab);
    const count = (k: string) => rows.filter((r) => r.impact === k).length;

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['AI Correction State']]}
            title="AI Correction State"
            subtitle="Corrections are visible."
            intro="Track corrections, updates and the current state of AI-generated and published content."
            left={
                <div className="space-y-4">
                    <Box title="Correction Summary">
                        <p className="text-3xl font-bold text-ink-900">{stats.total}</p>
                        <p className="text-[0.75rem] text-ink-500">published correction records</p>
                        <ul className="mt-2 space-y-1 text-[0.8125rem]">
                            <li className="flex justify-between"><span>Corrected</span><strong>{stats.corrected}</strong></li>
                            <li className="flex justify-between"><span>Updated</span><strong>{stats.updated}</strong></li>
                            <li className="flex justify-between"><span>Under Review</span><strong>{stats.review}</strong></li>
                            <li className="flex justify-between"><span>No Change</span><strong>{stats.nochange}</strong></li>
                        </ul>
                    </Box>
                    <Box title="Filter Corrections">
                        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); router.get(`${BASE}/corrections`, Object.fromEntries([...fd.entries()].filter(([, v]) => v)), { preserveScroll: true }); }}>
                            <label className="block text-[0.75rem] font-semibold">Correction type
                                <select name="type" defaultValue={filters.type} className="mt-1 h-9 w-full rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.8125rem]"><option value="">All types</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
                            </label>
                            <label className="block text-[0.75rem] font-semibold">Topic or keyword
                                <input name="q" defaultValue={filters.q} className="mt-1 h-9 w-full rounded-[6px] border border-parchment-500 px-2 text-[0.8125rem]" />
                            </label>
                            <div className="flex gap-2"><button type="submit" className={btnClass('outline', 'sm')}>Apply</button><button type="button" onClick={() => router.get(`${BASE}/corrections`)} className={btnClass('outline', 'sm')}><L.RotateCcw className="size-3.5" />Clear</button></div>
                        </form>
                    </Box>
                </div>
            }
            rail={
                <>
                    <Box title="Correction Impact">
                        <ul className="space-y-1.5 text-[0.8125rem]">{(['high', 'medium', 'low'] as const).map((k) => <li key={k} className="flex items-center gap-2"><span className={cn('size-2.5 rounded-full', IMPACT[k])} /><span className="flex-1 capitalize">{k} impact</span>{count(k)}</li>)}</ul>
                    </Box>
                    <Box title="Correction Types">
                        <ul className="space-y-1.5 text-[0.8125rem]">{types.map((t) => <li key={t} className="flex justify-between">{t}<span>{rows.filter((r) => r.type === t).length}</span></li>)}</ul>
                    </Box>
                    <Box title="About This Panel" tone="purple">
                        <p className="text-[0.8125rem]">We monitor, verify and correct AI-generated and published content. When a source changes, every answer that relies on it is re-checked and the change is logged here.</p>
                    </Box>
                    <Box id="report" title="Report an Issue" icon="triangle-alert" tone="cream">
                        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); report.post(`${BASE}/corrections`, { preserveScroll: true, onSuccess: () => report.reset() }); }}>
                            <Field label="Which content?" error={report.errors.content}><Input required maxLength={200} value={report.data.content} onChange={(e) => report.setData('content', e.target.value)} /></Field>
                            <Field label="What is inaccurate?" error={report.errors.issue}><Textarea rows={3} required minLength={20} maxLength={1000} value={report.data.issue} onChange={(e) => report.setData('issue', e.target.value)} /></Field>
                            <Field label="Email for follow-up (optional)" error={report.errors.email}><Input type="email" value={report.data.email} onChange={(e) => report.setData('email', e.target.value)} /></Field>
                            <button type="submit" disabled={report.processing} className={cn(btnClass('dark', 'sm'), 'w-full')}>Report an Issue</button>
                        </form>
                    </Box>
                </>
            }
        >
            <Box title="Correction Timeline" icon="clock">
                <div role="tablist" className="mb-2 flex flex-wrap gap-1 border-b border-parchment-300">
                    {TABS.map((t) => <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('px-3 py-2 text-[0.8125rem]', tab === t ? 'border-b-2 border-referenced-500 font-bold text-referenced-500' : 'text-ink-600')}>{t} ({t === 'All' ? rows.length : rows.filter((r) => r.status === t).length})</button>)}
                </div>
                {view.length === 0 ? <Empty>No corrections match.</Empty> : (
                    <ul className="divide-y divide-parchment-300">
                        {view.map((r) => {
                            const [Icon, ic, pill] = STATUS[r.status] ?? STATUS['No Change'];
                            return (
                                <li key={r.code} className="py-3">
                                    <div className="flex flex-wrap items-start gap-3">
                                        <Icon className={cn('mt-0.5 size-6 shrink-0', ic)} aria-hidden="true" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[0.875rem] font-bold text-ink-900">{r.title}</p>
                                            <p className="text-[0.75rem] text-ink-500">Type: {r.type} | Topic: {r.topic}</p>
                                            <p className="text-[0.8125rem] text-ink-700">{r.note}</p>
                                        </div>
                                        <div className="text-right text-[0.75rem]"><span className={cn('rounded-[4px] px-2 py-0.5 font-semibold', pill)}>{r.status}</span><p className="mt-1 text-ink-500">{r.date}</p><p className="text-ink-500">By: {r.by}</p></div>
                                        <button type="button" aria-expanded={open === r.code} onClick={() => setOpen(open === r.code ? null : r.code)} className={btnClass('outline', 'sm')}>View Details</button>
                                    </div>
                                    {open === r.code && <dl className="mt-2 ml-9 grid gap-1 rounded-[8px] bg-parchment-200 p-3 text-[0.75rem] sm:grid-cols-2"><div><dt className="inline text-ink-500">Correction ID: </dt><dd className="inline font-semibold">{r.code}</dd></div><div><dt className="inline text-ink-500">Impact: </dt><dd className="inline font-semibold capitalize">{r.impact}</dd></div><div><dt className="inline text-ink-500">Reviewed by: </dt><dd className="inline font-semibold">{r.by}</dd></div><div><dt className="inline text-ink-500">Date: </dt><dd className="inline font-semibold">{r.date}</dd></div></dl>}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Box>
        </KpPage>
    );
}
