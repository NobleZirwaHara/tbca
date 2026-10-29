import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, ConfidenceRing, Empty, FreshnessBadge, KpPage, Meter, scoreTone, type KpAnswerT, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    answer: KpAnswerT;
    breakdown: { label: string; value: number; body: string }[];
    freshness: { key: string; label: string; body: string }[];
    voices: { code: string; label: string }[];
}

/** KP-SCR-025 Source & Confidence Panel. */
export default function Sources({ screen, kpNav, answer: a, breakdown, freshness }: Props) {
    const high = a.sources.filter((s) => s.weight >= 80).length;
    const mid = a.sources.filter((s) => s.weight >= 50 && s.weight < 80).length;
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Source & Confidence Panel']]}
            title="Source & Confidence Panel"
            intro="Review the sources behind this answer and how its confidence was assessed."
            actions={<a href={`${BASE}/ask/${a.reference}/export`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Download Sources</a>}
            left={
                <div className="space-y-4">
                    <Box title="Answer Summary" tone="purple">
                        <p className="rounded-[8px] bg-white p-2 text-[0.8125rem] font-semibold text-ink-900">{a.question}</p>
                        <p className="mt-1 text-[0.6875rem] text-ink-500">Asked {a.asked} | Model: KP register retrieval (no generative model)</p>
                        <p className="mt-2 text-[0.8125rem]">{a.answer.intro}</p>
                        <Link href={`${BASE}/ask/${a.reference}`} className="mt-2 inline-block text-[0.75rem] font-semibold text-gold-700">View AI Answer</Link>
                    </Box>
                    <Box title="Source Overview">
                        <dl className="space-y-1.5 text-[0.8125rem]">
                            <div className="flex justify-between"><dt>Total sources</dt><dd className="font-bold">{a.sources.length}</dd></div>
                            <div className="flex justify-between"><dt>Primary</dt><dd className="font-bold">{a.sources.filter((s) => s.role === 'Primary').length}</dd></div>
                            <div className="flex justify-between"><dt>Supporting</dt><dd className="font-bold">{a.sources.filter((s) => s.role !== 'Primary').length}</dd></div>
                            <div className="flex justify-between"><dt>Status</dt><dd className="font-bold capitalize">{a.status}</dd></div>
                        </dl>
                    </Box>
                </div>
            }
            rail={
                <>
                    <Box title="Confidence Assessment" icon="shield-check">
                        <ConfidenceRing value={a.confidence} label={a.confidenceLabel} size={120} />
                        <ul className="mt-3 space-y-1 text-[0.75rem]">
                            <li className="flex justify-between"><span>High evidence (80 to 100)</span><strong>{high}</strong></li>
                            <li className="flex justify-between"><span>Medium evidence (50 to 79)</span><strong>{mid}</strong></li>
                            <li className="flex justify-between"><span>Low evidence (under 50)</span><strong>{a.sources.length - high - mid}</strong></li>
                        </ul>
                    </Box>
                    <Box title="Source Quality Factors" icon="gauge">
                        <ul className="space-y-3">{breakdown.map((b) => <li key={b.label}><p className="flex justify-between text-[0.75rem] font-semibold text-ink-900">{b.label}<span>{b.value}%</span></p><Meter value={b.value} tone={scoreTone(b.value) === 'gold' ? 'gold' : scoreTone(b.value)} className="mt-1" /><p className="mt-0.5 text-[0.6875rem] text-ink-500">{b.body}</p></li>)}</ul>
                    </Box>
                    <Box title="Actions">
                        <ul className="space-y-1.5 text-[0.8125rem]">
                            <li><Link href={`${BASE}/corrections#report`} className="hover:text-gold-700">Report an incorrect source</Link></li>
                            <li><Link href="/contact?subject=KP%20missing%20source" className="hover:text-gold-700">Request a missing source</Link></li>
                        </ul>
                    </Box>
                </>
            }
        >
            <Box title="Sources Used" icon="database">
                {a.sources.length === 0 ? <Empty>No sources: the assistant did not answer from evidence, so nothing was cited.</Empty> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[0.8125rem]">
                            <thead className="border-b border-parchment-400 text-[0.75rem] text-ink-600"><tr><th className="py-2 pr-2">#</th><th className="py-2 pr-2">Source</th><th className="py-2 pr-2">Role</th><th className="py-2 pr-2">Freshness</th><th className="py-2 pr-2">Evidence</th><th className="py-2">Score</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {a.sources.map((s) => (
                                    <tr key={s.n}>
                                        <td className="py-2 pr-2">{s.n}</td>
                                        <td className="py-2 pr-2"><Link href={s.href} className="font-semibold text-ink-900 hover:text-gold-700">{s.title}</Link><span className="block text-[0.6875rem] text-ink-500">{s.typeLabel} | {s.scope}</span></td>
                                        <td className="py-2 pr-2"><span className="rounded-[4px] bg-verified-50 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-verified-700">{s.role}</span></td>
                                        <td className="py-2 pr-2"><FreshnessBadge state={s.freshness} /></td>
                                        <td className="py-2 pr-2 text-[0.75rem]">{s.evidence}</td>
                                        <td className="py-2 font-bold">{s.weight}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Box>
            <Box title="How Freshness Works" icon="clock" tone="purple">
                <ul className="grid gap-2 sm:grid-cols-2">{freshness.map((f) => <li key={f.key} className="flex items-center gap-2 text-[0.75rem]"><FreshnessBadge state={f.key} />{f.body}</li>)}</ul>
                <p className="mt-3 text-[0.75rem] text-ink-600">Stale and restricted sources are excluded from answers. When a source is corrected, every answer that cites it is re-checked.</p>
            </Box>
        </KpPage>
    );
}
