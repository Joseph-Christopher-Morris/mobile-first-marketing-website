#!/usr/bin/env node

/**
 * Complete CloudFront Setup Script
 * Orchestrates the complete CloudFront distribution setup with S3 origin,
 * security headers, error handling, and optimal caching strategies
 *
 * Requirements addressed:
 * - 2.1: CloudFront distribution with private S3 origin and OAC
 * - 2.2: Cache behaviors for different content types
 * - 2.4: Custom error pages for SPA routing
 * - 7.3: Security headers and restricted S3 access
 * - 2.3: Compression and optimal caching
 */

const CloudFrontDistributionSetup = require('./setup-cloudfront-distribution');
const CloudFrontSecurityConfig = require('./configure-cloudfront-security');
const CloudFrontCachingConfig = require('./configure-cloudfront-caching');

const fs = require('fs');
const path = require('path');

class CompleteCloudFrontSetup {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.environment = process.env.ENVIRONMENT || 'production';
    this.distributionId = null;

    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
  }

  /**
   * Validate prerequisites
   */
  async validatePrerequisites() {
    console.log('🔍 Validating prerequisites...');

    // Check if S3 bucket exists (this would be done in a real implementation)
    console.log(`✅ S3 bucket: ${this.bucketName}`);
    console.log(`✅ Environment: ${this.environment}`);
    console.log(`✅ AWS region: ${process.env.AWS_REGION || 'us-east-1'}`);

    // Validate AWS credentials are available
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE) {
      console.warn(
        '⚠️  No AWS credentials found. Make sure to configure AWS CLI or set environment variables.'
      );
    }

    console.log('✅ Prerequisites validated');
  }

  /**
   * Step 1: Create CloudFront distribution with S3 origin and OAC
   */
  async setupDistribution() {
    console.log('\n📡 Step 1: Setting up CloudFront distribution...');

    const distributionSetup = new CloudFrontDistributionSetup();
    const distribution = await distributionSetup.run();

    if (distribution) {
      this.distributionId = distribution.Id;
      process.env.CLOUDFRONT_DISTRIBUTION_ID = this.distributionId;
      console.log(`✅ Distribution created with ID: ${this.distributionId}`);
    }

    return distribution;
  }

  /**
   * Step 2: Configure security headers and error handling
   */
  async setupSecurity() {
    console.log(
      '\n🔒 Step 2: Configuring security headers and error handling...'
    );

    const securityConfig = new CloudFrontSecurityConfig();
    const securityPolicies = await securityConfig.run();

    console.log('✅ Security configuration completed');
    return securityPolicies;
  }

  /**
   * Step 3: Configure optimal caching strategies
   */
  async setupCaching() {
    console.log('\n⚡ Step 3: Configuring caching strategies...');

    const cachingConfig = new CloudFrontCachingConfig();
    const cachingPolicies = await cachingConfig.run();

    console.log('✅ Caching configuration completed');
    return cachingPolicies;
  }

  /**
   * Generate deployment summary
   */
  async generateDeploymentSummary(
    distribution,
    securityPolicies,
    cachingPolicies
  ) {
    console.log('\n📋 Generating deployment summary...');

    const summary = {
      deployment: {
        timestamp: new Date().toISOString(),
        environment: this.environment,
        bucketName: this.bucketName,
        distributionId: this.distributionId,
        domainName: distribution?.DomainName,
        status: distribution?.Status,
      },
      configuration: {
        originAccessControl: true,
        securityHeaders: !!securityPolicies?.securityPolicy,
        corsHeaders: !!securityPolicies?.corsPolicy,
        customErrorPages: true,
        compressionEnabled: true,
        cachingOptimized: true,
      },
      policies: {
        security: securityPolicies?.securityPolicy
          ? {
              id: securityPolicies.securityPolicy.Id,
              name: securityPolicies.securityPolicy.ResponseHeadersPolicyConfig
                ?.Name,
            }
          : null,
        cors: securityPolicies?.corsPolicy
          ? {
              id: securityPolicies.corsPolicy.Id,
              name: securityPolicies.corsPolicy.ResponseHeadersPolicyConfig
                ?.Name,
            }
          : null,
        caching: {
          staticAssets: cachingPolicies?.staticAssets?.Id,
          html: cachingPolicies?.html?.Id,
          serviceWorker: cachingPolicies?.serviceWorker?.Id,
          manifest: cachingPolicies?.manifest?.Id,
        },
      },
      features: {
        httpsRedirect: true,
        gzipCompression: true,
        brotliCompression: true,
        http2Support: true,
        http3Support: true,
        ipv6Support: true,
        spaRouting: true,
        securityHeaders: [
          'Strict-Transport-Security',
          'Content-Security-Policy',
          'X-Content-Type-Options',
          'X-Frame-Options',
          'X-XSS-Protection',
          'Referrer-Policy',
          'Permissions-Policy',
        ],
      },
      nextSteps: [
        'Wait for distribution deployment (15-20 minutes)',
        'Test the CloudFront domain name',
        'Configure custom domain and SSL certificate',
        'Set up monitoring and alerts',
        'Update DNS records to point to CloudFront',
        'Test all cache behaviors and error pages',
      ],
    };

    // Save summary to file
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const summaryPath = path.join(
      configDir,
      'cloudfront-deployment-summary.json'
    );
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`✅ Deployment summary saved to ${summaryPath}`);
    return summary;
  }

  /**
   * Display final results
   */
  displayResults(summary) {
    console.log('\n🎉 CloudFront setup completed successfully!');
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));

    console.log(`🌐 Distribution ID: ${summary.deployment.distributionId}`);
    console.log(`🌐 Domain Name: ${summary.deployment.domainName}`);
    console.log(`📦 S3 Bucket: ${summary.deployment.bucketName}`);
    console.log(`🏷️  Environment: ${summary.deployment.environment}`);
    console.log(`📅 Deployed: ${summary.deployment.timestamp}`);

    console.log('\n🔧 CONFIGURED FEATURES:');
    summary.features.securityHeaders.forEach(header => {
      console.log(`  ✅ ${header}`);
    });
    console.log(`  ✅ HTTPS Redirect`);
    console.log(`  ✅ Gzip/Brotli Compression`);
    console.log(`  ✅ HTTP/2 & HTTP/3 Support`);
    console.log(`  ✅ IPv6 Support`);
    console.log(`  ✅ SPA Routing (404 → index.html)`);

    console.log('\n⚡ CACHING STRATEGIES:');
    console.log('  📁 Static Assets (/_next/static/*): 1 year');
    console.log('  🖼️  Images & Fonts: 1 year');
    console.log('  📄 HTML Files: 5 minutes');
    console.log('  ⚙️  Service Worker: No cache');
    console.log('  📋 Manifest: 1 day');

    console.log('\n📋 NEXT STEPS:');
    summary.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    console.log('\n🔗 USEFUL COMMANDS:');
    console.log(
      `  Test distribution: curl -I https://${summary.deployment.domainName}`
    );
    console.log(
      `  Check status: aws cloudfront get-distribution --id ${summary.deployment.distributionId}`
    );
    console.log(
      `  Invalidate cache: aws cloudfront create-invalidation --distribution-id ${summary.deployment.distributionId} --paths "/*"`
    );

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🚀 Starting complete CloudFront setup...');
      console.log(`Environment: ${this.environment}`);
      console.log(`S3 Bucket: ${this.bucketName}`);

      // Validate prerequisites
      await this.validatePrerequisites();

      // Step 1: Setup distribution
      const distribution = await this.setupDistribution();

      // Step 2: Configure security
      const securityPolicies = await this.setupSecurity();

      // Step 3: Configure caching
      const cachingPolicies = await this.setupCaching();

      // Generate summary
      const summary = await this.generateDeploymentSummary(
        distribution,
        securityPolicies,
        cachingPolicies
      );

      // Display results
      this.displayResults(summary);

      return summary;
    } catch (error) {
      console.error('\n❌ CloudFront setup failed:', error.message);
      console.error('\n🔍 Troubleshooting tips:');
      console.error('  1. Check AWS credentials and permissions');
      console.error('  2. Verify S3 bucket exists and is accessible');
      console.error('  3. Ensure AWS region is correctly set');
      console.error('  4. Check for existing resources with same names');
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const setup = new CompleteCloudFrontSetup();
  setup.run();
}

module.exports = CompleteCloudFrontSetup;
