import { useForm } from '@inertiajs/react';
import { Download, FileText, Info } from 'lucide-react';
import type { FormEvent } from 'react';
import { AdvisorInline, HumanLed, Journey } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Checkbox } from '@/Components/ui/Form';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

export default function Quote({ engagement: e }: AiimPageProps & { engagement: Engagement }) {
    const q = e.quote!;
    const form = useForm({ accept: false });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(`/aiim/workspace/engagements/${e.reference}/quote`); };
    const open = e.status === 'quoted';
    const half = q.deposit_total;
    return (
        <AiimPage
            title="Formal Quotation"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Advisor Services' }, { label: 'Formal Quotation' }]}
            heading={<>Formal Quotation <FileText className="size-7 text-referenced-500" /></>}
            subtitle={`Prepared for ${e.client.name} by TBCA`}
            description="Thank you for your time during our discovery session. Please find below our formal proposal and quotation."
            accent="purple"
            notice={<HumanLed text="Quotation prepared by your TBCA advisor. No AI-only advice." />}
            rail={<SelectionBox />}
        >
            <Journey e={e} />
            <section className="mb-4 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="mb-1 font-semibold">Quotation Details</p><dl className="space-y-1">{[['Quote number', q.number], ['Date issued', q.issued], ['Valid until', q.valid_until], ['Related discovery session', e.booking ?? '—']].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></div>
                <div><p className="mb-1 font-semibold">Client Details</p><p>{e.client.name}</p><p>{e.client.company}</p><p>{e.client.email}</p><p>{e.client.phone}</p></div>
                <div><p className="mb-1 font-semibold">Engagement Summary</p><ul className="space-y-0.5"><li>{e.request?.purpose ?? e.title}</li><li>Primary focus: {(e.sectorNames ?? []).join(', ') || '—'}</li><li>Geographic focus: South Africa</li><li>Engagement type: {q.engagement_type}</li><li>Estimated duration: {q.duration}</li></ul></div>
                <div><p className="mb-1 font-semibold">Your Advisor</p><AdvisorInline advisor={e.advisor} /></div>
            </section>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <SectionCard number={1} title="Scope of Work & Deliverables">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[36rem] text-xs">
                            <thead className="text-ink-500"><tr><th className="py-1 text-left">Item</th><th className="text-left">Description</th><th className="text-left">Deliverables</th><th className="text-right">Price (ZAR ex. VAT)</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">{q.items.map((it, i) => <tr key={it.item}><td className="py-1.5 font-medium">1.{i + 1} {it.item}</td><td>{it.description}</td><td>{it.deliverables}</td><td className="text-right">{zar2(it.amount)}</td></tr>)}</tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.65rem] text-ink-400">* Deliverables will be provided in digital format unless otherwise agreed.</p>
                </SectionCard>
                <SectionCard number={2} title="Investment Summary">
                    <dl className="space-y-1 text-sm">{q.lines.map((l) => <div key={l.code} className="flex justify-between"><dt>{l.label}</dt><dd>{l.amount ? zar2(l.amount) : '–'}</dd></div>)}<div className="flex justify-between border-t border-parchment-300 pt-1 font-semibold"><dt>Subtotal (ex. VAT)</dt><dd>{zar2(q.subtotal)}</dd></div><div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zar2(q.vat)}</dd></div><div className="flex justify-between text-lg font-bold"><dt>Total Investment (ZAR)</dt><dd className="text-referenced-700">{zar2(q.total)}</dd></div></dl>
                    <p className="mt-2 flex gap-1 rounded bg-referenced-50 p-2 text-xs text-referenced-700"><Info className="size-4 shrink-0" />All prices are in ZAR and exclusive of VAT unless stated. This quotation is valid until {q.valid_until}.</p>
                </SectionCard>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <SectionCard number={3} title="Payment Terms"><ul className="space-y-1 text-xs"><li>{q.deposit_percent}% upfront to commence work: {zar2(half)}</li><li>{100 - q.deposit_percent}% upon delivery of final report: {zar2(q.total - half)}</li><li>Payment methods: EFT, Card, Instant EFT</li><li>All fees are non-refundable once work has commenced.</li></ul></SectionCard>
                <SectionCard number={4} title="Assumptions & Exclusions"><ul className="list-disc space-y-1 pl-4 text-xs"><li>Information provided by the client is accurate and complete.</li><li>Scope excludes detailed engineering and legal due diligence.</li><li>Out-of-scope work will be quoted separately (scope change gate).</li></ul></SectionCard>
                <SectionCard number={5} title="Acceptance">
                    {open ? (
                        <form onSubmit={submit} className="space-y-2">
                            <p className="text-xs text-ink-600">To accept this quotation and proceed, confirm below. You will then review and sign the engagement letter.</p>
                            <Checkbox checked={form.data.accept} onChange={(ev) => form.setData('accept', ev.target.checked)} label="I accept the scope, line items, fees and payment terms in this quotation." />
                            {form.errors.accept && <p role="alert" className="text-xs text-risk-500">{form.errors.accept}</p>}
                            <div className="grid grid-cols-2 gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Download className="size-4" />Download (PDF)</Button>
                                <Button type="submit" size="sm" disabled={form.processing} className="!border-referenced-500 !bg-referenced-500 !text-white" trailingIcon="arrow-right">Accept Quotation</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-xs"><p>Accepted {e.quoteAcceptedAt}.</p>{e.next && <ButtonLink href={e.next.url} size="sm" className="mt-2">{e.next.label}</ButtonLink>}</div>
                    )}
                </SectionCard>
            </div>
        </AiimPage>
    );
}
