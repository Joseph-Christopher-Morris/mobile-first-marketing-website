/**
 * Performance monitoring and Core Web Vitals tracking
 */

export interface CoreWebVitals {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export interface PerformanceMetrics extends CoreWebVitals {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  navigationStart: number;
  memoryUsage: number;
  connectionType: string;
}

export interface PerformanceBudget {
  lcp: number; // 2.5s
  fid: number; // 100ms
  cls: number; // 0.1
  fcp: number; // 1.8s
  ttfb: number; // 600ms
  loadTime: number; // 3s
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private budget: PerformanceBudget = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 600,
    loadTime: 3000,
  };

  constructor() {
    this.initializeObservers();
    this.measureBasicMetrics();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('lcp', lastEntry.startTime);
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
            this.reportMetric('fid', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.reportMetric('fcp', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }
  }

  private measureBasicMetrics(): void {
    if (typeof window === 'undefined') return;

    // Wait for page load to measure basic metrics
    if (document.readyState === 'complete') {
      this.collectBasicMetrics();
    } else {
      window.addEventListener('load', () => {
        this.collectBasicMetrics();
      });
    }
  }

  private collectBasicMetrics(): void {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      this.metrics.navigationStart =
        navigation.startTime || performance.timeOrigin;
      this.metrics.domContentLoaded =
        navigation.domContentLoadedEventEnd - navigation.startTime;
      this.metrics.loadTime = navigation.loadEventEnd - navigation.startTime;
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }

    // Connection type (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.connectionType = connection.effectiveType || 'unknown';
    }

