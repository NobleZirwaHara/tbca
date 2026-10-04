import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Lock, ShieldCheck, Unlock } from 'lucide-react';
import { AccessChip, Bars, Box, Donut, Legend, Stat, Status, Table, label } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';
import type { ResourceCard } from '@/types/insights';

type Row = ResourceCard & { protected: boolean; boundaryRule: string | null; updated: string; alert: boolean; slug: string };
interface Props {
    kpis: { total: number; free: number; monetised: number; protected: number; alerts: number };
    classification: { label: string; count: number }[];
    share: number;
    rows: Row[];
}

export default function Protected({ kpis, classification, share, rows }: Props) {
    return (
        <ResourceAdmin title="Monetisation Boundary / Protected Catalogue" description="Define and enforce the boundary between free knowledge resources and monetised offerings. Ensure compliance, protect professional services, and maintain trust.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <Stat label="Total Resources" value={kpis.total} icon={<ShieldCheck className="size-5" />} />
                <Stat label="Free Resources" value={kpis.free} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Monetised Resources" value={kpis.monetised} tone="gold" icon={<Lock className="size-5" />} />
                <Stat label="Protected Items" value={kpis.protected} caption="High sensitivity" />
                <Stat label="Boundary Alerts" value={kpis.alerts} tone="red" icon={<AlertTriangle className="size-5" />} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <Box title="Monetisation Boundary Overview"><div className="flex items-center gap-4"><Donut label={`${share}%`} sub="Monetised" size={120} segments={[{ value: kpis.free, color: '#2f9e5b' }, { value: kpis.monetised, color: '#d6a32e' }]} /><Legend items={[{ label: 'Free Knowledge Resources', value: kpis.free, color: '#2f9e5b' }, { label: 'Monetised Offerings', value: kpis.monetised, color: '#d6a32e' }, { label: 'Protected Professional', value: kpis.protected, color: '#8b5cf6' }, { label: 'Boundary Alerts', value: kpis.alerts, color: '#d64545' }]} /></div></Box>
                <Box title="Resource Classification by Access Type"><Bars items={classification.map((c) => ({ label: c.label, value: c.count }))} /></Box>
                <Box title="Boundary Compliance Status">
                    <p className="flex items-center gap-2 font-semibold">{kpis.alerts ? <AlertTriangle className="size-5 text-attested-500" /> : <CheckCircle2 className="size-5 text-verified-500" />}{kpis.alerts ? 'Review required' : 'Compliant'}</p>
                    <ul className="mt-2 space-y-1.5 text-xs"><li className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />Boundary rules active</li><li className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />Protected catalogue enforced ({kpis.protected} items)</li><li className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{kpis.alerts} alerts requiring review</li></ul>
                </Box>
            </div>
            <Box className="mt-4" title="Boundary Rules & Protected Catalogue">
                <Table head={['Resource Title', 'Type', 'Access Type', 'Boundary Rule', 'Protected', 'Last Reviewed', 'Status', 'Action']}
                    rows={rows.map((r) => [<strong key="t">{r.title}</strong>, label(r.type), <AccessChip key="a" label={r.accessLabel} />, <span key="b" className="text-xs">{r.boundaryRule}</span>, r.protected ? 'Yes' : 'No', r.reviewedAt ?? '—', <Status key="s" value={r.alert ? 'alert' : r.protected ? 'protected' : 'compliant'} />,
                        <button key="x" type="button" onClick={() => router.post(`/admin/insights/resources/protected/${r.slug}`, {}, { preserveScroll: true })} className="flex items-center gap-1 rounded border px-2 py-0.5 text-xs">{r.protected ? <><Unlock className="size-3.5" />Unprotect</> : <><Lock className="size-3.5" />Protect</>}</button>])} />
            </Box>
        </ResourceAdmin>
    );
}
