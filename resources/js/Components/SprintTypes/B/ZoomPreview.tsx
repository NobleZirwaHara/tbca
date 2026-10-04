import { Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Modal } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

/**
 * Wraps a preview (dashboard mock, document sample...) with a magnifier button that opens
 * the same preview enlarged in a modal.
 */
export default function ZoomPreview({
    title,
    children,
    large,
    className,
    buttonClassName,
}: {
    title: string;
    children: ReactNode;
    large?: ReactNode;
    className?: string;
    buttonClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className={cn('relative', className)}>
            {children}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                    'absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-white text-ink-900 shadow-raised transition-transform hover:scale-105',
                    buttonClassName,
                )}
                aria-label={`Zoom preview: ${title}`}
            >
                <Search className="size-4" />
            </button>
            <Modal open={open} onClose={() => setOpen(false)} title={title} size="xl">
                {large ?? children}
            </Modal>
        </div>
    );
}
