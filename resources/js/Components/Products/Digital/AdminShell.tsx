import type { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { ProductsAdminLayout } from '@/Components/Products/Layouts';
import { cn } from '@/lib/cn';
import { ADMIN_TRUST, ErrorList, TrustBand } from './Ui';

/** Admin console frame for /admin/products/digital/... (Screens 18–29). */
export default function AdminShell({ title, description, actions, children }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
    return (
        <ProductsAdminLayout family="digital" title={title} description={description} actions={actions}>
            <ErrorList />
            <div className="space-y-5">
                {children}
                <TrustBand items={ADMIN_TRUST} />
            </div>
        </ProductsAdminLayout>
    );
}

/** Admin KPI tile with optional icon and coloured value. */
export function Kpi({ label, value, caption, tone = 'neutral', icon, dark }: { label: ReactNode; value: ReactNode; caption?: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'gold' | 'purple' | 'blue'; icon?: ReactNode; dark?: boolean }) {
    const tones = { neutral: 'text-ink-900', good: 'text-verified-600', warn: 'text-attested-600', bad: 'text-risk-600', gold: 'text-gold-700', purple: 'text-referenced-600', blue: 'text-controlled-600' };
    return (
        <div className={cn('flex items-start justify-between gap-2 rounded-[8px] border p-3.5', dark ? 'border-ink-800 bg-ink-950 text-parchment-100' : 'border-parchment-400 bg-white')}>
            <div className="min-w-0">
                <p className={cn('text-[0.6875rem] font-bold tracking-wide uppercase', dark ? 'text-gold-400' : 'text-ink-600')}>{label}</p>
                <p className={cn('mt-1 text-2xl font-bold', dark ? 'text-parchment-100' : tones[tone])}>{value}</p>
                {caption && <p className={cn('mt-0.5 text-[0.6875rem]', dark ? 'text-ink-300' : 'text-ink-500')}>{caption}</p>}
            </div>
            {icon && <span className="shrink-0 text-gold-600">{icon}</span>}
        </div>
    );
}

export function Btn({ children, onClick, tone = 'outline', disabled, type = 'button' }: { children: ReactNode; onClick?: () => void; tone?: 'gold' | 'outline' | 'danger'; disabled?: boolean; type?: 'button' | 'submit' }) {
    const tones = { gold: 'border-gold-600 bg-gold-500 text-ink-900 hover:bg-gold-400', outline: 'border-parchment-500 bg-white text-ink-800 hover:border-ink-900', danger: 'border-risk-500/50 bg-white text-risk-700 hover:bg-risk-50' };
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={cn('inline-flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-xs font-semibold whitespace-nowrap disabled:opacity-50', tones[tone])}>
            {children}
        </button>
    );
}

/** POST an admin action and keep scroll. */
export function act(url: string, data: Record<string, unknown> = {}, confirm?: string) {
    if (confirm && !window.confirm(confirm)) return;
    router.post(url, data as never, { preserveScroll: true });
}

/** Tab strip driven by a query param. */
export function QueryTabs({ tabs, value, onChange }: { tabs: { key: string; label: string; count?: number }[]; value: string; onChange: (k: string) => void }) {
    return (
        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-parchment-400">
            {tabs.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)} className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-xs font-semibold', value === t.key ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-900')}>
                    {t.label}
                    {t.count !== undefined && ` (${t.count.toLocaleString()})`}
                </button>
            ))}
        </div>
    );
}

export function SideCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-4', className)}>
            <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">{title}</h2>
            {children}
        </section>
    );
}
