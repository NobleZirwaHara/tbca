import { Link, usePage } from '@inertiajs/react';
import * as L from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Flash from '@/Components/Flash';
import HeroArt from '@/Components/Art/HeroArt';
import CoverArt from '@/Components/Art/CoverArt';
import AfricaMark from '@/Components/AfricaMark';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { Notices, WebinarDetail, WebinarEvent, WebinarRegistrationInfo } from '@/types/webinars';

/* ========================================================================== */
/* Icons and colours                                                          */
/* ========================================================================== */

const ICONS: Record<string, LucideIcon> = {
    'activity': L.Activity, 'arrow-left': L.ArrowLeft, 'arrow-right': L.ArrowRight, 'award': L.Award, 'badge-check': L.BadgeCheck, 'bar-chart-3': L.ChartColumn,
    'bell': L.Bell, 'book-open': L.BookOpen, 'bot': L.Bot, 'briefcase': L.Briefcase, 'building-2': L.Building2, 'calendar-days': L.CalendarDays,
    'check': L.Check, 'circle-check': L.CircleCheck, 'circle-dot': L.CircleDot, 'clipboard-check': L.ClipboardCheck, 'clock': L.Clock, 'coins': L.Coins,
    'copy': L.Copy, 'cpu': L.Cpu, 'database': L.Database, 'download': L.Download, 'external-link': L.ExternalLink, 'eye': L.Eye, 'eye-off': L.EyeOff,
    'file-check': L.FileCheck, 'file-text': L.FileText, 'filter': L.Filter, 'gift': L.Gift, 'globe': L.Globe, 'handshake': L.Handshake, 'help': L.CircleHelp,
    'hourglass': L.Hourglass, 'layers': L.Layers, 'lightbulb': L.Lightbulb, 'lock': L.Lock, 'mail': L.Mail, 'map': L.Map, 'message-circle': L.MessageCircle,
    'percent': L.Percent, 'pin': L.Pin, 'play': L.Play, 'radio': L.Radio, 'rocket': L.Rocket, 'scale': L.Scale, 'search': L.Search, 'settings': L.Settings,
    'shield': L.Shield, 'shield-check': L.ShieldCheck, 'shopping-bag': L.ShoppingBag, 'sparkles': L.Sparkles, 'star': L.Star, 'target': L.Target,
    'trending-up': L.TrendingUp, 'triangle-alert': L.TriangleAlert, 'user-check': L.UserCheck, 'user-x': L.UserX, 'users': L.Users, 'video': L.Video,
    'wrench': L.Wrench, 'x': L.X, 'zap': L.Zap, 'languages': L.Languages, 'wifi': L.Wifi,
    'mic': L.Mic, 'presentation': L.Presentation, 'layout-dashboard': L.LayoutDashboard, 'user': L.User, 'calendar-check': L.CalendarCheck,
    'crown': L.Crown, 'mountain': L.Mountain, 'heart-pulse': L.HeartPulse, 'share': L.Share2, 'help-circle': L.CircleHelp,
    'pen': L.PenLine, 'graduation-cap': L.GraduationCap, 'smile': L.Smile, 'sprout': L.Sprout, 'heart-handshake': L.HeartHandshake, 'list': L.List, 'book': L.Book,
    'printer': L.Printer, 'calculator': L.Calculator, 'compass': L.Compass, 'flag': L.Flag, 'gauge': L.Gauge, 'list-checks': L.ListChecks, 'school': L.School, 'wifi-off': L.WifiOff, 'quote': L.Quote, 'info': L.Info, 'circle-alert': L.CircleAlert, 'thumbs-up': L.ThumbsUp, 'map-pin': L.MapPin, 'landmark': L.Landmark, 'printer-check': L.Printer,
};

export function ico(name?: string | null): LucideIcon {
    return (name && ICONS[name]) || L.Circle;
}

export function Ico({ name, className }: { name?: string | null; className?: string }) {
    const I = ico(name);
    return <I className={cn('size-4', className)} aria-hidden="true" />;
}

export const COLORS: Record<string, string> = {
    gold: '#d6a32e', green: '#2f9e66', blue: '#3b6fb6', red: '#d0473a', purple: '#7a4fa3', orange: '#e08a2e', grey: '#9a9aa5', teal: '#2a9d8f',
};
const SEQ = ['blue', 'gold', 'green', 'purple', 'red', 'orange', 'grey'];
export const colorOf = (c?: string, i = 0) => COLORS[c ?? ''] ?? c ?? COLORS[SEQ[i % SEQ.length]];

