import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CircleCheck, Download, FileSearch, History, Landmark, Scale, ShieldCheck, Ban, UserSearch, Wallet, Handshake, Receipt } from 'lucide-react';
import { useState } from 'react';
import { CountryFrame, Kpi, NoPrice, SideBox, StatePill } from '@/Components/CorePages/CountryParts';
import { Flag } from '@/Components/CorePages/Kit';
import Icon from '@/Components/ui/Icon';
import type { CountryObject } from '@/types/core-pages';

interface Item { id: string; title: string; domain: string; source: string; class: string; as_of: string; freshness: string; confidence: string; contradictions: number; status: string }

interface Props {
    country: CountryObject;
    domains: { name: string; icon: string; sources: number; current: number }[];
    items: Item[];
    totalItems: number;
    manifest: { label: string; count: number }[];
    classes: string[];
    filters: { domain: string; class: string; freshness: string; confidence: string };
}

export default function Evidence({ country: c, domains, items, totalItems, manifest, classes, filters }: Props) {
    const [f, setF] = useState(filters);
    const iso = c.iso.toLowerCase();
    const apply = (next = f) => router.get(`/find-the-right-service/countries/${iso}/evidence`, next, { preserveState: true, preserveScroll: true, replace: true });
    const nav = [[FileSearch, 'Evidence Panel', `/find-the-right-service/countries/${iso}/evidence`], [Receipt, 'Tax & Statutory', '/find-the-right-service/corridors/za-ae/ledger-s'], [Wallet, 'Payments', `/find-the-right-service/countries/${iso}`], [Handshake, 'Partners', '/partner-services'], [Scale, 'Legal & Regulatory', `/find-the-right-service/countries/${iso}/legal`], [Ban, 'Limitations', `/find-the-right-service/countries/${iso}/services/ZA-BCS-001`], [History, 'Change History', `/find-the-right-service/countries/${iso}/legal`]] as const;

    return (
        <div>
            <Head title={`${c.name} — Country Evidence Panel`} />
            <CountryFrame
                crumbs={[{ label: 'Countries', href: '/find-the-right-service/countries' }, { label: c.name, href: `/find-the-right-service/countries/${iso}` }, { label: 'Evidence Panel' }]}
                title="Country Evidence Panel"
                actions={
                    <>
                        <a href={`/find-the-right-service/countries/${iso}/evidence/download`} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-300 px-3 text-[0.8125rem]"><Download className="size-4" aria-hidden="true" />Download Evidence Pack</a>
                        <Link href="/find-the-right-service/request-human-assistance" className="inline-flex h-9 items-center rounded-[4px] bg-gold-500 px-3 text-[0.8125rem] font-semibold text-ink-900">Request Expert Review</Link>
                    </>
                }
                aside={
                    <>
                        <SideBox title="Source Manifest">
                            <ul className="space-y-1 text-[0.75rem]">{manifest.map((m) => <li key={m.label} className="flex justify-between"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-verified-500" />{m.label}</span><strong>{m.count}</strong></li>)}</ul>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">{manifest.reduce((s, m) => s + m.count, 0)} sources in total</p>
                        </SideBox>
                        <SideBox title="Evidence Filters">
                            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="space-y-2 text-[0.75rem]">
                                {([['domain', 'Domain', domains.map((d) => d.name)], ['class', 'Evidence Class', classes], ['freshness', 'Freshness', ['Current', 'Stale']], ['confidence', 'Confidence', ['High', 'Medium', 'Low']]] as const).map(([k, l, opts]) => (
                                    <label key={k} className="grid grid-cols-[5.5rem_1fr] items-center gap-2">{l}<select value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="h-8 rounded-[4px] border border-parchment-500 text-[0.75rem]"><option value="">All</option>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>
                                ))}
                                <div className="flex gap-3"><button type="submit" className="font-semibold text-gold-700">Apply Filters →</button><button type="button" onClick={() => { const e = { domain: '', class: '', freshness: '', confidence: '' }; setF(e); apply(e); }} className="text-ink-500 underline">Reset</button></div>
                            </form>
                        </SideBox>
                        <SideBox title="Need Expert Insight?">
                            <p className="flex gap-2 text-[0.75rem] text-ink-600"><UserSearch className="size-5 shrink-0" aria-hidden="true" />Book a 1:1 TBCA advisor or sector expert for tailored advice.</p>
                            <Link href="/discovery-call" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-[0.8125rem]"><CalendarDays className="size-4" aria-hidden="true" />Book Discovery Call</Link>
                        </SideBox>
                        <NoPrice />
                    </>
                }
            >
                <div className="grid gap-5 lg:grid-cols-[13rem_1fr]">
                    <nav aria-label="Country profile and evidence" className="space-y-1">
                        <p className="mb-2 text-[0.8125rem] font-bold text-ink-900">Country Profile &amp; Evidence</p>
                        {nav.map(([I, l, h], i) => <Link key={l} href={h} className={i === 0 ? 'flex items-center gap-2 rounded-[6px] border border-gold-400 bg-gold-50 px-3 py-2 text-[0.8125rem] font-semibold' : 'flex items-center gap-2 px-3 py-2 text-[0.8125rem] hover:text-gold-700'}><I className="size-4" aria-hidden="true" />{l}</Link>)}
                        <div className="mt-3 rounded-[6px] border border-parchment-400 p-3 text-[0.75rem]"><p className="font-bold text-ink-900">Country State</p><p className="mt-1 flex items-center gap-1 font-semibold text-verified-700"><CircleCheck className="size-4" aria-hidden="true" />{c.state}</p><p className="text-ink-500">Commercial objects with valid resolver and permission scope.</p></div>
                        <div className="rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-[0.75rem]"><p className="font-bold text-ink-900">Contradiction Status</p><p className="font-semibold text-verified-700">No Open Contradictions</p><p className="text-ink-600">All evidence is consistent across critical domains.</p></div>
                        <Link href="/find-the-right-service/countries" className="flex items-center gap-2 rounded-[6px] border border-parchment-400 p-2 text-[0.75rem]"><Landmark className="size-4" aria-hidden="true" />54 African Countries</Link>
                    </nav>
                    <div>
                        <div className="flex items-center gap-4"><span className="text-[3rem]" aria-hidden="true"><Flag iso={c.iso} /></span><div><p className="text-[1.375rem] font-bold text-ink-900">{c.name}</p><p className="text-[0.75rem] text-ink-500">Phase 1 controlled country environment</p></div></div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Kpi label="Evidence Currentness" value="Current" sub="All critical domains current" icon={<ShieldCheck className="size-6" aria-hidden="true" />} tone="good" />
                            <Kpi label="Contradictions" value="0 Open" sub="No unresolved contradictions" icon={<Scale className="size-6" aria-hidden="true" />} />
                            <Kpi label="Evidence Confidence" value="High" sub="Overall confidence rating" icon={<CircleCheck className="size-6" aria-hidden="true" />} tone="good" />
                            <Kpi label="Last Quality Review" value="15 Aug 2026" sub="Next review: 12 Sep 2026" icon={<CalendarDays className="size-6" aria-hidden="true" />} />
                        </div>
                        <h2 className="mt-5 text-[0.9375rem] font-bold text-ink-900">Evidence Summary by Domain</h2>
                        <ul className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
                            {domains.map((d) => (
                                <li key={d.name}>
                                    <button type="button" onClick={() => { const n = { ...f, domain: f.domain === d.name ? '' : d.name }; setF(n); apply(n); }} aria-pressed={f.domain === d.name} className={f.domain === d.name ? 'w-full rounded-[6px] border border-gold-500 bg-gold-50 p-2.5 text-left' : 'w-full rounded-[6px] border border-parchment-400 p-2.5 text-left hover:border-gold-400'}>
                                        <span className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink-900"><Icon name={d.icon} className="size-4 text-gold-600" />{d.name}</span>
                                        <span className="mt-1 block text-[0.6875rem] text-verified-700">● Current</span>
                                        <span className="mt-1 flex justify-between text-[0.6875rem]"><span>Sources</span><strong>{d.sources}</strong></span>
                                        <span className="flex justify-between text-[0.6875rem]"><span>Current</span><strong>{d.current}</strong></span>
                                        <span className="flex justify-between text-[0.6875rem]"><span>Confidence</span><strong className="text-verified-700">High</strong></span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <h2 className="mt-5 text-[0.9375rem] font-bold text-ink-900">Top Evidence Items</h2>
                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full min-w-[820px] text-left text-[0.75rem]">
                                <thead className="bg-parchment-200 text-ink-600"><tr>{['ID', 'Evidence Title', 'Domain', 'Source', 'Evidence Class', 'As Of', 'Freshness', 'Confidence', 'Contradictions', 'Status'].map((h) => <th key={h} className="px-2 py-1.5">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {items.length === 0 && <tr><td colSpan={10} className="py-4 text-center text-ink-400">No evidence matches these filters.</td></tr>}
                                    {items.map((e) => (
                                        <tr key={e.id}><td className="px-2 py-2 font-mono">{e.id}</td><td className="px-2 py-2 font-medium text-ink-900">{e.title}</td><td className="px-2 py-2">{e.domain}</td><td className="px-2 py-2">{e.source}</td><td className="px-2 py-2">{e.class}</td><td className="px-2 py-2">{e.as_of}</td><td className="px-2 py-2 text-verified-700">{e.freshness}</td><td className={e.confidence === 'High' ? 'px-2 py-2 text-verified-700' : 'px-2 py-2 text-attested-700'}>{e.confidence}</td><td className="px-2 py-2">{e.contradictions}</td><td className="px-2 py-2"><StatePill state={e.status} /></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 flex justify-between text-[0.75rem] text-ink-500"><a href={`/find-the-right-service/countries/${iso}/evidence/download`} className="inline-flex items-center gap-1 font-semibold text-gold-700">Download all evidence items <ArrowRight className="size-3.5" aria-hidden="true" /></a><span>Showing {items.length} of {totalItems} indexed items</span></p>
                    </div>
                </div>
            </CountryFrame>
        </div>
    );
}
