import { useSyncExternalStore } from 'react';

/* ==========================================================================
   NATASHA — site assistant: conversation store + reply provider.

   The UI (Components/AskQuestion.tsx) only talks to this module:
     - `useAssistant()` reads the conversation (persists across Inertia page
       visits and reloads via sessionStorage),
     - `assistant.send(text)` appends the user message and asks the provider.

   To connect the real AI agent, replace `getReply()` with a call to the
   backend (e.g. POST /assistant/messages with { messages, context }) that
   returns the same `AssistantReply` shape. Nothing else needs to change.
   ========================================================================== */

export interface AssistantLink {
    label: string;
    href: string;
    note?: string;
}

export interface AssistantMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    links?: AssistantLink[];
    suggestions?: string[];
    /** Assistant offers the "talk to a person" form under this message. */
    handoff?: boolean;
    at: number;
}

export interface AssistantReply {
    text: string;
    links?: AssistantLink[];
    suggestions?: string[];
    handoff?: boolean;
}

export interface AssistantContext {
    page: string;
    subject?: string;
    section?: string;
    signedIn: boolean;
    userName?: string;
}

interface State {
    open: boolean;
    pending: boolean;
    messages: AssistantMessage[];
    subject?: string;
    section?: string;
}

const STORAGE_KEY = 'tbca.assistant.v1';
export const STARTER_SUGGESTIONS = [
    'Find the right Sprint',
    'Pricing & payment',
    'Book a discovery call',
    'Due Diligence checks',
    'Track my order',
    'Talk to a person',
];

const uid = () => Math.random().toString(36).slice(2, 10);

function load(): State {
    const empty: State = { open: false, pending: false, messages: [] };
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return empty;
        const saved = JSON.parse(raw) as Partial<State>;
        return { ...empty, ...saved, pending: false };
    } catch {
        return empty;
    }
}

let state: State = typeof window === 'undefined' ? { open: false, pending: false, messages: [] } : load();
const listeners = new Set<() => void>();

function setState(patch: Partial<State>) {
    state = { ...state, ...patch };
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, pending: false }));
    } catch {
        /* storage unavailable (private mode) — the chat still works for this page */
    }
    listeners.forEach((l) => l());
}

function push(message: Omit<AssistantMessage, 'id' | 'at'>) {
    setState({ messages: [...state.messages, { ...message, id: uid(), at: Date.now() }] });
}

export function useAssistant(): State {
    return useSyncExternalStore(
        (l) => {
            listeners.add(l);
            return () => listeners.delete(l);
        },
        () => state,
        () => state,
    );
}

export const assistant = {
    open(detail: { subject?: string; section?: string } = {}) {
        const changedSubject = detail.subject && detail.subject !== state.subject;
        setState({ open: true, subject: detail.subject ?? state.subject, section: detail.section ?? state.section });
        if (changedSubject) {
            push({
                role: 'system',
                text: `Asking about: ${detail.subject}`,
            });
        }
    },
    minimise() {
        setState({ open: false });
    },
    reset() {
        setState({ messages: [], subject: undefined, section: undefined, pending: false });
    },
    note(text: string) {
        push({ role: 'assistant', text });
    },
    async send(text: string, ctx: Omit<AssistantContext, 'subject' | 'section'>) {
        const trimmed = text.trim();
        if (!trimmed || state.pending) return;

        push({ role: 'user', text: trimmed });
        setState({ pending: true });

        try {
            const reply = await getReply(state.messages, { ...ctx, subject: state.subject, section: state.section });
            push({ role: 'assistant', ...reply });
        } catch {
            push({
                role: 'assistant',
                text: "Sorry, I couldn't respond just now. You can try again, or leave your question for a TBCA specialist.",
                handoff: true,
            });
        } finally {
            setState({ pending: false });
        }
    },
};

/* --------------------------------------------------------------------------
   Interim reply provider (no AI yet): intent matching over the site's real
   routes so every answer points somewhere useful. Swap for the agent call.
   -------------------------------------------------------------------------- */

