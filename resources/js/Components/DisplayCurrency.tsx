import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { pinnedToZar, setDisplayCurrency } from '@/lib/money';
import type { SharedProps } from '@/types';

/**
 * Keeps the module-level display currency in step with the visitor's selection.
 * It renders before the page content, so plain helpers such as rand() or zar()
 * format in the selected currency on the same render that the selector changes.
 */
export default function DisplayCurrency({ children }: { children: ReactNode }) {
    const { props, url } = usePage<SharedProps>();
    const path = url.split('?')[0];

    setDisplayCurrency(pinnedToZar(path) ? 'ZAR' : (props.context?.currency ?? 'ZAR'), props.fx?.rates);

    return <>{children}</>;
}
