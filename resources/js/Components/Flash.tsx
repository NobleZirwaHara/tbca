import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CircleCheck, TriangleAlert, X } from 'lucide-react';
import type { SharedProps } from '@/types';

/**
 * Toast for session flash messages (->with('success') / ->with('error')).
 * Rendered once by every layout.
 */
export default function Flash() {
    const { flash } = usePage<SharedProps>().props;
    const message = flash.error ?? flash.success ?? flash.message;
    const tone = flash.error ? 'error' : 'success';
    const [dismissed, setDismissed] = useState<string | null>(null);

    useEffect(() => {
        if (!message) return;
        const t = setTimeout(() => setDismissed(message), 6000);
        return () => clearTimeout(t);
    }, [message]);

    if (!message || dismissed === message) return null;

    return (
        <div className="fixed top-4 left-1/2 z-[80] w-[min(92vw,520px)] -translate-x-1/2" role="status">
            <div
                className={
                    'flex items-start gap-3 rounded-[8px] border px-4 py-3 text-sm shadow-raised ' +
                    (tone === 'error' ? 'border-risk-500/40 bg-risk-50 text-risk-700' : 'border-verified-500/40 bg-verified-50 text-verified-700')
                }
            >
                {tone === 'error' ? <TriangleAlert className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
                <p className="flex-1">{message}</p>
                <button type="button" onClick={() => setDismissed(message)} aria-label="Dismiss">
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