const INTENTS: { match: RegExp; reply: (ctx: AssistantContext) => AssistantReply }[] = [
    {
        match: /\b(person|human|agent|specialist|someone|call me|speak|talk to)\b/i,
        reply: () => ({
            text: 'Of course. Leave your question below and a TBCA specialist will reply, usually within one business day. You can also book a free 30-minute discovery call.',
            handoff: true,
            links: [{ label: 'Book a discovery call', href: '/discovery-call', note: 'Free, 30 minutes' }],
        }),
    },
    {
        match: /\b(sprint|service|find|right|recommend|which|help me choose|not sure)\b/i,
        reply: () => ({
            text: 'There are three quick ways to find the right Sprint: answer a few questions in the service finder, take the free Business Health Score, or browse the full catalogue by category and audience.',
            links: [
                { label: 'Find the Right Service', href: '/find-the-right-service', note: 'Guided, about 3 minutes' },
                { label: 'Business Health Score', href: '/business-health-score', note: 'Free scored diagnostic' },
                { label: 'Browse all Sprints', href: '/sprints', note: 'Search and filter the catalogue' },
            ],
            suggestions: ['Sprints for SMEs', 'Pricing & payment', 'Talk to a person'],
        }),
    },
    {
        match: /\bsme|small business|founder|start-?up|investor|ngo|corporate\b/i,
        reply: () => ({
            text: 'Sprints are curated by buyer type. Pick the route that fits you:',
            links: [
                { label: 'Sprints for SMEs', href: '/sprints/for/smes' },
                { label: 'Sprints for Founders & Start-ups', href: '/sprints/for/founders' },
                { label: 'Sprints for Investors & Funders', href: '/sprints/for/investors' },
                { label: 'Sprints for Corporates', href: '/sprints/for/corporates' },
            ],
        }),
    },
    {
        match: /\b(price|pricing|cost|pay|payment|vat|eft|card|invoice|refund|quote)\b/i,
        reply: () => ({
            text: 'Prices are shown in ZAR (switch to USD in the header) and exclude 15% VAT. You can pay by card, instant EFT or TBCA wallet at checkout, and a tax invoice is issued automatically. Scoped work is priced through a quote.',
            links: [
                { label: 'Request a quote', href: '/sprints/request-a-quote' },
                { label: 'Compare products', href: '/shop/compare' },
                { label: 'My basket', href: '/basket' },
            ],
            suggestions: ['Track my order', 'Talk to a person'],
        }),
    },
    {
        match: /\b(book|discovery|meeting|appointment|consult)\b/i,
        reply: () => ({
            text: 'You can book a free 30-minute discovery call with a TBCA specialist. Pick a time that suits you and you will get a confirmation straight away.',
            links: [
                { label: 'Book a discovery call', href: '/discovery-call' },
                { label: 'My meetings', href: '/discovery-call/meetings', note: 'Reschedule or cancel' },
            ],
        }),
    },
    {
        match: /\b(due diligence|kyc|kyb|aml|background|screening|check)\b/i,
        reply: () => ({
            text: 'TBCA runs consent-driven due diligence on individuals, companies, suppliers, directors and investors. Choose a check to get a live quote; nothing starts until consent is recorded and payment is confirmed.',
            links: [
                { label: 'Start a Due Diligence case', href: '/due-diligence/services' },
                { label: 'Compare packages & pricing', href: '/due-diligence/pricing' },
                { label: 'My DD cases', href: '/due-diligence/cases' },
            ],
        }),
    },
    {
        match: /\b(order|track|status|download|receipt|delivery)\b/i,
        reply: (ctx) => ({
            text: ctx.signedIn
                ? 'Your orders, downloads and deliverables are in your client workspace.'
                : 'Sign in to see your orders, downloads and deliverables. You can sign in with your email or Client ID.',
            links: ctx.signedIn
                ? [
                      { label: 'Client Portal', href: '/portal' },
                      { label: 'My downloads', href: '/tools/my-downloads' },
                      { label: 'My digital library', href: '/digital-products/library' },
                  ]
                : [
                      { label: 'Client login', href: '/login' },
                      { label: 'New client registration', href: '/register' },
                  ],
        }),
    },
    {
        match: /\b(aiim|invest|market|country|province|corridor|trade)\b/i,
        reply: () => ({
            text: 'AIIM is TBCA’s Africa investment intelligence map: country, sector and corridor intelligence with confidence-graded sources, plus premium briefs.',
            links: [
                { label: 'Explore AIIM', href: '/aiim' },
                { label: 'Country explorer', href: '/find-the-right-service/countries' },
            ],
        }),
    },
    {
        match: /\b(deal room|vdr|transaction|capital raise|m&a|acquisition)\b/i,
        reply: () => ({
            text: 'The Virtual Deal Room runs a governed transaction from mandate to close: secure data room, staged disclosure, negotiation and closing in one place.',
            links: [
                { label: 'Virtual Deal Room', href: '/virtual-deal-room' },
                { label: 'Start a deal room', href: '/virtual-deal-room/enquiry' },
            ],
        }),
    },
    {
        match: /\b(subscription|retainer|monthly|ongoing)\b/i,
        reply: () => ({
            text: 'For ongoing support there are subscriptions (recurring intelligence, dashboards and support) and retainers (a monthly allowance of specialist time).',
            links: [
                { label: 'Compare subscription plans', href: '/subscriptions/compare' },
                { label: 'Retainer allowance sizing tool', href: '/retainers/allowance-sizing' },
            ],
        }),
    },
    {
        match: /\b(template|tool|calculator|toolkit|guide|resource)\b/i,
        reply: () => ({
            text: 'There are working calculators, templates and guides — many free, some paid with instant download.',
            links: [
                { label: 'Tools, templates & calculators', href: '/tools' },
                { label: 'Resource library', href: '/resources/library' },
            ],
        }),
    },
    {
        match: /\b(password|login|sign in|account|locked|mfa|register)\b/i,
        reply: () => ({
            text: 'You can sign in with your email or Client ID. TBCA will never ask for your password or one-time PIN in chat, email or WhatsApp.',
            links: [
                { label: 'Client login', href: '/login' },
                { label: 'New client registration', href: '/register' },
            ],
            suggestions: ['Talk to a person'],
        }),
    },
    {
        match: /^(hi|hello|hey|good (morning|afternoon|evening))\b/i,
        reply: (ctx) => ({
            text: `Hello${ctx.userName ? ` ${ctx.userName.split(' ')[0]}` : ''}! What can I help you with today?`,
            suggestions: STARTER_SUGGESTIONS,
        }),
    },
];

async function getReply(messages: AssistantMessage[], ctx: AssistantContext): Promise<AssistantReply> {
    const last = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
    await new Promise((r) => setTimeout(r, 450 + Math.min(900, last.length * 12)));

    const hit = INTENTS.find((i) => i.match.test(last));
    if (hit) return hit.reply(ctx);

    return {
        text: ctx.subject
            ? `I don't have a confident answer about “${ctx.subject}” yet. A TBCA specialist can answer this properly — leave your question below.`
            : "I'm not sure I've understood. I can help with finding a Sprint, pricing and payment, booking a call, due diligence, or tracking an order — or pass your question to a TBCA specialist.",
        suggestions: STARTER_SUGGESTIONS.slice(0, 5),
        handoff: true,
    };
}
