import { Head, Link, useForm } from '@inertiajs/react';
import { CircleCheck, Clock, Download, FileText, Info, Lock, MessageSquare, X } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, InfoRows } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import PsJourneyHeader from '@/Components/Marketplace/PsJourneyHeader';
import type { MkPartnerRequest, PartnerQuote } from '@/types/marketplace';

interface Props { request: MkPartnerRequest; journey: string[]; capacities: string[]; user: { name: string; email: string } }

const DOCS = [['Engagement Instrument (Draft)', 'Contract between client, TBCA and professional.'], ['Scope & Quote Summary', 'Scope and commercial manifest (T / P / X / S / C).'], ['Who Is Responsible for What', 'Matter-specific responsibility statement.'], ['Professional Limitation Notice', 'Boundary and limitation Notice.'], ['Conflict Check Result', 'Conflict clearance confirmation.'], ['Partner Proposal', 'Professional proposal and firm profile.']];

export default function Instrument({ request: r, journey, capacities, user }: Props) {
    const q = r.quote as PartnerQuote;
    const form = useForm({ full_name: user.name, capacity: '', email: user.email, date: new Date().toISOString().slice(0, 10), signature: '' });
    const p = r.meta.proposal ?? {};

    return (
        <>
            <Head title={`Engagement Instrument & Signature – ${r.reference}`} />
            <PsBody>
                <PsJourneyHeader request={r} journey={journey} code="PS-012" title="Engagement Instrument & Signature" crumb="Engagement Instrument & Signature" step={6}
                    lead="Review and execute the engagement instrument to formally appoint the professional and confirm authority."
                    responsibility={<><p>You must review all documents carefully and sign on behalf of the client with appropriate authority before we can proceed.</p><p>No work will commence until the engagement is executed.</p></>} />
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
                            <Card title="A. Engagement Documents">
                                <p className="-mt-2 mb-2 text-xs text-ink-500">Please review all documents. Download full versions for your records.</p>
                                <table className="w-full text-xs"><thead className="text-ink-500"><tr>{['Document', 'Description', 'Version', 'Date', 'Action'].map((h) => <th key={h} scope="col" className="pb-1 text-left font-medium">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-parchment-300">{DOCS.map(([d, s]) => <tr key={d}><td className="py-1.5 font-medium"><FileText className="mr-1 inline size-3.5" aria-hidden="true" />{d}</td><td className="py-1.5 text-ink-600">{s}</td><td>v1.0</td><td>{r.requestedOn}</td><td><button type="button" onClick={() => window.print()} className="rounded border border-gold-500 px-1.5 text-gold-800">View / Download</button></td></tr>)}</tbody></table>
                                <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" />Download All Documents (ZIP)</Button>
                            </Card>
                            <Card title="B. Contracting Parties">
                                <p className="-mt-2 mb-2 text-xs text-ink-500">This engagement is arranged under {r.arrangement}.</p>
                                <ul className="space-y-2 text-xs">
                                    <li className="rounded border border-parchment-300 p-2"><p className="font-semibold">Client (Authority to Contract)</p><p>{r.clientName}</p></li>
                                    <li className="rounded border border-parchment-300 p-2"><p className="font-semibold">TBCA (Arranger &amp; Coordinator)</p><p>The Business Clinic.Africa (Pty) Ltd · Registration: 2018/256344/07</p><p>Role: Project Coordinator, QA and Reporting</p></li>
                                    <li className="rounded border border-parchment-300 p-2"><p className="font-semibold">Professional (Performer)</p><p>{r.partner?.name}</p><p>Lead Professional: {p.lead} · {p.professional_registration}</p></li>
                                </ul>
                            </Card>
                        </div>
                        <form id="sign" onSubmit={(e) => { e.preventDefault(); form.post(`/partner-services/requests/${r.reference}/engagement-instrument`); }}>
                            <Card title="D. Authorised Signature">
                                <p className="-mt-2 mb-3 text-xs text-ink-500">Sign on behalf of the client to execute the engagement.</p>
                                <div className="grid gap-3 md:grid-cols-4">
                                    <Field label="Full Name" required error={form.errors.full_name}>{(id) => <Input id={id} value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} />}</Field>
                                    <Field label="Capacity" required error={form.errors.capacity}>{(id) => <Select id={id} value={form.data.capacity} options={capacities} placeholder="Select" onChange={(e) => form.setData('capacity', e.target.value)} />}</Field>
                                    <Field label="Email" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                                    <Field label="Date" required error={form.errors.date}>{(id) => <Input id={id} type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />}</Field>
                                </div>
                                <Field label="Signature (type your full name)" required className="mt-3" error={form.errors.signature}>
                                    {(id) => <div className="relative"><Input id={id} value={form.data.signature} onChange={(e) => form.setData('signature', e.target.value)} className="h-16 font-serif text-2xl italic" />{form.data.signature && <button type="button" onClick={() => form.setData('signature', '')} className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 text-xs text-ink-500"><X className="size-3.5" aria-hidden="true" />Clear</button>}</div>}
                                </Field>
                                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" />Once signed, the engagement will be locked and a countersigned copy will be issued to all parties.</p>
                            </Card>
                        </form>
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        <Card title="C. Key Terms (Summary)"><InfoRows dense rows={[['Arrangement (A)', r.arrangement], ['Fee Mechanism (M)', r.feeMechanism], ['Payer', r.clientName], ['Recipient of P Fee', r.partner?.name], ['Quote Validity', q.validity], ['Currency', 'ZAR'], ['Governing Law', 'Republic of South Africa'], ['Jurisdiction', 'South African Courts']]} /></Card>
                        <Card tone="blue"><p className="flex items-center gap-2 font-semibold"><Info className="size-4" aria-hidden="true" />IMPORTANT</p><p className="mt-1 text-sm text-ink-700">By signing, you confirm you have read and understood the documents, the scope, commercial terms and the responsibility matrix and that you have authority to bind the client.</p></Card>
                        <Card title="E. Next Steps"><ul className="space-y-2 text-sm text-ink-700"><li className="flex gap-2"><CircleCheck className="size-4 text-verified-500" aria-hidden="true" />After signature, the responsibility statement is confirmed and payment instructions are issued.</li><li className="flex gap-2"><Clock className="size-4" aria-hidden="true" />Once payment is confirmed, the professional will commence.</li><li className="flex gap-2"><FileText className="size-4" aria-hidden="true" />All executed documents will be available in your Client Portal.</li></ul></Card>
                    </aside>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/partner-services/requests/${r.reference}/scope-quote`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back: Scope &amp; Quote</Link>
                    <Button type="button" variant="outline" onClick={() => openAskQuestion({ subject: `Engagement instrument ${r.reference}`, section: 'partner-services' })}><MessageSquare className="size-4" aria-hidden="true" />Request Clarification</Button>
                    <div className="ml-auto text-center"><Button type="submit" form="sign" size="lg" disabled={form.processing} trailingIcon="arrow-right">Sign &amp; Execute Engagement Instrument</Button><p className="mt-1 text-xs text-ink-500">Next: Payment</p></div>
                </div>
            </PsBody>
        </>
    );
}
