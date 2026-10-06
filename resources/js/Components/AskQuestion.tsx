import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useForm } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    CircleCheck,
    Compass,
    FileText,
    Flag,
    FolderOpen,
    HelpCircle,
    Minus,
    Package,
    Receipt,
    RotateCcw,
    Send,
    ShieldCheck,
    Tag,
    Ticket,
    UserRound,
    type LucideIcon,
} from 'lucide-react';
import { assistant, STARTER_SUGGESTIONS, threadOf, useAssistant, type AssistantContext, type AssistantMessage } from '@/lib/assistant';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import Face from '@/Components/Assistant/Face';
import { MicButton, VoiceToggle } from '@/Components/Assistant/Controls';
import { PERSONAS, type PersonaId, type QuickAction } from '@/Components/Assistant/personas';
import { secureChat } from '@/Components/Assistant/secureChatStore';
import { stopSpeaking } from '@/Components/Assistant/voice';

/**
 * Opens the page's assistant (NATASHA site-wide, KAREN in the Client Portal,
 * MICHAELA in the Virtual Deal Room) from anywhere, optionally with context:
 *   openAskQuestion({ subject: 'Financial Performance Overview Dashboard', section: 'sprints' })
 */
export function openAskQuestion(detail: { subject?: string; section?: string } = {}) {
    assistant.open(detail);
}

/** Opens NIKIWE's secure chat (the header "WhatsApp / Talk" drop-down). */
export function openSecureChat() {
    assistant.minimise();
    secureChat.open();
}

/**
 * Legacy mount point. The assistant is now mounted once for every page by
 * Components/Assistant/AssistantHost (wired in app.tsx), so rendering
 * <AskQuestion /> in a layout is a harmless no-op.
 */
export default function AskQuestion() {
    return null;
}

const ICONS: Record<QuickAction['icon'], LucideIcon> = {
    compass: Compass,
    tag: Tag,
    calendar: CalendarDays,
    package: Package,
    folder: FolderOpen,
    help: HelpCircle,
    flag: Flag,
    file: FileText,
    invoice: Receipt,
    ticket: Ticket,
    shield: ShieldCheck,
    user: UserRound,
};

/**
 * Floating persona assistant. Conversation state lives in lib/assistant so it
 * survives page navigation; replies come from the persona's provider there
 * (interim intent matcher until the AI agent is wired in).
 */
