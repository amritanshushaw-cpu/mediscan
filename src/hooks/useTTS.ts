/**
 * useTTS.ts
 * Three-layer TTS strategy:
 *   1. Bhashini API  — native Indian language audio via /api/tts (best quality)
 *   2. Web Speech API with correct BCP-47 language code (e.g. hi-IN, ta-IN)
 *   3. Web Speech API in English (last resort fallback)
 *
 * Returns speak(text, lang?), stop(), isSpeaking, isLoadingBhashini
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// BCP-47 language codes for Web Speech API
const LANG_CODES: Record<string, string> = {
  en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN',
  te: 'te-IN', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN',
  ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', ur: 'ur-IN',
};

interface UseTTSReturn {
  isSpeaking: boolean;
  isLoadingBhashini: boolean;
  speak: (text: string, lang?: string) => void;
  stop: () => void;
  supported: boolean;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingBhashini, setIsLoadingBhashini] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    // Stop Bhashini audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Stop Web Speech
    if (supported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoadingBhashini(false);
  }, [supported]);

  // Try Bhashini TTS first, fall back to Web Speech
  const speak = useCallback((text: string, lang = 'en') => {
    stop();

    // English — always use Web Speech (no Bhashini needed)
    if (lang === 'en') {
      speakWebSpeech(text, 'en-US', setIsSpeaking);
      return;
    }

    // For Indian languages — try Bhashini first
    setIsLoadingBhashini(true);

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang, gender: 'female' }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Bhashini TTS not available');
        return res.json() as Promise<{ audioBase64: string; mimeType: string }>;
      })
      .then(({ audioBase64, mimeType }) => {
        setIsLoadingBhashini(false);
        // Play Bhashini audio
        const byteChars = atob(audioBase64);
        const byteNums  = Array.from(byteChars).map(c => c.charCodeAt(0));
        const blob      = new Blob([new Uint8Array(byteNums)], { type: mimeType });
        const url       = URL.createObjectURL(blob);
        const audio     = new Audio(url);
        audioRef.current = audio;
        audio.onplay  = () => setIsSpeaking(true);
        audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          // Fallback to Web Speech
          speakWebSpeech(text, LANG_CODES[lang] || 'en-US', setIsSpeaking);
        };
        audio.play().catch(() => {
          speakWebSpeech(text, LANG_CODES[lang] || 'en-US', setIsSpeaking);
        });
      })
      .catch(() => {
        setIsLoadingBhashini(false);
        // Fallback: Web Speech with Indian language voice
        const bcp47 = LANG_CODES[lang] || 'en-US';
        speakWebSpeech(text, bcp47, setIsSpeaking);
      });
  }, [stop]);

  useEffect(() => () => { stop(); }, [stop]);

  return { isSpeaking, isLoadingBhashini, speak, stop, supported };
}

function speakWebSpeech(
  text: string,
  bcp47: string,
  setIsSpeaking: (v: boolean) => void,
) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const trySpeak = (voiceLang: string) => {
    const voices  = window.speechSynthesis.getVoices();
    const voice   = voices.find(v => v.lang === voiceLang)
                 || voices.find(v => v.lang.startsWith(voiceLang.slice(0, 2)))
                 || null;

    const u     = new SpeechSynthesisUtterance(text);
    u.lang      = voiceLang;
    u.rate      = 0.82;
    u.pitch     = 1.05;
    u.volume    = 1;
    if (voice) u.voice = voice;
    u.onstart   = () => setIsSpeaking(true);
    u.onend     = () => setIsSpeaking(false);
    u.onerror   = () => {
      setIsSpeaking(false);
      // Last resort: English
      if (voiceLang !== 'en-US') speakWebSpeech(text, 'en-US', setIsSpeaking);
    };
    window.speechSynthesis.speak(u);
  };

  // Voices may not be loaded yet on first call
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      trySpeak(bcp47);
    };
  } else {
    trySpeak(bcp47);
  }
}
