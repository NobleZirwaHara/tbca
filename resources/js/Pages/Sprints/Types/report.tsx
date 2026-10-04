import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bot,
    CalendarClock,
    CalendarDays,
    CircleCheck,
    Compass,
    FileText,
    Globe,
    Headset,
    Info,
    Layers,
    Lock,
    MessageSquare,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Tag,
    UserCheck,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import { askAbout, attrsOf, Crumbs, list, orderHref, pairs, RelatedSprints, SaveButton } from '@/Components/SprintTypes/B/common';
import ReportPreview from '@/Components/SprintTypes/B/ReportPreview';
import ZoomPreview from '@/Components/SprintTypes/B/ZoomPreview';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { ReportAttributes } from '@/types/sprint-types-b';

const heroFactIcon: Record<string, LucideIcon> = { Format: FileText, Language: Globe, Delivery: Zap, 'Risk Rating': ShieldCheck, 'Human Review': UserCheck };
const metaIcons: LucideIcon[] = [FileText, Globe, Tag, CalendarDays, RefreshCw, CalendarClock, Layers, Headset, ShieldCheck, UserCheck, UserCheck];
const trustIcons: LucideIcon[] = [ShoppingBag, ShieldCheck, Lock];

const tabKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function ReportSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<ReportAttributes>(sprint);
    const dark = a.theme === 'dark';
    const governed = a.flavour === 'governed';
    const packages = sprint.packages ?? [];
    const [selected, setSelected] = useState(packages.find((p) => p.popular)?.key ?? packages[0]?.key ?? null);
    const tabs = (list(a.tabs).length ? list(a.tabs) : ['Overview', 'Report Contents', 'Method & Sources', 'Requirements', 'Licence & Use', 'FAQs']).map((t) => ({ key: tabKey(t), label: t }));
    const [tab, setTab] = useState(tabs[0].key);
    const n = (i: number, label: string) => (a.section_numbering ? `${i}. ${label}` : label);
    const panels = a.preview?.panels ?? [];
    const card = cn('rounded-[8px] border p-4', dark ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white');
    const h2 = cn('mb-3 text-[0.9375rem] font-bold', governed && 'font-serif', dark ? 'text-gold-300' : 'text-ink-900');
    const muted = dark ? 'text-ink-200' : 'text-ink-700';
    const faqs = a.faqs?.length
        ? a.faqs
        : [
              { q: 'When do I receive the report?', a: 'The report core is available immediately after payment in your Client Portal; scheduled enrichment follows within the stated delivery window.' },
              { q: 'What inputs do you need?', a: 'Only the access and context listed under Requirements. Inputs are collected through a secure intake form after purchase.' },
              { q: 'Can I share the report?', a: 'Use rights follow the licence class of your package (L1 personal, L2 single entity, L3 group).' },
              { q: 'Is the report reviewed by a person?', a: 'Yes. Findings are human-reviewed before release and each report carries a version and as-at date.' },
          ];

    const Section = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => (
        <section className={cn(card, className)}>
            <h2 className={h2}>{title}</h2>
            {children}
        </section>
    );

    const overview = (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
            <Section title={n(1, 'Overview')}>
                <p className={cn('text-[0.8125rem] leading-relaxed', muted)}>{a.overview ?? sprint.description}</p>
            </Section>
            <section className={card}>
                <h2 className={cn(h2, 'flex items-center gap-2')}><Compass className="size-5 text-gold-600" />{n(2, 'Executive Snapshot')}</h2>
                <dl className="grid gap-3 sm:grid-cols-5">
                    {pairs(a.executive_snapshot).map(([k, v]) => (
                        <div key={k} className="text-xs">
                            <dt className={cn('font-bold', dark ? 'text-white' : 'text-ink-900')}>{k}</dt>
                            <dd className={cn('mt-0.5', muted)}>{v}</dd>
                        </div>
                    ))}
                </dl>
            </section>
        </div>
    );
    const inside = (
        <Section title={a.whats_inside_title ?? n(3, "What's Inside")}>
            <ol className={cn('space-y-1.5 text-xs', muted, governed && 'sm:columns-2')}>
                {list(a.whats_inside).map((w, i) => (
                    <li key={w} className="flex items-start gap-2 break-inside-avoid">
                        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[0.5625rem] font-bold text-ink-900">{i + 1}</span>
                        {w}
                    </li>
                ))}
            </ol>
        </Section>
    );
    const helps = (
        <Section title={n(4, 'What This Report Helps You Do')}>
            <ul className={cn('space-y-1.5 text-xs', muted)}>{list(a.helps_you_do).map((w) => <li key={w} className="flex gap-2"><CircleCheck className="size-3.5 shrink-0 text-gold-600" />{w}</li>)}</ul>
        </Section>
    );
    const method = (
        <Section title={n(5, 'Method & Evidence')}>
            <ul className={cn('list-disc space-y-1.5 pl-4 text-xs', muted)}>{list(a.method_evidence).map((w) => <li key={w}>{w}</li>)}</ul>
        </Section>
    );
    const requirements = (
        <Section title="Requirements">
            <ul className={cn('space-y-1.5 text-xs', muted)}>
                {(list(a.requirements).length ? list(a.requirements) : ['Business details and report scope', 'Access to the relevant data or systems (read-only)', 'Key questions the report must answer', 'Consent to use provided data']).map((w) => (
                    <li key={w} className="flex gap-2"><CircleCheck className="size-3.5 shrink-0 text-gold-600" />{w}</li>
                ))}
            </ul>
        </Section>
    );
    const access = (
        <Section title={n(6, 'Report Access Process')}>
            <ol className="grid grid-cols-5 gap-1">
                {list(a.access_process).map((s, i) => (
                    <li key={s} className="relative flex flex-col items-center text-center">
                        {i > 0 && <span aria-hidden="true" className="absolute top-3.5 right-1/2 h-px w-full border-t border-dashed border-gold-500" />}
                        <span className="relative z-10 flex size-7 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span>
                        <span className={cn('mt-1 text-[0.625rem] leading-tight', muted)}>{s}</span>
                    </li>
                ))}
            </ol>
        </Section>
    );
    const licence = (
        <Section title="Licence & Use">
            <ul className={cn('space-y-1.5 text-xs', muted)}>
                {packages.map((p) => (
                    <li key={p.key}>
                        <strong className={dark ? 'text-white' : 'text-ink-900'}>{p.name}:</strong>{' '}
                        {(p.features ?? []).find((f) => /\bL\d/.test(f)) ?? (p.key === 'basic' ? 'L1 personal-use rights' : p.key === 'standard' ? 'L2 single-entity rights' : 'L3 group rights')}
                    </li>
                ))}
            </ul>
            {a.footnote && <p className="mt-2 text-[0.6875rem] text-ink-500">{a.footnote}</p>}
        </Section>
    );
    const faqCard = (
        <Section title="FAQs">
            <div className={cn('divide-y', dark ? 'divide-ink-700' : 'divide-parchment-300')}>
                {faqs.map((f) => (
                    <details key={f.q} className="py-2">
                        <summary className="cursor-pointer text-[0.8125rem] font-semibold">{f.q}</summary>
                        <p className={cn('mt-1 text-xs', muted)}>{f.a}</p>
                    </details>
                ))}
            </div>
        </Section>
    );

    const help = a.help_card ?? { title: 'Need help choosing a report package?', text: 'Ask about scope, format, inputs, licence or support.', button: 'Ask TBCA' };

    return (
        <div className={dark ? 'bg-ink-950' : 'bg-parchment-100'}>
            <section className="bg-ink-950 text-parchment-100 motif-glow">
                <div className="container-tbca pt-4 pb-8 lg:pr-[23rem]">
                    <Crumbs tone="dark" items={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: 'Reports', href: '/sprints' }, { label: sprint.title }]} />
                    <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div>
                            <span className="rounded-full border border-gold-500 px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-wider text-gold-400">REPORT SPRINT</span>
                            <h1 className={cn('mt-3 text-3xl leading-tight font-bold text-white sm:text-4xl', governed && 'font-serif')}>{sprint.title}</h1>
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-parchment-200">{sprint.summary}</p>
                            {a.hero_problem && <p className="mt-3 border-t border-gold-700 pt-3 text-[0.8125rem] text-parchment-200">{a.hero_problem}</p>}
                            {list(a.ideal_for).length > 0 && (
                                <ul className="mt-4 flex flex-wrap items-center gap-2 text-[0.6875rem]">
                                    <li className={cn('font-semibold', governed ? 'text-white' : 'rounded border border-gold-600 px-2 py-0.5 text-gold-300')}>Ideal For:</li>
                                    {list(a.ideal_for).map((p) => <li key={p} className="rounded-full border border-ink-600 px-2.5 py-0.5">{p}</li>)}
                                </ul>
                            )}
                            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                                {(a.hero_facts ?? []).map((f) => {
                                    const Icon = heroFactIcon[f[0]] ?? Info;
                                    return (
                                        <li key={f[0]} className="flex items-start gap-2 text-xs">
                                            <Icon className="size-5 shrink-0 text-gold-400" aria-hidden="true" />
                                            <span><span className="block text-ink-300">{f[0]}</span><span className="font-semibold text-white">{f[1]}</span>{f[2] && <span className="block text-[0.6875rem] text-parchment-200">{f[2]}</span>}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                            {a.hero_note && <p className="mt-3 flex gap-1.5 text-[0.6875rem] text-ink-300"><Info className="size-3.5 shrink-0" />{a.hero_note}</p>}
                        </div>
                        <ZoomPreview title={a.preview?.title ?? sprint.title} large={<ReportPreview title={a.preview?.title} panels={panels} nav={a.preview?.nav} pdf={governed} large />}>
                            <ReportPreview title={a.preview?.title} panels={panels} nav={a.preview?.nav} pdf={governed} />
                        </ZoomPreview>
                    </div>
                </div>
            </section>

            <div className="container-tbca pb-12">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                    <aside className="lg:order-2 lg:-mt-[24rem]">
                        <div className="space-y-4 lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            <div className="rounded-[10px] border border-ink-700 bg-ink-900 p-4 text-parchment-100 shadow-raised">
                                <h2 className={cn('text-base font-semibold', governed && 'font-serif')}>{a.package_panel_title ?? 'Choose Your Report Package'}</h2>
                                <fieldset className="mt-3 space-y-2">
                                    <legend className="sr-only">Report package</legend>
                                    {packages.map((p) => {
                                        const pp = p as typeof p & { price_display?: string; description?: string; ribbon?: string };
                                        const active = selected === p.key;
                                        return (
                                            <label key={p.key} className={cn('relative flex cursor-pointer gap-2.5 rounded-[8px] border p-3', active ? 'border-gold-500 bg-ink-950' : 'border-ink-700 hover:border-ink-500')}>
                                                {pp.ribbon && <span className="absolute -top-2 right-3 rounded-full bg-gold-500 px-2 text-[0.5625rem] font-bold text-ink-900">{pp.ribbon}</span>}
                                                <input type="radio" name="report-package" value={p.key} checked={active} onChange={() => setSelected(p.key)} className="mt-0.5 accent-gold-500" />
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-baseline justify-between gap-2">
                                                        <span className={cn('text-sm font-semibold', active && 'text-gold-400')}>{p.name}</span>
                                                        <span className={cn('text-sm font-bold', active && 'text-gold-400')}>{pp.price_display ?? `R${p.zar.toLocaleString('en-US')}`}</span>
                                                    </span>
                                                    {pp.description && (
                                                        <span className="mt-1 flex justify-between gap-2 text-[0.6875rem] text-parchment-200">
                                                            <span>{pp.description}</span>
                                                            {p.delivery && <span className={cn('shrink-0', active && 'text-gold-300')}>{p.delivery}</span>}
                                                        </span>
                                                    )}
                                                    {!!p.features?.length && (
                                                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[0.625rem] text-parchment-200">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                                                    )}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </fieldset>
                                <Link href={orderHref(sprint, selected)} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                    <ShoppingCart className="size-4" aria-hidden="true" /> Get This Report <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => askAbout(sprint)} className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-gold-600 text-[0.8125rem]">
                                        <MessageSquare className="size-4" aria-hidden="true" /> Ask TBCA
                                    </button>
                                    <SaveButton sprint={sprint} tone="dark" label="Save" />
                                </div>
                                {(a.package_panel_note || governed) && <p className="mt-2 text-center text-[0.6875rem] text-ink-300">{a.package_panel_note ?? 'Prices exclude VAT. VAT charged separately at 15%.'}</p>}
                                {list(a.trust).length > 0 && (
                                    <ul className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-700 pt-3 text-center text-[0.625rem] text-parchment-200">
                                        {list(a.trust).map((t, i) => {
                                            const Icon = trustIcons[i % trustIcons.length];
                                            return <li key={t}><Icon className="mx-auto mb-1 size-4 text-gold-400" />{t}</li>;
                                        })}
                                    </ul>
                                )}
                            </div>
                            <div className={cn(card, 'text-center')}>
                                <h2 className="text-sm font-bold text-gold-700">{help.title}</h2>
                                <span className="mx-auto mt-3 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-200 to-gold-500 text-ink-900" aria-hidden="true">
                                    <Bot className="size-7" />
                                </span>
                                <p className={cn('mt-2 text-xs', muted)}>{help.text}</p>
                                <button type="button" onClick={() => askAbout(sprint)} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] bg-ink-950 text-sm font-semibold text-white hover:bg-ink-800">
                                    {help.button ?? 'Ask TBCA'}
                                </button>
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0 lg:order-1">
                        <Tabs tabs={tabs} value={tab} onChange={setTab} tone={dark ? 'dark' : 'light'} className={cn('mt-2 mb-4', dark ? 'bg-ink-900' : 'bg-white')} />
                        {tab === 'overview' && (
                            <div className="space-y-4">
                                {overview}
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {inside}
                                    {helps}
                                    {method}
                                    {list(a.requirements).length > 0 ? requirements : access}
                                </div>
                                {list(a.requirements).length > 0 && access}
                            </div>
                        )}
                        {tab === 'report-contents' && <div className="grid gap-4 md:grid-cols-2">{inside}{helps}</div>}
                        {tab === 'method-sources' && <div className="grid gap-4 md:grid-cols-2">{method}{overview}</div>}
                        {tab === 'requirements' && <div className="grid gap-4 md:grid-cols-2">{requirements}{access}</div>}
                        {tab === 'licence-use' && licence}
                        {tab === 'faqs' && faqCard}

                        <ul className={cn(card, 'mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6')}>
                            {pairs(a.meta_strip).map(([k, v], i) => {
                                const Icon = metaIcons[i % metaIcons.length];
                                return (
                                    <li key={k} className="flex items-start gap-2 text-xs">
                                        <Icon className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                        <span><span className="block text-ink-500">{k}</span><span className={cn('font-semibold', dark ? 'text-white' : 'text-ink-900')}>{v}</span></span>
                                    </li>
                                );
                            })}
                        </ul>
                        <RelatedSprints related={related} title="Related Reports & Sprints" tone={dark ? 'dark' : 'light'} className="mt-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}
