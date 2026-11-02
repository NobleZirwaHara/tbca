/* AIIM-005 Sector Selector (prototype #sectors). Botswana's 18 sectors; ?province= keeps the South Africa province view. */
import { Link } from '@inertiajs/react';
import LegacySectors, { type Props as SaProps } from '@/Components/Aiim/Explorer/LegacySectors';
import { Btn, CtaBand, DataMeta, DocTable, Frame, Grid, Hero, P, SEC, SecIcon, Section, ShockHeat, type Block, type Row } from '@/Components/Aiim/ProtoExplore';
import type { AiimPageProps } from '@/types/aiim';

interface Card { code: string; templates: number; tierA: number; facts: number; index: number | null; downturn: number | null; info: string }
interface BwProps extends AiimPageProps { mode: 'bw'; cards: Card[]; scoreboard: Block['rows'] | null; shocks: Row[] }
type Props = BwProps | (SaProps & { mode: 'sa' });

export default function Sectors(props: Props) {
    return props.mode === 'bw' ? <BotswanaSectors {...props} /> : <LegacySectors {...props} />;
}

function BotswanaSectors({ cards, scoreboard, shocks }: BwProps) {
    return (
        <Frame title="Sector Selector" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Sectors' }]}>
            <Hero eyebrow="Sector Selector" title="18 sectors, each with a full investor and trader worked example"
                lead="Every sector carries scenarios, graded facts, the investor and trader chains answered, a map stack, level rules, anchors, a freshness-gated sweep, products, shock rationale, citizen rules, permits and regulatory change."
                right={<Btn href={P.advisor} tone="gold">Commission a deep dive</Btn>} meta={<DataMeta />} />
            <Grid cols={3} className="mt-4">
                {cards.map((c) => {
                    const s = SEC[c.code];
                    return (
                        <Link key={c.code} href={P.sector(c.code)} className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-parchment-400 bg-white p-4 hover:border-gold-500">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2.5"><SecIcon code={c.code} /><div className="min-w-0"><div className="font-mono text-[0.7rem] text-ink-500">E{s.n} · {c.code}</div><h3 className="text-[0.98rem] leading-snug font-semibold text-ink-900">{s.name}</h3></div></div>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${c.tierA ? 'bg-verified-700 text-white' : 'bg-ink-50 text-ink-500'}`}>{c.tierA} Tier A</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-[0.75rem]">
                                <div><div className="text-ink-500">Templates</div><b>{c.templates}</b></div>
                                <div><div className="text-ink-500">Facts</div><b>{c.facts}</b></div>
                                <div><div className="text-ink-500">Shock index</div><b>{c.index} → {c.downturn}</b></div>
                            </div>
                            <div className="mt-auto flex items-end justify-between gap-2"><span className="text-[0.75rem] text-ink-500">{c.info}…</span><span className="shrink-0 text-[0.8rem] font-semibold text-gold-700">Open →</span></div>
                        </Link>
                    );
                })}
            </Grid>
            <Section title="Sector scoreboard (G-1)" sub="Templates, gates, citizen-reserved and FX-earning counts, shock index and verification owner by sector."><DocTable rows={scoreboard} /></Section>
            <Section title="Shock-exposure matrix (H-4)" sub="0 none · 1 moderate · 2 high. Exposure PROPOSED; shocks SOURCED."><ShockHeat rows={shocks} /></Section>
            <CtaBand />
        </Frame>
    );
}
