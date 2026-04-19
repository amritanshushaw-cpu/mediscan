import React, { useState } from 'react';

interface CameraScreenProps {
  videoRef:  React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCapture: () => void;
  onBack:    () => void;
}

/** The four corner L-brackets of the scan frame */
const ScanCorner: React.FC<{ top?: boolean; bottom?: boolean; left?: boolean; right?: boolean }> = ({
  top, bottom, left, right,
}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      ...(top    !== undefined ? { top:    top    ? 0 : undefined } : {}),
      ...(bottom !== undefined ? { bottom: bottom ? 0 : undefined } : {}),
      ...(left   !== undefined ? { left:   left   ? 0 : undefined } : {}),
      ...(right  !== undefined ? { right:  right  ? 0 : undefined } : {}),
      width: '32px', height: '32px',
      borderTop:    top    ? '3px solid #F4C430' : 'none',
      borderBottom: bottom ? '3px solid #F4C430' : 'none',
      borderLeft:   left   ? '3px solid #F4C430' : 'none',
      borderRight:  right  ? '3px solid #F4C430' : 'none',
      borderRadius: top && left ? '4px 0 0 0'
                  : top && right ? '0 4px 0 0'
                  : bottom && left ? '0 0 0 4px'
                  : '0 0 4px 0',
    }}
  />
);

export const CameraScreen: React.FC<CameraScreenProps> = ({
  videoRef, canvasRef, onCapture, onBack,
}) => {
  const [flash, setFlash] = useState(false);

  const handleCapture = () => {
    // Trigger white-flash feedback before calling parent handler
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
    onCapture();
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000', overflow: 'hidden' }}
      role="region"
      aria-label="Camera viewfinder"
    >
      {/* Live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        aria-label="Camera viewfinder"
      />

      {/* Hidden capture canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden />

      {/* Gradient vignette — improves readability of UI over bright scenes */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom,rgba(0,0,0,.32) 0%,transparent 35%,transparent 65%,rgba(0,0,0,.55) 100%)',
      }} />

      {/* Scan frame */}
      <div aria-hidden style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)',
        width: 'min(80vw, 340px)',
        height: 'min(50vw, 200px)',
        pointerEvents: 'none',
      }}>
        <ScanCorner top  left  />
        <ScanCorner top  right />
        <ScanCorner bottom left  />
        <ScanCorner bottom right />
        {/* Animated scan line */}
        <div
          className="scan-line-anim"
          style={{
            position: 'absolute', left: '6px', right: '6px', height: '2px',
            background: 'linear-gradient(90deg,transparent,#F4C430,transparent)',
            opacity: .7,
          }}
        />
      </div>

      {/* "Aim the label inside the frame" hint */}
      <div aria-live="polite" style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, calc(-60% + min(25vw, 100px) + 20px))',
        color: 'rgba(255,255,255,.8)', fontSize: '15px', textAlign: 'center',
        pointerEvents: 'none',
      }}>
        Aim the label inside the frame
      </div>

      {/* White flash on capture */}
      {flash && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: 'white', opacity: .9, zIndex: 50,
            animation: 'flash-fade .26s ease forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Controls bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '24px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          aria-label="Cancel and go back"
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)',
            color: '#fff', fontSize: '20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* Shutter button */}
        <button
          onClick={handleCapture}
          aria-label="Take photo of medicine label"
          style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: '#F4C430', border: '4px solid white',
            cursor: 'pointer', fontSize: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 28px rgba(244,196,48,.55)',
            transition: 'transform .1s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.93)')}
          onMouseUp={(e)   => (e.currentTarget.style.transform = 'scale(1)')}
        >📸</button>

        {/* Spacer (keeps shutter centred) */}
        <div style={{ width: '56px' }} aria-hidden />
      </div>
    </div>
  );
};
