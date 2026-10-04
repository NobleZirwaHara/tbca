import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { ArrowLink, Card, CheckList } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Tower { code: string; slug: string; name: string; icon: string; blurb: string; services: number; start: string; intro: string; dep: string }

export default function Towers({ journey, towers }: { journey: JourneyState; towers: Tower[] }) {
    const [sel, setSel] = useState<string | null>(journey.tower);
    const t = towers.find((x) => x.code === sel);
    const save = (draft: boolean) => sel && router.post('/technology-solutions/towers', { tower: sel, draft }, { preserveScroll: true });
    return (
        <>
            <Head title="Technology Tower Chooser" />
            <TechJourney step={2} journey={journey} title="Technology Tower Chooser" sub="Select the technology solution tower that best matches your goals. Each tower contains expert capabilities, proven methodologies and connected services." badge={journey.progress.context ? <span className="rounded bg-verified-50 px-2 py-1 text-xs text-verified-700">✓ Context Captured</span> : undefined}
                footer={<><Link href="/technology-solutions/context" className="text-sm">← Back to Context</Link><div className="flex gap-2"><Button variant="outline" disabled={!sel} onClick={() => save(true)}>Save as Draft</Button><Button disabled={!sel} onClick={() => save(false)} trailingIcon="arrow-right">Continue to Diagnostic</Button></div></>}>
                <div className="grid gap-4 xl:grid-cols-12">
                    <section className="xl:col-span-8">
                        <h2 className="font-semibold">7 Integrated Technology Solution Towers</h2>
                        <p className="text-xs text-ink-500">Click a tower to explore capabilities, services and sample outcomes.</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Towers">
                            {towers.map((x) => (
                                <button key={x.code} type="button" role="radio" aria-checked={sel === x.code} onClick={() => setSel(x.code)} className={cn('flex flex-col rounded-[8px] border bg-white p-4 text-left', sel === x.code ? 'border-gold-500 ring-2 ring-gold-400' : 'border-parchment-400 hover:border-gold-300')}>
                                    <div className="flex items-center gap-2"><AdvIcon name={x.icon} className="size-7 text-gold-600" /><span className="text-xs font-bold text-gold-700">{x.code}</span></div>
                                    <span className="mt-2 text-sm font-semibold">{x.name}</span>
                                    <span className="mt-1 flex-1 text-xs text-ink-600">{x.blurb}</span>
                                    <span className="mt-3 flex justify-between text-[0.6875rem] text-ink-500"><span>{x.services} Services</span><span>Start from {x.start}</span></span>
                                </button>
                            ))}
                        </div>
                    </section>
                    <aside className="space-y-4 xl:col-span-4">
                        <Card title="Tower Selection Summary">
                            {t ? (
                                <div className="text-sm">
                                    <p className="text-xs font-bold text-gold-700">{t.code}</p>
                                    <p className="font-semibold">{t.name}</p>
                                    <p className="mt-1 text-xs text-ink-600">{t.intro}</p>
                                    <p className="mt-2 text-xs"><b>External dependency:</b> {t.dep} (Ledger X, not TBCA fees)</p>
                                    <p className="text-xs"><b>Entry tier:</b> {t.start} · {t.services} services</p>
                                    <ArrowLink href={`/technology-solutions/towers/${t.slug}`} className="mt-2">Explore Tower</ArrowLink>
                                </div>
                            ) : <p className="flex flex-col items-center gap-2 py-6 text-center text-xs text-ink-500"><MousePointerClick className="size-8" />No tower selected yet. Select a tower to see details, service highlights and sample outcomes.</p>}
                        </Card>
                        <Card title="Why Start Here?"><CheckList items={['Focus your solution on the right technology domain', 'View capabilities, services and integration pathways', 'See sample outcomes and engagement starting points', 'Continue to solution configuration and fee transparency']} /></Card>
                    </aside>
                </div>
            </TechJourney>
        </>
    );
}
