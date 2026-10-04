import { Link } from '@inertiajs/react';
import { CalendarPlus, CheckCircle2, ChevronRight, FileText, Info, LayoutDashboard, Target } from 'lucide-react';
import { Stars } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import { Avatar, HumanLed, Journey } from '@/Components/Aiim/EngagementKit';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import type { AiimPageProps, Engagement } from '@/types/aiim';

export default function Outcome({ engagement: e }: AiimPageProps & { engagement: Engagement }) {
    const o = e.outcome ?? {};
    const r = e.reference;
    return (
        <AiimPage
            title="Discovery Outcome"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Advisor Services' }, { label: 'Discovery Outcome' }]}
            heading={<>Discovery Outcome <CheckCircle2 className="size-7 text-verified-500" /></>}
            subtitle="Thank you for meeting with your TBCA advisor."
            description="Here is a summary of your discovery session and the recommended next steps."
            accent="green"
            notice={<HumanLed text="Outcome provided by your TBCA advisor. No AI-only advice." />}
            rail={<SelectionBox />}
        >
            <Journey e={e} />
            <section className="mb-4 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-5">
                <div><p className="text-ink-500">Discovery Session</p><p className="font-semibold text-referenced-700">{e.booking}</p><p>Completed</p></div>
                <div><p className="text-ink-500">Date & Time</p><p className="font-semibold">{e.discoveryAt}</p></div>
                <div><p className="text-ink-500">Advisor</p>{e.advisor && <span className="flex items-center gap-2"><Avatar name={e.advisor.name} size="sm" /><span><strong className="block">{e.advisor.name}</strong><span className="text-referenced-700">{e.advisor.title}</span></span></span>}</div>
                <div><p className="text-ink-500">Session Duration</p><p className="font-semibold">{o.duration ?? 60} minutes</p></div>
                <div><p className="text-ink-500">Delivery Method</p><p className="font-semibold">{o.method ?? 'Microsoft Teams (Online)'}</p></div>
            </section>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SectionCard number={1} title="Key Discussion Points"><ul className="space-y-1.5 text-xs">{(o.points ?? []).map((p: string) => <li key={p} className="flex gap-1.5"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" />{p}</li>)}</ul></SectionCard>
                <SectionCard number={2} title="Your Objectives"><ul className="space-y-2 text-xs">{(o.objectives ?? []).map((p: string) => <li key={p} className="flex gap-1.5"><Target className="size-3.5 shrink-0 text-referenced-500" />{p}</li>)}</ul></SectionCard>
                <SectionCard title="Advisor Assessment">
                    <dl className="space-y-2 text-xs">{(o.assessment ?? []).map(([k, v, l]: [string, number, string]) => <div key={k}><dt className="font-semibold">{k}</dt><dd className="flex items-center gap-2"><Stars value={v} />{l}</dd></div>)}<div><dt className="font-semibold">Recommended Priority</dt><dd><Chip tone="good">{o.priority}</Chip></dd></div></dl>
                </SectionCard>
                <SectionCard number={4} title="Recommended Next Steps"><ol className="space-y-2 text-xs">{(o.next ?? []).map((p: string, i: number) => <li key={p} className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-referenced-500 text-[0.65rem] text-white">{i + 1}</span>{p}</li>)}</ol></SectionCard>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <SectionCard number={5} title="Attached Session Summary">
                    <p className="text-xs text-ink-600">A summary of your discovery session has been prepared.</p>
                    <button type="button" onClick={() => window.print()} className="mt-2 flex w-full items-center gap-2 rounded border border-parchment-400 p-2 text-left text-xs hover:border-gold-500"><FileText className="size-5 text-referenced-500" /><span><strong className="block">Discovery_Summary_{e.booking}.pdf</strong>PDF · 256 KB</span></button>
                </SectionCard>
                <SectionCard number={6} title="What would you like to do next?">
                    <ul className="grid gap-2 text-xs sm:grid-cols-2">
                        {[[FileText, 'View Formal Quotation', 'Review the tailored proposal and pricing.', `/aiim/workspace/engagements/${r}/quote`], [CalendarPlus, 'Book Follow-up Call', 'Schedule another session with your advisor.', `/aiim/workspace/engagements/${r}/discovery`], [Info, 'Provide Additional Information', 'Share more details to refine your proposal.', `/aiim/workspace/engagements/${r}`], [LayoutDashboard, 'Return to My Workspace', 'Go back to your dashboard and workspace.', '/aiim/workspace']].map(([I, t, d, h]) => {
                            const Icon = I as typeof Info;
                            const disabled = t === 'View Formal Quotation' && !e.quote;
                            return <li key={t as string}><Link href={h as string} className={`flex items-center gap-2 rounded border border-parchment-400 p-2 hover:border-referenced-500 ${disabled ? 'pointer-events-none opacity-50' : ''}`}><Icon className="size-4 text-referenced-500" /><span className="flex-1"><strong className="block">{t as string}</strong>{disabled ? 'Your advisor is preparing the quotation.' : d as string}</span><ChevronRight className="size-4" /></Link></li>;
                        })}
                    </ul>
                </SectionCard>
            </div>
        </AiimPage>
    );
}
