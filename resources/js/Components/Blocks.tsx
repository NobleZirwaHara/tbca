import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronDown, Info } from 'lucide-react';
import Card, { IconTile } from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';

/* ---------------------------------------------------------------- Stats */

export function StatBand({ stats }: { stats: { value: string; label: string; icon: string }[] }) {
    return (
        <div className="border-y border-ink-800 bg-ink-900">
            <div className="container-tbca">
                <ul className="grid grid-cols-2 divide-ink-800 md:grid-cols-3 lg:grid-cols-6 lg:divide-x">
                    {stats.map((stat) => (
                        <li key={stat.label} className="flex items-start gap-3 px-0 py-5 lg:px-5">
                            <Icon name={stat.icon} className="mt-0.5 size-5 shrink-0 text-gold-500" />
                            <div className="min-w-0">
                                <p className="font-serif text-[1.0625rem] leading-tight font-semibold text-parchment-100">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-[0.75rem] leading-snug text-ink-300">{stat.label}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------- Features */

export interface FeatureItem {
    title: string;
    body: string;
    icon?: string;
    href?: string;
}

export function FeatureGrid({
    items,
    columns = 4,
    tone = 'light',
}: {
    items: FeatureItem[];
    columns?: 2 | 3 | 4;
    tone?: 'light' | 'dark';
}) {
    const cols = {
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-4',
    }[columns];

    return (
        <ul className={cn('grid gap-px overflow-hidden rounded-[6px] border', cols,
            tone === 'dark' ? 'border-ink-700 bg-ink-700' : 'border-parchment-400 bg-parchment-400')}>
            {items.map((item) => {
                const inner = (
                    <>
                        {item.icon && (
                            <Icon
                                name={item.icon}
                                className={cn('mb-3.5 size-6', tone === 'dark' ? 'text-gold-400' : 'text-gold-600')}
                            />
                        )}
                        <h3
                            className={cn(
                                'text-[0.9375rem] font-semibold tracking-[-0.01em]',
                                tone === 'dark' ? 'text-parchment-100' : 'text-ink-900',
                            )}
                        >
                            {item.title}
                        </h3>
                        <p
                            className={cn(
                                'mt-1.5 text-[0.8125rem] leading-relaxed',
                                tone === 'dark' ? 'text-ink-300' : 'text-ink-600',
                            )}
                        >
                            {item.body}
                        </p>
                        {item.href && (
                            <span className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700">
                                Learn more
                                <ArrowRight className="size-3.5" aria-hidden="true" />
                            </span>
                        )}
                    </>
                );

                return (
                    <li key={item.title}>
                        {item.href ? (
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex h-full flex-col p-6 transition-colors',
                                    tone === 'dark' ? 'bg-ink-900 hover:bg-ink-800' : 'bg-white hover:bg-parchment-100',
                                )}
                            >
                                {inner}
                            </Link>
                        ) : (
                            <div className={cn('flex h-full flex-col p-6', tone === 'dark' ? 'bg-ink-900' : 'bg-white')}>
                                {inner}
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

/* ------------------------------------------------------------- Clusters */

export function ClusterGrid({
    clusters,
}: {
    clusters: { title: string; body: string; items: string[] }[];
}) {
    return (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster) => (
                <Card as="li" key={cluster.title} hover className="flex flex-col p-6">
                    <h3 className="font-serif text-[1.1875rem] leading-snug font-semibold text-ink-900">
                        {cluster.title}
                    </h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">{cluster.body}</p>

                    <ul className="mt-4 space-y-2 border-t border-parchment-300 pt-4">
                        {cluster.items.map((item) => (
                            <li key={item} className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-ink-700">
                                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </Card>
            ))}
        </ul>
    );
}

/* ---------------------------------------------------------------- Steps */

export function StepFlow({
    steps,
}: {
    steps: { step: number | string; title: string; body: string }[];
}) {
    return (
        <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            <span
                className="absolute top-5 right-6 left-6 hidden h-px bg-parchment-400 lg:block"
                aria-hidden="true"
            />

            {steps.map((step) => (
                <li key={step.title} className="relative">
                    <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full border-2 border-gold-500 bg-parchment-200 font-serif text-[0.9375rem] font-semibold text-gold-700">
                        {step.step}
                    </span>
                    <h3 className="mt-4 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                        {step.title}
                    </h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{step.body}</p>
                </li>
            ))}
        </ol>
    );
}

/* ----------------------------------------------------------- Data table */

export function DataTable({
    columns,
    rows,
    caption,
}: {
    columns: string[];
    rows: (string | React.ReactNode)[][];
    caption?: string;
}) {
    return (
        <div className="overflow-hidden rounded-[6px] border border-parchment-400 bg-white">
            <div className="overflow-x-auto rail-scroll">
                <table className="w-full min-w-[42rem] border-collapse text-left">
                    {caption && <caption className="sr-only">{caption}</caption>}
                    <thead>
                        <tr className="border-b border-parchment-400 bg-parchment-100">
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index} className="border-b border-parchment-300 last:border-0">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={cn(
                                            'px-5 py-3.5 align-top text-[0.8125rem] leading-relaxed',
                                            cellIndex === 0 ? 'font-semibold text-ink-900' : 'text-ink-600',
                                        )}
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ FAQ */

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <ul className="overflow-hidden rounded-[6px] border border-parchment-400 bg-white">
            {items.map((item, index) => {
                const isOpen = open === index;

                return (
                    <li key={item.q} className="border-b border-parchment-300 last:border-0">
                        <button
                            type="button"
                            onClick={() => setOpen(isOpen ? null : index)}
                            className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-parchment-100"
                            aria-expanded={isOpen}
                        >
                            <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {item.q}
                            </span>
                            <ChevronDown
                                className={cn(
                                    'mt-0.5 size-4 shrink-0 text-gold-600 transition-transform duration-200',
                                    isOpen && 'rotate-180',
                                )}
                                aria-hidden="true"
                            />
                        </button>

                        {isOpen && (
                            <div className="px-5 pb-4">
                                <p className="max-w-3xl text-[0.875rem] leading-relaxed text-ink-600">{item.a}</p>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

/* -------------------------------------------------------- Boundary note */

export function BoundaryNote({ title = 'Professional Boundary', body }: { title?: string; body: string }) {
    return (
        <div className="flex gap-4 rounded-[6px] border border-parchment-400 bg-white p-5 md:p-6">
            <IconTile name={<Info className="size-5" aria-hidden="true" />} tone="plain" />
            <div className="min-w-0">
                <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">{title}</h3>
                <p className="mt-1.5 max-w-4xl text-[0.875rem] leading-relaxed text-ink-600">{body}</p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------- Definition row */

export function DefinitionRows({
    rows,
    className,
}: {
    rows: { label: string; value: string; icon?: string }[];
    className?: string;
}) {
    return (
        <dl className={cn('space-y-2.5', className)}>
            {rows.map((row) => (
                <div key={row.label} className="flex gap-2.5">
                    <Icon name={row.icon ?? 'circle-dot'} className="mt-[3px] size-4 shrink-0 text-gold-600" />
                    <div className="min-w-0 text-[0.8125rem] leading-relaxed">
                        <dt className="inline font-semibold text-ink-900">{row.label}: </dt>
                        <dd className="inline text-ink-600">{row.value}</dd>
                    </div>
                </div>
            ))}
        </dl>
    );
}

/* --------------------------------------------------------------- Pillar */

export function PillarGrid({
    pillars,
}: {
    pillars: { number?: number; title: string; body: string; icon: string }[];
}) {
    return (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map((pillar) => (
                <Card as="li" key={pillar.title} hover className="flex flex-col p-5">
                    <Icon name={pillar.icon} className="size-6 text-gold-600" />
                    <h3 className="mt-3.5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                        {pillar.number ? `${pillar.number}. ` : ''}
                        {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{pillar.body}</p>
                </Card>
            ))}
        </ul>
    );
}
