import CoverArt from '@/Components/Art/CoverArt';
import { Link } from '@inertiajs/react';
import {
    Archive,
    ArrowRight,
    BarChart3,
    Briefcase,
    Building2,
    CalendarDays,
    ClipboardCheck,
    Coins,
    Cog,
    CreditCard,
    FileText,
    FolderLock,
    Globe,
    Landmark,
    Leaf,
    Lock,
    Network,
    Presentation,
    ShieldCheck,
    Target,
    TrendingUp,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import { AskButton, Crumbs, RelatedSprints, SaveButton, orderHref, quoteHref, usePackage } from '@/Components/SprintTypes/B/common';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';

import { usePrice } from '@/lib/money';
import { urlTabIndex, useUrlTab } from '@/Components/Sprints/lib';
import { displayCurrency, displayMoney } from '@/lib/money';
/* ==========================================================================
   Shared shell for the Premium and Premium Advisory Feeder sprint pages:
   dark hero with a gold line icon, floating "Choose Your Sprint Package"
   card, client-side tabs and an optional dark trust bar.
   ========================================================================== */

const iconRules: [RegExp, LucideIcon][] = [
    [/boardroom|table/i, Presentation],
    [/filing cabinet|cabinet|binder/i, Archive],
    [/globe|africa/i, Globe],
    [/network/i, Network],
    [/carbon|leaf|footprint/i, Leaf],
    [/cash|coin|money/i, Coins],
    [/gear/i, Cog],
    [/chart|trend/i, TrendingUp],
    [/institution|building/i, Landmark],
    [/folder|padlock/i, FolderLock],
    [/clipboard|checklist/i, ClipboardCheck],
    [/document/i, FileText],
    [/target|market/i, Target],
    [/people|group/i, Users],
];

export function heroIconFor(description?: string | null, fallbackText = ''): LucideIcon {
    const text = `${description ?? ''} ${fallbackText}`;
    return iconRules.find(([re]) => re.test(text))?.[1] ?? Briefcase;
}

export const rand = (zar: number) => (displayCurrency() !== 'ZAR' ? displayMoney(zar) : `R${zar.toLocaleString('en-US')}`);

export interface PremiumShellProps {
    sprint: SprintRecord;
    related: SprintRecord[];
    heroIcon?: string | null;
    iconBoxed?: boolean;
    serifTitle?: boolean;
    badge?: string | null;
    badgeAbove?: boolean;
    extraLines?: ReactNode;
    meta: { icon: LucideIcon; text: string }[];
    metaDivided?: boolean;
    chips: string[];
    chipsLabel?: string | null;
    chipsFirst?: boolean;
    card: {
        title?: string;
        note?: string;
        noteOutside?: boolean;
        primaryCta?: string;
        secondaryCta?: string;
        trustIcons?: string[] | null;
        typicalDelivery?: string | null;
        bullets?: boolean;
        popularTag?: string | null;
    };
    tabs: string[];
    renderTab: (key: string, label: string) => ReactNode;
    trustBar?: { icon: LucideIcon; text: string }[] | null;
    after?: ReactNode;
}

const tabKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const trustIconMap: Record<string, LucideIcon> = { 'Secure Payment': CreditCard, 'Satisfaction Guaranteed': ShieldCheck, 'Defined Scope': Target, 'Confidential & Secure': Lock };

export default function PremiumShell(p: PremiumShellProps) {
    const price = usePrice();
    const { sprint } = p;
    const { packages, selected, setSelected } = usePackage(sprint);
    const tabs = (p.tabs.length ? p.tabs : ['Overview']).map((t) => ({ key: tabKey(t), label: t }));
    const urlTab = useUrlTab();
    const [tab, setTab] = useState(() => tabs[urlTabIndex(tabs.map((t) => t.label), urlTab)].key);
    const Icon = heroIconFor(p.heroIcon, sprint.title);
    const activeLabel = tabs.find((t) => t.key === tab)?.label ?? 'Overview';

    const chips = p.chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
            {p.chipsLabel && <span className="text-sm font-bold text-gold-400">{p.chipsLabel}</span>}
            {p.chips.map((c) => (
                <span key={c} className="rounded-full border border-ink-500 bg-ink-900/70 px-3 py-1 text-xs text-parchment-100">
                    {c}
                </span>
            ))}
        </div>
    );
    const meta = (
        <ul className={cn('mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-parchment-200', p.metaDivided && 'sm:divide-x sm:divide-ink-600')}>
            {p.meta.map((m) => (
                <li key={m.text} className={cn('flex max-w-[11rem] items-center gap-2', p.metaDivided && 'sm:pl-5 sm:first:pl-0')}>
                    <m.icon className="size-4 shrink-0 text-gold-400" aria-hidden="true" />
                    {m.text}
                </li>
            ))}
        </ul>
    );
    const badge = p.badge && <span className="inline-flex rounded-[4px] border border-gold-600 bg-gold-900/40 px-2.5 py-0.5 text-xs font-semibold text-gold-300">{p.badge}</span>;

    const card = (
        <div className="rounded-[10px] border border-gold-700/50 bg-ink-900 p-4 text-parchment-100 shadow-raised">
            <h2 className="text-center text-base font-semibold">{p.card.title ?? 'Choose Your Sprint Package'}</h2>
            <fieldset className="mt-3 space-y-2">
                <legend className="sr-only">Package</legend>
                {packages.map((pk) => {
                    const active = pk.key === selected;
                    const display = (pk as { price_display?: string }).price_display ?? price(pk.zar);
                    return (
                        <label
                            key={pk.key}
                            className={cn('relative flex cursor-pointer gap-3 rounded-[8px] border p-3 transition-colors', active ? 'border-gold-500 bg-ink-800' : 'border-ink-600 hover:border-ink-400')}
                        >
                            {pk.popular && p.card.popularTag && (
                                <span className="absolute -top-2 right-3 rounded-full bg-gold-500 px-2 text-[0.5625rem] font-bold text-ink-900">{p.card.popularTag}</span>
                            )}
                            <input type="radio" name="package" value={pk.key} checked={active} onChange={() => setSelected(pk.key)} className="mt-1 size-4 shrink-0 accent-gold-500" />
                            <span className="min-w-0 flex-1">
                                <span className="flex items-baseline justify-between gap-2">
                                    <span className="text-sm font-bold">{pk.name}</span>
                                    <span className={cn('text-sm font-bold', active || pk.popular ? 'text-gold-400' : 'text-parchment-50')}>{display}</span>
                                </span>
                                {p.card.bullets ? (
                                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[0.6875rem] text-ink-300">
                                        {(pk.features ?? []).map((f) => (
                                            <li key={f}>{f}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    pk.features?.[0] && <span className="mt-0.5 block text-[0.6875rem] leading-snug text-ink-300">{pk.features[0]}</span>
                                )}
                                {pk.delivery && <span className="mt-0.5 block text-right text-[0.625rem] text-ink-300">{pk.delivery}</span>}
                            </span>
                        </label>
                    );
                })}
            </fieldset>
            {p.card.typicalDelivery && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-parchment-200">
                    <CalendarDays className="size-3.5 text-gold-400" aria-hidden="true" />
                    {p.card.typicalDelivery}
                </p>
            )}
            <Link
                href={orderHref(sprint, selected)}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400"
            >
                {p.card.primaryCta ?? 'Order Sprint'} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
                href={quoteHref(sprint, selected)}
                className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-gold-600 text-[0.8125rem] font-medium hover:bg-ink-800"
            >
                <CalendarDays className="size-4" aria-hidden="true" /> {p.card.secondaryCta ?? 'Book Discovery Call'}
            </Link>
            {p.card.trustIcons?.length ? (
                <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.625rem] text-parchment-200">
                    {p.card.trustIcons.map((t) => {
                        const TI = trustIconMap[t] ?? ShieldCheck;
                        return (
                            <li key={t} className="flex flex-col items-center gap-1">
                                <TI className="size-4 text-gold-400" aria-hidden="true" />
                                {t}
                            </li>
                        );
                    })}
                </ul>
            ) : null}
            {p.card.note && !p.card.noteOutside && <p className="mt-3 text-center text-[0.6875rem] text-ink-300">{p.card.note}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
                <SaveButton sprint={sprint} tone="dark" />
                <AskButton sprint={sprint} tone="dark" />
            </div>
        </div>
    );

    return (
        <div className="bg-parchment-50">
            <section className="relative overflow-hidden bg-ink-950 text-parchment-50">
                <div aria-hidden="true" className="absolute inset-0 motif-glow" />
                <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-gold-700/20 via-transparent to-transparent" />
                <div className="relative container-tbca pt-4 pb-10 lg:pr-[25rem]">
                    <Crumbs tone="dark" items={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: sprint.title }]} />
                    <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                        <span className="relative block h-28 w-40 shrink-0 overflow-hidden rounded-[14px] border-2 border-gold-500 sm:h-36 sm:w-52" aria-hidden="true">
                            <CoverArt seed={sprint.slug} category={sprint.category} src={sprint.image_url} className="absolute inset-0 h-full w-full" />
                            <span className="absolute bottom-2 left-2 flex size-11 items-center justify-center rounded-[8px] bg-ink-950/75 text-gold-400">
                                <Icon className="size-7" strokeWidth={1.25} />
                            </span>
                        </span>
                        <div className="min-w-0">
                            {p.badgeAbove && <div className="mb-2">{badge}</div>}
                            <h1 className={cn('text-3xl leading-tight font-bold text-white sm:text-4xl', p.serifTitle !== false && 'font-serif')}>{sprint.title}</h1>
                            {!p.badgeAbove && badge && <div className="mt-2">{badge}</div>}
                            {p.extraLines}
                            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-parchment-200">{sprint.summary}</p>
                            {p.chipsFirst ? (
                                <>
                                    {chips}
                                    {meta}
                                </>
                            ) : (
                                <>
                                    {meta}
                                    {chips}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-tbca pb-12">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
                    <aside className="lg:order-2 lg:-mt-64">
                        <div className="space-y-2 lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            {card}
                            {p.card.note && p.card.noteOutside && <p className="text-center text-[0.6875rem] text-ink-500">{p.card.note}</p>}
                        </div>
                    </aside>
                    <div className="min-w-0 lg:order-1">
                        <Tabs tabs={tabs} value={tab} onChange={setTab} className="mt-3 mb-5" />
                        {p.renderTab(tab, activeLabel)}
                    </div>
                </div>
                {p.after}
                {p.trustBar?.length ? (
                    <ul className="mt-8 grid gap-4 rounded-[8px] bg-ink-950 p-5 text-parchment-100 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-ink-700">
                        {p.trustBar.map((t) => (
                            <li key={t.text} className="flex items-center justify-center gap-2.5 text-sm font-medium lg:px-3">
                                <t.icon className="size-6 shrink-0 text-gold-400" aria-hidden="true" />
                                {t.text}
                            </li>
                        ))}
                    </ul>
                ) : null}
                <RelatedSprints related={p.related} className="mt-10" />
            </div>
        </div>
    );
}

/* --- Shared body pieces ------------------------------------------------- */

export function CreamCard({ title, children, className, tone = 'white' }: { title?: ReactNode; children: ReactNode; className?: string; tone?: 'white' | 'cream' }) {
    return (
        <section className={cn('rounded-[8px] border border-gold-100 p-4 shadow-card', tone === 'cream' ? 'bg-gold-50/70' : 'bg-white', className)}>
            {title && <h2 className="mb-3 text-[0.9375rem] font-bold text-ink-900">{title}</h2>}
            {children}
        </section>
    );
}

export function IconRow({ items, icons }: { items: string[]; icons?: LucideIcon[] }) {
    const set = icons ?? [ClipboardCheck, Users, ShieldCheck, FileText, BarChart3, Building2, Target];
    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((it, i) => {
                const I = set[i % set.length];
                return (
                    <li key={it} className="flex flex-col items-center gap-1.5 text-center text-[0.6875rem] leading-tight text-ink-700">
                        <I className="size-7 text-gold-600" strokeWidth={1.4} aria-hidden="true" />
                        {it}
                    </li>
                );
            })}
        </ul>
    );
}

