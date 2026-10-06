import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CalendarClock,
    CircleCheck,
    CircleX,
    Download,
    Eye,
    FileText,
    Info,
    MessageSquare,
    PenLine,
    RefreshCw,
    Rocket,
    Route,
    ShieldCheck,
    Sparkles,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Modal, Tabs } from '@/Components/ui/Kit';
import { askAbout, attrsOf, Crumbs, list, orderHref, pairs, RelatedSprints, SaveButton } from '@/Components/SprintTypes/B/common';
import { DocPage, TemplateCover } from '@/Components/SprintTypes/B/TemplateCover';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { TemplateAttributes } from '@/types/sprint-types-b';
import { urlTabIndex, useUrlTab } from '@/Components/Sprints/lib';

const stripIcons: LucideIcon[] = [Zap, PenLine, FileText, ShieldCheck, RefreshCw, Sparkles, Users];
const deliveryIcons: LucideIcon[] = [Rocket, Route, FileText, RefreshCw, CalendarClock];
const miniIcons: LucideIcon[] = [FileText, Users, PenLine, Sparkles];

const tabKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function Card({ title, children, className, icon }: { title: ReactNode; children: ReactNode; className?: string; icon?: ReactNode }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-4', className)}>
            <h2 className="mb-3 flex items-center gap-2 text-[0.9375rem] font-bold text-ink-900">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    );
}

type LicenceSupport = { title?: string; columns?: string[]; table?: string[][]; rows?: string[][]; extras?: [string, string][] } | null;

export default function TemplateSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<TemplateAttributes>(sprint);
    const v = a.layout_variant ?? 'C';
    const packages = sprint.packages ?? [];
    const [selected, setSelected] = useState(packages.find((p) => p.popular)?.key ?? packages[0]?.key ?? null);
    const current = packages.find((p) => p.key === selected) ?? packages[0];
    const tabs = (list(a.tabs).length ? list(a.tabs) : ['Overview', "What's Included", 'Preview', 'How It Works', 'Inputs', 'Licence & Support', 'FAQs']).map((t) => ({ key: tabKey(t), label: t }));
    const urlTab = useUrlTab();
    const [tab, setTab] = useState(() => tabs[urlTabIndex(tabs.map((t) => t.label), urlTab)].key);
    const [preview, setPreview] = useState(false);
    const cover = a.cover ?? { lines: sprint.title.toUpperCase().split(' ').slice(0, 3), icon: '', format_tag: null };
    const format = (a.format_badge ?? '').split(' ')[0] || (a.sticky_bar?.file_format ?? 'DOCX');
    const show = (k: string) => tab === 'overview' || tab === k;
    const useLabel = v === 'D' && current ? `Use Template (${current.name})` : 'Use Template';
    const ls = a.licence_support as LicenceSupport;
    const pages = list(a.preview?.pages);
    const faqs = a.faqs?.length
        ? a.faqs
        : [
              { q: 'How do I receive the template?', a: 'Access is instant after checkout. The file is available in your Client Portal under Digital Products.' },
              { q: 'Can I edit the template?', a: `Yes. The ${format} file is fully editable and you can adapt it to your organisation.` },
              { q: 'What do the licence classes mean?', a: 'L1 is personal use, L2 single-entity use and L3 group use. L4 is available by declared-use selector subject to IP clearance.' },
              { q: 'Are updates included?', a: 'Updates follow the update class shown for your package and are published as new controlled versions.' },
          ];

    const packagePanel = (
        <div className="rounded-[10px] border border-ink-700 bg-ink-900 p-4 text-parchment-100 shadow-raised">
            <h2 className="text-center text-base font-semibold">{a.package_panel_title ?? 'Choose Your Template Package'}</h2>
            <fieldset className={cn('mt-4', v === 'D' ? 'space-y-2' : 'grid grid-cols-1 gap-2 sm:grid-cols-3')}>
                <legend className="sr-only">Template package</legend>
                {packages.map((p) => {
                    const pp = p as typeof p & { tagline?: string; licence?: string; support?: string; ribbon?: string };
                    const active = p.key === selected;
                    const price = pp.zar < 1000 ? `ZAR ${pp.zar}` : `R${pp.zar.toLocaleString('en-US')}`;
                    return (
                        <label
                            key={p.key}
                            className={cn(
                                'relative flex cursor-pointer rounded-[8px] border p-3 transition-colors',
                                v === 'D' ? 'items-start gap-3' : 'flex-col pt-4',
                                active ? 'border-gold-500 bg-ink-950' : 'border-ink-700 hover:border-ink-500',
                            )}
                        >
                            {pp.ribbon && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-2 text-[0.5625rem] font-bold whitespace-nowrap text-ink-900 uppercase">{pp.ribbon}</span>
                            )}
                            <input type="radio" name="tpl-package" value={p.key} checked={active} onChange={() => setSelected(p.key)} className={cn('accent-gold-500', v === 'D' ? 'mt-1' : 'sr-only')} />
                            <span className={cn('min-w-0', v === 'D' && 'flex-1')}>
                                <span className={cn('block text-sm font-semibold', p.popular && 'text-gold-400')}>{p.name}</span>
                                {v !== 'D' && <span className={cn('block text-lg font-bold', p.popular ? 'text-gold-400' : 'text-white')}>{price}</span>}
                                {pp.tagline && <span className="mt-1 block text-[0.6875rem] text-parchment-200">{pp.tagline}</span>}
                                {!!p.features?.length && (
                                    <ul className="mt-2 space-y-1 text-[0.6875rem] text-parchment-200">
                                        {p.features.map((f) => (
                                            <li key={f} className="flex gap-1.5"><CircleCheck className="mt-0.5 size-3 shrink-0 text-gold-400" />{f}</li>
                                        ))}
                                    </ul>
                                )}
                                {v !== 'D' && (pp.licence || pp.support) && (
                                    <span className="mt-2 block border-t border-ink-700 pt-1.5 text-[0.625rem] text-ink-300">Licence: {pp.licence} · Support: {pp.support}</span>
                                )}
                            </span>
                            {v === 'D' && (
                                <span className="text-right">
                                    <span className={cn('block text-sm font-bold', p.popular ? 'text-gold-400' : 'text-white')}>{price}</span>
                                    <span className="text-[0.625rem] text-ink-300">{pp.licence} | {pp.support}</span>
                                </span>
                            )}
                        </label>
                    );
                })}
            </fieldset>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href={orderHref(sprint, selected)} className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                    <Download className="size-4" aria-hidden="true" /> {useLabel}
                </Link>
                <button type="button" onClick={() => setPreview(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] border border-gold-600 text-sm font-medium hover:bg-ink-950">
                    <Eye className="size-4" aria-hidden="true" /> Preview Template
                </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
                <button type="button" onClick={() => askAbout(sprint)} className="inline-flex items-center gap-1.5 text-xs text-gold-300 hover:underline">
                    <MessageSquare className="size-3.5" aria-hidden="true" /> Ask a Question
                </button>
                <SaveButton sprint={sprint} tone="dark" label="Save" className="h-8" />
            </div>
            {a.package_panel_note && <p className="mt-2 text-center text-[0.6875rem] text-ink-300">{a.package_panel_note}</p>}
        </div>
    );

    const overviewCard = (
        <Card title="Overview" icon={<Info className="size-5 text-verified-500" />}>
            {v === 'D' ? (
                <ul className="space-y-1.5 text-xs text-ink-700">
                    {list(a.overview?.paragraphs).map((p) => <li key={p} className="flex gap-2"><CircleCheck className="size-3.5 shrink-0 text-gold-600" />{p}</li>)}
                </ul>
            ) : (
                <div className="space-y-2 text-[0.8125rem] leading-relaxed text-ink-600">{list(a.overview?.paragraphs).map((p) => <p key={p}>{p}</p>)}</div>
            )}
            {!!a.overview?.bullets?.length && (
                <ul className="mt-2 space-y-1 text-xs text-ink-700">{a.overview.bullets.map((b) => <li key={b} className="flex gap-2"><CircleCheck className="size-3.5 shrink-0 text-verified-500" />{b}</li>)}</ul>
            )}
            {!!a.overview?.mini_features?.length && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {a.overview.mini_features.map((m, i) => {
                        const Icon = miniIcons[i % miniIcons.length];
                        return (
                            <div key={m.title} className="text-xs">
                                <Icon className="size-5 text-verified-500" aria-hidden="true" />
                                <p className="mt-1 font-bold text-ink-900">{m.title}</p>
                                <p className="text-ink-600">{m.text}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );

    const keyValue = (
        <Card title={a.key_value_title ?? 'Key Value'}>
            <ul className="space-y-2 text-xs text-ink-700">
                {(a.key_value ?? []).map((k) => (
                    <li key={k.title} className="flex gap-2">
                        <CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />
                        <span><span className={cn(k.text && 'font-semibold text-ink-900')}>{k.title}</span>{k.text && <span className="block text-ink-500">{k.text}</span>}</span>
                    </li>
                ))}
            </ul>
            {list(a.key_value_footer).length > 0 && (
                <div className="mt-3 rounded-[6px] bg-gold-50 p-2 text-xs text-ink-800">{list(a.key_value_footer).map((f) => <p key={f}>{f}</p>)}</div>
            )}
        </Card>
    );

    const whatYouGet = list(a.what_you_get).length > 0 && (
        <Card title="What You Get">
            <ul className="space-y-1.5 text-xs text-ink-700">{list(a.what_you_get).map((w) => <li key={w} className="flex gap-2"><FileText className="size-3.5 shrink-0 text-gold-600" />{w}</li>)}</ul>
        </Card>
    );

    const inputs = (
        <Card title={a.inputs_title ?? 'What We Need From You'}>
            <ul className={cn('space-y-1.5 text-xs text-ink-700', v === 'A' && 'grid grid-cols-2 gap-x-3 space-y-0 gap-y-1.5')}>
                {list(a.inputs).map((i) => <li key={i} className="flex gap-2"><CircleCheck className="size-3.5 shrink-0 text-verified-500" />{i}</li>)}
            </ul>
            {a.inputs_note && <p className="mt-2 text-[0.6875rem] text-ink-500">{a.inputs_note}</p>}
        </Card>
    );

    const how = (
        <Card title={a.how_it_works_title ?? 'How It Works'}>
            <ol className="grid grid-cols-5 gap-2">
                {pairs(a.how_it_works).map(([t, d], i) => (
                    <li key={t} className="relative flex flex-col items-center text-center">
                        {i > 0 && <span aria-hidden="true" className="absolute top-3.5 right-1/2 h-px w-full border-t border-dashed border-ink-300" />}
                        <span className={cn('relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-bold text-white', v === 'C' ? 'bg-verified-500' : 'bg-gold-500')}>{i + 1}</span>
                        <span className="mt-1.5 text-[0.6875rem] leading-tight font-bold text-ink-900">{t}</span>
                        <span className="mt-1 hidden text-[0.625rem] leading-snug text-ink-500 sm:block">{d}</span>
                    </li>
                ))}
            </ol>
            {list(a.how_it_works_footer).length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">{list(a.how_it_works_footer).map((f) => <li key={f} className="rounded-full bg-gold-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-gold-800">{f}</li>)}</ul>
            )}
        </Card>
    );

    const matrix = a.included_matrix;
    const included = (matrix || a.whats_included) && (
        <Card title={matrix?.title ?? "What's Included"}>
            {matrix ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[22rem] text-left text-xs">
                        <thead>
                            <tr className="border-b border-parchment-400">
                                {matrix.columns.map((c, i) => (
                                    <th key={i} className={cn('px-2 py-1.5 font-semibold text-ink-800', i > 0 && 'text-center', /recommend/i.test(c) && 'bg-gold-50')}>
                                        {c.replace(/\s*\((recommended)\)/i, '')}
                                        {/recommend/i.test(c) && <span className="ml-1 rounded-full bg-verified-50 px-1.5 text-[0.5625rem] font-bold text-verified-700 uppercase">Recommended</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-parchment-300">
                            {matrix.rows.map((r) => (
                                <tr key={String(r[0])}>
                                    {r.map((cell, i) =>
                                        i === 0 ? (
                                            <td key={i} className="px-2 py-1.5 text-ink-700">{String(cell)}</td>
                                        ) : (
                                            <td key={i} className={cn('px-2 py-1.5 text-center', /recommend/i.test(matrix.columns[i] ?? '') && 'bg-gold-50/60')}>
                                                {cell === true ? <CircleCheck className="mx-auto size-4 text-verified-500" aria-label="Included" /> : cell === false ? <CircleX className="mx-auto size-4 text-ink-300" aria-label="Not included" /> : String(cell)}
                                            </td>
                                        ),
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {matrix.legend && <p className="mt-2 text-[0.6875rem] text-ink-500">{matrix.legend}</p>}
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-3">
                    {((a.whats_included ?? []) as unknown as { heading: string; items: string[]; recommended?: boolean }[]).map((b) => (
                        <div key={b.heading} className={cn('rounded-[6px] border p-3', b.recommended ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                            <p className="mb-2 text-xs font-bold text-ink-900">{b.heading}</p>
                            <ul className="grid gap-1 text-[0.6875rem] text-ink-700 sm:grid-cols-2 md:grid-cols-1">{b.items.map((i) => <li key={i} className="flex gap-1.5"><CircleCheck className="size-3 shrink-0 text-gold-600" />{i}</li>)}</ul>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );

    const previewCard = a.preview && (
        <Card title={a.preview.title ?? 'Template Preview'}>
            <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="rounded-[8px] border-4 border-ink-800 bg-ink-800 p-1">
                    <DocPage label={pages[0] ?? sprint.title} tall={false} className="aspect-[16/10]" />
                </div>
                <div className="flex w-12 flex-col gap-1">
                    {(pages.length > 1 ? pages.slice(1, 5) : ['Page 2', 'Page 3', 'Page 4']).map((p) => <DocPage key={p} label={p} />)}
                </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="flex flex-wrap items-center gap-2 text-ink-600">
                    {a.preview.caption ?? `Format: ${format}`}
                    {a.preview.caption_badge && <span className="rounded-full bg-verified-50 px-2 py-0.5 font-semibold text-verified-700">{a.preview.caption_badge}</span>}
                    {list(a.preview.chips).map((c) => <span key={c} className="rounded-full bg-parchment-300 px-2 py-0.5 text-ink-700">{c}</span>)}
                </span>
                <button type="button" onClick={() => setPreview(true)} className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-parchment-500 px-2.5 font-medium hover:border-gold-500">
                    <Eye className="size-3.5" /> Preview Template
                </button>
            </div>
        </Card>
    );

    const why = a.why_not_ai && (
        <Card title={a.why_not_ai.title ?? 'Why This, Not a Free AI Answer?'}>
            <div className="relative grid gap-3 sm:grid-cols-2">
                <div className="overflow-hidden rounded-[6px] border border-parchment-400">
                    <p className="bg-parchment-300 px-3 py-1.5 text-[0.6875rem] font-bold text-ink-700 uppercase">{a.why_not_ai.free_heading}</p>
                    <ul className="space-y-1.5 p-3 text-xs text-ink-600">{a.why_not_ai.free_points.map((p) => <li key={p} className="flex gap-1.5"><CircleX className="size-3.5 shrink-0 text-risk-500" />{p}</li>)}</ul>
                </div>
                <div className="overflow-hidden rounded-[6px] border border-verified-500/30">
                    <p className={cn('px-3 py-1.5 text-[0.6875rem] font-bold uppercase', v === 'C' ? 'bg-verified-500 text-white' : 'bg-ink-900 text-gold-400')}>{a.why_not_ai.tbca_heading}</p>
                    <ul className="space-y-1.5 p-3 text-xs text-ink-700">{a.why_not_ai.tbca_points.map((p) => <li key={p} className="flex gap-1.5"><CircleCheck className="size-3.5 shrink-0 text-verified-500" />{p}</li>)}</ul>
                </div>
                {a.why_not_ai.vs_badge && (
                    <span className="absolute top-1/2 left-1/2 hidden size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] font-bold text-white sm:flex">VS</span>
                )}
            </div>
            {a.why_not_ai.footer && <p className="mt-2 text-[0.6875rem] text-ink-500">{a.why_not_ai.footer}</p>}
        </Card>
    );

    const delivery = (() => {
        if (typeof a.delivery_strip === 'string') {
            return <p className="rounded-[8px] bg-ink-900 px-4 py-3 text-xs text-parchment-100">{a.delivery_strip}</p>;
        }
        if (Array.isArray(a.delivery_strip) && a.delivery_strip.length) {
            return (
                <section className="grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-5">
                    {a.delivery_strip.map((d, i) => {
                        const Icon = deliveryIcons[i % deliveryIcons.length];
                        return (
                            <div key={d[0]} className="text-xs">
                                <Icon className="size-5 text-gold-600" aria-hidden="true" />
                                <p className="mt-1 text-ink-500">{d[0]}</p>
                                <p className="font-bold text-ink-900">{d[1]}</p>
                                {d[2] && <p className="text-[0.6875rem] text-ink-500">{d[2]}</p>}
                            </div>
                        );
                    })}
                </section>
            );
        }
        const du = Array.isArray(a.delivery_updates) ? (a.delivery_updates as [string, string][]) : a.delivery_updates ? Object.entries(a.delivery_updates) : [];
        return du.length ? (
            <Card title={a.delivery_updates_title ?? 'Delivery & Updates'}>
                <dl className="divide-y divide-parchment-300 text-xs">{du.map(([k, val]) => <div key={k} className="flex justify-between gap-3 py-1.5"><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{val}</dd></div>)}</dl>
            </Card>
        ) : null;
    })();

    const licence = ls && (
        <Card title={ls.title ?? 'Licence & Support (By Package)'}>
            {ls.table ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        {ls.columns && (
                            <thead><tr className="border-b border-parchment-400">{ls.columns.map((c, i) => <th key={i} className="px-2 py-1.5 font-semibold">{i === 0 && c === 'Licence Class' ? '' : c}</th>)}</tr></thead>
                        )}
                        <tbody className="divide-y divide-parchment-300">{ls.table.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={cn('px-2 py-1.5', i === 0 ? 'font-semibold text-ink-900' : 'text-ink-700')}>{c}</td>)}</tr>)}</tbody>
                    </table>
                </div>
            ) : (
                <ul className="grid gap-2 text-xs sm:grid-cols-3">{(ls.rows ?? []).map((r) => <li key={r[0]} className="rounded-[6px] border border-parchment-400 p-2"><p className="font-bold text-ink-900">{r[0]}</p>{r.slice(1).map((x) => <p key={x} className="text-ink-600">{x}</p>)}</li>)}</ul>
            )}
            {!!ls.extras?.length && <p className="mt-2 flex flex-wrap gap-3 text-xs text-ink-600">{ls.extras.map(([k, val]) => <span key={k}><strong className="text-ink-900">{k}:</strong> {val}</span>)}</p>}
        </Card>
    );

    const faqCard = (
        <Card title="Frequently Asked Questions">
            <div className="divide-y divide-parchment-300">
                {faqs.map((f) => (
                    <details key={f.q} className="py-2">
                        <summary className="cursor-pointer text-[0.8125rem] font-semibold text-ink-900">{f.q}</summary>
                        <p className="mt-1 text-xs text-ink-600">{f.a}</p>
                    </details>
                ))}
            </div>
        </Card>
    );

    const bar = a.sticky_bar;

    return (
        <div className="bg-parchment-100">
            <section className="bg-ink-950 text-parchment-100 motif-glow">
                <div className="container-tbca pt-4 pb-8">
                    <Crumbs tone="dark" items={[{ label: 'Home', href: '/' }, { label: 'Templates', href: '/templates' }, ...(a.category ? [{ label: a.category }] : []), { label: sprint.title }]} />
                    <div className="mt-5 grid items-start gap-6 lg:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,0.95fr)]">
                        <TemplateCover lines={cover.lines} formatTag={cover.format_tag} className="hidden sm:block" />
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                {a.format_badge && <span className="rounded-full bg-verified-500 px-2 py-0.5 text-[0.6875rem] font-bold text-white">{format}</span>}
                                {a.category_pill && <span className="rounded-full border border-gold-500 px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-gold-400 uppercase">{a.category_pill}</span>}
                            </div>
                            <h1 className="mt-2 text-3xl leading-tight font-bold text-white sm:text-4xl">{sprint.title}</h1>
                            {a.hero_tagline && <p className={cn('mt-2 text-gold-400', v === 'C' ? 'text-base font-semibold' : 'text-sm')}>{a.hero_tagline}</p>}
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-parchment-200">{sprint.summary}</p>
                            {a.hero_problem &&
                                (v === 'D' ? (
                                    <p className="mt-3 flex gap-2 rounded-[6px] border border-gold-700 p-2.5 text-xs text-parchment-200"><AlertCircle className="size-4 shrink-0 text-gold-400" />{a.hero_problem}</p>
                                ) : (
                                    <p className={cn('mt-3 text-sm', v === 'A' ? 'text-gold-300' : 'text-parchment-200')}>{a.hero_problem}</p>
                                ))}
                            {list(a.perfect_for).length > 0 && (
                                <ul className="mt-3 flex flex-wrap items-center gap-2 text-[0.6875rem]">
                                    {a.perfect_for_label && <li className="font-semibold text-parchment-100">{a.perfect_for_label}</li>}
                                    {list(a.perfect_for).map((p) => <li key={p} className="flex items-center gap-1 rounded-full border border-ink-600 bg-ink-900 px-2.5 py-1"><Users className="size-3 text-gold-400" />{p}</li>)}
                                </ul>
                            )}
                            {pairs(a.feature_strip).length > 0 && (
                                <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-5">
                                    {pairs(a.feature_strip).map(([t, s], i) => {
                                        const Icon = stripIcons[i % stripIcons.length];
                                        return (
                                            <li key={t} className="flex items-center gap-2 rounded-[6px] border border-gold-800 bg-ink-900 p-2">
                                                <Icon className="size-4 shrink-0 text-gold-400" aria-hidden="true" />
                                                <span className="text-[0.6875rem] leading-tight"><span className="block font-semibold text-white">{t}</span><span className="text-ink-300">{s}</span></span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            {a.category_line && <p className="mt-2 text-xs text-ink-300">{a.category_line}</p>}
                        </div>
                        <div className="lg:col-span-2 xl:col-span-1">{packagePanel}</div>
                    </div>
                </div>
            </section>

            <div className="container-tbca pb-6">
                <div className="-mt-px rounded-b-[10px] bg-white px-2 sm:rounded-tl-none">
                    <Tabs tabs={tabs} value={tab} onChange={setTab} />
                </div>
                <div className="mt-4 space-y-4">
                    {tab === 'overview' && (
                        <div className={cn('grid gap-4', whatYouGet ? 'lg:grid-cols-4' : 'lg:grid-cols-[1.4fr_1fr_0.9fr_1.4fr]')}>
                            {overviewCard}
                            {keyValue}
                            {whatYouGet}
                            {inputs}
                            {!whatYouGet && how}
                        </div>
                    )}
                    {tab === 'inputs' && <div className="grid gap-4 md:grid-cols-2">{inputs}{keyValue}</div>}
                    {tab === 'how-it-works' && how}
                    {(tab === 'overview' || tab === 'whats-included' || tab === 'preview') && (
                        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1.4fr]">
                            {show('whats-included') && included}
                            {show('preview') && previewCard}
                            {tab === 'overview' && (whatYouGet ? how : why)}
                        </div>
                    )}
                    {tab === 'overview' && whatYouGet && why}
                    {show('licence-support') && (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {delivery}
                            {licence}
                        </div>
                    )}
                    {tab === 'faqs' && faqCard}
                </div>

                {bar && (
                    <div className="sticky bottom-3 z-30 mt-6 flex flex-wrap items-center gap-4 rounded-[10px] border border-ink-700 bg-ink-950 p-3 text-parchment-100 shadow-raised">
                        <TemplateCover small lines={cover.lines} />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{bar.title ?? sprint.title}</p>
                            {bar.subtitle && <p className="truncate text-[0.6875rem] text-ink-300">{bar.subtitle}</p>}
                        </div>
                        <dl className="hidden gap-5 text-[0.6875rem] md:flex">
                            <div><dt className="text-ink-300">Selected Package</dt><dd className="font-semibold">{current?.name}</dd></div>
                            <div><dt className="text-ink-300">Price</dt><dd className="font-semibold text-gold-400">{current ? (current.zar < 1000 ? `ZAR ${current.zar}` : `R${current.zar.toLocaleString('en-US')}`) : ''}</dd></div>
                            <div><dt className="text-ink-300">Format</dt><dd className="font-semibold">{bar.file_format ?? format}</dd></div>
                            {bar.access && <div><dt className="text-ink-300">Access</dt><dd className="font-semibold">{bar.access}</dd></div>}
                        </dl>
                        <div className="flex gap-2">
                            <Link href={orderHref(sprint, selected)} className="inline-flex h-9 items-center gap-1.5 rounded-[5px] bg-gold-500 px-3 text-xs font-semibold text-ink-900 hover:bg-gold-400">
                                {useLabel} <ArrowRight className="size-3.5" />
                            </Link>
                            <button type="button" onClick={() => setPreview(true)} className="inline-flex h-9 items-center gap-1.5 rounded-[5px] border border-gold-600 px-3 text-xs">
                                <Eye className="size-3.5" /> Preview
                            </button>
                        </div>
                    </div>
                )}

                <RelatedSprints related={related} title="Related Templates & Sprints" className="mt-10" />
            </div>

            <Modal open={preview} onClose={() => setPreview(false)} title={a.preview?.title ?? `${sprint.title} — preview`} size="xl">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(pages.length ? pages : [sprint.title, 'Section 1', 'Section 2', 'Checklist']).map((p) => (
                        <figure key={p}>
                            <DocPage label={p} tall />
                            <figcaption className="mt-1 text-[0.6875rem] text-ink-600">{p.replace(/^[a-z]+:\s*/i, '').split('(')[0]}</figcaption>
                        </figure>
                    ))}
                </div>
                <p className="mt-3 text-xs text-ink-500">Sample pages are illustrative. The full editable {format} file unlocks after checkout.</p>
            </Modal>
        </div>
    );
}
