import { Link } from '@inertiajs/react';
import { ChevronRight, Search, Sparkles } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';
import type { Badge } from '@/types/sprints';

/** Dark "city at night" backdrop used by every sprint hero (no photography, gradients only). */
export function NightBackdrop() {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    background:
                        'radial-gradient(40% 60% at 85% 30%, rgba(214,163,46,0.18), transparent 70%), radial-gradient(30% 40% at 60% 100%, rgba(214,163,46,0.10), transparent 70%), linear-gradient(180deg, rgba(8,8,11,0) 60%, rgba(8,8,11,0.6) 100%)',
                }}
            />
            {/* skyline silhouette */}
            <svg className="pointer-events-none absolute right-0 bottom-0 hidden h-28 w-[55%] text-ink-900/80 lg:block" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M0 120V80h20V60h18v20h14V40h22v40h10V70h16V30h8V10h6v20h8v50h18V55h20v25h12V45h26v35h10V65h14v15h20V35h10V20h12v15h10v45h16V60h18v20h12V50h24v30h14V70h18V40h16v40h20V58h22v22h16V30h12v50h20V66h24v14h20V48h18v32h18v40z"
                />
            </svg>
        </>
    );
}

export function Crumbs({ items, tone = 'dark' }: { items: { label: string; href?: string }[]; tone?: 'dark' | 'light' }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className={cn('flex flex-wrap items-center gap-1.5 text-[0.75rem]', tone === 'dark' ? 'text-ink-300' : 'text-ink-400')}>
                {items.map((c, i) => {
                    const last = i === items.length - 1;
                    return (
                        <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                            {c.href && !last ? (
                                <Link href={c.href} className="hover:text-gold-300">
                                    {c.label}
                                </Link>
                            ) : (
                                <span className={last ? 'text-gold-400' : undefined} aria-current={last ? 'page' : undefined}>
                                    {c.label}
                                </span>
                            )}
                            {!last && <ChevronRight className="size-3" aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export function BadgeRow({ badges, className }: { badges: Badge[]; className?: string }) {
    return (
        <ul className={cn('flex flex-wrap gap-x-5 gap-y-2', className)}>
            {badges.map((b) => (
                <li key={b.label} className="flex items-center gap-2 text-[0.8125rem] text-parchment-200">
                    <Icon name={b.icon} className="size-4 text-gold-400" />
                    {b.label}
                </li>
            ))}
        </ul>
    );
}

/** Search form: submits the query back to the catalogue path (server-side search). */
export function SearchBar({
    placeholder,
    defaultValue,
    onSearch,
    buttonLabel = 'Search Sprints',
    finderHref = '/sprints/recommended',
    size = 'lg',
    tone = 'dark',
}: {
    tone?: 'dark' | 'light';
    placeholder: string;
    defaultValue?: string | null;
    onSearch: (q: string) => void;
    buttonLabel?: string;
    finderHref?: string | null;
    size?: 'md' | 'lg';
}) {
    const [q, setQ] = useState(defaultValue ?? '');

    function submit(e: FormEvent) {
        e.preventDefault();
        onSearch(q.trim());
    }

    return (
        <div className="flex flex-col gap-3 md:flex-row">
            <form onSubmit={submit} role="search" className="flex flex-1 overflow-hidden rounded-[6px] border border-ink-600 bg-white">
                <label className="flex flex-1 items-center gap-2.5 px-4">
                    <Search className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                    <span className="sr-only">Search</span>
                    <input
                        type="search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={placeholder}
                        className={cn('w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none', size === 'lg' ? 'h-12' : 'h-10')}
                    />
                </label>
                <button type="submit" className="m-1 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold whitespace-nowrap text-ink-900 hover:bg-gold-400 md:px-6">
                    {buttonLabel}
                </button>
            </form>
            {finderHref && (
                <Link
                    href={finderHref}
                    className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-[6px] border border-gold-500/70 px-5 text-sm font-semibold hover:bg-gold-500/10',
                        tone === 'dark' ? 'text-parchment-100' : 'text-ink-900',
                        size === 'lg' ? 'h-12' : 'h-10',
                    )}
                >
                    <Sparkles className="size-4 text-gold-400" aria-hidden="true" />
                    Find the Right Sprint
                    <span className="rounded-[3px] border border-gold-500 px-1 text-[0.625rem] font-bold text-gold-400">AI</span>
                </Link>
            )}
        </div>
    );
}

export default function SprintHero({
    crumbs,
    title,
    description,
    badges,
    children,
    serif = false,
    aside,
}: {
    crumbs: { label: string; href?: string }[];
    title: string;
    description: string;
    badges?: Badge[];
    children?: ReactNode;
    serif?: boolean;
    aside?: ReactNode;
}) {
    return (
        <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <NightBackdrop />
            <div className="container-tbca relative py-9 md:py-12">
                <Crumbs items={crumbs} />
                <div className={cn('grid gap-8', aside && 'lg:grid-cols-[minmax(0,1fr)_320px]')}>
                    <div className="min-w-0">
                        <h1
                            className={cn(
                                'text-[2rem] leading-[1.08] tracking-[-0.02em] text-white md:text-[2.75rem]',
                                serif ? 'font-serif font-semibold' : 'font-bold',
                            )}
                        >
                            {title}
                        </h1>
                        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-parchment-200 md:text-base">{description}</p>
                        {badges && badges.length > 0 && <BadgeRow badges={badges} className="mt-5" />}
                        {children && <div className="mt-6">{children}</div>}
                    </div>
                    {aside}
                </div>
            </div>
        </section>
    );
}
