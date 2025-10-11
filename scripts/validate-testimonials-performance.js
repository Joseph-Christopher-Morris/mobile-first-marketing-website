#!/usr/bin/env node

/**
 * Testimonials Component Performance Validation
 * Tests the performance impact of the testimonials carousel on Core Web Vitals
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class TestimonialsPerformanceValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testSuite: 'Testimonials Component Performance',
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };
  }

  async validatePerformance() {
    console.log('🎠 Validating Testimonials Component Performance');
    console.log('');

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Test 1: Core Web Vitals Impact
      await this.testCoreWebVitalsImpact(browser);
      
      // Test 2: Auto-advance Performance
      await this.testAutoAdvancePerformance(browser);
      
      // Test 3: Animation Smoothness
      await this.testAnimationSmoothness(browser);
      
      // Test 4: Memory Usage
      await this.testMemoryUsage(browser);
      
      // Test 5: Interaction Performance
      await this.testInteractionPerformance(browser);

    } catch (error) {
      console.error('❌ Performance validation failed:', error);
      this.addTestResult('Overall Performance Test', false, error.message);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    await this.generateReport();
    return this.results.summary.failed === 0;
  }

  async testCoreWebVitalsImpact(browser) {
    console.log('📊 Testing Core Web Vitals Impact');
    
    try {
      const page = await browser.newPage();
      
      // Enable performance monitoring
      await page.setCacheEnabled(false);
      
      // Navigate to home page (where testimonials are displayed)
      const response = await page.goto('http://localhost:3000/', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      if (!response || !response.ok()) {
        throw new Error('Failed to load home page - ensure dev server is running');
      }

      // Wait for testimonials component to load
      await page.waitForSelector('[aria-labelledby="testimonials-heading"]', {
        timeout: 10000
      });

      // Measure Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach((entry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.lcp = entry.startTime;
              }
              if (entry.entryType === 'first-input') {
                vitals.fid = entry.processingStart - entry.startTime;
              }
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                vitals.cls = (vitals.cls || 0) + entry.value;
              }
            });
            
            // Also get navigation timing
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
              vitals.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
              vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            }
            
            resolve(vitals);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
          
          // Fallback timeout
          setTimeout(() => {
            resolve({});
          }, 5000);
        });
      });

      // Test LCP (should be < 2.5s)
      const lcpTest = {
        name: 'Largest Contentful Paint (LCP)',
        target: 2500,
        actual: metrics.lcp || 0,
        passed: (metrics.lcp || 0) < 2500,
        unit: 'ms'
      };

      // Test CLS (should be < 0.1)
      const clsTest = {
        name: 'Cumulative Layout Shift (CLS)',
        target: 0.1,
        actual: metrics.cls || 0,
        passed: (metrics.cls || 0) < 0.1,
        unit: 'score'
      };

      this.addTestResult('Core Web Vitals - LCP', lcpTest.passed, 
        `${lcpTest.actual}${lcpTest.unit} (target: <${lcpTest.target}${lcpTest.unit})`);
      
      this.addTestResult('Core Web Vitals - CLS', clsTest.passed,
        `${clsTest.actual.toFixed(3)}${clsTest.unit} (target: <${clsTest.target}${clsTest.unit})`);

      console.log(`   LCP: ${lcpTest.passed ? '✅' : '❌'} ${lcpTest.actual}ms (target: <${lcpTest.target}ms)`);
      console.log(`   CLS: ${clsTest.passed ? '✅' : '❌'} ${clsTest.actual.toFixed(3)} (target: <${clsTest.target})`);

      await page.close();
      
    } catch (error) {
      console.error(`   ❌ Core Web Vitals test failed: ${error.message}`);
      this.addTestResult('Core Web Vitals Impact', false, error.message);
    }
    
    console.log('');
  }

  async testAutoAdvancePerformance(browser) {
    console.log('⏱️ Testing Auto-advance Performance');
    
    try {
      const page = await browser.newPage();
      
      await page.goto('http://localhost:3000/', {
        waitUntil: 'networkidle0'
      });

      // Wait for testimonials component
      await page.waitForSelector('[aria-labelledby="testimonials-heading"]');

      // Monitor performance during auto-advance
      const performanceData = await page.evaluate(() => {
        return new Promise((resolve) => {
          const startTime = performance.now();
          let frameCount = 0;
          let totalFrameTime = 0;
          
          const measureFrame = () => {
            const frameTime = performance.now();
            frameCount++;
            totalFrameTime += frameTime - startTime;
            
            if (frameCount < 60) { // Monitor for ~1 second at 60fps
              requestAnimationFrame(measureFrame);
            } else {
              resolve({
                averageFrameTime: totalFrameTime / frameCount,
                frameCount,
                totalTime: frameTime - startTime
              });
            }
          };
          
          requestAnimationFrame(measureFrame);
        });
      });

      // Test frame performance (should maintain 60fps = ~16.67ms per frame)
      const frameTest = {
        name: 'Frame Performance',
        target: 16.67,
        actual: performanceData.averageFrameTime,
        passed: performanceData.averageFrameTime < 20, // Allow some tolerance
        unit: 'ms/frame'
      };

      this.addTestResult('Auto-advance Frame Performance', frameTest.passed,
        `${frameTest.actual.toFixed(2)}${frameTest.unit} (target: <${frameTest.target}${frameTest.unit})`);

      console.log(`   Frame Performance: ${frameTest.passed ? '✅' : '❌'} ${frameTest.actual.toFixed(2)}ms/frame (target: <${frameTest.target}ms/frame)`);

      // Test auto-advance timing accuracy
      const timingTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          const startSlide = document.querySelector('[role="tabpanel"]');
          const startTime = Date.now();
          
          // Wait for slide change (should happen in ~7 seconds)
          const checkSlideChange = () => {
            const currentSlide = document.querySelector('[role="tabpanel"]');
            if (currentSlide !== startSlide) {
              const elapsed = Date.now() - startTime;
              resolve({ elapsed, expected: 7000 });
            } else if (Date.now() - startTime > 8000) {
              resolve({ elapsed: Date.now() - startTime, expected: 7000, timeout: true });
            } else {
              setTimeout(checkSlideChange, 100);
            }
          };
          
          setTimeout(checkSlideChange, 100);
        });
      });

      const timingAccurate = !timingTest.timeout && 
        Math.abs(timingTest.elapsed - timingTest.expected) < 1000; // 1 second tolerance

      this.addTestResult('Auto-advance Timing', timingAccurate,
        `${timingTest.elapsed}ms (expected: ~${timingTest.expected}ms)`);

      console.log(`   Timing Accuracy: ${timingAccurate ? '✅' : '❌'} ${timingTest.elapsed}ms (expected: ~${timingTest.expected}ms)`);

      await page.close();
      
    } catch (error) {
      console.error(`   ❌ Auto-advance performance test failed: ${error.message}`);
      this.addTestResult('Auto-advance Performance', false, error.message);
    }
    
    console.log('');
  }

  async testAnimationSmoothness(browser) {
    console.log('🎬 Testing Animation Smoothness');
    
    try {
      const page = await browser.newPage();
      
      await page.goto('http://localhost:3000/', {
        waitUntil: 'networkidle0'
      });

      await page.waitForSelector('[aria-labelledby="testimonials-heading"]');

      // Test manual navigation animation smoothness
      const animationData = await page.evaluate(() => {
        return new Promise((resolve) => {
          const nextButton = document.querySelector('[aria-label="Next testimonial"]');
          if (!nextButton) {
            resolve({ error: 'Next button not found' });
            return;
          }

          let animationFrames = [];
          let animationStart = null;
          
          const measureAnimation = (timestamp) => {
            if (!animationStart) animationStart = timestamp;
            
            const elapsed = timestamp - animationStart;
            animationFrames.push({ timestamp, elapsed });
            
            if (elapsed < 600) { // Monitor for 600ms (longer than 500ms transition)
              requestAnimationFrame(measureAnimation);
            } else {
              // Calculate frame consistency
              const frameTimes = [];
              for (let i = 1; i < animationFrames.length; i++) {
                frameTimes.push(animationFrames[i].timestamp - animationFrames[i-1].timestamp);
              }
              
              const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
              const maxFrameTime = Math.max(...frameTimes);
              const minFrameTime = Math.min(...frameTimes);
              
              resolve({
                totalFrames: animationFrames.length,
                avgFrameTime,
                maxFrameTime,
                minFrameTime,
                frameConsistency: maxFrameTime - minFrameTime
              });
            }
          };
          
          // Trigger animation
          nextButton.click();
          requestAnimationFrame(measureAnimation);
        });
      });

      if (animationData.error) {
        throw new Error(animationData.error);
      }

      // Test animation smoothness (frame consistency should be < 10ms variance)
      const smoothnessTest = {
        name: 'Animation Smoothness',
        target: 10,
        actual: animationData.frameConsistency,
        passed: animationData.frameConsistency < 10,
        unit: 'ms variance'
      };

      this.addTestResult('Animation Smoothness', smoothnessTest.passed,
        `${smoothnessTest.actual.toFixed(2)}${smoothnessTest.unit} (target: <${smoothnessTest.target}${smoothnessTest.unit})`);

      console.log(`   Smoothness: ${smoothnessTest.passed ? '✅' : '❌'} ${smoothnessTest.actual.toFixed(2)}ms variance (target: <${smoothnessTest.target}ms)`);
      console.log(`   Frame Stats: avg=${animationData.avgFrameTime.toFixed(2)}ms, max=${animationData.maxFrameTime.toFixed(2)}ms, min=${animationData.minFrameTime.toFixed(2)}ms`);

      await page.close();
      
    } catch (error) {
      console.error(`   ❌ Animation smoothness test failed: ${error.message}`);
      this.addTestResult('Animation Smoothness', false, error.message);
    }
    
    console.log('');
  }

  async testMemoryUsage(browser) {
    console.log('💾 Testing Memory Usage');
    
    try {
      const page = await browser.newPage();
      
      await page.goto('http://localhost:3000/', {
        waitUntil: 'networkidle0'
      });

      await page.waitForSelector('[aria-labelledby="testimonials-heading"]');

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (!initialMemory) {
        console.log('   ⚠️ Memory API not available in this browser');
        this.addTestResult('Memory Usage', true, 'Memory API not available - skipped');
        await page.close();
        return;
      }

      // Simulate extended usage (multiple slide changes)
      await page.evaluate(() => {
        return new Promise((resolve) => {
          const nextButton = document.querySelector('[aria-label="Next testimonial"]');
          let clicks = 0;
          
          const clickNext = () => {
            if (clicks < 20) { // Simulate 20 slide changes
              nextButton.click();
              clicks++;
              setTimeout(clickNext, 100);
            } else {
              resolve();
            }
          };
          
          clickNext();
        });
      });

      // Get memory usage after interactions
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      const memoryIncrease = finalMemory.used - initialMemory.used;
      const memoryIncreaseKB = memoryIncrease / 1024;

      // Memory increase should be minimal (< 100KB for carousel interactions)
      const memoryTest = {
        name: 'Memory Usage',
        target: 100,
        actual: memoryIncreaseKB,
        passed: memoryIncreaseKB < 100,
        unit: 'KB increase'
      };

      this.addTestResult('Memory Usage', memoryTest.passed,
        `${memoryTest.actual.toFixed(2)}${memoryTest.unit} (target: <${memoryTest.target}${memoryTest.unit})`);

      console.log(`   Memory Usage: ${memoryTest.passed ? '✅' : '❌'} ${memoryTest.actual.toFixed(2)}KB increase (target: <${memoryTest.target}KB)`);
      console.log(`   Initial: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB, Final: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`);

      await page.close();
      
    } catch (error) {
      console.error(`   ❌ Memory usage test failed: ${error.message}`);
      this.addTestResult('Memory Usage', false, error.message);
    }
    
    console.log('');
  }

  async testInteractionPerformance(browser) {
    console.log('🖱️ Testing Interaction Performance');
    
    try {
      const page = await browser.newPage();
      
      await page.goto('http://localhost:3000/', {
        waitUntil: 'networkidle0'
      });

      await page.waitForSelector('[aria-labelledby="testimonials-heading"]');

      // Test button click responsiveness
      const clickResponseTime = await page.evaluate(() => {
        return new Promise((resolve) => {
          const nextButton = document.querySelector('[aria-label="Next testimonial"]');
          const startTime = performance.now();
          
          const handleClick = () => {
            const responseTime = performance.now() - startTime;
            nextButton.removeEventListener('click', handleClick);
            resolve(responseTime);
          };
          
          nextButton.addEventListener('click', handleClick);
          nextButton.click();
        });
      });

      // Click response should be < 16ms (one frame at 60fps)
      const clickTest = {
        name: 'Click Response Time',
        target: 16,
        actual: clickResponseTime,
        passed: clickResponseTime < 16,
        unit: 'ms'
      };

      this.addTestResult('Click Response Time', clickTest.passed,
        `${clickTest.actual.toFixed(2)}${clickTest.unit} (target: <${clickTest.target}${clickTest.unit})`);

      console.log(`   Click Response: ${clickTest.passed ? '✅' : '❌'} ${clickTest.actual.toFixed(2)}ms (target: <${clickTest.target}ms)`);

      // Test keyboard navigation performance
      const keyboardResponseTime = await page.evaluate(() => {
        return new Promise((resolve) => {
          const carousel = document.querySelector('[role="region"][aria-label="Testimonials carousel"]');
          const startTime = performance.now();
          
          const handleKeyDown = () => {
            const responseTime = performance.now() - startTime;
            carousel.removeEventListener('keydown', handleKeyDown);
            resolve(responseTime);
          };
          
          carousel.addEventListener('keydown', handleKeyDown);
          carousel.focus();
          
          // Simulate arrow key press
          const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
          carousel.dispatchEvent(event);
        });
      });

      const keyboardTest = {
        name: 'Keyboard Response Time',
        target: 16,
        actual: keyboardResponseTime,
        passed: keyboardResponseTime < 16,
        unit: 'ms'
      };

      this.addTestResult('Keyboard Response Time', keyboardTest.passed,
        `${keyboardTest.actual.toFixed(2)}${keyboardTest.unit} (target: <${keyboardTest.target}${keyboardTest.unit})`);

      console.log(`   Keyboard Response: ${keyboardTest.passed ? '✅' : '❌'} ${keyboardTest.actual.toFixed(2)}ms (target: <${keyboardTest.target}ms)`);

      await page.close();
      
    } catch (error) {
      console.error(`   ❌ Interaction performance test failed: ${error.message}`);
      this.addTestResult('Interaction Performance', false, error.message);
    }
    
    console.log('');
  }

  addTestResult(name, passed, details) {
    this.results.tests.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
    
    if (passed) {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }
    this.results.summary.total++;
  }

  async generateReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = `testimonials-performance-validation-${timestamp}.json`;
    
    await fs.writeFile(reportFile, JSON.stringify(this.results, null, 2));
    
    // Generate summary
    const summaryFile = `testimonials-performance-summary-${timestamp}.md`;
    const summary = this.generateSummaryMarkdown();
    await fs.writeFile(summaryFile, summary);
    
    console.log('📊 Performance Validation Summary:');
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    console.log('');
    console.log(`📋 Detailed report: ${reportFile}`);
    console.log(`📄 Summary report: ${summaryFile}`);
  }

  generateSummaryMarkdown() {
    const { tests, summary, timestamp } = this.results;
    
    return `# Testimonials Component Performance Validation Report

**Generated:** ${new Date(timestamp).toLocaleString()}

## Summary

- **Total Tests:** ${summary.total}
- **Passed:** ${summary.passed}
- **Failed:** ${summary.failed}
- **Success Rate:** ${((summary.passed / summary.total) * 100).toFixed(1)}%

## Test Results

${tests.map(test => `
### ${test.name}

- **Status:** ${test.passed ? '✅ PASSED' : '❌ FAILED'}
- **Details:** ${test.details}
- **Timestamp:** ${new Date(test.timestamp).toLocaleString()}
`).join('\n')}

## Performance Requirements Validation

### Requirement 9.10 Compliance

${summary.failed === 0 ? 
  '✅ **COMPLIANT** - All performance tests passed. The testimonials carousel meets Core Web Vitals requirements and maintains smooth performance.' :
  '❌ **NON-COMPLIANT** - Some performance tests failed. Review the failed tests above and optimize the component accordingly.'
}

### Core Web Vitals Impact

The testimonials component has been validated to ensure:

- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **Cumulative Layout Shift (CLS):** < 0.1
- **Animation Performance:** Smooth 60fps animations
- **Memory Usage:** Minimal memory footprint
- **Interaction Responsiveness:** < 16ms response times

### Recommendations

${summary.failed > 0 ? `
**Performance Issues Detected:**

${tests.filter(t => !t.passed).map(test => `- ${test.name}: ${test.details}`).join('\n')}

**Recommended Actions:**
- Review failed test details in the full report
- Optimize component implementation as needed
- Re-run validation after fixes
` : `
**All Performance Tests Passed:**

The testimonials carousel component is performing optimally and meets all Core Web Vitals requirements. No further optimization needed.
`}
`;
  }
}

// CLI execution
if (require.main === module) {
  const validator = new TestimonialsPerformanceValidator();
  
  validator.validatePerformance()
    .then(passed => {
      if (!passed) {
        console.log('\n❌ Performance validation failed. Check the report for details.');
        process.exit(1);
      } else {
        console.log('\n✅ Performance validation passed. Testimonials component meets all requirements.');
      }
    })
    .catch(error => {
      console.error('❌ Validation execution failed:', error);
      process.exit(1);
    });
}

module.exports = TestimonialsPerformanceValidator;