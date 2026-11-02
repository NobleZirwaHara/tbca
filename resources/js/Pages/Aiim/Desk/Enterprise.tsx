import AiimPage from '@/Components/Aiim/Shell';
import { ADVISOR_HREF, ServiceCard, type ProtoSvc } from '@/Components/Aiim/ProtoDesk';
import { A } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

/** AIIM mock 72: Enterprise Desk (prototype #enterprise). */
export default function Enterprise({ services }: AiimPageProps & { services: ProtoSvc[] }) {
    return (
        <AiimPage
            title="Enterprise Desk"
            crumbs={[{ label: 'Enterprise Desk' }]}
            subtitle="Page 72"
            description="Seats, data feeds, white-label portals and licensing for institutions working on Botswana."
            notice={false}
            rail={<A v="pri" block href={ADVISOR_HREF}>Talk to enterprise sales</A>}
        >
            <div className="grid gap-4 sm:grid-cols-2">{services.map((s) => <ServiceCard key={s.code} s={s} />)}</div>
        </AiimPage>
    );
}
