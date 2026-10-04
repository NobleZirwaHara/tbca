import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CircleCheck, CircleX, Clock, Play, Rocket, Save, Send, ShieldCheck } from 'lucide-react';
import AdminShell, { Btn, Kpi, QueryTabs, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { DataTable, DpCover, DpStatus, FilterSelect, Meta } from '@/Components/Products/Digital/Ui';
import { Notice } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import type { DpProductDetail, DpVersion } from '@/Components/Products/Digital/types';

interface Check {
    n: number;
    name: string;
    description: string;
    reviewer: string;
    result: string;
    evidence: number;
    date: string;
}

export default function Qa({
    product: p,
    draft,
    qa,
    options,
    claimsOpen,
    releases,
    audit,
}: {
    product: DpProductDetail;
    draft: DpVersion | null;
    qa: { cycle: number; status: string; completed_at: string; run_by: string; note: string; internal_note?: string; checks: Check[] };
    options: { value: string; label: string }[];
    claimsOpen: number;
    releases: DpVersion[];
    audit: { event: string; at: string }[];
}) {
    const [tab, setTab] = useState('checks');
    const [showAll, setShowAll] = useState(false);
    const [note, setNote] = useState(qa.internal_note ?? '');
    const base = `/admin/products/digital/qa/${p.slug}`;
    const passed = qa.checks.filter((c) => c.result === 'pass').length;
    const failed = qa.checks.filter((c) => c.result === 'fail').length;
    const pending = qa.checks.length - passed - failed;
    const ready = passed === 17;
    const canRelease = ready && qa.status === 'submitted' && Boolean(draft);
    const evidence = qa.checks.reduce((s, c) => s + c.evidence, 0);

    return (
        <AdminShell
            title="Creation QA and Release Workbench"
            description="Universal quality assurance and release gate. All 17 QA checks must PASS before release."
            actions={
                <>
                    <div className="w-56"><FilterSelect label="Select product" value={p.slug} options={options} onChange={(v) => v && router.get('/admin/products/digital/qa', { product: v })} /></div>
                    <Btn onClick={() => act(`${base}/note`, { note: note || 'Draft saved' })}><Save className="size-4" aria-hidden="true" /> Save Draft</Btn>
                    <Btn onClick={() => act(`${base}/run`)}><Play className="size-4" aria-hidden="true" /> Run Full QA</Btn>
                    <Btn tone="gold" disabled={!ready || qa.status === 'submitted'} onClick={() => act(`${base}/submit`)}><Send className="size-4" aria-hidden="true" /> Submit for Review</Btn>
                    <Btn tone="gold" disabled={!canRelease} onClick={() => act(`${base}/release`, {}, `Release ${draft?.label}? The current version becomes superseded and holders are notified.`)}><Rocket className="size-4" aria-hidden="true" /> Release Product</Btn>
                </>
            }
        >
            {!draft && <Notice tone="info">No draft version is in QA for this product. Showing the QA record of the current release. Open a correction to create a replacement draft.</Notice>}
            <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
                <div className="min-w-0 space-y-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                        <section className="flex flex-wrap gap-4 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <DpCover name={p.name} type={p.typeLabel} tone={p.tone} className="w-36" />
                            <div className="min-w-0 flex-1">
                                <p className="font-serif text-lg font-semibold">{p.name}</p>
                                <p className="text-xs text-ink-600">{p.tagline}</p>
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                                    <Meta label="Product ID" value={p.code} />
                                    <Meta label="Draft Version" value={draft ? `${draft.label} (Draft)` : '—'} />
                                    <Meta label="Language" value={p.languages.join(', ')} />
                                    <Meta label="Format" value={p.format} />
                                    <Meta label="Jurisdiction" value={p.jurisdiction} />
                                    <Meta label="Licence (Proposed)" value={Object.keys(p.prices).filter((k) => p.prices[k]).join(', ')} />
                                    <Meta label="DSS Band" value={p.dssBand} />
                                    <Meta label="Intended Use" value="General Business Use" />
                                    <Meta label="Owner" value="DP Product Team" />
                                </div>
                            </div>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-xs font-bold tracking-wide uppercase">Release Gate Status</h2>
                            <div className="mt-2 flex items-center gap-4">
                                <div className={cn('flex size-24 shrink-0 flex-col items-center justify-center rounded-full border-[6px]', ready ? 'border-verified-500' : failed ? 'border-risk-500' : 'border-attested-500')}>
                                    <span className="text-lg font-bold">{passed} / 17</span>
                                    <span className="text-xs font-bold">{ready ? 'PASS' : failed ? 'BLOCK' : 'OPEN'}</span>
                                </div>
                                <div className="text-[0.6875rem]">
                                    <p className={cn('text-sm font-bold', ready ? 'text-verified-700' : 'text-attested-700')}>{qa.status === 'submitted' ? 'SUBMITTED FOR REVIEW' : ready ? 'READY FOR REVIEW' : failed ? 'BLOCKED' : 'IN PROGRESS'}</p>
                                    <p>QA Completed: {qa.completed_at}</p>
                                    <p>Last Run By: {qa.run_by}</p>
                                    <p>QA Cycle: {qa.cycle}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                        <Kpi label="QA Cycle" value={qa.cycle} caption="Current cycle" />
                        <Kpi label="Checks Passed" value={passed} caption={`${Math.round((passed / 17) * 100)}%`} tone="good" />
                        <Kpi label="Checks Failed" value={failed} caption={`${Math.round((failed / 17) * 100)}%`} tone="bad" />
                        <Kpi label="Awaiting Review" value={pending} caption={`${Math.round((pending / 17) * 100)}%`} tone="warn" />
                        <Kpi label="Evidence Attached" value={evidence} caption="View all" />
                        <Kpi label="Human Reviews" value={`${Math.min(5, passed)} / 5`} caption="Complete" />
                        <Kpi label="Gate Status" value={ready ? 'PASS' : 'OPEN'} caption={ready ? 'Ready for review' : `${claimsOpen} open claims`} tone={ready ? 'good' : 'warn'} />
                    </div>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <QueryTabs value={tab} onChange={setTab} tabs={[{ key: 'checks', label: 'QA Check Results' }, { key: 'evidence', label: 'Evidence & Documents' }, { key: 'reviewers', label: 'Reviewers & Approvals' }, { key: 'audit', label: 'Audit Trail' }, { key: 'releases', label: 'Release History' }]} />
                        <div className="mt-3">
                            {tab === 'checks' && (
                                <>
                                    <DataTable
                                        columns={['Check', 'Description', 'Result', 'Evidence', 'Reviewer', 'Review Date', 'Actions']}
                                        rows={(showAll ? qa.checks : qa.checks.slice(0, 5)).map((c) => [
                                            <span key="n" className="flex gap-1.5 font-semibold text-ink-900">{c.result === 'pass' ? <CircleCheck className="size-4 text-verified-500" /> : c.result === 'fail' ? <CircleX className="size-4 text-risk-500" /> : <Clock className="size-4 text-attested-500" />}{c.n}. {c.name}</span>,
                                            <span key="d" className="block max-w-72">{c.description}</span>,
                                            <DpStatus key="r" status={c.result} />,
                                            `${c.evidence} file${c.evidence === 1 ? '' : 's'}`,
                                            c.reviewer,
                                            c.date,
                                            <select key="a" aria-label={`Set result for ${c.name}`} value={c.result} onChange={(e) => act(`${base}/check`, { n: c.n, result: e.target.value })} className="h-7 rounded-[4px] border border-parchment-500 text-[0.6875rem]">
                                                <option value="pass">Pass</option>
                                                <option value="fail">Fail</option>
                                                <option value="pending">Pending</option>
                                            </select>,
                                        ])}
                                    />
                                    <button type="button" onClick={() => setShowAll((s) => !s)} className="mt-2 text-xs font-semibold text-gold-700 underline">{showAll ? 'Show first 5' : 'View all 17 checks →'}</button>
                                </>
                            )}
                            {tab === 'evidence' && <DataTable columns={['Check', 'Files', 'Reviewer']} rows={qa.checks.map((c) => [c.name, c.evidence, c.reviewer])} />}
                            {tab === 'reviewers' && <DataTable columns={['Reviewer', 'Checks', 'Passed']} rows={[...new Set(qa.checks.map((c) => c.reviewer))].map((r) => [r, qa.checks.filter((c) => c.reviewer === r).length, qa.checks.filter((c) => c.reviewer === r && c.result === 'pass').length])} />}
                            {tab === 'audit' && <ul className="space-y-1 text-xs">{audit.map((a, i) => <li key={i}>{a.at} — {a.event}</li>)}{audit.length === 0 && <li className="text-ink-500">No audit events yet.</li>}</ul>}
                            {tab === 'releases' && <DataTable columns={['Version', 'Status', 'Released', 'Summary']} rows={releases.map((r) => [r.label, <DpStatus key="s" status={r.status} />, r.releasedAt, r.summary])} />}
                        </div>
                    </section>
                </div>
                <div className="space-y-4">
                    <SideCard title={`QA Checklist (${passed} of 17 Pass)`}>
                        <ul className="space-y-1.5 text-xs">
                            {qa.checks.map((c) => <li key={c.n} className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-gold-600" aria-hidden="true" />{c.n}. {c.name}</span><DpStatus status={c.result} /></li>)}
                        </ul>
                    </SideCard>
                    <SideCard title="QA Notes">
                        <p className="text-xs text-ink-700">{qa.note}</p>
                        <label htmlFor="qa-note" className="mt-3 block text-xs font-semibold">Internal Note (optional)</label>
                        <textarea id="qa-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an internal note visible to reviewers..." className="mt-1 h-20 w-full rounded-[4px] border border-parchment-500 p-2 text-xs" />
                        <Btn onClick={() => act(`${base}/note`, { note })} disabled={!note}>Save note</Btn>
                    </SideCard>
                </div>
            </div>
        </AdminShell>
    );
}

Qa.layout = null;
