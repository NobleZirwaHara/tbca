import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Bot, CheckCircle2, Eye, FolderOpen, Lock, ShieldCheck, SlidersHorizontal, UserPlus, Users } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { SharedProps } from '@/types';

const FEATURES = [
    { icon: Lock, title: 'Secure & Private', body: 'Bank-grade security protects your data and every engagement.' },
    { icon: Eye, title: 'Real-Time Visibility', body: 'Track status, milestones, and deliverables as they happen.' },
    { icon: Users, title: 'Collaborate Seamlessly', body: 'Work with our experts and your team in one trusted space.' },
    { icon: FolderOpen, title: 'Access Everything', body: 'Documents, reports, invoices, and communications in one place.' },
    { icon: SlidersHorizontal, title: 'Always On Your Terms', body: "You're in control of access, approvals, and information." },
];

const CAN = ['Manage your profile and organisation', 'View services, orders, and agreements', 'Track deliverables and milestones', 'Access documents and reports', 'View invoices and payment history', 'Message our team securely'];
const LINKS = [
    ['Privacy Notice', '/privacy'],
    ['Terms of Use', '/terms'],
    ['Trust Centre', '/portal/trust-centre'],
    ['System Status', '/portal/status'],
    ['Account Recovery', '/portal/recover'],
    ['Complaints Process', '/portal/support'],
];
const PREVIEW = [
    ['Active Sprints', '4', '2 on track · 2 at risk'],
    ['Pending Actions', '7', 'Requires your attention'],
    ['Invoices Due', '2', 'Pay securely online'],
    ['DD Cases', '5', '2 under review'],
    ['Upcoming Meetings', '3', 'Next: tomorrow 11:00'],
];

