import type { ReactNode } from 'react';
import { Check, Info } from 'lucide-react';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';

/* ==========================================================================
   Small building blocks shared by the CorePages screens.
   ========================================================================== */

/** Horizontal journey stepper with optional per-step caption (Completed / Current Step / Upcoming). */
export function JourneySteps({
    steps,
    current,
    tone = 'light',
    captions = false,
    className,
}: {
    steps: string[];
    current: number;
    tone?: 'light' | 'dark';
    captions?: boolean;
    className?: string;
}) {
    const dark = tone === 'dark';

    return (
        <ol className={cn('flex w-full items-start overflow-x-auto pb-1', className)} aria-label="Progress">
            {steps.map((label, i) => {
                const n = i + 1;
                const done = n < current;
                const active = n === current;
                return (
                    <li key={label} className="relative flex min-w-[4.5rem] flex-1 flex-col items-center text-center">
                        {i > 0 && (
                            <span
                                aria-hidden="true"
                                className={cn('absolute top-4 right-1/2 h-0.5 w-full', done || active ? 'bg-gold-500' : dark ? 'bg-ink-700' : 'bg-parchment-400')}
                            />
                        )}
                        <span
                            aria-current={active ? 'step' : undefined}
                            className={cn(
                                'relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                                done && 'border-gold-500 bg-gold-500 text-ink-900',
                                active && 'border-gold-500 bg-gold-500/15 text-gold-600 ring-4 ring-gold-500/20',
                                !done && !active && (dark ? 'border-ink-600 bg-ink-900 text-ink-300' : 'border-parchment-500 bg-white text-ink-400'),
                            )}
                        >
                            {done ? <Check className="size-4" aria-hidden="true" /> : n}
                        </span>
                        <span className={cn('mt-1.5 px-1 text-[0.6875rem] leading-tight font-semibold', active ? (dark ? 'text-gold-300' : 'text-ink-900') : dark ? 'text-ink-200' : 'text-ink-500')}>
                            {label}
                        </span>
                        {captions && (
                            <span className={cn('text-[0.625rem]', done || active ? 'text-gold-500' : dark ? 'text-ink-400' : 'text-ink-400')}>
                                {done ? 'Completed' : active ? 'Current Step' : n === current + 1 ? 'Next' : 'Upcoming'}
                            </span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

/** Circular percentage ring. */
export function ProgressRing({
    value,
    size = 112,
    stroke = 10,
    label,
    sub,
    tone = 'gold',
    track = 'light',
}: {
    value: number;
    size?: number;
    stroke?: number;
    label?: ReactNode;
    sub?: ReactNode;
    tone?: 'gold' | 'good' | 'bad';
    track?: 'light' | 'dark';
}) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, value));
    const color = { gold: 'var(--color-gold-500)', good: 'var(--color-verified-500)', bad: 'var(--color-risk-500)' }[tone];

    return (
        <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke={track === 'dark' ? 'var(--color-ink-700)' : 'var(--color-parchment-300)'} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl leading-none font-bold">{label ?? `${Math.round(pct)}%`}</span>
                {sub && <span className="mt-1 text-[0.6875rem] opacity-80">{sub}</span>}
            </span>
        </div>
    );
}

/** Tinted note row with an icon. */
export function Note({ children, tone = 'gold', icon = 'info', className }: { children: ReactNode; tone?: 'gold' | 'info' | 'good' | 'bad' | 'dark'; icon?: string; className?: string }) {
    const tones = {
        gold: 'border-gold-300 bg-gold-50 text-ink-700',
        info: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
        good: 'border-verified-500/30 bg-verified-50 text-verified-700',
        bad: 'border-risk-500/30 bg-risk-50 text-risk-700',
        dark: 'border-gold-700/50 bg-ink-900 text-parchment-200',
    };

    return (
        <div className={cn('flex items-start gap-2.5 rounded-[6px] border px-3.5 py-2.5 text-[0.8125rem] leading-relaxed', tones[tone], className)}>
            {icon === 'info' ? <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <Icon name={icon} className="mt-0.5 size-4 shrink-0" />}
            <div className="min-w-0">{children}</div>
        </div>
    );
}

/** Dark card used for sidebars ("What You Will Receive", "Your Service Finder" ...). */
export function DarkCard({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[10px] border border-gold-700/40 bg-ink-950 p-5 text-parchment-200', className)}>
            {title && <h2 className="mb-4 font-serif text-[1.1875rem] font-semibold text-gold-400">{title}</h2>}
            {children}
        </section>
    );
}

/** Label / value rows. */
export function KeyValues({ rows, tone = 'light', className }: { rows: [ReactNode, ReactNode][]; tone?: 'light' | 'dark'; className?: string }) {
    return (
        <dl className={cn('divide-y text-[0.8125rem]', tone === 'dark' ? 'divide-ink-800' : 'divide-parchment-300', className)}>
            {rows.map(([k, v], i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2">
                    <dt className={tone === 'dark' ? 'text-ink-300' : 'text-ink-500'}>{k}</dt>
                    <dd className={cn('text-right font-medium', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>{v}</dd>
                </div>
            ))}
        </dl>
    );
}

/** Numbered list with gold bullets. */
export function NumberedList({ items, tone = 'light', className }: { items: ReactNode[]; tone?: 'light' | 'dark'; className?: string }) {
    return (
        <ol className={cn('space-y-2', className)}>
            {items.map((item, i) => (
                <li key={i} className={cn('flex gap-2.5 text-[0.8125rem] leading-snug', tone === 'dark' ? 'text-parchment-200' : 'text-ink-700')}>
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[0.6875rem] font-bold text-ink-900">{i + 1}</span>
                    <span className="pt-0.5">{item}</span>
                </li>
            ))}
        </ol>
    );
}

/** Ticked list. */
export function CheckList({ items, tone = 'light', className, cols = 1 }: { items: ReactNode[]; tone?: 'light' | 'dark'; className?: string; cols?: 1 | 2 }) {
    return (
        <ul className={cn('grid gap-2', cols === 2 && 'sm:grid-cols-2', className)}>
            {items.map((item, i) => (
                <li key={i} className={cn('flex gap-2 text-[0.8125rem] leading-snug', tone === 'dark' ? 'text-parchment-200' : 'text-ink-700')}>
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-verified-500 text-verified-500">
                        <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                </li>
            ))}
        </ul>
    );
}

/** Two- or three-way segmented toggle (English | Afrikaans, ZAR | USD). */
export function Segmented({
    options,
    value,
    onChange,
    label,
    className,
}: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
    label: string;
    className?: string;
}) {
    return (
        <div role="radiogroup" aria-label={label} className={cn('inline-flex w-full rounded-[4px] border border-parchment-500 bg-white p-0.5', className)}>
            {options.map((o) => (
                <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={value === o}
                    onClick={() => onChange(o)}
                    className={cn('h-9 flex-1 rounded-[3px] px-3 text-[0.8125rem] font-medium transition-colors', value === o ? 'border border-gold-500 bg-gold-50 text-ink-900' : 'text-ink-500 hover:text-ink-900')}
                >
                    {o}
                </button>
            ))}
        </div>
    );
}

/** Multi-select chips. */
export function ChipGroup({ options, value, onChange, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
    return (
        <div role="group" aria-label={label} className="flex flex-wrap gap-2">
            {options.map((o) => {
                const on = value.includes(o);
                return (
                    <button
                        key={o}
                        type="button"
                        aria-pressed={on}
                        onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors',
                            on ? 'border-gold-500 bg-gold-100 text-ink-900' : 'border-parchment-500 bg-white text-ink-600 hover:border-gold-300',
                        )}
                    >
                        <span className={cn('flex size-3.5 items-center justify-center rounded-[2px] border', on ? 'border-gold-600 bg-gold-500 text-ink-900' : 'border-ink-300')}>
                            {on && <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />}
                        </span>
                        {o}
                    </button>
                );
            })}
        </div>
    );
}

/** Large selectable card with an icon (single or multi select). */
export function OptionCard({
    selected,
    onSelect,
    title,
    body,
    icon,
    multi = false,
    className,
}: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    body?: string;
    icon?: string;
    multi?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={selected}
            onClick={onSelect}
            className={cn(
                'relative flex h-full w-full items-start gap-3 rounded-[8px] border p-3.5 text-left transition-colors',
                selected ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 bg-white hover:border-gold-300',
                className,
            )}
        >
            {icon && (
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] bg-ink-900 text-gold-400">
                    <Icon name={icon} className="size-5" />
                </span>
            )}
            <span className="min-w-0 flex-1 pr-5">
                <span className="block text-[0.8125rem] leading-snug font-semibold text-ink-900">{title}</span>
                {body && <span className="mt-1 block text-[0.75rem] leading-snug text-ink-500">{body}</span>}
            </span>
            <span
                aria-hidden="true"
                className={cn(
                    'absolute top-3 right-3 flex size-4 items-center justify-center border',
                    multi ? 'rounded-[3px]' : 'rounded-full',
                    selected ? 'border-gold-600 bg-gold-500 text-ink-900' : 'border-ink-300 bg-white',
                )}
            >
                {selected && (multi ? <Check className="size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-ink-900" />)}
            </span>
        </button>
    );
}

/** Thin strip of trust features (icon, title, caption). */
export function TrustStrip({ items, tone = 'dark', className }: { items: { icon: string; title: string; body?: string }[]; tone?: 'dark' | 'light'; className?: string }) {
    return (
        <ul
            className={cn(
                'grid gap-4 rounded-[8px] border p-4 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none',
                tone === 'dark' ? 'border-gold-700/40 bg-ink-950 text-parchment-200' : 'border-parchment-400 bg-white text-ink-700',
                className,
            )}
        >
            {items.map((it) => (
                <li key={it.title} className="flex items-start gap-3">
                    <Icon name={it.icon} className="mt-0.5 size-6 shrink-0 text-gold-500" />
                    <span>
                        <span className={cn('block text-[0.8125rem] font-semibold', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>{it.title}</span>
                        {it.body && <span className={cn('block text-[0.75rem]', tone === 'dark' ? 'text-ink-300' : 'text-ink-500')}>{it.body}</span>}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/** Emoji flag from an ISO-3166 alpha-2 code (no external images). */
export function Flag({ iso, className }: { iso: string; className?: string }) {
    const code = iso.toUpperCase();
    const flag = /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : '';
    return (
        <span className={cn('inline-block leading-none', className)} role="img" aria-label={`${code} flag`}>
            {flag}
        </span>
    );
}

/** Initials avatar for people (no photos). */
export function Avatar({ initials, size = 'md', className }: { initials: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const s = { sm: 'size-8 text-[0.6875rem]', md: 'size-11 text-sm', lg: 'size-14 text-base' }[size];
    return (
        <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-700 font-bold text-ink-950 ring-2 ring-white', s, className)}>
            {initials}
        </span>
    );
}

/** SVG line/area chart for calculator previews. */
export function LineChart({ points, height = 160, tone = 'gold', className, label }: { points: { label: string; value: number }[]; height?: number; tone?: 'gold' | 'info'; className?: string; label: string }) {
    if (points.length < 2) return null;
    const w = 320;
    const pad = 8;
    const values = points.map((p) => p.value);
    const min = Math.min(0, ...values);
    const max = Math.max(...values, 1);
    const x = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
    const stroke = tone === 'gold' ? 'var(--color-gold-500)' : 'var(--color-controlled-500)';

    return (
        <figure className={className}>
            <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full" role="img" aria-label={label}>
                <line x1={pad} x2={w - pad} y1={y(0)} y2={y(0)} stroke="var(--color-parchment-400)" strokeDasharray="3 3" />
                <path d={`${line} L${x(points.length - 1)},${y(min)} L${x(0)},${y(min)} Z`} fill={stroke} opacity={0.12} />
                <path d={line} fill="none" stroke={stroke} strokeWidth={2.25} strokeLinejoin="round" />
            </svg>
            <figcaption className="mt-1 flex justify-between text-[0.625rem] text-ink-400">
                <span>{points[0].label}</span>
                <span>{label}</span>
                <span>{points[points.length - 1].label}</span>
            </figcaption>
        </figure>
    );
}

/** Donut chart from segments. */
export function Donut({ segments, size = 140, center, sub }: { segments: { value: number; color: string; label: string }[]; size?: number; center?: ReactNode; sub?: ReactNode }) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = size / 2 - 12;
    const c = 2 * Math.PI * r;
    let offset = 0;

    return (
        <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-parchment-300)" strokeWidth={18} />
                {segments.map((s) => {
                    const len = (s.value / total) * c;
                    const el = <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={18} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
                    offset += len;
                    return el;
                })}
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold">{center}</span>
                {sub && <span className="text-[0.6875rem] opacity-70">{sub}</span>}
            </span>
        </div>
    );
}

/** Horizontal bar with a label and value. */
export function BarRow({ label, value, max = 100, suffix = '', color = 'bg-gold-500', tone = 'light' }: { label: ReactNode; value: number; max?: number; suffix?: string; color?: string; tone?: 'light' | 'dark' }) {
    return (
        <div className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 text-[0.75rem]">
            <span className={cn('truncate', tone === 'dark' ? 'text-ink-200' : 'text-ink-600')}>{label}</span>
            <span className={cn('h-2 overflow-hidden rounded-full', tone === 'dark' ? 'bg-ink-800' : 'bg-parchment-300')}>
                <span className={cn('block h-full rounded-full', color)} style={{ width: `${Math.max(2, Math.min(100, (value / (max || 1)) * 100))}%` }} />
            </span>
            <span className={cn('font-semibold tabular-nums', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>
                {value.toLocaleString()}
                {suffix}
            </span>
        </div>
    );
}

export const STATUS_DOT: Record<string, string> = {
    Activated: 'bg-verified-500',
    Shell: 'bg-ink-300',
    Degraded: 'bg-attested-500',
    Suspended: 'bg-risk-500',
    Restricted: 'bg-risk-700',
};
