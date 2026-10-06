import { router, useForm } from '@inertiajs/react';
import { BadgeCheck, FileText, Lock, Search, ShieldCheck, UserCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { FeeSummary } from '@/Components/Aiim/FeeTable';
import AiimPage, { RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Checkbox, Field, Select, Textarea } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, Totals } from '@/types/aiim';

type Opt = { slug?: string; value?: string; name?: string; label?: string; mode?: string };

interface Props extends AiimPageProps {
    report: { reference: string; title: string; status: string; step: number; config: { type: string; nationwide: boolean; provinces: string[]; sectors: string[]; modules: string[]; delivery: string; format: string; notes?: string } };
    estimate: Totals & { typeName: string; typeMode: string; pages: string; delivery: string };
    options: { types: { value: string; label: string; mode: string }[]; provinces: { slug: string; name: string }[]; sectors: { slug: string; name: string }[]; modules: { value: string; label: string }[] };
}

function toggle(list: string[], v: string) {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export default function Configure({ report, estimate, options }: Props) {
    const c = report.config;
    const step = report.step;
    const form = useForm({ step, draft: false, type: c.type, nationwide: c.nationwide, provinces: c.provinces, sectors: c.sectors, modules: c.modules, delivery: c.delivery, format: c.format, notes: c.notes ?? '' });
    const [sectorQ, setSectorQ] = useState('');
    const save = (draft: boolean) => (e?: FormEvent) => { e?.preventDefault(); form.transform((d) => ({ ...d, draft, step: report.step })); form.post(`/aiim/reports/${report.reference}/step`, { preserveScroll: true, preserveState: 'errors' }); };
    const name = (list: Opt[], key: string) => list.find((o) => (o.slug ?? o.value) === key)?.name ?? list.find((o) => o.value === key)?.label ?? key;

    return (
        <AiimPage
            title="Report Configuration"
            crumbs={[{ label: 'Premium Intelligence' }, { label: 'Premium Brief Store', href: '/aiim/store' }, { label: 'Report Configuration' }]}
            subtitle="Configure your premium report"
            description="Customise the content, scope and delivery of your premium intelligence report."
            accent="green"
            badge={
                <div className="flex items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs">
                    <Lock className="size-6 text-gold-600" />
                    <span><span className="block text-ink-500">Report Type</span><strong className="block text-sm">{estimate.typeName}</strong>{estimate.typeMode}</span>
                </div>
            }
            rail={<><SelectionBox /><RailBox title="Need Help?"><p className="mb-3 text-xs text-ink-300">Our team is here to help you configure the right report for your decision.</p><ButtonLink href="/aiim/custom-intelligence" size="sm" className="w-full">Request Human Assistance</ButtonLink></RailBox></>}
        >
            <SectionCard className="mb-4"><Stepper steps={['Scope', 'Content', 'Delivery', 'Review']} current={step} /></SectionCard>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
                <form onSubmit={save(false)} noValidate>
                    {step === 1 && (
                        <div className="grid gap-4 lg:grid-cols-2">
                            <SectionCard number={1} title="Report Type & Geographic Scope">
                                <Field label="Report Type" error={form.errors.type}>{(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={options.types.map((t) => ({ value: t.value, label: `${t.label} — ${t.mode}` }))} />}</Field>
                                <p className="mt-3 text-xs text-ink-500">Choose the regions to be included in your report.</p>
                                <div className="mt-2 space-y-1.5">
                                    <Checkbox checked={form.data.nationwide} onChange={(e) => form.setData('nationwide', e.target.checked)} label={<span><strong>South Africa (Nationwide)</strong> <span className="text-xs text-ink-400">All 9 provinces</span></span>} />
                                    {options.provinces.map((p) => <Checkbox key={p.slug} checked={form.data.provinces.includes(p.slug)} onChange={() => form.setData('provinces', toggle(form.data.provinces, p.slug))} label={p.name} />)}
                                </div>
                                {form.errors.provinces && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.provinces}</p>}
                                <p className="mt-2 text-xs text-ink-500">{form.data.provinces.length} of 9 provinces selected · R400 per additional named province</p>
                            </SectionCard>
                            <SectionCard number={2} title="Select Sector Focus">
                                <p className="mb-2 text-xs text-ink-500">Choose one or more sectors for deep analysis (R600 external data per sector).</p>
                                <label className="mb-2 flex items-center rounded border border-parchment-500 px-2"><span className="sr-only">Search sectors</span><input value={sectorQ} onChange={(e) => setSectorQ(e.target.value)} placeholder="Search sectors…" className="h-9 flex-1 text-sm outline-none" /><Search className="size-4 text-ink-400" /></label>
                                <div className="space-y-1.5">{options.sectors.filter((s) => s.name.toLowerCase().includes(sectorQ.toLowerCase())).map((s) => <Checkbox key={s.slug} checked={form.data.sectors.includes(s.slug)} onChange={() => form.setData('sectors', toggle(form.data.sectors, s.slug))} label={s.name} />)}</div>
                                {form.errors.sectors && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.sectors}</p>}
                            </SectionCard>
                        </div>
                    )}
                    {step === 2 && (
                        <SectionCard number={3} title="Select Content Modules">
                            <p className="mb-3 text-xs text-ink-500">Choose the modules to include in your report (R350 expert fee per module).</p>
                            <div className="grid gap-2 sm:grid-cols-2">{options.modules.map((m) => <Checkbox key={m.value} checked={form.data.modules.includes(m.value)} onChange={() => form.setData('modules', toggle(form.data.modules, m.value))} label={m.label} />)}</div>
                            {form.errors.modules && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.modules}</p>}
                        </SectionCard>
                    )}
                    {step === 3 && (
                        <SectionCard number={4} title="Delivery Preferences">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Delivery Speed" error={form.errors.delivery}>{(id) => <Select id={id} value={form.data.delivery} onChange={(e) => form.setData('delivery', e.target.value)} options={[{ value: 'standard', label: 'Standard' }, { value: 'express', label: 'Express (+25% expert fee, ~half the time)' }]} />}</Field>
                                <Field label="Output Format" error={form.errors.format}>{(id) => <Select id={id} value={form.data.format} onChange={(e) => form.setData('format', e.target.value)} options={[{ value: 'pdf', label: 'PDF report' }, { value: 'pdf-excel', label: 'PDF + Excel data tables' }, { value: 'pdf-excel-dashboard', label: 'PDF + Excel + dashboard' }]} />}</Field>
                                <Field label="Notes for the research team" className="sm:col-span-2" error={form.errors.notes}>{(id) => <Textarea id={id} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} maxLength={1000} />}</Field>
                            </div>
                        </SectionCard>
                    )}
                    {step === 4 && (
                        <SectionCard title="Review Your Configuration">
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div><dt className="text-xs text-ink-500">Report Type</dt><dd className="font-semibold">{estimate.typeName}</dd></div>
                                <div><dt className="text-xs text-ink-500">Geographic Scope</dt><dd className="font-semibold">{[c.nationwide ? 'South Africa (Nationwide)' : null, ...c.provinces.map((p) => name(options.provinces, p))].filter(Boolean).join(' + ')}</dd></div>
                                <div><dt className="text-xs text-ink-500">Sectors</dt><dd className="font-semibold">{c.sectors.map((s) => name(options.sectors, s)).join(', ')}</dd></div>
                                <div><dt className="text-xs text-ink-500">Content Modules</dt><dd className="font-semibold">{c.modules.length} selected</dd></div>
                                <div><dt className="text-xs text-ink-500">Delivery</dt><dd className="font-semibold capitalize">{c.delivery} · {c.format}</dd></div>
                            </dl>
                            <div className="mt-4 flex gap-3">
                                <Button type="button" onClick={() => router.post(`/aiim/reports/${report.reference}/quote`)} trailingIcon="arrow-right">Request Formal Quotation</Button>
                                <ButtonLink href={`/aiim/reports/${report.reference}/configure?step=1`} variant="outline">Edit Scope</ButtonLink>
                            </div>
                        </SectionCard>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-3 rounded-[8px] bg-gold-50 p-3 text-xs">
                            <strong>Data Assurances</strong>
                            {[[BadgeCheck, 'Verified Sources'], [UserCheck, 'Human Review'], [FileText, 'Methodology Notes'], [ShieldCheck, 'Commercial Usage Licence']].map(([I, t]) => { const Icon = I as typeof BadgeCheck; return <span key={t as string} className="flex items-center gap-1"><Icon className="size-3.5" />{t as string}</span>; })}
                        </div>
                        {step < 4 && (
                            <div className="flex gap-2">
                                {step > 1 && <ButtonLink href={`/aiim/reports/${report.reference}/configure?step=${step - 1}`} variant="outline">Back</ButtonLink>}
                                <Button type="button" variant="outline" onClick={save(true)} disabled={form.processing}>Save as Draft</Button>
                                <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Continue to {['', 'Content', 'Delivery', 'Review'][step]}</Button>
                            </div>
                        )}
                    </div>
                </form>
                <div className="space-y-4">
                    <SectionCard title="Your Report Summary">
                        <dl className="space-y-1.5 text-xs">{[['Report Type', estimate.typeName], ['Sectors', `${c.sectors.length} selected`], ['Content Modules', `${c.modules.length} selected`], ['Estimated Pages', estimate.pages], ['Estimated Delivery', estimate.delivery]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
                    </SectionCard>
                    <SectionCard title="Estimated Investment"><FeeSummary {...estimate} /><p className="mt-2 text-[0.65rem] text-ink-400">Updates when you save each step.</p></SectionCard>
                </div>
            </div>
        </AiimPage>
    );
}