/** CP-SCR-001 public Client Portal landing page. */
export default function PortalLanding() {
    const { auth } = usePage<SharedProps>().props;
    const signedIn = !!auth.user;

    return (
        <>
            <Head title="Client Portal" />
            <section className="relative overflow-hidden bg-parchment-100">
                <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(214,163,46,0.28),transparent_65%)]" />
                <div className="container-tbca relative grid gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
                    <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-gold-700 uppercase">TBCA Client Portal</p>
                        <h1 className="mt-3 font-serif text-4xl leading-tight font-bold text-ink-900 sm:text-5xl">
                            YOUR BUSINESS. OUR INTELLIGENCE.
                            <span className="mt-1 block text-gold-600">ONE AFRICA.</span>
                        </h1>
                        <span className="mt-4 block h-1 w-24 rounded bg-gold-500" aria-hidden="true" />
                        <p className="mt-5 max-w-xl text-base text-ink-600">
                            The TBCA Client Portal is your secure gateway to manage engagements, access deliverables, monitor progress, and collaborate with our team. Built for clarity. Designed for control. Governed for trust.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link href={signedIn ? '/portal/dashboard' : '/login'} className="inline-flex items-center gap-3 rounded-[6px] bg-gold-500 px-5 py-3 text-ink-900 hover:bg-gold-400">
                                <Lock className="size-5" aria-hidden="true" />
                                <span className="text-left">
                                    <span className="block text-sm font-bold">{signedIn ? 'Go to My Dashboard' : 'Sign In to Portal'}</span>
                                    <span className="block text-xs">{signedIn ? 'Welcome back' : 'Existing clients'}</span>
                                </span>
                            </Link>
                            {!signedIn && (
                                <Link href="/register" className="inline-flex items-center gap-3 rounded-[6px] border border-ink-900 px-5 py-3 text-ink-900 hover:bg-ink-900/5">
                                    <UserPlus className="size-5" aria-hidden="true" />
                                    <span className="text-left">
                                        <span className="block text-sm font-bold">Create Account</span>
                                        <span className="block text-xs">New clients</span>
                                    </span>
                                </Link>
                            )}
                        </div>
                        <p className="mt-5 flex items-center gap-2 text-sm text-ink-600">
                            <ShieldCheck className="size-4 text-verified-500" aria-hidden="true" /> Secure • Private • Always Under Your Control
                        </p>
                    </div>

                    <div className="rounded-[12px] border border-ink-800 bg-ink-950 p-5 text-parchment-100 shadow-raised" aria-label="Client dashboard preview">
                        <p className="text-sm font-semibold text-gold-300">Client Dashboard preview</p>
                        <p className="text-xs text-ink-300">Welcome back. Here is the latest on your TBCA engagements.</p>
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {PREVIEW.map(([l, v, c]) => (
                                <div key={l} className="rounded-[8px] border border-ink-700 bg-ink-900 p-3">
                                    <p className="text-[0.6875rem] text-ink-300">{l}</p>
                                    <p className="text-xl font-bold text-gold-300">{v}</p>
                                    <p className="text-[0.625rem] text-ink-400">{c}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 space-y-2">
                            {[
                                ['Business Plan Development Sprint', 65],
                                ['Market Research & Feasibility Sprint', 40],
                                ['Investor Readiness Pitch Deck Sprint', 25],
                            ].map(([n, v]) => (
                                <div key={n as string}>
                                    <div className="flex justify-between text-xs">
                                        <span>{n}</span>
                                        <span className="text-gold-300">{v}%</span>
                                    </div>
                                    <div className="mt-1 h-1.5 rounded-full bg-ink-700">
                                        <div className="h-full rounded-full bg-gold-500" style={{ width: `${v}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="container-tbca -mt-6 relative">
                <div className="grid gap-px overflow-hidden rounded-[12px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-5">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="bg-white p-5">
                            <f.icon className="size-6 text-gold-600" aria-hidden="true" />
                            <p className="mt-3 font-semibold text-ink-900">{f.title}</p>
                            <p className="mt-1 text-sm text-ink-600">{f.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container-tbca py-10">
                <div className="flex flex-wrap items-center gap-4 rounded-[12px] border border-gold-300 bg-gold-50 p-5">
                    <ShieldCheck className="size-8 text-gold-700" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg font-bold text-ink-900">Protected Relationship. Professional Boundaries. Trusted Outcomes.</p>
                        <p className="text-sm text-ink-700">The Portal is part of our protected relationship ecosystem. Access is governed by authority, entitlement and route. No action here creates authority or engagement. Nothing is assumed.</p>
                    </div>
                    <Link href="/portal/sitemap" className="inline-flex items-center gap-1 text-sm font-semibold text-controlled-700 hover:underline">
                        Learn how the Portal works <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <p className="font-semibold text-ink-900">What you can do in the Portal</p>
                        <ul className="mt-3 space-y-2 text-sm text-ink-700">
                            {CAN.map((c) => (
                                <li key={c} className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                        <Link href="/portal/sitemap" className="mt-3 inline-block text-sm font-semibold text-controlled-700 hover:underline">
                            See all Portal capabilities →
                        </Link>
                    </div>
                    <div className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <p className="font-semibold text-ink-900">Important Links</p>
                        <ul className="mt-3 space-y-2 text-sm">
                            {LINKS.map(([l, h]) => (
                                <li key={h}>
                                    <Link href={h} className="text-controlled-700 hover:underline">
                                        {l}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <p className="font-semibold text-ink-900">Need Help?</p>
                        <p className="mt-1 text-sm text-ink-600">Our team and NATASHA are here to assist you.</p>
                        <div className="mt-4 flex flex-col gap-2">
                            <Link href={signedIn ? '/portal/support' : '/contact'} className="rounded-[4px] border border-ink-300 px-3 py-2 text-center text-sm font-medium hover:border-ink-900">
                                Contact Support
                            </Link>
                            <button type="button" onClick={() => openAskQuestion({ subject: 'Client Portal', section: 'portal' })} className="rounded-[4px] bg-gold-500 px-3 py-2 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                Chat with NATASHA
                            </button>
                        </div>
                    </div>
                    <div className="rounded-[10px] bg-ink-900 p-5 text-parchment-100">
                        <Bot className="size-8 text-gold-400" aria-hidden="true" />
                        <p className="mt-2 font-serif text-lg font-bold">NATASHA</p>
                        <p className="text-xs text-gold-300">Client Journey Assistant</p>
                        <p className="mt-2 text-sm text-parchment-200">I can help you find information, explain the Portal, and connect you to the right support.</p>
                        <Link href={signedIn ? '/portal/natasha' : '/login'} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-300 hover:underline">
                            Start a conversation <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
