import { Link } from '@inertiajs/react';
import { CheckCircle2, Lock, Shield } from 'lucide-react';
import { useState } from 'react';
import { Donut } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import { Avatar, MandateFrame } from '@/Components/Aiim/EngagementKit';
import { SectionCard } from '@/Components/Aiim/Shell';
import type { AiimPageProps, Engagement } from '@/types/aiim';
import type { Intro } from './IntroConsent';

const TABS = ['Room Overview', 'Participants', 'Shared Information', 'Conversations', 'Meetings & Calls', 'Requests', 'Activity Log', 'Documents'];

export default function IntroRoom({ engagement: e, intro }: AiimPageProps & { engagement: Engagement; intro: Intro | null }) {
    const [tab, setTab] = useState(TABS[0]);
    const open = intro?.roomOpen ?? false;
    const parties = (intro?.parties ?? []).filter((p) => p.selected);
    const shared = intro?.sharing.filter((s) => s.share) ?? [];
    return (
        <MandateFrame
            e={e}
            title="Introduction Room"
            description="A secure, moderated space for initial engagement and information exchange between you and the introduced investors."
            guidance="Use this room to share executive information and schedule meetings. TBCA moderates all communications."
            stage="Introduction"
            statusLabel={open ? 'Active' : 'Locked'}
            progress={open ? 25 : 0}
            tabs={TABS}
            tab={tab}
            onTab={setTab}
        >
            {!open ? (
                <SectionCard>
                    <div className="flex flex-wrap items-center gap-4">
                        <Lock className="size-10 text-gold-600" />
                        <div className="flex-1">
                            <h2 className="font-semibold">The room opens once both parties consent</h2>
                            <p className="text-sm text-ink-600">Client consent: <strong>{intro?.consented ? `granted ${intro.consented}` : 'not yet granted'}</strong>. Counterparty acceptances: <strong>{parties.filter((p) => p.consent_status === 'accepted').length}</strong> of {parties.length}. Contact details stay hidden until each counterparty accepts.</p>
                        </div>
                        <Link href={`/aiim/workspace/engagements/${e.reference}/introductions`} className="rounded bg-gold-500 px-3 py-2 text-sm font-semibold text-ink-900">Review Introduction Consent</Link>
                    </div>
                </SectionCard>
            ) : (
                <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_16rem]">
                    <div className="space-y-4">
                        <SectionCard title="Introduction Summary"><dl className="space-y-1 text-xs">{[['Introduction ID', intro!.reference], ['Introduced By', `TBCA (${e.advisor?.name ?? 'Advisor'})`], ['Investors Introduced', String(parties.length)], ['Responses Received', `${parties.filter((p) => p.responded).length} of ${parties.length}`], ['Confidentiality', 'ACTIVE'], ['Room Status', 'OPEN']].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></SectionCard>
                        <SectionCard title="Room Guidelines"><ul className="space-y-1.5 text-xs">{['All communications are confidential.', 'Share only information listed as approved.', 'No pricing or sensitive data without approval.', 'TBCA moderates all interactions.', 'All actions are logged and auditable.'].map((t) => <li key={t} className="flex gap-1.5"><Shield className="size-3.5 text-referenced-500" />{t}</li>)}</ul></SectionCard>
                    </div>
                    <SectionCard title="Introduced Investors">
                        <ul className="grid gap-3 sm:grid-cols-3">{parties.map((p) => <li key={p.id} className="rounded border border-parchment-400 p-3 text-xs"><div className="flex items-center gap-2"><Avatar name={p.name} size="sm" /><span><strong className="block">{p.name}</strong>{p.type}</span></div><p className="mt-1 text-ink-500">{p.location}</p><Chip tone={p.consent_status === 'accepted' ? 'good' : 'warn'} className="mt-2">{p.engagement_status ?? p.consent_status}</Chip>{p.contact ? <p className="mt-1 text-verified-700">{p.contact}</p> : <p className="mt-1 flex items-center gap-1 text-ink-400"><Lock className="size-3" />Contact hidden until accepted</p>}</li>)}</ul>
                    </SectionCard>
                    <SectionCard title="Information Sharing Status">
                        <Donut centre={String(intro!.sharing.length)} sub="Information Packs" data={[{ label: 'Shared', value: shared.length }, { label: 'Not Shared', value: intro!.sharing.length - shared.length }]} size={110} />
                        <ul className="mt-3 space-y-1 text-xs">{intro!.sharing.map((s) => <li key={s.key} className="flex justify-between"><span>{s.label}</span>{s.share ? <CheckCircle2 className="size-3.5 text-verified-500" /> : '—'}</li>)}</ul>
                    </SectionCard>
                </div>
            )}
        </MandateFrame>
    );
}
