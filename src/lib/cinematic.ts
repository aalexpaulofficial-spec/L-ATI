/**
 * LIGHTNING ATI — cinematic engine primitives.
 *
 * Pure, framework-free helpers shared by both cinematic chapters: the camera
 * model, keyframe sampling, easing, and device-capability detection.
 */

export interface CinematicManifest {
  source: string;
  fps: number;
  frameCount: number;
  pad: number;
  ext: string;
  sets: Record<string, { dir: string; width: number; height: number }>;
  sections: Record<string, { start: number; end: number }>;
  /** Measured emblem centroid per frame, as a fraction of frame width/height. */
  emblemX: number[];
  emblemY: number[];
}

export type DeviceTier = 'high' | 'medium' | 'low';

export interface CinematicCapabilities {
  tier: DeviceTier;
  /** Which extracted plate set to pull frames from. */
  setName: 'desktop' | 'mobile';
  /** 1 = every frame, 2 = every other frame, … */
  frameStride: number;
  maxDpr: number;
  reducedMotion: boolean;
}

/** Camera state resolved for a single rendered tick. */
export interface CameraState {
  /** Multiplier on the cover-fit scale. 1 = exactly cover. */
  scale: number;
  /** Point in the source plate (0–1) the camera is looking at. */
  focusX: number;
  focusY: number;
  /** Where in the viewport (0–1) that focal point lands. */
  anchorX: number;
  anchorY: number;
}

export interface Keyframe<T> {
  at: number;
  value: T;
}

export const CINEMATIC_BASE = '/assets/cinematic';
export const MANIFEST_URL = `${CINEMATIC_BASE}/manifest.json`;

export function clamp(v: number, min = 0, max = 1): number {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Hermite ease between two edges — the workhorse for every reveal. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 === edge0) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Slightly heavier ease used for camera settles so motion decelerates. */
export function easeOutCubic(t: number): number {
  const u = 1 - clamp(t);
  return 1 - u * u * u;
}

/** Sample a scalar keyframe track with smoothstep interpolation. */
export function sampleTrack(track: Keyframe<number>[], t: number): number {
  if (track.length === 0) return 0;
  if (t <= track[0].at) return track[0].value;
  const last = track[track.length - 1];
  if (t >= last.at) return last.value;
  for (let i = 1; i < track.length; i++) {
    const b = track[i];
    if (t <= b.at) {
      const a = track[i - 1];
      const span = b.at - a.at || 1;
      const local = (t - a.at) / span;
      return lerp(a.value, b.value, local * local * (3 - 2 * local));
    }
  }
  return last.value;
}

/** Authored half of the camera — focus is supplied per-frame by the emblem track. */
export type CameraKey = Pick<CameraState, 'scale' | 'anchorX' | 'anchorY'>;

export function sampleCamera(track: Keyframe<CameraKey>[], t: number): CameraKey {
  if (track.length === 0) return { scale: 1, anchorX: 0.5, anchorY: 0.5 };
  if (t <= track[0].at) return track[0].value;
  const last = track[track.length - 1];
  if (t >= last.at) return last.value;
  for (let i = 1; i < track.length; i++) {
    const b = track[i];
    if (t <= b.at) {
      const a = track[i - 1];
      const span = b.at - a.at || 1;
      const raw = (a.at === b.at ? 1 : (t - a.at) / span);
      const local = raw * raw * (3 - 2 * raw);
      return {
        scale: lerp(a.value.scale, b.value.scale, local),
        anchorX: lerp(a.value.anchorX, b.value.anchorX, local),
        anchorY: lerp(a.value.anchorY, b.value.anchorY, local),
      };
    }
  }
  return last.value;
}

/** Reveal helper: 0 before `from`, 1 after `to`, eased between. */
export function revealAt(from: number, to: number, t: number): number {
  return smoothstep(from, to, t);
}

export function framePath(setName: string, index1: number, pad: number, ext: string): string {
  return `${CINEMATIC_BASE}/${setName}/f${String(index1).padStart(pad, '0')}.${ext}`;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Grade the device so the cinematic story survives on weak hardware instead of
 * stuttering. Mobile plates are 1/3 the bytes; low tier also halves the frames.
 */
export function detectCapabilities(): CinematicCapabilities {
  const reducedMotion = prefersReducedMotion();

  if (typeof window === 'undefined') {
    return { tier: 'high', setName: 'desktop', frameStride: 1, maxDpr: 2, reducedMotion };
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string; saveData?: boolean };
  };
  const width = window.innerWidth;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const conn = nav.connection;
  const thrifty = Boolean(conn?.saveData) || /(^|-)2g$/.test(conn?.effectiveType ?? '');
  const isCompact = width < 900;

  if (thrifty || cores <= 2 || memory <= 1) {
    return { tier: 'low', setName: 'mobile', frameStride: 3, maxDpr: 1.25, reducedMotion };
  }
  if (isCompact || cores <= 4 || memory <= 4) {
    return {
      tier: 'medium',
      setName: isCompact ? 'mobile' : 'desktop',
      frameStride: isCompact ? 2 : 1,
      maxDpr: 1.75,
      reducedMotion,
    };
  }
  return { tier: 'high', setName: 'desktop', frameStride: 1, maxDpr: 2, reducedMotion };
}
