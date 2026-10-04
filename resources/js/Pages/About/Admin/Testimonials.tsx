import { router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Check, Download, FileText, Plus, RotateCcw, Search } from 'lucide-react';
import { KpiTile, Modal, Panel, StatusPill } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Textarea } from '@/Components/ui/Form';
import { Select } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import AdminShell, { Donut, useFilters } from '@/Components/About/AdminShell';
import { fmtDate } from '@/Components/About/ClaimEvidence';

interface Item {
    id: number;
    code: string;
    company: string;
    person: string | null;
    role: string | null;
    industry: string | null;
    service: string | null;
    quote: string;
    status: string;
    consent: string;
    consent_date: string | null;
    expires: string | null;
    channels: string[];
    live: boolean;
    featured: boolean;
}
interface Props {
    items: Item[];
    kpis: Record<'total' | 'published' | 'live' | 'pending' | 'draft' | 'expired' | 'declined', number>;
    consent: { key: string; count: number }[];
    channels: Record<string, number>;
    filters: Record<string, string | undefined>;
    options: { industries: string[]; services: string[] };
}

const CHANNELS = ['website', 'linkedin', 'proposals', 'presentations'];
const consentColors: Record<string, string> = { active: '#1f7a4c', expired: '#b5372a', revoked: '#b0781e', pending: '#2f5fa8', declined: '#8a8a8a' };

