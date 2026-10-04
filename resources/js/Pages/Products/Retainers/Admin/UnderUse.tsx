import { useState } from 'react';
import { router } from '@inertiajs/react';
import { AlarmClock, AlertTriangle, Bell, Clock, Download, PieChart, RefreshCw, Send } from 'lucide-react';
import { Panel, SimpleTable, StatusPill, Progress } from '@/Components/ui/Kit';
import { ActionButton, CheckList, Notice } from '@/Components/Products/Shared';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, Donut, Legend, MiniSelect, StatTile, applyFilters, fmtDate, hrs, zar } from '@/Components/Products/Retainers/ui';

interface AlertRow {
    id: number;
    level: string;
    status: string;
    utilisation: number;
    code: string;
    client: string;
    used: number;
    allowance: number;
    days_left: number;
    fee: number;
    adviser: string;
    last_activity: string | null;
    notice_sent_at: string | null;
}

interface Props {
    kpis: { total: number; at_risk: number; moderate: number; low: number; avg: number };
    alerts: AlertRow[];
    filters: { status: string; level: string; owner: string; q: string };
    owners: string[];
    profile: { label: string; threshold: number }[];
    bands: { high: number; healthy: number; moderate: number; under: number };
    active: number;
}

const PATH = '/admin/products/retainers/under-use';
const LEVEL = { at_risk: ['At Risk', 'bad'], moderate: ['Moderate', 'warn'], low: ['Low', 'good'] } as const;

