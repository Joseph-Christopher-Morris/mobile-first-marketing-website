import { useEffect } from 'react';

/**
 * Track scroll depth for engagement analysis
 * Sends GA4 events at 25%, 50%, 75%, and 100% scroll milestones
 */
export function useScrollDepth() {
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();
    
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          
          // Send GA4 event
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'scroll_depth', {
              depth: `${milestone}%`,
              page_path: window.location.pathname,
              page_title: document.title
            });
          }
          
          // Log for debugging
          console.log(`Scroll depth: ${milestone}% on ${window.location.pathname}`);
        }
      });
    };
    
    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);
}
