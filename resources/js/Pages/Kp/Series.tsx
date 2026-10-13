import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import KpFrame, { KpItemCard, type KpCard, type KpShared } from '@/Components/Kp/KpFrame';
import { Ico } from '@/Components/Webinars/kit';

interface Collection {
    slug: string;
    title: string;
    icon: string;
    blurb: string;
    themes: string[];
    themeLabels: string[];
    count?: number;
}

interface Props extends KpShared {
    collections: Collection[];
    current: Collection | null;
    items: KpCard[];
}

export default function Series({ sections, collections, current, items }: Props) {
    return (
        <KpFrame
            sections={sections}
            crumbs={[['Home', '/'], ['KP Thought Leadership', '/kp-thought-leadership'], ['Series & Collections', current ? '/kp-thought-leadership/series' : undefined], ...(current ? [[current.title] as [string]] : [])]}
            eyebrow={current ? 'Series' : 'Series & Collections'}
            title={current ? current.title : 'Series and Collections'}
            lead={current ? current.blurb : 'Curated collections that read in sequence, grouped by the questions African leaders ask most.'}
        >
            <Head title={`${current ? current.title : 'Series and Collections'} | KP Thought Leadership`} />
            {current ? (
                <>
                    <p className="text-[0.875rem] text-ink-600">Themes in this series: {current.themeLabels.map((t, i) => <Link key={t} href={`/kp-thought-leadership/themes/${current.themes[i]}`} className="mr-2 font-semibold text-gold-700">{t}</Link>)}</p>
                    <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((i) => <KpItemCard key={i.slug} item={i} />)}</ol>
                    <h2 className="font-serif text-[1.375rem] font-bold text-ink-900">Other Series</h2>
                </>
            ) : null}
            <ul className="grid gap-4 md:grid-cols-2">
                {collections.filter((c) => c.slug !== current?.slug).map((c) => (
                    <li key={c.slug}>
                        <Link href={`/kp-thought-leadership/series/${c.slug}`} className="flex h-full gap-4 rounded-[12px] border border-parchment-400 bg-white p-5 hover:border-gold-500">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink-950 text-gold-400"><Ico name={c.icon} className="size-6" /></span>
                            <span className="min-w-0">
                                <span className="block font-serif text-[1.25rem] font-bold text-ink-900">{c.title}</span>
                                <span className="block text-[0.8125rem] text-ink-600">{c.blurb}</span>
                                <span className="mt-2 block text-[0.75rem] text-ink-500">{c.count} entries | {c.themeLabels.join(', ')}</span>
                                <span className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">Open series <L.ArrowRight className="size-4" aria-hidden="true" /></span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </KpFrame>
    );
}
