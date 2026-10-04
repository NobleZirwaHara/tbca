import { Link } from '@inertiajs/react';
import { AlertTriangle, BookOpen, CalendarX, Headphones, Info, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { Box } from '@/Components/Insights/Shared';
import { ResourceFrame } from '@/Components/Insights/Resources';
import type { ResourceCard as RC, ResourceDetail } from '@/types/insights';

export default function Retired({ resource: r, related }: { resource: ResourceDetail; related: RC[] }) {
    const m = r.meta as { first_published?: string; last_reviewed?: string; audience?: string; topics?: string[] };
    return (
        <ResourceFrame title={`${r.title} (retired)`} crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Retired Content', href: '/resources/content-status' }, { label: r.title }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-risk-700 uppercase"><Trash2 className="size-5" /> Retired Content</p>
                    <h1 className="font-serif text-3xl font-bold text-ink-900">{r.title}</h1>
                    <p className="text-sm text-ink-600">This content has been retired and is no longer maintained.</p>
                    <div className="flex gap-3 rounded-[8px] border border-risk-500/30 bg-risk-50 p-4"><AlertTriangle className="size-6 text-risk-500" /><div><p className="font-semibold">This resource has been retired.</p><p className="text-xs text-ink-700">The information is no longer current and may not reflect recent legal, regulatory or procedural changes.</p></div></div>
                    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
                        <Box title="Content Details">
                            <dl className="space-y-2 text-sm">
                                {[['Content Type', r.type], ['First Published', m.first_published], ['Last Reviewed', m.last_reviewed], ['Retired On', r.retiredAt], ['Reason', r.retiredReason], ['Audience', m.audience]].map(([k, v]) => <div key={k as string} className="grid grid-cols-[8rem_1fr] gap-2"><dt className="font-semibold text-ink-700">{k}</dt><dd className="capitalize">{v ?? '—'}</dd></div>)}
                                <div className="grid grid-cols-[8rem_1fr] gap-2"><dt className="font-semibold text-ink-700">Topics</dt><dd className="flex flex-wrap gap-1.5">{(m.topics ?? []).map((t) => <span key={t} className="rounded bg-parchment-200 px-2 py-0.5 text-xs">{t}</span>)}</dd></div>
                            </dl>
                        </Box>
                        <Box title="Important Note"><p className="flex gap-2 text-sm text-ink-700"><Info className="size-5 shrink-0 text-controlled-700" />Processes, documents and fees have changed. Using outdated steps may lead to delays or non-compliance.</p><p className="mt-2 text-sm font-semibold">Please refer to our current resource for accurate guidance.</p></Box>
                    </div>
                    <div className="flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center">
                        <BookOpen className="size-8 text-gold-700" />
                        <div className="flex-1"><p className="font-semibold">Explore Related Resources</p><ul className="mt-1 list-disc pl-5 text-sm">{related.map((x) => <li key={x.id}><Link href={x.url} className="text-controlled-700 hover:underline">{x.title}</Link></li>)}</ul></div>
                        <Link href="/resources/library" className="rounded border border-gold-500 bg-white px-3 py-2 text-xs font-semibold text-gold-800">View All Resources →</Link>
                    </div>
                </div>
                <aside className="space-y-4">
                    <Box title="Why it was retired">
                        <ul className="space-y-3 text-xs">{[[CalendarX, 'Legal and compliance updates', 'Requirements have been updated.'], [RefreshCw, 'Process changes', 'Steps, timelines and documentation have evolved.'], [ShieldAlert, 'Risk of inaccuracy', 'Outdated information may lead to errors or compliance issues.']].map(([I, t, s]) => { const Icon = I as typeof Info; return <li key={t as string} className="flex gap-2"><Icon className="size-5 text-risk-500" /><span><strong className="block">{t as string}</strong>{s as string}</span></li>; })}</ul>
                    </Box>
                    {r.replacement && (
                        <Box title="Recommended Replacement">
                            <div className="flex gap-3"><div className="flex h-24 w-20 shrink-0 items-end rounded bg-ink-950 p-2 font-serif text-[0.625rem] font-bold text-gold-400">{r.replacement.title}</div><div><p className="text-sm font-semibold">{r.replacement.title}</p><p className="text-xs text-ink-600">{r.replacement.summary}</p></div></div>
                            <Link href={r.replacement.url} className="mt-3 block rounded border border-verified-500/50 py-1.5 text-center text-xs font-semibold text-verified-700">View Current Guide →</Link>
                        </Box>
                    )}
                    <Box title="Need Help?"><p className="flex gap-2 text-xs text-ink-600"><Headphones className="size-5 shrink-0" />Our Specialists are here to assist you.</p><Link href="/contact" className="mt-2 block rounded border py-1.5 text-center text-xs font-semibold">Speak to a Specialist →</Link></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
