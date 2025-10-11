import { test, expect } from '@playwright/test';

// Performance budgets configuration
const PERFORMANCE_BUDGETS = {
  lcp: 2500, // Largest Contentful Paint - Good: <2.5s
  fid: 100,  // First Input Delay - Good: <100ms
  cls: 0.1,  // Cumulative Layout Shift - Good: <0.1
  fcp: 1800, // First Contentful Paint - Good: <1.8s
  tti: 3800, // Time to Interactive - Good: <3.8s
  tbt: 200,  // Total Blocking Time - Good: <200ms
  si: 3400,  // Speed Index - Good: <3.4s
  pageLoadTime: 3000, // Total page load time
  timeToFirstByte: 600, // Time to First Byte - 600ms
  jsBundle: 500 * 1024, // JavaScript bundle size - 500KB
  cssBundle: 100 * 1024, // CSS bundle size - 100KB
  imageOptimization: 0.8, // 80% of images should be optimized
  cacheHitRate: 0.9, // 90% cache hit rate
  compressionRate: 0.7, // 70% compression rate
};

test.describe('Performance Validation', () => {
  test.describe('Core Web Vitals Monitoring', () => {
    test('should meet Largest Contentful Paint (LCP) requirements', async ({ page }) => {
      // Navigate to homepage
      await page.goto('/');
      
      // Measure LCP using Performance Observer with enhanced monitoring
      const lcpMetrics = await page.evaluate(() => {
        return new Promise<{lcp: number, element: string, timestamp: number}>((resolve) => {
          let lcpValue = 0;
          let lcpElement = 'unknown';
          
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            lcpValue = lastEntry.startTime;
            lcpElement = lastEntry.element?.tagName || 'unknown';
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Enhanced timeout with fallback measurement
          setTimeout(() => {
            // Fallback: measure largest visible element if LCP not captured
            if (lcpValue === 0) {
              const images = document.querySelectorAll('img');
              const headings = document.querySelectorAll('h1, h2');
              const largestElement = [...images, ...headings]
                .filter(el => (el as HTMLElement).offsetWidth > 0 && (el as HTMLElement).offsetHeight > 0)
                .sort((a, b) => ((b as HTMLElement).offsetWidth * (b as HTMLElement).offsetHeight) - ((a as HTMLElement).offsetWidth * (a as HTMLElement).offsetHeight))[0];
              
              if (largestElement) {
                lcpValue = performance.now();
                lcpElement = largestElement.tagName;
              }
            }
            
            resolve({ 
              lcp: lcpValue, 
              element: lcpElement,
              timestamp: Date.now()
            });
          }, 5000);
        });
      });
      
      console.log(`LCP: ${lcpMetrics.lcp}ms (element: ${lcpMetrics.element})`);
      
      // LCP should be under performance budget
      expect(lcpMetrics.lcp).toBeLessThan(PERFORMANCE_BUDGETS.lcp);
      expect(lcpMetrics.lcp).toBeGreaterThan(0); // Ensure measurement was captured
    });

    test('should meet First Input Delay (FID) requirements', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');
      
      // Enhanced FID measurement using Performance Observer
      const fidMetrics = await page.evaluate(() => {
        return new Promise<{fid: number, type: string, timestamp: number}>((resolve) => {
          let fidValue = 0;
          let interactionType = 'none';
          
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              const fidEntry = entry as any;
              if (fidEntry.processingStart && fidEntry.startTime) {
                fidValue = fidEntry.processingStart - fidEntry.startTime;
                interactionType = fidEntry.name;
                break;
              }
            }
          });
          
          observer.observe({ entryTypes: ['first-input'] });
          
          // Simulate user interaction after a brief delay
          setTimeout(() => {
            const interactiveElements = document.querySelectorAll('button, a, input, [tabindex]');
            if (interactiveElements.length > 0) {
              const element = interactiveElements[0] as HTMLElement;
              element.click();
            }
            
            // Resolve after allowing time for FID measurement
            setTimeout(() => resolve({ 
              fid: fidValue, 
              type: interactionType,
              timestamp: Date.now()
            }), 500);
          }, 100);
        });
      });
      
      console.log(`FID: ${fidMetrics.fid}ms (interaction: ${fidMetrics.type})`);
      
      // FID should be under performance budget
      expect(fidMetrics.fid).toBeLessThan(PERFORMANCE_BUDGETS.fid);
    });

    test('should meet Cumulative Layout Shift (CLS) requirements', async ({ page }) => {
      await page.goto('/');
      
      // Enhanced CLS measurement with detailed tracking
      const clsMetrics = await page.evaluate(() => {
        return new Promise<{cls: number, shiftCount: number, shifts: any[], timestamp: number}>((resolve) => {
          let clsValue = 0;
          let shiftCount = 0;
          const shifts: any[] = [];
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const clsEntry = entry as any;
              if (!clsEntry.hadRecentInput) {
                clsValue += clsEntry.value;
                shiftCount++;
                shifts.push({
                  value: clsEntry.value,
                  startTime: clsEntry.startTime,
                  sources: clsEntry.sources?.map((source: any) => ({
                    node: source.node?.tagName || 'unknown',
                    previousRect: source.previousRect,
                    currentRect: source.currentRect
                  })) || []
                });
              }
            }
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
          
          // Simulate user interactions that might cause layout shifts
          setTimeout(() => {
            // Scroll to trigger any lazy-loaded content
            window.scrollTo(0, window.innerHeight / 2);
          }, 1000);
          
          setTimeout(() => {
            window.scrollTo(0, window.innerHeight);
          }, 2000);
          
          // Wait for layout shifts to settle
          setTimeout(() => resolve({ 
            cls: clsValue, 
            shiftCount,
            shifts: shifts.slice(0, 5), // Limit to first 5 shifts for logging
            timestamp: Date.now()
          }), 4000);
        });
      });
      
      console.log(`CLS: ${clsMetrics.cls.toFixed(4)} (${clsMetrics.shiftCount} shifts)`);
      if (clsMetrics.shifts.length > 0) {
        console.log('Layout shifts:', clsMetrics.shifts.map(s => `${s.value.toFixed(4)} at ${s.startTime.toFixed(0)}ms`));
      }
      
      // CLS should be under performance budget
      expect(clsMetrics.cls).toBeLessThan(PERFORMANCE_BUDGETS.cls);
    });
    test('should meet First Contentful Paint (FCP) requirements', async ({ page }) => {
      await page.goto('/');
      
      const fcpMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let fcpValue = 0;
          
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              fcpValue = fcpEntry.startTime;
            }
          });
          
          observer.observe({ entryTypes: ['paint'] });
          
          setTimeout(() => resolve({ 
            fcp: fcpValue || performance.now(),
            timestamp: Date.now()
          }), 3000);
        });
      });
      
      console.log(`FCP: ${fcpMetrics.fcp}ms`);
      expect(fcpMetrics.fcp).toBeLessThan(PERFORMANCE_BUDGETS.fcp);
      expect(fcpMetrics.fcp).toBeGreaterThan(0);
    });

    test('should meet Time to Interactive (TTI) requirements', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      
      // Wait for network idle as proxy for TTI
      await page.waitForLoadState('networkidle');
      
      const ttiTime = Date.now() - startTime;
      
      console.log(`TTI: ${ttiTime}ms`);
      expect(ttiTime).toBeLessThan(PERFORMANCE_BUDGETS.tti);
    });

    test('should measure Total Blocking Time (TBT)', async ({ page }) => {
      await page.goto('/');
      
      const tbtMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let totalBlockingTime = 0;
          let longTaskCount = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                totalBlockingTime += entry.duration - 50;
                longTaskCount++;
              }
            }
          });
          
          observer.observe({ entryTypes: ['longtask'] });
          
          setTimeout(() => resolve({ 
            tbt: totalBlockingTime,
            longTaskCount,
            timestamp: Date.now()
          }), 5000);
        });
      });
      
      console.log(`TBT: ${tbtMetrics.tbt}ms (${tbtMetrics.longTaskCount} long tasks)`);
      expect(tbtMetrics.tbt).toBeLessThan(PERFORMANCE_BUDGETS.tbt);
    });
  });

  test.describe('Performance Budget Validation', () => {
    test('should validate JavaScript bundle size', async ({ page }) => {
      const bundleSizes = [];
      
      page.on('response', async response => {
        const url = response.url();
        if (url.includes('.js') && !url.includes('node_modules') && !url.includes('webpack')) {
          try {
            const buffer = await response.body();
            bundleSizes.push({
              url: url.split('/').pop(),
              size: buffer.length,
              compressed: response.headers()['content-encoding'] ? true : false
            });
          } catch (error) {
            // Ignore responses we can't read
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const totalJSSize = bundleSizes.reduce((total, bundle) => total + bundle.size, 0);
      const mainBundle = bundleSizes.find(bundle => 
        bundle.url.includes('main') || bundle.url.includes('index') || bundle.url.includes('app')
      );
      
      console.log(`Total JS size: ${(totalJSSize / 1024).toFixed(1)}KB`);
      console.log(`Main bundle size: ${mainBundle ? (mainBundle.size / 1024).toFixed(1) : 0}KB`);
      
      // Validate against performance budgets
      if (mainBundle) {
        expect(mainBundle.size).toBeLessThan(PERFORMANCE_BUDGETS.jsBundle);
      }
      expect(totalJSSize).toBeLessThan(PERFORMANCE_BUDGETS.jsBundle * 2); // Allow 2x for total
    });

    test('should validate CSS bundle size', async ({ page }) => {
      const cssBundles = [];
      
      page.on('response', async response => {
        const url = response.url();
        if (url.includes('.css')) {
          try {
            const buffer = await response.body();
            cssBundles.push({
              url: url.split('/').pop(),
              size: buffer.length,
              compressed: response.headers()['content-encoding'] ? true : false
            });
          } catch (error) {
            // Ignore responses we can't read
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const totalCSSSize = cssBundles.reduce((total, bundle) => total + bundle.size, 0);
      
      console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(1)}KB`);
      console.log(`CSS bundles: ${cssBundles.length}`);
      
      expect(totalCSSSize).toBeLessThan(PERFORMANCE_BUDGETS.cssBundle);
    });

    test('should validate resource compression', async ({ page }) => {
      const responses = [];
      
      page.on('response', response => {
        const url = response.url();
        const headers = response.headers();
        
        if (url.includes('.css') || url.includes('.js') || url.includes('.html')) {
          responses.push({
            url: url.split('/').pop(),
            contentEncoding: headers['content-encoding'],
            contentType: headers['content-type'],
            contentLength: parseInt(headers['content-length'] || '0'),
            compressed: !!(headers['content-encoding'] && 
              (headers['content-encoding'].includes('gzip') || 
               headers['content-encoding'].includes('br')))
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const compressedResources = responses.filter(r => r.compressed);
      const compressionRate = compressedResources.length / responses.length;
      
      console.log(`Compression rate: ${(compressionRate * 100).toFixed(1)}%`);
      console.log(`Compressed resources: ${compressedResources.length}/${responses.length}`);
      
      expect(compressionRate).toBeGreaterThan(PERFORMANCE_BUDGETS.compressionRate);
    });

    test('should validate cache headers', async ({ page }) => {
      const cacheableResponses = [];
      
      page.on('response', response => {
        const url = response.url();
        const headers = response.headers();
        
        if (url.includes('.css') || url.includes('.js') || 
            url.includes('.png') || url.includes('.jpg') || 
            url.includes('.webp') || url.includes('.woff')) {
          cacheableResponses.push({
            url: url.split('/').pop(),
            cacheControl: headers['cache-control'],
            expires: headers['expires'],
            etag: headers['etag'],
            lastModified: headers['last-modified'],
            hasCacheHeaders: !!(headers['cache-control'] || headers['expires'])
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const cachedResources = cacheableResponses.filter(r => r.hasCacheHeaders);
      const cacheRate = cachedResources.length / cacheableResponses.length;
      
      console.log(`Cache headers rate: ${(cacheRate * 100).toFixed(1)}%`);
      console.log(`Cached resources: ${cachedResources.length}/${cacheableResponses.length}`);
      
      expect(cacheRate).toBeGreaterThan(PERFORMANCE_BUDGETS.cacheHitRate);
    });
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 2 seconds on desktop
      expect(loadTime).toBeLessThan(2000);
    });

    test('should load critical resources quickly', async ({ page }) => {
      const resourceTimings = [];
      
      page.on('response', response => {
        const url = response.url();
        const timing = response.timing();
        
        // Track critical resources
        if (url.includes('.css') || url.includes('.js') || url.includes('font')) {
          resourceTimings.push({
            url,
            responseTime: timing.responseEnd - timing.responseStart
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Critical resources should load within 1 second
      const slowResources = resourceTimings.filter(resource => resource.responseTime > 1000);
      expect(slowResources.length).toBe(0);
    });

  });

  test.describe('Image Optimization Validation', () => {
    test('should optimize image formats and loading', async ({ page }) => {
      await page.goto('/');
      
      const imageMetrics = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const imageData = images.map(img => ({
          src: img.src,
          loading: img.loading,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          alt: img.alt,
          sizes: img.sizes,
          srcset: img.srcset,
          hasLazyLoading: img.loading === 'lazy',
          isModernFormat: /\.(webp|avif)/.test(img.src),
          isOptimized: /w_\d+|q_auto|optimize|next\/image/.test(img.src),
          isAboveFold: img.getBoundingClientRect().top < window.innerHeight
        }));
        
        return {
          totalImages: images.length,
          modernFormatCount: imageData.filter(img => img.isModernFormat).length,
          optimizedCount: imageData.filter(img => img.isOptimized).length,
          lazyLoadedCount: imageData.filter(img => img.hasLazyLoading).length,
          aboveFoldCount: imageData.filter(img => img.isAboveFold).length,
          belowFoldCount: imageData.filter(img => !img.isAboveFold).length,
          withAltCount: imageData.filter(img => img.alt && img.alt.trim().length > 0).length,
          withSrcsetCount: imageData.filter(img => img.srcset && img.srcset.length > 0).length,
          images: imageData.slice(0, 10) // Limit for logging
        };
      });
      
      console.log(`Images: ${imageMetrics.totalImages} total`);
      console.log(`Modern formats: ${imageMetrics.modernFormatCount}/${imageMetrics.totalImages}`);
      console.log(`Optimized: ${imageMetrics.optimizedCount}/${imageMetrics.totalImages}`);
      console.log(`Lazy loaded: ${imageMetrics.lazyLoadedCount}/${imageMetrics.belowFoldCount} below fold`);
      
      if (imageMetrics.totalImages > 0) {
        // At least 80% of images should be optimized (modern format or optimization service)
        const optimizationRate = (imageMetrics.modernFormatCount + imageMetrics.optimizedCount) / imageMetrics.totalImages;
        expect(optimizationRate).toBeGreaterThan(PERFORMANCE_BUDGETS.imageOptimization);
        
        // Below-fold images should be lazy loaded
        if (imageMetrics.belowFoldCount > 0) {
          const lazyLoadRate = imageMetrics.lazyLoadedCount / imageMetrics.belowFoldCount;
          expect(lazyLoadRate).toBeGreaterThan(0.8); // 80% of below-fold images
        }
        
        // Images should have alt text for accessibility
        const altTextRate = imageMetrics.withAltCount / imageMetrics.totalImages;
        expect(altTextRate).toBeGreaterThan(0.9); // 90% should have alt text
        
        // Responsive images should use srcset
        if (imageMetrics.totalImages > 1) {
          expect(imageMetrics.withSrcsetCount).toBeGreaterThan(0);
        }
      }
    });

    test('should validate image loading performance', async ({ page }) => {
      const imageLoadTimes = [];
      
      page.on('response', response => {
        const url = response.url();
        if (/\.(jpg|jpeg|png|webp|avif|gif|svg)/.test(url)) {
          const timing = response.timing();
          imageLoadTimes.push({
            url: url.split('/').pop(),
            loadTime: timing.responseEnd - timing.responseStart,
            size: parseInt(response.headers()['content-length'] || '0'),
            format: url.split('.').pop(),
            cached: response.fromServiceWorker() || response.headers()['cf-cache-status'] === 'HIT'
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      if (imageLoadTimes.length > 0) {
        const avgLoadTime = imageLoadTimes.reduce((sum, img) => sum + img.loadTime, 0) / imageLoadTimes.length;
        const totalImageSize = imageLoadTimes.reduce((sum, img) => sum + img.size, 0);
        const cachedImages = imageLoadTimes.filter(img => img.cached).length;
        
        console.log(`Average image load time: ${avgLoadTime.toFixed(0)}ms`);
        console.log(`Total image size: ${(totalImageSize / 1024).toFixed(1)}KB`);
        console.log(`Cached images: ${cachedImages}/${imageLoadTimes.length}`);
        
        // Images should load reasonably fast
        expect(avgLoadTime).toBeLessThan(1000); // 1 second average
        
        // Individual images shouldn't be too large
        const largeImages = imageLoadTimes.filter(img => img.size > 500 * 1024); // 500KB
        expect(largeImages.length).toBe(0);
      }
    });

    test('should validate responsive image behavior', async ({ page, isMobile }) => {
      await page.goto('/');
      
      const responsiveMetrics = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const viewportWidth = window.innerWidth;
        
        return images.map(img => {
          const computedStyle = window.getComputedStyle(img);
          return {
            src: img.src,
            displayWidth: img.offsetWidth,
            naturalWidth: img.naturalWidth,
            viewportWidth,
            isResponsive: img.srcset && img.srcset.length > 0,
            maxWidth: computedStyle.maxWidth,
            objectFit: computedStyle.objectFit,
            aspectRatio: img.naturalWidth && img.naturalHeight ? 
              (img.naturalWidth / img.naturalHeight).toFixed(2) : null
          };
        }).slice(0, 5); // Limit for performance
      });
      
      console.log(`Viewport: ${responsiveMetrics[0]?.viewportWidth}px (mobile: ${isMobile})`);
      
      responsiveMetrics.forEach((img, index) => {
        console.log(`Image ${index + 1}: ${img.displayWidth}px display, ${img.naturalWidth}px natural`);
        
        // Images shouldn't be significantly larger than display size
        if (img.naturalWidth && img.displayWidth) {
          const oversizeRatio = img.naturalWidth / img.displayWidth;
          expect(oversizeRatio).toBeLessThan(3); // Allow up to 3x for retina displays
        }
        
        // Responsive images should have appropriate sizing
        if (img.isResponsive) {
          expect(img.maxWidth).not.toBe('none'); // Should have max-width constraint
        }
      });
    });

    test('should validate Time to First Byte (TTFB)', async ({ page }) => {
      const navigationStart = Date.now();
      
      await page.goto('/');
      
      const ttfbMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          ttfb: navigation.responseStart - navigation.requestStart,
          domainLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          tlsHandshake: navigation.connectEnd - navigation.secureConnectionStart,
          serverResponse: navigation.responseEnd - navigation.responseStart
        };
      });
      
      console.log(`TTFB: ${ttfbMetrics.ttfb.toFixed(0)}ms`);
      console.log(`Domain lookup: ${ttfbMetrics.domainLookup.toFixed(0)}ms`);
      console.log(`TCP connect: ${ttfbMetrics.tcpConnect.toFixed(0)}ms`);
      
      expect(ttfbMetrics.ttfb).toBeLessThan(PERFORMANCE_BUDGETS.timeToFirstByte);
    });
  });

  test.describe('Real User Monitoring Simulation', () => {
    test('should simulate real user interactions and measure performance', async ({ page }) => {
      await page.goto('/');
      
      // Simulate real user behavior
      const userJourney = [
        { action: 'scroll', target: 'body', delay: 1000 },
        { action: 'click', target: 'a[href*="services"]', delay: 2000 },
        { action: 'scroll', target: 'body', delay: 1500 },
        { action: 'click', target: 'a[href*="contact"]', delay: 2000 },
      ];
      
      const performanceMetrics = [];
      
      for (const step of userJourney) {
        const startTime = Date.now();
        
        try {
          switch (step.action) {
            case 'scroll':
              await page.evaluate(() => window.scrollTo(0, window.innerHeight));
              break;
            case 'click':
              const element = page.locator(step.target).first();
              if (await element.isVisible()) {
                await element.click();
                await page.waitForLoadState('domcontentloaded');
              }
              break;
          }
          
          const endTime = Date.now();
          performanceMetrics.push({
            action: step.action,
            target: step.target,
            duration: endTime - startTime,
            timestamp: endTime
          });
          
          await page.waitForTimeout(step.delay);
        } catch (error) {
          console.warn(`Failed to execute ${step.action} on ${step.target}:`, error.message);
        }
      }
      
      // Validate user experience metrics
      const avgInteractionTime = performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length;
      console.log(`Average interaction time: ${avgInteractionTime.toFixed(0)}ms`);
      
      // User interactions should be responsive
      expect(avgInteractionTime).toBeLessThan(500); // 500ms for good UX
      
      // No interaction should take too long
      const slowInteractions = performanceMetrics.filter(m => m.duration > 1000);
      expect(slowInteractions.length).toBe(0);
    });

    test('should measure performance under different network conditions', async ({ page, context }) => {
      // Simulate slow 3G network
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 50)); // Add 50ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      console.log(`Load time on slow network: ${loadTime}ms`);
      
      // Should still be usable on slow networks (within 5 seconds)
      expect(loadTime).toBeLessThan(5000);
      
      // Critical content should be visible
      const heroContent = page.locator('h1, [data-testid*="hero"]').first();
      await expect(heroContent).toBeVisible();
    });

    test('should validate performance across different device types', async ({ page, isMobile }) => {
      await page.goto('/');
      
      const deviceMetrics = await page.evaluate(() => {
        return {
          devicePixelRatio: window.devicePixelRatio,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
          memoryInfo: (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          } : null
        };
      });
      
      console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'}`);
      console.log(`Viewport: ${deviceMetrics.viewportWidth}x${deviceMetrics.viewportHeight}`);
      console.log(`Device Pixel Ratio: ${deviceMetrics.devicePixelRatio}`);
      
      // Mobile-specific performance validations
      if (isMobile) {
        // Mobile viewports should be properly handled
        expect(deviceMetrics.viewportWidth).toBeLessThanOrEqual(768);
        
        // Check for mobile-optimized layout
        const mobileElements = page.locator('[class*="mobile"], [class*="sm:"], [data-mobile]');
        const mobileElementCount = await mobileElements.count();
        expect(mobileElementCount).toBeGreaterThan(0);
      }
      
      // Memory usage should be reasonable
      if (deviceMetrics.memoryInfo) {
        const memoryUsageMB = deviceMetrics.memoryInfo.usedJSHeapSize / (1024 * 1024);
        console.log(`Memory usage: ${memoryUsageMB.toFixed(1)}MB`);
        expect(memoryUsageMB).toBeLessThan(50); // Should use less than 50MB
      }
    });
  });

  test.describe('Performance Regression Detection', () => {
    test('should detect performance regressions', async ({ page }) => {
      // This test would compare current performance against baseline
      // For now, we'll simulate baseline comparison
      
      await page.goto('/');
      
      const currentMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {
            lcp: 0,
            fcp: 0,
            cls: 0,
            navigationStart: performance.timeOrigin
          };
          
          // Measure LCP
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Measure FCP
          const fcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) metrics.fcp = fcpEntry.startTime;
          });
          fcpObserver.observe({ entryTypes: ['paint'] });
          
          // Measure CLS
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            metrics.cls = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          setTimeout(() => resolve(metrics), 3000);
        });
      });
      
      // Simulate baseline metrics (in real implementation, these would be stored)
      const baselineMetrics = {
        lcp: 2000,
        fcp: 1500,
        cls: 0.08
      };
      
      // Check for regressions (>10% worse than baseline)
      const lcpRegression = (currentMetrics.lcp - baselineMetrics.lcp) / baselineMetrics.lcp;
      const fcpRegression = (currentMetrics.fcp - baselineMetrics.fcp) / baselineMetrics.fcp;
      const clsRegression = (currentMetrics.cls - baselineMetrics.cls) / baselineMetrics.cls;
      
      console.log(`LCP change: ${(lcpRegression * 100).toFixed(1)}%`);
      console.log(`FCP change: ${(fcpRegression * 100).toFixed(1)}%`);
      console.log(`CLS change: ${(clsRegression * 100).toFixed(1)}%`);
      
      // Fail if any metric regressed by more than 15%
      expect(lcpRegression).toBeLessThan(0.15);
      expect(fcpRegression).toBeLessThan(0.15);
      expect(clsRegression).toBeLessThan(0.15);
    });

    test('should validate performance budget compliance over time', async ({ page }) => {
      // This test validates that performance stays within budgets consistently
      const measurements = [];
      
      // Take multiple measurements
      for (let i = 0; i < 3; i++) {
        await page.goto('/', { waitUntil: 'networkidle' });
        
        const measurement = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            loadTime: navigation.loadEventEnd - navigation.navigationStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            firstByte: navigation.responseStart - navigation.navigationStart,
            iteration: Date.now()
          };
        });
        
        measurements.push(measurement);
        
        // Wait between measurements
        if (i < 2) await page.waitForTimeout(1000);
      }
      
      // Calculate statistics
      const avgLoadTime = measurements.reduce((sum, m) => sum + m.loadTime, 0) / measurements.length;
      const maxLoadTime = Math.max(...measurements.map(m => m.loadTime));
      const minLoadTime = Math.min(...measurements.map(m => m.loadTime));
      const variance = maxLoadTime - minLoadTime;
      
      console.log(`Load time - Avg: ${avgLoadTime.toFixed(0)}ms, Min: ${minLoadTime.toFixed(0)}ms, Max: ${maxLoadTime.toFixed(0)}ms`);
      console.log(`Load time variance: ${variance.toFixed(0)}ms`);
      
      // Performance should be consistent
      expect(avgLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.pageLoadTime);
      expect(maxLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.pageLoadTime * 1.5); // Allow 50% variance
      expect(variance).toBeLessThan(2000); // Variance should be less than 2 seconds
    });
  });
});

    test('should minimize render-blocking resources', async ({ page }) => {
      const renderBlockingResources = [];
      
      page.on('response', response => {
        const url = response.url();
        const headers = response.headers();
        
        // Check for render-blocking CSS/JS
        if ((url.includes('.css') || url.includes('.js')) && 
            !headers['async'] && !headers['defer']) {
          renderBlockingResources.push(url);
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Should minimize render-blocking resources
      expect(renderBlockingResources.length).toBeLessThan(5);
    });
  });

  test.describe('Mobile Performance', () => {
    test('should meet mobile performance requirements', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-specific test');
      
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should optimize for mobile network conditions', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-specific test');
      
      // Simulate slow 3G
      await page.context().route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const loadTime = Date.now() - startTime;
      
      // Should still be reasonable on slow connections
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle mobile viewport efficiently', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-specific test');
      
      await page.goto('/');
      
      // Check viewport meta tag
      const viewportMeta = page.locator('meta[name="viewport"]');
      await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
      
      // Check for mobile-optimized layout
      const mobileElements = page.locator('[data-testid*="mobile"]');
      const mobileElementCount = await mobileElements.count();
      expect(mobileElementCount).toBeGreaterThan(0);
      
      // Verify no horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance
    });
  });

  test.describe('Resource Optimization', () => {
    test('should compress text resources', async ({ page }) => {
      const responses = [];
      
      page.on('response', response => {
        const url = response.url();
        const headers = response.headers();
        
        if (url.includes('.css') || url.includes('.js') || url.includes('.html')) {
          responses.push({
            url,
            contentEncoding: headers['content-encoding'],
            contentType: headers['content-type']
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Text resources should be compressed
      const uncompressedResources = responses.filter(
        response => !response.contentEncoding || 
        (!response.contentEncoding.includes('gzip') && 
         !response.contentEncoding.includes('br'))
      );
      
      // Allow some uncompressed resources but not all
      expect(uncompressedResources.length).toBeLessThan(responses.length * 0.5);
    });

    test('should cache static resources', async ({ page }) => {
      const cacheableResponses = [];
      
      page.on('response', response => {
        const url = response.url();
        const headers = response.headers();
        
        if (url.includes('.css') || url.includes('.js') || 
            url.includes('.png') || url.includes('.jpg') || 
            url.includes('.webp') || url.includes('.woff')) {
          cacheableResponses.push({
            url,
            cacheControl: headers['cache-control'],
            expires: headers['expires']
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Static resources should have cache headers
      const uncachedResources = cacheableResponses.filter(
        response => !response.cacheControl && !response.expires
      );
      
      expect(uncachedResources.length).toBe(0);
    });

    test('should minimize bundle sizes', async ({ page }) => {
      const jsResponses = [];
      
      page.on('response', async response => {
        const url = response.url();
        
        if (url.includes('.js') && !url.includes('node_modules')) {
          try {
            const buffer = await response.body();
            jsResponses.push({
              url,
              size: buffer.length
            });
          } catch (error) {
            // Ignore errors for responses we can't read
          }
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Main bundle should be under reasonable size (500KB)
      const mainBundle = jsResponses.find(response => 
        response.url.includes('main') || response.url.includes('index')
      );
      
      if (mainBundle) {
        expect(mainBundle.size).toBeLessThan(500 * 1024); // 500KB
      }
      
      // Total JS should be under 1MB
      const totalJSSize = jsResponses.reduce((total, response) => total + response.size, 0);
      expect(totalJSSize).toBeLessThan(1024 * 1024); // 1MB
    });
  });

  test.describe('Runtime Performance', () => {
    test('should maintain smooth scrolling', async ({ page }) => {
      await page.goto('/');
      
      // Measure scroll performance
      const scrollPerformance = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let startTime = performance.now();
          
          const measureFrames = () => {
            frameCount++;
            if (frameCount < 60) { // Measure for ~1 second at 60fps
              requestAnimationFrame(measureFrames);
            } else {
              const endTime = performance.now();
              const fps = frameCount / ((endTime - startTime) / 1000);
              resolve(fps);
            }
          };
          
          // Start scrolling
          window.scrollTo(0, 100);
          requestAnimationFrame(measureFrames);
        });
      });
      
      // Should maintain at least 30 FPS during scrolling
      expect(scrollPerformance).toBeGreaterThan(30);
    });

    test('should handle memory efficiently', async ({ page }) => {
      await page.goto('/');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Navigate through several pages
      await page.goto('/services');
      await page.goto('/blog');
      await page.goto('/contact');
      await page.goto('/');
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Memory growth should be reasonable (less than 50MB increase)
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB
    });

    test('should respond quickly to user interactions', async ({ page }) => {
      await page.goto('/');
      
      // Test button click responsiveness
      const button = page.getByRole('button').first();
      
      const startTime = Date.now();
      await button.click();
      
      // Wait for any visual feedback
      await page.waitForTimeout(100);
      
      const responseTime = Date.now() - startTime;
      
      // Should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });
  });
});