import { useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';
import { dictationSupported, listen, setVoiceOn, speechSupported, useVoicePref } from './voice';

/** Speaker on/off (remembered per browser, default off). Hidden when the browser cannot speak. */
export function VoiceToggle({ className }: { className?: string }) {
    const on = useVoicePref();
    if (!speechSupported()) return null;
    const label = on ? 'Turn voice replies off' : 'Turn voice replies on';
    return (
        <button
            type="button"
            onClick={() => setVoiceOn(!on)}
            aria-pressed={on}
            aria-label={label}
            title={label}
            className={cn('inline-flex size-8 items-center justify-center rounded-[6px] transition', className)}
        >
            {on ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
    );
}

/** Voice input: fills the composer with what the user says. Hidden when unsupported. */
export function MicButton({ onText, className }: { onText: (text: string) => void; className?: string }) {
    const [listening, setListening] = useState(false);
    const stop = useRef<(() => void) | null>(null);
    if (!dictationSupported()) return null;

    const toggle = () => {
        if (listening) {
            stop.current?.();
            return;
        }
        stop.current = listen(onText, () => {
            setListening(false);
            stop.current = null;
        });
        setListening(stop.current !== null);
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={listening}
            aria-label={listening ? 'Stop voice input' : 'Speak your message'}
            title={listening ? 'Stop voice input' : 'Speak your message'}
            className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] transition', listening && 'animate-pulse bg-risk-500 text-white', className)}
        >
            {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
    );
}
