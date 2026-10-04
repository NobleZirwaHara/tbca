import { Link } from '@inertiajs/react';
import { CheckCircle2, Circle, Download, Eye, FileText, FolderLock, Lock, MessageSquare, Scale, ShieldCheck, Upload, Users } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, GoldLink, RISK_COLORS, Ring, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdCasePageProps, DdEvent, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    documents: { id: number; original_name: string; category: string; uploaded_by: string | null; created_at: string }[];
    activity: { uploaded: number; viewed: number; events: number };
    events: DdEvent[];
    lifecycle: { label: string; state: string }[];
    subscription: { reference: string; plan_name: string; plan_code: string; billing_cycle: string; status: string; alert_allowance: number } | null;
    alertCounts: Record<string, number> | null;
    report: DdReportMeta | null;
}

/** DD-050 VDR-Embedded Due Diligence Case: evidence is linked inside the deal-room boundary, not copied out. */
export default function Vdr(props: Props) {
    const { case: c, documents, activity, events, lifecycle, subscription, alertCounts, report } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const done = lifecycle.filter((l) => l.state === 'done').length;
    const room = `VDR-ROOM-${c.reference.slice(-5)}`;

    return (
        <CaseLayout
            page={props}
            active="vdr"
            wide
            role="VDR Project Lead"
            title="VDR-Embedded Due Diligence Case"
            subtitle="Due diligence case running inside the Virtual Data Room."
            description="All case activity, documents and communications are controlled within the VDR. No data leaves the room."
            bandNote="DD credits apply inside the VDR — no double charging."
            actions={<ButtonLink href="/virtual-deal-room" variant="outline-light"><FolderLock className="size-4" aria-hidden="true" /> Open VDR Room</ButtonLink>}
        >
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
                <Card title="VDR integration">
                    <dl className="space-y-1 text-xs">{[['VDR Provider', 'TBCA Secure VDR'], ['Room Name', `${(c.clientName ?? 'Client').split(' ')[0]}-${c.subjectName.split(' ')[0]} Due Diligence Room`], ['Room ID', room], ['Access level', 'Project Lead'], ['Your permissions', 'Full due diligence management']].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                </Card>
                <Card title="Case overview">
                    <dl className="space-y-1 text-xs">{[['Case ID', c.reference], ['Subject', c.subjectName], ['Report', report ? `${report.title} ${report.version}` : 'Not yet released'], ['Status', c.statusLabel]].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                    <ButtonLink href={base} size="sm" variant="outline" className="mt-3 w-full">View Case Dashboard</ButtonLink>
                </Card>
                <Card title="Case progress">
                    <div className="flex items-center gap-3"><Ring value={Math.round((done / lifecycle.length) * 100)} size={84} tone="good" /><ul className="space-y-0.5 text-[0.6875rem]">{lifecycle.slice(3).map((l) => <li key={l.label} className="flex items-center gap-1">{l.state === 'done' ? <CheckCircle2 className="size-3 text-verified-500" /> : <Circle className="size-3 text-ink-300" />}{l.label}</li>)}</ul></div>
                </Card>
                <Card title="VDR document activity">
                    <dl className="space-y-1.5 text-xs">{[[Upload, 'Documents uploaded', activity.uploaded], [Eye, 'Report views & downloads', activity.viewed], [FileText, 'Case events logged', activity.events]].map(([I, k, v]) => { const Icon = I as typeof Eye; return <div key={k as string} className="flex items-center gap-2"><Icon className="size-4 text-gold-600" aria-hidden="true" /><dt className="flex-1">{k as string}</dt><dd className="font-semibold">{v as number}</dd></div>; })}</dl>
                </Card>
                <Card title="Recent communications">
                    <ul className="space-y-2 text-xs">{events.map((e) => <li key={e.code} className="flex gap-2"><MessageSquare className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span className="flex-1">{e.description}</span><span className="text-ink-400">{shortDate(e.at)}</span></li>)}</ul>
                </Card>
            </div>
            <div className="grid gap-4 xl:grid-cols-12">
                <Card title="Key case documents in VDR" className="xl:col-span-6" action={<GoldLink href={`${base}/evidence`}>All documents</GoldLink>}>
                    <table className="w-full text-left text-xs">
                        <thead className="text-ink-500"><tr><th className="py-1">Document name</th><th>Type</th><th>Uploaded</th><th>Uploaded by</th><th /></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {documents.map((d) => <tr key={d.id}><td className="py-1.5">{d.original_name}</td><td className="capitalize">{d.category}</td><td>{shortDate(d.created_at)}</td><td>{d.uploaded_by}</td><td><a href={`${base}/documents/${d.id}`} aria-label={`Download ${d.original_name}`}><Download className="size-4 text-gold-700" /></a></td></tr>)}
                            {documents.length === 0 && <tr><td colSpan={5} className="py-3 text-ink-500">No documents linked yet.</td></tr>}
                        </tbody>
                    </table>
                </Card>
                <Card title="Monitoring & alerts summary" className="xl:col-span-3">
                    {alertCounts ? (
                        <div className="grid grid-cols-2 gap-2">{Object.entries(alertCounts).map(([l, n]) => <div key={l} className="rounded-[8px] border p-2" style={{ borderColor: RISK_COLORS[l] }}><p className="text-xs capitalize" style={{ color: RISK_COLORS[l] }}>{l} alerts</p><p className="text-xl font-bold">{n}</p></div>)}</div>
                    ) : <p className="text-xs text-ink-500">Monitoring not active. <Link href={`${base}/monitoring-offer`} className="text-gold-700">View offer</Link></p>}
                </Card>
                <Card title="Subscription & usage" className="xl:col-span-3">
                    {subscription ? <dl className="space-y-1 text-xs">{[['Plan', subscription.plan_name], ['Fee code', subscription.plan_code], ['Billing cycle', subscription.billing_cycle], ['Status', subscription.status], ['Alert allowance', `${subscription.alert_allowance}`]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="capitalize">{v}</dd></div>)}</dl> : <p className="text-xs text-ink-500">No subscription.</p>}
                </Card>
            </div>
            <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-3 xl:grid-cols-6">
                {[[ShieldCheck, 'Secure inside the VDR'], [Lock, 'Access controlled'], [FolderLock, 'No data leaves'], [FileText, 'Audit ready'], [Users, 'Independent reviews'], [Scale, 'Professional use only']].map(([I, t]) => { const Icon = I as typeof Lock; return <p key={t as string} className="flex items-center gap-2"><Icon className="size-5 text-gold-600" aria-hidden="true" /><strong>{t as string}</strong></p>; })}
            </div>
        </CaseLayout>
    );
}
