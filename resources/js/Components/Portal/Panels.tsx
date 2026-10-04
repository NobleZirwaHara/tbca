import { Link } from '@inertiajs/react';
import { ArrowRight, Check, ChevronRight, Info, TriangleAlert, X } from 'lucide-react';
import { Panel as Box, Progress, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { Kpi, LinkRef, Panel, Tone } from '@/types/portal';
import { ActionButton } from './ActionButton';
import { Donut, Gauge, Legend, SeriesChart, toneHex } from './Charts';
import { DynamicFormPanel } from './DynamicFormPanel';
import { portalIcon } from './icons';
import { CellView, DataTable } from './Table';

const toneText: Record<string, string> = {
    neutral: 'text-ink-500',
    good: 'text-verified-600',
    warn: 'text-attested-600',
    bad: 'text-risk-600',
    info: 'text-controlled-600',
    gold: 'text-gold-700',
    dark: 'text-ink-900',
};

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
    const cols = kpis.length >= 6 ? 'lg:grid-cols-6' : kpis.length === 5 ? 'lg:grid-cols-5' : kpis.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
    return (
        <div className={cn('mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3', cols)}>
            {kpis.map((k) => {
                const Icon = portalIcon(k.icon);
                const body = (
                    <div className="flex h-full gap-3 rounded-[8px] border border-parchment-400 bg-white p-3.5 transition-colors hover:border-gold-400">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-gold-50 text-gold-700">
                            <Icon className="size-4.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[0.6875rem] font-semibold text-ink-500">{k.label}</p>
                            <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-ink-900">{k.value}</p>
                            {k.caption && <p className={cn('mt-0.5 text-[0.6875rem]', toneText[k.tone ?? 'neutral'])}>{k.caption}</p>}
                        </div>
                    </div>
                );
                return k.href ? (
                    <Link key={k.label} href={k.href} className="block">
                        {body}
                    </Link>
                ) : (
                    <div key={k.label}>{body}</div>
                );
            })}
        </div>
    );
}

