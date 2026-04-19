import React, { useCallback, useState } from 'react';
import { useCamera }        from './hooks/useCamera';
import { useTTS }           from './hooks/useTTS';
import { IdleScreen }       from './components/IdleScreen';
import { CameraScreen }     from './components/CameraScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultsScreen }    from './components/ResultsScreen';
import { ErrorScreen }      from './components/ErrorScreen';
import { HistoryScreen }    from './components/HistoryScreen';
import type { Screen, ScanResult, HistoryItem, Language } from './types';
import { LANGUAGES } from './types';
import './styles/global.css';

// FIXED: use full-image hash (via SubtleCrypto) to prevent cache collisions.
// Previously used b64.slice(0,300) which is identical JPEG header bytes across all photos.
async function computeKey(b64: string, lang: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(b64 + '|' + lang);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

const scanCache = new Map<string, ScanResult>();

const App: React.FC = () => {
  const [screen,       setScreen]       = useState<Screen>('idle');
  const [result,       setResult]       = useState<ScanResult | null>(null);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [history,      setHistory]      = useState<HistoryItem[]>([]);
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [thumbnail,    setThumbnail]    = useState<string | undefined>();

  const camera = useCamera();
  const tts    = useTTS();

  const handleStart = useCallback(async () => {
    try { await camera.startStream(); setScreen('camera'); }
    catch { setErrorMsg('Camera access denied. Please allow camera permission.'); setScreen('error'); }
  }, [camera]);

  const handleCapture = useCallback(async () => {
    const b64 = camera.captureBase64();
    camera.stopStream();
    if (!b64) { setErrorMsg('Could not capture image. Please try again.'); setScreen('error'); return; }

    // Save compressed thumbnail for history display
    const thumb = b64.length > 60000 ? b64.slice(0, 60000) : b64;
    setScreen('processing');
    tts.stop();

    // Full SHA-256 hash to prevent any cache collision
    const key = await computeKey(b64, selectedLang.code);

    if (scanCache.has(key)) {
      setResult(scanCache.get(key)!);
      setThumbnail(thumb);
      setScreen('results');
      return;
    }

    try {
      const res = await fetch('/api/scan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ image: b64, language: selectedLang.code }),
      });

      const data = await res.json() as ScanResult & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? `Server error ${res.status}`);

      const final: ScanResult = { ...data, timestamp: Date.now(), language: selectedLang.code };
      scanCache.set(key, final);

      setResult(final);
      setThumbnail(thumb);
      setHistory(prev => [{
        id: Date.now().toString(), result: final, thumbnail: thumb, timestamp: Date.now(),
      }, ...prev].slice(0, 20));
      setScreen('results');

    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setScreen('error');
    }
  }, [camera, tts, selectedLang]);

  const handleCameraBack = useCallback(() => { camera.stopStream(); setScreen('idle'); }, [camera]);

  const handleRescan = useCallback(async () => {
    tts.stop(); setResult(null); setErrorMsg(''); setThumbnail(undefined);
    try { await camera.startStream(); setScreen('camera'); }
    catch { setErrorMsg('Camera access denied.'); setScreen('error'); }
  }, [camera, tts]);

  const handleHome = useCallback(() => {
    tts.stop(); camera.stopStream(); setResult(null); setErrorMsg(''); setThumbnail(undefined);
    setScreen('idle');
  }, [camera, tts]);

  const handleViewHistory  = useCallback(() => { tts.stop(); setScreen('history' as Screen); }, [tts]);
  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setResult(item.result); setThumbnail(item.thumbnail);
    setSelectedLang(LANGUAGES.find(l => l.code === item.result.language) || LANGUAGES[0]);
    setScreen('results');
  }, []);
  const handleClearHistory = useCallback(() => { setHistory([]); setScreen('idle'); }, []);

  if (screen === ('history' as Screen)) {
    return <HistoryScreen history={history} onSelect={handleSelectHistory} onBack={() => setScreen('idle')} onClear={handleClearHistory} />;
  }

  switch (screen) {
    case 'idle':
      return <IdleScreen onStart={handleStart} selectedLang={selectedLang} onLangChange={setSelectedLang} historyCount={history.length} onViewHistory={handleViewHistory} />;
    case 'camera':
      return <CameraScreen videoRef={camera.videoRef} canvasRef={camera.canvasRef} onCapture={handleCapture} onBack={handleCameraBack} />;
    case 'processing':
      return <ProcessingScreen language={selectedLang.code} />;
    case 'results':
      return result ? (
        <ResultsScreen
          result={result} isSpeaking={tts.isSpeaking} isLoadingBhashini={tts.isLoadingBhashini}
          onSpeak={tts.speak} onStop={tts.stop}
          onRescan={handleRescan} onHome={handleHome}
          selectedLang={selectedLang} thumbnail={thumbnail}
        />
      ) : null;
    case 'error':
      return <ErrorScreen message={errorMsg} onRetry={handleRescan} onHome={handleHome} />;
    default: return null;
  }
};

export default App;
