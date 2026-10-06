import { useSyncExternalStore } from 'react';
import { router } from '@inertiajs/react';
import { FUNCTIONAL_LEADS, PERSONAS, leadByKey, leadForText, whatsappLink, type FunctionalLead } from './personas';
import { speak } from './voice';

/* ==========================================================================
   NIKIWE secure chat ("WhatsApp / Talk"): conversation store + handover.

   Flow: the client chats -> NIKIWE identifies the topic -> asks for name and
   a WhatsApp number or email -> hands over to the topic's Functional Lead by
   POSTing the transcript to /forms/whatsapp-chat (stored as a Submission)
   -> shows the reference and a "Continue on WhatsApp" link.

   "Never lose a lead": contact is captured before the handover, the chat
   survives page visits (sessionStorage), and closing an un-handed chat asks
   once for contact details first.

   To wire the AI agent, replace `nikiweReply()`; the handover stays as is.
   ========================================================================== */

export type Tick = 'sent' | 'delivered' | 'read';

export interface SecureMessage {
    id: string;
    from: 'client' | 'nikiwe' | 'system';
    text: string;
    at: number;
    status?: Tick;
    links?: { label: string; href: string }[];
}

export type Stage = 'chat' | 'capture' | 'handed';

export interface Contact {
    name: string;
    whatsapp: string;
    email: string;
}

interface State {
    open: boolean;
    pending: boolean;
    stage: Stage;
    messages: SecureMessage[];
    topic?: string;
    reference?: string;
    submitting: boolean;
    error?: string;
    /** Close was attempted with an un-handed conversation. */
    confirmClose: boolean;
    contact: Contact;
}

const KEY = 'tbca.securechat.v1';
const EMPTY: State = { open: false, pending: false, stage: 'chat', messages: [], submitting: false, confirmClose: false, contact: { name: '', whatsapp: '', email: '' } };
const uid = () => Math.random().toString(36).slice(2, 10);

function load(): State {
    try {
        const raw = window.sessionStorage.getItem(KEY);
        return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<State>), pending: false, submitting: false } : EMPTY;
    } catch {
        return EMPTY;
    }
}

let state: State = typeof window === 'undefined' ? EMPTY : load();
const listeners = new Set<() => void>();
/** Signed-in user (set by the AssistantHost) used to prefill the contact card. */
let boundUser: { name: string; email?: string } | null = null;

function set(patch: Partial<State>) {
    state = { ...state, ...patch };
    try {
        window.sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
        /* private mode — chat still works on this page */
    }
    listeners.forEach((l) => l());
}

function push(m: Omit<SecureMessage, 'id' | 'at'>) {
    const msg = { ...m, id: uid(), at: Date.now() };
    set({ messages: [...state.messages, msg] });
    return msg.id;
}

function tick(id: string, status: Tick) {
    set({ messages: state.messages.map((m) => (m.id === id ? { ...m, status } : m)) });
}

function say(text: string, links?: SecureMessage['links']) {
    push({ from: 'nikiwe', text, links });
    speak(text, PERSONAS.nikiwe.voice);
}

export function useSecureChat(): State {
    return useSyncExternalStore(
        (l) => {
            listeners.add(l);
            return () => listeners.delete(l);
        },
        () => state,
        () => EMPTY,
    );
}

export const lead = (): FunctionalLead => leadByKey(state.topic ?? 'general');

const TOPIC_HELP: Record<string, { text: string; links?: SecureMessage['links'] }> = {
    sprints: { text: 'Sprints are fixed-scope, fixed-price engagements; you can browse and buy them in the shop.', links: [{ label: 'Browse Sprints', href: '/sprints' }] },
    'due-diligence': { text: 'Our due diligence checks are consent-driven and quoted upfront.', links: [{ label: 'Due Diligence services', href: '/due-diligence/services' }] },
    aiim: { text: 'AIIM is our Africa investment intelligence map, covering countries, sectors and corridors.', links: [{ label: 'Explore AIIM', href: '/aiim' }] },
    'deal-room': { text: 'Transactions run in our Virtual Deal Room, from mandate to close.', links: [{ label: 'Virtual Deal Room', href: '/virtual-deal-room' }] },
    technology: { text: 'Our Technology Solutions team handles digital, systems and integration work.', links: [{ label: 'Technology Solutions', href: '/technology-solutions' }] },
    finance: { text: 'Billing, invoices and payment questions go to our finance team. Please never share card numbers, PINs or passwords in chat.' },
    general: { text: 'Happy to help.' },
};

