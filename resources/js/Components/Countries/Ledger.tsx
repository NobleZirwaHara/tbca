import { Link } from '@inertiajs/react';
import { useState } from 'react';
import * as L from 'lucide-react';
import { cn } from '@/lib/cn';
import type { CorridorRow, Outlook } from '@/types/countries';
import { Card, Chip, Flag, Spark, StateBadge, Table } from './ui';

export const LEDGER_META: Record<string, { name: string; color: string; text: string }> = {
    T: { name: 'TBCA Fees', color: 'bg-verified-500', text: 'text-verified-700' },
    X: { name: 'External Fees', color: 'bg-referenced-500', text: 'text-referenced-700' },
    S: { name: 'Statutory Fees', color: 'bg-attested-500', text: 'text-attested-700' },
    P: { name: 'Partner Fees', color: 'bg-referenced-700', text: 'text-referenced-700' },
    D: { name: 'Data & Licence Fees', color: 'bg-controlled-500', text: 'text-controlled-700' },
    'CT-C': { name: 'Corridor Fees', color: 'bg-gold-500', text: 'text-gold-700' },
};

export const LEDGERS = ['T', 'X', 'S', 'P', 'D', 'CT-C'];

export function LedgerBadge({ code }: { code: string }) {
    return <span className={cn('inline-flex min-w-7 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold text-white', LEDGER_META[code]?.color ?? 'bg-ink-500')}>{code}</span>;
}

const zar = (n: number) => `R${Math.round(n).toLocaleString('en-ZA')}`;

/** Part 6.2: one tile per ledger, each with its own evidence/certainty — never a blended all-ledger total. */
export function LedgerTiles({ totals, series }: { totals: Record<string, number>; series?: Record<string, number[]> }) {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
            {LEDGERS.map((code) => (
                <div key={code} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                    <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-900">
                        <LedgerBadge code={code} /> {LEDGER_META[code].name}
                    </p>
                    <p className="text-[0.6875rem] text-ink-400">Ledger {code} · 12-month outlook</p>
                    <p className={cn('mt-1 text-lg font-bold', LEDGER_META[code].text)}>{zar(totals[code] ?? 0)}</p>
                    {series?.[code] && <Spark values={series[code]} />}
                </div>
            ))}
            <div className="flex flex-col justify-center rounded-[8px] border border-dashed border-attested-500/50 bg-attested-50 p-3 text-[0.75rem] text-attested-700">
                <p className="flex items-center gap-1.5 font-semibold"><L.Ban className="size-4" /> No combined total</p>
                <p className="mt-1">Each ledger has a different recipient and economic class. TBCA never blends them into one figure.</p>
            </div>
        </div>
    );
}

export function outlookTotals(o: Outlook) {
    const totals: Record<string, number> = {};
    const series: Record<string, number[]> = {};
    LEDGERS.forEach((l) => {
        const v = (o[l] as number[]) ?? [];
        series[l] = v;
        totals[l] = v.reduce((a, b) => a + b, 0);
    });
    return { totals, series };
}

