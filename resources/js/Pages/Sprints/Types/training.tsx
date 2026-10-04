import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BarChart3,
    BookOpen,
    Box,
    Briefcase,
    CalendarClock,
    Check,
    ClipboardList,
    Clock,
    FileText,
    Flag,
    Gauge,
    Globe,
    GraduationCap,
    Handshake,
    Headset,
    Info,
    Languages,
    Layers,
    Lightbulb,
    Mail,
    MapPin,
    MessageSquare,
    MonitorPlay,
    Package,
    Presentation,
    RefreshCw,
    Scale,
    Settings,
    Shield,
    ShieldCheck,
    ShoppingCart,
    Tag,
    Target,
    UserCheck,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { askAbout, attrsOf, Crumbs, list, orderHref, pairs, RelatedSprints, SaveButton } from '@/Components/SprintTypes/B/common';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { TrainingAttributes } from '@/types/sprint-types-b';

/** Picks a lucide icon from the free-text icon description captured from the mockup. */
function iconFor(desc: string | undefined, fallback: LucideIcon = Lightbulb): LucideIcon {
    const d = (desc ?? '').toLowerCase();
    const table: [RegExp, LucideIcon][] = [
        [/target|bullseye/, Target],
        [/video|play|screen|webinar/, MonitorPlay],
        [/people|group|team|network|audience/, Users],
        [/bar|chart rising|growth/, BarChart3],
        [/pie|analytic|report/, Gauge],
        [/document|doc|page|pen|file/, FileText],
        [/person|user|contact/, UserCheck],
        [/tag|offer|price/, Tag],
        [/palette|brand|diamond/, Layers],
        [/megaphone|channel/, Presentation],
        [/stack|materials|deck/, BookOpen],
        [/handshake|consent/, Handshake],
        [/shield|risk|compliance|ethic/, ShieldCheck],
        [/gear|setting|process/, Settings],
        [/check|clipboard|list/, ClipboardList],
        [/book|course|learn|training|cap/, GraduationCap],
        [/presenter|board|workshop/, Presentation],
        [/envelope|mail/, Mail],
        [/circular|arrows|refresh|ongoing/, RefreshCw],
        [/arrow/, ArrowRight],
        [/calendar|clock|time/, Clock],
        [/brief|business/, Briefcase],
        [/globe|world/, Globe],
    ];
    return table.find(([re]) => re.test(d))?.[1] ?? fallback;
}

const factIcons: LucideIcon[] = [Tag, Users, Layers, MonitorPlay, Languages, UserCheck, Scale];
const reviewIcons: Record<string, LucideIcon> = {
    'Human Review': UserCheck,
    'Partner Review': Handshake,
    'Vendor Required': Box,
    'Risk Rating': Shield,
    'Regulated Status': Scale,
    Version: FileText,
    Language: Globe,
};
const steps: [string, LucideIcon][] = [
    ['Choose', ShoppingCart],
    ['Scope', Target],
    ['Submit Inputs', FileText],
    ['Prepare', Settings],
    ['Review', UserCheck],
    ['Deliver', Package],
    ['Apply / Next Step', ArrowRight],
];
const badgeIcons: LucideIcon[] = [Flag, MapPin, GraduationCap, UserCheck, Tag];

function Heading({ n, children }: { n: number; children: string }) {
    return (
        <h2 className="mb-3 text-base font-bold text-ink-900">
            {n}. {children}
        </h2>
    );
}

