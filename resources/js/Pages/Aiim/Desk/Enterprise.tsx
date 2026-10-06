import { Link } from '@inertiajs/react';
import { BarChart3, Briefcase, FileText, Mail, PieChart, Users } from 'lucide-react';
import { Donut } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import { AiGuidance, Avatar } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Progress } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

type Desk = Record<string, any>;

export default function Enterprise({ desk: d }: AiimPageProps & { desk: Desk }) {
    const usagePct = Math.round((d.usage[0][1] / d.usage[0][2]) * 100);
    const billSub = d.billing.reduce((s: number, [, v]: [string, number]) => s + v, 0);
    return (
        <AiimPage
            title="Enterprise Desk"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Enterprise Desk' }]}
            description="Enterprise solutions for corporates and large organisations to manage intelligence, mandates and teams at scale."
            accent="purple"
            notice={<AiGuidance>Use the Enterprise Desk to oversee your portfolios, teams, budgets and strategic intelligence needs.</AiGuidance>}
            rail={<SelectionBox />}
        >
            <section className="mb-4 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-2 lg:grid-cols-5">
                <div><p className="text-ink-500">Organisation</p><p className="font-semibold">{d.org.name}</p><p>Enterprise ID: <span className="text-referenced-700">{d.org.id}</span></p><p>Industry: {d.org.industry}</p></div>
                <div><p className="text-ink-500">Enterprise Admin</p><div className="flex gap-2"><Avatar name={d.admin.name} size="sm" /><span><strong className="block">{d.admin.name}</strong><span className="text-referenced-700">{d.admin.title}</span><span className="block">{d.admin.email}</span></span></div></div>
                <div><p className="text-ink-500">Subscription Plan</p><p className="font-semibold text-referenced-700">{d.plan.name} <Chip tone="good">Active</Chip></p><p>Valid Until: {d.plan.valid}</p><p>Auto-Renewal: {d.plan.renewal}</p></div>
                <div><p className="text-ink-500">Engagement Value (ex. VAT)</p><p className="text-lg font-bold text-referenced-700">{zar2(d.value)}</p><p>Paid (70%): {zar2(d.paid)} · Balance {zar2(d.balance)}</p></div>
                <div><p className="text-ink-500">Active Mandates</p><p className="text-lg font-bold">{d.mandates}</p><p>Across {d.units} Business Units</p><p>Team Members {d.members} · System Users {d.users}</p></div>
            </section>
            <div className="mb-4 grid gap-3 sm:grid-cols-5">
                {[[BarChart3, 'Strategic Intelligence', 'Go to Intelligence Hub', '/aiim#explore-africa'], [Briefcase, 'Active Mandates', 'Manage Mandates', '/aiim/workspace/engagements'], [Users, 'Team & Collaboration', 'Manage Team', '/aiim/workspace/enterprise'], [FileText, 'Reports & Deliverables', 'View Deliverables', '/aiim/workspace/reports'], [PieChart, 'Data & Insights', 'Open Dashboards', '/aiim/workspace']].map(([I, t, l, h]) => { const Icon = I as typeof Users; return <Link key={t as string} href={h as string} className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs hover:border-referenced-500"><Icon className="size-5 text-referenced-500" /><strong className="mt-1 block">{t as string}</strong><span className="text-referenced-700">{l as string} →</span></Link>; })}
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <SectionCard title="Enterprise Mandate Summary">
                    <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Mandate ID</th><th className="text-left">Mandate</th><th className="text-left">Business Unit</th><th>Stage</th><th>Progress</th><th>Expires</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">{d.mandateRows.map(([id, n, bu, st, p, ex]: [string, string, string, string, number, string]) => <tr key={id}><td className="py-1.5 text-referenced-700">{id}</td><td>{n}</td><td>{bu}</td><td className="text-center">{st}</td><td><div className="flex items-center gap-1"><Progress value={p} className="w-14" />{p}%</div></td><td className="text-center">{ex}</td></tr>)}</tbody>
                    </table>
                </SectionCard>
                <SectionCard title="Usage Overview (This Period)">
                    <Donut centre={`${usagePct}%`} sub="of Plan Used" data={[{ label: 'Used', value: usagePct }, { label: 'Remaining', value: 100 - usagePct }]} size={100} />
                    <ul className="mt-2 space-y-1 text-xs">{d.usage.map(([l, u, m]: [string, number, number]) => <li key={l} className="flex justify-between"><span>{l}</span><span>{u.toLocaleString('en-ZA')} / {m.toLocaleString('en-ZA')}</span></li>)}</ul>
                </SectionCard>
                <SectionCard title="Key Contacts"><ul className="space-y-2 text-xs">{d.contacts.map(([n, r, e, p]: string[]) => <li key={n} className="flex items-center gap-2"><Avatar name={n} size="sm" /><span className="flex-1"><strong className="block">{n}</strong>{r}<span className="block text-ink-500">{e} · {p}</span></span><a href={`mailto:${e}`} aria-label={`Email ${n}`}><Mail className="size-4 text-referenced-500" /></a></li>)}</ul></SectionCard>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <SectionCard title="Recent Activity"><ul className="space-y-1.5 text-xs">{d.activity.map(([a, t]: string[]) => <li key={a} className="flex justify-between gap-2"><span>{a}</span><span className="shrink-0 text-ink-400">{t}</span></li>)}</ul></SectionCard>
                <SectionCard title="Billing Summary"><dl className="space-y-1 text-xs">{d.billing.map(([l, v]: [string, number]) => <div key={l} className="flex justify-between"><dt>{l}</dt><dd>{zar2(v)}</dd></div>)}<div className="flex justify-between font-semibold"><dt>Total (ex. VAT)</dt><dd>{zar2(billSub)}</dd></div><div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zar2(billSub * 0.15)}</dd></div><div className="flex justify-between rounded bg-referenced-50 px-1 font-bold"><dt>Total (incl. VAT)</dt><dd>{zar2(billSub * 1.15)}</dd></div></dl></SectionCard>
                <SectionCard title="Next Renewal"><p className="text-lg font-semibold text-referenced-700">{d.plan.valid}</p><p className="text-xs text-ink-600">Auto-renewal is enabled for your {d.plan.name}.</p><ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline" className="mt-3">Contact Account Manager</ButtonLink></SectionCard>
            </div>
        </AiimPage>
    );
}
