export interface WebinarEvent {
    id: number;
    slug: string;
    title: string;
    tagline: string;
    summary: string;
    speaker: string;
    speakerRole: string | null;
    category: string;
    categoryLabel: string;
    topic: string;
    icon: string;
    startsAt: string;
    endsAt: string;
    day: string;
    month: string;
    year: string;
    dateLong: string;
    timeRange: string;
    durationMinutes: number;
    format: string;
    languages: string;
    cpd: boolean;
    priceZar: number | null;
    state: string;
    stateLabel: string;
    stateTone: 'good' | 'warn' | 'bad' | 'info' | 'neutral';
    upcoming: boolean;
    live: boolean;
    registrationOpen: boolean;
    replayAvailable: boolean;
    replayDuration: string | null;
    views: number;
    featured: boolean;
    note?: string | null;
}

export interface WebinarChapter {
    n: number;
    title: string;
    start: string;
    end: string;
    views: number;
}

export interface WebinarResource {
    key: string;
    title: string;
    type: string;
    size: string | null;
    after_review: boolean;
}

export interface WebinarDetail extends WebinarEvent {
    audience: string;
    outcomes: string[];
    agenda: [string, string, string][];
    whoShouldAttend: string[];
    takeaways: string[];
    about: string[];
    speakers: [string, string][];
    faqs: [string, string][];
    chapters: WebinarChapter[];
    resources: WebinarResource[];
    quote: [string, string] | null;
}

export interface WebinarRegistrationInfo {
    id: number;
    reference: string;
    name: string;
    email: string;
    phone: string | null;
    country: string;
    organisation: string;
    role: string;
    industry: string | null;
    participation: string;
    participationLabel: string;
    participationBody: string;
    status: string;
    attendance: string;
    certificate: string;
    registeredAt: string | null;
    token: string | null;
}

export interface Notice {
    version: string;
    title: string;
    body: string;
}

export type Notices = Record<'recording' | 'offer' | 'boundary' | 'privacy', Notice>;

/** Props every selected-webinar page receives from WebinarController::frame(). */
export interface EventFrame {
    event: WebinarDetail;
    registration: WebinarRegistrationInfo | null;
    isStaff: boolean;
    notices: Notices;
}

export interface LiveQuestion {
    id: number;
    name: string;
    initials: string;
    category: string;
    body: string;
    upvotes: number;
    priority: boolean;
    pinned: boolean;
    status: string;
    at: string;
}

export interface LivePoll {
    id: number;
    question: string;
    status: 'upcoming' | 'active' | 'closed';
    total: number;
    myVote: number | null;
    options: { label: string; votes: number; pct: number }[];
}

export interface LiveRoomProps extends EventFrame {
    roomState: 'live' | 'not_started' | 'ended';
    elapsed: number;
    liveAttendees: number;
    chat: { id: number; name: string; body: string; host: boolean; at: string }[];
    questions: LiveQuestion[];
    questionCounts: { all: number; answered: number; pinned: number; dismissed: number };
    questionCategories: { label: string; count: number }[];
    qaFilters: { tab: string; search: string; category: string };
    polls: LivePoll[];
    guidelines: string[];
    suggestions: string[];
    settings: { key: string; label: string; on: boolean }[];
    canPost: boolean;
    currentTopic: string;
    slide: [number, number];
}
