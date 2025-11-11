#!/usr/bin/env node

/**
 * Deploy Existing Build to Production S3
 * 
 * This script deploys an existing Next.js static export to the production S3 bucket
 * for task 8.2.2: Deploy website content to production S3 bucket
 */

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
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ExistingBuildDeployment {
  constructor() {
    // Use production configuration
    this.bucketName = 'mobile-marketing-site-prod-1759705011281-tyzuo9';
    this.distributionId = 'E2IBMHQ3GCW6ZK';
    this.cloudfrontDomain = 'd15sc9fc739ev2.cloudfront.net';
    this.region = 'us-east-1';
    this.buildDir = 'build-1760027172681'; // Use existing build
    this.environment = 'production';

    this.s3Client = new S3Client({ region: this.region });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });

    this.uploadedFiles = [];
    this.invalidationPaths = [];
    this.deploymentId = `prod-deploy-${Date.now()}`;

    console.log('🚀 Production Deployment Configuration:');
    console.log(`   Environment: ${this.environment}`);
    console.log(`   S3 Bucket: ${this.bucketName}`);
    console.log(`   CloudFront Distribution: ${this.distributionId}`);
    console.log(`   CloudFront Domain: ${this.cloudfrontDomain}`);
    console.log(`   Build Directory: ${this.buildDir}`);
    console.log(`   Deployment ID: ${this.deploymentId}`);
    console.log('');
  }

  /**
   * Validate build directory exists and has required files
   */
  validateBuild() {
    console.log('🔍 Validating build directory...');

    if (!fs.existsSync(this.buildDir)) {
      throw new Error(`Build directory not found: ${this.buildDir}`);
    }

    // Check for required files
    const requiredFiles = ['index.html'];
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(this.buildDir, file))
    );

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    // Get build statistics
    const buildStats = this.getBuildStats();
    console.log('✅ Build validation completed');
    console.log(`   Files: ${buildStats.fileCount}`);
    console.log(`   Total Size: ${this.formatBytes(buildStats.totalSize)}`);
    console.log('');

    return buildStats;
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

    // HTML files - short cache (5 minutes) for pretty URLs support
    if (ext === '.html') {
      return {
        'Cache-Control': 'public, max-age=300, must-revalidate',
      };
    }

    // Images - long cache (1 year)
    if (['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.avif'].includes(ext)) {
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
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
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
      '.xml': 'application/xml',
      '.txt': 'text/plain',
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
        'environment': this.environment,
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

    // Track files that need cache invalidation
    const isImageFile = /\.(webp|jpg|jpeg|png|gif|svg|ico|avif)$/i.test(s3Key);
    const isShortCacheFile = cacheHeaders['Cache-Control'].includes('max-age=300') ||
                            cacheHeaders['Cache-Control'].includes('no-cache');

    // Always invalidate HTML files and files with short cache times
    // Also invalidate image files to ensure updated images are served immediately
    if (isShortCacheFile || isImageFile) {
      this.invalidationPaths.push(`/${s3Key}`);
    }
  }

  /**
   * Upload all files to S3
   */
  async uploadFiles() {
    console.log('📤 Uploading files to S3...');

    const filesToUpload = [];

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

    console.log(`📋 Found ${filesToUpload.length} files to upload`);

    // Upload all files (for production deployment, we upload everything)
    let uploadedCount = 0;
    const totalFiles = filesToUpload.length;

    for (const file of filesToUpload) {
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
    console.log(`   Total Size: ${this.formatBytes(this.uploadedFiles.reduce((sum, f) => sum + f.size, 0))}`);
    console.log('');
  }

  /**
   * Invalidate CloudFront cache
   */
  async invalidateCache() {
    console.log('🔄 Invalidating CloudFront cache...');

    try {
      // For production deployment, invalidate all paths to ensure fresh content
      const pathsToInvalidate = ['/*'];

      console.log('   Invalidating all paths for production deployment');

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

      return result.Invalidation.Id;
    } catch (error) {
      console.error('❌ Cache invalidation failed:', error.message);
      console.error('   Deployment succeeded but cache may not be updated');
      throw error;
    }
  }

  /**
   * Validate deployment by checking key URLs
   */
  async validateDeployment() {
    console.log('🔍 Validating deployment...');

    const testUrls = [
      `https://${this.cloudfrontDomain}/`,
      `https://${this.cloudfrontDomain}/about/`,
      `https://${this.cloudfrontDomain}/contact/`,
      `https://${this.cloudfrontDomain}/privacy-policy/`,
    ];

    const validationResults = [];

    for (const url of testUrls) {
      try {
        const response = await this.makeHttpRequest(url);
        const isSuccess = response.statusCode === 200;
        
        validationResults.push({
          url,
          statusCode: response.statusCode,
          success: isSuccess,
          responseTime: response.responseTime,
        });

        if (isSuccess) {
          console.log(`   ✅ ${url} - OK (${response.responseTime}ms)`);
        } else {
          console.log(`   ⚠️  ${url} - HTTP ${response.statusCode} (${response.responseTime}ms)`);
        }
      } catch (error) {
        console.log(`   ❌ ${url} - Error: ${error.message}`);
        validationResults.push({
          url,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = validationResults.filter(r => r.success).length;
    console.log(`✅ Validation completed: ${successCount}/${testUrls.length} URLs accessible`);
    console.log('');

    return validationResults;
  }

  /**
   * Make HTTP request with timeout
   */
  async makeHttpRequest(url, options = {}) {
    const https = require('https');
    const { URL } = require('url');

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const urlObj = new URL(url);

      const req = https.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 10000,
        ...options,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            responseTime: Date.now() - startTime,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  /**
   * Generate deployment summary
   */
  generateSummary(buildStats, startTime, validationResults) {
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
    console.log(`   CloudFront Distribution: ${this.distributionId}`);
    console.log(`   CloudFront Domain: ${this.cloudfrontDomain}`);
    
    const successfulUrls = validationResults.filter(r => r.success).length;
    console.log(`   URL Validation: ${successfulUrls}/${validationResults.length} successful`);
    console.log(`   Completed: ${new Date().toISOString()}`);
    console.log('');

    // Save deployment log
    const deploymentLog = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      buildStats,
      uploadedFiles: this.uploadedFiles.length,
      duration,
      validation: validationResults,
      infrastructure: {
        bucketName: this.bucketName,
        distributionId: this.distributionId,
        cloudfrontDomain: this.cloudfrontDomain,
      },
    };

    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logPath = path.join(logsDir, `production-deployment-${this.deploymentId}.json`);
    fs.writeFileSync(logPath, JSON.stringify(deploymentLog, null, 2));
    console.log(`📝 Deployment log saved: ${logPath}`);
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
      console.log('🚀 Starting production deployment to S3...');
      console.log('');

      // Step 1: Validate build
      const buildStats = this.validateBuild();

      // Step 2: Upload files to S3
      await this.uploadFiles();

      // Step 3: Invalidate CloudFront cache
      await this.invalidateCache();

      // Step 4: Validate deployment
      const validationResults = await this.validateDeployment();

      // Step 5: Generate summary
      this.generateSummary(buildStats, startTime, validationResults);

      console.log('🎉 Production deployment completed successfully!');
      console.log('');
      console.log('🌐 Your website is now live at:');
      console.log(`   https://${this.cloudfrontDomain}/`);
      console.log('');
      console.log('📋 Key URLs:');
      console.log(`   Home: https://${this.cloudfrontDomain}/`);
      console.log(`   About: https://${this.cloudfrontDomain}/about/`);
      console.log(`   Contact: https://${this.cloudfrontDomain}/contact/`);
      console.log(`   Privacy: https://${this.cloudfrontDomain}/privacy-policy/`);
      console.log('');
      console.log('⏳ Note: Changes may take 5-15 minutes to propagate globally');

      return {
        success: true,
        deploymentId: this.deploymentId,
        uploadedFiles: this.uploadedFiles.length,
        buildStats,
        validationResults,
      };
    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials are configured correctly');
      console.error('2. Check S3 bucket permissions');
      console.error('3. Ensure CloudFront distribution ID is correct');
      console.error('4. Verify the build directory exists and contains files');

      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const deployment = new ExistingBuildDeployment();

  deployment
    .run()
    .then((result) => {
      console.log('\n✅ Deployment process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment process failed:', error.message);
      process.exit(1);
    });
}

module.exports = ExistingBuildDeployment;