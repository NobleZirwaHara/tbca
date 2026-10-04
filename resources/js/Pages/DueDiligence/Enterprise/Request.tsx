import { useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Bookmark, Info, UploadCloud } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, DdHero, Ticks, TrustIcons, rand } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdJourneyStep } from '@/types/due-diligence';

interface Props {
    draft: Record<string, unknown> | null;
    draftReference: string | null;
    submitted: { reference: string; status: string; submitted_at: string | null }[];
    populations: Record<string, string>;
    modules: Record<string, string>;
    delivery: Record<string, string>;
    purposes: string[];
    clientTypes: string[];
    turnarounds: string[];
    journey: DdJourneyStep[];
}

type FileKey = 'screening_list' | 'register_extract' | 'memo' | 'supporting';

/** DD-023 Enterprise Screening Request. Preliminary fee view mirrors EnterpriseController::feeView. */
export default function Request({ draft, draftReference, submitted, populations, modules, delivery, purposes, clientTypes, turnarounds, journey }: Props) {
    const d = (draft ?? {}) as Record<string, never>;
    type EntForm = {
        name: string; purpose: string; client_type: string; population: string[]; volume: string | number; batch_size: string; jurisdictions: string; extra_jurisdictions: string | number;
        turnaround: string; frequency: string; cadence: string; start_date: string; modules: string[]; delivery: string[]; notes: string;
        screening_list: File | null; register_extract: File | null; memo: File | null; supporting: File | null; intent: string; existing_list: string;
    };
    const form = useForm<EntForm>({
        name: d.name ?? '', purpose: d.purpose ?? purposes[0], client_type: d.client_type ?? clientTypes[0], population: d.population ?? ['suppliers', 'companies'],
        volume: d.volume ?? 250, batch_size: d.batch_size ?? 'Up to 500 records', jurisdictions: d.jurisdictions ?? 'South Africa (Primary)', extra_jurisdictions: d.extra_jurisdictions ?? 0,
        turnaround: d.turnaround ?? turnarounds[0], frequency: d.frequency ?? 'recurring', cadence: d.cadence ?? 'Monthly', start_date: d.start_date ?? '',
        modules: d.modules ?? ['company', 'sanctions', 'media'], delivery: d.delivery ?? ['portal', 'upload'], notes: d.notes ?? '',
        screening_list: null, register_extract: null, memo: null, supporting: null, intent: 'draft', existing_list: (d as { files?: { screening_list?: unknown } }).files?.screening_list ? '1' : '',
    });
    const err = form.errors as Record<string, string>;
    const toggle = (key: 'population' | 'modules' | 'delivery', v: string) => form.setData(key, form.data[key].includes(v) ? form.data[key].filter((x) => x !== v) : [...form.data[key], v]);

    const fee = useMemo(() => {
        const volume = Math.max(1, Number(form.data.volume) || 1);
        const mods = Math.max(1, form.data.modules.length);
        const j = 1 + (Number(form.data.extra_jurisdictions) || 0);
        const expert = Math.round((2500 + ((volume * 20 * mods) / 3) * (1 + 0.15 * (j - 1))) / 100) * 100;
        const platform = Math.round((1800 + volume * 32) / 100) * 100;
        const subtotal = expert + platform;
        const vat = Math.round(subtotal * 0.15);
        return { expert, platform, subtotal, vat, handling: 250, total: subtotal + vat + 250 };
    }, [form.data.volume, form.data.modules, form.data.extra_jurisdictions]);

    const post = (intent: 'draft' | 'submit') => {
        form.transform((data) => ({ ...data, intent }));
        form.post('/due-diligence/enterprise/request', { forceFormData: true, preserveScroll: true });
    };
    const Chk = ({ group, value, label, sub }: { group: 'population' | 'modules' | 'delivery'; value: string; label: string; sub?: string }) => (
        <label className={cn('flex cursor-pointer items-start gap-2 rounded-[8px] border p-2.5 text-xs', form.data[group].includes(value) ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white')}>
            <input type="checkbox" className="mt-0.5 accent-gold-600" checked={form.data[group].includes(value)} onChange={() => toggle(group, value)} />
            <span><strong className="block text-ink-900">{label}</strong>{sub}</span>
        </label>
    );
    const file = (k: FileKey, label: string, required = false) => (
        <Field label={label} required={required} error={err[k]}>
            {(id) => (
                <label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-1 rounded-[8px] border-2 border-dashed border-parchment-500 bg-white p-3 text-center text-xs text-ink-600 hover:border-gold-500">
                    <UploadCloud className="size-5" aria-hidden="true" />
                    {(form.data[k] as File | null)?.name ?? 'Drag & drop or Browse'}
                    <input id={id} type="file" className="sr-only" onChange={(e) => form.setData(k, e.target.files?.[0] ?? null)} />
                </label>
            )}
        </Field>
    );

    return (
        <>
            <Head title="Enterprise Screening Request" />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: 'Enterprise Screening', href: '/due-diligence/enterprise' }, { label: 'Request' }]}
                title="Enterprise Screening Request"
                subtitle="Configure a bulk screening request for suppliers, counterparties, investors or institutions."
                chips={[{ label: 'Lifecycle Stage', value: 'Early / Pre-Order' }, { label: 'Public Stage', value: '1' }, { label: 'Case State', value: draftReference ? `Request Draft ${draftReference}` : 'Request Draft' }, { label: 'Consent', value: 'Not yet captured' }, { label: 'Payment', value: 'Not yet due' }, { label: 'Entitlement', value: 'Quotation pending' }, { label: 'Review', value: 'Pending specialist review' }, { label: 'Risk', value: 'Not assessed' }]}
                journey={journey}
                current={1}
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-5 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-8">
                        <Card title="1. Programme Details">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <Field label="Request Name" required error={err.name}>{(id) => <Input id={id} value={String(form.data.name)} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                                <Field label="Screening Purpose" required error={err.purpose}>{(id) => <Select id={id} value={String(form.data.purpose)} options={purposes} onChange={(e) => form.setData('purpose', e.target.value)} />}</Field>
                                <Field label="Client Type" required error={err.client_type}>{(id) => <Select id={id} value={String(form.data.client_type)} options={clientTypes} onChange={(e) => form.setData('client_type', e.target.value)} />}</Field>
                                <Field label="Turnaround Option" required error={err.turnaround}>{(id) => <Select id={id} value={String(form.data.turnaround)} options={turnarounds} onChange={(e) => form.setData('turnaround', e.target.value)} />}</Field>
                            </div>
                        </Card>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <Card title="2. Who do you want to screen?">
                                <div className="grid gap-2 sm:grid-cols-2">{Object.entries(populations).map(([k, l]) => <Chk key={k} group="population" value={k} label={l} />)}</div>
                                {err.population && <p className="mt-1 text-xs text-risk-500">{err.population}</p>}
                            </Card>
                            <Card title="3. Volume & Coverage">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Estimated Monthly Volume" required error={err.volume}>{(id) => <Input id={id} type="number" min={1} value={String(form.data.volume)} onChange={(e) => form.setData('volume', e.target.value)} />}</Field>
                                    <Field label="Batch / File Size (per upload)">{(id) => <Select id={id} value={String(form.data.batch_size)} options={['Up to 100 records', 'Up to 500 records', 'Up to 2 000 records', 'Up to 10 000 records']} onChange={(e) => form.setData('batch_size', e.target.value)} />}</Field>
                                    <Field label="Jurisdictions of Focus" error={err.jurisdictions}>{(id) => <Input id={id} value={String(form.data.jurisdictions)} onChange={(e) => form.setData('jurisdictions', e.target.value)} />}</Field>
                                    <Field label="Additional jurisdictions (count)" error={err.extra_jurisdictions}>{(id) => <Input id={id} type="number" min={0} value={String(form.data.extra_jurisdictions)} onChange={(e) => form.setData('extra_jurisdictions', e.target.value)} />}</Field>
                                    <fieldset className="text-xs"><legend className="mb-1 text-[0.8125rem] font-medium">Screening Frequency</legend>{['one-time', 'recurring'].map((f) => <label key={f} className="mr-3 inline-flex items-center gap-1 capitalize"><input type="radio" className="accent-gold-600" checked={form.data.frequency === f} onChange={() => form.setData('frequency', f)} />{f}</label>)}</fieldset>
                                    <Field label="Recurrence Cadence">{(id) => <Select id={id} value={String(form.data.cadence)} disabled={form.data.frequency !== 'recurring'} options={['Weekly', 'Monthly', 'Quarterly']} onChange={(e) => form.setData('cadence', e.target.value)} />}</Field>
                                    <Field label="Start Date (Preferred)" error={err.start_date}>{(id) => <Input id={id} type="date" value={String(form.data.start_date)} onChange={(e) => form.setData('start_date', e.target.value)} />}</Field>
                                </div>
                            </Card>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <Card title="4. Modules Requested">
                                <div className="grid gap-2 sm:grid-cols-2">{Object.entries(modules).map(([k, l]) => <Chk key={k} group="modules" value={k} label={l} />)}</div>
                                {err.modules && <p className="mt-1 text-xs text-risk-500">{err.modules}</p>}
                            </Card>
                            <Card title="5. Delivery & Integration">
                                <div className="grid gap-2 sm:grid-cols-2">{Object.entries(delivery).map(([k, l]) => <Chk key={k} group="delivery" value={k} label={l} />)}</div>
                            </Card>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            <Card title="6. Evidence / Files Needed">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {file('screening_list', 'Screening List (CSV/Excel)', !form.data.existing_list)}
                                    {file('register_extract', 'Company Register Extract')}
                                    {file('memo', 'Scope / Request Memo')}
                                    {file('supporting', 'Supporting Documents (Optional)')}
                                </div>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">We accept .csv, .xlsx, .pdf, .docx files up to 25MB each.{form.data.existing_list ? ' A screening list is already attached to this draft.' : ''}</p>
                            </Card>
                            <Card title="7. Notes & Assumptions">
                                <Field label="Notes for the specialist team" hint={`${String(form.data.notes).length} / 1000 characters`} error={err.notes}>{(id) => <Textarea id={id} maxLength={1000} value={String(form.data.notes)} onChange={(e) => form.setData('notes', e.target.value)} />}</Field>
                                <p className="mt-3 text-xs font-semibold">Key Assumptions</p>
                                <Ticks items={['Data provided is complete and accurate', 'Records are in English or will be translated', 'Jurisdictions outside SA may incur extra costs', 'Vendor quote required for some risk data', 'Scope may be refined after initial review']} />
                            </Card>
                        </div>
                        <div className="flex flex-col gap-3 rounded-[10px] border border-attested-500/30 bg-attested-50 p-4 md:flex-row md:items-center">
                            <Info className="size-5 shrink-0 text-attested-600" aria-hidden="true" />
                            <p className="flex-1 text-xs text-ink-700">A specialist will validate your scope before final quotation, and payment is triggered only after quote acceptance. We will confirm data sources, assumptions and any vendor costs before proceeding.</p>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" disabled={form.processing} onClick={() => post('submit')} trailingIcon="arrow-right">Continue to Scope & Quote</Button>
                                <Button type="button" variant="ink" onClick={() => openAskQuestion({ subject: 'Enterprise screening request', section: 'due-diligence' })}>Talk to a Specialist</Button>
                                <Button type="button" variant="outline" disabled={form.processing} onClick={() => post('draft')}><Bookmark className="size-4" aria-hidden="true" /> Save Draft</Button>
                            </div>
                        </div>
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        <Card title="Your Request Summary">
                            <dl className="space-y-1 text-xs">
                                {[['Purpose', form.data.purpose], ['Population', form.data.population.map((p) => populations[p]).join(', ') || '—'], ['Volume', `${form.data.volume} checks per month`], ['Coverage', `${form.data.jurisdictions}${Number(form.data.extra_jurisdictions) ? ` (+${form.data.extra_jurisdictions})` : ''}`], ['Modules', `${form.data.modules.length} modules selected`], ['Delivery', form.data.delivery.map((x) => delivery[x]).join(', ') || '—'], ['Frequency', form.data.frequency === 'recurring' ? `${form.data.cadence} recurring` : 'One-time'], ['Turnaround', form.data.turnaround]].map(([k, v]) => <div key={k as string} className="grid grid-cols-3 gap-2"><dt className="text-ink-500">{k as string}</dt><dd className="col-span-2 font-medium">{String(v)}</dd></div>)}
                            </dl>
                        </Card>
                        <Card title="Preliminary Fee View (ex VAT)">
                            <dl className="space-y-1 text-xs">
                                <div className="flex justify-between"><dt>TBCA Expert Fee</dt><dd>{rand(fee.expert, 2)}</dd></div>
                                <div className="flex justify-between"><dt>TBCA Platform Fee</dt><dd>{rand(fee.platform, 2)}</dd></div>
                                <div className="flex justify-between"><dt>External Third-Party Costs*</dt><dd className="text-attested-700">Vendor Quote Required</dd></div>
                                <div className="flex justify-between"><dt>External Admin Margin (25%)</dt><dd className="text-attested-700">Vendor Quote Required</dd></div>
                                <div className="flex justify-between border-t border-parchment-300 pt-1 font-semibold"><dt>Subtotal (ex VAT)</dt><dd>From {rand(fee.subtotal, 2)}</dd></div>
                                <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{rand(fee.vat, 2)}</dd></div>
                                <div className="flex justify-between"><dt>Payment Handling Fee</dt><dd>From {rand(fee.handling, 2)}</dd></div>
                                <div className="flex justify-between rounded bg-gold-50 px-1 py-1 font-bold"><dt>Estimated Total</dt><dd>From {rand(fee.total, 2)}</dd></div>
                            </dl>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">* External costs vary by jurisdiction and vendor. Quote required. No hidden fees.</p>
                            <div className="mt-3"><TrustIcons /></div>
                        </Card>
                        {submitted.length > 0 && (
                            <Card title="Submitted requests">
                                <ul className="space-y-1.5">{submitted.map((s) => <li key={s.reference} className="flex items-center justify-between text-xs"><span className="font-mono">{s.reference}</span><StatusPill status={s.status} /></li>)}</ul>
                            </Card>
                        )}
                    </aside>
                </div>
            </section>
        </>
    );
}
