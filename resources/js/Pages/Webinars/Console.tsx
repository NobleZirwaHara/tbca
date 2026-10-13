import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ActButton, BlockGrid, BlockStack, KpiRow, type Act, type Block, type Kpi } from '@/Components/Webinars/Board';
import { Crumbs, Elapsed, Eyebrow, PillTabs, WebinarShell } from '@/Components/Webinars/kit';
import type { WebinarEvent } from '@/types/webinars';

interface ConsoleConfig {
    key: string;
    title: string;
    eyebrow: string;
    subtitle: string;
    description: string | null;
    actions: Act[];
    status: { label: string; tone: string; sub?: string; timer?: string } | null;
    notice: string | null;
    top: Block[];
    kpis: Kpi[];
    tabs: { key: string; label: string; count: number | null; blocks: Block[] }[];
    rail: Block[];
}

interface Props {
    console: ConsoleConfig;
    event: WebinarEvent;
    events: { slug: string; title: string; date: string; state: string }[];
    tab: string;
}

const STATUS_TONE: Record<string, string> = {
    good: 'border-verified-500/40 bg-verified-50 text-verified-700',
    warn: 'border-gold-400 bg-gold-50 text-gold-800',
    bad: 'border-risk-500 bg-risk-500 text-white',
    neutral: 'border-parchment-500 bg-parchment-200 text-ink-700',
};

export default function Console({ console: c, event, events, tab }: Props) {
    const [active, setActive] = useState(c.tabs.some((t) => t.key === tab) ? tab : c.tabs[0]?.key);
    const current = c.tabs.find((t) => t.key === active) ?? c.tabs[0];
    const portfolio = c.key === 'command-centre';

    return (
        <WebinarShell event={null} staffSlug={event.slug} wide>
            <Head title={c.title} />

            <header className="space-y-3">
                <Crumbs items={[['Home', '/'], ['Webinars', '/webinars'], ...(portfolio ? [] : [[event.title.split(':')[0], `/webinars/${event.slug}`] as [string, string]]), [c.eyebrow]]} />
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-4xl">
                        <Eyebrow>{c.eyebrow}</Eyebrow>
                        <h1 className="mt-2 font-serif text-[1.75rem] leading-tight font-bold text-ink-900 sm:text-[2.25rem]">{c.title}</h1>
                        <p className="mt-1 font-serif text-[1.125rem] font-bold text-gold-600 sm:text-[1.375rem]">{c.subtitle}</p>
                        {c.description && <p className="mt-1.5 text-[0.875rem] text-ink-600">{c.description}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <label className="flex items-center gap-2 text-[0.75rem] text-ink-500">
                            <span>{portfolio ? 'Open a webinar' : 'Webinar'}</span>
                            <select
                                value={portfolio ? '' : event.slug}
                                onChange={(e) => e.target.value && router.get(`/admin/webinars/${e.target.value}/${portfolio ? 'registrations' : c.key}`)}
                                className="h-9 max-w-[18rem] rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.8125rem] text-ink-900"
                            >
                                {portfolio && <option value="">All webinars</option>}
                                {events.map((e) => <option key={e.slug} value={e.slug}>{e.date} | {e.title.length > 40 ? `${e.title.slice(0, 40)}...` : e.title} ({e.state})</option>)}
                            </select>
                        </label>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {c.status && (
                                <span className={cn('inline-flex items-center gap-2 rounded-[6px] border px-3 py-1.5 text-[0.8125rem] font-bold', STATUS_TONE[c.status.tone] ?? STATUS_TONE.neutral)}>
                                    {c.status.tone === 'bad' && <span className="size-2 animate-pulse rounded-full bg-white" />}
                                    {c.status.label}
                                    {c.status.timer && <span className="font-mono"><Elapsed start={Math.max(0, Math.floor((Date.now() - new Date(c.status.timer).getTime()) / 1000))} /></span>}
                                    {c.status.sub && <span className="font-normal">{c.status.sub}</span>}
                                </span>
                            )}
                            {c.actions.map((a) => <ActButton key={a.label} act={a} size="md" />)}
                        </div>
                    </div>
                </div>
                {c.notice && <p className="rounded-[8px] border border-gold-300 bg-gold-50 px-4 py-2.5 text-[0.8125rem] text-ink-700">{c.notice}</p>}
            </header>

            {c.top.length > 0 && <div className="rounded-[10px] border border-parchment-400 bg-white p-4"><BlockStack blocks={c.top} /></div>}

            <KpiRow kpis={c.kpis} />

            <div className={cn('grid gap-5', c.rail.length > 0 && 'xl:grid-cols-[minmax(0,1fr)_20rem]')}>
                <div className="min-w-0 space-y-4">
                    {c.tabs.length > 1 && (
                        <PillTabs
                            tabs={c.tabs.map((t) => ({ key: t.key, label: t.count !== null && t.count !== undefined ? `${t.label} (${t.count})` : t.label }))}
                            value={current?.key ?? ''}
                            onChange={(k) => {
                                setActive(k);
                                window.history.replaceState(window.history.state, '', `${window.location.pathname}?tab=${k}`);
                            }}
                        />
                    )}
                    {current && <BlockGrid key={current.key} blocks={current.blocks} />}
                </div>
                {c.rail.length > 0 && (
                    <aside className="min-w-0">
                        <BlockStack blocks={c.rail.map((b) => (b.type === 'panel' ? { ...b, span: 12 } : b))} />
                    </aside>
                )}
            </div>
        </WebinarShell>
    );
}

Console.layout = null;
