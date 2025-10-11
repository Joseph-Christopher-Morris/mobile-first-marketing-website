#!/usr/bin/env node

/**
 * Blog Image Accessibility Test
 * 
 * Focused test for the specific blog image that was failing:
 * /images/hero/paid-ads-analytics-screenshot.webp
 */

const { ImageAccessibilityValidator } = require('./post-deployment-image-validation.js');

class BlogImageTester extends ImageAccessibilityValidator {
  constructor() {
    super();
    this.blogImagePath = '/images/hero/paid-ads-analytics-screenshot.webp';
    this.cloudfrontDomain = 'd15sc9fc739ev2.cloudfront.net';
  }

  /**
   * Test the specific failing blog image with detailed analysis
   */
  async testBlogImage() {
    console.log('🔍 Testing Specific Blog Image Accessibility');
    console.log('='.repeat(50));
    console.log(`📷 Image: ${this.blogImagePath}`);
    console.log(`🌐 Domain: ${this.cloudfrontDomain}`);
    console.log('');

    // Test the main image
    console.log('1. Testing CloudFront access...');
    const cloudfrontResult = await this.validateImage(this.blogImagePath);
    
    // Test direct S3 access (should fail)
    console.log('2. Testing direct S3 access (security check)...');
    const s3Result = await this.testDirectS3Access(this.blogImagePath);
    
    // Test alternative paths that might work
    console.log('3. Testing alternative image paths...');
    const alternativePaths = [
      '/images/services/analytics-hero.webp',
      '/images/hero/mobile-marketing-hero.webp'
    ];
    
    const alternativeResults = [];
    for (const altPath of alternativePaths) {
      const result = await this.validateImage(altPath);
      alternativeResults.push(result);
    }

    // Generate focused report
    const report = {
      timestamp: new Date().toISOString(),
      targetImage: this.blogImagePath,
      cloudfrontTest: cloudfrontResult,
      s3SecurityTest: s3Result,
      alternativeImages: alternativeResults,
      analysis: this.analyzeResults(cloudfrontResult, s3Result, alternativeResults)
    };

    await this.generateBlogImageReport(report);
    this.printBlogImageSummary(report);

    return report;
  }

  /**
   * Analyze results and provide recommendations
   */
  analyzeResults(cloudfrontResult, s3Result, alternativeResults) {
    const analysis = {
      primaryImageStatus: cloudfrontResult.success ? 'WORKING' : 'FAILED',
      securityStatus: s3Result.accessible ? 'INSECURE' : 'SECURE',
      recommendations: [],
      possibleCauses: [],
      nextSteps: []
    };

    // Analyze primary image failure
    if (!cloudfrontResult.success) {
      if (cloudfrontResult.statusCode === 404) {
        analysis.possibleCauses.push('Image file does not exist in S3 bucket');
        analysis.possibleCauses.push('Image was not included in build output');
        analysis.possibleCauses.push('Deployment script failed to upload image');
        analysis.nextSteps.push('Check if image exists in public/images/hero/ directory');
        analysis.nextSteps.push('Verify build process includes images');
        analysis.nextSteps.push('Check deployment logs for upload errors');
      } else if (cloudfrontResult.statusCode === 403) {
        analysis.possibleCauses.push('S3 bucket permissions issue');
        analysis.possibleCauses.push('CloudFront OAC configuration problem');
        analysis.nextSteps.push('Verify S3 bucket policy allows CloudFront access');
        analysis.nextSteps.push('Check CloudFront OAC configuration');
      } else if (cloudfrontResult.statusCode >= 500) {
        analysis.possibleCauses.push('Server-side error in CloudFront or S3');
        analysis.nextSteps.push('Check AWS service status');
        analysis.nextSteps.push('Review CloudWatch logs');
      }
    } else {
      analysis.recommendations.push('Primary image is working correctly');
    }

    // Security analysis
    if (s3Result.accessible) {
      analysis.recommendations.push('CRITICAL: Block public S3 access immediately');
      analysis.nextSteps.push('Configure S3 bucket to block all public access');
      analysis.nextSteps.push('Ensure CloudFront OAC is the only access method');
    } else {
      analysis.recommendations.push('S3 security is properly configured');
    }

    // Alternative images analysis
    const workingAlternatives = alternativeResults.filter(r => r.success);
    if (workingAlternatives.length > 0 && !cloudfrontResult.success) {
      analysis.recommendations.push('Consider using working alternative images temporarily');
      analysis.nextSteps.push('Update blog post to use working image path');
    }

    return analysis;
  }

