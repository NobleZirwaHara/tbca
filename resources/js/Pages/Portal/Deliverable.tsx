import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Download, FileText, Share2 } from 'lucide-react';
import PortalShell from '@/Components/Portal/PortalShell';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Panel, StatusPill } from '@/Components/ui/Kit';

interface Props {
    deliverable: {
        id: number;
        reference: string;
        title: string;
        type: string;
        format: string;
        version: string;
        qa: string;
        release: string;
        releaseLabel: string;
        acceptance: string;
        decisionType: string;
        releasedAt: string | null;
        acceptanceDue: string | null;
        daysLeft: number | null;
        decidedAt: string | null;
        decisionNote: string | null;
        fileName: string | null;
        size: string;
        pages: number;
        checksum: string | null;
        confidentiality: string;
        tags: string[];
        topics: string[];
        versions: { version: string; state: string; date: string; pages: number; size: number; by: string; note: string }[];
        description: string | null;
        project: { name: string; reference: string } | null;
        requestedBy: string;
        canDecide: boolean;
        shares: { token: string; recipient: string | null; status: string; expires: string | null }[];
    };
}

/** CP-SCR-044 Deliverable Detail with acceptance / correction / dispute decision. */
export default function Deliverable({ deliverable: d }: Props) {
    const decision = useForm({ decision: 'accept', note: '' });
    const share = useForm({ recipient: '', days: '7' });

    const info: [string, string | null][] = [
        ['Title', d.title],
        ['Type', `${d.type} (${d.format})`],
        ['Project / Service', d.project?.name ?? '—'],
        ['Engagement ID', d.reference],
        ['Version', `${d.version} (Latest)`],
        ['Release State', d.releaseLabel],
        ['Released On', d.releasedAt],
        ['File Name', d.fileName],
        ['File Size', d.size],
        ['Pages', d.pages ? String(d.pages) : '—'],
        ['Checksum', d.checksum],
        ['Confidentiality', d.confidentiality],
    ];

    return (
        <PortalShell
            title={d.title}
            code={`v${d.version}`}
            icon="package"
            subtitle={`${d.type} (${d.format}) · ${d.releaseLabel}${d.releasedAt ? ` · Released on ${d.releasedAt}` : ''}`}
            crumbs={[{ label: 'Deliverables', href: '/portal/deliverables' }, { label: d.reference }]}
            actions={
                <>
                    <a href={`/portal/deliverables/${d.id}/download`} className="inline-flex items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 py-1.5 text-[0.8125rem] hover:border-gold-500">
                        <Download className="size-4" aria-hidden="true" /> Download
                    </a>
                    {d.project && (
                        <Link href={`/portal/projects/${d.project.reference}`} className="inline-flex items-center rounded-[4px] border border-parchment-500 bg-white px-3 py-1.5 text-[0.8125rem] hover:border-gold-500">
                            Go to Project
                        </Link>
                    )}
                </>
            }
        >
            <Head title={d.title} />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-5 lg:grid-cols-[14rem_1fr]">
                        <div className="flex aspect-[3/4] flex-col justify-between rounded-[8px] bg-gradient-to-br from-ink-900 via-ink-800 to-gold-700 p-5 text-parchment-100">
                            <FileText className="size-8 text-gold-300" aria-hidden="true" />
                            <div>
                                <p className="font-serif text-lg leading-tight font-bold">{d.title}</p>
                                <p className="mt-1 text-xs text-gold-200">The Business Clinic.Africa</p>
                            </div>
                        </div>
                        <Panel title="Deliverable Information">
                            <dl className="grid gap-x-4 gap-y-1.5 text-[0.8125rem] sm:grid-cols-2">
                                {info.map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-2 border-b border-parchment-200 py-1">
                                        <dt className="text-ink-500">{k}</dt>
                                        <dd className="truncate text-right font-medium text-ink-900">{v ?? '—'}</dd>
                                    </div>
                                ))}
                            </dl>
                            <div className="mt-3 flex flex-wrap gap-1">
                                {d.tags.map((t) => (
                                    <span key={t} className="rounded-full bg-parchment-300 px-2 py-0.5 text-[0.6875rem]">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </Panel>
                    </div>

                    <Panel title="Description">
                        <p className="text-sm text-ink-700">{d.description}</p>
                        <p className="mt-3 text-xs font-bold tracking-wide text-ink-500 uppercase">Key topics covered</p>
                        <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                            {d.topics.map((t) => (
                                <li key={t} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> {t}
                                </li>
                            ))}
                        </ul>
                    </Panel>

                    <Panel title="Version Summary">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[0.8125rem]">
                                <thead className="text-xs text-ink-500">
                                    <tr>
                                        <th className="py-1.5 pr-3">Version</th>
                                        <th className="py-1.5 pr-3">Release State</th>
                                        <th className="py-1.5 pr-3">Released On</th>
                                        <th className="py-1.5 pr-3">Pages</th>
                                        <th className="py-1.5 pr-3">Released By</th>
                                        <th className="py-1.5">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {d.versions.map((v) => (
                                        <tr key={v.version}>
                                            <td className="py-1.5 pr-3 font-semibold">{v.version}</td>
                                            <td className="py-1.5 pr-3">
                                                <StatusPill status={v.state} />
                                            </td>
                                            <td className="py-1.5 pr-3">{v.date}</td>
                                            <td className="py-1.5 pr-3">{v.pages}</td>
                                            <td className="py-1.5 pr-3">{v.by}</td>
                                            <td className="py-1.5">{v.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </div>

                <aside className="space-y-4">
                    <Panel title="Delivery & Acceptance Status">
                        <ul className="space-y-2 text-[0.8125rem]">
                            <li className="flex justify-between">
                                QA <StatusPill status={d.qa.replace('_', ' ')} />
                            </li>
                            <li className="flex justify-between">
                                Release <StatusPill status={d.releaseLabel} />
                            </li>
                            <li className="flex justify-between">
                                Acceptance <StatusPill status={d.acceptance.replace('_', ' ')} />
                            </li>
                        </ul>
                        {d.acceptanceDue && (
                            <p className="mt-3 text-xs text-ink-600">
                                Acceptance due {d.acceptanceDue}
                                {d.daysLeft !== null && ` (${d.daysLeft >= 0 ? `${d.daysLeft} days left` : `${Math.abs(d.daysLeft)} days overdue`})`}
                            </p>
                        )}
                        {d.decidedAt && (
                            <p className="mt-2 rounded bg-parchment-200 p-2 text-xs">
                                Decision recorded {d.decidedAt}
                                {d.decisionNote && `: ${d.decisionNote}`}
                            </p>
                        )}
                        {d.canDecide && (
                            <form
                                className="mt-4 space-y-3 border-t border-parchment-300 pt-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    decision.post(`/portal/deliverables/${d.id}/decision`, { preserveScroll: true });
                                }}
                            >
                                <Field label="Your decision" required>
                                    {(id) => (
                                        <Select
                                            id={id}
                                            value={decision.data.decision}
                                            onChange={(e) => decision.setData('decision', e.target.value)}
                                            options={[
                                                { value: 'accept', label: `Accept (${d.decisionType})` },
                                                { value: 'corrections', label: 'Request corrections' },
                                                { value: 'dispute', label: 'Dispute this deliverable' },
                                            ]}
                                        />
                                    )}
                                </Field>
                                <Field label="Comments" error={decision.errors.note} hint={decision.data.decision === 'accept' ? 'Optional' : 'Required — describe what must change'}>
                                    {(id) => <Textarea id={id} value={decision.data.note} onChange={(e) => decision.setData('note', e.target.value)} />}
                                </Field>
                                <Button type="submit" size="sm" className="w-full" disabled={decision.processing}>
                                    Record Decision
                                </Button>
                            </form>
                        )}
                    </Panel>

                    {d.release === 'delivered' && (
                        <Panel title="Share Secure Link">
                            <form
                                className="space-y-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    share.post(`/portal/deliverables/${d.id}/share`, { preserveScroll: true, onSuccess: () => share.reset() });
                                }}
                            >
                                <Field label="Recipient email" required error={share.errors.recipient}>
                                    {(id) => <Input id={id} type="email" value={share.data.recipient} onChange={(e) => share.setData('recipient', e.target.value)} />}
                                </Field>
                                <Field label="Link expires after">
                                    {(id) => (
                                        <Select id={id} value={share.data.days} onChange={(e) => share.setData('days', e.target.value)} options={[{ value: '1', label: '1 day' }, { value: '7', label: '7 days' }, { value: '30', label: '30 days' }]} />
                                    )}
                                </Field>
                                <Button type="submit" size="sm" variant="outline" className="w-full" disabled={share.processing}>
                                    <Share2 className="size-4" aria-hidden="true" /> Create Secure Link
                                </Button>
                            </form>
                            {d.shares.length > 0 && (
                                <ul className="mt-3 space-y-1 text-xs">
                                    {d.shares.map((s) => (
                                        <li key={s.token} className="flex justify-between gap-2">
                                            <span className="truncate">{s.recipient}</span>
                                            <StatusPill status={s.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Sensitive deliverables are never sent only by ordinary email or WhatsApp — recipients confirm receipt through the secure link.</p>
                        </Panel>
                    )}
                </aside>
            </div>
        </PortalShell>
    );
}

Deliverable.layout = null;
