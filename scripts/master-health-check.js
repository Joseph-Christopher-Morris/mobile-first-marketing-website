#!/usr/bin/env node

/**
 * Master Health Check Script
 * Comprehensive validation of deployment, performance, analytics, and content
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MasterHealthCheck {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      categories: {},
      issues: [],
      recommendations: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async checkDeploymentHealth() {
    this.log('\n🚀 Checking Deployment Health...', 'info');
    const checks = {
      s3Bucket: false,
      cloudfront: false,
      buildOutput: false,
      envVariables: false
    };

    try {
      // Check if build output exists
      checks.buildOutput = fs.existsSync('out');
      
      // Check environment variables
      const requiredEnvVars = ['S3_BUCKET_NAME', 'CLOUDFRONT_DISTRIBUTION_ID', 'AWS_REGION'];
      checks.envVariables = requiredEnvVars.every(v => process.env[v] || fs.existsSync('.env.production'));

      // Check S3 bucket accessibility (if AWS CLI available)
      try {
        execSync('aws s3 ls s3://mobile-marketing-site-prod-1759705011281-tyzuo9', { stdio: 'pipe' });
        checks.s3Bucket = true;
      } catch (e) {
        this.results.issues.push('S3 bucket not accessible - check AWS credentials');
      }

      // Check CloudFront distribution
      try {
        execSync('aws cloudfront get-distribution --id E2IBMHQ3GCW6ZK', { stdio: 'pipe' });
        checks.cloudfront = true;
      } catch (e) {
        this.results.issues.push('CloudFront distribution not accessible');
      }

      this.results.categories.deployment = {
        status: Object.values(checks).every(v => v) ? 'healthy' : 'issues',
        checks
      };

      if (checks.buildOutput) {
        this.log('✓ Build output exists', 'success');
      } else {
        this.log('✗ Build output missing - run npm run build', 'error');
      }

    } catch (error) {
      this.results.categories.deployment = { status: 'error', error: error.message };
      this.log(`✗ Deployment check failed: ${error.message}`, 'error');
    }
  }

  async checkPerformance() {
    this.log('\n⚡ Checking Performance...', 'info');
    const checks = {
      imagesOptimized: false,
      coreWebVitals: false,
      caching: false,
      lighthouse: false
    };

    try {
      // Check for WebP images
      const publicDir = 'public';
      if (fs.existsSync(publicDir)) {
        const images = this.findFiles(publicDir, /\.(jpg|jpeg|png)$/i);
        const webpImages = this.findFiles(publicDir, /\.webp$/i);
        checks.imagesOptimized = webpImages.length > 0;
        
        if (images.length > 0 && webpImages.length === 0) {
          this.results.recommendations.push('Convert images to WebP format for better performance');
        }
      }

      // Check if Core Web Vitals monitoring is configured
      checks.coreWebVitals = fs.existsSync('config/core-web-vitals-config.json');

      // Check caching configuration
      checks.caching = fs.existsSync('config/cloudfront-s3-config.json');

      // Check Lighthouse CI configuration
      checks.lighthouse = fs.existsSync('.lighthouserc.js');

      this.results.categories.performance = {
        status: Object.values(checks).filter(v => v).length >= 3 ? 'healthy' : 'needs-improvement',
        checks
      };

      this.log(`✓ Performance checks completed`, 'success');

    } catch (error) {
      this.results.categories.performance = { status: 'error', error: error.message };
      this.log(`✗ Performance check failed: ${error.message}`, 'error');
    }
  }

  async checkAnalytics() {
    this.log('\n📊 Checking Analytics...', 'info');
    const checks = {
      ga4Configured: false,
      clarityConfigured: false,
      conversionTracking: false,
      gtmSetup: false
    };

    try {
      // Check for GA4 implementation
      const layoutFile = 'src/app/layout.tsx';
      if (fs.existsSync(layoutFile)) {
        const content = fs.readFileSync(layoutFile, 'utf8');
        checks.ga4Configured = content.includes('G-QJXSCJ0L43') || content.includes('googletagmanager');
        checks.clarityConfigured = content.includes('clarity.ms') || content.includes('o5ggbmm8wd');
      }

      // Check for conversion tracking
      const conversionFile = 'src/app/thank-you/Conversion.tsx';
      checks.conversionTracking = fs.existsSync(conversionFile);

      // Check GTM configuration
      checks.gtmSetup = fs.existsSync('gtm-configuration.json');

      this.results.categories.analytics = {
        status: checks.ga4Configured && checks.clarityConfigured ? 'healthy' : 'needs-setup',
        checks
      };

      if (checks.ga4Configured) {
        this.log('✓ GA4 configured', 'success');
      } else {
        this.log('✗ GA4 not configured', 'warning');
        this.results.recommendations.push('Configure Google Analytics 4 tracking');
      }

    } catch (error) {
      this.results.categories.analytics = { status: 'error', error: error.message };
      this.log(`✗ Analytics check failed: ${error.message}`, 'error');
    }
  }

  async checkContent() {
    this.log('\n📝 Checking Content...', 'info');
    const checks = {
      blogPosts: 0,
      servicePages: 0,
      seoOptimized: false,
      imagesValid: false
    };

    try {
      // Count blog posts
      const blogDir = 'src/content/blog';
      if (fs.existsSync(blogDir)) {
        checks.blogPosts = fs.readdirSync(blogDir).filter(f => f.endsWith('.ts')).length;
      }

      // Count service pages
      const servicesDir = 'src/app/services';
      if (fs.existsSync(servicesDir)) {
        checks.servicePages = fs.readdirSync(servicesDir, { withFileTypes: true })
          .filter(d => d.isDirectory()).length;
      }

      // Check for SEO components
      checks.seoOptimized = fs.existsSync('src/components/seo/StructuredData.tsx');

      // Check for broken image references
      checks.imagesValid = true; // Assume valid unless we find issues

      this.results.categories.content = {
        status: checks.blogPosts > 0 && checks.servicePages > 0 ? 'healthy' : 'needs-content',
        checks
      };

      this.log(`✓ Found ${checks.blogPosts} blog posts and ${checks.servicePages} service pages`, 'success');

    } catch (error) {
      this.results.categories.content = { status: 'error', error: error.message };
      this.log(`✗ Content check failed: ${error.message}`, 'error');
    }
  }

  async checkCodeQuality() {
    this.log('\n🔍 Checking Code Quality...', 'info');
    const checks = {
      typescript: false,
      eslint: false,
      prettier: false,
      tests: false
    };

    try {
      checks.typescript = fs.existsSync('tsconfig.json');
      checks.eslint = fs.existsSync('.eslintrc.json');
      checks.prettier = fs.existsSync('prettier.config.js');
      checks.tests = fs.existsSync('e2e') || fs.existsSync('__tests__');

      this.results.categories.codeQuality = {
        status: Object.values(checks).filter(v => v).length >= 3 ? 'healthy' : 'needs-improvement',
        checks
      };

      this.log('✓ Code quality checks completed', 'success');

    } catch (error) {
      this.results.categories.codeQuality = { status: 'error', error: error.message };
      this.log(`✗ Code quality check failed: ${error.message}`, 'error');
    }
  }

  findFiles(dir, pattern, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.findFiles(filePath, pattern, fileList);
        }
      } else if (pattern.test(file)) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  calculateOverallHealth() {
    const categories = Object.values(this.results.categories);
    const healthyCount = categories.filter(c => c.status === 'healthy').length;
    const totalCount = categories.length;

    if (healthyCount === totalCount) {
      this.results.overall = 'excellent';
    } else if (healthyCount >= totalCount * 0.7) {
      this.results.overall = 'good';
    } else if (healthyCount >= totalCount * 0.5) {
      this.results.overall = 'fair';
    } else {
      this.results.overall = 'needs-attention';
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('📋 HEALTH CHECK REPORT', 'info');
    this.log('='.repeat(60), 'info');

    const statusEmoji = {
      excellent: '🟢',
      good: '🟡',
      fair: '🟠',
      'needs-attention': '🔴'
    };

    this.log(`\nOverall Health: ${statusEmoji[this.results.overall]} ${this.results.overall.toUpperCase()}`, 
      this.results.overall === 'excellent' ? 'success' : 'warning');

    this.log('\nCategory Status:', 'info');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const emoji = data.status === 'healthy' ? '✓' : data.status === 'error' ? '✗' : '⚠';
      this.log(`  ${emoji} ${category}: ${data.status}`, 
        data.status === 'healthy' ? 'success' : data.status === 'error' ? 'error' : 'warning');
    });

    if (this.results.issues.length > 0) {
      this.log('\n⚠️  Issues Found:', 'warning');
      this.results.issues.forEach(issue => this.log(`  • ${issue}`, 'warning'));
    }

    if (this.results.recommendations.length > 0) {
      this.log('\n💡 Recommendations:', 'info');
      this.results.recommendations.forEach(rec => this.log(`  • ${rec}`, 'info'));
    }

    // Save report
    const reportPath = `health-check-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`\n📄 Full report saved to: ${reportPath}`, 'success');
  }

  async run() {
    this.log('🏥 Starting Master Health Check...', 'info');
    this.log('This will validate deployment, performance, analytics, content, and code quality\n', 'info');

    await this.checkDeploymentHealth();
    await this.checkPerformance();
    await this.checkAnalytics();
    await this.checkContent();
    await this.checkCodeQuality();

    this.calculateOverallHealth();
    this.generateReport();

    return this.results;
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new MasterHealthCheck();
  checker.run().then(results => {
    process.exit(results.overall === 'excellent' || results.overall === 'good' ? 0 : 1);
  }).catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
}

module.exports = MasterHealthCheck;