export default function TrainingSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<TrainingAttributes>(sprint);
    const packages = sprint.packages ?? [];
    const [selected, setSelected] = useState(packages.find((p) => p.popular)?.key ?? packages[0]?.key ?? null);
    const badges = list(a.badges).length ? list(a.badges) : ['South Africa', 'Phase 1', 'Training Product', 'Human Reviewed', 'Fixed Price'];
    const HeroIcon = iconFor(a.hero_icon, GraduationCap);
    const review = pairs(a.review_quality);

    return (
        <div className="bg-parchment-200">
            {/* Hero */}
            <section className="bg-ink-950 text-parchment-100 motif-glow">
                <div className="container-tbca py-6">
                    <Crumbs
                        tone="dark"
                        home
                        items={[{ label: 'Resources', href: '/resources' }, { label: 'Training Products', href: '/resources/training-products' }, { label: sprint.title }]}
                    />
                    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <span className="flex size-24 shrink-0 items-center justify-center rounded-[10px] border border-gold-600 bg-ink-900 text-gold-400 shadow-[0_0_24px_-8px_rgba(214,163,46,0.7)]" aria-hidden="true">
                                <HeroIcon className="size-12" strokeWidth={1.25} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[0.6875rem] font-bold tracking-[0.18em] text-gold-400 uppercase">Training Product Detail</p>
                                <h1 className="mt-1 text-2xl leading-tight font-bold text-white sm:text-3xl">{sprint.title}</h1>
                                <p className="mt-2 text-[0.875rem] leading-relaxed text-parchment-200">{sprint.summary}</p>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {badges.map((b, i) => {
                                        const Icon = badgeIcons[i % badgeIcons.length];
                                        const green = i >= 3;
                                        return (
                                            <li key={b} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem]', green ? 'border-verified-500/60 text-verified-50' : 'border-gold-600 text-parchment-100')}>
                                                <Icon className={cn('size-3.5', green ? 'text-verified-500' : 'text-gold-400')} aria-hidden="true" />
                                                {b}
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <a href="#packages" className="inline-flex h-10 items-center gap-2 rounded-[5px] bg-gold-500 px-4 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                        Choose Package <ArrowRight className="size-4" aria-hidden="true" />
                                    </a>
                                    <button type="button" onClick={() => askAbout(sprint)} className="inline-flex h-10 items-center gap-2 rounded-[5px] border border-gold-500 px-4 text-sm font-medium text-gold-300 hover:bg-ink-900">
                                        <MessageSquare className="size-4" aria-hidden="true" /> Ask a Question
                                    </button>
                                    <SaveButton sprint={sprint} tone="dark" label="Save" />
                                </div>
                            </div>
                        </div>

                        <section className="rounded-[8px] border border-gold-700/70 p-4">
                            <h2 className="mb-2 text-sm font-semibold text-gold-300">Training Product Summary</h2>
                            <dl className="space-y-2 text-xs">
                                {pairs(a.facts).map(([k, v], i) => {
                                    const Icon = factIcons[i % factIcons.length];
                                    return (
                                        <div key={k} className="grid grid-cols-[1rem_minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2">
                                            <Icon className="size-3.5 text-gold-400" aria-hidden="true" />
                                            <dt className="text-parchment-200">{k}</dt>
                                            <dd className="text-right font-medium text-white">{v}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </section>

                        <section className="rounded-[8px] border border-gold-700/70 p-4 lg:col-span-2 xl:col-span-1">
                            <h2 className="mb-3 text-sm font-semibold text-gold-300">How This Works</h2>
                            <ol className="grid grid-cols-4 gap-y-3 sm:grid-cols-7">
                                {steps.map(([label, Icon], i) => (
                                    <li key={label} className="relative flex flex-col items-center text-center">
                                        <span className="text-[0.6875rem] font-bold text-gold-400">{i + 1}</span>
                                        {i > 0 && <span aria-hidden="true" className="absolute top-[1.85rem] right-1/2 hidden h-px w-full bg-gold-600 sm:block" />}
                                        <span className={cn('relative z-10 mt-1 flex size-8 items-center justify-center rounded-full border border-gold-500', i === 4 ? 'bg-gold-500 text-ink-900' : 'bg-ink-950 text-gold-400')}>
                                            <Icon className="size-4" aria-hidden="true" />
                                        </span>
                                        <span className="mt-1 text-[0.625rem] leading-tight text-parchment-200">{label}</span>
                                    </li>
                                ))}
                            </ol>
                            {a.how_it_works_note && <p className="mt-3 text-xs text-parchment-200">{a.how_it_works_note}</p>}
                        </section>
                    </div>
                </div>
            </section>

            {/* Body */}
            <div className="container-tbca py-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="min-w-0 space-y-8">
                        <section>
                            <Heading n={1}>What This Training Product Delivers</Heading>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
                                {(a.delivers ?? []).map((d) => {
                                    const Icon = iconFor(d.icon);
                                    return (
                                        <div key={d.title} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                                            <Icon className="size-5 text-gold-600" aria-hidden="true" />
                                            <h3 className="mt-2 text-[0.8125rem] leading-snug font-bold text-ink-900">{d.title}</h3>
                                            <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-600">{d.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section id="packages" className="scroll-mt-40">
                            <Heading n={2}>Choose Your Package</Heading>
                            <div className="grid gap-4 md:grid-cols-3">
                                {packages.map((p) => {
                                    const active = selected === p.key;
                                    const pp = p as typeof p & { support?: string };
                                    return (
                                        <div
                                            key={p.key}
                                            className={cn(
                                                'flex flex-col overflow-hidden rounded-[8px] border bg-white transition-shadow',
                                                p.popular ? 'border-gold-600' : 'border-parchment-400',
                                                active && 'shadow-raised ring-2 ring-gold-500',
                                            )}
                                        >
                                            <p className={cn('py-1.5 text-center text-xs font-bold tracking-wider text-white uppercase', p.popular ? 'bg-gradient-to-r from-gold-800 via-gold-600 to-gold-800' : 'bg-ink-950')}>
                                                {p.popular ? 'Most Popular' : p.name}
                                            </p>
                                            <div className="flex flex-1 flex-col p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p>
                                                        <span className="text-2xl font-bold text-ink-900">R{p.zar.toLocaleString('en-US')}</span>
                                                        <span className="ml-1 text-[0.6875rem] text-ink-500">excl. VAT</span>
                                                    </p>
                                                    {p.delivery && (
                                                        <p className="text-right text-[0.6875rem] text-ink-500">
                                                            Delivery
                                                            <span className="block text-xs font-semibold text-ink-900">{p.delivery}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <ul className="mt-3 flex-1 space-y-1.5 text-xs text-ink-700">
                                                    {(p.features ?? []).map((f) => (
                                                        <li key={f} className="flex gap-2">
                                                            <Check className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-4 flex items-center justify-between gap-2 border-t border-parchment-300 pt-3">
                                                    <p className="text-[0.6875rem] text-ink-600">
                                                        <strong className="text-ink-900">Support:</strong> {pp.support ?? 'Email Support'}
                                                    </p>
                                                    <Link
                                                        href={orderHref(sprint, p.key)}
                                                        onClick={() => setSelected(p.key)}
                                                        className="inline-flex h-8 shrink-0 items-center rounded-[4px] bg-gold-500 px-3 text-xs font-semibold text-ink-900 hover:bg-gold-400"
                                                    >
                                                        Choose {p.name}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section>
                            <Heading n={4}>Fee &amp; Scope Preview</Heading>
                            <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                                <table className="w-full min-w-[40rem] text-left text-xs">
                                    <thead className="bg-parchment-300 text-ink-800">
                                        <tr>
                                            {['Package', 'What It Covers', 'Price (ZAR)', 'Delivery', 'Review', 'Status'].map((h) => (
                                                <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {(a.fee_table ?? []).map((r) => (
                                            <tr key={r[0]}>
                                                {r.map((c, i) => (
                                                    <td key={i} className={cn('px-3 py-2 text-ink-700', i === 0 && 'font-semibold text-ink-900')}>
                                                        {i === 5 ? <span className="rounded-full bg-verified-50 px-2 py-0.5 font-semibold text-verified-700">{c}</span> : c}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.6875rem] text-ink-600">
                                {list(a.fee_footer).map((f) => {
                                    const [label, ...rest] = f.split(':');
                                    return (
                                        <li key={f} className="flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full bg-gold-500" aria-hidden="true" />
                                            {rest.length ? (
                                                <>
                                                    <strong className="text-ink-800">{label}:</strong>
                                                    {rest.join(':')}
                                                </>
                                            ) : (
                                                f
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section>
                            <Heading n={3}>What We Need From You</Heading>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {(a.needs ?? []).map((n) => {
                                    const Icon = iconFor(n.icon, ClipboardList);
                                    return (
                                        <div key={n.label} className="flex items-start gap-2 rounded-[6px] border border-parchment-400 bg-white p-2.5 text-[0.6875rem] text-ink-700">
                                            <Icon className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                            {n.label}
                                        </div>
                                    );
                                })}
                            </div>
                            {a.not_included && (
                                <div className="mt-3 flex gap-3 rounded-[8px] border border-gold-200 bg-gold-50 p-3 text-xs text-ink-700">
                                    <Info className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                    <p>
                                        <strong className="block text-ink-900">Not Included</strong>
                                        {a.not_included}
                                    </p>
                                </div>
                            )}
                        </section>

                        <section>
                            <Heading n={5}>Review, Quality &amp; Control</Heading>
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 xl:grid-cols-4 2xl:grid-cols-7">
                                {review.map(([k, v]) => {
                                    const Icon = reviewIcons[k] ?? BadgeCheck;
                                    return (
                                        <div key={k} className="flex flex-col items-center rounded-[6px] border border-parchment-400 bg-white p-2 text-center">
                                            <span className="text-[0.5625rem] leading-tight text-ink-500">{k}</span>
                                            <Icon className="my-1.5 size-5 text-gold-600" aria-hidden="true" />
                                            <span className="text-[0.6875rem] font-semibold text-ink-900">{v}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-[0.6875rem] text-ink-600">
                                <span className="flex items-center gap-1.5"><CalendarClock className="size-3.5 text-gold-600" />Review Cadence: <strong className="text-ink-900">{a.review_cadence ?? 'Per Sprint'}</strong></span>
                                <span className="flex items-center gap-1.5"><Headset className="size-3.5 text-gold-600" />Support: <strong className="text-ink-900">{a.review_support ?? 'As per package selected'}</strong></span>
                            </div>
                        </section>
                    </div>
                </div>

                <section className="mt-8">
                    <Heading n={6}>Where This Can Lead Next</Heading>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {(a.lead_next ?? []).map((l) => {
                            const Icon = iconFor(l.icon, ArrowRight);
                            return (
                                <div key={l.label} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                                    <Icon className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                                    <div>
                                        <p className="text-[0.625rem] font-semibold tracking-wide text-gold-700 uppercase">{l.label}</p>
                                        <h3 className="text-[0.8125rem] font-bold text-ink-900">{l.title}</h3>
                                        <p className="mt-0.5 text-[0.6875rem] text-ink-600">{l.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <RelatedSprints related={related} title="Related Training & Sprints" className="mt-10" />
            </div>
        </div>
    );
}
