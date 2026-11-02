import { Link } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { addToManifest, btnGhost, btnGold, Flow, SvcRail, TierPill, type Svc } from '@/Components/Aiim/ProtoAccount';
import { A, Card, Dl, useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

export interface LockedObject {
    code: string; kind: 'template' | 'project'; name: string; title: string; url: string; lead: string;
    teaser: [string, string][]; locked: string[]; full: [string, string][] | null; entitlement: string | null; tierKey: string | null;
}

interface Props extends AiimPageProps {
    object: LockedObject;
    price: number | null;
    services: Svc[];
}

/** Mock-up 27: Locked Premium Object. */
export default function Locked({ object: o, price, services }: Props) {
    const money = useMoney();
    const teaser = o.teaser.map(([k, v]) => [k, k === 'Tier' ? <TierPill key="t" tier={v} /> : v] as [string, ReactNode]);

    return (
        <Flow
            title="Locked Premium Object"
            eyebrow={o.kind === 'template' ? o.title : `${o.code} · ${o.title}`}
            lead={o.lead}
            crumbs={[{ label: 'Opportunities', href: '/aiim/opportunities' }]}
            side={<SvcRail services={services} title="Unlock options" ctx={`${o.code} full record`} />}
        >
            <Card title="Teaser (free)" act={<Link href={o.url} className="text-[0.75rem] font-semibold text-gold-700">Open teaser page</Link>}><Dl rows={teaser} /></Card>
            {o.full ? (
                <Card title="Full record (unlocked)" act={o.entitlement && <Link href={`/aiim/workspace/entitlements/${o.entitlement}`} className="text-[0.75rem] font-semibold text-gold-700">Entitlement {o.entitlement}</Link>}>
                    <Dl rows={o.full} />
                </Card>
            ) : o.entitlement ? (
                <Card title="Unlocked">
                    <p className="text-[0.85rem] text-ink-700">You hold an active entitlement to {o.title.toLowerCase()}.</p>
                    <A v="pri" sm className="mt-3" href={`/aiim/workspace/entitlements/${o.entitlement}`}>Open entitlement</A>
                </Card>
            ) : (
                <section className="relative min-h-[300px] overflow-hidden rounded-[6px] border border-parchment-400 bg-white p-4">
                    <dl aria-hidden="true" className="grid select-none grid-cols-[fit-content(45%)_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.8rem] blur-[5px]">
                        {o.locked.map((k) => <div key={k} className="contents"><dt className="text-ink-400">{k}</dt><dd className="text-ink-800">██████ ████</dd></div>)}
                    </dl>
                    <div className="absolute inset-0 grid place-items-center bg-white/40 p-4">
                        <div className="grid justify-items-center gap-2.5 text-center">
                            <Lock className="size-8 text-ink-900" aria-hidden="true" />
                            <h3 className="text-[1.05rem] font-semibold text-ink-900">Unlock the full record</h3>
                            <p className="sr-only">Locked fields: {o.locked.join(', ')}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Link href={`/aiim/unlock/${o.code}/approve`} className={btnGold}>Use wallet credits</Link>
                                {o.kind === 'template' && price !== null && <button type="button" className={btnGhost} onClick={() => addToManifest('template', o.code, `${o.code} full record`)}>Buy once · {money(price)}</button>}
                                <Link href="/subscriptions" className={btnGhost}>Subscribe</Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </Flow>
    );
}
