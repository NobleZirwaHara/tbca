import {
    Accessibility, Activity, Archive, ArrowLeftRight, BadgeCheck, Bell, BookOpen, Bot, Brain, Briefcase, Building, Building2, Calendar,
    ChartColumn, ChartPie, Circle, CirclePause, ClipboardList, Code, Compass, Cpu, CreditCard, Database, DoorOpen, Download, Factory,
    FileCheck, FileLock, FileSearch, FileSignature, FileText, Fingerprint, Flag, Folder, FolderKanban, Gauge, Gavel, GitCommitHorizontal,
    GitPullRequest, Globe, GlobeLock, HandCoins, Handshake, HeartHandshake, History, IdCard, Inbox, KeyRound, Languages, LayoutDashboard,
    LayoutGrid, Library, LifeBuoy, Link, ListChecks, Lock, LogOut, Map, MessageCircle, MessageSquare, MessageSquareHeart, Mic,
    MonitorSmartphone, Network, Package, Plug, Receipt, Recycle, RefreshCw, Repeat, Rocket, RotateCcw, Route, Save, Scale, ScanFace,
    Scroll, Settings, Shield, ShieldAlert, ShieldCheck, ShoppingBag, Sparkles, SquareCheck, Stamp, Store, TrendingUp, TriangleAlert,
    Upload, User, UserPlus, UserRound, Users, UserX, Video, Wallet, WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
    accessibility: Accessibility, activity: Activity, archive: Archive, 'arrow-left-right': ArrowLeftRight, 'badge-check': BadgeCheck,
    bell: Bell, 'book-open': BookOpen, bot: Bot, brain: Brain, briefcase: Briefcase, building: Building, 'building-2': Building2,
    calendar: Calendar, 'bar-chart-3': ChartColumn, 'pie-chart': ChartPie, 'circle-pause': CirclePause, 'clipboard-list': ClipboardList,
    code: Code, compass: Compass, cpu: Cpu, 'credit-card': CreditCard, database: Database, 'door-open': DoorOpen, download: Download,
    factory: Factory, 'file-check': FileCheck, 'file-lock': FileLock, 'file-search': FileSearch, 'file-signature': FileSignature,
    'file-text': FileText, fingerprint: Fingerprint, flag: Flag, folder: Folder, 'folder-kanban': FolderKanban, gauge: Gauge, gavel: Gavel,
    'git-commit': GitCommitHorizontal, 'git-pull-request': GitPullRequest, globe: Globe, 'globe-lock': GlobeLock, 'hand-coins': HandCoins,
    handshake: Handshake, 'heart-handshake': HeartHandshake, history: History, 'id-card': IdCard, inbox: Inbox, 'key-round': KeyRound,
    languages: Languages, 'layout-dashboard': LayoutDashboard, 'layout-grid': LayoutGrid, library: Library, 'life-buoy': LifeBuoy,
    link: Link, 'list-checks': ListChecks, lock: Lock, 'log-out': LogOut, map: Map, 'message-circle': MessageCircle,
    'message-square': MessageSquare, 'message-square-heart': MessageSquareHeart, mic: Mic, 'monitor-smartphone': MonitorSmartphone,
    network: Network, package: Package, plug: Plug, receipt: Receipt, recycle: Recycle, 'refresh-cw': RefreshCw, repeat: Repeat,
    rocket: Rocket, 'rotate-ccw': RotateCcw, route: Route, save: Save, scale: Scale, 'scan-face': ScanFace, scroll: Scroll,
    settings: Settings, shield: Shield, 'shield-alert': ShieldAlert, 'shield-check': ShieldCheck, 'shopping-bag': ShoppingBag,
    sparkles: Sparkles, 'check-square': SquareCheck, stamp: Stamp, store: Store, 'trending-up': TrendingUp, 'alert-triangle': TriangleAlert,
    upload: Upload, user: User, 'user-plus': UserPlus, 'user-round': UserRound, users: Users, 'user-x': UserX, video: Video,
    wallet: Wallet, 'wifi-off': WifiOff,
};

export function portalIcon(name?: string | null): LucideIcon {
    return (name && MAP[name]) || Circle;
}
