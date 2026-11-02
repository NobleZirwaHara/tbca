import { Clock, ShoppingCart } from 'lucide-react';
import { Bars, Dl, useMoney } from '@/Components/Industries/Kit';
import { Hero, Panel, PillLink, ProtoFrame, STATUS_TEXT, SvcPrice, addService, pill, type SvcStatus } from '@/Components/Aiim/ProtoLibrary';
import type { AiimPageProps } from '@/types/aiim';

interface Svc {
    code: string; name: string; cat: string; sub: string; type: string; et: string; db: string; ds: string; dp: string; a0: number | null; a1: number | null; a2: number | null;
    sale: string; internal: boolean; auth: string; bref: string; bench: Record<string, number | string | null>; prices: Record<string, number>; from: number | null; entry: string; ep: number | null; status: SvcStatus; slug: string | null;
}

/** Service detail: tiers with app prices and delivery times, automation index and governance. */
export default function Service({ svc: s, section }: AiimPageProps & { svc: Svc; section: string | null }) {
    const money = useMoney();
    const tiers: [string, string][] = [['Basic', s.db], ['Standard', s.ds], ['Premium', s.dp]];
    const priced = s.status === 'priced';
    return (
        <ProtoFrame title={s.name} crumbs={[{ label: 'Services', href: '/aiim/services' }, { label: s.cat, href: `/aiim/services?cat=${encodeURIComponent(s.cat)}` }, { label: s.code }]}>
            <Hero
                eyebrow={`${s.cat} · ${s.sub} · ${s.type}`}
                title={s.name}
                lead={<>Entry tier {s.entry} from <SvcPrice s={s} /> (VAT-exclusive). {s.auth} · benchmark {s.bref}.</>}
                actions={s.internal ? <span className="rounded-full bg-ink-800 px-3 py-1.5 text-[0.78rem] text-ink-200">Internal operation — not client-saleable</span> : (
                    <>
                        {priced && <button type="button" className={pill('gold')} onClick={() => addService(s, s.entry, s.prices[s.entry] ?? s.from ?? 0)}><ShoppingCart className="size-3.5" />Add to basket</button>}
                        {s.slug && <PillLink href={`/sprints/${s.slug}`} tone="dark">Open the Sprint page</PillLink>}
                        <PillLink href="/aiim/workspace/advisor-request" tone="dark">Ask an advisor</PillLink>
                    </>
                )}
            />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
                {tiers.map(([t, d]) => {
                    const p = s.prices[t];
                    return (
                        <Panel key={t}>
                            <div className="text-[0.7rem] font-bold tracking-[0.12em] text-gold-700 uppercase">{t}</div>
                            <div className="mt-1 font-mono text-[1.4rem] font-bold text-ink-900">{p !== undefined ? money(p) : <span className="text-[0.9rem] font-normal text-ink-400">{priced ? 'Not sold at this tier' : STATUS_TEXT[s.status as Exclude<SvcStatus, 'priced'>]}</span>}</div>
                            <div className="mt-1 flex items-center gap-1 text-[0.78rem] text-ink-500"><Clock className="size-3" />{d || '—'}</div>
                            {p !== undefined && !s.internal && <button type="button" className={pill('ghost', 'xs') + ' mt-3'} onClick={() => addService(s, t, p)}>Add {t}</button>}
                        </Panel>
                    );
                })}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Panel title="Automation index (AAI)">
                    <Bars rows={[{ label: 'Now', value: s.a0 ?? 0, text: `${s.a0 ?? 0}%` }, { label: 'H1 · 12 months', value: s.a1 ?? 0, text: `${s.a1 ?? 0}%` }, { label: 'H2 · 36 months', value: s.a2 ?? 0, text: `${s.a2 ?? 0}%` }]} />
                </Panel>
                <Panel title="Governance">
                    <Dl rows={[
                        ['Code', <span key="c" className="font-mono">{s.code}</span>], ['Module', section ? <a key="m" href={section} className="text-controlled-700 hover:underline">{s.cat}</a> : s.cat], ['Subcategory', s.sub], ['Type', s.type], ['Saleable', s.sale],
                        ['Price authority', s.auth], ['Benchmark', Object.values(s.bench).some((v) => typeof v === 'number') ? `${s.bref} · medians ${['Basic', 'Standard', 'Premium'].map((k) => (typeof s.bench[k] === 'number' ? money(s.bench[k] as number) : '—')).join(' / ')} (reference only, not selling prices)` : `${s.bref} · ${String(s.bench.Basic ?? 'no comparator')}`],
                        ['Selling price', priced ? 'From the app Sprint with the same code' : STATUS_TEXT[s.status as Exclude<SvcStatus, 'priced'>]],
                    ]} />
                </Panel>
            </div>
        </ProtoFrame>
    );
}