    // First Paint
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    if (firstPaint) {
      this.metrics.firstPaint = firstPaint.startTime;
    }
  }

  private reportMetric(name: string, value: number): void {
    // Send to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric - ${name}:`, value);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return {
      lcp: this.metrics.lcp || null,
      fid: this.metrics.fid || null,
      cls: this.metrics.cls || null,
      fcp: this.metrics.fcp || null,
      ttfb: this.metrics.ttfb || null,
      loadTime: this.metrics.loadTime || 0,
      domContentLoaded: this.metrics.domContentLoaded || 0,
      firstPaint: this.metrics.firstPaint || 0,
      navigationStart: this.metrics.navigationStart || 0,
      memoryUsage: this.metrics.memoryUsage || 0,
      connectionType: this.metrics.connectionType || 'unknown',
    };
  }

  public checkBudgets(): {
    [K in keyof PerformanceBudget]: {
      value: number | null;
      budget: number;
      passed: boolean;
      score: 'good' | 'needs-improvement' | 'poor';
    };
  } {
    const metrics = this.getMetrics();

    return {
      lcp: this.evaluateMetric(metrics.lcp, this.budget.lcp, [2500, 4000]),
      fid: this.evaluateMetric(metrics.fid, this.budget.fid, [100, 300]),
      cls: this.evaluateMetric(metrics.cls, this.budget.cls, [0.1, 0.25]),
      fcp: this.evaluateMetric(metrics.fcp, this.budget.fcp, [1800, 3000]),
      ttfb: this.evaluateMetric(metrics.ttfb, this.budget.ttfb, [600, 1500]),
      loadTime: this.evaluateMetric(
        metrics.loadTime,
        this.budget.loadTime,
        [3000, 5000]
      ),
    };
  }

  private evaluateMetric(
    value: number | null,
    budget: number,
    thresholds: [number, number]
  ): {
    value: number | null;
    budget: number;
    passed: boolean;
    score: 'good' | 'needs-improvement' | 'poor';
  } {
    if (value === null) {
      return {
        value,
        budget,
        passed: false,
        score: 'poor',
      };
    }

    const [goodThreshold, poorThreshold] = thresholds;
    let score: 'good' | 'needs-improvement' | 'poor';

    if (value <= goodThreshold) {
      score = 'good';
    } else if (value <= poorThreshold) {
      score = 'needs-improvement';
    } else {
      score = 'poor';
    }

    return {
      value,
      budget,
      passed: value <= budget,
      score,
    };
  }

  public setBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...budget };
  }

  public generateReport(): {
    summary: {
      overallScore: 'good' | 'needs-improvement' | 'poor';
      passedBudgets: number;
      totalBudgets: number;
    };
    metrics: PerformanceMetrics;
    budgets: ReturnType<PerformanceMonitor['checkBudgets']>;
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const budgets = this.checkBudgets();
    const recommendations: string[] = [];

    // Generate recommendations based on failed budgets
    Object.entries(budgets).forEach(([key, result]) => {
      if (!result.passed && result.value !== null) {
        switch (key) {
          case 'lcp':
            recommendations.push(
              'Optimize Largest Contentful Paint by reducing server response times and optimizing critical resources'
            );
            break;
          case 'fid':
            recommendations.push(
              'Improve First Input Delay by reducing JavaScript execution time and using code splitting'
            );
            break;
          case 'cls':
            recommendations.push(
              'Reduce Cumulative Layout Shift by setting dimensions for images and avoiding dynamic content insertion'
            );
            break;
          case 'fcp':
            recommendations.push(
              'Optimize First Contentful Paint by eliminating render-blocking resources and optimizing fonts'
            );
            break;
          case 'ttfb':
            recommendations.push(
              'Improve Time to First Byte by optimizing server performance and using CDN'
            );
            break;
          case 'loadTime':
            recommendations.push(
              'Reduce overall load time by optimizing images, minifying resources, and using compression'
            );
            break;
        }
      }
    });

    const passedBudgets = Object.values(budgets).filter(b => b.passed).length;
    const totalBudgets = Object.keys(budgets).length;

    let overallScore: 'good' | 'needs-improvement' | 'poor';
    const passRate = passedBudgets / totalBudgets;

    if (passRate >= 0.8) {
      overallScore = 'good';
    } else if (passRate >= 0.5) {
      overallScore = 'needs-improvement';
    } else {
      overallScore = 'poor';
    }

    return {
      summary: {
        overallScore,
        passedBudgets,
        totalBudgets,
      },
      metrics,
      budgets,
      recommendations,
    };
  }

  public startRealUserMonitoring(): void {
    // Send metrics to analytics service periodically
    setInterval(() => {
      const report = this.generateReport();

      // Send to your analytics service
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'performance_report', {
          event_category: 'Performance',
          custom_parameters: {
            overall_score: report.summary.overallScore,
            passed_budgets: report.summary.passedBudgets,
            total_budgets: report.summary.totalBudgets,
          },
        });
      }
    }, 30000); // Report every 30 seconds
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start RUM in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  performanceMonitor.startRealUserMonitoring();
}

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  /**
   * Preload critical resources
   */
  static preloadCriticalResources(
    resources: Array<{
      href: string;
      as: 'script' | 'style' | 'font' | 'image';
      type?: string;
      crossorigin?: boolean;
    }>
  ): void {
    if (typeof document === 'undefined') return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;

      if (resource.type) {
        link.type = resource.type;
      }

      if (resource.crossorigin) {
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Lazy load images with intersection observer
   */
  static setupLazyImages(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window))
      return;

    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Optimize third-party scripts
   */
  static optimizeThirdPartyScripts(): void {
    if (typeof document === 'undefined') return;

    // Delay non-critical third-party scripts
    const delayedScripts = document.querySelectorAll('script[data-delay]');

    const loadDelayedScripts = () => {
      delayedScripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.getAttribute('data-src') || '';
        newScript.async = true;
        document.head.appendChild(newScript);
      });
    };

    // Load delayed scripts after user interaction or after 3 seconds
    let loaded = false;
    const load = () => {
      if (!loaded) {
        loaded = true;
        loadDelayedScripts();
      }
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
      event => {
        document.addEventListener(event, load, { once: true, passive: true });
      }
    );

    setTimeout(load, 3000);
  }

  /**
   * Implement service worker for caching
   */
  static registerServiceWorker(swPath: string = '/sw.js'): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator))
      return;

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swPath)
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

/**
 * Resource hints utility
 */
export class ResourceHints {
  /**
   * Add DNS prefetch for external domains
   */
  static dnsPrefetch(domains: string[]): void {
    if (typeof document === 'undefined') return;

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  /**
   * Preconnect to critical third-party origins
   */
  static preconnect(
    origins: Array<{ href: string; crossorigin?: boolean }>
  ): void {
    if (typeof document === 'undefined') return;

    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin.href;

      if (origin.crossorigin) {
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Prefetch resources for next navigation
   */
  static prefetch(resources: string[]): void {
    if (typeof document === 'undefined') return;

    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }
}
