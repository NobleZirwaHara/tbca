import { useState, type ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, ChevronRight, MessageCircleQuestion } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/money';
import type { SharedProps, SprintRecord } from '@/types';
import type { SprintTypeAAttributes, SprintTypeASlug } from '@/types/sprint-types-a';
import HeroVisual from './HeroVisual';
import { Chip } from './Blocks';
import { heroIcon, itemIcon } from './icons';

export const TYPE_LABELS: Record<SprintTypeASlug, string> = {
    'technology-setup': 'Technology Setup Sprint',
    'fixed-scope': 'Fixed Scope Service',
    'partner-delivered': 'Partner-Delivered Sprint',
    checklist: 'Checklist Sprint',
    'client-service': 'Client Service Sprint',
};

export interface ShellTab {
    label: string;
    content: ReactNode;
}

/** POST /saved toggle (auth middleware redirects guests to sign in). */
export function SaveButton({ sprint, className }: { sprint: SprintRecord; className?: string }) {
    const [busy, setBusy] = useState(false);
    return (
        <button
            type="button"
            disabled={busy}
            onClick={() =>
                router.post(
                    '/saved',
                    { item_type: 'sprint', item_key: sprint.code, label: sprint.title, url: `/sprints/${sprint.slug}` },
                    { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) },
                )
            }
            className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-600 px-3 text-[0.8125rem] font-medium text-parchment-100 transition-colors hover:border-gold-500 hover:text-gold-300 disabled:opacity-60',
                className,
            )}
        >
            <Bookmark className="size-4" aria-hidden="true" />
            Save
        </button>
    );
}

