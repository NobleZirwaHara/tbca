import { Head, Link, useForm } from '@inertiajs/react';
import { Check, Send, X } from 'lucide-react';
import PortalShell from '@/Components/Portal/PortalShell';
import Face from '@/Components/Assistant/Face';
import { Button } from '@/Components/ui/Button';
import { Panel, StatusPill } from '@/Components/ui/Kit';

interface Answer {
    text: string;
    items: { label: string; value?: string; status?: string; href?: string }[];
    actions: { label: string; href: string }[];
    tier: string;
}

interface Props {
    name: string;
    disabled: boolean;
    conversation: { question: string; answer: Answer | null; at: string }[];
    prompts: string[];
}

const CAN = ['Provide guidance on portal features and processes', 'Find and explain permitted information', 'Track tasks, tickets and complaint status', 'Help prepare drafts and documents', 'Point you to the right human expert'];
const CANNOT = ['Approve payments or transactions', 'Provide legal or tax advice', 'Make sanctions or KYC decisions', 'Release deliverables or results', 'Override portal administrators'];

/** CP-SCR-076 KAREN Assistant Panel: rule-based answers from permitted portal data. */
export default function Natasha({ name, disabled, conversation, prompts }: Props) {
    const form = useForm({ question: '' });
    const ask = (q: string) => {
        form.transform(() => ({ question: q }));
        form.post('/portal/natasha', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return (
        <PortalShell title="KAREN Assistant Panel" icon="bot" subtitle="Your TBCA Client Journey Assistant. KAREN helps you understand tasks, find information and take the right next steps." crumbs={[{ label: 'KAREN' }]}>
            <Head title="KAREN Assistant" />
            {disabled && <p className="mb-4 rounded-[8px] border border-risk-500/30 bg-risk-50 p-3 text-sm text-risk-800">KAREN is temporarily unavailable (safety kill switch active). Please use Support Tickets or Secure Messages.</p>}
            <div className="grid gap-5 xl:grid-cols-[16rem_minmax(0,1fr)_18rem]">
                <aside className="space-y-4">
                    <Panel>
                        <div className="flex items-center gap-3">
                            <Face persona="karen" size={56} online={!disabled} />
                            <div>
                                <p className="font-semibold text-ink-900">Hello, {name}!</p>
                                <StatusPill status={disabled ? 'Offline' : 'Online'} tone={disabled ? 'bad' : 'good'} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-ink-600">I'm KAREN. I can help you navigate the portal, find information you're allowed to see, and guide you to the right resources or human experts when needed.</p>
                    </Panel>
                    <Panel title="Suggested Prompts">
                        <ul className="space-y-1.5">
                            {prompts.map((p) => (
                                <li key={p}>
                                    <button type="button" disabled={disabled || form.processing} onClick={() => ask(p)} className="w-full rounded-[6px] border border-parchment-400 px-2.5 py-2 text-left text-[0.8125rem] hover:border-gold-400 disabled:opacity-50">
                                        {p}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </aside>

                <section className="flex min-h-[28rem] flex-col rounded-[8px] border border-parchment-400 bg-white">
                    <header className="border-b border-parchment-300 px-4 py-3 text-sm font-semibold">
                        Conversation <span className="ml-1 rounded-full bg-gold-50 px-2 py-0.5 text-[0.6875rem] text-gold-800">Guided Support</span>
                    </header>
                    <ol className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
                        {conversation.length === 0 && <li className="text-sm text-ink-400">Ask me anything about your invoices, tasks, tickets, deliverables or documents.</li>}
                        {conversation.map((c, i) => (
                            <li key={i} className="space-y-2">
                                <div className="ml-auto max-w-[80%] rounded-[8px] bg-parchment-200 p-3 text-sm">
                                    <p className="text-[0.6875rem] text-ink-500">You · {c.at}</p>
                                    {c.question}
                                </div>
                                {c.answer && (
                                    <div className="max-w-[90%] rounded-[8px] border border-gold-300 bg-gold-50/60 p-3 text-sm">
                                        <p className="text-[0.6875rem] text-ink-500">KAREN · {c.answer.tier}</p>
                                        <p className="text-ink-800">{c.answer.text}</p>
                                        {c.answer.items.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {c.answer.items.map((it) => (
                                                    <li key={it.label} className="flex flex-wrap items-center gap-2 text-xs">
                                                        {it.href ? <Link href={it.href} className="font-semibold text-controlled-700 hover:underline">{it.label}</Link> : <span className="font-semibold">{it.label}</span>}
                                                        {it.value && <span className="text-ink-600">{it.value}</span>}
                                                        {it.status && <StatusPill status={it.status} />}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {c.answer.actions.map((a) => (
                                                <Link key={a.href} href={a.href} className="rounded-[4px] border border-parchment-500 bg-white px-2 py-1 text-xs hover:border-gold-500">
                                                    {a.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ol>
                    <form
                        className="flex gap-2 border-t border-parchment-300 p-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (form.data.question.trim()) ask(form.data.question);
                        }}
                    >
                        <label htmlFor="ask" className="sr-only">
                            Ask KAREN
                        </label>
                        <input id="ask" disabled={disabled} value={form.data.question} onChange={(e) => form.setData('question', e.target.value)} placeholder="Ask KAREN anything…" className="h-10 flex-1 rounded-[4px] border border-parchment-500 px-3 text-sm focus:border-gold-500 focus:outline-none" />
                        <Button type="submit" size="sm" disabled={disabled || form.processing} aria-label="Send">
                            <Send className="size-4" />
                        </Button>
                    </form>
                    <p className="px-3 pb-3 text-[0.6875rem] text-ink-500">KAREN responses are generated from permitted portal data and logged securely.</p>
                </section>

                <aside className="space-y-4">
                    <Panel title="What KAREN Can Help With">
                        <ul className="space-y-1.5 text-[0.8125rem]">
                            {CAN.map((c) => (
                                <li key={c} className="flex gap-2">
                                    <Check className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title="Authority Limits">
                        <ul className="space-y-1.5 text-[0.8125rem]">
                            {CANNOT.map((c) => (
                                <li key={c} className="flex gap-2">
                                    <X className="mt-0.5 size-4 shrink-0 text-risk-500" aria-hidden="true" />
                                    KAREN cannot {c.charAt(0).toLowerCase() + c.slice(1)}
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title="Need Human Help?">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                ['Contact Support', '/portal/support?new=1'],
                                ['Secure Message', '/portal/messages'],
                                ['Book a Call', '/portal/meetings'],
                                ['Human Handoff', '/portal/natasha/handoff'],
                            ].map(([l, h]) => (
                                <Link key={h} href={h} className="rounded-[4px] border border-parchment-500 px-2 py-2 text-center hover:border-gold-500">
                                    {l}
                                </Link>
                            ))}
                        </div>
                    </Panel>
                </aside>
            </div>
        </PortalShell>
    );
}

Natasha.layout = null;
