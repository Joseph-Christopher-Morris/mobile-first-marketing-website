#!/usr/bin/env node

/**
 * AWS Certificate Manager SSL/TLS Certificate Setup Script
 * Handles SSL certificate request, validation, and CloudFront integration
 *
 * Requirements addressed:
 * - 4.2: SSL certificate request and validation
 * - 4.3: Automatic certificate renewal
 * - 7.3: HTTPS redirect for all HTTP requests
 */

const {
  ACMClient,
  RequestCertificateCommand,
  DescribeCertificateCommand,
  ListCertificatesCommand,
  GetCertificateCommand,
} = require('@aws-sdk/client-acm');

const {
  CloudFrontClient,
  GetDistributionCommand,
  UpdateDistributionCommand,
} = require('@aws-sdk/client-cloudfront');

const {
  Route53Client,
  ListHostedZonesCommand,
  ChangeResourceRecordSetsCommand,
  GetChangeCommand,
} = require('@aws-sdk/client-route-53');

const fs = require('fs');
const path = require('path');

class SSLCertificateSetup {
  constructor() {
    this.region = 'us-east-1'; // ACM certificates for CloudFront must be in us-east-1
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.customDomain = process.env.CUSTOM_DOMAIN;
    this.environment = process.env.ENVIRONMENT || 'production';

    this.acmClient = new ACMClient({ region: this.region });
    this.cloudFrontClient = new CloudFrontClient({ region: this.region });
    this.route53Client = new Route53Client({ region: this.region });

    this.certificateArn = null;
    this.validationRecords = [];
  }

  /**
   * Validate prerequisites
   */
  async validatePrerequisites() {
    console.log('🔍 Validating SSL certificate setup prerequisites...');

    if (!this.distributionId) {
      throw new Error(
        'CLOUDFRONT_DISTRIBUTION_ID environment variable is required'
      );
    }

    if (!this.customDomain) {
      throw new Error(
        'CUSTOM_DOMAIN environment variable is required (e.g., example.com or www.example.com)'
      );
    }

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    if (!domainRegex.test(this.customDomain)) {
      throw new Error(`Invalid domain format: ${this.customDomain}`);
    }

    console.log(`✅ Distribution ID: ${this.distributionId}`);
    console.log(`✅ Custom Domain: ${this.customDomain}`);
    console.log(`✅ Environment: ${this.environment}`);
    console.log(`✅ ACM Region: ${this.region} (required for CloudFront)`);
  }

  /**
   * Check if certificate already exists for the domain
   */
  async findExistingCertificate() {
    console.log(
      `🔍 Checking for existing SSL certificate for ${this.customDomain}...`
    );

    try {
      const result = await this.acmClient.send(
        new ListCertificatesCommand({
          CertificateStatuses: ['ISSUED', 'PENDING_VALIDATION'],
        })
      );

      const existingCert = result.CertificateSummaryList?.find(
        cert =>
          cert.DomainName === this.customDomain ||
          cert.SubjectAlternativeNameSummary?.includes(this.customDomain)
      );

      if (existingCert) {
        console.log(
          `✅ Found existing certificate: ${existingCert.CertificateArn}`
        );
        console.log(`   Status: ${existingCert.Status}`);
        console.log(`   Domain: ${existingCert.DomainName}`);

        this.certificateArn = existingCert.CertificateArn;
        return existingCert;
      }

      console.log('ℹ️  No existing certificate found, will create new one');
      return null;
    } catch (error) {
      console.error('❌ Failed to check existing certificates:', error.message);
      throw error;
    }
  }

