import { Link, router } from '@inertiajs/react';
import { Bell, BellOff } from 'lucide-react';
import { btnGhost, btnGold, Empty, Flow, SvcRail, SvcRow, type Svc } from '@/Components/Aiim/ProtoAccount';
import { Card, DataTable, StatusChip, type Col } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Item { id: number; type: string; key: string; typeLabel: string; label: string; url: string | null; savedOn: string; alerts: boolean }

interface Props extends AiimPageProps {
    list: 'saved' | 'watchlist';
    items: Item[];
    services: Svc[];
    changes?: { cols: string[]; rows: Record<string, unknown>[] };
}

/** Mock-ups 21 (Saved Items) and 22 (My Watchlist). */
export default function Saved({ list, items, services, changes }: Props) {
    const watch = list === 'watchlist';
    const remove = (i: Item) => router.post('/aiim/workspace/items', { list, type: i.type, key: i.key }, { preserveScroll: true });
    const rows = (
        <ul className="grid gap-2">
            {items.map((i) => (
                <SvcRow
                    key={i.id}
                    title={i.url ? <Link href={i.url} className="text-controlled-700 hover:underline">{i.label}</Link> : i.label}
                    meta={<><span className="font-mono">{i.type}.{i.key}</span><span>{i.typeLabel}</span>{!watch && <span>{i.savedOn}</span>}</>}
                    right={
                        <>
                            {watch && (
                                <button type="button" onClick={() => router.patch(`/aiim/workspace/items/${i.id}/alerts`, {}, { preserveScroll: true })} aria-label={i.alerts ? 'Pause alerts' : 'Switch alerts on'} title={i.alerts ? 'Alerts on' : 'Alerts off'} className="p-1 text-gold-700">
                                    {i.alerts ? <Bell className="size-4" /> : <BellOff className="size-4 text-ink-400" />}
                                </button>
                            )}
                            <button type="button" className={btnGhost} onClick={() => remove(i)}>{watch ? 'Stop' : 'Remove'}</button>
                        </>
                    }
                />
            ))}
        </ul>
    );

    const changeCols: Col<Record<string, unknown>>[] = (changes?.cols ?? []).map((c) => (c === 'Status' ? { k: c, l: c, v: (r) => String(r[c] ?? ''), r: (r) => <StatusChip s={r[c]} /> } : { k: c, l: c }));

    return (
        <Flow
            title={watch ? 'My Watchlist' : 'Saved Items'}
            eyebrow={watch ? 'Change monitoring' : 'Your saved objects'}
            lead={watch ? 'Watched opportunities plus the regulatory changes that could move them.' : 'Everything you saved across AIIM. Saved items are kept in your account.'}
            crumbs={[{ label: 'Workspace', href: '/aiim/workspace' }]}
            side={<SvcRail services={services} title={watch ? 'Monitoring services' : 'Do more with saved items'} />}
        >
            {items.length ? (
                <Card title={`${watch ? 'Watching' : 'Saved'} (${items.length})`}>{rows}</Card>
            ) : watch ? (
                <Empty icon="bell" title="No watched items"><p>Open an opportunity and press <b>Watch</b>.</p></Empty>
            ) : (
                <Empty icon="star" title="Nothing saved yet">
                    <p>Use <b>Save</b> on any opportunity, sector, unit or town.</p>
                    <Link href="/aiim/opportunities" className={btnGold}>Browse opportunities</Link>
                </Empty>
            )}
            {watch && changes && (
                <Card title="Changes that affect Botswana templates (I-4)">
                    <DataTable name="reg-change" cols={changeCols} rows={changes.rows} size={25} compact />
                </Card>
            )}
        </Flow>
    );
}
