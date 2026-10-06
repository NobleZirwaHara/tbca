import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, MessageCircle, Sparkles, UserRound, Zap } from 'lucide-react';
import Icon from '@/Components/ui/Icon';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { CalcSummary } from '@/types/core-pages';
import { formatZar } from '@/lib/money';

/** Dark hero band used across the Tools journey. */
export function ToolsHero({
    eyebrow = 'Digital Products',
    title,
    lead,
    body,
    crumbs,
    children,
    aside,
}: {
    eyebrow?: string;
    title: string;
    lead?: string;
    body?: string;
    crumbs?: Crumb[];
    children?: ReactNode;
    aside?: ReactNode;
}) {
    return (
        <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
            <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-12 lg:py-12">
                <div className="lg:col-span-7">
                    {crumbs && (
                        <div className="[&_a]:text-ink-300 [&_a:hover]:text-gold-300">
                            <Breadcrumbs items={crumbs} />
                        </div>
                    )}
                    <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-gold-500 uppercase">{eyebrow}</p>
                    <h1 className="mt-2 font-serif text-[2rem] leading-tight font-semibold md:text-[2.75rem]">{title}</h1>
                    {lead && <p className="mt-2 text-[1.0625rem] font-semibold text-parchment-100">{lead}</p>}
                    {body && <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-200">{body}</p>}
                    {children}
                </div>
                {aside && <div className="lg:col-span-5">{aside}</div>}
            </div>
        </section>
    );
}

export function ToolsTrustStrip() {
    const items = [
        { icon: 'user-check', label: 'Human-Reviewed Quality' },
        { icon: 'badge-check', label: 'Version Controlled' },
        { icon: 'lock', label: 'Secure Downloads' },
        { icon: 'languages', label: '7 Languages' },
        { icon: 'coins', label: 'ZAR Source | USD Available' },
    ];
    return (
        <div className="border-y border-gold-700/40 bg-ink-900">
            <ul className="container-tbca flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
                {items.map((i) => (
                    <li key={i.label} className="flex items-center gap-2 text-[0.75rem] font-medium text-parchment-200">
                        <Icon name={i.icon} className="size-4 text-gold-500" />
                        {i.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Product thumbnail art (no images). */
export function ProductThumb({ title, type, className }: { title: string; type: string; className?: string }) {
    return (
        <div className={cn('relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[6px] border border-gold-700/50 bg-gradient-to-br from-ink-800 to-ink-950 p-2.5', className)}>
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
            <span className="relative text-[0.625rem] leading-tight font-bold tracking-wide text-parchment-100 uppercase">{title}</span>
            <span className="relative flex items-end justify-between">
                <span className="flex h-6 items-end gap-0.5" aria-hidden="true">
                    {[3, 5, 4, 7, 6, 9].map((h, i) => (
                        <span key={i} className="w-1.5 rounded-t-sm bg-gold-500/80" style={{ height: `${h * 10}%` }} />
                    ))}
                </span>
                <span className="rounded-[2px] border border-gold-600/60 px-1 text-[0.5625rem] font-semibold text-gold-400 uppercase">{type}</span>
            </span>
        </div>
    );
}

export function NeedHelpChoosing() {
    return (
        <aside className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="text-[0.9375rem] font-bold text-ink-900">Need Help Choosing?</h2>
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-500">
                Tell us what you are trying to achieve and we will help you identify the most suitable tool, template, calculator or related Sprint.
            </p>
            <ul className="mt-4 space-y-2.5">
                <li>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'AI guidance: choosing a digital product', section: 'tools' })} className="flex w-full items-center gap-3 rounded-[6px] border border-parchment-400 p-2.5 text-left hover:border-gold-400">
                        <span className="inline-flex size-8 items-center justify-center rounded-[5px] bg-ink-900 text-gold-400"><Sparkles className="size-4" aria-hidden="true" /></span>
                        <span><span className="block text-[0.8125rem] font-semibold text-ink-900">Ask AI Guidance</span><span className="block text-[0.6875rem] text-ink-500">Get intelligent recommendations</span></span>
                    </button>
                </li>
                <li>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'Speak to a TBCA expert about digital products', section: 'tools' })} className="flex w-full items-center gap-3 rounded-[6px] border border-parchment-400 p-2.5 text-left hover:border-gold-400">
                        <span className="inline-flex size-8 items-center justify-center rounded-[5px] bg-ink-900 text-gold-400"><UserRound className="size-4" aria-hidden="true" /></span>
                        <span><span className="block text-[0.8125rem] font-semibold text-ink-900">Ask a Human</span><span className="block text-[0.6875rem] text-ink-500">Speak to a TBCA expert</span></span>
                    </button>
                </li>
                <li>
                    <Link href="/shop" className="flex w-full items-center gap-3 rounded-[6px] border border-parchment-400 p-2.5 hover:border-gold-400">
                        <span className="inline-flex size-8 items-center justify-center rounded-[5px] bg-ink-900 text-gold-400"><Zap className="size-4" aria-hidden="true" /></span>
                        <span><span className="block text-[0.8125rem] font-semibold text-ink-900">Start a Sprint</span><span className="block text-[0.6875rem] text-ink-500">Get expert help to get it done</span></span>
                    </Link>
                </li>
            </ul>
            <p className="mt-4 text-[0.75rem] font-semibold text-ink-700">Need immediate help?</p>
            <a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="mt-1.5 flex items-center gap-2 text-[0.8125rem] font-semibold text-verified-700 hover:underline">
                <MessageCircle className="size-4" aria-hidden="true" /> Chat on WhatsApp
            </a>
        </aside>
    );
}

export function NeedMoreBand() {
    return (
        <section className="bg-ink-950">
            <div className="container-tbca flex flex-col items-start justify-between gap-4 py-7 md:flex-row md:items-center">
                <div>
                    <h2 className="font-serif text-[1.375rem] font-semibold text-gold-400">Need More Than a Download?</h2>
                    <p className="mt-1 text-[0.8125rem] text-parchment-200">Combine a digital product with a TBCA Sprint, human review or implementation support.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/shop" className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-400">
                        Start a Sprint <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'Digital products question', section: 'tools' })} className="inline-flex h-10 items-center rounded-[4px] border border-ink-600 px-4 text-[0.8125rem] font-medium text-parchment-100 hover:border-gold-500">
                        Ask a Question
                    </button>
                    <Link href="/services" className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-400 hover:text-gold-300">
                        View Related Services <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export function formatCalc(s: CalcSummary): string {
    if (typeof s.value === 'string') return s.value;
    switch (s.format) {
        case 'money':
            return formatZar(s.value).replace(/^R/, 'R ');
        case 'percent':
            return `${s.value.toLocaleString('en-ZA')}%`;
        case 'ratio':
            return `${s.value.toFixed(2)}x`;
        default:
            return s.value.toLocaleString('en-ZA');
    }
}

export function formatCell(v: string | number): string {
    return typeof v === 'number' ? v.toLocaleString('en-ZA', { maximumFractionDigits: 2 }) : v;
}

export const DISCLAIMER =
    'TBCA digital products support planning, analysis and implementation. They do not replace legal, tax, accounting, investment, engineering, audit or other regulated professional advice. Human or qualified professional review applies where required.';
