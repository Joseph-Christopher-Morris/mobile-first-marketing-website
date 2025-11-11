#!/usr/bin/env node

/**
 * SCRAM Final Deployment - Deployment Verification Script
 * 
 * Validates:
 * - All files upload successfully to S3 (Requirement 12.1)
 * - Correct Cache-Control headers are applied to different file types (Requirement 12.2)
 * - CloudFront invalidation completes successfully (Requirement 12.3)
 */

const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, GetInvalidationCommand, ListInvalidationsCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  s3Bucket: 'mobile-marketing-site-prod-1759705011281-tyzuo9',
  cloudfrontDistribution: 'E2IBMHQ3GCW6ZK',
  region: 'us-east-1',
  buildDir: 'out',
  expectedCacheHeaders: {
    html: 'public, max-age=600',
    assets: 'public, max-age=31536000, immutable'
  }
};

class DeploymentVerifier {
  constructor() {
    this.s3Client = new S3Client({ region: CONFIG.region });
    this.cloudfrontClient = new CloudFrontClient({ region: CONFIG.region });
    this.results = {
      s3Upload: { passed: false, details: [] },
      cacheHeaders: { passed: false, details: [] },
      invalidation: { passed: false, details: [] }
    };
  }

  async verifyDeployment() {
    console.log('🔍 Starting SCRAM deployment verification...\n');

    try {
      // Step 1: Verify S3 file uploads
      await this.verifyS3Uploads();
      
      // Step 2: Verify cache headers
      await this.verifyCacheHeaders();
      
      // Step 3: Verify CloudFront invalidation
      await this.verifyCloudFrontInvalidation();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Deployment verification failed:', error.message);
      process.exit(1);
    }
  }

  async verifyS3Uploads() {
    console.log('📁 Verifying S3 file uploads...');
    
    try {
      // Get expected files from build directory
      const expectedFiles = this.getExpectedFiles();
      console.log(`   Expected ${expectedFiles.length} files from build`);
      
      // List objects in S3 bucket
      const s3Objects = await this.listS3Objects();
      console.log(`   Found ${s3Objects.length} files in S3`);
      
      // Check if all expected files are present
      const missingFiles = [];
      const presentFiles = [];
      
      for (const expectedFile of expectedFiles) {
        const s3Key = expectedFile.replace(/\\/g, '/'); // Normalize path separators
        const found = s3Objects.some(obj => obj.Key === s3Key);
        
        if (found) {
          presentFiles.push(s3Key);
        } else {
          missingFiles.push(s3Key);
        }
      }
      
      // Report results
      if (missingFiles.length === 0) {
        this.results.s3Upload.passed = true;
        this.results.s3Upload.details.push(`✅ All ${expectedFiles.length} files uploaded successfully`);
        console.log('   ✅ All files uploaded successfully');
      } else {
        this.results.s3Upload.details.push(`❌ ${missingFiles.length} files missing from S3:`);
        missingFiles.forEach(file => {
          this.results.s3Upload.details.push(`   - ${file}`);
        });
        console.log(`   ❌ ${missingFiles.length} files missing from S3`);
      }
      
      // Check for unexpected files (optional warning)
      const unexpectedFiles = s3Objects.filter(obj => 
        !expectedFiles.some(expected => expected.replace(/\\/g, '/') === obj.Key)
      );
      
      if (unexpectedFiles.length > 0) {
        this.results.s3Upload.details.push(`⚠️  ${unexpectedFiles.length} unexpected files found in S3`);
        console.log(`   ⚠️  ${unexpectedFiles.length} unexpected files found in S3`);
      }
      
    } catch (error) {
      this.results.s3Upload.details.push(`❌ S3 upload verification failed: ${error.message}`);
      console.log(`   ❌ S3 upload verification failed: ${error.message}`);
    }
    
    console.log('');
  }

