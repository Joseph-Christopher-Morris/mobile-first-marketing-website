#!/usr/bin/env node

/**
 * Image Accessibility Validation Script
 * 
 * Validates that all required images from the website-image-navigation-fixes spec
 * are accessible via CloudFront with correct HTTP responses and Content-Type headers.
 * 
 * Requirements: 5.5, 7.2
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  cloudfrontDomain: 'd15sc9fc739ev2.cloudfront.net',
  s3BucketName: 'mobile-marketing-site-prod-1759705011281-tyzuo9',
  timeout: 10000,
  maxRetries: 3,
  outputDir: 'validation-reports'
};

// Complete list of images from requirements and design documents
const REQUIRED_IMAGES = {
  // Homepage Service Cards (Requirement 1.1)
  homepage: {
    serviceCards: [
      '/images/services/photography-hero.webp',
      '/images/services/analytics-hero.webp', 
      '/images/services/ad-campaigns-hero.webp'
    ]
  },
  
  // Blog Preview Images (Requirement 1.2)
  blog: {
    previews: [
      '/images/hero/google-ads-analytics-dashboard.webp',
      '/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp',
      '/images/hero/240619-london-19.webp'
    ]
  },
  
  // Service Pages Hero Images (Requirements 2.1, 2.3, 2.5)
  services: {
    heroes: [
      '/images/services/250928-hampson-auctions-sunday-11.webp', // Photography
      '/images/services/screenshot-2025-09-23-analytics-dashboard.webp', // Analytics
      '/images/services/ad-campaigns-hero.webp' // Ad Campaigns
    ],
    
    // Portfolio Images (Requirements 2.2, 2.4, 2.6)
    portfolios: {
      photography: [
        '/images/services/240217-australia-trip-232.webp',
        '/images/services/240219-australia-trip-148.webp',
        '/images/services/240619-london-19.webp',
        '/images/services/240619-london-26.webp',
        '/images/services/240619-london-64.webp',
        '/images/services/250125-liverpool-40.webp'
      ],
      analytics: [
        '/images/services/screenshot-2025-08-12-analytics-report.webp',
        '/images/hero/stock-photography-samira.webp',
        '/images/services/output-5-analytics-chart.webp'
      ],
      adCampaigns: [
        '/images/services/accessible-top8-campaigns-source.webp',
        '/images/services/top-3-mediums-by-conversion-rate.webp',
        '/images/services/screenshot-2025-08-12-analytics-report.webp'
      ]
    }
  },
  
  // About Page (Requirement 3.1)
  about: {
    hero: '/images/about/A7302858.webp'
  }
};

class ImageAccessibilityValidator {
  constructor() {
    this.results = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.allImages = this.flattenImageList();
  }

  /**
   * Flatten the nested image structure into a single array
   */
  flattenImageList() {
    const images = [];
    
    // Homepage service cards
    images.push(...REQUIRED_IMAGES.homepage.serviceCards.map(img => ({
      path: img,
      category: 'homepage-service-cards',
      requirement: '1.1'
    })));
    
    // Blog previews
    images.push(...REQUIRED_IMAGES.blog.previews.map(img => ({
      path: img,
      category: 'blog-previews',
      requirement: '1.2'
    })));
    
    // Service heroes
    images.push(...REQUIRED_IMAGES.services.heroes.map(img => ({
      path: img,
      category: 'service-heroes',
      requirement: '2.1, 2.3, 2.5'
    })));
    
    // Portfolio images
    Object.entries(REQUIRED_IMAGES.services.portfolios).forEach(([service, imgs]) => {
      images.push(...imgs.map(img => ({
        path: img,
        category: `portfolio-${service}`,
        requirement: service === 'photography' ? '2.2' : service === 'analytics' ? '2.4' : '2.6'
      })));
    });
    
    // About hero
    images.push({
      path: REQUIRED_IMAGES.about.hero,
      category: 'about-hero',
      requirement: '3.1'
    });
    
    return images;
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      const timeout = options.timeout || CONFIG.timeout;

      const req = protocol.get(url, {
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }, (res) => {
        let data = Buffer.alloc(0);
        
        res.on('data', (chunk) => {
          data = Buffer.concat([data, chunk]);
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            responseTime: Date.now() - startTime,
            contentLength: data.length
          });
        });
      });

      const startTime = Date.now();

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(timeout);
    });
  }

  /**
   * Validate a single image
   */
  async validateImage(imageData, retryCount = 0) {
    const { path: imagePath, category, requirement } = imageData;
    const url = `https://${CONFIG.cloudfrontDomain}${imagePath}`;
    
    const result = {
      imagePath,
      category,
      requirement,
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
      details: {}
    };

    try {
      console.log(`Testing ${category}: ${imagePath} (attempt ${retryCount + 1})`);
      
      const response = await this.makeRequest(url);
      
      result.statusCode = response.statusCode;
      result.responseTime = response.responseTime;
      result.contentType = response.headers['content-type'];
      result.contentLength = response.contentLength;
      result.cacheStatus = response.headers['x-cache'] || response.headers['x-amz-cf-pop'];
      
      // Store relevant headers
      result.details.headers = {
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length'],
        'cache-control': response.headers['cache-control'],
        'expires': response.headers['expires'],
        'etag': response.headers['etag'],
        'last-modified': response.headers['last-modified'],
        'x-cache': response.headers['x-cache'],
        'x-amz-cf-pop': response.headers['x-amz-cf-pop'],
        'x-amz-cf-id': response.headers['x-amz-cf-id']
      };

      // Validate response
      if (response.statusCode === 200) {
        result.success = true;
        
        // Validate Content-Type header (Requirement 4.1)
        if (!response.headers['content-type']) {
          result.errors.push('Missing Content-Type header');
          result.success = false;
        } else if (!response.headers['content-type'].startsWith('image/')) {
          result.errors.push(`Invalid Content-Type: ${response.headers['content-type']} (expected image/*)`);
          result.success = false;
        } else if (imagePath.endsWith('.webp') && response.headers['content-type'] !== 'image/webp') {
          result.warnings.push(`WebP file has Content-Type: ${response.headers['content-type']} (expected image/webp)`);
        }

        // Validate content length
        if (result.contentLength < 100) {
          result.warnings.push(`Suspiciously small file size: ${result.contentLength} bytes`);
        }
        
        result.details.fileSizeBytes = result.contentLength;
        result.details.fileSizeKB = Math.round(result.contentLength / 1024 * 100) / 100;

        // Check cache headers (Requirement 4.4)
        const cacheControl = response.headers['cache-control'];
        if (cacheControl) {
          if (!cacheControl.includes('max-age=31536000') && !cacheControl.includes('immutable')) {
            result.warnings.push('Image should have long-term caching (max-age=31536000, immutable)');
          }
          result.details.cacheControl = cacheControl;
        } else {
          result.warnings.push('Missing Cache-Control header');
        }

        // Check cache hit status
        if (response.headers['x-cache']) {
          result.details.cacheHit = response.headers['x-cache'].includes('Hit');
        }

      } else if (response.statusCode === 404) {
        result.errors.push('Image not found (404) - Check if file exists and was uploaded correctly');
      } else if (response.statusCode === 403) {
        result.errors.push('Access denied (403) - Check S3 permissions and CloudFront OAC configuration');
      } else if (response.statusCode >= 500) {
        result.errors.push(`Server error (${response.statusCode}) - CloudFront or S3 issue`);
      } else {
        result.errors.push(`Unexpected status code: ${response.statusCode}`);
      }

    } catch (error) {
      result.errors.push(`Request failed: ${error.message}`);
      
      // Retry logic for network errors
      if (retryCount < CONFIG.maxRetries - 1 && 
          (error.message.includes('timeout') || error.message.includes('ECONNRESET'))) {
        console.log(`  Retrying in 2 seconds... (${retryCount + 1}/${CONFIG.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.validateImage(imageData, retryCount + 1);
      }
    }

    return result;
  }

  /**
   * Test direct S3 access (should fail with proper security)
   */
  async testS3Security() {
    const testImage = this.allImages[0].path;
    const s3Url = `https://${CONFIG.s3BucketName}.s3.amazonaws.com${testImage}`;
    
    console.log('🔒 Testing S3 security (direct access should be blocked)...');
    
    try {
      const response = await this.makeRequest(s3Url);
      return {
        url: s3Url,
        statusCode: response.statusCode,
        accessible: response.statusCode === 200,
        secure: response.statusCode !== 200,
        warning: response.statusCode === 200 ? 'CRITICAL: S3 bucket is publicly accessible - security risk!' : null
      };
    } catch (error) {
      return {
        url: s3Url,
        statusCode: null,
        accessible: false,
        secure: true,
        error: error.message
      };
    }
  }

  /**
   * Run comprehensive validation
   */
  async runValidation() {
    console.log('🔍 Starting Image Accessibility Validation');
    console.log(`📅 Timestamp: ${this.timestamp}`);
    console.log(`🌐 CloudFront Domain: ${CONFIG.cloudfrontDomain}`);
    console.log(`📋 Testing ${this.allImages.length} images across all categories\n`);

    // Ensure output directory exists
    try {
      await fs.mkdir(CONFIG.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error.message);
    }

    const summary = {
      totalImages: this.allImages.length,
      successful: 0,
      failed: 0,
      warnings: 0,
      categories: {},
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      securityTest: null
    };

    // Initialize category counters
    this.allImages.forEach(img => {
      if (!summary.categories[img.category]) {
        summary.categories[img.category] = { total: 0, successful: 0, failed: 0 };
      }
      summary.categories[img.category].total++;
    });

    // Test each image
    for (const imageData of this.allImages) {
      const result = await this.validateImage(imageData);
      this.results.push(result);

      const category = summary.categories[result.category];
      
      if (result.success) {
        summary.successful++;
        category.successful++;
        console.log(`  ✅ ${result.imagePath} - OK (${result.responseTime}ms)`);
      } else {
        summary.failed++;
        category.failed++;
        console.log(`  ❌ ${result.imagePath} - FAILED`);
        result.errors.forEach(error => console.log(`     Error: ${error}`));
      }

      if (result.warnings.length > 0) {
        summary.warnings += result.warnings.length;
        result.warnings.forEach(warning => console.log(`     Warning: ${warning}`));
      }

      console.log('');
    }

    // Test S3 security
    summary.securityTest = await this.testS3Security();
    if (summary.securityTest.accessible) {
      console.log(`  ⚠️  ${summary.securityTest.warning}`);
    } else {
      console.log(`  ✅ S3 direct access properly blocked (secure)`);
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
        s3BucketName: CONFIG.s3BucketName,
        testConfiguration: CONFIG,
        summary: summary
      },
      results: this.results,
      imageCategories: REQUIRED_IMAGES
    };

    // JSON Report
    const jsonReport = path.join(CONFIG.outputDir, `image-accessibility-validation-${this.timestamp}.json`);
    await fs.writeFile(jsonReport, JSON.stringify(reportData, null, 2));
    console.log(`📄 JSON report saved: ${jsonReport}`);

    // Markdown Report
    const markdownReport = await this.generateMarkdownReport(reportData);
    const mdReport = path.join(CONFIG.outputDir, `image-accessibility-validation-${this.timestamp}.md`);
    await fs.writeFile(mdReport, markdownReport);
    console.log(`📄 Markdown report saved: ${mdReport}`);

    // HTML Report
    const htmlReport = await this.generateHtmlReport(reportData);
    const htmlReportPath = path.join(CONFIG.outputDir, `image-accessibility-validation-${this.timestamp}.html`);
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

## Category Breakdown

`;

    Object.entries(metadata.summary.categories).forEach(([category, stats]) => {
      const successRate = Math.round((stats.successful / stats.total) * 100);
      markdown += `### ${category.replace('-', ' ').toUpperCase()}
- **Total**: ${stats.total}
- **Successful**: ${stats.successful}
- **Failed**: ${stats.failed}
- **Success Rate**: ${successRate}%

`;
    });

    markdown += `## Security Test

`;
    if (metadata.summary.securityTest) {
      markdown += `- **S3 Direct Access**: ${metadata.summary.securityTest.accessible ? '⚠️ ACCESSIBLE (SECURITY RISK)' : '✅ BLOCKED (SECURE)'}
- **Status Code**: ${metadata.summary.securityTest.statusCode || 'N/A'}

`;
      if (metadata.summary.securityTest.warning) {
        markdown += `**⚠️ CRITICAL SECURITY ISSUE**: ${metadata.summary.securityTest.warning}

`;
      }
    }

    markdown += `## Detailed Results

`;

    // Group results by category
    const resultsByCategory = {};
    results.forEach(result => {
      if (!resultsByCategory[result.category]) {
        resultsByCategory[result.category] = [];
      }
      resultsByCategory[result.category].push(result);
    });

    Object.entries(resultsByCategory).forEach(([category, categoryResults]) => {
      markdown += `### ${category.replace('-', ' ').toUpperCase()}

`;
      categoryResults.forEach((result, index) => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        markdown += `#### ${index + 1}. ${result.imagePath} ${status}

- **URL**: ${result.url}
- **Status Code**: ${result.statusCode || 'N/A'}
- **Response Time**: ${result.responseTime || 'N/A'}ms
- **Content Type**: ${result.contentType || 'N/A'}
- **Content Length**: ${result.contentLength || 'N/A'} bytes
- **Cache Status**: ${result.cacheStatus || 'N/A'}
- **Requirement**: ${result.requirement}

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
      });
    });

    markdown += `## Recommendations

`;

    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
      markdown += `### Failed Images (${failedResults.length})

The following images failed validation and need immediate attention:

`;
      failedResults.forEach(result => {
        markdown += `- **${result.imagePath}** (${result.category}): ${result.errors.join(', ')}
`;
      });
      markdown += `

**Actions Required:**
1. Verify images exist in the source repository
2. Check build process includes all images
3. Verify deployment script uploads images correctly
4. Check S3 bucket permissions and CloudFront OAC configuration

`;
    }

    if (metadata.summary.securityTest && metadata.summary.securityTest.accessible) {
      markdown += `### 🚨 CRITICAL SECURITY ISSUE

**S3 bucket is publicly accessible** - This violates AWS security standards.

**Immediate Actions Required:**
1. Block all public access on S3 bucket
2. Verify CloudFront Origin Access Control (OAC) is properly configured
3. Update bucket policy to allow CloudFront access only
4. Test that images still work via CloudFront after securing bucket

`;
    }

    const warningResults = results.filter(r => r.warnings.length > 0);
    if (warningResults.length > 0) {
      markdown += `### Performance and Configuration Warnings

`;
      warningResults.forEach(result => {
        if (result.warnings.length > 0) {
          markdown += `- **${result.imagePath}**: ${result.warnings.join(', ')}
`;
        }
      });
      markdown += `

**Optimization Recommendations:**
1. Configure long-term caching for images (max-age=31536000, immutable)
2. Ensure correct Content-Type headers for WebP files
3. Monitor image file sizes and optimize large images
4. Set up CloudFront compression for better performance

`;
    }

    markdown += `### Next Steps

1. **Fix Critical Issues**: Address any failed image loads immediately
2. **Security**: Secure S3 bucket if publicly accessible
3. **Performance**: Optimize caching and Content-Type headers
4. **Monitoring**: Set up automated monitoring for ongoing validation
5. **Documentation**: Update deployment procedures based on findings

---

**Report Generated**: ${new Date().toISOString()}  
**Validation Requirements**: 5.5, 7.2 from website-image-navigation-fixes spec
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #495057; font-size: 0.9em; text-transform: uppercase; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .category-section { margin: 30px 0; }
        .category-header { background: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        .result-item { border: 1px solid #dee2e6; margin-bottom: 15px; border-radius: 8px; overflow: hidden; }
        .result-header { padding: 15px; font-weight: bold; display: flex; justify-content: between; align-items: center; }
        .result-header.success { background: #d4edda; color: #155724; }
        .result-header.error { background: #f8d7da; color: #721c24; }
        .result-body { padding: 15px; background: #f8f9fa; }
        .result-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 15px; }
        .detail-item { background: white; padding: 12px; border-radius: 4px; border-left: 4px solid #007bff; }
        .detail-label { font-weight: bold; color: #495057; font-size: 0.9em; }
        .detail-value { margin-top: 5px; }
        .error-list, .warning-list { margin: 15px 0; }
        .error-list li { color: #dc3545; margin: 5px 0; }
        .warning-list li { color: #856404; margin: 5px 0; }
        .security-alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .security-alert.secure { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .recommendations { background: #e7f3ff; border: 1px solid #b8daff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6c757d; border-top: 1px solid #dee2e6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Image Accessibility Validation</h1>
            <p>Comprehensive validation of all required images from website-image-navigation-fixes spec</p>
            <p><strong>Generated:</strong> ${metadata.timestamp} | <strong>Domain:</strong> ${metadata.cloudfrontDomain}</p>
        </div>

        <div class="content">
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Images</h3>
                    <div class="value info">${metadata.summary.totalImages}</div>
                </div>
                <div class="summary-card">
                    <h3>Successful</h3>
                    <div class="value success">${metadata.summary.successful}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="value error">${metadata.summary.failed}</div>
                </div>
                <div class="summary-card">
                    <h3>Warnings</h3>
                    <div class="value warning">${metadata.summary.warnings}</div>
                </div>
            </div>

            ${metadata.summary.securityTest ? `
            <div class="security-alert ${metadata.summary.securityTest.secure ? 'secure' : ''}">
                <h3>🔒 Security Test</h3>
                <p><strong>S3 Direct Access:</strong> ${metadata.summary.securityTest.accessible ? '⚠️ ACCESSIBLE (SECURITY RISK)' : '✅ BLOCKED (SECURE)'}</p>
                <p><strong>Status Code:</strong> ${metadata.summary.securityTest.statusCode || 'N/A'}</p>
                ${metadata.summary.securityTest.warning ? `<p><strong>⚠️ WARNING:</strong> ${metadata.summary.securityTest.warning}</p>` : ''}
            </div>
            ` : ''}

            <h2>Category Breakdown</h2>
            ${Object.entries(metadata.summary.categories).map(([category, stats]) => {
              const successRate = Math.round((stats.successful / stats.total) * 100);
              return `
              <div class="category-header">
                <h3>${category.replace('-', ' ').toUpperCase()}</h3>
                <p>Success Rate: ${successRate}% (${stats.successful}/${stats.total})</p>
              </div>
              `;
            }).join('')}

            <h2>Detailed Results</h2>
            ${Object.entries(results.reduce((acc, result) => {
              if (!acc[result.category]) acc[result.category] = [];
              acc[result.category].push(result);
              return acc;
            }, {})).map(([category, categoryResults]) => `
              <div class="category-section">
                <h3>${category.replace('-', ' ').toUpperCase()}</h3>
                ${categoryResults.map(result => `
                  <div class="result-item">
                    <div class="result-header ${result.success ? 'success' : 'error'}">
                      <span>${result.imagePath}</span>
                      <span>${result.success ? '✅ PASS' : '❌ FAIL'}</span>
                    </div>
                    <div class="result-body">
                      <div class="result-details">
                        <div class="detail-item">
                          <div class="detail-label">URL</div>
                          <div class="detail-value"><a href="${result.url}" target="_blank">${result.url}</a></div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-label">Status Code</div>
                          <div class="detail-value">${result.statusCode || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-label">Response Time</div>
                          <div class="detail-value">${result.responseTime || 'N/A'}ms</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-label">Content Type</div>
                          <div class="detail-value">${result.contentType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-label">Size</div>
                          <div class="detail-value">${result.details.fileSizeKB || 'N/A'} KB</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-label">Requirement</div>
                          <div class="detail-value">${result.requirement}</div>
                        </div>
                      </div>
                      
                      ${result.errors.length > 0 ? `
                      <h4>Errors:</h4>
                      <ul class="error-list">
                        ${result.errors.map(error => `<li>${error}</li>`).join('')}
                      </ul>
                      ` : ''}
                      
                      ${result.warnings.length > 0 ? `
                      <h4>Warnings:</h4>
                      <ul class="warning-list">
                        ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
                      </ul>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `).join('')}

            <div class="recommendations">
                <h3>💡 Recommendations</h3>
                <ul>
                    ${metadata.summary.failed > 0 ? '<li><strong>Fix Failed Images:</strong> Address image loading failures immediately</li>' : ''}
                    ${metadata.summary.securityTest && metadata.summary.securityTest.accessible ? '<li><strong>🚨 CRITICAL:</strong> Secure S3 bucket by blocking public access</li>' : ''}
                    ${metadata.summary.warnings > 0 ? '<li><strong>Optimize Performance:</strong> Address caching and Content-Type warnings</li>' : ''}
                    <li><strong>Monitor:</strong> Set up automated monitoring for ongoing validation</li>
                    <li><strong>Document:</strong> Update deployment procedures based on findings</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>Report Generated:</strong> ${new Date().toISOString()}</p>
            <p><strong>Requirements:</strong> 5.5, 7.2 from website-image-navigation-fixes spec</p>
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
    console.log('📊 IMAGE ACCESSIBILITY VALIDATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful: ${summary.successful}/${summary.totalImages}`);
    console.log(`❌ Failed: ${summary.failed}/${summary.totalImages}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`⏱️  Duration: ${Math.round(summary.duration / 1000)}s`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    Object.entries(summary.categories).forEach(([category, stats]) => {
      const successRate = Math.round((stats.successful / stats.total) * 100);
      console.log(`   ${category}: ${stats.successful}/${stats.total} (${successRate}%)`);
    });

    if (summary.securityTest) {
      console.log(`\n🔒 SECURITY: ${summary.securityTest.secure ? 'SECURE' : 'INSECURE'}`);
      if (!summary.securityTest.secure) {
        console.log(`   ⚠️  ${summary.securityTest.warning}`);
      }
    }
    
    if (summary.failed > 0) {
      console.log('\n❌ FAILED IMAGES:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   ${result.imagePath}: ${result.errors.join(', ')}`);
      });
    }

    if (summary.successful === summary.totalImages && summary.securityTest?.secure) {
      console.log('\n🎉 All images are accessible and secure!');
    } else {
      console.log('\n⚠️  Some issues found. Check detailed reports for more information.');
    }
    
    console.log('='.repeat(70));
  }
}

// Main execution
async function main() {
  try {
    const validator = new ImageAccessibilityValidator();
    const summary = await validator.runValidation();
    
    // Exit with error code if any images failed or security issues found
    const exitCode = (summary.failed > 0 || (summary.securityTest && !summary.securityTest.secure)) ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Image accessibility validation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ImageAccessibilityValidator, REQUIRED_IMAGES };