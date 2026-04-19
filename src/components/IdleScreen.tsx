import React from 'react';
import { LANGUAGES, Language } from '../types';

interface IdleScreenProps {
  onStart: () => void;
  selectedLang: Language;
  onLangChange: (lang: Language) => void;
  historyCount: number;
  onViewHistory: () => void;
}

const FEATURES = [
  { icon: '🔍', label: 'AI Vision OCR' },
  { icon: '🌐', label: '12 Languages' },
  { icon: '🗣️', label: 'Voice Readout' },
  { icon: '⚡', label: '~2 Sec Results' },
];

export const IdleScreen: React.FC<IdleScreenProps> = ({
  onStart, selectedLang, onLangChange, historyCount, onViewHistory,
}) => (
  <main className="screen" role="main"
    style={{ justifyContent: 'space-between', paddingTop: '44px', paddingBottom: '32px' }}>

    {/* Ambient orbs */}
    <div className="orb orb-gold"   style={{ top: '-160px', right: '-120px', width: '420px', height: '420px' }} aria-hidden />
    <div className="orb orb-violet" style={{ bottom: '-120px', left: '-100px', width: '360px', height: '360px' }} aria-hidden />
    <div className="orb orb-cyan"   style={{ top: '38%', left: '-60px', width: '180px', height: '180px' }} aria-hidden />

    {/* Top bar */}
    <div style={{ width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>💊</span>
          <span className="display gradient-text" style={{ fontSize: '26px' }}>MediScan</span>
        </div>
        <div className="india-bar" style={{ width: '80px', marginTop: '5px' }} />
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Hackathon badge */}
        <div style={{
          padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
          background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.35)',
          color: '#A78BFA', letterSpacing: '.5px',
        }}>🏆 HACKATHON</div>

        {historyCount > 0 && (
          <button onClick={onViewHistory} className="btn-icon" aria-label={`View ${historyCount} past scans`} style={{ position: 'relative' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
            <span className="badge-pop" style={{
              position: 'absolute', top: '-5px', right: '-5px',
              background: 'var(--gold)', color: '#0A0700',
              borderRadius: '50%', width: '18px', height: '18px',
              fontSize: '11px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{historyCount > 9 ? '9+' : historyCount}</span>
          </button>
        )}
      </div>
    </div>

    {/* Hero section */}
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '440px' }}>
      <div className="float-anim" style={{ marginBottom: '24px' }}>
        <div aria-label="Pill icon" style={{
          width: '128px', height: '128px', borderRadius: '36px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(245,158,11,.2), rgba(245,158,11,.05))',
          border: '1.5px solid rgba(245,158,11,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '60px', position: 'relative', boxShadow: '0 0 60px rgba(245,158,11,.12)',
        }}>
          💊
          <div aria-hidden style={{
            position: 'absolute', inset: '-10px', borderRadius: '46px',
            border: '1px solid rgba(245,158,11,.1)',
          }} />
          <div aria-hidden style={{
            position: 'absolute', inset: '-20px', borderRadius: '56px',
            border: '1px solid rgba(245,158,11,.05)',
          }} />
        </div>
      </div>

      <h1 className="display gradient-text" style={{ fontSize: '64px', marginBottom: '6px', lineHeight: 1 }}>
        MediScan
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--text2)', lineHeight: 1.65, marginBottom: '6px' }}>
        Scan any medicine label.
      </p>
      <p style={{ fontSize: '18px', color: 'var(--text1)', lineHeight: 1.65, marginBottom: '28px', fontWeight: 600 }}>
        Understand it in <span style={{ color: 'var(--gold)' }}>your language</span>.
      </p>

      {/* Feature grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '28px' }}>
        {FEATURES.map(f => (
          <div key={f.label} className="glass" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '5px' }}>{f.icon}</div>
            <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600, lineHeight: 1.3 }}>{f.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        className="btn-primary"
        onClick={onStart}
        aria-label="Open camera to scan a medicine label"
        style={{ marginBottom: '12px', fontSize: '21px', minHeight: '66px', borderRadius: '20px' }}
      >
        <span aria-hidden style={{ fontSize: '26px' }}>📷</span>
        Scan a Label
      </button>

      <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '28px' }}>
        🔒 Photos are never stored or shared
      </p>
    </div>

    {/* Language selector */}
    <div style={{ width: '100%', maxWidth: '480px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
          Output Language
        </span>
        {selectedLang.code !== 'en' && (
          <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>
            {selectedLang.flag} {selectedLang.name} selected
          </span>
        )}
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: '7px', width: 'max-content', padding: '3px 2px' }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => onLangChange(lang)}
              className={`lang-pill ${selectedLang.code === lang.code ? 'active' : 'inactive'}`}
              aria-label={`${lang.name} language`}
              aria-pressed={selectedLang.code === lang.code}
            >
              <span style={{ fontSize: '15px' }}>{lang.flag}</span>
              <span>{lang.native}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </main>
);
