import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, KV, LedgerBadge, Notice, Tracker, zar } from '@/Components/Advisory/ui';
import type { LedgerSummary, MandateEventRow, MandateView } from '@/types/advisory';

interface Props {
    mandate: MandateView;
    ledgers: Record<string, LedgerSummary>;
    events: MandateEventRow[];
    qualification: { answers?: Record<string, string>; signals?: Record<string, string> };
    services: { slug: string; name: string }[];
    rules: [string, string, string, string, string][];
    flags: Record<string, boolean>;
}

export default function MandateShow({ mandate: m, ledgers, events, qualification, services, rules, flags }: Props) {
    const [svc, setSvc] = useState(m.service?.slug ?? services[0].slug);
    const [item, setItem] = useState('');
    const [next, setNext] = useState(m.meta.next_tbca ?? '');
    const act = (data: Record<string, string | number>) => router.post(`/admin/advisory/mandates/${m.reference}`, data, { preserveScroll: true });
    return (
        <AdminShell title={`${m.reference} · ${m.project}`} description={`${m.organisation} · ${m.sector} · ${m.stage}`} crumbs={[{ label: 'Admin', href: '/admin/advisory' }, { label: 'Mandates', href: '/admin/advisory' }, { label: m.reference }]} badge={<StatusPill status={m.status} />}>
            <Head title={`Mandate ${m.reference}`} />
            <div className="rounded-[8px] border border-parchment-400 bg-white p-3"><Tracker items={m.lifecycle} /></div>
            {m.stop_blocks.length > 0 && <Notice tone="bad" className="mt-3">Stop-Now: {m.stop_blocks.map((b) => `${b.code} ${b.message}`).join(' · ')}</Notice>}
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <Card title="Workflow actions">
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" disabled={m.status !== 'enquiry' && m.status !== 'discovery'} onClick={() => act({ action: 'qualify' })}>Qualify (conflicts & capacity cleared)</Button>
                            <Button size="sm" variant="outline" className="border-risk-500 text-risk-700" onClick={() => act({ action: 'decline' })}>Honest decline</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-end gap-2">
                            <label className="text-xs">Method Card service<Select value={svc} onChange={(e) => setSvc(e.target.value)} options={services.map((s) => ({ value: s.slug, label: s.name }))} className="mt-1 w-72" /></label>
                            <Button size="sm" variant="ink" disabled={!['qualified', 'discovery', 'method_card'].includes(m.status)} onClick={() => act({ action: 'method_card', service: svc })}>Issue Method Card & fee schedule</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-end gap-2">
                            <label className="text-xs">Item / deliverable name<Input value={item} onChange={(e) => setItem(e.target.value)} className="mt-1 w-64" /></label>
                            <Button size="sm" variant="outline" onClick={() => act({ action: 'request_evidence', item })}>Request evidence</Button>
                            <Button size="sm" variant="outline" onClick={() => act({ action: 'add_deliverable', item })}>Add deliverable</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-end gap-2">
                            <label className="text-xs">Next TBCA action<Input value={next} onChange={(e) => setNext(e.target.value)} className="mt-1 w-80" /></label>
                            <Button size="sm" variant="outline" onClick={() => act({ action: 'next_tbca', item: next })}>Save</Button>
                        </div>
                    </Card>
                    <Card title="Evidence requests">
                        <ul className="divide-y divide-parchment-300 text-xs">{(m.meta.evidence_requests ?? []).map((r, i) => <li key={i} className="flex items-center justify-between gap-2 py-1.5"><span>{r.item} · required by {r.required_by}</span><span className="flex items-center gap-2"><StatusPill status={r.status} />{r.status === 'Submitted' && <Button size="sm" variant="outline" onClick={() => act({ action: 'accept_evidence', index: i })}>Accept</Button>}</span></li>)}</ul>
                    </Card>
                    <Card title="Deliverables">
                        <ul className="divide-y divide-parchment-300 text-xs">{(m.meta.deliverables ?? []).map((d, i) => <li key={i} className="flex items-center justify-between gap-2 py-1.5"><span>{d.name} ({d.ref}) · due {d.due}</span><span className="flex items-center gap-2"><StatusPill status={d.status} />{d.status === 'In Preparation' && <Button size="sm" variant="outline" onClick={() => act({ action: 'deliver', index: i })}>Mark ready for review</Button>}</span></li>)}</ul>
                    </Card>
                    <Card title="Ledger lines (earn milestones on approved events)">
                        {Object.values(ledgers).map((l) => (
                            <div key={l.ledger} className="mb-3">
                                <p className="flex items-center gap-2 text-xs font-semibold"><LedgerBadge l={l.ledger} size="sm" />{l.name} · paid {zar(l.paid)} · earned {zar(l.earned)}</p>
                                <ul className="mt-1 space-y-1 text-[0.6875rem]">{l.lines.map((x) => <li key={x.id} className="flex items-center justify-between gap-2"><span>{x.item} · {x.gate} · {zar(x.expected)}</span><span className="flex items-center gap-2"><StatusPill status={x.status} />{x.ledger === 'T' && x.earned < x.expected && ['approved', 'invoiced', 'paid'].includes(x.status) && <Button size="sm" variant="ghost" onClick={() => act({ action: 'earn', line: x.id })}>Mark earned</Button>}</span></li>)}</ul>
                            </div>
                        ))}
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Qualification"><KV rows={Object.entries(qualification.signals ?? {})} /><KV className="mt-2" rows={Object.entries(qualification.answers ?? {}).filter(([k]) => !['entry'].includes(k)).slice(0, 10)} /></Card>
                    <Card title="Gates"><ul className="space-y-1 text-xs">{m.gates.map((g) => <li key={g.code} className="flex justify-between"><span>{g.code} {g.name}</span><StatusPill status={g.status} /></li>)}</ul></Card>
                    <Card title="Stop-Now flags (compliance)">
                        <ul className="space-y-1 text-xs">{rules.filter(([c]) => !['SN-01', 'SN-04', 'SN-06', 'SN-07'].includes(c)).map(([c, r]) => <li key={c} className="flex items-center justify-between gap-2"><span>{c} {r}</span><button type="button" onClick={() => act({ action: 'flag', flag: c })} className={flags[c] ? 'rounded bg-risk-50 px-2 text-risk-700' : 'rounded bg-parchment-300 px-2'}>{flags[c] ? 'Raised' : 'Clear'}</button></li>)}</ul>
                    </Card>
                    <Card title="Audit log"><ul className="space-y-1 text-[0.6875rem]">{events.map((e, i) => <li key={i}><span className="text-ink-500">{e.at}</span> {e.actor}: {e.event}</li>)}</ul></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

MandateShow.layout = null;
