import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bell, ChevronRight, CircleCheck, Clock, Copy, ExternalLink, FolderCheck, Lock, LogIn, Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { DarkCard } from '@/Components/CorePages/Kit';
import Icon from '@/Components/ui/Icon';

interface Props {
    assessment: {
        reference: string; saved_on: string; completed_label: string; progress: number; next_step: number; email: string | null;
        resume_url: string; expires_on: string; reminder_at: string | null; link_sent: boolean;
    };
}

export default function Saved({ assessment: a }: Props) {
    const [reminderOpen, setReminderOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    return (
        <div className="bg-parchment-200">
            <Head title="Business Health Score — Progress Saved" />
            <div className="container-tbca grid gap-6 py-8 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Business Health Score' }]} />
                    <h1 className="font-serif text-[2rem] font-semibold text-ink-900 md:text-[2.5rem]">Business Health Score</h1>
                    <p className="mt-2 flex items-center gap-2 font-serif text-[1.375rem] font-semibold text-gold-600"><CircleCheck className="size-6" aria-hidden="true" />Progress Saved Successfully</p>
                    <p className="mt-1 text-[0.875rem] text-ink-600">Your Business Health Score diagnostic has been saved. You can return anytime to continue where you left off.</p>

                    <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                            <div className="flex flex-col gap-5 sm:flex-row">
                                <span className="mx-auto flex size-24 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600"><FolderCheck className="size-12" aria-hidden="true" /></span>
                                <div className="flex-1">
                                    <h2 className="text-[1.125rem] font-bold text-ink-900">Your Progress Has Been Saved</h2>
                                    <p className="mt-1 text-[0.8125rem] text-ink-600">You may return within the next 30 days (until {a.expires_on}) to continue your diagnostic.</p>
                                    <dl className="mt-4 space-y-2 border-t border-parchment-300 pt-3 text-[0.8125rem]">
                                        {[['Saved On', a.saved_on], ['Reference ID', a.reference], ['Completed', a.completed_label], ['Progress', `${a.progress}% Complete`], ...(a.reminder_at ? [['Reminder', a.reminder_at]] : [])].map(([k, v]) => (
                                            <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium break-all text-ink-900">{v}</dd></div>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                            <p className="mt-4 flex items-center gap-3 rounded-[6px] bg-gold-50 p-3 text-[0.8125rem] text-ink-700"><Clock className="size-6 shrink-0 text-gold-600" aria-hidden="true" />Don&rsquo;t worry, your answers are secure and private. Use your secure resume link to continue.</p>
                            <div className="mt-3 flex items-center gap-2 rounded-[4px] border border-parchment-400 bg-parchment-100 px-3 py-2 text-[0.75rem]">
                                <span className="min-w-0 flex-1 truncate">{a.resume_url}</span>
                                <button type="button" onClick={() => { void navigator.clipboard?.writeText(a.resume_url); setCopied(true); }} className="inline-flex shrink-0 items-center gap-1 font-semibold"><Copy className="size-3.5" aria-hidden="true" />{copied ? 'Copied' : 'Copy link'}</button>
                            </div>
                        </section>

                        <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                            <h2 className="text-[1.125rem] font-semibold text-ink-900">What Would You Like to Do Next?</h2>
                            <ul className="mt-3 space-y-2.5">
                                <li>
                                    <Link href={`/business-health-score/step/${a.next_step}`} className="flex items-center gap-3 rounded-[6px] border border-parchment-400 p-3 hover:border-gold-400">
                                        <Icon name="door-open" className="size-7 text-gold-600" />
                                        <span className="flex-1"><span className="block text-[0.875rem] font-semibold text-ink-900">Resume My Diagnostic</span><span className="text-[0.75rem] text-ink-500">Continue from where you left off</span></span>
                                        <ChevronRight className="size-4" aria-hidden="true" />
                                    </Link>
                                </li>
                                <li>
                                    <button type="button" onClick={() => router.post('/business-health-score/saved/email-link', {}, { preserveScroll: true })} className="flex w-full items-center gap-3 rounded-[6px] border border-parchment-400 p-3 text-left hover:border-gold-400">
                                        <Mail className="size-7 text-gold-600" aria-hidden="true" />
                                        <span className="flex-1"><span className="block text-[0.875rem] font-semibold text-ink-900">Email Me a Resume Link</span><span className="text-[0.75rem] text-ink-500">{a.link_sent ? `Sent to ${a.email}. Send again?` : 'We’ll send a secure link to your email'}</span></span>
                                        <ChevronRight className="size-4" aria-hidden="true" />
                                    </button>
                                </li>
                                <li className="rounded-[6px] border border-parchment-400">
                                    <button type="button" aria-expanded={reminderOpen} onClick={() => setReminderOpen(!reminderOpen)} className="flex w-full items-center gap-3 p-3 text-left">
                                        <Bell className="size-7 text-gold-600" aria-hidden="true" />
                                        <span className="flex-1"><span className="block text-[0.875rem] font-semibold text-ink-900">Choose a Reminder</span><span className="text-[0.75rem] text-ink-500">We&rsquo;ll remind you to complete your score</span></span>
                                        <ChevronRight className="size-4" aria-hidden="true" />
                                    </button>
                                    {reminderOpen && (
                                        <div className="flex flex-wrap gap-2 border-t border-parchment-300 p-3">
                                            {[1, 3, 7].map((d) => (
                                                <button key={d} type="button" onClick={() => router.post('/business-health-score/saved/reminder', { days: d }, { preserveScroll: true, onSuccess: () => setReminderOpen(false) })} className="h-9 rounded-[4px] border border-gold-500 px-3 text-[0.8125rem] font-semibold text-gold-700 hover:bg-gold-50">
                                                    In {d} day{d > 1 ? 's' : ''}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </li>
                                <li className="flex gap-3 rounded-[6px] border border-parchment-400 bg-parchment-100 p-3">
                                    <Shield className="size-6 shrink-0 text-ink-700" aria-hidden="true" />
                                    <span><span className="block text-[0.8125rem] font-semibold text-ink-900">Your information is protected</span><span className="text-[0.75rem] text-ink-500">Your details are stored securely and used only for your Business Health Score diagnostic and authorised follow-up.</span></span>
                                </li>
                            </ul>
                        </section>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-[10px] border border-gold-300 bg-gold-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-3">
                            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-gold-400"><Lock className="size-5" aria-hidden="true" /></span>
                            <div><p className="font-semibold text-ink-900">Your Data. Your Control.</p><p className="text-[0.75rem] text-ink-600">We respect your privacy. You can review our Privacy Notice and Terms of Use at any time.</p></div>
                        </div>
                        <p className="flex gap-4 text-[0.8125rem] text-gold-700"><Link href="/about/governance" className="inline-flex items-center gap-1 underline">Privacy Notice <ExternalLink className="size-3" aria-hidden="true" /></Link><Link href="/about/governance" className="inline-flex items-center gap-1 underline">Terms of Use <ExternalLink className="size-3" aria-hidden="true" /></Link></p>
                    </div>
                    <div className="mt-6 text-center">
                        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-ink-900 px-6 text-sm font-semibold text-gold-400"><ArrowLeft className="size-4" aria-hidden="true" />Back to Home</Link>
                    </div>
                </div>
                <aside className="xl:col-span-3">
                    <DarkCard title="Why Complete Your Business Health Score?">
                        <ul className="space-y-3">
                            {[['target', 'Get a clear view of your business performance across five key dimensions.'], ['bar-chart-3', 'Identify the top issues holding your business back.'], ['list-checks', 'Receive a practical 30-day action plan to improve results.'], ['rocket', 'Get a recommended TBCA Sprint, service or toolkit to help you grow.'], ['activity', 'It’s free, fast and designed for business owners like you.']].map(([i, t]) => (
                                <li key={t} className="flex gap-3 text-[0.8125rem] text-parchment-100"><Icon name={i} className="size-6 shrink-0 text-gold-500" />{t}</li>
                            ))}
                        </ul>
                        <p className="mt-5 font-serif text-[1.0625rem] font-semibold text-gold-400">Already a TBCA client?</p>
                        <p className="text-[0.8125rem]">Sign in to prefill your details and resume your diagnostic.</p>
                        <Link href="/login" className="mt-3 inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-[0.875rem] font-semibold text-gold-400"><LogIn className="size-4" aria-hidden="true" />Sign In and Continue</Link>
                    </DarkCard>
                </aside>
            </div>
        </div>
    );
}
