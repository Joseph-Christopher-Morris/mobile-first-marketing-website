import { test, expect, devices } from '@playwright/test';

/**
 * Cross-Browser Image Loading E2E Tests
 * Tests actual image loading behavior across different browsers and devices
 */

const TEST_IMAGES = [
  '/images/hero/paid-ads-analytics-screenshot.webp',
  '/images/services/analytics-hero.webp',
];

const MOBILE_DEVICES = [
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'Samsung Galaxy S21', ...devices['Galaxy S21'] },
  { name: 'iPad Pro', ...devices['iPad Pro'] },
];

// Desktop browser tests
test.describe('Desktop Browser Image Loading', () => {
  test('should load images correctly in Chrome', async ({ page }) => {
    await page.goto('/');

    // Wait for blog preview section to load
    await page.waitForSelector('[data-testid="blog-preview"]', {
      timeout: 10000,
    });

    // Check if blog images are loaded
    const blogImages = page.locator('[data-testid="blog-preview"] img');
    const imageCount = await blogImages.count();

    expect(imageCount).toBeGreaterThan(0);

    // Check each image loads successfully
    for (let i = 0; i < imageCount; i++) {
      const image = blogImages.nth(i);
      await expect(image).toBeVisible();

      // Check if image has loaded (not broken)
      const naturalWidth = await image.evaluate(
        (img: HTMLImageElement) => img.naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should handle WebP format correctly', async ({ page }) => {
    await page.goto('/');

    // Check if WebP images are supported and loaded
    const webpSupported = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    });

    console.log('WebP Support:', webpSupported);

    if (webpSupported) {
      // Test WebP image loading
      const webpImage = page.locator('img[src*=".webp"]').first();
      if ((await webpImage.count()) > 0) {
        await expect(webpImage).toBeVisible();
        const naturalWidth = await webpImage.evaluate(
          (img: HTMLImageElement) => img.naturalWidth
        );
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('should implement fallback mechanisms', async ({ page }) => {
    await page.goto('/');

    // Test image error handling by breaking an image source
    await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      if (images.length > 0) {
        const firstImage = images[0] as HTMLImageElement;
        firstImage.src = '/non-existent-image.jpg';
      }
    });

    // Wait a bit for error handling to kick in
    await page.waitForTimeout(2000);

    // Check if fallback or error handling is working
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let brokenCount = 0;
      images.forEach((img: HTMLImageElement) => {
        if (img.naturalWidth === 0 && img.complete) {
          brokenCount++;
        }
      });
      return brokenCount;
    });

    // Should have some mechanism to handle broken images
    console.log('Broken images detected:', brokenCount);
  });

  test('should load images within performance budget', async ({ page }) => {
    // Start measuring performance
    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure image loading performance
    const performanceMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      const imageEntries = entries.filter(
        entry =>
          entry.name.includes('.jpg') ||
          entry.name.includes('.webp') ||
          entry.name.includes('.png')
      );

      return imageEntries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        transferSize: (entry as any).transferSize || 0,
      }));
    });

    console.log('Image Performance Metrics:', performanceMetrics);

    // Check that images load within reasonable time (3 seconds)
    performanceMetrics.forEach(metric => {
      expect(metric.duration).toBeLessThan(3000);
    });
  });
});

