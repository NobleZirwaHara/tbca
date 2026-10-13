import { useState } from 'react';
import { cn } from '@/lib/cn';
import AiimIcon from '../AiimIcon';
import { Chip } from '../Chips';
import { Panel, Pending } from './shared';
import type { CountryIntel, Question } from './types';

/**
 * A2 question navigator: the questions an investor or trader asks, per sector.
 * Country-answered chains come from the country pack; the model chains come from the
 * Sector Worked Examples (South Africa model) and apply to every country.
 */
export default function QuestionsTab({ intel, countryName, sector, setSector, onMap }: { intel: CountryIntel; countryName: string; sector: string | null; setSector: (s: string | null) => void; onMap: () => void }) {
    const [persona, setPersona] = useState<'investor' | 'trader'>('investor');
    const sectors = intel.sectorCodes.filter((s) => intel.questions.sectors[s.code]);
    const current = sector && intel.questions.sectors[sector] ? sector : null;
    const set = current ? intel.questions.sectors[current] : null;
    const countryQs = set?.country[persona] ?? [];
    const modelQs = set?.model[persona] ?? [];
    const generic = intel.questions[persona];

    const tab = (on: boolean) => cn('rounded border px-3 py-1.5 text-xs font-semibold', on ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-600 text-parchment-200 hover:border-gold-500');

    return (
        <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <div className="space-y-3">
                <Panel title="I am an">
                    <div className="flex gap-2">
                        <button type="button" className={tab(persona === 'investor')} onClick={() => setPersona('investor')}>Investor</button>
                        <button type="button" className={tab(persona === 'trader')} onClick={() => setPersona('trader')}>Trader</button>
                    </div>
                </Panel>
                <Panel title="Sector">
                    <ul className="space-y-0.5">
                        <li><button type="button" onClick={() => setSector(null)} className={cn('w-full rounded px-1.5 py-1 text-left text-xs hover:bg-ink-800', !current && 'bg-ink-800 text-gold-400')}>All sectors (core questions)</button></li>
                        {sectors.map((s) => (
                            <li key={s.code}>
                                <button type="button" onClick={() => setSector(s.code)} className={cn('flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-ink-800', current === s.code && 'bg-ink-800 text-gold-400')}>
                                    <span style={{ color: s.color }}><AiimIcon name={s.icon} className="size-3.5" /></span>{s.name}
                                    {intel.questions.sectors[s.code].country.investor.length > 0 && <span className="ml-auto text-[0.6rem] text-verified-500">answered</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>
            <div className="space-y-4">
                {current && (
                    <Panel title={`${countryName}: ${persona} questions answered for ${intel.sectorCodes.find((s) => s.code === current)?.name}`}>
                        {countryQs.length ? <QuestionList items={countryQs} onMap={onMap} /> : (
                            <Pending title={`Not yet answered for ${countryName}`}>The answers come with the {countryName} country pack. The model questions below show what will be answered and where the map will show it.</Pending>
                        )}
                    </Panel>
                )}
                {current && modelQs.length > 0 && (
                    <Panel title={`Model ${persona} questions for this sector`}>
                        <p className="mb-2 text-xs text-ink-300">From the Sector Worked Examples 2.1. South Africa is the model country; the role column says which institution answers the question in any country.</p>
                        <QuestionList items={modelQs} onMap={onMap} />
                    </Panel>
                )}
                <Panel title={`Core ${persona} questions (${generic.length})`}>
                    <p className="mb-2 text-xs text-ink-300">The questions every {persona} asks in any sector, with the information needed and how the map answers each one.</p>
                    <QuestionList items={generic} onMap={onMap} />
                </Panel>
            </div>
        </div>
    );
}

function QuestionList({ items, onMap }: { items: Question[]; onMap: () => void }) {
    return (
        <ol className="divide-y divide-ink-800">
            {items.map((q) => (
                <li key={`${q.code}-${q.position}-${q.question}`} className="grid gap-2 py-2 text-xs md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)]">
                    <div>
                        <p className="font-semibold text-parchment-100"><span className="mr-1.5 font-mono text-[0.65rem] text-gold-500">{q.code ?? q.position}</span>{q.question}</p>
                        {q.tag && <div className="mt-1 flex gap-1">{q.tag.split('+').map((t) => <Chip key={t} tone={t === 'MAP' ? 'info' : 'dark'}>{t === 'MAP' ? 'Map' : t === 'BRIEF' ? 'Brief' : t}</Chip>)}</div>}
                    </div>
                    <div className="text-ink-300">{q.info}</div>
                    <div className="text-ink-400">
                        {q.map && (/pin|map|heat|choropleth|route|line|bubble|layer|raster|outline/i.test(q.map) ? <button type="button" onClick={onMap} className="text-left text-gold-400 hover:underline">Map: {q.map}</button> : <span>Shown as: {q.map}</span>)}
                        {(q.institution || q.anchor || q.evidence) && <p className="mt-1 text-[0.65rem]">{[q.institution && `Role: ${q.institution}`, q.evidence && `Evidence: ${q.evidence}`, q.anchor].filter(Boolean).join(' · ')}</p>}
                    </div>
                </li>
            ))}
        </ol>
    );
}
