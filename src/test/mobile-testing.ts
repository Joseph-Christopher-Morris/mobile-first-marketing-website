/**
 * Mobile-specific testing utilities and helpers
 */

export interface MobileTestConfig {
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  touchEnabled: boolean;
  devicePixelRatio: number;
}

export const mobileDevices = {
  iPhone12: {
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    touchEnabled: true,
    devicePixelRatio: 3,
  },
  iPhone12Mini: {
    viewport: { width: 375, height: 812 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    touchEnabled: true,
    devicePixelRatio: 3,
  },
  galaxyS21: {
    viewport: { width: 384, height: 854 },
    userAgent:
      'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36',
    touchEnabled: true,
    devicePixelRatio: 2.75,
  },
  iPad: {
    viewport: { width: 768, height: 1024 },
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    touchEnabled: true,
    devicePixelRatio: 2,
  },
} as const;

/**
 * Check if an element meets minimum touch target size requirements
 */
export function checkTouchTargetSize(element: HTMLElement): {
  isValid: boolean;
  width: number;
  height: number;
  recommendations: string[];
} {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // Apple's recommended minimum touch target size
  const recommendations: string[] = [];

  if (rect.width < minSize) {
    recommendations.push(
      `Width should be at least ${minSize}px (current: ${rect.width}px)`
    );
  }

  if (rect.height < minSize) {
    recommendations.push(
      `Height should be at least ${minSize}px (current: ${rect.height}px)`
    );
  }

  return {
    isValid: rect.width >= minSize && rect.height >= minSize,
    width: rect.width,
    height: rect.height,
    recommendations,
  };
}

/**
 * Test responsive design breakpoints
 */
export function testResponsiveBreakpoints(
  element: HTMLElement,
  breakpoints: number[]
): {
  breakpoint: number;
  computedStyles: CSSStyleDeclaration;
  isVisible: boolean;
}[] {
  const results: {
    breakpoint: number;
    computedStyles: CSSStyleDeclaration;
    isVisible: boolean;
  }[] = [];

  breakpoints.forEach(width => {
    // Simulate viewport width change
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    const computedStyles = window.getComputedStyle(element);
    const isVisible =
      computedStyles.display !== 'none' &&
      computedStyles.visibility !== 'hidden';

    results.push({
      breakpoint: width,
      computedStyles,
      isVisible,
    });
  });

  return results;
}

/**
 * Test gesture support
 */
export function simulateTouch(
  element: HTMLElement,
  type: 'tap' | 'swipe' | 'pinch',
  options?: {
    startX?: number;
    startY?: number;
    endX?: number;
    endY?: number;
    duration?: number;
  }
): void {
  const {
    startX = 0,
    startY = 0,
    endX = 0,
    endY = 0,
    duration = 100,
  } = options || {};

  switch (type) {
    case 'tap':
      element.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [
            new Touch({
              identifier: 1,
              target: element,
              clientX: startX,
              clientY: startY,
            }),
          ],
        })
      );

      setTimeout(() => {
        element.dispatchEvent(
          new TouchEvent('touchend', {
            changedTouches: [
              new Touch({
                identifier: 1,
                target: element,
                clientX: startX,
                clientY: startY,
              }),
            ],
          })
        );
      }, duration);
      break;

    case 'swipe':
      element.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [
            new Touch({
              identifier: 1,
              target: element,
              clientX: startX,
              clientY: startY,
            }),
          ],
        })
      );

      element.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [
            new Touch({
              identifier: 1,
              target: element,
              clientX: endX,
              clientY: endY,
            }),
          ],
        })
      );

      setTimeout(() => {
        element.dispatchEvent(
          new TouchEvent('touchend', {
            changedTouches: [
              new Touch({
                identifier: 1,
                target: element,
                clientX: endX,
                clientY: endY,
              }),
            ],
          })
        );
      }, duration);
      break;

    case 'pinch':
      // Simulate pinch gesture with two touches
      element.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [
            new Touch({
              identifier: 1,
              target: element,
              clientX: startX,
              clientY: startY,
            }),
            new Touch({
              identifier: 2,
              target: element,
              clientX: startX + 50,
              clientY: startY,
            }),
          ],
        })
      );

      element.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [
            new Touch({
              identifier: 1,
              target: element,
              clientX: startX - 25,
              clientY: startY,
            }),
            new Touch({
              identifier: 2,
              target: element,
              clientX: startX + 75,
              clientY: startY,
            }),
          ],
        })
      );

      setTimeout(() => {
        element.dispatchEvent(
          new TouchEvent('touchend', {
            changedTouches: [
              new Touch({
                identifier: 1,
                target: element,
                clientX: startX - 25,
                clientY: startY,
              }),
              new Touch({
                identifier: 2,
                target: element,
                clientX: startX + 75,
                clientY: startY,
              }),
            ],
          })
        );
      }, duration);
      break;
  }
}

