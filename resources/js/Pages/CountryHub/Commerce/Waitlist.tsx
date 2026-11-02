/* P28 Country Waitlist & Unmet Demand Capture (prototype #/c/{ISO}/waitlist?sprint=). */
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { A, B, Bars, Card, Cols, Field, Kpi, Kpis, N, Note, STable, StatusChip, TagM, inputCls } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import type { CountryBase } from '@/types/countryHub';

interface Entry { iso: string; country: string; svc: string; lvl: string; org: string; d: string }
interface Props {
    base: CountryBase;
    mine: Entry[];
    notSold: number;
    unmet: { label: string; n: number }[];
    services: string[];
    sprint: string | null;
    byUnit: { unit: string; n: number }[] | null;
    levels: string[];
}

export default function Waitlist({ base, mine, notSold, unmet, services, sprint, byUnit, levels }: Props) {
    const { c } = base;
    const form = useForm({ org: '', svc: services[0] ?? '', lvl: 'High', sprint: sprint ?? '' });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(cHref(c, 'waitlist'), { preserveScroll: true, onSuccess: () => form.setData('org', '') }); };
    const err = Object.values(form.errors);

    return (
        <CountryPage base={base} pageKey="waitlist">
            <CountryHead base={base} pageKey="waitlist" title="Country Waitlist & Unmet Demand Capture" desc={`Capture unmet demand and interest for services not yet available in ${c.name}. We use this to prioritise activation and inform service development.`} />
            <Kpis>
                <Kpi l="Your waitlist entries" v={mine.length} s="Stored in this browser" icon="users" />
                <Kpi l="Services not sold standalone" v={N(notSold)} s="Candidates for bundling" icon="lock" />
                <Kpi l="Countries activated" v={54} s="Demand captured for services not yet sold standalone" icon="globe" />
                <Kpi l="Demand signal (Botswana leads)" v="2,137" s={<>Ranked place leads as a demand proxy <TagM /></>} icon="chart" />
            </Kpis>
            <Card title="Join the waitlist" icon="users">
                <form onSubmit={submit} className="grid grid-cols-[minmax(0,1fr)] items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Organisation *"><input className={inputCls} name="org" required placeholder="Your organisation" value={form.data.org} onChange={(e) => form.setData('org', e.target.value)} /></Field>
                    <Field label="Requested service *">
                        <select className={inputCls} name="svc" required value={form.data.svc} onChange={(e) => form.setData('svc', e.target.value)}>{services.map((s, i) => <option key={i} value={s}>{s}</option>)}</select>
                    </Field>
                    <Field label="Interest level">
                        <select className={inputCls} name="lvl" value={form.data.lvl} onChange={(e) => form.setData('lvl', e.target.value)}>{levels.map((l) => <option key={l}>{l}</option>)}</select>
                    </Field>
                    <B v="pri" type="submit" disabled={form.processing}>Add Unmet Demand Entry</B>
                </form>
                {err.length > 0 && <p role="alert" className="mt-2 text-[0.8rem] text-risk-700">{err.join(' ')}</p>}
            </Card>
            {mine.length > 0 && (
                <Card title="Recent waitlist entries (yours)" icon="file">
                    <STable head={['Country', 'Organisation', 'Requested service', 'Interest', 'Date']} rows={mine.slice(0, 10).map((x) => [x.country, x.org, x.svc, <StatusChip key="l" s={x.lvl} />, x.d])} />
                </Card>
            )}
            <Cols n={2}>
                <Card title="Top unmet service categories" icon="alert" sub="Sprints with no viable standalone tier (catalogue sheet 03) — demand captured here decides which become embedded components">
                    <Bars rows={unmet.map((u) => ({ label: u.label, value: u.n, text: `${u.n} Sprints` }))} />
                </Card>
                {byUnit ? (
                    <Card title={<>Where demand concentrates in Botswana (leads by unit) <TagM /></>} icon="map">
                        <Bars rows={byUnit.map((u) => ({ label: u.unit, value: u.n }))} />
                    </Card>
                ) : (
                    <Card title="Demand across Africa" icon="globe">
                        <p className="text-[0.82rem]">Demand across all 54 activated countries decides which country packs load next.</p>
                        <A className="mt-2" href="/countries/explorer">Country Explorer →</A>
                    </Card>
                )}
            </Cols>
            <Note><b>Stay Informed.</b> Get notified when requested services become available in {c.name}. Prototype entries stay in this browser only.</Note>
        </CountryPage>
    );
}