const TONE_BG: Record<string, string> = {
    blue: 'bg-controlled-50 text-controlled-500', green: 'bg-verified-50 text-verified-500', red: 'bg-risk-50 text-risk-500',
    gold: 'bg-gold-100 text-gold-700', purple: 'bg-referenced-50 text-referenced-500', orange: 'bg-attested-50 text-attested-500',
};
export const toneBg = (t: string) => TONE_BG[t] ?? TONE_BG.gold;

/** Money value placeholder used by the console registers: "money:12345". */
export function useMoneyText() {
    const price = usePrice('n/a');
    return (v: unknown): string => {
        if (typeof v === 'string' && v.startsWith('money:')) return price(Number(v.slice(6)));
        return v === null || v === undefined ? '' : String(v);
    };
}

/* ========================================================================== */
/* Buttons                                                                    */
/* ========================================================================== */

const BTN = {
    gold: 'bg-gold-500 text-ink-900 hover:bg-gold-400 border border-gold-500',
    outline: 'border border-gold-600 text-ink-900 bg-white hover:bg-gold-50',
    dark: 'bg-ink-900 text-parchment-100 hover:bg-ink-800 border border-ink-900',
    ghostDark: 'border border-gold-600/70 text-parchment-100 hover:text-gold-300 hover:border-gold-400',
    danger: 'bg-risk-500 text-white hover:bg-risk-700 border border-risk-500',
} as const;
export type BtnTone = keyof typeof BTN;

export function btnClass(tone: BtnTone = 'gold', size: 'sm' | 'md' | 'lg' = 'md') {
    return cn(
        'inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        { sm: 'h-8 px-3 text-[0.75rem]', md: 'h-10 px-4 text-[0.8125rem]', lg: 'h-12 px-6 text-[0.9375rem]' }[size],
        BTN[tone],
    );
}

export function BtnLink({ href, tone = 'gold', size = 'md', icon, children, className, external, download }: { href: string; tone?: BtnTone; size?: 'sm' | 'md' | 'lg'; icon?: string; children: ReactNode; className?: string; external?: boolean; download?: boolean }) {
    const inner = (
        <>
            {icon && <Ico name={icon} />}
            {children}
        </>
    );
    if (external || download || href.startsWith('http') || href.endsWith('.ics') || href.includes('/resources/') || href.includes('/certificate') || href.includes('/export/')) {
        return (
            <a href={href} className={cn(btnClass(tone, size), className)} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {inner}
            </a>
        );
    }
    return (
        <Link href={href} className={cn(btnClass(tone, size), className)}>
            {inner}
        </Link>
    );
}

/* ========================================================================== */
/* Shell                                                                      */
/* ========================================================================== */

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const STAFF_NAV: [string, string, LucideIcon][] = [
    ['Registration & Attendees', 'registrations', L.Users],
    ['Attendance & Analytics', 'analytics', L.ChartColumn],
    ['No-Show Follow-Up', 'no-shows', L.Mail],
    ['Production & Pre-Flight', 'preflight', L.Settings],
    ['Live Moderation', 'moderation', L.Radio],
    ['Replay Review', 'replay-review', L.CirclePlay],
    ['Replay Distribution', 'distribution', L.Share2],
    ['Performance Analytics', 'performance', L.TrendingUp],
    ['Revenue & Commercial', 'commercial', L.ShoppingBag],
    ['Revenue Attribution', 'attribution', L.Coins],
    ['Guests, Partners & Sponsors', 'guests', L.Handshake],
    ['Claims & Evidence', 'claims', L.FileCheck],
    ['Privacy, Consent & Recording', 'privacy', L.ShieldCheck],
    ['Incident, Risk & Correction', 'incidents', L.TriangleAlert],
    ['Compliance, Audit & Governance', 'compliance', L.Scale],
];

export function staffNav(slug: string): NavItem[] {
    return [
        { label: 'Executive Command Centre', href: '/admin/webinars', icon: L.LayoutDashboard },
        ...STAFF_NAV.map(([label, key, icon]) => ({ label, href: `/admin/webinars/${slug}/${key}`, icon })),
    ];
}

