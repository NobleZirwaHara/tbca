import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BarChart3,
    Building2,
    CalendarDays,
    ChevronRight,
    ClipboardList,
    Clock,
    FileCog,
    FileSearch,
    FolderLock,
    Gavel,
    Landmark,
    Lock,
    Megaphone,
    MessageSquare,
    Pencil,
    RefreshCw,
    Scale,
    ShieldCheck,
    Timer,
    UserCheck,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import { askAbout, Box, CheckList, Crumbs, GoldLink, RelatedSprints, SaveButton, attrsOf, list, orderHref, pairs, quoteHref, usePackage } from '@/Components/SprintTypes/B/common';
import { HeroIconTile, priceText } from '@/Components/SprintTypes/B/DarkHeroPackageCard';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { DueDiligenceTrustAttributes } from '@/types/sprint-types-b';

const TAB_LABELS = ['Overview', "What's Included", 'Process', 'Deliverables', 'Inputs & Evidence', 'Fees & External Costs', 'FAQs'];
const tabKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const chipIcons: Record<string, LucideIcon> = {
    building: Building2,
    'building-columns': Landmark,
    megaphone: Megaphone,
    'person-badge': UserCheck,
    'shield-check': ShieldCheck,
    chart: BarChart3,
    lock: Lock,
    users: Users,
};
const includedIcons = [FileCog, ClipboardList, FolderLock, RefreshCw, BarChart3, Users, FileSearch];

function defaultFaqs(sprint: SprintRecord) {
    return [
        { q: 'When does the delivery clock start?', a: 'Once the required intake, consent and authority confirmations are complete in your Secure Client Portal.' },
        { q: 'Is every report reviewed by a person?', a: 'Yes. Findings are human-reviewed before release, with a correction and dispute route after delivery.' },
        { q: 'Are external check fees included?', a: 'No external check proceeds until any separately chargeable vendor or registry cost is disclosed and approved by you.' },
        { q: 'Is this legal advice?', a: `No. ${sprint.title} supports evidence management and decision preparation; it does not replace regulated professional advice.` },
    ];
}

export default function DueDiligenceTrustSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<DueDiligenceTrustAttributes>(sprint);
    const layout = a.layout ?? 'A';
    const { packages, selected, setSelected } = usePackage(sprint);
    const tabs = (list(a.tabs).length ? list(a.tabs) : TAB_LABELS).map((t) => ({ key: tabKey(t), label: t }));
    const [tab, setTab] = useState(tabs[0].key);
    const faqs = a.faqs?.length ? a.faqs : defaultFaqs(sprint);
    const numbering = list(a.section_numbering);
    /** Prefixes a section title with its number on numbered (layout C) pages. */
    const t = (title: string) => {
        if (!numbering.length) return title;
        const hit = numbering.find((n) => n.replace(/^\d+\.\s*/, '').toLowerCase().startsWith(title.toLowerCase().slice(0, 12)));
        return hit ?? title;
    };
    const code = a.display_code ?? sprint.code;

    const overview = (
        <Box title={t('Overview')}>
            <p className="text-[0.8125rem] leading-relaxed text-ink-600">{a.overview ?? sprint.description}</p>
        </Box>
    );
    const included = (
        <Box title={t("What's Included")}>
            <ul className="grid grid-cols-3 divide-parchment-300 rounded-[6px] border border-parchment-400 sm:grid-cols-6 sm:divide-x">
                {list(a.whats_included).map((w, i) => {
                    const Icon = includedIcons[i % includedIcons.length];
                    return (
                        <li key={w} className="flex flex-col items-center gap-1 p-2 text-center text-[0.625rem] leading-tight text-ink-700">
                            <Icon className="size-5 text-gold-600" aria-hidden="true" />
                            {w}
                        </li>
                    );
                })}
            </ul>
        </Box>
    );
    const outcomes = (
        <Box title={t('Key Outcomes')} tone="cream">
            <CheckList items={list(a.key_outcomes)} />
        </Box>
    );
    const deliverables = a.deliverables_checklist && (
        <div>
            <h2 className="mb-3 text-[0.9375rem] font-bold text-ink-900">{t(a.deliverables_checklist.title)}</h2>
            <CheckList items={a.deliverables_checklist.items} cols={2} />
        </div>
    );
    const process = a.process && (
        <div>
            <h2 className="mb-3 text-[0.9375rem] font-bold text-ink-900">{t(a.process.title)}</h2>
            <ol className="grid grid-cols-4 gap-y-4 sm:grid-cols-8">
                {a.process.steps.map((s, i) => (
                    <li key={s} className="relative flex flex-col items-center text-center">
                        {i > 0 && <span aria-hidden="true" className="absolute top-3.5 right-1/2 hidden h-px w-full border-t border-dashed border-gold-400 sm:block" />}
                        <span className="relative z-10 flex size-7 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span>
                        <span className="mt-1.5 px-0.5 text-[0.625rem] leading-tight text-ink-700">{s}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
    const delivProcess = (
        <section className="grid gap-6 rounded-[8px] border border-gold-200 bg-gold-50/60 p-4 md:grid-cols-[1fr_1.4fr]">
            {deliverables}
            {process}
        </section>
    );

    const info = (title: string, Icon: LucideIcon, body: ReactNode) => (
        <section key={title} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
            <Icon className="size-8 shrink-0 text-ink-700" strokeWidth={1.3} aria-hidden="true" />
            <div className="min-w-0 text-xs text-ink-600">
                <h3 className="mb-1.5 text-[0.8125rem] font-bold text-ink-900">{t(title)}</h3>
                {body}
            </div>
        </section>
    );
    const bullets = (items: string[]) => (
        <ul className="list-disc space-y-0.5 pl-4">
            {items.map((i) => <li key={i}>{i}</li>)}
        </ul>
    );
    const inputsCard = info('Inputs & Evidence Required', FileCog, (
        <>
            {bullets(list(a.inputs_evidence))}
            {a.inputs_evidence_note && <p className="mt-1.5 text-ink-400">{a.inputs_evidence_note}</p>}
        </>
    ));
    const infoCards = [
        inputsCard,
        a.delivery_turnaround && info('Delivery & Turnaround', Timer, (
            <>
                {bullets(a.delivery_turnaround.lines)}
                {a.delivery_turnaround.note && <p className="mt-1.5 text-ink-400">{a.delivery_turnaround.note}</p>}
            </>
        )),
        list(a.review_quality).length > 0 && info('Review & Quality Control', ShieldCheck, bullets(list(a.review_quality))),
        a.professional_boundary && info('Professional Boundary', Gavel, <p>{a.professional_boundary}</p>),
        list(a.security_privacy).length > 0 && info('Security & Privacy', Lock, bullets(list(a.security_privacy))),
    ].filter(Boolean);

    const fees = a.fees_external_costs ? (
        <Box title={t(a.fees_external_costs.title)}>
            <dl className="space-y-1 text-xs">
                {pairs(a.fees_external_costs.lines).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                        <dt className={cn('text-ink-800', v ? 'font-semibold' : 'col-span-2')}>{k}</dt>
                        {v && <dd className="text-ink-600">{v.replace(/(\.\d{2})\d+/, '$1')}</dd>}
                    </div>
                ))}
            </dl>
            {a.fees_external_costs.note && <p className="mt-2 rounded-[6px] border border-gold-400 bg-gold-50 px-2.5 py-1.5 text-[0.6875rem] font-medium text-gold-800">{a.fees_external_costs.note}</p>}
        </Box>
    ) : (
        <Box title="Fees & External Costs">
            <p className="text-xs text-ink-600">The TBCA service fee is the package price shown (VAT-exclusive; VAT 15% stated separately). Vendor, registry or partner review fees are pass-through costs disclosed and approved before any external check proceeds.</p>
        </Box>
    );
    const extras = [
        list(a.trust_review_controls).length > 0 && (
            <Box key="trc" title={t('Trust & Review Controls')}>
                <CheckList items={list(a.trust_review_controls)} size="xs" />
            </Box>
        ),
        a.coverage_limitations && (
            <Box key="cov" title={t('Coverage & Limitations')}>
                {Array.isArray(a.coverage_limitations) ? bullets(a.coverage_limitations) : <p className="text-xs text-ink-600">{a.coverage_limitations}</p>}
            </Box>
        ),
        a.why_not_free_ai && (
            <Box key="why" title={t(a.why_not_free_ai.title)}>
                {a.why_not_free_ai.items ? <CheckList items={a.why_not_free_ai.items} size="xs" /> : <p className="text-xs text-ink-600">{a.why_not_free_ai.text}</p>}
            </Box>
        ),
        a.related_next && (
            <Box key="rel" title={t(a.related_next.title.replace(/^\d+\.\s*/, ''))}>
                {a.related_next.style?.includes('chain') ? (
                    <ol className="flex flex-wrap items-center gap-2 text-xs">
                        {a.related_next.items.map((i, n) => (
                            <li key={i} className="flex items-center gap-2">
                                <span className="rounded-[5px] border border-gold-400 bg-gold-50 px-2 py-1 font-medium text-ink-800">{i}</span>
                                {n < a.related_next!.items.length - 1 && <ArrowRight className="size-3.5 text-gold-600" aria-hidden="true" />}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <ul className="divide-y divide-parchment-300 text-xs">
                        {a.related_next.items.map((i) => (
                            <li key={i} className="flex items-center justify-between py-1.5 text-ink-800">{i}<ChevronRight className="size-3.5 text-gold-600" aria-hidden="true" /></li>
                        ))}
                    </ul>
                )}
            </Box>
        ),
    ].filter(Boolean);

    const faqBox = (
        <Box title="Frequently Asked Questions">
            <div className="divide-y divide-parchment-300">
                {faqs.map((f) => (
                    <details key={f.q} className="group py-2.5">
                        <summary className="cursor-pointer list-none text-[0.8125rem] font-semibold text-ink-900">
                            <span className="mr-2 inline-block text-gold-600 transition-transform group-open:rotate-45">+</span>
                            {f.q}
                        </summary>
                        <p className="mt-1.5 pl-5 text-[0.8125rem] text-ink-600">{f.a}</p>
                    </details>
                ))}
            </div>
        </Box>
    );

    const vertical = layout === 'C';
    const purchase = (
        <div className="rounded-[12px] border border-ink-700 bg-ink-950 p-4 text-parchment-100 shadow-raised">
            <h2 className="text-center text-lg font-semibold">{vertical ? 'Choose Your Sprint Package' : 'Choose Your Package'}</h2>
            <fieldset className={cn('mt-4', vertical ? 'space-y-2' : 'grid grid-cols-3 gap-2')}>
                <legend className="sr-only">Package</legend>
                {packages.map((p) => {
                    const active = p.key === selected;
                    const extra = p as typeof p & { tier_line?: string; licence?: string; support?: string };
                    return (
                        <label
                            key={p.key}
                            className={cn(
                                'relative flex cursor-pointer rounded-[8px] border p-2.5 transition-colors',
                                vertical ? 'items-start gap-2.5' : 'flex-col pt-3.5 text-center',
                                active ? 'border-gold-500 bg-ink-900' : 'border-ink-700 hover:border-ink-500',
                            )}
                        >
                            {p.popular && !vertical && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-2 text-[0.5625rem] font-bold whitespace-nowrap text-ink-900">
                                    {layout === 'B' ? 'SELECTED' : '✓ Recommended'}
                                </span>
                            )}
                            <input type="radio" name="package" value={p.key} checked={active} onChange={() => setSelected(p.key)} className={cn('size-4 accent-gold-500', vertical ? 'mt-0.5' : 'sr-only')} aria-label={`${p.name} package`} />
                            <span className="min-w-0 flex-1">
                                <span className={cn('flex gap-2', vertical ? 'justify-between' : 'flex-col')}>
                                    <span className="text-sm font-semibold">{p.name}</span>
                                    <span className={cn('text-sm font-bold', active ? 'text-gold-400' : 'text-white')}>{priceText(p, false)}</span>
                                </span>
                                {p.delivery && <span className="block text-[0.625rem] text-ink-300">{p.delivery}</span>}
                                {extra.tier_line && <span className="block text-[0.625rem] font-semibold text-gold-400">{extra.tier_line}</span>}
                                <span className="mt-1 block text-[0.625rem] leading-snug text-parchment-200">{(p.features ?? []).join(layout === 'B' ? ' · ' : ' ')}</span>
                                {extra.licence && (
                                    <span className="mt-1 block text-[0.625rem] text-parchment-200">Licence: <b className="text-gold-400">{extra.licence}</b> | Support: <b className="text-gold-400">{extra.support}</b></span>
                                )}
                            </span>
                        </label>
                    );
                })}
            </fieldset>
            <GoldLink href={orderHref(sprint, selected)} className="mt-4">Start Due Diligence Sprint</GoldLink>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => askAbout(sprint)} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[5px] border border-ink-600 text-[0.8125rem] hover:border-gold-500">
                    <MessageSquare className="size-4" aria-hidden="true" /> Ask a Question
                </button>
                <Link href={quoteHref(sprint, selected)} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[5px] border border-ink-600 text-[0.8125rem] hover:border-gold-500">
                    <CalendarDays className="size-4" aria-hidden="true" /> Book Discovery Call
                </Link>
            </div>
            <SaveButton sprint={sprint} tone="dark" className="mt-2 w-full" />
            <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-[0.625rem] text-parchment-200">
                {list(a.purchase_badges).map((b) => (
                    <li key={b} className="flex flex-col items-center gap-1"><ShieldCheck className="size-4 text-gold-400" aria-hidden="true" />{b}</li>
                ))}
            </ul>
            {a.price_note && (
                <p className="mt-3 rounded-[5px] bg-ink-800 px-2 py-1.5 text-center text-[0.625rem] tracking-wide text-ink-200 uppercase">
                    {a.price_note.split(' / ').map((s, i) => <span key={s} className={cn('block', i > 0 && 'text-gold-400')}>{s}</span>)}
                </p>
            )}
        </div>
    );

    return (
        <div className="bg-parchment-50">
            <section className="bg-ink-950 text-parchment-100 motif-grid">
                <div className="container-tbca pt-4 pb-8 lg:pr-[25rem]">
                    <Crumbs tone="dark" items={[{ label: 'Home', href: '/' }, { label: 'Due Diligence', href: '/due-diligence' }, { label: 'Due Diligence / Trust Sprints', href: '/sprints/category/due-diligence' }, { label: sprint.title }]} />
                    <div className="mt-5 flex flex-col gap-5 sm:flex-row">
                        <HeroIconTile description={a.hero_icon ?? sprint.title} />
                        <div className="min-w-0">
                            {layout === 'A' && (
                                <p className="text-xs font-bold tracking-widest uppercase"><span className="text-gold-400">Due Diligence</span> / Trust <span className="text-gold-400">Sprint</span></p>
                            )}
                            <h1 className="mt-1 font-serif text-3xl leading-tight font-bold text-white sm:text-4xl">{sprint.title}</h1>
                            {a.subtitle && <p className="mt-2 font-serif text-base text-parchment-200">{a.subtitle}</p>}
                            <p className="mt-2 text-base font-semibold text-gold-400">{a.sprint_code_line ?? code}</p>
                        </div>
                    </div>
                    <ul className={cn('mt-5 grid gap-3', layout === 'A' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6' : 'grid-cols-2 sm:grid-cols-4')}>
                        {(a.trust_chips ?? []).map(([icon, label]) => {
                            const Icon = chipIcons[icon] ?? BadgeCheck;
                            return (
                                <li key={label} className={cn('flex items-center gap-2 text-[0.6875rem] leading-tight text-parchment-100', layout !== 'A' && 'rounded-[6px] border border-ink-600 px-2 py-1.5')}>
                                    <Icon className="size-5 shrink-0 text-gold-400" aria-hidden="true" />
                                    {label}
                                </li>
                            );
                        })}
                    </ul>
                    {pairs(a.facts).length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-parchment-200">
                            {pairs(a.facts).map(([k, v], i) => {
                                const Icon = [Clock, Pencil, UserCheck][i % 3];
                                return <li key={k} className="flex items-center gap-1.5"><Icon className="size-4 text-gold-400" aria-hidden="true" />{v}</li>;
                            })}
                        </ul>
                    )}
                    {list(a.assurance_line).length > 0 && (
                        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-parchment-200">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-gold-400" />{list(a.assurance_line)[0]}</span>
                            {list(a.assurance_line)[1] && <span className="flex items-center gap-1.5"><UserCheck className="size-4 text-gold-400" />{list(a.assurance_line)[1]}</span>}
                        </p>
                    )}
                </div>
            </section>

            <div className="container-tbca pb-12">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
                    <aside className="lg:order-2 lg:-mt-[22rem]">
                        <div className="space-y-4 lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            {purchase}
                            {a.why_clients_choose && (
                                <Box title={t(a.why_clients_choose.title)} tone="cream">
                                    <CheckList items={a.why_clients_choose.items} />
                                </Box>
                            )}
                        </div>
                    </aside>

                    <div className="min-w-0 space-y-4 lg:order-1">
                        <Tabs tabs={tabs} value={tab} onChange={setTab} className="mt-2" />
                        {tab === tabs[0].key && (
                            <>
                                <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                                    <div className="space-y-4">{overview}{included}</div>
                                    {outcomes}
                                </div>
                                {delivProcess}
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{infoCards}</div>
                                {(a.fees_external_costs || extras.length > 0) && (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {a.fees_external_costs && fees}
                                        {extras}
                                    </div>
                                )}
                            </>
                        )}
                        {tab === 'what-s-included' && <div className="space-y-4">{included}{outcomes}</div>}
                        {tab === 'process' && delivProcess}
                        {tab === 'deliverables' && <Box title="Deliverables">{deliverables}</Box>}
                        {tab === 'inputs-evidence' && <div className="grid gap-3 md:grid-cols-2">{infoCards}</div>}
                        {tab === 'fees-external-costs' && <div className="grid gap-3 md:grid-cols-2">{fees}{info('Professional Boundary', Scale, <p>{a.professional_boundary}</p>)}</div>}
                        {tab === 'faqs' && faqBox}

                        {list(a.trusted_by).length > 0 && (
                            <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[8px] bg-ink-950 px-5 py-3 text-parchment-100">
                                <span className="text-xs text-parchment-200">Trusted by organisations across Africa</span>
                                {list(a.trusted_by).map((l) => (
                                    <span key={l} className="text-sm font-bold tracking-tight text-parchment-50">{l}</span>
                                ))}
                            </section>
                        )}
                        {pairs(a.footer_strip).length > 0 && (
                            <ul className="grid gap-3 rounded-[8px] bg-ink-950 p-4 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
                                {pairs(a.footer_strip).map(([k, v]) => (
                                    <li key={k} className="flex items-center gap-2 text-xs">
                                        <ShieldCheck className="size-5 shrink-0 text-gold-400" aria-hidden="true" />
                                        <span><span className="block font-semibold text-parchment-50">{k}</span><span className="text-ink-300">{v}</span></span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {list(a.footer_meta).length > 0 && <p className="text-center text-[0.625rem] text-ink-400">{list(a.footer_meta).join(' · ')}</p>}
                        <RelatedSprints related={related} className="mt-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
