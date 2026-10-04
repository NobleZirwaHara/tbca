import {
    Activity, BarChart3, Bell, Bot, Briefcase, Building2, Calculator, CalendarCheck, ClipboardCheck, Cloud, Compass, Coins, Cpu, Database, DoorOpen,
    FileBarChart, FileCheck, FileCode, FileSearch, FileText, Gem, Globe, GraduationCap, Handshake, HeartPulse, Landmark, LayoutTemplate, Leaf, LifeBuoy,
    Lightbulb, Lock, Map, Megaphone, Pickaxe, Palmtree, Receipt, Repeat, Scale, Settings, Share2, ShieldAlert, ShieldCheck, Sprout, Target, TrendingUp,
    Truck, User, Users, UsersRound, Wifi, Zap, Clock, BadgeCheck, Factory,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

const icons: Record<string, LucideIcon> = {
    activity: Activity, 'bar-chart-3': BarChart3, bell: Bell, bot: Bot, briefcase: Briefcase, 'building-2': Building2, calculator: Calculator,
    'calendar-check': CalendarCheck, 'clipboard-check': ClipboardCheck, cloud: Cloud, compass: Compass, coins: Coins, cpu: Cpu, database: Database,
    'door-open': DoorOpen, 'file-bar-chart': FileBarChart, 'file-check': FileCheck, 'file-code': FileCode, 'file-search': FileSearch, 'file-text': FileText,
    gem: Gem, globe: Globe, 'graduation-cap': GraduationCap, handshake: Handshake, 'heart-pulse': HeartPulse, landmark: Landmark,
    'layout-template': LayoutTemplate, leaf: Leaf, 'life-buoy': LifeBuoy, lightbulb: Lightbulb, lock: Lock, map: Map, megaphone: Megaphone,
    pickaxe: Pickaxe, palmtree: Palmtree, receipt: Receipt, repeat: Repeat, scale: Scale, settings: Settings, 'share-2': Share2,
    'shield-alert': ShieldAlert, 'shield-check': ShieldCheck, sprout: Sprout, target: Target, 'trending-up': TrendingUp, truck: Truck, user: User,
    users: Users, 'users-round': UsersRound, wifi: Wifi, zap: Zap, clock: Clock, 'badge-check': BadgeCheck, factory: Factory,
};

export function iconFor(name?: string | null): LucideIcon {
    return (name && icons[name]) || Target;
}

/** Black square product tile with a gold line icon (the shop's product imagery treatment). */
export default function ShopIcon({ name, size = 'md', tone = 'gold', className }: { name?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl'; tone?: 'gold' | 'green' | 'red'; className?: string }) {
    const Icon = iconFor(name);
    const box = { sm: 'size-10 rounded-[6px]', md: 'size-14 rounded-[8px]', lg: 'size-20 rounded-[10px]', xl: 'size-36 rounded-[12px] md:size-40' }[size];
    const glyph = { sm: 'size-5', md: 'size-7', lg: 'size-10', xl: 'size-16 md:size-20' }[size];
    const color = { gold: 'text-gold-400', green: 'text-verified-500', red: 'text-risk-500' }[tone];

    return (
        <span className={cn('inline-flex shrink-0 items-center justify-center bg-ink-950 ring-1 ring-ink-800', box, className)} aria-hidden="true">
            <Icon className={cn(glyph, color)} strokeWidth={1.5} />
        </span>
    );
}
