import {
    Atom, BarChart3, BatteryCharging, Bell, Bot, Briefcase, Building2, Car, ChartLine, Circle, ClipboardList, Coins, Cpu, Database, Factory,
    FileText, Gauge, Globe, Info, Landmark, Languages, Leaf, Lock, Network, Pickaxe, RefreshCw, Route, Server, Ship, ShieldCheck, Smartphone,
    Sun, Target, TrainFront, TrendingUp, Trophy, Truck, UserCheck, Users, Warehouse, Wheat, Wind, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const registry: Record<string, LucideIcon> = {
    atom: Atom, 'bar-chart-3': BarChart3, 'battery-charging': BatteryCharging, bell: Bell, bot: Bot, briefcase: Briefcase, 'building-2': Building2,
    car: Car, 'chart-line': ChartLine, 'clipboard-list': ClipboardList, coins: Coins, cpu: Cpu, database: Database, factory: Factory,
    'file-text': FileText, gauge: Gauge, globe: Globe, info: Info, landmark: Landmark, languages: Languages, leaf: Leaf, lock: Lock,
    network: Network, pickaxe: Pickaxe, 'refresh-cw': RefreshCw, route: Route, server: Server, ship: Ship, 'shield-check': ShieldCheck,
    smartphone: Smartphone, sun: Sun, target: Target, 'train-front': TrainFront, 'trending-up': TrendingUp, trophy: Trophy, truck: Truck,
    'user-check': UserCheck, users: Users, warehouse: Warehouse, wheat: Wheat, wind: Wind, zap: Zap,
};

/** Icon by kebab-case name for data-driven AIIM records; falls back to a circle. */
export default function AiimIcon({ name, className = 'size-5' }: { name: string; className?: string }) {
    const Icon = registry[name] ?? Circle;
    return <Icon className={className} aria-hidden="true" />;
}
