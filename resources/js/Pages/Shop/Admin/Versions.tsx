import { Link } from '@inertiajs/react';
import { CheckCircle2, FileCheck, ScrollText, TriangleAlert } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, fmtDate, Kpi, KpiGrid } from '@/Components/Shop/AdminKit';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';

interface Row { slug: string; code: string; name: string; act: string; version: string; qa: string; rights: string; licence_scope: string | null; state: string | null; updated: string | null }

export default function Versions({ rows, mode }: { rows: Row[]; mode: 'versions' | 'licences' }) {
    const licences = mode === 'licences';
    const passed = rows.filter((r) => (licences ? r.rights === 'cleared' : r.qa === 'passed')).length;

    return (
        <AdminShell
            title={licences ? 'Licence & IP Console' : 'ProductVersion Control'}
            description={licences ? 'Confirm rights and exact licence scope. Uncleared rights force Do-Not-List (LS-06).' : 'Creation QA per ProductVersion. A failed QA puts the product on Honest Hold (LS-05) until it passes.'}
            badge="Governance"
        >
            <KpiGrid cols={4}>
                <Kpi icon={licences ? <ScrollText className="size-5" /> : <FileCheck className="size-5" />} label="Product Masters" value={rows.length} tone="info" />
                <Kpi icon={<CheckCircle2 className="size-5" />} label={licences ? 'Rights Cleared' : 'Creation QA Passed'} value={passed} tone="good" />
                <Kpi icon={<TriangleAlert className="size-5" />} label={licences ? 'Not Cleared' : 'Pending / Failed'} value={rows.length - passed} tone="bad" />
                <Kpi icon={<FileCheck className="size-5" />} label="Listed (not LS-06)" value={rows.filter((r) => r.state !== 'LS-06').length} />
            </KpiGrid>
            <SimpleTable
                columns={licences ? ['Code', 'Product', 'Act', 'Licence Scope', 'Rights Status', 'Listing State', 'Updated', 'Actions'] : ['Code', 'Product', 'Act', 'ProductVersion', 'Creation QA', 'Listing State', 'Updated', 'Actions']}
                rows={rows.map((r) => [
                    <span key="c" className="font-mono text-xs">{r.code}</span>,
                    <Link key="n" href={`/admin/shop/product-master?product=${r.slug}`} className="font-medium hover:text-gold-700">{r.name}</Link>,
                    r.act,
                    licences ? (r.licence_scope ?? 'Standard') : r.version,
                    licences ? <StatusPill key="r" status={r.rights.replace('_', ' ')} tone={r.rights === 'cleared' ? 'good' : 'bad'} /> : <StatusPill key="q" status={r.qa} />,
                    <StatusPill key="s" status={r.state ?? '-'} tone={r.state === 'LS-05' || r.state === 'LS-06' ? 'bad' : 'good'} />,
                    <span key="u" className="text-xs">{fmtDate(r.updated)}</span>,
                    <div key="a" className="flex flex-wrap gap-1">
                        {licences ? (
                            <>
                                <ActionButton href={`/admin/shop/licences/${r.slug}/rights`} data={{ rights: 'cleared' }} tone="good" disabled={r.rights === 'cleared'}>Clear rights</ActionButton>
                                <ActionButton href={`/admin/shop/licences/${r.slug}/rights`} data={{ rights: 'not_cleared', licence_scope: r.licence_scope ?? 'L4' }} tone="bad" disabled={r.rights !== 'cleared'} confirm="Mark rights as not cleared? The product will be removed from the shop (LS-06).">Hold rights</ActionButton>
                            </>
                        ) : (
                            <>
                                <ActionButton href={`/admin/shop/versions/${r.slug}/qa`} data={{ qa: 'passed' }} tone="good" disabled={r.qa === 'passed'}>Pass QA</ActionButton>
                                <ActionButton href={`/admin/shop/versions/${r.slug}/qa`} data={{ qa: 'pending' }} disabled={r.qa === 'pending'}>Pending</ActionButton>
                                <ActionButton href={`/admin/shop/versions/${r.slug}/qa`} data={{ qa: 'failed' }} tone="bad" disabled={r.qa === 'failed'} confirm="Fail Creation QA? The product goes on Honest Hold.">Fail QA</ActionButton>
                            </>
                        )}
                    </div>,
                ])}
            />
        </AdminShell>
    );
}

Versions.layout = null;
