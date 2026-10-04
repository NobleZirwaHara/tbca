import type { ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { ProductsAdminLayout } from '@/Components/Products/Layouts';
import { TrustRow } from '@/Components/Products/Shared';
import type { SharedProps } from '@/types';
import { cn } from '@/lib/cn';

/** Admin console frame for /admin/products/subscriptions/... (Blueprint screens 22–31). */
export function SubAdminShell({
    title,
    description,
    actions,
    strip,
    note,
    children,
}: {
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    strip?: { icon: LucideIcon; title: string; body?: string }[];
    note?: ReactNode;
    children: ReactNode;
}) {
    const { errors } = usePage<SharedProps & { errors: Record<string, string> }>().props;
    const list = Object.values(errors ?? {});

    return (
        <ProductsAdminLayout family="subscriptions" title={title} description={description} actions={actions}>
            {list.length > 0 && (
                <div role="alert" className="mb-4 rounded-[8px] border border-risk-500/30 bg-risk-50 p-3 text-[0.8125rem] text-risk-700">
                    {list.map((e) => (
                        <p key={e}>{e}</p>
                    ))}
                </div>
            )}
            <div className="space-y-5">
                {children}
                {strip && <TrustRow items={strip} />}
                {note && <div className="rounded-[8px] bg-ink-900 px-4 py-3 text-xs text-parchment-200">{note}</div>}
            </div>
        </ProductsAdminLayout>
    );
}

/** Small console button (POST via callback). */
export function ConsoleBtn({ children, onClick, tone = 'outline', disabled, type = 'button' }: { children: ReactNode; onClick?: () => void; tone?: 'outline' | 'dark' | 'danger' | 'gold'; disabled?: boolean; type?: 'button' | 'submit' }) {
    const tones = {
        outline: 'border-parchment-500 bg-white text-ink-800 hover:border-ink-900',
        dark: 'border-ink-900 bg-ink-900 text-parchment-100 hover:bg-ink-800',
        danger: 'border-risk-500/50 bg-white text-risk-700 hover:bg-risk-50',
        gold: 'border-gold-500 bg-gold-500 text-ink-900 hover:bg-gold-400',
    }[tone];
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={cn('inline-flex h-8 items-center gap-1.5 rounded-[4px] border px-2.5 text-xs font-semibold whitespace-nowrap disabled:opacity-50', tones)}>
            {children}
        </button>
    );
}

export function post(url: string, data: Record<string, unknown> = {}, confirm?: string) {
    if (confirm && !window.confirm(confirm)) return;
    router.post(url, data as never, { preserveScroll: true });
}

/** Query-param navigation for filters. */
export function filterTo(path: string, current: Record<string, string>, patch: Record<string, string>) {
    const merged = Object.fromEntries(Object.entries({ ...current, ...patch }).filter(([, v]) => v !== '' && v !== undefined));
    router.get(path, merged, { preserveScroll: true, preserveState: true });
}

/** Native select for console filter bars. */
export function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
    return (
        <label className="flex min-w-0 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500">
            {label}
            <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem] text-ink-800 focus:border-gold-500 focus:outline-none">
                <option value="">All</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function money(n: number | null | undefined, decimals = 2): string {
    if (n === null || n === undefined) return '—';
    return `ZAR ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace(/ /g, ',').replace(/ /g, ',')}`;
}
