import { test, expect } from '@playwright/test';

test.describe('Photography Page Performance', () => {
  test('should meet Core Web Vitals targets', async ({ page }) => {
    // Navigate to photography page
    const response = await page.goto('/services/photography');
    expect(response?.status()).toBe(200);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay) - simulate with click
        const measureFID = () => {
          const startTime = performance.now();
          setTimeout(() => {
            vitals.fid = performance.now() - startTime;
          }, 0);
        };

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Wait for measurements
        setTimeout(() => {
          measureFID();
          setTimeout(() => resolve(vitals), 100);
        }, 3000);
      });
    });

    // Assert Core Web Vitals targets
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500); // LCP < 2.5s
    }
    if (vitals.fid) {
      expect(vitals.fid).toBeLessThan(100); // FID < 100ms
    }
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.1); // CLS < 0.1
    }
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/services/photography');
    
    // Track image loading
    const imageLoadTimes: number[] = [];
    const imageErrors: string[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('/images/') && response.url().match(/\.(webp|jpg|jpeg|png)$/)) {
        const timing = response.timing();
        if (timing.responseEnd > 0) {
          imageLoadTimes.push(timing.responseEnd - timing.requestStart);
        }
        
        if (!response.ok()) {
          imageErrors.push(response.url());
        }
      }
    });

    // Wait for gallery to load
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000); // Allow time for lazy loading

    // Check no image errors
    expect(imageErrors).toHaveLength(0);

    // Check image load times are reasonable
    if (imageLoadTimes.length > 0) {
      const averageLoadTime = imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length;
      expect(averageLoadTime).toBeLessThan(1000); // Average < 1s
      
      // No single image should take too long
      const maxLoadTime = Math.max(...imageLoadTimes);
      expect(maxLoadTime).toBeLessThan(3000); // Max < 3s
    }
  });

  test('should use WebP images where supported', async ({ page }) => {
    const imageFormats: string[] = [];
    
    page.on('response', (response) => {
      if (response.url().includes('/images/') && response.url().match(/\.(webp|jpg|jpeg|png)$/)) {
        const url = response.url();
        const format = url.split('.').pop()?.toLowerCase();
        if (format) {
          imageFormats.push(format);
        }
      }
    });

    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Should primarily use WebP format
    const webpCount = imageFormats.filter(format => format === 'webp').length;
    const totalImages = imageFormats.length;
    
    if (totalImages > 0) {
      const webpPercentage = (webpCount / totalImages) * 100;
      expect(webpPercentage).toBeGreaterThan(70); // At least 70% WebP
    }
  });

  test('should implement lazy loading', async ({ page }) => {
    await page.goto('/services/photography');
    
    // Get initial viewport height
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    
    // Count images in viewport vs total images
    const imagePositions = await page.locator('[role="gridcell"] img').evaluateAll((images) => {
      return images.map(img => {
        const rect = img.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          inViewport: rect.top < window.innerHeight && rect.bottom > 0
        };
      });
    });

    const imagesInViewport = imagePositions.filter(pos => pos.inViewport).length;
    const totalImages = imagePositions.length;

    // Should have more images below the fold than in viewport (indicating lazy loading)
    expect(totalImages).toBeGreaterThan(imagesInViewport);
    
    // Scroll down and check more images load
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await page.waitForTimeout(1000);
    
    const newImagePositions = await page.locator('[role="gridcell"] img').evaluateAll((images) => {
      return images.map(img => {
        const rect = img.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });
    });

    const newImagesInViewport = newImagePositions.filter(Boolean).length;
    expect(newImagesInViewport).toBeGreaterThanOrEqual(imagesInViewport);
  });

  test('should have minimal layout shift', async ({ page }) => {
    let layoutShifts: number[] = [];
    
    await page.addInitScript(() => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            (window as any).layoutShifts = (window as any).layoutShifts || [];
            (window as any).layoutShifts.push((entry as any).value);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    });

    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for any late layout shifts

    layoutShifts = await page.evaluate(() => (window as any).layoutShifts || []);
    
    const totalCLS = layoutShifts.reduce((sum, shift) => sum + shift, 0);
    expect(totalCLS).toBeLessThan(0.1); // CLS should be < 0.1
  });

  test('should preload critical resources', async ({ page }) => {
    const preloadedResources: string[] = [];
    
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const url = request.url();
      
      if (resourceType === 'image' && url.includes('hero')) {
        preloadedResources.push(url);
      }
    });

    await page.goto('/services/photography');
    
    // Check that hero image is preloaded
    const heroImage = page.locator('img[alt*="Professional photography services"]');
    await expect(heroImage).toBeVisible();
    
    // Verify preload hints in HTML
    const preloadLinks = await page.locator('link[rel="preload"]').count();
    expect(preloadLinks).toBeGreaterThan(0);
  });

  test('should have efficient caching headers', async ({ page }) => {
    const cacheHeaders: Record<string, string> = {};
    
    page.on('response', (response) => {
      if (response.url().includes('/images/') || response.url().includes('.css') || response.url().includes('.js')) {
        const cacheControl = response.headers()['cache-control'];
        if (cacheControl) {
          cacheHeaders[response.url()] = cacheControl;
        }
      }
    });

    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Check that static assets have proper cache headers
    const cachedResources = Object.keys(cacheHeaders);
    expect(cachedResources.length).toBeGreaterThan(0);
    
    // Most static resources should have long cache times
    const longCachedResources = cachedResources.filter(url => {
      const cacheControl = cacheHeaders[url];
      return cacheControl.includes('max-age') && 
             parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || '0') > 3600;
    });
    
    expect(longCachedResources.length).toBeGreaterThan(0);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/services/photography');
    await page.waitForSelector('h1', { timeout: 15000 });
    const loadTime = Date.now() - startTime;

    // Page should still load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(10000); // < 10s on slow network

    // Critical content should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('p').first()).toBeVisible();
  });
});