import React from 'react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
  onHome: () => void;
}

const ERROR_TIPS: Record<string, string> = {
  'No medication label': '💡 Tip: Make sure the label is fully visible and well-lit.',
  'quota': '💡 Tip: API quota exceeded. Try again in a moment.',
  'Image required': '💡 Tip: Camera issue detected. Please reload the app.',
  'default': '💡 Tip: Try better lighting and hold the camera steady.',
};

function getTip(message: string): string {
  for (const [key, tip] of Object.entries(ERROR_TIPS)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return tip;
  }
  return ERROR_TIPS.default;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry, onHome }) => (
  <div className="screen" role="alert" aria-live="assertive">
    <div aria-hidden style={{ position:'absolute', top:'-120px', right:'-120px', width:'340px', height:'340px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(248,113,113,.07) 0%, transparent 70%)' }} />

    <div style={{ textAlign:'center', maxWidth:'400px', width:'100%' }}>
      <div aria-hidden style={{ fontSize:'72px', marginBottom:'20px' }}>😕</div>

      <h2 className="display" style={{ fontSize:'44px', color:'#F87171', marginBottom:'14px' }}>Oops!</h2>

      <p style={{ fontSize:'18px', lineHeight:1.6, color:'rgba(240,238,248,.65)', marginBottom:'16px' }}>
        {message || 'Something went wrong. Please try again.'}
      </p>

      <div style={{
        padding:'12px 16px', borderRadius:'14px', marginBottom:'32px',
        background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)',
        fontSize:'14px', color:'rgba(248,113,113,.7)', textAlign:'left',
      }}>
        {getTip(message)}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        <button className="btn-primary" onClick={onRetry} aria-label="Try again">
          <span aria-hidden style={{ fontSize:'22px' }}>🔄</span>Try Again
        </button>
        <button className="btn-ghost" onClick={onHome} aria-label="Go home">
          <span aria-hidden style={{ fontSize:'20px' }}>🏠</span>Home
        </button>
      </div>
    </div>
  </div>
);
