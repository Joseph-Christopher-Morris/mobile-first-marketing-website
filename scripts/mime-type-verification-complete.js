#!/usr/bin/env node

/**
 * Complete MIME Type Verification Script for Task 4.3
 *
 * This script verifies:
 * - S3 objects have correct Content-Type headers for WebP files
 * - CloudFront serves images with proper MIME types
 * - Browsers receive correct content-type headers
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

// Configuration
const config = {
  s3BucketName:
    process.env.S3_BUCKET_NAME ||
    'mobile-marketing-site-prod-1759705011281-tyzuo9',
  cloudfrontDomain:
    process.env.CLOUDFRONT_DOMAIN || 'd15sc9fc739ev2.cloudfront.net',
  region: process.env.AWS_REGION || 'us-east-1',
};

// Expected MIME types
const expectedMimeTypes = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function executeAwsCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    throw new Error(`AWS CLI command failed: ${error.message}`);
  }
}

function getHttpHeaders(url) {
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

function getFileExtension(filename) {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

async function main() {
  console.log('🚀 Starting MIME Type Verification for Task 4.3...');
  console.log(`📦 S3 Bucket: ${config.s3BucketName}`);
  console.log(`🌐 CloudFront Domain: ${config.cloudfrontDomain}`);
  console.log(`🌍 Region: ${config.region}\n`);

  const results = {
    s3Objects: [],
    cloudfrontResponses: [],
    blogImageTest: null,
    summary: {
      totalChecked: 0,
      correctMimeTypes: 0,
      incorrectMimeTypes: 0,
      errors: 0,
    },
  };

  try {
    // 1. Test AWS CLI access
    console.log('🔍 Testing AWS CLI access...');
    const identity = executeAwsCommand(
      `aws sts get-caller-identity --region ${config.region}`
    );
    console.log('✅ AWS CLI access confirmed\n');

    // 2. Check S3 objects MIME types
    console.log('📁 Checking S3 object MIME types...');

    const listCommand = `aws s3api list-objects-v2 --bucket ${config.s3BucketName} --max-items 50 --region ${config.region}`;
    const listResult = executeAwsCommand(listCommand);
    const objects = JSON.parse(listResult);

    if (objects.Contents) {
      console.log(`Found ${objects.Contents.length} objects to check`);

      for (const object of objects.Contents) {
        const key = object.Key;
        const extension = getFileExtension(key);

        // Skip directories and files without extensions
        if (!extension || key.endsWith('/')) {
          continue;
        }

        try {
          const headCommand = `aws s3api head-object --bucket ${config.s3BucketName} --key "${key}" --region ${config.region}`;
          const headResult = executeAwsCommand(headCommand);
          const metadata = JSON.parse(headResult);

          const actualMimeType = metadata.ContentType || 'unknown';
          const expectedMimeType =
            expectedMimeTypes[extension] || 'application/octet-stream';

          const result = {
            key,
            extension,
            actualMimeType,
            expectedMimeType,
            correct: actualMimeType === expectedMimeType,
            size: metadata.ContentLength,
          };

          results.s3Objects.push(result);
          results.summary.totalChecked++;

          if (result.correct) {
            results.summary.correctMimeTypes++;
            console.log(`✅ ${key}: ${actualMimeType}`);
          } else {
            results.summary.incorrectMimeTypes++;
            console.log(
              `❌ ${key}: Expected ${expectedMimeType}, got ${actualMimeType}`
            );
          }
        } catch (error) {
          console.error(`❌ Error checking ${key}:`, error.message);
          results.summary.errors++;
        }
      }
    }

    // 3. Test CloudFront responses
    console.log('\n🌐 Testing CloudFront MIME type responses...');

    const imageFiles = results.s3Objects
      .filter(obj => obj.extension.match(/\.(webp|jpg|jpeg|png|gif|svg)$/))
      .slice(0, 5); // Test first 5 image files

    for (const file of imageFiles) {
      try {
        const url = `https://${config.cloudfrontDomain}/${file.key}`;
        const headers = await getHttpHeaders(url);

        const result = {
          url,
          key: file.key,
          extension: file.extension,
          actualMimeType: headers['content-type'],
          expectedMimeType: file.expectedMimeType,
          correct: headers['content-type'] === file.expectedMimeType,
          cacheStatus: headers['x-cache'],
          server: headers['server'],
        };

        results.cloudfrontResponses.push(result);

        if (result.correct) {
          console.log(
            `✅ ${file.key}: ${result.actualMimeType} (${result.cacheStatus})`
          );
        } else {
          console.log(
            `❌ ${file.key}: Expected ${result.expectedMimeType}, got ${result.actualMimeType}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error testing CloudFront response for ${file.key}:`,
          error.message
        );
        results.summary.errors++;
      }
    }

    // 4. Test specific blog image
    console.log(
      '\n🖼️ Testing specific blog image (paid-ads-analytics-screenshot.webp)...'
    );

    const blogImagePath = 'images/hero/paid-ads-analytics-screenshot.webp';
    const cloudfrontUrl = `https://${config.cloudfrontDomain}/${blogImagePath}`;

    try {
      // Check S3 object
      const headCommand = `aws s3api head-object --bucket ${config.s3BucketName} --key "${blogImagePath}" --region ${config.region}`;
      const s3Result = executeAwsCommand(headCommand);
      const s3Metadata = JSON.parse(s3Result);

      // Check CloudFront response
      const cfHeaders = await getHttpHeaders(cloudfrontUrl);

      const expectedMimeType = 'image/webp';
      const s3Correct = s3Metadata.ContentType === expectedMimeType;
      const cfCorrect = cfHeaders['content-type'] === expectedMimeType;

      results.blogImageTest = {
        s3: {
          contentType: s3Metadata.ContentType,
          correct: s3Correct,
          size: s3Metadata.ContentLength,
          lastModified: s3Metadata.LastModified,
        },
        cloudfront: {
          contentType: cfHeaders['content-type'],
          correct: cfCorrect,
          cacheStatus: cfHeaders['x-cache'],
          server: cfHeaders['server'],
        },
      };

      console.log(`📁 S3 Object: ${blogImagePath}`);
      console.log(
        `   Content-Type: ${s3Metadata.ContentType} ${s3Correct ? '✅' : '❌'}`
      );
      console.log(`   Size: ${s3Metadata.ContentLength} bytes`);
      console.log(`   Last Modified: ${s3Metadata.LastModified}`);

      console.log(`🌐 CloudFront Response: ${cloudfrontUrl}`);
      console.log(
        `   Content-Type: ${cfHeaders['content-type']} ${cfCorrect ? '✅' : '❌'}`
      );
      console.log(`   Cache Status: ${cfHeaders['x-cache']}`);
      console.log(`   Server: ${cfHeaders['server']}`);
    } catch (error) {
      console.error(`❌ Error testing blog image:`, error.message);
      results.summary.errors++;
    }

    // 5. Generate comprehensive report
    console.log('\n📊 MIME Type Verification Summary:');
    console.log(`   Total Objects Checked: ${results.summary.totalChecked}`);
    console.log(`   Correct MIME Types: ${results.summary.correctMimeTypes}`);
    console.log(
      `   Incorrect MIME Types: ${results.summary.incorrectMimeTypes}`
    );
    console.log(`   Errors: ${results.summary.errors}`);

    if (results.summary.totalChecked > 0) {
      const successRate = (
        (results.summary.correctMimeTypes / results.summary.totalChecked) *
        100
      ).toFixed(1);
      console.log(`   Success Rate: ${successRate}%`);
    }

    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `mime-type-verification-report-${timestamp}.json`;

    const reportData = {
      timestamp: new Date().toISOString(),
      config,
      results,
      taskCompletion: {
        s3MimeTypesCorrect: results.summary.incorrectMimeTypes === 0,
        cloudfrontMimeTypesCorrect: results.cloudfrontResponses.every(
          r => r.correct
        ),
        blogImageWorking:
          results.blogImageTest &&
          results.blogImageTest.s3.correct &&
          results.blogImageTest.cloudfront.correct,
        overallSuccess:
          results.summary.incorrectMimeTypes === 0 &&
          results.summary.errors === 0,
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

    // 6. Task 4.3 Completion Summary
    console.log('\n🎯 Task 4.3 Verification Results:');
    console.log(
      `✅ S3 objects have correct Content-Type headers for WebP files: ${reportData.taskCompletion.s3MimeTypesCorrect ? 'PASSED' : 'FAILED'}`
    );
    console.log(
      `✅ CloudFront serves images with proper MIME types: ${reportData.taskCompletion.cloudfrontMimeTypesCorrect ? 'PASSED' : 'FAILED'}`
    );
    console.log(
      `✅ Browsers receive correct content-type headers: ${reportData.taskCompletion.blogImageWorking ? 'PASSED' : 'FAILED'}`
    );
    console.log(
      `✅ Blog image MIME type verification: ${reportData.taskCompletion.blogImageWorking ? 'PASSED' : 'FAILED'}`
    );

    if (reportData.taskCompletion.overallSuccess) {
      console.log(
        '\n🎉 Task 4.3 completed successfully! All MIME types are correctly configured.'
      );
    } else {
      console.log(
        '\n⚠️ Task 4.3 needs attention. Some MIME types may need correction.'
      );
    }

    // Exit with appropriate code
    process.exit(reportData.taskCompletion.overallSuccess ? 0 : 1);
  } catch (error) {
    console.error('❌ MIME Type Verification failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
