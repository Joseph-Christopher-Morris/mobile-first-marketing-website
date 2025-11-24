'use client';

import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useExitIntent } from '@/hooks/useExitIntent';
import { ExitIntentPopup } from './ExitIntentPopup';

/**
 * Global tracking provider for scroll depth and exit intent
 * Add this to layout.tsx to enable site-wide tracking
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
  // Enable scroll depth tracking
  useScrollDepth();
  
  // Enable exit intent detection
  const { showExitIntent, closeExitIntent } = useExitIntent();
  
  return (
    <>
      {children}
      <ExitIntentPopup show={showExitIntent} onClose={closeExitIntent} />
    </>
  );
}
