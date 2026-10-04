import { Link } from '@inertiajs/react';
import { CheckCircle2, Info, ShieldAlert, Target } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { SectionCard } from '@/Components/Aiim/Shell';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

export interface Party { id: number; name: string; type: string; focus: string; stage: string; fit_score: number; location: string; selected: boolean; consent_status: string; engagement_status: string | null; responded: string | null; contact: string | null }
export interface Intro { reference: string; project: string; projectInfo: Record<string, string>; sharing: { key: string; label: string; share: boolean; state?: string }[]; status: string; consented: string | null; consentName: string | null; roomOpen: boolean; activity: any[]; parties: Party[] }

const TABS = ['Introduction Overview', 'Investor(s) to be Introduced', 'Information to be Shared', 'Terms of Introduction', 'Confidentiality & Consent', 'Activity Log'];

export default function IntroConsent({ engagement: e, intro }: AiimPageProps & { engagement: Engagement; intro: Intro | null }) {
    const [tab, setTab] = useState(TABS[0]);
    const [agree, setAgree] = useState(false);
    if (!intro) {
        return <MandateFrame e={e} title="Introduction Consent" description="No introduction has been prepared for this mandate yet." guidance="Your advisor prepares an introduction shortlist after investor matching." stage="Introduction Consent"><SectionCard><p className="text-sm">No introduction yet.</p></SectionCard></MandateFrame>;
    }
    const selected = intro.parties.filter((p) => p.selected);
    return (
        <MandateFrame
            e={e}
            title="Introduction Consent"
            description="Review and provide consent before TBCA introduces you and your project to selected investors."
            guidance="Review the selected investor(s), information that will be shared, and the terms of introduction before granting consent."
            stage="Introduction Consent"
            progress={intro.consented ? 100 : 10}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
        >
            <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_16rem]">
                <div className="space-y-4">
                    <SectionCard title="Project / Opportunity"><p className="font-semibold">{intro.project}</p><dl className="mt-1 space-y-0.5 text-xs">{Object.entries(intro.projectInfo).map(([k, v]) => <div key={k} className="capitalize">{k}: {v}</div>)}</dl></SectionCard>
                    <SectionCard title="Introduction Purpose"><ul className="space-y-1.5 text-xs">{['Access growth capital for project development', 'Strategic partnership and co-investment', 'Long-term financing and off-take agreements', 'Technical support and market access'].map((t) => <li key={t} className="flex gap-1.5"><Target className="size-3.5 text-referenced-500" />{t}</li>)}</ul></SectionCard>
                </div>
                <div className="space-y-4">
                    <p className="flex gap-2 rounded-[8px] border border-attested-500/40 bg-attested-50 p-3 text-xs text-attested-700"><ShieldAlert className="size-5 shrink-0" /><span><strong className="block">Important: Your Consent is Required</strong>TBCA will only introduce your project to the investor(s) listed below with your explicit consent. You control what information is shared and when. Investors must also accept before contact details are exchanged (two-party consent, gate G10).</span></p>
                    <SectionCard title="Investor(s) to be Introduced">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] text-xs"><thead className="text-ink-500"><tr>{['#', 'Investor / Fund', 'Type', 'Focus & Strategy', 'Stage', 'Fit Score', 'Location', 'Included', 'Counterparty'].map((h) => <th key={h} className="px-1.5 py-1 text-left">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">{intro.parties.map((p, i) => <tr key={p.id}><td className="px-1.5 py-1.5">{i + 1}</td><td className="px-1.5 font-semibold text-referenced-700">{p.name}</td><td className="px-1.5">{p.type}</td><td className="px-1.5">{p.focus}</td><td className="px-1.5">{p.stage}</td><td className="px-1.5">{p.fit_score}% <Chip tone={p.fit_score >= 85 ? 'good' : 'purple'}>{p.fit_score >= 85 ? 'High' : 'Good'}</Chip></td><td className="px-1.5">{p.location}</td><td className="px-1.5">{p.selected ? <CheckCircle2 className="size-4 text-verified-500" /> : '—'}</td><td className="px-1.5"><Chip tone={p.consent_status === 'accepted' ? 'good' : p.consent_status === 'declined' ? 'bad' : 'warn'}>{p.consent_status}</Chip></td></tr>)}</tbody>
                            </table>
                        </div>
                    </SectionCard>
                    <SectionCard title="Your Consent">
                        {intro.consented ? (
                            <p className="text-sm text-verified-700">Consent granted by {intro.consentName} on {intro.consented}. {intro.roomOpen ? <Link href={`/aiim/workspace/engagements/${e.reference}/introductions/room`} className="font-semibold underline">Open Introduction Room →</Link> : 'Awaiting counterparty acceptance before the room opens.'}</p>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs text-ink-600">By granting consent, you authorise TBCA to introduce you and your project to the {selected.length} selected investor(s) on the terms set out in this mandate.</p>
                                <Checkbox checked={agree} onChange={(x) => setAgree(x.target.checked)} label="I have read and understood the information to be shared and the terms of introduction. I consent to TBCA introducing my project to the selected investor(s)." />
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Field label="Full Name">{(id) => <Input id={id} defaultValue={e.client.name} />}</Field>
                                    <Field label="Title / Position">{(id) => <Input id={id} placeholder="Managing Director" />}</Field>
                                    <Field label="Date">{(id) => <Input id={id} type="date" defaultValue={new Date().toISOString().slice(0, 10)} />}</Field>
                                </div>
                                <div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled>Request Changes</Button><Button type="button" size="sm" disabled={!agree} title="Consent capture is being connected">Grant Consent &amp; Proceed</Button></div>
                            </div>
                        )}
                    </SectionCard>
                </div>
                <div className="space-y-4">
                    <SectionCard title="Information to be Shared"><ul className="space-y-1.5 text-xs">{intro.sharing.map((s) => <li key={s.key} className="flex justify-between gap-2"><span>{s.label}</span><Chip tone={s.share ? 'good' : 'dark'}>{s.share ? 'Yes' : 'No'}</Chip></li>)}</ul></SectionCard>
                    <SectionCard title="Terms of Introduction Summary"><ul className="space-y-1.5 text-xs">{['TBCA acts as an introduction facilitator only.', 'No exclusivity granted unless agreed in writing.', 'Investor(s) will be informed of your consent.', 'All introductions are confidential.', 'You may withdraw consent at any time.'].map((t) => <li key={t} className="flex gap-1.5"><Info className="size-3.5 text-referenced-500" />{t}</li>)}</ul></SectionCard>
                </div>
            </div>
        </MandateFrame>
    );
}
