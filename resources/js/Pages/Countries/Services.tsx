import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import * as L from 'lucide-react';
import { CountryHeader, CountrySidebar, Frame } from '@/Components/Countries/Shell';
import { ActionButton, Advisor, Card, Chip, FilterSelect, Ico, NoResolution, Note, Table, TrustStrip } from '@/Components/Countries/ui';
import { usePrice } from '@/lib/money';
import type { CategoryRow, Country, ResolverProfile, ServiceRow } from '@/types/countries';

interface Props {
    country: Country;
    profile: ResolverProfile;
    categories: CategoryRow[];
    services: ServiceRow[];
    filters: Record<string, string>;
    categoryOptions: { value: string; label: string }[];
}

export function PriceCell({ s, slug }: { s: ServiceRow; slug: string }) {
    const price = usePrice();
    if (s.price_allowed && s.price_zar) {
        return (
            <span className="flex flex-wrap items-center gap-2">
                <b className="text-ink-900">{price(s.price_zar)}</b>
                <button
                    type="button"
                    onClick={() => router.post('/basket', { item_type: 'country-service', item_code: s.code, name: `${s.name} (South Africa)`, unit_zar: s.price_zar, commercial_act: 'resolved-price', meta: { country: slug } }, { preserveScroll: true })}
                    className="rounded bg-gold-500 px-2 py-0.5 text-xs font-semibold text-ink-900 hover:bg-gold-400"
                >
                    Add to Basket
                </button>
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 text-xs text-ink-500" title={s.reasons.join(' ')}>
            <L.Lock className="size-3.5" aria-hidden="true" /> Price Suppressed
        </span>
    );
}

export default function Services({ country, profile, categories, services, filters, categoryOptions }: Props) {
    const path = `/countries/${country.slug}/services`;
    const [q, setQ] = useState(filters.q ?? '');
    const total = categories.reduce((s, c) => s + c.available + c.restricted + c.unavailable, 0);
    const avail = categories.reduce((s, c) => s + c.available, 0);
    const restr = categories.reduce((s, c) => s + c.restricted, 0);
    const unav = categories.reduce((s, c) => s + c.unavailable, 0);

    return (
        <Frame
            title="Country Service Catalogue"
            crumbs={[{ label: 'Countries', href: '/countries' }, { label: country.name, href: `/countries/${country.slug}` }, { label: 'Service Catalogue' }]}
            sidebar={<CountrySidebar country={country} />}
            right={
                <>
                    <Card title="Service Access Summary">
                        <ul className="space-y-3">
                            {[[avail, 'Available', 'Services you can access', 'text-verified-700'], [restr, 'Restricted', 'Subject to specific permission', 'text-attested-700'], [unav, 'Unavailable', 'Not permitted', 'text-risk-700'], [total, 'Total Services', 'Across all categories', 'text-ink-900']].map(([n, l, b, c]) => (
                                <li key={l as string} className="flex items-center gap-3"><span className={`text-2xl font-bold ${c}`}>{n}</span><span><b className="text-sm">{l}</b><span className="block text-xs text-ink-500">{b}</span></span></li>
                            ))}
                        </ul>
                        <div className="mt-3"><Note tone="warn" title="No Resolution, No Price.">All services are resolver-governed.</Note></div>
                    </Card>
                    <Advisor title="Need Help Choosing?" body="Speak to a TBCA Advisor for tailored guidance on the right service for your needs." cta="Ask a Question" />
                    <ActionButton label="Request a Quote" href={`/countries/${country.slug}/quote`} primary />
                </>
            }
        >
            <CountryHeader country={country} kpis={[
                { label: 'Services Available', value: avail, caption: `of ${total} services`, icon: 'briefcase' },
                { label: 'Service-by-service', value: 'Permission applies', caption: 'Resolver governed access', icon: 'shield' },
                { label: 'Resolver Completeness', value: profile.rcs_label, caption: 'All critical fields', icon: 'gauge' },
                { label: 'Last Reviewed', value: country.last_reviewed ?? '—', caption: `Next review: ${country.next_review ?? '—'}`, icon: 'calendar-days' },
            ]} />

            {!country.activated ? (
                <><Note tone="warn" title="No service catalogue">{country.name} is a shell. Country search does not imply commercial permission; services, quotes and prices are unavailable.</Note><NoResolution /></>
            ) : (
                <>
                    <form className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 sm:grid-cols-3 lg:grid-cols-6" onSubmit={(e) => { e.preventDefault(); router.get(path, { ...filters, q: q || undefined }, { preserveScroll: true }); }}>
                        <label className="block text-[0.6875rem] font-medium text-ink-500 lg:col-span-2">Search services
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services..." className="mt-1 h-9 w-full rounded border border-parchment-500 px-2 text-[0.8125rem]" />
                        </label>
                        <FilterSelect label="Category" name="category" value={filters.category} options={categoryOptions} path={path} query={filters} />
                        <FilterSelect label="Availability" name="availability" value={filters.availability} options={[{ value: 'available', label: 'Available' }, { value: 'restricted', label: 'Restricted' }, { value: 'unavailable', label: 'Unavailable' }]} path={path} query={filters} />
                        <FilterSelect label="Access Type" name="access_type" value={filters.access_type} options={[{ value: 'Service-by-service', label: 'Service-by-service' }, { value: 'Partner-routed', label: 'Partner-routed' }]} path={path} query={filters} />
                        <div className="flex items-end gap-2">
                            <FilterSelect label="Commercial Model" name="model" value={filters.model} options={[{ value: 'Commercial', label: 'Commercial' }, { value: 'Quote', label: 'Quote' }]} path={path} query={filters} className="flex-1" />
                            <Link href={path} className="mb-0.5 flex h-9 items-center gap-1 rounded border border-gold-500 px-2 text-xs font-semibold text-gold-800"><L.RotateCcw className="size-3.5" /> Reset</Link>
                        </div>
                    </form>

                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {categories.map((c) => (
                            <li key={c.key} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
                                <div className="flex gap-3">
                                    <Ico name={c.icon} className="size-7 shrink-0 text-gold-600" />
                                    <div><p className="text-[0.875rem] font-semibold text-ink-900">{c.name}</p><p className="text-xs text-ink-500">{c.blurb}</p></div>
                                </div>
                                <p className="mt-3 flex flex-wrap gap-3 text-[0.6875rem]">
                                    <span className="text-verified-700">● {c.available} Available</span><span className="text-attested-700">● {c.restricted} Restricted</span><span className="text-risk-700">● {c.unavailable} Unavailable</span>
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1"><Chip>{c.state}</Chip><Chip tone="info">Service-by-service</Chip></div>
                                <Link href={`${path}?category=${c.key}`} preserveScroll className="mt-3 rounded border border-gold-500 py-1.5 text-center text-xs font-semibold text-gold-800 hover:bg-gold-50">View Services →</Link>
                            </li>
                        ))}
                    </ul>

                    <Card title={`Services (${services.length})`} intro="Each row is resolved now by the Country Resolver.">
                        <Table columns={['Code', 'Service', 'State', 'Access', 'Timeline', 'Price', '']} rows={services.map((s) => [
                            <span className="font-mono text-xs">{s.code}</span>, <span className="font-medium text-ink-900">{s.name}</span>, <Chip>{s.state_label}</Chip>, <Chip>{s.access}</Chip>, s.timeline,
                            <PriceCell s={s} slug={country.slug} />, <Link href={`${path}/${s.code}`} className="text-xs font-semibold text-gold-700">Detail →</Link>,
                        ])} empty="No services match these filters." />
                    </Card>
                </>
            )}

            <TrustStrip items={[['Resolver-Governed Access', 'Service access depends on resolver state and service-by-service permission.'], ['Price & Fees', 'All pricing and fees are suppressed until permission and price resolution.'], ['Evidence-Backed Services', 'Each service is supported by verified sources and current evidence.'], ['Commercial Availability Rule', 'Commercial availability is service-by-service.']]} />
        </Frame>
    );
}
