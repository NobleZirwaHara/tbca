import { Link, usePage } from '@inertiajs/react';
import * as L from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import HeroArt from '@/Components/Art/HeroArt';
import { Crumbs, Ico } from '@/Components/Webinars/kit';
import type { SharedProps } from '@/types';

export interface KpSection {
    href: string;
    label: string;
    icon: string;
    body: string;
}

export interface KpTheme {
    slug: string;
    label: string;
    icon: string;
    blurb: string;
}

export interface KpCard {
    slug: string;
    title: string;
    summary: string | null;
    theme: string;
    themeLabel: string;
    format: string;
    formatLabel: string;
    icon: string;
    status: 'pending' | 'published';
    featured: boolean;
    series: string | null;
    published: string | null;
}

export interface KpShared {
    sections: KpSection[];
    themes: KpTheme[];
    formats: { key: string; label: string; plural: string; icon: string }[];
    plannedPages: number;
}

/** Page frame for the KP Thought Leadership section: dark hero plus section navigation. */
export default function KpFrame({
    sections,
    crumbs,
    eyebrow = 'KP Thought Leadership',
    title,
    gold,
    lead,
    aside,
    actions,
    children,
}: {
    sections: KpSection[];
    crumbs: [string, string?][];
    eyebrow?: string;
    title: ReactNode;
    gold?: ReactNode;
    lead?: ReactNode;
    aside?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}) {
    const { url } = usePage<SharedProps>().props;
    return (
        <div className="bg-parchment-100">
            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <HeroArt className="absolute inset-0 h-full w-full" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div>
                        <Crumbs items={crumbs} dark />
                        <p className="mt-4 text-[0.75rem] font-semibold tracking-[0.2em] text-gold-400 uppercase">{eyebrow}</p>
                        <h1 className="mt-2 font-serif text-[2.125rem] leading-[1.08] font-bold text-parchment-50 md:text-[2.75rem]">
                            {title}
                            {gold && <><br /><span className="text-gold-400">{gold}</span></>}
                        </h1>
                        {lead && <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-parchment-200">{lead}</p>}
                        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
                    </div>
                    {aside && <div className="self-center">{aside}</div>}
                </div>
            </section>
            <nav aria-label="KP Thought Leadership sections" className="sticky top-0 z-20 border-b border-gold-700/40 bg-ink-900">
                <ul className="container-tbca flex gap-1 overflow-x-auto py-1.5">
                    {sections.map((s) => {
                        const active = s.href === '/kp-thought-leadership' ? url.path === s.href : url.path.startsWith(s.href);
                        return (
                            <li key={s.href}>
                                <Link href={s.href} aria-current={active ? 'page' : undefined} className={cn('flex shrink-0 items-center gap-1.5 rounded-[6px] px-3 py-2 text-[0.8125rem] font-semibold whitespace-nowrap', active ? 'bg-gold-500 text-ink-900' : 'text-parchment-200 hover:text-gold-300')}>
                                    <Ico name={s.icon} className="size-4" />
                                    {s.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="container-tbca space-y-8 py-8">{children}</div>
        </div>
    );
}

export function KpItemCard({ item, compact }: { item: KpCard; compact?: boolean }) {
    const pending = item.status === 'pending';
    return (
        <li className="flex flex-col rounded-[10px] border border-parchment-400 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-wide text-gold-700 uppercase"><Ico name={item.icon} className="size-3.5" />{item.formatLabel}</span>
                {pending ? <span className="rounded-full border border-attested-500/40 bg-attested-50 px-2 py-0.5 text-[0.625rem] font-bold text-attested-700">Article pending from KP</span> : item.published && <span className="text-[0.6875rem] text-ink-500">{item.published}</span>}
            </div>
            <h3 className="mt-2 font-serif text-[1.0625rem] leading-snug font-bold text-ink-900">
                <Link href={`/kp-thought-leadership/articles/${item.slug}`} className="hover:text-gold-700">{item.title}</Link>
            </h3>
            {!compact && <p className="mt-1 text-[0.8125rem] text-ink-600">{item.summary ?? 'Title, summary and full text will be published when KP supplies this article.'}</p>}
            <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[0.75rem]">
                <Link href={`/kp-thought-leadership/themes/${item.theme}`} className="text-ink-500 hover:text-gold-700">{item.themeLabel}</Link>
                <Link href={`/kp-thought-leadership/articles/${item.slug}`} className="inline-flex items-center gap-1 font-semibold text-gold-700">{pending ? 'View' : 'Read'} <L.ArrowRight className="size-3.5" aria-hidden="true" /></Link>
            </div>
        </li>
    );
}

export function SectionHeading({ title, more, sub }: { title: string; more?: [string, string]; sub?: string }) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h2 className="font-serif text-[1.625rem] font-bold text-ink-900">{title}</h2>
                {sub && <p className="text-[0.875rem] text-ink-600">{sub}</p>}
            </div>
            {more && <Link href={more[1]} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">{more[0]} <L.ArrowRight className="size-4" aria-hidden="true" /></Link>}
        </div>
    );
}
