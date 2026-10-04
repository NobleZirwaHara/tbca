import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, ShieldAlert } from 'lucide-react';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, Chip, Status, Table, label } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';

interface Row { id: number; code: string; title: string; industryId: string; industry: string | null; subIndustry: string | null; state: string; method: string | null; confidence: number | null; complexityClass: string; band: string | null; safety: boolean }
interface Props {
    filters: { state: string | null; q: string | null };
    states: string[];
    counts: Record<string, number>;
    rows: Row[];
    industries: { value: string; label: string }[];
}

function RowEditor({ row, states, industries }: { row: Row; states: string[]; industries: { value: string; label: string }[] }) {
    const [industry, setIndustry] = useState(row.industryId);
    const [state, setState] = useState(row.state);
    const dirty = industry !== row.industryId || state !== row.state;
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <select aria-label={`Industry for ${row.code}`} value={industry} onChange={(e) => setIndustry(e.target.value)} className="h-8 max-w-44 rounded border border-parchment-500 text-xs"><option value="">— Unmapped —</option>{industries.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}</select>
            <select aria-label={`State for ${row.code}`} value={state} onChange={(e) => setState(e.target.value)} className="h-8 rounded border border-parchment-500 text-xs">{states.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
            <button type="button" disabled={!dirty} onClick={() => router.put(`/admin/insights/industries/classification/${row.id}`, { industry_id: industry || null, state }, { preserveScroll: true })} className="rounded bg-gold-500 px-2 py-1 text-xs font-semibold disabled:opacity-40">Save</button>
        </div>
    );
}

export default function Classification({ filters, states, counts, rows, industries }: Props) {
    const { f, setF, apply } = useFilters({ state: filters.state ?? '', q: filters.q ?? '' }, '/admin/insights/industries/classification');

    return (
        <IndustryAdmin title="Sprint Classification Console" badge="Human Gate" description="Classify every Sprint against the canonical Industry taxonomy. AI candidates ≥ 0.970 are provisional; 0.900–0.969 need human confirmation; regulated / high-complexity rows always need human review.">
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => apply({ state: '' })} className={cn('rounded-full border px-3 py-1 text-xs', !f.state ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500 bg-white')}>All</button>
                {states.map((s) => <button key={s} type="button" onClick={() => apply({ state: s })} className={cn('rounded-full border px-3 py-1 text-xs', f.state === s ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500 bg-white')}>{label(s)} ({counts[s] ?? 0})</button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-3 flex max-w-md gap-2">
                <label className="relative flex-1"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search by Sprint code or title" className="h-9 w-full rounded border border-parchment-500 pl-7 text-sm" /></label>
                <button type="submit" className="rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Search</button>
            </form>
            <Box className="mt-4" title={`Classification Records (${rows.length})`}>
                <Table
                    head={['Sprint Code', 'Title', 'Current Industry', 'State', 'Method / Confidence', 'Complexity', 'Classify']}
                    rows={rows.map((r) => [
                        <strong key="c">{r.code}</strong>, r.title,
                        <span key="i" className="text-xs">{r.industry ?? <Chip tone="red">Unmapped</Chip>}{r.subIndustry && <span className="block text-ink-400">{r.subIndustry}</span>}</span>,
                        <Status key="s" value={r.state} />,
                        <span key="m" className="text-xs">{label(r.method) || '—'}{r.confidence !== null && <span className="block">{r.confidence.toFixed(3)} · {r.band}</span>}</span>,
                        <span key="x" className="text-xs">{r.complexityClass}{r.safety && <span className="flex items-center gap-1 text-risk-700"><ShieldAlert className="size-3" /> Safety cohort</span>}</span>,
                        <RowEditor key={`e-${r.id}-${r.state}-${r.industryId}`} row={r} states={states} industries={industries} />,
                    ])}
                />
            </Box>
        </IndustryAdmin>
    );
}
