import { router } from '@inertiajs/react';
import { CalendarPlus, CheckCircle2, FileText, Lightbulb, Mail, MonitorPlay, NotebookPen, X } from 'lucide-react';
import { Avatar, HumanLed, Journey } from '@/Components/Aiim/EngagementKit';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    booking: { reference: string; date: string; time: string; duration: number; channel: string; status: string; topic: string | null; meta: Record<string, any> | null; ics: string };
    canChange: boolean;
}

export default function DiscoveryConfirmed({ engagement: e, booking: b, canChange }: Props) {
    const a = e.advisor;
    const calendar = `data:text/calendar;charset=utf-8,${encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${b.ics}\nDURATION:PT${b.duration}M\nSUMMARY:TBCA AIIM Discovery Session (${b.reference})\nEND:VEVENT\nEND:VCALENDAR`)}`;
    const rows: [string, string][] = [['Session type', 'Discovery Session'], ['Purpose', b.topic ?? '—'], ['Primary focus area', b.meta?.focus ?? '—'], ['Additional areas', (b.meta?.additional ?? []).join(', ') || '—'], ['Geographic focus', 'South Africa'], ['Session duration', `${b.duration} minutes`], ['Date', b.date], ['Time', b.time], ['Meeting method', 'Microsoft Teams (Online)'], ['Booking reference', b.reference]];
    return (
        <AiimPage
            title="Discovery Confirmation"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Advisor Services' }, { label: 'Discovery Confirmation' }]}
            heading={<><CheckCircle2 className="size-7 text-verified-500" /> Discovery Confirmation</>}
            subtitle="Your discovery session is confirmed."
            description="We look forward to speaking with you. A calendar invite and details have been sent to your email."
            accent="green"
            notice={<HumanLed text="Your session is with an experienced TBCA advisor. No AI-only advice." />}
            rail={<SelectionBox />}
        >
            <Journey e={e} />
            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard number={1} title="Your Session Details">
                    <dl className="space-y-1.5 text-xs">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
                    <a href={calendar} download={`aiim-discovery-${b.reference}.ics`} className="mt-3 flex items-center justify-center gap-1.5 rounded border border-parchment-500 py-2 text-xs font-semibold hover:border-ink-900"><CalendarPlus className="size-4" />Add to Calendar</a>
                </SectionCard>
                <SectionCard number={2} title="Your Advisor">
                    {a ? (
                        <div className="flex gap-3">
                            <Avatar name={a.name} size="lg" />
                            <div className="text-xs"><p className="text-base font-semibold">{a.name}</p><p className="text-referenced-700">{a.title}</p><p>{a.years} years advisory experience</p>
                                <ul className="mt-2 space-y-1">{a.strengths.map((s) => <li key={s} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{s}</li>)}</ul>
                            </div>
                        </div>
                    ) : <p className="text-sm">An advisor will be assigned shortly.</p>}
                </SectionCard>
                <SectionCard number={3} title="What Happens Next?">
                    <ul className="space-y-2 text-xs">{[[Mail, 'Calendar invite sent', 'Check your email for calendar invitation with joining details.'], [NotebookPen, 'Prepare for your session', "We've included suggested topics and questions to help you get the most from your session."], [MonitorPlay, 'Join session', 'Click the Microsoft Teams link in your invite at the scheduled time.'], [FileText, 'Session summary', 'You will receive a summary and recommended next steps after the call.']].map(([I, t, d]) => { const Icon = I as typeof Mail; return <li key={t as string} className="flex gap-2"><Icon className="size-4 shrink-0 text-referenced-500" /><span><strong className="block">{t as string}</strong>{d as string}</span></li>; })}</ul>
                </SectionCard>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <SectionCard number={4} title="Pre-Session Preparation">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <p className="text-xs text-ink-600">Make the most of your discovery session. Bring any project documents, key questions and your investment criteria.</p>
                        <div className="rounded bg-verified-50 p-3 text-xs"><p className="mb-1 flex items-center gap-1 font-semibold"><Lightbulb className="size-3.5" />Suggested Topics</p><ul className="list-disc pl-4">{['Market outlook and trends', 'Investment opportunities in South Africa', 'Regulatory and policy environment', 'Risk assessment and mitigation', 'Next steps and advisory support'].map((t) => <li key={t}>{t}</li>)}</ul></div>
                    </div>
                </SectionCard>
                <SectionCard number={5} title="Need to Reschedule?">
                    <p className="text-xs text-ink-600">If your plans change, you can reschedule or cancel your session up to 24 hours before the start time.</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" size="sm" disabled={!canChange} onClick={() => router.post(`/aiim/workspace/engagements/${e.reference}/discovery/cancel`, { reschedule: true })}><CalendarPlus className="size-4" />Reschedule</Button>
                        <Button type="button" variant="outline" size="sm" disabled={!canChange} onClick={() => confirm('Cancel this discovery session?') && router.post(`/aiim/workspace/engagements/${e.reference}/discovery/cancel`)} className="!border-risk-500 !text-risk-500"><X className="size-4" />Cancel Session</Button>
                    </div>
                    {!canChange && <p className="mt-2 text-[0.65rem] text-ink-400">Changes are closed within 24 hours of the session or after it has taken place.</p>}
                </SectionCard>
            </div>
        </AiimPage>
    );
}
