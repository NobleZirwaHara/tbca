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
}

const TIERS: { key: DeliverableTier; label: string }[] = [
    { key: 'basic', label: 'Basic' },
    { key: 'standard', label: 'Standard' },
    { key: 'premium', label: 'Premium' },
];

const asTier = (v: string | null | undefined): DeliverableTier | null => (v === 'basic' || v === 'standard' || v === 'premium' ? v : null);

/** Reads the package a visitor picks in any Sprint template's package selector, without each template having to report it. */
function tierFromEvent(target: EventTarget | null, panel: HTMLElement | null): DeliverableTier | null {
    if (!(target instanceof Element) || panel?.contains(target)) return null;
    if (target instanceof HTMLInputElement && target.type === 'radio') return asTier(target.value);
    const option = target.closest('[role="radio"]');
    // The option's text runs together (name, price, delivery), so take the first package name in it.
    const word = option?.textContent?.match(/(Basic|Standard|Premium)/i)?.[1];
    return word ? asTier(word.toLowerCase()) : null;
}

/**
 * "What you will receive" on every Sprint detail page: the deliverables the Registry
 * of Deliverables links to this Sprint, with the extent of detail and page count for
 * the selected package. Follows the page's package selector and the ?package= query.
 */
export default function WhatYouWillReceive({ deliverables, selectedPackage }: { deliverables: ReceivedDeliverable[]; selectedPackage?: string | null }) {
    const [tier, setTier] = useState<DeliverableTier>(asTier(selectedPackage) ?? 'standard');
    const [panel, setPanel] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const t = asTier(selectedPackage);
        if (t) setTier(t);
    }, [selectedPackage]);

    useEffect(() => {
        const follow = (e: Event) => {
            const t = tierFromEvent(e.target, panel);
            if (t) setTier(t);
        };
        document.addEventListener('change', follow);
        document.addEventListener('click', follow);
        return () => {
            document.removeEventListener('change', follow);
            document.removeEventListener('click', follow);
        };
    }, [panel]);

    if (deliverables.length === 0) return null;

    const tierLabel = TIERS.find((t) => t.key === tier)?.label ?? 'Standard';

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

                <ul className="mt-5 space-y-4">
                    {deliverables.map((d) => (
                        <DeliverableCard key={d.ref} d={d} tier={tier} />
                    ))}
                </ul>
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
