import { router, useForm } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, Download, FileText, Info, ShieldCheck, UserCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import BriefArt from '@/Components/Aiim/BriefArt';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox, RailBox } from '@/Components/Aiim/Shell';
import { Checkbox } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, FeeLine } from '@/types/aiim';

export interface ReportProps {
    reference: string; quoteReference: string | null; title: string; status: string; sku: string | null; typeName: string; typeCode: string;
    scope: string; sectors: string; modules: string[]; pages: string | number; deliveryEstimate: string; delivery: Record<string, string | number> | null;
    lines: FeeLine[]; subtotal: number; vat: number; total: number; validUntil: string | null; issued: string; orderReference: string | null; paid: boolean; deliveredAt: string | null;
}

export function ReportCard({ r, badge }: { r: ReportProps; badge: string }) {
    return (
        <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <BriefArt seed={r.reference} category="Custom Report" label={r.title} className="h-36 rounded-[8px]" />
            <div>
                <Chip tone="good">{badge}</Chip>
                <h2 className="mt-1 text-lg font-semibold">{r.title}</h2>
                <dl className="mt-2 space-y-1 text-xs">
                    {[['Report Type', r.typeName], ['Geographic Scope', r.scope], ['Sectors', r.sectors], ['Content Modules', `${r.modules.length} selected`], ['Pages', r.pages], ['Estimated Delivery', r.deliveryEstimate]].map(([k, v]) => <div key={k} className="grid grid-cols-[7rem_1fr] gap-2"><dt className="text-ink-500">{k}:</dt><dd>{v}</dd></div>)}
                </dl>
            </div>
        </div>
    );
}

export default function Quote({ report: r }: AiimPageProps & { report: ReportProps }) {
    const form = useForm({ accept: false });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(`/aiim/reports/${r.reference}/accept`); };
    const quoted = r.status === 'quoted';
    return (
        <AiimPage
            title="Report Quotation"
            crumbs={[{ label: 'Premium Intelligence' }, { label: 'Report Configuration' }, { label: 'Report Quotation' }]}
            heading={<>Report Quotation <FileText className="size-7 text-gold-600" /></>}
            description={<>Quote ID: <strong>{r.quoteReference}</strong> · Issued {r.issued} · Valid Until {r.validUntil}<br />You are one step away from purchasing your premium intelligence report.</>}
            rail={<><SelectionBox /><RailBox title="Need Help?"><p className="mb-3 text-xs text-ink-300">Our team is here to help you complete your purchase.</p><ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline-light" className="w-full">Talk to an AIIM Advisor</ButtonLink></RailBox></>}
        >
            <SectionCard className="mb-4"><Stepper steps={['Configure', 'Quote', 'Checkout', 'Delivery']} current={quoted ? 2 : r.paid ? 4 : 3} /></SectionCard>
            <div className="grid gap-4 xl:grid-cols-3">
                <SectionCard><ReportCard r={r} badge="Selected Report" /></SectionCard>
                <SectionCard title="Fee Breakdown">
                    <p className="mb-2 text-xs text-ink-500">All amounts in ZAR</p>
                    <table className="w-full text-xs">
                        <thead className="text-ink-500"><tr><th className="text-left">Component</th><th className="text-left">Description</th><th className="text-right">Amount (excl. VAT)</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">{r.lines.map((l) => <tr key={l.code}><td className="py-1.5 font-medium">{l.label}</td><td className="text-ink-600">{l.description}</td><td className="text-right">{zar2(l.amount)}</td></tr>)}</tbody>
                    </table>
                    <dl className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between"><dt>Subtotal (excl. VAT)</dt><dd>{zar2(r.subtotal)}</dd></div>
                        <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zar2(r.vat)}</dd></div>
                        <div className="flex justify-between text-base font-bold text-risk-500"><dt>Total (incl. VAT)</dt><dd>{zar2(r.total)}</dd></div>
                    </dl>
                </SectionCard>
                <SectionCard title="Commercial Summary">
                    <dl className="space-y-1.5 text-xs">{[['Quote ID', r.quoteReference], ['Fee Code', r.typeCode], ['Fee Category', 'Premium Intelligence Report'], ['Payment Trigger', 'On acceptance of quote'], ['Payment Method', 'Card / EFT'], ['Currency', 'ZAR'], ['Payments Required', 'Full payment'], ['Refund Policy', 'Non-refundable once processing begins']].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
                    <p className="mt-3 flex gap-1.5 rounded bg-controlled-50 p-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" />By accepting this quote, you agree to the AIIM Terms of Use, Data Policy and Commercial Terms.</p>
                </SectionCard>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <SectionCard title="What's Included"><ul className="space-y-1 text-xs">{['Full report in PDF format', 'Data tables in Excel format', 'Methodology notes and assumptions', 'Source list and evidence log', 'Commercial usage licence (single user)', 'One clarification Q&A after delivery'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{t}</li>)}</ul></SectionCard>
                <SectionCard title="Data Assurance"><ul className="space-y-1 text-xs">{[[BadgeCheck, 'Verified Sources'], [UserCheck, 'Human Review'], [FileText, 'Methodology Notes'], [ShieldCheck, 'Commercial Usage Licence']].map(([I, t]) => { const Icon = I as typeof BadgeCheck; return <li key={t as string} className="flex gap-1.5"><Icon className="size-3.5 text-gold-600" />{t as string}</li>; })}</ul></SectionCard>
                <SectionCard title="Important Notes"><ul className="list-disc space-y-1 pl-4 text-xs"><li>Delivery time starts from confirmation of payment.</li><li>Any changes to scope may affect delivery time and pricing.</li><li>This quote is valid until {r.validUntil}.</li><li>Payment is required in full to commence production.</li></ul></SectionCard>
            </div>
            {quoted ? (
                <form onSubmit={submit} className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <ButtonLink href={`/aiim/store/${r.sku}`} variant="outline">Back to Brief</ButtonLink>
                    <div className="flex flex-wrap items-center gap-3">
                        <Checkbox checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} label="I accept this quotation and its commercial terms." />
                        {form.errors.accept && <span role="alert" className="text-xs text-risk-500">{form.errors.accept}</span>}
                        <Button type="button" variant="outline" onClick={() => window.print()}><Download className="size-4" />Download Quote (PDF)</Button>
                        <Button type="button" variant="outline" onClick={() => router.post(`/aiim/reports/${r.reference}/changes`)}>Request Changes</Button>
                        <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Accept Quote &amp; Proceed</Button>
                    </div>
                </form>
            ) : (
                <div className="mt-4 flex justify-end"><ButtonLink href={`/aiim/workspace/reports/${r.reference}`} trailingIcon="arrow-right">Track Report</ButtonLink></div>
            )}
        </AiimPage>
    );
}
