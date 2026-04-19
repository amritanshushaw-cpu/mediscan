/**
 * useCamera.ts
 * Encapsulates all getUserMedia / MediaStream logic.
 * Captures compressed, resized JPEG to stay within Gemini's 4MB limit.
 */

import { useRef, useCallback } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startStream: () => Promise<void>;
  stopStream: () => void;
  captureBase64: () => string | null;
}

const MAX_DIMENSION = 1024; // Resize to max 1024px — plenty for OCR, keeps base64 under 1MB
const JPEG_QUALITY  = 0.65; // 65% quality — sharp enough for text, small enough for Gemini

export function useCamera(): UseCameraReturn {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width:  { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    streamRef.current = stream;
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    });
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const captureBase64 = useCallback((): string | null => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const srcW = video.videoWidth  || 1280;
    const srcH = video.videoHeight || 720;

    // Scale down if larger than MAX_DIMENSION
    let dstW = srcW;
    let dstH = srcH;
    if (srcW > MAX_DIMENSION || srcH > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / srcW, MAX_DIMENSION / srcH);
      dstW = Math.round(srcW * ratio);
      dstH = Math.round(srcH * ratio);
    }

    canvas.width  = dstW;
    canvas.height = dstH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw scaled-down frame
    ctx.drawImage(video, 0, 0, dstW, dstH);

    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    const b64 = dataUrl.split(',')[1];

    // Safety check: warn if still large
    if (b64 && b64.length > 3_500_000) {
      console.warn('Image base64 is large:', b64.length, 'chars — may hit Gemini limit');
    }

    return b64 || null;
  }, []);

  return { videoRef, canvasRef, startStream, stopStream, captureBase64 };
}
