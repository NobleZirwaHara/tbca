import { Link, useForm } from '@inertiajs/react';
import { BarChart3, CalendarCheck, CheckCircle2, FileSearch, FileText, Flag, MessageCircle, ShieldCheck, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Box, Chip, Status } from '@/Components/Insights/Shared';
import { AccountNav, PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';

interface Props {
    threshold: number;
    used: number;
    usage: { templates: number; reports: number; checklists: number; guides: number; downloads: number };
    handoff: null | { reference: string; triggerType: string; triggered: string; resource: string | null; usage: Props['usage']; category: string; service: string; priority: string; status: string; booking: string | null };
}

export default function Handoff({ threshold, used, usage, handoff: h }: Props) {
    const form = useForm({ date: '', time: '10:00', channel: 'video' });
    const steps = [[FileSearch, '1. Resource Usage', 'You explore and use our resources'], [TrendingUp, '2. Handoff Trigger', 'Need identified or threshold reached'], [Users, '3. Expert Review', 'Our team reviews and engages'], [CheckCircle2, '4. Service Engagement', 'Professional service engagement begins']] as const;
    const current = !h ? 1 : h.status === 'booked' ? 4 : 2;

    return (
        <ResourceFrame title="Service-Line Handoff" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Service-Line Handoff' }]}>
            <AccountNav active="handoff" />
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <PageTitle title="Service-Line Handoff" intro="Seamless transitions between self-serve resources and professional advisory services. We ensure the right handoff, at the right time, to the right experts." />
                <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {steps.map(([I, t, s], i) => <li key={t} className="text-center"><I className={cn('mx-auto size-10 rounded-full border-2 p-2', i < current ? 'border-verified-500 text-verified-700' : 'border-parchment-400 text-ink-400')} /><p className="mt-1 text-xs font-semibold">{t}</p><p className="text-[0.6875rem] text-ink-500">{s}</p></li>)}
                </ol>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                    <Box title={<span className="font-serif text-lg">Your Handoff Journey</span>}>
                        {h ? (
                            <>
                                <div className="flex gap-3 rounded border border-verified-500/30 bg-verified-50 p-3"><CheckCircle2 className="size-6 text-verified-500" /><div><p className="font-semibold">Handoff Triggered</p><p className="text-xs">Based on your activity, we recommend professional support to help you move forward with confidence.</p></div></div>
                                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
                                    {[[Flag, 'Trigger Type', h.triggerType], [CalendarCheck, 'Date Triggered', h.triggered], [FileText, 'Resource Used', h.resource ?? '—'], [BarChart3, 'Usage Summary', `${h.usage.templates} templates, ${h.usage.reports} reports, ${h.usage.checklists} checklist${h.usage.checklists === 1 ? '' : 's'}`], [Users, 'Recommended Service', h.service]].map(([I, k, v]) => { const Icon = I as typeof Flag; return <div key={k as string}><Icon className="size-5 text-gold-700" /><dt className="mt-1 font-semibold">{k as string}</dt><dd className="text-ink-600">{v as string}</dd></div>; })}
                                </dl>
                            </>
                        ) : (
                            <div className="text-sm text-ink-600">
                                <p>No handoff yet. A handoff is raised automatically when your resource usage reaches the complexity threshold ({threshold} resources used).</p>
                                <div className="mt-3 h-2 rounded-full bg-parchment-300"><div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.min(100, (used / threshold) * 100)}%` }} /></div>
                                <p className="mt-1 text-xs">{used} of {threshold} · {usage.downloads} downloads recorded</p>
                                <Link href="/resources/library" className="mt-3 inline-block text-xs font-semibold text-gold-700">Browse resources →</Link>
                            </div>
                        )}
                    </Box>
                    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                        <Box title={<span className="font-serif text-lg">Recommended Next Steps</span>}>
                            <ol className="space-y-2 text-sm">{['Book a complimentary discovery call to discuss your needs.', 'Our expert will review your activity and prepare for the session.', 'Receive a tailored proposal with scope and fees.', 'Engage our team and start your advisory journey.'].map((s, i) => <li key={s} className="flex gap-2"><span className="flex size-6 shrink-0 items-center justify-center rounded bg-controlled-50 text-xs font-bold text-controlled-700">{i + 1}</span>{s}</li>)}</ol>
                        </Box>
                        <Box tone="blue" title="Why We Recommend This"><p className="text-xs">Your resource usage indicates that your requirements may benefit from expert analysis and customised advisory support.</p><Link href="/project-advisory" className="mt-2 inline-block text-xs font-semibold">Learn more about our advisory services →</Link></Box>
                    </div>
                    {h && h.status === 'ready_to_book' && (
                        <Box title="Book your discovery call">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Field label="Date" required error={form.errors.date}>{(id) => <Input id={id} type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />}</Field>
                                <Field label="Time" required error={form.errors.time}>{(id) => <Select id={id} value={form.data.time} onChange={(e) => form.setData('time', e.target.value)} options={['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00']} />}</Field>
                                <Field label="Mode" required error={form.errors.channel}>{(id) => <Select id={id} value={form.data.channel} onChange={(e) => form.setData('channel', e.target.value)} options={[{ value: 'video', label: 'Online (video)' }, { value: 'phone', label: 'Phone' }, { value: 'in-person', label: 'In-Person' }]} />}</Field>
                            </div>
                            <button type="button" disabled={form.processing} onClick={() => form.post('/resources/account/handoff/book', { preserveScroll: true })} className="mt-3 rounded bg-gold-500 px-4 py-2 text-sm font-bold">Book Discovery Call</button>
                        </Box>
                    )}
                    <p className="flex items-center gap-2 rounded-[8px] border border-gold-300 bg-gold-50 p-3 text-xs"><ShieldCheck className="size-5 text-gold-700" /><strong>Quality Assurance.</strong> Every handoff is reviewed by our quality team to ensure the right expertise is matched to your needs.</p>
                </div>
                <aside className="space-y-4">
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><ShoppingCart className="size-5" />Handoff Summary</span>}>
                        {h ? <dl className="space-y-2 text-xs">{[['Reference', h.reference], ['Service Category', h.category], ['Service Type', 'Advisory Session'], ['Estimated Duration', '60 – 90 minutes'], ['Engagement Mode', 'Online / In-Person']].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt>{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}<div className="flex justify-between"><dt>Priority Level</dt><dd><Status value={h.priority} /></dd></div><div className="flex justify-between"><dt>Status</dt><dd><Chip tone="green">{h.status === 'booked' ? `Booked · ${h.booking}` : 'Ready to Book'}</Chip></dd></div></dl> : <p className="text-xs text-ink-500">No handoff yet.</p>}
                    </Box>
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><CheckCircle2 className="size-5" />Quick Actions</span>}>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/sprints?category=business-management" className="flex items-center gap-2"><Users className="size-4" />View Recommended Services</Link></li>
                            <li><a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="flex items-center gap-2"><MessageCircle className="size-4" />Talk to an Advisor</a></li>
                            <li><Link href="/resources/account/library" className="flex items-center gap-2"><FileText className="size-4" />View My Activity Report</Link></li>
                        </ul>
                    </Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
