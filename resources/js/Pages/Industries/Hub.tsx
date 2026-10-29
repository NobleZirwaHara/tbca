import { A, CatChip, Chip, Ic, IICON, Tile, TileGrid } from '@/Components/Industries/Kit';
import { Head1, PlainPage, iHref } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

interface Props extends IndustryBase {
    title: string;
    desc: string;
    path: string;
    href: string;
    all: { code: string; slug: string; name: string; cat: string; variant: string }[];
}

export default function Hub({ ind, title, desc, path, all }: Props) {
    return (
        <PlainPage title={title} crumbs={[['Industries', '/industries'], [title]]}>
            <Head1 eyebrow="Industries" title={title} desc={desc} act={<A v="pri" href={iHref(ind, path)}>Continue with {ind.name} →</A>} />
            <TileGrid>
                {all.map((x) => (
                    <Tile key={x.code} href={iHref(x, path)} on={x.code === ind.code}>
                        <span className="grid grid-cols-[minmax(0,1fr)] size-8 place-items-center rounded-[6px] bg-ink-900 text-gold-400"><Ic n={IICON[x.code]} /></span>
                        <b className="text-[0.88rem] leading-snug">{x.name}</b>
                        <span className="flex flex-wrap gap-1"><CatChip cat={x.cat} />{x.variant === 'Highly regulated' && <Chip t="Regulated" tone="bad" />}</span>
                    </Tile>
                ))}
            </TileGrid>
        </PlainPage>
    );
}
