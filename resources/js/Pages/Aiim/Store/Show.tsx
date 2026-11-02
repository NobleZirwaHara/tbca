import { router } from '@inertiajs/react';
import { Lock, ShoppingCart } from 'lucide-react';
import { ListToggle } from '@/Components/Aiim/Actions';
import { Hero, Panel, PillLink, ProtoFrame, RowsTable, SumBox, SvcPrice, SvcRail, pill, type SvcCard } from '@/Components/Aiim/ProtoLibrary';
import { zar2 } from '@/Components/Aiim/format';
import type { AiimPageProps, BriefItem } from '@/types/aiim';
import { addToCart, type BwBrief } from './Index';

interface Props extends AiimPageProps {
    kind: 'bw' | 'app';
    bw: BwBrief | null;
    item: BriefItem | null;
    outline: string[];
    preview: (string | number | null)[][];
    addons: SvcCard[];
    pricing: SvcCard | null;
    owned: boolean;
    saved: string[];
}

/** Page 35: Premium Brief Detail. Botswana briefs (BW-PB-xx) and the app's own briefs share the layout. */
export default function StoreShow({ kind, bw, item, outline, preview, addons, pricing, owned, saved }: Props) {
    const code = kind === 'bw' ? bw!.code : item!.sku;
    const title = kind === 'bw' ? bw!.product : item!.title;
    const buy = () => router.post(`/aiim/store/${code}/buy`);
    const priced = kind === 'app' || pricing?.status === 'priced';
    const price = kind === 'bw' ? pricing?.from ?? 0 : Math.round((item?.price ?? 0) / 1.15);

    const buyLabel = kind === 'bw' && pricing ? <>Buy from <SvcPrice s={pricing} /></> : <>Buy now {zar2(item?.price ?? 0)}</>;

    return (
        <ProtoFrame title={title} crumbs={[{ label: 'Premium Briefs', href: '/aiim/store' }, { label: code }]}>
            <Hero
                eyebrow={`Premium brief · ${code}`}
                title={<>{title}{kind === 'app' && <ListToggle list="saved" type="report" itemKey={code} saved={saved} variant="icon" dark />}</>}
                lead={kind === 'bw' ? `For ${bw!.forWhom}. Contents: ${bw!.contents}.` : item!.summary}
                actions={
                    <>
                        {owned ? <PillLink href="/aiim/workspace/entitlements">Open in my entitlements</PillLink>
                            : priced && <button type="button" className={pill('gold')} onClick={buy}><ShoppingCart className="size-3.5" />{buyLabel}</button>}
                        <PillLink href={`/aiim/store/${code}/configure`} tone="dark">Configure</PillLink>
                    </>
                }
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="grid min-w-0 content-start gap-4">
                    <Panel title="What is inside">
                        <ol className="grid list-decimal gap-1.5 ps-5 text-[0.88rem] text-ink-700">{outline.map((o) => <li key={o}>{o}</li>)}</ol>
                    </Panel>
                    <Panel title="Preview" className="relative min-h-[16rem] overflow-hidden">
                        {preview.length ? <div className={owned ? '' : 'pointer-events-none blur-[3px] select-none'} aria-hidden={!owned}><RowsTable rows={preview} /></div>
                            : <p className="text-[0.84rem] text-ink-500">{kind === 'app' ? item!.summary : 'No preview.'}</p>}
                        {!owned && (
                            <div className="absolute inset-0 grid place-items-center bg-white/40">
                                <div className="grid justify-items-center gap-2 text-center">
                                    <Lock className="size-6" aria-hidden="true" />
                                    <b>Full brief locked</b>
                                    {priced ? <button type="button" className={pill('gold', 'xs')} onClick={buy}>Unlock</button> : <PillLink href="/aiim/workspace/advisor-request" size="xs">Ask an advisor</PillLink>}
                                </div>
                            </div>
                        )}
                    </Panel>
                </div>
                <div className="grid min-w-0 content-start gap-4">
                    <Panel title="Pricing">
                        {kind === 'bw' && pricing ? (
                            pricing.status === 'priced' ? (
                                <>
                                    <SumBox lines={[{ label: pricing.name, amount: price }]} />
                                    <p className="mt-2 text-[0.75rem] text-ink-500">Delivery {pricing.db} · AAI {pricing.a0 ?? '—'} %</p>
                                </>
                            ) : <p className="text-[0.84rem] text-ink-500"><SvcPrice s={pricing} />. Ask an advisor for a quotation.</p>
                        ) : (
                            <>
                                <SumBox lines={[{ label: 'Standard Access', amount: price }]} />
                                <p className="mt-2 text-[0.75rem] text-ink-500">{item!.format}{item!.size ? ` · ${item!.size}` : ''} · single-user commercial licence</p>
                                {!owned && <button type="button" className={pill('ghost', 'sm') + ' mt-3 w-full'} onClick={() => addToCart(item!)}><ShoppingCart className="size-3.5" />Add to cart</button>}
                            </>
                        )}
                    </Panel>
                    <SvcRail title="Add-ons" items={addons} />
                </div>
            </div>
        </ProtoFrame>
    );
}
