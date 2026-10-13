import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, CircleHelp, FileWarning, Headphones, Lock, MessageSquare, Ticket, UserCheck, XCircle } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import DdIcon from '@/Components/DueDiligence/DdIcon';
import { Card, DdHero, H2, IconCard, IconRow, NextStepBand, Ticks, TRUST, rand, randRange, usd } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdAddon, DdFamily, DdIconItem, DdJourneyStep, DdSku } from '@/types/due-diligence';

interface Props {
    family: DdFamily;
    skus: DdSku[];
    tab: string;
    tabs: { key: string; label: string }[];
    journey: DdJourneyStep[];
    governance: DdIconItem[];
    content: {
        inputs: { customer: string[]; subject: string[]; confirmations: string[]; uploads: string[]; issues: string[]; prepare: { title: string; body: string }[] };
        process: DdIconItem[];
        stages: DdIconItem[];
        safeguards: DdIconItem[];
        included: string[];
        notIncluded: string[];
        limitations: string[];
        reviewTriggers: { trigger: string; treatment: string }[];
        releaseControls: { title: string; body: string; tone: string }[];
        addons: DdAddon[];
        externalCosts: { item: string; min: number | null; max: number | null; plus: boolean; range: string; payable: string }[];
        faqs: { q: string; a: string }[];
        boundary: string;
    };
    related: { slug: string; name: string; icon: string }[];
}

