import { Link } from '@inertiajs/react';
import { BadgeCheck, CheckCircle2, Circle, Clock, Download, FileText, Info, XCircle } from 'lucide-react';
import { Donut } from '@/Components/Aiim/Charts';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { FeeSummary } from '@/Components/Aiim/FeeTable';
import { zar2 } from '@/Components/Aiim/format';
import { SectionCard } from '@/Components/Aiim/Shell';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Engagement, Totals } from '@/types/aiim';

interface Item {
    code: string; name: string; description: string; recommendation: string; selected: boolean; supplier: string; purpose: string; basis: string;
    supplier_cost_zar: number; expert_fee_zar: number; timeline: string; cost_approved: boolean; status: string; owner: string; confidence: string | null; material_issues: number; started: string | null; eta: string | null;
}

interface Props extends AiimPageProps {
    engagement: Engagement;
    view: 'scope' | 'costs' | 'progress' | 'report';
    items: Item[];
    scope: Totals & { count: number; external: number };
    approved: Totals & { count: number; external: number };
    adminRate: number;
    tolerance: number;
}

const VIEWS: [Props['view'], string][] = [['scope', 'Verification Scope'], ['costs', 'External Cost Approval'], ['progress', 'Verification Progress'], ['report', 'Verification Report']];

function ViewNav({ r, view }: { r: string; view: string }) {
    return (
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Verification stages">
            {VIEWS.map(([k, l], i) => <Link key={k} href={`/aiim/workspace/engagements/${r}/verification/${k}`} className={cn('rounded-full border px-3 py-1 text-xs font-medium', view === k ? 'border-referenced-500 bg-referenced-500 text-white' : 'border-parchment-400 bg-white')}>{i + 1}. {l}</Link>)}
        </nav>
    );
}

