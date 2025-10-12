#!/usr/bin/env node

/**
 * Safe Git Staging Script for Windows Environment
 * 
 * This script implements safe Git staging practices to avoid common issues
 * on Windows systems, including CRLF handling and proper file staging.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SafeGitStaging {
  constructor() {
    this.verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  }

  log(message) {
    if (this.verbose) {
      console.log(`[SafeGit] ${message}`);
    }
  }

  error(message) {
    console.error(`[SafeGit ERROR] ${message}`);
  }

  success(message) {
    console.log(`[SafeGit SUCCESS] ${message}`);
  }

  /**
   * Execute git command safely with proper error handling
   */
  execGit(command, options = {}) {
    try {
      const result = execSync(`git ${command}`, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return result;
    } catch (error) {
      if (!options.allowFailure) {
        this.error(`Git command failed: git ${command}`);
        this.error(error.message);
        process.exit(1);
      }
      return null;
    }
  }

  /**
   * Check if we're in a git repository
   */
  checkGitRepo() {
    this.log('Checking if we are in a Git repository...');
    const result = this.execGit('rev-parse --git-dir', { silent: true, allowFailure: true });
    if (!result) {
      this.error('Not in a Git repository');
      process.exit(1);
    }
    this.log('Git repository confirmed');
  }

  /**
   * Configure Git settings for Windows environment
   */
  configureGitSettings() {
    this.log('Configuring Git settings for Windows environment...');
    
    // Set CRLF handling
    this.execGit('config core.autocrlf true');
    this.log('Set core.autocrlf to true');
    
    // Set safe directory (if needed)
    try {
      const repoPath = process.cwd();
      this.execGit(`config --global --add safe.directory "${repoPath}"`, { allowFailure: true });
      this.log('Added current directory to safe.directory');
    } catch (error) {
      this.log('Safe directory configuration skipped (may already be set)');
    }
    
    // Configure line ending normalization
    this.execGit('config core.safecrlf warn');
    this.log('Set core.safecrlf to warn');
  }

  /**
   * Check Git status and identify changes
   */
  checkStatus() {
    this.log('Checking Git status...');
    const status = this.execGit('status --porcelain', { silent: true });
    
    if (!status || status.trim() === '') {
      this.success('Working directory is clean - no changes to stage');
      return false;
    }
    
    const lines = status.trim().split('\n');
    this.log(`Found ${lines.length} changed files`);
    
    // Categorize changes
    const changes = {
      modified: [],
      added: [],
      deleted: [],
      renamed: [],
      untracked: []
    };
    
    lines.forEach(line => {
      const status = line.substring(0, 2);
      const file = line.substring(3);
      
      if (status.includes('M')) changes.modified.push(file);
      if (status.includes('A')) changes.added.push(file);
      if (status.includes('D')) changes.deleted.push(file);
      if (status.includes('R')) changes.renamed.push(file);
      if (status.includes('?')) changes.untracked.push(file);
    });
    
    if (this.verbose) {
      Object.entries(changes).forEach(([type, files]) => {
        if (files.length > 0) {
          this.log(`${type}: ${files.length} files`);
        }
      });
    }
    
    return true;
  }

  /**
   * Safely stage all changes
   */
  stageChanges() {
    this.log('Staging changes safely...');
    
    // Use git add -A to stage all changes including deletions
    this.execGit('add -A');
    this.success('All changes staged successfully');
    
    // Verify staging
    const staged = this.execGit('diff --cached --name-only', { silent: true });
    if (staged && staged.trim()) {
      const stagedFiles = staged.trim().split('\n');
      this.log(`Staged ${stagedFiles.length} files`);
    }
  }

  /**
   * Check for potential issues before committing
   */
  preCommitChecks() {
    this.log('Running pre-commit checks...');
    
    // Check for large files
    const largeFiles = this.execGit('diff --cached --name-only', { silent: true });
    if (largeFiles) {
      const files = largeFiles.trim().split('\n').filter(f => f);
      for (const file of files) {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          if (stats.size > 10 * 1024 * 1024) { // 10MB
            this.error(`Large file detected: ${file} (${Math.round(stats.size / 1024 / 1024)}MB)`);
            this.error('Consider using Git LFS for large files');
          }
        }
      }
    }
    
    // Check for potential secrets or sensitive files
    const sensitivePatterns = [
      /\.env$/,
      /\.key$/,
      /\.pem$/,
      /password/i,
      /secret/i,
      /token/i
    ];
    
    if (largeFiles) {
      const files = largeFiles.trim().split('\n').filter(f => f);
      for (const file of files) {
        if (sensitivePatterns.some(pattern => pattern.test(file))) {
          this.error(`Potentially sensitive file: ${file}`);
          this.error('Please verify this file should be committed');
        }
      }
    }
    
    this.log('Pre-commit checks completed');
  }

  /**
   * Main execution function
   */
  run() {
    console.log('Safe Git Staging for Windows Environment');
    console.log('=====================================');
    
    this.checkGitRepo();
    this.configureGitSettings();
    
    const hasChanges = this.checkStatus();
    if (!hasChanges) {
      return;
    }
    
    this.stageChanges();
    this.preCommitChecks();
    
    this.success('Git staging completed successfully');
    console.log('\nNext steps:');
    console.log('1. Review staged changes: git diff --cached');
    console.log('2. Commit changes: git commit -m "Your commit message"');
    console.log('3. Push changes: git push');
  }
}

// Run the script if called directly
if (require.main === module) {
  const stager = new SafeGitStaging();
  stager.run();
}

module.exports = SafeGitStaging;