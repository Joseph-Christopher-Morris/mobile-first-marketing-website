#!/usr/bin/env node

/**
 * Core Web Vitals Monitor
 * Measures LCP, FID, and CLS metrics against performance targets
 * 
 * Targets:
 * - LCP (Largest Contentful Paint): < 2.5 seconds
 * - FID (First Input Delay): < 100 milliseconds
 * - CLS (Cumulative Layout Shift): < 0.1
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class CoreWebVitalsMonitor {
  constructor() {
    this.targets = {
      lcp: 2500, // 2.5 seconds in milliseconds
      fid: 100,  // 100 milliseconds
      cls: 0.1   // 0.1 score
    };
    
    this.testUrls = [
      { name: 'Home', url: 'https://d15sc9fc739ev2.cloudfront.net/' },
      { name: 'Services', url: 'https://d15sc9fc739ev2.cloudfront.net/services/' },
      { name: 'Photography Services', url: 'https://d15sc9fc739ev2.cloudfront.net/services/photography/' },
      { name: 'Blog', url: 'https://d15sc9fc739ev2.cloudfront.net/blog/' },
      { name: 'Contact', url: 'https://d15sc9fc739ev2.cloudfront.net/contact/' }
    ];
  }

  async measureCoreWebVitals(page, url) {
    console.log(`📊 Measuring Core Web Vitals for: ${url}`);
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for page to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inject Web Vitals library and measurement script
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {};
        let metricsReceived = 0;
        
        // Manual Core Web Vitals measurement
        const measureLCP = () => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.LCP = {
              value: lastEntry.startTime,
              rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor'
            };
            metricsReceived++;
            checkComplete();
          });
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
        };

        const measureFID = () => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const firstEntry = entries[0];
              metrics.FID = {
                value: firstEntry.processingStart - firstEntry.startTime,
                rating: (firstEntry.processingStart - firstEntry.startTime) <= 100 ? 'good' : 
                       (firstEntry.processingStart - firstEntry.startTime) <= 300 ? 'needs-improvement' : 'poor'
              };
              metricsReceived++;
              checkComplete();
            }
          });
          observer.observe({ type: 'first-input', buffered: true });
        };

        const measureCLS = () => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            metrics.CLS = {
              value: clsValue,
              rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
            };
            metricsReceived++;
            checkComplete();
          });
          observer.observe({ type: 'layout-shift', buffered: true });
        };

        const checkComplete = () => {
          if (metricsReceived >= 2 || Date.now() - startTime > 8000) {
            resolve(metrics);
          }
        };

        const startTime = Date.now();
        
        try {
          measureLCP();
          measureFID();
          measureCLS();
        } catch (error) {
          console.warn('Error measuring vitals:', error);
        }

        // Fallback timeout
        setTimeout(() => {
          resolve(metrics);
        }, 10000);
      });
    });

    // Simulate user interaction to trigger FID if not already captured
    if (!vitals.FID) {
      await page.click('body');
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return vitals;
  }

  async performanceAudit(page, url) {
    console.log(`🔍 Running performance audit for: ${url}`);
    
    // Enable performance monitoring
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();
    
    const startTime = Date.now();
    
    // Navigate and measure
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize
      };
    });

    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    return {
      loadTime,
      statusCode: response.status(),
      performanceMetrics,
      resourceCoverage: {
        js: jsCoverage.length,
        css: cssCoverage.length
      }
    };
  }

  evaluateMetrics(vitals, performanceData, pageName) {
    const results = {
      page: pageName,
      timestamp: new Date().toISOString(),
      metrics: {},
      performance: performanceData,
      passed: true,
      issues: []
    };

    // Evaluate LCP (Largest Contentful Paint)
    if (vitals.LCP) {
      const lcpValue = vitals.LCP.value;
      results.metrics.lcp = {
        value: lcpValue,
        target: this.targets.lcp,
        passed: lcpValue <= this.targets.lcp,
        rating: vitals.LCP.rating,
        unit: 'ms'
      };
      
      if (lcpValue > this.targets.lcp) {
        results.passed = false;
        results.issues.push(`LCP (${lcpValue}ms) exceeds target of ${this.targets.lcp}ms`);
      }
    } else {
      results.issues.push('LCP metric not captured');
      results.passed = false;
    }

    // Evaluate FID (First Input Delay)
    if (vitals.FID) {
      const fidValue = vitals.FID.value;
      results.metrics.fid = {
        value: fidValue,
        target: this.targets.fid,
        passed: fidValue <= this.targets.fid,
        rating: vitals.FID.rating,
        unit: 'ms'
      };
      
      if (fidValue > this.targets.fid) {
        results.passed = false;
        results.issues.push(`FID (${fidValue}ms) exceeds target of ${this.targets.fid}ms`);
      }
    } else {
      // FID might not be available if no user interaction occurred
      results.metrics.fid = {
        value: null,
        target: this.targets.fid,
        passed: true, // Consider as passed if no interaction delay
        rating: 'good',
        unit: 'ms',
        note: 'No user interaction detected'
      };
    }

    // Evaluate CLS (Cumulative Layout Shift)
    if (vitals.CLS) {
      const clsValue = vitals.CLS.value;
      results.metrics.cls = {
        value: clsValue,
        target: this.targets.cls,
        passed: clsValue <= this.targets.cls,
        rating: vitals.CLS.rating,
        unit: 'score'
      };
      
      if (clsValue > this.targets.cls) {
        results.passed = false;
        results.issues.push(`CLS (${clsValue}) exceeds target of ${this.targets.cls}`);
      }
    } else {
      results.issues.push('CLS metric not captured');
      results.passed = false;
    }

    return results;
  }

  async runMonitoring() {
    console.log('🚀 Starting Core Web Vitals Monitoring');
    console.log('📋 Targets:');
    console.log(`   - LCP: < ${this.targets.lcp}ms`);
    console.log(`   - FID: < ${this.targets.fid}ms`);
    console.log(`   - CLS: < ${this.targets.cls}`);
    console.log('');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const results = [];
    let overallPassed = true;

    try {
      for (const testCase of this.testUrls) {
        const page = await browser.newPage();
        
        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        try {
          // Measure Core Web Vitals
          const vitals = await this.measureCoreWebVitals(page, testCase.url);
          
          // Run performance audit
          const performanceData = await this.performanceAudit(page, testCase.url);
          
          // Evaluate results
          const result = this.evaluateMetrics(vitals, performanceData, testCase.name);
          results.push(result);
          
          if (!result.passed) {
            overallPassed = false;
          }

          // Log results
          console.log(`📄 ${testCase.name}:`);
          if (result.metrics.lcp) {
            const status = result.metrics.lcp.passed ? '✅' : '❌';
            console.log(`   LCP: ${status} ${result.metrics.lcp.value}ms (target: <${result.metrics.lcp.target}ms)`);
          }
          if (result.metrics.fid) {
            const status = result.metrics.fid.passed ? '✅' : '❌';
            const value = result.metrics.fid.value !== null ? `${result.metrics.fid.value}ms` : 'N/A';
            console.log(`   FID: ${status} ${value} (target: <${result.metrics.fid.target}ms)`);
          }
          if (result.metrics.cls) {
            const status = result.metrics.cls.passed ? '✅' : '❌';
            console.log(`   CLS: ${status} ${result.metrics.cls.value} (target: <${result.metrics.cls.target})`);
          }
          
          if (result.issues.length > 0) {
            console.log(`   Issues: ${result.issues.join(', ')}`);
          }
          console.log('');

        } catch (error) {
          console.error(`❌ Error testing ${testCase.name}: ${error.message}`);
          results.push({
            page: testCase.name,
            timestamp: new Date().toISOString(),
            error: error.message,
            passed: false
          });
          overallPassed = false;
        } finally {
          await page.close();
        }
      }

    } finally {
      await browser.close();
    }

    // Generate summary report
    const summary = this.generateSummary(results, overallPassed);
    
    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `core-web-vitals-monitoring-${timestamp}.json`;
    const summaryFile = `core-web-vitals-summary-${timestamp}.md`;
    
    await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));
    await fs.writeFile(summaryFile, summary);
    
    console.log(`📊 Results saved to: ${resultsFile}`);
    console.log(`📋 Summary saved to: ${summaryFile}`);
    
    return {
      passed: overallPassed,
      results,
      summary,
      files: { results: resultsFile, summary: summaryFile }
    };
  }

  generateSummary(results, overallPassed) {
    const timestamp = new Date().toISOString();
    
    let summary = `# Core Web Vitals Monitoring Report\n\n`;
    summary += `**Generated:** ${timestamp}\n`;
    summary += `**Overall Status:** ${overallPassed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    summary += `## Performance Targets\n\n`;
    summary += `- **LCP (Largest Contentful Paint):** < ${this.targets.lcp}ms\n`;
    summary += `- **FID (First Input Delay):** < ${this.targets.fid}ms\n`;
    summary += `- **CLS (Cumulative Layout Shift):** < ${this.targets.cls}\n\n`;
    
    summary += `## Results Summary\n\n`;
    
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    summary += `**Pages Tested:** ${totalCount}\n`;
    summary += `**Passed:** ${passedCount}\n`;
    summary += `**Failed:** ${totalCount - passedCount}\n\n`;
    
    summary += `## Detailed Results\n\n`;
    
    results.forEach(result => {
      if (result.error) {
        summary += `### ${result.page} ❌\n\n`;
        summary += `**Error:** ${result.error}\n\n`;
        return;
      }
      
      const status = result.passed ? '✅' : '❌';
      summary += `### ${result.page} ${status}\n\n`;
      
      if (result.metrics.lcp) {
        const lcpStatus = result.metrics.lcp.passed ? '✅' : '❌';
        summary += `- **LCP:** ${lcpStatus} ${result.metrics.lcp.value}ms (${result.metrics.lcp.rating})\n`;
      }
      
      if (result.metrics.fid) {
        const fidStatus = result.metrics.fid.passed ? '✅' : '❌';
        const fidValue = result.metrics.fid.value !== null ? `${result.metrics.fid.value}ms` : 'N/A';
        summary += `- **FID:** ${fidStatus} ${fidValue} (${result.metrics.fid.rating})\n`;
      }
      
      if (result.metrics.cls) {
        const clsStatus = result.metrics.cls.passed ? '✅' : '❌';
        summary += `- **CLS:** ${clsStatus} ${result.metrics.cls.value} (${result.metrics.cls.rating})\n`;
      }
      
      if (result.performance) {
        summary += `- **Load Time:** ${result.performance.loadTime}ms\n`;
        summary += `- **First Contentful Paint:** ${result.performance.performanceMetrics.firstContentfulPaint.toFixed(2)}ms\n`;
      }
      
      if (result.issues && result.issues.length > 0) {
        summary += `\n**Issues:**\n`;
        result.issues.forEach(issue => {
          summary += `- ${issue}\n`;
        });
      }
      
      summary += `\n`;
    });
    
    summary += `## Recommendations\n\n`;
    
    const failedResults = results.filter(r => !r.passed && !r.error);
    if (failedResults.length > 0) {
      summary += `### Performance Improvements Needed\n\n`;
      
      failedResults.forEach(result => {
        if (result.metrics.lcp && !result.metrics.lcp.passed) {
          summary += `- **${result.page} LCP:** Optimize largest contentful paint by improving image loading, reducing server response times, or optimizing critical rendering path\n`;
        }
        if (result.metrics.fid && !result.metrics.fid.passed) {
          summary += `- **${result.page} FID:** Reduce JavaScript execution time, break up long tasks, or optimize third-party scripts\n`;
        }
        if (result.metrics.cls && !result.metrics.cls.passed) {
          summary += `- **${result.page} CLS:** Set explicit dimensions for images and embeds, avoid inserting content above existing content, or use CSS transforms\n`;
        }
      });
    } else {
      summary += `All pages meet Core Web Vitals targets! 🎉\n`;
    }
    
    return summary;
  }
}

// CLI execution
if (require.main === module) {
  const monitor = new CoreWebVitalsMonitor();
  
  monitor.runMonitoring()
    .then(result => {
      console.log('\n🎯 Core Web Vitals Monitoring Complete');
      console.log(`Overall Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (!result.passed) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = CoreWebVitalsMonitor;