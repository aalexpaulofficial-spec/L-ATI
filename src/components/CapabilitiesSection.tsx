export function CapabilitiesSection() {
  const capabilities = [
    {
      title: 'CREATIVE DIRECTION',
      desc: 'Turns a rough concept into a defined visual and experiential direction.',
    },
    {
      title: 'EXPERIENCE ARCHITECTURE',
      desc: 'Defines pages, sections, hierarchy, navigation, and user flow.',
    },
    {
      title: 'VISUAL SYSTEM',
      desc: 'Specifies typography, color, surfaces, spacing, composition, and visual hierarchy.',
    },
    {
      title: 'MOTION & INTERACTION',
      desc: 'Describes meaningful animation, transitions, scroll behavior, and interaction states.',
    },
    {
      title: 'TECHNICAL DIRECTION',
      desc: 'Produces implementation-ready requirements for modern AI development environments.',
    },
    {
      title: 'RESPONSIVE & ACCESSIBLE',
      desc: 'Accounts for mobile behavior, accessibility, performance, and real-world implementation.',
    },
  ];

  return (
    <section className="section" id="capabilities" aria-labelledby="capabilities-heading">
      <div className="section-inner">
        <span className="section-label" id="capabilities-label">Capabilities</span>

        <h2 className="section-heading" id="capabilities-heading">
          Built to think beyond the idea.
        </h2>

        <p className="section-lead">
          LIGHTNING AI eliminates the gap between high-level ambition and low-level code
          execution, systematically resolving every layer required for digital production.
        </p>

        <div className="capabilities-grid" id="capabilities-matrix">
          {capabilities.map((cap) => (
            <article key={cap.title} className="capability-card">
              <h3 className="capability-card__title">{cap.title}</h3>
              <p className="capability-card__desc">{cap.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
