import {
    BarChart3,
    Briefcase,
    CircleCheck,
    FileText,
    Gauge,
    Handshake,
    Share2,
    Mail,
    Megaphone,
    MessageSquare,
    Package,
    Shield,
    User,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import DataVisual from '@/Components/SprintTypes/B/DataVisual';
import { cn } from '@/lib/cn';
import type { SprintPackage } from '@/types';
import type { ToolkitItem, ToolkitPreview, ToolkitSection } from '@/types/sprint-types-b';

/* ==========================================================================
   Building blocks for the digital-toolkit sprint template.
   ========================================================================== */

const icons: Record<string, LucideIcon> = {
    handshake: Handshake,
    mail: Mail,
    megaphone: Megaphone,
    linkedin: Share2,
    briefcase: Briefcase,
    shield: Shield,
    gauge: Gauge,
    chat: MessageSquare,
    file: FileText,
    chart: BarChart3,
    user: User,
    package: Package,
};

export function ToolkitIcon({ name, className }: { name: string; className?: string }) {
    const Icon = icons[name] ?? Package;
    return <Icon className={className} aria-hidden="true" />;
}

/** Hero icon in a gold-outlined rounded square. */
export function ToolkitIconTile({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
    return (
        <span className={cn('flex shrink-0 items-center justify-center rounded-[14px] border-2 border-gold-500 bg-ink-900 text-gold-400 shadow-[0_0_24px_-8px_rgba(214,163,46,0.8)]', size === 'lg' ? 'size-24' : 'size-16')}>
            <ToolkitIcon name={name} className={size === 'lg' ? 'size-12' : 'size-8'} />
        </span>
    );
}

/** Laptop-style preview: dashboard when KPIs/charts exist, otherwise a tile grid of included assets. */
export function ToolkitPreviewScreen({ preview, light = false }: { preview: ToolkitPreview; light?: boolean }) {
    const hasData = preview.kpis.length > 0 || preview.charts.length > 0;
    return (
        <div className="mx-auto w-full max-w-xl">
            <div className="rounded-t-[12px] border-[6px] border-b-0 border-ink-700 bg-ink-800 p-1">
                {hasData ? (
                    <DataVisual spec={{ title: preview.title, subtitle: preview.subtitle, kpis: preview.kpis, charts: preview.charts }} compact />
                ) : (
                    <div className={cn('rounded-[6px] p-3', light ? 'bg-white text-ink-900' : 'bg-ink-950 text-parchment-100 motif-glow')}>
                        <p className="text-sm font-bold">{preview.title}</p>
                        {preview.subtitle && <p className="text-[0.625rem] text-ink-300">{preview.subtitle}</p>}
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {(preview.tiles.length ? preview.tiles : ['Templates', 'Checklists', 'Guides', 'Examples', 'Trackers', 'Support']).map((t) => (
                                <div key={t} className="flex items-center gap-2 rounded-[6px] border border-gold-700/50 bg-ink-900 p-2 text-[0.6875rem]">
                                    <FileText className="size-4 shrink-0 text-gold-400" aria-hidden="true" />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="mx-[-6%] h-3 rounded-b-[10px] bg-gradient-to-b from-ink-600 to-ink-800" aria-hidden="true" />
            {preview.note && <p className="mt-2 text-center text-[0.6875rem] text-gold-300">{preview.note}</p>}
        </div>
    );
}

/** CSS product box (replaces the 3D box renders in the mockups). */
export function ToolkitBoxArt({ art, icon }: { art: { brand?: string; title_lines?: string[]; subtitle?: string | null; tagline?: string | null }; icon: string }) {
    return (
        <div className="relative mx-auto w-44 [perspective:800px]" aria-hidden="true">
            <div className="relative rounded-[6px] border border-gold-600/60 bg-gradient-to-br from-ink-800 via-ink-950 to-ink-900 p-4 shadow-[12px_12px_30px_-10px_rgba(0,0,0,0.8)] [transform:rotateY(-14deg)]">
                <p className="text-xs font-bold tracking-widest text-gold-400">{art.brand ?? 'TBCA'}</p>
                <ToolkitIcon name={icon} className="mt-3 size-10 text-gold-400" />
                <div className="mt-3 space-y-0.5">
                    {(art.title_lines ?? []).map((l) => (
                        <p key={l} className="font-serif text-base leading-tight font-bold text-parchment-50">{l}</p>
                    ))}
                </div>
                {art.subtitle && <p className="mt-2 text-[0.625rem] font-semibold tracking-wide text-gold-300">{art.subtitle}</p>}
                <div className="mt-3 h-1 w-10 bg-gold-500" />
                {art.tagline && <p className="mt-2 text-[0.5625rem] tracking-wider text-parchment-300">{art.tagline}</p>}
            </div>
            <div className="absolute top-2 -right-3 bottom-2 w-3 skew-y-[30deg] rounded-r bg-gradient-to-b from-gold-700 to-ink-900" />
        </div>
    );
}

const asItem = (x: ToolkitItem | string | [string, string]): ToolkitItem =>
    typeof x === 'string' ? { title: x } : Array.isArray(x) ? { title: x[0], text: x[1] } : x;

/** Generic data-driven section block. */
export function ToolkitSectionBlock({ section, className }: { section: ToolkitSection; className?: string }) {
    const dark = section.tone === 'dark';
    const list = section.items.map(asItem);
    let body: ReactNode;
    switch (section.kind) {
        case 'chips':
            body = (
                <ul className="flex flex-wrap gap-2">
                    {list.map((i) => (
                        <li key={i.title} className={cn('rounded-full border px-3 py-1 text-xs', dark ? 'border-gold-600 text-gold-200' : 'border-parchment-500 bg-parchment-100 text-ink-800')}>{i.title}</li>
                    ))}
                </ul>
            );
            break;
        case 'checks':
            body = (
                <ul className="grid gap-1.5 text-[0.8125rem] sm:grid-cols-2">
                    {list.map((i) => (
                        <li key={i.title} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />{i.title}</li>
                    ))}
                </ul>
            );
            break;
        case 'stats':
            body = (
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {list.map((i) => (
                        <div key={i.title} className="text-center">
                            <dt className={cn('font-serif text-2xl font-bold', dark ? 'text-gold-400' : 'text-gold-700')}>{i.title}</dt>
                            <dd className={cn('text-xs', dark ? 'text-parchment-200' : 'text-ink-600')}>{i.text}</dd>
                        </div>
                    ))}
                </dl>
            );
            break;
        case 'steps':
            body = (
                <ol className="grid gap-3 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
                    {list.map((i, n) => (
                        <li key={i.title} className="flex flex-col items-center text-center">
                            <span className="flex size-9 items-center justify-center rounded-full border-2 border-gold-500 text-sm font-bold text-gold-600">{n + 1}</span>
                            <span className={cn('mt-1.5 text-xs font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>{i.title}</span>
                            {i.text && <span className={cn('text-[0.6875rem]', dark ? 'text-ink-300' : 'text-ink-500')}>{i.text}</span>}
                        </li>
                    ))}
                </ol>
            );
            break;
        case 'pairs':
            body = (
                <dl className="divide-y divide-parchment-300 text-[0.8125rem]">
                    {list.map((i) => (
                        <div key={i.title} className="flex justify-between gap-3 py-1.5"><dt className="text-ink-500">{i.title}</dt><dd className="text-right font-medium text-ink-900">{i.text}</dd></div>
                    ))}
                </dl>
            );
            break;
        case 'columns':
            body = (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {list.map((i) => (
                        <div key={i.title}>
                            <p className={cn('text-xs font-bold tracking-wide uppercase', dark ? 'text-gold-400' : 'text-gold-700')}>{i.title}</p>
                            <ul className={cn('mt-1.5 space-y-1 text-xs', dark ? 'text-parchment-200' : 'text-ink-700')}>
                                {(i.items ?? []).map((r) => <li key={r}>{r}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            );
            break;
        default:
            body = (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((i) => (
                        <li key={i.title} className={cn('rounded-[6px] border p-3', dark ? 'border-ink-700 bg-ink-950' : 'border-parchment-400 bg-parchment-50')}>
                            <p className={cn('text-[0.8125rem] font-semibold', dark ? 'text-gold-300' : 'text-ink-900')}>{i.title}</p>
                            {i.text && <p className={cn('mt-1 text-xs', dark ? 'text-parchment-200' : 'text-ink-600')}>{i.text}</p>}
                            {i.swatches && (
                                <span className="mt-2 flex gap-1">
                                    {i.swatches.map((c) => <span key={c} className="size-6 rounded border border-parchment-400" style={{ background: c }} title={c} />)}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            );
    }
    return (
        <section className={cn('rounded-[8px] border p-4 sm:p-5', dark ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white', className)}>
            <h2 className={cn('mb-3 text-[0.8125rem] font-bold tracking-wide uppercase', dark ? 'text-gold-400' : 'text-ink-900')}>{section.heading}</h2>
            {section.intro && <p className={cn('mb-3 text-xs', dark ? 'text-parchment-200' : 'text-ink-600')}>{section.intro}</p>}
            {body}
        </section>
    );
}

/** Package selector: stacked radio cards (dark or light). */
export function ToolkitPackages({
    packages,
    selected,
    onSelect,
    tone = 'dark',
    money,
    note,
}: {
    packages: (SprintPackage & { badge?: string | null; description?: string | null; note?: string | null })[];
    selected: string | null;
    onSelect: (key: string) => void;
    tone?: 'dark' | 'light';
    money: (zar: number) => string;
    note?: string | null;
}) {
    const dark = tone === 'dark';
    return (
        <fieldset className="space-y-2">
            <legend className="sr-only">Choose a package</legend>
            {packages.map((p) => {
                const active = selected === p.key;
                return (
                    <label
                        key={p.key}
                        className={cn(
                            'relative flex cursor-pointer gap-3 rounded-[8px] border p-3 transition-colors',
                            dark ? (active ? 'border-gold-500 bg-ink-800' : 'border-ink-700 hover:border-ink-500') : active ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 hover:border-gold-300',
                        )}
                    >
                        {p.badge && <span className="absolute -top-2 right-3 rounded-full bg-gold-500 px-2 text-[0.5625rem] font-bold tracking-wide text-ink-900 uppercase">{p.badge}</span>}
                        <input type="radio" name="toolkit-package" value={p.key} checked={active} onChange={() => onSelect(p.key)} className="mt-1 accent-gold-500" />
                        <span className="min-w-0 flex-1">
                            <span className={cn('flex items-baseline justify-between gap-2 text-sm font-semibold', dark ? 'text-parchment-50' : 'text-ink-900')}>
                                {p.name}
                                <span className={cn('text-base font-bold', dark ? 'text-gold-400' : 'text-gold-700')}>{money(p.zar)}</span>
                            </span>
                            {p.description && <span className={cn('mt-0.5 block text-xs', dark ? 'text-parchment-300' : 'text-ink-600')}>{p.description}</span>}
                            {!!p.features?.length && (
                                <span className={cn('mt-1 block space-y-0.5 text-[0.6875rem]', dark ? 'text-parchment-300' : 'text-ink-600')}>
                                    {p.features.map((f) => <span key={f} className="block">✓ {f}</span>)}
                                </span>
                            )}
                            {(p.note ?? note) && <span className={cn('mt-0.5 block text-[0.625rem]', dark ? 'text-ink-300' : 'text-ink-400')}>{p.note ?? note}</span>}
                        </span>
                    </label>
                );
            })}
        </fieldset>
    );
}
