import { Head } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero, { AsideCard, InfoCard, NoticeBand } from '@/Components/About/AboutHero';

type Tone = 'gold' | 'purple' | 'green' | 'blue' | 'red' | 'orange';

interface CardData {
    title: string;
    icon: string;
    tone: Tone;
    body: string;
    items: string[];
    link: { label: string; href: string };
}

export default function AiDisclosure({ cards }: { cards: CardData[] }) {
    return (
        <>
            <Head title="AI Disclosure" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'AI Disclosure' }]}
                title="AI Disclosure"
                lead="Transparency about our use of Artificial Intelligence."
                intro="We use Artificial Intelligence (AI) tools to enhance research, analysis, content creation and operational efficiency. Human expertise, judgment and responsibility remain at the centre of everything we deliver."
                aside={
                    <AsideCard
                        icon="shield-check"
                        title="Our Commitment"
                        body="We are transparent about how we use AI, how it influences our work, and the safeguards we apply to protect accuracy, fairness and privacy."
                        link={{ label: 'View Our AI Governance Framework', href: '/about/governance' }}
                    />
                }
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {cards.map((c) => (
                            <InfoCard key={c.title} icon={c.icon} title={c.title} body={c.body} items={c.items} link={c.link} tone={c.tone} marker="check" />
                        ))}
                    </div>
                    <NoticeBand
                        tone="blue"
                        className="mt-6"
                        action={
                            <ButtonLink href="/about/ai-disclosure/notice" variant="outline" trailingIcon="arrow-right">
                                Read Our Full AI Disclosure Policy
                            </ButtonLink>
                        }
                    >
                        <span className="font-semibold">Important:</span> AI outputs may be incomplete, outdated or incorrect. Always seek professional advice for decisions that affect your business, finances or legal obligations.
                    </NoticeBand>
                </div>
            </section>
        </>
    );
}
