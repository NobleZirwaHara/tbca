import {
    BarChart3,
    Box,
    CalendarSync,
    ClipboardCheck,
    FileCheck,
    FileText,
    Filter,
    FolderLock,
    Gavel,
    Globe,
    Leaf,
    Monitor,
    Network,
    ScanSearch,
    Search,
    ShieldCheck,
    Truck,
    UserSearch,
    Users,
    Workflow,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { SprintPackage } from '@/types';
import { GoldLink } from './common';

/* ==========================================================================
   Dark purchase card with side-by-side package cards (implementation packs,
   due diligence / trust) and a keyword-driven hero icon picker.
   ========================================================================== */

const iconRules: [RegExp, LucideIcon][] = [
    [/funnel|pipeline/i, Filter],
    [/calendar|refresh/i, CalendarSync],
    [/flowchart|workflow|process/i, Workflow],
    [/sop|checklist/i, ClipboardCheck],
    [/monitor|dashboard|chart|analytics/i, BarChart3],
    [/browser|contact card|profile/i, Monitor],
    [/box|cube/i, Box],
    [/folder/i, FolderLock],
    [/sanction|screen|magnif|search/i, ScanSearch],
    [/media|reputation|megaphone/i, Search],
    [/shareholder|ownership|people|person|user/i, UserSearch],
    [/supply|vendor|truck/i, Truck],
    [/cyber|lock|privacy|shield/i, ShieldCheck],
    [/esg|leaf|sustain/i, Leaf],
    [/gavel|legal/i, Gavel],
    [/globe|world/i, Globe],
    [/network/i, Network],
    [/team|users/i, Users],
    [/document|report|doc/i, FileText],
];

export function pickIcon(description: string | undefined, fallback: LucideIcon = FileCheck): LucideIcon {
    if (!description) return fallback;
    return iconRules.find(([re]) => re.test(description))?.[1] ?? fallback;
}

export function HeroIconTile({ description, className, boxed = true }: { description?: string; className?: string; boxed?: boolean }) {
    const Icon = pickIcon(description);
    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center justify-center text-gold-400',
                boxed && 'size-24 rounded-[10px] border border-gold-600/70 bg-ink-950 shadow-[0_0_30px_-10px_rgba(214,163,46,0.8)] sm:size-28',
                className,
            )}
            aria-hidden="true"
        >
            <Icon className={boxed ? 'size-14' : 'size-20'} strokeWidth={1.1} />
        </span>
    );
}

export function priceText(p: SprintPackage & { price_display?: string }, decimals = true) {
    if (p.price_display) return p.price_display.replace(/(\.\d{2})\d+/, '$1');
    if (p.zar === null || p.zar === undefined) return 'On request';
    return `R${p.zar.toLocaleString('en-US')}${decimals ? '.00' : ''}`;
}

export function DarkPackageCard({
    heading,
    packages,
    selected,
    onSelect,
    ctaLabel,
    ctaHref,
    radios = true,
    decimals = true,
    secondary,
    notes,
    footer,
    className,
}: {
    heading: string;
    packages: (SprintPackage & { price_display?: string })[];
    selected: string | null;
    onSelect: (key: string) => void;
    ctaLabel: string;
    ctaHref: string;
    radios?: boolean;
    decimals?: boolean;
    secondary?: ReactNode;
    notes?: ReactNode;
    footer?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('rounded-[12px] border border-ink-700 bg-ink-950 p-4 text-parchment-100 shadow-raised', className)}>
            <h2 className="text-center text-lg font-semibold">{heading}</h2>
            <fieldset className="mt-4">
                <legend className="sr-only">Package</legend>
                <div className="grid grid-cols-3 gap-2">
                    {packages.map((p) => {
                        const active = p.key === selected;
                        return (
                            <label
                                key={p.key}
                                className={cn(
                                    'relative flex cursor-pointer flex-col rounded-[8px] border p-2.5 pt-3.5 transition-colors',
                                    active ? 'border-gold-500 bg-ink-900' : 'border-ink-700 hover:border-ink-500',
                                )}
                            >
                                {p.popular && (
                                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-2 text-[0.5625rem] font-bold whitespace-nowrap text-ink-900">
                                        ✓ Recommended
                                    </span>
                                )}
                                <span className="text-center text-sm font-semibold">{p.name}</span>
                                <span className={cn('mt-0.5 text-center text-[0.8125rem] font-bold', active ? 'text-gold-400' : 'text-white')}>{priceText(p, decimals)}</span>
                                {p.delivery && <span className="text-center text-[0.625rem] text-ink-300">{p.delivery}</span>}
                                <ul className="mt-2 space-y-1 text-[0.625rem] leading-snug text-parchment-200">
                                    {(p.features ?? []).map((f) => (
                                        <li key={f}>{f}</li>
                                    ))}
                                </ul>
                                <input
                                    type="radio"
                                    name="package"
                                    value={p.key}
                                    checked={active}
                                    onChange={() => onSelect(p.key)}
                                    className={cn('mx-auto mt-auto size-4 accent-gold-500', !radios && 'sr-only')}
                                    aria-label={`${p.name} package`}
                                />
                            </label>
                        );
                    })}
                </div>
            </fieldset>
            <GoldLink href={ctaHref} className="mt-4">
                {ctaLabel}
            </GoldLink>
            {secondary && <div className="mt-2">{secondary}</div>}
            {notes && <div className="mt-3">{notes}</div>}
            {footer}
        </div>
    );
}
