import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Chip, type ChipTone } from '../Chips';
import type { AdminUnitNode, ScreenedProject } from './types';

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[8px] border border-ink-700 bg-ink-900 p-4 text-parchment-100', className)}>
            {(title || action) && (
                <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    {title && <h3 className="text-sm font-semibold">{title}</h3>}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

/** Honest empty state: what is missing and why. */
export function Pending({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <div className="rounded-[6px] border border-dashed border-gold-700/60 p-4 text-sm text-ink-200">
            <p className="flex items-center gap-2 font-semibold text-gold-400"><Info className="size-4" />{title}</p>
            {children && <div className="mt-1 text-xs text-ink-300">{children}</div>}
        </div>
    );
}

export function PlaceholderNote({ className }: { className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border border-dashed border-attested-500/70 px-2 py-0.5 text-[0.625rem] font-semibold whitespace-nowrap text-attested-500', className)} title="The site is not fixed yet. The pin shows an approximate location.">
            Approximate location
        </span>
    );
}

export const STATUS_TONE: Record<string, ChipTone> = { QUALIFIED: 'good', WATCHLIST: 'warn', 'NOT QUALIFIED': 'bad' };

export function StatusChip({ project }: { project: Pick<ScreenedProject, 'status'> }) {
    const text = { QUALIFIED: 'Qualified', WATCHLIST: 'Watchlist', 'NOT QUALIFIED': 'Not qualified' }[project.status] ?? project.status;
    return <Chip tone={STATUS_TONE[project.status] ?? 'gold'}>{text}</Chip>;
}

export const pct = (v: number | null | undefined) => (v === null || v === undefined ? 'Not stated' : `${Number(v).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`);

export const num = (v: number | null | undefined) => (v === null || v === undefined ? 'Not stated' : Number(v).toLocaleString('en-US'));

/** Unit id -> unit, children by parent, and helpers over the hierarchy. */
export function buildTree(units: AdminUnitNode[]) {
    const byId = new Map(units.map((u) => [u.id, u]));
    const children = new Map<number | null, AdminUnitNode[]>();
    for (const u of units) {
        const key = u.parentId && byId.has(u.parentId) ? u.parentId : null;
        children.set(key, [...(children.get(key) ?? []), u]);
    }
    const ancestors = (id: number | null): AdminUnitNode[] => {
        const out: AdminUnitNode[] = [];
        let cur = id ? byId.get(id) : undefined;
        let guard = 0;
        while (cur && guard++ < 8) {
            out.unshift(cur);
            cur = cur.parentId ? byId.get(cur.parentId) : undefined;
        }
        return out;
    };
    const descendants = (id: number): Set<number> => {
        const out = new Set<number>([id]);
        const stack = [id];
        while (stack.length) {
            const cur = stack.pop()!;
            for (const c of children.get(cur) ?? []) {
                if (!out.has(c.id)) {
                    out.add(c.id);
                    stack.push(c.id);
                }
            }
        }
        return out;
    };
    return { byId, children, ancestors, descendants };
}

export function unitKind(u: AdminUnitNode): string {
    return u.kind ?? { region: 'Region', district: 'District', city: 'City', municipality: 'Municipality', town: 'Town' }[u.levelKey];
}
