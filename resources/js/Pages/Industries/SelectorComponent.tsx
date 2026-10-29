import { useState } from 'react';
import { B, Card, Cols, Field, STable, Ticks, inputCls } from '@/Components/Industries/Kit';
import { Head1, PlainPage, contextJson } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Ind = { code: string; name: string; cx: number; cxName: string; reg: string; gate: string; cat: string; subs: { code: string; name: string }[] };
interface Props extends IndustryBase { all: Ind[] }

export default function SelectorComponent({ all, countries }: Props) {
    const [code, setCode] = useState(all[0].code);
    const [sub, setSub] = useState('');
    const [iso, setIso] = useState('BWA');
    const [disabled, setDisabled] = useState(false);
    const [copied, setCopied] = useState('');
    const x = all.find((i) => i.code === code) ?? all[0];
    const c = countries.find((k) => k.iso3 === iso) ?? countries[0];
    const json = JSON.stringify(contextJson(x, x.subs.find((s) => s.code === sub) ?? null, c), null, 2);

    return (
        <PlainPage title="Industry Selector Component" crumbs={[['Industries', '/industries'], ['Industry Selector Component']]}>
            <Head1 eyebrow="Component Library · IN-SCR-011 · Mock-up Page 11" title="Industry Selector Component" desc="A reusable component for selecting an Industry and refining by Sub-Industry. Returns a canonical IndustryContext for routing, pricing and availability logic." />
            <Cols>
                <Card title="Live component" icon="cog">
                    <div className="space-y-2">
                        <Field label="Industry"><select className={inputCls} value={code} disabled={disabled} onChange={(e) => { setCode(e.target.value); setSub(''); }}>{all.map((i) => <option key={i.code} value={i.code}>{i.name}</option>)}</select></Field>
                        <Field label="Sub-Industry (optional)"><select className={inputCls} value={sub} disabled={disabled} onChange={(e) => setSub(e.target.value)}><option value="">Select a sub-industry (optional)</option>{x.subs.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select></Field>
                        <Field label="Country (ISO)"><select className={inputCls} value={iso} onChange={(e) => setIso(e.target.value)}>{countries.map((k) => <option key={k.iso3} value={k.iso3}>{k.name}</option>)}</select></Field>
                        <label className="flex items-center gap-2 text-[0.82rem]"><input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} /> Disabled state</label>
                    </div>
                </Card>
                <Card title="Returns IndustryContext" icon="file">
                    <pre className="m-0 font-mono text-[0.72rem] break-all whitespace-pre-wrap">{json}</pre>
                    <B sm className="mt-2" onClick={() => { try { void navigator.clipboard.writeText(json).then(() => setCopied('IndustryContext JSON copied'), () => setCopied('Copy not available here')); } catch { setCopied('Copy not available here'); } }}>Copy JSON</B>
                    {copied && <span role="status" className="ms-2 text-[0.75rem] text-ink-500">{copied}</span>}
                </Card>
            </Cols>
            <Cols>
                <Card title="Usage guidelines"><Ticks items={['Always capture Industry and, where applicable, Sub-Industry.', 'Feeds canonical IndustryContext to diagnostics, pricing, availability and routing.', 'No free-text entry — selection comes from the controlled taxonomy.', 'Use on public, portal and admin surfaces.']} /></Card>
                <Card title="Props">
                    <STable compact head={['Prop', 'Type', 'Required', 'Description']} rows={[['value', 'IndustryContext', 'No', 'Current selected context'], ['onChange', 'Function', 'Yes', 'Fires when selection changes'], ['country', 'String (ISO)', 'Yes', 'Country context (e.g. BW)'], ['placeholder', 'Object', 'No', 'Custom placeholder text'], ['disabled', 'Boolean', 'No', 'Disable the component']]} />
                    <p className="mt-2 text-[0.72rem] text-ink-400">Accessibility: full keyboard navigation, ARIA labels, screen-reader friendly, high contrast.</p>
                </Card>
            </Cols>
        </PlainPage>
    );
}
