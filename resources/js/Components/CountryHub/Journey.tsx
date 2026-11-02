/*
 * Market Entry Journey and Commercial Journey pieces (prototype pages-journey.js and pages-commerce.js):
 * the two step bars, the planner frame with its score panel, the "start with a quote" panel and the
 * two-decimal money formatter used by the payment page.
 */
import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { A, B, Card, Dl, Donut, GradeChip, Ic, Kpi, Kpis, Meter, STable, StatusChip, TagP } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage, pageLabel, SprintShelf } from '@/Components/CountryHub/Layout';
import { convertZar, formatIn, useCurrency } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { CountryBase, HubCountry, HubShelf } from '@/types/countryHub';

/* ------------------------------------------------------------------ types */
/** The commercial journey kept in CountryState "journey" (prototype S.journey). */
export interface JourneyState {
    iso?: string;
    ref?: string;
    name?: string;
    email?: string;
    org?: string;
    sprint?: string;
    tier?: string;
    type?: string;
    title?: string;
    scope?: string;
    sector?: string;
    start?: string;
    created?: string;
    letterOk?: boolean;
    elRef?: string;
    paid?: boolean;
    engRef?: string;
    paidAt?: string;
    method?: string;
    accepted?: string | null;
    closure?: { type: string; at: string } | null;
    crs?: { id: string; t: string; r: string; d: string; s: string }[];
}

/** The Sprint behind the journey with its tier fee (CommerceController::sprintFor). */
export interface JourneySprint {
    code: string;
    name: string;
    type: string | null;
    entry: string | null;
    tiers: Record<string, number>;
    fee: number | null;
    premium: number | null;
}

/* ------------------------------------------------------------------ step bars */
const JKEYS = ['readiness', 'landing', 'localisation', 'paylocal', 'langpack', 'compliance', 'launch', 'audit', 'diaspora', 'exit'];

function StepLink({ href, on, done, step, label }: { href: string; on?: boolean; done?: boolean; step: string; label: string }) {
    return (
        <Link href={href} aria-current={on ? 'step' : undefined}
            className={cn('min-w-[110px] flex-1 rounded-[4px] border px-2.5 py-2 text-[0.72rem] text-ink-500', on ? 'border-gold-400 bg-gold-100' : done ? 'border-verified-500/30 bg-verified-50' : 'border-parchment-400 bg-white hover:border-gold-400')}>
            <span className="block">{step}</span><b className="block text-[0.78rem] text-ink-800">{label}</b>
        </Link>
    );
}

/** Market Entry Journey steps (prototype jsteps). */
export function JSteps({ c, active }: { c: HubCountry; active: string }) {
    return (
        <nav aria-label="Market entry journey steps" className="flex flex-wrap gap-1.5">
            {JKEYS.map((k, i) => <StepLink key={k} href={cHref(c, k)} on={k === active} step={`Step ${i + 1}`} label={pageLabel(k)} />)}
        </nav>
    );
}

const CKEYS: [string, string][] = [['quote', 'Quote Request'], ['letter', 'Engagement Letter'], ['pay', 'Payment & Activation'], ['workspace', 'Client Workspace'], ['deliverables', 'Deliverables'], ['change', 'Change'], ['closure', 'Closure']];

/** Commercial journey steps (prototype csteps); done flags follow the visitor's journey. */
export function CSteps({ c, active, j }: { c: HubCountry; active: string; j: JourneyState | null }) {
    const J = j ?? {};
    const done: Record<string, boolean> = { quote: !!J.ref, letter: !!J.letterOk, pay: !!J.paid, workspace: !!J.paid };
    return (
        <nav aria-label="Commercial journey steps" className="flex flex-wrap gap-1.5">
            {CKEYS.map(([k, l], i) => <StepLink key={k} href={cHref(c, k)} on={k === active} done={k !== active && done[k]} step={`Step ${i + 1}${done[k] ? ' ✓' : ''}`} label={l} />)}
        </nav>
    );
}

/* ------------------------------------------------------------------ score panel and planner (prototype scoreRight, planner) */
export function ScoreRight({ c, title, p, sub, rows, actions }: { c: HubCountry; title: string; p: number; sub: string; rows?: [ReactNode, ReactNode][]; actions?: [string, string, string?][] }) {
    return (
        <>
            <Card title={title} icon="chart">
                <div className="flex justify-center"><Donut p={p} label={sub} size={130} /></div>
                <div className="text-center text-[0.72rem] text-ink-400">Target: 85 % or higher</div>
                {rows && <><div className="my-3 border-t border-parchment-300" /><Dl rows={rows} /></>}
            </Card>
            {actions && (
                <Card title="Actions">
                    <div className="grid gap-1.5">{actions.map(([l, h, v]) => <A key={l} block v={v === 'pri' ? 'pri' : undefined} href={h}>{l} <Ic n="ext" /></A>)}</div>
                </Card>
            )}
            <Card title="Need Expert Guidance?">
                <p className="text-[0.82rem]">Speak to a TBCA Market Entry Advisor for tailored support.</p>
                <A v="pri" className="mt-2" href={cHref(c, 'quote')}>Speak to an Advisor →</A>
            </Card>
        </>
    );
}

