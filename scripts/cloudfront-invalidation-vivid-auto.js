#!/usr/bin/env node

/**
 * CloudFront Cache Invalidation for Vivid Auto SCRAM Rebuild
 * 
 * Task 9.2: Implement CloudFront invalidation commands
 * - Create aws cloudfront create-invalidation command with distribution ID E2IBMHQ3GCW6ZK
 * - Configure invalidation for all specified paths
 * - Verify invalidation completes successfully
 * 
 * Requirements addressed: 9.4
 */

const { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand } = require('@aws-sdk/client-cloudfront');

class CloudFrontInvalidation {
  constructor() {
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
    this.region = 'us-east-1'; // CloudFront is always us-east-1
    
    // Invalidation paths as specified in requirements 8.3
    this.defaultPaths = [
      '/',
      '/index.html',
      '/services/*',
      '/blog*',
      '/images/*',
      '/sitemap.xml',
      '/_next/*'
    ];
    
    this.cloudFrontClient = new CloudFrontClient({ region: this.region });
  }

  /**
   * Log messages with timestamps and formatting
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    const icons = {
      info: 'ℹ️ ',
      success: '✅',
      warning: '⚠️ ',
      error: '❌',
      progress: '🔄'
    };
    
    const icon = icons[level] || '';
    console.log(`${icon} ${message}`);
  }

  /**
   * Validate configuration and access
   */
  async validateAccess() {
    this.log('info', 'Validating CloudFront access...');
    
    try {
      // Test access by getting distribution info
      const { CloudFrontClient, GetDistributionCommand } = require('@aws-sdk/client-cloudfront');
      const client = new CloudFrontClient({ region: this.region });
      
      const command = new GetDistributionCommand({
        Id: this.distributionId
      });
      
      const result = await client.send(command);
      
      if (result.Distribution) {
        this.log('success', `CloudFront distribution access verified: ${this.distributionId}`);
        this.log('info', `Status: ${result.Distribution.Status}`);
        this.log('info', `Domain: ${result.Distribution.DomainName}`);
        return true;
      } else {
        throw new Error('Invalid distribution response');
      }
    } catch (error) {
      this.log('error', `Cannot access CloudFront distribution: ${error.message}`);
      this.log('info', 'Please verify:');
      this.log('info', '1. Distribution ID is correct');
      this.log('info', '2. AWS credentials have CloudFront permissions');
      this.log('info', '3. Distribution exists and is accessible');
      throw error;
    }
  }

  /**
   * Create cache invalidation
   */
  async createInvalidation(paths = null) {
    const pathsToInvalidate = paths || this.defaultPaths;
    
    this.log('progress', 'Starting cache invalidation...');
    this.log('info', `Distribution: ${this.distributionId}`);
    this.log('info', `Paths to invalidate (${pathsToInvalidate.length}):`);
    
    pathsToInvalidate.forEach(path => {
      this.log('info', `  - ${path}`);
    });

    try {
      // Generate unique caller reference
      const callerReference = `vivid-auto-scram-${Date.now()}`;
      
      const command = new CreateInvalidationCommand({
        DistributionId: this.distributionId,
        InvalidationBatch: {
          CallerReference: callerReference,
          Paths: {
            Quantity: pathsToInvalidate.length,
            Items: pathsToInvalidate
          }
        }
      });

      const result = await this.cloudFrontClient.send(command);
      
      if (result.Invalidation) {
        this.log('success', 'Cache invalidation started successfully!');
        this.log('info', `Invalidation ID: ${result.Invalidation.Id}`);
        this.log('info', `Status: ${result.Invalidation.Status}`);
        this.log('info', `Create Time: ${result.Invalidation.CreateTime}`);
        
        return {
          success: true,
          invalidationId: result.Invalidation.Id,
          status: result.Invalidation.Status,
          createTime: result.Invalidation.CreateTime,
          pathsCount: pathsToInvalidate.length
        };
      } else {
        throw new Error('Invalid invalidation response');
      }
    } catch (error) {
      this.log('error', `Cache invalidation failed: ${error.message}`);
      this.log('info', 'Common issues:');
      this.log('info', '1. Invalid distribution ID');
      this.log('info', '2. Insufficient CloudFront permissions');
      this.log('info', '3. Too many concurrent invalidations (limit: 3)');
      this.log('info', '4. Invalid path format');
      throw error;
    }
  }