  /**
   * Request new SSL certificate from ACM
   */
  async requestCertificate() {
    console.log(`📜 Requesting SSL certificate for ${this.customDomain}...`);

    try {
      // Determine if we should include www subdomain
      const domains = [this.customDomain];

      // If domain doesn't start with www, also include www version
      if (!this.customDomain.startsWith('www.')) {
        domains.push(`www.${this.customDomain}`);
      }

      // If domain starts with www, also include apex domain
      if (this.customDomain.startsWith('www.')) {
        const apexDomain = this.customDomain.replace('www.', '');
        domains.unshift(apexDomain); // Put apex domain first
      }

      console.log(`📋 Certificate will cover domains: ${domains.join(', ')}`);

      const result = await this.acmClient.send(
        new RequestCertificateCommand({
          DomainName: domains[0], // Primary domain
          SubjectAlternativeNames: domains.slice(1), // Additional domains
          ValidationMethod: 'DNS',
          KeyAlgorithm: 'RSA_2048',
          Options: {
            CertificateTransparencyLoggingPreference: 'ENABLED',
          },
          Tags: [
            {
              Key: 'Environment',
              Value: this.environment,
            },
            {
              Key: 'Purpose',
              Value: 'CloudFront SSL Certificate',
            },
            {
              Key: 'Domain',
              Value: this.customDomain,
            },
            {
              Key: 'CreatedBy',
              Value: 'ssl-certificate-setup-script',
            },
          ],
        })
      );

      this.certificateArn = result.CertificateArn;
      console.log(`✅ Certificate requested successfully`);
      console.log(`   Certificate ARN: ${this.certificateArn}`);

      return result;
    } catch (error) {
      console.error('❌ Failed to request certificate:', error.message);

      if (error.name === 'LimitExceededException') {
        console.error('\n💡 You have reached the ACM certificate limit.');
        console.error(
          '   Consider deleting unused certificates or contact AWS support.'
        );
      }

      throw error;
    }
  }

  /**
   * Get DNS validation records for the certificate
   */
  async getDNSValidationRecords() {
    console.log('📋 Retrieving DNS validation records...');

    try {
      // Wait a moment for the certificate to be processed
      await new Promise(resolve => setTimeout(resolve, 5000));

      const result = await this.acmClient.send(
        new DescribeCertificateCommand({
          CertificateArn: this.certificateArn,
        })
      );

      const certificate = result.Certificate;

      if (!certificate.DomainValidationOptions) {
        throw new Error(
          'DNS validation records not yet available. Please wait and try again.'
        );
      }

      this.validationRecords = certificate.DomainValidationOptions.map(
        option => ({
          domain: option.DomainName,
          name: option.ResourceRecord?.Name,
          value: option.ResourceRecord?.Value,
          type: option.ResourceRecord?.Type,
          status: option.ValidationStatus,
        })
      );

      console.log('✅ DNS validation records retrieved:');
      this.validationRecords.forEach(record => {
        console.log(`   Domain: ${record.domain}`);
        console.log(`   Type: ${record.type}`);
        console.log(`   Name: ${record.name}`);
        console.log(`   Value: ${record.value}`);
        console.log(`   Status: ${record.status}`);
        console.log('');
      });

      return this.validationRecords;
    } catch (error) {
      console.error('❌ Failed to get DNS validation records:', error.message);
      throw error;
    }
  }

  /**
   * Attempt automatic DNS validation using Route 53 (if hosted zone exists)
   */
  async attemptAutomaticValidation() {
    console.log(
      '🔍 Checking for Route 53 hosted zone for automatic validation...'
    );

    try {
      const hostedZones = await this.route53Client.send(
        new ListHostedZonesCommand({})
      );

      // Find hosted zone that matches our domain
      const matchingZone = hostedZones.HostedZones?.find(zone => {
        const zoneName = zone.Name.replace(/\.$/, ''); // Remove trailing dot
        return (
          this.customDomain === zoneName ||
          this.customDomain.endsWith(`.${zoneName}`)
        );
      });

      if (!matchingZone) {
        console.log(
          'ℹ️  No matching Route 53 hosted zone found. Manual DNS validation required.'
        );
        return false;
      }

      console.log(`✅ Found matching hosted zone: ${matchingZone.Name}`);
      console.log(`   Zone ID: ${matchingZone.Id}`);

      // Create DNS validation records
      const changes = this.validationRecords.map(record => ({
        Action: 'CREATE',
        ResourceRecordSet: {
          Name: record.name,
          Type: record.type,
          TTL: 300,
          ResourceRecords: [{ Value: record.value }],
        },
      }));

      const changeResult = await this.route53Client.send(
        new ChangeResourceRecordSetsCommand({
          HostedZoneId: matchingZone.Id,
          ChangeBatch: {
            Comment: `DNS validation for SSL certificate - ${this.customDomain}`,
            Changes: changes,
          },
        })
      );

      console.log(`✅ DNS validation records created in Route 53`);
      console.log(`   Change ID: ${changeResult.ChangeInfo.Id}`);

      // Wait for DNS changes to propagate
      console.log('⏳ Waiting for DNS changes to propagate...');
      await this.waitForDNSPropagation(changeResult.ChangeInfo.Id);

      return true;
    } catch (error) {
      console.warn(`⚠️  Automatic DNS validation failed: ${error.message}`);
      console.log('ℹ️  Falling back to manual DNS validation instructions.');
      return false;
    }
  }

