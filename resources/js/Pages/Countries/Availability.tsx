import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import { CountryHeader, CountrySidebar, Frame } from '@/Components/Countries/Shell';
import { ActionButton, Card, Checklist, Chip, KV, Note, Table, TrustStrip } from '@/Components/Countries/ui';
import type { CategoryRow, Country, RegisterRow, ResolverProfile, ServiceRow } from '@/types/countries';

interface Props {
    country: Country;
    profile: ResolverProfile;
    categories: CategoryRow[];
    services: ServiceRow[];
    history: RegisterRow[];
    limitations: RegisterRow[];
}

const PRINCIPLES = ['Resolver-First, Fail-Closed', 'No Resolution, No Price', 'Service-by-Service Permission', 'Evidence-Backed Access', 'Six-Ledger Fee Separation', 'No Override of Sanctions', 'Sovereign Independence'];

export default function Availability({ country, profile, categories, services, history, limitations }: Props) {
    const [tab, setTab] = useState('service');
    const [view, setView] = useState<'all' | 'available' | 'restricted' | 'unavailable'>('all');
    const [sort, setSort] = useState<'az' | 'za' | 'available'>('az');
    const [q, setQ] = useState('');
    const slug = country.slug;
    const avail = services.filter((s) => s.access === 'available').length;
    const restr = services.filter((s) => s.access === 'restricted').length;
    const unav = services.filter((s) => s.access === 'unavailable').length;

    const cats = [...categories]
        .filter((c) => (view === 'all' ? true : c[view] > 0))
        .sort((a, b) => (sort === 'available' ? b.available - a.available : sort === 'za' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)));
    const svc = services.filter((s) => (view === 'all' || s.access === view) && s.name.toLowerCase().includes(q.toLowerCase()));

    return (
        <Frame
            title="Country Availability Detail"
            lead="Detailed view of commercial availability across services and capabilities. Service access depends on resolver state and service-by-service Country Resolver permission."
            crumbs={[{ label: 'Countries', href: '/countries' }, { label: country.name, href: `/countries/${slug}` }, { label: 'Availability Detail' }]}
            sidebar={<CountrySidebar country={country} />}
            actions={<Link href={`/countries/${slug}`} className="rounded border border-gold-500 px-3 py-2 text-[0.8125rem] font-semibold text-gold-800">← Back to Country Profile</Link>}
            right={
                <>
                    <Card title="Availability Controls">
                        <fieldset className="space-y-1.5 text-[0.8125rem]">
                            <legend className="mb-1 text-xs font-semibold text-ink-500">Service View</legend>
                            {(['all', 'available', 'restricted', 'unavailable'] as const).map((v) => (
                                <label key={v} className="flex items-center gap-2 capitalize">
                                    <input type="radio" name="view" checked={view === v} onChange={() => setView(v)} className="accent-gold-600" /> {v === 'all' ? 'All Services' : `${v} Only`}
                                </label>
                            ))}
                        </fieldset>
                        <label className="mt-3 block text-xs font-semibold text-ink-500">Sort By
                            <select value={sort} onChange={(e) => setSort(e.target.value as 'az')} className="mt-1 h-9 w-full rounded border border-parchment-500 px-2 text-[0.8125rem]">
                                <option value="az">Category (A–Z)</option><option value="za">Category (Z–A)</option><option value="available">Most available</option>
                            </select>
                        </label>
                        <label className="mt-3 block text-xs font-semibold text-ink-500">Search Services
                            <input value={q} onChange={(e) => { setQ(e.target.value); setTab('matrix'); }} placeholder="Type service name..." className="mt-1 h-9 w-full rounded border border-parchment-500 px-2 text-[0.8125rem]" />
                        </label>
                    </Card>
                    <Card title="Commercial Availability Rule">
                        <p className="text-[0.8125rem] text-ink-600">Commercial availability is service-by-service and governed by Country Resolver permission. No resolution, no price.</p>
                        <div className="mt-3 space-y-2">
                            <ActionButton label="View Permission Matrix" onClick={() => setTab('matrix')} primary />
                            <ActionButton label="Ask a Question" />
                        </div>
                    </Card>
                </>
            }
        >
            <CountryHeader country={country} kpis={[
                { label: 'Resolver Completeness', value: profile.rcs_label, caption: profile.rcs >= 100 ? 'All critical fields complete' : 'Incomplete', icon: 'gauge' },
                { label: 'Services Available', value: avail, caption: `of ${services.length || 102} services`, icon: 'briefcase', tone: 'good' },
                { label: 'Services Restricted', value: restr, caption: 'Service-by-service', icon: 'triangle-alert', tone: 'warn' },
                { label: 'Services Unavailable', value: unav, caption: 'Not permitted', icon: 'lock', tone: 'bad' },
            ]} />

            <Tabs
                tabs={[{ key: 'service', label: 'Service Availability' }, { key: 'domains', label: 'Resolver Domains' }, { key: 'matrix', label: 'Permission Matrix', count: svc.length }, { key: 'limits', label: 'Limitations & Boundaries' }, { key: 'commercial', label: 'Commercial Conditions' }, { key: 'history', label: 'Change History' }]}
                value={tab}
                onChange={setTab}
            />

            {tab === 'service' && (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <Card title="Service Availability by Category">
                        {services.length ? (
                            <Table columns={['Category', 'Available', 'Restricted', 'Unavailable', 'Availability State', 'Resolver Dependency', 'Action']} rows={cats.map((c) => [
                                c.name, c.available, c.restricted, c.unavailable, <Chip>{c.state}</Chip>, <Chip tone="good">{c.dependency}</Chip>,
                                <Link href={`/countries/${slug}/services?category=${c.key}`} className="rounded border border-gold-500 px-2 py-0.5 text-xs font-semibold text-gold-800">View Services</Link>,
                            ])} />
                        ) : (
                            <Note tone="warn">{country.name} is a shell: there is no service catalogue and no availability. Register interest to record demand.</Note>
                        )}
                        <div className="mt-3 max-w-xs"><ActionButton label="View Full Service Catalogue" href={`/countries/${slug}/services`} /></div>
                    </Card>
                    <Card title="Availability by Construction Principle">
                        <KV rows={PRINCIPLES.map((p) => [p, <Chip tone="good">Compliant</Chip>])} />
                        <div className="mt-3"><Note tone="warn" title="All construction principles are enforced.">No commercial override permitted.</Note></div>
                    </Card>
                </div>
            )}

            {tab === 'domains' && (
                <Card title="Resolver domains" action={<Link href={`/countries/${slug}/resolver`} className="text-xs font-semibold text-gold-700">Open Context Resolver →</Link>}>
                    {profile.missing.length === 0 ? <Note tone="good">All nine resolver domains are 100% complete. Hard blocks: {profile.hard_blocks}.</Note> : (
                        <Table columns={['Domain', 'Missing fields', 'Error', 'Absence code']} rows={profile.missing.map((m) => [m.domain, m.missing_fields, `${m.error} — ${m.error_label}`, m.absence_code])} />
                    )}
                </Card>
            )}

            {tab === 'matrix' && (
                <Card title="Permission Matrix" intro="Every service resolves independently. Prices appear only where the resolver returns a permit.">
                    <Table columns={['Code', 'Service', 'State', 'Access', 'Route', 'Detail']} rows={svc.map((s) => [
                        <span className="font-mono text-xs">{s.code}</span>, s.name, <Chip>{s.state_label}</Chip>, <Chip>{s.access}</Chip>, s.route,
                        <Link href={`/countries/${slug}/services/${s.code}`} className="text-xs font-semibold text-gold-700">View →</Link>,
                    ])} empty="No services match." />
                </Card>
            )}

            {tab === 'limits' && (
                <Card title="Limitations & Boundaries" action={<Link href={`/countries/${slug}/limitations`} className="text-xs font-semibold text-gold-700">Full limitations →</Link>}>
                    {limitations.length ? <Checklist items={limitations.map((l) => ['warn', `${l.title} — ${l.data.body} (${l.status})`] as [string, string])} /> : <Note tone="warn">All country facts are unresolved for this shell.</Note>}
                </Card>
            )}

            {tab === 'commercial' && (
                <Card title="Commercial Conditions">
                    <Checklist items={[['ok', 'Each service requires explicit permission. No implied or blanket access.'], ['ok', 'All pricing suppressed until service permission and price resolution.'], ['warn', 'Tax treatment shown only when resolver fields are resolved.'], ['warn', 'Payment methods available subject to liquidity, permission and licence.'], ['bad', 'Sanctions and prohibitions cannot be overridden by any commercial actor.']]} />
                </Card>
            )}

            {tab === 'history' && (
                <Card title="Change History">
                    <Table columns={['ID', 'When', 'Type', 'Summary', 'Old → New', 'By']} rows={history.map((h) => [h.code, h.data.at, h.category, h.title, `${h.data.old} → ${h.data.new}`, h.data.by])} />
                </Card>
            )}

            <TrustStrip items={[['Service-by-Service Access', 'Each service requires explicit permission.'], ['Price Suppression', 'All pricing suppressed until permission and resolution.'], ['Tax & Statutory Treatment', 'Shown only when resolver fields are resolved.'], ['Payment Methods', 'Subject to liquidity, permission and licence.'], ['Evidence Currentness', `Evidence current as of ${country.last_reviewed ?? '—'}.`]]} />
        </Frame>
    );
}
