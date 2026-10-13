import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Cable, Fingerprint, Gauge, LayoutDashboard, ListChecks } from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable, StatusPill, Tag } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';

type EventStatus = 'held' | 'pending' | 'sent' | 'failed' | 'complete';

interface LedgerEvent {
    id: number;
    eventId: string;
    source: string;
    direction: string;
    type: string;
    label: string;
    process: string | null;
    aggregate: string;
    status: EventStatus;
    handledBy: string | null;
    attempts: number;
    lastError: string | null;
    nextAttempt: string | null;
    steps: string[];
    createdAt: string | null;
}

interface CoverageRow {
    code: string;
    name: string;
    humanGate: string;
    instrumented: boolean;
    tasks: number;
    automated: number;
    human: number;
    open: number;
    failed: number;
    routineTasks: number;
    routineAutomated: number;
    humanMinutes: number;
    straightThrough: number | null;
    automationShare: number | null;
}

type CoverageTotals = Omit<CoverageRow, 'code' | 'name' | 'humanGate' | 'instrumented'>;

interface Props {
    health: {
        enabled: boolean;
        switchedOn: boolean;
        hasCredentials: boolean;
        dc: string;
        accountsHost: string;
        apiHost: string;
        tokenCached: boolean;
        webhookSecret: boolean;
        apps: { app: string; ready: boolean }[];
        counts: Record<EventStatus, number>;
        oldestPending: string | null;
        lastComplete: string | null;
    };
    filter: EventStatus | null;
    events: LedgerEvent[];
    coverage: { target: number; processes: CoverageRow[]; totals: CoverageTotals; held: number };
    identity: {
        driver: string;
        label: string;
        autoStart: boolean;
        vove: { environment: string; apiKey: boolean; publicKey: boolean; webhookSecret: boolean; flows: Record<string, boolean> };
        map: { item: string; kind: string; coverage: string; note: string }[];
        eligible: { id: number; case: string; caseStatus: string; subject: string; category: string; kind: string | null; coverage: string | null; status: string; started: boolean }[];
        recent: { id: number; case: string | null; check: string | null; kind: string; provider: string; status: string; providerStatus: string | null; updatedAt: string | null }[];
    };
}

const pct = (v: number | null) => (v === null ? 'No data' : `${Math.round(v * 1000) / 10}%`);
const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'None';

function Yes({ ok, yes = 'Set', no = 'Missing' }: { ok: boolean; yes?: string; no?: string }) {
    return <StatusPill status={ok ? yes : no} tone={ok ? 'good' : 'bad'} />;
}

