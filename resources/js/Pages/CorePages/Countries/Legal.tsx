import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CircleCheck, Download, ExternalLink, Info, MessageCircle, UserRound } from 'lucide-react';
import { useState } from 'react';
import { CountryFrame, EvidenceStrip, Kpi, SideBox, StatePill } from '@/Components/CorePages/CountryParts';
import { Flag } from '@/Components/CorePages/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Tabs } from '@/Components/ui/Kit';
import Icon from '@/Components/ui/Icon';
import type { CountryObject } from '@/types/core-pages';

interface Authority { name: string; mandate: string; site: string; relevance: string; requirement: string; tab: string }
interface Props {
    country: CountryObject;
    legal: {
        kpis: { label: string; value: string; sub: string; icon: string }[];
        overview: [string, string][];
        implications: string[];
        principles: string[];
        authorities: Authority[];
        status: [string, string][];
        licences: [string, string, string][];
        sector: [string, string][];
        obligations: [string, string][];
        disputes: [string, string][];
        changes: [string, string][];
    };
}

const TABS = [['overview', 'Overview'], ['framework', 'Legal Framework'], ['authorities', 'Regulatory Authorities'], ['licences', 'Licences & Registrations'], ['sector', 'Sector Restrictions'], ['compliance', 'Compliance Obligations'], ['disputes', 'Dispute Resolution'], ['changes', 'Change History']];

