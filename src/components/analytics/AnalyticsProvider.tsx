'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Analytics from '@/lib/analytics';
import { performanceMonitor } from '@/lib/performance';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics
    Analytics.initialize();

    // Track initial page view
    Analytics.trackPageView(window.location.href, document.title);

    // Initialize performance monitoring
    if (typeof window !== 'undefined') {
      // Track scroll depth
      let maxScrollDepth = 0;
      const trackScrollDepth = () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);

        if (scrollPercent > maxScrollDepth) {
          maxScrollDepth = scrollPercent;
          Analytics.trackScrollDepth(scrollPercent);
        }
      };

      // Track time on page
      const startTime = Date.now();
      const timeIntervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
      const trackedIntervals = new Set<number>();

      const trackTimeOnPage = () => {
        const timeOnPage = Math.floor((Date.now() - startTime) / 1000);

        timeIntervals.forEach(interval => {
          if (timeOnPage >= interval && !trackedIntervals.has(interval)) {
            trackedIntervals.add(interval);
            Analytics.trackTimeOnPage(interval);
          }
        });
      };

      // Set up event listeners
      window.addEventListener('scroll', trackScrollDepth, { passive: true });
      const timeTracker = setInterval(trackTimeOnPage, 5000); // Check every 5 seconds

      // Cleanup function
      return () => {
        window.removeEventListener('scroll', trackScrollDepth);
        clearInterval(timeTracker);
      };
    }
  }, []);

  // Track page changes
  useEffect(() => {
    if (pathname) {
      Analytics.trackPageView(window.location.href, document.title);
    }
  }, [pathname]);

  return <>{children}</>;
}

/**
 * Hook for tracking user interactions
 */
export function useAnalytics() {
  const trackButtonClick = (buttonText: string, location?: string) => {
    Analytics.trackButtonClick(
      buttonText,
      location || window.location.pathname
    );
  };

  const trackServiceInterest = (serviceName: string, action: string) => {
    Analytics.trackServiceInterest(serviceName, action);
  };

  const trackCustomEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    Analytics.trackEvent({
      action,
      category,
      label,
      value,
    });
  };

  return {
    trackButtonClick,
    trackServiceInterest,
    trackCustomEvent,
  };
}