/**
 * Performance testing for mobile devices
 */
export class MobilePerformanceTester {
  private metrics: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
    memoryUsage: number;
  } = {
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
  };

  startLoadTest(): void {
    this.metrics.loadTime = performance.now();
  }

  endLoadTest(): number {
    const endTime = performance.now();
    this.metrics.loadTime = endTime - this.metrics.loadTime;
    return this.metrics.loadTime;
  }

  measureRenderTime(callback: () => void): number {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    this.metrics.renderTime = endTime - startTime;
    return this.metrics.renderTime;
  }

  measureInteractionTime(
    element: HTMLElement,
    interaction: () => void
  ): number {
    const startTime = performance.now();
    interaction();

    // Wait for next frame to measure interaction response
    requestAnimationFrame(() => {
      const endTime = performance.now();
      this.metrics.interactionTime = endTime - startTime;
    });

    return this.metrics.interactionTime;
  }

  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return this.metrics.memoryUsage;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  checkPerformanceThresholds(): {
    loadTime: { value: number; threshold: number; passed: boolean };
    renderTime: { value: number; threshold: number; passed: boolean };
    interactionTime: { value: number; threshold: number; passed: boolean };
    memoryUsage: { value: number; threshold: number; passed: boolean };
  } {
    return {
      loadTime: {
        value: this.metrics.loadTime,
        threshold: 3000, // 3 seconds
        passed: this.metrics.loadTime < 3000,
      },
      renderTime: {
        value: this.metrics.renderTime,
        threshold: 100, // 100ms
        passed: this.metrics.renderTime < 100,
      },
      interactionTime: {
        value: this.metrics.interactionTime,
        threshold: 100, // 100ms for First Input Delay
        passed: this.metrics.interactionTime < 100,
      },
      memoryUsage: {
        value: this.metrics.memoryUsage,
        threshold: 50, // 50MB
        passed: this.metrics.memoryUsage < 50,
      },
    };
  }
}

/**
 * Accessibility testing for mobile
 */
export function testMobileAccessibility(element: HTMLElement): {
  hasProperLabels: boolean;
  hasKeyboardSupport: boolean;
  hasProperContrast: boolean;
  hasScreenReaderSupport: boolean;
  recommendations: string[];
} {
  const recommendations: string[] = [];

  // Check for proper labels
  const hasProperLabels =
    element.hasAttribute('aria-label') ||
    element.hasAttribute('aria-labelledby') ||
    (element.tagName === 'INPUT' && !!element.closest('label'));

  if (!hasProperLabels) {
    recommendations.push('Add proper labels for screen readers');
  }

  // Check for keyboard support
  const hasKeyboardSupport =
    element.hasAttribute('tabindex') ||
    ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);

  if (!hasKeyboardSupport) {
    recommendations.push('Ensure element is keyboard accessible');
  }

  // Check for proper contrast (simplified check)
  const computedStyles = window.getComputedStyle(element);
  const hasProperContrast =
    computedStyles.color !== computedStyles.backgroundColor;

  if (!hasProperContrast) {
    recommendations.push('Ensure sufficient color contrast');
  }

  // Check for screen reader support
  const hasScreenReaderSupport =
    element.hasAttribute('role') ||
    element.hasAttribute('aria-label') ||
    element.hasAttribute('aria-describedby');

  if (!hasScreenReaderSupport) {
    recommendations.push('Add ARIA attributes for screen reader support');
  }

  return {
    hasProperLabels,
    hasKeyboardSupport,
    hasProperContrast,
    hasScreenReaderSupport,
    recommendations,
  };
}

/**
 * Network condition simulation for mobile testing
 */
export class NetworkSimulator {
  private originalFetch: typeof fetch;

  constructor() {
    this.originalFetch = window.fetch;
  }

  simulate3G(): void {
    // Simulate 3G network conditions (slower response times)
    window.fetch = async (...args) => {
      const delay = Math.random() * 1000 + 500; // 500-1500ms delay
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.originalFetch(...args);
    };
  }

  simulateOffline(): void {
    window.fetch = async () => {
      throw new Error('Network request failed - offline mode');
    };
  }

  restore(): void {
    window.fetch = this.originalFetch;
  }
}