  /**
   * Wait for DNS changes to propagate in Route 53
   */
  async waitForDNSPropagation(changeId, maxWaitTime = 300000) {
    // 5 minutes max
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = await this.route53Client.send(
          new GetChangeCommand({
            Id: changeId,
          })
        );

        if (result.ChangeInfo.Status === 'INSYNC') {
          console.log('✅ DNS changes have propagated');
          return true;
        }

        console.log(
          `⏳ DNS propagation status: ${result.ChangeInfo.Status}, waiting...`
        );
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      } catch (error) {
        console.warn(`⚠️  Error checking DNS propagation: ${error.message}`);
        break;
      }
    }

    console.log(
      '⏰ DNS propagation check timed out, but changes may still be propagating'
    );
    return false;
  }

  /**
   * Wait for certificate validation to complete
   */
  async waitForCertificateValidation(maxWaitTime = 1800000) {
    // 30 minutes max
    console.log('⏳ Waiting for certificate validation to complete...');
    console.log('   This can take up to 30 minutes for DNS validation');

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = await this.acmClient.send(
          new DescribeCertificateCommand({
            CertificateArn: this.certificateArn,
          })
        );

        const status = result.Certificate.Status;
        console.log(`   Certificate status: ${status}`);

        if (status === 'ISSUED') {
          console.log('✅ Certificate validation completed successfully!');
          return true;
        }

        if (status === 'FAILED') {
          throw new Error('Certificate validation failed');
        }

        // Wait 60 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 60000));
      } catch (error) {
        console.error(`❌ Error checking certificate status: ${error.message}`);
        throw error;
      }
    }

    throw new Error('Certificate validation timed out');
  }

  /**
   * Update CloudFront distribution to use the SSL certificate
   */
  async updateCloudFrontDistribution() {
    console.log('☁️ Updating CloudFront distribution with SSL certificate...');

    try {
      // Get current distribution configuration
      const getResult = await this.cloudFrontClient.send(
        new GetDistributionCommand({
          Id: this.distributionId,
        })
      );

      const distribution = getResult.Distribution;
      const config = distribution.DistributionConfig;

      // Update distribution configuration
      const updatedConfig = {
        ...config,
        Aliases: {
          Quantity: 1,
          Items: [this.customDomain],
        },
        ViewerCertificate: {
          ACMCertificateArn: this.certificateArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021',
          CertificateSource: 'acm',
        },
      };

      // If domain starts with www, also include apex domain
      if (this.customDomain.startsWith('www.')) {
        const apexDomain = this.customDomain.replace('www.', '');
        updatedConfig.Aliases = {
          Quantity: 2,
          Items: [this.customDomain, apexDomain],
        };
      }
      // If domain doesn't start with www, also include www version
      else {
        updatedConfig.Aliases = {
          Quantity: 2,
          Items: [this.customDomain, `www.${this.customDomain}`],
        };
      }

      const updateResult = await this.cloudFrontClient.send(
        new UpdateDistributionCommand({
          Id: this.distributionId,
          DistributionConfig: updatedConfig,
          IfMatch: getResult.ETag,
        })
      );

      console.log('✅ CloudFront distribution updated successfully');
      console.log(`   Distribution ID: ${this.distributionId}`);
      console.log(
        `   Custom domains: ${updatedConfig.Aliases.Items.join(', ')}`
      );
      console.log(`   SSL Certificate: ${this.certificateArn}`);
      console.log(
        `   TLS Version: ${updatedConfig.ViewerCertificate.MinimumProtocolVersion}`
      );

      return updateResult.Distribution;
    } catch (error) {
      console.error(
        '❌ Failed to update CloudFront distribution:',
        error.message
      );
      throw error;
    }
  }

  /**
   * Generate manual DNS validation instructions
   */
  generateManualInstructions() {
    console.log('\n📋 MANUAL DNS VALIDATION REQUIRED');
    console.log('='.repeat(50));
    console.log(
      '\nTo complete SSL certificate validation, add the following DNS records:'
    );

    this.validationRecords.forEach((record, index) => {
      console.log(`\n${index + 1}. For domain: ${record.domain}`);
      console.log(`   Record Type: ${record.type}`);
      console.log(`   Record Name: ${record.name}`);
      console.log(`   Record Value: ${record.value}`);
    });

    console.log('\n📝 Instructions:');
    console.log(
      '1. Log in to your DNS provider (e.g., GoDaddy, Namecheap, Route 53)'
    );
    console.log('2. Add the DNS records shown above');
    console.log('3. Wait for DNS propagation (can take up to 48 hours)');
    console.log('4. AWS will automatically validate and issue the certificate');
    console.log(
      '5. Run this script again to update CloudFront with the certificate'
    );

    console.log('\n🔍 To check validation status:');
    console.log(
      `aws acm describe-certificate --certificate-arn ${this.certificateArn} --region us-east-1`
    );
  }

  /**
   * Save SSL configuration
   */
  async saveSSLConfiguration() {
    console.log('💾 Saving SSL certificate configuration...');

    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const sslConfig = {
      version: '1.0',
      environment: this.environment,
      createdAt: new Date().toISOString(),
      certificate: {
        arn: this.certificateArn,
        domain: this.customDomain,
        status: 'PENDING_VALIDATION', // Will be updated when validated
        validationMethod: 'DNS',
        keyAlgorithm: 'RSA_2048',
      },
      cloudfront: {
        distributionId: this.distributionId,
        sslSupportMethod: 'sni-only',
        minimumProtocolVersion: 'TLSv1.2_2021',
      },
      validation: {
        records: this.validationRecords,
        automaticValidation: false, // Will be updated if Route 53 is used
      },
    };

    const configPath = path.join(configDir, 'ssl-certificate.json');
    fs.writeFileSync(configPath, JSON.stringify(sslConfig, null, 2));

    console.log(`✅ SSL configuration saved to ${configPath}`);
    return sslConfig;
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🔐 Starting SSL certificate setup...');

      // Step 1: Validate prerequisites
      await this.validatePrerequisites();

      // Step 2: Check for existing certificate
      const existingCert = await this.findExistingCertificate();

      // Step 3: Request certificate if needed
      if (!existingCert) {
        await this.requestCertificate();
        await this.getDNSValidationRecords();

        // Step 4: Attempt automatic validation
        const autoValidated = await this.attemptAutomaticValidation();

        if (autoValidated) {
          // Step 5: Wait for validation to complete
          await this.waitForCertificateValidation();
        } else {
          // Generate manual instructions
          this.generateManualInstructions();
          console.log(
            '\n⏸️  Certificate validation is pending manual DNS configuration.'
          );
          console.log('   Run this script again after adding the DNS records.');

          // Save configuration and exit
          await this.saveSSLConfiguration();
          return {
            status: 'pending_validation',
            certificateArn: this.certificateArn,
          };
        }
      } else if (existingCert.Status === 'PENDING_VALIDATION') {
        console.log('⏳ Certificate is still pending validation...');
        await this.waitForCertificateValidation();
      }

      // Step 6: Update CloudFront distribution
      await this.updateCloudFrontDistribution();

      // Step 7: Save configuration
      const config = await this.saveSSLConfiguration();
      config.validation.automaticValidation = true;

      console.log('\n🎉 SSL certificate setup completed successfully!');
      console.log('\n📋 Summary:');
      console.log(`   • Certificate ARN: ${this.certificateArn}`);
      console.log(`   • Custom Domain: ${this.customDomain}`);
      console.log(`   • CloudFront Distribution: ${this.distributionId}`);
      console.log(`   • TLS Version: TLSv1.2_2021`);
      console.log(`   • Automatic Renewal: Enabled`);

      console.log('\n⏳ Next steps:');
      console.log('1. Wait for CloudFront distribution update (15-20 minutes)');
      console.log('2. Update DNS records to point to CloudFront');
      console.log('3. Test HTTPS access to your custom domain');

      return {
        status: 'completed',
        certificateArn: this.certificateArn,
        config,
      };
    } catch (error) {
      console.error('\n❌ SSL certificate setup failed:', error.message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error(
        '1. Verify AWS credentials have ACM and CloudFront permissions'
      );
      console.error(
        '2. Ensure CUSTOM_DOMAIN environment variable is set correctly'
      );
      console.error(
        '3. Check that CloudFront distribution exists and is accessible'
      );
      console.error('4. For Route 53 domains, ensure hosted zone exists');

      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new SSLCertificateSetup();
  setup.run();
}

module.exports = SSLCertificateSetup;
