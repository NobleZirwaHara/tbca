import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Hero, Panel, PillLink, ProtoFrame, SumBox, pill, type SvcCard } from '@/Components/Aiim/ProtoLibrary';
import { useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Config { type: string; sector: string; unit: string; language: string; currency: string; expedite: boolean; sources: boolean; country: string }
type Opt = { value: string; label: string };

interface Props extends AiimPageProps {
    report: { reference: string; title: string; status: string; sku: string | null; config: Config; country: string };
    estimate: { unpriced: string[] };
    options: { types: SvcCard[]; extras: { key: string; svc: SvcCard | null }[]; localise: boolean; sectors: Opt[]; units: Opt[]; unitsLabel: string };
}

const inputCls = 'h-10 w-full rounded-[8px] border border-parchment-500 bg-white px-3 text-[0.86rem]';

/** Page 36: Report Configuration. Posts to the existing report step and quotation actions. */
export default function Configure({ report, options }: Props) {
    const money = useMoney();
    const c = report.config;
    const form = useForm({ kind: 'service', quote: false, type: c.type, sector: c.sector, unit: c.unit, language: c.language, currency: c.currency, expedite: c.expedite, sources: c.sources });
    const d = form.data;
    const extra = (k: string) => options.extras.find((x) => x.key === k)?.svc ?? null;
    const type = options.types.find((t) => t.code === d.type) ?? options.types[0];

    const lines: { label: string; amount: number }[] = [];
    const missing: string[] = [];
    const add = (s: SvcCard | null, label: string) => { if (!s) return; if (s.status === 'priced' && s.from !== null) lines.push({ label, amount: s.from }); else missing.push(`${label} (${s.code})`); };
    add(type, type?.name ?? 'Report');
    if (d.expedite) add(extra('expedite'), 'Expedite');
    if (d.sources) add(extra('sources'), 'Source manifest');
    if (d.language === 'tn') add(extra('localise'), 'Localisation');

    const submit = (quote: boolean) => (e?: FormEvent) => { e?.preventDefault(); form.transform((x) => ({ ...x, quote })); form.post(`/aiim/reports/${report.reference}/step`, { preserveScroll: true }); };
    const err = (k: keyof typeof d) => form.errors[k] && <p role="alert" className="mt-1 text-[0.75rem] text-risk-600">{form.errors[k]}</p>;

    return (
        <ProtoFrame title="Report Configuration" crumbs={[{ label: 'Premium Briefs', href: '/aiim/store' }, ...(report.sku ? [{ label: report.sku, href: `/aiim/store/${report.sku}` }] : []), { label: 'Report Configuration' }]}>
            <Hero eyebrow={`Page 36 · Build a ${report.country} report`} title="Report Configuration" lead={<>{report.title} · <span className="font-mono">{report.reference}</span>{report.status === 'changes_requested' ? ' · changes requested' : ''}</>} />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <form onSubmit={submit(true)} noValidate>
                    <Panel title="Configure">
                        <div className="grid gap-4">
                            <label className="grid gap-1 text-[0.8rem] font-semibold text-ink-700">Report type
                                <select className={inputCls} value={d.type} onChange={(e) => form.setData('type', e.target.value)}>
                                    {options.types.map((s) => <option key={s.code} value={s.code}>{s.name} — {s.status === 'priced' && s.from !== null ? `from ${money(s.from)}` : 'not in the app catalogue yet'}</option>)}
                                </select>{err('type')}
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1 text-[0.8rem] font-semibold text-ink-700">Sector focus
                                    <select className={inputCls} value={d.sector} onChange={(e) => form.setData('sector', e.target.value)}><option value="">All sectors</option>{options.sectors.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{err('sector')}
                                </label>
                                <label className="grid gap-1 text-[0.8rem] font-semibold text-ink-700">Unit focus
                                    <select className={inputCls} value={d.unit} onChange={(e) => form.setData('unit', e.target.value)}><option value="">{options.unitsLabel}</option>{options.units.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{err('unit')}
                                </label>
                                <label className="grid gap-1 text-[0.8rem] font-semibold text-ink-700">Language
                                    <select className={inputCls} value={d.language} onChange={(e) => form.setData('language', e.target.value)}><option value="en">English</option>{options.localise && <option value="tn">Setswana (AAB-EMB-191 localisation)</option>}</select>{err('language')}
                                </label>
                                <label className="grid gap-1 text-[0.8rem] font-semibold text-ink-700">Currency
                                    <select className={inputCls} value={d.currency} onChange={(e) => form.setData('currency', e.target.value)}>{['BWP', 'USD', 'ZAR'].map((x) => <option key={x}>{x}</option>)}</select>{err('currency')}
                                </label>
                            </div>
                            <label className="flex items-center gap-2 text-[0.86rem]"><input type="checkbox" className="size-4 accent-gold-600" checked={d.expedite} onChange={(e) => form.setData('expedite', e.target.checked)} />Expedite delivery (AAB-EMB-242)</label>
                            <label className="flex items-center gap-2 text-[0.86rem]"><input type="checkbox" className="size-4 accent-gold-600" checked={d.sources} onChange={(e) => form.setData('sources', e.target.checked)} />Add source manifest and evidence appendix (AAB-EMB-203)</label>
                            <div className="flex flex-wrap gap-2">
                                <button type="submit" className={pill('gold', 'md')} disabled={form.processing}>Get quotation</button>
                                <button type="button" className={pill('ghost', 'md')} disabled={form.processing} onClick={submit(false)}>Save draft</button>
                                <PillLink href={report.sku ? `/aiim/store/${report.sku}` : '/aiim/store'} tone="ghost" size="md">Back</PillLink>
                            </div>
                        </div>
                    </Panel>
                </form>
                <div className="grid content-start gap-4">
                    <Panel title="Live price">
                        <SumBox lines={lines} />
                        {missing.length > 0 && <p className="mt-2 text-[0.75rem] text-attested-700">Not in the app catalogue yet: {missing.join(', ')}.</p>}
                        <p className="mt-2 text-[0.72rem] text-ink-400">Prices from the app's Sprint records, VAT-exclusive. The quotation is valid for 14 days (AAB-EMB-230).</p>
                    </Panel>
                </div>
            </div>
        </ProtoFrame>
    );
}
