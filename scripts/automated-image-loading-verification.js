#!/usr/bin/env node

/**
 * Automated Image Loading Verification Script
 *
 * Creates a test suite to verify images load correctly on each page,
 * tests image loading performance and error handling, and validates
 * no "Loading image..." placeholders remain visible.
 *
 * Requirements: 7.1, 7.5
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://d15sc9fc739ev2.cloudfront.net',
  timeout: 30000,
  imageLoadTimeout: 10000,
  outputDir: 'validation-reports',
  viewport: { width: 1280, height: 720 },
  mobileViewport: { width: 375, height: 667 },
  slowNetworkThrottle: {
    downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
    uploadThroughput: (750 * 1024) / 8, // 750 Kbps
    latency: 40, // 40ms
  },
};

// Pages to test with their expected images
const TEST_PAGES = {
  homepage: {
    url: '/',
    name: 'Homepage',
    expectedImages: [
      // Service cards
      {
        selector: '[data-testid="service-card-photography"] img',
        category: 'service-card',
        name: 'Photography Service Card',
      },
      {
        selector: '[data-testid="service-card-analytics"] img',
        category: 'service-card',
        name: 'Analytics Service Card',
      },
      {
        selector: '[data-testid="service-card-ad-campaigns"] img',
        category: 'service-card',
        name: 'Ad Campaigns Service Card',
      },
      // Blog previews
      {
        selector: '[data-testid="blog-preview"] img',
        category: 'blog-preview',
        name: 'Blog Preview Images',
      },
      // Hero image
      {
        selector: '[data-testid="hero-section"] img',
        category: 'hero',
        name: 'Hero Image',
      },
    ],
  },

  photographyService: {
    url: '/services/photography',
    name: 'Photography Service Page',
    expectedImages: [
      {
        selector: '[data-testid="service-hero"] img',
        category: 'service-hero',
        name: 'Photography Hero Image',
      },
      {
        selector: '[data-testid="portfolio-gallery"] img',
        category: 'portfolio',
        name: 'Photography Portfolio Images',
      },
    ],
  },

  analyticsService: {
    url: '/services/analytics',
    name: 'Analytics Service Page',
    expectedImages: [
      {
        selector: '[data-testid="service-hero"] img',
        category: 'service-hero',
        name: 'Analytics Hero Image',
      },
      {
        selector: '[data-testid="portfolio-gallery"] img',
        category: 'portfolio',
        name: 'Analytics Portfolio Images',
      },
    ],
  },

  adCampaignsService: {
    url: '/services/ad-campaigns',
    name: 'Ad Campaigns Service Page',
    expectedImages: [
      {
        selector: '[data-testid="service-hero"] img',
        category: 'service-hero',
        name: 'Ad Campaigns Hero Image',
      },
      {
        selector: '[data-testid="portfolio-gallery"] img',
        category: 'portfolio',
        name: 'Ad Campaigns Portfolio Images',
      },
    ],
  },

  about: {
    url: '/about',
    name: 'About Page',
    expectedImages: [
      {
        selector: '[data-testid="about-hero"] img',
        category: 'about-hero',
        name: 'About Hero Image',
      },
    ],
  },

  blog: {
    url: '/blog',
    name: 'Blog Page',
    expectedImages: [
      {
        selector: '[data-testid="service-card"] img',
        category: 'service-card',
        name: 'Service Card Images',
      },
      {
        selector: '[data-testid="blog-preview"] img',
        category: 'blog-preview',
        name: 'Blog Preview Images',
      },
    ],
  },
};

class ImageLoadingVerifier {
  constructor() {
    this.browser = null;
    this.results = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Initialize browser
   */
  async initBrowser() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Test image loading on a single page
   */
  async testPageImages(pageConfig, deviceType = 'desktop') {
    const context = await this.browser.newContext({
      viewport:
        deviceType === 'mobile' ? CONFIG.mobileViewport : CONFIG.viewport,
      userAgent:
        deviceType === 'mobile'
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    });

    const page = await context.newPage();

    const pageResult = {
      page: pageConfig.name,
      url: pageConfig.url,
      deviceType,
      timestamp: new Date().toISOString(),
      success: false,
      loadTime: null,
      images: [],
      placeholders: [],
      errors: [],
      warnings: [],
      performance: {
        totalImages: 0,
        loadedImages: 0,
        failedImages: 0,
        averageLoadTime: 0,
        slowImages: [],
      },
    };

    try {
      console.log(`Testing ${pageConfig.name} (${deviceType})...`);

      // Navigate to page
      const startTime = Date.now();
      const response = await page.goto(`${CONFIG.baseUrl}${pageConfig.url}`, {
        waitUntil: 'networkidle',
        timeout: CONFIG.timeout,
      });

      if (!response.ok()) {
        pageResult.errors.push(`Page failed to load: ${response.status()}`);
        return pageResult;
      }

      pageResult.loadTime = Date.now() - startTime;

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Check for loading placeholders
      await this.checkForPlaceholders(page, pageResult);

      // Test each expected image
      for (const imageConfig of pageConfig.expectedImages) {
        const imageResults = await this.testImageElements(page, imageConfig);
        pageResult.images.push(...imageResults);
      }

      // Calculate performance metrics
      this.calculatePerformanceMetrics(pageResult);

      // Test with slow network (only for desktop to avoid timeout)
      if (deviceType === 'desktop') {
        await this.testSlowNetworkLoading(page, pageConfig, pageResult);
      }

      pageResult.success =
        pageResult.errors.length === 0 &&
        pageResult.performance.failedImages === 0;
    } catch (error) {
      pageResult.errors.push(`Page test failed: ${error.message}`);
    } finally {
      await context.close();
    }

    return pageResult;
  }

  /**
   * Check for loading placeholders
   */
  async checkForPlaceholders(page, pageResult) {
    try {
      // Check for "Loading image..." text
      const loadingTexts = await page.locator('text="Loading image..."').all();
      if (loadingTexts.length > 0) {
        pageResult.placeholders.push({
          type: 'loading-text',
          count: loadingTexts.length,
          message: `Found ${loadingTexts.length} "Loading image..." placeholders`,
        });
      }

      // Check for gradient overlays that might indicate loading states
      const gradientOverlays = await page.locator('.bg-gradient-to-br').all();
      for (const overlay of gradientOverlays) {
        const hasImage = (await overlay.locator('img').count()) > 0;
        if (!hasImage) {
          pageResult.placeholders.push({
            type: 'gradient-overlay',
            message:
              'Found gradient overlay without image - possible loading state',
          });
        }
      }

      // Check for broken image icons
      const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.complete || img.naturalWidth === 0)
          .length;
      });

      if (brokenImages > 0) {
        pageResult.placeholders.push({
          type: 'broken-images',
          count: brokenImages,
          message: `Found ${brokenImages} broken or unloaded images`,
        });
      }
    } catch (error) {
      pageResult.warnings.push(`Placeholder check failed: ${error.message}`);
    }
  }

  /**
   * Test specific image elements
   */
  async testImageElements(page, imageConfig) {
    const results = [];

    try {
      const elements = await page.locator(imageConfig.selector).all();

      if (elements.length === 0) {
        results.push({
          selector: imageConfig.selector,
          category: imageConfig.category,
          name: imageConfig.name,
          success: false,
          error: 'Image element not found',
          loadTime: null,
          src: null,
          dimensions: null,
        });
        return results;
      }

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const imageResult = {
          selector: imageConfig.selector,
          category: imageConfig.category,
          name: `${imageConfig.name} ${i + 1}`,
          success: false,
          error: null,
          loadTime: null,
          src: null,
          dimensions: null,
          naturalDimensions: null,
          visible: false,
        };

        try {
          // Check if element is visible
          imageResult.visible = await element.isVisible();

          // Get image source
          imageResult.src = await element.getAttribute('src');

          // Get dimensions
          const box = await element.boundingBox();
          if (box) {
            imageResult.dimensions = { width: box.width, height: box.height };
          }

          // Test image loading
          const loadStartTime = Date.now();

          // Wait for image to load or timeout
          await element.waitFor({
            state: 'visible',
            timeout: CONFIG.imageLoadTimeout,
          });

          // Check if image actually loaded
          const imageLoaded = await element.evaluate(img => {
            return (
              img.complete && img.naturalWidth > 0 && img.naturalHeight > 0
            );
          });

          if (imageLoaded) {
            imageResult.loadTime = Date.now() - loadStartTime;
            imageResult.success = true;

            // Get natural dimensions
            const naturalDims = await element.evaluate(img => ({
              width: img.naturalWidth,
              height: img.naturalHeight,
            }));
            imageResult.naturalDimensions = naturalDims;

            // Check for performance issues
            if (imageResult.loadTime > 3000) {
              imageResult.warning = `Slow loading image: ${imageResult.loadTime}ms`;
            }
          } else {
            imageResult.error = 'Image failed to load completely';
          }
        } catch (error) {
          imageResult.error = `Image test failed: ${error.message}`;
        }

        results.push(imageResult);
      }
    } catch (error) {
      results.push({
        selector: imageConfig.selector,
        category: imageConfig.category,
        name: imageConfig.name,
        success: false,
        error: `Selector test failed: ${error.message}`,
        loadTime: null,
        src: null,
        dimensions: null,
      });
    }

    return results;
  }

  /**
   * Test loading with slow network
   */
  async testSlowNetworkLoading(page, pageConfig, pageResult) {
    try {
      console.log(`  Testing slow network performance...`);

      // Enable network throttling
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: CONFIG.slowNetworkThrottle.downloadThroughput,
        uploadThroughput: CONFIG.slowNetworkThrottle.uploadThroughput,
        latency: CONFIG.slowNetworkThrottle.latency,
      });

      // Reload page with throttling
      const slowStartTime = Date.now();
      await page.reload({ waitUntil: 'networkidle', timeout: CONFIG.timeout });
      const slowLoadTime = Date.now() - slowStartTime;

      pageResult.performance.slowNetworkLoadTime = slowLoadTime;

      if (slowLoadTime > 10000) {
        pageResult.warnings.push(
          `Slow network load time: ${slowLoadTime}ms (>10s)`
        );
      }

      // Disable throttling
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });
    } catch (error) {
      pageResult.warnings.push(`Slow network test failed: ${error.message}`);
    }
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics(pageResult) {
    const { images } = pageResult;
    const performance = pageResult.performance;

    performance.totalImages = images.length;
    performance.loadedImages = images.filter(img => img.success).length;
    performance.failedImages = images.filter(img => !img.success).length;

    const loadTimes = images
      .filter(img => img.loadTime)
      .map(img => img.loadTime);
    if (loadTimes.length > 0) {
      performance.averageLoadTime = Math.round(
        loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      );
    }

    performance.slowImages = images.filter(
      img => img.loadTime && img.loadTime > 2000
    );
  }

  /**
   * Run comprehensive image loading verification
   */
  async runVerification() {
    console.log('🔍 Starting Automated Image Loading Verification');
    console.log(`📅 Timestamp: ${this.timestamp}`);
    console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);
    console.log(
      `📋 Testing ${Object.keys(TEST_PAGES).length} pages on desktop and mobile\n`
    );

    // Ensure output directory exists
    try {
      await fs.mkdir(CONFIG.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error.message);
    }

    await this.initBrowser();

    const summary = {
      totalPages: Object.keys(TEST_PAGES).length * 2, // desktop + mobile
      successfulPages: 0,
      failedPages: 0,
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      placeholdersFound: 0,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
    };

    try {
      // Test each page on both desktop and mobile
      for (const [pageKey, pageConfig] of Object.entries(TEST_PAGES)) {
        // Desktop test
        const desktopResult = await this.testPageImages(pageConfig, 'desktop');
        this.results.push(desktopResult);

        // Mobile test
        const mobileResult = await this.testPageImages(pageConfig, 'mobile');
        this.results.push(mobileResult);

        // Update summary
        [desktopResult, mobileResult].forEach(result => {
          if (result.success) {
            summary.successfulPages++;
          } else {
            summary.failedPages++;
          }

          summary.totalImages += result.performance.totalImages;
          summary.loadedImages += result.performance.loadedImages;
          summary.failedImages += result.performance.failedImages;
          summary.placeholdersFound += result.placeholders.length;
        });

        console.log(
          `  ✅ ${pageConfig.name} - Desktop: ${desktopResult.success ? 'PASS' : 'FAIL'}, Mobile: ${mobileResult.success ? 'PASS' : 'FAIL'}`
        );
      }

      summary.endTime = new Date().toISOString();
      summary.duration = Date.now() - new Date(summary.startTime).getTime();

      // Generate reports
      await this.generateReports(summary);

      // Print summary
      this.printSummary(summary);

      return summary;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Generate comprehensive reports
   */
  async generateReports(summary) {
    const reportData = {
      metadata: {
        timestamp: this.timestamp,
        baseUrl: CONFIG.baseUrl,
        testConfiguration: CONFIG,
        summary: summary,
      },
      results: this.results,
      testPages: TEST_PAGES,
    };

    // JSON Report
    const jsonReport = path.join(
      CONFIG.outputDir,
      `image-loading-verification-${this.timestamp}.json`
    );
    await fs.writeFile(jsonReport, JSON.stringify(reportData, null, 2));
    console.log(`📄 JSON report saved: ${jsonReport}`);

    // Markdown Report
    const markdownReport = await this.generateMarkdownReport(reportData);
    const mdReport = path.join(
      CONFIG.outputDir,
      `image-loading-verification-${this.timestamp}.md`
    );
    await fs.writeFile(mdReport, markdownReport);
    console.log(`📄 Markdown report saved: ${mdReport}`);

    // HTML Report
    const htmlReport = await this.generateHtmlReport(reportData);
    const htmlReportPath = path.join(
      CONFIG.outputDir,
      `image-loading-verification-${this.timestamp}.html`
    );
    await fs.writeFile(htmlReportPath, htmlReport);
    console.log(`📄 HTML report saved: ${htmlReportPath}`);
  }

  /**
   * Generate Markdown report
   */
  async generateMarkdownReport(data) {
    const { metadata, results } = data;

    let markdown = `# Image Loading Verification Report

## Summary

- **Timestamp**: ${metadata.timestamp}
- **Base URL**: ${metadata.baseUrl}
- **Total Pages Tested**: ${metadata.summary.totalPages}
- **Successful Pages**: ${metadata.summary.successfulPages}
- **Failed Pages**: ${metadata.summary.failedPages}
- **Total Images**: ${metadata.summary.totalImages}
- **Loaded Images**: ${metadata.summary.loadedImages}
- **Failed Images**: ${metadata.summary.failedImages}
- **Placeholders Found**: ${metadata.summary.placeholdersFound}
- **Duration**: ${Math.round(metadata.summary.duration / 1000)}s

## Page Results

`;

    // Group results by page
    const resultsByPage = {};
    results.forEach(result => {
      const key = result.page;
      if (!resultsByPage[key]) {
        resultsByPage[key] = { desktop: null, mobile: null };
      }
      resultsByPage[key][result.deviceType] = result;
    });

    Object.entries(resultsByPage).forEach(([pageName, devices]) => {
      markdown += `### ${pageName}

`;

      ['desktop', 'mobile'].forEach(deviceType => {
        const result = devices[deviceType];
        if (!result) return;

        const status = result.success ? '✅ PASS' : '❌ FAIL';
        markdown += `#### ${deviceType.toUpperCase()} ${status}

- **URL**: ${result.url}
- **Load Time**: ${result.loadTime}ms
- **Total Images**: ${result.performance.totalImages}
- **Loaded Images**: ${result.performance.loadedImages}
- **Failed Images**: ${result.performance.failedImages}
- **Average Image Load Time**: ${result.performance.averageLoadTime}ms
- **Placeholders Found**: ${result.placeholders.length}

`;

        if (result.errors.length > 0) {
          markdown += `**Errors:**
`;
          result.errors.forEach(error => {
            markdown += `- ${error}
`;
          });
          markdown += `
`;
        }

        if (result.warnings.length > 0) {
          markdown += `**Warnings:**
`;
          result.warnings.forEach(warning => {
            markdown += `- ${warning}
`;
          });
          markdown += `
`;
        }

        if (result.placeholders.length > 0) {
          markdown += `**Placeholders Found:**
`;
          result.placeholders.forEach(placeholder => {
            markdown += `- ${placeholder.message}
`;
          });
          markdown += `
`;
        }

        // Show failed images
        const failedImages = result.images.filter(img => !img.success);
        if (failedImages.length > 0) {
          markdown += `**Failed Images:**
`;
          failedImages.forEach(img => {
            markdown += `- ${img.name}: ${img.error}
`;
          });
          markdown += `
`;
        }

        // Show slow images
        if (result.performance.slowImages.length > 0) {
          markdown += `**Slow Loading Images (>2s):**
`;
          result.performance.slowImages.forEach(img => {
            markdown += `- ${img.name}: ${img.loadTime}ms
`;
          });
          markdown += `
`;
        }
      });
    });

    markdown += `## Recommendations

`;

    if (metadata.summary.failedImages > 0) {
      markdown += `### Failed Images (${metadata.summary.failedImages})

The following issues were found with image loading:

`;
      results.forEach(result => {
        const failedImages = result.images.filter(img => !img.success);
        if (failedImages.length > 0) {
          markdown += `**${result.page} (${result.deviceType}):**
`;
          failedImages.forEach(img => {
            markdown += `- ${img.name}: ${img.error}
`;
          });
          markdown += `
`;
        }
      });

      markdown += `**Actions Required:**
1. Check image paths and ensure files exist
2. Verify deployment process includes all images
3. Test image loading in development environment
4. Check for JavaScript errors that might prevent image loading

`;
    }

    if (metadata.summary.placeholdersFound > 0) {
      markdown += `### Loading Placeholders Found (${metadata.summary.placeholdersFound})

Loading placeholders were detected, indicating images may not be loading properly:

`;
      results.forEach(result => {
        if (result.placeholders.length > 0) {
          markdown += `**${result.page} (${result.deviceType}):**
`;
          result.placeholders.forEach(placeholder => {
            markdown += `- ${placeholder.message}
`;
          });
          markdown += `
`;
        }
      });

      markdown += `**Actions Required:**
1. Investigate why images are not loading completely
2. Check OptimizedImage component error handling
3. Verify image paths are correct
4. Test with different network conditions

`;
    }

    // Performance recommendations
    const slowImages = results.flatMap(r => r.performance.slowImages);
    if (slowImages.length > 0) {
      markdown += `### Performance Optimization

${slowImages.length} images are loading slowly (>2 seconds):

**Recommendations:**
1. Optimize image file sizes and compression
2. Implement proper image caching headers
3. Consider using WebP format for better compression
4. Implement lazy loading for below-the-fold images
5. Use CloudFront compression and optimization features

`;
    }

    markdown += `### Next Steps

1. **Fix Critical Issues**: Address any failed image loads immediately
2. **Remove Placeholders**: Ensure no "Loading image..." text remains visible
3. **Optimize Performance**: Address slow-loading images
4. **Cross-Browser Testing**: Test image loading across different browsers
5. **Monitoring**: Set up automated monitoring for ongoing validation

---

**Report Generated**: ${new Date().toISOString()}  
**Validation Requirements**: 7.1, 7.5 from website-image-navigation-fixes spec
`;

    return markdown;
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport(data) {
    const { metadata, results } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Loading Verification Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #495057; font-size: 0.9em; text-transform: uppercase; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .page-section { margin: 30px 0; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; }
        .page-header { background: #e9ecef; padding: 20px; font-weight: bold; font-size: 1.2em; }
        .device-section { padding: 20px; border-bottom: 1px solid #dee2e6; }
        .device-section:last-child { border-bottom: none; }
        .device-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .device-title { font-weight: bold; font-size: 1.1em; }
        .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .status-pass { background: #d4edda; color: #155724; }
        .status-fail { background: #f8d7da; color: #721c24; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
        .metric-item { background: #f8f9fa; padding: 12px; border-radius: 4px; text-align: center; }
        .metric-label { font-size: 0.9em; color: #6c757d; }
        .metric-value { font-size: 1.5em; font-weight: bold; margin-top: 5px; }
        .issues-section { margin: 15px 0; }
        .issue-list { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 10px 0; }
        .issue-list.error { background: #f8d7da; border-color: #f5c6cb; }
        .issue-list.success { background: #d4edda; border-color: #c3e6cb; }
        .image-details { margin: 15px 0; }
        .image-item { background: #f8f9fa; border: 1px solid #dee2e6; padding: 12px; margin: 8px 0; border-radius: 4px; }
        .image-item.failed { border-color: #dc3545; background: #f8d7da; }
        .image-item.slow { border-color: #ffc107; background: #fff3cd; }
        .footer { text-align: center; padding: 20px; color: #6c757d; border-top: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Image Loading Verification</h1>
            <p>Comprehensive testing of image loading across all pages and devices</p>
            <p><strong>Generated:</strong> ${metadata.timestamp} | <strong>Base URL:</strong> ${metadata.baseUrl}</p>
        </div>

        <div class="content">
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Pages Tested</h3>
                    <div class="value info">${metadata.summary.totalPages}</div>
                </div>
                <div class="summary-card">
                    <h3>Successful</h3>
                    <div class="value success">${metadata.summary.successfulPages}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="value error">${metadata.summary.failedPages}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Images</h3>
                    <div class="value info">${metadata.summary.totalImages}</div>
                </div>
                <div class="summary-card">
                    <h3>Loaded Images</h3>
                    <div class="value success">${metadata.summary.loadedImages}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed Images</h3>
                    <div class="value error">${metadata.summary.failedImages}</div>
                </div>
                <div class="summary-card">
                    <h3>Placeholders</h3>
                    <div class="value warning">${metadata.summary.placeholdersFound}</div>
                </div>
            </div>

            <h2>Page Results</h2>
            
            ${Object.entries(
              results.reduce((acc, result) => {
                if (!acc[result.page]) acc[result.page] = {};
                acc[result.page][result.deviceType] = result;
                return acc;
              }, {})
            )
              .map(
                ([pageName, devices]) => `
              <div class="page-section">
                <div class="page-header">${pageName}</div>
                
                ${['desktop', 'mobile']
                  .map(deviceType => {
                    const result = devices[deviceType];
                    if (!result) return '';

                    return `
                  <div class="device-section">
                    <div class="device-header">
                      <div class="device-title">${deviceType.toUpperCase()}</div>
                      <div class="status-badge ${result.success ? 'status-pass' : 'status-fail'}">
                        ${result.success ? '✅ PASS' : '❌ FAIL'}
                      </div>
                    </div>
                    
                    <div class="metrics-grid">
                      <div class="metric-item">
                        <div class="metric-label">Load Time</div>
                        <div class="metric-value">${result.loadTime}ms</div>
                      </div>
                      <div class="metric-item">
                        <div class="metric-label">Total Images</div>
                        <div class="metric-value">${result.performance.totalImages}</div>
                      </div>
                      <div class="metric-item">
                        <div class="metric-label">Loaded</div>
                        <div class="metric-value success">${result.performance.loadedImages}</div>
                      </div>
                      <div class="metric-item">
                        <div class="metric-label">Failed</div>
                        <div class="metric-value error">${result.performance.failedImages}</div>
                      </div>
                      <div class="metric-item">
                        <div class="metric-label">Avg Load Time</div>
                        <div class="metric-value">${result.performance.averageLoadTime}ms</div>
                      </div>
                      <div class="metric-item">
                        <div class="metric-label">Placeholders</div>
                        <div class="metric-value warning">${result.placeholders.length}</div>
                      </div>
                    </div>

                    ${
                      result.errors.length > 0
                        ? `
                    <div class="issues-section">
                      <h4>Errors</h4>
                      <div class="issue-list error">
                        <ul>
                          ${result.errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                      </div>
                    </div>
                    `
                        : ''
                    }

                    ${
                      result.warnings.length > 0
                        ? `
                    <div class="issues-section">
                      <h4>Warnings</h4>
                      <div class="issue-list">
                        <ul>
                          ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                      </div>
                    </div>
                    `
                        : ''
                    }

                    ${
                      result.placeholders.length > 0
                        ? `
                    <div class="issues-section">
                      <h4>Loading Placeholders Found</h4>
                      <div class="issue-list">
                        <ul>
                          ${result.placeholders.map(placeholder => `<li>${placeholder.message}</li>`).join('')}
                        </ul>
                      </div>
                    </div>
                    `
                        : ''
                    }

                    ${
                      result.images.length > 0
                        ? `
                    <div class="image-details">
                      <h4>Image Details</h4>
                      ${result.images
                        .map(
                          img => `
                        <div class="image-item ${!img.success ? 'failed' : img.loadTime > 2000 ? 'slow' : ''}">
                          <strong>${img.name}</strong>
                          <br>Status: ${img.success ? '✅ Loaded' : '❌ Failed'}
                          ${img.loadTime ? ` | Load Time: ${img.loadTime}ms` : ''}
                          ${img.src ? ` | Source: ${img.src}` : ''}
                          ${img.error ? `<br><span style="color: #dc3545;">Error: ${img.error}</span>` : ''}
                          ${img.warning ? `<br><span style="color: #856404;">Warning: ${img.warning}</span>` : ''}
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                    `
                        : ''
                    }
                  </div>
                  `;
                  })
                  .join('')}
              </div>
            `
              )
              .join('')}

            <div class="issues-section">
                <h3>💡 Recommendations</h3>
                <div class="issue-list ${metadata.summary.failedImages === 0 && metadata.summary.placeholdersFound === 0 ? 'success' : ''}">
                    <ul>
                        ${metadata.summary.failedImages > 0 ? '<li><strong>Fix Failed Images:</strong> Address image loading failures immediately</li>' : ''}
                        ${metadata.summary.placeholdersFound > 0 ? '<li><strong>Remove Placeholders:</strong> Ensure no "Loading image..." text remains visible</li>' : ''}
                        <li><strong>Optimize Performance:</strong> Address slow-loading images (>2s)</li>
                        <li><strong>Cross-Browser Testing:</strong> Test across different browsers and devices</li>
                        <li><strong>Monitor:</strong> Set up automated monitoring for ongoing validation</li>
                        ${metadata.summary.failedImages === 0 && metadata.summary.placeholdersFound === 0 ? '<li><strong>✅ Excellent:</strong> All images are loading correctly!</li>' : ''}
                    </ul>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Report Generated:</strong> ${new Date().toISOString()}</p>
            <p><strong>Requirements:</strong> 7.1, 7.5 from website-image-navigation-fixes spec</p>
            <p><strong>Duration:</strong> ${Math.round(metadata.summary.duration / 1000)}s</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Print summary to console
   */
  printSummary(summary) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 IMAGE LOADING VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    console.log(
      `📄 Pages Tested: ${summary.successfulPages}/${summary.totalPages} successful`
    );
    console.log(
      `🖼️  Images Tested: ${summary.loadedImages}/${summary.totalImages} loaded`
    );
    console.log(`⚠️  Placeholders Found: ${summary.placeholdersFound}`);
    console.log(`⏱️  Duration: ${Math.round(summary.duration / 1000)}s`);

    if (summary.failedPages > 0) {
      console.log('\n❌ FAILED PAGES:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(
            `   ${result.page} (${result.deviceType}): ${result.errors.join(', ')}`
          );
        });
    }

    if (summary.placeholdersFound > 0) {
      console.log('\n⚠️  LOADING PLACEHOLDERS FOUND:');
      this.results.forEach(result => {
        if (result.placeholders.length > 0) {
          console.log(
            `   ${result.page} (${result.deviceType}): ${result.placeholders.length} placeholders`
          );
        }
      });
    }

    if (
      summary.successfulPages === summary.totalPages &&
      summary.placeholdersFound === 0
    ) {
      console.log('\n🎉 All pages and images are loading correctly!');
    } else {
      console.log(
        '\n⚠️  Some issues found. Check detailed reports for more information.'
      );
    }

    console.log('='.repeat(70));
  }
}

// Main execution
async function main() {
  try {
    const verifier = new ImageLoadingVerifier();
    const summary = await verifier.runVerification();

    // Exit with error code if any pages failed or placeholders found
    const exitCode =
      summary.failedPages > 0 || summary.placeholdersFound > 0 ? 1 : 0;
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Image loading verification failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ImageLoadingVerifier, TEST_PAGES };
