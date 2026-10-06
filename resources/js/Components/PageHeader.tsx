import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    lead?: string;
    intro?: string;
    crumbs?: Crumb[];
    aside?: {
        title: string;
        body: string;
        items?: string[];
        icon?: string;
        link?: { label: string; href: string };
    };
    children?: ReactNode;
    className?: string;
}

/**
 * Standard light page header: Africa network motif, serif title,
 * gold statement line, and an optional evidence panel on the right.
 */
export default function PageHeader({
    eyebrow,
    title,
    lead,
    intro,
    crumbs,
    aside,
    children,
    className,
}: PageHeaderProps) {
    return (
        <header className={cn('relative overflow-hidden border-b border-parchment-400 bg-parchment-100', className)}>
            <div
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] motif-grid opacity-40 lg:block"
                aria-hidden="true"
                style={{
                    maskImage: 'radial-gradient(70% 70% at 70% 40%, black 0%, transparent 78%)',
                    WebkitMaskImage: 'radial-gradient(70% 70% at 70% 40%, black 0%, transparent 78%)',
                }}
            />

            <div className="container-tbca relative pt-6 pb-10 md:pt-8 md:pb-14">
                {crumbs && <Breadcrumbs items={crumbs} />}

                <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-7">
                        {eyebrow && (
                            <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-700">
                                {eyebrow}
                            </p>
                        )}

                        <h1 className="font-serif text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-ink-900 md:text-[3.25rem]">
                            {title}
                        </h1>

                        {lead && (
                            <p className="mt-3 font-serif text-[1.25rem] leading-snug text-gold-700 md:text-[1.625rem]">
                                {lead}
                            </p>
                        )}

                        {intro && (
                            <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-600 md:text-[1.0625rem]">
                                {intro}
                            </p>
                        )}

                        {children}
                    </div>

                    {aside && (
                        <aside className="lg:col-span-5">
                            <div className="rounded-[6px] border border-gold-300 bg-gold-50/60 p-6">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[5px] border border-gold-300 bg-white text-gold-700">
                                        <Icon name={aside.icon ?? 'shield-check'} className="size-[18px]" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                            {aside.title}
                                        </h2>
                                        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-600">
                                            {aside.body}
                                        </p>
                                    </div>
                                </div>

                                {aside.items && aside.items.length > 0 && (
                                    <ul className="mt-4 space-y-2 border-t border-gold-300/60 pt-4">
                                        {aside.items.map((item) => (
                                            <li
                                                key={item}
                                                className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-ink-700"
                                            >
                                                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {aside.link && (
                                    <Link
                                        href={aside.link.href}
                                        className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700 transition-colors hover:text-gold-800"
                                    >
                                        {aside.link.label}
                                        <ArrowRight className="size-3.5" aria-hidden="true" />
                                    </Link>
                                )}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </header>
    );
}
