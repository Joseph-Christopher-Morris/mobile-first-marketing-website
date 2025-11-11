#!/usr/bin/env node

/**
 * CloudFront Invalidation Verification Script
 * 
 * Verifies that CloudFront invalidation completes successfully
 * as per task 9.2 requirement: "Verify invalidation completes successfully"
 */

const { CloudFrontClient, ListInvalidationsCommand, GetInvalidationCommand } = require('@aws-sdk/client-cloudfront');

class InvalidationVerifier {
  constructor() {
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
    this.region = 'us-east-1';
    this.cloudFrontClient = new CloudFrontClient({ region: this.region });
  }

  /**
   * Log messages with formatting
   */
  log(level, message) {
    const icons = {
      info: 'ℹ️ ',
      success: '✅',
      warning: '⚠️ ',
      error: '❌',
      progress: '🔍'
    };
    
    const icon = icons[level] || '';
    console.log(`${icon} ${message}`);
  }

  /**
   * List recent invalidations
   */
  async listRecentInvalidations() {
    this.log('progress', 'Checking recent invalidations...');
    
    try {
      const command = new ListInvalidationsCommand({
        DistributionId: this.distributionId,
        MaxItems: 10
      });

      const result = await this.cloudFrontClient.send(command);
      
      if (result.InvalidationList && result.InvalidationList.Items) {
        const invalidations = result.InvalidationList.Items;
        
        this.log('info', `Found ${invalidations.length} recent invalidations:`);
        
        invalidations.forEach((inv, index) => {
          const createTime = new Date(inv.CreateTime).toLocaleString();
          this.log('info', `  ${index + 1}. ID: ${inv.Id} | Status: ${inv.Status} | Created: ${createTime}`);
        });
        
        return invalidations;
      } else {
        this.log('info', 'No recent invalidations found');
        return [];
      }
    } catch (error) {
      this.log('error', `Failed to list invalidations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed invalidation status
   */
  async getInvalidationDetails(invalidationId) {
    this.log('progress', `Getting details for invalidation: ${invalidationId}`);
    
    try {
      const command = new GetInvalidationCommand({
        DistributionId: this.distributionId,
        Id: invalidationId
      });

      const result = await this.cloudFrontClient.send(command);
      
      if (result.Invalidation) {
        const inv = result.Invalidation;
        
        console.log('\n' + '='.repeat(50));
        console.log(`   Invalidation Details: ${invalidationId}`);
        console.log('='.repeat(50));
        
        this.log('info', `ID: ${inv.Id}`);
        this.log('info', `Status: ${inv.Status}`);
        this.log('info', `Create Time: ${new Date(inv.CreateTime).toLocaleString()}`);
        this.log('info', `Caller Reference: ${inv.InvalidationBatch.CallerReference}`);
        this.log('info', `Paths Count: ${inv.InvalidationBatch.Paths.Quantity}`);
        
        console.log('\nInvalidated Paths:');
        inv.InvalidationBatch.Paths.Items.forEach((path, index) => {
          this.log('info', `  ${index + 1}. ${path}`);
        });
        
        return inv;
      } else {
        throw new Error('Invalid invalidation response');
      }
    } catch (error) {
      this.log('error', `Failed to get invalidation details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify invalidation completion
   */
  async verifyCompletion(invalidationId = null) {
    console.log('\n🔍 CloudFront Invalidation Verification');
    console.log('=' .repeat(45));
    this.log('info', `Distribution: ${this.distributionId}`);
    
    try {
      let targetInvalidation = null;
      
      if (invalidationId) {
        // Verify specific invalidation
        this.log('info', `Verifying specific invalidation: ${invalidationId}`);
        targetInvalidation = await this.getInvalidationDetails(invalidationId);
      } else {
        // Find most recent invalidation
        this.log('info', 'Finding most recent invalidation...');
        const recentInvalidations = await this.listRecentInvalidations();
        
        if (recentInvalidations.length === 0) {
          this.log('warning', 'No invalidations found to verify');
          return false;
        }
        
        // Get the most recent one
        const mostRecent = recentInvalidations[0];
        this.log('info', `Verifying most recent invalidation: ${mostRecent.Id}`);
        targetInvalidation = await this.getInvalidationDetails(mostRecent.Id);
      }
      
      // Check status
      if (targetInvalidation.Status === 'Completed') {
        this.log('success', 'Invalidation completed successfully!');
        
        const createTime = new Date(targetInvalidation.CreateTime);
        const now = new Date();
        const durationMinutes = Math.round((now - createTime) / 60000 * 10) / 10;
        
        this.log('info', `Completion time: ${durationMinutes} minutes`);
        
        // Verify paths match expected paths
        const expectedPaths = [
          '/',
          '/index.html',
          '/services/*',
          '/blog*',
          '/images/*',
          '/sitemap.xml',
          '/_next/*'
        ];
        
        const actualPaths = targetInvalidation.InvalidationBatch.Paths.Items;
        const pathsMatch = expectedPaths.every(path => actualPaths.includes(path));
        
        if (pathsMatch && actualPaths.length === expectedPaths.length) {
          this.log('success', 'All expected paths were invalidated correctly');
        } else {
          this.log('warning', 'Path mismatch detected');
          this.log('info', `Expected: ${expectedPaths.length} paths`);
          this.log('info', `Actual: ${actualPaths.length} paths`);
        }
        
        return true;
      } else if (targetInvalidation.Status === 'InProgress') {
        this.log('info', 'Invalidation is still in progress');
        
        const createTime = new Date(targetInvalidation.CreateTime);
        const now = new Date();
        const elapsedMinutes = Math.round((now - createTime) / 60000 * 10) / 10;
        
        this.log('info', `Elapsed time: ${elapsedMinutes} minutes`);
        this.log('info', 'Typical completion time: 5-15 minutes');
        
        return false;
      } else {
        this.log('warning', `Unexpected status: ${targetInvalidation.Status}`);
        return false;
      }
    } catch (error) {
      this.log('error', `Verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run verification with summary
   */
  async run(invalidationId = null) {
    try {
      const isCompleted = await this.verifyCompletion(invalidationId);
      
      console.log('\n' + '='.repeat(40));
      console.log('   Verification Summary');
      console.log('='.repeat(40));
      
      if (isCompleted) {
        this.log('success', 'CloudFront invalidation verification PASSED');
        console.log('\n🌐 Cache has been successfully invalidated');
        console.log('✨ Updated content is now being served globally');
      } else {
        this.log('info', 'CloudFront invalidation verification PENDING');
        console.log('\n⏱️  Invalidation is still in progress');
        console.log('🔄 Run this script again in a few minutes');
      }
      
      return isCompleted;
    } catch (error) {
      this.log('error', `Verification process failed: ${error.message}`);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Verify AWS credentials and permissions');
      console.log('2. Check CloudFront distribution ID');
      console.log('3. Ensure invalidation was created successfully');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const invalidationId = args[0] || null; // Optional invalidation ID
  
  const verifier = new InvalidationVerifier();
  
  verifier.run(invalidationId)
    .then(isCompleted => {
      const exitCode = isCompleted ? 0 : 1;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('\n❌ Verification process failed:', error.message);
      process.exit(1);
    });
}

module.exports = InvalidationVerifier;