import { useState } from 'react';

export function FooterSection() {
  const [showContactNotice, setShowContactNotice] = useState(false);

  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div>
          <div className="footer-brand__name">
            <span className="brand-logo__dot" style={{ marginRight: '8px' }} />
            LIGHTNING AI
          </div>
          <div className="footer-brand__tag">AI Website Prompt Intelligence</div>
        </div>

        <div className="footer-links">
          <a href="#product" className="footer-link">
            Product
          </a>
          <a href="#how-it-works" className="footer-link">
            How It Works
          </a>
          <a href="#capabilities" className="footer-link">
            Capabilities
          </a>
          <button
            type="button"
            className="footer-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setShowContactNotice(true)}
          >
            Contact
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="#privacy" className="footer-link" style={{ fontSize: '11px', color: 'var(--text-dimmer)' }}>
            Privacy
          </a>
          <span style={{ color: 'var(--text-dimmer)', fontSize: '11px' }}>&bull;</span>
          <a href="#terms" className="footer-link" style={{ fontSize: '11px', color: 'var(--text-dimmer)' }}>
            Terms
          </a>
        </div>
      </div>

      {showContactNotice && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '20px auto 0',
            padding: '12px 16px',
            background: 'rgba(0, 136, 255, 0.08)',
            border: '1px solid rgba(0, 136, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: '#ffffff',
          }}
        >
          <span>
            Direct inquiries &amp; enterprise research access:{' '}
            <strong style={{ color: 'var(--electric-blue-bright)' }}>hello@lightning.ai</strong>
          </span>
          <button
            type="button"
            onClick={() => setShowContactNotice(false)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}
    </footer>
  );
}
