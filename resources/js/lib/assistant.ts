import { useSyncExternalStore } from 'react';
import { PERSONAS, roomUrl, type DealRoomContext, type PersonaId } from '@/Components/Assistant/personas';
import { speak } from '@/Components/Assistant/voice';

/* ==========================================================================
   Site assistant — one conversation engine for every in-page persona
   (NATASHA site-wide, KAREN in the Client Portal, MICHAELA in the Virtual
   Deal Room). NIKIWE's secure chat has its own store (Components/Assistant/secureChatStore.ts).

   The UI (Components/AskQuestion.tsx) only talks to this module:
     - `useAssistant()` reads the store (persists across Inertia visits and
       reloads via sessionStorage); each persona keeps its own thread,
     - `assistant.send(persona, text, ctx)` appends the user message and asks
       that persona's reply provider.

   To connect the real AI agent, replace `getReply()` with a call to the
   backend (e.g. POST /assistant/messages with { persona, messages, context,
   knowledge: PERSONAS[persona].knowledge }) that returns the same
   `AssistantReply` shape. Nothing else needs to change.
   ========================================================================== */

export type { PersonaId };

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
    /** Present inside a Virtual Deal Room (MICHAELA). */
    room?: DealRoomContext;
}

export interface Thread {
    messages: AssistantMessage[];
    subject?: string;
    section?: string;
}

interface State {
    open: boolean;
    pending: boolean;
    threads: Partial<Record<PersonaId, Thread>>;
}

const STORAGE_KEY = 'tbca.assistant.v2';
const EMPTY_THREAD: Thread = { messages: [] };

export const STARTER_SUGGESTIONS = ['Find the right Sprint', 'Pricing & payment', 'Book a discovery call', 'Due Diligence checks', 'Track my order', 'Talk to a person'];

const uid = () => Math.random().toString(36).slice(2, 10);

function load(): State {
    const empty: State = { open: false, pending: false, threads: {} };
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return empty;
        const saved = JSON.parse(raw) as Partial<State>;
        return { ...empty, ...saved, pending: false };
    } catch {
        return empty;
    }
}

let state: State = typeof window === 'undefined' ? { open: false, pending: false, threads: {} } : load();
/** Persona that owns the current page (set by the AssistantHost). */
let bound: PersonaId = 'natasha';
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

export function threadOf(s: State, persona: PersonaId): Thread {
    return s.threads[persona] ?? EMPTY_THREAD;
}

function setThread(persona: PersonaId, patch: Partial<Thread>) {
    setState({ threads: { ...state.threads, [persona]: { ...threadOf(state, persona), ...patch } } });
}

