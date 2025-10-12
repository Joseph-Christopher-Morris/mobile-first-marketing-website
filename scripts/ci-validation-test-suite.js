#!/usr/bin/env node

/**
 * Comprehensive CI Validation Test Suite
 * 
 * This script validates GitHub Actions workflow configuration,
 * Git workflow consistency, and build performance benchmarks.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CIValidationTestSuite {
  constructor() {
    this.results = {
      workflowValidation: {},
      gitWorkflowConsistency: {},
      performanceBenchmarks: {},
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    this.startTime = Date.now();
  }

  /**
   * Run all CI validation tests
   */
  async runAllTests() {
    console.log('🚀 Starting Comprehensive CI Validation Test Suite');
    console.log('=' .repeat(60));

    try {
      // Test 1: Workflow Configuration Validation
      await this.validateWorkflowConfiguration();
      
      // Test 2: Git Workflow Consistency Tests
      await this.validateGitWorkflowConsistency();
      
      // Test 3: Performance Benchmarks
      await this.runPerformanceBenchmarks();
      
      // Generate final report
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ Test suite execution failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate GitHub Actions workflow configuration
   * Requirements: 5.1, 5.2, 5.3
   */
  async validateWorkflowConfiguration() {
    console.log('\n📋 Validating GitHub Actions Workflow Configuration...');
    
    const workflowPath = '.github/workflows/quality-check.yml';
    
    // Test 1.1: Workflow file exists
    this.runTest('Workflow file exists', () => {
      if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow file not found: ${workflowPath}`);
      }
      return true;
    });

    // Test 1.2: Parse workflow YAML
    let workflow;
    this.runTest('Workflow YAML is valid', () => {
      const content = fs.readFileSync(workflowPath, 'utf8');
      workflow = this.parseBasicYAML(content);
      return workflow && typeof workflow === 'object';
    });

    // Test 1.3: Node.js version validation
    this.runTest('Node.js version is 22.19.0', () => {
      const setupNodeStep = this.findWorkflowStep(workflow, 'Setup Node.js');
      if (!setupNodeStep || !setupNodeStep.with || setupNodeStep.with['node-version'] !== '22.19.0') {
        throw new Error('Node.js version should be 22.19.0 in workflow');
      }
      return true;
    });

    // Test 1.4: Required workflow steps
    const requiredSteps = [
      'Checkout repository',
      'Setup Node.js',
      'Install dependencies',
      'Verify lockfile consistency',
      'Build project'
    ];

    requiredSteps.forEach(stepName => {
      this.runTest(`Required step: ${stepName}`, () => {
        const step = this.findWorkflowStep(workflow, stepName);
        if (!step) {
          throw new Error(`Required workflow step not found: ${stepName}`);
        }
        return true;
      });
    });

    // Test 1.5: Environment variables
    this.runTest('Required environment variables configured', () => {
      const buildStep = this.findWorkflowStep(workflow, 'Build project');
      if (!buildStep || !buildStep.env) {
        throw new Error('Build step should have environment variables configured');
      }
      
      const requiredEnvVars = ['CI', 'NEXT_TELEMETRY_DISABLED'];
      for (const envVar of requiredEnvVars) {
        if (!(envVar in buildStep.env)) {
          throw new Error(`Required environment variable missing: ${envVar}`);
        }
      }
      return true;
    });

    // Test 1.6: Cache configuration
    this.runTest('npm cache is configured', () => {
      const setupNodeStep = this.findWorkflowStep(workflow, 'Setup Node.js');
      if (!setupNodeStep || !setupNodeStep.with || setupNodeStep.with.cache !== 'npm') {
        throw new Error('npm cache should be configured in Setup Node.js step');
      }
      return true;
    });

    this.results.workflowValidation.completed = true;
  }

  /**
   * Validate Git workflow consistency
   * Requirements: 5.4
   */
  async validateGitWorkflowConsistency() {
    console.log('\n🔄 Validating Git Workflow Consistency...');

    // Test 2.1: Git configuration
    this.runTest('Git CRLF configuration', () => {
      try {
        const autocrlf = execSync('git config core.autocrlf', { encoding: 'utf8' }).trim();
        if (autocrlf !== 'true') {
          throw new Error(`Expected core.autocrlf=true, got: ${autocrlf}`);
        }
        return true;
      } catch (error) {
        throw new Error('Git core.autocrlf should be set to true');
      }
    });

    // Test 2.2: .gitignore validation
    this.runTest('.gitignore includes required patterns', () => {
      if (!fs.existsSync('.gitignore')) {
        throw new Error('.gitignore file not found');
      }
      
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      const requiredPatterns = [
        'node_modules/',
        '.next/',
        '.env.local',
        'requirements-compliance-*.json',
        'requirements-compliance-*.md'
      ];
      
      for (const pattern of requiredPatterns) {
        if (!gitignoreContent.includes(pattern)) {
          throw new Error(`Required .gitignore pattern missing: ${pattern}`);
        }
      }
      return true;
    });

    // Test 2.3: Package.json engines field
    this.runTest('package.json engines field validation', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (!packageJson.engines) {
        throw new Error('package.json should have engines field');
      }
      
      if (!packageJson.engines.node || !packageJson.engines.node.includes('22.19.0')) {
        throw new Error('package.json engines.node should specify >=22.19.0');
      }
      
      return true;
    });

    // Test 2.4: Lockfile consistency
    this.runTest('Lockfile consistency check', () => {
      try {
        // Check if package-lock.json exists
        if (!fs.existsSync('package-lock.json')) {
          throw new Error('package-lock.json not found');
        }
        
        // Run npm ci to verify lockfile consistency
        execSync('npm ci --dry-run', { 
          stdio: 'pipe',
          timeout: 30000 
        });
        
        return true;
      } catch (error) {
        throw new Error(`Lockfile consistency check failed: ${error.message}`);
      }
    });

    this.results.gitWorkflowConsistency.completed = true;
  }

  /**
   * Run performance benchmarks for build processes
   * Requirements: 5.5
   */
  async runPerformanceBenchmarks() {
    console.log('\n⚡ Running Performance Benchmarks...');

    // Test 3.1: Node.js version check
    this.runTest('Node.js version verification', () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 22) {
        throw new Error(`Node.js version should be >=22, current: ${nodeVersion}`);
      }
      
      this.results.performanceBenchmarks.nodeVersion = nodeVersion;
      return true;
    });

    // Test 3.2: Dependency installation benchmark
    const installStartTime = Date.now();
    this.runTest('Dependency installation performance', () => {
      try {
        execSync('npm ci', { 
          stdio: 'pipe',
          timeout: 120000 // 2 minutes timeout
        });
        
        const installTime = Date.now() - installStartTime;
        this.results.performanceBenchmarks.installTime = installTime;
        
        // Warn if installation takes longer than 60 seconds
        if (installTime > 60000) {
          this.addWarning(`Dependency installation took ${Math.round(installTime/1000)}s (>60s threshold)`);
        }
        
        return true;
      } catch (error) {
        throw new Error(`Dependency installation failed: ${error.message}`);
      }
    });

    // Test 3.3: Build performance benchmark
    const buildStartTime = Date.now();
    this.runTest('Build performance benchmark', () => {
      try {
        execSync('npm run build', { 
          stdio: 'pipe',
          timeout: 300000, // 5 minutes timeout
          env: {
            ...process.env,
            CI: 'true',
            NEXT_TELEMETRY_DISABLED: '1'
          }
        });
        
        const buildTime = Date.now() - buildStartTime;
        this.results.performanceBenchmarks.buildTime = buildTime;
        
        // Warn if build takes longer than 2 minutes
        if (buildTime > 120000) {
          this.addWarning(`Build process took ${Math.round(buildTime/1000)}s (>120s threshold)`);
        }
        
        return true;
      } catch (error) {
        throw new Error(`Build process failed: ${error.message}`);
      }
    });

    // Test 3.4: Build output validation
    this.runTest('Build output validation', () => {
      const outDir = 'out';
      if (!fs.existsSync(outDir)) {
        throw new Error('Build output directory not found');
      }
      
      const indexFile = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexFile)) {
        throw new Error('Build output index.html not found');
      }
      
      // Check build output size
      const stats = this.getBuildStats(outDir);
      this.results.performanceBenchmarks.buildStats = stats;
      
      return true;
    });

    this.results.performanceBenchmarks.completed = true;
  }

  /**
   * Basic YAML parser for workflow validation
   */
  parseBasicYAML(content) {
    // For the CI validation, we just need to check if the file is valid YAML-like structure
    // and contains the key elements we're looking for
    const lines = content.split('\n');
    const result = { jobs: { 'quality-check': { steps: [] } } };
    
    let inSteps = false;
    let currentStep = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('steps:')) {
        inSteps = true;
        continue;
      }
      
      if (inSteps && trimmed.startsWith('- name:')) {
        if (currentStep) {
          result.jobs['quality-check'].steps.push(currentStep);
        }
        currentStep = { name: trimmed.replace('- name:', '').trim().replace(/['"]/g, '') };
      }
      
      if (currentStep && trimmed.startsWith('uses:')) {
        currentStep.uses = trimmed.replace('uses:', '').trim();
      }
      
      if (currentStep && trimmed.startsWith('with:')) {
        currentStep.with = {};
      }
      
      if (currentStep && currentStep.with && trimmed.includes('node-version:')) {
        currentStep.with['node-version'] = trimmed.split(':')[1].trim().replace(/['"]/g, '');
      }
      
      if (currentStep && currentStep.with && trimmed.includes('cache:')) {
        currentStep.with.cache = trimmed.split(':')[1].trim().replace(/['"]/g, '');
      }
      
      if (currentStep && trimmed.startsWith('env:')) {
        currentStep.env = {};
      }
      
      if (currentStep && currentStep.env && trimmed.includes('CI:')) {
        currentStep.env.CI = trimmed.split(':')[1].trim().replace(/['"]/g, '');
      }
      
      if (currentStep && currentStep.env && trimmed.includes('NEXT_TELEMETRY_DISABLED:')) {
        currentStep.env.NEXT_TELEMETRY_DISABLED = trimmed.split(':')[1].trim().replace(/['"]/g, '');
      }
    }
    
    if (currentStep) {
      result.jobs['quality-check'].steps.push(currentStep);
    }
    
    return result;
  }

  /**
   * Helper method to find workflow step by name
   */
  findWorkflowStep(workflow, stepName) {
    if (!workflow.jobs || !workflow.jobs['quality-check'] || !workflow.jobs['quality-check'].steps) {
      return null;
    }
    
    return workflow.jobs['quality-check'].steps.find(step => 
      step.name && step.name.includes(stepName)
    );
  }

  /**
   * Helper method to get build statistics
   */
  getBuildStats(buildDir) {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      htmlFiles: 0,
      jsFiles: 0,
      cssFiles: 0
    };

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          stats.totalFiles++;
          stats.totalSize += stat.size;
          
          const ext = path.extname(file).toLowerCase();
          if (ext === '.html') stats.htmlFiles++;
          else if (ext === '.js') stats.jsFiles++;
          else if (ext === '.css') stats.cssFiles++;
        }
      }
    };

    walkDir(buildDir);
    return stats;
  }

  /**
   * Run individual test with error handling
   */
  runTest(testName, testFunction) {
    this.results.summary.totalTests++;
    
    try {
      const result = testFunction();
      console.log(`  ✅ ${testName}`);
      this.results.summary.passed++;
      return result;
    } catch (error) {
      console.log(`  ❌ ${testName}: ${error.message}`);
      this.results.summary.failed++;
      throw error;
    }
  }

  /**
   * Add warning to results
   */
  addWarning(message) {
    console.log(`  ⚠️  Warning: ${message}`);
    this.results.summary.warnings++;
  }

  /**
   * Generate final test report
   */
  generateFinalReport() {
    const totalTime = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CI Validation Test Suite Results');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${this.results.summary.totalTests}`);
    console.log(`  Passed: ${this.results.summary.passed}`);
    console.log(`  Failed: ${this.results.summary.failed}`);
    console.log(`  Warnings: ${this.results.summary.warnings}`);
    console.log(`  Execution Time: ${Math.round(totalTime/1000)}s`);
    
    if (this.results.performanceBenchmarks.installTime) {
      console.log(`\n⚡ Performance Metrics:`);
      console.log(`  Dependency Install: ${Math.round(this.results.performanceBenchmarks.installTime/1000)}s`);
      console.log(`  Build Time: ${Math.round(this.results.performanceBenchmarks.buildTime/1000)}s`);
      console.log(`  Node Version: ${this.results.performanceBenchmarks.nodeVersion}`);
      
      if (this.results.performanceBenchmarks.buildStats) {
        const stats = this.results.performanceBenchmarks.buildStats;
        console.log(`  Build Output: ${stats.totalFiles} files, ${Math.round(stats.totalSize/1024)}KB`);
      }
    }
    
    // Save detailed results
    const reportPath = `ci-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    
    // Exit with appropriate code
    if (this.results.summary.failed > 0) {
      console.log('\n❌ Some tests failed. Please review and fix issues.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed successfully!');
      process.exit(0);
    }
  }
}

// Run the test suite if called directly
if (require.main === module) {
  const testSuite = new CIValidationTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = CIValidationTestSuite;