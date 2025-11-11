#!/usr/bin/env node

/**
 * GTM + GA4 Deployment Script
 * 
 * Deploys the website with GTM and GA4 smart event tracking,
 * then validates the implementation.
 */

const { execSync } = require('child_process');
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');

class GTMDeployment {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.buildDir = 'out';
    
    this.s3Client = new S3Client({ region: this.region });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
    
    this.deploymentId = `gtm-deploy-${Date.now()}`;
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const icons = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      deploy: '🚀',
      build: '🔨',
      upload: '📤',
      cache: '🔄',
      test: '🧪'
    };
    
    console.log(`${icons[type] || '📋'} ${message}`);
  }

  async validateConfiguration() {
    this.log('Validating GTM + GA4 configuration...', 'info');
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_GTM_ID',
      'NEXT_PUBLIC_GA_ID'
    ];
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
    
    // Check layout.tsx for GTM implementation
    const layoutPath = 'src/app/layout.tsx';
    if (!fs.existsSync(layoutPath)) {
      throw new Error('Layout file not found: src/app/layout.tsx');
    }
    
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    const requiredElements = [
      'GTM-W7L94JHW',
      'googletagmanager.com/gtm.js',
      'scroll_depth',
      'outbound_click',
      'form_submission',
      'engaged_session'
    ];
    
    const missingElements = requiredElements.filter(element => !layoutContent.includes(element));
    if (missingElements.length > 0) {
      throw new Error(`Missing GTM elements in layout: ${missingElements.join(', ')}`);
    }
    
    this.log('Configuration validation passed', 'success');
  }

  async buildSite() {
    this.log('Building Next.js site with GTM + GA4...', 'build');
    
    try {
      // Clean previous build
      if (fs.existsSync(this.buildDir)) {
        execSync(`rmdir /s /q ${this.buildDir}`, { stdio: 'inherit' });
      }
      
      // Build the site
      execSync('npm run build', { stdio: 'inherit' });
      
      // Verify build output
      if (!fs.existsSync(this.buildDir)) {
        throw new Error('Build directory not created');
      }
      
      const files = this.getAllFiles(this.buildDir);
      this.log(`Build completed: ${files.length} files generated`, 'success');
      
      return files;
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

  async verifyGTMInBuild() {
    this.log('Verifying GTM implementation in build output...', 'test');
    
    const htmlFiles = this.getAllFiles(this.buildDir).filter(file => file.endsWith('.html'));
    
    if (htmlFiles.length === 0) {
      throw new Error('No HTML files found in build output');
    }
    
    let gtmFound = 0;
    let noscriptFound = 0;
    
    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(htmlFile, 'utf8');
      
      if (content.includes('GTM-W7L94JHW')) {
        gtmFound++;
      }
      
      if (content.includes('googletagmanager.com/ns.html')) {
        noscriptFound++;
      }
    }
    
    this.log(`GTM verification: ${gtmFound}/${htmlFiles.length} HTML files contain GTM`, 'info');
    this.log(`Noscript verification: ${noscriptFound}/${htmlFiles.length} HTML files contain noscript`, 'info');
    
    if (gtmFound === 0) {
      throw new Error('GTM code not found in any HTML files');
    }
    
    this.log('GTM implementation verified in build', 'success');
  }

  async uploadToS3(files) {
    this.log(`Uploading ${files.length} files to S3...`, 'upload');
    
    let uploaded = 0;
    const batchSize = 10;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const uploadPromises = batch.map(file => this.uploadFile(file));
      
      await Promise.all(uploadPromises);
      uploaded += batch.length;
      
      if (uploaded % 50 === 0 || uploaded === files.length) {
        this.log(`Uploaded ${uploaded}/${files.length} files`, 'info');
      }
    }
    
    this.log('S3 upload completed', 'success');
  }

  async uploadFile(filePath) {
    const key = path.relative(this.buildDir, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath);
    
    const contentType = this.getContentType(filePath);
    const cacheControl = this.getCacheControl(filePath);
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: content,
      ContentType: contentType,
      CacheControl: cacheControl,
    });
    
    await this.s3Client.send(command);
  }

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
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain',
      '.xml': 'application/xml'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  getCacheControl(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    // HTML files - no cache to ensure GTM updates are immediate
    if (ext === '.html') {
      return 'no-cache, no-store, must-revalidate';
    }
    
    // Static assets - long cache
    if (['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'].includes(ext)) {
      return 'public, max-age=31536000, immutable';
    }
    
    // Default - short cache
    return 'public, max-age=3600';
  }

  async invalidateCloudFront() {
    this.log('Invalidating CloudFront cache...', 'cache');
    
    const command = new CreateInvalidationCommand({
      DistributionId: this.distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: 2,
          Items: ['/', '/*']
        },
        CallerReference: this.deploymentId
      }
    });
    
    const result = await this.cloudFrontClient.send(command);
    
    this.log(`Cache invalidation started: ${result.Invalidation.Id}`, 'success');
    this.log('Note: Invalidation may take 5-15 minutes to complete', 'info');
    
    return result.Invalidation.Id;
  }

  async generateValidationReport() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      duration: `${duration} seconds`,
      configuration: {
        gtmId: 'GTM-W7L94JHW',
        ga4Id: 'G-QJXSCJ0L43',
        s3Bucket: this.bucketName,
        cloudFrontDistribution: this.distributionId
      },
      smartEvents: [
        'scroll_depth (25%, 50%, 75%, 100%)',
        'outbound_click (external links)',
        'form_submission (contact forms)',
        'engaged_session (30s timer)'
      ],
      nextSteps: [
        '1. Configure GTM tags and triggers manually',
        '2. Publish GTM container',
        '3. Mark events as conversions in GA4',
        '4. Test with Google Tag Assistant',
        '5. Verify in GA4 Realtime reports'
      ],
      testUrls: [
        'https://d15sc9fc739ev2.cloudfront.net/',
        'https://d15sc9fc739ev2.cloudfront.net/contact/',
        'https://d15sc9fc739ev2.cloudfront.net/services/'
      ]
    };
    
    const reportPath = `gtm-deployment-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Deployment report saved: ${reportPath}`, 'success');
    return report;
  }

  async deploy() {
    try {
      this.log(`Starting GTM + GA4 deployment...`, 'deploy');
      this.log(`Deployment ID: ${this.deploymentId}`, 'info');
      
      // Validate configuration
      await this.validateConfiguration();
      
      // Build site
      const files = await this.buildSite();
      
      // Verify GTM in build
      await this.verifyGTMInBuild();
      
      // Upload to S3
      await this.uploadToS3(files);
      
      // Invalidate CloudFront
      const invalidationId = await this.invalidateCloudFront();
      
      // Generate report
      const report = await this.generateValidationReport();
      
      this.log('GTM + GA4 deployment completed successfully!', 'success');
      this.log('', 'info');
      this.log('🎯 Next Manual Steps:', 'info');
      this.log('1. Run: node scripts/setup-gtm-ga4-configuration.js', 'info');
      this.log('2. Configure GTM tags/triggers in Google Tag Manager', 'info');
      this.log('3. Publish GTM container', 'info');
      this.log('4. Mark events as conversions in GA4', 'info');
      this.log('5. Test with Google Tag Assistant', 'info');
      this.log('', 'info');
      this.log(`🌐 Test URL: https://d15sc9fc739ev2.cloudfront.net/`, 'info');
      
      return report;
      
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployment = new GTMDeployment();
  deployment.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = GTMDeployment;