export default function Integrations({ health, filter, events, coverage, identity }: Props) {
    const [resolving, setResolving] = useState<number | null>(null);
    const [minutes, setMinutes] = useState('10');
    const [note, setNote] = useState('');

    const groups: ConsoleNavGroup[] = [
        { title: 'Platform', items: [{ label: 'Admin Hub', href: '/admin', icon: LayoutDashboard }] },
        { title: 'Integrations', items: [{ label: 'Integration status', href: '/admin/integrations', icon: Cable }] },
    ];

    const totals = coverage.totals;
    const shareTone = totals.automationShare === null ? 'neutral' : totals.automationShare >= coverage.target ? 'good' : 'warn';

    return (
        <ConsoleLayout
            area="Integrations"
            areaIcon={Cable}
            groups={groups}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Integrations' }]}
            title="Integration Status"
            badge={<Tag tone={health.enabled ? 'good' : 'neutral'}>{health.enabled ? 'Zoho connected' : 'Zoho off'}</Tag>}
            description="Zoho One sync health, the integration event ledger, progress toward 90 percent automation, and identity checks for Due Diligence."
        >
            <Head title="Integration Status" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Automation share" value={pct(totals.automationShare)} caption={`Target ${pct(coverage.target)}`} tone={shareTone} icon={<Gauge className="size-4" />} />
                <KpiTile label="Routine straight-through" value={pct(totals.straightThrough)} icon={<Activity className="size-4" />} />
                <KpiTile label="Pending" value={health.counts.pending} caption={`Oldest ${when(health.oldestPending)}`} tone={health.counts.pending > 0 ? 'warn' : 'neutral'} />
                <KpiTile label="Failed" value={health.counts.failed} tone={health.counts.failed > 0 ? 'bad' : 'neutral'} />
                <KpiTile label="Held while off" value={health.counts.held} caption="Not sent" />
                <KpiTile label="Complete" value={health.counts.complete} caption={`Last ${when(health.lastComplete)}`} tone="good" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Zoho One connection">
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.8125rem]">
                        <dt className="text-ink-500">Switched on</dt>
                        <dd><Yes ok={health.switchedOn} yes="Yes" no="No" /></dd>
                        <dt className="text-ink-500">OAuth credentials</dt>
                        <dd><Yes ok={health.hasCredentials} /></dd>
                        <dt className="text-ink-500">Data centre</dt>
                        <dd className="font-mono text-xs">{health.dc.toUpperCase()} ({health.accountsHost})</dd>
                        <dt className="text-ink-500">API host</dt>
                        <dd className="font-mono text-xs">{health.apiHost}</dd>
                        <dt className="text-ink-500">Access token cached</dt>
                        <dd><Yes ok={health.tokenCached} yes="Yes" no="No" /></dd>
                        <dt className="text-ink-500">Inbound webhook secret</dt>
                        <dd><Yes ok={health.webhookSecret} /></dd>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {health.apps.map((a) => (
                            <StatusPill key={a.app} status={a.app} tone={a.ready ? 'good' : 'neutral'} />
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-ink-400">Green apps have their organisation or container ID set. Grey apps are skipped by the sync.</p>
                    {health.enabled && health.counts.held > 0 && (
                        <Button size="sm" variant="outline" className="mt-4" onClick={() => router.post('/admin/integrations/release-held', {}, { preserveScroll: true })}>
                            Release {health.counts.held} held events
                        </Button>
                    )}
                </Panel>

                <Panel title="Identity verification for Due Diligence">
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.8125rem]">
                        <dt className="text-ink-500">Provider in use</dt>
                        <dd className="font-semibold text-ink-900">{identity.label}</dd>
                        <dt className="text-ink-500">Start checks automatically</dt>
                        <dd><Yes ok={identity.autoStart} yes="Yes" no="No" /></dd>
                        <dt className="text-ink-500">VOVE ID environment</dt>
                        <dd>{identity.vove.environment}</dd>
                        <dt className="text-ink-500">VOVE ID keys</dt>
                        <dd className="flex flex-wrap gap-1.5">
                            <Yes ok={identity.vove.apiKey} yes="API key" no="No API key" />
                            <Yes ok={identity.vove.publicKey} yes="Public key" no="No public key" />
                            <Yes ok={identity.vove.webhookSecret} yes="Webhook secret" no="No webhook secret" />
                        </dd>
                        <dt className="text-ink-500">VOVE ID flows</dt>
                        <dd className="flex flex-wrap gap-1.5">
                            {Object.entries(identity.vove.flows).map(([k, ok]) => (
                                <StatusPill key={k} status={k.replace(/_/g, ' ')} tone={ok ? 'good' : 'neutral'} />
                            ))}
                        </dd>
                    </dl>
                </Panel>
            </div>

            <Panel title="Automation coverage (guide section 12)" className="mt-5">
                <p className="mb-3 text-[0.8125rem] text-ink-500">
                    Overall automation share counts every task instance, including human review gates and exceptions. Routine straight-through counts only routine
                    steps. Events held while Zoho was off are excluded ({coverage.held}). Human minutes are logged when staff resolve an event.
                </p>
                <SimpleTable
                    columns={['Process', 'Tasks', 'Automated', 'Human', 'Open', 'Failed', 'Straight-through', 'Automation share', 'Human minutes', 'Kept with a person']}
                    rows={[
                        ...coverage.processes.map((p) => [
                            <span className="whitespace-nowrap">
                                <span className="font-mono text-xs text-ink-400">{p.code}</span> {p.name}
                            </span>,
                            p.instrumented ? p.tasks : <span className="text-ink-400">Not yet measured</span>,
                            p.automated,
                            p.human,
                            p.open,
                            p.failed,
                            pct(p.straightThrough),
                            <span className={cn(p.automationShare !== null && p.automationShare >= coverage.target ? 'font-semibold text-verified-500' : '')}>{pct(p.automationShare)}</span>,
                            p.humanMinutes,
                            <span className="text-xs text-ink-500">{p.humanGate}</span>,
                        ]),
                        [
                            <strong>All processes</strong>,
                            <strong>{totals.tasks}</strong>,
                            <strong>{totals.automated}</strong>,
                            <strong>{totals.human}</strong>,
                            totals.open,
                            totals.failed,
                            <strong>{pct(totals.straightThrough)}</strong>,
                            <strong>{pct(totals.automationShare)}</strong>,
                            totals.humanMinutes,
                            <span className="text-xs text-ink-500">Target {pct(coverage.target)} of task instances</span>,
                        ],
                    ]}
                />
            </Panel>

            <Panel
                title="Event ledger"
                className="mt-5"
                action={
                    <div className="flex flex-wrap gap-1.5 text-xs">
                        {(['all', 'pending', 'failed', 'sent', 'held', 'complete'] as const).map((s) => (
                            <Link
                                key={s}
                                href={s === 'all' ? '/admin/integrations' : `/admin/integrations?status=${s}`}
                                preserveScroll
                                className={cn(
                                    'rounded-full border px-2.5 py-0.5 capitalize',
                                    (filter ?? 'all') === s ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 text-ink-600',
                                )}
                            >
                                {s}
                            </Link>
                        ))}
                    </div>
                }
            >
                <SimpleTable
                    columns={['When', 'Event', 'Record', 'Process', 'Status', 'Attempts', 'Detail', 'Action']}
                    empty="No integration events recorded yet."
                    rows={events.map((e) => [
                        <span className="whitespace-nowrap text-xs">{when(e.createdAt)}</span>,
                        <div>
                            <p className="font-mono text-xs text-ink-900">{e.type}</p>
                            <p className="text-xs text-ink-400">
                                {e.label} ({e.direction}, {e.source})
                            </p>
                        </div>,
                        <span className="font-mono text-xs">{e.aggregate || e.eventId.slice(0, 18)}</span>,
                        e.process ?? '',
                        <div className="space-y-1">
                            <StatusPill status={e.status} />
                            {e.handledBy && <p className="text-[0.6875rem] text-ink-400">{e.handledBy}</p>}
                        </div>,
                        e.attempts,
                        <div className="max-w-xs text-xs">
                            {e.lastError && <p className="text-risk-700">{e.lastError}</p>}
                            {e.nextAttempt && <p className="text-ink-400">Next try {when(e.nextAttempt)}</p>}
                            {e.steps.length > 0 && <p className="text-ink-400">Done: {e.steps.join(', ')}</p>}
                        </div>,
                        e.status === 'complete' ? null : resolving === e.id ? (
                            <form
                                className="flex min-w-56 flex-col gap-1.5"
                                onSubmit={(ev) => {
                                    ev.preventDefault();
                                    router.post(`/admin/integrations/events/${e.id}/resolve`, { minutes: Number(minutes), note }, { preserveScroll: true, onSuccess: () => setResolving(null) });
                                }}
                            >
                                <label className="text-[0.6875rem] text-ink-500">
                                    Staff minutes spent
                                    <input type="number" min={0} max={960} value={minutes} onChange={(x) => setMinutes(x.target.value)} className="ms-2 w-16 rounded border border-parchment-500 px-1 py-0.5" />
                                </label>
                                <input placeholder="Note (optional)" value={note} onChange={(x) => setNote(x.target.value)} className="rounded border border-parchment-500 px-1.5 py-0.5 text-xs" />
                                <div className="flex gap-1.5">
                                    <Button size="sm" type="submit">Save</Button>
                                    <Button size="sm" variant="ghost" type="button" onClick={() => setResolving(null)}>Cancel</Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {e.direction === 'outbound' && e.status !== 'sent' && (
                                    <Button size="sm" variant="outline" onClick={() => router.post(`/admin/integrations/events/${e.id}/retry`, {}, { preserveScroll: true })}>
                                        Retry
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => setResolving(e.id)}>
                                    Resolved by staff
                                </Button>
                            </div>
                        ),
                    ])}
                />
            </Panel>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Checks ready for identity verification" action={<Fingerprint className="size-4 text-gold-600" />}>
                    <SimpleTable
                        columns={['Case', 'Check', 'Runs as', 'Status', '']}
                        empty="No open checks that the identity provider can serve."
                        rows={identity.eligible.map((c) => [
                            <div>
                                <p className="font-mono text-xs">{c.case}</p>
                                <p className="text-xs text-ink-400">{c.subject}</p>
                            </div>,
                            <div>
                                <p>{c.category}</p>
                                <p className="text-xs text-ink-400">{c.coverage === 'full' ? 'Fully served' : 'Partly served'}</p>
                            </div>,
                            <span className="font-mono text-xs">{c.kind}</span>,
                            <StatusPill status={c.status} />,
                            <Button size="sm" variant="outline" onClick={() => router.post(`/admin/integrations/identity/checks/${c.id}`, {}, { preserveScroll: true })}>
                                {c.started ? 'Refresh link' : 'Start'}
                            </Button>,
                        ])}
                    />
                </Panel>

                <Panel title="Recent identity verifications" action={<ListChecks className="size-4 text-gold-600" />}>
                    <SimpleTable
                        columns={['Case', 'Check', 'Type', 'Provider', 'Status', 'Updated']}
                        empty="No verifications yet."
                        rows={identity.recent.map((v) => [
                            <span className="font-mono text-xs">{v.case}</span>,
                            v.check ?? '',
                            v.kind,
                            v.provider,
                            <div>
                                <StatusPill status={v.status} />
                                {v.providerStatus && <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-400">{v.providerStatus}</p>}
                            </div>,
                            <span className="text-xs">{when(v.updatedAt)}</span>,
                        ])}
                    />
                </Panel>
            </div>

            <Panel title="Due Diligence checks and add-ons the identity provider can serve" className="mt-5">
                <SimpleTable
                    columns={['Check or add-on', 'Verification type', 'Coverage', 'Notes']}
                    rows={identity.map.map((m) => [
                        m.item,
                        <span className="font-mono text-xs">{m.kind}</span>,
                        <StatusPill status={m.coverage} tone={m.coverage === 'full' ? 'good' : 'warn'} />,
                        <span className="text-xs text-ink-500">{m.note}</span>,
                    ])}
                />
            </Panel>
        </ConsoleLayout>
    );
}

Integrations.layout = null;
