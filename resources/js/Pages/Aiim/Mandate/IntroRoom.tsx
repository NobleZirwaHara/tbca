import { useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { Btn, DEAL, Fld, Flow, FormPanel, Panel, QuickLinks, SvcRail, Timeline, eng, inputCls, type Country, type Rail, type TiState } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps, Engagement } from '@/types/aiim';
import type { Intro } from './IntroConsent';

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    intro: Intro | null;
    rail: Rail | null;
}

/** Page 59 Introduction Room: shared space for both parties. */
export default function IntroRoom({ engagement: e, intro, rail }: Props) {
    const form = useForm({ action: 'intro-message', message: '' });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message'), { preserveScroll: true, onSuccess: () => form.reset('message') }); };
    const crumbs = [{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }];
    const side = <>
        {rail && <SvcRail rail={rail} context="Introduction room" />}
        <QuickLinks links={[['Due diligence hand-off', eng(e.reference, '/handoff/dd')], ['Virtual deal room', eng(e.reference, '/handoff/vdr')], ['Project advisory', eng(e.reference, '/handoff/project-advisory')]]} />
    </>;
    if (!intro?.consented) {
        return (
            <Flow title="Introduction Room" eyebrow="Page 59 · Shared space for both parties" steps={{ list: DEAL, on: 2 }} crumbs={crumbs} side={side}>
                <Panel title="Thread">
                    <p className="text-[0.88rem] text-ink-600">The room opens once you give consent to introduce.</p>
                    <div className="mt-3"><Btn href={eng(e.reference, '/introductions')}>Give consent</Btn></div>
                </Panel>
            </Flow>
        );
    }
    const posts = intro.activity.filter((a) => a.text);
    const waiting = intro.parties.some((p) => p.consent_status === 'pending') || !intro.parties.length;
    const items: [ReactNode, TiState][] = [
        ...posts.map((a, i): [ReactNode, TiState] => [<span key={i}><b>{a.who ?? 'TBCA'}</b> — {a.text}{a.at && <span className="text-ink-500"> · {a.at}</span>}</span>, 'done']),
        ...intro.parties.map((p): [ReactNode, TiState] => [<span key={p.name}><b>{p.name}</b> — {p.consent_status === 'accepted' ? `Accepted.${p.contact ? ` Contact: ${p.contact}` : ''}` : p.consent_status === 'declined' ? 'Declined.' : 'Awaiting response.'}</span>, p.consent_status === 'pending' ? 'on' : 'done']),
    ];
    if (!intro.parties.length) items.push([<span key="cp"><b>Counterparty</b> — Awaiting response.</span>, 'on']);
    return (
        <Flow title="Introduction Room" eyebrow={`Page 59 · Shared space for both parties · ${intro.reference}`} steps={{ list: DEAL, on: 2 }} crumbs={crumbs} side={side}>
            <Panel title="Thread"><Timeline items={items} /></Panel>
            <FormPanel title="Message" submit="Send" onSubmit={submit} processing={form.processing} disabled={!form.data.message.trim()}>
                <Fld label="Write a message" error={form.errors.message}><textarea rows={4} className={inputCls} value={form.data.message} onChange={(ev) => form.setData('message', ev.target.value)} /></Fld>
                {waiting && <p className="text-[0.75rem] text-ink-500">Messages are kept in the room record. Contact details are released only after both parties accept.</p>}
            </FormPanel>
        </Flow>
    );
}
