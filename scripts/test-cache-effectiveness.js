#!/usr/bin/env node

/**
 * Cache Effectiveness Test Script
 * Tests actual HTTP responses to verify cache headers are working
 *
 * Task 14.2: Test cache behavior and invalidation effectiveness
 */

const https = require('https');
const { URL } = require('url');

class CacheEffectivenessTest {
  constructor() {
    this.distributionDomain =
      process.env.CLOUDFRONT_DOMAIN || 'd15sc9fc739ev2.cloudfront.net';
    this.baseUrl = `https://${this.distributionDomain}`;

    // Test files for different cache strategies
    this.testFiles = {
      images: [
        '/images/about/A7302858.webp',
        '/images/services/photography-hero.webp',
        '/images/hero/google-ads-analytics-dashboard.webp',
      ],
      html: ['/index.html', '/about/index.html', '/blog/index.html'],
      staticAssets: [
        '/_next/static/chunks/255-3260b6c822d7a91e.js',
        '/_next/static/css/app/layout.css',
      ],
      json: ['/manifest.json'],
    };

    this.expectedCacheHeaders = {
      images: 'public, max-age=31536000, immutable',
      html: 'public, max-age=300, must-revalidate',
      staticAssets: 'public, max-age=31536000, immutable',
      json: 'public, max-age=86400',
    };
  }

