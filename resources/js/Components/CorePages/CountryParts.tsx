import type { ReactNode } from 'react';
import { CircleCheck, Clock, FileSearch, ShieldCheck, TriangleAlert, UserCheck } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';

/** Dark frame with a white working panel, as used by the country evidence screens. */
export function CountryFrame({ crumbs, title, badge, lead, actions, aside, children, footer = true }: { crumbs: Crumb[]; title: string; badge?: ReactNode; lead?: string; actions?: ReactNode; aside?: ReactNode; children: ReactNode; footer?: boolean }) {
    return (
        <div className="bg-ink-950 py-4">
            <div className="container-tbca">
                <div className="grid gap-4 rounded-[12px] bg-white p-4 md:p-6 xl:grid-cols-12">
                    <div className={aside ? 'xl:col-span-9' : 'xl:col-span-12'}>
                        <Breadcrumbs items={crumbs} />
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="flex flex-wrap items-center gap-3 text-[1.75rem] font-bold tracking-tight text-ink-900 md:text-[2rem]">{title}{badge}</h1>
                                {lead && <p className="mt-1 max-w-3xl text-[0.875rem] text-ink-600">{lead}</p>}
                            </div>
                            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                        </div>
                        <div className="mt-5">{children}</div>
                    </div>
                    {aside && <aside className="space-y-4 xl:col-span-3 xl:border-l xl:border-parchment-300 xl:pl-4">{aside}</aside>}
                </div>
                {footer && (
                    <p className="mt-3 flex flex-wrap justify-between gap-2 text-[0.75rem] text-ink-300">
                        <span>Last updated: 15 Aug 2026 10:30 SAST</span>
                        <span>All times shown in SAST (UTC+2)</span>
                        <span>Information only. Not legal or tax advice.</span>
                    </p>
                )}
            </div>
        </div>
    );
}

export function SideBox({ title, children, tone = 'light' }: { title?: ReactNode; children: ReactNode; tone?: 'light' | 'warn' | 'good' }) {
    return (
        <section className={cn('rounded-[8px] border p-4', tone === 'warn' ? 'border-attested-500/40 bg-attested-50' : tone === 'good' ? 'border-verified-500/30 bg-verified-50' : 'border-parchment-400 bg-white')}>
            {title && <h2 className="mb-2 text-[0.9375rem] font-bold text-ink-900">{title}</h2>}
            {children}
        </section>
    );
}

export function Kpi({ label, value, sub, icon, tone }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; tone?: 'good' | 'warn' }) {
    return (
        <div className="flex gap-3 rounded-[8px] border border-parchment-400 p-3">
            {icon && <span className={cn('mt-0.5 shrink-0', tone === 'good' ? 'text-verified-500' : tone === 'warn' ? 'text-attested-500' : 'text-gold-600')}>{icon}</span>}
            <div>
                <p className="text-[0.6875rem] text-ink-500">{label}</p>
                <p className={cn('text-[1rem] font-bold', tone === 'good' ? 'text-verified-700' : 'text-ink-900')}>{value}</p>
                {sub && <p className="text-[0.6875rem] text-ink-500">{sub}</p>}
            </div>
        </div>
    );
}

export function NoPrice() {
    return (
        <SideBox tone="warn">
            <p className="flex gap-2 text-[0.8125rem] font-semibold text-attested-700"><TriangleAlert className="size-5 shrink-0" aria-hidden="true" />Country search does not imply commercial permission.</p>
            <p className="mt-1 text-center text-[0.8125rem] font-bold text-ink-900">No Resolution, No Price.</p>
        </SideBox>
    );
}

export function EvidenceStrip({ extra }: { extra?: { title: string; body: string } }) {
    const items = [
        [UserCheck, 'Human-Reviewed', 'All insights verified by subject matter experts.'],
        [FileSearch, 'Evidence First', 'Decisions driven by verified evidence, not assumptions.'],
        [ShieldCheck, 'Secure & Compliant', 'POPIA & ISO 27001 aligned. Enterprise-grade security.'],
        [Clock, 'Always Current', 'Real-time updates and continuous monitoring.'],
    ] as const;
    return (
        <ul className="mt-5 grid gap-3 rounded-[8px] bg-parchment-200 p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-flow-col xl:auto-cols-fr xl:grid-cols-none">
            {items.map(([I, t, b]) => <li key={t} className="flex gap-2.5"><I className="size-6 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-[0.8125rem] text-ink-900">{t}</strong><span className="text-[0.6875rem] text-ink-600">{b}</span></span></li>)}
            {extra && <li className="flex gap-2.5"><CircleCheck className="size-6 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-[0.8125rem] text-ink-900">{extra.title}</strong><span className="text-[0.6875rem] text-ink-600">{extra.body}</span></span></li>}
        </ul>
    );
}

export function StatePill({ state }: { state: string }) {
    const tone = state === 'Activated' || state === 'Current' || state === 'Complete' || state === 'Active' ? 'border-verified-500/40 bg-verified-50 text-verified-700' : state === 'Shell' || state === 'Partial' ? 'border-parchment-500 bg-parchment-200 text-ink-600' : 'border-attested-500/40 bg-attested-50 text-attested-700';
    return <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold', tone)}>{state}</span>;
}
