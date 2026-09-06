/**
 * LIGHTNING ATI — masthead.
 *
 * Reads as a title card over the opening plate and only earns a surface once the
 * page has scrolled off the first frame. The emblem is the supplied artwork,
 * placed at its intended size — never redrawn in markup.
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
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const iosGuideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deferredPrompt = useRef<any>(null);

  /* ── Mobile horizontal slider rail tracking & drag ────────────────────── */
  const railRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const updateScrollProgress = () => {
    const el = railRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, el.scrollLeft / maxScroll)));
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    updateScrollProgress();
    el.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    return () => {
      el.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = railRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = railRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftStart.current - walk;
  };

  const onMouseUpOrLeave = () => {
    isDragging.current = false;
  };

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

    /* Chrome / Edge / Samsung Internet — capture the install prompt */
    const beforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
    };
    window.addEventListener('beforeinstallprompt', beforeInstall);

    /* Mark as installed once the browser confirms install */
    const onInstalled = () => {
      setIsInstalled(true);
      deferredPrompt.current = null;
    };
    window.addEventListener('appinstalled', onInstalled);

    /* Also watch for standalone mode change (covers all cases) */
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
    if (isInstalled) return; // button is disabled — already installed

    if (deferredPrompt.current) {
      /* Android / Desktop Chrome: native install prompt */
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      deferredPrompt.current = null;
    } else if (isIOS) {
      /* iOS Safari: guide the user to "Add to Home Screen" */
      setShowIOSGuide(true);
      if (iosGuideTimer.current) clearTimeout(iosGuideTimer.current);
      iosGuideTimer.current = setTimeout(() => setShowIOSGuide(false), 6000);
    }
    /* On unsupported browsers do nothing — button stays visible but inactive */
  };

  const downloadLabel = isInstalled ? 'Already installed' : 'Free download';

  return (
    <header className={`masthead${lifted ? ' is-lifted' : ''}`}>
      <a className="skip-link" href="#lightning-studio">
        Skip to the prompt composer
      </a>
      <div className="masthead__inner">
        <a className="brand" href="#top" aria-label="LIGHTNING ATI — home">
          <img className="brand__mark" src="/assets/brand/jc-lightning-ati-bw.png" alt="LIGHTNING ATI Logo" />
          <span className="brand__word">
            Lightning<span className="brand__ati">ATI</span>
          </span>
        </a>

        <div className="masthead__slider-container">
          <div
            ref={railRef}
            className="masthead__rail-wrap"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUpOrLeave}
            onMouseLeave={onMouseUpOrLeave}
          >
            <nav className="masthead__nav" aria-label="Primary">
              <ul>
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="masthead__actions">
              {/* FREE DOWNLOAD — PWA install button */}
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
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M1.5 6.5L4.5 9.5L10.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Already installed
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M6 1v7M3 6l3 3 3-3M1 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Free download
                    </>
                  )}
                </button>

                {/* iOS "Add to Home Screen" guide — appears below the button */}
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

              <button type="button" className="btn btn--ghost masthead__cta" onClick={() => onOpenStudio()}>
                Try free unlimited
              </button>
            </div>
          </div>

          {/* Mobile slide bar indicator */}
          <div className="masthead__slide-track" aria-hidden="true">
            <div
              className="masthead__slide-thumb"
              style={{
                transform: `translateX(${scrollProgress * 200}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
