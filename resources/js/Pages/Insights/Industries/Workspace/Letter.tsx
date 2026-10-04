import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Download, Info, PenLine, Printer, ShieldCheck } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Status, zar } from '@/Components/Insights/Shared';
import type { WorkspaceBase } from '@/types/insights';

interface Props extends WorkspaceBase {
    letter: {
        status: string; signedAt: string | null; signedBy: string | null; issueDate: string; client: string | null; clientName: string | null; totalFee: number;
        deliverables: { title: string; target: string }[]; addOns: { component: string; ledger: string; fee: number | null }[]; validUntil: string;
    };
}

const SECTIONS = ['Engagement Letter Preview', 'Scope of Work', 'Fees & Payment Terms', 'Terms & Conditions', 'Disclaimers & Limitations', 'Acceptance & Signature'];

export default function Letter(props: Props) {
    const { engagement: e, letter } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [open, setOpen] = useState(false);
    const [zoom, setZoom] = useState(100);
    const form = useForm({ signer_name: letter.clientName ?? '', agree: false });
    const signed = letter.status === 'signed';

    return (
        <WorkspaceShell
            base={props}
            title="Engagement Letter Preview"
            badge={<Chip tone={signed ? 'green' : 'amber'}>{signed ? 'Signed' : 'Awaiting Signature'}</Chip>}
            description="Review the engagement letter terms and confirm your agreement to proceed."
            actions={
                <>
                    <a href={`${root}/engagement-letter/pdf`} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Download PDF</a>
                    <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Printer className="size-4" /> Print Preview</button>
                    {!signed && <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><PenLine className="size-4" /> Send for Signature</button>}
                </>
            }
            right={
                <>
                    <Box title="Engagement Summary">
                        <dl className="space-y-1.5 text-xs">
                            {[['Engagement', e.title], ['Industry', e.industry], ['Sub-Industry', e.subIndustry], ['Country', e.country], ['Reference', e.reference], ['Issue Date', letter.issueDate]].map(([k, v]) => <div key={k as string} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
                            <div className="flex justify-between"><dt className="text-ink-500">Total Fee (ZAR)</dt><dd className="font-bold text-verified-700">{zar(letter.totalFee, 2)}<span className="block text-[0.625rem] font-normal text-ink-400">Excl. VAT</span></dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">Payment Terms</dt><dd>100% upfront</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">Validity</dt><dd>Until {letter.validUntil}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">Status</dt><dd><Status value={letter.status} /></dd></div>
                        </dl>
                    </Box>
                    <Box tone="blue" title="Important"><p className="text-xs">Please review all sections carefully. By signing, you confirm that you have read, understood, and agree to the terms of this Engagement Letter.</p></Box>
                </>
            }
        >
            <div className="grid gap-4 xl:grid-cols-[200px_1fr]">
                <nav aria-label="Letter sections" className="rounded-[8px] border border-parchment-400 bg-white p-2">
                    <ol className="space-y-1 text-xs">{SECTIONS.map((s, i) => <li key={s}><a href={`#sec-${i}`} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-parchment-200"><span className="flex size-5 items-center justify-center rounded-full border text-[0.625rem]">{i + 1}</span>{s}</a></li>)}</ol>
                </nav>
                <div className="rounded-[8px] border border-parchment-400 bg-parchment-200">
                    <div className="flex items-center justify-between border-b border-parchment-400 bg-white px-3 py-2 text-xs">
                        <span>Page 1 of 3</span>
                        <span className="flex items-center gap-2">
                            <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(70, z - 10))} className="rounded border px-2">−</button>
                            {zoom}%
                            <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(140, z + 10))} className="rounded border px-2">+</button>
                        </span>
                    </div>
                    <div className="max-h-[640px] overflow-auto p-4">
                        <article className="mx-auto max-w-2xl bg-white p-6 text-[0.8125rem] leading-relaxed text-ink-800 shadow-card" style={{ fontSize: `${zoom / 100 * 0.8125}rem` }}>
                            <header className="flex items-start justify-between border-b border-gold-400 pb-3">
                                <p className="font-semibold">The Business Clinic.Africa™<span className="block text-[0.625rem] font-normal">AI Agents Think | Robots Execute | Humans Lead®</span></p>
                                <p className="text-right font-bold">ENGAGEMENT LETTER<span className="block font-normal">{e.reference}</span></p>
                            </header>
                            <p id="sec-0" className="mt-4">This Engagement Letter (“Letter”) is made on {letter.issueDate}</p>
                            <p className="mt-2 font-semibold">BETWEEN</p>
                            <p><strong>The Business Clinic.Africa (Pty) Ltd (“TBCA”)</strong><br />Registration No: 2020/123456/07 | Address: Sandton, Johannesburg, South Africa</p>
                            <p className="mt-2 font-semibold">AND</p>
                            <p><strong>{letter.client ?? 'Client'} (“Client”)</strong></p>
                            <h3 className="mt-4 font-bold">1. PURPOSE</h3>
                            <p>TBCA will provide the services described in this Letter in connection with the Africa Investment Intelligence Map (AIIM) diagnostic and advisory engagement (“Engagement”).</p>
                            <h3 id="sec-1" className="mt-4 font-bold">2. SCOPE OF WORK</h3>
                            <p>The services to be provided are set out in Schedule 1 (Scope of Work). TBCA will perform the services with reasonable skill, care and diligence in accordance with professional standards applicable to the services.</p>
                            <table className="mt-2 w-full border text-xs">
                                <thead><tr className="bg-parchment-100"><th className="border p-1 text-left">Key Deliverables</th><th className="border p-1 text-left">Target Delivery Date</th></tr></thead>
                                <tbody>{letter.deliverables.map((d) => <tr key={d.title}><td className="border p-1">• {d.title}</td><td className="border p-1">{d.target}</td></tr>)}</tbody>
                            </table>
                            <h3 id="sec-2" className="mt-4 font-bold">3. FEES AND PAYMENT TERMS</h3>
                            <p>The fees for this Engagement are {zar(letter.totalFee, 2)}, set out in Schedule 2 (Fees). All fees are stated in ZAR and exclusive of VAT. Payment is 100% upfront.</p>
                            {letter.addOns.length > 0 && <p className="mt-1">Mandatory sector add-ons (estimated, confirmed after scoping): {letter.addOns.map((a) => `${a.component} (Ledger ${a.ledger}${a.fee ? `, ${zar(a.fee)}` : ', varies'})`).join('; ')}. Ledger P, X and S amounts are separate from TBCA fees.</p>}
                            <h3 id="sec-3" className="mt-4 font-bold">4. TERMS & CONDITIONS</h3>
                            <p>The TBCA Terms of Use, Fair Engagement Policy and Abort Ladder apply. Signature does not authorise future charges beyond this Letter.</p>
                            <h3 id="sec-4" className="mt-4 font-bold">5. DISCLAIMERS & LIMITATIONS</h3>
                            <p>TBCA does not provide legal, tax, regulatory or reserved professional opinions. Such elements are delivered by independent partners under separate engagement.</p>
                            <h3 id="sec-5" className="mt-4 font-bold">6. ACCEPTANCE & SIGNATURE</h3>
                            <p>{signed ? <>Signed electronically by <strong>{letter.signedBy}</strong> on {letter.signedAt}.</> : 'Awaiting client signature.'}</p>
                        </article>
                    </div>
                </div>
            </div>

            {signed ? (
                <div className="flex flex-col gap-3 rounded-[8px] border border-verified-500/30 bg-verified-50 p-4 sm:flex-row sm:items-center">
                    <ShieldCheck className="size-6 text-verified-700" />
                    <p className="flex-1 text-sm">Letter signed. Next: approve the quotation gate and complete payment.</p>
                    <Link href={`${root}/gates`} className="rounded bg-gold-500 px-4 py-2 text-xs font-bold">Go to Gates →</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center">
                    <ShieldCheck className="size-6 text-gold-700" />
                    <p className="flex-1 text-sm"><strong>Ready to Proceed?</strong><span className="block text-xs">When you are satisfied with the terms, click “Send for Signature” to proceed with acceptance.</span></p>
                    <button type="button" onClick={() => setOpen(true)} className="rounded bg-gold-500 px-4 py-2 text-xs font-bold">Send for Signature</button>
                </div>
            )}

            <Modal open={open} onClose={() => setOpen(false)} title="Sign Engagement Letter"
                footer={<button type="button" disabled={form.processing} onClick={() => form.post(`${root}/engagement-letter/sign`, { onSuccess: () => setOpen(false) })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Sign electronically</button>}>
                <p className="mb-3 flex gap-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" /> Your typed name, timestamp and IP are recorded to the audit trail as your electronic signature.</p>
                <Field label="Full name of authorised signatory" required error={form.errors.signer_name}>{(id) => <Input id={id} value={form.data.signer_name} onChange={(ev) => form.setData('signer_name', ev.target.value)} />}</Field>
                <Checkbox className="mt-3" label="I have read, understood and agree to the terms of this Engagement Letter." checked={form.data.agree} onChange={(ev) => form.setData('agree', ev.target.checked)} />
                {form.errors.agree && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.agree}</p>}
            </Modal>
        </WorkspaceShell>
    );
}
