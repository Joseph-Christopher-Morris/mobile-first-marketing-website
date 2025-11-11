"use client";

import { useEffect } from 'react';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
};

// Get rating based on thresholds
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Send metric to Google Analytics
const sendToGA = (metric: WebVitalMetric) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_map: {
        metric_rating: metric.rating,
        metric_delta: metric.delta
      }
    });
  }
};

// Send metric to console for development
const logMetric = (metric: WebVitalMetric) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Core Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id
    });
  }
};

// Performance budget alerts
const checkPerformanceBudget = (metric: WebVitalMetric) => {
  const budgets = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800
  };

  const budget = budgets[metric.name as keyof typeof budgets];
  if (budget && metric.value > budget) {
    console.warn(`[Performance Budget] ${metric.name} exceeded budget:`, {
      value: metric.value,
      budget: budget,
      overage: metric.value - budget
    });

    // Send alert to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_budget_exceeded', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value - budget)
      });
    }
  }
};

export default function CoreWebVitalsMonitor() {
  useEffect(() => {
    // Dynamic import of web-vitals library
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      const handleMetric = (metric: any) => {
        const webVitalMetric: WebVitalMetric = {
          name: metric.name,
          value: metric.value,
          rating: getRating(metric.name, metric.value),
          delta: metric.delta,
          id: metric.id
        };

        // Log metric
        logMetric(webVitalMetric);

        // Send to Google Analytics
        sendToGA(webVitalMetric);

        // Check performance budget
        checkPerformanceBudget(webVitalMetric);
      };

      // Monitor all Core Web Vitals
      onCLS(handleMetric);
      onFID(handleMetric);
      onFCP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
    }).catch(error => {
      console.warn('[Core Web Vitals] Failed to load web-vitals library:', error);
    });
  }, []);

  // Real User Monitoring (RUM) for additional metrics
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Monitor navigation timing
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;

          // Calculate custom metrics
          const metrics = {
            dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp_connect: navEntry.connectEnd - navEntry.connectStart,
            server_response: navEntry.responseStart - navEntry.requestStart,
            dom_processing: navEntry.domContentLoadedEventStart - navEntry.responseEnd,
            resource_load: navEntry.loadEventStart - navEntry.domContentLoadedEventEnd
          };

          // Send custom metrics to GA
          Object.entries(metrics).forEach(([name, value]) => {
            if (window.gtag && value > 0) {
              window.gtag('event', 'custom_timing', {
                event_category: 'Performance',
                event_label: name,
                value: Math.round(value)
              });
            }
          });
        }

        // Monitor resource timing for images
        if (entry.entryType === 'resource' && entry.name.includes('/images/')) {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;

          if (window.gtag && loadTime > 0) {
            window.gtag('event', 'image_load_time', {
              event_category: 'Performance',
              event_label: 'image_loading',
              value: Math.round(loadTime)
            });
          }
        }
      }
    });

    // Observe navigation and resource timing
    try {
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('[RUM] Performance Observer not supported:', error);
    }

    return () => observer.disconnect();
  }, []);

  return null; // This component doesn't render anything
}
