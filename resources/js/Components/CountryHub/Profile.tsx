/*
 * Country Profile & Planning helpers (top of prototype pages-profile.js): fact citation, the AIIM
 * benchmark card, the "does not claim" card and the [VERIFY] tag used by the permit tables.
 */
import { Card, GradeChip, STable, TagS } from '@/Components/Industries/Kit';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

/** Props shared by the profile pages. */
export interface ProfileProps { base: CountryBase; shelf?: HubShelf }

/** Prototype factCite: fact ID · source · date, then the grade chip. */
export function FactCite({ r }: { r: Row }) {
    return (
        <>
            <span className="text-[0.72rem] text-ink-400">{String(r['Fact ID'] ?? '')} · {String(r.Source ?? '')} · {String(r.Date ?? '')}</span>{' '}
            <GradeChip g={r.Grade} />
        </>
    );
}

/** Prototype benchCard: the country at a glance from BW_Benchmark (eight AIIM packs). */
export function BenchCard({ name, rows }: { name: string; rows: [string, string][] | null }) {
    if (!rows) return null;
    return (
        <Card title={`${name} at a glance — AIIM benchmark`} icon="chart" sub={<>From BW_Benchmark (eight AIIM packs, dated) <TagS s="BW_Benchmark" /></>}>
            <STable compact head={['Metric', 'Value']} rows={rows.map((r) => [r[0], <b key="v">{r[1]}</b>])} />
        </Card>
    );
}

/** Prototype notClaimed(). */
export function NotClaimed() {
    return (
        <Card title="What This Screen Does Not Claim" icon="shield">
            <ul className="space-y-1 text-[0.85rem]">
                {['Does not imply all 54 countries are active.', 'Does not invent unavailable facts.', 'Does not authorise price where resolver is incomplete.', 'Does not convert theoretical topology into commercial availability.'].map((x) => (
                    <li key={x} className="flex gap-2"><span className="font-bold text-risk-700" aria-hidden="true">✗</span><span>{x}</span></li>
                ))}
            </ul>
        </Card>
    );
}

/** "6–18 months [VERIFY]" with the [VERIFY] marker shown as a placeholder tag. */
export function VerifyText({ t }: { t: unknown }) {
    const s = String(t ?? '');
    const i = s.indexOf('[VERIFY]');
    if (i < 0) return <>{s}</>;
    return <>{s.slice(0, i)}<span className="inline-block rounded-[3px] bg-attested-50 px-1.5 py-px align-middle text-[0.66rem] font-bold tracking-wide text-gold-700 uppercase">verify</span>{s.slice(i + 8)}</>;
}
