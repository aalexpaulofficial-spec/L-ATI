/**
 * LIGHTNING ATI — masthead with collapsible menu drawer.
 *
 * Topbar: brand left, menu icon right.
 * Click the menu icon → a full-width slide-down panel opens with
 * nav links + action buttons. Click the × icon or outside to close.
 */
import { useEffect, useRef, useState } from 'react';

export interface NavigationProps {
  onOpenStudio: (idea?: string) => void;
}

const LINKS = [
  { label: 'Product', href: '#intelligence-core' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Try Lightning', href: '#lightning-studio' },
];

/** Detect iOS (iPhone / iPad / iPod, including iPad on iOS 13+ that reports as MacIntel) */
function detectIOS(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** True when the app is running from the home screen (standalone mode) */
function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

export function Navigation({ onOpenStudio }: NavigationProps) {
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const iosGuideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deferredPrompt = useRef<any>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  /* ── Close menu when clicking outside ──────────────────────────────────── */
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  /* ── Close menu on link click ───────────────────────────────────────────── */
  const handleLinkClick = () => setMenuOpen(false);

  /* ── Scroll lift ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > window.innerHeight * 0.4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── PWA install detection ───────────────────────────────────────────── */
  useEffect(() => {
    setIsIOS(detectIOS());
    setIsInstalled(isRunningStandalone());

    const beforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
    };
    window.addEventListener('beforeinstallprompt', beforeInstall);

    const onInstalled = () => {
      setIsInstalled(true);
      deferredPrompt.current = null;
    };
    window.addEventListener('appinstalled', onInstalled);

    const mq = window.matchMedia('(display-mode: standalone)');
    const onMQChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };
    mq.addEventListener('change', onMQChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      mq.removeEventListener('change', onMQChange);
    };
  }, []);

  /* ── FREE DOWNLOAD handler ───────────────────────────────────────────── */
  const handleDownload = async () => {
    if (isInstalled) return;

    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      deferredPrompt.current = null;
    } else if (isIOS) {
      setShowIOSGuide(true);
      if (iosGuideTimer.current) clearTimeout(iosGuideTimer.current);
      iosGuideTimer.current = setTimeout(() => setShowIOSGuide(false), 6000);
    }
  };

  const downloadLabel = isInstalled ? 'Already installed' : 'Free download';

  return (
    <>
      <header className={`masthead${lifted ? ' is-lifted' : ''}${menuOpen ? ' menu-is-open' : ''}`}>
        <a className="skip-link" href="#lightning-studio">
          Skip to the prompt composer
        </a>

        {/* ── Top bar: brand + menu toggle ── */}
        <div className="masthead__bar" ref={panelRef}>
          <a className="brand" href="#top" aria-label="LIGHTNING ATI — home">
            <img className="brand__mark" src="/assets/brand/jc-lightning-ati-bw.png" alt="LIGHTNING ATI Logo" />
            <span className="brand__word">
              Lightning<span className="brand__ati">ATI</span>
            </span>
          </a>

          {/* Menu toggle button */}
          <button
            type="button"
            className={`masthead__menu-btn${menuOpen ? ' is-active' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              /* × close icon */
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              /* ≡ hamburger icon */
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          {/* ── Slide-down nav panel ── */}
          <nav
            className={`masthead__panel${menuOpen ? ' is-open' : ''}`}
            aria-label="Primary navigation"
            aria-hidden={!menuOpen}
          >
            <ul className="masthead__panel-links">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={handleLinkClick}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="masthead__panel-actions">
              {/* FREE DOWNLOAD */}
              <div className="install-wrap">
                <button
                  type="button"
                  className={`btn btn--download${isInstalled ? ' is-installed' : ''}`}
                  onClick={handleDownload}
                  disabled={isInstalled}
                  aria-label={downloadLabel}
                  title={isInstalled ? 'Already installed on your device' : 'Download and use offline'}
                >
                  {isInstalled ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M1.5 6.5L4.5 9.5L10.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Already installed
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1v7M3 6l3 3 3-3M1 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Free download
                    </>
                  )}
                </button>

                {showIOSGuide && (
                  <div className="ios-guide" role="tooltip" aria-live="polite">
                    <span className="ios-guide__arrow" aria-hidden="true">▲</span>
                    Tap{' '}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle' }}>
                      <path d="M12 2v12M7 7l5-5 5 5M5 21h14"/>
                    </svg>
                    {' '}Share, then{' '}
                    <strong>Add to Home Screen</strong>
                  </div>
                )}
              </div>

              {/* TRY FREE UNLIMITED */}
              <button
                type="button"
                className="btn btn--ghost masthead__cta"
                onClick={() => { onOpenStudio(); setMenuOpen(false); }}
              >
                Try free unlimited
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Backdrop overlay */}
      {menuOpen && (
        <div
          className="masthead__backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
