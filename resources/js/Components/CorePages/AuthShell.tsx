import { Link, usePage } from '@inertiajs/react';
import { CircleCheck, Coins, FileCheck, Globe, HelpCircle, Languages, MapPin, MessageCircle, Send, Server, Shield, ShieldCheck, UserRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import Logo from '@/Components/Logo';
import AfricaMark from '@/Components/AfricaMark';
import Flash from '@/Components/Flash';
import AskQuestion, { openAskQuestion } from '@/Components/AskQuestion';
import type { SharedProps } from '@/types';

/** Full-screen auth frame: dark brand panel on the left, white work area, compact footer. */
export function AuthShell({ panel, switchLink, children, footerLinks }: { panel: ReactNode; switchLink: { href: string; label: string }; children: ReactNode; footerLinks: string[] }) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Flash />
            <AskQuestion />
            <div className="flex flex-1 flex-col lg:flex-row">
                <aside className="relative overflow-hidden bg-ink-950 px-6 py-6 text-parchment-200 lg:w-[22rem] lg:shrink-0 xl:w-[24rem]">
                    <div className="pointer-events-none absolute inset-0 motif-grid opacity-25" aria-hidden="true" />
                    <AfricaMark className="pointer-events-none absolute -bottom-6 -left-10 hidden h-80 w-auto text-gold-600/40 lg:block" strokeWidth={1.25} />
                    <div className="relative">
                        <Logo variant="full" className="max-w-[16rem]" />
                        <span className="mt-4 block h-px bg-gold-700/60" aria-hidden="true" />
                        {panel}
                    </div>
                </aside>
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 border-b border-parchment-300 px-4 py-3 text-[0.8125rem] text-ink-700">
                        <span className="inline-flex items-center gap-1"><Globe className="size-4" aria-hidden="true" />EN | AF</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden="true" />South Africa</span>
                        <span className="inline-flex items-center gap-1"><Coins className="size-4" aria-hidden="true" />ZAR | USD</span>
                        <Link href="/about/governance" className="inline-flex items-center gap-1 hover:text-gold-700"><Shield className="size-4" aria-hidden="true" />Privacy</Link>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Sign-in help', section: 'core' })} className="inline-flex items-center gap-1 hover:text-gold-700"><HelpCircle className="size-4" aria-hidden="true" />Need Help?</button>
                        <Link href={switchLink.href} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 font-semibold text-ink-900 hover:bg-gold-50"><UserRound className="size-4" aria-hidden="true" />{switchLink.label}</Link>
                    </header>
                    <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
                </div>
            </div>
            <footer className="bg-ink-950 px-4 py-4 text-[0.75rem] text-parchment-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>© 2026 The Business Clinic.Africa™</span>
                    <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">{footerLinks.map((l) => <Link key={l} href={l.includes('Login') ? '/login' : l.includes('Registration') ? '/register' : '/about/governance'} className="hover:text-gold-300">{l}</Link>)}</nav>
                    <span className="flex flex-wrap gap-4 text-[0.6875rem]"><span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5 text-verified-500" aria-hidden="true" />Encrypted Connection</span><span className="inline-flex items-center gap-1"><CircleCheck className="size-3.5 text-verified-500" aria-hidden="true" />Consent Controlled</span><span className="inline-flex items-center gap-1"><FileCheck className="size-3.5 text-verified-500" aria-hidden="true" />Audit Logging Active</span></span>
                </div>
            </footer>
        </div>
    );
}

export function PanelFacts() {
    return (
        <ul className="mt-6 space-y-2.5 border-t border-gold-700/60 pt-5 text-[0.9375rem]">
            <li className="flex items-center gap-2.5"><MapPin className="size-5 text-gold-500" aria-hidden="true" />South Africa | Phase 1</li>
            <li className="flex items-center gap-2.5"><Languages className="size-5 text-gold-500" aria-hidden="true" />English | Afrikaans</li>
            <li className="flex items-center gap-2.5"><Coins className="size-5 text-gold-500" aria-hidden="true" />ZAR | USD</li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="size-5 text-gold-500" aria-hidden="true" />POPIA-Aware Client Access</li>
            <li className="flex items-center gap-2.5"><Server className="size-5 text-gold-500" aria-hidden="true" />Secure Production Environment</li>
        </ul>
    );
}

/** NATASHA quick-help card. Chips open the shared question panel with the chosen topic. */
export function NatashaCard({ chips }: { chips: string[] }) {
    const { auth } = usePage<SharedProps>().props;
    const [q, setQ] = useState('');
    return (
        <section className="rounded-[10px] bg-ink-950 p-4 text-parchment-200">
            <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-700 font-bold text-ink-950" aria-hidden="true">N</span>
                <div className="flex-1"><p className="font-serif text-[1.0625rem] font-bold text-gold-400">NATASHA</p><p className="text-[0.75rem]">TBCA Tech Assistant</p></div>
                <span className="inline-flex items-center gap-1 text-[0.75rem]"><span className="size-2 rounded-full bg-verified-500" />Online</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-[8px] bg-white p-2">
                {chips.map((c) => (
                    <button key={c} type="button" onClick={() => openAskQuestion({ subject: c, section: 'core' })} className="flex min-h-14 items-center justify-center rounded-[6px] border border-parchment-300 p-1.5 text-center text-[0.6875rem] leading-tight text-ink-800 hover:border-gold-400">
                        <MessageCircle className="mr-1 hidden size-3.5 shrink-0 text-gold-600 xl:block" aria-hidden="true" />{c}
                    </button>
                ))}
            </div>
            <form
                className="mt-2 flex items-center gap-2 rounded-[6px] bg-white px-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    openAskQuestion({ subject: q || 'Help', section: auth.user ? 'portal' : 'core' });
                    setQ('');
                }}
            >
                <label htmlFor="natasha-q" className="sr-only">Type your question</label>
                <input id="natasha-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type your question..." className="h-10 flex-1 bg-transparent text-[0.8125rem] text-ink-900 outline-none" />
                <button type="submit" aria-label="Send question"><Send className="size-4 text-ink-700" /></button>
            </form>
        </section>
    );
}
