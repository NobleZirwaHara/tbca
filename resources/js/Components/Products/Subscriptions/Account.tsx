import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, Headphones } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ProductsWorkspaceLayout } from '@/Components/Products/Layouts';
import { LabelValues } from '@/Components/Products/Shared';
import type { SharedProps } from '@/types';
import { Card, SubStatus, fmtDate, subscriptionNav, zar } from './ui';
import type { SubSubscription } from './types';

/** Signed-in workspace frame for one subscription record (/subscriptions/account/{ref}/...). */
export function AccountShell({ sub, title, crumb, actions, children }: { sub: SubSubscription; title: string; crumb?: string; actions?: ReactNode; children: ReactNode }) {
    const { errors } = usePage<SharedProps & { errors: Record<string, string> }>().props;
    const list = Object.values(errors ?? {});

    return (
        <ProductsWorkspaceLayout
            title={title}
            actions={actions}
            context={subscriptionNav(sub)}
            crumbs={[
                { label: 'Client Portal', href: '/portal' },
                { label: 'Subscriptions', href: '/subscriptions/account' },
                ...(crumb ? [{ label: sub.plan.name, href: `/subscriptions/account/${sub.reference}` }, { label: crumb }] : [{ label: sub.plan.name }]),
            ]}
        >
            {list.length > 0 && (
                <div role="alert" className="mb-4 rounded-[8px] border border-risk-500/30 bg-risk-50 p-3 text-[0.8125rem] text-risk-700">
                    {list.map((e) => (
                        <p key={e}>{e}</p>
                    ))}
                </div>
            )}
            {children}
        </ProductsWorkspaceLayout>
    );
}

/** Right-rail plan summary used on most record pages. */
export function SummaryCard({ sub, title = 'Your Subscription Summary', extra = [], children }: { sub: SubSubscription; title?: string; extra?: { label: ReactNode; value: ReactNode; strong?: boolean }[]; children?: ReactNode }) {
    const card = sub.mandate?.last4 ? `${(sub.mandate.brand ?? 'VISA').toUpperCase()} •••• ${sub.mandate.last4}` : 'On file';
    return (
        <Card title={title}>
            <LabelValues
                rows={[
                    { label: 'Plan', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                    { label: 'Price (ex VAT)', value: `${zar(sub.price_zar)} / ${sub.billing_interval === 'annual' ? 'year' : 'month'}` },
                    { label: 'Billing period', value: `${sub.billing_interval === 'annual' ? 'Annual' : 'Monthly'} in advance` },
                    { label: 'Status', value: <SubStatus status={sub.display_status} /> },
                    { label: 'Payment method', value: card },
                    { label: 'Next charge date', value: fmtDate(sub.next_charge_at) },
                    ...extra,
                ]}
            />
            {children}
        </Card>
    );
}

export function HelpCard({ sub, title = 'Need help?', body = 'Our specialists are here to help you manage your subscription or answer any questions.' }: { sub: SubSubscription; title?: string; body?: string }) {
    return (
        <Card title={title}>
            <p className="text-xs text-ink-600">{body}</p>
            <button
                type="button"
                onClick={() => openAskQuestion({ subject: `${sub.plan.name} (${sub.reference})`, section: 'subscriptions' })}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-referenced-700 hover:underline"
            >
                <Headphones className="size-4" aria-hidden="true" /> Talk to a Specialist →
            </button>
        </Card>
    );
}

/** Equal-weight option rows (renewal options, disuse choices, what you can do). */
export function OptionRows({ items }: { items: { icon: LucideIcon; title: string; body: string; href?: string; onClick?: () => void }[] }) {
    return (
        <ul className="divide-y divide-parchment-300">
            {items.map(({ icon: Icon, title, body, href, onClick }) => {
                const inner = (
                    <>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-referenced-50 text-referenced-700">
                            <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[0.8125rem] font-semibold text-ink-900">{title}</span>
                            <span className="block text-xs text-ink-500">{body}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                    </>
                );
                return (
                    <li key={title}>
                        {href ? (
                            <Link href={href} className="flex items-center gap-3 py-3 hover:bg-parchment-100">
                                {inner}
                            </Link>
                        ) : (
                            <button type="button" onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left hover:bg-parchment-100">
                                {inner}
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

/** Small primary button styled for the subscriptions workspace (purple accent from the mockups). */
export function PurpleButton({ children, onClick, disabled, type = 'button', tone = 'purple' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; tone?: 'purple' | 'outline' | 'danger' | 'gold' }) {
    const tones = {
        purple: 'border-referenced-500 bg-referenced-500 text-white hover:bg-referenced-700',
        outline: 'border-parchment-500 bg-white text-ink-800 hover:border-ink-900',
        danger: 'border-risk-500/50 bg-white text-risk-700 hover:bg-risk-50',
        gold: 'border-gold-500 bg-gold-500 text-ink-900 hover:bg-gold-400',
    }[tone];
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex h-10 items-center justify-center gap-2 rounded-[4px] border px-4 text-sm font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 ${tones}`}>
            {children}
        </button>
    );
}
