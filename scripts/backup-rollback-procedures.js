#!/usr/bin/env node

/**
 * Backup and Rollback Procedures Script
 *
 * Provides automated backup and rollback capabilities for AWS Amplify deployments.
 * Includes verification procedures and emergency rollback options.
 *
 * Requirements: 1.1, 1.2, 4.5
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackupRollbackManager {
  constructor() {
    this.backupPath = path.join(process.cwd(), '.kiro', 'backups');
    this.configPath = path.join(process.cwd(), '.kiro', 'deployment');
    this.maxBackups = 10;

    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [this.backupPath, this.configPath];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  async createBackup(type = 'manual') {
    console.log(`🔄 Creating ${type} backup...`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    const backupDir = path.join(this.backupPath, backupId);

    try {
      fs.mkdirSync(backupDir, { recursive: true });

      const backup = {
        id: backupId,
        timestamp: new Date().toISOString(),
        type: type,
        git: await this.captureGitState(),
        environment: await this.captureEnvironmentState(),
        build: await this.captureBuildState(),
        deployment: await this.captureDeploymentState(),
      };

      // Save backup metadata
      const metadataFile = path.join(backupDir, 'metadata.json');
      fs.writeFileSync(metadataFile, JSON.stringify(backup, null, 2));

      // Create git bundle for complete source backup
      await this.createGitBundle(backupDir);

      // Backup configuration files
      await this.backupConfigFiles(backupDir);

      // Cleanup old backups
      await this.cleanupOldBackups();

      console.log(`✅ Backup created successfully: ${backupId}`);
      return backup;
    } catch (error) {
      console.error(`❌ Backup creation failed: ${error.message}`);
      throw error;
    }
  }

  async captureGitState() {
    try {
      const gitState = {
        branch: execSync('git rev-parse --abbrev-ref HEAD', {
          encoding: 'utf8',
        }).trim(),
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        shortCommit: execSync('git rev-parse --short HEAD', {
          encoding: 'utf8',
        }).trim(),
        message: execSync('git log -1 --pretty=%B', {
          encoding: 'utf8',
        }).trim(),
        author: execSync('git log -1 --pretty=%an', {
          encoding: 'utf8',
        }).trim(),
        date: execSync('git log -1 --pretty=%ai', { encoding: 'utf8' }).trim(),
        status: execSync('git status --porcelain', { encoding: 'utf8' }).trim(),
        remoteUrl: execSync('git config --get remote.origin.url', {
          encoding: 'utf8',
        }).trim(),
      };

      return gitState;
    } catch (error) {
      console.warn('⚠️  Could not capture complete git state:', error.message);
      return { error: error.message };
    }
  }

  async captureEnvironmentState() {
    const envVars = {};

    // Capture relevant environment variables (excluding sensitive ones)
    const relevantVars = [
      'NODE_ENV',
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_SITE_NAME',
      'NEXT_PUBLIC_GA_ID',
      'NEXT_PUBLIC_GTM_ID',
      'AMPLIFY_APP_ID',
      'AMPLIFY_BRANCH',
      'AWS_REGION',
    ];

    for (const varName of relevantVars) {
      if (process.env[varName]) {
        envVars[varName] = process.env[varName];
      }
    }

    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      variables: envVars,
      packageVersion: this.getPackageVersion(),
    };
  }

  async captureBuildState() {
    try {
      const buildState = {
        hasNextConfig: fs.existsSync('next.config.js'),
        hasAmplifyConfig: fs.existsSync('amplify.yml'),
        hasPackageJson: fs.existsSync('package.json'),
        hasTsConfig: fs.existsSync('tsconfig.json'),
        buildOutputExists: fs.existsSync('out'),
        nextCacheExists: fs.existsSync('.next'),
      };

      // Get package.json info
      if (buildState.hasPackageJson) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        buildState.dependencies = Object.keys(
          packageJson.dependencies || {}
        ).length;
        buildState.devDependencies = Object.keys(
          packageJson.devDependencies || {}
        ).length;
        buildState.scripts = Object.keys(packageJson.scripts || {});
      }

      return buildState;
    } catch (error) {
      return { error: error.message };
    }
  }

  async captureDeploymentState() {
    // This would capture AWS Amplify deployment state
    // In a real implementation, this would query AWS APIs
    return {
      timestamp: new Date().toISOString(),
      status: 'captured',
      note: 'Deployment state capture would query AWS Amplify APIs',
    };
  }

  async createGitBundle(backupDir) {
    try {
      const bundlePath = path.join(backupDir, 'source.bundle');
      execSync(`git bundle create "${bundlePath}" --all`, { stdio: 'pipe' });
      console.log('📦 Git bundle created');
    } catch (error) {
      console.warn('⚠️  Could not create git bundle:', error.message);
    }
  }

  async backupConfigFiles(backupDir) {
    const configFiles = [
      'package.json',
      'package-lock.json',
      'next.config.js',
      'amplify.yml',
      'tsconfig.json',
      '.env.example',
      'tailwind.config.js',
      'postcss.config.js',
    ];

    const configBackupDir = path.join(backupDir, 'config');
    fs.mkdirSync(configBackupDir, { recursive: true });

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        const destPath = path.join(configBackupDir, file);
        fs.copyFileSync(file, destPath);
      }
    }

    console.log('⚙️  Configuration files backed up');
  }

  async listBackups() {
    if (!fs.existsSync(this.backupPath)) {
      console.log('📁 No backups found');
      return [];
    }

    const backups = [];
    const backupDirs = fs
      .readdirSync(this.backupPath)
      .filter(dir => dir.startsWith('backup-'))
      .sort()
      .reverse();

    for (const dir of backupDirs) {
      const metadataFile = path.join(this.backupPath, dir, 'metadata.json');
      if (fs.existsSync(metadataFile)) {
        const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
        backups.push(metadata);
      }
    }

    return backups;
  }

  async rollbackToBackup(backupId) {
    console.log(`🔄 Rolling back to backup: ${backupId}`);

    const backupDir = path.join(this.backupPath, backupId);
    const metadataFile = path.join(backupDir, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));

    try {
      // Create a backup of current state before rollback
      await this.createBackup('pre-rollback');

      // Rollback git state
      await this.rollbackGitState(metadata.git);

      // Restore configuration files
      await this.restoreConfigFiles(backupDir);

      // Verify rollback
      await this.verifyRollback(metadata);

      console.log(`✅ Rollback completed successfully to: ${backupId}`);
      console.log(
        `📝 Commit: ${metadata.git.shortCommit} - ${metadata.git.message}`
      );

      return metadata;
    } catch (error) {
      console.error(`❌ Rollback failed: ${error.message}`);
      throw error;
    }
  }

  async rollbackGitState(gitState) {
    if (!gitState.commit) {
      throw new Error('No commit hash in backup metadata');
    }

    try {
      // Check if commit exists
      execSync(`git cat-file -e ${gitState.commit}`, { stdio: 'pipe' });

      // Reset to the backup commit
      execSync(`git reset --hard ${gitState.commit}`, { stdio: 'pipe' });

      console.log(`🔄 Git state rolled back to: ${gitState.shortCommit}`);
    } catch (error) {
      throw new Error(`Failed to rollback git state: ${error.message}`);
    }
  }

  async restoreConfigFiles(backupDir) {
    const configBackupDir = path.join(backupDir, 'config');

    if (!fs.existsSync(configBackupDir)) {
      console.log('⚠️  No configuration files to restore');
      return;
    }

    const configFiles = fs.readdirSync(configBackupDir);

    for (const file of configFiles) {
      const sourcePath = path.join(configBackupDir, file);
      const destPath = path.join(process.cwd(), file);

      fs.copyFileSync(sourcePath, destPath);
      console.log(`📄 Restored: ${file}`);
    }
  }

  async verifyRollback(metadata) {
    console.log('🔍 Verifying rollback...');

    // Verify git state
    const currentCommit = execSync('git rev-parse HEAD', {
      encoding: 'utf8',
    }).trim();
    if (currentCommit !== metadata.git.commit) {
      throw new Error('Git rollback verification failed');
    }

    // Verify key files exist
    const keyFiles = ['package.json', 'next.config.js'];
    for (const file of keyFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Key file missing after rollback: ${file}`);
      }
    }

    console.log('✅ Rollback verification passed');
  }

  async emergencyRollback() {
    console.log('🚨 Performing emergency rollback...');

    const backups = await this.listBackups();
    if (backups.length === 0) {
      throw new Error('No backups available for emergency rollback');
    }

    // Find the most recent successful backup
    const lastGoodBackup = backups.find(
      backup =>
        backup.type !== 'pre-rollback' && backup.git && backup.git.commit
    );

    if (!lastGoodBackup) {
      throw new Error('No suitable backup found for emergency rollback');
    }

    console.log(`🔄 Emergency rollback to: ${lastGoodBackup.id}`);
    return await this.rollbackToBackup(lastGoodBackup.id);
  }

  async cleanupOldBackups() {
    const backups = await this.listBackups();

    if (backups.length <= this.maxBackups) {
      return;
    }

    const backupsToDelete = backups.slice(this.maxBackups);

    for (const backup of backupsToDelete) {
      const backupDir = path.join(this.backupPath, backup.id);
      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true });
        console.log(`🗑️  Cleaned up old backup: ${backup.id}`);
      }
    }
  }

  getPackageVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.version || '0.0.0';
    } catch (error) {
      return 'unknown';
    }
  }

  async generateRollbackPlan(backupId) {
    const backupDir = path.join(this.backupPath, backupId);
    const metadataFile = path.join(backupDir, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    const currentGitState = await this.captureGitState();

    const plan = {
      rollbackTarget: {
        id: backupId,
        timestamp: metadata.timestamp,
        commit: metadata.git.shortCommit,
        message: metadata.git.message,
      },
      currentState: {
        commit: currentGitState.shortCommit,
        branch: currentGitState.branch,
        hasUncommittedChanges: currentGitState.status.length > 0,
      },
      actions: [
        'Create pre-rollback backup',
        `Reset git to commit ${metadata.git.shortCommit}`,
        'Restore configuration files',
        'Verify rollback success',
        'Run post-rollback tests',
      ],
      risks: [],
      recommendations: [],
    };

    // Add risks and recommendations
    if (currentGitState.status.length > 0) {
      plan.risks.push('Uncommitted changes will be lost');
      plan.recommendations.push(
        'Commit or stash current changes before rollback'
      );
    }

    const commitsBehind = this.getCommitsBehind(
      currentGitState.commit,
      metadata.git.commit
    );
    if (commitsBehind > 0) {
      plan.risks.push(`Rolling back ${commitsBehind} commits`);
      plan.recommendations.push('Review changes that will be lost');
    }

    return plan;
  }

  getCommitsBehind(currentCommit, targetCommit) {
    try {
      const result = execSync(
        `git rev-list --count ${targetCommit}..${currentCommit}`,
        { encoding: 'utf8' }
      );
      return parseInt(result.trim());
    } catch (error) {
      return 0;
    }
  }

  async testRollbackProcedure() {
    console.log('🧪 Testing rollback procedure...');

    try {
      // Create test backup
      const testBackup = await this.createBackup('test');

      // Make a small test change
      const testFile = 'test-rollback.tmp';
      fs.writeFileSync(testFile, 'test rollback content');

      // Commit test change
      execSync('git add test-rollback.tmp', { stdio: 'pipe' });
      execSync('git commit -m "Test rollback commit"', { stdio: 'pipe' });

      // Rollback to test backup
      await this.rollbackToBackup(testBackup.id);

      // Verify test file is gone
      if (fs.existsSync(testFile)) {
        throw new Error('Test file still exists after rollback');
      }

      console.log('✅ Rollback procedure test passed');
      return true;
    } catch (error) {
      console.error('❌ Rollback procedure test failed:', error.message);
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const manager = new BackupRollbackManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'backup':
        await manager.createBackup(arg || 'manual');
        break;

      case 'list':
        const backups = await manager.listBackups();
        console.log('\n📋 Available Backups:');
        console.log('='.repeat(60));
        for (const backup of backups) {
          console.log(`ID: ${backup.id}`);
          console.log(`Date: ${new Date(backup.timestamp).toLocaleString()}`);
          console.log(`Type: ${backup.type}`);
          console.log(
            `Commit: ${backup.git.shortCommit} - ${backup.git.message}`
          );
          console.log('-'.repeat(40));
        }
        break;

      case 'rollback':
        if (!arg) {
          console.error('❌ Please specify backup ID');
          process.exit(1);
        }
        await manager.rollbackToBackup(arg);
        break;

      case 'emergency':
        await manager.emergencyRollback();
        break;

      case 'plan':
        if (!arg) {
          console.error('❌ Please specify backup ID');
          process.exit(1);
        }
        const plan = await manager.generateRollbackPlan(arg);
        console.log('\n📋 Rollback Plan:');
        console.log('='.repeat(60));
        console.log(JSON.stringify(plan, null, 2));
        break;

      case 'test':
        await manager.testRollbackProcedure();
        break;

      default:
        console.log(`
🔄 Backup and Rollback Manager

Usage:
  node backup-rollback-procedures.js <command> [options]

Commands:
  backup [type]     Create a backup (type: manual, auto, pre-deploy)
  list             List all available backups
  rollback <id>    Rollback to specific backup
  emergency        Emergency rollback to last known good state
  plan <id>        Generate rollback plan for backup
  test             Test rollback procedure

Examples:
  node backup-rollback-procedures.js backup manual
  node backup-rollback-procedures.js list
  node backup-rollback-procedures.js rollback backup-2024-01-01T12-00-00-000Z
  node backup-rollback-procedures.js emergency
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

module.exports = BackupRollbackManager;
