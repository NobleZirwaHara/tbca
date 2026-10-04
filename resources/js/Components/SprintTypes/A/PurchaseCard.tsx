import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CircleHelp, Eye, Lock, Receipt, Scale, ShieldCheck, UserCheck, Users, type LucideIcon } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Modal } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/money';
import type { SharedProps, SprintRecord } from '@/types';
import type { SprintTypeAPackage } from '@/types/sprint-types-a';
import { CheckList } from './Blocks';

/** Price as printed on the mockup when viewing in ZAR, otherwise converted to the visitor's currency. */
export function usePackagePrice() {
    const { context } = usePage<SharedProps>().props;
    return (pkg: SprintTypeAPackage) => {
        if (context.currency === 'ZAR' && pkg.price_label) return pkg.price_label;
        const amount = formatMoney(pkg.zar, context.currency);
        return pkg.price_prefix ? `${pkg.price_prefix} ${amount}` : amount;
    };
}

export function defaultPackageKey(packages: SprintTypeAPackage[]): string | undefined {
    return (packages.find((p) => p.popular) ?? packages[Math.min(1, packages.length - 1)])?.key;
}

const TRUST_ICONS: [RegExp, LucideIcon][] = [
    [/payment/i, Lock],
    [/scope/i, ShieldCheck],
    [/vendor/i, Receipt],
    [/vat/i, Receipt],
    [/partner/i, Users],
    [/human/i, UserCheck],
];

function trustIcon(label: string): LucideIcon {
    return TRUST_ICONS.find(([re]) => re.test(label))?.[1] ?? Scale;
}

export interface PurchaseCardProps {
    sprint: SprintRecord;
    packages: SprintTypeAPackage[];
    heading: string;
    layout?: 'list' | 'columns';
    /** Quote-route sprints send the CTA to /quote instead of /order. */
    quote?: boolean;
    primaryLabel: string;
    secondaryLabel?: string | null;
    note?: string | null;
    trust?: string[];
    scopeLink?: string | null;
    preview?: { title: string; items: string[] };
}

