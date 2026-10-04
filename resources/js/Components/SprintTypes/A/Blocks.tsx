import { useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown, CircleCheck, Scale, ShieldCheck, UserCheck, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Comparison, ExtraPanel, LabelValue, ProcessStep } from '@/types/sprint-types-a';
import { itemIcon } from './icons';

/* ==========================================================================
   Body panels shared by the Group A sprint-type templates.
   ========================================================================== */

/** Cream bordered card with an icon + bold title, as used throughout the sprint mockups. */
export function Box({
    title,
    icon: Icon,
    aside,
    children,
    className,
    tone = 'cream',
}: {
    title?: ReactNode;
    icon?: LucideIcon;
    aside?: ReactNode;
    children: ReactNode;
    className?: string;
    tone?: 'cream' | 'white';
}) {
    return (
        <section
            className={cn(
                'rounded-[8px] border p-4 sm:p-5',
                tone === 'cream' ? 'border-gold-200/70 bg-gold-50/60' : 'border-parchment-400 bg-white',
                className,
            )}
        >
            {(title || aside) && (
                <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    {title && (
                        <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink-900">
                            {Icon && <Icon className="size-4.5 text-gold-600" aria-hidden="true" />}
                            {title}
                        </h3>
                    )}
                    {aside}
                </header>
            )}
            {children}
        </section>
    );
}

