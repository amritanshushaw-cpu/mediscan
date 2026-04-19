/**
 * useTTS.ts
 * Guaranteed Indian language audio via Google Translate TTS proxy.
 *
 * Strategy:
 *   1. Call /api/tts?text=...&lang=hi  (Google TTS proxy — works on all devices)
 *   2. Play returned MP3 audio via HTMLAudioElement
 *   3. Fallback to Web Speech API if proxy fails
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const LANG_BCP47: Record<string, string> = {
  en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN',
  te: 'te-IN', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN',
  ml: 'ml-IN', pa: 'pa-IN', or: 'or-IN', ur: 'ur-IN',
};

interface UseTTSReturn {
  isSpeaking: boolean;
  isLoadingBhashini: boolean; // kept for prop compatibility
  speak: (text: string, lang?: string) => void;
  stop: () => void;
  supported: boolean;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (supported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  }, [supported]);

  const speak = useCallback((text: string, lang = 'en') => {
    stop();

    // For English use Web Speech directly (faster)
    if (lang === 'en') {
      speakWebSpeech(text, 'en-US', setIsSpeaking);
      return;
    }

    // For all Indian languages — use Google TTS proxy
    setIsLoading(true);

    // Build URL for GET request to our proxy
    const params = new URLSearchParams({ text, lang });
    const audioUrl = `/api/tts?${params.toString()}`;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.oncanplaythrough = () => {
      setIsLoading(false);
      setIsSpeaking(true);
      audio.play().catch(() => {
        // Autoplay blocked — try Web Speech fallback
        setIsSpeaking(false);
        speakWebSpeechFallback(text, lang, setIsSpeaking);
      });
    };

    audio.onended = () => setIsSpeaking(false);

    audio.onerror = () => {
      setIsLoading(false);
      setIsSpeaking(false);
      // Fallback to Web Speech
      speakWebSpeechFallback(text, lang, setIsSpeaking);
    };

    // Trigger load
    audio.load();

    // Timeout — if no response in 8s, fall back
    const timeout = setTimeout(() => {
      if (isLoading) {
        stop();
        speakWebSpeechFallback(text, lang, setIsSpeaking);
      }
    }, 8000);

    audio.oncanplaythrough = () => {
      clearTimeout(timeout);
      setIsLoading(false);
      setIsSpeaking(true);
      audio.play().catch(() => {
        setIsSpeaking(false);
        speakWebSpeechFallback(text, lang, setIsSpeaking);
      });
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop]);

  useEffect(() => () => { stop(); }, [stop]);

  return {
    isSpeaking,
    isLoadingBhashini: isLoading, // alias for ResultsScreen prop
    speak,
    stop,
    supported,
  };
}

// Web Speech with Indian language voice
function speakWebSpeechFallback(
  text: string,
  lang: string,
  setIsSpeaking: (v: boolean) => void,
) {
  if (!window.speechSynthesis) return;
  const bcp47  = LANG_BCP47[lang] || 'en-US';
  const voices = window.speechSynthesis.getVoices();
  const voice  = voices.find(v => v.lang === bcp47)
              || voices.find(v => v.lang.startsWith(bcp47.slice(0, 2)))
              || null;
  speakWebSpeech(text, bcp47, setIsSpeaking, voice || undefined);
}

function speakWebSpeech(
  text: string,
  bcp47: string,
  setIsSpeaking: (v: boolean) => void,
  voice?: SpeechSynthesisVoice,
) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u    = new SpeechSynthesisUtterance(text);
  u.lang     = bcp47;
  u.rate     = 0.82;
  u.pitch    = 1.0;
  u.volume   = 1;
  if (voice) u.voice = voice;
  u.onstart  = () => setIsSpeaking(true);
  u.onend    = () => setIsSpeaking(false);
  u.onerror  = () => setIsSpeaking(false);
  window.speechSynthesis.speak(u);
}
