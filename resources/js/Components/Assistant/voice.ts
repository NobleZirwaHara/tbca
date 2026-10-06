import { useSyncExternalStore } from 'react';

/* ==========================================================================
   Assistant voice: spoken replies (speechSynthesis) and dictation
   (SpeechRecognition). Both degrade to no-ops where unsupported.
   The speaker preference is remembered per browser and defaults to OFF.
   ========================================================================== */

const PREF_KEY = 'tbca.assistant.voice';
const listeners = new Set<() => void>();

function readPref(): boolean {
    try {
        return window.localStorage.getItem(PREF_KEY) === 'on';
    } catch {
        return false;
    }
}

let voiceOn = typeof window === 'undefined' ? false : readPref();

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function isVoiceOn() {
    return voiceOn && speechSupported();
}

export function setVoiceOn(on: boolean) {
    voiceOn = on;
    try {
        window.localStorage.setItem(PREF_KEY, on ? 'on' : 'off');
    } catch {
        /* storage blocked — preference lasts for this page only */
    }
    if (!on) stopSpeaking();
    listeners.forEach((l) => l());
}

export function useVoicePref(): boolean {
    return useSyncExternalStore(
        (l) => {
            listeners.add(l);
            return () => listeners.delete(l);
        },
        () => voiceOn,
        () => false,
    );
}

const FEMALE = /female|woman|zira|susan|samantha|victoria|karen|moira|tessa|fiona|serena|hazel|libby|sonia|natasha|aria|jenny|michelle|leah|ava|allison|google uk english female|google us english/i;
const MALE = /\bmale\b|david|mark|george|james|daniel|alex|fred|ryan|guy|thomas/i;

function pickVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
    const score = (v: SpeechSynthesisVoice) =>
        (FEMALE.test(v.name) ? 10 : 0) - (MALE.test(v.name) ? 10 : 0) + (v.lang === 'en-ZA' ? 4 : v.lang === 'en-GB' ? 2 : 0) + (v.localService ? 1 : 0);
    return voices.sort((a, b) => score(b) - score(a))[0];
}

/** Strip links/markup and keep replies short enough to listen to. */
function speakable(text: string) {
    return text.replace(/https?:\/\/\S+/g, '').replace(/[•*_#>]/g, '').slice(0, 600);
}

export function speak(text: string, opts: { pitch: number; rate: number }) {
    if (!isVoiceOn()) return;
    try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(speakable(text));
        const voice = pickVoice();
        if (voice) {
            u.voice = voice;
            u.lang = voice.lang;
        }
        u.pitch = opts.pitch;
        u.rate = opts.rate;
        synth.speak(u);
    } catch {
        /* speech engine unavailable */
    }
}

export function stopSpeaking() {
    try {
        if (speechSupported()) window.speechSynthesis.cancel();
    } catch {
        /* ignore */
    }
}

/* ----- Dictation (voice input) ----- */

interface RecognitionResultEvent {
    results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

export interface Recognition {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((e: RecognitionResultEvent) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    start: () => void;
    stop: () => void;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
    if (typeof window === 'undefined') return undefined;
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const dictationSupported = () => recognitionCtor() !== undefined;

/**
 * Starts listening; calls `onText` with the running transcript and `onEnd`
 * when the browser stops. Returns a stop function (or null if unsupported).
 */
export function listen(onText: (text: string) => void, onEnd: () => void): (() => void) | null {
    const Ctor = recognitionCtor();
    if (!Ctor) return null;
    try {
        stopSpeaking();
        const r = new Ctor();
        r.lang = 'en-ZA';
        r.interimResults = true;
        r.continuous = false;
        r.onresult = (e) => {
            let text = '';
            for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
            onText(text);
        };
        r.onend = onEnd;
        r.onerror = onEnd;
        r.start();
        return () => r.stop();
    } catch {
        onEnd();
        return null;
    }
}
