#!/usr/bin/env node

/**
 * AWS Infrastructure Setup Script
 * Creates complete S3 + CloudFront infrastructure for static website hosting
 *
 * Requirements addressed:
 * - 1.1: Create S3 bucket configured for static website hosting
 * - 1.2: Configure proper public access policies (private bucket)
 * - 2.1: CloudFront distribution with private S3 origin
 * - 7.2: Keep buckets private and use CloudFront Origin Access Control
 */

const {
  S3Client,
  CreateBucketCommand,
  PutBucketVersioningCommand,
  PutBucketEncryptionCommand,
  PutBucketPublicAccessBlockCommand,
  PutBucketPolicyCommand,
  HeadBucketCommand,
  GetBucketLocationCommand,
} = require('@aws-sdk/client-s3');

const {
  CloudFrontClient,
  CreateDistributionCommand,
  CreateOriginAccessControlCommand,
  ListOriginAccessControlsCommand,
} = require('@aws-sdk/client-cloudfront');

const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const fs = require('fs');
const path = require('path');

class InfrastructureSetup {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.S3_BUCKET_NAME || this.generateBucketName();
    this.environment = process.env.ENVIRONMENT || 'production';

    this.s3Client = new S3Client({ region: this.region });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
    this.stsClient = new STSClient({ region: this.region });

