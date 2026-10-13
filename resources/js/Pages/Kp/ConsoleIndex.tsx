import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { StatusPill } from '@/Components/ui/Kit';
import { Box, ConsoleFrame, type ConsoleNavItem, type KpScreen } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props {
    screens: (KpScreen & { built: boolean })[];
    stats: { total: number; public: number; admin: number; mockups: number };
    consoles: { key: string; title: string; id: string; records: number; open: number }[];
    queues: { label: string; value: number; href: string }[];
    quarantined: string[];
    consoleNav: ConsoleNavItem[];
}

/** Staff overview of the 72-screen KP register: mockup coverage, consoles and work queues. */
export default function ConsoleIndex({ screens, stats, consoles, queues, quarantined, consoleNav }: Props) {
    const [filter, setFilter] = useState<'all' | 'Public' | 'Admin' | 'nomock'>('all');
    const rows = useMemo(() => screens.filter((s) => filter === 'all' || (filter === 'nomock' ? !s.mockup : s.surface === filter)), [screens, filter]);
    return (
        <ConsoleFrame nav={consoleNav} active={null} title="KP Screen Register Overview" id={null} intro="All 72 screens defined by the KP TEB v2.0 blueprint, with mockup coverage and live work queues.">
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[['Screens built', stats.total], ['Public screens', stats.public], ['Governance consoles', stats.admin], ['Screens with a KP mockup', stats.mockups]].map(([l, v]) => <li key={l} className="rounded-[10px] border border-parchment-400 bg-white p-4"><p className="text-[0.75rem] text-ink-600">{l}</p><p className="text-2xl font-bold text-ink-900">{v}</p></li>)}
            </ul>
            <div className="grid gap-4 xl:grid-cols-2">
                <Box title="Work Queues" icon="list-checks">
                    <ul className="divide-y divide-parchment-300">{queues.map((q) => <li key={q.label}><Link href={q.href} className="flex justify-between py-2 text-[0.8125rem] hover:text-gold-700">{q.label}<strong>{q.value}</strong></Link></li>)}</ul>
                </Box>
                <Box title="Quarantined Design Claims" icon="shield" tone="cream">
                    <p className="text-[0.8125rem]">These strings from KP's mockups never render on public pages until evidence is approved in the Claim Evidence console (blueprint 12.5):</p>
                    <ul className="mt-2 list-disc pl-5 text-[0.8125rem]">{quarantined.map((q) => <li key={q}>{q}</li>)}</ul>
                    <Link href="/admin/kp/claims" className="mt-2 inline-block text-[0.8125rem] font-semibold text-gold-700">Open Claim Evidence</Link>
                </Box>
            </div>
            <Box title="Governance Consoles" icon="layers">
                <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{consoles.map((c) => <li key={c.key}><Link href={`/admin/kp/${c.key}`} className="flex items-center justify-between gap-2 rounded-[8px] border border-parchment-400 px-3 py-2 text-[0.8125rem] hover:border-gold-500"><span><span className="block font-semibold text-ink-900">{c.title}</span><span className="text-[0.6875rem] text-ink-500">{c.id} | {c.records} records</span></span>{c.open > 0 && <StatusPill status={`${c.open} open`} tone="warn" />}</Link></li>)}</ul>
            </Box>
            <Box title="Screen Register" icon="file-text" action={<div className="flex gap-1">{([['all', 'All'], ['Public', 'Public'], ['Admin', 'Admin'], ['nomock', 'No mockup']] as const).map(([k, l]) => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={cn('rounded-full border px-2.5 py-0.5 text-[0.6875rem]', filter === k ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500')}>{l}</button>)}</div>}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[0.8125rem]">
                        <thead className="border-b border-parchment-400 text-[0.75rem] text-ink-600"><tr><th className="py-2 pr-2">Screen ID</th><th className="py-2 pr-2">Title</th><th className="py-2 pr-2">Surface</th><th className="py-2 pr-2">KP mockup</th><th className="py-2">Route</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {rows.map((s) => <tr key={s.id}><td className="py-1.5 pr-2 font-semibold whitespace-nowrap">{s.id}</td><td className="py-1.5 pr-2">{s.title}</td><td className="py-1.5 pr-2">{s.surface}</td><td className="py-1.5 pr-2 text-[0.75rem]">{s.mockup ?? <span className="text-ink-400">Blueprint only</span>}</td><td className="py-1.5"><Link href={s.href} className="text-gold-700 hover:underline">{s.href.replace('/kp-thought-leadership', '') || '/'}</Link></td></tr>)}
                        </tbody>
                    </table>
                </div>
            </Box>
        </ConsoleFrame>
    );
}