function eventNav(slug: string): NavItem[] {
    const b = `/webinars/${slug}`;
    return [
        { label: 'Event Details', href: b, icon: L.CalendarDays },
        { label: 'My Registration', href: `${b}/my-registration`, icon: L.CalendarCheck },
        { label: 'Pre-Event Access', href: `${b}/pre-event`, icon: L.Ticket },
        { label: 'Live Session', href: `${b}/live`, icon: L.Video },
        { label: 'Live Q&A', href: `${b}/live/qa`, icon: L.MessageSquare },
        { label: 'Live Polls', href: `${b}/live/polls`, icon: L.ChartColumn },
        { label: 'Post-Event', href: `${b}/thank-you`, icon: L.CirclePlay },
        { label: 'Post-Event Offers', href: `${b}/offers`, icon: L.Tag },
        { label: 'Replay Library', href: `${b}/replay`, icon: L.MonitorPlay },
        { label: 'Missed the Session', href: `${b}/missed`, icon: L.Mail },
    ];
}

const HUB_NAV: NavItem[] = [
    { label: 'Webinars', href: '/webinars', icon: L.CalendarDays },
    { label: 'Upcoming', href: '/webinars?when=upcoming', icon: L.CalendarClock },
    { label: 'My Registrations', href: '/webinars/my-registrations', icon: L.CalendarCheck },
    { label: 'Replay Library', href: '/webinars/replays', icon: L.MonitorPlay },
    { label: 'Certificates', href: '/webinars/my-registrations?tab=certificates', icon: L.Award },
    { label: 'My Notes', href: '/webinars/my-registrations?tab=notes', icon: L.NotebookPen },
    { label: 'Recommended', href: '/webinars?cpd=1', icon: L.Star },
    { label: 'Calendar', href: '/webinars?view=calendar', icon: L.CalendarDays },
];

function isActive(href: string, path: string, query: string) {
    const [p, q] = href.split('?');
    if (q) return path === p && query.includes(q);
    return path === p && !(p === '/webinars' && query.length > 0 && /when=|view=|cpd=/.test(query));
}

