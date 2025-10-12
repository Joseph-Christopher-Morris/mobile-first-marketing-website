#!/usr/bin/env node

/**
 * CI Validation Test Runner
 * 
 * Simple runner for executing CI validation tests without external dependencies.
 * This script can be used to validate CI configuration and Git workflow setup.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SimpleCIValidationRunner {
  constructor() {
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      warnings: [],
      startTime: Date.now()
    };
  }

  /**
   * Run all CI validation tests
   */
  runTests() {
    console.log('🚀 Running CI Validation Tests');
    console.log('=' .repeat(40));

    try {
      this.validateWorkflowFile();
      this.validatePackageConfiguration();
      this.validateGitConfiguration();
      this.validateNodeVersion();
      this.validateBuildProcess();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ CI validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate GitHub Actions workflow file
   */
  validateWorkflowFile() {
    console.log('\n📋 Validating GitHub Actions Workflow...');
    
    const workflowPath = '.github/workflows/quality-check.yml';
    
    this.test('Workflow file exists', () => {
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow file not found: ${workflowPath}`);
      }
    });

    this.test('Workflow contains required elements', () => {
      const content = fs.readFileSync(workflowPath, 'utf8');
      
      const requiredElements = [
        'name:',
        'on:',
        'jobs:',
        'quality-check:',
        'runs-on: ubuntu-latest',
        'actions/checkout@',
        'actions/setup-node@',
        '22.19.0',
        'npm ci',
        'npm run build'
      ];
      
      for (const element of requiredElements) {
        if (!content.includes(element)) {
          throw new Error(`Required workflow element missing: ${element}`);
        }
      }
    });

    this.test('Workflow has proper Node.js version', () => {
      const content = fs.readFileSync(workflowPath, 'utf8');
      
      if (!content.includes('22.19.0')) {
        throw new Error('Workflow should specify Node.js version 22.19.0');
      }
    });

    this.test('Workflow has npm cache configuration', () => {
      const content = fs.readFileSync(workflowPath, 'utf8');
      
      if (!content.includes("cache: 'npm'") && !content.includes('cache: npm')) {
        throw new Error('Workflow should have npm cache configured');
      }
    });

    this.test('Workflow has environment variables', () => {
      const content = fs.readFileSync(workflowPath, 'utf8');
      
      if (!content.includes('CI: true') && !content.includes('CI: "true"')) {
        throw new Error('Workflow should set CI environment variable');
      }
      
      if (!content.includes('NEXT_TELEMETRY_DISABLED')) {
        throw new Error('Workflow should disable Next.js telemetry');
      }
    });
  }

  /**
   * Validate package.json configuration
   */
  validatePackageConfiguration() {
    console.log('\n📦 Validating Package Configuration...');
    
    this.test('package.json exists', () => {
      if (!fs.existsSync('package.json')) {
        throw new Error('package.json not found');
      }
    });

    let packageJson;
    this.test('package.json is valid JSON', () => {
      const content = fs.readFileSync('package.json', 'utf8');
      packageJson = JSON.parse(content);
    });

    this.test('Engines field specifies Node.js >=22.19.0', () => {
      if (!packageJson.engines || !packageJson.engines.node) {
        throw new Error('package.json should specify Node.js version in engines field');
      }
      
      const nodeVersion = packageJson.engines.node;
      if (!nodeVersion.includes('22.19.0')) {
        throw new Error(`Node.js version should be >=22.19.0, got: ${nodeVersion}`);
      }
    });

    this.test('Required scripts are present', () => {
      const requiredScripts = ['build', 'dev'];
      
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          throw new Error(`Required script missing: ${script}`);
        }
      }
    });

    this.test('package-lock.json exists', () => {
      if (!fs.existsSync('package-lock.json')) {
        throw new Error('package-lock.json not found - run npm install to generate');
      }
    });
  }

  /**
   * Validate Git configuration
   */
  validateGitConfiguration() {
    console.log('\n🔄 Validating Git Configuration...');
    
    this.test('Git repository is initialized', () => {
      try {
        this.execCommand('git status');
      } catch (error) {
        throw new Error('Not in a Git repository');
      }
    });

    this.test('Git core.autocrlf is configured', () => {
      try {
        const autocrlf = this.execCommand('git config core.autocrlf').trim();
        if (autocrlf !== 'true') {
          this.addWarning(`Git core.autocrlf is ${autocrlf}, should be 'true' for Windows compatibility`);
        }
      } catch (error) {
        this.addWarning('Git core.autocrlf not configured - should be set to true for Windows');
      }
    });

    this.test('.gitignore file exists and has required patterns', () => {
      if (!fs.existsSync('.gitignore')) {
        throw new Error('.gitignore file not found');
      }
      
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      const requiredPatterns = [
        { pattern: 'node_modules', description: 'Node.js dependencies' },
        { pattern: '.next', description: 'Next.js build output' },
        { patterns: ['.env.local', '.env*.local'], description: 'Local environment files' }
      ];
      
      for (const item of requiredPatterns) {
        if (item.patterns) {
          // Check if any of the patterns match
          const hasPattern = item.patterns.some(p => gitignoreContent.includes(p));
          if (!hasPattern) {
            throw new Error(`Required .gitignore pattern missing: ${item.patterns.join(' or ')} (${item.description})`);
          }
        } else {
          if (!gitignoreContent.includes(item.pattern)) {
            throw new Error(`Required .gitignore pattern missing: ${item.pattern} (${item.description})`);
          }
        }
      }
    });
  }

  /**
   * Validate Node.js version
   */
  validateNodeVersion() {
    console.log('\n🔍 Validating Node.js Version...');
    
    this.test('Node.js version meets requirements', () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 22) {
        throw new Error(`Node.js version should be >=22, current: ${nodeVersion}`);
      }
      
      console.log(`  ✅ Node.js version: ${nodeVersion}`);
    });

    this.test('npm version is compatible', () => {
      try {
        const npmVersion = this.execCommand('npm --version').trim();
        const majorVersion = parseInt(npmVersion.split('.')[0]);
        
        if (majorVersion < 10) {
          this.addWarning(`npm version should be >=10, current: ${npmVersion}`);
        }
        
        console.log(`  ✅ npm version: ${npmVersion}`);
      } catch (error) {
        throw new Error('npm is not available');
      }
    });
  }

  /**
   * Validate build process
   */
  validateBuildProcess() {
    console.log('\n🏗️  Validating Build Process...');
    
    this.test('Dependencies can be installed cleanly', () => {
      try {
        // Test npm ci dry run
        this.execCommand('npm ci --dry-run', { timeout: 30000 });
      } catch (error) {
        if (error.message.includes('package-lock.json was created with a different version')) {
          throw new Error('Lockfile was created with different npm version - regenerate with current npm version');
        }
        throw new Error(`Dependency installation check failed: ${error.message}`);
      }
    });

    this.test('Build command is available', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (!packageJson.scripts || !packageJson.scripts.build) {
        throw new Error('Build script not found in package.json');
      }
      
      const buildScript = packageJson.scripts.build;
      if (!buildScript.includes('next build')) {
        this.addWarning('Build script should use "next build" for Next.js projects');
      }
    });

    // Only test actual build if explicitly requested
    if (process.argv.includes('--test-build')) {
      this.test('Build process works', () => {
        try {
          console.log('  Running build test...');
          this.execCommand('npm run build', { 
            timeout: 300000,
            env: {
              ...process.env,
              CI: 'true',
              NEXT_TELEMETRY_DISABLED: '1'
            }
          });
          
          // Check if build output exists
          if (!fs.existsSync('out') && !fs.existsSync('.next')) {
            throw new Error('Build output directory not found');
          }
          
        } catch (error) {
          throw new Error(`Build process failed: ${error.message}`);
        }
      });
    } else {
      console.log('  ⏭️  Build test skipped (use --test-build to run)');
    }
  }

  /**
   * Execute command with error handling
   */
  execCommand(command, options = {}) {
    try {
      return execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: options.timeout || 10000,
        env: options.env || process.env,
        ...options
      });
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }

  /**
   * Run individual test
   */
  test(testName, testFunction) {
    try {
      testFunction();
      console.log(`  ✅ ${testName}`);
      this.results.tests.push({ name: testName, status: 'passed' });
      this.results.passed++;
    } catch (error) {
      console.log(`  ❌ ${testName}: ${error.message}`);
      this.results.tests.push({ name: testName, status: 'failed', error: error.message });
      this.results.failed++;
    }
  }

  /**
   * Add warning
   */
  addWarning(message) {
    console.log(`  ⚠️  Warning: ${message}`);
    this.results.warnings.push(message);
  }

  /**
   * Generate test report
   */
  generateReport() {
    const duration = Date.now() - this.results.startTime;
    
    console.log('\n' + '='.repeat(40));
    console.log('📊 CI Validation Results');
    console.log('='.repeat(40));
    
    console.log(`\nTests: ${this.results.passed + this.results.failed}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Warnings: ${this.results.warnings.length}`);
    console.log(`Duration: ${Math.round(duration/1000)}s`);

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }

    // Save report
    const reportPath = `ci-validation-simple-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Report saved: ${reportPath}`);

    if (this.results.failed > 0) {
      console.log('\n❌ CI validation failed. Please fix the issues above.');
      process.exit(1);
    } else {
      console.log('\n✅ CI validation passed!');
      console.log('🎉 Your CI configuration is ready for use.');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new SimpleCIValidationRunner();
  runner.runTests();
}

module.exports = SimpleCIValidationRunner;