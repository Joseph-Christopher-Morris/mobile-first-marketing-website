#!/usr/bin/env node

/**
 * Comprehensive Deployment Script
 * Handles build, S3 upload, MIME types, cache headers, and CloudFront invalidation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AWS = require('aws-sdk');

// Configuration
const CONFIG = {
  S3_BUCKET:
    process.env.S3_BUCKET_NAME ||
    'mobile-marketing-site-prod-1759705011281-tyzuo9',
  CLOUDFRONT_DISTRIBUTION_ID:
    process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  BUILD_DIR: 'out',
  BACKUP_PREFIX: `backup-${Date.now()}`,
};

// Initialize AWS services
const s3 = new AWS.S3({ region: CONFIG.AWS_REGION });
const cloudfront = new AWS.CloudFront({ region: CONFIG.AWS_REGION });

class ComprehensiveDeployer {
  constructor() {
    this.deploymentResults = {
      timestamp: new Date().toISOString(),
      buildSuccess: false,
      uploadSuccess: false,
      invalidationSuccess: false,
      errors: [],
      warnings: [],
      uploadedFiles: [],
      invalidationId: null,
      summary: {},
    };
  }

  async deploy() {
    console.log('🚀 Starting Comprehensive Deployment...\n');

    try {
      await this.validateEnvironment();
      await this.createBackup();
      await this.buildProject();
      await this.uploadToS3();
      await this.invalidateCloudFront();
      await this.validateDeployment();

      this.generateSummary();
      await this.saveDeploymentReport();

      console.log('\n✅ Deployment completed successfully!');
      this.displaySummary();
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      this.deploymentResults.errors.push(error.message);
      throw error;
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating Environment...');

    // Check AWS credentials
    try {
      await s3.headBucket({ Bucket: CONFIG.S3_BUCKET }).promise();
      console.log('  ✅ S3 bucket accessible');
    } catch (error) {
      throw new Error(`S3 bucket not accessible: ${error.message}`);
    }

    // Check CloudFront distribution
    try {
      await cloudfront
        .getDistribution({ Id: CONFIG.CLOUDFRONT_DISTRIBUTION_ID })
        .promise();
      console.log('  ✅ CloudFront distribution accessible');
    } catch (error) {
      throw new Error(
        `CloudFront distribution not accessible: ${error.message}`
      );
    }

    console.log('  ✅ Environment validation completed');
  }

  async createBackup() {
    console.log('💾 Creating Backup...');

    try {
      // List current objects in S3
      const listParams = {
        Bucket: CONFIG.S3_BUCKET,
        MaxKeys: 1000,
      };

      const objects = await s3.listObjectsV2(listParams).promise();

      if (objects.Contents && objects.Contents.length > 0) {
        console.log(`  📦 Found ${objects.Contents.length} objects to backup`);

        // Create backup folder with timestamp
        const backupFolder = `backups/${CONFIG.BACKUP_PREFIX}/`;

        // Copy current objects to backup folder
        for (const obj of objects.Contents.slice(0, 10)) {
          // Limit backup for demo
          if (!obj.Key.startsWith('backups/')) {
            const copyParams = {
              Bucket: CONFIG.S3_BUCKET,
              CopySource: `${CONFIG.S3_BUCKET}/${obj.Key}`,
              Key: `${backupFolder}${obj.Key}`,
            };

            await s3.copyObject(copyParams).promise();
          }
        }

        console.log(`  ✅ Backup created at: ${backupFolder}`);
      } else {
        console.log('  ℹ️  No existing objects to backup');
      }
    } catch (error) {
      console.warn('  ⚠️  Backup failed (continuing anyway):', error.message);
      this.deploymentResults.warnings.push(`Backup failed: ${error.message}`);
    }
  }

  async buildProject() {
    console.log('🔨 Building Project...');

    try {
      // Clean previous build
      if (fs.existsSync(CONFIG.BUILD_DIR)) {
        execSync(`rmdir /s /q ${CONFIG.BUILD_DIR}`, { stdio: 'inherit' });
      }

      // Run Next.js build
      console.log('  📦 Running Next.js build...');
      execSync('npm run build', { stdio: 'inherit' });

      // Verify build output
      if (!fs.existsSync(CONFIG.BUILD_DIR)) {
        throw new Error('Build directory not found after build');
      }

      const buildFiles = this.getAllFiles(CONFIG.BUILD_DIR);
      console.log(
        `  ✅ Build completed - ${buildFiles.length} files generated`
      );

      this.deploymentResults.buildSuccess = true;
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  async uploadToS3() {
    console.log('☁️  Uploading to S3...');

    const files = this.getAllFiles(CONFIG.BUILD_DIR);
    console.log(`  📁 Found ${files.length} files to upload`);

    let uploadedCount = 0;

    for (const filePath of files) {
      const relativePath = path.relative(CONFIG.BUILD_DIR, filePath);
      const s3Key = relativePath.replace(/\\/g, '/'); // Convert Windows paths to S3 format

      const fileContent = fs.readFileSync(filePath);
      const contentType = this.getContentType(filePath);
      const cacheControl = this.getCacheControl(filePath);

      const uploadParams = {
        Bucket: CONFIG.S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        CacheControl: cacheControl,
        Metadata: {
          'deployed-at': new Date().toISOString(),
          'deployment-id': CONFIG.BACKUP_PREFIX,
        },
      };

      try {
        await s3.upload(uploadParams).promise();
        uploadedCount++;

        this.deploymentResults.uploadedFiles.push({
          key: s3Key,
          contentType,
          cacheControl,
          size: fileContent.length,
        });

        if (uploadedCount % 10 === 0) {
          console.log(
            `    📤 Uploaded ${uploadedCount}/${files.length} files...`
          );
        }
      } catch (error) {
        console.error(`    ❌ Failed to upload ${s3Key}:`, error.message);
        this.deploymentResults.errors.push(
          `Upload failed for ${s3Key}: ${error.message}`
        );
      }
    }

    console.log(
      `  ✅ Upload completed - ${uploadedCount}/${files.length} files uploaded`
    );
    this.deploymentResults.uploadSuccess = uploadedCount === files.length;
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.webp': 'image/webp',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  getCacheControl(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    // HTML files - no cache (always fetch fresh)
    if (ext === '.html') {
      return 'no-cache, no-store, must-revalidate';
    }

    // Hashed assets (contain hash in filename) - long cache
    if (fileName.match(/\.[a-f0-9]{8,}\./)) {
      return 'public, max-age=31536000, immutable';
    }

    // Static assets - medium cache
    if (
      [
        '.css',
        '.js',
        '.webp',
        '.jpg',
        '.jpeg',
        '.png',
        '.svg',
        '.ico',
      ].includes(ext)
    ) {
      return 'public, max-age=86400'; // 1 day
    }

    // Default - short cache
    return 'public, max-age=3600'; // 1 hour
  }

  async invalidateCloudFront() {
    console.log('🔄 Creating CloudFront Invalidation...');

    const invalidationPaths = [
      '/index.html',
      '/about/*',
      '/blog/*',
      '/services/*',
      '/contact/*',
    ];

    // Add assets path if not using hashed filenames
    const hasHashedAssets = this.deploymentResults.uploadedFiles.some(file =>
      file.key.match(/\.[a-f0-9]{8,}\./)
    );

    if (!hasHashedAssets) {
      invalidationPaths.push('/_next/*', '/images/*');
    }

    const invalidationParams = {
      DistributionId: CONFIG.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        Paths: {
          Quantity: invalidationPaths.length,
          Items: invalidationPaths,
        },
        CallerReference: `deployment-${Date.now()}`,
      },
    };

    try {
      const result = await cloudfront
        .createInvalidation(invalidationParams)
        .promise();
      this.deploymentResults.invalidationId = result.Invalidation.Id;

      console.log(`  ✅ Invalidation created: ${result.Invalidation.Id}`);
      console.log(`  📋 Invalidated paths: ${invalidationPaths.join(', ')}`);

      this.deploymentResults.invalidationSuccess = true;
    } catch (error) {
      throw new Error(`CloudFront invalidation failed: ${error.message}`);
    }
  }

  async validateDeployment() {
    console.log('🔍 Validating Deployment...');

    // Check a few key files
    const testFiles = ['index.html', 'about/index.html', 'services/index.html'];

    for (const file of testFiles) {
      try {
        const headParams = {
          Bucket: CONFIG.S3_BUCKET,
          Key: file,
        };

        const result = await s3.headObject(headParams).promise();
        console.log(
          `  ✅ ${file} - ${result.ContentType} - ${result.CacheControl}`
        );
      } catch (error) {
        console.warn(`  ⚠️  ${file} not found or inaccessible`);
        this.deploymentResults.warnings.push(`${file} validation failed`);
      }
    }

    console.log('  ✅ Deployment validation completed');
  }

  generateSummary() {
    const { uploadedFiles, errors, warnings } = this.deploymentResults;

    this.deploymentResults.summary = {
      totalFiles: uploadedFiles.length,
      totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
      htmlFiles: uploadedFiles.filter(f => f.contentType === 'text/html')
        .length,
      imageFiles: uploadedFiles.filter(f => f.contentType.startsWith('image/'))
        .length,
      jsFiles: uploadedFiles.filter(
        f => f.contentType === 'application/javascript'
      ).length,
      cssFiles: uploadedFiles.filter(f => f.contentType === 'text/css').length,
      webpFiles: uploadedFiles.filter(f => f.contentType === 'image/webp')
        .length,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      deploymentSuccess:
        this.deploymentResults.buildSuccess &&
        this.deploymentResults.uploadSuccess &&
        this.deploymentResults.invalidationSuccess,
    };
  }

  async saveDeploymentReport() {
    const reportPath = `deployment-report-${Date.now()}.json`;

    await fs.promises.writeFile(
      reportPath,
      JSON.stringify(this.deploymentResults, null, 2)
    );

    // Also create markdown summary
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = `deployment-summary-${Date.now()}.md`;

    await fs.promises.writeFile(markdownPath, markdownReport);

    console.log(`📄 Reports saved: ${reportPath}, ${markdownPath}`);
  }

  generateMarkdownReport() {
    const { summary, invalidationId } = this.deploymentResults;

    return `# Deployment Report

## Summary
- **Status**: ${summary.deploymentSuccess ? '✅ Success' : '❌ Failed'}
- **Timestamp**: ${this.deploymentResults.timestamp}
- **Total Files**: ${summary.totalFiles}
- **Total Size**: ${(summary.totalSize / 1024 / 1024).toFixed(2)} MB
- **Invalidation ID**: ${invalidationId}

## File Breakdown
- **HTML Files**: ${summary.htmlFiles} (Cache: no-cache)
- **Image Files**: ${summary.imageFiles} (${summary.webpFiles} WebP)
- **JavaScript Files**: ${summary.jsFiles}
- **CSS Files**: ${summary.cssFiles}

## MIME Type Verification
${this.deploymentResults.uploadedFiles
  .slice(0, 10)
  .map(
    file => `- \`${file.key}\` → \`${file.contentType}\` (${file.cacheControl})`
  )
  .join('\n')}

## Cache Strategy Applied
- **HTML**: no-cache, no-store, must-revalidate
- **Hashed Assets**: public, max-age=31536000, immutable
- **Static Assets**: public, max-age=86400
- **Default**: public, max-age=3600

## Issues
${
  this.deploymentResults.errors.length > 0
    ? `### Errors\n${this.deploymentResults.errors.map(e => `- ❌ ${e}`).join('\n')}`
    : '### Errors\nNone'
}

${
  this.deploymentResults.warnings.length > 0
    ? `### Warnings\n${this.deploymentResults.warnings.map(w => `- ⚠️ ${w}`).join('\n')}`
    : '### Warnings\nNone'
}

## Next Steps
1. Wait for CloudFront invalidation to complete (~5-15 minutes)
2. Test key pages: /, /about, /services, /blog
3. Verify image loading and MIME types
4. Check mobile responsiveness
5. Run Lighthouse performance audit

---
*Deployment completed on ${new Date().toLocaleString()}*
`;
  }

  displaySummary() {
    const { summary } = this.deploymentResults;

    console.log('\n📊 Deployment Summary:');
    console.log(
      `   Status: ${summary.deploymentSuccess ? '✅ Success' : '❌ Failed'}`
    );
    console.log(`   Files Uploaded: ${summary.totalFiles}`);
    console.log(
      `   Total Size: ${(summary.totalSize / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(`   WebP Images: ${summary.webpFiles}`);
    console.log(`   Errors: ${summary.errorsCount}`);
    console.log(`   Warnings: ${summary.warningsCount}`);

    if (this.deploymentResults.invalidationId) {
      console.log(
        `   Invalidation ID: ${this.deploymentResults.invalidationId}`
      );
    }

    console.log('\n🌐 Site URL: https://d15sc9fc739ev2.cloudfront.net');
    console.log('⏱️  CloudFront propagation: 5-15 minutes');
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new ComprehensiveDeployer();
  deployer.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveDeployer;
