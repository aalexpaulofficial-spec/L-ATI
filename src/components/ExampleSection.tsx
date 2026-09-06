import { useState } from 'react';
import { DEFAULT_MASTER_SECTIONS } from '../data/promptPresets';

interface ExampleSectionProps {
  onOpenStudio: () => void;
}

export function ExampleSection({ onOpenStudio }: ExampleSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySpec = () => {
    const fullText = DEFAULT_MASTER_SECTIONS.map(
      (s) => `${s.num} — ${s.title}\n${s.content}`
    ).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section" id="how-it-works" aria-labelledby="example-section-heading">
      <div className="section-inner">
        <span className="section-label" id="how-it-works-label">
          How It Works
        </span>

        <h2 className="section-heading" id="example-section-heading">
          Precision specification. Generated in seconds.
        </h2>

        <p className="section-lead">
          See how a simple single-sentence idea expands into an exhaustive, 12-vector master
          prompt calibrated for deterministic code generation.
        </p>

        {/* Technical Document Preview */}
        <div className="spec-document" id="technical-master-document">
          {/* Document Top Bar */}
          <div className="spec-header">
            <span className="spec-header__title">
              LIGHTNING AI // SPECIFICATION COMPILER V2.6
            </span>
            <span className="spec-header__status">
              <span className="brand-logo__dot" />
              STATUS: READY FOR AI BUILDER
            </span>
          </div>

          {/* 1) User Idea Box */}
          <div className="spec-input-box">
            <div className="spec-input-box__label">INPUT // YOUR IDEA</div>
            <p className="spec-input-box__quote">
              &ldquo;Create a premium cinematic IT solutions website with an exploding gaming
              PC hero animation.&rdquo;
            </p>
          </div>

          {/* Transition Indicator */}
          <div className="spec-transition-bar">
            <span>→ LIGHTNING UNDERSTANDS INTENT &amp; EXPANDS ARCHITECTURE</span>
            <span>MASTER WEBSITE GENERATION PROMPT</span>
          </div>

          {/* 2) 12 Structured Sections Preview */}
          <div className="spec-output-grid" id="master-sections-preview">
            {DEFAULT_MASTER_SECTIONS.map((sec) => (
              <div key={sec.num} className="spec-item">
                <div className="spec-item__header">
                  <span className="spec-item__num">{sec.num} —</span>
                  <span>{sec.title}</span>
                </div>
                <p className="spec-item__body">{sec.content}</p>
              </div>
            ))}
          </div>

          {/* Document Footer Action */}
          <div
            style={{
              padding: '16px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-dimmer)',
                letterSpacing: '0.1em',
              }}
            >
              12 / 12 VECTORS VERIFIED &bull; 0 SYNTAX ERRORS
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopySpec}
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {copied ? '✓ COPIED SPECIFICATION' : 'COPY SPECIFICATION'}
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={onOpenStudio}
                style={{ padding: '8px 18px', fontSize: '11px' }}
              >
                Generate Your Own Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
