/**
 * LIGHTNING ATI — CHAPTER I: INTELLIGENCE CORE.
 *
 * The emblem wakes at the centre of frame, the stage dissolves around it, and a
 * virtual camera drifts with it as it settles into the left third — clearing the
 * right half of the frame so the story can be written into the space the move
 * created. Frames come from the supplied master plate; the camera, the grade and
 * the type are the only things authored here.
 *
 * Choreography (scene progress 0 → 1):
 *   0.00–0.10  dormant, centred. Scroll cue holds.
 *   0.10–0.55  ignition — energy climbs, camera pushes in, vignette tightens.
 *   0.48–0.80  the traverse — emblem moves left, camera follows, right side clears.
 *   0.56–0.95  copy lands in sequence: eyebrow → headline → lede → spec row.
 *   0.95–1.00  settle and hold on the END FRAME, which Chapter II opens on.
 */
import { useEffect, useMemo, useRef } from 'react';
import { FrameCanvas, type FrameCanvasHandle } from './FrameCanvas';
import { useFrameSequence } from '../../hooks/useFrameSequence';
import { useScrollScene } from '../../hooks/useScrollScene';
import { createVarWriter } from '../../lib/varWriter';
import {
  CINEMATIC_BASE,
  type CameraKey,
  type Keyframe,
  clamp,
  lerp,
  revealAt,
  sampleCamera,
  sampleTrack,
  smoothstep,
} from '../../lib/cinematic';

/** Scroll → plate index. Front-loaded so the dormant opening has weight. */
const FRAME_TRACK: Keyframe<number>[] = [
  { at: 0, value: 0 },
  { at: 0.1, value: 6 },
  { at: 0.55, value: 88 },
  { at: 1, value: 152 },
];

/** Landscape: the push buys pan room, the anchor spends it moving left. */
const CAMERA_WIDE: Keyframe<CameraKey>[] = [
  { at: 0, value: { scale: 1.1, anchorX: 0.5, anchorY: 0.5 } },
  { at: 0.3, value: { scale: 1.14, anchorX: 0.5, anchorY: 0.5 } },
  { at: 0.58, value: { scale: 1.16, anchorX: 0.46, anchorY: 0.5 } },
  { at: 0.8, value: { scale: 1.12, anchorX: 0.32, anchorY: 0.5 } },
  { at: 1, value: { scale: 1.1, anchorX: 0.28, anchorY: 0.5 } },
];

/** Portrait: copy stacks below the plate band, so the move stays a gesture. */
const CAMERA_PORTRAIT: Keyframe<CameraKey>[] = [
  { at: 0, value: { scale: 1.18, anchorX: 0.5, anchorY: 0.44 } },
  { at: 0.55, value: { scale: 1.2, anchorX: 0.48, anchorY: 0.42 } },
  { at: 1, value: { scale: 1.16, anchorX: 0.4, anchorY: 0.42 } },
];

const SPEC = [
  { key: 'MODEL', value: 'LIGHTNING-1' },
  { key: 'INPUT', value: 'ONE SENTENCE' },
  { key: 'OUTPUT', value: 'MASTER PROMPT' },
];

