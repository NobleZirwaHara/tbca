import { router } from '@inertiajs/react';
import { BookOpen, CheckCircle2, ChevronDown, FileText, Globe, Layers, Lock, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { ListToggle } from '@/Components/Aiim/Actions';
import BriefArt from '@/Components/Aiim/BriefArt';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Tabs } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, BriefItem } from '@/types/aiim';
import { addToCart } from './Index';

interface Props extends AiimPageProps {
    brief: BriefItem;
    owned: boolean;
    saved: string[];
}

const TABS = ['Overview', "What's Inside", 'Key Insights', 'Methodology', 'Sources & Evidence', 'Sample Preview', 'Terms & Usage'];

export default function StoreShow({ brief, owned, saved }: Props) {
    const [tab, setTab] = useState('Overview');
    const p = brief.profile ?? {};
    const facts: [string, string][] = [['Coverage', p.coverage], ['Sectors', p.sectors], ['Data Currency', p.currency], ['Sources', p.sources]];
    return (
        <AiimPage
            title={brief.title}
            crumbs={[{ label: 'Premium Intelligence' }, { label: 'Premium Brief Store', href: '/aiim/store' }, { label: 'Premium Brief Detail' }]}
            heading={<>{brief.title}<ListToggle list="saved" type="report" itemKey={brief.sku} saved={saved} variant="icon" /></>}
            description={brief.summary}
            notice={
                <div className="flex max-w-xs gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs">
                    <Lock className="size-8 text-gold-600" />
                    <span><strong className="block text-sm">Premium Brief</strong>{owned ? 'You own this brief. Download it from your entitlements.' : 'This is premium intelligence. Purchase to unlock full access and download.'}</span>
                </div>
            }
            rail={<><SelectionBox /><RailBox title="Need Help?"><p className="mb-3 text-xs text-ink-300">Our team is here to help you find the right intelligence for your decision.</p><ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline-light" className="w-full">Talk to an AIIM Advisor</ButtonLink></RailBox></>}
        >
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <BriefArt image={brief.image} className="h-28 w-48 rounded-[8px]" />
                <div className="flex flex-wrap gap-3 text-xs text-ink-600">
                    <span className="flex items-center gap-1"><FileText className="size-3.5" />{brief.format}</span>
                    <span className="flex items-center gap-1"><Layers className="size-3.5" />{brief.size}</span>
                    <span>{brief.published}</span>
                    <span className="flex items-center gap-1"><Globe className="size-3.5" />South Africa</span>
                    <Chip tone="bad">Synthetic data only</Chip>
                </div>
            </div>
            <Tabs tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_18rem]">
                {tab === 'Overview' && (
                    <>
                        <SectionCard title="Brief Overview">
                            <p className="text-xs text-ink-600">{p.overview ?? brief.summary}</p>
                            <dl className="mt-3 space-y-2 text-xs">
                                {facts.map(([k, v]) => <div key={k} className="grid grid-cols-[6rem_1fr] gap-2"><dt className="text-ink-500">{k}</dt><dd>{v}</dd></div>)}
                                <div className="grid grid-cols-[6rem_1fr] gap-2"><dt className="text-ink-500">Confidence</dt><dd><Chip tone="good">{p.confidence}</Chip></dd></div>
                                <div className="grid grid-cols-[6rem_1fr] gap-2"><dt className="text-ink-500">Verification</dt><dd><Chip tone="good">{p.verification}</Chip></dd></div>
                            </dl>
                        </SectionCard>
                        <div className="space-y-4">
                            <SectionCard title="Key Insights"><ul className="space-y-1.5 text-xs">{(p.insights ?? []).map((i: string) => <li key={i} className="flex gap-1.5"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" />{i}</li>)}</ul></SectionCard>
                            <SectionCard title={<span className="flex items-center gap-1"><ChevronDown className="size-4" />Sample Preview (2 pages)</span>}>
                                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
                                    <div className="rounded border border-parchment-300 p-2 text-[0.6rem]">
                                        <p className="mb-1 font-semibold">Industrial Park Scorecard (Summary)</p>
                                        <table className="w-full"><thead><tr><th className="text-left">Park</th><th>Score</th></tr></thead><tbody>{(p.scorecard ?? [['Park A', 80], ['Park B', 75]]).slice(0, 4).map((r: (string | number)[]) => <tr key={r[0] as string}><td>{r[0]}</td><td className="text-center">{r[1]}</td></tr>)}</tbody></table>
                                    </div>
                                    <div className="rounded border border-parchment-300 p-2 text-[0.6rem]">
                                        <p className="mb-1 font-semibold">Infrastructure Readiness Overview</p>
                                        <ul className="space-y-1">{(p.readiness ?? [['Power Supply', 3], ['Transport Connectivity', 4]]).map(([k, v]: [string, number]) => <li key={k} className="flex justify-between">{k}<span className="text-verified-500">{'●'.repeat(v)}<span className="text-parchment-500">{'●'.repeat(5 - v)}</span></span></li>)}</ul>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded border border-parchment-300 p-2 text-center text-[0.65rem]"><Lock className="size-5" />Full report available after purchase.</div>
                                </div>
                            </SectionCard>
                        </div>
                    </>
                )}
                {tab !== 'Overview' && (
                    <SectionCard title={tab} className="xl:col-span-2">
                        {tab === "What's Inside" && <ul className="list-disc space-y-1 pl-5 text-sm">{(p.inside ?? []).map((i: string) => <li key={i}>{i}</li>)}</ul>}
                        {tab === 'Key Insights' && <ul className="space-y-1.5 text-sm">{(p.insights ?? []).map((i: string) => <li key={i} className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{i}</li>)}</ul>}
                        {tab === 'Methodology' && <p className="text-sm text-ink-600">Desk research across approved Tier 1–3 sources, structured scoring, AI-assisted synthesis and TBCA human review before publication. Methodology notes and assumptions are included with the PDF.</p>}
                        {tab === 'Sources & Evidence' && <p className="text-sm text-ink-600">Sources: {p.sources}. Every figure cites source and date; confidence {p.confidence}, {p.verification}.</p>}
                        {tab === 'Sample Preview' && <p className="text-sm text-ink-600">Two sample pages are shown on the Overview tab. The full brief unlocks after purchase.</p>}
                        {tab === 'Terms & Usage' && <p className="text-sm text-ink-600">Standard Access grants a single-user commercial usage licence. Redistribution or resale requires an Enterprise Licence. No refunds after download.</p>}
                    </SectionCard>
                )}
                <div className="space-y-3">
                    <SectionCard title="Purchase Options">
                        <div className="rounded border border-gold-400 bg-gold-50 p-3">
                            <div className="flex justify-between"><p className="font-semibold">Standard Access</p><p className="text-right font-bold">{zar2(brief.price)}<span className="block text-[0.65rem] font-normal">incl. VAT</span></p></div>
                            <ul className="mt-2 space-y-1 text-xs">{[`Full ${brief.format} report (${brief.size})`, 'Data tables (Excel)', 'Methodology notes', 'Source list', 'Commercial usage licence (single user)'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{t}</li>)}</ul>
                            {owned ? (
                                <ButtonLink href="/aiim/workspace/entitlements" size="sm" className="mt-3 w-full">Open in My Entitlements</ButtonLink>
                            ) : (
                                <>
                                    <Button type="button" size="sm" className="mt-3 w-full" onClick={() => addToCart(brief)}><ShoppingCart className="size-4" />Add to Cart</Button>
                                    <Button type="button" size="sm" variant="outline" className="mt-2 w-full" onClick={() => router.post(`/aiim/store/${brief.sku}/buy`)}>Buy Now</Button>
                                </>
                            )}
                        </div>
                        <div className="mt-3 rounded border border-parchment-400 p-3 text-xs">
                            <div className="flex justify-between"><p className="font-semibold">Enterprise Licence</p><p>From {zar2(brief.enterpriseFrom ?? brief.price * 3)} excl. VAT</p></div>
                            <p className="mt-1 text-ink-500">Multi-user licence, API access and custom delivery options.</p>
                            <ButtonLink href={`/aiim/store/${brief.sku}/configure`} size="sm" variant="outline" className="mt-2 w-full">Configure Custom Report / Request Quote</ButtonLink>
                        </div>
                    </SectionCard>
                    <p className="flex items-center gap-1 text-xs text-ink-400"><BookOpen className="size-3" />Citable, source-backed, decision-ready.</p>
                </div>
            </div>
        </AiimPage>
    );
}