export function ProcessSteps({ steps }: { steps: string[] }) {
    return (
        <ol className="grid grid-cols-5 gap-1">
            {steps.map((s, i) => (
                <li key={`${s}-${i}`} className="relative flex flex-col items-center text-center">
                    {i > 0 && <span aria-hidden="true" className="absolute top-4 right-1/2 h-px w-full border-t border-dashed border-gold-500" />}
                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-white">{i + 1}</span>
                    <span className="mt-1.5 text-[0.625rem] leading-tight text-ink-700">{s}</span>
                </li>
            ))}
        </ol>
    );
}

export function FaqGrid({ faqs }: { faqs: [string, string][] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faqs.map(([q, a]) => (
                <details key={q} open className="group rounded-[6px] border border-parchment-300 bg-white p-3">
                    <summary className="cursor-pointer list-none text-[0.8125rem] font-semibold text-ink-900">{q}</summary>
                    <p className="mt-1 text-xs text-ink-600">{a}</p>
                </details>
            ))}
        </div>
    );
}

export function defaultFaqs(sprint: SprintRecord): [string, string][] {
    return [
        ['What do you need from me?', 'Organisation details, intended use, existing documents and deadlines, captured through the secure portal intake after order.'],
        ['How long does the Sprint take?', `Typical delivery is ${sprint.delivery ?? 'confirmed on order'} from intake completion.`],
        ['How many reviews are included?', 'One review is included. Additional reviews are available as optional add-ons.'],
        ['Are prices VAT inclusive?', 'No. Prices exclude VAT. VAT is added separately at checkout.'],
        ['Can I upgrade my package?', 'Yes. You can move to a higher package before delivery starts; only the difference is charged.'],
        ['What happens after delivery?', 'You receive a portal handover with a recommended next step. Further support is scoped separately.'],
    ];
}