export type PlanAction = [string, string, string, string, string, string, string];

export function Planner({ base, pageKey, title, desc, score, progSub, kpis, blocks, actions, summary, acts, shelf }: {
    base: CountryBase; pageKey: string; title: string; desc: string; score: number; progSub: string;
    kpis: [ReactNode, ReactNode, ReactNode, string][]; blocks: ReactNode; actions: PlanAction[]; summary: [ReactNode, ReactNode][]; acts: [string, string, string?][]; shelf: HubShelf;
}) {
    const { c } = base;
    return (
        <CountryPage base={base} pageKey={pageKey} right={<ScoreRight c={c} title={`${title.replace(' Planner', '')} Readiness Score`} p={score} sub="In Progress" rows={summary} actions={acts} />}>
            <CountryHead base={base} pageKey={pageKey} title={title} desc={desc} />
            <JSteps c={c} active={pageKey} />
            <Kpis>
                <Kpi l="Overall Progress" v={`${score}%`} s={progSub} icon="chart" />
                {kpis.map(([l, v, s, i], k) => <Kpi key={k} l={l} v={v} s={s} icon={i} />)}
                <Kpi l="Target Launch" v="15 Jan 2027" s={<>In 12 weeks <TagP /></>} icon="clock" />
            </Kpis>
            {blocks}
            <Card title="Top Actions" icon="check" sub={<>Sample plan <TagP /> — your plan is created when you start a Sprint</>}>
                <STable head={['ID', 'Action', 'Category', 'Owner', 'Due', 'Priority', 'Status']}
                    rows={actions.map((a) => [<span key="i" className="font-mono">{a[0]}</span>, <b key="a">{a[1]}</b>, a[2], a[3], a[4], <StatusChip key="p" s={a[5]} />, <StatusChip key="s" s={a[6]} />])} />
            </Card>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}

/** Progress cell: meter plus percentage. */
export function MeterCell({ p, tone, min = 110 }: { p: number; tone?: 'ok' | 'warn' | 'bad'; min?: number }) {
    return <div className="flex items-center gap-2" style={{ minWidth: min }}><div className="flex-1"><Meter p={p} tone={tone} /></div><span className="text-[0.72rem]">{p}%</span></div>;
}

/* ------------------------------------------------------------------ commerce helpers */
/** Two-decimal money in the display currency (prototype money(x, { d: 2 })). */
export function useMoney2() {
    const { currency, rates } = useCurrency();
    return (zar: number | null | undefined) => {
        if (zar === null || zar === undefined || Number.isNaN(Number(zar))) return '—';
        const cents = Math.round(convertZar(Number(zar), currency, rates) * 100);
        return `${formatIn(Math.trunc(cents / 100), currency)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;
    };
}

/** Load the sample Botswana engagement and continue at `next` (prototype sampleJourney). */
export function loadSample(c: HubCountry, next: string) {
    router.post(cHref(c, 'quote'), { sample: true, next });
}

/** Panel shown on a later step when there is no journey for this country (prototype needJourney). */
export function NeedJourney({ base, pageKey, title, j }: { base: CountryBase; pageKey: string; title: string; j: JourneyState | null }) {
    const { c } = base;
    return (
        <CountryPage base={base} pageKey={pageKey}>
            <CountryHead base={base} pageKey={pageKey} title={title} />
            <CSteps c={c} active={pageKey} j={j} />
            <Card title="Start with a quote" icon="file" tone="gold">
                <p className="text-[0.88rem]">This step continues an engagement that begins with a Quote Request. Start one now, or load a sample Botswana engagement to walk the full journey.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <A v="pri" href={cHref(c, 'quote')}>Go to Quote Request →</A>
                    <B onClick={() => loadSample(c, pageKey)}>Load sample engagement</B>
                </div>
            </Card>
        </CountryPage>
    );
}

/** Fact citation: id, source, date and grade (prototype factCite). */
export function FactCite({ r }: { r: Record<string, unknown> | null | undefined }) {
    const x = r ?? {};
    return <><span className="text-[0.72rem] text-ink-400">{String(x['Fact ID'] ?? '')} · {String(x.Source ?? '')} · {String(x.Date ?? '')}</span> <GradeChip g={x.Grade} /></>;
}
