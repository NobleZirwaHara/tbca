import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AiimPage, { type Crumb } from '@/Components/Aiim/Shell';
import { Card, Ic, Steps, useMoney } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';

/* Shared pieces for the account, workspace and commerce pages (prototype flow(), svcRail(), sumBox()). */

export interface Svc {
    code: string;
    name: string;
    cat: string | null;
    tier: string | null;
    delivery: string | null;
    aai: number | null;
    price: number | null;
    saleable: boolean;
}

export const BUY_STEPS = ['Discover', 'Manifest', 'Approve', 'Pay', 'Confirm', 'Unlock'];

/** Prototype steps(): done, current and upcoming stages of a journey. */
export function FlowSteps({ list = BUY_STEPS, on }: { list?: string[]; on: number }) {
    return <Steps items={list.map((label, i) => ({ label: i < on ? `✓ ${label}` : label, state: i < on ? 'done' : i === on ? 'on' : '' }))} />;
}

/** Prototype flow(): breadcrumbs, optional steps, heading with eyebrow and lead, main column and side column. */
export function Flow({ title, eyebrow, lead, crumbs = [], steps, right, side, children }: {
    title: string; eyebrow?: ReactNode; lead?: ReactNode; crumbs?: Crumb[]; steps?: ReactNode; right?: ReactNode; side?: ReactNode; children: ReactNode;
}) {
    return (
        <AiimPage title={title} crumbs={[...crumbs, { label: title }]} subtitle={eyebrow} description={lead} actions={right} notice={false} rail={false}>
            {steps && <div className="mb-4">{steps}</div>}
            <div className={cn('grid min-w-0 gap-4', side && 'lg:grid-cols-[minmax(0,1fr)_21rem]')}>
                <div className="grid min-w-0 content-start gap-4">{children}</div>
                {side && <div className="grid min-w-0 content-start gap-4">{side}</div>}
            </div>
        </AiimPage>
    );
}

/** Add an embedded service (or a Botswana template's full record) to the AIIM fee manifest. */
export function addToManifest(type: 'service' | 'template', key: string, ctx?: string) {
    router.post('/aiim/fees/items', { type, key, ctx: ctx ?? null }, { preserveScroll: true });
}

export function PriceFrom({ price }: { price: number | null }) {
    const money = useMoney();
    return price === null ? <span className="text-[0.72rem] font-normal text-ink-400">Not in the app catalogue yet</span> : <>from {money(price)}</>;
}

