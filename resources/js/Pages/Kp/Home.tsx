import { Head, Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Crumbs, Ico, PillTabs } from '@/Components/Webinars/kit';
import { BASE, InsightCard, KpMonogram, type KpCard, type KpShared, type KpTheme } from '@/Components/Kp/kit';

interface Props extends KpShared {
    tab: string;
    items: KpCard[];
    themes: KpTheme[];
    focusAreas: [string, string, string][];
    engage: [string, string, string, string][];
}

const TABS = [
    { key: 'featured', label: 'Featured Insights' },
    { key: 'articles', label: 'Articles' },
    { key: 'interviews', label: 'Interviews & Media' },
    { key: 'notes', label: "Founder's Notes" },
    { key: 'frameworks', label: 'Frameworks' },
];

/** KP Thought Leadership landing page (Page 1 of KP's designs). */
export default function Home({ tab, items, themes, focusAreas, engage, kpNav }: Props) {
    return (
        <div className="bg-ink-950 pb-10 text-parchment-200">
            <Head title="KP Thought Leadership" />
            <div className="container-tbca pt-5">
                <Crumbs items={[['Home', '/'], ['KP Thought Leadership']]} dark />
                <nav aria-label="KP Thought Leadership sections" className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                    {kpNav.map(([label, href]) => (
                        <Link key={href} href={href} className="shrink-0 rounded-full border border-ink-700 px-3 py-1 text-[0.75rem] font-semibold whitespace-nowrap text-parchment-200 hover:border-gold-500 hover:text-gold-300">
                            {label}
                        </Link>
                    ))}
                </nav>

                <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem_17rem]">
                    <div>
                        <h1 className="font-serif text-[2.25rem] leading-tight font-bold text-parchment-50 md:text-[2.75rem]">
                            KP Thought Leadership.
                            <br />
                            <span className="text-gold-400">Ideas. Insights. Impact.</span>
                        </h1>
                        <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed">
                            Strategic perspectives from Kruger Phiri on business, investment, leadership, innovation and Africa's transformation. Practical thinking you can test, with sources you can check.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <BtnLink href={`${BASE}/insights`} size="lg" icon="arrow-right">Explore All Insights</BtnLink>
                            <BtnLink href={`${BASE}/speaking-media`} size="lg" tone="ghostDark" icon="play">Watch KP in Action</BtnLink>
                        </div>
                    </div>
                    <div className="flex items-center justify-center rounded-[12px] border border-gold-700/40 bg-gradient-to-b from-ink-900 to-ink-950 p-6">
                        <KpMonogram dark />
                    </div>
                    <aside className="rounded-[12px] border border-gold-700/50 bg-ink-900 p-4" aria-label="Focus areas">
                        <h2 className="font-serif text-[1.0625rem] font-bold text-gold-400">Where KP Focuses</h2>
                        <ul className="mt-3 space-y-2.5">
                            {focusAreas.map(([t, b, i]) => (
                                <li key={t} className="flex gap-2.5">
                                    <Ico name={i} className="mt-0.5 size-5 shrink-0 text-gold-500" />
                                    <span>
                                        <span className="block text-[0.8125rem] font-semibold text-parchment-50">{t}</span>
                                        <span className="block text-[0.6875rem] text-parchment-300">{b}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
                    <div className="rounded-[12px] border border-gold-700/40 bg-ink-900 p-4">
                        <PillTabs dark tabs={TABS} value={tab} onChange={(k) => router.get(BASE, k === 'featured' ? {} : { tab: k }, { preserveScroll: true, preserveState: true })} />
                        {items.length === 0 ? (
                            <p className="mt-4 rounded-[8px] border border-ink-700 p-6 text-center text-[0.875rem]">No items in this group yet.</p>
                        ) : (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {items.slice(0, 4).map((i) => <InsightCard key={i.slug} item={i} />)}
                            </div>
                        )}
                    </div>
                    <aside className="rounded-[12px] border border-gold-700/40 bg-ink-900 p-4">
                        <h2 className="font-serif text-[1.0625rem] font-bold text-parchment-50">Popular Topics</h2>
                        <ul className="mt-2 divide-y divide-ink-800">
                            {themes.map((t) => (
                                <li key={t.slug}>
                                    <Link href={t.href} className="flex items-center gap-2.5 py-2 text-[0.8125rem] hover:text-gold-300">
                                        <Ico name={t.icon} className="size-4 text-gold-500" />
                                        <span className="flex-1">{t.label}</span>
                                        <span className="text-[0.6875rem] text-parchment-400">{t.articles}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <BtnLink href={`${BASE}/topics`} className="mt-3 w-full" icon="arrow-right">View All Topics</BtnLink>
                    </aside>
                </section>

                <section className="mt-6 grid gap-4 rounded-[12px] border border-gold-700/40 bg-ink-900 p-4 md:grid-cols-[14rem_repeat(4,minmax(0,1fr))_auto] md:items-center">
                    <div className="flex items-center gap-3">
                        <L.Presentation className="size-8 text-gold-500" aria-hidden="true" />
                        <div>
                            <h2 className="font-serif text-[1.0625rem] font-bold text-parchment-50">Engage With KP</h2>
                            <p className="text-[0.6875rem]">Speaking, advisory sessions, boardroom strategy and media.</p>
                        </div>
                    </div>
                    {engage.map(([t, s, i, h]) => (
                        <Link key={t} href={h} className="flex items-center gap-2.5 rounded-[8px] p-2 hover:bg-ink-800">
                            <Ico name={i} className="size-6 text-gold-400" />
                            <span>
                                <span className="block text-[0.8125rem] font-semibold text-parchment-50">{t}</span>
                                <span className="block text-[0.6875rem] text-parchment-300">{s}</span>
                            </span>
                        </Link>
                    ))}
                    <BtnLink href={`${BASE}/book`} tone="ghostDark" icon="calendar-days">Contact KP Team</BtnLink>
                </section>
            </div>
        </div>
    );
}