  /**
   * Generate focused blog image report
   */
  async generateBlogImageReport(report) {
    const fs = require('fs').promises;
    const path = require('path');

    // Ensure output directory exists
    await fs.mkdir('validation-reports', { recursive: true });

    const timestamp = report.timestamp.replace(/[:.]/g, '-');
    
    // JSON Report
    const jsonPath = path.join('validation-reports', `blog-image-test-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    
    // Markdown Report
    const markdown = this.generateBlogImageMarkdown(report);
    const mdPath = path.join('validation-reports', `blog-image-test-${timestamp}.md`);
    await fs.writeFile(mdPath, markdown);

    console.log(`\n📄 Reports generated:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Markdown: ${mdPath}`);
  }

  /**
   * Generate markdown report for blog image test
   */
  generateBlogImageMarkdown(report) {
    const { cloudfrontTest, s3SecurityTest, alternativeImages, analysis } = report;

    return `# Blog Image Accessibility Test Report

## Test Summary

- **Timestamp**: ${report.timestamp}
- **Target Image**: ${report.targetImage}
- **Primary Status**: ${analysis.primaryImageStatus}
- **Security Status**: ${analysis.securityStatus}

## CloudFront Access Test

**URL**: https://${this.cloudfrontDomain}${report.targetImage}

- **Status**: ${cloudfrontTest.success ? '✅ SUCCESS' : '❌ FAILED'}
- **HTTP Status**: ${cloudfrontTest.statusCode || 'N/A'}
- **Response Time**: ${cloudfrontTest.responseTime || 'N/A'}ms
- **Content Type**: ${cloudfrontTest.contentType || 'N/A'}
- **Content Length**: ${cloudfrontTest.contentLength || 'N/A'} bytes

${cloudfrontTest.errors.length > 0 ? `
**Errors:**
${cloudfrontTest.errors.map(error => `- ${error}`).join('\n')}
` : ''}

${cloudfrontTest.warnings.length > 0 ? `
**Warnings:**
${cloudfrontTest.warnings.map(warning => `- ${warning}`).join('\n')}
` : ''}

## S3 Security Test

- **Direct S3 Access**: ${s3SecurityTest.accessible ? '⚠️ ACCESSIBLE (SECURITY RISK)' : '✅ BLOCKED (SECURE)'}
- **Status Code**: ${s3SecurityTest.statusCode || 'N/A'}

## Alternative Images Test

${alternativeImages.map((result, index) => `
### ${index + 1}. ${result.imagePath}
- **Status**: ${result.success ? '✅ WORKING' : '❌ FAILED'}
- **HTTP Status**: ${result.statusCode || 'N/A'}
- **Response Time**: ${result.responseTime || 'N/A'}ms
`).join('')}

## Analysis & Recommendations

### Possible Causes
${analysis.possibleCauses.map(cause => `- ${cause}`).join('\n')}

### Recommendations
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

### Next Steps
${analysis.nextSteps.map(step => `1. ${step}`).join('\n')}

## Technical Details

### Request Headers Used
- User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
- Accept: image/webp,image/apng,image/*,*/*;q=0.8
- Cache-Control: no-cache
- Pragma: no-cache

### Response Headers (if successful)
${cloudfrontTest.details.headers ? Object.entries(cloudfrontTest.details.headers)
  .filter(([key, value]) => value)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n') : 'N/A - Request failed'}

---
*Report generated by Blog Image Accessibility Tester*
`;
  }

  /**
   * Print focused summary
   */
  printBlogImageSummary(report) {
    const { analysis } = report;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 BLOG IMAGE TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`📷 Image: ${report.targetImage}`);
    console.log(`🔍 Status: ${analysis.primaryImageStatus}`);
    console.log(`🔒 Security: ${analysis.securityStatus}`);
    
    if (analysis.primaryImageStatus === 'FAILED') {
      console.log('\n❌ PRIMARY IMAGE ISSUES:');
      analysis.possibleCauses.forEach(cause => {
        console.log(`   • ${cause}`);
      });
      
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      analysis.nextSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
    } else {
      console.log('\n✅ Primary image is accessible and working correctly!');
    }

    if (analysis.securityStatus === 'INSECURE') {
      console.log('\n🚨 SECURITY ALERT: S3 bucket is publicly accessible!');
      console.log('   This violates security standards and must be fixed immediately.');
    }
    
    console.log('='.repeat(50));
  }
}

// Main execution
async function main() {
  try {
    const tester = new BlogImageTester();
    const report = await tester.testBlogImage();
    
    // Exit with error if primary image failed
    process.exit(report.analysis.primaryImageStatus === 'FAILED' ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Blog image test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BlogImageTester };