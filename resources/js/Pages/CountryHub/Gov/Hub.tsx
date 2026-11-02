/* P49 to P84 Governance & Admin hub (prototype pages-gov.js #/c/{ISO}/gov). */
import { Link } from '@inertiajs/react';
import { Card, Cols, Note, Ticks } from '@/Components/Industries/Kit';
import { GOV, GovPage, govHref } from '@/Components/CountryHub/Gov';
import type { CountryBase } from '@/types/countryHub';

export default function Hub({ base }: { base: CountryBase }) {
    const { c } = base;
    return (
        <GovPage c={c} k="" sub="Public registers, sovereign client workspace and the admin consoles behind the Countries tab.">
            <Cols n={3}>
                {GOV.map(([g, l]) => (
                    <Card key={g} title={g} icon="shield">
                        <Ticks items={l.map(([k, n, p]) => <span key={k}><Link className="text-controlled-700 hover:underline" href={govHref(c, k)}>{n}</Link> <span className="text-[0.7rem] text-ink-400">{p}</span></span>)} />
                    </Card>
                ))}
            </Cols>
            <Note>Governance and admin pages are where TBCA proves its numbers. For {c.name} they read {c.isBW ? 'the BW-1.0 registers directly' : 'the country object and its placeholders'}.</Note>
        </GovPage>
    );
}