/** Gold-tick list; `columns` splits into a responsive grid. */
export function CheckList({ items, columns = 1, tone = 'gold', className }: { items: string[]; columns?: 1 | 2 | 3; tone?: 'gold' | 'muted'; className?: string }) {
    if (!items.length) return null;
    return (
        <ul
            className={cn(
                'grid gap-x-6 gap-y-2 text-[0.8125rem] text-ink-700',
                columns === 2 && 'sm:grid-cols-2',
                columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
                className,
            )}
        >
            {items.map((item, i) => (
                <li key={`${item}-${i}`} className="flex items-start gap-2">
                    <CircleCheck className={cn('mt-0.5 size-4 shrink-0', tone === 'gold' ? 'text-gold-600' : 'text-ink-300')} aria-hidden="true" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

/** Row of icon tiles ("What's Included"). Icons are picked from the item wording. */
export function IconGrid({ items, className }: { items: string[]; className?: string }) {
    if (!items.length) return null;
    return (
        <ul className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6', className)}>
            {items.map((item, i) => {
                const Icon = itemIcon(item);
                return (
                    <li key={`${item}-${i}`} className="flex flex-col items-center gap-2 rounded-[6px] border border-parchment-400 bg-white px-2 py-3 text-center">
                        <Icon className="size-6 text-gold-600" aria-hidden="true" strokeWidth={1.5} />
                        <span className="text-[0.75rem] leading-tight text-ink-700">{item}</span>
                    </li>
                );
            })}
        </ul>
    );
}

/** Numbered gold circles joined by a dashed line. Wraps to a vertical list on phones. */
export function ProcessSteps({ steps, icons = false }: { steps: ProcessStep[]; icons?: boolean }) {
    if (!steps.length) return null;
    return (
        <ol className="grid gap-4 sm:flex sm:items-start sm:gap-0">
            {steps.map((step, i) => {
                const Icon = itemIcon(step.title);
                return (
                    <li key={`${step.title}-${i}`} className="relative flex items-start gap-3 sm:flex-1 sm:flex-col sm:items-center sm:text-center">
                        {i > 0 && (
                            <span aria-hidden="true" className="absolute top-4 right-1/2 hidden w-full border-t-2 border-dashed border-gold-300 sm:block" />
                        )}
                        <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-ink-900 ring-4 ring-gold-50">
                            {icons ? <Icon className="size-4" aria-hidden="true" /> : i + 1}
                        </span>
                        <span className="sm:mt-2 sm:px-1">
                            <span className="block text-[0.75rem] leading-tight font-semibold text-ink-800">{step.title}</span>
                            {step.body && <span className="mt-1 block text-[0.6875rem] leading-snug text-ink-500">{step.body}</span>}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/** Human Review / Risk Rating / Compliance strip. */
export function GovernanceStrip({ items }: { items: LabelValue[] }) {
    if (!items.length) return null;
    const icons = [UserCheck, ShieldCheck, Scale];
    return (
        <div className="grid divide-y divide-parchment-400 rounded-[8px] border border-parchment-400 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {items.map((g, i) => {
                const Icon = icons[i % icons.length];
                return (
                    <div key={g.label} className="flex items-center gap-3 px-5 py-4">
                        <Icon className="size-7 shrink-0 text-gold-600" strokeWidth={1.5} aria-hidden="true" />
                        <div>
                            <p className="text-[0.8125rem] font-semibold text-ink-900">{g.label}</p>
                            <p className="text-[0.75rem] text-ink-500">{g.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** Label / value rows (checklist facts sidebar, licence details). */
export function FactList({ items, footer }: { items: LabelValue[]; footer?: ReactNode }) {
    if (!items.length) return null;
    return (
        <div className="space-y-1.5">
            {items.map((f) => {
                const Icon = itemIcon(`${f.label} ${f.value}`);
                return (
                    <div key={f.label} className="flex items-center gap-3 rounded-[6px] border border-parchment-400 bg-white px-3 py-2 text-[0.8125rem]">
                        <Icon className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                        <span className="w-24 shrink-0 font-semibold text-ink-800">{f.label}</span>
                        <span className="text-ink-500">{f.value}</span>
                    </div>
                );
            })}
            {footer}
        </div>
    );
}

/** Two-column "Generic vs TBCA" comparison table. */
export function ComparisonTable({ data }: { data: Comparison }) {
    const rows = Math.max(data.left.length, data.right.length);
    return (
        <div className="overflow-hidden rounded-[6px] border border-parchment-400 bg-white text-[0.75rem]">
            <div className="grid grid-cols-2">
                <p className="bg-parchment-300 px-3 py-2 text-center font-semibold text-ink-700">{data.left_title}</p>
                <p className="bg-gold-100 px-3 py-2 text-center font-semibold text-gold-800">{data.right_title}</p>
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="grid grid-cols-2 border-t border-parchment-300">
                    <p className="flex items-start gap-1.5 px-3 py-2 text-ink-500">
                        {data.left[i] && <X className="mt-0.5 size-3.5 shrink-0 text-ink-300" aria-hidden="true" />}
                        {data.left[i]}
                    </p>
                    <p className="flex items-start gap-1.5 bg-gold-50/50 px-3 py-2 text-ink-800">
                        {data.right[i] && <Check className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />}
                        {data.right[i]}
                    </p>
                </div>
            ))}
        </div>
    );
}

/** Small rounded chip used for audience / meta tags. */
export function Chip({ children, tone = 'dark' }: { children: ReactNode; tone?: 'dark' | 'light' }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-[0.75rem] font-medium',
                tone === 'dark' ? 'border-ink-600 bg-ink-800/80 text-parchment-100' : 'border-parchment-500 bg-white text-ink-700',
            )}
        >
            {children}
        </span>
    );
}

/** Paragraphs separated by blank lines. */
export function Prose({ text, className }: { text?: string | null; className?: string }) {
    if (!text) return null;
    return (
        <div className={cn('space-y-2 text-[0.875rem] leading-relaxed text-ink-700', className)}>
            {text.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
            ))}
        </div>
    );
}

/** Accessible accordion FAQ list. */
export function Faqs({ items }: { items: { q: string; a: string }[] }) {
    const [open, setOpen] = useState<number | null>(0);
    if (!items.length) return <p className="text-sm text-ink-500">Questions? Use “Ask a Question” and the TBCA team will reply.</p>;
    return (
        <div className="divide-y divide-parchment-400 rounded-[8px] border border-parchment-400 bg-white">
            {items.map((f, i) => {
                const isOpen = open === i;
                return (
                    <div key={f.q}>
                        <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpen(isOpen ? null : i)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.875rem] font-semibold text-ink-900 hover:text-gold-700"
                        >
                            {f.q}
                            <ChevronDown className={cn('size-4 shrink-0 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                        </button>
                        {isOpen && <p className="px-4 pb-4 text-[0.8125rem] leading-relaxed text-ink-600">{f.a}</p>}
                    </div>
                );
            })}
        </div>
    );
}

/** Renders any additional captured panel generically. */
export function ExtraPanels({ panels, className }: { panels?: ExtraPanel[]; className?: string }) {
    if (!panels?.length) return null;
    return (
        <div className={cn('grid gap-4 md:grid-cols-2', className)}>
            {panels.map((p, i) => {
                const items = p.items ?? [];
                const strings = items.map((it) =>
                    typeof it === 'string' ? it : 'value' in it ? `${it.label}: ${it.value}` : 'title' in it ? it.title : String(it),
                );
                return (
                    <Box key={`${p.title}-${i}`} title={p.title} tone="white">
                        {p.text && <Prose text={p.text} className="mb-2 text-[0.8125rem]" />}
                        {p.kind === 'steps' ? (
                            <ProcessSteps steps={strings.map((title) => ({ title }))} />
                        ) : p.kind === 'chips' ? (
                            <div className="flex flex-wrap gap-2">
                                {strings.map((s) => (
                                    <Chip key={s} tone="light">
                                        {s}
                                    </Chip>
                                ))}
                            </div>
                        ) : (
                            <CheckList items={strings} columns={strings.length > 6 ? 2 : 1} />
                        )}
                        {p.note && <p className="mt-2 text-[0.75rem] text-ink-500 italic">{p.note}</p>}
                    </Box>
                );
            })}
        </div>
    );
}

/** Text link with an arrow. */
export function ArrowItem({ children }: { children: ReactNode }) {
    return (
        <span className="flex items-center justify-between gap-3 text-[0.8125rem] text-ink-700">
            {children}
            <ArrowRight className="size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
        </span>
    );
}
