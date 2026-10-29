import { Head, Link, router, usePage } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState, type ReactNode } from 'react';
import CoverArt from '@/Components/Art/CoverArt';
import { Crumbs, Ico } from '@/Components/Webinars/kit';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { SharedProps } from '@/types';

/* ========================================================================== */
/* Types shared by every KP page                                              */
/* ========================================================================== */

export interface KpScreen {
    id: string;
    title: string;
    href: string;
    mockup: string | null;
    surface: 'Public' | 'Admin';
}

export interface KpShared {
    screen: KpScreen | null;
    kpNav: [string, string][];
}

export interface KpCard {
    slug: string;
    title: string;
    summary: string;
    type: string;
    typeLabel: string;
    icon: string;
    theme: string;
    themeLabel: string;
    voice: string;
    voiceLabel: string;
    scope: string;
    scopeLabel: string;
    freshness: string;
    status: 'published' | 'excerpt' | 'pending';
    featured: boolean;
    published: string | null;
    author: string;
    href: string;
    category: 'insights' | 'founders-notes' | 'resources';
    categoryLabel: string;
    dateLabel: string;
    dateNote: string | null;
    readMinutes: number;
    topics: { slug: string; label: string; href: string }[];
    countries: { slug: string; name: string; href: string }[];
}

export interface KpTheme {
    slug: string;
    label: string;
    icon: string;
    blurb: string;
    articles: number;
    tools: number;
    href: string;
}

export interface KpResource {
    slug: string;
    title: string;
    category: string;
    categoryLabel: string;
    topic: string;
    body: string;
    format: string;
    featured: boolean;
    href: string;
}

export const BASE = '/kp-thought-leadership';

const THEME_ART: Record<string, string> = {
    'strategy-execution': 'business-management', 'capital-funding': 'digital-products', 'governance-boards': 'due-diligence', 'project-development': 'project-advisory',
    'markets-growth': 'research-reports', 'leadership-people': 'courses-learning', 'technology-ai': 'ai-automation', 'risk-compliance': 'diagnostics',
};

/* ========================================================================== */
/* Page frame                                                                 */
/* ========================================================================== */

export function ScreenChip({ id }: { id: string }) {
    return <span className="inline-flex shrink-0 items-center rounded-[6px] border border-ink-300 bg-white px-3 py-1.5 text-[0.75rem] font-bold tracking-wide text-ink-900">SCREEN ID: {id}</span>;
}

/**
 * Standard KP page: breadcrumb with Screen ID chip, title with gold subtitle, the KP
 * section links and an optional right rail. Accent "purple" is used for the AI and
 * Future Builders screens, as in KP's designs.
 */
