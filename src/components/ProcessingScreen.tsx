import React from 'react';

interface ProcessingScreenProps {
  language?: string;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ language }) => (
  <div className="screen" role="status" aria-live="polite" aria-label="Processing your medicine label">
    <div aria-hidden style={{ position:'absolute', top:'-140px', right:'-140px', width:'400px', height:'400px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(244,196,48,.07) 0%, transparent 70%)' }} />
    <div aria-hidden style={{ position:'absolute', bottom:'-100px', left:'-100px', width:'300px', height:'300px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(139,92,246,.07) 0%, transparent 70%)' }} />

    <div style={{ textAlign:'center', maxWidth:'320px' }}>
      {/* Spinner */}
      <div style={{ position:'relative', width:'110px', height:'110px', margin:'0 auto 32px' }}>
        <div className="spin-anim" aria-hidden style={{
          position:'absolute', inset:0, borderRadius:'50%',
          border:'3px solid rgba(244,196,48,.12)',
          borderTop:'3px solid #F4C430',
        }} />
        <div aria-hidden style={{
          position:'absolute', inset:0,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'44px',
        }}>💊</div>
      </div>

      <h2 className="display" style={{ fontSize:'36px', color:'#F4C430', marginBottom:'12px' }}>
        Reading Label
      </h2>

      <p style={{ fontSize:'18px', color:'rgba(240,238,248,.5)', marginBottom:'32px', lineHeight:1.5 }}>
        {language && language !== 'en'
          ? `Translating to your language`
          : `Translating to simple words`}
        <span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span>
      </p>

      {/* Progress steps */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {[
          { icon:'🔍', label:'Reading label text' },
          { icon:'🧠', label:'Understanding medicine' },
          { icon:'✏️', label:'Simplifying for you' },
          ...(language && language !== 'en' ? [{ icon:'🌐', label:'Translating language' }] : []),
        ].map((step, i) => (
          <div key={step.label} className="slide-up"
            style={{
              animationDelay:`${i * 0.2}s`,
              display:'flex', alignItems:'center', gap:'12px',
              padding:'10px 16px', borderRadius:'12px',
              background:'rgba(244,196,48,.06)', border:'1px solid rgba(244,196,48,.12)',
            }}>
            <span style={{ fontSize:'18px' }}>{step.icon}</span>
            <span style={{ fontSize:'15px', color:'rgba(244,196,48,.7)' }}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