/** Prototype svcRail(): embedded services with app prices and an Add button. */
export function SvcRail({ services, title = 'Embedded services on this page', ctx }: { services: Svc[]; title?: string; ctx?: string }) {
    if (!services.length) return null;
    return (
        <Card title={title} act={<Link href="/aiim/services" className="rounded-full border border-parchment-500 px-2 py-0.5 text-[0.7rem] font-semibold text-ink-700 hover:border-gold-500">All 581</Link>}>
            <ul className="space-y-2.5">
                {services.map((s) => (
                    <li key={s.code} className="rounded-[6px] border border-parchment-400 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <Link href={`/aiim/services/${s.code}`} className="min-w-0 text-[0.84rem] font-semibold text-ink-900 hover:text-gold-700">{s.name}</Link>
                            <div className="shrink-0 text-right font-mono text-[0.8rem] font-semibold text-ink-900"><PriceFrom price={s.price} />{s.price !== null && <div className="text-[0.66rem] font-normal text-ink-400">excl. VAT</div>}</div>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.7rem] text-ink-400">
                            <span className="font-mono">{s.code}</span>
                            {s.tier && <span>{s.tier} tier</span>}
                            {s.delivery && <span className="inline-flex items-center gap-1"><Ic n="clock" className="size-3" />{s.delivery}</span>}
                            <span>AAI {s.aai !== null ? `${s.aai}%` : '—'}</span>
                        </div>
                        {s.price !== null && s.saleable && (
                            <div className="mt-2 text-right"><button type="button" onClick={() => addToManifest('service', s.code, ctx)} className="rounded-full bg-gold-500 px-3 py-1 text-[0.72rem] font-bold text-ink-900 hover:bg-gold-400">Add</button></div>
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
}

/** Prototype sumBox(): lines, VAT at 15 % and total. */
export function SumBox({ lines, vat = true, vatAmount, total }: { lines: [ReactNode, number][]; vat?: boolean; vatAmount?: number; total?: number }) {
    const money = useMoney();
    const sub = lines.reduce((s, l) => s + (Number(l[1]) || 0), 0);
    const v = vatAmount ?? Math.round(sub * 0.15 * 100) / 100;
    return (
        <dl className="text-[0.82rem]">
            {lines.map(([k, a], i) => <div key={i} className="flex justify-between gap-3 border-b border-parchment-300 py-1.5"><dt className="min-w-0 text-ink-600">{k}</dt><dd className="shrink-0 font-mono font-semibold">{money(a)}</dd></div>)}
            {vat && <div className="flex justify-between gap-3 border-b border-parchment-300 py-1.5"><dt className="text-ink-600">VAT 15 %</dt><dd className="font-mono font-semibold">{money(v)}</dd></div>}
            <div className="flex justify-between gap-3 pt-2 text-[1rem] font-bold"><dt>Total</dt><dd className="font-mono">{money(total ?? (vat ? sub + v : sub))}</dd></div>
        </dl>
    );
}

/** Prototype banner. */
export function Banner({ children, icon = 'shield' }: { children: ReactNode; icon?: string }) {
    return <div className="flex gap-2 rounded-[6px] border border-gold-300 bg-gold-50 px-3 py-2.5 text-[0.8rem] text-ink-700"><Ic n={icon} className="mt-0.5 text-gold-700" /><span className="min-w-0">{children}</span></div>;
}

/** Prototype empty state. */
export function Empty({ icon, title, children }: { icon: string; title?: string; children: ReactNode }) {
    return (
        <div className="grid justify-items-center gap-2 rounded-[6px] border border-dashed border-parchment-500 bg-white px-6 py-10 text-center text-[0.85rem] text-ink-600">
            <Ic n={icon} className="size-7 text-gold-600" />
            {title && <h3 className="text-[1rem] font-semibold text-ink-900">{title}</h3>}
            {children}
        </div>
    );
}

/** Prototype tierPill(). */
export function TierPill({ tier }: { tier: string | null | undefined }) {
    const t = String(tier ?? '');
    if (!t) return <span className="text-ink-400">—</span>;
    const cls = t.startsWith('A+') ? 'bg-gold-500 text-ink-900' : t.startsWith('A') ? 'bg-gold-100 text-gold-800' : t.startsWith('B') ? 'bg-controlled-50 text-controlled-700' : 'bg-parchment-300 text-ink-600';
    const short = t.length > 16 ? t.slice(0, t.indexOf(' ') > 0 ? t.indexOf(' ') : 16) : t;
    return <span title={t} className={cn('inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-bold', cls)}>{short}</span>;
}

/** Prototype quick-action list (qa). */
export function QuickLinks({ items }: { items: [string, string, string][] }) {
    return (
        <div className="grid content-start gap-2 self-start">
            {items.map(([href, icon, label]) => (
                <Link key={href + label} href={href} className="flex items-center gap-2.5 rounded-[6px] border border-parchment-400 bg-white px-3 py-2.5 text-[0.85rem] font-semibold text-ink-900 hover:border-gold-500">
                    <Ic n={icon} className="text-ink-600" />{label}
                </Link>
            ))}
        </div>
    );
}

/** One row of a prototype .svc list. */
export function SvcRow({ title, meta, right }: { title: ReactNode; meta?: ReactNode; right?: ReactNode }) {
    return (
        <li className="flex items-center justify-between gap-3 rounded-[6px] border border-parchment-400 bg-white p-3">
            <div className="min-w-0">
                <div className="text-[0.86rem] font-semibold text-ink-900">{title}</div>
                {meta && <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.72rem] text-ink-400">{meta}</div>}
            </div>
            {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
        </li>
    );
}

export const btnXs = 'rounded-full border px-3 py-1 text-[0.72rem] font-bold whitespace-nowrap';
export const btnGold = cn(btnXs, 'border-gold-500 bg-gold-500 text-ink-900 hover:bg-gold-400');
export const btnGhost = cn(btnXs, 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500');
