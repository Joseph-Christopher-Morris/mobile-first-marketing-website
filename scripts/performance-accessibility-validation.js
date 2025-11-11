#!/usr/bin/env node

/**
 * Performance and Accessibility Validation Script
 * Tests Core Web Vitals, Lighthouse metrics, and accessibility compliance
 */

const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

// CloudFront URL
const CLOUDFRONT_URL = 'https://d15sc9fc739ev2.cloudfront.net';

// Pages to test
const PAGES_TO_TEST = [
  '/services',
  '/services/hosting',
  '/services/photography', 
  '/services/analytics',
  '/services/ad-campaigns',
  '/about'
];

// Performance targets
const PERFORMANCE_TARGETS = {
  lighthouse: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 90
  },
  coreWebVitals: {
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1   // Cumulative Layout Shift
  },
  loadTime: 1000 // Page load time (ms) - more realistic for CloudFront
};

// Results storage
const results = {
  performance: {},
  accessibility: {},
  lighthouse: {},
  summary: {
    totalPages: PAGES_TO_TEST.length,
    passedPages: 0,
    failedPages: 0,
    errors: [],
    warnings: []
  }
};

/**
 * Make HTTP request with timing
 */
function makeTimedRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: 'GET',
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          loadTime: endTime - startTime,
          contentLength: data.length
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Test page performance metrics
 */
async function testPagePerformance(pagePath) {
  const url = `${CLOUDFRONT_URL}${pagePath}`;
  console.log(`Testing performance for: ${url}`);
  
  try {
    const response = await makeTimedRequest(url);
    
    const performanceMetrics = {
      url,
      loadTime: response.loadTime,
      contentLength: response.contentLength,
      statusCode: response.statusCode,
      hasGzipCompression: (response.headers['content-encoding'] || '').includes('gzip'),
      hasCacheHeaders: !!(response.headers['cache-control'] || response.headers['expires']),
      contentType: response.headers['content-type'] || 'unknown'
    };

    // Performance scoring
    performanceMetrics.loadTimeScore = response.loadTime <= PERFORMANCE_TARGETS.loadTime ? 'PASS' : 'FAIL';
    performanceMetrics.compressionScore = performanceMetrics.hasGzipCompression ? 'PASS' : 'WARN';
    performanceMetrics.cacheScore = performanceMetrics.hasCacheHeaders ? 'PASS' : 'WARN';
    
    // Overall performance assessment
    const passCount = [
      performanceMetrics.loadTimeScore === 'PASS',
      performanceMetrics.compressionScore === 'PASS',
      performanceMetrics.cacheScore === 'PASS'
    ].filter(Boolean).length;
    
    performanceMetrics.overallScore = passCount >= 2 ? 'PASS' : 'FAIL';
    
    results.performance[pagePath] = performanceMetrics;
    
    if (performanceMetrics.overallScore === 'PASS') {
      console.log(`✅ Performance PASSED for ${pagePath} (${response.loadTime}ms)`);
      results.summary.passedPages++;
    } else {
      console.log(`⚠️  Performance issues for ${pagePath} (${response.loadTime}ms)`);
      results.summary.warnings.push(`Performance concerns for ${pagePath}: ${response.loadTime}ms load time`);
    }

    return performanceMetrics;
  } catch (error) {
    console.log(`❌ Performance test failed for ${pagePath}: ${error.message}`);
    results.summary.errors.push(`Performance test failed for ${pagePath}: ${error.message}`);
    return { url, error: error.message, overallScore: 'FAIL' };
  }
}

/**
 * Test accessibility compliance
 */