function Crumbs({ sprint, attrs }: { sprint: SprintRecord; attrs: SprintTypeAAttributes }) {
    const middle = (attrs.breadcrumb ?? []).filter((c, i, all) => c !== 'Home' && c !== sprint.title && !(i === all.length - 1 && c === sprint.title));
    const items = [{ label: 'Home', href: '/' }, ...middle.map((label) => ({ label, href: label === 'Sprints' ? '/sprints' : `/sprints?type=${sprint.type}` })), { label: sprint.title }];
    if (!middle.includes('Sprints')) items.splice(1, 0, { label: 'Sprints', href: '/sprints' });
    return (
        <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-ink-300">
                {items.map((item, i) => {
                    const last = i === items.length - 1;
                    return (
                        <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                            {'href' in item && item.href && !last ? (
                                <Link href={item.href} className="hover:text-gold-300">
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={last ? 'page' : undefined} className={last ? 'text-parchment-100' : undefined}>
                                    {item.label}
                                </span>
                            )}
                            {!last && <ChevronRight className="size-3 text-ink-500" aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/**
 * Full product-page frame for Group A sprint types:
 * dark hero (left) + sticky purchase card (right, spanning hero and body) + client-side tabs + related + trust band.
 */
export default function SprintShell({
    sprint,
    attrs,
    card,
    tabs,
    related,
    serifTitle = false,
    heroAside,
    bottomBand,
    bottomLead,
    wideCard = false,
}: {
    sprint: SprintRecord;
    attrs: SprintTypeAAttributes;
    card: ReactNode;
    tabs: ShellTab[];
    related: SprintRecord[];
    serifTitle?: boolean;
    heroAside?: ReactNode;
    bottomBand?: string[];
    bottomLead?: string | null;
    wideCard?: boolean;
}) {
    const [active, setActive] = useState(0);
    const { context } = usePage<SharedProps>().props;
    const Icon = heroIcon(attrs.icon);
    const visual = attrs.visual && ((attrs.visual.kpis?.length ?? 0) > 0 || attrs.visual.bars || attrs.visual.donut || (attrs.visual.lists?.length ?? 0) > 0 || attrs.visual.table) ? attrs.visual : null;
    const codes = attrs.display_codes ?? [];
    const band = bottomBand ?? attrs.bottom_band ?? [];
    const lead = bottomLead ?? attrs.bottom_band_lead;
    const current = tabs[active] ?? tabs[0];

    return (
        <div className="overflow-x-clip bg-parchment-100">
            <div className={cn('container-tbca grid gap-x-8', wideCard ? 'lg:grid-cols-[minmax(0,1fr)_420px]' : 'lg:grid-cols-[minmax(0,1fr)_380px]')}>
                {/* Hero */}
                <header className="relative py-8 text-parchment-100 before:absolute before:inset-y-0 before:-right-[100vw] before:-left-[100vw] before:-z-0 before:bg-gradient-to-r before:from-ink-950 before:via-ink-900 before:to-ink-950 lg:pb-10">
                    <div className="relative z-10">
                        <Crumbs sprint={sprint} attrs={attrs} />
                        <div className={cn('grid gap-6', visual && 'xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]')}>
                            <div className="flex flex-col gap-5 sm:flex-row">
                                <span className="flex size-24 shrink-0 items-center justify-center rounded-[10px] border-2 border-gold-500/80 bg-ink-950/60 text-gold-500 sm:size-36">
                                    <Icon className="size-12 sm:size-16" strokeWidth={1.25} aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    {(attrs.badge || codes.length > 0) && (
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            {attrs.badge && (
                                                <span className="rounded-[3px] border border-gold-500 px-2 py-0.5 text-[0.625rem] font-bold tracking-[0.12em] text-gold-400 uppercase">
                                                    {attrs.badge}
                                                </span>
                                            )}
                                            {codes.map((c, i) => (
                                                <span key={c} className="text-[0.8125rem] font-semibold text-gold-400">
                                                    {i > 0 && <span className="mr-2 text-ink-500">•</span>}
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <h1 className={cn('text-[1.75rem] leading-tight font-bold tracking-[-0.02em] text-parchment-50 sm:text-[2.25rem]', serifTitle && 'font-serif font-semibold')}>
                                        {sprint.title}
                                    </h1>
                                    {attrs.subtitle && <p className="mt-1 text-[1rem] text-ink-200">{attrs.subtitle}</p>}
                                    {sprint.summary && <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-100">{sprint.summary}</p>}
                                </div>
                            </div>
                            {visual && (
                                <div className="hidden md:block">
                                    <HeroVisual visual={visual} />
                                </div>
                            )}
                        </div>

                        {(attrs.hero_meta?.length ?? 0) > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] text-ink-100">
                                {attrs.hero_meta!.map((m) => {
                                    const MetaIcon = itemIcon(m);
                                    return (
                                        <li key={m} className="flex items-center gap-1.5">
                                            <MetaIcon className="size-4 text-gold-400" aria-hidden="true" />
                                            {m}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {(attrs.ideal_for?.length ?? 0) > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {attrs.ideal_for_label && <span className="text-[0.8125rem] font-semibold">{attrs.ideal_for_label}</span>}
                                {attrs.ideal_for!.map((a) => (
                                    <Chip key={a}>{a}</Chip>
                                ))}
                            </div>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                            <SaveButton sprint={sprint} />
                            <button
                                type="button"
                                onClick={() => openAskQuestion({ subject: sprint.title, section: 'sprints' })}
                                className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-600 px-3 text-[0.8125rem] font-medium text-parchment-100 transition-colors hover:border-gold-500 hover:text-gold-300"
                            >
                                <MessageCircleQuestion className="size-4" aria-hidden="true" />
                                Ask a Question
                            </button>
                        </div>
                        {heroAside}
                    </div>
                </header>

                {/* Purchase card */}
                <div className="relative z-10 py-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:py-8">
                    <div className="lg:sticky lg:top-24">{card}</div>
                </div>

                {/* Body */}
                <main className="min-w-0 pb-12 lg:col-start-1 lg:row-start-2 lg:pt-4">
                    <div role="tablist" aria-label="Sprint details" className="flex gap-1 overflow-x-auto border-b border-parchment-400">
                        {tabs.map((t, i) => (
                            <button
                                key={t.label}
                                type="button"
                                role="tab"
                                id={`sprint-tab-${i}`}
                                aria-selected={i === active}
                                aria-controls="sprint-tabpanel"
                                onClick={() => setActive(i)}
                                className={cn(
                                    '-mb-px shrink-0 border-b-2 px-4 py-3 text-[0.875rem] font-medium whitespace-nowrap transition-colors',
                                    i === active ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-900',
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div id="sprint-tabpanel" role="tabpanel" aria-labelledby={`sprint-tab-${active}`} className="pt-6">
                        {current?.content}
                    </div>

                    {related.length > 0 && (
                        <section className="mt-10" aria-labelledby="related-sprints">
                            <h2 id="related-sprints" className="mb-4 font-serif text-xl font-semibold text-ink-900">
                                Related Sprints
                            </h2>
                            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {related.slice(0, 6).map((r) => (
                                    <li key={r.id}>
                                        <Link
                                            href={`/sprints/${r.slug}`}
                                            className="group flex h-full flex-col rounded-[8px] border border-parchment-400 bg-white p-4 transition-colors hover:border-gold-400"
                                        >
                                            <span className="text-[0.625rem] font-bold tracking-wider text-gold-700 uppercase">
                                                {TYPE_LABELS[r.type as SprintTypeASlug] ?? r.type.replace(/-/g, ' ')}
                                            </span>
                                            <span className="mt-1 text-[0.875rem] font-semibold text-ink-900">{r.title}</span>
                                            <span className="mt-auto flex items-center justify-between pt-3 text-[0.8125rem] text-ink-600">
                                                {r.price_zar ? `From ${formatMoney(r.price_zar, context.currency)}` : 'Quote route'}
                                                <ArrowRight className="size-4 text-ink-400 group-hover:text-gold-600" aria-hidden="true" />
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </main>
            </div>

            {band.length > 0 && (
                <div className="bg-ink-950 text-parchment-100">
                    <div className="container-tbca flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
                        {lead && (
                            <p className="text-[0.8125rem] leading-snug">
                                {lead.split(' / ').map((l, i) => (
                                    <span key={l} className={cn('block', i > 0 && 'text-ink-300')}>
                                        {l}
                                    </span>
                                ))}
                            </p>
                        )}
                        <ul className="flex flex-wrap gap-x-8 gap-y-3">
                            {band.map((b) => {
                                const BandIcon = itemIcon(b);
                                return (
                                    <li key={b} className="flex items-center gap-2 text-[0.8125rem]">
                                        <BandIcon className="size-5 text-gold-400" strokeWidth={1.5} aria-hidden="true" />
                                        {b}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
