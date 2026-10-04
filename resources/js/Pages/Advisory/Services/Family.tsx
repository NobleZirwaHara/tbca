import { Head } from '@inertiajs/react';
import { Scale } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { ArrowLink, CheckList, DarkHero, SERVICES_TRUST, TrustBand } from '@/Components/Advisory/ui';
import { FitBand, NotSureBox, WaysGrid, type Way } from '@/Components/Advisory/Ways';

interface Family {
    title: string;
    tagline: string;
    intro: string;
    boxTitle: string;
    box: string[];
    areasTitle: string;
    areas: { title: string; body: string; icon: string; href: string }[];
    ways: Way[];
    aside: { title: string; body: string } | null;
    about: { title: string; body: string; items: string[] } | null;
    boundary: boolean;
}

export default function FamilyPage({ family }: { family: Family; slug: string }) {
    return (
        <>
            <Head title={family.title} />
            <DarkHero crumbs={[{ label: 'Services', href: '/services' }, { label: 'Capability Families' }, { label: family.title }]} title={family.title} tagline={family.tagline} intro={family.intro} box={{ title: family.boxTitle, items: family.box }} />
            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-12">
                <section className={family.about ? 'lg:col-span-4' : 'lg:col-span-6'}>
                    <h2 className="font-serif text-xl font-semibold text-ink-900">{family.areasTitle}</h2>
                    <div className={family.about ? 'mt-3 grid gap-3' : 'mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'}>
                        {family.areas.map((a) => (
                            <article key={a.title} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-3.5">
                                <div className="flex gap-2.5">
                                    <AdvIcon name={a.icon} className="size-6 shrink-0 text-ink-800" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-ink-900">{a.title}</h3>
                                        <p className="mt-0.5 text-xs text-ink-600">{a.body}</p>
                                    </div>
                                </div>
                                <ArrowLink href={a.href} className="mt-2">Explore</ArrowLink>
                            </article>
                        ))}
                    </div>
                </section>
                <section className={family.about ? 'lg:col-span-5' : 'lg:col-span-4'}>
                    <h2 className="font-serif text-xl font-semibold text-ink-900">Ways to work with us</h2>
                    <div className="mt-3">
                        <WaysGrid ways={family.ways} />
                    </div>
                    {family.boundary && (
                        <div className="mt-4 flex flex-col items-start gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:flex-row sm:items-center">
                            <Scale className="size-8 shrink-0 text-ink-800" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-ink-900">Professional boundaries</p>
                                <p className="text-xs text-ink-600">Where specialist or regulated advice is required, we work with qualified Partners. We will route you appropriately.</p>
                            </div>
                            <ButtonLink href="/partner-services" size="sm" variant="outline">View Partner Services</ButtonLink>
                        </div>
                    )}
                </section>
                <aside className="space-y-4 lg:col-span-2 lg:min-w-[220px]">
                    {family.aside && (
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <p className="text-sm font-semibold text-ink-900">{family.aside.title}</p>
                            <p className="mt-1 text-xs text-ink-600">{family.aside.body}</p>
                        </div>
                    )}
                    {family.about && (
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <p className="text-sm font-semibold text-ink-900">{family.about.title}</p>
                            <p className="mt-1 text-xs text-ink-600">{family.about.body}</p>
                            <CheckList className="mt-2" items={family.about.items} />
                        </div>
                    )}
                    <NotSureBox title={`Not sure if ${family.title} is right for you?`} />
                </aside>
            </div>
            <FitBand dark={family.boundary} />
            <TrustBand items={SERVICES_TRUST} />
        </>
    );
}
