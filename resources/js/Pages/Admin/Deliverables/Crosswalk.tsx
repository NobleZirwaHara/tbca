import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { DELIVERABLES_NAV, DeliverablesIcon, Pager, fmt, pct, type Paginated } from '@/Components/Deliverables/AdminParts';
import { cn } from '@/lib/cn';

type Match = 'code' | 'register_id' | 'unmatched';

interface Row {
    code: string;
    name: string | null;
    batch: string | null;
    population: string | null;
    ref: string;
    deliverable: string | null;
    status: string;
    match: Match;
    href: string | null;
}

interface Props {
    filters: { match: Match | null; q: string };
    stats: { codes: number; code: number; register_id: number; unmatched: number; sprints: number; sprintsWithout: number; statusNew: number; statusLinked: number };
    byPopulation: { population: string; code: number; register_id: number; unmatched: number }[];
    rows: Paginated<Row>;
    unmatched: { sprint_code: string; sprint_name: string | null; population: string | null; deliverable_ref: string }[];
    withoutDeliverable: { code: string; title: string; type: string; registerId: string | null; href: string | null }[];
}

const MATCH_LABEL: Record<Match, string> = { code: 'Linked by code', register_id: 'Linked by register ID', unmatched: 'No app Sprint' };
const matchTone = (m: Match) => (m === 'unmatched' ? 'warn' : 'good');

