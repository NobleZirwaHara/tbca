import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { BadgeCheck, Lock, MessageCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Select } from '@/Components/ui/Form';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, CheckList, KV, Notice } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { TechHeader } from '@/types/advisory';

interface Props {
    engagements: { reference: string; organisation: string }[];
    engagement: TechHeader | null;
    templates: [string, string, string | null, string][];
    consent: { opt_in: boolean; since: string };
    triggers: string[];
    timeline: { at: string; event: string; by: string }[];
}

const dot: Record<string, string> = { good: 'bg-verified-500', warn: 'bg-attested-500', bad: 'bg-risk-500', info: 'bg-controlled-500', neutral: 'bg-ink-300' };
const LINK: Record<string, string> = { 'View Fee Schedule': 'fee-meter', 'Open Engagement Letter': 'documents', 'Review Gate in Portal': '', 'View Funding Options': 'external-costs', 'Update Payment Method': 'payments', 'View Usage & Meter': 'usage', 'Review UAT': 'uat', 'Manage Renewal': 'subscription', 'View Support Case': 'support' };

export default function WhatsApp({ engagements, engagement: e, templates, consent, triggers, timeline }: Props) {
    const [sel, setSel] = useState(templates[3]?.[0] ?? templates[0][0]);
    const visible = consent.opt_in ? templates.filter((t) => t[0] !== 'Opt-Out Confirmation') : templates;
    return (
        <AdminShell title="WhatsApp Transaction Flow Set" description="Controlled operational messaging channel for Technology Solutions. Notifications only — the secure portal is authoritative.">
            <Head title="WhatsApp Transaction Flow Set" />
            <div className="mb-3 flex flex-wrap items-end gap-3">
                <label className="text-xs">Engagement<Select value={e?.reference ?? ''} onChange={(x) => router.get('/admin/advisory/tech/whatsapp', { engagement: x.target.value })} options={engagements.map((x) => ({ value: x.reference, label: `${x.reference} — ${x.organisation}` }))} className="mt-1 w-80" /></label>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
                <Notice tone={consent.opt_in ? 'good' : 'bad'}>Consent Status: {consent.opt_in ? 'Opt-In — Active' : 'Opted out'} since {consent.since}</Notice>
                <Notice tone="info">Gate approval, signatures, payment authorization and production release must occur in the secure portal.</Notice>
                <Notice tone="warn">Live triggers for this engagement: {triggers.length ? triggers.join(', ') : 'none'}</Notice>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <aside className="rounded-[8px] border border-parchment-400 bg-white p-3 xl:col-span-3">
                    <p className="text-sm font-semibold">Flows / Conversations</p>
                    <ul className="mt-2 space-y-1">{templates.map(([t, , , tone]) => <li key={t}><button type="button" onClick={() => setSel(t)} className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs', sel === t ? 'bg-gold-50 font-semibold' : 'hover:bg-parchment-200')}><span className={cn('size-2 rounded-full', dot[tone])} />{t}{triggers.includes(t) && <span className="ml-auto rounded bg-attested-50 px-1 text-[0.625rem] text-attested-700">live</span>}</button></li>)}</ul>
                </aside>
                <section className="rounded-[10px] bg-[#e5ddd5] p-4 xl:col-span-5">
                    <div className="mb-3 flex items-center gap-2 rounded bg-verified-700 px-3 py-2 text-sm text-white"><MessageCircle className="size-5" />TBCA Technology Solutions <BadgeCheck className="size-4" /><span className="text-xs opacity-80">Business Account</span></div>
                    <div className="max-h-[520px] space-y-3 overflow-y-auto">
                        {visible.map(([t, body, cta]) => (
                            <div key={t} className={cn('max-w-[85%] rounded-[8px] bg-white p-3 text-sm shadow-sm', sel === t && 'ring-2 ring-gold-500')}>
                                <p className="font-semibold">{t}</p>
                                <p className="mt-1 text-ink-700">{body}</p>
                                {cta && e && <Link href={`/technology-solutions/workspace/${e.reference}${LINK[cta] ? `/${LINK[cta]}` : '?gate=1'}`} className="mt-2 flex items-center justify-center gap-1 border-t border-parchment-300 pt-2 text-xs font-semibold text-controlled-700"><Lock className="size-3" />{cta}</Link>}
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-center text-[0.6875rem] text-ink-600">This channel is for notifications only. Replies are not monitored.</p>
                </section>
                <aside className="space-y-4 xl:col-span-4">
                    {e && <Card title="Transaction Context"><KV rows={[['Engagement Reference', e.reference], ['Client', e.organisation], ['Tower / Solution Area', e.tower], ['Current Journey Stage', e.stage_name], ['Gate', e.gate_label]]} /></Card>}
                    <Card title="Consent & Opt-In">
                        <p className="text-xs">{consent.opt_in ? 'Opt-In (Active)' : 'Opted out'} since {consent.since}</p>
                        {e && <Button size="sm" variant="outline" className="mt-2 border-risk-500 text-risk-700" onClick={() => router.post(`/admin/advisory/tech/whatsapp/${e.reference}`, {}, { preserveScroll: true })}>{consent.opt_in ? 'Stop Messages / Opt Out' : 'Re-enable (record opt-in)'}</Button>}
                    </Card>
                    <Card title="Commercial Safeguards"><CheckList items={['Gate approval must occur in the secure portal.', 'No production release from WhatsApp.', 'No spend-cap increase from chat.', 'No supplier commitment from WhatsApp.', 'No payment authorization via WhatsApp.']} /></Card>
                    <Card title="Activity Log"><ul className="space-y-1 text-xs">{timeline.map((t, i) => <li key={i}><span className="text-ink-500">{t.at}</span> {t.event}</li>)}</ul></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

WhatsApp.layout = null;
