import React from 'react';
import { HistoryItem, CONFIDENCE_STYLE } from '../types';

interface HistoryScreenProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
  onClear: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onSelect, onBack, onClear }) => (
  <main className="screen" role="main"
    style={{ justifyContent:'flex-start', paddingTop:'36px', paddingBottom:'80px' }}
    aria-label="Scan history"
  >
    <div aria-hidden style={{ position:'absolute', top:'-100px', right:'-100px', width:'300px', height:'300px', borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle, rgba(139,92,246,.07) 0%, transparent 70%)' }} />

    <div style={{ width:'100%', maxWidth:'480px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button className="btn-icon" onClick={onBack} aria-label="Go back" style={{ width:'44px', height:'44px' }}>
            <span style={{ fontSize:'18px' }}>←</span>
          </button>
          <h1 className="display" style={{ fontSize:'34px', color:'#F4C430' }}>History</h1>
        </div>
        {history.length > 0 && (
          <button onClick={onClear} aria-label="Clear history"
            style={{ fontSize:'13px', color:'rgba(248,113,113,.7)', background:'none', border:'none', cursor:'pointer', padding:'8px' }}>
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>📋</div>
          <p style={{ fontSize:'18px', color:'rgba(240,238,248,.4)' }}>No scans yet.<br />Scan a label to see your history here.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {history.map((item, i) => {
            const conf = CONFIDENCE_STYLE[item.result.confidence] ?? CONFIDENCE_STYLE.low;
            const date = new Date(item.timestamp);
            return (
              <button
                key={item.id}
                className="history-card slide-up"
                onClick={() => onSelect(item)}
                aria-label={`View scan of ${item.result.drugName}`}
                style={{ animationDelay:`${i * 0.07}s`, textAlign:'left', background:'none', fontFamily:'inherit', width:'100%' }}
              >
                {item.thumbnail && (
                  <img
                    src={`data:image/jpeg;base64,${item.thumbnail}`}
                    alt=""
                    aria-hidden
                    style={{ width:'52px', height:'52px', borderRadius:'10px', objectFit:'cover', flexShrink:0 }}
                  />
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'17px', fontWeight:700, color:'#F0EEF8', marginBottom:'3px',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {item.result.drugName}
                  </div>
                  <div style={{ fontSize:'13px', color:'rgba(240,238,248,.45)',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {item.result.dosage}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px', flexShrink:0 }}>
                  <div style={{ fontSize:'12px', padding:'3px 10px', borderRadius:'20px',
                    background: conf.bg, border:`1px solid ${conf.border}`, color: conf.color }}>
                    {conf.label}
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(240,238,248,.3)' }}>
                    {date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  </main>
);
