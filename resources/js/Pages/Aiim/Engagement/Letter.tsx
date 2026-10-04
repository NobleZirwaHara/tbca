import { useForm } from '@inertiajs/react';
import { Download, FileSignature, FileText, Lock, MessageSquare, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EngagementHeader, HumanLed, Journey } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Checkbox, Field, Input, Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

function LetterDoc({ e }: { e: Engagement }) {
    const q = e.quote!;
    return (
        <article className="max-h-[32rem] overflow-y-auto rounded-[8px] border border-ink-700 bg-white p-6 text-xs leading-relaxed text-ink-800" aria-label="Engagement letter">
            <div className="flex justify-between"><p className="font-serif text-base font-bold text-gold-700">The Business Clinic.Africa™</p><p>Date: {q.issued}</p></div>
            <h2 className="mt-4 text-center text-lg font-bold">ENGAGEMENT LETTER</h2>
            <p className="text-center">{e.type === 'advisory' ? 'Project Advisory Services' : 'Custom Intelligence Services'} — {e.title}<br />South Africa</p>
            <h3 className="mt-4 font-bold">1. PARTIES</h3>
            <p>This Engagement Letter (&ldquo;Letter&rdquo;) is made between:</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded border border-parchment-400 p-2"><strong>The Business Clinic.Africa™ (TBCA)</strong><br />Registration: 2019/123456/07<br />5th Floor, Blocktrans Building, Blue Gate Road, Lynnwood Ridge, Pretoria, 0081, South Africa (&ldquo;TBCA&rdquo;)</div>
                <div className="rounded border border-parchment-400 p-2"><strong>{e.client.company ?? e.client.name}</strong><br />Represented by: {e.client.name}<br />Email: {e.client.email}<br />Telephone: {e.client.phone} (&ldquo;Client&rdquo;)</div>
            </div>
            <p className="mt-2">TBCA and the Client are collectively referred to as the &ldquo;Parties&rdquo;.</p>
            <h3 className="mt-4 font-bold">2. SCOPE OF WORK</h3>
            <ol className="list-decimal pl-5">{q.items.map((i) => <li key={i.item}>{i.item}: {i.deliverables} ({zar2(i.amount)} ex VAT)</li>)}</ol>
            <h3 className="mt-4 font-bold">3. FEES AND PAYMENT</h3>
            <p>Total fees of {zar2(q.subtotal)} excluding VAT ({zar2(q.total)} including VAT at 15%). {q.deposit_percent}% is payable upfront to commence work and the balance on delivery of the final report. Fees are non-refundable once work has commenced; earned work and committed supplier costs are retained on cancellation.</p>
            <h3 className="mt-4 font-bold">4. CONFIDENTIALITY, DATA AND POPIA</h3>
            <p>Standard TBCA confidentiality terms apply. Personal information is processed under POPIA for the purposes of this engagement only. AI output is support material; final conclusions are approved by a named TBCA professional.</p>
            <h3 className="mt-4 font-bold">5. GOVERNING LAW AND DISPUTES</h3>
            <p>This Letter is governed by the laws of the Republic of South Africa. Disputes are resolved by arbitration in Johannesburg.</p>
            {e.signature && <p className="mt-6 border-t border-parchment-400 pt-3">Signed electronically by <span className="font-serif text-lg italic">{e.signature.name}</span> ({e.signature.title}) on {e.signature.at}. Signature hash {e.signature.hash}.</p>}
        </article>
    );
}

