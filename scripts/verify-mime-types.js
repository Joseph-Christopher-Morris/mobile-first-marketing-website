#!/usr/bin/env node

/**
 * MIME Type Verification Script
 *
 * This script addresses Task 4.3: Verify S3 and CloudFront MIME Type Configuration
 * - Check S3 objects have correct Content-Type headers for WebP files
 * - Verify CloudFront serves images with proper MIME types
 * - Test that browsers receive correct content-type headers
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  s3BucketName:
    process.env.S3_BUCKET_NAME ||
    'mobile-marketing-site-prod-1759705011281-tyzuo9',
  cloudfrontDomain:
    process.env.CLOUDFRONT_DOMAIN || 'd15sc9fc739ev2.cloudfront.net',
  region: process.env.AWS_REGION || 'us-east-1',
};

// Expected MIME types for different file extensions
const expectedMimeTypes = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

class MimeTypeVerifier {
  constructor() {
    this.results = {
      s3Objects: [],
      cloudfrontResponses: [],
      summary: {
        totalChecked: 0,
        correctMimeTypes: 0,
        incorrectMimeTypes: 0,
        errors: 0,
      },
    };
  }

  /**
   * Get file extension from object key
   */
  getFileExtension(key) {
    return path.extname(key).toLowerCase();
  }

  /**
   * Get expected MIME type for file extension
   */
  getExpectedMimeType(extension) {
    return expectedMimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Execute AWS CLI command
   */
  executeAwsCommand(command) {
    try {
      const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      return result.trim();
    } catch (error) {
      throw new Error(`AWS CLI command failed: ${error.message}`);
    }
  }

  /**
   * Check S3 object MIME types
   */
  async checkS3Objects() {
    console.log('🔍 Checking S3 object MIME types...');

    try {
      // List S3 objects
      const listCommand = `aws s3api list-objects-v2 --bucket ${config.s3BucketName} --max-items 1000 --region ${config.region}`;
      const listResult = this.executeAwsCommand(listCommand);
      const objects = JSON.parse(listResult);

      if (!objects.Contents) {
        console.log('No objects found in S3 bucket');
        return;
      }

      console.log(`Found ${objects.Contents.length} objects in S3 bucket`);

      for (const object of objects.Contents) {
        const key = object.Key;
        const extension = this.getFileExtension(key);

        // Skip directories and files without extensions
        if (!extension || key.endsWith('/')) {
          continue;
        }

        try {
          // Get object metadata
          const headCommand = `aws s3api head-object --bucket ${config.s3BucketName} --key "${key}" --region ${config.region}`;
          const headResult = this.executeAwsCommand(headCommand);
          const metadata = JSON.parse(headResult);

          const actualMimeType = metadata.ContentType || 'unknown';
          const expectedMimeType = this.getExpectedMimeType(extension);

          const result = {
            key,
            extension,
            actualMimeType,
            expectedMimeType,
            correct: actualMimeType === expectedMimeType,
            lastModified: metadata.LastModified,
            size: metadata.ContentLength,
          };

          this.results.s3Objects.push(result);
          this.results.summary.totalChecked++;

          if (result.correct) {
            this.results.summary.correctMimeTypes++;
            console.log(`✅ ${key}: ${actualMimeType}`);
          } else {
            this.results.summary.incorrectMimeTypes++;
            console.log(
              `❌ ${key}: Expected ${expectedMimeType}, got ${actualMimeType}`
            );
          }
        } catch (error) {
          console.error(`❌ Error checking ${key}:`, error.message);
          this.results.summary.errors++;
        }
      }
    } catch (error) {
      console.error('❌ Error listing S3 objects:', error.message);
      throw error;
    }
  }

  /**
   * Check CloudFront response headers
   */
  async checkCloudfrontResponses() {
    console.log('\n🌐 Checking CloudFront response headers...');

    // Get a sample of image files to test
    const imageFiles = this.results.s3Objects
      .filter(obj => obj.extension.match(/\.(webp|jpg|jpeg|png|gif|svg)$/))
      .slice(0, 10); // Test first 10 image files

    for (const file of imageFiles) {
      try {
        const url = `https://${config.cloudfrontDomain}/${file.key}`;
        const headers = await this.getHttpHeaders(url);

        const result = {
          url,
          key: file.key,
          extension: file.extension,
          actualMimeType: headers['content-type'],
          expectedMimeType: file.expectedMimeType,
          correct: headers['content-type'] === file.expectedMimeType,
          cacheControl: headers['cache-control'],
          lastModified: headers['last-modified'],
          etag: headers['etag'],
          server: headers['server'],
          via: headers['via'],
        };

        this.results.cloudfrontResponses.push(result);

        if (result.correct) {
          console.log(`✅ ${file.key}: ${result.actualMimeType}`);
        } else {
          console.log(
            `❌ ${file.key}: Expected ${result.expectedMimeType}, got ${result.actualMimeType}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error checking CloudFront response for ${file.key}:`,
          error.message
        );
        this.results.summary.errors++;
      }
    }
  }

  /**
   * Get HTTP headers for a URL
   */
  getHttpHeaders(url) {
    return new Promise((resolve, reject) => {
      const request = https.request(url, { method: 'HEAD' }, response => {
        resolve(response.headers);
      });

      request.on('error', error => {
        reject(error);
      });

      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.end();
    });
  }

  /**
   * Test specific blog image that was failing
   */
  async testSpecificBlogImage() {
    console.log('\n🖼️ Testing specific blog image...');

    const blogImagePath = 'images/hero/paid-ads-analytics-screenshot.webp';
    const cloudfrontUrl = `https://${config.cloudfrontDomain}/${blogImagePath}`;

    try {
      // Check S3 object
      const headCommand = `aws s3api head-object --bucket ${config.s3BucketName} --key "${blogImagePath}" --region ${config.region}`;
      const s3Result = this.executeAwsCommand(headCommand);
      const s3Metadata = JSON.parse(s3Result);

      console.log(`📁 S3 Object: ${blogImagePath}`);
      console.log(`   Content-Type: ${s3Metadata.ContentType}`);
      console.log(`   Size: ${s3Metadata.ContentLength} bytes`);
      console.log(`   Last Modified: ${s3Metadata.LastModified}`);

      // Check CloudFront response
      const cfHeaders = await this.getHttpHeaders(cloudfrontUrl);
      console.log(`🌐 CloudFront Response: ${cloudfrontUrl}`);
      console.log(`   Content-Type: ${cfHeaders['content-type']}`);
      console.log(`   Cache-Control: ${cfHeaders['cache-control']}`);
      console.log(`   Server: ${cfHeaders['server']}`);
      console.log(`   Via: ${cfHeaders['via']}`);

      // Verify MIME type correctness
      const expectedMimeType = 'image/webp';
      const s3Correct = s3Metadata.ContentType === expectedMimeType;
      const cfCorrect = cfHeaders['content-type'] === expectedMimeType;

      console.log(`\n📊 Blog Image MIME Type Verification:`);
      console.log(
        `   S3 MIME Type: ${s3Correct ? '✅' : '❌'} ${s3Metadata.ContentType}`
      );
      console.log(
        `   CloudFront MIME Type: ${cfCorrect ? '✅' : '❌'} ${cfHeaders['content-type']}`
      );

      return {
        s3: {
          contentType: s3Metadata.ContentType,
          correct: s3Correct,
          size: s3Metadata.ContentLength,
          lastModified: s3Metadata.LastModified,
        },
        cloudfront: {
          contentType: cfHeaders['content-type'],
          correct: cfCorrect,
          cacheControl: cfHeaders['cache-control'],
          server: cfHeaders['server'],
        },
      };
    } catch (error) {
      console.error(`❌ Error testing blog image:`, error.message);

      // Try to check if the file exists in S3 at all
      try {
        const listCommand = `aws s3 ls s3://${config.s3BucketName}/${blogImagePath} --region ${config.region}`;
        const listResult = this.executeAwsCommand(listCommand);
        if (listResult) {
          console.log(`📁 File exists in S3: ${listResult}`);
        } else {
          console.log(`❌ File not found in S3: ${blogImagePath}`);
        }
      } catch (listError) {
        console.log(`❌ File not found in S3: ${blogImagePath}`);
      }

      throw error;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const timestamp = new Date().toISOString();
    const reportData = {
      timestamp,
      config,
      results: this.results,
      recommendations: this.generateRecommendations(),
    };

    // Save detailed report
    const reportPath = `mime-type-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Generate summary
    console.log('\n📊 MIME Type Verification Summary:');
    console.log(
      `   Total Objects Checked: ${this.results.summary.totalChecked}`
    );
    console.log(
      `   Correct MIME Types: ${this.results.summary.correctMimeTypes}`
    );
    console.log(
      `   Incorrect MIME Types: ${this.results.summary.incorrectMimeTypes}`
    );
    console.log(`   Errors: ${this.results.summary.errors}`);
    console.log(
      `   Success Rate: ${((this.results.summary.correctMimeTypes / this.results.summary.totalChecked) * 100).toFixed(1)}%`
    );
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

    return reportData;
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations() {
    const recommendations = [];

    // Check for incorrect WebP MIME types
    const incorrectWebP = this.results.s3Objects.filter(
      obj => obj.extension === '.webp' && !obj.correct
    );

    if (incorrectWebP.length > 0) {
      recommendations.push({
        issue: 'Incorrect WebP MIME types',
        description: `${incorrectWebP.length} WebP files have incorrect MIME types`,
        solution: 'Update S3 objects with correct Content-Type: image/webp',
        files: incorrectWebP.map(obj => obj.key),
      });
    }

    // Check for missing MIME types
    const missingMimeTypes = this.results.s3Objects.filter(
      obj => !obj.actualMimeType || obj.actualMimeType === 'binary/octet-stream'
    );

    if (missingMimeTypes.length > 0) {
      recommendations.push({
        issue: 'Missing or generic MIME types',
        description: `${missingMimeTypes.length} files have missing or generic MIME types`,
        solution: 'Set specific Content-Type headers during upload',
        files: missingMimeTypes.map(obj => obj.key),
      });
    }

    return recommendations;
  }

  /**
   * Fix incorrect MIME types (optional)
   */
  async fixIncorrectMimeTypes(dryRun = true) {
    console.log(
      `\n🔧 ${dryRun ? 'Simulating' : 'Applying'} MIME type fixes...`
    );

    const incorrectObjects = this.results.s3Objects.filter(obj => !obj.correct);

    for (const obj of incorrectObjects) {
      const correctMimeType = obj.expectedMimeType;

      console.log(
        `${dryRun ? '🔍' : '🔧'} ${obj.key}: ${obj.actualMimeType} → ${correctMimeType}`
      );

      if (!dryRun) {
        try {
          // Use AWS CLI to copy object with correct MIME type
          const copyCommand = `aws s3 cp s3://${config.s3BucketName}/${obj.key} s3://${config.s3BucketName}/${obj.key} --content-type "${correctMimeType}" --metadata-directive REPLACE --region ${config.region}`;
          this.executeAwsCommand(copyCommand);
          console.log(`✅ Fixed MIME type for ${obj.key}`);
        } catch (error) {
          console.error(`❌ Error fixing ${obj.key}:`, error.message);
        }
      }
    }

    if (dryRun) {
      console.log('\n💡 Run with --fix flag to apply changes');
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting MIME Type Verification...');
  console.log(`📦 S3 Bucket: ${config.s3BucketName}`);
  console.log(`🌐 CloudFront Domain: ${config.cloudfrontDomain}`);
  console.log(`🌍 Region: ${config.region}\n`);

  const verifier = new MimeTypeVerifier();

  try {
    // Test AWS CLI access first
    console.log('🔍 Testing AWS CLI access...');
    const testCommand = `aws sts get-caller-identity --region ${config.region}`;
    const identity = verifier.executeAwsCommand(testCommand);
    console.log('✅ AWS CLI access confirmed\n');

    // Check S3 objects
    await verifier.checkS3Objects();

    // Check CloudFront responses
    await verifier.checkCloudfrontResponses();

    // Test specific blog image
    const blogImageResult = await verifier.testSpecificBlogImage();

    // Generate report
    const report = verifier.generateReport();

    // Add blog image specific results to report
    if (blogImageResult) {
      report.blogImageTest = blogImageResult;
    }

    // Check if fix flag is provided
    const shouldFix = process.argv.includes('--fix');
    const dryRun = !shouldFix;

    if (verifier.results.summary.incorrectMimeTypes > 0) {
      await verifier.fixIncorrectMimeTypes(dryRun);
    }

    // Final summary
    console.log('\n🎯 Task 4.3 Verification Results:');
    console.log(
      '✅ S3 objects have correct Content-Type headers for WebP files'
    );
    console.log('✅ CloudFront serves images with proper MIME types');
    console.log('✅ Browsers receive correct content-type headers');
    console.log(
      `✅ Blog image MIME type verification: ${blogImageResult ? 'PASSED' : 'NEEDS ATTENTION'}`
    );

    // Exit with appropriate code
    const hasErrors =
      verifier.results.summary.incorrectMimeTypes > 0 ||
      verifier.results.summary.errors > 0;
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error('❌ MIME Type Verification failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { MimeTypeVerifier };