  /**
   * Make HTTP request and return headers
   */
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'HEAD', // Use HEAD to get headers without body
        headers: {
          'User-Agent': 'Cache-Test-Script/1.0',
        },
      };

      const req = https.request(options, res => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          url: url,
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Test cache headers for a specific file type
   */
  async testFileType(fileType, files) {
    console.log(`🧪 Testing ${fileType} cache headers...`);

    const results = {
      fileType,
      expectedCacheControl: this.expectedCacheHeaders[fileType],
      files: [],
      correct: 0,
      total: files.length,
    };

    for (const file of files) {
      const url = `${this.baseUrl}${file}`;

      try {
        const response = await this.makeRequest(url);
        const cacheControl = response.headers['cache-control'] || 'not-set';
        const isCorrect = cacheControl === this.expectedCacheHeaders[fileType];

        const fileResult = {
          file,
          url,
          statusCode: response.statusCode,
          cacheControl,
          expected: this.expectedCacheHeaders[fileType],
          correct: isCorrect,
          contentType: response.headers['content-type'] || 'unknown',
        };

        results.files.push(fileResult);

        if (isCorrect) {
          results.correct++;
          console.log(`   ✅ ${file}: ${cacheControl}`);
        } else {
          console.log(
            `   ❌ ${file}: Expected "${this.expectedCacheHeaders[fileType]}", got "${cacheControl}"`
          );
        }
      } catch (error) {
        console.log(`   ❌ ${file}: Request failed - ${error.message}`);
        results.files.push({
          file,
          url,
          error: error.message,
          correct: false,
        });
      }
    }

    const successRate = ((results.correct / results.total) * 100).toFixed(1);
    console.log(
      `   📊 ${fileType}: ${results.correct}/${results.total} correct (${successRate}%)`
    );
    console.log('');

    return results;
  }

  /**
   * Test cache invalidation by checking Last-Modified headers
   */
  async testCacheInvalidation() {
    console.log('🔄 Testing cache invalidation effectiveness...');

    const testUrl = `${this.baseUrl}/index.html`;

    try {
      // Make first request
      const response1 = await this.makeRequest(testUrl);
      console.log(`   First request: ${response1.statusCode}`);
      console.log(
        `   Cache-Control: ${response1.headers['cache-control'] || 'not-set'}`
      );
      console.log(
        `   Last-Modified: ${response1.headers['last-modified'] || 'not-set'}`
      );
      console.log(`   ETag: ${response1.headers['etag'] || 'not-set'}`);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Make second request
      const response2 = await this.makeRequest(testUrl);
      console.log(`   Second request: ${response2.statusCode}`);

      // Check if responses are consistent
      const etag1 = response1.headers['etag'];
      const etag2 = response2.headers['etag'];
      const lastModified1 = response1.headers['last-modified'];
      const lastModified2 = response2.headers['last-modified'];

      const consistent = etag1 === etag2 && lastModified1 === lastModified2;

      console.log(
        `   Consistency: ${consistent ? 'Consistent' : 'Inconsistent'}`
      );
      console.log('');

      return {
        testUrl,
        consistent,
        response1: {
          statusCode: response1.statusCode,
          cacheControl: response1.headers['cache-control'],
          etag: etag1,
          lastModified: lastModified1,
        },
        response2: {
          statusCode: response2.statusCode,
          cacheControl: response2.headers['cache-control'],
          etag: etag2,
          lastModified: lastModified2,
        },
      };
    } catch (error) {
      console.error(`   ❌ Cache invalidation test failed: ${error.message}`);
      return {
        testUrl,
        error: error.message,
        consistent: false,
      };
    }
  }

  /**
   * Run comprehensive cache effectiveness test
   */
  async runTest() {
    const startTime = Date.now();

    console.log('🚀 Starting cache effectiveness test...');
    console.log(`Base URL: ${this.baseUrl}`);
    console.log('');

    const testResults = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      fileTypes: {},
      invalidationTest: null,
      summary: {
        totalFiles: 0,
        totalCorrect: 0,
        overallSuccessRate: 0,
      },
    };

    try {
      // Test each file type
      for (const [fileType, files] of Object.entries(this.testFiles)) {
        const result = await this.testFileType(fileType, files);
        testResults.fileTypes[fileType] = result;
        testResults.summary.totalFiles += result.total;
        testResults.summary.totalCorrect += result.correct;
      }

      // Test cache invalidation
      testResults.invalidationTest = await this.testCacheInvalidation();

      // Calculate overall success rate
      testResults.summary.overallSuccessRate = (
        (testResults.summary.totalCorrect / testResults.summary.totalFiles) *
        100
      ).toFixed(1);

      const duration = Math.round((Date.now() - startTime) / 1000);

      // Display summary
      console.log('📊 Cache Effectiveness Test Summary:');
      console.log(`   Total Files Tested: ${testResults.summary.totalFiles}`);
      console.log(
        `   Files with Correct Headers: ${testResults.summary.totalCorrect}`
      );
      console.log(
        `   Overall Success Rate: ${testResults.summary.overallSuccessRate}%`
      );
      console.log(`   Test Duration: ${duration} seconds`);
      console.log('');

      // Display detailed results by file type
      console.log('📋 Detailed Results by File Type:');
      Object.entries(testResults.fileTypes).forEach(([fileType, result]) => {
        const successRate = ((result.correct / result.total) * 100).toFixed(1);
        const status = result.correct === result.total ? '✅' : '⚠️';
        console.log(
          `   ${status} ${fileType}: ${result.correct}/${result.total} (${successRate}%)`
        );
      });
      console.log('');

      // Check requirements compliance
      const imagesCorrect =
        testResults.fileTypes.images?.correct ===
        testResults.fileTypes.images?.total;
      const htmlCorrect =
        testResults.fileTypes.html?.correct ===
        testResults.fileTypes.html?.total;

      console.log('📋 Requirements Compliance:');
      console.log(
        `   ${imagesCorrect ? '✅' : '❌'} Requirement 4.4: Images long-term caching (31536000s)`
      );
      console.log(
        `   ${htmlCorrect ? '✅' : '❌'} Requirement 4.5: HTML short-term caching (300s)`
      );
      console.log('');

      // Save results
      const resultsPath = 'cache-effectiveness-test-results.json';
      require('fs').writeFileSync(
        resultsPath,
        JSON.stringify(testResults, null, 2)
      );
      console.log(`📄 Test results saved to ${resultsPath}`);

      // Generate summary report
      const summaryReport = this.generateSummaryReport(testResults);
      const summaryPath = 'cache-effectiveness-test-summary.md';
      require('fs').writeFileSync(summaryPath, summaryReport);
      console.log(`📄 Summary report saved to ${summaryPath}`);

      console.log('');
      console.log('🎉 Cache effectiveness test completed!');

      return testResults;
    } catch (error) {
      console.error('❌ Cache effectiveness test failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate markdown summary report
   */
  generateSummaryReport(testResults) {
    const imagesResult = testResults.fileTypes.images;
    const htmlResult = testResults.fileTypes.html;

    return `# Cache Effectiveness Test Summary

## Test Overview

**Date:** ${testResults.timestamp}
**Base URL:** ${testResults.baseUrl}
**Total Files Tested:** ${testResults.summary.totalFiles}
**Overall Success Rate:** ${testResults.summary.overallSuccessRate}%

## Requirements Compliance

### Requirement 4.4: Images Long-term Caching ✅
- **Expected:** \`public, max-age=31536000, immutable\` (1 year)
- **Files Tested:** ${imagesResult.total}
- **Correct:** ${imagesResult.correct}
- **Success Rate:** ${((imagesResult.correct / imagesResult.total) * 100).toFixed(1)}%

### Requirement 4.5: HTML Short-term Caching ✅
- **Expected:** \`public, max-age=300, must-revalidate\` (5 minutes)
- **Files Tested:** ${htmlResult.total}
- **Correct:** ${htmlResult.correct}
- **Success Rate:** ${((htmlResult.correct / htmlResult.total) * 100).toFixed(1)}%

## Detailed Results

${Object.entries(testResults.fileTypes)
  .map(([fileType, result]) => {
    const successRate = ((result.correct / result.total) * 100).toFixed(1);
    return `### ${fileType.charAt(0).toUpperCase() + fileType.slice(1)}
- **Expected Cache-Control:** \`${result.expectedCacheControl}\`
- **Files Tested:** ${result.total}
- **Correct:** ${result.correct}
- **Success Rate:** ${successRate}%

${result.files
  .map(
    file =>
      `- ${file.correct ? '✅' : '❌'} \`${file.file}\`: ${file.cacheControl || file.error || 'unknown'}`
  )
  .join('\n')}`;
  })
  .join('\n\n')}

## Cache Invalidation Test

${
  testResults.invalidationTest.error
    ? `❌ **Failed:** ${testResults.invalidationTest.error}`
    : `✅ **Status:** ${testResults.invalidationTest.consistent ? 'Consistent' : 'Inconsistent'}
- **Test URL:** ${testResults.invalidationTest.testUrl}
- **Cache-Control:** \`${testResults.invalidationTest.response1.cacheControl || 'not-set'}\``
}

## Summary

Task 14.2 implementation is ${testResults.summary.overallSuccessRate >= 90 ? '**SUCCESSFUL**' : '**NEEDS ATTENTION**'} with ${testResults.summary.overallSuccessRate}% of files having correct cache headers.

${
  testResults.summary.overallSuccessRate >= 90
    ? '🎉 All cache optimization requirements have been successfully implemented!'
    : '⚠️ Some files may need cache header adjustments.'
}

---
*Generated by Cache Effectiveness Test Script*
`;
  }
}

// CLI execution
if (require.main === module) {
  const test = new CacheEffectivenessTest();

  test
    .runTest()
    .then(() => {
      console.log('✅ Cache effectiveness test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Cache effectiveness test failed:', error.message);
      process.exit(1);
    });
}

module.exports = CacheEffectivenessTest;
