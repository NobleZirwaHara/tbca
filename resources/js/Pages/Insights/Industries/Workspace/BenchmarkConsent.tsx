import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { BarChart3, Clock, Download, Info, Lock, ShieldCheck, ToggleRight, UserX, XCircle, CheckCircle2, Ban } from 'lucide-react';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Status } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { WorkspaceBase } from '@/types/insights';

interface Props extends WorkspaceBase {
    benchmark: null | { label: string; releaseState: string; nCurrent: number; level: string; nextLevel: string; minK: number; status: string };
    choice: string | null;
    choiceAt: string | null;
}

const CHOICES = [
    { key: 'granted', title: 'Yes, I Consent', text: 'I consent to contribute approved, non-identifiable, derived data for sector benchmark purposes. You can withdraw at any time.', icon: ShieldCheck, tone: 'border-verified-500 bg-verified-50' },
    { key: 'declined', title: 'No, I Do Not Consent', text: 'I do not consent to contribute my data for benchmark purposes. This will not affect any service to me.', icon: Ban, tone: 'border-attested-500 bg-attested-50' },
    { key: 'later', title: 'Ask Me Later', text: 'Remind me at a later date. No data will be used until I make a choice.', icon: Clock, tone: 'border-parchment-500 bg-white' },
];

export default function BenchmarkConsent(props: Props) {
    const { engagement: e, benchmark: b, choice, choiceAt } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [sel, setSel] = useState<string | null>(choice);
    const save = () => sel && router.post(`${root}/benchmark-contribution`, { choice: sel }, { preserveScroll: true });

    return (
        <WorkspaceShell
            base={props}
            title="Benchmark Contribution Consent"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="Contribute optional, non-identifiable data to help build independent sector benchmarks. Your decision is separate from your engagement and will not affect any service delivered to you."
            actions={
                <>
                    <Link href="/resources/data-statement" className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Benchmark Policy</Link>
                    <button type="button" disabled={!sel} onClick={save} className="rounded bg-gold-500 px-3 py-2 text-xs font-bold disabled:opacity-50">Save My Choice</button>
                </>
            }
            right={
                <>
                    <Box tone="blue" title="Privacy & Governance"><p className="text-xs">All contributions are governed by our Benchmark Governance Framework and must pass our Disclosure Gate before any publication.</p></Box>
                    {b && (
                        <Box title="Current Benchmark Status">
                            <dl className="space-y-1.5 text-xs">
                                {[['Benchmark', b.label], ['Benchmark State', b.releaseState], ['Independent Entities (n)', b.nCurrent], ['Threshold Level', b.level], ['Next Threshold', b.nextLevel], ['Standard k', b.minK], ['Elevated k', 20]].map(([k, v]) => <div key={k as string} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
                            </dl>
                            <Link href={`/industries/${e.industrySlug}/benchmarks`} className="mt-2 inline-block text-xs font-semibold text-controlled-700">View Benchmark Progress →</Link>
                        </Box>
                    )}
                    <Box title="Your Contribution Choice">
                        <p className="text-xs">Current Selection: {choice ? <Status value={choice} /> : <Chip tone="amber">No Decision Recorded</Chip>}</p>
                        {choiceAt && <p className="mt-1 text-[0.6875rem] text-ink-400">Recorded {choiceAt}</p>}
                        <p className="mt-2 text-xs text-ink-500">You can make your choice below. You can change or withdraw it at any time.</p>
                    </Box>
                </>
            }
        >
            <Box title="Why We Ask">
                <p className="text-xs text-ink-600">Sector benchmarks are created only from aggregated, non-identifiable data contributed by organisations like yours. These insights help the sector improve, inform policy and support better decision-making across Africa.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    {[[ShieldCheck, 'Independent', 'Benchmarks are built independently of TBCA and any commercial interests.'], [UserX, 'Non-identifiable', 'Your organisation cannot be identified in any publication.'], [BarChart3, 'Aggregated', 'Only combined sector data is analysed and published.'], [ToggleRight, 'Optional', 'You choose whether or not to contribute. You can withdraw anytime.']].map(([I, t, s]) => {
                        const Icon = I as typeof ShieldCheck;
                        return <div key={t as string} className="text-xs"><Icon className="size-6 text-controlled-700" /><strong className="mt-1 block">{t as string}</strong>{s as string}</div>;
                    })}
                </div>
            </Box>
            <Box title="What You Are Agreeing To (If You Consent)">
                <ul className="space-y-1.5 text-xs">{['We may use approved, non-identifiable, derived metrics from your engagement for sector benchmark purposes.', 'Your data will be aggregated with contributions from other organisations and will not be disclosed in any way that could identify you.', 'We will apply strict privacy, statistical and legal controls before any benchmark is published.', 'You may withdraw your consent at any time. We will stop using your data for future benchmarks.', 'Your decision will not affect any service, pricing, or deliverables you receive from TBCA.'].map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-verified-500" />{t}</li>)}</ul>
                <div className="mt-4 rounded-[8px] border border-attested-500/30 bg-attested-50 p-3">
                    <p className="text-xs font-semibold text-attested-700">Examples of Data That May Be Contributed (Derived & Aggregated Only)</p>
                    <div className="mt-2 flex flex-wrap gap-2">{['Revenue / Turnover (Band)', 'Production Volume (Band)', 'Cost Structure (Band)', 'Profitability (Band)', 'Input Costs (Band)', 'Yield / Output (Band)', 'Market Prices (Band)', 'Time Period', 'Industry / Sub-Industry'].map((t) => <span key={t} className="rounded border border-parchment-400 bg-white px-2 py-0.5 text-[0.6875rem]">{t}</span>)}</div>
                </div>
                <div className="mt-3 rounded-[8px] border border-risk-500/30 bg-risk-50 p-3">
                    <p className="text-xs font-semibold text-risk-700">Data We Never Accept</p>
                    <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-3">{['Names, emails, phone numbers', 'Identity numbers or personal data', 'Employee-level or customer-level data', 'Bank account or payment details', 'Raw uploads or supporting documents', 'Privileged, legal or confidential information'].map((t) => <li key={t} className="flex gap-1.5"><XCircle className="size-4 text-risk-500" />{t}</li>)}</ul>
                </div>
            </Box>
            <Box title="Your Consent Choice">
                <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Consent choice">
                    {CHOICES.map((c) => (
                        <button key={c.key} type="button" role="radio" aria-checked={sel === c.key} onClick={() => setSel(c.key)} className={cn('rounded-[8px] border-2 p-3 text-left', sel === c.key ? c.tone : 'border-parchment-300 bg-white')}>
                            <span className="flex items-center gap-2 text-sm font-semibold"><span className={cn('size-4 rounded-full border-2', sel === c.key ? 'border-gold-600 bg-gold-500' : 'border-ink-300')} /><c.icon className="size-5" />{c.title}</span>
                            <span className="mt-1 block text-xs text-ink-600">{c.text}</span>
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-ink-500">Effective for this engagement and future engagements unless changed.</p>
                <button type="button" disabled={!sel} onClick={save} className="mt-3 rounded bg-gold-500 px-4 py-2 text-xs font-bold disabled:opacity-50"><Lock className="mr-1 inline size-3.5" /> Save My Choice</button>
            </Box>
            <p className="flex items-center gap-2 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700"><Info className="size-4" /> Your choice is recorded in the Contribution Consent Ledger with timestamp, version and scope.</p>
        </WorkspaceShell>
    );
}
