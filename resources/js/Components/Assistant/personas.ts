/* ==========================================================================
   Assistant personas — one shared chat engine (lib/assistant.ts), four faces.

     NATASHA   site-wide TBCA assistant (every page unless a section persona
               replaces her)
     KAREN     Client Portal assistant (signed-in /portal/* pages)
     MICHAELA  Virtual Deal Room assistant (/virtual-deal-room/*)
     NIKIWE    WhatsApp / Talk secure chat (header button), hands over to a
               human Functional Lead by topic

   To use a real portrait later, set `portrait` to an image URL (e.g.
   '/images/assistants/natasha.webp'); the illustrated SVG face is the fallback.
   ========================================================================== */

export type PersonaId = 'natasha' | 'karen' | 'michaela' | 'nikiwe';

export type HairStyle = 'afro' | 'braids' | 'bun' | 'curls';

export interface FaceTraits {
    skin: string;
    skinShade: string;
    hair: string;
    hairStyle: HairStyle;
    lips: string;
    earring: string;
    glasses?: boolean;
    headset?: boolean;
    background: string;
}

export type OutfitStyle = 'blazer' | 'blouse' | 'wrap' | 'turtleneck';

export interface Outfit {
    name: string;
    style: OutfitStyle;
    main: string;
    accent: string;
}

export interface QuickAction {
    label: string;
    /** Sent as the user's message when clicked. Defaults to the label. */
    prompt?: string;
    /** Navigates instead of sending (deal-room links, portal pages). */
    href?: string;
    icon: 'compass' | 'tag' | 'calendar' | 'package' | 'folder' | 'help' | 'flag' | 'file' | 'invoice' | 'ticket' | 'shield' | 'user';
}

export interface PersonaContext {
    signedIn: boolean;
    userName?: string;
    page: string;
    room?: DealRoomContext;
}

export interface DealRoomContext {
    slug: string;
    name?: string;
    reference?: string;
    stage?: { code: string; name: string; page: string };
    nextStage?: { code: string; name: string } | null;
    role?: string | null;
    status?: string;
}

export interface Persona {
    id: PersonaId;
    name: string;
    title: string;
    /** Real portrait image to replace the illustration (optional). */
    portrait?: string;
    face: FaceTraits;
    outfits: Outfit[];
    voice: { pitch: number; rate: number };
    greeting: (ctx: PersonaContext) => string;
    quickActions: (ctx: PersonaContext) => QuickAction[];
    /** What this persona knows about — passed to the AI agent as a system hint later. */
    knowledge: string;
}

const first = (name?: string) => (name ? ` ${name.split(' ')[0]}` : '');

export const roomUrl = (slug: string, path = '') => `/virtual-deal-room/rooms/${slug}${path ? `/${path}` : ''}`;