export default function Verification({ engagement: e, view, items, scope, approved, adminRate, tolerance }: Props) {
    const sel = items.filter((i) => i.selected);
    const count = (s: string) => sel.filter((i) => i.status === s).length;
    const done = sel.filter((i) => ['completed', 'verified'].includes(i.status)).length;
    const pct = sel.length ? Math.round(((done + count('in_progress') * 0.5) / sel.length) * 100) : 0;
    const allDone = sel.length > 0 && done === sel.length;
    const title = VIEWS.find((v) => v[0] === view)![1];
    const guidance = {
        scope: 'Select the verification items that are relevant to your project and risk profile. You can refine scope at any time before external cost approval.',
        costs: 'External costs are charges by third-party authorities and data providers. TBCA does not profit from these costs beyond the disclosed administration margin. Approve only those you authorise.',
        progress: 'Verification is underway. You will be notified as each item is completed or if additional information is required.',
        report: 'Verification is complete. Review the findings and use the report for decision-making and transaction preparation.',
    }[view];

    return (
        <MandateFrame
            e={e}
            title={title}
            description={{ scope: 'Define the verification scope and select the checks required for this engagement.', costs: 'Review and approve external supplier costs required for verification.', progress: 'Track the status of verification activities as tasks are completed by TBCA experts and external authorities.', report: 'Comprehensive report of verification activities completed for this engagement.' }[view]}
            guidance={guidance}
            stage="Verification & Validation"
            statusLabel={view === 'report' && allDone ? 'Completed' : 'In Progress'}
            progress={view === 'report' && allDone ? 100 : pct}
            footer={
                view === 'scope' ? <><p className="text-xs text-ink-500">Verification follows TBCA Verification Standards and POPIA compliant processes.</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled>Save Scope Draft</Button><Link href={`/aiim/workspace/engagements/${e.reference}/verification/costs`} className="rounded bg-gold-500 px-3 py-2 text-xs font-semibold text-ink-900">Continue to External Cost Approval →</Link></div></>
                : view === 'costs' ? <><p className="text-xs text-ink-500">External costs stop at the approved total; overruns above {tolerance * 100}% need re-approval (G9).</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled>Request Changes / Clarification</Button><Button type="button" size="sm" disabled>Approve Selected Costs</Button></div></>
                : undefined
            }
        >
            <ViewNav r={e.reference} view={view} />
            {view === 'scope' && (
                <div className="grid gap-4 xl:grid-cols-3">
                    <SectionCard number={1} title="Select Verification Items">
                        <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Verification Item</th><th>Recommended</th><th>Select</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">{items.map((i) => <tr key={i.code}><td className="py-1.5"><strong className="block">{i.name}</strong><span className="text-ink-500">{i.description}</span></td><td className="text-center"><Chip tone={i.recommendation === 'High' ? 'bad' : i.recommendation === 'Medium' ? 'warn' : 'good'}>{i.recommendation}</Chip></td><td className="text-center"><input type="checkbox" checked={i.selected} readOnly aria-label={`Select ${i.name}`} className="accent-referenced-500" /></td></tr>)}</tbody>
                        </table>
                        <p className="mt-2 text-[0.65rem] text-ink-500">High = Strongly recommended · Medium = Recommended · Low = Optional</p>
                    </SectionCard>
                    <SectionCard number={2} title="Basis of Verification">
                        <ul className="space-y-2 text-xs">{Array.from(new Set(items.map((i) => i.basis))).map((b) => <li key={b} className="rounded border border-parchment-300 p-2"><strong className="block">{b}</strong><span className="text-ink-500">Source: {items.filter((i) => i.basis === b).map((i) => i.supplier).join(', ')}</span></li>)}</ul>
                    </SectionCard>
                    <SectionCard number={3} title="Scope Summary">
                        <p className="mb-2 text-sm">Selected Items: <strong>{scope.count}</strong></p>
                        <FeeSummary {...scope} totalLabel="Estimated Total (incl. VAT)" />
                        <p className="mt-2 flex gap-1 text-xs text-ink-500"><Clock className="size-3.5" />Estimated turnaround: 5 to 20 business days from approval of external costs and data receipt.</p>
                    </SectionCard>
                </div>
            )}
            {view === 'costs' && (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
                    <SectionCard title="External Supplier Cost Breakdown">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[44rem] text-xs">
                                <thead className="text-ink-500"><tr>{['#', 'Verification Item', 'Supplier / Authority', 'Purpose', 'Supplier Cost (ex. VAT)', 'VAT (15%)', 'Total (incl. VAT)', 'Expected Timeline', 'Approve'].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {sel.map((i, n) => <tr key={i.code}><td className="px-2 py-1.5">{n + 1}</td><td className="px-2">{i.name}</td><td className="px-2">{i.supplier}</td><td className="px-2">{i.purpose}</td><td className="px-2 text-right">{zar2(i.supplier_cost_zar)}</td><td className="px-2 text-right">{zar2(i.supplier_cost_zar * 0.15)}</td><td className="px-2 text-right">{zar2(i.supplier_cost_zar * 1.15)}</td><td className="px-2">{i.timeline}</td><td className="px-2 text-center">{i.cost_approved ? <CheckCircle2 className="mx-auto size-4 text-verified-500" /> : <Circle className="mx-auto size-4 text-ink-300" />}</td></tr>)}
                                    <tr className="bg-referenced-50 font-semibold"><td colSpan={4} className="px-2 py-1.5">Total External Supplier Costs</td><td className="px-2 text-right">{zar2(scope.external)}</td><td className="px-2 text-right">{zar2(scope.external * 0.15)}</td><td className="px-2 text-right">{zar2(scope.external * 1.15)}</td><td colSpan={2} /></tr>
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                    <SectionCard title="Cost Summary (Indicative)">
                        <FeeSummary {...approved} totalLabel="Estimated Total (incl. VAT)" />
                        <p className="mt-2 rounded bg-attested-50 p-2 text-xs text-attested-700">TBCA administration on external costs is a disclosed {adminRate * 100}% margin. External supplier costs are payable directly to suppliers once approved.</p>
                    </SectionCard>
                </div>
            )}
            {view === 'progress' && (
                <div className="grid gap-4 xl:grid-cols-[16rem_minmax(0,1fr)]">
                    <SectionCard title="Verification Progress Overview">
                        <Donut centre={`${pct}%`} sub="Overall Progress" data={[{ label: `Completed (${done}/${sel.length})`, value: done }, { label: `In Progress (${count('in_progress')})`, value: count('in_progress') }, { label: `Pending (${count('pending')})`, value: count('pending') }, { label: `Blocked (${count('blocked')})`, value: count('blocked') }]} size={120} />
                    </SectionCard>
                    <SectionCard title="Verification Items Status">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-xs"><thead className="text-ink-500"><tr>{['#', 'Verification Item', 'Status', 'Source / Authority', 'Started', 'ETA', 'Owner'].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">{items.map((i, n) => <tr key={i.code}><td className="px-2 py-1.5">{n + 1}</td><td className="px-2">{i.name}</td><td className="px-2"><Chip tone={levelTone(i.selected ? i.status : 'not selected')}>{i.selected ? i.status.replace('_', ' ') : 'not selected'}</Chip></td><td className="px-2">{i.supplier}</td><td className="px-2">{i.started ?? '–'}</td><td className="px-2">{i.eta ?? '–'}</td><td className="px-2">{i.owner}</td></tr>)}</tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>
            )}
            {view === 'report' && (
                <div className="grid gap-4 xl:grid-cols-3">
                    <SectionCard title="Executive Summary">
                        <dl className="space-y-1.5 text-xs">{[['Overall Verification Outcome', allDone ? 'VERIFIED' : 'IN PROGRESS'], ['Verification Items Completed', `${done} of ${sel.length}`], ['Overall Confidence Level', 'High'], ['Material Issues Identified', String(sel.reduce((s, i) => s + i.material_issues, 0))], ['Items Requiring Monitoring', String(sel.filter((i) => i.confidence === 'Medium').length)], ['Report Reference', `VRPT-${e.mandate ?? e.reference}`]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
                        <p className="mt-3 rounded bg-attested-50 p-2 text-[0.65rem] text-attested-700">This report is based on information provided by the client, third-party authorities and data providers. It does not constitute legal or investment advice.</p>
                    </SectionCard>
                    <SectionCard title="Verification Items Summary">
                        <ul className="space-y-1.5 text-xs">{sel.map((i) => <li key={i.code} className="flex items-center justify-between gap-2"><span>{i.name}</span><span className="flex items-center gap-1.5">{['completed', 'verified'].includes(i.status) ? <Chip tone="good">Verified</Chip> : <Chip tone="warn">{i.status.replace('_', ' ')}</Chip>}<Chip tone={i.confidence === 'High' ? 'good' : 'warn'}>{i.confidence}</Chip>{i.material_issues ? <XCircle className="size-4 text-risk-500" /> : <BadgeCheck className="size-4 text-verified-500" />}</span></li>)}</ul>
                    </SectionCard>
                    <SectionCard title="Report Documents">
                        <ul className="space-y-1.5 text-xs">{['Executive Summary', 'Detailed Findings Report', 'Evidence Index', 'Certificate of Verification', 'Verification Methodology', 'Data Source Appendix'].map((d) => <li key={d} className="flex items-center justify-between rounded border border-parchment-300 p-1.5"><span className="flex items-center gap-1.5"><FileText className="size-3.5 text-referenced-500" />{d}</span><button type="button" disabled={!allDone} onClick={() => window.print()} aria-label={`Download ${d}`} className="disabled:opacity-30"><Download className="size-4" /></button></li>)}</ul>
                        <p className="mt-3 flex gap-1 rounded bg-controlled-50 p-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" />{allDone ? 'All verification activities are complete. You may proceed with transaction preparation or handover.' : 'Documents unlock when all selected items are verified.'}</p>
                    </SectionCard>
                </div>
            )}
        </MandateFrame>
    );
}
