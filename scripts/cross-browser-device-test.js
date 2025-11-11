#!/usr/bin/env node

/**
 * Cross-Browser and Device Testing Script
 * Tests responsive behavior, image loading, and layout consistency
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

// Simulate different browser user agents
const USER_AGENTS = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  mobile_chrome: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  mobile_safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
};

// Device viewport simulations
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  laptop: { width: 1366, height: 768, name: 'Laptop' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  mobile: { width: 375, height: 667, name: 'Mobile' }
};

const results = {
  browserTests: {},
  deviceTests: {},
  imageTests: {},
  layoutTests: {},
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    warnings: []
  }
};

/**
 * Make request with specific user agent
 */
function makeRequest(url, userAgent) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const options = {
      timeout: 10000,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    const req = https.request(url, options, (res) => {
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
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Test browser compatibility
 */
async function testBrowserCompatibility(pagePath) {
  console.log(`🌐 Testing browser compatibility for ${pagePath}...`);
  
  const browserResults = {};
  const url = `${CLOUDFRONT_URL}${pagePath}`;
  
  for (const [browserName, userAgent] of Object.entries(USER_AGENTS)) {
    try {
      const response = await makeRequest(url, userAgent);
      
      const browserTest = {
        browser: browserName,
        statusCode: response.statusCode,
        loadTime: response.loadTime,
        contentLength: response.contentLength,
        success: response.statusCode === 200,
        hasContent: response.body && response.body.length > 1000,
        contentType: response.headers['content-type'] || 'unknown'
      };

      // Check for browser-specific content
      if (browserTest.hasContent) {
        browserTest.hasModernFeatures = response.body.includes('flex') || response.body.includes('grid');
        browserTest.hasResponsiveDesign = response.body.includes('viewport') && response.body.includes('device-width');
        browserTest.hasCompatibleCSS = !response.body.includes('unsupported') && !response.body.includes('not-supported');
      }

      browserTest.grade = browserTest.success && browserTest.hasContent ? 'PASS' : 'FAIL';
      
      browserResults[browserName] = browserTest;
      results.summary.totalTests++;
      
      if (browserTest.grade === 'PASS') {
        results.summary.passedTests++;
        console.log(`  ✅ ${browserName}: ${response.loadTime}ms`);
      } else {
        results.summary.failedTests++;
        console.log(`  ❌ ${browserName}: Failed (${response.statusCode})`);
        results.summary.warnings.push(`${pagePath} failed on ${browserName}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      browserResults[browserName] = {
        browser: browserName,
        error: error.message,
        grade: 'FAIL'
      };
      results.summary.totalTests++;
      results.summary.failedTests++;
      console.log(`  ❌ ${browserName}: Error - ${error.message}`);
    }
  }
  
  results.browserTests[pagePath] = browserResults;
  return browserResults;
}

/**
 * Test responsive design behavior
 */
function testResponsiveDesign(pagePath, htmlContent) {
  console.log(`📱 Testing responsive design for ${pagePath}...`);
  
  const responsiveTests = {
    hasViewportMeta: /<meta[^>]*viewport[^>]*width=device-width/i.test(htmlContent),
    hasMediaQueries: /@media|breakpoint/i.test(htmlContent),
    hasFlexboxLayout: /display:\s*flex|flex-direction|justify-content/i.test(htmlContent),
    hasGridLayout: /display:\s*grid|grid-template/i.test(htmlContent),
    hasResponsiveImages: /srcset|sizes=|picture/i.test(htmlContent),
    hasResponsiveText: /font-size.*vw|font-size.*rem|responsive.*text/i.test(htmlContent),
    hasTailwindBreakpoints: /sm:|md:|lg:|xl:/i.test(htmlContent),
    hasContainerQueries: /@container|container-type/i.test(htmlContent)
  };

  const passedTests = Object.values(responsiveTests).filter(Boolean).length;
  const totalTests = Object.keys(responsiveTests).length;
  const score = (passedTests / totalTests) * 100;

  const responsiveResult = {
    tests: responsiveTests,
    score,
    grade: score >= 70 ? 'PASS' : 'NEEDS_IMPROVEMENT',
    passedTests,
    totalTests
  };

  results.deviceTests[pagePath] = responsiveResult;
  
  console.log(`  📊 Responsive Score: ${score.toFixed(1)}% (${passedTests}/${totalTests}) - ${responsiveResult.grade}`);
  
  return responsiveResult;
}

/**
 * Test image loading across different contexts
 */
async function testImageLoading(pagePath, htmlContent) {
  console.log(`🖼️  Testing image loading for ${pagePath}...`);
  
  // Extract image URLs from HTML
  const imageRegex = /<img[^>]*src=["']([^"']+)["']/gi;
  const images = [];
  let match;
  
  while ((match = imageRegex.exec(htmlContent)) !== null) {
    const imageSrc = match[1];
    if (imageSrc.startsWith('/')) {
      images.push(`${CLOUDFRONT_URL}${imageSrc}`);
    } else if (imageSrc.startsWith('http')) {
      images.push(imageSrc);
    }
  }

  const imageResults = {
    totalImages: images.length,
    testedImages: 0,
    successfulImages: 0,
    failedImages: 0,
    imageDetails: []
  };

  // Test first 5 images to avoid overwhelming the server
  const imagesToTest = images.slice(0, 5);
  
  for (const imageUrl of imagesToTest) {
    try {
      const response = await makeRequest(imageUrl, USER_AGENTS.chrome);
      imageResults.testedImages++;
      
      const imageTest = {
        url: imageUrl,
        statusCode: response.statusCode,
        contentType: response.headers['content-type'] || 'unknown',
        size: response.contentLength,
        success: response.statusCode === 200 && response.contentLength > 0
      };
      
      if (imageTest.success) {
        imageResults.successfulImages++;
      } else {
        imageResults.failedImages++;
      }
      
      imageResults.imageDetails.push(imageTest);
      
      // Small delay between image requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      imageResults.testedImages++;
      imageResults.failedImages++;
      imageResults.imageDetails.push({
        url: imageUrl,
        error: error.message,
        success: false
      });
    }
  }

  const imageSuccessRate = imageResults.testedImages > 0 ? 
    (imageResults.successfulImages / imageResults.testedImages) * 100 : 100;
  
  imageResults.successRate = imageSuccessRate;
  imageResults.grade = imageSuccessRate >= 90 ? 'PASS' : 'NEEDS_IMPROVEMENT';
  
  results.imageTests[pagePath] = imageResults;
  
  console.log(`  📊 Image Loading: ${imageSuccessRate.toFixed(1)}% (${imageResults.successfulImages}/${imageResults.testedImages}) - ${imageResults.grade}`);
  
  return imageResults;
}

/**
 * Test layout consistency
 */
function testLayoutConsistency(pagePath, htmlContent) {
  console.log(`📐 Testing layout consistency for ${pagePath}...`);
  
  const layoutTests = {
    hasConsistentNavigation: /<nav[^>]*>|navigation|menu/i.test(htmlContent),
    hasProperHeadingStructure: /<h1[^>]*>.*<\/h1>/i.test(htmlContent) && /<h[2-6]/i.test(htmlContent),
    hasFooter: /<footer[^>]*>|<div[^>]*footer/i.test(htmlContent),
    hasMainContent: /<main[^>]*>|<div[^>]*main|role=["']main["']/i.test(htmlContent),
    hasConsistentStyling: /class=["'][^"']*btn[^"']*["']|class=["'][^"']*button[^"']*["']/i.test(htmlContent),
    hasAccessibleForms: !/<input[^>]*>/i.test(htmlContent) || /<label[^>]*for=/i.test(htmlContent),
    hasSkipLinks: /skip.*content|skip.*main/i.test(htmlContent),
    hasLandmarks: /<(nav|main|section|article|aside|header|footer)[^>]*>/i.test(htmlContent)
  };

  const passedLayoutTests = Object.values(layoutTests).filter(Boolean).length;
  const totalLayoutTests = Object.keys(layoutTests).length;
  const layoutScore = (passedLayoutTests / totalLayoutTests) * 100;

  const layoutResult = {
    tests: layoutTests,
    score: layoutScore,
    grade: layoutScore >= 80 ? 'PASS' : 'NEEDS_IMPROVEMENT',
    passedTests: passedLayoutTests,
    totalTests: totalLayoutTests
  };

  results.layoutTests[pagePath] = layoutResult;
  
  console.log(`  📊 Layout Consistency: ${layoutScore.toFixed(1)}% (${passedLayoutTests}/${totalLayoutTests}) - ${layoutResult.grade}`);
  
  return layoutResult;
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  const timestamp = new Date().toISOString();
  
  const reportData = {
    timestamp,
    cloudfront_url: CLOUDFRONT_URL,
    test_results: results,
    summary: {
      total_pages: PAGES_TO_TEST.length,
      total_tests: results.summary.totalTests,
      passed_tests: results.summary.passedTests,
      failed_tests: results.summary.failedTests,
      success_rate: results.summary.totalTests > 0 ? 
        ((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(2) + '%' : '0%',
      warnings: results.summary.warnings.length
    }
  };

  // Save detailed JSON report
  const reportPath = `cross-browser-device-test-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  // Generate summary report
  const summaryLines = [
    '# Cross-Browser & Device Testing Report',
    `Generated: ${timestamp}`,
    `CloudFront URL: ${CLOUDFRONT_URL}`,
    '',
    '## Summary',
    `- Total Pages: ${PAGES_TO_TEST.length}`,
    `- Total Tests: ${results.summary.totalTests}`,
    `- Passed: ${results.summary.passedTests}`,
    `- Failed: ${results.summary.failedTests}`,
    `- Success Rate: ${reportData.summary.success_rate}`,
    `- Warnings: ${results.summary.warnings.length}`,
    ''
  ];

  if (results.summary.warnings.length > 0) {
    summaryLines.push('## Warnings');
    results.summary.warnings.forEach(warning => {
      summaryLines.push(`- ⚠️  ${warning}`);
    });
    summaryLines.push('');
  }

  summaryLines.push('## Browser Compatibility Results');
  Object.entries(results.browserTests).forEach(([page, browsers]) => {
    summaryLines.push(`### ${page}`);
    Object.entries(browsers).forEach(([browser, result]) => {
      const status = result.grade === 'PASS' ? '✅' : '❌';
      summaryLines.push(`- ${status} ${browser}: ${result.grade}`);
    });
    summaryLines.push('');
  });

  const summaryPath = `cross-browser-device-summary-${Date.now()}.md`;
  fs.writeFileSync(summaryPath, summaryLines.join('\n'));

  console.log(`\n📊 Reports generated:`);
  console.log(`- Detailed: ${reportPath}`);
  console.log(`- Summary: ${summaryPath}`);

  return { reportPath, summaryPath, results: reportData };
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Cross-Browser & Device Testing');
  console.log(`Testing: ${CLOUDFRONT_URL}`);
  console.log('='.repeat(70));

  for (const pagePath of PAGES_TO_TEST) {
    console.log(`\n🔍 Testing ${pagePath}:`);
    
    // Test browser compatibility
    const browserResults = await testBrowserCompatibility(pagePath);
    
    // Get HTML content from Chrome for additional tests
    const chromeResult = browserResults.chrome;
    if (chromeResult && chromeResult.success) {
      const url = `${CLOUDFRONT_URL}${pagePath}`;
      try {
        const response = await makeRequest(url, USER_AGENTS.chrome);
        
        // Test responsive design
        testResponsiveDesign(pagePath, response.body);
        
        // Test image loading
        await testImageLoading(pagePath, response.body);
        
        // Test layout consistency
        testLayoutConsistency(pagePath, response.body);
        
      } catch (error) {
        console.log(`⚠️  Could not run additional tests for ${pagePath}: ${error.message}`);
      }
    }
    
    // Delay between pages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 Testing Complete');
  
  const report = generateReport();
  
  // Print final summary
  console.log('\n🎯 Final Results:');
  console.log(`Success Rate: ${report.results.summary.success_rate}`);
  console.log(`Total Tests: ${results.summary.totalTests}`);
  console.log(`Passed: ${results.summary.passedTests}`);
  console.log(`Failed: ${results.summary.failedTests}`);
  
  if (results.summary.warnings.length === 0) {
    console.log('🎉 All cross-browser & device tests completed successfully!');
    return true;
  } else {
    console.log(`⚠️  ${results.summary.warnings.length} issues found`);
    return results.summary.failedTests === 0; // Pass if no critical failures
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };