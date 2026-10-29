import { router } from '@inertiajs/react';
import { useState } from 'react';
import { B, Card, Check, Chip, Field, Method, STable, TagP, TagS, Ticks, inputCls } from '@/Components/Industries/Kit';
import { Head1, NoEngagement, WorkspacePage, nowS } from '@/Components/Industries/Layout';
import type { Country, Engagement, IndustryBase, Regulator } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; country?: Country; regulator?: Regulator | null; cats?: string[] }

export default function PartnerRoute(p: Props) {
    const { e, country: c, ind } = p;
    const [cat, setCat] = useState(p.cats?.[0] ?? '');
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState('');
    if (!e || !c) return <WorkspacePage base={p} active="partner" label="Partner Route"><NoEngagement base={p} /></WorkspacePage>;
    const r0 = p.regulator;
    const els: [string, string, string, string][] = [
        ['Regulatory classification & permits', `Interpretation of ${ind.name.toLowerCase()} licensing and permit rules`, r0 ? `${r0.name}${r0.what !== '—' ? ` · ${r0.what}` : ''}` : 'Sector regulator', ind.code === 'AGR' ? 'Agricultural regulatory consultant' : 'Sector regulatory consultant'],
        ['Import duties & tax implications', 'Tax treatment and duty classification advice', `${c.name} customs & tax law ${c.vat === null ? '' : `(VAT ${c.vat} %)`}`, 'Registered tax practitioner'],
        ['Contract review (supplier / offtake agreements)', 'Legal review of commercial agreements', `${c.name} contract law`, `Legal practitioner (${c.name})`],
        ['Dispute resolution options', 'Advice on dispute-resolution mechanisms', 'Arbitration law · AfCFTA protocols', 'Dispute-resolution specialist'],
    ];

    return (
        <WorkspacePage base={p} active="partner" label="Partner Route">
            <Head1 eyebrow="Mock-up Page 23" title="Partner Attachment & Disclosure" desc="This engagement requires professional input. Review the professional route, confirm partner attachment and understand responsibilities." />
            <Card title="Why a Professional Route is Required" icon="scale">
                <p className="mb-3 text-[0.85rem]">This engagement contains scope elements that require professional judgement, interpretation or opinion under local law and practice. TBCA does not provide legal, tax, regulatory or professional opinions. We engage qualified independent partners to deliver those elements.</p>
                <Method items={['IDENTIFY NEED', 'ATTACH PARTNER', 'DISCLOSURE', 'REVIEW & CONFIRM', 'WORK BEGINS']} />
            </Card>
            <Card title="Engagement Scope Elements Requiring Professional Input" icon="layers" sub={c.iso3 === 'BWA' ? <TagS s="BW_Permits / BW_Institutions" /> : <><TagP /> named bodies confirmed by the country pack</>}>
                <STable head={['Scope element', 'Professional input', 'Applicable law / framework', 'Proposed profession', 'Status']} rows={els.map((r) => [<b className="text-[0.8rem]">{r[0]}</b>, <span className="text-[0.78rem]">{r[1]}</span>, <span className="text-[0.78rem]">{r[2]}</span>, r[3], <Chip t="Required" tone="bad" />])} />
            </Card>
            {e.partner ? (
                <Card title="Partner attached" icon="check"><p className="text-[0.88rem]"><Chip t="Attached" tone="ok" /> <b>{e.partner.cat}</b> · {nowS(e.partner.at)}. The partner firm contracts with you directly on the P ledger.</p></Card>
            ) : (
                <Card title="Attach a Professional Partner" icon="users" tone="gold">
                    <Field label="Partner category"><select className={inputCls} value={cat} onChange={(x) => setCat(x.target.value)}>{(p.cats ?? []).map((k) => <option key={k}>{k}</option>)}</select></Field>
                    <Check className="mt-2" checked={ok} onChange={setOk}><span className="text-[0.82rem]">I understand professional input is independent of TBCA, I contract the partner directly, and all fees are shown up front. I can change partner or withdraw at any time.</span></Check>
                    {err && <p role="alert" className="mt-1 text-[0.85rem] font-semibold text-risk-700">{err}</p>}
                    <B v="pri" className="mt-2" onClick={() => (ok ? router.post('/industries/engage/action', { do: 'partner', cat }, { preserveScroll: true }) : setErr('Acknowledge the professional route first'))}>Attach partner →</B>
                </Card>
            )}
            <Card title="What you receive from professionals" icon="file"><Ticks items={['Professional findings, with opinion where permitted', 'Authority & limitations statement', 'Independence statement', 'Confidential handling']} /></Card>
        </WorkspacePage>
    );
}
