import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BriefCta, Btn, Chk, DEAL, Dl, Flow, FormPanel, Panel, eng, type Country, type Svc } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps, Engagement } from '@/types/aiim';

export interface Intro {
    reference: string;
    project: string;
    status: string;
    consented: string | null;
    consentName: string | null;
    roomOpen: boolean;
    activity: { who?: string; text?: string; at?: string; [k: string]: unknown }[];
    sharing: { label: string; share: boolean }[];
    parties: { name: string; type: string; consent_status: string; engagement_status: string | null; contact: string | null }[];
}

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    intro: Intro | null;
    brief: Svc | null;
}

/** Page 58 Introduction Consent. */
export default function IntroConsent({ engagement: e, intro, brief }: Props) {
    const form = useForm({ action: 'consent', share: false, verified: false });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message')); };
    const err = form.errors as Record<string, string>;
    const to = intro?.parties.length ? intro.parties.map((p) => p.name).join('; ') : 'Counterparty named in the lead';
    const shared = intro?.sharing.filter((s) => s.share).map((s) => s.label).join(', ');
    const side = <BriefCta title="Pre-introduction verification" sub="Verify the counterparty before consenting" s={brief} label="Verify" context={e.title} />;
    if (intro?.consented) {
        return (
            <Flow title="Introduction Consent" eyebrow="Page 58" steps={{ list: DEAL, on: 1 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }]} side={side}>
                <Panel title="Consent given">
                    <Dl rows={[['Introduction', <span className="font-mono">{intro.reference}</span>], ['Consented', `${intro.consented} by ${intro.consentName ?? ''}`], ['To', to], ['Status', intro.status.replace(/_/g, ' ')]]} />
                    <div className="mt-3"><Btn href={eng(e.reference, '/introductions/room')}>Open introduction room</Btn></div>
                </Panel>
            </Flow>
        );
    }
    return (
        <Flow title="Introduction Consent" eyebrow="Page 58" steps={{ list: DEAL, on: 1 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }]} side={side}>
            <FormPanel title="Consent to introduce" submit="Send introduction request" onSubmit={submit} processing={form.processing} back={eng(e.reference, '/packaging')}>
                <Dl rows={[
                    ['From', `You (${[e.client.name, e.client.company].filter(Boolean).join(', ')})`],
                    ['To', to],
                    ['What is shared', shared || 'Name, organisation, project teaser, ticket band'],
                    ['Not shared', 'Contact details until both parties accept'],
                ]} />
                <Chk checked={form.data.share} onChange={(v) => form.setData('share', v)} error={err.share}>I consent to TBCA sharing my teaser with the named counterparty.</Chk>
                <Chk checked={form.data.verified} onChange={(v) => form.setData('verified', v)} error={err.verified}>I confirm the counterparty has been verified or I waive verification.</Chk>
            </FormPanel>
        </Flow>
    );
}