export function KpPage({
    screen,
    kpNav,
    crumbs,
    title,
    badge,
    subtitle,
    intro,
    actions,
    rail,
    left,
    children,
    accent = 'gold',
    head,
    sectionNav,
    hideNav,
}: KpShared & {
    crumbs: [string, string?][];
    title: ReactNode;
    badge?: ReactNode;
    subtitle?: ReactNode;
    intro?: ReactNode;
    actions?: ReactNode;
    rail?: ReactNode;
    left?: ReactNode;
    children: ReactNode;
    accent?: 'gold' | 'purple';
    head?: string;
    sectionNav?: ReactNode;
    hideNav?: boolean;
}) {
    const { url } = usePage<SharedProps>().props;
    const path = url?.path ?? '';
    return (
        <div className="bg-parchment-100 pb-12">
            <Head title={`${head ?? (typeof title === 'string' ? title : screen?.title ?? 'KP Thought Leadership')} | KP Thought Leadership`} />
            <div className="container-tbca pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <Crumbs items={[['Home', '/'], ['KP Thought Leadership', BASE], ...crumbs]} />
                    {screen && <ScreenChip id={screen.id} />}
                </div>
                {!hideNav && (
                    <nav aria-label="KP Thought Leadership sections" className="mt-3 flex gap-1.5 overflow-x-auto pb-1 print:hidden">
                        {kpNav.map(([label, href]) => {
                            const active = href === BASE ? path === BASE : path.startsWith(href.split('?')[0].replace(/\/kenya$/, ''));
                            return (
                                <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('shrink-0 rounded-full border px-3 py-1 text-[0.75rem] font-semibold whitespace-nowrap transition-colors', active ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500 bg-white text-ink-700 hover:border-gold-500')}>
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
                {sectionNav}
                <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <div className="max-w-3xl">
                        <h1 className="flex flex-wrap items-center gap-3 font-serif text-[2rem] leading-tight font-bold text-ink-900 md:text-[2.5rem]">
                            {title}
                            {badge}
                        </h1>
                        {subtitle && <p className={cn('mt-1 text-[1.0625rem] font-semibold', accent === 'purple' ? 'text-referenced-500' : 'text-gold-700')}>{subtitle}</p>}
                        {intro && <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{intro}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                </header>
                <div className={cn('mt-6 grid gap-6', left && rail ? 'lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_19rem]' : left ? 'lg:grid-cols-[15rem_minmax(0,1fr)]' : rail ? 'xl:grid-cols-[minmax(0,1fr)_20rem]' : '')}>
                    {left && <aside className="min-w-0 space-y-4">{left}</aside>}
                    <div className="min-w-0 space-y-6">{children}</div>
                    {rail && <aside className={cn('min-w-0 space-y-4 print:hidden', left && 'lg:col-span-2 xl:col-span-1')}>{rail}</aside>}
                </div>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Building blocks                                                            */
/* ========================================================================== */

export function Box({ title, icon, action, children, className, tone = 'light', id }: { title?: ReactNode; icon?: string; action?: ReactNode; children: ReactNode; className?: string; tone?: 'light' | 'dark' | 'cream' | 'purple' | 'blue'; id?: string }) {
    const tones = {
        light: 'border-parchment-400 bg-white text-ink-700',
        dark: 'border-gold-700/50 bg-ink-950 text-parchment-200',
        cream: 'border-gold-200 bg-gold-50 text-ink-700',
        purple: 'border-referenced-500/25 bg-referenced-50 text-ink-700',
        blue: 'border-controlled-500/20 bg-controlled-50 text-ink-700',
    };
    return (
        <section id={id} className={cn('rounded-[10px] border p-4 sm:p-5', tones[tone], className)}>
            {(title || action) && (
                <header className="mb-3 flex items-start justify-between gap-3">
                    {title && (
                        <h2 className={cn('flex items-center gap-2 font-serif text-[1.125rem] leading-tight font-bold', tone === 'dark' ? 'text-parchment-50' : 'text-ink-900')}>
                            {icon && <Ico name={icon} className={cn('size-5', tone === 'purple' ? 'text-referenced-500' : 'text-gold-600')} />}
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

export function H2({ children, more, sub }: { children: ReactNode; more?: [string, string]; sub?: ReactNode }) {
    return (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
                <h2 className="font-serif text-[1.375rem] font-bold text-ink-900">{children}</h2>
                {sub && <p className="text-[0.8125rem] text-ink-500">{sub}</p>}
            </div>
            {more && (
                <Link href={more[1]} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:text-gold-800">
                    {more[0]} <L.ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}

export function IconDisc({ name, tone = 'gold', size = 'md' }: { name: string; tone?: 'gold' | 'purple' | 'green' | 'blue' | 'red' | 'dark'; size?: 'sm' | 'md' | 'lg' }) {
    const tones = { gold: 'bg-gold-100 text-gold-700', purple: 'bg-referenced-50 text-referenced-500', green: 'bg-verified-50 text-verified-500', blue: 'bg-controlled-50 text-controlled-500', red: 'bg-risk-50 text-risk-500', dark: 'bg-ink-900 text-gold-400' };
    const sizes = { sm: 'size-8', md: 'size-10', lg: 'size-12' };
    return (
        <span className={cn('flex shrink-0 items-center justify-center rounded-full', tones[tone], sizes[size])}>
            <Ico name={name} className={size === 'lg' ? 'size-6' : 'size-5'} />
        </span>
    );
}

export function ThemeCover({ theme, seed, label, className, children }: { theme: string; seed: string; label?: string; className?: string; children?: ReactNode }) {
    return (
        <div className={cn('kp-art relative overflow-hidden bg-ink-950', className)}>
            <CoverArt seed={seed} category={THEME_ART[theme] ?? null} label={label} className="absolute inset-0 h-full w-full" />
            {children}
        </div>
    );
}

/* ========================================================================== */
/* Content standards: voice, freshness, scope, status (KP-SCR-043 to 050)     */
/* ========================================================================== */

const VOICE_TONE: Record<string, string> = {
    P: 'border-gold-400 bg-gold-50 text-gold-800',
    F: 'border-attested-500/40 bg-attested-50 text-attested-700',
    I: 'border-controlled-500/40 bg-controlled-50 text-controlled-700',
    S: 'border-verified-500/40 bg-verified-50 text-verified-700',
    E: 'border-parchment-500 bg-parchment-200 text-ink-700',
    A: 'border-referenced-500/40 bg-referenced-50 text-referenced-500',
};
const VOICE_NAME: Record<string, string> = { P: 'Professional', F: 'Founder', I: 'Institutional', S: 'Expert', E: 'Editorial', A: 'AI' };

export function VoiceBadge({ code, full, className }: { code: string; full?: boolean; className?: string }) {
    return (
        <span title={`Voice ${code}: ${VOICE_NAME[code] ?? code} voice`} className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-bold whitespace-nowrap', VOICE_TONE[code] ?? VOICE_TONE.E, className)}>
            <span className="flex size-4 items-center justify-center rounded-full bg-white/70 text-[0.625rem]">{code}</span>
            {full ? `${VOICE_NAME[code] ?? code} Voice` : VOICE_NAME[code] ?? code}
        </span>
    );
}

const FRESH: Record<string, [string, string]> = {
    current: ['Current', 'border-verified-500/40 bg-verified-50 text-verified-700'],
    'review-due': ['Review Due', 'border-attested-500/40 bg-attested-50 text-attested-700'],
    stale: ['Stale', 'border-risk-500/40 bg-risk-50 text-risk-700'],
    restricted: ['Restricted', 'border-ink-400 bg-parchment-200 text-ink-700'],
};

export function FreshnessBadge({ state, className }: { state: string; className?: string }) {
    const [label, tone] = FRESH[state] ?? FRESH.current;
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', tone, className)}>
            <L.Clock className="size-3" aria-hidden="true" />
            {label}
        </span>
    );
}

export function ScopeBadge({ code, label, className }: { code: string; label?: string; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border border-controlled-500/30 bg-white px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap text-controlled-700', className)}>
            <L.Globe className="size-3" aria-hidden="true" />
            {code}
            {label && <span className="font-normal text-ink-500">{label}</span>}
        </span>
    );
}

export function ContentStatus({ status }: { status: KpCard['status'] }) {
    const map = {
        published: ['Full text', 'border-verified-500/40 bg-verified-50 text-verified-700'],
        excerpt: ['Excerpt available', 'border-gold-400 bg-gold-50 text-gold-800'],
        pending: ['Full text pending', 'border-parchment-500 bg-parchment-200 text-ink-600'],
    } as const;
    const [label, tone] = map[status];
    return <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', tone)}>{label}</span>;
}

/** KP-SCR-047: professional limitation notice. */
export function Limitation({ compact, className }: { compact?: boolean; className?: string }) {
    return (
        <div className={cn('flex gap-3 rounded-[10px] border border-parchment-500 bg-parchment-200 p-4 text-[0.8125rem] text-ink-700', className)}>
            <L.Scale className="mt-0.5 size-5 shrink-0 text-ink-600" aria-hidden="true" />
            <p>
                <strong className="text-ink-900">Professional limitation.</strong> General information and self-assessment only. It is not legal, tax, accounting, financial or investment advice
                {compact ? '.' : ', and it does not create an advisory relationship. For decisions with legal or financial consequences, speak to a qualified professional.'}
            </p>
        </div>
    );
}

/** KP-SCR-044: AI disclosure (Voice A). */
export function AiDisclosure({ className, children }: { className?: string; children?: ReactNode }) {
    return (
        <div className={cn('flex gap-3 rounded-[10px] border border-referenced-500/30 bg-referenced-50 p-3 text-[0.75rem] text-ink-700', className)}>
            <L.Bot className="mt-0.5 size-4 shrink-0 text-referenced-500" aria-hidden="true" />
            <p>{children ?? 'AI-generated (Voice A) from the approved KP knowledge register. It is not Kruger Phiri speaking. It can make mistakes, so check the cited sources before relying on it.'}</p>
        </div>
    );
}

/* ========================================================================== */
/* Insight cards                                                              */
/* ========================================================================== */

export function InsightCard({ item, compact, bookmark = true }: { item: KpCard; compact?: boolean; bookmark?: boolean }) {
    const [saved, setSaved] = useState(false);
    return (
        <article className="flex h-full flex-col overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
            {!compact && (
                <ThemeCover theme={item.theme} seed={item.slug} label={item.title} className="aspect-[16/9]">
                    <span className="absolute top-2 left-2 rounded-[4px] bg-ink-950/80 px-2 py-0.5 text-[0.625rem] font-bold tracking-wider text-gold-400 uppercase">{item.themeLabel}</span>
                </ThemeCover>
            )}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                    <VoiceBadge code={item.voice} />
                    <ContentStatus status={item.status} />
                </div>
                <Link href={item.href} className="mt-2 font-serif text-[1.0625rem] leading-snug font-bold text-ink-900 hover:text-gold-700">
                    {item.title}
                </Link>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{item.summary}</p>
                <p className="mt-2 text-[0.6875rem] text-ink-500">{item.dateLabel} | {item.readMinutes} min read</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[0.6875rem] text-ink-500">
                    <span className="inline-flex items-center gap-1">
                        <Ico name={item.icon} className="size-3.5" /> {item.typeLabel} | {item.author}
                    </span>
                    {bookmark && (
                        <button type="button" onClick={() => setSaved(!saved)} aria-pressed={saved} aria-label={saved ? 'Remove bookmark' : 'Bookmark'} className="text-ink-400 hover:text-gold-700">
                            {saved ? <L.BookmarkCheck className="size-4 text-gold-700" /> : <L.Bookmark className="size-4" />}
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

export function InsightRow({ item }: { item: KpCard }) {
    return (
        <li className="flex gap-3 py-3">
            <ThemeCover theme={item.theme} seed={item.slug} label={item.title} className="size-16 shrink-0 rounded-[8px]" />
            <div className="min-w-0">
                <Link href={item.href} className="font-serif text-[0.9375rem] leading-snug font-bold text-ink-900 hover:text-gold-700">
                    {item.title}
                </Link>
                <p className="text-[0.75rem] text-ink-500">{item.summary}</p>
                <p className="text-[0.6875rem] text-ink-500">{item.dateLabel} | {item.readMinutes} min read | {item.typeLabel}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                    <VoiceBadge code={item.voice} />
                    <ContentStatus status={item.status} />
                </div>
            </div>
        </li>
    );
}

/* ========================================================================== */
/* Form fields                                                                */
/* ========================================================================== */

const inputCls = 'mt-1 w-full rounded-[6px] border border-parchment-500 bg-white px-3 py-2 text-[0.875rem] text-ink-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 focus:outline-none';

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
    return (
        <label className={cn('block text-[0.8125rem] font-semibold text-ink-800', className)}>
            {label}
            {children}
            {hint && !error && <span className="mt-1 block text-[0.6875rem] font-normal text-ink-500">{hint}</span>}
            {error && <span className="mt-1 block text-[0.75rem] font-normal text-risk-500">{error}</span>}
        </label>
    );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={cn(inputCls, 'h-10', props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea rows={4} {...props} className={cn(inputCls, props.className)} />;
}

export function Select({ options, placeholder, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: (string | { value: string; label: string })[]; placeholder?: string }) {
    return (
        <select {...props} className={cn(inputCls, 'h-10', props.className)}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
    );
}

export function Meter({ value, tone = 'gold', className }: { value: number; tone?: 'gold' | 'green' | 'red' | 'purple' | 'orange'; className?: string }) {
    const tones = { gold: 'bg-gold-500', green: 'bg-verified-500', red: 'bg-risk-500', purple: 'bg-referenced-500', orange: 'bg-attested-500' };
    return (
        <span className={cn('block h-2 overflow-hidden rounded-full bg-parchment-300', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
            <span className={cn('block h-full rounded-full', tones[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </span>
    );
}

export function scoreTone(v: number): 'green' | 'gold' | 'orange' | 'red' {
    return v >= 75 ? 'green' : v >= 60 ? 'gold' : v >= 40 ? 'orange' : 'red';
}

/** Small "rule" note used on tool pages. */
export function RuleNote({ icon = 'shield-check', title, children }: { icon?: string; title: string; children: ReactNode }) {
    return (
        <div className="flex gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-4">
            <Ico name={icon} className="mt-0.5 size-5 shrink-0 text-gold-700" />
            <div className="text-[0.8125rem] text-ink-700">
                <p className="font-bold text-ink-900">{title}</p>
                {children}
            </div>
        </div>
    );
}

export function Empty({ children }: { children: ReactNode }) {
    return <p className="rounded-[10px] border border-dashed border-parchment-500 bg-white p-6 text-center text-[0.875rem] text-ink-500">{children}</p>;
}

/* ========================================================================== */
/* Future Builders frame                                                      */
/* ========================================================================== */

export interface FbShared {
    lite: boolean;
    fbNav: [string, string, string][];
}

export function FbNav({ fbNav, lite }: FbShared) {
    const { url } = usePage<SharedProps>().props;
    const path = url?.path ?? '';
    return (
        <nav aria-label="Future Builders" className="mt-2 flex flex-wrap items-center gap-1.5 rounded-[10px] border border-referenced-500/25 bg-referenced-50 p-2">
            <span className="px-2 text-[0.75rem] font-bold tracking-wider text-referenced-500 uppercase">Future Builders</span>
            {fbNav.map(([label, href, icon]) => {
                const base = href.replace(/\/1$/, '').replace(/\/\d+$/, '');
                const active = path === href || (href.includes('/lessons/') && path.startsWith(base));
                return (
                    <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] font-semibold', active ? 'bg-referenced-500 text-white' : 'text-ink-700 hover:bg-white')}>
                        {!lite && <Ico name={icon} className="size-3.5" />}
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

/** Learner-safe notice shown on every Future Builders page (blueprint: no child commercial CTA). */
export function LearnerSafe() {
    return (
        <div className="flex gap-3 rounded-[10px] border border-verified-500/30 bg-verified-50 p-4 text-[0.8125rem] text-ink-700">
            <L.ShieldCheck className="mt-0.5 size-5 shrink-0 text-verified-500" aria-hidden="true" />
            <p>
                <strong className="text-ink-900">Safe space for learners.</strong> Free to use, no adverts and no sales offers. We never ask learners for surnames, phone numbers or photos.
                Content is reviewed by educators and the TBCA safety team.
            </p>
        </div>
    );
}

/** Brand monogram used in place of Founder photography until approved images are supplied. */
export function KpMonogram({ dark, className }: { dark?: boolean; className?: string }) {
    return (
        <div className={cn('flex flex-col items-center justify-center text-center', className)}>
            <span className="font-serif text-[4.5rem] leading-none font-bold text-gold-500">KP</span>
            <span className={cn('mt-1 font-serif text-[1.25rem] tracking-[0.25em]', dark ? 'text-parchment-50' : 'text-ink-900')}>KRUGER PHIRI</span>
            <span className={cn('mt-1 text-[0.625rem] font-semibold tracking-[0.2em] uppercase', dark ? 'text-gold-400' : 'text-gold-700')}>Founder, Strategic Advisor</span>
            <span className={cn('mt-0.5 text-[0.625rem] tracking-[0.15em] uppercase', dark ? 'text-parchment-300' : 'text-ink-500')}>Diagnose. Prepare. Execute.</span>
        </div>
    );
}

/* ========================================================================== */
/* Listing filters (Insights, Founder's Notes)                                */
/* ========================================================================== */

export interface Filters {
    q: string;
    types: string[];
    theme: string;
    voice: string;
    region: string;
    freshness: string[];
    sort: string;
}

export function apply(path: string, f: Partial<Filters> & { page?: number }) {
    const clean = Object.fromEntries(Object.entries(f).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : v !== '' && v !== undefined && v !== null && v !== 'recent' && v !== 1)));
    router.get(path, clean, { preserveScroll: true, preserveState: true });
}

/* ========================================================================== */
/* Engagement offers (Work With Kruger, Book Kruger)                          */
/* ========================================================================== */

export interface Offer {
    key: string;
    code: string;
    title: string;
    icon: string;
    body: string;
    features: string[];
    duration: string;
    zar: number | null;
    from: boolean;
    unit: string | null;
    cta: string;
}

/** Indicative fee text in the visitor's currency (amounts stored in whole ZAR). */
export function useOfferPrice() {
    const price = usePrice();
    return (o: Offer) => (o.zar === null ? 'Custom scope & fee' : `${o.from ? 'From ' : ''}${price(o.zar)}${o.unit ? ` ${o.unit}` : ''} (excl. VAT)`);
}


/* ========================================================================== */
/* KP Knowledge Assistant answer shape                                        */
/* ========================================================================== */

export interface AnswerSource {
    n: number;
    slug: string;
    title: string;
    typeLabel: string;
    voice: string;
    voiceLabel: string;
    freshness: string;
    author: string;
    scope: string;
    evidence: string;
    weight: number;
    href: string;
    role: string;
}

export interface KpAnswerT {
    reference: string;
    question: string;
    status: 'answered' | 'abstained' | 'routed' | 'declined';
    confidence: number;
    confidenceLabel: string;
    topic: string | null;
    knowledgeKey: string | null;
    answer: {
        intro: string;
        points: { title: string; line: string; detail: string; icon: string }[];
        close: string;
        related: { title: string; href: string; kind: string }[];
        route: [string, string] | null;
        hasLevels?: boolean;
    };
    sources: AnswerSource[];
    feedback: string | null;
    asked: string;
}

export function ConfidenceRing({ value, label, size = 96 }: { value: number; label: string; size?: number }) {
    const r = 40;
    const c = 2 * Math.PI * r;
    const color = value >= 75 ? '#2f9e66' : value >= 55 ? '#d6a32e' : value > 0 ? '#e08a2e' : '#9a9aa5';
    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Confidence ${value}%`}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="#e8e2d4" strokeWidth="10" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
                <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="#14141a">{value ? `${value}%` : 'n/a'}</text>
            </svg>
            <span className="text-[0.8125rem] font-bold text-ink-900">{label}</span>
        </div>
    );
}

/** Future Builders page: learner navigation instead of the KP section links, no commercial calls to action. */
export function FbPage({ fbNav, lite, crumbs, ...rest }: KpShared & FbShared & Omit<Parameters<typeof KpPage>[0], 'kpNav' | 'screen' | 'hideNav' | 'sectionNav' | 'accent'>) {
    return (
        <div className={cn(lite && 'kp-lite')}>
            <KpPage
                {...rest}
                kpNav={[]}
                hideNav
                accent="purple"
                crumbs={[['Future Builders', `${BASE}/future-builders`], ...crumbs]}
                sectionNav={<FbNav fbNav={fbNav} lite={lite} />}
            />
        </div>
    );
}

/* ========================================================================== */
/* Governance consoles frame (KP-SCR-051 to 072, staff only)                  */
/* ========================================================================== */

export interface ConsoleNavItem {
    key: string;
    title: string;
    id: string;
}

export function ConsoleFrame({ nav, active, title, id, children, intro }: { nav: ConsoleNavItem[]; active: string | null; title: string; id: string | null; intro?: ReactNode; children: ReactNode }) {
    return (
        <div className="bg-parchment-100 pb-12">
            <Head title={`${title} | KP Governance`} />
            <div className="container-tbca pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Crumbs items={[['Home', '/'], ['KP Thought Leadership', BASE], ['Governance Consoles', '/admin/kp'], ...(active ? [[title] as [string]] : [])]} />
                    {id && <ScreenChip id={id} />}
                </div>
                <div className="mt-5 grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
                    <nav aria-label="KP governance consoles" className="h-fit rounded-[10px] border border-ink-800 bg-ink-950 p-2 text-parchment-200">
                        <p className="px-2 pt-1 pb-2 text-[0.6875rem] font-bold tracking-wider text-gold-500 uppercase">KP Governance (staff)</p>
                        <ul className="space-y-0.5">
                            <li><Link href="/admin/kp" aria-current={active === null ? 'page' : undefined} className={cn('block rounded-[6px] px-2 py-1.5 text-[0.75rem]', active === null ? 'bg-gold-600 font-semibold text-parchment-50' : 'hover:bg-ink-900 hover:text-gold-300')}>Screen Register Overview</Link></li>
                            {nav.map((n) => (
                                <li key={n.key}>
                                    <Link href={`/admin/kp/${n.key}`} aria-current={active === n.key ? 'page' : undefined} className={cn('flex justify-between gap-2 rounded-[6px] px-2 py-1.5 text-[0.75rem]', active === n.key ? 'bg-gold-600 font-semibold text-parchment-50' : 'hover:bg-ink-900 hover:text-gold-300')}>
                                        <span className="truncate">{n.title}</span>
                                        <span className="shrink-0 text-[0.625rem] opacity-70">{n.id.replace('KP-SCR-', '')}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <main className="min-w-0 space-y-5">
                        <header>
                            <p className="text-[0.75rem] font-bold tracking-[0.16em] text-gold-700 uppercase">KP Governance Console</p>
                            <h1 className="font-serif text-[1.875rem] leading-tight font-bold text-ink-900">{title}</h1>
                            {intro && <div className="mt-1 text-[0.875rem] text-ink-600">{intro}</div>}
                        </header>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
