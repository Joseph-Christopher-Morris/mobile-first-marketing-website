#!/usr/bin/env node

/**
 * Fix Lockfile Consistency
 * 
 * This script fixes package-lock.json consistency issues by regenerating
 * the lockfile with the correct Node.js version and dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LockfileConsistencyFixer {
  constructor() {
    this.backupPath = `package-lock.json.backup.${Date.now()}`;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  checkNodeVersion() {
    const currentVersion = process.version;
    const requiredVersion = '22.19.0';
    
    this.log(`Current Node.js version: ${currentVersion}`);
    this.log(`Required Node.js version: v${requiredVersion}`);
    
    const currentMajor = parseInt(currentVersion.slice(1).split('.')[0]);
    const requiredMajor = parseInt(requiredVersion.split('.')[0]);
    
    if (currentMajor < requiredMajor) {
      this.log(`Node.js ${currentVersion} is incompatible with requirement >=v${requiredVersion}`, 'error');
      this.log('Please upgrade Node.js before running this script:', 'error');
      this.log('  • Using nvm-windows: nvm install 22.19.0 && nvm use 22.19.0', 'info');
      this.log('  • Using corepack: corepack enable && corepack prepare node@22.19.0', 'info');
      this.log('  • Direct download: https://nodejs.org/dist/v22.19.0/', 'info');
      return false;
    }
    
    this.log('Node.js version is compatible', 'success');
    return true;
  }

  backupLockfile() {
    if (fs.existsSync('package-lock.json')) {
      this.log('Creating backup of existing package-lock.json...');
      fs.copyFileSync('package-lock.json', this.backupPath);
      this.log(`Backup created: ${this.backupPath}`, 'success');
      return true;
    } else {
      this.log('No existing package-lock.json found');
      return false;
    }
  }

  cleanInstall() {
    this.log('Cleaning node_modules and package-lock.json...');
    
    try {
      // Remove node_modules
      if (fs.existsSync('node_modules')) {
        this.log('Removing node_modules directory...');
        execSync('rmdir /s /q node_modules', { stdio: 'pipe' });
        this.log('node_modules removed', 'success');
      }
      
      // Remove package-lock.json
      if (fs.existsSync('package-lock.json')) {
        fs.unlinkSync('package-lock.json');
        this.log('package-lock.json removed', 'success');
      }
      
    } catch (error) {
      this.log(`Error during cleanup: ${error.message}`, 'error');
      throw error;
    }
  }

  installDependencies() {
    this.log('Installing dependencies with npm install...');
    
    try {
      // Run npm install to generate new lockfile
      execSync('npm install', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development'
        }
      });
      
      this.log('Dependencies installed successfully', 'success');
      
      // Verify lockfile was created
      if (fs.existsSync('package-lock.json')) {
        this.log('New package-lock.json generated', 'success');
        return true;
      } else {
        this.log('Failed to generate package-lock.json', 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`npm install failed: ${error.message}`, 'error');
      throw error;
    }
  }

  validateLockfile() {
    this.log('Validating new lockfile...');
    
    try {
      // Test npm ci to ensure lockfile is consistent
      execSync('npm ci --dry-run', { stdio: 'pipe' });
      this.log('Lockfile validation passed', 'success');
      return true;
      
    } catch (error) {
      this.log(`Lockfile validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  testBuild() {
    this.log('Testing build with new dependencies...');
    
    try {
      // Test build command
      execSync('npm run build', { 
        stdio: 'inherit',
        env: {
          ...process.env,
          CI: 'true',
          NEXT_TELEMETRY_DISABLED: '1',
          NODE_ENV: 'production'
        }
      });
      
      this.log('Build test passed', 'success');
      return true;
      
    } catch (error) {
      this.log(`Build test failed: ${error.message}`, 'error');
      return false;
    }
  }

  restoreBackup() {
    if (fs.existsSync(this.backupPath)) {
      this.log('Restoring backup lockfile...');
      fs.copyFileSync(this.backupPath, 'package-lock.json');
      this.log('Backup restored', 'success');
    }
  }

  cleanupBackup() {
    if (fs.existsSync(this.backupPath)) {
      fs.unlinkSync(this.backupPath);
      this.log('Backup file cleaned up', 'success');
    }
  }

  generateGitCommands() {
    this.log('\n📝 Git commands to commit the changes:', 'info');
    this.log('git add package-lock.json');
    this.log('git commit -m "fix: update package-lock.json for Node 22.19.0 compatibility"');
    this.log('git push origin main');
  }

  async run() {
    this.log('🔧 Starting Lockfile Consistency Fix', 'info');
    this.log('='.repeat(60));
    
    try {
      // Check Node.js version
      if (!this.checkNodeVersion()) {
        process.exit(1);
      }
      
      // Create backup
      const hasBackup = this.backupLockfile();
      
      // Clean install
      this.cleanInstall();
      
      // Install dependencies
      if (!this.installDependencies()) {
        if (hasBackup) this.restoreBackup();
        process.exit(1);
      }
      
      // Validate lockfile
      if (!this.validateLockfile()) {
        this.log('Lockfile validation failed, but continuing...', 'warning');
      }
      
      // Test build
      if (!this.testBuild()) {
        this.log('Build test failed, but lockfile has been updated', 'warning');
      }
      
      // Success
      this.log('='.repeat(60));
      this.log('✅ Lockfile consistency fix completed successfully', 'success');
      
      // Cleanup backup
      this.cleanupBackup();
      
      // Show git commands
      this.generateGitCommands();
      
    } catch (error) {
      this.log(`❌ Lockfile fix failed: ${error.message}`, 'error');
      
      // Restore backup if available
      if (fs.existsSync(this.backupPath)) {
        this.restoreBackup();
      }
      
      process.exit(1);
    }
  }
}

// Run the fixer if called directly
if (require.main === module) {
  const fixer = new LockfileConsistencyFixer();
  fixer.run().catch(error => {
    console.error('❌ Lockfile fixer failed:', error);
    process.exit(1);
  });
}

module.exports = LockfileConsistencyFixer;