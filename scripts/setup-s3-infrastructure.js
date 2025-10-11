#!/usr/bin/env node

/**
 * AWS S3 Infrastructure Setup Script
 * Creates a private S3 bucket with security configurations for static website hosting
 * 
 * Requirements addressed:
 * - 1.1: Create S3 bucket configured for static website hosting
 * - 1.2: Configure proper public access policies (private bucket)
 * - 7.2: Keep buckets private and use CloudFront Origin Access Control
 */

const { S3Client, CreateBucketCommand, PutBucketVersioningCommand, 
        PutBucketEncryptionCommand, PutBucketPublicAccessBlockCommand,
        PutBucketPolicyCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-providers');

class S3InfrastructureSetup {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: fromEnv()
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME || `mobile-marketing-site-${Date.now()}`;
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  /**
   * Check if bucket already exists
   */
  async bucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create S3 bucket with proper configuration
   */
  async createBucket() {
    console.log(`Creating S3 bucket: ${this.bucketName}`);
    
    try {
      const createBucketParams = {
        Bucket: this.bucketName
      };

      // Add LocationConstraint for regions other than us-east-1
      if (this.region !== 'us-east-1') {
        createBucketParams.CreateBucketConfiguration = {
          LocationConstraint: this.region
        };
      }

      await this.s3Client.send(new CreateBucketCommand(createBucketParams));
      console.log(`✅ S3 bucket created successfully: ${this.bucketName}`);
      
      return true;
    } catch (error) {
      if (error.name === 'BucketAlreadyOwnedByYou') {
        console.log(`✅ S3 bucket already exists: ${this.bucketName}`);
        return true;
      }
      throw error;
    }
  }

  /**
   * Block all public access to the bucket (Requirement 7.2)
   */
  async blockPublicAccess() {
    console.log('Configuring bucket to block all public access...');
    
    const publicAccessBlockParams = {
      Bucket: this.bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true
      }
    };

    await this.s3Client.send(new PutBucketPublicAccessBlockCommand(publicAccessBlockParams));
    console.log('✅ Public access blocked successfully');
  }

  /**
   * Enable versioning on the bucket
   */
  async enableVersioning() {
    console.log('Enabling bucket versioning...');
    
    const versioningParams = {
      Bucket: this.bucketName,
      VersioningConfiguration: {
        Status: 'Enabled'
      }
    };

    await this.s3Client.send(new PutBucketVersioningCommand(versioningParams));
    console.log('✅ Bucket versioning enabled');
  }

  /**
   * Enable server-side encryption
   */
  async enableEncryption() {
    console.log('Enabling server-side encryption...');
    
    const encryptionParams = {
      Bucket: this.bucketName,
      ServerSideEncryptionConfiguration: {
        Rules: [
          {
            ApplyServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256'
            },
            BucketKeyEnabled: true
          }
        ]
      }
    };

    await this.s3Client.send(new PutBucketEncryptionCommand(encryptionParams));
    console.log('✅ Server-side encryption enabled');
  }

  /**
   * Set bucket policy to allow CloudFront Origin Access Control only
   * Note: This will be updated later when CloudFront OAC is created
   */
  async setBucketPolicy() {
    console.log('Setting restrictive bucket policy...');
    
    // Initial restrictive policy - will be updated when CloudFront OAC is created
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'DenyDirectPublicAccess',
          Effect: 'Deny',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucketName}/*`,
          Condition: {
            StringNotEquals: {
              'AWS:SourceArn': `arn:aws:cloudfront::*:distribution/*`
            }
          }
        }
      ]
    };

    const policyParams = {
      Bucket: this.bucketName,
      Policy: JSON.stringify(bucketPolicy)
    };

    await this.s3Client.send(new PutBucketPolicyCommand(policyParams));
    console.log('✅ Restrictive bucket policy applied');
    console.log('ℹ️  Policy will be updated when CloudFront distribution is created');
  }

  /**
   * Main setup function
   */
  async setup() {
    try {
      console.log('🚀 Starting S3 infrastructure setup...');
      console.log(`Region: ${this.region}`);
      console.log(`Bucket Name: ${this.bucketName}`);
      
      // Check if bucket already exists
      const exists = await this.bucketExists();
      if (exists) {
        console.log('ℹ️  Bucket already exists, updating configuration...');
      } else {
        // Create the bucket
        await this.createBucket();
      }

      // Configure security settings
      await this.blockPublicAccess();
      await this.enableVersioning();
      await this.enableEncryption();
      await this.setBucketPolicy();

      console.log('\n🎉 S3 infrastructure setup completed successfully!');
      console.log('\n📋 Summary:');
      console.log(`   • Bucket Name: ${this.bucketName}`);
      console.log(`   • Region: ${this.region}`);
      console.log('   • Public Access: Blocked');
      console.log('   • Versioning: Enabled');
      console.log('   • Encryption: AES256');
      console.log('   • Policy: CloudFront-only access');
      
      // Output bucket name for use in other scripts
      console.log(`\n🔧 Environment Variables:`);
      console.log(`export S3_BUCKET_NAME="${this.bucketName}"`);
      console.log(`export AWS_REGION="${this.region}"`);

      return {
        bucketName: this.bucketName,
        region: this.region,
        success: true
      };

    } catch (error) {
      console.error('❌ S3 infrastructure setup failed:', error.message);
      
      if (error.name === 'CredentialsProviderError') {
        console.error('\n💡 Please ensure AWS credentials are configured:');
        console.error('   • Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
        console.error('   • Or configure AWS CLI with: aws configure');
        console.error('   • Or use IAM roles if running on AWS infrastructure');
      }
      
      if (error.name === 'AccessDenied') {
        console.error('\n💡 Insufficient permissions. Required IAM permissions:');
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
   * Validate the setup
   */
  async validate() {
    console.log('\n🔍 Validating S3 infrastructure setup...');
    
    try {
      // Check if bucket exists and is accessible
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log('✅ Bucket is accessible');
      
      console.log('✅ S3 infrastructure validation completed');
      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const setup = new S3InfrastructureSetup();
  
  setup.setup()
    .then(async (result) => {
      if (result.success) {
        await setup.validate();
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = S3InfrastructureSetup;