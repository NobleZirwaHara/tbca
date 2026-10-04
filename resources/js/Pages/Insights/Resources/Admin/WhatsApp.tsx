import { useForm } from '@inertiajs/react';
import { CheckCircle2, MessageCircle, Send, Target, Users } from 'lucide-react';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Bars, Box, CheckList, Donut, Legend, PALETTE, Stat, Status, Table, num } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';

interface Props {
    kpis: { contacts: number; sent: number; delivered: number; resources: number; engagement: number; conversions: number };
    funnel: { label: string; value: number }[];
    categories: { label: string; value: number }[];
    templates: { id: number; name: string; type: string; status: string; usage: number }[];
    deliveries: { at: string; contact: string; phone: string; campaign: string; resource: string; type: string; status: string; engaged: boolean; converted: boolean }[];
    resources: { value: string; label: string }[];
    optedIn: number;
}

export default function WhatsAppDelivery({ kpis, funnel, categories, templates, deliveries, resources, optedIn }: Props) {
    const form = useForm({ resource: '', campaign: 'SME Nurture Flow' });
    const catTotal = categories.reduce((a, c) => a + c.value, 0);
    return (
        <ResourceAdmin title="WhatsApp Resource Delivery & Nurture" description="Deliver resources, nurture users and convert interest into action via WhatsApp conversations. All messages are compliant, consent-based and human-approved.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Stat label="Active Contacts" value={num(kpis.contacts)} icon={<Users className="size-5" />} />
                <Stat label="Messages Sent" value={num(kpis.sent)} icon={<Send className="size-5" />} />
                <Stat label="Messages Delivered" value={num(kpis.delivered)} caption={`${((kpis.delivered / kpis.sent) * 100).toFixed(1)}% delivery rate`} />
                <Stat label="Resources Delivered" value={num(kpis.resources)} tone="green" icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Engagement Rate" value={`${kpis.engagement}%`} icon={<MessageCircle className="size-5" />} />
                <Stat label="Conversions" value={num(kpis.conversions)} icon={<Target className="size-5" />} tone="gold" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <Box title="Nurture Funnel (All Campaigns)"><Bars items={funnel.map((f, i) => ({ label: f.label, value: f.value, color: PALETTE[i] }))} /></Box>
                <Box title="Top Resource Categories Delivered"><div className="flex items-center gap-4"><Donut label={num(catTotal)} sub="Resources" size={110} segments={categories.map((c, i) => ({ value: c.value, color: PALETTE[i] }))} /><Legend items={categories.map((c, i) => ({ label: c.label, value: num(c.value), color: PALETTE[i] }))} /></div></Box>
                <Box title="Message Template Library"><Table head={['Template', 'Type', 'Status', 'Usage (30d)']} rows={templates.map((t) => [t.name, t.type, <Status key="s" value={t.status} />, num(t.usage)])} /></Box>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_300px]">
                <Box title="Recent WhatsApp Deliveries">
                    <Table head={['Date / Time', 'Contact', 'Phone', 'Campaign / Flow', 'Resource Delivered', 'Type', 'Status', 'Engaged', 'Converted']}
                        rows={deliveries.map((d) => [<span key="a" className="text-xs">{d.at}</span>, d.contact, <span key="p" className="text-xs">{d.phone}</span>, d.campaign, d.resource, d.type, <Status key="s" value={d.status} />, <Status key="e" value={d.engaged ? 'yes' : 'no'} />, <Status key="c" value={d.converted ? 'yes' : 'no'} />])} />
                </Box>
                <div className="space-y-4">
                    <Box title="Send Resource Broadcast">
                        <p className="mb-2 text-xs text-ink-500">Only current free or gated resources; only to {optedIn} opted-in contact(s) with a WhatsApp number.</p>
                        <div className="space-y-3">
                            <Field label="Resource" required error={form.errors.resource}>{(id) => <Select id={id} value={form.data.resource} onChange={(e) => form.setData('resource', e.target.value)} options={resources} placeholder="Select resource" />}</Field>
                            <Field label="Campaign / Flow" required error={form.errors.campaign}>{(id) => <Input id={id} value={form.data.campaign} onChange={(e) => form.setData('campaign', e.target.value)} />}</Field>
                            <button type="button" disabled={form.processing || !form.data.resource} onClick={() => form.post('/admin/insights/resources/whatsapp/broadcast', { preserveScroll: true })} className="w-full rounded bg-gold-500 py-2 text-xs font-bold disabled:opacity-50">Send Broadcast</button>
                        </div>
                    </Box>
                    <Box title="Messaging Guardrails"><CheckList className="text-xs" items={['No gated output release', 'No advice or opinions', 'Consent checked before every send', 'Escalate to portal for outputs', 'Support & notifications only']} /></Box>
                </div>
            </div>
        </ResourceAdmin>
    );
}
