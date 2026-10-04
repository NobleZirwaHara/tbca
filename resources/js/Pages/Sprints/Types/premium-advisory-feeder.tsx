import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CircleCheck,
    CircleX,
    Clock,
    CloudUpload,
    Eye,
    FileText,
    Globe,
    Lock,
    Mountain,
    PlusCircle,
    RefreshCw,
    ShieldCheck,
    Target,
    Truck,
    User,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { attrsOf, list, quoteHref, sprintHref } from '@/Components/SprintTypes/B/common';
import PremiumShell, { CreamCard, FaqGrid, IconRow, ProcessSteps, defaultFaqs } from '@/Components/SprintTypes/B/PremiumShell';
import type { SprintRecord } from '@/types';
import type { PremiumFeederAttributes } from '@/types/sprint-types-b';

function metaIcon(text: string): LucideIcon {
    if (/QA/i.test(text)) return ShieldCheck;
    if (/human/i.test(text)) return User;
    if (/partner/i.test(text)) return Users;
    if (/portal/i.test(text)) return CloudUpload;
    if (/EN \+ AF/i.test(text)) return Globe;
    if (/PDF|DOCX/i.test(text)) return FileText;
    if (/day/i.test(text)) return CalendarDays;
    if (/scope/i.test(text)) return Target;
    if (/vendor/i.test(text)) return Truck;
    return Clock;
}

const trustIcons: LucideIcon[] = [Target, Truck, Users, Lock];

function Checks({ items, cols = 1, icon: I = CircleCheck, tone = 'text-gold-600' }: { items: string[]; cols?: 1 | 2 | 3; icon?: LucideIcon; tone?: string }) {
    return (
        <ul className={cols === 3 ? 'grid gap-x-4 gap-y-1.5 sm:grid-cols-3' : cols === 2 ? 'grid gap-x-4 gap-y-1.5 sm:grid-cols-2' : 'space-y-1.5'}>
            {items.map((i) => (
                <li key={i} className="flex gap-2 text-xs text-ink-700">
                    <I className={`size-3.5 shrink-0 ${tone}`} aria-hidden="true" />
                    {i}
                </li>
            ))}
        </ul>
    );
}

export default function PremiumAdvisoryFeederSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<PremiumFeederAttributes>(sprint);
    const variant = a.layout_variant ?? 'B';
    const card = a.package_card ?? {};
    const steps = list(a.process?.steps).length
        ? list(a.process?.steps)
        : ['Order & Confirm Package', 'Submit Intake & Source Material', 'TBCA Review & Production', 'QA & Revision', 'Portal Delivery & Next Step'];
    const overviewParas = Array.isArray(a.overview) ? a.overview : a.overview ? [a.overview] : [sprint.description ?? ''];
    const next = a.next_advisory_step;

    const routeHref = (title: string) => {
        const clean = title.replace(/^UP-\d+\s*/, '').toLowerCase();
        const hit = related.find((r) => r.title.toLowerCase().includes(clean) || clean.includes(r.title.toLowerCase()));
        return hit ? sprintHref(hit) : quoteHref(sprint);
    };

    const overviewCard = (
        <CreamCard title="Overview">
            {overviewParas.map((p) => (
                <p key={p} className="mb-2 text-[0.8125rem] leading-relaxed text-ink-600 last:mb-0">
                    {p}
                </p>
            ))}
            {variant !== 'B' && (
                <div className="mt-4 rounded-[6px] border border-gold-100 p-3">
                    <h3 className="mb-3 text-sm font-bold text-ink-900">What&apos;s Included</h3>
                    <IconRow items={list(a.whats_included_icons)} />
                </div>
            )}
        </CreamCard>
    );
    const outcomes = (
        <CreamCard title="Key Outcomes" tone="cream">
            <Checks items={list(a.key_outcomes)} />
        </CreamCard>
    );
    const needs = (
        <CreamCard title="What We Need From You" tone={variant === 'B' ? 'cream' : 'white'}>
            {variant === 'B' ? (
                <ul className="list-disc space-y-1 pl-4 text-xs text-ink-700">
                    {list(a.what_we_need).map((w) => (
                        <li key={w}>{w}</li>
                    ))}
                </ul>
            ) : (
                <Checks items={list(a.what_we_need)} />
            )}
        </CreamCard>
    );
    const included = (
        <CreamCard title="What's Included">
            <IconRow items={list(a.whats_included_icons)} />
        </CreamCard>
    );
    const checklist = a.deliverables_checklist && (
        <CreamCard title={a.deliverables_checklist.title ?? 'Deliverables Checklist (Standard Package)'}>
            <Checks items={list(a.deliverables_checklist.items)} cols={variant === 'C' ? 3 : 2} />
        </CreamCard>
    );
    const process = (
        <CreamCard title={a.process?.title ?? '5-Step Sprint Process'}>
            <ProcessSteps steps={steps} />
        </CreamCard>
    );
    const delivery = a.delivery_revisions && (
        <CreamCard title={a.delivery_revisions.title ?? 'Delivery & Revisions'}>
            <dl className="grid grid-cols-2 gap-3">
                {(a.delivery_revisions.rows ?? []).map(([k, v], i) => {
                    const I = i === 0 ? Clock : RefreshCw;
                    const m = v.match(/^([\d\s–-]+)\s*(.*)$/);
                    return (
                        <div key={k} className="text-xs">
                            <I className="mb-1 size-5 text-gold-600" aria-hidden="true" />
                            <dt className="text-ink-600">{k}</dt>
                            <dd>
                                <span className="block text-lg font-bold text-ink-900">{m ? m[1].trim() : v}</span>
                                {m && <span className="text-ink-500">{m[2]}</span>}
                            </dd>
                        </div>
                    );
                })}
            </dl>
        </CreamCard>
    );
    const exclusions = a.exclusions && (
        <CreamCard title={a.exclusions.title ?? 'Exclusions'}>
            <Checks items={list(a.exclusions.items)} icon={CircleX} tone="text-gold-600" cols={variant === 'C' ? 2 : 1} />
        </CreamCard>
    );
    const addons = a.optional_addons && (
        <CreamCard title={a.optional_addons.title ?? 'Optional Add-ons'}>
            <Checks items={list(a.optional_addons.items)} icon={PlusCircle} cols={variant === 'C' ? 2 : 1} />
        </CreamCard>
    );
    const inputsScope = a.inputs_scope && (
        <CreamCard title={a.inputs_scope.title ?? 'Inputs, Scope & Exclusions'}>
            <dl className="space-y-2 text-xs">
                {(a.inputs_scope.rows ?? []).map(([k, v]) => (
                    <div key={k}>
                        <dt className="inline font-bold text-ink-900">{k} </dt>
                        <dd className="inline text-ink-600">{v}</dd>
                    </div>
                ))}
            </dl>
        </CreamCard>
    );
    const governance = a.governance && (
        <CreamCard title={a.governance.title ?? 'Governance & Assurance'}>
            {variant === 'A' ? (
                <IconRow items={list(a.governance.items)} icons={[Target, Eye, ShieldCheck, User, CloudUpload, ArrowRight]} />
            ) : (
                <Checks items={list(a.governance.items)} icon={ShieldCheck} cols={2} />
            )}
        </CreamCard>
    );

    const nextCompact = next && (
        <CreamCard title={next.title ?? 'Your Next Advisory Step'}>
            {next.intro && <p className="mb-2 text-xs text-ink-600">{next.intro}</p>}
            <ul className="space-y-2 text-xs">
                {(next.rows ?? []).map((r) => (
                    <li key={r[0]} className="flex gap-1.5">
                        <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                        <span>
                            <span className="font-semibold text-ink-900">{r[0]}</span>{' '}
                            <Link href={routeHref(r[1])} className="text-gold-700 hover:underline">
                                {r[1]}
                            </Link>
                            {r[2] && <span className="block text-ink-500">{r[2]}</span>}
                        </span>
                    </li>
                ))}
            </ul>
            {next.note && <p className="mt-2 text-[0.6875rem] text-ink-400">{next.note}</p>}
        </CreamCard>
    );
    const nextStrip = next && (
        <section className="grid gap-4 rounded-[8px] border border-gold-200 bg-gold-50/70 p-4 md:grid-cols-[1.1fr_1.3fr_1.3fr_0.9fr]">
            <div className="flex gap-3">
                <Mountain className="size-8 shrink-0 text-gold-600" aria-hidden="true" />
                <div>
                    <h2 className="text-sm font-bold text-ink-900">{next.title ?? 'Your Next Advisory Step'}</h2>
                    {next.intro && <p className="mt-1 text-xs text-ink-600">{next.intro}</p>}
                </div>
            </div>
            {(next.rows ?? []).map((r) => (
                <div key={r[0]} className="text-xs">
                    <p className="font-semibold text-gold-700">{r[0]}</p>
                    <Link href={routeHref(r[1])} className="mt-0.5 block text-sm font-bold text-ink-900 hover:text-gold-700">
                        {r[1]} →
                    </Link>
                    {r[2] && <p className="mt-0.5 text-ink-600">{r[2]}</p>}
                </div>
            ))}
            <p className="flex items-start gap-2 text-xs text-ink-600">
                <Lock className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                {next.note ?? 'Optional. Separately scoped. Not included in this Sprint.'}
            </p>
        </section>
    );
    const faqBlock = (
        <CreamCard title="FAQs">
            <FaqGrid faqs={defaultFaqs(sprint)} />
        </CreamCard>
    );

    const overviewTab = () => {
        if (variant === 'B') {
            return (
                <div className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">{overviewCard}{outcomes}{needs}</div>
                    {included}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {checklist}
                        {process}
                        {delivery}
                        {exclusions}
                        {addons}
                        {governance}
                    </div>
                    {nextStrip}
                </div>
            );
        }
        if (variant === 'C') {
            return (
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">{overviewCard}{outcomes}</div>
                    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">{checklist}{needs}</div>
                    <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">{process}{nextCompact}</div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{delivery}{exclusions}{addons}{governance}</div>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">{overviewCard}{outcomes}</div>
                <div className="grid gap-4 xl:grid-cols-3">{checklist}{process}{needs}</div>
                <div className="grid gap-4 xl:grid-cols-3">{inputsScope}{nextCompact}{governance}</div>
            </div>
        );
    };

    const renderTab = (key: string) => {
        switch (key) {
            case 'whats-included':
                return <div className="space-y-4">{included}{checklist}{outcomes}</div>;
            case 'process':
                return <div className="grid gap-4 md:grid-cols-2">{process}{delivery ?? inputsScope}</div>;
            case 'inputs-scope':
                return <div className="grid gap-4 md:grid-cols-2">{needs}{inputsScope}{exclusions}{addons}</div>;
            case 'faqs':
                return faqBlock;
            case 'next-step':
                return next ? (variant === 'B' ? nextStrip : nextCompact) : <CreamCard title="Next Step"><p className="text-xs text-ink-600">Next steps are recommended at portal handover.</p></CreamCard>;
            default:
                return overviewTab();
        }
    };

    return (
        <PremiumShell
            sprint={sprint}
            related={related}
            heroIcon={a.hero_icon}
            iconBoxed={variant !== 'B'}
            serifTitle={variant !== 'B'}
            badge={a.hero_badge ?? 'Premium Advisory Feeder'}
            badgeAbove={variant === 'C'}
            extraLines={
                a.extra?.category ? (
                    <div className="mt-2 space-y-0.5 text-xs text-parchment-200">
                        <p>{a.extra.category}</p>
                        {a.extra.subcategory && <p>{a.extra.subcategory}</p>}
                    </div>
                ) : null
            }
            meta={list(a.hero_meta).map((t) => ({ icon: metaIcon(t), text: t }))}
            metaDivided={variant === 'A'}
            chips={list(a.for_chips)}
            chipsLabel={a.for_label ?? null}
            chipsFirst={variant === 'B'}
            card={{
                title: card.title,
                note: card.note ?? 'VAT exclusive. VAT calculated separately.',
                noteOutside: !!card.note_outside_card,
                primaryCta: card.primary_cta,
                secondaryCta: card.secondary_cta,
                trustIcons: card.trust_icons ?? null,
                typicalDelivery: card.typical_delivery ?? null,
                bullets: card.features_style === 'bullets',
            }}
            tabs={list(a.tabs).length ? list(a.tabs) : ['Overview', "What's Included", 'Process', 'Inputs & Scope', 'FAQs', 'Next Step']}
            renderTab={renderTab}
            trustBar={list(a.trust_bar).map((t, i) => ({ icon: trustIcons[i % trustIcons.length], text: t }))}
        />
    );
}
