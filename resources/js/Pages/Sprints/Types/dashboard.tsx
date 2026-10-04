import { Link } from '@inertiajs/react';
import {
    Award,
    BadgeCheck,
    Box as BoxIcon,
    CalendarDays,
    ChevronRight,
    Clock,
    Crown,
    FileText,
    Globe,
    Info,
    Layers,
    Percent,
    RefreshCw,
    ShieldCheck,
    SquareCheck,
    Tag as TagIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import { AskButton, Crumbs, GoldLink, RelatedSprints, SaveButton, attrsOf, list, orderHref, pairs, quoteHref, usePackage, zarComma } from '@/Components/SprintTypes/B/common';
import DataVisual from '@/Components/SprintTypes/B/DataVisual';
import ZoomPreview from '@/Components/SprintTypes/B/ZoomPreview';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { DashboardAttributes } from '@/types/sprint-types-b';

const highlightIcons = [BoxIcon, BadgeCheck, ShieldCheck, Crown, Award];
const factIcons = [Clock, RefreshCw, Layers, Globe, TagIcon, CalendarDays, Percent];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function DashboardSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<DashboardAttributes>(sprint);
    const { packages, selected, setSelected, current } = usePackage(sprint);
    const tabs = (list(a.tabs).length ? list(a.tabs) : ['Overview', 'What You Receive', 'Inputs Required', 'Dashboard Build', 'Data & KPI Logic', 'Refresh & Maintenance', 'Support', 'Related Sprint', 'Disclosure']).map((t) => ({ key: slug(t), label: t }));
    const [tab, setTab] = useState(tabs[0].key);
    const badges = list(a.badges).length ? list(a.badges) : ['DASHBOARD SPRINT', 'VERSION CONTROLLED'];
    const preview = a.preview ?? { title: sprint.title };
    const build = pairs(a.build_strip);
    const comparison = a.comparison;
    const control = a.control_trust ?? [];
    const activeLabel = tabs.find((t) => t.key === tab)?.label ?? 'Overview';

    const whyCard = comparison && (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-[0.8125rem] font-bold tracking-wide text-ink-900 uppercase">
                Why this, not a free AI answer? <Info className="size-4 text-gold-600" aria-hidden="true" />
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-[0.6875rem]">
                    <thead>
                        <tr>
                            {(comparison.columns ?? ['Factor', 'This Dashboard Sprint', 'Free / DIY / AI Route']).map((c, i) => (
                                <th key={c} className={cn('px-2 py-1.5 font-semibold', i === 1 ? 'bg-gold-500 text-ink-900' : 'bg-ink-900 text-parchment-100')}>{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(comparison.rows ?? []).map((r) => (
                            <tr key={r[0]} className="border-b border-parchment-300">
                                <td className="px-2 py-1 font-medium text-ink-800">{r[0]}</td>
                                <td className="px-2 py-1 text-ink-700">{r[1]}</td>
                                <td className="px-2 py-1 text-ink-500">{r[2]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {comparison.footer && (
                <p className="mt-3 flex items-center gap-2 rounded-[6px] bg-gold-50 px-3 py-2 text-xs font-semibold text-gold-800">
                    <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                    {comparison.footer}
                </p>
            )}
        </section>
    );
    const receiveCard = (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 text-[0.8125rem] font-bold tracking-wide text-ink-900 uppercase">What You Receive (Standard)</h2>
            <ul className="space-y-1.5 text-xs text-ink-700">
                {list(a.what_you_receive).map((w) => (
                    <li key={w} className="flex gap-2"><SquareCheck className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{w}</li>
                ))}
            </ul>
        </section>
    );
    const controlCard = (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 text-[0.8125rem] font-bold tracking-wide text-ink-900 uppercase">Dashboard Control &amp; Trust</h2>
            <ul className="space-y-2 text-xs">
                {control.map((c, i) => (
                    <li key={`${c.title}-${i}`} className="flex gap-2.5">
                        <ShieldCheck className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                        <span><span className="block font-semibold text-ink-900">{c.title || 'Currentness Control'}</span>{c.text && <span className="text-ink-500">{c.text}</span>}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
    const inputsCard = (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 text-[0.8125rem] font-bold tracking-wide text-ink-900 uppercase">Inputs Required</h2>
            <ul className="space-y-1.5 text-xs text-ink-700">
                {list(a.inputs_required).map((w) => (
                    <li key={w} className="flex gap-2"><ChevronRight className="size-3.5 shrink-0 text-gold-600" aria-hidden="true" />{w}</li>
                ))}
            </ul>
        </section>
    );

    const custom = a.tab_content?.[activeLabel];
    const tabBody = () => {
        if (custom) {
            return (
                <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                    <h2 className="text-sm font-bold text-ink-900">{activeLabel}</h2>
                    {custom.intro && <p className="mt-2 text-[0.8125rem] text-ink-600">{custom.intro}</p>}
                    <ul className="mt-3 grid gap-1.5 text-xs text-ink-700 sm:grid-cols-2">
                        {(custom.items ?? []).map((w) => <li key={w} className="flex gap-2"><SquareCheck className="size-4 shrink-0 text-gold-600" />{w}</li>)}
                    </ul>
                </section>
            );
        }
        switch (tab) {
            case 'overview':
                return (
                    <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr_1fr]">
                        {whyCard}
                        {receiveCard}
                        <div className="space-y-4">{controlCard}{inputsCard}</div>
                    </div>
                );
            case 'what-you-receive':
                return <div className="grid gap-4 md:grid-cols-2">{receiveCard}{controlCard}</div>;
            case 'inputs-required':
                return <div className="grid gap-4 md:grid-cols-2">{inputsCard}<InfoCard title="How inputs are used" text="Inputs are collected through the secure Client Portal intake, validated against the KPI dictionary and only used to build and refresh your dashboard." /></div>;
            case 'data-kpi-logic':
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-3 text-sm font-bold text-ink-900">KPI definitions (sample)</h2>
                            <ul className="divide-y divide-parchment-300 text-xs">
                                {(preview.kpis ?? []).map((k) => (
                                    <li key={k[0]} className="flex justify-between gap-3 py-1.5"><span className="font-medium text-ink-800">{k[0]}</span><span className="text-ink-500">Illustrative: {k[1]}</span></li>
                                ))}
                            </ul>
                        </section>
                        {whyCard}
                    </div>
                );
            case 'refresh-maintenance':
                return <InfoCard title="Refresh & Maintenance" text={`Refresh cadence and the next review date are version controlled. ${build.map(([k, v]) => `${k}: ${v}`).join(' · ')}.`} />;
            case 'support':
                return <div className="grid gap-4 md:grid-cols-2">{controlCard}<InfoCard title="Support" text="Handover includes a user guide and metric definitions. Corrections are logged through the defined support channel in your Client Portal." /></div>;
            case 'related-sprint':
                return related.length ? <RelatedSprints related={related} title="Related Sprints" /> : <InfoCard title="Related Sprint" text="Related sprints are recommended after your dashboard is delivered." />;
            case 'disclosure':
                return <InfoCard title="Disclosure" text="Sample data shown is illustrative. Prices exclude VAT unless stated. Outputs are decision-support tools and do not constitute audited financial statements or regulated professional advice." />;
            default:
                return (
                    <div className="grid gap-4 md:grid-cols-2">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-2 text-sm font-bold text-ink-900">{activeLabel}</h2>
                            <ZoomPreview title={preview.title ?? sprint.title}>
                                <DataVisual spec={preview} compact />
                            </ZoomPreview>
                        </section>
                        {receiveCard}
                    </div>
                );
        }
    };

    return (
        <div className="bg-parchment-100">
            <div className="bg-ink-950">
                <div className="container-tbca py-2.5">
                    <Crumbs tone="dark" home items={[{ label: 'Digital Products', href: '/digital-products' }, { label: 'Dashboard Sprints', href: '/sprints' }, { label: sprint.title }]} />
                </div>
            </div>
            <div className="container-tbca py-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="min-w-0 space-y-5">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                            <ZoomPreview title={preview.title ?? sprint.title} large={<DataVisual spec={preview} />}>
                                <DataVisual spec={{ ...preview, footer: preview.footer }} compact className="min-h-[18rem]" />
                            </ZoomPreview>
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    {badges.map((b, i) => (
                                        <span key={b} className={cn('rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase', i === 0 ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-verified-500/50 bg-verified-50 text-verified-700')}>{b}</span>
                                    ))}
                                </div>
                                <h1 className="mt-3 font-serif text-3xl leading-tight font-bold text-ink-900">{sprint.title}</h1>
                                {a.subtitle && <p className="mt-2 text-base text-gold-700">{a.subtitle}</p>}
                                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink-800">
                                    {list(a.highlights).map((h, i) => {
                                        const Icon = highlightIcons[i % highlightIcons.length];
                                        return <li key={h} className="flex items-center gap-1.5"><Icon className="size-4 text-gold-600" aria-hidden="true" />{h}</li>;
                                    })}
                                </ul>
                                <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-700">{sprint.summary}</p>
                                {a.audience_text && <p className="mt-3 text-[0.8125rem] text-ink-700"><strong className="text-ink-900">Primary Audience:</strong> {a.audience_text}</p>}
                                {a.best_for && <p className="mt-1.5 text-[0.8125rem] text-ink-700"><strong className="text-ink-900">Best For:</strong> {a.best_for}</p>}
                            </div>
                        </div>

                        {build.length > 0 && (
                            <section className="overflow-hidden rounded-[8px] border border-parchment-400 bg-white">
                                <h2 className="inline-block rounded-br-[6px] bg-ink-950 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-400 uppercase">Current Dashboard Build</h2>
                                <dl className="grid grid-cols-2 divide-parchment-300 sm:grid-cols-5 sm:divide-x">
                                    {build.map(([k, v]) => (
                                        <div key={k} className="px-4 py-2.5">
                                            <dt className="text-[0.6875rem] text-ink-500">{k}</dt>
                                            <dd className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
                                                {k === 'Currentness' && <span className="size-2 rounded-full bg-verified-500" aria-hidden="true" />}
                                                {v}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}

                        <Tabs tabs={tabs} value={tab} onChange={setTab} />
                        {tabBody()}
                    </div>

                    <aside>
                        <div className="overflow-hidden rounded-[8px] border border-parchment-400 bg-white shadow-card lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            <div className="bg-ink-950 px-4 py-3 text-center">
                                <p className="text-sm font-bold tracking-wide text-parchment-50 uppercase">Start Dashboard Sprint</p>
                                <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[0.6875rem] text-parchment-200"><ShieldCheck className="size-3.5 text-gold-400" />100% Secure Transaction</p>
                            </div>
                            <div className="p-4">
                                <p className="text-center text-2xl font-bold text-ink-900">From {zarComma(sprint.price_zar ?? current?.zar ?? 0)}</p>
                                <p className="text-center text-xs text-ink-600">
                                    or{' '}
                                    <Link href={quoteHref(sprint, selected)} className="font-semibold text-gold-700 hover:underline">Request a Quote</Link>
                                </p>
                                <fieldset className="mt-3 space-y-1.5">
                                    <legend className="sr-only">Choose a package</legend>
                                    {packages.map((p) => (
                                        <label key={p.key} className={cn('flex cursor-pointer items-center gap-2.5 rounded-[6px] border px-3 py-2 text-[0.8125rem]', selected === p.key ? 'border-gold-500 bg-parchment-200' : 'border-parchment-400 hover:border-gold-300')}>
                                            <input type="radio" name="package" value={p.key} checked={selected === p.key} onChange={() => setSelected(p.key)} className="accent-gold-600" />
                                            <span className="font-medium text-ink-900">{p.name}</span>
                                            {p.popular && <span className="rounded-full bg-verified-50 px-1.5 text-[0.5625rem] font-bold text-verified-700 uppercase">Most Popular</span>}
                                            <span className="ml-auto font-semibold text-ink-900">{zarComma(p.zar)}</span>
                                        </label>
                                    ))}
                                </fieldset>
                                <dl className="mt-3 space-y-1.5 text-xs">
                                    {pairs(a.facts).map(([k, v], i) => {
                                        const Icon = factIcons[i % factIcons.length];
                                        return (
                                            <div key={k} className="grid grid-cols-[1rem_1fr_1.2fr] items-center gap-2">
                                                <Icon className="size-3.5 text-gold-600" aria-hidden="true" />
                                                <dt className="text-ink-600">{k}</dt>
                                                <dd className="text-ink-900">{v}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                                <GoldLink href={orderHref(sprint, selected)} className="mt-4">Select Package &amp; Start Sprint</GoldLink>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <SaveButton sprint={sprint} />
                                    <AskButton sprint={sprint} />
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
                <RelatedSprints related={related} className="mt-10" />
            </div>
        </div>
    );
}

function InfoCard({ title, text }: { title: string; text: string }) {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-900"><FileText className="size-4 text-gold-600" />{title}</h2>
            <p className="text-[0.8125rem] leading-relaxed text-ink-600">{text}</p>
        </section>
    );
}
