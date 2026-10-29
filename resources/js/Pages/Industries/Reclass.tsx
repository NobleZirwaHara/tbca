import { router } from '@inertiajs/react';
import { useState } from 'react';
import { B, Card, Chip, Cols, Dl, Modal, Note, StatusChip, TagM, TagS, saveState, useToast } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, WorkspacePage, dayS, nowS } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type R = Record<string, string | number | null>;
interface Props extends IndustryBase { prevRisk: number; newRisk: number; regChange: R[]; shock: { idx: number; rationale: string } | null; ack: string | null; stateKey: string; bw: boolean; inWorkspace: boolean }

const cat = (r: number) => (r >= 65 ? 'Category C · High risk' : r >= 45 ? 'Category B · Medium risk' : 'Category A · Low risk');

export default function Reclass(p: Props) {
    const { ind, ctx, prevRisk, newRisk } = p;
    const c = ctx.country;
    const [clar, setClar] = useState(false);
    const toast = useToast();
    const eff = new Date();
    eff.setDate(eff.getDate() + 7);
    const body = (
        <>
            <Head1 eyebrow="Mock-up Page 16 · scenario" title={<>Re-Classification Notice {p.ack ? <Chip t="Acknowledged" tone="ok" /> : <Chip t="Action required" tone="warn" />}</>}
                desc={`We reviewed new evidence and updated the classification for ${ind.name}${ctx.sub ? ` › ${ctx.sub.name}` : ''} (${c.name}). Please review and acknowledge.`} />
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-[6px] bg-ink-900 px-3 py-2.5 text-[0.76rem] text-parchment-300">
                <span>Notice ID <b className="text-white">RCN-{ind.code}-{c.iso3}-001</b></span><span>Issued <b className="text-white">{dayS()}</b></span><span>Effective <b className="text-white">{dayS(eff.toISOString())}</b></span>
            </div>
            <Cols>
                <Card title="Previous classification" icon="clock"><Dl rows={[['Category', cat(prevRisk)], ['Risk score', `${prevRisk}/100`], ['Confidence', 'Medium'], ['Basis', 'Modelled opportunity composite']]} /></Card>
                <Card title="New classification" icon="alert" tone="gold"><Dl rows={[['Category', <b>{cat(newRisk)}</b>], ['Risk score', <><b>{newRisk}/100</b> {newRisk > prevRisk && <Chip t={`+${newRisk - prevRisk}`} tone="bad" />}</>], ['Confidence', p.bw ? 'High' : 'Medium'], ['Effective from', dayS(eff.toISOString())]]} /></Card>
            </Cols>
            <Card title="Reason for re-classification" icon="file" sub={p.bw ? <TagS s="BW_RegChange / BW_Shocks" /> : <TagM />}>
                <ul className="list-disc space-y-1 ps-5 text-[0.82rem]">
                    {p.regChange.length ? p.regChange.map((r) => <li key={String(r.ID)}><b>{String(r.ID)}</b> {String(r.Change)} — {String(r.Impact)} <StatusChip s={r.Status} /></li>) : <li>Updated country evidence and regional policy signals <TagM /></li>}
                    {p.shock && <li>Shock exposure index {p.shock.idx} (BW_Shocks): {p.shock.rationale}</li>}
                </ul>
            </Card>
            <Card title="Impact" icon="layers">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[['Risk exposure', 'Risk score changed'], ['Due diligence', 'Enhanced DD may be required'], ['Partner matching', 'Recommendations may change'], ['Financing access', 'Terms and options may be affected']].map(([a, b]) => <div key={a}><b>{a}</b><div className="text-[0.8rem] text-ink-500">{b}</div></div>)}
                </div>
            </Card>
            {p.ack ? <Note><Chip t="Acknowledged" tone="ok" /> {nowS(p.ack)}</Note> : (
                <div className="flex flex-wrap gap-2">
                    <B v="pri" onClick={() => { void saveState(p.stateKey, true).then(() => router.reload({ only: ['ack'] })); }}>Acknowledge notice</B>
                    <B onClick={() => setClar(true)}>Request clarification</B>
                </div>
            )}
            <Modal title="Request clarification" open={clar} onClose={() => setClar(false)}>
                <textarea rows={4} aria-label="What would you like clarified?" placeholder="What would you like clarified?" className="w-full rounded-[4px] border border-parchment-500 p-2 text-[0.85rem]" />
                <B v="pri" className="mt-2" onClick={() => { setClar(false); toast.show('Clarification request sent to your TBCA Advisor'); }}>Send</B>
            </Modal>
            {toast.node}
        </>
    );
    return p.inWorkspace ? <WorkspacePage base={p} active="reclass" label="Re-Classification Notices">{body}</WorkspacePage> : <IndustryPage base={p} active="reclass">{body}</IndustryPage>;
}
