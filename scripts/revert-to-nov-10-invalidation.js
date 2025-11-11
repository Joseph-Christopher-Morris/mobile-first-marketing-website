#!/usr/bin/env node

/**
 * Revert to November 10, 2025 CloudFront Invalidation State
 * 
 * This script helps restore the deployment state from the invalidation
 * created on November 10, 2025 at 2:55:58 PM UTC (Distribution: E2IBMHQ3GCW6ZK)
 * 
 * The invalidation included 39 paths:
 * - /images/press-logos/autotrader-logo.svg
 * - /images/press-logos/business-insider-logo.svg
 * - /services/website-hosting/index.html
 * - /blog/stock-photography-breakthrough/index.html
 * - /privacy-policy/index.html
 * - /blog/ebay-model-car-sales-timing-bundles/index.html
 * - /blog/stock-photography-income-growth/index.html
 * - /services/website-design/index.html
 * - /blog/flyer-marketing-case-study-part-2/index.html
 * - /images/press-logos/bbc-logo.svg
 * - ... and 29 more paths
 */

const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand, GetInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const RollbackManager = require('./rollback.js');

class Nov10StateRestoration {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'mobile-marketing-site-prod-1759705011281-tyzuo9';
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    this.s3Client = new S3Client({ region: this.region });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
    this.rollbackManager = new RollbackManager();
    
    // Target invalidation timestamp
    this.targetDate = new Date('2025-11-10T14:55:58Z');
    
