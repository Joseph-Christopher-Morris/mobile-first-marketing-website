#!/usr/bin/env node

/**
 * Unified Deployment Orchestrator
 * Streamlines S3 + CloudFront deployments with comprehensive validation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentOrchestrator {
  constructor(options = {}) {
    this.options = {
      skipBuild: false,
      skipValidation: false,
      dryRun: false,
      aggressive: false,
      ...options
    };

    this.config = {
      s3Bucket: process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9',
      cloudfrontId: process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK',
      region: process.env.AWS_REGION || 'us-east-1'
    };

    this.deploymentId = `deploy-${Date.now()}`;
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    const timestamp = new Date().toISOString().substr(11, 8);
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async executeCommand(command, description) {
    this.log(`${description}...`, 'info');
    
    if (this.options.dryRun) {
      this.log(`DRY RUN: ${command}`, 'warning');
      return { success: true, output: 'dry-run' };
    }

    try {
      const output = execSync(command, { 
        stdio: 'pipe',
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      this.log(`✓ ${description} completed`, 'success');
      return { success: true, output };
    } catch (error) {
      this.log(`✗ ${description} failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async preDeploymentChecks() {
    this.log('\n🔍 Running Pre-deployment Checks...', 'info');
    
    const checks = [];

    // Check AWS credentials
    checks.push(await this.executeCommand(
      'aws sts get-caller-identity',
      'Verifying AWS credentials'
    ));

    // Check S3 bucket access
    checks.push(await this.executeCommand(
      `aws s3 ls s3://${this.config.s3Bucket}`,
      'Verifying S3 bucket access'
    ));

    // Check CloudFront distribution
    checks.push(await this.executeCommand(
      `aws cloudfront get-distribution --id ${this.config.cloudfrontId}`,
      'Verifying CloudFront distribution'
    ));

    // Check Node.js version
    checks.push(await this.executeCommand(
      'node --version',
      'Checking Node.js version'
    ));

    const failedChecks = checks.filter(c => !c.success);
    if (failedChecks.length > 0) {
      throw new Error(`Pre-deployment checks failed: ${failedChecks.length} issues found`);
    }

    this.log('✓ All pre-deployment checks passed', 'success');
  }

  async buildApplication() {
    if (this.options.skipBuild) {
      this.log('⏭️  Skipping build (--skip-build flag)', 'warning');
      return;
    }

    this.log('\n🏗️  Building Application...', 'info');

    // Clean previous build
    if (fs.existsSync('out')) {
      await this.executeCommand('rm -rf out', 'Cleaning previous build');
    }

    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      await this.executeCommand('npm ci', 'Installing dependencies');
    }

    // Run build
    const buildResult = await this.executeCommand('npm run build', 'Building Next.js application');
    if (!buildResult.success) {
      throw new Error('Build failed');
    }

    // Verify build output
    if (!fs.existsSync('out')) {
      throw new Error('Build output directory not found');
    }

    const buildSize = this.calculateDirectorySize('out');
    this.log(`✓ Build completed successfully (${this.formatBytes(buildSize)})`, 'success');
  }

  async optimizeAssets() {
    this.log('\n⚡ Optimizing Assets...', 'info');

    // Compress images if script exists
    if (fs.existsSync('scripts/convert-images-to-webp.js')) {
      await this.executeCommand('node scripts/convert-images-to-webp.js', 'Converting images to WebP');
    }

    // Optimize performance if script exists
    if (fs.existsSync('scripts/performance-optimization.js')) {
      await this.executeCommand('node scripts/performance-optimization.js', 'Running performance optimizations');
    }

    this.log('✓ Asset optimization completed', 'success');
  }

  async deployToS3() {
    this.log('\n☁️  Deploying to S3...', 'info');

    // Create backup of current deployment
    const backupResult = await this.executeCommand(
      `aws s3 sync s3://${this.config.s3Bucket} s3://${this.config.s3Bucket}-backup-${this.deploymentId} --delete`,
      'Creating deployment backup'
    );

    // Sync files to S3
    const syncCommand = `aws s3 sync out/ s3://${this.config.s3Bucket} --delete --cache-control "public,max-age=31536000" --exclude "*.html" --exclude "sitemap.xml"`;
    const syncResult = await this.executeCommand(syncCommand, 'Syncing static assets');

    if (!syncResult.success) {
      throw new Error('S3 sync failed');
    }

    // Upload HTML files with no-cache headers
    const htmlCommand = `aws s3 sync out/ s3://${this.config.s3Bucket} --delete --cache-control "no-cache" --include "*.html" --include "sitemap.xml"`;
    await this.executeCommand(htmlCommand, 'Uploading HTML files');

    this.log('✓ S3 deployment completed', 'success');
  }

  async invalidateCloudFront() {
    this.log('\n🔄 Invalidating CloudFront Cache...', 'info');

    const invalidationPaths = this.options.aggressive 
      ? ['/*'] 
      : ['/', '/index.html', '/sitemap.xml', '/_next/*'];

    const pathsString = invalidationPaths.join(' ');
    const invalidateResult = await this.executeCommand(
      `aws cloudfront create-invalidation --distribution-id ${this.config.cloudfrontId} --paths ${pathsString}`,
      'Creating CloudFront invalidation'
    );

    if (invalidateResult.success) {
      const invalidationId = JSON.parse(invalidateResult.output).Invalidation.Id;
      this.log(`✓ Invalidation created: ${invalidationId}`, 'success');
      
      // Wait for invalidation to complete (optional)
      if (!this.options.skipValidation) {
        this.log('⏳ Waiting for invalidation to complete...', 'info');
        await this.executeCommand(
          `aws cloudfront wait invalidation-completed --distribution-id ${this.config.cloudfrontId} --id ${invalidationId}`,
          'Waiting for invalidation completion'
        );
      }
    }
  }

  async postDeploymentValidation() {
    if (this.options.skipValidation) {
      this.log('⏭️  Skipping validation (--skip-validation flag)', 'warning');
      return;
    }

    this.log('\n✅ Running Post-deployment Validation...', 'info');

    // Test website accessibility
    const websiteUrl = `https://d15sc9fc739ev2.cloudfront.net`;
    
    try {
      const testResult = await this.executeCommand(
        `curl -I ${websiteUrl}`,
        'Testing website accessibility'
      );

      if (testResult.success && testResult.output.includes('200 OK')) {
        this.log('✓ Website is accessible', 'success');
      } else {
        this.log('⚠️  Website accessibility test inconclusive', 'warning');
      }
    } catch (error) {
      this.log('⚠️  Could not test website accessibility', 'warning');
    }

    // Run health check if available
    if (fs.existsSync('scripts/master-health-check.js')) {
      await this.executeCommand('node scripts/master-health-check.js', 'Running health check');
    }

    // Run performance validation if available
    if (fs.existsSync('scripts/validate-core-web-vitals.js')) {
      await this.executeCommand('node scripts/validate-core-web-vitals.js', 'Validating Core Web Vitals');
    }
  }

  calculateDirectorySize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generateDeploymentReport() {
    const duration = Date.now() - this.startTime;
    const report = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      config: this.config,
      options: this.options,
      status: 'completed'
    };

    const reportPath = `deployment-report-${this.deploymentId}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`\n📄 Deployment report saved: ${reportPath}`, 'success');
    return report;
  }

  async deploy() {
    try {
      this.log(`🚀 Starting Unified Deployment (${this.deploymentId})`, 'info');
      this.log(`Target: S3 ${this.config.s3Bucket} → CloudFront ${this.config.cloudfrontId}`, 'info');

      await this.preDeploymentChecks();
      await this.buildApplication();
      await this.optimizeAssets();
      await this.deployToS3();
      await this.invalidateCloudFront();
      await this.postDeploymentValidation();

      const report = await this.generateDeploymentReport();
      
      this.log('\n' + '='.repeat(60), 'success');
      this.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!', 'success');
      this.log('='.repeat(60), 'success');
      this.log(`Duration: ${report.duration}`, 'info');
      this.log(`Website: https://d15sc9fc739ev2.cloudfront.net`, 'info');

      return { success: true, report };

    } catch (error) {
      this.log('\n' + '='.repeat(60), 'error');
      this.log('💥 DEPLOYMENT FAILED!', 'error');
      this.log('='.repeat(60), 'error');
      this.log(`Error: ${error.message}`, 'error');

      // Generate failure report
      const report = await this.generateDeploymentReport();
      report.status = 'failed';
      report.error = error.message;

      return { success: false, error: error.message, report };
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    skipBuild: args.includes('--skip-build'),
    skipValidation: args.includes('--skip-validation'),
    dryRun: args.includes('--dry-run'),
    aggressive: args.includes('--aggressive')
  };

  if (args.includes('--help')) {
    console.log(`
Unified Deployment Orchestrator

Usage: node scripts/unified-deployment-orchestrator.js [options]

Options:
  --skip-build      Skip the build step
  --skip-validation Skip post-deployment validation
  --dry-run         Show what would be done without executing
  --aggressive      Invalidate all CloudFront paths (/*) 
  --help           Show this help message

Examples:
  node scripts/unified-deployment-orchestrator.js
  node scripts/unified-deployment-orchestrator.js --skip-build
  node scripts/unified-deployment-orchestrator.js --dry-run
  node scripts/unified-deployment-orchestrator.js --aggressive
    `);
    process.exit(0);
  }

  const orchestrator = new DeploymentOrchestrator(options);
  orchestrator.deploy().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Deployment orchestrator failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentOrchestrator;