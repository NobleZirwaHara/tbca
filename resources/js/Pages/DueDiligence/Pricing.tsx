import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Headphones, Pencil, X } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import DdIcon from '@/Components/DueDiligence/DdIcon';
import { Card, DdHero, NextStepBand, PriceSummary, rand, usd } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { DdJourneyStep, DdOption, DdOptions, DdPrice, DdSku } from '@/types/due-diligence';

interface Props {
    family: { slug: string; name: string; icon: string; subjectType: string };
    families: DdOption[];
    skus: DdSku[];
    selected: string;
    requirements: Record<string, string | number>;
    price: DdPrice;
    options: DdOptions;
    journey: DdJourneyStep[];
}

const label = (opts: DdOption[], v: string | number) => opts.find((o) => o.value === v)?.label ?? String(v);

/** DD-017 Package Comparison and Price Discovery: requirements recompute the price server side. */
export default function Pricing({ family, families, skus, selected, requirements, price, options, journey }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(requirements);
    const [submitting, setSubmitting] = useState(false);
    const sku = skus.find((s) => s.code === selected) ?? skus[0];

    const reload = (params: { family?: string; sku?: string; req?: Record<string, string | number> }) =>
        router.get('/due-diligence/pricing', { family: params.family ?? family.slug, sku: params.family ? undefined : (params.sku ?? selected), req: params.req ?? requirements }, { preserveScroll: true, preserveState: true, replace: true });

    const continueScope = () => {
        setSubmitting(true);
        router.post('/due-diligence/quotes', { family: family.slug, sku: selected, req: requirements }, { onFinish: () => setSubmitting(false) });
    };

    const set = (k: string, v: string | number) => setDraft((d) => ({ ...d, [k]: v }));

    const rows: [string, (s: DdSku) => React.ReactNode][] = [
        ["What's included", (s) => s.included],
        ['Coverage depth', (s) => s.coverage],
        ['Adverse media & sanctions', (s) => <span className="inline-flex items-center gap-1"><Check className="size-3.5 text-verified-500" aria-hidden="true" />{s.media}</span>],
        ['Ownership & directors', (s) => s.ownership],
        ['Financial review', (s) => (s.financial === 'Not included' ? <span className="inline-flex items-center gap-1"><X className="size-3.5 text-risk-500" aria-hidden="true" />Not included</span> : s.financial)],
        ['Human review level', (s) => s.reviewLevel],
        ['Deliverables', (s) => s.deliverables],
        ['SLA', (s) => s.timeline],
        ['Portal access', () => <span className="inline-flex items-center gap-1"><Check className="size-3.5 text-verified-500" aria-hidden="true" />90 days</span>],
        ['Best for', (s) => s.bestFor],
    ];

    return (
        <>
            <Head title="Package Comparison and Price Discovery" />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: 'Package Comparison and Price Discovery' }]}
                title="Package Comparison and Price Discovery"
                description="Compare packages side by side. All prices are starting prices and exclude external third-party costs, administration margin, VAT, and payment charges. Approve each external cost before commitment."
                chips={[{ label: 'Lifecycle Stage', value: 'B' }, { label: 'Public Stage', value: '1 Product or Proposal' }, { label: 'Case State', value: 'CS1 Prospect' }]}
                journey={journey}
                current={1}
            />

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-5 lg:grid-cols-12">
                    <aside className="space-y-4 lg:col-span-3">
                        <Card
                            title={<span className="flex items-center gap-2"><DdIcon name={family.icon} className="size-4 text-gold-600" /> Your requirements</span>}
                            action={!editing && <button type="button" onClick={() => { setDraft(requirements); setEditing(true); }} className="inline-flex items-center gap-1 rounded border border-parchment-400 px-2 py-0.5 text-xs hover:border-gold-500"><Pencil className="size-3" aria-hidden="true" /> Edit</button>}
                        >
                            <Field label="Service family">
                                {(id) => <Select id={id} value={family.slug} options={families} onChange={(e) => reload({ family: e.target.value })} />}
                            </Field>
                            {editing ? (
                                <form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); setEditing(false); reload({ req: draft }); }}>
                                    <Field label="Jurisdiction">{(id) => <Select id={id} value={String(draft.jurisdiction)} options={options.jurisdictions} onChange={(e) => set('jurisdiction', e.target.value)} />}</Field>
                                    <Field label="Purpose">{(id) => <Select id={id} value={String(draft.purpose)} options={options.purposes} onChange={(e) => set('purpose', e.target.value)} />}</Field>
                                    <Field label="Entity type">{(id) => <Select id={id} value={String(draft.entity_type)} options={options.entityTypes} onChange={(e) => set('entity_type', e.target.value)} />}</Field>
                                    <Field label="Estimated record age (years)">{(id) => <Input id={id} type="number" min={0} max={100} value={draft.record_age} onChange={(e) => set('record_age', Number(e.target.value))} />}</Field>
                                    <Field label="Related parties to screen">{(id) => <Input id={id} type="number" min={0} max={200} value={draft.related_parties} onChange={(e) => set('related_parties', Number(e.target.value))} />}</Field>
                                    <Field label="Complexity">{(id) => <Select id={id} value={String(draft.complexity)} options={options.complexity} onChange={(e) => set('complexity', e.target.value)} />}</Field>
                                    <Field label="Evidence readiness">{(id) => <Select id={id} value={String(draft.evidence_readiness)} options={options.readiness} onChange={(e) => set('evidence_readiness', e.target.value)} />}</Field>
                                    <Field label="Required SLA">{(id) => <Select id={id} value={String(draft.sla)} options={options.sla} onChange={(e) => set('sla', e.target.value)} />}</Field>
                                    <div className="flex gap-2">
                                        <Button type="submit" size="sm">Update price</Button>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                                    </div>
                                </form>
                            ) : (
                                <dl className="mt-3 space-y-2 text-[0.8125rem]">
                                    {[
                                        ['Jurisdiction', label(options.jurisdictions, requirements.jurisdiction)],
                                        ['Purpose', requirements.purpose],
                                        ['Entity type', requirements.entity_type],
                                        ['Estimated record age', `${requirements.record_age} years`],
                                        ['Related parties', requirements.related_parties],
                                        ['Complexity', label(options.complexity, requirements.complexity)],
                                        ['Evidence readiness', label(options.readiness, requirements.evidence_readiness)],
                                        ['Required SLA', label(options.sla, requirements.sla)],
                                    ].map(([k, v]) => (
                                        <div key={String(k)}><dt className="text-xs text-ink-500">{k}</dt><dd className="font-medium text-ink-900">{v}</dd></div>
                                    ))}
                                </dl>
                            )}
                        </Card>
                        <Card>
                            <p className="flex items-center gap-2 text-sm font-semibold"><Headphones className="size-4 text-gold-600" aria-hidden="true" /> Need help deciding?</p>
                            <p className="mt-1 text-xs text-ink-500">Speak with a specialist who can help tailor the right solution.</p>
                            <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: `${family.name}: help choosing a package`, section: 'due-diligence' })}>Request Human Assistance</Button>
                        </Card>
                    </aside>

                    <div className="lg:col-span-6">
                        <div className="overflow-x-auto rounded-[10px] border border-parchment-400 bg-white" role="radiogroup" aria-label="Compare packages">
                            <table className="w-full min-w-[560px] text-left text-xs">
                                <thead>
                                    <tr>
                                        <th className="w-36 p-3 align-bottom text-sm font-bold text-ink-900">Compare packages<span className="block text-[0.6875rem] font-normal text-ink-500">All prices ex VAT</span></th>
                                        {skus.map((s) => (
                                            <th key={s.code} className={cn('relative p-3 text-center align-bottom', s.code === selected && 'bg-gold-50')}>
                                                {s.popular && <span className="mb-1 inline-block rounded bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold text-ink-950">Most Popular</span>}
                                                <span className="block text-sm font-bold text-ink-900">{s.name.replace(family.name.replace(/s$/, ''), '').trim() || s.name}</span>
                                                <span className="block font-mono text-[0.6875rem] font-normal text-ink-500">{s.code}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {rows.map(([k, render]) => (
                                        <tr key={k}>
                                            <th scope="row" className="p-3 font-medium text-ink-700">{k}</th>
                                            {skus.map((s) => <td key={s.code} className={cn('p-3 text-ink-700', s.code === selected && 'bg-gold-50')}>{render(s)}</td>)}
                                        </tr>
                                    ))}
                                    <tr>
                                        <th scope="row" className="p-3 text-sm font-bold text-ink-900">Starting price (ex VAT)</th>
                                        {skus.map((s) => (
                                            <td key={s.code} className={cn('p-3 text-center', s.code === selected && 'bg-gold-50')}>
                                                <span className="block text-lg font-bold text-ink-900">{rand(s.expert)}</span>
                                                <span className="block text-ink-500">{usd(s.expert)}</span>
                                                <input type="radio" name="sku" aria-label={`Select ${s.name}`} checked={s.code === selected} onChange={() => reload({ sku: s.code })} className="mt-2 size-5 accent-gold-600" />
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <aside className="space-y-4 lg:col-span-3">
                        <Card title="Selected package">
                            <div className="flex items-center gap-3 rounded-[8px] border border-gold-400 bg-gold-50 p-3">
                                <DdIcon name={family.icon} className="size-8 text-gold-700" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-ink-900">{sku.name}</p>
                                    <p className="font-mono text-xs text-ink-500">{sku.code}</p>
                                </div>
                                <span className="rounded bg-verified-50 px-1.5 py-0.5 text-[0.625rem] font-semibold text-verified-700">Selected</span>
                            </div>
                            <p className="mt-2 text-xs text-ink-500">Estimated turnaround: {price.turnaround}</p>
                        </Card>
                        <Card><PriceSummary price={price} title="Price breakdown (ex VAT)" /></Card>
                        <Button type="button" size="lg" className="w-full" trailingIcon="arrow-right" disabled={submitting} onClick={continueScope}>Continue / Accept Scope</Button>
                        {!auth.user && <p className="text-center text-xs text-ink-500">You will be asked to sign in or register to save your quote.</p>}
                        <Button type="button" variant="outline" className="w-full" onClick={() => openAskQuestion({ subject: `${sku.name} pricing question`, section: 'due-diligence' })}>Ask a Question</Button>
                    </aside>
                </div>
            </section>

            <NextStepBand
                trust
                items={[
                    { icon: 'Target', title: 'Next step', body: 'Review inputs, scope, and external costs before proceeding to input requirements.' },
                    { icon: 'Headphones', title: 'Not sure which option fits?', body: 'Talk to a Due Diligence Specialist for tailored advice.' },
                ]}
            />
        </>
    );
}
