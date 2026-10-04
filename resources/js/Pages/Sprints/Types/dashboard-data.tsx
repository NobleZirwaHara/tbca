import { Link } from '@inertiajs/react';
import {
    BadgeCheck,
    BarChart3,
    CalendarDays,
    Clock,
    Database,
    FileText,
    Globe,
    Handshake,
    Layers,
    LayoutDashboard,
    MonitorSmartphone,
    Package,
    Percent,
    ShieldCheck,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import {
    AskButton,
    Box,
    CheckList,
    Crumbs,
    GoldLink,
    RelatedSprints,
    SaveButton,
    TrustStrip,
    attrsOf,
    list,
    orderHref,
    pairs,
    quoteHref,
    usePackage,
    useMoney,
} from '@/Components/SprintTypes/B/common';
import { DataFlowVisual } from '@/Components/SprintTypes/B/DataVisual';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { DashboardDataAttributes } from '@/types/sprint-types-b';

const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'included', label: "What's Included" },
    { key: 'process', label: 'Dashboard Process' },
    { key: 'deliverables', label: 'Deliverables' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'faqs', label: 'FAQs' },
];

const includedIcons = [Layers, Database, LayoutDashboard, BarChart3, ShieldCheck, FileText, Users];
const factIcons = [Clock, FileText, Globe, UserCheck, Handshake, Database];

function defaultFaqs(sprint: SprintRecord) {
    return [
        { q: 'How long does this sprint take?', a: `Typical delivery is ${sprint.delivery ?? 'confirmed at scoping'}, starting once access to your data sources and stakeholders is confirmed.` },
        { q: 'Are software licences included?', a: 'No. Vendor and licence costs are separate where applicable. We build on your approved BI platform or recommend one during discovery.' },
        { q: 'Is the dashboard reviewed by a person?', a: 'Yes. Every build is validated and human-reviewed before handover, with a documented KPI dictionary.' },
        { q: 'Can we upgrade the package later?', a: 'Yes. You can move from Basic to Standard or Premium; the price difference is quoted against the work already completed.' },
    ];
}

