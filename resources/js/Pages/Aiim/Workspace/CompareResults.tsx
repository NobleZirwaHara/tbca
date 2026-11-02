import { Link } from '@inertiajs/react';
import ComparisonTable from '@/Components/Aiim/ComparisonTable';
import { addToManifest, btnGold, Empty, Flow, PriceFrom, TierPill, type Svc } from '@/Components/Aiim/ProtoAccount';
import { A, Card } from '@/Components/Industries/Kit';
import type { AiimPageProps, ComparisonData } from '@/types/aiim';

interface Template { id: string; name: string; sector: string; color: string; url: string; score: number; ra: number; tier: string; fields: Record<string, string> }

interface Props extends AiimPageProps {
    comparison: ComparisonData & { reference: string; generated: string };
    templates: Template[];
    fields: string[];
    report: Svc | null;
}

/** Prototype vbars(): vertical bars with value labels. */
function VBars({ items, label }: { items: { n: string; v: number; c: string }[]; label: string }) {
    const h = 180;
    const P = { l: 34, r: 8, t: 16, b: 48 };
    const W = Math.max(560, items.length * 120);
    const max = Math.max(1, ...items.map((i) => i.v));
    const nice = Math.ceil(max / 5) * 5 || 5;
    const ih = h - P.t - P.b;
    const bw = (W - P.l - P.r) / Math.max(1, items.length);
    const y = (v: number) => P.t + ih * (1 - v / nice);
    return (
        <figure className="min-w-0">
            <figcaption className="mb-1 text-[0.75rem] font-semibold text-ink-500">{label}</figcaption>
            <svg viewBox={`0 0 ${W} ${h}`} className="w-full" role="img" aria-label={label}>
                {[0, 1, 2, 3, 4].map((k) => { const v = (nice * k) / 4; return <g key={k}><line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--color-parchment-300)" /><text x={P.l - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="var(--color-ink-400)">{v}</text></g>; })}
                {items.map((it, i) => {
                    const x = P.l + i * bw + bw * 0.18;
                    return (
                        <g key={it.n}>
                            <rect x={x} y={y(it.v)} width={bw * 0.64} height={Math.max(0, y(0) - y(it.v))} rx="3" fill={it.c}><title>{`${it.n}: ${it.v}`}</title></rect>
                            <text x={x + bw * 0.32} y={y(it.v) - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-ink-800)">{it.v}</text>
                            <text x={x + bw * 0.32} y={P.t + ih + 14} textAnchor="end" fontSize="10" fill="var(--color-ink-500)" transform={`rotate(-30 ${x + bw * 0.32} ${P.t + ih + 14})`}>{it.n}</text>
                        </g>
                    );
                })}
            </svg>
        </figure>
    );
}

/** Mock-up 24: Comparison Results. */
export default function CompareResults({ comparison: c, templates, fields, report }: Props) {
    const total = templates.length + c.columns.length;
    const right = (
        <div className="flex flex-wrap gap-2">
            {report && report.price !== null && <button type="button" className={btnGold} onClick={() => addToManifest('service', report.code, 'Comparison report')}>Comparison report · <PriceFrom price={report.price} /></button>}
            <A sm href={`/aiim/workspace/compare?set=${c.reference}`}>Modify comparison</A>
            <a href={`/aiim/workspace/compare/${c.reference}/export`} className="inline-flex min-h-[30px] items-center rounded-[4px] border border-parchment-500 bg-white px-2.5 text-[0.75rem] font-semibold text-ink-800 hover:border-gold-500">Export CSV</a>
        </div>
    );

    if (!total) {
        return (
            <Flow title="Comparison Results" crumbs={[{ label: 'Opportunities', href: '/aiim/opportunities' }, { label: 'Comparison Builder', href: '/aiim/workspace/compare' }]}>
                <Empty icon="scale"><p>Add templates in the comparison builder first.</p><Link href="/aiim/workspace/compare" className={btnGold}>Open builder</Link></Empty>
            </Flow>
        );
    }

    return (
        <Flow
            title="Comparison Results"
            eyebrow={`${total} ${c.columns.length ? 'items' : 'templates'} side by side`}
            lead={`Set ${c.reference} · ${c.generated}`}
            crumbs={[{ label: 'Opportunities', href: '/aiim/opportunities' }, { label: 'Comparison Builder', href: '/aiim/workspace/compare' }]}
            right={right}
        >
            {templates.length > 0 && (
                <>
                    <Card title="Score and risk-adjusted score">
                        <div className="grid gap-4 md:grid-cols-2">
                            <VBars label="Score" items={templates.map((t) => ({ n: t.id, v: t.score, c: t.color }))} />
                            <VBars label="Risk-adjusted score (RA)" items={templates.map((t) => ({ n: t.id, v: t.ra, c: t.color }))} />
                        </div>
                    </Card>
                    <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400 bg-white">
                        <table className="w-full border-collapse text-[0.8rem]">
                            <thead className="bg-parchment-200 text-left">
                                <tr>
                                    <th className="border-b border-parchment-400 px-2.5 py-2 text-[0.7rem] font-bold tracking-wide text-ink-500 uppercase">Field</th>
                                    {templates.map((t) => <th key={t.id} className="border-b border-parchment-400 px-2.5 py-2 align-top"><Link href={t.url} className="font-semibold text-controlled-700 hover:underline">{t.id}</Link><div className="font-normal text-ink-600">{t.name}</div></th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((f) => (
                                    <tr key={f} className="border-b border-parchment-300 last:border-0">
                                        <td className="px-2.5 py-1.5 font-semibold text-ink-900">{f}</td>
                                        {templates.map((t) => <td key={t.id} className="px-2.5 py-1.5 align-top">{/Tier/.test(f) ? <TierPill tier={t.fields[f]} /> : t.fields[f] || <span className="text-ink-400">—</span>}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {c.columns.length > 0 && (
                <Card title={templates.length ? 'Other saved objects in this set' : 'Side-by-side metrics'} pad={false}>
                    <ComparisonTable data={c} showOverall />
                </Card>
            )}
        </Flow>
    );
}
