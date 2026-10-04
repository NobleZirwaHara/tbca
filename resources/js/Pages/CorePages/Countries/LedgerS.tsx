import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CircleCheck, Download, Eye, Filter, Info, UserRound } from 'lucide-react';
import { useState } from 'react';
import { CountryFrame, SideBox, StatePill } from '@/Components/CorePages/CountryParts';
import { Flag } from '@/Components/CorePages/Kit';
import { Modal } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

interface Fee { category: string; description: string; jurisdiction: string; payable_to: string; basis: string; amount: number; when: string; ref: string }
interface Props {
    ledger: {
        from: { name: string; iso: string; state: string; note: string };
        to: { name: string; iso: string; state: string; note: string };
        meta: { type: string; purpose: string; evidence: string; evidence_items: number; confidence: string; availability: string };
        snapshot: [string, string][];
        fees: Fee[];
    };
    total: number;
    jurisdiction: string | null;
}

const TABS = ['Overview', 'Corridor Detail', 'Endpoint Comparison', 'Corridor Pair Evidence', 'Corridor Network', 'Ledger T (TBCA Fees)', 'Ledger X (External Fees)', 'Ledger S (Statutory Fees)'];
const amt = (n: number) => n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LedgerS({ ledger: l, total, jurisdiction }: Props) {
    const [about, setAbout] = useState(false);
    const [evidence, setEvidence] = useState<Fee | null>(null);
    const filter = (j: string | null) => router.get('/find-the-right-service/corridors/za-ae/ledger-s', j ? { jurisdiction: j } : {}, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <div>
            <Head title="Ledger S Statutory Fee View" />
            <CountryFrame
                crumbs={[{ label: 'Countries', href: '/find-the-right-service/countries' }, { label: 'Corridors', href: '/find-the-right-service/corridors' }, { label: 'Corridor Detail' }, { label: 'Ledger S Statutory Fee View' }]}
                title="Ledger S Statutory Fee View"
                badge={<span className="rounded-full bg-referenced-50 px-2.5 py-0.5 text-[0.75rem] font-semibold text-referenced-700">Statutory Fees Only</span>}
                lead={`Official statutory fees payable to government authorities in ${l.from.name} and the ${l.to.name} for the selected corridor.`}
                aside={
                    <>
                        <SideBox title={<span className="flex items-center justify-between gap-2">Corridor Snapshot <StatePill state={l.meta.evidence} /></span>}>
                            <dl className="space-y-1.5 text-[0.75rem]">{l.snapshot.map(([k, v]) => <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>)}</dl>
                            <p className="mt-3 flex gap-2 rounded-[6px] bg-controlled-50 p-2 text-[0.6875rem] text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" />These are official government fees. Amounts can change without notice. Verify latest fees with the relevant authorities.</p>
                        </SideBox>
                        <SideBox title="Key Actions">
                            <div className="space-y-2 text-[0.8125rem]">
                                <Link href="/find-the-right-service/corridors" className="flex h-9 items-center justify-center gap-1 rounded-[4px] border border-ink-300">View Corridor Detail <ArrowRight className="size-4" aria-hidden="true" /></Link>
                                <Link href="/find-the-right-service/countries/za" className="flex h-9 items-center justify-center gap-1 rounded-[4px] border border-ink-300">View Endpoint Comparison <ArrowRight className="size-4" aria-hidden="true" /></Link>
                                <button type="button" onClick={() => setEvidence(l.fees[0] ?? null)} className="flex h-9 w-full items-center justify-center gap-1 rounded-[4px] bg-referenced-500 font-semibold text-white">View Ledger S Evidence <ArrowRight className="size-4" aria-hidden="true" /></button>
                                <a href="/find-the-right-service/corridors/za-ae/ledger-s/export" className="flex h-9 items-center justify-center gap-1 rounded-[4px] border border-ink-300"><Download className="size-4" aria-hidden="true" />Download Ledger S (CSV)</a>
                            </div>
                        </SideBox>
                        <SideBox title="Need Help?"><p className="flex gap-2 text-[0.75rem] text-ink-600"><UserRound className="size-5 shrink-0" aria-hidden="true" />Speak to a TBCA Client Success Advisor for guidance on statutory fees.</p><Link href="/discovery-call" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-[0.8125rem]"><CalendarDays className="size-4" aria-hidden="true" />Book Discovery Call</Link></SideBox>
                    </>
                }
            >
                <div className="grid gap-4 rounded-[8px] border border-parchment-400 p-4 lg:grid-cols-[1fr_auto_1fr_2fr]">
                    <div className="flex gap-3"><span className="text-[2.5rem]" aria-hidden="true"><Flag iso={l.from.iso} /></span><div><p className="font-bold text-ink-900">{l.from.name}</p><p className="text-[0.6875rem] text-ink-500">Departure (From)</p><StatePill state={l.from.state} /><p className="text-[0.6875rem] text-ink-500">{l.from.note}</p></div></div>
                    <ArrowRight className="size-6 self-center text-ink-500" aria-hidden="true" />
                    <div className="flex gap-3"><span className="text-[2.5rem]" aria-hidden="true"><Flag iso={l.to.iso} /></span><div><p className="font-bold text-ink-900">{l.to.name}</p><p className="text-[0.6875rem] text-ink-500">Arrival (To)</p><StatePill state="Complete" /><p className="text-[0.6875rem] text-ink-500">{l.to.note}</p></div></div>
                    <dl className="grid grid-cols-2 gap-2 text-[0.75rem] sm:grid-cols-5">
                        {[['Corridor Type', l.meta.type], ['Purpose', l.meta.purpose], ['Evidence Status', `${l.meta.evidence} (${l.meta.evidence_items} items)`], ['Confidence Level', l.meta.confidence], ['Commercial Availability', l.meta.availability]].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-verified-700">{v}</dd></div>)}
                    </dl>
                </div>
                <div role="tablist" aria-label="Corridor views" className="mt-4 flex gap-1 overflow-x-auto border-b border-parchment-400">
                    {TABS.map((t, i) => {
                        const active = i === TABS.length - 1;
                        const href = i === 4 ? '/find-the-right-service/corridors' : undefined;
                        return href ? <Link key={t} href={href} role="tab" aria-selected={false} className="-mb-px shrink-0 border-b-2 border-transparent px-3 py-2 text-[0.8125rem] text-ink-600">{t}</Link> : <span key={t} role="tab" aria-selected={active} aria-disabled={!active} className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-[0.8125rem]', active ? 'border-gold-500 font-semibold text-gold-700' : 'border-transparent text-ink-400')}>{t}</span>;
                    })}
                </div>
                <p className="mt-3 flex items-center justify-between gap-2 rounded-[6px] bg-referenced-50 p-2.5 text-[0.75rem] text-referenced-700"><span className="flex gap-2"><Info className="size-4 shrink-0" aria-hidden="true" />Ledger S shows official statutory fees payable to government authorities only. No TBCA, third-party or platform fees are included.</span><button type="button" onClick={() => setAbout(true)} className="shrink-0 rounded-[4px] border border-referenced-500/40 bg-white px-2 py-1">About Ledger S</button></p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[0.9375rem] font-bold text-ink-900">Statutory Fee Schedule (Official Fees) <span className="ml-1 rounded-[3px] bg-controlled-50 px-1.5 text-[0.6875rem] font-medium text-controlled-700">All fees in ZAR</span></h2>
                    <div className="flex items-center gap-2 text-[0.75rem]">
                        <Filter className="size-4" aria-hidden="true" />
                        {[null, 'SA', 'UAE'].map((j) => <button key={j ?? 'all'} type="button" aria-pressed={jurisdiction === j} onClick={() => filter(j)} className={cn('rounded-[4px] border px-2 py-1', jurisdiction === j ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-500')}>{j ?? 'All jurisdictions'}</button>)}
                        <a href="/find-the-right-service/corridors/za-ae/ledger-s/export" className="inline-flex items-center gap-1 rounded-[4px] border border-parchment-500 px-2 py-1"><Download className="size-3.5" aria-hidden="true" />Export</a>
                    </div>
                </div>
                <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-[0.75rem]">
                        <thead className="bg-parchment-200 text-ink-600"><tr>{['#', 'Fee Category', 'Description', 'Jurisdiction', 'Payable To', 'Basis / Trigger', 'Estimated Amount (ZAR)', 'Currency', 'When Payable', 'Evidence Ref.', ''].map((h) => <th key={h} className="px-2 py-1.5">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {l.fees.map((f, i) => (
                                <tr key={f.ref}>
                                    <td className="px-2 py-2 text-controlled-700">{i + 1}</td><td className="px-2 py-2 font-medium text-ink-900">{f.category}</td><td className="px-2 py-2">{f.description}</td>
                                    <td className="px-2 py-2"><Flag iso={f.jurisdiction === 'SA' ? 'ZA' : 'AE'} className="mr-1" />{f.jurisdiction}</td><td className="px-2 py-2">{f.payable_to}</td><td className="px-2 py-2">{f.basis}</td>
                                    <td className="px-2 py-2 text-right font-semibold">{amt(f.amount)}</td><td className="px-2 py-2">ZAR</td><td className="px-2 py-2">{f.when}</td><td className="px-2 py-2 font-semibold text-controlled-700">{f.ref}</td>
                                    <td className="px-2 py-2"><button type="button" onClick={() => setEvidence(f)} aria-label={`View evidence ${f.ref}`}><Eye className="size-4 text-referenced-500" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[0.75rem] text-ink-500">Showing 1 to {l.fees.length} of {l.fees.length} statutory fee items</p>
                    <p className="flex items-center gap-4 rounded-[6px] bg-controlled-50 px-4 py-2.5 text-[0.875rem] font-semibold text-ink-900">Total Estimated Statutory Fees (Model Basis) <span className="text-[1.25rem] text-controlled-700">{amt(total)} ZAR</span></p>
                </div>
            </CountryFrame>

            <Modal open={about} onClose={() => setAbout(false)} title="About Ledger S">
                <p className="text-sm text-ink-700">TBCA separates every corridor cost into ledgers: Ledger T (TBCA fees), Ledger X (external and partner fees) and Ledger S (statutory fees payable directly to government authorities). Ledger S amounts are model-basis estimates backed by evidence references and are never marked up.</p>
            </Modal>
            <Modal open={evidence !== null} onClose={() => setEvidence(null)} title={`Evidence ${evidence?.ref ?? ''}`}>
                {evidence && (
                    <dl className="space-y-1.5 text-sm">
                        {[['Fee', evidence.category], ['Authority', evidence.payable_to], ['Basis', evidence.basis], ['Amount', `${amt(evidence.amount)} ZAR`], ['Evidence class', 'Official Publication'], ['Freshness', 'Current (reviewed 15 Aug 2026)']].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                        <p className="flex items-center gap-1.5 pt-2 text-verified-700"><CircleCheck className="size-4" aria-hidden="true" />Human-reviewed against the authority&rsquo;s published schedule.</p>
                    </dl>
                )}
            </Modal>
        </div>
    );
}
