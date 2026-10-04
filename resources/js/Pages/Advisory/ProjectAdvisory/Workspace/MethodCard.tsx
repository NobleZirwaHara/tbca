import { Head, Link, useForm } from '@inertiajs/react';
import { Ban, Bot, CheckCircle2, FilePen, Lock, TriangleAlert, User } from 'lucide-react';
import { Textarea } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { CheckList, KV, Notice, PageTitle, StatusDot, zar } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { LedgerSummary, MandateView } from '@/types/advisory';

interface Props {
    mandate: MandateView;
    card: [string, string][] | null;
    earning: { milestone: string; event: string; pct: number; timing: string; amount: number; status: string }[];
    ledgers: Record<string, LedgerSummary>;
    gate: { status: string } | null;
    checks: { label: string; ok: boolean; result: string; state: string }[];
}

export default function MethodCard({ mandate: m, card, earning, ledgers, gate, checks }: Props) {
    const form = useForm({ decision: 'approve', note: '' });
    const decide = (decision: 'approve' | 'change' | 'decline') => {
        form.transform((d) => ({ ...d, decision }));
        form.post(`/project-advisory/workspace/${m.reference}/method-card`, { preserveScroll: true });
    };
    const ready = gate?.status === 'pending' && checks.every((c) => c.ok);
    const approved = !!m.method_approved;
    return (
        <div className="container-tbca py-8">
            <Head title="Method Card Viewer & Approval" />
            <PageTitle crumbs={[{ label: 'Client Portal', href: '/project-advisory/workspace' }, { label: 'Project Advisory', href: '/project-advisory' }, { label: 'Method Card' }]} title="Method Card Viewer & Approval" sub="Review the recommended method for this stage. Approve before any paid work begins." />
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
                {[['Project', m.project], ['Organisation', m.organisation], ['Engagement ID', m.reference], ['Current Stage', m.stage], ['Current Gate', 'G1 – Discovery Method Approval'], ['Human Lead', m.lead ?? '—'], ['Senior Reviewer', m.reviewer ?? '—'], ['Current Decision', approved ? `Approved ${m.method_approved}` : gate?.status === 'pending' ? 'Awaiting Approval' : gate?.status ?? 'Not issued']].map(([k, v]) => <div key={k} className="rounded border border-parchment-400 bg-white p-2"><p className="text-[0.625rem] text-ink-500">{k}</p><p className="text-xs font-semibold">{v}</p></div>)}
            </div>
            <PaWorkspaceNav reference={m.reference} />
            {!card ? (
                <Notice tone="info">TBCA is preparing your Method Card after qualification. You will be notified when it is ready for approval.</Notice>
            ) : (
                <div className="grid gap-4 xl:grid-cols-12">
                    <section className="rounded-[8px] border border-gold-300 bg-white p-4 xl:col-span-6">
                        <h2 className="font-serif text-lg font-bold text-gold-700">METHOD CARD — {m.service?.name?.toUpperCase()}</h2>
                        <ol className="mt-3 grid gap-x-4 sm:grid-cols-2">
                            {card.map(([k, v], i) => <li key={k} className="flex gap-2 border-b border-parchment-200 py-1.5 text-[0.6875rem]"><span className="w-5 shrink-0 font-bold text-gold-700">{String(i + 1).padStart(2, '0')}</span><span><b className="block text-ink-900">{k}</b><span className="text-ink-600">{v}</span></span></li>)}
                        </ol>
                    </section>
                    <section className="grid gap-3 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-1">
                        <div className="rounded-[8px] border border-gold-300 bg-white p-4"><p className="flex items-center gap-2 font-semibold"><Bot className="size-5 text-gold-600" />AI ASSISTS</p><p className="text-[0.6875rem] text-ink-500">AI supports speed, pattern recognition and drafting.</p><CheckList tone="gold" className="mt-2" items={['Data extraction & cleaning', 'Pattern detection & anomaly flags', 'Benchmarking & trend analysis', 'Draft summaries & insights', 'Visualisations & dashboards', 'Report structuring & drafting']} /><p className="mt-2 rounded bg-gold-50 p-2 text-[0.6875rem]">AI does not make decisions. Humans apply judgement, approve findings and take responsibility.</p></div>
                        <div className="rounded-[8px] border border-gold-300 bg-white p-4"><p className="flex items-center gap-2 font-semibold"><User className="size-5 text-gold-600" />HUMAN LEADS</p><p className="text-[0.6875rem] text-ink-500">Humans lead judgement, accountability and professional review.</p><CheckList className="mt-2" items={['Scope validation & materiality', 'Risk judgement & interpretation', 'Recommendations & strategy', 'Quality assurance & challenge', 'Client communication', 'Final approval & sign-off']} /><p className="mt-2 rounded bg-gold-50 p-2 text-[0.6875rem]">Human responsibility. Human approval. Client confidence.</p></div>
                    </section>
                    <section className="space-y-3 xl:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-3">
                            <p className="text-sm font-semibold">FEE POSITION (ZAR)</p>
                            <table className="mt-2 w-full text-[0.6875rem]"><tbody className="divide-y divide-parchment-200">{Object.values(ledgers).map((l) => <tr key={l.ledger}><td className="py-1 font-bold">{l.ledger}</td><td>{l.name}</td><td className="text-right">{l.ledger === 'C' ? 'Not applicable' : l.lines.length ? zar(l.lines.reduce((s, x) => s + x.expected, 0)) : 'Quote required'}</td></tr>)}</tbody></table>
                            <p className="mt-1 text-[0.625rem] text-ink-500">All amounts in ZAR. No combined total shown. Terms per engagement letter.</p>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-3">
                            <p className="text-sm font-semibold">EARNING SCHEDULE</p>
                            <table className="mt-2 w-full text-[0.625rem]"><thead className="text-ink-500"><tr><th className="text-left">Milestone</th><th>Logic</th><th>Amount</th><th>Status</th></tr></thead><tbody className="divide-y divide-parchment-200">{earning.map((e) => <tr key={e.milestone}><td className="py-1">{e.milestone}<br /><span className="text-ink-400">{e.event}</span></td><td className="text-center">{e.pct}% of T</td><td className="text-center">{zar(e.amount)}</td><td className="text-center text-attested-700">{e.status}</td></tr>)}</tbody></table>
                            <p className="mt-1 text-[0.625rem] text-ink-500">Earnings occur only on approved events. No earnings without client approval.</p>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-3 text-[0.6875rem]">
                            <p className="text-sm font-semibold">AVAILABLE STOP POINTS</p>
                            <ul className="mt-1 space-y-1"><li><b>Before M1</b> — Planning & Mobilisation · Project Plan, Data Request List · Pro-rata credit possible</li><li><b>After M2</b> — Data Collection · Cleaned Data Pack · Pro-rata credit possible</li><li><b>After M3</b> — Analysis Completed · Draft Findings & Working Papers · Pro-rata credit possible</li></ul>
                            <p className="mt-1 text-ink-500">Stopping will not affect rights to completed and paid-for work products.</p>
                        </div>
                        <div className="rounded-[8px] border border-risk-500/40 bg-risk-50 p-3 text-[0.6875rem] text-risk-700"><p className="flex items-center gap-1 font-bold"><TriangleAlert className="size-4" />MATERIAL CHANGE WARNING</p>Any change to scope, price, people, duration, external commitment, allowance, earning schedule, or permission state requires renewed approval.</div>
                    </section>
                    <section className="flex flex-col gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-12">
                        <div className="grid gap-3 md:grid-cols-4">
                            <div className="rounded border border-parchment-400 p-3 text-xs"><p className="font-semibold">{ready || approved ? 'SERVER AUTHORISED' : 'PRE-APPROVAL CHECKS'}</p><ul className="mt-1 space-y-0.5">{checks.map((c) => <li key={c.label} className="flex items-center gap-1"><StatusDot state={c.ok ? 'ok' : 'bad'} />{c.label}</li>)}</ul></div>
                            <button type="button" disabled={!ready || form.processing} onClick={() => decide('approve')} className={cn('flex items-center gap-3 rounded-[8px] p-4 text-left', ready ? 'bg-gold-500 text-ink-900 hover:bg-gold-400' : 'cursor-not-allowed bg-parchment-300 text-ink-500')}>
                                {ready ? <CheckCircle2 className="size-7" /> : <Lock className="size-7" />}<span><b className="block">Approve Method Card</b><span className="text-xs">Proceed to paid work</span></span>
                            </button>
                            <button type="button" disabled={gate?.status !== 'pending'} onClick={() => decide('change')} className="flex items-center gap-3 rounded-[8px] border border-parchment-500 p-4 text-left disabled:opacity-50"><FilePen className="size-7" /><span><b className="block">Request Change</b><span className="text-xs">Request adjustments to method</span></span></button>
                            <button type="button" disabled={gate?.status !== 'pending'} onClick={() => decide('decline')} className="flex items-center gap-3 rounded-[8px] border border-parchment-500 p-4 text-left disabled:opacity-50"><Ban className="size-7" /><span><b className="block">Decline Stage</b><span className="text-xs">Do not proceed with this stage</span></span></button>
                        </div>
                        <label className="text-xs">Note for change request (optional)<Textarea value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} className="mt-1 min-h-14" /></label>
                        {Object.values(form.errors).map((e) => <p key={e} className="text-xs text-risk-600">{e}</p>)}
                        <div className="flex items-center justify-between text-xs"><span>Gate G1: <StatusPill status={gate?.status ?? 'locked'} /></span><span className="rounded bg-gold-50 px-2 py-1">Paid work begins only after your explicit approval.</span></div>
                        {approved && <Link href={`/project-advisory/workspace/${m.reference}/engagement-letter`} className="text-sm font-semibold text-gold-700 underline">Continue to Engagement Letter →</Link>}
                    </section>
                </div>
            )}
        </div>
    );
}
