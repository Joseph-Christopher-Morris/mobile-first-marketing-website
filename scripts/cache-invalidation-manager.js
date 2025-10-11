#!/usr/bin/env node

/**
 * Cache Invalidation Management Tool
 *
 * Provides intelligent cache invalidation management for CloudFront distributions,
 * including batch processing, cost optimization, and invalidation tracking.
 *
 * Requirements: 5.1, 6.4
 */

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');

class CacheInvalidationManager {
  constructor() {
    this.cloudfront = new AWS.CloudFront();
    this.configPath = path.join(
      __dirname,
      '..',
      'config',
      'deployment-config.json'
    );
    this.invalidationLogPath = path.join(
      __dirname,
      '..',
      'logs',
      'invalidations.json'
    );
    this.maxPathsPerInvalidation = 3000; // AWS limit
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

  async logInvalidation(distributionId, paths, invalidationId, cost = 0) {
    try {
      let invalidations = [];
      try {
        const logData = await fs.readFile(this.invalidationLogPath, 'utf8');
        invalidations = JSON.parse(logData);
      } catch (error) {
        // File doesn't exist, start with empty array
      }

      invalidations.push({
        timestamp: new Date().toISOString(),
        distributionId,
        invalidationId,
        pathCount: paths.length,
        paths: paths.slice(0, 10), // Store first 10 paths for reference
        estimatedCost: cost,
        status: 'InProgress',
      });

      // Keep only last 100 invalidations
      if (invalidations.length > 100) {
        invalidations = invalidations.slice(-100);
      }

      await fs.writeFile(
        this.invalidationLogPath,
        JSON.stringify(invalidations, null, 2)
      );
    } catch (error) {
      console.warn('Failed to log invalidation:', error.message);
    }
  }

  optimizePaths(paths) {
    // Remove duplicates
    const uniquePaths = [...new Set(paths)];

    // Sort paths to group similar ones
    uniquePaths.sort();

    // Optimize by using wildcards where beneficial
    const optimized = [];
    const pathGroups = new Map();

    // Group paths by directory
    uniquePaths.forEach(path => {
      const dir = path.substring(0, path.lastIndexOf('/') + 1);
      if (!pathGroups.has(dir)) {
        pathGroups.set(dir, []);
      }
      pathGroups.get(dir).push(path);
    });

    // For directories with many files, use wildcard
    pathGroups.forEach((files, dir) => {
      if (files.length >= 5 && dir !== '/') {
        optimized.push(dir + '*');
      } else {
        optimized.push(...files);
      }
    });

    return optimized.slice(0, this.maxPathsPerInvalidation);
  }

  calculateCost(pathCount) {
    // AWS charges $0.005 per path for the first 1000 paths per month
    // Then $0.001 per path after that
    const freeTier = 1000;
    const firstTierRate = 0.005;
    const secondTierRate = 0.001;

    if (pathCount <= freeTier) {
      return pathCount * firstTierRate;
    } else {
      return freeTier * firstTierRate + (pathCount - freeTier) * secondTierRate;
    }
  }

  async createInvalidation(distributionId, paths, callerReference = null) {
    try {
      const optimizedPaths = this.optimizePaths(paths);
      const estimatedCost = this.calculateCost(optimizedPaths.length);

      console.log(`Creating invalidation for ${optimizedPaths.length} paths`);
      console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);

      const params = {
        DistributionId: distributionId,
        InvalidationBatch: {
          Paths: {
            Quantity: optimizedPaths.length,
            Items: optimizedPaths,
          },
          CallerReference: callerReference || `invalidation-${Date.now()}`,
        },
      };

      const result = await this.cloudfront.createInvalidation(params).promise();

      await this.logInvalidation(
        distributionId,
        optimizedPaths,
        result.Invalidation.Id,
        estimatedCost
      );

      return {
        success: true,
        invalidationId: result.Invalidation.Id,
        pathCount: optimizedPaths.length,
        estimatedCost,
        status: result.Invalidation.Status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getInvalidationStatus(distributionId, invalidationId) {
    try {
      const result = await this.cloudfront
        .getInvalidation({
          DistributionId: distributionId,
          Id: invalidationId,
        })
        .promise();

      return {
        success: true,
        status: result.Invalidation.Status,
        createTime: result.Invalidation.CreateTime,
        paths: result.Invalidation.InvalidationBatch.Paths.Items,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async listInvalidations(distributionId, maxItems = 10) {
    try {
      const result = await this.cloudfront
        .listInvalidations({
          DistributionId: distributionId,
          MaxItems: maxItems.toString(),
        })
        .promise();

      return {
        success: true,
        invalidations: result.InvalidationList.Items.map(inv => ({
          id: inv.Id,
          status: inv.Status,
          createTime: inv.CreateTime,
          pathCount: inv.InvalidationBatch.Paths.Quantity,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getInvalidationHistory() {
    try {
      const logData = await fs.readFile(this.invalidationLogPath, 'utf8');
      const invalidations = JSON.parse(logData);

      return invalidations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
    } catch (error) {
      return [];
    }
  }

  async generateInvalidationReport() {
    console.log('📋 Cache Invalidation Management Report');
    console.log('='.repeat(50));

    const config = await this.loadConfig();
    if (!config) {
      console.log('❌ Unable to load deployment configuration');
      return;
    }

    // Current invalidations
    console.log('\n🔄 Active Invalidations');
    console.log('-'.repeat(25));
    const activeInvalidations = await this.listInvalidations(
      config.distributionId,
      5
    );

    if (activeInvalidations.success) {
      if (activeInvalidations.invalidations.length > 0) {
        activeInvalidations.invalidations.forEach(inv => {
          const status = inv.status === 'Completed' ? '✅' : '⏳';
          console.log(
            `   ${status} ${inv.id} - ${inv.pathCount} paths (${inv.status})`
          );
          console.log(
            `      Created: ${new Date(inv.createTime).toLocaleString()}`
          );
        });
      } else {
        console.log('   No active invalidations');
      }
    } else {
      console.log(`   ❌ Error: ${activeInvalidations.error}`);
    }

    // Invalidation history
    console.log('\n📊 Recent Invalidation History');
    console.log('-'.repeat(35));
    const history = await this.getInvalidationHistory();

    if (history.length > 0) {
      let totalCost = 0;
      let totalPaths = 0;

      history.slice(0, 10).forEach(inv => {
        totalCost += inv.estimatedCost || 0;
        totalPaths += inv.pathCount || 0;

        console.log(`   📅 ${new Date(inv.timestamp).toLocaleDateString()}`);
        console.log(
          `      Paths: ${inv.pathCount}, Cost: $${(inv.estimatedCost || 0).toFixed(4)}`
        );
        console.log(`      ID: ${inv.invalidationId}`);
      });

      console.log('\n💰 Cost Summary (Recent History)');
      console.log('-'.repeat(30));
      console.log(`   Total Paths Invalidated: ${totalPaths.toLocaleString()}`);
      console.log(`   Estimated Total Cost: $${totalCost.toFixed(4)}`);
      console.log(
        `   Average Cost per Invalidation: $${(totalCost / history.length).toFixed(4)}`
      );
    } else {
      console.log('   No invalidation history found');
    }

    // Optimization recommendations
    console.log('\n💡 Optimization Recommendations');
    console.log('-'.repeat(35));

    if (history.length > 0) {
      const avgPathsPerInvalidation = totalPaths / history.length;
      const recentInvalidations = history.filter(
        inv =>
          new Date(inv.timestamp) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (avgPathsPerInvalidation > 100) {
        console.log('   ⚠️  High path count per invalidation detected');
        console.log('      Consider using wildcard patterns to reduce costs');
      }

      if (recentInvalidations.length > 10) {
        console.log('   ⚠️  Frequent invalidations detected (>10 in 7 days)');
        console.log(
          '      Consider batching invalidations or adjusting cache TTL'
        );
      }

      if (totalCost > 5) {
        console.log('   ⚠️  High invalidation costs detected');
        console.log('      Review caching strategy and invalidation patterns');
      }

      if (history.every(inv => inv.pathCount < 10)) {
        console.log('   ✅ Good: Small, targeted invalidations');
      }

      if (recentInvalidations.length <= 5) {
        console.log('   ✅ Good: Reasonable invalidation frequency');
      }
    } else {
      console.log('   📝 No data available for recommendations');
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Report generated at: ${new Date().toLocaleString()}`);
  }

  // Smart invalidation for common deployment scenarios
  async invalidateDeployment(type = 'full') {
    const config = await this.loadConfig();
    if (!config) {
      console.log('❌ Unable to load deployment configuration');
      return;
    }

    let paths = [];

    switch (type) {
      case 'full':
        paths = ['/*'];
        break;
      case 'html':
        paths = ['/', '/index.html', '/*.html'];
        break;
      case 'assets':
        paths = ['/_next/static/*', '/static/*', '/images/*'];
        break;
      case 'api':
        paths = ['/api/*'];
        break;
      default:
        console.log(
          '❌ Invalid invalidation type. Use: full, html, assets, or api'
        );
        return;
    }

    console.log(`🚀 Creating ${type} invalidation...`);
    const result = await this.createInvalidation(config.distributionId, paths);

    if (result.success) {
      console.log(`✅ Invalidation created successfully`);
      console.log(`   ID: ${result.invalidationId}`);
      console.log(`   Paths: ${result.pathCount}`);
      console.log(`   Estimated Cost: $${result.estimatedCost.toFixed(4)}`);
      console.log(`   Status: ${result.status}`);
    } else {
      console.log(`❌ Invalidation failed: ${result.error}`);
    }

    return result;
  }
}

// CLI execution
if (require.main === module) {
  const manager = new CacheInvalidationManager();
  const command = process.argv[2];
  const type = process.argv[3];

  switch (command) {
    case 'report':
      manager.generateInvalidationReport().catch(console.error);
      break;
    case 'invalidate':
      manager.invalidateDeployment(type).catch(console.error);
      break;
    case 'status':
      if (!type) {
        console.log(
          'Usage: node cache-invalidation-manager.js status <invalidation-id>'
        );
        process.exit(1);
      }
      manager
        .loadConfig()
        .then(config => {
          if (config) {
            return manager.getInvalidationStatus(config.distributionId, type);
          }
        })
        .then(result => {
          if (result && result.success) {
            console.log(`Status: ${result.status}`);
            console.log(`Created: ${result.createTime}`);
            console.log(`Paths: ${result.paths.length}`);
          } else if (result) {
            console.log(`Error: ${result.error}`);
          }
        })
        .catch(console.error);
      break;
    default:
      console.log('Cache Invalidation Manager');
      console.log('Usage:');
      console.log('  node cache-invalidation-manager.js report');
      console.log(
        '  node cache-invalidation-manager.js invalidate [full|html|assets|api]'
      );
      console.log(
        '  node cache-invalidation-manager.js status <invalidation-id>'
      );
  }
}

module.exports = CacheInvalidationManager;