export function IntelligenceCoreSection() {
  const sequence = useFrameSequence();
  const reduced = sequence.capabilities.reducedMotion;
  const { sectionRef, subscribe } = useScrollScene({
    damping: 0.155,
    disabled: reduced,
    staticProgress: 1,
  });

  const canvasRef = useRef<FrameCanvasHandle>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef(false);
  const replayRef = useRef<(() => void) | null>(null);
  const writeVars = useMemo(() => createVarWriter(), []);

  useEffect(() => {
    const measure = () => {
      portraitRef.current = window.innerWidth / window.innerHeight < 1.05;
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('orientationchange', measure, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, []);

  const manifest = sequence.manifest;

  useEffect(
    () =>
      subscribe(({ progress: p }) => {
        const frame = sampleTrack(FRAME_TRACK, p);
        const key = sampleCamera(portraitRef.current ? CAMERA_PORTRAIT : CAMERA_WIDE, p);

        writeVars(stickyRef.current, {
          '--p': p,
          // Where the core sits on screen, so the CSS grade can follow the light.
          '--cam-x': key.anchorX,
          '--r-cue': 1 - revealAt(0.03, 0.12, p),
          '--r-rail': revealAt(0.06, 0.18, p),
          '--r-bloom': revealAt(0.16, 0.6, p),
          '--r-vignette': lerp(0.34, 1, revealAt(0.1, 0.62, p)),
          '--r-scrim': revealAt(0.46, 0.74, p),
          '--r-eyebrow': revealAt(0.56, 0.66, p),
          '--r-title-a': revealAt(0.6, 0.72, p),
          '--r-title-b': revealAt(0.65, 0.78, p),
          '--r-body': revealAt(0.73, 0.86, p),
          '--r-meta': revealAt(0.82, 0.95, p),
        });

        if (reduced) return;
        // Lock onto the measured emblem centroid, but only partly at first — the
        // sculpture's own drift should read before the camera commits to it.
        const follow = 0.2 + 0.8 * smoothstep(0.45, 0.94, p);
        const last = manifest ? manifest.emblemX.length - 1 : 0;
        const i = clamp(Math.round(frame), 0, last);
        const camera = {
          ...key,
          focusX: lerp(0.5, manifest ? manifest.emblemX[i] : 0.5, follow),
          focusY: lerp(0.5, manifest ? manifest.emblemY[i] : 0.5, follow),
        };
        replayRef.current = () => canvasRef.current?.render(frame, camera);
        canvasRef.current?.render(frame, camera);
      }),
    [subscribe, reduced, manifest, writeVars]
  );

  // A freshly decoded plate should immediately replace the neighbour standing in.
  useEffect(() => {
    if (reduced) return;
    canvasRef.current?.invalidate();
    replayRef.current?.();
  }, [sequence.loaded, reduced]);

  const sceneClass = [
    'scene',
    'scene--core',
    reduced ? 'scene--static' : '',
    sequence.ready || reduced ? 'is-ready' : '',
    sequence.failed ? 'is-failed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section ref={sectionRef} id="intelligence-core" className={sceneClass} aria-labelledby="core-title">
      <div className="scene__sticky" ref={stickyRef}>
        <div className="scene__plate">
          {reduced ? (
            <img
              className="scene__still"
              src={`${CINEMATIC_BASE}/plate-core.webp`}
              alt="The LIGHTNING ATI emblem held at the left of a dark chamber, its central lightning channel lit."
            />
          ) : (
            <>
              <img className="scene__poster" src={`${CINEMATIC_BASE}/plate-start.webp`} alt="" aria-hidden="true" />
              <FrameCanvas
                ref={canvasRef}
                sequence={sequence}
                className="scene__canvas"
                ariaLabel="The LIGHTNING ATI emblem waking at the centre of a dark chamber, then settling into the left of frame."
              />
            </>
          )}
          <div className="scene__bloom" aria-hidden="true" />
          <div className="scene__scrim" aria-hidden="true" />
          <div className="scene__vignette" aria-hidden="true" />
          <div className="scene__grain" aria-hidden="true" />
        </div>

        <div className="scene__ui">
          <p className="scene__rail" aria-hidden="true">
            <span className="scene__rail-line" />
            <span className="scene__rail-label">I — INTELLIGENCE CORE</span>
          </p>

          <div className="scene__copy">
            <p className="eyebrow" data-r="eyebrow">
              Artificial Thinking Intelligence
            </p>
            <h1 id="core-title" className="display">
              <span className="display__line" data-r="title-a">
                Turn your idea
              </span>
              <span className="display__line" data-r="title-b">
                into the prompt.
              </span>
            </h1>
            <p className="lede" data-r="body">
              One sentence is enough. LIGHTNING ATI reads the intent behind it, then reasons through the
              architecture, the flows, the states and the edge cases before writing the master prompt your
              builder actually needs.
            </p>
            <dl className="spec" data-r="meta">
              {SPEC.map((item) => (
                <div className="spec__row" key={item.key}>
                  <dt>{item.key}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="scene__cue" aria-hidden="true">
            <span className="scene__cue-label">Scroll</span>
            <span className="scene__cue-track">
              <span className="scene__cue-dot" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
