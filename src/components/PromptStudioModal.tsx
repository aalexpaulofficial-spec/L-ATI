import { useState, useEffect, useRef } from 'react';
import { generatePromptForIdea, SAMPLE_IDEAS } from '../data/promptPresets';
import { MasterPromptSection } from '../types';

interface PromptStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdea?: string;
}

/**
 * Parse Markdown master prompt into structured sections for display.
 */
function parsePromptToSections(promptText: string): MasterPromptSection[] {
  if (!promptText || !promptText.trim()) return [];

  // Matches ## 01 — TITLE or ## 01 - TITLE or ## TITLE
  const sectionRegex = /^##\s+(?:(\d+)\s*[-—–]\s*)?([^\n]+)\n([\s\S]*?)(?=(?:^##\s+)|\Z)/gm;
  const sections: MasterPromptSection[] = [];
  let match: RegExpExecArray | null;
  let fallbackIndex = 1;

  while ((match = sectionRegex.exec(promptText)) !== null) {
    const rawNum = match[1];
    const rawTitle = match[2].trim();
    const content = match[3].trim();
    const num = rawNum ? rawNum.padStart(2, '0') : String(fallbackIndex).padStart(2, '0');
    fallbackIndex++;

    sections.push({
      num,
      title: rawTitle,
      content,
    });
  }

  if (sections.length === 0) {
    sections.push({
      num: '01',
      title: 'MASTER SPECIFICATION',
      content: promptText.trim(),
    });
  }

  return sections;
}

