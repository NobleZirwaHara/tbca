import { usePage } from '@inertiajs/react';
import WhatYouWillReceive, { type DeliverableTier, type ReceivedDeliverable } from '@/Components/Sprints/WhatYouWillReceive';

interface ProductDeliverables {
    items: ReceivedDeliverable[];
    tierAliases: Record<string, DeliverableTier>;
}

/**
 * "What you will receive" on product pages other than Sprints (Due Diligence families,
 * digital products, subscriptions, retainers, technology towers and others). The server
 * shares `productDeliverables` only on those pages, so the layouts can render this
 * everywhere and it shows nothing elsewhere.
 */
export default function ProductDeliverablesPanel() {
    const data = usePage<{ productDeliverables?: ProductDeliverables | null }>().props.productDeliverables;
    const query = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('package') : null;

    if (!data || data.items.length === 0) return null;

    return <WhatYouWillReceive key={data.items.map((i) => i.ref).join('|')} deliverables={data.items} selectedPackage={query} tierAliases={data.tierAliases} />;
}
