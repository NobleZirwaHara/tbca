import { Head, Link, useForm } from '@inertiajs/react';
import { CircleCheck, Info, Lock, TriangleAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Stepper } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { PartnerShell } from '@/Components/Marketplace/Shells';
import { Card, CodeChip, InfoRows, Notice } from '@/Components/Marketplace/ui';
import { money } from '@/Components/Marketplace/PartnerKit';
import type { MkPartnerRequest, PartnerQuote } from '@/types/marketplace';

export default function Quote({ request: r, editable, floor }: { request: MkPartnerRequest; editable: boolean; floor: number }) {
    const q = r.quote as PartnerQuote;
    const plus30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    const form = useForm({
        description: q.scope ?? '', methodology: q.methodology ?? '', deliverables: q.deliverables ?? '', assumptions: q.assumptions ?? '', exclusions: q.exclusions ?? '',
        valid_until: plus30, fee_mechanism: q.mechanism ?? 'M2 – Professional Fee', billing_basis: 'time-materials', hours: q.hours ?? 120, rate: q.rate ?? 550, fixed_fee: q.p ?? 0, disbursements: q.x ?? 0,
    });
    const d = form.data;
    // Live calculator: derived each render.
    const p = d.billing_basis === 'time-materials' ? Number(d.hours) * Number(d.rate) : Number(d.fixed_fee);
    const x = Number(d.disbursements) || 0;
    const vat = Math.round((p + x) * 0.15);
    const total = p + x + vat;
    const t = q.t ?? 0;
    const belowFloor = t + p < floor;
    const err = form.errors;

    return (
        <PartnerShell crumbs={[{ label: 'Partner Dashboard', href: '/partner-services/workspace' }, { label: `Opportunity ${r.reference}`, href: `/partner-services/workspace/opportunities/${r.reference}` }, { label: 'Scope & Quote Submission' }]}
            title={<span className="flex items-center gap-3">Scope &amp; Quote Submission <CodeChip code="PS-021" /></span>} description="Provide your professional scope of work and submit your quote for this opportunity. All fees and assumptions must be clear, transparent and in ZAR."
            actions={<div className="text-right text-xs text-ink-500">Opportunity Reference<p className="font-serif text-xl font-bold text-ink-900">{r.reference}</p></div>}>
            <Head title={`Scope & Quote – ${r.reference}`} />
            <div className="mb-5 max-w-2xl"><Stepper steps={['Opportunity & Conflict', 'Scope & Quote', 'Engagement Instrument', 'Delivery']} current={2} /></div>
            {!editable && <Notice tone="info" className="mb-4">The client has already accepted the scope. This quote is now locked.</Notice>}
            <form className="grid gap-5 xl:grid-cols-12" onSubmit={(e) => { e.preventDefault(); form.post(`/partner-services/workspace/opportunities/${r.reference}/quote`); }}>
                <div className="space-y-5 xl:col-span-8">
                    <div className="grid gap-5 md:grid-cols-[1fr_16rem]">
                        <Card title="A. Scope of Work">
                            <Field label="Professional Services Description" required hint={`${d.description.length} / 4000`} error={err.description}>{(id) => <Textarea id={id} rows={4} maxLength={4000} disabled={!editable} value={d.description} onChange={(e) => form.setData('description', e.target.value)} />}</Field>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <Field label="Methodology / Approach">{(id) => <Textarea id={id} maxLength={1000} disabled={!editable} value={d.methodology} onChange={(e) => form.setData('methodology', e.target.value)} />}</Field>
                                <Field label="Deliverables">{(id) => <Textarea id={id} maxLength={1000} disabled={!editable} value={d.deliverables} onChange={(e) => form.setData('deliverables', e.target.value)} />}</Field>
                                <Field label="Assumptions">{(id) => <Textarea id={id} maxLength={1000} disabled={!editable} value={d.assumptions} onChange={(e) => form.setData('assumptions', e.target.value)} />}</Field>
                            </div>
                            <Field label="Exclusions" className="mt-3">{(id) => <Textarea id={id} maxLength={1000} disabled={!editable} value={d.exclusions} onChange={(e) => form.setData('exclusions', e.target.value)} />}</Field>
                        </Card>
                        <Card title="D. Quote Validity">
                            <Field label="Quote Valid Until" required hint="Valid for 30 days" error={err.valid_until}>{(id) => <Input id={id} type="date" disabled={!editable} value={d.valid_until} onChange={(e) => form.setData('valid_until', e.target.value)} />}</Field>
                        </Card>
                    </div>
                    <Card title="B. Professional Fee (P Component)">
                        <div className="grid gap-3 md:grid-cols-4">
                            <Field label="Fee Mechanism" required error={err.fee_mechanism}>{(id) => <Select id={id} disabled={!editable} value={d.fee_mechanism} options={['M1 – Fixed Fee', 'M2 – Professional Fee', 'M3 – Success Fee', 'M4 – Retainer']} onChange={(e) => form.setData('fee_mechanism', e.target.value)} />}</Field>
                            <Field label="Billing Basis" required>{(id) => <Select id={id} disabled={!editable} value={d.billing_basis} options={[{ value: 'time-materials', label: 'Time & Materials' }, { value: 'fixed', label: 'Fixed Fee' }]} onChange={(e) => form.setData('billing_basis', e.target.value)} />}</Field>
                            {d.billing_basis === 'time-materials' ? (
                                <>
                                    <Field label="Estimated Hours" error={err.hours}>{(id) => <Input id={id} type="number" min={1} disabled={!editable} value={d.hours} onChange={(e) => form.setData('hours', Number(e.target.value))} />}</Field>
                                    <Field label="Hourly Rate (ZAR)" error={err.rate}>{(id) => <Input id={id} type="number" min={100} disabled={!editable} value={d.rate} onChange={(e) => form.setData('rate', Number(e.target.value))} />}</Field>
                                </>
                            ) : <Field label="Fixed Professional Fee (ZAR)" className="md:col-span-2" error={err.fixed_fee}>{(id) => <Input id={id} type="number" min={1000} disabled={!editable} value={d.fixed_fee} onChange={(e) => form.setData('fixed_fee', Number(e.target.value))} />}</Field>}
                            <div className="rounded bg-parchment-200 p-3"><p className="text-xs text-ink-500">Professional Fee (P) – Estimated</p><p className="text-lg font-bold">{money(p)}</p></div>
                            <Field label="Disbursements (X) – Estimated" error={err.disbursements}>{(id) => <Input id={id} type="number" min={0} disabled={!editable} value={d.disbursements} onChange={(e) => form.setData('disbursements', Number(e.target.value))} />}</Field>
                            <div className="rounded bg-parchment-200 p-3"><p className="text-xs text-ink-500">VAT (15%) – Indicative</p><p className="text-lg font-bold">{money(vat)}</p></div>
                            <div className="rounded border border-gold-400 bg-gold-50 p-3"><p className="text-xs text-ink-500">Indicative Total (P + X + S)</p><p className="text-lg font-bold">{money(total)}</p></div>
                        </div>
                        {belowFloor && <p className="mt-3 flex items-center gap-2 rounded bg-risk-50 p-2 text-sm text-risk-700"><TriangleAlert className="size-4" aria-hidden="true" />T ({money(t)}) + P ({money(p)}) is below the current floor of {money(floor)}. The quote will be blocked at quote stage.</p>}
                    </Card>
                    <Card title="C. Commercial Manifest (Auto-populated)">
                        <div className="grid gap-3 md:grid-cols-4 text-sm">{[['Arrangement', r.arrangement], ['Contracting Party', 'The Business Clinic.Africa (Pty) Ltd'], ['Recipient of P Fee', r.partner?.name], ['Currency', 'ZAR']].map(([k, v]) => <div key={k}><p className="text-xs text-ink-500">{k}</p><p className="rounded border border-parchment-400 bg-parchment-100 px-2 py-1.5">{v}</p></div>)}</div>
                    </Card>
                    <div className="flex flex-wrap justify-between gap-3">
                        <Link href={`/partner-services/workspace/opportunities/${r.reference}`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back to Opportunity</Link>
                        <div className="text-center"><Button type="submit" disabled={!editable || form.processing} trailingIcon="arrow-right">Submit Scope &amp; Quote</Button><p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500"><Lock className="size-3" aria-hidden="true" />Next: Engagement Instrument (Unlocked after submission)</p></div>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Opportunity Summary"><InfoRows dense rows={[['Client', r.clientName], ['Profession', r.resolution.profession], ['Intended Use', r.intake.intended_use], ['Jurisdiction', r.intake.jurisdiction], ['Description', r.title]]} /></Card>
                    <Card tone="green" title="Conflict Check Status"><p className="flex items-center gap-2 text-sm font-semibold text-verified-700"><CircleCheck className="size-4" aria-hidden="true" />{r.conflictState.replace(/_/g, ' ')}</p><p className="text-sm text-ink-600">No conflicts identified. Cleared {r.meta.conflict?.submitted_at ?? ''} by {r.meta.conflict?.performed_by ?? '—'}.</p></Card>
                    <Card tone="blue" title="Important Reminders"><ul className="space-y-1.5 text-sm">{['This quote is indicative and subject to acceptance.', 'No work may commence until the engagement instrument is executed.', 'You must remain independent and free from conflicts throughout the engagement.', 'All fees exclude VAT unless stated.'].map((x) => <li key={x} className="flex gap-2"><Info className="size-4 shrink-0" aria-hidden="true" />{x}</li>)}</ul></Card>
                </aside>
            </form>
        </PartnerShell>
    );
}

Quote.layout = null;
