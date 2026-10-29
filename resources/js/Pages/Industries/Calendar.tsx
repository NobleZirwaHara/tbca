import { Link } from '@inertiajs/react';
import { A, B, Card, Chip, Cols, Kpi, Kpis, N, StatusChip, TagP, TagS, useToast } from '@/Components/Industries/Kit';
import { Head1, Legend, NoEngagement, WorkspacePage, dayS } from '@/Components/Industries/Layout';
import { cn } from '@/lib/cn';
import type { Country, Engagement, IndustryBase } from '@/types/industries';

type Ob = { due: string; name: string; body: string; type: string; overdue: boolean };
interface Props extends IndustryBase { e: Engagement | null; country?: Country; ob: Ob[]; month: string; today: string }

export default function Calendar(p: Props) {
    const { e, country: c, ob, ind } = p;
    const toast = useToast();
    if (!e || !c) return <WorkspacePage base={p} active="calendar" label="Compliance Calendar"><NoEngagement base={p} /></WorkspacePage>;
    const [y, m] = p.month.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const start = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const ym = (yy: number, mm: number) => { const d = new Date(Date.UTC(yy, mm - 1, 1)); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };
    const iso = (d: number) => `${p.month}-${String(d).padStart(2, '0')}`;
    const cls = (o: Ob) => (o.overdue ? 'bg-risk-50 text-risk-700' : o.type === 'Renewal' ? 'bg-attested-50 text-attested-700' : o.type === 'Payment' ? 'bg-verified-50 text-verified-700' : 'bg-controlled-50 text-controlled-700');
    const overdue = ob.filter((o) => o.overdue).length;

    return (
        <WorkspacePage base={p} active="calendar" label="Compliance Calendar">
            <Head1 eyebrow="Mock-up Page 25" title="Sector Compliance Calendar" desc={`Regulatory obligations, filing dates, renewals and compliance activities for ${ind.name} in ${c.name}.`}
                act={<><A href="/industries/workspace/calendar.ics">Export calendar (ICS)</A><B onClick={() => toast.show('Reminders set 14 days before each due date')}>Subscribe / reminders</B></>} />
            <Kpis>
                <Kpi l="Total obligations" v={N(ob.length)} s="Next 90 days" icon="clock" />
                <Kpi l="Upcoming" v={N(ob.filter((o) => !o.overdue && o.due >= p.today).length)} icon="bell" />
                <Kpi l="Overdue" v={N(overdue)} s="Requires attention" icon="alert" />
                <Kpi l="Compliance health" v={`${N(ob.length ? 100 - (100 * overdue) / ob.length : 100, 0)} %`} s="On track" icon="gauge" />
            </Kpis>
            <Cols>
                <Card title={first.toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })} icon="clock">
                    <div className="mb-2 flex justify-between gap-2">
                        <Link className="rounded-[4px] border border-parchment-500 bg-white px-2.5 py-1 text-[0.75rem]" href={`/industries/workspace/calendar?m=${ym(y, m - 1)}`} preserveScroll aria-label="Previous month">‹</Link>
                        <Link className="rounded-[4px] border border-parchment-500 bg-white px-2.5 py-1 text-[0.75rem]" href="/industries/workspace/calendar" preserveScroll>Today</Link>
                        <Link className="rounded-[4px] border border-parchment-500 bg-white px-2.5 py-1 text-[0.75rem]" href={`/industries/workspace/calendar?m=${ym(y, m + 1)}`} preserveScroll aria-label="Next month">›</Link>
                    </div>
                    <div className="grid grid-cols-7 gap-[3px] text-[0.7rem]">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <div key={d} className="text-center font-semibold text-ink-500">{d}</div>)}
                        {Array.from({ length: start }, (_, i) => <div key={`x${i}`} />)}
                        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                            <div key={d} className={cn('min-h-[58px] min-w-0 rounded-[4px] border bg-white p-[3px]', iso(d) === p.today ? 'border-gold-500' : 'border-parchment-400')}>
                                <b>{d}</b>
                                {ob.filter((o) => o.due === iso(d)).map((o) => <em key={o.name} title={o.body} className={cn('mt-0.5 block overflow-hidden rounded-[3px] px-[3px] py-px text-[0.6rem] leading-tight not-italic break-words', cls(o))}>{o.name}</em>)}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2"><Legend items={[['#eef3fb', 'Filing'], ['#fdf6e7', 'Renewal'], ['#eef7f2', 'Payment'], ['#fdefed', 'Overdue']]} /></div>
                </Card>
                <Card title="Upcoming obligations" icon="bell">
                    {ob.map((o) => (
                        <div key={o.name + o.due} className="flex items-start justify-between gap-2 border-b border-parchment-300 py-1.5">
                            <div className="min-w-0"><b className="text-[0.82rem]">{o.name}</b><div className="text-[0.72rem] text-ink-400">{o.body}</div></div>
                            <div className="text-right"><div className="text-[0.8rem] whitespace-nowrap">{dayS(o.due)}</div>{o.overdue ? <Chip t="Overdue" tone="bad" /> : <StatusChip s={o.type} />}</div>
                        </div>
                    ))}
                </Card>
            </Cols>
            <p className="text-[0.72rem] text-ink-400">{c.iso3 === 'BWA' ? <TagS s="BW_Permits" /> : <TagP />} Compliance information comes from verified regulators and partners; you remain responsible for final compliance.</p>
            {toast.node}
        </WorkspacePage>
    );
}