export function PromptStudioModal({
  isOpen,
  onClose,
  initialIdea,
}: PromptStudioModalProps) {
  const [ideaText, setIdeaText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<MasterPromptSection[] | null>(null);
  const [rawPrompt, setRawPrompt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendHost, setBackendHost] = useState('127.0.0.1:8000');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Query server status to display active backend host
  useEffect(() => {
    fetch('/api/lightning/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.backend) {
          setBackendHost(data.backend);
        }
      })
      .catch(() => {
        // Fallback default remains 127.0.0.1:8000
      });
  }, []);

  // Execute real LIGHTNING ATI API generation
  const runGenerate = async (promptIdea: string) => {
    const text = promptIdea.trim();
    if (!text || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/lightning/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: text,
          target_platform: 'lovable',
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detail =
          data?.detail || data?.error || `Generation request failed with status code ${res.status}`;
        throw new Error(detail);
      }

      let parsedSections: MasterPromptSection[] = [];
      let fullText = '';

      if (Array.isArray(data?.sections) && data.sections.length > 0) {
        parsedSections = data.sections;
        fullText =
          data?.prompt ||
          parsedSections.map((s) => `### ${s.num} — ${s.title}\n${s.content}`).join('\n\n');
      } else if (typeof data?.prompt === 'string' && data.prompt.trim()) {
        fullText = data.prompt.trim();
        parsedSections = parsePromptToSections(fullText);
      } else if (data?.data?.prompt) {
        fullText = data.data.prompt.trim();
        parsedSections =
          Array.isArray(data.data.sections) && data.data.sections.length > 0
            ? data.data.sections
            : parsePromptToSections(fullText);
      } else {
        // Fallback to presets if server returned unexpected structure
        parsedSections = generatePromptForIdea(text);
        fullText = parsedSections.map((s) => `### ${s.num} — ${s.title}\n${s.content}`).join('\n\n');
      }

      setRawPrompt(fullText);
      setGeneratedPrompt(parsedSections);
    } catch (err: any) {
      console.error('LIGHTNING ATI generation failed:', err);
      setErrorMessage(err.message || 'Failed to communicate with LIGHTNING backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync initial idea if provided or reset to empty on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (initialIdea) {
        setIdeaText(initialIdea);
        runGenerate(initialIdea);
      } else {
        setIdeaText('');
        setGeneratedPrompt(null);
        setRawPrompt(null);
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 150);
      }
    }
  }, [isOpen, initialIdea]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleGenerate = () => {
    runGenerate(ideaText);
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    const textToCopy =
      rawPrompt ||
      `// LIGHTNING ATI — MASTER WEBSITE PROMPT SPECIFICATION\n// ARTIFICIAL THINKING INTELLIGENCE\n// USER IDEA: "${ideaText}"\n\n` +
        generatedPrompt.map((s) => `### ${s.num} — ${s.title}\n${s.content}`).join('\n\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleReset = () => {
    setGeneratedPrompt(null);
    setRawPrompt(null);
    setErrorMessage(null);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`studio-backdrop ${isOpen ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-heading"
    >
      <div className="studio-container" id="lightning-ati-studio">
        {/* Official Application Header */}
        <header className="studio-header">
          <div className="studio-brand">
            <img
              className="studio-brand__logo"
              src="/assets/brand/jc-lightning-ati-bw.png"
              alt="LIGHTNING ATI Logo"
              aria-hidden="true"
            />
            <span className="studio-brand__name">LIGHTNING ATI</span>
            <button
              type="button"
              className="studio-brand__back"
              onClick={onClose}
              aria-label="Back to overview"
              title="Back to overview"
            >
              ←
            </button>
          </div>

          {/* Backend status intentionally hidden from user-facing UI */}

          <button
            type="button"
            className="studio-close-btn"
            onClick={onClose}
            aria-label="Exit to Overview"
            title="Exit to Overview (Esc)"
          >
            <span className="studio-close-label">BACK TO OVERVIEW</span>
            <span className="studio-close-kbd" aria-hidden="true">ESC</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Full-Screen Workspace Content Area */}
        <main className="studio-content">
          <div className="studio-workspace">
            {!generatedPrompt ? (
              /* Single Direct Flow: USER IDEA -> LIGHTNING ATI UNDERSTANDS -> MASTER PROMPT */
              <div className="studio-input-view">
                <div className="studio-hero-copy">
                  <h2 className="studio-title" id="studio-heading">
                    What’s your idea?
                  </h2>
                  <p className="studio-subtitle">
                    Describe the website you want. LIGHTNING ATI understands your idea, develops the
                    creative direction, and generates a detailed master prompt ready for modern AI development platforms.
                  </p>
                </div>

                {/* Error Banner if generation failed */}
                {errorMessage && (
                  <div className="studio-error-banner" role="alert">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* High-End Input Card */}
                <div className="studio-input-card">
                  <textarea
                    ref={textareaRef}
                    className="studio-textarea"
                    placeholder="Describe your website idea — purpose, visual aesthetic, interactive elements, or target audience…"
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    rows={4}
                    aria-label="Describe your website idea"
                  />

                  <div className="studio-input-footer">
                    <span className="studio-hint">
                      Press <kbd>⌘</kbd> + <kbd>Enter</kbd> to compile
                    </span>

                    <button
                      type="button"
                      className="btn-primary studio-generate-btn"
                      id="studio-generate-master-prompt"
                      onClick={handleGenerate}
                      disabled={!ideaText.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <span className="studio-spinner" aria-hidden="true" />
                          <span>PROCESSING IDEA...</span>
                        </>
                      ) : (
                        <>
                          <span>GENERATE MASTER PROMPT</span>
                          <span aria-hidden="true">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Refined Quick Concept Suggestions */}
                <div className="studio-suggestions">
                  <span className="studio-suggestions__label">Example concepts:</span>
                  <div className="studio-suggestions__list">
                    {SAMPLE_IDEAS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        className="studio-chip"
                        onClick={() => {
                          setIdeaText(sample.idea);
                          textareaRef.current?.focus();
                        }}
                      >
                        {sample.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Generated Result View: Master Prompt Document */
              <div className="studio-result-view">
                <div className="studio-result-header">
                  <div className="studio-result-summary">
                    <div className="studio-result-badge">
                      <span className="brand-logo__dot" aria-hidden="true" />
                      <span>LIGHTNING ATI MASTER PROMPT READY</span>
                    </div>
                    <h2 className="studio-result-title">
                      Master Website Specification
                    </h2>
                    <p className="studio-result-idea">“{ideaText}”</p>
                  </div>

                  <div className="studio-result-actions">
                    <button
                      type="button"
                      className="btn-secondary studio-action-btn studio-action-btn--reset"
                      onClick={handleReset}
                    >
                      ← Edit Idea
                    </button>

                    <button
                      type="button"
                      className="btn-primary studio-action-btn studio-action-btn--copy"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>Copy Master Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Master Prompt Document Sections */}
                <div className="studio-prompt-document">
                  {generatedPrompt.map((section) => (
                    <article key={section.num} className="studio-prompt-section">
                      <div className="studio-section-header">
                        <span className="studio-section-num">{section.num}</span>
                        <h3 className="studio-section-title">{section.title}</h3>
                      </div>
                      <p className="studio-section-body">{section.content}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
