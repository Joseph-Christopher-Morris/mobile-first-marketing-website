#!/usr/bin/env node

/**
 * Main Deployment Script for S3 + CloudFront
 *
 * This script handles the complete deployment process:
 * 1. Build Next.js static export
 * 2. Upload files to S3 with appropriate cache headers
 * 3. Invalidate CloudFront cache for updated content
 *
 * Requirements addressed:
 * - 3.2: Create script to build Next.js static export
 * - 3.3: Upload files to S3 with appropriate cache headers
 * - 3.3: Invalidate CloudFront cache for updated content
 */

const { execSync } = require('child_process');
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');
const { fromIni } = require('@aws-sdk/credential-providers');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Deployment {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.buildDir = 'out';
    this.environment = process.env.ENVIRONMENT || 'production';

    // Configure AWS credentials - try environment variables first, then fall back to credentials file
    const credentials = process.env.AWS_ACCESS_KEY_ID 
      ? undefined  // Use environment variables
      : fromIni({ profile: process.env.AWS_PROFILE || 'default' });

    this.s3Client = new S3Client({ 
      region: this.region,
      credentials 
    });
    this.cloudFrontClient = new CloudFrontClient({ 
      region: 'us-east-1',
      credentials 
    });

    this.uploadedFiles = [];
    this.deploymentId = `deploy-${Date.now()}`;

    this.validateConfiguration();
  }

  /**
   * Validate required configuration
   */
  validateConfiguration() {
    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }

    if (!this.distributionId) {
      console.warn(
        '⚠️  CLOUDFRONT_DISTRIBUTION_ID not set, skipping cache invalidation'
      );
    }

    console.log('📋 Deployment Configuration:');
    console.log(`   Environment: ${this.environment}`);
    console.log(`   S3 Bucket: ${this.bucketName}`);
    console.log(
      `   CloudFront Distribution: ${this.distributionId || 'Not configured'}`
    );
    console.log(`   Region: ${this.region}`);
    console.log(`   Build Directory: ${this.buildDir}`);
    console.log('');
  }

  /**
   * Build Next.js static export
   */
  async buildProject() {
    console.log('🔨 Building Next.js static export...');

    try {
      // Clean previous build
      if (fs.existsSync(this.buildDir)) {
        console.log('🧹 Cleaning previous build...');
        try {
          // Use Node.js fs.rmSync for cross-platform compatibility
          fs.rmSync(this.buildDir, { recursive: true, force: true });
        } catch (error) {
          console.warn(`   ⚠️  Could not clean build directory: ${error.message}`);
          // Continue anyway - Next.js will overwrite
        }
      }

      // Run Next.js build
      console.log('📦 Running Next.js build...');
      execSync('npm run build', { stdio: 'inherit' });

      // Verify build output
      if (!fs.existsSync(this.buildDir)) {
        throw new Error(`Build directory '${this.buildDir}' was not created`);
      }

      const buildStats = this.getBuildStats();
      console.log('✅ Build completed successfully');
      console.log(`   Files: ${buildStats.fileCount}`);
      console.log(`   Total Size: ${this.formatBytes(buildStats.totalSize)}`);
      console.log('');

      // Run build verification for images
      console.log('🔍 Running build image verification...');
      try {
        const { verifyBuildImages } = require('./build-verification.js');
        const verificationResult = verifyBuildImages();

        if (verificationResult.status !== 'success') {
          throw new Error(
            `Build verification failed: ${verificationResult.failedImages.length} images missing`
          );
        }

        console.log(
          '✅ Build verification passed - all required images present'
        );
        console.log('');
      } catch (error) {
        console.error('❌ Build verification failed:', error.message);
        throw error;
      }

      return buildStats;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  /**
   * Get build statistics
   */
  getBuildStats() {
    const stats = { fileCount: 0, totalSize: 0 };

    const walkDir = dir => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          stats.fileCount++;
          stats.totalSize += stat.size;
        }
      }
    };

    walkDir(this.buildDir);
    return stats;
  }

  /**
   * Get appropriate cache headers for file type
   * Optimized caching strategy per task 14.2 requirements
   */
  getCacheHeaders(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const fullPath = filePath.toLowerCase();

    // Service worker - no cache
    if (fileName === 'sw.js' || fileName === 'service-worker.js') {
      return {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Expires: '0',
      };
    }

    // HTML files - no cache to prevent stale content (per Ahrefs crawl fix requirements)
    if (ext === '.html') {
      return {
        'Cache-Control': 'public, max-age=0, must-revalidate',
      };
    }

    // Images - long cache (1 year = 31536000 seconds) per requirement 4.4
    if (
      [
        '.webp',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.svg',
        '.ico',
        '.avif',
      ].includes(ext)
    ) {
      return {
        'Cache-Control': 'public, max-age=31536000, immutable',
      };
    }

    // Next.js static assets - long cache (1 year)
    if (fullPath.includes('/_next/static/')) {
      return {
        'Cache-Control': 'public, max-age=31536000, immutable',
      };
    }

    // Static assets (JS, CSS, fonts) - long cache (1 year)
    if (['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
      return {
        'Cache-Control': 'public, max-age=31536000, immutable',
      };
    }

    // Sitemap and robots - short cache for crawlers
    if (fileName === 'sitemap.xml' || fileName === 'robots.txt') {
      return {
        'Cache-Control': 'public, max-age=3600',
      };
    }

    // JSON files (manifest, etc.) - medium cache (1 day)
    if (ext === '.json') {
      return {
        'Cache-Control': 'public, max-age=86400',
      };
    }

    // Default - short cache
    return {
      'Cache-Control': 'public, max-age=3600',
    };
  }

  /**
   * Get content type for file
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.xml': 'application/xml; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Calculate file hash for change detection
   */
  calculateFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Check if file has changed
   */
  async hasFileChanged(s3Key, localFilePath) {
    try {
      const localHash = this.calculateFileHash(localFilePath);

      const headResult = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        })
      );

      const s3Hash = headResult.Metadata?.['file-hash'];
      return localHash !== s3Hash;
    } catch (error) {
      // File doesn't exist in S3, so it's changed
      return true;
    }
  }

  /**
   * Upload a single file to S3
   */
  async uploadFile(localFilePath, s3Key) {
    const fileContent = fs.readFileSync(localFilePath);
    const fileHash = this.calculateFileHash(localFilePath);
    const cacheHeaders = this.getCacheHeaders(s3Key);
    const contentType = this.getContentType(s3Key);

    const uploadParams = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      Metadata: {
        'deployment-id': this.deploymentId,
        'file-hash': fileHash,
        'uploaded-at': new Date().toISOString(),
      },
      ...cacheHeaders,
    };

    await this.s3Client.send(new PutObjectCommand(uploadParams));

    this.uploadedFiles.push({
      key: s3Key,
      size: fileContent.length,
      contentType,
      cacheControl: cacheHeaders['Cache-Control'],
    });
  }

  /**
   * Upload all files to S3
   */
  async uploadFiles() {
    console.log('📤 Uploading files to S3...');

    const filesToUpload = [];
    const changedFiles = [];

    // Collect all files to upload
    const walkDir = (dir, baseDir = '') => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath, path.join(baseDir, file));
        } else {
          const s3Key = path.join(baseDir, file).replace(/\\/g, '/');
          filesToUpload.push({ localPath: filePath, s3Key });
        }
      }
    };

    walkDir(this.buildDir);

    console.log(`📋 Found ${filesToUpload.length} files to process`);

    // Check which files have changed
    console.log('🔍 Checking for file changes...');
    for (const file of filesToUpload) {
      const hasChanged = await this.hasFileChanged(file.s3Key, file.localPath);
      if (hasChanged) {
        changedFiles.push(file);
      }
    }

    console.log(
      `📝 ${changedFiles.length} files have changed and will be uploaded`
    );

    if (changedFiles.length === 0) {
      console.log('✅ No files to upload, deployment is up to date');
      return;
    }

    // Upload changed files
    let uploadedCount = 0;
    const totalFiles = changedFiles.length;

    for (const file of changedFiles) {
      try {
        await this.uploadFile(file.localPath, file.s3Key);
        uploadedCount++;

        if (uploadedCount % 10 === 0 || uploadedCount === totalFiles) {
          console.log(`   Uploaded ${uploadedCount}/${totalFiles} files`);
        }
      } catch (error) {
        console.error(`❌ Failed to upload ${file.s3Key}:`, error.message);
        throw error;
      }
    }

    console.log('✅ File upload completed');
    console.log(`   Uploaded: ${this.uploadedFiles.length} files`);
    console.log(
      `   Total Size: ${this.formatBytes(this.uploadedFiles.reduce((sum, f) => sum + f.size, 0))}`
    );
    console.log('');
  }

  /**
   * Remove old files from S3 that are no longer in the build
   */
  async cleanupOldFiles() {
    console.log('🧹 Cleaning up old files...');

    try {
      // Get all objects in the bucket
      const listResult = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
        })
      );

      if (!listResult.Contents || listResult.Contents.length === 0) {
        console.log('   No files to clean up');
        return;
      }

      // Get current build files
      const currentFiles = new Set();
      const walkDir = (dir, baseDir = '') => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            walkDir(filePath, path.join(baseDir, file));
          } else {
            const s3Key = path.join(baseDir, file).replace(/\\/g, '/');
            currentFiles.add(s3Key);
          }
        }
      };

      walkDir(this.buildDir);

      // Find files to delete
      const filesToDelete = listResult.Contents.map(obj => obj.Key).filter(
        key => !currentFiles.has(key)
      );

      if (filesToDelete.length === 0) {
        console.log('   No old files to clean up');
        return;
      }

      console.log(`   Deleting ${filesToDelete.length} old files...`);

      // Delete old files
      for (const key of filesToDelete) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          })
        );
      }

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      // Don't fail the deployment for cleanup errors
    }
  }

  /**
   * Invalidate CloudFront cache
   */
  async invalidateCache() {
    if (!this.distributionId) {
      console.log(
        '⚠️  Skipping cache invalidation (no distribution ID configured)'
      );
      return;
    }

    console.log('🔄 Invalidating CloudFront cache...');

    try {
      // Use wildcard patterns for efficient invalidation
      // CloudFront rules: paths must start with /, no http://, no query strings, no hashes
      const pathsToInvalidate = ['/_next/*', '/*'];

      console.log(`   Invalidating ${pathsToInvalidate.length} paths (using wildcards)`);
      console.log(`   Paths: ${pathsToInvalidate.join(', ')}`);

      const invalidationParams = {
        DistributionId: this.distributionId,
        InvalidationBatch: {
          CallerReference: `${this.deploymentId}-${Date.now()}`,
          Paths: {
            Quantity: pathsToInvalidate.length,
            Items: pathsToInvalidate,
          },
        },
      };

      const result = await this.cloudFrontClient.send(
        new CreateInvalidationCommand(invalidationParams)
      );

      console.log('✅ Cache invalidation started');
      console.log(`   Invalidation ID: ${result.Invalidation.Id}`);
      console.log(`   Status: ${result.Invalidation.Status}`);
      console.log('   Note: Invalidation may take 5-15 minutes to complete');
      console.log('');
    } catch (error) {
      console.error('❌ Cache invalidation failed:', error.message);
      console.error('   Deployment succeeded but cache may not be updated');
    }
  }

  /**
   * Generate deployment summary
   */
  generateSummary(buildStats, startTime) {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('📊 Deployment Summary:');
    console.log(`   Deployment ID: ${this.deploymentId}`);
    console.log(`   Environment: ${this.environment}`);
    console.log(`   Duration: ${duration} seconds`);
    console.log(`   Build Files: ${buildStats.fileCount}`);
    console.log(`   Build Size: ${this.formatBytes(buildStats.totalSize)}`);
    console.log(`   Uploaded Files: ${this.uploadedFiles.length}`);
    console.log(`   S3 Bucket: ${this.bucketName}`);

    if (this.distributionId) {
      console.log(`   CloudFront Distribution: ${this.distributionId}`);
    }

    console.log(`   Completed: ${new Date().toISOString()}`);
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Main deployment execution
   */
  async run() {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting deployment...');
      console.log(`Deployment ID: ${this.deploymentId}`);
      console.log('');

      // Step 1: Build the project
      const buildStats = await this.buildProject();

      // Step 2: Upload files to S3
      await this.uploadFiles();

      // Step 3: Clean up old files
      await this.cleanupOldFiles();

      // Step 4: Invalidate CloudFront cache
      await this.invalidateCache();

      // Step 5: Generate summary
      this.generateSummary(buildStats, startTime);

      console.log('\n🎉 Deployment completed successfully!');

      if (this.distributionId) {
        console.log(
          '\n🌐 Your site will be available at the CloudFront distribution URL'
        );
        console.log(
          '   Note: Changes may take 5-15 minutes to propagate globally'
        );
      }

      return {
        success: true,
        deploymentId: this.deploymentId,
        uploadedFiles: this.uploadedFiles.length,
        buildStats,
      };
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials are configured correctly');
      console.error('2. Check S3 bucket permissions');
      console.error('3. Ensure CloudFront distribution ID is correct');
      console.error('4. Verify the build completed successfully');

      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const deployment = new Deployment();

  deployment
    .run()
    .then(result => {
      console.log('\n✅ Deployment process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Deployment process failed:', error.message);
      process.exit(1);
    });
}

module.exports = Deployment;