export default function Testimonials({ items, kpis, consent, channels, filters, options }: Props) {
    const apply = useFilters('/admin/about/testimonials', filters);
    const [q, setQ] = useState(filters.q ?? '');
    const [adding, setAdding] = useState(false);
    const [renewing, setRenewing] = useState<Item | null>(null);
    const [renewDate, setRenewDate] = useState('');
    const add = useForm({ company: '', person_name: '', person_role: '', industry: '', service_used: '', quote: '', consent_date: '', consent_expires_at: '', channels: ['website'] as string[] });
    const maxChannel = Math.max(1, ...Object.values(channels));

    const act = (t: Item, action: string, extra: Record<string, string> = {}) => router.post(`/admin/about/testimonials/${t.id}/action`, { action, ...extra }, { preserveScroll: true, onSuccess: () => setRenewing(null) });
    const submitAdd = (e: FormEvent) => {
        e.preventDefault();
        add.post('/admin/about/testimonials', { preserveScroll: true, onSuccess: () => { add.reset(); setAdding(false); } });
    };

    return (
        <AdminShell
            crumb="Testimonial Manager"
            title="Consent & Testimonial Manager"
            lead="Collect. Manage. Publish responsibly."
            description="Track client consent, manage testimonials, and control how and where they are displayed. A testimonial is live only while published with active, unexpired consent for the channel."
            actions={<Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="size-4" /> Add New Testimonial</Button>}
        >
            <div className="grid gap-5 xl:grid-cols-[1fr_18rem]">
                <div className="min-w-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                        <KpiTile label="Total Testimonials" value={kpis.total} caption="Across all statuses" icon={<FileText className="size-4" />} />
                        <KpiTile label="Published" value={kpis.published} caption={`${kpis.live} live on website`} tone="good" />
                        <KpiTile label="Pending Review" value={kpis.pending} caption="Awaiting approval" tone="warn" />
                        <KpiTile label="Draft" value={kpis.draft} caption="Being prepared" />
                        <KpiTile label="Expired Consent" value={kpis.expired} caption="Consent lapsed" tone="bad" />
                        <KpiTile label="Declined / Not Used" value={kpis.declined} caption="Not published" />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); apply({ q }); }} className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-3 xl:grid-cols-[1.4fr_repeat(4,1fr)_auto]">
                        <label className="relative"><span className="sr-only">Search testimonials</span><Search className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search testimonials by name, company, keyword..." className="pl-9" /></label>
                        <Select aria-label="Status" placeholder="All statuses" options={['draft', 'pending_review', 'published', 'declined'].map((v) => ({ value: v, label: v.replace('_', ' ') }))} value={filters.status ?? ''} onChange={(e) => apply({ status: e.target.value })} />
                        <Select aria-label="Industry" placeholder="All industries" options={options.industries} value={filters.industry ?? ''} onChange={(e) => apply({ industry: e.target.value })} />
                        <Select aria-label="Consent status" placeholder="All consent" options={['active', 'expired', 'revoked', 'pending', 'declined']} value={filters.consent ?? ''} onChange={(e) => apply({ consent: e.target.value })} />
                        <Select aria-label="Source service" placeholder="All services" options={options.services} value={filters.service ?? ''} onChange={(e) => apply({ service: e.target.value })} />
                        <button type="button" onClick={() => router.get('/admin/about/testimonials')} className="inline-flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 px-3 text-xs font-semibold"><RotateCcw className="size-3.5" aria-hidden="true" /> Clear</button>
                    </form>
                    <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                        <table className="w-full min-w-[1050px] text-left text-[0.8125rem]">
                            <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['ID', 'Client / Company', 'Service Used', 'Testimonial Excerpt', 'Status', 'Consent Status', 'Consent Date', 'Expiry Date', 'Channels', 'Actions'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {items.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-ink-400">No testimonials match these filters.</td></tr>}
                                {items.map((t) => (
                                    <tr key={t.id} className="align-top">
                                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gold-700">{t.code}</td>
                                        <td className="px-3 py-2.5 text-ink-900">{t.company}{t.person && <span className="block text-xs text-ink-500">{t.person}</span>}</td>
                                        <td className="px-3 py-2.5">{t.service}</td>
                                        <td className="max-w-64 px-3 py-2.5 text-ink-700">“{t.quote}”</td>
                                        <td className="px-3 py-2.5"><StatusPill status={t.status} />{t.live && <span className="mt-1 flex items-center gap-1 text-[0.6875rem] text-verified-700"><Check className="size-3" aria-hidden="true" /> Live</span>}</td>
                                        <td className="px-3 py-2.5"><StatusPill status={t.consent} tone={t.consent === 'active' ? 'good' : t.consent === 'pending' ? 'info' : t.consent === 'revoked' ? 'warn' : 'bad'} /></td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(t.consent_date)}</td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(t.expires)}</td>
                                        <td className="px-3 py-2.5 text-xs text-ink-600">{t.channels.join(', ') || '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <select aria-label={`Actions for ${t.code}`} value="" onChange={(e) => { const v = e.target.value; if (v === 'renew_consent') { setRenewing(t); setRenewDate(''); } else if (v) act(t, v); }} className="h-8 rounded border border-parchment-400 bg-white px-1 text-xs">
                                                <option value="">Action…</option>
                                                {t.status === 'draft' && <option value="submit">Submit for review</option>}
                                                {t.status !== 'published' && t.status !== 'declined' && <option value="publish">Approve & publish</option>}
                                                {t.status === 'published' && <option value="unpublish">Unpublish</option>}
                                                {t.status !== 'declined' && <option value="decline">Decline</option>}
                                                {t.consent === 'active' && <option value="revoke_consent">Record consent withdrawal</option>}
                                                <option value="renew_consent">Record renewed consent</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <aside className="space-y-4">
                    <Panel title="Consent Overview">
                        <Donut total={kpis.total} segments={consent.map((c) => ({ label: c.key[0].toUpperCase() + c.key.slice(1), value: c.count, color: consentColors[c.key] }))} />
                    </Panel>
                    <Panel title="Top Channels">
                        <ul className="space-y-2 text-xs">
                            {Object.entries(channels).map(([k, v]) => (
                                <li key={k} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-2 capitalize">
                                    <span>{k}</span>
                                    <span className="h-2 rounded-full bg-parchment-300"><span className="block h-2 rounded-full bg-verified-500" style={{ width: `${(v / maxChannel) * 100}%` }} /></span>
                                    <span className="text-right">{v}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title="Quick Actions">
                        <ul className="space-y-2 text-[0.8125rem]">
                            <li><a href="/admin/about/testimonials/export" className="flex items-center gap-2 text-ink-800 hover:text-gold-700"><Download className="size-4" aria-hidden="true" /> Export Consent Register</a></li>
                            <li><button type="button" onClick={() => apply({ consent: 'expired' })} className="text-ink-800 hover:text-gold-700">Review Expired Consents</button></li>
                        </ul>
                    </Panel>
                </aside>
            </div>

            <Modal open={adding} onClose={() => setAdding(false)} title="Add New Testimonial" size="lg">
                <form onSubmit={submitAdd} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company" required error={add.errors.company}>{(id) => <Input id={id} value={add.data.company} onChange={(e) => add.setData('company', e.target.value)} />}</Field>
                    <Field label="Service used" required error={add.errors.service_used}>{(id) => <Input id={id} value={add.data.service_used} onChange={(e) => add.setData('service_used', e.target.value)} />}</Field>
                    <Field label="Person name" error={add.errors.person_name}>{(id) => <Input id={id} value={add.data.person_name} onChange={(e) => add.setData('person_name', e.target.value)} />}</Field>
                    <Field label="Person role" error={add.errors.person_role}>{(id) => <Input id={id} value={add.data.person_role} onChange={(e) => add.setData('person_role', e.target.value)} />}</Field>
                    <Field label="Industry" error={add.errors.industry}>{(id) => <Input id={id} value={add.data.industry} onChange={(e) => add.setData('industry', e.target.value)} />}</Field>
                    <Field label="Exact approved wording" required error={add.errors.quote} className="sm:col-span-2">{(id) => <Textarea id={id} rows={3} value={add.data.quote} onChange={(e) => add.setData('quote', e.target.value)} />}</Field>
                    <Field label="Consent recorded on" error={add.errors.consent_date} hint="Leave blank if consent is still pending.">{(id) => <Input id={id} type="date" value={add.data.consent_date} onChange={(e) => add.setData('consent_date', e.target.value)} />}</Field>
                    <Field label="Consent expires" error={add.errors.consent_expires_at}>{(id) => <Input id={id} type="date" value={add.data.consent_expires_at} onChange={(e) => add.setData('consent_expires_at', e.target.value)} />}</Field>
                    <fieldset className="sm:col-span-2">
                        <legend className="text-[0.8125rem] font-medium text-ink-800">Consented channels</legend>
                        <div className="mt-2 flex flex-wrap gap-4">
                            {CHANNELS.map((c) => (
                                <Checkbox key={c} label={c} checked={add.data.channels.includes(c)} onChange={(e) => add.setData('channels', e.target.checked ? [...add.data.channels, c] : add.data.channels.filter((x) => x !== c))} />
                            ))}
                        </div>
                    </fieldset>
                    <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" disabled={add.processing}>Save as Draft</Button></div>
                </form>
            </Modal>
            <Modal open={!!renewing} onClose={() => setRenewing(null)} title={`Renew consent — ${renewing?.code ?? ''}`} footer={<><Button type="button" variant="outline" onClick={() => setRenewing(null)}>Cancel</Button><Button type="button" disabled={!renewDate} onClick={() => renewing && act(renewing, 'renew_consent', { expires: renewDate })}>Record consent</Button></>}>
                <Field label="Consent valid until" required>{(id) => <Input id={id} type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} />}</Field>
            </Modal>
        </AdminShell>
    );
}
Testimonials.layout = null;
