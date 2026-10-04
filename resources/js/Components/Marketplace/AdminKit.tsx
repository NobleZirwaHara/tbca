import { useState, type ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { MoreHorizontal, Search } from 'lucide-react';
import { Modal, StatusPill, Tabs, Tag } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import { priorityTone } from '@/Components/Marketplace/ui';

/* ==========================================================================
   Admin console helpers: KPI row, query-driven tabs/filters, action menu.
   ========================================================================== */

export function KpiRow({ items }: { items: { label: ReactNode; value: ReactNode; caption?: ReactNode; tone?: string }[] }) {
    const tones: Record<string, string> = { good: 'text-verified-500', warn: 'text-attested-500', bad: 'text-risk-500', gold: 'text-gold-600' };
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {items.map((k, i) => (
                <div key={i} className="rounded-[8px] border border-parchment-400 bg-white p-4">
                    <p className="text-xs font-medium text-ink-500">{k.label}</p>
                    <p className={cn('mt-1 text-xl font-bold tracking-tight text-ink-900', k.tone ? tones[k.tone] : '')}>{k.value}</p>
                    {k.caption && <p className="mt-0.5 text-[0.6875rem] text-ink-400">{k.caption}</p>}
                </div>
            ))}
        </div>
    );
}

/** Navigate the current page with updated query params (server-side filtering). */
export function go(url: string, query: Record<string, string | undefined>) {
    const clean = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''));
    router.get(url, clean, { preserveScroll: true, preserveState: true, replace: true });
}

export function QueryTabs({
    url,
    query,
    tabs,
    counts,
    param = 'tab',
}: {
    url: string;
    query: Record<string, string>;
    tabs: Record<string, string>;
    counts?: Record<string, number>;
    param?: string;
}) {
    return (
        <Tabs
            value={query[param] ?? Object.keys(tabs)[0]}
            onChange={(k) => go(url, { ...query, [param]: k })}
            tabs={Object.entries(tabs).map(([key, label]) => ({ key, label, count: counts?.[key] }))}
        />
    );
}

export function SearchBox({ url, query, placeholder = 'Search…' }: { url: string; query: Record<string, string>; placeholder?: string }) {
    const [q, setQ] = useState(query.q ?? '');
    return (
        <form
            role="search"
            onSubmit={(e) => {
                e.preventDefault();
                go(url, { ...query, q });
            }}
            className="relative min-w-0 flex-1 sm:max-w-xs"
        >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="pl-9" />
        </form>
    );
}

export function FilterSelect({ url, query, name, label, options }: { url: string; query: Record<string, string>; name: string; label: string; options: string[] }) {
    return (
        <label className="flex min-w-36 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500">
            {label}
            <Select
                value={query[name] ?? ''}
                onChange={(e) => go(url, { ...query, [name]: e.target.value })}
                options={options.map((o) => ({ value: o, label: o.replace(/_/g, ' ') }))}
                placeholder="All"
            />
        </label>
    );
}

export interface MenuAction {
    key: string;
    label: string;
    needsNote?: boolean;
    danger?: boolean;
}

/** Row action menu: a select-style dropdown; actions that need a note open a modal. */
export function ActionMenu({ url, actions, extra, label = 'Actions' }: { url: string; actions: MenuAction[]; extra?: Record<string, unknown>; label?: string }) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState<MenuAction | null>(null);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);

    if (actions.length === 0) return <span className="text-xs text-ink-300">—</span>;

    const submit = (a: MenuAction, n?: string) => {
        setBusy(true);
        router.post(url, { action: a.key, note: n || undefined, ...extra }, {
            preserveScroll: true,
            onFinish: () => {
                setBusy(false);
                setPending(null);
                setNote('');
            },
        });
    };

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={label}
                onClick={() => setOpen((o) => !o)}
                className="inline-flex items-center gap-1 rounded-[4px] border border-parchment-500 bg-white px-2 py-1 text-xs font-medium text-ink-700 hover:border-gold-500"
            >
                {label} <MoreHorizontal className="size-3.5" />
            </button>
            {open && (
                <ul role="menu" className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-[6px] border border-parchment-400 bg-white py-1 shadow-raised">
                    {actions.map((a) => (
                        <li key={a.key} role="none">
                            <button
                                type="button"
                                role="menuitem"
                                disabled={busy}
                                onClick={() => {
                                    setOpen(false);
                                    if (a.needsNote) setPending(a);
                                    else submit(a);
                                }}
                                className={cn('block w-full px-3 py-2 text-left text-xs hover:bg-parchment-100', a.danger ? 'text-risk-600' : 'text-ink-800')}
                            >
                                {a.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <Modal
                open={pending !== null}
                onClose={() => setPending(null)}
                title={pending?.label ?? ''}
                footer={
                    <>
                        <Button variant="outline" size="sm" type="button" onClick={() => setPending(null)}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            type="button"
                            disabled={busy || note.trim().length < 3}
                            onClick={() => pending && submit(pending, note)}
                        >
                            Confirm
                        </Button>
                    </>
                }
            >
                <Field label="Note (recorded in the audit trail)" hint="A note of at least 3 characters is required for this action." required>
                    {(id) => <Textarea id={id} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />}
                </Field>
            </Modal>
        </div>
    );
}

export function PriorityPill({ value }: { value: string | null | undefined }) {
    if (!value) return <span className="text-ink-300">—</span>;
    return <StatusPill status={value} tone={priorityTone(value)} />;
}

export function SmallTag({ children }: { children: ReactNode }) {
    return <Tag tone="neutral" className="normal-case tracking-normal">{children}</Tag>;
}

export function Table({ head, children, empty, colSpan }: { head: ReactNode[]; children: ReactNode; empty?: boolean; colSpan?: number }) {
    return (
        <div className="overflow-x-auto rounded-[6px] border border-parchment-400">
            <table className="w-full text-left text-[0.8125rem]">
                <thead className="bg-parchment-200 text-xs font-semibold text-ink-600">
                    <tr>
                        {head.map((h, i) => (
                            <th key={i} scope="col" className="px-3 py-2 whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-parchment-300 bg-white">
                    {empty ? (
                        <tr>
                            <td colSpan={colSpan ?? head.length} className="px-3 py-8 text-center text-ink-400">
                                No records match the current filters.
                            </td>
                        </tr>
                    ) : (
                        children
                    )}
                </tbody>
            </table>
        </div>
    );
}

export const td = 'px-3 py-2.5 align-top text-ink-700';
