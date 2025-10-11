#!/usr/bin/env node

/**
 * Post-Deployment Image Accessibility Validation
 *
 * This script validates that images are accessible via CloudFront CDN endpoints
 * and generates comprehensive validation reports for debugging image loading issues.
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  cloudfrontDomain: 'd15sc9fc739ev2.cloudfront.net',
  testImages: [
    // The specific failing blog image
    '/images/hero/paid-ads-analytics-screenshot.webp',
    // Additional test images
    '/images/services/analytics-hero.webp',
    '/images/hero/mobile-marketing-hero.webp',
    '/images/services/flyer-design-hero.webp',
    '/images/services/stock-photography-hero.webp',
  ],
  timeout: 10000,
  maxRetries: 3,
  outputDir: 'validation-reports',
};

class ImageAccessibilityValidator {
  constructor() {
    this.results = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      const timeout = options.timeout || CONFIG.timeout;

      const req = protocol.get(
        url,
        {
          timeout: timeout,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        },
        res => {
          let data = '';

          res.on('data', chunk => {
            data += chunk;
          });

          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data,
              responseTime: Date.now() - startTime,
            });
          });
        }
      );

      const startTime = Date.now();

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', error => {
        reject(error);
      });

      req.setTimeout(timeout);
    });
  }

  /**
   * Validate a single image URL
   */
  async validateImage(imagePath, retryCount = 0) {
    const url = `https://${CONFIG.cloudfrontDomain}${imagePath}`;
    const testResult = {
      imagePath,
      url,
      timestamp: new Date().toISOString(),
      attempt: retryCount + 1,
      success: false,
      statusCode: null,
      responseTime: null,
      contentType: null,
      contentLength: null,
      cacheStatus: null,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      console.log(`Testing image: ${imagePath} (attempt ${retryCount + 1})`);

      const response = await this.makeRequest(url);

      testResult.statusCode = response.statusCode;
      testResult.responseTime = response.responseTime;
      testResult.contentType = response.headers['content-type'];
      testResult.contentLength = response.headers['content-length'];
      testResult.cacheStatus =
        response.headers['x-cache'] || response.headers['x-amz-cf-pop'];

      // Store all relevant headers
      testResult.details.headers = {
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length'],
        'cache-control': response.headers['cache-control'],
        expires: response.headers['expires'],
        etag: response.headers['etag'],
        'last-modified': response.headers['last-modified'],
        'x-cache': response.headers['x-cache'],
        'x-amz-cf-pop': response.headers['x-amz-cf-pop'],
        'x-amz-cf-id': response.headers['x-amz-cf-id'],
      };

      // Validate response
      if (response.statusCode === 200) {
        testResult.success = true;

        // Validate content type
        if (!response.headers['content-type']) {
          testResult.warnings.push('Missing Content-Type header');
        } else if (!response.headers['content-type'].startsWith('image/')) {
          testResult.errors.push(
            `Invalid Content-Type: ${response.headers['content-type']}`
          );
          testResult.success = false;
        }

        // Validate content length
        if (!response.headers['content-length']) {
          testResult.warnings.push('Missing Content-Length header');
        } else {
          const size = parseInt(response.headers['content-length']);
          if (size < 100) {
            testResult.warnings.push(
              `Suspiciously small file size: ${size} bytes`
            );
          }
          testResult.details.fileSizeBytes = size;
          testResult.details.fileSizeKB = Math.round((size / 1024) * 100) / 100;
        }

        // Check cache headers
        if (response.headers['x-cache']) {
          testResult.details.cacheHit =
            response.headers['x-cache'].includes('Hit');
        }
      } else if (response.statusCode === 404) {
        testResult.errors.push('Image not found (404)');
      } else if (response.statusCode === 403) {
        testResult.errors.push(
          'Access denied (403) - Check S3 permissions and OAC configuration'
        );
      } else if (response.statusCode >= 500) {
        testResult.errors.push(`Server error (${response.statusCode})`);
      } else {
        testResult.errors.push(
          `Unexpected status code: ${response.statusCode}`
        );
      }
    } catch (error) {
      testResult.errors.push(`Request failed: ${error.message}`);

      // Retry logic for network errors
      if (
        retryCount < CONFIG.maxRetries - 1 &&
        (error.message.includes('timeout') ||
          error.message.includes('ECONNRESET'))
      ) {
        console.log(
          `  Retrying in 2 seconds... (${retryCount + 1}/${CONFIG.maxRetries})`
        );
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.validateImage(imagePath, retryCount + 1);
      }
    }

    return testResult;
  }

  /**
   * Test direct S3 access (should fail with proper OAC setup)
   */
  async testDirectS3Access(imagePath) {
    const s3Url = `https://mobile-marketing-site-prod-1759705011281-tyzuo9.s3.amazonaws.com${imagePath}`;

    try {
      const response = await this.makeRequest(s3Url);
      return {
        url: s3Url,
        statusCode: response.statusCode,
        accessible: response.statusCode === 200,
        warning:
          response.statusCode === 200
            ? 'S3 bucket is publicly accessible - security risk!'
            : null,
      };
    } catch (error) {
      return {
        url: s3Url,
        statusCode: null,
        accessible: false,
        error: error.message,
      };
    }
  }

  /**
   * Run comprehensive validation
   */
  async runValidation() {
    console.log('🔍 Starting Post-Deployment Image Accessibility Validation');
    console.log(`📅 Timestamp: ${this.timestamp}`);
    console.log(`🌐 CloudFront Domain: ${CONFIG.cloudfrontDomain}`);
    console.log(`📋 Testing ${CONFIG.testImages.length} images\n`);

    // Ensure output directory exists
    try {
      await fs.mkdir(CONFIG.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error.message);
    }

    const summary = {
      totalImages: CONFIG.testImages.length,
      successful: 0,
      failed: 0,
      warnings: 0,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
    };

    // Test each image
    for (const imagePath of CONFIG.testImages) {
      const result = await this.validateImage(imagePath);
      this.results.push(result);

      if (result.success) {
        summary.successful++;
        console.log(`  ✅ ${imagePath} - OK (${result.responseTime}ms)`);
      } else {
        summary.failed++;
        console.log(`  ❌ ${imagePath} - FAILED`);
        result.errors.forEach(error => console.log(`     Error: ${error}`));
      }

      if (result.warnings.length > 0) {
        summary.warnings += result.warnings.length;
        result.warnings.forEach(warning =>
          console.log(`     Warning: ${warning}`)
        );
      }

      // Test direct S3 access for security validation
      if (imagePath === CONFIG.testImages[0]) {
        console.log(`  🔒 Testing direct S3 access for security validation...`);
        const s3Test = await this.testDirectS3Access(imagePath);
        result.s3DirectAccess = s3Test;

        if (s3Test.accessible) {
          console.log(`     ⚠️  WARNING: ${s3Test.warning}`);
        } else {
          console.log(`     ✅ S3 direct access properly blocked`);
        }
      }

      console.log('');
    }

    summary.endTime = new Date().toISOString();
    summary.duration = Date.now() - new Date(summary.startTime).getTime();

    // Generate reports
    await this.generateReports(summary);

    // Print summary
    this.printSummary(summary);

    return summary;
  }

  /**
   * Generate comprehensive validation reports
   */
  async generateReports(summary) {
    const reportData = {
      metadata: {
        timestamp: this.timestamp,
        cloudfrontDomain: CONFIG.cloudfrontDomain,
        testConfiguration: CONFIG,
        summary: summary,
      },
      results: this.results,
    };

    // JSON Report
    const jsonReport = path.join(
      CONFIG.outputDir,
      `image-accessibility-validation-${this.timestamp}.json`
    );
    await fs.writeFile(jsonReport, JSON.stringify(reportData, null, 2));
    console.log(`📄 JSON report saved: ${jsonReport}`);

    // Markdown Report
    const markdownReport = await this.generateMarkdownReport(reportData);
    const mdReport = path.join(
      CONFIG.outputDir,
      `image-accessibility-validation-${this.timestamp}.md`
    );
    await fs.writeFile(mdReport, markdownReport);
    console.log(`📄 Markdown report saved: ${mdReport}`);

    // HTML Report
    const htmlReport = await this.generateHtmlReport(reportData);
    const htmlReportPath = path.join(
      CONFIG.outputDir,
      `image-accessibility-validation-${this.timestamp}.html`
    );
    await fs.writeFile(htmlReportPath, htmlReport);
    console.log(`📄 HTML report saved: ${htmlReportPath}`);
  }

  /**
   * Generate Markdown report
   */
  async generateMarkdownReport(data) {
    const { metadata, results } = data;

    let markdown = `# Image Accessibility Validation Report

## Summary

- **Timestamp**: ${metadata.timestamp}
- **CloudFront Domain**: ${metadata.cloudfrontDomain}
- **Total Images Tested**: ${metadata.summary.totalImages}
- **Successful**: ${metadata.summary.successful}
- **Failed**: ${metadata.summary.failed}
- **Warnings**: ${metadata.summary.warnings}
- **Duration**: ${Math.round(metadata.summary.duration / 1000)}s

## Test Results

`;

    results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      markdown += `### ${index + 1}. ${result.imagePath} ${status}

- **URL**: ${result.url}
- **Status Code**: ${result.statusCode || 'N/A'}
- **Response Time**: ${result.responseTime || 'N/A'}ms
- **Content Type**: ${result.contentType || 'N/A'}
- **Content Length**: ${result.contentLength || 'N/A'} bytes
- **Cache Status**: ${result.cacheStatus || 'N/A'}

`;

      if (result.errors.length > 0) {
        markdown += `**Errors:**\n`;
        result.errors.forEach(error => {
          markdown += `- ${error}\n`;
        });
        markdown += '\n';
      }

      if (result.warnings.length > 0) {
        markdown += `**Warnings:**\n`;
        result.warnings.forEach(warning => {
          markdown += `- ${warning}\n`;
        });
        markdown += '\n';
      }

      if (result.s3DirectAccess) {
        markdown += `**S3 Direct Access Test:**\n`;
        markdown += `- Status: ${result.s3DirectAccess.accessible ? '⚠️ Accessible (Security Risk)' : '✅ Blocked (Secure)'}\n`;
        markdown += `- Status Code: ${result.s3DirectAccess.statusCode || 'N/A'}\n\n`;
      }
    });

    markdown += `## Recommendations

`;

    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
      markdown += `### Failed Images
The following images failed to load and need attention:

`;
      failedResults.forEach(result => {
        markdown += `- **${result.imagePath}**: ${result.errors.join(', ')}\n`;
      });
      markdown += '\n';
    }

    const s3AccessibleResults = results.filter(
      r => r.s3DirectAccess && r.s3DirectAccess.accessible
    );
    if (s3AccessibleResults.length > 0) {
      markdown += `### Security Issues
⚠️ **CRITICAL**: S3 bucket is publicly accessible. This violates security standards.

**Action Required**: 
1. Block all public access on S3 bucket
2. Ensure CloudFront OAC is properly configured
3. Update bucket policy to allow CloudFront access only

`;
    }

    markdown += `### Performance Optimization
- Images with slow response times (>2000ms) should be optimized
- Consider implementing image compression and caching strategies
- Monitor CloudFront cache hit rates for better performance

### Next Steps
1. Fix any failed image loads
2. Address security issues if found
3. Optimize slow-loading images
4. Set up monitoring for ongoing image accessibility
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
    <title>Image Accessibility Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .result-item { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 5px; overflow: hidden; }
        .result-header { background: #f8f9fa; padding: 15px; font-weight: bold; }
        .result-body { padding: 15px; }
        .result-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
        .detail-item { background: #f8f9fa; padding: 10px; border-radius: 3px; }
        .error-list, .warning-list { margin: 10px 0; }
        .error-list li { color: #dc3545; }
        .warning-list li { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Image Accessibility Validation Report</h1>
        <p><strong>Timestamp:</strong> ${metadata.timestamp}</p>
        <p><strong>CloudFront Domain:</strong> ${metadata.cloudfrontDomain}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Images</h3>
            <div style="font-size: 2em; font-weight: bold;">${metadata.summary.totalImages}</div>
        </div>
        <div class="summary-card">
            <h3>Successful</h3>
            <div style="font-size: 2em; font-weight: bold; color: #28a745;">${metadata.summary.successful}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div style="font-size: 2em; font-weight: bold; color: #dc3545;">${metadata.summary.failed}</div>
        </div>
        <div class="summary-card">
            <h3>Warnings</h3>
            <div style="font-size: 2em; font-weight: bold; color: #ffc107;">${metadata.summary.warnings}</div>
        </div>
    </div>

    <h2>Detailed Results</h2>
    
    ${results
      .map(
        (result, index) => `
    <div class="result-item">
        <div class="result-header ${result.success ? 'success' : 'error'}">
            ${index + 1}. ${result.imagePath} ${result.success ? '✅ PASS' : '❌ FAIL'}
        </div>
        <div class="result-body">
            <div class="result-details">
                <div class="detail-item">
                    <strong>URL:</strong><br>
                    <a href="${result.url}" target="_blank">${result.url}</a>
                </div>
                <div class="detail-item">
                    <strong>Status Code:</strong> ${result.statusCode || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Response Time:</strong> ${result.responseTime || 'N/A'}ms
                </div>
                <div class="detail-item">
                    <strong>Content Type:</strong> ${result.contentType || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Content Length:</strong> ${result.contentLength || 'N/A'} bytes
                </div>
                <div class="detail-item">
                    <strong>Cache Status:</strong> ${result.cacheStatus || 'N/A'}
                </div>
            </div>
            
            ${
              result.errors.length > 0
                ? `
            <h4>Errors:</h4>
            <ul class="error-list">
                ${result.errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
            `
                : ''
            }
            
            ${
              result.warnings.length > 0
                ? `
            <h4>Warnings:</h4>
            <ul class="warning-list">
                ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
            </ul>
            `
                : ''
            }
            
            ${
              result.s3DirectAccess
                ? `
            <h4>S3 Direct Access Test:</h4>
            <p><strong>Status:</strong> ${result.s3DirectAccess.accessible ? '⚠️ Accessible (Security Risk)' : '✅ Blocked (Secure)'}</p>
            <p><strong>Status Code:</strong> ${result.s3DirectAccess.statusCode || 'N/A'}</p>
            `
                : ''
            }
        </div>
    </div>
    `
      )
      .join('')}

    <h2>Summary Table</h2>
    <table>
        <thead>
            <tr>
                <th>Image Path</th>
                <th>Status</th>
                <th>Status Code</th>
                <th>Response Time</th>
                <th>Content Type</th>
                <th>Size (KB)</th>
            </tr>
        </thead>
        <tbody>
            ${results
              .map(
                result => `
            <tr>
                <td>${result.imagePath}</td>
                <td class="${result.success ? 'status-pass' : 'status-fail'}">${result.success ? 'PASS' : 'FAIL'}</td>
                <td>${result.statusCode || 'N/A'}</td>
                <td>${result.responseTime || 'N/A'}ms</td>
                <td>${result.contentType || 'N/A'}</td>
                <td>${result.details.fileSizeKB || 'N/A'}</td>
            </tr>
            `
              )
              .join('')}
        </tbody>
    </table>

    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
        <h3>Report Generated</h3>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Duration:</strong> ${Math.round(metadata.summary.duration / 1000)}s</p>
    </div>
</body>
</html>`;
  }

  /**
   * Print summary to console
   */
  printSummary(summary) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${summary.successful}/${summary.totalImages}`);
    console.log(`❌ Failed: ${summary.failed}/${summary.totalImages}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`⏱️  Duration: ${Math.round(summary.duration / 1000)}s`);

    if (summary.failed > 0) {
      console.log('\n❌ FAILED IMAGES:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   ${result.imagePath}: ${result.errors.join(', ')}`);
        });
    }

    if (summary.successful === summary.totalImages) {
      console.log('\n🎉 All images are accessible via CloudFront!');
    } else {
      console.log(
        '\n⚠️  Some images failed validation. Check the detailed reports for more information.'
      );
    }

    console.log('='.repeat(60));
  }
}

// Main execution
async function main() {
  try {
    const validator = new ImageAccessibilityValidator();
    const summary = await validator.runValidation();

    // Exit with error code if any images failed
    process.exit(summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ImageAccessibilityValidator };
