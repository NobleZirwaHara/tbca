/*
 * Governance & Admin frame (prototype pages-gov.js GOV, govRail and govPage): the governance rail,
 * the page heading with mock-up number and admin badge, and the page frame.
 */
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Chip, Ic } from '@/Components/Industries/Kit';
import { Shell, Stack } from '@/Components/Industries/Layout';
import { cHref } from '@/Components/CountryHub/Layout';
import { cn } from '@/lib/cn';
import type { HubCountry } from '@/types/countryHub';

export const GOV: [string, [string, string, string][]][] = [
    ['Public governance registers', [['activation', 'Activation Ledger & Detail', 'P49–50'], ['manifest', 'Evidence Manifest', 'P51'], ['freshness', 'Source & Freshness Register', 'P52'], ['contradictions', 'Contradiction Register', 'P53'], ['licence', 'Data Licence Status', 'P54'], ['absence', 'Absence Register', 'P55'], ['changes', 'Change History', 'P56']]],
    ['Sovereign clients', [['sovereign', 'Sovereign Client Landing', 'P57'], ['intake', 'Sovereign Engagement Intake', 'P58'], ['conflict', 'Conflict Disclosure', 'P59'], ['independence', 'Independence Statement', 'P60'], ['sovreview', 'Sovereign Evidence Review', 'P61'], ['panel', 'Partner & Review Panel', 'P62'], ['release', 'Deliverable Release', 'P63'], ['sovclose', 'Engagement Closure', 'P64']]],
    ['Administration', [['tower', 'Country Admin Control Tower', 'P65'], ['objects', 'Country Object Manager', 'P66'], ['rcs', 'Resolver Completeness Console', 'P67'], ['states', 'Availability State Manager', 'P68'], ['taxadmin', 'Tax & Statutory Admin', 'P69'], ['payadmin', 'Payment & Liquidity Admin', 'P70'], ['partneradmin', 'Partner Capacity Admin', 'P72'], ['bias', 'Unmet Demand & Bias Console', 'P73'], ['workbench', 'Activation Investment Workbench', 'P74']]],
    ['Corridor administration', [['corrobj', 'Corridor Object Manager', 'P75'], ['corrresolver', 'Corridor Pair Resolver Console', 'P76'], ['correcon', 'Corridor Economics Workbench', 'P77']]],
    ['Layer 9 & evidence control', [['l9intake', 'Layer 9 Observation Intake', 'P78'], ['l9review', 'Promotion & Anonymity Review', 'P79'], ['retraction', 'Evidence Retraction & Cascade', 'P80']]],
    ['AI agents & release', [['analyst', 'Country Analyst Agent', 'P81'], ['corragent', 'Corridor Agent', 'P83'], ['absenceagent', 'Honest Absence Agent', 'P83'], ['uat', 'Release & UAT Control Tower', 'P84']]],
];

export interface GovDef { k: string; n: string; p: string; g: string }
export const GBY: Record<string, GovDef> = Object.fromEntries(GOV.flatMap(([g, l]) => l.map(([k, n, p]) => [k, { k, n, p, g }])));

export const govHref = (c: { slug: string }, k: string) => cHref(c, k ? `gov/${k}` : 'gov');

export function GovRail({ c, active }: { c: HubCountry; active: string }) {
    return (
        <aside aria-label="Governance navigation" className="min-w-0 rounded-[6px] border border-parchment-400 bg-white p-2 text-[0.8rem]">
            <Link href={cHref(c)} className="flex items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-ink-700 hover:bg-parchment-200"><Ic n="back" /> {c.name} profile</Link>
            {GOV.map(([g, l]) => (
                <div key={g}>
                    <h6 className="mx-1.5 mt-3 mb-1 text-[0.72rem] font-semibold tracking-wider text-ink-400 uppercase">{g}</h6>
                    {l.map(([k, n, p]) => (
                        <Link key={k} href={govHref(c, k)} aria-current={k === active ? 'page' : undefined}
                            className={cn('flex items-baseline justify-between gap-2 rounded-[4px] px-2 py-1.5 leading-tight text-ink-700', k === active ? 'bg-gold-100 font-semibold text-ink-900 shadow-[inset_3px_0_0_var(--color-gold-500)]' : 'hover:bg-parchment-200')}>
                            <span>{n}</span><span className="text-[0.66rem] text-ink-400">{p}</span>
                        </Link>
                    ))}
                </div>
            ))}
        </aside>
    );
}

/** Governance page frame (prototype govPage): rail, heading with mock-up number and admin badge. */
export function GovPage({ c, k, sub, children }: { c: HubCountry; k: string; sub?: ReactNode; children: ReactNode }) {
    const g = GBY[k] ?? { k: '', n: 'Governance & Admin', p: 'P49–84', g: 'Governance' };
    const admin = /Administration|Corridor admin|Layer 9|AI agents/.test(g.g);
    const crumbs: [string, string?][] = [['Countries', '/countries'], [c.name, cHref(c)], ['Governance & Admin', govHref(c, '')], [g.n]];
    return (
        <Shell title={`${g.n} · ${c.name} · Countries`} crumbs={crumbs} home="/countries">
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
                <div className="order-2 lg:order-1"><GovRail c={c} active={k} /></div>
                <Stack className="order-1 min-w-0 lg:order-2">
                    <div className="flex flex-wrap items-start gap-4">
                        <div className="min-w-0 flex-1 basis-[22rem]">
                            <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-700 uppercase">{g.g} · Mock-up {g.p}{admin ? ' · Admin / Countries' : ''}</div>
                            <h1 className="mt-1 text-[1.6rem] leading-tight font-bold text-ink-900 sm:text-[1.85rem]">{g.n}</h1>
                            {sub && <p className="mt-1.5 max-w-[60rem] text-[0.9rem] text-ink-500">{sub}</p>}
                        </div>
                        <div className="ml-auto flex flex-wrap items-center gap-2">
                            {admin && <Chip t="Secure Admin Portal · TBCA Admin" tone="gold" />}
                            <span className="text-[0.72rem] text-ink-400">Data as at: {c.isBW ? '09 Oct 2026' : '15 Aug 2026'}</span>
                        </div>
                    </div>
                    {children}
                </Stack>
            </div>
        </Shell>
    );
}
