import { Link } from '@inertiajs/react';
import {
    BadgeCheck,
    Boxes,
    CalendarDays,
    ClipboardList,
    Clock,
    Coins,
    Database,
    FileText,
    Globe,
    Handshake,
    Layers,
    LayoutDashboard,
    Package,
    Settings,
    ShieldCheck,
    UserCheck,
    Workflow,
} from 'lucide-react';
import { useState } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import { AskButton, Box, CheckList, Crumbs, RelatedSprints, SaveButton, TrustStrip, attrsOf, list, orderHref, pairs, quoteHref, usePackage } from '@/Components/SprintTypes/B/common';
import DataVisual from '@/Components/SprintTypes/B/DataVisual';
import { DarkPackageCard, HeroIconTile } from '@/Components/SprintTypes/B/DarkHeroPackageCard';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { ImplementationPackAttributes } from '@/types/sprint-types-b';
import { urlTabIndex, useUrlTab } from '@/Components/Sprints/lib';

const TAB_LABELS = ['Overview', "What's Included", 'Implementation Process', 'Deliverables', 'Requirements', 'FAQs'];
const tabKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const includedIcons = [Layers, Settings, Workflow, Database, LayoutDashboard, BadgeCheck];
const factIcons = [Clock, ClipboardList, Globe, UserCheck, BadgeCheck, Package];
const metaIcons = [Clock, UserCheck, Globe, FileText];
const DEFAULT_STEPS = ['Scope & Intake', 'Structure & Configure', 'Build & Populate', 'Test & Validate', 'Review & Refine', 'Handover & Enable'];

function defaultFaqs(sprint: SprintRecord) {
    return [
        { q: 'What does an implementation pack include?', a: 'A configured, working setup plus the documentation, checklists and handover guide your team needs to run it.' },
        { q: 'How long does it take?', a: `Typical delivery is ${sprint.delivery ?? 'confirmed at intake'}, starting once your inputs and system access are confirmed.` },
        { q: 'Are software or licence costs included?', a: 'No. Vendor, licence and partner/integration costs are separate where applicable and disclosed before work starts.' },
        { q: 'Is the work reviewed?', a: 'Yes. Every pack is QA-controlled and human-reviewed before it is delivered to your Client Portal.' },
    ];
}

