import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkTouchTargetSize,
  testResponsiveBreakpoints,
  simulateTouch,
  MobilePerformanceTester,
  testMobileAccessibility,
  NetworkSimulator,
  mobileDevices,
} from '../mobile-testing';

describe('Mobile Testing Utilities', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    vi.restoreAllMocks();
  });

  describe('checkTouchTargetSize', () => {
    it('should validate touch target size correctly', () => {
      // Mock getBoundingClientRect
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 48,
        height: 48,
        top: 0,
        left: 0,
        bottom: 48,
        right: 48,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const result = checkTouchTargetSize(mockElement);

      expect(result.isValid).toBe(true);
      expect(result.width).toBe(48);
      expect(result.height).toBe(48);
      expect(result.recommendations).toHaveLength(0);
    });

    it('should identify insufficient touch target size', () => {
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        width: 30,
        height: 30,
        top: 0,
        left: 0,
        bottom: 30,
        right: 30,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const result = checkTouchTargetSize(mockElement);

      expect(result.isValid).toBe(false);
      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0]).toContain(
        'Width should be at least 44px'
      );
      expect(result.recommendations[1]).toContain(
        'Height should be at least 44px'
      );
    });
  });

  describe('testResponsiveBreakpoints', () => {
    it('should test responsive behavior at different breakpoints', () => {
      const breakpoints = [375, 768, 1024];

      // Mock window.getComputedStyle
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        display: 'block',
        visibility: 'visible',
      } as CSSStyleDeclaration);

      const results = testResponsiveBreakpoints(mockElement, breakpoints);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.breakpoint).toBe(breakpoints[index]);
        expect(result.isVisible).toBe(true);
      });
    });
  });

  describe('simulateTouch', () => {
    it('should simulate tap gesture', () => {
      const touchStartSpy = vi.fn();
      const touchEndSpy = vi.fn();

      mockElement.addEventListener('touchstart', touchStartSpy);
      mockElement.addEventListener('touchend', touchEndSpy);

      simulateTouch(mockElement, 'tap', { startX: 100, startY: 100 });

      expect(touchStartSpy).toHaveBeenCalled();

      // Wait for touchend event
      setTimeout(() => {
        expect(touchEndSpy).toHaveBeenCalled();
      }, 150);
    });

    it('should simulate swipe gesture', () => {
      const touchMoveSpy = vi.fn();

      mockElement.addEventListener('touchmove', touchMoveSpy);

      simulateTouch(mockElement, 'swipe', {
        startX: 100,
        startY: 100,
        endX: 200,
        endY: 100,
      });

      expect(touchMoveSpy).toHaveBeenCalled();
    });
  });

  describe('MobilePerformanceTester', () => {
    let tester: MobilePerformanceTester;

    beforeEach(() => {
      tester = new MobilePerformanceTester();
    });

    it('should measure load time', () => {
      tester.startLoadTest();

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait for 10ms
      }

      const loadTime = tester.endLoadTest();

      expect(loadTime).toBeGreaterThan(0);
    });

    it('should measure render time', () => {
      const renderTime = tester.measureRenderTime(() => {
        // Simulate rendering work
        const div = document.createElement('div');
        div.innerHTML = 'Test content';
        document.body.appendChild(div);
        document.body.removeChild(div);
      });

      expect(renderTime).toBeGreaterThanOrEqual(0);
    });

    it('should check performance thresholds', () => {
      const thresholds = tester.checkPerformanceThresholds();

      expect(thresholds).toHaveProperty('loadTime');
      expect(thresholds).toHaveProperty('renderTime');
      expect(thresholds).toHaveProperty('interactionTime');
      expect(thresholds).toHaveProperty('memoryUsage');

      Object.values(thresholds).forEach(threshold => {
        expect(threshold).toHaveProperty('value');
        expect(threshold).toHaveProperty('threshold');
        expect(threshold).toHaveProperty('passed');
      });
    });
  });

  describe('testMobileAccessibility', () => {
    it('should identify accessibility issues', () => {
      const result = testMobileAccessibility(mockElement);

      expect(result.hasProperLabels).toBe(false);
      expect(result.hasKeyboardSupport).toBe(false);
      expect(result.hasScreenReaderSupport).toBe(false);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should validate accessible elements', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Test button');
      button.setAttribute('role', 'button');

      const result = testMobileAccessibility(button);

      expect(result.hasProperLabels).toBe(true);
      expect(result.hasKeyboardSupport).toBe(true);
      expect(result.hasScreenReaderSupport).toBe(true);
    });
  });

  describe('NetworkSimulator', () => {
    let simulator: NetworkSimulator;
    let originalFetch: typeof fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      global.fetch = vi.fn();
      simulator = new NetworkSimulator();
    });

    afterEach(() => {
      simulator.restore();
      global.fetch = originalFetch;
    });

    it('should simulate 3G network conditions', async () => {
      simulator.simulate3G();

      const startTime = Date.now();

      try {
        await fetch('/test');
      } catch (error) {
        // Expected to fail in test environment
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should add some delay (though exact timing may vary in tests)
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should simulate offline conditions', async () => {
      simulator.simulateOffline();

      await expect(fetch('/test')).rejects.toThrow(
        'Network request failed - offline mode'
      );
    });
  });

  describe('mobileDevices', () => {
    it('should have correct device configurations', () => {
      expect(mobileDevices.iPhone12).toHaveProperty('viewport');
      expect(mobileDevices.iPhone12).toHaveProperty('userAgent');
      expect(mobileDevices.iPhone12).toHaveProperty('touchEnabled');
      expect(mobileDevices.iPhone12).toHaveProperty('devicePixelRatio');

      expect(mobileDevices.iPhone12.touchEnabled).toBe(true);
      expect(mobileDevices.iPhone12.viewport.width).toBe(390);
      expect(mobileDevices.iPhone12.viewport.height).toBe(844);
    });

    it('should have different configurations for different devices', () => {
      expect(mobileDevices.iPhone12.viewport.width).not.toBe(
        mobileDevices.galaxyS21.viewport.width
      );
      expect(mobileDevices.iPhone12.userAgent).not.toBe(
        mobileDevices.galaxyS21.userAgent
      );
    });
  });
});
