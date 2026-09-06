/**
 * LIGHTNING ATI — the product surface.
 *
 * The one place on the page that takes input. It does not talk to the API
 * itself: it hands the idea to the existing Prompt Studio, which owns every
 * request to /api/lightning/* exactly as it did before. This component is
 * presentation and hand-off only.
 */
import { useState } from 'react';

export interface ProductInterfaceSectionProps {
  onOpenStudio: (idea?: string) => void;
}

const STARTERS = [
  'A booking site for a private chef',
  'A portfolio for an architecture studio',
  'A dashboard for tracking freight',
];

export function ProductInterfaceSection({ onOpenStudio }: ProductInterfaceSectionProps) {
  const [idea, setIdea] = useState('');
  const trimmed = idea.trim();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onOpenStudio(trimmed || undefined);
  };

  return (
    <section id="lightning-studio" className="product" aria-labelledby="product-title">
      <div className="product__inner">
        <header className="product__head">
          <p className="eyebrow is-shown">Lightning Studio</p>
          <h2 id="product-title" className="product__title">
            What&rsquo;s your idea?
          </h2>
          <p className="lede is-shown">
            Describe it the way you would to a colleague. LIGHTNING-1 does the rest.
          </p>
        </header>

        <form className="composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="idea-input">
            Describe your website idea
          </label>
          <textarea
            id="idea-input"
            className="composer__field"
            placeholder="Describe your website idea…"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit(event);
            }}
            rows={3}
            spellCheck={false}
          />
          <div className="composer__foot">
            <p className="composer__hint">
              <kbd>⌘</kbd>
              <kbd>↵</kbd>
              <span>to generate</span>
            </p>
            <button type="submit" className="btn btn--primary composer__go">
              Generate master prompt
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M2 8h10.5M9 4.5 12.5 8 9 11.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </form>

        <div className="starters">
          <p className="starters__label">Or start from</p>
          <ul className="starters__list">
            {STARTERS.map((starter) => (
              <li key={starter}>
                <button type="button" className="chip" onClick={() => setIdea(starter)}>
                  {starter}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
