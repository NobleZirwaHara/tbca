/* P17 Market Entry Readiness: interactive self-assessment (prototype #/c/{ISO}/readiness). */
import { useState } from 'react';
import { Card, Chip, Cols, Dl, Donut, STable, StatusChip, TagM, TagP, sum } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, saveCountryState, SprintShelf } from '@/Components/CountryHub/Layout';
import { JSteps, MeterCell } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Props { base: CountryBase; req: [string, string, string][]; vals: number[]; stateKey: string; shelf: HubShelf }

export default function Readiness({ base, req, vals: initial, stateKey, shelf }: Props) {
    const { c } = base;
    const [vals, setVals] = useState<number[]>(initial);
    const set = (i: number, v: number) => {
        const next = vals.map((x, k) => (k === i ? v : x));
        setVals(next);
        void saveCountryState(stateKey, next);
    };
    const score = Math.round((100 * sum(vals)) / vals.length);
    const doms: Record<string, number[]> = {};
    req.forEach((r, i) => (doms[r[0]] ||= []).push(vals[i]));
    const gaps = req.map((r, i) => ({ r, v: vals[i] })).filter((x) => x.v < 1);

    return (
        <CountryPage base={base} pageKey="readiness">
            <CountryHead base={base} pageKey="readiness" title="Market Entry Readiness" desc={`Assess your organisation's readiness to enter and operate in ${c.name}. Change any answer — the score, domains and gaps recompute instantly.`} />
            <JSteps c={c} active="readiness" />
            <Cols n={3}>
                <Card><div className="flex justify-center"><Donut p={score} label={score >= 75 ? 'Ready' : score >= 50 ? 'Ready with Actions' : 'Not Ready'} size={140} /></div></Card>
                <Card title="Readiness Snapshot" icon="chart">
                    <Dl rows={[
                        ['Total Requirements', req.length], ['Completed', vals.filter((v) => v === 1).length], ['In Progress', vals.filter((v) => v === 0.5).length],
                        ['Not Started', vals.filter((v) => v === 0).length], ['Estimated time to launch', score >= 75 ? '4–8 weeks' : score >= 50 ? '8–12 weeks' : '12–20 weeks'],
                    ]} />
                </Card>
                <Card title="Readiness Levels">
                    <div className="grid justify-start gap-1 text-[0.82rem]"><Chip t="0–49 % Not Ready" tone="bad" /><Chip t="50–74 % Ready with Actions" tone="warn" /><Chip t="75–100 % Ready" tone="ok" /></div>
                    <p className="mt-2 text-[0.72rem] text-ink-400">Readiness is calculated from completed requirements, conditions and country-specific facts <TagM />.</p>
                </Card>
            </Cols>
            <Card title="Readiness by Domain" icon="layers">
                <STable head={['Domain', 'Readiness', 'Status', 'Open actions']} rows={Object.entries(doms).map(([d, l]) => {
                    const p = Math.round((100 * sum(l)) / l.length);
                    return [<b key="d">{d}</b>, <MeterCell key="m" p={p} min={140} tone={p >= 75 ? 'ok' : p >= 50 ? 'warn' : 'bad'} />, <StatusChip key="s" s={p >= 75 ? 'Ready' : p > 0 ? 'In Progress' : 'Not Started'} />, l.filter((x) => x < 1).length];
                })} />
            </Card>
            <Card title="Readiness Assessment — your answers" icon="check">
                <STable head={['Domain', 'Requirement', 'Country evidence', 'Status']} rows={req.map((r, i) => [
                    r[0], <b key="r">{r[1]}</b>, r[2] ? <span key="e" className="text-[0.8rem]">{r[2]}</span> : <span key="e" className="text-[0.72rem]"><TagP /></span>,
                    <select key="s" aria-label={`Status for ${r[1]}`} value={String(vals[i])} onChange={(e) => set(i, Number(e.target.value))}
                        className="h-[30px] rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.75rem] font-semibold">
                        <option value="1">Complete</option><option value="0.5">In progress</option><option value="0">Not started</option>
                    </select>,
                ])} />
            </Card>
            <Card title="Top Critical Gaps" icon="alert">
                <ul className="list-disc space-y-1 ps-5 text-[0.82rem]">
                    {gaps.length ? gaps.map(({ r }) => (
                        <li key={r[1]}><b>{r[1]}</b> <span className="text-[0.72rem] text-ink-400">· {r[0]}</span>{r[2] && <div className="text-[0.72rem]">{r[2]}</div>}</li>
                    )) : <li>No gaps — ready to launch.</li>}
                </ul>
            </Card>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
