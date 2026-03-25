#!/usr/bin/env node

/**
 * CloudFront Function Deployment Script
 * Deploys the redirect function to CloudFront distribution
 * 
 * Requirements addressed:
 * - 2.2: Exclude artifact URL /services/hosting/ from sitemap
 * - 2.5: Improve Google Search Console coverage
 * - 2.6: Redirect artifact URL with HTTP 301 status
 * 
 * Usage:
 *   node scripts/deploy-cloudfront-function.js
 * 
 * Environment variables required:
 *   CLOUDFRONT_DISTRIBUTION_ID - The CloudFront distribution ID
 *   AWS_REGION - AWS region (defaults to us-east-1)
 */

const {
  CloudFrontClient,
  CreateFunctionCommand,
  DescribeFunctionCommand,
  UpdateFunctionCommand,
  PublishFunctionCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand,
} = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');

class CloudFrontFunctionDeployer {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.functionName = 'redirect-hosting-to-website-hosting';
    this.functionFilePath = path.join(
      process.cwd(),
      'cloudfront-functions',
      'redirect-hosting-to-website-hosting.js'
    );

    if (!this.distributionId) {
      console.error('❌ Error: CLOUDFRONT_DISTRIBUTION_ID environment variable is required');
      console.error('\nUsage:');
      console.error('  export CLOUDFRONT_DISTRIBUTION_ID="E2IBMHQ3GCW6ZK"');
      console.error('  node scripts/deploy-cloudfront-function.js');
      process.exit(1);
    }

    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
  }

  /**
   * Read the CloudFront Function code from file
   */
  readFunctionCode() {
    console.log(`📖 Reading function code from ${this.functionFilePath}...`);
    
    if (!fs.existsSync(this.functionFilePath)) {
      throw new Error(`Function file not found: ${this.functionFilePath}`);
    }

    const code = fs.readFileSync(this.functionFilePath, 'utf8');
    console.log('✅ Function code loaded successfully');
    return code;
  }

  /**
   * Check if CloudFront Function already exists
   */
  async functionExists() {
    try {
      await this.cloudFrontClient.send(
        new DescribeFunctionCommand({ Name: this.functionName })
      );
      return true;
    } catch (error) {
      if (error.name === 'NoSuchFunctionExists') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create a new CloudFront Function
   */
  async createFunction(code) {
    console.log(`🆕 Creating CloudFront Function: ${this.functionName}...`);

    const command = new CreateFunctionCommand({
      Name: this.functionName,
      FunctionConfig: {
        Comment: 'Redirects /services/hosting/ to /services/website-hosting/ with 301 status',
        Runtime: 'cloudfront-js-1.0',
      },
      FunctionCode: Buffer.from(code, 'utf8'),
    });

    const result = await this.cloudFrontClient.send(command);
    console.log('✅ CloudFront Function created successfully');
    console.log(`   Function ARN: ${result.FunctionSummary.FunctionMetadata.FunctionARN}`);
    
    return result.FunctionSummary;
  }

  /**
   * Update an existing CloudFront Function
   */
  async updateFunction(code) {
    console.log(`🔄 Updating CloudFront Function: ${this.functionName}...`);

    // Get current function ETag
    const describeResult = await this.cloudFrontClient.send(
      new DescribeFunctionCommand({ Name: this.functionName })
    );
    const etag = describeResult.ETag;

    const command = new UpdateFunctionCommand({
      Name: this.functionName,
      IfMatch: etag,
      FunctionConfig: {
        Comment: 'Redirects /services/hosting/ to /services/hosting-website/ with 301 status',
        Runtime: 'cloudfront-js-1.0',
      },
      FunctionCode: Buffer.from(code, 'utf8'),
    });

    const result = await this.cloudFrontClient.send(command);
    console.log('✅ CloudFront Function updated successfully');
    
    return result.FunctionSummary;
  }

  /**
   * Publish the CloudFront Function to LIVE stage
   */
  async publishFunction() {
    console.log(`📤 Publishing CloudFront Function to LIVE stage...`);

    // Get current function ETag
    const describeResult = await this.cloudFrontClient.send(
      new DescribeFunctionCommand({ Name: this.functionName, Stage: 'DEVELOPMENT' })
    );
    const etag = describeResult.ETag;

    const command = new PublishFunctionCommand({
      Name: this.functionName,
      IfMatch: etag,
    });

    const result = await this.cloudFrontClient.send(command);
    console.log('✅ CloudFront Function published to LIVE stage');
    
    return result.FunctionSummary;
  }

  /**
   * Get CloudFront distribution configuration
   */
  async getDistributionConfig() {
    console.log(`🔍 Fetching CloudFront distribution configuration...`);

    const command = new GetDistributionConfigCommand({
      Id: this.distributionId,
    });

    const result = await this.cloudFrontClient.send(command);
    console.log('✅ Distribution configuration retrieved');
    
    return {
      config: result.DistributionConfig,
      etag: result.ETag,
    };
  }

  /**
   * Associate CloudFront Function with distribution
   */
  async associateFunctionWithDistribution(functionARN) {
    console.log(`🔗 Associating function with distribution ${this.distributionId}...`);

    const { config, etag } = await this.getDistributionConfig();

    // Add function association to default cache behavior
    if (!config.DefaultCacheBehavior.FunctionAssociations) {
      config.DefaultCacheBehavior.FunctionAssociations = {
        Quantity: 0,
        Items: [],
      };
    }

    // Check if function is already associated
    const existingAssociation = config.DefaultCacheBehavior.FunctionAssociations.Items?.find(
      item => item.FunctionARN === functionARN
    );

    if (existingAssociation) {
      console.log('✅ Function is already associated with distribution');
      return;
    }

    // Add new function association
    config.DefaultCacheBehavior.FunctionAssociations.Items.push({
      FunctionARN: functionARN,
      EventType: 'viewer-request',
    });
    config.DefaultCacheBehavior.FunctionAssociations.Quantity =
      config.DefaultCacheBehavior.FunctionAssociations.Items.length;

    // Update distribution
    const command = new UpdateDistributionCommand({
      Id: this.distributionId,
      DistributionConfig: config,
      IfMatch: etag,
    });

    const result = await this.cloudFrontClient.send(command);
    console.log('✅ Function associated with distribution successfully');
    console.log(`   Distribution Status: ${result.Distribution.Status}`);
    
    return result.Distribution;
  }

  /**
   * Main deployment execution
   */
  async deploy() {
    try {
      console.log('🚀 Starting CloudFront Function deployment...');
      console.log(`   Function: ${this.functionName}`);
      console.log(`   Distribution: ${this.distributionId}`);
      console.log('');

      // Step 1: Read function code
      const code = this.readFunctionCode();

      // Step 2: Create or update function
      const exists = await this.functionExists();
      let functionSummary;
      
      if (exists) {
        functionSummary = await this.updateFunction(code);
      } else {
        functionSummary = await this.createFunction(code);
      }

      // Step 3: Publish function to LIVE stage
      const publishedFunction = await this.publishFunction();
      const functionARN = publishedFunction.FunctionMetadata.FunctionARN;

      // Step 4: Associate function with distribution
      await this.associateFunctionWithDistribution(functionARN);

      console.log('\n🎉 CloudFront Function deployment completed successfully!');
      console.log('\n📋 Summary:');
      console.log(`   • Function Name: ${this.functionName}`);
      console.log(`   • Function ARN: ${functionARN}`);
      console.log(`   • Distribution ID: ${this.distributionId}`);
      console.log(`   • Event Type: viewer-request`);
      console.log(`   • Stage: LIVE`);

      console.log('\n⏳ Next steps:');
      console.log('1. Wait for CloudFront distribution to deploy changes (5-10 minutes)');
      console.log('2. Test the redirect: curl -I https://your-domain.com/services/hosting/');
      console.log('3. Verify 301 redirect to /services/website-hosting/');
      console.log('4. Submit updated sitemap to Google Search Console');

      return {
        functionName: this.functionName,
        functionARN,
        distributionId: this.distributionId,
      };
    } catch (error) {
      console.error('\n❌ CloudFront Function deployment failed:', error.message);
      
      if (error.name === 'AccessDenied') {
        console.error('\n💡 Insufficient CloudFront permissions. Required IAM permissions:');
        console.error('   • cloudfront:CreateFunction');
        console.error('   • cloudfront:UpdateFunction');
        console.error('   • cloudfront:PublishFunction');
        console.error('   • cloudfront:DescribeFunction');
        console.error('   • cloudfront:GetDistributionConfig');
        console.error('   • cloudfront:UpdateDistribution');
      }

      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const deployer = new CloudFrontFunctionDeployer();
  deployer.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = CloudFrontFunctionDeployer;
