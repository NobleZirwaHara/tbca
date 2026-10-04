import type { ReactNode } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    AlarmClock,
    ArrowLeftRight,
    BarChart3,
    Briefcase,
    CalendarClock,
    CircleGauge,
    FileText,
    Gauge,
    ListChecks,
    MessageSquareWarning,
    Repeat,
    RotateCcw,
    Scale,
    XCircle,
} from 'lucide-react';
import type { ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { ProductsAdminLayout, ProductsWorkspaceLayout } from '@/Components/Products/Layouts';
import { Notice } from '@/Components/Products/Shared';
import { StatusPill } from '@/Components/ui/Kit';
import type { RetContext } from './types';
import { fmtDateTime } from './ui';

/** Record-level navigation for one Retainer (mirrors the mockups' left menu). */
export function retainerNav(ctx: RetContext): ConsoleNavGroup {
    const base = `/retainers/account/${ctx.retainer.code}`;
    return {
        title: `${ctx.retainer.code}`,
        items: [
            { label: 'Live Allowance Meter', href: base, icon: Gauge },
            { label: 'Itemised Usage Ledger', href: `${base}/ledger`, icon: ListChecks, badge: ctx.badges.disputes || undefined },
            { label: 'Allowance Sizing Tool', href: `${base}/sizing`, icon: CircleGauge },
            { label: 'Utilisation Review', href: `${base}/utilisation`, icon: BarChart3, badge: ctx.badges.alert ? '!' : undefined },
            { label: 'Scope Change', href: `${base}/scope-change`, icon: Scale },
            { label: 'Overage Authorisation', href: `${base}/overage`, icon: AlarmClock, badge: ctx.badges.overage || undefined },
            { label: 'Substitution Notice', href: `${base}/substitution`, icon: ArrowLeftRight, badge: ctx.badges.substitution || undefined },
            { label: 'Period Statement', href: `${base}/statement`, icon: FileText },
            { label: 'Renewal & Resize', href: `${base}/renew`, icon: Repeat },
            { label: 'Cancellation', href: `${base}/cancel`, icon: XCircle },
        ],
    };
}

/** Workspace shell: products workspace layout + retainer identity strip + data currency line. */
export function AccountShell({ ctx, title, description, actions, children, crumb }: { ctx: RetContext; title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; crumb?: { label: string; href?: string } }) {
    const r = ctx.retainer;
    return (
        <ProductsWorkspaceLayout
            title={title}
            description={description}
            actions={actions}
            context={retainerNav(ctx)}
            crumbs={[
                { label: 'Retainers', href: '/retainers/account' },
                { label: r.name, href: `/retainers/account/${r.code}` },
                ...(crumb ? [crumb] : []),
                { label: title },
            ]}
        >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                        <Briefcase className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-ink-900">{r.name}</p>
                        <p className="text-xs text-ink-500">
                            {r.client_name} · Ref: {r.code}
                        </p>
                    </div>
                    <StatusPill status={r.status} />
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-500">
                    <CalendarClock className="size-3.5" aria-hidden="true" />
                    Data as at: {fmtDateTime(new Date().toISOString())} SAST
                    <button type="button" onClick={() => router.reload()} className="ml-2 inline-flex items-center gap-1 font-semibold text-controlled-700 hover:underline">
                        <RotateCcw className="size-3" aria-hidden="true" /> Refresh
                    </button>
                </p>
            </div>

            {r.status === 'pending_activation' && (
                <Notice tone="warn" title="Awaiting first payment" className="mb-5">
                    Your agreement is signed. The allowance opens as soon as the first-period payment is confirmed
                    {ctx.order && (
                        <>
                            {' '}
                            (order {ctx.order.reference}, <span className="font-semibold">{ctx.order.status.replace(/_/g, ' ')}</span>).{' '}
                            {ctx.order.status !== 'paid' && (
                                <Link href={`/checkout/${ctx.order.reference}`} className="font-semibold text-gold-700 underline">
                                    Complete payment
                                </Link>
                            )}
                        </>
                    )}
                </Notice>
            )}
            {r.status === 'cancelling' && (
                <Notice tone="warn" title="Cancellation scheduled" className="mb-5">
                    This Retainer ends on {r.cancel_effective}. You keep access to your adviser and remaining allowance until then.
                </Notice>
            )}

            {children}
        </ProductsWorkspaceLayout>
    );
}

/** Admin shell with an optional retainer selector (for record-level consoles 21-23). */
export function AdminShell({ title, description, actions, children, selector }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; selector?: { value: string; options: { value: string; label: string }[]; path: string } }) {
    return (
        <ProductsAdminLayout family="retainers" title={title} description={description} actions={actions} badge={<span className="rounded-full bg-referenced-50 px-2 py-0.5 text-[0.6875rem] font-bold text-referenced-700">BETA</span>}>
            {selector && (
                <div className="mb-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                    <label className="flex min-w-0 flex-1 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500">
                        Retainer
                        <select
                            value={selector.value}
                            onChange={(e) => router.get(selector.path, { retainer: e.target.value }, { preserveScroll: true })}
                            className="h-9 max-w-xl rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem] text-ink-800 focus:border-gold-500 focus:outline-none"
                        >
                            {selector.options.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <p className="text-xs text-ink-400">Admin view · every change is audit-tracked</p>
                </div>
            )}
            {children}
        </ProductsAdminLayout>
    );
}

export function MessageBadge({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-attested-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-attested-700">
            <MessageSquareWarning className="size-3" aria-hidden="true" />
            {children}
        </span>
    );
}
