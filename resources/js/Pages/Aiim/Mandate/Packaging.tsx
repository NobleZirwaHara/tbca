import { Check, CheckCircle2, FileText } from 'lucide-react';
import { useState } from 'react';
import { Gauge } from '@/Components/Aiim/Charts';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { SectionCard } from '@/Components/Aiim/Shell';
import { Progress } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Data {
    project: [string, string][]; health: number; steps: [string, string][];
    workstreams: { name: string; status: string; lead: string; due: string; completion: number }[];
    insights: string[]; next: string[];
}

const TABS = ['Packaging Overview', 'Investment Case', 'Financials', 'Risk & Mitigation', 'Value Proposition', 'Documents', 'Stakeholders', 'Activity Log'];

export default function Packaging({ engagement: e, data: d }: AiimPageProps & { engagement: Engagement; data: Data }) {
    const [tab, setTab] = useState(TABS[0]);
    const pct = Math.round(d.workstreams.reduce((s, w) => s + w.completion, 0) / d.workstreams.length);
    return (
        <MandateFrame
            e={e}
            title="Project Packaging Workspace"
            description="Structure, package and prepare the project for investor and financier engagement."
            guidance="Use AI to structure the investment case, refine financials and identify value-adding enablers for a bankable project package."
            stage="Project Packaging"
            progress={pct}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
            footer={<><ol className="flex flex-wrap gap-3 text-xs">{d.next.map((n, i) => <li key={n} className="flex items-center gap-1.5"><span className="flex size-5 items-center justify-center rounded-full bg-referenced-500 text-white">{i + 1}</span>{n}</li>)}</ol><ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline">Request Expert Support</ButtonLink></>}
        >
            {tab === 'Packaging Overview' ? (
                <div className="grid gap-4 xl:grid-cols-[16rem_minmax(0,1fr)_16rem]">
                    <div className="space-y-4">
                        <SectionCard title="Project Summary"><dl className="space-y-1 text-xs">{d.project.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></SectionCard>
                        <SectionCard title="Packaging Health Score"><Gauge dark={false} value={d.health} label="Good" /><p className="mt-1 text-[0.65rem] text-ink-500">Readiness of the package for investor and financier engagement.</p></SectionCard>
                    </div>
                    <div className="space-y-4">
                        <SectionCard title="Packaging Progress">
                            <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">{d.steps.map(([s, st]) => <li key={s} className="text-center text-[0.65rem]"><span className={cn('mx-auto flex size-8 items-center justify-center rounded-full border-2', st === 'completed' ? 'border-verified-500 bg-verified-500 text-white' : st === 'in_progress' ? 'border-referenced-500 text-referenced-700' : 'border-parchment-500 text-ink-400')}>{st === 'completed' ? <Check className="size-4" /> : '•'}</span><span className="mt-1 block font-medium">{s}</span><span className="text-ink-500">{st.replace('_', ' ')}</span></li>)}</ol>
                        </SectionCard>
                        <SectionCard title="Key Packaging Workstreams">
                            <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Workstream</th><th>Status</th><th>Lead</th><th>Completion</th></tr></thead>
                                <tbody className="divide-y divide-parchment-300">{d.workstreams.map((w) => <tr key={w.name}><td className="py-1.5">{w.name}</td><td className="text-center"><Chip tone={levelTone(w.status.replace('_', ' '))}>{w.status.replace('_', ' ')}</Chip></td><td className="text-center">{w.lead}</td><td><div className="flex items-center gap-2"><Progress value={w.completion} className="w-20" />{w.completion}%</div></td></tr>)}</tbody>
                            </table>
                        </SectionCard>
                    </div>
                    <div className="space-y-4">
                        <SectionCard title="AI Insights & Recommendations"><ul className="space-y-2 text-xs">{d.insights.map((i) => <li key={i} className="flex gap-1.5"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" />{i}</li>)}</ul></SectionCard>
                        <SectionCard title="Next Key Deliverable"><p className="flex gap-2 text-xs"><FileText className="size-8 text-referenced-500" /><span><strong className="block text-sm">Investment Memorandum (First Draft)</strong>Comprehensive document presenting the investment case, financials and risks.</span></p><Chip tone="warn" className="mt-2">Pending</Chip></SectionCard>
                    </div>
                </div>
            ) : (
                <SectionCard title={tab}><p className="text-sm text-ink-600">{tab} materials are compiled by the packaging workstreams above and published here as each workstream completes.</p></SectionCard>
            )}
        </MandateFrame>
    );
}
