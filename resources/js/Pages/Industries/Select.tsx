import { router } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { B, Card, Chip, CxChip, Dl, Field, Flag, Ic, IICON, Modal, Tile, TileGrid, inputCls, useToast } from '@/Components/Industries/Kit';
import { CallButton, Head1, PlainPage, contextJson } from '@/Components/Industries/Layout';
import type { IndustryBase, SubIndustry } from '@/types/industries';

type Ind = { code: string; slug: string; name: string; short: string; cx: number; cxName: string; reg: string; gate: string; cat: string; subs: SubIndustry[] };
interface Props extends IndustryBase {
    all: Ind[];
    start: { ind: string; sub: string; iso: string };
    multi: boolean;
    secondary: string[];
}

export default function Select(p: Props) {
    const [st, setSt] = useState({ ind: p.start.ind, sub: p.start.sub, iso: p.start.iso, sec: p.secondary });
    const [find, setFind] = useState('');
    const [addSec, setAddSec] = useState(false);
    const [other, setOther] = useState(false);
    const toast = useToast();
    const ind = p.all.find((x) => x.code === st.ind) ?? p.all[0];
    const sub = ind.subs.find((s) => s.code === st.sub) ?? null;
    const c = p.countries.find((x) => x.iso3 === st.iso) ?? p.countries[0];

    const pickInd = (code: string) => {
        if (p.multi && addSec && code !== st.ind) setSt({ ...st, sec: st.sec.includes(code) ? st.sec.filter((x) => x !== code) : [...st.sec, code] });
        else setSt({ ...st, ind: code, sub: '' });
    };
    const go = () => router.post('/industries/context', { ind: st.ind, sub: st.sub, iso: st.iso, ...(p.multi ? { sec: st.sec } : {}) });

    const selection = (
        <Dl rows={[
            ['Primary Industry', <b>{ind.name}</b>], ['Sub-Industry', sub ? sub.name : <span className="text-ink-400">Not selected</span>], ['Country', <><Flag iso2={c.iso2} /> {c.name}</>],
            ...(p.multi ? [['Secondary industries', st.sec.length ? st.sec.map((k) => p.all.find((x) => x.code === k)?.name).join(', ') : <span className="text-ink-400">Tick tiles to add</span>] as [string, ReactNode]] : []),
            ['Industry Status', <Chip t="Active" tone="ok" />], ['Classification', <Chip t="To be verified" tone="warn" />], ['Complexity', <CxChip n={ind.cx} name={ind.cxName} />], ['Human Gate', ind.gate], ['Visible Fees', 'T/P/X/S'],
        ]} />
    );

    return (
        <PlainPage title="Select Your Industry" crumbs={[['Industries', '/industries'], ['Select Your Industry']]} right={<>
            <Card title="Your Selection" icon="check">{selection}</Card>
            <Card title="Canonical IndustryContext" icon="cog" sub="Returned by the Industry Selector component (IN-SCR-011)">
                <pre className="m-0 font-mono text-[0.72rem] break-all whitespace-pre-wrap">{JSON.stringify(contextJson(ind, sub, c), null, 1)}</pre>
            </Card>
            <Card title="Need Help Choosing?" icon="msg"><p className="mb-2 text-[0.82rem]">Speak to a TBCA Advisor for guided industry classification.</p><CallButton v="pri" sm={false} /></Card>
        </>}>
            <Head1 eyebrow="Industry Selection · Mock-up Page 2" title="Select Your Industry" desc="Choose your primary industry and refine to a sub-industry for accurate guidance. The more accurately you describe your business, the more relevant our diagnostics, products, partners and pricing will be." />
            <Card title="Step 1: Choose Your Primary Industry" icon="layers">
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    <input type="search" placeholder="Search industries…" aria-label="Search industries" className={`${inputCls} max-w-[280px]`} value={find} onChange={(e) => setFind(e.target.value)} />
                    {p.multi && <label className="flex items-center gap-1.5 text-[0.82rem]"><input type="checkbox" checked={addSec} onChange={(e) => setAddSec(e.target.checked)} /> Tick to add secondary industries</label>}
                    <B sm onClick={() => setSt({ ...st, sub: '', sec: [] })}>Clear</B>
                </div>
                <TileGrid>
                    {p.all.filter((x) => `${x.name} ${x.short}`.toLowerCase().includes(find.toLowerCase())).map((x) => (
                        <Tile key={x.code} on={x.code === st.ind} onClick={() => pickInd(x.code)}>
                            <span className="grid grid-cols-[minmax(0,1fr)] size-8 place-items-center rounded-[6px] bg-ink-900 text-gold-400"><Ic n={IICON[x.code]} /></span>
                            <b className="text-[0.88rem] leading-snug">{x.name}</b>
                            <span className="text-[0.72rem] text-ink-400">{x.short}</span>
                            {p.multi && st.sec.includes(x.code) && <Chip t="Secondary" tone="info" />}
                        </Tile>
                    ))}
                </TileGrid>
            </Card>
            <Card title={`Step 2: Refine to a Sub-Industry for ${ind.name}`} icon="tag">
                <TileGrid>
                    {ind.subs.map((s) => (
                        <Tile key={s.code} on={s.code === st.sub} onClick={() => setSt({ ...st, sub: s.code })} className="min-h-[90px]">
                            <b className="text-[0.88rem] leading-snug">{s.name}</b>
                            <span className="text-[0.72rem] text-ink-400">{s.desc}</span>
                            <span className="font-mono text-[0.7rem] text-ink-400">{s.code}{s.aiim.length ? ` · AIIM ${s.aiim.join(', ')}` : ''}</span>
                        </Tile>
                    ))}
                    <Tile onClick={() => setOther(true)} className="min-h-[90px]"><b className="text-[0.88rem]">+ Other / Specify</b><span className="text-[0.72rem] text-ink-400">Describe your sub-industry — an analyst maps it to the controlled taxonomy.</span></Tile>
                </TileGrid>
            </Card>
            <Card title="Step 3: Country & Continue" icon="globe">
                <div className="flex flex-wrap items-end gap-4">
                    <Field label="Country (all 54 activated)" className="min-w-[min(100%,260px)]">
                        <select className={inputCls} value={st.iso} onChange={(e) => setSt({ ...st, iso: e.target.value })}>
                            {p.countries.map((x) => <option key={x.iso3} value={x.iso3}>{x.name}{x.iso3 === 'BWA' ? ' · full pack' : x.iso3 === 'ZAF' ? ' · SA model' : ''}</option>)}
                        </select>
                    </Field>
                    <p className="min-w-[200px] flex-1 text-[0.82rem]">Your selection determines relevant diagnostics, regulatory checks, mandatory add-ons, pricing and specialist routing.</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <B onClick={() => router.visit('/industries#gtext')}>I'm not sure</B>
                    <B v="pri" onClick={go}>Verify & Continue →</B>
                </div>
            </Card>
            <Modal title="Other / Specify sub-industry" open={other} onClose={() => setOther(false)}>
                <p className="text-[0.85rem]">Describe what you do. We never accept free-text classification — an analyst maps your description to one of the 56 controlled sub-industries and logs it in the Misdeclaration & Verification Queue.</p>
                <textarea rows={4} aria-label="Describe your sub-industry" className="mt-2 w-full rounded-[4px] border border-parchment-500 p-2 text-[0.85rem]" />
                <B v="pri" className="mt-2" onClick={() => { setOther(false); toast.show('Description submitted for classification · case opened in the verification queue'); }}>Submit for classification</B>
            </Modal>
            {toast.node}
        </PlainPage>
    );
}
