import { Head, Link, router } from '@inertiajs/react';
import { Clock, ShoppingBag, UserCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { ArrowLink, Card, CheckList, DarkHero, KV, SERVICES_TRUST, TrustBand } from '@/Components/Advisory/ui';
import { usePrice } from '@/lib/money';

interface Props {
    service: { slug: string; letter: string; sub_category: string; title: string; summary: string; price_zar: number; duration: string; delivery: string };
    category: string;
    related: { slug: string; title: string; price_zar: number; duration: string }[];
    sprints: { slug: string; title: string; summary: string; price_zar: number; delivery: string | null; category: string }[];
    vat: number;
}

export default function ServiceDetail({ service, category, related, sprints, vat }: Props) {
    const price = usePrice();
    const add = (checkout: boolean) =>
        router.post('/basket', { item_type: 'service', item_code: `SVC-${service.slug}`, name: service.title, unit_zar: service.price_zar, commercial_act: 'sprint', checkout }, { preserveScroll: true });

    return (
        <>
            <Head title={service.title} />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'A-Z', href: `/services/a-z?letter=${service.letter}` }, { label: service.title }]}
                eyebrow={`${service.letter} · ${category}`}
                title={service.title}
                tagline={service.sub_category}
                intro={service.summary}
                box={{ title: 'Sprint at a glance', items: [`Fixed price from ${price(service.price_zar)} (excl. VAT)`, `Delivery in ${service.duration}`, service.delivery, 'Human reviewed before release', 'Portable work product you keep'] }}
            >
                <Button onClick={() => add(true)} trailingIcon="arrow-right">
                    Buy this Sprint
                </Button>
                <Button variant="outline-light" onClick={() => add(false)}>
                    Add to Basket
                </Button>
            </DarkHero>
            <div className="container-tbca grid gap-6 py-10 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-8">
                    <Card title="What you get" icon="clipboard-check">
                        <CheckList items={[service.summary, 'Kick-off call to confirm scope and inputs', 'Structured working papers and final deliverable pack', 'Senior review and sign-off before release', 'Next-step recommendation (including whether a bigger vehicle is needed)']} />
                    </Card>
                    <Card title="Recommended sprints from the TBCA catalogue" icon="target">
                        {sprints.length === 0 && <p className="text-sm text-ink-500">No related catalogue sprints yet.</p>}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {sprints.map((s) => (
                                <Link key={s.slug} href={`/sprints/${s.slug}`} className="rounded-[6px] border border-parchment-400 p-3 hover:border-gold-400">
                                    <p className="text-[0.6875rem] font-semibold text-gold-700 capitalize">{s.category.replace(/-/g, ' ')}</p>
                                    <p className="text-sm font-semibold text-ink-900">{s.title}</p>
                                    <p className="mt-1 line-clamp-2 text-xs text-ink-600">{s.summary}</p>
                                    <p className="mt-2 text-xs font-semibold text-ink-800">{s.price_zar ? `From ${price(s.price_zar)}` : 'Quote on request'}</p>
                                </Link>
                            ))}
                        </div>
                    </Card>
                    <Card title="Not sure a Sprint is the right vehicle?" icon="help-circle">
                        <p className="text-sm text-ink-600">The same capability can be delivered as a Sprint, Digital Product, Subscription, Retainer, Project Advisory mandate or through a Partner. We show every viable option with equal visibility.</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                            <ButtonLink href="/services/resolver/1" size="sm">Find the Right Service</ButtonLink>
                            <ButtonLink href="/services/ways-to-work-with-tbca" size="sm" variant="outline">All Ways to Work with TBCA</ButtonLink>
                        </div>
                    </Card>
                </div>
                <aside className="space-y-4 lg:col-span-4">
                    <Card title="Price summary">
                        <KV rows={[['Sprint fee (excl. VAT)', price(service.price_zar)], ['VAT (15%)', price(vat)], ['Platform fee', 'At checkout'], ['Duration', <span className="inline-flex items-center gap-1"><Clock className="size-3" />{service.duration}</span>], ['Review', <span className="inline-flex items-center gap-1"><UserCheck className="size-3" />Human reviewed</span>]]} />
                        <Button onClick={() => add(false)} variant="ink" className="mt-4 w-full" icon="shopping-bag">
                            Add to Basket
                        </Button>
                        <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-500"><ShoppingBag className="size-3" />Prices are source ZAR; USD shown for display only.</p>
                    </Card>
                    <Card title={`More in ${service.letter}`}>
                        <ul className="space-y-2">
                            {related.map((r) => (
                                <li key={r.slug} className="flex items-center justify-between gap-2 text-sm">
                                    <Link href={`/services/catalogue/${r.slug}`} className="font-medium text-ink-800 hover:text-gold-700">{r.title}</Link>
                                    <span className="text-xs text-ink-500">{price(r.price_zar)}</span>
                                </li>
                            ))}
                        </ul>
                        <ArrowLink href={`/services/a-z?letter=${service.letter}`} className="mt-3">Back to {service.letter} category</ArrowLink>
                    </Card>
                </aside>
            </div>
            <TrustBand items={SERVICES_TRUST} />
        </>
    );
}