export function OutlookTable({ outlook }: { outlook: Outlook }) {
    const [view, setView] = useState<'monthly' | 'quarterly'>('monthly');
    const months = outlook.months;
    const cols = view === 'monthly' ? months : ['Q1 (Sep–Nov)', 'Q2 (Dec–Feb)', 'Q3 (Mar–May)', 'Q4 (Jun–Aug)'];
    const values = (l: string) => {
        const v = outlook[l] as number[];
        return view === 'monthly' ? v : [0, 1, 2, 3].map((q) => v.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0));
    };
    return (
        <Card
            title="Ledger Detail (12-Month Outlook — Model Basis Estimates)"
            action={
                <div className="flex rounded border border-parchment-500 text-xs" role="group" aria-label="View">
                    {(['monthly', 'quarterly'] as const).map((v) => (
                        <button key={v} type="button" onClick={() => setView(v)} className={cn('px-3 py-1 capitalize', view === v ? 'bg-referenced-500 text-white' : 'bg-white')} aria-pressed={view === v}>{v}</button>
                    ))}
                </div>
            }
        >
            <Table
                dense
                columns={['Ledger', ...cols, '12-Month Total (ZAR)']}
                rows={LEDGERS.map((l) => [
                    <span className="flex items-center gap-2 whitespace-nowrap"><LedgerBadge code={l} /> {LEDGER_META[l].name}</span>,
                    ...values(l).map((v) => v.toLocaleString('en-ZA')),
                    <b>{(outlook[l] as number[]).reduce((a, b) => a + b, 0).toLocaleString('en-ZA')}</b>,
                ])}
            />
            <p className="mt-2 text-[0.6875rem] text-ink-500">Each row is its own ledger with its own recipient. There is deliberately no "Total (All Ledgers)" row.</p>
        </Card>
    );
}

