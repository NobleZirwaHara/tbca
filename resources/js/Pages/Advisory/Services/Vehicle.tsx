import { Head, Link } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { Card, CheckList, DarkHero, KV, SERVICES_TRUST, TrustBand } from '@/Components/Advisory/ui';

interface V { slug: string; num: string; name: string; icon: string; body: string; pricing: string; commitment: string; ideal: string; href: string; from: number }
interface Cmp { use: string; get: string; who: string; price: string; price_note: string; exit: string; best: string }

export default function VehicleDetail({ vehicle, comparison, others }: { vehicle: V; comparison: Cmp | null; others: V[] }) {
    return (
        <>
            <Head title={vehicle.name} />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: vehicle.name }]}
                eyebrow={`Execution vehicle ${vehicle.num}`}
                title={vehicle.name}
                tagline={vehicle.ideal}
                intro={vehicle.body}
                box={{ title: 'Commercial structure', items: [`Pricing model: ${vehicle.pricing}`, `Commitment: ${vehicle.commitment}`, `Ideal for: ${vehicle.ideal}`, comparison ? `Indicative price: ${comparison.price} ${comparison.price_note}` : 'Price shown on the product page'] }}
            >
                <ButtonLink href={vehicle.href} trailingIcon="arrow-right">Explore {vehicle.name}</ButtonLink>
                <ButtonLink href="/services/resolver/1" variant="outline-light">Is this right for me?</ButtonLink>
            </DarkHero>
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-8">
                    {comparison && (
                        <Card title="How it works" icon={vehicle.icon}>
                            <KV rows={[['Typical use case', comparison.use], ['What you get', comparison.get], ['Who delivers', comparison.who], ['Exit / flexibility', comparison.exit], ['Best for', comparison.best]]} />
                        </Card>
                    )}
                    <Card title="What every vehicle includes" icon="shield-check">
                        <CheckList items={['Published scope and price before you commit', 'Human review where required', 'Separate disclosure of external and statutory costs', 'Clear exit and downgrade rights', 'Portable work product you keep']} />
                    </Card>
                </div>
                <aside className="space-y-3 lg:col-span-4">
                    <h2 className="text-sm font-semibold text-ink-900">Other ways to work with TBCA</h2>
                    {others.map((o) => (
                        <Link key={o.slug} href={`/services/ways-to-work-with-tbca/${o.slug}`} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 hover:border-gold-400">
                            <AdvIcon name={o.icon} className="size-5 text-gold-600" />
                            <span><span className="block text-sm font-semibold text-ink-900">{o.name}</span><span className="block text-xs text-ink-500">{o.pricing} · {o.commitment}</span></span>
                        </Link>
                    ))}
                </aside>
            </div>
            <TrustBand items={SERVICES_TRUST} />
        </>
    );
}
