import { useEffect, useState, type ReactNode } from 'react';
import { Tabs } from '@/Components/ui/Kit';
import HeatMapTab from './HeatMapTab';
import MapTab from './MapTab';
import OpportunitiesTab from './OpportunitiesTab';
import PackTab from './PackTab';
import PlacesTab from './PlacesTab';
import QuestionsTab from './QuestionsTab';
import type { CountryActivation, CountryIntel } from './types';

const TAB_KEYS = ['overview', 'map', 'opportunities', 'places', 'heatmap', 'questions', 'pack'] as const;
type TabKey = (typeof TAB_KEYS)[number];

/** Keeps ?tab= and ?unit= in the address bar so a view can be shared, without an Inertia visit. */
function syncUrl(tab: string, unit: string | null) {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (tab === 'overview') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    if (unit) url.searchParams.set('unit', unit);
    else url.searchParams.delete('unit');
    window.history.replaceState(window.history.state, '', url.toString());
}

export default function CountryExplorer({
    intel,
    countryName,
    activation,
    initialTab,
    initialUnit,
    overview,
    hideOverview = false,
}: {
    intel: CountryIntel;
    countryName: string;
    activation: CountryActivation;
    initialTab: string;
    initialUnit: string | null;
    overview?: ReactNode;
    /** The page shows its own overview: open on the map and leave the Overview tab out. */
    hideOverview?: boolean;
}) {
    const first: TabKey = hideOverview ? 'map' : 'overview';
    const [tab, setTab] = useState<TabKey>((TAB_KEYS as readonly string[]).includes(initialTab) && !(hideOverview && initialTab === 'overview') ? (initialTab as TabKey) : first);
    const [unitId, setUnitId] = useState<number | null>(intel.units.find((u) => u.slug === initialUnit)?.id ?? null);
    const [sector, setSector] = useState<string | null>(null);
    const [lang, setLang] = useState('en');

    useEffect(() => {
        if (hideOverview && tab === 'map' && !unitId) return;
        syncUrl(tab, intel.units.find((u) => u.id === unitId)?.slug ?? null);
    }, [tab, unitId, intel.units, hideOverview]);

    const openOnMap = (id: number | null) => {
        setUnitId(id);
        setTab('map');
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const c = intel.coverage;
    const tabs = [
        ...(hideOverview ? [] : [{ key: 'overview', label: 'Overview' }]),
        { key: 'map', label: 'Map' },
        { key: 'opportunities', label: 'Opportunities', count: c.projects + c.opportunities },
        { key: 'places', label: 'Places', count: c.units },
        { key: 'heatmap', label: 'Heat map' },
        { key: 'questions', label: 'Investor and trader questions' },
        { key: 'pack', label: c.hasPack ? 'Country pack' : 'Country pack (pending)' },
    ];

    return (
        <div>
            <Tabs tone="dark" className="mb-4" tabs={tabs} value={tab} onChange={(k) => setTab(k as TabKey)} />
            {tab === 'overview' && overview}
            {tab === 'map' && <MapTab intel={intel} countryName={countryName} unitId={unitId} setUnitId={setUnitId} sector={sector} setSector={setSector} lang={lang} setLang={setLang} />}
            {tab === 'opportunities' && <OpportunitiesTab intel={intel} countryName={countryName} onShowOnMap={openOnMap} />}
            {tab === 'places' && <PlacesTab intel={intel} countryName={countryName} lang={lang} onOpen={openOnMap} />}
            {tab === 'heatmap' && <HeatMapTab intel={intel} countryName={countryName} />}
            {tab === 'questions' && <QuestionsTab intel={intel} countryName={countryName} sector={sector} setSector={setSector} onMap={() => setTab('map')} />}
            {tab === 'pack' && <PackTab intel={intel} countryName={countryName} activation={activation} lang={lang} />}
        </div>
    );
}
