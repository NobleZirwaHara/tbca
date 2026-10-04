import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, Info, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { Card, CheckList, KV, LedgerBadge, PageTitle, zar } from '@/Components/Advisory/ui';
import type { LedgerSummary, MandateView } from '@/types/advisory';

interface Props { mandate: MandateView; ledgers: Record<string, LedgerSummary>; stop: { position: string; date: string; resume: string | null } }

export default function Ledger({ mandate: m, ledgers, stop }: Props) {
    const [open, setOpen] = useState<string | null>(null);
    const [explain, setExplain] = useState(true);
    const list = Object.values(ledgers);
    const deliverables = (m.meta.deliverables ?? []).filter((d) => ['Ready for Review', 'Approved', 'In Review', 'Delivered'].includes(d.status));
    return (
        <div className="container-tbca py-8">
            <Head title="Fee Transparency Ledger" />
            <PageTitle
                crumbs={[{ label: 'Client Portal', href: '/project-advisory/workspace' }, { label: 'Project Advisory', href: '/project-advisory' }, { label: m.reference, href: `/project-advisory/workspace/${m.reference}` }, { label: 'Fee Transparency Ledger' }]}
                tag={<span className="mb-1 inline-block rounded bg-gold-500 px-2 py-0.5 text-xs font-semibold">Project Advisory</span>}
                title="Fee Transparency Ledger"
                sub="Every amount is shown by separate ledger, recipient, payer, basis, certainty and status."
                actions={<><ButtonLink href={`/project-advisory/workspace/${m.reference}/method-card`} variant="outline" size="sm">View Earning Schedule</ButtonLink><Button variant="outline" size="sm" icon="download" onClick={() => window.print()}>Export Fee Register</Button></>}
            />
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs sm:grid-cols-4 lg:grid-cols-7">
                {[['Organization', m.organisation], ['Engagement ID', m.reference], ['Country', m.country], ['Sector', m.sector], ['Current Stage', m.stage_name], ['Current Gate', m.gate ?? '—'], ['Last Updated', <span className="inline-flex items-center gap-1">Live <RefreshCw className="size-3" /></span>]].map(([k, v]) => <div key={k as string}><p className="text-ink-500">{k}</p><p className="font-semibold">{v}</p></div>)}
            </div>
            <PaWorkspaceNav reference={m.reference} />
            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-3 xl:col-span-9">
                    {list.map((l) => (
                        <section key={l.ledger} className="rounded-[8px] border border-parchment-400 bg-white">
                            <div className="grid items-center gap-3 p-3 text-xs md:grid-cols-12">
                                <div className="flex items-center gap-3 md:col-span-3"><LedgerBadge l={l.ledger} size="lg" /><div><p className="font-serif text-lg font-semibold">{l.name}</p><p className="text-ink-500">Recipient: {l.recipient}</p></div></div>
                                <div className="md:col-span-1"><p className="text-ink-500">Payer</p><p>{l.payer}</p></div>
                                <div className="md:col-span-1"><StatusPill status={l.status} /></div>
                                <dl className="grid grid-cols-5 gap-2 md:col-span-4">
                                    {[['Paid', l.paid], ['Earned', l.earned], [l.ledger === 'C' ? 'Unearned (Potential)' : 'Unearned', l.unearned], ['Creditable', l.creditable], ['Refundable', l.refundable]].map(([k, v]) => <div key={k as string}><dt className="text-ink-500">{k as string}</dt><dd className="font-semibold">{zar(v as number)}</dd></div>)}
                                </dl>
                                <div className="md:col-span-2"><p className="text-ink-500">Next Milestone</p><p className="truncate">{l.next_milestone ?? '—'}</p><p className="text-ink-500">Next approved due: <b className="text-ink-900">{l.ledger === 'C' ? 'Not Applicable' : l.next_due ? zar(l.next_due) : l.ledger === 'X' ? 'Quote Required' : 'R0'}</b>{l.due_date && ` · ${l.due_date}`}</p></div>
                                <div className="md:col-span-1"><button type="button" onClick={() => setOpen(open === l.ledger ? null : l.ledger)} aria-expanded={open === l.ledger} className="inline-flex items-center gap-1 rounded border border-parchment-500 px-2 py-1">View Details <ChevronDown className="size-3" /></button></div>
                            </div>
                            {l.ledger === 'C' && <p className="mx-3 mb-3 flex items-center gap-1.5 rounded bg-attested-50 px-2 py-1 text-xs text-attested-700"><TriangleAlert className="size-3.5" />Potential exposure only. Not currently payable unless valid crystallisation trigger is evidenced and approved.</p>}
                            {open === l.ledger && (
                                <div className="border-t border-parchment-300 p-3">
                                    <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Item</th><th className="text-left">Basis</th><th>Certainty</th><th>Gate</th><th className="text-right">Low / Expected / High</th><th>Status</th></tr></thead>
                                        <tbody className="divide-y divide-parchment-200">{l.lines.map((x) => <tr key={x.id}><td className="py-1">{x.item}</td><td>{x.basis}</td><td className="text-center capitalize">{x.certainty.replace(/_/g, ' ')}</td><td className="text-center">{x.gate}</td><td className="text-right">{x.low === x.high ? zar(x.expected) : `${zar(x.low)} / ${zar(x.expected)} / ${zar(x.high)}`}</td><td className="text-center"><StatusPill status={x.status} /></td></tr>)}</tbody></table>
                                </div>
                            )}
                        </section>
                    ))}
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-3">
                        <div className="flex justify-between"><p className="text-sm font-semibold">Why is this amount here?</p><button type="button" className="text-xs underline" onClick={() => setExplain(!explain)}>{explain ? 'Hide explanations' : 'Show explanations'}</button></div>
                        {explain && <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{list.map((l) => { const x = l.lines[0]; return <div key={l.ledger} className="rounded border border-parchment-400 p-2 text-[0.6875rem]"><p className="flex items-center gap-1.5 font-semibold"><LedgerBadge l={l.ledger} size="sm" />{x?.item ?? l.name}<Info className="ml-auto size-3" /></p><p className="mt-1 text-ink-600">{x ? `${x.basis}. Payable to ${x.recipient}.` : 'No items yet.'}</p>{x && <StatusPill status={x.status} />}</div>; })}</div>}
                    </section>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="If I Stop Now">
                        <KV rows={[['Current stop position', stop.position], ['Last safe stop date', stop.date], ['Resume from', stop.resume ?? '—']]} />
                        <p className="mt-3 text-xs font-semibold">Portable work product</p>
                        <CheckList items={deliverables.length ? deliverables.map((d) => d.name) : ['Diagnostics report (on approval)']} />
                        <p className="mt-3 text-xs font-semibold">Credits / refunds snapshot</p>
                        <KV rows={[...list.filter((l) => l.creditable > 0).map((l) => [`Creditable (${l.ledger})`, zar(l.creditable)] as [string, string]), ['Refundable', zar(list.reduce((s, l) => s + l.refundable, 0))]]} />
                        <p className="mt-3 text-xs font-semibold">Current approvals</p>
                        <ul className="list-disc pl-4 text-xs">{list.map((l) => <li key={l.ledger}>{l.ledger}: {l.lines.some((x) => ['approved', 'paid', 'invoiced'].includes(x.status)) ? 'Approved' : l.ledger === 'C' ? 'Conditional' : 'Pending'}</li>)}</ul>
                        <p className="mt-3 rounded bg-parchment-200 p-2 text-[0.6875rem]">Payment verification and approval are separate controls. Amounts shown are not payable unless approved.</p>
                        <ButtonLink href={`/project-advisory/workspace/${m.reference}`} className="mt-3 w-full">Review Stop Position</ButtonLink>
                        <Button variant="outline" className="mt-2 w-full" onClick={() => openAskQuestion({ subject: `Line item question — ${m.reference}`, section: 'advisory' })}>Ask About a Line Item</Button>
                        <Button variant="outline" className="mt-2 w-full" onClick={() => window.print()}>Download Stop Package</Button>
                        <Link href={`/project-advisory/workspace/${m.reference}/settlement`} className="mt-2 block text-center text-xs underline">Go to Settlement Centre</Link>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