function HeroVisual({ v }: { v: ImplementationPackAttributes['hero_visual'] }) {
    const node = (label: string) => (
        <span key={label} className="flex min-h-12 items-center justify-center rounded-[6px] border border-gold-600/70 bg-ink-900 px-2 py-1.5 text-center text-[0.5625rem] leading-tight font-semibold tracking-wide text-gold-300 uppercase shadow-[0_0_14px_-6px_rgba(214,163,46,0.9)]">
            {label}
        </span>
    );
    let core;
    if (v.kind === 'kanban-board' && v.columns?.length) {
        core = (
            <div className="rounded-[8px] border border-gold-600/60 bg-ink-900/90 p-2">
                <p className="mb-1.5 text-center text-[0.625rem] font-bold tracking-wider text-gold-300">{v.panel_title}</p>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${v.columns.length}, minmax(0, 1fr))` }}>
                    {v.columns.map(([name, count]) => (
                        <div key={name} className="rounded bg-ink-950 p-1">
                            <p className="truncate text-[0.5rem] font-semibold text-parchment-200">{name} {count && <span className="text-gold-400">{count}</span>}</p>
                            {[0, 1, 2].map((i) => <span key={i} className="mt-1 block h-2.5 rounded-sm bg-ink-700" />)}
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (v.kind === 'kpi-dashboard' || v.kpis?.length) {
        core = <DataVisual spec={{ title: v.panel_title, kpis: v.kpis?.filter((k) => k[1]), charts: v.charts }} compact />;
    } else if (v.boxes) {
        core = (
            <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(v.boxes).map(([k, items]) => (
                    <div key={k} className="rounded-[6px] border border-gold-600/60 bg-ink-900 p-1.5">
                        <p className="text-[0.5rem] font-bold text-gold-300">{k}</p>
                        <p className="text-[0.5rem] text-parchment-200">{items.join(' · ')}</p>
                    </div>
                ))}
            </div>
        );
    } else if (v.kind === 'central-hub') {
        core = (
            <div className="mx-auto flex size-32 flex-col items-center justify-center rounded-full border-2 border-gold-500 bg-ink-900 text-center shadow-[0_0_40px_-6px_rgba(214,163,46,0.9)]">
                <Boxes className="size-9 text-gold-400" aria-hidden="true" />
                <span className="mt-1 px-3 text-[0.625rem] leading-tight font-bold tracking-wide text-gold-200 uppercase">{v.panel_title}</span>
            </div>
        );
    } else {
        core = <DataVisual spec={{ title: v.panel_title || undefined, charts: ['area: Activity trend', 'bars: Progress (Setup 90%, Configure 75%, Validate 60%, Handover 40%)', 'donut: Coverage (Done 60%, In progress 30%, Planned 10%)'] }} compact />;
    }
    return (
        <div className="flex items-center gap-3">
            <div className="hidden w-24 shrink-0 flex-col gap-2 md:flex">{list(v.nodes_left).map(node)}</div>
            <div className="min-w-0 flex-1">
                {core}
                <div aria-hidden="true" className="mx-auto mt-2 h-5 w-2/3 rounded-[50%] border border-gold-500/60 bg-gradient-to-b from-gold-500/40 to-transparent shadow-[0_0_36px_-4px_rgba(214,163,46,0.9)]" />
            </div>
            <div className="hidden w-24 shrink-0 flex-col gap-2 md:flex">{list(v.nodes_right).map(node)}</div>
        </div>
    );
}

export default function ImplementationPackSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<ImplementationPackAttributes>(sprint);
    const { packages, selected, setSelected, current } = usePackage(sprint);
    const tabs = (list(a.tabs).length ? list(a.tabs) : TAB_LABELS).map((t) => ({ key: tabKey(t), label: t }));
    const urlTab = useUrlTab();
    const [tab, setTab] = useState(() => tabs[urlTabIndex(tabs.map((t) => t.label), urlTab)].key);
    const facts = pairs(a.facts);
    const notes = list(a.notes).length ? list(a.notes) : ['VAT exclusive | VAT added separately', 'Vendor / licence costs separate where applicable', 'Partner / integration costs separate where applicable'];
    const faqs = a.faqs?.length ? a.faqs : defaultFaqs(sprint);
    const steps = a.process_steps?.steps ?? DEFAULT_STEPS;

    const overview = (
        <Box title="Overview" tone="cream">
            <p className="text-[0.8125rem] leading-relaxed text-ink-600">{a.overview ?? sprint.description}</p>
        </Box>
    );
    const included = a.whats_included?.length ? (
        <Box title="What's Included" tone="cream">
            <ul className="grid grid-cols-3 gap-3 lg:grid-cols-6">
                {a.whats_included.map((w, i) => {
                    const Icon = includedIcons[i % includedIcons.length];
                    return (
                        <li key={w} className="flex flex-col items-center gap-1.5 text-center text-[0.6875rem] text-ink-700">
                            <Icon className="size-6 text-gold-600" aria-hidden="true" />
                            {w}
                        </li>
                    );
                })}
            </ul>
        </Box>
    ) : null;
    const outcomes = (
        <Box title="Key Outcomes" tone="cream">
            <CheckList items={list(a.key_outcomes)} />
        </Box>
    );
    const checklist = a.deliverables_checklist ? (
        <Box title={a.deliverables_checklist.title} tone="cream">
            <CheckList items={a.deliverables_checklist.items} cols={a.deliverables_checklist.items.length >= 6 ? 2 : 1} />
        </Box>
    ) : null;
    const processBox = (
        <Box title={a.process_steps?.title ?? 'Our 6-Step Implementation Process'} tone="cream">
            <ol className="grid grid-cols-3 gap-y-4 sm:grid-cols-6">
                {steps.map((p, i) => (
                    <li key={p} className="relative flex flex-col items-center text-center">
                        {i > 0 && <span aria-hidden="true" className="absolute top-4 right-1/2 hidden h-px w-full border-t border-dashed border-gold-400 sm:block" />}
                        <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-ink-900">{i + 1}</span>
                        <span className="mt-1.5 px-1 text-[0.6875rem] leading-tight text-ink-700">{p}</span>
                    </li>
                ))}
            </ol>
        </Box>
    );
    const needs = (
        <Box title="What We Need From You" tone="cream">
            <CheckList items={list(a.what_we_need)} />
        </Box>
    );
    const addons = (
        <Box title="Optional Add-ons" tone="cream">
            <CheckList items={list(a.optional_addons)} />
        </Box>
    );
    const exclusions = a.exclusions?.length ? (
        <Box title="Exclusions" tone="cream">
            <CheckList items={a.exclusions} />
        </Box>
    ) : null;
    const why = a.why_tbca ? (
        <Box title="Why TBCA Instead of a DIY or Generic AI Route" tone="cream">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr>
                            <th className="rounded-l bg-parchment-300 px-2 py-1.5 font-semibold text-ink-800">{a.why_tbca.left_header}</th>
                            <th className="rounded-r bg-gold-100 px-2 py-1.5 font-semibold text-gold-800">{a.why_tbca.right_header}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pairs(a.why_tbca.rows).map(([d, t]) => (
                            <tr key={d} className="border-b border-parchment-300 last:border-0">
                                <td className="px-2 py-1.5 text-ink-500">{d}</td>
                                <td className="px-2 py-1.5 text-ink-800">{t}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Box>
    ) : null;
    const faqBox = (
        <Box title="Frequently Asked Questions">
            <div className="divide-y divide-parchment-300">
                {faqs.map((f) => (
                    <details key={f.q} className="group py-2.5">
                        <summary className="cursor-pointer list-none text-[0.8125rem] font-semibold text-ink-900">
                            <span className="mr-2 inline-block text-gold-600 transition-transform group-open:rotate-45">+</span>
                            {f.q}
                        </summary>
                        <p className="mt-1.5 pl-5 text-[0.8125rem] text-ink-600">{f.a}</p>
                    </details>
                ))}
            </div>
        </Box>
    );

    const badgeIcons = [UserCheck, ShieldCheck, LayoutDashboard, Coins, Handshake, Globe, FileText];

    return (
        <div className="bg-white">
            <section className="bg-ink-950 text-parchment-100 motif-glow">
                <div className="container-tbca pt-4 pb-8 lg:pr-[25rem]">
                    <Crumbs tone="dark" items={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: sprint.title }]} />
                    <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                        <div className="flex gap-4">
                            <HeroIconTile description={a.hero_icon} boxed={false} className="hidden sm:inline-flex" />
                            <div className="min-w-0">
                                {a.eyebrow ? (
                                    <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">{a.eyebrow}</span>
                                ) : (
                                    <span className="inline-flex rounded-full border border-gold-500 px-3 py-0.5 text-xs font-semibold text-gold-400">{sprint.code}</span>
                                )}
                                <h1 className="mt-3 font-serif text-4xl leading-[1.05] font-bold text-white">{sprint.title}</h1>
                                <p className="mt-3 text-[0.875rem] leading-relaxed text-parchment-200">{sprint.summary}</p>
                                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-parchment-200">
                                    {(a.hero_meta ?? []).map((m, i) => {
                                        const Icon = metaIcons[i % metaIcons.length];
                                        return (
                                            <li key={m[1]} className="flex items-center gap-1.5">
                                                <Icon className="size-4 text-gold-400" aria-hidden="true" />
                                                {m[1]}
                                                {m[2] && <span className="text-ink-300">{m[2]}</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <ul className="mt-4 flex flex-wrap gap-2">
                                    {list(a.tags).map((t, i) => (
                                        <li key={t} className={cn('rounded-full border px-3 py-1 text-[0.6875rem]', i === 0 ? 'border-gold-500 text-gold-300' : 'border-ink-600 bg-ink-900 text-parchment-100')}>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {a.hero_visual && <HeroVisual v={a.hero_visual} />}
                    </div>
                </div>
            </section>

            <div className="container-tbca pb-12">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
                    <aside className="lg:order-2 lg:-mt-[24rem]">
                        <div className="space-y-3 lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            <DarkPackageCard
                                heading="Choose Your Sprint Package"
                                packages={packages}
                                selected={selected}
                                onSelect={setSelected}
                                ctaLabel={`Order Sprint${current ? ` — ${current.name}` : ''}`}
                                ctaHref={orderHref(sprint, selected)}
                                secondary={
                                    <Link href={quoteHref(sprint, selected)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-ink-600 text-sm font-medium text-parchment-100 hover:border-gold-500">
                                        <CalendarDays className="size-4" aria-hidden="true" /> Book Discovery Call
                                    </Link>
                                }
                                notes={
                                    <>
                                        <ul className="space-y-1.5 text-xs text-parchment-200">
                                            {notes.map((n) => (
                                                <li key={n} className="flex items-center gap-2"><Coins className="size-4 shrink-0 text-gold-400" aria-hidden="true" />{n}</li>
                                            ))}
                                        </ul>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <SaveButton sprint={sprint} tone="dark" />
                                            <AskButton sprint={sprint} tone="dark" />
                                        </div>
                                    </>
                                }
                            />
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

                    <div className="min-w-0 lg:order-1">
                        <Tabs tabs={tabs} value={tab} onChange={setTab} className="mt-2 mb-4" />
                        {tab === tabs[0].key && (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                                    <div className="space-y-4">{overview}{included}</div>
                                    {outcomes}
                                </div>
                                {(checklist || a.process_steps) && <div className="grid gap-4 md:grid-cols-2">{checklist}{processBox}</div>}
                                <div className={cn('grid gap-4 md:grid-cols-2', exclusions ? 'xl:grid-cols-[1fr_1fr_1fr_1.6fr]' : 'xl:grid-cols-[1fr_1fr_1.6fr]')}>
                                    {needs}{addons}{exclusions}{why}
                                </div>
                            </div>
                        )}
                        {tab === 'what-s-included' && <div className="space-y-4">{included}{checklist}{addons}</div>}
                        {tab === 'implementation-process' && <div className="space-y-4">{processBox}{why}</div>}
                        {tab === 'deliverables' && <div className="space-y-4">{checklist ?? included}{outcomes}</div>}
                        {tab === 'requirements' && <div className="grid gap-4 md:grid-cols-2">{needs}{exclusions ?? addons}</div>}
                        {tab === 'faqs' && faqBox}

                        <TrustStrip
                            tone="dark"
                            className="mt-6"
                            items={list(a.footer_badges).map((b, i) => {
                                const Icon = badgeIcons[i % badgeIcons.length];
                                return { icon: <Icon className="size-5" />, title: b };
                            })}
                        />
                        <RelatedSprints related={related} className="mt-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}
