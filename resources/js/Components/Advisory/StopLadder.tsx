import { router } from '@inertiajs/react';
import { BookOpen, Lock, OctagonX, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface StopRuleRow { id: number; code: string; rule: string; condition: string; risk: string; owner: string; enabled: boolean }

/** The Abort / Stop-Now ladder (read-only for clients, toggleable for admins). */
export default function StopLadder({ rules, blocks, admin = false }: { rules: StopRuleRow[]; blocks: { code: string; message: string; mandate?: string }[]; admin?: boolean }) {
    const enabled = rules.filter((r) => r.enabled).length;
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 text-center sm:grid-cols-4">
                <div><p className="text-2xl font-bold text-risk-700">{rules.length}</p><p className="text-xs text-ink-500">Stop-Now Rules</p></div>
                <div><p className="text-2xl font-bold text-risk-700">{blocks.length}</p><p className="text-xs text-ink-500">Active Blocks</p></div>
                <div><p className="text-2xl font-bold text-verified-700">{enabled}</p><p className="text-xs text-ink-500">Enforced</p></div>
                <div><p className="text-2xl font-bold">{rules.length ? Math.round((enabled / rules.length) * 100) : 0}%</p><p className="text-xs text-ink-500">Compliance</p></div>
            </div>
            <div className="grid gap-5 lg:grid-cols-12">
                <aside className="space-y-4 rounded-[8px] bg-gold-50 p-5 lg:col-span-4">
                    <p className="flex items-center gap-2 font-serif text-xl font-bold text-risk-700"><OctagonX className="size-10" />STOP-NOW</p>
                    <p className="text-sm">If any of the conditions in this ladder are TRUE, the system must:</p>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm">{['Halt the journey immediately', 'Lock any paid-gate progression', 'Prevent bookings or fulfilment', 'Prevent signed engagement', 'Display the Stop-Now message', 'Log the event to the Gate Log', 'Require resolution and re-check'].map((x) => <li key={x}>{x}</li>)}</ul>
                    <p className="flex items-center gap-2 border-t border-gold-300 pt-3 font-semibold text-risk-700"><TriangleAlert className="size-5" />Important</p>
                    <p className="text-sm">Stop-Now rules override all other logic. They are evaluated at every step and before every paid or gated action.</p>
                    <p className="flex items-center gap-2 border-t border-gold-300 pt-3 font-semibold"><BookOpen className="size-5" />Policy Reference</p>
                    <p className="text-sm">See Part 7: Gate Model and Approval Mechanics and Appendix B: Gate Register for full rule definitions.</p>
                </aside>
                <div className="lg:col-span-8">
                    <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-ink-950 text-xs text-parchment-100"><tr>{['ID', 'Stop-Now Rule', 'Condition (If TRUE)', 'Risk', 'Action', 'Owner', admin ? 'Enforced' : ''].filter(Boolean).map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {rules.map((r) => (
                                    <tr key={r.code} className={cn(!r.enabled && 'opacity-60')}>
                                        <td className="px-3 py-2 font-semibold text-risk-700">{r.code}</td>
                                        <td className="px-3 py-2">{r.rule}</td>
                                        <td className="px-3 py-2"><span className="flex items-center gap-1.5"><TriangleAlert className="size-4 text-risk-500" />{r.condition}</span></td>
                                        <td className="px-3 py-2"><span className={cn('rounded border px-1.5 text-xs', r.risk === 'High' ? 'border-risk-500 text-risk-700' : 'border-attested-500 text-attested-700')}>{r.risk}</span></td>
                                        <td className="px-3 py-2">Abort immediately</td>
                                        <td className="px-3 py-2">{r.owner}</td>
                                        {admin && <td className="px-3 py-2"><button type="button" onClick={() => router.post(`/admin/advisory/stop-now/${r.id}`, {}, { preserveScroll: true })} className={cn('rounded px-2 py-0.5 text-xs font-semibold', r.enabled ? 'bg-verified-50 text-verified-700' : 'bg-risk-50 text-risk-700')}>{r.enabled ? 'On' : 'Off'}</button></td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex gap-3 rounded-[8px] border border-risk-500/30 bg-risk-50 p-4">
                        <Lock className="size-6 shrink-0 text-risk-700" />
                        <div><p className="font-semibold text-risk-700">System Enforcement</p><p className="text-sm">The Stop-Now Ladder is enforced at every step and before every paid or gated action. No bypass is permitted. All events are logged and require resolution before re-check.</p></div>
                    </div>
                    {blocks.length > 0 && (
                        <div className="mt-4 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <p className="text-sm font-semibold">Active blocks</p>
                            <ul className="mt-2 space-y-1 text-sm">{blocks.map((b, i) => <li key={i}><b className="text-risk-700">{b.code}</b> {b.mandate && <span className="font-mono text-xs">{b.mandate}</span>} — {b.message}</li>)}</ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