/** DD-003 to DD-016 family overviews, with the tabbed detail views (Packages, Inputs, Process, Deliverables ...). */
export default function Family({ family, skus, tab, tabs, journey, governance, content, related }: Props) {
    const base = `/due-diligence/${family.slug}`;
    const buyable = skus.filter((s) => s.purchasable);
    const [selected, setSelected] = useState<string | null>(null);
    const selectedSku = skus.find((s) => s.code === selected) ?? null;
    const ask = (subject = `${family.name} enquiry`) => openAskQuestion({ subject, section: 'due-diligence' });
    const startHref = family.slug === 'enterprise' || family.slug === 'portal-api' ? '/due-diligence/enterprise/request' : buyable.length ? `/due-diligence/pricing?family=${family.slug}` : '/due-diligence/enterprise/request';
    const skuHref = (s: DdSku) => (s.purchasable ? `/due-diligence/pricing?family=${family.slug}&sku=${s.code}` : '/due-diligence/enterprise/request');

    return (
        <>
            <Head title={family.title} />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: family.title, href: tab === 'overview' ? undefined : base }, ...(tab !== 'overview' ? [{ label: tabs.find((t) => t.key === tab)?.label ?? '' }] : [])]}
                title={family.title}
                subtitle={family.subtitle}
                description={family.description}
                journey={journey}
                current={1}
            >
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <ButtonLink href={startHref} trailingIcon="arrow-right">{family.cta}</ButtonLink>
                    <ButtonLink href={`${base}/packages`} variant="outline-light">Compare Packages</ButtonLink>
                    <button type="button" onClick={() => ask()} className="inline-flex items-center gap-1 text-sm font-semibold text-gold-400 underline-offset-4 hover:underline">
                        Talk to a Specialist <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </DdHero>

            <nav aria-label={`${family.name} sections`} className="sticky top-0 z-20 border-b border-parchment-400 bg-white/95 backdrop-blur">
                <div className="container-tbca flex gap-1 overflow-x-auto">
                    {tabs.map((t) => (
                        <Link
                            key={t.key}
                            href={t.key === 'overview' ? base : `${base}/${t.key}`}
                            preserveScroll
                            aria-current={t.key === tab ? 'page' : undefined}
                            className={cn('-mb-px shrink-0 border-b-2 px-3 py-3 text-[0.8125rem] font-medium whitespace-nowrap', t.key === tab ? 'border-gold-500 text-gold-700' : 'border-transparent text-ink-500 hover:text-ink-900')}
                        >
                            {t.label}
                        </Link>
                    ))}
                </div>
            </nav>

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    <div className="mb-4 flex justify-end">
                        <span className="inline-flex items-center gap-2 rounded-[6px] border border-parchment-400 bg-white px-3 py-1.5 text-xs text-ink-700">
                            Sample Case: {family.sample}
                            {family.sampleCode && <span className="font-mono text-ink-500">{family.sampleCode}</span>}
                            <span className="rounded bg-gold-100 px-1.5 py-0.5 text-[0.625rem] font-bold text-gold-800">SAMPLE</span>
                        </span>
                    </div>

                    {tab === 'overview' && family.template === 'tiers' && <TierOverview family={family} skus={skus} governance={governance} skuHref={skuHref} />}
                    {tab === 'overview' && family.template === 'table' && (
                        <TableOverview family={family} skus={skus} selected={selectedSku} onSelect={setSelected} skuHref={skuHref} ask={ask} />
                    )}
                    {tab === 'packages' && <Packages skus={skus} skuHref={skuHref} />}
                    {tab === 'included' && <Included family={family} content={content} />}
                    {tab === 'inputs-required' && <Inputs family={family} content={content} />}
                    {tab === 'process' && <Process family={family} content={content} />}
                    {tab === 'deliverables' && <Deliverables family={family} skus={skus} content={content} ask={ask} />}
                    {tab === 'risk-review' && <RiskReview content={content} />}
                    {tab === 'add-ons' && <AddOns content={content} />}
                    {tab === 'faqs' && <Faqs content={content} />}
                    {tab === 'support' && <Support family={family} ask={ask} related={related} />}

                    <p className="mt-8 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs text-ink-500">{content.boundary}</p>
                </div>
            </section>

            {family.template === 'table' && tab === 'overview' ? (
                <NextStepBand
                    items={[
                        { icon: 'Target', title: 'Next step', body: selectedSku ? `Continue with ${selectedSku.name} to see inputs, process and deliverables.` : 'Select a service option to see inputs, process and deliverables.' },
                        { icon: 'Headphones', title: 'Not sure which option fits?', body: 'Talk to a Specialist for tailored advice.' },
                    ]}
                    actions={
                        <>
                            <ButtonLink href={selectedSku ? skuHref(selectedSku) : startHref} trailingIcon="arrow-right">Explore / Select Service</ButtonLink>
                            <Button type="button" variant="outline-light" onClick={() => ask()}>Ask a Question</Button>
                        </>
                    }
                />
            ) : (
                <section className="bg-ink-950">
                    <div className="container-tbca flex flex-col gap-4 py-6 text-parchment-100 md:flex-row md:items-center">
                        <DdIcon name="ShieldCheck" className="size-10 text-gold-400" />
                        <div className="flex-1">
                            <p className="text-lg font-semibold">Ready to run {/^[AEIOU]/.test(family.name) ? 'an' : 'a'} {family.name.replace(/s$/, '').replace(' Checks', ' Check')}?</p>
                            <p className="text-sm text-ink-300">Choose the right package, confirm the permitted purpose and continue to secure consent and intake.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <ButtonLink href={startHref} trailingIcon="arrow-right">{family.cta}</ButtonLink>
                            <ButtonLink href={`${base}/inputs-required`} variant="outline-light">View Inputs Required</ButtonLink>
                            <Button type="button" variant="outline-light" onClick={() => ask()}>Talk to a Specialist</Button>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}

/* ------------------------------------------------------------------ overview: tiers */

function TierOverview({ family, skus, governance, skuHref }: { family: DdFamily; skus: DdSku[]; governance: DdIconItem[]; skuHref: (s: DdSku) => string }) {
    return (
        <div className="grid gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-7">
                <div>
                    <H2 className="mb-3">What this service covers</H2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {family.covers.map((c) => <IconCard key={c.title} item={c} />)}
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    {family.useCases.length > 0 && (
                        <Card title="Typical use cases">
                            <div className="grid gap-3 sm:grid-cols-2">{family.useCases.map((u) => <IconRow key={u.title} item={u} />)}</div>
                        </Card>
                    )}
                    <Card title="What you receive">
                        <div className="grid gap-3 sm:grid-cols-2">{family.receive.map((u) => <IconRow key={u.title} item={u} />)}</div>
                    </Card>
                </div>
                <Card title="Turnaround and governance">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{governance.map((g) => <IconRow key={g.title} item={g} />)}</div>
                </Card>
            </div>
            <div className="xl:col-span-5">
                <Card title="Transparent pricing. No hidden fees.">
                    <div className="grid gap-3 sm:grid-cols-3">
                        {skus.map((s) => (
                            <div key={s.code} className={cn('relative flex flex-col overflow-hidden rounded-[8px] border', s.popular ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                {s.popular && <span className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b bg-ink-950 px-2 py-0.5 text-[0.5625rem] font-bold tracking-wide text-gold-300">MOST POPULAR</span>}
                                <div className={cn('px-2 pt-4 pb-2 text-center text-[0.8125rem] font-semibold', s.popular ? 'bg-gold-500 text-ink-950' : 'bg-ink-950 text-parchment-100')}>
                                    {s.label.split(' (')[0]}
                                    <span className="block text-[0.6875rem] font-normal">({s.label.split(' (')[1] ?? s.coverage})</span>
                                </div>
                                <div className="flex flex-1 flex-col p-3 text-center">
                                    <p className="text-xl font-bold text-ink-900">{rand((s.expert ?? 0) + (s.platform ?? 0) + s.external)}</p>
                                    <p className="text-[0.6875rem] text-ink-500">{usd((s.expert ?? 0) + (s.platform ?? 0) + s.external)} · VAT excl.</p>
                                    <dl className="mt-3 space-y-2 text-left text-[0.6875rem]">
                                        <div><dt className="font-semibold text-ink-800">TBCA Expert Fee</dt><dd className="text-ink-600">{rand(s.expert)} / {usd(s.expert)}</dd></div>
                                        <div><dt className="font-semibold text-ink-800">TBCA Platform Fee</dt><dd className="text-ink-600">{rand(s.platform)} / {usd(s.platform)}</dd></div>
                                        <div><dt className="font-semibold text-ink-800">Third-Party / External Fees*</dt><dd className="text-ink-600">{rand(s.external)} / {usd(s.external)}</dd></div>
                                    </dl>
                                    <p className="mt-2 text-[0.625rem] text-ink-400">External costs vary by jurisdiction and scope.</p>
                                    <ButtonLink href={skuHref(s)} size="sm" variant={s.popular ? 'gold' : 'outline'} className="mt-3 w-full">Select</ButtonLink>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-[0.6875rem] text-ink-500">* External fees are pass-through costs charged by data providers, registries or authorities. External costs vary by jurisdiction and scope. A 25% administration margin applies to external costs where lawful.</p>
                    <p className="mt-1 text-[0.6875rem] text-ink-500">Typical turnaround: {family.sla}</p>
                </Card>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ overview: SKU table */

function TableOverview({ family, skus, selected, onSelect, skuHref, ask }: { family: DdFamily; skus: DdSku[]; selected: DdSku | null; onSelect: (c: string) => void; skuHref: (s: DdSku) => string; ask: (s?: string) => void }) {
    const timeCol = family.slug === 'monitoring' ? 'Frequency / Timeline' : 'Timeline';
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-9">
                <div>
                    <H2 className="mb-3">What this service covers</H2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{family.covers.map((c) => <IconCard key={c.title} item={c} compact />)}</div>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <H2 className="mb-3">You receive</H2>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{family.receive.map((r) => <IconRow key={r.title} item={r} />)}</div>
                    </div>
                    <div>
                        <H2 className="mb-3">Why it matters</H2>
                        <Ticks items={family.why} tone="gold" />
                    </div>
                </div>
                <Card title={<>Service options and pricing <span className="font-normal text-ink-500">(South African Rand)</span></>}>
                    <div className="overflow-x-auto" role="radiogroup" aria-label="Service options">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="bg-parchment-200 text-ink-600">
                                <tr>
                                    {['SKU / Fee Code', 'Service', "What's Included", timeCol, 'TBCA Expert Fee (excl. VAT)', 'TBCA Platform Fee (excl. VAT)', 'External Costs*', 'Total Estimate (excl. VAT)', 'Select'].map((h) => (
                                        <th key={h} className="px-2 py-2 font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment-300">
                                {skus.map((s) => (
                                    <tr key={s.code} className={cn('cursor-pointer hover:bg-gold-50', selected?.code === s.code && 'bg-gold-50')} onClick={() => onSelect(s.code)}>
                                        <td className="px-2 py-2.5 font-mono text-[0.6875rem] whitespace-nowrap text-ink-600">
                                            {s.popular && <span className="mr-1 rounded bg-gold-500 px-1 text-[0.5625rem] font-bold text-ink-950">POPULAR</span>}
                                            {s.code}
                                        </td>
                                        <td className="px-2 py-2.5 font-semibold text-ink-900">{s.name}</td>
                                        <td className="px-2 py-2.5 text-ink-600">{s.included}</td>
                                        <td className="px-2 py-2.5 whitespace-nowrap">{s.timeline}</td>
                                        <td className="px-2 py-2.5 whitespace-nowrap">{s.expert === null ? 'Quote' : rand(s.expert) + (s.unit === 'monthly' ? '/month' : '')}</td>
                                        <td className="px-2 py-2.5 whitespace-nowrap">{s.platform === null ? '' : rand(s.platform)}</td>
                                        <td className="px-2 py-2.5">{s.externalLabel}</td>
                                        <td className="px-2 py-2.5 font-semibold whitespace-nowrap">{s.total === null ? 'Quote' : `From ${rand(s.total)}${s.unit === 'monthly' ? '/mo' : ''}`}</td>
                                        <td className="px-2 py-2.5">
                                            <input type="radio" name="sku" aria-label={`Select ${s.name}`} checked={selected?.code === s.code} onChange={() => onSelect(s.code)} className="size-4 accent-gold-600" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">* External costs include third-party data provider fees, government filing fees and courier/legalisation where applicable. They are charged at actual cost plus a 25% administration margin where lawful.</p>
                </Card>
            </div>
            <aside className="space-y-4 lg:col-span-3">
                <Card title="Your selection">
                    <div className="flex items-start gap-3 rounded-[8px] border border-parchment-400 p-3">
                        <DdIcon name={family.icon} className="size-8 text-ink-700" />
                        <div>
                            <p className="text-sm font-semibold text-ink-900">{selected ? selected.name : family.name}</p>
                            <p className="text-xs text-ink-500">{selected ? `${selected.code} · ${selected.total === null ? 'Quote' : 'From ' + rand(selected.total)}` : 'Please select a service option to continue.'}</p>
                        </div>
                    </div>
                    {selected && <ButtonLink href={skuHref(selected)} size="sm" className="mt-3 w-full" trailingIcon="arrow-right">{selected.purchasable ? 'Continue' : 'Request Scope'}</ButtonLink>}
                </Card>
                <Card title="Typical triggers"><Ticks items={family.triggers} /></Card>
                <Card title="Need help choosing?">
                    <div className="space-y-2">
                        <ButtonLink href={`/due-diligence/${family.slug}/packages`} variant="outline" size="sm" className="w-full">Compare all options</ButtonLink>
                        <Button type="button" size="sm" className="w-full" onClick={() => ask(`${family.name}: help choosing an option`)}>Ask a Specialist</Button>
                    </div>
                </Card>
                <Card title="Trust & assurance">
                    <ul className="grid grid-cols-2 gap-3">
                        {TRUST.map(({ title, icon: I }) => (
                            <li key={title} className="flex flex-col items-center gap-1 text-center text-[0.6875rem] text-ink-700"><I className="size-5 text-gold-600" aria-hidden="true" />{title}</li>
                        ))}
                    </ul>
                </Card>
            </aside>
        </div>
    );
}

/* ------------------------------------------------------------------ tabs */

function Packages({ skus, skuHref }: { skus: DdSku[]; skuHref: (s: DdSku) => string }) {
    return (
        <div>
            <H2 className="mb-1">Choose your package</H2>
            <p className="mb-4 text-sm text-ink-500">Select the verification and review level appropriate to the decision being prepared. Turnaround and price are confirmed before checkout.</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {skus.map((s) => (
                    <div key={s.code} className={cn('relative flex flex-col rounded-[10px] border bg-white p-5', s.popular ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}>
                        {s.reviewMandatory && s.tier !== 'essential' && <span className="absolute -top-2.5 right-4 rounded bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold text-ink-950">ENHANCED REVIEW</span>}
                        <p className="text-base font-bold text-ink-900">{s.name}</p>
                        <p className="font-mono text-xs text-gold-700">{s.code}</p>
                        <p className="mt-2 text-[0.8125rem] text-ink-600">{s.included}</p>
                        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div><dt className="text-ink-400">Automation</dt><dd className="font-semibold">{s.automation}</dd></div>
                            <div><dt className="text-ink-400">Human review</dt><dd className="font-semibold">{s.reviewMandatory ? 'Mandatory before release' : 'Triggered on mismatch, hit or dispute'}</dd></div>
                            <div><dt className="text-ink-400">Review level</dt><dd className="font-semibold">{s.reviewLevel}</dd></div>
                            <div><dt className="text-ink-400">Turnaround</dt><dd className="font-semibold">{s.timeline}</dd></div>
                        </dl>
                        <p className="mt-4 text-lg font-bold text-ink-900">{s.total === null ? 'Quote on scope' : `From ${rand(s.total)}${s.unit === 'monthly' ? ' / month' : s.unit === 'per alert' ? ' / alert' : ''}`}</p>
                        <p className="text-[0.6875rem] text-ink-500">Expert + platform, ex VAT. External costs at cost.</p>
                        <div className="mt-auto pt-4">
                            <ButtonLink href={skuHref(s)} size="sm" variant={s.popular ? 'gold' : 'outline'} className="w-full" trailingIcon="arrow-right">
                                {s.purchasable ? `Select ${s.tier === 'essential' ? 'Package' : s.name.split(' ').slice(-1)[0]}` : 'Request Scope'}
                            </ButtonLink>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Included({ family, content }: { family: DdFamily; content: Props['content'] }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{family.covers.map((c) => <IconCard key={c.title} item={c} />)}</div>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Included deliverables"><Ticks items={content.included} /></Card>
                <Card title="Not included">
                    <ul className="space-y-1.5">{content.notIncluded.map((t) => <li key={t} className="flex gap-2 text-[0.8125rem] text-ink-700"><XCircle className="mt-0.5 size-4 shrink-0 text-risk-500" aria-hidden="true" />{t}</li>)}</ul>
                </Card>
                <Card title="Known limitations">
                    <ul className="space-y-1.5">{content.limitations.map((t) => <li key={t} className="flex gap-2 text-[0.8125rem] text-ink-700"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-attested-500" aria-hidden="true" />{t}</li>)}</ul>
                </Card>
            </div>
        </div>
    );
}

function Inputs({ family, content }: { family: DdFamily; content: Props['content'] }) {
    const cols = [
        { title: 'Customer Information Required', items: content.inputs.customer, note: 'Used to establish the requestor, the purpose of the check and the correct service route.' },
        { title: 'Subject Information Required', items: content.inputs.subject, note: 'Only the minimum required personal information should be collected for the selected package and lawful purpose.' },
        { title: 'Required Confirmations', items: content.inputs.confirmations, note: `No ${family.name.replace(/s$/, '')} starts without a stated purpose and the required processing consent.` },
        { title: 'Secure Uploads & Evidence', items: content.inputs.uploads, note: 'Files are submitted through a controlled intake workflow and stored for case processing and review.' },
    ];
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-9">
                <H2>What We Need From You</H2>
                <p className="mb-4 text-sm text-ink-500">Provide the minimum required information so the check can be scoped, consented and processed correctly.</p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {cols.map((c, i) => (
                        <Card key={c.title} title={<span className="flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-full bg-gold-500 text-xs text-ink-950">{i + 1}</span>{c.title}</span>}>
                            <Ticks items={c.items} tone="gold" />
                            <p className="mt-3 rounded bg-gold-50 p-2 text-[0.6875rem] text-ink-600">{c.note}</p>
                        </Card>
                    ))}
                </div>
                <H2 className="mt-6 mb-3">How to Prepare Your Submission</H2>
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {content.inputs.prepare.map((p, i) => (
                        <li key={p.title} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                            <p className="text-sm font-semibold text-ink-900">{i + 1}. {p.title}</p>
                            <p className="text-xs text-ink-500">{p.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
            <aside className="space-y-4 lg:col-span-3">
                <div className="rounded-[10px] border border-gold-400 bg-gold-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-ink-900"><Lock className="size-4 text-gold-700" aria-hidden="true" /> Consent & Privacy Control</p>
                    <p className="mt-2 text-xs text-ink-600">TBCA processes checks only for a stated purpose and only after the required authority or consent is confirmed. Sensitive information is handled through secure intake, controlled review and portal-based report delivery.</p>
                </div>
                <Card title="Common Input Issues">
                    <ul className="space-y-1.5">{content.inputs.issues.map((t) => <li key={t} className="flex items-center gap-2 text-[0.8125rem] text-ink-700"><FileWarning className="size-4 text-attested-500" aria-hidden="true" />{t}</li>)}</ul>
                </Card>
                <ButtonLink href={`/due-diligence/pricing?family=${family.slug}`} className="w-full" trailingIcon="arrow-right">Continue to Secure Intake</ButtonLink>
            </aside>
        </div>
    );
}

function Process({ family, content }: { family: DdFamily; content: Props['content'] }) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-9">
                <H2 className="mb-4">The 7-Step {family.name.replace(/s$/, '')} Process</H2>
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    {content.process.map((p, i) => (
                        <li key={p.title} className="rounded-[10px] border border-parchment-400 bg-white p-3 text-center">
                            <span className="mx-auto flex size-7 items-center justify-center rounded-full border-2 border-gold-500 text-xs font-bold text-gold-700">{i + 1}</span>
                            <span className="mx-auto mt-2 flex size-12 items-center justify-center rounded-[8px] bg-ink-950 text-gold-400"><DdIcon name={p.icon} className="size-6" /></span>
                            <p className="mt-2 text-[0.8125rem] font-semibold text-ink-900">{p.title}</p>
                            <p className="mt-1 text-[0.6875rem] text-ink-500">{p.body}</p>
                        </li>
                    ))}
                </ol>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card title="Who Performs Each Step?">
                        <dl className="space-y-1.5 text-[0.8125rem]">
                            {[['Steps 1–3', 'You (Client)'], ['Steps 4–5', 'TBCA Systems + Approved Sources'], ['Steps 5–6', 'TBCA Specialists (Human Review)'], ['Step 7', 'TBCA Client Portal']].map(([a, b]) => (
                                <div key={a} className="flex gap-2"><dt className="w-20 shrink-0 font-semibold">{a}</dt><dd className="text-ink-600">{b}</dd></div>
                            ))}
                        </dl>
                    </Card>
                    <Card title="Typical Triggers for Human Review">
                        <Ticks items={['Identity mismatch or data inconsistency', 'Potential sanctions, PEP or RCA match', 'Adverse-media concern', 'Poor data quality or incomplete evidence', 'Client dispute or request for review', 'Enhanced / Executive package (always)']} tone="gold" />
                    </Card>
                    <Card title="Communication & Updates">
                        <p className="text-[0.8125rem] text-ink-600">We keep you informed at key milestones. Email or WhatsApp notifications are sent when your report is ready in the secure portal — never the results themselves.</p>
                    </Card>
                    <Card title="Secure Delivery">
                        <Ticks items={['Final reports delivered via TBCA Client Portal', 'Downloadable reports', 'Evidence summary and reviewer notes included', 'Versioned and timestamped records']} />
                    </Card>
                </div>
                <H2 className="mt-6 mb-3">What happens at each stage</H2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{content.stages.map((s) => <IconCard key={s.title} item={s} compact />)}</div>
            </div>
            <aside className="space-y-4 lg:col-span-3">
                <Card title="Why This Process Matters">
                    <Ticks items={['Combines automation, approved data sources and human judgment.', 'Ensures legal, ethical and POPIA-compliant handling of personal information.', 'Protects against false positives through human review and evidence validation.', 'Delivers reliable, decision-ready information for responsible action.']} tone="gold" />
                </Card>
                <div className="flex gap-3 rounded-[10px] border border-gold-400 bg-gold-50 p-4 text-xs text-ink-700">
                    <Lock className="size-5 shrink-0 text-gold-700" aria-hidden="true" />
                    No check starts without a permitted purpose and the required consent. Your information is secure and used only for the stated purpose.
                </div>
                <Card title="Controls and safeguards">
                    <div className="space-y-2">{content.safeguards.map((s) => <IconRow key={s.title} item={s} />)}</div>
                </Card>
            </aside>
        </div>
    );
}

function Deliverables({ family, skus, content, ask }: { family: DdFamily; skus: DdSku[]; content: Props['content']; ask: (s?: string) => void }) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-9">
                <div>
                    <H2>What You Receive</H2>
                    <p className="text-sm text-ink-500">Each check is released as a controlled, decision-support deliverable with clear scope, status, evidence references and release controls.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {skus.filter((s) => s.expert !== null).slice(0, 3).map((s) => (
                        <Card key={s.code} title={s.name} action={s.reviewMandatory ? <span className="rounded bg-gold-500 px-1.5 text-[0.5625rem] font-bold text-ink-950">REVIEWED</span> : undefined}>
                            <Ticks items={[...s.included.split(/,\s*(?![^()]*\))/).map((x) => x.replace(/\.$/, '')), s.deliverables, 'Limitations and next steps']} tone="gold" />
                            <p className="mt-3 text-[0.6875rem] text-ink-500">{s.reviewMandatory ? 'Mandatory reviewer release before final issue' : 'Controlled release via secure portal'}</p>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card title="Secure Portal Delivery"><Ticks items={['Final PDF Report', 'Evidence Summary', 'Risk Status', 'Reviewer Notes', 'Report Version', 'Download from Secure Portal']} /></Card>
                    <Card title="Evidence & Audit Trail"><Ticks items={['Source summary', 'Check timestamps', 'Version history', 'Release log', 'Case reference', 'Permission-controlled access']} /></Card>
                    <Card title="Notifications & Access"><Ticks items={['Email or WhatsApp readiness alert', 'Secure portal login required', 'Download history', 'Access controlled by case permissions', 'No sensitive report sent as ordinary attachment']} /></Card>
                </div>
                <Card title="Release Controls" action={<span className="text-[0.6875rem] text-ink-500">These are workflow states, not legal conclusions.</span>}>
                    <div className="grid gap-3 md:grid-cols-3">
                        {content.releaseControls.map((r) => (
                            <div key={r.title} className={cn('rounded-[8px] border p-3', { good: 'border-verified-500/40 bg-verified-50', warn: 'border-attested-500/40 bg-attested-50', bad: 'border-risk-500/30 bg-risk-50' }[r.tone])}>
                                <p className="text-[0.8125rem] font-semibold text-ink-900">{r.title}</p>
                                <p className="text-xs text-ink-600">{r.body}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <div>
                    <H2 className="mb-3">What the deliverables help you do</H2>
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {family.receive.map((r) => <IconCard key={r.title} item={{ title: r.title, icon: r.icon }} compact />)}
                    </div>
                </div>
            </div>
            <aside className="lg:col-span-3">
                <Card title="Need Help Interpreting the Deliverables?">
                    <ul className="space-y-2">
                        {[
                            { label: 'Ask a Question', icon: CircleHelp, onClick: () => ask(`${family.name}: deliverables question`) },
                            { label: 'Talk to a Specialist', icon: Headphones, onClick: () => ask(`${family.name}: specialist call`) },
                            { label: 'Request Enterprise Screening', icon: UserCheck, href: '/due-diligence/enterprise/request' },
                            { label: 'Open a Support Ticket', icon: Ticket, href: '/contact' },
                            { label: 'Request a Correction', icon: MessageSquare, href: '/due-diligence/cases' },
                        ].map((x) => {
                            const inner = <><x.icon className="size-4 text-gold-600" aria-hidden="true" /><span className="flex-1">{x.label}</span><ChevronRight className="size-4 text-ink-400" aria-hidden="true" /></>;
                            const cls = 'flex w-full items-center gap-2 rounded-[6px] border border-parchment-400 px-3 py-2 text-left text-[0.8125rem] hover:border-gold-500';
                            return <li key={x.label}>{x.href ? <Link href={x.href} className={cls}>{inner}</Link> : <button type="button" onClick={x.onClick} className={cls}>{inner}</button>}</li>;
                        })}
                    </ul>
                </Card>
            </aside>
        </div>
    );
}

function RiskReview({ content }: { content: Props['content'] }) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
                <H2 className="mb-1">Human and qualified-partner review matrix</H2>
                <p className="mb-4 text-sm text-ink-500">Risk flags lock release and create a reviewer task. You see review status, never raw vendor output.</p>
                <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                    <table className="w-full text-left text-[0.8125rem]">
                        <thead className="bg-parchment-200 text-xs text-ink-600"><tr><th className="px-3 py-2">Trigger</th><th className="px-3 py-2">Treatment</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {content.reviewTriggers.map((r) => <tr key={r.trigger}><td className="px-3 py-2 font-medium text-ink-900">{r.trigger}</td><td className="px-3 py-2 text-ink-600">{r.treatment}</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <aside className="space-y-3 lg:col-span-4">
                {content.releaseControls.map((r) => (
                    <div key={r.title} className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><CheckCircle2 className="size-4 text-gold-600" aria-hidden="true" />{r.title}</p>
                        <p className="mt-1 text-xs text-ink-600">{r.body}</p>
                    </div>
                ))}
                <p className="rounded-[8px] bg-ink-950 p-4 text-xs text-parchment-200">Risk language: we say “Potential match under human review”, never “Sanctioned” or “Failed” before an approved disposition.</p>
            </aside>
        </div>
    );
}

function AddOns({ content }: { content: Props['content'] }) {
    return (
        <div className="grid gap-6 xl:grid-cols-12">
            <Card title="Optional Add-Ons (Board-provisional pricing)" className="xl:col-span-7">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-xs">
                        <thead className="text-ink-500"><tr>{['Add-On', 'What it includes', "When it's useful", 'Timeline impact', 'Fee*'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {content.addons.map((a) => (
                                <tr key={a.code}>
                                    <td className="px-2 py-2 font-semibold"><span className="flex items-center gap-2"><DdIcon name={a.icon} className="size-4 text-gold-600" />{a.name}</span></td>
                                    <td className="px-2 py-2 text-ink-600">{a.includes}</td>
                                    <td className="px-2 py-2 text-ink-600">{a.useful}</td>
                                    <td className="px-2 py-2">{a.timeline}</td>
                                    <td className="px-2 py-2 font-semibold whitespace-nowrap">From {rand(a.zar)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-2 text-[0.6875rem] text-ink-500">* Board-provisional fees exclude VAT. Final pricing confirmed during quote acceptance. Add-ons are selected inside your quote journey.</p>
            </Card>
            <Card title="Common External Costs (At Cost)" className="xl:col-span-5">
                <table className="w-full text-left text-xs">
                    <thead className="text-ink-500"><tr><th className="py-2">External Cost Item</th><th>Typical Range (ex VAT)</th><th>Payable To</th></tr></thead>
                    <tbody className="divide-y divide-parchment-300">{content.externalCosts.map((e) => <tr key={e.item}><td className="py-2 font-medium">{e.item}</td><td>{e.min === null ? e.range : randRange(e.min, e.max, e.plus)}</td><td>{e.payable}</td></tr>)}</tbody>
                </table>
                <p className="mt-3 rounded bg-gold-50 p-2 text-[0.6875rem] text-ink-600">All external costs are variable and passed through at actual cost. You will approve each item before payment.</p>
            </Card>
        </div>
    );
}

function Faqs({ content }: { content: Props['content'] }) {
    return (
        <div className="mx-auto max-w-3xl space-y-2">
            {content.faqs.map((f) => (
                <details key={f.q} className="group rounded-[8px] border border-parchment-400 bg-white p-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-semibold text-ink-900">
                        {f.q}
                        <ChevronRight className="size-4 shrink-0 transition group-open:rotate-90" aria-hidden="true" />
                    </summary>
                    <p className="mt-2 text-[0.8125rem] text-ink-600">{f.a}</p>
                </details>
            ))}
        </div>
    );
}

function Support({ family, ask, related }: { family: DdFamily; ask: (s?: string) => void; related: { slug: string; name: string; icon: string }[] }) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Talk to the Due Diligence team">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Button type="button" onClick={() => ask(`${family.name}: question`)}>Ask a Question</Button>
                    <Button type="button" variant="outline" onClick={() => ask(`${family.name}: book a specialist call`)}>Talk to a Specialist</Button>
                    <ButtonLink href="/due-diligence/enterprise/request" variant="outline">Request Enterprise Screening</ButtonLink>
                    <ButtonLink href="/due-diligence/cases" variant="outline">My Cases & Disputes</ButtonLink>
                </div>
                <p className="mt-3 text-xs text-ink-500">Sensitive results are never shared by message or email. Our team will direct you to your secure portal.</p>
            </Card>
            <Card title="Related services">
                <ul className="grid gap-2 sm:grid-cols-2">
                    {related.map((r) => (
                        <li key={r.slug}><Link href={`/due-diligence/${r.slug}`} className="flex items-center gap-2 rounded-[6px] border border-parchment-400 px-3 py-2 text-[0.8125rem] hover:border-gold-500"><DdIcon name={r.icon} className="size-4 text-gold-600" />{r.name}</Link></li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
