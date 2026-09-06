/**
 * LIGHTNING ATI — CHAPTER II: IDEA → INTELLIGENCE.
 *
 * Opens on the exact plate Chapter I closed on, so the seam between the two is a
 * cut that isn't there. Where Chapter I was a portrait of the core, this chapter
 * is about what runs through it: the camera eases back off the sculpture, the
 * energy pathways spread across frame, and four stages of reasoning are drawn
 * down the right as a ladder rather than a headline.
 *
 * Choreography (scene progress 0 → 1):
 *   0.00–0.26  continuation — pathways spread, camera begins its pull-back.
 *   0.05–0.26  eyebrow and headline land.
 *   0.24–0.74  the ladder draws: understand → develop → structure → generate.
 *   0.74–1.00  camera settles wide, the hand-off line arrives.
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
} from '../../lib/cinematic';

/** The seam: this chapter's first plate is the previous chapter's last. */
const FRAME_TRACK: Keyframe<number>[] = [
  { at: 0, value: 152 },
  { at: 0.55, value: 200 },
  { at: 1, value: 239 },
];

const CAMERA_WIDE: Keyframe<CameraKey>[] = [
  { at: 0, value: { scale: 1.1, anchorX: 0.28, anchorY: 0.5 } },
  { at: 0.4, value: { scale: 1.07, anchorX: 0.3, anchorY: 0.5 } },
  { at: 0.75, value: { scale: 1.03, anchorX: 0.33, anchorY: 0.5 } },
  { at: 1, value: { scale: 1.02, anchorX: 0.34, anchorY: 0.5 } },
];

const CAMERA_PORTRAIT: Keyframe<CameraKey>[] = [
  { at: 0, value: { scale: 1.16, anchorX: 0.4, anchorY: 0.42 } },
  { at: 1, value: { scale: 1.1, anchorX: 0.46, anchorY: 0.46 } },
];

const STAGES = [
  { n: '01', title: 'Understand', body: 'Intent, audience, and the product actually being asked for.' },
  { n: '02', title: 'Develop', body: 'Features, flows, and every state that sits between them.' },
  { n: '03', title: 'Structure', body: 'Architecture, data, and the order the build has to happen in.' },
  { n: '04', title: 'Generate', body: 'One master prompt, written for the builder you are taking it to.' },
];

export function IdeaToIntelligenceSection() {
  const sequence = useFrameSequence();
  const reduced = sequence.capabilities.reducedMotion;
  const { sectionRef, subscribe } = useScrollScene({
    damping: 0.15,
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
          '--cam-x': key.anchorX,
          '--r-rail': revealAt(0.02, 0.12, p),
          '--r-bloom': lerp(1, 0.72, revealAt(0.45, 1, p)),
          '--r-vignette': lerp(1, 0.72, revealAt(0.5, 1, p)),
          '--r-scrim': lerp(1, 0.88, revealAt(0.6, 1, p)),
          '--r-eyebrow': revealAt(0.05, 0.15, p),
          '--r-title-a': revealAt(0.09, 0.21, p),
          '--r-title-b': revealAt(0.13, 0.26, p),
          '--r-ladder': revealAt(0.24, 0.74, p),
          '--r-step-1': revealAt(0.26, 0.36, p),
          '--r-step-2': revealAt(0.38, 0.48, p),
          '--r-step-3': revealAt(0.5, 0.6, p),
          '--r-step-4': revealAt(0.62, 0.72, p),
          '--r-outro': revealAt(0.8, 0.94, p),
        });

        if (reduced) return;
        // Hand-off value from Chapter I, easing off as the field becomes the subject.
        const follow = lerp(1, 0.85, revealAt(0, 0.6, p));
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

  useEffect(() => {
    if (reduced) return;
    canvasRef.current?.invalidate();
    replayRef.current?.();
  }, [sequence.loaded, reduced]);

  const sceneClass = [
    'scene',
    'scene--structure',
    reduced ? 'scene--static' : '',
    sequence.ready || reduced ? 'is-ready' : '',
    sequence.failed ? 'is-failed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section ref={sectionRef} id="how-it-works" className={sceneClass} aria-labelledby="structure-title">
      <div className="scene__sticky" ref={stickyRef}>
        <div className="scene__plate">
          {reduced ? (
            <img
              className="scene__still"
              src={`${CINEMATIC_BASE}/plate-end.webp`}
              alt="The LIGHTNING ATI emblem at the left of frame with energy pathways spreading across the dark."
            />
          ) : (
            <>
              <img className="scene__poster" src={`${CINEMATIC_BASE}/plate-core.webp`} alt="" aria-hidden="true" />
              <FrameCanvas
                ref={canvasRef}
                sequence={sequence}
                className="scene__canvas"
                ariaLabel="Energy pathways spreading outward from the LIGHTNING ATI emblem as the camera eases back."
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
            <span className="scene__rail-label">II — IDEA TO INTELLIGENCE</span>
          </p>

          <div className="scene__copy">
            <p className="eyebrow" data-r="eyebrow">
              From idea to intelligence
            </p>
            <h2 id="structure-title" className="display display--compact">
              <span className="display__line" data-r="title-a">
                Your idea.
              </span>
              <span className="display__line" data-r="title-b">
                Understood.
              </span>
            </h2>

            <ol className="ladder">
              {STAGES.map((stage, index) => (
                <li className="ladder__step" key={stage.n} data-r={`step-${index + 1}`}>
                  <span className="ladder__node" aria-hidden="true" />
                  <span className="ladder__n">{stage.n}</span>
                  <h3 className="ladder__title">{stage.title}</h3>
                  <p className="ladder__body">{stage.body}</p>
                </li>
              ))}
            </ol>

            <p className="scene__outro" data-r="outro">
              Four passes, one output.{' '}
              <a className="text-link" href="#lightning-studio">
                Give it an idea
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
