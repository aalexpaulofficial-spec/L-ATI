interface HeroSectionProps {
  onOpenStudio: (initialIdea?: string) => void;
  onCtaHover: (hovered: boolean) => void;
}

export function HeroSection({ onOpenStudio, onCtaHover }: HeroSectionProps) {
  return (
    <section className="hero" id="hero" aria-label="LIGHTNING ATI Hero">
      {/* Subtle Futuristic Architectural / HUD Line in top right corner */}
      <div className="hero__hud-accent" aria-hidden="true">
        <svg width="220" height="32" viewBox="0 0 220 32" fill="none">
          <path
            d="M220 3 H90 L72 26 H0"
            stroke="rgba(0, 180, 255, 0.45)"
            strokeWidth="1.25"
          />
          <circle cx="90" cy="3" r="2.5" fill="#00e5ff" />
          <circle cx="0" cy="26" r="2" fill="#00e5ff" />
        </svg>
      </div>

      <div className="hero__content" id="hero-editorial-column">
        {/* Brand Display: LIGHTNING ATI */}
        <div className="hero__brand" id="hero-brand-header">
          <span className="hero__brand-name">LIGHTNING</span>
          <span className="hero__brand-ati">ATI</span>
        </div>
        <div className="hero__brand-subtitle" id="hero-brand-subtitle">
          Artificial Thinking Intelligence
        </div>

        {/* Subtle Horizontal Lens Flare Streak under brand */}
        <div className="hero__flare-divider" aria-hidden="true" />

        {/* Eyebrow */}
        <div className="eyebrow" id="hero-eyebrow">
          <span className="eyebrow__pulse" aria-hidden="true" />
          <span className="eyebrow__text">AI WEBSITE PROMPT INTELLIGENCE</span>
        </div>

        {/* Main Headline */}
        <h1 className="hero__headline" id="hero-main-title">
          <span className="hero__headline-line">TURN YOUR IDEA</span>
          <span className="hero__headline-line">
            INTO <span className="hero__headline-accent">THE PROMPT.</span>
          </span>
        </h1>

        {/* Subtle Horizontal Lens Flare Streak under headline */}
        <div className="hero__flare-divider hero__flare-divider--headline" aria-hidden="true" />

        {/* Supporting text */}
        <p className="hero__supporting" id="hero-description">
          Describe the website you want. LIGHTNING ATI understands your idea, develops the
          creative direction, and generates a detailed master prompt ready for modern AI
          development platforms.
        </p>

        {/* Action Buttons */}
        <div className="hero__cta-group">
          <button
            type="button"
            className="btn-primary"
            id="hero-primary-cta"
            onClick={() => onOpenStudio()}
            onMouseEnter={() => onCtaHover(true)}
            onMouseLeave={() => onCtaHover(false)}
          >
            <span>TRY FREE UNLIMITED</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            id="hero-secondary-action"
            onClick={() =>
              onOpenStudio(
                'A cinematic architectural studio website with full-screen interactive 3D spaces, minimal monochrome typography, and lightning-fast transitions.'
              )
            }
            onMouseEnter={() => onCtaHover(true)}
            onMouseLeave={() => onCtaHover(false)}
          >
            <span>SEE HOW IT WORKS</span>
            <span className="btn-secondary__arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>

        {/* Developer / System Status Detail */}
        <div className="hero__system-status" aria-label="System Developer Status">
          <span className="hero__status-dot" aria-hidden="true" />
          <span className="hero__status-model">LIGHTNING-1</span>
          <span className="hero__status-sep">/</span>
          <span className="hero__status-backend">Backend: 127.0.0.1:8000</span>
        </div>
      </div>
    </section>
  );
}