export default function Crosswalk({ filters, stats, byPopulation, rows, unmatched, withoutDeliverable }: Props) {
    const [q, setQ] = useState(filters.q);
    const matched = stats.code + stats.register_id;

    const go = (next: Partial<Props['filters']>) => {
        const f = { ...filters, ...next };
        router.get('/admin/deliverables/crosswalk', Object.fromEntries(Object.entries(f).filter(([, v]) => v)), { preserveState: true, preserveScroll: true, replace: true });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        go({ q });
    };

    return (
        <ConsoleLayout
            area="Registry of Deliverables"
            areaIcon={DeliverablesIcon}
            groups={DELIVERABLES_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Deliverables', href: '/admin/deliverables' }, { label: 'Sprint crosswalk' }]}
            title="Sprint Crosswalk Coverage"
            description="How the register's 7,589 Sprint codes line up with the Sprints published in the app, and which app Sprints have no deliverable yet."
        >
            <Head title="Sprint Crosswalk Coverage" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Crosswalk codes" value={fmt(stats.codes)} caption={`${fmt(stats.statusNew)} new rows, ${fmt(stats.statusLinked)} linked to Issue 1.0`} />
                <KpiTile label="Match rate" value={pct(matched, stats.codes)} caption={`${fmt(matched)} codes have an app Sprint`} tone="good" />
                <KpiTile label="Linked by code" value={fmt(stats.code)} />
                <KpiTile label="Linked by register ID" value={fmt(stats.register_id)} />
                <KpiTile label="Codes with no app Sprint" value={fmt(stats.unmatched)} tone={stats.unmatched > 0 ? 'warn' : 'neutral'} />
                <KpiTile label="App Sprints with no deliverable" value={fmt(stats.sprintsWithout)} caption={`of ${fmt(stats.sprints)} Sprints`} tone={stats.sprintsWithout > 0 ? 'warn' : 'neutral'} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2 [&>*]:min-w-0">
                <Panel title="Coverage by population">
                    <SimpleTable
                        columns={['Population', 'Linked by code', 'Linked by register ID', 'No app Sprint', 'Match rate']}
                        rows={byPopulation.map((p) => [
                            p.population,
                            fmt(p.code),
                            fmt(p.register_id),
                            fmt(p.unmatched),
                            pct(p.code + p.register_id, p.code + p.register_id + p.unmatched),
                        ])}
                    />
                    <p className="mt-3 text-xs text-ink-500">
                        The register covers 7,589 Sprints: the 7,008 catalogue Sprints of the Volume 11 register, plus 569 embedded services and 12 internal operations from Batch 4D.
                    </p>
                </Panel>
                <Panel title={`Codes with no app Sprint (${unmatched.length})`}>
                    <SimpleTable
                        columns={['Sprint code', 'Name', 'Population', 'Deliverable']}
                        empty="Every crosswalk code has an app Sprint."
                        rows={unmatched.map((u) => [
                            <span className="font-mono text-xs">{u.sprint_code}</span>,
                            u.sprint_name,
                            u.population,
                            <Link href={`/admin/deliverables/${u.deliverable_ref}`} className="font-mono text-xs text-gold-700 hover:underline">
                                {u.deliverable_ref}
                            </Link>,
                        ])}
                    />
                </Panel>
            </div>

            <Panel title={`App Sprints with no deliverable (${fmt(stats.sprintsWithout)})`} className="mt-5">
                <p className="mb-3 text-[0.8125rem] text-ink-500">
                    These Sprints carry neither a code nor a register ID that appears in the crosswalk. Most are earlier mockup pages that the Volume 11 register lists under other names.
                </p>
                <div className="max-h-96 overflow-y-auto">
                    <SimpleTable
                        columns={['Code', 'Sprint', 'Type', 'Register ID']}
                        empty="Every app Sprint has a deliverable."
                        rows={withoutDeliverable.map((s) => [
                            <span className="font-mono text-xs whitespace-nowrap">{s.code}</span>,
                            s.href ? (
                                <Link href={s.href} className="text-ink-900 hover:text-gold-700">
                                    {s.title}
                                </Link>
                            ) : (
                                s.title
                            ),
                            <span className="text-xs">{s.type}</span>,
                            <span className="font-mono text-xs">{s.registerId}</span>,
                        ])}
                    />
                </div>
            </Panel>

            <Panel
                title="All crosswalk codes"
                className="mt-5"
                action={
                    <div className="flex flex-wrap gap-1.5 text-xs">
                        {([null, 'code', 'register_id', 'unmatched'] as (Match | null)[]).map((m) => (
                            <button
                                key={m ?? 'all'}
                                type="button"
                                onClick={() => go({ match: m })}
                                className={cn('rounded-full border px-2.5 py-0.5', filters.match === m ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 text-ink-600')}
                            >
                                {m ? MATCH_LABEL[m] : 'All'}
                            </button>
                        ))}
                    </div>
                }
            >
                <form onSubmit={submit} className="mb-3 flex gap-2">
                    <label htmlFor="crosswalk-search" className="sr-only">
                        Search the crosswalk
                    </label>
                    <input
                        id="crosswalk-search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Sprint code, Sprint name or deliverable ref"
                        className="min-w-0 flex-1 rounded-[4px] border border-parchment-500 px-3 py-1.5 text-[0.8125rem]"
                    />
                    <button type="submit" className="rounded-[4px] bg-ink-900 px-3 py-1.5 text-[0.8125rem] font-semibold text-parchment-50">
                        Search
                    </button>
                </form>
                <SimpleTable
                    columns={['Sprint code', 'Sprint name', 'Batch', 'Deliverable', 'Crosswalk status', 'App Sprint']}
                    empty="No codes match."
                    rows={rows.data.map((r) => [
                        <span className="font-mono text-xs whitespace-nowrap">{r.code}</span>,
                        r.href ? (
                            <Link href={r.href} className="text-ink-900 hover:text-gold-700">
                                {r.name}
                            </Link>
                        ) : (
                            r.name
                        ),
                        r.batch,
                        <div className="min-w-40">
                            <Link href={`/admin/deliverables/${r.ref}`} className="font-mono text-xs text-gold-700 hover:underline">
                                {r.ref}
                            </Link>
                            <p className="text-xs text-ink-500">{r.deliverable}</p>
                        </div>,
                        <span className="text-xs">{r.status}</span>,
                        <StatusPill status={MATCH_LABEL[r.match]} tone={matchTone(r.match)} />,
                    ])}
                />
                <Pager page={rows} label="codes" />
            </Panel>
        </ConsoleLayout>
    );
}

Crosswalk.layout = null;