export default function Legal({ country: c, legal: l }: Props) {
    const [tab, setTab] = useState('overview');
    const [showAll, setShowAll] = useState(false);
    const iso = c.iso.toLowerCase();
    const authorities = showAll || tab === 'authorities' ? l.authorities : l.authorities.slice(0, 5);

    const summary = [`${c.name} — Legal and Regulatory Boundary`, '', ...l.overview.map(([k, v]) => `${k}: ${v}`), '', 'Key implications:', ...l.implications.map((x) => `- ${x}`), '', 'Authorities:', ...l.authorities.map((a) => `- ${a.name} (${a.relevance}): ${a.requirement}`), '', 'Information only. Not legal or tax advice.'].join('\n');
    const summaryHref = `data:text/plain;charset=utf-8,${encodeURIComponent(summary)}`;

    const Rows = ({ rows }: { rows: string[][] }) => (
        <table className="w-full text-left text-[0.8125rem]"><tbody className="divide-y divide-parchment-300">{rows.map((r) => <tr key={r[0]}>{r.map((x, i) => <td key={i} className={i === 0 ? 'py-2 pr-3 font-medium text-ink-900' : 'py-2 pr-3 text-ink-600'}>{x}</td>)}</tr>)}</tbody></table>
    );

    return (
        <div>
            <Head title={`${c.name} — Legal and Regulatory Boundary`} />
            <CountryFrame
                crumbs={[{ label: 'Countries', href: '/find-the-right-service/countries' }, { label: c.name, href: `/find-the-right-service/countries/${iso}` }, { label: 'Legal and Regulatory Boundary' }]}
                title="Country Legal and Regulatory Boundary"
                lead={`Understand jurisdictional limits, licensing requirements, regulatory scope and legal boundaries for commercial engagement in ${c.name}.`}
                actions={<Link href={`/find-the-right-service/countries/${iso}`} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Country Profile</Link>}
                aside={
                    <>
                        <SideBox title="Legal & Regulatory Compliance Status">
                            <dl className="space-y-1.5 text-[0.75rem]">{l.status.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className={['Compliant', 'Complete'].includes(v) ? 'flex items-center gap-1 font-semibold text-verified-700' : 'font-semibold'}>{v === 'Compliant' && <CircleCheck className="size-3.5" aria-hidden="true" />}{v}</dd></div>)}</dl>
                        </SideBox>
                        <SideBox tone="warn"><p className="flex gap-2 text-[0.75rem] text-ink-700"><Info className="size-4 shrink-0 text-attested-700" aria-hidden="true" /><span><strong className="block">Important</strong>This information is general in nature and does not constitute legal advice. Specific legal advice must be obtained for your circumstances.</span></p></SideBox>
                        <SideBox title="Actions">
                            <div className="space-y-2 text-[0.8125rem]">
                                <button type="button" onClick={() => setTab('framework')} className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-[4px] bg-gold-500 font-semibold text-ink-900">View Legal Framework <ArrowRight className="size-4" aria-hidden="true" /></button>
                                <button type="button" onClick={() => setTab('authorities')} className="inline-flex h-9 w-full items-center justify-center rounded-[4px] border border-ink-300">View Regulatory Authorities</button>
                                <button type="button" onClick={() => setTab('licences')} className="inline-flex h-9 w-full items-center justify-center rounded-[4px] border border-ink-300">View Licences &amp; Registrations</button>
                                <a href={summaryHref} download={`${c.iso}-legal-boundary-guide.txt`} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300"><Download className="size-4" aria-hidden="true" />Download Legal Boundary Guide</a>
                                <a href={summaryHref} download={`${c.iso}-legal-summary.txt`} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300"><Download className="size-4" aria-hidden="true" />Export Legal Summary</a>
                                <button type="button" onClick={() => openAskQuestion({ subject: `Legal boundary question: ${c.name}`, section: 'core' })} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300"><MessageCircle className="size-4" aria-hidden="true" />Ask a Legal Advisor</button>
                            </div>
                        </SideBox>
                        <SideBox tone="good" title="Need Legal Guidance?">
                            <p className="flex gap-2 text-[0.75rem] text-ink-700"><UserRound className="size-5 shrink-0" aria-hidden="true" />Speak to a TBCA legal advisor for tailored guidance on legal and regulatory matters (delivered by licensed partners).</p>
                            <Link href="/partner-services" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1 rounded-[4px] border border-ink-300 bg-white text-[0.8125rem]">Speak to a Legal Advisor <ArrowRight className="size-4" aria-hidden="true" /></Link>
                        </SideBox>
                    </>
                }
            >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="flex items-center gap-3 rounded-[8px] border border-parchment-400 p-3"><span className="text-[2.5rem]" aria-hidden="true"><Flag iso={c.iso} /></span><div><p className="text-[1.125rem] font-bold text-ink-900">{c.name}</p><p className="text-[0.6875rem] text-ink-500">{`Africa (Active) · ${c.region}`}</p><StatePill state={c.state} /></div></div>
                    {l.kpis.map((k) => <Kpi key={k.label} label={k.label} value={k.value} sub={k.sub} icon={<Icon name={k.icon} className="size-6" />} />)}
                </div>
                <Tabs className="mt-5" value={tab} onChange={setTab} tabs={TABS.map(([key, label]) => ({ key, label }))} />
                <div className="mt-4 space-y-4">
                    {(tab === 'overview' || tab === 'framework') && (
                        <div className="grid gap-4 lg:grid-cols-2">
                            <SideBox title="Jurisdictional Overview">
                                <p className="mb-2 text-[0.75rem] text-ink-600">{c.name} operates under a constitutional democracy with an independent judiciary.</p>
                                <dl className="space-y-1 text-[0.75rem]">{l.overview.map(([k, v]) => <div key={k} className="grid grid-cols-[10rem_1fr] gap-2"><dt className="font-medium text-ink-900">{k}</dt><dd className="text-ink-600">{v}</dd></div>)}</dl>
                            </SideBox>
                            <div className="space-y-4">
                                <SideBox title="Key Legal Implications for Engagement"><ul className="space-y-1.5 text-[0.75rem]">{l.implications.map((x) => <li key={x} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{x}</li>)}</ul></SideBox>
                                <SideBox title="Regulatory Boundary Principles"><ul className="space-y-1.5 text-[0.75rem]">{l.principles.map((x) => <li key={x} className="flex gap-2"><Info className="size-4 shrink-0 text-controlled-500" aria-hidden="true" />{x}</li>)}</ul></SideBox>
                            </div>
                        </div>
                    )}
                    {(tab === 'overview' || tab === 'authorities') && (
                        <SideBox title="Key Regulatory Authorities">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left text-[0.75rem]">
                                    <thead className="text-ink-500"><tr>{['Authority', 'Mandate', 'Website', 'Relevance', 'Engagement Requirement'].map((h) => <th key={h} className="py-1.5 pr-2">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-parchment-300">{authorities.map((a) => <tr key={a.name}><td className="py-2 pr-2 font-medium text-ink-900">{a.name}</td><td className="py-2 pr-2">{a.mandate}</td><td className="py-2 pr-2"><a href={`https://${a.site}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-controlled-700">{a.site}<ExternalLink className="size-3" aria-hidden="true" /></a></td><td className="py-2 pr-2"><StatePill state={a.relevance === 'High' ? 'Active' : a.relevance} /></td><td className="py-2 pr-2">{a.requirement}</td></tr>)}</tbody>
                                </table>
                            </div>
                            {tab === 'overview' && <button type="button" onClick={() => setShowAll(!showAll)} className="mx-auto mt-3 flex h-9 items-center gap-1 rounded-[4px] border border-ink-300 px-4 text-[0.8125rem]">{showAll ? 'Show fewer' : `View All Regulatory Authorities (${l.authorities.length})`} <ArrowRight className="size-4" aria-hidden="true" /></button>}
                        </SideBox>
                    )}
                    {tab === 'licences' && <SideBox title="Licences & Registrations"><Rows rows={[['Licence / Registration', 'Applies to', 'When'], ...l.licences]} /></SideBox>}
                    {tab === 'sector' && <SideBox title="Sector Restrictions"><Rows rows={l.sector} /></SideBox>}
                    {tab === 'compliance' && <SideBox title="Compliance Obligations"><Rows rows={l.obligations} /></SideBox>}
                    {tab === 'disputes' && <SideBox title="Dispute Resolution"><Rows rows={l.disputes} /></SideBox>}
                    {tab === 'changes' && <SideBox title="Change History"><Rows rows={l.changes} /></SideBox>}
                </div>
                <EvidenceStrip extra={{ title: 'Audit Ready', body: 'Full change history and audit trail maintained.' }} />
            </CountryFrame>
        </div>
    );
}
