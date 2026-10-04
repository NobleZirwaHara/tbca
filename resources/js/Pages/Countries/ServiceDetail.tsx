import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import * as L from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { Field, Select } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import { CountrySidebar, Frame } from '@/Components/Countries/Shell';
import { LEDGER_META } from '@/Components/Countries/Ledger';
import { ActionButton, Card, Checklist, Chip, KV, Kpi, Note, Table, TrustStrip } from '@/Components/Countries/ui';
import { usePrice } from '@/lib/money';
import type { Country, RegisterRow, ResolverProfile, ServiceRow } from '@/types/countries';
import { PriceCell } from './Services';

interface Props {
    country: Country;
    profile: ResolverProfile;
    service: ServiceRow & { details: Record<string, any>; category_name: string };
    related: ServiceRow[];
    eligibility: (Record<string, any> & { notes: string[]; reasons: string[] }) | null;
    ledgers: string[];
    history: RegisterRow[];
}

export default function ServiceDetail({ country, profile, service, related, eligibility, ledgers, history }: Props) {
    const [tab, setTab] = useState('overview');
    const price = usePrice();
    const d = service.details ?? {};
    const form = useForm({ customer_type: 'company', residency: country.iso2, currency: 'ZAR' });
    const base = `/countries/${country.slug}/services`;

    const tabs = ['Overview', "What's Included", 'Process & Timeline', 'Requirements', 'Costs & Fees', 'Limitations', 'Related Services', 'Change History'];

    return (
        <Frame
            title="Service Detail"
            crumbs={[{ label: 'Countries', href: '/countries' }, { label: country.name, href: `/countries/${country.slug}` }, { label: 'Service Catalogue', href: base }, { label: 'Service Detail' }]}
            sidebar={<CountrySidebar country={country} />}
            actions={<Link href={base} className="rounded border border-gold-500 px-3 py-2 text-[0.8125rem] font-semibold text-gold-800">← Back to Service Catalogue</Link>}
            right={
                <>
                    <Card title="Service Access">
                        <p className="text-xs font-semibold text-ink-500">Commercial Availability</p>
                        <p className={`mt-1 flex items-center gap-1.5 font-semibold ${service.eligible ? 'text-verified-700' : 'text-attested-700'}`}>
                            {service.eligible ? <L.CircleCheck className="size-5" /> : <L.CircleAlert className="size-5" />} {service.eligible ? 'Permitted' : service.state_label}
                        </p>
                        <p className="text-xs text-ink-500">Access governed by Country Resolver</p>
                        <p className="mt-4 text-xs font-semibold text-ink-500">Resolver Dependencies</p>
                        <KV rows={(d.dependencies ?? []).map((x: string) => [x, <Chip tone={profile.missing.some((m) => m.domain.startsWith(x.split(' ')[0])) ? 'bad' : 'good'}>{profile.missing.some((m) => m.domain.startsWith(x.split(' ')[0])) ? 'Missing' : 'Complete'}</Chip>])} />
                    </Card>
                    <Card title="Check My Eligibility" intro="Runs GATE-CT-01..04 for your customer context.">
                        <form onSubmit={(e) => { e.preventDefault(); form.post(`${base}/${service.code}/eligibility`, { preserveScroll: true }); }} className="space-y-3">
                            <Field label="Customer type" error={form.errors.customer_type}>{(id) => <Select id={id} value={form.data.customer_type} onChange={(e) => form.setData('customer_type', e.target.value)} options={[{ value: 'company', label: 'Company' }, { value: 'sole_proprietor', label: 'Sole proprietor' }, { value: 'individual', label: 'Individual' }, { value: 'government', label: 'Government / institution' }]} />}</Field>
                            <Field label="Residency (country code)" error={form.errors.residency}>{(id) => <Select id={id} value={form.data.residency} onChange={(e) => form.setData('residency', e.target.value)} options={[{ value: country.iso2, label: `${country.name} (${country.iso2})` }, { value: 'KE', label: 'Kenya (KE)' }, { value: 'NG', label: 'Nigeria (NG)' }, { value: 'GB', label: 'United Kingdom (GB)' }, { value: 'US', label: 'United States (US)' }]} />}</Field>
                            <Field label="Requested currency" error={form.errors.currency}>{(id) => <Select id={id} value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)} options={['ZAR', 'USD']} />}</Field>
                            <Button type="submit" className="w-full" disabled={form.processing} trailingIcon="arrow-right">Check My Eligibility</Button>
                        </form>
                        {eligibility && (
                            <div className="mt-3 space-y-2">
                                <Note tone={eligibility.eligible ? 'good' : 'warn'} title={eligibility.eligible ? 'Eligible' : 'Governed restriction'}>
                                    Route: {eligibility.route}. {eligibility.price_allowed ? `Resolved price ${price(eligibility.price_zar)}.` : 'Price suppressed.'}
                                </Note>
                                {[...eligibility.reasons, ...eligibility.notes].map((r: string) => <p key={r} className="text-[0.6875rem] text-ink-600">• {r}</p>)}
                                <p className="text-[0.6875rem] text-ink-400">Checked {eligibility.checked_at}</p>
                            </div>
                        )}
                    </Card>
                    <div className="space-y-2">
                        {service.quote_permitted && <ActionButton label="Request Service Access" href={`/countries/${country.slug}/quote?service=${service.code}`} primary />}
                        {service.access !== 'available' && <ActionButton label="Register Interest" href={`/countries/${country.slug}/waitlist`} />}
                        <ActionButton label="Download Service Brief" href={`/countries/${country.slug}/brief/service`} download />
                        <ActionButton label="Ask a Question" />
                    </div>
                </>
            }
        >
            <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <L.Briefcase className="size-10 rounded border border-gold-400 p-2 text-gold-600" />
                    <div>
                        <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold text-ink-900">{service.name} <Chip>{service.state_label}</Chip></h2>
                        <p className="text-xs text-ink-500">Service Code: <b>{service.code}</b> · Category: <b>{service.category_name}</b> · <Chip tone="info">{service.access_type}</Chip></p>
                    </div>
                </div>
                <p className="mt-3 text-[0.8125rem] text-ink-600">{service.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Availability" value={service.access === 'available' ? 'Available' : service.access === 'restricted' ? 'Restricted' : 'Unavailable'} caption={service.route} icon="shield-check" />
                <Kpi label="Resolver Completeness" value={profile.rcs_label} caption="All critical fields" icon="gauge" />
                <Kpi label="Evidence Status" value="Current" caption="All critical domains" icon="badge-check" />
                <Kpi label="Last Reviewed" value={country.last_reviewed ?? '—'} caption={`Next review: ${country.next_review}`} icon="calendar-days" />
            </div>

            <Tabs tabs={tabs.map((t) => ({ key: t, label: t }))} value={tab === 'overview' ? 'Overview' : tab} onChange={setTab} />

            {(tab === 'overview' || tab === 'Overview') && (
                <div className="grid gap-4 xl:grid-cols-4">
                    <Card title="Service Overview" className="xl:col-span-1">
                        <p className="text-[0.8125rem] text-ink-600">{d.overview}</p>
                        <div className="mt-3"><Checklist items={d.included ?? []} /></div>
                    </Card>
                    <Card title="Service Process">
                        <ol className="space-y-2">
                            {(d.process ?? []).map(([t, b]: [string, string], i: number) => (
                                <li key={t} className="flex gap-2.5 text-[0.8125rem]"><span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-gold-500 text-xs font-bold">{i + 1}</span><span><b>{t}</b><span className="block text-xs text-ink-500">{b}</span></span></li>
                            ))}
                        </ol>
                    </Card>
                    <CostsCard service={service} ledgers={ledgers} />
                    <Card title="Key Details">
                        <KV rows={Object.entries(d.key ?? { 'Delivery Model': service.delivery_model, 'Service Type': service.access_type, 'Typical Timeline': service.timeline ?? '—', 'Service Owner': 'TBCA Operations', 'Evidence Quality': 'High', 'Data Freshness': 'Current' }).map(([k, v]) => [k, String(v)])} />
                    </Card>
                </div>
            )}
            {tab === "What's Included" && <Card title="What's Included"><Checklist items={d.included ?? []} /></Card>}
            {tab === 'Process & Timeline' && <Card title="Process & Timeline" intro={`Typical timeline: ${service.timeline}`}><Table columns={['Step', 'Stage', 'Description']} rows={(d.process ?? []).map(([t, b]: [string, string], i: number) => [i + 1, t, b])} /></Card>}
            {tab === 'Requirements' && <Card title="Requirements"><Checklist items={d.requirements ?? []} /></Card>}
            {tab === 'Costs & Fees' && <CostsCard service={service} ledgers={ledgers} />}
            {tab === 'Limitations' && <Card title="Limitations"><Checklist items={(d.limitations ?? []).map((l: string) => ['warn', l] as [string, string])} /></Card>}
            {tab === 'Related Services' && (
                <Card title="Related Services">
                    <Table columns={['Service', 'State', 'Price', '']} rows={related.map((r) => [r.name, <Chip>{r.state_label}</Chip>, <PriceCell s={r} slug={country.slug} />, <Link href={`${base}/${r.code}`} className="text-xs font-semibold text-gold-700">View →</Link>])} />
                </Card>
            )}
            {tab === 'Change History' && <Card title="Change History"><Table columns={['ID', 'When', 'Summary', 'Old → New']} rows={history.map((h) => [h.code, h.data.at, h.title, `${h.data.old} → ${h.data.new}`])} /></Card>}

            <TrustStrip items={[['Evidence First', `All claims evidence-backed and current as of ${country.last_reviewed}.`], ['Secure & Compliant', 'POPIA-aligned, ISO 27001 controls.'], ['Human Review', 'All deliverables reviewed by subject matter experts.'], ['Always Current', 'Continuous monitoring of regulatory changes.']]} />
        </Frame>
    );
}

function CostsCard({ service, ledgers }: { service: ServiceRow; ledgers: string[] }) {
    const price = usePrice();
    return (
        <Card title="Cost & Pricing Information" intro="Prices are suppressed until service permission and pricing resolution are complete. Each ledger is shown separately.">
            <ul className="space-y-1.5">
                {ledgers.map((l) => (
                    <li key={l} className="flex items-center justify-between rounded border border-parchment-400 px-3 py-1.5 text-[0.8125rem]">
                        <span>{LEDGER_META[l].name} ({l})</span>
                        {l === 'T' && service.price_allowed && service.price_zar ? <b>{price(service.price_zar)}</b> : <span className="flex items-center gap-1 text-xs text-ink-500">{l === 'T' ? 'Price Suppressed' : 'Resolved per request'} <L.Lock className="size-3" /></span>}
                    </li>
                ))}
            </ul>
            {!service.price_allowed && (
                <div className="mt-3"><Note tone="warn" title="PRICE SUPPRESSED">Resolution required to display pricing. {service.reasons[0]}</Note></div>
            )}
        </Card>
    );
}