export function AssistantPanel({ persona, ctx, user }: { persona: PersonaId; ctx: Omit<AssistantContext, 'subject' | 'section'>; user: SharedProps['auth']['user'] }) {
    const store = useAssistant();
    const thread = threadOf(store, persona);
    const p = PERSONAS[persona];
    const [draft, setDraft] = useState('');
    const scroller = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLTextAreaElement>(null);

    const send = (text: string) => {
        void assistant.send(persona, text, ctx);
        setDraft('');
        if (input.current) input.current.style.height = '';
    };

    // Keep the newest message in view (DOM sync with the conversation).
    useEffect(() => {
        scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
    }, [thread.messages.length, store.pending, store.open]);

    // Escape minimises the panel.
    useEffect(() => {
        if (!store.open) return;
        const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && assistant.minimise();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [store.open]);

    if (!store.open) {
        return (
            <button
                type="button"
                onClick={() => assistant.open()}
                className="group fixed right-5 bottom-5 z-40 inline-flex h-14 items-center gap-2.5 rounded-full bg-ink-900 pr-5 pl-1.5 text-sm font-semibold text-parchment-100 shadow-raised ring-1 ring-gold-600/50 transition hover:bg-ink-800"
                aria-label={`Ask ${p.name}, the ${p.title}`}
            >
                <Face persona={persona} size={44} online />
                <span className="text-left leading-tight">
                    Ask <span className="text-gold-300">{p.name}</span>
                    <span className="block text-[0.625rem] font-normal text-ink-300">{p.title}</span>
                </span>
                {thread.messages.length > 0 && <span className="size-2 rounded-full bg-verified-500" aria-hidden="true" />}
            </button>
        );
    }

    const lastAssistant = [...thread.messages].reverse().find((m) => m.role === 'assistant');
    const quick = p.quickActions(ctx);

    return (
        <section
            role="dialog"
            aria-label={`${p.name}, ${p.title}`}
            className="fixed z-50 flex flex-col overflow-hidden bg-parchment-100 shadow-raised ring-1 ring-parchment-500 max-sm:inset-0 sm:right-5 sm:bottom-5 sm:h-[min(640px,calc(100vh-2.5rem))] sm:w-[400px] sm:rounded-[14px]"
        >
            {/* Header */}
            <header className="flex items-center gap-3 bg-ink-950 px-4 py-3 text-parchment-100">
                <Face persona={persona} size={48} online />
                <div className="min-w-0 flex-1">
                    <p className="text-sm leading-tight font-semibold">
                        {p.name} <span className="font-normal text-ink-300">· {p.title}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-300">
                        <span className="size-1.5 rounded-full bg-verified-500" /> Online · AI-assisted, human-reviewed
                    </p>
                </div>
                <VoiceToggle className="text-ink-300 hover:bg-ink-800 hover:text-white" />
                {thread.messages.length > 0 && (
                    <IconButton label="Start a new conversation" onClick={() => assistant.reset(persona)}>
                        <RotateCcw className="size-4" />
                    </IconButton>
                )}
                <IconButton
                    label="Minimise"
                    onClick={() => {
                        stopSpeaking();
                        assistant.minimise();
                    }}
                >
                    <Minus className="size-4" />
                </IconButton>
            </header>

            {/* Conversation */}
            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
                <Bubble role="assistant" persona={persona}>
                    {p.greeting(ctx)}
                </Bubble>

                {thread.messages.length === 0 && quick.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        {quick.map((a) => {
                            const Icon = ICONS[a.icon];
                            const cls =
                                'flex items-center gap-2 rounded-[8px] border border-parchment-400 bg-white px-3 py-2.5 text-left text-[0.8125rem] font-medium text-ink-800 transition hover:border-gold-400 hover:bg-gold-50';
                            return a.href ? (
                                <Link key={a.label} href={a.href} className={cls}>
                                    <Icon className="size-4 shrink-0 text-gold-600" />
                                    {a.label}
                                </Link>
                            ) : (
                                <button key={a.label} type="button" onClick={() => send(a.prompt ?? a.label)} className={cls}>
                                    <Icon className="size-4 shrink-0 text-gold-600" />
                                    {a.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {thread.messages.map((m) => (
                    <Message key={m.id} persona={persona} message={m} isLatest={m.id === lastAssistant?.id} onSuggest={send} />
                ))}

                {store.pending && <Typing persona={persona} />}

                {lastAssistant?.handoff && !store.pending && lastAssistant.id === thread.messages.at(-1)?.id && (
                    <Handoff persona={persona} subject={thread.subject} section={thread.section} messages={thread.messages} ctx={ctx} signedIn={Boolean(user)} />
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
                        placeholder={`Ask ${p.name}…`}
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
                    <MicButton onText={setDraft} className="text-ink-500 hover:bg-parchment-300" />
                    <button
                        type="submit"
                        disabled={!draft.trim() || store.pending}
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

function Message({ persona, message: m, isLatest, onSuggest }: { persona: PersonaId; message: AssistantMessage; isLatest: boolean; onSuggest: (t: string) => void }) {
    if (m.role === 'system') {
        return <p className="text-center text-[0.6875rem] font-medium text-ink-400">{m.text}</p>;
    }

    return (
        <div className="space-y-2">
            <Bubble role={m.role} persona={persona}>
                {m.text}
            </Bubble>

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

function Bubble({ role, persona, children }: { role: 'user' | 'assistant'; persona: PersonaId; children: ReactNode }) {
    if (role === 'user') {
        return (
            <div className="flex justify-end">
                <p className="max-w-[80%] rounded-[12px] rounded-br-[4px] bg-ink-900 px-3.5 py-2 text-sm whitespace-pre-wrap text-parchment-100">{children}</p>
            </div>
        );
    }

    return (
        <div className="flex items-end gap-2">
            <Face persona={persona} size={28} />
            <p className="max-w-[85%] rounded-[12px] rounded-bl-[4px] border border-parchment-400 bg-white px-3.5 py-2 text-sm whitespace-pre-wrap text-ink-800">{children}</p>
        </div>
    );
}

function Typing({ persona }: { persona: PersonaId }) {
    return (
        <div className="flex items-end gap-2" aria-label={`${PERSONAS[persona].name} is typing`}>
            <Face persona={persona} size={28} />
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
    persona,
    subject,
    section,
    messages,
    ctx,
    signedIn,
}: {
    persona: PersonaId;
    subject?: string;
    section?: string;
    messages: AssistantMessage[];
    ctx: Omit<AssistantContext, 'subject' | 'section'>;
    signedIn: boolean;
}) {
    const name = PERSONAS[persona].name;
    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
    const form = useForm({
        name: '',
        email: '',
        message: lastQuestion,
        subject: subject ?? `Question from ${name}`,
        section: section ?? (persona === 'michaela' ? 'deal-room' : persona === 'karen' ? 'portal' : 'assistant'),
        assistant: name,
        page: ctx.page,
        room: ctx.room?.slug ?? '',
        room_reference: ctx.room?.reference ?? '',
        transcript: messages
            .filter((m) => m.role !== 'system')
            .map((m) => `${m.role === 'user' ? 'Client' : name}: ${m.text}`)
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
                    persona,
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

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
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
