/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * LIGHTNING ATI — page composition.
 *
 * Two cinematic chapters, one product surface, and the existing Prompt Studio.
 * The studio's API wiring (isOpen / onClose / initialIdea) is preserved exactly
 * as it was: every request still originates inside PromptStudioModal.
 */
import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { IntelligenceCoreSection } from './components/cinematic/IntelligenceCoreSection';
import { IdeaToIntelligenceSection } from './components/cinematic/IdeaToIntelligenceSection';
import { ProductInterfaceSection } from './components/ProductInterfaceSection';
import { PromptStudioModal } from './components/PromptStudioModal';
import { LightningAiBot } from './components/LightningAiBot';
import { FounderOrigin } from './components/FounderOrigin';

export default function App() {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [initialIdea, setInitialIdea] = useState<string | undefined>(undefined);

  // Lock the page behind the studio without losing scroll position.
  useEffect(() => {
    if (isStudioOpen) {
      document.body.classList.add('studio-open');
    } else {
      document.body.classList.remove('studio-open');
    }
  }, [isStudioOpen]);

  const openStudio = (presetIdea?: string) => {
    setInitialIdea(presetIdea);
    setIsStudioOpen(true);
  };

  const closeStudio = () => {
    setIsStudioOpen(false);
  };

  return (
    <div className="site" id="lightning-ati-root">
      <span id="top" />
      <Navigation onOpenStudio={openStudio} />

      <main className="site__main">
        <IntelligenceCoreSection />
        <IdeaToIntelligenceSection />
        <ProductInterfaceSection onOpenStudio={openStudio} />
      </main>

      <FounderOrigin />

      <LightningAiBot />
      <PromptStudioModal isOpen={isStudioOpen} onClose={closeStudio} initialIdea={initialIdea} />
    </div>
  );
}
