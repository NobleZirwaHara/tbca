import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    CalendarClock,
    Check,
    CircleCheck,
    CircleMinus,
    CircleX,
    Clock,
    FileCheck,
    Headset,
    Info,
    MessageSquare,
    RefreshCw,
    Scale,
    ShieldCheck,
    TrendingUp,
    User,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import ThreePackages from '@/Components/Sprints/ThreePackages';
import { Modal } from '@/Components/ui/Kit';
import { askAbout, attrsOf, Crumbs, list, pairs, quoteHref, RelatedSprints } from '@/Components/SprintTypes/B/common';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { RetainerAttributes, RetainerBlock } from '@/types/sprint-types-b';

const metaIcons = [Users, ShieldCheck, AlertCircle, User];
const sideIcons = [FileCheck, Clock, CircleX, AlertCircle, Info];
const stripIcons = [User, ShieldCheck, UserCheck, Headset, Info, MessageSquare];

type Detail = 'scope' | 'exclusions' | 'hours' | 'service' | 'rollover' | 'overage' | 'utilisation' | 'compare' | 'pricing' | 'owner' | null;

function Card({ title, icon, children, link, onLink }: { title: string; icon: ReactNode; children: ReactNode; link?: string; onLink?: () => void }) {
    return (
        <section className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
                <span className="text-gold-600">{icon}</span>
                {title}
            </h2>
            <div className="flex-1 text-xs text-ink-600">{children}</div>
            {link && (
                <button type="button" onClick={onLink} className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-gold-700 hover:underline">
                    {link} <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
            )}
        </section>
    );
}

function BlockBody({ b, big = false }: { b?: Partial<RetainerBlock>; big?: boolean }) {
    if (!b) return null;
    return (
        <>
            {b.label && <p className="text-[0.6875rem] text-ink-500">{b.label}</p>}
            <p className={cn('font-serif font-bold text-ink-900', big ? 'text-xl' : 'text-lg')}>{b.headline}</p>
            {b.sub && <p className="text-xs text-ink-600">{b.sub}</p>}
            {b.text && <p className="mt-1.5 leading-relaxed">{b.text}</p>}
        </>
    );
}

