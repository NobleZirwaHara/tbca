import { Head } from '@inertiajs/react';
import { CircleCheck, CircleX } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, Donut, MiniBar } from '@/Components/Marketplace/ui';
import { PriorityPill, Table, td } from '@/Components/Marketplace/AdminKit';
import type { RegisterNav } from '@/types/marketplace';

interface Props {
    nav: RegisterNav;
    byCategory: { category: string; needed: number; available: number; coverage: number; gap: number }[];
    live: { applicants: number; verified: number; available: number };
    fills: { reference: string; category: string; country: string; provider: string; qualified: boolean; status: string }[];
}

const COUNTRIES: [string, number, number, number][] = [['South Africa', 612, 472, 94.2], ['Kenya', 304, 232, 91.2], ['Nigeria', 276, 192, 86.1], ['Ghana', 168, 128, 88.9], ['Egypt', 196, 148, 87.5], ['Morocco', 124, 86, 85.1], ['Tanzania', 44, 32, 74.4]];
const SKILLS: [string, number, number, number, number, string, string][] = [['Financial Modeling', 420, 368, 276, 90.8, 'Low', 'Monitor'], ['Valuation (DCF, P/E)', 360, 312, 228, 87.7, 'Low', 'Monitor'], ['Industry Analysis', 330, 286, 208, 84.6, 'Moderate', 'Expand Panel'], ['Market Sizing', 300, 252, 180, 78.6, 'High', 'Recruit'], ['Legal Advisory', 240, 198, 136, 71.7, 'High', 'Recruit'], ['Tax Advisory', 220, 176, 124, 70.5, 'High', 'Recruit'], ['Automation (RPA)', 180, 142, 96, 62.4, 'High', 'Recruit']];
const GAPS: [string, string, string, string, string, string][] = [['Coverage Gap', 'Technical Specialists', '60 provider shortfall vs demand', 'High', 'Launch Recruitment', 'high'], ['Expiring Verification', 'South Africa', '38 providers expiring ≤ 30 days', 'Medium', 'Review Expiry Cluster', 'medium'], ['Single-Provider Dependency', 'Morocco', '7 categories with single provider', 'High', 'Expand Panel', 'high'], ['Low Fill Rate', 'Automation & AI', 'Fill rate at 62.4%', 'Medium', 'Recruit Specialists', 'medium'], ['Geographic Gap', 'Tanzania', 'Low availability vs demand', 'Medium', 'Local Recruitment', 'medium']];

