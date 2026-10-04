import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Calendar, Check, Clock, HelpCircle, Info, Lock, Mail, Navigation, PlayCircle, RotateCcw, Trophy, User } from 'lucide-react';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import { Box, Chip, DynIcon, Notice } from '@/Components/Insights/Shared';
import { ResourceFrame } from '@/Components/Insights/Resources';
import type { WebinarCard } from '@/types/insights';

export default function WebinarReplay({ webinar: w, hasAccess, upcoming }: { webinar: WebinarCard; hasAccess: boolean; upcoming: boolean }) {
    const [mode, setMode] = useState<'email' | 'token'>('email');
    const form = useForm({ mode: 'email', email: '', token: '', remember: false });
    const submit = () => { form.transform((d) => ({ ...d, mode })); form.post(`/resources/webinars/${w.slug}/replay`, { preserveScroll: true }); };
    const err = form.errors as Record<string, string>;

    return (
        <ResourceFrame title={`Replay – ${w.title}`} crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Webinars', href: '/resources/webinars' }, { label: 'Webinar Replay' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                    <h1 className="flex items-center gap-2 font-serif text-3xl font-bold text-ink-900">Webinar Replay <Lock className="size-6 text-ink-500" /></h1>
                    <p className="text-sm text-ink-600">This replay is available to registered attendees and approved users.</p>
                    <Box>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex size-28 shrink-0 items-center justify-center rounded bg-ink-950"><DynIcon name={w.icon} className="size-14 text-gold-400" /></div>
                            <div><h2 className="font-serif text-xl font-semibold">{w.title}</h2><p className="text-sm text-ink-600">{w.tagline}</p>
                                <div className="mt-3 flex flex-wrap gap-5 text-xs"><span className="flex items-center gap-1.5"><Calendar className="size-4" /><span><strong className="block">Originally Live</strong>{w.date}</span></span><span className="flex items-center gap-1.5"><Clock className="size-4" /><span><strong className="block">Duration</strong>{w.durationMinutes} min</span></span><span className="flex items-center gap-1.5"><User className="size-4" /><span><strong className="block">Speaker</strong>{w.speaker} · {w.speakerRole}</span></span><Chip>{w.topic}</Chip></div>
                            </div>
                        </div>
                    </Box>
                    {upcoming ? (
                        <Notice tone="blue" action={<Link href={`/resources/webinars/${w.slug}/register`} className="rounded border bg-white px-3 py-1 text-xs font-semibold">Register</Link>}>This session has not happened yet. The replay is published after the live session on {w.date}.</Notice>
                    ) : hasAccess ? (
                        <div className="overflow-hidden rounded-[8px] border border-parchment-400 bg-ink-950">
                            <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(214,163,46,0.25),transparent)] text-parchment-100">
                                <PlayCircle className="size-16 text-gold-400" />
                                <p className="font-serif text-lg">{w.title} — On-Demand</p>
                                <p className="text-xs text-ink-300">{w.durationMinutes} minutes · {w.replayVersion} · Presentation, Q&A and resource pack</p>
                            </div>
                            <div className="flex flex-wrap gap-2 bg-white p-3 text-xs"><Link href="/resources/library" className="rounded border px-3 py-1">Download resource pack</Link><Link href="/resources/free-diagnostic" className="rounded border px-3 py-1">Apply it: free diagnostic</Link></div>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
                            <Box tone="blue" title={<span className="flex items-center gap-2"><Info className="size-5" />Access Required</span>}><p className="text-xs">Please confirm your registration email to watch this replay. This replay is the on-demand version recorded from the live session.</p></Box>
                            <Box title={<span className="font-serif text-lg">{mode === 'email' ? 'Enter Your Registered Email' : 'Enter Your Access Link Code'}</span>}>
                                <p className="-mt-2 mb-3 text-xs text-ink-500">We'll send you a secure link to access the replay.</p>
                                {mode === 'email' ? (
                                    <Field label="Registered Email Address" required error={err.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="name@company.co.za" />}</Field>
                                ) : (
                                    <Field label="Access code from your link" required error={err.token}>{(id) => <Input id={id} value={form.data.token} onChange={(e) => form.setData('token', e.target.value)} />}</Field>
                                )}
                                <Checkbox className="mt-2" label="Remember me on this device for 30 days" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} />
                                <button type="button" onClick={submit} disabled={form.processing} className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-gold-500 py-2 text-sm font-bold"><Mail className="size-4" /> {mode === 'email' ? 'Send Access Link' : 'Access Replay'}</button>
                                <p className="my-2 text-center text-xs text-ink-400">OR</p>
                                <button type="button" onClick={() => setMode(mode === 'email' ? 'token' : 'email')} className="flex w-full items-center justify-center gap-2 rounded border border-parchment-500 py-2 text-sm"><Lock className="size-4" /> {mode === 'email' ? 'Already have a Link? Access Replay' : 'Use my registered email instead'}</button>
                                <p className="mt-3 text-center text-[0.6875rem] text-ink-500">Secure. Private. No spam. Your details are never shared.</p>
                                <p className="mt-1 text-center text-[0.6875rem]">Not registered? <Link href={`/resources/webinars/${w.slug}/register`} className="text-gold-700 underline">Register first</Link></p>
                            </Box>
                        </div>
                    )}
                </div>
                <aside className="space-y-4">
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><PlayCircle className="size-5" />Replay Information</span>}>
                        <dl className="space-y-1.5 text-xs">{[['Format', 'On-Demand Replay'], ['Recorded', w.date], ['Length', `${w.durationMinutes} minutes`], ['Includes', 'Presentation, Q&A and resource pack'], ['Version', w.replayVersion]].map(([k, v]) => <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-2"><dt className="text-ink-500">{k}:</dt><dd className="font-medium">{v}</dd></div>)}<div className="grid grid-cols-[5.5rem_1fr] gap-2"><dt className="text-ink-500">Currentness:</dt><dd><Chip tone="green">Current</Chip> (Review due: {w.reviewDue})</dd></div></dl>
                    </Box>
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><Trophy className="size-5" />What You'll Gain</span>}><ul className="space-y-1 text-xs">{w.gains.map((g) => <li key={g} className="flex gap-1.5"><Check className="size-3.5" />{g}</li>)}</ul></Box>
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><HelpCircle className="size-5" />Need Help?</span>}><p className="text-xs">Can't access the replay or didn't receive your link?</p><button type="button" onClick={() => { setMode('email'); }} className="mt-2 flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs"><RotateCcw className="size-3.5" /> Resend Access Link</button></Box>
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><Navigation className="size-5" />Explore Next Steps</span>}><p className="text-xs">Go deeper with related resources and services.</p><Link href="/resources/library" className="mt-2 inline-block rounded border px-3 py-1.5 text-xs">Explore Resources →</Link></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
