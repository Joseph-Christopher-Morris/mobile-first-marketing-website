#!/usr/bin/env node

/**
 * S3 Infrastructure Test Script
 * Tests the S3 infrastructure setup and validation functionality
 */

const S3InfrastructureSetup = require('./setup-s3-infrastructure');
const S3InfrastructureValidator = require('./validate-s3-infrastructure');

class S3InfrastructureTest {
  constructor() {
    this.testBucketName = `test-mobile-marketing-${Date.now()}`;
    this.originalBucketName = process.env.S3_BUCKET_NAME;
    
    // Set test environment
    process.env.S3_BUCKET_NAME = this.testBucketName;
    process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
  }

  async runTests() {
    console.log('🧪 Starting S3 Infrastructure Tests...');
    console.log(`Test Bucket: ${this.testBucketName}\n`);

    try {
      // Test 1: Setup Infrastructure
      console.log('📋 Test 1: Infrastructure Setup');
      const setup = new S3InfrastructureSetup();
      const setupResult = await setup.setup();
      
      if (!setupResult.success) {
        throw new Error('Infrastructure setup failed');
      }
      console.log('✅ Infrastructure setup test passed\n');

      // Test 2: Validate Infrastructure
      console.log('📋 Test 2: Infrastructure Validation');
      const validator = new S3InfrastructureValidator();
      const validationResult = await validator.validate();
      
      if (!validationResult) {
        throw new Error('Infrastructure validation failed');
      }
      console.log('✅ Infrastructure validation test passed\n');

      // Test 3: Re-run Setup (should handle existing bucket)
      console.log('📋 Test 3: Re-run Setup on Existing Bucket');
      const setupAgain = new S3InfrastructureSetup();
      const setupAgainResult = await setupAgain.setup();
      
      if (!setupAgainResult.success) {
        throw new Error('Re-run setup failed');
      }
      console.log('✅ Re-run setup test passed\n');

      console.log('🎉 All tests passed successfully!');
      return true;

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return false;
    } finally {
      // Cleanup: Remove test bucket
      await this.cleanup();
      
      // Restore original environment
      if (this.originalBucketName) {
        process.env.S3_BUCKET_NAME = this.originalBucketName;
      } else {
        delete process.env.S3_BUCKET_NAME;
      }
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test resources...');
    
    try {
      const { S3Client, DeleteBucketCommand, ListObjectVersionsCommand, 
              DeleteObjectsCommand } = require('@aws-sdk/client-s3');
      const { fromEnv } = require('@aws-sdk/credential-providers');
      
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: fromEnv()
      });

      // List and delete all object versions
      try {
        const listResponse = await s3Client.send(
          new ListObjectVersionsCommand({ Bucket: this.testBucketName })
        );
        
        if (listResponse.Versions?.length > 0 || listResponse.DeleteMarkers?.length > 0) {
          const objectsToDelete = [
            ...(listResponse.Versions || []).map(v => ({ Key: v.Key, VersionId: v.VersionId })),
            ...(listResponse.DeleteMarkers || []).map(d => ({ Key: d.Key, VersionId: d.VersionId }))
          ];
          
          await s3Client.send(new DeleteObjectsCommand({
            Bucket: this.testBucketName,
            Delete: { Objects: objectsToDelete }
          }));
        }
      } catch (error) {
        // Bucket might be empty, continue with deletion
      }

      // Delete the bucket
      await s3Client.send(new DeleteBucketCommand({ Bucket: this.testBucketName }));
      console.log('✅ Test bucket cleaned up successfully');
      
    } catch (error) {
      console.warn('⚠️  Failed to cleanup test bucket:', error.message);
      console.warn('   Please manually delete bucket:', this.testBucketName);
    }
  }
}

// CLI execution
if (require.main === module) {
  const test = new S3InfrastructureTest();
  
  test.runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = S3InfrastructureTest;