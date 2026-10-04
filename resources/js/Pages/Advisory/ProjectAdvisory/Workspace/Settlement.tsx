import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, CircleAlert, ExternalLink } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { CheckList, LedgerBadge, PageTitle, zar } from '@/Components/Advisory/ui';
import type { LedgerSummary, MandateEventRow, MandateLineRow, MandateView } from '@/types/advisory';

interface Props { mandate: MandateView; events: MandateEventRow[]; ledgers: Record<string, LedgerSummary> }

const SUB: Record<string, string> = { T: 'TBCA professional invoice', P: 'TBCA platform invoice', X: 'provider invoice', S: 'authority assessment', C: 'separate TBCA contingent invoice, only after valid crystallisation' };

function payable(l: LedgerSummary): MandateLineRow | undefined {
    return l.lines.find((x) => ['approved', 'invoiced'].includes(x.status)) ?? l.lines.find((x) => ['paid', 'direct_paid'].includes(x.status));
}

export default function Settlement({ mandate: m, events, ledgers }: Props) {
    const [proof, setProof] = useState<Record<number, string>>({});
    const pay = (x: MandateLineRow) => router.post(`/project-advisory/workspace/${m.reference}/lines/${x.id}/pay`);
    const direct = (x: MandateLineRow) => router.post(`/project-advisory/workspace/${m.reference}/lines/${x.id}/direct`, { proof: proof[x.id] ?? '' }, { preserveScroll: true });
    return (
        <div className="container-tbca py-8">
            <Head title="Split Settlement Centre" />
            <PageTitle
                crumbs={[{ label: 'Client Portal', href: '/project-advisory/workspace' }, { label: 'Project Advisory', href: '/project-advisory' }, { label: `Engagement ${m.reference}`, href: `/project-advisory/workspace/${m.reference}` }, { label: 'Settlement Centre' }]}
                title="Split Settlement Centre"
                sub="Payable items are presented by separate ledger and recipient. No combined checkout total exists."
                actions={<><Button variant="outline" size="sm" icon="download" onClick={() => window.print()}>Download Settlement Pack</Button><Button variant="outline" size="sm" onClick={() => openAskQuestion({ subject: `Billing question — ${m.reference}`, section: 'advisory' })}>Ask a Billing Question</Button></>}
            />
            <PaWorkspaceNav reference={m.reference} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {Object.values(ledgers).map((l) => {
                    const x = payable(l);
                    const due = x && ['approved', 'invoiced'].includes(x.status);
                    return (
                        <article key={l.ledger} className="flex flex-col rounded-[8px] border border-gold-300/60 bg-white p-4 text-xs">
                            <div className="flex gap-3"><LedgerBadge l={l.ledger} size="lg" /><div><p className="text-sm font-semibold">{l.ledger} {l.name}</p><p className="text-ink-500">{SUB[l.ledger]}</p></div></div>
                            <dl className="mt-3 flex-1 space-y-1.5">
                                {[['Document', x?.invoice ?? '—'], ['Item', x?.item ?? '—'], ['Amount', zar(x?.expected ?? 0)], ['Tax (VAT 15%)', l.ledger === 'X' ? 'Included' : x ? zar(x.vat) : '—'], ['Payer', l.payer], ['Recipient', x?.recipient ?? l.recipient], ['Due date', x?.due ?? '—'], ['Payment route', x?.route ?? (l.ledger === 'C' ? '—' : 'Secure Portal Payment')], ['Evidence', x?.evidence ?? (l.ledger === 'C' ? 'No Trigger Evidence' : l.ledger === 'S' ? 'No Charge Incurred' : '—')]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
                                <div className="flex justify-between"><dt className="text-ink-500">Status</dt><dd><StatusPill status={x ? (due ? (l.ledger === 'X' ? 'Awaiting Direct Payment' : 'Due') : x.status) : l.ledger === 'C' ? 'Not Triggered' : 'None Incurred'} /></dd></div>
                            </dl>
                            <div className="mt-3">
                                {due && (l.ledger === 'T' || l.ledger === 'P') && (x.order && x.status === 'invoiced' ? <Button size="sm" className="w-full" onClick={() => router.visit(`/checkout/${x.order}`)}>Complete payment</Button> : <Button size="sm" className="w-full" onClick={() => pay(x)}>Pay via secure portal</Button>)}
                                {due && l.ledger === 'X' && (
                                    <div className="space-y-1.5">
                                        <label className="sr-only" htmlFor={`proof-${x.id}`}>Proof of payment reference</label>
                                        <Input id={`proof-${x.id}`} placeholder="Provider payment reference" value={proof[x.id] ?? ''} onChange={(e) => setProof({ ...proof, [x.id]: e.target.value })} className="h-9" />
                                        <Button size="sm" variant="outline" className="w-full" onClick={() => direct(x)}>Record direct payment</Button>
                                    </div>
                                )}
                                {!due && (l.ledger === 'S' || l.ledger === 'C' || !x) && <p className="flex items-center gap-1.5 rounded border border-parchment-400 p-2 text-ink-500"><CircleAlert className="size-3.5" />No current payable item{l.ledger === 'C' && ' — contingent invoice issued only after valid crystallisation evidence.'}</p>}
                                {x && ['paid', 'direct_paid'].includes(x.status) && <p className="flex items-center gap-1.5 text-verified-700"><CheckCircle2 className="size-3.5" />Settled {x.order ? <a href={`/checkout/${x.order}/confirmation`} className="inline-flex items-center gap-0.5 underline">receipt<ExternalLink className="size-3" /></a> : ''}</p>}
                            </div>
                        </article>
                    );
                })}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-3"><p className="text-sm font-semibold">Settlement Controls</p><CheckList className="mt-2" items={['Separate invoices', 'Separate recipients', 'No combined checkout', 'Evidence-linked settlement', 'Human review where required']} /></section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs text-ink-700 lg:col-span-4"><p className="text-sm font-semibold">Payment Guidance</p><p className="mt-2">External provider and statutory payments may route outside TBCA. Each payable item remains attached to its own evidence, ledger, and recipient. TBCA invoices (T, P, C) are payable via secure channels. Provider invoices (X) are settled directly with the provider. Statutory items (S) are paid to the relevant authority only when incurred.</p></section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-5"><p className="text-sm font-semibold">Activity / Audit Trail</p><ul className="mt-2 space-y-1 text-xs">{events.slice(0, 6).map((e, i) => <li key={i} className="grid grid-cols-12 gap-2"><span className="col-span-4 text-ink-500">{e.at}</span><span className="col-span-5">{e.event}</span><span className="col-span-3 truncate font-mono text-ink-400">{e.ref ?? e.actor}</span></li>)}</ul></section>
            </div>
        </div>
    );
}
