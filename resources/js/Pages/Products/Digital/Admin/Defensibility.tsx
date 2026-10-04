import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CalendarClock, ChevronRight, CircleCheck, Download, History, Play, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import AdminShell, { Btn, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { DpCover, DpStatus, FilterSelect, Meta } from '@/Components/Products/Digital/Ui';
import { LabelValues } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import type { DpProductDetail } from '@/Components/Products/Digital/types';

export default function Defensibility({
    product: p,
    options,
    history,
}: {
    product: DpProductDetail;
    options: { value: string; label: string }[];
    history: { event: string; at: string; data: Record<string, unknown> | null }[];
}) {
    const d = p.defensibility!;
    const [tab, setTab] = useState('D1');
    const [note, setNote] = useState('');
    const pass = d.gate === 'PASS';
    const base = `/admin/products/digital/defensibility/${p.slug}`;
    const delta = d.substitute.ours - d.substitute.score;
    const activeTest = d.tests.find((t) => t.code === tab);

    return (
        <AdminShell
            title="Defensibility Test Workbench"
            description="Evaluate whether this product deserves a paid state. Apply D1–D5 tests and review substitute evidence."
            actions={<div className="w-64"><FilterSelect label="Select product" value={p.slug} options={options} onChange={(v) => v && router.get('/admin/products/digital/defensibility', { product: v })} /></div>}
        >
            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                        <section className="flex flex-wrap gap-4 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <DpCover name={p.name} type={p.typeLabel} tone={p.tone} className="w-36" />
                            <div className="min-w-0 flex-1">
                                <p className="font-serif text-lg font-semibold">{p.name}</p>
                                <p className="text-xs text-ink-600">{p.tagline}</p>
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                                    <Meta label="Product ID" value={p.code} />
                                    <Meta label="Current Version" value={p.currentVersion?.display} />
                                    <Meta label="Format" value={p.format} />
                                    <Meta label="Language" value={p.languages.join(', ')} />
                                    <Meta label="Jurisdiction" value={p.jurisdiction} />
                                    <Meta label="Licence Assessed" value={Object.keys(p.prices).find((k) => p.prices[k]) ?? '—'} />
                                    <Meta label="DSS Band" value={p.dssBand} />
                                    <Meta label="Release Date" value={p.currentVersion?.releasedAt} />
                                    <Meta label="Next Review" value={p.nextReview} />
                                </div>
                            </div>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-center">
                            <h2 className="text-xs font-bold tracking-wide uppercase">Overall Defensibility Result</h2>
                            <div className="mt-2 flex items-center justify-center gap-3">
                                {pass ? <ShieldCheck className="size-14 text-verified-600" aria-hidden="true" /> : <ShieldAlert className="size-14 text-risk-600" aria-hidden="true" />}
                                <span className={cn('font-serif text-4xl font-bold', pass ? 'text-verified-700' : 'text-risk-700')}>{pass ? 'PASS' : d.gate.replace('_', ' ')}</span>
                            </div>
                            <p className="mt-1 text-xs text-ink-700">{pass ? 'This product qualifies for paid state.' : 'Paid state is on hold until the gate passes.'}</p>
                            <p className="text-[0.6875rem] text-ink-500">{d.tests.filter((t) => t.status === 'active').length} of 5 D-tests ACTIVE.</p>
                        </section>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {d.tests.map((t) => (
                            <div key={t.code} className={cn('flex flex-col rounded-[8px] border bg-white p-3', tab === t.code ? 'border-gold-500' : 'border-parchment-400')}>
                                <p className="font-serif text-xl font-bold">{t.code}</p>
                                <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                                <p className="mt-1 text-[0.6875rem] text-ink-600">{t.description}</p>
                                <dl className="mt-2 space-y-1 text-[0.6875rem]">
                                    <div className="flex justify-between"><dt className="text-ink-500">Status</dt><dd><DpStatus status={t.status} /></dd></div>
                                    {Object.entries(t.evidence).map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
                                </dl>
                                <div className="mt-auto flex gap-1 pt-3">
                                    <button type="button" onClick={() => setTab(t.code)} className="h-7 flex-1 rounded-[4px] border border-gold-500 text-[0.6875rem] font-semibold">View Evidence</button>
                                    <button type="button" onClick={() => act(`${base}/test`, { code: t.code, status: t.status === 'active' ? 'inactive' : 'active' })} className="h-7 rounded-[4px] border border-parchment-500 px-2 text-[0.6875rem]" title={t.status === 'active' ? 'Mark expired / inactive' : 'Activate'}>
                                        {t.status === 'active' ? 'Expire' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                        <SideCard title="Test Details & Notes">
                            <div role="tablist" className="mb-3 flex gap-1 overflow-x-auto border-b border-parchment-400 text-xs">
                                {[...d.tests.map((t) => [t.code, `${t.code} ${t.title.split(' ')[0]}`]), ['notes', 'Notes & Rationale']].map(([k, l]) => (
                                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('-mb-px shrink-0 border-b-2 px-2.5 py-1.5 font-semibold', tab === k ? 'border-gold-500' : 'border-transparent text-ink-500')}>{l}</button>
                                ))}
                            </div>
                            {tab === 'notes' ? (
                                <div className="text-xs">
                                    <p className="text-ink-700">{d.notes}</p>
                                    <p className="mt-2 rounded bg-parchment-100 p-2 italic">Adversarial question: “Why would a competent buyer pay TBCA instead of using or generating the best free alternative?”</p>
                                </div>
                            ) : activeTest ? (
                                <div className="text-xs">
                                    <p className="flex gap-2 font-semibold"><CircleCheck className={cn('size-4', activeTest.status === 'active' ? 'text-verified-500' : 'text-ink-300')} aria-hidden="true" />{activeTest.code} {activeTest.title} Test</p>
                                    <p className="mb-2 text-ink-600">{activeTest.description}</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-parchment-200 text-[0.625rem] uppercase"><tr>{['Legal Authority', 'Effective Date', 'Coverage', 'Review Frequency', 'Human Reviewed', 'Evidence File'].map((h) => <th key={h} className="p-1.5">{h}</th>)}</tr></thead>
                                            <tbody><tr>{[d.detail.authority, d.detail.effective, d.detail.coverage, d.detail.frequency, d.detail.human, d.detail.file].map((c, i) => <td key={i} className="p-1.5">{c}</td>)}</tr></tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : null}
                            <p className="mt-3 rounded bg-gold-50 p-2 text-[0.6875rem] text-ink-600">All assessments are immutable and auditable. Changes require a new review cycle and evidence set.</p>
                        </SideCard>
                        <SideCard title="Gate & Decision">
                            <LabelValues rows={[{ label: 'GATE-DP-01 Defensibility Decision', value: <DpStatus status={d.gate} /> }, { label: 'Decision', value: d.decision }, { label: 'Decision Date', value: d.decided_at }, { label: 'Approved By', value: d.decided_by }]} />
                            <label className="mt-3 block text-xs font-semibold" htmlFor="d-note">Decision note</label>
                            <textarea id="d-note" value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 h-16 w-full rounded-[4px] border border-parchment-500 p-2 text-xs" />
                            <button type="button" onClick={() => act(`${base}/decide`, { decision: 'approve', note })} className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-verified-600 text-xs font-semibold text-white">
                                <CircleCheck className="size-4" aria-hidden="true" /> Approve for Paid State
                            </button>
                            <button type="button" onClick={() => act(`${base}/decide`, { decision: 'refer', note }, 'Refer for human review? A live product will be held from sale.')} className="mt-2 flex h-9 w-full items-center justify-center rounded-[4px] border border-gold-500 text-xs font-semibold">
                                Refer for Human Review
                            </button>
                        </SideCard>
                    </div>
                </div>

                <div className="space-y-4">
                    <SideCard title="Defensibility Status">
                        <LabelValues rows={[{ label: 'Status', value: <DpStatus status={d.gate} /> }, { label: 'Last Assessed', value: d.assessed_at }, { label: 'Assessed By', value: d.assessed_by }, { label: 'Next Review Due', value: p.nextReview }, { label: 'Review Cycle', value: p.reviewCycle }]} />
                        <Btn onClick={() => act(`${base}/test`, { code: 'D1', status: d.tests[0].status })}><CalendarClock className="size-4" aria-hidden="true" /> Schedule Next Review</Btn>
                    </SideCard>
                    <SideCard title="Substitute Evidence Competition">
                        <LabelValues rows={[{ label: 'Best Free/DIY Substitute', value: d.substitute.name }, { label: 'Substitute Score (0–100)', value: d.substitute.score }, { label: 'Our Score (D1–D5 Weighted)', value: d.substitute.ours }, { label: 'Paid Value Delta', value: <span className={delta > 0 ? 'text-verified-700' : 'text-risk-700'}>{delta > 0 ? '+' : ''}{delta}</span> }]} />
                        <p className={cn('mt-2 rounded p-2 text-[0.6875rem]', delta > 0 ? 'bg-verified-50 text-verified-800' : 'bg-risk-50 text-risk-700')}>
                            {delta > 0 ? 'Our product delivers significantly more verifiable value than the best substitute.' : 'Paid value delta is not evidenced — the product cannot pass GATE-DP-01.'}
                        </p>
                    </SideCard>
                    <SideCard title="Actions">
                        <ul className="divide-y divide-parchment-300 text-xs">
                            {[
                                [Play, 'Run Full Defensibility Test', 'Re-run all D1–D5 tests', () => act(`${base}/decide`, { decision: d.tests.some((t) => t.status === 'active') && delta > 0 ? 'approve' : 'refer', note: 'Full re-test run' })],
                                [Upload, 'Upload New Evidence', 'Add or replace evidence documents', () => act(`${base}/test`, { code: tab.startsWith('D') ? tab : 'D1', status: 'active' })],
                                [History, 'View Defensibility History', `${history.length} previous assessments`, () => setTab('notes')],
                                [Download, 'Export Defensibility Report', 'Download full report (PDF)', () => window.print()],
                            ].map(([I, t, b, fn]) => {
                                const Icon = I as typeof Play;
                                return (
                                    <li key={t as string}>
                                        <button type="button" onClick={fn as () => void} className="flex w-full items-center gap-3 py-2 text-left">
                                            <Icon className="size-4 text-gold-600" aria-hidden="true" />
                                            <span className="flex-1"><strong className="block text-ink-900">{t as string}</strong>{b as string}</span>
                                            <ChevronRight className="size-4" aria-hidden="true" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        {history.length > 0 && (
                            <ul className="mt-2 space-y-1 border-t border-parchment-300 pt-2 text-[0.6875rem] text-ink-600">
                                {history.map((h, i) => <li key={i}>{h.at} — {h.event}</li>)}
                            </ul>
                        )}
                    </SideCard>
                </div>
            </div>
        </AdminShell>
    );
}

Defensibility.layout = null;