export default function Supply({ nav, byCategory, live, fills }: Props) {
    const tiles: [string, string, string][] = [
        [live.applicants.toLocaleString(), 'Applicants', '↑ 8.6%'], [live.verified.toLocaleString(), 'Verified Providers', '↑ 6.3%'], ['1,724', 'Eligible Providers', '↑ 5.1%'], [live.available.toLocaleString(), 'Available Providers', '↓ 1.2%'],
        ['142', 'Expiring Verification (≤ 30 days)', '↑ 12.7%'], ['93.6%', 'Qualified Fill Rate', '↑ 1.9 pp'], ['72.4%', 'First-Choice Fill Rate', '↑ 2.8 pp'], ['6.4%', 'Unfillable Rate', '↑ 1.9 pp'],
        ['1.6 days', 'P50 Time to Assign', '↓ 0.2 days'], ['3.9 days', 'P80 Time to Assign', '↓ 0.4 days'], ['7.8 days', 'P95 Time to Assign', '↓ 0.6 days'], ['18.1%', 'Repeat Assignments', '↑ 1.3 pp'], ['2.7%', 'Provider Exits (30 days)', '↑ 0.4 pp'], ['11', 'Single-Provider Dependency (High Risk)', ''],
    ];
    const gap = () => openAskQuestion({ subject: 'Resolve supply gap – recruitment request', section: 'marketplace' });

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace Admin', href: '/admin/marketplace' }, { label: 'Supply Coverage and Fill-Rate Dashboard' }]} title="Supply Coverage and Fill-Rate Dashboard"
            description="Monitor marketplace supply coverage, verified provider capacity, assignment performance, and continuity risks." actions={<Button type="button" onClick={gap}>Resolve Supply Gap</Button>}>
            <Head title="Supply Coverage & Fill-Rate" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">{tiles.map(([v, l, c]) => <div key={l} className="rounded-[8px] border border-parchment-400 bg-white p-3 text-center"><p className="text-lg font-bold">{v}</p><p className="text-[0.6875rem] text-ink-500">{l}</p>{c && <p className={`text-[0.6875rem] ${c.startsWith('↓') ? 'text-risk-600' : 'text-verified-700'}`}>{c}</p>}</div>)}</div>
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-9">
                    <div className="grid gap-5 lg:grid-cols-3">
                        <Card title="1. Coverage by Category">
                            <table className="w-full text-xs"><thead className="text-ink-500"><tr>{['Category', 'Needed', 'Available', 'Coverage', 'Gap'].map((h) => <th key={h} scope="col" className="pb-1 text-left font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">{byCategory.map((c) => <tr key={c.category}><td className="py-1.5">{c.category}</td><td>{c.needed}</td><td>{c.available}</td><td><div className="flex items-center gap-1"><MiniBar value={c.coverage} tone={c.coverage >= 80 ? 'good' : 'warn'} /><span>{c.coverage}%</span></div></td><td className="font-semibold text-risk-600">{c.gap}</td></tr>)}</tbody></table>
                        </Card>
                        <Card title="2. Coverage by Country">
                            <table className="w-full text-xs"><thead className="text-ink-500"><tr>{['Country', 'Eligible', 'Available', 'Fill Rate', 'Status'].map((h) => <th key={h} scope="col" className="pb-1 text-left font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">{COUNTRIES.map(([n, e, a, f]) => <tr key={n}><td className="py-1.5">{n}</td><td>{e}</td><td>{a}</td><td>{f}%</td><td><StatusPill status={f >= 90 ? 'Healthy' : 'At Risk'} tone={f >= 90 ? 'good' : 'warn'} /></td></tr>)}</tbody></table>
                        </Card>
                        <Card title="3. Coverage by Skill">
                            <table className="w-full text-xs"><thead className="text-ink-500"><tr>{['Skill', 'Demand', 'Eligible', 'Fill', 'Risk', 'Action'].map((h) => <th key={h} scope="col" className="pb-1 text-left font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">{SKILLS.map(([n, d, e, , f, r, a]) => <tr key={n}><td className="py-1.5">{n}</td><td>{d}</td><td>{e}</td><td>{f}%</td><td><PriorityPill value={r === 'Low' ? 'low' : r === 'Moderate' ? 'medium' : 'high'} /></td><td><button type="button" onClick={gap} className="text-controlled-600 underline">{a}</button></td></tr>)}</tbody></table>
                        </Card>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="4. Recent Fill Performance (Latest Briefs)">
                            <Table head={['Brief ID', 'Category', 'Country', 'Assigned Provider', 'Qualified Fill', 'Status']} empty={fills.length === 0}>
                                {fills.map((f) => <tr key={f.reference}><td className={td}><span className="font-mono text-xs">{f.reference}</span></td><td className={td}>{f.category}</td><td className={td}>{f.country}</td><td className={td}>{f.provider}</td><td className={td}>{f.qualified ? <span className="flex items-center gap-1 text-verified-700"><CircleCheck className="size-3.5" aria-hidden="true" />Qualified</span> : <span className="flex items-center gap-1 text-ink-500"><CircleX className="size-3.5" aria-hidden="true" />Pending</span>}</td><td className={td}><StatusPill status={f.status.replace(/_/g, ' ')} /></td></tr>)}
                            </Table>
                        </Card>
                        <Card title="5. Supply Gaps Requiring Action">
                            <Table head={['Type', 'Area', 'Details', 'Impact', 'Action']}>
                                {GAPS.map(([t, a, d, i, act, p]) => <tr key={t}><td className={td}>{t}</td><td className={td}>{a}</td><td className={td}>{d}</td><td className={td}><PriorityPill value={p} /></td><td className={td}><button type="button" onClick={gap} className="rounded border border-controlled-500 px-2 py-0.5 text-xs text-controlled-700">{act}</button></td></tr>)}
                            </Table>
                        </Card>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Coverage Summary"><Donut items={[{ label: 'Healthy Coverage', value: 1085 }, { label: 'At Risk', value: 346 }, { label: 'Unfilled / Critical', value: 165 }]} total="1,596" label="Coverage summary" /></Card>
                    <Card title="Continuity Risks (Top 5)"><ol className="space-y-1.5 text-xs">{[['Technical Specialists', 'Coverage Gap', 'high'], ['Automation & AI', 'Low Fill Rate', 'high'], ['Morocco', 'Single-Provider Dependency', 'high'], ['South Africa', 'Expiring Verification', 'medium'], ['Tanzania', 'Geographic Gap', 'medium']].map(([c, t, p], i) => <li key={c} className="flex items-center justify-between gap-2"><span>{i + 1}. {c}<br /><span className="text-ink-400">{t}</span></span><PriorityPill value={p} /></li>)}</ol></Card>
                    <Card title="Operational Notes"><ul className="list-disc space-y-1 pl-4 text-xs text-ink-600"><li>All metrics are evidence-based and refreshed daily.</li><li>Fill rates are measured on eligible provider supply only.</li><li>Provider exits or verification lapses directly affect availability.</li><li>Failed-brief cost is loaded into true CTS.</li></ul></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

Supply.layout = null;
