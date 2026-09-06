export function BuildEnvironmentsSection() {
  const platforms = [
    'Lovable',
    'Replit',
    'v0',
    'Google AI Studio',
    'Bolt',
    'Cursor',
    'Claude coding workflows',
  ];

  return (
    <section className="section" id="environments" aria-labelledby="environments-heading">
      <div className="section-inner">
        <span className="section-label" id="environments-label">Built for AI Development</span>

        <h2 className="section-heading" id="environments-heading">
          One prompt. Many build environments.
        </h2>

        <p className="section-lead">
          Use the generated master prompt as the creative and technical foundation for your
          preferred AI development workflow.
        </p>

        {/* Platforms List */}
        <div className="platforms-cluster" id="supported-build-environments">
          {platforms.map((platform) => (
            <div key={platform} className="platform-pill">
              {platform}
            </div>
          ))}
        </div>

        {/* Clear Message Doctrine */}
        <div className="platform-doctrine">
          <span>LIGHTNING creates the instruction.</span>
          <br />
          <span style={{ color: '#ffffff', opacity: 0.85 }}>
            Your preferred AI development environment executes it.
          </span>
        </div>
      </div>
    </section>
  );
}
