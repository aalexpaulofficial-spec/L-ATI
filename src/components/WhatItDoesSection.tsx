export function WhatItDoesSection() {
  const steps = [
    {
      num: '01',
      title: 'YOUR IDEA',
      desc: 'Raw concept, rough notes, or vision',
      highlight: false,
    },
    {
      num: '02',
      title: 'LIGHTNING AI',
      desc: 'Prompt intelligence & creative synthesis',
      highlight: true,
    },
    {
      num: '03',
      title: 'MASTER PROMPT',
      desc: '12-part comprehensive specification',
      highlight: false,
    },
    {
      num: '04',
      title: 'AI WEBSITE BUILDER',
      desc: 'v0, Lovable, Bolt, Cursor, AI Studio',
      highlight: false,
    },
  ];

  return (
    <section className="section" id="product" aria-labelledby="what-lightning-does-heading">
      <div className="section-inner">
        <span className="section-label" id="what-lightning-does-label">
          What Lightning Does
        </span>

        <h2 className="section-heading" id="what-lightning-does-heading">
          From a simple idea to a complete creative direction.
        </h2>

        <p className="section-lead">
          LIGHTNING AI interprets your website idea and transforms it into a structured
          master prompt covering experience, visual language, pages, content, interaction,
          motion, responsiveness, accessibility, performance, and implementation requirements.
        </p>

        {/* Horizontal Transformation */}
        <div className="transform-chain" id="transformation-pipeline">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className={`transform-node ${step.highlight ? 'transform-node--highlight' : ''}`}
            >
              <div>
                <div className="transform-node__step">PHASE {step.num}</div>
                <h3 className="transform-node__title">{step.title}</h3>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontSize: '13px',
                    color: 'var(--text-dim)',
                    marginTop: '8px',
                    marginBottom: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="transform-node__arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
