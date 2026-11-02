import { Link } from '@inertiajs/react';
import { Flow, QuickLinks, TierPill } from '@/Components/Aiim/ProtoAccount';
import { Card } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    account: { name: string; accountId: string; persona: string | null; sectors: string[] };
    top: { id: string; name: string; tier: string; place: string }[];
}

/** Mock-up 20: Registration Confirmation. */
export default function Welcome({ account, top }: Props) {
    return (
        <Flow
            title="Registration Confirmation"
            eyebrow="Welcome to AIIM Botswana"
            lead="Your workspace is ready. Here is where to start."
            side={
                <>
                    <QuickLinks items={[['/aiim/country/botswana/map', 'map', 'Explore the map'], ['/aiim/workspace/saved', 'star', 'Saved items'], ['/aiim/workspace/watchlist', 'bell', 'Watchlist'], ['/aiim/store', 'brief', 'Premium briefs']]} />
                    <Card title="Your account">
                        <dl className="grid gap-1 text-[0.8rem]">
                            <div className="flex justify-between gap-2"><dt className="text-ink-400">Account ID</dt><dd className="font-mono">{account.accountId}</dd></div>
                            {account.persona && <div className="flex justify-between gap-2"><dt className="text-ink-400">Investor type</dt><dd className="text-right">{account.persona}</dd></div>}
                            {account.sectors.length > 0 && <div className="flex justify-between gap-2"><dt className="text-ink-400">Sectors</dt><dd className="text-right">{account.sectors.join(', ')}</dd></div>}
                        </dl>
                    </Card>
                </>
            }
        >
            <Card title="Start with these Tier A+ opportunities">
                <div className="grid gap-3 sm:grid-cols-2">
                    {top.map((r) => (
                        <Link key={r.id} href={`/aiim/opportunities/${r.id}`} className="grid gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3 hover:border-gold-500">
                            <div className="flex items-center justify-between gap-2"><span className="font-mono text-[0.72rem] font-semibold text-gold-700">{r.id}</span><TierPill tier={r.tier} /></div>
                            <h4 className="text-[0.9rem] font-semibold text-ink-900">{r.name}</h4>
                            <span className="text-[0.75rem] text-ink-400">Best place {r.place}</span>
                        </Link>
                    ))}
                </div>
            </Card>
        </Flow>
    );
}
