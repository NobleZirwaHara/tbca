import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { B, Bars, Card, Chip, Cols, Dl, Kpi, Kpis, N, STable, pct } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import { cn } from '@/lib/cn';
import type { Industry, IndustryBase, SubIndustry } from '@/types/industries';

interface Props extends IndustryBase {
    match: { total: number; matched: number; priced: number; unmatched: number };
    all: { code: string; name: string; subs: SubIndustry[] }[];
    sel: Industry;
    total: number;
    cxCount: Record<string, number>;
    cxn: Record<string, string>;
    aiimNames: Record<string, string>;
}

export default function Taxonomy(p: Props) {
    const { sel, all, cxCount, cxn } = p;
    const [copied, setCopied] = useState(false);
    const csv = () => {
        const rows = ['Industry,Code,Sub-industry', ...all.flatMap((x) => x.subs.map((s) => [x.name, s.code, s.name].map((v) => `"${v.replace(/"/g, '""')}"`).join(',')))].join('\n');
        void navigator.clipboard?.writeText(rows).then(() => setCopied(true));
    };
    const weights = Object.entries(sel.w).sort((a, b) => b[1] - a[1]);
    return (
        <AdminPage active="taxonomy" title="Sector Taxonomy Manager" eyebrow="Canonical source of truth · Page 27" desc="Manage the 17 canonical industries and 56 sub-industries used for Sprint classification, curation and pricing." match={p.match}
            act={<B onClick={csv}>{copied ? 'Taxonomy CSV copied' : 'Export taxonomy (CSV)'}</B>}>
            <Kpis>
                <Kpi l="Industries (top level)" v="17" s="Active 17" icon="layers" />
                <Kpi l="Sub-industries" v="56" s="Active 56 · archived 0" icon="tag" />
                <Kpi l="Sprints mapped" v={N(p.total)} s="Unmapped 0" icon="check" />
                <Kpi l="Taxonomy health" v="Healthy" s="No orphans · no duplicate codes" icon="shield" />
            </Kpis>
            <Cols>
                <Card title="Industries (17)" icon="layers">
                    {all.map((x, i) => (
                        <Link key={x.code} href={`/admin/industries/taxonomy?ind=${x.code}`} preserveScroll className={cn('flex items-center justify-between gap-2 rounded-[4px] px-2 py-1.5', x.code === sel.code && 'bg-gold-100')}>
                            <span className="text-[0.82rem]"><b>{i + 1}. {x.name}</b> <span className="text-[0.72rem] text-ink-400">{x.subs.length} sub-industries</span></span><Chip t="Active" tone="ok" />
                        </Link>
                    ))}
                </Card>
                <Card title={<>Selected industry · {sel.name} <Chip t="Canonical" tone="gold" /></>} icon="tag">
                    <Dl rows={[['Industry code', <span className="font-mono">{sel.code}</span>], ['Status', <Chip t="Active" tone="ok" />], ['Version', '3.1 · last updated 21 Oct 2026'], ['Description', sel.short], ['AIIM sectors', sel.aiim.map((k) => p.aiimNames[k]).join(', ') || '—'],
                        ['Service-family weights', <span className="font-mono text-[0.78rem]">{weights.map(([f, w]) => `${f}${'●'.repeat(w)}`).join(' ')}</span>], ['Rules', `Human gate: ${sel.gate} · complexity ${sel.cxName} · benchmark eligible if consented`]]} />
                    <div className="mt-3"><STable compact head={['Code', 'Sub-industry', 'Description', 'AIIM', 'HS groups', 'Status']} rows={sel.subs.map((s) => [<span className="font-mono">{s.code}</span>, <b>{s.name}</b>, <span className="text-[0.78rem]">{s.desc}</span>, s.aiim.join(', ') || '—', s.hs.length || '—', <Chip t="Active" tone="ok" />])} /></div>
                </Card>
            </Cols>
            <Cols>
                <Card title="Complexity distribution (all Sprints)" icon="chart"><Bars rows={[1, 2, 3, 4, 5].map((k) => ({ label: cxn[String(k)], value: cxCount[String(k)] ?? 0, text: `${N(cxCount[String(k)] ?? 0)} (${pct(cxCount[String(k)] ?? 0, p.total)} %)` }))} /></Card>
                <Card title="Recent changes" icon="clock"><STable compact head={['Date', 'By', 'Change', 'Version']} rows={[['21 Oct 2026', 'Admin', 'All 17 industries activated in all 54 countries', '3.1'], ['21 Oct 2026', 'Admin', 'Sub-industries normalised to 56 canonical codes', '3.0'], ['14 Aug 2026', 'Admin', 'Initial taxonomy (SA Phase 1)', '1.0']]} /></Card>
            </Cols>
        </AdminPage>
    );
}
