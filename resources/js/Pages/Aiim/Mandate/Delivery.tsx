import { CheckCircle2, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import { SectionCard } from '@/Components/Aiim/Shell';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    delivery: { id: string; type: string; version: string; quality: number; outputs: [string, string, string][]; checks: [string, string][] };
    deliveredOn: string;
    window: string;
}

export default function Delivery({ engagement: e, delivery: d, deliveredOn, window: closes }: Props) {
    const [tab, setTab] = useState('Acceptance Overview');
    const [option, setOption] = useState('accept');
    const balance = e.fee - (e.depositPaid ? e.deposit : 0);
    return (
        <MandateFrame
            e={e}
            title="Delivery Acceptance"
            description="Review and accept the delivered outputs for this mandate. Your acceptance will finalise this stage and trigger the next steps."
            guidance="Review the delivered outputs and supporting evidence. Accept, request changes or raise a query before final acceptance."
            stage="Delivery Acceptance"
            statusLabel="Active"
            progress={100}
            tabs={['Acceptance Overview', 'Delivered Outputs', 'Quality & Compliance', 'Commercial Summary', 'Activity Log']}
            tab={tab}
            onTab={setTab}
            footer={<><p className="text-xs text-ink-500">By accepting this delivery, you confirm that the outputs meet your requirements and you authorise TBCA to finalise this stage (G5). The final invoice is then issued for the balance.</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled>Save for Later</Button><Button type="button" size="sm" disabled>{option === 'accept' ? 'Accept Delivery' : option === 'changes' ? 'Request Changes' : 'Raise Query'}</Button></div></>}
        >
            <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_16rem]">
                <div className="space-y-4">
                    <SectionCard title="Delivery Summary"><dl className="space-y-1 text-xs">{[['Delivery ID', d.id], ['Delivered On', deliveredOn], ['Delivered By', `TBCA (${e.advisor?.name ?? 'Advisor'})`], ['Delivery Type', d.type], ['Delivery Version', d.version], ['Quality Status', 'Passed'], ['Confidentiality Level', 'CONFIDENTIAL'], ['Acceptance Window', `Closes on ${closes}`]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl></SectionCard>
                    <SectionCard title="Acceptance Options">
                        <div role="radiogroup" className="space-y-2 text-xs">{[['accept', 'Accept Delivery', 'Accept all delivered outputs as complete'], ['changes', 'Request Changes', 'Request revisions or additional information'], ['query', 'Raise a Query', 'Raise a query or seek clarification']].map(([k, t, s]) => <label key={k} className="flex gap-2"><input type="radio" name="opt" checked={option === k} onChange={() => setOption(k)} className="mt-0.5 accent-referenced-500" /><span><strong className="block">{t}</strong>{s}</span></label>)}</div>
                    </SectionCard>
                </div>
                <div className="space-y-4">
                    <p className="flex gap-2 rounded-[8px] border border-verified-500/40 bg-verified-50 p-3 text-xs text-verified-700"><CheckCircle2 className="size-5" /><span><strong className="block">All Deliverables Ready for Acceptance</strong>All mandatory deliverables have been completed and quality checks passed.</span></p>
                    <SectionCard title="Delivered Outputs">
                        <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">#</th><th className="text-left">Deliverable</th><th className="text-left">Description</th><th>Format</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">{d.outputs.map(([n, desc, f], i) => <tr key={n}><td className="py-1.5">{i + 1}</td><td className="font-semibold text-referenced-700">{n}</td><td className="text-ink-600">{desc}</td><td className="text-center">{f}</td><td className="text-center"><Chip tone="good">Completed</Chip></td><td className="text-center"><button type="button" onClick={() => window.print()} aria-label={`Open ${n}`}>{f === 'PDF' ? <Eye className="size-4" /> : <Download className="size-4" />}</button></td></tr>)}</tbody>
                        </table>
                    </SectionCard>
                    <SectionCard title="Quality & Compliance Check"><ul className="grid gap-2 text-xs sm:grid-cols-2">{d.checks.map(([t, s]) => <li key={t} className="flex justify-between gap-2"><span><strong className="block">{t}</strong>{s}</span><CheckCircle2 className="size-4 text-verified-500" /></li>)}<li><strong>Overall Quality Score</strong> <Chip tone="good">{d.quality}%</Chip></li></ul></SectionCard>
                </div>
                <SectionCard title="Commercial Summary (ex. VAT)">
                    <dl className="space-y-1 text-xs"><div className="flex justify-between"><dt>Total Engagement Value</dt><dd>{zar2(e.fee)}</dd></div><div className="flex justify-between"><dt>Deposit Paid</dt><dd className="text-verified-700">{zar2(e.depositPaid ? e.deposit : 0)}</dd></div><div className="flex justify-between border-t border-parchment-300 pt-1 text-sm font-bold"><dt>Balance Due</dt><dd className="text-referenced-700">{zar2(balance)}</dd></div></dl>
                    <ul className="mt-3 space-y-1 text-xs">{['Final invoice will be issued for balance payment.', 'Advisory team will remain available for handover.', 'You can proceed to Due Diligence or VDR.', 'All outputs will be stored in your workspace.'].map((t, i) => <li key={t} className="flex gap-1.5"><span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-referenced-500 text-[0.6rem] text-white">{i + 1}</span>{t}</li>)}</ul>
                </SectionCard>
            </div>
        </MandateFrame>
    );
}
