import { CircleCheck, CircleMinus, Clock, FilePen, PlusCircle, ShieldCheck, ShieldX, User, Users } from 'lucide-react';
import { attrsOf, list, pairs } from '@/Components/SprintTypes/B/common';
import PremiumShell, { CreamCard, FaqGrid, IconRow, ProcessSteps, defaultFaqs } from '@/Components/SprintTypes/B/PremiumShell';
import type { SprintRecord } from '@/types';
import type { PremiumAttributes } from '@/types/sprint-types-b';

const metaIcons = [Clock, ShieldCheck, User];
const factIcons = [Clock, FilePen, PlusCircle, ShieldX, User, Users, ShieldCheck];

function Checks({ items, cols = 1 }: { items: string[]; cols?: 1 | 2 | 3 }) {
    return (
        <ul className={cols === 3 ? 'grid gap-x-4 gap-y-1.5 sm:grid-cols-3' : cols === 2 ? 'grid gap-x-4 gap-y-1.5 sm:grid-cols-2' : 'space-y-1.5'}>
            {items.map((i) => (
                <li key={i} className="flex gap-2 text-xs text-ink-700">
                    <CircleCheck className="size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                    {i}
                </li>
            ))}
        </ul>
    );
}

export default function PremiumSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<PremiumAttributes>(sprint);
    const variant = a.layout_variant ?? 'Y';
    const card = a.package_card ?? {};
    const steps = list(a.process?.steps).length ? list(a.process?.steps) : ['Order & Payment', 'Portal Intake', 'Controlled Delivery', 'QA & Review', 'Portal Handover & Next Step'];
    const faqs = pairs(a.faqs).length ? pairs(a.faqs) : defaultFaqs(sprint);
    const facts = pairs(a.fact_strip);

    const overview = (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <CreamCard title="Overview">
                <p className="text-[0.8125rem] leading-relaxed text-ink-600">{a.overview ?? sprint.description}</p>
                <h3 className="mt-4 mb-3 text-sm font-bold text-ink-900">What&apos;s Included</h3>
                <IconRow items={list(a.whats_included_icons)} />
            </CreamCard>
            <CreamCard title="Key Completion Points" tone="cream">
                <Checks items={list(a.key_completion_points)} />
            </CreamCard>
        </div>
    );
    const deliverables = (
        <CreamCard title={a.deliverables?.title ?? 'Standard Deliverables (Included)'}>
            {a.deliverables?.note && <p className="-mt-2 mb-2 text-[0.6875rem] text-ink-400">{a.deliverables.note}</p>}
            <Checks items={list(a.deliverables?.items)} cols={variant === 'X' ? 3 : 2} />
        </CreamCard>
    );
    const needs = (
        <CreamCard title="What We Need From You">
            <Checks items={list(a.what_we_need)} cols={variant === 'Z' ? 2 : 1} />
        </CreamCard>
    );
    const process = (
        <CreamCard title={a.process?.title ?? (variant === 'X' ? '5-Step TBCA Sprint Process' : '5-Step Client Process')}>
            <ProcessSteps steps={steps} />
        </CreamCard>
    );
    const factStrip = facts.length > 0 && (
        <ul className="grid gap-3 rounded-[8px] border border-gold-100 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-7 lg:divide-x lg:divide-parchment-300">
            {facts.map(([k, v], i) => {
                const I = factIcons[i % factIcons.length];
                return (
                    <li key={k} className="flex flex-col gap-1 text-xs lg:px-2">
                        <I className="size-5 text-gold-600" aria-hidden="true" />
                        <span className="font-bold text-ink-900">{k}</span>
                        <span className="text-ink-600">{v}</span>
                    </li>
                );
            })}
        </ul>
    );
    const variantX = variant === 'X' && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {process}
            {a.revisions && (
                <CreamCard title="Revisions">
                    <p className="text-xs text-ink-700">{a.revisions}</p>
                </CreamCard>
            )}
            {list(a.optional_addons).length > 0 && (
                <CreamCard title="Optional Add-ons">
                    <ul className="grid list-disc gap-x-4 gap-y-1 pl-4 text-xs text-ink-700 sm:grid-cols-3">
                        {list(a.optional_addons).map((o) => (
                            <li key={o}>{o}</li>
                        ))}
                    </ul>
                </CreamCard>
            )}
            {list(a.not_included).length > 0 && (
                <CreamCard title="Not Included Unless Specifically Added">
                    <ul className="grid gap-x-4 gap-y-1 text-xs text-ink-700 sm:grid-cols-2">
                        {list(a.not_included).map((o) => (
                            <li key={o} className="flex gap-1.5">
                                <CircleMinus className="size-3.5 shrink-0 text-risk-500" aria-hidden="true" />
                                {o}
                            </li>
                        ))}
                    </ul>
                </CreamCard>
            )}
        </div>
    );
    const faqBlock = (
        <CreamCard title="FAQs">
            <FaqGrid faqs={faqs} />
        </CreamCard>
    );

    const renderTab = (key: string) => {
        switch (key) {
            case 'whats-included':
                return <div className="space-y-4">{overview}{deliverables}</div>;
            case 'process':
                return <div className="space-y-4">{process}{factStrip}</div>;
            case 'deliverables':
                return <div className="space-y-4">{deliverables}{factStrip}</div>;
            case 'requirements':
                return <div className="grid gap-4 md:grid-cols-2">{needs}{variant === 'X' ? variantX : factStrip}</div>;
            case 'faqs':
                return faqBlock;
            default:
                return (
                    <div className="space-y-4">
                        {overview}
                        {variant === 'X' ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">{deliverables}{needs}</div>
                                {variantX}
                                {faqBlock}
                            </>
                        ) : (
                            <>
                                <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr_1.2fr]">{deliverables}{needs}{process}</div>
                                {factStrip}
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <PremiumShell
            sprint={sprint}
            related={related}
            heroIcon={a.hero_icon}
            iconBoxed={variant === 'Z' && !/network/i.test(a.hero_icon ?? '')}
            serifTitle={variant !== 'Z'}
            meta={list(a.hero_meta).map((t, i) => ({ icon: metaIcons[i % 3], text: t }))}
            metaDivided
            chips={list(a.ideal_for)}
            chipsLabel="Ideal for:"
            extraLines={
                a.extra?.category_line ? (
                    <>
                        <p className="mt-2 text-sm text-gold-400">{a.extra.category_line}</p>
                        {a.extra.sub_label && <p className="text-sm font-bold text-white">{a.extra.sub_label}</p>}
                    </>
                ) : null
            }
            card={{
                title: card.title,
                note: card.note ?? 'Prices exclude VAT. VAT added separately.',
                primaryCta: card.primary_cta,
                secondaryCta: card.secondary_cta,
                popularTag: a.extra?.popular_badge ?? null,
            }}
            tabs={list(a.tabs).length ? list(a.tabs) : ['Overview', "What's Included", 'Process', 'Deliverables', 'Requirements', 'FAQs']}
            renderTab={renderTab}
        />
    );
}
