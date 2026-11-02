/* 18 Sectors (prototype pages-intel.js #/c/{ISO}/sectors). */
import { Link } from '@inertiajs/react';
import { Card, Chip, Cols, TagS } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, SprintShelf, cHref } from '@/Components/CountryHub/Layout';
import { s } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface SectorCard { code: string; name: string; facts: number; templates: number; tierA: number; index: number | string | null; rationale: string }
interface Props { base: CountryBase; cards: SectorCard[]; shocks: Row[]; shelf: HubShelf }

const SHOCK_COLS = ['Diamond market', 'SA dependence (power, imports, rand)', 'Fiscal squeeze', 'Water & drought', 'Livestock disease (FMD)', 'Inflation & rates'];
const SHADE = ['#eef7f1', '#fdf0d5', '#f7c9c2'];

export default function Sectors({ base, cards, shocks, shelf }: Props) {
    const codes = new Set(cards.map((x) => x.code));
    return (
        <CountryPage base={base} pageKey="sectors">
            <CountryHead base={base} pageKey="sectors" title="18 Sectors"
                desc="Every sector carries ≥ 5 facts, an investor chain, a trader chain, a map stack, a permit pathway, a shock rating and its slice of the 321-template sweep." />
            <Cols n={3}>
                {cards.map((k) => {
                    const ix = Number(k.index);
                    return (
                        <Link key={k.code} href={cHref(BW, `sector/${k.code}`)} className="block rounded-[6px] border border-parchment-400 bg-white p-4 shadow-[0_1px_2px_rgba(8,8,11,.06)] hover:border-gold-400">
                            <div className="flex items-center justify-between gap-2">
                                <span className="rounded-[3px] bg-parchment-300 px-1.5 py-px text-[0.66rem] font-bold text-ink-600">{k.code}</span>
                                <Chip t={`Shock index ${k.index ?? '—'}`} tone={ix >= 6 ? 'bad' : ix >= 4 ? 'warn' : 'ok'} />
                            </div>
                            <h3 className="my-1.5 text-[1rem] font-semibold text-ink-900">{k.name}</h3>
                            <div className="flex flex-wrap gap-1"><Chip t={`${k.facts} facts`} tone="info" /><Chip t={`${k.templates} templates`} tone="gold" /><Chip t={`${k.tierA} Tier A/A+`} tone="ok" /></div>
                            <p className="mt-1.5 text-[0.7rem] text-ink-400">{k.rationale}</p>
                        </Link>
                    );
                })}
            </Cols>
            <Card title="Shock-exposure matrix (H-4) — 0 none · 1 moderate · 2 high" icon="alert" sub={<TagS s="BW_Shocks" />}>
                <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400">
                    <table className="w-full border-collapse text-[0.78rem]">
                        <thead className="bg-parchment-200 text-left">
                            <tr>{['Sector', ...SHOCK_COLS, 'Index', 'Downturn index'].map((h) => <th key={h} className="border-b border-parchment-400 px-2.5 py-2 font-semibold text-ink-600">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {shocks.map((r, i) => (
                                <tr key={i} className="border-b border-parchment-300 last:border-0">
                                    <td className="px-2.5 py-1.5">{codes.has(s(r.Sector)) ? <Link href={cHref(BW, `sector/${s(r.Sector)}`)} className="text-controlled-700 hover:underline">{s(r['Sector name'])}</Link> : s(r['Sector name'])}</td>
                                    {SHOCK_COLS.map((k) => <td key={k} className="px-1.5 py-1 text-right text-[0.72rem] tabular-nums" style={{ background: SHADE[Number(r[k]) || 0] ?? SHADE[0] }}>{s(r[k])}</td>)}
                                    <td className="px-2.5 py-1.5 text-right font-bold">{s(r.Index)}</td>
                                    <td className="px-2.5 py-1.5 text-right font-bold">{s(r['Downturn index'])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <SprintShelf shelf={shelf} c={base.c} />
        </CountryPage>
    );
}
