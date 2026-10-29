import { Link, router } from '@inertiajs/react';
import { Card, Cols, Flag, N, PillNav, STable, TagM, fmtM } from '@/Components/Industries/Kit';
import { Head1, IndMap, Shell, Stack, TrustStrip, heatCol, iHref, scoreCol } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

interface Props extends IndustryBase {
    metric: 'score' | 'exp' | 'imp';
    region: string;
    sel: string;
    matrix: Record<string, Record<string, [number, number, number]>>;
    basis: string;
}

export default function Heatmap({ metric, region, sel, matrix, basis, industries, countries }: Props) {
    const isos = countries.filter((c) => !region || c.region === region);
    const k = metric === 'exp' ? 1 : metric === 'imp' ? 2 : 0;
    const val = (code: string, iso: string) => matrix[code]?.[iso]?.[k] ?? 0;
    const max = Math.max(...industries.flatMap((x) => isos.map((c) => val(x.code, c.iso3))), 1);
    const col = (v: number) => (metric === 'score' ? scoreCol(v) : heatCol(v, max));
    const selInd = industries.find((x) => x.code === sel) ?? industries[0];
    const best = industries.map((x) => {
        const top = countries.map((c) => [matrix[x.code]?.[c.iso3]?.[0] ?? 0, c] as const).sort((a, b) => b[0] - a[0])[0];
        return [x, top] as const;
    });
    const fmt = (v: number) => (metric === 'score' ? `${N(v, 1)}/100` : `US$ ${fmtM(v)} m`);

    return (
        <Shell title="Industry × Country Heat Map" crumbs={[['Industries', '/industries'], ['Industry × Country Heat Map']]}>
            <Stack>
                <Head1 eyebrow="Industries · deeper view" title="Industry × Country Heat Map" desc="17 industries × 54 activated countries. Pick a metric, filter by AU region, click any cell for the intersection page." />
                <Card>
                    <div className="flex flex-wrap gap-3">
                        <PillNav items={[['score', 'Opportunity score'], ['exp', 'Exports (US$ m)'], ['imp', 'Imports (US$ m)']].map(([m, l]) => ({ label: l, href: `/industries/heatmap?${new URLSearchParams({ metric: m, ...(region ? { region } : {}) })}`, on: m === metric }))} />
                        <PillNav items={['', 'North', 'West', 'Central', 'East', 'Southern'].map((r) => ({ label: r || 'All regions', href: `/industries/heatmap?${new URLSearchParams({ metric, ...(r ? { region: r } : {}) })}`, on: r === region }))} />
                    </div>
                </Card>
                <Card icon="layers" title="Industries × countries">
                    <div className="max-h-[640px] max-w-full overflow-auto">
                        <table className="border-separate border-spacing-[2px] text-[0.68rem]">
                            <thead>
                                <tr>
                                    <th className="sticky top-0 left-0 z-20 bg-parchment-200 px-1 text-left">Industry</th>
                                    {isos.map((c) => (
                                        <th key={c.iso3} title={c.name} className="sticky top-0 z-10 h-[92px] bg-parchment-200 px-0.5 align-bottom font-semibold whitespace-nowrap text-ink-600 [writing-mode:vertical-rl] rotate-180 text-left">{c.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {industries.map((x) => (
                                    <tr key={x.code}>
                                        <th className="sticky left-0 z-10 bg-parchment-200 px-1 text-left font-semibold whitespace-nowrap"><Link href={iHref(x)} className="hover:underline">{x.name}</Link></th>
                                        {isos.map((c) => {
                                            const v = val(x.code, c.iso3);
                                            const dark = metric === 'score' ? v > 60 : v / max > 0.3;
                                            return (
                                                <td key={c.iso3} className="h-6 min-w-[26px] cursor-pointer rounded-[3px] text-center" style={{ background: col(v), color: dark ? '#fff' : '#23232a' }} title={`${x.name} · ${c.name}: ${fmt(v)}`}>
                                                    <Link href={`/industries/${x.slug}/country/${c.slug}`} className="block" aria-label={`${x.name} in ${c.name}: ${fmt(v)}`}>{metric === 'score' ? Math.round(v) : ' '}</Link>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.72rem] text-ink-400"><TagM /> {basis}</p>
                </Card>
                <Cols>
                    <Card title={`Map · ${selInd.name}`} icon="map">
                        <select aria-label="Industry for the map" className="mb-2 h-8 rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.78rem]" value={selInd.code} onChange={(e) => router.get('/industries/heatmap', { metric, ...(region ? { region } : {}), ind: e.target.value }, { preserveScroll: true })}>
                            {industries.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
                        </select>
                        <IndMap countries={countries} fill={(iso) => col(val(selInd.code, iso))} tip={(iso, name) => `${name}\n${fmt(val(selInd.code, iso))}`} href={(c) => `/industries/${selInd.slug}/country/${c.slug}`} />
                    </Card>
                    <Card title="Leading country per industry" icon="star">
                        <STable compact head={['Industry', 'Leading country', 'Score']} rows={best.map(([x, [s, c]]) => [
                            <Link href={iHref(x)} className="hover:underline">{x.name}</Link>,
                            <Link href={`/industries/${x.slug}/country/${c.slug}`} className="hover:underline"><Flag iso2={c.iso2} /> {c.name}</Link>, N(s, 1),
                        ])} />
                    </Card>
                </Cols>
                <TrustStrip />
            </Stack>
        </Shell>
    );
}
