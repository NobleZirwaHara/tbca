import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, CircleCheck, CircleX, Info, Megaphone, RefreshCw, TriangleAlert } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Input } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { cn } from '@/lib/cn';

interface Component {
    key: string;
    name: string;
    icon: string;
    status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
    uptime_30d: number | null;
    response_ms: number | null;
    history: number[] | null;
}
interface Incident {
    id: number;
    kind: string;
    title: string;
    body: string | null;
    impact: string;
    status: string;
    component: string | null;
    starts_at: string | null;
    resolved_at: string | null;
}
interface Props {
    components: Component[];
    summary: { operational: number; degraded: number; outages: number; uptime: number | null; updated_at: string };
    active: Incident[];
    maintenance: Incident[];
    notices: Incident[];
    history: Incident[];
}

const statusMeta = {
    operational: { label: 'Operational', cls: 'text-verified-700', dot: 'bg-verified-500' },
    degraded: { label: 'Degraded Performance', cls: 'text-attested-700', dot: 'bg-attested-500' },
    partial_outage: { label: 'Partial Outage', cls: 'text-risk-700', dot: 'bg-risk-500' },
    major_outage: { label: 'Major Outage', cls: 'text-risk-700', dot: 'bg-risk-700' },
};

const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

function Spark({ values }: { values: number[] }) {
    if (values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${24 - ((v - min) / (max - min || 1)) * 20 - 2}`).join(' ');
    return (
        <svg viewBox="0 0 100 24" className="h-6 w-28 text-verified-500" aria-hidden="true">
            <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

export default function SystemStatus({ components, summary, active, maintenance, notices, history }: Props) {
    const [auto, setAuto] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const sub = useForm({ email: '', section: 'about', subject: 'System status subscription' });
    const healthy = summary.degraded === 0 && summary.outages === 0 && components.length > 0;

    // Auto-refresh polls the status register (external system) every 60 seconds.
    useEffect(() => {
        if (!auto) return;
        const t = window.setInterval(() => router.reload({ only: ['components', 'summary', 'active', 'maintenance', 'notices', 'history'] }), 60000);
        return () => window.clearInterval(t);
    }, [auto]);

    const subscribe = (e: FormEvent) => {
        e.preventDefault();
        sub.post('/forms/status-subscription', { preserveScroll: true, onSuccess: () => sub.reset('email') });
    };

    return (
        <>
            <Head title="System Status" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'System Status' }]}
                title="System Status"
                lead="Our systems. Your confidence. Always on, always improving."
                intro={
                    <>
                        Real-time status and performance of TBCA platforms and services.
                        <span className="mt-1 flex flex-wrap items-center gap-3 text-[0.8125rem]">
                            Last updated: {dt(summary.updated_at)} SAST
                            <button type="button" onClick={() => setAuto(!auto)} className="inline-flex items-center gap-1 text-verified-700" aria-pressed={auto}>
                                <RefreshCw className={cn('size-3.5', auto && 'animate-spin [animation-duration:3s]')} aria-hidden="true" /> Auto-refresh: {auto ? 'On' : 'Off'}
                            </button>
                        </span>
                    </>
                }
                aside={
                    <div className={cn('flex items-start gap-4 rounded-[8px] border p-5', healthy ? 'border-verified-500/30 bg-verified-50/60' : 'border-attested-500/30 bg-attested-50/60')}>
                        {healthy ? <CircleCheck className="size-11 shrink-0 text-verified-500" aria-hidden="true" /> : <TriangleAlert className="size-11 shrink-0 text-attested-500" aria-hidden="true" />}
                        <div>
                            <h2 className={cn('text-lg font-semibold', healthy ? 'text-verified-700' : 'text-attested-700')}>{healthy ? 'All Systems Operational' : 'Some Systems Affected'}</h2>
                            <p className="text-[0.8125rem] text-ink-600">{healthy ? 'All monitored systems are healthy and operating normally.' : 'We are working to restore full service.'}</p>
                            <p className="text-[0.8125rem] text-ink-600">{active.length === 0 ? 'No incidents to report.' : `${active.length} active incident(s).`}</p>
                            <button type="button" onClick={() => setShowHistory(true)} className="mt-1 text-[0.8125rem] font-semibold text-verified-700 hover:underline">View Incident History →</button>
                        </div>
                    </div>
                }
            />

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_21rem]">
                    <div className="space-y-5">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Platform Status Overview</h2>
                            <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <li className="flex gap-2"><CircleCheck className="size-6 text-verified-500" aria-hidden="true" /><div><p className="text-2xl font-bold">{summary.operational}</p><p className="text-xs font-semibold text-verified-700">Operational</p></div></li>
                                <li className="flex gap-2"><Info className="size-6 text-attested-500" aria-hidden="true" /><div><p className="text-2xl font-bold">{summary.degraded}</p><p className="text-xs font-semibold text-attested-700">Degraded</p><p className="text-xs text-ink-500">Performance issues</p></div></li>
                                <li className="flex gap-2"><TriangleAlert className="size-6 text-risk-500" aria-hidden="true" /><div><p className="text-2xl font-bold">{summary.outages}</p><p className="text-xs font-semibold text-risk-700">Outages</p><p className="text-xs text-ink-500">Service disruptions</p></div></li>
                                <li className="flex gap-2"><CalendarDays className="size-6 text-verified-500" aria-hidden="true" /><div><p className="text-2xl font-bold">{summary.uptime === null ? 'Not yet evidenced' : `${summary.uptime}%`}</p><p className="text-xs font-semibold text-verified-700">Uptime (30 days)</p><p className="text-xs text-ink-500">Measured availability</p></div></li>
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Service Status</h2>
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full min-w-[620px] text-left text-[0.8125rem]">
                                    <thead className="text-xs text-ink-500">
                                        <tr><th className="py-2">Service</th><th className="py-2">Status</th><th className="py-2">Uptime (30 Days)</th><th className="py-2">Response Time</th><th className="py-2">Recent trend</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {components.map((c) => (
                                            <tr key={c.key}>
                                                <td className="py-2.5"><span className="flex items-center gap-2 text-ink-900"><AboutIcon name={c.icon} className="size-4 text-ink-600" />{c.name}</span></td>
                                                <td className={cn('py-2.5 font-medium', statusMeta[c.status].cls)}>
                                                    <span className="inline-flex items-center gap-1.5"><span className={cn('size-2 rounded-full', statusMeta[c.status].dot)} aria-hidden="true" />{statusMeta[c.status].label}</span>
                                                </td>
                                                <td className="py-2.5">{c.uptime_30d === null ? 'Not yet evidenced' : `${c.uptime_30d.toFixed(2)}%`}</td>
                                                <td className="py-2.5">{c.response_ms ? `${c.response_ms} ms` : '—'}</td>
                                                <td className="py-2.5"><Spark values={c.history ?? []} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="font-semibold text-ink-900">Current Incidents</h2>
                            {active.length === 0 ? (
                                <p className="mt-2 flex items-start gap-2 text-[0.8125rem] text-ink-600"><CircleCheck className="size-5 text-verified-500" aria-hidden="true" /><span><span className="block font-semibold text-ink-900">No incidents reported</span>There are no active incidents at this time.</span></p>
                            ) : (
                                <ul className="mt-2 space-y-2">{active.map((i) => <li key={i.id} className="text-[0.8125rem]"><p className="font-semibold text-risk-700">{i.title}</p><p className="text-ink-600">{i.component} · {i.status} · since {dt(i.starts_at)}</p>{i.body && <p className="text-ink-600">{i.body}</p>}</li>)}</ul>
                            )}
                        </div>
                        <div className="rounded-[8px] border border-controlled-500/25 bg-controlled-50/50 p-4">
                            <h2 className="font-semibold text-ink-900">Scheduled Maintenance</h2>
                            {maintenance.length === 0 ? <p className="mt-1 text-[0.8125rem] text-ink-600"><span className="block font-semibold text-ink-900">No scheduled maintenance</span>There is no upcoming maintenance.</p> : maintenance.map((m) => <p key={m.id} className="mt-1 text-[0.8125rem]"><span className="font-semibold">{m.title}</span> — {dt(m.starts_at)}</p>)}
                        </div>
                        <div className="rounded-[8px] border border-attested-500/25 bg-attested-50/50 p-4">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Megaphone className="size-5 text-attested-700" aria-hidden="true" /> System Notices</h2>
                            {notices.length === 0 ? <p className="mt-1 text-[0.8125rem] text-ink-600"><span className="block font-semibold text-ink-900">All systems are stable</span>We will notify you here of any important updates.</p> : notices.map((n) => <p key={n.id} className="mt-1 text-[0.8125rem]"><span className="font-semibold">{n.title}</span>{n.body && ` — ${n.body}`}</p>)}
                        </div>
                        <div className="grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 lg:grid-cols-1">
                            <div>
                                <h2 className="text-sm font-semibold text-ink-900">Status Legend</h2>
                                <ul className="mt-2 space-y-1.5 text-xs">
                                    {(Object.keys(statusMeta) as (keyof typeof statusMeta)[]).map((k) => (
                                        <li key={k} className="flex items-center gap-2"><span className={cn('size-2.5 rounded-full', statusMeta[k].dot)} aria-hidden="true" /><span className={statusMeta[k].cls}>{statusMeta[k].label}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <form onSubmit={subscribe}>
                                <h2 className="text-sm font-semibold text-ink-900">Subscribe to Updates</h2>
                                <p className="text-xs text-ink-500">Get notified about system incidents and maintenance.</p>
                                <label htmlFor="status-email" className="sr-only">Email</label>
                                <Input id="status-email" type="email" required value={sub.data.email} onChange={(e) => sub.setData('email', e.target.value)} placeholder="you@company.com" className="mt-2" />
                                <Button type="submit" variant="outline" size="sm" className="mt-2 w-full" disabled={sub.processing}>Subscribe via Email</Button>
                            </form>
                        </div>
                    </aside>
                </div>
            </section>

            <Modal open={showHistory} onClose={() => setShowHistory(false)} title="Incident & maintenance history" size="lg">
                {history.length === 0 ? <p className="text-sm text-ink-500">No incidents recorded.</p> : (
                    <ul className="divide-y divide-parchment-300">
                        {history.map((i) => (
                            <li key={i.id} className="py-3 text-sm">
                                <p className="flex items-center gap-2 font-semibold text-ink-900">
                                    {i.status === 'resolved' || i.status === 'completed' ? <CircleCheck className="size-4 text-verified-500" aria-hidden="true" /> : <CircleX className="size-4 text-risk-500" aria-hidden="true" />}
                                    {i.title}
                                </p>
                                <p className="text-xs text-ink-500">{i.kind} · {i.component ?? 'Platform'} · {dt(i.starts_at)} → {dt(i.resolved_at)} · {i.status}</p>
                                {i.body && <p className="mt-1 text-ink-600">{i.body}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </Modal>
        </>
    );
}