  async verifyCacheHeaders() {
    console.log('🏷️  Verifying Cache-Control headers...');
    
    try {
      // Sample files to check headers
      const testFiles = [
        { key: 'index.html', expectedCache: CONFIG.expectedCacheHeaders.html, type: 'HTML' },
        { key: 'services/index.html', expectedCache: CONFIG.expectedCacheHeaders.html, type: 'HTML' },
        { key: 'blog/index.html', expectedCache: CONFIG.expectedCacheHeaders.html, type: 'HTML' },
        { key: 'sitemap.xml', expectedCache: CONFIG.expectedCacheHeaders.html, type: 'XML' },
        { key: 'robots.txt', expectedCache: CONFIG.expectedCacheHeaders.html, type: 'TXT' }
      ];
      
      // Add asset files if they exist
      const assetFiles = await this.findAssetFiles();
      testFiles.push(...assetFiles.slice(0, 3)); // Test first 3 asset files
      
      let correctHeaders = 0;
      let totalChecked = 0;
      
      for (const file of testFiles) {
        try {
          const headResult = await this.s3Client.send(new HeadObjectCommand({
            Bucket: CONFIG.s3Bucket,
            Key: file.key
          }));
          
          const actualCache = headResult.CacheControl;
          totalChecked++;
          
          if (actualCache === file.expectedCache) {
            correctHeaders++;
            this.results.cacheHeaders.details.push(`✅ ${file.key}: ${actualCache}`);
          } else {
            this.results.cacheHeaders.details.push(`❌ ${file.key}: Expected "${file.expectedCache}", got "${actualCache || 'none'}"`);
          }
          
        } catch (error) {
          this.results.cacheHeaders.details.push(`⚠️  ${file.key}: Could not check headers - ${error.message}`);
        }
      }
      
      if (correctHeaders === totalChecked && totalChecked > 0) {
        this.results.cacheHeaders.passed = true;
        console.log(`   ✅ All ${totalChecked} checked files have correct cache headers`);
      } else {
        console.log(`   ❌ ${correctHeaders}/${totalChecked} files have correct cache headers`);
      }
      
    } catch (error) {
      this.results.cacheHeaders.details.push(`❌ Cache header verification failed: ${error.message}`);
      console.log(`   ❌ Cache header verification failed: ${error.message}`);
    }
    
    console.log('');
  }

  async verifyCloudFrontInvalidation() {
    console.log('🔄 Verifying CloudFront invalidation...');
    
    try {
      // Get recent invalidations
      const listResult = await this.cloudfrontClient.send(new ListInvalidationsCommand({
        DistributionId: CONFIG.cloudfrontDistribution,
        MaxItems: 10
      }));
      
      if (!listResult.InvalidationList || listResult.InvalidationList.Items.length === 0) {
        this.results.invalidation.details.push('⚠️  No recent invalidations found');
        console.log('   ⚠️  No recent invalidations found');
        return;
      }
      
      // Check the most recent invalidation
      const recentInvalidation = listResult.InvalidationList.Items[0];
      const invalidationAge = Date.now() - new Date(recentInvalidation.CreateTime).getTime();
      const ageMinutes = Math.floor(invalidationAge / (1000 * 60));
      
      console.log(`   Most recent invalidation: ${recentInvalidation.Id} (${ageMinutes} minutes ago)`);
      
      // Get detailed invalidation info
      const detailResult = await this.cloudfrontClient.send(new GetInvalidationCommand({
        DistributionId: CONFIG.cloudfrontDistribution,
        Id: recentInvalidation.Id
      }));
      
      const invalidation = detailResult.Invalidation;
      const status = invalidation.Status;
      const paths = invalidation.InvalidationBatch.Paths.Items;
      
      this.results.invalidation.details.push(`Invalidation ${invalidation.Id}:`);
      this.results.invalidation.details.push(`  Status: ${status}`);
      this.results.invalidation.details.push(`  Created: ${invalidation.CreateTime}`);
      this.results.invalidation.details.push(`  Paths: ${paths.join(', ')}`);
      
      if (status === 'Completed') {
        this.results.invalidation.passed = true;
        console.log(`   ✅ Invalidation ${invalidation.Id} completed successfully`);
        console.log(`   📍 Invalidated paths: ${paths.join(', ')}`);
      } else {
        console.log(`   ⏳ Invalidation ${invalidation.Id} status: ${status}`);
        if (ageMinutes < 15) {
          this.results.invalidation.details.push('   ℹ️  Invalidation may still be in progress (< 15 minutes old)');
          console.log('   ℹ️  Invalidation may still be in progress');
        }
      }
      
    } catch (error) {
      this.results.invalidation.details.push(`❌ CloudFront invalidation verification failed: ${error.message}`);
      console.log(`   ❌ CloudFront invalidation verification failed: ${error.message}`);
    }
    
    console.log('');
  }