export default function DashboardDataSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<DashboardDataAttributes>(sprint);
    const money = useMoney();
    const { packages, selected, setSelected, current } = usePackage(sprint);
    const [tab, setTab] = useState('overview');
    const isQuote = sprint.commercial_act === 'quote';
    const ctaHref = isQuote ? quoteHref(sprint, selected) : orderHref(sprint, selected);
    const faqs = a.faqs?.length ? a.faqs : defaultFaqs(sprint);
    const facts = pairs(a.facts);
    const process = list(a.process);

    const overview = (
        <Box title="Overview">
            <p className="text-[0.8125rem] leading-relaxed text-ink-600">{a.overview ?? sprint.description}</p>
        </Box>
    );
    const outcomes = (
        <Box title="Key Outcomes">
            <CheckList items={list(a.key_outcomes)} />
        </Box>
    );
    const included = (
        <Box title="What's Included">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {list(a.whats_included).map((w, i) => {
                    const Icon = includedIcons[i % includedIcons.length];
                    return (
                        <li key={w} className="flex items-center gap-2 text-xs text-ink-700">
                            <Icon className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                            {w}
                        </li>
                    );
                })}
            </ul>
        </Box>
    );
    const deliverables = (
        <Box title={a.deliverables_title ?? 'Dashboard Deliverables (Standard Package)'}>
            <CheckList items={list(a.deliverables)} cols={2} />
        </Box>
    );
    const processBox = (
        <Box title={a.process_title ?? '6-Step Dashboard Process'}>
            <ol className="grid grid-cols-3 gap-y-4 sm:grid-cols-6">
                {process.map((p, i) => (
                    <li key={p} className="relative flex flex-col items-center text-center">
                        {i > 0 && <span aria-hidden="true" className="absolute top-4 right-1/2 hidden h-px w-full border-t border-dashed border-gold-400 sm:block" />}
                        <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-white shadow">{i + 1}</span>
                        <span className="mt-1.5 px-1 text-[0.6875rem] leading-tight text-ink-700">{p}</span>
                    </li>
                ))}
            </ol>
        </Box>
    );
    const needs = (
        <Box title="What We Need From You">
            <CheckList items={list(a.we_need)} />
        </Box>
    );
    const addons = (
        <Box title="Optional Add-ons">
            <CheckList items={list(a.addons)} />
        </Box>
    );
    const exclusions = (
        <Box title="Exclusions">
            <CheckList items={list(a.exclusions)} />
        </Box>
    );
    const why = (
        <Box title="Why TBCA Instead of a Generic Dashboard Route">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr>
                            <th className="rounded-l bg-parchment-300 px-2 py-1.5 font-semibold text-ink-800">Generic / DIY Dashboard Route</th>
                            <th className="rounded-r bg-gold-100 px-2 py-1.5 font-semibold text-gold-800">TBCA Governed Dashboard / Data Sprint</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pairs(a.why).map(([g, t]) => (
                            <tr key={g} className="border-b border-parchment-300 last:border-0">
                                <td className="px-2 py-1.5 text-ink-500">{g}</td>
                                <td className="px-2 py-1.5 text-ink-800">{t}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Box>
    );
    const faqBox = (
        <Box title="Frequently Asked Questions">
            <div className="divide-y divide-parchment-300">
                {faqs.map((f) => (
                    <details key={f.q} className="group py-2.5">
                        <summary className="cursor-pointer list-none text-[0.8125rem] font-semibold text-ink-900 marker:hidden">
                            <span className="mr-2 inline-block text-gold-600 transition-transform group-open:rotate-45">+</span>
                            {f.q}
                        </summary>
                        <p className="mt-1.5 pl-5 text-[0.8125rem] text-ink-600">{f.a}</p>
                    </details>
                ))}
            </div>
        </Box>
    );

    return (
        <div className="bg-parchment-100">
            {/* Hero */}
            <section className="bg-ink-950 text-parchment-100 motif-glow">
                <div className="container-tbca pt-4 pb-8 lg:pr-[25rem]">
                    <Crumbs tone="dark" items={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: sprint.title }]} />
                    <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
                        <div>
                            <span className="inline-flex rounded-full border border-gold-500 px-3 py-0.5 text-xs font-semibold text-gold-400">{sprint.code}</span>
                            <h1 className="mt-3 font-serif text-4xl leading-[1.05] font-bold text-white sm:text-5xl">{sprint.title}</h1>
                            <p className="mt-4 text-[0.9375rem] leading-relaxed text-parchment-200">{sprint.summary}</p>
                            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-parchment-200">
                                <li className="flex items-center gap-1.5"><Clock className="size-4 text-gold-400" aria-hidden="true" />{sprint.delivery}</li>
                                <li className="flex items-center gap-1.5"><UserCheck className="size-4 text-gold-400" aria-hidden="true" />Human Review Included</li>
                                <li className="flex items-center gap-1.5"><Globe className="size-4 text-gold-400" aria-hidden="true" />EN + AF</li>
                                <li className="flex items-center gap-1.5"><MonitorSmartphone className="size-4 text-gold-400" aria-hidden="true" />Dashboard / Data Sprint</li>
                            </ul>
                            <ul className="mt-5 flex flex-wrap gap-2">
                                {list(a.tags).map((t) => (
                                    <li key={t} className="rounded-full border border-gold-600 px-3 py-1 text-[0.6875rem] text-gold-300">{t}</li>
                                ))}
                            </ul>
                        </div>
                        {a.visual && <DataFlowVisual spec={a.visual} />}
                    </div>
                </div>
            </section>

            <div className="container-tbca relative pb-12">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
                    {/* Purchase column (first on mobile) */}
                    <aside className="lg:order-2 lg:-mt-[26rem]">
                        <div className="space-y-3 lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            <div className="rounded-[10px] border border-ink-700 bg-ink-950 p-4 text-parchment-100 shadow-raised">
                                <h2 className="text-center text-lg font-semibold">{a.package_heading ?? 'Choose Your Sprint Package'}</h2>
                                <fieldset className="mt-4">
                                    <legend className="sr-only">Package</legend>
                                    <div className="grid grid-cols-3 gap-2">
                                        {packages.map((p) => {
                                            const active = p.key === selected;
                                            return (
                                                <label
                                                    key={p.key}
                                                    className={cn(
                                                        'relative flex cursor-pointer flex-col rounded-[8px] border p-2.5 pt-3 transition-colors',
                                                        active ? 'border-gold-500 bg-ink-900' : 'border-ink-700 hover:border-ink-500',
                                                        p.popular && 'border-gold-500',
                                                    )}
                                                >
                                                    {p.popular && (
                                                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-2 text-[0.5625rem] font-bold whitespace-nowrap text-ink-900">Recommended</span>
                                                    )}
                                                    <span className="text-center text-sm font-semibold">{p.name}</span>
                                                    {a.price_prefix && <span className="text-center text-[0.625rem] text-ink-300">{a.price_prefix}</span>}
                                                    <span className={cn('text-center text-[0.8125rem] font-bold sm:text-sm', p.popular ? 'text-gold-400' : 'text-white')}>{money(p.zar, { decimals: true })}</span>
                                                    <ul className="mt-2 space-y-1 text-[0.625rem] leading-tight text-parchment-200">
                                                        {(p.features ?? []).map((f) => (
                                                            <li key={f} className="flex gap-1"><span className="text-gold-400">✓</span>{f}</li>
                                                        ))}
                                                    </ul>
                                                    <input type="radio" name="package" value={p.key} checked={active} onChange={() => setSelected(p.key)} className="mx-auto mt-auto size-4 accent-gold-500" aria-label={`${p.name} package`} />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                                <GoldLink href={ctaHref} className="mt-4">
                                    {(a.cta ?? (isQuote ? 'Request Scoping Quote' : 'Order Sprint')) + (current ? ` — ${current.name}` : '')}
                                </GoldLink>
                                <Link
                                    href={quoteHref(sprint, selected)}
                                    className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-gold-600 text-sm font-medium text-parchment-100 hover:bg-ink-900"
                                >
                                    <CalendarDays className="size-4" aria-hidden="true" />
                                    Book Discovery Call
                                </Link>
                                <ul className="mt-3 space-y-1.5 text-xs text-parchment-200">
                                    {list(a.notes).map((n, i) => {
                                        const Icon = [Percent, Package, Users][i % 3];
                                        return (
                                            <li key={n} className="flex items-center gap-2"><Icon className="size-4 shrink-0 text-gold-400" aria-hidden="true" />{n}</li>
                                        );
                                    })}
                                </ul>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <SaveButton sprint={sprint} tone="dark" />
                                    <AskButton sprint={sprint} tone="dark" />
                                </div>
                            </div>
                            <ul className="space-y-1.5">
                                {facts.map(([k, v], i) => {
                                    const Icon = factIcons[i % factIcons.length];
                                    return (
                                        <li key={k} className="flex items-center gap-3 rounded-[6px] border border-parchment-400 bg-white px-3 py-2">
                                            <Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                            <span className="text-xs"><span className="block font-semibold text-ink-900">{k}</span><span className="text-ink-600">{v}</span></span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </aside>

                    {/* Tabs + body */}
                    <div className="min-w-0 lg:order-1">
                        <Tabs tabs={TABS} value={tab} onChange={setTab} className="mt-2 mb-4 bg-white" />
                        {tab === 'overview' && (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                                    <div className="space-y-4">{overview}{included}</div>
                                    {outcomes}
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">{deliverables}{processBox}</div>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.5fr]">{needs}{addons}{exclusions}{why}</div>
                            </div>
                        )}
                        {tab === 'included' && <div className="space-y-4">{included}{deliverables}{addons}</div>}
                        {tab === 'process' && <div className="space-y-4">{processBox}{why}</div>}
                        {tab === 'deliverables' && <div className="space-y-4">{deliverables}{outcomes}</div>}
                        {tab === 'requirements' && <div className="grid gap-4 md:grid-cols-3">{needs}{exclusions}{addons}</div>}
                        {tab === 'faqs' && faqBox}

                        <TrustStrip
                            className="mt-6"
                            items={[
                                { icon: <UserCheck className="size-5" />, title: 'Human Review Included' },
                                { icon: <BadgeCheck className="size-5" />, title: 'QA Controlled' },
                                { icon: <LayoutDashboard className="size-5" />, title: 'Portal Delivered' },
                                { icon: <Package className="size-5" />, title: 'Vendor Costs Separate' },
                                { icon: <Handshake className="size-5" />, title: 'Partner Review Required' },
                                { icon: <Globe className="size-5" />, title: 'EN + AF' },
                            ]}
                        />
                        <RelatedSprints related={related} className="mt-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}
