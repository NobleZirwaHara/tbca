import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Bell, Check, FileText, Info, Settings, ShieldCheck } from 'lucide-react';
import LibraryShell, { HelpPanel } from '@/Components/Products/Digital/LibraryShell';
import { Chip, DpStatus } from '@/Components/Products/Digital/Ui';
import { cn } from '@/lib/cn';
import type { DpEntitlement, DpVersion } from '@/Components/Products/Digital/types';

type U = DpVersion & { included: boolean; withdrawn: boolean };

const TYPE_LABEL: Record<string, string> = { major: 'Major Update', minor: 'Minor Update', patch: 'Patch', critical: 'Critical Correction', clarification: 'Clarification' };

export default function Updates({
    entitlement: e,
    updates,
    archived,
    history,
    notify,
    defensibility,
}: {
    entitlement: DpEntitlement;
    updates: U[];
    archived: U[];
    history: DpVersion[];
    notify: boolean;
    defensibility: string;
}) {
    const [tab, setTab] = useState('all');
    const [selectedId, setSelectedId] = useState<number | null>(updates[0]?.id ?? null);
    const selected = updates.find((u) => u.id === selectedId) ?? updates[0];
    const count = (t: string) => updates.filter((u) => u.updateType === t).length;
    const shown = tab === 'archived' ? archived : tab === 'all' ? updates : updates.filter((u) => u.updateType === tab || (tab === 'minor' && u.updateType === 'minor'));
    const latest = history.find((h) => h.status === 'current');

    const apply = (u: U) => router.post(`/digital-products/library/${e.reference}/updates/${u.id}`, {}, { preserveScroll: true });

    return (
        <LibraryShell entitlement={e} title="Updates and Corrections" crumb="Updates and Corrections" description="Stay current and protected. View available updates, patches and corrections for your product.">
            <div className="grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-4 lg:grid-cols-7">
                {[
                    ['Your Version', e.version?.display, null],
                    ['Latest Version', latest?.display, latest?.releasedAt],
                    ['Critical Corrections', String(count('critical')), 'View details'],
                    ['Updates Available', String(updates.length), 'View updates'],
                    ['Maintenance', e.maintenanceStatus === 'active' ? 'Active' : 'Not Active', e.maintenanceStatus === 'active' ? `Until ${e.maintenanceUntil}` : `Updates until ${e.updateUntil ?? '—'}`],
                    ['Auto-Update', 'Off', 'You choose'],
                ].map(([k, v, s]) => (
                    <div key={k as string}>
                        <p className="text-[0.6875rem] text-ink-500">{k}</p>
                        <p className="text-sm font-semibold text-ink-900">{v}</p>
                        {s && <p className="text-[0.6875rem] text-gold-700">{s}</p>}
                    </div>
                ))}
                <Link href={`/digital-products/library/${e.reference}/maintained-access`} className="inline-flex h-9 items-center gap-1.5 self-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold">
                    <Settings className="size-4" aria-hidden="true" /> Update Preferences
                </Link>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_320px_250px]">
                <div className="min-w-0 space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-parchment-400">
                            {[
                                ['all', `All Updates (${updates.length})`],
                                ['critical', `Critical Corrections (${count('critical')})`],
                                ['patch', `Patches (${count('patch')})`],
                                ['minor', `Minor Updates (${count('minor')})`],
                                ['clarification', `Clarifications (${count('clarification')})`],
                                ['archived', `Archived (${archived.length})`],
                            ].map(([k, l]) => (
                                <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-xs font-medium', tab === k ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500')}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="mt-2 w-full min-w-[640px] text-left text-xs">
                                <thead className="text-[0.6875rem] font-bold text-ink-500 uppercase">
                                    <tr>
                                        <th className="p-2">Update</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Version</th>
                                        <th className="p-2">Released</th>
                                        <th className="p-2">Impact</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {shown.map((u) => (
                                        <tr key={u.id} className={cn('align-top', selected?.id === u.id && tab !== 'archived' && 'bg-gold-50/50')}>
                                            <td className="max-w-56 p-2">
                                                <p className="flex gap-2 font-semibold text-ink-900"><FileText className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{TYPE_LABEL[u.updateType ?? ''] ?? 'Update'} {u.label}</p>
                                                <p className="mt-0.5 text-[0.6875rem] text-ink-500">{u.summary}</p>
                                            </td>
                                            <td className="p-2"><Chip tone={u.updateType === 'major' ? 'good' : u.updateType === 'critical' ? 'bad' : 'warn'}>{TYPE_LABEL[u.updateType ?? ''] ?? '—'}</Chip></td>
                                            <td className="p-2">{u.version}</td>
                                            <td className="p-2">{u.releasedAt}</td>
                                            <td className="p-2">
                                                {u.impact.map((i) => <p key={i} className="flex items-center gap-1"><Check className="size-3 text-verified-500" aria-hidden="true" />{i}</p>)}
                                                <button type="button" onClick={() => setSelectedId(u.id)} className="text-[0.6875rem] text-gold-700 underline">View what changed</button>
                                            </td>
                                            <td className="p-2">
                                                <DpStatus status={u.withdrawn ? 'withdrawn_unsafe' : u.included ? 'available' : 'paid upgrade'} />
                                                <p className="mt-0.5 text-[0.625rem] text-ink-500">{u.size}</p>
                                            </td>
                                            <td className="space-y-1 p-2">
                                                {tab !== 'archived' && !u.withdrawn && (u.included ? (
                                                    <button type="button" onClick={() => apply(u)} className="h-7 w-full rounded-[4px] bg-gold-500 px-2 text-[0.6875rem] font-semibold whitespace-nowrap text-ink-900">Download Update</button>
                                                ) : (
                                                    <Link href={`/digital-products/library/${e.reference}/maintained-access`} className="flex h-7 items-center justify-center rounded-[4px] bg-gold-500 px-2 text-[0.6875rem] font-semibold whitespace-nowrap">Get Update</Link>
                                                ))}
                                                <button type="button" onClick={() => setSelectedId(u.id)} className="h-7 w-full rounded-[4px] border border-gold-500 px-2 text-[0.6875rem] font-semibold">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {shown.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-ink-500">Nothing in this category. You are up to date.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[6px] bg-parchment-100 p-3 text-xs">
                            <p className="flex gap-2"><Info className="size-4 text-gold-700" aria-hidden="true" /><span><strong className="block">Automatically notified</strong>We will notify you when critical corrections or important updates are released.</span></p>
                            <button type="button" onClick={() => router.post(`/digital-products/library/${e.reference}/notifications`, {}, { preserveScroll: true })} className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-gold-500 bg-white px-3 font-semibold">
                                <Bell className="size-3.5" aria-hidden="true" /> {notify ? 'Manage Notifications (On)' : 'Notifications Off – Turn On'}
                            </button>
                        </div>
                    </section>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-verified-500/30 bg-verified-50 p-4 text-xs">
                        <p className="flex gap-2 text-verified-800"><ShieldCheck className="size-6" aria-hidden="true" /><span><strong className="block text-sm">Your Entitlement is {e.maintenanceStatus === 'active' ? 'Protected' : 'Covered for Updates'}</strong>{e.maintenanceStatus === 'active' ? 'Your maintenance plan includes all updates and corrections released during the maintenance period.' : 'Updates released inside your update window are included. Safety corrections are always provided.'}</span></p>
                        <p>{e.maintenanceStatus === 'active' ? 'Maintenance valid until' : 'Updates included until'} <strong className="block text-sm">{e.maintenanceStatus === 'active' ? e.maintenanceUntil : e.updateUntil}</strong></p>
                        <Link href={`/digital-products/library/${e.reference}/maintained-access`} className="inline-flex h-9 items-center rounded-[4px] border border-verified-600 bg-white px-3 font-semibold">View Maintenance & Updates</Link>
                    </div>
                </div>

                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                    <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Selected Update</h2>
                    {selected ? (
                        <>
                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-900">{TYPE_LABEL[selected.updateType ?? ''] ?? 'Update'} {selected.label} {selected === updates[0] && <Chip tone="good">Recommended</Chip>}</p>
                            <p className="text-[0.6875rem] text-ink-500">Released: {selected.releasedAt} • Size: {selected.size}</p>
                            <h3 className="mt-3 font-semibold">What's New</h3>
                            <ul className="mt-1 space-y-1">{selected.whatsNew.map((w) => <li key={w} className="flex gap-1.5"><Check className="size-3.5 shrink-0 text-verified-500" aria-hidden="true" />{w}</li>)}</ul>
                            <h3 className="mt-3 font-semibold">Compatibility</h3>
                            <p>Works with: {selected.worksWith}</p>
                            <p>Replaces: {selected.replaces}</p>
                            <h3 className="mt-3 font-semibold">Defensibility Impact</h3>
                            <p>Maintains D1–D5 evidence and GATE-DP-01 {defensibility} status.</p>
                        </>
                    ) : (
                        <p className="text-ink-500">No newer controlled version has been released. You are on the latest edition.</p>
                    )}
                    <div className="mt-4 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3">
                        <p className="font-semibold text-ink-900">Your Current Version</p>
                        <p>You are currently using {e.version?.display}</p>
                        <p>Updated: {e.version?.releasedAt}</p>
                    </div>
                </section>

                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-1 font-bold tracking-wide text-ink-900 uppercase">Correction Policy</h2>
                        <p className="text-ink-600">All corrections are issued transparently. Major issues are withdrawn and replaced. Minor issues are patched. Silent overwrites never happen — every prior release is preserved.</p>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Version History</h2>
                        <ul className="space-y-1">{history.map((h) => <li key={h.id} className="flex justify-between"><span>{h.version}{h.status === 'current' ? ' (Current)' : ''}</span><span className="text-ink-500">{h.releasedAt}</span></li>)}</ul>
                        <Link href={`/digital-products/library/${e.reference}/version-status`} className="mt-2 inline-block font-semibold text-gold-700 underline">View full history →</Link>
                    </section>
                    <HelpPanel />
                </div>
            </div>
        </LibraryShell>
    );
}

Updates.layout = null;
