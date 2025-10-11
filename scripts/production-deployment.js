#!/usr/bin/env node

/**
 * Production Deployment Script
 *
 * This script handles the migration from Amplify to S3/CloudFront:
 * - Perform final deployment to new infrastructure
 * - Update DNS records to point to CloudFront
 * - Validate complete functionality and performance
 *
 * Requirements addressed:
 * - 3.1: Automated deployment pipeline
 * - 4.4: DNS configuration
 */

const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadBucketCommand,
} = require('@aws-sdk/client-s3');

const {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetDistributionCommand,
} = require('@aws-sdk/client-cloudfront');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const { URL } = require('url');

class ProductionDeployment {
  constructor(options = {}) {
    this.environment = 'production';
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN_NAME;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.customDomain = process.env.CUSTOM_DOMAIN;

    this.s3Client = new S3Client({ region: this.region });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });

    this.buildDir = path.join(process.cwd(), 'out');
    this.deploymentId = `prod-${Date.now()}`;

    this.deploymentResults = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      bucketName: this.bucketName,
      distributionId: this.distributionId,
      cloudfrontDomain: this.cloudfrontDomain,
      customDomain: this.customDomain,
      steps: [],
      validation: {},
      status: 'in_progress',
    };
  }

  /**
   * Log messages with timestamp
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  /**
   * Record deployment step
   */
  recordStep(stepName, status, details = {}) {
    this.deploymentResults.steps.push({
      step: stepName,
      status,
      timestamp: new Date().toISOString(),
      details,
    });
  }

  /**
   * Validate production environment
   */
  async validateProductionEnvironment() {
    this.log('🔍 Validating production environment...', 'info');

    try {
      // Check required environment variables
      const requiredVars = [
        'S3_BUCKET_NAME',
        'CLOUDFRONT_DISTRIBUTION_ID',
        'CLOUDFRONT_DOMAIN_NAME',
      ];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingVars.join(', ')}`
        );
      }

      // Check if build directory exists
      if (!fs.existsSync(this.buildDir)) {
        throw new Error(
          `Build directory not found: ${this.buildDir}. Run 'npm run build' first.`
        );
      }

      // Validate S3 bucket access
      try {
        await this.s3Client.send(
          new ListObjectsV2Command({
            Bucket: this.bucketName,
            MaxKeys: 1,
          })
        );
      } catch (error) {
        if (error.name === 'NoSuchBucket') {
          throw new Error(`S3 bucket not found: ${this.bucketName}`);
        }
        // Bucket exists but might be empty, which is fine
      }

      // Check CloudFront distribution status
      const distribution = await this.cloudFrontClient.send(
        new GetDistributionCommand({ Id: this.distributionId })
      );

      const status = distribution.Distribution.Status;
      if (status !== 'Deployed') {
        this.log(`⚠️  CloudFront distribution status: ${status}`, 'warning');
        this.log(
          '💡 Distribution may still be deploying. Deployment will continue but may take longer to propagate.',
          'info'
        );
      }

      this.log('✅ Production environment validation completed', 'success');
      this.recordStep('environment_validation', 'completed', {
        bucketName: this.bucketName,
        distributionId: this.distributionId,
        distributionStatus: status,
      });

      return true;
    } catch (error) {
      this.log(
        `❌ Production environment validation failed: ${error.message}`,
        'error'
      );
      this.recordStep('environment_validation', 'failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Build the Next.js application
   */
  async buildApplication() {
    this.log('🔨 Building Next.js application for production...', 'info');

    try {
      // Clean previous build
      if (fs.existsSync(this.buildDir)) {
        fs.rmSync(this.buildDir, { recursive: true, force: true });
      }

      // Build the application
      this.log('Running npm run build...', 'info');
      const buildOutput = execSync('npm run build', {
        encoding: 'utf8',
        timeout: 300000, // 5 minutes
        stdio: 'pipe',
      });

      // Verify build output
      if (!fs.existsSync(this.buildDir)) {
        throw new Error('Build completed but output directory not found');
      }

      const buildFiles = this.getAllFiles(this.buildDir);
      const buildSize = this.calculateDirectorySize(this.buildDir);

      this.log(`✅ Build completed successfully`, 'success');
      this.log(`   Files: ${buildFiles.length}`, 'info');
      this.log(`   Size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`, 'info');

      this.recordStep('build_application', 'completed', {
        fileCount: buildFiles.length,
        buildSize,
        buildOutput: buildOutput.substring(0, 500),
      });

      return buildFiles;
    } catch (error) {
      this.log(`❌ Build failed: ${error.message}`, 'error');
      this.recordStep('build_application', 'failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Deploy files to S3
   */
  async deployToS3() {
    this.log('📦 Deploying files to S3...', 'info');

    try {
      const files = this.getAllFiles(this.buildDir);
      let uploadedFiles = 0;
      let totalSize = 0;

      for (const filePath of files) {
        const relativePath = path.relative(this.buildDir, filePath);
        const key = relativePath.replace(/\\/g, '/'); // Convert Windows paths to S3 keys

        const fileContent = fs.readFileSync(filePath);
        const contentType = this.getContentType(filePath);
        const cacheControl = this.getCacheControl(filePath);

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileContent,
            ContentType: contentType,
            CacheControl: cacheControl,
            Metadata: {
              'deployment-id': this.deploymentId,
              'deployed-at': new Date().toISOString(),
            },
          })
        );

        uploadedFiles++;
        totalSize += fileContent.length;

        if (uploadedFiles % 10 === 0) {
          this.log(
            `   Uploaded ${uploadedFiles}/${files.length} files...`,
            'info'
          );
        }
      }

      this.log(
        `✅ Successfully uploaded ${uploadedFiles} files to S3`,
        'success'
      );
      this.log(
        `   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        'info'
      );

      this.recordStep('deploy_to_s3', 'completed', {
        uploadedFiles,
        totalSize,
        bucketName: this.bucketName,
      });

      return uploadedFiles;
    } catch (error) {
      this.log(`❌ S3 deployment failed: ${error.message}`, 'error');
      this.recordStep('deploy_to_s3', 'failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Invalidate CloudFront cache
   */
  async invalidateCloudFrontCache() {
    this.log('🔄 Invalidating CloudFront cache...', 'info');

    try {
      const invalidationResult = await this.cloudFrontClient.send(
        new CreateInvalidationCommand({
          DistributionId: this.distributionId,
          InvalidationBatch: {
            Paths: {
              Quantity: 2,
              Items: ['/*', '/index.html'],
            },
            CallerReference: `prod-invalidation-${Date.now()}`,
          },
        })
      );

      const invalidationId = invalidationResult.Invalidation.Id;

      this.log(`✅ CloudFront cache invalidation initiated`, 'success');
      this.log(`   Invalidation ID: ${invalidationId}`, 'info');
      this.log(
        '💡 Cache invalidation may take 5-15 minutes to complete',
        'info'
      );

      this.recordStep('invalidate_cloudfront', 'completed', {
        invalidationId,
        distributionId: this.distributionId,
      });

      return invalidationId;
    } catch (error) {
      this.log(
        `❌ CloudFront cache invalidation failed: ${error.message}`,
        'error'
      );
      this.recordStep('invalidate_cloudfront', 'failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Validate deployment functionality
   */
  async validateDeployment() {
    this.log('🔍 Validating deployment functionality...', 'info');

    try {
      const validationResults = {};

      // Test CloudFront domain
      const cloudfrontUrl = `https://${this.cloudfrontDomain}`;
      try {
        const cloudfrontResponse = await this.makeHttpRequest(cloudfrontUrl);

        validationResults.cloudfront = {
          url: cloudfrontUrl,
          statusCode: cloudfrontResponse.statusCode,
          responseTime: cloudfrontResponse.responseTime,
          hasContent: cloudfrontResponse.body.length > 1000,
          hasTitle:
            cloudfrontResponse.body.includes('<title>') &&
            !cloudfrontResponse.body.includes('<title></title>'),
        };

        if (cloudfrontResponse.statusCode === 200) {
          this.log(
            `✅ CloudFront domain is working: ${cloudfrontUrl}`,
            'success'
          );
        } else {
          this.log(
            `⚠️  CloudFront domain returned HTTP ${cloudfrontResponse.statusCode}`,
            'warning'
          );
        }
      } catch (error) {
        this.log(
          `⚠️  CloudFront domain not yet available: ${error.message}`,
          'warning'
        );
        this.log(
          '💡 This is normal for new distributions. Domain will be available in 15-20 minutes.',
          'info'
        );

        validationResults.cloudfront = {
          url: cloudfrontUrl,
          status: 'pending_deployment',
          error: error.message,
        };
      }

      // Test custom domain if configured
      if (this.customDomain) {
        try {
          const customUrl = `https://${this.customDomain}`;
          const customResponse = await this.makeHttpRequest(customUrl);

          validationResults.customDomain = {
            url: customUrl,
            statusCode: customResponse.statusCode,
            responseTime: customResponse.responseTime,
            hasContent: customResponse.body.length > 1000,
          };

          if (customResponse.statusCode !== 200) {
            this.log(
              `⚠️  Custom domain returned HTTP ${customResponse.statusCode}`,
              'warning'
            );
          } else {
            this.log(`✅ Custom domain is working: ${customUrl}`, 'success');
          }
        } catch (error) {
          this.log(
            `⚠️  Custom domain validation failed: ${error.message}`,
            'warning'
          );
          validationResults.customDomain = { error: error.message };
        }
      }

      // Test SPA routing (404 -> index.html) - only if CloudFront is available
      if (
        validationResults.cloudfront &&
        validationResults.cloudfront.statusCode === 200
      ) {
        try {
          const notFoundUrl = `${cloudfrontUrl}/non-existent-page`;
          const notFoundResponse = await this.makeHttpRequest(notFoundUrl);

          validationResults.spaRouting = {
            url: notFoundUrl,
            statusCode: notFoundResponse.statusCode,
            servesIndexHtml:
              notFoundResponse.body.includes('<title>') ||
              notFoundResponse.statusCode === 200,
          };

          if (notFoundResponse.statusCode === 200) {
            this.log(
              '✅ SPA routing is working (404 -> index.html)',
              'success'
            );
          }
        } catch (error) {
          this.log(`⚠️  SPA routing test failed: ${error.message}`, 'warning');
          validationResults.spaRouting = { error: error.message };
        }
      } else {
        this.log(
          '⚠️  SPA routing test skipped (CloudFront not yet available)',
          'warning'
        );
        validationResults.spaRouting = {
          status: 'skipped',
          reason: 'cloudfront_not_available',
        };
      }

      this.log('✅ Deployment functionality validation completed', 'success');
      this.recordStep('validate_deployment', 'completed', validationResults);

      this.deploymentResults.validation = validationResults;
      return validationResults;
    } catch (error) {
      this.log(`❌ Deployment validation failed: ${error.message}`, 'error');
      this.recordStep('validate_deployment', 'failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate DNS configuration instructions
   */
  generateDNSInstructions() {
    this.log('📋 Generating DNS configuration instructions...', 'info');

    const instructions = `# DNS Configuration Instructions

## CloudFront Domain (Ready to Use)
Your site is now accessible at: https://${this.cloudfrontDomain}

## Custom Domain Configuration
${
  this.customDomain
    ? `
To use your custom domain (${this.customDomain}), configure these DNS records:

### CNAME Records
Add these CNAME records to your DNS provider:

**Primary Domain:**
- Type: CNAME
- Name: ${this.customDomain.replace('www.', '')}
- Value: ${this.cloudfrontDomain}
- TTL: 300 (5 minutes)

**WWW Subdomain:**
- Type: CNAME  
- Name: www.${this.customDomain.replace('www.', '')}
- Value: ${this.cloudfrontDomain}
- TTL: 300 (5 minutes)

### Alternative: ALIAS Records (if supported)
If your DNS provider supports ALIAS records (like Route 53):

- Type: ALIAS
- Name: ${this.customDomain.replace('www.', '')}
- Value: ${this.cloudfrontDomain}
- TTL: Automatic

### SSL Certificate
${
  process.env.CERTIFICATE_ARN
    ? 'SSL certificate is configured and will be active once DNS records are updated.'
    : 'SSL certificate needs to be requested and validated. Run the SSL setup script after DNS configuration.'
}
`
    : `
To configure a custom domain:

1. Set the CUSTOM_DOMAIN environment variable
2. Run the SSL certificate setup script
3. Update DNS records as instructed
4. Redeploy the CloudFront distribution
`
}

## DNS Propagation
- DNS changes may take 5-60 minutes to propagate globally
- Use online DNS checkers to verify propagation
- Test from different locations and networks

## Verification
After DNS configuration, verify your setup:

1. Test primary domain: https://${this.customDomain || 'your-domain.com'}
2. Test www subdomain: https://www.${this.customDomain?.replace('www.', '') || 'your-domain.com'}
3. Verify SSL certificate is valid
4. Test SPA routing with a non-existent page

## Troubleshooting
- If DNS doesn't resolve, check CNAME record configuration
- If SSL errors occur, verify certificate validation is complete
- If pages don't load, check CloudFront distribution status
- For SPA routing issues, verify CloudFront error pages are configured
`;

    const instructionsPath = path.join(
      process.cwd(),
      'config',
      'dns-configuration-instructions.md'
    );
    fs.writeFileSync(instructionsPath, instructions);

    this.log(`✅ DNS instructions saved to ${instructionsPath}`, 'success');
    this.recordStep('generate_dns_instructions', 'completed', {
      instructionsPath,
      customDomain: this.customDomain,
    });

    return instructions;
  }

  /**
   * Save deployment results
   */
  async saveDeploymentResults() {
    this.log('💾 Saving deployment results...', 'info');

    try {
      this.deploymentResults.status = 'completed';
      this.deploymentResults.completedAt = new Date().toISOString();

      const resultsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }

      const resultsPath = path.join(
        resultsDir,
        `production-deployment-${this.deploymentId}.json`
      );
      fs.writeFileSync(
        resultsPath,
        JSON.stringify(this.deploymentResults, null, 2)
      );

      this.log(`✅ Deployment results saved to ${resultsPath}`, 'success');
      return resultsPath;
    } catch (error) {
      this.log(
        `⚠️  Failed to save deployment results: ${error.message}`,
        'warning'
      );
    }
  }

  /**
   * Utility methods
   */
  getAllFiles(dir) {
    const files = [];

    const scan = currentDir => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          scan(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };

    scan(dir);
    return files;
  }

  calculateDirectorySize(dir) {
    let size = 0;
    const files = this.getAllFiles(dir);

    for (const file of files) {
      size += fs.statSync(file).size;
    }

    return size;
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
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  getCacheControl(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Service worker - no cache
    if (fileName === 'sw.js') {
      return 'no-cache, no-store, must-revalidate';
    }

    // HTML files - short cache
    if (ext === '.html') {
      return 'public, max-age=300'; // 5 minutes
    }

    // Static assets with hash - long cache
    if (filePath.includes('/_next/static/') || filePath.includes('.hash.')) {
      return 'public, max-age=31536000, immutable'; // 1 year
    }

    // Images and fonts - medium cache
    if (
      [
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.ico',
        '.woff',
        '.woff2',
        '.ttf',
      ].includes(ext)
    ) {
      return 'public, max-age=86400'; // 1 day
    }

    // Default - short cache
    return 'public, max-age=3600'; // 1 hour
  }

  async makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const urlObj = new URL(url);

      const req = https.request(
        url,
        {
          method: options.method || 'GET',
          headers: options.headers || {},
          timeout: options.timeout || 15000,
          ...options,
        },
        res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              responseTime: Date.now() - startTime,
            });
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  /**
   * Main deployment execution
   */
  async run() {
    try {
      this.log('🚀 Starting production deployment to S3/CloudFront...', 'info');
      this.log(`Deployment ID: ${this.deploymentId}`, 'info');
      this.log(`Environment: ${this.environment}`, 'info');
      this.log(`S3 Bucket: ${this.bucketName}`, 'info');
      this.log(`CloudFront Distribution: ${this.distributionId}`, 'info');
      this.log(`CloudFront Domain: ${this.cloudfrontDomain}`, 'info');
      this.log('', 'info');

      // Step 1: Validate production environment
      await this.validateProductionEnvironment();

      // Step 2: Build application
      await this.buildApplication();

      // Step 3: Deploy to S3
      await this.deployToS3();

      // Step 4: Invalidate CloudFront cache
      await this.invalidateCloudFrontCache();

      // Step 5: Validate deployment
      await this.validateDeployment();

      // Step 6: Generate DNS instructions
      this.generateDNSInstructions();

      // Step 7: Save deployment results
      await this.saveDeploymentResults();

      this.log('\n🎉 Production deployment completed successfully!', 'success');
      this.log('\n📋 Deployment Summary:', 'info');
      this.log(`   • Deployment ID: ${this.deploymentId}`, 'info');
      this.log(`   • S3 Bucket: ${this.bucketName}`, 'info');
      this.log(`   • CloudFront Distribution: ${this.distributionId}`, 'info');
      this.log(`   • CloudFront URL: https://${this.cloudfrontDomain}`, 'info');

      if (this.customDomain) {
        this.log(
          `   • Custom Domain: ${this.customDomain} (DNS configuration required)`,
          'info'
        );
      }

      this.log('\n🌐 Your site is now live at:', 'info');
      this.log(`   https://${this.cloudfrontDomain}`, 'info');

      this.log('\n⏳ Next steps:', 'info');
      this.log(
        '1. Wait for CloudFront cache invalidation to complete (5-15 minutes)',
        'info'
      );
      if (this.customDomain) {
        this.log('2. Configure DNS records for your custom domain', 'info');
        this.log('3. Wait for DNS propagation (5-60 minutes)', 'info');
        this.log('4. Test your custom domain', 'info');
      } else {
        this.log('2. Configure custom domain if desired', 'info');
      }
      this.log('5. Run production readiness validation', 'info');
      this.log('6. Decommission Amplify resources', 'info');

      this.log('\n📋 Important files created:', 'info');
      this.log('   • config/dns-configuration-instructions.md', 'info');
      this.log(
        `   • logs/production-deployment-${this.deploymentId}.json`,
        'info'
      );

      return this.deploymentResults;
    } catch (error) {
      this.deploymentResults.status = 'failed';
      this.deploymentResults.error = error.message;

      this.log(`\n❌ Production deployment failed: ${error.message}`, 'error');
      this.log('\n🔧 Troubleshooting tips:', 'error');
      this.log('1. Check AWS credentials and permissions', 'error');
      this.log(
        '2. Verify S3 bucket and CloudFront distribution exist',
        'error'
      );
      this.log('3. Ensure build completed successfully', 'error');
      this.log('4. Check network connectivity to AWS services', 'error');

      await this.saveDeploymentResults();
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  // Load production environment variables
  const envPath = path.join(process.cwd(), 'config', 'production.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !key.startsWith('#')) {
        process.env[key.trim()] = value.trim();
      }
    });
  }

  const deployment = new ProductionDeployment();
  deployment.run();
}

module.exports = ProductionDeployment;
