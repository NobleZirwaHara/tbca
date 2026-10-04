import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowUpRight, Bot, CalendarDays, CircleCheck, Compass, Minus, Package, RotateCcw, Send, ShieldCheck, Tag, UserRound } from 'lucide-react';
import { assistant, STARTER_SUGGESTIONS, useAssistant, type AssistantMessage } from '@/lib/assistant';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

/**
 * Opens the NATASHA assistant from anywhere, optionally with context:
 *   openAskQuestion({ subject: 'Financial Performance Overview Dashboard', section: 'sprints' })
 */
export function openAskQuestion(detail: { subject?: string; section?: string } = {}) {
    assistant.open(detail);
}

const QUICK_ACTIONS = [
    { label: 'Find the right Sprint', icon: Compass },
    { label: 'Pricing & payment', icon: Tag },
    { label: 'Book a discovery call', icon: CalendarDays },
    { label: 'Track my order', icon: Package },
];

/**
 * Floating site assistant ("Ask a Question"). Conversation state lives in
 * lib/assistant so it survives page navigation; replies come from the
 * provider there (interim intent matcher until the AI agent is wired in).
 */
export default function AskQuestion() {
    const { auth, url } = usePage<SharedProps>().props;
    const chat = useAssistant();
    const [draft, setDraft] = useState('');
    const scroller = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLTextAreaElement>(null);

    const ctx = { page: url.path, signedIn: Boolean(auth.user), userName: auth.user?.name };
    const send = (text: string) => {
        void assistant.send(text, ctx);
        setDraft('');
        if (input.current) input.current.style.height = '';
    };

    // Keep the newest message in view (DOM sync with the conversation).
    useEffect(() => {
        scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
    }, [chat.messages.length, chat.pending, chat.open]);

    // Escape minimises the panel.
    useEffect(() => {
        if (!chat.open) return;
        const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && assistant.minimise();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [chat.open]);

    if (!chat.open) {
        return (
            <button
                type="button"
                onClick={() => assistant.open()}
                className="group fixed right-5 bottom-5 z-40 inline-flex h-12 items-center gap-2.5 rounded-full bg-ink-900 pr-5 pl-1.5 text-sm font-semibold text-parchment-100 shadow-raised ring-1 ring-gold-600/50 transition hover:bg-ink-800"
                aria-label="Ask NATASHA, the TBCA assistant"
            >
                <Avatar size="sm" />
                <span>
                    Ask <span className="text-gold-300">NATASHA</span>
                </span>
                {chat.messages.length > 0 && <span className="size-2 rounded-full bg-verified-500" aria-hidden="true" />}
            </button>
        );
    }

    const lastAssistant = [...chat.messages].reverse().find((m) => m.role === 'assistant');

    return (
        <section
            role="dialog"
            aria-label="NATASHA, TBCA assistant"
            className="fixed z-50 flex flex-col overflow-hidden bg-parchment-100 shadow-raised ring-1 ring-parchment-500 max-sm:inset-0 sm:right-5 sm:bottom-5 sm:h-[min(620px,calc(100vh-2.5rem))] sm:w-[390px] sm:rounded-[14px]"
        >
            {/* Header */}
            <header className="flex items-center gap-3 bg-ink-950 px-4 py-3 text-parchment-100">
                <Avatar />
                <div className="min-w-0 flex-1">
                    <p className="text-sm leading-tight font-semibold">
                        NATASHA <span className="font-normal text-ink-300">· TBCA Assistant</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-300">
                        <span className="size-1.5 rounded-full bg-verified-500" /> Online · AI-assisted, human-reviewed
                    </p>
                </div>
                {chat.messages.length > 0 && (
                    <IconButton label="Start a new conversation" onClick={() => assistant.reset()}>
                        <RotateCcw className="size-4" />
                    </IconButton>
                )}
                <IconButton label="Minimise" onClick={() => assistant.minimise()}>
                    <Minus className="size-4" />
                </IconButton>
            </header>

            {/* Conversation */}
            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                <Bubble role="assistant">
                    Hi{auth.user ? ` ${auth.user.name.split(' ')[0]}` : ''}! I'm NATASHA. I can help you find the right Sprint, explain pricing and payment, book a call, or pass
                    your question to a TBCA specialist.
                </Bubble>

                {chat.messages.length === 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => send(label)}
                                className="flex items-center gap-2 rounded-[8px] border border-parchment-400 bg-white px-3 py-2.5 text-left text-[0.8125rem] font-medium text-ink-800 transition hover:border-gold-400 hover:bg-gold-50"
                            >
                                <Icon className="size-4 shrink-0 text-gold-600" />
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {chat.messages.map((m) => (
                    <Message key={m.id} message={m} isLatest={m.id === lastAssistant?.id} onSuggest={send} />
                ))}

                {chat.pending && <Typing />}

                {lastAssistant?.handoff && !chat.pending && lastAssistant.id === chat.messages.at(-1)?.id && (
                    <Handoff subject={chat.subject} section={chat.section} messages={chat.messages} page={url.path} signedIn={Boolean(auth.user)} />
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
                <div className="flex items-end gap-2 rounded-[10px] border border-parchment-500 bg-parchment-100 px-3 py-2 focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20">
                    <textarea
                        ref={input}
                        autoFocus
                        rows={1}
                        maxLength={1000}
                        value={draft}
                        placeholder="Type your question…"
                        aria-label="Your question"
                        onChange={(e) => {
                            setDraft(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                        }}
                        onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                send(draft);
                            }
                        }}
                        className="max-h-[120px] min-h-6 flex-1 resize-none bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!draft.trim() || chat.pending}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-gold-500 text-ink-900 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send"
                    >
                        <Send className="size-4" />
                    </button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 px-1 text-[0.625rem] text-ink-400">
                    <ShieldCheck className="size-3" /> AI answers can be wrong. Never share passwords or PINs in chat.
                </p>
            </form>
        </section>
    );
}

function Message({ message: m, isLatest, onSuggest }: { message: AssistantMessage; isLatest: boolean; onSuggest: (t: string) => void }) {
    if (m.role === 'system') {
        return <p className="text-center text-[0.6875rem] font-medium text-ink-400">{m.text}</p>;
    }

    return (
        <div className="space-y-2">
            <Bubble role={m.role}>{m.text}</Bubble>

            {m.links && m.links.length > 0 && (
                <ul className="ml-9 space-y-1.5">
                    {m.links.map((l) => (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className="group flex items-center gap-2 rounded-[8px] border border-parchment-400 bg-white px-3 py-2 transition hover:border-gold-400 hover:bg-gold-50"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[0.8125rem] font-semibold text-ink-900">{l.label}</span>
                                    {l.note && <span className="block text-[0.6875rem] text-ink-400">{l.note}</span>}
                                </span>
                                <ArrowUpRight className="size-4 shrink-0 text-gold-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {isLatest && m.suggestions && m.suggestions.length > 0 && (
                <div className="ml-9 flex flex-wrap gap-1.5">
                    {m.suggestions.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => onSuggest(s)}
                            className="rounded-full border border-gold-400/60 bg-white px-2.5 py-1 text-[0.75rem] font-medium text-gold-800 transition hover:bg-gold-50"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
    if (role === 'user') {
        return (
            <div className="flex justify-end">
                <p className="max-w-[80%] rounded-[12px] rounded-br-[4px] bg-ink-900 px-3.5 py-2 text-sm whitespace-pre-wrap text-parchment-100">{children}</p>
            </div>
        );
    }

    return (
        <div className="flex items-end gap-2">
            <Avatar size="xs" />
            <p className="max-w-[85%] rounded-[12px] rounded-bl-[4px] border border-parchment-400 bg-white px-3.5 py-2 text-sm whitespace-pre-wrap text-ink-800">
                {children}
            </p>
        </div>
    );
}

function Typing() {
    return (
        <div className="flex items-end gap-2" aria-label="NATASHA is typing">
            <Avatar size="xs" />
            <div className="flex gap-1 rounded-[12px] rounded-bl-[4px] border border-parchment-400 bg-white px-3.5 py-3">
                {[0, 150, 300].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-ink-300" style={{ animationDelay: `${d}ms` }} />
                ))}
            </div>
        </div>
    );
}

/** "Talk to a person": stores the question (with transcript) for a TBCA specialist. */
function Handoff({
    subject,
    section,
    messages,
    page,
    signedIn,
}: {
    subject?: string;
    section?: string;
    messages: AssistantMessage[];
    page: string;
    signedIn: boolean;
}) {
    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
    const form = useForm({
        name: '',
        email: '',
        message: lastQuestion,
        subject: subject ?? 'Question from the site assistant',
        section: section ?? 'assistant',
        page,
        transcript: messages
            .filter((m) => m.role !== 'system')
            .map((m) => `${m.role === 'user' ? 'Client' : 'NATASHA'}: ${m.text}`)
            .join('\n'),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/forms/question', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (p) => {
                const ref = (p.props as unknown as SharedProps).flash.reference;
                assistant.note(
                    `Thanks — your question is with a TBCA specialist${ref ? ` (reference ${ref})` : ''}. We usually reply within one business day${signedIn ? ', and you will see the reply in your Client Portal' : ' by email'}.`,
                );
            },
        });
    };

    return (
        <form onSubmit={submit} className="ml-9 space-y-2 rounded-[10px] border border-gold-400/60 bg-gold-50 p-3">
            <p className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-900">
                <UserRound className="size-4 text-gold-700" /> Ask a TBCA specialist
            </p>
            {!signedIn && (
                <div className="grid grid-cols-2 gap-2">
                    <input
                        required
                        placeholder="Your name"
                        aria-label="Your name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className="h-9 rounded-[6px] border border-parchment-500 bg-white px-2.5 text-sm"
                    />
                    <input
                        required
                        type="email"
                        placeholder="Email"
                        aria-label="Email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        className="h-9 rounded-[6px] border border-parchment-500 bg-white px-2.5 text-sm"
                    />
                </div>
            )}
            <textarea
                required
                rows={2}
                aria-label="Your question for the specialist"
                value={form.data.message}
                onChange={(e) => form.setData('message', e.target.value)}
                className="w-full rounded-[6px] border border-parchment-500 bg-white p-2.5 text-sm"
            />
            {(form.errors.email || form.errors.name) && <p className="text-xs text-risk-500">{form.errors.email ?? form.errors.name}</p>}
            <button
                type="submit"
                disabled={form.processing}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-ink-900 text-sm font-semibold text-gold-300 hover:bg-ink-800 disabled:opacity-50"
            >
                <CircleCheck className="size-4" /> {form.processing ? 'Sending…' : 'Send to a specialist'}
            </button>
        </form>
    );
}

function Avatar({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950 ring-2 ring-ink-950/10',
                { xs: 'size-7', sm: 'size-9', md: 'size-10' }[size],
            )}
        >
            <Bot className={size === 'xs' ? 'size-3.5' : 'size-5'} />
        </span>
    );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="inline-flex size-8 items-center justify-center rounded-[6px] text-ink-300 transition hover:bg-ink-800 hover:text-white"
        >
            {children}
        </button>
    );
}

export { STARTER_SUGGESTIONS };
