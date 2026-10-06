import { Link } from '@inertiajs/react';
import {
    Award,
    Bot,
    Briefcase,
    CircleCheck,
    CircleX,
    Clock,
    Code2,
    Crosshair,
    ExternalLink,
    FileText,
    Gauge,
    Hash,
    Info,
    Layers,
    ListChecks,
    Network,
    OctagonX,
    ShieldCheck,
    SquareArrowOutUpRight,
    Tag,
    TriangleAlert,
    User,
    UserCheck,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useRef, type ReactNode } from 'react';
import { AskButton, Crumbs, RelatedSprints, SaveButton, attrsOf, list, pairs, quoteHref } from '@/Components/SprintTypes/B/common';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { QuoteRouteAttributes } from '@/types/sprint-types-b';


import { usePrice } from '@/lib/money';
const summaryIcons: Record<string, LucideIcon> = {
    'Service Name': Briefcase,
    'Sprint Code': Hash,
    'Sprint Type': Layers,
    'Indicative From': Tag,
    'Indicative From (ZAR)': Tag,
    'Price Type': Code2,
    'Delivery Time': Clock,
    Buyer: Users,
    'Human Review': UserCheck,
    'Partner Review': Users,
    'Risk Rating': Gauge,
    'Next Gate': SquareArrowOutUpRight,
    'Stop Position': OctagonX,
};

function Pill({ tone, children }: { tone: 'green' | 'red' | 'yellow' | 'grey'; children: ReactNode }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap',
                tone === 'green' && 'border-verified-500/40 bg-verified-50 text-verified-700',
                tone === 'red' && 'border-risk-500/40 bg-risk-50 text-risk-700',
                tone === 'yellow' && 'border-attested-500/40 bg-attested-50 text-attested-700',
                tone === 'grey' && 'border-parchment-500 bg-parchment-100 text-ink-600',
            )}
        >
            {children}
        </span>
    );
}

function NumCard({ n, title, icon: Icon, children, className }: { n: number; title: string; icon: LucideIcon; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[6px] border border-gold-200 bg-white p-4 shadow-card', className)}>
            <header className="mb-2.5 flex items-center gap-2">
                <Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[0.625rem] font-bold text-parchment-50">{n}</span>
                <h2 className="text-[0.8125rem] font-bold text-ink-900">{title}</h2>
            </header>
            <div className="text-xs leading-relaxed text-ink-600">{children}</div>
        </section>
    );
}

function Bullets({ items, cols = 1 }: { items: string[]; cols?: 1 | 2 }) {
    return (
        <ul className={cn('list-disc space-y-1 pl-4 marker:text-gold-600', cols === 2 && 'sm:columns-2 sm:gap-6')}>
            {items.map((i) => (
                <li key={i}>{i}</li>
            ))}
        </ul>
    );
}