    this.accountId = null;
    this.distributionId = null;
    this.oacId = null;
  }

  /**
   * Generate a unique bucket name
   */
  generateBucketName() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `mobile-marketing-site-${this.environment}-${timestamp}-${random}`;
  }

  /**
   * Get AWS account ID
   */
  async getAccountId() {
    if (this.accountId) return this.accountId;

    try {
      const result = await this.stsClient.send(
        new GetCallerIdentityCommand({})
      );
      this.accountId = result.Account;
      return this.accountId;
    } catch (error) {
      console.error('Failed to get AWS account ID:', error.message);
      throw error;
    }
  }

  /**
   * Validate AWS credentials and permissions
   */
  async validateCredentials() {
    console.log('🔍 Validating AWS credentials and permissions...');

    try {
      await this.getAccountId();
      console.log(`✅ AWS credentials valid for account: ${this.accountId}`);
      return true;
    } catch (error) {
      console.error('❌ AWS credentials validation failed:', error.message);
      console.error('\n💡 Please ensure AWS credentials are configured:');
      console.error(
        '   • Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables'
      );
      console.error('   • Or configure AWS CLI with: aws configure');
      console.error('   • Or use IAM roles if running on AWS infrastructure');
      throw error;
    }
  }

  /**
   * Check if S3 bucket exists
   */
  async bucketExists() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName })
      );
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create S3 bucket with security configuration
   */
  async setupS3Bucket() {
    console.log(`📦 Setting up S3 bucket: ${this.bucketName}`);

    try {
      // Check if bucket exists
      const exists = await this.bucketExists();

      if (!exists) {
        // Create bucket
        const createBucketParams = {
          Bucket: this.bucketName,
        };

        // Add LocationConstraint for regions other than us-east-1
        if (this.region !== 'us-east-1') {
          createBucketParams.CreateBucketConfiguration = {
            LocationConstraint: this.region,
          };
        }

        await this.s3Client.send(new CreateBucketCommand(createBucketParams));
        console.log('✅ S3 bucket created successfully');
      } else {
        console.log('✅ S3 bucket already exists, updating configuration...');
      }

      // Block all public access
      await this.s3Client.send(
        new PutBucketPublicAccessBlockCommand({
          Bucket: this.bucketName,
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            IgnorePublicAcls: true,
            BlockPublicPolicy: true,
            RestrictPublicBuckets: true,
          },
        })
      );
      console.log('✅ Public access blocked');

      // Enable versioning
      await this.s3Client.send(
        new PutBucketVersioningCommand({
          Bucket: this.bucketName,
          VersioningConfiguration: {
            Status: 'Enabled',
          },
        })
      );
      console.log('✅ Versioning enabled');

      // Enable encryption
      await this.s3Client.send(
        new PutBucketEncryptionCommand({
          Bucket: this.bucketName,
          ServerSideEncryptionConfiguration: {
            Rules: [
              {
                ApplyServerSideEncryptionByDefault: {
                  SSEAlgorithm: 'AES256',
                },
                BucketKeyEnabled: true,
              },
            ],
          },
        })
      );
      console.log('✅ Server-side encryption enabled');

      return true;
    } catch (error) {
      console.error('❌ S3 bucket setup failed:', error.message);

      if (error.name === 'AccessDenied') {
        console.error(
          '\n💡 Insufficient S3 permissions. Required IAM permissions:'
        );
        console.error('   • s3:CreateBucket');
        console.error('   • s3:PutBucketVersioning');
        console.error('   • s3:PutBucketEncryption');
        console.error('   • s3:PutBucketPublicAccessBlock');
        console.error('   • s3:PutBucketPolicy');
        console.error('   • s3:HeadBucket');
      }

      throw error;
    }
  }

  /**
   * Create or find existing Origin Access Control
   */
  async setupOriginAccessControl() {
    console.log('🔐 Setting up Origin Access Control (OAC)...');

    const oacName = `${this.bucketName}-oac`;

    try {
      // Check if OAC already exists
      const listResult = await this.cloudFrontClient.send(
        new ListOriginAccessControlsCommand({})
      );
      const existingOAC = listResult.OriginAccessControlList?.Items?.find(
        oac => oac.Name === oacName
      );

      if (existingOAC) {
        console.log('✅ Origin Access Control already exists');
        this.oacId = existingOAC.Id;
        return existingOAC;
      }

      // Create new OAC
      const oacConfig = {
        Name: oacName,
        Description: `Origin Access Control for ${this.bucketName} S3 bucket`,
        OriginAccessControlConfig: {
          Name: oacName,
          Description: `OAC for secure access to ${this.bucketName}`,
          SigningBehavior: 'always',
          SigningProtocol: 'sigv4',
          OriginAccessControlOriginType: 's3',
        },
      };

      const result = await this.cloudFrontClient.send(
        new CreateOriginAccessControlCommand(oacConfig)
      );

      this.oacId = result.OriginAccessControl.Id;
      console.log('✅ Origin Access Control created successfully');
      console.log(`   OAC ID: ${this.oacId}`);

      return result.OriginAccessControl;
    } catch (error) {
      console.error('❌ Origin Access Control setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Get S3 bucket region
   */
  async getBucketRegion() {
    try {
      const result = await this.s3Client.send(
        new GetBucketLocationCommand({ Bucket: this.bucketName })
      );
      return result.LocationConstraint || 'us-east-1';
    } catch (error) {
      console.warn(
        `Could not determine bucket region, using ${this.region}: ${error.message}`
      );
      return this.region;
    }
  }

  /**
   * Create CloudFront distribution
   */
  async setupCloudFrontDistribution() {
    console.log('☁️ Setting up CloudFront distribution...');

    try {
      const bucketRegion = await this.getBucketRegion();
      const originDomainName = `${this.bucketName}.s3.${bucketRegion}.amazonaws.com`;

      const distributionConfig = {
        CallerReference: `${this.bucketName}-${Date.now()}`,
        Comment: `S3 + CloudFront distribution for ${this.bucketName} (${this.environment})`,
        Enabled: true,
        PriceClass: 'PriceClass_100', // Cost optimization: US, Canada, Europe only
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
              OriginAccessControlId: this.oacId,
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
          CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingDisabled for HTML
          OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // Managed-CORS-S3Origin
          ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03', // Managed-SecurityHeadersPolicy
          SmoothStreaming: false,
          FieldLevelEncryptionId: '',
        },

        CacheBehaviors: {
          Quantity: 2,
          Items: [
            // Static assets - long cache (1 year)
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
              OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
              ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03',
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
              OriginRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
              ResponseHeadersPolicyId: '67f7725c-6f97-4210-82d7-5512b31e9d03',
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
          Enabled: false,
          IncludeCookies: false,
          Bucket: '',
          Prefix: '',
        },

        WebACLId: '',
      };

      const result = await this.cloudFrontClient.send(
        new CreateDistributionCommand({
          DistributionConfig: distributionConfig,
        })
      );

      const distribution = result.Distribution;
      this.distributionId = distribution.Id;

      console.log('✅ CloudFront distribution created successfully');
      console.log(`   Distribution ID: ${this.distributionId}`);
      console.log(`   Domain Name: ${distribution.DomainName}`);
      console.log(`   Status: ${distribution.Status}`);

      return distribution;
    } catch (error) {
      console.error('❌ CloudFront distribution setup failed:', error.message);

      if (error.name === 'AccessDenied') {
        console.error(
          '\n💡 Insufficient CloudFront permissions. Required IAM permissions:'
        );
        console.error('   • cloudfront:CreateDistribution');
        console.error('   • cloudfront:CreateOriginAccessControl');
        console.error('   • cloudfront:ListOriginAccessControls');
      }

      throw error;
    }
  }

  /**
   * Update S3 bucket policy to allow CloudFront OAC access
   */
  async updateS3BucketPolicy() {
    console.log('🔒 Updating S3 bucket policy for CloudFront access...');

    try {
      const accountId = await this.getAccountId();

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
                'AWS:SourceArn': `arn:aws:cloudfront::${accountId}:distribution/${this.distributionId}`,
              },
            },
          },
        ],
      };

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
   * Save infrastructure configuration
   */
  async saveConfiguration(distribution) {
    console.log('💾 Saving infrastructure configuration...');

    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const config = {
      version: '1.0',
      environment: this.environment,
      createdAt: new Date().toISOString(),
      accountId: this.accountId,
      region: this.region,
      s3: {
        bucketName: this.bucketName,
        region: this.region,
        versioning: 'Enabled',
        encryption: 'AES256',
        publicAccess: 'Blocked',
      },
      cloudfront: {
        distributionId: this.distributionId,
        domainName: distribution.DomainName,
        status: distribution.Status,
        oacId: this.oacId,
        priceClass: 'PriceClass_100',
        httpVersion: 'http2and3',
        ipv6Enabled: true,
      },
      deployment: {
        buildCommand: 'npm run build',
        outputDirectory: 'out',
        indexDocument: 'index.html',
        errorDocument: 'index.html',
      },
    };

    const configPath = path.join(configDir, 'infrastructure.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✅ Configuration saved to ${configPath}`);

    // Also create environment file for easy sourcing
    const envPath = path.join(configDir, 'infrastructure.env');
    const envContent = [
      `# AWS Infrastructure Configuration`,
      `# Generated on ${new Date().toISOString()}`,
      ``,
      `AWS_REGION=${this.region}`,
      `AWS_ACCOUNT_ID=${this.accountId}`,
      `S3_BUCKET_NAME=${this.bucketName}`,
      `CLOUDFRONT_DISTRIBUTION_ID=${this.distributionId}`,
      `CLOUDFRONT_DOMAIN_NAME=${distribution.DomainName}`,
      `CLOUDFRONT_OAC_ID=${this.oacId}`,
      `ENVIRONMENT=${this.environment}`,
      ``,
    ].join('\n');

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Environment variables saved to ${envPath}`);

    return config;
  }

  /**
   * Validate infrastructure setup
   */
  async validateSetup() {
    console.log('🔍 Validating infrastructure setup...');

    try {
      // Validate S3 bucket
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName })
      );
      console.log('✅ S3 bucket is accessible');

      // Note: CloudFront distribution validation would require waiting for deployment
      // which can take 15-20 minutes, so we'll skip that for now

      console.log('✅ Infrastructure validation completed');
      return true;
    } catch (error) {
      console.error('❌ Infrastructure validation failed:', error.message);
      return false;
    }
  }

  /**
   * Main setup execution
   */
  async run() {
    try {
      console.log('🚀 Starting AWS infrastructure setup...');
      console.log(`Environment: ${this.environment}`);
      console.log(`Region: ${this.region}`);
      console.log(`Bucket Name: ${this.bucketName}`);
      console.log('');

      // Step 1: Validate credentials
      await this.validateCredentials();

      // Step 2: Setup S3 bucket
      await this.setupS3Bucket();

      // Step 3: Setup Origin Access Control
      await this.setupOriginAccessControl();

      // Step 4: Setup CloudFront distribution
      const distribution = await this.setupCloudFrontDistribution();

      // Step 5: Update S3 bucket policy
      await this.updateS3BucketPolicy();

      // Step 6: Save configuration
      const config = await this.saveConfiguration(distribution);

      // Step 7: Validate setup
      await this.validateSetup();

      console.log('\n🎉 AWS infrastructure setup completed successfully!');
      console.log('\n📋 Summary:');
      console.log(`   • S3 Bucket: ${this.bucketName}`);
      console.log(`   • CloudFront Distribution: ${this.distributionId}`);
      console.log(`   • CloudFront Domain: ${distribution.DomainName}`);
      console.log(`   • Region: ${this.region}`);
      console.log(`   • Environment: ${this.environment}`);

      console.log('\n⏳ Next steps:');
      console.log(
        '1. Wait for CloudFront distribution to deploy (15-20 minutes)'
      );
      console.log('2. Test the CloudFront domain name');
      console.log('3. Run the deployment script to upload your site');
      console.log('4. Configure custom domain if needed');

      console.log('\n🔧 Environment variables for deployment:');
      console.log(`export S3_BUCKET_NAME="${this.bucketName}"`);
      console.log(`export CLOUDFRONT_DISTRIBUTION_ID="${this.distributionId}"`);
      console.log(`export AWS_REGION="${this.region}"`);

      return config;
    } catch (error) {
      console.error('\n❌ Infrastructure setup failed:', error.message);
      console.error('\n🔧 Troubleshooting tips:');
      console.error('1. Verify AWS credentials are configured correctly');
      console.error('2. Check IAM permissions for S3 and CloudFront');
      console.error('3. Ensure the AWS region is supported');
      console.error('4. Check for any resource limits or quotas');

      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new InfrastructureSetup();
  setup.run();
}

module.exports = InfrastructureSetup;
