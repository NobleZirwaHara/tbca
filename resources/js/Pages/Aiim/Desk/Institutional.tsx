import { CheckCircle2, TriangleAlert } from 'lucide-react';
import { BarList, Donut } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import { AiGuidance, Avatar } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import type { AiimPageProps } from '@/types/aiim';

type Desk = Record<string, any>;

export default function Institutional({ desk: d }: AiimPageProps & { desk: Desk }) {
    return (
        <AiimPage
            title="Government & DFI Desk"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Government & DFI Desk' }]}
            description="Strategic intelligence and portfolio management for government departments and development finance institutions."
            accent="purple"
            notice={<AiGuidance>Monitor national priorities, track project readiness and engage investors with verified intelligence.</AiGuidance>}
            rail={<SelectionBox />}
        >
            <section className="mb-4 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-2 lg:grid-cols-5">
                <div><p className="text-ink-500">Organisation</p><p className="font-semibold">{d.org.name}</p><p>Account Type: {d.org.type}</p><p>Country: {d.org.country}</p></div>
                <div><p className="text-ink-500">Desk Administrator</p><div className="flex gap-2"><Avatar name={d.admin.name} size="sm" /><span><strong className="block">{d.admin.name}</strong><span className="text-referenced-700">{d.admin.title}</span><span className="block">{d.admin.email}</span></span></div></div>
                <div><p className="text-ink-500">Subscription Plan</p><p className="font-semibold text-referenced-700">{d.plan.name} <Chip tone="good">Active</Chip></p><p>Valid Until: {d.plan.valid}</p><p>Account: {d.plan.account}</p></div>
                <div><p className="text-ink-500">Engagement Value (ex. VAT)</p><p className="text-lg font-bold text-referenced-700">{zar2(d.value)}</p><p>Paid (70%): {zar2(d.paid)} · Balance {zar2(d.balance)}</p></div>
                <div><p className="text-ink-500">Active Mandates</p><p className="text-lg font-bold">{d.mandates}</p><p>Across {d.sectors} Priority Sectors</p><p>Departments {d.departments} · Projects {d.projects}</p></div>
            </section>
            <div className="grid gap-4 xl:grid-cols-3">
                <SectionCard title="National Priority Sectors"><Donut centre={String(d.projects)} sub="Projects" data={d.priority.map(([label, value]: [string, number]) => ({ label, value }))} /></SectionCard>
                <SectionCard title="Project Pipeline Overview"><ul className="grid grid-cols-2 gap-3">{d.pipeline.map(([l, v]: [string, number]) => <li key={l} className="rounded border border-parchment-300 p-3 text-xs"><p className="text-2xl font-bold">{v}</p>{l}</li>)}</ul></SectionCard>
                <SectionCard title="Funding & Investment Outlook (ex. VAT)">
                    <div className="mb-3 grid grid-cols-2 gap-3 text-xs"><div><p className="text-xl font-bold text-referenced-700">{d.capital.required}</p>Indicative Capital Required</div><div><p className="text-xl font-bold text-referenced-700">{d.capital.interest}</p>Potential Investment Interest Identified</div></div>
                    <p className="mb-1 text-xs font-semibold">Top Investor Interest</p>
                    <BarList data={d.investorInterest.map(([label, value]: [string, number]) => ({ label, value, display: `${value}%` }))} />
                </SectionCard>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <SectionCard title="Recent Activity"><ul className="space-y-2 text-xs">{d.activity.map(([a, s, t]: string[]) => <li key={a} className="flex justify-between gap-2"><span><strong className="block">{a}</strong>{s}</span><span className="shrink-0 text-ink-400">{t}</span></li>)}</ul></SectionCard>
                <SectionCard title="Upcoming Milestones"><ul className="space-y-2 text-xs">{d.milestones.map(([dt, t, s, st]: string[]) => <li key={t} className="flex items-center gap-3"><span className="w-20 shrink-0 font-bold text-referenced-700">{dt}</span><span className="flex-1"><strong className="block">{t}</strong>{s}</span><Chip tone={st === 'Renewal' ? 'good' : 'warn'}>{st}</Chip></li>)}</ul></SectionCard>
                <SectionCard title="Policy & Risk Alerts"><ul className="space-y-2 text-xs">{d.alerts.map(([t, s, tone]: string[]) => <li key={t} className="flex gap-2">{tone === 'good' ? <CheckCircle2 className="size-4 text-verified-500" /> : <TriangleAlert className={`size-4 ${tone === 'bad' ? 'text-risk-500' : 'text-attested-500'}`} />}<span><strong className="block">{t}</strong>{s}</span></li>)}</ul></SectionCard>
            </div>
        </AiimPage>
    );
}