/** Interim NIKIWE reply provider (topic triage). Replace with the AI agent. */
async function nikiweReply(text: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 600 + Math.min(900, text.length * 10)));

    if (state.stage === 'handed') {
        say(`Your ${lead().role} already has this conversation${state.reference ? ` (reference ${state.reference})` : ''}. To add more, continue on WhatsApp and quote your reference, or start a new chat.`);
        return;
    }

    const detected = leadForText(text);
    const topic = detected.key !== 'general' || !state.topic ? detected.key : state.topic;
    const l = leadByKey(topic);
    const help = TOPIC_HELP[topic] ?? TOPIC_HELP.general;

    set({ topic });
    say(
        `${help.text} This is one for our ${l.role}. So we never lose your request, please share your name and a WhatsApp number or email below, and I'll hand you over now.`,
        help.links,
    );
    set({ stage: 'capture' });
}

const TOPIC_LIST = FUNCTIONAL_LEADS.map((l) => ({ key: l.key, label: l.topic }));
export { TOPIC_LIST };

export const secureChat = {
    bindUser(user: { name: string; email?: string } | null) {
        boundUser = user;
    },
    open(prefill: Partial<Contact> | undefined = boundUser ?? undefined) {
        const contact = { ...state.contact };
        if (prefill?.name && !contact.name) contact.name = prefill.name;
        if (prefill?.email && !contact.email) contact.email = prefill.email;
        set({ open: true, confirmClose: false, contact });
        if (state.messages.length === 0) {
            push({ from: 'system', text: 'Secure session started · messages are encrypted in transit' });
            say(PERSONAS.nikiwe.greeting({ signedIn: Boolean(prefill?.name), userName: prefill?.name, page: '' }) + ' What would you like help with?');
        }
    },
    /** Close, but ask once for contact details if the lead isn't handed over yet. */
    requestClose() {
        const engaged = state.messages.some((m) => m.from === 'client');
        if (engaged && state.stage !== 'handed' && !state.confirmClose) {
            set({ confirmClose: true, stage: 'capture' });
            return;
        }
        set({ open: false, confirmClose: false });
    },
    close() {
        set({ open: false, confirmClose: false });
    },
    reset() {
        set({ ...EMPTY, open: true, contact: state.contact });
        secureChat.open();
    },
    setContact(patch: Partial<Contact>) {
        set({ contact: { ...state.contact, ...patch } });
    },
    pickTopic(key: string) {
        void secureChat.send(leadByKey(key).topic);
    },
    async send(text: string) {
        const t = text.trim();
        if (!t || state.pending) return;
        const id = push({ from: 'client', text: t, status: 'sent' });
        set({ pending: true });
        setTimeout(() => tick(id, 'delivered'), 350);
        try {
            await nikiweReply(t);
            tick(id, 'read');
        } finally {
            set({ pending: false });
        }
    },
    /** Hand over to the Functional Lead: persists the lead + transcript. */
    handover(page: string) {
        const c = state.contact;
        if (!c.name.trim() || (!c.whatsapp.trim() && !c.email.trim())) {
            set({ error: 'Please add your name and a WhatsApp number or email.' });
            return;
        }
        const l = lead();
        const transcript = state.messages
            .filter((m) => m.from !== 'system')
            .map((m) => `[${new Date(m.at).toISOString()}] ${m.from === 'client' ? c.name || 'Client' : 'NIKIWE'}: ${m.text}`)
            .join('\n');
        const firstQuestion = state.messages.find((m) => m.from === 'client')?.text ?? 'WhatsApp / Talk enquiry';

        set({ submitting: true, error: undefined });
        router.post(
            '/forms/whatsapp-chat',
            {
                name: c.name.trim(),
                email: c.email.trim() || null,
                whatsapp: c.whatsapp.trim() || null,
                subject: `${l.topic}: ${firstQuestion.slice(0, 150)}`,
                section: 'whatsapp',
                channel: 'secure-chat',
                assistant: 'NIKIWE',
                topic: l.topic,
                topic_key: l.key,
                assigned_lead_role: l.role,
                assigned_lead_email: l.email,
                page,
                transcript,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (p) => {
                    const ref = (p.props as { flash?: { reference?: string | null } }).flash?.reference ?? undefined;
                    set({ stage: 'handed', reference: ref, confirmClose: false });
                    push({ from: 'system', text: `Handed over to ${l.role}${ref ? ` · Ref ${ref}` : ''}` });
                    say(
                        `Thank you, ${c.name.trim().split(' ')[0]}. I've handed your conversation to our ${l.role}${ref ? ` under reference ${ref}` : ''}. They will contact you ${c.whatsapp.trim() ? 'on WhatsApp' : 'by email'} shortly. You can also continue on WhatsApp right now.`,
                    );
                },
                onError: (errors) => set({ error: Object.values(errors)[0] ?? 'Something went wrong. Please try again.' }),
                onFinish: () => set({ submitting: false }),
            },
        );
    },
};

export function continueOnWhatsapp(): string {
    const l = lead();
    return whatsappLink(`Hi TBCA, continuing my secure chat with NIKIWE${state.reference ? ` (ref ${state.reference})` : ''} about ${l.topic}.`);
}
