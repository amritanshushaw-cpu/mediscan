import React, { useEffect, useState } from 'react';
import { ScanResult, RESULT_CARDS, CONFIDENCE_STYLE, Language } from '../types';

interface ResultsScreenProps {
  result: ScanResult;
  isSpeaking: boolean;
  isLoadingBhashini?: boolean;
  onSpeak: (text: string, lang?: string) => void;
  onStop: () => void;
  onRescan: () => void;
  onHome: () => void;
  selectedLang: Language;
  thumbnail?: string;
}

function buildSpeechText(r: ScanResult): string {
  return `Medicine: ${r.drugName}. How to take it: ${r.dosage}. Side effects: ${r.sideEffects}. Warnings: ${r.warnings}.`;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result, isSpeaking, isLoadingBhashini, onSpeak, onStop,
  onRescan, onHome, selectedLang, thumbnail,
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg]   = useState('✓ Copied to clipboard!');
  const speechText = buildSpeechText(result);
  const conf = CONFIDENCE_STYLE[result.confidence] ?? CONFIDENCE_STYLE.low;

  // Auto-speak on load
  useEffect(() => {
    const t = setTimeout(() => onSpeak(speechText, selectedLang.code), 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toast = (msg: string) => {
    setToastMsg(msg); setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  const handleShare = async () => {
    const text = `💊 MediScan Result\n\nMedicine: ${result.drugName}\nHow to take: ${result.dosage}\nSide effects: ${result.sideEffects}\nWarnings: ${result.warnings}\n\nScanned with MediScan — mediscan-six.vercel.app`;
    try {
      if (navigator.share) await navigator.share({ title: 'MediScan Result', text });
      else { await navigator.clipboard.writeText(text); toast('✓ Copied to clipboard!'); }
    } catch { /* user cancelled */ }
  };

  const ttsLabel = isLoadingBhashini ? 'Loading...' : isSpeaking ? 'Pause' : `Listen in ${selectedLang.name}`;
  const ttsIcon  = isLoadingBhashini ? '⏳' : isSpeaking ? '⏸' : '🔊';

  return (
    <main className="screen" role="main"
      style={{ justifyContent: 'flex-start', paddingTop: '28px', paddingBottom: '110px' }}
      aria-label="Medicine label results"
    >
      <div className="orb orb-gold"   style={{ top: '-130px', right: '-130px', width: '360px', height: '360px' }} aria-hidden />
      <div className="orb orb-violet" style={{ bottom: '-80px', left: '-80px', width: '280px', height: '280px' }} aria-hidden />

      <div aria-live="polite" className="sr-only">{speechText}</div>

      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h1 className="display gradient-text" style={{ fontSize: '38px', lineHeight: 1 }}>Results</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              {selectedLang.code !== 'en' && (
                <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>
                  {selectedLang.flag} {selectedLang.name}
                </span>
              )}
              {result.cached && (
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>⚡ cached</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
              background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color,
            }}>{conf.label}</div>
            <button className="btn-icon" onClick={onHome} aria-label="Go home" style={{ width: '40px', height: '40px' }}>
              <span style={{ fontSize: '16px' }}>🏠</span>
            </button>
          </div>
        </div>

        {/* Drug name hero card */}
        <div className="card-gradient-border slide-up" style={{ marginBottom: '12px', animationDelay: '0s' }}>
          <div className="inner" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {thumbnail ? (
              <img src={`data:image/jpeg;base64,${thumbnail}`} alt="Scanned label"
                style={{ width: '68px', height: '68px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '68px', height: '68px', borderRadius: '12px', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>💊</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>Identified Medicine</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {result.drugName}
              </div>
            </div>
          </div>
        </div>

        {/* Result cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {RESULT_CARDS.slice(1).map((card, i) => (
            <article
              key={card.key}
              className="glass-strong slide-up"
              aria-label={card.ariaLabel}
              style={{ animationDelay: `${i * 0.1 + 0.1}s`, display: 'flex', gap: '14px', alignItems: 'stretch' }}
            >
              <div className="card-accent" style={{ background: card.color }} aria-hidden />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
                  <span aria-hidden style={{ fontSize: '18px' }}>{card.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: card.color, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    {card.label}
                  </span>
                </div>
                <p style={{ fontSize: '17px', lineHeight: 1.65, color: 'var(--text1)', margin: 0 }}>
                  {result[card.key] ?? 'Not found'}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Action buttons */}
        <div className="glass slide-up" style={{ animationDelay: '0.45s', padding: '14px' }}>
          {/* Row 1: TTS + Share */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '9px' }}>
            {/* Local language audio button */}
            <button
              onClick={() => (isSpeaking || isLoadingBhashini) ? onStop() : onSpeak(speechText, selectedLang.code)}
              className={`btn-action ${isSpeaking ? 'ring-anim' : ''}`}
              disabled={!!isLoadingBhashini}
              aria-label={ttsLabel}
              aria-pressed={isSpeaking}
              style={{
                background: isSpeaking ? 'var(--gold)' : 'rgba(245,158,11,.1)',
                color:      isSpeaking ? '#0A0700'     : 'var(--gold)',
                border: `1.5px solid rgba(245,158,11,${isSpeaking ? '.8' : '.3'})`,
                opacity: isLoadingBhashini ? .7 : 1,
              }}
            >
              <span aria-hidden style={{ fontSize: '20px' }}>{ttsIcon}</span>
              <span style={{ fontSize: '13px' }}>{ttsLabel}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="btn-action"
              aria-label="Share results"
              style={{ background: 'rgba(6,182,212,.1)', color: 'var(--cyan)', border: '1.5px solid rgba(6,182,212,.3)' }}
            >
              <span aria-hidden style={{ fontSize: '20px' }}>📤</span>
              <span style={{ fontSize: '13px' }}>Share</span>
            </button>
          </div>

          {/* Row 2: Scan Again + Home */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
            <button onClick={onRescan} className="btn-action"
              aria-label="Scan another label"
              style={{ background: 'rgba(139,92,246,.1)', color: '#A78BFA', border: '1.5px solid rgba(139,92,246,.3)' }}>
              <span aria-hidden style={{ fontSize: '18px' }}>📷</span>
              <span style={{ fontSize: '13px' }}>Scan Again</span>
            </button>
            <button onClick={onHome} className="btn-action"
              aria-label="Go home"
              style={{ background: 'var(--surface1)', color: 'var(--text2)', border: '1px solid var(--border1)' }}>
              <span aria-hidden style={{ fontSize: '18px' }}>🏠</span>
              <span style={{ fontSize: '13px' }}>Home</span>
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', lineHeight: 1.5, marginTop: '14px' }}>
          ⚕️ For informational purposes only. Always consult a doctor or pharmacist.
        </p>
      </div>

      {showToast && <div className="toast" role="status" aria-live="polite">{toastMsg}</div>}
    </main>
  );
};
