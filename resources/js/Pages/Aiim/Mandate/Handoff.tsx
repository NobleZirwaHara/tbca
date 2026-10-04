import { Link } from '@inertiajs/react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { ScoreRing } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { SectionCard } from '@/Components/Aiim/Shell';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    target: 'dd' | 'vdr' | 'project-advisory';
    handoff: { reference: string; status: string; packets: { name: string; description: string; items: number; included: boolean; updated: string }[]; summary: Record<string, any>; approved: string | null; requested: string } | null;
}

const NAMES = { dd: 'Due Diligence', vdr: 'Virtual Deal Room', 'project-advisory': 'Project Advisory' } as const;
const GUIDE = {
    dd: 'Ensure all verified data is complete and up to date before approving the handoff to Due Diligence.',
    vdr: 'This step prepares a secure, structured and non-duplicative handoff into the Virtual Deal Room for transaction execution.',
    'project-advisory': 'Ensure all verified project information is accurately transferred to the Project Advisory team for seamless execution.',
};

/** P60 / P61 / P62 — one template for the three downstream handoffs (G11 / G12 / G13). */
export default function Handoff({ engagement: e, target, handoff: h }: Props) {
    const name = NAMES[target];
    const [tab, setTab] = useState('Handoff Overview');
    const s = h?.summary ?? {};
    const steps = ['Package Prepared', 'Review Checklist', 'Compliance Check', 'Approvals', 'Transfer', 'Handoff Complete'];
    const approved = h?.status === 'approved';
    return (
        <MandateFrame
            e={e}
            title={`${name} Handoff`}
            description={`Prepare and approve the secure handoff of verified information, documents and insights to the ${name} ${target === 'vdr' ? '' : 'workspace'}.`}
            guidance={GUIDE[target]}
            stage={`${name} Handoff`}
            statusLabel={approved ? 'Completed' : 'Active'}
            progress={approved ? 100 : 0}
            tabs={['Handoff Overview', 'Information Package', 'Documents & Data', 'Access & Permissions', 'Handoff Checklist', 'Activity Log']}
            tab={tab}
            onTab={setTab}
            footer={<><p className="text-xs text-ink-500">By approving this handoff, you confirm that the information is accurate, verified and ready for {name}. Handoffs create a new downstream scope and never duplicate fees already earned in AIIM.</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled>Request Changes</Button><Button type="button" size="sm" variant="outline" disabled>Save for Later</Button><Button type="button" size="sm" disabled>Approve Handoff</Button></div></>}
        >
            <nav className="mb-4 flex flex-wrap gap-2" aria-label="Handoff targets">{(Object.keys(NAMES) as (keyof typeof NAMES)[]).map((t) => <Link key={t} href={`/aiim/workspace/engagements/${e.reference}/handoff/${t}`} className={cn('rounded-full border px-3 py-1 text-xs', t === target ? 'border-referenced-500 bg-referenced-500 text-white' : 'border-parchment-400 bg-white')}>{NAMES[t]}</Link>)}</nav>
            {!h ? <SectionCard><p className="text-sm">No handoff package has been prepared yet.</p></SectionCard> : (
                <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_15rem]">
                    <SectionCard title="Handoff Summary">
                        <dl className="space-y-1 text-xs">{[['Handoff ID', h.reference], ['From Workspace', 'AIIM Workspace'], ['To Workspace', s.to], ['Requested By', e.advisor?.name ?? '—'], ['Requested On', h.requested], [s.leadLabel, s.lead], ['Confidentiality Level', 'CONFIDENTIAL'], ['Information Packets', String(h.packets.length)], ['Documents', String(s.documents)], ['Data Assets', String(s.assets)], ['Insights', String(s.insights)], ['Handoff Status', h.status.replace('_', ' ').toUpperCase()], ['Gate', s.gate]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
                    </SectionCard>
                    <div className="space-y-4">
                        <SectionCard title="Handoff Progress"><ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">{steps.map((st, i) => <li key={st} className="text-center text-[0.65rem]"><span className={cn('mx-auto flex size-8 items-center justify-center rounded-full border-2', approved || i === 0 ? 'border-referenced-500 text-referenced-700' : 'border-parchment-500 text-ink-400')}>{i + 1}</span><span className="mt-1 block">{st}</span><span className="text-ink-500">{approved ? 'Done' : i === 0 ? '0%' : 'Pending'}</span></li>)}</ol></SectionCard>
                        <p className="flex gap-2 rounded-[8px] border border-attested-500/40 bg-attested-50 p-3 text-xs text-attested-700"><ShieldAlert className="size-5 shrink-0" /><span><strong className="block">Approval Required</strong>Please review the information package, checklist and permissions. Once approved, the {name} team will be notified and access will be granted securely.</span></p>
                        <SectionCard title="Information Package Summary">
                            <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">#</th><th className="text-left">Information Packet</th><th className="text-left">Description</th><th>Items</th><th>Last Updated</th><th>Included</th></tr></thead>
                                <tbody className="divide-y divide-parchment-300">{h.packets.map((p, i) => <tr key={p.name}><td className="py-1.5">{i + 1}</td><td>{p.name}</td><td className="text-ink-600">{p.description}</td><td className="text-center">{p.items}</td><td className="text-center">{p.updated}</td><td className="text-center">{p.included && <CheckCircle2 className="mx-auto size-4 text-verified-500" />}</td></tr>)}</tbody>
                            </table>
                        </SectionCard>
                    </div>
                    <SectionCard title="Handoff Readiness">
                        <div className="flex justify-center"><ScoreRing value={s.readiness ?? 90} size={110} /></div>
                        <ul className="mt-3 space-y-1 text-xs">{[['Information Complete', 'Yes'], ['Documents Verified', 'Yes'], ['Permissions Configured', 'Yes'], ['Compliance Check', approved ? 'Yes' : 'In Progress'], ['Approvals', approved ? 'Yes' : 'Pending']].map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><Chip tone={v === 'Yes' ? 'good' : 'warn'}>{v}</Chip></li>)}</ul>
                        <Link href={s.url ?? '/'} className="mt-3 block rounded border border-referenced-500 py-1.5 text-center text-xs font-semibold text-referenced-700">View {name} →</Link>
                    </SectionCard>
                </div>
            )}
        </MandateFrame>
    );
}