export function WebinarShell({
    event,
    children,
    rail,
    wide,
    staffSlug,
}: {
    event?: Pick<WebinarEvent, 'slug' | 'title'> | null;
    children: ReactNode;
    rail?: ReactNode;
    wide?: boolean;
    staffSlug?: string;
}) {
    const { auth, url } = usePage<SharedProps>().props;
    const path = url?.path ?? (typeof window !== 'undefined' ? window.location.pathname : '');
    const query = typeof window !== 'undefined' ? window.location.search : '';
    const isStaff = auth.user?.role === 'admin';
    const groups: { title?: string; items: NavItem[] }[] = [];
    if (event) {
        groups.push({ items: [{ label: 'Back to Webinars', href: '/webinars', icon: L.ArrowLeft }, ...eventNav(event.slug)] });
    } else {
        groups.push({ items: HUB_NAV });
    }
    if (isStaff) groups.push({ title: 'Staff Consoles', items: staffNav(staffSlug ?? event?.slug ?? 'from-vision-to-execution') });
    groups.push({ items: [{ label: 'Help & Support', href: '/contact', icon: L.CircleHelp }] });
    const flat = groups.flatMap((g) => g.items);

    return (
        <div className="relative isolate flex min-h-screen flex-col bg-parchment-100">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[4px] focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-900">
                Skip to content
            </a>
            <Header variant="dark" />
            <div className="flex flex-1">
                <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-800 bg-ink-950 text-parchment-200 lg:flex" aria-label="Webinars navigation">
                    <nav className="flex-1 overflow-y-auto px-2 py-4">
                        {groups.map((g, gi) => (
                            <div key={gi} className="mb-3">
                                {g.title && <p className="px-3 pt-2 pb-1.5 text-[0.6875rem] font-bold tracking-wider text-gold-500 uppercase">{g.title}</p>}
                                <ul className="space-y-0.5">
                                    {g.items.map((item) => {
                                        const active = isActive(item.href, path, query);
                                        const I = item.icon;
                                        return (
                                            <li key={item.href + item.label}>
                                                <Link
                                                    href={item.href}
                                                    aria-current={active ? 'page' : undefined}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-[6px] px-3 py-2 text-[0.8125rem] transition-colors',
                                                        active ? 'bg-gradient-to-r from-gold-600/90 to-gold-700/60 font-semibold text-parchment-50' : 'text-parchment-200 hover:bg-ink-900 hover:text-gold-300',
                                                    )}
                                                >
                                                    <I className="size-4 shrink-0" aria-hidden="true" />
                                                    <span className="truncate">{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                    <PlusCard />
                </aside>

                <main id="main" className="min-w-0 flex-1">
                    <nav className="flex gap-1.5 overflow-x-auto border-b border-ink-800 bg-ink-950 px-4 py-2 lg:hidden" aria-label="Webinars navigation">
                        {flat.map((item) => (
                            <Link
                                key={item.href + item.label}
                                href={item.href}
                                className={cn('shrink-0 rounded-full border px-3 py-1 text-xs', isActive(item.href, path, query) ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-700 text-parchment-200')}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className={cn('grid gap-5 p-4 sm:p-5', rail && !wide && 'xl:grid-cols-[minmax(0,1fr)_21rem]')}>
                        <div className="min-w-0 space-y-5">{children}</div>
                        {rail && <aside className="min-w-0 space-y-4">{rail}</aside>}
                    </div>
                </main>
            </div>
            <Footer />
            <Flash />
        </div>
    );
}

function PlusCard() {
    return (
        <div className="m-3 rounded-[10px] border border-gold-600/60 bg-ink-900 p-4">
            <L.Gem className="size-7 text-gold-500" aria-hidden="true" />
            <p className="mt-2 font-serif text-lg text-gold-400">TBCA Plus</p>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-parchment-200">Get premium webinars, exclusive reports and advisory support.</p>
            <Link href="/subscriptions" className={cn(btnClass('gold', 'md'), 'mt-3 w-full')}>
                Upgrade Now
            </Link>
        </div>
    );
}

/* ========================================================================== */
/* Event building blocks                                                      */
/* ========================================================================== */

export function Crumbs({ items, dark }: { items: [string, string?][]; dark?: boolean }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className={cn('flex flex-wrap items-center gap-1.5 text-[0.75rem]', dark ? 'text-parchment-200' : 'text-ink-500')}>
                {items.map(([label, href], i) => (
                    <li key={label + i} className="flex items-center gap-1.5">
                        {i > 0 && <L.ChevronRight className="size-3" aria-hidden="true" />}
                        {href && i < items.length - 1 ? <Link href={href} className="hover:text-gold-400">{label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{label}</span>}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

export function Eyebrow({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'live' }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.16em] uppercase', tone === 'live' ? 'bg-risk-500 text-white' : 'border border-gold-600 bg-gold-500/15 text-gold-400')}>
            {tone === 'live' && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
            {children}
        </span>
    );
}

/** Dark hero band with the Africa network art, used at the top of every journey page. */
export function EventHero({
    crumbs,
    eyebrow,
    eyebrowTone,
    title,
    gold,
    lead,
    children,
    aside,
}: {
    crumbs?: [string, string?][];
    eyebrow?: ReactNode;
    eyebrowTone?: 'gold' | 'live';
    title: ReactNode;
    gold?: ReactNode;
    lead?: ReactNode;
    children?: ReactNode;
    aside?: ReactNode;
}) {
    return (
        <section className="relative overflow-hidden rounded-[12px] bg-ink-950 text-parchment-100 shadow-raised">
            <HeroArt className="absolute inset-0 h-full w-full opacity-90" />
            <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="max-w-3xl">
                    {crumbs && <Crumbs items={crumbs} dark />}
                    {eyebrow && <div className="mt-3">{typeof eyebrow === 'string' ? <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow> : eyebrow}</div>}
                    <h1 className="mt-3 font-serif text-[1.875rem] leading-[1.1] font-bold text-parchment-50 sm:text-[2.5rem]">
                        {title}
                        {gold && (
                            <>
                                <br />
                                <span className="text-gold-400">{gold}</span>
                            </>
                        )}
                    </h1>
                    {lead && <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-parchment-200">{lead}</p>}
                    {children && <div className="mt-5">{children}</div>}
                </div>
                {aside && <div className="lg:w-72">{aside}</div>}
            </div>
        </section>
    );
}

export function FactsStrip({ event, dark = true, className }: { event: WebinarEvent; dark?: boolean; className?: string }) {
    const price = usePrice();
    const facts: [LucideIcon, string, string][] = [
        [L.CalendarDays, event.dateLong, event.timeRange],
        [L.Wifi, event.format, event.live ? 'Live now' : 'Live webinar'],
        [L.Languages, 'Languages', event.languages],
        [L.Award, event.cpd ? 'Certificate' : 'Attendance', event.cpd ? 'CPD Eligible' : 'Attendance record'],
        [L.Ticket, 'Access', event.priceZar ? price(event.priceZar) : 'Free to attend'],
    ];
    return (
        <ul className={cn('grid gap-3 rounded-[10px] border p-3 sm:grid-cols-3 lg:grid-cols-5', dark ? 'border-gold-700/50 bg-ink-950/70' : 'border-parchment-400 bg-white', className)}>
            {facts.map(([I, a, b]) => (
                <li key={a + b} className="flex items-center gap-2.5">
                    <I className="size-6 shrink-0 text-gold-500" aria-hidden="true" />
                    <span className="min-w-0">
                        <span className={cn('block text-[0.8125rem] leading-tight font-semibold', dark ? 'text-parchment-50' : 'text-ink-900')}>{a}</span>
                        <span className={cn('block text-[0.6875rem]', dark ? 'text-parchment-300' : 'text-ink-500')}>{b}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

export function DateBadge({ event, className }: { event: Pick<WebinarEvent, 'day' | 'month' | 'year'>; className?: string }) {
    return (
        <div className={cn('flex w-14 shrink-0 flex-col items-center rounded-[6px] bg-white py-1.5 text-center text-ink-900 shadow', className)}>
            <span className="text-[0.6875rem] font-bold">{event.month}</span>
            <span className="text-xl leading-none font-bold">{event.day}</span>
            <span className="text-[0.625rem]">{event.year}</span>
        </div>
    );
}

export function StateChip({ event, className }: { event: Pick<WebinarEvent, 'stateLabel' | 'stateTone' | 'live'>; className?: string }) {
    const tone = {
        good: 'bg-verified-50 text-verified-700 border-verified-500/40', warn: 'bg-attested-50 text-attested-700 border-attested-500/40', bad: 'bg-risk-500 text-white border-risk-500',
        info: 'bg-controlled-50 text-controlled-700 border-controlled-500/40', neutral: 'bg-parchment-300 text-ink-700 border-parchment-500',
    }[event.stateTone];
    return <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-bold uppercase', tone, className)}>{event.live && <span className="size-1.5 animate-pulse rounded-full bg-white" />}{event.stateLabel}</span>;
}

/** Generated cover image with the event date and state. */
export function EventCover({ event, className, children }: { event: WebinarEvent; className?: string; children?: ReactNode }) {
    return (
        <div className={cn('relative overflow-hidden bg-ink-900', className)}>
            <CoverArt seed={event.slug} category={event.category === 'technology' ? 'ai-automation' : event.category === 'finance' ? 'digital-products' : 'business-management'} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
            <DateBadge event={event} className="absolute top-2.5 left-2.5" />
            <span className="absolute top-2.5 right-2.5 rounded-[4px] bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-ink-900 uppercase">{event.live ? 'Live Now' : event.upcoming ? 'Live Webinar' : event.categoryLabel}</span>
            <Ico name={event.icon} className="absolute right-4 bottom-3 size-9 text-gold-400/90" />
            {children}
        </div>
    );
}

export function Countdown({ target, light, onDone }: { target: string; light?: boolean; onDone?: () => void }) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const diff = Math.max(0, new Date(target).getTime() - now);
    useEffect(() => {
        if (diff === 0) onDone?.();
    }, [diff, onDone]);
    const parts: [number, string][] = [
        [Math.floor(diff / 86400000), 'Days'],
        [Math.floor(diff / 3600000) % 24, 'Hours'],
        [Math.floor(diff / 60000) % 60, 'Minutes'],
        [Math.floor(diff / 1000) % 60, 'Seconds'],
    ];
    return (
        <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Time until the session starts">
            {parts.map(([n, l]) => (
                <div key={l} className={cn('rounded-[8px] border py-2 text-center', light ? 'border-gold-300 bg-gold-50' : 'border-gold-600/70 bg-ink-900')}>
                    <span className={cn('block font-serif text-2xl font-bold tabular-nums', light ? 'text-ink-900' : 'text-parchment-50')}>{String(n).padStart(2, '0')}</span>
                    <span className={cn('text-[0.6875rem]', light ? 'text-ink-500' : 'text-parchment-300')}>{l}</span>
                </div>
            ))}
        </div>
    );
}

export function Elapsed({ start }: { start: number }) {
    const [s, setS] = useState(start);
    useEffect(() => {
        const t = setInterval(() => setS((x) => x + 1), 1000);
        return () => clearInterval(t);
    }, []);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor(s / 60) % 60;
    const ss = s % 60;
    return <span className="tabular-nums">{[hh, mm, ss].map((n) => String(n).padStart(2, '0')).join(':')}</span>;
}

/* ========================================================================== */
/* Cards                                                                      */
/* ========================================================================== */

export function Card({ title, icon, action, children, className, tone = 'light', id }: { title?: ReactNode; icon?: string; action?: ReactNode; children: ReactNode; className?: string; tone?: 'light' | 'dark' | 'cream' | 'blue'; id?: string }) {
    const tones = {
        light: 'border-parchment-400 bg-white text-ink-700',
        dark: 'border-gold-700/50 bg-ink-950 text-parchment-200',
        cream: 'border-gold-200 bg-gold-50 text-ink-700',
        blue: 'border-controlled-500/20 bg-controlled-50 text-ink-700',
    };
    return (
        <section id={id} className={cn('rounded-[10px] border p-4 sm:p-5', tones[tone], className)}>
            {(title || action) && (
                <header className="mb-3 flex items-start justify-between gap-3">
                    {title && (
                        <h2 className={cn('flex items-center gap-2 font-serif text-[1.125rem] leading-tight font-bold', tone === 'dark' ? 'text-parchment-50' : 'text-ink-900')}>
                            {icon && <Ico name={icon} className="size-5 text-gold-500" />}
                            {title}
                        </h2>
                    )}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function RailEvent({ event, title = 'Event Summary', action }: { event: WebinarEvent; title?: string; action?: ReactNode }) {
    return (
        <Card tone="dark" title={title} action={action ?? <StateChip event={event} />}>
            <EventCover event={event} className="aspect-[16/8] rounded-[8px]" />
            <p className="mt-3 font-serif text-[1.0625rem] leading-snug font-bold text-parchment-50">{event.title}</p>
            <p className="mt-1 text-[0.75rem] text-parchment-300">{event.tagline}</p>
            <div className="mt-3 flex items-center gap-2.5 border-t border-ink-800 pt-3">
                <Avatar name={event.speaker} />
                <span>
                    <span className="block text-[0.8125rem] font-semibold text-parchment-50">{event.speaker}</span>
                    <span className="block text-[0.6875rem] text-gold-400">{event.speakerRole}</span>
                </span>
            </div>
        </Card>
    );
}

export function KeyDetails({ event, title = 'Key Details' }: { event: WebinarEvent; title?: string }) {
    const rows: [LucideIcon, string, string][] = [
        [L.CalendarDays, 'Date', event.dateLong],
        [L.Clock, 'Time', event.timeRange],
        [L.Wifi, 'Format', event.format],
        [L.Languages, 'Languages', event.languages],
        [L.Award, 'CPD', event.cpd ? 'Eligible' : 'Not eligible'],
    ];
    return (
        <Card tone="dark" title={title}>
            <ul className="divide-y divide-ink-800">
                {rows.map(([I, k, v]) => (
                    <li key={k} className="flex items-center gap-3 py-2">
                        <I className="size-5 text-gold-500" aria-hidden="true" />
                        <span>
                            <span className="block text-[0.6875rem] text-parchment-300">{k}</span>
                            <span className="block text-[0.8125rem] text-parchment-50">{v}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

export function HelpCard({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
    const { contact } = usePage<SharedProps>().props;
    return (
        <Card tone={tone} title="Need Help?" icon="help">
            <p className="text-[0.8125rem]">Our webinars support team is here to help.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={contact?.whatsapp_url ?? 'https://wa.me/'} target="_blank" rel="noreferrer" className={btnClass(tone === 'dark' ? 'ghostDark' : 'outline', 'sm')}>
                    <L.MessageCircle className="size-4" aria-hidden="true" /> Chat on WhatsApp
                </a>
                <a href={`mailto:${contact?.email ?? 'consult@thebusinessclinic.africa'}?subject=Webinar%20support`} className={btnClass(tone === 'dark' ? 'ghostDark' : 'outline', 'sm')}>
                    <L.Mail className="size-4" aria-hidden="true" /> Email Support
                </a>
            </div>
        </Card>
    );
}

const NOTICE_STYLE = {
    recording: [L.Video, 'bg-controlled-50 border-controlled-500/25', 'text-controlled-500'],
    offer: [L.Tag, 'bg-gold-50 border-gold-300', 'text-gold-700'],
    boundary: [L.Scale, 'bg-parchment-200 border-parchment-500', 'text-ink-700'],
    privacy: [L.ShieldCheck, 'bg-verified-50 border-verified-500/25', 'text-verified-500'],
} as const;

/** WB-COMP-04/05: recording notice, offer disclosure and professional boundary, shown with equal weight. */
export function NoticeCards({ notices, keys = ['recording', 'offer'], dark }: { notices: Notices; keys?: (keyof Notices)[]; dark?: boolean }) {
    return (
        <div className={cn('grid gap-3', keys.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {keys.map((k) => {
                const [I, box, icon] = NOTICE_STYLE[k];
                return (
                    <div key={k} className={cn('flex gap-3 rounded-[10px] border p-4', dark ? 'border-ink-700 bg-ink-900 text-parchment-200' : box)}>
                        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', dark ? 'bg-ink-800 text-gold-400' : cn('bg-white', icon))}>
                            <I className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h3 className={cn('font-serif text-[1rem] font-bold', dark ? 'text-gold-400' : 'text-ink-900')}>{notices[k].title}</h3>
                            <p className="mt-1 text-[0.75rem] leading-relaxed">{notices[k].body}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function ResourceRows({ event, compact }: { event: WebinarDetail; compact?: boolean }) {
    const colors: Record<string, string> = { PDF: 'bg-risk-500', DOCX: 'bg-controlled-500', XLSX: 'bg-verified-500', 'Web Links': 'bg-referenced-500' };
    return (
        <ul className="space-y-2">
            {event.resources.map((r) => {
                const locked = r.after_review && !event.replayAvailable;
                return (
                    <li key={r.key} className="flex items-center gap-3">
                        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-[6px] text-[0.5625rem] font-bold text-white', colors[r.type] ?? 'bg-ink-500')}>{r.type === 'Web Links' ? <L.Link className="size-4" /> : r.type}</span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.8125rem] font-semibold text-ink-900">{r.title}</span>
                            <span className="block text-[0.6875rem] text-ink-500">{locked ? 'Available after replay review' : [r.type, r.size].filter(Boolean).join(' | ')}</span>
                        </span>
                        {locked ? (
                            <L.Lock className="size-4 text-gold-600" aria-label="Locked until review" />
                        ) : (
                            <a href={`/webinars/${event.slug}/resources/${r.key}`} className={btnClass('gold', 'sm')}>
                                {r.key === 'links' ? <L.ExternalLink className="size-3.5" /> : <L.Download className="size-3.5" />}
                                {!compact && (r.key === 'links' ? 'View' : 'Download')}
                            </a>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
    const initials = /^[A-Z]{1,3}$/.test(name) ? name : name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
    const bg = ['bg-controlled-500', 'bg-verified-500', 'bg-risk-500', 'bg-referenced-500', 'bg-attested-500', 'bg-gold-600'][hue];
    return <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold text-white', bg, className)} aria-hidden="true">{initials}</span>;
}

export function StatTile({ icon, value, label, sub, tone = 'gold' }: { icon: string; value: ReactNode; label: string; sub?: string; tone?: string }) {
    return (
        <div className="flex items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-4">
            <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', toneBg(tone))}>
                <Ico name={icon} className="size-5" />
            </span>
            <span>
                <span className="block text-xl font-bold text-ink-900">{value}</span>
                <span className="block text-[0.8125rem] font-semibold text-ink-700">{label}</span>
                {sub && <span className="block text-[0.6875rem] text-ink-500">{sub}</span>}
            </span>
        </div>
    );
}

export function CheckItem({ children, done = true }: { children: ReactNode; done?: boolean }) {
    return (
        <li className="flex items-start gap-2 text-[0.8125rem]">
            {done ? <L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" /> : <L.Circle className="mt-0.5 size-4 shrink-0 text-ink-300" aria-hidden="true" />}
            <span>{children}</span>
        </li>
    );
}

export function PillTabs({ tabs, value, onChange, dark }: { tabs: { key: string; label: ReactNode }[]; value: string; onChange: (k: string) => void; dark?: boolean }) {
    return (
        <div role="tablist" className={cn('flex gap-1 overflow-x-auto rounded-[8px] p-1', dark ? 'bg-ink-900' : 'border border-parchment-400 bg-parchment-200')}>
            {tabs.map((t) => (
                <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={t.key === value}
                    onClick={() => onChange(t.key)}
                    className={cn(
                        'shrink-0 rounded-[6px] px-3.5 py-2 text-[0.8125rem] font-semibold whitespace-nowrap transition-colors',
                        t.key === value ? 'bg-gold-500 text-ink-900' : dark ? 'text-parchment-200 hover:text-gold-300' : 'text-ink-600 hover:text-ink-900',
                    )}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}

export function SpeakerLine({ name, role, dark }: { name: string; role?: string | null; dark?: boolean }) {
    return (
        <div className="flex items-center gap-2.5">
            <Avatar name={name} />
            <span>
                <span className={cn('block text-[0.8125rem] font-semibold', dark ? 'text-parchment-50' : 'text-ink-900')}>{name}</span>
                {role && <span className={cn('block text-[0.6875rem]', dark ? 'text-gold-400' : 'text-ink-500')}>{role}</span>}
            </span>
        </div>
    );
}

/** Small stage graphic standing in for the video feed until the provider stream is embedded. */
export function Stage({ event, badge, children, className }: { event: WebinarEvent; badge?: ReactNode; children?: ReactNode; className?: string }) {
    return (
        <div className={cn('relative aspect-video overflow-hidden rounded-[10px] bg-ink-950', className)}>
            <HeroArt className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex items-center gap-2">{badge}</div>
                <div className="flex items-center justify-center">
                    <AfricaMark className="size-16 text-gold-400/80" />
                </div>
                <div className="flex items-end justify-between gap-3">
                    <div className="rounded-[6px] border border-gold-600/70 bg-ink-950/80 px-3 py-2">
                        <p className="font-serif text-[0.9375rem] font-bold text-parchment-50">{event.speaker}</p>
                        <p className="text-[0.6875rem] text-gold-400">{event.speakerRole}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

export function RegistrationRequired({ event, registration }: { event: WebinarEvent; registration: WebinarRegistrationInfo | null }) {
    if (registration) return null;
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-4">
            <p className="text-[0.8125rem] text-ink-700">
                <strong className="text-ink-900">You are not registered for this webinar in this browser.</strong> Register, or sign in to see your registration.
            </p>
            <div className="flex gap-2">
                {event.registrationOpen && <BtnLink href={`/webinars/${event.slug}/register`}>Register</BtnLink>}
                <BtnLink href="/login" tone="outline">Sign In</BtnLink>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Event helpers                                                              */
/* ========================================================================== */

export function splitTitle(title: string): [string, string | null] {
    const i = title.indexOf(':');
    return i > 0 ? [title.slice(0, i + 1), title.slice(i + 1).trim()] : [title, null];
}

export function googleCalendarUrl(e: WebinarEvent) {
    const f = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: `${f(e.startsAt)}/${f(e.endsAt)}`, details: `TBCA webinar with ${e.speaker}`, location: e.format });
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function CalendarButtons({ event, dark }: { event: WebinarEvent; dark?: boolean }) {
    const cls = cn(btnClass(dark ? 'ghostDark' : 'outline', 'sm'), 'flex-1');
    return (
        <div className="flex flex-wrap gap-2">
            <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className={cls}><L.CalendarPlus className="size-4" aria-hidden="true" />Google Calendar</a>
            <a href={`/webinars/${event.slug}/calendar.ics`} className={cls}><L.CalendarDays className="size-4" aria-hidden="true" />Outlook</a>
            <a href={`/webinars/${event.slug}/calendar.ics`} className={cls}><L.Apple className="size-4" aria-hidden="true" />Apple Calendar</a>
        </div>
    );
}

