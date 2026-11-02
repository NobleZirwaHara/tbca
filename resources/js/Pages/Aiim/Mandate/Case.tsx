import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Banner, Chk, Fld, Flow, FormPanel, Panel, Pill, Table, Timeline, eng, inputCls, type Country, type Svc } from '@/Components/Aiim/ProtoEngagement';
import { useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

type Kind = 'change' | 'refund' | 'dispute' | 'pause' | 'restart' | 'cancel';

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    kind: Kind;
    orders: { value: string; label: string }[];
    cases: { reference: string; status: string; created: string; amount: number | null }[];
    services: Svc[];
}

const META: Record<Kind, { no: number; title: string; code?: string }> = {
    change: { no: 64, title: 'Scope Change Approval', code: 'Scope-change note and re-approval (AAB-EMB-235)' },
    refund: { no: 65, title: 'Refund Request' },
    dispute: { no: 66, title: 'Dispute Case', code: 'AAB-EMB-241' },
    pause: { no: 67, title: 'Pause Mandate' },
    restart: { no: 68, title: 'Restart Mandate' },
    cancel: { no: 69, title: 'Cancellation' },
};

/** Page 64 Scope Change Approval and pages 65–69, the prototype's caseForm(). */
export default function Case(p: Props) {
    return p.kind === 'change' ? <ScopeChange {...p} /> : <CaseForm {...p} />;
}

function Previous({ cases }: { cases: Props['cases'] }) {
    const money = useMoney();
    if (!cases.length) return null;
    return (
        <Panel title="Your requests">
            <Table head={['Reference', 'Status', 'Submitted', 'Amount']} rows={cases.map((c) => [<span className="font-mono">{c.reference}</span>, <Pill s={c.status} />, c.created, c.amount ? money(c.amount) : '—'])} />
        </Panel>
    );
}

const crumbs = (e: Engagement) => [{ label: 'Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }];

function ScopeChange({ engagement: e, services, cases }: Props) {
    const money = useMoney();
    const form = useForm({ action: 'change', what: '', service: services[0]?.code ?? '', approve: false });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message')); };
    const err = form.errors as Record<string, string>;
    const m = META.change;
    return (
        <Flow title={m.title} eyebrow={`Page ${m.no} · ${m.code}`} crumbs={crumbs(e)}
            side={<Banner>Approving a change opens the secure checkout for the revised fee. The change is added to the mandate once paid.</Banner>}>
            <FormPanel title="Scope change" submit="Approve change" onSubmit={submit} processing={form.processing} back={eng(e.reference)}>
                <Fld label="What changes" error={err.what}><textarea rows={4} className={inputCls} value={form.data.what} onChange={(ev) => form.setData('what', ev.target.value)} placeholder="e.g. add Ghanzi and Kgalagadi solar sites to the verification scope" /></Fld>
                <Fld label="Additional service" error={err.service}>
                    <select className={inputCls} value={form.data.service} onChange={(ev) => form.setData('service', ev.target.value)}>
                        {services.map((s) => <option key={s.code} value={s.code}>{s.name} — {s.price ? money(s.price) : 'Not in the app catalogue yet'}</option>)}
                    </select>
                </Fld>
                <Chk checked={form.data.approve} onChange={(v) => form.setData('approve', v)} error={err.approve}>I approve the revised fee and timeline.</Chk>
            </FormPanel>
            <Previous cases={cases} />
        </Flow>
    );
}

function CaseForm({ engagement: e, kind, orders, cases }: Props) {
    const m = META[kind];
    const reasons: Partial<Record<Kind, string[]>> = {
        refund: ['Not delivered on time', 'Not as described', 'Duplicate charge', 'Other'],
        dispute: ['Quality of deliverable', 'Fee or invoice', 'Data accuracy', 'Conduct'],
        cancel: ['No longer needed', 'Budget', 'Changed market', 'Other'],
    };
    const form = useForm({ action: kind, order: orders[0]?.value ?? '', reason: reasons[kind]?.[0] ?? '', details: '', date: '', flag: kind === 'restart' });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message')); };
    const err = form.errors as Record<string, string>;
    const set = (k: 'reason' | 'details' | 'date') => (ev: { target: { value: string } }) => form.setData(k, ev.target.value);
    return (
        <Flow title={m.title} eyebrow={`Page ${m.no}${m.code ? ` · ${m.code}` : ''}`} crumbs={crumbs(e)}
            side={<Panel title="How it works"><Timeline items={['Submitted', 'Acknowledged within 1 business day', 'Reviewed by finance and the delivery owner', 'Decision and ledger entry'].map((s, i) => [s, i === 0 ? 'on' : ''])} /></Panel>}>
            <FormPanel title={m.title} submit="Submit" onSubmit={submit} processing={form.processing} back={eng(e.reference)}>
                <Fld label="Order or engagement" error={err.order}>
                    <select className={inputCls} value={form.data.order} onChange={(ev) => form.setData('order', ev.target.value)}>{orders.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                </Fld>
                {reasons[kind] && (
                    <Fld label={kind === 'dispute' ? 'Issue' : 'Reason'} error={err.reason}>
                        <select className={inputCls} value={form.data.reason} onChange={set('reason')}>{reasons[kind]!.map((r) => <option key={r}>{r}</option>)}</select>
                    </Fld>
                )}
                {kind === 'pause' && <Fld label="Pause until" error={err.date}><input type="date" className={inputCls} value={form.data.date} onChange={set('date')} /></Fld>}
                {kind === 'restart' && <Fld label="Restart on" error={err.date}><input type="date" className={inputCls} value={form.data.date} onChange={set('date')} /></Fld>}
                {kind === 'pause' && <Fld label="Reason" error={err.reason}><textarea rows={4} className={inputCls} value={form.data.reason} onChange={set('reason')} /></Fld>}
                {(kind === 'refund' || kind === 'dispute') && <Fld label={kind === 'dispute' ? 'Describe the issue' : 'Details'} error={err.details}><textarea rows={4} className={inputCls} value={form.data.details} onChange={set('details')} /></Fld>}
                {kind === 'dispute' && <Chk checked={form.data.flag} onChange={(v) => form.setData('flag', v)}>Attach evidence later from my workspace</Chk>}
                {kind === 'restart' && <Chk checked={form.data.flag} onChange={(v) => form.setData('flag', v)}>Refresh evidence to the latest BW edition before restarting</Chk>}
                {kind === 'cancel' && <Chk checked={form.data.flag} onChange={(v) => form.setData('flag', v)} error={err.flag}>I understand work completed to date is billable.</Chk>}
            </FormPanel>
            <Previous cases={cases} />
        </Flow>
    );
}
