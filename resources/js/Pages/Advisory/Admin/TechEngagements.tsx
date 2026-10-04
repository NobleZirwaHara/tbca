import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Check, Minus, X } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Form';
import { SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, CheckList, Stat, zar } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Setting { id: number; key: string; label: string; value: string; updated: string }
interface Eng extends TechHeader { value: number; uat: { defects_open?: number; checks?: { performance?: boolean; security?: boolean } } | null; gates: { number: number; status: string }[] }
interface Props { settings: Setting[]; engagements: Eng[]; kpis: Record<string, number>; roles: [string, string[]][] }

export default function TechEngagements({ settings, engagements, kpis, roles }: Props) {
    const [tab, setTab] = useState('engagements');
    const [edit, setEdit] = useState<Record<number, string>>({});
    const act = (ref: string, action: string) => router.post(`/admin/advisory/tech/engagements/${ref}`, { action }, { preserveScroll: true });
    const icon = (v: string) => (v === 'y' ? <Check className="mx-auto size-4 text-verified-500" /> : v === 'p' ? <Minus className="mx-auto size-4 text-attested-500" /> : <X className="mx-auto size-4 text-risk-500" />);
    return (
        <AdminShell title="Admin Engagement Control" description="Configure settings, permissions, notifications and governance for Technology Solutions engagements.">
            <Head title="Admin Engagement Control" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Active Engagements" value={kpis.active} tone="good" />
                <Stat label="Draft Engagements" value={kpis.draft} sub="Awaiting completion" />
                <Stat label="Pending Signature" value={kpis.signature} sub="Client signature required" />
                <Stat label="Overdue Actions" value={kpis.overdue} sub="Require attention" tone="bad" />
                <Stat label="Auto-Renewals" value={kpis.renewals} sub="Next 30 days" />
                <Stat label="Engagement Value" value={zar(kpis.value)} sub="Ledger T incl. VAT" />
            </div>
            <Tabs className="mt-4" tabs={[{ key: 'engagements', label: 'Engagements' }, { key: 'settings', label: 'Engagement Settings' }, { key: 'roles', label: 'User Permissions' }]} value={tab} onChange={setTab} />
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    {tab === 'engagements' && (
                        <Card title="Engagements">
                            <SimpleTable columns={['Reference', 'Client | Tower', 'Stage', 'Gates', 'Status', 'Value', 'UAT', 'Ops actions']}
                                rows={engagements.map((e) => [<Link href={`/technology-solutions/workspace/${e.reference}`} className="font-mono text-xs underline">{e.reference}</Link>, <span className="text-xs">{e.organisation}<br />{e.tower}</span>, e.stage_name, <span className="flex gap-0.5">{e.gates.map((g) => <span key={g.number} title={g.status} className={`size-3 rounded-full ${g.status === 'approved' ? 'bg-verified-500' : g.status === 'presented' || g.status === 'approved_not_paid' ? 'bg-gold-500' : g.status === 'declined' ? 'bg-risk-500' : 'bg-parchment-400'}`} />)}</span>, <StatusPill status={e.status} />, zar(e.value), <span className="text-xs">Defects {e.uat?.defects_open ?? 0}</span>,
                                    <span className="flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={() => act(e.reference, 'resolve_defects')}>Resolve defects</Button><Button size="sm" variant="outline" onClick={() => act(e.reference, 'pass_checks')}>Pass perf/security</Button><Button size="sm" variant="ghost" onClick={() => act(e.reference, 'meter')}>+ usage</Button><Button size="sm" variant="ghost" onClick={() => act(e.reference, 'present_gate')}>Re-present gate</Button></span>])} />
                        </Card>
                    )}
                    {tab === 'settings' && (
                        <Card title="Engagement Configuration">
                            <SimpleTable columns={['Setting', 'Current Value', 'Last Updated', '']} rows={settings.map((s) => [s.label, <Input aria-label={s.label} value={edit[s.id] ?? s.value} onChange={(e) => setEdit({ ...edit, [s.id]: e.target.value })} className="h-8 w-56" />, s.updated, <Button size="sm" variant="outline" disabled={(edit[s.id] ?? s.value) === s.value} onClick={() => router.post(`/admin/advisory/tech/settings/${s.id}`, { value: edit[s.id] }, { preserveScroll: true })}>Save</Button>])} />
                            <p className="mt-2 text-xs text-ink-500">Read-only period, dispute SLA and meter warning threshold are used live by the client portal and WhatsApp flow.</p>
                        </Card>
                    )}
                    {tab === 'roles' && (
                        <Card title="Role-Based Permissions Overview">
                            <SimpleTable columns={['Role', 'Engagements', 'Documents', 'Billing', 'Reports', 'Admin']} rows={roles.map(([r, p]) => [r, ...p.map((v) => icon(v))])} />
                            <p className="mt-2 text-xs text-ink-500">Permissions are applied in real-time. Changes are logged.</p>
                        </Card>
                    )}
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="System Health"><CheckList items={['All systems operational', 'Audit logging: Active', 'Server-side payment verification: Active']} /></Card>
                    <Card title="Compliance & Governance"><CheckList items={['POPIA Compliant', 'No cross-ledger totals in client views', 'WhatsApp is notification-only', 'No silent renewal']} /></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

TechEngagements.layout = null;
