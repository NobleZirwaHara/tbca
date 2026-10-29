import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { B, Card, Cols, Field, Note, inputCls, useMoney } from '@/Components/Industries/Kit';
import { GateGrid, Head1, IndustryPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Opt = { code: string; name: string; tiers: Record<string, number>; entry: string | null };
interface Props extends IndustryBase { opts: Opt[]; pre: string | null; existing: string | null; gates: [string, string, string][] }

export default function Engage(p: Props) {
    const { ind, ctx, opts } = p;
    const money = useMoney();
    const [code, setCode] = useState(p.pre ?? opts[0]?.code ?? '');
    const s = opts.find((o) => o.code === code) ?? opts[0];
    const tiersOf = (o?: Opt) => (o ? Object.keys(o.tiers) : []);
    const [tier, setTier] = useState(s ? (tiersOf(s).includes(s.entry ?? '') ? (s.entry as string) : tiersOf(s)[0]) : 'Standard');
    const [sub, setSub] = useState(ctx.sub?.code ?? '');
    const [iso, setIso] = useState(ctx.country.iso3);
    const [busy, setBusy] = useState(false);

    return (
        <IndustryPage base={p} active="engage">
            <Head1 eyebrow="Start an Engagement" title={`Start an engagement · ${ind.name}`} desc="Choose the Sprint, tier, sub-industry and country. The engagement then passes the consent, registration, disclosure, quotation and payment gates." />
            {p.existing && <Note>You already have engagement <b>{p.existing}</b>. Creating a new one replaces it. <Link href="/industries/workspace" className="underline">Open the current workspace →</Link></Note>}
            <Card title="Engagement set-up" icon="brief">
                {s ? (
                    <>
                        <Cols>
                            <Field label="Sprint"><select className={inputCls} value={code} onChange={(e) => { const o = opts.find((x) => x.code === e.target.value); setCode(e.target.value); if (o) setTier(tiersOf(o).includes(o.entry ?? '') ? (o.entry as string) : tiersOf(o)[0]); }}>{opts.map((o) => <option key={o.code} value={o.code}>{o.name} · {o.code}</option>)}</select></Field>
                            <Field label="Tier"><select className={inputCls} value={tier} onChange={(e) => setTier(e.target.value)}>{tiersOf(s).map((t) => <option key={t}>{t}</option>)}</select></Field>
                            <Field label="Sub-industry"><select className={inputCls} value={sub} onChange={(e) => setSub(e.target.value)}><option value="">Not selected</option>{ind.subs.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}</select></Field>
                            <Field label="Country (54 activated)"><select className={inputCls} value={iso} onChange={(e) => setIso(e.target.value)}>{p.countries.map((x) => <option key={x.iso3} value={x.iso3}>{x.name}</option>)}</select></Field>
                        </Cols>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div>Price <b className="text-[1.3rem]">{money(s.tiers[tier])}</b> <span className="text-[0.72rem] text-ink-400">catalogue · ex VAT</span></div>
                            <B v="pri" disabled={busy} onClick={() => { setBusy(true); router.post(`/industries/${ind.slug}/engage`, { sprint: code, tier, sub, iso }, { onFinish: () => setBusy(false) }); }}>Create engagement & open gates →</B>
                        </div>
                    </>
                ) : <p className="text-[0.85rem] text-ink-400">No priced Sprints are available for this industry yet.</p>}
            </Card>
            <Card title="What happens next" icon="layers"><GateGrid gates={p.gates} done={{}} /></Card>
        </IndustryPage>
    );
}
