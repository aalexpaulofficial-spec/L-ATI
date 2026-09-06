interface FinalCtaSectionProps {
  onOpenStudio: () => void;
  onCtaHover: (hovered: boolean) => void;
}

export function FinalCtaSection({ onOpenStudio, onCtaHover }: FinalCtaSectionProps) {
  return (
    <section className="section" id="cta" aria-labelledby="final-cta-heading">
      <div className="section-inner">
        <div className="final-cta">
          <span className="section-label" id="final-cta-label">Get Started</span>

          <h2 className="final-cta__headline" id="final-cta-heading">
            Have an idea?
          </h2>

          <p className="final-cta__support">
            Give LIGHTNING the idea. Get the direction to build it.
          </p>

          <button
            type="button"
            className="btn-primary"
            id="final-try-cta"
            onClick={onOpenStudio}
            onMouseEnter={() => onCtaHover(true)}
            onMouseLeave={() => onCtaHover(false)}
          >
            Try Free Unlimited
          </button>

          <div className="final-cta__subtext">Start with a simple idea.</div>
        </div>
      </div>
    </section>
  );
}
