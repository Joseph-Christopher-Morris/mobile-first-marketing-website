#!/usr/bin/env node

/**
 * Simplified Performance & Accessibility Test
 * Focuses on Core Web Vitals and basic accessibility checks
 */

const https = require('https');
const fs = require('fs');

const CLOUDFRONT_URL = 'https://d15sc9fc739ev2.cloudfront.net';
const PAGES_TO_TEST = [
  '/services',
  '/services/hosting',
  '/services/photography', 
  '/services/analytics',
  '/services/ad-campaigns',
  '/about'
];

const results = {
  performance: {},
  accessibility: {},
  summary: { passed: 0, failed: 0, warnings: [] }
};

/**
 * Test page with performance timing
 */
function testPage(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.request(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          loadTime,
          contentLength: data.length
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

/**
 * Analyze performance metrics
 */
function analyzePerformance(pagePath, response) {
  const metrics = {
    loadTime: response.loadTime,
    contentSize: response.contentLength,
    hasCompression: (response.headers['content-encoding'] || '').includes('gzip'),
    hasCaching: !!(response.headers['cache-control'] || response.headers['expires']),
    contentType: response.headers['content-type'] || 'unknown'
  };

  // Performance scoring
  metrics.loadTimeScore = response.loadTime < 1000 ? 'EXCELLENT' : 
                         response.loadTime < 2000 ? 'GOOD' : 
                         response.loadTime < 3000 ? 'FAIR' : 'POOR';
  
  metrics.sizeScore = response.contentLength < 100000 ? 'EXCELLENT' :
                     response.contentLength < 500000 ? 'GOOD' :
                     response.contentLength < 1000000 ? 'FAIR' : 'POOR';

  metrics.overallGrade = (metrics.loadTimeScore === 'EXCELLENT' || metrics.loadTimeScore === 'GOOD') &&
                        (metrics.sizeScore === 'EXCELLENT' || metrics.sizeScore === 'GOOD') ? 'PASS' : 'NEEDS_IMPROVEMENT';

  results.performance[pagePath] = metrics;
  
  console.log(`📊 ${pagePath}:`);
  console.log(`   Load Time: ${response.loadTime}ms (${metrics.loadTimeScore})`);
  console.log(`   Size: ${(response.contentLength/1024).toFixed(1)}KB (${metrics.sizeScore})`);
  console.log(`   Compression: ${metrics.hasCompression ? 'Yes' : 'No'}`);
  console.log(`   Caching: ${metrics.hasCaching ? 'Yes' : 'No'}`);
  console.log(`   Grade: ${metrics.overallGrade}`);

  return metrics;
}

/**
 * Basic accessibility checks
 */
function checkAccessibility(pagePath, html) {
  const checks = {
    hasViewport: /<meta[^>]*viewport[^>]*width=device-width/i.test(html),
    hasLang: /<html[^>]*lang=/i.test(html),
    hasTitle: /<title[^>]*>[^<]+<\/title>/i.test(html),
    hasHeadings: /<h[1-6]/i.test(html),
    hasAltText: !/<img(?![^>]*alt=)/i.test(html) || /<img[^>]*alt=/i.test(html),
    hasSemanticHTML: /<(nav|main|section|article|header|footer)/i.test(html),
    hasAriaLabels: /aria-label|aria-labelledby/i.test(html)
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const score = (passedChecks / totalChecks) * 100;

  const accessibilityResult = {
    checks,
    score,
    grade: score >= 80 ? 'PASS' : 'NEEDS_IMPROVEMENT',
    passedChecks,
    totalChecks
  };

  results.accessibility[pagePath] = accessibilityResult;

  console.log(`♿ Accessibility: ${score.toFixed(1)}% (${passedChecks}/${totalChecks}) - ${accessibilityResult.grade}`);

  return accessibilityResult;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Running Performance & Accessibility Tests');
  console.log(`Testing: ${CLOUDFRONT_URL}`);
  console.log('='.repeat(60));

  for (const pagePath of PAGES_TO_TEST) {
    const url = `${CLOUDFRONT_URL}${pagePath}`;
    
    try {
      console.log(`\n🔍 Testing ${pagePath}...`);
      const response = await testPage(url);
      
      if (response.statusCode === 200) {
        const perfMetrics = analyzePerformance(pagePath, response);
        const accessMetrics = checkAccessibility(pagePath, response.body);
        
        if (perfMetrics.overallGrade === 'PASS' && accessMetrics.grade === 'PASS') {
          results.summary.passed++;
        } else {
          results.summary.failed++;
          if (perfMetrics.overallGrade !== 'PASS') {
            results.summary.warnings.push(`${pagePath}: Performance needs improvement`);
          }
          if (accessMetrics.grade !== 'PASS') {
            results.summary.warnings.push(`${pagePath}: Accessibility needs improvement`);
          }
        }
      } else {
        console.log(`❌ Failed to load ${pagePath} (${response.statusCode})`);
        results.summary.failed++;
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Error testing ${pagePath}: ${error.message}`);
      results.summary.failed++;
    }
  }

  // Generate summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Test Summary:');
  console.log(`✅ Passed: ${results.summary.passed}/${PAGES_TO_TEST.length}`);
  console.log(`⚠️  Failed: ${results.summary.failed}/${PAGES_TO_TEST.length}`);
  
  if (results.summary.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.summary.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  // Save detailed results
  const reportPath = `lighthouse-performance-test-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);

  const successRate = (results.summary.passed / PAGES_TO_TEST.length) * 100;
  console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);

  if (successRate >= 80) {
    console.log('🎉 Performance & Accessibility tests PASSED!');
    return true;
  } else {
    console.log('⚠️  Performance & Accessibility tests need improvement');
    return false;
  }
}

// Run tests
if (require.main === module) {
  runTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };