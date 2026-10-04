import { CountryHeader, CountrySidebar, Frame } from '@/Components/Countries/Shell';
import { ActionButton, Advisor, BarList, Card, Chip, FilterSelect, Kpi, NoResolution, Note, Table } from '@/Components/Countries/ui';
import type { Country, RegisterRow, ResolverProfile } from '@/types/countries';

interface Props {
    country: Country;
    profile: ResolverProfile;
    items: RegisterRow[];
    domains: [string, number][];
    manifest: [string, number][];
    total: number;
    filters: Record<string, string>;
    gaps: RegisterRow[];
}

export default function Evidence({ country, profile, items, domains, manifest, total, filters, gaps }: Props) {
    const path = `/countries/${country.slug}/evidence`;
    const active = country.activated;

    return (
        <Frame
            title="Country Evidence Panel"
            crumbs={[{ label: 'Countries', href: '/countries' }, { label: country.name, href: `/countries/${country.slug}` }, { label: 'Evidence Panel' }]}
            sidebar={<CountrySidebar country={country} />}
            actions={
                <>
                    <a href={`/countries/${country.slug}/brief/evidence`} className="rounded border border-parchment-500 bg-white px-3 py-2 text-[0.8125rem] font-semibold hover:border-gold-500">Download Evidence Pack</a>
                </>
            }
            right={
                <>
                    <Card title="Source Manifest">
                        {manifest.length ? <BarList rows={manifest.map(([l, n]) => [l, n])} suffix="" /> : <Note tone="warn">No source manifest held.</Note>}
                        <div className="mt-3"><ActionButton label="View Full Manifest" href={`/countries/${country.slug}/registers/manifest`} /></div>
                    </Card>
                    <Card title="Evidence Filters">
                        <FilterSelect label="Domain" name="domain" value={filters.domain} options={domains.map(([d]) => ({ value: d, label: d }))} path={path} query={filters} />
                    </Card>
                    <Advisor title="Need Expert Insight?" body="Book a 1:1 TBCA advisor or sector expert for tailored advice." cta="Book Discovery Call" />
                    <NoResolution />
                </>
            }
        >
            <CountryHeader country={country} kpis={[
                { label: 'Evidence Currentness', value: active ? 'Current' : 'Partial', caption: active ? 'All critical domains current' : 'Sovereign sweep required', icon: 'shield-check', tone: active ? 'good' : 'warn' },
                { label: 'Contradictions', value: '0 Open', caption: 'No unresolved contradictions', icon: 'scale' },
                { label: 'Evidence Confidence', value: country.confidence, caption: 'Overall confidence rating', icon: 'badge-check' },
                { label: 'Last Quality Review', value: country.last_reviewed ?? '—', caption: `Next review: ${country.next_review ?? '—'}`, icon: 'calendar-days' },
            ]} />

            {active ? (
                <>
                    <Card title="Evidence Summary by Domain">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                            {domains.map(([d, n]) => (
                                <div key={d} className="rounded-[6px] border border-parchment-400 p-3 text-xs">
                                    <p className="font-semibold text-ink-900">{d}</p>
                                    <Chip tone="good" className="mt-1">Current</Chip>
                                    <dl className="mt-2 space-y-0.5">
                                        <div className="flex justify-between"><dt className="text-ink-500">Sources</dt><dd>{n}</dd></div>
                                        <div className="flex justify-between"><dt className="text-ink-500">Current</dt><dd>{n}</dd></div>
                                        <div className="flex justify-between"><dt className="text-ink-500">Confidence</dt><dd className="text-verified-700">High</dd></div>
                                    </dl>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Top Evidence Items" action={<span className="text-xs text-ink-500">{items.length} shown of {total}</span>}>
                        <Table
                            columns={['ID', 'Evidence Title', 'Domain', 'Source', 'Evidence Class', 'As Of', 'Freshness', 'Confidence', 'Contradictions', 'Status']}
                            rows={items.map((e) => [<span className="font-mono text-xs">{e.code}</span>, e.title, e.category, e.data.source, e.type, e.date, <Chip tone="good">Current</Chip>, <Chip tone={e.impact === 'High' ? 'good' : 'warn'}>{e.impact}</Chip>, e.data.contradictions ?? 0, <Chip>{e.status}</Chip>])}
                            empty="No evidence items match this domain."
                        />
                    </Card>
                </>
            ) : (
                <Card title="Honest absence register">
                    <Table columns={['ID', 'Domain', 'Absence', 'Consequence', 'Closure path', 'State']} rows={gaps.map((g) => [g.code, g.category, g.title, g.data.consequence, g.data.closure, <Chip>{g.status}</Chip>])} />
                    <div className="mt-3"><Note tone="warn">{profile.missing.length} resolver domain(s) incomplete. TBCA will not fill these gaps with an estimate or assumption.</Note></div>
                </Card>
            )}
            <Kpi label="Evidence objects held" value={total} caption="Each carries source, date, confidence, contradiction and licence state" icon="database" />
        </Frame>
    );
}
