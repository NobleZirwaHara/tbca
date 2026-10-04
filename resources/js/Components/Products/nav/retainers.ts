import { AlarmClock, BarChart3, Briefcase, FlaskConical, Hourglass, Ban, Radar, Shuffle, UsersRound, Warehouse } from 'lucide-react';
import type { ConsoleNavGroup, ConsoleNavItem } from '@/Layouts/ConsoleLayout';

/**
 * Admin console navigation for the Retainers family (/admin/products/retainers/...).
 * The Retainers builder owns this file and may adjust the items to match the built consoles.
 */
export const retainersAdminNav: ConsoleNavGroup = {
    title: 'Retainers',
    items: [
        { label: 'Capacity Test Workbench', href: '/admin/products/retainers/capacity-test', icon: FlaskConical },
        { label: 'Capacity Commitments', href: '/admin/products/retainers/capacity-register', icon: Warehouse },
        { label: 'Allocation & Owners', href: '/admin/products/retainers/allocation', icon: UsersRound },
        { label: 'Under-Use Alerts', href: '/admin/products/retainers/under-use', icon: AlarmClock },
        { label: 'Scope-Creep Monitor', href: '/admin/products/retainers/scope-creep', icon: Radar },
        { label: 'Profitability by Client', href: '/admin/products/retainers/profitability', icon: BarChart3 },
        { label: 'Below-Floor Blocks', href: '/admin/products/retainers/below-floor', icon: Ban },
        { label: 'Substitution & Continuity', href: '/admin/products/retainers/substitution', icon: Shuffle },
        { label: 'Rollover Liability', href: '/admin/products/retainers/rollover', icon: Hourglass },
    ],
};

/** Signed-in client workspace links for Retainers. */
export const retainersWorkspaceNav: ConsoleNavItem[] = [{ label: 'My Retainers', href: '/retainers/account', icon: Briefcase }];
