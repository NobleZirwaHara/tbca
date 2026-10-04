import { Head, Link } from '@inertiajs/react';
import { CircleCheck, Circle, PauseCircle, ShieldCheck, TriangleAlert, Users, Clock } from 'lucide-react';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { MiniBar, Stars } from '@/Components/Marketplace/ui';
import { ActionMenu, QueryTabs, SearchBox, Table, td } from '@/Components/Marketplace/AdminKit';
import type { MkProvider, RegisterNav } from '@/types/marketplace';

interface Props {
    nav: RegisterNav;
    providers: MkProvider[];
    counts: Record<string, number>;
    query: { tab: string; q: string };
    actions: Record<string, { to: string; label: string }>;
}

const URL = '/admin/marketplace/providers';
const allowed: Record<string, string[]> = {
    applied: ['action', 'decline'], verification: ['action', 'decline'], action_required: ['decline'], agreement_ready: ['suspend'], verified: ['suspend'],
    active: ['suspend', 'reverify', 'action'], active_with_conditions: ['activate', 'suspend', 'reverify'], pending_reverification: ['activate', 'suspend'], suspended: ['reinstate'], rejected: [],
};

export default function Providers({ nav, providers, counts, query, actions }: Props) {
    const total = counts.all || 1;
    const kpi: [typeof Users, string, number, string][] = [[Users, 'Total Providers', counts.all, 'All registered providers'], [ShieldCheck, 'Verified Providers', counts.verified, `${((counts.verified / total) * 100).toFixed(1)}% of total`], [Clock, 'In Verification', counts.verification, `${((counts.verification / total) * 100).toFixed(1)}% of total`], [TriangleAlert, 'Action Required', counts.action_required, `${((counts.action_required / total) * 100).toFixed(1)}% of total`], [PauseCircle, 'Suspended', counts.suspended, `${((counts.suspended / total) * 100).toFixed(1)}% of total`]];

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace', href: '/admin/marketplace' }, { label: 'Provider Network' }, { label: 'Provider Verification' }]} title="Provider Verification Register" description="Verification status, compliance checks and document evidence for all marketplace providers.">
            <Head title="Provider Verification Register" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{kpi.map(([I, k, v, c]) => <div key={k} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-4"><I className="size-9 rounded-[6px] bg-parchment-200 p-2 text-controlled-600" aria-hidden="true" /><div><p className="text-xs text-ink-500">{k}</p><p className="text-2xl font-bold">{v}</p><p className="text-[0.6875rem] text-ink-400">{c}</p></div></div>)}</div>
            <div className="mt-5 rounded-[8px] border border-parchment-400 bg-white p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <QueryTabs url={URL} query={query} tabs={{ all: 'All Providers', verified: 'Verified', verification: 'In Verification', action_required: 'Action Required', suspended: 'Suspended', rejected: 'Rejected' }} counts={counts} />
                    <SearchBox url={URL} query={query} placeholder="Search provider or code…" />
                </div>
                <div className="mt-4">
                    <Table head={['Provider Name', 'Category', 'Verification Status', 'Overall Score', 'Compliance Checks', 'Documents Verified', 'Last Verified', 'Next Review', 'Actions']} empty={providers.length === 0}>
                        {providers.map((p) => {
                            const checks = Math.round(((p.score ?? 0) / 100) * 5);
                            const docsTotal = 12;
                            const docs = Math.round(((p.score ?? 0) / 100) * docsTotal);
                            const overdue = p.nextReviewDays !== null && p.nextReviewDays < 0;
                            return (
                                <tr key={p.slug}>
                                    <td className={td}><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded bg-ink-900 font-bold text-gold-400" aria-hidden="true">{p.name.slice(0, 1)}</span><span><span className="block font-semibold text-ink-900">{p.name}</span><span className="text-xs text-ink-500">{p.code}</span></span></div></td>
                                    <td className={td}>{p.categoryLabel}</td>
                                    <td className={td}><StatusPill status={p.statusLabel} /></td>
                                    <td className={td}><span className="font-semibold">{p.score ?? 0}%</span> <Stars value={((p.score ?? 0) / 100) * 5} /><span className="block text-xs text-ink-500">{(p.score ?? 0) >= 90 ? 'Excellent' : (p.score ?? 0) >= 75 ? 'Good' : (p.score ?? 0) >= 60 ? 'Fair' : 'Poor'}</span></td>
                                    <td className={td}><span className="flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => (i < checks ? <CircleCheck key={i} className="size-4 fill-verified-500 text-white" aria-hidden="true" /> : <Circle key={i} className="size-4 text-ink-300" aria-hidden="true" />))}</span><span className="text-xs text-ink-500">{checks} / 5 Passed</span></td>
                                    <td className={td}><span className="text-xs">{docs} / {docsTotal}</span><MiniBar value={docs} max={docsTotal} tone={docs / docsTotal >= 0.9 ? 'good' : docs / docsTotal >= 0.6 ? 'warn' : 'bad'} /></td>
                                    <td className={td}>{p.lastVerified ?? '—'}</td>
                                    <td className={td}><span className={overdue ? 'font-semibold text-risk-600' : ''}>{p.nextReview ?? '—'}</span><span className="block text-xs text-ink-500">{p.nextReviewDays === null ? '' : overdue ? 'Overdue' : `in ${p.nextReviewDays} days`}</span></td>
                                    <td className={td}><div className="flex items-center gap-2"><Link href={`${URL}/${p.slug}/vetting`} className="rounded border border-parchment-500 px-2 py-1 text-xs font-medium whitespace-nowrap hover:border-gold-500">View Details</Link>
                                        <ActionMenu url={`${URL}/${p.slug}/status`} actions={(allowed[p.status] ?? []).map((k) => ({ key: k, label: actions[k]?.label ?? k, danger: ['suspend', 'decline'].includes(k) }))} /></div></td>
                                </tr>
                            );
                        })}
                    </Table>
                </div>
                <p className="mt-3 flex flex-wrap gap-4 text-xs text-ink-500"><span>Verified – All checks passed</span><span>In Verification – Review in progress</span><span>Action Required – Attention needed</span><span>Suspended – Temporarily inactive</span><span>Rejected – Application declined</span></p>
            </div>
            <p className="mt-4 rounded bg-parchment-200 px-4 py-3 text-xs text-ink-600">Provider verification is a continuous process. Scores are based on compliance, performance and documentation. Approval happens from the vetting workbench once all checks are verified.</p>
        </AdminShell>
    );
}

Providers.layout = null;
