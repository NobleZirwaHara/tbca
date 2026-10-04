import { Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress, StatusPill } from '@/Components/ui/Kit';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { Cell, Pagination } from '@/types/portal';
import { ActionButton } from './ActionButton';

export function CellView({ cell }: { cell: Cell }) {
    const price = usePrice();
    if (cell === null || cell === undefined || cell === '') return <span className="text-ink-300">—</span>;
    if (typeof cell === 'string' || typeof cell === 'number') return <>{cell}</>;

    switch (cell.t) {
        case 'ref':
            return cell.href ? (
                <Link href={cell.href} className="font-mono text-xs font-semibold whitespace-nowrap text-controlled-700 hover:underline">
                    {cell.v}
                </Link>
            ) : (
                <span className="font-mono text-xs whitespace-nowrap text-ink-800">{cell.v}</span>
            );
        case 'pill':
            return cell.v ? <StatusPill status={cell.v} tone={cell.tone ?? undefined} /> : null;
        case 'money':
            if (cell.v === null) return <span className="text-ink-400">Not calculable</span>;
            return <span className={cn('whitespace-nowrap', cell.v < 0 && 'text-risk-600')}>{cell.v < 0 ? `-${price(-cell.v)}` : price(cell.v)}</span>;
        case 'progress':
            return (
                <div className="flex min-w-24 items-center gap-2">
                    <Progress value={cell.v} className="h-1.5" tone={cell.v >= 95 ? 'bad' : 'gold'} />
                    <span className="text-xs whitespace-nowrap text-ink-600">{cell.label ?? `${cell.v}%`}</span>
                </div>
            );
        case 'link':
            return (
                <Link href={cell.href} className="text-controlled-700 hover:underline">
                    {cell.v}
                </Link>
            );
        case 'stack':
            return (
                <div className="min-w-40">
                    {cell.href ? (
                        <Link href={cell.href} className="font-semibold text-ink-900 hover:text-gold-700 hover:underline">
                            {cell.v}
                        </Link>
                    ) : (
                        <p className="font-semibold text-ink-900">{cell.v}</p>
                    )}
                    {cell.sub && <p className="text-xs text-ink-500">{cell.sub}</p>}
                </div>
            );
        case 'chips':
            return (
                <div className="flex flex-wrap gap-1">
                    {cell.v.map((c) => (
                        <span key={c} className="rounded-full bg-parchment-300 px-2 py-0.5 text-[0.6875rem] text-ink-700">
                            {c}
                        </span>
                    ))}
                </div>
            );
        case 'person':
            return (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="flex size-7 items-center justify-center rounded-full bg-ink-900 text-[0.625rem] font-bold text-gold-300" aria-hidden="true">
                        {cell.v.split(/\s+/).map((p) => p[0]).slice(0, 2).join('')}
                    </span>
                    <span>
                        <span className="block text-ink-900">{cell.v}</span>
                        {cell.sub && <span className="block text-[0.6875rem] text-ink-500">{cell.sub}</span>}
                    </span>
                </div>
            );
        case 'actions':
            return (
                <div className="flex flex-wrap justify-end gap-1.5">
                    {cell.v.map((a, i) => (
                        <ActionButton key={i} action={a} size="xs" />
                    ))}
                </div>
            );
    }
}

export function Pager({ pagination }: { pagination: Pagination }) {
    const { url } = usePage<{ url: { path: string } }>().props;
    if (pagination.pages <= 1) {
        return <p className="px-1 pt-3 text-xs text-ink-500">Showing {pagination.total} of {pagination.total} records</p>;
    }
    const go = (page: number) => {
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        router.get(url.path, { ...params, page }, { preserveScroll: true, preserveState: true });
    };
    const from = (pagination.page - 1) * pagination.per + 1;
    const to = Math.min(pagination.total, pagination.page * pagination.per);
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-3 text-xs text-ink-500">
            <span>
                Showing {from} to {to} of {pagination.total} records
            </span>
            <div className="flex items-center gap-1">
                <button type="button" disabled={pagination.page <= 1} onClick={() => go(pagination.page - 1)} className="rounded border border-parchment-500 bg-white p-1 disabled:opacity-40" aria-label="Previous page">
                    <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
                    .map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => go(p)}
                            aria-current={p === pagination.page ? 'page' : undefined}
                            className={cn('min-w-7 rounded border px-2 py-1', p === pagination.page ? 'border-ink-900 bg-ink-900 text-white' : 'border-parchment-500 bg-white')}
                        >
                            {p}
                        </button>
                    ))}
                <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => go(pagination.page + 1)} className="rounded border border-parchment-500 bg-white p-1 disabled:opacity-40" aria-label="Next page">
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}

export function DataTable({ columns, rows, empty, pagination, footer }: { columns: string[]; rows: Cell[][]; empty?: string; pagination?: Pagination; footer?: Cell[] }) {
    return (
        <div>
            <div className="overflow-x-auto rounded-[6px] border border-parchment-400">
                <table className="w-full text-left text-[0.8125rem]">
                    <thead className="bg-parchment-200 text-xs font-semibold text-ink-600">
                        <tr>
                            {columns.map((c, i) => (
                                <th key={i} scope="col" className="px-3 py-2 whitespace-nowrap">
                                    {c}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-parchment-300 bg-white">
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-3 py-8 text-center text-ink-400">
                                    {empty ?? 'Nothing to show yet.'}
                                </td>
                            </tr>
                        )}
                        {rows.map((r, i) => (
                            <tr key={i} className="hover:bg-parchment-100">
                                {r.map((cell, j) => (
                                    <td key={j} className="px-3 py-2 align-middle text-ink-700">
                                        <CellView cell={cell} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    {footer && (
                        <tfoot className="border-t-2 border-parchment-400 bg-parchment-100 font-semibold">
                            <tr>
                                {footer.map((cell, j) => (
                                    <td key={j} className="px-3 py-2 text-ink-900">
                                        <CellView cell={cell} />
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
            {pagination && <Pager pagination={pagination} />}
        </div>
    );
}
