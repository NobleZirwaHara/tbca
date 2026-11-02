/* P07 Service Detail (prototype pages-profile.js #/c/{ISO}/service/{code}). */
import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { A, B, Card, Chip, Cols, Ic, Kpi, Kpis, Note, STable, TagP, useMoney, useToast } from '@/Components/Industries/Kit';
import { cHref, CountryPage, SprintGrid } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import type { HubSprint } from '@/types/countryHub';

interface Tier { tier: string; price: number | null; pub: boolean }
interface Svc { code: string; name: string; type: string | null; topic: string; topicLabel: string; up: string | null; pop: string | null; viable: boolean; entry: string | null; ep: number | null; nTiers: number; tiers: Tier[] }
interface Props extends ProfileProps { code: string; s: Svc | null; live?: boolean; vat?: number; related: HubSprint[] }

const PROCESS = ['Eligibility Check — Country Resolver validates all dependencies', 'Scoping & evidence pull — country registers and sources attached', 'Delivery — AI agents draft, robots execute, analysts assemble', 'Human review — subject-matter expert sign-off', 'Release — deliverable + evidence pack to Client Workspace', 'Change & re-resolution window'];

export default function Service({ base, code, s, live = false, vat = 0.15, related }: Props) {
    const { c } = base;
    const money = useMoney();
    const toast = useToast();
    if (!s) {
        return (
            <CountryPage base={base} pageKey="catalogue" extraCrumbs={[['Service Detail'], [code]]}>
                <Card title="Service not found"><p>{code}</p></Card>
            </CountryPage>
        );
    }
    const enc = encodeURIComponent(s.code);
    const addToBasket = () => router.post('/basket', { item_type: 'sprint', item_code: s.code, name: s.name, variant: s.entry, unit_zar: s.ep ?? 0, commercial_act: 'purchase', meta: { section: 'countries', country: c.iso3 } }, { preserveScroll: true });
    const ledger: [string, string, ReactNode][] = [
        ['T', 'TBCA Fee', live && s.ep ? `${money(s.ep)} (entry tier)` : 'Price Suppressed'], ['X', 'External Fees', <>Pass-through · resolved at quote <TagP /></>],
        ['S', 'Statutory Fees', <>Pass-through · resolved at quote <TagP /></>], ['P', 'Partner Fees', <>Only if partner-routed <TagP /></>],
        ['D', 'Data / Licence Fees', <>Included unless premium licence <TagP /></>], ['CT-C', 'Corridor Fees', 'Only for cross-border corridors'],
    ];

    return (
        <CountryPage base={base} pageKey="catalogue" extraCrumbs={[['Service Detail'], [s.code]]}>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1 basis-[22rem]">
                    <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-700 uppercase">Service Catalogue › Service Detail · Mock-up P07</div>
                    <h1 className="mt-1 text-[1.5rem] leading-tight font-bold text-ink-900 sm:text-[1.75rem]">{s.name}</h1>
                    <p className="mt-1.5 font-mono text-[0.78rem] text-ink-500">Service Code: {s.code} · Category: {s.topicLabel} · Type: {s.type} · Archetype {s.up}</p>
                </div>
                <A href={cHref(c, 'catalogue')}><Ic n="back" /> Back to Service Catalogue</A>
            </div>
            <Kpis>
                <Kpi l="Availability" v={s.viable ? (live ? 'Available' : 'Price suppressed') : 'Unavailable'} s={s.viable ? 'Service is accessible' : 'No viable standalone tier'} icon="check" />
                <Kpi l="Resolver Completeness" v={`${c.rcs}%`} icon="shield" />
                <Kpi l="Evidence Status" v="Current" icon="db" />
                <Kpi l="Population" v={s.pop ?? '—'} s="Catalogue population" icon="layers" />
                <Kpi l="Tiers offered" v={String(s.nTiers)} s={`Entry: ${s.entry ?? '—'}`} icon="tag" />
            </Kpis>
            <Card title="Tiers & Prices" icon="cash" sub={`Source: 04_R0C_ECON-R0C-CATALOGUE-7589.xlsx · price ceiling 1.2× market median (R1 Board) · VAT ${c.isBW ? '14 % (BW-MAC-F18)' : '15 %'}`}>
                <STable head={['Tier', 'Selling price (ex VAT)', `Incl. VAT (${Math.round(vat * 100)}%)`, 'Market median', 'Price vs market', 'Published', '']} rows={s.tiers.map((t) => {
                    const show = live && t.pub && t.price !== null;
                    return [
                        <b key="t">{t.tier}</b>,
                        show ? <b key="p">{money(t.price)}</b> : <span key="p" className="text-ink-400">Price suppressed</span>,
                        show ? money(Math.round((t.price ?? 0) * (1 + vat))) : '—',
                        '—', '—',
                        t.pub ? <Chip key="u" t="Yes" tone="ok" /> : <Chip key="u" t="No" />,
                        show ? <A key="a" sm v="pri" href={cHref(c, 'quote', `?sprint=${enc}&tier=${t.tier}`)}>Select</A> : '',
                    ];
                })} />
            </Card>
            <Cols n={2}>
                <Card title="Service Process" icon="layers">
                    <ol className="m-0 list-decimal ps-5 text-[0.82rem]">{PROCESS.map((x) => <li key={x} className="my-1.5">{x}</li>)}</ol>
                </Card>
                <Card title="Resolver Dependencies" icon="shield">
                    <STable compact head={['Domain', 'State']} rows={['Legal & Regulatory', 'Tax & Statutory', 'Payments & FX', 'Identity & KYC', 'Data & Licences'].map((d) => [d, <Chip key="s" t="Complete" tone="ok" />])} />
                </Card>
            </Cols>
            <Card title="Cost & Pricing Information — six-ledger separation" icon="tag">
                <STable compact head={['Ledger', 'Fee class', 'Amount']} rows={ledger.map((r) => [<b key="l">{r[0]}</b>, r[1], r[2]])} />
                <Note className="mt-2.5"><b>No Resolution, No Price.</b> {live ? 'Resolver permit in place for this country — T fee shown.' : 'All pricing is suppressed until the Country Resolver permit is issued.'}</Note>
            </Card>
            <div className="flex flex-wrap gap-2">
                {live ? (
                    <>
                        <A v="pri" href={cHref(c, 'quote', `?sprint=${enc}`)}>Request Service Access →</A>
                        {s.ep ? <B onClick={addToBasket}><Ic n="cart" /> Add to basket</B> : null}
                    </>
                ) : <A href={cHref(c, 'waitlist', `?sprint=${enc}`)}>Join waitlist</A>}
                <A href={cHref(c, 'resolver')}>Check My Eligibility</A>
                <B onClick={() => toast.show('Service brief generated (prototype)')}>Download Service Brief</B>
            </div>
            {related.length > 0 && <Card title="Related Services" icon="tag"><SprintGrid items={related} c={c} /></Card>}
            {toast.node}
        </CountryPage>
    );
}