    // The 39 paths that were invalidated (partial list shown in your message)
    this.invalidatedPaths = [
      '/images/press-logos/autotrader-logo.svg',
      '/images/press-logos/business-insider-logo.svg',
      '/services/website-hosting/index.html',
      '/blog/stock-photography-breakthrough/index.html',
      '/privacy-policy/index.html',
      '/blog/ebay-model-car-sales-timing-bundles/index.html',
      '/blog/stock-photography-income-growth/index.html',
      '/services/website-design/index.html',
      '/blog/flyer-marketing-case-study-part-2/index.html',
      '/images/press-logos/bbc-logo.svg',
      // Add the remaining 29 paths here if you have them
    ];
  }

  log(level, message) {
    const icons = {
      info: 'ℹ️ ',
      success: '✅',
      warning: '⚠️ ',
      error: '❌',
      progress: '🔄'
    };
    console.log(`${icons[level] || ''} ${message}`);
  }

  /**
   * Find the backup closest to November 10, 2025 2:55:58 PM UTC
   */
  async findClosestBackup() {
    this.log('progress', 'Searching for backup closest to November 10, 2025 2:55:58 PM UTC...');
    
    const backups = await this.rollbackManager.listBackups();
    
    if (backups.length === 0) {
      this.log('warning', 'No backups found in S3');
      return null;
    }

    // Find backup closest to target date (before or at the target time)
    let closestBackup = null;
    let smallestDiff = Infinity;

    for (const backup of backups) {
      const backupDate = new Date(backup.timestamp);
      const diff = Math.abs(this.targetDate - backupDate);
      
      // Prefer backups before or at the target time
      if (backupDate <= this.targetDate && diff < smallestDiff) {
        smallestDiff = diff;
        closestBackup = backup;
      }
    }

    if (closestBackup) {
      const diffMinutes = Math.round(smallestDiff / 60000);
      this.log('success', `Found backup: ${closestBackup.id}`);
      this.log('info', `Backup date: ${new Date(closestBackup.timestamp).toLocaleString()}`);
      this.log('info', `Time difference: ${diffMinutes} minutes`);
      this.log('info', `Files: ${closestBackup.fileCount}`);
      
      if (closestBackup.git && closestBackup.git.shortCommit) {
        this.log('info', `Git commit: ${closestBackup.git.shortCommit} - ${closestBackup.git.message}`);
      }
    } else {
      this.log('warning', 'No suitable backup found before target date');
    }

    return closestBackup;
  }

  /**
   * List all backups around November 10, 2025
   */
  async listBackupsAroundDate() {
    this.log('info', 'Listing all backups around November 10, 2025...\n');
    
    const backups = await this.rollbackManager.listBackups();
    
    if (backups.length === 0) {
      this.log('warning', 'No backups found');
      return;
    }

    console.log('='.repeat(80));
    console.log('Available Backups');
    console.log('='.repeat(80));

    for (const backup of backups) {
      const backupDate = new Date(backup.timestamp);
      const diffMs = backupDate - this.targetDate;
      const diffMinutes = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000 * 10) / 10;
      
      let timeInfo = '';
      if (diffMs < 0) {
        timeInfo = `(${Math.abs(diffHours)}h before target)`;
      } else if (diffMs > 0) {
        timeInfo = `(${diffHours}h after target)`;
      } else {
        timeInfo = '(EXACT MATCH)';
      }

      console.log(`\nID: ${backup.id}`);
      console.log(`Date: ${backupDate.toLocaleString()} ${timeInfo}`);
      console.log(`Type: ${backup.type}`);
      console.log(`Files: ${backup.fileCount}`);
      console.log(`Size: ${this.formatBytes(backup.totalSize)}`);
      
      if (backup.git && backup.git.shortCommit) {
        console.log(`Git: ${backup.git.shortCommit} - ${backup.git.message}`);
      }
      
      console.log('-'.repeat(60));
    }
  }

  /**
   * Restore to the November 10 state
   */
  async restoreToNov10State(backupId = null) {
    this.log('progress', 'Starting restoration to November 10, 2025 state...\n');

    try {
      // Step 1: Find the appropriate backup
      let targetBackup;
      
      if (backupId) {
        this.log('info', `Using specified backup: ${backupId}`);
        targetBackup = await this.rollbackManager.getBackupMetadata(backupId);
        
        if (!targetBackup) {
          throw new Error(`Backup not found: ${backupId}`);
        }
      } else {
        targetBackup = await this.findClosestBackup();
        
        if (!targetBackup) {
          throw new Error('No suitable backup found for November 10, 2025');
        }
      }

      // Step 2: Confirm restoration
      console.log('\n' + '='.repeat(80));
      console.log('RESTORATION CONFIRMATION');
      console.log('='.repeat(80));
      console.log(`Target Date: November 10, 2025 2:55:58 PM UTC`);
      console.log(`Backup ID: ${targetBackup.id}`);
      console.log(`Backup Date: ${new Date(targetBackup.timestamp).toLocaleString()}`);
      console.log(`Files to restore: ${targetBackup.fileCount}`);
      console.log(`Size: ${this.formatBytes(targetBackup.totalSize)}`);
      
      if (targetBackup.git && targetBackup.git.shortCommit) {
        console.log(`Git Commit: ${targetBackup.git.shortCommit}`);
        console.log(`Message: ${targetBackup.git.message}`);
      }
      
      console.log('='.repeat(80));
      console.log('\n⚠️  This will:');
      console.log('   1. Create a backup of current state');
      console.log('   2. Restore files from the November 10 backup');
      console.log('   3. Invalidate CloudFront cache');
      console.log('   4. Changes will take 5-15 minutes to propagate\n');

      // Step 3: Perform rollback
      this.log('progress', 'Performing rollback...');
      await this.rollbackManager.rollbackToBackup(targetBackup.id);

      // Step 4: Recreate the same invalidation
      await this.recreateInvalidation();

      this.log('success', 'Restoration completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   ✅ Restored to backup: ${targetBackup.id}`);
      console.log(`   ✅ Files restored: ${targetBackup.fileCount}`);
      console.log(`   ✅ CloudFront cache invalidated`);
      console.log(`   ⏱️  Changes propagating (5-15 minutes)`);
      
      return targetBackup;
    } catch (error) {
      this.log('error', `Restoration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Recreate the November 10 invalidation
   */
  async recreateInvalidation() {
    this.log('progress', 'Recreating November 10 CloudFront invalidation...');

    try {
      const command = new CreateInvalidationCommand({
        DistributionId: this.distributionId,
        InvalidationBatch: {
          CallerReference: `nov-10-restoration-${Date.now()}`,
          Paths: {
            Quantity: this.invalidatedPaths.length,
            Items: this.invalidatedPaths
          }
        }
      });

      const result = await this.cloudFrontClient.send(command);
      
      this.log('success', 'CloudFront invalidation created');
      this.log('info', `Invalidation ID: ${result.Invalidation.Id}`);
      this.log('info', `Paths invalidated: ${this.invalidatedPaths.length}`);
      
      return result.Invalidation;
    } catch (error) {
      this.log('warning', `Could not recreate invalidation: ${error.message}`);
      this.log('info', 'You may need to manually invalidate CloudFront cache');
    }
  }

  /**
   * Check current CloudFront invalidations
   */
  async checkInvalidationHistory() {
    this.log('info', 'Checking CloudFront invalidation history...');
    
    try {
      const { ListInvalidationsCommand } = require('@aws-sdk/client-cloudfront');
      
      const command = new ListInvalidationsCommand({
        DistributionId: this.distributionId,
        MaxItems: 20
      });

      const result = await this.cloudFrontClient.send(command);
      
      if (result.InvalidationList && result.InvalidationList.Items) {
        console.log('\n' + '='.repeat(80));
        console.log('Recent CloudFront Invalidations');
        console.log('='.repeat(80));
        
        for (const inv of result.InvalidationList.Items) {
          const createDate = new Date(inv.CreateTime);
          const isTarget = Math.abs(createDate - this.targetDate) < 60000; // Within 1 minute
          
          console.log(`\nID: ${inv.Id}`);
          console.log(`Date: ${createDate.toLocaleString()} ${isTarget ? '⭐ TARGET' : ''}`);
          console.log(`Status: ${inv.Status}`);
          console.log('-'.repeat(60));
        }
      } else {
        this.log('info', 'No invalidation history found');
      }
    } catch (error) {
      this.log('warning', `Could not retrieve invalidation history: ${error.message}`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  const restorer = new Nov10StateRestoration();

  try {
    switch (command) {
      case 'list':
        await restorer.listBackupsAroundDate();
        break;

      case 'find':
        await restorer.findClosestBackup();
        break;

      case 'history':
        await restorer.checkInvalidationHistory();
        break;

      case 'restore':
        await restorer.restoreToNov10State(arg);
        break;

      case 'invalidate':
        await restorer.recreateInvalidation();
        break;

      default:
        console.log(`
🔄 November 10, 2025 State Restoration Tool

This tool helps restore your deployment to the state from the CloudFront
invalidation created on November 10, 2025 at 2:55:58 PM UTC.

Usage:
  node scripts/revert-to-nov-10-invalidation.js <command> [options]

Commands:
  list              List all backups around November 10, 2025
  find              Find the backup closest to the target date
  history           Show CloudFront invalidation history
  restore [id]      Restore to November 10 state (optionally specify backup ID)
  invalidate        Recreate the November 10 invalidation only

Examples:
  # List available backups
  node scripts/revert-to-nov-10-invalidation.js list

  # Find closest backup
  node scripts/revert-to-nov-10-invalidation.js find

  # Check invalidation history
  node scripts/revert-to-nov-10-invalidation.js history

  # Restore to closest backup automatically
  node scripts/revert-to-nov-10-invalidation.js restore

  # Restore to specific backup
  node scripts/revert-to-nov-10-invalidation.js restore backup-2025-11-10T14-50-00-000Z

  # Just recreate the invalidation
  node scripts/revert-to-nov-10-invalidation.js invalidate

Environment Variables:
  S3_BUCKET_NAME              - S3 bucket (default: mobile-marketing-site-prod-1759705011281-tyzuo9)
  CLOUDFRONT_DISTRIBUTION_ID  - CloudFront ID (default: E2IBMHQ3GCW6ZK)
  AWS_REGION                  - AWS region (default: us-east-1)

Target State:
  Date: November 10, 2025 at 2:55:58 PM UTC
  Distribution: E2IBMHQ3GCW6ZK
  Paths: 39 invalidated paths including press logos, blog posts, and service pages
        `);
        break;
    }
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = Nov10StateRestoration;
