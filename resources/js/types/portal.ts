/* Client Portal types. Shapes mirror app/Support/Portal/Ui.php and the portal controllers. */

export type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'gold' | 'dark';

export interface PortalNavItem {
    label: string;
    href: string;
    icon: string;
    badge?: string | number;
}

export interface PortalNavGroup {
    title: string;
    key?: string;
    icon?: string;
    description?: string;
    items: PortalNavItem[];
}

export interface PortalAction {
    label: string;
    href?: string | null;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: Record<string, unknown>;
    confirm?: string;
    modal?: string;
    variant?: 'gold' | 'outline' | 'ghost' | 'danger' | 'ink';
    icon?: string;
    external?: boolean;
    download?: boolean;
}

export type Cell =
    | string
    | number
    | null
    | { t: 'ref'; v: string; href?: string | null }
    | { t: 'pill'; v: string; tone?: Tone | null }
    | { t: 'money'; v: number | null; signed?: boolean }
    | { t: 'progress'; v: number; label?: string | null }
    | { t: 'link'; v: string; href: string }
    | { t: 'stack'; v: string; sub?: string | null; href?: string | null }
    | { t: 'chips'; v: string[] }
    | { t: 'person'; v: string; sub?: string | null }
    | { t: 'actions'; v: PortalAction[] };

export interface Kpi {
    label: string;
    value: string | number;
    caption?: string | null;
    tone?: Tone;
    icon?: string | null;
    href?: string | null;
}

export interface Pagination {
    page: number;
    pages: number;
    total: number;
    per: number;
}

export interface Slice {
    label: string;
    value: number;
    tone: string;
    display?: string | null;
}

export interface ListItem {
    label: string;
    value?: string;
    sub?: string;
    tone?: Tone;
    href?: string;
}

export interface LinkRef {
    label: string;
    href: string;
}

export interface FieldSpec {
    name: string;
    label: string;
    type: 'text' | 'email' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox' | 'file' | 'radio' | 'password' | 'checkboxes' | 'hidden';
    options?: { value: string; label: string; hint?: string }[];
    required?: boolean;
    value?: unknown;
    hint?: string;
    placeholder?: string;
    readonly?: boolean;
    span?: 1 | 2;
}

export interface FormSpec {
    title: string;
    action: string;
    method?: 'post' | 'put' | 'patch' | 'delete';
    submit: string;
    intro?: string | null;
    fields: FieldSpec[];
}

export interface Card {
    title: string;
    body?: string | null;
    meta?: string | null;
    href?: string | null;
    icon?: string | null;
    tone?: Tone | null;
    actions?: PortalAction[];
}

export type Panel =
    | { kind: 'table'; title?: string | null; columns: string[]; rows: Cell[][]; empty?: string; pagination?: Pagination; link?: LinkRef | null; caption?: string; footer?: Cell[] }
    | { kind: 'donut'; title: string; items: Slice[]; center: string; centerLabel?: string | null; link?: LinkRef | null }
    | { kind: 'list'; title: string; items: ListItem[]; link?: LinkRef | null }
    | { kind: 'actions'; title: string; items: PortalAction[] }
    | { kind: 'info'; title: string; body: string; tone?: Tone; cta?: PortalAction | null }
    | { kind: 'kv'; title: string; rows: [string, Cell][]; cta?: PortalAction | null }
    | { kind: 'bars'; title: string; items: { label: string; value: number; display?: string | null; tone?: string | null }[]; link?: LinkRef | null }
    | { kind: 'timeline'; title: string; items: { title: string; sub?: string; meta?: string; tone?: Tone }[]; link?: LinkRef | null }
    | { kind: 'gauge'; title: string; value: number; label: string; items?: Slice[] }
    | { kind: 'checklist'; title: string; items: { label: string; ok: boolean | string; value?: string | null }[] }
    | { kind: 'steps'; title: string; steps: { label: string; sub?: string }[]; current: number }
    | { kind: 'text'; title: string; body: string }
    | { kind: 'cards'; title: string; cards: Card[]; cols?: number }
    | { kind: 'row'; panels: Panel[] }
    | { kind: 'chart'; title: string; labels: string[]; series: { label: string; tone: string; values: number[] }[]; type: 'stacked' | 'line' | 'bars'; note?: string | null }
    | { kind: 'form'; title: string; form: FormSpec };

export interface RegisterProps {
    shell: 'client' | 'admin';
    title: string;
    code?: string | null;
    subtitle?: string | null;
    icon?: string | null;
    crumbs?: { label: string; href?: string }[];
    actions?: PortalAction[];
    banner?: { tone: Tone; title: string; body?: string; meta?: string } | null;
    kpis?: Kpi[];
    tabs?: { key: string; label: string; count?: number }[];
    tab?: string;
    filters?: { name: string; label: string; options: { value: string; label: string }[] }[];
    search?: string | null;
    query?: Record<string, string>;
    main: Panel[];
    side?: Panel[];
    footnote?: string | null;
    forms?: Record<string, FormSpec>;
}

export interface JourneyStep {
    key: string;
    title: string;
    description?: string;
    fields: FieldSpec[];
}

export interface JourneyProps {
    journey: string;
    title: string;
    code?: string | null;
    subtitle?: string | null;
    icon?: string | null;
    reference?: string | null;
    status: string;
    step: number;
    steps: JourneyStep[];
    data: Record<string, unknown>;
    side: Panel[];
    done?: { title: string; body: string; links: PortalAction[] } | null;
    banner?: { tone: Tone; title: string; body?: string; meta?: string } | null;
}