  getExpectedFiles() {
    const files = [];
    
    if (!fs.existsSync(CONFIG.buildDir)) {
      throw new Error(`Build directory ${CONFIG.buildDir} not found`);
    }
    
    const walkDir = (dir, baseDir = '') => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(baseDir, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath, relativePath);
        } else {
          files.push(relativePath);
        }
      }
    };
    
    walkDir(CONFIG.buildDir);
    return files;
  }

  async listS3Objects() {
    const objects = [];
    let continuationToken;
    
    do {
      const command = new ListObjectsV2Command({
        Bucket: CONFIG.s3Bucket,
        ContinuationToken: continuationToken
      });
      
      const result = await this.s3Client.send(command);
      
      if (result.Contents) {
        objects.push(...result.Contents);
      }
      
      continuationToken = result.NextContinuationToken;
    } while (continuationToken);
    
    return objects;
  }

  async findAssetFiles() {
    try {
      const s3Objects = await this.listS3Objects();
      const assetExtensions = ['.css', '.js', '.webp', '.png', '.jpg', '.svg', '.woff2', '.ico', '.json'];
      
      return s3Objects
        .filter(obj => assetExtensions.some(ext => obj.Key.endsWith(ext)))
        .slice(0, 5) // Limit to first 5 for testing
        .map(obj => ({
          key: obj.Key,
          expectedCache: CONFIG.expectedCacheHeaders.assets,
          type: 'Asset'
        }));
    } catch (error) {
      console.log(`   ⚠️  Could not find asset files: ${error.message}`);
      return [];
    }
  }

  generateReport() {
    console.log('📊 DEPLOYMENT VERIFICATION REPORT');
    console.log('=====================================\n');
    
    const allPassed = this.results.s3Upload.passed && 
                     this.results.cacheHeaders.passed && 
                     this.results.invalidation.passed;
    
    // S3 Upload Results
    console.log('📁 S3 File Upload Verification:');
    console.log(`   Status: ${this.results.s3Upload.passed ? '✅ PASSED' : '❌ FAILED'}`);
    this.results.s3Upload.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // Cache Headers Results
    console.log('🏷️  Cache-Control Headers Verification:');
    console.log(`   Status: ${this.results.cacheHeaders.passed ? '✅ PASSED' : '❌ FAILED'}`);
    this.results.cacheHeaders.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // CloudFront Invalidation Results
    console.log('🔄 CloudFront Invalidation Verification:');
    console.log(`   Status: ${this.results.invalidation.passed ? '✅ PASSED' : '❌ FAILED'}`);
    this.results.invalidation.details.forEach(detail => console.log(`   ${detail}`));
    console.log('');
    
    // Overall Result
    console.log('🎯 OVERALL DEPLOYMENT VERIFICATION:');
    if (allPassed) {
      console.log('   ✅ ALL CHECKS PASSED - Deployment verified successfully!');
      console.log('   🚀 Site is ready for production traffic');
    } else {
      console.log('   ❌ SOME CHECKS FAILED - Review issues above');
      console.log('   ⚠️  Deployment may need attention before production use');
    }
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      overall: allPassed ? 'PASSED' : 'FAILED',
      results: this.results,
      config: CONFIG
    };
    
    const reportFile = `deployment-verification-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    
    if (!allPassed) {
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier.verifyDeployment().catch(error => {
    console.error('💥 Verification script failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentVerifier;