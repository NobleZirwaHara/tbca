import { Link } from '@inertiajs/react';
import { Award, CalendarDays, Check, CircleCheck, Info, Lock, Quote, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import {
    AskButton,
    Crumbs,
    GoldLink,
    RelatedSprints,
    SaveButton,
    attrsOf,
    list,
    orderHref,
    pairs,
    quoteHref,
    usePackage,
    useMoney,
} from '@/Components/SprintTypes/B/common';
import ZoomPreview from '@/Components/SprintTypes/B/ZoomPreview';
import { ToolkitBoxArt, ToolkitIconTile, ToolkitPackages, ToolkitPreviewScreen, ToolkitSectionBlock } from '@/Components/SprintTypes/B/ToolkitParts';
import { cn } from '@/lib/cn';
import type { SprintPackage, SprintRecord } from '@/types';
import type { DigitalToolkitAttributes, ToolkitSection } from '@/types/sprint-types-b';
import { urlTabIndex, useUrlTab } from '@/Components/Sprints/lib';

type TabCat = 'all' | 'included' | 'benefits' | 'process' | 'requirements' | 'specs' | 'use' | 'faq';

function tabCategory(label: string): TabCat {
    const l = label.toLowerCase();
    if (l.includes('overview')) return 'all';
    if (l.includes('faq')) return 'faq';
    if (l.includes('includ') || l.includes('inside') || l.includes('deliverable')) return 'included';
    if (l.includes('benefit') || l.includes('outcome')) return 'benefits';
    if (l.includes('process') || l.includes('how it works') || l.includes('journey')) return 'process';
    if (l.includes('requirement') || l.includes('input')) return 'requirements';
    if (l.includes('use case') || l.includes('who')) return 'use';
    return 'specs';
}

const DEFAULT_TABS = ['Overview', "What's Included", 'Process', 'Requirements', 'FAQs', 'Support'];

type Pkg = SprintPackage & { badge?: string | null; description?: string | null; note?: string | null };

export default function DigitalToolkitSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<DigitalToolkitAttributes>(sprint);
    const money = useMoney();
    const { packages, selected, setSelected, current } = usePackage(sprint);
    const pkgs = packages as Pkg[];
    const layout = a.layout ?? 'standard';
    const tabs = (list(a.tabs).length ? list(a.tabs) : DEFAULT_TABS).map((t) => ({ key: t, label: t }));
    const urlTab = useUrlTab();
    const [tab, setTab] = useState(() => tabs[urlTabIndex(tabs.map((t) => t.label), urlTab)].key);
    const cat = tabCategory(tab);
    const purchase = a.purchase ?? { heading: 'Choose Your Toolkit Package', style: 'dark', primary_cta: 'Buy Toolkit', secondary_cta: 'Book Discovery Call', trust_icons: [], scope_prompt: null, scope_link: null, code_tag: null, price_note: null };
    const sections = (a.sections ?? []) as ToolkitSection[];
    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Sprints', href: '/sprints' },
        ...list(a.breadcrumb)
            .filter((b) => b !== 'Sprints' && b !== sprint.title)
            .slice(0, -1)
            .map((b) => ({ label: b, href: b.toLowerCase().includes('toolkit') || b.toLowerCase().includes('digital') ? '/sprints/category/digital-products' : undefined })),
        { label: sprint.title },
    ];
    const crumbItems = crumbs.length > 3 ? crumbs : [{ label: 'Home', href: '/' }, { label: 'Digital Products', href: '/sprints/category/digital-products' }, { label: 'Toolkits', href: '/sprints/category/templates-toolkits' }, { label: sprint.title }];

    /* ----- shared blocks, tagged by tab category ----------------------- */
    const blocks: { cat: Exclude<TabCat, 'all' | 'faq'>; node: ReactNode; wide?: boolean }[] = [];
    const add = (c: Exclude<TabCat, 'all' | 'faq'>, node: ReactNode, wide = false) => node && blocks.push({ cat: c, node, wide });

    add(
        'benefits',
        <section key="ov" className="rounded-[8px] border border-parchment-400 bg-white p-5">
            <h2 className="mb-2 text-sm font-bold tracking-wide text-ink-900 uppercase">Overview</h2>
            <p className="text-[0.8125rem] leading-relaxed text-ink-600">{a.overview ?? sprint.description}</p>
            {a.best_for && <p className="mt-3 text-[0.8125rem] text-ink-700"><strong className="text-ink-900">Best for:</strong> {a.best_for}</p>}
        </section>,
    );
    if (list(a.key_outcomes).length)
        add(
            'benefits',
            <section key="ko" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-900 uppercase">Key Outcomes</h2>
                <ul className="space-y-1.5 text-[0.8125rem] text-ink-700">
                    {list(a.key_outcomes).map((k) => <li key={k} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{k}</li>)}
                </ul>
            </section>,
        );
    if (list(a.included).length)
        add(
            'included',
            <section key="inc" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-900 uppercase">{a.included_heading ?? "What's Included"}</h2>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {list(a.included).map((w) => (
                        <li key={w} className="flex flex-col items-center gap-1.5 rounded-[6px] bg-parchment-100 p-2.5 text-center text-xs text-ink-700">
                            <Sparkles className="size-5 text-gold-600" aria-hidden="true" />
                            {w}
                        </li>
                    ))}
                </ul>
            </section>,
            true,
        );
    if (a.inside?.columns?.length)
        add(
            'included',
            <section key="inside" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <h2 className="mb-4 text-sm font-bold tracking-wide text-ink-900 uppercase">
                    {a.inside.heading} {a.inside.count && <span className="text-gold-700">{a.inside.count}</span>}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {a.inside.columns.map((c) => (
                        <div key={c.title}>
                            <p className="text-xs font-bold text-gold-700 uppercase">{c.title}</p>
                            <ul className="mt-2 space-y-1 text-xs text-ink-700">
                                {c.items.map((i) => <li key={i} className="flex gap-1.5"><Check className="mt-0.5 size-3 shrink-0 text-gold-600" aria-hidden="true" />{i}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                {!!a.inside.plus_row?.length && (
                    <p className="mt-4 flex flex-wrap items-center gap-2 border-t border-parchment-300 pt-3 text-xs">
                        <strong className="text-ink-900">{a.inside.plus_label ?? 'PLUS INCLUDED:'}</strong>
                        {a.inside.plus_row.map((p) => <span key={p} className="rounded-full bg-gold-50 px-2 py-0.5 text-gold-800">{p}</span>)}
                    </p>
                )}
            </section>,
            true,
        );
    if (list(a.checklist).length)
        add(
            'included',
            <section key="cl" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-900 uppercase">{a.checklist_heading ?? 'Deliverables Checklist'}</h2>
                <ul className="grid gap-x-6 gap-y-1.5 text-[0.8125rem] text-ink-700 sm:grid-cols-2">
                    {list(a.checklist).map((k) => <li key={k} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{k}</li>)}
                </ul>
            </section>,
        );
    if (list(a.process).length)
        add(
            'process',
            <section key="pr" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <h2 className="mb-4 text-sm font-bold tracking-wide text-ink-900 uppercase">{a.process_heading ?? 'Toolkit Access Process'}</h2>
                <ol className="grid grid-cols-2 gap-y-4 sm:grid-flow-col sm:auto-cols-fr sm:grid-cols-none">
                    {list(a.process).map((p, i) => (
                        <li key={p} className="relative flex flex-col items-center text-center">
                            {i > 0 && <span aria-hidden="true" className="absolute top-4 right-1/2 hidden h-px w-full bg-gold-300 sm:block" />}
                            <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-ink-900">{i + 1}</span>
                            <span className="mt-1.5 px-1 text-[0.6875rem] font-medium text-ink-700">{p}</span>
                        </li>
                    ))}
                </ol>
            </section>,
        );
    if (list(a.requirements).length)
        add(
            'requirements',
            <section key="req" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-900 uppercase">Requirements</h2>
                <ul className="grid gap-1.5 text-[0.8125rem] text-ink-700 sm:grid-cols-2">
                    {list(a.requirements).map((k) => <li key={k} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{k}</li>)}
                </ul>
            </section>,
        );
    if (a.assurance?.length)
        add(
            'specs',
            <section key="as" className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
                {a.assurance.map((x) => (
                    <div key={x.title} className="flex gap-2.5">
                        <ShieldCheck className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                        <span className="text-xs"><span className="block font-semibold text-ink-900">{x.title}</span><span className="text-ink-600">{x.text}</span></span>
                    </div>
                ))}
            </section>,
            true,
        );
    if (pairs(a.tech_specs).length || a.quality || a.promise)
        add(
            'specs',
            <div key="specs" className="grid gap-4 md:grid-cols-3">
                {pairs(a.tech_specs).length > 0 && (
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-900 uppercase">Tech Specs</h2>
                        <dl className="space-y-2 text-xs">
                            {pairs(a.tech_specs).map(([k, v]) => <div key={k}><dt className="font-semibold text-ink-500 uppercase">{k}</dt><dd className="text-ink-900">{v}</dd></div>)}
                        </dl>
                    </section>
                )}
                {a.quality && (
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-900 uppercase">{a.quality.heading}</h2>
                        <ul className="space-y-1.5 text-xs text-ink-700">{a.quality.items.map((q) => <li key={q} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-gold-600" />{q}</li>)}</ul>
                    </section>
                )}
                {a.promise && (
                    <section className="flex flex-col items-center justify-center rounded-[8px] bg-ink-950 p-5 text-center text-parchment-100">
                        <Award className="size-10 text-gold-400" aria-hidden="true" />
                        <h2 className="mt-2 text-sm font-bold tracking-wide text-gold-400 uppercase">{a.promise.title}</h2>
                        <p className="mt-1 text-xs text-parchment-200">{a.promise.text}</p>
                    </section>
                )}
            </div>,
            true,
        );
    sections.forEach((s, i) => add((s.tab ?? 'included') as Exclude<TabCat, 'all' | 'faq'>, <ToolkitSectionBlock key={`s${i}`} section={s} />, s.kind === 'columns' || s.kind === 'stats' || s.kind === 'steps'));
    if (a.why_not_free_ai)
        add(
            'benefits',
            <section key="wnf" className="rounded-[8px] border border-gold-300 bg-gold-50 p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-ink-900 uppercase"><Info className="size-4 text-gold-700" />{a.why_not_free_ai.title}</h2>
                <p className="mt-2 text-[0.8125rem] text-ink-700">{a.why_not_free_ai.text}</p>
            </section>,
        );

    const faqs = [
        { q: 'How do I access the toolkit after payment?', a: 'Access is instant: once payment clears, the files and quick-start guide unlock in your Client Portal and a download link is emailed to you.' },
        { q: 'Can I edit and reuse the templates?', a: 'Yes. Files are editable within the usage rights of the package you choose (single entity on Standard, wider rights on Premium).' },
        { q: 'Is there human review?', a: 'Human review applies when triggered by high-risk or regulated use, or where your package includes a review.' },
        { q: 'What if I need a different scope?', a: 'Request a scope review and TBCA will quote a tailored version or recommend a related sprint.' },
    ];

    const visible = cat === 'all' ? blocks : blocks.filter((b) => b.cat === cat);
    const body = (
        <div className="space-y-4">
            <Tabs tabs={tabs} value={tab} onChange={setTab} className="rounded-t-[8px] bg-white px-2" />
            {cat === 'faq' ? (
                <section className="divide-y divide-parchment-300 rounded-[8px] border border-parchment-400 bg-white px-5">
                    {faqs.map((f) => (
                        <details key={f.q} className="group py-3">
                            <summary className="cursor-pointer list-none text-[0.8125rem] font-semibold text-ink-900"><span className="mr-2 inline-block text-gold-600 group-open:rotate-45">+</span>{f.q}</summary>
                            <p className="mt-1.5 pl-5 text-[0.8125rem] text-ink-600">{f.a}</p>
                        </details>
                    ))}
                </section>
            ) : visible.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {visible.map((b, i) => (
                        <div key={i} className={cn(b.wide && 'md:col-span-2')}>{b.node}</div>
                    ))}
                </div>
            ) : (
                <section className="rounded-[8px] border border-parchment-400 bg-white p-5 text-[0.8125rem] text-ink-600">
                    Details for “{tab}” are confirmed on the package you select. <button type="button" onClick={() => setTab(tabs[0].key)} className="font-semibold text-gold-700 hover:underline">Back to overview</button>
                </section>
            )}
        </div>
    );

    /* ----- purchase card ----------------------------------------------- */
    const lightCard = purchase.style === 'light';
    const purchaseCard = pkgs.length ? (
        <div className={cn('rounded-[10px] border p-4 shadow-raised', lightCard ? 'border-parchment-400 bg-white' : 'border-ink-700 bg-ink-950 text-parchment-100')}>
            {purchase.code_tag && <p className="mb-1 text-[0.6875rem] font-semibold text-gold-600">{purchase.code_tag}</p>}
            <h2 className={cn('mb-3 text-center text-base font-bold', layout === 'box' && !lightCard ? 'tracking-wide text-gold-400 uppercase' : lightCard ? 'text-ink-900' : 'text-parchment-50')}>{purchase.heading}</h2>
            <ToolkitPackages packages={pkgs} selected={selected} onSelect={setSelected} tone={lightCard ? 'light' : 'dark'} money={(z) => money(z)} note={purchase.price_note && purchase.price_note.length < 30 ? purchase.price_note : null} />
            <GoldLink href={orderHref(sprint, selected)} className="mt-4">{`${purchase.primary_cta}${current ? ` — ${money(current.zar)}` : ''}`}</GoldLink>
            <Link href={quoteHref(sprint, selected)} className={cn('mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border text-sm font-medium', lightCard ? 'border-ink-900 bg-ink-900 text-parchment-50 hover:bg-ink-800' : 'border-gold-600 hover:bg-ink-900')}>
                <CalendarDays className="size-4" aria-hidden="true" />
                {purchase.secondary_cta}
            </Link>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <SaveButton sprint={sprint} tone={lightCard ? 'light' : 'dark'} label="Save" />
                <AskButton sprint={sprint} tone={lightCard ? 'light' : 'dark'} />
            </div>
            {!!purchase.trust_icons.length && (
                <ul className={cn('mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[0.625rem]', lightCard ? 'text-ink-600' : 'text-parchment-300')}>
                    {purchase.trust_icons.map((t, i) => <li key={t} className="flex items-center gap-1">{[<Lock key="l" className="size-3 text-gold-500" />, <Zap key="z" className="size-3 text-gold-500" />, <ShieldCheck key="s" className="size-3 text-gold-500" />][i % 3]}{t}</li>)}
                </ul>
            )}
            {purchase.price_note && purchase.price_note.length >= 30 && <p className={cn('mt-2 text-center text-[0.625rem]', lightCard ? 'text-ink-500' : 'text-ink-300')}>{purchase.price_note}</p>}
            {purchase.scope_link && (
                <p className={cn('mt-3 border-t pt-3 text-center text-xs', lightCard ? 'border-parchment-300 text-ink-600' : 'border-ink-700 text-parchment-300')}>
                    {purchase.scope_prompt}{' '}
                    <Link href={quoteHref(sprint)} className="font-semibold text-gold-500 hover:underline">{purchase.scope_link} →</Link>
                </p>
            )}
        </div>
    ) : (
        <div className="rounded-[10px] border border-gold-600 bg-ink-950 p-5 text-center text-parchment-100 shadow-raised">
            <h2 className="font-serif text-lg font-bold text-gold-400">{a.cta_banner?.heading ?? 'Talk to TBCA'}</h2>
            {a.cta_banner?.text && <p className="mt-1 text-xs text-parchment-200">{a.cta_banner.text}</p>}
            <GoldLink href={quoteHref(sprint)} className="mt-4">{a.cta_banner?.button ?? 'Start the Conversation'}</GoldLink>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <SaveButton sprint={sprint} tone="dark" label="Save" />
                <AskButton sprint={sprint} tone="dark" />
            </div>
        </div>
    );

    const previewNode = a.preview && (
        <ZoomPreview title={a.preview.title} large={<ToolkitPreviewScreen preview={a.preview} />}>
            <ToolkitPreviewScreen preview={a.preview} light={layout === 'research'} />
        </ZoomPreview>
    );

    const idealFor = list(a.ideal_for).length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-parchment-100">{a.ideal_for_label ?? 'Ideal for:'}</span>
            {list(a.ideal_for).map((i) => <span key={i} className="rounded-full border border-gold-600/70 px-2.5 py-0.5 text-gold-200">{i}</span>)}
        </div>
    );

    const titleBlock = (dark: boolean) => (
        <>
            <div className="flex flex-wrap gap-2">
                {list(a.badges).map((b, i) => (
                    <span key={b} className={cn('rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase', i === 0 ? 'border-gold-500 bg-gold-500/10 text-gold-400' : dark ? 'border-ink-500 text-parchment-200' : 'border-parchment-500 text-ink-700')}>{b}</span>
                ))}
            </div>
            <h1 className={cn('mt-3 font-serif text-3xl leading-tight font-bold sm:text-4xl', dark ? 'text-white' : 'text-ink-900')}>
                {a.title_main ?? sprint.title}
                {a.title_variant && <span className="block text-gold-400">{a.title_variant.startsWith('–') || a.title_variant.startsWith('-') ? a.title_variant : `– ${a.title_variant}`}</span>}
            </h1>
            {a.tagline && <p className="mt-2 text-sm font-semibold text-gold-400">{a.tagline}</p>}
            {a.subtitle && <p className={cn('mt-2 text-[0.9375rem]', layout === 'box' || layout === 'sheet' ? 'text-gold-300' : dark ? 'text-parchment-200' : 'text-gold-700')}>{a.subtitle}</p>}
        </>
    );

    const whyStrip = (pairs(a.why_strip).length > 0 || list(a.footer_items).length > 0 || pairs(a.trust_strip).length > 0) && (
        <section className="mt-8 grid gap-4 rounded-[8px] bg-ink-950 p-5 text-parchment-100 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
            {(pairs(a.why_strip).length ? pairs(a.why_strip) : pairs(a.trust_strip)).map(([t, s]) => (
                <div key={t}><p className="text-xs font-bold tracking-wide text-gold-400 uppercase">{t}</p><p className="mt-1 text-xs text-parchment-200">{s}</p></div>
            ))}
            {!pairs(a.why_strip).length && !pairs(a.trust_strip).length && list(a.footer_items).map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs"><ShieldCheck className="size-4 text-gold-400" />{t}</div>
            ))}
        </section>
    );

    const metaBar = pairs(a.meta_bar).length > 0 && (
        <dl className="mt-6 grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-3 lg:grid-cols-5">
            {pairs(a.meta_bar).map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>)}
        </dl>
    );

    /* ----- layouts ----------------------------------------------------- */
    if (layout === 'sheet') {
        return (
            <div className="bg-parchment-100">
                <section className="bg-ink-950 text-parchment-100 motif-glow">
                    <div className="container-tbca py-6">
                        <Crumbs tone="dark" items={crumbItems} />
                        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_22rem]">
                            <div>
                                {titleBlock(true)}
                                <p className="mt-3 text-[0.875rem] leading-relaxed text-parchment-200">{sprint.description}</p>
                                {list(a.hero_checks).length > 0 && (
                                    <ul className="mt-4 space-y-1.5 text-[0.8125rem]">{list(a.hero_checks).map((c) => <li key={c} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-gold-400" />{c}</li>)}</ul>
                                )}
                                {list(a.meta_strip).length > 0 && (
                                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-parchment-200">{list(a.meta_strip).map((m) => <li key={m} className="flex items-center gap-1.5"><Check className="size-3.5 text-gold-400" />{m}</li>)}</ul>
                                )}
                                {list(a.highlights).length > 0 && (
                                    <ul className="mt-4 flex flex-wrap gap-2">{list(a.highlights).map((m) => <li key={m} className="rounded-full border border-gold-600/70 px-2.5 py-0.5 text-xs text-gold-200">{m}</li>)}</ul>
                                )}
                                {idealFor}
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4">
                                <ToolkitBoxArt art={a.box_art ?? { brand: 'TBCA', title_lines: (a.title_main ?? sprint.title).toUpperCase().split(' – ')[0].split(' '), tagline: a.subtitle }} icon={a.hero_icon ?? 'package'} />
                                {a.hero_icon_caption && <p className="text-center text-[0.6875rem] font-semibold tracking-wider whitespace-pre-line text-gold-400">{a.hero_icon_caption}</p>}
                            </div>
                            <aside>{purchaseCard}</aside>
                        </div>
                    </div>
                </section>
                <div className="container-tbca py-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        {blocks.map((b, i) => <div key={i} className={cn(b.wide && 'md:col-span-2')}>{b.node}</div>)}
                    </div>
                    {a.quote && (
                        <figure className="mt-6 rounded-[8px] border-l-4 border-gold-500 bg-white p-5">
                            <Quote className="size-6 text-gold-500" aria-hidden="true" />
                            <blockquote className="mt-2 font-serif text-lg text-ink-900 italic">{a.quote.text}</blockquote>
                            {a.quote.attribution && <figcaption className="mt-1 text-xs text-ink-500">{a.quote.attribution}</figcaption>}
                        </figure>
                    )}
                    {a.cta_banner && pkgs.length > 0 && (
                        <section className="mt-6 flex flex-col items-center gap-3 rounded-[10px] bg-ink-950 p-6 text-center text-parchment-100 sm:flex-row sm:text-left">
                            <div className="flex-1">
                                <h2 className="font-serif text-xl font-bold text-gold-400">{a.cta_banner.heading}</h2>
                                {a.cta_banner.text && <p className="mt-1 text-sm text-parchment-200">{a.cta_banner.text}</p>}
                            </div>
                            <GoldLink href={orderHref(sprint, selected)} className="w-auto">{a.cta_banner.button ?? 'Get Instant Access'}</GoldLink>
                        </section>
                    )}
                    {whyStrip}
                    <RelatedSprints related={related} className="mt-8" />
                </div>
            </div>
        );
    }

    if (layout === 'research') {
        return (
            <div className="bg-parchment-50">
                <div className="container-tbca py-6">
                    <Crumbs items={crumbItems} />
                    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
                        <div className="min-w-0 space-y-5">
                            <div className="grid gap-6 xl:grid-cols-2">
                                <div>
                                    {titleBlock(false)}
                                    <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-700">{sprint.description}</p>
                                    {list(a.highlights).length > 0 && (
                                        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                            {list(a.highlights).map((h) => <li key={h} className="flex items-center gap-2 text-xs font-medium text-ink-800"><CircleCheck className="size-4 text-gold-600" />{h}</li>)}
                                        </ul>
                                    )}
                                </div>
                                <div>{previewNode}</div>
                            </div>
                            {a.preview && pairs(a.preview.footer_row).length > 0 && (
                                <dl className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs sm:grid-cols-5">
                                    {pairs(a.preview.footer_row).map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>)}
                                </dl>
                            )}
                            {body}
                        </div>
                        <aside><div className="lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">{purchaseCard}</div></aside>
                    </div>
                    {whyStrip}
                    {metaBar}
                    <RelatedSprints related={related} className="mt-8" />
                </div>
            </div>
        );
    }

    // standard + box share the two-column shell
    const hero =
        layout === 'box' ? (
            <section className="rounded-[10px] bg-ink-950 p-5 text-parchment-100 motif-glow sm:p-6">
                <Crumbs tone="dark" items={crumbItems} />
                <div className="mt-5 grid gap-6 xl:grid-cols-[auto_minmax(0,1fr)]">
                    <ToolkitBoxArt art={a.box_art ?? { brand: 'TBCA', title_lines: [(a.title_main ?? sprint.title).toUpperCase()] }} icon={a.hero_icon ?? 'package'} />
                    <div>
                        {titleBlock(true)}
                        <p className="mt-3 text-[0.8125rem] leading-relaxed text-parchment-200">{sprint.description}</p>
                        {list(a.meta_strip).length > 0 && (
                            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-parchment-200">{list(a.meta_strip).map((m) => <li key={m} className="flex items-center gap-1.5"><Check className="size-3.5 text-gold-400" />{m}</li>)}</ul>
                        )}
                        {idealFor}
                    </div>
                </div>
                {list(a.highlights).length > 0 && (
                    <ul className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-700 pt-4 sm:grid-cols-4">
                        {list(a.highlights).map((h) => <li key={h} className="flex items-center gap-2 text-xs text-parchment-100"><ShieldCheck className="size-4 shrink-0 text-gold-400" />{h}</li>)}
                    </ul>
                )}
                {a.governance_callout && (
                    <p className="mt-4 flex gap-2 rounded-[6px] border border-gold-700 bg-ink-900 p-3 text-xs"><ShieldCheck className="size-5 shrink-0 text-gold-400" /><span><strong className="block text-gold-300">{a.governance_callout.title}</strong>{a.governance_callout.text}</span></p>
                )}
                {previewNode && <div className="mt-5">{previewNode}</div>}
            </section>
        ) : (
            <section className="rounded-[10px] bg-ink-950 p-5 text-parchment-100 motif-glow sm:p-6">
                <Crumbs tone="dark" items={crumbItems} />
                <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                        <div className="flex gap-4">
                            <ToolkitIconTile name={a.hero_icon ?? 'package'} />
                            <div className="min-w-0">{titleBlock(true)}</div>
                        </div>
                        <p className="mt-4 text-[0.8125rem] leading-relaxed text-parchment-200">{sprint.description}</p>
                        {list(a.meta_strip).length > 0 && (
                            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-parchment-200">{list(a.meta_strip).map((m, i) => <li key={m} className={cn('flex items-center gap-1.5', i === 0 && 'text-gold-300')}><Check className="size-3.5 text-gold-400" />{m}</li>)}</ul>
                        )}
                        {list(a.hero_checks).length > 0 && (
                            <ul className="mt-4 space-y-1 text-xs">{list(a.hero_checks).map((c) => <li key={c} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-gold-400" />{c}</li>)}</ul>
                        )}
                        {idealFor}
                    </div>
                    <div className="flex items-center">{previewNode}</div>
                </div>
            </section>
        );

    return (
        <div className="bg-parchment-100">
            <div className="container-tbca py-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="min-w-0 space-y-5">
                        {hero}
                        {body}
                    </div>
                    <aside><div className="lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">{purchaseCard}</div></aside>
                </div>
                {whyStrip}
                <RelatedSprints related={related} className="mt-8" />
            </div>
        </div>
    );
}
