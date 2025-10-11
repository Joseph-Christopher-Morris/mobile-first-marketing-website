#!/usr/bin/env node

/**
 * Test Deployment Readiness Script
 *
 * This script simulates and validates deployment readiness by running
 * all the same checks that would occur during an AWS Amplify deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentReadinessTest {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.buildOutput = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;

    switch (type) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        this.errors.push(message);
        break;
      case 'warning':
        console.warn(`${prefix} ⚠️  ${message}`);
        this.warnings.push(message);
        break;
      case 'success':
        console.log(`${prefix} ✅ ${message}`);
        this.success.push(message);
        break;
      default:
        console.log(`${prefix} ℹ️  ${message}`);
    }
  }

  async runCommand(command, description, options = {}) {
    this.log(`Running: ${description}...`);

    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options,
      });

      this.log(`✅ ${description} completed successfully`, 'success');
      return result;
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testPreBuildPhase() {
    this.log('\n🔄 TESTING PRE-BUILD PHASE...\n');

    try {
      // Simulate npm ci (use npm install for testing)
      await this.runCommand('npm install', 'Install dependencies');

      // Run build optimization
      await this.runCommand('npm run build:optimize', 'Build optimization');

      // Validate environment variables
      await this.runCommand('npm run env:validate', 'Environment validation');

      // Validate content structure
      await this.runCommand(
        'npm run content:validate-structure',
        'Content structure validation'
      );

      // Validate content
      await this.runCommand('npm run content:validate', 'Content validation');

      // Type check
      await this.runCommand('npm run type-check', 'TypeScript type checking');

      this.log(
        '✅ Pre-build phase simulation completed successfully',
        'success'
      );
      return true;
    } catch (error) {
      this.log('❌ Pre-build phase simulation failed', 'error');
      return false;
    }
  }

  async testBuildPhase() {
    this.log('\n🔄 TESTING BUILD PHASE...\n');

    try {
      // Build the application
      await this.runCommand('npm run build', 'Next.js build');

      // Run tests
      await this.runCommand('npm run test -- --run', 'Unit tests');

      this.log('✅ Build phase simulation completed successfully', 'success');
      return true;
    } catch (error) {
      this.log('❌ Build phase simulation failed', 'error');
      return false;
    }
  }

  async testPostBuildPhase() {
    this.log('\n🔄 TESTING POST-BUILD PHASE...\n');

    try {
      // Cache optimization
      await this.runCommand('npm run cache:optimize', 'Cache optimization');

      // Deployment monitoring
      await this.runCommand('npm run deploy:monitor', 'Deployment monitoring');

      this.log(
        '✅ Post-build phase simulation completed successfully',
        'success'
      );
      return true;
    } catch (error) {
      this.log('❌ Post-build phase simulation failed', 'error');
      return false;
    }
  }

  validateBuildOutput() {
    this.log('\n🔄 VALIDATING BUILD OUTPUT...\n');

    const outputDir = path.join(process.cwd(), 'out');

    if (!fs.existsSync(outputDir)) {
      this.log('Build output directory not found', 'error');
      return false;
    }

    try {
      // Check for essential files
      const essentialFiles = ['index.html', '_next/static', 'favicon.ico'];

      for (const file of essentialFiles) {
        const filePath = path.join(outputDir, file);
        if (fs.existsSync(filePath)) {
          this.log(`Found essential file: ${file}`, 'success');
        } else {
          this.log(`Missing essential file: ${file}`, 'error');
        }
      }

      // Check output directory size
      const stats = this.getDirectoryStats(outputDir);
      this.log(
        `Build output contains ${stats.files} files (${this.formatBytes(stats.size)})`,
        'info'
      );

      // Validate HTML files
      this.validateHtmlFiles(outputDir);

      // Validate static assets
      this.validateStaticAssets(outputDir);

      return true;
    } catch (error) {
      this.log(`Error validating build output: ${error.message}`, 'error');
      return false;
    }
  }

  getDirectoryStats(dir) {
    let files = 0;
    let size = 0;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const subStats = this.getDirectoryStats(itemPath);
        files += subStats.files;
        size += subStats.size;
      } else {
        files++;
        size += stat.size;
      }
    }

    return { files, size };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateHtmlFiles(outputDir) {
    const htmlFiles = this.findFiles(outputDir, '.html');

    this.log(`Found ${htmlFiles.length} HTML files`, 'info');

    for (const htmlFile of htmlFiles.slice(0, 5)) {
      // Check first 5 files
      try {
        const content = fs.readFileSync(htmlFile, 'utf8');

        // Basic HTML validation
        if (content.includes('<!DOCTYPE html>')) {
          this.log(
            `✅ ${path.relative(outputDir, htmlFile)} has valid DOCTYPE`,
            'success'
          );
        } else {
          this.log(
            `⚠️  ${path.relative(outputDir, htmlFile)} missing DOCTYPE`,
            'warning'
          );
        }

        // Check for meta tags
        if (content.includes('<meta')) {
          this.log(
            `✅ ${path.relative(outputDir, htmlFile)} has meta tags`,
            'success'
          );
        } else {
          this.log(
            `⚠️  ${path.relative(outputDir, htmlFile)} missing meta tags`,
            'warning'
          );
        }
      } catch (error) {
        this.log(`Error reading ${htmlFile}: ${error.message}`, 'warning');
      }
    }
  }

  validateStaticAssets(outputDir) {
    const staticDir = path.join(outputDir, '_next', 'static');

    if (fs.existsSync(staticDir)) {
      const stats = this.getDirectoryStats(staticDir);
      this.log(
        `Static assets: ${stats.files} files (${this.formatBytes(stats.size)})`,
        'success'
      );
    } else {
      this.log('Static assets directory not found', 'warning');
    }

    // Check for common asset types
    const assetTypes = ['.js', '.css', '.png', '.jpg', '.svg', '.ico'];

    for (const ext of assetTypes) {
      const files = this.findFiles(outputDir, ext);
      if (files.length > 0) {
        this.log(`Found ${files.length} ${ext} files`, 'success');
      }
    }
  }

  findFiles(dir, extension) {
    let files = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          files = files.concat(this.findFiles(itemPath, extension));
        } else if (item.endsWith(extension)) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }

    return files;
  }

  async testSiteGeneration() {
    this.log('\n🔄 TESTING STATIC SITE GENERATION...\n');

    try {
      // Test export command
      await this.runCommand('npm run export', 'Static site export');

      this.log('✅ Static site generation completed successfully', 'success');
      return true;
    } catch (error) {
      this.log('❌ Static site generation failed', 'error');
      return false;
    }
  }

  async runPerformanceTests() {
    this.log('\n🔄 RUNNING PERFORMANCE TESTS...\n');

    try {
      // Run bundle analysis if available
      if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
        );

        if (packageJson.scripts && packageJson.scripts.analyze) {
          this.log(
            'Bundle analyzer available - run "npm run analyze" for detailed analysis',
            'info'
          );
        }
      }

      // Check bundle sizes
      this.checkBundleSizes();

      return true;
    } catch (error) {
      this.log(`Performance test error: ${error.message}`, 'warning');
      return false;
    }
  }

  checkBundleSizes() {
    const outputDir = path.join(process.cwd(), 'out');
    const staticDir = path.join(outputDir, '_next', 'static');

    if (!fs.existsSync(staticDir)) {
      this.log(
        'Static directory not found for bundle size analysis',
        'warning'
      );
      return;
    }

    // Check JavaScript bundle sizes
    const jsFiles = this.findFiles(staticDir, '.js');
    let totalJsSize = 0;

    for (const jsFile of jsFiles) {
      const stat = fs.statSync(jsFile);
      totalJsSize += stat.size;
    }

    // Check CSS bundle sizes
    const cssFiles = this.findFiles(staticDir, '.css');
    let totalCssSize = 0;

    for (const cssFile of cssFiles) {
      const stat = fs.statSync(cssFile);
      totalCssSize += stat.size;
    }

    this.log(`Total JavaScript: ${this.formatBytes(totalJsSize)}`, 'info');
    this.log(`Total CSS: ${this.formatBytes(totalCssSize)}`, 'info');

    // Warn about large bundles
    if (totalJsSize > 1024 * 1024) {
      // 1MB
      this.log(
        'JavaScript bundle is quite large - consider code splitting',
        'warning'
      );
    }

    if (totalCssSize > 512 * 1024) {
      // 512KB
      this.log('CSS bundle is quite large - consider optimization', 'warning');
    }
  }

  generateDeploymentReport() {
    this.log('\n=== DEPLOYMENT READINESS REPORT ===');

    if (this.success.length > 0) {
      this.log(`\n✅ SUCCESSFUL TESTS (${this.success.length}):`);
      this.success.forEach(item => console.log(`   • ${item}`));
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach(item => console.log(`   • ${item}`));
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach(item => console.log(`   • ${item}`));
    }

    const isReady = this.errors.length === 0;

    this.log(`\n=== DEPLOYMENT ${isReady ? 'READY' : 'NOT READY'} ===`);

    if (isReady) {
      this.log(
        '🚀 Your application is ready for AWS Amplify deployment!',
        'success'
      );
      this.log('\nNext steps for actual deployment:', 'info');
      this.log('1. Push your code to GitHub repository', 'info');
      this.log('2. Connect repository to AWS Amplify', 'info');
      this.log('3. Configure environment variables in Amplify console', 'info');
      this.log('4. Trigger deployment and monitor build logs', 'info');
      this.log('5. Test deployed site functionality', 'info');
    } else {
      this.log('❌ Please fix the errors above before deploying', 'error');
    }

    return isReady;
  }

  async run() {
    this.log('🚀 Starting deployment readiness test...\n');

    const phases = [
      { name: 'Pre-build Phase', test: () => this.testPreBuildPhase() },
      { name: 'Build Phase', test: () => this.testBuildPhase() },
      { name: 'Post-build Phase', test: () => this.testPostBuildPhase() },
      {
        name: 'Build Output Validation',
        test: () => this.validateBuildOutput(),
      },
      { name: 'Static Site Generation', test: () => this.testSiteGeneration() },
      { name: 'Performance Tests', test: () => this.runPerformanceTests() },
    ];

    for (const phase of phases) {
      try {
        this.log(`\n📋 Starting ${phase.name}...`);
        const success = await phase.test();

        if (success) {
          this.log(`✅ ${phase.name} completed successfully\n`);
        } else {
          this.log(`❌ ${phase.name} failed\n`);
        }
      } catch (error) {
        this.log(
          `❌ ${phase.name} failed with error: ${error.message}`,
          'error'
        );
      }
    }

    return this.generateDeploymentReport();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const tester = new DeploymentReadinessTest();
  tester
    .run()
    .then(isReady => {
      process.exit(isReady ? 0 : 1);
    })
    .catch(error => {
      console.error('Deployment readiness test failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentReadinessTest;
