#!/usr/bin/env node

/**
 * Cost Analysis and Optimization Tool
 *
 * Analyzes AWS costs for S3 + CloudFront deployment and provides
 * optimization recommendations to reduce expenses while maintaining performance.
 *
 * Requirements: 5.1, 6.4
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

class CostAnalysisOptimizer {
  constructor() {
    this.costExplorer = new AWS.CostExplorer({ region: 'us-east-1' });
    this.s3 = new AWS.S3();
    this.cloudfront = new AWS.CloudFront();
    this.cloudwatch = new AWS.CloudWatch();
    this.configPath = path.join(
      __dirname,
      '..',
      'config',
      'deployment-config.json'
    );
    this.costReportPath = path.join(
      __dirname,
      '..',
      'logs',
      'cost-analysis.json'
    );
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Error loading deployment config:', error.message);
      return null;
    }
  }

  async getCostAndUsage(startDate, endDate, granularity = 'MONTHLY') {
    try {
      const params = {
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: granularity,
        Metrics: ['BlendedCost', 'UsageQuantity'],
        GroupBy: [
          {
            Type: 'DIMENSION',
            Key: 'SERVICE',
          },
        ],
        Filter: {
          Dimensions: {
            Key: 'SERVICE',
            Values: ['Amazon Simple Storage Service', 'Amazon CloudFront'],
          },
        },
      };

      const result = await this.costExplorer.getCostAndUsage(params).promise();
      return result.ResultsByTime;
    } catch (error) {
      console.warn(
        'Cost Explorer API not available or insufficient permissions:',
        error.message
      );
      return null;
    }
  }

  async getS3StorageAnalysis(bucketName) {
    try {
      // Get bucket size and storage class distribution
      const objects = await this.s3
        .listObjectsV2({ Bucket: bucketName })
        .promise();

      let totalSize = 0;
      const storageClasses = {};
      const fileTypes = {};
      const oldObjects = [];
      const largeObjects = [];

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      for (const object of objects.Contents) {
        totalSize += object.Size;

        // Track storage classes
        const storageClass = object.StorageClass || 'STANDARD';
        storageClasses[storageClass] =
          (storageClasses[storageClass] || 0) + object.Size;

        // Track file types
        const extension = path.extname(object.Key).toLowerCase();
        fileTypes[extension] = (fileTypes[extension] || 0) + object.Size;

        // Identify old objects (candidates for IA or Glacier)
        if (object.LastModified < thirtyDaysAgo) {
          oldObjects.push({
            key: object.Key,
            size: object.Size,
            lastModified: object.LastModified,
            storageClass: object.StorageClass || 'STANDARD',
          });
        }

        // Identify large objects
        if (object.Size > 100 * 1024 * 1024) {
          // > 100MB
          largeObjects.push({
            key: object.Key,
            size: object.Size,
            storageClass: object.StorageClass || 'STANDARD',
          });
        }
      }

      return {
        totalSize,
        objectCount: objects.Contents.length,
        storageClasses,
        fileTypes,
        oldObjects: oldObjects.slice(0, 20), // Top 20 old objects
        largeObjects: largeObjects.slice(0, 10), // Top 10 large objects
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  async getCloudFrontAnalysis(distributionId) {
    try {
      const distribution = await this.cloudfront
        .getDistribution({ Id: distributionId })
        .promise();
      const config = distribution.Distribution.DistributionConfig;

      // Get CloudFront metrics for the last 30 days
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);

      const requestsMetric = await this.cloudwatch
        .getMetricStatistics({
          Namespace: 'AWS/CloudFront',
          MetricName: 'Requests',
          Dimensions: [{ Name: 'DistributionId', Value: distributionId }],
          StartTime: startTime,
          EndTime: endTime,
          Period: 86400,
          Statistics: ['Sum'],
        })
        .promise();

      const bytesDownloadedMetric = await this.cloudwatch
        .getMetricStatistics({
          Namespace: 'AWS/CloudFront',
          MetricName: 'BytesDownloaded',
          Dimensions: [{ Name: 'DistributionId', Value: distributionId }],
          StartTime: startTime,
          EndTime: endTime,
          Period: 86400,
          Statistics: ['Sum'],
        })
        .promise();

      const totalRequests = requestsMetric.Datapoints.reduce(
        (sum, point) => sum + point.Sum,
        0
      );
      const totalBytes = bytesDownloadedMetric.Datapoints.reduce(
        (sum, point) => sum + point.Sum,
        0
      );

      return {
        priceClass: config.PriceClass,
        enabled: config.Enabled,
        totalRequests30Days: totalRequests,
        totalBytesDownloaded30Days: totalBytes,
        cacheBehaviors: config.CacheBehaviors.Items.length + 1, // +1 for default
        origins: config.Origins.Items.length,
        compressionEnabled: config.DefaultCacheBehavior.Compress,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  calculateS3Costs(storageAnalysis) {
    const costs = {
      storage: {},
      requests: 0,
      dataTransfer: 0,
      total: 0,
    };

    // S3 pricing (US East 1, approximate)
    const storagePricing = {
      STANDARD: 0.023, // per GB per month
      STANDARD_IA: 0.0125,
      ONEZONE_IA: 0.01,
      GLACIER: 0.004,
      DEEP_ARCHIVE: 0.00099,
    };

    // Calculate storage costs
    Object.entries(storageAnalysis.storageClasses).forEach(
      ([storageClass, bytes]) => {
        const gb = bytes / (1024 * 1024 * 1024);
        const monthlyCost =
          gb * (storagePricing[storageClass] || storagePricing.STANDARD);
        costs.storage[storageClass] = {
          sizeGB: gb,
          monthlyCost,
        };
        costs.total += monthlyCost;
      }
    );

    // Estimate request costs (very rough)
    costs.requests = (storageAnalysis.objectCount * 0.0004) / 1000; // PUT requests
    costs.total += costs.requests;

    return costs;
  }

  calculateCloudFrontCosts(cfAnalysis) {
    // CloudFront pricing (approximate, varies by region)
    const requestPricing = 0.0075 / 10000; // per 10,000 requests
    const dataTransferPricing = 0.085; // per GB for first 10TB

    const requestCost =
      (cfAnalysis.totalRequests30Days * requestPricing) / 10000;
    const dataTransferCost =
      (cfAnalysis.totalBytesDownloaded30Days / (1024 * 1024 * 1024)) *
      dataTransferPricing;

    return {
      requests: requestCost,
      dataTransfer: dataTransferCost,
      total: requestCost + dataTransferCost,
    };
  }

  generateOptimizationRecommendations(
    storageAnalysis,
    cfAnalysis,
    s3Costs,
    cfCosts
  ) {
    const recommendations = [];

    // S3 Storage Optimization
    if (storageAnalysis.oldObjects.length > 0) {
      const oldObjectsSize = storageAnalysis.oldObjects.reduce(
        (sum, obj) => sum + obj.size,
        0
      );
      const oldObjectsGB = oldObjectsSize / (1024 * 1024 * 1024);
      const potentialSavings = oldObjectsGB * (0.023 - 0.0125); // STANDARD to IA savings

      recommendations.push({
        type: 'storage',
        priority: 'high',
        title: 'Move old objects to Infrequent Access',
        description: `${storageAnalysis.oldObjects.length} objects (${oldObjectsGB.toFixed(2)} GB) haven't been modified in 30+ days`,
        potentialSavings: potentialSavings,
        action:
          'Implement S3 lifecycle policy to transition to STANDARD_IA after 30 days',
      });
    }

    if (storageAnalysis.largeObjects.length > 0) {
      recommendations.push({
        type: 'storage',
        priority: 'medium',
        title: 'Optimize large objects',
        description: `${storageAnalysis.largeObjects.length} objects are larger than 100MB`,
        action:
          'Consider compression or breaking large files into smaller chunks',
      });
    }

    // CloudFront Optimization
    if (cfAnalysis.priceClass === 'PriceClass_All') {
      recommendations.push({
        type: 'cloudfront',
        priority: 'medium',
        title: 'Consider reducing CloudFront price class',
        description:
          'Using all edge locations may be unnecessary for your traffic patterns',
        potentialSavings: cfCosts.total * 0.2, // Rough estimate
        action:
          'Analyze traffic patterns and consider PriceClass_100 or PriceClass_200',
      });
    }

    if (!cfAnalysis.compressionEnabled) {
      recommendations.push({
        type: 'cloudfront',
        priority: 'high',
        title: 'Enable CloudFront compression',
        description: 'Compression can reduce data transfer costs by 60-80%',
        potentialSavings: cfCosts.dataTransfer * 0.7,
        action: 'Enable compression in CloudFront cache behaviors',
      });
    }

    // Cache optimization
    const cacheHitRatio = this.estimateCacheHitRatio(cfAnalysis);
    if (cacheHitRatio < 0.8) {
      recommendations.push({
        type: 'caching',
        priority: 'high',
        title: 'Improve cache hit ratio',
        description: `Estimated cache hit ratio is ${(cacheHitRatio * 100).toFixed(1)}%`,
        action:
          'Review cache behaviors and TTL settings to improve caching efficiency',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  estimateCacheHitRatio(cfAnalysis) {
    // This is a rough estimation based on typical patterns
    // In a real implementation, you'd use CloudFront real-time logs
    if (cfAnalysis.totalRequests30Days === 0) return 0.5;

    // Assume better cache hit ratio for static sites
    return 0.85; // 85% cache hit ratio estimate
  }

  async saveCostReport(report) {
    try {
      await fs.writeFile(this.costReportPath, JSON.stringify(report, null, 2));
    } catch (error) {
      console.warn('Failed to save cost report:', error.message);
    }
  }

  async generateCostAnalysis() {
    console.log('💰 AWS Cost Analysis and Optimization Report');
    console.log('='.repeat(55));

    const config = await this.loadConfig();
    if (!config) {
      console.log('❌ Unable to load deployment configuration');
      return;
    }

    // Get current date range (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Analyze S3 storage
    console.log('\n📦 S3 Storage Analysis');
    console.log('-'.repeat(25));
    const storageAnalysis = await this.getS3StorageAnalysis(config.bucketName);

    if (!storageAnalysis.error) {
      const totalSizeGB = storageAnalysis.totalSize / (1024 * 1024 * 1024);
      console.log(`   Total Size: ${totalSizeGB.toFixed(2)} GB`);
      console.log(
        `   Object Count: ${storageAnalysis.objectCount.toLocaleString()}`
      );
      console.log(`   Storage Classes:`);

      Object.entries(storageAnalysis.storageClasses).forEach(
        ([storageClass, bytes]) => {
          const gb = bytes / (1024 * 1024 * 1024);
          console.log(`     ${storageClass}: ${gb.toFixed(2)} GB`);
        }
      );

      if (storageAnalysis.oldObjects.length > 0) {
        console.log(
          `   Old Objects (30+ days): ${storageAnalysis.oldObjects.length}`
        );
      }
    } else {
      console.log(`   ❌ Error: ${storageAnalysis.error}`);
    }

    // Analyze CloudFront
    console.log('\n🌐 CloudFront Analysis');
    console.log('-'.repeat(25));
    const cfAnalysis = await this.getCloudFrontAnalysis(config.distributionId);

    if (!cfAnalysis.error) {
      console.log(`   Price Class: ${cfAnalysis.priceClass}`);
      console.log(
        `   Requests (30 days): ${cfAnalysis.totalRequests30Days.toLocaleString()}`
      );
      console.log(
        `   Data Downloaded: ${(cfAnalysis.totalBytesDownloaded30Days / (1024 * 1024 * 1024)).toFixed(2)} GB`
      );
      console.log(
        `   Compression: ${cfAnalysis.compressionEnabled ? 'Enabled' : 'Disabled'}`
      );
      console.log(`   Cache Behaviors: ${cfAnalysis.cacheBehaviors}`);
    } else {
      console.log(`   ❌ Error: ${cfAnalysis.error}`);
    }

    // Cost calculations
    console.log('\n💵 Cost Estimates (Monthly)');
    console.log('-'.repeat(30));

    if (!storageAnalysis.error && !cfAnalysis.error) {
      const s3Costs = this.calculateS3Costs(storageAnalysis);
      const cfCosts = this.calculateCloudFrontCosts(cfAnalysis);

      console.log('   S3 Costs:');
      Object.entries(s3Costs.storage).forEach(([storageClass, cost]) => {
        console.log(
          `     ${storageClass}: $${cost.monthlyCost.toFixed(4)} (${cost.sizeGB.toFixed(2)} GB)`
        );
      });
      console.log(`     Requests: $${s3Costs.requests.toFixed(4)}`);
      console.log(`     S3 Total: $${s3Costs.total.toFixed(4)}`);

      console.log('   CloudFront Costs:');
      console.log(`     Requests: $${cfCosts.requests.toFixed(4)}`);
      console.log(`     Data Transfer: $${cfCosts.dataTransfer.toFixed(4)}`);
      console.log(`     CloudFront Total: $${cfCosts.total.toFixed(4)}`);

      const totalCost = s3Costs.total + cfCosts.total;
      console.log(`   📊 TOTAL ESTIMATED COST: $${totalCost.toFixed(4)}/month`);

      // Generate recommendations
      console.log('\n💡 Optimization Recommendations');
      console.log('-'.repeat(35));

      const recommendations = this.generateOptimizationRecommendations(
        storageAnalysis,
        cfAnalysis,
        s3Costs,
        cfCosts
      );

      if (recommendations.length > 0) {
        let totalPotentialSavings = 0;

        recommendations.forEach((rec, index) => {
          const priority =
            rec.priority === 'high'
              ? '🔴'
              : rec.priority === 'medium'
                ? '🟡'
                : '🟢';

          console.log(`   ${priority} ${index + 1}. ${rec.title}`);
          console.log(`      ${rec.description}`);
          console.log(`      Action: ${rec.action}`);

          if (rec.potentialSavings) {
            console.log(
              `      Potential Savings: $${rec.potentialSavings.toFixed(4)}/month`
            );
            totalPotentialSavings += rec.potentialSavings;
          }
          console.log('');
        });

        if (totalPotentialSavings > 0) {
          console.log(
            `   💰 Total Potential Savings: $${totalPotentialSavings.toFixed(4)}/month`
          );
          console.log(
            `   📈 Potential Cost Reduction: ${((totalPotentialSavings / totalCost) * 100).toFixed(1)}%`
          );
        }
      } else {
        console.log('   ✅ No major optimization opportunities identified');
        console.log('   Your deployment appears to be well-optimized!');
      }

      // Save report
      const report = {
        timestamp: new Date().toISOString(),
        period: { startDate, endDate },
        storageAnalysis,
        cfAnalysis,
        costs: { s3: s3Costs, cloudfront: cfCosts, total: totalCost },
        recommendations,
      };

      await this.saveCostReport(report);
    }

    console.log('\n' + '='.repeat(55));
    console.log(`Cost analysis completed at: ${new Date().toLocaleString()}`);
  }
}

// CLI execution
if (require.main === module) {
  const optimizer = new CostAnalysisOptimizer();
  optimizer.generateCostAnalysis().catch(console.error);
}

module.exports = CostAnalysisOptimizer;
