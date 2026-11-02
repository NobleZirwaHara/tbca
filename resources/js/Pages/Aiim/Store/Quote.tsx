import { router, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { Hero, Panel, PillLink, ProtoFrame, SumBox, SvcRail, pill, type SvcCard } from '@/Components/Aiim/ProtoLibrary';
import { Dl } from '@/Components/Industries/Kit';
import type { AiimPageProps, FeeLine } from '@/types/aiim';

export interface ReportProps {
    reference: string; quoteReference: string | null; title: string; status: string; sku: string | null; typeName: string; typeCode: string;
    scope: string; sectors: string; modules: string[]; pages: string | number; deliveryEstimate: string; delivery: Record<string, string | number> | null;
    lines: FeeLine[]; subtotal: number; vat: number; total: number; validUntil: string | null; issued: string; created: string; orderReference: string | null; paid: boolean; deliveredAt: string | null;
}

/** Page 37: Report Quotation. Accept posts to the existing accept action, which opens the AIIM checkout. */
export default function Quote({ report: r, rail }: AiimPageProps & { report: ReportProps; rail: SvcCard[] }) {
    const form = useForm({ accept: false });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(`/aiim/reports/${r.reference}/accept`); };
    const quoted = r.status === 'quoted';

    return (
        <ProtoFrame title="Report Quotation" crumbs={[{ label: 'Premium Briefs', href: '/aiim/store' }, { label: 'Report Configuration' }, { label: 'Report Quotation' }]}>
            <Hero eyebrow="Page 37 · Valid 14 days (AAB-EMB-230)" title="Report Quotation" lead={r.title} />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <form onSubmit={submit} className="grid content-start gap-4">
                    <Panel title="Quotation">
                        <Dl rows={[
                            ['Quote', <span key="q" className="font-mono">{r.quoteReference}</span>],
                            ['Valid until', r.validUntil ?? '—'],
                            ['Report', `${r.typeName} (${r.typeCode})`],
                            ['Scope', `${r.scope} · ${r.sectors}`],
                            ['Includes', r.modules.join(' · ')],
                            ['Delivery', r.deliveryEstimate],
                        ]} />
                        <div className="mt-4"><SumBox lines={r.lines.map((l) => ({ label: l.label, amount: l.amount }))} /></div>
                        {quoted ? (
                            <>
                                <label className="mt-4 flex items-start gap-2 text-[0.84rem]"><input type="checkbox" className="mt-0.5 size-4 accent-gold-600" checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} />I accept this quotation and the AIIM Terms of Use, Data Policy and Commercial Terms.</label>
                                {form.errors.accept && <p role="alert" className="mt-1 text-[0.75rem] text-risk-600">{form.errors.accept}</p>}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button type="submit" className={pill('gold', 'md')} disabled={form.processing}>Accept and pay</button>
                                    <button type="button" className={pill('ghost', 'md')} onClick={() => router.post(`/aiim/reports/${r.reference}/changes`)}>Change</button>
                                    <button type="button" className={pill('ghost', 'md')} onClick={() => window.print()}>Print quote</button>
                                </div>
                            </>
                        ) : (
                            <div className="mt-4 flex flex-wrap gap-2"><PillLink href={`/aiim/workspace/reports/${r.reference}`} size="md">Track report</PillLink></div>
                        )}
                    </Panel>
                </form>
                <div className="grid content-start gap-4">
                    <div className="flex gap-2 rounded-[12px] border border-gold-300 bg-gold-50 p-3 text-[0.8rem] text-ink-700"><ShieldCheck className="size-4 shrink-0 text-gold-700" />Accepting opens the secure AIIM checkout. Production starts once payment is confirmed, and the report is delivered to your workspace.</div>
                    <SvcRail title="Related services" items={rail} />
                </div>
            </div>
        </ProtoFrame>
    );
}
