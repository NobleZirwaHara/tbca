import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, FileText, Layers } from 'lucide-react';
import { cn } from '@/lib/cn';

export type DeliverableTier = 'basic' | 'standard' | 'premium';

export interface ReceivedDeliverable {
    ref: string;
    name: string;
    format: string;
    formatDetail: string | null;
    description: string | null;
    keyIssues: string[];
    pageUnit: string | null;
    tiers: Record<DeliverableTier, { extent: string | null; pages: string | null; delivery: string | null }>;
    /** Produced for every product of this kind (for example every Due Diligence case), not only this one. */
    shared?: boolean;
}

const TIERS: { key: DeliverableTier; label: string }[] = [
    { key: 'basic', label: 'Basic' },
    { key: 'standard', label: 'Standard' },
    { key: 'premium', label: 'Premium' },
];

const asTier = (v: string | null | undefined): DeliverableTier | null => (v === 'basic' || v === 'standard' || v === 'premium' ? v : null);

/**
 * Reads the package a visitor picks in the page's package selector, without each page
 * having to report it. Aliases map a page's own package names (for example Essential,
 * Enhanced, Executive) to Basic, Standard and Premium.
 */
function tierFromEvent(target: EventTarget | null, panel: HTMLElement | null, aliases: Record<string, DeliverableTier>): DeliverableTier | null {
    if (!(target instanceof Element) || panel?.contains(target)) return null;
    const names = ['basic', 'standard', 'premium', ...Object.keys(aliases)];
    const resolve = (word: string | undefined) => (word ? (asTier(word.toLowerCase()) ?? aliases[word.toLowerCase()] ?? null) : null);
    if (target instanceof HTMLInputElement && target.type === 'radio') {
        const direct = resolve(target.value);
        if (direct) return direct;
    }
    const option = target.closest('[role="radio"], label:has(input[type="radio"])');
    // The option's text runs together (name, price, delivery), so take the first package name in it.
    const word = option?.textContent?.match(new RegExp(`(${names.join('|')})`, 'i'))?.[1];
    return resolve(word);
}

/**
 * "What you will receive" on every Sprint detail page: the deliverables the Registry
 * of Deliverables links to this Sprint, with the extent of detail and page count for
 * the selected package. Follows the page's package selector and the ?package= query.
 */
