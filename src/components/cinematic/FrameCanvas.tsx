/**
 * LIGHTNING ATI — cinematic plate renderer.
 *
 * Draws one frame of the supplied master sequence through a virtual camera
 * (cover-fit + focal point + anchor + push). Nothing here invents artwork: the
 * plates are the source of truth and this is only the lens in front of them.
 * All grading — vignette, bloom, scrims, grain — lives in CSS overlays so the
 * draw loop stays a single drawImage.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { CameraState } from '../../lib/cinematic';
import type { FrameSequence } from '../../hooks/useFrameSequence';

export interface FrameCanvasHandle {
  render(frameIndex: number, camera: CameraState): void;
  /** Drop the dedupe guard so the next render re-draws (a sharper plate landed). */
  invalidate(): void;
}

export interface FrameCanvasProps {
  sequence: FrameSequence;
  className?: string;
  ariaLabel: string;
}

export const FrameCanvas = forwardRef<FrameCanvasHandle, FrameCanvasProps>(function FrameCanvas(
  { sequence, className, ariaLabel },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const lastRef = useRef({ frame: -1, sig: '' });
  const seqRef = useRef(sequence);
  seqRef.current = sequence;

  /** Match the backing store to the element, capped by the device tier. */
  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, seqRef.current.capabilities.maxDpr);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const prev = sizeRef.current;
    if (prev.w === w && prev.h === h && prev.dpr === dpr) return false;

    sizeRef.current = { w, h, dpr };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctxRef.current = ctx;
    }
    lastRef.current = { frame: -1, sig: '' };
    return true;
  };

  useEffect(() => {
    resize();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resize, { passive: true });
      return () => window.removeEventListener('resize', resize);
    }
    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      invalidate() {
        lastRef.current = { frame: -1, sig: '' };
      },
      render(frameIndex, camera) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!ctxRef.current) resize();
        const ctx = ctxRef.current;
        if (!ctx) return;

        const { w, h } = sizeRef.current;
        if (w === 0 || h === 0) return;

        const frame = Math.round(frameIndex);
        const sig = `${w}x${h}|${camera.scale.toFixed(4)}|${camera.focusX.toFixed(4)}|${camera.focusY.toFixed(
          4
        )}|${camera.anchorX.toFixed(4)}|${camera.anchorY.toFixed(4)}`;
        if (lastRef.current.frame === frame && lastRef.current.sig === sig) return;

        const plate = seqRef.current.get(frame);
        if (!plate) return;
        seqRef.current.prioritize(frame);

        const sw = (plate as HTMLImageElement).naturalWidth || (plate as HTMLCanvasElement).width;
        const sh = (plate as HTMLImageElement).naturalHeight || (plate as HTMLCanvasElement).height;
        if (!sw || !sh) return;

        const scale = Math.max(w / sw, h / sh) * Math.max(1, camera.scale);
        const dw = sw * scale;
        const dh = sh * scale;
        // Keep the plate covering the frame — the camera may look, never leave.
        const dx = Math.min(0, Math.max(w - dw, camera.anchorX * w - camera.focusX * dw));
        const dy = Math.min(0, Math.max(h - dh, camera.anchorY * h - camera.focusY * dh));

        ctx.drawImage(plate, dx, dy, dw, dh);
        lastRef.current = { frame, sig };
      },
    }),
    []
  );

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
});