export default function UnderUse({ kpis, alerts, filters, owners, profile, bands, active }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [bulk, setBulk] = useState('notice');
    const set = (k: string, v: string) => applyFilters(PATH, { ...filters, [k]: v });
    const pct = (n: number) => (active ? Math.round((n / active) * 100) : 0);

    return (
        <AdminShell
            title="Under-Use Alert Queue"
            description="View and act on retainers where utilisation is below the policy threshold. Proactive engagement helps clients realise full value. Alerts cannot be suppressed."
            actions={<ActionButton href={`${PATH}/detect`} tone="ink"><RefreshCw className="size-3.5" aria-hidden="true" />Run approved profile</ActionButton>}
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <StatTile icon={Bell} tone="purple" label="Total Under-Use Alerts" value={kpis.total} unit="retainers" caption="Across all accounts" />
                <StatTile icon={PieChart} tone="bad" label="At Risk (<50% utilisation)" value={kpis.at_risk} unit="retainers" caption="Urgent attention" />
                <StatTile icon={AlertTriangle} tone="gold" label="Moderate (50% – 75%)" value={kpis.moderate} unit="retainers" caption="Monitor closely" />
                <StatTile icon={Clock} tone="good" label="Low (75% – 90%)" value={kpis.low} unit="retainers" caption="Track utilisation" />
                <StatTile icon={AlarmClock} tone="info" label="Avg. Under-Use" value={`${kpis.avg}%`} caption="utilisation across alerts" />
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <MiniSelect label="Status" value={filters.status} onChange={(v) => set('status', v)} options={[{ value: '', label: 'All' }, ...['new', 'in_progress', 'monitoring', 'escalated', 'resolved'].map((s) => ({ value: s, label: s.replace('_', ' ') }))]} />
                <MiniSelect label="Alert Level" value={filters.level} onChange={(v) => set('level', v)} options={[{ value: '', label: 'All Levels' }, { value: 'at_risk', label: 'At Risk' }, { value: 'moderate', label: 'Moderate' }, { value: 'low', label: 'Low' }]} />
                <MiniSelect label="Owner / Adviser" value={filters.owner} onChange={(v) => set('owner', v)} options={[{ value: '', label: 'All' }, ...owners.map((o) => ({ value: o, label: o }))]} />
                <label className="flex flex-col gap-1 text-[0.6875rem] font-medium text-ink-500">Search<input defaultValue={filters.q} onKeyDown={(e) => e.key === 'Enter' && set('q', (e.target as HTMLInputElement).value)} placeholder="Search retainers, clients..." className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" /></label>
                <button type="button" onClick={() => window.print()} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-referenced-700 px-4 text-sm font-semibold text-white"><Download className="size-4" aria-hidden="true" />Export Queue</button>
            </div>

            <Panel title="Alert Queue" className="mt-4">
                <SimpleTable
                    columns={[<input key="all" type="checkbox" aria-label="Select all" checked={selected.length === alerts.length && alerts.length > 0} onChange={(e) => setSelected(e.target.checked ? alerts.map((a) => a.id) : [])} />, 'Alert Level', 'Retainer', 'Client', 'Utilisation', 'Used / Allowance', 'Days to Period End', 'Monthly Fee (excl. VAT)', 'Primary Adviser', 'Last Activity', 'Status', 'Actions']}
                    rows={alerts.map((a) => {
                        const [label, tone] = LEVEL[a.level as keyof typeof LEVEL] ?? [a.level, 'neutral'];
                        return [
                            <input key="c" type="checkbox" aria-label={`Select ${a.code}`} checked={selected.includes(a.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, a.id] : selected.filter((x) => x !== a.id))} />,
                            <StatusPill key="l" status={label} tone={tone} />,
                            <span key="r" className="font-mono text-xs text-referenced-700">{a.code}</span>,
                            a.client,
                            <div key="u" className="w-24"><span className="text-xs font-semibold">{Math.round(a.utilisation)}%</span><Progress value={a.utilisation} tone={a.utilisation < 50 ? 'bad' : a.utilisation < 75 ? 'gold' : 'good'} /></div>,
                            `${hrs(a.used)} h / ${hrs(a.allowance)} h`,
                            a.days_left,
                            zar(a.fee),
                            a.adviser,
                            fmtDate(a.last_activity),
                            <StatusPill key="s" status={a.status} tone={a.status === 'new' ? 'bad' : a.status === 'escalated' ? 'warn' : undefined} />,
                            <span key="a" className="flex flex-wrap gap-1">
                                {a.status !== 'resolved' && <ActionButton href={`${PATH}/${a.id}`} data={{ action: 'notice' }} tone="gold"><Send className="size-3" aria-hidden="true" />Send Neutral Review</ActionButton>}
                                {a.status !== 'escalated' && a.status !== 'resolved' && <ActionButton href={`${PATH}/${a.id}`} data={{ action: 'escalated' }}>Escalate</ActionButton>}
                                <ActionButton href={`${PATH}/${a.id}`} data={{ action: 'suppress' }} tone="danger" confirm="Suppressing an under-use alert for a commercial reason is prohibited and will open a P0 incident. Continue?">Suppress</ActionButton>
                            </span>,
                        ];
                    })}
                    empty="No alerts match these filters."
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor="bulk">Bulk action</label>
                    <select id="bulk" value={bulk} onChange={(e) => setBulk(e.target.value)} className="h-9 rounded-[4px] border border-parchment-500 px-2 text-sm">
                        <option value="notice">Send neutral review</option>
                        <option value="in_progress">Mark in progress</option>
                        <option value="monitoring">Mark monitoring</option>
                        <option value="escalated">Escalate</option>
                        <option value="resolved">Resolve</option>
                    </select>
                    <button type="button" disabled={selected.length === 0} onClick={() => router.post(`${PATH}/bulk`, { ids: selected, action: bulk }, { preserveScroll: true, onSuccess: () => setSelected([]) })} className="h-9 rounded-[4px] bg-referenced-700 px-4 text-sm font-semibold text-white disabled:opacity-50">Update Status ({selected.length})</button>
                </div>
            </Panel>

            <div className="mt-5 grid gap-5 xl:grid-cols-4">
                <Panel title="Why These Alerts?">
                    <p className="-mt-2 mb-2 text-xs text-ink-500">Alerts are raised when utilisation is below policy thresholds based on days elapsed in the period.</p>
                    <SimpleTable columns={['Days Elapsed in Period', 'Under-Use Threshold']} rows={profile.map((p) => [p.label, `< ${p.threshold}%`])} />
                </Panel>
                <Panel title="Recommended Actions">
                    <CheckList items={['Review allowance and recent usage with the client.', 'Confirm upcoming deliverables or milestones.', 'Offer Continue, Right-size, Pause and Cancel with equal weight.', 'Document conversation and next steps.']} />
                </Panel>
                <Panel title="Active Book by Utilisation">
                    <div className="flex flex-wrap items-center gap-3">
                        <Donut size={120} stroke={18} segments={[{ value: bands.high, color: C.green }, { value: bands.healthy, color: C.blue }, { value: bands.moderate, color: C.amber }, { value: bands.under, color: C.red }]} />
                        <div className="min-w-0 flex-1"><Legend items={[{ color: C.green, label: 'High (≥90%)', value: `${bands.high} (${pct(bands.high)}%)` }, { color: C.blue, label: 'Healthy (75–90%)', value: `${bands.healthy} (${pct(bands.healthy)}%)` }, { color: C.amber, label: 'Moderate (50–75%)', value: `${bands.moderate} (${pct(bands.moderate)}%)` }, { color: C.red, label: 'Under-Use (<50%)', value: `${bands.under} (${pct(bands.under)}%)` }]} /></div>
                    </div>
                </Panel>
                <Notice tone="purple" title="No suppression right">Sales cannot suppress, overwrite or delay an under-use alert. Attempts are denied and logged as P0 governance incidents.</Notice>
            </div>
        </AdminShell>
    );
}

UnderUse.layout = null;
