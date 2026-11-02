import { Bars, DataTable, type Col } from '@/Components/Industries/Kit';
import { CtaBand, DataMeta, Hero, Panel, ProtoFrame, Section } from '@/Components/Aiim/ProtoLibrary';
import type { AiimPageProps } from '@/types/aiim';

type Row = { Code: string; Feature: string; 'User problem': string; 'How it works': string; Gate: string };
interface Props extends AiimPageProps { lead: string; gates: { label: string; value: number }[]; features: Row[] }

/** One-Stop Shop: the 80 features of PART C (BW_OneStopShop). */
export default function OneStop({ lead, gates, features }: Props) {
    const cols: Col<Row>[] = [{ k: 'Code', l: 'Code' }, { k: 'Feature', l: 'Feature' }, { k: 'User problem', l: 'User problem', clip: true }, { k: 'How it works', l: 'How it works', clip: true }, { k: 'Gate', l: 'Gate' }];
    return (
        <ProtoFrame title="One-Stop Shop" crumbs={[{ label: 'Botswana', href: '/aiim/country/botswana' }, { label: 'One-Stop Shop' }]}>
            <Hero eyebrow="PART C · One-Stop Shop [PROPOSED]" title="80 features that make AIIM Botswana a one-stop shop" lead={lead} meta={<DataMeta />} />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <Panel title="Features by commercial gate"><Bars rows={gates} /></Panel>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {features.slice(0, 6).map((o) => (
                        <div key={o.Code} className="flex min-w-0 flex-col gap-1.5 rounded-[12px] border border-parchment-400 bg-white p-4">
                            <span className="font-mono text-[0.7rem] text-ink-500">{o.Code}</span>
                            <h4 className="text-[0.9rem] font-bold text-ink-900">{o.Feature}</h4>
                            <p className="flex-1 text-[0.78rem] text-ink-500">{o['User problem']}</p>
                            <span className="self-start rounded-full bg-gold-100 px-2 py-0.5 text-[0.7rem] font-semibold text-gold-800">{o.Gate}</span>
                        </div>
                    ))}
                </div>
            </div>
            <Section title={`All ${features.length} features`}>
                <div className="rounded-[12px] border border-parchment-400 bg-white p-4"><DataTable name="one-stop-shop" cols={cols} rows={features} filters={['Gate']} size={25} /></div>
            </Section>
            <CtaBand />
        </ProtoFrame>
    );
}
