import { Head } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, Donut, Notice } from '@/Components/Marketplace/ui';
import { ActionMenu, FilterSelect, KpiRow, QueryTabs, SearchBox, Table, td } from '@/Components/Marketplace/AdminKit';
import type { MkProvider, RegisterNav } from '@/types/marketplace';

interface Props { nav: RegisterNav; partners: MkProvider[]; counts: Record<string, number>; professions: string[]; query: { tab: string; q: string; profession: string } }

const URL = '/admin/marketplace/partners/register';
const ACTIONS: Record<string, { key: string; label: string; danger?: boolean; needsNote?: boolean }[]> = {
    verification: [{ key: 'approve', label: 'Approve – CURRENT VERIFIED' }, { key: 'conditions', label: 'Approve with Conditions' }, { key: 'decline', label: 'Decline', danger: true, needsNote: true }],
    active: [{ key: 'reverify', label: 'Re-verify Now' }, { key: 'suspend', label: 'Suspend', danger: true, needsNote: true }],
    active_with_conditions: [{ key: 'activate', label: 'Lift Conditions' }, { key: 'reverify', label: 'Re-verify Now' }, { key: 'suspend', label: 'Suspend', danger: true, needsNote: true }],
    pending_reverification: [{ key: 'activate', label: 'Confirm Current' }, { key: 'suspend', label: 'Suspend', danger: true, needsNote: true }],
    suspended: [{ key: 'reinstate', label: 'Reinstate' }],
    not_found: [{ key: 'reverify', label: 'Re-verify Now' }],
    rejected: [],
};
const vTone = (v: string) => (v?.startsWith('CURRENT_VERIFIED') ? 'good' : v?.startsWith('CURRENT_WITH') ? 'info' : v === 'PENDING_VERIFICATION' ? 'warn' : 'bad');

export default function PartnerRegister({ nav, partners, counts, professions, query }: Props) {
    const c = (k: string) => counts[k] ?? 0;
    const total = counts.all || 1;

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'Admin Console', href: '/admin/marketplace' }, { label: 'Live Partner Register' }]} title="Live Partner Register" description="Current verification status controls routing. Only ACTIVE and matter-eligible partners are available for selection.">
            <Head title="Live Partner Register" />
            <KpiRow items={[{ label: 'Active', value: c('active'), tone: 'good', caption: `${((c('active') / total) * 100).toFixed(1)}% · Routable` }, { label: 'Active with Conditions', value: c('active_with_conditions'), caption: 'Routable with conditions' }, { label: 'Pending Re-verification', value: c('pending_reverification') + c('verification'), tone: 'warn', caption: 'Not routable' }, { label: 'Suspended / Lapsed', value: c('suspended'), tone: 'bad', caption: 'Not routable' }, { label: 'Not Found / Other', value: c('not_found') + c('rejected'), caption: 'Not routable' }, { label: 'Total Partners', value: counts.all, caption: `${professions.length} professions` }]} />
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <div className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <QueryTabs url={URL} query={query} tabs={{ all: 'All', active: 'Active', active_with_conditions: 'With Conditions', verification: 'New Applications', pending_reverification: 'Pending Re-verification', suspended: 'Suspended', not_found: 'Not Found' }} counts={counts} />
                        <div className="flex flex-wrap items-end gap-3"><FilterSelect url={URL} query={query} name="profession" label="Profession" options={professions} /><SearchBox url={URL} query={query} placeholder="Search by name, firm or registration no…" /></div>
                    </div>
                    <div className="mt-4">
                        <Table head={['Partner / Firm', 'Practitioner', 'Profession', 'Specialisation', 'Jurisdiction', 'Verification Status', 'Panel State', 'Next Verification Due', 'Indemnity', 'Actions']} empty={partners.length === 0}>
                            {partners.map((p) => {
                                const v = p.profile.verification ?? 'PENDING_VERIFICATION';
                                const d = p.nextReviewDays;
                                return (
                                    <tr key={p.slug}>
                                        <td className={td}><span className="font-semibold text-controlled-700 underline">{p.name}</span><p className="text-xs text-ink-500">{p.code}</p></td>
                                        <td className={td}>{p.profile.practitioner}<p className="text-xs text-ink-500">{p.profile.professional_registration}</p></td>
                                        <td className={td}>{p.profession}</td><td className={td}>{p.category}</td><td className={td}>{p.country}</td>
                                        <td className={td}><StatusPill status={v.replace(/_/g, ' ')} tone={vTone(v)} /></td>
                                        <td className={td}><StatusPill status={p.profile.panel ?? 'INACTIVE'} tone={p.profile.panel === 'ACTIVE' ? 'good' : 'neutral'} /></td>
                                        <td className={td}>{p.nextReview ?? '—'}{d !== null && <span className={`block text-xs ${d < 0 ? 'text-risk-600' : d <= 30 ? 'text-attested-700' : 'text-verified-700'}`}>{d} days</span>}</td>
                                        <td className={td}><StatusPill status={p.profile.indemnity ?? '—'} tone={p.profile.indemnity === 'CURRENT' ? 'good' : 'bad'} /></td>
                                        <td className={td}><ActionMenu url={`/admin/marketplace/providers/${p.slug}/status`} actions={ACTIONS[p.status] ?? []} /></td>
                                    </tr>
                                );
                            })}
                        </Table>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Panel Eligibility Summary"><Donut items={[{ label: 'Active', value: c('active') }, { label: 'Active w/ Conditions', value: c('active_with_conditions') }, { label: 'Pending Re-verification', value: c('pending_reverification') + c('verification') }, { label: 'Suspended / Lapsed', value: c('suspended') }, { label: 'Not Found / Other', value: c('not_found') + c('rejected') }]} total={counts.all} label="Panel eligibility" /></Card>
                    <Card title="Routing Control"><ul className="space-y-1.5 text-xs">{['Only ACTIVE or ACTIVE WITH CONDITIONS partners are eligible for routing.', 'Verification must be current before selection.', 'Lapsed, suspended or not found partners are automatically excluded.'].map((x) => <li key={x} className="flex gap-1.5"><CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{x}</li>)}</ul></Card>
                    <Card title="Expiry Alerts (Next 30 Days)"><ul className="space-y-1 text-xs"><li className="flex justify-between"><span>Verification due ≤ 30 days</span><strong>{partners.filter((p) => p.nextReviewDays !== null && p.nextReviewDays >= 0 && p.nextReviewDays <= 30).length}</strong></li><li className="flex justify-between"><span>Overdue</span><strong>{partners.filter((p) => p.nextReviewDays !== null && p.nextReviewDays < 0).length}</strong></li></ul></Card>
                </aside>
            </div>
            <Notice tone="info" className="mt-5">Routing reads the current routing state and verification evidence, not record existence. Approving a new application sets CURRENT VERIFIED and makes the firm routable for conflict-check requests.</Notice>
        </AdminShell>
    );
}

PartnerRegister.layout = null;
