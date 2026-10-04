import { FileText } from 'lucide-react';
import AfricaMark from '@/Components/AfricaMark';
import { cn } from '@/lib/cn';

/** 3D-style dark book cover used for template products (CSS only, no imagery). */
export function TemplateCover({ lines, formatTag, className, small = false }: { lines: string[]; formatTag?: string | null; className?: string; small?: boolean }) {
    return (
        <div className={cn('relative [perspective:900px]', className)} aria-hidden="true">
            <div
                className={cn(
                    'relative flex flex-col justify-between overflow-hidden rounded-r-[6px] rounded-l-[2px] border border-gold-600 bg-gradient-to-br from-ink-800 via-ink-950 to-black shadow-[12px_14px_30px_-10px_rgba(0,0,0,0.8)] [transform:rotateY(-14deg)]',
                    small ? 'h-14 w-11 p-1' : 'h-56 w-40 p-3',
                )}
            >
                <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black to-ink-800" />
                {!small && (
                    <>
                        <div className="pl-2">
                            {lines.map((l) => (
                                <p key={l} className="font-serif text-[0.9375rem] leading-tight font-bold tracking-wide text-gold-400 uppercase">
                                    {l}
                                </p>
                            ))}
                        </div>
                        <FileText className="mx-auto size-12 text-gold-500/80" strokeWidth={1} />
                        <div className="flex items-end justify-between pl-2">
                            {formatTag ? <span className="rounded border border-verified-500 px-1.5 text-[0.625rem] font-bold text-verified-500">{formatTag}</span> : <span />}
                            <AfricaMark className="size-6 text-gold-500" />
                        </div>
                    </>
                )}
                {small && <FileText className="m-auto size-5 text-gold-400" />}
            </div>
        </div>
    );
}

/** Mock document page rendered from a short description string. */
export function DocPage({ label, className, tall = false }: { label: string; className?: string; tall?: boolean }) {
    const title = label.replace(/^[a-z]+:\s*/i, '').split(/[(—–-]/)[0].trim().slice(0, 48);
    return (
        <div className={cn('flex flex-col gap-1 rounded-[3px] border border-parchment-400 bg-white p-2 shadow-sm', tall ? 'aspect-[3/4]' : 'aspect-[4/5]', className)}>
            <p className="truncate text-[0.5625rem] font-bold text-ink-900 uppercase">{title}</p>
            <span className="h-0.5 w-8 bg-gold-500" />
            {[90, 75, 82, 60].map((w, i) => (
                <span key={i} className="h-1 rounded bg-parchment-400" style={{ width: `${w}%` }} />
            ))}
            <div className="mt-1 grid flex-1 grid-cols-3 gap-0.5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className={cn('rounded-[1px]', i % 3 === 1 ? 'bg-gold-100' : 'bg-parchment-200')} />
                ))}
            </div>
        </div>
    );
}
