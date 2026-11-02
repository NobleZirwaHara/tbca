/* Unit Economics & IRR (prototype #economics, no mock-up number): PART H after-tax IRR, equity IRR, DSCR and tornado. */
import { Btn, CtaBand, DataMeta, DocTable, Frame, Grid, HBars, Hero, P, PackLoading, Panel, Rich, Section, SEC, SheetTable, SvcRail, VBars, type Block, type Row, type Sheet, type Svc } from '@/Components/Aiim/ProtoExplore';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    country: { slug: string; name: string };
    eco: { ue: Sheet; tornado: Row[]; tornadoLead: string; tornadoNote: string; numbers: Block['rows'] | null; revenue: Block['rows'] | null; fx: Sheet; rail: Svc[] } | null;
}

const pc = (v: unknown) => parseFloat(String(v ?? '').replace(/−/g, '-').replace('%', ''));

function Tornado({ t }: { t: Row }) {
    const base = pc(t['Base IRR']);
    const raw: [string, unknown, unknown][] = [['Price', t['Price −20 %'], t['Price +20 %']], ['Volume', t['Volume −20 %'], t['Volume +20 %']], ['Capex', t['Capex +20 %'], t['Capex −20 %']]];
    const fin = [base, ...raw.flatMap((r) => [pc(r[1]), pc(r[2])])].filter((v) => Number.isFinite(v));
    const mn = Math.min(0, ...fin), mx = Math.max(...fin);
    const W = 320;
    const x = (v: number) => 70 + ((W - 90) * ((Number.isFinite(v) ? v : mn) - mn)) / (mx - mn || 1);
    return (
        <svg viewBox={`0 0 ${W} 96`} className="w-full text-[10px]" role="img" aria-label={`Tornado for ${t.ID}`}>
            <line x1={x(base)} x2={x(base)} y1={4} y2={92} stroke="#16161b" strokeDasharray="3 3" />
            {raw.map((r, i) => {
                const lo = pc(r[1]), hi = pc(r[2]);
                return (
                    <g key={r[0]}>
                        <text x={0} y={22 + i * 28} fill="#3a3a44">{r[0]}</text>
                        <rect x={Math.min(x(lo), x(base))} y={10 + i * 28} width={Math.abs(x(base) - x(lo))} height={16} fill="#b23a2c" opacity={0.8} />
                        <rect x={Math.min(x(hi), x(base))} y={10 + i * 28} width={Math.abs(x(hi) - x(base))} height={16} fill="#1f7a4c" opacity={0.8} />
                        <text x={W - 2} y={22 + i * 28} textAnchor="end" fill="#16161b" fontWeight={600}>{String(r[1])} / {String(r[2])}</text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function Economics({ country, eco }: Props) {
    const crumbs = [{ label: country.name, href: `/aiim/country/${country.slug}` }, { label: 'Unit Economics' }];
    if (!eco) return <Frame title="Unit Economics" crumbs={crumbs}><PackLoading country={country.name} what="Unit economics packs with after-tax IRR, equity IRR, DSCR and tornado" /><CtaBand /></Frame>;
    const ue = eco.ue.rows;
    const color = (s: unknown) => SEC[String(s)]?.color;
    return (
        <Frame title="Unit Economics & IRR" crumbs={crumbs}>
            <Hero eyebrow="PART H · Unit economics" title="14 packs: after-tax IRR, equity IRR with debt, DSCR and a tornado"
                lead="Tax 22 % baseline (DG-01 open: KPMG reads 23.5 %, PwC and RSM 25 %). Financing: 50 % debt at prime 7.19 % + 3 pp = 10.19 %, 7-year annuity."
                right={<Btn href={P.brief('BW-PB-02')} tone="gold">Invest-in-a-Box (BW-PB-02)</Btn>} meta={<DataMeta />} />
            <Grid cols={2} className="mt-4">
                <Panel title="Project IRR, 10 years (%)"><VBars items={ue.map((u) => ({ n: `${u.ID} ${u.Sector}`, v: pc(u['Project IRR']), c: color(u.Sector) }))} fmt={(v) => `${v.toFixed(0)}%`} /></Panel>
                <Panel title="Payback (years)"><HBars items={ue.map((u) => ({ n: `${u.ID} · ${u.Pack}`, v: Number(u['Payback yrs']), c: color(u.Sector) }))} fmt={(v) => v.toFixed(1)} /></Panel>
            </Grid>
            <Section title="H-1a Logic"><SheetTable sheet={eco.ue} filters={[]} size={15} /></Section>
            <Section title="H-1c Tornado — project IRR at ±20 % on each driver" sub={<Rich t={eco.tornadoLead} />}>
                <Grid cols={3}>
                    {eco.tornado.map((t) => {
                        const u = ue.find((x) => x.ID === t.ID);
                        return (
                            <Panel key={String(t.ID)} title={<span className="text-[0.9rem]">{t.ID} · {u?.Pack ?? ''}</span>} right={<span className="font-mono text-[0.78rem]">base {t['Base IRR']}</span>}>
                                <Tornado t={t} />
                                <p className="text-[0.75rem] text-ink-500">Biggest: {t['Biggest driver']} · next: {t['Col 10'] ?? ''}</p>
                            </Panel>
                        );
                    })}
                </Grid>
                <Panel className="mt-3"><p className="text-[0.88rem]"><Rich t={eco.tornadoNote} /></p></Panel>
            </Section>
            <Section title="H-1b Numbers (pula m)"><DocTable rows={eco.numbers} /></Section>
            <Section title="H-5 Time to first revenue"><DocTable rows={eco.revenue} /></Section>
            <Section title="Pula scenarios"><SheetTable sheet={eco.fx} filters={[]} /></Section>
            <SvcRail items={eco.rail} />
            <CtaBand />
        </Frame>
    );
}
