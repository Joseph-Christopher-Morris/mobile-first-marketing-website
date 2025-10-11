#!/usr/bin/env node

/**
 * Rollback and Recovery Script for S3 + CloudFront Deployment
 * 
 * This script provides comprehensive rollback and recovery functionality:
 * 1. Version management for deployments
 * 2. Rollback script to restore previous versions
 * 3. Backup verification and integrity checks
 * 
 * Requirements addressed:
 * - 8.1: Maintain previous version backups
 * - 8.2: Restore previous working version
 * - 8.3: Provide disaster recovery procedures
 */

const { 
  S3Client, 
  ListObjectsV2Command,
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand 
} = require('@aws-sdk/client-s3');
const { 
  CloudFrontClient, 
  CreateInvalidationCommand 
} = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

class RollbackManager {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.environment = process.env.ENVIRONMENT || 'production';
    
    this.s3Client = new S3Client({ region: this.region });
    this.cloudFrontClient = new CloudFrontClient({ region: 'us-east-1' });
    
    this.backupPrefix = 'backups/';
    this.maxBackups = 10;
    this.metadataFile = 'deployment-metadata.json';
    
    this.validateConfiguration();
  }

  /**
   * Validate required configuration
   */
  validateConfiguration() {
    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }
    
    console.log('📋 Rollback Configuration:');
    console.log(`   Environment: ${this.environment}`);
    console.log(`   S3 Bucket: ${this.bucketName}`);
    console.log(`   CloudFront Distribution: ${this.distributionId || 'Not configured'}`);
    console.log(`   Region: ${this.region}`);
    console.log(`   Max Backups: ${this.maxBackups}`);
    console.log('');
  }

  /**
   * Create a backup of the current deployment
   */
  async createBackup(type = 'manual') {
    console.log(`💾 Creating ${type} backup...`);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    const backupPrefix = `${this.backupPrefix}${backupId}/`;
    
    try {
      // Get current deployment metadata
      const deploymentMetadata = await this.getCurrentDeploymentMetadata();
      
      // Get all current files in the bucket (excluding backups)
      const currentFiles = await this.getCurrentFiles();
      
      if (currentFiles.length === 0) {
        console.log('⚠️  No files found to backup');
        return null;
      }
      
      console.log(`📦 Backing up ${currentFiles.length} files...`);
      
      // Copy all current files to backup location
      let backedUpCount = 0;
      for (const file of currentFiles) {
        const backupKey = `${backupPrefix}${file.Key}`;
        
        await this.s3Client.send(new CopyObjectCommand({
          Bucket: this.bucketName,
          CopySource: `${this.bucketName}/${file.Key}`,
          Key: backupKey,
          MetadataDirective: 'COPY'
        }));
        
        backedUpCount++;
        if (backedUpCount % 10 === 0) {
          console.log(`   Backed up ${backedUpCount}/${currentFiles.length} files`);
        }
      }
      
      // Create backup metadata
      const backupMetadata = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: type,
        environment: this.environment,
        fileCount: currentFiles.length,
        totalSize: currentFiles.reduce((sum, file) => sum + (file.Size || 0), 0),
        git: await this.captureGitState(),
        deployment: deploymentMetadata,
        s3: {
          bucketName: this.bucketName,
          backupPrefix: backupPrefix,
          region: this.region
        },
        cloudfront: {
          distributionId: this.distributionId
        },
        integrity: await this.calculateBackupIntegrity(currentFiles)
      };
      
      // Save backup metadata
      const metadataKey = `${backupPrefix}${this.metadataFile}`;
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: metadataKey,
        Body: JSON.stringify(backupMetadata, null, 2),
        ContentType: 'application/json',
        Metadata: {
          'backup-id': backupId,
          'backup-type': type,
          'created-at': new Date().toISOString()
        }
      }));
      
      // Clean up old backups
      await this.cleanupOldBackups();
      
      console.log('✅ Backup created successfully');
      console.log(`   Backup ID: ${backupId}`);
      console.log(`   Files: ${currentFiles.length}`);
      console.log(`   Size: ${this.formatBytes(backupMetadata.totalSize)}`);
      console.log('');
      
      return backupMetadata;
    } catch (error) {
      console.error('❌ Backup creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Get current deployment metadata
   */
  async getCurrentDeploymentMetadata() {
    try {
      // Try to get existing deployment metadata
      const result = await this.s3Client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: this.metadataFile
      }));
      
      const content = await result.Body.transformToString();
      return JSON.parse(content);
    } catch (error) {
      // If no metadata exists, create basic metadata
      return {
        timestamp: new Date().toISOString(),
        environment: this.environment,
        note: 'No previous deployment metadata found'
      };
    }
  }

  /**
   * Get all current files in the bucket (excluding backups)
   */
  async getCurrentFiles() {
    const files = [];
    let continuationToken;
    
    do {
      const listParams = {
        Bucket: this.bucketName,
        MaxKeys: 1000
      };
      
      if (continuationToken) {
        listParams.ContinuationToken = continuationToken;
      }
      
      const result = await this.s3Client.send(new ListObjectsV2Command(listParams));
      
      if (result.Contents) {
        // Filter out backup files and metadata
        const currentFiles = result.Contents.filter(file => 
          !file.Key.startsWith(this.backupPrefix) && 
          file.Key !== this.metadataFile
        );
        files.push(...currentFiles);
      }
      
      continuationToken = result.NextContinuationToken;
    } while (continuationToken);
    
    return files;
  }

  /**
   * Calculate backup integrity hash
   */
  async calculateBackupIntegrity(files) {
    const fileHashes = files.map(file => ({
      key: file.Key,
      etag: file.ETag,
      size: file.Size,
      lastModified: file.LastModified
    }));
    
    const integrityData = JSON.stringify(fileHashes.sort((a, b) => a.key.localeCompare(b.key)));
    return crypto.createHash('sha256').update(integrityData).digest('hex');
  }

  /**
   * List all available backups
   */
  async listBackups() {
    console.log('📋 Listing available backups...');
    
    try {
      const result = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: this.backupPrefix,
        Delimiter: '/'
      }));
      
      if (!result.CommonPrefixes || result.CommonPrefixes.length === 0) {
        console.log('📁 No backups found');
        return [];
      }
      
      const backups = [];
      
      for (const prefix of result.CommonPrefixes) {
        const backupId = prefix.Prefix.replace(this.backupPrefix, '').replace('/', '');
        const metadataKey = `${prefix.Prefix}${this.metadataFile}`;
        
        try {
          const metadataResult = await this.s3Client.send(new GetObjectCommand({
            Bucket: this.bucketName,
            Key: metadataKey
          }));
          
          const content = await metadataResult.Body.transformToString();
          const metadata = JSON.parse(content);
          backups.push(metadata);
        } catch (error) {
          console.warn(`⚠️  Could not read metadata for backup: ${backupId}`);
        }
      }
      
      // Sort by timestamp (newest first)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return backups;
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      throw error;
    }
  }

  /**
   * Rollback to a specific backup
   */
  async rollbackToBackup(backupId) {
    console.log(`🔄 Rolling back to backup: ${backupId}`);
    
    try {
      // Verify backup exists and get metadata
      const backupMetadata = await this.getBackupMetadata(backupId);
      if (!backupMetadata) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      
      console.log(`📋 Backup Details:`);
      console.log(`   Created: ${new Date(backupMetadata.timestamp).toLocaleString()}`);
      console.log(`   Type: ${backupMetadata.type}`);
      console.log(`   Files: ${backupMetadata.fileCount}`);
      console.log(`   Size: ${this.formatBytes(backupMetadata.totalSize)}`);
      
      if (backupMetadata.git && backupMetadata.git.shortCommit) {
        console.log(`   Git Commit: ${backupMetadata.git.shortCommit} - ${backupMetadata.git.message}`);
      }
      console.log('');
      
      // Create a backup of current state before rollback
      console.log('💾 Creating pre-rollback backup...');
      await this.createBackup('pre-rollback');
      
      // Verify backup integrity
      await this.verifyBackupIntegrity(backupId, backupMetadata);
      
      // Get backup files
      const backupFiles = await this.getBackupFiles(backupId);
      
      // Clear current deployment (except backups and metadata)
      await this.clearCurrentDeployment();
      
      // Restore files from backup
      await this.restoreFilesFromBackup(backupId, backupFiles);
      
      // Update deployment metadata
      await this.updateDeploymentMetadata(backupMetadata);
      
      // Invalidate CloudFront cache
      await this.invalidateCache();
      
      console.log('✅ Rollback completed successfully');
      console.log(`   Restored: ${backupFiles.length} files`);
      console.log(`   Backup ID: ${backupId}`);
      
      if (this.distributionId) {
        console.log('\n🌐 CloudFront cache invalidation initiated');
        console.log('   Changes may take 5-15 minutes to propagate globally');
      }
      
      return backupMetadata;
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  /**
   * Get backup metadata
   */
  async getBackupMetadata(backupId) {
    const metadataKey = `${this.backupPrefix}${backupId}/${this.metadataFile}`;
    
    try {
      const result = await this.s3Client.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: metadataKey
      }));
      
      const content = await result.Body.transformToString();
      return JSON.parse(content);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackupIntegrity(backupId, metadata) {
    console.log('🔍 Verifying backup integrity...');
    
    try {
      const backupFiles = await this.getBackupFiles(backupId);
      const currentIntegrity = await this.calculateBackupIntegrity(
        backupFiles.map(file => ({
          Key: file.Key.replace(`${this.backupPrefix}${backupId}/`, ''),
          ETag: file.ETag,
          Size: file.Size,
          LastModified: file.LastModified
        }))
      );
      
      if (currentIntegrity !== metadata.integrity) {
        throw new Error('Backup integrity check failed - backup may be corrupted');
      }
      
      console.log('✅ Backup integrity verified');
    } catch (error) {
      console.error('❌ Backup integrity verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Get files from a specific backup
   */
  async getBackupFiles(backupId) {
    const backupPrefix = `${this.backupPrefix}${backupId}/`;
    const files = [];
    let continuationToken;
    
    do {
      const listParams = {
        Bucket: this.bucketName,
        Prefix: backupPrefix,
        MaxKeys: 1000
      };
      
      if (continuationToken) {
        listParams.ContinuationToken = continuationToken;
      }
      
      const result = await this.s3Client.send(new ListObjectsV2Command(listParams));
      
      if (result.Contents) {
        // Filter out the metadata file
        const backupFiles = result.Contents.filter(file => 
          !file.Key.endsWith(this.metadataFile)
        );
        files.push(...backupFiles);
      }
      
      continuationToken = result.NextContinuationToken;
    } while (continuationToken);
    
    return files;
  }

  /**
   * Clear current deployment files
   */
  async clearCurrentDeployment() {
    console.log('🧹 Clearing current deployment...');
    
    const currentFiles = await this.getCurrentFiles();
    
    if (currentFiles.length === 0) {
      console.log('   No files to clear');
      return;
    }
    
    console.log(`   Deleting ${currentFiles.length} files...`);
    
    // Delete files in batches
    const batchSize = 100;
    for (let i = 0; i < currentFiles.length; i += batchSize) {
      const batch = currentFiles.slice(i, i + batchSize);
      
      await Promise.all(batch.map(file => 
        this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: file.Key
        }))
      ));
      
      console.log(`   Deleted ${Math.min(i + batchSize, currentFiles.length)}/${currentFiles.length} files`);
    }
    
    console.log('✅ Current deployment cleared');
  }

  /**
   * Restore files from backup
   */
  async restoreFilesFromBackup(backupId, backupFiles) {
    console.log(`📤 Restoring ${backupFiles.length} files from backup...`);
    
    let restoredCount = 0;
    
    for (const file of backupFiles) {
      const sourceKey = file.Key;
      const targetKey = file.Key.replace(`${this.backupPrefix}${backupId}/`, '');
      
      await this.s3Client.send(new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: targetKey,
        MetadataDirective: 'COPY'
      }));
      
      restoredCount++;
      if (restoredCount % 10 === 0) {
        console.log(`   Restored ${restoredCount}/${backupFiles.length} files`);
      }
    }
    
    console.log('✅ Files restored from backup');
  }

  /**
   * Update deployment metadata
   */
  async updateDeploymentMetadata(backupMetadata) {
    const deploymentMetadata = {
      ...backupMetadata.deployment,
      restoredFrom: {
        backupId: backupMetadata.id,
        backupTimestamp: backupMetadata.timestamp,
        restoredAt: new Date().toISOString()
      }
    };
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: this.metadataFile,
      Body: JSON.stringify(deploymentMetadata, null, 2),
      ContentType: 'application/json'
    }));
  }

  /**
   * Invalidate CloudFront cache
   */
  async invalidateCache() {
    if (!this.distributionId) {
      console.log('⚠️  Skipping cache invalidation (no distribution ID configured)');
      return;
    }
    
    console.log('🔄 Invalidating CloudFront cache...');
    
    try {
      const invalidationParams = {
        DistributionId: this.distributionId,
        InvalidationBatch: {
          CallerReference: `rollback-${Date.now()}`,
          Paths: {
            Quantity: 1,
            Items: ['/*'] // Invalidate all paths for rollback
          }
        }
      };
      
      const result = await this.cloudFrontClient.send(
        new CreateInvalidationCommand(invalidationParams)
      );
      
      console.log('✅ Cache invalidation started');
      console.log(`   Invalidation ID: ${result.Invalidation.Id}`);
    } catch (error) {
      console.error('❌ Cache invalidation failed:', error.message);
      console.error('   Rollback succeeded but cache may not be updated');
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups() {
    const backups = await this.listBackups();
    
    if (backups.length <= this.maxBackups) {
      return;
    }
    
    const backupsToDelete = backups.slice(this.maxBackups);
    console.log(`🗑️  Cleaning up ${backupsToDelete.length} old backups...`);
    
    for (const backup of backupsToDelete) {
      await this.deleteBackup(backup.id);
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupId) {
    const backupPrefix = `${this.backupPrefix}${backupId}/`;
    
    try {
      // Get all files in the backup
      const result = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: backupPrefix
      }));
      
      if (!result.Contents || result.Contents.length === 0) {
        return;
      }
      
      // Delete all backup files
      for (const file of result.Contents) {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: file.Key
        }));
      }
      
      console.log(`   Deleted backup: ${backupId}`);
    } catch (error) {
      console.warn(`⚠️  Failed to delete backup ${backupId}:`, error.message);
    }
  }

  /**
   * Capture current git state
   */
  async captureGitState() {
    try {
      const gitState = {
        branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        shortCommit: execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(),
        message: execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim(),
        author: execSync('git log -1 --pretty=%an', { encoding: 'utf8' }).trim(),
        date: execSync('git log -1 --pretty=%ai', { encoding: 'utf8' }).trim(),
        status: execSync('git status --porcelain', { encoding: 'utf8' }).trim()
      };
      
      return gitState;
    } catch (error) {
      console.warn('⚠️  Could not capture git state:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Emergency rollback to the most recent backup
   */
  async emergencyRollback() {
    console.log('🚨 Performing emergency rollback...');
    
    const backups = await this.listBackups();
    
    if (backups.length === 0) {
      throw new Error('No backups available for emergency rollback');
    }
    
    // Find the most recent non-pre-rollback backup
    const lastGoodBackup = backups.find(backup => 
      backup.type !== 'pre-rollback' && backup.fileCount > 0
    );
    
    if (!lastGoodBackup) {
      throw new Error('No suitable backup found for emergency rollback');
    }
    
    console.log(`🔄 Emergency rollback to: ${lastGoodBackup.id}`);
    console.log(`   Created: ${new Date(lastGoodBackup.timestamp).toLocaleString()}`);
    
    return await this.rollbackToBackup(lastGoodBackup.id);
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Display backup information
   */
  displayBackups(backups) {
    if (backups.length === 0) {
      console.log('📁 No backups found');
      return;
    }
    
    console.log('\n📋 Available Backups:');
    console.log('='.repeat(80));
    
    for (const backup of backups) {
      console.log(`ID: ${backup.id}`);
      console.log(`Date: ${new Date(backup.timestamp).toLocaleString()}`);
      console.log(`Type: ${backup.type}`);
      console.log(`Files: ${backup.fileCount}`);
      console.log(`Size: ${this.formatBytes(backup.totalSize)}`);
      
      if (backup.git && backup.git.shortCommit) {
        console.log(`Git: ${backup.git.shortCommit} - ${backup.git.message}`);
      }
      
      console.log('-'.repeat(60));
    }
  }
}

// CLI Interface
async function main() {
  const manager = new RollbackManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'backup':
        await manager.createBackup(arg || 'manual');
        break;

      case 'list':
        const backups = await manager.listBackups();
        manager.displayBackups(backups);
        break;

      case 'rollback':
        if (!arg) {
          console.error('❌ Please specify backup ID');
          console.error('Usage: node rollback.js rollback <backup-id>');
          process.exit(1);
        }
        await manager.rollbackToBackup(arg);
        break;

      case 'emergency':
        await manager.emergencyRollback();
        break;

      case 'delete':
        if (!arg) {
          console.error('❌ Please specify backup ID');
          console.error('Usage: node rollback.js delete <backup-id>');
          process.exit(1);
        }
        await manager.deleteBackup(arg);
        console.log(`✅ Backup deleted: ${arg}`);
        break;

      case 'verify':
        if (!arg) {
          console.error('❌ Please specify backup ID');
          console.error('Usage: node rollback.js verify <backup-id>');
          process.exit(1);
        }
        const metadata = await manager.getBackupMetadata(arg);
        if (!metadata) {
          console.error(`❌ Backup not found: ${arg}`);
          process.exit(1);
        }
        await manager.verifyBackupIntegrity(arg, metadata);
        console.log(`✅ Backup integrity verified: ${arg}`);
        break;

      default:
        console.log(`
🔄 S3 + CloudFront Rollback Manager

Usage:
  node rollback.js <command> [options]

Commands:
  backup [type]     Create a backup (type: manual, auto, pre-deploy)
  list             List all available backups
  rollback <id>    Rollback to specific backup
  emergency        Emergency rollback to last known good state
  delete <id>      Delete a specific backup
  verify <id>      Verify backup integrity

Examples:
  node rollback.js backup manual
  node rollback.js list
  node rollback.js rollback backup-2024-01-01T12-00-00-000Z
  node rollback.js emergency
  node rollback.js verify backup-2024-01-01T12-00-00-000Z

Environment Variables:
  S3_BUCKET_NAME              - Required: S3 bucket name
  CLOUDFRONT_DISTRIBUTION_ID  - Optional: CloudFront distribution ID
  AWS_REGION                  - Optional: AWS region (default: us-east-1)
  ENVIRONMENT                 - Optional: Environment name (default: production)
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = RollbackManager;