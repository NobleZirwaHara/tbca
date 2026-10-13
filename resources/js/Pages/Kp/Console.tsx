import { useState } from 'react';
import { BlockGrid, KpiRow, type Block, type Kpi } from '@/Components/Webinars/Board';
import { PillTabs } from '@/Components/Webinars/kit';
import { Box, ConsoleFrame, type ConsoleNavItem } from '@/Components/Kp/kit';

interface Props {
    console: {
        key: string;
        id: string;
        title: string;
        actions: string;
        states: string[];
        rule: { audit: string; ai: string; override: string; acceptance: string };
        kpis: Kpi[];
        tabs: { key: string; label: string; count: number | null; blocks: Block[] }[];
    };
    tab: string;
    consoleNav: ConsoleNavItem[];
}

/** KP-SCR-051 to KP-SCR-072: one governance console, built to the blueprint 27.2 specification. */
export default function Console({ console: c, tab, consoleNav }: Props) {
    const [active, setActive] = useState(c.tabs.some((t) => t.key === tab) ? tab : c.tabs[0].key);
    const current = c.tabs.find((t) => t.key === active) ?? c.tabs[0];
    return (
        <ConsoleFrame nav={consoleNav} active={c.key} title={c.title} id={c.id} intro={<>Actions: {c.actions}. States: {c.states.join(', ')}.</>}>
            <dl className="grid gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-4 text-[0.8125rem] sm:grid-cols-2 xl:grid-cols-4">
                <div><dt className="text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase">Acceptance rule</dt><dd className="font-semibold text-ink-900">{c.rule.acceptance}</dd></div>
                <div><dt className="text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase">Audit</dt><dd className="text-ink-700">{c.rule.audit}</dd></div>
                <div><dt className="text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase">AI role</dt><dd className="text-ink-700">{c.rule.ai}</dd></div>
                <div><dt className="text-[0.6875rem] font-bold tracking-wider text-gold-800 uppercase">Human override</dt><dd className="text-ink-700">{c.rule.override}</dd></div>
            </dl>
            <KpiRow kpis={c.kpis} />
            {c.tabs.length > 1 && (
                <PillTabs
                    tabs={c.tabs.map((t) => ({ key: t.key, label: t.count !== null && t.count !== undefined ? `${t.label} (${t.count})` : t.label }))}
                    value={current.key}
                    onChange={(k) => { setActive(k); window.history.replaceState(window.history.state, '', `${window.location.pathname}?tab=${k}`); }}
                />
            )}
            <BlockGrid key={current.key} blocks={current.blocks} />
            <Box tone="cream"><p className="text-[0.75rem] text-ink-600">KP supplied no mockup for this screen. It follows the KP TEB v2.0 blueprint specification (Part 27.2). Every state change is recorded with who made it and when.</p></Box>
        </ConsoleFrame>
    );
}
