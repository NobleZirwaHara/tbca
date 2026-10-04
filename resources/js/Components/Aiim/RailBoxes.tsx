import { Link, usePage } from '@inertiajs/react';
import { Bell, Bookmark, Database, Eye, FileText, Scale, Star, Wallet } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';
import { RailBox } from './Shell';
import { zar2 } from './format';

export function WorkspaceSnapshotBox() {
    const { snapshot } = usePage<AiimPageProps>().props;
    if (!snapshot) {
        return (
            <RailBox title="Your Workspace">
                <p className="mb-3 text-xs text-ink-300">Create a free AIIM account to save items, compare and set alerts.</p>
                <ButtonLink href="/aiim/register" size="sm" className="w-full">Create Free Account</ButtonLink>
            </RailBox>
        );
    }
    const tiles: [typeof Star, string, number | string, string][] = [
        [Star, 'Saved Items', snapshot.saved, '/aiim/workspace/saved'], [Scale, 'Comparisons', snapshot.comparisons, '/aiim/workspace/compare'],
        [FileText, 'Custom Reports', snapshot.reports, '/aiim/workspace/reports'], [Eye, 'Watchlist', snapshot.watchlist, '/aiim/workspace/watchlist'],
        [Bookmark, 'Entitlements', snapshot.entitlements, '/aiim/workspace/entitlements'], [Database, 'Mandates', snapshot.mandates, '/aiim/workspace/engagements'],
    ];
    return (
        <RailBox title="Your Workspace Snapshot" action={<Link href="/aiim/workspace" className="text-xs text-gold-400 hover:underline">Go to Workspace →</Link>}>
            <ul className="grid grid-cols-3 gap-2 text-center">
                {tiles.map(([Icon, l, v, h]) => (
                    <li key={l}>
                        <Link href={h} className="flex flex-col items-center rounded p-1 hover:bg-ink-800">
                            <Icon className="size-4 text-gold-500" />
                            <span className="text-[0.6rem] text-ink-400">{l}</span>
                            <span className="text-sm font-bold">{v}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link href="/aiim/wallet" className="mt-2 flex items-center justify-between rounded border border-ink-700 px-2 py-1.5 text-xs hover:border-gold-600">
                <span className="flex items-center gap-1.5"><Wallet className="size-3.5 text-gold-500" />Wallet</span>
                <span className="font-semibold">{zar2(snapshot.wallet)}</span>
            </Link>
        </RailBox>
    );
}

export function CurrentStateBox() {
    const { selection, snapshot } = usePage<AiimPageProps>().props;
    const rows: [string, string][] = [
        ['Country', selection.country], ['Selected Province', selection.province ?? '—'], ['Selected Sector', selection.sector ?? '—'],
        ['Entitlement', snapshot && snapshot.entitlements > 0 ? `${snapshot.entitlements} active` : 'Free Discovery'], ['Data Access', 'Standard'],
    ];
    return (
        <RailBox title="Your Current State">
            <dl className="space-y-1.5 text-xs">
                {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-400">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
            </dl>
        </RailBox>
    );
}

export function AdvisoryBox() {
    return (
        <RailBox title="Need Advisory Support?">
            <p className="mb-3 text-xs text-ink-300">Speak to a TBCA Advisor for tailored intelligence, market entry, verification and partner mapping.</p>
            <div className="space-y-2">
                <ButtonLink href="/aiim/workspace/advisor-request" size="sm" className="w-full" trailingIcon="arrow-right">Speak to an Advisor</ButtonLink>
                <ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline-light" className="w-full" icon="calendar-days">Book Discovery Call</ButtonLink>
            </div>
        </RailBox>
    );
}

export function AlertsHint() {
    return (
        <p className="flex items-center gap-1.5 text-[0.6875rem] text-ink-400"><Bell className="size-3" />Alerts notify you when watched items change.</p>
    );
}