export default function RetainerSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<RetainerAttributes>(sprint);
    const [detail, setDetail] = useState<Detail>(null);
    const priced = a.variant === 'priced' && sprint.price_zar;
    const owner = a.owner ?? { avatar: 'generic' as const };
    const cap = a.capacity ?? { headline: 'Defined in Proposal' };
    const cta = a.cta ?? (priced ? 'Request Proposal' : 'Request a Fit Review');
    const ctaIsExpert = cta === 'Speak to an Expert';

    const detailContent: Record<Exclude<Detail, null>, { title: string; body: ReactNode }> = {
        scope: { title: 'Full scope (included)', body: <ul className="list-disc space-y-1 pl-5">{list(a.scope).map((s) => <li key={s}>{s}</li>)}</ul> },
        exclusions: { title: 'Exclusion register', body: <ul className="list-disc space-y-1 pl-5">{list(a.exclusions).map((s) => <li key={s}>{s}</li>)}</ul> },
        hours: { title: 'How hours are used', body: <p>{cap.unit_definition ?? 'Your quantified allowance, unit and service period are confirmed during C1-C5 proposal scoping.'} Time is logged per unit against the reserved allowance and reported in your Client Portal each period.</p> },
        service: { title: 'Service levels', body: <p>{a.service_level?.text} Response windows apply to business hours unless the agreement states otherwise.</p> },
        rollover: { title: 'Rollover rules', body: <p>{a.unused?.headline} — {a.unused?.text}</p> },
        overage: { title: 'Overage rules', body: <p>{a.overage?.headline} — {a.overage?.text}</p> },
        utilisation: { title: 'Utilisation guidance', body: <p>{a.utilisation} If usage stays low for two consecutive periods, your account owner proposes a right-sized allowance or an alternative route.</p> },
        compare: { title: 'How this retainer compares', body: <p>{a.compare?.intro}</p> },
        pricing: { title: 'How retainer pricing works', body: <p>Retainers reserve human capacity. Pricing is set per unit and period after the C1–C5 capacity test, confirmed in a proposal and only activated once the agreement is signed. There is no instant checkout.</p> },
        owner: { title: 'Delivery model', body: <p>{owner.name ? `${owner.name}${owner.role ? `, ${owner.role}` : ''}. ` : ''}{owner.seniority ? `Seniority model: ${owner.seniority}.` : 'The capacity owner is confirmed during the proposal.'}</p> },
    };

    return (
        <div className="bg-parchment-50">
            <div className="container-tbca py-6">
                <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Retainers', href: '/retainers' }, { label: sprint.title }]} />
                <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <div className="min-w-0 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="font-serif text-3xl leading-tight font-bold text-ink-900 sm:text-4xl">{sprint.title}</h1>
                                <span className="rounded bg-gold-500 px-2 py-0.5 text-xs font-bold tracking-wide text-ink-900 uppercase">{a.badge ?? 'Fit Review Required'}</span>
                            </div>
                            {a.sprint_code && <span className="text-sm text-ink-700">Sprint Code: {a.sprint_code}</span>}
                        </div>
                        <p className="max-w-4xl text-[0.875rem] leading-relaxed text-ink-700">{a.intro ?? sprint.summary}</p>
                        <ul className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 sm:grid-cols-2 xl:grid-cols-4">
                            {pairs(a.meta).map(([t, s], i) => {
                                const Icon = metaIcons[i % metaIcons.length];
                                return (
                                    <li key={t} className="flex items-center gap-2.5 text-xs">
                                        <Icon className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                                        <span><span className="block font-semibold text-ink-900">{t}</span><span className="text-ink-600">{s}</span></span>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <Card title="Capacity (What You Get)" icon={<Clock className="size-4" />} link={cap.link} onLink={() => setDetail('hours')}>
                                <p className="font-serif text-2xl font-bold text-ink-900">{cap.headline}</p>
                                {cap.sub && <p>{cap.sub}</p>}
                                {cap.unit && (
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-[0.6875rem]">
                                        <span><span className="block text-ink-400">UNIT</span><span className="font-semibold text-ink-900">{cap.unit}</span></span>
                                        <span><span className="block text-ink-400">PERIOD</span><span className="font-semibold text-ink-900">{cap.period}</span></span>
                                    </div>
                                )}
                                {cap.unit_definition && <p className="mt-2"><span className="block text-[0.6875rem] text-ink-400">UNIT DEFINITION</span>{cap.unit_definition}</p>}
                                {cap.text && <p className="mt-2 leading-relaxed">{cap.text}</p>}
                            </Card>
                            <Card title="Scope (Included)" icon={<CircleCheck className="size-4" />} link={a.scope_link ?? 'See full scope details'} onLink={() => setDetail('scope')}>
                                <ul className="space-y-1">{list(a.scope).map((s) => <li key={s} className="flex gap-1.5"><Check className="size-3.5 shrink-0 text-gold-600" aria-hidden="true" />{s}</li>)}</ul>
                            </Card>
                            <Card title="Exclusions (Not Included)" icon={<CircleMinus className="size-4" />} link={a.exclusions_link ?? 'View full exclusion details'} onLink={() => setDetail('exclusions')}>
                                <ul className="space-y-1">{list(a.exclusions).map((s) => <li key={s} className="flex gap-1.5"><X className="size-3.5 shrink-0 text-risk-500" aria-hidden="true" />{s}</li>)}</ul>
                            </Card>
                            <Card title="Capacity Owner" icon={<User className="size-4" />} link={owner.link} onLink={() => setDetail('owner')}>
                                <div className="flex items-center gap-3">
                                    <span className={cn('flex size-16 shrink-0 items-center justify-center rounded-full', owner.avatar === 'person' ? 'bg-gradient-to-br from-ink-600 to-ink-900 text-gold-300' : 'bg-parchment-300 text-ink-500')} aria-hidden="true">
                                        {owner.avatar === 'team' ? <Users className="size-8" /> : <User className="size-8" />}
                                    </span>
                                    <div>
                                        {owner.model_label && <p className="text-[0.6875rem] text-ink-500">{owner.model_label}</p>}
                                        <p className="text-sm font-bold text-ink-900">{owner.name ?? owner.headline ?? 'Assigned During Proposal'}</p>
                                        {owner.role && <p className="text-[0.6875rem]">{owner.role}</p>}
                                    </div>
                                </div>
                                {owner.seniority && <p className="mt-2"><span className="block text-[0.6875rem] text-ink-400">{owner.seniority_label ?? 'SENIORITY MODEL'}</span>{owner.seniority}</p>}
                                {owner.text && <p className="mt-2">{owner.text}</p>}
                            </Card>
                            <Card title="Service Level" icon={<ShieldCheck className="size-4" />} link={a.service_level?.link} onLink={() => setDetail('service')}>
                                <BlockBody b={a.service_level} />
                            </Card>
                            <Card title="Unused Allowance" icon={<RefreshCw className="size-4" />} link={a.unused?.link} onLink={() => setDetail('rollover')}>
                                <BlockBody b={a.unused} />
                            </Card>
                            <Card title="Overage Treatment" icon={<TrendingUp className="size-4" />} link={a.overage?.link} onLink={() => setDetail('overage')}>
                                <BlockBody b={a.overage} />
                            </Card>
                            <Card title="Utilisation Economics" icon={<BarChart3 className="size-4" />} link="View utilisation guidance" onLink={() => setDetail('utilisation')}>
                                <p className="leading-relaxed">{a.utilisation}</p>
                            </Card>
                        </div>

                        <ThreePackages sprint={sprint} title="Retainer Packages" per={a.per ?? '/month'} />

                        {a.compare && (
                            <section className="grid items-center gap-4 rounded-[8px] border border-gold-200 bg-gold-50/60 p-4 md:grid-cols-[1fr_1.2fr_auto_1.2fr]">
                                <div className="text-xs text-ink-700">
                                    <h2 className="text-sm font-semibold text-ink-900">How This Retainer Compares</h2>
                                    <p className="mt-1">{a.compare.intro}</p>
                                    <button type="button" onClick={() => setDetail('compare')} className="mt-2 inline-flex items-center gap-1 font-semibold text-gold-700 hover:underline">See full comparison <ArrowRight className="size-3.5" /></button>
                                </div>
                                <div className="text-xs">
                                    <h3 className="text-sm font-semibold text-ink-900">{a.compare.product ?? sprint.title}</h3>
                                    <ul className="mt-1 space-y-1">{list(a.compare.points).map((p) => <li key={p} className="flex gap-1.5"><Check className="size-3.5 text-gold-600" />{p}</li>)}</ul>
                                </div>
                                <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-gold-500 bg-white text-xs font-bold text-gold-700">VS</span>
                                <div className="text-xs">
                                    <h3 className="text-sm font-semibold text-ink-900">{a.compare.alt_title}</h3>
                                    {a.compare.alt_points?.length ? (
                                        <ul className="mt-1 space-y-1">{a.compare.alt_points.map((p) => <li key={p} className="flex gap-1.5"><Check className="size-3.5 text-gold-600" />{p}</li>)}</ul>
                                    ) : (
                                        <p className="mt-1 text-ink-600">{a.compare.alt_text}</p>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <div className="overflow-hidden rounded-[8px] border border-parchment-400 bg-white lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            <div className="bg-ink-950 p-4 text-parchment-100">
                                {priced ? (
                                    <>
                                        <p className="text-xs font-semibold text-gold-400">FROM</p>
                                        <p className="flex items-baseline justify-between gap-2">
                                            <span className="text-3xl font-bold">ZAR {sprint.price_zar!.toLocaleString('en-US')}<span className="ml-1 text-sm font-normal">{a.per ?? '/month'}</span></span>
                                            <span className="text-xs">excl. VAT</span>
                                        </p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-parchment-200"><Check className="size-3.5 text-verified-500" />Pricing subject to proposal &amp; agreement</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xl font-bold text-gold-400">COMMERCIAL REVIEW</p>
                                        <p className="mt-1 text-xs text-parchment-200">{a.commercial_text ?? 'Catalogue pricing withheld pending recurring unit-economics / delivery cost re-scope.'}</p>
                                        {a.commercial_check !== null && <p className="mt-1 flex items-center gap-1.5 text-xs text-parchment-200"><Check className="size-3.5 text-verified-500" />{a.commercial_check ?? 'VAT treatment confirmed in proposal'}</p>}
                                    </>
                                )}
                            </div>
                            <div className="space-y-2 p-4">
                                {ctaIsExpert ? (
                                    <button type="button" onClick={() => askAbout(sprint)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                        <MessageSquare className="size-4" /> {cta}
                                    </button>
                                ) : (
                                    <Link href={quoteHref(sprint)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                        {cta} <ArrowRight className="size-4" aria-hidden="true" />
                                    </Link>
                                )}
                                <button type="button" onClick={() => setDetail('compare')} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-gold-500 text-sm font-medium text-ink-900 hover:bg-gold-50">
                                    <Scale className="size-4" aria-hidden="true" /> Compare Alternatives
                                </button>
                                <ul className="space-y-1.5 pt-2 text-xs text-ink-700">
                                    {list(a.side_list).map((s, i) => {
                                        const Icon = sideIcons[i % sideIcons.length];
                                        return <li key={s} className="flex items-center gap-2"><Icon className="size-3.5 text-gold-700" aria-hidden="true" />{s}</li>;
                                    })}
                                </ul>
                                <button type="button" onClick={() => setDetail('pricing')} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline">How retainer pricing works <ArrowRight className="size-3.5" /></button>
                            </div>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                            <h2 className="text-sm font-semibold text-ink-900">Fit Guidance</h2>
                            <p className="mt-1 text-ink-600">{a.fit_heading ?? 'Best for organisations that need:'}</p>
                            <ul className="mt-2 space-y-1">{list(a.fit).map((f) => <li key={f} className="flex gap-1.5"><Check className="size-3.5 shrink-0 text-gold-600" />{f}</li>)}</ul>
                            {priced && <button type="button" onClick={() => askAbout(sprint)} className="mt-2 font-semibold text-gold-700 hover:underline">Not sure if this fits? →</button>}
                            <button type="button" onClick={() => askAbout(sprint)} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-gold-500 text-sm font-medium text-ink-900 hover:bg-gold-50">
                                <MessageSquare className="size-4" aria-hidden="true" /> Speak to an Expert
                            </button>
                        </div>
                        <div className="flex gap-3 rounded-[8px] border border-gold-200 bg-gold-50/60 p-4 text-xs text-ink-700">
                            <ShieldCheck className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                            <div>
                                <h2 className="text-sm font-semibold text-ink-900">Important</h2>
                                <p className="mt-1">{a.important}</p>
                            </div>
                        </div>
                    </aside>
                </div>

                <ul className="mt-6 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
                    {pairs(a.strip).map(([t, s], i) => {
                        const Icon = t.startsWith('Ask') ? MessageSquare : stripIcons[i % stripIcons.length];
                        const inner = (
                            <>
                                <Icon className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                                <span className="text-xs"><span className="block font-semibold text-ink-900">{t}</span><span className="text-ink-600">{s}</span></span>
                            </>
                        );
                        return (
                            <li key={t}>
                                {t.startsWith('Ask') ? (
                                    <button type="button" onClick={() => askAbout(sprint)} className="flex items-center gap-2.5 text-left hover:text-gold-700">{inner}</button>
                                ) : (
                                    <div className="flex items-center gap-2.5">{inner}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
                {a.sprint_code && <p className="mt-3 text-center text-xs text-ink-600">Sprint Code: {a.sprint_code}</p>}
                <RelatedSprints related={related} title="Related Retainers" className="mt-8" />
            </div>

            <Modal open={detail !== null} onClose={() => setDetail(null)} title={detail ? detailContent[detail].title : ''}>
                <div className="text-[0.8125rem] leading-relaxed text-ink-700">{detail && detailContent[detail].body}</div>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-500"><CalendarClock className="size-3.5" />Final terms are confirmed in the controlled proposal and agreement.</p>
            </Modal>
        </div>
    );
}
