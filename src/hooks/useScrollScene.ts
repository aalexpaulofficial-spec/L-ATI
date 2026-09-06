/**
 * LIGHTNING ATI — scroll scene engine.
 *
 * Maps a tall section's scroll travel onto 0 → 1 for its sticky viewport, then
 * hands that progress to imperative renderers on a single shared
 * requestAnimationFrame loop. Progress is critically damped so a flicked
 * trackpad reads as camera inertia rather than a jump, and the loop parks
 * itself when no scene is on screen.
 */
import { useCallback, useEffect, useRef } from 'react';
import { clamp } from '../lib/cinematic';

export interface SceneFrameInfo {
  /** Damped progress, 0 → 1. Use this for rendering. */
  progress: number;
  /** Undamped scroll progress, 0 → 1. */
  raw: number;
  /** Signed progress delta on this tick. */
  velocity: number;
}

export type SceneRenderer = (info: SceneFrameInfo) => void;

interface Scene {
  el: HTMLElement;
  renderers: Set<SceneRenderer>;
  damping: number;
  current: number;
  raw: number;
  settled: boolean;
  active: boolean;
}

const scenes = new Set<Scene>();
let rafId = 0;
let lastTs = 0;

function measure(scene: Scene) {
  const rect = scene.el.getBoundingClientRect();
  const vh = window.innerHeight;
  const travel = rect.height - vh;
  scene.raw = travel <= 0 ? (rect.top <= 0 ? 1 : 0) : clamp(-rect.top / travel);
  // Keep ticking a little outside the viewport so the seam between the two
  // chapters is already correct by the time it scrolls in.
  scene.active = rect.top < vh * 1.35 && rect.bottom > -vh * 0.35;
}

function tick(ts: number) {
  rafId = 0;
  const dt = lastTs ? Math.min(64, ts - lastTs) : 16.67;
  lastTs = ts;

  let needsAnother = false;

  for (const scene of scenes) {
    measure(scene);
    if (scene.active) needsAnother = true;
    if (!scene.active && scene.settled) continue;

    const k = 1 - Math.pow(1 - scene.damping, dt / 16.67);
    const next = scene.current + (scene.raw - scene.current) * k;
    const velocity = next - scene.current;
    const delta = Math.abs(scene.raw - next);

    scene.current = delta < 0.00025 ? scene.raw : next;
    scene.settled = delta < 0.00025;

    const info: SceneFrameInfo = { progress: scene.current, raw: scene.raw, velocity };
    for (const render of scene.renderers) render(info);

    if (!scene.settled) needsAnother = true;
  }

  if (needsAnother) schedule();
  else lastTs = 0;
}

function schedule() {
  if (rafId || scenes.size === 0) return;
  rafId = requestAnimationFrame(tick);
}

/** A scroll past every scene parks the loop; the next scroll wakes it. */
let wakeBound = false;
function bindWake() {
  if (wakeBound || typeof window === 'undefined') return;
  wakeBound = true;
  window.addEventListener('scroll', schedule, { passive: true });
}

function stopIfIdle() {
  if (scenes.size === 0 && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
    lastTs = 0;
  }
}

export interface UseScrollSceneOptions {
  damping?: number;
  /** Reduced motion / static fallback: hold progress at `staticProgress`. */
  disabled?: boolean;
  staticProgress?: number;
}

export interface UseScrollSceneResult {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  subscribe: (render: SceneRenderer) => () => void;
  progressRef: React.MutableRefObject<number>;
}

export function useScrollScene(options: UseScrollSceneOptions = {}): UseScrollSceneResult {
  const { damping = 0.16, disabled = false, staticProgress = 1 } = options;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const renderers = useRef<Set<SceneRenderer>>(new Set());
  const progressRef = useRef(disabled ? staticProgress : 0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (disabled) {
      const info: SceneFrameInfo = { progress: staticProgress, raw: staticProgress, velocity: 0 };
      progressRef.current = staticProgress;
      for (const render of renderers.current) render(info);
      return;
    }

    const scene: Scene = {
      el,
      renderers: renderers.current,
      damping,
      current: 0,
      raw: 0,
      settled: false,
      active: true,
    };
    // Seed from the real scroll position so a mid-page reload is never wrong.
    measure(scene);
    scene.current = scene.raw;

    const mirror: SceneRenderer = (info) => {
      progressRef.current = info.progress;
    };
    scene.renderers.add(mirror);
    scenes.add(scene);
    bindWake();
    schedule();

    const onResize = () => {
      measure(scene);
      scene.settled = false;
      schedule();
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      scene.renderers.delete(mirror);
      scenes.delete(scene);
      stopIfIdle();
    };
  }, [damping, disabled, staticProgress]);

  const subscribe = useCallback((render: SceneRenderer) => {
    renderers.current.add(render);
    schedule();
    return () => {
      renderers.current.delete(render);
    };
  }, []);

  return { sectionRef, subscribe, progressRef };
}
