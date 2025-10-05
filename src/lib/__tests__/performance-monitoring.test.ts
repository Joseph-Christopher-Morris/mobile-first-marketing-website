import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  PerformanceMonitor,
  PerformanceOptimizer,
  ResourceHints,
} from '../performance-monitoring';

// Mock performance API
const mockPerformanceObserver = vi.fn();
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

mockPerformanceObserver.mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  configurable: true,
  value: mockPerformanceObserver,
});

// Mock performance.getEntriesByType
Object.defineProperty(global.performance, 'getEntriesByType', {
  writable: true,
  configurable: true,
  value: vi.fn(() => []),
});

// Mock performance.timeOrigin
Object.defineProperty(global.performance, 'timeOrigin', {
  writable: true,
  configurable: true,
  value: 1000,
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = new PerformanceMonitor();
  });

  afterEach(() => {
    monitor.cleanup();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default metrics', () => {
      const metrics = monitor.getMetrics();

      expect(metrics).toHaveProperty('lcp');
      expect(metrics).toHaveProperty('fid');
      expect(metrics).toHaveProperty('cls');
      expect(metrics).toHaveProperty('fcp');
      expect(metrics).toHaveProperty('ttfb');
      expect(metrics).toHaveProperty('loadTime');
    });

    it('should set up performance observers', () => {
      // PerformanceObserver should be called for each metric type
      expect(mockPerformanceObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
    });
  });

  describe('metrics collection', () => {
    it('should return current metrics', () => {
      const metrics = monitor.getMetrics();

      expect(typeof metrics.loadTime).toBe('number');
      expect(typeof metrics.domContentLoaded).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(typeof metrics.connectionType).toBe('string');
    });

    it('should handle null values for unavailable metrics', () => {
      const metrics = monitor.getMetrics();

      // These might be null if not yet measured
      expect(metrics.lcp === null || typeof metrics.lcp === 'number').toBe(
        true
      );
      expect(metrics.fid === null || typeof metrics.fid === 'number').toBe(
        true
      );
      expect(metrics.cls === null || typeof metrics.cls === 'number').toBe(
        true
      );
    });
  });

  describe('budget checking', () => {
    it('should check performance budgets', () => {
      const budgets = monitor.checkBudgets();

      expect(budgets).toHaveProperty('lcp');
      expect(budgets).toHaveProperty('fid');
      expect(budgets).toHaveProperty('cls');
      expect(budgets).toHaveProperty('fcp');
      expect(budgets).toHaveProperty('ttfb');
      expect(budgets).toHaveProperty('loadTime');

      Object.values(budgets).forEach(budget => {
        expect(budget).toHaveProperty('value');
        expect(budget).toHaveProperty('budget');
        expect(budget).toHaveProperty('passed');
        expect(budget).toHaveProperty('score');
        expect(['good', 'needs-improvement', 'poor']).toContain(budget.score);
      });
    });

    it('should allow custom budget configuration', () => {
      monitor.setBudget({ lcp: 3000, fid: 150 });

      const budgets = monitor.checkBudgets();
      expect(budgets.lcp.budget).toBe(3000);
      expect(budgets.fid.budget).toBe(150);
    });
  });

  describe('report generation', () => {
    it('should generate comprehensive performance report', () => {
      const report = monitor.generateReport();

      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('budgets');
      expect(report).toHaveProperty('recommendations');

      expect(report.summary).toHaveProperty('overallScore');
      expect(report.summary).toHaveProperty('passedBudgets');
      expect(report.summary).toHaveProperty('totalBudgets');

      expect(['good', 'needs-improvement', 'poor']).toContain(
        report.summary.overallScore
      );
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should provide relevant recommendations for poor metrics', () => {
      // Mock poor performance metrics
      const poorMonitor = new PerformanceMonitor();
      poorMonitor.setBudget({ lcp: 1000, fid: 50, cls: 0.05 }); // Very strict budgets

      const report = poorMonitor.generateReport();

      // Should have recommendations for failing metrics
      expect(report.recommendations.length).toBeGreaterThan(0);

      poorMonitor.cleanup();
    });
  });

  describe('cleanup', () => {
    it('should disconnect all observers on cleanup', () => {
      monitor.cleanup();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});

describe('PerformanceOptimizer', () => {
  beforeEach(() => {
    // Mock document
    Object.defineProperty(global, 'document', {
      writable: true,
      configurable: true,
      value: {
        createElement: vi.fn(() => ({
          setAttribute: vi.fn(),
          removeAttribute: vi.fn(),
        })),
        head: {
          appendChild: vi.fn(),
        },
        querySelectorAll: vi.fn(() => []),
        addEventListener: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('preloadCriticalResources', () => {
    it('should create preload links for critical resources', () => {
      const mockLink = {
        rel: '',
        href: '',
        as: '',
        type: '',
        crossOrigin: '',
      };

      const mockCreateElement = vi.fn(() => mockLink);
      const mockAppendChild = vi.fn();

      (global.document as any).createElement = mockCreateElement;
      (global.document as any).head.appendChild = mockAppendChild;

      const resources = [
        { href: '/critical.css', as: 'style' as const },
        { href: '/critical.js', as: 'script' as const },
        {
          href: '/font.woff2',
          as: 'font' as const,
          type: 'font/woff2',
          crossorigin: true,
        },
      ];

      PerformanceOptimizer.preloadCriticalResources(resources);

      expect(mockCreateElement).toHaveBeenCalledTimes(3);
      expect(mockAppendChild).toHaveBeenCalledTimes(3);
    });
  });

  describe('setupLazyImages', () => {
    it('should set up intersection observer for lazy images', () => {
      const mockIntersectionObserver = vi.fn();
      const mockObserve = vi.fn();

      mockIntersectionObserver.mockImplementation(() => ({
        observe: mockObserve,
      }));

      Object.defineProperty(global, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: mockIntersectionObserver,
      });

      const mockImages = [
        { dataset: { src: '/image1.jpg' } },
        { dataset: { src: '/image2.jpg' } },
      ];

      (global.document as any).querySelectorAll = vi.fn(() => mockImages);

      PerformanceOptimizer.setupLazyImages();

      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimizeThirdPartyScripts', () => {
    it('should delay loading of third-party scripts', () => {
      const mockScripts = [
        { getAttribute: vi.fn(() => '/analytics.js') },
        { getAttribute: vi.fn(() => '/tracking.js') },
      ];

      (global.document as any).querySelectorAll = vi.fn(() => mockScripts);

      PerformanceOptimizer.optimizeThirdPartyScripts();

      expect((global.document as any).addEventListener).toHaveBeenCalled();
    });
  });
});

describe('ResourceHints', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'document', {
      writable: true,
      configurable: true,
      value: {
        createElement: vi.fn(() => ({
          rel: '',
          href: '',
          crossOrigin: '',
        })),
        head: {
          appendChild: vi.fn(),
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('dnsPrefetch', () => {
    it('should add DNS prefetch links for external domains', () => {
      const mockCreateElement = vi.fn(() => ({ rel: '', href: '' }));
      const mockAppendChild = vi.fn();

      (global.document as any).createElement = mockCreateElement;
      (global.document as any).head.appendChild = mockAppendChild;

      const domains = ['fonts.googleapis.com', 'analytics.google.com'];

      ResourceHints.dnsPrefetch(domains);

      expect(mockCreateElement).toHaveBeenCalledTimes(2);
      expect(mockAppendChild).toHaveBeenCalledTimes(2);
    });
  });

  describe('preconnect', () => {
    it('should add preconnect links for critical origins', () => {
      const mockLink = { rel: '', href: '', crossOrigin: '' };
      const mockCreateElement = vi.fn(() => mockLink);
      const mockAppendChild = vi.fn();

      (global.document as any).createElement = mockCreateElement;
      (global.document as any).head.appendChild = mockAppendChild;

      const origins = [
        { href: 'https://fonts.googleapis.com', crossorigin: true },
        { href: 'https://api.example.com' },
      ];

      ResourceHints.preconnect(origins);

      expect(mockCreateElement).toHaveBeenCalledTimes(2);
      expect(mockAppendChild).toHaveBeenCalledTimes(2);
    });
  });

  describe('prefetch', () => {
    it('should add prefetch links for next navigation resources', () => {
      const mockCreateElement = vi.fn(() => ({ rel: '', href: '' }));
      const mockAppendChild = vi.fn();

      (global.document as any).createElement = mockCreateElement;
      (global.document as any).head.appendChild = mockAppendChild;

      const resources = ['/next-page.html', '/next-page.css'];

      ResourceHints.prefetch(resources);

      expect(mockCreateElement).toHaveBeenCalledTimes(2);
      expect(mockAppendChild).toHaveBeenCalledTimes(2);
    });
  });
});
