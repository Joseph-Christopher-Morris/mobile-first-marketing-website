#!/usr/bin/env node

/**
 * Image Loading Performance Monitor
 * Monitors image loading performance, Core Web Vitals impact, and sets up alerts
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { performance } = require('perf_hooks');

class ImagePerformanceMonitor {
  constructor() {
    this.baseUrl =
      process.env.SITE_URL || 'https://d15sc9fc739ev2.cloudfront.net';
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      imageMetrics: [],
      coreWebVitals: {},
      alerts: [],
      summary: {},
    };

    // Critical images to monitor
    this.criticalImages = [
      // Homepage service cards
      '/images/services/photography-hero.webp',
      '/images/services/screenshot-2025-09-23-201649.webp',
      '/images/services/ad-campaigns-hero.webp',

      // Blog preview images
      '/images/hero/google-ads-analytics-dashboard.webp',
      '/images/hero/whatsapp-image-flyers-roi.webp',
      '/images/hero/240619-London-19.webp',

      // Service page hero images
      '/images/services/250928-Hampson_Auctions_Sunday-11.webp',
      '/images/about/A7302858.webp',
    ];
  }

  /**
   * Monitor individual image loading performance
   */
  async monitorImageLoading(imagePath) {
    const startTime = performance.now();
    const imageUrl = `${this.baseUrl}${imagePath}`;

    return new Promise(resolve => {
      const req = https.get(imageUrl, res => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        let dataSize = 0;
        res.on('data', chunk => {
          dataSize += chunk.length;
        });

        res.on('end', () => {
          const metric = {
            path: imagePath,
            url: imageUrl,
            statusCode: res.statusCode,
            loadTime: Math.round(loadTime),
            sizeBytes: dataSize,
            sizeKB: Math.round(dataSize / 1024),
            contentType: res.headers['content-type'],
            cacheControl: res.headers['cache-control'],
            success: res.statusCode === 200,
            timestamp: new Date().toISOString(),
          };

          // Performance thresholds
          if (loadTime > 2000) {
            this.results.alerts.push({
              type: 'SLOW_LOADING',
              severity: 'WARNING',
              message: `Image ${imagePath} loaded in ${Math.round(loadTime)}ms (>2000ms threshold)`,
              metric,
            });
          }

          if (res.statusCode !== 200) {
            this.results.alerts.push({
              type: 'LOADING_FAILURE',
              severity: 'ERROR',
              message: `Image ${imagePath} failed to load (HTTP ${res.statusCode})`,
              metric,
            });
          }

          if (!res.headers['content-type']?.includes('image/')) {
            this.results.alerts.push({
              type: 'INCORRECT_MIME_TYPE',
              severity: 'ERROR',
              message: `Image ${imagePath} has incorrect MIME type: ${res.headers['content-type']}`,
              metric,
            });
          }

          resolve(metric);
        });
      });

      req.on('error', error => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        const metric = {
          path: imagePath,
          url: imageUrl,
          statusCode: 0,
          loadTime: Math.round(loadTime),
          sizeBytes: 0,
          sizeKB: 0,
          contentType: null,
          cacheControl: null,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        };

        this.results.alerts.push({
          type: 'NETWORK_ERROR',
          severity: 'ERROR',
          message: `Network error loading ${imagePath}: ${error.message}`,
          metric,
        });

        resolve(metric);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        const metric = {
          path: imagePath,
          url: imageUrl,
          statusCode: 0,
          loadTime: Math.round(loadTime),
          sizeBytes: 0,
          sizeKB: 0,
          contentType: null,
          cacheControl: null,
          success: false,
          error: 'Request timeout',
          timestamp: new Date().toISOString(),
        };

        this.results.alerts.push({
          type: 'TIMEOUT',
          severity: 'ERROR',
          message: `Image ${imagePath} request timed out after 10 seconds`,
          metric,
        });

        resolve(metric);
      });
    });
  }

  /**
   * Simulate Core Web Vitals impact assessment
   */
  assessCoreWebVitalsImpact() {
    const totalImages = this.results.imageMetrics.length;
    const failedImages = this.results.imageMetrics.filter(
      m => !m.success
    ).length;
    const slowImages = this.results.imageMetrics.filter(
      m => m.loadTime > 2500
    ).length;
    const avgLoadTime =
      this.results.imageMetrics.reduce((sum, m) => sum + m.loadTime, 0) /
      totalImages;
    const totalImageSize = this.results.imageMetrics.reduce(
      (sum, m) => sum + m.sizeKB,
      0
    );

    // Estimate LCP impact (Largest Contentful Paint)
    const heroImages = this.results.imageMetrics.filter(
      m =>
        m.path.includes('/hero/') ||
        m.path.includes('hero') ||
        m.path.includes('A7302858')
    );
    const maxHeroLoadTime = Math.max(...heroImages.map(m => m.loadTime), 0);

    // Estimate CLS impact (Cumulative Layout Shift)
    const clsRisk =
      failedImages > 0 ? 'HIGH' : slowImages > 2 ? 'MEDIUM' : 'LOW';

    this.results.coreWebVitals = {
      lcp: {
        estimatedImpact: maxHeroLoadTime,
        threshold: 2500,
        status:
          maxHeroLoadTime > 2500
            ? 'POOR'
            : maxHeroLoadTime > 1200
              ? 'NEEDS_IMPROVEMENT'
              : 'GOOD',
        recommendation:
          maxHeroLoadTime > 2500
            ? 'Optimize hero images for faster loading'
            : 'Hero image performance is acceptable',
      },
      cls: {
        riskLevel: clsRisk,
        failedImages,
        recommendation:
          failedImages > 0
            ? 'Fix failed image loading to prevent layout shifts'
            : 'Image loading stability is good',
      },
      fid: {
        impact: 'MINIMAL',
        recommendation:
          'Image loading should not significantly impact First Input Delay',
      },
      performance: {
        avgLoadTime: Math.round(avgLoadTime),
        totalSize: totalImageSize,
        failureRate: Math.round((failedImages / totalImages) * 100),
        recommendation:
          avgLoadTime > 2000
            ? 'Consider image optimization and CDN improvements'
            : 'Image performance is acceptable',
      },
    };
  }

  /**
   * Generate performance summary
   */
  generateSummary() {
    const totalImages = this.results.imageMetrics.length;
    const successfulImages = this.results.imageMetrics.filter(
      m => m.success
    ).length;
    const failedImages = totalImages - successfulImages;
    const avgLoadTime =
      this.results.imageMetrics.reduce((sum, m) => sum + m.loadTime, 0) /
      totalImages;
    const totalSize = this.results.imageMetrics.reduce(
      (sum, m) => sum + m.sizeKB,
      0
    );

    const errorCount = this.results.alerts.filter(
      a => a.severity === 'ERROR'
    ).length;
    const warningCount = this.results.alerts.filter(
      a => a.severity === 'WARNING'
    ).length;

    this.results.summary = {
      totalImages,
      successfulImages,
      failedImages,
      successRate: Math.round((successfulImages / totalImages) * 100),
      avgLoadTime: Math.round(avgLoadTime),
      totalSizeKB: totalSize,
      errorCount,
      warningCount,
      overallStatus:
        errorCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'WARNING' : 'HEALTHY',
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const failedImages = this.results.imageMetrics.filter(m => !m.success);
    const slowImages = this.results.imageMetrics.filter(m => m.loadTime > 2000);
    const largeImages = this.results.imageMetrics.filter(m => m.sizeKB > 500);

    if (failedImages.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'RELIABILITY',
        issue: `${failedImages.length} images failed to load`,
        action: 'Fix image paths and ensure all images exist in deployment',
      });
    }

    if (slowImages.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'PERFORMANCE',
        issue: `${slowImages.length} images load slowly (>2000ms)`,
        action: 'Optimize image compression and consider WebP format',
      });
    }

    if (largeImages.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'OPTIMIZATION',
        issue: `${largeImages.length} images are large (>500KB)`,
        action: 'Compress images and implement responsive image loading',
      });
    }

    // Cache control recommendations
    const noCacheImages = this.results.imageMetrics.filter(
      m => !m.cacheControl || !m.cacheControl.includes('max-age')
    );

    if (noCacheImages.length > 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'CACHING',
        issue: `${noCacheImages.length} images lack proper cache headers`,
        action: 'Configure long-term caching for image assets',
      });
    }

    return recommendations;
  }

  /**
   * Save monitoring results
   */
  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `image-performance-monitoring-${timestamp}.json`;
    const filepath = path.join(process.cwd(), filename);

    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));

    // Also save a summary report
    const summaryFilename = `image-performance-summary-${timestamp}.md`;
    const summaryPath = path.join(process.cwd(), summaryFilename);
    const summaryReport = this.generateMarkdownReport();

    fs.writeFileSync(summaryPath, summaryReport);

    return { jsonReport: filepath, summaryReport: summaryPath };
  }

  /**
   * Generate markdown summary report
   */
  generateMarkdownReport() {
    const { summary, coreWebVitals, alerts } = this.results;

    return `# Image Performance Monitoring Report

**Generated:** ${this.results.timestamp}
**Site:** ${this.baseUrl}

## Executive Summary

- **Total Images Monitored:** ${summary.totalImages}
- **Success Rate:** ${summary.successRate}%
- **Average Load Time:** ${summary.avgLoadTime}ms
- **Total Image Size:** ${summary.totalSizeKB}KB
- **Overall Status:** ${summary.overallStatus}

## Core Web Vitals Impact

### Largest Contentful Paint (LCP)
- **Estimated Impact:** ${coreWebVitals.lcp.estimatedImpact}ms
- **Status:** ${coreWebVitals.lcp.status}
- **Recommendation:** ${coreWebVitals.lcp.recommendation}

### Cumulative Layout Shift (CLS)
- **Risk Level:** ${coreWebVitals.cls.riskLevel}
- **Failed Images:** ${coreWebVitals.cls.failedImages}
- **Recommendation:** ${coreWebVitals.cls.recommendation}

### Performance Metrics
- **Average Load Time:** ${coreWebVitals.performance.avgLoadTime}ms
- **Failure Rate:** ${coreWebVitals.performance.failureRate}%
- **Recommendation:** ${coreWebVitals.performance.recommendation}

## Alerts and Issues

${alerts.length === 0 ? 'No alerts generated - all images loading successfully!' : ''}
${alerts
  .map(
    alert => `
### ${alert.severity}: ${alert.type}
**Message:** ${alert.message}
**Image:** ${alert.metric?.path || 'N/A'}
**Load Time:** ${alert.metric?.loadTime || 'N/A'}ms
`
  )
  .join('\n')}

## Recommendations

${summary.recommendations
  .map(
    rec => `
### ${rec.priority} Priority - ${rec.category}
**Issue:** ${rec.issue}
**Action:** ${rec.action}
`
  )
  .join('\n')}

## Detailed Metrics

| Image Path | Status | Load Time | Size | Content Type |
|------------|--------|-----------|------|--------------|
${this.results.imageMetrics
  .map(
    metric =>
      `| ${metric.path} | ${metric.success ? '✅' : '❌'} | ${metric.loadTime}ms | ${metric.sizeKB}KB | ${metric.contentType || 'N/A'} |`
  )
  .join('\n')}

---
*Report generated by Image Performance Monitor*
`;
  }

  /**
   * Run complete monitoring suite
   */
  async runMonitoring() {
    console.log('🔍 Starting Image Performance Monitoring...');
    console.log(`📊 Monitoring ${this.criticalImages.length} critical images`);
    console.log(`🌐 Base URL: ${this.baseUrl}\n`);

    // Monitor each critical image
    for (const imagePath of this.criticalImages) {
      console.log(`📸 Testing: ${imagePath}`);
      const metric = await this.monitorImageLoading(imagePath);
      this.results.imageMetrics.push(metric);

      if (metric.success) {
        console.log(`  ✅ Loaded in ${metric.loadTime}ms (${metric.sizeKB}KB)`);
      } else {
        console.log(
          `  ❌ Failed: ${metric.error || `HTTP ${metric.statusCode}`}`
        );
      }
    }

    // Assess Core Web Vitals impact
    console.log('\n📈 Assessing Core Web Vitals impact...');
    this.assessCoreWebVitalsImpact();

    // Generate summary
    console.log('📋 Generating performance summary...');
    this.generateSummary();

    // Save results
    const reports = this.saveResults();

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MONITORING RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Overall Status: ${this.results.summary.overallStatus}`);
    console.log(`Success Rate: ${this.results.summary.successRate}%`);
    console.log(`Average Load Time: ${this.results.summary.avgLoadTime}ms`);
    console.log(`Errors: ${this.results.summary.errorCount}`);
    console.log(`Warnings: ${this.results.summary.warningCount}`);

    if (this.results.alerts.length > 0) {
      console.log('\n🚨 ALERTS:');
      this.results.alerts.forEach(alert => {
        console.log(`  ${alert.severity}: ${alert.message}`);
      });
    }

    console.log('\n📄 Reports saved:');
    console.log(`  JSON: ${reports.jsonReport}`);
    console.log(`  Summary: ${reports.summaryReport}`);

    return this.results;
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new ImagePerformanceMonitor();

  monitor
    .runMonitoring()
    .then(results => {
      const exitCode = results.summary.errorCount > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('❌ Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = ImagePerformanceMonitor;