  /**
   * Check invalidation status
   */
  async checkInvalidationStatus(invalidationId) {
    try {
      const command = new GetInvalidationCommand({
        DistributionId: this.distributionId,
        Id: invalidationId
      });

      const result = await this.cloudFrontClient.send(command);
      
      if (result.Invalidation) {
        return {
          id: result.Invalidation.Id,
          status: result.Invalidation.Status,
          createTime: result.Invalidation.CreateTime,
          pathsCount: result.Invalidation.InvalidationBatch.Paths.Quantity
        };
      } else {
        throw new Error('Invalid status response');
      }
    } catch (error) {
      this.log('warning', `Could not check invalidation status: ${error.message}`);
      return null;
    }
  }

  /**
   * Wait for invalidation completion
   */
  async waitForCompletion(invalidationId, maxWaitMinutes = 20) {
    this.log('progress', 'Waiting for invalidation completion...');
    this.log('info', `Invalidation ID: ${invalidationId}`);
    this.log('info', `Max wait time: ${maxWaitMinutes} minutes`);

    const maxWaitTime = maxWaitMinutes * 60 * 1000; // Convert to milliseconds
    const checkInterval = 30 * 1000; // 30 seconds
    const startTime = Date.now();

    while ((Date.now() - startTime) < maxWaitTime) {
      const status = await this.checkInvalidationStatus(invalidationId);
      
      if (status) {
        const elapsedMinutes = Math.round((Date.now() - startTime) / 60000 * 10) / 10;
        this.log('info', `Status: ${status.status} (Elapsed: ${elapsedMinutes} minutes)`);
        
        if (status.status === 'Completed') {
          this.log('success', 'Invalidation completed successfully!');
          this.log('info', `Total time: ${elapsedMinutes} minutes`);
          return true;
        }
        
        if (status.status === 'InProgress') {
          // Continue waiting
        } else {
          this.log('warning', `Unexpected status: ${status.status}`);
        }
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    this.log('warning', 'Timeout waiting for invalidation completion');
    this.log('info', 'Invalidation may still be in progress. Check AWS Console for status.');
    return false;
  }

  /**
   * Generate summary report
   */
  generateSummary(result) {
    console.log('\n' + '='.repeat(50));
    console.log('   CloudFront Invalidation Summary');
    console.log('='.repeat(50));
    
    this.log('info', `Distribution: ${this.distributionId}`);
    this.log('info', `Invalidation ID: ${result.invalidationId}`);
    this.log('info', `Paths Invalidated: ${result.pathsCount}`);
    this.log('info', `Status: ${result.status}`);
    this.log('info', `Started: ${result.createTime}`);
    this.log('info', `Completed: ${new Date().toISOString()}`);
    
    console.log('\n🌐 Changes will propagate to all edge locations');
    console.log('⏱️  Full propagation typically takes 5-15 minutes');
    console.log('🔍 Monitor status in AWS CloudFront Console');
  }

  /**
   * Main execution method
   */
  async run(options = {}) {
    const { paths, waitForCompletion = false } = options;
    
    console.log('\n🔄 CloudFront Cache Invalidation - Vivid Auto SCRAM');
    console.log('=' .repeat(55));
    
    try {
      // Step 1: Validate access
      await this.validateAccess();
      
      // Step 2: Create invalidation
      const result = await this.createInvalidation(paths);
      
      // Step 3: Wait for completion if requested
      if (waitForCompletion) {
        await this.waitForCompletion(result.invalidationId);
      } else {
        this.log('info', 'Note: Invalidation may take 5-15 minutes to complete');
        this.log('info', 'Use --wait flag to wait for completion');
      }
      
      // Step 4: Generate summary
      this.generateSummary(result);
      
      return result;
    } catch (error) {
      this.log('error', `Invalidation process failed: ${error.message}`);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Verify AWS credentials: aws sts get-caller-identity');
      console.log('2. Check CloudFront permissions');
      console.log('3. Ensure distribution ID is correct');
      console.log('4. Check for concurrent invalidations (max 3)');
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    waitForCompletion: args.includes('--wait') || args.includes('-w'),
    paths: null // Use default paths
  };
  
  // Parse custom paths if provided
  const pathsIndex = args.findIndex(arg => arg === '--paths' || arg === '-p');
  if (pathsIndex !== -1 && args[pathsIndex + 1]) {
    options.paths = args[pathsIndex + 1].split(',').map(p => p.trim());
  }
  
  const invalidation = new CloudFrontInvalidation();
  
  invalidation.run(options)
    .then(result => {
      console.log('\n✅ CloudFront invalidation process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ CloudFront invalidation process failed:', error.message);
      process.exit(1);
    });
}

module.exports = CloudFrontInvalidation;