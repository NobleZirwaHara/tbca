import { Link, router } from '@inertiajs/react';
import { btnGold, Flow, FlowSteps, SvcRail, SvcRow, type Svc } from '@/Components/Aiim/ProtoAccount';
import { Card, Chip, Dl, useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

export interface EntProps {
    reference: string; title: string; objectType: string; objectKey: string; productType: string | null; access: string;
    viewsIncluded: number | null; viewsUsed: number; extraView: number | null; amount: number; method: string | null;
    status: string; expires: string | null; unlocked: string; meta: Record<string, string>; order: string | null;
}

interface Unlocked extends EntProps {
    code: string;
    delivery: string | null;
    action: { label: string; url?: string; post?: string } | null;
}

interface Props extends AiimPageProps {
    ent: EntProps;
    unlocked: Unlocked[];
    services: Svc[];
}

/** Mock-up 33: Entitlement Unlock. */
export default function Entitlement({ ent, unlocked, services }: Props) {
    const money = useMoney();
    const active = ent.status === 'active';
    return (
        <Flow
            title="Entitlement Unlock"
            crumbs={[{ label: 'Workspace', href: '/aiim/workspace' }, { label: 'Entitlements', href: '/aiim/workspace/entitlements' }]}
            steps={<FlowSteps on={5} />}
            side={<SvcRail services={services} title="Next" />}
        >
            <Card title="Unlocked for you">
                <ul className="grid gap-2">
                    {unlocked.map((u) => (
                        <SvcRow
                            key={u.reference}
                            title={u.title}
                            meta={<><span className="font-mono">{u.code}</span>{u.delivery && <span>{u.delivery}</span>}{u.viewsIncluded !== null && <span>{u.viewsUsed} of {u.viewsIncluded} views used</span>}{u.status !== 'active' && <Chip t="Expired" tone="bad" />}</>}
                            right={u.action && u.status === 'active' ? (u.action.post
                                ? <button type="button" className={btnGold} onClick={() => router.post(u.action!.post!, {}, { preserveScroll: true })}>{u.action.label}</button>
                                : <Link href={u.action.url!} className={btnGold}>{u.action.label}</Link>) : u.status !== 'active' && (u.objectType === 'project' || u.objectType === 'template') ? <Link href={`/aiim/unlock/${u.code}`} className={btnGold}>Unlock again</Link> : null}
                        />
                    ))}
                </ul>
            </Card>
            <Card title="Entitlement">
                <Dl rows={[
                    ['Reference', <span key="r" className="font-mono">{ent.reference}</span>],
                    ['Product', ent.productType ?? ent.title],
                    ['Access', ent.access],
                    ['Paid', `${money(ent.amount)}${ent.method ? ` · ${ent.method}` : ''}`],
                    ['Unlocked on', ent.unlocked],
                    ['Expires', ent.expires ?? 'No expiry'],
                    ['Status', <Chip key="s" t={active ? 'Active' : 'Expired'} tone={active ? 'ok' : 'bad'} />],
                ]} />
            </Card>
        </Flow>
    );
}
