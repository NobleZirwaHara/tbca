import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { CtaBand, DataMeta, Grid, Hero, PackLoading, Rich, SecIcon, Section } from '@/Components/Aiim/ProtoExplore';
import { BuyBtn, BwFrame, CTable, hsHref, SvcRail, type IntelBase, type RailP, type Row, type SvcP } from '@/Components/Aiim/ProtoSearch';
import { cn } from '@/lib/cn';

interface Product { Group: string; Product: string; 'Setswana [VERIFY]': string; 'HS 2022': string; Sector: string; Note: string }
interface Props extends IntelBase {
    lead: string;
    groups: { group: string; products: Product[] }[];
    commodities: Row[];
    mapper: SvcP | null;
    landed: SvcP | null;
    rail: RailP;
}

/** Commodity HS code mapper: 55 Botswana products in English and Setswana plus 85 Issue 2.0 commodities (prototype #hs). */
export default function Hs({ lead, groups, commodities, mapper, landed, rail, bw, c, facts }: Props) {
    const [tn, setTn] = useState(false);
    return (
        <BwFrame title={`Commodity HS · ${c.name}`} crumbs={[{ label: c.name, href: `/aiim/country/${c.slug}` }, { label: 'Commodity HS' }]} facts={facts}>
            <Hero
                eyebrow="Commodity HS"
                title={bw ? '55 Botswana products in English and Setswana, plus 85 Issue 2.0 commodities' : `${c.name}: 85 Issue 2.0 commodities`}
                lead={bw ? <Rich t={lead} /> : `The continental commodity register applies to every country. ${c.name} products with local names will show here once its country pack is loaded.`}
                right={<>
                    <BuyBtn s={mapper} ctx="HS code mapper" tone="gold"><L.Barcode className="size-3.5" /> HS code mapper</BuyBtn>
                    <BuyBtn s={landed} ctx="Landed cost estimator">Landed cost</BuyBtn>
                </>}
                meta={bw ? <DataMeta /> : undefined}
            />
            {bw ? (
                <>
                    <div className="mt-4 flex items-center gap-2 text-[0.84rem]">
                        <span className="font-semibold text-ink-700">Product names</span>
                        <div className="inline-flex rounded-full border border-parchment-500 bg-white p-0.5" role="group" aria-label="Product name language">
                            {[['English', false], ['Setswana', true]].map(([l, v]) => (
                                <button key={String(l)} type="button" aria-pressed={tn === v} onClick={() => setTn(v as boolean)} className={cn('rounded-full px-3 py-1 font-semibold', tn === v ? 'bg-gold-500 text-ink-950' : 'text-ink-600')}>{l}</button>
                            ))}
                        </div>
                    </div>
                    {groups.map((g) => (
                        <Section key={g.group} title={g.group} sub={`${g.products.length} products`}>
                            <Grid cols={4}>
                                {g.products.map((p) => (
                                    <Link key={p.Product} href={hsHref(c.slug, p.Product)} className="grid content-start gap-1.5 rounded-[12px] border border-parchment-400 bg-white p-3.5 transition-colors hover:border-gold-500">
                                        <div className="flex items-center justify-between gap-2"><span className="font-mono font-semibold text-gold-700">{p['HS 2022']}</span><SecIcon code={p.Sector} size={24} /></div>
                                        <h4 className="leading-snug font-semibold text-ink-900">{tn ? p['Setswana [VERIFY]'] : p.Product}</h4>
                                        <span className="text-[0.75rem] text-ink-500">{tn ? p.Product : p['Setswana [VERIFY]']}</span>
                                        <span className="text-[0.8rem] text-ink-700">{p.Note}</span>
                                    </Link>
                                ))}
                            </Grid>
                        </Section>
                    ))}
                </>
            ) : (
                <div className="mt-6"><PackLoading country={c.name} what="Products with English and local-language names" /></div>
            )}
            <Section title="Issue 2.0 commodity register — 85 commodities" sub="Grade and must-find notes from the continental catalogue.">
                <CTable rows={commodities} name="I2_Commodity_HS" filters={['Group', 'Sector']} size={15} slug={c.slug} />
            </Section>
            <div className="mt-8"><SvcRail rail={rail} ctx={`Commodity HS — ${c.name}`} /></div>
            <CtaBand />
        </BwFrame>
    );
}
