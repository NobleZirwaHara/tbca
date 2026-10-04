import { Head, Link } from '@inertiajs/react';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { KpiRow, Table, td } from '@/Components/Marketplace/AdminKit';
import { zar } from '@/Components/Marketplace/ui';
import type { MkBrief, RegisterNav } from '@/types/marketplace';

export default function Briefs({ nav, briefs }: { nav: RegisterNav; briefs: (MkBrief & { proposals: number })[] }) {
    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace', href: '/admin/marketplace' }, { label: 'Brief Triage' }]} title="Brief Triage & Matching" description="Submitted buyer briefs, their commercial envelope and floor status. Open a brief to triage requirements and shortlist matched providers.">
            <Head title="Brief Triage" />
            <KpiRow items={[{ label: 'Submitted Briefs', value: briefs.length }, { label: 'Awaiting Buyer Confirmation', value: briefs.filter((b) => b.status === 'awaiting_buyer_confirmation').length, tone: 'warn' }, { label: 'Open to Providers', value: briefs.filter((b) => b.openToProviders).length }, { label: 'Assigned', value: briefs.filter((b) => b.status === 'assigned').length, tone: 'good' }, { label: 'Below Floor', value: briefs.filter((b) => b.scope.floor?.status === 'FAIL').length, tone: 'bad' }]} />
            <div className="mt-5">
                <Table head={['Brief', 'Client', 'Category', 'Priority', 'Ledgers A / B / C', 'Floor', 'Proposals', 'Status', '']} empty={briefs.length === 0}>
                    {briefs.map((b) => (
                        <tr key={b.reference}>
                            <td className={td}><span className="font-mono text-xs">{b.reference}</span><p className="font-semibold text-ink-900">{b.title}</p></td>
                            <td className={td}>{b.clientName}</td><td className={td}>{b.categoryLabel}</td><td className={td}>{b.priorityScore ?? '—'}/100</td>
                            <td className={td}>{b.scope.ledgers ? `${zar(b.scope.ledgers.a)} / ${zar(b.scope.ledgers.b)} / ${zar(b.scope.ledgers.c)}` : '—'}</td>
                            <td className={td}><StatusPill status={b.scope.floor?.status ?? '—'} tone={b.scope.floor?.status === 'PASS' ? 'good' : 'bad'} /></td>
                            <td className={td}>{b.proposals}</td><td className={td}><StatusPill status={b.statusLabel} /></td>
                            <td className={td}><Link href={`/admin/marketplace/briefs/${b.reference}/triage`} className="rounded border border-parchment-500 px-2 py-1 text-xs font-medium whitespace-nowrap hover:border-gold-500">Triage</Link></td>
                        </tr>
                    ))}
                </Table>
            </div>
        </AdminShell>
    );
}

Briefs.layout = null;