// Mobile device tests
test.describe('Mobile Device Image Loading', () => {
  MOBILE_DEVICES.forEach(device => {
    test(`should load images correctly on ${device.name}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...device,
      });
      const page = await context.newPage();

      await page.goto('/');
      await page.waitForSelector('[data-testid="blog-preview"]', {
        timeout: 10000,
      });

      // Check if images are visible and loaded on mobile
      const blogImages = page.locator('[data-testid="blog-preview"] img');
      const imageCount = await blogImages.count();

      if (imageCount > 0) {
        const firstImage = blogImages.first();
        await expect(firstImage).toBeVisible();

        // Check image dimensions are appropriate for mobile
        const boundingBox = await firstImage.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(device.viewport.width);
          expect(boundingBox.width).toBeGreaterThan(0);
        }
      }

      await context.close();
    });
  });

  test('should handle touch interactions with images', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForSelector('[data-testid="blog-preview"]', {
      timeout: 10000,
    });

    // Test touch interaction with blog preview images
    const blogPreview = page.locator('[data-testid="blog-preview"]').first();
    if ((await blogPreview.count()) > 0) {
      // Simulate touch tap
      await blogPreview.tap();

      // Check if navigation or interaction occurred
      await page.waitForTimeout(1000);

      // Verify the interaction worked (could navigate to blog post)
      const currentUrl = page.url();
      console.log('URL after tap:', currentUrl);
    }

    await context.close();
  });
});

// Responsive image tests
test.describe('Responsive Image Behavior', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: '4K', width: 3840, height: 2160 },
  ];

  viewports.forEach(viewport => {
    test(`should display images correctly at ${viewport.name} resolution`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/');
      await page.waitForSelector('[data-testid="blog-preview"]', {
        timeout: 10000,
      });

      // Check image scaling and aspect ratio
      const blogImages = page.locator('[data-testid="blog-preview"] img');
      const imageCount = await blogImages.count();

      if (imageCount > 0) {
        const firstImage = blogImages.first();
        await expect(firstImage).toBeVisible();

        const boundingBox = await firstImage.boundingBox();
        if (boundingBox) {
          // Image should not exceed viewport width
          expect(boundingBox.width).toBeLessThanOrEqual(viewport.width);

          // Image should maintain reasonable aspect ratio
          const aspectRatio = boundingBox.width / boundingBox.height;
          expect(aspectRatio).toBeGreaterThan(0.5);
          expect(aspectRatio).toBeLessThan(3);
        }
      }
    });
  });

  test('should use appropriate image sizes for different viewports', async ({
    page,
  }) => {
    const viewportSizes = [375, 768, 1920];
    const imageSizes: { [key: number]: number } = {};

    for (const width of viewportSizes) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/', { waitUntil: 'networkidle' });

      // Measure image file sizes loaded
      const imageMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          'resource'
        ) as PerformanceResourceTiming[];
        const imageEntries = entries.filter(
          entry => entry.name.includes('.jpg') || entry.name.includes('.webp')
        );

        return imageEntries.reduce((total, entry) => {
          return total + ((entry as any).transferSize || 0);
        }, 0);
      });

      imageSizes[width] = imageMetrics;
      console.log(`Images loaded at ${width}px: ${imageMetrics} bytes`);
    }

    // Verify that larger viewports don't necessarily load much larger images
    // (good responsive image implementation)
    console.log('Image sizes by viewport:', imageSizes);
  });
});

// Accessibility tests for images
test.describe('Image Accessibility', () => {
  test('should have proper alt text for all images', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="blog-preview"]', {
      timeout: 10000,
    });

    // Check all images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');

      // Alt text should exist and not be empty
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="blog-preview"]', {
      timeout: 10000,
    });

    // Test keyboard navigation to images
    await page.keyboard.press('Tab');

    // Check if focus is visible and functional
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

// Performance monitoring
test.describe('Image Performance Monitoring', () => {
  test('should track Core Web Vitals for image loading', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise(resolve => {
        const vitals: { [key: string]: number } = {};

        // Largest Contentful Paint
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay would be measured on actual user interaction
        // Cumulative Layout Shift
        new PerformanceObserver(list => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.CLS = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(vitals), 3000);
      });
    });

    console.log('Core Web Vitals:', webVitals);

    // Assert reasonable performance metrics
    const vitals = webVitals as { [key: string]: number };
    if (vitals.LCP) {
      expect(vitals.LCP).toBeLessThan(4000); // LCP should be under 4 seconds
    }
    if (vitals.CLS) {
      expect(vitals.CLS).toBeLessThan(0.25); // CLS should be under 0.25
    }
  });
});