export const PERSONAS: Record<PersonaId, Persona> = {
    natasha: {
        id: 'natasha',
        name: 'NATASHA',
        title: 'TBCA Assistant',
        face: { skin: '#8a5636', skinShade: '#6f4329', hair: '#1c1310', hairStyle: 'afro', lips: '#7a3b2e', earring: '#d6a32e', background: '#f0d79c' },
        outfits: [
            { name: 'Navy blazer', style: 'blazer', main: '#1f2b4a', accent: '#f4ede1' },
            { name: 'Gold blouse', style: 'blouse', main: '#d6a32e', accent: '#9a6d19' },
            { name: 'Emerald wrap', style: 'wrap', main: '#1f7a4c', accent: '#14603a' },
            { name: 'Ivory blazer', style: 'blazer', main: '#efe6d6', accent: '#16161b' },
        ],
        voice: { pitch: 1.05, rate: 1 },
        greeting: (c) =>
            `Hi${first(c.userName)}! I'm NATASHA, the TBCA assistant. I can help you find the right Sprint, explain pricing and payment, book a call, or pass your question to a TBCA specialist.`,
        quickActions: () => [
            { label: 'Find the right Sprint', icon: 'compass' },
            { label: 'Pricing & payment', icon: 'tag' },
            { label: 'Book a discovery call', icon: 'calendar' },
            { label: 'Track my order', icon: 'package' },
        ],
        knowledge: 'TBCA public site: Sprints catalogue, shop, pricing (ZAR/USD/XOF/EUR/CNY, VAT), due diligence, AIIM, Virtual Deal Room, subscriptions, retainers, tools, bookings, sign-in help.',
    },
    karen: {
        id: 'karen',
        name: 'KAREN',
        title: 'Client Portal Assistant',
        face: { skin: '#6b4026', skinShade: '#55321d', hair: '#120c0a', hairStyle: 'braids', lips: '#6e3226', earring: '#f4ede1', background: '#cfe3dc' },
        outfits: [
            { name: 'Teal blouse', style: 'blouse', main: '#1d6f6a', accent: '#124b48' },
            { name: 'Charcoal blazer', style: 'blazer', main: '#33333c', accent: '#f4ede1' },
            { name: 'Burgundy turtleneck', style: 'turtleneck', main: '#7a2638', accent: '#5c1b2a' },
            { name: 'Gold wrap', style: 'wrap', main: '#bd8a1f', accent: '#7c561a' },
        ],
        voice: { pitch: 1.12, rate: 0.98 },
        greeting: (c) =>
            `Hello${first(c.userName)}, I'm KAREN, your Client Portal assistant. I can find your invoices, tasks, tickets, deliverables and documents, or hand you over to a person.`,
        quickActions: () => [
            { label: 'Where is my invoice?', icon: 'invoice' },
            { label: 'Track my task', icon: 'flag' },
            { label: 'My deliverables', icon: 'file' },
            { label: 'Open a support ticket', icon: 'ticket' },
        ],
        knowledge: 'Client Portal: dashboard, journeys, tasks, invoices and payments, orders, deliverables, documents, tickets, messages, security and privacy tools, human handoff.',
    },
    michaela: {
        id: 'michaela',
        name: 'MICHAELA',
        title: 'Virtual Deal Room Assistant',
        face: { skin: '#9c6340', skinShade: '#7e4c2f', hair: '#2a1a12', hairStyle: 'bun', lips: '#80402f', earring: '#d6a32e', glasses: true, background: '#c9d6ea' },
        outfits: [
            { name: 'Midnight blazer', style: 'blazer', main: '#16213a', accent: '#f4ede1' },
            { name: 'Slate turtleneck', style: 'turtleneck', main: '#3d4a5c', accent: '#2a3442' },
            { name: 'Ivory blouse', style: 'blouse', main: '#f4ede1', accent: '#bd8a1f' },
            { name: 'Royal blue blazer', style: 'blazer', main: '#2f5fa8', accent: '#f4ede1' },
        ],
        voice: { pitch: 0.98, rate: 0.97 },
        greeting: (c) =>
            c.room
                ? `Hello${first(c.userName)}, I'm MICHAELA, your Deal Room assistant for ${c.room.name ?? 'this room'}${c.room.stage ? ` (current stage: ${c.room.stage.name})` : ''}. I can take you to the data room, the Q&A, the current stage or your documents.`
                : `Hello${first(c.userName)}, I'm MICHAELA, the TBCA Virtual Deal Room assistant. I can explain how deal rooms work, open your rooms, or help you start a new transaction.`,
        quickActions: (c) =>
            c.room
                ? [
                      { label: 'Open the Data Room', href: roomUrl(c.room.slug, 'data-room'), icon: 'folder' },
                      { label: 'Due Diligence Q&A', href: roomUrl(c.room.slug, 'ai-qa-assistant'), icon: 'help' },
                      { label: c.room.stage ? `Current stage: ${c.room.stage.name}` : 'Current stage', prompt: 'Where are we in the deal?', icon: 'flag' },
                      { label: 'Room dashboard', href: roomUrl(c.room.slug), icon: 'shield' },
                  ]
                : [
                      { label: 'My deal rooms', href: '/virtual-deal-room/rooms', icon: 'folder' },
                      { label: 'How a deal room works', icon: 'help' },
                      { label: 'Start a deal room', href: '/virtual-deal-room/enquiry', icon: 'flag' },
                      { label: 'Talk to a person', icon: 'user' },
                  ],
        knowledge: 'Virtual Deal Room: 20-stage transaction workflow (enquiry to exit), data room folders and documents, NDA gate, controlled disclosure, due diligence Q&A, valuation, negotiation, offers, conditions precedent, signing, billing.',
    },
    nikiwe: {
        id: 'nikiwe',
        name: 'NIKIWE',
        title: 'Secure Chat · WhatsApp / Talk',
        face: { skin: '#5c3820', skinShade: '#482a17', hair: '#0f0a08', hairStyle: 'curls', lips: '#5e2a1f', earring: '#d6a32e', headset: true, background: '#cdeedd' },
        outfits: [
            { name: 'Green blouse', style: 'blouse', main: '#128c4a', accent: '#0b5e31' },
            { name: 'Navy turtleneck', style: 'turtleneck', main: '#1f2b4a', accent: '#141c33' },
            { name: 'Coral wrap', style: 'wrap', main: '#c8553d', accent: '#8f3a29' },
            { name: 'White blazer', style: 'blazer', main: '#f4ede1', accent: '#128c4a' },
        ],
        voice: { pitch: 1.08, rate: 1.02 },
        greeting: (c) =>
            `Hi${first(c.userName)}, I'm NIKIWE from The Business Clinic.Africa. This is a secure chat. Tell me what you need and I'll connect you with the right TBCA Functional Lead.`,
        quickActions: () => [],
        knowledge: 'Front desk for WhatsApp / Talk: triage the topic, capture name and contact, hand over to the right Functional Lead.',
    },
};

