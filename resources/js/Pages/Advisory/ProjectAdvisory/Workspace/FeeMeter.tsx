import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { Card, CheckList, KV, LedgerBadge, PageTitle, zar } from '@/Components/Advisory/ui';
import type { MandateView } from '@/types/advisory';

interface Row { ledger: string; name: string; paid: number; approved: number; committed: number; pending: number; uncommitted: number; potential: number }
interface Props { mandate: MandateView; rows: Row[]; nextGate: { code: string; name: string; binds: string; amount: number; due: string | null } | null; cap: number }

const SEG: [keyof Row, string, string][] = [['paid', 'Paid', 'bg-verified-500'], ['approved', 'Approved, Not Paid', 'bg-gold-500'], ['committed', 'Committed (Estimated)', 'bg-controlled-500'], ['pending', 'Pending Approval', 'bg-referenced-500'], ['uncommitted', 'Not Committed', 'bg-ink-300']];

export default function FeeMeter({ mandate: m, rows, nextGate, cap }: Props) {
    return (
        <div className="container-tbca py-8">
            <Head title="Live Fee Meter" />
            <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: m.reference, href: `/project-advisory/workspace/${m.reference}` }, { label: 'Live Fee Meter' }]} title="Live Fee Meter" tag={<span className="mb-1 inline-block rounded bg-controlled-50 px-2 text-xs text-controlled-700">Real-time</span>} sub={<><p className="font-semibold text-gold-700">See it. Understand it. Approve it.</p><p>Transparent, real-time view of all approved, estimated and payable amounts for this engagement. You approve before we commit. You control every gate.</p></>} actions={<ButtonLink href={`/project-advisory/workspace/${m.reference}`} variant="outline">← Back to Project</ButtonLink>} />
            <PaWorkspaceNav reference={m.reference} />
            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card title="Engagement Summary"><KV rows={[['Project Name', m.project], ['Engagement Route', m.route.replace('-', ' ')], ['Engagement ID', m.reference], ['Status', m.status], ['Stage', m.stage]]} /></Card>
                        <Card title="Settlement Model"><KV rows={[['Model', 'Fixed + Actuals + Contingent (Cap)'], ['Contingent Cap', zar(cap)], ['Cap Progress', '0%'], ['Currency', 'ZAR'], ['Tax Treatment', 'VAT Exclusive']]} /></Card>
                        <Card title="Legend">
                            <ul className="space-y-1 text-xs">{SEG.map(([, l, c]) => <li key={l} className="flex items-center gap-2"><span className={`size-3 rounded-sm ${c}`} />{l}</li>)}</ul>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Each ledger is metered on its own. There is no combined engagement total across ledgers.</p>
                        </Card>
                    </div>
                    <Card title="Engagement Fee Breakdown (per ledger)">
                        <div className="space-y-4">
                            {rows.map((r) => {
                                const total = r.paid + r.approved + r.committed + r.pending + r.uncommitted;
                                return (
                                    <div key={r.ledger}>
                                        <div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 text-sm font-semibold"><LedgerBadge l={r.ledger} size="sm" />{r.name}</p><p className="text-xs">{r.ledger === 'C' ? <>Potential (not payable): <b>{zar(r.potential)}</b></> : <>Ledger {r.ledger} position: <b>{zar(total)}</b></>}</p></div>
                                        {r.ledger !== 'C' && (
                                            <>
                                                <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-parchment-300" role="img" aria-label={`${r.name} composition`}>
                                                    {SEG.map(([k, , c]) => (total ? <span key={k} className={c} style={{ width: `${((r[k] as number) / total) * 100}%` }} /> : null))}
                                                </div>
                                                <div className="mt-1 grid grid-cols-5 gap-2 text-[0.6875rem]">{SEG.map(([k, l]) => <div key={k}><p className="text-ink-500">{l}</p><p className="font-semibold">{zar(r[k] as number)}</p></div>)}</div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-[0.6875rem] text-ink-500">All amounts are VAT exclusive unless stated otherwise. Estimations are based on current scope and vendor quotes.</p>
                    </Card>
                    <div className="flex flex-wrap gap-3"><button type="button" onClick={() => window.print()} className="rounded border border-gold-500 px-4 py-2 text-sm">Download Fee Statement (PDF)</button><Link href={`/project-advisory/workspace/${m.reference}/settlement`} className="rounded border border-ink-300 px-4 py-2 text-sm">View Payment & Invoice History</Link></div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="What's Included in Every Amount"><CheckList tone="gold" items={['What service or output this amount buys', 'Who receives the amount', 'When it becomes payable', 'Whether the amount is Fixed, Estimated, Metered, Quote-on-Trigger or Contingent', 'What happens if you decline', 'References to supporting documents and gates']} /></Card>
                    <Card title="Need Help Understanding?" tone="gold"><p className="text-xs text-ink-600">Speak to a TBCA Advisor to explain any fee, item or commitment.</p><ButtonLink href={`/project-advisory/workspace/${m.reference}`} size="sm" className="mt-2 w-full">Speak to an Advisor</ButtonLink></Card>
                    <Card title="Next Gate Requiring Your Approval">
                        {nextGate ? (
                            <>
                                <KV rows={[['Gate', `${nextGate.code} - ${nextGate.name}`], ['Binds', nextGate.binds], ['Amount Pending Approval', zar(nextGate.amount)], ['Expires', nextGate.due ?? '—']]} />
                                <ButtonLink href={`/project-advisory/workspace/${m.reference}?gate=1`} className="mt-3 w-full bg-verified-500 text-white" trailingIcon="arrow-right">Review & Approve Gate</ButtonLink>
                            </>
                        ) : <p className="flex items-center gap-1.5 text-xs text-ink-500"><CheckCircle2 className="size-4 text-verified-500" />No gate is awaiting your approval.</p>}
                    </Card>
                </aside>
            </div>
        </div>
    );
}