export default function QuoteRouteSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const rand = usePrice();
    const a = attrsOf<QuoteRouteAttributes>(sprint);
    const gridRef = useRef<HTMLDivElement>(null);
    const packages = sprint.packages ?? [];
    const variant = a.layout_variant ?? 'C';
    const card = a.price_card ?? {};
    const from = sprint.price_zar ?? packages[0]?.zar ?? 0;
    const summary = pairs(a.service_summary);
    const prefix = a.status_prefix ? 'Status: ' : '';
    const ai = a.ai_assisted ?? { items: [] };
    const del = a.deliverable ?? {};

    const scrollToScope = () => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const tierLabel = (name: string) => (variant === 'A' ? name : `${name} From`);
    const tiers = (inline: boolean) =>
        packages.map((p) => (
            <div key={p.key} className={cn('min-w-0', inline ? 'px-3' : 'px-4 py-3 text-center')}>
                <p className="text-[0.6875rem] font-medium text-ink-600">{tierLabel(p.name)}</p>
                {variant === 'A' ? (
                    <p className="text-sm font-bold text-ink-900">From {rand(p.zar)}</p>
                ) : (
                    <p className="font-serif text-lg font-bold text-gold-700">{rand(p.zar)}</p>
                )}
            </div>
        ));

    const ctas = (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[13rem]">
            <Link
                href={quoteHref(sprint)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[5px] bg-gold-500 px-4 text-sm font-semibold text-ink-900 hover:bg-gold-400"
            >
                {card.primary_cta ?? 'Request Scoped Quote'} →
            </Link>
            <button
                type="button"
                onClick={scrollToScope}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-gold-500 px-4 text-[0.8125rem] font-medium text-ink-900 hover:bg-gold-50"
            >
                {card.secondary_cta ?? 'Review Scope & Delivery Path'} →
            </button>
        </div>
    );

    const summaryValue = (k: string, v: string) => {
        if (k.startsWith('Indicative From')) return <span className="font-semibold text-gold-700">{v}</span>;
        if (k === 'Risk Rating') {
            if (a.risk_style === 'orange-text') return <span className="font-semibold text-attested-500">{v}</span>;
            if (a.risk_style === 'yellow-pill') return <Pill tone="yellow">{v}</Pill>;
            return v;
        }
        if (k === 'Next Gate') return v.length < 32 ? <Pill tone="green">{v}</Pill> : v;
        if (k === 'Stop Position') return <Pill tone="red">{v}</Pill>;
        return v;
    };

    const sideCards = (
        <div className={cn('grid gap-4', variant !== 'B' && 'sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2')}>
            <section className="rounded-[6px] border border-gold-200 bg-white p-4 shadow-card">
                <h2 className="mb-2 text-[0.8125rem] font-bold text-ink-900">{a.quote_basis?.title ?? 'Quote Basis | Ledger T'}</h2>
                <dl className="space-y-1.5 text-[0.6875rem]">
                    {pairs(a.quote_basis?.rows).map(([k, v]) => (
                        <div key={k}>
                            <dt className="text-ink-500">{k}</dt>
                            <dd className="font-semibold text-ink-900">{v}</dd>
                        </div>
                    ))}
                </dl>
                {a.quote_basis?.note && <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-500">{a.quote_basis.note}</p>}
            </section>
            <section className="rounded-[6px] border border-gold-200 bg-white p-4 shadow-card">
                <h2 className="mb-2 text-[0.8125rem] font-bold text-ink-900">{a.commercial_boundary?.title ?? 'Commercial Boundary (Five-Ledger Logic)'}</h2>
                <ul className="space-y-2">
                    {(a.commercial_boundary?.ledgers ?? []).map(([l, name, desc]) => (
                        <li key={l} className="flex gap-2">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-[4px] border border-gold-500 text-xs font-bold text-gold-700">{l}</span>
                            <span className="text-[0.6875rem]">
                                <span className="block font-semibold text-ink-900">{name}</span>
                                <span className="text-ink-500">{desc}</span>
                            </span>
                        </li>
                    ))}
                </ul>
                {a.commercial_boundary?.note && <p className="mt-2 text-[0.6875rem] text-ink-500">{a.commercial_boundary.note}</p>}
            </section>
        </div>
    );

    return (
        <div className="bg-parchment-100">
            <div className="container-tbca py-6">
                <Crumbs home items={[{ label: 'Services', href: '/services' }, { label: 'Quote-Route Advisory', href: '/sprints' }, { label: sprint.title }]} />

                <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="min-w-0 space-y-5">
                        <div>
                            <h1 className="font-serif text-3xl leading-tight font-bold text-ink-900 sm:text-4xl">{sprint.title}</h1>
                            <p className="mt-2 max-w-3xl text-[0.8125rem] leading-relaxed text-ink-500">{sprint.summary}</p>
                        </div>

                        {/* Price card */}
                        <div className="rounded-[6px] border border-gold-300 bg-white shadow-card">
                            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:divide-x sm:divide-parchment-400">
                                <div className="min-w-0 sm:pr-4">
                                    <p className="text-[0.6875rem] font-medium text-ink-600">{card.label ?? 'Indicative From (ZAR)'}</p>
                                    <p className="font-serif text-3xl font-bold text-gold-700">{rand(from)}</p>
                                    <p className="mt-1 flex max-w-[16rem] items-start gap-1 text-[0.6875rem] text-ink-500">
                                        {card.note ?? a.price_note}
                                        <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                                    </p>
                                </div>
                                <div className="sm:px-4">
                                    <p className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-ink-600">
                                        <Tag className="size-3.5 text-gold-600" aria-hidden="true" /> Sprint Code
                                    </p>
                                    <p className="font-serif text-xl font-bold text-ink-900">{a.printed_code ?? sprint.code}</p>
                                </div>
                                {variant === 'C' && <div className="flex flex-wrap divide-x divide-parchment-300 sm:px-1">{tiers(true)}</div>}
                                <div className="sm:ml-auto sm:pl-4">{ctas}</div>
                            </div>
                            {variant !== 'C' && <div className="grid grid-cols-3 divide-x divide-parchment-300 border-t border-parchment-400">{tiers(false)}</div>}
                        </div>

                        {/* 13 numbered cards */}
                        <div ref={gridRef} className="scroll-mt-40 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <NumCard n={1} title="Scope" icon={Crosshair}>
                                    <p>{a.scope}</p>
                                </NumCard>
                                <NumCard n={2} title="What is included" icon={ListChecks}>
                                    <Bullets items={list(a.included)} cols={variant === 'C' ? 1 : 2} />
                                    {a.included_note && <p className="mt-2 italic">{a.included_note}</p>}
                                </NumCard>
                                <NumCard n={3} title="What is excluded" icon={CircleX}>
                                    <Bullets items={list(a.excluded)} />
                                </NumCard>
                                <NumCard n={4} title="Typical client inputs" icon={User}>
                                    <Bullets items={list(a.client_inputs)} />
                                </NumCard>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <NumCard n={5} title="TBCA method" icon={Network}>
                                    <p className="font-medium text-ink-800">{a.method}</p>
                                </NumCard>
                                <NumCard n={6} title="Human-led activities" icon={UserCheck}>
                                    <Bullets items={list(a.human_led)} cols={variant === 'A' ? 2 : 1} />
                                </NumCard>
                                <NumCard n={7} title="AI-assisted activities" icon={Bot}>
                                    {ai.intro && <p className="mb-1.5">{ai.intro}</p>}
                                    <Bullets items={list(ai.items)} />
                                </NumCard>
                                <NumCard n={8} title="Deliverable" icon={FileText}>
                                    {del.text && <p>{del.text}</p>}
                                    {list(del.items).length > 0 && <Bullets items={list(del.items)} />}
                                    {del.format && (
                                        <p className="mt-2 flex items-center gap-1 font-medium text-ink-800">
                                            <Info className="size-3.5 text-gold-600" aria-hidden="true" /> {del.format}
                                        </p>
                                    )}
                                </NumCard>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.5fr_1fr_1fr]">
                                <NumCard n={9} title="Acceptance criteria" icon={Award}>
                                    <Bullets items={list(a.acceptance)} />
                                </NumCard>
                                <NumCard n={10} title="Limitations" icon={TriangleAlert}>
                                    <Bullets items={list(a.limitations)} />
                                </NumCard>
                                <NumCard n={11} title="Potential external requirements" icon={ExternalLink}>
                                    <ul className="space-y-1.5">
                                        {pairs(a.external_requirements).map(([name, status]) => (
                                            <li key={name} className="flex items-center justify-between gap-2">
                                                <span>{name}</span>
                                                <Pill tone="grey">{status}</Pill>
                                            </li>
                                        ))}
                                    </ul>
                                </NumCard>
                                <NumCard n={12} title="Next gate" icon={SquareArrowOutUpRight}>
                                    <p>{a.next_gate?.text}</p>
                                    <p className="mt-2">
                                        <Pill tone="green">
                                            {prefix}
                                            {a.next_gate?.status ?? 'Pending Client Approval'}
                                        </Pill>
                                    </p>
                                </NumCard>
                                <NumCard n={13} title="Stop position" icon={OctagonX}>
                                    <p>{a.stop_position?.text}</p>
                                    <p className="mt-2">
                                        <Pill tone="red">
                                            {prefix}
                                            {a.stop_position?.status ?? 'Controlled Stop'}
                                        </Pill>
                                    </p>
                                </NumCard>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-4">
                        <section className="rounded-[6px] border border-gold-200 bg-white p-4 shadow-card">
                            <h2 className="mb-3 text-sm font-bold text-ink-900">Service Summary</h2>
                            <dl className="divide-y divide-parchment-300 text-xs">
                                {summary.map(([k, v]) => {
                                    const Icon = summaryIcons[k] ?? CircleCheck;
                                    return (
                                        <div key={k} className="grid grid-cols-[1rem_minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-2 py-1.5">
                                            <Icon className="size-3.5 text-gold-600" aria-hidden="true" />
                                            <dt className="text-ink-500">{k}</dt>
                                            <dd className="font-medium text-ink-900">{summaryValue(k, v)}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <SaveButton sprint={sprint} label="Save" />
                                <AskButton sprint={sprint} label="Ask" />
                            </div>
                        </section>
                        {sideCards}
                        {a.notice_strip && (
                            <p className="flex gap-2 rounded-[6px] border border-gold-200 bg-gold-50 p-3 text-xs text-ink-700">
                                <ShieldCheck className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                {a.notice_strip}
                            </p>
                        )}
                    </aside>
                </div>

                <RelatedSprints related={related} title="Related Advisory Sprints" className="mt-10" />
            </div>
        </div>
    );
}
