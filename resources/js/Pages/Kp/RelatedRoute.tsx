import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, KpPage, type KpCard, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    insight: KpCard | null;
    steps: [string, string, string, string, string, string][];
    paths: [string, string, string][];
    tools: [string, string][];
    products: [string, string][];
}

const STEP_ICON = ['clipboard-check', 'bar-chart-3', 'file-text', 'rocket', 'trending-up'];
const PATH_ICON = ['target', 'cpu', 'users', 'landmark'];

/** KP-SCR-033 Related TBCA Route: from an insight to diagnose, plan and act. */
export default function RelatedRoute({ screen, kpNav, insight, steps, paths, tools, products }: Props) {
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Related TBCA Route']]}
            title="Related TBCA Route"
            intro="Explore connected TBCA paths, tools, products and experts that can help you act on this insight."
            rail={
                <>
                    <Box title="Related Tools" icon="wrench"><ul className="space-y-1.5">{tools.map(([t, h]) => <li key={t}><Link href={h} className="flex items-center justify-between text-[0.8125rem] hover:text-gold-700">{t}<L.ArrowRight className="size-3.5" /></Link></li>)}</ul></Box>
                    <Box title="Related Products" icon="shopping-bag"><ul className="space-y-1.5">{products.map(([t, h]) => <li key={t}><Link href={h} className="flex items-center justify-between text-[0.8125rem] hover:text-gold-700">{t}<L.ArrowRight className="size-3.5" /></Link></li>)}</ul></Box>
                    <Box title="Speak to an Expert"><p className="text-[0.8125rem]">Get personalised advice from a TBCA specialist or trusted partner.</p><BtnLink href={`${BASE}/book`} size="sm" tone="outline" className="mt-2">Find an Expert</BtnLink></Box>
                    <Box title="Need Help Deciding?" tone="purple"><p className="text-[0.8125rem]">Ask the KP Knowledge Assistant for guidance on your next step.</p><BtnLink href={`${BASE}/ask`} size="sm" tone="outline" className="mt-2">Ask a Question</BtnLink></Box>
                </>
            }
        >
            {insight && (
                <div className="flex flex-wrap items-center gap-4 rounded-[12px] border border-referenced-500/30 bg-referenced-50 p-4">
                    <span className="flex size-12 items-center justify-center rounded-full bg-referenced-500 text-white"><L.MapPin className="size-6" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                        <p className="text-[0.75rem] font-bold tracking-wider text-referenced-500 uppercase">You are here</p>
                        <Link href={insight.href} className="font-serif text-[1.125rem] font-bold text-ink-900 hover:text-gold-700">Insight: {insight.title}</Link>
                        <p className="text-[0.8125rem] text-ink-600">This insight connects to the TBCA routes below, which help you diagnose, plan and implement.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[0.75rem] font-semibold text-referenced-500">{insight.themeLabel}</span>
                </div>
            )}
            <Box title="Recommended TBCA Route" icon="map">
                <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {steps.map(([stage, sub, t, b, cta, h], i) => (
                        <li key={stage} className="flex flex-col rounded-[10px] border border-parchment-400 p-3">
                            <span className="mx-auto flex size-8 items-center justify-center rounded-full border-2 border-referenced-500 font-bold text-referenced-500">{i + 1}</span>
                            <p className="mt-1 text-center text-[0.875rem] font-bold text-ink-900">{stage}</p>
                            <p className="text-center text-[0.6875rem] text-ink-500">{sub}</p>
                            <Ico name={STEP_ICON[i]} className="mt-3 size-6 text-referenced-500" />
                            <p className="mt-1 text-[0.8125rem] font-semibold text-ink-900">{t}</p>
                            <p className="flex-1 text-[0.75rem] text-ink-600">{b}</p>
                            <Link href={h} className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700">{cta}<L.ArrowRight className="size-3" /></Link>
                        </li>
                    ))}
                </ol>
                <p className="mt-3 flex gap-2 rounded-[8px] bg-gold-50 p-2 text-[0.75rem] text-ink-700"><L.Star className="size-4 shrink-0 text-gold-700" aria-hidden="true" />This route is curated by the TBCA team to help you move from insight to impact.</p>
            </Box>
            <Box title="Other Relevant Paths" icon="compass">
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{paths.map(([t, b, h], i) => <li key={t}><Link href={h} className="flex h-full gap-2.5 rounded-[10px] border border-parchment-400 p-3 hover:border-referenced-500"><Ico name={PATH_ICON[i]} className="mt-0.5 size-6 shrink-0 text-referenced-500" /><span><span className="block text-[0.8125rem] font-bold text-ink-900">{t}</span><span className="block text-[0.75rem] text-ink-600">{b}</span></span></Link></li>)}</ul>
            </Box>
        </KpPage>
    );
}
