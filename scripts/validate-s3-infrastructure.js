#!/usr/bin/env node

/**
 * S3 Infrastructure Validation Script
 * Validates that the S3 bucket is properly configured for secure static hosting
 */

const { S3Client, GetBucketVersioningCommand, GetBucketEncryptionCommand,
        GetBucketPublicAccessBlockCommand, GetBucketPolicyCommand,
        HeadBucketCommand } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-providers');

class S3InfrastructureValidator {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: fromEnv()
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
  }

  /**
   * Validate bucket exists and is accessible
   */
  async validateBucketExists() {
    console.log('🔍 Checking if bucket exists...');
    
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log('✅ Bucket exists and is accessible');
      return true;
    } catch (error) {
      console.error('❌ Bucket validation failed:', error.message);
      return false;
    }
  }

  /**
   * Validate public access is blocked
   */
  async validatePublicAccessBlocked() {
    console.log('🔍 Checking public access block configuration...');
    
    try {
      const response = await this.s3Client.send(
        new GetBucketPublicAccessBlockCommand({ Bucket: this.bucketName })
      );
      
      const config = response.PublicAccessBlockConfiguration;
      const isFullyBlocked = config.BlockPublicAcls && 
                            config.IgnorePublicAcls && 
                            config.BlockPublicPolicy && 
                            config.RestrictPublicBuckets;
      
      if (isFullyBlocked) {
        console.log('✅ Public access is properly blocked');
        return true;
      } else {
        console.error('❌ Public access is not fully blocked');
        console.error('   Current configuration:', config);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to check public access block:', error.message);
      return false;
    }
  }

  /**
   * Validate versioning is enabled
   */
  async validateVersioning() {
    console.log('🔍 Checking versioning configuration...');
    
    try {
      const response = await this.s3Client.send(
        new GetBucketVersioningCommand({ Bucket: this.bucketName })
      );
      
      if (response.Status === 'Enabled') {
        console.log('✅ Versioning is enabled');
        return true;
      } else {
        console.error('❌ Versioning is not enabled');
        console.error('   Current status:', response.Status || 'Not configured');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to check versioning:', error.message);
      return false;
    }
  }

  /**
   * Validate encryption is enabled
   */
  async validateEncryption() {
    console.log('🔍 Checking encryption configuration...');
    
    try {
      const response = await this.s3Client.send(
        new GetBucketEncryptionCommand({ Bucket: this.bucketName })
      );
      
      const rules = response.ServerSideEncryptionConfiguration?.Rules || [];
      const hasAES256 = rules.some(rule => 
        rule.ApplyServerSideEncryptionByDefault?.SSEAlgorithm === 'AES256'
      );
      
      if (hasAES256) {
        console.log('✅ AES256 encryption is enabled');
        return true;
      } else {
        console.error('❌ AES256 encryption is not properly configured');
        console.error('   Current rules:', rules);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to check encryption:', error.message);
      return false;
    }
  }

  /**
   * Validate bucket policy restricts access
   */
  async validateBucketPolicy() {
    console.log('🔍 Checking bucket policy...');
    
    try {
      const response = await this.s3Client.send(
        new GetBucketPolicyCommand({ Bucket: this.bucketName })
      );
      
      const policy = JSON.parse(response.Policy);
      const hasDenyStatement = policy.Statement?.some(statement => 
        statement.Effect === 'Deny' && 
        statement.Action === 's3:GetObject'
      );
      
      if (hasDenyStatement) {
        console.log('✅ Restrictive bucket policy is in place');
        return true;
      } else {
        console.error('❌ Bucket policy does not properly restrict access');
        return false;
      }
    } catch (error) {
      if (error.name === 'NoSuchBucketPolicy') {
        console.error('❌ No bucket policy found');
      } else {
        console.error('❌ Failed to check bucket policy:', error.message);
      }
      return false;
    }
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('🚀 Starting S3 infrastructure validation...');
    console.log(`Bucket: ${this.bucketName}`);
    console.log(`Region: ${this.region}\n`);
    
    const validations = [
      { name: 'Bucket Exists', fn: () => this.validateBucketExists() },
      { name: 'Public Access Blocked', fn: () => this.validatePublicAccessBlocked() },
      { name: 'Versioning Enabled', fn: () => this.validateVersioning() },
      { name: 'Encryption Enabled', fn: () => this.validateEncryption() },
      { name: 'Bucket Policy Configured', fn: () => this.validateBucketPolicy() }
    ];
    
    let allPassed = true;
    const results = [];
    
    for (const validation of validations) {
      try {
        const passed = await validation.fn();
        results.push({ name: validation.name, passed });
        if (!passed) allPassed = false;
      } catch (error) {
        console.error(`❌ ${validation.name} validation failed:`, error.message);
        results.push({ name: validation.name, passed: false, error: error.message });
        allPassed = false;
      }
      console.log(''); // Add spacing between validations
    }
    
    // Summary
    console.log('📋 Validation Summary:');
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`   ${status} ${result.name}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    if (allPassed) {
      console.log('\n🎉 All validations passed! S3 infrastructure is properly configured.');
    } else {
      console.log('\n⚠️  Some validations failed. Please review the configuration.');
    }
    
    return allPassed;
  }
}

// CLI execution
if (require.main === module) {
  const validator = new S3InfrastructureValidator();
  
  validator.validate()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = S3InfrastructureValidator;