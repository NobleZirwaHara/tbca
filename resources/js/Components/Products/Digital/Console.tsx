import { useState, type ReactNode } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { FilterSelect, useQueryNav } from './Ui';

/** Search box + query-param selects shared by the Digital admin queues. */
export function QueueFilters({
    base,
    filters,
    placeholder,
    selects = [],
}: {
    base: string;
    filters: Record<string, unknown>;
    placeholder: string;
    selects?: { key: string; label: string; options: { value: string; label: string }[] }[];
}) {
    const nav = useQueryNav(base, filters);
    const [q, setQ] = useState(String(filters.q ?? ''));

    return (
        <div className="grid gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
            <form
                className="relative sm:col-span-2 lg:col-span-1"
                onSubmit={(e) => {
                    e.preventDefault();
                    nav({ q });
                }}
            >
                <label htmlFor={`${base}-q`} className="sr-only">
                    Search
                </label>
                <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-ink-400" aria-hidden="true" />
                <input
                    id={`${base}-q`}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={placeholder}
                    className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white pr-2 pl-8 text-[0.8125rem] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none"
                />
            </form>
            {selects.map((s) => (
                <FilterSelect key={s.key} label={s.label} value={String(filters[s.key] ?? '')} options={s.options} onChange={(v) => nav({ [s.key]: v })} />
            ))}
        </div>
    );
}

/** Right-rail list of quick actions (each one runs a real action or navigates). */
export function QuickActions({ items }: { items: { title: string; body: string; onClick: () => void }[] }) {
    return (
        <ul className="divide-y divide-parchment-300">
            {items.map((i) => (
                <li key={i.title}>
                    <button type="button" onClick={i.onClick} className="flex w-full items-center justify-between gap-2 py-2 text-left hover:text-gold-700">
                        <span>
                            <span className="block text-[0.8125rem] font-semibold text-ink-900">{i.title}</span>
                            <span className="block text-[0.6875rem] text-ink-500">{i.body}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                    </button>
                </li>
            ))}
        </ul>
    );
}

/** Labelled horizontal meter (percentage). */
export function Meter({ label, value, display, tone = 'good' }: { label: ReactNode; value: number; display?: ReactNode; tone?: 'good' | 'warn' | 'bad' }) {
    const bar = { good: 'bg-verified-500', warn: 'bg-attested-500', bad: 'bg-risk-500' }[tone];
    return (
        <div className="text-xs">
            <div className="flex justify-between gap-2">
                <span className="text-ink-700">{label}</span>
                <span className="font-semibold text-ink-900">{display ?? `${value}%`}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-parchment-300">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
            </div>
        </div>
    );
}

/** Numbered process strip (containment flow, remediation workflow). */
export function FlowSteps({ steps, active = 0 }: { steps: { title: string; body?: string }[]; active?: number }) {
    return (
        <ol className="grid gap-2 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
            {steps.map((s, i) => (
                <li key={s.title} className={`rounded-[6px] border p-2.5 ${i + 1 <= active ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white'}`}>
                    <p className="text-[0.6875rem] font-bold text-gold-700">{i + 1}</p>
                    <p className="text-xs font-semibold text-ink-900">{s.title}</p>
                    {s.body && <p className="mt-0.5 text-[0.6875rem] text-ink-500">{s.body}</p>}
                </li>
            ))}
        </ol>
    );
}

/** IP chain record as sent by AdminController::ipRow(). */
export interface DpIpRow {
    id: number;
    product: string;
    version: string;
    sku: string;
    provider: string | null;
    authorship: string;
    instrument: string | null;
    ref: string | null;
    instrumentDate: string | null;
    ip: string;
    classes: Record<string, string>;
    licenceVersion: string | null;
    effective: string | null;
    jurisdiction: string | null;
    lastReview: string | null;
    nextReview: string | null;
    reviewer: string | null;
    thirdParty: string;
    ai: string;
    clearance: string;
    listed: boolean;
    marketplace: boolean;
}

export const AUTHORSHIP: Record<string, string> = {
    A1: 'TBCA-authored',
    A2: 'Marketplace Provider',
    A3: 'Contributor',
    A4: 'Third-Party Content',
    A5: 'Unverified / Other',
};

/** L1–L5 permitted-use markers: ok = permitted, pending = awaiting clearance, blocked = not permitted. */
export function LicenceDots({ classes }: { classes: Record<string, string> }) {
    const tone: Record<string, string> = {
        ok: 'border-verified-500/40 bg-verified-50 text-verified-700',
        pending: 'border-attested-500/40 bg-attested-50 text-attested-700',
        blocked: 'border-risk-500/30 bg-risk-50 text-risk-700 line-through',
    };
    return (
        <span className="flex flex-wrap gap-0.5">
            {['L1', 'L2', 'L3', 'L4', 'L5'].map((c) => (
                <span key={c} title={`${c}: ${classes[c] ?? 'blocked'}`} className={`rounded border px-1 text-[0.625rem] font-bold ${tone[classes[c] ?? 'blocked'] ?? tone.blocked}`}>
                    {c}
                </span>
            ))}
        </span>
    );
}