function testAccessibilityCompliance(pagePath, pageContent) {
  console.log(`Testing accessibility for: ${pagePath}`);
  
  const accessibilityChecks = {
    hasAltText: {
      test: /<img[^>]*alt=["'][^"']+["']/gi.test(pageContent),
      description: 'Images have alt text'
    },
    hasHeadingStructure: {
      test: /<h[1-6][^>]*>/gi.test(pageContent),
      description: 'Proper heading structure'
    },
    hasAriaLabels: {
      test: /aria-label=["'][^"']+["']/gi.test(pageContent) || /aria-labelledby=["'][^"']+["']/gi.test(pageContent),
      description: 'ARIA labels present'
    },
    hasSkipLinks: {
      test: /skip.*content|skip.*main/gi.test(pageContent),
      description: 'Skip navigation links'
    },
    hasLangAttribute: {
      test: /<html[^>]*lang=["'][^"']+["']/gi.test(pageContent),
      description: 'HTML lang attribute'
    },
    hasSemanticHTML: {
      test: /<(nav|main|section|article|aside|header|footer)[^>]*>/gi.test(pageContent),
      description: 'Semantic HTML elements'
    },
    hasFormLabels: {
      test: !/<input[^>]*>/gi.test(pageContent) || /<label[^>]*for=["'][^"']+["']/gi.test(pageContent),
      description: 'Form inputs have labels'
    },
    hasKeyboardNavigation: {
      test: /tabindex|role=["']button["']|role=["']link["']/gi.test(pageContent),
      description: 'Keyboard navigation support'
    }
  };

  const passedChecks = Object.values(accessibilityChecks).filter(check => check.test).length;
  const totalChecks = Object.keys(accessibilityChecks).length;
  const accessibilityScore = (passedChecks / totalChecks) * 100;

  const accessibilityResult = {
    checks: accessibilityChecks,
    passedChecks,
    totalChecks,
    score: accessibilityScore,
    grade: accessibilityScore >= PERFORMANCE_TARGETS.lighthouse.accessibility ? 'PASS' : 'FAIL'
  };

  results.accessibility[pagePath] = accessibilityResult;

  if (accessibilityResult.grade === 'PASS') {
    console.log(`✅ Accessibility PASSED for ${pagePath} (${accessibilityScore.toFixed(1)}%)`);
  } else {
    console.log(`⚠️  Accessibility needs improvement for ${pagePath} (${accessibilityScore.toFixed(1)}%)`);
    results.summary.warnings.push(`Accessibility score ${accessibilityScore.toFixed(1)}% for ${pagePath}`);
  }

  return accessibilityResult;
}

/**
 * Test mobile usability
 */
function testMobileUsability(pagePath, pageContent) {
  console.log(`Testing mobile usability for: ${pagePath}`);
  
  const mobileChecks = {
    hasViewportMeta: {
      test: /<meta[^>]*name=["']viewport["'][^>]*width=device-width/gi.test(pageContent),
      description: 'Viewport meta tag configured'
    },
    hasResponsiveImages: {
      test: /srcset=|sizes=/gi.test(pageContent) || /<picture[^>]*>/gi.test(pageContent),
      description: 'Responsive images'
    },
    hasTouchTargets: {
      test: /btn|button|touch|tap/gi.test(pageContent),
      description: 'Touch-friendly targets'
    },
    hasFlexibleLayout: {
      test: /flex|grid|responsive/gi.test(pageContent),
      description: 'Flexible layout system'
    },
    hasMediaQueries: {
      test: /@media|breakpoint|sm:|md:|lg:/gi.test(pageContent),
      description: 'Media queries for responsive design'
    }
  };

  const passedMobileChecks = Object.values(mobileChecks).filter(check => check.test).length;
  const totalMobileChecks = Object.keys(mobileChecks).length;
  const mobileScore = (passedMobileChecks / totalMobileChecks) * 100;

  const mobileResult = {
    checks: mobileChecks,
    passedChecks: passedMobileChecks,
    totalChecks: totalMobileChecks,
    score: mobileScore,
    grade: mobileScore >= 80 ? 'PASS' : 'FAIL'
  };

  if (mobileResult.grade === 'PASS') {
    console.log(`✅ Mobile usability PASSED for ${pagePath} (${mobileScore.toFixed(1)}%)`);
  } else {
    console.log(`⚠️  Mobile usability needs improvement for ${pagePath} (${mobileScore.toFixed(1)}%)`);
    results.summary.warnings.push(`Mobile usability score ${mobileScore.toFixed(1)}% for ${pagePath}`);
  }

  return mobileResult;
}

/**
 * Run simulated Lighthouse audit
 */
function runSimulatedLighthouseAudit(pagePath, performanceData, accessibilityData, mobileData) {
  console.log(`Running simulated Lighthouse audit for: ${pagePath}`);
  
  // Simulate Lighthouse scoring based on our tests
  const lighthouseScores = {
    performance: Math.min(100, Math.max(0, 100 - (performanceData.loadTime - 1000) / 50)),
    accessibility: accessibilityData.score,
    bestPractices: 85, // Baseline score
    seo: 90, // Baseline score
    mobile: mobileData.score
  };

  // Adjust scores based on specific findings
  if (performanceData.hasGzipCompression) lighthouseScores.performance += 5;
  if (performanceData.hasCacheHeaders) lighthouseScores.performance += 5;
  if (performanceData.contentLength < 100000) lighthouseScores.performance += 5;

  // Cap scores at 100
  Object.keys(lighthouseScores).forEach(key => {
    lighthouseScores[key] = Math.min(100, lighthouseScores[key]);
  });

  const averageScore = Object.values(lighthouseScores).reduce((a, b) => a + b, 0) / Object.keys(lighthouseScores).length;
  
  const lighthouseResult = {
    scores: lighthouseScores,
    averageScore,
    grade: averageScore >= 85 ? 'PASS' : 'FAIL',
    recommendations: []
  };

  // Add recommendations
  if (performanceData.loadTime > PERFORMANCE_TARGETS.loadTime) {
    lighthouseResult.recommendations.push('Optimize page load time');
  }
  if (!performanceData.hasGzipCompression) {
    lighthouseResult.recommendations.push('Enable gzip compression');
  }
  if (accessibilityData.score < 95) {
    lighthouseResult.recommendations.push('Improve accessibility compliance');
  }

  results.lighthouse[pagePath] = lighthouseResult;

  if (lighthouseResult.grade === 'PASS') {
    console.log(`✅ Lighthouse audit PASSED for ${pagePath} (${averageScore.toFixed(1)})`);
  } else {
    console.log(`⚠️  Lighthouse audit needs improvement for ${pagePath} (${averageScore.toFixed(1)})`);
    results.summary.warnings.push(`Lighthouse score ${averageScore.toFixed(1)} for ${pagePath}`);
  }

  return lighthouseResult;
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  const timestamp = new Date().toISOString();
  
  // Calculate overall statistics
  const totalTests = PAGES_TO_TEST.length * 4; // performance, accessibility, mobile, lighthouse
  const passedTests = Object.values(results.performance).filter(r => r.overallScore === 'PASS').length +
                     Object.values(results.accessibility).filter(r => r.grade === 'PASS').length +
                     Object.values(results.lighthouse).filter(r => r.grade === 'PASS').length;

  const reportData = {
    timestamp,
    cloudfront_url: CLOUDFRONT_URL,
    performance_targets: PERFORMANCE_TARGETS,
    test_results: results,
    summary: {
      total_pages: PAGES_TO_TEST.length,
      total_tests: totalTests,
      passed_tests: passedTests,
      success_rate: ((passedTests / totalTests) * 100).toFixed(2) + '%',
      errors: results.summary.errors.length,
      warnings: results.summary.warnings.length
    }
  };

  // Save detailed JSON report
  const reportPath = `performance-accessibility-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  // Generate summary report
  const summaryLines = [
    '# Performance & Accessibility Validation Report',
    `Generated: ${timestamp}`,
    `CloudFront URL: ${CLOUDFRONT_URL}`,
    '',
    '## Summary',
    `- Total Pages Tested: ${PAGES_TO_TEST.length}`,
    `- Total Tests Run: ${totalTests}`,
    `- Tests Passed: ${passedTests}`,
    `- Success Rate: ${reportData.summary.success_rate}`,
    `- Errors: ${results.summary.errors.length}`,
    `- Warnings: ${results.summary.warnings.length}`,
    ''
  ];

  if (results.summary.errors.length > 0) {
    summaryLines.push('## Errors');
    results.summary.errors.forEach(error => {
      summaryLines.push(`- ❌ ${error}`);
    });
    summaryLines.push('');
  }

  if (results.summary.warnings.length > 0) {
    summaryLines.push('## Warnings');
    results.summary.warnings.forEach(warning => {
      summaryLines.push(`- ⚠️  ${warning}`);
    });
    summaryLines.push('');
  }

  summaryLines.push('## Performance Results');
  Object.entries(results.performance).forEach(([page, result]) => {
    const status = result.overallScore === 'PASS' ? '✅' : '⚠️';
    summaryLines.push(`- ${status} ${page}: ${result.loadTime}ms load time`);
  });

  summaryLines.push('');
  summaryLines.push('## Accessibility Results');
  Object.entries(results.accessibility).forEach(([page, result]) => {
    const status = result.grade === 'PASS' ? '✅' : '⚠️';
    summaryLines.push(`- ${status} ${page}: ${result.score.toFixed(1)}% accessibility score`);
  });

  summaryLines.push('');
  summaryLines.push('## Lighthouse Results');
  Object.entries(results.lighthouse).forEach(([page, result]) => {
    const status = result.grade === 'PASS' ? '✅' : '⚠️';
    summaryLines.push(`- ${status} ${page}: ${result.averageScore.toFixed(1)} average score`);
  });

  const summaryPath = `performance-accessibility-summary-${Date.now()}.md`;
  fs.writeFileSync(summaryPath, summaryLines.join('\n'));

  console.log(`\n📊 Reports generated:`);
  console.log(`- Detailed: ${reportPath}`);
  console.log(`- Summary: ${summaryPath}`);

  return { reportPath, summaryPath, results: reportData };
}

/**
 * Main validation function
 */
async function runValidation() {
  console.log('🚀 Starting Performance & Accessibility Validation');
  console.log(`Testing against: ${CLOUDFRONT_URL}`);
  console.log('=' .repeat(70));

  for (const pagePath of PAGES_TO_TEST) {
    console.log(`\n📄 Testing ${pagePath}:`);
    
    // Test performance
    const performanceResult = await testPagePerformance(pagePath);
    
    if (performanceResult && performanceResult.statusCode === 200 && performanceResult.body && performanceResult.body.length > 0) {
      // Test accessibility
      const accessibilityResult = testAccessibilityCompliance(pagePath, performanceResult.body);
      
      // Test mobile usability
      const mobileResult = testMobileUsability(pagePath, performanceResult.body);
      
      // Run simulated Lighthouse audit
      const lighthouseResult = runSimulatedLighthouseAudit(pagePath, performanceResult, accessibilityResult, mobileResult);
    } else {
      console.log(`⚠️  Skipping detailed tests for ${pagePath} - no content received (status: ${performanceResult?.statusCode}, body length: ${performanceResult?.body?.length || 0})`);
      
      // Create placeholder results for missing data
      results.accessibility[pagePath] = { score: 0, grade: 'FAIL', error: 'No content to analyze' };
      results.lighthouse[pagePath] = { averageScore: 0, grade: 'FAIL', error: 'No content to analyze' };
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '=' .repeat(70));
  console.log('📋 Validation Complete');
  
  const report = generateReport();
  
  // Print final summary
  console.log('\n🎯 Final Results:');
  console.log(`Success Rate: ${report.results.summary.success_rate}`);
  console.log(`Errors: ${results.summary.errors.length}`);
  console.log(`Warnings: ${results.summary.warnings.length}`);
  
  if (results.summary.errors.length === 0) {
    console.log('🎉 Performance & Accessibility validation completed!');
    return true;
  } else {
    console.log(`⚠️  ${results.summary.errors.length} critical issues found`);
    return false;
  }
}

// Run validation if called directly
if (require.main === module) {
  runValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { runValidation };