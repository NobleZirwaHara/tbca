import { Activity, AlarmClock, Ban, CalendarClock, CalendarRange, Gauge, Landmark, Layers, PieChart, Repeat, Users } from 'lucide-react';
import type { ConsoleNavGroup, ConsoleNavItem } from '@/Layouts/ConsoleLayout';

/** Admin console navigation for the Subscriptions family (/admin/products/subscriptions/...). */
export const subscriptionsAdminNav: ConsoleNavGroup = {
    title: 'Subscriptions',
    items: [
        { label: 'Subscriptions Console', href: '/admin/products/subscriptions', icon: Gauge },
        { label: 'Recurrence Test Workbench', href: '/admin/products/subscriptions/recurrence-test', icon: Repeat },
        { label: 'Catalogue & Class Register', href: '/admin/products/subscriptions/catalogue', icon: Layers },
        { label: 'Deferred Revenue', href: '/admin/products/subscriptions/deferred-revenue', icon: Landmark },
        { label: 'Billing Calendar & Runs', href: '/admin/products/subscriptions/billing-calendar', icon: CalendarClock },
        { label: 'Dunning & Involuntary Churn', href: '/admin/products/subscriptions/dunning', icon: AlarmClock },
        { label: 'Engagement & Disuse Queue', href: '/admin/products/subscriptions/engagement', icon: Activity },
        { label: 'Recurring Delivery Calendar', href: '/admin/products/subscriptions/delivery-calendar', icon: CalendarRange },
        { label: 'Review Capacity vs Book', href: '/admin/products/subscriptions/review-capacity', icon: Users },
        { label: 'Churn Analysis by Cause', href: '/admin/products/subscriptions/churn', icon: PieChart },
        { label: 'Below-Floor Block Monitor', href: '/admin/products/subscriptions/below-floor', icon: Ban },
    ],
};

/** Signed-in client workspace links for Subscriptions. */
export const subscriptionsWorkspaceNav: ConsoleNavItem[] = [{ label: 'My Subscriptions', href: '/subscriptions/account', icon: Repeat }];
