import { Link } from '@inertiajs/react';
import { useState } from 'react';
import * as L from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { CountryHeader, CountrySelector, CountrySidebar, Frame } from '@/Components/Countries/Shell';
import { ActionButton, BarList, Card, Checklist, Chip, KV, NoResolution, Note, StateBadge, Table, TrustStrip } from '@/Components/Countries/ui';
import type { CategoryRow, Country, CountryBrief, ResolverProfile } from '@/types/countries';

interface Props {
    country: Country;
    profile: ResolverProfile;
    countries: CountryBrief[];
    categories: CategoryRow[];
    updates: [string, string | null][];
    manifest: [string, number][];
    interest: number;
}

export default function Profile({ country, profile, countries, categories, updates, manifest, interest }: Props) {
    const [tab, setTab] = useState('overview');
    const active = country.activated;
    const slug = country.slug;

    return (
        <Frame
            title="Country Profile"
            crumbs={[{ label: 'Countries', href: '/countries' }, { label: country.name }, { label: 'Country Profile' }]}
            sidebar={<CountrySidebar country={country} mode="planning" />}
            right={
                <>
                    <Card title="Country Control Panel">
                        <KV rows={[
                            ['Country State', <StateBadge bucket={country.bucket} label={country.state_label} />],
                            ['Activation Scope', active ? 'Phase 1 (Controlled)' : 'None (shell)'],
                            ['Evidence Status', active ? 'Evidence Current' : 'Partial / unresolved'],
                            ['Resolver Completeness', profile.rcs_label],
                            ['Hard Blocks', String(profile.hard_blocks)],
                            ['Last Update', country.last_reviewed ?? '—'],
                            ['Commercial Availability', active ? 'Service-by-service permission applies' : 'Not authorised'],
                        ]} />
                        <div className="mt-4 space-y-2">
                            {active ? <ActionButton label="Explore Services" href={`/countries/${slug}/services`} primary /> : <ActionButton label="Register Interest" href={`/countries/${slug}/waitlist`} primary />}
                            <ActionButton label="View Evidence Panel" href={`/countries/${slug}/evidence`} />
                            <ActionButton label="Compare with Another Country" href={`/countries/${slug}/impact`} />
                            <ActionButton label="View Activation Ledger" href="/countries/activation" />
                            <ActionButton label="Ask a Question" />
                        </div>
                    </Card>
                    <Card><CountrySelector countries={countries} current={country.iso2} /></Card>
                    <NoResolution />
                </>
            }
        >
            <div className="grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                    <CountryHeader country={country} compact />
                    <div className="mt-3 flex flex-wrap gap-2">
                        <StateBadge bucket={country.bucket} label={country.state_label} />
                        <Chip tone={active ? 'good' : 'warn'}>{active ? 'Evidence Current' : 'Evidence Partial'}</Chip>
                        <Chip tone={profile.rcs >= 100 ? 'good' : 'bad'}>{profile.rcs >= 100 ? 'Resolver Complete' : `Resolver ${profile.rcs_label}`}</Chip>
                        <Chip tone="info">Service-by-service permission applies</Chip>
                    </div>
                    <p className="mt-3 max-w-3xl text-[0.8125rem] text-ink-600">
                        {active
                            ? 'South Africa is the only activated country object in Phase 1. Commercial availability remains subject to service-by-service Country Resolver permission. Other African country objects are not implied active.'
                            : `${country.name} is a shell country object: a geographic and data shell only. No transaction, no numeric price, and no fact is published without approved evidence. ${country.gate_status}.`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                {[
                    ['Country State', country.state_label], ['Region', country.region], ['Resolver Completeness', profile.rcs_label],
                    ['Hard Blocks', String(profile.hard_blocks)], ['Last Reviewed', country.last_reviewed ?? '—'], ['Commercial Actions', 'Controlled by Resolver'],
                ].map(([l, v]) => (
                    <div key={l} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                        <p className="text-[0.6875rem] text-ink-500">{l}</p>
                        <p className="text-sm font-bold text-ink-900">{v}</p>
                    </div>
                ))}
            </div>

            <Tabs
                tabs={[{ key: 'overview', label: 'Overview' }, { key: 'availability', label: 'Availability' }, { key: 'evidence', label: 'Evidence' }, { key: 'services', label: 'Services' }, { key: 'payments', label: 'Payments' }, { key: 'compliance', label: 'Compliance' }]}
                value={tab}
                onChange={setTab}
            />

            {tab === 'overview' && (
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card title="Controlled Availability" intro={active ? 'Country object is Activated. Service access depends on resolver state and service-by-service permission.' : 'No service is available in a shell country.'}>
                        <KV rows={[['Advisory Services', <Chip tone="warn">{active ? 'Resolver required' : 'Not authorised'}</Chip>], ['Reports & Analysis', <Chip tone="warn">{active ? 'Resolver required' : 'Not authorised'}</Chip>], ['Market Intelligence', <Chip tone="warn">{profile.intelligence_permission ? 'Controlled access' : 'Restricted'}</Chip>]]} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Commercial availability is service-by-service and subject to Country Resolver permission.</p>
                    </Card>
                    <Card title="What You Can Access">
                        <Checklist items={active
                            ? ['Country Profile (this page)', 'Market Intelligence Hub', 'Opportunity Scan', 'Regulatory & Compliance Check', 'Partner & Network Connection', 'Risk & Political Assessment']
                            : [['ok', 'Country Profile (identity only)'], ['ok', 'Limitations & absence register'], ['ok', 'Register interest (waitlist)'], ['bad', 'Services, quotes and prices'], ['bad', 'Market entry planning']]} />
                    </Card>
                    <Card title="Evidence & Source Quality">
                        <KV rows={[['Local Data Sources', active ? '100+' : 'Sweep pending'], ['Freshness', active ? 'Current' : 'Partial'], ['Confidence Treatment', country.confidence], ['Review Type', 'Human-Reviewed'], ['Contradiction Handling', active ? 'Reconciled' : 'Not assessed'], ['Licence Status', active ? 'Verified' : 'Unresolved']]} />
                    </Card>
                    <Card title="Payments & Commercial Guardrails">
                        <Checklist items={[['bad', 'No price without resolution'], ['bad', 'No unsupported FX conversion'], ['warn', 'Tax treatment resolution required'], ['warn', 'Gateway depends on context']]} />
                        <div className="mt-3"><Note tone="warn" title="No Resolution, No Price">No overrides. No implied access.</Note></div>
                    </Card>
                    <Card title="Professional & Regulatory Boundary">
                        <p className="text-[0.8125rem] text-ink-600">Regulated, licensed, or partner-routed work is controlled separately and may require specific permits, approvals, or professional engagement.</p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500"><L.Info className="size-3.5" /> This profile is discovery only, not authorisation.</p>
                    </Card>
                    <Card title="Recent Verified Updates">
                        <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                            {updates.map(([t, d]) => <li key={t + d} className="flex justify-between gap-3 py-1.5"><span>{t}</span><span className="shrink-0 text-ink-500">{d}</span></li>)}
                        </ul>
                    </Card>
                </div>
            )}

            {tab === 'availability' && (
                <Card title="Availability by category" action={<Link href={`/countries/${slug}/availability`} className="text-xs font-semibold text-gold-700">Full availability detail →</Link>}>
                    {active ? (
                        <Table columns={['Category', 'Available', 'Restricted', 'Unavailable', 'State']} rows={categories.map((c) => [c.name, c.available, c.restricted, c.unavailable, <Chip>{c.state}</Chip>])} />
                    ) : (
                        <Note tone="warn">No service rows exist for a shell country. {profile.missing.length} resolver domain(s) are incomplete.</Note>
                    )}
                </Card>
            )}
            {tab === 'evidence' && (
                <Card title="Source manifest" action={<Link href={`/countries/${slug}/evidence`} className="text-xs font-semibold text-gold-700">Evidence panel →</Link>}>
                    {manifest.length ? <BarList rows={manifest.map(([l, n]) => [l, n])} suffix="" /> : <Note tone="warn">No approved sovereign source sweep has been completed for {country.name}.</Note>}
                </Card>
            )}
            {tab === 'services' && (
                <Card title="Services" action={active ? <Link href={`/countries/${slug}/services`} className="text-xs font-semibold text-gold-700">Service catalogue →</Link> : undefined}>
                    {active ? (
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {categories.map((c) => <li key={c.key}><Link href={`/countries/${slug}/services?category=${c.key}`} className="flex justify-between rounded border border-parchment-400 p-2 text-[0.8125rem] hover:border-gold-500"><span>{c.name}</span><span className="text-ink-500">{c.available} available</span></Link></li>)}
                        </ul>
                    ) : (
                        <Note tone="warn">Services are not offered in {country.name}. {interest} interest registration(s) recorded. <Link href={`/countries/${slug}/waitlist`} className="font-semibold underline">Register interest</Link>.</Note>
                    )}
                </Card>
            )}
            {tab === 'payments' && (
                <Card title="Payments">
                    <p className="text-[0.8125rem] text-ink-600">Payment rails, settlement and FX are resolver dependencies. {active ? 'See the payment methods disclosure for method-by-method state.' : 'They are UNRESOLVED for this shell (ABS-06).'}</p>
                    <div className="mt-3 max-w-xs"><ActionButton label="Country Payment Methods" href={`/countries/${slug}/payments`} /></div>
                </Card>
            )}
            {tab === 'compliance' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[['Tax & Statutory', 'tax'], ['Legal & Regulatory', 'legal'], ['Privacy & Data Residency', 'privacy'], ['Partner & Professional Boundary', 'partners'], ['Language & Localisation', 'languages'], ['Limitations & Absence', 'limitations']].map(([l, k]) => (
                        <ActionButton key={k} label={l} href={`/countries/${slug}/${k}`} />
                    ))}
                </div>
            )}

            <TrustStrip items={[['Human-Reviewed', 'All insights verified by subject matter experts.'], ['Trusted Data', 'Sourced from authoritative public & private datasets.'], ['Secure & Compliant', 'POPIA & ISO 27001 aligned.'], ['Evidence First', 'Decisions driven by verified evidence, not assumptions.'], ['Always Current', 'Real-time updates and continuous monitoring.']]} />
        </Frame>
    );
}
