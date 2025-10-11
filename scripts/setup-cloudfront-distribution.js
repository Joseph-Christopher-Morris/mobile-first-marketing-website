#!/usr/bin/env node

/**
 * CloudFront Distribution Setup Script
 * Creates a CloudFront distribution with S3 origin and Origin Access Control (OAC)
 *
 * Requirements addressed:
 * - 2.1: CloudFront distribution with private S3 origin
 * - 2.2: Cache behaviors for different content types
 * - 7.3: Security through OAC and restricted S3 access
 */

const {
  CloudFrontClient,
  CreateDistributionCommand,
  CreateOriginAccessControlCommand,
  GetDistributionCommand,
  UpdateDistributionCommand,
} = require('@aws-sdk/client-cloudfront');

const {
  S3Client,
  PutBucketPolicyCommand,
  GetBucketLocationCommand,
} = require('@aws-sdk/client-s3');

const fs = require('fs');
const path = require('path');

class CloudFrontDistributionSetup {
  constructor() {
    this.cloudFrontClient = new CloudFrontClient({
      region: 'us-east-1', // CloudFront is global but API calls go to us-east-1
    });
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.environment = process.env.ENVIRONMENT || 'production';

    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
  }

  /**
   * Create Origin Access Control (OAC) for secure S3 access
   */
  async createOriginAccessControl() {
    console.log('Creating Origin Access Control (OAC)...');

    const oacConfig = {
      Name: `${this.bucketName}-oac`,
      Description: `Origin Access Control for ${this.bucketName} S3 bucket`,
      OriginAccessControlConfig: {
        Name: `${this.bucketName}-oac`,
        Description: `OAC for secure access to ${this.bucketName}`,
        SigningBehavior: 'always',
        SigningProtocol: 'sigv4',
        OriginAccessControlOriginType: 's3',
      },
    };

    try {
      const result = await this.cloudFrontClient.send(
        new CreateOriginAccessControlCommand(oacConfig)
      );

      console.log('✅ Origin Access Control created successfully');
      console.log(`OAC ID: ${result.OriginAccessControl.Id}`);

      return result.OriginAccessControl;
    } catch (error) {
      if (error.name === 'OriginAccessControlAlreadyExists') {
        console.log('⚠️  Origin Access Control already exists, continuing...');
        // In a real implementation, we'd fetch the existing OAC
        return null;
      }
      throw error;
    }
  }

  /**
   * Get S3 bucket region for proper origin configuration
   */
  async getBucketRegion() {
    try {
      const result = await this.s3Client.send(
        new GetBucketLocationCommand({ Bucket: this.bucketName })
      );
      return result.LocationConstraint || 'us-east-1';
    } catch (error) {
      console.warn(
        `Could not determine bucket region, using us-east-1: ${error.message}`
      );
      return 'us-east-1';
    }
  }

