'use client';

import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useExitIntent } from '@/hooks/useExitIntent';
import { ExitIntentPopup } from './ExitIntentPopup';

// Hard OFF flag for exit intent popup (default disabled)
const ENABLE_EXIT_INTENT = false;

/**
 * Global tracking provider for scroll depth and exit intent
 * Add this to layout.tsx to enable site-wide tracking
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  // Enable scroll depth tracking
  useScrollDepth();
  
  // Conditionally enable exit intent detection only if flag is true
  const exitIntentState = ENABLE_EXIT_INTENT ? useExitIntent() : { showExitIntent: false, closeExitIntent: () => {} };
  
  return (
    <>
      {children}
      {ENABLE_EXIT_INTENT && <ExitIntentPopup show={exitIntentState.showExitIntent} onClose={exitIntentState.closeExitIntent} />}
    </>
  );
}
