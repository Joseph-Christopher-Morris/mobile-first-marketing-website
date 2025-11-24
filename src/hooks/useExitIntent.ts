import { useEffect, useState } from 'react';

/**
 * Detect exit intent (mouse leaving viewport)
 * Shows popup when user is about to leave
 */
export function useExitIntent() {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Check if already shown or dismissed in this session
    const hasShown = sessionStorage.getItem('exit_intent_shown');
    const hasDismissed = sessionStorage.getItem('exit_intent_dismissed');
    const visitedAuditPage = sessionStorage.getItem('visited_audit_page');
    
    if (hasShown || hasDismissed || visitedAuditPage) return;
    
    // Wait 5 seconds before enabling exit intent
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 5000);
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if:
      // 1. Mouse leaves from top of viewport
      // 2. Ready timer has elapsed
      // 3. Not already shown/dismissed
      if (e.clientY <= 0 && isReady && !hasShown && !hasDismissed) {
        setShowExitIntent(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
        
        // Track in GA4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'exit_intent_triggered', {
            page_path: window.location.pathname
          });
        }
      }
    };
    
    if (isReady) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      clearTimeout(readyTimer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isReady]);
  
  const closeExitIntent = () => {
    setShowExitIntent(false);
    sessionStorage.setItem('exit_intent_dismissed', 'true');
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_closed', {
        page_path: window.location.pathname
      });
    }
  };
  
  return { showExitIntent, closeExitIntent };
}