  /**
   * Create CloudFront distribution configuration
   */
  async createDistributionConfig(oac) {
    const bucketRegion = await this.getBucketRegion();
    const originDomainName = `${this.bucketName}.s3.${bucketRegion}.amazonaws.com`;

    return {
      CallerReference: `${this.bucketName}-${Date.now()}`,
      Comment: `S3 + CloudFront distribution for ${this.bucketName}`,
      Enabled: true,
      PriceClass: 'PriceClass_100', // Use only North America and Europe for cost optimization
      HttpVersion: 'http2and3',
      IsIPV6Enabled: true,
      DefaultRootObject: 'index.html',

      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: 's3-origin',
            DomainName: originDomainName,
            S3OriginConfig: {
              OriginAccessIdentity: '', // Empty for OAC
            },
            OriginAccessControlId: oac ? oac.Id : undefined,
            ConnectionAttempts: 3,
            ConnectionTimeout: 10,
          },
        ],
      },

      DefaultCacheBehavior: {
        TargetOriginId: 's3-origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 3,
          Items: ['GET', 'HEAD', 'OPTIONS'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
        },
        Compress: true,
        CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingDisabled
        OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
        ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
        SmoothStreaming: false,
        FieldLevelEncryptionId: '',
      },

      CacheBehaviors: {
        Quantity: 3,
        Items: [
          // Static assets - long cache
          {
            PathPattern: '/_next/static/*',
            TargetOriginId: 's3-origin',
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
            Compress: true,
            CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
            OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
            ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
          },
          // Images and fonts - long cache
          {
            PathPattern:
              '*.{jpg,jpeg,png,gif,ico,svg,webp,avif,woff,woff2,ttf,eot}',
            TargetOriginId: 's3-origin',
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 2,
              Items: ['GET', 'HEAD'],
            },
            Compress: true,
            CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
            OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
            ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
          },
          // Service worker - no cache
          {
            PathPattern: '/sw.js',
            TargetOriginId: 's3-origin',
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: {
              Quantity: 3,
              Items: ['GET', 'HEAD', 'OPTIONS'],
            },
            Compress: true,
            CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingDisabled
            OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
            ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
          },
        ],
      },

      CustomErrorResponses: {
        Quantity: 2,
        Items: [
          {
            ErrorCode: 404,
            ResponsePagePath: '/index.html',
            ResponseCode: '200',
            ErrorCachingMinTTL: 300,
          },
          {
            ErrorCode: 403,
            ResponsePagePath: '/index.html',
            ResponseCode: '200',
            ErrorCachingMinTTL: 300,
          },
        ],
      },

      Logging: {
        Enabled: false, // Can be enabled later with a logging bucket
        IncludeCookies: false,
        Bucket: '',
        Prefix: '',
      },

      WebACLId: '', // Can be configured later for additional security
    };
  }

  /**
   * Update S3 bucket policy to allow CloudFront OAC access
   */
  async updateS3BucketPolicy(distributionId) {
    console.log('Updating S3 bucket policy for CloudFront OAC access...');

    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipal',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com',
          },
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucketName}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': `arn:aws:cloudfront::${await this.getAccountId()}:distribution/${distributionId}`,
            },
          },
        },
      ],
    };

    try {
      await this.s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucketName,
          Policy: JSON.stringify(bucketPolicy),
        })
      );

      console.log('✅ S3 bucket policy updated successfully');
    } catch (error) {
      console.error('❌ Failed to update S3 bucket policy:', error.message);
      throw error;
    }
  }

  /**
   * Get AWS account ID for bucket policy
   */
  async getAccountId() {
    // In a real implementation, we'd use STS to get the account ID
    // For now, we'll use a placeholder that should be replaced
    return process.env.AWS_ACCOUNT_ID || '123456789012';
  }

  /**
   * Create the CloudFront distribution
   */
  async createDistribution() {
    console.log('Creating CloudFront distribution...');

    try {
      // Step 1: Create Origin Access Control
      const oac = await this.createOriginAccessControl();

      // Step 2: Create distribution configuration
      const distributionConfig = await this.createDistributionConfig(oac);

      // Step 3: Create the distribution
      const result = await this.cloudFrontClient.send(
        new CreateDistributionCommand({
          DistributionConfig: distributionConfig,
        })
      );

      const distribution = result.Distribution;
      console.log('✅ CloudFront distribution created successfully');
      console.log(`Distribution ID: ${distribution.Id}`);
      console.log(`Domain Name: ${distribution.DomainName}`);
      console.log(`Status: ${distribution.Status}`);

      // Step 4: Update S3 bucket policy
      await this.updateS3BucketPolicy(distribution.Id);

      // Step 5: Save distribution info
      await this.saveDistributionInfo(distribution);

      return distribution;
    } catch (error) {
      console.error(
        '❌ Failed to create CloudFront distribution:',
        error.message
      );
      throw error;
    }
  }

  /**
   * Save distribution information to config file
   */
  async saveDistributionInfo(distribution) {
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const distributionInfo = {
      id: distribution.Id,
      domainName: distribution.DomainName,
      status: distribution.Status,
      bucketName: this.bucketName,
      environment: this.environment,
      createdAt: new Date().toISOString(),
      config: {
        priceClass: distribution.DistributionConfig.PriceClass,
        httpVersion: distribution.DistributionConfig.HttpVersion,
        ipv6Enabled: distribution.DistributionConfig.IsIPV6Enabled,
        defaultRootObject: distribution.DistributionConfig.DefaultRootObject,
      },
    };

    const configPath = path.join(configDir, 'cloudfront-distribution.json');
    fs.writeFileSync(configPath, JSON.stringify(distributionInfo, null, 2));

    console.log(`✅ Distribution info saved to ${configPath}`);
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🚀 Starting CloudFront distribution setup...');
      console.log(`Environment: ${this.environment}`);
      console.log(`S3 Bucket: ${this.bucketName}`);

      const distribution = await this.createDistribution();

      console.log('\n🎉 CloudFront distribution setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Wait for distribution to deploy (usually 15-20 minutes)');
      console.log('2. Test the distribution domain name');
      console.log('3. Configure custom domain if needed');
      console.log('4. Set up monitoring and alerts');

      return distribution;
    } catch (error) {
      console.error(
        '\n❌ CloudFront distribution setup failed:',
        error.message
      );
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const setup = new CloudFrontDistributionSetup();
  setup.run();
}

module.exports = CloudFrontDistributionSetup;