export function StackedBars({ outlook }: { outlook: Outlook }) {
    const sums = outlook.months.map((_, i) => LEDGERS.reduce((s, l) => s + ((outlook[l] as number[])[i] ?? 0), 0));
    const max = Math.max(...sums);
    return (
        <Card title="Monthly Outlook by Ledger (Model Basis Estimates)" intro="Stacked for shape only — figures remain separate per ledger.">
            <div className="flex h-48 items-end gap-1.5" role="img" aria-label="Stacked monthly outlook by ledger">
                {outlook.months.map((m, i) => (
                    <div key={m} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex w-full flex-col-reverse overflow-hidden rounded-t" style={{ height: `${(sums[i] / max) * 160}px` }}>
                            {LEDGERS.map((l) => (
                                <div key={l} className={LEDGER_META[l].color} style={{ height: `${((outlook[l] as number[])[i] / sums[i]) * 100}%` }} title={`${LEDGER_META[l].name}: ${(outlook[l] as number[])[i]}`} />
                            ))}
                        </div>
                        <span className="text-[0.5625rem] text-ink-500">{m.replace(' 20', ' ')}</span>
                    </div>
                ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-3 text-[0.6875rem] text-ink-600">
                {LEDGERS.map((l) => (
                    <li key={l} className="flex items-center gap-1"><span className={cn('size-2.5 rounded-full', LEDGER_META[l].color)} /> {LEDGER_META[l].name}</li>
                ))}
            </ul>
        </Card>
    );
}

/** Two-endpoint header used across corridor screens. */
export function CorridorHeader({ c }: { c: CorridorRow }) {
    const r = c.resolution;
    return (
        <div className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Flag iso={c.from_iso} className="text-3xl" />
                    <div>
                        <p className="font-semibold text-ink-900">{c.from_name}</p>
                        <p className="text-[0.6875rem] text-ink-500">Departure endpoint</p>
                        <EndpointState e={r.from} />
                    </div>
                </div>
                <L.ArrowRight className="size-5 text-gold-600" aria-label="to" />
                <div className="flex items-center gap-2">
                    <Flag iso={c.to_iso} className="text-3xl" />
                    <div>
                        <p className="font-semibold text-ink-900">{c.to_name}</p>
                        <p className="text-[0.6875rem] text-ink-500">Arrival endpoint</p>
                        <EndpointState e={r.to} />
                    </div>
                </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-[0.8125rem] sm:grid-cols-5">
                <div><dt className="text-[0.6875rem] text-ink-500">Corridor Type</dt><dd className="font-semibold">{c.type}</dd></div>
                <div><dt className="text-[0.6875rem] text-ink-500">Purpose</dt><dd className="font-semibold">{c.purpose}</dd></div>
                <div><dt className="text-[0.6875rem] text-ink-500">Evidence Status</dt><dd className="font-semibold text-verified-700">{c.evidence_status}<span className="block text-[0.6875rem] font-normal text-ink-500">{c.evidence_items} evidence items</span></dd></div>
                <div><dt className="text-[0.6875rem] text-ink-500">Confidence</dt><dd className="font-semibold">{c.confidence} ({c.confidence_pct}%)</dd></div>
                <div><dt className="text-[0.6875rem] text-ink-500">Pair Permission</dt><dd><Chip tone={r.sellable ? 'good' : r.ceiling === 'BLOCKED' ? 'bad' : 'warn'}>{r.pair_permission}</Chip><span className="mt-0.5 block text-[0.6875rem] text-ink-500">Ceiling: {r.ceiling_label}</span></dd></div>
            </dl>
        </div>
    );
}

function EndpointState({ e }: { e: CorridorRow['resolution']['from'] }) {
    if (e.african) {
        const bucket = e.state === 'ACTIVE' || e.state.startsWith('ACTIVE') ? 'activated' : e.state === 'INACTIVE/SHELLED' ? 'shell' : e.state === 'RESTRICTED' ? 'restricted' : e.state === 'SUSPENDED' ? 'suspended' : e.state === 'DEGRADED' ? 'degraded' : 'shell';
        return <StateBadge bucket={bucket} label={e.label} className="mt-0.5" />;
    }
    return <Chip tone="good" className="mt-0.5">Resolver-Ready (external)</Chip>;
}

export function CorridorTabs({ code, active }: { code: string; active: string }) {
    const tabs: [string, string][] = [
        ['Corridor Detail', `/countries/corridors/${code}`],
        ['Endpoint Comparison', `/countries/corridors/${code}/endpoints`],
        ['Pair Evidence', `/countries/corridors/${code}/evidence`],
        ...LEDGERS.map((l) => [`Ledger ${l}`, `/countries/corridors/${code}/ledger/${l.toLowerCase()}`] as [string, string]),
        ['Fee Comparison', `/countries/corridors/${code}/fee-comparison`],
        ['12-Month Outlook', `/countries/corridors/${code}/outlook`],
        ['Network', '/countries/corridors/network'],
    ];
    return (
        <nav className="flex gap-1 overflow-x-auto border-b border-parchment-400" aria-label="Corridor views">
            {tabs.map(([l, h]) => (
                <Link key={l} href={h} preserveScroll className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-[0.8125rem] whitespace-nowrap', active === l ? 'border-gold-500 font-semibold text-gold-800' : 'border-transparent text-ink-500 hover:text-ink-900')} aria-current={active === l ? 'page' : undefined}>
                    {l}
                </Link>
            ))}
        </nav>
    );
}

export function CorridorSnapshot({ c }: { c: CorridorRow }) {
    return (
        <Card title="Corridor Snapshot" action={<Chip>{c.evidence_status}</Chip>}>
            <dl className="space-y-1.5 text-[0.8125rem]">
                {[
                    ['From', c.from_name], ['To', c.to_name], ['Corridor Type', c.type], ['Purpose', c.purpose], ['Evidence Items', String(c.evidence_items)],
                    ['Confidence Level', `${c.confidence} (${c.confidence_pct}%)`], ['Commercial Availability', 'Service-by-service permission applies'],
                    ['Estimated Activation Cost', `${zar(c.cost_min)} – ${zar(c.cost_max)} (Model Basis)`], ['Time to Activate (Est.)', c.time ?? '—'],
                    ['Endpoint Ceiling', c.resolution.ceiling_label], ['Pair Permission', c.resolution.pair_permission], ['Resolver', 'TBCA'],
                ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium text-ink-900">{v}</dd></div>
                ))}
            </dl>
            {c.resolution.reasons.length > 0 && (
                <ul className="mt-3 space-y-1 rounded border border-attested-500/30 bg-attested-50 p-2 text-[0.6875rem] text-attested-700">
                    {c.resolution.reasons.map((r) => <li key={r}>• {r}</li>)}
                </ul>
            )}
        </Card>
    );
}
