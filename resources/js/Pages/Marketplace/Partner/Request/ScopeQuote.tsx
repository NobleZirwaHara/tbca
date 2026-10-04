import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CircleDollarSign, Download, ExternalLink, Info, Lock, MessageSquare } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { Field, Textarea } from '@/Components/ui/Form';
import { Card, InfoRows, Notice } from '@/Components/Marketplace/ui';
import { PsBody, money } from '@/Components/Marketplace/PartnerKit';
import PsJourneyHeader from '@/Components/Marketplace/PsJourneyHeader';
import type { MkPartnerRequest, PartnerQuote } from '@/types/marketplace';

export default function ScopeQuote({ request: r, journey }: { request: MkPartnerRequest; journey: string[] }) {
    const q = r.quote as PartnerQuote;
    const [clarify, setClarify] = useState(false);
    const [msg, setMsg] = useState('');
    const blocked = q.floor_status !== 'PASS';
    const proScope = (q.scope ?? r.meta.proposal?.deliverables ?? '').split(/;|\n/).map((s: string) => s.trim()).filter(Boolean);
    const rows: [string, string, string, number, string, 'good' | 'warn' | 'info' | 'neutral'][] = [
        ['T – TBCA Coordination Fee', 'Project coordination, admin, QA and reporting.', 'TBCA', q.t, 'Confirmed', 'good'],
        ['P – Professional Fee', 'Professional services as per scope in Section B.', r.partner?.name ?? 'Professional', q.p, 'Proposed', 'warn'],
        ['X – Disbursements', 'Third-party costs (studies, permits, travel, etc.).', 'Third Parties', q.x, 'Estimated', 'warn'],
        ['S – VAT', 'Value Added Tax @ 15% (indicative)', 'SARS', q.s, 'Indicative', 'info'],
        ['C – Credits / Adjustments', 'Not applicable at this stage.', 'N/A', q.c, 'N/A', 'neutral'],
    ];

    return (
        <>
            <Head title={`Scope & Quote – ${r.reference}`} />
            <PsBody>
                <PsJourneyHeader request={r} journey={journey} code="PS-011" title="Scope & Quote" crumb="Scope & Quote" step={5} lead="Review and confirm the scope, commercial components and proposed fees before engaging."
                    responsibility={<><p>Review the scope and commercial details carefully. Confirm accuracy before accepting and proceeding to the engagement instrument.</p><p>No payment is required at this stage.</p></>}
                    refRows={[['Requested On', r.requestedOn], ['Requested By', r.clientName], ['Service Category', r.listing?.title ?? r.title], ['Estimated Timeline', r.meta.proposal?.timeline ?? '—']]} />
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        <div className="grid gap-5 md:grid-cols-2">
                            <Card title="A. TBCA Scope (Our Deliverables)">
                                <p className="mb-2 text-xs text-ink-500">What TBCA will do as part of this engagement.</p>
                                <ul className="list-disc space-y-1 pl-4 text-sm text-ink-700">{['Initiate and manage engagement administration.', 'Coordinate partner professional deliverables and communication.', 'Provide document management and secure data room access.', 'Quality assurance and delivery oversight.', 'Consolidated reporting and issue management.'].map((x) => <li key={x}>{x}</li>)}</ul>
                            </Card>
                            <Card title="B. Professional Scope (Partner Deliverables)">
                                <p className="mb-2 text-xs text-ink-500">What the professional will do. Provided by {r.partner?.name}.</p>
                                <ul className="list-disc space-y-1 pl-4 text-sm text-ink-700">{proScope.map((x: string) => <li key={x}>{x}</li>)}</ul>
                                {q.source === 'partner' && <p className="mt-2 text-xs text-verified-700">Partner quote submitted.</p>}
                            </Card>
                        </div>
                        <Card title="C. Commercial Components">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] text-[0.8125rem]">
                                    <thead className="text-xs text-ink-500"><tr>{['Component', 'Description', 'Provider', 'Amount (ZAR)', 'Status'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-parchment-300">{rows.map(([c, d, p, a, s, t]) => <tr key={c}><td className="py-2 font-medium">{c}</td><td className="py-2 text-ink-600">{d}</td><td className="py-2">{p}</td><td className="py-2 text-right">{money(a)}</td><td className="py-2 pl-3"><StatusPill status={s} tone={t} /></td></tr>)}</tbody>
                                </table>
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-[6px] border border-gold-400 bg-gold-50 px-4 py-3"><span className="flex items-center gap-2 font-serif text-lg font-bold"><CircleDollarSign className="size-5" aria-hidden="true" />Indicative Total (T + P + X + S – C)</span><span className="text-xl font-bold">{money(q.total)} <span className="text-xs font-normal">ZAR (Including VAT)</span></span></div>
                            <p className="mt-2 text-xs text-ink-500">Final amounts will be confirmed in the Engagement Instrument. All amounts are ZAR.</p>
                        </Card>
                        {blocked && <Notice tone="bad">BELOW-FLOOR BLOCKED: T + P ({money(q.t + q.p)}) is below the current Partner Services floor of {money(q.floor)}. New quotes below the floor are automatically blocked and must be remediated before you can proceed.</Notice>}
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        <Card title="D. Commercial Manifest">
                            <InfoRows dense rows={[['Fee Mechanism (M)', r.feeMechanism], ['Arrangement (A)', r.arrangement], ['Payer', r.clientName], ['Recipient of P Fee', r.partner?.name], ['Quote Validity', q.validity ?? '30 days'], ['Currency', 'ZAR'], ['Pricing Basis', q.basis]]} />
                        </Card>
                        <Card tone="blue"><p className="flex items-center gap-2 font-semibold"><Info className="size-4" aria-hidden="true" />IMPORTANT</p><p className="mt-1 text-sm text-ink-700">This quote is indicative and subject to the terms of the engagement instrument. No work will commence until the engagement has been executed.</p></Card>
                    </aside>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/partner-services/requests/${r.reference}/proposal`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back: Partner Proposal &amp; Acceptance</Link>
                    <Button type="button" variant="outline" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" />Download Quote Summary PDF</Button>
                    <Button type="button" variant="outline" onClick={() => setClarify(true)}><MessageSquare className="size-4" aria-hidden="true" />Request Clarification</Button>
                    <div className="ml-auto text-center">
                        <Button type="button" size="lg" disabled={blocked} onClick={() => router.post(`/partner-services/requests/${r.reference}/scope-quote`, { action: 'accept' })} trailingIcon="arrow-right">Accept Scope &amp; Proceed</Button>
                        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500"><Lock className="size-3" aria-hidden="true" />Next: Engagement Instrument</p>
                    </div>
                </div>
                <a href="/partner-services/professional-limitation-notice" className="inline-flex items-center gap-1 text-xs text-gold-700">Professional Limitation Notice <ExternalLink className="size-3" aria-hidden="true" /></a>
            </PsBody>
            <Modal open={clarify} onClose={() => setClarify(false)} title="Request Clarification" footer={<><Button variant="outline" size="sm" type="button" onClick={() => setClarify(false)}>Cancel</Button><Button size="sm" type="button" disabled={msg.trim().length < 3} onClick={() => router.post(`/partner-services/requests/${r.reference}/scope-quote`, { action: 'clarify', message: msg }, { onSuccess: () => setClarify(false) })}>Send</Button></>}>
                <Field label="Your question about the scope or quote" required>{(id) => <Textarea id={id} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={1000} />}</Field>
            </Modal>
        </>
    );
}
