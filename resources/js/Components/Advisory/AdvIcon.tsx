import {
    Activity, BadgeCheck, BarChart3, Bell, Bot, Boxes, Briefcase, Building, Building2, Calculator, CalendarDays, Check, CircleHelp, ClipboardCheck,
    ClipboardList, Compass, Cpu, Factory, FileText, Flag, Gauge, Globe, GraduationCap, Handshake, HeartPulse, Landmark, Layers, LifeBuoy, Lightbulb,
    ListChecks, Lock, Map, Megaphone, Monitor, Move, Network, Package, Palmtree, PenTool, Phone, Plug, Plus, Receipt, RefreshCw, Rocket, Scale, Search,
    Settings, Shield, ShieldCheck, ShoppingBag, Store, Target, TrainFront, TrendingUp, Truck, User, UserCheck, Users, UsersRound, Wallet, Wheat, Workflow, Zap,
    ShoppingCart, Pickaxe, Luggage, HandHeart, Stethoscope, Clapperboard, Banknote,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const registry: Record<string, LucideIcon> = {
    activity: Activity, 'badge-check': BadgeCheck, 'bar-chart-3': BarChart3, bell: Bell, bot: Bot, boxes: Boxes, briefcase: Briefcase, building: Building,
    'building-2': Building2, calculator: Calculator, 'calendar-days': CalendarDays, check: Check, 'help-circle': CircleHelp, 'clipboard-check': ClipboardCheck,
    'clipboard-list': ClipboardList, compass: Compass, cpu: Cpu, factory: Factory, 'file-text': FileText, flag: Flag, gauge: Gauge, globe: Globe,
    'graduation-cap': GraduationCap, handshake: Handshake, 'heart-pulse': HeartPulse, landmark: Landmark, layers: Layers, 'life-buoy': LifeBuoy,
    lightbulb: Lightbulb, 'list-checks': ListChecks, lock: Lock, map: Map, megaphone: Megaphone, monitor: Monitor, move: Move, network: Network,
    package: Package, palmtree: Palmtree, 'pen-tool': PenTool, phone: Phone, plug: Plug, plus: Plus, receipt: Receipt, 'refresh-cw': RefreshCw, rocket: Rocket,
    scale: Scale, search: Search, settings: Settings, shield: Shield, 'shield-check': ShieldCheck, 'shopping-bag': ShoppingBag, store: Store, target: Target,
    'train-front': TrainFront, 'trending-up': TrendingUp, truck: Truck, user: User, 'user-check': UserCheck, users: Users, 'users-round': UsersRound,
    wallet: Wallet, wheat: Wheat, workflow: Workflow, zap: Zap,
    'shopping-cart': ShoppingCart, pickaxe: Pickaxe, luggage: Luggage, 'hand-heart': HandHeart, stethoscope: Stethoscope, clapperboard: Clapperboard, banknote: Banknote,
};

export default function AdvIcon({ name, className }: { name?: string | null; className?: string }) {
    const Icon = (name && registry[name]) || Layers;
    return <Icon className={className ?? 'size-5'} aria-hidden="true" />;
}