function push(persona: PersonaId, message: Omit<AssistantMessage, 'id' | 'at'>) {
    setThread(persona, { messages: [...threadOf(state, persona).messages, { ...message, id: uid(), at: Date.now() }] });
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
    /** Called by the host so `open()` targets the persona of the current page. */
    bind(persona: PersonaId) {
        bound = persona;
    },
    open(detail: { subject?: string; section?: string } = {}) {
        const t = threadOf(state, bound);
        const changedSubject = detail.subject && detail.subject !== t.subject;
        setThread(bound, { subject: detail.subject ?? t.subject, section: detail.section ?? t.section });
        setState({ open: true });
        if (changedSubject) push(bound, { role: 'system', text: `Asking about: ${detail.subject}` });
    },
    minimise() {
        setState({ open: false });
    },
    reset(persona: PersonaId) {
        setThread(persona, { messages: [], subject: undefined, section: undefined });
        setState({ pending: false });
    },
    note(persona: PersonaId, text: string) {
        push(persona, { role: 'assistant', text });
        speak(text, PERSONAS[persona].voice);
    },
    async send(persona: PersonaId, text: string, ctx: Omit<AssistantContext, 'subject' | 'section'>) {
        const trimmed = text.trim();
        if (!trimmed || state.pending) return;

        push(persona, { role: 'user', text: trimmed });
        setState({ pending: true });
        const t = threadOf(state, persona);

        try {
            const reply = await getReply(persona, t.messages, { ...ctx, subject: t.subject, section: t.section });
            push(persona, { role: 'assistant', ...reply });
            speak(reply.text, PERSONAS[persona].voice);
        } catch {
            push(persona, {
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
   Interim reply providers (no AI yet): intent matching over the site's real
   routes so every answer points somewhere useful. One provider per persona;
   swap `getReply()` for the agent call.
   -------------------------------------------------------------------------- */

type Intent = { match: RegExp; reply: (ctx: AssistantContext) => AssistantReply };

const HUMAN = /\b(person|human|agent|specialist|someone|call me|speak|talk to)\b/i;

const NATASHA_INTENTS: Intent[] = [
    {
        match: HUMAN,
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
            text: 'Prices are set in ZAR and can be shown in USD, EUR, XOF or RMB from the currency switcher in the header; they exclude 15% VAT. You can pay by card, instant EFT or TBCA wallet at checkout, and a tax invoice is issued automatically. Scoped work is priced through a quote.',
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
                ? 'Your orders, downloads and deliverables are in your client workspace — KAREN, the Client Portal assistant, can help you there.'
                : 'Sign in to see your orders, downloads and deliverables. You can sign in with your email or Client ID.',
            links: ctx.signedIn
                ? [
                      { label: 'Client Portal', href: '/portal/dashboard' },
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
            text: 'The Virtual Deal Room runs a governed transaction from mandate to close: secure data room, staged disclosure, negotiation and closing in one place. Inside the room, MICHAELA is your assistant.',
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
        match: /\b(password|login|sign in|account|locked|mfa|register|activate)\b/i,
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
        match: /\b(whatsapp|chat on whatsapp)\b/i,
        reply: () => ({
            text: 'You can reach TBCA on WhatsApp at +27 60 801 1365, 24/7. Use the "WhatsApp / Talk" button at the top of the page to open a secure chat with NIKIWE, who will connect you to the right Functional Lead.',
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

const KAREN_INTENTS: Intent[] = [
    {
        match: HUMAN,
        reply: () => ({
            text: 'I can hand you over to a person with your context attached. Use the form below, or request a formal handoff in the portal.',
            handoff: true,
            links: [{ label: 'Human Handoff & Escalation', href: '/portal/natasha/handoff' }],
        }),
    },
    {
        match: /\b(invoice|statement|pay|payment|bill|arrears|refund|quote|quotation)\b/i,
        reply: () => ({
            text: 'Your invoices, payments and statement are in Billing. Overdue items show first; you can pay online from each invoice.',
            links: [
                { label: 'Invoices', href: '/portal/invoices' },
                { label: 'Account statement', href: '/portal/statement' },
                { label: 'Quotations', href: '/portal/quotations' },
            ],
            suggestions: ['Track my task', 'Talk to a person'],
        }),
    },
    {
        match: /\b(task|project|progress|track|status|timeline|journey)\b/i,
        reply: () => ({
            text: 'Here is where to follow your work: tasks waiting on you, project progress and the delivery timeline.',
            links: [
                { label: 'My tasks', href: '/portal/tasks' },
                { label: 'Projects', href: '/portal/projects' },
                { label: 'Timeline', href: '/portal/timeline' },
            ],
        }),
    },
    {
        match: /\b(deliverable|report|download|output|approval|approve)\b/i,
        reply: () => ({
            text: 'Released deliverables can be downloaded from Deliverables; anything waiting for your sign-off is under Approvals.',
            links: [
                { label: 'Deliverables', href: '/portal/deliverables' },
                { label: 'Approvals', href: '/portal/approvals' },
            ],
        }),
    },
    {
        match: /\b(document|upload|file|evidence|kyc)\b/i,
        reply: () => ({
            text: 'Upload and manage your documents in the Document Vault. Requested evidence is listed separately so nothing is missed.',
            links: [
                { label: 'Documents', href: '/portal/documents' },
                { label: 'Upload a document', href: '/portal/documents/upload' },
                { label: 'Evidence requests', href: '/portal/evidence' },
            ],
        }),
    },
    {
        match: /\b(ticket|support|problem|issue|complain|help)\b/i,
        reply: () => ({
            text: 'You can open a support ticket and follow its progress, or message the team directly.',
            links: [
                { label: 'Open a support ticket', href: '/portal/support?new=1' },
                { label: 'Messages', href: '/portal/messages' },
                { label: 'Help centre', href: '/portal/help' },
            ],
        }),
    },
    {
        match: /\b(meeting|session|call|book)\b/i,
        reply: () => ({
            text: 'Your meetings and Knowledge Partner sessions are listed here, with calendar downloads.',
            links: [
                { label: 'Meetings', href: '/portal/meetings' },
                { label: 'KP sessions', href: '/portal/kp-sessions' },
            ],
        }),
    },
    {
        match: /\b(password|security|mfa|login|session|privacy|data)\b/i,
        reply: () => ({
            text: 'Manage your password, MFA and active sessions under Security; privacy requests and data exports are under Privacy. TBCA will never ask for your password or one-time codes in chat.',
            links: [
                { label: 'Security & access', href: '/portal/security' },
                { label: 'Privacy & my data', href: '/portal/privacy' },
            ],
        }),
    },
    {
        match: /^(hi|hello|hey|good (morning|afternoon|evening))\b/i,
        reply: (ctx) => ({
            text: `Hello${ctx.userName ? ` ${ctx.userName.split(' ')[0]}` : ''}! What would you like to find in your portal?`,
            suggestions: ['Where is my invoice?', 'Track my task', 'My deliverables', 'Talk to a person'],
        }),
    },
];

function michaelaIntents(room?: DealRoomContext): Intent[] {
    const r = room;
    const noRoom: AssistantReply = {
        text: 'Open one of your deal rooms and I can take you straight to its data room, Q&A and current stage.',
        links: [
            { label: 'My deal rooms', href: '/virtual-deal-room/rooms' },
            { label: 'Start a deal room', href: '/virtual-deal-room/enquiry' },
        ],
    };

    return [
        {
            match: HUMAN,
            reply: () => ({
                text: 'I will pass this to the TBCA transaction team. Leave your question below; your room reference is attached automatically.',
                handoff: true,
            }),
        },
        {
            match: /\b(data room|folder|document|upload|file|nda|index)\b/i,
            reply: () =>
                r
                    ? {
                          text: `The data room for ${r.name ?? 'this deal'} holds the folder index and documents. Access follows the room's disclosure stage and your role${r.role ? ` (${r.role})` : ''}; an NDA may be required first.`,
                          links: [
                              { label: 'Open the Data Room', href: roomUrl(r.slug, 'data-room'), note: 'Folders, documents, uploads' },
                              { label: 'Data room build & AI intake', href: roomUrl(r.slug, 'data-room-build') },
                              { label: 'Controlled access & disclosure', href: roomUrl(r.slug, 'controlled-access-and-disclosure') },
                          ],
                      }
                    : noRoom,
        },
        {
            match: /\b(q&a|q and a|question|ask|diligence|clarif)/i,
            reply: () =>
                r
                    ? {
                          text: 'Due diligence questions go through the room Q&A: each question is answered from the room documents and reviewed by a human before release.',
                          links: [{ label: 'Open Due Diligence Q&A', href: roomUrl(r.slug, 'ai-qa-assistant') }],
                      }
                    : noRoom,
        },
        {
            match: /\b(stage|where are we|progress|next|step|status|gate)\b/i,
            reply: () =>
                r
                    ? {
                          text: r.stage
                              ? `${r.name ?? 'This room'} is at stage ${r.stage.code}: ${r.stage.name}.${r.nextStage ? ` Next is stage ${r.nextStage.code}: ${r.nextStage.name}.` : ''}${r.status && r.status !== 'active' ? ` Room status: ${r.status}.` : ''}`
                              : 'Open the room dashboard to see the stage stepper and what is outstanding.',
                          links: [
                              ...(r.stage ? [{ label: `Go to ${r.stage.name}`, href: r.stage.code === '0' ? roomUrl(r.slug, 'setup/deal-basics') : roomUrl(r.slug, r.stage.page) }] : []),
                              { label: 'Room dashboard', href: roomUrl(r.slug) },
                          ],
                      }
                    : noRoom,
        },
        {
            match: /\b(valuation|price|offer|term sheet|negotiat)/i,
            reply: () =>
                r
                    ? {
                          text: 'Valuation, negotiation and offers each have their own stage in the room.',
                          links: [
                              { label: 'Valuation & price bridge', href: roomUrl(r.slug, 'valuation-price-bridge') },
                              { label: 'Live negotiation room', href: roomUrl(r.slug, 'live-negotiation') },
                              { label: 'Offers & term sheets', href: roomUrl(r.slug, 'offer-term-sheet-management') },
                          ],
                      }
                    : noRoom,
        },
        {
            match: /\b(fee|bill|invoice|pay|payment|charge|commercial)\b/i,
            reply: () =>
                r
                    ? {
                          text: 'Room fees, statements and payments are under the room billing screens (available to the room owner).',
                          links: [
                              { label: 'Invoices & receipts', href: roomUrl(r.slug, 'billing/invoice-and-receipt') },
                              { label: 'Monthly statement', href: roomUrl(r.slug, 'commercial/monthly-statement') },
                              { label: 'Usage dashboard', href: roomUrl(r.slug, 'billing/usage-dashboard') },
                          ],
                      }
                    : { text: 'Deal room pricing is set out on the Virtual Deal Room page.', links: [{ label: 'Virtual Deal Room', href: '/virtual-deal-room' }] },
        },
        {
            match: /\b(how|work|what is|explain|deal room)\b/i,
            reply: () => ({
                text: 'A TBCA deal room runs your transaction through gated stages: mandate, workspace set-up, data room build, counterparty qualification, controlled disclosure, due diligence Q&A, valuation, negotiation, offers, legal documentation, conditions precedent and closing. Every action is logged.',
                links: r ? [{ label: 'Room dashboard', href: roomUrl(r.slug) }] : [{ label: 'Virtual Deal Room', href: '/virtual-deal-room' }],
            }),
        },
        {
            match: /\b(my rooms|rooms|open)\b/i,
            reply: () => ({ text: 'Here are your deal rooms.', links: [{ label: 'My deal rooms', href: '/virtual-deal-room/rooms' }] }),
        },
    ];
}

const INTENTS: Record<Exclude<PersonaId, 'nikiwe'>, (ctx: AssistantContext) => Intent[]> = {
    natasha: () => NATASHA_INTENTS,
    karen: () => KAREN_INTENTS,
    michaela: (ctx) => michaelaIntents(ctx.room),
};

const FALLBACK: Record<Exclude<PersonaId, 'nikiwe'>, string> = {
    natasha: "I'm not sure I've understood. I can help with finding a Sprint, pricing and payment, booking a call, due diligence, or tracking an order — or pass your question to a TBCA specialist.",
    karen: "I'm not sure I've understood. I can find invoices, tasks, deliverables, documents, tickets and meetings, or hand you over to a person.",
    michaela: "I'm not sure I've understood. I can open the data room, the Q&A, the current stage or billing for this room, or pass your question to the transaction team.",
};

export async function getReply(persona: PersonaId, messages: AssistantMessage[], ctx: AssistantContext): Promise<AssistantReply> {
    const last = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
    await new Promise((r) => setTimeout(r, 450 + Math.min(900, last.length * 12)));

    const key = persona === 'nikiwe' ? 'natasha' : persona;
    const hit = INTENTS[key](ctx).find((i) => i.match.test(last));
    if (hit) return hit.reply(ctx);

    return {
        text: ctx.subject ? `I don't have a confident answer about “${ctx.subject}” yet. A TBCA specialist can answer this properly — leave your question below.` : FALLBACK[key],
        suggestions: key === 'natasha' ? STARTER_SUGGESTIONS.slice(0, 5) : ['Talk to a person'],
        handoff: true,
    };
}
