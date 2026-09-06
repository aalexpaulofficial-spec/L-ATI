export function WhyLightningSection() {
  return (
    <section className="section" id="why" aria-labelledby="why-lightning-heading">
      <div className="section-inner">
        <span className="section-label" id="why-lightning-label">Why Lightning</span>

        <h2 className="section-heading" id="why-lightning-heading">
          Not a template. A better starting point.
        </h2>

        <div className="why-lightning-box">
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(18px, 1.3vw, 24px)',
              lineHeight: 1.65,
              color: '#ffffff',
              margin: 0,
              maxWidth: '65ch',
            }}
          >
            LIGHTNING AI is designed to move beyond generic website prompts. It preserves the
            original idea while adding the visual, experiential, structural, and technical
            detail required to turn an idea into a serious website specification.
          </p>
        </div>
      </div>
    </section>
  );
}
