import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import {
    Activity,
    BadgeCheck,
    CalendarDays,
    CreditCard,
    Database,
    Download,
    Gauge,
    Lock,
    PauseCircle,
    RefreshCw,
    Repeat,
    ScrollText,
    ShieldCheck,
    TrendingUp,
    UserCheck,
    Users,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import type { ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { cn } from '@/lib/cn';
import type { SubSubscription } from './types';

/* ==========================================================================
   Shared building blocks for the Subscriptions family pages.
   ========================================================================== */

export function zar(n: number | null | undefined, decimals = 0): string {
    if (n === null || n === undefined) return 'Custom';
    return `ZAR ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace(/ /g, ',').replace(/ /g, ',')}`;
}

export function rand(n: number | null | undefined): string {
    if (n === null || n === undefined) return 'Custom';
    return `R${Number(n).toLocaleString('en-ZA').replace(/ /g, ',').replace(/ /g, ',')}`;
}

export function fmtDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
    if (!d) return '—';
    return new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString('en-GB', opts);
}

export function shortDate(d: string | null | undefined): string {
    return fmtDate(d, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function periodLabel(sub: SubSubscription): string {
    if (!sub.current_period_start || !sub.current_period_end) return '—';
    return `${fmtDate(sub.current_period_start, { day: 'numeric', month: 'short' })} – ${fmtDate(sub.current_period_end)}`;
}

const classTones: Record<string, string> = {
    R1: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
    R2: 'border-verified-500/30 bg-verified-50 text-verified-700',
    R3: 'border-attested-500/30 bg-attested-50 text-attested-700',
    R4: 'border-referenced-500/30 bg-referenced-50 text-referenced-700',
    R5: 'border-risk-500/30 bg-risk-50 text-risk-700',
    R0: 'border-parchment-500 bg-parchment-200 text-ink-600',
};

export const CLASS_NAMES: Record<string, string> = {
    R1: 'Refreshed',
    R2: 'Live System',
    R3: 'Periodic Delivery',
    R4: 'Standing Readiness',
    R5: 'Accumulating',
    R0: 'Retired / Legacy',
};

/** Recurrence class chip, e.g. "R4 Standing Readiness". */
export function ClassChip({ code, label, compact, className }: { code: string; label?: string; compact?: boolean; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', classTones[code] ?? classTones.R0, className)}>
            <span className="font-bold">{code}</span>
            {!compact && <span>{label ?? CLASS_NAMES[code]}</span>}
        </span>
    );
}

const statusTones: Record<string, string> = {
    ACTIVE: 'border-verified-500/30 bg-verified-50 text-verified-700',
    SUCCESS: 'border-verified-500/30 bg-verified-50 text-verified-700',
    PAUSED: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
    PRICE_CHANGE_PENDING: 'border-attested-500/30 bg-attested-50 text-attested-700',
    DISUSE_FLAGGED: 'border-risk-500/30 bg-risk-50 text-risk-700',
    IN_GRACE: 'border-attested-500/30 bg-attested-50 text-attested-700',
    PAST_DUE: 'border-risk-500/30 bg-risk-50 text-risk-700',
    CANCELLED_PENDING: 'border-attested-500/30 bg-attested-50 text-attested-700',
    CANCELLED: 'border-parchment-500 bg-parchment-200 text-ink-600',
    REACTIVATABLE: 'border-parchment-500 bg-parchment-200 text-ink-600',
    PENDING_PAYMENT: 'border-attested-500/30 bg-attested-50 text-attested-700',
};

const statusLabels: Record<string, string> = {
    IN_GRACE: 'PAYMENT OVERDUE',
    PAST_DUE: 'PAST DUE',
    CANCELLED_PENDING: 'CANCELLING',
    REACTIVATABLE: 'CANCELLED / REACTIVATABLE',
    PENDING_PAYMENT: 'AWAITING PAYMENT',
};

/** Lifecycle state chip; always shows text, never colour alone. */
export function SubStatus({ status, raw, className }: { status: string; raw?: boolean; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[0.6875rem] font-bold tracking-wide whitespace-nowrap', statusTones[status] ?? statusTones.CANCELLED, className)}>
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {raw ? status : (statusLabels[status] ?? status.replace(/_/g, ' '))}
        </span>
    );
}

/** Record-level nav for one subscription (sidebar context group of the workspace layout). */
export function subscriptionNav(sub: SubSubscription): ConsoleNavGroup {
    const base = `/subscriptions/account/${sub.reference}`;
    const items: ConsoleNavGroup['items'] = [
        { label: 'Overview', href: base, icon: Gauge },
        { label: 'Engagement & Usage', href: `${base}/engagement`, icon: Activity },
        { label: 'Renewal Notice', href: `${base}/renewal`, icon: CalendarDays },
        { label: 'Change Plan', href: `${base}/change-plan`, icon: TrendingUp },
        { label: 'Pause', href: `${base}/pause`, icon: PauseCircle },
        { label: 'Export Data', href: `${base}/export`, icon: Download },
        { label: 'Cancel', href: `${base}/cancel`, icon: XCircle },
    ];
    if (sub.disuse_flagged) items.splice(2, 0, { label: 'Low-use Notice', href: `${base}/disuse`, icon: Activity, badge: '!' });
    if (sub.price_change?.state === 'pending') items.splice(3, 0, { label: 'Price Change', href: `${base}/price-change`, icon: ScrollText, badge: '!' });
    if (['IN_GRACE', 'PAST_DUE'].includes(sub.status)) items.splice(1, 0, { label: 'Billing Recovery', href: `${base}/billing-recovery`, icon: CreditCard, badge: '!' });
    if (sub.display_status === 'REACTIVATABLE') items.splice(1, 0, { label: 'Reactivate', href: `${base}/reactivate`, icon: RefreshCw });
    return { title: sub.plan.name, items };
}

/** Header block used on every subscription record page: icon tile, title, plan, chips, period box. */
export function RecordHeader({
    icon: Icon,
    title,
    sub,
    lead,
    aside,
    tone = 'purple',
}: {
    icon: LucideIcon;
    title: ReactNode;
    sub: SubSubscription;
    lead?: ReactNode;
    aside?: ReactNode;
    tone?: 'purple' | 'red' | 'green' | 'dark';
}) {
    const tile = { purple: 'bg-ink-900 text-referenced-500', red: 'bg-risk-500 text-white', green: 'bg-ink-900 text-verified-500', dark: 'bg-ink-900 text-gold-400' }[tone];
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-[8px] border border-parchment-400 bg-white p-5">
            <div className="flex min-w-0 items-start gap-4">
                <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-[8px]', tile)}>
                    <Icon className="size-7" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="font-serif text-xl font-bold text-ink-900 sm:text-2xl">{title}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink-800">{sub.plan.name}</span>
                        <ClassChip code={sub.plan.recurrence_class} label={sub.plan.class_name} />
                        <SubStatus status={sub.display_status} />
                    </div>
                    {lead && <p className="mt-1.5 text-[0.8125rem] text-ink-600">{lead}</p>}
                </div>
            </div>
            {aside ?? (
                <div className="flex items-center gap-2 rounded-[6px] border border-parchment-400 px-3 py-2 text-center">
                    <CalendarDays className="size-4 text-ink-500" aria-hidden="true" />
                    <div>
                        <p className="text-sm font-semibold text-ink-900">{periodLabel(sub)}</p>
                        <p className="text-[0.6875rem] text-ink-500">Billing period</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/** White card with a title used across the workspace pages. */
export function Card({ title, children, className, action }: { title?: ReactNode; children: ReactNode; className?: string; action?: ReactNode }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-5', className)}>
            {(title || action) && (
                <header className="mb-3 flex items-center justify-between gap-3">
                    {title && <h3 className="text-[0.9375rem] font-semibold text-ink-900">{title}</h3>}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
    return (
        <Link href={href} className={cn('inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-referenced-700 hover:underline', className)}>
            {children} <span aria-hidden="true">→</span>
        </Link>
    );
}

/** Icon-led KPI tile (console and workspace). */
export function StatTile({
    icon: Icon,
    label,
    value,
    caption,
    delta,
    tone = 'gold',
}: {
    icon: LucideIcon;
    label: ReactNode;
    value: ReactNode;
    caption?: ReactNode;
    delta?: number | null;
    tone?: 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'orange';
}) {
    const tones = {
        gold: 'bg-gold-50 text-gold-700',
        green: 'bg-verified-50 text-verified-700',
        red: 'bg-risk-50 text-risk-700',
        blue: 'bg-controlled-50 text-controlled-700',
        purple: 'bg-referenced-50 text-referenced-700',
        orange: 'bg-attested-50 text-attested-700',
    }[tone];
    return (
        <div className="flex items-start gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
            <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', tones)}>
                <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-ink-600">{label}</p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-ink-900">{value}</p>
                {caption && <p className="text-[0.6875rem] text-ink-500">{caption}</p>}
                {delta !== undefined && delta !== null && (
                    <p className={cn('text-[0.6875rem] font-semibold', delta >= 0 ? 'text-verified-700' : 'text-risk-700')}>
                        {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% <span className="font-normal text-ink-400">vs last period</span>
                    </p>
                )}
            </div>
        </div>
    );
}

export const PUBLIC_TRUST: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: UserCheck, title: 'Human-reviewed for accuracy', body: 'By TBCA professionals' },
    { icon: ShieldCheck, title: 'Secure payments', body: 'Bank-grade security' },
    { icon: CreditCard, title: 'Transparent pricing in ZAR', body: 'No hidden fees' },
    { icon: Database, title: 'Data protected', body: 'Your data. Your ownership.' },
    { icon: BadgeCheck, title: 'Trusted by businesses across Africa', body: 'Proven. Ethical. Independent.' },
];

export const CONTROL_TRUST: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: XCircle, title: 'No hidden cancellation', body: 'Cancel anytime in Portal' },
    { icon: CreditCard, title: 'Transparent pricing in ZAR', body: 'What you see is what you pay' },
    { icon: ScrollText, title: 'Clear entitlements', body: "What's included is stated upfront" },
    { icon: Users, title: 'You are in control', body: 'Change or cancel via your Portal' },
    { icon: BadgeCheck, title: 'Trusted by businesses across Africa', body: 'Proven. Ethical. Independent.' },
];

export const PLAN_ICON: Record<string, LucideIcon> = { R1: RefreshCw, R2: Activity, R3: CalendarDays, R4: ShieldCheck, R5: Database };

export { Lock, Repeat };
