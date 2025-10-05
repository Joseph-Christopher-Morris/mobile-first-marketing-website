/**
 * Performance monitoring utilities for mobile-first optimization
 */

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

/**
 * Measure and report Core Web Vitals
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver(list => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // Navigation timing metrics
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.metrics.ttfb =
              navigation.responseStart - navigation.requestStart;
            this.reportMetric('TTFB', this.metrics.ttfb);
          }

          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(
            entry => entry.name === 'first-contentful-paint'
          );
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
            this.reportMetric('FCP', fcpEntry.startTime);
          }
        }, 0);
      });
    }
  }

  private reportMetric(name: string, value: number) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${value.toFixed(2)}ms`);
    }

    // Send to analytics system
    if (typeof window !== 'undefined') {
      // Import Analytics dynamically to avoid circular dependencies
      import('./analytics')
        .then(({ default: Analytics }) => {
          const rating = this.getRating(name, value);
          Analytics.trackWebVitals({
            name,
            value,
            rating,
          });
        })
        .catch(error => {
          console.warn(
            'Failed to send performance metric to analytics:',
            error
          );
        });
    }
  }

  private getRating(
    name: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if metrics meet Core Web Vitals thresholds
   */
  checkThresholds(): {
    [key: string]: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  } {
    return {
      LCP: this.metrics.lcp
        ? this.metrics.lcp <= 2500
          ? 'good'
          : this.metrics.lcp <= 4000
            ? 'needs-improvement'
            : 'poor'
        : 'unknown',
      FID: this.metrics.fid
        ? this.metrics.fid <= 100
          ? 'good'
          : this.metrics.fid <= 300
            ? 'needs-improvement'
            : 'poor'
        : 'unknown',
      CLS:
        this.metrics.cls !== undefined
          ? this.metrics.cls <= 0.1
            ? 'good'
            : this.metrics.cls <= 0.25
              ? 'needs-improvement'
              : 'poor'
          : 'unknown',
    };
  }

  /**
   * Cleanup observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string) => {
  if (typeof window === 'undefined') return { start: () => {}, end: () => {} };

  let startTime: number;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }

      return renderTime;
    },
  };
};

/**
 * Measure resource loading time
 */
export const measureResourceLoad = (
  resourceName: string,
  resourceUrl: string
) => {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver(list => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.name.includes(resourceUrl)) {
        const loadTime =
          (entry as PerformanceResourceTiming).responseEnd - entry.startTime;
        console.log(`${resourceName} load time: ${loadTime.toFixed(2)}ms`);
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
};

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for component performance monitoring
 */
export const usePerformanceMonitor = (componentName: string) => {
  const measure = measureRenderTime(componentName);

  return {
    startMeasure: measure.start,
    endMeasure: measure.end,
    getMetrics: () => performanceMonitor.getMetrics(),
    checkThresholds: () => performanceMonitor.checkThresholds(),
  };
};
