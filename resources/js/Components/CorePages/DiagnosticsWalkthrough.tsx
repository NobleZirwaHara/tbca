import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Animated, captioned walkthrough "video" for the Diagnostics journey. No media file: each step
 * is a small animated scene; the player auto-advances with captions and has play/pause, restart
 * and chapter controls. Respects prefers-reduced-motion (does not autoplay).
 */

const STEP_MS = 5000;
const TICK_MS = 100;

interface Step {
    icon: string;
    title: string;
    caption: string;
    scene: ReactNode;
}

const bar = (w: string, tone = 'bg-gold-500') => <span className={cn('block h-2 rounded-full', tone)} style={{ width: w }} />;

const STEPS: Step[] = [
    {
        icon: 'clipboard-list',
        title: 'Choose a Diagnostic',
        caption: 'Start on /diagnostics: pick a category — Business Health, Financial, Operations, Market & Growth — or a ready-made pack.',
        scene: (
            <div className="grid grid-cols-3 gap-2">
                {['Business Health', 'Financial Deep Dive', 'Operations Review', 'Market Position', 'Risk & Compliance', 'Custom'].map((t, i) => (
                    <div key={t} className={cn('wt-pop rounded-[6px] border p-2 text-[0.625rem]', i === 1 ? 'border-gold-500 bg-gold-500/15 text-gold-300' : 'border-ink-600 text-ink-300')} style={{ animationDelay: `${i * 120}ms` }}>
                        <span className="mb-1 block h-6 rounded bg-gradient-to-br from-[#4a2412] to-[#f08a4b]/70" />
                        {t}
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: 'shopping-cart',
        title: 'Add to Cart & Pay',
        caption: 'Add the pack to your basket. Prices show in your selected currency (ZAR, USD, XOF, EUR or CNY); checkout is secure.',
        scene: (
            <div className="mx-auto max-w-xs space-y-2 rounded-[6px] border border-ink-600 p-3 text-[0.6875rem]">
                <p className="flex justify-between text-parchment-100"><span>Financial Deep Dive</span><span className="font-bold text-gold-400">R4 950</span></p>
                <p className="flex justify-between text-ink-400"><span>VAT (15%)</span><span>R743</span></p>
                <span className="wt-grow block h-px bg-ink-600" />
                <span className="wt-pulse block rounded bg-gold-500 py-1.5 text-center font-semibold text-ink-900">Proceed to Checkout</span>
            </div>
        ),
    },
    {
        icon: 'notebook-pen',
        title: 'Complete the Assessment',
        caption: 'Answer structured questions in your portal and upload supporting documents. Save and resume any time.',
        scene: (
            <div className="space-y-2 text-[0.6875rem]">
                {['Revenue trend (3 years)', 'Gross margin', 'Debtor days', 'Cash runway'].map((q, i) => (
                    <div key={q} className="wt-slide flex items-center gap-2" style={{ animationDelay: `${i * 250}ms` }}>
                        <span className="w-32 shrink-0 text-ink-300">{q}</span>
                        <span className="flex-1 rounded bg-ink-800 p-0.5">{bar(`${40 + i * 15}%`)}</span>
                    </div>
                ))}
                <p className="text-right text-ink-400">Step 2 of 4 · Autosaved</p>
            </div>
        ),
    },
    {
        icon: 'cpu',
        title: 'AI Analysis & Benchmarks',
        caption: 'Our diagnostic engine scores your answers against African market and sector benchmarks.',
        scene: (
            <div className="flex items-end justify-center gap-2" style={{ height: 96 }}>
                {[55, 72, 38, 84, 61, 47, 90].map((h, i) => (
                    <span key={i} className="wt-rise w-5 rounded-t bg-gradient-to-t from-gold-700 to-gold-400" style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />
                ))}
            </div>
        ),
    },
    {
        icon: 'user-check',
        title: 'Expert Review',
        caption: 'A TBCA specialist validates the findings, removes false positives and adds context before release.',
        scene: (
            <div className="mx-auto flex max-w-sm items-center gap-3 rounded-[6px] border border-ink-600 p-3 text-[0.6875rem]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-400"><Icon name="user-check" className="size-5" /></span>
                <span className="flex-1 space-y-1.5">
                    <span className="block text-parchment-100">Reviewer sign-off</span>
                    {bar('100%', 'bg-verified-500 wt-grow')}
                    <span className="block text-verified-500">3 findings validated · 1 adjusted</span>
                </span>
            </div>
        ),
    },
    {
        icon: 'file-check',
        title: 'Report & Action Plan',
        caption: 'Download your report with a health score, risk exposure and a prioritised action plan — then book a follow-up.',
        scene: (
            <div className="grid grid-cols-[auto_1fr] items-center gap-4 text-[0.6875rem]">
                <span className="wt-pop flex size-20 items-center justify-center rounded-full border-4 border-gold-500 text-lg font-bold text-parchment-100">76</span>
                <ul className="space-y-1.5">
                    {['Fix debtor collection cycle', 'Renegotiate supplier terms', 'Launch cash-flow dashboard'].map((a, i) => (
                        <li key={a} className="wt-slide flex gap-1.5 text-parchment-100" style={{ animationDelay: `${i * 200}ms` }}><span className="text-gold-400">{i + 1}.</span>{a}</li>
                    ))}
                </ul>
            </div>
        ),
    },
];

function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

interface PlayerState { step: number; elapsed: number; playing: boolean }

/** Pure tick: advance the clock, roll over to the next chapter, stop after the last one. */
function tick(p: PlayerState): PlayerState {
    if (!p.playing) {
        return p;
    }
    if (p.elapsed + TICK_MS < STEP_MS) {
        return { ...p, elapsed: p.elapsed + TICK_MS };
    }
    return p.step + 1 >= STEPS.length ? { step: p.step, elapsed: 0, playing: false } : { step: p.step + 1, elapsed: 0, playing: true };
}

export default function DiagnosticsWalkthrough({ className }: { className?: string }) {
    const [state, setState] = useState<PlayerState>(() => ({ step: 0, elapsed: 0, playing: !prefersReducedMotion() }));
    const { step, elapsed, playing } = state;

    // The timer is an external system: tick while playing.
    useEffect(() => {
        if (!playing) {
            return;
        }
        const id = window.setInterval(() => setState(tick), TICK_MS);
        return () => window.clearInterval(id);
    }, [playing]);

    const go = (i: number, play = playing) => setState({ step: i, elapsed: 0, playing: play });
    const setPlaying = (play: boolean) => setState((p) => ({ ...p, playing: play }));
    const finished = !playing && step === STEPS.length - 1 && elapsed === 0;
    const s = STEPS[step];
    const total = ((step * STEP_MS + elapsed) / (STEPS.length * STEP_MS)) * 100;

    return (
        <figure className={cn('overflow-hidden rounded-[10px] border border-gold-700/50 bg-ink-900', className)} aria-roledescription="walkthrough video" aria-label="How Diagnostics work">
            <style>{`
                @keyframes wt-pop { from { opacity: 0; transform: scale(.92) } to { opacity: 1; transform: none } }
                @keyframes wt-slide { from { opacity: 0; transform: translateX(-12px) } to { opacity: 1; transform: none } }
                @keyframes wt-rise { from { transform: scaleY(0) } to { transform: scaleY(1) } }
                @keyframes wt-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
                @keyframes wt-pulse { 0%,100% { opacity: 1 } 50% { opacity: .6 } }
                .wt-pop { animation: wt-pop .45s both } .wt-slide { animation: wt-slide .45s both }
                .wt-rise { animation: wt-rise .6s both; transform-origin: bottom } .wt-grow { animation: wt-grow 1.2s both; transform-origin: left }
                .wt-pulse { animation: wt-pulse 1.6s infinite }
                @media (prefers-reduced-motion: reduce) { .wt-pop, .wt-slide, .wt-rise, .wt-grow, .wt-pulse { animation: none } }
            `}</style>
            <div className="relative aspect-[16/9] bg-[radial-gradient(ellipse_at_top,#4a2412_0%,#1f1410_55%,#0d0d11_100%)] p-5 sm:p-8">
                <p className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-wider text-gold-400 uppercase">
                    <Icon name={s.icon} className="size-4" />Step {step + 1} of {STEPS.length}
                </p>
                <p className="mt-1 text-lg font-bold text-parchment-100 sm:text-xl">{s.title}</p>
                <div key={step} className="mt-4 sm:mt-6">{s.scene}</div>
                {!playing && (
                    <button type="button" onClick={() => (finished ? go(0, true) : setPlaying(true))} className="absolute inset-0 flex items-center justify-center bg-ink-950/40" aria-label={finished ? 'Replay walkthrough' : 'Play walkthrough'}>
                        <span className="flex size-16 items-center justify-center rounded-full bg-gold-500 text-ink-900 shadow-lg">{finished ? <RotateCcw className="size-7" /> : <Play className="ml-1 size-7" />}</span>
                    </button>
                )}
            </div>
            <figcaption className="border-t border-ink-700 px-4 py-3 text-[0.8125rem] text-parchment-200" aria-live="polite">{s.caption}</figcaption>
            <div className="flex items-center gap-3 border-t border-ink-700 px-4 py-2">
                <button type="button" onClick={() => setPlaying(!playing)} className="text-gold-400" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="size-5" /> : <Play className="size-5" />}</button>
                <button type="button" onClick={() => go(0, true)} className="text-ink-300 hover:text-gold-400" aria-label="Restart"><RotateCcw className="size-4" /></button>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(total)} aria-label="Walkthrough progress">
                    <span className="absolute inset-y-0 left-0 bg-gold-500" style={{ width: `${total}%` }} />
                </span>
                <span className="text-[0.6875rem] text-ink-300 tabular-nums">{Math.floor((step * STEP_MS + elapsed) / 1000)}s / {(STEPS.length * STEP_MS) / 1000}s</span>
            </div>
            <ol className="grid grid-cols-3 gap-px border-t border-ink-700 bg-ink-700 sm:grid-cols-6">
                {STEPS.map((x, i) => (
                    <li key={x.title}>
                        <button type="button" onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} className={cn('flex h-full w-full flex-col items-start gap-0.5 bg-ink-900 px-2 py-2 text-left text-[0.625rem] leading-tight', i === step ? 'text-gold-400' : 'text-ink-300 hover:text-parchment-100')}>
                            <span className="font-bold">{String(i + 1).padStart(2, '0')}</span>{x.title}
                        </button>
                    </li>
                ))}
            </ol>
        </figure>
    );
}
