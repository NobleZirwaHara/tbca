import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useCompactPrice } from './money';
import { Panel, Pending, pct } from './shared';
import Treemap, { hurdleColor, STATUS_COLORS, type TreemapGroup } from './Treemap';
import type { CountryIntel } from './types';

const TIER_COLORS: Record<string, string> = { 'A+': '#14603a', A: '#1f7a4c', B: '#b0781e', C: '#8d271c', Unscored: '#3a3a44' };

export default function HeatMapTab({ intel, countryName }: { intel: CountryIntel; countryName: string }) {
    const compact = useCompactPrice();
    const projects = intel.projects.filter((p) => p.capexZar);
    const hasProjects = projects.length > 0;
    const hasOpps = intel.opportunities.length > 0;
    const [dataset, setDataset] = useState<'projects' | 'opportunities'>(hasProjects ? 'projects' : 'opportunities');
    const [size, setSize] = useState<'capex' | 'equal'>('capex');
    const [colour, setColour] = useState<'irr' | 'status'>('irr');
    const [scope, setScope] = useState<'briefs' | 'all'>('briefs');
    const sectorName = (c: string | null) => intel.sectorCodes.find((s) => s.code === c)?.name ?? c ?? 'Other';

    if (!hasProjects && !hasOpps) {
        return <Pending title={`No records to chart for ${countryName} yet`}>The heat map sizes project briefs by capital cost and colours them by return, or groups opportunity records by sector. It fills in once records for {countryName} are loaded.</Pending>;
    }

    let groups: TreemapGroup[] = [];
    if (dataset === 'projects') {
        const list = projects.filter((p) => scope === 'all' || p.status !== 'NOT QUALIFIED');
        const bySector = new Map<string, typeof list>();
        for (const p of list) bySector.set(p.sectorCode ?? 'Other', [...(bySector.get(p.sectorCode ?? 'Other') ?? []), p]);
        groups = [...bySector].map(([code, ps]) => ({
            id: code,
            label: sectorName(code),
            leaves: ps.map((p) => ({
                id: p.code,
                label: p.name,
                value: size === 'capex' ? Math.sqrt(p.capexZar ?? 1) : 1,
                color: colour === 'irr' ? hurdleColor(p.projectIrr, 18) : STATUS_COLORS[p.status],
                detail: `IRR ${pct(p.projectIrr)} · ${compact(p.capexZar)}`,
                href: p.href,
            })),
        }));
    } else {
        const bySector = new Map<string, Map<string, number>>();
        for (const o of intel.opportunities) {
            const tier = o.tier ?? 'Unscored';
            const m = bySector.get(o.sectorCode) ?? new Map<string, number>();
            m.set(tier, (m.get(tier) ?? 0) + 1);
            bySector.set(o.sectorCode, m);
        }
        groups = [...bySector].map(([code, tiers]) => ({
            id: code,
            label: sectorName(code),
            leaves: [...tiers].map(([tier, n]) => ({ id: `${code}-${tier}`, label: tier === 'Unscored' ? `${n} unscored` : `Tier ${tier}: ${n}`, value: n, color: TIER_COLORS[tier] ?? '#3a3a44', detail: `${n} records` })),
        }));
    }

    const btn = (on: boolean) => cn('rounded border px-2 py-1 text-xs', on ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-600 text-parchment-200 hover:border-gold-500');

    return (
        <div className="space-y-3">
            <Panel title={dataset === 'projects' ? 'Project heat map by sector' : 'Opportunity heat map by sector'}>
                <div className="mb-3 flex flex-wrap items-center gap-4 text-xs">
                    {hasProjects && hasOpps && (
                        <span className="flex items-center gap-1"><span className="mr-1 text-ink-400">Show</span>
                            <button type="button" className={btn(dataset === 'projects')} onClick={() => setDataset('projects')}>Project briefs</button>
                            <button type="button" className={btn(dataset === 'opportunities')} onClick={() => setDataset('opportunities')}>Opportunity register</button>
                        </span>
                    )}
                    {dataset === 'projects' && (
                        <>
                            <span className="flex items-center gap-1"><span className="mr-1 text-ink-400">Size by</span>
                                <button type="button" className={btn(size === 'capex')} onClick={() => setSize('capex')}>Capital cost</button>
                                <button type="button" className={btn(size === 'equal')} onClick={() => setSize('equal')}>Equal</button>
                            </span>
                            <span className="flex items-center gap-1"><span className="mr-1 text-ink-400">Colour by</span>
                                <button type="button" className={btn(colour === 'irr')} onClick={() => setColour('irr')}>Project IRR</button>
                                <button type="button" className={btn(colour === 'status')} onClick={() => setColour('status')}>Screening status</button>
                            </span>
                            <span className="flex items-center gap-1"><span className="mr-1 text-ink-400">Include</span>
                                <button type="button" className={btn(scope === 'briefs')} onClick={() => setScope('briefs')}>Briefs only</button>
                                <button type="button" className={btn(scope === 'all')} onClick={() => setScope('all')}>All screened</button>
                            </span>
                        </>
                    )}
                </div>
                <Treemap groups={groups} ariaLabel={`Heat map of ${dataset === 'projects' ? 'project briefs' : 'opportunity records'} in ${countryName} by sector`} />
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.6875rem] text-ink-300">
                    {dataset === 'projects' && colour === 'irr' && (
                        <>
                            <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-10 rounded-sm" style={{ background: `linear-gradient(90deg, ${hurdleColor(6, 18)}, ${hurdleColor(18, 18)}, ${hurdleColor(30, 18)})` }} />Project IRR: below 18% (red), at 18% hurdle, above (green)</span>
                        </>
                    )}
                    {dataset === 'projects' && colour === 'status' && Object.entries(STATUS_COLORS).map(([k, c]) => <span key={k} className="flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm" style={{ background: c }} />{k.charAt(0) + k.slice(1).toLowerCase()}</span>)}
                    {dataset === 'opportunities' && Object.entries(TIER_COLORS).map(([k, c]) => <span key={k} className="flex items-center gap-1"><span className="inline-block size-2.5 rounded-sm" style={{ background: c }} />{k === 'Unscored' ? 'Unscored' : `Tier ${k}`}</span>)}
                    {dataset === 'projects' && size === 'capex' && <span>Tile area follows the square root of capital cost so small projects stay visible.</span>}
                </div>
            </Panel>
        </div>
    );
}
