/**
 * LIGHTNING ATI — frame sequence loader.
 *
 * One module-level cache feeds both cinematic chapters, so the 240-frame plate
 * set is fetched and decoded exactly once per page load. Frames arrive
 * coarse-to-fine (every 8th → every 4th → all) so a chapter becomes
 * scroll-scrubbable almost immediately and sharpens as the rest lands.
 *
 * Decoded pixels are intentionally held as HTMLImageElement, not ImageBitmap:
 * the browser's image cache can evict those under memory pressure, which an
 * ImageBitmap cannot.
 */
import { useEffect, useState } from 'react';
import {
  type CinematicCapabilities,
  type CinematicManifest,
  MANIFEST_URL,
  detectCapabilities,
  framePath,
} from '../lib/cinematic';

export interface FrameSequence {
  /** Enough frames are decoded to start rendering. */
  ready: boolean;
  failed: boolean;
  loaded: number;
  total: number;
  manifest: CinematicManifest | null;
  capabilities: CinematicCapabilities;
  /** Nearest decoded frame for a 0-indexed request, or null before ready. */
  get(index0: number): CanvasImageSource | null;
  /** Tell the loader which frame matters right now. */
  prioritize(index0: number): void;
}

interface Store {
  manifest: CinematicManifest | null;
  capabilities: CinematicCapabilities;
  frames: (HTMLImageElement | null)[];
  order: number[];
  cursor: number;
  inFlight: number;
  loaded: number;
  planned: number;
  ready: boolean;
  failed: boolean;
  started: boolean;
  listeners: Set<() => void>;
}

const CONCURRENCY = 6;
const READY_AT = 14;

let store: Store | null = null;

function notify() {
  if (!store) return;
  for (const fn of store.listeners) fn();
}

/** Coarse-to-fine index order: every 8th, then 4th, 2nd, then the remainder. */
function buildOrder(count: number, stride: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step * stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

function pump() {
  const s = store;
  if (!s || !s.manifest) return;
  const { manifest } = s;

  while (s.inFlight < CONCURRENCY && s.cursor < s.order.length) {
    const index0 = s.order[s.cursor++];
    if (s.frames[index0]) continue;

    const img = new Image();
    img.decoding = 'async';
    img.src = framePath(s.capabilities.setName, index0 + 1, manifest.pad, manifest.ext);
    s.inFlight++;

    const settle = (ok: boolean) => {
      s.inFlight--;
      if (ok) {
        s.frames[index0] = img;
        s.loaded++;
        if (!s.ready && s.loaded >= Math.min(READY_AT, s.planned)) {
          s.ready = true;
        }
        notify();
      } else if (s.loaded === 0 && s.cursor >= s.order.length) {
        s.failed = true;
        notify();
      }
      pump();
    };

    const finish = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(() => settle(true)).catch(() => settle(true));
      } else {
        settle(true);
      }
    };

    if (img.complete && img.naturalWidth > 0) finish();
    else {
      img.onload = finish;
      img.onerror = () => settle(false);
    }
  }
}

/** Pull a frame to the front of the queue (scroll landed near it). */
function prioritize(index0: number) {
  const s = store;
  if (!s || !s.manifest || s.cursor >= s.order.length) return;
  const stride = s.capabilities.frameStride;
  const snapped = Math.round(index0 / stride) * stride;
  for (let d = 0; d <= 4 * stride; d += stride) {
    for (const target of d === 0 ? [snapped] : [snapped - d, snapped + d]) {
      if (target < 0 || target >= s.frames.length || s.frames[target]) continue;
      const at = s.order.indexOf(target, s.cursor);
      if (at > s.cursor) {
        s.order[at] = s.order[s.cursor];
        s.order[s.cursor] = target;
      }
    }
  }
}

function ensureStore(): Store {
  if (store) return store;
  store = {
    manifest: null,
    capabilities: detectCapabilities(),
    frames: [],
    order: [],
    cursor: 0,
    inFlight: 0,
    loaded: 0,
    planned: 0,
    ready: false,
    failed: false,
    started: false,
    listeners: new Set(),
  };
  return store;
}

function start() {
  const s = ensureStore();
  if (s.started) return;
  s.started = true;

  fetch(MANIFEST_URL, { cache: 'force-cache' })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`manifest ${res.status}`))))
    .then((manifest: CinematicManifest) => {
      s.manifest = manifest;
      s.frames = new Array(manifest.frameCount).fill(null);
      s.order = buildOrder(manifest.frameCount, s.capabilities.frameStride);
      s.planned = s.order.length;
      notify();
      pump();
    })
    .catch(() => {
      s.failed = true;
      notify();
    });
}

/** Nearest decoded neighbour, so a partially loaded sequence never blanks out. */
function getFrame(index0: number): CanvasImageSource | null {
  const s = store;
  if (!s || !s.frames.length) return null;
  const clamped = Math.max(0, Math.min(s.frames.length - 1, Math.round(index0)));
  if (s.frames[clamped]) return s.frames[clamped];
  for (let d = 1; d < s.frames.length; d++) {
    const lo = clamped - d;
    const hi = clamped + d;
    if (lo >= 0 && s.frames[lo]) return s.frames[lo];
    if (hi < s.frames.length && s.frames[hi]) return s.frames[hi];
  }
  return null;
}

export function useFrameSequence(): FrameSequence {
  const [, bump] = useState(0);

  useEffect(() => {
    const s = ensureStore();
    const listener = () => bump((n) => n + 1);
    s.listeners.add(listener);
    if (!s.capabilities.reducedMotion) start();
    else if (!s.manifest && !s.started) start();
    return () => {
      s.listeners.delete(listener);
    };
  }, []);

  const s = ensureStore();
  return {
    ready: s.ready,
    failed: s.failed,
    loaded: s.loaded,
    total: s.planned || (s.manifest?.frameCount ?? 0),
    manifest: s.manifest,
    capabilities: s.capabilities,
    get: getFrame,
    prioritize,
  };
}