/** Dark "Choose Your … Package" card with radio selection, CTA and secondary action. */
export default function PurchaseCard({
    sprint,
    packages,
    heading,
    layout = 'list',
    quote = false,
    primaryLabel,
    secondaryLabel,
    note,
    trust = [],
    scopeLink,
    preview,
}: PurchaseCardProps) {
    const [selected, setSelected] = useState<string | undefined>(() => defaultPackageKey(packages));
    const [modal, setModal] = useState<'compare' | 'preview' | null>(null);
    const priceOf = usePackagePrice();

    const base = `/sprints/${sprint.slug}`;
    const quoteHref = `${base}/quote${selected ? `?package=${selected}` : ''}`;
    const primaryHref = quote || !packages.length ? quoteHref : `${base}/order?package=${selected}`;

    const secondary = secondaryLabel ?? null;
    const secondaryKind = !secondary
        ? null
        : /compare/i.test(secondary)
          ? 'compare'
          : /preview/i.test(secondary)
            ? 'preview'
            : /ask/i.test(secondary)
              ? 'ask'
              : 'call';
    const SecondaryIcon = secondaryKind === 'compare' ? Scale : secondaryKind === 'preview' ? Eye : secondaryKind === 'ask' ? CircleHelp : CalendarDays;
    const secondaryClass =
        'flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-gold-500/70 text-sm font-medium text-parchment-100 transition-colors hover:bg-gold-500/10 focus-visible:outline-2 focus-visible:outline-gold-400';

    return (
        <aside aria-label={heading} className="@container rounded-[10px] border border-ink-700 bg-ink-900 p-4 text-parchment-100 shadow-2xl sm:p-5">
            <h2 className={cn('mb-3 text-[1.0625rem] font-semibold', layout === 'columns' && 'text-center')}>{heading}</h2>

            {packages.length === 0 ? (
                <p className="rounded-[6px] border border-ink-700 p-4 text-sm text-ink-300">Pricing is confirmed on a quote after scoping.</p>
            ) : (
                <fieldset>
                    <legend className="sr-only">Package</legend>
                    <div className={cn(layout === 'columns' ? 'grid gap-2 @[360px]:grid-cols-3' : 'space-y-2.5')}>
                        {packages.map((pkg) => {
                            const active = pkg.key === selected;
                            const ribbon = pkg.badge && !/selected/i.test(pkg.badge) ? pkg.badge : active && pkg.badge ? pkg.badge : null;
                            return (
                                <label
                                    key={pkg.key}
                                    className={cn(
                                        'relative block cursor-pointer rounded-[8px] border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-gold-400',
                                        active ? 'border-gold-500 bg-gold-500/10' : 'border-ink-700 hover:border-ink-500',
                                        layout === 'columns' && 'flex min-w-0 flex-col p-2.5 text-center [overflow-wrap:anywhere] hyphens-auto',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name={`package-${sprint.code}`}
                                        value={pkg.key}
                                        checked={active}
                                        onChange={() => setSelected(pkg.key)}
                                        className="sr-only"
                                    />
                                    {ribbon && (
                                        <span className="absolute -top-2.5 right-3 rounded-[3px] bg-gold-500 px-1.5 py-0.5 text-[0.625rem] font-bold text-ink-900">
                                            {ribbon}
                                        </span>
                                    )}
                                    {layout === 'columns' ? (
                                        <>
                                            <span className={cn('text-[0.9375rem] font-semibold', active ? 'text-gold-400' : 'text-parchment-100')}>{pkg.name}</span>
                                            <span className={cn('text-xl font-bold', active ? 'text-gold-400' : 'text-parchment-50')}>{priceOf(pkg)}</span>
                                            {pkg.description && <span className="mt-2 text-[0.6875rem] leading-snug text-ink-200">{pkg.description}</span>}
                                            {(pkg.features ?? []).map((f) => (
                                                <span key={f} className="mt-2 text-[0.6875rem] leading-snug text-ink-300">
                                                    {f}
                                                </span>
                                            ))}
                                            <span
                                                aria-hidden="true"
                                                className={cn('mx-auto mt-3 flex size-4 items-center justify-center rounded-full border-2', active ? 'border-gold-500' : 'border-ink-400')}
                                            >
                                                {active && <span className="size-2 rounded-full bg-gold-500" />}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="flex items-start gap-3">
                                            <span
                                                aria-hidden="true"
                                                className={cn('mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-gold-500' : 'border-ink-400')}
                                            >
                                                {active && <span className="size-2 rounded-full bg-gold-500" />}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                                                    <span className="text-[0.9375rem] font-semibold">{pkg.name}</span>
                                                    <span className={cn('text-[1.0625rem] font-bold', active ? 'text-gold-400' : 'text-parchment-50')}>{priceOf(pkg)}</span>
                                                </span>
                                                {pkg.description && <span className="mt-1 block text-[0.75rem] leading-snug text-ink-200">{pkg.description}</span>}
                                                {pkg.delivery && (
                                                    <span className={cn('mt-1 block text-right text-[0.6875rem]', active ? 'text-gold-400' : 'text-ink-300')}>{pkg.delivery}</span>
                                                )}
                                            </span>
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
            )}

            <div className="mt-4 space-y-2.5">
                <Link
                    href={primaryHref}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-500 text-[0.9375rem] font-semibold text-ink-900 transition-colors hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
                >
                    {primaryLabel}
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>

                {secondary &&
                    (secondaryKind === 'call' ? (
                        <Link href={`${base}/quote?intent=discovery-call${selected ? `&package=${selected}` : ''}`} className={secondaryClass}>
                            <SecondaryIcon className="size-4" aria-hidden="true" />
                            {secondary}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className={secondaryClass}
                            onClick={() =>
                                secondaryKind === 'ask' ? openAskQuestion({ subject: sprint.title, section: 'sprints' }) : setModal(secondaryKind as 'compare' | 'preview')
                            }
                        >
                            <SecondaryIcon className="size-4" aria-hidden="true" />
                            {secondary}
                        </button>
                    ))}
            </div>

            {note && <p className="mt-3 text-center text-[0.75rem] text-ink-300">{note}</p>}

            {trust.length > 0 && (
                <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-3">
                    {trust.map((t) => {
                        const Icon = trustIcon(t);
                        return (
                            <li key={t} className="flex items-center gap-1.5 text-[0.6875rem] leading-tight text-ink-200">
                                <Icon className="size-5 shrink-0 text-parchment-100" strokeWidth={1.5} aria-hidden="true" />
                                {t}
                            </li>
                        );
                    })}
                </ul>
            )}

            {scopeLink && (
                <p className="mt-4 text-center text-[0.8125rem] text-ink-200">
                    {scopeLink.replace(/Request Scope Review\s*$/i, '')}
                    <Link href={`${base}/quote?intent=scope-review`} className="text-gold-400 underline underline-offset-2 hover:text-gold-300">
                        Request Scope Review
                    </Link>
                </p>
            )}

            <Modal open={modal === 'compare'} onClose={() => setModal(null)} title="Compare packages" size="xl">
                <div className="grid gap-3 sm:grid-cols-3">
                    {packages.map((pkg) => (
                        <div key={pkg.key} className={cn('rounded-[8px] border p-4', pkg.key === selected ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                            <p className="font-semibold text-ink-900">{pkg.name}</p>
                            <p className="text-xl font-bold text-gold-700">{priceOf(pkg)}</p>
                            {pkg.delivery && <p className="text-xs text-ink-500">{pkg.delivery}</p>}
                            {pkg.description && <p className="mt-2 text-[0.8125rem] text-ink-700">{pkg.description}</p>}
                            {(pkg.features?.length ?? 0) > 0 && <CheckList className="mt-2" items={pkg.features ?? []} />}
                            <button
                                type="button"
                                onClick={() => {
                                    setSelected(pkg.key);
                                    setModal(null);
                                }}
                                className="mt-3 w-full rounded-[4px] border border-ink-300 py-2 text-[0.8125rem] font-medium hover:border-ink-900"
                            >
                                {pkg.key === selected ? 'Selected' : `Choose ${pkg.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal open={modal === 'preview'} onClose={() => setModal(null)} title={preview?.title ?? secondary ?? 'Preview'} size="lg">
                <CheckList items={preview?.items ?? []} columns={2} />
            </Modal>
        </aside>
    );
}