/** Which persona owns the current page. */
export function personaForPath(path: string, signedIn: boolean): PersonaId {
    if (path.startsWith('/virtual-deal-room')) return 'michaela';
    if (signedIn && (path === '/portal' || path.startsWith('/portal/')) && !path.startsWith('/portal/s/')) return 'karen';
    return 'natasha';
}

/** Outfit of the day: the face never changes, the clothes rotate daily. */
export function outfitFor(persona: Persona, override?: number): Outfit {
    if (override !== undefined) return persona.outfits[override % persona.outfits.length];
    const day = Math.floor(Date.now() / 86_400_000);
    const offset = { natasha: 0, karen: 1, michaela: 2, nikiwe: 3 }[persona.id];
    return persona.outfits[(day + offset) % persona.outfits.length];
}

/* --------------------------------------------------------------------------
   NIKIWE handover routing: topic -> human Functional Lead.
   Mirrors the role-mailbox register in app/Support/Platform/Directory.php
   (client's "Employee Email Register 22", Oct 2026) — keep the two in sync.
   All role mailboxes are PROPOSED and not yet active.
   -------------------------------------------------------------------------- */

export interface FunctionalLead {
    topic: string;
    key: string;
    role: string;
    /** HC role code from the Directory register (absent for the general inbox). */
    hcCode?: string;
    email: string;
    match: RegExp;
}

export const FUNCTIONAL_LEADS: FunctionalLead[] = [
    { key: 'deal-room', topic: 'Deal Room / Transactions', role: 'Managing Partner / Executive Sponsor', hcCode: 'HC-001', email: 'managingpartner@thebusinessclinic.africa', match: /\b(deal room|vdr|deal|transaction|m&a|merger|acquisition|data room|valuation)/i },
    { key: 'due-diligence', topic: 'Due Diligence', role: 'Advisory and Delivery Lead', hcCode: 'HC-007', email: 'advisorylead@thebusinessclinic.africa', match: /\b(due diligence|kyc|kyb|aml|screening|background|vetting|check)/i },
    { key: 'finance', topic: 'Finance / Billing', role: 'Finance Controller and Systems Lead', hcCode: 'HC-011', email: 'financecontroller@thebusinessclinic.africa', match: /\b(invoice|bill|billing|payment|pay|refund|price|pricing|quote|vat|eft|account statement)/i },
    { key: 'aiim', topic: 'AIIM / Investment', role: 'Data, BI and Benefits Analyst', hcCode: 'HC-023', email: 'dataanalyst@thebusinessclinic.africa', match: /\b(aiim|invest|investor|market|country|corridor|funding|capital)/i },
    { key: 'technology', topic: 'Technology', role: 'Solution Architect', hcCode: 'HC-013', email: 'solutionarchitect@thebusinessclinic.africa', match: /\b(tech|technology|software|website|apps?\b|digital|integration|login|password|portal)/i },
    { key: 'sprints', topic: 'Sprints & Shop', role: 'Delivery Coordinator', hcCode: 'HC-022', email: 'deliverycoordinator@thebusinessclinic.africa', match: /\b(sprint|shop|basket|order|product|service|template|tool|subscription|retainer)/i },
    { key: 'general', topic: 'General', role: 'Client Relations team', email: 'Consult@thebusinessclinic.africa', match: /.*/ },
];

export function leadForText(text: string): FunctionalLead {
    return FUNCTIONAL_LEADS.find((l) => l.key !== 'general' && l.match.test(text)) ?? FUNCTIONAL_LEADS[FUNCTIONAL_LEADS.length - 1];
}

export function leadByKey(key: string): FunctionalLead {
    return FUNCTIONAL_LEADS.find((l) => l.key === key) ?? FUNCTIONAL_LEADS[FUNCTIONAL_LEADS.length - 1];
}

export const WHATSAPP_NUMBER = '27608011365';
export const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
