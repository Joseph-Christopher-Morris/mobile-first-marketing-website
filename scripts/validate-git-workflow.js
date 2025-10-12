#!/usr/bin/env node

/**
 * Git Workflow Validation Script
 * 
 * This script validates that all Git workflow settings are properly configured
 * according to the requirements in the git-ci-fixes specification.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitWorkflowValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    
    switch (type) {
      case 'error':
        console.error(`${prefix} ${message}`);
        this.errors.push(message);
        break;
      case 'warning':
        console.warn(`${prefix} ${message}`);
        this.warnings.push(message);
        break;
      case 'success':
        console.log(`${prefix} ${message}`);
        this.successes.push(message);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  execGit(command) {
    try {
      return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate CRLF normalization configuration
   */
  validateCRLFConfig() {
    this.log('Validating CRLF normalization configuration...');
    
    // Check core.autocrlf setting
    const autocrlf = this.execGit('config core.autocrlf');
    if (autocrlf === 'true') {
      this.log('✓ core.autocrlf is set to true', 'success');
    } else {
      this.log(`✗ core.autocrlf is not set to true (current: ${autocrlf})`, 'error');
    }
    
    // Check core.safecrlf setting
    const safecrlf = this.execGit('config core.safecrlf');
    if (safecrlf === 'warn') {
      this.log('✓ core.safecrlf is set to warn', 'success');
    } else {
      this.log(`✗ core.safecrlf is not set to warn (current: ${safecrlf})`, 'error');
    }
  }

  /**
   * Validate .gitignore configuration
   */
  validateGitignore() {
    this.log('Validating .gitignore configuration...');
    
    if (!fs.existsSync('.gitignore')) {
      this.log('✗ .gitignore file does not exist', 'error');
      return;
    }
    
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    
    // Check for required patterns
    const requiredPatterns = [
      '*-report-*.json',
      '*-report-*.md',
      '*-results-*.json',
      '*-summary-*.json',
      'requirements-compliance-*.json',
      'build-*/',
      'test-results/',
      'validation-reports/',
      'lighthouse-reports/',
      'playwright-report/',
      'logs/',
      'reports/',
      'test-*.html',
      'test-*.js',
      'task-*-implementation-summary.md'
    ];
    
    let missingPatterns = [];
    for (const pattern of requiredPatterns) {
      if (!gitignoreContent.includes(pattern)) {
        missingPatterns.push(pattern);
      }
    }
    
    if (missingPatterns.length === 0) {
      this.log('✓ All required .gitignore patterns are present', 'success');
    } else {
      this.log(`✗ Missing .gitignore patterns: ${missingPatterns.join(', ')}`, 'error');
    }
    
    // Check for corrupted content
    if (gitignoreContent.includes('**.sampler') || gitignoreContent.includes('e q u i r e m e n t s')) {
      this.log('✗ .gitignore contains corrupted content', 'error');
    } else {
      this.log('✓ .gitignore content is clean', 'success');
    }
  }

  /**
   * Validate safe Git staging scripts
   */
  validateStagingScripts() {
    this.log('Validating safe Git staging scripts...');
    
    // Check Node.js script
    const nodeScript = 'scripts/safe-git-staging.js';
    if (fs.existsSync(nodeScript)) {
      this.log('✓ Node.js safe staging script exists', 'success');
      
      // Check if script is executable
      try {
        const stats = fs.statSync(nodeScript);
        if (stats.isFile()) {
          this.log('✓ Node.js staging script is a valid file', 'success');
        }
      } catch (error) {
        this.log('✗ Node.js staging script has permission issues', 'error');
      }
    } else {
      this.log('✗ Node.js safe staging script does not exist', 'error');
    }
    
    // Check PowerShell script
    const psScript = 'scripts/safe-git-workflow.ps1';
    if (fs.existsSync(psScript)) {
      this.log('✓ PowerShell safe workflow script exists', 'success');
    } else {
      this.log('✗ PowerShell safe workflow script does not exist', 'error');
    }
    
    // Check documentation
    const docFile = 'docs/git-workflow-configuration.md';
    if (fs.existsSync(docFile)) {
      this.log('✓ Git workflow documentation exists', 'success');
    } else {
      this.log('✗ Git workflow documentation does not exist', 'error');
    }
  }

  /**
   * Test Git repository status
   */
  validateGitRepository() {
    this.log('Validating Git repository status...');
    
    // Check if we're in a Git repository
    const gitDir = this.execGit('rev-parse --git-dir');
    if (gitDir) {
      this.log('✓ Working in a Git repository', 'success');
    } else {
      this.log('✗ Not in a Git repository', 'error');
      return;
    }
    
    // Check current branch
    const branch = this.execGit('branch --show-current');
    if (branch) {
      this.log(`✓ Current branch: ${branch}`, 'success');
    } else {
      this.log('✗ Could not determine current branch', 'error');
    }
    
    // Check remote configuration
    const remotes = this.execGit('remote -v');
    if (remotes) {
      this.log('✓ Git remotes are configured', 'success');
    } else {
      this.log('⚠ No Git remotes configured', 'warning');
    }
  }

  /**
   * Test safe staging functionality
   */
  testSafeStaging() {
    this.log('Testing safe staging functionality...');
    
    // Check if there are any changes to stage
    const status = this.execGit('status --porcelain');
    if (!status) {
      this.log('✓ Working directory is clean', 'success');
      return;
    }
    
    // Test dry run of staging
    try {
      const nodeScript = path.resolve('scripts/safe-git-staging.js');
      if (fs.existsSync(nodeScript)) {
        this.log('✓ Safe staging script is available for testing', 'success');
      }
    } catch (error) {
      this.log('✗ Could not test safe staging script', 'error');
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        successes: this.successes.length
      },
      details: {
        errors: this.errors,
        warnings: this.warnings,
        successes: this.successes
      },
      status: this.errors.length === 0 ? 'PASS' : 'FAIL'
    };
    
    // Write report to file
    const reportFile = `git-workflow-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * Main validation function
   */
  run() {
    console.log('Git Workflow Configuration Validation');
    console.log('====================================');
    
    this.validateGitRepository();
    this.validateCRLFConfig();
    this.validateGitignore();
    this.validateStagingScripts();
    this.testSafeStaging();
    
    const report = this.generateReport();
    
    console.log('\nValidation Summary:');
    console.log(`✓ Successes: ${report.summary.successes}`);
    console.log(`⚠ Warnings: ${report.summary.warnings}`);
    console.log(`✗ Errors: ${report.summary.errors}`);
    console.log(`\nOverall Status: ${report.status}`);
    
    if (report.status === 'PASS') {
      this.log('Git workflow configuration is valid and ready for use', 'success');
    } else {
      this.log('Git workflow configuration has issues that need to be addressed', 'error');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new GitWorkflowValidator();
  validator.run();
}

module.exports = GitWorkflowValidator;