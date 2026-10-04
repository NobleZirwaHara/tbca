import { Head } from '@inertiajs/react';
import AdminShell from '@/Components/Portal/AdminShell';
import PortalShell from '@/Components/Portal/PortalShell';
import { ActionButton } from '@/Components/Portal/ActionButton';
import { FilterBar } from '@/Components/Portal/FilterBar';
import { FormsProvider } from '@/Components/Portal/FormModal';
import { Banner, KpiRow, PanelView } from '@/Components/Portal/Panels';
import type { RegisterProps } from '@/types/portal';

/**
 * Generic, server-described portal screen: KPI row, tabs and filters, main
 * panels (tables, charts, cards) and a right rail. Most CP-SCR screens and the
 * /admin/portal consoles render through this page.
 */
export default function Register(props: RegisterProps) {
    const Shell = props.shell === 'admin' ? AdminShell : PortalShell;
    const actions = props.actions?.length ? props.actions.map((a, i) => <ActionButton key={i} action={a} fallbackVariant={i === props.actions!.length - 1 ? 'gold' : 'outline'} />) : undefined;

    return (
        <FormsProvider forms={props.forms}>
            <Head title={props.title} />
            <Shell title={props.title} code={props.code} subtitle={props.subtitle} icon={props.icon} crumbs={props.crumbs ?? [{ label: props.title }]} actions={actions}>
                {props.banner && <Banner {...props.banner} />}
                {props.kpis && props.kpis.length > 0 && <KpiRow kpis={props.kpis} />}
                <div className={props.side?.length ? 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]' : ''}>
                    <div className="min-w-0 space-y-5">
                        <FilterBar tabs={props.tabs} tab={props.tab} filters={props.filters} search={props.search} query={props.query} />
                        {props.main.map((p, i) => (
                            <PanelView key={i} panel={p} />
                        ))}
                    </div>
                    {props.side && props.side.length > 0 && (
                        <aside className="space-y-4">
                            {props.side.map((p, i) => (
                                <PanelView key={i} panel={p} />
                            ))}
                        </aside>
                    )}
                </div>
                {props.footnote && <p className="mt-5 rounded-[8px] border border-controlled-500/20 bg-controlled-50 px-4 py-2.5 text-xs text-controlled-800">{props.footnote}</p>}
            </Shell>
        </FormsProvider>
    );
}

Register.layout = null;
