/**
 * LIGHTNING ATI — Founder / Origin closing section.
 *
 * A cinematic signature at the bottom of the landing page that communicates
 * the project's origin: A. Alex Paul, first model in ATI.
 * Purely presentational — no backend or API interaction.
 */
import { useEffect, useRef } from 'react';

/* ── Subtle particle field drawn on <canvas> ─────────────────────────────── */
function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const PARTICLE_COUNT = 36;

    interface P { x: number; y: number; vx: number; vy: number; r: number; a: number }
    let particles: P[] = [];

    const resize = () => {
      const rect = cvs.getBoundingClientRect();
      cvs.width = rect.width * DPR;
      cvs.height = rect.height * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const seed = () => {
      const w = cvs.width / DPR;
      const h = cvs.height / DPR;
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.25 + 0.04,
      }));
    };

    const draw = () => {
      const w = cvs.width / DPR;
      const h = cvs.height / DPR;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(73, 180, 255, ${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    seed();
    draw();
    window.addEventListener('resize', () => { resize(); seed(); });
    return () => { cancelAnimationFrame(raf); };
  }, [canvasRef]);
}

/* ── Scroll-triggered reveal ─────────────────────────────────────────────── */
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

export function FounderOrigin() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useParticleCanvas(canvasRef);
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="origin"
      aria-label="Founder and origin of LIGHTNING ATI"
    >
      {/* Atmospheric canvas */}
      <canvas ref={canvasRef} className="origin__particles" aria-hidden="true" />

      {/* Faint emblem watermark */}
      <div className="origin__watermark" aria-hidden="true">
        <img
          src="/assets/brand/jc-lightning-ati-bw.png"
          alt=""
          draggable={false}
        />
      </div>

      <div className="origin__content">
        {/* ── Founder identity ─────────────────────────────────── */}
        <div className="origin__identity">
          <h2 className="origin__name">A. Alex Paul</h2>
          <p className="origin__role">
            Founder <span className="origin__sep">/</span> CEO
          </p>
          <p className="origin__org">
            Lightning<span className="origin__ati">ATI</span>{' '}
            <span className="origin__dash">—</span> Artificial Thinking Intelligence
          </p>
        </div>

        {/* ── Divider ─────────────────────────────────────────── */}
        <div className="origin__divider" aria-hidden="true" />

        {/* ── Cinematic statement ─────────────────────────────── */}
        <blockquote className="origin__statement">
          <p>Built to introduce a new way of thinking about intelligence.</p>
        </blockquote>

        {/* ── Origin claim ────────────────────────────────────── */}
        <p className="origin__claim">
          Developed by A.&nbsp;Alex Paul as the first model built in the
          Artificial Thinking Intelligence (ATI) field.
        </p>
      </div>

      {/* ── Bottom signature ──────────────────────────────────── */}
      <div className="origin__signature">
        <p className="origin__sig-brand">
          Lightning<span className="origin__sig-ati">ATI</span>
        </p>
        <p className="origin__sig-full">Artificial Thinking Intelligence</p>
        <p className="origin__sig-copy">
          © {new Date().getFullYear()} A.&nbsp;Alex Paul — LIGHTNING ATI
        </p>
      </div>
    </section>
  );
}
