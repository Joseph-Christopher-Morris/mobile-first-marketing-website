#!/usr/bin/env node

/**
 * CloudFront Configuration Rollback Script
 * 
 * This script provides comprehensive rollback functionality for CloudFront configurations:
 * 1. Backup current distribution configuration before changes
 * 2. Restore previous configuration from backup
 * 3. Validate rollback success
 * 4. Manage configuration history
 */

const { 
    CloudFrontClient, 
    GetDistributionConfigCommand,
    UpdateDistributionCommand,
    DeleteFunctionCommand,
    DescribeFunctionCommand
} = require('@aws-sdk/client-cloudfront');
const fs = require('fs').promises;
const path = require('path');

class CloudFrontConfigurationRollback {
    constructor() {
        this.client = new CloudFrontClient({ 
            region: 'us-east-1' // CloudFront is global but API calls go to us-east-1
        });
        
        // Configuration constants
        this.DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID || 'E2IBMHQ3GCW6ZK';
        this.BACKUP_DIR = path.join(process.cwd(), 'config', 'cloudfront-backups');
        this.FUNCTION_NAME = 'pretty-urls-rewriter';
        
        console.log(`🔄 CloudFront Configuration Rollback Manager`);
        console.log(`📋 Distribution ID: ${this.DISTRIBUTION_ID}`);
        console.log(`💾 Backup Directory: ${this.BACKUP_DIR}`);
    }

    /**
     * Create backup of current distribution configuration
     */
    async createConfigurationBackup(description = 'Automatic backup before configuration change') {
        try {
            console.log(`\n📦 Creating configuration backup...`);
            
            // Ensure backup directory exists
            await this.ensureBackupDirectory();
            
            // Get current distribution configuration
            const configResponse = await this.getCurrentDistributionConfig();
            
            // Create backup metadata
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupId = `backup-${timestamp}`;
            
            const backupData = {
                backupId,
                timestamp: new Date().toISOString(),
                description,
                distributionId: this.DISTRIBUTION_ID,
                distributionConfig: configResponse.DistributionConfig,
                etag: configResponse.ETag,
                metadata: {
                    defaultRootObject: configResponse.DistributionConfig.DefaultRootObject,
                    functionAssociations: configResponse.DistributionConfig.DefaultCacheBehavior.FunctionAssociations?.Quantity || 0,
                    origins: configResponse.DistributionConfig.Origins.Quantity,
                    cacheBehaviors: configResponse.DistributionConfig.CacheBehaviors?.Quantity || 0
                }
            };
            
            // Save backup to file
            const backupFilePath = path.join(this.BACKUP_DIR, `${backupId}.json`);
            await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2));
            
            // Update backup index
            await this.updateBackupIndex(backupData);
            
            console.log(`✅ Configuration backup created successfully`);
            console.log(`   📁 Backup ID: ${backupId}`);
            console.log(`   📄 File: ${backupFilePath}`);
            console.log(`   📊 Metadata:`);
            console.log(`      • Default Root Object: ${backupData.metadata.defaultRootObject || 'Not set'}`);
            console.log(`      • Function Associations: ${backupData.metadata.functionAssociations}`);
            console.log(`      • Origins: ${backupData.metadata.origins}`);
            console.log(`      • Cache Behaviors: ${backupData.metadata.cacheBehaviors}`);
            
            return backupId;
            
        } catch (error) {
            console.error(`❌ Failed to create configuration backup: ${error.message}`);
            throw error;
        }
    }

    /**
     * Restore configuration from backup
     */
    async restoreFromBackup(backupId, options = {}) {
        try {
            console.log(`\n🔄 Restoring configuration from backup: ${backupId}`);
            
            // Load backup data
            const backupData = await this.loadBackupData(backupId);
            
            // Validate backup data
            await this.validateBackupData(backupData);
            
            // Get current configuration for comparison
            const currentConfig = await this.getCurrentDistributionConfig();
            
            // Display restoration preview
            if (!options.skipPreview) {
                await this.displayRestorationPreview(backupData, currentConfig);
                
                if (!options.force) {
                    const confirmation = await this.confirmRestoration();
                    if (!confirmation) {
                        console.log(`❌ Restoration cancelled by user`);
                        return false;
                    }
                }
            }
            
            // Create backup of current state before restoration
            if (!options.skipCurrentBackup) {
                const currentBackupId = await this.createConfigurationBackup('Pre-restoration backup');
                console.log(`📦 Created backup of current state: ${currentBackupId}`);
            }
            
            // Perform restoration
            await this.performRestoration(backupData, currentConfig);
            
            // Validate restoration success
            const validationResults = await this.validateRestoration(backupData);
            
            if (validationResults.success) {
                console.log(`✅ Configuration restoration completed successfully`);
                
                // Log restoration to history
                await this.logRestorationToHistory(backupId, backupData);
                
                return true;
            } else {
                console.log(`⚠️  Restoration completed with warnings`);
                console.log(`   Failed validations: ${validationResults.failures.join(', ')}`);
                return false;
            }
            
        } catch (error) {
            console.error(`❌ Failed to restore configuration: ${error.message}`);
            throw error;
        }
    }

    /**
     * List available backups
     */
    async listBackups() {
        try {
            console.log(`\n📋 Available Configuration Backups:`);
            
            const backupIndex = await this.loadBackupIndex();
            
            if (backupIndex.backups.length === 0) {
                console.log(`   No backups found`);
                return [];
            }
            
            // Sort backups by timestamp (newest first)
            const sortedBackups = backupIndex.backups.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            console.log(`   Found ${sortedBackups.length} backup(s):\n`);
            
            sortedBackups.forEach((backup, index) => {
                const date = new Date(backup.timestamp).toLocaleString();
                console.log(`   ${index + 1}. ${backup.backupId}`);
                console.log(`      📅 Created: ${date}`);
                console.log(`      📝 Description: ${backup.description}`);
                console.log(`      📊 Default Root Object: ${backup.metadata.defaultRootObject || 'Not set'}`);
                console.log(`      🔗 Function Associations: ${backup.metadata.functionAssociations}`);
                console.log(``);
            });
            
            return sortedBackups;
            
        } catch (error) {
            console.error(`❌ Failed to list backups: ${error.message}`);
            return [];
        }
    }

    /**
     * Delete old backups (cleanup)
     */
    async cleanupOldBackups(retentionDays = 30) {
        try {
            console.log(`\n🧹 Cleaning up backups older than ${retentionDays} days...`);
            
            const backupIndex = await this.loadBackupIndex();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            
            const backupsToDelete = backupIndex.backups.filter(backup => 
                new Date(backup.timestamp) < cutoffDate
            );
            
            if (backupsToDelete.length === 0) {
                console.log(`   No old backups to clean up`);
                return;
            }
            
            console.log(`   Found ${backupsToDelete.length} backup(s) to delete:`);
            
            for (const backup of backupsToDelete) {
                try {
                    const backupFilePath = path.join(this.BACKUP_DIR, `${backup.backupId}.json`);
                    await fs.unlink(backupFilePath);
                    console.log(`   ✅ Deleted: ${backup.backupId}`);
                } catch (error) {
                    console.log(`   ⚠️  Failed to delete ${backup.backupId}: ${error.message}`);
                }
            }
            
            // Update backup index
            const remainingBackups = backupIndex.backups.filter(backup => 
                new Date(backup.timestamp) >= cutoffDate
            );
            
            await this.updateBackupIndexWithBackups(remainingBackups);
            
            console.log(`✅ Cleanup completed. ${remainingBackups.length} backups retained.`);
            
        } catch (error) {
            console.error(`❌ Failed to cleanup old backups: ${error.message}`);
        }
    }

    /**
     * Get current distribution configuration
     */
    async getCurrentDistributionConfig() {
        try {
            const command = new GetDistributionConfigCommand({
                Id: this.DISTRIBUTION_ID
            });
            
            return await this.client.send(command);
            
        } catch (error) {
            if (error.name === 'NoSuchDistribution') {
                throw new Error(`CloudFront distribution ${this.DISTRIBUTION_ID} not found`);
            }
            throw new Error(`Failed to get distribution configuration: ${error.message}`);
        }
    }

    /**
     * Ensure backup directory exists
     */
    async ensureBackupDirectory() {
        try {
            await fs.access(this.BACKUP_DIR);
        } catch (error) {
            // Directory doesn't exist, create it
            await fs.mkdir(this.BACKUP_DIR, { recursive: true });
            console.log(`📁 Created backup directory: ${this.BACKUP_DIR}`);
        }
    }

    /**
     * Update backup index
     */
    async updateBackupIndex(backupData) {
        try {
            const indexPath = path.join(this.BACKUP_DIR, 'backup-index.json');
            
            let backupIndex;
            try {
                const indexContent = await fs.readFile(indexPath, 'utf8');
                backupIndex = JSON.parse(indexContent);
            } catch (error) {
                // Index doesn't exist, create new one
                backupIndex = {
                    version: '1.0',
                    distributionId: this.DISTRIBUTION_ID,
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    backups: []
                };
            }
            
            // Add new backup to index
            backupIndex.backups.push({
                backupId: backupData.backupId,
                timestamp: backupData.timestamp,
                description: backupData.description,
                metadata: backupData.metadata
            });
            
            // Update timestamp
            backupIndex.lastUpdated = new Date().toISOString();
            
            // Save updated index
            await fs.writeFile(indexPath, JSON.stringify(backupIndex, null, 2));
            
        } catch (error) {
            console.warn(`⚠️  Failed to update backup index: ${error.message}`);
        }
    }

    /**
     * Load backup index
     */
    async loadBackupIndex() {
        try {
            const indexPath = path.join(this.BACKUP_DIR, 'backup-index.json');
            const indexContent = await fs.readFile(indexPath, 'utf8');
            return JSON.parse(indexContent);
        } catch (error) {
            // Return empty index if file doesn't exist
            return {
                version: '1.0',
                distributionId: this.DISTRIBUTION_ID,
                created: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                backups: []
            };
        }
    }

    /**
     * Update backup index with new backup list
     */
    async updateBackupIndexWithBackups(backups) {
        try {
            const indexPath = path.join(this.BACKUP_DIR, 'backup-index.json');
            
            const backupIndex = {
                version: '1.0',
                distributionId: this.DISTRIBUTION_ID,
                created: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                backups: backups
            };
            
            await fs.writeFile(indexPath, JSON.stringify(backupIndex, null, 2));
            
        } catch (error) {
            console.warn(`⚠️  Failed to update backup index: ${error.message}`);
        }
    }

    /**
     * Load backup data from file
     */
    async loadBackupData(backupId) {
        try {
            const backupFilePath = path.join(this.BACKUP_DIR, `${backupId}.json`);
            const backupContent = await fs.readFile(backupFilePath, 'utf8');
            return JSON.parse(backupContent);
        } catch (error) {
            throw new Error(`Failed to load backup ${backupId}: ${error.message}`);
        }
    }

    /**
     * Validate backup data integrity
     */
    async validateBackupData(backupData) {
        const requiredFields = ['backupId', 'distributionId', 'distributionConfig', 'etag'];
        
        for (const field of requiredFields) {
            if (!backupData[field]) {
                throw new Error(`Invalid backup data: missing ${field}`);
            }
        }
        
        if (backupData.distributionId !== this.DISTRIBUTION_ID) {
            throw new Error(`Backup is for different distribution: ${backupData.distributionId} (expected: ${this.DISTRIBUTION_ID})`);
        }
        
        console.log(`✅ Backup data validation passed`);
    }

    /**
     * Display restoration preview
     */
    async displayRestorationPreview(backupData, currentConfig) {
        console.log(`\n📋 Restoration Preview:`);
        console.log(`   Backup ID: ${backupData.backupId}`);
        console.log(`   Backup Date: ${new Date(backupData.timestamp).toLocaleString()}`);
        console.log(`   Description: ${backupData.description}`);
        
        console.log(`\n🔄 Configuration Changes:`);
        
        // Compare default root object
        const currentRootObject = currentConfig.DistributionConfig.DefaultRootObject || 'Not set';
        const backupRootObject = backupData.distributionConfig.DefaultRootObject || 'Not set';
        
        if (currentRootObject !== backupRootObject) {
            console.log(`   📄 Default Root Object: ${currentRootObject} → ${backupRootObject}`);
        } else {
            console.log(`   📄 Default Root Object: ${currentRootObject} (no change)`);
        }
        
        // Compare function associations
        const currentFunctions = currentConfig.DistributionConfig.DefaultCacheBehavior.FunctionAssociations?.Quantity || 0;
        const backupFunctions = backupData.distributionConfig.DefaultCacheBehavior.FunctionAssociations?.Quantity || 0;
        
        if (currentFunctions !== backupFunctions) {
            console.log(`   🔗 Function Associations: ${currentFunctions} → ${backupFunctions}`);
        } else {
            console.log(`   🔗 Function Associations: ${currentFunctions} (no change)`);
        }
        
        // Compare origins
        const currentOrigins = currentConfig.DistributionConfig.Origins.Quantity;
        const backupOrigins = backupData.distributionConfig.Origins.Quantity;
        
        if (currentOrigins !== backupOrigins) {
            console.log(`   🌐 Origins: ${currentOrigins} → ${backupOrigins}`);
        } else {
            console.log(`   🌐 Origins: ${currentOrigins} (no change)`);
        }
    }

    /**
     * Confirm restoration with user
     */
    async confirmRestoration() {
        // In a real implementation, you might use readline for interactive confirmation
        // For now, we'll assume confirmation in automated scenarios
        console.log(`\n⚠️  This will modify the CloudFront distribution configuration.`);
        console.log(`   Current configuration will be backed up before restoration.`);
        console.log(`   Proceeding with restoration...`);
        return true;
    }

    /**
     * Perform the actual restoration
     */
    async performRestoration(backupData, currentConfig) {
        try {
            console.log(`\n🔄 Performing configuration restoration...`);
            
            // Use the backup configuration but with current ETag
            const restorationConfig = backupData.distributionConfig;
            
            const updateCommand = new UpdateDistributionCommand({
                Id: this.DISTRIBUTION_ID,
                DistributionConfig: restorationConfig,
                IfMatch: currentConfig.ETag
            });
            
            const updateResponse = await this.client.send(updateCommand);
            
            console.log(`✅ Distribution configuration restored successfully`);
            console.log(`   📋 Distribution is deploying... (this may take 5-15 minutes)`);
            
            return updateResponse;
            
        } catch (error) {
            if (error.name === 'PreconditionFailed') {
                throw new Error('Distribution configuration was modified during restoration. Please retry.');
            }
            throw new Error(`Failed to restore configuration: ${error.message}`);
        }
    }

    /**
     * Validate restoration success
     */
    async validateRestoration(backupData) {
        try {
            console.log(`\n🔍 Validating restoration success...`);
            
            // Wait a moment for the configuration to be updated
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Get updated configuration
            const updatedConfig = await this.getCurrentDistributionConfig();
            const config = updatedConfig.DistributionConfig;
            
            const validationResults = {
                success: true,
                failures: []
            };
            
            // Validate default root object
            const expectedRootObject = backupData.distributionConfig.DefaultRootObject;
            const actualRootObject = config.DefaultRootObject;
            
            if (expectedRootObject !== actualRootObject) {
                validationResults.success = false;
                validationResults.failures.push('Default Root Object mismatch');
                console.log(`   ❌ Default Root Object: Expected ${expectedRootObject}, got ${actualRootObject}`);
            } else {
                console.log(`   ✅ Default Root Object: ${actualRootObject || 'Not set'}`);
            }
            
            // Validate function associations
            const expectedFunctions = backupData.distributionConfig.DefaultCacheBehavior.FunctionAssociations?.Quantity || 0;
            const actualFunctions = config.DefaultCacheBehavior.FunctionAssociations?.Quantity || 0;
            
            if (expectedFunctions !== actualFunctions) {
                validationResults.success = false;
                validationResults.failures.push('Function Associations count mismatch');
                console.log(`   ❌ Function Associations: Expected ${expectedFunctions}, got ${actualFunctions}`);
            } else {
                console.log(`   ✅ Function Associations: ${actualFunctions}`);
            }
            
            // Validate origins
            const expectedOrigins = backupData.distributionConfig.Origins.Quantity;
            const actualOrigins = config.Origins.Quantity;
            
            if (expectedOrigins !== actualOrigins) {
                validationResults.success = false;
                validationResults.failures.push('Origins count mismatch');
                console.log(`   ❌ Origins: Expected ${expectedOrigins}, got ${actualOrigins}`);
            } else {
                console.log(`   ✅ Origins: ${actualOrigins}`);
            }
            
            if (validationResults.success) {
                console.log(`✅ All restoration validations passed`);
            } else {
                console.log(`⚠️  Some restoration validations failed`);
            }
            
            return validationResults;
            
        } catch (error) {
            console.error(`❌ Restoration validation failed: ${error.message}`);
            return {
                success: false,
                failures: ['Validation error: ' + error.message]
            };
        }
    }

    /**
     * Log restoration to history
     */
    async logRestorationToHistory(backupId, backupData) {
        try {
            const historyPath = path.join(this.BACKUP_DIR, 'restoration-history.json');
            
            let history;
            try {
                const historyContent = await fs.readFile(historyPath, 'utf8');
                history = JSON.parse(historyContent);
            } catch (error) {
                history = {
                    version: '1.0',
                    distributionId: this.DISTRIBUTION_ID,
                    restorations: []
                };
            }
            
            history.restorations.push({
                timestamp: new Date().toISOString(),
                backupId: backupId,
                backupTimestamp: backupData.timestamp,
                description: backupData.description,
                success: true
            });
            
            await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
            
        } catch (error) {
            console.warn(`⚠️  Failed to log restoration to history: ${error.message}`);
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const rollback = new CloudFrontConfigurationRollback();
    
    try {
        switch (command) {
            case 'backup':
                const description = args[1] || 'Manual backup';
                const backupId = await rollback.createConfigurationBackup(description);
                console.log(`\n✅ Backup created: ${backupId}`);
                break;
                
            case 'restore':
                const restoreBackupId = args[1];
                if (!restoreBackupId) {
                    console.error('❌ Please specify backup ID to restore');
                    process.exit(1);
                }
                
                const force = args.includes('--force');
                const success = await rollback.restoreFromBackup(restoreBackupId, { force });
                
                if (success) {
                    console.log(`\n✅ Configuration restored successfully`);
                } else {
                    console.log(`\n⚠️  Configuration restored with warnings`);
                }
                break;
                
            case 'list':
                await rollback.listBackups();
                break;
                
            case 'cleanup':
                const retentionDays = parseInt(args[1]) || 30;
                await rollback.cleanupOldBackups(retentionDays);
                break;
                
            default:
                console.log(`\n📋 CloudFront Configuration Rollback Usage:`);
                console.log(`   node cloudfront-configuration-rollback.js backup [description]`);
                console.log(`   node cloudfront-configuration-rollback.js restore <backup-id> [--force]`);
                console.log(`   node cloudfront-configuration-rollback.js list`);
                console.log(`   node cloudfront-configuration-rollback.js cleanup [retention-days]`);
                console.log(`\nExamples:`);
                console.log(`   node cloudfront-configuration-rollback.js backup "Before pretty URLs setup"`);
                console.log(`   node cloudfront-configuration-rollback.js restore backup-2025-01-15T10-30-00-000Z`);
                console.log(`   node cloudfront-configuration-rollback.js cleanup 30`);
        }
        
    } catch (error) {
        console.error(`\n❌ Operation failed: ${error.message}`);
        process.exit(1);
    }
}

// Export for use as module
module.exports = CloudFrontConfigurationRollback;

// Run CLI if called directly
if (require.main === module) {
    main();
}