import { CheckCircle2, Copy, KeyRound, Shield } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { AiGuidance, Avatar } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Progress, Tabs } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

type Desk = Record<string, any>;
const TABS = ['Overview', 'API Keys', 'Usage & Analytics', 'Rate Limits', 'Webhooks', 'White-Label', 'Security', 'Billing & Invoices', 'Audit Trail', 'Settings'];

export default function Developer({ desk: d, keys }: AiimPageProps & { desk: Desk; keys: { name: string; preview: string; created: string; status: string }[] }) {
    const [tab, setTab] = useState('Overview');
    const callsPct = Math.round((d.calls[0] / d.calls[1]) * 100);
    return (
        <AiimPage
            title="API & White-Label Management"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'API & White-Label Management' }]}
            description="Manage API access, keys, usage, rate limits and white-label configurations."
            accent="purple"
            notice={<AiGuidance>Configure secure API access and white-label solutions to power your platform or product.</AiGuidance>}
            rail={<SelectionBox />}
        >
            <section className="mb-4 grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-2 lg:grid-cols-5">
                <div><p className="text-ink-500">Organisation</p><p className="font-semibold text-referenced-700">{d.org.name}</p><p>Licence: {d.org.licence}</p><p>Account ID: {d.org.account}</p></div>
                <div><p className="text-ink-500">Technical Contact</p><div className="flex gap-2"><Avatar name={d.contact.name} size="sm" /><span><strong className="block">{d.contact.name}</strong>{d.contact.title}<span className="block">{d.contact.email}</span></span></div></div>
                <div><p className="text-ink-500">Plan & Status</p><p className="font-semibold text-referenced-700">{d.plan.name} <Chip tone="good">Active</Chip></p><p>Valid Until: {d.plan.valid}</p></div>
                <div><p className="text-ink-500">Monthly Engagement (ex. VAT)</p><p className="text-lg font-bold text-referenced-700">{zar2(d.monthly)}</p><p>Paid (60%): {zar2(d.paid)} · Balance {zar2(d.balance)}</p></div>
                <div><p className="text-ink-500">Usage This Month</p><p>API Calls {d.calls[0].toLocaleString('en-ZA')} / {d.calls[1].toLocaleString('en-ZA')} ({callsPct}%)</p><Progress value={callsPct} className="my-1" /><p>Data Exports {d.exports[0]} / {d.exports[1]}</p></div>
            </section>
            <Tabs className="mb-4" tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />
            <div className="grid gap-4 xl:grid-cols-3">
                <SectionCard title="API Access Overview"><dl className="space-y-1.5 text-xs">{d.access.map(([k, v]: string[]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="flex items-center gap-1 font-medium">{v}{k === 'Base URL' && <button type="button" onClick={() => void navigator.clipboard?.writeText(v)} aria-label="Copy base URL"><Copy className="size-3.5" /></button>}</dd></div>)}</dl></SectionCard>
                <SectionCard title="Top API Endpoints (This Month)"><table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Endpoint</th><th>Calls</th><th>Success</th></tr></thead><tbody className="divide-y divide-parchment-300">{d.endpoints.map(([e, c, s]: [string, number, number]) => <tr key={e}><td className="py-1.5 font-mono">{e}</td><td className="text-center">{c.toLocaleString('en-ZA')}</td><td className="text-center">{s}% <CheckCircle2 className="inline size-3.5 text-verified-500" /></td></tr>)}</tbody></table></SectionCard>
                <SectionCard title="API Key Management" action={<Button type="button" size="sm" disabled title="Key generation is being connected"><KeyRound className="size-4" />Generate New API Key</Button>}>
                    <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Key Name</th><th className="text-left">Key Preview</th><th>Created</th><th>Status</th></tr></thead><tbody className="divide-y divide-parchment-300">{keys.map((k) => <tr key={k.name}><td className="py-1.5">{k.name}</td><td className="font-mono">{k.preview}</td><td className="text-center">{k.created}</td><td className="text-center"><Chip tone={k.status === 'active' ? 'good' : 'bad'}>{k.status}</Chip></td></tr>)}{keys.length === 0 && <tr><td colSpan={4} className="py-3 text-center text-ink-500">No API keys yet.</td></tr>}</tbody></table>
                </SectionCard>
                <SectionCard title="Rate Limits (Per Minute)"><table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Endpoint Group</th><th>Limit</th><th>Used</th><th>Remaining</th></tr></thead><tbody className="divide-y divide-parchment-300">{d.limits.map(([g, l, u]: [string, number, number]) => <tr key={g}><td className="py-1.5">{g}</td><td className="text-center">{l.toLocaleString('en-ZA')}</td><td className="text-center">{u}</td><td className="text-center">{(l - u).toLocaleString('en-ZA')}</td></tr>)}</tbody></table></SectionCard>
                <SectionCard title="White-Label Configuration"><dl className="space-y-1.5 text-xs">{[['Brand Name', d.whiteLabel.brand], ['Logo', d.whiteLabel.logo], ['Primary Colour', d.whiteLabel.colour], ['Domain', d.whiteLabel.domain], ['Status', d.whiteLabel.status]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="flex items-center gap-1.5 font-medium">{k === 'Primary Colour' && <span className="size-3 rounded" style={{ background: v }} />}{v}</dd></div>)}</dl></SectionCard>
                <SectionCard title="Integrations & Webhooks"><ul className="space-y-1.5 text-xs">{d.integrations.map(([n, s]: string[]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="text-ink-500">Last Sync {s}</span><Chip tone="good">Active</Chip></li>)}</ul></SectionCard>
            </div>
            <p className="mt-4 flex items-center gap-1.5 rounded bg-attested-50 p-2 text-xs text-attested-700"><Shield className="size-4" />For security, keep your API keys confidential. Do not share keys in public repositories or expose them in client-side code. API support: api-support@tbca.africa</p>
        </AiimPage>
    );
}
