import { UploadCloud } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

/** Drag-and-drop / click-to-browse file field. Controlled by the parent's form state. */
export default function FileDrop({
    label,
    hint,
    accept,
    file,
    existing,
    onChange,
    error,
    required,
    accent = 'gold',
}: {
    label: string;
    hint: string;
    accept: string;
    file: File | null;
    existing?: string | null;
    onChange: (file: File | null) => void;
    error?: string;
    required?: boolean;
    accent?: 'gold' | 'purple';
}) {
    const id = useId();

    return (
        <div className="space-y-1.5">
            <span className="block text-[0.8125rem] font-medium text-ink-800">
                {label}
                {required && <span className="ml-0.5 text-risk-500">*</span>}
            </span>
            <label
                htmlFor={id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    onChange(e.dataTransfer.files?.[0] ?? null);
                }}
                className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-[6px] border-2 border-dashed p-4 transition-colors focus-within:ring-2',
                    accent === 'purple' ? 'border-violet-300 hover:bg-violet-50 focus-within:ring-violet-400' : 'border-gold-300 hover:bg-gold-50 focus-within:ring-gold-400',
                    error && 'border-risk-500',
                )}
            >
                <UploadCloud className={cn('size-7 shrink-0', accent === 'purple' ? 'text-violet-600' : 'text-gold-600')} aria-hidden="true" />
                <span className="text-[0.8125rem] text-ink-600">
                    {file ? (
                        <span className="font-semibold text-ink-900">{file.name}</span>
                    ) : existing ? (
                        <span>
                            Uploaded: <span className="font-semibold text-ink-900">{existing}</span> — choose a file to replace
                        </span>
                    ) : (
                        <>
                            Drag and drop your file here or <span className={cn('underline', accent === 'purple' ? 'text-violet-700' : 'text-gold-700')}>click to browse</span>
                        </>
                    )}
                    <span className="block text-xs text-ink-400">{hint}</span>
                </span>
                <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
            </label>
            {error && (
                <p role="alert" className="text-xs font-medium text-risk-500">
                    {error}
                </p>
            )}
        </div>
    );
}
