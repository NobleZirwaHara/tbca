import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from '@inertiajs/react';
import { Check, CheckCheck, Clock, Lock, MessageCircle, RotateCcw, Send, ShieldCheck, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import Face from './Face';
import { MicButton, VoiceToggle } from './Controls';
import { continueOnWhatsapp, lead, secureChat, TOPIC_LIST, useSecureChat, type SecureMessage } from './secureChatStore';

const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * NIKIWE — "WhatsApp / Talk" secure chat, dropping down from the header in
 * the style of a banking app's Secure Chat: padlock header, encrypted-session
 * notice, agent identity, timestamps and delivery ticks, quick topics, then
 * a handover to a human Functional Lead.
 */
export default function SecureChat({ page }: { page: string }) {
    const chat = useSecureChat();
    const [draft, setDraft] = useState('');
    const scroller = useRef<HTMLDivElement>(null);

    // Keep the newest message in view.
    useEffect(() => {
        scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
    }, [chat.messages.length, chat.pending, chat.stage, chat.open]);

    // Escape closes (with the lead-capture check).
    useEffect(() => {
        if (!chat.open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && secureChat.requestClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [chat.open]);

    if (!chat.open) return null;

    const send = (text: string) => {
        void secureChat.send(text);
        setDraft('');
    };
    const engaged = chat.messages.some((m) => m.from === 'client');
    const l = lead();

    return (
        <section
            role="dialog"
            aria-label="Secure chat with NIKIWE"
            className="fixed z-[70] flex flex-col overflow-hidden bg-white shadow-raised ring-1 ring-ink-900/15 max-sm:inset-x-2 max-sm:top-2 max-sm:bottom-2 max-sm:rounded-[14px] sm:top-16 sm:right-5 sm:h-[min(640px,calc(100vh-5rem))] sm:w-[390px] sm:rounded-[14px]"
        >
            {/* Secure header */}
            <header className="bg-[#0b5e55] text-white">
                <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/15">
                        <Lock className="size-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[0.9375rem] leading-tight font-bold tracking-wide">Secure Chat</p>
                        <p className="text-[0.6875rem] text-white/75">The Business Clinic.Africa · Available 24/7</p>
                    </div>
                    <VoiceToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
                    {engaged && (
                        <button type="button" onClick={() => secureChat.reset()} aria-label="Start a new chat" title="Start a new chat" className="inline-flex size-8 items-center justify-center rounded-[6px] text-white/80 hover:bg-white/10 hover:text-white">
                            <RotateCcw className="size-4" />
                        </button>
                    )}
                    <button type="button" onClick={() => secureChat.requestClose()} aria-label="Close secure chat" className="inline-flex size-8 items-center justify-center rounded-[6px] text-white/80 hover:bg-white/10 hover:text-white">
                        <X className="size-4" />
                    </button>
                </div>
                <div className="flex items-center gap-3 border-t border-white/10 bg-black/10 px-4 py-2.5">
                    <Face persona="nikiwe" size={40} online />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm leading-tight font-semibold">NIKIWE</p>
                        <p className="text-[0.6875rem] text-white/75">TBCA Virtual Assistant · hands over to {chat.topic ? `the ${l.role}` : 'a Functional Lead'}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[0.6875rem] text-[#7ee2a8]">
                        <span className="size-1.5 rounded-full bg-[#25D366]" /> Online
                    </span>
                </div>
            </header>

            {/* Conversation */}
            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-[#eef2f1] px-3 py-3" aria-live="polite">
                {chat.messages.map((m) => (
                    <Bubble key={m.id} m={m} />
                ))}

                {!engaged && !chat.pending && (
                    <div className="flex flex-wrap gap-1.5 pl-9">
                        {TOPIC_LIST.map((t) => (
                            <button key={t.key} type="button" onClick={() => secureChat.pickTopic(t.key)} className="rounded-full border border-[#0b5e55]/30 bg-white px-3 py-1.5 text-[0.75rem] font-medium text-[#0b5e55] hover:bg-[#0b5e55]/5">
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {chat.pending && (
                    <div className="flex items-end gap-2" aria-label="NIKIWE is typing">
                        <Face persona="nikiwe" size={28} />
                        <div className="flex gap-1 rounded-[12px] rounded-bl-[4px] bg-white px-3.5 py-3 shadow-sm">
                            {[0, 150, 300].map((d) => (
                                <span key={d} className="size-1.5 animate-bounce rounded-full bg-ink-300" style={{ animationDelay: `${d}ms` }} />
                            ))}
                        </div>
                    </div>
                )}

                {chat.stage === 'capture' && !chat.pending && <Capture page={page} confirmClose={chat.confirmClose} />}

                {chat.stage === 'handed' && (
                    <div className="ml-9 space-y-2 rounded-[10px] border border-[#0b5e55]/25 bg-white p-3 text-[0.8125rem]">
                        <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                            <UserRound className="size-4 text-[#0b5e55]" /> {l.role}
                        </p>
                        {chat.reference && (
                            <p className="text-ink-600">
                                Reference <span className="font-mono font-semibold text-ink-900">{chat.reference}</span>
                            </p>
                        )}
                        <a
                            href={continueOnWhatsapp()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[8px] bg-[#25D366] font-semibold text-ink-950 hover:bg-[#1fbd5b]"
                        >
                            <MessageCircle className="size-4" /> Continue on WhatsApp
                        </a>
                    </div>
                )}
            </div>

            {/* Composer */}
            <form
                onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    send(draft);
                }}
                className="border-t border-parchment-400 bg-white px-3 pt-2.5 pb-2"
            >
                <div className="flex items-center gap-2 rounded-full border border-parchment-500 bg-parchment-100 py-1 pr-1 pl-4 focus-within:border-[#0b5e55]">
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        maxLength={1000}
                        placeholder="Type a message"
                        aria-label="Message"
                        className="h-8 min-w-0 flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                    />
                    <MicButton onText={setDraft} className="text-ink-500 hover:bg-parchment-300" />
                    <button
                        type="submit"
                        disabled={!draft.trim() || chat.pending}
                        aria-label="Send"
                        className="inline-flex size-8 items-center justify-center rounded-full bg-[#0b5e55] text-white hover:bg-[#094d46] disabled:opacity-40"
                    >
                        <Send className="size-4" />
                    </button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 px-1 text-[0.625rem] text-ink-400">
                    <ShieldCheck className="size-3" /> Encrypted session. TBCA will never ask for passwords, PINs or OTPs in chat.
                </p>
            </form>
        </section>
    );
}

function Bubble({ m }: { m: SecureMessage }) {
    if (m.from === 'system') {
        return (
            <p className="mx-auto flex w-fit items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-center text-[0.6875rem] text-ink-500">
                <Lock className="size-3" aria-hidden="true" /> {m.text}
            </p>
        );
    }

    if (m.from === 'client') {
        const Tick = m.status === 'sent' ? Check : CheckCheck;
        return (
            <div className="flex flex-col items-end">
                <p className="max-w-[80%] rounded-[12px] rounded-br-[4px] bg-[#0b5e55] px-3.5 py-2 text-sm whitespace-pre-wrap text-white">{m.text}</p>
                <span className="mt-0.5 flex items-center gap-1 text-[0.625rem] text-ink-400">
                    {time(m.at)}
                    {m.status ? (
                        <Tick className={cn('size-3.5', m.status === 'read' ? 'text-[#34b7f1]' : 'text-ink-400')} aria-label={m.status} />
                    ) : (
                        <Clock className="size-3" aria-hidden="true" />
                    )}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-end gap-2">
            <Face persona="nikiwe" size={28} />
            <div className="max-w-[85%]">
                <p className="rounded-[12px] rounded-bl-[4px] bg-white px-3.5 py-2 text-sm whitespace-pre-wrap text-ink-800 shadow-sm">{m.text}</p>
                {m.links && m.links.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        {m.links.map((l) => (
                            <Link key={l.href} href={l.href} className="rounded-full border border-[#0b5e55]/30 bg-white px-2.5 py-1 text-[0.75rem] font-medium text-[#0b5e55] hover:bg-[#0b5e55]/5">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                )}
                <span className="mt-0.5 block text-[0.625rem] text-ink-400">NIKIWE · {time(m.at)}</span>
            </div>
        </div>
    );
}

/** Lead capture: name + WhatsApp number or email, then hand over. */
function Capture({ page, confirmClose }: { page: string; confirmClose: boolean }) {
    const chat = useSecureChat();
    const c = chat.contact;
    const l = lead();
    const field = 'h-9 w-full rounded-[6px] border border-parchment-500 bg-white px-2.5 text-sm focus:border-[#0b5e55] focus:outline-none';

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                secureChat.handover(page);
            }}
            className="ml-9 space-y-2 rounded-[10px] border border-[#0b5e55]/25 bg-white p-3"
        >
            <p className="text-[0.8125rem] font-semibold text-ink-900">
                {confirmClose ? 'Before you go — leave your details so a TBCA lead can follow up' : `Connect me with the ${l.role}`}
            </p>
            <input required placeholder="Your name" aria-label="Your name" autoComplete="name" value={c.name} onChange={(e) => secureChat.setContact({ name: e.target.value })} className={field} />
            <input type="tel" placeholder="WhatsApp number, e.g. +27 82 123 4567" aria-label="WhatsApp number" autoComplete="tel" value={c.whatsapp} onChange={(e) => secureChat.setContact({ whatsapp: e.target.value })} className={field} />
            <input type="email" placeholder="Email (optional if WhatsApp given)" aria-label="Email" autoComplete="email" value={c.email} onChange={(e) => secureChat.setContact({ email: e.target.value })} className={field} />
            {chat.error && <p className="text-xs text-risk-500">{chat.error}</p>}
            <button type="submit" disabled={chat.submitting} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0b5e55] text-sm font-semibold text-white hover:bg-[#094d46] disabled:opacity-50">
                <UserRound className="size-4" /> {chat.submitting ? 'Handing over…' : 'Hand over to a person'}
            </button>
            {confirmClose && (
                <button type="button" onClick={() => secureChat.close()} className="block w-full text-center text-xs text-ink-500 underline">
                    Close without sharing
                </button>
            )}
        </form>
    );
}