export default function WhatYouWillReceive({
    deliverables,
    selectedPackage,
    tierAliases = {},
}: {
    deliverables: ReceivedDeliverable[];
    selectedPackage?: string | null;
    tierAliases?: Record<string, DeliverableTier>;
}) {
    const [tier, setTier] = useState<DeliverableTier>(asTier(selectedPackage) ?? 'standard');
    const [panel, setPanel] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const t = asTier(selectedPackage);
        if (t) setTier(t);
    }, [selectedPackage]);

    useEffect(() => {
        const follow = (e: Event) => {
            const t = tierFromEvent(e.target, panel, tierAliases);
            if (t) setTier(t);
        };
        document.addEventListener('change', follow);
        document.addEventListener('click', follow);
        return () => {
            document.removeEventListener('change', follow);
            document.removeEventListener('click', follow);
        };
    }, [panel, tierAliases]);

    if (deliverables.length === 0) return null;

    const tierLabel = TIERS.find((t) => t.key === tier)?.label ?? 'Standard';
    const own = deliverables.filter((d) => !d.shared);
    const shared = deliverables.filter((d) => d.shared);

    return (
        <section ref={setPanel} aria-labelledby="what-you-will-receive" className="border-t border-parchment-400 bg-parchment-100">
            <div className="container-tbca py-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                        <h2 id="what-you-will-receive" className="text-xl font-bold text-ink-900">
                            What you will receive
                        </h2>
                        <p className="mt-1 text-[0.8125rem] text-ink-600">
                            {deliverables.length === 1 ? 'The deliverable' : `The ${deliverables.length} deliverables`} in the {tierLabel} package, with the extent of detail and length.
                        </p>
                    </div>
                    <div role="group" aria-label="Package shown" className="inline-flex rounded-[6px] border border-parchment-500 bg-white p-0.5">
                        {TIERS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                aria-pressed={tier === t.key}
                                onClick={() => setTier(t.key)}
                                className={cn(
                                    'rounded-[4px] px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold-500',
                                    tier === t.key ? 'bg-ink-900 text-gold-400' : 'text-ink-700 hover:bg-parchment-200',
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {own.length > 0 && (
                    <ul className="mt-5 space-y-4">
                        {own.map((d) => (
                            <DeliverableCard key={d.ref} d={d} tier={tier} />
                        ))}
                    </ul>
                )}

                {shared.length > 0 && <SharedList items={shared} tier={tier} />}
            </div>
        </section>
    );
}

function DeliverableCard({ d, tier }: { d: ReceivedDeliverable; tier: DeliverableTier }) {
    const [allIssues, setAllIssues] = useState(false);
    const t = d.tiers[tier];
    const issues = allIssues ? d.keyIssues : d.keyIssues.slice(0, 8);
    // "Other" is a register class, not a format a client recognises; the detail ("Plan / Roadmap", "Checklist") is.
    const format = d.format === 'Other' && d.formatDetail ? d.formatDetail : d.format;

    return (
        <li className="rounded-[8px] border border-parchment-400 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="min-w-0 text-[1rem] font-semibold text-ink-900 [overflow-wrap:anywhere]">{d.name}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-gold-50 px-2.5 py-0.5 text-[0.75rem] font-semibold text-gold-800">
                    <FileText className="size-3.5" aria-hidden="true" />
                    {format}
                </span>
            </div>
            {d.description && <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-700">{d.description}</p>}

            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="min-w-0">
                    <h4 className="text-[0.75rem] font-bold tracking-wide text-ink-900 uppercase">Key issues covered</h4>
                    {issues.length === 0 ? (
                        <p className="mt-2 text-[0.8125rem] text-ink-500">Set at intake for your organisation.</p>
                    ) : (
                        <ul className="mt-2 space-y-1.5">
                            {issues.map((issue) => (
                                <li key={issue} className="flex items-start gap-2 text-[0.8125rem] text-ink-700">
                                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                                    <span className="min-w-0 [overflow-wrap:anywhere]">{issue}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {d.keyIssues.length > 8 && (
                        <button type="button" onClick={() => setAllIssues((v) => !v)} className="mt-2 text-[0.75rem] font-semibold text-gold-700 hover:underline">
                            {allIssues ? 'Show fewer' : `Show all ${d.keyIssues.length}`}
                        </button>
                    )}
                </div>

                <div className="min-w-0 rounded-[6px] border border-parchment-400 bg-parchment-50 p-3.5">
                    <h4 className="text-[0.75rem] font-bold tracking-wide text-ink-900 uppercase">Extent of detail</h4>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-700 [overflow-wrap:anywhere]">{t.extent ?? 'Set by the package scope.'}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-parchment-400 pt-3 text-[0.8125rem]">
                        <div>
                            <dt className="flex items-center gap-1.5 text-ink-500">
                                <Layers className="size-3.5" aria-hidden="true" />
                                Length
                            </dt>
                            <dd className="mt-0.5 font-semibold text-ink-900">{t.pages ? `${t.pages} ${d.pageUnit ?? 'pages'}` : 'Not fixed'}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1.5 text-ink-500">
                                <Clock className="size-3.5" aria-hidden="true" />
                                Delivery
                            </dt>
                            <dd className="mt-0.5 font-semibold text-ink-900">{t.delivery ?? 'After scoping'}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </li>
    );
}

/** Deliverables produced for every order of this kind, listed compactly. */
function SharedList({ items, tier }: { items: ReceivedDeliverable[]; tier: DeliverableTier }) {
    const [open, setOpen] = useState<string | null>(null);

    return (
        <div className="mt-5 rounded-[8px] border border-parchment-400 bg-white p-4 sm:p-5">
            <h3 className="text-[0.9375rem] font-semibold text-ink-900">Also provided with every order of this kind</h3>
            <ul className="mt-3 divide-y divide-parchment-300">
                {items.map((d) => {
                    const t = d.tiers[tier];
                    const format = d.format === 'Other' && d.formatDetail ? d.formatDetail : d.format;
                    const expanded = open === d.ref;
                    return (
                        <li key={d.ref} className="py-2.5">
                            <button
                                type="button"
                                aria-expanded={expanded}
                                onClick={() => setOpen(expanded ? null : d.ref)}
                                className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-left"
                            >
                                <span className="min-w-0 text-[0.8125rem] font-medium text-ink-900 [overflow-wrap:anywhere]">{d.name}</span>
                                <span className="text-[0.75rem] text-ink-500">
                                    {format}
                                    {t.pages ? ` · ${t.pages} ${d.pageUnit ?? 'pages'}` : ''}
                                </span>
                            </button>
                            {expanded && (
                                <div className="mt-2 space-y-1.5 text-[0.8125rem] text-ink-700">
                                    {d.description && <p>{d.description}</p>}
                                    {t.extent && <p className="text-ink-600">{t.extent}</p>}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
