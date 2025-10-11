#!/usr/bin/env node

/**
 * Complete SSL Certificate and Custom Domain Setup Script
 * Orchestrates SSL certificate creation and custom domain configuration
 * 
 * Requirements addressed:
 * - 4.1: Custom domain configuration with CNAME/ALIAS DNS records
 * - 4.2: SSL certificate request and validation
 * - 4.3: Automatic certificate renewal
 * - 4.4: HTTPS redirect for all HTTP requests
 */

const SSLCertificateSetup = require('./setup-ssl-certificate');
const CustomDomainSetup = require('./setup-custom-domain');
const fs = require('fs');
const path = require('path');

class SSLAndDomainSetup {
  constructor() {
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.customDomain = process.env.CUSTOM_DOMAIN;
    this.environment = process.env.ENVIRONMENT || 'production';
    
    this.sslSetup = new SSLCertificateSetup();
    this.domainSetup = new CustomDomainSetup();
    
    this.certificateArn = null;
    this.setupResults = {
      ssl: null,
      domain: null,
      overall: 'pending'
    };
  }

  /**
   * Validate prerequisites for both SSL and domain setup
   */
  async validatePrerequisites() {
    console.log('🔍 Validating SSL and custom domain prerequisites...');
    
    if (!this.distributionId) {
      throw new Error('CLOUDFRONT_DISTRIBUTION_ID environment variable is required');
    }
    
    if (!this.customDomain) {
      throw new Error('CUSTOM_DOMAIN environment variable is required');
    }
    
    console.log(`✅ CloudFront Distribution: ${this.distributionId}`);
    console.log(`✅ Custom Domain: ${this.customDomain}`);
    console.log(`✅ Environment: ${this.environment}`);
    
    // Validate AWS credentials
    try {
      await this.sslSetup.validatePrerequisites();
      console.log('✅ AWS credentials and permissions validated');
    } catch (error) {
      console.error('❌ AWS validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Step 1: Set up SSL certificate
   */
  async setupSSLCertificate() {
    console.log('\n🔐 Step 1: Setting up SSL certificate...');
    console.log('='.repeat(50));
    
    try {
      const sslResult = await this.sslSetup.run();
      this.setupResults.ssl = sslResult;
      
      if (sslResult.status === 'completed') {
        this.certificateArn = sslResult.certificateArn;
        process.env.SSL_CERTIFICATE_ARN = this.certificateArn;
        console.log('✅ SSL certificate setup completed successfully');
        return true;
      } else if (sslResult.status === 'pending_validation') {
        console.log('⏸️  SSL certificate is pending DNS validation');
        console.log('   Please complete DNS validation and run this script again');
        return false;
      }
    } catch (error) {
      console.error('❌ SSL certificate setup failed:', error.message);
      this.setupResults.ssl = { status: 'failed', error: error.message };
      throw error;
    }
  }

  /**
   * Step 2: Configure custom domain
   */
  async setupCustomDomain() {
    console.log('\n🌐 Step 2: Configuring custom domain...');
    console.log('='.repeat(50));
    
    try {
      const domainResult = await this.domainSetup.run();
      this.setupResults.domain = domainResult;
      
      if (domainResult.status === 'completed') {
        console.log('✅ Custom domain configuration completed successfully');
        return true;
      } else {
        console.log('⚠️  Custom domain configuration completed with warnings');
        return true; // Still consider it successful
      }
    } catch (error) {
      console.error('❌ Custom domain configuration failed:', error.message);
      this.setupResults.domain = { status: 'failed', error: error.message };
      throw error;
    }
  }

  /**
   * Generate comprehensive setup summary
   */
  generateSetupSummary() {
    console.log('\n📊 COMPLETE SETUP SUMMARY');
    console.log('='.repeat(60));
    
    const summary = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      customDomain: this.customDomain,
      distributionId: this.distributionId,
      ssl: {
        status: this.setupResults.ssl?.status || 'not_started',
        certificateArn: this.certificateArn,
        automaticRenewal: true,
        validationMethod: 'DNS'
      },
      domain: {
        status: this.setupResults.domain?.status || 'not_started',
        httpsRedirect: true,
        dnsConfiguration: this.setupResults.domain?.dnsConfigured ? 'automatic' : 'manual'
      },
      features: {
        customDomain: true,
        sslCertificate: !!this.certificateArn,
        httpsRedirect: true,
        automaticRenewal: true,
        dnsConfiguration: this.setupResults.domain?.dnsConfigured || false
      },
      nextSteps: this.generateNextSteps()
    };
    
    // Display summary
    console.log(`🌐 Custom Domain: ${this.customDomain}`);
    console.log(`☁️  CloudFront Distribution: ${this.distributionId}`);
    console.log(`🔐 SSL Certificate: ${this.certificateArn ? 'Configured' : 'Pending'}`);
    console.log(`📝 DNS Configuration: ${summary.domain.dnsConfiguration}`);
    console.log(`🔒 HTTPS Redirect: ${summary.features.httpsRedirect ? 'Enabled' : 'Disabled'}`);
    console.log(`🔄 Automatic Renewal: ${summary.features.automaticRenewal ? 'Enabled' : 'Disabled'}`);
    
    return summary;
  }

  /**
   * Generate next steps based on setup results
   */
  generateNextSteps() {
    const steps = [];
    
    if (this.setupResults.ssl?.status === 'pending_validation') {
      steps.push('Complete DNS validation for SSL certificate');
      steps.push('Run this script again after DNS validation');
    } else if (this.setupResults.ssl?.status === 'completed') {
      steps.push('Wait for CloudFront distribution update (15-20 minutes)');
      
      if (!this.setupResults.domain?.dnsConfigured) {
        steps.push('Configure DNS records manually as instructed');
      }
      
      steps.push('Wait for DNS propagation (up to 48 hours)');
      steps.push('Test HTTPS access to your custom domain');
      steps.push('Verify HTTP to HTTPS redirect is working');
      steps.push('Update any hardcoded URLs in your application');
      steps.push('Set up monitoring and alerts for the custom domain');
    }
    
    return steps;
  }

  /**
   * Save complete configuration
   */
  async saveCompleteConfiguration(summary) {
    console.log('💾 Saving complete SSL and domain configuration...');
    
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const configPath = path.join(configDir, 'ssl-domain-complete.json');
    fs.writeFileSync(configPath, JSON.stringify(summary, null, 2));
    
    console.log(`✅ Complete configuration saved to ${configPath}`);
    
    // Create deployment-ready environment file
    const envPath = path.join(configDir, 'production.env');
    const envContent = [
      `# Production Environment Configuration`,
      `# Generated on ${new Date().toISOString()}`,
      ``,
      `# Custom Domain Configuration`,
      `CUSTOM_DOMAIN=${this.customDomain}`,
      `CLOUDFRONT_DISTRIBUTION_ID=${this.distributionId}`,
      `SSL_CERTIFICATE_ARN=${this.certificateArn || ''}`,
      ``,
      `# AWS Configuration`,
      `AWS_REGION=${process.env.AWS_REGION || 'us-east-1'}`,
      `ENVIRONMENT=${this.environment}`,
      ``,
      `# Deployment Configuration`,
      `HTTPS_REDIRECT=true`,
      `SSL_ENABLED=true`,
      `CUSTOM_DOMAIN_ENABLED=true`,
      ``
    ].join('\n');
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Production environment file saved to ${envPath}`);
    
    return { configPath, envPath };
  }

  /**
   * Display final results and instructions
   */
  displayFinalResults(summary) {
    console.log('\n🎉 SSL CERTIFICATE AND CUSTOM DOMAIN SETUP RESULTS');
    console.log('='.repeat(60));
    
    if (this.setupResults.ssl?.status === 'completed' && 
        this.setupResults.domain?.status === 'completed') {
      console.log('✅ SETUP COMPLETED SUCCESSFULLY!');
      this.setupResults.overall = 'completed';
    } else if (this.setupResults.ssl?.status === 'pending_validation') {
      console.log('⏸️  SETUP PARTIALLY COMPLETED - DNS VALIDATION REQUIRED');
      this.setupResults.overall = 'pending_validation';
    } else {
      console.log('⚠️  SETUP COMPLETED WITH ISSUES');
      this.setupResults.overall = 'completed_with_warnings';
    }
    
    console.log('\n📋 NEXT STEPS:');
    summary.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    
    console.log('\n🔍 TESTING COMMANDS:');
    console.log(`  # Test HTTPS access:`);
    console.log(`  curl -I https://${this.customDomain}`);
    console.log(`  `);
    console.log(`  # Test HTTP to HTTPS redirect:`);
    console.log(`  curl -I http://${this.customDomain}`);
    console.log(`  `);
    console.log(`  # Check SSL certificate:`);
    console.log(`  openssl s_client -connect ${this.customDomain}:443 -servername ${this.customDomain}`);
    
    console.log('\n📚 DOCUMENTATION:');
    console.log('  • SSL Certificate: config/ssl-certificate.json');
    console.log('  • Custom Domain: config/custom-domain.json');
    console.log('  • Complete Setup: config/ssl-domain-complete.json');
    console.log('  • Environment: config/production.env');
    
    if (this.setupResults.overall === 'pending_validation') {
      console.log('\n⚠️  IMPORTANT: DNS validation is required to complete SSL certificate setup.');
      console.log('   Please add the DNS validation records and run this script again.');
    }
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🚀 Starting complete SSL certificate and custom domain setup...');
      console.log(`Environment: ${this.environment}`);
      console.log(`Custom Domain: ${this.customDomain}`);
      console.log(`CloudFront Distribution: ${this.distributionId}`);
      
      // Step 1: Validate prerequisites
      await this.validatePrerequisites();
      
      // Step 2: Set up SSL certificate
      const sslCompleted = await this.setupSSLCertificate();
      
      // Step 3: Configure custom domain (only if SSL is ready)
      if (sslCompleted) {
        await this.setupCustomDomain();
      } else {
        console.log('\n⏸️  Skipping custom domain configuration until SSL certificate is validated');
      }
      
      // Step 4: Generate summary
      const summary = this.generateSetupSummary();
      
      // Step 5: Save configuration
      await this.saveCompleteConfiguration(summary);
      
      // Step 6: Display results
      this.displayFinalResults(summary);
      
      return {
        status: this.setupResults.overall,
        ssl: this.setupResults.ssl,
        domain: this.setupResults.domain,
        summary
      };
      
    } catch (error) {
      console.error('\n❌ SSL and custom domain setup failed:', error.message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials have ACM, CloudFront, and Route 53 permissions');
      console.error('2. Ensure CloudFront distribution exists and is accessible');
      console.error('3. Check that custom domain format is correct');
      console.error('4. Verify DNS provider supports the required record types');
      console.error('5. For Route 53 domains, ensure hosted zone exists');
      
      // Save error state
      const errorSummary = {
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        ssl: this.setupResults.ssl,
        domain: this.setupResults.domain
      };
      
      const configDir = path.join(process.cwd(), 'config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(configDir, 'ssl-domain-error.json'),
        JSON.stringify(errorSummary, null, 2)
      );
      
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new SSLAndDomainSetup();
  setup.run();
}

module.exports = SSLAndDomainSetup;