function MoreLink({ link }: { link?: LinkRef | null }) {
    if (!link) return null;
    return (
        <Link href={link.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-controlled-700 hover:underline">
            {link.label} <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
    );
}

const infoTone: Record<string, string> = {
    info: 'border-controlled-500/30 bg-controlled-50 text-controlled-800',
    good: 'border-verified-500/30 bg-verified-50 text-verified-800',
    warn: 'border-attested-500/30 bg-attested-50 text-attested-800',
    bad: 'border-risk-500/30 bg-risk-50 text-risk-800',
    gold: 'border-gold-400/50 bg-gold-50 text-ink-800',
    neutral: 'border-parchment-400 bg-parchment-100 text-ink-700',
    dark: 'border-ink-700 bg-ink-900 text-parchment-100',
};

export function Banner({ tone = 'info', title, body, meta }: { tone?: Tone; title: string; body?: string; meta?: string }) {
    const Icon = tone === 'bad' || tone === 'warn' ? TriangleAlert : Info;
    return (
        <div className={cn('mb-5 flex flex-wrap items-start gap-3 rounded-[8px] border p-4', infoTone[tone])}>
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{title}</p>
                {body && <p className="mt-0.5 text-sm opacity-90">{body}</p>}
            </div>
            {meta && <p className="text-xs font-medium opacity-80">{meta}</p>}
        </div>
    );
}

export function PanelView({ panel }: { panel: Panel }) {
    switch (panel.kind) {
        case 'row':
            return (
                <div className={cn('grid gap-4', panel.panels.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
                    {panel.panels.map((p, i) => (
                        <PanelView key={i} panel={p} />
                    ))}
                </div>
            );
        case 'table':
            return (
                <Box title={panel.title ?? undefined}>
                    {panel.caption && <p className="-mt-2 mb-3 text-xs text-ink-500">{panel.caption}</p>}
                    <DataTable columns={panel.columns} rows={panel.rows} empty={panel.empty} pagination={panel.pagination} footer={panel.footer} />
                    <MoreLink link={panel.link} />
                </Box>
            );
        case 'donut':
            return (
                <Box title={panel.title}>
                    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
                        <Donut items={panel.items} center={panel.center} centerLabel={panel.centerLabel} />
                        <Legend items={panel.items} />
                    </div>
                    <MoreLink link={panel.link} />
                </Box>
            );
        case 'list':
            return (
                <Box title={panel.title}>
                    <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                        {panel.items.map((i, idx) => {
                            const inner = (
                                <div className="flex items-start gap-2 py-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-ink-800">{i.label}</p>
                                        {i.sub && <p className="text-xs text-ink-500">{i.sub}</p>}
                                    </div>
                                    {i.value && (i.tone ? <StatusPill status={i.value} tone={i.tone} /> : <span className="text-right font-semibold whitespace-nowrap text-ink-900">{i.value}</span>)}
                                </div>
                            );
                            return (
                                <li key={idx}>
                                    {i.href ? (
                                        <Link href={i.href} className="block hover:bg-parchment-100">
                                            {inner}
                                        </Link>
                                    ) : (
                                        inner
                                    )}
                                </li>
                            );
                        })}
                        {panel.items.length === 0 && <li className="py-3 text-ink-400">Nothing to show yet.</li>}
                    </ul>
                    <MoreLink link={panel.link} />
                </Box>
            );
        case 'actions':
            return (
                <Box title={panel.title}>
                    <ul className="space-y-1">
                        {panel.items.map((a, i) => (
                            <li key={i}>
                                <ActionButton action={{ ...a, variant: a.variant ?? 'ghost' }} className="w-full justify-between !px-1 text-left" />
                            </li>
                        ))}
                    </ul>
                </Box>
            );
        case 'info':
            return (
                <div className={cn('rounded-[8px] border p-4', infoTone[panel.tone ?? 'info'])}>
                    <p className="text-sm font-semibold">{panel.title}</p>
                    <p className="mt-1 text-[0.8125rem] whitespace-pre-line opacity-90">{panel.body}</p>
                    {panel.cta && (
                        <div className="mt-3">
                            <ActionButton action={panel.cta} />
                        </div>
                    )}
                </div>
            );
        case 'kv':
            return (
                <Box title={panel.title}>
                    <dl className="grid gap-x-4 gap-y-2 text-[0.8125rem] sm:grid-cols-[minmax(0,10rem)_1fr]">
                        {panel.rows.map(([k, v], i) => (
                            <div key={i} className="contents">
                                <dt className="text-ink-500">{k}</dt>
                                <dd className="font-medium text-ink-900">
                                    <CellView cell={v} />
                                </dd>
                            </div>
                        ))}
                    </dl>
                    {panel.cta && (
                        <div className="mt-3">
                            <ActionButton action={panel.cta} />
                        </div>
                    )}
                </Box>
            );
        case 'bars':
            return (
                <Box title={panel.title}>
                    <ul className="space-y-2.5">
                        {panel.items.map((b) => (
                            <li key={b.label}>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-ink-700">{b.label}</span>
                                    <span className="font-semibold text-ink-900">{b.display ?? `${b.value}%`}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-parchment-300">
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, b.value))}%`, background: toneHex(b.tone ?? 'gold') }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <MoreLink link={panel.link} />
                </Box>
            );
        case 'timeline':
            return (
                <Box title={panel.title}>
                    <ol className="relative space-y-3 border-l-2 border-parchment-400 pl-4">
                        {panel.items.map((t, i) => (
                            <li key={i} className="relative">
                                <span className="absolute top-1 -left-[1.4rem] size-3 rounded-full border-2 border-white" style={{ background: toneHex(t.tone ?? 'gold') }} aria-hidden="true" />
                                <div className="flex flex-wrap justify-between gap-2">
                                    <p className="text-[0.8125rem] font-semibold text-ink-900">{t.title}</p>
                                    {t.meta && <p className="text-xs text-ink-500">{t.meta}</p>}
                                </div>
                                {t.sub && <p className="text-xs text-ink-600">{t.sub}</p>}
                            </li>
                        ))}
                    </ol>
                    <MoreLink link={panel.link} />
                </Box>
            );
        case 'gauge':
            return (
                <Box title={panel.title}>
                    <Gauge value={panel.value} label={panel.label} />
                    {panel.items && panel.items.length > 0 && (
                        <div className="mt-3">
                            <Legend items={panel.items} />
                        </div>
                    )}
                </Box>
            );
        case 'checklist':
            return (
                <Box title={panel.title}>
                    <ul className="space-y-1.5 text-[0.8125rem]">
                        {panel.items.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                                {c.ok === true ? (
                                    <Check className="mt-0.5 size-4 shrink-0 text-verified-500" aria-label="Yes" />
                                ) : c.ok === 'warn' ? (
                                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-attested-500" aria-label="Attention" />
                                ) : (
                                    <X className="mt-0.5 size-4 shrink-0 text-risk-500" aria-label="No" />
                                )}
                                <span className="flex-1 text-ink-700">{c.label}</span>
                                {c.value && <span className="text-xs font-semibold text-ink-900">{c.value}</span>}
                            </li>
                        ))}
                    </ul>
                </Box>
            );
        case 'steps':
            return (
                <Box title={panel.title}>
                    <ol className="flex flex-col gap-3 sm:flex-row">
                        {panel.steps.map((s, i) => {
                            const n = i + 1;
                            const done = n < panel.current;
                            const active = n === panel.current;
                            return (
                                <li key={s.label} className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center sm:text-center">
                                    <span
                                        className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                                            done ? 'border-verified-500 bg-verified-500 text-white' : active ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500 bg-white text-ink-400',
                                        )}
                                    >
                                        {done ? <Check className="size-4" /> : n}
                                    </span>
                                    <span>
                                        <span className={cn('block text-xs font-semibold', active ? 'text-ink-900' : 'text-ink-600')}>{s.label}</span>
                                        {s.sub && <span className="block text-[0.6875rem] text-ink-500">{s.sub}</span>}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </Box>
            );
        case 'text':
            return (
                <Box title={panel.title}>
                    <p className="text-sm whitespace-pre-line text-ink-700">{panel.body}</p>
                </Box>
            );
        case 'cards':
            return (
                <Box title={panel.title}>
                    <div className={cn('grid gap-3 sm:grid-cols-2', panel.cols === 3 ? 'lg:grid-cols-3' : panel.cols === 5 ? 'lg:grid-cols-5' : panel.cols === 2 ? '' : 'lg:grid-cols-4')}>
                        {panel.cards.map((c, i) => {
                            const Icon = portalIcon(c.icon);
                            const inner = (
                                <div className="flex h-full flex-col rounded-[8px] border border-parchment-400 bg-white p-3.5 transition-colors hover:border-gold-400">
                                    <div className="flex items-start gap-2.5">
                                        {c.icon && (
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-gold-50 text-gold-700">
                                                <Icon className="size-4.5" aria-hidden="true" />
                                            </span>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{c.title}</p>
                                            {c.body && <p className="mt-0.5 text-xs text-ink-600">{c.body}</p>}
                                        </div>
                                        {c.href && <ChevronRight className="size-4 text-ink-400" aria-hidden="true" />}
                                    </div>
                                    {c.meta && <p className={cn('mt-2 text-[0.6875rem] font-medium', toneText[c.tone ?? 'neutral'])}>{c.meta}</p>}
                                    {c.actions && c.actions.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {c.actions.map((a, j) => (
                                                <ActionButton key={j} action={a} size="xs" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                            return c.href ? (
                                <Link key={i} href={c.href} className="block">
                                    {inner}
                                </Link>
                            ) : (
                                <div key={i}>{inner}</div>
                            );
                        })}
                    </div>
                </Box>
            );
        case 'chart':
            return (
                <Box title={panel.title}>
                    <SeriesChart labels={panel.labels} series={panel.series} type={panel.type} />
                    {panel.note && <p className="mt-2 text-xs text-ink-500">{panel.note}</p>}
                </Box>
            );
        case 'form':
            return (
                <Box title={panel.title}>
                    <DynamicFormPanel spec={panel.form} />
                </Box>
            );
    }
}

export function ProgressBar({ value }: { value: number }) {
    return <Progress value={value} />;
}