export default function Letter({ engagement: e, mode }: AiimPageProps & { engagement: Engagement; mode: 'review' | 'sign' }) {
    const q = e.quote!;
    const sign = mode === 'sign';
    const accept = useForm({ decision: 'accept', accept: false, reason: '' });
    const signature = useForm({ signature: '', title: '', agree: false });
    const [decline, setDecline] = useState(false);
    const canAccept = e.status === 'quote_accepted';
    const canSign = e.status === 'letter_accepted';

    const submitAccept = (ev: FormEvent) => { ev.preventDefault(); accept.transform((d) => ({ ...d, decision: 'accept' })); accept.post(`/aiim/workspace/engagements/${e.reference}/letter`); };
    const submitDecline = (ev: FormEvent) => { ev.preventDefault(); accept.transform((d) => ({ ...d, decision: 'decline' })); accept.post(`/aiim/workspace/engagements/${e.reference}/letter`); };
    const submitSign = (ev: FormEvent) => { ev.preventDefault(); signature.post(`/aiim/workspace/engagements/${e.reference}/sign`); };

    const terms: [string, string][] = [['Scope of Work', 'As per attached Statement of Work'], ['Engagement Type', q.engagement_type ?? 'Advisory'], ['Engagement Duration', q.duration ?? '—'], ['Fee (ex. VAT)', zar2(q.subtotal)], ['VAT (15%)', zar2(q.vat)], ['Total (incl. VAT)', zar2(q.total)], ['Payment Terms', `${q.deposit_percent}% upfront, ${100 - q.deposit_percent}% on delivery of final report`], ['Confidentiality', 'Standard TBCA confidentiality terms apply'], ['Governing Law', 'Laws of the Republic of South Africa'], ['Dispute Resolution', 'Arbitration – Johannesburg, RSA']];

    return (
        <AiimPage
            title={sign ? 'Electronic Signature' : 'Engagement Letter Review'}
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Advisor Services' }, { label: sign ? 'Electronic Signature' : 'Engagement Letter Review' }]}
            heading={<>{sign ? 'Electronic Signature' : 'Engagement Letter Review'} {sign ? <FileSignature className="size-7 text-referenced-500" /> : <FileText className="size-7 text-referenced-500" />}</>}
            subtitle={sign ? 'Please review the engagement letter and sign electronically to proceed.' : 'Please review the engagement letter and accept to proceed.'}
            description={sign ? 'By signing below, you confirm that you have read, understood and agree to the terms of this engagement.' : 'This engagement letter sets out the terms of our advisory engagement.'}
            accent="purple"
            notice={<HumanLed text={sign ? 'This engagement requires your electronic signature. No AI-only advice.' : 'This engagement letter has been prepared by your TBCA advisor. No AI-only advice.'} />}
            rail={<SelectionBox />}
        >
            <Journey e={e} />
            <EngagementHeader e={e} />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <LetterDoc e={e} />
                {sign ? (
                    <form onSubmit={submitSign} className="space-y-4" noValidate>
                        <SectionCard number={1} title="Type Your Signature">
                            {e.signature ? (
                                <p className="text-sm">Signed by <span className="font-serif text-xl italic">{e.signature.name}</span> on {e.signature.at}.</p>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs text-ink-500">Signature method: <strong>Type Signature</strong> — type your full name exactly as on your account.</p>
                                    <Field label="Full name" error={signature.errors.signature} required>{(id) => <Input id={id} value={signature.data.signature} onChange={(x) => signature.setData('signature', x.target.value)} autoComplete="name" />}</Field>
                                    <div className="flex h-20 items-end rounded border border-parchment-400 bg-parchment-100 px-4 pb-3" aria-live="polite"><span className="mr-2 text-ink-400">X</span><span className="font-serif text-3xl text-ink-900 italic">{signature.data.signature}</span></div>
                                    <Field label="Title / Position" error={signature.errors.title} required>{(id) => <Input id={id} value={signature.data.title} onChange={(x) => signature.setData('title', x.target.value)} placeholder="e.g. Managing Director" />}</Field>
                                    <Checkbox checked={signature.data.agree} onChange={(x) => signature.setData('agree', x.target.checked)} label="I have read, understood and agree to the terms of this engagement letter." />
                                    {signature.errors.agree && <p role="alert" className="text-xs text-risk-500">{signature.errors.agree}</p>}
                                    <p className="flex gap-1.5 text-xs text-verified-700"><ShieldCheck className="size-4" />Secure &amp; legally binding. Your signature, time, IP address and a document hash are recorded.</p>
                                </div>
                            )}
                        </SectionCard>
                        <SectionCard title="What You Are Signing"><p className="flex items-center gap-2 text-xs"><FileText className="size-5 text-referenced-500" /><span><strong className="block">Engagement Letter</strong>{e.title} · Version 1.0 · {q.issued}</span></p></SectionCard>
                        <div className="flex flex-wrap justify-between gap-2">
                            <ButtonLink href={`/aiim/workspace/engagements/${e.reference}/letter`} variant="outline">Back</ButtonLink>
                            <Button type="button" variant="outline" onClick={() => window.print()}><Download className="size-4" />Download Letter (PDF)</Button>
                            {canSign && <Button type="submit" disabled={signature.processing} className="!border-referenced-500 !bg-referenced-500 !text-white" icon="lock" trailingIcon="arrow-right">Apply Signature &amp; Continue</Button>}
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <SectionCard title="Key Terms Summary"><dl className="space-y-1.5 text-xs">{terms.map(([k, v]) => <div key={k} className="grid grid-cols-[8rem_1fr] gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></SectionCard>
                        <p className="flex gap-2 rounded border border-risk-500/30 bg-risk-50 p-3 text-xs text-risk-700"><TriangleAlert className="size-4 shrink-0" /><span><strong className="block">Important</strong>Please read the full engagement letter carefully. You must accept the terms to proceed.</span></p>
                        {canAccept ? (
                            <form onSubmit={submitAccept} className="space-y-3">
                                <Checkbox checked={accept.data.accept} onChange={(x) => accept.setData('accept', x.target.checked)} label="I accept the terms and conditions outlined in this engagement letter." />
                                {accept.errors.accept && <p role="alert" className="text-xs text-risk-500">{accept.errors.accept}</p>}
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Download className="size-4" />Download Full Letter</Button>
                                    <ButtonLink href="/aiim/workspace/advisor-request" variant="outline" size="sm"><MessageSquare className="size-4" />Request Clarification</ButtonLink>
                                    <Button type="button" variant="outline" size="sm" className="!border-risk-500 !text-risk-500" onClick={() => setDecline(true)}>Decline Letter</Button>
                                    <Button type="submit" size="sm" disabled={accept.processing} className="!border-referenced-500 !bg-referenced-500 !text-white" trailingIcon="arrow-right">Accept Letter &amp; Continue</Button>
                                </div>
                            </form>
                        ) : (
                            <p className="flex items-center gap-1 text-xs text-ink-500"><Lock className="size-3.5" />Letter accepted {e.letterAcceptedAt ?? ''}. {e.next && <a className="font-semibold text-gold-700" href={e.next.url}>{e.next.label} →</a>}</p>
                        )}
                    </div>
                )}
            </div>
            <Modal open={decline} onClose={() => setDecline(false)} title="Decline engagement letter">
                <form onSubmit={submitDecline} className="space-y-3">
                    <Field label="Reason for declining" error={accept.errors.reason} required>{(id) => <Textarea id={id} value={accept.data.reason} onChange={(x) => accept.setData('reason', x.target.value)} />}</Field>
                    <Button type="submit" disabled={accept.processing} className="w-full !border-risk-500 !bg-risk-500 !text-white">Decline Letter</Button>
                </form>
            </Modal>
        </AiimPage>
    );
}
